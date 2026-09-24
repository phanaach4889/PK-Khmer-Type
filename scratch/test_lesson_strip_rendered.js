const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 8800 + Math.floor(Math.random() * 100);
const DEBUG_PORT = 9400 + Math.floor(Math.random() * 100);
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

    const checkDesktop = await evaluate(`(() => {
      const el = document.getElementById('lessonStrip');
      if (!el) return { exists: false };
      const rect = el.getBoundingClientRect();
      const headers = el.querySelectorAll('.lesson-level-header');
      const cards = el.querySelectorAll('.lesson-card');
      const topBar = el.querySelector('.lesson-strip-header');
      return {
        exists: true,
        childrenCount: el.children.length,
        rect: { x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height) },
        hasTopBar: !!topBar,
        levelHeadersCount: headers.length,
        lessonCardsCount: cards.length,
        firstHeader: headers[0] ? headers[0].innerText.trim() : null
      };
    })()`);
    console.log('DESKTOP INITIAL (Standard):', JSON.stringify(checkDesktop, null, 2));

    for (const l of ['nida', 'english', 'standard']) {
      await evaluate(`if(window.switchLayout) window.switchLayout('${l}');`);
      await new Promise(r => setTimeout(r, 400));
      const res = await evaluate(`(() => {
        const el = document.getElementById('lessonStrip');
        const rect = el.getBoundingClientRect();
        return {
          layout: '${l}',
          cards: el.querySelectorAll('.lesson-card').length,
          levels: el.querySelectorAll('.lesson-level-header').length,
          rect: { x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.width), h: Math.round(rect.height) },
          hidden: el.hidden
        };
      })()`);
      console.log('SWITCHED TO ' + l + ':', JSON.stringify(res));
    }

    // Test clicking a lesson card
    console.log('Testing click to start lesson 1...');
    await evaluate(`(() => {
      const card = document.querySelector('.lesson-card[data-lesson="1"]');
      if (card) card.click();
    })()`);
    await new Promise(r => setTimeout(r, 400));
    const duringLesson = await evaluate(`(() => {
      const el = document.getElementById('lessonStrip');
      const rect = el.getBoundingClientRect();
      return {
        lessonActive: window.lessonActive,
        cards: el.querySelectorAll('.lesson-card').length,
        levels: el.querySelectorAll('.lesson-level-header').length,
        rect: { x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.width), h: Math.round(rect.height) }
      };
    })()`);
    console.log('DURING LESSON:', JSON.stringify(duringLesson));

    // Test clicking outside (e.g. document body)
    console.log('Testing click outside...');
    await evaluate(`document.body.click();`);
    await new Promise(r => setTimeout(r, 400));
    const afterOutsideClick = await evaluate(`(() => {
      const el = document.getElementById('lessonStrip');
      const rect = el.getBoundingClientRect();
      return {
        cards: el.querySelectorAll('.lesson-card').length,
        levels: el.querySelectorAll('.lesson-level-header').length,
        rect: { x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.width), h: Math.round(rect.height) }
      };
    })()`);
    console.log('AFTER OUTSIDE CLICK:', JSON.stringify(afterOutsideClick));

    // Take screenshot of browser
    const screenshot = await sendCommand('Page.captureScreenshot', { format: 'png' });
    const screenshotPath = 'C:\\Users\\Kurosaki Kon\\.gemini\\antigravity\\brain\\9ef964bc-db6f-4cb5-9c9a-20b607235a59\\lesson_strip_always_show_verified.png';
    fs.writeFileSync(screenshotPath, Buffer.from(screenshot.data, 'base64'));
    console.log('Screenshot saved to:', screenshotPath);

    client.close();
  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    if (chromeProc) {
      try { chromeProc.kill(); } catch (e) {}
    }
    server.close();
  }
});
