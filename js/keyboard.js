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
  {id:'lp', hand:'L', home:'a', kind:'pinky',  baseW:33.5, tipW:19.5, kDist:76, restLen:72, restAng:-0.08, archPull:0.26, archDy:7,  tipDy:8},
  {id:'lr', hand:'L', home:'s', kind:'ring',   baseW:36.0, tipW:21.8, kDist:74, restLen:76, restAng:-0.03, archPull:0.24, archDy:-1, tipDy:0},
  {id:'lm', hand:'L', home:'d', kind:'middle', baseW:37.8, tipW:23.2, kDist:72, restLen:82, restAng:0.00,  archPull:0.24, archDy:-6, tipDy:-6},
  {id:'li', hand:'L', home:'f', kind:'index',  baseW:36.8, tipW:22.6, kDist:74, restLen:76, restAng:0.04,  archPull:0.25, archDy:-1, tipDy:1},
  {id:'lt', hand:'L', home:'space', kind:'thumb', baseW:38.0, tipW:23.5, kDist:66, restLen:68, restAng:0.52, archPull:0, archDy:0, tipDy:0},
  {id:'rt', hand:'R', home:'space', kind:'thumb', baseW:38.0, tipW:23.5, kDist:66, restLen:68, restAng:-0.52, archPull:0, archDy:0, tipDy:0},
  {id:'ri', hand:'R', home:'j', kind:'index',  baseW:36.8, tipW:22.6, kDist:74, restLen:76, restAng:-0.04, archPull:0.25, archDy:-1, tipDy:1},
  {id:'rm', hand:'R', home:'k', kind:'middle', baseW:37.8, tipW:23.2, kDist:72, restLen:82, restAng:0.00,  archPull:0.24, archDy:-6, tipDy:-6},
  {id:'rr', hand:'R', home:'l', kind:'ring',   baseW:36.0, tipW:21.8, kDist:74, restLen:76, restAng:0.03,  archPull:0.24, archDy:-1, tipDy:0},
  {id:'rp', hand:'R', home:'semicolon', kind:'pinky', baseW:33.5, tipW:19.5, kDist:76, restLen:72, restAng:0.08, archPull:0.26, archDy:7, tipDy:8},
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

/* build a smooth tapered, sculpted human finger silhouette between origin and tip */
function fingerFrame(origin, ctrl, tip, baseW, tipW, isThumb = false){
  const N = 18, left = [], right = [];
  for(let i=0;i<=N;i++){
    const s = i/N;
    const p = qPoint(origin, ctrl, tip, s);
    const tan = qTangent(origin, ctrl, tip, s);
    const l = Math.hypot(tan.x,tan.y) || 1;
    // Left-hand normal in screen coordinates (+X right, +Y down) so left[] is true screen-left of upward finger
    const nx = tan.y/l, ny = -tan.x/l;
    const wProfile = Math.pow(s, 0.76);
    let w = (baseW * (1 - wProfile) + tipW * wProfile) * 0.5;
    if(!isThumb){
      const pipSwell = 0.85 * Math.exp(-Math.pow((s - 0.48) / 0.13, 2));
      const dipSwell = 0.45 * Math.exp(-Math.pow((s - 0.76) / 0.10, 2));
      w += pipSwell + dipSwell;
    } else {
      const mcpSwell = 1.6 * Math.exp(-Math.pow((s - 0.32) / 0.20, 2));
      const ipSwell = 0.8 * Math.exp(-Math.pow((s - 0.68) / 0.14, 2));
      w += mcpSwell + ipSwell;
    }
    left.push({x:p.x+nx*w, y:p.y+ny*w});
    right.push({x:p.x-nx*w, y:p.y-ny*w});
  }
  const rawTipTan = qTangent(origin, ctrl, tip, 1);
  const tipTanLen = Math.hypot(rawTipTan.x, rawTipTan.y) || 1;
  const tipTan = { x: rawTipTan.x / tipTanLen, y: rawTipTan.y / tipTanLen };
  return {left, right, origin, ctrl, tip, tipTan, baseW, tipW, isThumb};
}

/* G1-continuous cubic Bezier fingertip pad cap between any two tip edges */
function tipCapBetween(fromPt, toPt, tipTan, tipW, isThumb = false){
  const capReach = tipW * (isThumb ? 0.52 : 0.55);
  const c1 = { x: fromPt.x + tipTan.x * capReach, y: fromPt.y + tipTan.y * capReach };
  const c2 = { x: toPt.x + tipTan.x * capReach, y: toPt.y + tipTan.y * capReach };
  return `C ${c1.x.toFixed(1)} ${c1.y.toFixed(1)}, ${c2.x.toFixed(1)} ${c2.y.toFixed(1)}, ${toPt.x.toFixed(1)} ${toPt.y.toFixed(1)} `;
}

/* Open-base finger path for active finger illumination (no circular seam across knuckle) */
function frameToPath(frame, baseW, tipW){
  const {left, right, tipTan, isThumb} = frame;
  const startIdx = isThumb ? 7 : 4;
  const n = left.length - 1;
  let d = `M ${left[startIdx].x.toFixed(1)} ${left[startIdx].y.toFixed(1)} `;
  for(let i = startIdx + 1; i <= n; i++) d += `L ${left[i].x.toFixed(1)} ${left[i].y.toFixed(1)} `;
  d += tipCapBetween(left[n], right[n], tipTan, tipW, isThumb);
  for(let i = n - 1; i >= startIdx; i--) d += `L ${right[i].x.toFixed(1)} ${right[i].y.toFixed(1)} `;
  return d;
}

/* Anatomical squoval fingernail plate path (curved cuticle, straight lateral folds, arched free edge) */
function buildNailPath(frame){
  const { tip, tipTan, tipW, isThumb } = frame;
  const nx = -tipTan.y;
  const ny = tipTan.x;
  const nw = tipW * (isThumb ? 0.33 : 0.31);
  const nl = tipW * (isThumb ? 0.55 : 0.62);
  const center = {
    x: tip.x - tipTan.x * (nl * 0.22),
    y: tip.y - tipTan.y * (nl * 0.22)
  };
  const top = { x: center.x + tipTan.x * (nl * 0.56), y: center.y + tipTan.y * (nl * 0.56) };
  const bot = { x: center.x - tipTan.x * (nl * 0.44), y: center.y - tipTan.y * (nl * 0.44) };

  const tl = { x: top.x - nx * (nw * 0.88), y: top.y - ny * (nw * 0.88) };
  const tr = { x: top.x + nx * (nw * 0.88), y: top.y + ny * (nw * 0.88) };
  const bl = { x: bot.x - nx * (nw * 0.94), y: bot.y - ny * (nw * 0.94) };
  const br = { x: bot.x + nx * (nw * 0.94), y: bot.y + ny * (nw * 0.94) };

  const topCtrlL = { x: top.x - nx * (nw * 0.44) + tipTan.x * 2.5, y: top.y - ny * (nw * 0.44) + tipTan.y * 2.5 };
  const topCtrlR = { x: top.x + nx * (nw * 0.44) + tipTan.x * 2.5, y: top.y + ny * (nw * 0.44) + tipTan.y * 2.5 };
  const botCtrlR = { x: bot.x + nx * (nw * 0.46) - tipTan.x * 1.8, y: bot.y + ny * (nw * 0.46) - tipTan.y * 1.8 };
  const botCtrlL = { x: bot.x - nx * (nw * 0.46) - tipTan.x * 1.8, y: bot.y - ny * (nw * 0.46) - tipTan.y * 1.8 };

  return `M ${bl.x.toFixed(1)} ${bl.y.toFixed(1)} L ${tl.x.toFixed(1)} ${tl.y.toFixed(1)} C ${topCtrlL.x.toFixed(1)} ${topCtrlL.y.toFixed(1)} ${topCtrlR.x.toFixed(1)} ${topCtrlR.y.toFixed(1)} ${tr.x.toFixed(1)} ${tr.y.toFixed(1)} L ${br.x.toFixed(1)} ${br.y.toFixed(1)} C ${botCtrlR.x.toFixed(1)} ${botCtrlR.y.toFixed(1)} ${botCtrlL.x.toFixed(1)} ${botCtrlL.y.toFixed(1)} ${bl.x.toFixed(1)} ${bl.y.toFixed(1)} Z`;
}

function creaseAt(frame, s){
  const { origin, ctrl, tip, baseW, tipW } = frame;
  const pt = qPoint(origin, ctrl, tip, s);
  const rawTan = qTangent(origin, ctrl, tip, s);
  const len = Math.hypot(rawTan.x, rawTan.y) || 1;
  const tan = { x: rawTan.x / len, y: rawTan.y / len };
  const nx = -tan.y, ny = tan.x;
  const w = (baseW * (1 - s) + tipW * s) * 0.25;
  const p1 = { x: pt.x - nx * w, y: pt.y - ny * w };
  const p2 = { x: pt.x + nx * w, y: pt.y + ny * w };
  const cp = { x: pt.x - tan.x * 1.3, y: pt.y - tan.y * 1.3 };
  return `M ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} Q ${cp.x.toFixed(1)} ${cp.y.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
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
    strokeRgba: `rgba(${r}, ${g}, ${b}, 0.62)`,
    shadowRgba: `rgba(${r}, ${g}, ${b}, 0.32)`,
    nailFillRgba: `rgba(${r}, ${g}, ${b}, 0.28)`,
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
  <linearGradient id="fingerGrad" x1="0" y1="1" x2="0.2" y2="0">
    <stop offset="0%" stop-color="${palL.mid}" stop-opacity="0"/>
    <stop offset="35%" stop-color="${palL.mid}" stop-opacity="0.22"/>
    <stop offset="85%" stop-color="${palL.bright}" stop-opacity="0.45"/>
    <stop offset="100%" stop-color="${palL.light}" stop-opacity="0.65"/>
  </linearGradient>
  <linearGradient id="fingerGradR" x1="0" y1="1" x2="0.2" y2="0">
    <stop offset="0%" stop-color="${palR.mid}" stop-opacity="0"/>
    <stop offset="35%" stop-color="${palR.mid}" stop-opacity="0.22"/>
    <stop offset="85%" stop-color="${palR.bright}" stop-opacity="0.45"/>
    <stop offset="100%" stop-color="${palR.light}" stop-opacity="0.65"/>
  </linearGradient>
  <linearGradient id="fingerGradActive" x1="0" y1="1" x2="0.15" y2="0">
    <stop offset="0%" stop-color="${palL.deep}" stop-opacity="0"/>
    <stop offset="20%" stop-color="${palL.bright}" stop-opacity="0.65"/>
    <stop offset="62%" stop-color="${palL.bright}" stop-opacity="0.92"/>
    <stop offset="86%" stop-color="#ffd166" stop-opacity="0.98"/>
    <stop offset="100%" stop-color="#ffffff" stop-opacity="1"/>
  </linearGradient>
  <linearGradient id="fingerGradActiveR" x1="0" y1="1" x2="0.15" y2="0">
    <stop offset="0%" stop-color="${palR.deep}" stop-opacity="0"/>
    <stop offset="20%" stop-color="${palR.bright}" stop-opacity="0.65"/>
    <stop offset="62%" stop-color="${palR.bright}" stop-opacity="0.92"/>
    <stop offset="86%" stop-color="#ffd166" stop-opacity="0.98"/>
    <stop offset="100%" stop-color="#ffffff" stop-opacity="1"/>
  </linearGradient>
  <linearGradient id="palmGrad" x1="0" y1="1" x2="0.18" y2="0">
    <stop offset="0%" stop-color="${palL.dark}" stop-opacity="0.62"/>
    <stop offset="36%" stop-color="${palL.deep}" stop-opacity="0.76"/>
    <stop offset="68%" stop-color="${palL.mid}" stop-opacity="0.86"/>
    <stop offset="90%" stop-color="${palL.bright}" stop-opacity="0.93"/>
    <stop offset="100%" stop-color="${palL.light}" stop-opacity="0.97"/>
  </linearGradient>
  <linearGradient id="palmGradR" x1="0" y1="1" x2="0.18" y2="0">
    <stop offset="0%" stop-color="${palR.dark}" stop-opacity="0.62"/>
    <stop offset="36%" stop-color="${palR.deep}" stop-opacity="0.76"/>
    <stop offset="68%" stop-color="${palR.mid}" stop-opacity="0.86"/>
    <stop offset="90%" stop-color="${palR.bright}" stop-opacity="0.93"/>
    <stop offset="100%" stop-color="${palR.light}" stop-opacity="0.97"/>
  </linearGradient>
  <radialGradient id="palmHighlight" cx="50%" cy="45%" r="52%">
    <stop offset="0%" stop-color="${palL.bright}" stop-opacity="0.42"/>
    <stop offset="100%" stop-color="${palL.bright}" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="palmHighlightR" cx="50%" cy="45%" r="52%">
    <stop offset="0%" stop-color="${palR.bright}" stop-opacity="0.42"/>
    <stop offset="100%" stop-color="${palR.bright}" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="jointGlow" cx="50%" cy="50%" r="50%">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0"/>
    <stop offset="100%" stop-color="${palL.mid}" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="jointGlowR" cx="50%" cy="50%" r="50%">
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0"/>
    <stop offset="100%" stop-color="${palR.mid}" stop-opacity="0"/>
  </radialGradient>
  <filter id="handShadow" x="-35%" y="-35%" width="170%" height="170%">
    <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="${palL.bright}" flood-opacity="0.28"/>
    <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.42"/>
  </filter>
  <filter id="handShadowR" x="-35%" y="-35%" width="170%" height="170%">
    <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="${palR.bright}" flood-opacity="0.28"/>
    <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.42"/>
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
  const nail = document.createElementNS(SVGNS,'path'); nail.setAttribute('class','finger-nail');
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
   Computes natural anatomical proportions, compact metacarpal arch, and whole-hand
   reach motion so all 5 digits and the palm fuse into a single seamless silhouette. */
function buildHand(hand, fingers, wrapRect, activeF, targetKey){
  const inward = hand === 'L' ? 1 : -1;

  // Defensive fallback: ensure right pinky is always anchored even if external buffer dropped it
  if(hand === 'R' && !fingers.some(f=> f.kind === 'pinky')){
    const rpDef = {id:'rp', hand:'R', home:'semicolon', kind:'pinky', baseW:33.5, tipW:19.5, archPull:0.26, archDy:7, tipDy:8, kDist:76, restLen:72, restAng:0.08};
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

  // Compact human metacarpal knuckle arch ~74px below home row centers for realistic 75-85px fingers
  const homeXs = order.map(f=> homes[f.id].x);
  const homeYs = order.map(f=> homes[f.id].y);
  const homeSpanCenterX = (homeXs[0] + homeXs[3]) * 0.5 + inward * 4;
  const homeAvgY = homeYs.reduce((a, b)=> a + b, 0) / 4;
  const palmArchBaseY = homeAvgY + 74;

  const baseKnuckles = {};
  order.forEach(f=>{
    const h = homes[f.id];
    const pull = typeof f.archPull === 'number' ? f.archPull : 0.24;
    const dy = typeof f.archDy === 'number' ? f.archDy : 0;
    const kx = h.x + (homeSpanCenterX - h.x) * pull + shiftX;
    const ky = palmArchBaseY + dy + shiftY;
    baseKnuckles[f.id] = { x: kx, y: ky };
  });

  const indexBase = baseKnuckles[order[3].id];

  // Anatomical thumb CMC/thenar base at the lower radial palm
  const thumbF = fingers.find(f=>f.kind==='thumb');
  const spaceElForHand = keyEls['space'];
  let spaceMidY = indexBase.y + 36;
  if(spaceElForHand){
    const sr = spaceElForHand.getBoundingClientRect();
    if(sr.height > 0){
      spaceMidY = (sr.top + sr.height * 0.50) - wrapRect.top;
    }
  }
  const thumbBase = {
    x: indexBase.x - inward * 6,
    y: indexBase.y + 66
  };
  baseKnuckles[thumbF.id] = thumbBase;

  return {
    bases: baseKnuckles,
    homes,
    order,
    thumbF,
    spaceMidY,
    shiftX,
    shiftY
  };
}

/* Generates a single unified, mirror-symmetric SVG contour tracing the entire human hand
   (pinky -> ring -> middle -> index -> purlicue web -> thumb -> radial wrist -> ulnar wrist) */
function buildUnifiedHandSVG(hand, order, thumbF, frames, bases){
  const isLeft = hand === 'L';
  const dir = isLeft ? 1 : -1;
  const n = 18;

  const fingerList = order.map(f => {
    const fr = frames[f.id];
    return {
      f,
      fr,
      outerPts: isLeft ? fr.left : fr.right,
      innerPts: isLeft ? fr.right : fr.left
    };
  });

  const thumbFr = frames[thumbF.id];
  const thumbInnerPts = isLeft ? thumbFr.left : thumbFr.right;
  const thumbOuterPts = isLeft ? thumbFr.right : thumbFr.left;

  const pinkyBase = bases[order[0].id];
  const indexBase = bases[order[3].id];

  const cmds = [];
  const p0 = fingerList[0].outerPts[2];
  cmds.push(`M ${p0.x.toFixed(1)} ${p0.y.toFixed(1)}`);

  for(let fIdx = 0; fIdx < 4; fIdx++){
    const curr = fingerList[fIdx];
    const { outerPts, innerPts, fr, f } = curr;
    const startI = (fIdx === 0) ? 2 : 4;
    for(let i = startI + 1; i <= n; i++){
      cmds.push(`L ${outerPts[i].x.toFixed(1)} ${outerPts[i].y.toFixed(1)}`);
    }
    cmds.push(tipCapBetween(outerPts[n], innerPts[n], fr.tipTan, f.tipW, false));

    const endI = 4;
    for(let i = n - 1; i >= endI; i--){
      cmds.push(`L ${innerPts[i].x.toFixed(1)} ${innerPts[i].y.toFixed(1)}`);
    }

    if(fIdx < 3){
      const next = fingerList[fIdx + 1];
      const nextStartI = 4;
      const pA = innerPts[endI];
      const pB = next.outerPts[nextStartI];
      const crotchDepth = 8.5;
      const midX = (pA.x + pB.x) * 0.5;
      const midY = Math.max(pA.y, pB.y) + crotchDepth;
      const wc1 = { x: pA.x + (midX - pA.x) * 0.35, y: midY };
      const wc2 = { x: pB.x - (pB.x - midX) * 0.35, y: midY };
      cmds.push(`C ${wc1.x.toFixed(1)} ${wc1.y.toFixed(1)} ${wc2.x.toFixed(1)} ${wc2.y.toFixed(1)} ${pB.x.toFixed(1)} ${pB.y.toFixed(1)}`);
    }
  }

  // Purlicue (thumb-index web): smooth U-saddle from index inner base to thumb inner edge
  const idxInnerEnd = fingerList[3].innerPts[4];
  const thumbInnerStartIdx = 8;
  const thumbInnerStart = thumbInnerPts[thumbInnerStartIdx];
  const webMidY = Math.max(idxInnerEnd.y, thumbInnerStart.y) + 7;
  const webC1 = { x: idxInnerEnd.x + dir * 2, y: webMidY - 2 };
  const webC2 = { x: thumbInnerStart.x - dir * 10, y: webMidY + 3 };
  cmds.push(`C ${webC1.x.toFixed(1)} ${webC1.y.toFixed(1)} ${webC2.x.toFixed(1)} ${webC2.y.toFixed(1)} ${thumbInnerStart.x.toFixed(1)} ${thumbInnerStart.y.toFixed(1)}`);

  // Thumb inner edge -> tip -> thumb outer edge (all the way down to CMC joint at index 2)
  for(let i = thumbInnerStartIdx + 1; i <= n; i++){
    cmds.push(`L ${thumbInnerPts[i].x.toFixed(1)} ${thumbInnerPts[i].y.toFixed(1)}`);
  }
  cmds.push(tipCapBetween(thumbInnerPts[n], thumbOuterPts[n], thumbFr.tipTan, thumbF.tipW, true));

  const thumbOuterEndIdx = 2;
  for(let i = n - 1; i >= thumbOuterEndIdx; i--){
    cmds.push(`L ${thumbOuterPts[i].x.toFixed(1)} ${thumbOuterPts[i].y.toFixed(1)}`);
  }

  // Seamless transition from thumb CMC outer edge into wide anatomical wrist (~102px wide)
  const thumbOuterBase = thumbOuterPts[thumbOuterEndIdx];
  const wristCenterX = (pinkyBase.x + indexBase.x) * 0.5 + dir * 4;
  const wristY = indexBase.y + 92;

  const wristInner = { x: wristCenterX + dir * 46, y: wristY - 2 };
  const wristOuter = { x: wristCenterX - dir * 56, y: wristY };

  const radC1 = { x: thumbOuterBase.x - dir * 10, y: thumbOuterBase.y + 10 };
  const radC2 = { x: wristInner.x + dir * 8, y: wristInner.y - 10 };
  cmds.push(`C ${radC1.x.toFixed(1)} ${radC1.y.toFixed(1)} ${radC2.x.toFixed(1)} ${radC2.y.toFixed(1)} ${wristInner.x.toFixed(1)} ${wristInner.y.toFixed(1)}`);

  const wristCtrl1 = { x: wristInner.x - dir * 28, y: wristY + 7 };
  const wristCtrl2 = { x: wristOuter.x + dir * 28, y: wristY + 7 };
  cmds.push(`C ${wristCtrl1.x.toFixed(1)} ${wristCtrl1.y.toFixed(1)} ${wristCtrl2.x.toFixed(1)} ${wristCtrl2.y.toFixed(1)} ${wristOuter.x.toFixed(1)} ${wristOuter.y.toFixed(1)}`);

  const ulnC1 = { x: wristOuter.x - dir * 8, y: wristOuter.y - 28 };
  const ulnC2 = { x: p0.x - dir * 4, y: p0.y + 30 };
  cmds.push(`C ${ulnC1.x.toFixed(1)} ${ulnC1.y.toFixed(1)} ${ulnC2.x.toFixed(1)} ${ulnC2.y.toFixed(1)} ${p0.x.toFixed(1)} ${p0.y.toFixed(1)} Z`);

  // Subtle dorsal extensor tendon lines on the back of the hand
  const shadePath = [0, 1, 2, 3].map(idx => {
    const kb = bases[order[idx].id];
    const ex = kb.x + (wristCenterX - kb.x) * 0.42;
    const ey = kb.y + 38;
    return `M ${kb.x.toFixed(1)} ${(kb.y + 4).toFixed(1)} L ${ex.toFixed(1)} ${ey.toFixed(1)}`;
  }).join(' ');

  const highlight = {
    cx: wristCenterX,
    cy: (pinkyBase.y + wristY) * 0.48,
    rx: 42,
    ry: 28
  };

  return {
    palmPath: cmds.join(' '),
    shadePath,
    highlight,
    core: { x: wristCenterX, y: (pinkyBase.y + wristY) * 0.52 }
  };
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
    const rpDef = {id:'rp', hand:'R', home:'semicolon', kind:'pinky', baseW:33.5, tipW:19.5, archPull:0.26, archDy:7, tipDy:8, kDist:76, restLen:72, restAng:0.08};
    FINGERS.push(rpDef);
  }
  if(!fingerEls['rp']){
    const rpDef = FINGERS.find(f => f.id === 'rp') || {id:'rp', hand:'R', home:'semicolon', kind:'pinky', baseW:33.5, tipW:19.5, archPull:0.26, archDy:7, tipDy:8, kDist:76, restLen:72, restAng:0.08};
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

  const framesL = {};
  const framesR = {};

  FINGERS.forEach(f=>{
    const fe = fingerEls[f.id];
    const hb = f.hand === 'L' ? handL : handR;
    if(!fe || !hb || !hb.bases[f.id]) return;
    const origin = hb.bases[f.id];
    const isPrimary = activeFinger === f.id;
    const isShiftActive = activeShiftFinger === f.id;
    const isActive = isPrimary || isShiftActive;
    const targetKey = isPrimary && activeTargetKey ? activeTargetKey
      : (isShiftActive && activeShiftTargetKey ? activeShiftTargetKey : null);
    const inward = f.hand === 'L' ? 1 : -1;

    let tip;
    if(f.kind === 'thumb'){
      const indexBase = hb.bases[hb.order[3].id];
      const defaultThumbTip = {
        x: indexBase.x + inward * 66,
        y: indexBase.y + 19
      };
      if(isActive && targetKey){
        const rawTip = keyCenter(targetKey, wrapRect);
        if(rawTip && targetKey !== 'space'){
          tip = rawTip;
        } else {
          tip = { x: defaultThumbTip.x + inward * 4, y: defaultThumbTip.y - 4 };
        }
      } else {
        tip = defaultThumbTip;
      }
    } else {
      const homeCenter = hb.homes[f.id] || keyCenter(f.home, wrapRect);
      const restTip = homeCenter
        ? { x: homeCenter.x + hb.shiftX, y: homeCenter.y + (f.tipDy || 0) + hb.shiftY }
        : { x: origin.x, y: origin.y - 74 };

      if(isActive && targetKey){
        const rawTarget = keyCenter(targetKey, wrapRect);
        tip = rawTarget ? { x: rawTarget.x, y: rawTarget.y + 2 } : restTip;
      } else {
        tip = restTip;
      }
    }
    if(!tip) return;

    // Physiological maximum reach limit scaled for realistic 75-85px finger lengths
    const maxLen = f.kind === 'thumb' ? 105 : (f.kind === 'pinky' ? 118 : (f.kind === 'middle' ? 138 : 130));
    const d = dist(origin, tip);
    if(d > maxLen){
      const scale = maxLen / d;
      tip = { x: origin.x + (tip.x - origin.x) * scale, y: origin.y + (tip.y - origin.y) * scale };
    }

    let mid;
    if(f.kind === 'thumb'){
      mid = {
        x: (origin.x + tip.x) * 0.5 + inward * 10,
        y: (origin.y + tip.y) * 0.5 - 6
      };
    } else {
      mid = {
        x: (origin.x + tip.x) * 0.5 + (tip.x - origin.x) * 0.12,
        y: (origin.y + tip.y) * 0.5 - 3
      };
    }

    const frame = fingerFrame(origin, mid, tip, f.baseW, f.tipW, f.kind === 'thumb');
    if(f.hand === 'L') framesL[f.id] = frame;
    else framesR[f.id] = frame;

    fe.shape.setAttribute('d', frameToPath(frame, f.baseW, f.tipW));

    if(f.kind === 'thumb'){
      fe.crease1.setAttribute('d', creaseAt(frame, 0.64));
      fe.crease2.setAttribute('d', '');
    } else {
      fe.crease1.setAttribute('d', creaseAt(frame, 0.46));
      fe.crease2.setAttribute('d', creaseAt(frame, 0.75));
    }
    fe.joint1.setAttribute('r', '0');
    fe.joint2.setAttribute('r', '0');

    // Soft anatomical edge highlight along the dorsal ridge
    const sStart = f.kind === 'thumb' ? 8 : 5, sMid = f.kind === 'thumb' ? 12 : 10, sEnd = 15;
    const cStart = pointAtFrame(frame, sStart / 18), cMid = pointAtFrame(frame, sMid / 18), cEnd = pointAtFrame(frame, sEnd / 18);
    const sh1 = { x: cStart.x + (frame.left[sStart].x - cStart.x) * 0.52, y: cStart.y + (frame.left[sStart].y - cStart.y) * 0.52 };
    const sh2 = { x: cMid.x + (frame.left[sMid].x - cMid.x) * 0.52, y: cMid.y + (frame.left[sMid].y - cMid.y) * 0.52 };
    const sh3 = { x: cEnd.x + (frame.left[sEnd].x - cEnd.x) * 0.52, y: cEnd.y + (frame.left[sEnd].y - cEnd.y) * 0.52 };
    fe.shine.setAttribute('d', `M ${sh1.x.toFixed(1)} ${sh1.y.toFixed(1)} Q ${sh2.x.toFixed(1)} ${sh2.y.toFixed(1)} ${sh3.x.toFixed(1)} ${sh3.y.toFixed(1)}`);
    fe.shine2.setAttribute('d', '');
    fe.energy.setAttribute('d', `M ${origin.x.toFixed(1)} ${origin.y.toFixed(1)} Q ${mid.x.toFixed(1)} ${mid.y.toFixed(1)} ${tip.x.toFixed(1)} ${tip.y.toFixed(1)}`);

    const nailPt = qPoint(origin, mid, tip, 0.87);
    fe.nail.setAttribute('d', buildNailPath(frame));

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

  if(handL && Object.keys(framesL).length === 5){
    const svgL = buildUnifiedHandSVG('L', handL.order, handL.thumbF, framesL, handL.bases);
    palmShapeL.setAttribute('d', svgL.palmPath);
    palmShadeL.setAttribute('d', svgL.shadePath);
    palmHiL.setAttribute('cx', svgL.highlight.cx); palmHiL.setAttribute('cy', svgL.highlight.cy);
    palmHiL.setAttribute('rx', svgL.highlight.rx); palmHiL.setAttribute('ry', svgL.highlight.ry);
    palmCoreL.setAttribute('cx', svgL.core.x); palmCoreL.setAttribute('cy', svgL.core.y);
  }
  if(handR && Object.keys(framesR).length === 5){
    const svgR = buildUnifiedHandSVG('R', handR.order, handR.thumbF, framesR, handR.bases);
    palmShapeR.setAttribute('d', svgR.palmPath);
    palmShadeR.setAttribute('d', svgR.shadePath);
    palmHiR.setAttribute('cx', svgR.highlight.cx); palmHiR.setAttribute('cy', svgR.highlight.cy);
    palmHiR.setAttribute('rx', svgR.highlight.rx); palmHiR.setAttribute('ry', svgR.highlight.ry);
    palmCoreR.setAttribute('cx', svgR.core.x); palmCoreR.setAttribute('cy', svgR.core.y);
  }
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
