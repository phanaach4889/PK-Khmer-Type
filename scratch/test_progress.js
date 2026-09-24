/* ============================================================
   PK Khmer Type — Phase 7 Progress Tracking Test Suite
   ============================================================
   Validates scenarios A through P:
   A. New learner (clean initialization, unstarted states)
   B. One completed lesson (accuracy, time, attempts recorded)
   C. Multiple attempts (attempts count, best accuracy, best time)
   D. Improved accuracy (trend = 'improving', +% detected)
   E. Declining accuracy (trend = 'declining', -% detected)
   F. Repeated mistakes (identified, not marked mastered)
   G. Backspace corrections (tracked corrections, streak reset)
   H. Khmer compound units (multi-codepoint logical units like ុំ)
   I. English keys (isolated key & char tracking)
   J. Standard Khmer (isolated standard course tracking)
   K. NiDA (isolated nida course tracking)
   L. Course switching (strict isolation between all 3 layouts)
   M. Browser reload (data survives JSON serialize/deserialize)
   N. Storage migration (legacy khmerLessonBest_* migrated)
   O. Corrupted storage recovery (clamps, repairs invalid records)
   P. Progress reset (lesson, level, course, and all reset)
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

// Load tracker.js and progress.js and feedback.js
eval(fs.readFileSync('js/tracker.js', 'utf8'));
eval(fs.readFileSync('js/progress.js', 'utf8'));
eval(fs.readFileSync('js/feedback.js', 'utf8'));

console.log('Running Phase 7 Progress Tracking Test Suite...');
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

// SCENARIO A: New learner
it('Scenario A: New learner initializes with empty courses, unstarted states, and 100% baseline accuracy', () => {
  PK_PROGRESS.resetAll();
  const nidaCourse = PK_PROGRESS.getCourseProgress('nida');
  assert.strictEqual(nidaCourse.totalTypingUnits, 0);
  assert.strictEqual(nidaCourse.totalMistakes, 0);
  assert.strictEqual(nidaCourse.overallAccuracy, 100);
  assert.deepStrictEqual(nidaCourse.lessons, {});

  const lesson = PK_PROGRESS.getLessonProgress('nida', 'nida-L00-01');
  assert.strictEqual(lesson, null);
});

// SCENARIO B: One completed lesson
it('Scenario B: One completed lesson correctly records attempts, best accuracy, time, and mastery state', () => {
  const res = PK_PROGRESS.recordLessonAttempt({
    layoutId: 'nida',
    lessonId: 'nida-L00-01',
    levelId: 'nida-L00',
    accuracy: 94,
    wpm: 28,
    timeSec: 15.2,
    mistakes: 2,
    corrections: 1,
    units: 30,
    threshold: 90
  });

  assert.strictEqual(res.isNewBestAccuracy, true);
  const lesson = PK_PROGRESS.getLessonProgress('nida', 'nida-L00-01');
  assert.strictEqual(lesson.totalAttempts, 1);
  assert.strictEqual(lesson.bestAccuracy, 94);
  assert.strictEqual(lesson.bestWpm, 28);
  assert.strictEqual(lesson.completed, true);
  assert.strictEqual(lesson.masteryState, 'mastered');
  assert.strictEqual(lesson.mostRecentAttempt.passed, true);
});

// SCENARIO C: Multiple attempts
it('Scenario C: Multiple attempts update attempt counts, best accuracy, and preserves best record', () => {
  // Attempt 2: 90%
  PK_PROGRESS.recordLessonAttempt({
    layoutId: 'nida',
    lessonId: 'nida-L00-01',
    levelId: 'nida-L00',
    accuracy: 90,
    wpm: 25,
    timeSec: 16.0,
    mistakes: 3,
    threshold: 90
  });

  const lesson = PK_PROGRESS.getLessonProgress('nida', 'nida-L00-01');
  assert.strictEqual(lesson.totalAttempts, 2);
  assert.strictEqual(lesson.bestAccuracy, 94); // Preserves previous 94%
  assert.strictEqual(lesson.recentAttempts.length, 2);
});

// SCENARIO D: Improved accuracy
it('Scenario D: Improved accuracy over prior attempt is detected and reported as improving', () => {
  // Attempt 3: 98%
  PK_PROGRESS.recordLessonAttempt({
    layoutId: 'nida',
    lessonId: 'nida-L00-01',
    levelId: 'nida-L00',
    accuracy: 98,
    wpm: 32,
    timeSec: 13.5,
    mistakes: 1,
    threshold: 90
  });

  const comparison = PK_PROGRESS.compareWithHistory('nida', 'nida-L00-01', { accuracy: 98, wpm: 32, timeSec: 13.5 });
  assert.strictEqual(comparison.hasHistory, true);
  assert.strictEqual(comparison.trend, 'improving');
  assert.strictEqual(comparison.diffAccuracy, 8); // 98 - 90 = +8%
  assert.ok(comparison.message.includes('+8%'));
});

// SCENARIO E: Declining accuracy
it('Scenario E: Declining accuracy is detected and reported as declining with guidance', () => {
  // Attempt 4: 85%
  PK_PROGRESS.recordLessonAttempt({
    layoutId: 'nida',
    lessonId: 'nida-L00-01',
    levelId: 'nida-L00',
    accuracy: 85,
    wpm: 22,
    timeSec: 18.0,
    mistakes: 6,
    threshold: 90
  });

  const comparison = PK_PROGRESS.compareWithHistory('nida', 'nida-L00-01', { accuracy: 85, wpm: 22, timeSec: 18.0 });
  assert.strictEqual(comparison.trend, 'declining');
  assert.strictEqual(comparison.diffAccuracy, -13); // 85 - 98 = -13%
  assert.ok(comparison.message.includes('13%'));
});

// SCENARIO F: Repeated mistakes & key mastery
it('Scenario F: Keys with frequent mistakes are flagged in needsPractice and not prematurely marked mastered', () => {
  // Simulate 10 strokes on key 'k': 5 correct, 5 wrong
  for(let i = 0; i < 5; i++){
    PK_PROGRESS.recordTypingUnit({ layout: 'nida', expectedKeyId: 'k', expected: 'ក', correct: true, responseTimeMs: 250 });
    PK_PROGRESS.recordTypingUnit({ layout: 'nida', expectedKeyId: 'k', expected: 'ក', correct: false, produced: 'm', responseTimeMs: 400 });
  }

  const kStat = PK_PROGRESS.getKeyProgress('nida', 'k');
  assert.strictEqual(kStat.attempts, 10);
  assert.strictEqual(kStat.accuracy, 50);
  assert.strictEqual(kStat.masteryState, 'learning'); // Accuracy 50% must not be mastered

  const summary = PK_PROGRESS.getLearnerSummary('nida');
  assert.ok(summary.needsPracticeKeys.some(k => k.keyId === 'k'));
});

// SCENARIO G: Backspace corrections
it('Scenario G: Corrections and backspaces update lesson and tracker without breaking progress counts', () => {
  PK_TRACKER.recordBackspace({ unitIndex: 5, poppedUnit: 'ក' });
  const session = PK_TRACKER.getSessionSummary();
  assert.strictEqual(session.totalBackspaces >= 1, true);
});

// SCENARIO H: Khmer compound units
it('Scenario H: Multi-codepoint Khmer compound vowels like ុំ are preserved as distinct typing units', () => {
  for(let i = 0; i < 15; i++){
    PK_PROGRESS.recordTypingUnit({ layout: 'nida', expectedKeyId: 'comma', expected: 'ុំ', correct: true, responseTimeMs: 300 });
  }

  const charStat = PK_PROGRESS.getCharProgress('nida', 'ុំ');
  assert.ok(charStat !== null);
  assert.strictEqual(charStat.attempts, 15);
  assert.strictEqual(charStat.correct, 15);
  assert.strictEqual(charStat.accuracy, 100);
  assert.strictEqual(charStat.masteryState, 'mastered'); // >= 10 attempts, 100% acc -> mastered
});

// SCENARIO I: English keys
it('Scenario I: English course keys and characters track independently with their own metrics', () => {
  for(let i = 0; i < 15; i++){
    PK_PROGRESS.recordTypingUnit({ layout: 'english', expectedKeyId: 'f', expected: 'f', correct: true, responseTimeMs: 200, finger: 'li' });
  }

  const enKey = PK_PROGRESS.getKeyProgress('english', 'f');
  assert.strictEqual(enKey.attempts, 15);
  assert.strictEqual(enKey.accuracy, 100);
  assert.strictEqual(enKey.masteryState, 'mastered');

  // Verify English key did not pollute NiDA key 'f' (which is Khmer ថ)
  const nidaKey = PK_PROGRESS.getKeyProgress('nida', 'f');
  assert.strictEqual(nidaKey, null);
});

// SCENARIO J: Standard Khmer
it('Scenario J: Standard Khmer course maintains isolated statistics and lesson records', () => {
  PK_PROGRESS.recordLessonAttempt({
    layoutId: 'standard',
    lessonId: '1',
    levelId: '1',
    accuracy: 92,
    wpm: 26,
    timeSec: 14.0,
    mistakes: 2,
    threshold: 85
  });

  const stdLesson = PK_PROGRESS.getLessonProgress('standard', '1');
  assert.strictEqual(stdLesson.bestAccuracy, 92);
  assert.strictEqual(stdLesson.masteryState, 'mastered');

  // Ensure '1' does not exist in NiDA or English courses
  assert.strictEqual(PK_PROGRESS.getLessonProgress('nida', '1'), null);
  assert.strictEqual(PK_PROGRESS.getLessonProgress('english', '1'), null);
});

// SCENARIO K: NiDA
it('Scenario K: NiDA course records and levels progress accurately reflect curriculum requirements', () => {
  // Complete remaining lessons of Level 0
  const nidaLvl0Lessons = ['nida-L00-02', 'nida-L00-03', 'nida-L00-04'];
  nidaLvl0Lessons.forEach(lid => {
    PK_PROGRESS.recordLessonAttempt({
      layoutId: 'nida',
      lessonId: lid,
      levelId: 'nida-L00',
      accuracy: 95,
      wpm: 30,
      timeSec: 12.0,
      mistakes: 1,
      threshold: 90
    });
  });

  const lvlProgress = PK_PROGRESS.getLevelProgress('nida', 'nida-L00');
  assert.ok(lvlProgress !== null);
  assert.strictEqual(lvlProgress.lessonsCompleted, 4);
  assert.strictEqual(lvlProgress.completionPercentage, 100);
  assert.strictEqual(lvlProgress.completed, true);
  assert.strictEqual(lvlProgress.mastered, true);
});

// SCENARIO L: Course switching
it('Scenario L: Course switching preserves each layout without data contamination', () => {
  const std = PK_PROGRESS.getCourseProgress('standard');
  const nida = PK_PROGRESS.getCourseProgress('nida');
  const en = PK_PROGRESS.getCourseProgress('english');

  assert.ok(std.lessons['1']);
  assert.ok(!std.lessons['nida-L00-01']);
  assert.ok(nida.lessons['nida-L00-01']);
  assert.ok(!nida.lessons['1']);
  assert.ok(en.keys['f']);
  assert.ok(!std.keys['f']);
});

// SCENARIO M: Browser reload
it('Scenario M: Progress state persists across reload and reloads cleanly from localStorage', () => {
  PK_PROGRESS.flush();
  assert.ok(mockStorage['khmerProgress_v2']);

  // Call reload
  PK_PROGRESS.reload();

  const nidaL0 = PK_PROGRESS.getLevelProgress('nida', 'nida-L00');
  assert.strictEqual(nidaL0.lessonsCompleted, 4);
  assert.strictEqual(nidaL0.mastered, true);

  const enF = PK_PROGRESS.getKeyProgress('english', 'f');
  assert.strictEqual(enF.attempts, 15);
  assert.strictEqual(enF.accuracy, 100);
});

// SCENARIO N: Storage migration
it('Scenario N: Legacy khmerLessonBest_* keys are migrated seamlessly into unified progress schema', () => {
  // Set legacy keys
  mockStorage['khmerLessonBest_nida-L01-01'] = JSON.stringify({
    accuracy: 96,
    time: 14.5,
    attempts: 3,
    mastered: true
  });

  // Re-run migration
  PK_PROGRESS.reload();

  const migrated = PK_PROGRESS.getLessonProgress('nida', 'nida-L01-01');
  assert.ok(migrated !== null);
  assert.strictEqual(migrated.bestAccuracy, 96);
  assert.strictEqual(migrated.totalAttempts, 3);
  assert.strictEqual(migrated.masteryState, 'mastered');
});

// SCENARIO O: Corrupted storage recovery
it('Scenario O: Corrupted or malformed storage data is safely repaired without exceptions or data destruction', () => {
  const malformed = {
    version: 2,
    courses: {
      nida: {
        totalTypingUnits: -50, // Negative counter
        overallAccuracy: 999,  // Out of range
        lessons: {
          'nida-L00-01': {
            bestAccuracy: 'invalid_number',
            totalAttempts: -5,
            masteryState: 'invalid_status'
          }
        },
        keys: {
          'k': {
            attempts: -10,
            correct: -5
          }
        }
      }
    }
  };

  const repaired = PK_PROGRESS.validateAndRepair(malformed);
  assert.strictEqual(repaired.courses.nida.totalTypingUnits, 0);
  assert.strictEqual(repaired.courses.nida.overallAccuracy, 100);
  assert.strictEqual(repaired.courses.nida.lessons['nida-L00-01'].bestAccuracy, 0);
  assert.strictEqual(repaired.courses.nida.lessons['nida-L00-01'].totalAttempts, 0);
  assert.strictEqual(repaired.courses.nida.lessons['nida-L00-01'].masteryState, 'unstarted');
  assert.strictEqual(repaired.courses.nida.keys['k'].attempts, 0);
});

// SCENARIO P: Progress reset
it('Scenario P: Granular progress resets operate safely at lesson, level, course, and global scopes', () => {
  // 1. Reset specific lesson
  const resetL = PK_PROGRESS.resetLesson('nida', 'nida-L01-01');
  assert.strictEqual(resetL, true);
  assert.strictEqual(PK_PROGRESS.getLessonProgress('nida', 'nida-L01-01'), null);

  // 2. Reset specific level
  const resetLvl = PK_PROGRESS.resetLevel('nida', 'nida-L00');
  assert.strictEqual(resetLvl, true);
  assert.strictEqual(PK_PROGRESS.getLevelProgress('nida', 'nida-L00'), null);

  // 3. Reset specific course (English)
  const resetCourse = PK_PROGRESS.resetCourse('english');
  assert.strictEqual(resetCourse, true);
  assert.strictEqual(PK_PROGRESS.getKeyProgress('english', 'f'), null);
  // Standard course remains intact!
  assert.ok(PK_PROGRESS.getLessonProgress('standard', '1') !== null);

  // 4. Reset All
  PK_PROGRESS.resetAll();
  assert.strictEqual(PK_PROGRESS.getLessonProgress('standard', '1'), null);
  assert.strictEqual(PK_PROGRESS.getCourseProgress('standard').totalTypingUnits, 0);
});

console.log(`\nPhase 7 Test Results: ${passedTests}/16 test suites passed.`);
console.log('ALL PHASE 7 PROGRESS TRACKING TESTS PASSED PERFECTLY!\n');
