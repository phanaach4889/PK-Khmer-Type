/* ============================================================
   PK Khmer Type — Foundational Real-Time Typing Tracking System
   ============================================================
   Zero-latency, privacy-first observer layer collecting real-time
   performance data per key, per logical typing unit, per finger,
   and per session to empower Phase 7 progress and Phase 8 adaptive review.
   100% strictly local — zero network requests, zero telemetry.
   ============================================================ */

(function(global){
  'use strict';

  const STORAGE_KEY = 'khmerTrackingData_v1';
  const MAX_ACTIVE_GAP_MS = 2500;       // Max gap between strokes counted as active typing (2.5s)
  const MAX_MISTAKES_HISTORY = 100;     // Bounded circular buffer for recent mistakes
  const MAX_SESSIONS_HISTORY = 20;      // Keep last 20 learning sessions
  const MAX_RECENT_PER_KEY = 5;         // Recent mistakes kept per individual key
  const MAX_RECENT_PER_CHAR = 5;        // Recent mistakes kept per individual character
  const VALID_LAYOUTS = ['standard', 'nida', 'english'];
  const VALID_FINGERS = ['lp', 'lr', 'lm', 'li', 'lt', 'rt', 'ri', 'rm', 'rr', 'rp'];

  /* Helper to produce clean default key statistics */
  function createDefaultKeyStat(){
    return {
      attempts: 0,
      correct: 0,
      incorrect: 0,
      accuracy: 100,
      totalResponseTimeMs: 0,
      avgResponseTimeMs: 0,
      minResponseTimeMs: null,
      maxResponseTimeMs: null,
      currentStreak: 0,
      bestStreak: 0,
      lastUsedTime: null,
      recentMistakes: []
    };
  }

  /* Helper to produce clean default character statistics */
  function createDefaultCharStat(){
    return {
      attempts: 0,
      correct: 0,
      incorrect: 0,
      accuracy: 100,
      totalResponseTimeMs: 0,
      avgResponseTimeMs: 0,
      lastPracticed: null,
      recentErrors: []
    };
  }

  /* Helper to produce clean default finger statistics */
  function createDefaultFingerStat(){
    return {
      attempts: 0,
      correct: 0,
      mistakes: 0,
      accuracy: 100,
      totalResponseTimeMs: 0,
      avgResponseTimeMs: 0
    };
  }

  /* Core in-memory state */
  const state = {
    version: 1,
    keyStats: { standard: {}, nida: {}, english: {} },
    charStats: { standard: {}, nida: {}, english: {} },
    fingerStats: {},
    recentMistakes: [],
    sessions: [],
    currentSession: {
      sessionId: 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      startTime: Date.now(),
      endTime: null,
      activeTypingDurationMs: 0,
      layoutsUsed: [],
      lessonsPracticed: [],
      totalUnits: 0,
      totalCorrect: 0,
      totalMistakes: 0,
      totalBackspaces: 0
    },
    liveLesson: {
      active: false,
      lessonId: null,
      layoutId: null,
      exerciseId: null,
      totalUnits: 0,
      currentIndex: 0,
      correctCount: 0,
      mistakeCount: 0,
      backspaceCount: 0,
      correctedCount: 0,
      currentStreak: 0,
      bestStreak: 0,
      accuracy: 100,
      wpm: 0,
      activeTypingTimeMs: 0,
      currentResponseTimeMs: 0,
      avgResponseTimeMs: 0,
      totalResponseTimeMs: 0,
      lastExpectedUnit: null,
      sections: [],
      keyMistakes: {},
      unitMistakes: {},
      fingerMistakes: {},
      keyAttempts: {},
      unitAttempts: {},
      exerciseStats: {},
      shiftMistakes: 0
    },
    lastKeystrokeTime: 0,
    lastEvent: null
  };

  // Initialize finger stats keys
  VALID_FINGERS.forEach(f => {
    state.fingerStats[f] = createDefaultFingerStat();
  });
  state.fingerStats['unknown'] = createDefaultFingerStat();

  /* ---------- Persistence (Debounced & Safe) ---------- */
  let saveTimeout = null;

  function loadFromStorage(){
    try {
      if(typeof localStorage === 'undefined') return;
      const raw = localStorage.getItem(STORAGE_KEY);
      if(!raw) return;
      const parsed = JSON.parse(raw);
      if(!parsed || typeof parsed !== 'object') return;

      if(parsed.keyStats && typeof parsed.keyStats === 'object'){
        VALID_LAYOUTS.forEach(l => {
          if(parsed.keyStats[l]) state.keyStats[l] = parsed.keyStats[l];
        });
      }
      if(parsed.charStats && typeof parsed.charStats === 'object'){
        VALID_LAYOUTS.forEach(l => {
          if(parsed.charStats[l]) state.charStats[l] = parsed.charStats[l];
        });
      }
      if(parsed.fingerStats && typeof parsed.fingerStats === 'object'){
        Object.keys(parsed.fingerStats).forEach(f => {
          state.fingerStats[f] = parsed.fingerStats[f];
        });
      }
      if(Array.isArray(parsed.recentMistakes)){
        state.recentMistakes = parsed.recentMistakes.slice(-MAX_MISTAKES_HISTORY);
      }
      if(Array.isArray(parsed.sessions)){
        state.sessions = parsed.sessions.slice(-MAX_SESSIONS_HISTORY);
      }
    } catch(err){
      // Fail silently without blocking the application
    }
  }

  function saveToStorage(){
    if(saveTimeout){
      clearTimeout(saveTimeout);
      saveTimeout = null;
    }
    try {
      if(typeof localStorage === 'undefined') return;
      if(typeof window !== 'undefined' && window.__isResettingProgress) return;
      const payload = {
        version: state.version,
        updatedAt: Date.now(),
        keyStats: state.keyStats,
        charStats: state.charStats,
        fingerStats: state.fingerStats,
        recentMistakes: state.recentMistakes.slice(-MAX_MISTAKES_HISTORY),
        sessions: state.sessions.slice(-MAX_SESSIONS_HISTORY)
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch(err){
      // Fail safely on quota exceeded or restricted environments
    }
  }

  function scheduleDebouncedSave(){
    if(saveTimeout) return;
    saveTimeout = setTimeout(()=>{
      saveTimeout = null;
      saveToStorage();
    }, 2500);
  }

  /* Load existing records immediately on initialization */
  loadFromStorage();

  /* Save on window beforeunload or visibility hidden */
  if(typeof window !== 'undefined'){
    window.addEventListener('beforeunload', saveToStorage);
    if(typeof document !== 'undefined'){
      document.addEventListener('visibilitychange', ()=>{
        if(document.visibilityState === 'hidden') saveToStorage();
      });
    }
  }

  /* ---------- Helpers ---------- */
  function normalizeLayout(layout){
    return VALID_LAYOUTS.includes(layout) ? layout : 'nida';
  }

  function resolveFinger(keyId){
    const kf = (typeof window !== 'undefined' && window.KEY_FINGER) ||
               (typeof KEY_FINGER !== 'undefined' ? KEY_FINGER : null) ||
               (typeof global !== 'undefined' && global.KEY_FINGER ? global.KEY_FINGER : null);
    if(kf && kf[keyId]){
      return kf[keyId];
    }
    return 'unknown';
  }

  const FINGER_DISPLAY_NAMES = {
    lp: 'left pinky finger',
    lr: 'left ring finger',
    lm: 'left middle finger',
    li: 'left index finger',
    lt: 'left thumb',
    rt: 'right thumb',
    ri: 'right index finger',
    rm: 'right middle finger',
    rr: 'right ring finger',
    rp: 'right pinky finger',
    thumb: 'thumb'
  };

  function formatFingerName(f){
    return FINGER_DISPLAY_NAMES[f] || 'finger';
  }

  /* ---------- Event Handlers ---------- */

  /**
   * Records a completed typing unit attempt (either correct or mistake).
   */
  function recordTypingUnit(data){
    if(!data) return;
    const now = Date.now();
    const layout = normalizeLayout(data.layout || (typeof global.currentLayoutId !== 'undefined' ? global.currentLayoutId : 'nida'));
    const isCorrect = !!data.correct;
    const expected = data.expected || '';
    const produced = data.produced || '';
    const keyId = data.expectedKeyId || data.strokeKeyId || data.keyId || 'unknown';
    const finger = data.finger || resolveFinger(keyId);
    const lessonId = data.lessonId || (state.liveLesson.active ? state.liveLesson.lessonId : null);
    const exerciseId = data.exerciseId || (state.liveLesson.active ? state.liveLesson.exerciseId : null);
    const unitIndex = typeof data.unitIndex === 'number' ? data.unitIndex : state.liveLesson.currentIndex;

    // Response time calculation
    let responseTimeMs = 300;
    if(state.lastKeystrokeTime > 0){
      const rawDiff = now - state.lastKeystrokeTime;
      if(rawDiff > 0 && rawDiff <= MAX_ACTIVE_GAP_MS){
        responseTimeMs = rawDiff;
        state.currentSession.activeTypingDurationMs += rawDiff;
        if(state.liveLesson.active){
          state.liveLesson.activeTypingTimeMs += rawDiff;
        }
      } else {
        // Paused or inactive gap: clamp response time estimate to avoid skewing averages
        responseTimeMs = Math.min(rawDiff, MAX_ACTIVE_GAP_MS);
        state.currentSession.activeTypingDurationMs += 400; // standard stroke estimate
        if(state.liveLesson.active){
          state.liveLesson.activeTypingTimeMs += 400;
        }
      }
    } else {
      // First keystroke
      state.currentSession.activeTypingDurationMs += 400;
      if(state.liveLesson.active){
        state.liveLesson.activeTypingTimeMs += 400;
      }
    }
    state.lastKeystrokeTime = now;

    // 1. Session Updates
    state.currentSession.totalUnits++;
    if(isCorrect) state.currentSession.totalCorrect++;
    else state.currentSession.totalMistakes++;

    if(!state.currentSession.layoutsUsed.includes(layout)){
      state.currentSession.layoutsUsed.push(layout);
    }
    if(lessonId && !state.currentSession.lessonsPracticed.includes(lessonId)){
      state.currentSession.lessonsPracticed.push(lessonId);
    }

    // 2. Live Lesson Updates
    if(state.liveLesson.active){
      state.liveLesson.lastExpectedUnit = expected;

      // Determine exercise section
      let effExId = exerciseId || state.liveLesson.exerciseId;
      if(!effExId && state.liveLesson.sections && state.liveLesson.sections.length){
        const sec = state.liveLesson.sections.find(s => unitIndex >= s.startIndex && unitIndex <= s.endIndex);
        if(sec) effExId = sec.id;
      }
      if(effExId){
        if(!state.liveLesson.exerciseStats[effExId]){
          state.liveLesson.exerciseStats[effExId] = {
            id: effExId,
            type: 'drill',
            title: effExId,
            totalUnits: 0,
            correct: 0,
            mistakes: 0,
            accuracy: 100
          };
        }
        const exs = state.liveLesson.exerciseStats[effExId];
        exs.totalUnits++;
        if(isCorrect) exs.correct++;
        else exs.mistakes++;
        const exTot = exs.correct + exs.mistakes;
        exs.accuracy = exTot > 0 ? Math.round((exs.correct / exTot) * 100) : 100;
      }

      // Per-key live lesson attempts & mistakes
      if(keyId && keyId !== 'unknown'){
        if(!state.liveLesson.keyAttempts[keyId]){
          state.liveLesson.keyAttempts[keyId] = { attempts: 0, correct: 0, mistakes: 0, totalTimeMs: 0 };
        }
        const ka = state.liveLesson.keyAttempts[keyId];
        ka.attempts++;
        ka.totalTimeMs += responseTimeMs;
        if(isCorrect) ka.correct++;
        else {
          ka.mistakes++;
          state.liveLesson.keyMistakes[keyId] = (state.liveLesson.keyMistakes[keyId] || 0) + 1;
        }
      }

      // Per-unit live lesson attempts & mistakes
      if(expected){
        if(!state.liveLesson.unitAttempts[expected]){
          state.liveLesson.unitAttempts[expected] = { attempts: 0, correct: 0, mistakes: 0, totalTimeMs: 0 };
        }
        const ua = state.liveLesson.unitAttempts[expected];
        ua.attempts++;
        ua.totalTimeMs += responseTimeMs;
        if(isCorrect) ua.correct++;
        else {
          ua.mistakes++;
          state.liveLesson.unitMistakes[expected] = (state.liveLesson.unitMistakes[expected] || 0) + 1;
        }
      }

      // Finger live lesson mistakes
      if(!isCorrect && finger && finger !== 'unknown'){
        state.liveLesson.fingerMistakes[finger] = (state.liveLesson.fingerMistakes[finger] || 0) + 1;
      }

      // Shift live lesson mistakes
      if(!isCorrect && (data.expectedLayer === 'shift' || data.strokeLayer === 'shift')){
        state.liveLesson.shiftMistakes++;
      }

      if(isCorrect){
        state.liveLesson.correctCount++;
        state.liveLesson.currentStreak++;
        if(state.liveLesson.currentStreak > state.liveLesson.bestStreak){
          state.liveLesson.bestStreak = state.liveLesson.currentStreak;
        }
        state.liveLesson.currentIndex = unitIndex + 1;
      } else {
        state.liveLesson.mistakeCount++;
        state.liveLesson.currentStreak = 0;
      }

      const totalAttempts = state.liveLesson.correctCount + state.liveLesson.mistakeCount;
      state.liveLesson.accuracy = totalAttempts > 0
        ? Math.round((state.liveLesson.correctCount / totalAttempts) * 100)
        : 100;

      state.liveLesson.currentResponseTimeMs = responseTimeMs;
      state.liveLesson.totalResponseTimeMs += responseTimeMs;
      state.liveLesson.avgResponseTimeMs = Math.round(state.liveLesson.totalResponseTimeMs / totalAttempts);

      if(state.liveLesson.activeTypingTimeMs > 0){
        const activeMinutes = state.liveLesson.activeTypingTimeMs / 60000;
        state.liveLesson.wpm = Math.min(180, Math.round((state.liveLesson.correctCount / 5) / activeMinutes));
      }
    }

    // 3. Per-Key Tracking (Isolated per layout)
    if(keyId && keyId !== 'unknown'){
      if(!state.keyStats[layout][keyId]){
        state.keyStats[layout][keyId] = createDefaultKeyStat();
      }
      const ks = state.keyStats[layout][keyId];
      ks.attempts++;
      ks.lastUsedTime = now;

      if(isCorrect){
        ks.correct++;
        ks.currentStreak++;
        if(ks.currentStreak > ks.bestStreak) ks.bestStreak = ks.currentStreak;
      } else {
        ks.incorrect++;
        ks.currentStreak = 0;
        ks.recentMistakes.push({
          produced,
          expected,
          time: now
        });
        if(ks.recentMistakes.length > MAX_RECENT_PER_KEY){
          ks.recentMistakes.shift();
        }
      }

      ks.accuracy = Math.round((ks.correct / ks.attempts) * 100);
      ks.totalResponseTimeMs += responseTimeMs;
      ks.avgResponseTimeMs = Math.round(ks.totalResponseTimeMs / ks.attempts);
      if(ks.minResponseTimeMs === null || responseTimeMs < ks.minResponseTimeMs){
        ks.minResponseTimeMs = responseTimeMs;
      }
      if(ks.maxResponseTimeMs === null || responseTimeMs > ks.maxResponseTimeMs){
        ks.maxResponseTimeMs = responseTimeMs;
      }
    }

    // 4. Per-Character / Logical Typing Unit Tracking
    if(expected){
      if(!state.charStats[layout][expected]){
        state.charStats[layout][expected] = createDefaultCharStat();
      }
      const cs = state.charStats[layout][expected];
      cs.attempts++;
      cs.lastPracticed = now;

      if(isCorrect){
        cs.correct++;
      } else {
        cs.incorrect++;
        cs.recentErrors.push({
          produced,
          time: now
        });
        if(cs.recentErrors.length > MAX_RECENT_PER_CHAR){
          cs.recentErrors.shift();
        }
      }

      cs.accuracy = Math.round((cs.correct / cs.attempts) * 100);
      cs.totalResponseTimeMs += responseTimeMs;
      cs.avgResponseTimeMs = Math.round(cs.totalResponseTimeMs / cs.attempts);
    }

    // 5. Finger Tracking
    const fg = VALID_FINGERS.includes(finger) ? finger : 'unknown';
    const fs = state.fingerStats[fg];
    if(fs){
      fs.attempts++;
      if(isCorrect) fs.correct++;
      else fs.mistakes++;
      fs.accuracy = Math.round((fs.correct / fs.attempts) * 100);
      fs.totalResponseTimeMs += responseTimeMs;
      fs.avgResponseTimeMs = Math.round(fs.totalResponseTimeMs / fs.attempts);
    }

    // 6. Mistake History
    if(!isCorrect){
      state.recentMistakes.push({
        layout,
        lessonId,
        exerciseId,
        unitIndex,
        expected,
        produced,
        keyId,
        finger,
        timestamp: now,
        responseTimeMs,
        corrected: false
      });
      if(state.recentMistakes.length > MAX_MISTAKES_HISTORY){
        state.recentMistakes.shift();
      }
    } else {
      // If correct unit typed, mark previous uncorrected mistake at this position as corrected
      for(let i = state.recentMistakes.length - 1; i >= 0; i--){
        const m = state.recentMistakes[i];
        if(m.layout === layout && m.lessonId === lessonId && m.expected === expected && !m.corrected){
          m.corrected = true;
          break;
        }
      }
    }

    state.lastEvent = {
      type: 'typingUnit',
      layout,
      lessonId,
      expected,
      produced,
      correct: isCorrect,
      keyId,
      finger,
      responseTimeMs,
      timestamp: now
    };

    // Forward to Phase 7 persistent progress tracking
    if(typeof global.PK_PROGRESS !== 'undefined' && typeof global.PK_PROGRESS.recordTypingUnit === 'function'){
      global.PK_PROGRESS.recordTypingUnit({
        layout,
        lessonId,
        exerciseId,
        expected,
        produced,
        correct: isCorrect,
        expectedKeyId: keyId,
        finger,
        responseTimeMs
      });
    }

    scheduleDebouncedSave();
  }

  /**
   * Records Backspace action in a lesson or editor.
   */
  function recordBackspace(data){
    const now = Date.now();
    state.currentSession.totalBackspaces++;

    if(state.liveLesson.active){
      state.liveLesson.backspaceCount++;
      state.liveLesson.correctedCount++;
      if(typeof data?.unitIndex === 'number'){
        state.liveLesson.currentIndex = Math.max(0, data.unitIndex);
      }
      state.liveLesson.currentStreak = Math.max(0, state.liveLesson.currentStreak - 1);
    }

    // Mark mistake as acknowledged/in correction
    if(data && data.poppedUnit){
      for(let i = state.recentMistakes.length - 1; i >= 0; i--){
        const m = state.recentMistakes[i];
        if(m.expected === data.poppedUnit && !m.corrected){
          m.corrected = true;
          break;
        }
      }
    }

    state.lastKeystrokeTime = now;
    state.lastEvent = {
      type: 'backspace',
      timestamp: now,
      data
    };

    scheduleDebouncedSave();
  }

  /**
   * Records the start of a lesson.
   */
  function recordLessonStart(data){
    const now = Date.now();
    const layout = normalizeLayout(data?.layout || (typeof global.currentLayoutId !== 'undefined' ? global.currentLayoutId : 'nida'));
    const lessonId = data?.lessonId || data?.id || (data?.lesson ? data.lesson.id : 'unknown');
    const totalUnits = typeof data?.totalUnits === 'number' ? data.totalUnits : (data?.lessonChars ? data.lessonChars.length : 0);

    const sections = Array.isArray(data?.sections) ? data.sections.slice() : [];
    const exStats = {};
    sections.forEach(s => {
      if(s && s.id){
        exStats[s.id] = {
          id: s.id,
          type: s.type || 'drill',
          title: s.title || s.id,
          startIndex: s.startIndex,
          endIndex: s.endIndex,
          totalUnits: typeof s.totalUnits === 'number' ? s.totalUnits : (s.endIndex - s.startIndex + 1),
          correct: 0,
          mistakes: 0,
          accuracy: 100
        };
      }
    });

    state.liveLesson = {
      active: true,
      lessonId: String(lessonId),
      layoutId: layout,
      exerciseId: data?.exerciseId || (sections[0] ? sections[0].id : null),
      totalUnits,
      currentIndex: 0,
      correctCount: 0,
      mistakeCount: 0,
      backspaceCount: 0,
      correctedCount: 0,
      currentStreak: 0,
      bestStreak: 0,
      accuracy: 100,
      wpm: 0,
      activeTypingTimeMs: 0,
      currentResponseTimeMs: 0,
      avgResponseTimeMs: 0,
      totalResponseTimeMs: 0,
      lastExpectedUnit: null,
      sections,
      keyMistakes: {},
      unitMistakes: {},
      fingerMistakes: {},
      keyAttempts: {},
      unitAttempts: {},
      exerciseStats: exStats,
      shiftMistakes: 0
    };

    state.lastKeystrokeTime = 0;
    state.lastEvent = { type: 'lessonStart', layout, lessonId, timestamp: now };
    scheduleDebouncedSave();
  }

  /**
   * Records lesson completion.
   */
  function recordLessonComplete(data){
    const now = Date.now();
    if(state.liveLesson.active){
      state.liveLesson.active = false;
      if(data?.accuracy !== undefined) state.liveLesson.accuracy = data.accuracy;
      if(data?.wpm !== undefined) state.liveLesson.wpm = data.wpm;
    }
    state.lastEvent = { type: 'lessonComplete', data, timestamp: now };
    saveToStorage(); // Immediate flush on lesson finish
  }

  /**
   * Records lesson exit or cancel.
   */
  function recordLessonExit(data){
    const now = Date.now();
    state.liveLesson.active = false;
    state.lastEvent = { type: 'lessonExit', data, timestamp: now };
    saveToStorage();
  }

  /**
   * Records typing race start.
   */
  function recordRaceStart(data){
    const now = Date.now();
    state.lastEvent = { type: 'raceStart', data, timestamp: now };
    scheduleDebouncedSave();
  }

  /**
   * Records typing race completion.
   */
  function recordRaceComplete(data){
    const now = Date.now();
    state.lastEvent = { type: 'raceComplete', data, timestamp: now };
    saveToStorage();
  }

  /**
   * Records layout switch.
   */
  function recordLayoutSwitch(fromLayout, toLayout){
    const now = Date.now();
    const toNorm = normalizeLayout(toLayout);
    if(!state.currentSession.layoutsUsed.includes(toNorm)){
      state.currentSession.layoutsUsed.push(toNorm);
    }
    state.lastEvent = { type: 'layoutSwitch', from: fromLayout, to: toLayout, timestamp: now };
    scheduleDebouncedSave();
  }

  /* ---------- Developer Inspection API ---------- */
  const api = {
    // Event hooks
    recordTypingUnit,
    recordBackspace,
    recordLessonStart,
    recordLessonComplete,
    recordLessonExit,
    recordRaceStart,
    recordRaceComplete,
    recordLayoutSwitch,

    // Live Metrics Inspection
    getLiveLessonMetrics(){
      const l = state.liveLesson;
      const progressPct = l.totalUnits > 0 ? Math.min(100, Math.round((l.currentIndex / l.totalUnits) * 100)) : 0;

      // Compute most-missed key in current lesson (only if >= 2 mistakes to avoid single-error false alarm)
      let mostMissedKey = null;
      let maxKeyMistakes = 0;
      Object.keys(l.keyMistakes || {}).forEach(k => {
        const cnt = l.keyMistakes[k];
        if(cnt >= 2 && cnt > maxKeyMistakes){
          mostMissedKey = k;
          maxKeyMistakes = cnt;
        }
      });

      // Compute most-missed unit in current lesson (only if >= 2 mistakes)
      let mostMissedUnit = null;
      let maxUnitMistakes = 0;
      Object.keys(l.unitMistakes || {}).forEach(u => {
        const cnt = l.unitMistakes[u];
        if(cnt >= 2 && cnt > maxUnitMistakes){
          mostMissedUnit = u;
          maxUnitMistakes = cnt;
        }
      });

      // Compute difficult finger (if >= 3 mistakes and >= 35% of total mistakes)
      let difficultFinger = null;
      if(l.mistakeCount >= 3){
        Object.keys(l.fingerMistakes || {}).forEach(f => {
          const cnt = l.fingerMistakes[f];
          if(cnt >= 3 && (cnt / l.mistakeCount) >= 0.35){
            difficultFinger = { finger: f, count: cnt, pct: Math.round((cnt / l.mistakeCount) * 100) };
          }
        });
      }

      // Generate subtle live hint (only when repeated evidence exists)
      let liveHint = null;
      if(mostMissedKey){
        const displayKey = mostMissedKey.length === 1 ? mostMissedKey.toUpperCase() : mostMissedKey;
        liveHint = `Tip: ${displayKey} has been your most-missed key in this lesson.`;
      } else if(mostMissedUnit && mostMissedUnit !== ' '){
        liveHint = `Tip: "${mostMissedUnit}" has been your most-missed character in this lesson.`;
      } else if(difficultFinger){
        const fName = formatFingerName(difficultFinger.finger);
        liveHint = `Tip: Steady your hand on ${fName} (${difficultFinger.pct}% of mistakes).`;
      }

      return {
        active: l.active,
        lessonId: l.lessonId,
        layoutId: l.layoutId,
        exerciseId: l.exerciseId,
        position: l.currentIndex,
        totalUnits: l.totalUnits,
        remainingUnits: Math.max(0, l.totalUnits - l.currentIndex),
        progressPct,
        accuracy: l.accuracy,
        wpm: l.wpm,
        currentStreak: l.currentStreak,
        bestStreak: l.bestStreak,
        mistakeCount: l.mistakeCount,
        backspaceCount: l.backspaceCount,
        correctedCount: l.correctedCount,
        activeTypingDurationSec: Math.round((l.activeTypingTimeMs / 1000) * 10) / 10,
        currentResponseTimeMs: l.currentResponseTimeMs,
        avgResponseTimeMs: l.avgResponseTimeMs,
        lastExpectedUnit: l.lastExpectedUnit,
        mostMissedKey: mostMissedKey ? { key: mostMissedKey, count: maxKeyMistakes } : null,
        mostMissedUnit: mostMissedUnit ? { unit: mostMissedUnit, count: maxUnitMistakes } : null,
        difficultFinger,
        liveHint,
        sections: (l.sections || []).slice(),
        keyMistakes: Object.assign({}, l.keyMistakes),
        unitMistakes: Object.assign({}, l.unitMistakes),
        fingerMistakes: Object.assign({}, l.fingerMistakes),
        exerciseStats: Object.assign({}, l.exerciseStats),
        keyAttempts: Object.assign({}, l.keyAttempts),
        unitAttempts: Object.assign({}, l.unitAttempts),
        shiftMistakes: l.shiftMistakes
      };
    },

    // Key Stats Inspection
    getKeyStats(layoutId, keyId){
      const l = normalizeLayout(layoutId);
      const ks = state.keyStats[l] && state.keyStats[l][keyId];
      return ks ? Object.assign({}, ks) : null;
    },

    getAllKeyStats(layoutId){
      const l = normalizeLayout(layoutId);
      return Object.assign({}, state.keyStats[l] || {});
    },

    // Character Stats Inspection
    getCharStats(layoutId, charUnit){
      const l = normalizeLayout(layoutId);
      const cs = state.charStats[l] && state.charStats[l][charUnit];
      return cs ? Object.assign({}, cs) : null;
    },

    getAllCharStats(layoutId){
      const l = normalizeLayout(layoutId);
      return Object.assign({}, state.charStats[l] || {});
    },

    // Finger Stats Inspection
    getFingerStats(fingerId){
      const fs = state.fingerStats[fingerId];
      return fs ? Object.assign({}, fs) : null;
    },

    getAllFingerStats(){
      const copy = {};
      Object.keys(state.fingerStats).forEach(f => {
        copy[f] = Object.assign({}, state.fingerStats[f]);
      });
      return copy;
    },

    // Session Summary
    getSessionSummary(){
      const s = state.currentSession;
      const now = Date.now();
      const totalElapsedSec = Math.round((now - s.startTime) / 1000);
      const activeDurationSec = Math.round((s.activeTypingDurationMs / 1000) * 10) / 10;
      const overallAcc = s.totalUnits > 0 ? Math.round((s.totalCorrect / s.totalUnits) * 100) : 100;
      return {
        sessionId: s.sessionId,
        startTime: s.startTime,
        totalElapsedSec,
        activeDurationSec,
        layoutsUsed: s.layoutsUsed.slice(),
        lessonsPracticed: s.lessonsPracticed.slice(),
        totalUnits: s.totalUnits,
        totalCorrect: s.totalCorrect,
        totalMistakes: s.totalMistakes,
        totalBackspaces: s.totalBackspaces,
        overallAccuracy: overallAcc
      };
    },

    getRecentMistakes(limit){
      const lim = typeof limit === 'number' && limit > 0 ? limit : 20;
      return state.recentMistakes.slice(-lim);
    },

    getRecentSessions(limit){
      const lim = typeof limit === 'number' && limit > 0 ? limit : 10;
      return state.sessions.slice(-lim);
    },

    getLastEvent(){
      return state.lastEvent ? Object.assign({}, state.lastEvent) : null;
    },

    flush(){
      saveToStorage();
    },

    reload(){
      loadFromStorage();
    },

    reset(){
      state.keyStats = { standard: {}, nida: {}, english: {} };
      state.charStats = { standard: {}, nida: {}, english: {} };
      VALID_FINGERS.forEach(f => { state.fingerStats[f] = createDefaultFingerStat(); });
      state.fingerStats['unknown'] = createDefaultFingerStat();
      state.recentMistakes = [];
      state.sessions = [];
      state.currentSession = {
        sessionId: 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
        startTime: Date.now(),
        endTime: null,
        activeTypingDurationMs: 0,
        layoutsUsed: [],
        lessonsPracticed: [],
        totalUnits: 0,
        totalCorrect: 0,
        totalMistakes: 0,
        totalBackspaces: 0
      };
      saveToStorage();
    }
  };

  global.PK_TRACKER = api;

})(typeof window !== 'undefined' ? window : global);
