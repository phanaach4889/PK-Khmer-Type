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

// Helpers to simulate typing words in active session
function typeWordCorrectly(word) {
  for (let i = 0; i < word.length; i++) {
    PK_ADAPTIVE.adaptiveHandleChar(word[i], null, null);
  }
}

function typeWordWithMistake(word, mistakeChar = 'z') {
  // Wrong keystroke on first letter
  PK_ADAPTIVE.adaptiveHandleChar(mistakeChar, null, null);
  // Then type all correct characters of the word
  for (let i = 0; i < word.length; i++) {
    PK_ADAPTIVE.adaptiveHandleChar(word[i], null, null);
  }
}

// -------------------------------------------------------------
// Suite 1: Exact Sequence from Specification
// Start: 0
// Correct: 10
// Correct: 20
// Correct: 30
// Wrong: 20
// Wrong: 10
// Wrong: 0
// Wrong again: 0
// Then:
// Correct: 10
// Correct: 20
// Wrong: 10
// Correct: 20
// -------------------------------------------------------------
{
  console.log('Running Suite 1: Full 11-word Sequence from Specification...');
  PK_ADAPTIVE.resetAdaptiveState('english');
  PK_ADAPTIVE.startAdaptiveSession('english', { wordCount: 16 });

  const session = PK_ADAPTIVE.getActiveSession();
  assert(session, 'Active session should exist');
  assert.strictEqual(PK_ADAPTIVE.getCounter(), 0, 'Starting counter must be 0');
  assert.strictEqual(domElements['adaptiveStreakVal'].textContent, 0, 'DOM must display 0');

  const words = session.drill.words;
  assert(words.length >= 11, 'Drill should have at least 11 words');

  // Word 1: Correct -> 10
  typeWordCorrectly(words[0]);
  assert.strictEqual(PK_ADAPTIVE.getCounter(), 10, 'W1 Correct: counter must be 10');
  assert.strictEqual(domElements['adaptiveStreakVal'].textContent, 10, 'DOM must display 10');
  PK_ADAPTIVE.adaptiveHandleChar(' ', null, null); // space

  // Word 2: Correct -> 20
  typeWordCorrectly(words[1]);
  assert.strictEqual(PK_ADAPTIVE.getCounter(), 20, 'W2 Correct: counter must be 20');
  assert.strictEqual(domElements['adaptiveStreakVal'].textContent, 20, 'DOM must display 20');
  PK_ADAPTIVE.adaptiveHandleChar(' ', null, null);

  // Word 3: Correct -> 30
  typeWordCorrectly(words[2]);
  assert.strictEqual(PK_ADAPTIVE.getCounter(), 30, 'W3 Correct: counter must be 30');
  assert.strictEqual(domElements['adaptiveStreakVal'].textContent, 30, 'DOM must display 30');
  PK_ADAPTIVE.adaptiveHandleChar(' ', null, null);

  // Word 4: Wrong -> 20
  typeWordWithMistake(words[3]);
  assert.strictEqual(PK_ADAPTIVE.getCounter(), 20, 'W4 Wrong: counter must be 20');
  assert.strictEqual(domElements['adaptiveStreakVal'].textContent, 20, 'DOM must display 20');
  PK_ADAPTIVE.adaptiveHandleChar(' ', null, null);

  // Word 5: Wrong -> 10
  typeWordWithMistake(words[4]);
  assert.strictEqual(PK_ADAPTIVE.getCounter(), 10, 'W5 Wrong: counter must be 10');
  assert.strictEqual(domElements['adaptiveStreakVal'].textContent, 10, 'DOM must display 10');
  PK_ADAPTIVE.adaptiveHandleChar(' ', null, null);

  // Word 6: Wrong -> 0
  typeWordWithMistake(words[5]);
  assert.strictEqual(PK_ADAPTIVE.getCounter(), 0, 'W6 Wrong: counter must be 0');
  assert.strictEqual(domElements['adaptiveStreakVal'].textContent, 0, 'DOM must display 0');
  PK_ADAPTIVE.adaptiveHandleChar(' ', null, null);

  // Word 7: Wrong again -> 0 (lower bound)
  typeWordWithMistake(words[6]);
  assert.strictEqual(PK_ADAPTIVE.getCounter(), 0, 'W7 Wrong again: counter must remain 0');
  assert.strictEqual(domElements['adaptiveStreakVal'].textContent, 0, 'DOM must display 0');
  PK_ADAPTIVE.adaptiveHandleChar(' ', null, null);

  // Word 8: Correct -> 10
  typeWordCorrectly(words[7]);
  assert.strictEqual(PK_ADAPTIVE.getCounter(), 10, 'W8 Correct: counter must be 10');
  assert.strictEqual(domElements['adaptiveStreakVal'].textContent, 10, 'DOM must display 10');
  PK_ADAPTIVE.adaptiveHandleChar(' ', null, null);

  // Word 9: Correct -> 20
  typeWordCorrectly(words[8]);
  assert.strictEqual(PK_ADAPTIVE.getCounter(), 20, 'W9 Correct: counter must be 20');
  assert.strictEqual(domElements['adaptiveStreakVal'].textContent, 20, 'DOM must display 20');
  PK_ADAPTIVE.adaptiveHandleChar(' ', null, null);

  // Word 10: Wrong -> 10
  typeWordWithMistake(words[9]);
  assert.strictEqual(PK_ADAPTIVE.getCounter(), 10, 'W10 Wrong: counter must be 10');
  assert.strictEqual(domElements['adaptiveStreakVal'].textContent, 10, 'DOM must display 10');
  PK_ADAPTIVE.adaptiveHandleChar(' ', null, null);

  // Word 11: Correct -> 20
  typeWordCorrectly(words[10]);
  assert.strictEqual(PK_ADAPTIVE.getCounter(), 20, 'W11 Correct: counter must be 20');
  assert.strictEqual(domElements['adaptiveStreakVal'].textContent, 20, 'DOM must display 20');

  console.log('  ✓ Suite 1 PASSED: 0 -> 10 -> 20 -> 30 -> 20 -> 10 -> 0 -> 0 -> 10 -> 20 -> 10 -> 20 verified');
}

// -------------------------------------------------------------
// Suite 2: Edge Case 1 — Multiple Keystrokes (h, he, hel, hell, hello)
// -------------------------------------------------------------
{
  console.log('\nRunning Suite 2: Edge Case 1 — Multiple keystrokes do NOT increment counter 5 times...');
  PK_ADAPTIVE.resetAdaptiveState('english');
  PK_ADAPTIVE.startAdaptiveSession('english');

  const session = PK_ADAPTIVE.getActiveSession();
  const word = session.drill.words[0];
  assert(word.length >= 3, 'Word has at least 3 characters');

  // Type characters before the last character
  for (let i = 0; i < word.length - 1; i++) {
    PK_ADAPTIVE.adaptiveHandleChar(word[i], null, null);
    assert.strictEqual(PK_ADAPTIVE.getCounter(), 0, `Counter must be 0 after keystroke ${i + 1} (${word.slice(0, i + 1)})`);
    assert.strictEqual(domElements['adaptiveStreakVal'].textContent, 0, 'DOM remains 0');
  }

  // Type the final character of the word
  PK_ADAPTIVE.adaptiveHandleChar(word[word.length - 1], null, null);
  assert.strictEqual(PK_ADAPTIVE.getCounter(), 10, 'Counter updates to 10 ONLY when the word is fully completed');
  assert.strictEqual(domElements['adaptiveStreakVal'].textContent, 10, 'DOM updates to 10');

  console.log('  ✓ Suite 2 PASSED: Counter changes only on word evaluation, not individual keystrokes');
}

// -------------------------------------------------------------
// Suite 3: Edge Case 2 — One Word, Exactly One Update (No Duplicate +10 +10)
// -------------------------------------------------------------
{
  console.log('\nRunning Suite 3: Edge Case 2 — One word triggers exactly one counter update...');
  PK_ADAPTIVE.resetAdaptiveState('english');
  PK_ADAPTIVE.startAdaptiveSession('english');

  const session = PK_ADAPTIVE.getActiveSession();
  const word = session.drill.words[0];

  typeWordCorrectly(word);
  assert.strictEqual(PK_ADAPTIVE.getCounter(), 10, 'Word 1 completion produces exactly +10');

  // Space between words does not produce another +10
  PK_ADAPTIVE.adaptiveHandleChar(' ', null, null);
  assert.strictEqual(PK_ADAPTIVE.getCounter(), 10, 'Space delimiter does NOT update counter');
  assert.strictEqual(domElements['adaptiveStreakVal'].textContent, 10, 'DOM remains 10');

  console.log('  ✓ Suite 3 PASSED: Exactly one counter update per completed word');
}

// -------------------------------------------------------------
// Suite 4: Edge Case 3 — Minimum Boundary (Never Goes Negative)
// -------------------------------------------------------------
{
  console.log('\nRunning Suite 4: Edge Case 3 — Minimum boundary strictly enforced at 0...');
  PK_ADAPTIVE.resetAdaptiveState('english');
  PK_ADAPTIVE.startAdaptiveSession('english');

  const session = PK_ADAPTIVE.getActiveSession();
  const words = session.drill.words;

  // Counter is 0. Type 3 wrong words in a row.
  typeWordWithMistake(words[0]);
  assert.strictEqual(PK_ADAPTIVE.getCounter(), 0, '0 - 10 must floor at 0');
  PK_ADAPTIVE.adaptiveHandleChar(' ', null, null);

  typeWordWithMistake(words[1]);
  assert.strictEqual(PK_ADAPTIVE.getCounter(), 0, '0 - 10 must floor at 0');
  PK_ADAPTIVE.adaptiveHandleChar(' ', null, null);

  typeWordWithMistake(words[2]);
  assert.strictEqual(PK_ADAPTIVE.getCounter(), 0, '0 - 10 must floor at 0');

  console.log('  ✓ Suite 4 PASSED: Counter never drops below 0');
}

// -------------------------------------------------------------
// Suite 5: Edge Case 4 — Correct / Wrong Alternation
// -------------------------------------------------------------
{
  console.log('\nRunning Suite 5: Edge Case 4 — Correct/wrong alternation (0 -> 10 -> 0 -> 10 -> 0)...');
  PK_ADAPTIVE.resetAdaptiveState('english');
  PK_ADAPTIVE.startAdaptiveSession('english');

  const session = PK_ADAPTIVE.getActiveSession();
  const words = session.drill.words;

  // Correct -> 10
  typeWordCorrectly(words[0]);
  assert.strictEqual(PK_ADAPTIVE.getCounter(), 10, 'Correct -> 10');
  PK_ADAPTIVE.adaptiveHandleChar(' ', null, null);

  // Wrong -> 0
  typeWordWithMistake(words[1]);
  assert.strictEqual(PK_ADAPTIVE.getCounter(), 0, 'Wrong -> 0');
  PK_ADAPTIVE.adaptiveHandleChar(' ', null, null);

  // Correct -> 10
  typeWordCorrectly(words[2]);
  assert.strictEqual(PK_ADAPTIVE.getCounter(), 10, 'Correct -> 10');
  PK_ADAPTIVE.adaptiveHandleChar(' ', null, null);

  // Wrong -> 0
  typeWordWithMistake(words[3]);
  assert.strictEqual(PK_ADAPTIVE.getCounter(), 0, 'Wrong -> 0');

  console.log('  ✓ Suite 5 PASSED: 0 -> 10 -> 0 -> 10 -> 0 alternation verified');
}

// -------------------------------------------------------------
// Suite 6: Edge Case 5 — UI Synchronization
// -------------------------------------------------------------
{
  console.log('\nRunning Suite 6: Edge Case 5 — State and UI synchronization...');
  PK_ADAPTIVE.resetAdaptiveState('english');
  PK_ADAPTIVE.startAdaptiveSession('english');

  const session = PK_ADAPTIVE.getActiveSession();
  const words = session.drill.words;

  typeWordCorrectly(words[0]);
  assert.strictEqual(PK_ADAPTIVE.getCounter(), 10);
  assert.strictEqual(domElements['adaptiveStreakVal'].textContent, 10, 'UI matches state at 10');

  PK_ADAPTIVE.adaptiveHandleChar(' ', null, null);
  typeWordCorrectly(words[1]);
  assert.strictEqual(PK_ADAPTIVE.getCounter(), 20);
  assert.strictEqual(domElements['adaptiveStreakVal'].textContent, 20, 'UI matches state at 20');

  PK_ADAPTIVE.adaptiveHandleChar(' ', null, null);
  typeWordWithMistake(words[2]);
  assert.strictEqual(PK_ADAPTIVE.getCounter(), 10);
  assert.strictEqual(domElements['adaptiveStreakVal'].textContent, 10, 'UI matches state at 10');

  console.log('  ✓ Suite 6 PASSED: Internal counter state and rendered DOM element are 100% in sync');
}

// -------------------------------------------------------------
// Suite 7: Edge Case 6 — Persistence & Reset
// -------------------------------------------------------------
{
  console.log('\nRunning Suite 7: Edge Case 6 — Session isolation and clean reset...');
  PK_ADAPTIVE.resetAdaptiveState('english');
  PK_ADAPTIVE.startAdaptiveSession('english');

  const words = PK_ADAPTIVE.getActiveSession().drill.words;
  typeWordCorrectly(words[0]);
  assert.strictEqual(PK_ADAPTIVE.getCounter(), 10);

  // Starting a new session resets the temporary counter to 0
  PK_ADAPTIVE.startAdaptiveSession('english');
  assert.strictEqual(PK_ADAPTIVE.getCounter(), 0, 'New session must start with counter = 0');
  assert.strictEqual(domElements['adaptiveStreakVal'].textContent, 0, 'UI resets to 0');

  console.log('  ✓ Suite 7 PASSED: New session cleanly resets counter to 0');
}

// -------------------------------------------------------------
// Suite 8: Edge Case 7 — Keyboard Switching Isolation
// -------------------------------------------------------------
{
  console.log('\nRunning Suite 8: Edge Case 7 — Switching layouts English -> Khmer NiDA -> English...');
  PK_ADAPTIVE.resetAdaptiveState('english');
  PK_ADAPTIVE.resetAdaptiveState('nida');

  // Start English
  PK_ADAPTIVE.startAdaptiveSession('english');
  assert.strictEqual(PK_ADAPTIVE.getCounter(), 0);
  const enWords = PK_ADAPTIVE.getActiveSession().drill.words;
  typeWordCorrectly(enWords[0]);
  assert.strictEqual(PK_ADAPTIVE.getCounter(), 10, 'English word complete -> 10');

  // Switch to Khmer NiDA
  PK_ADAPTIVE.exitSession();
  PK_ADAPTIVE.startAdaptiveSession('nida');
  assert.strictEqual(PK_ADAPTIVE.getCounter(), 0, 'NiDA session starts at 0');

  const nidaWords = PK_ADAPTIVE.getActiveSession().drill.words;
  typeWordCorrectly(nidaWords[0]);
  assert.strictEqual(PK_ADAPTIVE.getCounter(), 10, 'NiDA word complete -> 10');

  // Switch back to English
  PK_ADAPTIVE.exitSession();
  PK_ADAPTIVE.startAdaptiveSession('english');
  assert.strictEqual(PK_ADAPTIVE.getCounter(), 0, 'English fresh session starts at 0');
  const enWords2 = PK_ADAPTIVE.getActiveSession().drill.words;
  typeWordCorrectly(enWords2[0]);
  assert.strictEqual(PK_ADAPTIVE.getCounter(), 10, 'Word 1 -> 10 (no duplicate callbacks or double increments)');

  console.log('  ✓ Suite 8 PASSED: Keyboard switching maintains 100% session isolation with zero duplicate handlers');
}

// -------------------------------------------------------------
// Suite 9: Backspace Reverts Completed Word Score Delta
// -------------------------------------------------------------
{
  console.log('\nRunning Suite 9: Backspace cleanly reverts completed word score delta...');
  PK_ADAPTIVE.resetAdaptiveState('english');
  PK_ADAPTIVE.startAdaptiveSession('english');

  const word = PK_ADAPTIVE.getActiveSession().drill.words[0];
  typeWordCorrectly(word);
  assert.strictEqual(PK_ADAPTIVE.getCounter(), 10, 'Counter is 10 on completion');

  // Backspace into completed word
  PK_ADAPTIVE.adaptiveHandleBackspace();
  assert.strictEqual(PK_ADAPTIVE.getCounter(), 0, 'Backspacing into completed word reverts counter to 0');
  assert.strictEqual(domElements['adaptiveStreakVal'].textContent, 0, 'DOM reverts to 0');

  // Retype the final character
  PK_ADAPTIVE.adaptiveHandleChar(word[word.length - 1], null, null);
  assert.strictEqual(PK_ADAPTIVE.getCounter(), 10, 'Retyping completed word re-awards 10');

  console.log('  ✓ Suite 9 PASSED: Backspace cleanly reverts score delta');
}

// -------------------------------------------------------------
// Suite 10: Strict 100% Letter Unlock Isolation
// -------------------------------------------------------------
{
  console.log('\nRunning Suite 10: Isolation check — Strict Phase 9 unlock rule untouched...');
  PK_ADAPTIVE.resetAdaptiveState('english');
  const check = PK_ADAPTIVE.checkCanUnlockNext('english');
  assert.strictEqual(check.canUnlock, false, 'Unlocking is strictly governed by 100% letter completion, not counter');

  PK_ADAPTIVE.setCounter(500);
  const checkAfter = PK_ADAPTIVE.checkCanUnlockNext('english');
  assert.strictEqual(checkAfter.canUnlock, false, 'Counter = 500 cannot unlock next letter');

  console.log('  ✓ Suite 10 PASSED: Complete isolation from letter unlocking and completion');
}

console.log('\n================================================================');
console.log('ALL ADAPTIVE PERFORMANCE COUNTER TESTS PASSED! (10/10 SUITES)');
console.log('================================================================');
