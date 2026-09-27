const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const assert = require('assert');

const server = http.createServer((req, res) => {
  let filePath = path.join(__dirname, '..', req.url.split('?')[0]);
  if (req.url === '/' || req.url.startsWith('/?')) filePath = path.join(__dirname, '..', 'index.html');
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath);
    const mime = ext === '.html' ? 'text/html' : ext === '.js' ? 'application/javascript' : ext === '.css' ? 'text/css' : ext === '.svg' ? 'image/svg+xml' : 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  });
});

const PORT = 8936;
server.listen(PORT, async () => {
  console.log(`Server listening on port ${PORT}...`);

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9236',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1280,800'
  ]);

  const cleanup = () => {
    try { chrome.kill(); } catch (e) {}
    try { server.close(); } catch (e) {}
  };

  setTimeout(async () => {
    try {
      const list = await fetch('http://127.0.0.1:9236/json/list').then(r => r.json());
      const pageTarget = list.find(t => t.type === 'page') || list[0];
      const wsUrl = pageTarget.webSocketDebuggerUrl;

      const ws = new WebSocket(wsUrl);
      await new Promise(r => ws.addEventListener('open', r));

      let msgId = 1;
      const call = (method, params = {}) => new Promise((resolve, reject) => {
        const curId = msgId++;
        const h = (evt) => {
          const d = JSON.parse(evt.data);
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

      await call('Page.navigate', { url: `http://localhost:${PORT}/` });
      await new Promise(r => setTimeout(r, 1200));

      // Reset and start adaptive practice
      await call('Runtime.evaluate', {
        expression: `(() => {
          window.PK_ADAPTIVE.resetAdaptiveState('english');
          window.PK_ADAPTIVE.startAdaptiveSession('english');
        })()`
      });
      await new Promise(r => setTimeout(r, 600));

      // Get words
      const words = await call('Runtime.evaluate', {
        expression: `window.PK_ADAPTIVE.getActiveSession().drill.words`,
        returnByValue: true
      });
      console.log('Generated words:', words.result.value.slice(0, 3));

      const word1 = words.result.value[0];
      console.log(`Typing word 1 correctly: "${word1}"...`);

      for (const ch of word1) {
        await call('Runtime.evaluate', {
          expression: `window.PK_ADAPTIVE.adaptiveHandleChar('${ch}')`
        });
      }
      // Space to complete word 1
      await call('Runtime.evaluate', {
        expression: `window.PK_ADAPTIVE.adaptiveHandleChar(' ')`
      });
      await new Promise(r => setTimeout(r, 300));

      const stats1 = await call('Runtime.evaluate', {
        expression: `(() => {
          const streak = document.getElementById('adaptiveStreakVal')?.textContent;
          const mistakes = document.getElementById('adaptiveMistakesVal')?.textContent;
          const acc = document.getElementById('adaptiveAccVal')?.textContent;
          return { streak, mistakes, acc };
        })()`,
        returnByValue: true
      });
      console.log('After Word 1 (Correct):', stats1.result.value);
      assert.strictEqual(stats1.result.value.streak, '10', 'Streak must be 10 after 1 correct word');
      assert.strictEqual(stats1.result.value.mistakes, '0', 'Mistakes must be 0');

      // Check letter completion for first char
      const firstChar = word1[0].toLowerCase();
      const st1 = await call('Runtime.evaluate', {
        expression: `window.PK_ADAPTIVE.getUnitState('english', '${firstChar}')`,
        returnByValue: true
      });
      console.log(`Letter '${firstChar}' completion: ${st1.result.value.completion}% (${st1.result.value.completedUnits}/20)`);
      assert.ok(st1.result.value.completion > 0, 'Letter completion should have increased');

      // Now type word 2 with a deliberate typo
      const word2 = words.result.value[1];
      console.log(`Typing word 2 with intentional mistake: "${word2}"...`);

      // Type wrong key first
      await call('Runtime.evaluate', {
        expression: `window.PK_ADAPTIVE.adaptiveHandleChar('z')`
      });

      // Then type word 2 correctly
      for (const ch of word2) {
        await call('Runtime.evaluate', {
          expression: `window.PK_ADAPTIVE.adaptiveHandleChar('${ch}')`
        });
      }
      // Space to complete word 2
      await call('Runtime.evaluate', {
        expression: `window.PK_ADAPTIVE.adaptiveHandleChar(' ')`
      });
      await new Promise(r => setTimeout(r, 300));

      const stats2 = await call('Runtime.evaluate', {
        expression: `(() => {
          const streak = document.getElementById('adaptiveStreakVal')?.textContent;
          const mistakes = document.getElementById('adaptiveMistakesVal')?.textContent;
          const acc = document.getElementById('adaptiveAccVal')?.textContent;
          return { streak, mistakes, acc };
        })()`,
        returnByValue: true
      });
      console.log('After Word 2 (with Mistake):', stats2.result.value);
      assert.strictEqual(stats2.result.value.streak, '0', 'Streak must decrease by 10 (10 -> 0)');
      assert.strictEqual(stats2.result.value.mistakes, '1', 'Mistakes must be 1');

      // Verify that earned letter completion was NOT lost
      const st2 = await call('Runtime.evaluate', {
        expression: `window.PK_ADAPTIVE.getUnitState('english', '${firstChar}')`,
        returnByValue: true
      });
      console.log(`Letter '${firstChar}' completion after mistake in word 2: ${st2.result.value.completion}%`);
      assert.strictEqual(st2.result.value.completedUnits >= st1.result.value.completedUnits, true, 'Earned completion is permanent');

      console.log('✓ All typing flow and counter + Keybr mastery checks passed in real browser!');

      cleanup();
      process.exit(0);
    } catch (err) {
      console.error('Test error:', err);
      cleanup();
      process.exit(1);
    }
  }, 1000);
});
