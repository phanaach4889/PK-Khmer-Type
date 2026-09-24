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
const table = buildKeyById(kb.LAYOUTS.english.rows);

function spaceEntry(){
  return { id: 'space', layer: 'base', ch: ' ' };
}

function resolveCharLocation(ch){
  if(ch === ' ') return spaceEntry();
  for(const id in table){
    const k = table[id];
    if(k.base===ch) return {id, layer:'base', ch};
    if(k.shift===ch) return {id, layer:'shift', ch};
    if(k.ctrl===ch) return {id, layer:'ctrl', ch};
    if(k.altgr===ch) return {id, layer:'altgr', ch};
  }
  return null;
}

const levels = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/curriculum/english/levels.json'), 'utf8')).levels;
const lessons = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/curriculum/english/lessons.json'), 'utf8')).lessons;
const exercises = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/curriculum/english/exercises.json'), 'utf8')).exercises;

console.log('========================================================================================');
console.log('ENGLISH US HOME-ROW CURRICULUM AUDIT REPORT');
console.log('========================================================================================\n');

const homeLevels = ['en-L00', 'en-L01', 'en-L02', 'en-L03'];
const knownKeys = new Set();
let totalLessonsAudited = 0;
let totalUnexpectedKeys = 0;

homeLevels.forEach(lvlId => {
  const lvl = levels.find(l => l.id === lvlId);
  console.log(`\n----------------------------------------------------------------------------------------`);
  console.log(`LEVEL: ${lvl.id} — "${lvl.title}" (Level Number: ${lvl.levelNumber})`);
  console.log(`Objective: ${lvl.objective}`);
  console.log(`Description: ${lvl.description}`);
  console.log(`----------------------------------------------------------------------------------------`);

  const lvlLessons = lessons.filter(l => l.level === lvlId);
  lvlLessons.forEach(l => {
    totalLessonsAudited++;
    const prevLearned = Array.from(knownKeys);

    // New keys introduced in this lesson
    const newlyIntroduced = (l.newKeys || []).map(k => typeof k === 'string' ? k : k.keyId);
    newlyIntroduced.forEach(k => knownKeys.add(k));

    // Keys used across all exercises in this lesson
    const usedKeysSet = new Set();
    const exContents = [];
    (l.exerciseRefs || []).forEach(eid => {
      const ex = exercises[eid];
      if (!ex || !ex.content) return;
      const text = Array.isArray(ex.content) ? ex.content.join(' ') : ex.content;
      exContents.push(text);
      const units = splitIntoTypingUnits(text, 'english');
      units.forEach(u => {
        const loc = resolveCharLocation(u);
        if (loc) usedKeysSet.add(loc.id);
      });
    });

    const usedKeys = Array.from(usedKeysSet);
    const unexpectedKeys = usedKeys.filter(k => !knownKeys.has(k));
    if (unexpectedKeys.length > 0) totalUnexpectedKeys += unexpectedKeys.length;

    console.log(`\nLesson ID: ${l.id} | Order: ${l.order} | Title: "${l.title}" | Type: ${l.type}`);
    console.log(`  - Keys Introduced: [${newlyIntroduced.length ? newlyIntroduced.join(', ') : 'none (practice / consolidation)'}]`);
    console.log(`  - Previously Learned Keys: [${prevLearned.length ? prevLearned.join(', ') : 'none (first lesson)'}]`);
    console.log(`  - Keys Used in Exercises: [${usedKeys.join(', ')}]`);
    console.log(`  - Finger Assignments: [${(l.fingerFocus || []).join(', ') || 'inherited'}]`);
    console.log(`  - Sample Exercises: "${exContents.slice(0, 2).map(c => c.length > 35 ? c.slice(0, 32) + '...' : c).join('" | "')}"`);
    console.log(`  - Unexpected Keys: ${unexpectedKeys.length === 0 ? '0 (None — PASS)' : `VIOLATION: [${unexpectedKeys.join(', ')}]`}`);
  });
});

console.log('\n========================================================================================');
console.log(`AUDIT SUMMARY:`);
console.log(`Total Home-Row Lessons Audited: ${totalLessonsAudited}`);
console.log(`Total Unexpected Keys Found: ${totalUnexpectedKeys}`);
console.log(`Status: ${totalUnexpectedKeys === 0 ? 'ALL CHECKS PASSED (Flawless Pedagogical Progression)' : 'FAIL'}`);
console.log('========================================================================================\n');

