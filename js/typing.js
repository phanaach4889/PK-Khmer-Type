/* ============================================================
   PK Khmer Type — Typing Engine, Manuscript & Key Input Handlers
   ============================================================ */

/* ---------- Unicode Normalization & Character Comparison ---------- */
const KHMER_COMPOUND_VOWELS = Object.freeze([
  '\u17BB\u17C6', // ុំ (comma base)
  '\u17BB\u17C7', // ុះ (comma shift)
  '\u17B6\u17C6', // ាំ (a shift)
  '\u17C1\u17C7', // េះ (v shift)
  '\u17C4\u17C7', // ោះ (semicolon shift)
]);

function normalizeInput(text){
  if(text === null || text === undefined) return '';
  const str = typeof text === 'string' ? text : String(text);
  return str.normalize('NFC');
}

function compareTypingSequence(produced, expected){
  if(produced === expected) return true;
  const pNorm = normalizeInput(produced);
  const eNorm = normalizeInput(expected);
  return pNorm === eNorm;
}

function splitIntoTypingUnits(text, layoutId){
  if(!text) return [];
  const normalized = normalizeInput(text);
  const units = [];
  let i = 0;
  while(i < normalized.length){
    if((layoutId === 'nida' || layoutId === 'standard') && i + 1 < normalized.length){
      const pair = normalized.slice(i, i + 2);
      if(KHMER_COMPOUND_VOWELS.includes(pair)){
        units.push(pair);
        i += 2;
        continue;
      }
    }
    const code = normalized.codePointAt(i);
    const ch = String.fromCodePoint(code);
    units.push(ch);
    i += ch.length;
  }
  return units;
}

window.normalizeInput = normalizeInput;
window.compareTypingSequence = compareTypingSequence;
window.splitIntoTypingUnits = splitIntoTypingUnits;

/* ---------- Composition / IME Awareness ---------- */
let isComposing = false;

window.addEventListener('compositionstart', ()=>{
  isComposing = true;
});

window.addEventListener('compositionupdate', ()=>{
  isComposing = true;
});

window.addEventListener('compositionend', (e)=>{
  isComposing = false;
  if(typeof lessonActive !== 'undefined' && lessonActive) return;
  if(typeof raceActive !== 'undefined' && raceActive) return;
  if(typeof trialActive !== 'undefined' && trialActive) return;
  const activeEl = document.activeElement;
  if(activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable)) return;
  if(e && e.data){
    insertText(normalizeInput(e.data));
  }
});

const outputEl = document.getElementById("output");
const placeholderEl = document.getElementById("placeholder");
const clearBtn = document.getElementById("clearBtn");
const copyBtn = document.getElementById("copyBtn");
const manuscriptEl = document.getElementById("manuscript");

/* ---------- Manuscript Helper Functions ---------- */
function getManuscriptText(){
  if(!outputEl) return '';
  return Array.from(outputEl.childNodes)
    .filter(n => n.nodeType === 3)
    .map(n => n.textContent)
    .join('');
}

function setManuscriptText(str){
  if(!outputEl) return;
  Array.from(outputEl.childNodes).forEach(n => {
    if(n.nodeType === 3) n.remove();
  });
  const cursor = outputEl.querySelector('.cursor');
  if(str){
    const textNode = document.createTextNode(str);
    if(cursor) outputEl.insertBefore(textNode, cursor);
    else outputEl.appendChild(textNode);
    if(placeholderEl) placeholderEl.style.display = 'none';
  } else {
    if(placeholderEl) placeholderEl.style.display = 'inline';
  }
}

/* ---------- Undo / Redo History Stack ---------- */
const undoStack = [];
const redoStack = [];
let burstTimer = null;
let burstSnapshotTaken = false;

function pushUndoSnapshot(){
  const text = getManuscriptText();
  if(undoStack.length === 0 || undoStack[undoStack.length - 1] !== text){
    undoStack.push(text);
    if(undoStack.length > 60) undoStack.shift();
    redoStack.length = 0;
  }
}

function markTypingBurst(){
  if(!burstSnapshotTaken){
    pushUndoSnapshot();
    burstSnapshotTaken = true;
  }
  clearTimeout(burstTimer);
  burstTimer = setTimeout(()=>{
    burstSnapshotTaken = false;
  }, 700);
}

function undoManuscript(){
  if(!undoStack.length){
    if(typeof showToast === 'function') showToast(pkIcon('alert', 16), 'Nothing to Undo', 'No previous text edits available.');
    return;
  }
  burstSnapshotTaken = false;
  const current = getManuscriptText();
  const prev = undoStack.pop();
  redoStack.push(current);
  setManuscriptText(prev);
  if(typeof showToast === 'function') showToast(pkIcon('reset', 16), 'Undo', 'Reverted previous edit.');
}

function redoManuscript(){
  if(!redoStack.length){
    if(typeof showToast === 'function') showToast(pkIcon('alert', 16), 'Nothing to Redo', 'No undone edits available.');
    return;
  }
  burstSnapshotTaken = false;
  const current = getManuscriptText();
  const next = redoStack.pop();
  undoStack.push(current);
  setManuscriptText(next);
  if(typeof showToast === 'function') showToast(pkIcon('arrow-right', 16), 'Redo', 'Restored previous edit.');
}

/* ---------- Clipboard Actions ---------- */
async function copyManuscriptToClipboard(){
  const selection = window.getSelection ? window.getSelection().toString() : '';
  const text = selection || getManuscriptText();
  if(!text){
    if(typeof showToast === 'function') showToast(pkIcon('alert', 16), 'Nothing to Copy', 'Manuscript is currently empty.');
    return;
  }
  try {
    await navigator.clipboard.writeText(text);
  } catch(e){
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try{ document.execCommand('copy'); }catch(err){}
    document.body.removeChild(ta);
  }
  if(copyBtn){
    const origHtml = copyBtn.innerHTML;
    copyBtn.textContent = 'Copied!';
    setTimeout(()=>{ copyBtn.innerHTML = origHtml; }, 1200);
  }
  if(typeof showToast === 'function'){
    showToast(pkIcon('copy', 16), 'Copied', selection ? 'Selected text copied to clipboard.' : 'Manuscript copied to clipboard.');
  }
}

async function cutManuscriptToClipboard(){
  const selection = window.getSelection ? window.getSelection().toString() : '';
  if(selection){
    try {
      await navigator.clipboard.writeText(selection);
      document.execCommand('delete');
      if(typeof showToast === 'function') showToast(pkIcon('copy', 16), 'Cut', 'Selected text cut to clipboard.');
    } catch(err){}
    return;
  }
  const text = getManuscriptText();
  if(!text) return;
  pushUndoSnapshot();
  burstSnapshotTaken = false;
  try {
    await navigator.clipboard.writeText(text);
  } catch(e){
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try{ document.execCommand('copy'); }catch(err){}
    document.body.removeChild(ta);
  }
  clearText();
  if(typeof showToast === 'function') showToast(pkIcon('copy', 16), 'Cut', 'Manuscript cut to clipboard.');
}

function handlePasteText(str){
  if(!str) return;
  pushUndoSnapshot();
  burstSnapshotTaken = false;
  insertText(str);
  if(typeof showToast === 'function') showToast(pkIcon('copy', 16), 'Pasted', 'Text pasted into manuscript.');
}

function selectAllManuscript(){
  if(!outputEl) return;
  const range = document.createRange();
  range.selectNodeContents(outputEl);
  const sel = window.getSelection();
  if(sel){
    sel.removeAllRanges();
    sel.addRange(range);
  }
}

function backspaceWord(){
  const current = getManuscriptText();
  if(!current) return;
  pushUndoSnapshot();
  burstSnapshotTaken = false;
  const trimmed = current.replace(/[\s\u200b]+$/, '');
  const diff = current.length - trimmed.length;
  if(diff > 0){
    setManuscriptText(trimmed);
  } else {
    const match = current.match(/^(.*?)(\S+[\s\u200b]*)$/);
    if(match){
      setManuscriptText(match[1]);
    } else {
      setManuscriptText('');
    }
  }
}

if(copyBtn){
  copyBtn.addEventListener("click", copyManuscriptToClipboard);
}
if(clearBtn){
  clearBtn.addEventListener("click", clearText);
}

/* Native document paste handler */
document.addEventListener('paste', (e)=>{
  const t = e.target;
  if(t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
  if(typeof lessonActive !== 'undefined' && lessonActive) return;
  if(typeof raceMode !== 'undefined' && raceMode) return;
  if(typeof trialActive !== 'undefined' && trialActive) return;
  const text = (e.clipboardData || window.clipboardData)?.getData('text');
  if(text){
    e.preventDefault();
    handlePasteText(text);
  }
});

/* Native document copy handler */
document.addEventListener('copy', (e)=>{
  const t = e.target;
  if(t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
  const selection = window.getSelection ? window.getSelection().toString() : '';
  if(!selection && outputEl && outputEl.textContent.trim()){
    const text = getManuscriptText();
    if(text && e.clipboardData){
      e.clipboardData.setData('text/plain', text);
      e.preventDefault();
      if(copyBtn){
        const origHtml = copyBtn.innerHTML;
        copyBtn.textContent = 'Copied!';
        setTimeout(()=>{ copyBtn.innerHTML = origHtml; }, 1200);
      }
      if(typeof showToast === 'function') showToast(pkIcon('copy', 16), 'Copied', 'Manuscript copied to clipboard.');
    }
  }
});

/* Native document cut handler */
document.addEventListener('cut', (e)=>{
  const t = e.target;
  if(t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
  const selection = window.getSelection ? window.getSelection().toString() : '';
  if(!selection && outputEl && outputEl.textContent.trim()){
    const text = getManuscriptText();
    if(text && e.clipboardData){
      e.clipboardData.setData('text/plain', text);
      e.preventDefault();
      pushUndoSnapshot();
      burstSnapshotTaken = false;
      clearText();
      if(typeof showToast === 'function') showToast(pkIcon('copy', 16), 'Cut', 'Manuscript cut to clipboard.');
    }
  }
});

/* ==========================================================================
   HIGH-PERFORMANCE HARDWARE-ACCELERATED FX ENGINE (CANVAS 120 FPS)
   Sparks / Embers, Kinetic Rune Rings, Ripple Shockwaves, Milestone Fireworks
   Zero-DOM churn, object-pooled, auto-pausing rAF at 0% idle CPU
   ========================================================================== */
let fxCanvas = null;
let fxCtx = null;
let fxWidth = 0;
let fxHeight = 0;
let fxDpr = 1;
let fxAnimId = null;

const FX_POOL_SIZE = 260;
const fxParticles = [];
for (let i = 0; i < FX_POOL_SIZE; i++) {
  fxParticles.push({
    active: false,
    type: 'ember',
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    gravity: 0,
    drag: 0.96,
    size: 3,
    baseSize: 3,
    radius: 0,
    maxRadius: 0,
    rotation: 0,
    vRot: 0,
    color: '#ffd166',
    alpha: 1,
    life: 0,
    maxLife: 30,
    lineWidth: 2
  });
}
let fxActiveCount = 0;

function initFxCanvas() {
  if (fxCanvas) return;
  if (typeof document === 'undefined' || !document.body) return;
  fxCanvas = document.getElementById('fxCanvas');
  if (!fxCanvas) {
    fxCanvas = document.createElement('canvas');
    fxCanvas.id = 'fxCanvas';
    fxCanvas.className = 'fx-canvas';
    fxCanvas.setAttribute('aria-hidden', 'true');
    fxCanvas.style.position = 'fixed';
    fxCanvas.style.inset = '0';
    fxCanvas.style.top = '0';
    fxCanvas.style.left = '0';
    fxCanvas.style.width = '100vw';
    fxCanvas.style.height = '100vh';
    fxCanvas.style.pointerEvents = 'none';
    fxCanvas.style.zIndex = '80';
    document.body.appendChild(fxCanvas);
  } else {
    fxCanvas.style.position = 'fixed';
    fxCanvas.style.inset = '0';
    fxCanvas.style.top = '0';
    fxCanvas.style.left = '0';
    fxCanvas.style.width = '100vw';
    fxCanvas.style.height = '100vh';
    fxCanvas.style.pointerEvents = 'none';
    fxCanvas.style.zIndex = '80';
  }
  fxCtx = fxCanvas.getContext('2d', { alpha: true });
  resizeFxCanvas();
  window.addEventListener('resize', resizeFxCanvas, { passive: true });
}

function resizeFxCanvas() {
  if (!fxCanvas || !fxCtx) return;
  fxDpr = Math.min(window.devicePixelRatio || 1, 2);
  fxWidth = window.innerWidth;
  fxHeight = window.innerHeight;
  fxCanvas.width = Math.floor(fxWidth * fxDpr);
  fxCanvas.height = Math.floor(fxHeight * fxDpr);
  fxCanvas.style.position = 'fixed';
  fxCanvas.style.inset = '0';
  fxCanvas.style.top = '0';
  fxCanvas.style.left = '0';
  fxCanvas.style.width = '100vw';
  fxCanvas.style.height = '100vh';
  fxCanvas.style.pointerEvents = 'none';
  fxCanvas.style.zIndex = '80';
  fxCtx.setTransform(fxDpr, 0, 0, fxDpr, 0, 0);
}

function fxSpawn() {
  for (let i = 0; i < FX_POOL_SIZE; i++) {
    if (!fxParticles[i].active) {
      fxActiveCount++;
      return fxParticles[i];
    }
  }
  return fxParticles[0];
}

function fxStartLoop() {
  if (fxAnimId === null) {
    fxAnimId = requestAnimationFrame(fxRenderLoop);
  }
}

function fxRenderLoop() {
  if (!fxCtx || fxActiveCount <= 0) {
    if (fxCtx && fxCanvas) {
      fxCtx.clearRect(0, 0, fxWidth, fxHeight);
    }
    fxAnimId = null;
    return;
  }

  fxCtx.clearRect(0, 0, fxWidth, fxHeight);

  let stillActive = 0;
  for (let i = 0; i < FX_POOL_SIZE; i++) {
    const p = fxParticles[i];
    if (!p.active) continue;

    p.life++;
    if (p.life >= p.maxLife) {
      p.active = false;
      continue;
    }
    stillActive++;

    const progress = p.life / p.maxLife;

    if (p.type === 'ember') {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= p.drag;
      p.vy *= p.drag;
      p.alpha = Math.max(0, 1 - progress);
      const curSize = Math.max(0.5, p.baseSize * (1 - progress * 0.65));

      fxCtx.save();
      fxCtx.globalAlpha = p.alpha;
      fxCtx.fillStyle = p.color;
      fxCtx.beginPath();
      fxCtx.arc(p.x, p.y, curSize, 0, Math.PI * 2);
      fxCtx.fill();
      fxCtx.restore();
    } else if (p.type === 'ring') {
      p.radius += (p.maxRadius - p.radius) * 0.22;
      p.rotation += p.vRot;
      p.alpha = Math.max(0, (1 - progress) * 0.95);
      const lw = Math.max(0.6, p.lineWidth * (1 - progress * 0.8));

      fxCtx.save();
      fxCtx.translate(p.x, p.y);
      fxCtx.rotate(p.rotation);
      fxCtx.globalAlpha = p.alpha;
      fxCtx.strokeStyle = p.color;
      fxCtx.lineWidth = lw;

      const sides = 6;
      fxCtx.beginPath();
      for (let s = 0; s < sides; s++) {
        const a = (s * 2 * Math.PI) / sides;
        const hx = Math.cos(a) * p.radius;
        const hy = Math.sin(a) * p.radius;
        if (s === 0) fxCtx.moveTo(hx, hy);
        else fxCtx.lineTo(hx, hy);
      }
      fxCtx.closePath();
      fxCtx.stroke();

      fxCtx.beginPath();
      fxCtx.arc(0, 0, p.radius * 0.68, 0, Math.PI * 2);
      fxCtx.lineWidth = lw * 0.6;
      fxCtx.stroke();

      fxCtx.restore();
    } else if (p.type === 'ripple') {
      p.radius += (p.maxRadius - p.radius) * 0.2;
      p.alpha = Math.max(0, (1 - progress) * 0.6);
      const lw = Math.max(0.5, 2.2 * (1 - progress));

      fxCtx.save();
      fxCtx.globalAlpha = p.alpha;
      fxCtx.strokeStyle = p.color;
      fxCtx.lineWidth = lw;
      fxCtx.beginPath();
      fxCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      fxCtx.stroke();
      fxCtx.restore();
    } else if (p.type === 'star') {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= p.drag;
      p.vy *= p.drag;
      p.rotation += p.vRot;
      p.alpha = Math.max(0, 1 - progress);
      const curSize = Math.max(1, p.baseSize * (1 - progress * 0.5));

      fxCtx.save();
      fxCtx.translate(p.x, p.y);
      fxCtx.rotate(p.rotation);
      fxCtx.globalAlpha = p.alpha;
      fxCtx.fillStyle = p.color;

      fxCtx.beginPath();
      fxCtx.moveTo(0, -curSize * 1.5);
      fxCtx.lineTo(curSize * 0.45, -curSize * 0.45);
      fxCtx.lineTo(curSize * 1.5, 0);
      fxCtx.lineTo(curSize * 0.45, curSize * 0.45);
      fxCtx.lineTo(0, curSize * 1.5);
      fxCtx.lineTo(-curSize * 0.45, curSize * 0.45);
      fxCtx.lineTo(-curSize * 1.5, 0);
      fxCtx.lineTo(-curSize * 0.45, -curSize * 0.45);
      fxCtx.closePath();
      fxCtx.fill();
      fxCtx.restore();
    }
  }

  fxActiveCount = stillActive;
  if (fxActiveCount > 0) {
    fxAnimId = requestAnimationFrame(fxRenderLoop);
  } else {
    fxCtx.clearRect(0, 0, fxWidth, fxHeight);
    fxAnimId = null;
  }
}

function getFxCoord(el, ev) {
  if (ev && typeof ev.clientX === 'number') {
    return { x: ev.clientX, y: ev.clientY };
  }
  if (el && typeof el.getBoundingClientRect === 'function') {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }
  return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
}

function heatColor(streakVal) {
  const html = document.documentElement;
  const isLight = html.classList.contains('theme-light');
  const isSepia = html.classList.contains('theme-sepia');
  const isMoonlight = html.classList.contains('theme-moonlight');
  const isSunset = html.classList.contains('theme-sunset');
  const isJungle = html.classList.contains('theme-jungle');
  const isGlass = html.classList.contains('theme-glass');

  const s = typeof streakVal === 'number' ? streakVal : (typeof streak !== 'undefined' ? streak : 0);

  if (s >= 30) {
    const cosmic = ['#38bdf8', '#c084fc', '#f43f5e', '#ffd166', '#00f3ff'];
    return cosmic[Math.floor(Math.random() * cosmic.length)];
  }
  if (s >= 15) return '#ff5533';
  if (s >= 6) return '#f59e0b';

  if (isMoonlight) return '#00f3ff';
  if (isSunset) return '#ff7a45';
  if (isJungle) return '#10b981';
  if (isGlass) return '#38bdf8';
  if (isLight) return '#d97706';
  if (isSepia) return '#b45309';
  return '#ffd166';
}

function isAnimationDisabled() {
  const html = typeof document !== 'undefined' ? document.documentElement : null;
  if (!html || !html.classList) return false;
  return html.classList.contains('performance-mode') ||
         html.classList.contains('anim-mode-off') ||
         html.classList.contains('anim-mode-minimal') ||
         html.classList.contains('reduce-motion') ||
         html.classList.contains('reduced-motion') ||
         html.classList.contains('hide-key-fx');
}

function emberBurst(el, ev, count, color) {
  if (isAnimationDisabled()) return;
  const isSpace = el && (el.classList.contains('space') || (el.dataset && el.dataset.key === 'space'));
  if (isSpace) return;

  initFxCanvas();
  const coord = getFxCoord(el, ev);
  const n = count || 3;
  const col = color || heatColor();
  const themeColors = [col, '#ffffff', col];

  for (let i = 0; i < n; i++) {
    const p = fxSpawn();
    p.active = true;
    p.type = 'ember';
    p.x = coord.x + (Math.random() * 8 - 4);
    p.y = coord.y + (Math.random() * 8 - 4);
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 4.5 + 1.8;
    p.vx = Math.cos(angle) * speed;
    p.vy = Math.sin(angle) * speed - (Math.random() * 1.5 + 0.5);
    p.gravity = 0.12;
    p.drag = 0.955;
    p.baseSize = Math.random() * 2.8 + 2.0;
    p.size = p.baseSize;
    p.color = themeColors[i % themeColors.length];
    p.alpha = 1;
    p.life = 0;
    p.maxLife = Math.floor(Math.random() * 16 + 22);
  }
  fxStartLoop();
}

function runeRing(el, color) {
  if (isAnimationDisabled()) return;
  const isSpace = el && (el.classList.contains('space') || (el.dataset && el.dataset.key === 'space'));
  if (isSpace) return;

  initFxCanvas();
  const coord = getFxCoord(el, null);
  const col = color || heatColor();

  const p = fxSpawn();
  p.active = true;
  p.type = 'ring';
  p.x = coord.x;
  p.y = coord.y;
  p.radius = 8;
  p.maxRadius = el ? Math.min(Math.max(el.offsetHeight || 44, 44) * 0.92, 52) : 52;
  p.rotation = Math.random() * Math.PI;
  p.vRot = (Math.random() > 0.5 ? 1 : -1) * (0.025 + Math.random() * 0.02);
  p.lineWidth = 2.4;
  p.color = col;
  p.alpha = 1;
  p.life = 0;
  p.maxLife = 26;

  fxStartLoop();
}

function burst(el, ev) {
  if (isAnimationDisabled()) return;
  const isSpace = el && (el.classList.contains('space') || (el.dataset && el.dataset.key === 'space'));
  if (isSpace) return;

  initFxCanvas();
  const coord = getFxCoord(el, ev);
  const col = heatColor();

  const p = fxSpawn();
  p.active = true;
  p.type = 'ripple';
  p.x = coord.x;
  p.y = coord.y;
  p.radius = 4;
  p.maxRadius = el ? Math.min(Math.max(el.offsetHeight || 48, 48) * 1.15, 58) : 55;
  p.color = col;
  p.alpha = 0.65;
  p.life = 0;
  p.maxLife = 20;

  fxStartLoop();
}

function streakCelebrationBurst(count, el) {
  if (isAnimationDisabled()) return;
  initFxCanvas();
  const coord = getFxCoord(el, null);
  const n = count || 28;
  const palette = ['#ffd166', '#ff477e', '#38bdf8', '#10b981', '#a855f7', '#ffffff', '#ff9f43'];

  for (let i = 0; i < n; i++) {
    const p = fxSpawn();
    p.active = true;
    p.type = (i % 3 === 0) ? 'star' : 'ember';
    p.x = coord.x + (Math.random() * 12 - 6);
    p.y = coord.y + (Math.random() * 12 - 6);
    const angle = (Math.PI * 2 * i) / n + (Math.random() * 0.3 - 0.15);
    const speed = Math.random() * 6.5 + 3.2;
    p.vx = Math.cos(angle) * speed;
    p.vy = Math.sin(angle) * speed - (Math.random() * 2.5 + 1.0);
    p.gravity = 0.14;
    p.drag = 0.965;
    p.baseSize = Math.random() * 3.5 + 2.5;
    p.size = p.baseSize;
    p.rotation = Math.random() * Math.PI * 2;
    p.vRot = (Math.random() - 0.5) * 0.2;
    p.color = palette[i % palette.length];
    p.alpha = 1;
    p.life = 0;
    p.maxLife = Math.floor(Math.random() * 20 + 35);
  }
  fxStartLoop();
}

function initAmbientMotes() {
  if (isAnimationDisabled()) return;
  const container = document.getElementById('motes');
  if (!container || container.children.length > 0) return;
  const frag = document.createDocumentFragment();
  const colors = [
    'var(--gold-bright, #ffd166)',
    'var(--gold, #d4a373)',
    'var(--fx-violet, #a78bfa)',
    '#38bdf8',
    '#fbbf24',
    '#f472b6',
    '#34d399'
  ];
  for (let i = 0; i < 40; i++) {
    const m = document.createElement('div');
    m.className = 'mote';
    const x = (Math.random() * 100).toFixed(1);
    const size = (Math.random() * 2.8 + 2.0).toFixed(1);
    const dur = (Math.random() * 14 + 11).toFixed(1);
    const delay = (-(Math.random() * 22)).toFixed(1);
    const driftX = (Math.random() * 70 - 35).toFixed(0);
    const color = colors[i % colors.length];
    const op = (Math.random() * 0.45 + 0.35).toFixed(2);
    m.style.setProperty('--x', x);
    m.style.setProperty('--s', size + 'px');
    m.style.setProperty('--d', dur + 's');
    m.style.setProperty('--del', delay + 's');
    m.style.setProperty('--drift-x', driftX + 'px');
    m.style.setProperty('--c', color);
    m.style.setProperty('--max-op', op);
    frag.appendChild(m);
  }
  container.appendChild(frag);
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initFxCanvas();
    initAmbientMotes();
  });
} else {
  initFxCanvas();
  initAmbientMotes();
}

window.emberBurst = emberBurst;
window.runeRing = runeRing;
window.burst = burst;
window.heatColor = heatColor;
window.streakCelebrationBurst = streakCelebrationBurst;
window.initAmbientMotes = initAmbientMotes;

function press(el){
  if(!el) return;
  el.classList.add('pressed');
  setTimeout(()=> el.classList.remove('pressed'), 110);
}

function updatePlaceholder(){
  const hasText = outputEl.textContent.replace(/\u200b/g,'').trim().length > 0
    || Array.from(outputEl.childNodes).some(n => n.nodeType===3 && n.textContent.length>0);
  placeholderEl.style.display = (outputEl.querySelector('.cursor') && outputEl.textContent.trim().length===0) ? 'inline' : 'none';
}

function insertText(str){
  markTypingBurst();
  const cursor = outputEl.querySelector('.cursor');
  const textNode = document.createTextNode(str);
  outputEl.insertBefore(textNode, cursor);
  placeholderEl.style.display = 'none';
  outputEl.classList.add('ink-flash');
  clearTimeout(insertText._t);
  insertText._t = setTimeout(()=> outputEl.classList.remove('ink-flash'), 420);
}

function backspaceText(specificUnit){
  markTypingBurst();
  const cursor = outputEl.querySelector('.cursor');
  let node = cursor ? cursor.previousSibling : null;
  if(node && node.nodeType === 3){
    if(specificUnit && node.textContent.endsWith(specificUnit)){
      node.textContent = node.textContent.slice(0, -specificUnit.length);
    } else {
      let sliced = false;
      for(const cv of KHMER_COMPOUND_VOWELS){
        if(node.textContent.endsWith(cv)){
          node.textContent = node.textContent.slice(0, -cv.length);
          sliced = true;
          break;
        }
      }
      if(!sliced){
        const chars = Array.from(node.textContent);
        chars.pop();
        node.textContent = chars.join('');
      }
    }
    if(node.textContent.length === 0) node.remove();
  }
  if(!outputEl.textContent.trim()) placeholderEl.style.display = 'inline';
}

function clearText(){
  pushUndoSnapshot();
  burstSnapshotTaken = false;
  Array.from(outputEl.childNodes).forEach(n=>{
    if(n.nodeType === 3) n.remove();
  });
  placeholderEl.style.display = 'inline';
}

/* ---------- Key Stroke Resolution Pipeline ---------- */
function resolveKeyStroke(id){
  if(!id) return null;

  if(['shiftL','shiftR','ctrlL','ctrlR','alt','altgr'].includes(id)){
    return { id, kind: 'modifier' };
  }
  if(id === 'caps'){
    return { id, kind: 'caps' };
  }
  if(id === 'backspace' || id === 'enter' || id === 'tab'){
    return {
      id,
      kind: 'control',
      charProduced: id === 'enter' ? '\n' : (id === 'tab' ? '\t' : '')
    };
  }
  if(id === 'space'){
    const sm = (LAYOUTS[currentLayoutId] && LAYOUTS[currentLayoutId].spaceMap) ? LAYOUTS[currentLayoutId].spaceMap : null;
    const lyr = currentLayer();
    const charProduced = (sm && sm[lyr] !== undefined) ? sm[lyr] : (lyr === 'shift' ? ' ' : ' ');
    return {
      id,
      kind: 'glyph',
      layer: lyr,
      charProduced: normalizeInput(charProduced)
    };
  }

  const data = glyphData[id];
  if(!data) return null;

  let layer = currentLayer();
  if(currentLayoutId === 'english' && capsOn && /^[a-z]$/.test(id)){
    layer = (layer === 'shift') ? 'base' : (layer === 'base' ? 'shift' : layer);
  }
  const val = (data[layer] !== undefined && data[layer] !== '') ? data[layer] : (layer === 'base' ? data.base : '');
  if(!val) return null;

  return {
    id,
    kind: 'glyph',
    layer,
    charProduced: normalizeInput(val)
  };
}

window.resolveKeyStroke = resolveKeyStroke;

function typeKey(id, ev){
  const el = keyEls[id];
  if(el) press(el);
  triggerFingerPress(id);
  if(ev) burst(el, ev); else burst(el);

  const stroke = resolveKeyStroke(id);
  if(!stroke) return;

  if(stroke.kind === 'modifier') return;

  if(stroke.kind === 'caps'){
    if(currentLayoutId === 'english'){
      capsOn = !capsOn;
      if(el) el.classList.toggle('lit', capsOn);
      playClick('down');
    }
    return;
  }

  if(stroke.id === 'backspace'){
    playClick('up');
    if(typeof adaptiveActive !== 'undefined' && adaptiveActive){
      if(typeof adaptiveHandleBackspace === 'function') adaptiveHandleBackspace();
    } else if(typeof lessonActive !== 'undefined' && lessonActive){
      if(typeof lessonHandleBackspace === 'function') lessonHandleBackspace();
    } else if(typeof raceActive !== 'undefined' && raceActive){
      // Race mode does not use backspace
    } else if(typeof trialActive !== 'undefined' && trialActive){
      // Trial mode does not use backspace
    } else {
      backspaceText();
    }
    return;
  }

  playClick('down');

  if(stroke.id === 'enter' || stroke.id === 'tab'){
    if(!trialActive && !lessonActive && !raceActive && (typeof adaptiveActive === 'undefined' || !adaptiveActive)){
      insertText(stroke.charProduced);
    }
    return;
  }

  const val = stroke.charProduced;
  if(!val) return;

  // Active consumer routing
  if(typeof adaptiveActive !== 'undefined' && adaptiveActive){
    if(typeof adaptiveHandleChar === 'function') adaptiveHandleChar(val, el, stroke);
  } else if(typeof lessonActive !== 'undefined' && lessonActive){
    lessonHandleChar(val, el, stroke);
  } else if(typeof raceActive !== 'undefined' && raceActive){
    raceHandleChar(val, el, stroke);
  } else if(typeof trialActive !== 'undefined' && trialActive){
    if(typeof trialHandleChar === 'function') trialHandleChar(val, el, stroke);
  } else {
    emberBurst(el, ev, 6);
    runeRing(el);
    insertText(val);
  }
}

/* ---------- Physical Keyboard Support ---------- */
const heldModifiers = new Set();
let pendingCtrlTimer = null;
let pendingCtrlId = null;

function applyPendingCtrl(){
  if(!pendingCtrlId) return;
  const id = pendingCtrlId;
  pendingCtrlId = null;
  pendingCtrlTimer = null;
  heldModifiers.add('ctrl');
  recomputePhysicalLayer();
  if(keyEls[id]) keyEls[id].classList.add('pressed');
  triggerFingerPress(id);
  playClick('down');
}

function cancelPendingCtrl(){
  if(pendingCtrlTimer){
    clearTimeout(pendingCtrlTimer);
    pendingCtrlTimer = null;
  }
  pendingCtrlId = null;
}

function recomputePhysicalLayer(){
  const next = heldModifiers.has('altgr') ? 'altgr'
             : heldModifiers.has('shift') ? 'shift'
             : heldModifiers.has('ctrl')  ? 'ctrl'
             : null;
  if(next === physicalLayer) return;
  physicalLayer = next;
  render();
}

window.addEventListener('keydown', (e)=>{
  const t = e.target;
  if(t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
  if(e.isComposing || isComposing) return;

  const id = CODE_MAP[e.code];

  // If a non-AltGr key arrives while Ctrl is pending (e.g. fast Ctrl+C), flush Ctrl immediately
  if(pendingCtrlTimer && e.code !== 'AltRight' && e.key !== 'AltGraph'){
    applyPendingCtrl();
  }

  if(id === 'shiftL' || id === 'shiftR'){
    if(e.repeat) return;
    heldModifiers.add('shift');
    recomputePhysicalLayer();
    if(keyEls[id]) keyEls[id].classList.add('pressed');
    triggerFingerPress(id);
    playClick('down');
    return;
  }
  if(id === 'ctrlL'){
    if(e.repeat) return;
    // On Windows, pressing AltGr emits ControlLeft followed immediately by AltRight.
    // If AltGraph state is already reported by the browser, suppress synthetic ControlLeft completely!
    if(e.getModifierState && e.getModifierState('AltGraph')){
      return;
    }
    // Delay activating ctrlL for 35ms to allow AltRight to cancel it if AltGr was struck
    cancelPendingCtrl();
    pendingCtrlId = id;
    pendingCtrlTimer = setTimeout(applyPendingCtrl, 35);
    return;
  }
  if(id === 'ctrlR'){
    if(e.repeat) return;
    cancelPendingCtrl();
    heldModifiers.add('ctrl');
    recomputePhysicalLayer();
    if(keyEls[id]) keyEls[id].classList.add('pressed');
    triggerFingerPress(id);
    playClick('down');
    return;
  }
  if(id === 'altgr'){
    if(e.repeat) return;
    // Cancel any synthetic ControlLeft dispatched by Windows keyboard driver
    cancelPendingCtrl();
    heldModifiers.delete('ctrl');
    if(keyEls['ctrlL']) keyEls['ctrlL'].classList.remove('pressed');
    if(keyEls['ctrlR']) keyEls['ctrlR'].classList.remove('pressed');
    if(typeof triggerFingerRelease === 'function') triggerFingerRelease('ctrlL');

    heldModifiers.add('altgr');
    recomputePhysicalLayer();
    if(keyEls[id]) keyEls[id].classList.add('pressed');
    triggerFingerPress(id);
    playClick('down');
    return;
  }
  if(id === 'alt'){
    if(e.repeat) return;
    if(keyEls[id]) keyEls[id].classList.add('pressed');
    triggerFingerPress(id);
    playClick('down');
    return;
  }

  // Intercept Shift+Insert paste
  if(e.key === 'Insert' && e.shiftKey){
    e.preventDefault();
    if((typeof lessonActive !== 'undefined' && lessonActive) ||
       (typeof raceActive !== 'undefined' && raceActive) ||
       (typeof trialActive !== 'undefined' && trialActive)) return;
    if(navigator.clipboard && navigator.clipboard.readText){
      navigator.clipboard.readText().then(handlePasteText).catch(()=>{});
    }
    return;
  }

  const isAltGraph = (e.getModifierState && e.getModifierState('AltGraph')) || heldModifiers.has('altgr') || (e.ctrlKey && e.altKey);

  // Handle Ctrl / Meta shortcuts (only when not typing an AltGr glyph)
  if(!isAltGraph && (e.ctrlKey || e.metaKey)){
    const keyLower = (e.key || '').toLowerCase();

    // Browser navigation / dev tools passthrough (DO NOT block or prevent)
    if(keyLower === 'r' || keyLower === 'w' || keyLower === 't' || keyLower === 'p' || keyLower === 'f' || keyLower === 'l' || keyLower === 'n' || keyLower === 'j' || keyLower === 'u' || keyLower === 'g' || keyLower === 'q' || (e.shiftKey && (keyLower === 'i' || keyLower === 'c' || keyLower === 'j'))){
      return;
    }

    // Standard Clipboard & Editor Shortcuts
    if(keyLower === 'c'){
      e.preventDefault();
      copyManuscriptToClipboard();
      return;
    }
    if(keyLower === 'v'){
      e.preventDefault();
      if((typeof lessonActive !== 'undefined' && lessonActive) ||
         (typeof raceActive !== 'undefined' && raceActive) ||
         (typeof trialActive !== 'undefined' && trialActive)) return;
      if(navigator.clipboard && navigator.clipboard.readText){
        navigator.clipboard.readText().then(handlePasteText).catch(()=>{});
      }
      return;
    }
    if(keyLower === 'x'){
      e.preventDefault();
      cutManuscriptToClipboard();
      return;
    }
    if(keyLower === 'a'){
      e.preventDefault();
      selectAllManuscript();
      return;
    }
    if(keyLower === 'z'){
      e.preventDefault();
      if(e.shiftKey) redoManuscript();
      else undoManuscript();
      return;
    }
    if(keyLower === 'y'){
      e.preventDefault();
      redoManuscript();
      return;
    }
    if(e.key === 'Backspace'){
      e.preventDefault();
      backspaceWord();
      return;
    }

    // Check if key is an intentional Ctrl-layer glyph on Khmer layout
    if(id && currentLayoutId !== 'english' && glyphData[id] && glyphData[id].ctrl){
      if(keyEls[id]) keyEls[id].classList.add('pressed');
      e.preventDefault();
      typeKey(id);
      return;
    }

    // Pass through unhandled Ctrl combinations without typing unexpected characters
    return;
  }

  // If Alt key is held without AltGr, let shortcuts handler manage without typing letters
  if(e.altKey && !isAltGraph){
    return;
  }

  if(!id) return;
  if(id === 'caps'){ typeKey(id); return; }

  // Prevent holding down a key from repeatedly spamming inputs and racking up duplicate mistakes
  if(e.repeat && id !== 'backspace') return;

  // Strict System Language Enforcement for Khmer NiDA layout
  if(currentLayoutId === 'nida'){
    const isKhmerChar = e.key && /[\u1780-\u17FF]/.test(e.key);
    if(isKhmerChar){
      hideNidaSwitchHud();
    } else {
      const isEnglishLetter = e.code && e.code.startsWith('Key') && /^[a-zA-Z]$/.test(e.key);
      const isEnglishDigit = e.code && e.code.startsWith('Digit') && !e.shiftKey && /^[0-9]$/.test(e.key);
      const isEnglishSymbol = !e.shiftKey && (
        (e.code === 'Minus' && e.key === '-') ||
        (e.code === 'Equal' && e.key === '=') ||
        (e.code === 'BracketLeft' && e.key === '[') ||
        (e.code === 'BracketRight' && e.key === ']') ||
        (e.code === 'Semicolon' && e.key === ';') ||
        (e.code === 'Quote' && e.key === "'") ||
        (e.code === 'Backquote' && e.key === '`')
      );
      if(isEnglishLetter || isEnglishDigit || isEnglishSymbol){
        e.preventDefault();
        showNidaSwitchHud();
        return;
      }
    }
  }

  if(keyEls[id]) keyEls[id].classList.add('pressed');
  e.preventDefault();
  typeKey(id);
}, {passive:false});

window.addEventListener('keyup', (e)=>{
  const id = CODE_MAP[e.code];
  if(!id) return;
  if(keyEls[id]) keyEls[id].classList.remove('pressed');
  if(id === 'shiftL' || id === 'shiftR'){
    if(!e.shiftKey) heldModifiers.delete('shift');
    recomputePhysicalLayer();
    playClick('up');
  } else if(id === 'ctrlL' || id === 'ctrlR'){
    // If AltGr is held, ignore synthetic Windows ControlLeft keyup
    if(heldModifiers.has('altgr') || (e.getModifierState && e.getModifierState('AltGraph'))){
      cancelPendingCtrl();
      return;
    }
    cancelPendingCtrl();
    if(!e.ctrlKey) heldModifiers.delete('ctrl');
    recomputePhysicalLayer();
    playClick('up');
  } else if(id === 'altgr'){
    cancelPendingCtrl();
    heldModifiers.delete('altgr');
    if(!e.ctrlKey) heldModifiers.delete('ctrl');
    if(keyEls['ctrlL']) keyEls['ctrlL'].classList.remove('pressed');
    if(keyEls['ctrlR']) keyEls['ctrlR'].classList.remove('pressed');
    if(typeof triggerFingerRelease === 'function') triggerFingerRelease('ctrlL');
    recomputePhysicalLayer();
    playClick('up');
  } else if(id === 'alt'){
    playClick('up');
  } else if(id !== 'caps'){
    playClick('up');
  }
});

window.addEventListener('blur', ()=>{
  cancelPendingCtrl();
  heldModifiers.clear();
  physicalLayer = null;
  ['shiftL','shiftR','ctrlL','ctrlR','alt','altgr'].forEach(k => {
    if(keyEls[k]) keyEls[k].classList.remove('pressed');
  });
  render();
});

/* ================= Khmer NiDA Language Switch & Download Modal Logic ================= */
let nidaHudTimer = null;

function showNidaSwitchHud(){
  const hud = document.getElementById('nidaSwitchHud');
  if(!hud) return;
  hud.hidden = false;
  hud.classList.remove('wobble');
  void hud.offsetWidth; // trigger reflow
  hud.classList.add('wobble');
  clearTimeout(nidaHudTimer);
  nidaHudTimer = setTimeout(()=>{
    hideNidaSwitchHud();
  }, 7000);
}

function hideNidaSwitchHud(){
  clearTimeout(nidaHudTimer);
  const hud = document.getElementById('nidaSwitchHud');
  if(!hud) return;
  hud.hidden = true;
  hud.classList.remove('wobble');
}

window.showNidaSwitchHud = showNidaSwitchHud;
window.hideNidaSwitchHud = hideNidaSwitchHud;

function openNidaGuideModal(tabId = 'win-builtin'){
  const modal = document.getElementById('nidaGuideModal');
  if(!modal) return;
  modal.hidden = false;
  if(tabId) selectNidaGuideTab(tabId);
  const testInput = document.getElementById('nidaTestInput');
  if(testInput){
    testInput.value = '';
    updateNidaTestStatus('');
    setTimeout(()=>{ try{ testInput.focus(); }catch(e){} }, 120);
  }
}

function closeNidaGuideModal(){
  const modal = document.getElementById('nidaGuideModal');
  if(!modal) return;
  if(typeof window.closeModalAnimated === 'function'){
    window.closeModalAnimated(modal);
  } else {
    modal.hidden = true;
  }
}

window.openNidaGuideModal = openNidaGuideModal;
window.closeNidaGuideModal = closeNidaGuideModal;

function selectNidaGuideTab(tabId){
  const modal = document.getElementById('nidaGuideModal');
  if(!modal) return;
  modal.querySelectorAll('.nida-tab-btn').forEach(btn => {
    const isCurrent = btn.dataset.tab === tabId;
    btn.classList.toggle('active', isCurrent);
    btn.setAttribute('aria-selected', isCurrent ? 'true' : 'false');
  });
  modal.querySelectorAll('.nida-tab-panel').forEach(panel => {
    panel.hidden = panel.id !== `nidaTab-${tabId}`;
  });
}

function updateNidaTestStatus(val){
  const statusEl = document.getElementById('nidaTestStatus');
  if(!statusEl) return;
  const isKm = document.documentElement.classList.contains('site-km-mode');
  if(!val || !val.trim()){
    statusEl.innerHTML = `<span class="nida-test-badge neutral">${isKm ? 'រង់ចាំការវាយ...' : 'Waiting for keystroke...'}</span>`;
    return;
  }
  const hasKhmer = /[\u1780-\u17FF]/.test(val);
  const hasEnglish = /[a-zA-Z]/.test(val);
  if(hasKhmer){
    statusEl.innerHTML = `<span class="nida-test-badge good">${isKm ? '✅ ជោគជ័យ! ក្តារចុច Khmer NiDA ត្រឹមត្រូវ' : '✅ Success! Khmer NiDA keyboard is active!'}</span>`;
  } else if(hasEnglish){
    statusEl.innerHTML = `<span class="nida-test-badge bad">${isKm ? '❌ ក្តារចុចនៅតែជាភាសាអង់គ្លេស។ សូមចុច Win + Space' : '❌ Keyboard is in English. Press Win + Space to switch!'}</span>`;
  } else {
    statusEl.innerHTML = `<span class="nida-test-badge neutral">${isKm ? 'កំពុងវាយ...' : 'Typing...'}</span>`;
  }
}

document.addEventListener('DOMContentLoaded', ()=>{
  const hudGuideBtn = document.getElementById('nidaHudGuideBtn');
  if(hudGuideBtn) hudGuideBtn.addEventListener('click', () => openNidaGuideModal());

  const hudCloseBtn = document.getElementById('nidaHudCloseBtn');
  if(hudCloseBtn) hudCloseBtn.addEventListener('click', () => hideNidaSwitchHud());

  const guideCloseBtn = document.getElementById('nidaGuideCloseBtn');
  if(guideCloseBtn) guideCloseBtn.addEventListener('click', () => closeNidaGuideModal());

  const guideDoneBtn = document.getElementById('nidaGuideDoneBtn');
  if(guideDoneBtn) guideDoneBtn.addEventListener('click', () => closeNidaGuideModal());

  const guideModal = document.getElementById('nidaGuideModal');
  if(guideModal){
    guideModal.addEventListener('click', (e)=>{
      if(e.target === guideModal) closeNidaGuideModal();
    });
  }

  document.querySelectorAll('.nida-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => selectNidaGuideTab(btn.dataset.tab));
  });

  const testInput = document.getElementById('nidaTestInput');
  if(testInput){
    testInput.addEventListener('input', (e) => updateNidaTestStatus(e.target.value));
  }

  const testClearBtn = document.getElementById('nidaTestClearBtn');
  if(testClearBtn){
    testClearBtn.addEventListener('click', ()=>{
      if(testInput){
        testInput.value = '';
        updateNidaTestStatus('');
        testInput.focus();
      }
    });
  }
});
