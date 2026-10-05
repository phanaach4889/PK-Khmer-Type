const fs = require('fs');
const path = require('path');

global.window = { addEventListener: () => {} };
global.document = { activeElement: null, getElementById: () => null, addEventListener: () => {} };

eval(fs.readFileSync(path.join(__dirname, '../js/typing.js'), 'utf8'));

const kb = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/keyboard.json'), 'utf8'));

function buildKeyById(rows){
  const map = {};
  rows.forEach(row=> row.forEach(k=>{ if(k.kind==='glyph') map[k.id] = k; }));
  return map;
}

const KEY_BY_ID_NIDA = buildKeyById(kb.LAYOUTS.nida.rows);
const KEY_BY_ID_EN = buildKeyById(kb.LAYOUTS.english.rows);
const KEY_BY_ID_STD = buildKeyById(kb.LAYOUTS.standard.rows);

function analyzeCourse(layoutId) {
  const levelsPath = path.join(__dirname, `../data/curriculum/${layoutId}/levels.json`);
  const lessonsPath = path.join(__dirname, `../data/curriculum/${layoutId}/lessons.json`);
  const exercisesPath = path.join(__dirname, `../data/curriculum/${layoutId}/exercises.json`);

  const levels = JSON.parse(fs.readFileSync(levelsPath, 'utf8')).levels;
  const lessons = JSON.parse(fs.readFileSync(lessonsPath, 'utf8')).lessons;
  const exercises = JSON.parse(fs.readFileSync(exercisesPath, 'utf8')).exercises;

  console.log(`\n======================================================================`);
  console.log(`DETAILED EDUCATIONAL AUDIT: ${layoutId.toUpperCase()}`);
  console.log(`======================================================================`);

  const cumulativeKeys = new Set();
  const cumulativeChars = new Set();
  const MIN_UNITS = 80;
  const MIN_UNITS_ORIENTATION = 20;
  let totalLessons = 0;
  let totalUnitsAll = 0;
  let lessonsUnderMin = 0;

  levels.forEach((lvl, lvlIdx) => {
    const lvlLessons = lessons.filter(l => l.level === lvl.id);
    let totalExercises = 0;
    let totalTypingUnits = 0;
    const newKeysInLevel = [];
    const newCharsInLevel = [];
    let reviewLessonCount = 0;
    const perLessonUnits = [];

    lvlLessons.forEach(l => {
      const refs = l.exerciseRefs || l.exercises || [];
      totalExercises += refs.length;
      let lessonUnits = 0;
      refs.forEach(eid => {
        const ex = exercises[eid];
        if (ex && ex.content) {
          const text = Array.isArray(ex.content) ? ex.content.join(' ') : ex.content;
          const units = splitIntoTypingUnits(text, layoutId);
          totalTypingUnits += units.length;
          lessonUnits += units.length;
        }
      });
      perLessonUnits.push({ id: l.id, title: l.title, units: lessonUnits });
      totalLessons++;
      totalUnitsAll += lessonUnits;

      const isOrientation = l.level && l.level.match(/L00/);
      const threshold = isOrientation ? MIN_UNITS_ORIENTATION : MIN_UNITS;
      if (lessonUnits < threshold) lessonsUnderMin++;

      (l.newKeys || []).forEach(k => {
        const kid = typeof k === 'string' ? k : k.keyId;
        const ch = k.char || kid;
        if (!cumulativeKeys.has(kid)) {
          cumulativeKeys.add(kid);
          newKeysInLevel.push(kid);
        }
        if (ch && !cumulativeChars.has(ch)) {
          cumulativeChars.add(ch);
          newCharsInLevel.push(ch);
        }
      });

      if (l.type === 'review' || l.type === 'test' || (l.newKeys || []).length === 0) {
        reviewLessonCount++;
      }
    });

    const isTooShort = lvlLessons.length <= 2 || totalTypingUnits < 100;
    const reviewRatio = lvlLessons.length > 0 ? Math.round((reviewLessonCount / lvlLessons.length) * 100) : 0;
    const avgPerLesson = lvlLessons.length > 0 ? Math.round(totalTypingUnits / lvlLessons.length) : 0;

    console.log(`\n[${lvl.id}] ${lvl.title} (Level ${lvl.levelNumber})`);
    console.log(`  - Lesson Count:     ${lvlLessons.length} lessons`);
    console.log(`  - Exercise Count:   ${totalExercises} exercises`);
    console.log(`  - Approx Units:     ${totalTypingUnits} keystroke units (avg ${avgPerLesson}/lesson)`);
    console.log(`  - New Keys:         ${newKeysInLevel.join(', ') || 'none (consolidation / application)'}`);
    console.log(`  - New Chars:        ${newCharsInLevel.join(', ') || 'none'}`);
    console.log(`  - Cumulative Keys:  ${cumulativeKeys.size} keys known`);
    console.log(`  - Review Coverage:  ${reviewLessonCount}/${lvlLessons.length} (${reviewRatio}%)`);
    console.log(`  - Assessment:       ${isTooShort ? '[WARN] TOO SHALLOW / NEEDS DEPTH' : '[OK] Good depth'}`);

    // Per-lesson breakdown
    perLessonUnits.forEach(pl => {
      const isOrientation = pl.id && pl.id.match(/L00/);
      const threshold = isOrientation ? MIN_UNITS_ORIENTATION : MIN_UNITS;
      const flag = pl.units < threshold ? ` [WARN] UNDER ${threshold}` : '';
      console.log(`    ${pl.id}: ${pl.units} units${flag}`);
    });
  });

  const avgOverall = totalLessons > 0 ? Math.round(totalUnitsAll / totalLessons) : 0;
  console.log(`\n----------------------------------------------------------------------`);
  console.log(`${layoutId.toUpperCase()} SUMMARY: ${totalLessons} lessons, ${totalUnitsAll} total units, avg ${avgOverall} units/lesson`);
  console.log(`Lessons under minimum: ${lessonsUnderMin}/${totalLessons}`);
  console.log(`----------------------------------------------------------------------`);
}

function courseExists(layoutId) {
  const dir = path.join(__dirname, `../data/curriculum/${layoutId}`);
  return fs.existsSync(path.join(dir, 'levels.json'))
      && fs.existsSync(path.join(dir, 'lessons.json'))
      && fs.existsSync(path.join(dir, 'exercises.json'));
}

analyzeCourse('english');
analyzeCourse('nida');

if (courseExists('standard')) {
  analyzeCourse('standard');
} else {
  console.log(`\n[SKIP] Standard curriculum not yet created (data/curriculum/standard/ missing).`);
}

