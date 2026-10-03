/* ============================================================
   PK Khmer Type — Universal Keyboard Shortcuts System
   ============================================================ */

(function(){
  const shortcutsModal = document.getElementById('shortcutsModal');
  const shortcutsOpenBtn = document.getElementById('shortcutsOpenBtn');
  const shortcutsCloseBtn = document.getElementById('shortcutsCloseBtn');

  function closeAllModalsExcept(keepId){
    document.querySelectorAll('.modal-backdrop:not([hidden])').forEach(m => {
      if(m.id !== keepId) m.hidden = true;
    });
  }

  function openShortcutsModal(){
    if(!shortcutsModal) return;
    closeAllModalsExcept('shortcutsModal');
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

  function toggleSettingsModal(){
    const settingsModal = document.getElementById('settingsModal');
    if(!settingsModal) return;
    if(settingsModal.hidden){
      closeAllModalsExcept('settingsModal');
      if(typeof window.openSettingsModal === 'function'){
        window.openSettingsModal();
      } else {
        const settingsBtn = document.getElementById('settingsOpenBtn');
        if(settingsBtn) settingsBtn.click();
        else settingsModal.hidden = false;
      }
    } else {
      if(typeof window.closeSettingsModal === 'function'){
        window.closeSettingsModal();
      } else {
        settingsModal.hidden = true;
      }
    }
  }

  function toggleStatsModal(){
    const statsModal = document.getElementById('statsModal');
    if(!statsModal) return;
    if(statsModal.hidden){
      closeAllModalsExcept('statsModal');
      const statsBtn = document.getElementById('statsOpenBtn');
      if(statsBtn) statsBtn.click();
      else statsModal.hidden = false;
    } else {
      statsModal.hidden = true;
    }
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

  /* Restart current active practice (or launch current/first lesson if requested via Alt+R) */
  function restartActivePractice(allowFallbackStart){
    const lcOverlay = document.querySelector('.lesson-complete-overlay');
    if(lcOverlay) lcOverlay.remove();
    const rcOverlay = document.querySelector('.race-result-overlay');
    if(rcOverlay) rcOverlay.remove();

    if(typeof adaptiveActive !== 'undefined' && adaptiveActive && typeof PK_ADAPTIVE !== 'undefined' && typeof PK_ADAPTIVE.startAdaptiveSession === 'function'){
      PK_ADAPTIVE.startAdaptiveSession(window.currentLayoutId || 'standard');
      if(typeof showToast === 'function') showToast(pkIcon('reset', 16), 'Adaptive Restarted', 'Fresh adaptive drill generated.');
      return true;
    }
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
    if(allowFallbackStart){
      if(typeof currentLesson !== 'undefined' && currentLesson && typeof startLesson === 'function'){
        startLesson(currentLesson);
        if(typeof showToast === 'function') showToast(pkIcon('reset', 16), 'Lesson Restarted', 'Beginning lesson from start.');
        return true;
      }
      if(typeof LESSONS !== 'undefined' && Array.isArray(LESSONS) && LESSONS[0] && typeof startLesson === 'function'){
        startLesson(LESSONS[0].id);
        if(typeof showToast === 'function') showToast(pkIcon('reset', 16), 'Lesson Started', 'Starting Lesson 1.');
        return true;
      }
    }
    return false;
  }

  /* Universal Escape Key Handler (steps down one layer at a time) */
  function handleUniversalEscape(){
    // 1. Close any open modal backdrop
    const openModals = Array.from(document.querySelectorAll('.modal-backdrop:not([hidden])'));
    if(openModals.length > 0){
      openModals.forEach(m => { m.hidden = true; });
      return true;
    }

    // 2. Close lesson or race completion overlay if present
    const lcOverlay = document.querySelector('.lesson-complete-overlay, .race-result-overlay');
    if(lcOverlay){
      lcOverlay.remove();
      return true;
    }

    // 3. Exit adaptive practice if active
    if(typeof adaptiveActive !== 'undefined' && adaptiveActive){
      if(typeof PK_ADAPTIVE !== 'undefined' && typeof PK_ADAPTIVE.exitSession === 'function'){
        PK_ADAPTIVE.exitSession();
        if(typeof showToast === 'function') showToast(pkIcon('close', 16), 'Adaptive Practice Exited', 'Returned to keyboard overview.');
        return true;
      }
    }

    // 4. Exit active lesson if in progress
    if(typeof lessonActive !== 'undefined' && lessonActive){
      if(typeof exitLesson === 'function') exitLesson();
      if(typeof showToast === 'function') showToast(pkIcon('close', 16), 'Lesson Exited', 'Returned to keyboard overview.');
      return true;
    }

    // 5. Exit race mode if active
    if(typeof raceMode !== 'undefined' && raceMode){
      if(typeof exitRaceMode === 'function') exitRaceMode();
      if(typeof showToast === 'function') showToast(pkIcon('close', 16), 'Race Mode Exited', 'Returned to keyboard overview.');
      return true;
    }

    // 6. Exit temple trial if active
    if(typeof trialActive !== 'undefined' && trialActive){
      if(typeof stopTrial === 'function') stopTrial();
      if(typeof showToast === 'function') showToast(pkIcon('close', 16), 'Trial Exited', 'Returned to keyboard overview.');
      return true;
    }

    // 7. Exit Focus Mode
    if(document.documentElement.classList.contains('focus-mode')){
      if(typeof window.applyFocusMode === 'function') window.applyFocusMode(false);
      else document.documentElement.classList.remove('focus-mode');
      if(typeof showToast === 'function') showToast(pkIcon('eye', 16), 'Focus Mode Off', 'Interface restored.');
      return true;
    }

    return false;
  }

  /* Global Keydown Listener for Application Shortcuts */
  window.addEventListener('keydown', (e)=>{
    const t = e.target;
    const isTextInput = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);

    // 1. Escape always works, even if inside an input
    if(e.key === 'Escape'){
      if(handleUniversalEscape()){
        e.preventDefault();
        return;
      }
    }

    // 2. Toggle Settings Modal (Ctrl+, or Alt+,) — works even if focus is in search input
    if((e.ctrlKey && (e.key === ',' || e.code === 'Comma')) || (e.altKey && (e.key === ',' || e.code === 'Comma'))){
      e.preventDefault();
      toggleSettingsModal();
      return;
    }

    // 3. Toggle Shortcuts Cheat Sheet via F1, Ctrl+/, or Alt+/ — works everywhere
    if(e.key === 'F1' || (e.ctrlKey && (e.key === '/' || e.code === 'Slash')) || (e.altKey && (e.key === '/' || e.code === 'Slash'))){
      e.preventDefault();
      toggleShortcutsModal();
      return;
    }

    const isAltGraph = (e.getModifierState && e.getModifierState('AltGraph')) || (e.ctrlKey && e.altKey);

    // 4. Alt key application shortcuts (work even when a modal is open)
    if(e.altKey && !isAltGraph && !e.ctrlKey && !e.metaKey){
      const keyLower = (e.key || '').toLowerCase();

      // Alt+F: Toggle Focus Mode
      if(keyLower === 'f' || e.code === 'KeyF'){
        e.preventDefault();
        const focusBtn = document.getElementById('focusModeBtn');
        if(focusBtn){
          focusBtn.click();
        } else if(typeof window.applyFocusMode === 'function'){
          window.applyFocusMode(!document.documentElement.classList.contains('focus-mode'));
        }
        return;
      }

      // Alt+S: Toggle Key Sound
      if(keyLower === 's' || e.code === 'KeyS'){
        e.preventDefault();
        const soundBtn = document.getElementById('soundToggle');
        if(soundBtn) soundBtn.click();
        if(typeof window.syncSettingsMirrors === 'function') window.syncSettingsMirrors();
        const isOn = soundBtn ? soundBtn.classList.contains('on') : true;
        if(typeof showToast === 'function'){
          showToast(pkIcon('volume', 16), isOn ? 'Key Sound On' : 'Key Sound Muted', isOn ? 'Mechanical switch audio enabled.' : 'Key switch audio muted.');
        }
        return;
      }

      // Alt+H: Toggle Finger Guides
      if(keyLower === 'h' || e.code === 'KeyH'){
        e.preventDefault();
        const handsBtn = document.getElementById('handsToggle');
        if(handsBtn) handsBtn.click();
        if(typeof window.syncSettingsMirrors === 'function') window.syncSettingsMirrors();
        const isOn = handsBtn ? handsBtn.classList.contains('on') : true;
        if(typeof showToast === 'function'){
          showToast(pkIcon('hand', 16), isOn ? 'Finger Guide On' : 'Finger Guide Off', isOn ? 'Two-hand anatomical guide visible.' : 'Hand overlay hidden.');
        }
        return;
      }

      // Alt+T: Toggle Temple Ambience
      if(keyLower === 't' || e.code === 'KeyT'){
        e.preventDefault();
        const ambBtn = document.getElementById('ambienceToggle');
        if(ambBtn) ambBtn.click();
        if(typeof window.syncSettingsMirrors === 'function') window.syncSettingsMirrors();
        const isOn = ambBtn ? ambBtn.classList.contains('on') : false;
        if(typeof showToast === 'function'){
          showToast(pkIcon('music', 16), isOn ? 'Temple Ambience On' : 'Temple Ambience Off', isOn ? 'Warm pentatonic drone playing.' : 'Background ambience stopped.');
        }
        return;
      }

      // Alt+M: Toggle Smart Mouse Inspector
      if(keyLower === 'm' || e.code === 'KeyM'){
        e.preventDefault();
        const mouseBtn = document.getElementById('cursorGuideToggle');
        if(mouseBtn){
          mouseBtn.click();
        } else if(window.PKCursorInspector && typeof window.PKCursorInspector.toggle === 'function'){
          window.PKCursorInspector.toggle();
        }
        if(typeof window.syncSettingsMirrors === 'function') window.syncSettingsMirrors();
        return;
      }

      // Alt+L: Switch Site Language (Khmer <-> English)
      if(keyLower === 'l' || e.code === 'KeyL'){
        e.preventDefault();
        if(typeof window.toggleSiteLanguage === 'function'){
          window.toggleSiteLanguage();
        } else {
          const langBtn = document.getElementById('topLangToggleBtn') || document.getElementById('siteLangToggle');
          if(langBtn) langBtn.click();
        }
        if(typeof window.syncSettingsMirrors === 'function') window.syncSettingsMirrors();
        const isKm = document.documentElement.classList.contains('site-km-mode');
        if(typeof showToast === 'function'){
          showToast(pkIcon('globe', 16), isKm ? 'ភាសាខ្មែរ (Khmer UI)' : 'English Interface', isKm ? 'បានប្តូរភាសាគេហទំព័រទៅជាភាសាខ្មែរ។' : 'Switched site interface to English.');
        }
        return;
      }

      // Alt+P: Open / Toggle Statistics Modal
      if(keyLower === 'p' || e.code === 'KeyP'){
        e.preventDefault();
        toggleStatsModal();
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
        restartActivePractice(true);
        return;
      }

      // Alt+1 / Alt+2 / Alt+3: Layout switching
      if(e.key === '1' || e.code === 'Digit1' || e.code === 'Numpad1'){
        e.preventDefault();
        if(typeof switchLayout === 'function'){
          switchLayout('standard', true);
          if(typeof syncLayoutUI === 'function') syncLayoutUI('standard');
          if(typeof window.syncSettingsMirrors === 'function') window.syncSettingsMirrors();
          if(typeof showToast === 'function') showToast(pkIcon('keyboard', 16), 'Khmer Layout', 'Switched to Khmer Keyboard Layout.');
        }
        return;
      }
      if(e.key === '2' || e.code === 'Digit2' || e.code === 'Numpad2'){
        e.preventDefault();
        if(typeof switchLayout === 'function'){
          switchLayout('nida', true);
          if(typeof syncLayoutUI === 'function') syncLayoutUI('nida');
          if(typeof window.syncSettingsMirrors === 'function') window.syncSettingsMirrors();
          if(typeof showToast === 'function') showToast(pkIcon('keyboard', 16), 'Khmer NiDA', 'Switched to official Khmer NiDA Keyboard.');
        }
        return;
      }
      if(e.key === '3' || e.code === 'Digit3' || e.code === 'Numpad3'){
        e.preventDefault();
        if(typeof switchLayout === 'function'){
          switchLayout('english', true);
          if(typeof syncLayoutUI === 'function') syncLayoutUI('english');
          if(typeof window.syncSettingsMirrors === 'function') window.syncSettingsMirrors();
          if(typeof showToast === 'function') showToast(pkIcon('keyboard', 16), 'English (US)', 'Switched to English (US) Keyboard.');
        }
        return;
      }
    }

    if(isTextInput) return;

    // 5. '?' Shortcut Cheat Sheet (unless an active drill is targeting the slash key)
    if(e.key === '?'){
      const slashIsTarget =
        !shortcutsModal || !shortcutsModal.hidden ? false : (
          (typeof lessonActive !== 'undefined' && lessonActive && typeof highlightedKeyId !== 'undefined' && highlightedKeyId === 'slash') ||
          (typeof raceActive !== 'undefined' && raceActive && typeof highlightedKeyId !== 'undefined' && highlightedKeyId === 'slash') ||
          (typeof trialActive !== 'undefined' && trialActive) ||
          (typeof adaptiveActive !== 'undefined' && adaptiveActive)
        );
      if(!slashIsTarget){
        e.preventDefault();
        toggleShortcutsModal();
        return;
      }
    }

    // 6. Ctrl+Enter: Restart active practice if in lesson/race
    if(e.ctrlKey && e.key === 'Enter'){
      if(restartActivePractice(false)){
        e.preventDefault();
        return;
      }
    }
  });

  // Expose helpers globally
  window.PKShortcuts = {
    open: openShortcutsModal,
    close: closeShortcutsModal,
    toggle: toggleShortcutsModal,
    toggleSettings: toggleSettingsModal,
    toggleStats: toggleStatsModal,
    restart: restartActivePractice,
    escape: handleUniversalEscape
  };
})();
