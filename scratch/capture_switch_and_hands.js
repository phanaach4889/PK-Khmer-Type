const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');

const PORT = 8940;
const CDP_PORT = 9243;

const server = http.createServer((req, res) => {
  let reqUrl = req.url.split('?')[0];
  let filePath = path.join(__dirname, '..', reqUrl);
  if (reqUrl === '/' || reqUrl === '/Documents' || reqUrl === '/Documents/') {
    filePath = path.join(__dirname, '..', 'Documents', 'index.html');
  }
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    const ext = path.extname(filePath);
    const mime = ext === '.html' ? 'text/html' : ext === '.js' ? 'application/javascript' : ext === '.css' ? 'text/css' : 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  });
});

server.listen(PORT, async () => {
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

      await call('Page.navigate', { url: `http://localhost:${PORT}/Documents/index.html` });
      await new Promise(r => setTimeout(r, 2200));

      await call('Runtime.evaluate', {
        expression: `document.getElementById('keycap-3d').scrollIntoView({ behavior: 'instant', block: 'center' });`
      });
      await new Promise(r => setTimeout(r, 600));

      // 1. Click Switch Anatomy
      await call('Runtime.evaluate', {
        expression: `
          const btn = document.querySelector('[data-view="switch"]');
          if (btn) btn.click();
        `
      });
      await new Promise(r => setTimeout(r, 900));

      const scrSwitch = await call('Page.captureScreenshot', { format: 'png' });
      const switchBuf = Buffer.from(scrSwitch.data, 'base64');
      fs.writeFileSync(path.join(__dirname, 'live_rendered_switch_anatomy.png'), switchBuf);

      const artifactDir = 'C:\\Users\\Kurosaki Kon\\.gemini\\antigravity\\brain\\9ef964bc-db6f-4cb5-9c9a-20b607235a59';
      if (fs.existsSync(artifactDir)) {
        fs.writeFileSync(path.join(artifactDir, 'live_rendered_switch_anatomy.png'), switchBuf);
      }
      console.log('Switch anatomy screenshot saved!');

      // 2. Click Full Keyboard
      await call('Runtime.evaluate', {
        expression: `
          const btnKb = document.querySelector('[data-view="keyboard"]');
          if (btnKb) btnKb.click();
        `
      });
      await new Promise(r => setTimeout(r, 900));

      const scrHands = await call('Page.captureScreenshot', { format: 'png' });
      const handsBuf = Buffer.from(scrHands.data, 'base64');
      fs.writeFileSync(path.join(__dirname, 'live_rendered_hands_guide.png'), handsBuf);
      if (fs.existsSync(artifactDir)) {
        fs.writeFileSync(path.join(artifactDir, 'live_rendered_hands_guide.png'), handsBuf);
      }
      console.log('Hands guide screenshot saved!');

      cleanup();
      process.exit(0);
    } catch (e) {
      console.error(e);
      cleanup();
      process.exit(1);
    }
  }, 1200);
});
