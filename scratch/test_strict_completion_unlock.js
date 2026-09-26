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

// 8. Explicit Test Suite for Edge Cases 1 through 6
console.log('Testing Explicit Edge Cases 1 through 6 from specification...');

// Edge Case 1: [20/20, 20/20, 20/20, 20/20, 20/20, 19/20] -> LOCKED
{
  PK_ADAPTIVE.resetAdaptiveState('english');
  const s = PK_ADAPTIVE.loadAdaptiveState('english');
  s.unlockedUnits = ['e', 'n', 'i', 'a', 'r', 'l'];
  s.unitStats = {
    e: { completedUnits: 20, correct: 20, attempts: 20 },
    n: { completedUnits: 20, correct: 20, attempts: 20 },
    i: { completedUnits: 20, correct: 20, attempts: 20 },
    a: { completedUnits: 20, correct: 20, attempts: 20 },
    r: { completedUnits: 20, correct: 20, attempts: 20 },
    l: { completedUnits: 19, correct: 19, attempts: 19 } // 19/20 = 95%
  };
  PK_ADAPTIVE.saveAdaptiveState('english', s);

  const check = PK_ADAPTIVE.checkCanUnlockNext('english');
  assert.strictEqual(check.canUnlock, false, 'Edge Case 1 must be LOCKED (19/20 on L)');
  console.log('  ✓ Edge Case 1 PASSED: [20/20, 20/20, 20/20, 20/20, 20/20, 19/20] -> LOCKED');
}

// Edge Case 2: [20/20, 20/20, 20/20, 20/20, 20/20, 20/20] -> UNLOCK NEXT LETTER
{
  PK_ADAPTIVE.resetAdaptiveState('english');
  const s = PK_ADAPTIVE.loadAdaptiveState('english');
  s.unlockedUnits = ['e', 'n', 'i', 'a', 'r', 'l'];
  s.unitStats = {
    e: { completedUnits: 20, correct: 20, attempts: 20 },
    n: { completedUnits: 20, correct: 20, attempts: 20 },
    i: { completedUnits: 20, correct: 20, attempts: 20 },
    a: { completedUnits: 20, correct: 20, attempts: 20 },
    r: { completedUnits: 20, correct: 20, attempts: 20 },
    l: { completedUnits: 20, correct: 20, attempts: 20 }
  };
  PK_ADAPTIVE.saveAdaptiveState('english', s);

  const check = PK_ADAPTIVE.checkCanUnlockNext('english');
  assert.strictEqual(check.canUnlock, true, 'Edge Case 2 MUST unlock next letter');
  assert.strictEqual(check.nextUnit, 't');
  console.log('  ✓ Edge Case 2 PASSED: [20/20, 20/20, 20/20, 20/20, 20/20, 20/20] -> UNLOCK NEXT LETTER (T)');
}

// Edge Case 3: One letter has: 100% completion, 50% accuracy -> COMPLETE (Accuracy must NOT prevent unlocking)
{
  PK_ADAPTIVE.resetAdaptiveState('english');
  const s = PK_ADAPTIVE.loadAdaptiveState('english');
  s.unlockedUnits = ['e', 'n', 'i', 'a', 'r', 'l'];
  s.unitStats = {
    e: { completedUnits: 20, correct: 20, attempts: 40, mistakes: 20 }, // 50% accuracy, 20/20 complete
    n: { completedUnits: 20, correct: 20, attempts: 20, mistakes: 0 },
    i: { completedUnits: 20, correct: 20, attempts: 20, mistakes: 0 },
    a: { completedUnits: 20, correct: 20, attempts: 20, mistakes: 0 },
    r: { completedUnits: 20, correct: 20, attempts: 20, mistakes: 0 },
    l: { completedUnits: 20, correct: 20, attempts: 20, mistakes: 0 }
  };
  PK_ADAPTIVE.saveAdaptiveState('english', s);

  const eState = PK_ADAPTIVE.getUnitState('english', 'e');
  assert.strictEqual(eState.completion, 100);
  assert.strictEqual(eState.accuracy, 50);

  const check = PK_ADAPTIVE.checkCanUnlockNext('english');
  assert.strictEqual(check.canUnlock, true, 'Edge Case 3: 50% accuracy must NOT block unlocking when completion is 100%');
  console.log('  ✓ Edge Case 3 PASSED: 100% completion with 50% accuracy -> COMPLETE (unlocks T)');
}

// Edge Case 4: One letter has: 99% completion, 100% accuracy -> LOCKED
{
  PK_ADAPTIVE.resetAdaptiveState('english');
  const s = PK_ADAPTIVE.loadAdaptiveState('english');
  s.unlockedUnits = ['e', 'n', 'i', 'a', 'r', 'l'];
  s.unitStats = {
    e: { completion: 99, accuracy: 100, completedUnits: 19 }, // 99% completion, 100% accuracy
    n: { completedUnits: 20, correct: 20, attempts: 20, mistakes: 0 },
    i: { completedUnits: 20, correct: 20, attempts: 20, mistakes: 0 },
    a: { completedUnits: 20, correct: 20, attempts: 20, mistakes: 0 },
    r: { completedUnits: 20, correct: 20, attempts: 20, mistakes: 0 },
    l: { completedUnits: 20, correct: 20, attempts: 20, mistakes: 0 }
  };
  PK_ADAPTIVE.saveAdaptiveState('english', s);

  const eState = PK_ADAPTIVE.getUnitState('english', 'e');
  assert.strictEqual(eState.completion, 99);

  const check = PK_ADAPTIVE.checkCanUnlockNext('english');
  assert.strictEqual(check.canUnlock, false, 'Edge Case 4: 99% completion with 100% accuracy must remain LOCKED');
  console.log('  ✓ Edge Case 4 PASSED: 99% completion, 100% accuracy -> LOCKED');
}

// Edge Case 5: One letter has: 95% completion, 99% accuracy -> LOCKED
{
  PK_ADAPTIVE.resetAdaptiveState('english');
  const s = PK_ADAPTIVE.loadAdaptiveState('english');
  s.unlockedUnits = ['e', 'n', 'i', 'a', 'r', 'l'];
  s.unitStats = {
    e: { completedUnits: 19, correct: 99, attempts: 100, mistakes: 1 }, // 95% completion (19/20), 99% accuracy
    n: { completedUnits: 20, correct: 20, attempts: 20, mistakes: 0 },
    i: { completedUnits: 20, correct: 20, attempts: 20, mistakes: 0 },
    a: { completedUnits: 20, correct: 20, attempts: 20, mistakes: 0 },
    r: { completedUnits: 20, correct: 20, attempts: 20, mistakes: 0 },
    l: { completedUnits: 20, correct: 20, attempts: 20, mistakes: 0 }
  };
  PK_ADAPTIVE.saveAdaptiveState('english', s);

  const eState = PK_ADAPTIVE.getUnitState('english', 'e');
  assert.strictEqual(eState.completion, 95);
  assert.strictEqual(eState.accuracy, 99);

  const check = PK_ADAPTIVE.checkCanUnlockNext('english');
  assert.strictEqual(check.canUnlock, false, 'Edge Case 5: 95% completion with 99% accuracy must remain LOCKED');
  console.log('  ✓ Edge Case 5 PASSED: 95% completion, 99% accuracy -> LOCKED');
}

// Edge Case 6: One letter has: 100% completion, but poor accuracy -> COMPLETE
{
  PK_ADAPTIVE.resetAdaptiveState('english');
  const s = PK_ADAPTIVE.loadAdaptiveState('english');
  s.unlockedUnits = ['e', 'n', 'i', 'a', 'r', 'l'];
  s.unitStats = {
    e: { completedUnits: 20, correct: 20, attempts: 100, mistakes: 80 }, // 20% accuracy (poor), 100% completion
    n: { completedUnits: 20, correct: 20, attempts: 20, mistakes: 0 },
    i: { completedUnits: 20, correct: 20, attempts: 20, mistakes: 0 },
    a: { completedUnits: 20, correct: 20, attempts: 20, mistakes: 0 },
    r: { completedUnits: 20, correct: 20, attempts: 20, mistakes: 0 },
    l: { completedUnits: 20, correct: 20, attempts: 20, mistakes: 0 }
  };
  PK_ADAPTIVE.saveAdaptiveState('english', s);

  const eState = PK_ADAPTIVE.getUnitState('english', 'e');
  assert.strictEqual(eState.completion, 100);
  assert.strictEqual(eState.accuracy, 20);

  const check = PK_ADAPTIVE.checkCanUnlockNext('english');
  assert.strictEqual(check.canUnlock, true, 'Edge Case 6: 100% completion with poor accuracy must UNLOCK next letter');
  console.log('  ✓ Edge Case 6 PASSED: 100% completion with poor accuracy -> COMPLETE (unlocks T)');
}

// 9. Every active letter checked individually: Incomplete letter at EACH position blocks unlock
console.log('Testing each active letter individually as sole incomplete letter...');
{
  const activeLetters = ['e', 'n', 'i', 'a', 'r', 'l'];
  for (let idx = 0; idx < activeLetters.length; idx++) {
    PK_ADAPTIVE.resetAdaptiveState('english');
    const s = PK_ADAPTIVE.loadAdaptiveState('english');
    s.unlockedUnits = activeLetters.slice();
    s.unitStats = {};
    activeLetters.forEach((ch, i) => {
      s.unitStats[ch] = {
        completedUnits: i === idx ? 19 : 20, // idx is at 19/20 (95%), all others at 20/20 (100%)
        correct: i === idx ? 19 : 20,
        attempts: i === idx ? 19 : 20
      };
    });
    PK_ADAPTIVE.saveAdaptiveState('english', s);

    const check = PK_ADAPTIVE.checkCanUnlockNext('english');
    assert.strictEqual(check.canUnlock, false, `Letter at index ${idx} (${activeLetters[idx].toUpperCase()}) must block unlocking when at 19/20`);
    assert(check.reason.includes(activeLetters[idx].toUpperCase()));
  }
  console.log('  ✓ All 6 active letter positions individually verified: ANY letter < 100% blocks unlock');
}

// 10. Isolation from Phase 7 Standard Lesson Progress: Newly unlocked letter starts at 0/20 (0%)
console.log('Testing isolation from Phase 7 standard lesson progress...');
{
  global.PK_PROGRESS = {
    getAllCharsProgress: () => ({
      t: { attempts: 200, incorrect: 0, avgResponseTimeMs: 150 } // Standard lessons has 200 attempts on T
    })
  };

  PK_ADAPTIVE.resetAdaptiveState('english');
  const s = PK_ADAPTIVE.loadAdaptiveState('english');
  ['e', 'n', 'i', 'a', 'r', 'l'].forEach(ch => {
    s.unitStats[ch] = { completedUnits: 20, correct: 20, attempts: 20 };
  });
  PK_ADAPTIVE.saveAdaptiveState('english', s);

  // All 6 letters are at 100%, unlock T
  const unlockRes = PK_ADAPTIVE.unlockNextLetter('english');
  assert.strictEqual(unlockRes.unlocked, true);
  assert.strictEqual(unlockRes.unit, 't');

  // Verify T starts at 0/20 and 0% completion despite P7 having 200 attempts!
  const tState = PK_ADAPTIVE.getUnitState('english', 't');
  assert.strictEqual(tState.completedUnits, 0, 'Newly unlocked letter T must start with completedUnits = 0');
  assert.strictEqual(tState.completion, 0, 'Newly unlocked letter T must start at 0% completion');

  // Verify letter O is strictly locked because T is at 0/20
  const checkNext = PK_ADAPTIVE.checkCanUnlockNext('english');
  assert.strictEqual(checkNext.canUnlock, false, 'Letter O must remain locked because T is at 0% completion');
  console.log('  ✓ Phase 7 progress isolation verified: Newly unlocked T starts at 0/20 (0%), O remains locked');
}

console.log('\n================================================================');
console.log('ALL STRICT 100% COMPLETION REGRESSION TESTS PASSED! (10/10 SUITES)');
console.log('================================================================\n');

