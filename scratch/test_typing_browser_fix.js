const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 8920 + Math.floor(Math.random() * 50);
const DEBUG_PORT = 9520 + Math.floor(Math.random() * 50);
const ROOT_DIR = path.resolve('.');

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
  if (!fs.existsSync(filePath)) { res.writeHead(404); res.end('Not Found'); return; }
  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, {
    'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
    'Cache-Control': 'no-store, no-cache, must-revalidate'
  });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, async () => {
  console.log(`Server listening on port ${PORT}...`);
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=' + DEBUG_PORT,
    '--disable-gpu',
    '--incognito',
    '--disable-cache',
    'http://127.0.0.1:' + PORT + '/index.html'
  ]);

  let closed = false;
  function cleanup() {
    if (closed) return;
    closed = true;
    try { chrome.kill(); } catch (e) {}
    try { server.close(); } catch (e) {}
  }

  process.on('exit', cleanup);
  process.on('SIGINT', cleanup);

  try {
    await new Promise(r => setTimeout(r, 2000));
    const list = await fetch('http://127.0.0.1:' + DEBUG_PORT + '/json/list').then(r => r.json());
    const pageTarget = list.find(t => t.type === 'page' && t.url.includes(String(PORT))) || list.find(t => t.type === 'page') || list[0];
    const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
    await new Promise(r => ws.addEventListener('open', r));

    let id = 1;
    function call(method, params = {}) {
      return new Promise((resolve) => {
        const curId = id++;
        const h = (evt) => {
          const d = JSON.parse(evt.data);
          if (d.id === curId) {
            ws.removeEventListener('message', h);
            resolve(d.result);
          }
        };
        ws.addEventListener('message', h);
        ws.send(JSON.stringify({ id: curId, method, params }));
      });
    }

    await call('Page.enable');
    await call('Runtime.enable');
    await call('DOM.enable');

    console.log('1. Checking page load console errors...');
    const errors = await call('Runtime.evaluate', {
      expression: `(() => {
        return window.__testErrors || [];
      })()`,
      returnByValue: true
    });
    console.log('Console errors:', errors.result.value || 'none');

    console.log('2. Testing free-form typing in English layout...');
    await call('Runtime.evaluate', { expression: `switchLayout("english"); clearText();` });
    
    // Simulate clicking keys or physical keydown
    await call('Runtime.evaluate', {
      expression: `(() => {
        typeKey('h');
        typeKey('e');
        typeKey('l');
        typeKey('l');
        typeKey('o');
        return document.getElementById('output').textContent;
      })()`,
      returnByValue: true
    });

    const enText = await call('Runtime.evaluate', {
      expression: `document.getElementById('output').textContent`,
      returnByValue: true
    });
    console.log('Typed English text in manuscript:', JSON.stringify(enText.result.value));
    if (!enText.result.value.includes('hello')) {
      throw new Error(`Expected 'hello', but got: ${enText.result.value}`);
    }

    console.log('3. Testing physical keyboard keydown listener in English...');
    await call('Runtime.evaluate', { expression: `clearText();` });
    await call('Runtime.evaluate', {
      expression: `(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW', key: 'w' }));
        window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyW', key: 'w' }));
        window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyO', key: 'o' }));
        window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyO', key: 'o' }));
        window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyR', key: 'r' }));
        window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyR', key: 'r' }));
        window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyL', key: 'l' }));
        window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyL', key: 'l' }));
        window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyD', key: 'd' }));
        window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyD', key: 'd' }));
        return document.getElementById('output').textContent;
      })()`,
      returnByValue: true
    });
    const worldText = await call('Runtime.evaluate', {
      expression: `document.getElementById('output').textContent`,
      returnByValue: true
    });
    console.log('Typed via physical keydown events:', JSON.stringify(worldText.result.value));
    if (!worldText.result.value.includes('world')) {
      throw new Error(`Expected 'world', but got: ${worldText.result.value}`);
    }

    console.log('4. Testing free-form typing in Standard Khmer layout...');
    await call('Runtime.evaluate', { expression: `switchLayout("standard"); clearText();` });
    await call('Runtime.evaluate', {
      expression: `(() => {
        typeKey('k'); // Produces ក
        typeKey('a'); // Produces ា
        typeKey('k'); // Produces ក
        return document.getElementById('output').textContent;
      })()`,
      returnByValue: true
    });
    const kmText = await call('Runtime.evaluate', {
      expression: `document.getElementById('output').textContent`,
      returnByValue: true
    });
    console.log('Typed Khmer text in manuscript:', JSON.stringify(kmText.result.value));
    if (!kmText.result.value.includes('កាក')) {
      throw new Error(`Expected 'កាក', but got: ${kmText.result.value}`);
    }

    console.log('5. Testing free-form typing in Khmer NiDA layout...');
    await call('Runtime.evaluate', { expression: `switchLayout("nida"); clearText();` });
    await call('Runtime.evaluate', {
      expression: `(() => {
        typeKey('k'); // Produces ក
        typeKey('a'); // Produces ា
        typeKey('k'); // Produces ក
        return document.getElementById('output').textContent;
      })()`,
      returnByValue: true
    });
    const nidaText = await call('Runtime.evaluate', {
      expression: `document.getElementById('output').textContent`,
      returnByValue: true
    });
    console.log('Typed NiDA text in manuscript:', JSON.stringify(nidaText.result.value));
    if (!nidaText.result.value.includes('កាក')) {
      throw new Error(`Expected 'កាក', but got: ${nidaText.result.value}`);
    }

    console.log('6. Testing lesson typing interaction in Standard layout...');
    await call('Runtime.evaluate', { expression: `switchLayout("standard"); startLesson(1);` });
    const lessonInfo = await call('Runtime.evaluate', {
      expression: `(() => {
        const expected = lessonChars[lessonIndex];
        const keyId = lessonKeyIds[lessonIndex];
        return { active: window.lessonActive, expected, keyId, total: lessonChars.length };
      })()`,
      returnByValue: true
    });
    console.log('Lesson started:', lessonInfo.result.value);

    // Type the first character in lesson
    await call('Runtime.evaluate', {
      expression: `(() => {
        const keyId = lessonKeyIds[lessonIndex];
        typeKey(keyId);
        return { index: lessonIndex, mistakes: lessonMistakes };
      })()`,
      returnByValue: true
    });
    const afterChar = await call('Runtime.evaluate', {
      expression: `({ index: lessonIndex, mistakes: lessonMistakes })`,
      returnByValue: true
    });
    console.log('Lesson after typing 1st char:', afterChar.result.value);
    if (afterChar.result.value.index !== 1) {
      throw new Error(`Expected lessonIndex to advance to 1, but it is: ${afterChar.result.value.index}`);
    }

    await call('Runtime.evaluate', { expression: `executeLessonExit();` });

    console.log('7. Testing typing in Adaptive Practice session...');
    await call('Runtime.evaluate', { expression: `switchLayout("english"); PK_ADAPTIVE.startAdaptiveSession("english");` });
    const adaptiveInfo = await call('Runtime.evaluate', {
      expression: `(() => {
        const s = PK_ADAPTIVE.getActiveSession();
        return {
          active: window.adaptiveActive,
          char: s.drill.chars[s.index],
          keyId: s.drill.keyIds[s.index],
          total: s.drill.chars.length
        };
      })()`,
      returnByValue: true
    });
    console.log('Adaptive session active:', adaptiveInfo.result.value);

    // Type first char in adaptive drill
    await call('Runtime.evaluate', {
      expression: `(() => {
        const s = PK_ADAPTIVE.getActiveSession();
        const ch = s.drill.chars[s.index];
        const stroke = { id: ch === ' ' ? 'space' : ch, layer: 'base', charProduced: ch };
        PK_ADAPTIVE.adaptiveHandleChar(ch, null, stroke);
        return { index: s.index, mistakes: s.mistakes };
      })()`,
      returnByValue: true
    });
    const afterAdaptiveChar = await call('Runtime.evaluate', {
      expression: `(() => {
        const s = PK_ADAPTIVE.getActiveSession();
        return { index: s.index, mistakes: s.mistakes };
      })()`,
      returnByValue: true
    });
    console.log('Adaptive after 1st char:', afterAdaptiveChar.result.value);
    if (afterAdaptiveChar.result.value.index !== 1) {
      throw new Error(`Expected adaptive index to advance to 1, but got: ${afterAdaptiveChar.result.value.index}`);
    }

    await call('Runtime.evaluate', { expression: `PK_ADAPTIVE.exitSession();` });

    console.log('\n=============================================');
    console.log('TYPING ENGINE VERIFICATION PASSED 100%!');
    console.log('=============================================');

    cleanup();
    process.exit(0);
  } catch (err) {
    console.error('Test error:', err);
    cleanup();
    process.exit(1);
  }
});
