/* ============================================================
   PK Khmer Type — Universal Keyboard Shortcuts System
   ============================================================ */

(function(){
  const shortcutsModal = document.getElementById('shortcutsModal');
  const shortcutsOpenBtn = document.getElementById('shortcutsOpenBtn');
  const shortcutsCloseBtn = document.getElementById('shortcutsCloseBtn');

  function openShortcutsModal(){
    if(!shortcutsModal) return;
    shortcutsModal.hidden = false;
    if(shortcutsCloseBtn) shortcutsCloseBtn.focus();
  }

  function closeShortcutsModal(){
    if(!shortcutsModal) return;
    if(typeof window.closeModalAnimated === 'function'){
      window.closeModalAnimated(shortcutsModal);
    } else {
      shortcutsModal.hidden = true;
    }
  }

  function toggleShortcutsModal(){
    if(!shortcutsModal) return;
    if(shortcutsModal.hidden) openShortcutsModal();
    else closeShortcutsModal();
  }

  if(shortcutsOpenBtn){
    shortcutsOpenBtn.addEventListener('click', openShortcutsModal);
  }
  if(shortcutsCloseBtn){
    shortcutsCloseBtn.addEventListener('click', closeShortcutsModal);
  }
  if(shortcutsModal){
    shortcutsModal.addEventListener('click', (e)=>{
      if(e.target === shortcutsModal) closeShortcutsModal();
    });
  }

  /* ============================================================
     Remade Alt + F Focus Mode Shortcut Engine (Audio + HUD + Key Flash)
     ============================================================ */
  let focusHudTimer = null;
  let focusRippleTimer = null;

  function playFocusModeSound(entering){
    try {
      if(typeof soundOn !== 'undefined' && !soundOn) return;
      const ctx = (typeof getAudio === 'function') ? getAudio() : null;
      if(!ctx) return;
      const now = ctx.currentTime;
      const vol = (typeof window.pkSoundVolume === 'number') ? Math.max(0.15, window.pkSoundVolume) : 0.85;

      // Subtle tactile sub-thump
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(entering ? 135 : 110, now);
      subOsc.frequency.exponentialRampToValueAtTime(entering ? 48 : 42, now + 0.18);
      subGain.gain.setValueAtTime(0.28 * vol, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      subOsc.connect(subGain);
      subGain.connect(ctx.destination);
      subOsc.start(now);
      subOsc.stop(now + 0.21);

      // Harmonic crystal arpeggio (ascending when engaging Focus Mode, descending when exiting)
      const notes = entering ? [528, 660, 792, 1056] : [792, 660, 528];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t0 = now + idx * 0.045;
        osc.type = entering ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, t0);
        osc.frequency.exponentialRampToValueAtTime(freq * (entering ? 1.015 : 0.99), t0 + 0.28);
        gain.gain.setValueAtTime(0.0001, t0);
        gain.gain.linearRampToValueAtTime(0.16 * vol, t0 + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0008, t0 + 0.32);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t0);
        osc.stop(t0 + 0.34);
      });
    } catch(_e){}
  }

  function flashFocusShortcutKeys(){
    try {
      if(typeof keyEls === 'undefined' || !keyEls) return;
      const comboIds = ['alt', 'f'];
      comboIds.forEach(id => {
        const el = keyEls[id];
        if(!el) return;
        el.classList.remove('shortcut-combo-flash');
        void el.offsetWidth; // trigger reflow
        el.classList.add('shortcut-combo-flash');
        if(typeof emberBurst === 'function'){
          emberBurst(el, null, 7, null);
        }
        setTimeout(() => {
          el.classList.remove('shortcut-combo-flash');
          el.classList.remove('pressed');
        }, 460);
      });
    } catch(_e){}
  }

  let focusBloomTimer = null;
  function spawnFocusGrowBloom(entering){
    try {
      let bloom = document.getElementById('focusGrowBloom');
      if(!bloom){
        bloom = document.createElement('div');
        bloom.id = 'focusGrowBloom';
        bloom.className = 'focus-grow-bloom';
        bloom.setAttribute('aria-hidden', 'true');
        document.body.appendChild(bloom);
      }
      const bw = document.getElementById('boardWrap') || document.querySelector('.board-wrap');
      if(bw){
        const r = bw.getBoundingClientRect();
        bloom.style.left = (r.left + r.width / 2) + 'px';
        bloom.style.top = (r.top + r.height / 2) + 'px';
        bloom.style.width = Math.max(460, r.width * 0.92) + 'px';
        bloom.style.height = Math.max(260, r.height * 0.92) + 'px';
      } else {
        bloom.style.left = '50%';
        bloom.style.top = '55%';
        bloom.style.width = '760px';
        bloom.style.height = '340px';
      }
      bloom.className = 'focus-grow-bloom ' + (entering ? 'is-enter' : 'is-exit');
      void bloom.offsetWidth;
      bloom.classList.add('active');
      if(focusBloomTimer) clearTimeout(focusBloomTimer);
      focusBloomTimer = setTimeout(() => {
        bloom.classList.remove('active');
      }, 880);
    } catch(_e){}
  }

  function showFocusShortcutHud(entering, source){
    // 1. Viewport edge shockwave ring
    let ripple = document.getElementById('focusScreenRipple');
    if(!ripple){
      ripple = document.createElement('div');
      ripple.id = 'focusScreenRipple';
      ripple.className = 'focus-screen-ripple';
      ripple.setAttribute('aria-hidden', 'true');
      document.body.appendChild(ripple);
    }
    ripple.className = 'focus-screen-ripple ' + (entering ? 'is-enter' : 'is-exit');
    void ripple.offsetWidth;
    ripple.classList.add('active');
    if(focusRippleTimer) clearTimeout(focusRippleTimer);
    focusRippleTimer = setTimeout(() => {
      ripple.classList.remove('active');
    }, 900);

    // 2. Floating transparent-glass Cyber HUD pill
    let hud = document.getElementById('focusShortcutHud');
    if(!hud){
      hud = document.createElement('div');
      hud.id = 'focusShortcutHud';
      hud.className = 'focus-shortcut-hud';
      hud.setAttribute('role', 'status');
      hud.setAttribute('aria-live', 'polite');
      document.body.appendChild(hud);
    }

    const isKm = document.documentElement.classList.contains('site-km-mode');
    const titleText = entering
      ? (isKm ? 'របៀបផ្ដោតត្រូវបានបើក' : 'FOCUS MODE ENGAGED')
      : (isKm ? 'របៀបផ្ដោតត្រូវបានបិទ' : 'FOCUS MODE DISENGAGED');
    const subText = entering
      ? (isKm ? 'លាក់ការរំខាន · ចុច Alt+F ឬ Esc ដើម្បីចេញ' : 'Distractions hidden · Press Alt + F or Esc to exit')
      : (isKm ? 'ផ្ទៃកម្មវិធីទាំងអស់ត្រូវបានបង្ហាញឡើងវិញ' : 'Full studio interface restored');

    hud.innerHTML = `
      <div class="fsh-icon-wrap ${entering ? 'on' : 'off'}">
        <svg class="fsh-reticle-svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3.5"/>
          <path d="M3 12h3.5m11 0H21M12 3v3.5m0 11V21"/>
        </svg>
      </div>
      <div class="fsh-content">
        <div class="fsh-top-row">
          <span class="fsh-status-dot ${entering ? 'on' : 'off'}"></span>
          <span class="fsh-title">${titleText}</span>
          <span class="fsh-combo-badge"><kbd>Alt</kbd><span class="fsh-plus">+</span><kbd>F</kbd></span>
        </div>
        <div class="fsh-sub">${subText}</div>
      </div>
    `;

    hud.classList.remove('show', 'entering', 'exiting');
    void hud.offsetWidth;
    hud.classList.add('show', entering ? 'entering' : 'exiting');

    if(focusHudTimer) clearTimeout(focusHudTimer);
    focusHudTimer = setTimeout(() => {
      hud.classList.remove('show');
    }, 1750);
  }

  function triggerFocusModeShortcut(source){
    const currentlyOn = document.documentElement.classList.contains('focus-mode');
    const willBeOn = !currentlyOn;

    if(typeof window.applyFocusMode === 'function'){
      window.applyFocusMode(willBeOn, false);
    } else {
      document.documentElement.classList.toggle('focus-mode', willBeOn);
    }

    playFocusModeSound(willBeOn);
    flashFocusShortcutKeys();
    showFocusShortcutHud(willBeOn, source || 'shortcut');
    return willBeOn;
  }

  window.triggerFocusModeShortcut = triggerFocusModeShortcut;
  window.spawnFocusGrowBloom = spawnFocusGrowBloom;
  window.showFocusShortcutHud = showFocusShortcutHud;
  window.playFocusModeSound = playFocusModeSound;

  /* Restart current active practice */
  function restartActivePractice(){
    if(typeof lessonActive !== 'undefined' && lessonActive && typeof currentLesson !== 'undefined' && currentLesson){
      startLesson(currentLesson);
      if(typeof showToast === 'function') showToast(pkIcon('reset', 16), 'Lesson Restarted', 'Beginning lesson from start.');
      return true;
    }
    if(typeof raceMode !== 'undefined' && raceMode){
      if(typeof startRace === 'function') startRace();
      if(typeof showToast === 'function') showToast(pkIcon('reset', 16), 'Race Restarted', 'Race countdown begun.');
      return true;
    }
    if(typeof trialActive !== 'undefined' && trialActive){
      if(typeof stopTrial === 'function') stopTrial();
      if(typeof startTrial === 'function') startTrial();
      if(typeof showToast === 'function') showToast(pkIcon('reset', 16), 'Trial Restarted', 'Temple Trial restarted.');
      return true;
    }
    return false;
  }

  /* Universal Escape Key Handler */
  function handleUniversalEscape(){
    // 1. Close any open modal backdrop with smooth spring physics
    const openModals = Array.from(document.querySelectorAll('.modal-backdrop:not([hidden])'));
    if(openModals.length > 0){
      openModals.forEach(m => {
        if(typeof window.closeModalAnimated === 'function') window.closeModalAnimated(m);
        else m.hidden = true;
      });
      return true;
    }

    // 2. Close lesson or adaptive completion overlay if present
    const lcOverlay = document.querySelector('.lesson-complete-overlay');
    if(lcOverlay){
      if(!lcOverlay.classList.contains('is-closing')){
        lcOverlay.classList.add('is-closing');
        setTimeout(() => lcOverlay.remove(), 220);
      }
      return true;
    }

    // 2.5 Exit adaptive practice if active
    if(typeof adaptiveActive !== 'undefined' && adaptiveActive){
      if(typeof PK_ADAPTIVE !== 'undefined' && typeof PK_ADAPTIVE.exitSession === 'function'){
        PK_ADAPTIVE.exitSession();
        if(typeof showToast === 'function') showToast(pkIcon('close', 16), 'Adaptive Practice Exited', 'Returned to keyboard overview.');
        return true;
      }
    }

    // 3. Exit active lesson if in progress
    if(typeof lessonActive !== 'undefined' && lessonActive){
      if(typeof exitLesson === 'function') exitLesson();
      if(typeof showToast === 'function') showToast(pkIcon('close', 16), 'Lesson Exited', 'Returned to keyboard overview.');
      return true;
    }

    // 4. Exit race mode if active
    if(typeof raceMode !== 'undefined' && raceMode){
      if(typeof exitRaceMode === 'function') exitRaceMode();
      if(typeof showToast === 'function') showToast(pkIcon('close', 16), 'Race Mode Exited', 'Returned to keyboard overview.');
      return true;
    }

    // 5. Exit temple trial if active
    if(typeof trialActive !== 'undefined' && trialActive){
      if(typeof stopTrial === 'function') stopTrial();
      if(typeof showToast === 'function') showToast(pkIcon('close', 16), 'Trial Exited', 'Returned to keyboard overview.');
      return true;
    }

    // 6. Exit Focus Mode with cool HUD & sound feedback
    if(document.documentElement.classList.contains('focus-mode')){
      triggerFocusModeShortcut('escape');
      return true;
    }

    return false;
  }

  /* Capture-Phase Priority Listener for Alt + F Focus Mode & Global Shortcuts */
  window.addEventListener('keydown', (e)=>{
    const t = e.target;
    const isTextInput = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);

    // Check if physical AltGr is active
    const isAltGraph = (e.getModifierState && e.getModifierState('AltGraph')) ||
                       (typeof heldModifiers !== 'undefined' && heldModifiers.has('altgr')) ||
                       (e.ctrlKey && e.altKey);

    // Priority 1: Alt + F Focus Mode Shortcut (works anywhere, even if search input is focused)
    if(e.altKey && !isAltGraph && !e.ctrlKey && !e.metaKey){
      const keyLower = (e.key || '').toLowerCase();
      if(e.code === 'KeyF' || keyLower === 'f'){
        e.preventDefault();
        e.stopPropagation();
        if(e.repeat) return;
        if(isTextInput && typeof t.blur === 'function') t.blur();
        triggerFocusModeShortcut('shortcut');
        return;
      }
    }

    // Priority 2: Escape always works, even inside an input
    if(e.key === 'Escape'){
      if(handleUniversalEscape()){
        e.preventDefault();
        e.stopPropagation();
        return;
      }
    }

    if(isTextInput) return;

    // Shortcuts Cheat Sheet (? or Ctrl+/ or F1)
    if(e.key === '?' || (e.ctrlKey && e.key === '/') || e.key === 'F1'){
      e.preventDefault();
      toggleShortcutsModal();
      return;
    }

    // Open Settings Modal (Ctrl+, or Alt+,)
    if((e.ctrlKey && e.key === ',') || (e.altKey && e.key === ',')){
      e.preventDefault();
      const settingsBtn = document.getElementById('settingsOpenBtn');
      if(settingsBtn) settingsBtn.click();
      return;
    }

    // Other Alt key application shortcuts (only when not AltGr typing)
    if(e.altKey && !isAltGraph){
      if(e.repeat) return;
      const keyLower = (e.key || '').toLowerCase();

      // Alt+S: Toggle Key Sound
      if(keyLower === 's' || e.code === 'KeyS'){
        e.preventDefault();
        const soundBtn = document.getElementById('soundToggle');
        if(soundBtn) soundBtn.click();
        return;
      }

      // Alt+H: Toggle Finger Guides
      if(keyLower === 'h' || e.code === 'KeyH'){
        e.preventDefault();
        const handsBtn = document.getElementById('handsToggle');
        if(handsBtn) handsBtn.click();
        return;
      }

      // Alt+T: Toggle Temple Ambience
      if(keyLower === 't' || e.code === 'KeyT'){
        e.preventDefault();
        const ambBtn = document.getElementById('ambienceToggle');
        if(ambBtn) ambBtn.click();
        return;
      }

      // Alt+L: Switch Site Language (Khmer <-> English)
      if(keyLower === 'l' || e.code === 'KeyL'){
        e.preventDefault();
        const langBtn = document.getElementById('topLangToggleBtn') || document.getElementById('siteLangToggle');
        if(langBtn) langBtn.click();
        return;
      }

      // Alt+P: Open Statistics Modal
      if(keyLower === 'p' || e.code === 'KeyP'){
        e.preventDefault();
        const statsBtn = document.getElementById('statsOpenBtn');
        if(statsBtn) statsBtn.click();
        return;
      }

      // Alt+C: Clear manuscript
      if(keyLower === 'c' || e.code === 'KeyC'){
        e.preventDefault();
        if(typeof clearText === 'function'){
          clearText();
          if(typeof showToast === 'function') showToast(pkIcon('reset', 16), 'Cleared', 'Manuscript cleared.');
        }
        return;
      }

      // Alt+R: Restart Lesson or Race
      if(keyLower === 'r' || e.code === 'KeyR'){
        e.preventDefault();
        restartActivePractice();
        return;
      }

      // Alt+1 / Alt+2 / Alt+3: Layout switching
      if(e.key === '1' || e.code === 'Digit1' || e.code === 'Numpad1'){
        e.preventDefault();
        if(typeof switchLayout === 'function'){
          switchLayout('standard');
          if(typeof showToast === 'function') showToast(pkIcon('keyboard', 16), 'Khmer Layout', 'Switched to Khmer Keyboard Layout.');
        }
        return;
      }
      if(e.key === '2' || e.code === 'Digit2' || e.code === 'Numpad2'){
        e.preventDefault();
        if(typeof switchLayout === 'function'){
          switchLayout('nida');
          if(typeof showToast === 'function') showToast(pkIcon('keyboard', 16), 'Khmer NiDA', 'Switched to official Khmer NiDA Keyboard.');
        }
        return;
      }
      if(e.key === '3' || e.code === 'Digit3' || e.code === 'Numpad3'){
        e.preventDefault();
        if(typeof switchLayout === 'function'){
          switchLayout('english');
          if(typeof showToast === 'function') showToast(pkIcon('keyboard', 16), 'English (US)', 'Switched to English (US) Keyboard.');
        }
        return;
      }
    }

    // Ctrl+Enter: Restart active practice if in lesson/race
    if(e.ctrlKey && e.key === 'Enter'){
      if(restartActivePractice()){
        e.preventDefault();
        return;
      }
    }
  }, { capture: true, passive: false });

  window.openShortcutsModal = openShortcutsModal;
  window.closeShortcutsModal = closeShortcutsModal;
})();
