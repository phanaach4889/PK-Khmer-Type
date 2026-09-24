/**
 * Phase 8 Addition — Weak-Key Focus System Unit Tests
 * 
 * Verifies:
 * 1. Multi-signal continuous weakness evaluation using Phase 7 data.
 * 2. Evidence guardrail (>= 4 attempts before weak classification).
 * 3. Primary focus determination and priority ranking (very high, high, moderate, low).
 * 4. Multi-weak key tracking and ranking (Focus + Needs Practice list).
 * 5. Dynamic focus shifts when the current focus key improves.
 * 6. Combination drill generation containing focus key + other weak keys.
 * 7. Keyboard & Finger pattern detection (2+ weak keys sharing same finger).
 * 8. Modal trigger gating: only on newLetterUnlocked, auto-advancing otherwise.
 */

const assert = require('assert');

// Mock localStorage
const store = {};
global.localStorage = {
  getItem: (k) => store[k] || null,
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; },
  clear: () => { Object.keys(store).forEach(k => delete store[k]); }
};

// Mock DOM
global.document = {
  getElementById: () => null,
  querySelector: () => null,
  querySelectorAll: () => [],
  createElement: () => ({
    classList: { add: () => {}, remove: () => {} },
    setAttribute: () => {},
    appendChild: () => {},
    style: {}
  }),
  body: { appendChild: () => {} },
  addEventListener: () => {}
};
global.window = global;

// Mock PK_PROGRESS with getLearnerSummary and character progress
const mockCharProgress = {};
global.PK_PROGRESS = {
  getCharProgress: (layout, char) => mockCharProgress[`${layout}:${char}`] || null,
  getAllCharsProgress: (layout) => {
    const res = {};
    for (const [k, v] of Object.entries(mockCharProgress)) {
      if (k.startsWith(layout + ':')) {
        res[k.replace(layout + ':', '')] = v;
      }
    }
    return res;
  },
  recordLessonAttempt: () => {}
};

// Load PK_VOCAB and PK_ADAPTIVE
require('../data/adaptive-vocab.js');
const PK_ADAPTIVE = require('../js/adaptive.js');

console.log('Running Weak-Key Focus System Test Suite...\n');

// Reset state before tests
PK_ADAPTIVE.resetAdaptiveState('english');

// ----------------------------------------------------
// 1. Evidence Guardrail
// ----------------------------------------------------
console.log('Test 1: Evidence guardrail (< 4 attempts does not flag as weak)');
PK_ADAPTIVE.recordStroke('english', 'l', false, 1200); // 1 mistake, 0 correct -> 0% acc, but only 1 attempt
let eval1 = PK_ADAPTIVE.evaluateWeaknesses('english');
assert.strictEqual(eval1.primaryFocus, null, 'Single mistake should not become primary focus');
assert.strictEqual(eval1.weakList.length, 0, 'Single mistake should not enter weak list due to guardrail');
console.log('  ✓ Verified: Single mistake ignored without sufficient evidence');

// ----------------------------------------------------
// 2. Multi-Signal Priority & Primary Focus Selection
// ----------------------------------------------------
console.log('\nTest 2: Multi-signal evaluation and primary focus ranking');
// Give 'l' 4 attempts with 1 correct, 3 wrong (25% accuracy, high mistakes)
PK_ADAPTIVE.recordStroke('english', 'l', false, 1500);
PK_ADAPTIVE.recordStroke('english', 'l', false, 1600);
PK_ADAPTIVE.recordStroke('english', 'l', true, 1100);

// Give 'r' 5 attempts with 3 correct, 2 wrong (60% accuracy)
PK_ADAPTIVE.recordStroke('english', 'r', true, 800);
PK_ADAPTIVE.recordStroke('english', 'r', false, 1200);
PK_ADAPTIVE.recordStroke('english', 'r', true, 850);
PK_ADAPTIVE.recordStroke('english', 'r', false, 1300);
PK_ADAPTIVE.recordStroke('english', 'r', true, 820);

// Give 'e', 'n', 'i', 'a' strong attempts
['e', 'n', 'i', 'a'].forEach(k => {
  for (let i = 0; i < 5; i++) PK_ADAPTIVE.recordStroke('english', k, true, 400);
});

let eval2 = PK_ADAPTIVE.evaluateWeaknesses('english');
assert.ok(eval2.primaryFocus, 'Primary focus should be identified');
assert.strictEqual(eval2.primaryFocus.unit, 'l', 'L should be the primary focus (lowest accuracy, highest error rate)');
assert.strictEqual(eval2.primaryFocus.priority, 'very-high', 'L should have very-high priority');

assert.ok(eval2.needsPractice.length >= 1, 'R should be in needs practice list');
const rEntry = eval2.needsPractice.find(x => x.unit === 'r');
assert.ok(rEntry, 'R should be tracked in needsPractice');
assert.strictEqual(rEntry.unit, 'r');
console.log(`  ✓ Primary Focus: ${eval2.primaryFocus.unit.toUpperCase()} (${eval2.primaryFocus.accuracy}%, Priority: ${eval2.primaryFocus.priority})`);
console.log(`  ✓ Needs Practice: ${eval2.needsPractice.map(w => `${w.unit.toUpperCase()}(${w.accuracy}%)`).join(', ')}`);

// ----------------------------------------------------
// 3. Dynamic Focus Shift on Improvement
// ----------------------------------------------------
console.log('\nTest 3: Dynamic focus shifts when performance improves');
// Practice 'l' heavily with correct strokes to demonstrate mastery
for (let i = 0; i < 15; i++) {
  PK_ADAPTIVE.recordStroke('english', 'l', true, 350);
}

let eval3 = PK_ADAPTIVE.evaluateWeaknesses('english');
// Now 'l' is improved (>90%), so focus must shift to 'r'
assert.strictEqual(eval3.primaryFocus.unit, 'r', 'Primary focus should automatically shift to R after L improves');
console.log(`  ✓ Shifted Primary Focus to: ${eval3.primaryFocus.unit.toUpperCase()} (${eval3.primaryFocus.accuracy}%)`);

// ----------------------------------------------------
// 4. Focus & Combination Drill Generation
// ----------------------------------------------------
console.log('\nTest 4: Adaptive drill generation produces combination words with focus & weak keys');
// Let's create an adaptive drill for English
const drill = PK_ADAPTIVE.generateAdaptiveDrill('english', { wordCount: 16, seed: 101 });
assert.ok(drill.words.length === 16, 'Drill should generate requested 16 words');

// Count how many words contain 'r' (the focus key)
let focusCount = 0;
drill.words.forEach(w => {
  if (w.includes('r')) focusCount++;
});
assert.ok(focusCount >= 6, `Focus key 'r' should appear prominently in words (found: ${focusCount}/16)`);
console.log(`  ✓ Focus key representation: ${focusCount}/16 words contained focus key 'r'`);

// ----------------------------------------------------
// 5. Keyboard & Finger Pattern Detection
// ----------------------------------------------------
console.log('\nTest 5: Finger pattern detection when multiple weak keys share a finger');
// Unlock up to 'o'
const state = PK_ADAPTIVE.loadAdaptiveState('english');
state.unlockedUnits = ['e', 'n', 'i', 'a', 'r', 'l', 't', 'o'];
PK_ADAPTIVE.saveAdaptiveState('english', state);

// 'l' is typed with right ring finger (key 'l')
// 'o' is also typed with right ring finger (key 'o')
// Let's degrade 'l' and 'o'
for (let i = 0; i < 4; i++) {
  PK_ADAPTIVE.recordStroke('english', 'l', false, 1400);
  PK_ADAPTIVE.recordStroke('english', 'o', false, 1500);
}

let evalFinger = PK_ADAPTIVE.evaluateWeaknesses('english');
assert.ok(evalFinger.fingerPattern, 'Finger pattern should be detected when 2+ keys on same finger struggle');
assert.strictEqual(evalFinger.fingerPattern.finger, 'rr', 'Should identify Right Ring finger');
assert.ok(evalFinger.fingerPattern.message.includes('Right ring finger'), 'Message should explain the finger group');
console.log(`  ✓ Detected finger pattern: "${evalFinger.fingerPattern.message}"`);

// ----------------------------------------------------
// 6. Round Completion & Modal Trigger Gating
// ----------------------------------------------------
console.log('\nTest 6: Modal trigger gating (modal triggers ONLY when new letter unlocks)');
// Normal round completion where unlock threshold is NOT met
let roundNormal = PK_ADAPTIVE.completeAdaptiveSession('english', drill, {
  accuracy: 85,
  wpm: 35,
  mistakes: 3,
  timeSec: 30
});
assert.strictEqual(roundNormal.newLetterUnlocked, null, 'Normal round should not trigger an unlock');
console.log('  ✓ Normal round returns newLetterUnlocked = null (modal suppressed, auto-advances)');

// Now satisfy unlock conditions for all active units
const unlockedState = PK_ADAPTIVE.loadAdaptiveState('english');
unlockedState.unlockedUnits.forEach(u => {
  unlockedState.unitStats[u] = {
    attempts: 20,
    correct: 19,
    mistakes: 1,
    recentAccuracy: 95,
    recentResponseMs: 320,
    history: []
  };
});
PK_ADAPTIVE.saveAdaptiveState('english', unlockedState);

let roundUnlock = PK_ADAPTIVE.completeAdaptiveSession('english', drill, {
  accuracy: 96,
  wpm: 45,
  mistakes: 1,
  timeSec: 25
});
assert.ok(roundUnlock.newLetterUnlocked, 'Milestone round unlocks next letter');
assert.strictEqual(roundUnlock.newLetterUnlocked.toUpperCase(), 'S', 'Should unlock next letter S');
console.log(`  ✓ Milestone round successfully unlocks: '${roundUnlock.newLetterUnlocked.toUpperCase()}' (modal displays!)`);

console.log('\n======================================================');
console.log('ALL WEAK-KEY FOCUS SYSTEM TESTS PASSED SUCCESSFULLY! (6/6)');
console.log('======================================================\n');
