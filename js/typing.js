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
    if(layoutId === 'nida' && i + 1 < normalized.length){
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

/* ---------- Visual FX Stubs ---------- */
function emberBurst(el, ev, count, color){
  /* Disabled particle creation to eliminate typing lag */
}

function heatColor(){
  return null;
}

function runeRing(el){
  /* Disabled to eliminate DOM churn & typing lag */
}

function burst(el, ev){
  /* Disabled DOM-based ripple to eliminate layout reflow and lag */
}

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
    emberBurst(el, ev, 4);
    insertText(val);
  }
}

/* ---------- Physical Keyboard Support ---------- */
const heldModifiers = new Set();

function recomputePhysicalLayer(){
  if(heldModifiers.has('altgr')) physicalLayer = 'altgr';
  else if(heldModifiers.has('shift')) physicalLayer = 'shift';
  else if(heldModifiers.has('ctrl')) physicalLayer = 'ctrl';
  else physicalLayer = null;
  render();
}

window.addEventListener('keydown', (e)=>{
  const t = e.target;
  if(t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
  if(e.isComposing || isComposing) return;

  const id = CODE_MAP[e.code];

  if(id === 'shiftL' || id === 'shiftR'){
    heldModifiers.add('shift');
    recomputePhysicalLayer();
    if(keyEls[id]) keyEls[id].classList.add('pressed');
    triggerFingerPress(id);
    if(!e.repeat){
      playClick('down');
      if(typeof emberBurst === 'function') emberBurst(keyEls[id], null, 4, null);
    }
    return;
  }
  if(id === 'ctrlL' || id === 'ctrlR'){
    heldModifiers.add('ctrl');
    recomputePhysicalLayer();
    if(keyEls[id]) keyEls[id].classList.add('pressed');
    triggerFingerPress(id);
    if(!e.repeat){
      playClick('down');
      if(typeof emberBurst === 'function') emberBurst(keyEls[id], null, 4, null);
    }
    return;
  }
  if(id === 'altgr'){
    heldModifiers.add('altgr');
    recomputePhysicalLayer();
    if(keyEls[id]) keyEls[id].classList.add('pressed');
    triggerFingerPress(id);
    if(!e.repeat){
      playClick('down');
      if(typeof emberBurst === 'function') emberBurst(keyEls[id], null, 4, null);
    }
    return;
  }
  if(id === 'alt'){
    if(keyEls[id]) keyEls[id].classList.add('pressed');
    triggerFingerPress(id);
    if(!e.repeat){
      playClick('down');
      if(typeof emberBurst === 'function') emberBurst(keyEls[id], null, 4, null);
    }
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

  if(keyEls[id]) keyEls[id].classList.add('pressed');
  e.preventDefault();
  typeKey(id);
}, {passive:false});

window.addEventListener('keyup', (e)=>{
  const id = CODE_MAP[e.code];
  if(!id) return;
  if(keyEls[id]) keyEls[id].classList.remove('pressed');
  if(id === 'shiftL' || id === 'shiftR'){
    heldModifiers.delete('shift');
    recomputePhysicalLayer();
    playClick('up');
  } else if(id === 'ctrlL' || id === 'ctrlR'){
    heldModifiers.delete('ctrl');
    recomputePhysicalLayer();
    playClick('up');
  } else if(id === 'altgr'){
    heldModifiers.delete('altgr');
    if(!e.ctrlKey) heldModifiers.delete('ctrl');
    recomputePhysicalLayer();
    playClick('up');
  } else if(id === 'alt'){
    playClick('up');
  } else if(id !== 'caps'){
    playClick('up');
  }
});

window.addEventListener('blur', ()=>{
  heldModifiers.clear();
  physicalLayer = null;
  ['shiftL','shiftR','ctrlL','ctrlR','alt','altgr'].forEach(k => {
    if(keyEls[k]) keyEls[k].classList.remove('pressed');
  });
  render();
});
