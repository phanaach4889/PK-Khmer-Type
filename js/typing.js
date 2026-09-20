/* ============================================================
   PK Khmer Type — Typing Engine, Manuscript & Key Input Handlers
   ============================================================ */

const outputEl = document.getElementById("output");
const placeholderEl = document.getElementById("placeholder");
const clearBtn = document.getElementById("clearBtn");
const copyBtn = document.getElementById("copyBtn");
const manuscriptEl = document.getElementById("manuscript");

if(copyBtn){
  copyBtn.addEventListener("click", ()=>{
    if(!outputEl) return;
    navigator.clipboard.writeText(outputEl.textContent).then(()=>{
      if(typeof showToast === "function") showToast(pkIcon("copy", 18), "Copied", "Text copied to clipboard.");
    }).catch(()=>{});
  });
}
if(clearBtn){
  clearBtn.addEventListener("click", ()=> clearText());
}

/* ---------- ember burst ---------- */
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

/* ---------- sound ---------- */

function updatePlaceholder(){
  const hasText = outputEl.textContent.replace(/\u200b/g,'').trim().length > 0
    || Array.from(outputEl.childNodes).some(n => n.nodeType===3 && n.textContent.length>0);
  placeholderEl.style.display = (outputEl.querySelector('.cursor') && outputEl.textContent.trim().length===0) ? 'inline' : 'none';
}

function insertText(str){
  const cursor = outputEl.querySelector('.cursor');
  const textNode = document.createTextNode(str);
  outputEl.insertBefore(textNode, cursor);
  placeholderEl.style.display = 'none';
  outputEl.classList.add('ink-flash');
  clearTimeout(insertText._t);
  insertText._t = setTimeout(()=> outputEl.classList.remove('ink-flash'), 420);
}

function backspaceText(){
  const cursor = outputEl.querySelector('.cursor');
  let node = cursor.previousSibling;
  if(node && node.nodeType === 3){
    node.textContent = node.textContent.slice(0, -1);
    if(node.textContent.length === 0) node.remove();
  }
  if(!outputEl.textContent.trim()) placeholderEl.style.display = 'inline';
}

function clearText(){
  Array.from(outputEl.childNodes).forEach(n=>{
    if(n.nodeType === 3) n.remove();
  });
  placeholderEl.style.display = 'inline';
}
clearBtn.addEventListener('click', clearText);

copyBtn.addEventListener('click', async ()=>{
  const text = outputEl.textContent.replace(/\u200b/g,'');
  try{
    await navigator.clipboard.writeText(text);
    copyBtn.textContent = 'Copied!';
  }catch(e){
    // fallback for browsers without clipboard API access
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try{ document.execCommand('copy'); copyBtn.textContent = 'Copied!'; }
    catch(e2){ copyBtn.textContent = 'Failed'; }
    document.body.removeChild(ta);
  }
  setTimeout(()=>{ copyBtn.textContent = 'Copy'; }, 1200);
});


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
    if(lessonActive){
      lessonHandleChar(' ', el);
    } else if(raceActive){
      raceHandleChar(' ', el);
    } else if(!trialActive){
      const sm = LAYOUTS[currentLayoutId].spaceMap;
      insertText(sm[currentLayer()] !== undefined ? sm[currentLayer()] : sm.base);
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
    recordKeystroke(true);
  }
}

/* ---------- physical keyboard support ---------- */

const heldModifiers = new Set();

function recomputePhysicalLayer(){
  if(heldModifiers.has('shift')) physicalLayer = 'shift';
  else if(heldModifiers.has('ctrl')) physicalLayer = 'ctrl';
  else if(heldModifiers.has('altgr')) physicalLayer = 'altgr';
  else physicalLayer = null;
  render();
}

window.addEventListener('keydown', (e)=>{
  const t = e.target;
  if(t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;

  const id = CODE_MAP[e.code];
  if(!id) return;

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

