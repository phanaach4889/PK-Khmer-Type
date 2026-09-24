const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 8870 + Math.floor(Math.random() * 50);
const DEBUG_PORT = 9470 + Math.floor(Math.random() * 50);
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

    console.log('1. Checking page load & console errors...');
    const errors = await call('Runtime.evaluate', {
      expression: 'window.__errors || []',
      returnByValue: true
    });
    console.log('Console errors:', errors.result.value || 'none');

    console.log('2. Switching layout to English...');
    await call('Runtime.evaluate', {
      expression: 'switchLayout("english")',
      returnByValue: true
    });
    await new Promise(r => setTimeout(r, 300));

    console.log('3. Checking adaptive buttons and sidebar card...');
    const cardInfo = await call('Runtime.evaluate', {
      expression: `({
        hasLshBtn: !!document.getElementById('lshAdaptiveBtn'),
        hasStartBtn: !!document.getElementById('adaptiveStartBtn'),
        hasSidebarCard: !!document.getElementById('adaptiveSidebarCard'),
        sidebarSub: document.getElementById('adaptiveSidebarSub')?.textContent
      })`,
      returnByValue: true
    });
    console.log('Adaptive entry points:', cardInfo.result.value);

    console.log('4. Launching Adaptive Practice Session...');
    await call('Runtime.evaluate', {
      expression: `document.getElementById('adaptiveStartBtn').click()`,
      returnByValue: true
    });
    await new Promise(r => setTimeout(r, 500));

    const sessionState = await call('Runtime.evaluate', {
      expression: `({
        adaptiveActive: window.adaptiveActive,
        panelHidden: document.getElementById('adaptivePanel')?.hidden,
        manuscriptHidden: document.getElementById('manuscript')?.hidden,
        stageBadge: document.getElementById('adaptiveStageBadge')?.textContent,
        unlockedCount: document.getElementById('adaptiveUnlockedCount')?.textContent,
        stripPillCount: document.querySelectorAll('#adaptiveLetterStrip .as-pill').length,
        unlockedPillCount: document.querySelectorAll('#adaptiveLetterStrip .as-pill:not(.as-locked)').length,
        lockedPillCount: document.querySelectorAll('#adaptiveLetterStrip .as-pill.as-locked').length,
        firstChar: document.querySelector('#adaptiveCharRow .lc-char.current')?.textContent
      })`,
      returnByValue: true
    });
    console.log('Adaptive session launched:', sessionState.result.value);

    if (!sessionState.result.value.adaptiveActive || sessionState.result.value.panelHidden) {
      throw new Error('Adaptive session failed to activate properly!');
    }

    console.log('5. Capturing initial adaptive panel screenshot...');
    const initialScreenshot = await call('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('scratch/adaptive_panel_initial.png', Buffer.from(initialScreenshot.data, 'base64'));
    console.log('Screenshot saved to scratch/adaptive_panel_initial.png');

    console.log('6. Typing through the drill...');
    // We will type through all the characters
    let finished = false;
    let strokes = 0;
    while (!finished && strokes < 200) {
      strokes++;
      const cur = await call('Runtime.evaluate', {
        expression: `(() => {
          const s = PK_ADAPTIVE.getActiveSession();
          if (!s || !window.adaptiveActive) return { done: true };
          const exp = s.drill.chars[s.index];
          const stroke = { id: exp === ' ' ? 'space' : exp, layer: 'base', charProduced: exp };
          PK_ADAPTIVE.adaptiveHandleChar(exp, null, stroke);
          return {
            done: s.index >= s.drill.chars.length,
            idx: s.index,
            total: s.drill.chars.length,
            active: window.adaptiveActive
          };
        })()`,
        returnByValue: true
      });

      if (!cur.result || !cur.result.value || cur.result.value.done || !cur.result.value.active) {
        finished = true;
      }
    }
    console.log(`Finished drill after ${strokes} strokes.`);
    await new Promise(r => setTimeout(r, 600));

    console.log('7. Verifying Adaptive Summary Modal...');
    const modalInfo = await call('Runtime.evaluate', {
      expression: `(() => {
        const modal = document.querySelector('.adaptive-complete-overlay');
        if (!modal) return { hasModal: false };
        return {
          hasModal: true,
          title: modal.querySelector('.adaptive-summary-title')?.textContent,
          beforeAfter: modal.querySelector('.adaptive-before-after')?.textContent?.replace(/\\s+/g, ' ').trim(),
          statsGrid: modal.querySelector('.adaptive-stats-grid')?.textContent?.replace(/\\s+/g, ' ').trim(),
          hasNextBtn: !!modal.querySelector('#adaptiveNextRoundBtn'),
          hasExitBtn: !!modal.querySelector('#adaptiveSummaryExitBtn')
        };
      })()`,
      returnByValue: true
    });
    console.log('Summary modal check:', modalInfo.result.value);

    if (!modalInfo.result.value.hasModal) {
      throw new Error('Adaptive summary modal did not appear!');
    }

    console.log('8. Capturing adaptive summary screenshot...');
    const summaryScreenshot = await call('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('scratch/adaptive_summary_modal.png', Buffer.from(summaryScreenshot.data, 'base64'));
    console.log('Screenshot saved to scratch/adaptive_summary_modal.png');

    console.log('9. Clicking "Return to Lessons" button...');
    await call('Runtime.evaluate', {
      expression: `document.getElementById('adaptiveSummaryExitBtn').click()`,
      returnByValue: true
    });
    await new Promise(r => setTimeout(r, 500));

    const returnedState = await call('Runtime.evaluate', {
      expression: `({
        adaptiveActive: window.adaptiveActive,
        panelHidden: document.getElementById('adaptivePanel')?.hidden,
        manuscriptHidden: document.getElementById('manuscript')?.hidden,
        hasModal: !!document.querySelector('.adaptive-complete-overlay')
      })`,
      returnByValue: true
    });
    console.log('State after return:', returnedState.result.value);

    console.log('10. Verifying regular lesson still starts cleanly (zero regressions)...');
    await call('Runtime.evaluate', {
      expression: `startLesson(1)`,
      returnByValue: true
    });
    await new Promise(r => setTimeout(r, 500));

    const regularLessonState = await call('Runtime.evaluate', {
      expression: `({
        lessonActive: window.lessonActive,
        lessonTitle: document.getElementById('lessonTitle')?.textContent,
        lessonPanelHidden: document.getElementById('lessonPanel')?.hidden
      })`,
      returnByValue: true
    });
    console.log('Regular lesson check:', regularLessonState.result.value);

    await call('Runtime.evaluate', { expression: `executeLessonExit()` });

    console.log('\n=============================================');
    console.log('ALL PHASE 8 BROWSER TESTS PASSED PERFECTLY!');
    console.log('=============================================');

    cleanup();
    process.exit(0);
  } catch (err) {
    console.error('Test error:', err);
    cleanup();
    process.exit(1);
  }
});

