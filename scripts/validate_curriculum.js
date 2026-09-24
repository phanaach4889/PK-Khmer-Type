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

function spaceEntry(table){
  const layer = (table === KEY_BY_ID_EN) ? 'base' : 'shift';
  return { id: 'space', layer, ch: ' ' };
}

function resolveCharLocation(ch, table){
  if(ch === ' ') return spaceEntry(table);
  for(const id in table){
    const k = table[id];
    if(k.base===ch) return {id, layer:'base', ch};
    if(k.shift===ch) return {id, layer:'shift', ch};
    if(k.ctrl===ch) return {id, layer:'ctrl', ch};
    if(k.altgr===ch) return {id, layer:'altgr', ch};
  }
  return null;
}

function validateCurriculum(layoutId) {
  const levelsPath = path.join(__dirname, `../data/curriculum/${layoutId}/levels.json`);
  const lessonsPath = path.join(__dirname, `../data/curriculum/${layoutId}/lessons.json`);
  const exercisesPath = path.join(__dirname, `../data/curriculum/${layoutId}/exercises.json`);

  const levels = JSON.parse(fs.readFileSync(levelsPath, 'utf8')).levels;
  const lessons = JSON.parse(fs.readFileSync(lessonsPath, 'utf8')).lessons;
  const exercises = JSON.parse(fs.readFileSync(exercisesPath, 'utf8')).exercises;
  const table = (layoutId === 'nida') ? KEY_BY_ID_NIDA : KEY_BY_ID_EN;

  console.log(`\n==================================================`);
  console.log(`AUDITING ${layoutId.toUpperCase()} CURRICULUM (STRUCTURE & PROGRESSION)`);
  console.log(`==================================================`);

  let structuralErrors = 0;

  // 1. Level Integrity Checks
  const levelIdSet = new Set();
  const levelLessonsMap = new Map();
  levels.forEach((lvl, idx) => {
    if (levelIdSet.has(lvl.id)) {
      console.error(`STRUCTURAL ERROR: Duplicate level ID '${lvl.id}'`);
      structuralErrors++;
    }
    levelIdSet.add(lvl.id);

    if (lvl.levelNumber !== idx) {
      console.error(`STRUCTURAL ERROR: Level ${lvl.id} has out-of-order levelNumber ${lvl.levelNumber}, expected ${idx}`);
      structuralErrors++;
    }

    const expectedPrev = idx === 0 ? null : levels[idx - 1].id;
    if (lvl.unlockRequirements && lvl.unlockRequirements.previousLevel !== expectedPrev) {
      console.error(`STRUCTURAL ERROR: Level ${lvl.id} previousLevel '${lvl.unlockRequirements.previousLevel}' does not match expected '${expectedPrev}'`);
      structuralErrors++;
    }

    if (!Array.isArray(lvl.lessons) || lvl.lessons.length === 0) {
      console.error(`STRUCTURAL ERROR: Level ${lvl.id} has no lessons listed`);
      structuralErrors++;
    }
    levelLessonsMap.set(lvl.id, lvl.lessons);
  });

  // 2. Lesson Integrity Checks
  const lessonIdSet = new Set();
  lessons.forEach((l, idx) => {
    if (lessonIdSet.has(l.id)) {
      console.error(`STRUCTURAL ERROR: Duplicate lesson ID '${l.id}'`);
      structuralErrors++;
    }
    lessonIdSet.add(l.id);

    if (!levelIdSet.has(l.level)) {
      console.error(`STRUCTURAL ERROR: Lesson ${l.id} refers to non-existent level '${l.level}'`);
      structuralErrors++;
    }

    const expectedPrev = idx === 0 ? null : lessons[idx - 1].id;
    if (l.unlockRequirements && l.unlockRequirements.previousLesson !== expectedPrev) {
      console.error(`STRUCTURAL ERROR: Lesson ${l.id} previousLesson '${l.unlockRequirements.previousLesson}' does not match expected '${expectedPrev}'`);
      structuralErrors++;
    }

    const refs = l.exerciseRefs || l.exercises || [];
    if (!Array.isArray(refs) || refs.length === 0) {
      console.error(`STRUCTURAL ERROR: Lesson ${l.id} has no exercises defined`);
      structuralErrors++;
    }

    refs.forEach(eid => {
      const ex = exercises[eid];
      if (!ex) {
        console.error(`STRUCTURAL ERROR: Lesson ${l.id} references missing exercise '${eid}'`);
        structuralErrors++;
      } else if (!ex.content || (typeof ex.content === 'string' && ex.content.trim().length === 0) || (Array.isArray(ex.content) && ex.content.length === 0)) {
        console.error(`STRUCTURAL ERROR: Exercise '${eid}' in lesson ${l.id} has empty content`);
        structuralErrors++;
      }
    });
  });

  // Cross-check: level.lessons matches actual lessons belonging to level
  levels.forEach(lvl => {
    const actualLessons = lessons.filter(l => l.level === lvl.id).map(l => l.id);
    const listedLessons = lvl.lessons || [];
    if (JSON.stringify(actualLessons) !== JSON.stringify(listedLessons)) {
      console.error(`STRUCTURAL ERROR: Level ${lvl.id} lesson list mismatch: actual ${JSON.stringify(actualLessons)} vs listed ${JSON.stringify(listedLessons)}`);
      structuralErrors++;
    }
  });

  if (structuralErrors > 0) {
    console.error(`FAILED STRUCTURAL INTEGRITY AUDIT: ${structuralErrors} structural error(s) found!`);
    return false;
  }
  console.log(`[PASS] Structural integrity verified: 0 broken links, 0 empty exercises, 0 duplicates.`);

  // 3. Pedagogical Progression Checks
  const knownKeys = new Set();
  const knownLayers = new Set(['base']);
  let failedLessons = 0;
  let totalViolations = 0;

  lessons.forEach((l, idx) => {
    const newlyIntroduced = [];
    (l.newKeys || []).forEach(k => {
      const keyId = typeof k === 'string' ? k : k.keyId;
      if (keyId) {
        knownKeys.add(keyId);
        newlyIntroduced.push(keyId);
      }
      if (k.layer && k.layer !== 'base') {
        knownLayers.add(k.layer);
      }
    });

    // Space key can be introduced explicitly or implicitly by lesson 2
    if (l.requiredKeys && l.requiredKeys.includes('space')) {
      knownKeys.add('space');
    }

    const violations = [];
    const refs = l.exerciseRefs || l.exercises || [];
    refs.forEach(eid => {
      const ex = exercises[eid];
      if (!ex || !ex.content) return;
      const text = Array.isArray(ex.content) ? ex.content.join(' ') : ex.content;
      const units = splitIntoTypingUnits(text, layoutId);

      units.forEach(u => {
        const loc = resolveCharLocation(u, table);
        if (!loc) {
          violations.push({ char: u, reason: 'Unmapped character on layout' });
          return;
        }

        if (loc.id === 'space') {
          // Space is allowed once introduced
          if (!knownKeys.has('space') && idx > 1) {
            knownKeys.add('space');
          } else if (!knownKeys.has('space')) {
            violations.push({ char: '␣', keyId: 'space', layer: 'base', reason: 'Space key not yet introduced' });
          }
          return;
        }

        if (!knownKeys.has(loc.id)) {
          violations.push({
            char: u,
            keyId: loc.id,
            layer: loc.layer,
            reason: `Key [${loc.id}] ('${u}') not yet introduced`
          });
        }

        if (loc.layer !== 'base' && !knownLayers.has(loc.layer)) {
          violations.push({
            char: u,
            keyId: loc.id,
            layer: loc.layer,
            reason: `Modifier layer [${loc.layer}] for '${u}' not yet introduced`
          });
        }
      });
    });

    if (violations.length > 0) {
      failedLessons++;
      totalViolations += violations.length;
      const uniqueIssues = new Map();
      violations.forEach(v => {
        const key = `${v.keyId || v.char}`;
        if (!uniqueIssues.has(key)) {
          uniqueIssues.set(key, v.reason);
        }
      });

      console.log(`\nLesson: ${l.id} (${l.title})`);
      console.log(`  Newly introduced keys: [${newlyIntroduced.join(', ') || 'none'}]`);
      console.log(`  Known keys so far (${knownKeys.size}): [${Array.from(knownKeys).slice(0, 15).join(', ')}${knownKeys.size > 15 ? '...' : ''}]`);
      uniqueIssues.forEach((reason, k) => {
        console.log(`  Unknown key/layer: ${reason}`);
      });
      console.log(`  Result: FAIL`);
    } else {
      console.log(`Lesson: ${l.id} (${l.title}) -> PASS [new: ${newlyIntroduced.join(', ') || 'practice'}]`);
    }
  });

  console.log(`\n--------------------------------------------------`);
  console.log(`${layoutId.toUpperCase()} Audit Summary:`);
  console.log(`Total Lessons: ${lessons.length}`);
  console.log(`Passed Lessons: ${lessons.length - failedLessons}`);
  console.log(`Failed Lessons: ${failedLessons}`);
  console.log(`Total Violations: ${totalViolations}`);
  console.log(`--------------------------------------------------`);
  return failedLessons === 0;
}

const enPassed = validateCurriculum('english');
const nidaPassed = validateCurriculum('nida');

if (!enPassed || !nidaPassed) {
  console.log('\nOVERALL RESULT: FAIL (Prerequisite or ordering violations detected)');
  process.exit(1);
} else {
  console.log('\nOVERALL RESULT: PASS (All curriculum prerequisites verified)');
  process.exit(0);
}
