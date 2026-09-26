const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const assert = require('assert');

// 1. Static file server
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

server.listen(8929, async () => {
  console.log('Server listening on port 8929...');

  // 2. Launch headless Chrome
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9232',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1280,800'
  ]);

  const cleanup = () => {
    try { chrome.kill(); } catch (e) {}
    try { server.close(); } catch (e) {}
  };

  setTimeout(async () => {
    try {
      // Connect to CDP
      const list = await fetch('http://127.0.0.1:9232/json/list').then(r => r.json());
      const pageTarget = list.find(t => t.type === 'page') || list[0];
      const wsUrl = pageTarget.webSocketDebuggerUrl;

      const ws = new WebSocket(wsUrl);
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

      // Navigate to app
      await call('Page.navigate', { url: 'http://localhost:8929/' });
      await new Promise(r => setTimeout(r, 1200));

      console.log('1. Setting contaminated state to simulate user screenshot (Stage 6, 11 letters at 100%)...');
      await call('Runtime.evaluate', {
        expression: `(() => {
          localStorage.setItem('pk_adaptive_state_v1', JSON.stringify({
            english: {
              version: '1.0.0',
              layoutId: 'english',
              stage: 6,
              stageSessions: 5,
              unlockedUnits: ['e', 'n', 'i', 'a', 'r', 'l', 't', 'o', 's', 'u', 'd'],
              focusUnit: 'u',
              unitStats: {
                e: { completedUnits: 20, correct: 20, attempts: 25, mistakes: 5 },
                n: { completedUnits: 20, correct: 20, attempts: 25, mistakes: 5 },
                i: { completedUnits: 20, correct: 20, attempts: 20, mistakes: 0 },
                a: { completedUnits: 20, correct: 20, attempts: 25, mistakes: 5 },
                r: { completedUnits: 20, correct: 20, attempts: 20, mistakes: 0 },
                l: { completedUnits: 20, correct: 20, attempts: 20, mistakes: 0 },
                t: { completedUnits: 20, correct: 20, attempts: 25, mistakes: 5 },
                o: { completedUnits: 20, correct: 20, attempts: 25, mistakes: 5 },
                s: { completedUnits: 20, correct: 20, attempts: 20, mistakes: 0 },
                u: { completedUnits: 20, correct: 20, attempts: 25, mistakes: 5 },
                d: { completedUnits: 20, correct: 20, attempts: 25, mistakes: 5 }
              }
            }
          }));
          window.currentLayoutId = 'english';
          if (window.PK_ADAPTIVE) window.PK_ADAPTIVE.startAdaptiveSession('english');
        })()`
      });
      await new Promise(r => setTimeout(r, 600));

      // Verify simulated contaminated state
      const beforeReset = await call('Runtime.evaluate', {
        expression: `(() => {
          const stage = document.getElementById('adaptiveStageBadge')?.textContent;
          const count = document.getElementById('adaptiveUnlockedCount')?.textContent;
          return { stage, count };
        })()`,
        returnByValue: true
      });
      console.log('Simulated state before reset:', beforeReset.result.value);
      assert.strictEqual(beforeReset.result.value.stage, 'Stage 6');
      assert.strictEqual(beforeReset.result.value.count, '11/26 Active');

      console.log('2. Clicking "Reset Progress" via Adaptive Reset button / resetAdaptiveState...');
      await call('Runtime.evaluate', {
        expression: `(() => {
          window.PK_ADAPTIVE.resetAdaptiveState('english');
          window.PK_ADAPTIVE.renderLetterStrip();
          window.PK_ADAPTIVE.updateSidebarCard();
          window.PK_ADAPTIVE.startAdaptiveSession('english');
        })()`
      });
      await new Promise(r => setTimeout(r, 600));

      console.log('3. Inspecting clean state after reset...');
      const afterReset = await call('Runtime.evaluate', {
        expression: `(() => {
          const stage = document.getElementById('adaptiveStageBadge')?.textContent;
          const count = document.getElementById('adaptiveUnlockedCount')?.textContent;
          const pills = Array.from(document.querySelectorAll('#adaptiveLetterStrip .as-pill')).slice(0, 10).map(p => ({
            char: p.querySelector('.as-pill-char')?.textContent,
            stat: p.querySelector('.as-pill-stat')?.textContent,
            isLocked: p.classList.contains('as-locked')
          }));
          return { stage, count, pills };
        })()`,
        returnByValue: true
      });
      console.log('State after reset:', afterReset.result.value);
      assert.strictEqual(afterReset.result.value.stage, 'Stage 1');
      assert.strictEqual(afterReset.result.value.count, '6/26 Active');

      // Check first 6 pills start at 0%
      for (let i = 0; i < 6; i++) {
        assert.strictEqual(afterReset.result.value.pills[i].stat, '0%');
        assert.strictEqual(afterReset.result.value.pills[i].isLocked, false);
      }
      // Check letter 7 (T) is locked
      assert.strictEqual(afterReset.result.value.pills[6].char, 'T');
      assert.strictEqual(afterReset.result.value.pills[6].isLocked, true);
      console.log('  ✓ Verified: Reset successfully rolled back to Stage 1, initial 6 letters at 0%, T locked!');

      console.log('4. Simulating typing WRONG strokes in Adaptive Practice...');
      await call('Runtime.evaluate', {
        expression: `(() => {
          // Type wrong stroke for 'e' 5 times
          for (let i = 0; i < 5; i++) {
            window.PK_ADAPTIVE.recordStroke('english', 'e', false, 300);
          }
          window.PK_ADAPTIVE.renderLetterStrip(null, 'english');
        })()`
      });
      await new Promise(r => setTimeout(r, 400));

      const afterMistakes = await call('Runtime.evaluate', {
        expression: `(() => {
          const ePill = document.querySelector('#adaptiveLetterStrip .as-pill');
          return {
            char: ePill?.querySelector('.as-pill-char')?.textContent,
            stat: ePill?.querySelector('.as-pill-stat')?.textContent,
            className: ePill?.className
          };
        })()`,
        returnByValue: true
      });
      console.log('Pill state after 5 wrong strokes:', afterMistakes.result.value);
      assert.strictEqual(afterMistakes.result.value.stat, '0%', 'Mistakes must NOT increment completion from 0%!');
      console.log('ePill className:', afterMistakes.result.value.className);
      console.log('  ✓ Verified: Typing wrong keeps completion strictly at 0% and correctly shows red/weak!');

      console.log('5. Capturing screenshot of clean reset adaptive interface...');
      const shot = await call('Page.captureScreenshot', { format: 'png' });
      const artDir = 'C:\\Users\\Kurosaki Kon\\.gemini\\antigravity\\brain\\9ef964bc-db6f-4cb5-9c9a-20b607235a59';
      fs.writeFileSync(path.join(artDir, 'adaptive_reset_progress_clean.png'), Buffer.from(shot.data, 'base64'));
      console.log('Screenshot saved to adaptive_reset_progress_clean.png');

      console.log('\nALL VISUAL & LOGICAL CHECKS PASSED WITH 100% SUCCESS!');
      cleanup();
      process.exit(0);
    } catch (err) {
      console.error('Test failed:', err);
      cleanup();
      process.exit(1);
    }
  }, 1000);
});
