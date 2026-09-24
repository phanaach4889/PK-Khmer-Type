const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8877;
const DEBUG_PORT = 9477;
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

  await send('Runtime.enable');
  await send('Page.enable');
  await send('Page.navigate', { url: 'http://127.0.0.1:' + PORT + '/index.html' });
  await new Promise(r => setTimeout(r, 2500));

  const evalRes = await send('Runtime.evaluate', {
    expression: 'document.getElementById("lessonStrip").innerHTML',
    returnByValue: true
  });
  fs.writeFileSync(path.join(ROOT_DIR, 'scratch', 'rendered_strip_initial.html'), evalRes.result.value);
  console.log('Saved initial strip HTML, length:', evalRes.result.value.length);

  chromeProc.kill();
  server.close();
  process.exit(0);
});

