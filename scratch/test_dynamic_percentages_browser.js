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

const PORT = 8937;
server.listen(PORT, async () => {
  console.log(`Server listening on port ${PORT}...`);

  // 2. Launch headless Chrome
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9237',
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
      const list = await fetch('http://127.0.0.1:9237/json/list').then(r => r.json());
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

      console.log('1. Starting clean adaptive practice session...');
      await call('Runtime.evaluate', {
        expression: `(() => {
          window.PK_ADAPTIVE.resetAdaptiveState('english');
          window.PK_ADAPTIVE.startAdaptiveSession('english');
        })()`
      });
      await new Promise(r => setTimeout(r, 600));

      // Check initial completion of 'e'
      const initE = await call('Runtime.evaluate', {
        expression: `window.PK_ADAPTIVE.getUnitState('english', 'e')`,
        returnByValue: true
      });
      console.log('Initial E completion:', initE.result.value.completion + '%');
      assert.strictEqual(initE.result.value.completion, 0);

      console.log('2. Recording strokes with dynamic gains and penalties...');
      // Stroke 1: standard correct -> +2%
      await call('Runtime.evaluate', {
        expression: `window.PK_ADAPTIVE.recordStroke('english', 'e', true, 600)`
      });
      let st = (await call('Runtime.evaluate', {
        expression: `window.PK_ADAPTIVE.getUnitState('english', 'e')`,
        returnByValue: true
      })).result.value;
      console.log('  After stroke 1 (correct):', st.completion + '% (+2%)');
      assert.strictEqual(st.completion, 2);

      // Stroke 2: fast correct -> +3%
      await call('Runtime.evaluate', {
        expression: `window.PK_ADAPTIVE.recordStroke('english', 'e', true, 200)`
      });
      st = (await call('Runtime.evaluate', {
        expression: `window.PK_ADAPTIVE.getUnitState('english', 'e')`,
        returnByValue: true
      })).result.value;
      console.log('  After stroke 2 (fast correct):', st.completion + '% (+3% -> 5%)');
      assert.strictEqual(st.completion, 5);

      // Stroke 3: consecutive correct -> +3%
      await call('Runtime.evaluate', {
        expression: `window.PK_ADAPTIVE.recordStroke('english', 'e', true, 250)`
      });
      st = (await call('Runtime.evaluate', {
        expression: `window.PK_ADAPTIVE.getUnitState('english', 'e')`,
        returnByValue: true
      })).result.value;
      console.log('  After stroke 3 (consecutive correct):', st.completion + '% (+3% -> 8%)');
      assert.strictEqual(st.completion, 8);

      // Stroke 4: typo / mistake -> -1%
      await call('Runtime.evaluate', {
        expression: `window.PK_ADAPTIVE.recordStroke('english', 'e', false, 350)`
      });
      st = (await call('Runtime.evaluate', {
        expression: `window.PK_ADAPTIVE.getUnitState('english', 'e')`,
        returnByValue: true
      })).result.value;
      console.log('  After stroke 4 (typo / mistake):', st.completion + '% (-1% -> 7%)');
      assert.strictEqual(st.completion, 7);

      // Stroke 5: second mistake -> -2%
      await call('Runtime.evaluate', {
        expression: `window.PK_ADAPTIVE.recordStroke('english', 'e', false, 350)`
      });
      st = (await call('Runtime.evaluate', {
        expression: `window.PK_ADAPTIVE.getUnitState('english', 'e')`,
        returnByValue: true
      })).result.value;
      console.log('  After stroke 5 (second mistake):', st.completion + '% (-2% -> 5%)');
      assert.strictEqual(st.completion, 5);

      // Render letter strip in DOM
      await call('Runtime.evaluate', {
        expression: `(() => {
          window.currentLayoutId = 'english';
          window.PK_ADAPTIVE.renderLetterStrip(null, 'english');
        })()`
      });
      await new Promise(r => setTimeout(r, 300));

      // Inspect DOM pill for E
      const ePill = await call('Runtime.evaluate', {
        expression: `(() => {
          const pill = document.querySelector('#adaptiveLetterStrip .as-pill[data-unit="e"]');
          const stat = pill?.querySelector('.as-pill-stat')?.textContent;
          const barWidth = pill?.querySelector('.as-pill-bar-fill')?.style.width;
          return { stat, barWidth };
        })()`,
        returnByValue: true
      });
      console.log('Rendered E pill in DOM:', ePill.result.value);
      assert.strictEqual(ePill.result.value.stat, '5%');
      assert.strictEqual(ePill.result.value.barWidth, '5%');

      console.log('3. Capturing browser screenshot with dynamic percentages...');
      const screenshot = await call('Page.captureScreenshot', { format: 'png' });
      const buffer = Buffer.from(screenshot.data, 'base64');
      const artifactPath = 'C:\\Users\\Kurosaki Kon\\.gemini\\antigravity\\brain\\9ef964bc-db6f-4cb5-9c9a-20b607235a59\\adaptive_dynamic_pct_verified.png';
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
