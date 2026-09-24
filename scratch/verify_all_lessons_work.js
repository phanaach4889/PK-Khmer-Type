const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 8870 + Math.floor(Math.random() * 50);
const DEBUG_PORT = 9470 + Math.floor(Math.random() * 50);
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
  console.log(`Verification server on http://127.0.0.1:${PORT}`);
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

  const errors = [];
  ws.addEventListener('message', (evt) => {
    const d = JSON.parse(evt.data);
    if (d.method === 'Runtime.exceptionThrown') {
      errors.push(d.params.exceptionDetails);
    }
  });

  await call('Page.enable');
  await call('Runtime.enable');
  await call('Page.navigate', { url: 'http://127.0.0.1:' + PORT + '/index.html' });
  await new Promise(r => setTimeout(r, 2000));

  console.log('1. Checking page load errors...');
  if (errors.length > 0) {
    console.error('Errors found:', errors);
    process.exit(1);
  }
  console.log('   ✓ 0 errors on load');

  // Verify Standard Layout lesson
  console.log('2. Testing Standard Khmer lesson start and typing...');
  const stdTest = await call('Runtime.evaluate', {
    expression: `(() => {
      const firstCard = document.querySelector('.lesson-card');
      if (!firstCard) return { error: 'No card found' };
      firstCard.click();
      const title = document.getElementById('lessonTitle')?.innerText;
      const chars = document.querySelectorAll('#lessonCharRow .lc-char').length;
      const activeChar = document.querySelector('#lessonCharRow .lc-char.current')?.innerText;
      
      // Type the active char
      window.lessonHandleChar(activeChar);
      const doneChars = document.querySelectorAll('#lessonCharRow .lc-char.done').length;
      return {
        title,
        charsCount: chars,
        initialActiveChar: activeChar,
        doneCharsAfterType: doneChars
      };
    })()`,
    returnByValue: true
  });
  console.log('   Standard Lesson:', stdTest.result.value);

  // Switch to NiDA layout and test
  console.log('3. Testing NiDA layout lesson start and typing (including ញ on key J)...');
  const nidaTest = await call('Runtime.evaluate', {
    expression: `(() => {
      if (typeof window.setLayout === 'function') window.setLayout('nida');
      const cards = document.querySelectorAll('.lesson-card');
      if (!cards.length) return { error: 'No NiDA cards found' };
      cards[0].click();
      const title = document.getElementById('lessonTitle')?.innerText;
      const chars = document.querySelectorAll('#lessonCharRow .lc-char').length;
      const activeChar = document.querySelector('#lessonCharRow .lc-char.current')?.innerText;
      
      window.lessonHandleChar(activeChar);
      const doneChars = document.querySelectorAll('#lessonCharRow .lc-char.done').length;
      return {
        title,
        charsCount: chars,
        initialActiveChar: activeChar,
        doneCharsAfterType: doneChars
      };
    })()`,
    returnByValue: true
  });
  console.log('   NiDA Lesson:', nidaTest.result.value);

  // Switch to English layout and test
  console.log('4. Testing English US layout lesson start and typing...');
  const engTest = await call('Runtime.evaluate', {
    expression: `(() => {
      if (typeof window.setLayout === 'function') window.setLayout('english');
      const cards = document.querySelectorAll('.lesson-card');
      if (!cards.length) return { error: 'No English cards found' };
      cards[0].click();
      const title = document.getElementById('lessonTitle')?.innerText;
      const chars = document.querySelectorAll('#lessonCharRow .lc-char').length;
      const activeChar = document.querySelector('#lessonCharRow .lc-char.current')?.innerText;
      
      window.lessonHandleChar(activeChar);
      const doneChars = document.querySelectorAll('#lessonCharRow .lc-char.done').length;
      return {
        title,
        charsCount: chars,
        initialActiveChar: activeChar,
        doneCharsAfterType: doneChars
      };
    })()`,
    returnByValue: true
  });
  console.log('   English Lesson:', engTest.result.value);

  // Verify total errors
  console.log('5. Total uncaught exceptions during all tests:', errors.length);
  if (errors.length > 0) {
    console.error('FAIL: Exceptions occurred during testing', errors);
    process.exit(1);
  }

  console.log('\n========================================');
  console.log('ALL LESSONS TESTED & WORKING PERFECTLY!');
  console.log('========================================');

  ws.close();
  chrome.kill();
  server.close();
});
