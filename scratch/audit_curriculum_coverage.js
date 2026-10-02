const fs = require('fs');
const path = require('path');

// 1. Khmer Linguistic Character Sets
const KHMER_CONSONANTS = [
  'ក', 'ខ', 'គ', 'ឃ', 'ង',
  'ច', 'ឆ', 'ជ', 'ឈ', 'ញ',
  'ដ', 'ឋ', 'ឌ', 'ឍ', 'ណ',
  'ត', 'ថ', 'ទ', 'ធ', 'ន',
  'ប', 'ផ', 'ព', 'ភ', 'ម',
  'យ', 'រ', 'ល', 'វ', 'ស',
  'ហ', 'ឡ', 'អ'
];

const KHMER_DEPENDENT_VOWELS = [
  'ា', 'ិ', 'ី', 'ឹ', 'ឺ', 'ុ', 'ូ', 'ួ',
  'ើ', 'ឿ', 'ៀ', 'េ', 'ែ', 'ៃ', 'ោ', 'ៅ'
];

const KHMER_COMPOUND_VOWELS_SIGNS = [
  'ុំ', 'ំ', 'ាំ', 'ះ', 'ុះ', 'េះ', 'ោះ'
];

const KHMER_INDEPENDENT_VOWELS = [
  'ឥ', 'ឦ', 'ឧ', 'ឩ', 'ឪ', 'ឫ', 'ឬ', 'ឭ', 'ឮ', 'ឯ', 'ឰ', 'ឱ', 'ឳ'
];

const KHMER_DIACRITICS = [
  '់', '៌', '៍', '៎', '៏', '័', '៉', '៊', '្'
];

const KHMER_NUMERALS = [
  '០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'
];

const KHMER_PUNCTUATION = [
  '។', '៕', '៖', 'ៗ', '៛'
];

// 2. English Character Sets
const ENGLISH_LOWER = 'abcdefghijklmnopqrstuvwxyz'.split('');
const ENGLISH_UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const ENGLISH_DIGITS = '0123456789'.split('');
const ENGLISH_PUNCTUATION = [
  '`', '~', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')',
  '-', '_', '=', '+', '[', '{', ']', '}', '\\', '|',
  ';', ':', '\'', '"', ',', '<', '.', '>', '/', '?'
];

function analyzeCurriculum(layoutId) {
  const levels = JSON.parse(fs.readFileSync(`data/curriculum/${layoutId}/levels.json`, 'utf8')).levels;
  const lessons = JSON.parse(fs.readFileSync(`data/curriculum/${layoutId}/lessons.json`, 'utf8')).lessons;
  const rawExercises = JSON.parse(fs.readFileSync(`data/curriculum/${layoutId}/exercises.json`, 'utf8')).exercises;
  const exercises = Array.isArray(rawExercises) ? rawExercises : Object.values(rawExercises);

  const charOccurrences = new Map(); // char -> Set of lessonIds
  const allText = [];

  exercises.forEach(ex => {
    const text = ex.content || ex.text || '';
    allText.push(text);
    // Decompose into code points and graphemes
    for (const ch of text) {
      if (!charOccurrences.has(ch)) {
        charOccurrences.set(ch, new Set());
      }
      charOccurrences.get(ch).add(ex.lessonId);
    }
  });

  const fullCorpus = allText.join(' ');

  return {
    layoutId,
    levelCount: levels.length,
    lessonCount: lessons.length,
    exerciseCount: exercises.length,
    charOccurrences,
    fullCorpus,
    lessons
  };
}

console.log('=== PK KHMER TYPE CURRICULUM COVERAGE AUDIT ===\n');

['standard', 'nida', 'english'].forEach(layoutId => {
  const data = analyzeCurriculum(layoutId);
  console.log(`--------------------------------------------------`);
  console.log(`LAYOUT: ${layoutId.toUpperCase()}`);
  console.log(`Levels: ${data.levelCount} | Lessons: ${data.lessonCount} | Exercises: ${data.exerciseCount}`);
  console.log(`--------------------------------------------------`);

  if (layoutId === 'standard' || layoutId === 'nida') {
    // 1. Consonants
    const missingConsonants = KHMER_CONSONANTS.filter(c => !data.charOccurrences.has(c));
    console.log(`Consonants (33 total):`);
    console.log(`  Covered: ${KHMER_CONSONANTS.length - missingConsonants.length}/33`);
    if (missingConsonants.length > 0) {
      console.log(`  MISSING: ${missingConsonants.join(' ')}`);
    } else {
      console.log(`  [ALL 33 CONSONANTS PRESENT]`);
    }

    // 2. Dependent Vowels
    const missingDepVowels = KHMER_DEPENDENT_VOWELS.filter(v => !data.charOccurrences.has(v));
    console.log(`Dependent Vowels (16 total):`);
    console.log(`  Covered: ${KHMER_DEPENDENT_VOWELS.length - missingDepVowels.length}/16`);
    if (missingDepVowels.length > 0) {
      console.log(`  MISSING: ${missingDepVowels.join(' ')}`);
    } else {
      console.log(`  [ALL 16 DEPENDENT VOWELS PRESENT]`);
    }

    // 3. Diacritics & Signs
    const missingDiacritics = KHMER_DIACRITICS.filter(d => !data.charOccurrences.has(d));
    console.log(`Diacritics & Signs (9 total):`);
    console.log(`  Covered: ${KHMER_DIACRITICS.length - missingDiacritics.length}/9`);
    if (missingDiacritics.length > 0) {
      console.log(`  MISSING: ${missingDiacritics.join(' ')}`);
    } else {
      console.log(`  [ALL 9 DIACRITICS PRESENT]`);
    }

    // 4. Numerals
    const missingNumerals = KHMER_NUMERALS.filter(n => !data.charOccurrences.has(n));
    console.log(`Khmer Numerals (10 total):`);
    console.log(`  Covered: ${KHMER_NUMERALS.length - missingNumerals.length}/10`);
    if (missingNumerals.length > 0) {
      console.log(`  MISSING: ${missingNumerals.join(' ')}`);
    } else {
      console.log(`  [ALL 10 NUMERALS PRESENT]`);
    }

    // 5. Punctuation
    const missingPunct = KHMER_PUNCTUATION.filter(p => !data.charOccurrences.has(p));
    console.log(`Khmer Punctuation:`);
    console.log(`  Covered: ${KHMER_PUNCTUATION.length - missingPunct.length}/${KHMER_PUNCTUATION.length}`);
    if (missingPunct.length > 0) {
      console.log(`  MISSING: ${missingPunct.join(' ')}`);
    } else {
      console.log(`  [ALL PUNCTUATION PRESENT]`);
    }

    // 6. Independent Vowels
    const missingIndVowels = KHMER_INDEPENDENT_VOWELS.filter(v => !data.charOccurrences.has(v));
    console.log(`Independent Vowels (13 total):`);
    console.log(`  Covered: ${KHMER_INDEPENDENT_VOWELS.length - missingIndVowels.length}/13`);
    console.log(`  Present: ${KHMER_INDEPENDENT_VOWELS.filter(v => data.charOccurrences.has(v)).join(' ')}`);
    if (missingIndVowels.length > 0) {
      console.log(`  Missing: ${missingIndVowels.join(' ')}`);
    }
  }

  if (layoutId === 'english') {
    // 1. Lowercase letters
    const missingLower = ENGLISH_LOWER.filter(c => !data.charOccurrences.has(c));
    console.log(`English Lowercase (26 total):`);
    console.log(`  Covered: ${26 - missingLower.length}/26`);
    if (missingLower.length > 0) {
      console.log(`  MISSING: ${missingLower.join(' ')}`);
    } else {
      console.log(`  [ALL 26 LOWERCASE LETTERS PRESENT]`);
    }

    // 2. Uppercase letters
    const missingUpper = ENGLISH_UPPER.filter(c => !data.charOccurrences.has(c));
    console.log(`English Uppercase (26 total):`);
    console.log(`  Covered: ${26 - missingUpper.length}/26`);
    if (missingUpper.length > 0) {
      console.log(`  MISSING: ${missingUpper.join(' ')}`);
    } else {
      console.log(`  [ALL 26 UPPERCASE LETTERS PRESENT]`);
    }

    // 3. Digits
    const missingDigits = ENGLISH_DIGITS.filter(d => !data.charOccurrences.has(d));
    console.log(`English Digits (10 total):`);
    console.log(`  Covered: ${10 - missingDigits.length}/10`);
    if (missingDigits.length > 0) {
      console.log(`  MISSING: ${missingDigits.join(' ')}`);
    } else {
      console.log(`  [ALL 10 DIGITS PRESENT]`);
    }

    // 4. Punctuation
    const missingPunct = ENGLISH_PUNCTUATION.filter(p => !data.charOccurrences.has(p));
    console.log(`English Punctuation & Symbols (${ENGLISH_PUNCTUATION.length} total):`);
    console.log(`  Covered: ${ENGLISH_PUNCTUATION.length - missingPunct.length}/${ENGLISH_PUNCTUATION.length}`);
    if (missingPunct.length > 0) {
      console.log(`  MISSING: ${missingPunct.join(' ')}`);
    } else {
      console.log(`  [ALL PUNCTUATION PRESENT]`);
    }
  }

  console.log('');
});
