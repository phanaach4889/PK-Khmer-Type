const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
  const filePath = path.join(ROOT, reqPath);
  if (!fs.existsSync(filePath)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200);
  fs.createReadStream(filePath).pipe(res);
});

server.listen(0, async () => {
  const port = server.address().port;
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const tempProfileDir = path.join(__dirname, 'temp_mistakes_test_' + Date.now());
  const debuggingPort = 9355;
  const chromeProc = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${debuggingPort}`,
    `--user-data-dir=${tempProfileDir}`,
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1280,900',
    `http://127.0.0.1:${port}/index.html`
  ]);

  await new Promise(r => setTimeout(r, 2000));
  try {
    const listRes = await fetch(`http://127.0.0.1:${debuggingPort}/json/list`);
    const listData = await listRes.json();
    const pageTarget = listData.find(t => t.type === 'page');
    const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

    let msgId = 1;
    function send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = msgId++;
        const handler = (evt) => {
          const msg = JSON.parse(evt.data);
          if (msg.id === id) {
            ws.removeEventListener('message', handler);
            if (msg.error) reject(msg.error);
            else resolve(msg.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    await new Promise(r => ws.addEventListener('open', r));
    await send('Runtime.enable');

    // Switch to English and start Adaptive Practice
    await send('Runtime.evaluate', {
      expression: `
        switchLayout('english');
        const btn = document.getElementById('lshAdaptiveBtn') || document.getElementById('adaptiveStartBtn');
        if (btn) btn.click();
      `
    });

    await new Promise(r => setTimeout(r, 800));

    // Test simulated strokes directly in the browser runtime
    const testResult = await send('Runtime.evaluate', {
      expression: `
        (() => {
          // 1. Reset state
          PK_ADAPTIVE.resetAdaptiveState('english');
          
          // 2. Add 5 correct units to 'e'
          for (let i = 0; i < 5; i++) {
            PK_ADAPTIVE.recordStroke('english', 'e', true, 250);
          }
          const state5 = PK_ADAPTIVE.getUnitState('english', 'e');
          
          // 3. Make 1 mistake on 'e'
          PK_ADAPTIVE.recordStroke('english', 'e', false, 250);
          const stateAfter1Mistake = PK_ADAPTIVE.getUnitState('english', 'e');
          
          // 4. Make 403 mistakes on 'e'
          for (let i = 0; i < 402; i++) {
            PK_ADAPTIVE.recordStroke('english', 'e', false, 250);
          }
          const stateAfter403Mistakes = PK_ADAPTIVE.getUnitState('english', 'e');
          
          // 5. Test all active letters (N, I, A, R, L)
          const allLettersTest = {};
          for (const u of ['n', 'i', 'a', 'r', 'l']) {
            // Give 4 correct (20%)
            for (let i = 0; i < 4; i++) PK_ADAPTIVE.recordStroke('english', u, true, 250);
            const beforeMistake = PK_ADAPTIVE.getUnitState('english', u);
            // Make 1 mistake -> drops to 3 units (15%)
            PK_ADAPTIVE.recordStroke('english', u, false, 250);
            const after1Mistake = PK_ADAPTIVE.getUnitState('english', u);
            // Make 10 mistakes -> drops to 0 units (0%)
            for (let i = 0; i < 10; i++) PK_ADAPTIVE.recordStroke('english', u, false, 250);
            const after10Mistakes = PK_ADAPTIVE.getUnitState('english', u);
            
            allLettersTest[u] = {
              before: beforeMistake.completion,
              after1: after1Mistake.completion,
              after10: after10Mistakes.completion
            };
          }

          // Re-render the strip
          PK_ADAPTIVE.renderLetterStrip(document.getElementById('adaptiveLetterStrip'), 'english');
          
          // Read DOM pill for 'E'
          const ePill = document.querySelector('.as-pill[data-unit=\"e\"] .as-pill-stat')?.textContent;

          return {
            state5: { units: state5.completedUnits, pct: state5.completion },
            stateAfter1Mistake: { units: stateAfter1Mistake.completedUnits, pct: stateAfter1Mistake.completion },
            stateAfter403Mistakes: { units: stateAfter403Mistakes.completedUnits, pct: stateAfter403Mistakes.completion, mistakes: stateAfter403Mistakes.mistakes },
            allLettersTest: allLettersTest,
            ePillDOM: ePill
          };
        })()
      `,
      returnByValue: true
    });

    console.log('Browser Verification Result:', JSON.stringify(testResult.result.value, null, 2));

    // Capture screenshot
    const screenshot = await send('Page.captureScreenshot', { format: 'png' });
    const artifactPath = path.join('C:\\Users\\Kurosaki Kon\\.gemini\\antigravity\\brain\\9ef964bc-db6f-4cb5-9c9a-20b607235a59', 'adaptive_letter_mistakes_verified.png');
    fs.writeFileSync(artifactPath, Buffer.from(screenshot.data, 'base64'));
    console.log(`\nScreenshot saved to: ${artifactPath}`);

    ws.close();
  } catch (e) {
    console.error('TEST FAILED:', e);
    process.exitCode = 1;
  } finally {
    chromeProc.kill();
    server.close();
    try { fs.rmSync(tempProfileDir, { recursive: true, force: true }); } catch (e) {}
    process.exit(process.exitCode || 0);
  }
});
