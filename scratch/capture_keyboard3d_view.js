const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const server = http.createServer((req, res) => {
  let reqUrl = req.url.split('?')[0];
  let filePath = path.join(__dirname, '..', reqUrl);

  if (reqUrl === '/' || reqUrl === '/Documents' || reqUrl === '/Documents/') {
    filePath = path.join(__dirname, '..', 'Documents', 'index.html');
  }

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

const PORT = 8936;
const CDP_PORT = 9239;

server.listen(PORT, async () => {
  console.log(`Server listening at http://localhost:${PORT}`);
  const browserPath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const chrome = spawn(browserPath, [
    '--headless=new',
    `--remote-debugging-port=${CDP_PORT}`,
    '--enable-webgl',
    '--enable-accelerated-2d-canvas',
    '--ignore-gpu-blocklist',
    '--use-gl=angle',
    '--no-sandbox',
    '--window-size=1400,980'
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

      console.log('Navigating to Documents page...');
      await call('Page.navigate', { url: `http://localhost:${PORT}/Documents/index.html` });
      await new Promise(r => setTimeout(r, 2200));

      // Scroll down to the 3D keyboard section
      await call('Runtime.evaluate', {
        expression: `
          const el = document.getElementById('keycap-3d');
          if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
        `
      });
      await new Promise(r => setTimeout(r, 800));

      console.log('Capturing screenshot...');
      const scr = await call('Page.captureScreenshot', { format: 'png' });
      const imgBuffer = Buffer.from(scr.data, 'base64');
      fs.writeFileSync(path.join(__dirname, 'live_rendered_3d_keyboard.png'), imgBuffer);
      console.log('Screenshot saved to scratch/live_rendered_3d_keyboard.png');

      // Copy to artifacts directory
      const artifactDir = 'C:\\Users\\Kurosaki Kon\\.gemini\\antigravity\\brain\\9ef964bc-db6f-4cb5-9c9a-20b607235a59';
      if (fs.existsSync(artifactDir)) {
        fs.writeFileSync(path.join(artifactDir, 'live_rendered_3d_keyboard.png'), imgBuffer);
        console.log('Screenshot copied to artifacts directory!');
      }

      cleanup();
      process.exit(0);
    } catch (e) {
      console.error('Error during capture:', e);
      cleanup();
      process.exit(1);
    }
  }, 1200);
});
