const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 8948;
const CDP_PORT = 9248;

const server = http.createServer((req, res) => {
  let reqUrl = req.url.split('?')[0];
  if (reqUrl === '/') reqUrl = '/index.html';
  const filePath = path.join(__dirname, '..', reqUrl);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found: ' + reqUrl);
      return;
    }
    const ext = path.extname(filePath);
    const mime = ext === '.html' ? 'text/html' :
                 ext === '.js' ? 'application/javascript' :
                 ext === '.css' ? 'text/css' :
                 ext === '.svg' ? 'image/svg+xml' :
                 ext === '.json' ? 'application/json' : 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  });
});

server.listen(PORT, async () => {
  console.log(`Server listening on http://localhost:${PORT}`);
  const browserPath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const chrome = spawn(browserPath, [
    '--headless=new',
    `--remote-debugging-port=${CDP_PORT}`,
    '--enable-webgl',
    '--enable-accelerated-2d-canvas',
    '--ignore-gpu-blocklist',
    '--use-gl=angle',
    '--no-sandbox',
    '--window-size=1440,1080'
  ]);

  const cleanup = () => {
    try { chrome.kill(); } catch (e) {}
    try { server.close(); } catch (e) {}
  };

  setTimeout(async () => {
    try {
      const list = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`).then(r => r.json());
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

      console.log('Navigating to index.html...');
      await call('Page.navigate', { url: `http://localhost:${PORT}/index.html` });
      await new Promise(r => setTimeout(r, 2500));

      console.log('Capturing full screen...');
      const scr = await call('Page.captureScreenshot', { format: 'png' });
      const imgBuffer = Buffer.from(scr.data, 'base64');
      const outPath = path.join(__dirname, 'cool_3d_placement_view.png');
      fs.writeFileSync(outPath, imgBuffer);
      console.log('Screenshot saved to', outPath);

      const artifactDir = 'C:\\Users\\Phana\\.gemini\\antigravity\\brain\\4cf8c760-b543-419b-9e7c-b7c8725235e3';
      if (fs.existsSync(artifactDir)) {
        fs.writeFileSync(path.join(artifactDir, 'cool_3d_placement_view.png'), imgBuffer);
        console.log('Screenshot copied to artifacts directory!');
      }

      cleanup();
      process.exit(0);
    } catch (e) {
      console.error('Error during capture:', e);
      cleanup();
      process.exit(1);
    }
  }, 1500);
});
