const assert = require('assert');

const store = {};
global.localStorage = {
  getItem: (k) => store[k] !== undefined ? store[k] : null,
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; },
  clear: () => { for (const k in store) delete store[k]; }
};
global.window = global;

require('../data/adaptive-vocab.js');
const PK_ADAPTIVE = require('../js/adaptive.js');

console.log('Testing Reset Progress & Adaptive Practice Isolation...');

// 1. Verify that resetAdaptiveState() resets all layouts when called with no arguments
{
  store['pk_adaptive_state_v1'] = JSON.stringify({
    english: { stage: 6, unlockedUnits: ['e','n','i','a','r','l','t','o','s','u','d'] }
  });
  assert.ok(store['pk_adaptive_state_v1']);

  PK_ADAPTIVE.resetAdaptiveState();
  assert.strictEqual(store['pk_adaptive_state_v1'], undefined, 'Storage key must be cleared when resetting all');

  const s = PK_ADAPTIVE.loadAdaptiveState('english');
  assert.strictEqual(s.stage, 1, 'Stage must be 1');
  assert.deepStrictEqual(s.unlockedUnits, ['e', 'n', 'i', 'a', 'r', 'l'], 'Only initial 6 letters active');
  console.log('  ✓ Test 1: resetAdaptiveState() with no args wipes storage and resets to initial state');
}

// 2. Verify all initial letters start at 0% completion (0/20) and subsequent letters are LOCKED
{
  PK_ADAPTIVE.resetAdaptiveState('english');
  ['e', 'n', 'i', 'a', 'r', 'l'].forEach(ch => {
    const st = PK_ADAPTIVE.getUnitState('english', ch);
    assert.strictEqual(st.isUnlocked, true, `${ch} must be unlocked`);
    assert.strictEqual(st.completedUnits, 0, `${ch} must have 0 completed units`);
    assert.strictEqual(st.completion, 0, `${ch} must have 0% completion`);
  });

  ['t', 'o', 's', 'u', 'd', 'y', 'c'].forEach(ch => {
    const st = PK_ADAPTIVE.getUnitState('english', ch);
    assert.strictEqual(st.isUnlocked, false, `${ch} must be locked`);
    assert.strictEqual(st.state, 'locked', `${ch} state must be locked`);
    assert.strictEqual(st.completion, 0, `${ch} completion must be 0`);
  });
  console.log('  ✓ Test 2: All initial letters start at 0% (0/20), subsequent letters strictly LOCKED');
}

// 3. Verify typing WRONG does NOT increment completion percentage
{
  PK_ADAPTIVE.resetAdaptiveState('english');

  // Learner types 'e' wrong 10 times in a row
  for (let i = 0; i < 10; i++) {
    PK_ADAPTIVE.recordStroke('english', 'e', false, 300);
  }

  const eState = PK_ADAPTIVE.getUnitState('english', 'e');
  assert.strictEqual(eState.completedUnits, 0, 'Wrong typing must NOT increment completed units!');
  assert.strictEqual(eState.completion, 0, 'Wrong typing must keep completion at 0%!');
  assert.strictEqual(eState.accuracy, 0, 'Accuracy must be 0% due to all mistakes');
  assert.strictEqual(eState.mistakes, 10, 'Mistake count must be 10');
  assert.strictEqual(eState.state, 'weak', 'State must be weak (RED dot)');
  console.log('  ✓ Test 3: Typing wrong does NOT increase completion (stays at 0%), accuracy drops to 0%, marked weak (RED)');
}

// 4. Verify typing correctly advances completion, and typing wrong later does NOT decrement it
{
  // Learner types 'e' correctly 5 times (5/20 = 25%)
  for (let i = 0; i < 5; i++) {
    PK_ADAPTIVE.recordStroke('english', 'e', true, 200);
  }
  let eState = PK_ADAPTIVE.getUnitState('english', 'e');
  assert.strictEqual(eState.completedUnits, 5, 'Completed units must be 5');
  assert.strictEqual(eState.completion, 25, 'Completion must be 25% (5/20)');

  // Learner types 'e' wrong 5 more times
  for (let i = 0; i < 5; i++) {
    PK_ADAPTIVE.recordStroke('english', 'e', false, 350);
  }
  eState = PK_ADAPTIVE.getUnitState('english', 'e');
  assert.strictEqual(eState.completedUnits, 5, 'Mistakes must NOT decrement completed units');
  assert.strictEqual(eState.completion, 25, 'Completion must remain 25%');
  assert.strictEqual(eState.accuracy, 25, 'Accuracy is 5/20 = 25%');
  console.log('  ✓ Test 4: Correct strokes increment completion (25%), subsequent mistakes do not decrement completion');
}

// 5. Verify that next letter (T) unlocks ONLY when all 6 active letters reach 20/20 (100%)
{
  PK_ADAPTIVE.resetAdaptiveState('english');
  // Type 20 correct for E, N, I, A, R
  ['e', 'n', 'i', 'a', 'r'].forEach(ch => {
    for (let i = 0; i < 20; i++) PK_ADAPTIVE.recordStroke('english', ch, true, 200);
  });
  // Type 19 correct for L
  for (let i = 0; i < 19; i++) PK_ADAPTIVE.recordStroke('english', 'l', true, 200);

  let check = PK_ADAPTIVE.checkCanUnlockNext('english');
  assert.strictEqual(check.canUnlock, false, 'T must NOT unlock when L is at 19/20');

  // Type 20th stroke on L
  PK_ADAPTIVE.recordStroke('english', 'l', true, 200);
  check = PK_ADAPTIVE.checkCanUnlockNext('english');
  assert.strictEqual(check.canUnlock, true, 'T MUST unlock when all 6 letters are at 20/20 (100%)');
  assert.strictEqual(check.nextUnit, 't');

  const unlockRes = PK_ADAPTIVE.unlockNextLetter('english');
  assert.strictEqual(unlockRes.unlocked, true);
  assert.strictEqual(unlockRes.unit, 't');

  // T starts at 0% (0/20), O remains locked
  const tState = PK_ADAPTIVE.getUnitState('english', 't');
  assert.strictEqual(tState.isUnlocked, true);
  assert.strictEqual(tState.completedUnits, 0);
  assert.strictEqual(tState.completion, 0);

  const oState = PK_ADAPTIVE.getUnitState('english', 'o');
  assert.strictEqual(oState.isUnlocked, false);
  console.log('  ✓ Test 5: Next letter unlocks strictly at 100% (20/20), new letter starts at 0%, future letters remain locked');
}

console.log('\n================================================================');
console.log('ALL RESET PROGRESS & ADAPTIVE PRACTICE TESTS PASSED! (5/5)');
console.log('================================================================\n');
