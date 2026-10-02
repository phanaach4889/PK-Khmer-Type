const http = require('http');
const fs = require('fs');
const { spawn } = require('child_process');

const PORT = 8890 + Math.floor(Math.random() * 50);
const DEBUG_PORT = 9490 + Math.floor(Math.random() * 50);

const server = http.createServer((req, res) => {
  let p = '.' + (req.url === '/' ? '/index.html' : req.url.split('?')[0]);
  if (!fs.existsSync(p)) { res.writeHead(404); res.end(); return; }
  fs.createReadStream(p).pipe(res);
});

server.listen(PORT, async () => {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new', '--remote-debugging-port=' + DEBUG_PORT, '--window-size=1280,900', 'http://127.0.0.1:' + PORT + '/index.html'
  ]);
  await new Promise(r => setTimeout(r, 1500));
  const list = await fetch('http://127.0.0.1:' + DEBUG_PORT + '/json/list').then(r => r.json());
  const ws = new WebSocket(list[0].webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener('open', r));

  let callId = 1;
  function call(method, params = {}) {
    return new Promise(resolve => {
      const id = callId++;
      const h = (evt) => {
        const d = JSON.parse(evt.data);
        if (d.id === id) { ws.removeEventListener('message', h); resolve(d.result); }
      };
      ws.addEventListener('message', h);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await call('Page.enable');
  await new Promise(r => setTimeout(r, 1200));

  const check = await call('Runtime.evaluate', {
    expression: `(() => {
      const links = Array.from(document.querySelectorAll('a[href*="Documents/index.html#keycap-3d"]'));
      return {
        totalLinks: links.length,
        locations: links.map(el => ({
          tag: el.tagName,
          className: el.className,
          parent: el.parentElement?.className,
          text: el.innerText.trim()
        }))
      };
    })()`,
    returnByValue: true
  });
  console.log('3D Studio Links Check:', JSON.stringify(check.result.value, null, 2));

  const shot = await call('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/single_3d_btn_verified.png', Buffer.from(shot.data, 'base64'));
  console.log('Screenshot saved to scratch/single_3d_btn_verified.png');

  ws.close();
  chrome.kill();
  server.close();
  process.exit(0);
});
