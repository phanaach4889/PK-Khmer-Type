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
    shortcutsModal.hidden = true;
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
    // 1. Close any open modal backdrop
    const openModals = Array.from(document.querySelectorAll('.modal-backdrop:not([hidden])'));
    if(openModals.length > 0){
      openModals.forEach(m => { m.hidden = true; });
      return true;
    }

    // 2. Close lesson completion overlay if present
    const lcOverlay = document.querySelector('.lesson-complete-overlay');
    if(lcOverlay){
      lcOverlay.remove();
      return true;
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

    // 6. Exit Focus Mode
    if(document.documentElement.classList.contains('focus-mode')){
      if(typeof applyFocusMode === 'function') applyFocusMode(false);
      return true;
    }

    return false;
  }

  /* Global Keydown Listener for Application Shortcuts */
  window.addEventListener('keydown', (e)=>{
    const t = e.target;
    const isTextInput = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);

    // Escape always works, even if inside an input
    if(e.key === 'Escape'){
      if(handleUniversalEscape()){
        e.preventDefault();
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

    // Alt key application shortcuts
    if(e.altKey){
      const keyLower = (e.key || '').toLowerCase();

      // Alt+F: Toggle Focus Mode
      if(keyLower === 'f' || e.code === 'KeyF'){
        e.preventDefault();
        const focusBtn = document.getElementById('focusModeBtn');
        if(focusBtn) focusBtn.click();
        return;
      }

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
  });

  // Expose helpers globally if needed
  window.PKShortcuts = {
    open: openShortcutsModal,
    close: closeShortcutsModal,
    toggle: toggleShortcutsModal,
    restart: restartActivePractice
  };
})();
