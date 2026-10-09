/* ============================================================
   PK Khmer Type — Keyboard Layouts, Rendering & Kinematic Hands
   ============================================================ */

/* ---------- layout data ---------- */
const KEY = (id, base, ctrl, altgr, shift) => ({id, base, ctrl, altgr, shift, kind:'glyph'});

const ROW1 = [
  KEY('grave','','฿','◎',''),
  KEY('k1','១','₭','1','!'),
  KEY('k2','២','€','2','ៗ'),
  KEY('k3','៣','đ','3','"'),
  KEY('k4','៤','₣','4','៛'),
  KEY('k5','៥','¥','5','%'),
  KEY('k6','៦','','6','៍'),
  KEY('k7','៧','£','7','័'),
  KEY('k8','៨','','8','៏'),
  KEY('k9','៩','','9','៎'),
  KEY('k0','០','—','0','៌'),
  KEY('minus','-','•','{','_'),
  KEY('equal','=','','}','+'),
  {id:'backspace', kind:'mod', label:'Backsp.', wide:2},
];

const ROW2 = [
  {id:'tab', kind:'mod', label:'Tab', wide:1.5},
  KEY('q','ឆ','','*','ឈ'),
  KEY('w','ឹ','','','ឺ'),
  KEY('e','េ','','ឯ','ែ'),
  KEY('r','រ','','ឫ','ឬ'),
  KEY('t','ត','','ឦ','ទ'),
  KEY('y','យ','','','ួ'),
  KEY('u','ុ','','ឧ','ូ'),
  KEY('i','ិ','','ឥ','ី'),
  KEY('o','ោ','','ឱ','ៅ'),
  KEY('p','ផ','','ឳ','ភ'),
  KEY('bracketL','ើ','','[','ោះ'),
  KEY('bracketR','ឿ','',']','ៀ'),
  {...KEY('backslash','\\','/','៚','/'), wide:1.5},
];

const ROW3 = [
  {id:'caps', kind:'mod', label:'Caps', wide:1.75},
  KEY('a','ា','','ឩ','ៃ'),
  KEY('s','ស','','ឪ','ាំ'),
  KEY('d','ដ','','','ឌ'),
  KEY('f','ថ','','','ធ'),
  KEY('g','ង','','','ុះ'),
  KEY('h','ហ','','','៏'),
  KEY('j','ញ','','ឮ','ុំ'),
  KEY('k','ក','','ឭ','គ'),
  KEY('l','ល','','ឰ','ឡ'),
  KEY('semicolon','ះ',':',';','៖'),
  KEY('quote','់','«','៝','៉'),
  {id:'enter', kind:'mod', label:'Enter', wide:2.25},
];

const ROW4 = [
  {id:'shiftL', kind:'mod', label:'Shift', cls:'key-shift', wide:2.25},
  KEY('z','ឋ','','#','ឍ'),
  KEY('x','ខ','','@','ឃ'),
  KEY('c','ច','','&','ជ'),
  KEY('v','វ','','$','េះ'),
  KEY('b','ប','','%','ព'),
  KEY('n','ន','','(','ណ'),
  KEY('m','ម','’',')','ំ'),
  KEY('comma','អ','<','‹',','),
  KEY('period','។','>','›','.'),
  KEY('slash','','”','៕','?'),
  KEY('extra','','','¶',''),
  {id:'shiftR', kind:'mod', label:'Shift', cls:'key-shift', wide:1.75},
];

const ROW5 = [
  {id:'ctrlL', kind:'mod', label:'Ctrl', cls:'key-ctrl', wide:1.5},
  {id:'alt', kind:'mod', label:'Alt', wide:1.5},
  {id:'space', kind:'mod', label:'', cls:'space', wide:9},
  {id:'altgr', kind:'mod', label:'AltGr', cls:'key-altgr', wide:1.5},
  {id:'ctrlR', kind:'mod', label:'Ctrl', cls:'key-ctrl', wide:1.5},
];

/* ---------- Khmer NiDA layout data (official Windows Khmer NiDA mapping) ---------- */
const ROW1_NIDA = [
  KEY('grave','«','','‍','»'),
  KEY('k1','១','','‌','!'),
  KEY('k2','២','','@','ៗ'),
  KEY('k3','៣','','៑','"'),
  KEY('k4','៤','','$','៛'),
  KEY('k5','៥','','€','%'),
  KEY('k6','៦','','៙','៍'),
  KEY('k7','៧','','៚','័'),
  KEY('k8','៨','','*','៏'),
  KEY('k9','៩','','{','('),
  KEY('k0','០','','}',')'),
  KEY('minus','ឥ','','×','៌'),
  KEY('equal','ឲ','','៎','='),
  {id:'backspace', kind:'mod', label:'Backsp.', wide:2},
];

const ROW2_NIDA = [
  {id:'tab', kind:'mod', label:'Tab', wide:1.5},
  KEY('q','ឆ','','','ឈ'),
  KEY('w','ឹ','','','ឺ'),
  KEY('e','េ','','ឯ','ែ'),
  KEY('r','រ','','ឫ','ឬ'),
  KEY('t','ត','','','ទ'),
  KEY('y','យ','','','ួ'),
  KEY('u','ុ','','','ូ'),
  KEY('i','ិ','','ឦ','ី'),
  KEY('o','ោ','','ឱ','ៅ'),
  KEY('p','ផ','','ឰ','ភ'),
  KEY('bracketL','ៀ','','ឩ','ឿ'),
  KEY('bracketR','ឪ','','ឳ','ឧ'),
  {...KEY('backslash','ឮ','','\\','ឭ'), wide:1.5},
];

const ROW3_NIDA = [
  {id:'caps', kind:'mod', label:'Caps', wide:1.75},
  KEY('a','ា','','','ាំ'),
  KEY('s','ស','','','ៃ'),
  KEY('d','ដ','','','ឌ'),
  KEY('f','ថ','','','ធ'),
  KEY('g','ង','','','អ'),
  KEY('h','ហ','','','ះ'),
  KEY('j','្','','','ញ'),
  KEY('k','ក','','','គ'),
  KEY('l','ល','','','ឡ'),
  KEY('semicolon','ើ','','៖','ោះ'),
  KEY('quote','់','','ៈ','៉'),
  {id:'enter', kind:'mod', label:'Enter', wide:2.25},
];

const ROW4_NIDA = [
  {id:'shiftL', kind:'mod', label:'Shift', cls:'key-shift', wide:2.25},
  KEY('z','ឋ','','','ឍ'),
  KEY('x','ខ','','','ឃ'),
  KEY('c','ច','','','ជ'),
  KEY('v','វ','','','េះ'),
  KEY('b','ប','','','ព'),
  KEY('n','ន','','','ណ'),
  KEY('m','ម','','','ំ'),
  KEY('comma','ុំ','',',','ុះ'),
  KEY('period','។','','.','៕'),
  KEY('slash','៊','','/','?'),
  KEY('extra','','','',''),
  {id:'shiftR', kind:'mod', label:'Shift', cls:'key-shift', wide:1.75},
];

const ROW5_NIDA = [
  {id:'ctrlL', kind:'mod', label:'Ctrl', cls:'key-ctrl', wide:1.5},
  {id:'alt', kind:'mod', label:'Alt', wide:1.5},
  {id:'space', kind:'mod', label:'', cls:'space', wide:9},
  {id:'altgr', kind:'mod', label:'AltGr', cls:'key-altgr', wide:1.5},
  {id:'ctrlR', kind:'mod', label:'Ctrl', cls:'key-ctrl', wide:1.5},
];

/* ---------- English (US QWERTY) layout data ---------- */
const ROW1_EN = [
  KEY('grave','`','','','~'),
  KEY('k1','1','','','!'),
  KEY('k2','2','','','@'),
  KEY('k3','3','','','#'),
  KEY('k4','4','','','$'),
  KEY('k5','5','','','%'),
  KEY('k6','6','','','^'),
  KEY('k7','7','','','&'),
  KEY('k8','8','','','*'),
  KEY('k9','9','','','('),
  KEY('k0','0','','',')'),
  KEY('minus','-','','','_'),
  KEY('equal','=','','','+'),
  {id:'backspace', kind:'mod', label:'Backsp.', wide:2},
];

const ROW2_EN = [
  {id:'tab', kind:'mod', label:'Tab', wide:1.5},
  KEY('q','q','','','Q'),
  KEY('w','w','','','W'),
  KEY('e','e','','','E'),
  KEY('r','r','','','R'),
  KEY('t','t','','','T'),
  KEY('y','y','','','Y'),
  KEY('u','u','','','U'),
  KEY('i','i','','','I'),
  KEY('o','o','','','O'),
  KEY('p','p','','','P'),
  KEY('bracketL','[','','','{'),
  KEY('bracketR',']','','','}'),
  {...KEY('backslash','\\','','','|'), wide:1.5},
];

const ROW3_EN = [
  {id:'caps', kind:'mod', label:'Caps', wide:1.75},
  KEY('a','a','','','A'),
  KEY('s','s','','','S'),
  KEY('d','d','','','D'),
  KEY('f','f','','','F'),
  KEY('g','g','','','G'),
  KEY('h','h','','','H'),
  KEY('j','j','','','J'),
  KEY('k','k','','','K'),
  KEY('l','l','','','L'),
  KEY('semicolon',';','','',':'),
  KEY('quote','\'','','','"'),
  {id:'enter', kind:'mod', label:'Enter', wide:2.25},
];

const ROW4_EN = [
  {id:'shiftL', kind:'mod', label:'Shift', cls:'key-shift', wide:2.25},
  KEY('z','z','','','Z'),
  KEY('x','x','','','X'),
  KEY('c','c','','','C'),
  KEY('v','v','','','V'),
  KEY('b','b','','','B'),
  KEY('n','n','','','N'),
  KEY('m','m','','','M'),
  KEY('comma',',','','','<'),
  KEY('period','.','','','>'),
  KEY('slash','/','','','?'),
  KEY('extra','','','',''),
  {id:'shiftR', kind:'mod', label:'Shift', cls:'key-shift', wide:1.75},
];

const ROW5_EN = [
  {id:'ctrlL', kind:'mod', label:'Ctrl', cls:'key-ctrl', wide:1.5},
  {id:'alt', kind:'mod', label:'Alt', wide:1.5},
  {id:'space', kind:'mod', label:'', cls:'space', wide:9},
  {id:'altgr', kind:'mod', label:'AltGr', cls:'key-altgr', wide:1.5},
  {id:'ctrlR', kind:'mod', label:'Ctrl', cls:'key-ctrl', wide:1.5},
];

/* ---------- layout registry ---------- */
const LAYOUTS = {
  standard: {
    label: 'Khmer Keyboard Layout',
    rows: [ROW1, ROW2, ROW3, ROW4, ROW5],
    spaceMap: {base:'្', shift:' ', ctrl:'្', altgr:'្'},
    hasLessons: true,
    layerLabels: {base:'Base — Khmer', shift:'Shift — Voiced consonants', ctrl:'Ctrl — Currency & punctuation', altgr:'AltGr — Numerals & clusters'},
    layerLabelsKm: {base:'Base — ខ្មែរ', shift:'Shift — ព្យញ្ជនៈឃោសៈ', ctrl:'Ctrl — រូបិយប័ណ្ណ និងសញ្ញា', altgr:'AltGr — លេខ និងបណ្ដុំអក្សរ'},
  },
  nida: {
    label: 'Khmer NiDA Keyboard',
    rows: [ROW1_NIDA, ROW2_NIDA, ROW3_NIDA, ROW4_NIDA, ROW5_NIDA],
    spaceMap: {base:'\u200B', shift:' ', ctrl:' ', altgr:'\u00A0'},
    hasLessons: true,
    layerLabels: {base:'Base — Khmer', shift:'Shift — Marks & punctuation', ctrl:'Ctrl — (unused)', altgr:'AltGr — Symbols & vowels'},
    layerLabelsKm: {base:'Base — ខ្មែរ', shift:'Shift — សញ្ញា និងវណ្ណយុត្តិ', ctrl:'Ctrl — (មិនប្រើ)', altgr:'AltGr — និមិត្តសញ្ញា និងស្រៈ'},
  },
  english: {
    label: 'English (US)',
    rows: [ROW1_EN, ROW2_EN, ROW3_EN, ROW4_EN, ROW5_EN],
    spaceMap: {base:' ', shift:' ', ctrl:' ', altgr:' '},
    hasLessons: true,
    layerLabels: {base:'Base — lowercase', shift:'Shift — UPPERCASE & symbols', ctrl:'Ctrl — (unused)', altgr:'AltGr — (unused)'},
    layerLabelsKm: {base:'Base — អក្សរតូច', shift:'Shift — អក្សរធំ និងនិមិត្តសញ្ញា', ctrl:'Ctrl — (មិនប្រើ)', altgr:'AltGr — (មិនប្រើ)'},
  },
};
const LAYOUT_STORAGE_KEY = 'pk_active_layout';

let initialLayout = 'standard';
try {
  const sessionRaw = (typeof localStorage !== 'undefined') ? localStorage.getItem('pk_active_lesson_session') : null;
  if (sessionRaw) {
    const sObj = JSON.parse(sessionRaw);
    if (sObj && sObj.layoutId && LAYOUTS[sObj.layoutId]) {
      initialLayout = sObj.layoutId;
    }
  }
  if (initialLayout === 'standard' && typeof localStorage !== 'undefined') {
    const savedL = localStorage.getItem(LAYOUT_STORAGE_KEY) || localStorage.getItem('khmerActiveLayout');
    if (savedL && LAYOUTS[savedL]) initialLayout = savedL;
  }
} catch(e){}

let currentLayoutId = initialLayout;
window.currentLayoutId = currentLayoutId;
let ALL_ROWS = LAYOUTS[currentLayoutId].rows;

/* physical-keyboard code -> our key id */
const CODE_MAP = {
  Backquote:'grave', Digit1:'k1', Digit2:'k2', Digit3:'k3', Digit4:'k4', Digit5:'k5',
  Digit6:'k6', Digit7:'k7', Digit8:'k8', Digit9:'k9', Digit0:'k0',
  Minus:'minus', Equal:'equal', Backspace:'backspace',
  Tab:'tab', KeyQ:'q', KeyW:'w', KeyE:'e', KeyR:'r', KeyT:'t', KeyY:'y', KeyU:'u',
  KeyI:'i', KeyO:'o', KeyP:'p', BracketLeft:'bracketL', BracketRight:'bracketR', Enter:'enter',
  CapsLock:'caps', KeyA:'a', KeyS:'s', KeyD:'d', KeyF:'f', KeyG:'g', KeyH:'h', KeyJ:'j',
  KeyK:'k', KeyL:'l', Semicolon:'semicolon', Quote:'quote', Backslash:'backslash',
  ShiftLeft:'shiftL', ShiftRight:'shiftR', KeyZ:'z', KeyX:'x', KeyC:'c', KeyV:'v', KeyB:'b',
  KeyN:'n', KeyM:'m', Comma:'comma', Period:'period', Slash:'slash',
  ControlLeft:'ctrlL', ControlRight:'ctrlR', AltLeft:'alt', AltRight:'altgr', Space:'space',
};


const board = document.getElementById("keyboard");
const boardWrap = document.getElementById("boardWrap");
const layoutStrip = document.getElementById("layoutStrip");

const TOOLTIP_TEXT = {
  ctrl: { title:"VK_CONTROL", body:"Ctrl key with Ctrl enabled.\nHold for shortcuts." },
  altgr:{ title:"VK_RMENU", body:"AltGr key with AltGr enabled.\nHold to type AltGr characters." },
  shift:{ title:"VK_SHIFT", body:"Shift key with Shift enabled.\nHold to type Shift characters." },
};

let hoverLayer = null;
let lockedLayer = null;
let physicalLayer = null;
let capsOn = false;
let keyEls = {};
let glyphData = {};

const KEY_FINGER = {
  grave:'lp', k1:'lp', k2:'lr', k3:'lm', k4:'li', k5:'li',
  k6:'ri', k7:'ri', k8:'rm', k9:'rr', k0:'rp', minus:'rp', equal:'rp', backspace:'rp',
  tab:'lp', q:'lp', w:'lr', e:'lm', r:'li', t:'li', y:'ri', u:'ri', i:'rm', o:'rr',
  p:'rp', bracketL:'rp', bracketR:'rp', enter:'rp',
  caps:'lp', a:'lp', s:'lr', d:'lm', f:'li', g:'li', h:'ri', j:'ri', k:'rm', l:'rr',
  semicolon:'rp', quote:'rp', backslash:'rp',
  shiftL:'lp', z:'lp', x:'lr', c:'lm', v:'li', b:'li', n:'ri', m:'ri',
  comma:'rm', period:'rr', slash:'rp', extra:'rp', shiftR:'rp',
  ctrlL:'lt', alt:'lt', space:'rt', altgr:'rt', ctrlR:'rp',
};
window.KEY_FINGER = KEY_FINGER;

function buildBoard(){
  board.innerHTML = '';
  keyEls = {};
  glyphData = {};
  window.keyEls = keyEls;
  window.glyphData = glyphData;
ALL_ROWS.forEach(rowDef=>{
  const rowEl = document.createElement('div');
  rowEl.className = 'row';
  rowDef.forEach(k=>{
    const el = document.createElement('div');
    el.className = 'key notranslate';
    el.setAttribute('translate', 'no');
    el.dataset.key = k.id;
    if(KEY_FINGER[k.id]) el.dataset.finger = KEY_FINGER[k.id];
    const u = k.wide || 1;
    el.style.setProperty('--u', u);
    el.style.flexGrow = u;
    if(k.cls) el.classList.add(k.cls);
    keyEls[k.id] = el;

    if(k.kind === 'mod'){
      el.classList.add('label-key','mod');
      el.textContent = k.label;
      if(k.id === 'space'){
        el.classList.add('space');
        if(currentLayoutId === 'standard'){
          el.innerHTML = '<span class="space-glyph">្</span><span class="space-label">ជើង (Coeng)</span><span class="shift-badge">Space</span>';
        } else if(currentLayoutId === 'nida'){
          el.innerHTML = '<span class="space-glyph">␣</span><span class="space-label">ដកឃ្លា · Spacebar</span>';
        } else {
          el.innerHTML = '<span class="space-label">Space</span>';
        }
      }
    } else {
      const g = document.createElement('span');
      g.className = 'glyph notranslate';
      g.setAttribute('translate', 'no');
      g.dataset.base = k.base;
      g.dataset.ctrl = k.ctrl;
      g.dataset.altgr = k.altgr;
      g.dataset.shift = k.shift || '';
      g.textContent = k.base;
      el.appendChild(g);
      glyphData[k.id] = {base:k.base, ctrl:k.ctrl, altgr:k.altgr, shift:k.shift || ''};
      if(!k.base) el.classList.add('empty');

      if(k.shift){
        const hint = document.createElement('span');
        hint.className = 'shift-badge notranslate';
        hint.setAttribute('translate', 'no');
        hint.textContent = k.shift;
        el.appendChild(hint);
      }
    }

    if(k.cls === 'key-ctrl' || k.cls === 'key-altgr' || k.cls === 'key-shift'){
      const layerName = k.cls === 'key-ctrl' ? 'ctrl' : (k.cls === 'key-altgr' ? 'altgr' : 'shift');
      const tipData = (TOOLTIP_TEXT && TOOLTIP_TEXT[layerName]) || { title: k.label || layerName, body: '' };
      const tip = document.createElement('div');
      tip.className = 'tooltip';
      tip.innerHTML = `<strong>${tipData.title || ''}</strong>${(tipData.body || '').replace(/\n/g,'<br>')}`;
      el.appendChild(tip);

      el.addEventListener('mouseenter', ()=>{
        tip.classList.add('show');
        if(!physicalLayer && !lockedLayer){
          hoverLayer = layerName;
          render();
        }
      });
      el.addEventListener('mouseleave', ()=>{
        tip.classList.remove('show');
        if(hoverLayer === layerName){
          hoverLayer = null;
          render();
        }
      });

      const activateModifier = (ev)=>{
        ev.preventDefault();
        physicalLayer = layerName;
        el.classList.add('pressed');
        render();
        burst(el, ev);
        playClick('down');
      };
      const deactivateModifier = ()=>{
        if(physicalLayer === layerName){
          physicalLayer = null;
          el.classList.remove('pressed');
          render();
          playClick('up');
        }
      };

      el.addEventListener('pointerdown', activateModifier);
      el.addEventListener('pointerup', deactivateModifier);
      el.addEventListener('pointerleave', deactivateModifier);
      el.addEventListener('pointercancel', deactivateModifier);
    } else {
      el.addEventListener('click', (ev)=>{
        typeKey(k.id, ev);
      });
    }

    rowEl.appendChild(el);
  });
  board.appendChild(rowEl);
});
}

function syncLayoutUI(id){
  const targetId = id || currentLayoutId;
  if(layoutStrip){
    layoutStrip.querySelectorAll('.layout-pill').forEach(p=>{
      const isActive = p.dataset.layout === targetId;
      p.classList.toggle('active', isActive);
      p.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
  }
  const chassisLabel = document.getElementById('chassisLayoutLabel');
  if(chassisLabel){
    const nameMap = { standard:'STANDARD', nida:'NiDA', english:'ENGLISH' };
    chassisLabel.textContent = nameMap[targetId] || (targetId ? targetId.toUpperCase() : 'STANDARD');
  }
  const isKm = document.documentElement.classList.contains('site-km-mode');
  const llEn = LAYOUTS[targetId] && LAYOUTS[targetId].layerLabels;
  const llKm = LAYOUTS[targetId] && LAYOUTS[targetId].layerLabelsKm;
  if(llEn){
    document.querySelectorAll('.layer-pill').forEach(p=>{
      const key = p.dataset.pill;
      if(llEn[key]) p.setAttribute('data-en', llEn[key]);
      if(llKm && llKm[key]) p.setAttribute('data-km', llKm[key]);
      const txt = (isKm && llKm && llKm[key]) ? llKm[key] : llEn[key];
      if(txt) p.textContent = txt;
    });
  }
  const lessonsAvailable = LAYOUTS[targetId] && LAYOUTS[targetId].hasLessons;
  const lsEl = typeof lessonStrip !== 'undefined' ? lessonStrip : document.getElementById('lessonStrip');
  if(lsEl) {
    lsEl.style.display = lessonsAvailable ? '' : 'none';
    if(lessonsAvailable) lsEl.hidden = false;
  }
  const ttEl = typeof trialToggle !== 'undefined' ? trialToggle : document.getElementById('trialToggle');
  if(ttEl) ttEl.style.display = lessonsAvailable ? '' : 'none';
  const rtEl = typeof raceToggle !== 'undefined' ? raceToggle : document.getElementById('raceToggle');
  if(rtEl) rtEl.style.display = lessonsAvailable ? '' : 'none';
  const lunEl = typeof lessonUnavailableNote !== 'undefined' ? lessonUnavailableNote : document.getElementById('lessonUnavailableNote');
  if(lunEl) lunEl.style.display = lessonsAvailable ? 'none' : '';
  if(typeof updateQuickGuide === 'function') updateQuickGuide();
  if(typeof window.syncSettingsLayoutChoiceUI === 'function'){
    window.syncSettingsLayoutChoiceUI(targetId);
  }
}
window.syncLayoutUI = syncLayoutUI;
window.switchLayout = switchLayout;
window.setActiveLayout = function(id) { switchLayout(id, true); };

// Self-booting fallback so keyboard is guaranteed to render reliably
if(document.readyState !== 'loading'){
  buildBoard();
  syncLayoutUI(currentLayoutId);
} else {
  document.addEventListener('DOMContentLoaded', ()=>{
    if(board && board.children.length === 0) buildBoard();
    syncLayoutUI(currentLayoutId);
  });
}


/* ---------- layout switching ---------- */
function updateQuickGuide() {
  const leftHand = document.getElementById('guideLeftHand');
  const rightHand = document.getElementById('guideRightHand');
  const subscriptsSec = document.getElementById('guideSubscriptsSec');
  const typeSpaceKbd = document.getElementById('guideTypeSpaceKbd');
  const coengKeyWrap = document.getElementById('guideCoengKeyWrap');
  const isKm = document.documentElement.classList.contains('site-km-mode');

  if (!leftHand) return;

  if (currentLayoutId === 'english') {
    leftHand.innerHTML = `
      <div class="guide-mini-key" title="Left Pinky"><span class="km-ch" style="opacity:0">A</span><span class="en-ch">A</span></div>
      <div class="guide-mini-key" title="Left Ring"><span class="km-ch" style="opacity:0">S</span><span class="en-ch">S</span></div>
      <div class="guide-mini-key" title="Left Middle"><span class="km-ch" style="opacity:0">D</span><span class="en-ch">D</span></div>
      <div class="guide-mini-key" title="Left Index"><span class="km-ch" style="opacity:0">F</span><span class="en-ch">F</span></div>
    `;
    rightHand.innerHTML = `
      <div class="guide-mini-key" title="Right Index"><span class="km-ch" style="opacity:0">H</span><span class="en-ch">J</span></div>
      <div class="guide-mini-key" title="Right Middle"><span class="km-ch" style="opacity:0">J</span><span class="en-ch">K</span></div>
      <div class="guide-mini-key" title="Right Ring"><span class="km-ch" style="opacity:0">K</span><span class="en-ch">L</span></div>
      <div class="guide-mini-key" title="Right Pinky"><span class="km-ch" style="opacity:0">L</span><span class="en-ch">;</span></div>
    `;
    if(subscriptsSec) subscriptsSec.style.display = 'block';
    if(typeSpaceKbd) typeSpaceKbd.textContent = 'Space';
  } else if (currentLayoutId === 'standard') {
    leftHand.innerHTML = `
      <div class="guide-mini-key" title="Left Pinky"><span class="km-ch">ា</span><span class="en-ch">A</span></div>
      <div class="guide-mini-key" title="Left Ring"><span class="km-ch">ស</span><span class="en-ch">S</span></div>
      <div class="guide-mini-key" title="Left Middle"><span class="km-ch">ដ</span><span class="en-ch">D</span></div>
      <div class="guide-mini-key" title="Left Index"><span class="km-ch">ថ</span><span class="en-ch">F</span></div>
    `;
    rightHand.innerHTML = `
      <div class="guide-mini-key" title="Right Index"><span class="km-ch">ញ</span><span class="en-ch">J</span></div>
      <div class="guide-mini-key" title="Right Middle"><span class="km-ch">ក</span><span class="en-ch">K</span></div>
      <div class="guide-mini-key" title="Right Ring"><span class="km-ch">ល</span><span class="en-ch">L</span></div>
      <div class="guide-mini-key" title="Right Pinky"><span class="km-ch">ះ</span><span class="en-ch">;</span></div>
    `;
    if(subscriptsSec) subscriptsSec.style.display = 'block';
    if(typeSpaceKbd) typeSpaceKbd.textContent = 'Shift + Space';
    if(coengKeyWrap) coengKeyWrap.innerHTML = '<kbd class="guide-kbd">Space</kbd> <span class="i18n-t" data-en="(Standard)" data-km="(ស្តង់ដារ)">' + (isKm ? '(ស្តង់ដារ)' : '(Standard)') + '</span>';
  } else if (currentLayoutId === 'nida') {
    leftHand.innerHTML = `
      <div class="guide-mini-key" title="Left Pinky"><span class="km-ch">ា</span><span class="en-ch">A</span></div>
      <div class="guide-mini-key" title="Left Ring"><span class="km-ch">ស</span><span class="en-ch">S</span></div>
      <div class="guide-mini-key" title="Left Middle"><span class="km-ch">ដ</span><span class="en-ch">D</span></div>
      <div class="guide-mini-key" title="Left Index"><span class="km-ch">ថ</span><span class="en-ch">F</span></div>
    `;
    rightHand.innerHTML = `
      <div class="guide-mini-key" title="Right Index"><span class="km-ch">្</span><span class="en-ch">J</span></div>
      <div class="guide-mini-key" title="Right Middle"><span class="km-ch">ក</span><span class="en-ch">K</span></div>
      <div class="guide-mini-key" title="Right Ring"><span class="km-ch">ល</span><span class="en-ch">L</span></div>
      <div class="guide-mini-key" title="Right Pinky"><span class="km-ch">ើ</span><span class="en-ch">;</span></div>
    `;
    if(subscriptsSec) subscriptsSec.style.display = 'block';
    if(typeSpaceKbd) typeSpaceKbd.textContent = 'Space';
    if(coengKeyWrap) coengKeyWrap.innerHTML = '<kbd class="guide-kbd">J</kbd> <span class="i18n-t" data-en="(NiDA)" data-km="(NiDA)">(NiDA)</span>';
  }

  if(window.PKQuickGuide && typeof window.PKQuickGuide.updateLayout === 'function'){
    window.PKQuickGuide.updateLayout(currentLayoutId);
  }
}

function switchLayout(id, force = false){
  if(!LAYOUTS[id] || (id === currentLayoutId && !force)) return;
  const prevLayout = currentLayoutId;
  document.querySelectorAll('.lesson-complete-overlay').forEach(el => el.remove());
  if(typeof adaptiveActive !== 'undefined' && adaptiveActive && typeof PK_ADAPTIVE !== 'undefined' && typeof PK_ADAPTIVE.exitSession === 'function'){
    PK_ADAPTIVE.exitSession();
  }
  if(typeof suspendLessonForLayoutSwitch === 'function'){
    suspendLessonForLayoutSwitch(prevLayout);
  } else if(typeof executeLessonExit === 'function' && typeof lessonActive !== 'undefined' && lessonActive){
    executeLessonExit();
  }
  if(typeof trialActive !== 'undefined' && trialActive) stopTrial();
  if(typeof raceMode !== 'undefined' && raceMode) exitRaceMode();
  if(id !== 'nida' && typeof hideNidaSwitchHud === 'function') hideNidaSwitchHud();
  currentLayoutId = id;
  window.currentLayoutId = currentLayoutId;
  try {
    if(typeof localStorage !== 'undefined'){
      localStorage.setItem(LAYOUT_STORAGE_KEY, id);
      localStorage.setItem('khmerActiveLayout', id);
    }
  } catch(e){}
  if(typeof updateQuickGuide === 'function') updateQuickGuide();
  window.activeCourse = id;
  window.activeLayout = id;
  if(typeof PK_TRACKER !== 'undefined' && typeof PK_TRACKER.recordLayoutSwitch === 'function'){
    PK_TRACKER.recordLayoutSwitch(prevLayout, id);
  }
  ALL_ROWS = LAYOUTS[id].rows;
  if(typeof LESSON_SETS !== 'undefined'){
    LESSONS = LESSON_SETS[id] || LESSONS;
    if(typeof LEVEL_SETS !== 'undefined'){
      LEVELS = LEVEL_SETS[id] || LEVELS;
      if(typeof defaultCollapsedLevels === 'function') collapsedLevels = defaultCollapsedLevels();
    }
    if(typeof renderLessonStrip === 'function') renderLessonStrip();
    if(typeof updateMasteryStat === 'function') updateMasteryStat();
    if(typeof PK_ADAPTIVE !== 'undefined' && typeof PK_ADAPTIVE.updateSidebarCard === 'function'){
      PK_ADAPTIVE.updateSidebarCard(id);
    }
  }
  hoverLayer = null;
  lockedLayer = null;
  physicalLayer = null;
  capsOn = false;
  clearText();
  buildBoard();
  updateHandsOverlay();
  render();
  syncLayoutUI(id);
  if(typeof restoreLessonAfterLayoutSwitch === 'function'){
    restoreLessonAfterLayoutSwitch(id);
  }
}
if(layoutStrip){
  layoutStrip.querySelectorAll('.layout-pill[data-layout]').forEach(p=>{
    p.addEventListener('click', ()=> {
      switchLayout(p.dataset.layout);
      if(typeof playHolographicChime === 'function'){
        playHolographicChime(p.dataset.layout !== 'english');
      }
    });
  });
}


/* ---------- finger guide (illustrated translucent hands) ---------- */
window.KEY_FINGER = KEY_FINGER;
window.keyEls = keyEls;
window.currentLayer = currentLayer;
window.setActiveFinger = setActiveFinger;
window.render = render;
window.LAYOUTS = LAYOUTS;
window.glyphData = glyphData;
const FINGERS = [
  {id:'lp', hand:'L', home:'a', kind:'pinky',  baseW:13.0, tipW:8.5,  kDist:64, restLen:52, restAng:-0.09},
  {id:'lr', hand:'L', home:'s', kind:'ring',   baseW:14.8, tipW:9.6,  kDist:58, restLen:56, restAng:-0.03},
  {id:'lm', hand:'L', home:'d', kind:'middle', baseW:15.8, tipW:10.2, kDist:53, restLen:60, restAng:0.0},
  {id:'li', hand:'L', home:'f', kind:'index',  baseW:15.2, tipW:9.8,  kDist:56, restLen:56, restAng:0.05},
  {id:'lt', hand:'L', home:'space', kind:'thumb', baseW:18.5, tipW:12.4, kDist:46, restLen:46, restAng:0.52},
  {id:'rt', hand:'R', home:'space', kind:'thumb', baseW:18.5, tipW:12.4, kDist:46, restLen:46, restAng:-0.52},
  {id:'ri', hand:'R', home:'j', kind:'index',  baseW:15.2, tipW:9.8,  kDist:56, restLen:56, restAng:-0.05},
  {id:'rm', hand:'R', home:'k', kind:'middle', baseW:15.8, tipW:10.2, kDist:53, restLen:60, restAng:0.0},
  {id:'rr', hand:'R', home:'l', kind:'ring',   baseW:14.8, tipW:9.6,  kDist:58, restLen:56, restAng:0.03},
  {id:'rp', hand:'R', home:'semicolon', kind:'pinky', baseW:13.0, tipW:8.5, kDist:64, restLen:52, restAng:0.09},
];
window.FINGERS = FINGERS;

const handsOverlay = document.getElementById('handsOverlay');
const handsToggle = document.getElementById('handsToggle');
let handsOn = true;
window.handsOn = handsOn;
const fingerEls = {}; // id -> {g, shape, shine, crease1, crease2, nail, tip}
window.fingerEls = fingerEls;

/* ---- svg geometry helpers ---- */
const SVGNS = 'http://www.w3.org/2000/svg';
function sub(a,b){ return {x:a.x-b.x, y:a.y-b.y}; }
function add(a,b){ return {x:a.x+b.x, y:a.y+b.y}; }
function scalePt(a,s){ return {x:a.x*s, y:a.y*s}; }
function dist(a,b){ return Math.hypot(a.x-b.x, a.y-b.y); }
function norm(v){ const l = Math.hypot(v.x,v.y) || 1; return {x:v.x/l, y:v.y/l}; }

/* rounded-corner closed polygon, used for the back-of-hand silhouette */
function roundedPolyPath(pts, r){
  const n = pts.length;
  let d = '';
  for(let i=0;i<n;i++){
    const prev = pts[(i-1+n)%n];
    const cur = pts[i];
    const next = pts[(i+1)%n];
    const v1 = norm(sub(cur, prev));
    const v2 = norm(sub(next, cur));
    const cut1 = Math.min(r, dist(cur,prev)/2.2);
    const cut2 = Math.min(r, dist(cur,next)/2.2);
    const p1 = sub(cur, scalePt(v1, cut1));
    const p2 = add(cur, scalePt(v2, cut2));
    d += (i===0 ? `M ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} ` : `L ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} `);
    d += `Q ${cur.x.toFixed(1)} ${cur.y.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)} `;
  }
  return d + 'Z';
}

/* quadratic bezier point + tangent, used to build a tapered finger */
function qPoint(o,c,t,s){ const m=1-s; return { x:m*m*o.x+2*m*s*c.x+s*s*t.x, y:m*m*o.y+2*m*s*c.y+s*s*t.y }; }
function qTangent(o,c,t,s){ const m=1-s; return { x:2*m*(c.x-o.x)+2*s*(t.x-c.x), y:2*m*(c.y-o.y)+2*s*(t.y-c.y) }; }

/* build a smooth tapered, rounded-cap human finger silhouette between origin and tip */
function fingerFrame(origin, ctrl, tip, baseW, tipW){
  const N = 18, left = [], right = [];
  for(let i=0;i<=N;i++){
    const s = i/N;
    const p = qPoint(origin, ctrl, tip, s);
    const tan = qTangent(origin, ctrl, tip, s);
    const l = Math.hypot(tan.x,tan.y) || 1;
    // Left-hand normal in screen coordinates (+X right, +Y down) so left[] is true left of finger vector
    const nx = tan.y/l, ny = -tan.x/l;
    const phalanxContour = Math.sin(s * Math.PI) * 0.55;
    const w = (baseW + (tipW - baseW) * Math.pow(s, 1.22) + phalanxContour) / 2;
    left.push({x:p.x+nx*w, y:p.y+ny*w});
    right.push({x:p.x-nx*w, y:p.y-ny*w});
  }
  return {left, right};
}
function frameToPath(frame, baseW, tipW){
  const {left, right} = frame;
  let d = `M ${left[0].x.toFixed(1)} ${left[0].y.toFixed(1)} `;
  for(let i=1;i<left.length;i++) d += `L ${left[i].x.toFixed(1)} ${left[i].y.toFixed(1)} `;
  const tipR = (tipW/2).toFixed(1);
  const lastR = right[right.length-1];
  d += `A ${tipR} ${tipR} 0 0 1 ${lastR.x.toFixed(1)} ${lastR.y.toFixed(1)} `;
  for(let i=right.length-2;i>=0;i--) d += `L ${right[i].x.toFixed(1)} ${right[i].y.toFixed(1)} `;
  const baseR = (baseW/2).toFixed(1);
  d += `A ${baseR} ${baseR} 0 0 1 ${left[0].x.toFixed(1)} ${left[0].y.toFixed(1)} Z`;
  return d;
}
function creaseAt(frame, s){
  const i = Math.round(s * (frame.left.length-1));
  const l = frame.left[i], r = frame.right[i];
  const mx = (l.x+r.x)/2, my = (l.y+r.y)/2;
  const lx = mx + (l.x-mx)*0.56, ly = my + (l.y-my)*0.56;
  const rx = mx + (r.x-mx)*0.56, ry = my + (r.y-my)*0.56;
  return `M ${lx.toFixed(1)} ${ly.toFixed(1)} Q ${mx.toFixed(1)} ${(my - 1.2).toFixed(1)} ${rx.toFixed(1)} ${ry.toFixed(1)}`;
}
function pointAtFrame(frame, s){
  const i = Math.round(s * (frame.left.length-1));
  const l = frame.left[i], r = frame.right[i];
  return { x:(l.x+r.x)/2, y:(l.y+r.y)/2 };
}

/* ---- Dynamic Hand Color Gradients Engine ---- */
const HAND_COLOR_PRESETS = {
  cyber: { name: "Cyber Cyan & Orchid", l: "#38bdf8", r: "#f472b6" },
  emerald: { name: "Amber & Emerald", l: "#fbbf24", r: "#34d399" },
  ruby: { name: "Ruby & Sapphire", l: "#fb7185", r: "#60a5fa" },
  sunset: { name: "Sunset & Violet", l: "#fb923c", r: "#a78bfa" },
  ghost: { name: "Frost Silver", l: "#94a3b8", r: "#e2e8f0" },
  match: { name: "Match Theme", l: null, r: null },
  custom: { name: "Custom Dual", l: "#38bdf8", r: "#f472b6" }
};

function hexToRgb(hex, fallback) {
  if (!hex || typeof hex !== 'string') return fallback || { r: 56, g: 189, b: 248 };
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  if (hex.length !== 6) return fallback || { r: 56, g: 189, b: 248 };
  const num = parseInt(hex, 16);
  if (isNaN(num)) return fallback || { r: 56, g: 189, b: 248 };
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function rgbToHex(r, g, b) {
  const clamp = v => Math.max(0, Math.min(255, Math.round(v)));
  return '#' + [clamp(r), clamp(g), clamp(b)].map(x => x.toString(16).padStart(2, '0')).join('');
}

function buildHandPalette(hex, fallbackHex) {
  const rgb = hexToRgb(hex, hexToRgb(fallbackHex));
  const r = rgb.r, g = rgb.g, b = rgb.b;
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
    tipFillRgba: `rgba(${r}, ${g}, ${b}, 0.65)`
  };
}

function getThemeMatchedColors() {
  const root = document.documentElement;
  if (root.classList.contains('theme-jungle')) {
    return { l: '#5fd694', r: '#8bf0b3' };
  } else if (root.classList.contains('theme-temple')) {
    return { l: '#ffd166', r: '#e0a838' };
  } else if (root.classList.contains('theme-moonlight')) {
    return { l: '#bfe0ff', r: '#7fb8ff' };
  } else if (root.classList.contains('theme-sunset')) {
    return { l: '#ff9a6c', r: '#ff6b6b' };
  } else if (root.classList.contains('theme-light')) {
    return { l: '#0284c7', r: '#7c3aed' };
  } else if (root.classList.contains('theme-sepia')) {
    return { l: '#b48342', r: '#c2593f' };
  }
  return { l: '#38bdf8', r: '#f472b6' };
}

const defs = document.createElementNS(SVGNS, 'defs');
defs.id = 'handsDefs';

function updateHandsGradients(leftHex, rightHex) {
  const palL = buildHandPalette(leftHex, '#38bdf8');
  const palR = buildHandPalette(rightHex, '#f472b6');

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
  r.style.setProperty('--hand-l-hex', palL.hex);
  r.style.setProperty('--hand-l-stroke', palL.strokeRgba);
  r.style.setProperty('--hand-l-shadow', palL.shadowRgba);
  r.style.setProperty('--hand-l-shine', palL.light);
  r.style.setProperty('--hand-l-crease', palL.strokeRgba);
  r.style.setProperty('--hand-l-nail-fill', palL.nailFillRgba);
  r.style.setProperty('--hand-l-nail-stroke', palL.light);
  r.style.setProperty('--hand-l-tip-fill', palL.tipFillRgba);
  r.style.setProperty('--hand-l-tip-stroke', palL.light);
  r.style.setProperty('--hand-l-glow', palL.glowRgba);

  r.style.setProperty('--hand-r-hex', palR.hex);
  r.style.setProperty('--hand-r-stroke', palR.strokeRgba);
  r.style.setProperty('--hand-r-shadow', palR.shadowRgba);
  r.style.setProperty('--hand-r-shine', palR.light);
  r.style.setProperty('--hand-r-crease', palR.strokeRgba);
  r.style.setProperty('--hand-r-nail-fill', palR.nailFillRgba);
  r.style.setProperty('--hand-r-nail-stroke', palR.light);
  r.style.setProperty('--hand-r-tip-fill', palR.tipFillRgba);
  r.style.setProperty('--hand-r-tip-stroke', palR.light);
  r.style.setProperty('--hand-r-glow', palR.glowRgba);
}

window.PKHandsColor = {
  PRESETS: HAND_COLOR_PRESETS,
  applyHandColors: function(presetKey, customL, customR) {
    presetKey = presetKey || (function(){ try { return localStorage.getItem('khmerSettingHandColorPreset'); }catch(e){ return null; } })() || 'cyber';
    let l, r;
    if (presetKey === 'custom') {
      try {
        l = customL || localStorage.getItem('khmerSettingHandColorCustomL') || '#38bdf8';
        r = customR || localStorage.getItem('khmerSettingHandColorCustomR') || '#f472b6';
      } catch(e) {
        l = '#38bdf8'; r = '#f472b6';
      }
    } else if (presetKey === 'match') {
      const matched = getThemeMatchedColors();
      l = matched.l;
      r = matched.r;
    } else if (HAND_COLOR_PRESETS[presetKey]) {
      l = HAND_COLOR_PRESETS[presetKey].l;
      r = HAND_COLOR_PRESETS[presetKey].r;
    } else {
      l = '#38bdf8';
      r = '#f472b6';
      presetKey = 'cyber';
    }
    updateHandsGradients(l, r);
    try {
      localStorage.setItem('khmerSettingHandColorPreset', presetKey);
      if (customL) localStorage.setItem('khmerSettingHandColorCustomL', customL);
      if (customR) localStorage.setItem('khmerSettingHandColorCustomR', customR);
    } catch(e){}

    document.dispatchEvent(new CustomEvent('pk-hand-colors-changed', {
      detail: { preset: presetKey, l, r }
    }));
    return { preset: presetKey, l, r };
  },
  cycleNextPreset: function() {
    const keys = ['cyber', 'emerald', 'ruby', 'sunset', 'ghost', 'match'];
    let cur = 'cyber';
    try { cur = localStorage.getItem('khmerSettingHandColorPreset') || 'cyber'; } catch(e){}
    let idx = keys.indexOf(cur);
    if (idx === -1) idx = 0;
    const next = keys[(idx + 1) % keys.length];
    return this.applyHandColors(next);
  }
};

handsOverlay.appendChild(defs);
window.PKHandsColor.applyHandColors();

if (typeof MutationObserver !== 'undefined') {
  const themeObserver = new MutationObserver(() => {
    try {
      if (localStorage.getItem('khmerSettingHandColorPreset') === 'match') {
        window.PKHandsColor.applyHandColors('match');
      }
    } catch(e){}
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
}

const handGroupL = document.createElementNS(SVGNS,'g');
handGroupL.setAttribute('class','hand-group side-l');
const handGroupR = document.createElementNS(SVGNS,'g');
handGroupR.setAttribute('class','hand-group side-r');
handsOverlay.appendChild(handGroupL);
handsOverlay.appendChild(handGroupR);

const palmShapeL = document.createElementNS(SVGNS,'path'); palmShapeL.setAttribute('class','palm-shape');
const palmShadeL = document.createElementNS(SVGNS,'path'); palmShadeL.setAttribute('class','palm-shade');
const palmHiL = document.createElementNS(SVGNS,'ellipse'); palmHiL.setAttribute('class','palm-highlight');
const palmCoreL = document.createElementNS(SVGNS,'circle'); palmCoreL.setAttribute('class','palm-core'); palmCoreL.setAttribute('r','5.5');
const palmShapeR = document.createElementNS(SVGNS,'path'); palmShapeR.setAttribute('class','palm-shape');
const palmShadeR = document.createElementNS(SVGNS,'path'); palmShadeR.setAttribute('class','palm-shade');
const palmHiR = document.createElementNS(SVGNS,'ellipse'); palmHiR.setAttribute('class','palm-highlight');
const palmCoreR = document.createElementNS(SVGNS,'circle'); palmCoreR.setAttribute('class','palm-core'); palmCoreR.setAttribute('r','5.5');

handGroupL.appendChild(palmShapeL); handGroupL.appendChild(palmShadeL); handGroupL.appendChild(palmHiL); handGroupL.appendChild(palmCoreL);
handGroupR.appendChild(palmShapeR); handGroupR.appendChild(palmShadeR); handGroupR.appendChild(palmHiR); handGroupR.appendChild(palmCoreR);

function createFingerElement(f){
  if(fingerEls[f.id]) return fingerEls[f.id];
  const g = document.createElementNS(SVGNS,'g');
  g.setAttribute('class','finger');
  g.dataset.finger = f.id;
  const shape = document.createElementNS(SVGNS,'path'); shape.setAttribute('class','finger-shape');
  const crease1 = document.createElementNS(SVGNS,'path'); crease1.setAttribute('class','finger-crease');
  const joint1 = document.createElementNS(SVGNS,'circle'); joint1.setAttribute('class','finger-joint');
  const crease2 = document.createElementNS(SVGNS,'path'); crease2.setAttribute('class','finger-crease');
  const joint2 = document.createElementNS(SVGNS,'circle'); joint2.setAttribute('class','finger-joint');
  const shine = document.createElementNS(SVGNS,'path'); shine.setAttribute('class','finger-shine');
  const shine2 = document.createElementNS(SVGNS,'path'); shine2.setAttribute('class','finger-shine2');
  const energy = document.createElementNS(SVGNS,'path'); energy.setAttribute('class','finger-energy');
  const nail = document.createElementNS(SVGNS,'ellipse'); nail.setAttribute('class','finger-nail');
  const impactRing = document.createElementNS(SVGNS,'circle'); impactRing.setAttribute('class','impact-ring'); impactRing.setAttribute('r','9');
  const impactRing2 = document.createElementNS(SVGNS,'circle'); impactRing2.setAttribute('class','impact-ring-2'); impactRing2.setAttribute('r','9');
  const impactSparks = document.createElementNS(SVGNS,'path');
  impactSparks.setAttribute('class','impact-sparks');
  impactSparks.setAttribute('d','M0 -12 L0 -7 M10.4 -6 L6.1 -3.5 M10.4 6 L6.1 3.5 M0 12 L0 7 M-10.4 6 L-6.1 3.5 M-10.4 -6 L-6.1 -3.5');
  const reticle = document.createElementNS(SVGNS,'path');
  reticle.setAttribute('class','target-reticle');
  reticle.setAttribute('d','M -11 -5 L -11 -11 L -5 -11 M 5 -11 L 11 -11 L 11 -5 M 11 5 L 11 11 L 5 11 M -5 11 L -11 11 L -11 5');
  const tip = document.createElementNS(SVGNS,'circle'); tip.setAttribute('class','finger-tip'); tip.setAttribute('r','5');
  g.appendChild(shape); g.appendChild(crease1); g.appendChild(joint1); g.appendChild(crease2); g.appendChild(joint2);
  g.appendChild(shine); g.appendChild(shine2); g.appendChild(energy); g.appendChild(nail); g.appendChild(impactRing); g.appendChild(impactRing2); g.appendChild(impactSparks); g.appendChild(reticle); g.appendChild(tip);
  (f.hand === 'L' ? handGroupL : handGroupR).appendChild(g);
  fingerEls[f.id] = {g, shape, crease1, crease2, joint1, joint2, shine, shine2, energy, nail, tip, impactRing, impactRing2, impactSparks, reticle};
  return fingerEls[f.id];
}
window.createFingerElement = createFingerElement;

FINGERS.forEach(createFingerElement);

let activeFinger = null;
let activeTargetKey = null;
let activeShiftFinger = null;
let activeShiftTargetKey = null;

function modifierInfoFor(keyId, layer){
  if(!keyId || !layer || layer === 'base') return null;
  const fid = KEY_FINGER[keyId];
  const f = fid && FINGERS.find(x=> x.id === fid);
  const isLeftHand = f ? (f.hand === 'L') : false;

  if(layer === 'shift'){
    if(keyId === 'shiftL' || keyId === 'shiftR') return null;
    const targetKey = isLeftHand ? 'shiftR' : 'shiftL';
    const fingerId = isLeftHand ? 'rp' : 'lp';
    return { fingerId, targetKey };
  }

  if(layer === 'ctrl'){
    if(keyId === 'ctrlL' || keyId === 'ctrlR') return null;
    if(isLeftHand && keyEls['ctrlR']){
      return { fingerId: 'rp', targetKey: 'ctrlR' };
    }
    return { fingerId: 'lp', targetKey: 'ctrlL' };
  }

  if(layer === 'altgr'){
    if(keyId === 'altgr') return null;
    return { fingerId: 'rt', targetKey: 'altgr' };
  }

  return null;
}

function shiftFingerFor(keyId){
  const mod = modifierInfoFor(keyId, 'shift');
  return mod ? mod.fingerId : null;
}

function keyCenter(id, wrapRect){
  const el = keyEls[id];
  if(!el) return null;
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width/2 - wrapRect.left, y: r.top + r.height/2 - wrapRect.top };
}

/* Kinematic Hand Builder:
   Computes natural anatomical proportions and whole-hand reach motion so fingers
   never stretch like elastic rubber noodles across the screen. */
function buildHand(hand, fingers, wrapRect, activeF, targetKey){
  const inward = hand === 'L' ? 1 : -1;
  const outward = -inward;

  // Defensive fallback: ensure right pinky is always anchored even if external buffer dropped it
  if(hand === 'R' && !fingers.some(f=> f.kind === 'pinky')){
    const rpDef = {id:'rp', hand:'R', home:'semicolon', kind:'pinky', baseW:12.5, tipW:7.5, kDist:68, restLen:52, restAng:0.10};
    fingers.push(rpDef);
    if(!FINGERS.some(f=> f.id === 'rp')) FINGERS.push(rpDef);
  }

  const homes = {};
  fingers.forEach(f=>{
    if(f.kind === 'thumb') return;
    const c = keyCenter(f.home, wrapRect);
    if(c) homes[f.id] = c;
  });

  // If semicolon key center failed to resolve for right pinky, approximate from ring finger
  if(hand === 'R' && (!homes['rp'] || !fingers.some(f=> f.id === 'rp'))){
    const ring = fingers.find(f=> f.kind === 'ring');
    if(ring && homes[ring.id]){
      homes['rp'] = { x: homes[ring.id].x + 58, y: homes[ring.id].y };
    }
  }

  const order = ['pinky','ring','middle','index'].map(k=>fingers.find(f=>f.kind===k));
  if(order.some(f=> !f || !homes[f.id])) return null;

  // Whole-hand reach translation (fingers float palm; thumbs articulate independently)
  let shiftX = 0, shiftY = 0;
  if(activeF && activeF.kind !== 'thumb' && targetKey){
    const targetPt = keyCenter(targetKey, wrapRect);
    const homePt = keyCenter(activeF.home, wrapRect);
    if(targetPt && homePt){
      const reachDx = targetPt.x - homePt.x;
      const reachDy = targetPt.y - homePt.y;
      const factorY = (activeF.kind === 'pinky') ? 0.72 : (reachDy < 0 ? 0.65 : 0.45);
      const factorX = (activeF.kind === 'pinky') ? 0.62 : (reachDy < 0 ? 0.45 : 0.40);
      shiftY = reachDy * factorY;
      shiftX = reachDx * factorX;
    }
  }

  // Resting knuckles position: natural anatomical arch below resting key centers
  const baseKnuckles = {};
  order.forEach(f=>{
    const h = homes[f.id];
    const ang = f.restAng;
    const kx = h.x - Math.sin(ang) * f.kDist + shiftX;
    const ky = h.y + Math.cos(ang) * f.kDist + shiftY;
    baseKnuckles[f.id] = { x: kx, y: ky };
  });

  const knucklePts = order.map(f=> baseKnuckles[f.id]);
  const indexBase = knucklePts[3];
  const pinkyBase = knucklePts[0];

  // Anatomical thumb base seated on the lower-inner palm (thenar eminence) below Spacebar level
  const thumbF = fingers.find(f=>f.kind==='thumb');
  const spaceElForHand = keyEls['space'];
  let spaceMidY = indexBase.y + 28;
  if(spaceElForHand){
    const sr = spaceElForHand.getBoundingClientRect();
    if(sr.height > 0){
      spaceMidY = (sr.top + sr.height * 0.46) - wrapRect.top;
    }
  }
  const thumbBase = {
    x: indexBase.x + inward * 12,
    y: Math.min(wrapRect.height - 12, Math.max(indexBase.y + 42, spaceMidY + 20 + shiftY * 0.35))
  };
  baseKnuckles[thumbF.id] = thumbBase;

  // Ergonomic human palm contour encompassing all 4 MCP knuckles + inner thenar thumb pad
  const palmHeight = 68;
  const maxKnuckleY = Math.max(...knucklePts.map(p=>p.y));
  const wristCenter = {
    x: (knucklePts[1].x + knucklePts[2].x)/2 + outward * 2,
    y: Math.min(wrapRect.height - 6, Math.max(maxKnuckleY + palmHeight, thumbBase.y + 14))
  };
  const wristWidth = 68;
  const wristOuter = { x: wristCenter.x + outward * (wristWidth * 0.50), y: wristCenter.y };
  const wristInner = { x: wristCenter.x + inward * (wristWidth * 0.46), y: wristCenter.y };

  const topOuter = { x: pinkyBase.x + outward * 9, y: pinkyBase.y + 1 };
  const k0 = { x: pinkyBase.x, y: pinkyBase.y - 5 };
  const k1 = { x: knucklePts[1].x, y: knucklePts[1].y - 6 };
  const k2 = { x: knucklePts[2].x, y: knucklePts[2].y - 6 };
  const k3 = { x: indexBase.x, y: indexBase.y - 5 };
  const topInner = { x: indexBase.x + inward * 9, y: indexBase.y + 3 };
  const thenarUpper = { x: thumbBase.x + inward * 9, y: thumbBase.y - 8 };
  const thenarLower = { x: thumbBase.x + inward * 6, y: thumbBase.y + 9 };
  const hypothenar = { x: topOuter.x + outward * 3, y: (topOuter.y + wristOuter.y) * 0.54 };

  const outline = [
    topOuter,
    k0, k1, k2, k3,
    topInner,
    thenarUpper,
    thenarLower,
    wristInner,
    wristOuter,
    hypothenar
  ];
  const palmPath = roundedPolyPath(outline, 16);

  const cx = (topOuter.x + wristInner.x)/2, cy = (topOuter.y + wristOuter.y)/2;
  const shadeOutline = outline.map(p=> add(p, scalePt(sub({x:cx,y:cy}, p), 0.18)));
  const shadePath = roundedPolyPath(shadeOutline, 14);

  const highlight = {
    cx: (topOuter.x + knucklePts[1].x)/2 + outward*3,
    cy: topOuter.y + 10,
    rx: 26, ry: 14
  };

  return { bases: baseKnuckles, palmPath, shadePath, highlight, core:{x:cx, y:cy}, shiftX, shiftY };
}

function updateHandsOverlay(){
  if(!handsOverlay) return;
  if(!handsOn){
    handsOverlay.classList.add('hidden');
    handsOverlay.style.display = 'none';
    return;
  }
  handsOverlay.classList.remove('hidden');
  handsOverlay.style.display = '';
  const wrapRect = boardWrap.getBoundingClientRect();
  if(!wrapRect.width || !wrapRect.height) return;
  handsOverlay.setAttribute('viewBox', `0 0 ${wrapRect.width} ${wrapRect.height}`);
  handsOverlay.setAttribute('width', wrapRect.width);
  handsOverlay.setAttribute('height', wrapRect.height);

  // Resilient safeguards: guarantee right pinky is always present in FINGERS and DOM
  if(!FINGERS.some(f => f.id === 'rp')){
    const rpDef = {id:'rp', hand:'R', home:'semicolon', kind:'pinky', baseW:13.0, tipW:8.5, kDist:64, restLen:52, restAng:0.09};
    FINGERS.push(rpDef);
  }
  if(!fingerEls['rp']){
    const rpDef = FINGERS.find(f => f.id === 'rp') || {id:'rp', hand:'R', home:'semicolon', kind:'pinky', baseW:13.0, tipW:8.5, kDist:64, restLen:52, restAng:0.09};
    createFingerElement(rpDef);
  }

  const leftFingers = FINGERS.filter(f=>f.hand==='L');
  const rightFingers = FINGERS.filter(f=>f.hand==='R');

  const activeLeft = leftFingers.find(f=> f.id === activeFinger) || leftFingers.find(f=> f.id === activeShiftFinger);
  const targetLeft = activeLeft ? (activeLeft.id === activeFinger ? activeTargetKey : activeShiftTargetKey) : null;

  const activeRight = rightFingers.find(f=> f.id === activeFinger) || rightFingers.find(f=> f.id === activeShiftFinger);
  const targetRight = activeRight ? (activeRight.id === activeFinger ? activeTargetKey : activeShiftTargetKey) : null;

  const handL = buildHand('L', leftFingers, wrapRect, activeLeft, targetLeft);
  const handR = buildHand('R', rightFingers, wrapRect, activeRight, targetRight);

  if(handL){
    palmShapeL.setAttribute('d', handL.palmPath);
    palmShadeL.setAttribute('d', handL.shadePath);
    palmHiL.setAttribute('cx', handL.highlight.cx); palmHiL.setAttribute('cy', handL.highlight.cy);
    palmHiL.setAttribute('rx', handL.highlight.rx); palmHiL.setAttribute('ry', handL.highlight.ry);
    palmCoreL.setAttribute('cx', handL.core.x); palmCoreL.setAttribute('cy', handL.core.y);
  }
  if(handR){
    palmShapeR.setAttribute('d', handR.palmPath);
    palmShadeR.setAttribute('d', handR.shadePath);
    palmHiR.setAttribute('cx', handR.highlight.cx); palmHiR.setAttribute('cy', handR.highlight.cy);
    palmHiR.setAttribute('rx', handR.highlight.rx); palmHiR.setAttribute('ry', handR.highlight.ry);
    palmCoreR.setAttribute('cx', handR.core.x); palmCoreR.setAttribute('cy', handR.core.y);
  }

  FINGERS.forEach(f=>{
    const fe = fingerEls[f.id];
    const hb = f.hand === 'L' ? handL : handR;
    if(!hb || !hb.bases[f.id]) return;
    const origin = hb.bases[f.id];
    const isPrimary = activeFinger === f.id;
    const isShiftActive = activeShiftFinger === f.id;
    const isActive = isPrimary || isShiftActive;
    const targetKey = isPrimary && activeTargetKey ? activeTargetKey
      : (isShiftActive && activeShiftTargetKey ? activeShiftTargetKey : null);
    const inward = f.hand === 'L' ? 1 : -1;

    let tip;
    if(f.kind === 'thumb'){
      if(isActive && targetKey){
        tip = keyCenter(targetKey, wrapRect);
        if(targetKey === 'space'){
          const spaceEl = keyEls['space'];
          if(spaceEl){
            const r = spaceEl.getBoundingClientRect();
            const frac = f.hand === 'L' ? 0.36 : 0.64;
            const rawX = r.left + r.width * frac - wrapRect.left;
            const rawY = r.top + r.height * 0.44 - wrapRect.top;
            tip = {
              x: f.hand === 'L' ? Math.max(origin.x + 28, rawX) : Math.min(origin.x - 28, rawX),
              y: Math.min(origin.y - 18, rawY)
            };
          }
        }
      } else {
        // Natural relaxed human thumb: angles upward and inward from the lower-inner palm onto the Spacebar
        const isHandMoving = Math.abs(hb.shiftX) > 4 || Math.abs(hb.shiftY) > 4;
        const spaceEl = keyEls['space'];
        if(!isHandMoving && spaceEl){
          const r = spaceEl.getBoundingClientRect();
          const frac = f.hand === 'L' ? 0.36 : 0.64;
          const rawX = r.left + r.width * frac - wrapRect.left;
          const rawY = r.top + r.height * 0.46 - wrapRect.top;
          tip = {
            x: f.hand === 'L' ? Math.max(origin.x + 28, rawX) : Math.min(origin.x - 28, rawX),
            y: Math.min(origin.y - 18, rawY)
          };
        } else {
          tip = { x: origin.x + inward * 28, y: origin.y - 22 };
        }
      }
    } else {
      if(isActive && targetKey){
        // Active finger reaches directly to the key
        tip = keyCenter(targetKey, wrapRect) || keyCenter(f.home, wrapRect);
      } else {
        // Inactive fingers: if hand moved, float gracefully; if at rest, sit directly on home key
        const homeCenter = keyCenter(f.home, wrapRect);
        if(homeCenter){
          if(Math.abs(hb.shiftX) > 3 || Math.abs(hb.shiftY) > 3){
            // Hand is in motion: retain relaxed finger length relative to moving knuckle
            const restVec = {
              x: Math.sin(f.restAng) * f.restLen,
              y: -Math.cos(f.restAng) * f.restLen
            };
            tip = { x: origin.x + restVec.x, y: origin.y + restVec.y };
          } else {
            // Hand at rest: fingertip rests gently on home key center
            tip = homeCenter;
          }
        }
      }
    }
    if(!tip) return;

    // Strict physiological maximum reach: human fingers cannot stretch beyond their bone length
    const maxLen = f.kind === 'thumb' ? 56 : (f.kind === 'pinky' ? 74 : (f.kind === 'middle' ? 95 : 88));
    const d = dist(origin, tip);
    if(d > maxLen){
      const scale = maxLen / d;
      tip = { x: origin.x + (tip.x - origin.x) * scale, y: origin.y + (tip.y - origin.y) * scale };
    }
    let mid;
    if(f.kind === 'thumb'){
      mid = {
        x: (origin.x + tip.x) * 0.5 - inward * 3.5,
        y: (origin.y + tip.y) * 0.5 - 4.5
      };
    } else {
      const bow = Math.min(14, d * 0.11);
      mid = { x: (origin.x + tip.x) * 0.5, y: (origin.y + tip.y) * 0.5 - bow };
    }

    const frame = fingerFrame(origin, mid, tip, f.baseW, f.tipW);
    fe.shape.setAttribute('d', frameToPath(frame, f.baseW, f.tipW));

    if(f.kind === 'thumb'){
      // Human thumb has 1 interphalangeal (IP) joint along the free shaft
      fe.crease1.setAttribute('d', creaseAt(frame, 0.52));
      fe.crease2.setAttribute('d', '');
      const j1 = pointAtFrame(frame, 0.52);
      fe.joint1.setAttribute('cx', j1.x); fe.joint1.setAttribute('cy', j1.y);
      fe.joint1.setAttribute('r', Math.max(1.5, f.baseW * 0.14));
      fe.joint2.setAttribute('r', '0');
    } else {
      fe.crease1.setAttribute('d', creaseAt(frame, 0.42));
      fe.crease2.setAttribute('d', creaseAt(frame, 0.72));
      const j1 = pointAtFrame(frame, 0.42), j2 = pointAtFrame(frame, 0.72);
      fe.joint1.setAttribute('cx', j1.x); fe.joint1.setAttribute('cy', j1.y);
      fe.joint1.setAttribute('r', Math.max(1.5, f.baseW * 0.15));
      fe.joint2.setAttribute('cx', j2.x); fe.joint2.setAttribute('cy', j2.y);
      fe.joint2.setAttribute('r', Math.max(1.2, f.tipW * 0.15));
    }

    // Soft anatomical edge highlight along the dorsal ridge (not cutting across the center)
    const sStart = 3, sMid = 9, sEnd = 14;
    const cStart = pointAtFrame(frame, sStart / 18), cMid = pointAtFrame(frame, sMid / 18), cEnd = pointAtFrame(frame, sEnd / 18);
    const sh1 = { x: cStart.x + (frame.left[sStart].x - cStart.x) * 0.62, y: cStart.y + (frame.left[sStart].y - cStart.y) * 0.62 };
    const sh2 = { x: cMid.x + (frame.left[sMid].x - cMid.x) * 0.62, y: cMid.y + (frame.left[sMid].y - cMid.y) * 0.62 };
    const sh3 = { x: cEnd.x + (frame.left[sEnd].x - cEnd.x) * 0.62, y: cEnd.y + (frame.left[sEnd].y - cEnd.y) * 0.62 };
    fe.shine.setAttribute('d', `M ${sh1.x.toFixed(1)} ${sh1.y.toFixed(1)} Q ${sh2.x.toFixed(1)} ${sh2.y.toFixed(1)} ${sh3.x.toFixed(1)} ${sh3.y.toFixed(1)}`);
    fe.shine2.setAttribute('d', '');
    fe.energy.setAttribute('d', `M ${origin.x.toFixed(1)} ${origin.y.toFixed(1)} Q ${mid.x.toFixed(1)} ${mid.y.toFixed(1)} ${tip.x.toFixed(1)} ${tip.y.toFixed(1)}`);

    const nailPt = qPoint(origin, mid, tip, 0.88);
    const tan = qTangent(origin, mid, tip, 0.88);
    const ang = Math.atan2(tan.y, tan.x) * 180/Math.PI + 90;
    fe.nail.setAttribute('cx', nailPt.x); fe.nail.setAttribute('cy', nailPt.y);
    fe.nail.setAttribute('rx', Math.max(2.6, f.tipW * 0.32)); fe.nail.setAttribute('ry', Math.max(3.0, f.tipW * 0.36));
    fe.nail.setAttribute('transform', `rotate(${ang.toFixed(1)} ${nailPt.x.toFixed(1)} ${nailPt.y.toFixed(1)})`);

    fe.tip.setAttribute('cx', nailPt.x);
    fe.tip.setAttribute('cy', nailPt.y);
    fe.impactRing.setAttribute('cx', nailPt.x);
    fe.impactRing.setAttribute('cy', nailPt.y);
    fe.impactRing2.setAttribute('cx', nailPt.x);
    fe.impactRing2.setAttribute('cy', nailPt.y);
    fe.impactSparks.setAttribute('transform', `translate(${nailPt.x.toFixed(1)} ${nailPt.y.toFixed(1)})`);
    fe.reticle.setAttribute('transform', `translate(${nailPt.x.toFixed(1)} ${nailPt.y.toFixed(1)})`);
    fe.g.classList.toggle('active', isActive);
  });
}

function setActiveFinger(keyId, layer){
  activeFinger = keyId ? (KEY_FINGER[keyId] || null) : null;
  activeTargetKey = keyId;
  const lyr = layer || (keyId ? currentLayer() : null);
  const mod = modifierInfoFor(keyId, lyr);
  if(mod){
    activeShiftFinger = mod.fingerId;
    activeShiftTargetKey = mod.targetKey;
  } else {
    activeShiftFinger = null;
    activeShiftTargetKey = null;
  }
  updateHandsOverlay();
}

/* the instant a key is struck: flashes the finger and sends a bright
   expanding ring + spark burst out from the fingertip */
function strikeFinger(fe){
  if(!fe || !handsOn) return;
  fe.g.classList.remove('struck');
  void fe.g.getBoundingClientRect(); // restart finger flash without sparks
  fe.g.classList.add('struck');
  clearTimeout(fe._strikeT1);
  fe._strikeT1 = setTimeout(()=> fe.g.classList.remove('struck'), 160);
}

/* fired the instant a key is struck: flashes the correct finger and sends
   a bright expanding ring out from the fingertip, on top of the steady
   "next key" glow from setActiveFinger/lesson guidance. When the struck
   key lives on a modifier layer (Shift, Ctrl, AltGr), the modifier finger
   flashes on the modifier key at the same moment, as if it were held down for the combo. */
let freeTypeFingerResetTimer = null;
function triggerFingerPress(keyId){
  if(!handsOn) return;
  const fid = keyId ? KEY_FINGER[keyId] : null;
  if(!fid) return;
  const lyr = currentLayer();

  const isGuidedSession = (typeof lessonActive !== 'undefined' && lessonActive) ||
                          (typeof raceActive !== 'undefined' && raceActive) ||
                          Boolean(window.adaptiveActive);
  if(!isGuidedSession){
    setActiveFinger(keyId, lyr);
    clearTimeout(freeTypeFingerResetTimer);
    freeTypeFingerResetTimer = setTimeout(()=>{
      const stillUnguided = !(typeof lessonActive !== 'undefined' && lessonActive) &&
                            !(typeof raceActive !== 'undefined' && raceActive) &&
                            !window.adaptiveActive;
      if(stillUnguided && activeTargetKey === keyId){
        setActiveFinger(null);
      }
    }, 650);
  }

  strikeFinger(fingerEls[fid]);

  if(lyr && lyr !== 'base'){
    const mod = modifierInfoFor(keyId, lyr);
    if(mod && mod.fingerId && mod.fingerId !== fid) strikeFinger(fingerEls[mod.fingerId]);
  }
}
window.triggerFingerPress = triggerFingerPress;

function syncHandsToggleUI(){
  if(!handsToggle) return;
  window.handsOn = handsOn;
  handsToggle.classList.toggle('on', handsOn);
  handsToggle.setAttribute('aria-pressed', handsOn ? 'true' : 'false');
  const isKm = document.documentElement.classList.contains('site-km-mode');
  const enText = 'Finger guide' + (handsOn ? '' : ' (off)');
  const kmText = 'មគ្គុទ្ទេសក៍ម្រាមដៃ' + (handsOn ? '' : ' (បិទ)');
  handsToggle.innerHTML = `${pkIcon('keyboard', 15)} <span class="i18n-t" data-en="${enText}" data-km="${kmText}">${isKm ? kmText : enText}</span>`;
  if(window.PKQuickGuide && typeof window.PKQuickGuide.updateToolStatuses === 'function'){
    window.PKQuickGuide.updateToolStatuses();
  }
}
window.syncHandsToggleUI = syncHandsToggleUI;

handsToggle.addEventListener('click', ()=>{
  handsOn = !handsOn;
  syncHandsToggleUI();
  updateHandsOverlay();
});

window.addEventListener('resize', updateHandsOverlay);


function currentLayer(){
  return physicalLayer || hoverLayer || lockedLayer || 'base';
}

let lastLayer;

function render(){
  const layer = currentLayer();
  lastLayer = layer;

  document.querySelectorAll('.glyph').forEach(g=>{
    const val = g.dataset[layer] !== undefined ? g.dataset[layer] : g.dataset.base;
    if(g.textContent !== val) g.textContent = val;
    g.parentElement.classList.toggle('empty', !val);
  });

  const spaceEl = keyEls['space'];
  if(spaceEl){
    if(currentLayoutId === 'standard'){
      if(layer === 'shift'){
        spaceEl.innerHTML = '<span class="space-glyph">␣</span><span class="space-label">ដកឃ្លា · Space</span>';
      } else {
        spaceEl.innerHTML = '<span class="space-glyph">្</span><span class="space-label">ជើង (Coeng)</span><span class="shift-badge">Space</span>';
      }
    } else if(currentLayoutId === 'nida'){
      if(layer === 'shift'){
        spaceEl.innerHTML = '<span class="space-glyph">␣</span><span class="space-label">ដកឃ្លា · Space</span>';
      } else {
        spaceEl.innerHTML = '<span class="space-glyph">␣</span><span class="space-label">ដកឃ្លា · Spacebar</span>';
      }
    } else {
      spaceEl.innerHTML = '<span class="space-label">Space</span>';
    }
  }

  boardWrap.classList.toggle('layer-ctrl', layer === 'ctrl');
  boardWrap.classList.toggle('layer-altgr', layer === 'altgr');
  boardWrap.classList.toggle('layer-shift', layer === 'shift');

  document.querySelectorAll('[data-pill]').forEach(p=>{
    p.classList.toggle('active', p.dataset.pill === layer);
  });

  document.querySelectorAll('.key-ctrl').forEach(el=> el.classList.toggle('locked', lockedLayer==='ctrl'));
  document.querySelectorAll('.key-altgr').forEach(el=> el.classList.toggle('locked', lockedLayer==='altgr'));
  document.querySelectorAll('.key-shift').forEach(el=> el.classList.toggle('locked', lockedLayer==='shift'));
}


function applyKeyboardData(data){
  if(!data) return;
  if(data.LAYOUTS) Object.assign(LAYOUTS, data.LAYOUTS);
  if(data.KEY_FINGER) Object.assign(KEY_FINGER, data.KEY_FINGER);
  if(data.CODE_MAP) Object.assign(CODE_MAP, data.CODE_MAP);
}
window.renderHands = updateHandsOverlay;
window.updateHandsOverlay = updateHandsOverlay;
