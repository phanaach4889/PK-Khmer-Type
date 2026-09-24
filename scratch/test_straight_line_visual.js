const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

// Simple static server
const ROOT = path.resolve(__dirname, '..');
const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
  const filePath = path.join(ROOT, reqPath);
  if (!fs.existsSync(filePath)) {
    res.writeHead(404);
    res.end('Not Found');
    return;
  }
  const ext = path.extname(filePath).toLowerCase();
  const mimeMap = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.svg': 'image/svg+xml'
  };
  res.writeHead(200, { 'Content-Type': mimeMap[ext] || 'text/plain' });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(0, async () => {
  const port = server.address().port;
  console.log(`Server listening on port ${port}...`);

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const debuggingPort = 9333;
  const chromeProc = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${debuggingPort}`,
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1280,900',
    `http://127.0.0.1:${port}/index.html`
  ]);

  await new Promise(r => setTimeout(r, 1500));

  try {
    const listRes = await fetch(`http://127.0.0.1:${debuggingPort}/json/list`);
    const listData = await listRes.json();
    const pageTarget = listData.find(t => t.type === 'page' && t.url.includes(String(port))) || listData.find(t => t.type === 'page') || listData[0];
    const wsUrl = pageTarget.webSocketDebuggerUrl;
    const ws = new WebSocket(wsUrl);

    let msgId = 1;
    function sendCommand(method, params = {}) {
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
    await sendCommand('Runtime.enable');
    await sendCommand('DOM.enable');

    // Switch to Standard Khmer layout and launch Adaptive Practice
    console.log('Switching to Standard Khmer layout and starting Adaptive Practice...');
    await sendCommand('Runtime.evaluate', {
      expression: `
        switchLayout('standard');
        const btn = document.getElementById('adaptiveStartBtn') || document.getElementById('lshAdaptiveBtn');
        if (btn) btn.click();
      `
    });

    await new Promise(r => setTimeout(r, 1000));

    // Check bounds of adaptiveCharRow and each lc-char inside it
    const rowInfo = await sendCommand('Runtime.evaluate', {
      expression: `
        (() => {
          const row = document.getElementById('adaptiveCharRow');
          const chars = Array.from(row.querySelectorAll('.lc-char'));
          const rowRect = row.getBoundingClientRect();
          const charRects = chars.map((c, i) => {
            const r = c.getBoundingClientRect();
            return {
              text: c.textContent,
              isCurrent: c.classList.contains('current'),
              top: Math.round(r.top),
              bottom: Math.round(r.bottom),
              height: Math.round(r.height),
              left: Math.round(r.left),
              right: Math.round(r.right)
            };
          });
          
          // Check if all characters share the exact same vertical range (single straight line)
          const tops = new Set(charRects.map(c => c.top));
          const isSingleLine = tops.size <= 2; // minor subpixel variations <= 1px
          const maxTop = Math.max(...charRects.map(c => c.top));
          const minTop = Math.min(...charRects.map(c => c.top));

          return {
            charCount: chars.length,
            isSingleLine: (maxTop - minTop) <= 2,
            topSpread: maxTop - minTop,
            chars: charRects
          };
        })()
      `,
      returnByValue: true
    });

    console.log('Row evaluation:', JSON.stringify(rowInfo.result.value, null, 2));

    // Type 3 keystrokes
    await sendCommand('Runtime.evaluate', {
      expression: `
        (() => {
          const s = PK_ADAPTIVE.getActiveSession();
          for (let i = 0; i < 3; i++) {
            const exp = s.drill.chars[s.index];
            const stroke = { id: exp === ' ' ? 'space' : exp, layer: 'base', charProduced: exp };
            PK_ADAPTIVE.adaptiveHandleChar(exp, null, stroke);
          }
        })()
      `
    });
    await new Promise(r => setTimeout(r, 400));

    const screenshot = await sendCommand('Page.captureScreenshot', {
      format: 'png'
    });

    const outPath = path.resolve('C:\\Users\\Kurosaki Kon\\.gemini\\antigravity\\brain\\9ef964bc-db6f-4cb5-9c9a-20b607235a59\\straight_line_adaptive_typing.png');
    fs.writeFileSync(outPath, Buffer.from(screenshot.data, 'base64'));
    console.log('Typing screenshot saved to:', outPath);

    ws.close();
  } catch (e) {
    console.error('Test error:', e);
  } finally {
    chromeProc.kill();
    server.close();
    process.exit(0);
  }
});
