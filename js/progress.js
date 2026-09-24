/* ============================================================
   PK Khmer Type — Phase 7 Persistent Progress Tracking System
   ============================================================
   Zero-latency, privacy-first progress tracking engine that turns
   real-time observer telemetry into structured, persistent learner progress.
   Maintains strict isolation between Standard Khmer, Khmer NiDA,
   and English US courses.
   100% offline — zero cloud, zero telemetry, versioned local persistence.
   ============================================================ */

(function(global){
  'use strict';

  const STORAGE_KEY = 'khmerProgress_v2';
  const VALID_LAYOUTS = ['standard', 'nida', 'english'];
  const VALID_FINGERS = ['lp', 'lr', 'lm', 'li', 'lt', 'rt', 'ri', 'rm', 'rr', 'rp', 'unknown'];

  const MAX_RECENT_ATTEMPTS = 10;
  const MAX_RECENT_MISTAKES = 5;
  const MAX_RECENT_PERFORMANCE = 10;
  const MAX_HISTORY_SESSIONS = 20;
  const MAX_HISTORY_COMPLETIONS = 50;

  /* Helper to normalize layout IDs */
  function normalizeLayout(id){
    if(!id) return 'nida';
    const s = String(id).toLowerCase();
    if(s.includes('eng')) return 'english';
    if(s.includes('std') || s.includes('standard')) return 'standard';
    return 'nida';
  }

  /* Factory: Empty Course Progress */
  function createEmptyCourse(layoutId){
    return {
      layoutId: layoutId,
      totalPracticeTimeMs: 0,
      totalTypingUnits: 0,
      totalMistakes: 0,
      totalCorrections: 0,
      overallAccuracy: 100,
      levels: {},
      lessons: {},
      keys: {},
      characters: {}
    };
  }

  /* Factory: Default Key Record */
  function createDefaultKeyRecord(keyId){
    return {
      keyId: String(keyId),
      attempts: 0,
      correct: 0,
      incorrect: 0,
      accuracy: 100,
      avgResponseTimeMs: 0,
      totalResponseTimeMs: 0,
      recentMistakes: [],
      lastPracticed: null,
      masteryState: 'learning' // 'learning' | 'stable' | 'mastered'
    };
  }

  /* Factory: Default Character / Typing-Unit Record */
  function createDefaultCharRecord(unit){
    return {
      unit: String(unit),
      attempts: 0,
      correct: 0,
      incorrect: 0,
      accuracy: 100,
      avgResponseTimeMs: 0,
      totalResponseTimeMs: 0,
      recentPerformance: [], // boolean[] (last 10)
      lastPracticed: null,
      confidence: 0, // 0 - 100
      masteryState: 'learning' // 'learning' | 'stable' | 'mastered'
    };
  }

  /* Factory: Default Finger Record */
  function createDefaultFingerRecord(fingerId){
    return {
      finger: String(fingerId),
      attempts: 0,
      correct: 0,
      incorrect: 0,
      accuracy: 100,
      avgResponseTimeMs: 0,
      totalResponseTimeMs: 0,
      recentMistakes: []
    };
  }

  /* Factory: Default Lesson Record */
  function createDefaultLessonRecord(lessonId, levelId){
    return {
      id: String(lessonId),
      levelId: levelId ? String(levelId) : '',
      started: false,
      completed: false,
      completionCount: 0,
      totalAttempts: 0,
      bestAccuracy: 0,
      bestWpm: 0,
      totalTypingUnits: 0,
      totalMistakes: 0,
      totalCorrections: 0,
      activeTypingTimeMs: 0,
      masteryState: 'unstarted', // 'unstarted' | 'practicing' | 'proficient' | 'mastered'
      mostRecentAttempt: null,
      bestAttempt: null,
      recentAttempts: [],
      exercises: {}
    };
  }

  /* Factory: Default Level Record */
  function createDefaultLevelRecord(levelId){
    return {
      id: String(levelId),
      started: false,
      completed: false,
      mastered: false,
      lessonsCompleted: 0,
      lessonsTotal: 0,
      completionPercentage: 0,
      averageAccuracy: 0,
      averageWpm: 0,
      totalPracticeTimeMs: 0,
      lastPracticed: null,
      masteryStatus: 'locked' // 'locked' | 'unlocked' | 'in-progress' | 'completed' | 'mastered'
    };
  }

  /* In-memory store */
  const state = {
    version: 2,
    updatedAt: Date.now(),
    courses: {
      standard: createEmptyCourse('standard'),
      nida: createEmptyCourse('nida'),
      english: createEmptyCourse('english')
    },
    fingers: {},
    history: {
      recentSessions: [],
      recentCompletions: []
    }
  };

  // Pre-seed finger containers
  VALID_FINGERS.forEach(f => {
    state.fingers[f] = createDefaultFingerRecord(f);
  });

  /* ---------- Validation and Data Repair ---------- */
  function validateAndRepair(data){
    if(!data || typeof data !== 'object') return null;

    const clean = {
      version: 2,
      updatedAt: typeof data.updatedAt === 'number' ? data.updatedAt : Date.now(),
      courses: {
        standard: createEmptyCourse('standard'),
        nida: createEmptyCourse('nida'),
        english: createEmptyCourse('english')
      },
      fingers: {},
      history: {
        recentSessions: [],
        recentCompletions: []
      }
    };

    VALID_FINGERS.forEach(f => {
      clean.fingers[f] = createDefaultFingerRecord(f);
    });

    // Validate courses
    VALID_LAYOUTS.forEach(layout => {
      const srcCourse = data.courses && data.courses[layout];
      if(!srcCourse || typeof srcCourse !== 'object') return;

      const target = clean.courses[layout];
      target.totalPracticeTimeMs = Math.max(0, Number(srcCourse.totalPracticeTimeMs) || 0);
      target.totalTypingUnits = Math.max(0, Number(srcCourse.totalTypingUnits) || 0);
      target.totalMistakes = Math.max(0, Number(srcCourse.totalMistakes) || 0);
      target.totalCorrections = Math.max(0, Number(srcCourse.totalCorrections) || 0);
      target.overallAccuracy = Math.min(100, Math.max(0, Number(srcCourse.overallAccuracy) || 100));

      // Validate lessons
      if(srcCourse.lessons && typeof srcCourse.lessons === 'object'){
        Object.keys(srcCourse.lessons).forEach(lid => {
          const l = srcCourse.lessons[lid];
          if(!l || typeof l !== 'object') return;
          const safeL = createDefaultLessonRecord(lid, l.levelId);
          safeL.started = !!l.started;
          safeL.completed = !!l.completed;
          safeL.completionCount = Math.max(0, Number(l.completionCount) || 0);
          safeL.totalAttempts = Math.max(0, Number(l.totalAttempts) || 0);
          safeL.bestAccuracy = Math.min(100, Math.max(0, Number(l.bestAccuracy) || 0));
          safeL.bestWpm = Math.min(220, Math.max(0, Number(l.bestWpm) || 0));
          safeL.totalTypingUnits = Math.max(0, Number(l.totalTypingUnits) || 0);
          safeL.totalMistakes = Math.max(0, Number(l.totalMistakes) || 0);
          safeL.totalCorrections = Math.max(0, Number(l.totalCorrections) || 0);
          safeL.activeTypingTimeMs = Math.max(0, Number(l.activeTypingTimeMs) || 0);
          safeL.masteryState = ['unstarted','practicing','proficient','mastered'].includes(l.masteryState) ? l.masteryState : 'unstarted';

          if(l.mostRecentAttempt && typeof l.mostRecentAttempt === 'object'){
            safeL.mostRecentAttempt = {
              timestamp: Number(l.mostRecentAttempt.timestamp) || Date.now(),
              accuracy: Math.min(100, Math.max(0, Number(l.mostRecentAttempt.accuracy) || 0)),
              wpm: Math.min(220, Math.max(0, Number(l.mostRecentAttempt.wpm) || 0)),
              timeSec: Math.max(0, Number(l.mostRecentAttempt.timeSec) || 0),
              mistakes: Math.max(0, Number(l.mostRecentAttempt.mistakes) || 0),
              corrections: Math.max(0, Number(l.mostRecentAttempt.corrections) || 0),
              passed: !!l.mostRecentAttempt.passed
            };
          }
          if(l.bestAttempt && typeof l.bestAttempt === 'object'){
            safeL.bestAttempt = {
              timestamp: Number(l.bestAttempt.timestamp) || Date.now(),
              accuracy: Math.min(100, Math.max(0, Number(l.bestAttempt.accuracy) || 0)),
              wpm: Math.min(220, Math.max(0, Number(l.bestAttempt.wpm) || 0)),
              timeSec: Math.max(0, Number(l.bestAttempt.timeSec) || 0),
              mistakes: Math.max(0, Number(l.bestAttempt.mistakes) || 0)
            };
          }
          if(Array.isArray(l.recentAttempts)){
            safeL.recentAttempts = l.recentAttempts.slice(-MAX_RECENT_ATTEMPTS);
          }
          if(l.exercises && typeof l.exercises === 'object'){
            Object.keys(l.exercises).forEach(exId => {
              const ex = l.exercises[exId];
              if(!ex || typeof ex !== 'object') return;
              safeL.exercises[exId] = {
                id: String(exId),
                type: String(ex.type || 'drill'),
                attempts: Math.max(0, Number(ex.attempts) || 0),
                completions: Math.max(0, Number(ex.completions) || 0),
                bestAccuracy: Math.min(100, Math.max(0, Number(ex.bestAccuracy) || 0)),
                bestWpm: Math.min(220, Math.max(0, Number(ex.bestWpm) || 0)),
                mistakes: Math.max(0, Number(ex.mistakes) || 0),
                activeTimeMs: Math.max(0, Number(ex.activeTimeMs) || 0),
                lastAttempt: ex.lastAttempt || null
              };
            });
          }
          target.lessons[lid] = safeL;
        });
      }

      // Validate levels
      if(srcCourse.levels && typeof srcCourse.levels === 'object'){
        Object.keys(srcCourse.levels).forEach(lvlId => {
          const lvl = srcCourse.levels[lvlId];
          if(!lvl || typeof lvl !== 'object') return;
          target.levels[lvlId] = {
            id: String(lvlId),
            started: !!lvl.started,
            completed: !!lvl.completed,
            mastered: !!lvl.mastered,
            lessonsCompleted: Math.max(0, Number(lvl.lessonsCompleted) || 0),
            lessonsTotal: Math.max(0, Number(lvl.lessonsTotal) || 0),
            completionPercentage: Math.min(100, Math.max(0, Number(lvl.completionPercentage) || 0)),
            averageAccuracy: Math.min(100, Math.max(0, Number(lvl.averageAccuracy) || 0)),
            averageWpm: Math.min(220, Math.max(0, Number(lvl.averageWpm) || 0)),
            totalPracticeTimeMs: Math.max(0, Number(lvl.totalPracticeTimeMs) || 0),
            lastPracticed: lvl.lastPracticed || null,
            masteryStatus: ['locked','unlocked','in-progress','completed','mastered'].includes(lvl.masteryStatus) ? lvl.masteryStatus : 'locked'
          };
        });
      }

      // Validate keys
      if(srcCourse.keys && typeof srcCourse.keys === 'object'){
        Object.keys(srcCourse.keys).forEach(kId => {
          const k = srcCourse.keys[kId];
          if(!k || typeof k !== 'object') return;
          const attempts = Math.max(0, Number(k.attempts) || 0);
          const correct = Math.max(0, Number(k.correct) || 0);
          const incorrect = Math.max(0, Number(k.incorrect) || 0);
          const acc = attempts > 0 ? Math.min(100, Math.max(0, Math.round((correct / attempts) * 100))) : 100;
          target.keys[kId] = {
            keyId: String(kId),
            attempts,
            correct,
            incorrect,
            accuracy: acc,
            avgResponseTimeMs: Math.max(0, Number(k.avgResponseTimeMs) || 0),
            totalResponseTimeMs: Math.max(0, Number(k.totalResponseTimeMs) || 0),
            recentMistakes: Array.isArray(k.recentMistakes) ? k.recentMistakes.slice(-MAX_RECENT_MISTAKES) : [],
            lastPracticed: k.lastPracticed || null,
            masteryState: ['learning','stable','mastered'].includes(k.masteryState) ? k.masteryState : 'learning'
          };
        });
      }

      // Validate characters
      if(srcCourse.characters && typeof srcCourse.characters === 'object'){
        Object.keys(srcCourse.characters).forEach(cId => {
          const c = srcCourse.characters[cId];
          if(!c || typeof c !== 'object') return;
          const attempts = Math.max(0, Number(c.attempts) || 0);
          const correct = Math.max(0, Number(c.correct) || 0);
          const incorrect = Math.max(0, Number(c.incorrect) || 0);
          const acc = attempts > 0 ? Math.min(100, Math.max(0, Math.round((correct / attempts) * 100))) : 100;
          target.characters[cId] = {
            unit: String(cId),
            attempts,
            correct,
            incorrect,
            accuracy: acc,
            avgResponseTimeMs: Math.max(0, Number(c.avgResponseTimeMs) || 0),
            totalResponseTimeMs: Math.max(0, Number(c.totalResponseTimeMs) || 0),
            recentPerformance: Array.isArray(c.recentPerformance) ? c.recentPerformance.slice(-MAX_RECENT_PERFORMANCE) : [],
            lastPracticed: c.lastPracticed || null,
            confidence: Math.min(100, Math.max(0, Number(c.confidence) || 0)),
            masteryState: ['learning','stable','mastered'].includes(c.masteryState) ? c.masteryState : 'learning'
          };
        });
      }
    });

    // Validate fingers
    if(data.fingers && typeof data.fingers === 'object'){
      VALID_FINGERS.forEach(f => {
        const src = data.fingers[f];
        if(!src || typeof src !== 'object') return;
        const attempts = Math.max(0, Number(src.attempts) || 0);
        const correct = Math.max(0, Number(src.correct) || 0);
        const incorrect = Math.max(0, Number(src.incorrect) || 0);
        clean.fingers[f] = {
          finger: f,
          attempts,
          correct,
          incorrect,
          accuracy: attempts > 0 ? Math.min(100, Math.max(0, Math.round((correct / attempts) * 100))) : 100,
          avgResponseTimeMs: Math.max(0, Number(src.avgResponseTimeMs) || 0),
          totalResponseTimeMs: Math.max(0, Number(src.totalResponseTimeMs) || 0),
          recentMistakes: Array.isArray(src.recentMistakes) ? src.recentMistakes.slice(-MAX_RECENT_MISTAKES) : []
        };
      });
    }

    // Validate history
    if(data.history && typeof data.history === 'object'){
      if(Array.isArray(data.history.recentSessions)){
        clean.history.recentSessions = data.history.recentSessions.slice(-MAX_HISTORY_SESSIONS);
      }
      if(Array.isArray(data.history.recentCompletions)){
        clean.history.recentCompletions = data.history.recentCompletions.slice(-MAX_HISTORY_COMPLETIONS);
      }
    }

    return clean;
  }

  /* ---------- Persistence (Debounced & Safe) ---------- */
  let saveTimer = null;

  function flush(){
    if(saveTimer){
      clearTimeout(saveTimer);
      saveTimer = null;
    }
    try {
      if(typeof localStorage === 'undefined') return;
      state.updatedAt = Date.now();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch(err){
      // Fail silently without blocking typing
    }
  }

  function scheduleDebouncedSave(){
    if(saveTimer) return;
    saveTimer = setTimeout(()=>{
      saveTimer = null;
      flush();
    }, 2500);
  }

  /* Helper to get all localStorage keys safely in all environments */
  function getAllStorageKeys(){
    const out = [];
    try {
      if(typeof localStorage !== 'undefined'){
        if(typeof localStorage.length === 'number'){
          for(let i = 0; i < localStorage.length; i++){
            const k = localStorage.key(i);
            if(k && !out.includes(k)) out.push(k);
          }
        }
        Object.keys(localStorage).forEach(k => {
          if(!out.includes(k) && typeof localStorage[k] !== 'function') out.push(k);
        });
      }
    } catch(e){}
    return out;
  }

  /* ---------- Migration From Legacy Storage ---------- */
  function migrateLegacyData(){
    if(typeof localStorage === 'undefined') return false;
    let migratedAnything = false;

    // 1. Check legacy lesson completions: khmerLessonBest_<id>
    try {
      const keys = getAllStorageKeys();
      keys.forEach(k => {
        if(k.startsWith('khmerLessonBest_')){
          const rawId = k.replace('khmerLessonBest_', '');
          const rawVal = localStorage.getItem(k);
          if(!rawVal) return;
          try {
            const parsed = JSON.parse(rawVal);
            if(!parsed || typeof parsed !== 'object') return;

            // Determine layout
            let layout = 'standard';
            if(rawId.startsWith('nida-')) layout = 'nida';
            else if(rawId.startsWith('en-')) layout = 'english';
            else if(typeof Number(rawId) === 'number' && !isNaN(Number(rawId))) layout = 'standard';

            const course = state.courses[layout];
            if(course){
              let lesson = course.lessons[rawId];
              if(!lesson){
                lesson = createDefaultLessonRecord(rawId, null);
                course.lessons[rawId] = lesson;
              }
              lesson.started = true;
              lesson.completed = true;
              lesson.completionCount = Math.max(lesson.completionCount, parsed.attempts || 1);
              lesson.totalAttempts = Math.max(lesson.totalAttempts, parsed.attempts || 1);
              lesson.bestAccuracy = Math.max(lesson.bestAccuracy, parsed.accuracy || 0);
              lesson.masteryState = parsed.masteryState || (parsed.mastered ? 'mastered' : (lesson.bestAccuracy >= 75 ? 'proficient' : 'practicing'));
              if(!lesson.bestAttempt && parsed.time){
                lesson.bestAttempt = {
                  timestamp: Date.now() - 3600000,
                  accuracy: parsed.accuracy || 0,
                  wpm: 0,
                  timeSec: parsed.time,
                  mistakes: 0
                };
              }
              migratedAnything = true;
            }
          } catch(e){}
        }
      });
    } catch(e){}

    // 2. Check tracking observer cache: khmerTrackingData_v1
    try {
      const rawTrack = localStorage.getItem('khmerTrackingData_v1');
      if(rawTrack){
        const parsed = JSON.parse(rawTrack);
        if(parsed && typeof parsed === 'object'){
          VALID_LAYOUTS.forEach(l => {
            const course = state.courses[l];
            // Key stats
            if(parsed.keyStats && parsed.keyStats[l]){
              Object.keys(parsed.keyStats[l]).forEach(kId => {
                const ks = parsed.keyStats[l][kId];
                if(!ks) return;
                const rec = course.keys[kId] || createDefaultKeyRecord(kId);
                rec.attempts = Math.max(rec.attempts, ks.attempts || 0);
                rec.correct = Math.max(rec.correct, ks.correct || 0);
                rec.incorrect = Math.max(rec.incorrect, ks.incorrect || 0);
                rec.accuracy = rec.attempts > 0 ? Math.round((rec.correct / rec.attempts) * 100) : 100;
                rec.avgResponseTimeMs = ks.avgResponseTimeMs || 0;
                rec.totalResponseTimeMs = ks.totalResponseTimeMs || 0;
                rec.lastPracticed = ks.lastUsedTime || null;
                course.keys[kId] = rec;
                evaluateKeyMastery(rec);
                migratedAnything = true;
              });
            }
            // Char stats
            if(parsed.charStats && parsed.charStats[l]){
              Object.keys(parsed.charStats[l]).forEach(ch => {
                const cs = parsed.charStats[l][ch];
                if(!cs) return;
                const rec = course.characters[ch] || createDefaultCharRecord(ch);
                rec.attempts = Math.max(rec.attempts, cs.attempts || 0);
                rec.correct = Math.max(rec.correct, cs.correct || 0);
                rec.incorrect = Math.max(rec.incorrect, cs.incorrect || 0);
                rec.accuracy = rec.attempts > 0 ? Math.round((rec.correct / rec.attempts) * 100) : 100;
                rec.avgResponseTimeMs = cs.avgResponseTimeMs || 0;
                rec.totalResponseTimeMs = cs.totalResponseTimeMs || 0;
                rec.lastPracticed = cs.lastPracticed || null;
                course.characters[ch] = rec;
                evaluateCharMastery(rec);
                migratedAnything = true;
              });
            }
          });
          // Finger stats
          if(parsed.fingerStats){
            VALID_FINGERS.forEach(f => {
              const fs = parsed.fingerStats[f];
              if(!fs) return;
              const rec = state.fingers[f] || createDefaultFingerRecord(f);
              rec.attempts = Math.max(rec.attempts, fs.attempts || 0);
              rec.correct = Math.max(rec.correct, fs.correct || 0);
              rec.incorrect = Math.max(rec.incorrect, fs.mistakes || 0);
              rec.accuracy = rec.attempts > 0 ? Math.round((rec.correct / rec.attempts) * 100) : 100;
              rec.avgResponseTimeMs = fs.avgResponseTimeMs || 0;
              rec.totalResponseTimeMs = fs.totalResponseTimeMs || 0;
              state.fingers[f] = rec;
              migratedAnything = true;
            });
          }
        }
      }
    } catch(e){}

    if(migratedAnything){
      flush();
    }
    return migratedAnything;
  }

  /* Load from localStorage on initialization */
  function loadFromStorage(){
    try {
      if(typeof localStorage === 'undefined') return;
      const raw = localStorage.getItem(STORAGE_KEY);
      if(raw){
        const parsed = JSON.parse(raw);
        const cleaned = validateAndRepair(parsed);
        if(cleaned){
          state.version = cleaned.version;
          state.updatedAt = cleaned.updatedAt;
          state.courses = cleaned.courses;
          state.fingers = cleaned.fingers;
          state.history = cleaned.history;
        }
      }
      // Always merge any legacy data that hasn't been merged yet
      migrateLegacyData();
    } catch(err){
      // Fall back to clean state
    }
  }

  loadFromStorage();

  // Save on window beforeunload or visibility change
  if(typeof window !== 'undefined'){
    window.addEventListener('beforeunload', flush);
    if(typeof document !== 'undefined'){
      document.addEventListener('visibilitychange', ()=>{
        if(document.visibilityState === 'hidden') flush();
      });
    }
  }

  /* ============================================================
     MASTERY ASSESSMENT RULES (Simple, Measurable, Explainable)
     ============================================================ */

  function evaluateKeyMastery(rec){
    if(!rec) return 'learning';
    // Mastery: >= 12 attempts, >= 90% accuracy, average response time reasonable <= 1200ms
    if(rec.attempts >= 12 && rec.accuracy >= 90 && (rec.avgResponseTimeMs === 0 || rec.avgResponseTimeMs <= 1200)){
      rec.masteryState = 'mastered';
    } else if(rec.attempts >= 5 && rec.accuracy >= 80){
      rec.masteryState = 'stable';
    } else {
      rec.masteryState = 'learning';
    }
    return rec.masteryState;
  }

  function evaluateCharMastery(rec){
    if(!rec) return 'learning';
    const recent = rec.recentPerformance || [];
    const recentCorrect = recent.filter(Boolean).length;
    const recentAcc = recent.length > 0 ? (recentCorrect / recent.length) * 100 : rec.accuracy;

    // Confidence index 0 - 100
    const volumeScore = Math.min(50, (rec.attempts / 15) * 50);
    const accScore = (rec.accuracy / 100) * 50;
    rec.confidence = Math.round(volumeScore + accScore);

    if(rec.attempts >= 10 && rec.accuracy >= 90 && (recent.length === 0 || recentAcc >= 80) && (rec.avgResponseTimeMs === 0 || rec.avgResponseTimeMs <= 1200)){
      rec.masteryState = 'mastered';
    } else if(rec.attempts >= 5 && rec.accuracy >= 80){
      rec.masteryState = 'stable';
    } else {
      rec.masteryState = 'learning';
    }
    return rec.masteryState;
  }

  function evaluateLessonMastery(rec, targetAccuracy){
    if(!rec) return 'unstarted';
    const target = targetAccuracy || 90;
    if(rec.totalAttempts >= 1 && rec.bestAccuracy >= target && rec.mostRecentAttempt && rec.mostRecentAttempt.accuracy >= (target - 5)){
      rec.masteryState = 'mastered';
    } else if(rec.completed && rec.bestAccuracy >= 75){
      rec.masteryState = 'proficient';
    } else if(rec.started || rec.totalAttempts > 0){
      rec.masteryState = 'practicing';
    } else {
      rec.masteryState = 'unstarted';
    }
    return rec.masteryState;
  }

  function evaluateLevelMastery(levelRecord, totalLessonsInLevel, minAccuracy){
    if(!levelRecord) return 'locked';
    const total = totalLessonsInLevel || levelRecord.lessonsTotal || 1;
    const done = levelRecord.lessonsCompleted || 0;
    const targetAcc = minAccuracy || 90;

    levelRecord.completionPercentage = Math.min(100, Math.round((done / total) * 100));

    if(done >= total && total > 0){
      levelRecord.completed = true;
      if(levelRecord.averageAccuracy >= targetAcc){
        levelRecord.mastered = true;
        levelRecord.masteryStatus = 'mastered';
      } else {
        levelRecord.mastered = false;
        levelRecord.masteryStatus = 'completed';
      }
    } else if(done > 0 || levelRecord.started){
      levelRecord.completed = false;
      levelRecord.mastered = false;
      levelRecord.masteryStatus = 'in-progress';
    } else {
      levelRecord.completed = false;
      levelRecord.mastered = false;
      levelRecord.masteryStatus = 'unlocked';
    }
    return levelRecord.masteryStatus;
  }

  /* ============================================================
     PROGRESS RECORDING APIS
     ============================================================ */

  /**
   * Records a single typed unit (stroke/character).
   */
  function recordTypingUnit(data){
    if(!data) return;
    const layout = normalizeLayout(data.layout || (typeof global.currentLayoutId !== 'undefined' ? global.currentLayoutId : 'nida'));
    const isCorrect = !!data.correct;
    const expected = data.expected || '';
    const keyId = data.expectedKeyId || data.strokeKeyId || data.keyId || 'unknown';
    const finger = data.finger || 'unknown';
    const responseTimeMs = Math.max(0, Math.min(3000, Number(data.responseTimeMs) || 300));
    const now = Date.now();

    const course = state.courses[layout];
    if(!course) return;

    // 1. Course aggregate updates
    course.totalTypingUnits++;
    if(!isCorrect) course.totalMistakes++;
    const tot = course.totalTypingUnits;
    const corr = tot - course.totalMistakes;
    course.overallAccuracy = tot > 0 ? Math.round((corr / tot) * 100) : 100;

    // 2. Per-Key Tracking
    if(keyId && keyId !== 'unknown'){
      if(!course.keys[keyId]){
        course.keys[keyId] = createDefaultKeyRecord(keyId);
      }
      const kr = course.keys[keyId];
      kr.attempts++;
      if(isCorrect) kr.correct++;
      else {
        kr.incorrect++;
        kr.recentMistakes.push({ produced: data.produced || '', time: now });
        if(kr.recentMistakes.length > MAX_RECENT_MISTAKES) kr.recentMistakes.shift();
      }
      kr.accuracy = Math.round((kr.correct / kr.attempts) * 100);
      kr.totalResponseTimeMs += responseTimeMs;
      kr.avgResponseTimeMs = Math.round(kr.totalResponseTimeMs / kr.attempts);
      kr.lastPracticed = now;
      evaluateKeyMastery(kr);
    }

    // 3. Per-Character / Logical Typing Unit Tracking
    if(expected){
      if(!course.characters[expected]){
        course.characters[expected] = createDefaultCharRecord(expected);
      }
      const cr = course.characters[expected];
      cr.attempts++;
      if(isCorrect) cr.correct++;
      else cr.incorrect++;
      cr.recentPerformance.push(isCorrect);
      if(cr.recentPerformance.length > MAX_RECENT_PERFORMANCE) cr.recentPerformance.shift();
      cr.accuracy = Math.round((cr.correct / cr.attempts) * 100);
      cr.totalResponseTimeMs += responseTimeMs;
      cr.avgResponseTimeMs = Math.round(cr.totalResponseTimeMs / cr.attempts);
      cr.lastPracticed = now;
      evaluateCharMastery(cr);
    }

    // 4. Per-Finger Tracking
    const fg = VALID_FINGERS.includes(finger) ? finger : 'unknown';
    const fr = state.fingers[fg];
    if(fr){
      fr.attempts++;
      if(isCorrect) fr.correct++;
      else fr.incorrect++;
      fr.accuracy = Math.round((fr.correct / fr.attempts) * 100);
      fr.totalResponseTimeMs += responseTimeMs;
      fr.avgResponseTimeMs = Math.round(fr.totalResponseTimeMs / fr.attempts);
    }

    scheduleDebouncedSave();
  }

  /**
   * Records a lesson completion attempt.
   */
  function recordLessonAttempt(attempt){
    if(!attempt || !attempt.lessonId) return null;
    const now = Date.now();
    const layout = normalizeLayout(attempt.layoutId || attempt.layout || (typeof global.currentLayoutId !== 'undefined' ? global.currentLayoutId : 'nida'));
    const lessonId = String(attempt.lessonId);
    const levelId = attempt.levelId ? String(attempt.levelId) : '';
    const accuracy = Math.min(100, Math.max(0, Number(attempt.accuracy) || 0));
    const wpm = Math.min(220, Math.max(0, Number(attempt.wpm) || 0));
    const timeSec = Math.max(0, Number(attempt.timeSec || attempt.time) || 0);
    const mistakes = Math.max(0, Number(attempt.mistakes) || 0);
    const corrections = Math.max(0, Number(attempt.corrections) || 0);
    const units = Math.max(0, Number(attempt.units) || 0);
    const threshold = Number(attempt.threshold) || 85;
    const passed = accuracy >= threshold;

    const course = state.courses[layout];
    if(!course) return null;

    let lesson = course.lessons[lessonId];
    if(!lesson){
      lesson = createDefaultLessonRecord(lessonId, levelId);
      course.lessons[lessonId] = lesson;
    }

    const prevBestAcc = lesson.bestAccuracy;
    const prevBestWpm = lesson.bestWpm;

    lesson.started = true;
    lesson.totalAttempts++;
    if(passed) lesson.completed = true;
    if(passed) lesson.completionCount++;
    lesson.totalTypingUnits += units;
    lesson.totalMistakes += mistakes;
    lesson.totalCorrections += corrections;
    lesson.activeTypingTimeMs += Math.round(timeSec * 1000);
    lesson.bestAccuracy = Math.max(lesson.bestAccuracy, accuracy);
    lesson.bestWpm = Math.max(lesson.bestWpm, wpm);

    const attemptRecord = {
      timestamp: now,
      accuracy,
      wpm,
      timeSec,
      mistakes,
      corrections,
      passed
    };

    lesson.mostRecentAttempt = attemptRecord;

    // Track best attempt record
    if(!lesson.bestAttempt || accuracy > lesson.bestAttempt.accuracy || (accuracy === lesson.bestAttempt.accuracy && timeSec < lesson.bestAttempt.timeSec)){
      lesson.bestAttempt = {
        timestamp: now,
        accuracy,
        wpm,
        timeSec,
        mistakes
      };
    }

    lesson.recentAttempts.push(attemptRecord);
    if(lesson.recentAttempts.length > MAX_RECENT_ATTEMPTS){
      lesson.recentAttempts.shift();
    }

    evaluateLessonMastery(lesson, threshold);

    // Record exercises if provided
    if(Array.isArray(attempt.sections)){
      attempt.sections.forEach(s => {
        if(!s || !s.id) return;
        const exId = String(s.id);
        if(!lesson.exercises[exId]){
          lesson.exercises[exId] = {
            id: exId,
            type: s.type || 'drill',
            attempts: 0,
            completions: 0,
            bestAccuracy: 0,
            bestWpm: 0,
            mistakes: 0,
            activeTimeMs: 0,
            lastAttempt: null
          };
        }
        const ex = lesson.exercises[exId];
        ex.attempts++;
        if(passed) ex.completions++;
        ex.bestAccuracy = Math.max(ex.bestAccuracy, accuracy);
        ex.bestWpm = Math.max(ex.bestWpm, wpm);
        ex.mistakes += s.mistakes || 0;
        ex.lastAttempt = now;
      });
    }

    // Update Level aggregate progress
    if(levelId){
      updateLevelProgress(layout, levelId);
    }

    // Append to global history
    state.history.recentCompletions.push({
      layout,
      lessonId,
      levelId,
      accuracy,
      wpm,
      timeSec,
      passed,
      timestamp: now
    });
    if(state.history.recentCompletions.length > MAX_HISTORY_COMPLETIONS){
      state.history.recentCompletions.shift();
    }

    // Backward-compatibility mirror for legacy getLessonBest(id)
    try {
      if(typeof localStorage !== 'undefined'){
        const legacyKey = 'khmerLessonBest_' + lessonId;
        const legacyPayload = {
          accuracy: lesson.bestAccuracy,
          time: lesson.bestAttempt ? lesson.bestAttempt.timeSec : timeSec,
          attempts: lesson.totalAttempts,
          mastered: lesson.masteryState === 'mastered'
        };
        localStorage.setItem(legacyKey, JSON.stringify(legacyPayload));
      }
    } catch(e){}

    flush(); // Immediate persistence on lesson attempt

    return {
      lesson,
      isNewBestAccuracy: accuracy > prevBestAcc,
      isNewBestWpm: wpm > prevBestWpm,
      diffAccuracy: accuracy - prevBestAcc
    };
  }

  /**
   * Recalculates level progress metrics based on lesson states.
   */
  function updateLevelProgress(layoutId, levelId){
    const course = state.courses[layoutId];
    if(!course) return null;

    let levelRec = course.levels[levelId];
    if(!levelRec){
      levelRec = createDefaultLevelRecord(levelId);
      course.levels[levelId] = levelRec;
    }

    // Find all lessons belonging to this level
    let totalLessons = 0;
    let completedLessons = 0;
    let sumAccuracy = 0;
    let sumWpm = 0;
    let measuredLessons = 0;

    // Check CURRICULUM_DATA for static definitions if available
    const cData = (typeof window !== 'undefined' && window.CURRICULUM_DATA) || (typeof global !== 'undefined' && global.CURRICULUM_DATA);
    let levelDef = null;
    let minAcc = 90;

    if(cData && cData[layoutId] && Array.isArray(cData[layoutId].levels)){
      levelDef = cData[layoutId].levels.find(l => String(l.id) === String(levelId));
      if(levelDef && Array.isArray(levelDef.lessons)){
        totalLessons = levelDef.lessons.length;
        if(levelDef.completionRequirements && typeof levelDef.completionRequirements.minLevelAccuracy === 'number'){
          minAcc = levelDef.completionRequirements.minLevelAccuracy;
        }
      }
    }

    // Inspect lessons in course
    Object.keys(course.lessons).forEach(lid => {
      const l = course.lessons[lid];
      if(String(l.levelId) === String(levelId) || (levelDef && levelDef.lessons && levelDef.lessons.includes(lid))){
        if(!totalLessons) totalLessons++;
        if(l.completed){
          completedLessons++;
          sumAccuracy += l.bestAccuracy;
          if(l.bestWpm > 0) sumWpm += l.bestWpm;
          measuredLessons++;
        }
      }
    });

    levelRec.started = completedLessons > 0 || Object.keys(course.lessons).some(lid => course.lessons[lid].levelId === levelId && course.lessons[lid].started);
    levelRec.lessonsCompleted = completedLessons;
    levelRec.lessonsTotal = Math.max(totalLessons, completedLessons);
    levelRec.averageAccuracy = measuredLessons > 0 ? Math.round(sumAccuracy / measuredLessons) : 0;
    levelRec.averageWpm = measuredLessons > 0 ? Math.round(sumWpm / measuredLessons) : 0;
    levelRec.lastPracticed = Date.now();

    evaluateLevelMastery(levelRec, levelRec.lessonsTotal, minAcc);
    return levelRec;
  }

  /* ============================================================
     HISTORICAL COMPARISON & LEARNER FEEDBACK
     ============================================================ */

  /**
   * Compares the current attempt against historical attempts on this lesson.
   */
  function compareWithHistory(layoutId, lessonId, currentAttempt){
    const layout = normalizeLayout(layoutId);
    const course = state.courses[layout];
    if(!course) return null;

    const lesson = course.lessons[String(lessonId)];
    if(!lesson || !lesson.recentAttempts || lesson.recentAttempts.length <= 1){
      return {
        hasHistory: false,
        totalAttempts: lesson ? lesson.totalAttempts : 1,
        bestAccuracy: currentAttempt ? currentAttempt.accuracy : 100,
        trend: 'baseline',
        message: 'First attempt recorded — solid starting baseline!'
      };
    }

    const recents = lesson.recentAttempts;
    const prevAttempts = recents.slice(0, recents.length - 1);
    const prevLast = prevAttempts[prevAttempts.length - 1];
    const prevBestAcc = Math.max(...prevAttempts.map(a => a.accuracy));

    const curAcc = currentAttempt ? currentAttempt.accuracy : (lesson.mostRecentAttempt ? lesson.mostRecentAttempt.accuracy : 0);
    const diff = curAcc - prevLast.accuracy;

    let trend = 'stable';
    let message = `Consistent performance at ${curAcc}%.`;

    if(diff >= 3){
      trend = 'improving';
      message = `Accuracy improved by +${diff}% from your previous attempt (${prevLast.accuracy}% → ${curAcc}%)!`;
    } else if(diff <= -3){
      trend = 'declining';
      message = `Accuracy dipped by ${Math.abs(diff)}% (${prevLast.accuracy}% → ${curAcc}%). A quick focused drill will bring it back up.`;
    } else {
      trend = 'stable';
      message = `Steady accuracy at ${curAcc}% (previous: ${prevLast.accuracy}%).`;
    }

    return {
      hasHistory: true,
      totalAttempts: lesson.totalAttempts,
      previousAccuracy: prevLast.accuracy,
      previousBestAccuracy: prevBestAcc,
      currentAccuracy: curAcc,
      diffAccuracy: diff,
      trend,
      message,
      masteryState: lesson.masteryState
    };
  }

  /**
   * Returns a digestible, learner-focused progress summary.
   * Answers: "What have I learned?", "What am I improving?", "What still needs practice?"
   */
  function getLearnerSummary(layoutId){
    const layout = normalizeLayout(layoutId);
    const course = state.courses[layout];
    if(!course) return null;

    const allKeys = Object.values(course.keys);
    const allChars = Object.values(course.characters);
    const allLessons = Object.values(course.lessons);

    const masteredKeys = allKeys.filter(k => k.masteryState === 'mastered').map(k => k.keyId);
    const stableKeys = allKeys.filter(k => k.masteryState === 'stable').map(k => k.keyId);
    const learningKeys = allKeys.filter(k => k.masteryState === 'learning').map(k => k.keyId);

    // Strongest keys (highest accuracy, >= 5 attempts)
    const strongestKeys = allKeys
      .filter(k => k.attempts >= 5)
      .sort((a,b) => b.accuracy - a.accuracy || b.attempts - a.attempts)
      .slice(0, 5);

    // Needing practice keys (accuracy < 85% or recent mistakes, attempts >= 3)
    const needsPracticeKeys = allKeys
      .filter(k => (k.accuracy < 85 || (k.recentMistakes && k.recentMistakes.length > 0)) && k.attempts >= 3)
      .sort((a,b) => a.accuracy - b.accuracy)
      .slice(0, 5);

    // Strongest chars
    const strongestChars = allChars
      .filter(c => c.attempts >= 5)
      .sort((a,b) => b.accuracy - a.accuracy || b.confidence - a.confidence)
      .slice(0, 5);

    // Needing practice chars
    const needsPracticeChars = allChars
      .filter(c => (c.accuracy < 85 || c.confidence < 60) && c.attempts >= 3)
      .sort((a,b) => a.accuracy - b.accuracy)
      .slice(0, 5);

    // Mastered lessons
    const completedLessons = allLessons.filter(l => l.completed).length;
    const masteredLessons = allLessons.filter(l => l.masteryState === 'mastered').length;

    // Total practice time in minutes
    const practiceMinutes = Math.round(course.totalPracticeTimeMs / 60000);

    return {
      layout,
      practiceMinutes,
      totalTypingUnits: course.totalTypingUnits,
      overallAccuracy: course.overallAccuracy,
      completedLessons,
      masteredLessons,
      totalLessonsRecorded: allLessons.length,
      masteredKeys,
      stableKeys,
      learningKeys,
      strongestKeys: strongestKeys.map(k => ({ keyId: k.keyId, accuracy: k.accuracy, attempts: k.attempts })),
      needsPracticeKeys: needsPracticeKeys.map(k => ({ keyId: k.keyId, accuracy: k.accuracy, attempts: k.attempts })),
      strongestChars: strongestChars.map(c => ({ unit: c.unit, accuracy: c.accuracy, confidence: c.confidence })),
      needsPracticeChars: needsPracticeChars.map(c => ({ unit: c.unit, accuracy: c.accuracy, confidence: c.confidence }))
    };
  }

  /* ============================================================
     PROGRESS RESET APIS
     ============================================================ */

  function resetLesson(layoutId, lessonId){
    const layout = normalizeLayout(layoutId);
    const course = state.courses[layout];
    if(course && course.lessons[String(lessonId)]){
      const lvlId = course.lessons[String(lessonId)].levelId;
      delete course.lessons[String(lessonId)];
      if(lvlId) updateLevelProgress(layout, lvlId);
      try {
        if(typeof localStorage !== 'undefined'){
          localStorage.removeItem('khmerLessonBest_' + lessonId);
        }
      } catch(e){}
      flush();
      return true;
    }
    return false;
  }

  function resetLevel(layoutId, levelId){
    const layout = normalizeLayout(layoutId);
    const course = state.courses[layout];
    if(course){
      Object.keys(course.lessons).forEach(lid => {
        if(course.lessons[lid].levelId === String(levelId)){
          delete course.lessons[lid];
          try {
            if(typeof localStorage !== 'undefined'){
              localStorage.removeItem('khmerLessonBest_' + lid);
            }
          } catch(e){}
        }
      });
      delete course.levels[String(levelId)];
      flush();
      return true;
    }
    return false;
  }

  function resetCourse(layoutId){
    const layout = normalizeLayout(layoutId);
    state.courses[layout] = createEmptyCourse(layout);
    try {
      if(typeof localStorage !== 'undefined'){
        getAllStorageKeys().forEach(k => {
          if(k.startsWith('khmerLessonBest_')){
            const id = k.replace('khmerLessonBest_', '');
            if(layout === 'nida' && id.startsWith('nida-')) localStorage.removeItem(k);
            else if(layout === 'english' && id.startsWith('en-')) localStorage.removeItem(k);
            else if(layout === 'standard' && !id.startsWith('nida-') && !id.startsWith('en-')) localStorage.removeItem(k);
          }
        });
      }
    } catch(e){}
    flush();
    return true;
  }

  function resetAll(){
    state.courses = {
      standard: createEmptyCourse('standard'),
      nida: createEmptyCourse('nida'),
      english: createEmptyCourse('english')
    };
    VALID_FINGERS.forEach(f => {
      state.fingers[f] = createDefaultFingerRecord(f);
    });
    state.history.recentSessions = [];
    state.history.recentCompletions = [];
    try {
      if(typeof localStorage !== 'undefined'){
        getAllStorageKeys().forEach(k => {
          if(k.startsWith('khmerLessonBest_') || k === STORAGE_KEY || k === 'khmerTrackingData_v1'){
            localStorage.removeItem(k);
          }
        });
      }
    } catch(e){}
    flush();
    return true;
  }

  /* ============================================================
     EXPORTED API
     ============================================================ */

  const api = {
    version: 2,

    // Course inspection
    getCourseProgress(layoutId){
      const l = normalizeLayout(layoutId);
      return state.courses[l] ? JSON.parse(JSON.stringify(state.courses[l])) : null;
    },

    // Level inspection
    getLevelProgress(layoutId, levelId){
      const l = normalizeLayout(layoutId);
      const course = state.courses[l];
      return (course && course.levels[String(levelId)]) ? Object.assign({}, course.levels[String(levelId)]) : null;
    },

    getAllLevelsProgress(layoutId){
      const l = normalizeLayout(layoutId);
      const course = state.courses[l];
      return course ? JSON.parse(JSON.stringify(course.levels)) : {};
    },

    // Lesson inspection
    getLessonProgress(layoutId, lessonId){
      const l = normalizeLayout(layoutId);
      const course = state.courses[l];
      return (course && course.lessons[String(lessonId)]) ? Object.assign({}, course.lessons[String(lessonId)]) : null;
    },

    getAllLessonsProgress(layoutId){
      const l = normalizeLayout(layoutId);
      const course = state.courses[l];
      return course ? JSON.parse(JSON.stringify(course.lessons)) : {};
    },

    // Exercise inspection
    getExerciseProgress(layoutId, lessonId, exerciseId){
      const l = normalizeLayout(layoutId);
      const course = state.courses[l];
      const lesson = course && course.lessons[String(lessonId)];
      return (lesson && lesson.exercises[String(exerciseId)]) ? Object.assign({}, lesson.exercises[String(exerciseId)]) : null;
    },

    // Key inspection
    getKeyProgress(layoutId, keyId){
      const l = normalizeLayout(layoutId);
      const course = state.courses[l];
      return (course && course.keys[String(keyId)]) ? Object.assign({}, course.keys[String(keyId)]) : null;
    },

    getAllKeysProgress(layoutId){
      const l = normalizeLayout(layoutId);
      const course = state.courses[l];
      return course ? JSON.parse(JSON.stringify(course.keys)) : {};
    },

    // Character / Logical Unit inspection
    getCharProgress(layoutId, charUnit){
      const l = normalizeLayout(layoutId);
      const course = state.courses[l];
      return (course && course.characters[String(charUnit)]) ? Object.assign({}, course.characters[String(charUnit)]) : null;
    },

    getAllCharsProgress(layoutId){
      const l = normalizeLayout(layoutId);
      const course = state.courses[l];
      return course ? JSON.parse(JSON.stringify(course.characters)) : {};
    },

    // Finger inspection
    getFingerProgress(fingerId){
      const fr = state.fingers[fingerId];
      return fr ? Object.assign({}, fr) : null;
    },

    getAllFingersProgress(){
      return JSON.parse(JSON.stringify(state.fingers));
    },

    // Recording mutations
    recordTypingUnit,
    recordLessonAttempt,
    updateLevelProgress,

    // Feedback & Trends
    compareWithHistory,
    getLearnerSummary,

    // Resets
    resetLesson,
    resetLevel,
    resetCourse,
    resetAll,

    // Storage Management
    flush,
    reload: loadFromStorage,
    validateAndRepair,

    // Export / Import
    exportData(){
      return JSON.parse(JSON.stringify(state));
    },

    importData(importedData){
      const cleaned = validateAndRepair(importedData);
      if(!cleaned) return false;
      state.version = cleaned.version;
      state.updatedAt = Date.now();
      state.courses = cleaned.courses;
      state.fingers = cleaned.fingers;
      state.history = cleaned.history;
      flush();
      return true;
    }
  };

  global.PK_PROGRESS = api;

})(typeof window !== 'undefined' ? window : global);
