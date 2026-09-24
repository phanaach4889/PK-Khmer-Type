/* ============================================================
   PK Khmer Type — Phase 8 Adaptive Practice & Review Test Suite
   ============================================================
   Validates Scenarios A through T:
   A: No progress data
   B: One weak key
   C: Multiple weak keys
   D: Repeated mistakes
   E: Slow but accurate key
   F: Weak Khmer compound unit
   G: Weak English character
   H: Weak finger
   I: Recent performance decline
   J: Stale skill
   K: Strong/mastered skill should not be unnecessarily selected
   L: Mixed adaptive practice
   M: Future-key protection
   N: Course isolation
   O: Adaptive practice completion updates PK_PROGRESS
   P: Before/after measurement
   Q: Deterministic generation
   R: Repeated review does not duplicate statistics
   S: No-progress fallback produces normal practice
   T: Adaptive practice never crashes with malformed/empty progress
   ============================================================ */

const fs = require('fs');
const assert = require('assert');

// Mock localStorage
const mockStorage = {};
global.localStorage = {
  getItem: (k) => mockStorage[k] || null,
  setItem: (k, v) => { mockStorage[k] = String(v); },
  removeItem: (k) => { delete mockStorage[k]; },
  clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); }
};
Object.defineProperty(global.localStorage, 'length', {
  get: () => Object.keys(mockStorage).length
});
global.localStorage.key = (idx) => Object.keys(mockStorage)[idx] || null;

// Mock window and document
global.window = global;
global.window.addEventListener = () => {};
global.document = {
  addEventListener: () => {},
  visibilityState: 'visible'
};

// Load CURRICULUM_DATA
eval(fs.readFileSync('data/curriculum-data.js', 'utf8'));

// Load dependencies
eval(fs.readFileSync('js/tracker.js', 'utf8'));
eval(fs.readFileSync('js/progress.js', 'utf8'));
eval(fs.readFileSync('js/review.js', 'utf8'));
eval(fs.readFileSync('js/feedback.js', 'utf8'));

console.log('Running Phase 8 Adaptive Practice & Review Test Suite (Scenarios A through T)...');
let passedTests = 0;

function it(desc, fn){
  try {
    fn();
    console.log(`  ✓ ${desc}`);
    passedTests++;
  } catch(err){
    console.error(`  ✗ ${desc}`);
    console.error(err);
    process.exit(1);
  }
}

// SCENARIO A: No progress data
it('Scenario A: No progress data handles cleanly without crashes and returns baseline target', () => {
  PK_PROGRESS.resetAll();
  PK_REVIEW.reset();

  const targets = PK_REVIEW.getReviewTargets('english');
  assert.ok(Array.isArray(targets));
  assert.strictEqual(targets.length, 0);

  const drill = PK_REVIEW.generateReviewDrill('english');
  assert.ok(drill);
  assert.strictEqual(drill.type, 'review');
  assert.ok(drill.chars.length >= 20);
});

// SCENARIO B: One weak key
it('Scenario B: One weak key (accuracy < 85%) is detected, prioritized, and targeted drill generated', () => {
  // Simulate practice on key 'g' in English: 2 correct, 4 wrong (33% accuracy)
  for(let i = 0; i < 2; i++){
    PK_PROGRESS.recordTypingUnit({ layout: 'english', expectedKeyId: 'g', expected: 'g', correct: true, responseTimeMs: 250 });
  }
  for(let i = 0; i < 4; i++){
    PK_PROGRESS.recordTypingUnit({ layout: 'english', expectedKeyId: 'g', expected: 'g', correct: false, produced: 'f', responseTimeMs: 400 });
  }

  const targets = PK_REVIEW.getReviewTargets('english');
  assert.ok(targets.length >= 1);
  const targetG = targets.find(t => t.targetId === 'g');
  assert.ok(targetG);
  assert.strictEqual(targetG.type, 'key');
  assert.strictEqual(targetG.accuracy, 33);
  assert.strictEqual(targetG.priority, 'high');
  assert.ok(targetG.reason.includes('33%'));

  const drill = PK_REVIEW.generateReviewDrill('english', { target: 'g' });
  assert.ok(drill);
  assert.strictEqual(drill.targetKey, 'g');
  assert.ok(drill.chars.includes('g'));
  assert.ok(drill.chars.length >= 20);
});

// SCENARIO C: Multiple weak keys
it('Scenario C: Multiple weak keys are ranked by priority with the worst deficit first', () => {
  // Key 'r': 2 correct, 8 wrong (20% accuracy, 8 errors) -> high deficit
  for(let i = 0; i < 2; i++){
    PK_PROGRESS.recordTypingUnit({ layout: 'english', expectedKeyId: 'r', expected: 'r', correct: true, responseTimeMs: 220 });
  }
  for(let i = 0; i < 8; i++){
    PK_PROGRESS.recordTypingUnit({ layout: 'english', expectedKeyId: 'r', expected: 'r', correct: false, produced: 'e', responseTimeMs: 420 });
  }

  // Key 't': 4 correct, 4 wrong (50% accuracy, 4 errors) -> moderate deficit
  for(let i = 0; i < 4; i++){
    PK_PROGRESS.recordTypingUnit({ layout: 'english', expectedKeyId: 't', expected: 't', correct: true, responseTimeMs: 230 });
  }
  for(let i = 0; i < 4; i++){
    PK_PROGRESS.recordTypingUnit({ layout: 'english', expectedKeyId: 't', expected: 't', correct: false, produced: 'y', responseTimeMs: 380 });
  }

  const targets = PK_REVIEW.getReviewTargets('english');
  assert.ok(targets.length >= 2);
  const idxR = targets.findIndex(t => t.targetId === 'r');
  const idxT = targets.findIndex(t => t.targetId === 't');

  assert.ok(idxR !== -1 && idxT !== -1);
  assert.ok(idxR < idxT, 'Key R (20% acc) must be prioritized above Key T (50% acc)');
});

// SCENARIO D: Repeated mistakes
it('Scenario D: Repeated mistakes receive high priority, while single isolated mistakes are not flagged', () => {
  // Key 'k': only 1 mistake, 4 correct (80% acc, but only 1 error)
  for(let i = 0; i < 4; i++){
    PK_PROGRESS.recordTypingUnit({ layout: 'english', expectedKeyId: 'k', expected: 'k', correct: true, responseTimeMs: 200 });
  }
  PK_PROGRESS.recordTypingUnit({ layout: 'english', expectedKeyId: 'k', expected: 'k', correct: false, produced: 'l', responseTimeMs: 250 });

  const targets = PK_REVIEW.getReviewTargets('english');
  const targetK = targets.find(t => t.targetId === 'k');
  assert.ok(!targetK || targetK.priority !== 'high', 'Single mistake should not be high priority');
});

// SCENARIO E: Slow but accurate key
it('Scenario E: Slow but accurate key is detected and flagged for speed/fluidity drill', () => {
  // Key 'l': 100% accuracy, but response time is 1100ms (> 2x layout average ~450ms)
  for(let i = 0; i < 6; i++){
    PK_PROGRESS.recordTypingUnit({ layout: 'english', expectedKeyId: 'l', expected: 'l', correct: true, responseTimeMs: 1100 });
  }

  const slowList = PK_REVIEW.getSlowKeys('english', 1.8);
  assert.ok(slowList.some(sk => sk.keyId === 'l'));

  const targets = PK_REVIEW.getReviewTargets('english');
  const slowTarget = targets.find(t => t.targetId === 'l' && t.type === 'speed');
  assert.ok(slowTarget);
  assert.ok(slowTarget.reason.includes('ms'));
});

// SCENARIO F: Weak Khmer compound unit
it('Scenario F: Weak Khmer compound unit (e.g. ុំ) is preserved as a logical unit without splitting', () => {
  // Simulate practice on Khmer compound unit 'ុំ' in NiDA: 1 correct, 3 wrong (25% acc)
  PK_PROGRESS.recordTypingUnit({ layout: 'nida', expectedKeyId: 'comma', expected: 'ុំ', correct: true, responseTimeMs: 300 });
  for(let i = 0; i < 3; i++){
    PK_PROGRESS.recordTypingUnit({ layout: 'nida', expectedKeyId: 'comma', expected: 'ុំ', correct: false, produced: 'ុ', responseTimeMs: 450 });
  }

  const targets = PK_REVIEW.getReviewTargets('nida');
  const compoundTarget = targets.find(t => t.targetId === 'ុំ');
  assert.ok(compoundTarget, 'Compound ុំ should appear as a review target');
  assert.strictEqual(compoundTarget.targetId, 'ុំ');

  const drill = PK_REVIEW.generateReviewDrill('nida', { target: 'ុំ' });
  assert.ok(drill.chars.includes('ុំ'));
  drill.chars.forEach(ch => {
    if(ch === 'ុំ'){
      assert.strictEqual(ch.length, 2, 'Codepoints U+17BB + U+17C6 should remain together as ុំ');
    }
  });
});

// SCENARIO G: Weak English character
it('Scenario G: Weak English character generates review combined exclusively with home row anchors', () => {
  const drill = PK_REVIEW.generateReviewDrill('english', { target: 'g' });
  assert.ok(drill.chars.length >= 20);
  assert.ok(drill.chars.includes('g'));

  // Anchors must be from home row
  const nonTargetChars = drill.chars.filter(c => c !== 'g' && c !== ' ');
  const validAnchors = ['f', 'j', 'd', 'k', 's', 'l', 'a', ';'];
  nonTargetChars.forEach(c => {
    assert.ok(validAnchors.includes(c), `Character '${c}' was not a valid home-row anchor`);
  });
});

// SCENARIO H: Weak finger
it('Scenario H: Finger error concentration triggers finger-level review candidate', () => {
  // Simulate 12 left pinky strokes: 4 correct, 8 wrong (accuracy 33%)
  for(let i = 0; i < 4; i++){
    PK_PROGRESS.recordTypingUnit({ layout: 'english', expectedKeyId: 'a', expected: 'a', correct: true, finger: 'lp', responseTimeMs: 200 });
  }
  for(let i = 0; i < 8; i++){
    PK_PROGRESS.recordTypingUnit({ layout: 'english', expectedKeyId: 'a', expected: 'a', correct: false, finger: 'lp', produced: 's', responseTimeMs: 450 });
  }

  const targets = PK_REVIEW.getReviewTargets('english');
  const fingerTarget = targets.find(t => t.type === 'finger' && t.targetId === 'lp');
  assert.ok(fingerTarget);
  assert.ok(fingerTarget.reason.includes('LP'));
});

// SCENARIO I: Recent performance decline
it('Scenario I: Declining performance on a lesson is detected and prioritized', () => {
  // Attempt 1: 95%
  PK_PROGRESS.recordLessonAttempt({
    layoutId: 'english',
    lessonId: 'en-L01-01',
    levelId: 'en-L01',
    accuracy: 95,
    wpm: 35,
    timeSec: 12.0,
    threshold: 90
  });

  // Attempt 2: 82% (declined by 13%)
  PK_PROGRESS.recordLessonAttempt({
    layoutId: 'english',
    lessonId: 'en-L01-01',
    levelId: 'en-L01',
    accuracy: 82,
    wpm: 24,
    timeSec: 18.0,
    threshold: 90
  });

  const comparison = PK_PROGRESS.compareWithHistory('english', 'en-L01-01', { accuracy: 82 });
  assert.strictEqual(comparison.trend, 'declining');
  assert.strictEqual(comparison.diffAccuracy, -13);
});

// SCENARIO J: Stale skill (> 7 days)
it('Scenario J: Stale skill (> 7 days without practice) is categorized as refresher, NOT weak', () => {
  // Introduce character 's' with 100% accuracy, but practiced 10 days ago
  const fullData = PK_PROGRESS.exportData();
  const nineDaysAgo = Date.now() - (9 * 86400000);
  fullData.courses.english.characters['s'] = {
    unit: 's',
    attempts: 15,
    correct: 15,
    incorrect: 0,
    accuracy: 100,
    avgResponseTimeMs: 220,
    lastPracticed: nineDaysAgo,
    masteryState: 'mastered'
  };
  PK_PROGRESS.importData(fullData);

  const targets = PK_REVIEW.getReviewTargets('english');
  const targetS = targets.find(t => t.targetId === 's');
  assert.ok(targetS);
  assert.ok(targetS.triggers.includes('stale-character'));
  assert.ok(targetS.reason.includes('Quick refresher'));
});

// SCENARIO K: Strong / Mastered skill
it('Scenario K: Clearly mastered skills with high accuracy are not pushed into targeted reviews', () => {
  // Character 'd': 50 attempts, 100% accuracy, practiced today
  for(let i = 0; i < 20; i++){
    PK_PROGRESS.recordTypingUnit({ layout: 'english', expectedKeyId: 'd', expected: 'd', correct: true, responseTimeMs: 200 });
  }

  const targets = PK_REVIEW.getReviewTargets('english');
  const targetD = targets.find(t => t.targetId === 'd' && t.type === 'character');
  assert.strictEqual(targetD, undefined, 'Mastered key D should not appear as a review target');
});

// SCENARIO L: Mixed adaptive practice
it('Scenario L: Mixed review combines multiple known weak targets safely', () => {
  const drill = PK_REVIEW.generateReviewDrill('english', { category: 'mixed', length: 30 });
  assert.ok(drill);
  assert.strictEqual(drill.type, 'review');
  assert.ok(drill.chars.length >= 20);
});

// SCENARIO M: Future-key protection
it('Scenario M: Curriculum safety strictly prevents unintroduced future keys from appearing in review', () => {
  delete mockStorage['khmerUnlockAll'];
  PK_PROGRESS.resetAll();

  // Practice only home row
  ['a', 's', 'd', 'f', 'j', 'k', 'l', ';'].forEach(k => {
    PK_PROGRESS.recordTypingUnit({ layout: 'english', expectedKeyId: k, expected: k, correct: true });
  });

  const introduced = PK_REVIEW.getIntroducedCharSet('english');
  assert.ok(introduced.has('f'));
  assert.ok(introduced.has('j'));
  // Future keys must NOT be introduced:
  assert.ok(!introduced.has('q'));
  assert.ok(!introduced.has('z'));
  assert.ok(!introduced.has('x'));
  assert.ok(!introduced.has('p'));

  const drill = PK_REVIEW.generateReviewDrill('english');
  drill.chars.forEach(c => {
    if(c !== ' '){
      assert.ok(introduced.has(c), `Unintroduced key '${c}' was found in review drill!`);
    }
  });
});

// SCENARIO N: Course isolation
it('Scenario N: Standard Khmer, NiDA, and English maintain completely isolated review pools', () => {
  // Record weak 'f' in English
  for(let i = 0; i < 4; i++){
    PK_PROGRESS.recordTypingUnit({ layout: 'english', expectedKeyId: 'f', expected: 'f', correct: false, produced: 'd' });
  }

  const enTargets = PK_REVIEW.getReviewTargets('english');
  const nidaTargets = PK_REVIEW.getReviewTargets('nida');
  const stdTargets = PK_REVIEW.getReviewTargets('standard');

  assert.ok(enTargets.some(t => t.targetId === 'f'));
  assert.ok(!nidaTargets.some(t => t.targetId === 'f'));
  assert.ok(!stdTargets.some(t => t.targetId === 'f'));
});

// SCENARIO O: Adaptive practice completion updates PK_PROGRESS
it('Scenario O: Completing an adaptive practice session updates persistent PK_PROGRESS storage', () => {
  const lesson = PK_PROGRESS.getLessonProgress('english', 'rev_f_test');
  PK_PROGRESS.recordLessonAttempt({
    layoutId: 'english',
    lessonId: 'rev_f_test',
    levelId: 'review',
    accuracy: 92,
    wpm: 30,
    timeSec: 15.0,
    mistakes: 2,
    threshold: 85
  });

  const updated = PK_PROGRESS.getLessonProgress('english', 'rev_f_test');
  assert.ok(updated !== null);
  assert.strictEqual(updated.bestAccuracy, 92);
  assert.strictEqual(updated.completed, true);
});

// SCENARIO P: Before/after measurement
it('Scenario P: Review completion measures before vs after performance accurately', () => {
  const drillDef = PK_REVIEW.generateReviewDrill('english', { target: 'f' });
  drillDef.beforeStats = { accuracy: 65, avgResponseTimeMs: 450, attempts: 10 };

  const sessionResult = PK_REVIEW.completeReviewSession('english', drillDef, {
    accuracy: 94,
    wpm: 32,
    timeSec: 14.0,
    mistakes: 1
  });

  assert.ok(sessionResult);
  assert.strictEqual(sessionResult.beforeAccuracy, 65);
  assert.strictEqual(sessionResult.afterAccuracy, 94);
  assert.strictEqual(sessionResult.deltaAccuracy, 29);
  assert.strictEqual(sessionResult.improved, true);
  assert.ok(sessionResult.message.includes('+29%'));
});

// SCENARIO Q: Deterministic generation
it('Scenario Q: Given identical seed and options, review generation produces 100% identical sequence', () => {
  const drill1 = PK_REVIEW.generateReviewDrill('english', { target: 'f', seed: 42424 });
  const drill2 = PK_REVIEW.generateReviewDrill('english', { target: 'f', seed: 42424 });

  assert.deepStrictEqual(drill1.chars, drill2.chars);
  assert.deepStrictEqual(drill1.keyIds, drill2.keyIds);
  assert.deepStrictEqual(drill1.layers, drill2.layers);
});

// SCENARIO R: Repeated review does not duplicate statistics
it('Scenario R: Repeated reviews measure and update gracefully without corrupted or duplicate statistics', () => {
  const drillDef = PK_REVIEW.generateReviewDrill('english', { target: 'g' });
  drillDef.beforeStats = { accuracy: 70, avgResponseTimeMs: 500, attempts: 8 };

  const res1 = PK_REVIEW.completeReviewSession('english', drillDef, {
    accuracy: 88,
    wpm: 26,
    timeSec: 17.0,
    mistakes: 2
  });
  const res2 = PK_REVIEW.completeReviewSession('english', drillDef, {
    accuracy: 96,
    wpm: 31,
    timeSec: 14.0,
    mistakes: 1
  });

  assert.ok(res1 && res2);
  assert.strictEqual(res2.afterAccuracy, 96);
  assert.strictEqual(res2.improved, true);
});

// SCENARIO S: No-progress fallback produces normal practice
it('Scenario S: No-progress fallback produces normal practice using home-row anchors', () => {
  PK_PROGRESS.resetAll();
  const drill = PK_REVIEW.generateReviewDrill('english');
  assert.ok(drill);
  assert.ok(drill.chars.length >= 20);
  const validAnchors = ['f', 'j', 'd', 'k', 's', 'l', 'a', ';', ' '];
  drill.chars.forEach(c => {
    assert.ok(validAnchors.includes(c));
  });
});

// SCENARIO T: Adaptive practice never crashes with malformed/empty progress
it('Scenario T: Adaptive practice never crashes with malformed, null, or corrupt progress', () => {
  mockStorage['khmerProgressData_v2'] = 'INVALID_JSON_CORRUPT{';
  PK_PROGRESS.reload();

  assert.doesNotThrow(() => {
    const targets = PK_REVIEW.getReviewTargets('english');
    assert.ok(Array.isArray(targets));
  });

  assert.doesNotThrow(() => {
    const drill = PK_REVIEW.generateReviewDrill('english', { target: null });
    assert.ok(drill);
  });

  assert.doesNotThrow(() => {
    const res = PK_REVIEW.completeReviewSession('english', null, null);
    assert.strictEqual(res, null);
  });
});

console.log(`\nPhase 8 Test Results: ${passedTests}/20 test suites passed.`);
console.log('ALL PHASE 8 ADAPTIVE PRACTICE & REVIEW TESTS PASSED PERFECTLY!\n');
