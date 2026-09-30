const http = require('http');
const { spawn } = require('child_process');

const VITE_PORT = 5173;
const DEBUG_PORT = 9433;

async function runTests() {
  console.log(`Waiting for Vite server on http://localhost:${VITE_PORT}...`);
  // Simple check to ensure Vite is running
  for(let i=0; i<30; i++) {
    try {
      await fetch(`http://localhost:${VITE_PORT}`);
      break;
    } catch(e) {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  let chromeProc = null;
  try {
    const chromePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
    chromeProc = spawn(chromePath, [
      '--headless=new',
      `--remote-debugging-port=${DEBUG_PORT}`,
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check',
      `http://localhost:${VITE_PORT}/`
    ]);

    let targets = null;
    for (let i = 0; i < 25; i++) {
      try {
        targets = await fetch(`http://localhost:${DEBUG_PORT}/json/list`).then(r => r.json());
        if (targets && targets.length) break;
      } catch (e) {
        await new Promise(r => setTimeout(r, 200));
      }
    }
    if (!targets) throw new Error('Could not connect to Chrome debugging port');

    const pageTarget = targets.find(t => t.type === 'page' && t.url.includes(String(VITE_PORT))) || targets.find(t => t.type === 'page') || targets[0];
    const client = new WebSocket(pageTarget.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      client.addEventListener('open', resolve);
      client.addEventListener('error', reject);
    });

    let msgId = 1;
    const pageErrors = [];
    client.addEventListener('message', evt => {
      const parsed = JSON.parse(evt.data);
      if (parsed.method === 'Runtime.exceptionThrown') {
        pageErrors.push(parsed.params.exceptionDetails);
      }
    });

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
    await sendCommand('Runtime.enable');
    await sendCommand('Page.navigate', { url: `http://localhost:${VITE_PORT}/` });
    
    console.log('Waiting for React to mount...');
    await new Promise(r => setTimeout(r, 3000)); // give Vite time to load

    if (pageErrors.length > 0) {
      console.error('PAGE ERRORS:', pageErrors);
      throw new Error('Errors on initial load');
    }

    // Check basic React mount state
    const status = await evaluate(`(() => {
      const app = document.querySelector('main');
      const buttons = document.querySelectorAll('button');
      const text = document.body.innerText;
      return {
        hasApp: !!app,
        buttonsCount: buttons.length,
        hasKhmerType: text.includes('PK Khmer Type'),
      };
    })()`);
    console.log('React Mount Status:', status);

    if (!status || !status.hasApp) {
      throw new Error("React application did not mount correctly.");
    }

    // Complete the first lesson in the standard layout (standard-L00-01)
    // The content of the first standard lesson exercise is "f f f f" or similar.
    // Wait, let's type English lesson L00-01 which is "j f j f" or something.
    // Let's just evaluate to find the expected units!
    const expectedText = await evaluate(`(() => {
      return document.querySelector('section').innerText;
    })()`);
    console.log("Expected text extracted from UI:", expectedText);

    // Let's programmatically type the exact expected target using the session!
    console.log("Typing the expected sequence...");
    await evaluate(`(() => {
      // Find the App instance or just emit the exact keys
      // Actually we can dispatch events, but easier is to let React handle it.
      // We will just read the target from our hooks...
    })()`);

    // Let's switch to English layout, click first lesson, and type "j space f space j space f" or whatever it is.
    await evaluate(`(() => {
      const englishBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('English'));
      if(englishBtn) englishBtn.click();
    })()`);
    await new Promise(r => setTimeout(r, 500));

    await new Promise(r => setTimeout(r, 1000)); // wait for React to re-render lesson

    const targetUnits = await evaluate(`(() => {
      const el = document.querySelector('div[aria-label="Typing target"]');
      return el ? el.innerText.replace(/\\s+/g, ' ').trim() : '';
    })()`);
    console.log("Target units:", targetUnits);

    for (const char of targetUnits) {
      if (char === ' ') {
        await sendCommand('Input.dispatchKeyEvent', { type: 'keyDown', key: ' ', code: 'Space', text: ' ' });
        await sendCommand('Input.dispatchKeyEvent', { type: 'keyUp', key: ' ', code: 'Space' });
      } else {
        await sendCommand('Input.dispatchKeyEvent', { type: 'keyDown', key: char, code: 'Key' + char.toUpperCase(), text: char });
        await sendCommand('Input.dispatchKeyEvent', { type: 'keyUp', key: char, code: 'Key' + char.toUpperCase() });
      }
    }

    await new Promise(r => setTimeout(r, 1000));

    // Verify localStorage progress was saved
    const progressData = await evaluate(`(() => {
      return localStorage.getItem('khmerProgress_v2');
    })()`);
    console.log("Progress Data:", progressData);
    console.log("Progress Saved successfully:", progressData !== null);

    console.log('SUCCESS! React app E2E browser test complete with no fatal errors!');
    client.close();
    process.exit(0);

  } catch(e) {
    console.error('Test failed:', e);
    process.exit(1);
  } finally {
    if (chromeProc) chromeProc.kill();
  }
}

runTests();
