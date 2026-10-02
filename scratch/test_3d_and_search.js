// Test Suite for 3D Keycap Object, Emoji Elimination, and Search Engine
const fs = require('fs');
const path = require('path');
const vm = require('vm');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failed++;
  }
}

console.log('=== TEST SUITE: 3D MODEL, EMOJI AUDIT, AND SEARCH ENGINE ===\n');

// 1. Emoji Elimination Audit
console.log('1. Auditing Zero Emojis across Project:');
const docsHtml = fs.readFileSync('Documents/index.html', 'utf8');
const readmeMd = fs.readFileSync('README.md', 'utf8');

const emojiRegex = /[\u{1F300}-\u{1FAFF}]/u;
const symbolRegex = /[\u2600-\u27BF]/u;
const specificEmojis = ['⚡', '⌨', '📜', '🗂', '📚', '🎯', '🔤', '💡', '🔄', '🏎', '🏁', '💾', '🔊', '⚙', '❓', '✓', '⟡', '🎹', '🤲', '🔇', '📱'];

let docsEmojiCount = 0;
docsHtml.split('\n').forEach((l, i) => {
  if (emojiRegex.test(l) || symbolRegex.test(l) || specificEmojis.some(e => l.includes(e))) {
    docsEmojiCount++;
    console.error(`  Doc HTML emoji at line ${i+1}: ${l.trim()}`);
  }
});
assert(docsEmojiCount === 0, `Documents/index.html has 0 emojis (found ${docsEmojiCount})`);

let readmeEmojiCount = 0;
readmeMd.split('\n').forEach((l, i) => {
  if (emojiRegex.test(l) || symbolRegex.test(l) || specificEmojis.some(e => l.includes(e))) {
    readmeEmojiCount++;
    console.error(`  README emoji at line ${i+1}: ${l.trim()}`);
  }
});
assert(readmeEmojiCount === 0, `README.md has 0 emojis (found ${readmeEmojiCount})`);

// 2. 3D Model Elements in HTML
console.log('\n2. Auditing 3D Keycap Section in Documents/index.html:');
assert(docsHtml.includes('id="keycap-3d"'), 'Contains section id="keycap-3d"');
assert(docsHtml.includes('id="keycap3dContainer"'), 'Contains viewport container id="keycap3dContainer"');
assert(docsHtml.includes('keycap3d-viewport'), 'Contains .keycap3d-viewport class');
assert(docsHtml.includes('keycap3d-toolbar'), 'Contains .keycap3d-toolbar controls');
assert(docsHtml.includes('btnExplodedView'), 'Contains #btnExplodedView control');
assert(docsHtml.includes('btnAutoRotate'), 'Contains #btnAutoRotate control');
assert(docsHtml.includes('btnWireframe'), 'Contains #btnWireframe control');
assert(docsHtml.includes('btnReset3DView'), 'Contains #btnReset3DView control');
assert(docsHtml.includes('btnPressTrigger'), 'Contains #btnPressTrigger control');
assert(docsHtml.includes('data-glyph="ក"'), 'Contains Khmer glyph button data-glyph="ក"');
assert(docsHtml.includes('data-theme="angkor"'), 'Contains theme button data-theme="angkor"');

// Script tags order
const threePos = docsHtml.indexOf('src="three.min.js');
const keycapPos = docsHtml.indexOf('src="keycap3d.js');
const docsJsPos = docsHtml.indexOf('src="docs.js');
assert(threePos !== -1, 'Script three.min.js is included');
assert(keycapPos !== -1, 'Script keycap3d.js is included');
assert(docsJsPos !== -1, 'Script docs.js is included');
assert(threePos < keycapPos, 'three.min.js loads BEFORE keycap3d.js');
assert(keycapPos < docsJsPos, 'keycap3d.js loads BEFORE docs.js');

// 3. Search Engine Markup & Elements
console.log('\n3. Auditing Search Bar Elements in Documents/index.html:');
assert(docsHtml.includes('id="docsSearchInput"'), 'Contains #docsSearchInput');
assert(docsHtml.includes('id="searchClearBtn"'), 'Contains #searchClearBtn');
assert(docsHtml.includes('id="searchResultsDropdown"'), 'Contains #searchResultsDropdown');
assert(docsHtml.includes('href="#keycap-3d"'), 'TOC contains link to #keycap-3d');

// 4. JavaScript Syntax Validation
console.log('\n4. Validating JavaScript Files Syntax:');
const threeCode = fs.readFileSync('Documents/three.min.js', 'utf8');
assert(threeCode.length > 500000, `three.min.js is substantial offline bundle (${Math.round(threeCode.length / 1024)} KB)`);

const keycapCode = fs.readFileSync('Documents/keycap3d.js', 'utf8');
let keycapSyntaxOk = true;
try {
  new vm.Script(keycapCode);
} catch (e) {
  keycapSyntaxOk = false;
  console.error('  Syntax error in keycap3d.js:', e);
}
assert(keycapSyntaxOk, 'Documents/keycap3d.js has valid JavaScript syntax');

const docsJsCode = fs.readFileSync('Documents/docs.js', 'utf8');
let docsJsSyntaxOk = true;
try {
  new vm.Script(docsJsCode);
} catch (e) {
  docsJsSyntaxOk = false;
  console.error('  Syntax error in docs.js:', e);
}
assert(docsJsSyntaxOk, 'Documents/docs.js has valid JavaScript syntax');

// 5. CSS Styles Verification
console.log('\n5. Auditing Stylesheets in Documents/docs.css:');
const docsCss = fs.readFileSync('Documents/docs.css', 'utf8');
assert(docsCss.includes('.keycap3d-viewport'), '.keycap3d-viewport styled in docs.css');
assert(docsCss.includes('.search-dropdown'), '.search-dropdown styled in docs.css');
assert(docsCss.includes('.search-clear-btn'), '.search-clear-btn styled in docs.css');
assert(docsCss.includes('.search-highlight'), '.search-highlight styled in docs.css');
assert(docsCss.includes('.search-pulse-glow'), '.search-pulse-glow animation styled in docs.css');

console.log(`\n========================================`);
console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
console.log(`========================================`);

if (failed > 0) {
  process.exit(1);
}
