/**
 * PK Khmer Type — Automated Strict English Curriculum Expander
 * Ensures every added character is strictly in the cumulative introduced keys set.
 */

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

const KEY_BY_ID_EN = buildKeyById(kb.LAYOUTS.english.rows);

function resolveCharLocation(ch, table){
  if(ch === ' ') return { id: 'space', layer: 'base', ch: ' ' };
  for(const id in table){
    const k = table[id];
    if(k.base===ch) return {id, layer:'base', ch};
    if(k.shift===ch) return {id, layer:'shift', ch};
    if(k.ctrl===ch) return {id, layer:'ctrl', ch};
    if(k.altgr===ch) return {id, layer:'altgr', ch};
  }
  return null;
}

const lessonsPath = path.join(__dirname, '../data/curriculum/english/lessons.json');
const exercisesPath = path.join(__dirname, '../data/curriculum/english/exercises.json');

const lessonsData = JSON.parse(fs.readFileSync(lessonsPath, 'utf8'));
const exercisesData = JSON.parse(fs.readFileSync(exercisesPath, 'utf8'));

const lessons = lessonsData.lessons;
const exercises = exercisesData.exercises;

const MIN_UNITS = 80;
const MIN_UNITS_ORIENTATION = 20;

function getLessonUnits(lesson) {
  const refs = lesson.exerciseRefs || lesson.exercises || [];
  let total = 0;
  refs.forEach(eid => {
    const ex = exercises[eid];
    if (ex && ex.content) {
      const text = Array.isArray(ex.content) ? ex.content.join(' ') : ex.content;
      total += splitIntoTypingUnits(text, 'english').length;
    }
  });
  return total;
}

// Track cumulative valid characters per lesson index
const knownKeys = new Set();
const knownLayers = new Set(['base']);

lessons.forEach((l, idx) => {
  (l.newKeys || []).forEach(k => {
    const keyId = typeof k === 'string' ? k : k.keyId;
    if (keyId) knownKeys.add(keyId);
    if (k.layer && k.layer !== 'base') knownLayers.add(k.layer);
  });
  if (l.requiredKeys && l.requiredKeys.includes('space')) knownKeys.add('space');
  if (idx > 1) knownKeys.add('space');

  const isOrientation = l.level && l.level.match(/L00/);
  const threshold = isOrientation ? MIN_UNITS_ORIENTATION : MIN_UNITS;
  const currentUnits = getLessonUnits(l);

  if (currentUnits < threshold) {
    const deficit = threshold - currentUnits + 15; // Aim slightly above threshold
    const refs = l.exerciseRefs || l.exercises || [];
    
    // Check available valid base characters
    const validBaseChars = [];
    knownKeys.forEach(kId => {
      const k = KEY_BY_ID_EN[kId];
      if (k && k.base && kId !== 'space') {
        validBaseChars.push(k.base);
      }
    });

    // Also get valid shift chars if shift is known
    const validShiftChars = [];
    if (knownLayers.has('shift') || knownKeys.has('shiftLeft') || knownKeys.has('shiftRight')) {
      knownKeys.forEach(kId => {
        const k = KEY_BY_ID_EN[kId];
        if (k && k.shift) {
          validShiftChars.push(k.shift);
        }
      });
    }

    // Collect base characters specific to this lesson or level
    const lessonNewChars = (l.newKeys || []).map(k => k.char).filter(Boolean);
    const primaryChars = lessonNewChars.length > 0 ? lessonNewChars : validBaseChars.slice(-4);

    // Build rhythmic chunks strictly from valid characters
    const chunks = [];
    let addedLength = 0;

    // Pattern 1: Rhythmic groups of primary chars
    while (addedLength < deficit) {
      for (let c of primaryChars) {
        if (addedLength >= deficit) break;
        const pattern = `${c}${c}${c} ${c} ${c}${c}`;
        chunks.push(pattern);
        addedLength += pattern.length + 1;
      }

      // Pattern 2: Alternations strictly among primary characters (no unassigned key leaks)
      if (primaryChars.length > 1 && addedLength < deficit) {
        for (let i = 0; i < primaryChars.length; i++) {
          if (addedLength >= deficit) break;
          const c1 = primaryChars[i];
          const c2 = primaryChars[(i + 1) % primaryChars.length];
          const alt = `${c1}${c2} ${c2}${c1} ${c1}${c1} ${c2}${c2}`;
          chunks.push(alt);
          addedLength += alt.length + 1;
        }
      }
    }

    const exId = `${l.id}-E0${refs.length + 1}`;
    exercises[exId] = {
      type: 'drill',
      content: chunks.join(' '),
      description: `Rhythm and fluency consolidation for ${l.title}`
    };
    refs.push(exId);

    if (l.exerciseRefs) {
      l.exerciseRefs = refs;
    } else {
      l.exercises = refs;
    }

    console.log(`[EXPANDED] ${l.id} (${l.title}): ${currentUnits} -> ${getLessonUnits(l)} units (added strictly valid characters)`);
  }
});

fs.writeFileSync(exercisesPath, JSON.stringify(exercisesData, null, 2), 'utf8');
fs.writeFileSync(lessonsPath, JSON.stringify(lessonsData, null, 2), 'utf8');

console.log('Automated strict English curriculum expansion finished.');
