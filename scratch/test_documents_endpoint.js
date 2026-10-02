const http = require('http');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

// Simple static file handler similar to http-server / serve / python -m http.server
const server = http.createServer((req, res) => {
  let reqPath = decodeURIComponent(req.url.split('?')[0]);
  
  // Resolve path inside project root
  let fullPath = path.join(__dirname, '..', reqPath);

  if (fs.existsSync(fullPath)) {
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      const indexHtml = path.join(fullPath, 'index.html');
      if (fs.existsSync(indexHtml)) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(fs.readFileSync(indexHtml));
        return;
      }
    } else {
      res.writeHead(200);
      res.end(fs.readFileSync(fullPath));
      return;
    }
  }

  // Handle /Documents without trailing slash redirection
  if (reqPath.toLowerCase() === '/documents') {
    const docPath = path.join(__dirname, '../Documents/index.html');
    if (fs.existsSync(docPath)) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(fs.readFileSync(docPath));
      return;
    }
  }

  res.writeHead(404);
  res.end('Not Found');
});

server.listen(0, '127.0.0.1', async () => {
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`Testing /Documents endpoints against static server at ${baseUrl}...`);

  function fetchUrl(urlPath) {
    return new Promise((resolve, reject) => {
      http.get(`${baseUrl}${urlPath}`, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ statusCode: res.statusCode, body: data, headers: res.headers }));
      }).on('error', reject);
    });
  }

  try {
    // 1. Test /Documents
    console.log('  Testing 1: GET /Documents...');
    const r1 = await fetchUrl('/Documents');
    assert.strictEqual(r1.statusCode, 200, '/Documents must return 200 OK');
    assert.ok(r1.body.includes('PK Khmer Type — Official Documentation'), 'Body must contain official docs title');
    assert.ok(r1.body.includes('Adaptive Practice Engine'), 'Body must contain Adaptive Practice section');
    console.log('  ✓ Test 1 Passed: GET /Documents returned 200 OK with full documentation.');

    // 2. Test /Documents/
    console.log('  Testing 2: GET /Documents/...');
    const r2 = await fetchUrl('/Documents/');
    assert.strictEqual(r2.statusCode, 200, '/Documents/ must return 200 OK');
    assert.ok(r2.body.includes('Golden Rule 1: Base Consonant First'), 'Body must contain Khmer typing rules');
    console.log('  ✓ Test 2 Passed: GET /Documents/ returned 200 OK.');

    // 3. Test /Documents/index.html
    console.log('  Testing 3: GET /Documents/index.html...');
    const r3 = await fetchUrl('/Documents/index.html');
    assert.strictEqual(r3.statusCode, 200, '/Documents/index.html must return 200 OK');
    console.log('  ✓ Test 3 Passed: GET /Documents/index.html returned 200 OK.');

    // 4. Test /Documents/docs.css
    console.log('  Testing 4: GET /Documents/docs.css...');
    const r4 = await fetchUrl('/Documents/docs.css');
    assert.strictEqual(r4.statusCode, 200, 'docs.css must be accessible');
    assert.ok(r4.body.includes('--doc-gold'), 'docs.css must contain design variables');
    console.log('  ✓ Test 4 Passed: docs.css loaded successfully.');

    // 5. Test /Documents/docs.js
    console.log('  Testing 5: GET /Documents/docs.js...');
    const r5 = await fetchUrl('/Documents/docs.js');
    assert.strictEqual(r5.statusCode, 200, 'docs.js must be accessible');
    assert.ok(r5.body.includes('updateActiveToc'), 'docs.js must contain interactive functions');
    console.log('  ✓ Test 5 Passed: docs.js loaded successfully.');

    // 6. Test lowercase /documents
    console.log('  Testing 6: GET /documents...');
    const r6 = await fetchUrl('/documents');
    assert.strictEqual(r6.statusCode, 200, '/documents must resolve cleanly');
    console.log('  ✓ Test 6 Passed: GET /documents returned 200 OK.');

    console.log('\n======================================================');
    console.log('ALL /Documents ENDPOINT VERIFICATION TESTS PASSED! (6/6)');
    console.log('======================================================');
    server.close();
    process.exit(0);
  } catch (err) {
    console.error('Test failed:', err);
    server.close();
    process.exit(1);
  }
});
