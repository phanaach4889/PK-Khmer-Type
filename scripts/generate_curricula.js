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
const KEY_BY_ID_EN = buildKeyById(kb.LAYOUTS.english.rows);

function spaceEntry(table){
  const layer = (table === KEY_BY_ID_EN) ? 'base' : 'shift';
  return { id: 'space', layer, ch: ' ' };
}

function resolveCharLocation(ch, table){
  if(ch === ' ') return spaceEntry(table);
  for(const id in table){
    const k = table[id];
    if(k.base===ch) return {id, layer:'base', ch};
    if(k.shift===ch) return {id, layer:'shift', ch};
    if(k.ctrl===ch) return {id, layer:'ctrl', ch};
    if(k.altgr===ch) return {id, layer:'altgr', ch};
  }
  return null;
}

// ============================================================
// 1. GENERATE ENGLISH US CURRICULUM
// ============================================================
function generateEnglishCurriculum() {
  const levels = [
    { id: "en-L00", levelNumber: 0, title: "Keyboard Orientation", description: "Identify physical anchor keys and home row posture", objective: "Feel F and J bumps, place index fingers correctly", lcount: 4 },
    { id: "en-L01", levelNumber: 1, title: "Home Row Core", description: "F, J and Space keys", objective: "Build muscle memory for anchor keys and spacebar", lcount: 4 },
    { id: "en-L02", levelNumber: 2, title: "Full Home Row", description: "D, K, S, L, A, Semicolon", objective: "Type all home row characters accurately", lcount: 5 },
    { id: "en-L00", levelNumber: 0, title: "Anchor Keys & Orientation", description: "Identify physical anchor keys and home row posture", objective: "Feel F and J bumps, place index fingers correctly", lcount: 4 },
    { id: "en-L01", levelNumber: 1, title: "Core Home Row: D, K, S, L", description: "Middle and ring finger home-row keys", objective: "Master D, K, S, and L from anchor positions", lcount: 4 },
    { id: "en-L02", levelNumber: 2, title: "Full Core Home Row & Words", description: "A, Semicolon, and core home-row words", objective: "Type all 8 core home-row keys and common words", lcount: 5 },
    { id: "en-L03", levelNumber: 3, title: "Home Row Reaches", description: "G and H index reaches", objective: "Type home row reach keys smoothly", lcount: 4 },
    { id: "en-L04", levelNumber: 4, title: "Top Row Vowels", description: "E, I, R, U", objective: "Master frequent top row vowels and reaches", lcount: 5 },
    { id: "en-L05", levelNumber: 5, title: "Top Row Remaining", description: "T, Y, W, O, Q, P", objective: "Complete the entire top row", lcount: 5 },
    { id: "en-L06", levelNumber: 6, title: "Bottom Row", description: "C, V, B, N, M, Z, X, Comma, Period", objective: "Type all bottom row keys and basic punctuation", lcount: 6 },
    { id: "en-L07", levelNumber: 7, title: "Full Alphabet", description: "Consolidation of all 26 letters", objective: "Type all 26 letters fluently", lcount: 4 },
    { id: "en-L08", levelNumber: 8, title: "Capital Letters", description: "Shift key coordination", objective: "Apply opposite-hand Shift for capitalization", lcount: 5 },
    { id: "en-L09", levelNumber: 9, title: "Number Row", description: "Digits 1 through 0", objective: "Reach the number row accurately", lcount: 4 },
    { id: "en-L10", levelNumber: 10, title: "Punctuation & Symbols", description: "Question mark, quotes, colon, brackets, symbols", objective: "Type standard punctuation and symbols", lcount: 5 },
    { id: "en-L11", levelNumber: 11, title: "Sentences", description: "Complete sentences with punctuation", objective: "Type complete English sentences fluently", lcount: 5 },
    { id: "en-L12", levelNumber: 12, title: "Paragraphs", description: "Multi-sentence continuous prose", objective: "Maintain typing rhythm across paragraphs", lcount: 4 },
    { id: "en-L13", levelNumber: 13, title: "Speed & Mastery", description: "Timed speed challenges", objective: "Achieve high speed and accuracy mastery", lcount: 4 }
  ];
// English curriculum is verified and preserved in data/curriculum/english/
function generateEnglishCurriculum() {}

  const levelsOutput = {
    version: "1.0.0",
    layout: "english",
    language: "en",
    levels: levels.map((lvl, idx) => ({
      id: lvl.id,
      levelNumber: lvl.levelNumber,
      title: lvl.title,
      description: lvl.description,
      objective: lvl.objective,
      lessons: Array.from({ length: lvl.lcount }, (_, i) => `${lvl.id}-${String(i + 1).padStart(2, '0')}`),
      unlockRequirements: { previousLevel: idx === 0 ? null : levels[idx - 1].id },
      completionRequirements: { allLessonsCompleted: true, minLevelAccuracy: idx === 0 ? null : 90 }
    }))
  };

  const lessonSpecs = [
    // L00: Orientation
    // L00: Orientation & Anchors (F, J, Space)
    { id: "en-L00-01", level: "en-L00", order: 1, title: "Left Index Anchor (F)", type: "key-id",
      newKeys: [
        { keyId: "f", layer: "base", char: "f", finger: "li" },
        { keyId: "space", layer: "base", char: " ", finger: "thumb" }
      ],
      fingerFocus: ["li", "thumb"],
      exercises: [
        { type: "single-char", content: "fff fff fff", description: "Left index on F bump" },
        { type: "single-char", content: "f f f f f", description: "Tap F with left index" },
        { type: "single-char", content: "ff ff ff ff", description: "Double taps on F" }
      ]
    },
    { id: "en-L00-02", level: "en-L00", order: 2, title: "Right Index Anchor (J)", type: "key-id", newKeys: [{ keyId: "j", layer: "base", char: "j", finger: "ri" }], fingerFocus: ["ri"],
    { id: "en-L00-02", level: "en-L00", order: 2, title: "Right Index Anchor (J)", type: "key-id",
      newKeys: [{ keyId: "j", layer: "base", char: "j", finger: "ri" }],
      fingerFocus: ["ri"],
      exercises: [
        { type: "single-char", content: "jjj jjj jjj", description: "Right index on J bump" },
        { type: "single-char", content: "j j j j j", description: "Tap J with right index" },
        { type: "single-char", content: "jj jj jj jj", description: "Double taps on J" }
      ]
    },
    { id: "en-L00-03", level: "en-L00", order: 3, title: "F and J Alternation", type: "drill", newKeys: [], fingerFocus: ["li", "ri"],
    { id: "en-L00-03", level: "en-L00", order: 3, title: "F and J Alternation", type: "drill",
      newKeys: [],
      fingerFocus: ["li", "ri"],
      exercises: [
        { type: "drill", content: "fjf jfj fjf", description: "Alternating index fingers" },
        { type: "drill", content: "ff jj ff jj", description: "Paired index taps" },
        { type: "drill", content: "f j f j fj jf", description: "Smooth hand-to-hand transition" }
      ]
    },
    { id: "en-L00-04", level: "en-L00", order: 4, title: "Tactile Rest & Rhythm", type: "review", newKeys: [], fingerFocus: ["li", "ri", "thumb"],
    { id: "en-L00-04", level: "en-L00", order: 4, title: "Tactile Rest & Rhythm", type: "review",
      newKeys: [],
      fingerFocus: ["li", "ri", "thumb"],
      exercises: [
        { type: "drill", content: "fff jjj ff jj", description: "Resting fingers on tactile bumps" },
        { type: "drill", content: "f j f j f j", description: "Even cadence without looking" },
        { type: "drill", content: "fjf jfj ff jj", description: "Orientation foundation check" }
      ]
    },

    // L01: Home Row Core
    { id: "en-L01-01", level: "en-L01", order: 1, title: "F and J Together", type: "single-char", newKeys: [], fingerFocus: ["li", "ri"],
    // L01: Core Home Row: D, K, S, L
    { id: "en-L01-01", level: "en-L01", order: 1, title: "Middle Fingers: D and K", type: "single-char",
      newKeys: [
        { keyId: "d", layer: "base", char: "d", finger: "lm" },
        { keyId: "k", layer: "base", char: "k", finger: "rm" }
      ],
      fingerFocus: ["lm", "rm"],
      exercises: [
        { type: "single-char", content: "fjf jfj fjf", description: "Alternating index anchors" },
        { type: "single-char", content: "ff jj ff jj", description: "Pairs of F and J" },
        { type: "single-char", content: "f j f j fj jf", description: "Rhythm transitions" }
        { type: "single-char", content: "ddd kkk dkd kdk", description: "Middle finger isolation" },
        { type: "drill", content: "df jk fd kj", description: "Index and middle coordination" },
        { type: "drill", content: "dk fk dj jk d k", description: "Cross-hand middle drills" }
      ]
    },
    { id: "en-L01-02", level: "en-L01", order: 2, title: "Thumb Spacebar", type: "drill", newKeys: [{ keyId: "space", layer: "base", char: " ", finger: "rt" }], fingerFocus: ["li", "ri", "rt"],
    { id: "en-L01-02", level: "en-L01", order: 2, title: "Ring Fingers: S and L", type: "single-char",
      newKeys: [
        { keyId: "s", layer: "base", char: "s", finger: "lr" },
        { keyId: "l", layer: "base", char: "l", finger: "rr" }
      ],
      fingerFocus: ["lr", "rr"],
      exercises: [
        { type: "drill", content: "f j f j", description: "Single anchors with space" },
        { type: "drill", content: "ff jj ff jj", description: "Double anchors with space" },
        { type: "drill", content: "fj jf fj jf", description: "Alternating pairs with space" }
        { type: "single-char", content: "sss lll sls lsl", description: "Ring finger isolation" },
        { type: "drill", content: "sk ld sl ks", description: "Ring and middle coordination" },
        { type: "drill", content: "sd kl fl js s l", description: "Three-finger transitions" }
      ]
    },
    { id: "en-L01-03", level: "en-L01", order: 3, title: "Anchor Speed Drill", type: "drill", newKeys: [], fingerFocus: ["li", "ri", "rt"],
    { id: "en-L01-03", level: "en-L01", order: 3, title: "Six-Key Core Drills", type: "drill",
      newKeys: [],
      fingerFocus: ["li", "ri", "lm", "rm", "lr", "rr"],
      exercises: [
        { type: "drill", content: "fff jjj fjf jfj", description: "Fast triplets" },
        { type: "drill", content: "ff jj f j fj", description: "Mixed rhythm" },
        { type: "drill", content: "fjf jfj ff jj f j", description: "Mastery anchor flow" }
        { type: "drill", content: "fs jl sf lj", description: "Index to ring patterns" },
        { type: "drill", content: "dk sl fj kd ls jf", description: "Alternating core pairs" },
        { type: "drill", content: "sldk fjsl dksl flsk", description: "Six-key coordination flow" }
      ]
    },
    { id: "en-L01-04", level: "en-L01", order: 4, title: "Anchor Balance & Mastery", type: "test", newKeys: [], fingerFocus: ["li", "ri", "rt"],
    { id: "en-L01-04", level: "en-L01", order: 4, title: "Core Flow & Rhythm", type: "review",
      newKeys: [],
      fingerFocus: ["li", "ri", "lm", "rm", "lr", "rr", "thumb"],
      exercises: [
        { type: "drill", content: "f j ff jj fff jjj", description: "Progressive anchor buildup" },
        { type: "drill", content: "fj jf fjf jfj f j", description: "Alternating rhythm mastery" },
        { type: "drill", content: "f f j j ff jj fj jf", description: "Anchor mastery speed check" }
        { type: "drill", content: "f d s j k l", description: "Hand outward rhythm" },
        { type: "drill", content: "s d f j k l", description: "Left-to-right core wave" },
        { type: "drill", content: "lsdk fjsl sl dk fj", description: "Six-key fluency test" }
      ]
    },

    // L02: Full Home Row Expansion
    { id: "en-L02-01", level: "en-L02", order: 1, title: "Middle Fingers: D and K", type: "single-char",
      newKeys: [{ keyId: "d", layer: "base", char: "d", finger: "lm" }, { keyId: "k", layer: "base", char: "k", finger: "rm" }], fingerFocus: ["lm", "rm"],
    // L02: Full Core Home Row: A, Semicolon & Words
    { id: "en-L02-01", level: "en-L02", order: 1, title: "Pinky Fingers: A and Semicolon", type: "single-char",
      newKeys: [
        { keyId: "a", layer: "base", char: "a", finger: "lp" },
        { keyId: "semicolon", layer: "base", char: ";", finger: "rp" }
      ],
      fingerFocus: ["lp", "rp"],
      exercises: [
        { type: "single-char", content: "ddd kkk dkd kdk", description: "Middle finger isolation" },
        { type: "drill", content: "df jk fd kj", description: "Index and middle coordination" },
        { type: "drill", content: "dk fk dj jk d k", description: "Cross-hand middle drills" }
        { type: "single-char", content: "aaa ;;; a;a ;a;", description: "Pinky finger isolation" },
        { type: "drill", content: "as l; sa ;l", description: "Pinky and ring transitions" },
        { type: "drill", content: "a s d f j k l ;", description: "Full 8-key baseline" }
      ]
    },
    { id: "en-L02-02", level: "en-L02", order: 2, title: "Ring Fingers: S and L", type: "single-char",
      newKeys: [{ keyId: "s", layer: "base", char: "s", finger: "lr" }, { keyId: "l", layer: "base", char: "l", finger: "rr" }], fingerFocus: ["lr", "rr"],
    { id: "en-L02-02", level: "en-L02", order: 2, title: "All 8 Core Keys Combined", type: "drill",
      newKeys: [],
      fingerFocus: ["lp", "lr", "lm", "li", "ri", "rm", "rr", "rp"],
      exercises: [
        { type: "single-char", content: "sss lll sls lsl", description: "Ring finger isolation" },
        { type: "drill", content: "sk ld sl ks", description: "Ring and middle coordination" },
        { type: "drill", content: "sd kl fl js s l", description: "Three-finger transitions" }
        { type: "drill", content: "asdf jkl; ;lkj fdsa", description: "Home-row 8-finger wave" },
        { type: "drill", content: "a; sl dk fj", description: "Symmetric outside-in pairs" },
        { type: "drill", content: "fj dk sl a; ;l kj fd sa", description: "Inside-out and outside-in flow" }
      ]
    },
    { id: "en-L02-03", level: "en-L02", order: 3, title: "Pinky Fingers: A and Semicolon", type: "single-char",
      newKeys: [{ keyId: "a", layer: "base", char: "a", finger: "lp" }, { keyId: "semicolon", layer: "base", char: ";", finger: "rp" }], fingerFocus: ["lp", "rp"],
    { id: "en-L02-03", level: "en-L02", order: 3, title: "Core Home Row Words", type: "word",
      newKeys: [],
      fingerFocus: ["lp", "lr", "lm", "li", "ri", "rm", "rr", "rp"],
      exercises: [
        { type: "single-char", content: "aaa ;;; a;a ;a;", description: "Pinky finger isolation" },
        { type: "drill", content: "as df jk l;", description: "Home row finger wave" },
        { type: "drill", content: "a s d f j k l ;", description: "Full 8-key baseline" }
        { type: "word", content: ["as", "ask", "sad", "dad"], description: "Simple core home-row words" },
        { type: "word", content: ["fall", "lass", "flask", "lad"], description: "Four and five-letter core words" },
        { type: "word", content: ["salad", "all", "add", "alas"], description: "Rhythmic core home-row vocabulary" }
      ]
    },
    { id: "en-L02-04", level: "en-L02", order: 4, title: "Home Row Words", type: "word", newKeys: [], fingerFocus: ["lp", "lr", "lm", "li", "ri", "rm", "rr", "rp"],
    { id: "en-L02-04", level: "en-L02", order: 4, title: "Core Home Row Phrases & Flow", type: "drill",
      newKeys: [],
      fingerFocus: ["lp", "lr", "lm", "li", "ri", "rm", "rr", "rp", "thumb"],
      exercises: [
        { type: "word", content: ["as", "ask", "sad", "dad"], description: "Simple home row words" },
        { type: "word", content: ["fall", "lass", "flask", "lad"], description: "Four and five-letter words" },
        { type: "word", content: ["salad", "all", "add", "alas"], description: "Rhythmic home row vocabulary" }
        { type: "drill", content: "ask dad as a lad", description: "Short core phrases" },
        { type: "drill", content: "a sad salad fall", description: "Continuous core typing" },
        { type: "drill", content: "add a flask alas all ask sad", description: "Consolidated core home-row flow" }
      ]
    },
    { id: "en-L02-05", level: "en-L02", order: 5, title: "Home Row Review & Fluency", type: "review", newKeys: [], fingerFocus: ["lp", "lr", "lm", "li", "ri", "rm", "rr", "rp"],
    { id: "en-L02-05", level: "en-L02", order: 5, title: "Core Home Row Review & Fluency", type: "review",
      newKeys: [],
      fingerFocus: ["lp", "lr", "lm", "li", "ri", "rm", "rr", "rp"],
      exercises: [
        { type: "drill", content: "ask dad as a lad", description: "Short phrases" },
        { type: "drill", content: "a sad salad fall", description: "Continuous typing" },
        { type: "drill", content: "add a flask alas all ask sad", description: "Consolidated home row review" }
        { type: "drill", content: "a s d f j k l ; as df jk l;", description: "Core 8-key baseline check" },
        { type: "word", content: ["dad", "sad", "ask", "fall", "salad", "flask"], description: "Core word fluency review" },
        { type: "drill", content: "alas a lad ask all dad fall sad", description: "Final 8-key core test" }
      ]
    },

    // L03: Home Row Reaches (G and H)
    { id: "en-L03-01", level: "en-L03", order: 1, title: "Left Index Reach: G", type: "single-char",
      newKeys: [{ keyId: "g", layer: "base", char: "g", finger: "li" }], fingerFocus: ["li"],
      exercises: [
        { type: "single-char", content: "ggg gfg gfg", description: "Reach left index to G" },
        { type: "drill", content: "gag gas sag gal", description: "G with left hand" },
        { type: "word", content: ["glad", "flag", "slag", "gals"], description: "Words with G" }
      ]
    },
    { id: "en-L03-02", level: "en-L03", order: 2, title: "Right Index Reach: H", type: "single-char",
      newKeys: [{ keyId: "h", layer: "base", char: "h", finger: "ri" }], fingerFocus: ["ri"],
      exercises: [
        { type: "single-char", content: "hhh hjh hjh", description: "Reach right index to H" },
        { type: "drill", content: "hah has had ash", description: "H with right hand" },
        { type: "word", content: ["half", "dash", "flash", "hash"], description: "Words with H" }
      ]
    },
    { id: "en-L03-03", level: "en-L03", order: 3, title: "Words with G and H", type: "words", newKeys: [], fingerFocus: ["li", "ri"],
      exercises: [
        { type: "word", content: ["glad", "flag", "half", "hall"], description: "Combined G and H words" },
        { type: "word", content: ["dash", "flash", "shall", "glass"], description: "Full home row vocabulary" },
        { type: "drill", content: "half a glass had a flash", description: "Home row sentences" }
      ]
    },
    { id: "en-L03-04", level: "en-L03", order: 4, title: "Home Row Mastery Test", type: "test", newKeys: [], fingerFocus: ["li", "ri", "lm", "rm", "lr", "rr", "lp", "rp"],
      exercises: [
        { type: "word", content: ["flash", "glass", "salad", "flask"], description: "Full home row challenge words" },
        { type: "drill", content: "a glad lad had a half glass", description: "Complete home row sentence flow" },
        { type: "drill", content: "shall dad ask all gals as a glad lad", description: "Home row reach speed test" }
      ]
    },

    // L04: Top Row Vowels (E, I, R, U)
    { id: "en-L04-01", level: "en-L04", order: 1, title: "Top Row Left Middle: E", type: "single-char",
      newKeys: [{ keyId: "e", layer: "base", char: "e", finger: "lm" }], fingerFocus: ["lm"],
      exercises: [
        { type: "single-char", content: "eee ede ede", description: "Middle finger reach to E" },
        { type: "drill", content: "ed de ed de", description: "D to E transitions" },
        { type: "word", content: ["see", "fee", "feed", "seed", "fled", "shed", "heel"], description: "Words with E" }
      ]
    },
    { id: "en-L04-02", level: "en-L04", order: 2, title: "Top Row Right Middle: I", type: "single-char",
      newKeys: [{ keyId: "i", layer: "base", char: "i", finger: "rm" }], fingerFocus: ["rm"],
      exercises: [
        { type: "single-char", content: "iii iki iki", description: "Middle finger reach to I" },
        { type: "drill", content: "ik ki ik ki", description: "K to I transitions" },
        { type: "word", content: ["kid", "lid", "fill", "sill", "hide", "side", "file"], description: "Words with I" }
      ]
    },
    { id: "en-L04-03", level: "en-L04", order: 3, title: "Top Row Left Index: R", type: "single-char",
      newKeys: [{ keyId: "r", layer: "base", char: "r", finger: "li" }], fingerFocus: ["li"],
      exercises: [
        { type: "single-char", content: "rrr rfr rfr", description: "Index reach to R" },
        { type: "drill", content: "rf fr rf fr", description: "F to R transitions" },
        { type: "word", content: ["red", "ride", "fire", "free", "dear", "gear", "hear", "rare"], description: "Words with R" }
      ]
    },
    { id: "en-L04-04", level: "en-L04", order: 4, title: "Top Row Right Index: U", type: "single-char",
      newKeys: [{ keyId: "u", layer: "base", char: "u", finger: "ri" }], fingerFocus: ["ri"],
      exercises: [
        { type: "single-char", content: "uuu uju uju", description: "Index reach to U" },
        { type: "drill", content: "uj ju uj ju", description: "J to U transitions" },
        { type: "word", content: ["rule", "sure", "full", "dull", "rush", "slug", "gull", "glue"], description: "Words with U" }
      ]
    },
    { id: "en-L04-05", level: "en-L04", order: 5, title: "Top Row Vowels Review", type: "review", newKeys: [], fingerFocus: ["lm", "rm", "li", "ri"],
      exercises: [
        { type: "word", content: ["red", "ride", "side", "rule"], description: "Vowel word groups" },
        { type: "word", content: ["fire", "sure", "dear", "hear"], description: "Four-letter vowel words" },
        { type: "drill", content: "she is sure he is dear", description: "Flowing phrases" }
      ]
    },

    // L05: Top Row Remaining (T, Y, W, O, Q, P)
    { id: "en-L05-01", level: "en-L05", order: 1, title: "T and Y", type: "single-char",
      newKeys: [{ keyId: "t", layer: "base", char: "t", finger: "li" }, { keyId: "y", layer: "base", char: "y", finger: "ri" }], fingerFocus: ["li", "ri"],
      exercises: [
        { type: "single-char", content: "ttt yyy tyt yty", description: "Upper index reaches" },
        { type: "word", content: ["try", "dry", "they", "year"], description: "Words with T and Y" },
        { type: "word", content: ["stay", "gray", "gate", "hate", "true"], description: "Common T/Y vocabulary" }
      ]
    },
    { id: "en-L05-02", level: "en-L05", order: 2, title: "W and O", type: "single-char",
      newKeys: [{ keyId: "w", layer: "base", char: "w", finger: "lr" }, { keyId: "o", layer: "base", char: "o", finger: "rr" }], fingerFocus: ["lr", "rr"],
      exercises: [
        { type: "single-char", content: "www ooo wow owo", description: "Ring finger upper reaches" },
        { type: "word", content: ["word", "work", "world", "slow"], description: "Words with W and O" },
        { type: "word", content: ["wood", "good", "look", "foot", "took"], description: "Double-O words" }
      ]
    },
    { id: "en-L05-03", level: "en-L05", order: 3, title: "Q and P", type: "single-char",
      newKeys: [{ keyId: "q", layer: "base", char: "q", finger: "lp" }, { keyId: "p", layer: "base", char: "p", finger: "rp" }], fingerFocus: ["lp", "rp"],
      exercises: [
        { type: "single-char", content: "qqq ppp qpq pqp", description: "Pinky upper reaches" },
        { type: "word", content: ["quit", "quiet", "part", "play"], description: "Words with Q and P" },
        { type: "word", content: ["page", "rope", "hope", "drop", "post"], description: "P vocabulary" }
      ]
    },
    { id: "en-L05-04", level: "en-L05", order: 4, title: "Top Row Words", type: "words", newKeys: [], fingerFocus: [],
      exercises: [
        { type: "word", content: ["type", "your", "with", "power"], description: "Frequent top row words" },
        { type: "word", content: ["write", "poetry", "quote", "water"], description: "Extended top row words" },
        { type: "drill", content: "write your poetry with power", description: "Top row sentence flow" }
      ]
    },
    { id: "en-L05-05", level: "en-L05", order: 5, title: "Top & Home Row Mastery", type: "review", newKeys: [], fingerFocus: [],
      exercises: [
        { type: "word", content: ["quite", "your", "with", "you"], description: "Review set 1" },
        { type: "word", content: ["two", "tour", "true", "tire", "wire"], description: "Review set 2" },
        { type: "drill", content: "they walk with you to your house", description: "Fluent review sentence" }
      ]
    },

    // L06: Bottom Row
    { id: "en-L06-01", level: "en-L06", order: 1, title: "C and V", type: "single-char",
      newKeys: [{ keyId: "c", layer: "base", char: "c", finger: "lm" }, { keyId: "v", layer: "base", char: "v", finger: "li" }], fingerFocus: ["lm", "li"],
      exercises: [
        { type: "single-char", content: "ccc vvv cvc vcv", description: "Left hand bottom reaches" },
        { type: "word", content: ["cave", "voice", "cover", "very"], description: "Words with C and V" },
        { type: "word", content: ["clover", "civil", "active", "care"], description: "Expanded vocabulary" }
      ]
    },
    { id: "en-L06-02", level: "en-L06", order: 2, title: "B and N", type: "single-char",
      newKeys: [{ keyId: "b", layer: "base", char: "b", finger: "li" }, { keyId: "n", layer: "base", char: "n", finger: "ri" }], fingerFocus: ["li", "ri"],
      exercises: [
        { type: "single-char", content: "bbb nnn bnb nbn", description: "Bottom index reaches" },
        { type: "word", content: ["been", "bent", "best", "bone"], description: "Words with B and N" },
        { type: "word", content: ["born", "burn", "bank", "band"], description: "B and N word flow" }
      ]
    },
    { id: "en-L06-03", level: "en-L06", order: 3, title: "M", type: "single-char",
      newKeys: [{ keyId: "m", layer: "base", char: "m", finger: "ri" }], fingerFocus: ["ri"],
      exercises: [
        { type: "single-char", content: "mmm jmj jmj", description: "Right index reach to M" },
        { type: "word", content: ["more", "make", "time", "home"], description: "Words with M" },
        { type: "word", content: ["from", "come", "much", "move"], description: "Frequent M words" }
      ]
    },
    { id: "en-L06-04", level: "en-L06", order: 4, title: "Z and X", type: "single-char",
      newKeys: [{ keyId: "z", layer: "base", char: "z", finger: "lp" }, { keyId: "x", layer: "base", char: "x", finger: "lr" }], fingerFocus: ["lp", "lr"],
      exercises: [
        { type: "single-char", content: "zzz xxx zxz xzx", description: "Left pinky/ring bottom reaches" },
        { type: "word", content: ["zero", "zone", "size", "next"], description: "Words with Z and X" },
        { type: "word", content: ["taxi", "box", "six", "exact"], description: "Z and X words" }
      ]
    },
    { id: "en-L06-05", level: "en-L06", order: 5, title: "Comma and Period", type: "drill",
      newKeys: [{ keyId: "comma", layer: "base", char: ",", finger: "rm" }, { keyId: "period", layer: "base", char: ".", finger: "rr" }], fingerFocus: ["rm", "rr"],
      exercises: [
        { type: "drill", content: ",,, ... ,., .,.", description: "Comma and period taps" },
        { type: "drill", content: "one, two, three. four, five.", description: "Words with comma and period" },
        { type: "drill", content: "come, look. move, wait. go, stop.", description: "Phrases with punctuation" }
      ]
    },
    { id: "en-L06-06", level: "en-L06", order: 6, title: "Bottom Row Words", type: "words", newKeys: [], fingerFocus: [],
      exercises: [
        { type: "word", content: ["come", "move", "been", "next"], description: "Bottom row set 1" },
        { type: "word", content: ["zinc", "box", "climb", "calm"], description: "Bottom row set 2" },
        { type: "drill", content: "the box came back from the zone.", description: "Full sentence with bottom keys" }
      ]
    },

    // L07: Full Alphabet Consolidation
    { id: "en-L07-01", level: "en-L07", order: 1, title: "All Letters Practice", type: "drill", newKeys: [], fingerFocus: [],
      exercises: [
        { type: "drill", content: "abc def ghi jkl", description: "Alphabet groups 1" },
        { type: "drill", content: "mno pqr stu vwx yz", description: "Alphabet groups 2" },
        { type: "drill", content: "abcdefghijklmnopqrstuvwxyz", description: "Continuous alphabet" }
      ]
    },
    { id: "en-L07-02", level: "en-L07", order: 2, title: "Pangrams", type: "sentence", newKeys: [], fingerFocus: [],
      exercises: [
        { type: "sentence", content: "the quick brown fox jumps over the lazy dog.", description: "Standard pangram" },
        { type: "sentence", content: "pack my box with five dozen liquor jugs.", description: "Compact pangram" },
        { type: "sentence", content: "jackdaws love my big sphinx of quartz.", description: "Rare letter pangram" }
      ]
    },
    { id: "en-L07-03", level: "en-L07", order: 3, title: "Common Word List", type: "words", newKeys: [], fingerFocus: [],
      exercises: [
        { type: "word", content: ["about", "other", "which", "their", "there"], description: "Frequent English words 1" },
        { type: "word", content: ["would", "these", "could", "first", "water"], description: "Frequent English words 2" },
        { type: "word", content: ["sound", "great", "every", "small", "found"], description: "Frequent English words 3" }
      ]
    },
    { id: "en-L07-04", level: "en-L07", order: 4, title: "Full Alphabet Review", type: "test", newKeys: [], fingerFocus: [],
      exercises: [
        { type: "drill", content: "the five boxing wizards jump quickly.", description: "Review pangram" },
        { type: "drill", content: "how vexingly quick daft zebras jump.", description: "Comprehensive test" }
      ]
    },

    // L08: Capital Letters (Shift Keys)
    { id: "en-L08-01", level: "en-L08", order: 1, title: "Shift Basics", type: "drill",
      newKeys: [{ keyId: "shiftLeft", layer: "shift", char: "", finger: "lp" }, { keyId: "shiftRight", layer: "shift", char: "", finger: "rp" }],
      exercises: [
        { type: "drill", content: "F J D K S L A", description: "Opposite hand shift for home row" },
        { type: "drill", content: "E I R U T Y W O", description: "Top row capitals" },
        { type: "drill", content: "C V B N M Z X", description: "Bottom row capitals" }
      ]
    },
    { id: "en-L08-02", level: "en-L08", order: 2, title: "Left-Hand Capitals", type: "drill", newKeys: [],
      exercises: [
        { type: "drill", content: "Asia Boston Canada Denver Europe", description: "Left hand capitals using Right Shift" },
        { type: "drill", content: "Texas Washington Chicago Florida", description: "State names with left hand capitals" }
      ]
    },
    { id: "en-L08-03", level: "en-L08", order: 3, title: "Right-Hand Capitals", type: "drill", newKeys: [],
      exercises: [
        { type: "drill", content: "Japan Korea London Madrid New York", description: "Right hand capitals using Left Shift" },
        { type: "drill", content: "India Mexico Norway Poland United", description: "Country names with right hand capitals" }
      ]
    },
    { id: "en-L08-04", level: "en-L08", order: 4, title: "Proper Nouns", type: "words", newKeys: [],
      exercises: [
        { type: "word", content: ["Monday", "Tuesday", "Wednesday", "Thursday"], description: "Days of the week" },
        { type: "word", content: ["January", "February", "March", "April"], description: "Months of the year" },
        { type: "word", content: ["America", "Cambodia", "England", "France"], description: "Country names" }
      ]
    },
    { id: "en-L08-05", level: "en-L08", order: 5, title: "Sentence Starts", type: "sentence", newKeys: [],
      exercises: [
        { type: "sentence", content: "The sun rises in the east.", description: "Capital T start" },
        { type: "sentence", content: "Good morning to all students.", description: "Capital G start" },
        { type: "sentence", content: "Practice makes every skill better.", description: "Capital P start" }
      ]
    },

    // L09: Number Row (1-9, 0)
    { id: "en-L09-01", level: "en-L09", order: 1, title: "Numbers 1-5", type: "single-char",
      newKeys: [
        { keyId: "k1", layer: "base", char: "1", finger: "lp" },
        { keyId: "k2", layer: "base", char: "2", finger: "lr" },
        { keyId: "k3", layer: "base", char: "3", finger: "lm" },
        { keyId: "k4", layer: "base", char: "4", finger: "li" },
        { keyId: "k5", layer: "base", char: "5", finger: "li" }
      ],
      exercises: [
        { type: "single-char", content: "111 222 333 444 555", description: "Left hand numbers" },
        { type: "drill", content: "12 23 34 45 51", description: "Number pairs" },
        { type: "drill", content: "123 345 543 212", description: "Number sequences" }
      ]
    },
    { id: "en-L09-02", level: "en-L09", order: 2, title: "Numbers 6-0", type: "single-char",
      newKeys: [
        { keyId: "k6", layer: "base", char: "6", finger: "ri" },
        { keyId: "k7", layer: "base", char: "7", finger: "ri" },
        { keyId: "k8", layer: "base", char: "8", finger: "rm" },
        { keyId: "k9", layer: "base", char: "9", finger: "rr" },
        { keyId: "k0", layer: "base", char: "0", finger: "rp" }
      ],
      exercises: [
        { type: "single-char", content: "666 777 888 999 000", description: "Right hand numbers" },
        { type: "drill", content: "67 78 89 90 06", description: "Right number pairs" },
        { type: "drill", content: "678 890 098 765", description: "Right number sequences" }
      ]
    },
    { id: "en-L09-03", level: "en-L09", order: 3, title: "Mixed Numbers", type: "drill", newKeys: [],
      exercises: [
        { type: "drill", content: "10 20 30 40 50 60 70 80 90 100", description: "Decade numbers" },
        { type: "drill", content: "12345 67890 2026 1999", description: "Multi-digit numbers" },
        { type: "drill", content: "365 days, 24 hours, 60 minutes", description: "Numbers with words" }
      ]
    },
    { id: "en-L09-04", level: "en-L09", order: 4, title: "Numbers in Sentences", type: "sentence", newKeys: [],
      exercises: [
        { type: "sentence", content: "There are 7 days in 1 week.", description: "Sentence with digits" },
        { type: "sentence", content: "Room 101 is on floor 2 of the building.", description: "Address/room sentence" },
        { type: "sentence", content: "The year 2026 brings new technology.", description: "Year in sentence" }
      ]
    },

    // L10: Punctuation & Symbols
    { id: "en-L10-01", level: "en-L10", order: 1, title: "Question Mark & Slash", type: "drill",
      newKeys: [{ keyId: "slash", layer: "shift", char: "?", finger: "rp" }, { keyId: "slash", layer: "base", char: "/", finger: "rp" }],
      exercises: [
        { type: "drill", content: "who? what? when? where? why?", description: "Question words with ?" },
        { type: "drill", content: "is it true? can you see it? will they come?", description: "Questions" }
      ]
    },
    { id: "en-L10-02", level: "en-L10", order: 2, title: "Apostrophe and Quotes", type: "drill",
      newKeys: [{ keyId: "quote", layer: "base", char: "'", finger: "rp" }, { keyId: "quote", layer: "shift", char: '"', finger: "rp" }],
      exercises: [
        { type: "drill", content: "it's don't can't won't he's she's", description: "Contractions with apostrophe" },
        { type: "drill", content: '"hello" "welcome" "goodbye" "yes"', description: "Quoted dialogue" }
      ]
    },
    { id: "en-L10-03", level: "en-L10", order: 3, title: "Exclamation and Colon", type: "drill",
      newKeys: [{ keyId: "k1", layer: "shift", char: "!", finger: "lp" }, { keyId: "semicolon", layer: "shift", char: ":", finger: "rp" }],
      exercises: [
        { type: "drill", content: "stop! look! listen! run! hurry!", description: "Exclamation marks" },
        { type: "drill", content: "note: time: 10:30 score: 100!", description: "Colons and exclamations" }
      ]
    },
    { id: "en-L10-04", level: "en-L10", order: 4, title: "Parentheses and Brackets", type: "drill",
      newKeys: [
        { keyId: "k9", layer: "shift", char: "(", finger: "rr" },
        { keyId: "k0", layer: "shift", char: ")", finger: "rp" },
        { keyId: "bracketL", layer: "base", char: "[", finger: "rp" },
        { keyId: "bracketR", layer: "base", char: "]", finger: "rp" }
      ],
      exercises: [
        { type: "drill", content: "(one) (two) (three) [four] [five]", description: "Parentheses and brackets" },
        { type: "drill", content: "item (1) and item [2] are selected.", description: "Mixed brackets in sentence" }
      ]
    },
    { id: "en-L10-05", level: "en-L10", order: 5, title: "Hyphen, Plus and Equals", type: "drill",
      newKeys: [
        { keyId: "minus", layer: "base", char: "-", finger: "rp" },
        { keyId: "equal", layer: "base", char: "=", finger: "rp" },
        { keyId: "equal", layer: "shift", char: "+", finger: "rp" }
      ],
      exercises: [
        { type: "drill", content: "1 + 1 = 2 and 2 + 2 = 4", description: "Arithmetic with symbols" },
        { type: "drill", content: "up-to-date, high-speed, well-known", description: "Hyphenated words" }
      ]
    },

    // L11: Sentences
    { id: "en-L11-01", level: "en-L11", order: 1, title: "Short Sentences", type: "sentence", newKeys: [],
      exercises: [
        { type: "sentence", content: "The sky is blue today.", description: "Short sentence 1" },
        { type: "sentence", content: "Cats like to sleep warm.", description: "Short sentence 2" },
        { type: "sentence", content: "Birds sing in the morning.", description: "Short sentence 3" }
      ]
    },
    { id: "en-L11-02", level: "en-L11", order: 2, title: "Medium Sentences", type: "sentence", newKeys: [],
      exercises: [
        { type: "sentence", content: "Every good typist keeps both hands on the home row.", description: "Typing rule sentence" },
        { type: "sentence", content: "Learning to type with accuracy leads to greater speed.", description: "Accuracy sentence" }
      ]
    },
    { id: "en-L11-03", level: "en-L11", order: 3, title: "Sentences with Punctuation", type: "sentence", newKeys: [],
      exercises: [
        { type: "sentence", content: "Can you type fast? Yes, with steady daily practice!", description: "Question and answer" },
        { type: "sentence", content: 'She said, "Keep your eyes on the screen!"', description: "Dialogue quote" }
      ]
    },
    { id: "en-L11-04", level: "en-L11", order: 4, title: "Sentences with Numbers", type: "sentence", newKeys: [],
      exercises: [
        { type: "sentence", content: "There are 26 letters, 10 digits, and many symbols.", description: "Numbers in sentence" },
        { type: "sentence", content: "Flight 747 departs at 6:45 from gate 12.", description: "Airport flight announcement" }
      ]
    },
    { id: "en-L11-05", level: "en-L11", order: 5, title: "Mixed Sentence Challenge", type: "sentence", newKeys: [],
      exercises: [
        { type: "sentence", content: 'He asked: "Is 100% accuracy your target for today?"', description: "Complex sentence" },
        { type: "sentence", content: "Yes! Accuracy and rhythm always come before raw speed.", description: "Challenge response" }
      ]
    },

    // L12: Paragraphs
    { id: "en-L12-01", level: "en-L12", order: 1, title: "Two-Sentence Paragraph", type: "paragraph", newKeys: [],
      exercises: [
        { type: "paragraph", content: "Touch typing is the ability to type without looking at the keys. It frees your mind to focus on your thoughts and ideas.", description: "Paragraph 1" }
      ]
    },
    { id: "en-L12-02", level: "en-L12", order: 2, title: "Three-Sentence Paragraph", type: "paragraph", newKeys: [],
      exercises: [
        { type: "paragraph", content: "Keep your wrists straight and your fingers gently curved. Return your index fingers to F and J after reaching for keys. Smooth rhythm creates fast typing.", description: "Paragraph 2" }
      ]
    },
    { id: "en-L12-03", level: "en-L12", order: 3, title: "Story Paragraph", type: "paragraph", newKeys: [],
      exercises: [
        { type: "paragraph", content: "The library was quiet as the evening sun set through the tall windows. Students typed notes with steady clicks, filling pages with knowledge.", description: "Story paragraph" }
      ]
    },
    { id: "en-L12-04", level: "en-L12", order: 4, title: "Technology Paragraph", type: "paragraph", newKeys: [],
      exercises: [
        { type: "paragraph", content: "Modern keyboards connect people across continents in fractions of a second. Clear communication begins with accurate keystrokes and thoughtful words.", description: "Tech paragraph" }
      ]
    },

    // L13: Speed & Mastery
    { id: "en-L13-01", level: "en-L13", order: 1, title: "One-Minute Speed Drill", type: "speed", newKeys: [],
      exercises: [
        { type: "drill", content: "speed and accuracy combine to create effortless writing across every digital tool we use daily.", description: "Speed drill 1" }
      ]
    },
    { id: "en-L13-02", level: "en-L13", order: 2, title: "Three-Minute Speed Drill", type: "speed", newKeys: [],
      exercises: [
        { type: "drill", content: "steady practice builds lasting muscle memory. when fingers move with confidence, writing becomes as natural as speaking.", description: "Speed drill 2" }
      ]
    },
    { id: "en-L13-03", level: "en-L13", order: 3, title: "Speed Challenge", type: "speed", newKeys: [],
      exercises: [
        { type: "drill", content: "challenge yourself to maintain 98 percent accuracy while increasing your typing speed on every attempt.", description: "Speed challenge" }
      ]
    },
    { id: "en-L13-04", level: "en-L13", order: 4, title: "English Mastery Test", type: "test", newKeys: [],
      exercises: [
        { type: "test", content: "congratulations! you have mastered the complete english us qwerty keyboard layout with excellent precision.", description: "Final test" }
      ]
    }
  ];

  const exercisesOutput = {
    version: "1.0.0",
    layout: "english",
    exercises: {}
  };

  const lessonsOutput = {
    version: "1.0.0",
    layout: "english",
    language: "en",
    lessons: lessonSpecs.map((spec, idx) => {
      const exRefs = spec.exercises.map((ex, exIdx) => {
        const eid = `${spec.id}-E${String(exIdx + 1).padStart(2, '0')}`;
        exercisesOutput.exercises[eid] = {
          type: ex.type,
          content: ex.content,
          description: ex.description
        };
        return eid;
      });

      return {
        id: spec.id,
        level: spec.level,
        order: spec.order,
        title: spec.title,
        description: spec.title,
        objective: `Master ${spec.title}`,
        type: spec.type,
        newKeys: spec.newKeys || [],
        requiredKeys: spec.newKeys ? spec.newKeys.map(k => k.keyId) : [],
        fingerFocus: spec.fingerFocus || [],
        difficulty: Math.min(10, Math.floor(idx / 6) + 1),
        accuracyTarget: 90,
        speedTarget: null,
        mistakeTolerance: 5,
        exerciseRefs: exRefs,
        unlockRequirements: { previousLesson: idx === 0 ? null : lessonSpecs[idx - 1].id }
      };
    })
  };

  const outDir = path.join(__dirname, '../data/curriculum/english');
  fs.writeFileSync(path.join(outDir, 'levels.json'), JSON.stringify(levelsOutput, null, 2), 'utf8');
  fs.writeFileSync(path.join(outDir, 'lessons.json'), JSON.stringify(lessonsOutput, null, 2), 'utf8');
  fs.writeFileSync(path.join(outDir, 'exercises.json'), JSON.stringify(exercisesOutput, null, 2), 'utf8');
  console.log(`Generated English curriculum: ${levelsOutput.levels.length} levels, ${lessonsOutput.lessons.length} lessons, ${Object.keys(exercisesOutput.exercises).length} exercises.`);
}

// ============================================================
// 2. GENERATE KHMER NIDA CURRICULUM
// ============================================================
function generateNidaCurriculum() {
  const levels = [
    { id: "nida-L00", levelNumber: 0, title: "Keyboard Orientation", titleKm: "ការស្គាល់ក្ដារចុច", description: "Understand the NiDA layout and index anchors", objective: "Feel physical anchor keys and place fingers", lcount: 4 },
    { id: "nida-L01", levelNumber: 1, title: "Home Row Consonants", titleKm: "ព្យញ្ជនៈជួរផ្ទះ", description: "Base layer home row consonants and vowel ា", objective: "Type home row consonants accurately", lcount: 5 },
    { id: "nida-L02", levelNumber: 2, title: "Home Row Vowels & Bantoc", titleKm: "ស្រៈជួរផ្ទះ និងបន្តក់", description: "ើ and final stop mark ់", objective: "Master home row vowels and final stop", lcount: 4 },
    { id: "nida-L03", levelNumber: 3, title: "Top Row Common", titleKm: "ជួរលើទូទៅ", description: "Common top row consonants and vowels", objective: "Type top row reaches accurately", lcount: 6 },
    { id: "nida-L04", levelNumber: 4, title: "Bottom Row Common", titleKm: "ជួរក្រោមទូទៅ", description: "Bottom row consonants and full stop", objective: "Type bottom row reaches accurately", lcount: 5 },
    { id: "nida-L05", levelNumber: 5, title: "Remaining Base Layer & Coeng", titleKm: "តួអក្សរមូលដ្ឋាន និងជើង", description: "Remaining consonants, vowels and Coeng key", objective: "Master all base layer keys and Coeng subscripting", lcount: 8 },
    { id: "nida-L06", levelNumber: 6, title: "Shift Consonants", titleKm: "ព្យញ្ជនៈទី២ (Shift)", description: "Aspirated consonants on the Shift layer", objective: "Coordinate opposite-hand Shift for consonants", lcount: 8 },
    { id: "nida-L07", levelNumber: 7, title: "Shift Vowels & Compounds", titleKm: "ស្រៈទី២ និងស្រៈផ្សំ", description: "Shift vowels and compound vowel keys", objective: "Type shift vowels and compound marks fluently", lcount: 7 },
    { id: "nida-L08", levelNumber: 8, title: "Coeng Combinations", titleKm: "ការផ្សំជើង", description: "Consonant clusters and subscripts", objective: "Type complex consonant clusters with ease", lcount: 6 },
    { id: "nida-L09", levelNumber: 9, title: "Diacritics & Signs", titleKm: "វណ្ណយុត្តិ និងសញ្ញាពិសេស", description: "Diacritics, punctuation and currency", objective: "Master all diacritics and special marks", lcount: 5 },
    { id: "nida-L10", levelNumber: 10, title: "Word Practice", titleKm: "ការអនុវត្តពាក្យ", description: "High-frequency Khmer vocabulary", objective: "Type complete Khmer words fluidly", lcount: 8 },
    { id: "nida-L11", levelNumber: 11, title: "Sentences & Paragraphs", titleKm: "ប្រយោគ និងកថាខណ្ឌ", description: "Natural Khmer sentences with Shift+Space", objective: "Type flowing sentences with Shift+Space word separation", lcount: 6 },
    { id: "nida-L12", levelNumber: 12, title: "Speed & Mastery", titleKm: "ល្បឿន និងភាពស្ទាត់ជំនាញ", description: "Timed challenges and AltGr independent vowels", objective: "Achieve mastery speed and accuracy targets", lcount: 5 }
  ];

  const levelsOutput = {
    version: "1.0.0",
    layout: "nida",
    language: "km",
    levels: levels.map((lvl, idx) => ({
      id: lvl.id,
      levelNumber: lvl.levelNumber,
      title: lvl.title,
      titleKm: lvl.titleKm,
      description: lvl.description,
      objective: lvl.objective,
      lessons: Array.from({ length: lvl.lcount }, (_, i) => `${lvl.id}-${String(i + 1).padStart(2, '0')}`),
      unlockRequirements: { previousLevel: idx === 0 ? null : levels[idx - 1].id },
      completionRequirements: { allLessonsCompleted: true, minLevelAccuracy: idx === 0 ? null : 90 }
    }))
  };

  const lessonSpecs = [
    // L00: Orientation
    { id: "nida-L00-01", level: "nida-L00", order: 1, title: "Left Index Anchor ថ (F)", titleKm: "ថ (F)",
      newKeys: [
        { keyId: "f", layer: "base", char: "ថ", finger: "li" },
        { keyId: "space", layer: "base", char: " ", finger: "thumb" }
      ],
      fingerFocus: ["li", "thumb"],
      exercises: [
        { type: "single-char", content: "ថថថ ថថថ ថថថ", description: "Left index on F (ថ)" },
        { type: "single-char", content: "ថ ថ ថ ថ ថ", description: "Tap ថ with rhythm" },
        { type: "single-char", content: "ថថ ថថ ថថ ថថ", description: "Double taps on ថ" }
      ]
    },
    { id: "nida-L00-02", level: "nida-L00", order: 2, title: "Right Middle Anchor ក (K)", titleKm: "ក (K)",
      newKeys: [{ keyId: "k", layer: "base", char: "ក", finger: "rm" }], fingerFocus: ["rm"],
      exercises: [
        { type: "single-char", content: "កកក កកក កកក", description: "Right middle on K (ក)" },
        { type: "single-char", content: "ក ក ក ក ក", description: "Tap ក with right middle" },
        { type: "single-char", content: "កក កក កក កក", description: "Double taps on ក" }
      ]
    },
    { id: "nida-L00-03", level: "nida-L00", order: 3, title: "Spacebar Rhythm", titleKm: "ចង្វាក់ Spacebar",
      newKeys: [], fingerFocus: ["thumb"],
      exercises: [
        { type: "drill", content: "ថ ក ថ ក ថ", description: "Alternating anchors with space" },
        { type: "drill", content: "ក ថ ក ថ ក", description: "Reverse alternating rhythm" },
        { type: "drill", content: "ថ ថ ក ក ថ", description: "Double taps separated by space" }
      ]
    },
    { id: "nida-L00-04", level: "nida-L00", order: 4, title: "ថ & ក Coordination", titleKm: "ការរួមបញ្ចូល ថ និង ក",
      newKeys: [], fingerFocus: ["li", "rm"],
      exercises: [
        { type: "drill", content: "ថក កថ ថក កថ", description: "Paired anchor coordination" },
        { type: "drill", content: "ថថកក កកថថ", description: "Double anchor clusters" },
        { type: "drill", content: "កក ថថ កថ ថក", description: "Anchor dexterity drill" }
      ]
    },

    // L01: Home Row Consonants
    { id: "nida-L01-01", level: "nida-L01", order: 1, title: "Vowel ា (A)", titleKm: "ស្រៈ ា (A)",
      newKeys: [{ keyId: "a", layer: "base", char: "ា", finger: "lp" }], fingerFocus: ["lp"],
      exercises: [
        { type: "single-char", content: "ាាា ាាា ាាា", description: "Left pinky vowel ា" },
        { type: "word", content: ["កា", "កា", "កា", "ថា", "ថា", "ថា"], description: "First syllables: កា and ថា" },
        { type: "word", content: ["កាថា", "ថាកា", "កា", "ថា"], description: "Combining ា with anchors" }
      ]
    },
    { id: "nida-L01-02", level: "nida-L01", order: 2, title: "ស (S) and ដ (D)", titleKm: "ស និង ដ",
      newKeys: [{ keyId: "s", layer: "base", char: "ស", finger: "lr" }, { keyId: "d", layer: "base", char: "ដ", finger: "lm" }], fingerFocus: ["lr", "lm"],
      exercises: [
        { type: "single-char", content: "សសស ដដដ សដស", description: "Left ring and middle fingers" },
        { type: "word", content: ["សា", "ដា", "កាសា", "ដាកា"], description: "Syllables with ស and ដ" },
        { type: "word", content: ["សាក", "ដក", "សដកា"], description: "Words with learned keys" }
      ]
    },
    { id: "nida-L01-03", level: "nida-L01", order: 3, title: "Left Index Reach ង (G)", titleKm: "ង (G)",
      newKeys: [{ keyId: "g", layer: "base", char: "ង", finger: "li" }], fingerFocus: ["li"],
      exercises: [
        { type: "single-char", content: "ងងង ងងង ងងង", description: "Left index reach to ង" },
        { type: "word", content: ["ងា", "ដង", "កង", "សង"], description: "Words with ង" },
        { type: "word", content: ["កាង", "សាង", "ថាង"], description: "High-frequency syllables" }
      ]
    },
    { id: "nida-L01-04", level: "nida-L01", order: 4, title: "ហ (H) and ល (L)", titleKm: "ហ និង ល",
      newKeys: [{ keyId: "h", layer: "base", char: "ហ", finger: "ri" }, { keyId: "l", layer: "base", char: "ល", finger: "rr" }], fingerFocus: ["ri", "rr"],
      exercises: [
        { type: "single-char", content: "ហហហ លលល ហលហ", description: "Right hand home row expansion" },
        { type: "word", content: ["ហា", "លា", "ហាល", "លកា"], description: "Words with ហ and ល" },
        { type: "word", content: ["សាលា", "កាល", "ហាលដាក"], description: "Real Khmer words" }
      ]
    },
    { id: "nida-L01-05", level: "nida-L01", order: 5, title: "Home Row Consonants Review", titleKm: "រំលឹកព្យញ្ជនៈជួរផ្ទះ",
      newKeys: [], fingerFocus: [],
      exercises: [
        { type: "word", content: ["កាស", "សាលា", "ហាង", "ថាស"], description: "Home row words 1" },
        { type: "word", content: ["កាល", "ដក", "កក", "សក", "លា"], description: "Home row words 2" },
        { type: "drill", content: "សាលា កាល ហាល កាស ថាស", description: "Fluent home row sequence" }
      ]
    },

    // L02: Home Row Vowels & Final Stop
    { id: "nida-L02-01", level: "nida-L02", order: 1, title: "Right Pinky Vowel ើ (;)", titleKm: "ស្រៈ ើ (;)",
      newKeys: [{ keyId: "semicolon", layer: "base", char: "ើ", finger: "rp" }], fingerFocus: ["rp"],
      exercises: [
        { type: "single-char", content: "ើើើ ើើើ ើើើ", description: "Right pinky on semicolon key" },
        { type: "word", content: ["កើ", "សើ", "ដើ", "ហើ"], description: "Syllables with ើ" },
        { type: "word", content: ["លើង", "កើក", "សើល"], description: "Combinations with ើ" }
      ]
    },
    { id: "nida-L02-02", level: "nida-L02", order: 2, title: "Final Stop Mark ់ (' Bantoc)", titleKm: "បន្តក់ ់ (')",
      newKeys: [{ keyId: "quote", layer: "base", char: "់", finger: "rp" }], fingerFocus: ["rp"],
      exercises: [
        { type: "single-char", content: "់់់ ់់់ ់់់", description: "Bantoc key on quote" },
        { type: "word", content: ["កាក់", "ដាក់", "សាក់", "លាក់"], description: "Short vowel stop words" },
        { type: "word", content: ["ហាក់", "ដក់", "សក់"], description: "Words with ់" }
      ]
    },
    { id: "nida-L02-03", level: "nida-L02", order: 3, title: "Bantoc Short Words", titleKm: "ពាក្យខ្លីជាមួយបន្តក់",
      newKeys: [], fingerFocus: ["rp"],
      exercises: [
        { type: "word", content: ["ដក់", "កក់", "សក់", "លាក់", "កាក់"], description: "Short vowel stop words" },
        { type: "word", content: ["ដាក់", "សាក់", "ហាក់", "កាក់"], description: "Combining Bantoc with home row" },
        { type: "drill", content: "កាក់ ដាក់ សាក់ លាក់ ដក់ សក់", description: "Bantoc fluency drill" }
      ]
    },
    { id: "nida-L02-04", level: "nida-L02", order: 4, title: "Home Row Complete Review", titleKm: "រំលឹកជួរផ្ទះពេញលេញ",
      newKeys: [], fingerFocus: [],
      exercises: [
        { type: "word", content: ["កើ", "កាក់", "សើ", "សាក់"], description: "Review set 1" },
        { type: "word", content: ["ហាក់", "លាក់", "ដាក់", "កាល"], description: "Review set 2" },
        { type: "drill", content: "សាលា កាក់ ដាក់ កាល ហាល", description: "Full home row mastery" }
      ]
    },

    // L03: Top Row Common Characters
    { id: "nida-L03-01", level: "nida-L03", order: 1, title: "Top Row េ (E) and រ (R)", titleKm: "េ និង រ",
      newKeys: [{ keyId: "e", layer: "base", char: "េ", finger: "lm" }, { keyId: "r", layer: "base", char: "រ", finger: "li" }], fingerFocus: ["lm", "li"],
      exercises: [
        { type: "single-char", content: "េេេ រររ េរេ", description: "Left hand top row keys" },
        { type: "word", content: ["រា", "រើ", "រាក់", "រេ"], description: "Syllables with រ" },
        { type: "word", content: ["កេរ", "សេរ", "ដេរ", "រលក"], description: "Words with េ និង រ" }
      ]
    },
    { id: "nida-L03-02", level: "nida-L03", order: 2, title: "Left Index ត (T)", titleKm: "ត (T)",
      newKeys: [{ keyId: "t", layer: "base", char: "ត", finger: "li" }], fingerFocus: ["li"],
      exercises: [
        { type: "single-char", content: "តតត តតត តតត", description: "Left index reach to ត" },
        { type: "word", content: ["តា", "តើ", "តេ"], description: "Syllables with ត" },
        { type: "word", content: ["តារា", "តាក់", "តេរ", "កាត"], description: "Words with ត" }
      ]
    },
    { id: "nida-L03-03", level: "nida-L03", order: 3, title: "Right Index យ (Y) and ុ (U)", titleKm: "យ និង ុ",
      newKeys: [{ keyId: "y", layer: "base", char: "យ", finger: "ri" }, { keyId: "u", layer: "base", char: "ុ", finger: "ri" }], fingerFocus: ["ri"],
      exercises: [
        { type: "single-char", content: "យយយ ុុុ យុយ", description: "Right index top row" },
        { type: "word", content: ["យា", "យុ", "យុយ", "យារ"], description: "Syllables with យ" },
        { type: "word", content: ["កាយ", "ងាយ", "តុ", "យុត"], description: "Words with យ and ុ" }
      ]
    },
    { id: "nida-L03-04", level: "nida-L03", order: 4, title: "Right Hand Vowels ិ (I) and ោ (O)", titleKm: "ស្រៈ ិ និង ោ",
      newKeys: [{ keyId: "i", layer: "base", char: "ិ", finger: "rm" }, { keyId: "o", layer: "base", char: "ោ", finger: "rr" }], fingerFocus: ["rm", "rr"],
      exercises: [
        { type: "single-char", content: "ិិិ ោោោ ិោិ", description: "Right hand top vowels" },
        { type: "word", content: ["កិ", "កោ", "តិ", "តោ"], description: "Vowel syllables" },
        { type: "word", content: ["តិក", "កោ", "តោ", "កោរ"], description: "Words with ិ and ោ" }
      ]
    },
    { id: "nida-L03-05", level: "nida-L03", order: 5, title: "Top + Home Row Words", titleKm: "ពាក្យជួរលើ និងផ្ទះ",
      newKeys: [], fingerFocus: [],
      exercises: [
        { type: "word", content: ["កាត", "កាយ", "រាយ"], description: "Words set 1" },
        { type: "word", content: ["កោ", "តោ", "តុ", "ងាយ"], description: "Words set 2" },
        { type: "word", content: ["តារា", "យុត", "សាយ", "លាយ"], description: "Words set 3" }
      ]
    },
    { id: "nida-L03-06", level: "nida-L03", order: 6, title: "Top Row Review", titleKm: "រំលឹកជួរលើ",
      newKeys: [], fingerFocus: [],
      exercises: [
        { type: "word", content: ["រាយ", "រេ", "យុត", "យារ"], description: "Review set 1" },
        { type: "word", content: ["តារា", "កោ", "តុ", "ងាយ"], description: "Review set 2" },
        { type: "drill", content: "តារា ដេក លើ កាត ងាយ", description: "Top row review drill" }
      ]
    },

    // L04: Bottom Row Common Characters
    { id: "nida-L04-01", level: "nida-L04", order: 1, title: "ច (C) and វ (V)", titleKm: "ច និង វ",
      newKeys: [{ keyId: "c", layer: "base", char: "ច", finger: "lm" }, { keyId: "v", layer: "base", char: "វ", finger: "li" }], fingerFocus: ["lm", "li"],
      exercises: [
        { type: "single-char", content: "ចចច វវវ ចវច", description: "Left hand bottom row" },
        { type: "word", content: ["ចា", "វា", "ចិ", "វិ"], description: "Syllables with ច and វ" },
        { type: "word", content: ["ចារ", "វាចា", "វាយ", "ចាក់"], description: "Words with ច and វ" }
      ]
    },
    { id: "nida-L04-02", level: "nida-L04", order: 2, title: "ប (B)", titleKm: "ប (B)",
      newKeys: [{ keyId: "b", layer: "base", char: "ប", finger: "li" }], fingerFocus: ["li"],
      exercises: [
        { type: "single-char", content: "បបប បបប បបប", description: "Left index reach to ប" },
        { type: "word", content: ["បា", "បិ", "បុក", "បោក"], description: "Syllables with ប" },
        { type: "word", content: ["បើក", "បើ", "បាក់", "បោក"], description: "Words with ប" }
      ]
    },
    { id: "nida-L04-03", level: "nida-L04", order: 3, title: "ន (N) and ម (M)", titleKm: "ន និង ម",
      newKeys: [{ keyId: "n", layer: "base", char: "ន", finger: "ri" }, { keyId: "m", layer: "base", char: "ម", finger: "ri" }], fingerFocus: ["ri"],
      exercises: [
        { type: "single-char", content: "ននន មមម នមន", description: "Right index bottom row" },
        { type: "word", content: ["នា", "មា", "និ", "មិ"], description: "Syllables with ន and ម" },
        { type: "word", content: ["មាន", "បាន", "នាម", "មាត់"], description: "Words with ន and ម" }
      ]
    },
    { id: "nida-L04-04", level: "nida-L04", order: 4, title: "Khan Full Stop ។ (Period)", titleKm: "ខណ្ឌ ។ (Period)",
      newKeys: [{ keyId: "period", layer: "base", char: "។", finger: "rr" }], fingerFocus: ["rr"],
      exercises: [
        { type: "single-char", content: "។។។ ។។។ ។។។", description: "Khmer full stop key" },
        { type: "drill", content: "មាន។ បាន។ មក។ វាចា។", description: "Words with full stop" },
        { type: "drill", content: "តារា មក។ តោ ដេក។ តារា មាន ចាន។", description: "Simple phrases with full stop" }
      ]
    },
    { id: "nida-L04-05", level: "nida-L04", order: 5, title: "Bottom Row Review", titleKm: "រំលឹកជួរក្រោម",
      newKeys: [], fingerFocus: [],
      exercises: [
        { type: "word", content: ["ចារ", "វាចា", "បាន", "មាន"], description: "Review set 1" },
        { type: "word", content: ["បាន", "នាម", "មាត់", "ចាក់"], description: "Review set 2" },
        { type: "drill", content: "តារា មាន ចាន។ វា បាន មក។", description: "Flowing review sentences" }
      ]
    },

    // L05: Remaining Base Layer & Coeng (្)
    { id: "nida-L05-01", level: "nida-L05", order: 1, title: "ខ (X) and ឆ (Q)", titleKm: "ខ និង ឆ",
      newKeys: [{ keyId: "x", layer: "base", char: "ខ", finger: "lr" }, { keyId: "q", layer: "base", char: "ឆ", finger: "lp" }], fingerFocus: ["lr", "lp"],
      exercises: [
        { type: "single-char", content: "ខខខ ឆឆឆ ខឆខ", description: "Left hand consonants ខ and ឆ" },
        { type: "word", content: ["ខា", "ឆា", "ខុស", "ឆាប់"], description: "Words with ខ and ឆ" },
        { type: "word", content: ["ខាន", "ឆោម", "ខាត", "ឆាយ"], description: "Vocabulary with ខ and ឆ" }
      ]
    },
    { id: "nida-L05-02", level: "nida-L05", order: 2, title: "ផ (P)", titleKm: "ផ (P)",
      newKeys: [{ keyId: "p", layer: "base", char: "ផ", finger: "rp" }], fingerFocus: ["rp"],
      exercises: [
        { type: "single-char", content: "ផផផ ផផផ ផផផ", description: "Right pinky reach to ផ" },
        { type: "word", content: ["ផា", "ផាត់", "ផុស", "ផោ"], description: "Words with ផ" },
        { type: "word", content: ["ផាត់", "ផុស", "ផាល", "ផាត់មុខ"], description: "Extended ផ words" }
      ]
    },
    { id: "nida-L05-03", level: "nida-L05", order: 3, title: "ឋ (Z)", titleKm: "ឋ (Z)",
      newKeys: [{ keyId: "z", layer: "base", char: "ឋ", finger: "lp" }], fingerFocus: ["lp"],
      exercises: [
        { type: "single-char", content: "ឋឋឋ ឋឋឋ ឋឋឋ", description: "Left pinky reach to ឋ" },
        { type: "word", content: ["ឋាន", "ឋិត", "ឋិតថេរ"], description: "Words with ឋ" }
      ]
    },
    { id: "nida-L05-04", level: "nida-L05", order: 4, title: "ៀ ([) and ឹ (W)", titleKm: "ស្រៈ ៀ និង ឹ",
      newKeys: [{ keyId: "bracketL", layer: "base", char: "ៀ", finger: "rp" }, { keyId: "w", layer: "base", char: "ឹ", finger: "lr" }], fingerFocus: ["rp", "lr"],
      exercises: [
        { type: "single-char", content: "ៀៀៀ ឹឹឹ ៀឹៀ", description: "Vowels ៀ and ឹ" },
        { type: "word", content: ["រៀន", "នឹក", "ដឹង", "សៀវ"], description: "Words with ៀ and ឹ" },
        { type: "word", content: ["បង រៀន", "នឹក រលឹក", "រៀន ចារ"], description: "Phrases with ៀ and ឹ" }
      ]
    },
    { id: "nida-L05-05", level: "nida-L05", order: 5, title: "Compound ុំ (,) and ៊ (/)", titleKm: "ស្រៈ ុំ និង ត្រីស័ព្ទ ៊",
      newKeys: [{ keyId: "comma", layer: "base", char: "ុំ", finger: "rm" }, { keyId: "slash", layer: "base", char: "៊", finger: "rp" }], fingerFocus: ["rm", "rp"],
      exercises: [
        { type: "single-char", content: "ុំុំុំ ៊៊៊ ុំ៊ុំ", description: "Compound vowel ុំ and register sign ៊" },
        { type: "word", content: ["កុំ", "សុំ", "រុំ", "ដុំ"], description: "Words with ុំ" },
        { type: "word", content: ["ស៊ុប", "ហ៊ាន", "កុំ", "សុំ"], description: "Words with ៊" }
      ]
    },
    { id: "nida-L05-06", level: "nida-L05", order: 6, title: "Subscript Key ្ (J)", titleKm: "ជើង ្ (J)",
      newKeys: [{ keyId: "j", layer: "base", char: "្", finger: "ri" }], fingerFocus: ["ri"],
    { id: "nida-L05-06", level: "nida-L05", order: 6, title: "ញ (J) and Subscript ្ (Shift+J)", titleKm: "ញ (J) និង ជើង ្ (Shift+J)",
      newKeys: [
        { keyId: "j", layer: "base", char: "ញ", finger: "ri" },
        { keyId: "shiftLeft", layer: "shift", char: "", finger: "lp" },
        { keyId: "j", layer: "shift", char: "្", finger: "ri" }
      ], fingerFocus: ["ri"],
      exercises: [
        { type: "single-char", content: "្ ្ ្ ្ ្", description: "Coeng marker key J" },
        { type: "drill", content: "ក្ក ក្ម ស្ម ត្ម", description: "Consonant + J + Consonant" },
        { type: "single-char", content: "ញញញ ញញ ញ", description: "Consonant ញ key J" },
        { type: "drill", content: "្ ្ ្ ្ ្", description: "Coeng marker key Shift+J" },
        { type: "drill", content: "ក្ក ក្ម ស្ម ត្ម", description: "Consonant + Subscript + Consonant" },
        { type: "drill", content: "ក្មេង ក្ដារ ច្បាប់ ខ្លា", description: "Simple subscript clusters" }
      ]
    },
    { id: "nida-L05-07", level: "nida-L05", order: 7, title: "Consonant Clusters (ក្រ, ស្រ, ប្រ)", titleKm: "ព្យញ្ជនៈផ្ញើជើង",
      newKeys: [], fingerFocus: [],
      exercises: [
        { type: "word", content: ["ក្រ", "ស្រ", "ប្រ", "ត្រ"], description: "Subscript រ (្រ) clusters" },
        { type: "word", content: ["ប្រាក់", "ក្រចក", "ស្រុក", "ច្រក"], description: "Common cluster words" }
      ]
    },
    { id: "nida-L05-08", level: "nida-L05", order: 8, title: "Base Layer Mastery Review", titleKm: "រំលឹកតួអក្សរមូលដ្ឋានពេញលេញ",
      newKeys: [], fingerFocus: [],
      exercises: [
        { type: "word", content: ["រៀន", "ដឹង", "កុំ", "ប្រាក់"], description: "Base layer review 1" },
        { type: "word", content: ["សាលា", "តារា", "មាន", "ឆាប់"], description: "Base layer review 2" },
        { type: "drill", content: "តារា និង សុខ មក រៀន។ សាលា រៀន សប្បាយ។", description: "Base layer paragraph" }
      ]
    },

    // L06: Shift Layer Consonants
    { id: "nida-L06-01", level: "nida-L06", order: 1, title: "គ (Shift+K) and ជ (Shift+C)", titleKm: "គ និង ជ",
      newKeys: [
        { keyId: "shiftLeft", layer: "shift", char: "", finger: "lp" },
        { keyId: "k", layer: "shift", char: "គ", finger: "rm" },
        { keyId: "c", layer: "shift", char: "ជ", finger: "lm" }
      ],
      exercises: [
        { type: "single-char", content: "គគគ ជជជ គជគ", description: "Shift consonants គ and ជ" },
        { type: "word", content: ["គិត", "ជិត", "គូរ", "ជួរ"], description: "Words with គ and ជ" }
      ]
    },
    { id: "nida-L06-02", level: "nida-L06", order: 2, title: "ទ (Shift+T) and ធ (Shift+F)", titleKm: "ទ និង ធ",
      newKeys: [
        { keyId: "t", layer: "shift", char: "ទ", finger: "li" },
        { keyId: "f", layer: "shift", char: "ធ", finger: "li" }
      ],
      exercises: [
        { type: "single-char", content: "ទទទ ធធធ ទធទ", description: "Shift consonants ទ and ធ" },
        { type: "word", content: ["ទី", "ទិញ", "ធំ", "ធារ"], description: "Words with ទ and ធ" }
      ]
    },
    { id: "nida-L06-03", level: "nida-L06", order: 3, title: "ព (Shift+B) and ភ (Shift+P)", titleKm: "ព និង ភ",
      newKeys: [
        { keyId: "b", layer: "shift", char: "ព", finger: "li" },
        { keyId: "p", layer: "shift", char: "ភ", finger: "rp" }
      ],
      exercises: [
        { type: "single-char", content: "ពពព ភភភ ពភព", description: "Shift consonants ព and ភ" },
        { type: "word", content: ["ពីរ", "ពូ", "ភាព", "ភ្នំ"], description: "Words with ព and ភ" }
      ]
    },
    { id: "nida-L06-04", level: "nida-L06", order: 4, title: "ឌ (Shift+D) and ណ (Shift+N)", titleKm: "ឌ និង ណ",
      newKeys: [
        { keyId: "d", layer: "shift", char: "ឌ", finger: "lm" },
        { keyId: "n", layer: "shift", char: "ណ", finger: "ri" }
      ],
      exercises: [
        { type: "single-char", content: "ឌឌឌ ណណណ ឌណឌ", description: "Shift consonants ឌ and ណ" },
        { type: "word", content: ["ឌី", "គណនា", "បុណ្យ", "គុណ"], description: "Words with ឌ and ណ" }
      ]
    },
    { id: "nida-L06-05", level: "nida-L06", order: 5, title: "ញ (Shift+J) and អ (Shift+G)", titleKm: "ញ និង អ",
    { id: "nida-L06-05", level: "nida-L06", order: 5, title: "អ (Shift+G)", titleKm: "អ (Shift+G)",
      newKeys: [
        { keyId: "j", layer: "shift", char: "ញ", finger: "ri" },
        { keyId: "g", layer: "shift", char: "អ", finger: "li" }
      ],
      exercises: [
        { type: "single-char", content: "ញញញ អអអ ញអញ", description: "Shift consonants ញ and អ" },
        { type: "word", content: ["ញាតិ", "ញញឹម", "អ្នក", "អាន"], description: "Words with ញ and អ" }
        { type: "single-char", content: "អអអ អអអ អអអ", description: "Shift consonant អ" },
        { type: "word", content: ["អ្នក", "អាន", "ញាតិ", "ញញឹម"], description: "Words with អ and ញ" }
      ]
    },
    { id: "nida-L06-06", level: "nida-L06", order: 6, title: "ឃ ឈ ឍ ឡ", titleKm: "ឃ ឈ ឍ ឡ",
      newKeys: [
        { keyId: "x", layer: "shift", char: "ឃ", finger: "lr" },
        { keyId: "q", layer: "shift", char: "ឈ", finger: "lp" },
        { keyId: "z", layer: "shift", char: "ឍ", finger: "lp" },
        { keyId: "l", layer: "shift", char: "ឡ", finger: "rr" }
      ],
      exercises: [
        { type: "single-char", content: "ឃឃឃ ឈឈឈ ឍឍឍ ឡឡឡ", description: "Rare shift consonants" },
        { type: "word", content: ["ឃើញ", "ឈរ", "វឌ្ឍន", "ឡាន"], description: "Words with rare consonants" }
      ]
    },
    { id: "nida-L06-07", level: "nida-L06", order: 7, title: "Base vs Shift Pairs Drill", titleKm: "គូប្រៀបធៀបមូលដ្ឋាននិង Shift",
      newKeys: [],
      exercises: [
        { type: "drill", content: "ក គ ច ជ ត ទ ប ព ផ ភ", description: "Consonant series pairs" },
        { type: "word", content: ["កូន គិត", "ចាន ជិត", "តាម ទិញ"], description: "Contrasting pairs" }
      ]
    },
    { id: "nida-L06-08", level: "nida-L06", order: 8, title: "Shift Consonants Review", titleKm: "រំលឹកព្យញ្ជនៈ Shift",
      newKeys: [],
      exercises: [
        { type: "word", content: ["ឃើញ", "ជួយ", "ទិញ", "ធំ", "ភ្នំ"], description: "Shift consonants vocabulary" },
        { type: "drill", content: "អ្នក ជួយ គិត ពី ភាព សប្បាយ។", description: "Sentence with shift consonants" }
      ]
    },

    // L07: Shift Vowels & Compounds
    { id: "nida-L07-01", level: "nida-L07", order: 1, title: "ី (Shift+I) and ូ (Shift+U)", titleKm: "ស្រៈ ី និង ូ",
      newKeys: [
        { keyId: "i", layer: "shift", char: "ី", finger: "rm" },
        { keyId: "u", layer: "shift", char: "ូ", finger: "ri" }
      ],
      exercises: [
        { type: "single-char", content: "ីីី ូូូ ីូី", description: "Long vowels ី and ូ" },
        { type: "word", content: ["ទី", "ពីរ", "កូន", "ទូ"], description: "Words with ី and ូ" }
      ]
    },
    { id: "nida-L07-02", level: "nida-L07", order: 2, title: "ែ (Shift+E) and ៃ (Shift+S)", titleKm: "ស្រៈ ែ និង ៃ",
      newKeys: [
        { keyId: "e", layer: "shift", char: "ែ", finger: "lm" },
        { keyId: "s", layer: "shift", char: "ៃ", finger: "lr" }
      ],
      exercises: [
        { type: "single-char", content: "ែែែ ៃៃៃ ែៃែ", description: "Vowels ែ and ៃ" },
        { type: "word", content: ["កែវ", "ដែក", "ដៃ", "ថ្ងៃ"], description: "Words with ែ and ៃ" }
      ]
    },
    { id: "nida-L07-03", level: "nida-L07", order: 3, title: "ួ (Shift+Y) and ៅ (Shift+O)", titleKm: "ស្រៈ ួ និង ៅ",
      newKeys: [
        { keyId: "y", layer: "shift", char: "ួ", finger: "ri" },
        { keyId: "o", layer: "shift", char: "ៅ", finger: "rr" }
      ],
      exercises: [
        { type: "single-char", content: "ួួួ ៅៅៅ ួៅួ", description: "Complex vowels ួ and ៅ" },
        { type: "word", content: ["ជួយ", "រួក", "ទៅ", "នៅ"], description: "Words with ួ and ៅ" }
      ]
    },
    { id: "nida-L07-04", level: "nida-L07", order: 4, title: "ាំ (Shift+A) and ំ (Shift+M)", titleKm: "ស្រៈ ាំ និង ំ",
      newKeys: [
        { keyId: "a", layer: "shift", char: "ាំ", finger: "lp" },
        { keyId: "m", layer: "shift", char: "ំ", finger: "ri" }
      ],
      exercises: [
        { type: "single-char", content: "ាំាំាំ ំំំ ាំំាំ", description: "Nasalized vowels ាំ and ំ" },
        { type: "word", content: ["ចាំ", "នាំ", "ធំ", "កំលាំង"], description: "Words with ាំ and ំ" }
      ]
    },
    { id: "nida-L07-05", level: "nida-L07", order: 5, title: "ះ េះ ោះ ុះ", titleKm: "ស្រៈ ះ េះ ោះ ុះ",
      newKeys: [
        { keyId: "h", layer: "shift", char: "ះ", finger: "ri" },
        { keyId: "v", layer: "shift", char: "េះ", finger: "li" },
        { keyId: "semicolon", layer: "shift", char: "ោះ", finger: "rp" },
        { keyId: "comma", layer: "shift", char: "ុះ", finger: "rm" }
      ],
      exercises: [
        { type: "single-char", content: "ះះះ េះេះេះ ោះោះោះ ុះុះុះ", description: "Aspirated vowel endings" },
        { type: "word", content: ["ផ្ទះ", "ចេះ", "កោះ", "ចុះ"], description: "Words with aspirated endings" }
      ]
    },
    { id: "nida-L07-06", level: "nida-L07", order: 6, title: "ឺ (Shift+W) and ឿ (Shift+[)", titleKm: "ស្រៈ ឺ និង ឿ",
      newKeys: [
        { keyId: "w", layer: "shift", char: "ឺ", finger: "lr" },
        { keyId: "bracketL", layer: "shift", char: "ឿ", finger: "rp" }
      ],
      exercises: [
        { type: "single-char", content: "ឺឺឺ ឿឿឿ ឺឿឺ", description: "Remaining shift vowels" },
        { type: "word", content: ["គឺ", "រឿង", "ជឿ", "គ្រឿង"], description: "Words with ឺ and ឿ" }
      ]
    },
    { id: "nida-L07-07", level: "nida-L07", order: 7, title: "All Vowels Review", titleKm: "រំលឹកស្រៈទាំងអស់",
      newKeys: [],
      exercises: [
        { type: "word", content: ["ទី", "កូន", "ដែក", "ថ្ងៃ", "នៅ"], description: "Review set 1" },
        { type: "word", content: ["ផ្ទះ", "ចេះ", "គឺ", "រឿង"], description: "Review set 2" }
      ]
    },

    // L08: Coeng Combinations & Clusters
    { id: "nida-L08-01", level: "nida-L08", order: 1, title: "្រ (Subscript R) Clusters", titleKm: "ជើង ្រ",
      newKeys: [],
      exercises: [
        { type: "word", content: ["គ្រូ", "ប្រទេស", "ក្រុម", "ព្រៃ"], description: "Words with ្រ" }
      ]
    },
    { id: "nida-L08-02", level: "nida-L08", order: 2, title: "្ល (Subscript L) Clusters", titleKm: "ជើង ្ល",
      newKeys: [],
      exercises: [
        { type: "word", content: ["ខ្លា", "ផ្លូវ", "ឆ្លើយ", "ភ្លើង"], description: "Words with ្ល" }
      ]
    },
    { id: "nida-L08-03", level: "nida-L08", order: 3, title: "Subscript ញ ណ ន ម", titleKm: "ជើង ព្យញ្ជនៈច្រមុះ",
      newKeys: [],
      exercises: [
        { type: "word", content: ["កញ្ញា", "បញ្ជី", "កម្ពុជា", "សម្បត្តិ"], description: "Nasal subscript words" }
      ]
    },
    { id: "nida-L08-04", level: "nida-L08", order: 4, title: "Doubled Consonants", titleKm: "ព្យញ្ជនៈត្រួត",
      newKeys: [],
      exercises: [
        { type: "word", content: ["ក្ក", "ស្ស", "ត្ត", "ន្ន"], description: "Doubled consonant clusters" },
        { type: "word", content: ["ចិត្ត", "សន្តិភាព", "សប្បាយ", "បញ្ញត្តិ"], description: "Words with doubled consonants" }
      ]
    },
    { id: "nida-L08-05", level: "nida-L08", order: 5, title: "Complex Subscripts", titleKm: "ការផ្សំជើងស្មុគស្មាញ",
      newKeys: [],
      exercises: [
        { type: "word", content: ["សង្គ្រាម", "កន្ត្រៃ", "អន្តរជាតិ", "មន្ត្រី"], description: "Multi-tier clusters" }
      ]
    },
    { id: "nida-L08-06", level: "nida-L08", order: 6, title: "Coeng Mastery Review", titleKm: "រំលឹកព្យញ្ជនៈផ្ញើជើង",
      newKeys: [],
      exercises: [
        { type: "word", content: ["ប្រទេស", "កម្ពុជា", "អន្តរជាតិ", "សង្គ្រាម"], description: "Mastery cluster words" }
      ]
    },

    // L09: Diacritics & Special Marks
    { id: "nida-L09-01", level: "nida-L09", order: 1, title: "៉ (Shift+') and ៊ (Shift+/)", titleKm: "មូសិកទន្ត ៉ និង ត្រីស័ព្ទ ៊",
      newKeys: [
        { keyId: "quote", layer: "shift", char: "៉", finger: "rp" }
      ],
      exercises: [
        { type: "single-char", content: "៉ ៉ ៉ ៉ ៉", description: "Musekkatoan sign" },
        { type: "word", content: ["ប៉ា", "ម៉ាក់", "ប៉ះ", "ស៊ុប"], description: "Words with ៉ and ៊" }
      ]
    },
    { id: "nida-L09-02", level: "nida-L09", order: 2, title: "ៗ (Shift+2) and ៕ (Shift+Period)", titleKm: "ៗ និង ៕",
      newKeys: [
        { keyId: "k2", layer: "shift", char: "ៗ", finger: "lr" },
        { keyId: "period", layer: "shift", char: "៕", finger: "rr" }
      ],
      exercises: [
        { type: "single-char", content: "ៗៗៗ ៕៕៕ ៗ៕ៗ", description: "Repetition mark and section end" },
        { type: "word", content: ["ផ្សេងៗ", "ញឹកៗ", "តិចៗ"], description: "Repeated words" }
      ]
    },
    { id: "nida-L09-03", level: "nida-L09", order: 3, title: "Top Diacritics (័ ៌ ៍ ៏)", titleKm: "័ ៌ ៍ ៏",
      newKeys: [
        { keyId: "k7", layer: "shift", char: "័", finger: "ri" },
        { keyId: "minus", layer: "shift", char: "៌", finger: "rp" },
        { keyId: "k6", layer: "shift", char: "៍", finger: "ri" },
        { keyId: "k8", layer: "shift", char: "៏", finger: "rm" }
      ],
      exercises: [
        { type: "single-char", content: "័័័ ៌៌៌ ៍៍៍ ៏៏៏", description: "Top diacritics" },
        { type: "word", content: ["ព័ត៌មាន", "ទូរស័ព្ទ", "អាទិត្យ", "សព្វថ្ងៃ"], description: "Words with diacritics" }
      ]
    },
    { id: "nida-L09-04", level: "nida-L09", order: 4, title: "៛ (Shift+4) and ៖ (AltGr+;)", titleKm: "៛ និង ៖",
      newKeys: [
        { keyId: "k4", layer: "shift", char: "៛", finger: "li" },
        { keyId: "semicolon", layer: "altgr", char: "៖", finger: "rp" }
      ],
      exercises: [
        { type: "single-char", content: "៛៛៛ ៖៖៖", description: "Currency and colon" },
        { type: "word", content: ["តម្លៃ៛", "ចាយ៛", "ដូចតទៅ៖"], description: "Currency and punctuation phrases" }
      ]
    },
    { id: "nida-L09-05", level: "nida-L09", order: 5, title: "Diacritics Complete Review", titleKm: "រំលឹកវណ្ណយុត្តិពេញលេញ",
      newKeys: [],
      exercises: [
        { type: "word", content: ["ព័ត៌មាន", "ទូរស័ព្ទ", "អាទិត្យ", "ចាយ៛", "ផ្សេងៗ"], description: "Comprehensive diacritic review" }
      ]
    },

    // L10: High Frequency Words
    { id: "nida-L10-01", level: "nida-L10", order: 1, title: "Family Words", titleKm: "ពាក្យគ្រួសារ", newKeys: [],
      exercises: [{ type: "word", content: ["លោកពុក", "ម្តាយ", "កូន", "បង", "ប្អូន"], description: "Family vocabulary" }]
    },
    { id: "nida-L10-02", level: "nida-L10", order: 2, title: "School Words", titleKm: "ពាក្យសាលារៀន", newKeys: [],
      exercises: [{ type: "word", content: ["សាលា", "សិស្ស", "គ្រូ", "សៀវភៅ", "ប៊ិច"], description: "School vocabulary" }]
    },
    { id: "nida-L10-03", level: "nida-L10", order: 3, title: "Food Words", titleKm: "ពាក្យម្ហូបអាហារ", newKeys: [],
      exercises: [{ type: "word", content: ["បាយ", "ទឹក", "ត្រី", "សាច់", "បន្លែ"], description: "Food vocabulary" }]
    },
    { id: "nida-L10-04", level: "nida-L10", order: 4, title: "Place Words", titleKm: "ពាក្យទីកន្លែង", newKeys: [],
      exercises: [{ type: "word", content: ["ផ្ទះ", "ភូមិ", "ផ្សារ", "វត្ត", "ក្រុង"], description: "Places vocabulary" }]
    },
    { id: "nida-L10-05", level: "nida-L10", order: 5, title: "Common Verbs", titleKm: "កិរិយាសព្ទ", newKeys: [],
      exercises: [{ type: "word", content: ["ទៅ", "មក", "ញ៉ាំ", "រៀន", "ធ្វើ", "ដើរ"], description: "Common verbs" }]
    },
    { id: "nida-L10-06", level: "nida-L10", order: 6, title: "Descriptive Adjectives", titleKm: "គុណនាម", newKeys: [],
      exercises: [{ type: "word", content: ["ល្អ", "ស្អាត", "ធំ", "តូច", "ឆ្ងាញ់", "លឿន"], description: "Adjectives" }]
    },
    { id: "nida-L10-07", level: "nida-L10", order: 7, title: "Time and Numbers", titleKm: "ពេលវេលា", newKeys: [],
      exercises: [{ type: "word", content: ["ថ្ងៃ", "ខែ", "ឆ្នាំ", "ព្រឹក", "យប់"], description: "Time words" }]
    },
    { id: "nida-L10-08", level: "nida-L10", order: 8, title: "High-Frequency Words Review", titleKm: "រំលឹកពាក្យទូទៅ", newKeys: [],
      exercises: [{ type: "word", content: ["ប្រទេស", "កម្ពុជា", "ភាសាខ្មែរ", "ប្រជាជន", "សន្តិភាព"], description: "Major Khmer vocabulary" }]
    },

    // L11: Sentences & Shift+Space
    { id: "nida-L11-01", level: "nida-L11", order: 1, title: "Short Sentences (Shift+Space)", titleKm: "ប្រយោគខ្លី",
      newKeys: [{ keyId: "space", layer: "shift", char: " ", finger: "rt" }],
      exercises: [
        { type: "sentence", content: "ខ្ញុំ រៀន ភាសា ខ្មែរ។", description: "Short sentence 1" },
        { type: "sentence", content: "កម្ពុជា ជា ប្រទេស ស្អាត។", description: "Short sentence 2" }
      ]
    },
    { id: "nida-L11-02", level: "nida-L11", order: 2, title: "Medium Sentences", titleKm: "ប្រយោគមធ្យម", newKeys: [],
      exercises: [
        { type: "sentence", content: "ការ ហ្វឹកហាត់ វាយ អក្សរ ជួយ ឱ្យ យើង វាយ បាន រហ័ស។", description: "Medium sentence 1" },
        { type: "sentence", content: "ចូរ ដាក់ ម្រាមដៃ លើ ជួរដេក ដើម ជានិច្ច ដើម្បី វាយ ត្រូវ។", description: "Medium sentence 2" }
      ]
    },
    { id: "nida-L11-03", level: "nida-L11", order: 3, title: "Long Sentences", titleKm: "ប្រយោគវែង", newKeys: [],
      exercises: [
        { type: "sentence", content: "ភាសាខ្មែរ ជា ភាសា ផ្លូវការ នៃ ព្រះរាជាណាចក្រ កម្ពុជា ដែល មាន ប្រវត្តិសាស្ត្រ យូរលង់។", description: "Long sentence 1" }
      ]
    },
    { id: "nida-L11-04", level: "nida-L11", order: 4, title: "Short Paragraph", titleKm: "កថាខណ្ឌខ្លី", newKeys: [],
      exercises: [
        { type: "paragraph", content: "ការ រៀន វាយ អក្សរ ទាមទារ ការ អត់ធ្មត់។ កាលណា យើង ព្យាយាម យើង នឹង ទទួល បាន ជោគជ័យ។", description: "Short paragraph" }
      ]
    },
    { id: "nida-L11-05", level: "nida-L11", order: 5, title: "Culture Paragraph", titleKm: "កថាខណ្ឌវប្បធម៌", newKeys: [],
      exercises: [
        { type: "paragraph", content: "ប្រាសាទ អង្គរវត្ត ជា សម្បត្តិ វប្បធម៌ ដ៏ ពិសិដ្ឋ របស់ ជាតិ ខ្មែរ និង ពិភពលោក។", description: "Culture paragraph" }
      ]
    },
    { id: "nida-L11-06", level: "nida-L11", order: 6, title: "Paragraph Challenge", titleKm: "ការប្រកួតកថាខណ្ឌ", newKeys: [],
      exercises: [
        { type: "paragraph", content: "សូម ស្វាគមន៍ មកកាន់ កម្មវិធី ហាត់ វាយ អក្សរ ខ្មែរ ដ៏ ល្អ បំផុត។", description: "Final paragraph challenge" }
      ]
    },

    // L12: Speed & Mastery
    { id: "nida-L12-01", level: "nida-L12", order: 1, title: "1-Minute Timed Drill", titleKm: "ការហ្វឹកហាត់ ១ នាទី", newKeys: [],
      exercises: [{ type: "drill", content: "ការ វាយ អក្សរ ខ្មែរ ដោយ ត្រឹមត្រូវ ជួយ បង្កើន ប្រសិទ្ធភាព ការងារ និង ការ សិក្សា។", description: "1-minute drill" }]
    },
    { id: "nida-L12-02", level: "nida-L12", order: 2, title: "3-Minute Timed Drill", titleKm: "ការហ្វឹកហាត់ ៣ នាទី", newKeys: [],
      exercises: [{ type: "drill", content: "ចូរ បន្ត ការ ហ្វឹកហាត់ រាល់ ថ្ងៃ ដើម្បី រក្សា ភាព ស្ទាត់ជំនាញ លើ ក្តារចុច នីដា។", description: "3-minute drill" }]
    },
    { id: "nida-L12-03", level: "nida-L12", order: 3, title: "Speed Challenge", titleKm: "ការប្រកួតល្បឿន", newKeys: [],
      exercises: [{ type: "drill", content: "វាយ ឱ្យ បាន លឿន និង ត្រឹមត្រូវ បំផុត ដើម្បី បំបែក កំណត់ត្រា ផ្ទាល់ខ្លួន របស់ អ្នក។", description: "Speed challenge" }]
    },
    { id: "nida-L12-04", level: "nida-L12", order: 4, title: "Independent Vowels Bonus", titleKm: "ស្រៈពេញតួ (AltGr)",
      newKeys: [
        { keyId: "bracketR", layer: "base", char: "ឪ", finger: "rp" },
        { keyId: "bracketR", layer: "shift", char: "ឧ", finger: "rp" },
        { keyId: "equal", layer: "base", char: "ឲ", finger: "rp" },
        { keyId: "e", layer: "altgr", char: "ឯ", finger: "lm" },
        { keyId: "o", layer: "altgr", char: "ឱ", finger: "rr" }
      ],
      exercises: [{ type: "drill", content: "ឪពុក ឲ្យ ឯកសារ ឱកាស ឧត្តម", description: "Independent vowels" }]
    },
    { id: "nida-L12-05", level: "nida-L12", order: 5, title: "NiDA Mastery Test", titleKm: "ការប្រឡងបញ្ចប់ NiDA", newKeys: [],
      exercises: [{ type: "test", content: "អបអរសាទរ។ អ្នក បាន បញ្ចប់ វគ្គ សិក្សា វាយ អក្សរ ខ្មែរ នីដា ដោយ ជោគជ័យ បំផុត។", description: "NiDA final mastery test" }]
    }
  ];

  const exercisesOutput = {
    version: "1.0.0",
    layout: "nida",
    exercises: {}
  };

  const lessonsOutput = {
    version: "1.0.0",
    layout: "nida",
    language: "km",
    lessons: lessonSpecs.map((spec, idx) => {
      const exRefs = spec.exercises.map((ex, exIdx) => {
        const eid = `${spec.id}-E${String(exIdx + 1).padStart(2, '0')}`;
        exercisesOutput.exercises[eid] = {
          type: ex.type,
          content: ex.content,
          description: ex.description
        };
        return eid;
      });

      return {
        id: spec.id,
        level: spec.level,
        order: spec.order,
        title: spec.title,
        titleKm: spec.titleKm || spec.title,
        description: spec.title,
        objective: `Master ${spec.title}`,
        type: spec.type || "drill",
        newKeys: spec.newKeys || [],
        requiredKeys: spec.newKeys ? spec.newKeys.map(k => k.keyId) : [],
        fingerFocus: spec.fingerFocus || [],
        difficulty: Math.min(10, Math.floor(idx / 7) + 1),
        accuracyTarget: 90,
        speedTarget: null,
        mistakeTolerance: 5,
        exerciseRefs: exRefs,
        unlockRequirements: { previousLesson: idx === 0 ? null : lessonSpecs[idx - 1].id }
      };
    })
  };

  const outDir = path.join(__dirname, '../data/curriculum/nida');
  fs.writeFileSync(path.join(outDir, 'levels.json'), JSON.stringify(levelsOutput, null, 2), 'utf8');
  fs.writeFileSync(path.join(outDir, 'lessons.json'), JSON.stringify(lessonsOutput, null, 2), 'utf8');
  fs.writeFileSync(path.join(outDir, 'exercises.json'), JSON.stringify(exercisesOutput, null, 2), 'utf8');
  console.log(`Generated NiDA curriculum: ${levelsOutput.levels.length} levels, ${lessonsOutput.lessons.length} lessons, ${Object.keys(exercisesOutput.exercises).length} exercises.`);
}

generateEnglishCurriculum();
// generateEnglishCurriculum(); // English is already generated and verified
generateNidaCurriculum();

// Generate bundled data/curriculum-data.js for instant offline/browser startup
const nidaData = {
  levels: JSON.parse(fs.readFileSync(path.join(__dirname, '../data/curriculum/nida/levels.json'), 'utf8')).levels,
  lessons: JSON.parse(fs.readFileSync(path.join(__dirname, '../data/curriculum/nida/lessons.json'), 'utf8')).lessons,
  exercises: JSON.parse(fs.readFileSync(path.join(__dirname, '../data/curriculum/nida/exercises.json'), 'utf8')).exercises
};
const englishData = {
  levels: JSON.parse(fs.readFileSync(path.join(__dirname, '../data/curriculum/english/levels.json'), 'utf8')).levels,
  lessons: JSON.parse(fs.readFileSync(path.join(__dirname, '../data/curriculum/english/lessons.json'), 'utf8')).lessons,
  exercises: JSON.parse(fs.readFileSync(path.join(__dirname, '../data/curriculum/english/exercises.json'), 'utf8')).exercises
};
const bundleContent = `/* PK Khmer Type — Pre-bundled Curriculum Data for Zero-Delay Offline Startup */\n(typeof window !== "undefined" ? window : global).CURRICULUM_DATA = ${JSON.stringify({ nida: nidaData, english: englishData })};\n`;
fs.writeFileSync(path.join(__dirname, '../data/curriculum-data.js'), bundleContent, 'utf8');
console.log(`Curriculum bundle generated: data/curriculum-data.js`);
