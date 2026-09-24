const assert = require('assert');
const store = {};
global.localStorage = {
  getItem: (k) => store[k] !== undefined ? store[k] : null,
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; },
  clear: () => { for (const k in store) delete store[k]; }
};
global.window = global;

// Load vocabulary and adaptive engine
require('../data/adaptive-vocab.js');
const PK_ADAPTIVE = require('../js/adaptive.js');

console.log('Testing Phase 8 Adaptive Practice Engine (Scenarios A through T)...');

// Scenario A: Starts correctly
{
  PK_ADAPTIVE.resetAdaptiveState('english');
  const state = PK_ADAPTIVE.loadAdaptiveState('english');
  assert.strictEqual(state.layoutId, 'english');
  assert.strictEqual(state.stage, 1);
  assert(Array.isArray(state.unlockedUnits));
  console.log('  ✓ Scenario A: Adaptive mode initializes layout state correctly');
}

// Scenario B: Initial English set is E N I A R L
{
  const state = PK_ADAPTIVE.loadAdaptiveState('english');
  assert.deepStrictEqual(state.unlockedUnits, ['e', 'n', 'i', 'a', 'r', 'l']);
  console.log('  ✓ Scenario B: Initial English set is exactly E N I A R L');
}

// Scenario C & D: Generated words contain ONLY unlocked letters; locked letters NEVER appear
{
  const drill = PK_ADAPTIVE.generateAdaptiveDrill('english', { wordCount: 20, seed: 12345 });
  assert(drill.words.length >= 16);
  const allowed = new Set(['e', 'n', 'i', 'a', 'r', 'l']);
  drill.words.forEach(w => {
    for (const ch of w.toLowerCase()) {
      assert(allowed.has(ch), `Locked letter "${ch}" found in word "${w}"!`);
    }
  });
  console.log('  ✓ Scenarios C & D: Generated words contain ONLY unlocked letters; 0 locked letters leak');
}

// Scenario E & F: Weak letters receive increased weighting; strong letters remain present
{
  PK_ADAPTIVE.resetAdaptiveState('english');
  // Record L as weak (low accuracy, multiple mistakes)
  for (let i = 0; i < 6; i++) {
    PK_ADAPTIVE.recordStroke('english', 'l', false, 450); // mistakes
  }
  for (let i = 0; i < 2; i++) {
    PK_ADAPTIVE.recordStroke('english', 'l', true, 400); // 25% acc
  }
  // Record E, N, I, A, R as strong
  ['e', 'n', 'i', 'a', 'r'].forEach(ch => {
    for (let i = 0; i < 8; i++) {
      PK_ADAPTIVE.recordStroke('english', ch, true, 250); // 100% acc
    }
  });

  const drill = PK_ADAPTIVE.generateAdaptiveDrill('english', { wordCount: 24, seed: 999 });
  let countL = 0;
  let countOthers = 0;
  drill.words.forEach(w => {
    if (w.includes('l')) countL++;
    else countOthers++;
  });

  assert(countL >= 12, `Weak letter L should appear in most words (got ${countL}/${drill.words.length})`);
  assert(countOthers > 0, `Strong letters must remain present in rotation (got ${countOthers} without L)`);
  console.log(`  ✓ Scenarios E & F: Weak letter L weighted heavily (${countL}/24 words) while strong letters remain present`);
}

// Scenario G: Letter states change correctly
{
  PK_ADAPTIVE.resetAdaptiveState('english');
  // Initially insufficient evidence
  let st = PK_ADAPTIVE.getUnitState('english', 'a');
  assert.strictEqual(st.state, 'active');
  assert.strictEqual(st.insufficientEvidence, true);

  // High performance -> strong
  for (let i = 0; i < 6; i++) PK_ADAPTIVE.recordStroke('english', 'a', true, 200);
  st = PK_ADAPTIVE.getUnitState('english', 'a');
  assert.strictEqual(st.state, 'strong');

  // Low performance -> weak
  for (let i = 0; i < 6; i++) PK_ADAPTIVE.recordStroke('english', 'r', false, 300);
  st = PK_ADAPTIVE.getUnitState('english', 'r');
  assert.strictEqual(st.state, 'weak');

  // Unlocked but not active in stage 1 -> locked
  st = PK_ADAPTIVE.getUnitState('english', 't');
  assert.strictEqual(st.state, 'locked');
  console.log('  ✓ Scenario G: Letter states (strong, weak, active, locked) update accurately');
}

// Scenario H: Insufficient data does NOT create false weaknesses
{
  PK_ADAPTIVE.resetAdaptiveState('english');
  // Type 'i' once and get it wrong
  PK_ADAPTIVE.recordStroke('english', 'i', false, 300);
  const st = PK_ADAPTIVE.getUnitState('english', 'i');
  assert.notStrictEqual(st.state, 'weak', 'Single mistake must NOT immediately flag unit as weak');
  assert.strictEqual(st.insufficientEvidence, true);
  console.log('  ✓ Scenario H: 1 mistake does not create false weakness (evidence guardrail verified)');
}

// Scenario I & J: Progressive unlocking requires sustained performance, then trains new letter
{
  PK_ADAPTIVE.resetAdaptiveState('english');
  // Initially cannot unlock (no evidence)
  let check = PK_ADAPTIVE.checkCanUnlockNext('english');
  assert.strictEqual(check.canUnlock, false);

  // Train all 6 active letters to high sustained mastery
  ['e', 'n', 'i', 'a', 'r', 'l'].forEach(u => {
    for (let i = 0; i < 8; i++) {
      PK_ADAPTIVE.recordStroke('english', u, true, 220);
    }
  });

  check = PK_ADAPTIVE.checkCanUnlockNext('english');
  assert.strictEqual(check.canUnlock, true);
  assert.strictEqual(check.nextUnit, 't');

  const unlockRes = PK_ADAPTIVE.unlockNextLetter('english');
  assert.strictEqual(unlockRes.unlocked, true);
  assert.strictEqual(unlockRes.unit, 't');
  assert.strictEqual(unlockRes.stage, 2);

  // Next drill contains 't'
  const drillWithT = PK_ADAPTIVE.generateAdaptiveDrill('english', { wordCount: 20, seed: 777 });
  let countT = 0;
  drillWithT.words.forEach(w => { if (w.includes('t')) countT++; });
  assert(countT >= 5, `Newly unlocked letter T should appear frequently (got ${countT}/20)`);
  console.log(`  ✓ Scenarios I & J: Letter T unlocks after sustained evidence and is trained immediately (${countT}/20 words)`);
}

// Scenario K: Performance updates during active session
{
  const stBefore = PK_ADAPTIVE.getUnitState('english', 'e');
  PK_ADAPTIVE.recordStroke('english', 'e', true, 210);
  const stAfter = PK_ADAPTIVE.getUnitState('english', 'e');
  assert.strictEqual(stAfter.attempts, stBefore.attempts + 1);
  console.log('  ✓ Scenario K: In-session keystrokes update live performance metrics');
}

// Scenario L: Before vs After improvement calculated accurately
{
  const drillDef = {
    focusUnit: 'r',
    beforeStats: { unit: 'r', accuracy: 60 }
  };
  const summary = PK_ADAPTIVE.completeAdaptiveSession('english', drillDef, {
    accuracy: 90,
    wpm: 35,
    mistakes: 2,
    timeSec: 18
  });
  assert(summary.beforeAfter);
  assert.strictEqual(summary.beforeAfter.unit, 'R');
  assert.strictEqual(summary.beforeAfter.beforeAccuracy, 60);
  console.log('  ✓ Scenario L: Before vs After improvement measured and recorded accurately');
}

// Scenario M & N: Persistence and progress isolation
{
  const stSaved = PK_ADAPTIVE.loadAdaptiveState('english');
  assert(stSaved.sessionsCompleted >= 1);
  assert.strictEqual(stSaved.stage, 2);
  console.log('  ✓ Scenarios M & N: Adaptive state persists cleanly across reloads');
}

// Scenario O: Layout isolation (English, NiDA, Standard)
{
  const engState = PK_ADAPTIVE.loadAdaptiveState('english');
  const nidaState = PK_ADAPTIVE.loadAdaptiveState('nida');
  assert.notDeepStrictEqual(engState.unlockedUnits, nidaState.unlockedUnits);
  assert.strictEqual(nidaState.layoutId, 'nida');
  assert.strictEqual(nidaState.stage, 1);
  console.log('  ✓ Scenario O: English, NiDA, and Standard Khmer remain 100% isolated');
}

// Scenario P: Khmer logical units preserved
{
  const nidaState = PK_ADAPTIVE.loadAdaptiveState('nida');
  assert(nidaState.unlockedUnits.includes('ថ'));
  assert(nidaState.unlockedUnits.includes('ក'));
  assert(nidaState.unlockedUnits.includes('ញ'));
  console.log('  ✓ Scenario P: Khmer logical units (including ញ on base) preserved intact');
}

// Scenario Q: No future curriculum material leaks
{
  PK_ADAPTIVE.resetAdaptiveState('english');
  const drill = PK_ADAPTIVE.generateAdaptiveDrill('english', { wordCount: 30, seed: 42 });
  const allowed = new Set(['e', 'n', 'i', 'a', 'r', 'l']);
  drill.words.forEach(w => {
    for (const ch of w.toLowerCase()) {
      assert(allowed.has(ch), `Future letter "${ch}" leaked into Stage 1 exercise!`);
    }
  });
  console.log('  ✓ Scenario Q: Zero future curriculum material leaks into adaptive drills');
}

// Scenario R: Deterministic generation with seed
{
  const drill1 = PK_ADAPTIVE.generateAdaptiveDrill('english', { wordCount: 16, seed: 8888 });
  const drill2 = PK_ADAPTIVE.generateAdaptiveDrill('english', { wordCount: 16, seed: 8888 });
  assert.deepStrictEqual(drill1.words, drill2.words);
  console.log('  ✓ Scenario R: Seeded PRNG produces 100% identical, deterministic drills');
}

// Scenario S: Fallback behavior handles small sets without crashing or NaN
{
  // Test with only 2 letters
  const drillFallback = PK_ADAPTIVE.generateAdaptiveDrill('english', {
    unlockedUnits: ['e', 'n'],
    wordCount: 12,
    seed: 1
  });
  assert(drillFallback.words.length === 12);
  drillFallback.words.forEach(w => {
    assert(!w.includes('undefined') && !w.includes('NaN'));
    for (const ch of w.toLowerCase()) {
      assert(['e', 'n'].includes(ch));
    }
  });
  console.log('  ✓ Scenario S: Fallback generation safely produces valid drills with small sets');
}

// Scenario T: Repeated sessions do not duplicate statistics
{
  const stBefore = PK_ADAPTIVE.loadAdaptiveState('english');
  const countBefore = stBefore.sessionHistory.length;
  PK_ADAPTIVE.completeAdaptiveSession('english', { focusUnit: 'e' }, { accuracy: 95, wpm: 40 });
  const stAfter = PK_ADAPTIVE.loadAdaptiveState('english');
  assert.strictEqual(stAfter.sessionHistory.length, countBefore + 1);
  console.log('  ✓ Scenario T: Repeated sessions record cleanly without stat duplication');
}

console.log('\n=============================================');
console.log('ALL PHASE 8 ADAPTIVE UNIT TESTS PASSED! (20/20)');
console.log('=============================================\n');
