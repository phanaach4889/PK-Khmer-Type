const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const server = http.createServer((req, res) => {
  let filePath = path.join(__dirname, '..', req.url.split('?')[0]);
  if (req.url === '/' || req.url.startsWith('/?')) filePath = path.join(__dirname, '..', 'index.html');
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    const ext = path.extname(filePath);
    const mime = ext === '.html' ? 'text/html' : ext === '.js' ? 'application/javascript' : ext === '.css' ? 'text/css' : ext === '.svg' ? 'image/svg+xml' : 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  });
});

server.listen(8931, async () => {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9234',
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
      const list = await fetch('http://127.0.0.1:9234/json/list').then(r => r.json());
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

      await call('Page.navigate', { url: 'http://localhost:8931/' });
      await new Promise(r => setTimeout(r, 1200));

      await call('Runtime.evaluate', {
        expression: `(() => {
          localStorage.clear();
          window.currentLayoutId = 'english';
          window.PK_ADAPTIVE.resetAdaptiveState('english');
          window.PK_ADAPTIVE.startAdaptiveSession('english');
        })()`
      });
      await new Promise(r => setTimeout(r, 600));

      const shot = await call('Page.captureScreenshot', { format: 'png' });
      const artDir = 'C:\\Users\\Kurosaki Kon\\.gemini\\antigravity\\brain\\9ef964bc-db6f-4cb5-9c9a-20b607235a59';
      fs.writeFileSync(path.join(artDir, 'adaptive_stage1_all_zero_verified.png'), Buffer.from(shot.data, 'base64'));
      console.log('Stage 1 screenshot saved to adaptive_stage1_all_zero_verified.png');
      cleanup();
      process.exit(0);
    } catch (e) {
      console.error(e);
      cleanup();
      process.exit(1);
    }
  }, 1000);
});
