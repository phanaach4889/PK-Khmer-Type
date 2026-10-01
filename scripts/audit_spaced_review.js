const fs = require('fs');
const path = require('path');

const unitsCode = fs.readFileSync(path.join(__dirname, '../src/logic/typing/units.js'), 'utf8');
eval(unitsCode.replace(/export /g, ''));

const courses = ['standard', 'nida', 'english'];
let allPass = true;

for (const course of courses) {
  const levels = JSON.parse(fs.readFileSync(path.join(__dirname, `../data/curriculum/${course}/levels.json`), 'utf8')).levels;
  const lessons = JSON.parse(fs.readFileSync(path.join(__dirname, `../data/curriculum/${course}/lessons.json`), 'utf8')).lessons;
  const exercises = JSON.parse(fs.readFileSync(path.join(__dirname, `../data/curriculum/${course}/exercises.json`), 'utf8')).exercises;

  console.log(`\n=== Review Audit: ${course.toUpperCase()} ===`);

  let priorLevelKeys = new Set();
  
  for (const level of levels) {
    const levelLessons = lessons.filter(l => l.level === level.id);
    const thisLevelKeys = new Set();
    for (const lesson of levelLessons) {
      for (const k of lesson.newKeys || []) {
        thisLevelKeys.add(k.char);
      }
    }

    if (priorLevelKeys.size === 0) {
      console.log(`Level ${level.id}: Skipped (first level)`);
      for (const k of thisLevelKeys) priorLevelKeys.add(k);
      continue;
    }

    let totalExercises = 0;
    let reviewExercises = 0;

    for (const lesson of levelLessons) {
      for (const ref of lesson.exerciseRefs || []) {
        totalExercises++;
        const ex = exercises[ref];
        if (!ex) continue;
        const units = normalizeUnits(ex.content);
        let hasReview = false;
        for (const unit of units) {
          if (priorLevelKeys.has(unit) && !thisLevelKeys.has(unit)) {
            hasReview = true;
            break;
          }
        }
        if (hasReview) reviewExercises++;
      }
    }

    const pct = totalExercises > 0 ? (reviewExercises / totalExercises) * 100 : 0;
    const passed = pct >= 25;
    console.log(`Level ${level.id}: ${reviewExercises}/${totalExercises} exercises (${pct.toFixed(1)}%) contain review - ${passed ? 'PASS' : 'FAIL'}`);
    if (!passed) allPass = false;

    for (const k of thisLevelKeys) priorLevelKeys.add(k);
  }
}
process.exit(allPass ? 0 : 1);
