/**
 * PK Khmer Type — Automated Strict Khmer NiDA Curriculum Expander
 * Ensures every added character is strictly in the cumulative introduced keys/layers set for NiDA.
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

const KEY_BY_ID_NIDA = buildKeyById(kb.LAYOUTS.nida.rows);

const lessonsPath = path.join(__dirname, '../data/curriculum/nida/lessons.json');
const exercisesPath = path.join(__dirname, '../data/curriculum/nida/exercises.json');

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
      total += splitIntoTypingUnits(text, 'nida').length;
    }
  });
  return total;
}

// Track cumulative valid keys/layers per lesson
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
    const deficit = threshold - currentUnits + 15;
    const refs = l.exerciseRefs || l.exercises || [];

    // Collect valid base characters
    const validBaseChars = [];
    knownKeys.forEach(kId => {
      const k = KEY_BY_ID_NIDA[kId];
      if (k && k.base && kId !== 'space') {
        validBaseChars.push(k.base);
      }
    });

    // Check valid shift chars if shift layer unlocked
    const validShiftChars = [];
    if (knownLayers.has('shift') || knownKeys.has('shiftLeft') || knownKeys.has('shiftRight')) {
      knownKeys.forEach(kId => {
        const k = KEY_BY_ID_NIDA[kId];
        if (k && k.shift && k.shift !== ' ') {
          validShiftChars.push(k.shift);
        }
      });
    }

    const lessonNewChars = (l.newKeys || []).map(k => k.char).filter(Boolean);
    const primaryChars = lessonNewChars.length > 0 ? lessonNewChars : validBaseChars.slice(-4);

    const chunks = [];
    let addedUnits = 0;

    // Build rhythmic typing groups of primary glyphs
    while (addedUnits < deficit) {
      for (let c of primaryChars) {
        if (addedUnits >= deficit) break;
        const pattern = `${c}${c}${c} ${c} ${c}${c}`;
        chunks.push(pattern);
        addedUnits += splitIntoTypingUnits(pattern, 'nida').length + 1;
      }

      // Alternations with early anchors
      if (validBaseChars.length > 1 && addedUnits < deficit) {
        const a1 = validBaseChars[0]; // ថ
        const a2 = validBaseChars[1] || a1; // ក
        for (let c of primaryChars) {
          if (addedUnits >= deficit) break;
          const alt = `${c}${a1} ${a2}${c} ${c}${a2}`;
          chunks.push(alt);
          addedUnits += splitIntoTypingUnits(alt, 'nida').length + 1;
        }
      }
    }

    const exId = `${l.id}-E0${refs.length + 1}`;
    exercises[exId] = {
      type: 'drill',
      content: chunks.join(' '),
      description: `Rhythm and cadence reinforcement for ${l.title}`
    };
    refs.push(exId);

    if (l.exerciseRefs) {
      l.exerciseRefs = refs;
    } else {
      l.exercises = refs;
    }

    console.log(`[EXPANDED NIDA] ${l.id} (${l.title}): ${currentUnits} -> ${getLessonUnits(l)} units`);
  }
});

fs.writeFileSync(exercisesPath, JSON.stringify(exercisesData, null, 2), 'utf8');
fs.writeFileSync(lessonsPath, JSON.stringify(lessonsData, null, 2), 'utf8');

console.log('Automated strict Khmer NiDA curriculum expansion finished.');
