/* ============================================================
   PK Khmer Type — Smart Mouse Cursor Inspector & Kinematic Guide
   Transforms the mouse cursor into an active, intelligent learning companion:
   - Interactive Key Inspector HUD following the mouse cursor
   - Anatomical finger & hand guidance on mouse hover
   - Real-time layer preview ("Rest pointer to preview a layer")
   - Exercise character decoder & keystroke recipe assistant
   - Sleek cyber reticle cursor with toggleable toolbar control
   ============================================================ */

(function(global){
  'use strict';

  const STORAGE_KEY = 'pkMouseInspectorEnabled';

  // Comprehensive Khmer Character Linguistic Database
  const KHMER_CHAR_DATA = {
    // 33 Consonants
    'ក': { name: 'Ka', nameKm: 'កា', ipa: '[kɑː]', series: '1st (អ-ពួក)', group: 'Velar', type: 'Consonant', sub: '្ក' },
    'ខ': { name: 'Kha', nameKm: 'ខា', ipa: '[kʰɑː]', series: '1st (អ-ពួក)', group: 'Velar', type: 'Consonant', sub: '្ខ' },
    'គ': { name: 'Ko', nameKm: 'គោ', ipa: '[kɔː]', series: '2nd (អ៊-ពួក)', group: 'Velar', type: 'Consonant', sub: '្គ' },
    'ឃ': { name: 'Kho', nameKm: 'ឃោ', ipa: '[kʰɔː]', series: '2nd (អ៊-ពួក)', group: 'Velar', type: 'Consonant', sub: '្ឃ' },
    'ង': { name: 'Ngo', nameKm: 'ង៉ោ', ipa: '[ŋɔː]', series: '2nd (អ៊-ពួក)', group: 'Velar', type: 'Consonant', sub: '្ង' },
    'ច': { name: 'Ca', nameKm: 'ចា', ipa: '[cɑː]', series: '1st (អ-ពួក)', group: 'Palatal', type: 'Consonant', sub: '្ច' },
    'ឆ': { name: 'Cha', nameKm: 'ឆា', ipa: '[cʰɑː]', series: '1st (អ-ពួក)', group: 'Palatal', type: 'Consonant', sub: '្ឆ' },
    'ជ': { name: 'Co', nameKm: 'ជោ', ipa: '[cɔː]', series: '2nd (អ៊-ពួក)', group: 'Palatal', type: 'Consonant', sub: '្ជ' },
    'ឈ': { name: 'Cho', nameKm: 'ឈោ', ipa: '[cʰɔː]', series: '2nd (អ៊-ពួក)', group: 'Palatal', type: 'Consonant', sub: '្ឈ' },
    'ញ': { name: 'Nyo', nameKm: 'ញោ', ipa: '[ɲɔː]', series: '2nd (អ៊-ពួក)', group: 'Palatal', type: 'Consonant', sub: '្ញ' },
    'ដ': { name: 'Da', nameKm: 'ដា', ipa: '[ɗɑː]', series: '1st (អ-ពួក)', group: 'Retroflex', type: 'Consonant', sub: '្ដ' },
    'ឋ': { name: 'Tha', nameKm: 'ឋា', ipa: '[tʰɑː]', series: '1st (អ-ពួក)', group: 'Retroflex', type: 'Consonant', sub: '្ឋ' },
    'ឌ': { name: 'Do', nameKm: 'ឌោ', ipa: '[ɗɔː]', series: '2nd (អ៊-ពួក)', group: 'Retroflex', type: 'Consonant', sub: '្ឌ' },
    'ឍ': { name: 'Tho', nameKm: 'ឍោ', ipa: '[tʰɔː]', series: '2nd (អ៊-ពួក)', group: 'Retroflex', type: 'Consonant', sub: '្ឍ' },
    'ណ': { name: 'Na', nameKm: 'ណា', ipa: '[nɑː]', series: '1st (អ-ពួក)', group: 'Retroflex', type: 'Consonant', sub: '្ណ' },
    'ត': { name: 'Ta', nameKm: 'តា', ipa: '[tɑː]', series: '1st (អ-ពួក)', group: 'Dental', type: 'Consonant', sub: '្ត' },
    'ថ': { name: 'Tha', nameKm: 'ថា', ipa: '[tʰɑː]', series: '1st (អ-ពួក)', group: 'Dental', type: 'Consonant', sub: '្ថ' },
    'ទ': { name: 'To', nameKm: 'ទោ', ipa: '[tɔː]', series: '2nd (អ៊-ពួក)', group: 'Dental', type: 'Consonant', sub: '្ទ' },
    'ធ': { name: 'Tho', nameKm: 'ធោ', ipa: '[tʰɔː]', series: '2nd (អ៊-ពួក)', group: 'Dental', type: 'Consonant', sub: '្ធ' },
    'ន': { name: 'No', nameKm: 'នោ', ipa: '[nɔː]', series: '2nd (អ៊-ពួក)', group: 'Dental', type: 'Consonant', sub: '្ន' },
    'ប': { name: 'Ba', nameKm: 'បា', ipa: '[ɓɑː]', series: '1st (អ-ពួក)', group: 'Labial', type: 'Consonant', sub: '្ប' },
    'ផ': { name: 'Pha', nameKm: 'ផា', ipa: '[pʰɑː]', series: '1st (អ-ពួក)', group: 'Labial', type: 'Consonant', sub: '្ផ' },
    'ព': { name: 'Po', nameKm: 'ពោ', ipa: '[pɔː]', series: '2nd (អ៊-ពួក)', group: 'Labial', type: 'Consonant', sub: '្ព' },
    'ភ': { name: 'Pho', nameKm: 'ភោ', ipa: '[pʰɔː]', series: '2nd (អ៊-ពួក)', group: 'Labial', type: 'Consonant', sub: '្ភ' },
    'ម': { name: 'Mo', nameKm: 'មោ', ipa: '[mɔː]', series: '2nd (អ៊-ពួក)', group: 'Labial', type: 'Consonant', sub: '្ម' },
    'យ': { name: 'Yo', nameKm: 'យោ', ipa: '[jɔː]', series: '2nd (អ៊-ពួក)', group: 'Liquid', type: 'Consonant', sub: '្យ' },
    'រ': { name: 'Ro', nameKm: 'រោ', ipa: '[rɔː]', series: '2nd (អ៊-ពួក)', group: 'Liquid', type: 'Consonant', sub: '្រ' },
    'ល': { name: 'Lo', nameKm: 'លោ', ipa: '[lɔː]', series: '2nd (អ៊-ពួក)', group: 'Liquid', type: 'Consonant', sub: '្ល' },
    'វ': { name: 'Vo', nameKm: 'វោ', ipa: '[ʋɔː]', series: '2nd (អ៊-ពួក)', group: 'Liquid', type: 'Consonant', sub: '្វ' },
    'ស': { name: 'Sa', nameKm: 'សា', ipa: '[sɑː]', series: '1st (អ-ពួក)', group: 'Sibilant', type: 'Consonant', sub: '្ស' },
    'ហ': { name: 'Ha', nameKm: 'ហា', ipa: '[hɑː]', series: '1st (អ-ពួក)', group: 'Aspirate', type: 'Consonant', sub: '្ហ' },
    'ឡ': { name: 'La', nameKm: 'ឡា', ipa: '[lɑː]', series: '1st (អ-ពួក)', group: 'Liquid', type: 'Consonant (No Subscript)' },
    'អ': { name: 'Qa', nameKm: 'អា', ipa: '[ʔɑː]', series: '1st (អ-ពួក)', group: 'Glottal', type: 'Consonant', sub: '្អ' },

    // Dependent Vowels (ស្រៈនិស្ស័យ)
    'ា': { name: 'Sra Aa', nameKm: 'ស្រៈ អា', ipa: '[aː / iə]', type: 'Dependent Vowel' },
    'ិ': { name: 'Sra E', nameKm: 'ស្រៈ អិ', ipa: '[e / i]', type: 'Dependent Vowel' },
    'ី': { name: 'Sra Ey', nameKm: 'ស្រៈ អី', ipa: '[əj / iː]', type: 'Dependent Vowel' },
    'ឹ': { name: 'Sra Oe', nameKm: 'ស្រៈ អឹ', ipa: '[ə / ɨ]', type: 'Dependent Vowel' },
    'ឺ': { name: 'Sra Oeu', nameKm: 'ស្រៈ អឺ', ipa: '[əɨ / ɨː]', type: 'Dependent Vowel' },
    'ុ': { name: 'Sra O', nameKm: 'ស្រៈ អុ', ipa: '[o / u]', type: 'Dependent Vowel' },
    'ូ': { name: 'Sra Oo', nameKm: 'ស្រៈ អូ', ipa: '[ou / uː]', type: 'Dependent Vowel' },
    'ួ': { name: 'Sra Uo', nameKm: 'ស្រៈ អួ', ipa: '[uə]', type: 'Dependent Vowel' },
    'ើ': { name: 'Sra Aeu', nameKm: 'ស្រៈ អើ', ipa: '[aə / əː]', type: 'Dependent Vowel' },
    'ឿ': { name: 'Sra Oea', nameKm: 'ស្រៈ អឿ', ipa: '[ɨə]', type: 'Dependent Vowel' },
    'ៀ': { name: 'Sra Ie', nameKm: 'ស្រៈ អៀ', ipa: '[iə]', type: 'Dependent Vowel' },
    'េ': { name: 'Sra E', nameKm: 'ស្រៈ អេ', ipa: '[eː / eː]', type: 'Dependent Vowel' },
    'ែ': { name: 'Sra Ae', nameKm: 'ស្រៈ អែ', ipa: '[ae / ɛː]', type: 'Dependent Vowel' },
    'ៃ': { name: 'Sra Ay', nameKm: 'ស្រៈ អៃ', ipa: '[aj / ɨj]', type: 'Dependent Vowel' },
    'ោ': { name: 'Sra Ao', nameKm: 'ស្រៈ អោ', ipa: '[ao / oː]', type: 'Dependent Vowel' },
    'ៅ': { name: 'Sra Aw', nameKm: 'ស្រៈ អៅ', ipa: '[aw / ɨw]', type: 'Dependent Vowel' },
    'ុំ': { name: 'Sra Om', nameKm: 'ស្រៈ អុំ', ipa: '[om / um]', type: 'Compound Vowel' },
    'ំ': { name: 'Nikahit (Sra Am)', nameKm: 'និគ្គហិត (ំ)', ipa: '[ɑm / um]', type: 'Nasal Sign / Vowel' },
    'ាំ': { name: 'Sra Aam', nameKm: 'ស្រៈ អាំ', ipa: '[am / oəm]', type: 'Compound Vowel' },
    'ះ': { name: 'Reahmuk (Sra Ah)', nameKm: 'រះមុខ (ះ)', ipa: '[ah / eəh]', type: 'Glottal Stop Sign / Vowel' },
    'ុះ': { name: 'Sra Oh', nameKm: 'ស្រៈ អុះ', ipa: '[oh / uh]', type: 'Compound Vowel' },
    'េះ': { name: 'Sra Eh', nameKm: 'ស្រៈ អេះ', ipa: '[eh / ih]', type: 'Compound Vowel' },
    'ោះ': { name: 'Sra Aoh', nameKm: 'ស្រៈ អោះ', ipa: '[ɑh / uəh]', type: 'Compound Vowel' },

    // Independent Vowels (ស្រៈពេញតួ)
    'ឥ': { name: 'Qi', nameKm: 'ឥ (ស្រៈ ឥ)', ipa: '[ʔe]', type: 'Independent Vowel' },
    'ឦ': { name: 'Qii', nameKm: 'ឦ (ស្រៈ ឦ)', ipa: '[ʔəj]', type: 'Independent Vowel' },
    'ឧ': { name: 'Qu', nameKm: 'ឧ (ស្រៈ ឧ)', ipa: '[ʔo]', type: 'Independent Vowel' },
    'ឩ': { name: 'Quu', nameKm: 'ឩ (ស្រៈ ឩ)', ipa: '[ʔou]', type: 'Independent Vowel' },
    'ឪ': { name: 'Qov', nameKm: 'ឪ (ស្រៈ ឪ)', ipa: '[ʔəw]', type: 'Independent Vowel' },
    'ឫ': { name: 'Ry', nameKm: 'ឫ (ស្រៈ ឫ)', ipa: '[rɨ]', type: 'Independent Vowel' },
    'ឬ': { name: 'Ryy', nameKm: 'ឬ (ស្រៈ ឬ)', ipa: '[rɨː]', type: 'Independent Vowel' },
    'ឭ': { name: 'Ly', nameKm: 'ឭ (ស្រៈ ឭ)', ipa: '[lɨ]', type: 'Independent Vowel' },
    'ឮ': { name: 'Lyy', nameKm: 'ឮ (ស្រៈ ឮ)', ipa: '[lɨː]', type: 'Independent Vowel' },
    'ឯ': { name: 'Qae', nameKm: 'ឯ (ស្រៈ ឯ)', ipa: '[ʔae]', type: 'Independent Vowel' },
    'ឰ': { name: 'Qai', nameKm: 'ឰ (ស្រៈ ឰ)', ipa: '[ʔaj]', type: 'Independent Vowel' },
    'ឱ': { name: 'Qao', nameKm: 'ឱ (ស្រៈ ឱ)', ipa: '[ʔao]', type: 'Independent Vowel' },
    'ឲ': { name: 'Qao', nameKm: 'ឲ (ស្រៈ ឲ)', ipa: '[ʔao]', type: 'Independent Vowel' },
    'ឳ': { name: 'Qaw', nameKm: 'ឳ (ស្រៈ ឳ)', ipa: '[ʔaw]', type: 'Independent Vowel' },

    // Diacritics & Signs (វណ្ណយុត្តិ)
    '្': { name: 'Coeng Sign', nameKm: 'ជើង (្)', ipa: 'Subscript Prefix', type: 'Coeng Key' },
    '់': { name: 'Bantoc', nameKm: 'បន្តក់ (់)', ipa: 'Shortens vowel', type: 'Diacritic' },
    '៉': { name: 'Musikatoan', nameKm: 'មូសិកទន្ត (៉)', ipa: 'Converts 2nd to 1st series', type: 'Diacritic' },
    '៊': { name: 'Triisap', nameKm: 'ត្រីស័ព្ទ (៊)', ipa: 'Converts 1st to 2nd series', type: 'Diacritic' },
    '៍': { name: 'Toandakhiat', nameKm: 'ទណ្ឌឃាដ (៍)', ipa: 'Silences final consonant/vowel', type: 'Diacritic' },
    '៏': { name: 'Ahsda', nameKm: 'អស្តា (៏)', ipa: 'Inherent vowel mark (ដ៏, ក៏, ហ៏, ន៏)', type: 'Diacritic' },
    '័': { name: 'Samyok Sannya', nameKm: 'សំយោគសញ្ញា (័)', ipa: 'Short vowel modifier ([ă / oă])', type: 'Diacritic' },
    '៌': { name: 'Robat', nameKm: 'របាទ (៌)', ipa: 'Sanskrit repha / silences base', type: 'Diacritic' },
    '៎': { name: 'Kakabat', nameKm: 'កាកបាទ (៎)', ipa: 'Rising / exclamatory intonation', type: 'Diacritic' },
    'ៈ': { name: 'Yuukaleapintu', nameKm: 'យុគលពិន្ទុ (ៈ)', ipa: 'Short [aʔ / eəʔ] glottal stop', type: 'Diacritic' },
    '៑': { name: 'Viriam', nameKm: 'វិរាម (៑)', ipa: 'Sanskrit/Pali killer mark', type: 'Diacritic' },
    '៝': { name: 'Atthacan', nameKm: 'អដ្ឋចន្ទ (៝)', ipa: 'Archaic final consonant mark', type: 'Diacritic' },
    'ៜ': { name: 'Avakrahasannya', nameKm: 'អវគ្គហសញ្ញា (ៜ)', ipa: 'Sanskrit elision mark', type: 'Sign' },
    'ៗ': { name: 'Lek Too', nameKm: 'លេខទោ (ៗ)', ipa: 'Word / phrase repetition mark', type: 'Punctuation' },
    '៛': { name: 'Riel', nameKm: 'សញ្ញារៀល (៛)', ipa: 'Cambodian Riel Currency', type: 'Currency' },
    '។': { name: 'Khan', nameKm: 'ខណ្ឌ (។)', ipa: 'Full stop / clause break', type: 'Punctuation' },
    '៕': { name: 'Bariyoosan', nameKm: 'បរិយោសាន (៕)', ipa: 'Chapter / text end', type: 'Punctuation' },
    '៖': { name: 'Camnuc Pii Kuuh', nameKm: 'ចំណុចពីរគូស (៖)', ipa: 'Colon / statement divider', type: 'Punctuation' },
    '៙': { name: 'Phnaek Muan', nameKm: 'ភ្នែកមាន់ (៙)', ipa: 'Traditional text opening sign', type: 'Punctuation' },
    '៚': { name: 'Koomuut', nameKm: 'គោមូត្រ (៚)', ipa: 'Traditional poetic closing sign', type: 'Punctuation' },
    'ឨ': { name: 'Quk (Archaic)', nameKm: 'ស្រៈ ឨ (បុរាណ)', ipa: 'Use ឧក in modern Khmer', type: 'Independent Vowel' },
    'ឝ': { name: 'Sha (Archaic)', nameKm: 'ឝ (បាលី/សំស្ក្រឹត)', ipa: '[ɕɑː]', type: 'Archaic Consonant' },
    'ឞ': { name: 'Sso (Archaic)', nameKm: 'ឞ (បាលី/សំស្ក្រឹត)', ipa: '[sɑː]', type: 'Archaic Consonant' },
    'ឣ': { name: 'Deprecated Qa', nameKm: 'ឣ (មិនប្រើ — ប្រើ អ)', ipa: 'Deprecated: use អ (U+17A2)', type: 'Deprecated' },
    'ឤ': { name: 'Deprecated Qaa', nameKm: 'ឤ (មិនប្រើ — ប្រើ អា)', ipa: 'Deprecated: use អា (U+17A2 U+17B6)', type: 'Deprecated' },
    '៓': { name: 'Deprecated Bathamasat', nameKm: '៓ (មិនប្រើ)', ipa: 'Deprecated encoding mark', type: 'Deprecated' },
    '៘': { name: 'Deprecated Beyyal', nameKm: '៘ (មិនប្រើ — ប្រើ ។ល។)', ipa: 'Deprecated: type ។ល។ instead', type: 'Deprecated' },
    '\u200B': { name: 'Zero-Width Space (ZWSP)', nameKm: 'ចន្លោះមើលមិនឃើញ (ZWSP)', ipa: 'Invisible word boundary (U+200B)', type: 'Formatting Control' },
    '\u200C': { name: 'Zero-Width Non-Joiner (ZWNJ)', nameKm: 'បំបែកទម្រង់ (ZWNJ)', ipa: 'Prevents ligature joining (U+200C)', type: 'Formatting Control' },
    '\u200D': { name: 'Zero-Width Joiner (ZWJ)', nameKm: 'ភ្ជាប់ទម្រង់ (ZWJ)', ipa: 'Requests ligature joining (U+200D)', type: 'Formatting Control' },
    '«': { name: 'Left Guillemet', nameKm: 'សញ្ញាសម្រង់បើក («)', ipa: 'Opening quote', type: 'Punctuation' },
    '»': { name: 'Right Guillemet', nameKm: 'សញ្ញាសម្រង់បិទ (»)', ipa: 'Closing quote', type: 'Punctuation' }
  };

  // Finger presentation names & accents
  const FINGER_INFO = {
    lp: { nameEn: 'Left Pinky', nameKm: 'ដៃឆ្វេង · កូនដៃ', color: '#38bdf8' },
    lr: { nameEn: 'Left Ring', nameKm: 'ដៃឆ្វេង · នាងដៃ', color: '#60a5fa' },
    lm: { nameEn: 'Left Middle', nameKm: 'ដៃឆ្វេង · កណ្ដាល', color: '#818cf8' },
    li: { nameEn: 'Left Index', nameKm: 'ដៃឆ្វេង · ចង្អុលដៃ', color: '#fbbf24' },
    lt: { nameEn: 'Left Thumb', nameKm: 'ដៃឆ្វេង · មេដៃ', color: '#34d399' },
    rt: { nameEn: 'Right Thumb', nameKm: 'ដៃស្ដាំ · មេដៃ', color: '#34d399' },
    ri: { nameEn: 'Right Index', nameKm: 'ដៃស្ដាំ · ចង្អុលដៃ', color: '#fb923c' },
    rm: { nameEn: 'Right Middle', nameKm: 'ដៃស្ដាំ · កណ្ដាល', color: '#f472b6' },
    rr: { nameEn: 'Right Ring', nameKm: 'ដៃស្ដាំ · នាងដៃ', color: '#c084fc' },
    rp: { nameEn: 'Right Pinky', nameKm: 'ដៃស្ដាំ · កូនដៃ', color: '#e879f9' }
  };

  // Human-crafted Special Key Profiles (prevents overflow and robotic labels)
  const SPECIAL_KEYS = {
    space: {
      symbol: '␣',
      title: 'Spacebar · ដកឃ្លា',
      category: 'Word Separator',
      recipe: '<kbd>Space</kbd>',
      fingerDesc: 'Left or Right Thumb',
      note: 'Inserts zero-width space (ZWSP) in Khmer, standard space in English.'
    },
    backspace: {
      symbol: '⌫',
      title: 'Backspace · លុបថយក្រោយ',
      category: 'Editing Key',
      recipe: '<kbd>Backspace</kbd>',
      fingerDesc: 'Right Pinky',
      note: 'Deletes the previous character or subscript cluster.'
    },
    tab: {
      symbol: '⇥',
      title: 'Tab · ថេប',
      category: 'Navigation Key',
      recipe: '<kbd>Tab</kbd>',
      fingerDesc: 'Left Pinky',
      note: 'Navigates focus or advances indentation.'
    },
    enter: {
      symbol: '↵',
      title: 'Enter · ចុះបន្ទាត់',
      category: 'Action Key',
      recipe: '<kbd>Enter</kbd>',
      fingerDesc: 'Right Pinky',
      note: 'Advances line or submits practice drills.'
    },
    caps: {
      symbol: '⇪',
      title: 'Caps Lock',
      category: 'Toggle Lock',
      recipe: '<kbd>Caps Lock</kbd>',
      fingerDesc: 'Left Pinky',
      note: 'Toggles uppercase in English layout.'
    },
    shiftL: {
      symbol: '⇧',
      title: 'Left Shift · ស្រទាប់ប្តូរ',
      category: 'Modifier Layer',
      recipe: '<kbd>Hold Shift</kbd>',
      fingerDesc: 'Left Pinky',
      note: 'Hold to preview and type shifted voiced consonants.'
    },
    shiftR: {
      symbol: '⇧',
      title: 'Right Shift · ស្រទាប់ប្តូរ',
      category: 'Modifier Layer',
      recipe: '<kbd>Hold Shift</kbd>',
      fingerDesc: 'Right Pinky',
      note: 'Hold to preview and type shifted voiced consonants.'
    },
    ctrlL: {
      symbol: '⌃',
      title: 'Left Ctrl · ស្រទាប់ Ctrl',
      category: 'Currency & Punctuation',
      recipe: '<kbd>Hold Ctrl</kbd>',
      fingerDesc: 'Left Thumb',
      note: 'Hold to type Riel (៛), Baht (฿), Yen (¥), and special marks.'
    },
    ctrlR: {
      symbol: '⌃',
      title: 'Right Ctrl · ស្រទាប់ Ctrl',
      category: 'Currency & Punctuation',
      recipe: '<kbd>Hold Ctrl</kbd>',
      fingerDesc: 'Right Pinky',
      note: 'Hold to type currency symbols and punctuation.'
    },
    alt: {
      symbol: '⌥',
      title: 'Alt Key',
      category: 'System Modifier',
      recipe: '<kbd>Alt</kbd>',
      fingerDesc: 'Left Thumb',
      note: 'System modifier key.'
    },
    altgr: {
      symbol: '⌥',
      title: 'AltGr · ស្រទាប់ AltGr',
      category: 'Independent Vowels',
      recipe: '<kbd>Hold AltGr</kbd>',
      fingerDesc: 'Right Thumb',
      note: 'Hold to type independent vowels (ឫ, ឬ, ឯ) and secondary signs.'
    }
  };

  const HUMAN_KEY_LABELS = {
    grave: '`',
    k1: '1', k2: '2', k3: '3', k4: '4', k5: '5',
    k6: '6', k7: '7', k8: '8', k9: '9', k0: '0',
    minus: '-', equal: '=', backspace: 'Backspace',
    tab: 'Tab',
    q: 'Q', w: 'W', e: 'E', r: 'R', t: 'T', y: 'Y', u: 'U', i: 'I', o: 'O', p: 'P',
    bracketL: '[', bracketR: ']', backslash: '\\',
    caps: 'Caps',
    a: 'A', s: 'S', d: 'D', f: 'F', g: 'G', h: 'H', j: 'J', k: 'K', l: 'L',
    semicolon: ';', quote: "'", enter: 'Enter',
    shiftL: 'Shift',
    z: 'Z', x: 'X', c: 'C', v: 'V', b: 'B', n: 'N', m: 'M',
    comma: ',', period: '.', slash: '/', shiftR: 'Shift',
    ctrlL: 'Ctrl', alt: 'Alt', space: 'Space', altgr: 'AltGr', ctrlR: 'Ctrl'
  };

  function getHumanKeyLabel(keyId){
    if(!keyId) return '';
    return HUMAN_KEY_LABELS[keyId] || (keyId.startsWith('k') && /^\d$/.test(keyId.slice(1)) ? keyId.slice(1) : keyId.toUpperCase());
  }

  const KHMER_DIGIT_DATA = {
    '០': { nameKm: 'សូន្យ', en: 'Zero', sound: 'soun' },
    '១': { nameKm: 'មួយ', en: 'One', sound: 'muoy' },
    '២': { nameKm: 'ពីរ', en: 'Two', sound: 'pii' },
    '៣': { nameKm: 'បី', en: 'Three', sound: 'bei' },
    '៤': { nameKm: 'បួន', en: 'Four', sound: 'buon' },
    '៥': { nameKm: 'ប្រាំ', en: 'Five', sound: 'pram' },
    '៦': { nameKm: 'ប្រាំមួយ', en: 'Six', sound: 'pram-muoy' },
    '៧': { nameKm: 'ប្រាំពីរ', en: 'Seven', sound: 'pram-pii' },
    '៨': { nameKm: 'ប្រាំបី', en: 'Eight', sound: 'pram-bei' },
    '៩': { nameKm: 'ប្រាំបួន', en: 'Nine', sound: 'pram-buon' }
  };

  let inspectorEnabled = true;
  let hudEl = null;
  let reticleEl = null;
  let currentInspectedKeyId = null;
  let lastMouseX = 0;
  let lastMouseY = 0;

  function loadPreference(){
    try {
      const val = localStorage.getItem(STORAGE_KEY);
      if(val !== null) inspectorEnabled = val === 'true';
    } catch(e){}
  }

  function savePreference(){
    try {
      localStorage.setItem(STORAGE_KEY, String(inspectorEnabled));
    } catch(e){}
  }

  /* ---- DOM Construction for HUD & Reticle ---- */
  function ensureDOM(){
    if(!hudEl){
      hudEl = document.createElement('div');
      hudEl.className = 'pk-cursor-hud';
      hudEl.id = 'pkCursorHud';
      hudEl.setAttribute('aria-hidden', 'true');
      document.body.appendChild(hudEl);
    }
    if(!reticleEl){
      reticleEl = document.createElement('div');
      reticleEl.className = 'pk-cursor-reticle';
      reticleEl.id = 'pkCursorReticle';
      reticleEl.setAttribute('aria-hidden', 'true');
      const dot = document.createElement('div');
      dot.className = 'pk-cursor-reticle-dot';
      reticleEl.appendChild(dot);
      document.body.appendChild(reticleEl);
    }
  }

  /* ---- Character Resolution ---- */
  function getCharInfo(char, keyId, layerName){
    if(!char) return null;
    const custom = KHMER_CHAR_DATA[char];
    if(custom){
      return Object.assign({ char }, custom);
    }
    // Review engine fallback catalog
    if(global.PK_REVIEW && global.PK_REVIEW.CATALOG_MAPS){
      const curLayout = global.currentLayoutId || 'standard';
      const cat = global.PK_REVIEW.CATALOG_MAPS[curLayout];
      if(cat && cat[char]){
        const c = cat[char];
        return {
          char,
          name: c.name || char,
          nameKm: c.nameKm || char,
          ipa: '',
          series: c.series || '',
          group: c.group || '',
          type: c.type || 'Character',
          sub: c.type === 'consonant' ? ('្' + char) : ''
        };
      }
    }
    // Khmer Digits (Human-crafted)
    if(/[០-៩]/.test(char)){
      const numInfo = KHMER_DIGIT_DATA[char] || { nameKm: char, en: '', sound: char };
      return {
        char,
        name: `លេខ ${char} · ${numInfo.en} (${numInfo.nameKm})`,
        nameKm: `លេខ ${char}`,
        ipa: `Pronounced: ${numInfo.sound}`,
        type: 'Khmer Numeral'
      };
    }
    // English Letters
    if(/[a-zA-Z]/.test(char)){
      const isUpper = char === char.toUpperCase() && char !== char.toLowerCase();
      return {
        char,
        name: `Letter ${char.toUpperCase()} · អក្សរ ${char.toUpperCase()}`,
        nameKm: `អក្សរ ${char.toUpperCase()}`,
        ipa: isUpper ? 'Shift / Uppercase letter' : 'Base / Lowercase letter',
        type: 'English Letter'
      };
    }
    return {
      char,
      name: char,
      nameKm: char,
      ipa: '',
      type: 'Key'
    };
  }

  /* ---- Update Position of HUD with Screen Clamping ---- */
  function updatePosition(x, y){
    lastMouseX = x;
    lastMouseY = y;
    if(reticleEl && inspectorEnabled){
      reticleEl.style.left = x + 'px';
      reticleEl.style.top = y + 'px';
    }
    if(!hudEl || !hudEl.classList.contains('visible')) return;

    const hudRect = hudEl.getBoundingClientRect();
    const hudW = hudRect.width || 250;
    const hudH = hudRect.height || 150;
    const gap = 16;
    const winW = window.innerWidth;
    const winH = window.innerHeight;

    let posX = x + gap;
    let posY = y + gap;

    // Smart hand-aware positioning when inspecting keys on the keyboard
    if(currentInspectedKeyId){
      const bottomRowOrHomeKeys = new Set([
        'caps','a','s','d','f','g','h','j','k','l','semicolon','quote','enter',
        'shiftL','z','x','c','v','b','n','m','comma','period','slash','extra','shiftR'
      ]);
      if(bottomRowOrHomeKeys.has(currentInspectedKeyId) && (y - hudH - gap >= 12)){
        // Place HUD above home/bottom row keys so the 3D hands below remain unobstructed
        posY = y - hudH - gap;
      }
    }

    // Flip horizontally if overflow right
    if(posX + hudW > winW - 12){
      posX = x - hudW - gap;
    }
    // Flip vertically if overflow bottom
    if(posY + hudH > winH - 12){
      posY = y - hudH - gap;
    }

    posX = Math.max(10, Math.min(posX, winW - hudW - 10));
    posY = Math.max(10, Math.min(posY, winH - hudH - 10));

    hudEl.style.left = posX + 'px';
    hudEl.style.top = posY + 'px';
  }

  function getKeyEl(keyId){
    if(!keyId) return null;
    return document.querySelector(`.key[data-key="${keyId}"]`) || (global.keyEls && global.keyEls[keyId]) || document.getElementById('key-' + keyId);
  }

  /* ---- Render HUD Content for a Key ---- */
  function inspectKey(keyId, ev){
    if(!inspectorEnabled) return;
    ensureDOM();
    currentInspectedKeyId = keyId;

    const keyEl = getKeyEl(keyId);
    const layoutId = global.currentLayoutId || 'standard';
    const layer = typeof global.currentLayer === 'function' ? global.currentLayer() : 'base';
    const fid = (global.KEY_FINGER && global.KEY_FINGER[keyId]) || null;
    const finfo = (fid && FINGER_INFO[fid]) || { nameEn: 'Touch Key', nameKm: 'ម្រាមដៃ', color: '#ffd166' };

    // 1. Dedicated Special / Modifier Key Profile
    if(SPECIAL_KEYS[keyId]){
      let sk = SPECIAL_KEYS[keyId];
      if(keyId === 'space'){
        if(layoutId === 'standard'){
          if(layer === 'shift'){
            sk = {
              symbol: '␣',
              title: 'Spacebar · ដកឃ្លា',
              category: 'Word Separator',
              recipe: '<kbd>Shift</kbd> + <kbd>Space</kbd>',
              fingerDesc: 'Left or Right Thumb',
              note: 'Inserts standard space in Khmer Keyboard Layout.'
            };
          } else {
            sk = {
              symbol: '្',
              title: 'Coeng Sign · ជើង (្)',
              category: 'Subscript Prefix',
              recipe: '<kbd>Space</kbd>',
              fingerDesc: 'Left or Right Thumb',
              note: 'Press Spacebar before a consonant to form its subscript (ជើង), e.g. ក + Space + ក = ក្ក. Press Shift + Space for space.'
            };
          }
        } else {
          // Khmer NiDA Keyboard & English: Spacebar · ដកឃ្លា (like the user's reference image)
          sk = {
            symbol: '␣',
            title: 'Spacebar · ដកឃ្លា',
            category: 'Word Separator',
            recipe: layer === 'shift' ? '<kbd>Shift</kbd> + <kbd>Space</kbd>' : '<kbd>Space</kbd>',
            fingerDesc: 'Left or Right Thumb',
            note: 'Inserts zero-width space (ZWSP) in Khmer, standard space in English.'
          };
        }
      }
      hudEl.innerHTML = `
        <div class="pk-chud-top">
          <div class="pk-chud-glyph-box">${sk.symbol}</div>
          <div class="pk-chud-title-wrap">
            <div class="pk-chud-name">${sk.title}</div>
            <span class="pk-chud-category">${sk.category}</span>
          </div>
        </div>
        <div class="pk-chud-grid">
          <div class="pk-chud-row">
            <span class="pk-chud-label">Keystroke</span>
            <span class="pk-chud-recipe">${sk.recipe}</span>
          </div>
          <div class="pk-chud-row">
            <span class="pk-chud-label">Finger</span>
            <span class="pk-chud-finger">
              <span class="pk-chud-finger-dot" style="background:${finfo.color};color:${finfo.color};"></span>
              <span>${sk.fingerDesc || finfo.nameEn}</span>
            </span>
          </div>
        </div>
        ${sk.note ? `<div class="pk-chud-desc">${sk.note}</div>` : ''}
      `;
      hudEl.classList.add('visible');
      if(reticleEl) reticleEl.classList.add('target-key');
      if(typeof global.setActiveFinger === 'function') global.setActiveFinger(keyId, layer);
      highlightQuickGuideMiniKey(keyId, fid);
      if(ev) updatePosition(ev.clientX, ev.clientY);
      else if(keyEl){ const r = keyEl.getBoundingClientRect(); updatePosition(r.left + r.width/2, r.top + r.height/2); }
      return;
    }

    // Determine active glyph on this key
    let glyph = '';
    if(keyEl){
      const gEl = keyEl.querySelector('.glyph');
      if(gEl){
        const raw = gEl.dataset[layer] !== undefined ? gEl.dataset[layer] : gEl.dataset.base;
        glyph = raw !== undefined ? raw : (gEl.textContent || '').trim();
      } else if(keyEl.textContent){
        glyph = keyEl.textContent.trim();
      }
    }

    const keyLabel = getHumanKeyLabel(keyId);
    const info = getCharInfo(glyph, keyId, layer);

    // Keystroke recipe (clean, human-readable)
    let recipeHtml = `<kbd>${keyLabel}</kbd>`;
    const coengKey = layoutId === 'standard' ? 'Space' : 'J';
    if(layer === 'shift'){
      recipeHtml = `<kbd>Shift</kbd> + <kbd>${keyLabel}</kbd>`;
    } else if(layer === 'altgr'){
      recipeHtml = `<kbd>AltGr</kbd> + <kbd>${keyLabel}</kbd>`;
    } else if(layer === 'ctrl'){
      recipeHtml = `<kbd>Ctrl</kbd> + <kbd>${keyLabel}</kbd>`;
    }

    let subHtml = '';
    if(info && info.sub && layoutId !== 'english'){
      subHtml = `
        <div class="pk-chud-subscript-badge">
          <span>Subscript <strong class="sub-glyph">${info.sub}</strong></span>
          <span class="pk-chud-recipe"><kbd>${coengKey}</kbd> + <kbd>${keyLabel}</kbd></span>
        </div>
      `;
    }

    let displayGlyph = glyph || keyLabel;
    if(glyph === '\u200B') displayGlyph = 'ZWSP';
    else if(glyph === '\u200C') displayGlyph = 'ZWNJ';
    else if(glyph === '\u200D') displayGlyph = 'ZWJ';
    else if(glyph === '\u00A0') displayGlyph = 'NBSP';
    else if(displayGlyph.length > 2 && !['ZWSP','ZWNJ','ZWJ','NBSP'].includes(displayGlyph)){
      displayGlyph = displayGlyph.charAt(0);
    }

    let cardTitle = info ? (info.name + (info.nameKm && !info.name.includes(info.nameKm) ? (' · ' + info.nameKm) : '')) : `Key ${keyLabel}`;
    let cardCat = info ? (info.type + (info.series ? (' · ' + info.series) : (info.group ? (' · ' + info.group) : ''))) : 'Typing Key';

    let soundHtml = '';
    if(info && info.ipa){
      soundHtml = `<div class="pk-chud-desc">${info.ipa.startsWith('Pronounced') ? info.ipa : ('Sound: ' + info.ipa)}</div>`;
    }

    hudEl.innerHTML = `
      <div class="pk-chud-top">
        <div class="pk-chud-glyph-box">${displayGlyph}</div>
        <div class="pk-chud-title-wrap">
          <div class="pk-chud-name">${cardTitle}</div>
          <span class="pk-chud-category">${cardCat}</span>
        </div>
      </div>
      <div class="pk-chud-grid">
        <div class="pk-chud-row">
          <span class="pk-chud-label">Keystroke</span>
          <span class="pk-chud-recipe">${recipeHtml}</span>
        </div>
        <div class="pk-chud-row">
          <span class="pk-chud-label">Finger</span>
          <span class="pk-chud-finger">
            <span class="pk-chud-finger-dot" style="background:${finfo.color};color:${finfo.color};"></span>
            <span>${finfo.nameEn}</span>
          </span>
        </div>
      </div>
      ${subHtml}
      ${soundHtml}
    `;

    hudEl.classList.add('visible');
    if(reticleEl) reticleEl.classList.add('target-key');

    // 1. Kinematic Hand Guide Sync
    if(typeof global.setActiveFinger === 'function'){
      global.setActiveFinger(keyId, layer);
    }

    // 2. Quick Guide Mini-Keys Sync
    highlightQuickGuideMiniKey(keyId, fid);

    if(ev){
      updatePosition(ev.clientX, ev.clientY);
    } else if(keyEl){
      const r = keyEl.getBoundingClientRect();
      updatePosition(r.left + r.width/2, r.top + r.height/2);
    }
  }

  function uninspectKey(){
    currentInspectedKeyId = null;
    if(hudEl) hudEl.classList.remove('visible');
    if(reticleEl) reticleEl.classList.remove('target-key');

    // Restore active finger for ongoing lesson / race / adaptive session
    if(typeof global.lessonActive !== 'undefined' && global.lessonActive && typeof global.highlightLessonTarget === 'function'){
      global.highlightLessonTarget();
    } else if(typeof global.raceActive !== 'undefined' && global.raceActive && typeof global.highlightRaceTarget === 'function'){
      global.highlightRaceTarget();
    } else if(typeof global.adaptiveActive !== 'undefined' && global.adaptiveActive && typeof global.highlightAdaptiveTarget === 'function'){
      global.highlightAdaptiveTarget();
    } else if(typeof global.setActiveFinger === 'function'){
      global.setActiveFinger(null);
    }

    clearQuickGuideMiniKeys();
  }

  function highlightQuickGuideMiniKey(keyId, fingerId){
    clearQuickGuideMiniKeys();
    if(!fingerId) return;
    const miniKeys = document.querySelectorAll('.guide-mini-key');
    miniKeys.forEach(mk=>{
      const title = (mk.getAttribute('title') || '').toLowerCase();
      const fInfo = FINGER_INFO[fingerId];
      if(fInfo && title.includes(fInfo.nameEn.toLowerCase().replace('left ', '').replace('right ', ''))){
        mk.classList.add('active');
      }
    });
  }

  function clearQuickGuideMiniKeys(){
    document.querySelectorAll('.guide-mini-key.active').forEach(mk=> mk.classList.remove('active'));
  }

  /* ---- Exercise Text Character Inspector ---- */
  let activeBeaconKeyEl = null;

  function clearTargetKeyBeacon(){
    if(activeBeaconKeyEl){
      activeBeaconKeyEl.classList.remove('inspector-beacon');
      activeBeaconKeyEl = null;
    }
  }

  function highlightKeyBeacon(keyId){
    clearTargetKeyBeacon();
    if(!keyId) return;
    const keyEl = getKeyEl(keyId);
    if(keyEl){
      keyEl.classList.add('inspector-beacon');
      activeBeaconKeyEl = keyEl;
    }
  }

  function getCharUnderCursor(ev){
    let textNode = null;
    let offset = 0;
    if(document.caretRangeFromPoint){
      const range = document.caretRangeFromPoint(ev.clientX, ev.clientY);
      if(range){
        textNode = range.startContainer;
        offset = range.startOffset;
      }
    } else if(document.caretPositionFromPoint){
      const pos = document.caretPositionFromPoint(ev.clientX, ev.clientY);
      if(pos){
        textNode = pos.offsetNode;
        offset = pos.offset;
      }
    }
    if(textNode && textNode.nodeType === Node.TEXT_NODE){
      const text = textNode.textContent;
      if(offset < text.length){
        const ch = text[offset];
        if(ch && ch.trim()) return ch;
      }
    }
    const t = ev.target && ev.target.textContent && ev.target.textContent.trim();
    if(t && t.length === 1) return t;
    return null;
  }

  function inspectTextCharacter(char, ev){
    if(!inspectorEnabled || !char || char === ' ' || char === '\n') return;
    ensureDOM();

    const info = getCharInfo(char);
    const layoutId = global.currentLayoutId || 'standard';
    const coengKey = layoutId === 'standard' ? 'Space' : 'J';

    // Reverse lookup key & layer for this character
    let foundKey = null;
    let foundLayer = 'base';
    if(global.LAYOUTS && global.LAYOUTS[layoutId]){
      const rows = global.LAYOUTS[layoutId].rows || [];
      for(const row of rows){
        for(const k of row){
          if(k.base === char){ foundKey = k.id; foundLayer = 'base'; break; }
          if(k.shift === char){ foundKey = k.id; foundLayer = 'shift'; break; }
          if(k.altgr === char){ foundKey = k.id; foundLayer = 'altgr'; break; }
          if(k.ctrl === char){ foundKey = k.id; foundLayer = 'ctrl'; break; }
        }
        if(foundKey) break;
      }
      if(!foundKey && global.LAYOUTS[layoutId].spaceMap){
        const sm = global.LAYOUTS[layoutId].spaceMap;
        if(sm.base === char){ foundKey = 'space'; foundLayer = 'base'; }
        else if(sm.shift === char){ foundKey = 'space'; foundLayer = 'shift'; }
      }
    }

    const fid = (foundKey && global.KEY_FINGER && global.KEY_FINGER[foundKey]) || null;
    const finfo = (fid && FINGER_INFO[fid]) || { nameEn: 'Touch Key', nameKm: 'ម្រាមដៃ', color: '#ffd166' };

    const keyLabel = foundKey ? getHumanKeyLabel(foundKey) : '';
    let recipeText = `<kbd>${keyLabel || 'Combo'}</kbd>`;
    if(foundLayer === 'shift') recipeText = `<kbd>Shift</kbd> + <kbd>${keyLabel}</kbd>`;
    else if(foundLayer === 'altgr') recipeText = `<kbd>AltGr</kbd> + <kbd>${keyLabel}</kbd>`;

    // Subscript character handling
    if(char === '្'){
      recipeText = `<kbd>${coengKey}</kbd>`;
    } else if(char.startsWith('្') && char.length > 1){
      recipeText = `<kbd>${coengKey}</kbd> + <kbd>${keyLabel}</kbd>`;
    }

    let cardTitle = info ? (info.name + (info.nameKm && !info.name.includes(info.nameKm) ? (' · ' + info.nameKm) : '')) : char;
    let cardCat = info ? (info.type + (info.series ? (' · ' + info.series) : (info.group ? (' · ' + info.group) : ''))) : 'Exercise Character';
    let soundHtml = '';
    if(info && info.ipa){
      soundHtml = `<div class="pk-chud-desc">${info.ipa.startsWith('Pronounced') ? info.ipa : ('Sound: ' + info.ipa)}</div>`;
    }

    hudEl.innerHTML = `
      <div class="pk-chud-top">
        <div class="pk-chud-glyph-box">${char}</div>
        <div class="pk-chud-title-wrap">
          <div class="pk-chud-name">${cardTitle}</div>
          <span class="pk-chud-category">${cardCat}</span>
        </div>
      </div>
      <div class="pk-chud-grid">
        <div class="pk-chud-row">
          <span class="pk-chud-label">Keystroke</span>
          <span class="pk-chud-recipe">${recipeText}</span>
        </div>
        <div class="pk-chud-row">
          <span class="pk-chud-label">Finger</span>
          <span class="pk-chud-finger">
            <span class="pk-chud-finger-dot" style="background:${finfo.color};color:${finfo.color};"></span>
            <span>${finfo.nameEn}</span>
          </span>
        </div>
      </div>
      ${soundHtml}
    `;

    hudEl.classList.add('visible');
    if(foundKey){
      highlightKeyBeacon(foundKey);
      if(typeof global.setActiveFinger === 'function'){
        global.setActiveFinger(foundKey, foundLayer);
      }
      highlightQuickGuideMiniKey(foundKey, fid);
    }
    if(ev) updatePosition(ev.clientX, ev.clientY);
  }

  /* ---- Real-Time Layer Hover Preview (Banner fulfillment) ---- */
  function setupLayerHoverPreview(){
    const modifiers = [
      { id: 'shiftL', layer: 'shift' },
      { id: 'shiftR', layer: 'shift' },
      { id: 'ctrlL', layer: 'ctrl' },
      { id: 'ctrlR', layer: 'ctrl' },
      { id: 'altgr', layer: 'altgr' }
    ];

    modifiers.forEach(m=>{
      const el = getKeyEl(m.id);
      if(!el) return;
      el.addEventListener('mouseenter', ()=>{
        if(!inspectorEnabled || global.PKDisableLayerHover) return;
        if(!global.physicalLayer && !global.lockedLayer){
          global.hoverLayer = m.layer;
          if(typeof global.render === 'function') global.render();
        }
      });
      el.addEventListener('mouseleave', ()=>{
        if(global.hoverLayer === m.layer){
          global.hoverLayer = null;
          if(typeof global.render === 'function') global.render();
        }
      });
      // Click locks / pins layer
      el.addEventListener('click', (ev)=>{
        ev.stopPropagation();
        global.lockedLayer = (global.lockedLayer === m.layer) ? null : m.layer;
        global.hoverLayer = null;
        if(typeof global.render === 'function') global.render();
      });
    });

    // Layer Pills Hover & Click
    document.querySelectorAll('.layer-pill').forEach(pill=>{
      const pLayer = pill.dataset.pill;
      pill.addEventListener('mouseenter', ()=>{
        if(!inspectorEnabled || global.PKDisableLayerHover) return;
        if(!global.physicalLayer && !global.lockedLayer){
          global.hoverLayer = pLayer === 'base' ? null : pLayer;
          if(typeof global.render === 'function') global.render();
        }
      });
      pill.addEventListener('mouseleave', ()=>{
        if(global.hoverLayer){
          global.hoverLayer = null;
          if(typeof global.render === 'function') global.render();
        }
      });
      pill.addEventListener('click', ()=>{
        global.lockedLayer = (global.lockedLayer === pLayer || pLayer === 'base') ? null : pLayer;
        global.hoverLayer = null;
        document.querySelectorAll('.layer-pill').forEach(p=> p.classList.toggle('locked', p.dataset.pill === global.lockedLayer));
        if(typeof global.render === 'function') global.render();
      });
    });
  }

  /* ---- Keyboard & Exercise Delegated Listeners ---- */
  function attachEventListeners(){
    ensureDOM();

    // Global mouse tracking for precision reticle and HUD
    window.addEventListener('mousemove', (ev)=>{
      updatePosition(ev.clientX, ev.clientY);
      if(reticleEl && inspectorEnabled){
        reticleEl.classList.add('active');
        const interactive = ev.target && ev.target.closest('button, a, .layer-pill, .layout-btn, .lesson-card, .level-header, input, select, .action-btn, .mini-btn');
        reticleEl.classList.toggle('interactive', !!interactive);
      }
    }, { passive: true });

    window.addEventListener('mouseleave', ()=>{
      if(reticleEl) reticleEl.classList.remove('active');
      uninspectKey();
    });

    // Global click ripple shockwave
    window.addEventListener('mousedown', (ev)=>{
      if(!inspectorEnabled) return;
      const wave = document.createElement('div');
      wave.className = 'pk-cursor-shockwave';
      wave.style.left = ev.clientX + 'px';
      wave.style.top = ev.clientY + 'px';
      document.body.appendChild(wave);
      setTimeout(()=>{ if(wave.parentNode) wave.parentNode.removeChild(wave); }, 460);
    }, { passive: true });

    // Keyboard Key Hover & Click Delegation
    const board = document.getElementById('boardWrap');
    if(board){
      board.addEventListener('mouseover', (ev)=>{
        const keyEl = ev.target.closest('.key');
        if(keyEl && keyEl.dataset && keyEl.dataset.key){
          inspectKey(keyEl.dataset.key, ev);
        }
      });
      board.addEventListener('mousemove', (ev)=>{
        const keyEl = ev.target.closest('.key');
        if(keyEl && keyEl.dataset && keyEl.dataset.key){
          if(currentInspectedKeyId !== keyEl.dataset.key){
            inspectKey(keyEl.dataset.key, ev);
          } else {
            updatePosition(ev.clientX, ev.clientY);
          }
        }
      });
      board.addEventListener('mouseout', (ev)=>{
        const keyEl = ev.target.closest('.key');
        if(keyEl && (!ev.relatedTarget || !keyEl.contains(ev.relatedTarget))){
          uninspectKey();
        }
      });

      // Interactive mouse click on keys
      board.addEventListener('click', (ev)=>{
        const keyEl = ev.target.closest('.key');
        if(!keyEl || !keyEl.dataset || !keyEl.dataset.key) return;
        const keyId = keyEl.dataset.key;
        if(typeof global.playKeySound === 'function'){
          global.playKeySound(keyId);
        }
        keyEl.classList.add('active');
        setTimeout(()=> keyEl.classList.remove('active'), 140);
      });
    }

    // Exercise Prompt & Manuscript Character Hover Delegation
    const textContainers = ['output', 'exerciseText', 'exerciseTarget', 'sampleText', 'raceText', 'lessonPrompt'];
    textContainers.forEach(id=>{
      const el = document.getElementById(id);
      if(!el) return;
      el.addEventListener('mousemove', (ev)=>{
        if(!inspectorEnabled) return;
        const ch = getCharUnderCursor(ev);
        if(ch){
          inspectTextCharacter(ch, ev);
        } else if(!currentInspectedKeyId){
          clearTargetKeyBeacon();
          if(hudEl) hudEl.classList.remove('visible');
        }
      });
      el.addEventListener('mouseleave', ()=>{
        if(!currentInspectedKeyId){
          clearTargetKeyBeacon();
          if(hudEl && hudEl.classList.contains('visible')){
            hudEl.classList.remove('visible');
            if(typeof global.setActiveFinger === 'function') global.setActiveFinger(null);
          }
        }
      });
    });

    setupLayerHoverPreview();
  }

  /* ---- Toolbar Toggle Control ---- */
  function setupToolbarToggle(){
    let btn = document.getElementById('cursorGuideToggle');
    if(!btn){
      const toolbar = document.querySelector('.toolbar');
      if(!toolbar) return;
      btn = document.createElement('button');
      btn.id = 'cursorGuideToggle';
      btn.className = (inspectorEnabled ? 'on' : '') + ' i18n-t';
      btn.setAttribute('data-en', 'Mouse inspector');
      btn.setAttribute('data-km', 'ត្រួតពិនិត្យដោយកណ្ដុរ');
      btn.setAttribute('title', 'Smart Mouse Inspector & Interactive Kinematic Guide (Alt+M)');
      const handsToggle = document.getElementById('handsToggle');
      if(handsToggle && handsToggle.nextSibling){
        toolbar.insertBefore(btn, handsToggle.nextSibling);
      } else {
        toolbar.appendChild(btn);
      }
    }

    const renderBtn = () => {
      btn.classList.toggle('on', inspectorEnabled);
      btn.setAttribute('aria-pressed', inspectorEnabled ? 'true' : 'false');
      btn.innerHTML = `
        <svg class="pk-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <circle cx="12" cy="12" r="3"/>
          <line x1="12" y1="2" x2="12" y2="5"/>
          <line x1="12" y1="19" x2="12" y2="22"/>
          <line x1="2" y1="12" x2="5" y2="12"/>
          <line x1="19" y1="12" x2="22" y2="12"/>
        </svg>
        <span>Mouse inspector</span>${inspectorEnabled ? '' : ' (off)'}
      `;
    };

    renderBtn();

    btn.onclick = () => {
      inspectorEnabled = !inspectorEnabled;
      savePreference();
      renderBtn();
      if(!inspectorEnabled){
        uninspectKey();
        if(reticleEl) reticleEl.classList.remove('active', 'target-key', 'interactive');
      } else if(reticleEl){
        reticleEl.classList.add('active');
      }
      if(typeof global.showToast === 'function'){
        global.showToast(
          '<svg class="pk-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>',
          inspectorEnabled ? 'Mouse Inspector Active' : 'Mouse Inspector Paused',
          inspectorEnabled ? 'Hover over keys or text to view phonetic guides, finger reach, and subscript formulas.' : 'Standard mouse pointer restored.'
        );
      }
    };
  }

  // Keyboard shortcut (Alt+M) to toggle mouse inspector
  window.addEventListener('keydown', (ev)=>{
    if(ev.altKey && (ev.key === 'm' || ev.key === 'M')){
      ev.preventDefault();
      const btn = document.getElementById('cursorGuideToggle');
      if(btn) btn.click();
    }
  });

  /* ---- Resilient Hand & Pinky Kinematics Guardian ---- */
  function ensureHandsKinematics(){
    if(!global.FINGERS) return;
    if(!global.FINGERS.some(f => f.id === 'rp')){
      global.FINGERS.push({id:'rp', hand:'R', home:'semicolon', kind:'pinky', baseW:12.5, tipW:7.5, kDist:68, restLen:52, restAng:0.10});
    }
    const handGroupR = document.querySelector('.hand-group.side-r');
    if(handGroupR && !document.querySelector('.finger[data-finger="rp"]')){
      if(typeof global.createFingerElement === 'function'){
        const rpDef = global.FINGERS.find(f => f.id === 'rp');
        if(rpDef) global.createFingerElement(rpDef);
      }
    }
    if(typeof global.renderHands === 'function'){
      global.renderHands();
    }
  }

  /* ---- Initialization ---- */
  function init(){
    loadPreference();
    ensureDOM();
    attachEventListeners();
    setupToolbarToggle();
    ensureHandsKinematics();
  }

  if(document.readyState !== 'loading'){
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }

  // Exported API
  global.PK_MOUSE_INSPECTOR = {
    inspectKey,
    uninspectKey,
    inspectTextCharacter,
    getCharInfo,
    isEnabled: ()=> inspectorEnabled,
    toggle: (state)=>{
      inspectorEnabled = typeof state === 'boolean' ? state : !inspectorEnabled;
      savePreference();
      const btn = document.getElementById('cursorGuideToggle');
      if(btn) btn.classList.toggle('on', inspectorEnabled);
    }
  };
  global.PKCursorInspector = global.PK_MOUSE_INSPECTOR;

})(typeof window !== 'undefined' ? window : this);
