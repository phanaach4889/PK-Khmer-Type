const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const CDP_PORT = 9260;
const chrome = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
  '--headless=new',
  '--remote-debugging-port=' + CDP_PORT,
  '--enable-webgl',
  '--enable-accelerated-2d-canvas',
  '--ignore-gpu-blocklist',
  '--use-gl=angle',
  '--no-sandbox',
  '--window-size=1400,980'
]);

setTimeout(async () => {
  try {
    const list = await fetch('http://127.0.0.1:' + CDP_PORT + '/json/list').then(r => r.json());
    const target = list.find(t => t.type === 'page') || list[0];
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise(r => ws.addEventListener('open', r));

    let id = 1;
    const call = (method, params = {}) => new Promise((resolve, reject) => {
      const curId = id++;
      const h = (e) => {
        const d = JSON.parse(e.data);
        if (d.id === curId) {
          ws.removeEventListener('message', h);
          if (d.error) reject(d.error);
          else resolve(d.result);
        }
      };
      ws.addEventListener('message', h);
      ws.send(JSON.stringify({ id: curId, method, params }));
    });

    await call('Page.enable');
    await call('Runtime.enable');
    await call('Page.navigate', { url: 'http://localhost:5174/Documents/' });
    await new Promise(r => setTimeout(r, 2200));

    await call('Runtime.evaluate', {
      expression: 'document.getElementById("keycap-3d").scrollIntoView({ behavior: "instant", block: "center" });'
    });
    await new Promise(r => setTimeout(r, 800));

    const scr = await call('Page.captureScreenshot', { format: 'png' });
    const imgBuf = Buffer.from(scr.data, 'base64');
    fs.writeFileSync(path.join(__dirname, 'live_port_5174_view.png'), imgBuf);
    console.log('Saved screenshot from port 5174!');

    chrome.kill();
    process.exit(0);
  } catch (e) {
    console.error(e);
    try { chrome.kill(); } catch (err) {}
    process.exit(1);
  }
}, 1200);
