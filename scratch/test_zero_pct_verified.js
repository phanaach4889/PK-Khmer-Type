const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const assert = require('assert');

const server = http.createServer((req, res) => {
  let filePath = path.join(__dirname, '..', req.url.split('?')[0]);
  if (req.url === '/' || req.url.startsWith('/?')) filePath = path.join(__dirname, '..', 'index.html');
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath);
    const mime = ext === '.html' ? 'text/html' : ext === '.js' ? 'application/javascript' : ext === '.css' ? 'text/css' : ext === '.svg' ? 'image/svg+xml' : 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  });
});

server.listen(8930, async () => {
  console.log('Server listening on port 8930...');

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9233',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1280,820'
  ]);

  const cleanup = () => {
    try { chrome.kill(); } catch (e) {}
    try { server.close(); } catch (e) {}
  };

  setTimeout(async () => {
    try {
      const list = await fetch('http://127.0.0.1:9233/json/list').then(r => r.json());
      const pageTarget = list.find(t => t.type === 'page') || list[0];
      const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
      await new Promise(r => ws.addEventListener('open', r));

      let msgId = 1;
      const call = (method, params = {}) => new Promise((resolve, reject) => {
        const curId = msgId++;
        const h = (evt) => {
          const d = JSON.parse(evt.data);
          if (d.id === curId) {
            ws.removeEventListener('message', h);
            if (d.error) reject(d.error);
            else resolve(d.result);
          }
        };
        ws.addEventListener('message', h);
        ws.send(JSON.stringify({ id: curId, method, params }));
      });

      await call('Page.enable');
      await call('Runtime.enable');
      await call('DOM.enable');

      await call('Page.navigate', { url: 'http://localhost:8930/' });
      await new Promise(r => setTimeout(r, 1200));

      console.log('1. Starting Adaptive Practice from fresh state (Stage 1)...');
      await call('Runtime.evaluate', {
        expression: `(() => {
          localStorage.clear();
          window.currentLayoutId = 'english';
          window.PK_ADAPTIVE.resetAdaptiveState('english');
          window.PK_ADAPTIVE.startAdaptiveSession('english');
        })()`
      });
      await new Promise(r => setTimeout(r, 600));

      console.log('2. Simulating learner typing wrong letters in Adaptive Practice...');
      await call('Runtime.evaluate', {
        expression: `(() => {
          // Learner makes wrong keystrokes
          window.PK_ADAPTIVE.recordStroke('english', 'e', false, 350);
          window.PK_ADAPTIVE.recordStroke('english', 'n', false, 350);
          window.PK_ADAPTIVE.recordStroke('english', 'i', false, 350);
          window.PK_ADAPTIVE.renderLetterStrip(null, 'english');
        })()`
      });
      await new Promise(r => setTimeout(r, 400));

      const stage1Pills = await call('Runtime.evaluate', {
        expression: `(() => {
          const pills = Array.from(document.querySelectorAll('#adaptiveLetterStrip .as-pill')).slice(0, 7);
          return pills.map(p => ({
            char: p.querySelector('.as-pill-char')?.textContent,
            stat: p.querySelector('.as-pill-stat')?.textContent,
            className: p.className,
            hasDot: !!p.querySelector('.as-pill-dot')
          }));
        })()`,
        returnByValue: true
      });
      console.log('Stage 1 pills after mistakes:', stage1Pills.result.value);

      // Verify all 6 initial letters stay strictly at 0% with uniform styling and no dot
      for (let i = 0; i < 6; i++) {
        const p = stage1Pills.result.value[i];
        assert.strictEqual(p.stat, '0%', `${p.char} must stay at 0% even when typing wrong`);
        assert.ok(p.className.includes('as-zero'), `${p.char} must have as-zero class`);
        assert.ok(p.className.includes('as-active'), `${p.char} must have as-active class`);
        assert.strictEqual(p.hasDot, false, `${p.char} must NOT have a status dot at 0%`);
      }
      assert.strictEqual(stage1Pills.result.value[6].char, 'T');
      assert.ok(stage1Pills.result.value[6].className.includes('as-locked'), 'T must be locked');
      console.log('  ✓ Verified: Stage 1 letters strictly stay at 0% with identical blue color and no dot!');

      console.log('3. Now practicing all 6 initial letters to 100% completion (20/20) and unlocking T (Stage 2)...');
      await call('Runtime.evaluate', {
        expression: `(() => {
          const s = window.PK_ADAPTIVE.loadAdaptiveState('english');
          ['e', 'n', 'i', 'a', 'r', 'l'].forEach(ch => {
            s.unitStats[ch] = {
              attempts: 22,
              correct: 20,
              mistakes: 2,
              completedUnits: 20
            };
          });
          window.PK_ADAPTIVE.saveAdaptiveState('english', s);
          // Unlock T
          window.PK_ADAPTIVE.unlockNextLetter('english');
          window.PK_ADAPTIVE.startAdaptiveSession('english');
        })()`
      });
      await new Promise(r => setTimeout(r, 600));

      const stage2Pills = await call('Runtime.evaluate', {
        expression: `(() => {
          const pills = Array.from(document.querySelectorAll('#adaptiveLetterStrip .as-pill')).slice(0, 8);
          return pills.map(p => ({
            char: p.querySelector('.as-pill-char')?.textContent,
            stat: p.querySelector('.as-pill-stat')?.textContent,
            className: p.className,
            hasDot: !!p.querySelector('.as-pill-dot')
          }));
        })()`,
        returnByValue: true
      });
      console.log('Stage 2 pills (T newly unlocked):', stage2Pills.result.value);

      // Verify E, N, I, A, R, L are 100%
      for (let i = 0; i < 6; i++) {
        assert.strictEqual(stage2Pills.result.value[i].stat, '100%');
      }
      // Verify newly unlocked T starts at 0%, has as-zero, and NO red dot!
      const tPill = stage2Pills.result.value[6];
      assert.strictEqual(tPill.char, 'T');
      assert.strictEqual(tPill.stat, '0%', 'Newly unlocked T MUST start at 0% completion');
      assert.ok(tPill.className.includes('as-zero'), 'Newly unlocked T must have as-zero class');
      assert.ok(tPill.className.includes('as-active'), 'Newly unlocked T must have as-active class');
      assert.strictEqual(tPill.hasDot, false, 'Newly unlocked T must NOT have a red or orange dot');
      console.log('  ✓ Verified: Newly unlocked T starts at 0% with identical active blue color and NO dot!');

      console.log('4. Capturing verified screenshot showing newly unlocked T at 0% with uniform styling...');
      const shot = await call('Page.captureScreenshot', { format: 'png' });
      const artDir = 'C:\\Users\\Kurosaki Kon\\.gemini\\antigravity\\brain\\9ef964bc-db6f-4cb5-9c9a-20b607235a59';
      fs.writeFileSync(path.join(artDir, 'adaptive_zero_pct_verified.png'), Buffer.from(shot.data, 'base64'));
      console.log('Screenshot saved to adaptive_zero_pct_verified.png');

      console.log('\nALL VERIFICATIONS PASSED SUCCESSFULLY!');
      cleanup();
      process.exit(0);
    } catch (e) {
      console.error('Test failed:', e);
      cleanup();
      process.exit(1);
    }
  }, 1000);
});
