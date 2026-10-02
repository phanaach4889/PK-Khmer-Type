const fs = require('fs');
const path = require('path');

console.log('=== ENHANCING CURRICULA FOR 100% COMPLETE CHARACTER & VOWEL COVERAGE ===\n');

// ============================================================
// 1. PATCH ENGLISH CURRICULUM
// ============================================================
console.log('1. Patching English Curriculum...');
const enLessonsPath = path.join(__dirname, '../data/curriculum/english/lessons.json');
const enExercisesPath = path.join(__dirname, '../data/curriculum/english/exercises.json');

const enLessonsData = JSON.parse(fs.readFileSync(enLessonsPath, 'utf8'));
const enExercisesData = JSON.parse(fs.readFileSync(enExercisesPath, 'utf8'));

// A. Add Q to Capital Lessons
// In en-L08-02-E01 and en-L08-04-E01
if (enExercisesData.exercises['en-L08-02-E01']) {
  enExercisesData.exercises['en-L08-02-E01'].content = 'Asia Boston Canada Denver Europe Qatar Quebec Quick';
}
if (enExercisesData.exercises['en-L08-04-E01']) {
  enExercisesData.exercises['en-L08-04-E01'].content = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Queen', 'Quiet'
  ];
}

// B. Update en-L10 lessons to introduce ALL symbols
const enL10_03 = enLessonsData.lessons.find(l => l.id === 'en-L10-03');
if (enL10_03) {
  enL10_03.title = 'Exclamation, Colon & Number Symbols';
  enL10_03.description = 'Exclamation point, colon, and upper number symbols (@, #, $, %, ^, &, *)';
  enL10_03.newKeys = [
    { keyId: 'k1', layer: 'shift', char: '!', finger: 'lp' },
    { keyId: 'semicolon', layer: 'shift', char: ':', finger: 'rp' },
    { keyId: 'k2', layer: 'shift', char: '@', finger: 'lr' },
    { keyId: 'k3', layer: 'shift', char: '#', finger: 'lm' },
    { keyId: 'k4', layer: 'shift', char: '$', finger: 'li' },
    { keyId: 'k5', layer: 'shift', char: '%', finger: 'li' },
    { keyId: 'k6', layer: 'shift', char: '^', finger: 'ri' },
    { keyId: 'k7', layer: 'shift', char: '&', finger: 'ri' },
    { keyId: 'k8', layer: 'shift', char: '*', finger: 'rm' }
  ];
  enL10_03.requiredKeys = ['k1', 'semicolon', 'k2', 'k3', 'k4', 'k5', 'k6', 'k7', 'k8'];
}

if (enExercisesData.exercises['en-L10-03-E01']) {
  enExercisesData.exercises['en-L10-03-E01'].content = 'stop! look! note: email@domain.com #1 item $50 save 20% rate^2 Smith & Sons 5 * 5';
}
if (enExercisesData.exercises['en-L10-03-E02']) {
  enExercisesData.exercises['en-L10-03-E02'].content = 'score: 100! #tag sale $99 15% discount fish & chips x^y 8 * 8 is 64 @user';
}
if (enExercisesData.exercises['en-L10-03-E03']) {
  enExercisesData.exercises['en-L10-03-E03'].content = '!!! ! !! ::: : :: @@@ @ @@ ### # ## $$$ $ $$ %%% % %% ^^^ ^ ^^ &&& & && *** * **';
}

const enL10_04 = enLessonsData.lessons.find(l => l.id === 'en-L10-04');
if (enL10_04) {
  enL10_04.title = 'Parentheses, Brackets, Braces & Angle Brackets';
  enL10_04.description = 'Parentheses (), square brackets [], curly braces {}, and comparison symbols < >';
  enL10_04.newKeys = [
    { keyId: 'k9', layer: 'shift', char: '(', finger: 'rr' },
    { keyId: 'k0', layer: 'shift', char: ')', finger: 'rp' },
    { keyId: 'bracketL', layer: 'base', char: '[', finger: 'rp' },
    { keyId: 'bracketR', layer: 'base', char: ']', finger: 'rp' },
    { keyId: 'bracketL', layer: 'shift', char: '{', finger: 'rp' },
    { keyId: 'bracketR', layer: 'shift', char: '}', finger: 'rp' },
    { keyId: 'comma', layer: 'shift', char: '<', finger: 'rm' },
    { keyId: 'period', layer: 'shift', char: '>', finger: 'rr' }
  ];
  enL10_04.requiredKeys = ['k9', 'k0', 'bracketL', 'bracketR', 'comma', 'period'];
}

if (enExercisesData.exercises['en-L10-04-E01']) {
  enExercisesData.exercises['en-L10-04-E01'].content = '(one) (two) [three] [four] {alpha} {beta} <start> <end> 5 > 2 and 3 < 7';
}
if (enExercisesData.exercises['en-L10-04-E02']) {
  enExercisesData.exercises['en-L10-04-E02'].content = 'item (1) and item [2] in {block}; condition <limit> is true > false';
}
if (enExercisesData.exercises['en-L10-04-E03']) {
  enExercisesData.exercises['en-L10-04-E03'].content = '((( ( (( ))) ) )) [[[ [ [[ ]]] ] ]] {{{ { {{ }}} } }} <<< < << >>> > >>';
}

const enL10_05 = enLessonsData.lessons.find(l => l.id === 'en-L10-05');
if (enL10_05) {
  enL10_05.title = 'Hyphen, Plus, Equals, Underscore, Pipes & Tilde';
  enL10_05.description = 'Hyphen, equals, plus, underscore, backslash, vertical pipe, backquote, and tilde';
  enL10_05.newKeys = [
    { keyId: 'minus', layer: 'base', char: '-', finger: 'rp' },
    { keyId: 'equal', layer: 'base', char: '=', finger: 'rp' },
    { keyId: 'equal', layer: 'shift', char: '+', finger: 'rp' },
    { keyId: 'minus', layer: 'shift', char: '_', finger: 'rp' },
    { keyId: 'backslash', layer: 'base', char: '\\', finger: 'rp' },
    { keyId: 'backslash', layer: 'shift', char: '|', finger: 'rp' },
    { keyId: 'grave', layer: 'base', char: '`', finger: 'lp' },
    { keyId: 'grave', layer: 'shift', char: '~', finger: 'lp' }
  ];
  enL10_05.requiredKeys = ['minus', 'equal', 'backslash', 'grave'];
}

if (enExercisesData.exercises['en-L10-05-E01']) {
  enExercisesData.exercises['en-L10-05-E01'].content = '1 + 1 = 2 and 5 - 3 = 2; file_name_test C:\\path | pipe `code` ~home/';
}
if (enExercisesData.exercises['en-L10-05-E02']) {
  enExercisesData.exercises['en-L10-05-E02'].content = 'first_name + last_name = full_name; cat file | grep text; `value` ~ /root\\dir';
}
if (enExercisesData.exercises['en-L10-05-E03']) {
  enExercisesData.exercises['en-L10-05-E03'].content = '--- - -- === = == +++ + ++ ___ _ __ \\\\\\ \\ \\\\ ||| | || ``` ` `` ~~~ ~ ~~';
}

fs.writeFileSync(enLessonsPath, JSON.stringify(enLessonsData, null, 2), 'utf8');
fs.writeFileSync(enExercisesPath, JSON.stringify(enExercisesData, null, 2), 'utf8');
console.log('  [PASS] English curriculum patched.\n');

// ============================================================
// 2. PATCH KHMER STANDARD CURRICULUM
// ============================================================
console.log('2. Patching Khmer Standard Curriculum...');
const stdLessonsPath = path.join(__dirname, '../data/curriculum/standard/lessons.json');
const stdExercisesPath = path.join(__dirname, '../data/curriculum/standard/exercises.json');

const stdLessonsData = JSON.parse(fs.readFileSync(stdLessonsPath, 'utf8'));
const stdExercisesData = JSON.parse(fs.readFileSync(stdExercisesPath, 'utf8'));

// A. Lesson standard-L05-05: Ensure ៊ is practiced
if (stdExercisesData.exercises['standard-L05-05-E01']) {
  stdExercisesData.exercises['standard-L05-05-E01'].content = 'ុំុំុំ ៊៊៊ ុំ៊ុំ ុំុំ ៊៊ ុំ៊';
}
if (stdExercisesData.exercises['standard-L05-05-E02']) {
  stdExercisesData.exercises['standard-L05-05-E02'].content = ['កុំ', 'សុំ', 'រុំ', 'ហ៊ាន', 'ស៊ាំ', 'ដុំ'];
}

// B. Lesson standard-L09-03: Add ៎ (Kakka-bat on Shift+9)
const stdL09_03 = stdLessonsData.lessons.find(l => l.id === 'standard-L09-03');
if (stdL09_03) {
  if (!stdL09_03.newKeys.some(k => k.char === '៎')) {
    stdL09_03.newKeys.push({ keyId: 'k9', layer: 'shift', char: '៎', finger: 'rr' });
  }
}
if (stdExercisesData.exercises['standard-L09-03-E01']) {
  stdExercisesData.exercises['standard-L09-03-E01'].content = 'ព័ត៌មាន ធម៌ ពេជ្រ ដ៏ ប៉ុក៎ នុ៎ះ អូ៎ ហា៎';
}
if (stdExercisesData.exercises['standard-L09-03-E02']) {
  stdExercisesData.exercises['standard-L09-03-E02'].content = '័័័ ័ ័័ ៌៌៌ ៌ ៌៌ ៍៍៍ ៍ ៍៍ ៏៏៏ ៏ ៏៏ ៎៎៎ ៎ ៎៎';
}

// C. Lesson standard-L10-07: Introduce ALL 10 Khmer Numerals (០, ១, ២, ៣, ៤, ៥, ៦, ៧, ៨, ៩)
const stdL10_07 = stdLessonsData.lessons.find(l => l.id === 'standard-L10-07');
if (stdL10_07) {
  stdL10_07.title = 'Time and All Khmer Numbers (០-៩)';
  stdL10_07.titleKm = 'ពេលវេលា និង លេខខ្មែរទាំងអស់ (០-៩)';
  stdL10_07.description = 'Learn to type all ten Khmer numerals (០, ១, ២, ៣, ៤, ៥, ៦, ៧, ៨, ៩) and time words';
  stdL10_07.newKeys = [
    { keyId: 'k0', layer: 'base', char: '០', finger: 'rp' },
    { keyId: 'k1', layer: 'base', char: '១', finger: 'lp' },
    { keyId: 'k2', layer: 'base', char: '២', finger: 'lr' },
    { keyId: 'k3', layer: 'base', char: '៣', finger: 'lm' },
    { keyId: 'k4', layer: 'base', char: '៤', finger: 'li' },
    { keyId: 'k5', layer: 'base', char: '៥', finger: 'li' },
    { keyId: 'k6', layer: 'base', char: '៦', finger: 'ri' },
    { keyId: 'k7', layer: 'base', char: '៧', finger: 'ri' },
    { keyId: 'k8', layer: 'base', char: '៨', finger: 'rm' },
    { keyId: 'k9', layer: 'base', char: '៩', finger: 'rr' }
  ];
  stdL10_07.requiredKeys = ['k0', 'k1', 'k2', 'k3', 'k4', 'k5', 'k6', 'k7', 'k8', 'k9'];
}

if (stdExercisesData.exercises['standard-L10-07-E01']) {
  stdExercisesData.exercises['standard-L10-07-E01'].content = [
    'ថ្ងៃ', 'ខែ', 'ឆ្នាំ', 'ម៉ោង', 'ព្រឹក', 'យប់',
    '០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'
  ];
}
if (stdExercisesData.exercises['standard-L10-07-E02']) {
  stdExercisesData.exercises['standard-L10-07-E02'].content = '០១២ ៣៤៥ ៦៧៨ ៩ ឆ្នាំ ២០២៦ ម៉ោង ៧ ព្រឹក ថ្ងៃទី ១៥ ខែ មេសា ១០០ ភាគរយ ០១២ ៣៤៥ ៦៧៨';
}

// D. Lesson standard-L12-04: Introduce ALL 13 Independent Vowels
const stdL12_04 = stdLessonsData.lessons.find(l => l.id === 'standard-L12-04');
if (stdL12_04) {
  stdL12_04.title = 'All Independent Vowels (ស្រៈពេញតួ)';
  stdL12_04.titleKm = 'ស្រៈពេញតួទាំងអស់ (ឥ ឦ ឧ ឩ ឪ ឫ ឬ ឭ ឮ ឯ ឰ ឱ ឳ)';
  stdL12_04.description = 'Master all independent vowels in Khmer literature and formal script';
  stdL12_04.newKeys = [
    { keyId: 'i', layer: 'altgr', char: 'ឥ', finger: 'rm' },
    { keyId: 't', layer: 'altgr', char: 'ឦ', finger: 'li' },
    { keyId: 'u', layer: 'altgr', char: 'ឧ', finger: 'ri' },
    { keyId: 'a', layer: 'altgr', char: 'ឩ', finger: 'lp' },
    { keyId: 's', layer: 'altgr', char: 'ឪ', finger: 'lr' },
    { keyId: 'r', layer: 'altgr', char: 'ឫ', finger: 'li' },
    { keyId: 'r', layer: 'shift', char: 'ឬ', finger: 'li' },
    { keyId: 'k', layer: 'altgr', char: 'ឭ', finger: 'rm' },
    { keyId: 'j', layer: 'altgr', char: 'ឮ', finger: 'ri' },
    { keyId: 'e', layer: 'altgr', char: 'ឯ', finger: 'lm' },
    { keyId: 'l', layer: 'altgr', char: 'ឰ', finger: 'rr' },
    { keyId: 'o', layer: 'altgr', char: 'ឱ', finger: 'rr' },
    { keyId: 'p', layer: 'altgr', char: 'ឳ', finger: 'rp' },
    { keyId: 'equal', layer: 'base', char: 'ឲ', finger: 'rp' }
  ];
  stdL12_04.requiredKeys = ['i', 't', 'u', 'a', 's', 'r', 'k', 'j', 'e', 'l', 'o', 'p', 'equal'];
}

if (stdExercisesData.exercises['standard-L12-04-E01']) {
  stdExercisesData.exercises['standard-L12-04-E01'].content = 'ឪពុក ឧត្តម ឱ្យ ឯកសារ ឱកាស ឥឡូវ ឦសាន ឩសាន ឫស្សី ឬកពា ឭកិក ឮសូរ ឰដ៏ ឳសថ';
}
if (stdExercisesData.exercises['standard-L12-04-E02']) {
  stdExercisesData.exercises['standard-L12-04-E02'].content = 'ឥឥ ឦឦ ឧឧ ឩឩ ឪឪ ឫឫ ឬឬ ឭឭ ឮឮ ឯឯ ឰឰ ឱឱ ឳឳ ឪពុក ឥឡូវ ឦសាន ឧត្តម ឫស្សី ឯកសារ ឱកាស';
}

fs.writeFileSync(stdLessonsPath, JSON.stringify(stdLessonsData, null, 2), 'utf8');
fs.writeFileSync(stdExercisesPath, JSON.stringify(stdExercisesData, null, 2), 'utf8');
console.log('  [PASS] Khmer Standard curriculum patched.\n');

// ============================================================
// 3. PATCH KHMER NIDA CURRICULUM
// ============================================================
console.log('3. Patching Khmer NiDA Curriculum...');
const nidaLessonsPath = path.join(__dirname, '../data/curriculum/nida/lessons.json');
const nidaExercisesPath = path.join(__dirname, '../data/curriculum/nida/exercises.json');

const nidaLessonsData = JSON.parse(fs.readFileSync(nidaLessonsPath, 'utf8'));
const nidaExercisesData = JSON.parse(fs.readFileSync(nidaExercisesPath, 'utf8'));

// A. Lesson nida-L09-03: Add ៎ (Kakka-bat on AltGr+=)
const nidaL09_03 = nidaLessonsData.lessons.find(l => l.id === 'nida-L09-03');
if (nidaL09_03) {
  if (!nidaL09_03.newKeys.some(k => k.char === '៎')) {
    nidaL09_03.newKeys.push({ keyId: 'equal', layer: 'altgr', char: '៎', finger: 'rp' });
  }
}
if (nidaExercisesData.exercises['nida-L09-03-E01']) {
  nidaExercisesData.exercises['nida-L09-03-E01'].content = 'ព័ត៌មាន ធម៌ ពេជ្រ ដ៏ ប៉ុក៎ នុ៎ះ អូ៎ ហា៎';
}
if (nidaExercisesData.exercises['nida-L09-03-E02']) {
  nidaExercisesData.exercises['nida-L09-03-E02'].content = '័័័ ័ ័័ ៌៌៌ ៌ ៌៌ ៍៍៍ ៍ ៍៍ ៏៏៏ ៏ ៏៏ ៎៎៎ ៎ ៎៎';
}

// B. Lesson nida-L10-07: Introduce ALL 10 Khmer Numerals (០, ១, ២, ៣, ៤, ៥, ៦, ៧, ៨, ៩)
const nidaL10_07 = nidaLessonsData.lessons.find(l => l.id === 'nida-L10-07');
if (nidaL10_07) {
  nidaL10_07.title = 'Time and All Khmer Numbers (០-៩)';
  nidaL10_07.titleKm = 'ពេលវេលា និង លេខខ្មែរទាំងអស់ (០-៩)';
  nidaL10_07.description = 'Learn to type all ten Khmer numerals (០, ១, ២, ៣, ៤, ៥, ៦, ៧, ៨, ៩) and time words';
  nidaL10_07.newKeys = [
    { keyId: 'k0', layer: 'base', char: '០', finger: 'rp' },
    { keyId: 'k1', layer: 'base', char: '១', finger: 'lp' },
    { keyId: 'k2', layer: 'base', char: '២', finger: 'lr' },
    { keyId: 'k3', layer: 'base', char: '៣', finger: 'lm' },
    { keyId: 'k4', layer: 'base', char: '៤', finger: 'li' },
    { keyId: 'k5', layer: 'base', char: '៥', finger: 'li' },
    { keyId: 'k6', layer: 'base', char: '៦', finger: 'ri' },
    { keyId: 'k7', layer: 'base', char: '៧', finger: 'ri' },
    { keyId: 'k8', layer: 'base', char: '៨', finger: 'rm' },
    { keyId: 'k9', layer: 'base', char: '៩', finger: 'rr' }
  ];
  nidaL10_07.requiredKeys = ['k0', 'k1', 'k2', 'k3', 'k4', 'k5', 'k6', 'k7', 'k8', 'k9'];
}

if (nidaExercisesData.exercises['nida-L10-07-E01']) {
  nidaExercisesData.exercises['nida-L10-07-E01'].content = [
    'ថ្ងៃ', 'ខែ', 'ឆ្នាំ', 'ម៉ោង', 'ព្រឹក', 'យប់',
    '០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'
  ];
}
if (nidaExercisesData.exercises['nida-L10-07-E02']) {
  nidaExercisesData.exercises['nida-L10-07-E02'].content = '០១២ ៣៤៥ ៦៧៨ ៩ ឆ្នាំ ២០២៦ ម៉ោង ៧ ព្រឹក ថ្ងៃទី ១៥ ខែ មេសា ១០០ ភាគរយ ០១២ ៣៤៥ ៦៧៨';
}

// C. Lesson nida-L12-04: Introduce ALL 13 Independent Vowels
const nidaL12_04 = nidaLessonsData.lessons.find(l => l.id === 'nida-L12-04');
if (nidaL12_04) {
  nidaL12_04.title = 'All Independent Vowels (ស្រៈពេញតួ)';
  nidaL12_04.titleKm = 'ស្រៈពេញតួទាំងអស់ (ឥ ឦ ឧ ឩ ឪ ឫ ឬ ឭ ឮ ឯ ឰ ឱ ឳ)';
  nidaL12_04.description = 'Master all independent vowels in Khmer literature and formal script';
  nidaL12_04.newKeys = [
    { keyId: 'minus', layer: 'base', char: 'ឥ', finger: 'rp' },
    { keyId: 'i', layer: 'altgr', char: 'ឦ', finger: 'rm' },
    { keyId: 'bracketR', layer: 'shift', char: 'ឧ', finger: 'rp' },
    { keyId: 'bracketL', layer: 'altgr', char: 'ឩ', finger: 'rp' },
    { keyId: 'bracketR', layer: 'base', char: 'ឪ', finger: 'rp' },
    { keyId: 'r', layer: 'altgr', char: 'ឫ', finger: 'li' },
    { keyId: 'r', layer: 'shift', char: 'ឬ', finger: 'li' },
    { keyId: 'backslash', layer: 'shift', char: 'ឭ', finger: 'rp' },
    { keyId: 'backslash', layer: 'base', char: 'ឮ', finger: 'rp' },
    { keyId: 'e', layer: 'altgr', char: 'ឯ', finger: 'lm' },
    { keyId: 'p', layer: 'altgr', char: 'ឰ', finger: 'rp' },
    { keyId: 'o', layer: 'altgr', char: 'ឱ', finger: 'rr' },
    { keyId: 'bracketR', layer: 'altgr', char: 'ឳ', finger: 'rp' },
    { keyId: 'equal', layer: 'base', char: 'ឲ', finger: 'rp' }
  ];
  nidaL12_04.requiredKeys = ['minus', 'i', 'bracketR', 'bracketL', 'r', 'backslash', 'e', 'p', 'o', 'equal'];
}

if (nidaExercisesData.exercises['nida-L12-04-E01']) {
  nidaExercisesData.exercises['nida-L12-04-E01'].content = 'ឪពុក ឧត្តម ឱ្យ ឯកសារ ឱកាស ឥឡូវ ឦសាន ឩសាន ឫស្សី ឬកពា ឭកិក ឮសូរ ឰដ៏ ឳសថ';
}
if (nidaExercisesData.exercises['nida-L12-04-E02']) {
  nidaExercisesData.exercises['nida-L12-04-E02'].content = 'ឥឥ ឦឦ ឧឧ ឩឩ ឪឪ ឫឫ ឬឬ ឭឭ ឮឮ ឯឯ ឰឰ ឱឱ ឳឳ ឪពុក ឥឡូវ ឦសាន ឧត្តម ឫស្សី ឯកសារ ឱកាស';
}

fs.writeFileSync(nidaLessonsPath, JSON.stringify(nidaLessonsData, null, 2), 'utf8');
fs.writeFileSync(nidaExercisesPath, JSON.stringify(nidaExercisesData, null, 2), 'utf8');
console.log('  [PASS] Khmer NiDA curriculum patched.\n');

console.log('ALL CURRICULUM PATCHES WRITTEN SUCCESSFULLY!');
