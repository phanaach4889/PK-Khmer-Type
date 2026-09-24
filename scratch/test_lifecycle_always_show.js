const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8871;
const DEBUG_PORT = 9471;
const ROOT_DIR = path.resolve(__dirname, '..');

const server = http.createServer((req, res) => {
  let reqPath = decodeURI(req.url.split('?')[0]);
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(ROOT_DIR, reqPath);
  if (!fs.existsSync(filePath)) { res.writeHead(404); return res.end('Not Found'); }
  res.writeHead(200);
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, async () => {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=' + DEBUG_PORT,
    '--disable-gpu',
    'http://127.0.0.1:' + PORT + '/index.html'
  ]);

  let targets = null;
  for (let i = 0; i < 25; i++) {
    try {
      targets = await fetch('http://127.0.0.1:' + DEBUG_PORT + '/json/list').then(r => r.json());
      if (targets && targets.length) break;
    } catch(e) { await new Promise(r => setTimeout(r, 200)); }
  }

  const pageTarget = targets.find(t => t.type === 'page');
  const client = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise(r => client.onopen = r);

  let id = 1;
  const send = (method, params = {}) => new Promise((res, rej) => {
    const curId = id++;
    const handler = (evt) => {
      const msg = JSON.parse(evt.data);
      if (msg.id === curId) { client.removeEventListener('message', handler); res(msg.result); }
    };
    client.addEventListener('message', handler);
    client.send(JSON.stringify({ id: curId, method, params }));
  });

  const evaluate = async (expr) => {
    const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    return r.result ? r.result.value : null;
  };

  await send('Runtime.enable');
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1400, height: 900, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: 'http://127.0.0.1:' + PORT + '/index.html' });
  await new Promise(r => setTimeout(r, 2000));

  const checkState = async (stepName) => {
    const info = await evaluate(`(() => {
      const el = document.getElementById('lessonStrip');
      const rect = el ? el.getBoundingClientRect() : null;
      return {
        step: '${stepName}',
        exists: !!el,
        hidden: el ? el.hidden : null,
        display: el ? getComputedStyle(el).display : null,
        visibility: el ? getComputedStyle(el).visibility : null,
        rect: rect ? { width: Math.round(rect.width), height: Math.round(rect.height) } : null,
        cards: el ? el.querySelectorAll('.lesson-card').length : 0,
        levels: el ? el.querySelectorAll('.lesson-level-header').length : 0
      };
    })()`);
    console.log(JSON.stringify(info));
    return info;
  };

  await checkState('Initial Page Load');

  // Start lesson 1
  await evaluate(`startLesson(1);`);
  await new Promise(r => setTimeout(r, 300));
  await checkState('After startLesson(1)');

  // Click outside (e.g. on manuscript)
  await evaluate(`document.getElementById('manuscript').click();`);
  await new Promise(r => setTimeout(r, 300));
  await checkState('After Outside Click on Manuscript');

  // Toggle expand button
  await evaluate(`const btn = document.getElementById('lshExpandBtn'); if(btn) btn.click();`);
  await new Promise(r => setTimeout(r, 300));
  await checkState('After Expand Button Click');

  // Toggle compact
  await evaluate(`const btn = document.getElementById('lshExpandBtn'); if(btn) btn.click();`);
  await new Promise(r => setTimeout(r, 300));
  await checkState('After Compact Button Click');

  // Exit lesson
  await evaluate(`if(window.executeLessonExit) window.executeLessonExit();`);
  await new Promise(r => setTimeout(r, 300));
  await checkState('After Lesson Exit');

  // Switch layouts
  for (const l of ['nida', 'english', 'standard']) {
    await evaluate(`switchLayout('${l}');`);
    await new Promise(r => setTimeout(r, 300));
    await checkState('After Switch to ' + l);
  }

  // Take screenshot of final view to verify visually
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ROOT_DIR, 'scratch', 'lesson_strip_always_show_test.png'), Buffer.from(shot.data, 'base64'));
  console.log('Saved screenshot to scratch/lesson_strip_always_show_test.png');

  chromeProc.kill();
  server.close();
  process.exit(0);
});

