const http = require('http');
const fs = require('fs');
const { spawn } = require('child_process');

const PORT = 8891;
const DEBUG_PORT = 9491;

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = '.' + reqPath;
  if (!fs.existsSync(filePath)) { res.writeHead(404); res.end(); return; }
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, async () => {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new', '--remote-debugging-port=' + DEBUG_PORT, 'http://127.0.0.1:' + PORT + '/index.html'
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
  await call('Runtime.enable');
  await new Promise(r => setTimeout(r, 1000));

  function getPills() {
    return Array.from(document.querySelectorAll('[data-pill]')).map(p => ({
      pill: p.dataset.pill,
      className: p.className
    }));
  }

  const res1 = await call('Runtime.evaluate', {
    expression: `(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ShiftLeft', key: 'Shift', shiftKey: true }));
      return {
        layer: window.currentLayer ? window.currentLayer() : 'no currentLayer',
        pills: Array.from(document.querySelectorAll('[data-pill]')).map(p => ({ pill: p.dataset.pill, cls: p.className }))
      };
    })()`,
    returnByValue: true
  });
  console.log('1. Shift down:', res1.result.value);

  const res2 = await call('Runtime.evaluate', {
    expression: `(() => {
      window.dispatchEvent(new KeyboardEvent('keyup', { code: 'ShiftLeft', key: 'Shift', shiftKey: false }));
      return {
        pills: Array.from(document.querySelectorAll('[data-pill]')).map(p => ({ pill: p.dataset.pill, cls: p.className }))
      };
    })()`,
    returnByValue: true
  });
  console.log('2. Shift up:', res2.result.value);

  const res3 = await call('Runtime.evaluate', {
    expression: `(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ControlLeft', key: 'Control', ctrlKey: true }));
      return {
        pills: Array.from(document.querySelectorAll('[data-pill]')).map(p => ({ pill: p.dataset.pill, cls: p.className }))
      };
    })()`,
    returnByValue: true
  });
  console.log('3. Ctrl down:', res3.result.value);

  const res4 = await call('Runtime.evaluate', {
    expression: `(() => {
      window.dispatchEvent(new KeyboardEvent('keyup', { code: 'ControlLeft', key: 'Control', ctrlKey: false }));
      return {
        pills: Array.from(document.querySelectorAll('[data-pill]')).map(p => ({ pill: p.dataset.pill, cls: p.className }))
      };
    })()`,
    returnByValue: true
  });
  console.log('4. Ctrl up:', res4.result.value);

  const res5 = await call('Runtime.evaluate', {
    expression: `(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'AltRight', key: 'AltGraph' }));
      return {
        pills: Array.from(document.querySelectorAll('[data-pill]')).map(p => ({ pill: p.dataset.pill, cls: p.className }))
      };
    })()`,
    returnByValue: true
  });
  console.log('5. AltGr down:', res5.result.value);

  const res6 = await call('Runtime.evaluate', {
    expression: `(() => {
      window.dispatchEvent(new KeyboardEvent('keyup', { code: 'AltRight', key: 'AltGraph' }));
      return {
        pills: Array.from(document.querySelectorAll('[data-pill]')).map(p => ({ pill: p.dataset.pill, cls: p.className }))
      };
    })()`,
    returnByValue: true
  });
  console.log('6. AltGr up:', res6.result.value);

  ws.close();
  chrome.kill();
  server.close();
  process.exit(0);
});
