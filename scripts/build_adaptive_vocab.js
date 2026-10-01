const fs = require('fs');

// 1. Current English words baseline
const oldVocab = require('../data/adaptive-vocab.js');
const enWords = new Set((oldVocab.ENGLISH_ADAPTIVE_WORDS || []).map(w => w.toLowerCase().trim()));

// Essential core English words across all stages, with rich coverage of all unlocked keys
const coreEnglish = [
  // Core 2-letter basics
  'to', 'so', 'no', 'or', 'of', 'on', 'us', 'up', 'it', 'if', 'in', 'is', 'at', 'as', 'am', 'an',
  'me', 'my', 'we', 'he', 'be', 'by', 'do', 'go',
  // Core 3-letter basics
  'too', 'not', 'off', 'out', 'one', 'our', 'had', 'was', 'get', 'has', 'two', 'did', 'its', 'put',
  'use', 'see', 'day', 'say', 'way', 'boy', 'let', 'man', 'new', 'now', 'old', 'who', 'how', 'any',
  'can', 'all', 'art', 'eat', 'ate', 'tea', 'tie', 'tin', 'ten', 'net', 'nit', 'lot', 'lit', 'rot',
  'ton', 'oil', 'oar', 'oat', 'ore', 'sun', 'son', 'red', 'car', 'dog', 'cat', 'pen', 'bed', 'box',
  'top', 'hat', 'cup', 'run', 'fit', 'sit', 'set', 'win', 'dry', 'wet', 'fly', 'sky', 'cry', 'try',
  // Deep Stage T words (E N I A R L + T)
  'at', 'ate', 'eat', 'tea', 'tie', 'tin', 'ten', 'net', 'nit', 'lit', 'late', 'line', 'lane', 'lean',
  'rate', 'tire', 'tree', 'tail', 'tent', 'tear', 'neat', 'rent', 'train', 'trail', 'trait', 'treat',
  'little', 'letter', 'talent', 'tenant', 'rant', 'tart', 'tilt', 'tile', 'tale', 'tall', 'tatter',
  'teeter', 'tenant', 'tenet', 'tiller', 'tine', 'tinsel', 'totter', 'attrite', 'attain', 'attend',
  // Deep Stage O words (E N I A R L T + O)
  'to', 'too', 'no', 'not', 'on', 'one', 'or', 'ore', 'lot', 'loot', 'tool', 'toot', 'root', 'rot',
  'roll', 'role', 'toll', 'iron', 'lion', 'onto', 'into', 'note', 'noon', 'oil', 'oar', 'oat', 'oral',
  'ration', 'ratio', 'tailor', 'total', 'riot', 'roar', 'rotate', 'rotor', 'rotten', 'tenor', 'toil',
  'ton', 'tort', 'totter', 'traitor', 'trio', 'trot', 'notion', 'lotion', 'onion', 'alteration',
  'notation', 'iteration', 'rationale', 'interior', 'atoll', 'loiter', 'alone', 'loan', 'toilet',
  'tore', 'none', 'neon', 'oration', 'orator', 'oratorio', 'roan', 'roil', 'rote', 'rota', 'taro',
  // Deep Stage S words
  'as', 'asset', 'assent', 'east', 'easier', 'island', 'is', 'less', 'lesson', 'loss', 'lose', 'nest',
  'noise', 'nose', 'raise', 'rise', 'rose', 'sail', 'sale', 'salt', 'sea', 'seal', 'seat', 'season',
  'see', 'seen', 'sense', 'sensor', 'series', 'set', 'settle', 'sin', 'sir', 'sister', 'site', 'sole',
  'solo', 'sonar', 'son', 'soon', 'sore', 'sort', 'soul', 'star', 'stare', 'start', 'state', 'station',
  'steal', 'steel', 'steer', 'stir', 'stone', 'stool', 'store', 'strain', 'stress', 'toss', 'assert',
  // Deep Stage U words
  'adult', 'annual', 'audit', 'aunt', 'auto', 'autumn', 'blur', 'burn', 'burst', 'bus', 'dust', 'fault',
  'flute', 'fruit', 'glue', 'guard', 'guitar', 'insult', 'issue', 'juice', 'june', 'lunar', 'must',
  'natural', 'neutral', 'noun', 'nurse', 'nut', 'out', 'outline', 'ruin', 'rule', 'run', 'rust', 'rural',
  // Deep Stage D words
  'add', 'ahead', 'aid', 'and', 'around', 'bad', 'bed', 'bend', 'bind', 'bird', 'blade', 'blend', 'blind',
  'blood', 'board', 'bold', 'bond', 'bound', 'bread', 'broad', 'build', 'cloud', 'cold', 'could', 'crowd',
  'dad', 'dance', 'dare', 'dark', 'date', 'dead', 'deal', 'dear', 'death', 'decide', 'deep', 'deer', 'den',
  'desk', 'dial', 'diet', 'dine', 'dirt', 'dish', 'dive', 'do', 'doctor', 'dog', 'doll', 'door', 'dot',
  // Deep Stage Y words
  'any', 'away', 'bay', 'boy', 'busy', 'buy', 'by', 'city', 'clay', 'copy', 'cry', 'daily', 'day', 'deny',
  'dry', 'duty', 'early', 'easy', 'empty', 'enjoy', 'entry', 'every', 'eye', 'fly', 'gray', 'guy', 'heavy',
  // Additional comprehensive words
  'sonar', 'soon', 'sore', 'sort', 'soul', 'stone', 'stool', 'store', 'toss', 'soil', 'boil', 'coin',
  'join', 'moist', 'point', 'poison', 'voice', 'void', 'avoid', 'noise', 'choice', 'boar', 'board',
  'boast', 'boat', 'body', 'bold', 'bolt', 'bomb', 'bond', 'bone', 'book', 'boom', 'boot', 'booth',
  'border', 'bore', 'born', 'borrow', 'boss', 'both', 'bother', 'bottle', 'bottom', 'bough', 'bounce',
  'bound', 'bow', 'bowl', 'box', 'boxer', 'coat', 'coast', 'coach', 'coax', 'code', 'coffee', 'cold',
  'comb', 'come', 'cone', 'cook', 'cool', 'cope', 'copper', 'copy', 'cord', 'cork', 'corn', 'corner',
  'cost', 'cotton', 'cove', 'cover', 'cow', 'crow', 'crowd', 'crop', 'cross', 'door', 'floor', 'honor',
  'horror', 'indoor', 'lemon', 'lesson', 'motor', 'actor', 'doctor', 'donor', 'canoe', 'control', 'crane'
];

coreEnglish.forEach(w => {
  const clean = w.toLowerCase().trim();
  if (/^[a-z]+$/.test(clean)) enWords.add(clean);
});
const sortedEn = Array.from(enWords).sort();

// 2. Khmer vocabulary enrichment
const kmWords = new Set([
  'អាវ','តា','យាយ','មាន','ខាន','បាន','ចាន','តារា','កាច','សាលា','កាក់','ដាក់','កូន','ដើរ','ឆាប់',
  'ភ្នំ','ទៅ','មក','រត់','យូរ','ទិញ','ពីរ','ដេក','ដែក','ស្គាល់','ស្អាត','កម្ពុជា','បញ្ជី','សង្ឃ',
  'សម្បត្តិ','បន្ទប់','ត្រី','ក្រៅ','ខ្លា','ឆ្កែ','ផ្លូវ','ម្ហូប','ស្ងួត','ក្បាល','ញាតិ','ញញឹម','អ្នក','អាន',
  // Explicit items for punctuation, currency, and rare signs
  'បាន។','មក។','រៀន។','ចាន។','ដេក។','ខ្មែរ។','ស្អាត។','នីដា។','ជោគជ័យ។','ត្រឹមត្រូវ។','អ្នក។','វាចា។','យូរលង់។','រហ័ស។','អត់ធ្មត់។','អបអរសាទរ។',
  'តម្លៃ៛','ចាយ៛','ប្រាក់៛','លុយ៛','ប្រាក់រៀល៛',
  'កុំ','ដុំ','រុំ','សុំ','សូម','ភូមិ','ក្រុម','កូនកុំ','កំរុំ','ជុំវិញ','ប្រជុំ','ក្ដុំ',
  'ចាំ','ឆ្នាំ','នាំ','ញ៉ាំ','ហាត់ប្រាណ','ាំាំាំ','សាំ','កាំ','ដាំ','ថ្នាំ','កាំភ្លើង','ប្រចាំ',
  'ស្វាគមន៍','ព័ត៌មាន','ទូរស័ព្ទ','ប្រវត្តិសាស្ត្រ','អន្តរជាតិ','អង្គរវត្ត','វត្ត','វប្បធម៌','ព្រះអាទិត្យ','សប្តាហ៍','អាទិត្យ',
  'ដ៏','ដ៏ល្អ','ដ៏ថ្លៃ','ដ៏វិសេស','ដ៏ឧត្តម','ក៍','៏ៗ'
]);

// Include exercises.json words
try {
  const kmEx = JSON.parse(fs.readFileSync('data/curriculum/nida/exercises.json', 'utf8'));
  Object.values(kmEx.exercises || {}).forEach(e => {
    const text = typeof e.content === 'string' ? e.content : (Array.isArray(e.content) ? e.content.join(' ') : (e.text || ''));
    const m = text.match(/[\u1780-\u17FF]+/g);
    if (m) m.forEach(w => {
      const clean = w.replace(/[៕៖0-9\s]/g, '').trim();
      if (clean.length >= 2 && !/^(.)\1+$/.test(clean)) {
        kmWords.add(clean);
      }
    });
  });
} catch (e) {}

// Include curriculum-data.js words
try {
  const curContent = fs.readFileSync('data/curriculum-data.js', 'utf8');
  const curMatches = curContent.match(/[\u1780-\u17FF]+/g) || [];
  curMatches.forEach(w => {
    const clean = w.replace(/[៕៖0-9\s]/g, '').trim();
    if (clean.length >= 2 && clean.length <= 15 && !/^(.)\1+$/.test(clean)) {
      kmWords.add(clean);
    }
  });
} catch (e) {}

const sortedKm = Array.from(kmWords).sort();

const out = `/* PK Khmer Type — Curated Offline Adaptive Vocabulary */
(function(global){
  'use strict';

  const ENGLISH_ADAPTIVE_WORDS = ${JSON.stringify(sortedEn)};

  const KHMER_ADAPTIVE_WORDS = ${JSON.stringify(sortedKm)};

  if(typeof module !== 'undefined' && module.exports){
    module.exports = { ENGLISH_ADAPTIVE_WORDS, KHMER_ADAPTIVE_WORDS };
  }
  global.ENGLISH_ADAPTIVE_WORDS = ENGLISH_ADAPTIVE_WORDS;
  global.KHMER_ADAPTIVE_WORDS = KHMER_ADAPTIVE_WORDS;
})(typeof window !== 'undefined' ? window : global);
`;

fs.writeFileSync('data/adaptive-vocab.js', out, 'utf8');
console.log('Saved data/adaptive-vocab.js with ' + sortedEn.length + ' English words and ' + sortedKm.length + ' Khmer words!');
