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
  {id:'enter', kind:'mod', label:'Enter', wide:1.5},
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
  KEY('backslash','\\','/','៚','/'),
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
  {id:'space', kind:'mod', label:'', cls:'space'},
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
  {id:'enter', kind:'mod', label:'Enter', wide:1.5},
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
  KEY('backslash','ឮ','','\\','ឭ'),
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
  {id:'space', kind:'mod', label:'', cls:'space'},
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
  {id:'enter', kind:'mod', label:'Enter', wide:1.5},
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
  KEY('backslash','\\','','','|'),
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
  {id:'space', kind:'mod', label:'', cls:'space'},
  {id:'altgr', kind:'mod', label:'AltGr', cls:'key-altgr', wide:1.5},
  {id:'ctrlR', kind:'mod', label:'Ctrl', cls:'key-ctrl', wide:1.5},
];

/* ---------- layout registry ---------- */
const LAYOUTS = {
  standard: {
    label: 'Khmer Keyboard Layout',
    rows: [ROW1, ROW2, ROW3, ROW4, ROW5],
    spaceMap: {base:'្', shift:'្', ctrl:'្', altgr:'្'},
    hasLessons: true,
    layerLabels: {base:'Base — Khmer', shift:'Shift — Voiced consonants', ctrl:'Ctrl — Currency & punctuation', altgr:'AltGr — Numerals & clusters'},
  },
  nida: {
    label: 'Khmer NiDA Keyboard',
    rows: [ROW1_NIDA, ROW2_NIDA, ROW3_NIDA, ROW4_NIDA, ROW5_NIDA],
    spaceMap: {base:'\u200B', shift:' ', ctrl:' ', altgr:'\u00A0'},
    hasLessons: true,
    layerLabels: {base:'Base — Khmer', shift:'Shift — Marks & punctuation', ctrl:'Ctrl — (unused)', altgr:'AltGr — Symbols & vowels'},
  },
  english: {
    label: 'English (US)',
    rows: [ROW1_EN, ROW2_EN, ROW3_EN, ROW4_EN, ROW5_EN],
    spaceMap: {base:' ', shift:' ', ctrl:' ', altgr:' '},
    hasLessons: true,
    layerLabels: {base:'Base — lowercase', shift:'Shift — UPPERCASE & symbols', ctrl:'Ctrl — (unused)', altgr:'AltGr — (unused)'},
  },
};
let currentLayoutId = 'standard';
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
  ctrl: { title:"VK_CONTROL", body:"Ctrl key with Ctrl enabled." },
  altgr:{ title:"VK_RMENU", body:"AltGr key with AltGr enabled.\nClick to change keyboard state." },
  shift:{ title:"VK_SHIFT", body:"Shift key with Shift enabled.\nClick to change keyboard state." },
};

let hoverLayer = null;
let lockedLayer = null;
let physicalLayer = null;
let capsOn = false;
let keyEls = {};
let glyphData = {};

function buildBoard(){
  board.innerHTML = '';
  keyEls = {};
  glyphData = {};
ALL_ROWS.forEach(rowDef=>{
  const rowEl = document.createElement('div');
  rowEl.className = 'row';
  rowDef.forEach(k=>{
    const el = document.createElement('div');
    el.className = 'key';
    if(k.wide) el.style.flexGrow = k.wide;
    if(k.cls) el.classList.add(k.cls);
    keyEls[k.id] = el;

    if(k.kind === 'mod'){
      el.classList.add('label-key','mod');
      el.textContent = k.label;
      if(k.id === 'space') el.classList.add('space');
    } else {
      const g = document.createElement('span');
      g.className = 'glyph';
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
        hint.className = 'shift-badge';
        hint.textContent = k.shift;
        el.appendChild(hint);
      }
    }

    if(k.cls === 'key-ctrl' || k.cls === 'key-altgr' || k.cls === 'key-shift'){
      const layerName = k.cls === 'key-ctrl' ? 'ctrl' : (k.cls === 'key-altgr' ? 'altgr' : 'shift');
      const tip = document.createElement('div');
      tip.className = 'tooltip';
      tip.innerHTML = `<strong>${TOOLTIP_TEXT[layerName].title}</strong>${TOOLTIP_TEXT[layerName].body.replace('\n','<br>')}`;
      el.appendChild(tip);

      el.addEventListener('mouseenter', ()=>{
        hoverLayer = layerName;
        render();
        tip.classList.add('show');
      });
      el.addEventListener('mouseleave', ()=>{
        hoverLayer = null;
        tip.classList.remove('show');
        render();
      });
      el.addEventListener('click', (ev)=>{
        lockedLayer = (lockedLayer === layerName) ? null : layerName;
        render();
        burst(el, ev);
      });
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
// initial build handled by initApp in js/app.js


/* ---------- layout switching ---------- */
function switchLayout(id){
  if(!LAYOUTS[id] || id === currentLayoutId) return;
  if(typeof lessonActive !== 'undefined' && lessonActive) exitLesson();
  if(typeof trialActive !== 'undefined' && trialActive) stopTrial();
  if(typeof raceMode !== 'undefined' && raceMode) exitRaceMode();
  currentLayoutId = id;
  ALL_ROWS = LAYOUTS[id].rows;
  if(typeof LESSON_SETS !== 'undefined'){
    LESSONS = LESSON_SETS[id] || LESSONS;
    if(typeof renderLessonStrip === 'function') renderLessonStrip();
    if(typeof updateMasteryStat === 'function') updateMasteryStat();
  }
  hoverLayer = null;
  lockedLayer = null;
  physicalLayer = null;
  capsOn = false;
  clearText();
  buildBoard();
  updateHandsOverlay();
  render();
  layoutStrip.querySelectorAll('.layout-pill').forEach(p=>{
    p.classList.toggle('active', p.dataset.layout === id);
  });
  const ll = LAYOUTS[id].layerLabels;
  document.querySelectorAll('.layer-pill').forEach(p=>{
    const key = p.dataset.pill;
    if(ll && ll[key]) p.textContent = ll[key];
  });
  const lessonsAvailable = LAYOUTS[id].hasLessons;
  lessonStrip.style.display = lessonsAvailable ? '' : 'none';
  trialToggle.style.display = lessonsAvailable ? '' : 'none';
  if(typeof raceToggle !== 'undefined') raceToggle.style.display = lessonsAvailable ? '' : 'none';
  lessonUnavailableNote.style.display = lessonsAvailable ? 'none' : '';
}
layoutStrip.querySelectorAll('.layout-pill').forEach(p=>{
  p.addEventListener('click', ()=> switchLayout(p.dataset.layout));
});


/* ---------- finger guide (illustrated translucent hands) ---------- */
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
/* kind drives natural anatomy: relative width, knuckle height, resting reach & fan angle */
const FINGERS = [
  {id:'lp', hand:'L', home:'a', kind:'pinky',  baseW:12.5, tipW:7.5, kDist:68, restLen:52, restAng:-0.10},
  {id:'lr', hand:'L', home:'s', kind:'ring',   baseW:14.5, tipW:9.0, kDist:60, restLen:56, restAng:-0.04},
  {id:'lm', hand:'L', home:'d', kind:'middle', baseW:15.5, tipW:9.5, kDist:54, restLen:60, restAng:0.0},
  {id:'li', hand:'L', home:'f', kind:'index',  baseW:15.0, tipW:9.0, kDist:58, restLen:56, restAng:0.06},
  {id:'lt', hand:'L', home:'space', kind:'thumb', baseW:18.5, tipW:11.5, kDist:42, restLen:42, restAng:0.42},
  {id:'rt', hand:'R', home:'space', kind:'thumb', baseW:18.5, tipW:11.5, kDist:42, restLen:42, restAng:-0.42},
  {id:'ri', hand:'R', home:'j', kind:'index',  baseW:15.0, tipW:9.0, kDist:58, restLen:56, restAng:-0.06},
  {id:'rm', hand:'R', home:'k', kind:'middle', baseW:15.5, tipW:9.5, kDist:54, restLen:60, restAng:0.0},
  {id:'rr', hand:'R', home:'l', kind:'ring',   baseW:14.5, tipW:9.0, kDist:60, restLen:56, restAng:0.04},
  {id:'rp', hand:'R', home:'semicolon', kind:'pinky', baseW:12.5, tipW:7.5, kDist:68, restLen:52, restAng:0.10},
];

const handsOverlay = document.getElementById('handsOverlay');
const handsToggle = document.getElementById('handsToggle');
let handsOn = true;
const fingerEls = {}; // id -> {g, shape, shine, crease1, crease2, nail, tip}

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

/* build a smooth tapered, rounded-cap finger silhouette between origin and tip */
function fingerFrame(origin, ctrl, tip, baseW, tipW){
  const N = 18, left = [], right = [];
  for(let i=0;i<=N;i++){
    const s = i/N;
    const p = qPoint(origin, ctrl, tip, s);
    const tan = qTangent(origin, ctrl, tip, s);
    const l = Math.hypot(tan.x,tan.y) || 1;
    const nx = -tan.y/l, ny = tan.x/l;
    const w = (baseW + (tipW-baseW) * Math.pow(s, 1.35)) / 2;
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
  const mx=(l.x+r.x)/2, my=(l.y+r.y)/2;
  const lx = l.x + (l.x-mx)*0.65, ly = l.y + (l.y-my)*0.65;
  const rx = r.x + (r.x-mx)*0.65, ry = r.y + (r.y-my)*0.65;
  return `M ${lx.toFixed(1)} ${ly.toFixed(1)} Q ${mx.toFixed(1)} ${my.toFixed(1)} ${rx.toFixed(1)} ${ry.toFixed(1)}`;
}
function pointAtFrame(frame, s){
  const i = Math.round(s * (frame.left.length-1));
  const l = frame.left[i], r = frame.right[i];
  return { x:(l.x+r.x)/2, y:(l.y+r.y)/2 };
}

/* ---- static defs: gradients + soft grounding shadow ---- */
const defs = document.createElementNS(SVGNS,'defs');
defs.innerHTML = `
  <linearGradient id="fingerGrad" x1="0" y1="1" x2="0.35" y2="0">
    <stop offset="0%" stop-color="#0a0c22" stop-opacity="0.65"/>
    <stop offset="38%" stop-color="#222d5e" stop-opacity="0.68"/>
    <stop offset="68%" stop-color="#4a5fd0" stop-opacity="0.68"/>
    <stop offset="88%" stop-color="#7fd9ff" stop-opacity="0.82"/>
    <stop offset="100%" stop-color="#eafeff" stop-opacity="0.9"/>
  </linearGradient>
  <linearGradient id="fingerGradR" x1="0" y1="1" x2="0.35" y2="0">
    <stop offset="0%" stop-color="#170a26" stop-opacity="0.65"/>
    <stop offset="38%" stop-color="#3a1f5e" stop-opacity="0.68"/>
    <stop offset="68%" stop-color="#a24fc9" stop-opacity="0.68"/>
    <stop offset="88%" stop-color="#ff9bee" stop-opacity="0.82"/>
    <stop offset="100%" stop-color="#fff0fc" stop-opacity="0.9"/>
  </linearGradient>
  <linearGradient id="fingerGradActive" x1="0" y1="1" x2="0.35" y2="0">
    <stop offset="0%" stop-color="#7a3dff" stop-opacity="0.95"/>
    <stop offset="50%" stop-color="#ffd166" stop-opacity="0.98"/>
    <stop offset="100%" stop-color="#f2fffe" stop-opacity="1"/>
  </linearGradient>
  <linearGradient id="fingerGradActiveR" x1="0" y1="1" x2="0.35" y2="0">
    <stop offset="0%" stop-color="#ff3dc8" stop-opacity="0.95"/>
    <stop offset="50%" stop-color="#c96bff" stop-opacity="0.98"/>
    <stop offset="100%" stop-color="#fff2fe" stop-opacity="1"/>
  </linearGradient>
  <linearGradient id="palmGrad" x1="0" y1="1" x2="0.25" y2="0">
    <stop offset="0%" stop-color="#070818" stop-opacity="0.52"/>
    <stop offset="50%" stop-color="#1c2550" stop-opacity="0.58"/>
    <stop offset="100%" stop-color="#4a5fd8" stop-opacity="0.62"/>
  </linearGradient>
  <linearGradient id="palmGradR" x1="0" y1="1" x2="0.25" y2="0">
    <stop offset="0%" stop-color="#140818" stop-opacity="0.52"/>
    <stop offset="50%" stop-color="#3a1f52" stop-opacity="0.58"/>
    <stop offset="100%" stop-color="#a04fd0" stop-opacity="0.62"/>
  </linearGradient>
  <radialGradient id="palmHighlight" cx="50%" cy="50%" r="50%">
    <stop offset="0%" stop-color="#bff4ff" stop-opacity="0.6"/>
    <stop offset="100%" stop-color="#bff4ff" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="jointGlow" cx="50%" cy="50%" r="50%">
    <stop offset="0%" stop-color="#f2feff" stop-opacity="0.95"/>
    <stop offset="55%" stop-color="#ffd166" stop-opacity="0.65"/>
    <stop offset="100%" stop-color="#ffd166" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="jointGlowR" cx="50%" cy="50%" r="50%">
    <stop offset="0%" stop-color="#fff2fe" stop-opacity="0.95"/>
    <stop offset="55%" stop-color="#ff7bee" stop-opacity="0.65"/>
    <stop offset="100%" stop-color="#ff7bee" stop-opacity="0"/>
  </radialGradient>
  <filter id="handShadow" x="-40%" y="-40%" width="180%" height="180%">
    <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#ffd166" flood-opacity="0.25"/>
    <feDropShadow dx="0" dy="0" stdDeviation="12" flood-color="#080b1c" flood-opacity="0.6"/>
  </filter>
`;
handsOverlay.appendChild(defs);

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

FINGERS.forEach(f=>{
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
});

let activeFinger = null;
let activeTargetKey = null;
let activeShiftFinger = null;
let activeShiftTargetKey = null;

function shiftFingerFor(keyId){
  const fid = KEY_FINGER[keyId];
  const f = fid && FINGERS.find(x=>x.id===fid);
  if(!f || f.kind === 'thumb') return null;
  return f.hand === 'L' ? 'rp' : 'lp';
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

  const homes = {};
  fingers.forEach(f=>{
    if(f.kind === 'thumb') return;
    const c = keyCenter(f.home, wrapRect);
    if(c) homes[f.id] = c;
  });

  const order = ['pinky','ring','middle','index'].map(k=>fingers.find(f=>f.kind===k));
  if(order.some(f=> !homes[f.id])) return null;

  // Whole-hand reach translation
  let shiftX = 0, shiftY = 0;
  if(activeF && targetKey){
    const targetPt = keyCenter(targetKey, wrapRect);
    const homePt = keyCenter(activeF.home, wrapRect);
    if(targetPt && homePt){
      const reachDx = targetPt.x - homePt.x;
      const reachDy = targetPt.y - homePt.y;
      if(reachDy < 0){
        // Forward reach (number row / upper row): hand floats forward gracefully
        shiftY = reachDy * 0.65;
        shiftX = reachDx * 0.45;
      } else {
        // Bottom row reach
        shiftY = reachDy * 0.35;
        shiftX = reachDx * 0.38;
      }
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

  // Natural thumb base seated on the inner palm
  const thumbF = fingers.find(f=>f.kind==='thumb');
  const thumbBase = { x: indexBase.x + inward * 22, y: indexBase.y + 12 };
  baseKnuckles[thumbF.id] = thumbBase;

  // Ergonomic palm contour
  const palmHeight = 72;
  const maxKnuckleY = Math.max(...knucklePts.map(p=>p.y));
  const wristCenter = {
    x: (knucklePts[1].x + knucklePts[2].x)/2 + outward * 4,
    y: Math.min(wrapRect.height - 8, maxKnuckleY + palmHeight)
  };
  const wristWidth = 66;
  const wristOuter = { x: wristCenter.x + outward * (wristWidth * 0.52), y: wristCenter.y };
  const wristInner = { x: wristCenter.x + inward * (wristWidth * 0.48), y: wristCenter.y };

  const topOuter = { x: pinkyBase.x + outward * 12, y: pinkyBase.y - 2 };
  const innerCurve = { x: thumbBase.x + inward * 3, y: thumbBase.y + 22 };

  const arch = (a,b)=> ({ x:(a.x+b.x)/2, y:(a.y+b.y)/2 - 4 });
  const outline = [
    topOuter,
    arch(topOuter, knucklePts[1]), knucklePts[1],
    arch(knucklePts[1], knucklePts[2]), knucklePts[2],
    arch(knucklePts[2], indexBase), indexBase,
    innerCurve, wristInner, wristOuter
  ];
  const palmPath = roundedPolyPath(outline, 16);

  const cx = (topOuter.x + wristInner.x)/2, cy = (topOuter.y + wristOuter.y)/2;
  const shadeOutline = outline.map(p=> add(p, scalePt(sub({x:cx,y:cy}, p), 0.18)));
  const shadePath = roundedPolyPath(shadeOutline, 14);

  const highlight = {
    cx: (topOuter.x + knucklePts[1].x)/2 + outward*3,
    cy: topOuter.y + 8,
    rx: 26, ry: 14
  };

  return { bases: baseKnuckles, palmPath, shadePath, highlight, core:{x:cx, y:cy}, shiftX, shiftY };
}

function updateHandsOverlay(){
  if(!handsOverlay) return;
  if(!handsOn){ handsOverlay.classList.add('hidden'); return; }
  handsOverlay.classList.remove('hidden');
  const wrapRect = boardWrap.getBoundingClientRect();
  if(!wrapRect.width || !wrapRect.height) return;
  handsOverlay.setAttribute('viewBox', `0 0 ${wrapRect.width} ${wrapRect.height}`);
  handsOverlay.setAttribute('width', wrapRect.width);
  handsOverlay.setAttribute('height', wrapRect.height);

  const leftFingers = FINGERS.filter(f=>f.hand==='L');
  const rightFingers = FINGERS.filter(f=>f.hand==='R');

  const activeLeft = leftFingers.find(f=> f.id === activeFinger || f.id === activeShiftFinger);
  const targetLeft = activeLeft ? (activeLeft.id === activeFinger ? activeTargetKey : activeShiftTargetKey) : null;

  const activeRight = rightFingers.find(f=> f.id === activeFinger || f.id === activeShiftFinger);
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
            const frac = f.hand === 'L' ? 0.38 : 0.62;
            tip = { x: r.left + r.width*frac - wrapRect.left, y: tip.y };
          }
        }
      } else {
        // Natural relaxed resting thumb
        tip = { x: origin.x + inward * 34, y: origin.y - 32 };
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

    const d = dist(origin, tip);
    const bow = Math.min(18, d * 0.14);
    const mid = { x:(origin.x+tip.x)/2, y:(origin.y+tip.y)/2 - bow };

    const frame = fingerFrame(origin, mid, tip, f.baseW, f.tipW);
    fe.shape.setAttribute('d', frameToPath(frame, f.baseW, f.tipW));
    fe.crease1.setAttribute('d', creaseAt(frame, 0.42));
    fe.crease2.setAttribute('d', creaseAt(frame, 0.72));
    fe.shine.setAttribute('d', `M ${frame.left[1].x.toFixed(1)} ${frame.left[1].y.toFixed(1)} Q ${mid.x.toFixed(1)} ${mid.y.toFixed(1)} ${(tip.x + (frame.left[frame.left.length-1].x-tip.x)*0.3).toFixed(1)} ${(tip.y + (frame.left[frame.left.length-1].y-tip.y)*0.3).toFixed(1)}`);
    fe.shine2.setAttribute('d', `M ${frame.right[1].x.toFixed(1)} ${frame.right[1].y.toFixed(1)} Q ${mid.x.toFixed(1)} ${mid.y.toFixed(1)} ${(tip.x + (frame.right[frame.right.length-1].x-tip.x)*0.3).toFixed(1)} ${(tip.y + (frame.right[frame.right.length-1].y-tip.y)*0.3).toFixed(1)}`);
    fe.energy.setAttribute('d', `M ${origin.x.toFixed(1)} ${origin.y.toFixed(1)} Q ${mid.x.toFixed(1)} ${mid.y.toFixed(1)} ${tip.x.toFixed(1)} ${tip.y.toFixed(1)}`);

    const j1 = pointAtFrame(frame, 0.42), j2 = pointAtFrame(frame, 0.72);
    fe.joint1.setAttribute('cx', j1.x); fe.joint1.setAttribute('cy', j1.y);
    fe.joint1.setAttribute('r', Math.max(1.6, f.baseW*0.16));
    fe.joint2.setAttribute('cx', j2.x); fe.joint2.setAttribute('cy', j2.y);
    fe.joint2.setAttribute('r', Math.max(1.3, f.tipW*0.16));

    const nailPt = qPoint(origin, mid, tip, 0.9);
    const tan = qTangent(origin, mid, tip, 0.9);
    const ang = Math.atan2(tan.y, tan.x) * 180/Math.PI + 90;
    fe.nail.setAttribute('cx', nailPt.x); fe.nail.setAttribute('cy', nailPt.y);
    fe.nail.setAttribute('rx', Math.max(2.2, f.tipW*0.28)); fe.nail.setAttribute('ry', Math.max(2.8, f.tipW*0.38));
    fe.nail.setAttribute('transform', `rotate(${ang.toFixed(1)} ${nailPt.x.toFixed(1)} ${nailPt.y.toFixed(1)})`);

    fe.tip.setAttribute('cx', tip.x);
    fe.tip.setAttribute('cy', tip.y);
    fe.impactRing.setAttribute('cx', tip.x);
    fe.impactRing.setAttribute('cy', tip.y);
    fe.impactRing2.setAttribute('cx', tip.x);
    fe.impactRing2.setAttribute('cy', tip.y);
    fe.impactSparks.setAttribute('transform', `translate(${tip.x.toFixed(1)} ${tip.y.toFixed(1)})`);
    fe.reticle.setAttribute('transform', `translate(${tip.x.toFixed(1)} ${tip.y.toFixed(1)})`);
    fe.g.classList.toggle('active', isActive);
  });
}

function setActiveFinger(keyId, layer){
  activeFinger = keyId ? (KEY_FINGER[keyId] || null) : null;
  activeTargetKey = keyId;
  const lyr = layer || (keyId ? currentLayer() : null);
  if(keyId && lyr === 'shift' && keyId !== 'shiftL' && keyId !== 'shiftR'){
    const sf = shiftFingerFor(keyId);
    activeShiftFinger = sf;
    activeShiftTargetKey = sf === 'rp' ? 'shiftR' : (sf === 'lp' ? 'shiftL' : null);
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
   key lives on the Shift layer, the opposite pinky flashes on the Shift
   key at the same moment, as if it were held down for the combo. */
function triggerFingerPress(keyId){
  if(!handsOn) return;
  const fid = keyId ? KEY_FINGER[keyId] : null;
  if(!fid) return;
  strikeFinger(fingerEls[fid]);

  if(keyId !== 'shiftL' && keyId !== 'shiftR' && currentLayer() === 'shift'){
    const sf = shiftFingerFor(keyId);
    if(sf && sf !== fid) strikeFinger(fingerEls[sf]);
  }
}

handsToggle.addEventListener('click', ()=>{
  handsOn = !handsOn;
  handsToggle.classList.toggle('on', handsOn);
  handsToggle.innerHTML = pkIcon('keyboard', 14) + ' Finger guide' + (handsOn ? '' : ' (off)');
  updateHandsOverlay();
});

window.addEventListener('resize', updateHandsOverlay);


function currentLayer(){
  return physicalLayer || hoverLayer || lockedLayer || 'base';
}

let lastLayer;
function triggerWave(){
  const keys = document.querySelectorAll('#keyboard .key');
  keys.forEach((el, i)=>{
    setTimeout(()=>{
      el.classList.add('wave');
      setTimeout(()=> el.classList.remove('wave'), 560);
    }, i*8);
  });
}

function render(){
  const layer = currentLayer();
  if(layer !== lastLayer){
    triggerWave();
    lastLayer = layer;
  }

  document.querySelectorAll('.glyph').forEach(g=>{
    const val = g.dataset[layer] !== undefined ? g.dataset[layer] : g.dataset.base;
    g.textContent = val;
    g.parentElement.classList.toggle('empty', !val);
  });

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
