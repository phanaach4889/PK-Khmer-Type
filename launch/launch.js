(() => {
  'use strict';

  /* ============================================================
     PK Khmer Type — Launch Page Interactive Keyboard Deck & 3D Hands
     Works 100% offline & on file:// protocol (zero fetch dependency)
     ============================================================ */

  const KEY = (id, base, ctrl, altgr, shift) => ({ id, base, ctrl, altgr, shift, kind: 'glyph' });

  /* ---------- Khmer Standard layout data ---------- */
  const ROW1 = [
    KEY('grave', '', '฿', '◎', ''),
    KEY('k1', '១', '₭', '1', '!'),
    KEY('k2', '២', '€', '2', 'ៗ'),
    KEY('k3', '៣', 'đ', '3', '"'),
    KEY('k4', '៤', '₣', '4', '៛'),
    KEY('k5', '៥', '¥', '5', '%'),
    KEY('k6', '៦', '', '6', '៍'),
    KEY('k7', '៧', '£', '7', '័'),
    KEY('k8', '៨', '', '8', '៏'),
    KEY('k9', '៩', '', '9', '៎'),
    KEY('k0', '០', '—', '0', '៌'),
    KEY('minus', '-', '•', '{', '_'),
    KEY('equal', '=', '', '}', '+'),
    { id: 'backspace', kind: 'mod', label: 'Backsp.', wide: 2 },
  ];

  const ROW2 = [
    { id: 'tab', kind: 'mod', label: 'Tab', wide: 1.5 },
    KEY('q', 'ឆ', '', '*', 'ឈ'),
    KEY('w', 'ឹ', '', '', 'ឺ'),
    KEY('e', 'េ', '', 'ឯ', 'ែ'),
    KEY('r', 'រ', '', 'ឫ', 'ឬ'),
    KEY('t', 'ត', '', 'ឦ', 'ទ'),
    KEY('y', 'យ', '', '', 'ួ'),
    KEY('u', 'ុ', '', 'ឧ', 'ូ'),
    KEY('i', 'ិ', '', 'ឥ', 'ី'),
    KEY('o', 'ោ', '', 'ឱ', 'ៅ'),
    KEY('p', 'ផ', '', 'ឳ', 'ភ'),
    KEY('bracketL', 'ើ', '', '[', 'ោះ'),
    KEY('bracketR', 'ឿ', '', ']', 'ៀ'),
    { id: 'enter', kind: 'mod', label: 'Enter', wide: 1.5 },
  ];

  const ROW3 = [
    { id: 'caps', kind: 'mod', label: 'Caps', wide: 1.75 },
    KEY('a', 'ា', '', 'ឩ', 'ៃ'),
    KEY('s', 'ស', '', 'ឪ', 'ាំ'),
    KEY('d', 'ដ', '', '', 'ឌ'),
    KEY('f', 'ថ', '', '', 'ធ'),
    KEY('g', 'ង', '', '', 'ុះ'),
    KEY('h', 'ហ', '', '', '៏'),
    KEY('j', 'ញ', '', 'ឮ', 'ុំ'),
    KEY('k', 'ក', '', 'ឭ', 'គ'),
    KEY('l', 'ល', '', 'ឰ', 'ឡ'),
    KEY('semicolon', 'ះ', ':', ';', '៖'),
    KEY('quote', '់', '«', '៝', '៉'),
    KEY('backslash', '\\', '/', '៚', '/'),
  ];

  const ROW4 = [
    { id: 'shiftL', kind: 'mod', label: 'Shift', cls: 'key-shift', wide: 2.25 },
    KEY('z', 'ឋ', '', '#', 'ឍ'),
    KEY('x', 'ខ', '', '@', 'ឃ'),
    KEY('c', 'ច', '', '&', 'ជ'),
    KEY('v', 'វ', '', '$', 'េះ'),
    KEY('b', 'ប', '', '%', 'ព'),
    KEY('n', 'ន', '', '(', 'ណ'),
    KEY('m', 'ម', '’', ')', 'ំ'),
    KEY('comma', 'អ', '<', '‹', ','),
    KEY('period', '។', '>', '›', '.'),
    KEY('slash', '', '”', '៕', '?'),
    KEY('extra', '', '', '¶', ''),
    { id: 'shiftR', kind: 'mod', label: 'Shift', cls: 'key-shift', wide: 1.75 },
  ];

  const ROW5 = [
    { id: 'ctrlL', kind: 'mod', label: 'Ctrl', cls: 'key-ctrl', wide: 1.5 },
    { id: 'alt', kind: 'mod', label: 'Alt', wide: 1.5 },
    { id: 'space', kind: 'mod', label: '', cls: 'space' },
    { id: 'altgr', kind: 'mod', label: 'AltGr', cls: 'key-altgr', wide: 1.5 },
    { id: 'ctrlR', kind: 'mod', label: 'Ctrl', cls: 'key-ctrl', wide: 1.5 },
  ];

  /* ---------- Khmer NiDA layout data ---------- */
  const ROW1_NIDA = [
    KEY('grave', '«', '', '‍', '»'),
    KEY('k1', '១', '', '‌', '!'),
    KEY('k2', '២', '', '@', 'ៗ'),
    KEY('k3', '៣', '', '៑', '"'),
    KEY('k4', '៤', '', '$', '៛'),
    KEY('k5', '៥', '', '€', '%'),
    KEY('k6', '៦', '', '៙', '៍'),
    KEY('k7', '៧', '', '៚', '័'),
    KEY('k8', '៨', '', '*', '៏'),
    KEY('k9', '៩', '', '{', '('),
    KEY('k0', '០', '', '}', ')'),
    KEY('minus', 'ឥ', '', '×', '៌'),
    KEY('equal', 'ឲ', '', '៎', '='),
    { id: 'backspace', kind: 'mod', label: 'Backsp.', wide: 2 },
  ];

  const ROW2_NIDA = [
    { id: 'tab', kind: 'mod', label: 'Tab', wide: 1.5 },
    KEY('q', 'ឆ', '', '', 'ឈ'),
    KEY('w', 'ឹ', '', '', 'ឺ'),
    KEY('e', 'េ', '', 'ឯ', 'ែ'),
    KEY('r', 'រ', '', 'ឫ', 'ឬ'),
    KEY('t', 'ត', '', '', 'ទ'),
    KEY('y', 'យ', '', '', 'ួ'),
    KEY('u', 'ុ', '', '', 'ូ'),
    KEY('i', 'ិ', '', 'ឦ', 'ី'),
    KEY('o', 'ោ', '', 'ឱ', 'ៅ'),
    KEY('p', 'ផ', '', 'ឰ', 'ភ'),
    KEY('bracketL', 'ៀ', '', 'ឩ', 'ឿ'),
    KEY('bracketR', 'ឪ', '', 'ឳ', 'ឧ'),
    { id: 'enter', kind: 'mod', label: 'Enter', wide: 1.5 },
  ];

  const ROW3_NIDA = [
    { id: 'caps', kind: 'mod', label: 'Caps', wide: 1.75 },
    KEY('a', 'ា', '', '', 'ាំ'),
    KEY('s', 'ស', '', '', 'ៃ'),
    KEY('d', 'ដ', '', '', 'ឌ'),
    KEY('f', 'ថ', '', '', 'ធ'),
    KEY('g', 'ង', '', '', 'អ'),
    KEY('h', 'ហ', '', '', 'ះ'),
    KEY('j', '្', '', '', 'ញ'),
    KEY('k', 'ក', '', '', 'គ'),
    KEY('l', 'ល', '', '', 'ឡ'),
    KEY('semicolon', 'ើ', '', '៖', 'ោះ'),
    KEY('quote', '់', '', 'ៈ', '៉'),
    KEY('backslash', 'ឮ', '', '\\', 'ឭ'),
  ];

  const ROW4_NIDA = [
    { id: 'shiftL', kind: 'mod', label: 'Shift', cls: 'key-shift', wide: 2.25 },
    KEY('z', 'ឋ', '', '', 'ឍ'),
    KEY('x', 'ខ', '', '', 'ឃ'),
    KEY('c', 'ច', '', '', 'ជ'),
    KEY('v', 'វ', '', '', 'េះ'),
    KEY('b', 'ប', '', '', 'ព'),
    KEY('n', 'ន', '', '', 'ណ'),
    KEY('m', 'ម', '', '', 'ំ'),
    KEY('comma', 'ុំ', '', ',', 'ុះ'),
    KEY('period', '។', '', '.', '៕'),
    KEY('slash', '៊', '', '/', '?'),
    KEY('extra', '', '', '', ''),
    { id: 'shiftR', kind: 'mod', label: 'Shift', cls: 'key-shift', wide: 1.75 },
  ];

  const ROW5_NIDA = [
    { id: 'ctrlL', kind: 'mod', label: 'Ctrl', cls: 'key-ctrl', wide: 1.5 },
    { id: 'alt', kind: 'mod', label: 'Alt', wide: 1.5 },
    { id: 'space', kind: 'mod', label: '', cls: 'space' },
    { id: 'altgr', kind: 'mod', label: 'AltGr', cls: 'key-altgr', wide: 1.5 },
    { id: 'ctrlR', kind: 'mod', label: 'Ctrl', cls: 'key-ctrl', wide: 1.5 },
  ];

  /* ---------- English (US QWERTY) layout data ---------- */
  const ROW1_EN = [
    KEY('grave', '`', '', '', '~'),
    KEY('k1', '1', '', '', '!'),
    KEY('k2', '2', '', '', '@'),
    KEY('k3', '3', '', '', '#'),
    KEY('k4', '4', '', '', '$'),
    KEY('k5', '5', '', '', '%'),
    KEY('k6', '6', '', '', '^'),
    KEY('k7', '7', '', '', '&'),
    KEY('k8', '8', '', '', '*'),
    KEY('k9', '9', '', '', '('),
    KEY('k0', '0', '', '', ')'),
    KEY('minus', '-', '', '', '_'),
    KEY('equal', '=', '', '', '+'),
    { id: 'backspace', kind: 'mod', label: 'Backsp.', wide: 2 },
  ];

  const ROW2_EN = [
    { id: 'tab', kind: 'mod', label: 'Tab', wide: 1.5 },
    KEY('q', 'q', '', '', 'Q'),
    KEY('w', 'w', '', '', 'W'),
    KEY('e', 'e', '', '', 'E'),
    KEY('r', 'r', '', '', 'R'),
    KEY('t', 't', '', '', 'T'),
    KEY('y', 'y', '', '', 'Y'),
    KEY('u', 'u', '', '', 'U'),
    KEY('i', 'i', '', '', 'I'),
    KEY('o', 'o', '', '', 'O'),
    KEY('p', 'p', '', '', 'P'),
    KEY('bracketL', '[', '', '', '{'),
    KEY('bracketR', ']', '', '', '}'),
    { id: 'enter', kind: 'mod', label: 'Enter', wide: 1.5 },
  ];

  const ROW3_EN = [
    { id: 'caps', kind: 'mod', label: 'Caps', wide: 1.75 },
    KEY('a', 'a', '', '', 'A'),
    KEY('s', 's', '', '', 'S'),
    KEY('d', 'd', '', '', 'D'),
    KEY('f', 'f', '', '', 'F'),
    KEY('g', 'g', '', '', 'G'),
    KEY('h', 'h', '', '', 'H'),
    KEY('j', 'j', '', '', 'J'),
    KEY('k', 'k', '', '', 'K'),
    KEY('l', 'l', '', '', 'L'),
    KEY('semicolon', ';', '', '', ':'),
    KEY('quote', '\'', '', '', '"'),
    KEY('backslash', '\\', '', '', '|'),
  ];

  const ROW4_EN = [
    { id: 'shiftL', kind: 'mod', label: 'Shift', cls: 'key-shift', wide: 2.25 },
    KEY('z', 'z', '', '', 'Z'),
    KEY('x', 'x', '', '', 'X'),
    KEY('c', 'c', '', '', 'C'),
    KEY('v', 'v', '', '', 'V'),
    KEY('b', 'b', '', '', 'B'),
    KEY('n', 'n', '', '', 'N'),
    KEY('m', 'm', '', '', 'M'),
    KEY('comma', ',', '', '', '<'),
    KEY('period', '.', '', '', '>'),
    KEY('slash', '/', '', '', '?'),
    KEY('extra', '', '', '', ''),
    { id: 'shiftR', kind: 'mod', label: 'Shift', cls: 'key-shift', wide: 1.75 },
  ];

  const ROW5_EN = [
    { id: 'ctrlL', kind: 'mod', label: 'Ctrl', cls: 'key-ctrl', wide: 1.5 },
    { id: 'alt', kind: 'mod', label: 'Alt', wide: 1.5 },
    { id: 'space', kind: 'mod', label: '', cls: 'space' },
    { id: 'altgr', kind: 'mod', label: 'AltGr', cls: 'key-altgr', wide: 1.5 },
    { id: 'ctrlR', kind: 'mod', label: 'Ctrl', cls: 'key-ctrl', wide: 1.5 },
  ];

  const LAYOUTS = {
    standard: {
      label: 'Khmer Keyboard Layout',
      deckId: 'STANDARD',
      rows: [ROW1, ROW2, ROW3, ROW4, ROW5],
      spaceMap: { base: '្', shift: ' ', ctrl: '្', altgr: '្' },
    },
    nida: {
      label: 'Khmer NiDA Keyboard',
      deckId: 'NiDA',
      rows: [ROW1_NIDA, ROW2_NIDA, ROW3_NIDA, ROW4_NIDA, ROW5_NIDA],
      spaceMap: { base: ' ', shift: ' ', ctrl: ' ', altgr: ' ' },
    },
    english: {
      label: 'English (US)',
      deckId: 'ENGLISH',
      rows: [ROW1_EN, ROW2_EN, ROW3_EN, ROW4_EN, ROW5_EN],
      spaceMap: { base: ' ', shift: ' ', ctrl: ' ', altgr: ' ' },
    },
  };

  const STARTER_SEQUENCES = {
    standard: 'ថដសាញកលះថញ',
    nida: 'ថដសា្កលើថក',
    english: 'asdfjkl;fj',
  };

  const state = {
    layout: 'standard',
    layer: 'base',
    physicalLayer: null,
    practiceLayout: 'standard',
    sequence: STARTER_SEQUENCES.standard,
    cursor: 0,
    attempts: 0,
    mistakes: 0,
    typed: '',
    currentKeyId: null,
    soundOn: true,
    handsOn: true,
    motionOff: false,
  };

  const byId = (id) => document.getElementById(id);
  const boardWrap = byId('boardWrap');
  const keyboardStage = byId('keyboardStage');
  const keyboard = byId('keyboard');
  const handsOverlay = byId('handsOverlay');
  const chassisLayoutLabel = byId('chassisLayoutLabel');
  const exercisePrompt = byId('exercise-prompt');
  const exerciseEntry = byId('exercise-entry');
  const inspectorGlyph = byId('inspector-glyph');
  const inspectorCode = byId('inspector-code');
  const inspectorName = byId('inspector-name');
  const inspectorLayer = byId('inspector-layer');
  const inspectorShift = byId('inspector-shift');
  const inspectorFinger = byId('inspector-finger');

  let keyEls = {};

  const CODE_MAP = {
    Backquote: 'grave', Digit1: 'k1', Digit2: 'k2', Digit3: 'k3', Digit4: 'k4', Digit5: 'k5',
    Digit6: 'k6', Digit7: 'k7', Digit8: 'k8', Digit9: 'k9', Digit0: 'k0',
    Minus: 'minus', Equal: 'equal', Backspace: 'backspace',
    Tab: 'tab', KeyQ: 'q', KeyW: 'w', KeyE: 'e', KeyR: 'r', KeyT: 't', KeyY: 'y', KeyU: 'u',
    KeyI: 'i', KeyO: 'o', KeyP: 'p', BracketLeft: 'bracketL', BracketRight: 'bracketR', Enter: 'enter',
    CapsLock: 'caps', KeyA: 'a', KeyS: 's', KeyD: 'd', KeyF: 'f', KeyG: 'g', KeyH: 'h', KeyJ: 'j',
    KeyK: 'k', KeyL: 'l', Semicolon: 'semicolon', Quote: 'quote', Backslash: 'backslash',
    ShiftLeft: 'shiftL', ShiftRight: 'shiftR', KeyZ: 'z', KeyX: 'x', KeyC: 'c', KeyV: 'v', KeyB: 'b',
    KeyN: 'n', KeyM: 'm', Comma: 'comma', Period: 'period', Slash: 'slash',
    ControlLeft: 'ctrlL', ControlRight: 'ctrlR', AltLeft: 'alt', AltRight: 'altgr', Space: 'space',
  };

  const KEY_FINGER = {
    grave: 'lp', k1: 'lp', k2: 'lr', k3: 'lm', k4: 'li', k5: 'li',
    k6: 'ri', k7: 'ri', k8: 'rm', k9: 'rr', k0: 'rp', minus: 'rp', equal: 'rp', backspace: 'rp',
    tab: 'lp', q: 'lp', w: 'lr', e: 'lm', r: 'li', t: 'li', y: 'ri', u: 'ri', i: 'rm', o: 'rr',
    p: 'rp', bracketL: 'rp', bracketR: 'rp', enter: 'rp',
    caps: 'lp', a: 'lp', s: 'lr', d: 'lm', f: 'li', g: 'li', h: 'ri', j: 'ri', k: 'rm', l: 'rr',
    semicolon: 'rp', quote: 'rp', backslash: 'rp',
    shiftL: 'lp', z: 'lp', x: 'lr', c: 'lm', v: 'li', b: 'li', n: 'ri', m: 'ri',
    comma: 'rm', period: 'rr', slash: 'rp', extra: 'rp', shiftR: 'rp',
    ctrlL: 'lt', alt: 'lt', space: 'rt', altgr: 'rt', ctrlR: 'rp',
  };

  const FINGER_NAMES = {
    lp: 'Left Pinky', lr: 'Left Ring', lm: 'Left Middle', li: 'Left Index', lt: 'Left Thumb',
    rt: 'Right Thumb', ri: 'Right Index', rm: 'Right Middle', rr: 'Right Ring', rp: 'Right Pinky',
  };

  const KHMER_NAMES = {
    'ក': 'Khmer Consonant Ka', 'ខ': 'Khmer Consonant Kha', 'គ': 'Khmer Consonant Ko', 'ឃ': 'Khmer Consonant Kho', 'ង': 'Khmer Consonant Ngo',
    'ច': 'Khmer Consonant Ca', 'ឆ': 'Khmer Consonant Cha', 'ជ': 'Khmer Consonant Co', 'ឈ': 'Khmer Consonant Cho', 'ញ': 'Khmer Consonant Nyo',
    'ដ': 'Khmer Consonant Da', 'ឋ': 'Khmer Consonant Ththe', 'ឌ': 'Khmer Consonant Do', 'ឍ': 'Khmer Consonant Tho', 'ណ': 'Khmer Consonant Nno',
    'ត': 'Khmer Consonant Ta', 'ថ': 'Khmer Consonant Tha', 'ទ': 'Khmer Consonant To', 'ធ': 'Khmer Consonant Tho', 'ន': 'Khmer Consonant No',
    'ប': 'Khmer Consonant Ba', 'ផ': 'Khmer Consonant Pha', 'ព': 'Khmer Consonant Po', 'ភ': 'Khmer Consonant Pho', 'ម': 'Khmer Consonant Mo',
    'យ': 'Khmer Consonant Yo', 'រ': 'Khmer Consonant Ro', 'ល': 'Khmer Consonant Lo', 'វ': 'Khmer Consonant Vo', 'ស': 'Khmer Consonant Sa',
    'ហ': 'Khmer Consonant Ha', 'ឡ': 'Khmer Consonant La', 'អ': 'Khmer Consonant Qa',
    'ា': 'Vowel Aa', 'ិ': 'Vowel I', 'ី': 'Vowel Ii', 'ឹ': 'Vowel Y', 'ឺ': 'Vowel Yy', 'ុ': 'Vowel U', 'ូ': 'Vowel Uu',
    'ួ': 'Vowel Ua', 'ើ': 'Vowel Oe', 'ឿ': 'Vowel Ya', 'ៀ': 'Vowel Ie', 'េ': 'Vowel E', 'ែ': 'Vowel Ae', 'ៃ': 'Vowel Ai',
    'ោ': 'Vowel Oo', 'ៅ': 'Vowel Au', 'ុំ': 'Vowel Um', 'ំ': 'Sign Nikahit', 'ះ': 'Sign Reahmuk', 'ុះ': 'Vowel Uh',
    'េះ': 'Vowel Eh', 'ោះ': 'Vowel Oh', 'ាំ': 'Vowel Aam',
    '្': 'Subscript Sign (Coeng)', '់': 'Bantoc Mark', '៉': 'Muusikatoan Mark', '៊': 'Triisap Mark', '៍': 'Tandakhiat Mark',
    '័': 'Sanhyoak Sannya', '៏': 'Ahsda Mark', '៌': 'Robat Mark', '៎': 'Kakabat Mark', '៝': 'Atthacan Mark',
    '។': 'Khan (Full Stop)', '៕': 'Bariyoosan', '៖': 'Camnuc Pii Kuuh (Colon)', 'ៗ': 'Lek To (Duplicate)',
    '៛': 'Khmer Riel Sign', '៚': 'Koyuutika (Ending)', '៙': 'Phnek Kkla (Beginning)',
    '០': 'Khmer Digit 0', '១': 'Khmer Digit 1', '២': 'Khmer Digit 2', '៣': 'Khmer Digit 3', '៤': 'Khmer Digit 4',
    '៥': 'Khmer Digit 5', '៦': 'Khmer Digit 6', '៧': 'Khmer Digit 7', '៨': 'Khmer Digit 8', '៩': 'Khmer Digit 9',
    'ឥ': 'Indep. Vowel Qi', 'ឦ': 'Indep. Vowel Qii', 'ឧ': 'Indep. Vowel Qu', 'ឩ': 'Indep. Vowel Quu', 'ឪ': 'Indep. Vowel Qov',
    'ឫ': 'Indep. Vowel Ry', 'ឬ': 'Indep. Vowel Ryy', 'ឭ': 'Indep. Vowel Ly', 'ឮ': 'Indep. Vowel Lyy', 'ឯ': 'Indep. Vowel Qe',
    'ឰ': 'Indep. Vowel Qai', 'ឱ': 'Indep. Vowel Qoo', 'ឲ': 'Indep. Vowel Qau',
  };

  /* ============================================================
     3D KINEMATIC HANDS OVERLAY ENGINE (44% Default Opacity)
     ============================================================ */
  const SVGNS = 'http://www.w3.org/2000/svg';
  const FINGERS = [
    { id: 'lp', hand: 'L', home: 'a', kind: 'pinky', baseW: 12.5, tipW: 7.5, kDist: 68, restLen: 52, restAng: -0.10 },
    { id: 'lr', hand: 'L', home: 's', kind: 'ring', baseW: 14.5, tipW: 9.0, kDist: 60, restLen: 56, restAng: -0.04 },
    { id: 'lm', hand: 'L', home: 'd', kind: 'middle', baseW: 15.5, tipW: 9.5, kDist: 54, restLen: 60, restAng: 0.0 },
    { id: 'li', hand: 'L', home: 'f', kind: 'index', baseW: 15.0, tipW: 9.0, kDist: 58, restLen: 56, restAng: 0.06 },
    { id: 'lt', hand: 'L', home: 'space', kind: 'thumb', baseW: 18.5, tipW: 11.5, kDist: 42, restLen: 42, restAng: 0.42 },
    { id: 'rt', hand: 'R', home: 'space', kind: 'thumb', baseW: 18.5, tipW: 11.5, kDist: 42, restLen: 42, restAng: -0.42 },
    { id: 'ri', hand: 'R', home: 'j', kind: 'index', baseW: 15.0, tipW: 9.0, kDist: 58, restLen: 56, restAng: -0.06 },
    { id: 'rm', hand: 'R', home: 'k', kind: 'middle', baseW: 15.5, tipW: 9.5, kDist: 54, restLen: 60, restAng: 0.0 },
    { id: 'rr', hand: 'R', home: 'l', kind: 'ring', baseW: 14.5, tipW: 9.0, kDist: 60, restLen: 56, restAng: 0.04 },
    { id: 'rp', hand: 'R', home: 'semicolon', kind: 'pinky', baseW: 12.5, tipW: 7.5, kDist: 68, restLen: 52, restAng: 0.10 },
  ];

  const HAND_COLOR_PRESETS = {
    cyber: { name: 'Cyber Cyan & Orchid', l: '#38bdf8', r: '#f472b6' },
    emerald: { name: 'Amber & Emerald', l: '#fbbf24', r: '#34d399' },
    ruby: { name: 'Ruby & Sapphire', l: '#fb7185', r: '#60a5fa' },
    sunset: { name: 'Sunset & Violet', l: '#fb923c', r: '#a78bfa' },
    ghost: { name: 'Frost Silver', l: '#94a3b8', r: '#e2e8f0' },
  };
  let currentHandPresetIdx = 0;
  const HAND_PRESET_KEYS = Object.keys(HAND_COLOR_PRESETS);

  const fingerEls = {};
  let activeFinger = null;
  let activeTargetKey = null;
  let activeShiftFinger = null;
  let activeShiftTargetKey = null;

  function sub(a, b) { return { x: a.x - b.x, y: a.y - b.y }; }
  function add(a, b) { return { x: a.x + b.x, y: a.y + b.y }; }
  function scalePt(a, s) { return { x: a.x * s, y: a.y * s }; }
  function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
  function norm(v) { const l = Math.hypot(v.x, v.y) || 1; return { x: v.x / l, y: v.y / l }; }

  function roundedPolyPath(pts, r) {
    const n = pts.length;
    let d = '';
    for (let i = 0; i < n; i++) {
      const prev = pts[(i - 1 + n) % n];
      const cur = pts[i];
      const next = pts[(i + 1) % n];
      const v1 = norm(sub(cur, prev));
      const v2 = norm(sub(next, cur));
      const cut1 = Math.min(r, dist(cur, prev) / 2.2);
      const cut2 = Math.min(r, dist(cur, next) / 2.2);
      const p1 = sub(cur, scalePt(v1, cut1));
      const p2 = add(cur, scalePt(v2, cut2));
      d += (i === 0 ? `M ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} ` : `L ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} `);
      d += `Q ${cur.x.toFixed(1)} ${cur.y.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)} `;
    }
    return d + 'Z';
  }

  function qPoint(o, c, t, s) { const m = 1 - s; return { x: m * m * o.x + 2 * m * s * c.x + s * s * t.x, y: m * m * o.y + 2 * m * s * c.y + s * s * t.y }; }
  function qTangent(o, c, t, s) { const m = 1 - s; return { x: 2 * m * (c.x - o.x) + 2 * s * (t.x - c.x), y: 2 * m * (c.y - o.y) + 2 * s * (t.y - c.y) }; }

  function fingerFrame(origin, ctrl, tip, baseW, tipW) {
    const N = 18, left = [], right = [];
    for (let i = 0; i <= N; i++) {
      const s = i / N;
      const p = qPoint(origin, ctrl, tip, s);
      const tan = qTangent(origin, ctrl, tip, s);
      const l = Math.hypot(tan.x, tan.y) || 1;
      const nx = -tan.y / l, ny = tan.x / l;
      const w = (baseW + (tipW - baseW) * Math.pow(s, 1.35)) / 2;
      left.push({ x: p.x + nx * w, y: p.y + ny * w });
      right.push({ x: p.x - nx * w, y: p.y - ny * w });
    }
    return { left, right };
  }

  function frameToPath(frame, baseW, tipW) {
    const { left, right } = frame;
    let d = `M ${left[0].x.toFixed(1)} ${left[0].y.toFixed(1)} `;
    for (let i = 1; i < left.length; i++) d += `L ${left[i].x.toFixed(1)} ${left[i].y.toFixed(1)} `;
    const tipR = (tipW / 2).toFixed(1);
    const lastR = right[right.length - 1];
    d += `A ${tipR} ${tipR} 0 0 1 ${lastR.x.toFixed(1)} ${lastR.y.toFixed(1)} `;
    for (let i = right.length - 2; i >= 0; i--) d += `L ${right[i].x.toFixed(1)} ${right[i].y.toFixed(1)} `;
    const baseR = (baseW / 2).toFixed(1);
    d += `A ${baseR} ${baseR} 0 0 1 ${left[0].x.toFixed(1)} ${left[0].y.toFixed(1)} Z`;
    return d;
  }

  function creaseAt(frame, s) {
    const i = Math.round(s * (frame.left.length - 1));
    const l = frame.left[i], r = frame.right[i];
    const mx = (l.x + r.x) / 2, my = (l.y + r.y) / 2;
    const lx = l.x + (l.x - mx) * 0.65, ly = l.y + (l.y - my) * 0.65;
    const rx = r.x + (r.x - mx) * 0.65, ry = r.y + (r.y - my) * 0.65;
    return `M ${lx.toFixed(1)} ${ly.toFixed(1)} Q ${mx.toFixed(1)} ${my.toFixed(1)} ${rx.toFixed(1)} ${ry.toFixed(1)}`;
  }

  function pointAtFrame(frame, s) {
    const i = Math.round(s * (frame.left.length - 1));
    const l = frame.left[i], r = frame.right[i];
    return { x: (l.x + r.x) / 2, y: (l.y + r.y) / 2 };
  }

  function hexToRgb(hex) {
    hex = (hex || '#38bdf8').replace(/^#/, '');
    const num = parseInt(hex, 16);
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
  }

  function rgbToHex(r, g, b) {
    const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));
    return '#' + [clamp(r), clamp(g), clamp(b)].map((x) => x.toString(16).padStart(2, '0')).join('');
  }

  function buildHandPalette(hex) {
    const { r, g, b } = hexToRgb(hex);
    return {
      hex: rgbToHex(r, g, b),
      dark: rgbToHex(r * 0.14, g * 0.14, b * 0.14),
      deep: rgbToHex(r * 0.38, g * 0.38, b * 0.38),
      mid: rgbToHex(r * 0.68, g * 0.68, b * 0.68),
      bright: rgbToHex(r, g, b),
      light: rgbToHex(r + (255 - r) * 0.75, g + (255 - g) * 0.75, b + (255 - b) * 0.75),
      glowRgba: `rgba(${r}, ${g}, ${b}, 0.85)`,
      strokeRgba: `rgba(${r}, ${g}, ${b}, 0.5)`,
      shadowRgba: `rgba(${r}, ${g}, ${b}, 0.32)`,
      nailFillRgba: `rgba(${r}, ${g}, ${b}, 0.35)`,
      tipFillRgba: `rgba(${r}, ${g}, ${b}, 0.65)`,
    };
  }

  const defs = document.createElementNS(SVGNS, 'defs');
  const handGroupL = document.createElementNS(SVGNS, 'g');
  handGroupL.setAttribute('class', 'hand-group side-l');
  const handGroupR = document.createElementNS(SVGNS, 'g');
  handGroupR.setAttribute('class', 'hand-group side-r');

  const palmShapeL = document.createElementNS(SVGNS, 'path'); palmShapeL.setAttribute('class', 'palm-shape');
  const palmShadeL = document.createElementNS(SVGNS, 'path'); palmShadeL.setAttribute('class', 'palm-shade');
  const palmHiL = document.createElementNS(SVGNS, 'ellipse'); palmHiL.setAttribute('class', 'palm-highlight');
  const palmShapeR = document.createElementNS(SVGNS, 'path'); palmShapeR.setAttribute('class', 'palm-shape');
  const palmShadeR = document.createElementNS(SVGNS, 'path'); palmShadeR.setAttribute('class', 'palm-shade');
  const palmHiR = document.createElementNS(SVGNS, 'ellipse'); palmHiR.setAttribute('class', 'palm-highlight');

  function updateHandsGradients(leftHex, rightHex) {
    const palL = buildHandPalette(leftHex);
    const palR = buildHandPalette(rightHex);
    defs.innerHTML = `
      <linearGradient id="fingerGrad" x1="0" y1="1" x2="0.3" y2="0">
        <stop offset="0%" stop-color="${palL.dark}" stop-opacity="0.75"/>
        <stop offset="35%" stop-color="${palL.deep}" stop-opacity="0.8"/>
        <stop offset="68%" stop-color="${palL.mid}" stop-opacity="0.85"/>
        <stop offset="88%" stop-color="${palL.bright}" stop-opacity="0.92"/>
        <stop offset="100%" stop-color="${palL.light}" stop-opacity="0.98"/>
      </linearGradient>
      <linearGradient id="fingerGradR" x1="0" y1="1" x2="0.3" y2="0">
        <stop offset="0%" stop-color="${palR.dark}" stop-opacity="0.75"/>
        <stop offset="35%" stop-color="${palR.deep}" stop-opacity="0.8"/>
        <stop offset="68%" stop-color="${palR.mid}" stop-opacity="0.85"/>
        <stop offset="88%" stop-color="${palR.bright}" stop-opacity="0.92"/>
        <stop offset="100%" stop-color="${palR.light}" stop-opacity="0.98"/>
      </linearGradient>
      <linearGradient id="fingerGradActive" x1="0" y1="1" x2="0.3" y2="0">
        <stop offset="0%" stop-color="${palL.deep}" stop-opacity="0.9"/>
        <stop offset="45%" stop-color="${palL.bright}" stop-opacity="0.95"/>
        <stop offset="78%" stop-color="#ffd166" stop-opacity="0.98"/>
        <stop offset="100%" stop-color="#ffffff" stop-opacity="1"/>
      </linearGradient>
      <linearGradient id="fingerGradActiveR" x1="0" y1="1" x2="0.3" y2="0">
        <stop offset="0%" stop-color="${palR.deep}" stop-opacity="0.9"/>
        <stop offset="45%" stop-color="${palR.bright}" stop-opacity="0.95"/>
        <stop offset="78%" stop-color="#ffd166" stop-opacity="0.98"/>
        <stop offset="100%" stop-color="#ffffff" stop-opacity="1"/>
      </linearGradient>
      <linearGradient id="palmGrad" x1="0" y1="1" x2="0.25" y2="0">
        <stop offset="0%" stop-color="${palL.dark}" stop-opacity="0.7"/>
        <stop offset="45%" stop-color="${palL.deep}" stop-opacity="0.75"/>
        <stop offset="100%" stop-color="${palL.mid}" stop-opacity="0.8"/>
      </linearGradient>
      <linearGradient id="palmGradR" x1="0" y1="1" x2="0.25" y2="0">
        <stop offset="0%" stop-color="${palR.dark}" stop-opacity="0.7"/>
        <stop offset="45%" stop-color="${palR.deep}" stop-opacity="0.75"/>
        <stop offset="100%" stop-color="${palR.mid}" stop-opacity="0.8"/>
      </linearGradient>
      <radialGradient id="palmHighlight" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${palL.bright}" stop-opacity="0.6"/>
        <stop offset="100%" stop-color="${palL.bright}" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="palmHighlightR" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${palR.bright}" stop-opacity="0.6"/>
        <stop offset="100%" stop-color="${palR.bright}" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="jointGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95"/>
        <stop offset="45%" stop-color="${palL.bright}" stop-opacity="0.8"/>
        <stop offset="100%" stop-color="${palL.mid}" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="jointGlowR" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95"/>
        <stop offset="45%" stop-color="${palR.bright}" stop-opacity="0.8"/>
        <stop offset="100%" stop-color="${palR.mid}" stop-opacity="0"/>
      </radialGradient>
      <filter id="handShadow" x="-35%" y="-35%" width="170%" height="170%">
        <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="${palL.bright}" flood-opacity="0.32"/>
        <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.45"/>
      </filter>
      <filter id="handShadowR" x="-35%" y="-35%" width="170%" height="170%">
        <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="${palR.bright}" flood-opacity="0.32"/>
        <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.45"/>
      </filter>
    `;
    const r = document.documentElement;
    r.style.setProperty('--hand-l-stroke', palL.strokeRgba);
    r.style.setProperty('--hand-l-shadow', palL.shadowRgba);
    r.style.setProperty('--hand-l-shine', palL.light);
    r.style.setProperty('--hand-l-crease', palL.strokeRgba);
    r.style.setProperty('--hand-l-nail-fill', palL.nailFillRgba);
    r.style.setProperty('--hand-l-nail-stroke', palL.light);
    r.style.setProperty('--hand-l-tip-fill', palL.tipFillRgba);
    r.style.setProperty('--hand-l-tip-stroke', palL.light);
    r.style.setProperty('--hand-l-glow', palL.glowRgba);

    r.style.setProperty('--hand-r-stroke', palR.strokeRgba);
    r.style.setProperty('--hand-r-shadow', palR.shadowRgba);
    r.style.setProperty('--hand-r-shine', palR.light);
    r.style.setProperty('--hand-r-crease', palR.strokeRgba);
    r.style.setProperty('--hand-r-nail-fill', palR.nailFillRgba);
    r.style.setProperty('--hand-r-nail-stroke', palR.light);
    r.style.setProperty('--hand-r-tip-fill', palR.tipFillRgba);
    r.style.setProperty('--hand-r-tip-stroke', palR.light);
    r.style.setProperty('--hand-r-glow', palR.glowRgba);

    const swL = byId('quickSwatchL');
    const swR = byId('quickSwatchR');
    if (swL) swL.style.background = palL.hex;
    if (swR) swR.style.background = palR.hex;
  }

  function initHandsDOM() {
    if (!handsOverlay) return;
    handsOverlay.appendChild(defs);
    handGroupL.appendChild(palmShapeL);
    handGroupL.appendChild(palmShadeL);
    handGroupL.appendChild(palmHiL);
    handGroupR.appendChild(palmShapeR);
    handGroupR.appendChild(palmShadeR);
    handGroupR.appendChild(palmHiR);
    handsOverlay.appendChild(handGroupL);
    handsOverlay.appendChild(handGroupR);

    FINGERS.forEach((f) => {
      const g = document.createElementNS(SVGNS, 'g');
      g.setAttribute('class', 'finger');
      g.dataset.finger = f.id;
      const shape = document.createElementNS(SVGNS, 'path'); shape.setAttribute('class', 'finger-shape');
      const crease1 = document.createElementNS(SVGNS, 'path'); crease1.setAttribute('class', 'finger-crease');
      const joint1 = document.createElementNS(SVGNS, 'circle'); joint1.setAttribute('class', 'finger-joint');
      const crease2 = document.createElementNS(SVGNS, 'path'); crease2.setAttribute('class', 'finger-crease');
      const joint2 = document.createElementNS(SVGNS, 'circle'); joint2.setAttribute('class', 'finger-joint');
      const shine = document.createElementNS(SVGNS, 'path'); shine.setAttribute('class', 'finger-shine');
      const nail = document.createElementNS(SVGNS, 'ellipse'); nail.setAttribute('class', 'finger-nail');
      const tip = document.createElementNS(SVGNS, 'circle'); tip.setAttribute('class', 'finger-tip'); tip.setAttribute('r', '5');
      g.append(shape, crease1, joint1, crease2, joint2, shine, nail, tip);
      (f.hand === 'L' ? handGroupL : handGroupR).appendChild(g);
      fingerEls[f.id] = { g, shape, crease1, crease2, joint1, joint2, shine, nail, tip };
    });

    const preset = HAND_COLOR_PRESETS.cyber;
    updateHandsGradients(preset.l, preset.r);
  }

  function keyCenter(id, wrapRect) {
    const el = keyEls[id];
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2 - wrapRect.left, y: r.top + r.height / 2 - wrapRect.top };
  }

  function buildHand(hand, fingers, wrapRect, activeF, targetKey) {
    const inward = hand === 'L' ? 1 : -1;
    const outward = -inward;
    const homes = {};
    fingers.forEach((f) => {
      if (f.kind === 'thumb') return;
      const c = keyCenter(f.home, wrapRect);
      if (c) homes[f.id] = c;
    });

    const order = ['pinky', 'ring', 'middle', 'index'].map((k) => fingers.find((f) => f.kind === k));
    if (order.some((f) => !f || !homes[f.id])) return null;

    let shiftX = 0, shiftY = 0;
    if (activeF && activeF.kind !== 'thumb' && targetKey) {
      const targetPt = keyCenter(targetKey, wrapRect);
      const homePt = keyCenter(activeF.home, wrapRect);
      if (targetPt && homePt) {
        const reachDx = targetPt.x - homePt.x;
        const reachDy = targetPt.y - homePt.y;
        const factorY = activeF.kind === 'pinky' ? 0.72 : (reachDy < 0 ? 0.65 : 0.45);
        const factorX = activeF.kind === 'pinky' ? 0.62 : (reachDy < 0 ? 0.45 : 0.40);
        shiftY = reachDy * factorY;
        shiftX = reachDx * factorX;
      }
    }

    const baseKnuckles = {};
    order.forEach((f) => {
      const h = homes[f.id];
      const ang = f.restAng;
      baseKnuckles[f.id] = {
        x: h.x - Math.sin(ang) * f.kDist + shiftX,
        y: h.y + Math.cos(ang) * f.kDist + shiftY,
      };
    });

    const knucklePts = order.map((f) => baseKnuckles[f.id]);
    const indexBase = knucklePts[3];
    const pinkyBase = knucklePts[0];
    const thumbF = fingers.find((f) => f.kind === 'thumb');
    const thumbBase = { x: indexBase.x + inward * 22, y: indexBase.y + 12 };
    baseKnuckles[thumbF.id] = thumbBase;

    const palmHeight = 68;
    const maxKnuckleY = Math.max(...knucklePts.map((p) => p.y));
    const wristCenter = {
      x: (knucklePts[1].x + knucklePts[2].x) / 2 + outward * 4,
      y: Math.min(wrapRect.height + 24, maxKnuckleY + palmHeight),
    };
    const wristWidth = 64;
    const wristOuter = { x: wristCenter.x + outward * (wristWidth * 0.52), y: wristCenter.y };
    const wristInner = { x: wristCenter.x + inward * (wristWidth * 0.48), y: wristCenter.y };
    const topOuter = { x: pinkyBase.x + outward * 12, y: pinkyBase.y - 2 };
    const innerCurve = { x: thumbBase.x + inward * 3, y: thumbBase.y + 22 };

    const arch = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 - 4 });
    const outline = [
      topOuter,
      arch(topOuter, knucklePts[1]), knucklePts[1],
      arch(knucklePts[1], knucklePts[2]), knucklePts[2],
      arch(knucklePts[2], indexBase), indexBase,
      innerCurve, wristInner, wristOuter,
    ];
    const palmPath = roundedPolyPath(outline, 16);
    const cx = (topOuter.x + wristInner.x) / 2, cy = (topOuter.y + wristOuter.y) / 2;
    const shadeOutline = outline.map((p) => add(p, scalePt(sub({ x: cx, y: cy }, p), 0.18)));
    const shadePath = roundedPolyPath(shadeOutline, 14);
    const highlight = { cx: (topOuter.x + knucklePts[1].x) / 2 + outward * 3, cy: topOuter.y + 8, rx: 26, ry: 14 };

    return { bases: baseKnuckles, palmPath, shadePath, highlight, shiftX, shiftY };
  }

  function updateHandsOverlay() {
    if (!handsOverlay || !keyboardStage) return;
    if (!state.handsOn) {
      handsOverlay.classList.add('hidden');
      return;
    }
    handsOverlay.classList.remove('hidden');
    const wrapRect = keyboardStage.getBoundingClientRect();
    if (!wrapRect.width || !wrapRect.height) return;

    handsOverlay.setAttribute('viewBox', `0 0 ${wrapRect.width} ${wrapRect.height}`);
    handsOverlay.setAttribute('width', wrapRect.width);
    handsOverlay.setAttribute('height', wrapRect.height);

    const leftFingers = FINGERS.filter((f) => f.hand === 'L');
    const rightFingers = FINGERS.filter((f) => f.hand === 'R');

    const activeLeft = leftFingers.find((f) => f.id === activeFinger) || leftFingers.find((f) => f.id === activeShiftFinger);
    const targetLeft = activeLeft ? (activeLeft.id === activeFinger ? activeTargetKey : activeShiftTargetKey) : null;
    const activeRight = rightFingers.find((f) => f.id === activeFinger) || rightFingers.find((f) => f.id === activeShiftFinger);
    const targetRight = activeRight ? (activeRight.id === activeFinger ? activeTargetKey : activeShiftTargetKey) : null;

    const handL = buildHand('L', leftFingers, wrapRect, activeLeft, targetLeft);
    const handR = buildHand('R', rightFingers, wrapRect, activeRight, targetRight);

    if (handL) {
      palmShapeL.setAttribute('d', handL.palmPath);
      palmShadeL.setAttribute('d', handL.shadePath);
      palmHiL.setAttribute('cx', handL.highlight.cx); palmHiL.setAttribute('cy', handL.highlight.cy);
      palmHiL.setAttribute('rx', handL.highlight.rx); palmHiL.setAttribute('ry', handL.highlight.ry);
    }
    if (handR) {
      palmShapeR.setAttribute('d', handR.palmPath);
      palmShadeR.setAttribute('d', handR.shadePath);
      palmHiR.setAttribute('cx', handR.highlight.cx); palmHiR.setAttribute('cy', handR.highlight.cy);
      palmHiR.setAttribute('rx', handR.highlight.rx); palmHiR.setAttribute('ry', handR.highlight.ry);
    }

    FINGERS.forEach((f) => {
      const fe = fingerEls[f.id];
      const hb = f.hand === 'L' ? handL : handR;
      if (!fe || !hb || !hb.bases[f.id]) return;

      const origin = hb.bases[f.id];
      const isPrimary = activeFinger === f.id;
      const isShift = activeShiftFinger === f.id;
      const isActive = isPrimary || isShift;
      const targetKey = isPrimary && activeTargetKey ? activeTargetKey : (isShift && activeShiftTargetKey ? activeShiftTargetKey : null);
      const inward = f.hand === 'L' ? 1 : -1;

      let tip;
      if (f.kind === 'thumb') {
        const spaceEl = keyEls['space'];
        if (isActive && targetKey && targetKey !== 'space') {
          tip = keyCenter(targetKey, wrapRect);
        } else if (spaceEl) {
          const r = spaceEl.getBoundingClientRect();
          const frac = f.hand === 'L' ? 0.38 : 0.62;
          tip = { x: r.left + r.width * frac - wrapRect.left, y: r.top + r.height * 0.48 - wrapRect.top };
        } else {
          tip = { x: origin.x + inward * 16, y: origin.y + 24 };
        }
      } else if (isActive && targetKey) {
        tip = keyCenter(targetKey, wrapRect) || keyCenter(f.home, wrapRect);
      } else {
        const homeCenter = keyCenter(f.home, wrapRect);
        if (homeCenter) {
          if (Math.abs(hb.shiftX) > 3 || Math.abs(hb.shiftY) > 3) {
            tip = { x: origin.x + Math.sin(f.restAng) * f.restLen, y: origin.y - Math.cos(f.restAng) * f.restLen };
          } else {
            tip = homeCenter;
          }
        }
      }
      if (!tip) return;

      const maxLen = f.kind === 'thumb' ? 62 : (f.kind === 'pinky' ? 74 : (f.kind === 'middle' ? 95 : 88));
      const d = dist(origin, tip);
      if (d > maxLen) {
        const scale = maxLen / d;
        tip = { x: origin.x + (tip.x - origin.x) * scale, y: origin.y + (tip.y - origin.y) * scale };
      }

      const bow = Math.min(18, d * 0.14);
      const mid = { x: (origin.x + tip.x) / 2, y: (origin.y + tip.y) / 2 - bow };
      const frame = fingerFrame(origin, mid, tip, f.baseW, f.tipW);

      fe.shape.setAttribute('d', frameToPath(frame, f.baseW, f.tipW));
      fe.crease1.setAttribute('d', creaseAt(frame, 0.42));
      fe.crease2.setAttribute('d', creaseAt(frame, 0.72));
      fe.shine.setAttribute('d', `M ${frame.left[1].x.toFixed(1)} ${frame.left[1].y.toFixed(1)} Q ${mid.x.toFixed(1)} ${mid.y.toFixed(1)} ${(tip.x + (frame.left[frame.left.length - 1].x - tip.x) * 0.3).toFixed(1)} ${(tip.y + (frame.left[frame.left.length - 1].y - tip.y) * 0.3).toFixed(1)}`);

      const j1 = pointAtFrame(frame, 0.42), j2 = pointAtFrame(frame, 0.72);
      fe.joint1.setAttribute('cx', j1.x); fe.joint1.setAttribute('cy', j1.y); fe.joint1.setAttribute('r', Math.max(1.6, f.baseW * 0.16));
      fe.joint2.setAttribute('cx', j2.x); fe.joint2.setAttribute('cy', j2.y); fe.joint2.setAttribute('r', Math.max(1.3, f.tipW * 0.16));

      const nailPt = qPoint(origin, mid, tip, 0.9);
      const tan = qTangent(origin, mid, tip, 0.9);
      const ang = Math.atan2(tan.y, tan.x) * 180 / Math.PI + 90;
      fe.nail.setAttribute('cx', nailPt.x); fe.nail.setAttribute('cy', nailPt.y);
      fe.nail.setAttribute('rx', Math.max(2.2, f.tipW * 0.28)); fe.nail.setAttribute('ry', Math.max(2.8, f.tipW * 0.38));
      fe.nail.setAttribute('transform', `rotate(${ang.toFixed(1)} ${nailPt.x.toFixed(1)} ${nailPt.y.toFixed(1)})`);

      fe.tip.setAttribute('cx', tip.x); fe.tip.setAttribute('cy', tip.y);
      fe.g.classList.toggle('active', isActive);
    });
  }

  function setActiveFinger(keyId, layer) {
    activeFinger = keyId ? (KEY_FINGER[keyId] || null) : null;
    activeTargetKey = keyId;
    const f = activeFinger && FINGERS.find((x) => x.id === activeFinger);
    const isLeft = f ? f.hand === 'L' : false;
    if (layer === 'shift' && keyId && keyId !== 'shiftL' && keyId !== 'shiftR') {
      activeShiftFinger = isLeft ? 'rp' : 'lp';
      activeShiftTargetKey = isLeft ? 'shiftR' : 'shiftL';
    } else if (layer === 'altgr' && keyId !== 'altgr') {
      activeShiftFinger = 'rt';
      activeShiftTargetKey = 'altgr';
    } else {
      activeShiftFinger = null;
      activeShiftTargetKey = null;
    }
    updateHandsOverlay();
  }

  function strikeFinger(keyId) {
    if (!state.handsOn) return;
    const fid = KEY_FINGER[keyId];
    const fe = fid && fingerEls[fid];
    if (!fe) return;
    fe.g.classList.remove('struck');
    void fe.g.getBoundingClientRect();
    fe.g.classList.add('struck');
    window.setTimeout(() => fe.g.classList.remove('struck'), 220);
  }

  /* ============================================================
     PROCEDURAL WEB AUDIO MECHANICAL SWITCH SYNTHESIZER
     ============================================================ */
  let audioCtx = null;

  function ensureAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playClick(kind = 'down') {
    if (!state.soundOn) return;
    try {
      ensureAudio();
      if (!audioCtx) return;
      const t = audioCtx.currentTime;
      const isDown = kind === 'down';

      const osc = audioCtx.createOscillator();
      const oscGain = audioCtx.createGain();
      osc.type = isDown ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(isDown ? 310 : 420, t);
      osc.frequency.exponentialRampToValueAtTime(isDown ? 135 : 210, t + 0.045);

      oscGain.gain.setValueAtTime(isDown ? 0.32 : 0.18, t);
      oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

      osc.connect(oscGain);
      oscGain.connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.055);

      const bufferSize = Math.floor(audioCtx.sampleRate * 0.032);
      const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;

      const noise = audioCtx.createBufferSource();
      noise.buffer = noiseBuffer;
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(isDown ? 2800 : 3600, t);
      filter.Q.setValueAtTime(3.4, t);

      const noiseGain = audioCtx.createGain();
      noiseGain.gain.setValueAtTime(isDown ? 0.38 : 0.22, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(audioCtx.destination);
      noise.start(t);
      noise.stop(t + 0.032);
    } catch (e) {}
  }

  function burst(element, event) {
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'key-ripple';
    const x = (event && event.clientX) ? (event.clientX - rect.left) : (rect.width / 2);
    const y = (event && event.clientY) ? (event.clientY - rect.top) : (rect.height / 2);
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    element.appendChild(ripple);
    window.setTimeout(() => ripple.remove(), 450);
  }

  function activeLayer() {
    return state.physicalLayer || state.layer;
  }

  function characterFor(key, layer, layout) {
    if (key.kind === 'mod') {
      if (key.id === 'space') return layout.spaceMap?.[layer] || ' ';
      return '';
    }
    return key[layer] || '';
  }

  function allKeys(layoutName) {
    const layout = LAYOUTS[layoutName];
    return layout ? layout.rows.flat() : [];
  }

  function nextTargetInfo(layoutName) {
    const expected = state.sequence[state.cursor];
    if (!expected) return null;
    const layout = LAYOUTS[layoutName];
    if (!layout) return null;
    const layers = ['base', 'shift', 'altgr', 'ctrl'];
    for (const lyr of layers) {
      const key = allKeys(layoutName).find((item) => item.kind !== 'mod' && characterFor(item, lyr, layout) === expected);
      if (key) return { id: key.id, layer: lyr };
    }
    if (expected === ' ') return { id: 'space', layer: 'base' };
    return null;
  }

  function announceKey(glyph, keyObj, keyId) {
    if (inspectorGlyph) inspectorGlyph.textContent = glyph || (keyObj?.label || '·');
    if (inspectorCode) inspectorCode.textContent = keyId ? `KEY ${keyId.toUpperCase()}` : 'KEY READY';

    const char = glyph || '';
    let nameText = 'Standard Key';
    let uniCode = '—';

    if (char) {
      const cp = char.codePointAt(0);
      uniCode = `U+${cp.toString(16).toUpperCase().padStart(4, '0')}`;
      nameText = KHMER_NAMES[char] || `Character '${char}'`;
    } else if (keyObj?.kind === 'mod') {
      nameText = `${keyObj.label || keyId.toUpperCase()} Modifier`;
    }

    if (inspectorName) inspectorName.textContent = nameText;
    if (inspectorLayer) inspectorLayer.textContent = `${activeLayer().toUpperCase()} LAYER`;
    if (inspectorShift) inspectorShift.textContent = keyObj?.shift ? `Shift: ${keyObj.shift}` : (uniCode !== '—' ? uniCode : 'Modifier');
    const fid = KEY_FINGER[keyId];
    if (inspectorFinger) inspectorFinger.textContent = FINGER_NAMES[fid] || 'Touch Position';
  }

  /* ============================================================
     AUTHENTIC KEYBOARD RENDERING
     ============================================================ */
  function renderKeyboard() {
    if (!keyboard) return;
    const layout = LAYOUTS[state.layout];
    if (!layout) return;

    const layer = activeLayer();
    const targetInfo = state.layout === state.practiceLayout ? nextTargetInfo(state.practiceLayout) : null;
    const wanted = targetInfo ? targetInfo.id : null;

    if (boardWrap) {
      boardWrap.classList.toggle('layer-shift', layer === 'shift');
      boardWrap.classList.toggle('layer-ctrl', layer === 'ctrl');
      boardWrap.classList.toggle('layer-altgr', layer === 'altgr');
    }

    if (chassisLayoutLabel) {
      chassisLayoutLabel.textContent = layout.deckId || state.layout.toUpperCase();
    }

    keyboard.replaceChildren();
    keyEls = {};
    keyboard.setAttribute('aria-label', `${layout.label}, ${layer} layer`);

    layout.rows.forEach((row, rowIndex) => {
      const rowEl = document.createElement('div');
      rowEl.className = 'row';
      rowEl.setAttribute('role', 'group');
      rowEl.setAttribute('aria-label', `Row ${rowIndex + 1}`);

      row.forEach((k) => {
        const glyph = characterFor(k, layer, layout);
        const btn = document.createElement('div');
        const isModifier = k.kind === 'mod';
        const isSpace = k.id === 'space';
        const isBlank = !isModifier && !glyph;

        btn.className = 'key notranslate';
        btn.setAttribute('translate', 'no');
        btn.dataset.key = k.id;
        if (k.wide) btn.style.flexGrow = k.wide;
        if (k.cls) btn.classList.add(k.cls);
        if (isModifier) btn.classList.add('is-modifier');
        if (isBlank) btn.classList.add('empty');
        if (k.id === 'f' || k.id === 'j') btn.classList.add('homing');
        if (wanted === k.id) btn.classList.add('is-target');
        if (state.currentKeyId === k.id) btn.classList.add('pressed');

        keyEls[k.id] = btn;

        if (isModifier) {
          if (isSpace) {
            btn.classList.add('space');
            if (state.layout === 'standard') {
              btn.innerHTML = '<span class="space-glyph">្</span><span class="space-label">ជើង (Coeng)</span><span class="shift-badge">Space</span>';
            } else if (state.layout === 'nida') {
              btn.innerHTML = '<span class="space-glyph">␣</span><span class="space-label">ដកឃ្លា · Spacebar</span>';
            } else {
              btn.innerHTML = '<span class="space-label">Space</span>';
            }
          } else {
            btn.textContent = k.label || k.id;
          }
        } else {
          const g = document.createElement('span');
          g.className = 'glyph notranslate';
          g.setAttribute('translate', 'no');
          g.textContent = glyph || k.base || '';
          btn.appendChild(g);

          if (k.shift && layer === 'base') {
            const hint = document.createElement('span');
            hint.className = 'shift-badge notranslate';
            hint.setAttribute('translate', 'no');
            hint.textContent = k.shift;
            btn.appendChild(hint);
          }
        }

        btn.addEventListener('mouseenter', () => {
          setActiveFinger(k.id, layer);
          announceKey(glyph || (isSpace ? ' ' : ''), k, k.id);
        });

        btn.addEventListener('mouseleave', () => {
          if (targetInfo) {
            setActiveFinger(targetInfo.id, targetInfo.layer);
          } else {
            setActiveFinger(null);
          }
        });

        btn.addEventListener('pointerdown', (ev) => {
          if (isBlank && !isModifier) return;
          state.currentKeyId = k.id;
          burst(btn, ev);
          playClick('down');
          setActiveFinger(k.id, layer);
          strikeFinger(k.id);
          announceKey(glyph || (isSpace ? ' ' : ''), k, k.id);

          if (isModifier) {
            if (k.cls === 'key-shift') {
              state.physicalLayer = 'shift';
              renderKeyboard();
            } else if (k.cls === 'key-ctrl') {
              state.physicalLayer = 'ctrl';
              renderKeyboard();
            } else if (k.cls === 'key-altgr') {
              state.physicalLayer = 'altgr';
              renderKeyboard();
            }
          } else if (state.layout === state.practiceLayout && glyph) {
            acceptCharacter(glyph);
          }
          btn.classList.add('pressed');
        });

        btn.addEventListener('pointerup', () => {
          playClick('up');
          if (isModifier && state.physicalLayer) {
            state.physicalLayer = null;
            renderKeyboard();
          }
          window.setTimeout(() => {
            if (state.currentKeyId === k.id) {
              state.currentKeyId = null;
              btn.classList.remove('pressed');
            }
          }, 120);
        });

        rowEl.appendChild(btn);
      });

      keyboard.appendChild(rowEl);
    });

    document.querySelectorAll('.layout-tab').forEach((button) => {
      const active = button.dataset.layout === state.layout;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });

    document.querySelectorAll('.layer-tab').forEach((button) => {
      const active = button.dataset.layer === state.layer;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });

    if (targetInfo) {
      setActiveFinger(targetInfo.id, targetInfo.layer);
    } else {
      updateHandsOverlay();
    }
  }

  /* ============================================================
     STARTER DRILL ENGINE
     ============================================================ */
  function renderPrompt() {
    renderExerciseEntry();
    if (!exercisePrompt) return;
    exercisePrompt.replaceChildren();

    Array.from(state.sequence).forEach((glyph, index) => {
      const span = document.createElement('span');
      span.className = index < state.cursor ? 'done' : index === state.cursor ? 'current' : '';
      span.textContent = glyph;
      if (index === state.cursor) span.setAttribute('aria-label', `${glyph}, target character`);
      exercisePrompt.append(span);
    });

    const counter = byId('practice-progress-label');
    if (counter) counter.textContent = `${state.cursor} / ${state.sequence.length}`;

    const acc = byId('practice-accuracy');
    if (acc) {
      acc.textContent = state.attempts ? `${Math.round(((state.attempts - state.mistakes) / state.attempts) * 100)}% accuracy` : '100% accuracy';
    }
  }

  function renderExerciseEntry() {
    if (!exerciseEntry) return;
    exerciseEntry.replaceChildren();
    if (state.typed) {
      exerciseEntry.textContent = state.typed;
    } else {
      const hint = document.createElement('span');
      hint.className = 'entry-placeholder';
      hint.textContent = 'Click here or press any key to type…';
      exerciseEntry.append(hint);
    }
  }

  function setMessage(text, type = '') {
    const message = byId('practice-message');
    if (message) {
      message.textContent = text;
      message.classList.toggle('is-error', type === 'error');
      message.classList.toggle('is-success', type === 'success');
    }
  }

  function acceptCharacter(glyph) {
    if (!state.sequence || state.cursor >= state.sequence.length) return;
    state.attempts += 1;
    const expected = state.sequence[state.cursor];

    if (glyph === expected) {
      state.typed += glyph;
      state.cursor += 1;
      if (state.cursor === state.sequence.length) {
        setMessage('Brilliant work. You completed this starter exercise.', 'success');
      } else {
        setMessage('Correct stroke. Keep following the highlighted 3D finger guide.', 'success');
      }
    } else {
      state.mistakes += 1;
      setMessage(`Looking for ${expected} — follow the glowing key and 3D finger beacon.`, 'error');
    }

    renderPrompt();
    renderKeyboard();
  }

  function keyFromPhysicalEvent(event, layoutName = state.layout) {
    const id = CODE_MAP[event.code];
    if (!id) return null;
    const layout = LAYOUTS[layoutName];
    const key = allKeys(layoutName).find((item) => item.id === id);
    if (!key) return null;

    let layer = 'base';
    if (event.shiftKey) layer = 'shift';
    else if (event.altKey) layer = 'altgr';
    else if (event.ctrlKey) layer = 'ctrl';

    const glyph = characterFor(key, layer, layout);
    return { id, key, glyph, layer };
  }

  function setPracticeLayout(name) {
    if (!LAYOUTS[name]) return;
    state.practiceLayout = name;
    state.sequence = STARTER_SEQUENCES[name] || STARTER_SEQUENCES.standard;
    state.cursor = 0;
    state.attempts = 0;
    state.mistakes = 0;
    state.typed = '';
    state.currentKeyId = null;

    document.querySelectorAll('.practice-layout').forEach((button) => {
      const active = button.dataset.practiceLayout === name;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });

    state.layout = name;
    state.layer = 'base';

    renderPrompt();
    renderKeyboard();
    setMessage('The highlighted key and 3D finger guide show what comes next.');
  }

  /* ============================================================
     EVENT LISTENERS & CONTROLS
     ============================================================ */
  function attachKeyboardEvents() {
    exerciseEntry?.addEventListener('click', () => exerciseEntry.focus());

    document.addEventListener('keydown', (event) => {
      if (event.metaKey || event.isComposing || event.key === 'Tab') return;

      if (event.key === 'Shift') {
        state.physicalLayer = 'shift';
        renderKeyboard();
      } else if (event.key === 'Control') {
        state.physicalLayer = 'ctrl';
        renderKeyboard();
      } else if (event.key === 'Alt') {
        state.physicalLayer = 'altgr';
        renderKeyboard();
      }

      const inPractice = document.activeElement === exerciseEntry;
      const hit = keyFromPhysicalEvent(event, inPractice ? state.practiceLayout : state.layout);
      if (!hit) return;

      playClick('down');
      state.currentKeyId = hit.id;
      setActiveFinger(hit.id, hit.layer);
      strikeFinger(hit.id);

      const targetEl = keyEls[hit.id];
      if (targetEl) {
        targetEl.classList.add('pressed');
        burst(targetEl);
      }

      announceKey(hit.glyph, hit.key, hit.id);

      if ((inPractice || !document.activeElement || document.activeElement === document.body) && state.sequence[state.cursor] && hit.glyph) {
        event.preventDefault();
        acceptCharacter(hit.glyph);
      }

      window.setTimeout(() => {
        if (state.currentKeyId === hit.id) {
          state.currentKeyId = null;
          if (targetEl) targetEl.classList.remove('pressed');
        }
      }, 140);
    });

    document.addEventListener('keyup', (event) => {
      playClick('up');
      if (event.key === 'Shift' || event.key === 'Control' || event.key === 'Alt') {
        state.physicalLayer = null;
        renderKeyboard();
      }
    });

    window.addEventListener('resize', () => {
      window.requestAnimationFrame(updateHandsOverlay);
    });
  }

  function setupControls() {
    document.querySelectorAll('.layout-tab').forEach((button) => {
      button.addEventListener('click', () => {
        const nextLayout = button.dataset.layout;
        if (!LAYOUTS[nextLayout]) return;
        state.layout = nextLayout;
        state.practiceLayout = nextLayout;
        state.sequence = STARTER_SEQUENCES[nextLayout] || STARTER_SEQUENCES.standard;
        state.cursor = 0;
        state.attempts = 0;
        state.mistakes = 0;
        state.typed = '';
        state.layer = 'base';
        state.currentKeyId = null;
        renderPrompt();
        renderKeyboard();
        const sampleKey = allKeys(nextLayout).find((x) => x.id === 'k') || allKeys(nextLayout)[15];
        if (sampleKey) announceKey(sampleKey.base, sampleKey, sampleKey.id);
      });
    });

    document.querySelectorAll('.layer-tab').forEach((button) => {
      button.addEventListener('click', () => {
        state.layer = button.dataset.layer;
        state.currentKeyId = null;
        renderKeyboard();
      });
    });

    const handsToggle = byId('handsToggle');
    if (handsToggle) {
      handsToggle.addEventListener('click', () => {
        state.handsOn = !state.handsOn;
        handsToggle.classList.toggle('is-active', state.handsOn);
        handsToggle.setAttribute('aria-pressed', String(state.handsOn));
        const span = handsToggle.querySelector('span');
        if (span) span.textContent = state.handsOn ? 'Finger Guide' : 'Hands Off';
        updateHandsOverlay();
      });
    }

    const handsColorBtn = byId('handsColorQuickBtn');
    if (handsColorBtn) {
      handsColorBtn.addEventListener('click', () => {
        currentHandPresetIdx = (currentHandPresetIdx + 1) % HAND_PRESET_KEYS.length;
        const preset = HAND_COLOR_PRESETS[HAND_PRESET_KEYS[currentHandPresetIdx]];
        updateHandsGradients(preset.l, preset.r);
        if (!state.handsOn) {
          state.handsOn = true;
          if (handsToggle) {
            handsToggle.classList.add('is-active');
            handsToggle.setAttribute('aria-pressed', 'true');
            const s = handsToggle.querySelector('span');
            if (s) s.textContent = 'Finger Guide';
          }
          updateHandsOverlay();
        }
      });
    }

    const soundToggle = byId('soundToggle');
    if (soundToggle) {
      soundToggle.addEventListener('click', () => {
        state.soundOn = !state.soundOn;
        soundToggle.classList.toggle('is-active', state.soundOn);
        soundToggle.setAttribute('aria-pressed', String(state.soundOn));
        const span = soundToggle.querySelector('span');
        if (span) span.textContent = state.soundOn ? 'Key Sound' : 'Muted';
        if (state.soundOn) playClick('down');
      });
    }

    document.querySelectorAll('.practice-layout').forEach((button) => {
      button.addEventListener('click', () => {
        setPracticeLayout(button.dataset.practiceLayout);
      });
    });

    byId('reset-practice')?.addEventListener('click', () => {
      setPracticeLayout(state.practiceLayout);
    });

    document.querySelectorAll('.load-deck-btn').forEach((button) => {
      button.addEventListener('click', () => {
        const targetLayout = button.dataset.targetLayout;
        if (targetLayout && LAYOUTS[targetLayout]) {
          setPracticeLayout(targetLayout);
          byId('keyboard-deck')?.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  function setupMotion() {
    const toggle = byId('motion-toggle');
    if (!toggle) return;
    const prefersLess = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    state.motionOff = prefersLess || window.localStorage.getItem('pkLaunchMotion') === 'off';

    if (state.motionOff) document.body.classList.add('no-motion');

    const update = () => {
      const mode = state.motionOff ? 'off' : 'on';
      toggle.textContent = `Motion: ${mode}`;
      toggle.setAttribute('aria-pressed', String(state.motionOff));
      toggle.title = state.motionOff ? 'Turn nonessential animations on' : 'Turn nonessential animations off';
    };

    update();

    toggle.addEventListener('click', () => {
      state.motionOff = !state.motionOff;
      document.body.classList.toggle('no-motion', state.motionOff);
      window.localStorage.setItem('pkLaunchMotion', state.motionOff ? 'off' : 'on');
      update();
      if (state.motionOff) {
        document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
      }
    });
  }

  function setupReveals() {
    const items = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches || state.motionOff) {
      items.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
    items.forEach((el) => observer.observe(el));
  }

  function initialize() {
    initHandsDOM();
    setupMotion();
    setupControls();
    attachKeyboardEvents();
    setupReveals();

    renderPrompt();
    renderKeyboard();
    announceKey('ថ', { label: 'F', shift: 'ធ' }, 'f');

    // Ensure 3D hands compute accurate bounding rects after layout paint
    window.requestAnimationFrame(() => {
      updateHandsOverlay();
      window.setTimeout(updateHandsOverlay, 120);
    });
  }

  initialize();
})();
