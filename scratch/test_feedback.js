// Automated test suite for Learner Feedback Layer (Scenarios A through J)
const assert = require('assert');
const path = require('path');
const fs = require('fs');

// Create mock browser environment for testing
const windowMock = {
  addEventListener(evt, fn) {},
  removeEventListener(evt, fn) {},
  KEY_FINGER: {
    a: 'lp', s: 'lr', d: 'lm', f: 'li', g: 'li', h: 'ri', j: 'ri', k: 'rm', l: 'rr', ';': 'rp', q: 'lp', space: 'rt'
  },
  localStorage: {
    data: {},
    getItem(k) { return this.data[k] || null; },
    setItem(k, v) { this.data[k] = String(v); },
    removeItem(k) { delete this.data[k]; },
    clear() { this.data = {}; }
  }
};
global.window = windowMock;
global.localStorage = windowMock.localStorage;

// Load tracker.js and feedback.js
const trackerCode = fs.readFileSync(path.join(__dirname, '..', 'js', 'tracker.js'), 'utf8');
const feedbackCode = fs.readFileSync(path.join(__dirname, '..', 'js', 'feedback.js'), 'utf8');

eval(trackerCode);
eval(feedbackCode);

const tracker = windowMock.PK_TRACKER || global.PK_TRACKER;
const feedback = windowMock.PK_FEEDBACK || global.PK_FEEDBACK;

console.log('Testing Learner Feedback Layer...');

let passed = 0;
let total = 0;

function it(desc, fn) {
  total++;
  try {
    fn();
    console.log(`  ✓ ${desc}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${desc}`);
    console.error(err);
  }
}

// ==========================================
// SCENARIO A: Mostly Correct Lesson
// ==========================================
it('Scenario A: Mostly correct lesson shows high accuracy, positive highlights, and next-lesson recommendation', () => {
  tracker.reset();
  tracker.recordLessonStart({
    layout: 'english',
    lessonId: 'eng_l1',
    totalUnits: 20,
    lessonChars: 'ffff jjjj ff jj fj jf'.split('')
  });

  const chars = 'ffff jjjj ff jj fj jf'.split('');
  chars.forEach((ch, idx) => {
    tracker.recordTypingUnit({
      layout: 'english',
      lessonId: 'eng_l1',
      unitIndex: idx,
      expected: ch,
      produced: ch,
      correct: true,
      strokeKeyId: ch === ' ' ? 'space' : ch,
      strokeLayer: 'base',
      expectedKeyId: ch === ' ' ? 'space' : ch,
      expectedLayer: 'base'
    });
  });

  const live = tracker.getLiveLessonMetrics();
  assert.strictEqual(live.accuracy, 100);
  assert.strictEqual(live.mistakeCount, 0);

  const summary = feedback.analyzeLesson(live, { id: 'eng_l1', title: 'Home Row Intro', threshold: 85 }, 'english');
  assert.strictEqual(summary.completed, true);
  assert.strictEqual(summary.performance.accuracy, 100);
  assert.strictEqual(summary.needsPractice.weakKeys.length, 0);
  assert.strictEqual(summary.needsPractice.weakUnits.length, 0);
  assert.strictEqual(summary.recommendation.action, 'next');
  assert.ok(summary.wentWell.highlights.some(h => h.includes('100%') || h.includes('Flawless')));
});

// ==========================================
// SCENARIO B: Repeated Errors on One Key & Single-Mistake Guardrail
// ==========================================
it('Scenario B: Repeated errors (>= 2) on a key are identified, but a single mistake (count = 1) is NEVER flagged as weak', () => {
  tracker.reset();
  tracker.recordLessonStart({
    layout: 'english',
    lessonId: 'eng_l2',
    totalUnits: 15,
    lessonChars: 'd k d k d k d k d k d k d k d'.split('')
  });

  // Simulate 1 mistake on key 'd'
  tracker.recordTypingUnit({
    layout: 'english',
    lessonId: 'eng_l2',
    unitIndex: 0,
    expected: 'd',
    produced: 's',
    correct: false,
    strokeKeyId: 's',
    strokeLayer: 'base',
    expectedKeyId: 'd',
    expectedLayer: 'base'
  });

  // Check live hint after 1 mistake — MUST BE NULL (no hint on single mistake)
  let live = tracker.getLiveLessonMetrics();
  assert.strictEqual(live.mostMissedKey, null, 'Single mistake must not be mostMissedKey');
  assert.strictEqual(feedback.getRealTimeHint(live), null, 'Single mistake must not produce a real-time hint');

  // Now simulate a 2nd mistake on key 'd'
  tracker.recordTypingUnit({
    layout: 'english',
    lessonId: 'eng_l2',
    unitIndex: 2,
    expected: 'd',
    produced: 'f',
    correct: false,
    strokeKeyId: 'f',
    strokeLayer: 'base',
    expectedKeyId: 'd',
    expectedLayer: 'base'
  });

  // Check live hint after 2 mistakes — MUST identify 'd'
  live = tracker.getLiveLessonMetrics();
  assert.strictEqual(live.mostMissedKey.key, 'd');
  assert.strictEqual(live.mostMissedKey.count, 2);
  const hint = feedback.getRealTimeHint(live);
  assert.ok(hint && hint.toLowerCase().includes('d'), `Hint should mention 'd', got: ${hint}`);

  // Also simulate 1 single mistake on key 'k' (should NOT be flagged as weak in final summary)
  tracker.recordTypingUnit({
    layout: 'english',
    lessonId: 'eng_l2',
    unitIndex: 4,
    expected: 'k',
    produced: 'j',
    correct: false,
    strokeKeyId: 'j',
    strokeLayer: 'base',
    expectedKeyId: 'k',
    expectedLayer: 'base'
  });

  // Complete rest of units correctly
  for (let i = 5; i < 15; i++) {
    tracker.recordTypingUnit({
      layout: 'english',
      lessonId: 'eng_l2',
      unitIndex: i,
      expected: 'k',
      produced: 'k',
      correct: true,
      strokeKeyId: 'k',
      strokeLayer: 'base',
      expectedKeyId: 'k',
      expectedLayer: 'base'
    });
  }

  live = tracker.getLiveLessonMetrics();
  const summary = feedback.analyzeLesson(live, { id: 'eng_l2', title: 'Keys D and K', threshold: 85 }, 'english');

  // Key 'd' has 2 mistakes -> weakKeys
  assert.ok(summary.needsPractice.weakKeys.some(wk => wk.key === 'd'), 'Key D should be in weakKeys');
  // Key 'k' has only 1 mistake -> MUST NOT be in weakKeys
  assert.ok(!summary.needsPractice.weakKeys.some(wk => wk.key === 'k'), 'Key K (1 mistake) must NOT be in weakKeys');
});

// ==========================================
// SCENARIO C: Repeated Errors on Khmer Unit (Compound Vowel ុំ)
// ==========================================
it('Scenario C: Repeated errors on Khmer compound vowel ុំ are identified with human-readable classification', () => {
  tracker.reset();
  tracker.recordLessonStart({
    layout: 'nida',
    lessonId: 'nida_l5',
    totalUnits: 10,
    lessonChars: ['ក', 'ុំ', 'ក', 'ុំ', 'ក', 'ុំ', 'ក', 'ុំ', 'ក', 'ុំ']
  });

  // Mistake 1 on 'ុំ'
  tracker.recordTypingUnit({
    layout: 'nida',
    lessonId: 'nida_l5',
    unitIndex: 1,
    expected: 'ុំ',
    produced: 'ុ',
    correct: false,
    strokeKeyId: 'u',
    strokeLayer: 'base',
    expectedKeyId: 'x',
    expectedLayer: 'shift'
  });

  // Mistake 2 on 'ុំ'
  tracker.recordTypingUnit({
    layout: 'nida',
    lessonId: 'nida_l5',
    unitIndex: 3,
    expected: 'ុំ',
    produced: 'ំ',
    correct: false,
    strokeKeyId: 'b',
    strokeLayer: 'shift',
    expectedKeyId: 'x',
    expectedLayer: 'shift'
  });

  const live = tracker.getLiveLessonMetrics();
  assert.strictEqual(live.mostMissedUnit.unit, 'ុំ');
  assert.strictEqual(live.mostMissedUnit.count, 2);

  const unitName = feedback.formatUnitName('ុំ', 'nida');
  assert.strictEqual(unitName, 'Compound Vowel ុំ');

  const summary = feedback.analyzeLesson(live, { id: 'nida_l5', title: 'Khmer Compound Vowels', threshold: 85 }, 'nida');
  assert.ok(summary.needsPractice.weakUnits.some(wu => wu.unit === 'ុំ'), 'Compound vowel ុំ should be in weakUnits');
});

// ==========================================
// SCENARIO D: Shift Mistakes
// ==========================================
it('Scenario D: Shift mistakes are tracked and provide modifier coordination advice', () => {
  tracker.reset();
  tracker.recordLessonStart({
    layout: 'english',
    lessonId: 'eng_l10',
    totalUnits: 10,
    lessonChars: 'ABCDEFGHIJ'.split('')
  });

  // 3 Shift mistakes (produced lowercase instead of uppercase)
  for (let i = 0; i < 3; i++) {
    tracker.recordTypingUnit({
      layout: 'english',
      lessonId: 'eng_l10',
      unitIndex: i,
      expected: 'A',
      produced: 'a',
      correct: false,
      strokeKeyId: 'a',
      strokeLayer: 'base',
      expectedKeyId: 'a',
      expectedLayer: 'shift'
    });
  }

  const live = tracker.getLiveLessonMetrics();
  assert.strictEqual(live.shiftMistakes, 3);

  const summary = feedback.analyzeLesson(live, { id: 'eng_l10', title: 'Capitals & Shift', threshold: 80 }, 'english');
  assert.strictEqual(summary.needsPractice.shiftMistakes, 3);
  assert.ok(summary.recommendation.text.includes('Shift coordination'), `Expected shift advice, got: ${summary.recommendation.text}`);
});

// ==========================================
// SCENARIO E: Finger Concentration Weakness
// ==========================================
it('Scenario E: Finger error concentration (>= 3 mistakes and >= 35%) correctly identifies weak finger', () => {
  tracker.reset();
  tracker.recordLessonStart({
    layout: 'english',
    lessonId: 'eng_l3',
    totalUnits: 15,
    lessonChars: 'a s d f j k l ;'.split('')
  });

  // 4 mistakes, all with left pinky (key 'a')
  for (let i = 0; i < 4; i++) {
    tracker.recordTypingUnit({
      layout: 'english',
      lessonId: 'eng_l3',
      unitIndex: i,
      expected: 'a',
      produced: 'q',
      correct: false,
      strokeKeyId: 'q',
      strokeLayer: 'base',
      expectedKeyId: 'a',
      expectedLayer: 'base'
    });
  }

  const live = tracker.getLiveLessonMetrics();
  assert.ok(live.difficultFinger);
  assert.strictEqual(live.difficultFinger.finger, 'lp');
  assert.strictEqual(live.difficultFinger.count, 4);
  assert.strictEqual(live.difficultFinger.pct, 100);

  const summary = feedback.analyzeLesson(live, { id: 'eng_l3', title: 'Pinky Practice', threshold: 85 }, 'english');
  assert.ok(summary.needsPractice.weakFingers.some(wf => wf.finger === 'lp'));
  assert.strictEqual(feedback.formatFingerName('lp'), 'Left Pinky');
});

// ==========================================
// SCENARIO F: Backspace & Corrected Mistakes
// ==========================================
it('Scenario F: Backspaces and self-corrected mistakes are tracked separately from uncorrected errors', () => {
  tracker.reset();
  tracker.recordLessonStart({
    layout: 'english',
    lessonId: 'eng_l4',
    totalUnits: 10,
    lessonChars: 'hello world'.split('')
  });

  // Type correct
  tracker.recordTypingUnit({
    layout: 'english',
    lessonId: 'eng_l4',
    unitIndex: 0,
    expected: 'h',
    produced: 'h',
    correct: true,
    strokeKeyId: 'h',
    strokeLayer: 'base',
    expectedKeyId: 'h',
    expectedLayer: 'base'
  });

  // Backspace!
  tracker.recordBackspace({
    layout: 'english',
    lessonId: 'eng_l4',
    unitIndex: 0,
    poppedUnit: 'h'
  });

  const live = tracker.getLiveLessonMetrics();
  assert.strictEqual(live.backspaceCount, 1);
  assert.strictEqual(live.correctedCount, 1);

  const summary = feedback.analyzeLesson(live, { id: 'eng_l4', title: 'Testing Corrections', threshold: 85 }, 'english');
  assert.strictEqual(summary.performance.backspaces, 1);
  assert.strictEqual(summary.performance.correctedMistakes, 1);
});

// ==========================================
// SCENARIO G: Incomplete Lesson (What Learner Missed)
// ==========================================
it('Scenario G: Incomplete lesson reports progress reached, remaining units, and completed vs remaining sections', () => {
  tracker.reset();
  const sections = [
    { id: 'sec1', title: 'Warm-up Drill', startIndex: 0, endIndex: 4 },
    { id: 'sec2', title: 'Core Combinations', startIndex: 5, endIndex: 14 }
  ];

  tracker.recordLessonStart({
    layout: 'english',
    lessonId: 'eng_l5',
    totalUnits: 15,
    lessonChars: 'abcdefghijklmno'.split(''),
    sections: sections
  });

  // Type 6 units (completes sec1, enters sec2)
  for (let i = 0; i < 6; i++) {
    tracker.recordTypingUnit({
      layout: 'english',
      lessonId: 'eng_l5',
      exerciseId: i <= 4 ? 'sec1' : 'sec2',
      unitIndex: i,
      expected: 'abcdefghijklmno'[i],
      produced: 'abcdefghijklmno'[i],
      correct: true,
      strokeKeyId: 'abcdefghijklmno'[i],
      strokeLayer: 'base',
      expectedKeyId: 'abcdefghijklmno'[i],
      expectedLayer: 'base'
    });
  }

  const live = tracker.getLiveLessonMetrics();
  const inc = feedback.analyzeIncompleteLesson(live, { id: 'eng_l5', title: 'Progressive Test' }, 'english');

  assert.strictEqual(inc.completed, false);
  assert.strictEqual(inc.completedUnits, 6);
  assert.strictEqual(inc.totalUnits, 15);
  assert.strictEqual(inc.remainingUnits, 9);
  assert.strictEqual(inc.completionPct, 40);
  assert.strictEqual(inc.completedSections.length, 1);
  assert.strictEqual(inc.completedSections[0].id, 'sec1');
  assert.strictEqual(inc.remainingSections.length, 1);
  assert.strictEqual(inc.remainingSections[0].id, 'sec2');
  assert.ok(inc.message.includes('40% of this lesson'));
});

// ==========================================
// SCENARIO H: Multi-codepoint Khmer Input (Coeng Foot ្ក)
// ==========================================
it('Scenario H: Multi-codepoint Khmer Coeng characters are classified and identified properly', () => {
  const coengName = feedback.formatUnitName('្ក', 'nida');
  assert.strictEqual(coengName, 'Subscript Foot ្ក (Coeng + ក)');

  const bantocName = feedback.formatUnitName('់', 'nida');
  assert.strictEqual(bantocName, 'Bantoc ់');
});

// ==========================================
// SCENARIO I: English Punctuation Mistakes
// ==========================================
it('Scenario I: English punctuation mistakes are classified accurately', () => {
  assert.strictEqual(feedback.formatUnitName('.', 'english'), 'Period .');
  assert.strictEqual(feedback.formatUnitName(',', 'english'), 'Comma ,');
  assert.strictEqual(feedback.formatUnitName(';', 'english'), 'Semicolon ;');
  assert.strictEqual(feedback.formatUnitName('!', 'english'), 'Exclamation Mark !');
});

// ==========================================
// SCENARIO J: Very Short Session Handling
// ==========================================
it('Scenario J: Very short sessions (1-2 units) handle gracefully without dividing by zero or NaN', () => {
  tracker.reset();
  tracker.recordLessonStart({
    layout: 'english',
    lessonId: 'short_l1',
    totalUnits: 2,
    lessonChars: ['a', 'b']
  });

  const live = tracker.getLiveLessonMetrics();
  assert.strictEqual(live.accuracy, 100);
  assert.strictEqual(live.wpm, 0);

  const summary = feedback.analyzeLesson(live, { id: 'short_l1', title: 'Short Lesson' }, 'english');
  assert.strictEqual(isNaN(summary.performance.accuracy), false);
  assert.strictEqual(isNaN(summary.performance.wpm), false);

  const inc = feedback.analyzeIncompleteLesson(live, { id: 'short_l1', title: 'Short Lesson' }, 'english');
  assert.strictEqual(isNaN(inc.completionPct), false);
});

// ==========================================
// HTML Builder Verification
// ==========================================
it('HTML Builders produce valid HTML structures for post-lesson card and paused card', () => {
  tracker.reset();
  tracker.recordLessonStart({
    layout: 'english',
    lessonId: 'html_test',
    totalUnits: 5,
    lessonChars: ['f', 'f', 'j', 'j', 'f']
  });
  tracker.recordTypingUnit({
    layout: 'english',
    lessonId: 'html_test',
    unitIndex: 0,
    expected: 'f',
    produced: 'f',
    correct: true,
    strokeKeyId: 'f',
    strokeLayer: 'base',
    expectedKeyId: 'f',
    expectedLayer: 'base'
  });

  const live = tracker.getLiveLessonMetrics();
  const summary = feedback.analyzeLesson(live, { id: 'html_test', title: 'HTML Test' }, 'english');
  const postHtml = feedback.buildPostLessonCardHtml(summary, { id: 'html_test', title: 'HTML Test' }, false, null, { id: 'html_test_2' });

  assert.ok(postHtml.includes('pk-fb-complete-card'));
  assert.ok(postHtml.includes('pk-fb-perf-grid'));
  assert.ok(postHtml.includes('What Went Well'));
  assert.ok(postHtml.includes('Next Step:'));
  assert.ok(postHtml.includes('lc-next'));

  const inc = feedback.analyzeIncompleteLesson(live, { id: 'html_test', title: 'HTML Test' }, 'english');
  const incHtml = feedback.buildIncompleteLessonHtml(inc, { id: 'html_test', title: 'HTML Test' });

  assert.ok(incHtml.includes('pk-fb-paused-card'));
  assert.ok(incHtml.includes('Lesson Paused'));
  assert.ok(incHtml.includes('lc-resume'));
  assert.ok(incHtml.includes('lc-retry'));
  assert.ok(incHtml.includes('lc-exit-confirm'));
});

console.log(`\nFeedback Test Results: ${passed}/${total} assertions passed.`);
if (passed === total) {
  console.log('ALL FEEDBACK LAYER UNIT TESTS PASSED SUCCESSFULLY!');
} else {
  process.exit(1);
}
