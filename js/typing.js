/* ============================================================
   PK Khmer Type — Typing Engine, Manuscript & Key Input Handlers
   ============================================================ */

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

function backspaceText(){
  markTypingBurst();
  const cursor = outputEl.querySelector('.cursor');
  let node = cursor.previousSibling;
  if(node && node.nodeType === 3){
    node.textContent = node.textContent.slice(0, -1);
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

function typeKey(id, ev){
  const el = keyEls[id];
  press(el);
  triggerFingerPress(id);
  if(ev) burst(el, ev); else burst(el);
  playClick('down');

  if(id === 'backspace'){ if(!trialActive && !lessonActive && !raceActive) backspaceText(); return; }
  if(id === 'enter'){ if(!trialActive && !lessonActive && !raceActive) insertText('\n'); return; }
  if(id === 'tab'){ if(!trialActive && !lessonActive && !raceActive) insertText('\u0009'); return; }
  if(id === 'space'){
    const sm = (LAYOUTS[currentLayoutId] && LAYOUTS[currentLayoutId].spaceMap) ? LAYOUTS[currentLayoutId].spaceMap : null;
    const lyr = currentLayer();
    const charProduced = (sm && sm[lyr] !== undefined) ? sm[lyr] : (lyr === 'shift' ? ' ' : ' ');
    if(lessonActive){
      lessonHandleChar(charProduced, el);
    } else if(raceActive){
      raceHandleChar(charProduced, el);
    } else if(typeof trialActive !== 'undefined' && trialActive){
      if(typeof trialHandleChar === 'function') trialHandleChar(charProduced, el);
    } else {
      insertText(charProduced);
    }
    return;
  }
  if(id === 'caps'){
    if(currentLayoutId === 'english'){
      capsOn = !capsOn;
      if(el) el.classList.toggle('lit', capsOn);
    }
    return;
  }
  if(['shiftL','shiftR','ctrlL','ctrlR','alt','altgr'].includes(id)) return;

  const data = glyphData[id];
  if(!data) return;
  let layer = currentLayer();
  if(currentLayoutId === 'english' && capsOn && /^[a-z]$/.test(id)){
    layer = (layer === 'shift') ? 'base' : (layer === 'base' ? 'shift' : layer);
  }
  const val = data[layer] !== undefined && data[layer] !== '' ? data[layer] : (layer==='base' ? data.base : '');
  if(!val) return;

  if(raceActive){
    raceHandleChar(val, el);
  } else if(trialActive){
    trialHandleChar(val, el);
  } else if(lessonActive){
    lessonHandleChar(val, el);
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
