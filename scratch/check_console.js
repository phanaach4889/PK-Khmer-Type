const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8899;
const DEBUG_PORT = 9499;
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

  client.addEventListener('message', (evt) => {
    const msg = JSON.parse(evt.data);
    if (msg.method === 'Runtime.consoleAPICalled') {
      console.log('[BROWSER CONSOLE]', msg.params.type, msg.params.args.map(a => a.value || a.description || JSON.stringify(a)).join(' '));
    }
    if (msg.method === 'Runtime.exceptionThrown') {
      console.log('[BROWSER EXCEPTION]', JSON.stringify(msg.params.exceptionDetails, null, 2));
    }
  });

  await send('Runtime.enable');
  await send('Page.enable');
  await send('Page.navigate', { url: 'http://127.0.0.1:' + PORT + '/index.html' });
  await new Promise(r => setTimeout(r, 3000));

  const check = await send('Runtime.evaluate', {
    expression: JSON.stringify({
      step: 'eval'
    }),
    returnByValue: true
  });
  
  const evalRes = await send('Runtime.evaluate', {
    expression: '({ LESSONS: typeof LESSONS !== "undefined" ? LESSONS.length : "undefined", LESSON_SETS: typeof LESSON_SETS !== "undefined" ? Object.keys(LESSON_SETS) : "undefined", lessonStripHtml: document.getElementById("lessonStrip") ? document.getElementById("lessonStrip").outerHTML.slice(0, 300) : "no-strip" })',
    returnByValue: true
  });
  console.log('STATUS:', evalRes.result.value);

  chromeProc.kill();
  server.close();
  process.exit(0);
});

