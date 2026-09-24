const fs = require('fs');
const { ENGLISH_ADAPTIVE_WORDS } = require('../data/adaptive-vocab.js');
const kmEx = JSON.parse(fs.readFileSync('data/curriculum/nida/exercises.json', 'utf8'));
const kmWords = new Set(['អាវ','តា','យាយ','មាន','ខាន','បាន','ចាន','តារា','កាច','សាលា','កាក់','ដាក់','កូន','ដើរ','ឆាប់','ភ្នំ','ទៅ','មក','រត់','យូរ','ទិញ','ពីរ','ដេក','ដែក','ស្គាល់','ស្អាត','កម្ពុជា','បញ្ជី','សង្ឃ','សម្បត្តិ','បន្ទប់','ត្រី','ក្រៅ','ខ្លា','ឆ្កែ','ផ្លូវ','ម្ហូប','ស្ងួត','ក្បាល','ញាតិ','ញញឹម','អ្នក','អាន']);

Object.values(kmEx.exercises).forEach(e => {
  const text = typeof e.content === 'string' ? e.content : (Array.isArray(e.content) ? e.content.join(' ') : (e.text || ''));
  const m = text.match(/[\u1780-\u17DD]+/g);
  if (m) m.forEach(w => {
    if (w.length >= 2 && !/^(.)\1+$/.test(w)) {
      kmWords.add(w);
    }
  });
});

const sortedKm = Array.from(kmWords).sort();
const out = `/* PK Khmer Type — Curated Offline Adaptive Vocabulary */
(function(global){
  'use strict';

  const ENGLISH_ADAPTIVE_WORDS = ${JSON.stringify(ENGLISH_ADAPTIVE_WORDS)};

  const KHMER_ADAPTIVE_WORDS = ${JSON.stringify(sortedKm)};

  if(typeof module !== 'undefined' && module.exports){
    module.exports = { ENGLISH_ADAPTIVE_WORDS, KHMER_ADAPTIVE_WORDS };
  }
  global.ENGLISH_ADAPTIVE_WORDS = ENGLISH_ADAPTIVE_WORDS;
  global.KHMER_ADAPTIVE_WORDS = KHMER_ADAPTIVE_WORDS;
})(typeof window !== 'undefined' ? window : global);
`;

fs.writeFileSync('data/adaptive-vocab.js', out, 'utf8');
console.log('Saved data/adaptive-vocab.js with ' + ENGLISH_ADAPTIVE_WORDS.length + ' English words and ' + sortedKm.length + ' Khmer words!');

