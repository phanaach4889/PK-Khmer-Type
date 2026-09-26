const assert = require('assert');
const store = {};
global.localStorage = {
  getItem: (k) => store[k] !== undefined ? store[k] : null,
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; },
  clear: () => { for (const k in store) delete store[k]; }
};
global.window = global;

// Mock DOM environment for renderLetterStrip testing
class MockElement {
  constructor(tag) {
    this.tagName = tag;
    this.children = [];
    this.attributes = {};
    this.classList = new Set();
    this.className = '';
    this.innerHTML = '';
    this.textContent = '';
  }
  setAttribute(k, v) { this.attributes[k] = String(v); }
  getAttribute(k) { return this.attributes[k]; }
  appendChild(el) { this.children.push(el); }
  querySelector(sel) { return null; }
  querySelectorAll(sel) { return []; }
}
global.document = {
  createElement: (tag) => new MockElement(tag),
  getElementById: (id) => null
};

require('../data/adaptive-vocab.js');
const PK_ADAPTIVE = require('../js/adaptive.js');

console.log('Testing Phase 9/10 Strict 100% Completion Unlocking & UI Strip...');

// 1. Initial State: Initial 6 letters (E N I A R L) are active and start at 0% completion
{
  PK_ADAPTIVE.resetAdaptiveState('english');
  const s = PK_ADAPTIVE.loadAdaptiveState('english');
  assert.deepStrictEqual(s.unlockedUnits, ['e', 'n', 'i', 'a', 'r', 'l']);

  const eState = PK_ADAPTIVE.getUnitState('english', 'e');
  assert.strictEqual(eState.completion, 0);
  assert.strictEqual(eState.completedUnits, 0);
  assert.strictEqual(eState.targetUnits, 20);

  const tState = PK_ADAPTIVE.getUnitState('english', 't');
  assert.strictEqual(tState.isUnlocked, false);
  assert.strictEqual(tState.state, 'locked');
  console.log('  ✓ Test 1: Initial English letters start at 0% completion and T is locked');
}

// 2. Strict Rule 11: 95% completion (19/20) must NOT unlock next letter
{
  PK_ADAPTIVE.resetAdaptiveState('english');
  // Type 20 correct units for E, N, I, A, R (100% completion)
  ['e', 'n', 'i', 'a', 'r'].forEach(ch => {
    for (let i = 0; i < 20; i++) PK_ADAPTIVE.recordStroke('english', ch, true, 200);
    const st = PK_ADAPTIVE.getUnitState('english', ch);
    assert.strictEqual(st.completion, 100);
    assert.strictEqual(st.completedUnits, 20);
  });

  // Type 19 correct units for L (95% completion)
  for (let i = 0; i < 19; i++) PK_ADAPTIVE.recordStroke('english', 'l', true, 200);
  const lState = PK_ADAPTIVE.getUnitState('english', 'l');
  assert.strictEqual(lState.completion, 95);
  assert.strictEqual(lState.completedUnits, 19);

  // Check unlock
  const check = PK_ADAPTIVE.checkCanUnlockNext('english');
  assert.strictEqual(check.canUnlock, false, 'Letter T must NOT unlock when L is 95% complete!');
  assert(check.reason.includes('95%'));
  console.log('  ✓ Test 2: Rule 11 verified — 95% completion on L strictly prevents T from unlocking');
}

// 3. Strict Rule 12: 100% completion (20/20) MUST unlock next letter
{
  // Complete 20th stroke on L
  PK_ADAPTIVE.recordStroke('english', 'l', true, 200);
  const lState = PK_ADAPTIVE.getUnitState('english', 'l');
  assert.strictEqual(lState.completion, 100);
  assert.strictEqual(lState.completedUnits, 20);

  const check = PK_ADAPTIVE.checkCanUnlockNext('english');
  assert.strictEqual(check.canUnlock, true, 'Letter T MUST unlock when all active letters reach 100%!');
  assert.strictEqual(check.nextUnit, 't');

  const unlockRes = PK_ADAPTIVE.unlockNextLetter('english');
  assert.strictEqual(unlockRes.unlocked, true);
  assert.strictEqual(unlockRes.unit, 't');

  // Verify T is now unlocked and starts at 0% completion
  const tState = PK_ADAPTIVE.getUnitState('english', 't');
  assert.strictEqual(tState.isUnlocked, true);
  assert.strictEqual(tState.completion, 0);
  assert.strictEqual(tState.completedUnits, 0);

  // Verify O remains locked!
  const oState = PK_ADAPTIVE.getUnitState('english', 'o');
  assert.strictEqual(oState.isUnlocked, false);
  assert.strictEqual(oState.state, 'locked');
  console.log('  ✓ Test 3: Rule 12 verified — 100% completion unlocks T, which starts at 0% while O remains locked');
}

// 4. Strict Rule 13: Completion is separate from Accuracy; Mistakes do NOT decrement completion
{
  const lBefore = PK_ADAPTIVE.getUnitState('english', 'l');
  assert.strictEqual(lBefore.completion, 100);

  // Learner makes 5 mistakes on L
  for (let i = 0; i < 5; i++) {
    PK_ADAPTIVE.recordStroke('english', 'l', false, 350);
  }

  const lAfter = PK_ADAPTIVE.getUnitState('english', 'l');
  // Accuracy has dropped
  assert(lAfter.accuracy < 100, `Accuracy should decrease with mistakes (got ${lAfter.accuracy}%)`);
  // Completion MUST remain 100%!
  assert.strictEqual(lAfter.completion, 100, 'Mistakes must NOT reduce completion from 100%!');
  assert.strictEqual(lAfter.completedUnits, 20, 'Completed units must NOT decrement on mistake!');
  console.log(`  ✓ Test 4: Rule 13 verified — Completion remains 100% even as accuracy drops to ${lAfter.accuracy}%`);
}

// 5. State Sanitization: Incomplete letter relocks prematurely unlocked future letters
{
  // Simulate corrupt / premature state where 'o' is only 50% complete (10 units), but 's' was unlocked
  const corruptState = {
    version: '1.0.0',
    layoutId: 'english',
    stage: 4,
    unlockedUnits: ['e', 'n', 'i', 'a', 'r', 'l', 't', 'o', 's'],
    unitStats: {
      e: { completedUnits: 20, correct: 20, attempts: 20 },
      n: { completedUnits: 20, correct: 20, attempts: 20 },
      i: { completedUnits: 20, correct: 20, attempts: 20 },
      a: { completedUnits: 20, correct: 20, attempts: 20 },
      r: { completedUnits: 20, correct: 20, attempts: 20 },
      l: { completedUnits: 20, correct: 20, attempts: 20 },
      t: { completedUnits: 20, correct: 20, attempts: 20 },
      o: { completedUnits: 10, correct: 10, attempts: 12 }, // only 50% complete!
      s: { completedUnits: 5, correct: 5, attempts: 5 }
    }
  };

  PK_ADAPTIVE.sanitizeAdaptiveState('english', corruptState);
  assert.strictEqual(corruptState.unlockedUnits.includes('s'), false, 'Letter S MUST be relocked because O is only 50% complete!');
  assert.strictEqual(corruptState.unlockedUnits.includes('o'), true, 'Letter O must remain active');
  assert.strictEqual(corruptState.stage, 3, 'Stage must roll back to 3 (letter O)');
  console.log('  ✓ Test 5: State sanitization successfully relocks prematurely unlocked letters (S relocked until O hits 100%)');
}

// 6. Letter Strip Rendering: Stat displays completion percentage (100%, 50%, lock)
{
  const mockContainer = new MockElement('div');
  PK_ADAPTIVE.renderLetterStrip(mockContainer, 'english');
  assert(mockContainer.children.length >= 26);

  // First 6 pills (E, N, I, A, R, L) should show 100%
  for (let i = 0; i < 6; i++) {
    const pill = mockContainer.children[i];
    const stat = pill.children.find(c => c.className === 'as-pill-stat');
    assert.ok(stat, `Pill ${i} missing statSpan`);
    assert.strictEqual(stat.textContent, '100%');
  }

  // T pill should show 0% (unlocked but 0 units typed)
  const tPill = mockContainer.children[6];
  const tStat = tPill.children.find(c => c.className === 'as-pill-stat');
  assert.strictEqual(tStat.textContent, '0%');

  // Locked pills should contain lock icon
  const uPill = mockContainer.children[9]; // U is locked
  const uStat = uPill.children.find(c => c.className === 'as-pill-stat');
  assert(uStat.innerHTML.includes('svg') || uStat.textContent === '');
  console.log('  ✓ Test 6: Letter strip correctly renders 100% for completed, 0% for newly unlocked, and lock icon for locked');
}

// 7. Khmer NiDA progression strict unlock
{
  PK_ADAPTIVE.resetAdaptiveState('nida');
  const nidaProg = PK_ADAPTIVE.PROGRESSIONS.nida;
  const initialNida = PK_ADAPTIVE.INITIAL_ACTIVE_SETS.nida;

  // Complete all 10 initial units to 100%
  initialNida.forEach(u => {
    for (let i = 0; i < 20; i++) {
      PK_ADAPTIVE.recordStroke('nida', u, true, 250);
    }
  });

  const checkNida = PK_ADAPTIVE.checkCanUnlockNext('nida');
  assert.strictEqual(checkNida.canUnlock, true);
  assert.strictEqual(checkNida.nextUnit, nidaProg[initialNida.length]);
  console.log('  ✓ Test 7: Khmer NiDA layout strictly requires 100% completion across active units before advancing');
}

console.log('\n======================================================');
console.log('ALL STRICT 100% COMPLETION REGRESSION TESTS PASSED! (7/7)');
console.log('======================================================\n');
