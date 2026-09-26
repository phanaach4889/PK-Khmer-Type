const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const assert = require('assert');

const PORT = 8890 + Math.floor(Math.random() * 50);
const DEBUG_PORT = 9490 + Math.floor(Math.random() * 50);
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

    console.log('1. Setting realistic learner state (E N I A R L T at 100%, O at 60%, S relocked)...');
    await call('Runtime.evaluate', {
      expression: `(() => {
        const testState = {
          version: '1.0.0',
          layoutId: 'english',
          stage: 3,
          unlockedUnits: ['e', 'n', 'i', 'a', 'r', 'l', 't', 'o'],
          focusUnit: 'o',
          newlyUnlockedUnit: null,
          sessionsCompleted: 10,
          totalUnitsTyped: 200,
          unitStats: {
            e: { attempts: 24, correct: 22, mistakes: 2, completedUnits: 20 },
            n: { attempts: 23, correct: 21, mistakes: 2, completedUnits: 20 },
            i: { attempts: 25, correct: 23, mistakes: 2, completedUnits: 20 },
            a: { attempts: 26, correct: 24, mistakes: 2, completedUnits: 20 },
            r: { attempts: 25, correct: 23, mistakes: 2, completedUnits: 20 },
            l: { attempts: 24, correct: 22, mistakes: 2, completedUnits: 20 },
            t: { attempts: 22, correct: 20, mistakes: 2, completedUnits: 20 },
            o: { attempts: 15, correct: 12, mistakes: 3, completedUnits: 12 }
          },
          sessionHistory: []
        };
        localStorage.setItem('pk_adaptive_state_v1', JSON.stringify({ english: testState }));
      })()`,
      returnByValue: true
    });

    console.log('2. Switching layout to English...');
    await call('Runtime.evaluate', {
      expression: `switchLayout('english')`,
      returnByValue: true
    });
    await new Promise(r => setTimeout(r, 500));

    console.log('3. Starting Adaptive Practice Session...');
    await call('Runtime.evaluate', {
      expression: `PK_ADAPTIVE.startAdaptiveSession('english')`,
      returnByValue: true
    });
    await new Promise(r => setTimeout(r, 600));

    console.log('3. Inspecting Letter Strip DOM pills and stats...');
    const pillsData = await call('Runtime.evaluate', {
      expression: `(() => {
        const pills = Array.from(document.querySelectorAll('#adaptiveLetterStrip .as-pill'));
        return pills.slice(0, 10).map(p => ({
          char: p.querySelector('.as-pill-char')?.textContent,
          stat: p.querySelector('.as-pill-stat')?.textContent,
          hasLock: !!p.querySelector('.as-pill-stat svg'),
          classes: p.className
        }));
      })()`,
      returnByValue: true
    });
    console.log('Pills data:', JSON.stringify(pillsData.result.value, null, 2));

    const pills = pillsData.result.value;
    // Verify E N I A R L T show 100%
    for (let i = 0; i < 7; i++) {
      if (pills[i].stat !== '100%') {
        throw new Error(`Pill ${pills[i].char} should show 100% but shows ${pills[i].stat}`);
      }
    }
    console.log('  ✓ E, N, I, A, R, L, T all correctly display 100% completion!');

    // Verify O shows 60%
    if (pills[7].stat !== '60%') {
      throw new Error(`Pill O should show 60% completion but shows ${pills[7].stat}`);
    }
    console.log('  ✓ O correctly displays 60% completion!');

    // Verify S shows lock
    if (!pills[8].hasLock) {
      throw new Error(`Pill S must be locked because O is only 60%!`);
    }
    console.log('  ✓ S is strictly locked with lock icon until O hits 100%!');

    console.log('4. Capturing visual screenshot of Adaptive Letter Strip...');
    const screenshot = await call('Page.captureScreenshot', { format: 'png' });
    const artDir = 'C:\\Users\\Kurosaki Kon\\.gemini\\antigravity\\brain\\9ef964bc-db6f-4cb5-9c9a-20b607235a59';
    fs.writeFileSync(path.join(artDir, 'adaptive_100pct_completion_ui.png'), Buffer.from(screenshot.data, 'base64'));
    console.log('Screenshot saved to adaptive_100pct_completion_ui.png');

    console.log('5. Completing O to 100% (20/20 units) and finishing session...');
    await call('Runtime.evaluate', {
      expression: `(() => {
        // Record 8 more correct strokes on 'o' to reach 20/20 (100% completion)
        for (let i = 0; i < 8; i++) {
          PK_ADAPTIVE.recordStroke('english', 'o', true, 200);
        }
        const s = PK_ADAPTIVE.getActiveSession();
        // Finish drill
        while (s.index < s.drill.chars.length) {
          const exp = s.drill.chars[s.index];
          const stroke = { id: exp === ' ' ? 'space' : exp, layer: 'base', charProduced: exp };
          PK_ADAPTIVE.adaptiveHandleChar(exp, null, stroke);
        }
      })()`,
      returnByValue: true
    });
    await new Promise(r => setTimeout(r, 800));

    console.log('6. Checking that S has unlocked and Milestone Modal opened...');
    const afterUnlock = await call('Runtime.evaluate', {
      expression: `(() => {
        const modal = document.querySelector('.adaptive-complete-overlay');
        const modalTitle = modal?.querySelector('.adaptive-summary-title')?.textContent;
        const bannerText = modal?.querySelector('.adaptive-unlocked-banner')?.textContent;
        const sPill = document.querySelector('#adaptiveLetterStrip .as-pill[data-unit="s"]');
        const sStat = sPill?.querySelector('.as-pill-stat')?.textContent;
        const oPill = document.querySelector('#adaptiveLetterStrip .as-pill[data-unit="o"]');
        const oStat = oPill?.querySelector('.as-pill-stat')?.textContent;
        return {
          hasModal: !!modal,
          modalTitle: modalTitle,
          bannerText: bannerText,
          oStat: oStat,
          sStat: sStat,
          sUnlocked: !sPill?.classList.contains('as-locked')
        };
      })()`,
      returnByValue: true
    });
    console.log('After unlock state:', afterUnlock.result.value);

    // Verify modal was completely removed per user's requirement (no annoying popups)
    assert.strictEqual(afterUnlock.result.value.hasModal, false, 'Annoying popup modal must remain completely removed!');
    assert.strictEqual(afterUnlock.result.value.oStat, '100%', 'Letter O must be 100% complete');
    assert.strictEqual(afterUnlock.result.value.sUnlocked, true, 'Letter S MUST unlock when all active letters are 100%!');
    assert.strictEqual(afterUnlock.result.value.sStat, '0%', 'Newly unlocked letter S must start at 0%!');
    console.log('  ✓ Verified: S unlocked seamlessly without intrusive modal, S starts at 0%!');

    console.log('7. Capturing post-unlock screenshot...');
    const postShot = await call('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artDir, 'adaptive_100pct_unlocked_s.png'), Buffer.from(postShot.data, 'base64'));
    console.log('Screenshot saved to adaptive_100pct_unlocked_s.png');

    console.log('\nALL BROWSER E2E TESTS PASSED WITH 100% SUCCESS!');
    cleanup();
    process.exit(0);
  } catch (err) {
    console.error('Test failed:', err);
    cleanup();
    process.exit(1);
  }
});
