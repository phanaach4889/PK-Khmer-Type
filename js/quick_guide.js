/* ============================================================
   PK Khmer Type — Super Useful Quick Guide & Live Coach Dock
   ============================================================
   Transforms the left sidebar into an interactive, real-time
   typing companion featuring live telemetry radar, home-row
   target-finger tracking, weak-key drill launcher, dynamic
   Khmer/English cheat sheets, and 1-click productivity tools.
   ============================================================ */

(function(global){
  'use strict';

  // Finger descriptors and anatomical metadata
  const FINGER_MAP = {
    lp: { en: 'Left Pinky', km: 'ដៃឆ្វេង · ម្រាមកូន', color: '#ec4899', dot: 'pinky' },
    lr: { en: 'Left Ring Finger', km: 'ដៃឆ្វេង · ម្រាមនាង', color: '#8b5cf6', dot: 'ring' },
    lm: { en: 'Left Middle Finger', km: 'ដៃឆ្វេង · ម្រាមកណ្ដាល', color: '#3b82f6', dot: 'mid' },
    li: { en: 'Left Index Finger', km: 'ដៃឆ្វេង · ម្រាមចង្អុល', color: '#10b981', dot: 'idx' },
    lt: { en: 'Left Thumb (Space)', km: 'ដៃឆ្វេង · មេដៃ', color: '#f59e0b', dot: 'thumb' },
    rt: { en: 'Right Thumb (Space)', km: 'ដៃស្ដាំ · មេដៃ', color: '#f59e0b', dot: 'thumb' },
    ri: { en: 'Right Index Finger', km: 'ដៃស្ដាំ · ម្រាមចង្អុល', color: '#10b981', dot: 'idx' },
    rm: { en: 'Right Middle Finger', km: 'ដៃស្ដាំ · ម្រាមកណ្ដាល', color: '#3b82f6', dot: 'mid' },
    rr: { en: 'Right Ring Finger', km: 'ដៃស្ដាំ · ម្រាមនាង', color: '#8b5cf6', dot: 'ring' },
    rp: { en: 'Right Pinky', km: 'ដៃស្ដាំ · ម្រាមកូន', color: '#ec4899', dot: 'pinky' }
  };

  const KEY_DISPLAY_NAMES = {
    space: 'Space',
    shift: 'Shift',
    enter: 'Enter',
    backspace: 'Bksp',
    tab: 'Tab',
    semicolon: ';',
    quote: "'",
    comma: ',',
    period: '.',
    slash: '/',
    bracketL: '[',
    bracketR: ']',
    backslash: '\\',
    minus: '-',
    equal: '=',
    grave: '`'
  };

  let weakKeysThrottle = null;

  class PKQuickGuideController {
    constructor(){
      this.init();
    }

    init(){
      if(document.readyState === 'loading'){
        document.addEventListener('DOMContentLoaded', () => this.bindElements());
      } else {
        this.bindElements();
      }
    }

    bindElements(){
      this.dock = document.getElementById('guideDock');
      if(!this.dock) return;

      this.liveStatusPill = document.getElementById('guideLiveStatusPill');
      this.liveStatusText = document.getElementById('guideLiveStatusText');
      this.layoutBadge = document.getElementById('guideLayoutBadge');
      this.lessonTitle = document.getElementById('guideLessonTitle');
      this.lessonBadge = document.getElementById('guideLessonBadge');
      this.progressBar = document.getElementById('guideProgressBar');
      this.exerciseCount = document.getElementById('guideExerciseCount');
      this.quickActionBtn = document.getElementById('guideQuickActionBtn');
      this.quickActionBtnText = document.getElementById('guideQuickActionBtnText');

      this.statWpm = document.getElementById('gStatWpm');
      this.statAcc = document.getElementById('gStatAcc');
      this.streakVal = document.getElementById('guideStreakVal');
      this.statKeys = document.getElementById('gStatKeys');

      this.targetKeyBadge = document.getElementById('guideTargetKeyBadge');
      this.targetFingerName = document.getElementById('guideTargetFingerName');
      this.targetFingerHint = document.getElementById('guideTargetFingerHint');

      this.weakChips = document.getElementById('guideWeakChips');
      this.drillWeakBtn = document.getElementById('guideDrillWeakBtn');

      this.cheatTitle = document.getElementById('guideCheatTitle');
      this.ruleRow1 = document.getElementById('guideRuleRow1');
      this.ruleRow2 = document.getElementById('guideRuleRow2');
      this.ruleRow3 = document.getElementById('guideRuleRow3');
      this.ruleRow4 = document.getElementById('guideRuleRow4');
      this.ruleLabel1 = document.getElementById('guideRuleLabel1');
      this.ruleLabel2 = document.getElementById('guideRuleLabel2');
      this.ruleLabel3 = document.getElementById('guideRuleLabel3');
      this.ruleLabel4 = document.getElementById('guideRuleLabel4');
      this.coengExample1 = document.getElementById('guideCoengExample1');
      this.coengKeyWrap = document.getElementById('guideCoengKeyWrap');
      this.coengExample2 = document.getElementById('guideCoengExample2');
      this.punctSample = document.getElementById('guidePunctSample');
      this.typeSpaceKbd = document.getElementById('guideTypeSpaceKbd');

      this.btnFocus = document.getElementById('guideBtnFocus');
      this.btnRestart = document.getElementById('guideBtnRestart');
      this.btnHands = document.getElementById('guideBtnHands');
      this.btnSound = document.getElementById('guideBtnSound');
      this.btnSpace = document.getElementById('guideBtnSpace');
      this.btnExit = document.getElementById('guideBtnExit');
      this.handsStatusDesc = document.getElementById('guideHandsStatusDesc');
      this.soundStatusDesc = document.getElementById('guideSoundStatusDesc');

      this.wireEvents();
      this.hookGlobalEngines();
      this.updateLayout(typeof currentLayoutId !== 'undefined' ? currentLayoutId : 'standard');
      this.updateTelemetry();
      this.updateToolStatuses();
      this.scheduleWeakKeysUpdate(300);
    }

    wireEvents(){
      // Quick Action Button in Telemetry Card
      if(this.quickActionBtn){
        this.quickActionBtn.addEventListener('click', () => {
          this.handleQuickAction();
        });
      }

      // Drill Weak Keys Button
      if(this.drillWeakBtn){
        this.drillWeakBtn.addEventListener('click', () => {
          this.launchWeakKeyPractice();
        });
      }

      // Focus Mode Shortcut Card
      if(this.btnFocus){
        this.btnFocus.addEventListener('click', () => {
          if(typeof window.triggerFocusModeShortcut === 'function'){
            window.triggerFocusModeShortcut('quick_guide');
          } else {
            const btn = document.getElementById('focusModeBtn');
            if(btn) btn.click();
          }
        });
      }

      // Restart Drill Shortcut Card
      if(this.btnRestart){
        this.btnRestart.addEventListener('click', () => {
          if(typeof window.restartActivePractice === 'function'){
            window.restartActivePractice();
          } else if(typeof restartLesson === 'function'){
            restartLesson();
          }
          this.updateTelemetry();
        });
      }

      // 3D Hands Toggle Shortcut Card
      if(this.btnHands){
        this.btnHands.addEventListener('click', () => {
          const ht = document.getElementById('handsToggle');
          if(ht) ht.click();
          this.updateToolStatuses();
        });
      }

      // Typing Audio Toggle Shortcut Card
      if(this.btnSound){
        this.btnSound.addEventListener('click', () => {
          const st = document.getElementById('soundToggle');
          if(st) st.click();
          this.updateToolStatuses();
        });
      }

      // Type Space Shortcut Card
      if(this.btnSpace){
        this.btnSpace.addEventListener('click', () => {
          const isStd = (typeof currentLayoutId !== 'undefined' && currentLayoutId === 'standard');
          if(typeof showToast === 'function'){
            showToast(
              pkIcon('keyboard', 16),
              isStd ? 'Type Space: Shift + Space' : 'Type Space: Spacebar',
              isStd ? 'Standard Khmer uses Space for sub-consonants (ជើង).' : 'Press Space to separate words.'
            );
          }
        });
      }

      // Exit Lesson Shortcut Card
      if(this.btnExit){
        this.btnExit.addEventListener('click', () => {
          if(typeof window.executeLessonExit === 'function'){
            window.executeLessonExit();
          } else if(typeof exitLesson === 'function'){
            exitLesson();
          }
          this.updateTelemetry();
        });
      }

      // Home row mini-keys click feedback
      this.dock.querySelectorAll('.guide-mini-key').forEach(mk => {
        mk.addEventListener('click', () => {
          mk.classList.add('mini-clicked');
          setTimeout(() => mk.classList.remove('mini-clicked'), 180);
          if(typeof playKeySound === 'function') playKeySound();
        });
      });
    }

    hookGlobalEngines(){
      // Intercept layout switches to update the dock dynamically
      const origSwitchLayout = window.switchLayout;
      if(typeof origSwitchLayout === 'function'){
        window.switchLayout = (id, force) => {
          origSwitchLayout(id, force);
          this.updateLayout(id);
          this.updateTelemetry();
          this.scheduleWeakKeysUpdate(200);
        };
      }

      // Intercept setActiveFinger to update target key and reaching finger
      const origSetActiveFinger = window.setActiveFinger;
      if(typeof origSetActiveFinger === 'function'){
        window.setActiveFinger = (keyId, layer) => {
          origSetActiveFinger(keyId, layer);
          this.updateTargetFinger(keyId, layer);
        };
      }

      // Intercept updateLessonProgress for live telemetry synchronization
      const origUpdateLessonProgress = window.updateLessonProgress;
      if(typeof origUpdateLessonProgress === 'function'){
        window.updateLessonProgress = () => {
          origUpdateLessonProgress();
          this.updateTelemetry();
          this.scheduleWeakKeysUpdate(1000);
        };
      }

      // Intercept startLesson to refresh active telemetry
      const origStartLesson = window.startLesson;
      if(typeof origStartLesson === 'function'){
        window.startLesson = (idOrDef) => {
          origStartLesson(idOrDef);
          this.updateTelemetry();
          this.scheduleWeakKeysUpdate(300);
        };
      }

      // Listen to keystroke events on window to update streak and telemetry
      window.addEventListener('keydown', (e) => {
        if(e.isComposing) return;
        setTimeout(() => {
          this.updateTelemetry();
          this.highlightHomeRowKey(e.key.toLowerCase());
        }, 30);
      });
    }

    updateLayout(layoutId){
      const l = String(layoutId || 'standard').toLowerCase();
      const isKm = document.documentElement.classList.contains('site-km-mode');

      // Update Layout Badge
      if(this.layoutBadge){
        if(l.includes('eng')){
          this.layoutBadge.textContent = 'English';
          this.layoutBadge.className = 'gdh-badge badge-eng';
        } else if(l.includes('nid')){
          this.layoutBadge.textContent = 'NiDA';
          this.layoutBadge.className = 'gdh-badge badge-nida';
        } else {
          this.layoutBadge.textContent = 'Standard';
          this.layoutBadge.className = 'gdh-badge badge-std';
        }
      }

      // Update Dynamic Cheat Sheet based on layout
      if(l.includes('eng')){
        if(this.cheatTitle){
          this.cheatTitle.textContent = isKm ? 'គោលការណ៍វាយអក្សរអង់គ្លេស' : 'Touch Typing Principles';
        }
        if(this.ruleRow1){
          this.ruleLabel1.innerHTML = isKm ? 'ប្ដូរអក្សរធំ (Shift)' : 'Opposite Shift';
          this.coengExample1.innerHTML = '<kbd class="guide-kbd">Shift</kbd> (Opposite)';
        }
        if(this.ruleRow2){
          this.ruleLabel2.innerHTML = isKm ? 'គ្រាប់ចុចយុថ្កា' : 'Home Anchors';
          this.coengKeyWrap.innerHTML = '<kbd class="guide-kbd">F</kbd> &amp; <kbd class="guide-kbd">J</kbd> (Bumps)';
        }
        if(this.ruleRow3){
          this.ruleLabel3.innerHTML = isKm ? 'សញ្ញាវណ្ណយុត្តិ' : 'Punctuation';
          this.coengExample2.innerHTML = '<kbd class="guide-kbd">,</kbd> Mid · <kbd class="guide-kbd">.</kbd> Ring';
        }
        if(this.ruleRow4){
          this.ruleRow4.style.display = 'flex';
          this.ruleLabel4.innerHTML = isKm ? 'ឥរិយាបថដៃ' : 'Posture';
          this.punctSample.innerHTML = 'Float wrists';
        }
        if(this.typeSpaceKbd) this.typeSpaceKbd.textContent = 'Space';
      } else if(l.includes('nid')){
        if(this.cheatTitle){
          this.cheatTitle.textContent = isKm ? 'ជើងអក្សរ & ក្បួនប្លង់ (NiDA)' : 'Subscripts & Rules (NiDA)';
        }
        if(this.ruleRow1){
          this.ruleLabel1.innerHTML = isKm ? 'ក្បួន៖ <kbd class="guide-kbd">្</kbd> + ព្យញ្ជនៈ' : 'Rule: <kbd class="guide-kbd">្</kbd> + Consonant';
          this.coengExample1.innerHTML = 'ក + ្ + ក = ក្ក';
        }
        if(this.ruleRow2){
          this.ruleLabel2.innerHTML = isKm ? 'គ្រាប់ចុចជើង' : 'Coeng Key';
          this.coengKeyWrap.innerHTML = '<kbd class="guide-kbd">J</kbd> (NiDA)';
        }
        if(this.ruleRow3){
          this.ruleLabel3.innerHTML = isKm ? 'ឧទាហរណ៍' : 'Example';
          this.coengExample2.innerHTML = 'ស + ្ + ង = ស្ង';
        }
        if(this.ruleRow4){
          this.ruleRow4.style.display = 'flex';
          this.ruleLabel4.innerHTML = isKm ? 'ខណ្ឌ &amp; បរិយោសាន' : 'Khan &amp; Bariyosan';
          this.punctSample.innerHTML = '<kbd class="guide-kbd">.</kbd> (។) · <kbd class="guide-kbd">Shift+.</kbd> (៕)';
        }
        if(this.typeSpaceKbd) this.typeSpaceKbd.textContent = 'Space';
      } else {
        // Standard Khmer Layout
        if(this.cheatTitle){
          this.cheatTitle.textContent = isKm ? 'ជើងអក្សរ & ក្បួនប្លង់ (ស្តង់ដារ)' : 'Subscripts & Rules (Standard)';
        }
        if(this.ruleRow1){
          this.ruleLabel1.innerHTML = isKm ? 'ក្បួន៖ <kbd class="guide-kbd">្</kbd> + ព្យញ្ជនៈ' : 'Rule: <kbd class="guide-kbd">្</kbd> + Consonant';
          this.coengExample1.innerHTML = 'ក + ្ + ក = ក្ក';
        }
        if(this.ruleRow2){
          this.ruleLabel2.innerHTML = isKm ? 'គ្រាប់ចុចជើង' : 'Coeng Key';
          this.coengKeyWrap.innerHTML = '<kbd class="guide-kbd">Space</kbd> (Standard)';
        }
        if(this.ruleRow3){
          this.ruleLabel3.innerHTML = isKm ? 'ឧទាហរណ៍' : 'Example';
          this.coengExample2.innerHTML = 'ស + ្ + ង = ស្ង';
        }
        if(this.ruleRow4){
          this.ruleRow4.style.display = 'flex';
          this.ruleLabel4.innerHTML = isKm ? 'សញ្ញាខណ្ឌ (។)' : 'Khmer Khan (។)';
          this.punctSample.innerHTML = '<kbd class="guide-kbd">.</kbd> (Period)';
        }
        if(this.typeSpaceKbd) this.typeSpaceKbd.textContent = 'Shift + Space';
      }
    }

    updateTelemetry(){
      const isKm = document.documentElement.classList.contains('site-km-mode');
      const inLesson = (typeof lessonActive !== 'undefined' && lessonActive && typeof currentLesson !== 'undefined' && currentLesson);

      // 1. Live status indicator pill
      if(this.liveStatusPill && this.liveStatusText){
        if(inLesson){
          this.liveStatusPill.className = 'guide-live-status-pill status-active';
          this.liveStatusText.textContent = isKm ? 'កំពុងហ្វឹកហាត់' : 'Practicing';
        } else {
          this.liveStatusPill.className = 'guide-live-status-pill status-ready';
          this.liveStatusText.textContent = isKm ? 'វាយសេរី' : 'Free Typing';
        }
      }

      // 2. Active lesson card & progress
      if(inLesson){
        const curId = currentLesson.id;
        const title = currentLesson.title || `Lesson ${curId}`;
        const total = (typeof lessonChars !== 'undefined' && lessonChars.length) ? lessonChars.length : 1;
        const currentIdx = (typeof lessonIndex === 'number') ? lessonIndex : 0;
        const pct = Math.min(100, Math.round((currentIdx / total) * 100));

        if(this.lessonTitle) this.lessonTitle.textContent = title;
        if(this.lessonBadge) this.lessonBadge.textContent = `L${curId}`;
        if(this.progressBar) this.progressBar.style.width = `${pct}%`;
        if(this.exerciseCount){
          this.exerciseCount.textContent = isKm
            ? `គ្រាប់ចុច ${currentIdx} នៃ ${total} (${pct}%)`
            : `Key ${currentIdx} of ${total} (${pct}%)`;
        }
        if(this.quickActionBtnText){
          this.quickActionBtnText.textContent = isKm ? 'ចាប់ផ្តើមឡើងវិញ' : 'Restart';
        }
      } else {
        if(this.lessonTitle) this.lessonTitle.textContent = isKm ? 'ការហ្វឹកហាត់សេរី' : 'Free Keyboard Practice';
        if(this.lessonBadge) this.lessonBadge.textContent = 'Ready';
        if(this.progressBar) this.progressBar.style.width = '0%';
        if(this.exerciseCount){
          this.exerciseCount.textContent = isKm ? 'ចុចចាប់ផ្តើមដើម្បីហ្វឹកហាត់' : 'Select a lesson or practice freely';
        }
        if(this.quickActionBtnText){
          this.quickActionBtnText.textContent = isKm ? 'ចាប់ផ្តើមមេរៀន' : 'Start Lesson';
        }
      }

      // 3. Streak flame counter & live telemetry bumps
      let liveStreak = 0;
      let liveWpm = null;
      let liveAcc = null;
      let liveKeys = null;
      if(typeof PK_TRACKER !== 'undefined' && typeof PK_TRACKER.getLiveLessonMetrics === 'function'){
        const metrics = PK_TRACKER.getLiveLessonMetrics();
        if(metrics && metrics.active){
          if(typeof metrics.currentStreak === 'number') liveStreak = metrics.currentStreak;
          if(typeof metrics.wpm === 'number') liveWpm = metrics.wpm;
          if(typeof metrics.accuracy === 'number') liveAcc = `${metrics.accuracy}%`;
          if(typeof metrics.correctCount === 'number') liveKeys = metrics.correctCount;
        }
      }
      const triggerBump = (el, text) => {
        if(!el || text === null || text === undefined) return;
        const old = el.textContent.trim();
        const next = String(text).trim();
        if(old !== next && old !== '' && old !== '-'){
          el.textContent = next;
          el.classList.remove('telemetry-bump');
          void el.offsetWidth;
          el.classList.add('telemetry-bump');
          setTimeout(() => el && el.classList.remove('telemetry-bump'), 260);
        } else {
          el.textContent = next;
        }
      };

      if(liveWpm !== null) triggerBump(this.statWpm, liveWpm);
      if(liveAcc !== null) triggerBump(this.statAcc, liveAcc);
      if(liveKeys !== null) triggerBump(this.statKeys, liveKeys);

      if(this.streakVal) {
        triggerBump(this.streakVal, liveStreak);
        const streakBox = this.streakVal.closest('.guide-stat-box');
        if(streakBox){
          streakBox.classList.toggle('has-streak', liveStreak >= 3);
          streakBox.classList.toggle('super-streak', liveStreak >= 15);
        }
        if(liveStreak < 10) {
          this._lastCelebratedStreak = 0;
        } else if([10, 25, 50, 100].includes(liveStreak) && this._lastCelebratedStreak !== liveStreak){
          this._lastCelebratedStreak = liveStreak;
          if(typeof showToast === 'function'){
            showToast('🔥', `${liveStreak} Keystroke Streak!`, isKm ? 'ការវាយជាប់គ្នាគ្មានកំហុស!' : 'Unstoppable rhythm & precision.');
          }
        }
      }

      // 4. Update tool buttons descriptions
      this.updateToolStatuses();
    }

    updateToolStatuses(){
      if(this.handsStatusDesc){
        const isHandsOn = (typeof handsOn !== 'undefined' && handsOn);
        this.handsStatusDesc.textContent = isHandsOn ? 'Active' : 'Off';
        this.handsStatusDesc.className = isHandsOn ? 'gas-sub status-on' : 'gas-sub status-off';
      }
      if(this.soundStatusDesc){
        const isSoundOn = (typeof soundOn !== 'undefined' && soundOn);
        this.soundStatusDesc.textContent = isSoundOn ? 'On' : 'Muted';
        this.soundStatusDesc.className = isSoundOn ? 'gas-sub status-on' : 'gas-sub status-off';
      }
    }

    updateTargetFinger(keyId, layer){
      if(!this.targetKeyBadge || !this.targetFingerName) return;

      const isKm = document.documentElement.classList.contains('site-km-mode');
      if(!keyId){
        this.targetKeyBadge.textContent = 'Rest';
        this.targetKeyBadge.className = 'gtc-key-badge resting';
        this.targetFingerName.textContent = isKm ? 'ដាក់ដៃលើជួរដើម' : 'Home Row Resting';
        if(this.targetFingerHint){
          this.targetFingerHint.textContent = isKm ? 'ម្រាមចង្អុលលើ F & J' : 'Index anchors on F & J';
        }
        return;
      }

      // Display key label
      let displayKey = KEY_DISPLAY_NAMES[keyId] || keyId.toUpperCase();
      const lyr = layer || (typeof currentLayer === 'function' ? currentLayer() : 'base');

      if(lyr === 'shift'){
        this.targetKeyBadge.innerHTML = `<span class="gtc-mod">⇧</span> ${displayKey}`;
      } else if(lyr === 'altgr'){
        this.targetKeyBadge.innerHTML = `<span class="gtc-mod">⌥</span> ${displayKey}`;
      } else {
        this.targetKeyBadge.textContent = displayKey;
      }
      this.targetKeyBadge.className = 'gtc-key-badge active-key';

      // Determine finger
      const fid = (typeof KEY_FINGER !== 'undefined') ? KEY_FINGER[keyId] : null;
      const meta = fid ? FINGER_MAP[fid] : null;

      if(meta){
        this.targetFingerName.textContent = isKm ? meta.km : meta.en;
        this.targetFingerName.style.color = meta.color;
        if(this.targetFingerHint){
          this.targetFingerHint.textContent = (lyr === 'shift')
            ? (isKm ? 'ចុចជាមួយ Shift' : 'Hold Shift combo')
            : (isKm ? 'ចុចដោយផ្ទាល់' : 'Direct press');
        }
      } else {
        this.targetFingerName.textContent = isKm ? 'ចុចគ្រាប់ចុច' : 'Strike Key';
        this.targetFingerName.style.color = 'var(--gold-bright)';
      }
    }

    highlightHomeRowKey(keyChar){
      if(!keyChar || !this.dock) return;
      this.dock.querySelectorAll('.guide-mini-key').forEach(el => {
        const km = el.querySelector('.km-ch')?.textContent.trim();
        const en = el.querySelector('.en-ch')?.textContent.trim().toLowerCase();
        if(en === keyChar || km === keyChar){
          el.classList.add('mini-pulsing');
          setTimeout(() => el.classList.remove('mini-pulsing'), 260);
        }
      });
    }

    scheduleWeakKeysUpdate(delayMs){
      if(weakKeysThrottle) clearTimeout(weakKeysThrottle);
      weakKeysThrottle = setTimeout(() => this.updateWeakKeys(), delayMs || 500);
    }

    updateWeakKeys(){
      if(!this.weakChips) return;
      const isKm = document.documentElement.classList.contains('site-km-mode');
      const curLayout = (typeof currentLayoutId !== 'undefined' ? currentLayoutId : 'standard');

      let weakList = [];

      // 1. Check PK_TRACKER character statistics
      if(typeof PK_TRACKER !== 'undefined' && typeof PK_TRACKER.getAllCharStats === 'function'){
        const allChars = PK_TRACKER.getAllCharStats(curLayout) || {};
        Object.keys(allChars).forEach(char => {
          const s = allChars[char];
          if(s && s.attempts >= 2 && s.accuracy < 90){
            weakList.push({ char, acc: Math.round(s.accuracy), mistakes: s.incorrect || 0 });
          }
        });
      }

      // 2. Fallback to key statistics if no character stats
      if(weakList.length === 0 && typeof PK_TRACKER !== 'undefined' && typeof PK_TRACKER.getAllKeyStats === 'function'){
        const allKeys = PK_TRACKER.getAllKeyStats(curLayout) || {};
        Object.keys(allKeys).forEach(k => {
          const s = allKeys[k];
          if(s && s.attempts >= 2 && s.accuracy < 90){
            weakList.push({ char: KEY_DISPLAY_NAMES[k] || k.toUpperCase(), acc: Math.round(s.accuracy), mistakes: s.incorrect || 0 });
          }
        });
      }

      // Sort by lowest accuracy first
      weakList.sort((a, b) => a.acc - b.acc);
      const topWeak = weakList.slice(0, 4);

      if(topWeak.length === 0){
        this.weakChips.innerHTML = `
          <span class="guide-weak-empty">
            <svg class="pk-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            ${isKm ? 'ភាពត្រឹមត្រូវល្អណាស់! បន្តហ្វឹកហាត់។' : 'Accuracy steady! All keys solid.'}
          </span>
        `;
        if(this.drillWeakBtn){
          this.drillWeakBtn.classList.remove('has-weak');
        }
        return;
      }

      if(this.drillWeakBtn){
        this.drillWeakBtn.classList.add('has-weak');
      }

      this.weakChips.innerHTML = topWeak.map(w => {
        const severity = w.acc < 75 ? 'danger' : 'warn';
        return `
          <button type="button" class="guide-weak-chip ${severity}" title="${w.char}: ${w.acc}% accuracy (${w.mistakes} mistakes)" data-char="${w.char}">
            <span class="gwc-char">${w.char}</span>
            <span class="gwc-acc">${w.acc}%</span>
          </button>
        `;
      }).join('');

      // Clicking an individual weak chip starts a drill focusing on that exact character
      this.weakChips.querySelectorAll('.guide-weak-chip').forEach(btn => {
        btn.addEventListener('click', () => {
          const char = btn.getAttribute('data-char');
          this.drillSpecificChar(char);
        });
      });
    }

    drillSpecificChar(char){
      const curLayout = (typeof currentLayoutId !== 'undefined' ? currentLayoutId : 'standard');
      if(typeof PK_REVIEW !== 'undefined' && typeof PK_REVIEW.generateReviewDrill === 'function'){
        const drill = PK_REVIEW.generateReviewDrill(curLayout, { target: char, length: 28 });
        if(drill && typeof startLesson === 'function'){
          startLesson(drill);
          if(typeof showToast === 'function'){
            showToast(pkIcon('sparkle', 16), `Targeted Drill: ${char}`, 'Focusing on accuracy and rhythm for this key.');
          }
          this.updateTelemetry();
          return;
        }
      }
      this.launchWeakKeyPractice();
    }

    launchWeakKeyPractice(){
      const curLayout = (typeof currentLayoutId !== 'undefined' ? currentLayoutId : 'standard');
      if(typeof PK_REVIEW !== 'undefined' && typeof PK_REVIEW.startAdaptivePractice === 'function'){
        const drill = PK_REVIEW.startAdaptivePractice(curLayout);
        if(drill){
          if(typeof showToast === 'function'){
            showToast(pkIcon('sparkle', 16), 'Adaptive Weak-Key Drill', 'Curated practice focusing on your trouble keys.');
          }
          this.updateTelemetry();
          return;
        }
      }

      // If no adaptive drill targets found, start regular first lesson
      this.handleQuickAction();
    }

    handleQuickAction(){
      const inLesson = (typeof lessonActive !== 'undefined' && lessonActive && typeof currentLesson !== 'undefined' && currentLesson);
      if(inLesson){
        if(typeof window.restartActivePractice === 'function'){
          window.restartActivePractice();
        } else if(typeof restartLesson === 'function'){
          restartLesson();
        }
      } else {
        // Start current or first unlocked lesson
        const curLayout = (typeof currentLayoutId !== 'undefined' ? currentLayoutId : 'standard');
        if(typeof LESSONS !== 'undefined' && LESSONS.length > 0){
          const firstLesson = LESSONS.find(l => (l.layoutId === curLayout || !l.layoutId)) || LESSONS[0];
          if(firstLesson && typeof startLesson === 'function'){
            startLesson(firstLesson);
          }
        }
      }
      this.updateTelemetry();
    }
  }

  // Global registration
  global.PKQuickGuide = new PKQuickGuideController();

})(typeof window !== 'undefined' ? window : global);
