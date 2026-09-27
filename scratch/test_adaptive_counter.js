// scratch/test_adaptive_counter.js
const assert = require('assert');

// Mock browser globals required by adaptive.js
const domElements = {};
function createMockElement(id) {
  return {
    id: id,
    textContent: '0',
    hidden: false,
    style: {},
    classList: {
      add: () => {},
      remove: () => {},
      contains: () => false
    },
    setAttribute: () => {},
    appendChild: () => {},
    innerHTML: '',
    getBoundingClientRect: () => ({ top: 0, left: 0, width: 100, height: 100 })
  };
}

const mockIds = [
  'adaptivePanel', 'manuscript', 'lessonPanel', 'adaptiveStageBadge',
  'adaptiveFocusBadge', 'adaptiveFocusWrap', 'adaptiveFocusVal',
  'adaptiveUnlockedCount', 'adaptiveLetterStrip', 'adaptiveCharRow',
  'adaptiveAccVal', 'adaptiveWpmVal', 'adaptiveStreakVal', 'adaptiveMistakesVal',
  'afhFocusChip', 'afhWeakChips', 'afhFingerGroup', 'afhFingerNote',
  'adaptiveRoundToast', 'adaptiveSidebarSub'
];

mockIds.forEach(id => {
  domElements[id] = createMockElement(id);
});

global.document = {
  getElementById: (id) => domElements[id] || null,
  querySelector: () => null,
  querySelectorAll: () => [],
  createElement: (tag) => createMockElement(tag),
  addEventListener: () => {},
  readyState: 'complete',
  documentElement: { scrollTop: 0 }
};

global.window = {
  adaptiveActive: false,
  addEventListener: () => {},
  scrollTo: () => {},
  pageYOffset: 0
};

const storage = {};
global.localStorage = {
  getItem: (k) => storage[k] || null,
  setItem: (k, v) => { storage[k] = String(v); },
  removeItem: (k) => { delete storage[k]; },
  clear: () => { Object.keys(storage).forEach(k => delete storage[k]); }
};

// Load PK_ADAPTIVE
const PK_ADAPTIVE = require('../js/adaptive.js');

console.log('Testing Adaptive Practice Performance Counter...\n');

// Helper to simulate typing a word in the active session
function typeWordCorrectly(word) {
  for (let i = 0; i < word.length; i++) {
    PK_ADAPTIVE.adaptiveHandleChar(word[i], null, null);
  }
}

function typeWordWithMistake(word, mistakeChar = 'z') {
  // Type first character wrong
  PK_ADAPTIVE.adaptiveHandleChar(mistakeChar, null, null);
  // Then type all correct characters of the word
  for (let i = 0; i < word.length; i++) {
    PK_ADAPTIVE.adaptiveHandleChar(word[i], null, null);
  }
}

// -------------------------------------------------------------
// Test 1: Start 0 -> Correct (+10) -> 10 -> Correct (+10) -> 20 -> Correct (+10) -> 30
// -------------------------------------------------------------
{
  console.log('Running Test 1: Start 0 -> Correct (+10) -> Correct (+10) -> Correct (+10)...');
  PK_ADAPTIVE.resetAdaptiveState('english');
  PK_ADAPTIVE.startAdaptiveSession('english', { initialCounter: 0 });

  const session = PK_ADAPTIVE.getActiveSession();
  assert(session, 'Active session should exist');
  assert.strictEqual(PK_ADAPTIVE.getCounter(), 0, 'Counter starts at 0');
  assert.strictEqual(domElements['adaptiveStreakVal'].textContent, 0, 'DOM displays 0');

  const words = session.drill.words;
  assert(words.length >= 3, 'Drill should have at least 3 words');

  // Word 1: Correct
  typeWordCorrectly(words[0]);
  assert.strictEqual(PK_ADAPTIVE.getCounter(), 10, 'After 1st correct word, counter must be 10');
  assert.strictEqual(domElements['adaptiveStreakVal'].textContent, 10, 'DOM must update immediately to 10');

  // Space between words
  PK_ADAPTIVE.adaptiveHandleChar(' ', null, null);
  assert.strictEqual(PK_ADAPTIVE.getCounter(), 10, 'Space does not change counter');

  // Word 2: Correct
  typeWordCorrectly(words[1]);
  assert.strictEqual(PK_ADAPTIVE.getCounter(), 20, 'After 2nd correct word, counter must be 20');
  assert.strictEqual(domElements['adaptiveStreakVal'].textContent, 20, 'DOM must update immediately to 20');

  // Space between words
  PK_ADAPTIVE.adaptiveHandleChar(' ', null, null);

  // Word 3: Correct
  typeWordCorrectly(words[2]);
  assert.strictEqual(PK_ADAPTIVE.getCounter(), 30, 'After 3rd correct word, counter must be 30');
  assert.strictEqual(domElements['adaptiveStreakVal'].textContent, 30, 'DOM must update immediately to 30');

  console.log('  ✓ Test 1 PASSED: 0 -> 10 -> 20 -> 30');
}

// -------------------------------------------------------------
// Test 2: Start 60 -> Wrong (-10) -> 50 -> Wrong (-10) -> 40 -> Wrong (-10) -> 30
// -------------------------------------------------------------
{
  console.log('\nRunning Test 2: Start 60 -> Wrong (-10) -> Wrong (-10) -> Wrong (-10)...');
  PK_ADAPTIVE.resetAdaptiveState('english');
  PK_ADAPTIVE.startAdaptiveSession('english', { initialCounter: 60 });

  const session = PK_ADAPTIVE.getActiveSession();
  assert.strictEqual(PK_ADAPTIVE.getCounter(), 60, 'Counter starts at 60');
  assert.strictEqual(domElements['adaptiveStreakVal'].textContent, 60, 'DOM displays 60');

  const words = session.drill.words;

  // Word 1: Wrong
  typeWordWithMistake(words[0]);
  assert.strictEqual(PK_ADAPTIVE.getCounter(), 50, 'After 1st wrong word, counter must be 50');
  assert.strictEqual(domElements['adaptiveStreakVal'].textContent, 50, 'DOM must update to 50');

  // Space
  PK_ADAPTIVE.adaptiveHandleChar(' ', null, null);

  // Word 2: Wrong
  typeWordWithMistake(words[1]);
  assert.strictEqual(PK_ADAPTIVE.getCounter(), 40, 'After 2nd wrong word, counter must be 40');
  assert.strictEqual(domElements['adaptiveStreakVal'].textContent, 40, 'DOM must update to 40');

  // Space
  PK_ADAPTIVE.adaptiveHandleChar(' ', null, null);

  // Word 3: Wrong
  typeWordWithMistake(words[2]);
  assert.strictEqual(PK_ADAPTIVE.getCounter(), 30, 'After 3rd wrong word, counter must be 30');
  assert.strictEqual(domElements['adaptiveStreakVal'].textContent, 30, 'DOM must update to 30');

  console.log('  ✓ Test 2 PASSED: 60 -> 50 -> 40 -> 30');
}

// -------------------------------------------------------------
// Test 3: Start 20 -> Wrong (-10) -> 10 -> Wrong (-10) -> 0 -> Wrong (-10) -> 0 (Lower Bound)
// -------------------------------------------------------------
{
  console.log('\nRunning Test 3: Start 20 -> Wrong (-10) -> 10 -> Wrong (-10) -> 0 -> Wrong (-10) -> 0...');
  PK_ADAPTIVE.resetAdaptiveState('english');
  PK_ADAPTIVE.startAdaptiveSession('english', { initialCounter: 20 });

  const session = PK_ADAPTIVE.getActiveSession();
  assert.strictEqual(PK_ADAPTIVE.getCounter(), 20, 'Counter starts at 20');

  const words = session.drill.words;

  // Word 1: Wrong -> 10
  typeWordWithMistake(words[0]);
  assert.strictEqual(PK_ADAPTIVE.getCounter(), 10, 'After 1st wrong word, counter must be 10');

  PK_ADAPTIVE.adaptiveHandleChar(' ', null, null);

  // Word 2: Wrong -> 0
  typeWordWithMistake(words[1]);
  assert.strictEqual(PK_ADAPTIVE.getCounter(), 0, 'After 2nd wrong word, counter must be 0');

  PK_ADAPTIVE.adaptiveHandleChar(' ', null, null);

  // Word 3: Wrong -> 0 (must not go below 0)
  typeWordWithMistake(words[2]);
  assert.strictEqual(PK_ADAPTIVE.getCounter(), 0, 'Counter must never go below 0 (Math.max(0, counter - 10))');
  assert.strictEqual(domElements['adaptiveStreakVal'].textContent, 0, 'DOM must display 0');

  console.log('  ✓ Test 3 PASSED: 20 -> 10 -> 0 -> 0 (Lower bound strictly enforced)');
}

// -------------------------------------------------------------
// Test 4: Start 0 -> Correct (+10) -> 10 -> Wrong (-10) -> 0 -> Correct (+10) -> 10
// -------------------------------------------------------------
{
  console.log('\nRunning Test 4: Start 0 -> Correct (+10) -> 10 -> Wrong (-10) -> 0 -> Correct (+10) -> 10...');
  PK_ADAPTIVE.resetAdaptiveState('english');
  PK_ADAPTIVE.startAdaptiveSession('english', { initialCounter: 0 });

  const session = PK_ADAPTIVE.getActiveSession();
  assert.strictEqual(PK_ADAPTIVE.getCounter(), 0, 'Counter starts at 0');

  const words = session.drill.words;

  // Word 1: Correct -> 10
  typeWordCorrectly(words[0]);
  assert.strictEqual(PK_ADAPTIVE.getCounter(), 10, 'After 1st correct word, counter must be 10');

  PK_ADAPTIVE.adaptiveHandleChar(' ', null, null);

  // Word 2: Wrong -> 0
  typeWordWithMistake(words[1]);
  assert.strictEqual(PK_ADAPTIVE.getCounter(), 0, 'After 2nd word (with mistake), counter must be 0');

  PK_ADAPTIVE.adaptiveHandleChar(' ', null, null);

  // Word 3: Correct -> 10
  typeWordCorrectly(words[2]);
  assert.strictEqual(PK_ADAPTIVE.getCounter(), 10, 'After 3rd correct word, counter must be 10');

  console.log('  ✓ Test 4 PASSED: 0 -> 10 -> 0 -> 10');
}

// -------------------------------------------------------------
// Test 5: No update on individual keystrokes (only upon word completion)
// -------------------------------------------------------------
{
  console.log('\nRunning Test 5: Verify counter does NOT change during individual keystrokes...');
  PK_ADAPTIVE.resetAdaptiveState('english');
  PK_ADAPTIVE.startAdaptiveSession('english', { initialCounter: 0 });

  const session = PK_ADAPTIVE.getActiveSession();
  const word = session.drill.words[0];
  assert(word.length >= 2, 'First word must have at least 2 characters');

  // Type characters before the last character
  for (let i = 0; i < word.length - 1; i++) {
    PK_ADAPTIVE.adaptiveHandleChar(word[i], null, null);
    assert.strictEqual(PK_ADAPTIVE.getCounter(), 0, `Counter must stay 0 after typing character ${i + 1} of ${word.length}`);
  }

  // Type the final character of the word
  PK_ADAPTIVE.adaptiveHandleChar(word[word.length - 1], null, null);
  assert.strictEqual(PK_ADAPTIVE.getCounter(), 10, 'Counter updates to 10 ONLY when the word is fully completed');

  console.log('  ✓ Test 5 PASSED: Individual keystrokes do not trigger counter changes');
}

// -------------------------------------------------------------
// Test 6: No top cap at 100 (can reach 110, 120, etc.)
// -------------------------------------------------------------
{
  console.log('\nRunning Test 6: Verify counter is NOT capped at 100...');
  PK_ADAPTIVE.resetAdaptiveState('english');
  PK_ADAPTIVE.startAdaptiveSession('english', { initialCounter: 90 });

  const session = PK_ADAPTIVE.getActiveSession();
  const words = session.drill.words;

  // Word 1: 90 -> 100
  typeWordCorrectly(words[0]);
  assert.strictEqual(PK_ADAPTIVE.getCounter(), 100, 'Counter reaches 100');

  PK_ADAPTIVE.adaptiveHandleChar(' ', null, null);

  // Word 2: 100 -> 110
  typeWordCorrectly(words[1]);
  assert.strictEqual(PK_ADAPTIVE.getCounter(), 110, 'Counter must exceed 100 without artificial cap (110)');

  PK_ADAPTIVE.adaptiveHandleChar(' ', null, null);

  // Word 3: 110 -> 120
  typeWordCorrectly(words[2]);
  assert.strictEqual(PK_ADAPTIVE.getCounter(), 120, 'Counter reaches 120');

  console.log('  ✓ Test 6 PASSED: Counter exceeds 100 without artificial capping (100 -> 110 -> 120)');
}

// -------------------------------------------------------------
// Test 7: Backspace reverts completed word score delta cleanly
// -------------------------------------------------------------
{
  console.log('\nRunning Test 7: Verify backspace into completed word reverts scoreDelta...');
  PK_ADAPTIVE.resetAdaptiveState('english');
  PK_ADAPTIVE.startAdaptiveSession('english', { initialCounter: 0 });

  const session = PK_ADAPTIVE.getActiveSession();
  const word = session.drill.words[0];

  typeWordCorrectly(word);
  assert.strictEqual(PK_ADAPTIVE.getCounter(), 10, 'Counter reached 10 on word completion');

  // Backspace into the completed word
  PK_ADAPTIVE.adaptiveHandleBackspace();
  assert.strictEqual(PK_ADAPTIVE.getCounter(), 0, 'Backspacing into completed word reverts counter back to 0');

  // Retype the last character
  PK_ADAPTIVE.adaptiveHandleChar(word[word.length - 1], null, null);
  assert.strictEqual(PK_ADAPTIVE.getCounter(), 10, 'Retyping completed word re-awards 10');

  console.log('  ✓ Test 7 PASSED: Backspace cleanly reverts completed word score');
}

// -------------------------------------------------------------
// Test 8: Isolation check — Strict Phase 9 unlock rule untouched
// -------------------------------------------------------------
{
  console.log('\nRunning Test 8: Verify counter is NOT connected to letter unlock or completion units...');
  PK_ADAPTIVE.resetAdaptiveState('english');
  const check = PK_ADAPTIVE.checkCanUnlockNext('english');
  assert.strictEqual(check.canUnlock, false, 'Unlocking is strictly governed by 100% letter completion, not counter');

  // High counter does not unlock letters
  PK_ADAPTIVE.setCounter(500);
  const checkAfter = PK_ADAPTIVE.checkCanUnlockNext('english');
  assert.strictEqual(checkAfter.canUnlock, false, 'Counter = 500 cannot unlock next letter');

  console.log('  ✓ Test 8 PASSED: Complete isolation from letter unlocking and completion');
}

console.log('\n================================================================');
console.log('ALL ADAPTIVE PERFORMANCE COUNTER TESTS PASSED! (8/8 SUITES)');
console.log('================================================================');
