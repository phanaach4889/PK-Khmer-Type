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

  levels.forEach((lvl, lvlIdx) => {
    const lvlLessons = lessons.filter(l => l.level === lvl.id);
    let totalExercises = 0;
    let totalTypingUnits = 0;
    const newKeysInLevel = [];
    const newCharsInLevel = [];
    let reviewLessonCount = 0;

    lvlLessons.forEach(l => {
      const refs = l.exerciseRefs || l.exercises || [];
      totalExercises += refs.length;
      refs.forEach(eid => {
        const ex = exercises[eid];
        if (ex && ex.content) {
          const text = Array.isArray(ex.content) ? ex.content.join(' ') : ex.content;
          const units = splitIntoTypingUnits(text, layoutId);
          totalTypingUnits += units.length;
        }
      });

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

    console.log(`\n[${lvl.id}] ${lvl.title} (Level ${lvl.levelNumber})`);
    console.log(`  - Lesson Count:     ${lvlLessons.length} lessons`);
    console.log(`  - Exercise Count:   ${totalExercises} exercises`);
    console.log(`  - Approx Units:     ${totalTypingUnits} keystroke units`);
    console.log(`  - New Keys:         ${newKeysInLevel.join(', ') || 'none (consolidation / application)'}`);
    console.log(`  - New Chars:        ${newCharsInLevel.join(', ') || 'none'}`);
    console.log(`  - Cumulative Keys:  ${cumulativeKeys.size} keys known`);
    console.log(`  - Review Coverage:  ${reviewLessonCount}/${lvlLessons.length} (${reviewRatio}%)`);
    console.log(`  - Assessment:       ${isTooShort ? '⚠️ TOO SHALLOW / NEEDS DEPTH' : '✓ Good depth'}`);
  });
}

analyzeCourse('english');
analyzeCourse('nida');

