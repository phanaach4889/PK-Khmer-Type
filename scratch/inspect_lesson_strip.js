const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 8769;
const ROOT_DIR = path.resolve(__dirname, '..');

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml'
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
  const mime = MIME_TYPES[ext] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': mime });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, async () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`);
  try {
    await runInspection();
  } catch (err) {
    console.error('Inspection Failed:', err);
  } finally {
    server.close();
  }
});

async function runInspection() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const debugPort = 9227;

  const chromeProc = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${debugPort}`,
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    `http://127.0.0.1:${PORT}/index.html`
  ]);

  let targets = null;
  for (let i = 0; i < 30; i++) {
    try {
      targets = await fetch(`http://127.0.0.1:${debugPort}/json/list`).then(r => r.json());
      if (targets && targets.length) break;
    } catch (e) {
      await new Promise(r => setTimeout(r, 200));
    }
  }
  if (!targets) throw new Error('Could not connect to Chrome debugging port');
  console.log('Targets:', targets.map(t => ({ title: t.title, url: t.url, type: t.type })));
  const pageTarget = targets.find(t => t.type === 'page' && t.url.includes(String(PORT))) || targets.find(t => t.type === 'page') || targets[0];
  const wsUrl = pageTarget.webSocketDebuggerUrl;

  const client = new WebSocket(wsUrl);
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
  await sendCommand('Console.enable');

  client.addEventListener('message', (evt) => {
    const d = JSON.parse(evt.data);
    if (d.method === 'Console.messageAdded') {
      console.log('BROWSER CONSOLE:', d.params.message.level, d.params.message.text);
    } else if (d.method === 'Runtime.exceptionThrown') {
      console.log('BROWSER EXCEPTION:', JSON.stringify(d.params.exceptionDetails));
    }
  });

  await sendCommand('Page.navigate', { url: `http://127.0.0.1:${PORT}/index.html` });
  await new Promise(r => setTimeout(r, 2000));

  await sendCommand('Emulation.setDeviceMetricsOverride', {
    width: 1400,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });

  await new Promise(r => setTimeout(r, 1000));

  // Inspect lessonStrip
  const info = await evaluate(`(() => {
    const el = document.getElementById('lessonStrip');
    if (!el) return { found: false };
    const rect = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    return {
      found: true,
      childrenCount: el.children.length,
      rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
      style: {
        display: style.display,
        visibility: style.visibility,
        opacity: style.opacity,
        height: style.height,
        width: style.width,
        borderRadius: style.borderRadius,
        background: style.background,
        border: style.border
      },
      innerHTMLSnippet: el.innerHTML.slice(0, 300),
      currentLayout: window.currentLayoutId || (window.PK_KB && window.PK_KB.currentLayoutId),
      lessonsLength: typeof LESSONS !== 'undefined' ? LESSONS.length : null,
      levelsLength: typeof LEVELS !== 'undefined' ? LEVELS.length : null,
      topBarExists: !!el.querySelector('.lesson-strip-header'),
      levelHeadersCount: el.querySelectorAll('.lesson-level-header').length,
      cardsCount: el.querySelectorAll('.lesson-card').length
    };
  })()`);

  console.log('Initial page load lessonStrip info:', JSON.stringify(info, null, 2));

  // Also check layout switches:
  for (const layout of ['nida', 'english', 'standard']) {
    await evaluate(`if(window.switchLayout) window.switchLayout('${layout}');`);
    await new Promise(r => setTimeout(r, 400));
    const layoutInfo = await evaluate(`(() => {
      const el = document.getElementById('lessonStrip');
      const rect = el.getBoundingClientRect();
      return {
        layout: '${layout}',
        children: el.children.length,
        rect: { x: rect.x, y: rect.y, w: rect.width, h: rect.height },
        cardsCount: el.querySelectorAll('.lesson-card').length,
        levelHeaders: el.querySelectorAll('.lesson-level-header').length
      };
    })()`);
    console.log(`After switch to ${layout}:`, layoutInfo);
  }

  // Also test starting and exiting lessons
  await evaluate(`
    if(window.switchLayout) window.switchLayout('english');
    if(window.LESSONS && window.LESSONS[0]) window.startLesson(window.LESSONS[0].id);
  `);
  await new Promise(r => setTimeout(r, 400));
  const duringLessonInfo = await evaluate(`(() => {
    const el = document.getElementById('lessonStrip');
    const rect = el.getBoundingClientRect();
    return {
      duringLesson: true,
      children: el.children.length,
      rect: { x: rect.x, y: rect.y, w: rect.width, h: rect.height },
      cardsCount: el.querySelectorAll('.lesson-card').length
    };
  })()`);
  console.log('During lesson:', duringLessonInfo);

  // Take full page screenshot
  const ss = await sendCommand('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(__dirname, 'page_screenshot.png'), Buffer.from(ss.data, 'base64'));
  console.log('Saved scratch/page_screenshot.png');

  client.close();
  chromeProc.kill();
}
