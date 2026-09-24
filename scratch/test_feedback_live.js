// Live browser end-to-end test for Learner Feedback Layer
const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 8765;
const ROOT_DIR = path.resolve(__dirname, '..');

// 1. Lightweight Static HTTP Server
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
  console.log(`Live test server running on http://127.0.0.1:${PORT}`);
  try {
    await runChromeLiveTest();
  } catch (err) {
    console.error('Test Failed:', err);
    process.exit(1);
  } finally {
    server.close();
  }
});

async function runChromeLiveTest() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const debugPort = 9223;

  const chromeProc = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${debugPort}`,
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    `http://127.0.0.1:${PORT}/index.html`
  ]);

  // Wait for Chrome to open debugging port
  await new Promise(r => setTimeout(r, 1500));

  // Connect via CDP WebSocket to page target
  const targets = await fetch(`http://127.0.0.1:${debugPort}/json/list`).then(r => r.json());
  const pageTarget = targets.find(t => t.type === 'page') || targets[0];
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
    await sendCommand('Page.navigate', { url: `http://127.0.0.1:${PORT}/index.html` });
    // Wait for DOM
    await new Promise(r => setTimeout(r, 2000));

    const href = await evaluate("window.location.href");
    console.log('Browser current URL:', href);

    console.log('Verifying browser environment and feedback layer...');

    const hasFeedback = await evaluate("typeof window.PK_FEEDBACK !== 'undefined'");
    const hasTracker = await evaluate("typeof window.PK_TRACKER !== 'undefined'");
    console.log(`  window.PK_FEEDBACK defined: ${hasFeedback}`);
    console.log(`  window.PK_TRACKER defined: ${hasTracker}`);
    if (!hasFeedback || !hasTracker) throw new Error('Feedback/Tracker not loaded!');

    // Start English lesson 1
    console.log('Starting English lesson 1 in live browser...');
    await evaluate(`
      if(window.switchLayout) window.switchLayout('english');
      if(window.LESSONS && window.LESSONS[0]) window.startLesson(window.LESSONS[0].id);
    `);

    await new Promise(r => setTimeout(r, 500));

    // Verify UI DOM elements
    const liveUiStatus = await evaluate(`({
      panelVisible: !document.getElementById('lessonPanel').hidden,
      hasWpm: !!document.getElementById('lessonWpmVal'),
      hasStreak: !!document.getElementById('lessonStreakVal'),
      hasBackspaces: !!document.getElementById('lessonBackspacesVal'),
      hasLiveHint: !!document.getElementById('lessonLiveHint'),
      hintHidden: document.getElementById('lessonLiveHint').hidden,
      totalUnits: window.lessonChars ? window.lessonChars.length : 0
    })`);

    console.log('  Live lesson UI status:', liveUiStatus);
    if (!liveUiStatus.panelVisible) throw new Error('Lesson panel not visible!');
    if (!liveUiStatus.hasWpm || !liveUiStatus.hasStreak || !liveUiStatus.hasBackspaces) throw new Error('Feedback metric DOM elements missing!');
    if (!liveUiStatus.hintHidden) throw new Error('Live hint must be hidden initially (0 mistakes)!');

    // Simulate 1 mistake on key 'f'
    console.log('Simulating 1 mistake (wrong key)...');
    await evaluate(`
      window.lessonHandleChar('j', null, { id: 'j', layer: 'base' });
    `);
    const hintAfterOne = await evaluate("document.getElementById('lessonLiveHint').hidden");
    console.log(`  Live hint after 1 mistake hidden: ${hintAfterOne}`);
    if (!hintAfterOne) throw new Error('Live hint should NOT show after only 1 mistake (single error rule violated)!');

    // Simulate 2nd mistake on key 'f'
    console.log('Simulating 2nd mistake on key f (repeated evidence)...');
    await evaluate(`
      window.lessonHandleChar('j', null, { id: 'j', layer: 'base' });
    `);
    const hintAfterTwo = await evaluate(`({
      hidden: document.getElementById('lessonLiveHint').hidden,
      text: document.getElementById('lessonLiveHint').textContent
    })`);
    console.log('  Live hint after 2 mistakes:', hintAfterTwo);
    if (hintAfterTwo.hidden) throw new Error('Live hint should appear after 2 repeated mistakes on key f!');
    if (!hintAfterTwo.text.includes('F')) throw new Error(`Hint should mention key F, got: ${hintAfterTwo.text}`);

    // Type 1 correct character so progress is in flight (lessonIndex > 0)
    console.log('Typing correct unit to advance lesson progress...');
    await evaluate(`
      const expected = window.lessonChars[window.lessonIndex];
      const keyId = window.lessonKeyIds[window.lessonIndex];
      const layer = window.lessonLayers[window.lessonIndex];
      window.lessonHandleChar(expected, null, { id: keyId, layer: layer });
    `);

    // Test Incomplete Lesson modal (Early Exit / Pause)
    console.log('Clicking Exit button mid-lesson to test Incomplete Lesson modal...');
    await evaluate(`
      document.getElementById('lessonExitBtn').click();
    `);
    await new Promise(r => setTimeout(r, 400));

    const pauseModalStatus = await evaluate(`({
      hasOverlay: !!document.querySelector('.lesson-complete-overlay'),
      isPausedCard: !!document.querySelector('.pk-fb-paused-card'),
      title: document.querySelector('.pk-fb-paused-card h2')?.textContent,
      hasResume: !!document.querySelector('.lc-resume'),
      hasRetry: !!document.querySelector('.lc-retry'),
      hasExit: !!document.querySelector('.lc-exit-confirm')
    })`);
    console.log('  Incomplete lesson modal status:', pauseModalStatus);
    if (!pauseModalStatus.isPausedCard) throw new Error('Incomplete lesson card not rendered on early exit!');
    if (!pauseModalStatus.hasResume || !pauseModalStatus.hasRetry || !pauseModalStatus.hasExit) throw new Error('Paused card actions missing!');

    // Test Resume button
    console.log('Testing Resume button...');
    await evaluate(`
      document.querySelector('.lc-resume').click();
    `);
    await new Promise(r => setTimeout(r, 300));
    const stillActive = await evaluate(`({
      lessonActive: window.lessonActive,
      overlayGone: !document.querySelector('.lesson-complete-overlay')
    })`);
    console.log('  Resume status:', stillActive);
    if (!stillActive.lessonActive || !stillActive.overlayGone) throw new Error('Resume failed to keep lesson active!');

    // Complete the lesson
    console.log('Completing the lesson...');
    await evaluate(`
      while(window.lessonIndex < window.lessonChars.length){
        const expected = window.lessonChars[window.lessonIndex];
        const keyId = window.lessonKeyIds[window.lessonIndex];
        const layer = window.lessonLayers[window.lessonIndex];
        window.lessonHandleChar(expected, null, { id: keyId, layer: layer });
      }
    `);
    await new Promise(r => setTimeout(r, 600));

    // Verify post-lesson feedback card
    const completeCardStatus = await evaluate(`({
      hasCompleteCard: !!document.querySelector('.pk-fb-complete-card'),
      hasPerfGrid: !!document.querySelector('.pk-fb-perf-grid'),
      hasInsights: !!document.querySelector('.pk-fb-insights-row'),
      hasRecommendation: !!document.querySelector('.pk-fb-rec-banner'),
      recText: document.querySelector('.pk-fb-rec-content')?.textContent?.trim(),
      hasNextBtn: !!document.querySelector('.lc-next')
    })`);
    console.log('  Post-lesson card status:', completeCardStatus);
    if (!completeCardStatus.hasCompleteCard) throw new Error('Post-lesson card did not render!');
    if (!completeCardStatus.hasPerfGrid) throw new Error('Performance grid missing from post-lesson card!');
    if (!completeCardStatus.hasInsights) throw new Error('Insights row missing!');
    if (!completeCardStatus.hasRecommendation) throw new Error('Recommendation banner missing!');

    console.log('\nLIVE BROWSER E2E TESTS PASSED WITH 100% SUCCESS!');

    client.close();
    chromeProc.kill();
}
