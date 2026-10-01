const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('Testing Refresh & Navigation Persistence for English/Khmer Lessons...');

// In-memory mock localStorage
const store = {};
const mockLocalStorage = {
  getItem: (k) => store[k] !== undefined ? store[k] : null,
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; },
  clear: () => { Object.keys(store).forEach(k => delete store[k]); }
};

// Mock DOM
function createMockElement(id, tag = 'div') {
  return {
    id: id,
    tagName: tag.toUpperCase(),
    children: [],
    style: {},
    classList: {
      _classes: new Set(),
      add(c) { this._classes.add(c); },
      remove(c) { this._classes.delete(c); },
      contains(c) { return this._classes.has(c); },
      toggle(c, force) {
        if (force === undefined) {
          if (this._classes.has(c)) this._classes.delete(c); else this._classes.add(c);
        } else if (force) this._classes.add(c);
        else this._classes.delete(c);
      }
    },
    dataset: {},
    hidden: false,
    textContent: '',
    innerHTML: '',
    childNodes: [],
    replaceChildren(...kids) { this.children = Array.from(kids); },
    appendChild(child) { this.children.push(child); return child; },
    insertBefore(node, ref) { this.children.push(node); return node; },
    removeChild(node) { const i = this.children.indexOf(node); if(i>=0) this.children.splice(i,1); },
    parentNode: { insertBefore: () => {}, removeChild: () => {} },
    nextSibling: null,
    getBoundingClientRect: () => ({ top: 100, left: 100, width: 200, height: 50 }),
    scrollIntoView: () => {},
    setAttribute: () => {},
    removeAttribute: () => {},
    getAttribute: () => null,
    addEventListener: () => {},
    removeEventListener: () => {},
    querySelectorAll: (sel) => [],
    querySelector: (sel) => null
  };
}

const elements = {};
['layoutStrip', 'lessonStrip', 'lessonPanel', 'manuscript', 'manuscriptEl', 'boardWrap',
 'keyboard', 'handsOverlay', 'lessonTitle', 'lessonMetaBadge', 'lessonMetaBest',
 'lessonNewKeys', 'lessonProgressVal', 'lessonTotalVal', 'lessonProgressFill',
 'lessonCharRow', 'lessonAccVal', 'lessonMistakesVal', 'lessonLiveHint',
 'lessonTimerWrap', 'lessonTimerVal', 'output', 'guideLeftHand', 'guideRightHand',
 'guideSubscriptsSec', 'guideTypeSpaceKbd', 'guideCoengKeyWrap', 'guideCoengExample1',
 'guideCoengExample2', 'trialToggle', 'raceToggle', 'lessonUnavailableNote',
 'lessonExitBtn', 'gStatKeys', 'gStatAcc', 'gStatWpm', 'gStatMastery', 'sessionBar',
 'handsToggle', 'soundToggle', 'ambienceToggle', 'placeholder'
].forEach(id => {
  elements[id] = createMockElement(id);
});

// Setup pills in layoutStrip
const standardPill = createMockElement('p-std');
standardPill.dataset.layout = 'standard';
standardPill.classList.add('active');
const nidaPill = createMockElement('p-nida');
nidaPill.dataset.layout = 'nida';
const englishPill = createMockElement('p-en');
englishPill.dataset.layout = 'english';
elements.layoutStrip.children = [standardPill, nidaPill, englishPill];
elements.layoutStrip.querySelectorAll = (sel) => {
  if (sel.includes('.layout-pill')) return [standardPill, nidaPill, englishPill];
  return [];
};

const mockDocument = {
  activeElement: null,
  getElementById: (id) => elements[id] || null,
  querySelector: (sel) => null,
  querySelectorAll: (sel) => [],
  addEventListener: () => {},
  createElement: (tag) => createMockElement('', tag),
  createElementNS: (ns, tag) => createMockElement('', tag),
  createTextNode: (text) => ({ textContent: text }),
  createDocumentFragment: () => ({ children: [], appendChild(c) { this.children.push(c); } }),
  documentElement: { classList: { contains: () => false } }
};

function createBrowserEnvironment() {
  const env = {
    console: console,
    Date: Date,
    Math: Math,
    String: String,
    Array: Array,
    Object: Object,
    Set: Set,
    JSON: JSON,
    RegExp: RegExp,
    parseInt: parseInt,
    parseFloat: parseFloat,
    isNaN: isNaN,
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    setInterval: setInterval,
    clearInterval: clearInterval,
    localStorage: mockLocalStorage,
    document: mockDocument,
    addEventListener: () => {},
    removeEventListener: () => {},
    scrollTo: () => {},
    requestAnimationFrame: (cb) => cb(),
    pageYOffset: 0,
    recordKeystroke: () => {},
    window: null
  };
  env.window = env;
  env.global = env;
  const ctx = vm.createContext(env);

  function runFile(rel) {
    const code = fs.readFileSync(path.join(__dirname, rel), 'utf8');
    vm.runInContext(code, ctx, { filename: rel });
  }

  runFile('../js/icons.js');
  runFile('../data/curriculum-data.js');
  runFile('../js/typing.js');
  runFile('../js/keyboard.js');
  runFile('../js/progress.js');
  runFile('../js/lessons.js');

  return ctx;
}

// Initial Boot
let browser = createBrowserEnvironment();

// Test 1: User switches to English layout
console.log('  Testing 1: Switching to English layout persists to localStorage...');
browser.switchLayout('english');
assert.strictEqual(browser.currentLayoutId, 'english', 'currentLayoutId must be english');
assert.strictEqual(mockLocalStorage.getItem('pk_active_layout'), 'english', 'localStorage pk_active_layout must be english');
assert.strictEqual(englishPill.classList.contains('active'), true, 'English pill must be active');
assert.strictEqual(standardPill.classList.contains('active'), false, 'Standard pill must NOT be active');
console.log('  ✓ Test 1 Passed: Layout switched to English and persisted.');

// Test 2: User starts an English lesson
console.log('  Testing 2: Starting English lesson saves session in progress...');
const enLesson = browser.LESSONS.find(l => l.id === 'en-L00-01');
assert.ok(enLesson, 'en-L00-01 lesson must exist in LESSONS');
browser.startLesson('en-L00-01');
assert.strictEqual(browser.lessonActive, true, 'lessonActive must be true');
assert.strictEqual(browser.currentLesson.id, 'en-L00-01');
assert.strictEqual(browser.lessonIndex, 0);

const savedRaw = mockLocalStorage.getItem('pk_active_lesson_session');
assert.ok(savedRaw, 'Active session must be saved to localStorage upon startLesson');
const savedSession = JSON.parse(savedRaw);
assert.strictEqual(savedSession.layoutId, 'english');
assert.strictEqual(savedSession.lessonId, 'en-L00-01');
assert.strictEqual(savedSession.index, 0);
console.log('  ✓ Test 2 Passed: English lesson started and session registered.');

// Test 3: User types 7 characters
console.log('  Testing 3: Typing characters advances lessonIndex and updates session...');
for (let i = 0; i < 7; i++) {
  const expectedChar = browser.lessonChars[browser.lessonIndex];
  browser.lessonHandleChar(expectedChar, null, null);
}
assert.strictEqual(browser.lessonIndex, 7, 'lessonIndex must be 7 after typing 7 characters');
const sessionAfterTyping = JSON.parse(mockLocalStorage.getItem('pk_active_lesson_session'));
assert.strictEqual(sessionAfterTyping.index, 7, 'Session in localStorage must reflect index 7');
console.log('  ✓ Test 3 Passed: Keystroke position 7 saved into session.');

// Test 4: Simulate Page Refresh!
console.log('  Testing 4: Simulating page refresh and restoring exact lesson position...');
// Create fresh browser environment (simulating page reload)
browser = createBrowserEnvironment();

assert.strictEqual(browser.currentLayoutId, 'english', 'Fresh reload must automatically initialize currentLayoutId to english from session/storage');
assert.strictEqual(browser.lessonActive, true, 'lessonActive must be restored to true');
assert.ok(browser.currentLesson, 'currentLesson must not be null');
assert.strictEqual(browser.currentLesson.id, 'en-L00-01', 'currentLesson.id must remain en-L00-01');
assert.strictEqual(browser.lessonIndex, 7, 'lessonIndex must remain at 7, exactly where the user left off!');
assert.strictEqual(elements.lessonPanel.hidden, false, 'lessonPanel must be visible');
assert.strictEqual(elements.manuscript.hidden, true, 'manuscript must be hidden');
console.log('  ✓ Test 4 Passed: Page refreshed and position seamlessly remained at English lesson en-L01-01, index 7!');

// Test 5: Backspace support after reload
console.log('  Testing 5: Backspacing after reload drops index from 7 to 6 and updates session...');
browser.lessonHandleBackspace();
assert.strictEqual(browser.lessonIndex, 6, 'lessonIndex must drop to 6');
const sessionAfterBack = JSON.parse(mockLocalStorage.getItem('pk_active_lesson_session'));
assert.strictEqual(sessionAfterBack.index, 6, 'Session must update index to 6');
console.log('  ✓ Test 5 Passed: Backspace works and session updates.');

// Test 6: Exit lesson clears session
console.log('  Testing 6: Exiting lesson clears active session...');
browser.executeLessonExit();
assert.strictEqual(browser.lessonActive, false);
assert.strictEqual(mockLocalStorage.getItem('pk_active_lesson_session'), null, 'Active session must be null after exit');
assert.strictEqual(mockLocalStorage.getItem('pk_active_layout'), 'english', 'Layout remains english in storage');
console.log('  ✓ Test 6 Passed: Exiting lesson cleanly clears active session.');

// Test 7: Refresh after exit stays on English layout without active lesson
console.log('  Testing 7: Refresh after exit stays on English layout in ready state...');
browser = createBrowserEnvironment();
assert.strictEqual(browser.currentLayoutId, 'english', 'Layout remains english');
assert.strictEqual(browser.lessonActive, false, 'No lesson active');
console.log('  ✓ Test 7 Passed: Stays on English layout.');

console.log('\n======================================================');
console.log('ALL REFRESH & NAVIGATION PERSISTENCE TESTS PASSED! (7/7)');
console.log('======================================================');
