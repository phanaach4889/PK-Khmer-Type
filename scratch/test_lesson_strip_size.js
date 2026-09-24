const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 8888;
const DEBUG_PORT = 9488;
const ROOT_DIR = path.resolve('.');

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png'
};

const server = http.createServer((req, res) => {
  let reqPath = decodeURI(req.url.split('?')[0]);
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(ROOT_DIR, reqPath);
  if (!fs.existsSync(filePath)) { res.writeHead(404); res.end('Not Found'); return; }
  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, {
    'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
    'Cache-Control': 'no-store, no-cache, must-revalidate'
  });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, async () => {
  console.log(`Test server running on http://127.0.0.1:${PORT}`);
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=' + DEBUG_PORT,
    '--disable-gpu',
    '--incognito',
    '--disable-cache',
    'http://127.0.0.1:' + PORT + '/index.html'
  ]);
  await new Promise(r => setTimeout(r, 1500));
  const list = await fetch('http://127.0.0.1:' + DEBUG_PORT + '/json/list').then(r => r.json());
  const pageTarget = list.find(t => t.type === 'page' && t.url.includes(String(PORT))) || list.find(t => t.type === 'page') || list[0];
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener('open', r));

  let id = 1;
  function call(method, params = {}) {
    return new Promise((resolve) => {
      const curId = id++;
      const h = (evt) => {
        const d = JSON.parse(evt.data);
        if (d.id === curId) {
          ws.removeEventListener('message', h);
          resolve(d.result);
        }
      };
      ws.addEventListener('message', h);
      ws.send(JSON.stringify({ id: curId, method, params }));
    });
  }

  await call('Page.enable');
  await call('Runtime.enable');
  await call('Emulation.setDeviceMetricsOverride', {
    width: 1400,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });
  await call('Page.navigate', { url: 'http://127.0.0.1:' + PORT + '/index.html' });
  await new Promise(r => setTimeout(r, 2000));

  const metrics = await call('Runtime.evaluate', {
    expression: `(() => {
      const strip = document.getElementById('lessonStrip');
      const rect = strip.getBoundingClientRect();
      const style = window.getComputedStyle(strip);
      const firstCard = strip.querySelector('.lesson-card');
      const cardRect = firstCard ? firstCard.getBoundingClientRect() : null;
      const titleEl = strip.querySelector('.lesson-card-title');
      const titleStyle = titleEl ? window.getComputedStyle(titleEl) : null;
      const numEl = strip.querySelector('.lesson-card-num');
      const numStyle = numEl ? window.getComputedStyle(numEl) : null;
      
      return JSON.stringify({
        stripRect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
        padding: style.padding,
        cardRect: cardRect ? { width: cardRect.width, height: cardRect.height } : null,
        titleFontSize: titleStyle?.fontSize,
        titleColor: titleStyle?.color,
        numFontSize: numStyle?.fontSize
      });
    })()`,
    returnByValue: true
  });
  console.log('MEASURED LESSON STRIP METRICS:', JSON.parse(metrics.result.value));

  // Take screenshot
  const shot = await call('Page.captureScreenshot', { format: 'png' });
  const artDir = 'C:\\Users\\Kurosaki Kon\\.gemini\\antigravity\\brain\\9ef964bc-db6f-4cb5-9c9a-20b607235a59';
  const shotPath = path.join(artDir, 'lessons_bar_bigger_verified.png');
  fs.writeFileSync(shotPath, Buffer.from(shot.data, 'base64'));
  console.log('Saved screenshot to:', shotPath);

  ws.close();
  chrome.kill();
  server.close();
});

