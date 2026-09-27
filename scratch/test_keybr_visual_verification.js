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

const PORT = 8935;
server.listen(PORT, async () => {
  console.log(`Server listening on port ${PORT}...`);

  // 2. Launch headless Chrome
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9235',
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
      const list = await fetch('http://127.0.0.1:9235/json/list').then(r => r.json());
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
      await call('Page.navigate', { url: `http://localhost:${PORT}/` });
      await new Promise(r => setTimeout(r, 1200));

      console.log('1. Setting up state with realistic mastery distribution (like user screenshot)...');
      await call('Runtime.evaluate', {
        expression: `(() => {
          localStorage.setItem('pk_adaptive_state_v1', JSON.stringify({
            english: {
              version: '1.0.0',
              layoutId: 'english',
              stage: 1,
              stageSessions: 3,
              unlockedUnits: ['e', 'n', 'i', 'a', 'r', 'l'],
              focusUnit: 'a',
              unitStats: {
                e: { completedUnits: 20, correct: 20, attempts: 20, mistakes: 0 }, // 100% Mastered (Green)
                n: { completedUnits: 15, correct: 18, attempts: 20, mistakes: 2 }, // 75% Advancing (Cyan)
                i: { completedUnits: 13, correct: 15, attempts: 18, mistakes: 3 }, // 65% Advancing (Cyan)
                a: { completedUnits: 9, correct: 12, attempts: 16, mistakes: 4 },  // 45% Learning (Amber) Focus
                r: { completedUnits: 6, correct: 8, attempts: 12, mistakes: 4 },   // 30% Learning (Amber)
                l: { completedUnits: 0, correct: 0, attempts: 0, mistakes: 0 }     // 0% Active (Blue)
              }
            }
          }));
          window.currentLayoutId = 'english';
          if (window.PK_ADAPTIVE) {
            window.PK_ADAPTIVE.startAdaptiveSession('english');
          }
        })()`
      });
      await new Promise(r => setTimeout(r, 600));

      console.log('2. Inspecting rendered Keybr-style letter pills...');
      const pillData = await call('Runtime.evaluate', {
        expression: `(() => {
          const pills = Array.from(document.querySelectorAll('#adaptiveLetterStrip .as-pill')).slice(0, 8).map(p => {
            const char = p.querySelector('.as-pill-char')?.textContent;
            const stat = p.querySelector('.as-pill-stat')?.textContent;
            const barFill = p.querySelector('.as-pill-bar-fill');
            const barWidth = barFill ? barFill.style.width : null;
            const classes = Array.from(p.classList);
            return { char, stat, barWidth, classes };
          });
          return pills;
        })()`,
        returnByValue: true
      });

      console.log('Rendered pills:', JSON.stringify(pillData.result.value, null, 2));

      // Verifications:
      const p = pillData.result.value;
      // E: 100% -> as-mastered, bar width 100%
      assert.strictEqual(p[0].char, 'E');
      assert.strictEqual(p[0].stat, '100%');
      assert.strictEqual(p[0].barWidth, '100%');
      assert.ok(p[0].classes.includes('as-mastered'), 'E should have as-mastered');

      // N: 75% -> as-advancing, bar width 75%
      assert.strictEqual(p[1].char, 'N');
      assert.strictEqual(p[1].stat, '75%');
      assert.strictEqual(p[1].barWidth, '75%');
      assert.ok(p[1].classes.includes('as-advancing'), 'N should have as-advancing');

      // I: 65% -> as-advancing, bar width 65%
      assert.strictEqual(p[2].char, 'I');
      assert.strictEqual(p[2].stat, '65%');
      assert.strictEqual(p[2].barWidth, '65%');
      assert.ok(p[2].classes.includes('as-advancing'), 'I should have as-advancing');

      // A: 45% -> as-learning, bar width 45%
      assert.strictEqual(p[3].char, 'A');
      assert.strictEqual(p[3].stat, '45%');
      assert.strictEqual(p[3].barWidth, '45%');
      assert.ok(p[3].classes.includes('as-learning'), 'A should have as-learning');

      // R: 30% -> as-learning, bar width 30%, as-focus (evaluated as primary focus key)
      assert.strictEqual(p[4].char, 'R');
      assert.strictEqual(p[4].stat, '30%');
      assert.strictEqual(p[4].barWidth, '30%');
      assert.ok(p[4].classes.includes('as-learning'), 'R should have as-learning');
      assert.ok(p[4].classes.includes('as-focus'), 'R should have as-focus');

      // L: 0% -> as-zero, bar width 0%
      assert.strictEqual(p[5].char, 'L');
      assert.strictEqual(p[5].stat, '0%');
      assert.strictEqual(p[5].barWidth, '0%');
      assert.ok(p[5].classes.includes('as-zero'), 'L should have as-zero');

      // T: locked -> as-locked, no bar fill
      assert.strictEqual(p[6].char, 'T');
      assert.ok(p[6].classes.includes('as-locked'), 'T should be locked');
      assert.strictEqual(p[6].barWidth, null);

      console.log('✓ All Keybr pill mastery stages and progress bars verified!');

      // Capture screenshot of adaptive practice interface
      console.log('3. Capturing visual screenshot of Adaptive Practice Keybr interface...');
      const screenshot = await call('Page.captureScreenshot', { format: 'png' });
      const buffer = Buffer.from(screenshot.data, 'base64');
      const artifactPath = 'C:\\Users\\Kurosaki Kon\\.gemini\\antigravity\\brain\\9ef964bc-db6f-4cb5-9c9a-20b607235a59\\adaptive_keybr_style_verified.png';
      fs.writeFileSync(artifactPath, buffer);
      console.log(`✓ Screenshot saved to ${artifactPath}`);

      cleanup();
      process.exit(0);
    } catch (err) {
      console.error('Test error:', err);
      cleanup();
      process.exit(1);
    }
  }, 1000);
});
