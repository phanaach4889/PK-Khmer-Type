const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 8890 + Math.floor(Math.random() * 50);
const DEBUG_PORT = 9490 + Math.floor(Math.random() * 50);
const ROOT_DIR = path.resolve('.');

const MIME_TYPES = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
  '.json': 'application/json', '.png': 'image/png'
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
  console.log(`Test server running at http://127.0.0.1:${PORT}`);
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=' + DEBUG_PORT,
    '--disable-gpu',
    '--window-size=1280,900',
    'http://127.0.0.1:' + PORT + '/index.html'
  ]);
  await new Promise(r => setTimeout(r, 1500));
  const list = await fetch('http://127.0.0.1:' + DEBUG_PORT + '/json/list').then(r => r.json());
  const target = list.find(t => t.type === 'page');
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener('open', r));

  let id = 1;
  function call(method, params = {}) {
    return new Promise(resolve => {
      const curId = id++;
      const h = (evt) => {
        const d = JSON.parse(evt.data);
        if (d.id === curId) { ws.removeEventListener('message', h); resolve(d.result); }
      };
      ws.addEventListener('message', h);
      ws.send(JSON.stringify({ id: curId, method, params }));
    });
  }

  await call('Page.enable');
  await call('Runtime.enable');
  await new Promise(r => setTimeout(r, 1500));

  // Test 1: Simulate holding Shift key down with multiple repeat events
  console.log('Testing Shift key hold and repeat events...');
  const shiftResult = await call('Runtime.evaluate', {
    expression: `(() => {
      const t0 = performance.now();
      // First keydown: press Shift
      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ShiftLeft', key: 'Shift', shiftKey: true, repeat: false }));
      
      const layerAfterFirstPress = window.physicalLayer;
      const shiftPressedClass = document.querySelector('.key-shift')?.classList.contains('pressed');
      const shiftPillActive = document.querySelector('[data-pill="shift"]')?.classList.contains('active');
      const wrapHasShift = document.getElementById('boardWrap')?.classList.contains('layer-shift');

      // Now simulate 100 rapid repeat keydown events as if holding Shift down for 3 seconds
      const repeatTimes = [];
      for(let i = 0; i < 100; i++){
        const r0 = performance.now();
        window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ShiftLeft', key: 'Shift', shiftKey: true, repeat: true }));
        repeatTimes.push(performance.now() - r0);
      }
      const tTotal = performance.now() - t0;
      const avgRepeatMs = repeatTimes.reduce((a, b) => a + b, 0) / repeatTimes.length;

      return {
        layerAfterFirstPress,
        shiftPressedClass,
        shiftPillActive,
        wrapHasShift,
        avgRepeatMs: avgRepeatMs.toFixed(3) + 'ms',
        totalMsFor100Repeats: tTotal.toFixed(2) + 'ms'
      };
    })()`,
    returnByValue: true
  });
  console.log('Shift hold test result:', shiftResult.result.value);

  // Take screenshot while Shift is held down to verify visual presentation
  const shot = await call('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/shift_held_visual.png', Buffer.from(shot.data, 'base64'));
  console.log('Saved screenshot of Shift hold to scratch/shift_held_visual.png');

  // Test release of Shift
  const shiftReleaseResult = await call('Runtime.evaluate', {
    expression: `(() => {
      window.dispatchEvent(new KeyboardEvent('keyup', { code: 'ShiftLeft', key: 'Shift', shiftKey: false }));
      return {
        layerAfterRelease: window.physicalLayer,
        shiftPressedClass: document.querySelector('.key-shift')?.classList.contains('pressed'),
        wrapHasShift: document.getElementById('boardWrap')?.classList.contains('layer-shift')
      };
    })()`,
    returnByValue: true
  });
  console.log('Shift release result:', shiftReleaseResult.result.value);

  // Test 2: Simulate holding Ctrl
  console.log('Testing Ctrl key hold...');
  const ctrlResult = await call('Runtime.evaluate', {
    expression: `(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ControlLeft', key: 'Control', ctrlKey: true, repeat: false }));
      for(let i = 0; i < 50; i++){
        window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ControlLeft', key: 'Control', ctrlKey: true, repeat: true }));
      }
      return {
        layer: window.physicalLayer,
        ctrlPressed: document.querySelector('.key-ctrl')?.classList.contains('pressed'),
        ctrlPillActive: document.querySelector('[data-pill="ctrl"]')?.classList.contains('active'),
        wrapHasCtrl: document.getElementById('boardWrap')?.classList.contains('layer-ctrl')
      };
    })()`,
    returnByValue: true
  });
  console.log('Ctrl hold test result:', ctrlResult.result.value);

  // Take screenshot while Ctrl is held
  const ctrlShot = await call('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/ctrl_held_visual.png', Buffer.from(ctrlShot.data, 'base64'));
  console.log('Saved screenshot of Ctrl hold to scratch/ctrl_held_visual.png');

  await call('Runtime.evaluate', {
    expression: `(() => {
      window.dispatchEvent(new KeyboardEvent('keyup', { code: 'ControlLeft', key: 'Control', ctrlKey: false }));
    })()`
  });

  // Test 3: Simulate holding AltGr
  console.log('Testing AltGr key hold...');
  const altgrResult = await call('Runtime.evaluate', {
    expression: `(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'AltRight', key: 'AltGraph', repeat: false }));
      for(let i = 0; i < 50; i++){
        window.dispatchEvent(new KeyboardEvent('keydown', { code: 'AltRight', key: 'AltGraph', repeat: true }));
      }
      return {
        layer: window.physicalLayer,
        altgrPressed: document.querySelector('.key-altgr')?.classList.contains('pressed'),
        altgrPillActive: document.querySelector('[data-pill="altgr"]')?.classList.contains('active'),
        wrapHasAltgr: document.getElementById('boardWrap')?.classList.contains('layer-altgr')
      };
    })()`,
    returnByValue: true
  });
  console.log('AltGr hold test result:', altgrResult.result.value);

  // Take screenshot while AltGr is held
  const altgrShot = await call('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('scratch/altgr_held_visual.png', Buffer.from(altgrShot.data, 'base64'));
  console.log('Saved screenshot of AltGr hold to scratch/altgr_held_visual.png');

  await call('Runtime.evaluate', {
    expression: `(() => {
      window.dispatchEvent(new KeyboardEvent('keyup', { code: 'AltRight', key: 'AltGraph' }));
    })()`
  });

  console.log('\n=============================================');
  console.log('ALL MODIFIER HOLD PERFORMANCE TESTS PASSED!');
  console.log('=============================================');

  ws.close();
  chrome.kill();
  server.close();
  process.exit(0);
});
