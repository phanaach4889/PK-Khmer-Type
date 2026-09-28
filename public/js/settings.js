/* ============================================================
   PK Khmer Type — Settings, Themes, Audio & Accessibility
   ============================================================ */

const LS = window.LS || {
  theme:"khmerSettingTheme", reducedMotion:"khmerSettingReducedMotion",
  largeText:"khmerSettingLargeText", sound:"khmerSettingSound", hands:"khmerSettingHands",
  accent:"khmerSettingAccent", shiftPreview:"khmerSettingShiftPreview",
  keyHighlight:"khmerSettingKeyHighlight", highContrast:"khmerSettingHighContrast",
  compactKeys:"khmerSettingCompactKeys", keyFx:"khmerSettingKeyFx",
  motes:"khmerSettingMotes", torches:"khmerSettingTorches",
  scanlines:"khmerSettingScanlines", focusMode:"khmerSettingFocusMode",
  totals:"khmerGlobalStats"
};
window.LS = LS;
function safeGet(k, fallback){ try{ const v = localStorage.getItem(k); return v===null ? fallback : v; }catch(e){ return fallback; } }
function safeSet(k, v){ try{ localStorage.setItem(k, v); }catch(e){} }

/* ---------- temple confirm dialog (replaces native confirm()) ---------- */
function templeConfirm(message, opts){
  opts = opts || {};
  const backdrop = document.getElementById('templeConfirmModal');
  const titleEl = document.getElementById('templeConfirmTitle');
  const msgEl = document.getElementById('templeConfirmMsg');
  const iconEl = document.getElementById('templeConfirmIcon');
  const okBtn = document.getElementById('templeConfirmOkBtn');
  const cancelBtn = document.getElementById('templeConfirmCancelBtn');

  titleEl.textContent = opts.title || 'Are you sure?';
  msgEl.textContent = message;
  iconEl.innerHTML = opts.icon || (opts.danger ? pkIcon('alert', 24) : pkIcon('settings', 24));
  okBtn.textContent = opts.confirmLabel || (opts.danger ? 'Yes, continue' : 'Continue');
  cancelBtn.textContent = opts.cancelLabel || 'Cancel';
  backdrop.classList.toggle('is-danger', !!opts.danger);

  return new Promise((resolve)=>{
    let settled = false;
    function close(result){
      if(settled) return;
      settled = true;
      backdrop.hidden = true;
      okBtn.removeEventListener('click', onOk);
      cancelBtn.removeEventListener('click', onCancel);
      backdrop.removeEventListener('click', onBackdrop);
      document.removeEventListener('keydown', onKey);
      resolve(result);
    }
    function onOk(){ close(true); }
    function onCancel(){ close(false); }
    function onBackdrop(e){ if(e.target === backdrop) close(false); }
    function onKey(e){
      if(e.key === 'Escape') close(false);
      if(e.key === 'Enter') close(true);
    }
    okBtn.addEventListener('click', onOk);
    cancelBtn.addEventListener('click', onCancel);
    backdrop.addEventListener('click', onBackdrop);
    document.addEventListener('keydown', onKey);
    backdrop.hidden = false;
    requestAnimationFrame(()=> cancelBtn.focus());
  });
}


/* ---------- temple ambience drone ---------- */
let ambienceOn = false;
let ambienceNodes = null;
const ambienceToggle = document.getElementById('ambienceToggle');
function startAmbience(){
  try{
    ensureAudio();
    const t = audioCtx.currentTime;
    const master = audioCtx.createGain();
    master.gain.setValueAtTime(0, t);
    master.gain.linearRampToValueAtTime(0.05, t + 1.2);
    master.connect(audioCtx.destination);

    const drone1 = audioCtx.createOscillator();
    drone1.type = 'sine'; drone1.frequency.setValueAtTime(98, t);
    const drone2 = audioCtx.createOscillator();
    drone2.type = 'sine'; drone2.frequency.setValueAtTime(147.5, t);
    const lfo = audioCtx.createOscillator();
    lfo.type = 'sine'; lfo.frequency.setValueAtTime(0.08, t);
    const lfoGain = audioCtx.createGain();
    lfoGain.gain.setValueAtTime(0.02, t);
    lfo.connect(lfoGain).connect(master.gain);

    drone1.connect(master);
    drone2.connect(master);
    drone1.start(t); drone2.start(t); lfo.start(t);
    ambienceNodes = {master, drone1, drone2, lfo};
  }catch(e){ /* audio unavailable */ }
}
function stopAmbience(){
  if(!ambienceNodes) return;
  try{
    const t = audioCtx.currentTime;
    ambienceNodes.master.gain.linearRampToValueAtTime(0, t + 0.6);
    setTimeout(()=>{
      try{
        ambienceNodes.drone1.stop(); ambienceNodes.drone2.stop(); ambienceNodes.lfo.stop();
      }catch(e){}
      ambienceNodes = null;
    }, 650);
  }catch(e){ ambienceNodes = null; }
}
ambienceToggle.addEventListener('click', ()=>{
  ambienceOn = !ambienceOn;
  ambienceToggle.classList.toggle('on', ambienceOn);
  ambienceToggle.innerHTML = pkIcon('castle', 15) + ' ' + (ambienceOn ? 'Ambience on' : 'Temple ambience');
  if(ambienceOn) startAmbience(); else stopAmbience();
});


function playChime(){
  if(!soundOn) return;
  try{
    ensureAudio();
    const t = audioCtx.currentTime;
    [660, 880, 1320].forEach((freq, i)=>{
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + i*0.07);
      gain.gain.setValueAtTime(0.0001, t + i*0.07);
      gain.gain.exponentialRampToValueAtTime(0.11, t + i*0.07 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + i*0.07 + 0.5);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(t + i*0.07);
      osc.stop(t + i*0.07 + 0.55);
    });
  }catch(e){ /* audio unavailable, ignore */ }
}


let audioCtx = null;
let noiseBuffer = null;
let soundOn = true;

function ensureAudio(){
  if(!audioCtx){
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const len = audioCtx.sampleRate * 0.05;
    noiseBuffer = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for(let i=0;i<len;i++){ data[i] = (Math.random()*2 - 1) * (1 - i/len); }
  }
  if(audioCtx.state === 'suspended') audioCtx.resume();
}

function playClick(kind){
  if(!soundOn) return;
  try{
    ensureAudio();
    const t = audioCtx.currentTime;

    // percussive "clack" transient — filtered noise burst
    const noise = audioCtx.createBufferSource();
    noise.buffer = noiseBuffer;
    const noiseFilter = audioCtx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.setValueAtTime(kind === 'down' ? 1800 : 2600, t);
    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(kind === 'down' ? 0.22 : 0.12, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.035);
    noise.connect(noiseFilter).connect(noiseGain).connect(audioCtx.destination);
    noise.start(t);
    noise.stop(t + 0.04);

    // low tonal thump for body
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    const base = kind === 'down' ? 190 : 260;
    osc.frequency.setValueAtTime(base + Math.random()*20, t);
    osc.frequency.exponentialRampToValueAtTime(base * 0.6, t + 0.06);
    gain.gain.setValueAtTime(kind === 'down' ? 0.09 : 0.05, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + 0.09);
  }catch(e){ /* audio unavailable, ignore */ }
}
soundToggle.addEventListener('click', ()=>{
  soundOn = !soundOn;
  soundToggle.classList.toggle('on', soundOn);
  soundToggle.innerHTML = (soundOn ? pkIcon('volume', 15) : pkIcon('volume-mute', 15)) + ' Key sound';
  if(soundOn) playClick('down');
});

/* ---------- typing / manuscript ---------- */

function initSettingsToggles(){
  function safeSet(k, v){ try{ localStorage.setItem(k, v); }catch(e){} }

  /* ---------- theme ---------- */
  const themeButtons = document.querySelectorAll('#themeChoice button');
  function applyTheme(mode){
    const sysDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const effective = mode === 'system' ? (sysDark ? 'dark' : 'light') : mode;
    document.documentElement.classList.toggle('theme-light', effective === 'light');
    document.documentElement.classList.toggle('theme-temple', effective === 'temple');
    document.documentElement.classList.toggle('theme-moonlight', effective === 'moonlight');
    document.documentElement.classList.toggle('theme-jungle', effective === 'jungle');
    document.documentElement.classList.toggle('theme-sunset', effective === 'sunset');
    document.documentElement.classList.toggle('theme-sepia', effective === 'sepia');
    themeButtons.forEach(b=> b.classList.toggle('active', b.dataset.theme === mode));
    safeSet(LS.theme, mode);
  }
  themeButtons.forEach(b=> b.addEventListener('click', ()=> applyTheme(b.dataset.theme)));
  applyTheme(safeGet(LS.theme, 'dark'));

  /* ---------- accent color ---------- */
  const ACCENTS = {
    gold:     { gold:'#ff9d2e', bright:'#ffd166' },
    jade:     { gold:'#3f9d6b', bright:'#5fd694' },
    sapphire: { gold:'#2f6fa8', bright:'#2dd4a7' },
    ruby:     { gold:'#a8404a', bright:'#ff5a70' },
  };
  const accentButtons = document.querySelectorAll('#accentChoice button');
  function applyAccent(name){
    const a = ACCENTS[name] || ACCENTS.gold;
    document.documentElement.style.setProperty('--gold', a.gold);
    document.documentElement.style.setProperty('--gold-bright', a.bright);
    accentButtons.forEach(b=> b.classList.toggle('active', b.dataset.accent === name));
    safeSet(LS.accent, name);
  }
  accentButtons.forEach(b=> b.addEventListener('click', ()=> applyAccent(b.dataset.accent)));
  applyAccent(safeGet(LS.accent, 'gold'));

  /* ---------- custom wallpaper ---------- */
  const customWallpaperLayer = document.getElementById('customWallpaperLayer');
  const customWallpaperDim = document.getElementById('customWallpaperDim');
  const uploadWallpaperBtn = document.getElementById('uploadWallpaperBtn');
  const urlWallpaperBtn = document.getElementById('urlWallpaperBtn');
  const wallpaperFileInput = document.getElementById('wallpaperFileInput');
  const removeWallpaperBtn = document.getElementById('removeWallpaperBtn');
  const wallpaperDimControl = document.getElementById('wallpaperDimControl');
  const wallpaperDimSlider = document.getElementById('wallpaperDimSlider');
  const wallpaperDimValue = document.getElementById('wallpaperDimValue');

  const WALLPAPER_KEY = 'khmerCustomWallpaper';
  const WALLPAPER_DIM_KEY = 'khmerCustomWallpaperDim';

  function applyWallpaper(url, dimPct){
    if(!url || !customWallpaperLayer) return;
    dimPct = dimPct !== undefined ? dimPct : (parseInt(safeGet(WALLPAPER_DIM_KEY, '65'), 10) || 65);
    customWallpaperLayer.style.backgroundImage = 'url("' + url + '")';
    document.documentElement.style.setProperty('--wallpaper-dim', (dimPct / 100).toString());
    document.body.classList.add('has-custom-wallpaper');
    if(removeWallpaperBtn) removeWallpaperBtn.style.display = 'inline-flex';
    if(wallpaperDimControl) wallpaperDimControl.style.display = 'flex';
    if(wallpaperDimSlider) wallpaperDimSlider.value = dimPct;
    if(wallpaperDimValue) wallpaperDimValue.textContent = dimPct + '%';
  }

  function removeWallpaper(){
    try{ localStorage.removeItem(WALLPAPER_KEY); }catch(e){}
    try{ localStorage.removeItem(WALLPAPER_DIM_KEY); }catch(e){}
    document.body.classList.remove('has-custom-wallpaper');
    if(customWallpaperLayer) customWallpaperLayer.style.backgroundImage = '';
    if(removeWallpaperBtn) removeWallpaperBtn.style.display = 'none';
    if(wallpaperDimControl) wallpaperDimControl.style.display = 'none';
    if(wallpaperFileInput) wallpaperFileInput.value = '';
    if(typeof showToast === 'function') showToast(pkIcon('reset', 18), 'Wallpaper removed', 'Restored default background.');
  }

  if(uploadWallpaperBtn && wallpaperFileInput){
    uploadWallpaperBtn.addEventListener('click', ()=> wallpaperFileInput.click());
    wallpaperFileInput.addEventListener('change', ()=>{
      const file = wallpaperFileInput.files && wallpaperFileInput.files[0];
      if(!file) return;
      const reader = new FileReader();
      reader.onload = (e)=>{
        const img = new Image();
        img.onload = ()=>{
          const maxDim = 1920;
          let w = img.width, h = img.height;
          if(w > maxDim || h > maxDim){
            if(w > h){ h = Math.round(h * maxDim / w); w = maxDim; }
            else { w = Math.round(w * maxDim / h); h = maxDim; }
          }
          const canvas = document.createElement('canvas');
          canvas.width = w; canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          safeSet(WALLPAPER_KEY, dataUrl);
          applyWallpaper(dataUrl);
          if(typeof showToast === 'function') showToast(pkIcon('check', 18), 'Wallpaper applied', 'Custom background updated.');
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  if(urlWallpaperBtn){
    urlWallpaperBtn.addEventListener('click', ()=>{
      const current = safeGet(WALLPAPER_KEY, '');
      const url = prompt('Enter image URL (PNG, JPG, WebP):', current.startsWith('http') ? current : '');
      if(url && url.trim()){
        const cleanUrl = url.trim();
        safeSet(WALLPAPER_KEY, cleanUrl);
        applyWallpaper(cleanUrl);
        if(typeof showToast === 'function') showToast(pkIcon('check', 18), 'Wallpaper applied', 'Custom background updated.');
      }
    });
  }

  if(removeWallpaperBtn){
    removeWallpaperBtn.addEventListener('click', removeWallpaper);
  }

  if(wallpaperDimSlider){
    wallpaperDimSlider.addEventListener('input', ()=>{
      const val = parseInt(wallpaperDimSlider.value, 10) || 65;
      document.documentElement.style.setProperty('--wallpaper-dim', (val / 100).toString());
      if(wallpaperDimValue) wallpaperDimValue.textContent = val + '%';
      safeSet(WALLPAPER_DIM_KEY, String(val));
    });
  }

  // Load saved custom wallpaper on boot
  const savedWallpaper = safeGet(WALLPAPER_KEY, null);
  if(savedWallpaper){
    applyWallpaper(savedWallpaper, parseInt(safeGet(WALLPAPER_DIM_KEY, '65'), 10));
  }

  /* ---------- reduced motion ---------- */
  const reducedMotionToggle = document.getElementById('reducedMotionToggle');
  function applyReducedMotion(on){
    document.documentElement.classList.toggle('reduce-motion', on);
    document.documentElement.classList.toggle('motion-override', true); // let our explicit class be authoritative
    reducedMotionToggle.classList.toggle('on', on);
    reducedMotionToggle.setAttribute('aria-checked', String(on));
    safeSet(LS.reducedMotion, on ? '1' : '0');
  }
  reducedMotionToggle.addEventListener('click', ()=> applyReducedMotion(!reducedMotionToggle.classList.contains('on')));
  reducedMotionToggle.addEventListener('keydown', e=>{ if(e.key===' '||e.key==='Enter'){ e.preventDefault(); reducedMotionToggle.click(); }});
  applyReducedMotion(safeGet(LS.reducedMotion, (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) ? '1' : '0') === '1');

  /* ---------- high contrast ---------- */
  const highContrastToggle = document.getElementById('highContrastToggle');
  function applyHighContrast(on){
    document.documentElement.classList.toggle('high-contrast', on);
    highContrastToggle.classList.toggle('on', on);
    highContrastToggle.setAttribute('aria-checked', String(on));
    safeSet(LS.highContrast, on ? '1' : '0');
  }
  highContrastToggle.addEventListener('click', ()=> applyHighContrast(!highContrastToggle.classList.contains('on')));
  highContrastToggle.addEventListener('keydown', e=>{ if(e.key===' '||e.key==='Enter'){ e.preventDefault(); highContrastToggle.click(); }});
  applyHighContrast(safeGet(LS.highContrast, '0') === '1');

  /* ---------- large text ---------- */
  const largeTextToggle = document.getElementById('largeTextToggle');
  function applyLargeText(on){
    document.documentElement.classList.toggle('large-text', on);
    largeTextToggle.classList.toggle('on', on);
    largeTextToggle.setAttribute('aria-checked', String(on));
    safeSet(LS.largeText, on ? '1' : '0');
  }
  largeTextToggle.addEventListener('click', ()=> applyLargeText(!largeTextToggle.classList.contains('on')));
  largeTextToggle.addEventListener('keydown', e=>{ if(e.key===' '||e.key==='Enter'){ e.preventDefault(); largeTextToggle.click(); }});
  applyLargeText(safeGet(LS.largeText, '0') === '1');

  /* ---------- shift-key corner preview ---------- */
  const shiftPreviewToggle = document.getElementById('shiftPreviewToggle');
  function applyShiftPreview(on){
    document.documentElement.classList.toggle('hide-shift-badges', !on);
    shiftPreviewToggle.classList.toggle('on', on);
    shiftPreviewToggle.setAttribute('aria-checked', String(on));
    safeSet(LS.shiftPreview, on ? '1' : '0');
  }
  shiftPreviewToggle.addEventListener('click', ()=> applyShiftPreview(!shiftPreviewToggle.classList.contains('on')));
  shiftPreviewToggle.addEventListener('keydown', e=>{ if(e.key===' '||e.key==='Enter'){ e.preventDefault(); shiftPreviewToggle.click(); }});
  applyShiftPreview(safeGet(LS.shiftPreview, '1') === '1');

  /* ---------- "highlight next key" glow during lessons ---------- */
  const keyHighlightToggle = document.getElementById('keyHighlightToggle');
  function applyKeyHighlight(on){
    document.documentElement.classList.toggle('hide-key-highlight', !on);
    keyHighlightToggle.classList.toggle('on', on);
    keyHighlightToggle.setAttribute('aria-checked', String(on));
    safeSet(LS.keyHighlight, on ? '1' : '0');
  }
  keyHighlightToggle.addEventListener('click', ()=> applyKeyHighlight(!keyHighlightToggle.classList.contains('on')));
  keyHighlightToggle.addEventListener('keydown', e=>{ if(e.key===' '||e.key==='Enter'){ e.preventDefault(); keyHighlightToggle.click(); }});
  applyKeyHighlight(safeGet(LS.keyHighlight, '1') === '1');

  /* ---------- compact keyboard ---------- */
  const compactKeysToggle = document.getElementById('compactKeysToggle');
  function applyCompactKeys(on){
    document.documentElement.classList.toggle('compact-keys', on);
    compactKeysToggle.classList.toggle('on', on);
    compactKeysToggle.setAttribute('aria-checked', String(on));
    safeSet(LS.compactKeys, on ? '1' : '0');
  }
  compactKeysToggle.addEventListener('click', ()=> applyCompactKeys(!compactKeysToggle.classList.contains('on')));
  compactKeysToggle.addEventListener('keydown', e=>{ if(e.key===' '||e.key==='Enter'){ e.preventDefault(); compactKeysToggle.click(); }});
  applyCompactKeys(safeGet(LS.compactKeys, '0') === '1');

  /* ---------- key press effects (ripple + ember burst) ---------- */
  const keyFxToggle = document.getElementById('keyFxToggle');
  function applyKeyFx(on){
    document.documentElement.classList.toggle('hide-key-fx', !on);
    keyFxToggle.classList.toggle('on', on);
    keyFxToggle.setAttribute('aria-checked', String(on));
    safeSet(LS.keyFx, on ? '1' : '0');
  }
  keyFxToggle.addEventListener('click', ()=> applyKeyFx(!keyFxToggle.classList.contains('on')));
  keyFxToggle.addEventListener('keydown', e=>{ if(e.key===' '||e.key==='Enter'){ e.preventDefault(); keyFxToggle.click(); }});
  applyKeyFx(safeGet(LS.keyFx, '1') === '1');

  /* ---------- ember particles (ambient motes) ---------- */
  const motesToggle = document.getElementById('motesToggle');
  function applyMotes(on){
    document.documentElement.classList.toggle('hide-motes', !on);
    motesToggle.classList.toggle('on', on);
    motesToggle.setAttribute('aria-checked', String(on));
    safeSet(LS.motes, on ? '1' : '0');
  }
  motesToggle.addEventListener('click', ()=> applyMotes(!motesToggle.classList.contains('on')));
  motesToggle.addEventListener('keydown', e=>{ if(e.key===' '||e.key==='Enter'){ e.preventDefault(); motesToggle.click(); }});
  applyMotes(safeGet(LS.motes, '1') === '1');

  /* ---------- torch flames ---------- */
  const torchesToggle = document.getElementById('torchesToggle');
  function applyTorches(on){
    document.documentElement.classList.toggle('hide-torches', !on);
    torchesToggle.classList.toggle('on', on);
    torchesToggle.setAttribute('aria-checked', String(on));
    safeSet(LS.torches, on ? '1' : '0');
  }
  torchesToggle.addEventListener('click', ()=> applyTorches(!torchesToggle.classList.contains('on')));
  torchesToggle.addEventListener('keydown', e=>{ if(e.key===' '||e.key==='Enter'){ e.preventDefault(); torchesToggle.click(); }});
  applyTorches(safeGet(LS.torches, '1') === '1');

  /* ---------- holographic scanline overlay ---------- */
  const scanlinesToggle = document.getElementById('scanlinesToggle');
  function applyScanlines(on){
    document.documentElement.classList.toggle('scanlines-on', on);
    scanlinesToggle.classList.toggle('on', on);
    scanlinesToggle.setAttribute('aria-checked', String(on));
    safeSet(LS.scanlines, on ? '1' : '0');
  }
  scanlinesToggle.addEventListener('click', ()=> applyScanlines(!scanlinesToggle.classList.contains('on')));
  scanlinesToggle.addEventListener('keydown', e=>{ if(e.key===' '||e.key==='Enter'){ e.preventDefault(); scanlinesToggle.click(); }});
  applyScanlines(safeGet(LS.scanlines, '0') === '1');

  /* ---------- focus mode ---------- */
  const focusModeToggle = document.getElementById('focusModeToggle');
  const focusModeBtn = document.getElementById('focusModeBtn');

  window.applyFocusMode = applyFocusMode;
  function applyFocusMode(on){
    document.documentElement.classList.toggle('focus-mode', on);
    if(focusModeToggle){
      focusModeToggle.classList.toggle('on', on);
      focusModeToggle.setAttribute('aria-checked', String(on));
    }
    if(focusModeBtn){
      focusModeBtn.classList.toggle('active', on);
      focusModeBtn.setAttribute('aria-pressed', String(on));
      const textSpan = focusModeBtn.querySelector('.focus-btn-text');
      const isKm = document.documentElement.classList.contains('site-km-mode');
      if(textSpan){
        if(on){
          textSpan.setAttribute('data-en', 'Exit Focus');
          textSpan.setAttribute('data-km', 'ចាកចេញពីផ្ដោត');
          textSpan.textContent = isKm ? 'ចាកចេញពីផ្ដោត' : 'Exit Focus';
        } else {
          textSpan.setAttribute('data-en', 'Focus');
          textSpan.setAttribute('data-km', 'ផ្ដោត');
          textSpan.textContent = isKm ? 'ផ្ដោត' : 'Focus';
        }
      }
    }
    safeSet(LS.focusMode, on ? '1' : '0');
  }

  if(focusModeToggle){
    focusModeToggle.addEventListener('click', ()=> applyFocusMode(!focusModeToggle.classList.contains('on')));
    focusModeToggle.addEventListener('keydown', e=>{ if(e.key===' '||e.key==='Enter'){ e.preventDefault(); focusModeToggle.click(); }});
  }

  if(focusModeBtn){
    focusModeBtn.addEventListener('click', ()=>{
      const willBeOn = !document.documentElement.classList.contains('focus-mode');
      applyFocusMode(willBeOn);
      if(typeof showToast === 'function'){
        if(willBeOn){
          showToast(pkIcon('zap', 18), 'Focus Mode Active', 'Distractions hidden. Press Esc or Alt+F anytime to exit.');
        } else {
          showToast(pkIcon('eye', 18), 'Focus Mode Off', 'Interface restored.');
        }
      }
    });
  }

  // Keyboard shortcut: Escape exits focus mode (if no modal is open), Alt+F toggles it
  window.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape' && document.documentElement.classList.contains('focus-mode')){
      const anyModalOpen = document.querySelector('.modal-backdrop:not([hidden])');
      if(!anyModalOpen){
        applyFocusMode(false);
      }
    } else if(e.altKey && (e.key === 'f' || e.key === 'F')){
      e.preventDefault();
      applyFocusMode(!document.documentElement.classList.contains('focus-mode'));
    }
  });

  applyFocusMode(safeGet(LS.focusMode, '0') === '1');

  /* ---------- mirror sound / finger-guide toggles into the settings panel ---------- */
  const settingsSoundToggle = document.getElementById('settingsSoundToggle');
  const settingsHandsToggle = document.getElementById('settingsHandsToggle');
  function syncSettingsMirrors(){
    settingsSoundToggle.classList.toggle('on', soundToggle.classList.contains('on'));
    settingsHandsToggle.classList.toggle('on', handsToggle.classList.contains('on'));
  }
  settingsSoundToggle.addEventListener('click', ()=> soundToggle.click());
  settingsHandsToggle.addEventListener('click', ()=> handsToggle.click());
  soundToggle.addEventListener('click', syncSettingsMirrors);
  handsToggle.addEventListener('click', syncSettingsMirrors);
  syncSettingsMirrors();

  /* ---------- settings modal open/close ---------- */
  const settingsModal = document.getElementById('settingsModal');
  const settingsOpenBtn = document.getElementById('settingsOpenBtn');
  const settingsCloseBtn = document.getElementById('settingsCloseBtn');
  settingsOpenBtn.addEventListener('click', ()=>{ syncSettingsMirrors(); settingsModal.hidden = false; settingsCloseBtn.focus(); });
  settingsCloseBtn.addEventListener('click', ()=> settingsModal.hidden = true);
  settingsModal.addEventListener('click', e=>{ if(e.target === settingsModal) settingsModal.hidden = true; });

  document.addEventListener('keydown', e=>{
    if(e.key === 'Escape'){ statsModal.hidden = true; settingsModal.hidden = true; }
  });

}

if(document.readyState === "loading"){
  document.addEventListener("DOMContentLoaded", initSettingsToggles);
} else {
  initSettingsToggles();
}

(function(){
  var LANG_KEY = 'kk_site_lang';
  function safeGetLang(k, fb){ try{ var v = localStorage.getItem(k); return v===null ? fb : v; }catch(e){ return fb; } }
  function safeSetLang(k, v){ try{ localStorage.setItem(k, v); }catch(e){} }

  var toggleBtn = document.getElementById('siteLangToggle');
  var toggleLabel = document.getElementById('siteLangToggleLabel');
  var topToggleBtn = document.getElementById('topLangToggleBtn');
  var topToggleLabel = document.getElementById('topLangToggleLabel');
  var nodes = document.querySelectorAll('.i18n-t');

  function applyLang(lang){
    var isKm = lang === 'km';
    for(var i=0;i<nodes.length;i++){
      var el = nodes[i];
      var text = el.getAttribute(isKm ? 'data-km' : 'data-en');
      if(text !== null){ el.innerHTML = text; }
      if(isKm){ el.setAttribute('lang','km'); } else { el.removeAttribute('lang'); }
    }
    document.documentElement.setAttribute('lang', isKm ? 'km' : 'en');
    document.documentElement.classList.toggle('site-km-mode', isKm);
    if(toggleBtn){ toggleBtn.setAttribute('aria-pressed', String(isKm)); }
    if(toggleLabel){ toggleLabel.textContent = isKm ? 'English' : 'ភាសាខ្មែរ'; }
    if(toggleBtn){ toggleBtn.setAttribute('aria-label', isKm ? 'Switch site back to English' : 'Translate site to Khmer'); }

    if(topToggleBtn){
      topToggleBtn.setAttribute('aria-pressed', String(isKm));
      topToggleBtn.setAttribute('aria-label', isKm ? 'Switch back to English' : 'Translate English to Khmer');
      topToggleBtn.setAttribute('title', isKm ? 'Switch back to English (Alt+L)' : 'Translate English to Khmer (Alt+L)');
      topToggleBtn.classList.toggle('active', isKm);
    }
    if(topToggleLabel){
      topToggleLabel.textContent = isKm ? 'English' : 'Translate to Khmer';
    }
  }

  function toggleSiteLanguage(){
    var next = document.documentElement.classList.contains('site-km-mode') ? 'en' : 'km';
    safeSetLang(LANG_KEY, next);
    applyLang(next);
  }

  var startLang = safeGetLang(LANG_KEY, 'en');
  applyLang(startLang);

  if(toggleBtn){
    toggleBtn.addEventListener('click', toggleSiteLanguage);
  }
  if(topToggleBtn){
    topToggleBtn.addEventListener('click', toggleSiteLanguage);
  }
  window.applySiteLanguage = applyLang;
  window.toggleSiteLanguage = toggleSiteLanguage;

  /* ---------- developer note modal ---------- */
  var devNoteModal = document.getElementById('devNoteModal');
  var devNoteBtn = document.getElementById('siteDevNoteBtn');
  var devNoteCloseBtn = document.getElementById('devNoteCloseBtn');
  var devNoteCloseBtn2 = document.getElementById('devNoteCloseBtn2');
  function openDevNote(){
    if(!devNoteModal) return;
    devNoteModal.hidden = false;
    if(devNoteCloseBtn) devNoteCloseBtn.focus();
  }
  function closeDevNote(){ if(devNoteModal) devNoteModal.hidden = true; }
  if(devNoteBtn) devNoteBtn.addEventListener('click', openDevNote);
  if(devNoteCloseBtn) devNoteCloseBtn.addEventListener('click', closeDevNote);
  if(devNoteCloseBtn2) devNoteCloseBtn2.addEventListener('click', closeDevNote);
  if(devNoteModal){
    devNoteModal.addEventListener('click', function(e){ if(e.target === devNoteModal) closeDevNote(); });
    devNoteModal.addEventListener('keydown', function(e){ if(e.key === 'Escape') closeDevNote(); });
  }
})();
