var WORD_BANK = window.WORD_BANK || ['អាវ','តា','យាយ','មាន','ខាន','បាន','ចាន','តារា','កាច'];
var WORD_BANK_EN = window.WORD_BANK_EN || ['cat','dog','sun','run','desk','lamp','fish','bird','tree','king','fast','slow','jump','walk','hand','word','type','game','song','play'];
window.WORD_BANK = WORD_BANK;
window.WORD_BANK_EN = WORD_BANK_EN;
var collapsedLevels = null;
/* ============================================================
   PK Khmer Type — Structured Lessons, Levels & Remedial Drills
   ============================================================ */

const STANDARD_ROWS = [ROW1, ROW2, ROW3, ROW4, ROW5];
const KEY_BY_ID = {};
STANDARD_ROWS.forEach(row=> row.forEach(k=>{ if(k.kind==='glyph') KEY_BY_ID[k.id] = k; }));

/* Parallel key tables for the NiDA and English layouts, used to build
   their own (home-row-focused) lesson courses further below. */
function buildKeyById(rows){
  const map = {};
  rows.forEach(row=> row.forEach(k=>{ if(k.kind==='glyph') map[k.id] = k; }));
  return map;
}
const KEY_BY_ID_NIDA = buildKeyById([ROW1_NIDA, ROW2_NIDA, ROW3_NIDA, ROW4_NIDA, ROW5_NIDA]);
const KEY_BY_ID_EN = buildKeyById([ROW1_EN, ROW2_EN, ROW3_EN, ROW4_EN, ROW5_EN]);

function charFor(id, layer){
  if(id === 'space') return 'Space';
  const table = (currentLayoutId==='nida') ? KEY_BY_ID_NIDA
    : (currentLayoutId==='english') ? KEY_BY_ID_EN
    : KEY_BY_ID;
  const k = table[id];
  if(!k) return '';
  const v = k[layer];
  return (v !== undefined && v !== '') ? v : '';
}

const FINGER_LABELS = {
  lp:'Left Pinky', lr:'Left Ring', lm:'Left Middle', li:'Left Index',
  ri:'Right Index', rm:'Right Middle', rr:'Right Ring', rp:'Right Pinky',
  lt:'Left Thumb', rt:'Right Thumb'
};
function fingerLabel(id){ return FINGER_LABELS[KEY_FINGER[id]] || ''; }

const KEY_LABELS = {
  semicolon:';', quote:"'", backslash:'\\', comma:',', period:'.', slash:'/',
  grave:'`', minus:'-', equal:'=', bracketL:'[', bracketR:']', space:'Space'
};
function keyLabel(id){
  if(id === 'space') return 'Space';
  if(KEY_LABELS[id]) return KEY_LABELS[id];
  if(/^k\d$/.test(id)) return id.slice(1);
  return id.toUpperCase();
}

/* Return required space layer: 'shift' on Khmer layouts, 'base' on English */
function spaceLayerFor(table){
  if(typeof currentLayoutId !== 'undefined' && currentLayoutId === 'english') return 'base';
  if(table && table === KEY_BY_ID_EN) return 'base';
  return 'shift';
}
function spaceEntry(table){
  return { id: 'space', layer: spaceLayerFor(table), ch: ' ' };
}

/* entry = one drillable {key id, layer, character} triple.
   Reads from `table` when given (used for the NiDA/English home-row
   courses further below), falling back to the standard Khmer table. */
function entriesFromIds(ids, layer, table){
  const src = table || KEY_BY_ID;
  return ids.map(id=> {
    if(id === 'space') return spaceEntry(table);
    const k = src[id];
    const v = k ? k[layer] : undefined;
    const ch = (v !== undefined && v !== '') ? v : '';
    return {id, layer, ch};
  }).filter(e=> e.ch);
}
function resolveCharLocation(ch, table){
  if(ch === ' ') return spaceEntry(table);
  const src = table || KEY_BY_ID;
  for(const id in src){
    const k = src[id];
    if(k.base===ch) return {id, layer:'base', ch};
    if(k.shift===ch) return {id, layer:'shift', ch};
    if(k.ctrl===ch) return {id, layer:'ctrl', ch};
    if(k.altgr===ch) return {id, layer:'altgr', ch};
  }
  return null;
}
function materialize(entries){
  return {
    chars: entries.map(e=> e.ch),
    layers: entries.map(e=> e.layer),
    keyIds: entries.map(e=> e.id),
  };
}
function pickRandom(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

function shuffled(arr){
  const a = arr.slice();
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}

/* ---- exercise generators (operate on arrays of entries) ---- */

/* Introduce new keys one at a time: solo repetition first, then a light
   mix among the new keys, then a light mix with everything learned
   before this lesson. This is the "learn a little → practice → mix"
   pattern used throughout the whole course. */
function seqIntro(newEntries, priorEntries, opts={}){
  const soloReps = opts.soloReps ?? 4;
  const examples = opts.examples || [];
  const seq = [];

  // 1. Introduce each new key with solo repetition separated by space
  newEntries.forEach(e=>{
    for(let r=0;r<soloReps;r++) seq.push(e);
    seq.push(spaceEntry(opts.table));
  });

  // 2. If 2 or more new keys, alternate and double-tap with spaces
  if(newEntries.length >= 2){
    for(let r=0;r<2;r++){
      newEntries.forEach(e=> seq.push(e));
      seq.push(spaceEntry(opts.table));
    }
    newEntries.forEach(e=>{
      seq.push(e); seq.push(e);
      seq.push(spaceEntry(opts.table));
    });
  }

  // 3. Examples if provided
  if(examples && examples.length){
    examples.forEach(ex=>{
      for(const ch of ex){
        if(ch === ' '){
          seq.push(spaceEntry(opts.table));
        } else {
          const loc = resolveCharLocation(ch, opts.table);
          if(loc) seq.push(loc);
        }
      }
      seq.push(spaceEntry(opts.table));
    });
  }

  // 4. Mix with prior learned keys if available
  if(priorEntries && priorEntries.length){
    const full = priorEntries.concat(newEntries);
    for(let r=0;r<4;r++){
      seq.push(pickRandom(newEntries));
      seq.push(pickRandom(full));
      seq.push(spaceEntry(opts.table));
    }
  }

  // Clean trailing spaces
  while(seq.length && seq[seq.length-1].ch === ' ') seq.pop();
  return seq;
}

/* Fixed-length combinations repeated `count` times with spaced rhythm. */
function seqCombo(pool, comboLen, count, examples){
  const seq = [];
  if(examples && examples.length){
    examples.forEach(ex=>{
      for(const ch of ex){
        if(ch === ' ') seq.push(spaceEntry());
        else {
          const loc = resolveCharLocation(ch);
          if(loc) seq.push(loc);
        }
      }
      seq.push(spaceEntry());
    });
  }
  for(let i=0;i<count;i++){
    for(let c=0;c<comboLen;c++) seq.push(pickRandom(pool));
    seq.push(spaceEntry());
  }
  while(seq.length && seq[seq.length-1].ch === ' ') seq.pop();
  return seq;
}

/* Randomized drill/review/test sequence with natural spaced 2-3 character syllables. */
function seqRandom(pool, length){
  const seq = []; let lastCh = null;
  let wordLen = 0;
  let targetChunk = 2 + (Math.random() > 0.5 ? 1 : 0);
  for(let i=0;i<length;i++){
    let e, tries=0;
    do{ e = pickRandom(pool); tries++; } while(e.ch===lastCh && pool.length>1 && tries<10);
    lastCh = e.ch;
    seq.push(e);
    wordLen++;
    if(wordLen >= targetChunk && i < length - 1){
      seq.push(spaceEntry());
      wordLen = 0;
      targetChunk = 2 + (Math.random() > 0.5 ? 1 : 0);
    }
  }
  while(seq.length && seq[seq.length-1].ch === ' ') seq.pop();
  return seq;
}

function seqWords(words, table){
  const seq = [];
  shuffled(words).forEach(w=>{
    for(const ch of w){
      const loc = resolveCharLocation(ch, table);
      if(loc) seq.push(loc);
    }
    seq.push(spaceEntry(table));
  });
  while(seq.length && seq[seq.length-1].ch === ' ') seq.pop();
  return seq;
}

/* Intelligent mistake review: pairs each missed character with contrasting context keys.
   Never produces consecutive identical letters (e.g. never 'កក' or 'ក ក ក').
   Generates rhythmic, bite-sized Khmer syllables (2-3 chars) for maximum muscle memory. */
function seqReviewMistakes(missedEntries, companionEntries){
  if(!missedEntries || !missedEntries.length) return [];

  // Default companions from home row anchors if companion list is empty
  const fallbackChars = ['ដ', 'ថ', 'ញ', 'ក', 'ស', 'ង', 'ហ', 'ា', 'ម', 'រ', 'ប'];
  let companions = (companionEntries && companionEntries.length)
    ? companionEntries.filter(c => c && c.ch && !missedEntries.some(m => m.ch === c.ch))
    : [];

  if(!companions.length){
    fallbackChars.forEach(ch => {
      if(!missedEntries.some(m => m.ch === ch)){
        const loc = resolveCharLocation(ch);
        if(loc) companions.push(loc);
      }
    });
  }
  if(!companions.length) companions = missedEntries;

  const seq = [];
  function addWord(arr){
    for(let i=0; i<arr.length; i++){
      const item = arr[i];
      if(!item || !item.ch) continue;
      // Strictly prevent identical consecutive letters
      if(seq.length && seq[seq.length-1].ch === item.ch) continue;
      seq.push(item);
    }
    seq.push(spaceEntry());
  }

  // Phase 1: For each missed key, alternate with companion keys in 2-3 character syllables
  missedEntries.forEach((m, idx) => {
    const c1 = companions[idx % companions.length];
    const c2 = companions[(idx + 1) % companions.length] || c1;

    // Word 1: [Companion, Missed] e.g. ដក
    addWord([c1, m]);
    // Word 2: [Missed, Companion] e.g. កដ
    addWord([m, c1]);
    // Word 3: [Companion, Missed, Companion] or [Missed, Companion, Missed]
    if(c2 && c2.ch !== c1.ch && c2.ch !== m.ch){
      addWord([c1, m, c2]);
    } else {
      addWord([m, c1, m]);
    }
  });

  // Phase 2: If multiple keys were missed, cross-train them against each other
  if(missedEntries.length >= 2){
    for(let i=0; i<missedEntries.length - 1; i++){
      const m1 = missedEntries[i];
      const m2 = missedEntries[i+1];
      const c = companions[i % companions.length];
      addWord([m1, m2]);
      addWord([m2, m1]);
      if(c && c.ch !== m1.ch && c.ch !== m2.ch) addWord([m1, c, m2]);
    }
  }

  // Phase 3: Final review round if only 1 key was missed so it's a satisfying ~14 char drill
  if(missedEntries.length === 1 && companions.length >= 3){
    const m = missedEntries[0];
    const c3 = companions[2];
    addWord([m, c3]);
    addWord([c3, m, companions[0]]);
  }

  while(seq.length && seq[seq.length-1].ch === ' ') seq.pop();
  return seq;
}

const LEVELS_STANDARD = [
  {id:1, title:'Level 1 · Home Row Basics'},
  {id:2, title:'Level 2 · Home Row Combinations'},
  {id:3, title:'Level 3 · Home Row + Shift'},
  {id:4, title:'Level 4 · Remaining Consonants'},
  {id:5, title:'Level 5 · Vowels & Signs'},
  {id:6, title:'Level 6 · Khmer Numerals'},
  {id:7, title:'Level 7 · Ctrl / AltGr Layers'},
  {id:8, title:'Level 8 · Full Keyboard & Mastery'},
  {id:9, title:'Level 4 · Word Practice'},
];

const LEVELS_NIDA = [
  {id:1, title:'Level 1 · Beginner: Consonants & Core Vowels'},
  {id:2, title:'Level 2 · Intermediate: Subscripts (Coeng J)'},
  {id:3, title:'Level 3 · Advanced: Independent Vowels & Signs'},
  {id:4, title:'Level 4 · Master: Numerals & Fluid Prose'},
];

const LEVELS_ENGLISH = [
  {id:1, title:'Level 1 · Home Row Basics'},
  {id:2, title:'Level 2 · Home Row Combinations'},
  {id:3, title:'Level 3 · Top Row Reach'},
  {id:4, title:'Level 4 · Bottom Row Reach'},
  {id:5, title:'Level 5 · Shift Layer & Punctuation'},
  {id:6, title:'Level 6 · Full Keyboard Sentences'},
  {id:9, title:'Level 4 · Word Practice'},
];

window.LEVEL_SETS = LEVEL_SETS = {
  standard: LEVELS_STANDARD,
  nida: LEVELS_NIDA,
  english: LEVELS_ENGLISH,
};

window.LEVELS = LEVELS = LEVEL_SETS[currentLayoutId] || LEVELS_STANDARD;

function buildCourse(){
  const lessons = [];
  let nextId = 1;
  let pool = [];

  function addLesson(level, type, title, subtitle, generateFn, opts={}){
    const id = nextId++;
    const defaultThreshold = type==='test' ? 90 : type==='review' ? 88 : 85;
    lessons.push({
      id, level, type, title, subtitle,
      layer: opts.newLayer || 'base',
      threshold: opts.threshold ?? defaultThreshold,
      newIds: opts.newIds || [],
      newLayer: opts.newLayer || 'base',
      examples: opts.examples || [],
      generate: generateFn,
    });
    return id;
  }
  const modLabel = {base:'No modifier', shift:'Hold Shift', ctrl:'Hold Ctrl', altgr:'Hold AltGr'};
  function chipList(ids){ return ids.map(id => `${charFor(id,'base')} (${keyLabel(id)})`).join('  '); }

  /* ===== LEVEL 1 — Home Row Basics (Lessons 1-8) =====
     Starts strictly with Anchor Keys F & J (ថ & ញ). No G (ង) or H (ហ) until later! */

  // Lesson 1: Index Anchors F & J (Left Index = ថ, Right Index = ញ)
  {
    const ids = ['f', 'j'];
    const ex = ['ថ ថ', 'ញ ញ', 'ថថ ញញ', 'ថញ ញថ'];
    addLesson(1, 'intro', 'Home Row — Index Anchors (F & J)', 'Left Index F (ថ) · Right Index J (ញ)',
      ()=> materialize(seqIntro(entriesFromIds(ids,'base'), [], {soloReps:4, examples:ex})),
      {newIds:ids, newLayer:'base', examples:ex});
    pool = pool.concat(entriesFromIds(ids,'base'));
  }

  // Lesson 2: Middle Fingers D & K (Left Middle = ដ, Right Middle = ក)
  {
    const ids = ['d', 'k'];
    const ex = ['ដ ដ', 'ក ក', 'ដដ កក', 'ដក', 'កដ'];
    const priorSnap = pool.slice();
    addLesson(1, 'intro', 'Home Row — Middle Fingers (D & K)', 'Left Middle D (ដ) · Right Middle K (ក)',
      ()=> materialize(seqIntro(entriesFromIds(ids,'base'), priorSnap, {soloReps:4, examples:ex})),
      {newIds:ids, newLayer:'base', examples:ex});
    pool = pool.concat(entriesFromIds(ids,'base'));
  }

  // Lesson 3: 4 Keys Combined (F, J, D, K)
  {
    const ids = ['f', 'j', 'd', 'k'];
    const ex = ['ថដ', 'ញក', 'ដក', 'ថញ', 'កក', 'ដដ'];
    const snap = pool.slice();
    addLesson(1, 'combo', 'Home Row — 4 Keys Combined', 'Index & Middle Anchors · ថ ញ ដ ក',
      ()=> materialize(seqCombo(snap, 2, 8, ex)),
      {newIds:ids, newLayer:'base', examples:ex});
  }

  // Lesson 4: Index Reach G & H (Left Reach = ង, Right Reach = ហ)
  {
    const ids = ['g', 'h'];
    const ex = ['ង ង', 'ហ ហ', 'ថង', 'ញហ', 'ងហ', 'ហង'];
    const priorSnap = pool.slice();
    addLesson(1, 'intro', 'Home Row — Index Reach (G & H)', 'Left Reach G (ង) · Right Reach H (ហ)',
      ()=> materialize(seqIntro(entriesFromIds(ids,'base'), priorSnap, {soloReps:4, examples:ex})),
      {newIds:ids, newLayer:'base', examples:ex});
    pool = pool.concat(entriesFromIds(ids,'base'));
  }

  // Lesson 5: Center 6 Keys Combined (F, J, D, K, G, H)
  {
    const ids = ['g', 'h', 'f', 'j', 'd', 'k'];
    const ex = ['កក', 'ដក', 'ងហ', 'កង', 'ដង', 'ហង'];
    const snap = pool.slice();
    addLesson(1, 'combo', 'Home Row — Center 6 Keys', 'All Index & Middle Keys · ថ ញ ដ ក ង ហ',
      ()=> materialize(seqCombo(snap, 2, 9, ex)),
      {newIds:ids, newLayer:'base', examples:ex});
  }

  // Lesson 6: Ring Fingers S & L (Left Ring = ស, Right Ring = ល)
  {
    const ids = ['s', 'l'];
    const ex = ['ស ស', 'ល ល', 'សល', 'សក', 'លក', 'ហល'];
    const priorSnap = pool.slice();
    addLesson(1, 'intro', 'Home Row — Ring Fingers (S & L)', 'Left Ring S (ស) · Right Ring L (ល)',
      ()=> materialize(seqIntro(entriesFromIds(ids,'base'), priorSnap, {soloReps:4, examples:ex})),
      {newIds:ids, newLayer:'base', examples:ex});
    pool = pool.concat(entriesFromIds(ids,'base'));
  }

  // Lesson 7: Pinky Fingers & Vowel A (A, ;, ')
  {
    const ids = ['a', 'semicolon', 'quote'];
    const ex = ['កា', 'សា', 'ដា', 'លះ', 'សះ', 'កះ'];
    const priorSnap = pool.slice();
    addLesson(1, 'intro', "Home Row — Pinky Keys & Vowel A", "Left Pinky A (ា) · Right Pinky ; (ះ) & ' (់)",
      ()=> materialize(seqIntro(entriesFromIds(ids,'base'), priorSnap, {soloReps:4, examples:ex})),
      {newIds:ids, newLayer:'base', examples:ex});
    pool = pool.concat(entriesFromIds(ids,'base'));
  }

  // Lesson 8: Home Row Words — First real Khmer words entirely from Home Row!
  {
    const ids = ['f','j','d','k','g','h','s','l','a','semicolon','quote'];
    const ex = ['សាលា', 'កាក់', 'ដាក់', 'ហាល', 'កាល', 'ដក', 'កក', 'កា', 'សា'];
    addLesson(1, 'words', 'Home Row Words — Complete Home Row', 'Real Khmer words from Home Row keys',
      ()=> materialize(seqWords(ex)),
      {newIds:ids, newLayer:'base', examples:ex});
  }

  /* ===== LEVEL 2 — Home Row Combinations & Speed ===== */
  {
    const snap = pool.slice();
    const ex2 = ['កា', 'ដក', 'សា', 'លក', 'ថញ', 'ងហ'];
    addLesson(2,'combo','Two-Character Combos','Pairs drawn from the Home Row',
      ()=> materialize(seqCombo(snap, 2, 12, ex2)), {examples:ex2});

    const ex3 = ['កាក់', 'ដាក់', 'ហាល', 'កាល', 'ងាក'];
    addLesson(2,'combo','Three-Character Syllables','Triples and syllables from Home Row',
      ()=> materialize(seqCombo(snap, 3, 10, ex3)), {examples:ex3});

    const ex4 = ['សាលា', 'កកកក', 'ហាលកាល', 'ដកដាក់'];
    addLesson(2,'combo','Four-Character Flow','Four-character groups and words',
      ()=> materialize(seqCombo(snap, 4, 8, ex4)), {examples:ex4});

    const exWords = ['សាលា', 'កាក់', 'ដាក់', 'ហាល', 'កាល', 'ដក', 'កក', 'សះ', 'លះ'];
    addLesson(2,'words','Home Row Words Drill','Real Khmer vocabulary, typed from memory',
      ()=> materialize(seqWords(exWords)), {examples:exWords});

    addLesson(2,'review','Random Home Row Drill','Fully randomized order across all home keys',
      ()=> materialize(seqRandom(snap, 28)), {examples:['ថ', 'ញ', 'ដ', 'ក', 'ង', 'ហ', 'ស', 'ល']});

    addLesson(2,'test','Home Row Speed Test','Type as fast and accurately as you can',
      ()=> materialize(seqRandom(snap, 32)), {threshold:90, examples:['កាក់', 'ដាក់', 'សាលា', 'ហាល']});
  }

  /* ===== LEVEL 3 — Home Row + Shift ===== */
  const homeShiftGroups = [
    {label:'Index Anchors (F & J)', ids:['f','j'], ex:['ធ ធ', 'ុំ ុំ', 'ធុំ']},
    {label:'Middle Fingers (D & K)', ids:['d','k'], ex:['ឌ ឌ', 'គ គ', 'គក', 'ឌក']},
    {label:'Index Reach (G & H)', ids:['g','h'], ex:['ុះ ុះ', '៏ ៏']},
    {label:'Ring Fingers (S & L)', ids:['s','l'], ex:['ាំ ាំ', 'ឡ ឡ', 'ឡា']},
    {label:'Pinky Fingers (A, ;, \')', ids:['a','semicolon','quote'], ex:['ៃ ៃ', '៖ ៖', '៉ ៉', 'ដៃ']},
  ];
  homeShiftGroups.forEach(grp=>{
    const priorSnap = pool.slice();
    addLesson(3,'intro', `Home Row Shift — ${grp.label}`, `${modLabel.shift} · ${grp.ids.map(keyLabel).join(' ')}`,
      ()=> materialize(seqIntro(entriesFromIds(grp.ids,'shift'), priorSnap, {soloReps:4, examples:grp.ex})),
      {newIds:grp.ids, newLayer:'shift', examples:grp.ex});
    pool = pool.concat(entriesFromIds(grp.ids,'shift'));
  });
  {
    const snap = pool.slice();
    addLesson(3,'combo','Home Row + Shift Mix','Base and Shift characters mixed together',
      ()=> materialize(seqRandom(snap, 24)), {examples:['ធំ', 'គក', 'ឡា', 'ដៃ']});
    addLesson(3,'combo','Shift Combinations','Short combos using Shift characters',
      ()=> materialize(seqCombo(snap, 2, 10, ['ធុំ', 'គក'])), {examples:['ធុំ', 'គក']});
    addLesson(3,'test','Home Row + Shift Test','Accuracy test across Base and Shift',
      ()=> materialize(seqRandom(snap, 30)), {threshold:90, examples:['ធ', 'គ', 'ឌ', 'ឡ', 'ៃ']});
  }

  /* ===== LEVEL 4 — Remaining Consonants ===== */
  const remConsonantGroups = [
    {label:'Top Left (Q, T, Y)', ids:['q','t','y'], ex:['ឈ', 'ទ', 'យ', 'យាយ']},
    {label:'Top Right (P, R, Z)', ids:['p','r','z'], ex:['ផ', 'រ', 'ឋ', 'រាជា']},
    {label:'Bottom Left (X, C, V)', ids:['x','c','v'], ex:['ខ', 'ច', 'វ', 'ខាន', 'ចាន']},
    {label:'Bottom Right (B, N, M, ,)', ids:['b','n','m','comma'], ex:['ប', 'ន', 'ម', 'អ', 'មាន', 'បាន']},
  ];
  remConsonantGroups.forEach((grp, gi)=>{
    const priorSnap = pool.slice();
    addLesson(4,'intro', `Consonants: ${grp.label}`, `${modLabel.base} · ${grp.ids.map(keyLabel).join(' ')}`,
      ()=> materialize(seqIntro(entriesFromIds(grp.ids,'base'), priorSnap, {soloReps:4, examples:grp.ex})),
      {newIds:grp.ids, newLayer:'base', examples:grp.ex});
    pool = pool.concat(entriesFromIds(grp.ids,'base'));
    const snap2 = pool.slice();
    addLesson(4,'combo', `Consonants ${gi+1} — Mixed Practice`, 'New characters mixed with everything learned',
      ()=> materialize(seqRandom(snap2, 20)), {examples:grp.ex});
  });

  /* ===== LEVEL 5 — Vowels & Signs ===== */
  const vowelGroups = [
    {label:'Vowels I & W (ិ & ឹ)', ids:['i','w'], ex:['តិច', 'ទឹក']},
    {label:'Vowels U & E (ុ & េ)', ids:['u','e'], ex:['ទុក', 'ដេក']},
    {label:'Vowels O & Brackets (ោ & ៀ / ឿ)', ids:['o','bracketL','bracketR'], ex:['គោ', 'រៀន']},
  ];
  vowelGroups.forEach((grp, gi)=>{
    let priorSnap = pool.slice();
    addLesson(5,'intro', `Vowels: ${grp.label}`, `${modLabel.base} · ${grp.ids.map(keyLabel).join(' ')}`,
      ()=> materialize(seqIntro(entriesFromIds(grp.ids,'base'), priorSnap, {soloReps:4, examples:grp.ex})),
      {newIds:grp.ids, newLayer:'base', examples:grp.ex});
    pool = pool.concat(entriesFromIds(grp.ids,'base'));

    priorSnap = pool.slice();
    const shiftEntries = entriesFromIds(grp.ids,'shift');
    if(shiftEntries.length){
      addLesson(5,'intro', `Vowels: ${grp.label} (Shift)`, `${modLabel.shift} · ${grp.ids.map(keyLabel).join(' ')}`,
        ()=> materialize(seqIntro(shiftEntries, priorSnap, {soloReps:4, examples:grp.ex})),
        {newIds:grp.ids, newLayer:'shift', examples:grp.ex});
      pool = pool.concat(shiftEntries);
    }
  });
  {
    const snap = pool.slice();
    addLesson(5,'combo','Vowels & Signs — Mixed Practice','Mixed with everything learned so far',
      ()=> materialize(seqRandom(snap, 26)), {examples:['ទឹក', 'ដេក', 'រៀន', 'មាន']});
    addLesson(5,'review','Review — Vowels & Signs','Only previously learned characters',
      ()=> materialize(seqRandom(snap, 28)), {examples:['ទឹក', 'រៀន', 'គោ']});
    addLesson(5,'test','Vowel & Sign Test','All vowels and signs learned so far',
      ()=> materialize(seqRandom(snap, 32)), {threshold:90, examples:['ទឹក', 'រៀន', 'គោ', 'ដេក']});
  }

  /* ===== LEVEL 6 — Khmer Numerals ===== */
  const numeralIds = ['k1','k2','k3','k4','k5','k6','k7','k8','k9','k0'];
  const numeralSteps = [
    {count:2, ex:['១', '២', '១២']},
    {count:4, ex:['៣', '៤', '៣៤', '១២៣']},
    {count:6, ex:['៥', '៦', '៥៦', '២០២៦']},
    {count:8, ex:['៧', '៨', '៧៨']},
    {count:10, ex:['៩', '០', '១០០', '២០២៦']},
  ];
  let taughtCount = 0;
  numeralSteps.forEach(step=>{
    const newIds = numeralIds.slice(taughtCount, step.count);
    const priorSnap = pool.slice();
    const isLast = step.count===10;
    const label = isLast ? 'All Numerals (១-០)' : `Numerals: ${step.count} Digits`;
    addLesson(6, isLast ? 'test' : 'intro', label,
      newIds.length ? `${modLabel.base} · ${newIds.map(keyLabel).join(' ')}` : 'The complete numeral set',
      ()=> materialize(seqIntro(entriesFromIds(newIds,'base'), priorSnap, {soloReps:4, mixWithPrior: taughtCount ? 6 : 0, examples:step.ex})),
      {newIds, newLayer:'base', threshold: isLast ? 90 : 85, examples:step.ex});
    pool = pool.concat(entriesFromIds(newIds,'base'));
    taughtCount = step.count;
  });

  /* ===== LEVEL 7 — Ctrl / AltGr Layers ===== */
  const ctrlIds = ['grave','k1','k2','k3','k4','k5','k7','k0','minus','semicolon','quote','backslash','m','comma','period','slash'];
  const ctrlChunks = [
    {name:'Ctrl Basics', ids:ctrlIds.slice(0,6), ex:['« »', '–']},
    {name:'Ctrl Practice', ids:ctrlIds.slice(6,11), ex:['៖', '’']},
    {name:'Ctrl Mixed Practice', ids:ctrlIds.slice(11), ex:['”', '…']},
  ];
  ctrlChunks.forEach(chunk=>{
    const priorSnap = pool.slice();
    addLesson(7,'intro', chunk.name, `${modLabel.ctrl} · ${chunk.ids.map(keyLabel).join(' ')}`,
      ()=> materialize(seqIntro(entriesFromIds(chunk.ids,'ctrl'), priorSnap, {soloReps:4, examples:chunk.ex})),
      {newIds:chunk.ids, newLayer:'ctrl', examples:chunk.ex});
    pool = pool.concat(entriesFromIds(chunk.ids,'ctrl'));
  });
  const altgrIds = ['e','r','t','u','i','o','p','a','s','j','k','l','quote','backslash'];
  const altgrChunks = [
    {name:'AltGr Basics', ids:altgrIds.slice(0,5), ex:['៛', '៚']},
    {name:'AltGr Practice', ids:altgrIds.slice(5,10), ex:['ឮ', 'ឭ']},
    {name:'AltGr Mixed Practice', ids:altgrIds.slice(10), ex:['ឰ', 'ឪ']},
  ];
  altgrChunks.forEach(chunk=>{
    const priorSnap = pool.slice();
    addLesson(7,'intro', chunk.name, `${modLabel.altgr} · ${chunk.ids.map(keyLabel).join(' ')}`,
      ()=> materialize(seqIntro(entriesFromIds(chunk.ids,'altgr'), priorSnap, {soloReps:4, examples:chunk.ex})),
      {newIds:chunk.ids, newLayer:'altgr', examples:chunk.ex});
    pool = pool.concat(entriesFromIds(chunk.ids,'altgr'));
  });
  {
    const ctrlAltgrPool = entriesFromIds(ctrlIds,'ctrl').concat(entriesFromIds(altgrIds,'altgr'));
    addLesson(7,'test','Ctrl + AltGr Review','Mixed Ctrl and AltGr characters',
      ()=> materialize(seqRandom(ctrlAltgrPool, 24)), {threshold:88, examples:['៛', '៚', 'ឮ', 'ឭ']});
  }

  /* ===== LEVEL 8 — Full Keyboard & Mastery ===== */
  {
    const fullWords = ['អាវ','តា','យាយ','មាន','ខាន','បាន','ចាន','តារា','កាច','សាលា','ទឹក','រៀន'];
    addLesson(8,'words','Word Practice','Real Khmer words, typed from memory',
      ()=> materialize(seqWords(fullWords)), {examples:fullWords.slice(0, 5)});

    const fullPool = pool.slice();
    addLesson(8,'combo','Full Keyboard — Warm-up','Random characters across the whole keyboard',
      ()=> materialize(seqRandom(fullPool, 28)), {examples:['សាលា', 'កាក់', 'ទឹក']});
    addLesson(8,'combo','Full Keyboard — Combos','Longer combinations across every layer',
      ()=> materialize(seqCombo(fullPool, 4, 8, ['សាលា', 'កាក់'])), {examples:['សាលា', 'កាក់']});

    const homeRowIds = ['f','j','d','k','g','h','s','l','a','semicolon','quote'];
    addLesson(8,'test','Home Row Test','Final test — Home Row only',
      ()=> materialize(seqRandom(entriesFromIds(homeRowIds,'base'), 26)), {threshold:92, examples:['កាក់', 'សាលា', 'ដាក់']});
    addLesson(8,'test','Home Row + Shift Test','Final test — Home Row, Base + Shift',
      ()=> materialize(seqRandom(fullPool.filter(e=> homeRowIds.includes(e.id)), 28)), {threshold:92, examples:['ធ', 'ុំ', 'ឌ', 'គ']});
    addLesson(8,'test','Khmer Character Test','Final test — all consonants & vowels',
      ()=> materialize(seqRandom(fullPool.filter(e=> e.layer==='base'||e.layer==='shift'), 32)), {threshold:90, examples:['រៀន', 'ទឹក', 'សាលា']});
    addLesson(8,'test','Khmer Numeral Test','Final test — all numerals',
      ()=> materialize(seqRandom(entriesFromIds(numeralIds,'base'), 22)), {threshold:92, examples:['១២៣', '២០២៦']});
    addLesson(8,'test','Full Keyboard Test','Final test — every layer combined',
      ()=> materialize(seqRandom(fullPool, 36)), {threshold:90, examples:['សាលា', '១២៣', '៛']});
    addLesson(8,'test','Final Khmer Typing Test','The ultimate test — words, then the full keyboard',
      ()=> materialize(seqWords(fullWords).concat(seqRandom(fullPool, 18))), {threshold:90, examples:['សាលា', 'ទឹក', 'រៀន']});
  }

  return lessons;
}

/* Home-row-only course reused for NiDA and English layouts */
function buildHomeRowCourse(table, idOffset, wordBank){
  const lessons = [];
  let nextId = idOffset + 1;
  let pool = [];

  function addLesson(level, type, title, subtitle, generateFn, opts={}){
    const id = nextId++;
    const defaultThreshold = type==='test' ? 90 : type==='review' ? 88 : 85;
    lessons.push({
      id, level, type, title, subtitle,
      layer: opts.newLayer || 'base',
      threshold: opts.threshold ?? defaultThreshold,
      newIds: opts.newIds || [],
      newLayer: opts.newLayer || 'base',
      examples: opts.examples || [],
      generate: generateFn,
    });
    return id;
  }
  const modLabel = {base:'No modifier', shift:'Hold Shift'};

  // 1. F & J
  {
    const ids = ['f', 'j'];
    const ex = entriesFromIds(ids, 'base', table).map(e=> e.ch + ' ' + e.ch);
    addLesson(1, 'intro', 'Home Row — Index Anchors (F & J)', `${modLabel.base} · ${ids.map(keyLabel).join(' ')}`,
      ()=> materialize(seqIntro(entriesFromIds(ids,'base',table), [], {soloReps:4, examples:ex, table})),
      {newIds:ids, newLayer:'base', examples:ex});
    pool = pool.concat(entriesFromIds(ids,'base',table));
  }
  // 2. D & K
  {
    const ids = ['d', 'k'];
    const ex = entriesFromIds(ids, 'base', table).map(e=> e.ch + ' ' + e.ch);
    const priorSnap = pool.slice();
    addLesson(1, 'intro', 'Home Row — Middle Fingers (D & K)', `${modLabel.base} · ${ids.map(keyLabel).join(' ')}`,
      ()=> materialize(seqIntro(entriesFromIds(ids,'base',table), priorSnap, {soloReps:4, examples:ex, table})),
      {newIds:ids, newLayer:'base', examples:ex});
    pool = pool.concat(entriesFromIds(ids,'base',table));
  }
  // 3. F, J, D, K Combos
  {
    const ids = ['f', 'j', 'd', 'k'];
    const snap = pool.slice();
    addLesson(1, 'combo', 'Home Row — 4 Keys Combined', 'Index & Middle · F J D K',
      ()=> materialize(seqCombo(snap, 2, 8)),
      {newIds:ids, newLayer:'base', examples:[]});
  }
  // 4. G & H
  {
    const ids = ['g', 'h'];
    const ex = entriesFromIds(ids, 'base', table).map(e=> e.ch + ' ' + e.ch);
    const priorSnap = pool.slice();
    addLesson(1, 'intro', 'Home Row — Index Reach (G & H)', `${modLabel.base} · ${ids.map(keyLabel).join(' ')}`,
      ()=> materialize(seqIntro(entriesFromIds(ids,'base',table), priorSnap, {soloReps:4, examples:ex, table})),
      {newIds:ids, newLayer:'base', examples:ex});
    pool = pool.concat(entriesFromIds(ids,'base',table));
  }
  // 5. S & L
  {
    const ids = ['s', 'l'];
    const ex = entriesFromIds(ids, 'base', table).map(e=> e.ch + ' ' + e.ch);
    const priorSnap = pool.slice();
    addLesson(1, 'intro', 'Home Row — Ring Fingers (S & L)', `${modLabel.base} · ${ids.map(keyLabel).join(' ')}`,
      ()=> materialize(seqIntro(entriesFromIds(ids,'base',table), priorSnap, {soloReps:4, examples:ex, table})),
      {newIds:ids, newLayer:'base', examples:ex});
    pool = pool.concat(entriesFromIds(ids,'base',table));
  }
  // 6. Pinkies A, ;, '
  {
    const ids = ['a', 'semicolon', 'quote'];
    const ex = entriesFromIds(ids, 'base', table).map(e=> e.ch + ' ' + e.ch);
    const priorSnap = pool.slice();
    addLesson(1, 'intro', 'Home Row — Pinky Fingers', `${modLabel.base} · ${ids.map(keyLabel).join(' ')}`,
      ()=> materialize(seqIntro(entriesFromIds(ids,'base',table), priorSnap, {soloReps:4, examples:ex, table})),
      {newIds:ids, newLayer:'base', examples:ex});
    pool = pool.concat(entriesFromIds(ids,'base',table));
  }

  // Level 2 Combos
  {
    const snap = pool.slice();
    addLesson(2,'combo','Two-Character Combos','Pairs drawn from the Home Row', ()=> materialize(seqCombo(snap, 2, 12)));
    addLesson(2,'combo','Three-Character Combos','Triples drawn from the Home Row', ()=> materialize(seqCombo(snap, 3, 10)));
    addLesson(2,'review','Random Home Row Drill','Fully randomized order', ()=> materialize(seqRandom(snap, 28)));
    addLesson(2,'test','Home Row Speed Test','Type as fast and accurately as you can', ()=> materialize(seqRandom(snap, 32)), {threshold:90});
  }

  // Level 3 Shift
  const shiftEntries = entriesFromIds(['f','j','d','k','g','h','s','l','a','semicolon','quote'], 'shift', table);
  if(shiftEntries.length){
    const priorSnap = pool.slice();
    addLesson(3, 'intro', 'Home Row Shift', 'Hold Shift · Home row keys',
      ()=> materialize(seqIntro(shiftEntries, priorSnap, {soloReps:4, table})),
      {newIds:shiftEntries.map(e=>e.id), newLayer:'shift'});
    pool = pool.concat(shiftEntries);
    const snap = pool.slice();
    addLesson(3,'test','Home Row + Shift Test','Accuracy test across Base and Shift', ()=> materialize(seqRandom(snap, 30)), {threshold:90});
  }

  // Words
  if(wordBank && wordBank.length){
    addLesson(9,'words','Word Practice','Real words, typed from memory', ()=> materialize(seqWords(wordBank, table)), {examples:wordBank.slice(0,4)});
  }

  return lessons;
}

/* Complete, pedagogical 4-level Khmer NiDA typing course */
function buildNidaCourse(){
  const lessons = [];
  let nextId = 10001;
  const table = KEY_BY_ID_NIDA;

  function addLesson(level, type, title, subtitle, generateFn, opts={}){
    const id = nextId++;
    const defaultThreshold = type==='test' ? 90 : type==='review' ? 88 : 85;
    lessons.push({
      id, level, type, title, subtitle,
      layer: opts.newLayer || 'base',
      threshold: opts.threshold ?? defaultThreshold,
      newIds: opts.newIds || [],
      newLayer: opts.newLayer || 'base',
      examples: opts.examples || [],
      generate: generateFn,
    });
    return id;
  }

  /* ===== LEVEL 1: Beginner — Foundation & Home Row ===== */

  // Lesson 10001 (Level 1, intro): Home Row Consonant Anchors
  {
    const ids = ['k', 'd', 'f', 'g', 'h', 'l', 's'];
    const ex = ['កក', 'គក', 'ដក', 'ថក', 'ធរ', 'សស', 'ហល', 'អក'];
    addLesson(1, 'intro', 'Home Row — Consonant Anchors', 'K, D, F, H, L, S, G & Shift Consonants',
      () => materialize(seqWords(ex, table)),
      { newIds: ids, newLayer: 'base', examples: ex });
  }

  // Lesson 10002 (Level 1, intro): Home Row Vowels & Syllables
  {
    const ids = ['a', 'semicolon', 'quote', 'h'];
    const ex = ['កា', 'គា', 'ដា', 'ថាំ', 'សៃ', 'ដើ', 'គោះ', 'ដាក់', 'កាក់', 'សះ'];
    addLesson(1, 'intro', 'Home Row — Vowels & Syllables', 'ា, ាំ, ៃ, ើ, ោះ, ់, ះ',
      () => materialize(seqWords(ex, table)),
      { newIds: ids, newLayer: 'base', examples: ex });
  }

  // Lesson 10003 (Level 1, intro): Top Row Consonants & Core Vowels
  {
    const ids = ['t', 'r', 'y', 'u', 'i', 'o', 'e', 'w', 'q', 'p'];
    const ex = ['ទៅ', 'មក', 'រត់', 'យូរ', 'ទិញ', 'ពីរ', 'ដេក', 'ដែក', 'កូន', 'ដើរ', 'ឆាប់', 'ភ្នំ'];
    addLesson(1, 'intro', 'Top Row — Consonants & Core Vowels', 'T, R, Y, U, I, O, E, W, Q, P & Vowels',
      () => materialize(seqWords(ex, table)),
      { newIds: ids, newLayer: 'base', examples: ex });
  }

  // Lesson 10004 (Level 1, review): Bottom Row Consonants & Nasals
  {
    const ids = ['z', 'x', 'c', 'v', 'b', 'n', 'm'];
    const ex = ['បង', 'ពូ', 'ជន', 'ចៅ', 'ខំ', 'វា', 'ចេក', 'ពាន', 'មាត់', 'ចំណី', 'ពិភព'];
    addLesson(1, 'review', 'Bottom Row — Consonants & Nasals', 'Z, X, C, V, B, N, M & Syllable Review',
      () => materialize(seqWords(ex, table)),
      { newIds: ids, newLayer: 'base', examples: ex });
  }

  /* ===== LEVEL 2: Intermediate — Subscripts & Coeng J System ===== */

  // Lesson 10005 (Level 2, intro): Subscripts — Coeng Key (J = ្)
  {
    const ids = ['j'];
    const ex = ['ត្រី', 'ក្រៅ', 'ខ្លា', 'ឆ្កែ', 'ផ្លូវ', 'ម្ហូប', 'ស្ងួត', 'ក្បាល'];
    addLesson(2, 'intro', 'Subscripts — Coeng Key (J = ្)', 'Base Consonant + J (្) + Subscript',
      () => materialize(seqWords(ex, table)),
      { newIds: ids, newLayer: 'base', examples: ex });
  }

  // Lesson 10006 (Level 2, combo): Subscripts — Shifted Consonants
  {
    const ids = ['j', 'k', 'x', 'c', 't', 'f', 'p', 'g'];
    const ex = ['ស្គាល់', 'ស្អាត', 'កម្ពុជា', 'បញ្ជី', 'សង្ឃ', 'សម្បត្តិ', 'បន្ទប់'];
    addLesson(2, 'combo', 'Subscripts — Shifted Consonants', 'J followed by Shifted Consonants (្គ, ្ឃ, ្ជ, ្ទ, ្ធ, ្ភ, ្អ)',
      () => materialize(seqWords(ex, table)),
      { newIds: ids, newLayer: 'shift', examples: ex });
  }

  // Lesson 10007 (Level 2, words): Subscripts — Complex Vowels
  {
    const ids = ['bracketL', 'y', 'v', 'o'];
    const ex = ['ត្រៀម', 'ខ្មៅ', 'ឆ្លើយ', 'ភ្លើង', 'ជ្រៅ', 'ក្មេង', 'ស្លៀក', 'ព្រៃ', 'ជ្រឿន', 'ព្រួយ'];
    addLesson(2, 'words', 'Subscripts — Complex Vowels', 'Sequential Typing: Consonant + Coeng + Vowel',
      () => materialize(seqWords(ex, table)),
      { newIds: ids, newLayer: 'base', examples: ex });
  }

  // Lesson 10008 (Level 2, test): Advanced Subscript Clusters
  {
    const ex = ['សង្គ្រាម', 'កន្ត្រៃ', 'អន្តរជាតិ', 'មន្ត្រី', 'សាស្ត្រា', 'កណ្តុរ', 'សម្ព័ន្ធ'];
    addLesson(2, 'test', 'Advanced Subscript Clusters', 'Multi-Tier Clusters & Compound Orthography',
      () => materialize(seqWords(ex, table)),
      { examples: ex, threshold: 90 });
  }

  /* ===== LEVEL 3: Advanced — Independent Vowels & Diacritics ===== */

  // Lesson 10009 (Level 3, intro): Independent Vowels (ស្រៈពេញតួ)
  {
    const ids = ['minus', 'equal', 'bracketR', 'backslash'];
    const ex = ['ឥឡូវ', 'ឪពុក', 'ឲ្យ', 'ឧត្តម', 'ឱកាស', 'ឯកសារ', 'ឬស្សី', 'ឮសូរ'];
    addLesson(3, 'intro', 'Independent Vowels (ស្រៈពេញតួ)', 'ឥ, ឲ, ឪ, ឧ, ឯ, ឱ, ឦ, ឫ, ឬ, ឮ, ឭ',
      () => materialize(seqWords(ex, table)),
      { newIds: ids, newLayer: 'base', examples: ex });
  }

  // Lesson 10010 (Level 3, intro): Consonant Shifters (មូសិកទន្ត & ត្រីស័ព្ទ)
  {
    const ids = ['quote', 'slash'];
    const ex = ['ប៉ា', 'ម៉ាក់', 'ស៊ុប', 'ហ៊ាន', 'ប៉ះ', 'ម៉ោង', 'ស៊ី', 'ហ៊ីង'];
    addLesson(3, 'intro', 'Consonant Shifters & Registers', 'Muusikatoan (Shift+\') & Triisap (/)',
      () => materialize(seqWords(ex, table)),
      { newIds: ids, newLayer: 'shift', examples: ex });
  }

  // Lesson 10011 (Level 3, combo): Diacritical Marks & Tone Signs
  {
    const ids = ['k6', 'k7', 'k8', 'minus', 'quote'];
    const ex = ['ទូរស័ព្ទ', 'អាទិត្យ', 'ដ៏ល្អ', 'ព័ត៌មាន', 'សព្វថ្ងៃ', 'ប្រយ័ត្ន'];
    addLesson(3, 'combo', 'Diacritical Marks & Tone Signs', 'Tandakhât (៍), Samiyok Sanna (័), Asda (៏), Robat (៌)',
      () => materialize(seqWords(ex, table)),
      { newIds: ids, newLayer: 'shift', examples: ex });
  }

  // Lesson 10012 (Level 3, test): Advanced Vocabulary & Diacritic Mastery
  {
    const ex = ['ឯកឧត្តម', 'ព័ត៌មានវិទ្យា', 'ទូរស័ព្ទដៃ', 'ថ្ងៃអាទិត្យ', 'ស៊ុបមាន់', 'ប៉ះពាល់', 'ប្រយ័ត្នប្រយែង'];
    addLesson(3, 'test', 'Advanced Vocabulary & Diacritic Mastery', 'Integrating Shifters, Signs & Independent Vowels',
      () => materialize(seqWords(ex, table)),
      { examples: ex, threshold: 90 });
  }

  /* ===== LEVEL 4: Master — Numerals, Punctuation & Fluency ===== */

  // Lesson 10013 (Level 4, intro): Khmer Numerals & Symbols
  {
    const ids = ['k1', 'k2', 'k3', 'k4', 'k5', 'k6', 'k7', 'k8', 'k9', 'k0'];
    const ex = ['១២៣៤៥', '៦៧៨៩០', '៥០០០៛', '២៥០០០៛', 'ផ្សេងៗ', 'ញឹកៗ', 'តិចៗ', '២០២៦'];
    addLesson(4, 'intro', 'Khmer Numerals & Symbols', '១ ២ ៣ ៤ ៥ ៦ ៧ ៨ ៩ ០ & ៛, ៗ',
      () => materialize(seqWords(ex, table)),
      { newIds: ids, newLayer: 'base', examples: ex });
  }

  // Lesson 10014 (Level 4, combo): Khmer Punctuation & Quotations
  {
    const ids = ['period', 'grave', 'semicolon'];
    const ex = ['«ចំណេះវិជ្ជាជាទ្រព្យ»។', 'សួស្តី! តើសុខសប្បាយទេ?', 'ភ្នំពេញ៖ រាជធានីនៃកម្ពុជា។'];
    addLesson(4, 'combo', 'Khmer Punctuation & Quotations', 'Khan (.), Bariyoosan (Shift+.), Quotes (« »), Colon (៖)',
      () => materialize(seqWords(ex, table)),
      { newIds: ids, newLayer: 'base', examples: ex });
  }

  // Lesson 10015 (Level 4, words): Fluent Practical Sentences
  {
    const ex = [
      'ខ្ញុំរៀនវាយអក្សរខ្មែរលើកុំព្យូទ័រ។',
      'ភាសាខ្មែរមានអក្សរស្រស់ស្អាតណាស់។',
      'សាលារៀននៅជិតផ្ទះរបស់ខ្ញុំ។',
      'យើងទាំងអស់គ្នាស្រឡាញ់ប្រទេសកម្ពុជា។'
    ];
    addLesson(4, 'words', 'Fluent Practical Sentences', 'Everyday Khmer Prose & Proper Spacing',
      () => materialize(seqWords(ex, table)),
      { examples: ex });
  }

  // Lesson 10016 (Level 4, test): Comprehensive Khmer NiDA Speed & Mastery Test
  {
    const ex = [
      'ភាសាខ្មែរជាភាសាផ្លូវការនៃព្រះរាជាណាចក្រកម្ពុជា។',
      'ការហ្វឹកហាត់វាយអក្សរលើក្តារចុចនីដាជួយឱ្យយើងវាយបានរហ័សនិងត្រឹមត្រូវ។',
      'ចូរអង្គុយឱ្យត្រង់ខ្លួន ហើយដាក់ម្រាមដៃលើជួរដេកដើមជានិច្ច។'
    ];
    addLesson(4, 'test', 'Comprehensive Khmer NiDA Mastery Test', 'Full Keyboard Navigation, Accuracy & Speed',
      () => materialize(seqWords(ex, table)),
      { examples: ex, threshold: 92 });
  }

  return lessons;
}

const LESSONS_STANDARD = buildCourse();
const LESSONS_NIDA = buildNidaCourse();
const LESSONS_ENGLISH = buildHomeRowCourse(KEY_BY_ID_EN, 20000, WORD_BANK_EN);
window.LESSON_SETS = LESSON_SETS = { standard: LESSONS_STANDARD, nida: LESSONS_NIDA, english: LESSONS_ENGLISH };
window.LESSONS = LESSONS = LESSON_SETS[currentLayoutId] || LESSONS_STANDARD;
/* Total lesson count across every layout's course — used for stats
   like "Lessons Crafted" that should reflect everything on the site,
   not just whichever layout happens to be selected right now. */
window.TOTAL_LESSONS_ALL_LAYOUTS = TOTAL_LESSONS_ALL_LAYOUTS = LESSONS_STANDARD.length + LESSONS_NIDA.length + LESSONS_ENGLISH.length;


let lessonActive = false;
let currentLesson = null;
let lessonChars = [];
let lessonLayers = [];
let lessonKeyIds = [];
let lessonIndex = 0;
let lessonMistakes = 0;
let lessonMistakeChars = {};   // ch -> count of mistakes this attempt, for adaptive drilling + Review Mistakes
let lessonStartTime = 0;
let lessonExtendedOnce = false; // adaptive: only auto-extend a lesson once per attempt
let remedialActive = false;    // true while running an ad-hoc "Review Mistakes" drill

const lessonStrip = document.getElementById('lessonStrip');
const lessonPanel = document.getElementById('lessonPanel');
const lessonUnavailableNote = document.getElementById('lessonUnavailableNote');
const lessonTitleEl = document.getElementById('lessonTitle');
const lessonMetaBadgeEl = document.getElementById('lessonMetaBadge');
const lessonMetaBestEl = document.getElementById('lessonMetaBest');
const lessonNewKeysEl = document.getElementById('lessonNewKeys');
const lessonProgressValEl = document.getElementById('lessonProgressVal');
const lessonTotalValEl = document.getElementById('lessonTotalVal');
const lessonProgressFillEl = document.getElementById('lessonProgressFill');
const lessonCharRowEl = document.getElementById('lessonCharRow');
const lessonAccValEl = document.getElementById('lessonAccVal');
const lessonMistakesValEl = document.getElementById('lessonMistakesVal');
const lessonExitBtn = document.getElementById('lessonExitBtn');

function lessonBestKey(id){ return 'khmerLessonBest_' + id; }

function getLessonBest(id){
  try{ return JSON.parse(localStorage.getItem(lessonBestKey(id)) || 'null'); }
  catch(e){ return null; }
}

let allLessonsUnlocked = false;
try{ allLessonsUnlocked = localStorage.getItem('khmerUnlockAll') === '1'; }catch(e){}

function isLessonLocked(id){
  if(allLessonsUnlocked) return false;
  if(LESSONS.length && LESSONS[0].id === id) return false;
  const prevBest = getLessonBest(id-1);
  return !prevBest; // any completed attempt on the previous lesson unlocks the next one
}

function toggleAllLessonsUnlocked(){
  allLessonsUnlocked = !allLessonsUnlocked;
  try{ localStorage.setItem('khmerUnlockAll', allLessonsUnlocked ? '1' : '0'); }catch(e){}
  renderLessonStrip();
  if(allLessonsUnlocked){
    const logoEl = document.getElementById('siteLogo');
    const rect = logoEl ? logoEl.getBoundingClientRect() : (boardWrap || document.body).getBoundingClientRect();
    if(typeof confettiBurst === 'function'){
      confettiBurst(rect.left + rect.width/2, rect.top + rect.height/2, 42);
    }
    if(typeof playChime === 'function') playChime();
    showToast(pkIcon('unlock', 20), 'Master Unlock', 'All 60 lessons unlocked!');
  } else {
    showToast(pkIcon('lock', 20), 'Progress Locked', 'Normal lesson progression restored');
  }
}

(function setupHiddenUnlock(){
  let logoTaps = 0;
  let logoTimer = null;
  const logoEl = document.getElementById('siteLogo') || document.querySelector('.site-crest-icon');
  if(logoEl){
    logoEl.addEventListener('click', ()=>{
      logoTaps++;
      clearTimeout(logoTimer);
      if(logoTaps >= 5){
        logoTaps = 0;
        toggleAllLessonsUnlocked();
      } else {
        logoTimer = setTimeout(()=>{ logoTaps = 0; }, 2500);
      }
    });
  }

  // Secret code: typing "pkunlock" on physical keyboard anywhere
  let codeBuffer = '';
  const SECRET = 'pkunlock';
  window.addEventListener('keydown', (e)=>{
    const t = e.target;
    if(t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    if(!e.key || e.key.length !== 1) return;
    codeBuffer = (codeBuffer + e.key.toLowerCase()).slice(-SECRET.length);
    if(codeBuffer === SECRET){
      codeBuffer = '';
      toggleAllLessonsUnlocked();
    }
  });
})();

/* Build the lesson-strip cards fresh from LESSONS + localStorage progress.
   Called on load and after every completed lesson. Levels are collapsible
   accordion sections so the whole list isn't overwhelming at once. */
// collapsedLevels defined at top of module // Set of level ids currently collapsed; null = not yet initialized
function defaultCollapsedLevels(){
  // Collapse all levels by default so user can just see all the levels at a glance (not too big)
  return new Set(LEVELS.map(l => l.id));
}

function autoAdvanceLevelAccordion(completedDef){
  if(!completedDef) return;
  if(!collapsedLevels) collapsedLevels = defaultCollapsedLevels();
  const currentLv = completedDef.level;
  const levelLessons = LESSONS.filter(l => l.level === currentLv);
  const allFinished = levelLessons.length > 0 && levelLessons.every(l => !!getLessonBest(l.id));
  if(allFinished){
    // Current level is completed! Collapse current level and open the next level!
    const nextLv = currentLv + 1;
    if(LEVELS.some(l => l.id === nextLv)){
      collapsedLevels.add(currentLv);    // Close completed level (e.g. Level 1)
      collapsedLevels.delete(nextLv);    // Open next level (e.g. Level 2)
    }
  } else {
    // Current level still has lessons, keep it open
    collapsedLevels.delete(currentLv);
  }
}
let isStripExpanded = false; // Starts in compact 1-column view ("not too big, just can see the level")

function renderLessonStrip(){
  if(!lessonStrip) return;
  try {
    if(!Array.isArray(LESSONS) || LESSONS.length === 0){
      if(typeof LESSONS_STANDARD !== 'undefined' && Array.isArray(LESSONS_STANDARD) && LESSONS_STANDARD.length){
        LESSONS = LESSONS_STANDARD;
      }
    }
    if(!collapsedLevels) collapsedLevels = defaultCollapsedLevels();
    lessonStrip.innerHTML = '';

    lessonStrip.classList.remove('minimized');
    lessonStrip.classList.toggle('expanded', isStripExpanded);

    let masteredCount = 0;
    LESSONS.forEach(l => { const b = getLessonBest(l.id); if(b && b.mastered) masteredCount++; });

    const topBar = document.createElement('div');
    topBar.className = 'lesson-strip-header';
    topBar.innerHTML = `
      <span class="lsh-title">${pkIcon('book', 15)} LESSONS</span>
      <div class="lsh-actions">
        <span class="lsh-badge">${masteredCount}/${LESSONS.length} Mastered</span>
        <button type="button" class="lsh-expand-btn" id="lshExpandBtn" title="${isStripExpanded ? 'Compact sidebar (1 column)' : 'Expand sidebar (2 columns)'}" aria-label="Toggle sidebar width">
          ${pkIcon(isStripExpanded ? 'collapse' : 'expand', 12)}
        </button>
      </div>
    `;
    lessonStrip.appendChild(topBar);

    let lastLevel = null;
    let listEl = null;
    LESSONS.forEach((def, idx)=>{
      if(def.level !== lastLevel){
        const lv = LEVELS.find(l=>l.id===def.level);
        const collapsed = collapsedLevels.has(def.level);
        const header = document.createElement('div');
        header.className = 'lesson-level-header' + (collapsed ? ' collapsed' : '');
        header.dataset.level = def.level;
        header.innerHTML = `<span class="llh-chevron">${pkIcon(collapsed ? 'arrow-right' : 'arrow-down', 11)}</span><span>${lv ? lv.title : `Level ${def.level}`}</span>`;
        lessonStrip.appendChild(header);
        listEl = document.createElement('div');
        listEl.className = 'lesson-level-list' + (collapsed ? ' collapsed' : '');
        lessonStrip.appendChild(listEl);
        lastLevel = def.level;
      }
      const card = document.createElement('div');
      const locked = isLessonLocked(def.id);
      card.className = 'lesson-card' + (locked ? ' locked' : '') + (currentLesson && currentLesson.id===def.id ? ' active' : '');
      card.dataset.lesson = def.id;

      const examplesHtml = def.examples && def.examples.length
        ? `<div class="lesson-card-examples"><span class="lce-lbl">Ex:</span> ${def.examples.slice(0, 3).map(ex=>`<span class="lce-chip">${ex}</span>`).join(' ')}</div>`
        : '';

      const best = getLessonBest(def.id);
      const statusHtml = best
        ? `<span class="lesson-card-best ${best.mastered?'mastered':''}">${best.mastered ? pkIcon('star', 12) + ' ' : ''}${best.accuracy}%</span>`
        : locked ? `<span class="lesson-card-lock">${pkIcon('lock', 12)}</span>` : '';

      card.innerHTML = `
        <div class="lesson-card-num">${String(idx+1).padStart(2,'0')}</div>
        <div class="lesson-card-info">
          <div class="lesson-card-head">
            <span class="lesson-card-title">${def.title}</span>
            <span class="lesson-card-type type-${def.type}">${def.type}</span>
            ${statusHtml}
          </div>
          <div class="lesson-card-sub">${def.subtitle}</div>
          ${examplesHtml}
        </div>
      `;
      listEl.appendChild(card);
    });
    if(typeof updateMasteryStat === 'function') updateMasteryStat();
  } catch(err){
    console.error('renderLessonStrip error:', err);
  }
}

/* Toggle a level section open/closed, toggle 1-col/2-col expand, or start lesson */
lessonStrip.addEventListener('click', (e)=>{
  e.stopPropagation();

  // If clicked expand/compact toggle button
  const expandBtn = e.target.closest('#lshExpandBtn');
  if(expandBtn){
    isStripExpanded = !isStripExpanded;
    // If expanding to 2 columns and all levels are collapsed, open the first level
    if(isStripExpanded && collapsedLevels.size === LEVELS.length){
      collapsedLevels.delete(LEVELS[0].id);
    }
    renderLessonStrip();
    return;
  }

  // If clicked level accordion header
  const header = e.target.closest('.lesson-level-header');
  if(header){
    const level = parseInt(header.dataset.level, 10);
    if(collapsedLevels.has(level)) collapsedLevels.delete(level);
    else collapsedLevels.add(level);
    renderLessonStrip();
    return;
  }

  // If clicked lesson card
  const card = e.target.closest('.lesson-card');
  if(!card) return;
  const id = parseInt(card.dataset.lesson, 10);
  if(isLessonLocked(id)) return;
  if(lessonActive && currentLesson && currentLesson.id === id) return;

  startLesson(id);
});

function renderLessonMeta(def){
  lessonMetaBadgeEl.textContent = `Level ${def.level} · ${def.type.toUpperCase()}`;
  lessonMetaBadgeEl.className = 'lesson-meta-badge' + (def.type==='review' || def.type==='test' || def.type==='words' ? ' badge-'+def.type : '');
  const best = getLessonBest(def.id);
  lessonMetaBestEl.textContent = best ? `Best ${best.accuracy}% in ${best.time.toFixed(1)}s · Attempts ${best.attempts||1}` : 'Not attempted yet';

  if(def.newIds && def.newIds.length){
    lessonNewKeysEl.hidden = false;
    lessonNewKeysEl.innerHTML = '<span class="lesson-newkeys-label">Target Keys</span>' + def.newIds.map(id=>{
      const ch = charFor(id, def.newLayer) || '·';
      return `<span class="lesson-newkey-chip"><span class="nk-char">${ch}</span><span class="nk-sub">${keyLabel(id)} · ${fingerLabel(id)}</span></span>`;
    }).join('');
  } else {
    lessonNewKeysEl.hidden = true;
    lessonNewKeysEl.innerHTML = '';
  }

  let exEl = document.getElementById('lessonExamplesBanner');
  if(!exEl){
    exEl = document.createElement('div');
    exEl.id = 'lessonExamplesBanner';
    exEl.className = 'lesson-examples-banner';
    lessonNewKeysEl.parentNode.insertBefore(exEl, lessonNewKeysEl.nextSibling);
  }
  if(def.examples && def.examples.length){
    exEl.hidden = false;
    exEl.innerHTML = '<span class="leb-label">Lesson Examples:</span>' + def.examples.map(ex=> `<span class="leb-chip">${ex}</span>`).join('');
  } else {
    exEl.hidden = true;
  }
}

function renderLessonChars(){
  lessonCharRowEl.innerHTML = '';
  const start = Math.max(0, lessonIndex - 3);
  const end = Math.min(lessonChars.length, start + 12);
  for(let i=start;i<end;i++){
    const s = document.createElement('span');
    const ch = lessonChars[i];
    s.className = 'lc-char' + (i < lessonIndex ? ' done' : (i === lessonIndex ? ' current' : '')) + (ch === ' ' ? ' lc-space' : '');
    s.textContent = ch === ' ' ? '␣' : ch;
    lessonCharRowEl.appendChild(s);
  }
  updateLessonKeyHighlight();
}

let highlightedKeyId = null;
let highlightedModifierKeyId = null;
function updateLessonKeyHighlight(){
  if(highlightedKeyId && keyEls[highlightedKeyId]){
    keyEls[highlightedKeyId].classList.remove('lesson-target');
  }
  if(highlightedModifierKeyId && keyEls[highlightedModifierKeyId]){
    keyEls[highlightedModifierKeyId].classList.remove('modifier-target');
  }
  highlightedKeyId = null;
  highlightedModifierKeyId = null;

  if(!lessonActive || !currentLesson){ setActiveFinger(null); return; }
  if(lessonIndex >= lessonChars.length){ setActiveFinger(null); return; }
  const id = lessonKeyIds[lessonIndex];
  const layer = lessonLayers[lessonIndex] || currentLesson.layer || 'base';
  if(id && keyEls[id]){
    highlightedKeyId = id;
    keyEls[id].classList.add('lesson-target');
  }
  if(typeof modifierInfoFor === 'function'){
    const mod = modifierInfoFor(id, layer);
    if(mod && mod.targetKey && keyEls[mod.targetKey]){
      highlightedModifierKeyId = mod.targetKey;
      keyEls[mod.targetKey].classList.add('modifier-target');
    }
  }
  setActiveFinger(id, layer);
}

function updateLessonProgress(){
  lessonProgressValEl.textContent = lessonIndex;
  lessonTotalValEl.textContent = lessonChars.length;
  lessonProgressFillEl.style.width = (lessonIndex/lessonChars.length*100) + '%';
  const attempts = lessonIndex + lessonMistakes;
  const accuracy = attempts > 0 ? Math.round((lessonIndex/attempts)*100) : 100;
  lessonAccValEl.textContent = accuracy + '%';
  lessonMistakesValEl.textContent = lessonMistakes;
}

/* Accepts either a lesson id from LESSONS, or a transient ad-hoc lesson
   definition object (used by "Review Mistakes" — never saved to the
   course list or to localStorage). */
function startLesson(idOrDef){
  if(trialActive) stopTrial();
  if(typeof raceMode !== 'undefined' && raceMode) exitRaceMode();
  const def = (typeof idOrDef === 'object') ? idOrDef : LESSONS.find(l=>l.id===idOrDef);
  if(!def) return;
  if(typeof idOrDef !== 'object' && isLessonLocked(def.id)) return;

  currentLesson = def;
  remedialActive = !!def.isRemedial;
  if(collapsedLevels && def.level){
    collapsedLevels.delete(def.level); // Keep the active lesson's level open
  }
  const gen = def.generate();
  lessonChars = gen.chars;
  lessonLayers = gen.layers;
  lessonKeyIds = gen.keyIds;
  lessonIndex = 0;
  lessonMistakes = 0;
  lessonMistakeChars = {};
  lessonExtendedOnce = false;
  lessonStartTime = Date.now();
  lessonActive = true;

  lockedLayer = null;
  hoverLayer = null;
  render();

  lessonTitleEl.textContent = def.title;
  renderLessonMeta(def);
  lessonPanel.hidden = false;
  manuscriptEl.hidden = true;
  if(lessonStrip) lessonStrip.hidden = true;
  clearText();
  renderLessonChars();
  updateLessonProgress();

  requestAnimationFrame(()=>{
    if(lessonPanel && !lessonPanel.hidden && boardWrap){
      const panelRect = lessonPanel.getBoundingClientRect();
      const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;
      const targetY = currentScrollY + panelRect.top - 65;
      window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
    } else if(lessonPanel && !lessonPanel.hidden){
      const rect = lessonPanel.getBoundingClientRect();
      const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;
      const targetY = currentScrollY + rect.top - 65;
      window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
    } else if(boardWrap){
      boardWrap.scrollIntoView({ behavior:'smooth', block:'center' });
    }
  });
}

function exitLesson(){
  lessonActive = false;
  currentLesson = null;
  remedialActive = false;
  lessonPanel.hidden = true;
  manuscriptEl.hidden = false;
  if(lessonStrip) lessonStrip.hidden = false;
  lockedLayer = null;
  render();
  if(highlightedKeyId && keyEls[highlightedKeyId]){
    keyEls[highlightedKeyId].classList.remove('lesson-target');
  }
  highlightedKeyId = null;
  if(highlightedModifierKeyId && keyEls[highlightedModifierKeyId]){
    keyEls[highlightedModifierKeyId].classList.remove('modifier-target');
  }
  highlightedModifierKeyId = null;
  renderLessonStrip();
  requestAnimationFrame(()=>{
    if(boardWrap){
      boardWrap.scrollIntoView({ behavior:'smooth', block:'center' });
    }
  });
}
lessonExitBtn.addEventListener('click', exitLesson);

/* Adaptive difficulty: mistake tracking without jarring mid-lesson duplicate spam.
   Mistakes are tracked in lessonMistakeChars and fed directly into the dedicated,
   context-aware "Review Mistakes" drill upon lesson completion. */
function adaptiveReinforce(ch){
  // Deliberately no mid-stream duplicate injections to prevent repetitive letter stutter.
}
/* Adaptive difficulty, the other direction: a learner cruising through a
   combo/test lesson with zero mistakes gets a longer session, gradually,
   instead of a fixed length. */
function adaptiveExtend(){
  if(lessonExtendedOnce) return;
  if(currentLesson.type !== 'combo' && currentLesson.type !== 'test') return;
  if(lessonMistakes > 0) return;
  const halfway = Math.floor(lessonChars.length * 0.6);
  if(lessonIndex !== halfway) return;
  lessonExtendedOnce = true;
  const pool = lessonKeyIds.map((id,i)=> ({id, layer:lessonLayers[i], ch:lessonChars[i]}));
  for(let i=0;i<6;i++){
    const e = pickRandom(pool);
    lessonChars.push(e.ch);
    lessonLayers.push(e.layer);
    lessonKeyIds.push(e.id);
  }
}

function lessonHandleChar(val, el){
  if(!lessonActive || !val) return;
  if(lessonIndex >= lessonChars.length) return;
  const expected = lessonChars[lessonIndex];
  if(!expected) return;
  if(val === expected){
    insertText(val);
    recordKeystroke(true);
    lessonIndex++;
    if(el){ el.classList.add('correct'); setTimeout(()=> el.classList.remove('correct'), 260); }
    emberBurst(el, null, 5, null);
    runeRing(el);
    adaptiveExtend();
    if(lessonIndex >= lessonChars.length){
      completeLesson();
    } else {
      renderLessonChars();
      updateLessonProgress();
    }
  } else {
    lessonMistakes++;
    lessonMistakeChars[expected] = (lessonMistakeChars[expected]||0) + 1;
    recordKeystroke(false);
    adaptiveReinforce(expected);
    updateLessonProgress();
    if(el){ el.classList.add('wrong'); setTimeout(()=> el.classList.remove('wrong'), 300); }
    const cur = lessonCharRowEl.querySelector('.lc-char.current');
    if(cur){ cur.classList.add('shake'); setTimeout(()=> cur.classList.remove('shake'), 300); }
  }
}

function completeLesson(){
  const elapsed = (Date.now() - lessonStartTime) / 1000;
  const attempts = lessonChars.length + lessonMistakes;
  const accuracy = Math.round((lessonChars.length/attempts)*100);
  const def = currentLesson;
  const id = def.id;
  const mistakeChars = Object.keys(lessonMistakeChars);

  let isNewBest = false;
  let bestRecord = null;
  if(!remedialActive){
    const prevBest = getLessonBest(id);
    const mastered = accuracy >= (def.threshold || 85);
    bestRecord = {
      accuracy: prevBest ? Math.max(prevBest.accuracy, accuracy) : accuracy,
      time: (!prevBest || accuracy >= prevBest.accuracy) ? elapsed : prevBest.time,
      attempts: (prevBest ? prevBest.attempts : 0) + 1,
      mastered: (prevBest && prevBest.mastered) || mastered,
    };
    isNewBest = !prevBest || accuracy > prevBest.accuracy || (accuracy === prevBest.accuracy && elapsed < prevBest.time);
    try{ localStorage.setItem(lessonBestKey(id), JSON.stringify(bestRecord)); }catch(e){}
  }

  // Update persistent lesson WPM upon completion
  const lessonWpm = elapsed > 0 ? Math.min(180, Math.round((lessonChars.length / 5) / (elapsed / 60))) : 0;
  if(lessonWpm > 0 && typeof savedLessonStats !== 'undefined'){
    savedLessonStats.wpm = lessonWpm;
    if(lessonWpm > (savedLessonStats.bestWpm || 0)){
      savedLessonStats.bestWpm = lessonWpm;
    }
    if(typeof saveLessonStats === 'function') saveLessonStats();
    if(typeof updateLessonStatsUI === 'function') updateLessonStatsUI();
  }

  /* Clean completion without particle burst spam */
  const rect = (boardWrap || document.body).getBoundingClientRect();
  playChime();
  confettiBurst(rect.left + rect.width/2, rect.top + rect.height*0.3, accuracy === 100 ? 34 : 22);

  lessonActive = false;
  lessonPanel.hidden = true;
  manuscriptEl.hidden = false;
  lockedLayer = null;
  render();
  if(highlightedKeyId && keyEls[highlightedKeyId]){
    keyEls[highlightedKeyId].classList.remove('lesson-target');
  }
  highlightedKeyId = null;
  if(highlightedModifierKeyId && keyEls[highlightedModifierKeyId]){
    keyEls[highlightedModifierKeyId].classList.remove('modifier-target');
  }
  highlightedModifierKeyId = null;
  if(!remedialActive){
    autoAdvanceLevelAccordion(def);
    renderLessonStrip();
    if(accuracy === 100) achievementOnce('perfect-'+id, pkIcon('diamond', 20), 'Flawless!', def.title + ' with 100% accuracy');
  }

  showLessonComplete(def, accuracy, elapsed, isNewBest, mistakeChars);
}

function showLessonComplete(def, accuracy, elapsed, isNewBest, mistakeChars){
  const overlay = document.createElement('div');
  overlay.className = 'lesson-complete-overlay';

  const nextLesson = !remedialActive ? LESSONS.find(l=>l.id === def.id+1) : null;
  const prevLesson = !remedialActive ? LESSONS.find(l=>l.id === def.id-1) : null;
  const timeStr = elapsed.toFixed(1) + 's';
  const threshold = def.threshold || 85;
  const failed = accuracy < threshold;
  const heading = remedialActive ? 'Mistake Drill Complete'
    : failed ? 'Keep Practicing'
    : (isNewBest ? 'New Best!' : 'Lesson Complete');
  const badgeIcon = remedialActive ? pkIcon('target', 32)
    : failed ? pkIcon('reset', 32)
    : accuracy === 100 ? pkIcon('diamond', 32)
    : isNewBest ? pkIcon('zap', 32)
    : pkIcon('star', 32);

  overlay.innerHTML = `
    <div class="lesson-complete-card">
      <div class="lc-badge-halo"><div class="lc-badge">${badgeIcon}</div></div>
      <h2>${heading}</h2>
      <p>${def.title}</p>
      <div class="lc-divider"><span>◆</span></div>
      <div class="lc-stat-row">
        <div class="lc-ring-wrap">
          <div class="lc-ring" style="--pct:0"><b>0%</b></div>
          <span class="lc-ring-label">Accuracy</span>
        </div>
        <div class="lc-stat"><b class="lc-time">0.0s</b><span>Time</span></div>
      </div>
      ${(mistakeChars && mistakeChars.length && !remedialActive) ? `
      <div class="lc-mistakes-preview">
        <span class="lc-mistakes-title">Keys To Practice</span>
        <div class="lc-mistake-chips">
          ${mistakeChars.map(ch => {
            const count = lessonMistakeChars[ch] || 1;
            return `<span class="lc-mistake-chip"><b>${ch}</b><small>${count}×</small></span>`;
          }).join('')}
        </div>
      </div>` : ''}
      <div class="lesson-complete-actions">
        ${(mistakeChars && mistakeChars.length && !remedialActive) ? '<button class="lc-mistakes primary">⟲ Review Mistakes</button>' : ''}
        ${(prevLesson) ? '<button class="lc-prev">← Previous</button>' : ''}
        <button class="lc-retry">↻ Retry</button>
        ${nextLesson ? '<button class="lc-next' + ((!mistakeChars || !mistakeChars.length) ? ' primary' : '') + '">Next Lesson →</button>' : '<button class="lc-close primary">Close</button>'}
        ${nextLesson ? '<button class="lc-close">Close</button>' : ''}
      </div>
    </div>`;

  document.body.appendChild(overlay);

  /* drifting embers inside the card */
  const emberHost = overlay.querySelector('.lesson-complete-card');
  const emberCount = 10;
  for(let i=0;i<emberCount;i++){
    const p = document.createElement('div');
    p.className = 'lc-particle';
    p.style.left = (6 + Math.random()*88) + '%';
    p.style.animationDuration = (3.2 + Math.random()*2.4) + 's';
    p.style.animationDelay = (Math.random()*4) + 's';
    emberHost.appendChild(p);
  }

  /* count up the accuracy ring + time so the numbers feel earned */
  const ringEl = overlay.querySelector('.lc-ring');
  const ringValEl = ringEl.querySelector('b');
  const timeEl = overlay.querySelector('.lc-time');
  const countStart = performance.now();
  const countDuration = 900;
  function stepCount(now){
    const t = Math.min(1, (now - countStart) / countDuration);
    const eased = 1 - Math.pow(1 - t, 3);
    const curAcc = Math.round(accuracy * eased);
    ringEl.style.setProperty('--pct', curAcc);
    ringValEl.textContent = curAcc + '%';
    timeEl.textContent = (elapsed * eased).toFixed(1) + 's';
    if(t < 1) requestAnimationFrame(stepCount);
  }
  requestAnimationFrame(stepCount);

  let keyHandler = null;

  function advanceToNext(){
    if(keyHandler){ window.removeEventListener('keydown', keyHandler); keyHandler = null; }
    overlay.remove();
    if(nextLesson){
      startLesson(nextLesson.id);
    }
  }

  function dismissOverlay(){
    if(keyHandler){ window.removeEventListener('keydown', keyHandler); keyHandler = null; }
    overlay.remove();
  }

  keyHandler = (e)=>{
    if(e.key === 'Escape'){
      e.preventDefault();
      dismissOverlay();
    } else if(nextLesson && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight')){
      e.preventDefault();
      advanceToNext();
    }
  };
  window.addEventListener('keydown', keyHandler);

  overlay.querySelector('.lc-retry').addEventListener('click', ()=>{
    dismissOverlay();
    startLesson(remedialActive ? def : def.id);
  });
  const nextBtn = overlay.querySelector('.lc-next');
  if(nextBtn) nextBtn.addEventListener('click', ()=>{ advanceToNext(); });
  const prevBtn = overlay.querySelector('.lc-prev');
  if(prevBtn) prevBtn.addEventListener('click', ()=>{ dismissOverlay(); startLesson(prevLesson.id); });
  const mistakesBtn = overlay.querySelector('.lc-mistakes');
  if(mistakesBtn){
    mistakesBtn.addEventListener('click', ()=>{
      dismissOverlay();
      const entries = mistakeChars.map(resolveCharLocation).filter(Boolean);
      if(!entries.length) return;
      const companions = (lessonChars || []).map(resolveCharLocation).filter(Boolean);
      startLesson({
        id:-1, level:def.level, type:'review', isRemedial:true,
        title:'Review Mistakes — ' + def.title,
        subtitle:'Targeted combinations on missed keys (no repeating letters)',
        layer: entries[0].layer, threshold:0, newIds:[],
        generate: ()=> materialize(seqReviewMistakes(entries, companions)),
      });
    });
  }
  const closeBtn = overlay.querySelector('.lc-close');
  if(closeBtn) closeBtn.addEventListener('click', ()=>{ dismissOverlay(); });
}

if(document.readyState !== 'loading'){
  renderLessonStrip();
} else {
  document.addEventListener('DOMContentLoaded', ()=>{
    if(lessonStrip && lessonStrip.children.length === 0) renderLessonStrip();
  });
}

/* ---------- ripple burst ---------- */

function applyLessonsData(data){
  if(!data) return;
  if(data.LEVELS && Array.isArray(data.LEVELS)) LEVELS.length = 0, LEVELS.push(...data.LEVELS);
  if(data.LESSONS_STANDARD) LESSONS_STANDARD.length = 0, LESSONS_STANDARD.push(...data.LESSONS_STANDARD);
  if(data.LESSONS_NIDA) LESSONS_NIDA.length = 0, LESSONS_NIDA.push(...data.LESSONS_NIDA);
  if(data.LESSONS_ENGLISH) LESSONS_ENGLISH.length = 0, LESSONS_ENGLISH.push(...data.LESSONS_ENGLISH);
  if(data.LEVELS && Array.isArray(data.LEVELS)) LEVELS_STANDARD.length = 0, LEVELS_STANDARD.push(...data.LEVELS);
  if(data.LEVELS_NIDA && Array.isArray(data.LEVELS_NIDA)) LEVELS_NIDA.length = 0, LEVELS_NIDA.push(...data.LEVELS_NIDA);
  if(data.LEVELS_ENGLISH && Array.isArray(data.LEVELS_ENGLISH)) LEVELS_ENGLISH.length = 0, LEVELS_ENGLISH.push(...data.LEVELS_ENGLISH);
  if(data.LESSONS_STANDARD && Array.isArray(data.LESSONS_STANDARD)) LESSONS_STANDARD.length = 0, LESSONS_STANDARD.push(...data.LESSONS_STANDARD);
  if(data.LESSONS_NIDA && Array.isArray(data.LESSONS_NIDA)) LESSONS_NIDA.length = 0, LESSONS_NIDA.push(...data.LESSONS_NIDA);
  if(data.LESSONS_ENGLISH && Array.isArray(data.LESSONS_ENGLISH)) LESSONS_ENGLISH.length = 0, LESSONS_ENGLISH.push(...data.LESSONS_ENGLISH);
  if(typeof LEVEL_SETS !== 'undefined') window.LEVELS = LEVELS = LEVEL_SETS[currentLayoutId] || LEVELS_STANDARD;
  if(typeof LESSON_SETS !== 'undefined') window.LESSONS = LESSONS = LESSON_SETS[currentLayoutId] || LESSONS_STANDARD;
  if(typeof renderLessonStrip === "function") renderLessonStrip();
  if(typeof updateMasteryStat === "function") updateMasteryStat();
}
