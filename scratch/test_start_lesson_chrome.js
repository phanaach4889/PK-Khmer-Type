const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 8860 + Math.floor(Math.random() * 50);
const DEBUG_PORT = 9460 + Math.floor(Math.random() * 50);
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

  const exceptions = [];
  ws.addEventListener('message', (evt) => {
    const d = JSON.parse(evt.data);
    if (d.method === 'Runtime.exceptionThrown') {
      console.error('PAGE ERROR ON LOAD:', JSON.stringify(d.params.exceptionDetails));
      exceptions.push(d.params.exceptionDetails);
    }
    if (d.method === 'Runtime.consoleAPICalled') {
      console.log('CONSOLE LOG:', d.params.type, d.params.args.map(a => a.value || JSON.stringify(a)).join(' '));
    }
  });

  await call('Page.enable');
  await call('Runtime.enable');
  await call('Page.navigate', { url: 'http://127.0.0.1:' + PORT + '/index.html' });
  await new Promise(r => setTimeout(r, 2000));

  const check = await call('Runtime.evaluate', {
    expression: `(() => {
      const card = document.querySelector('.lesson-card');
      const id = card ? card.dataset.lesson : null;
      const locked = window.isLessonLocked ? window.isLessonLocked(id) : null;
      window.startLesson(id);
      return JSON.stringify({
        lessonId: id,
        locked: locked,
        lessonTitle: document.getElementById('lessonTitle')?.innerText,
        panelHidden: document.getElementById('lessonPanel')?.hidden,
        charsCount: document.querySelectorAll('#lessonCharRow .lc-char').length,
        activeChar: document.querySelector('#lessonCharRow .lc-char.current')?.innerText
      });
    })()`,
    returnByValue: true
  });
  console.log('raw check:', JSON.stringify(check));
  if (check.result && check.result.value) {
    console.log('Start lesson check:', JSON.parse(check.result.value));
  }

  // Now test typing the active char
  const typeCheck = await call('Runtime.evaluate', {
    expression: `(() => {
      const activeChar = document.querySelector('#lessonCharRow .lc-char.current')?.innerText;
      // Trigger key event for that character
      window.lessonHandleChar(activeChar);
      return JSON.stringify({
        doneChars: document.querySelectorAll('#lessonCharRow .lc-char.done').length,
        nextActiveChar: document.querySelector('#lessonCharRow .lc-char.current')?.innerText,
        progressPercent: document.getElementById('lessonProgressFill')?.style.width
      });
    })()`,
    returnByValue: true
  });
  console.log('Typing check:', JSON.parse(typeCheck.result.value));

  ws.close();
  chrome.kill();
  server.close();
});

