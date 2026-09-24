const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 8844;
const DEBUG_PORT = 9444;
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
  res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, async () => {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=' + DEBUG_PORT,
    '--disable-gpu',
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
  ws.addEventListener('message', (evt) => {
    const d = JSON.parse(evt.data);
    if (d.method === 'Runtime.consoleAPICalled') {
      console.log('[BROWSER LOG]', d.params.type, d.params.args.map(a => a.value || JSON.stringify(a)).join(' '));
    }
    if (d.method === 'Runtime.exceptionThrown') {
      console.error('[BROWSER EXCEPTION]', d.params.exceptionDetails);
    }
  });

  await call('Page.enable');
  await call('Runtime.enable');
  await call('Page.navigate', { url: 'http://127.0.0.1:' + PORT + '/index.html' });
  await new Promise(r => setTimeout(r, 2000));

  const val = await call('Runtime.evaluate', {
    expression: 'JSON.stringify({ PK_LESSONS: typeof PK_LESSONS, totalCards: document.querySelectorAll(".lesson-card").length, firstCardText: document.querySelector(".lesson-card")?.innerText, exercisePrompt: document.getElementById("exerciseText")?.innerText })',
    returnByValue: true
  });
  console.log('Result:', JSON.parse(val.result.value));

  // Now click the card to start lesson
  const clickRes = await call('Runtime.evaluate', {
    expression: '(() => { const c = document.querySelector(".lesson-card"); c.click(); return JSON.stringify({ active: c.classList.contains("active"), currentLessonId: window.PK_LESSONS ? window.PK_LESSONS.currentLessonId : null, exerciseText: document.getElementById("exerciseText")?.innerText }); })()',
    returnByValue: true
  });
  console.log('Click result:', JSON.parse(clickRes.result.value));

  ws.close();
  chrome.kill();
  server.close();
});
