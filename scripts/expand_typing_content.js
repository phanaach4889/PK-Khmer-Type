const fs = require('fs');

const enWords = [
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "I",
  "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
  "this", "but", "his", "by", "from", "they", "we", "say", "her", "she",
  "or", "an", "will", "my", "one", "all", "would", "there", "their", "what",
  "so", "up", "out", "if", "about", "who", "get", "which", "go", "me",
  "when", "make", "can", "like", "time", "no", "just", "him", "know", "take",
  "people", "into", "year", "your", "good", "some", "could", "them", "see", "other",
  "than", "then", "now", "look", "only", "come", "its", "over", "think", "also",
  "back", "after", "use", "two", "how", "our", "work", "first", "well", "way",
  "even", "new", "want", "because", "any", "these", "give", "day", "most", "us"
];

const khWords = [
  "ខ្ញុំ", "អ្នក", "យើង", "គាត់", "ពួកគាត់", "វា", "នេះ", "នោះ", "អី", "ណា",
  "ទៅ", "មក", "ធ្វើ", "បាន", "មាន", "ចង់", "ដឹង", "ឃើញ", "ញ៉ាំ", "ផឹក",
  "ដើរ", "រត់", "អង្គុយ", "ឈរ", "ដេក", "និយាយ", "ស្តាប់", "មើល", "សរសេរ", "អាន",
  "សួរ", "ឆ្លើយ", "យក", "ដាក់", "បើក", "បិទ", "ទិញ", "លក់", "ចូល", "ចេញ",
  "ឡើង", "ចុះ", "ធំ", "តូច", "វែង", "ខ្លី", "ល្អ", "អាក្រក់", "ថ្មី", "ចាស់",
  "ស", "ខ្មៅ", "ក្រហម", "លឿង", "ខៀវ", "បៃតង", "ឆ្ងាញ់", "ផ្អែម", "ជូរ", "ល្វីង",
  "ប្រៃ", "ហិរ", "ត្រជាក់", "ក្តៅ", "ភ្លឺ", "ងងឹត", "ស្អាត", "អាក្រក់", "លឿន", "យឺត",
  "ថ្ងៃ", "យប់", "ព្រឹក", "ល្ងាច", "ម៉ោង", "នាទី", "វិនាទី", "ថ្ងៃនេះ", "ថ្ងៃស្អែក", "ម្សិលមិញ",
  "ឆ្នាំ", "ខែ", "អាទិត្យ", "ផ្ទះ", "សាលា", "ផ្សារ", "វត្ត", "មន្ទីរពេទ្យ", "ផ្លូវ", "ឡាន",
  "ម៉ូតូ", "កង់", "ទូក", "យន្តហោះ", "ទឹក", "ភ្លើង", "ដី", "ខ្យល់", "មេឃ", "ផ្កាយ"
];

const data = {
  WORD_BANK: khWords,
  WORD_BANK_EN: enWords,
  RACE_DIFFICULTIES: ["easy", "medium", "hard", "expert"],
  RACE_LENGTHS: ["15", "30", "60", "text"]
};

fs.writeFileSync('data/typing-content.json', JSON.stringify(data, null, 2));
console.log('Expanded typing-content.json');
