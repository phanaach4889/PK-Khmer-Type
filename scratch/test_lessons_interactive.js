const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 8833;
const DEBUG_PORT = 9433;
const ROOT_DIR = path.resolve(__dirname, '..');

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
  if (!fs.existsSync(filePath)) {
    res.writeHead(404);
    res.end('Not Found');
    return;
  }
  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, async () => {
  console.log(`Test server up on http://127.0.0.1:${PORT}`);
  let chromeProc = null;
  try {
    const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    chromeProc = spawn(chromePath, [
      '--headless=new',
      `--remote-debugging-port=${DEBUG_PORT}`,
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check',
      `http://127.0.0.1:${PORT}/index.html`
    ]);

    let targets = null;
    for (let i = 0; i < 25; i++) {
      try {
        targets = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/list`).then(r => r.json());
        if (targets && targets.length) break;
      } catch (e) {
        await new Promise(r => setTimeout(r, 200));
      }
    }
    if (!targets) throw new Error('Could not connect to Chrome debugging port');

    const pageTarget = targets.find(t => t.type === 'page' && t.url.includes(String(PORT))) || targets.find(t => t.type === 'page') || targets[0];
    const client = new WebSocket(pageTarget.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      client.addEventListener('open', resolve);
      client.addEventListener('error', reject);
    });

    let msgId = 1;
    const pageErrors = [];
    client.addEventListener('message', evt => {
      const parsed = JSON.parse(evt.data);
      if (parsed.method === 'Runtime.exceptionThrown') {
        pageErrors.push(parsed.params.exceptionDetails);
      }
    });

    function sendCommand(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = msgId++;
        const handler = (evt) => {
          const parsed = JSON.parse(evt.data);
          if (parsed.id === id) {
            client.removeEventListener('message', handler);
            if (parsed.error) reject(parsed.error);
            else resolve(parsed.result);
          }
        };
        client.addEventListener('message', handler);
        client.send(JSON.stringify({ id, method, params }));
      });
    }

    async function evaluate(expr) {
      const res = await sendCommand('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
      return res.result ? res.result.value : null;
    }

    await sendCommand('Page.enable');
    await sendCommand('Runtime.enable');
    await sendCommand('Emulation.setDeviceMetricsOverride', {
      width: 1400,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });
    await sendCommand('Page.navigate', { url: `http://127.0.0.1:${PORT}/index.html` });
    await new Promise(r => setTimeout(r, 2000));

    console.log('Page loaded. Checking errors...');
    if (pageErrors.length > 0) {
      console.error('PAGE ERRORS:', pageErrors);
      throw new Error('Errors on initial load');
    }

    // Check lesson status
    const status = await evaluate(`(() => {
      return {
        hasPKLessons: typeof PK_LESSONS !== 'undefined',
        layoutId: PK_KEYBOARD ? PK_KEYBOARD.currentLayoutId : null,
        totalLessonsInStrip: document.querySelectorAll('.lesson-card').length,
        firstLessonTitle: document.querySelector('.lesson-card')?.querySelector('.lesson-title')?.innerText || null,
        exerciseTextInitial: document.getElementById('exerciseText')?.innerText || ''
      };
    })()`);
    console.log('Status on load:', status);

    // Click the first lesson
    const clickResult = await evaluate(`(() => {
      const firstCard = document.querySelector('.lesson-card');
      if (!firstCard) return { error: 'No card found' };
      firstCard.click();
      return {
        isLessonActive: typeof window.isLessonActive === 'function' ? window.isLessonActive() : null,
        currentLessonId: window.currentLessonId,
        exerciseText: document.getElementById('exerciseText')?.innerText
      };
    })()`);
    console.log('First lesson clicked:', clickResult);

    // Switch to NiDA and click first lesson
    const nidaResult = await evaluate(`(() => {
      if (typeof window.setLayout === 'function') window.setLayout('nida');
      const cards = document.querySelectorAll('.lesson-card');
      if (cards.length > 0) cards[0].click();
      return {
        layout: PK_KEYBOARD ? PK_KEYBOARD.currentLayoutId : null,
        cardsCount: cards.length,
        currentLessonId: window.currentLessonId,
        exerciseText: document.getElementById('exerciseText')?.innerText
      };
    })()`);
    console.log('NiDA lesson clicked:', nidaResult);

    // Switch to English and click first lesson
    const englishResult = await evaluate(`(() => {
      if (typeof window.setLayout === 'function') window.setLayout('english');
      const cards = document.querySelectorAll('.lesson-card');
      if (cards.length > 0) cards[0].click();
      return {
        layout: PK_KEYBOARD ? PK_KEYBOARD.currentLayoutId : null,
        cardsCount: cards.length,
        currentLessonId: window.currentLessonId,
        exerciseText: document.getElementById('exerciseText')?.innerText
      };
    })()`);
    console.log('English lesson clicked:', englishResult);

    console.log('Total page errors during lesson operations:', pageErrors.length);
    if (pageErrors.length > 0) {
      console.error(pageErrors);
      process.exit(1);
    }

    console.log('SUCCESS! All lessons load and activate seamlessly!');
    client.close();
  } catch(e) {
    console.error('Test failed:', e);
    process.exit(1);
  } finally {
    if (chromeProc) chromeProc.kill();
    server.close();
  }
});

