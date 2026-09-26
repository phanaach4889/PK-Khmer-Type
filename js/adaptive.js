/* ============================================================
   PK Khmer Type — Phase 8 Adaptive Typing Practice
   ============================================================
   An intelligent, additive personal typing trainer that:
   - Observes learner keystrokes in real time
   - Tracks unit-level performance across multiple signals
     (accuracy, response time, error frequency, recent trends)
   - Evaluates performance states with evidence guardrails
     (locked, active, strong, needs-practice, weak, improving, focus)
   - Dynamically generates natural words using ONLY unlocked letters
   - Weights weak and newly unlocked letters higher while keeping
     strong letters present in rotation
   - Gradually unlocks new letters upon sustained mastery
   - Measures before vs after improvement
   - Completely isolates English US, Khmer NiDA, and Standard Khmer
   - 100% offline, privacy-first, zero telemetry
   ============================================================ */

(function(global){
  'use strict';

  const STORAGE_KEY = 'pk_adaptive_state_v1';
  const VALID_LAYOUTS = ['english', 'nida', 'standard'];

  // Letter / logical typing unit progressions
  const PROGRESSIONS = {
    // English US progression specified by user:
    // E N I A R L T O S U D Y C G H P M K B W F Z V X Q J
    english: [
      'e', 'n', 'i', 'a', 'r', 'l',
      't', 'o', 's', 'u', 'd', 'y',
      'c', 'g', 'h', 'p', 'm', 'k',
      'b', 'w', 'f', 'z', 'v', 'x',
      'q', 'j'
    ],
    // Khmer NiDA progressive logical typing units:
    // Home row anchors -> vowels -> consonants -> coengs -> compound units
    nida: [
      'ថ', 'ក', 'ដ', 'ង', 'ហ', 'ស', 'ល', 'ញ', 'ា', 'ើ',
      'េ', 'រ', 'ត', 'យ', 'ុ', 'ិ', 'ោ', 'ច', 'វ', 'ប',
      'ន', 'ម', '់', '។', 'ខ', 'ឆ', 'ផ', 'ឋ', 'ៀ', 'ឹ',
      'ុំ', '្', 'គ', 'ជ', 'ទ', 'ធ', 'ភ', 'ឌ', 'ណ', 'អ',
      'ី', 'ូ', 'ែ', 'ៃ', 'ួ', 'ៅ', 'ាំ', 'ំ', 'ះ', 'ៗ',
      '៉', '៊', '៍', '៏', '័', '៌', '៛'
    ],
    // Standard Khmer layout progression
    standard: [
      'ថ', 'ក', 'ដ', 'ង', 'ហ', 'ស', 'ល', 'ញ', 'ា', 'ើ',
      'េ', 'រ', 'ត', 'យ', 'ុ', 'ិ', 'ោ', 'ច', 'វ', 'ប',
      'ន', 'ម', '់', '។', 'ខ', 'ឆ', 'ផ', 'ឋ', 'ៀ', 'ឹ',
      'ុំ', '្', 'គ', 'ជ', 'ទ', 'ធ', 'ភ', 'ឌ', 'ណ', 'អ',
      'ី', 'ូ', 'ែ', 'ៃ', 'ួ', 'ៅ', 'ាំ', 'ំ', 'ះ', 'ៗ',
      '៉', '៊', '៍', '៏', '័', '៌', '៛'
    ]
  };

  // Initial active sets (Stage 1)
  const INITIAL_ACTIVE_SETS = {
    english: ['e', 'n', 'i', 'a', 'r', 'l'],
    nida: ['ថ', 'ក', 'ដ', 'ង', 'ហ', 'ស', 'ល', 'ញ', 'ា', 'ើ'],
    standard: ['ថ', 'ក', 'ដ', 'ង', 'ហ', 'ស', 'ល', 'ញ', 'ា', 'ើ']
  };

  // Performance evaluation thresholds
  const CONFIG = {
    targetCompletionUnitsPerLetter: 20, // 20 correct typing units required for 100% completion per letter (Hard Rule 13)
    minEvidenceAttempts: 4,      // Must have >= 4 attempts before classifying as weak/needs-practice
    minUnlockAttemptsPerUnit: 20,// All active units must reach 20 units (100% completion) to unlock next
    minStageSessions: 2,         // Must complete at least 2 sessions in stage before next unlocks
    strongAccuracyThreshold: 92, // >= 92% accuracy -> Strong (GREEN)
    needsPracticeThreshold: 80,  // 80% to 91% -> Needs Practice (YELLOW)
    weakAccuracyThreshold: 80,   // < 80% -> Weak (RED)
    slowResponseRatio: 1.5,      // > 1.5x average response time -> Needs Practice
    unlockMinAvgAccuracy: 90,    // Unlocked active units must average >= 90%
    maxRecentAttempts: 10,       // Sliding window for recent accuracy & trend
    defaultDrillWords: 16,       // Standard adaptive drill length in words
    weightWeak: 4.0,             // Weak letters appear 4x more frequently
    weightNew: 3.5,              // Newly unlocked letter appears 3.5x more frequently
    weightNeedsPractice: 2.2,    // Needs practice appears 2.2x more frequently
    weightStrong: 1.0            // Strong letters stay present at base rate
  };

  /* ---------- Deterministic PRNG (Mulberry32) ---------- */
  function mulberry32(a) {
    return function() {
      let t = a += 0x6D2B79F5;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ---------- Normalize Layout ID ---------- */
  function normalizeLayout(id) {
    if (!id) return 'english';
    const clean = String(id).toLowerCase().trim();
    if (clean === 'en' || clean === 'us' || clean === 'english') return 'english';
    if (clean === 'nida' || clean === 'khmer-nida') return 'nida';
    return 'standard';
  }

  /* ---------- State Persistence ---------- */
  function getFreshState(layoutId) {
    const l = normalizeLayout(layoutId);
    const initial = (INITIAL_ACTIVE_SETS[l] || INITIAL_ACTIVE_SETS.english).slice();
    return {
      version: '1.0.0',
      layoutId: l,
      stage: 1,
      stageSessions: 0,
      unlockedUnits: initial,
      focusUnit: null,
      newlyUnlockedUnit: null,
      sessionsCompleted: 0,
      totalUnitsTyped: 0,
      unitStats: {},
      sessionHistory: []
    };
  }

  function loadAllAdaptiveStates() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch (e) {
      console.warn('PK_ADAPTIVE: load state error', e);
    }
    return {
      english: getFreshState('english'),
      nida: getFreshState('nida'),
      standard: getFreshState('standard')
    };
  }

  function saveAllAdaptiveStates(states) {
    if (typeof window !== 'undefined' && window.__isResettingProgress) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(states));
    } catch (e) {
      console.warn('PK_ADAPTIVE: save state error', e);
    }
  }

  function sanitizeAdaptiveState(layoutId, state) {
    if (!state || !Array.isArray(state.unlockedUnits)) return;
    const l = normalizeLayout(layoutId);
    const initial = (INITIAL_ACTIVE_SETS[l] || INITIAL_ACTIVE_SETS.english).slice();
    const progression = PROGRESSIONS[l] || PROGRESSIONS.english;

    // Retain initial active set
    const validUnlocked = [];
    for (const u of state.unlockedUnits) {
      if (initial.includes(u) && !validUnlocked.includes(u)) {
        validUnlocked.push(u);
      }
    }
    for (const u of initial) {
      if (!validUnlocked.includes(u)) validUnlocked.push(u);
    }

    // Sequentially verify each subsequent letter beyond initial set:
    // It can ONLY remain unlocked if ALL preceding letters in validUnlocked have reached 100% completion!
    for (let i = initial.length; i < progression.length; i++) {
      const candidate = progression[i];
      if (!state.unlockedUnits.includes(candidate)) {
        break; // Stop at first locked letter in sequential progression
      }
      let allPreceding100 = true;
      for (const req of validUnlocked) {
        const reqState = getUnitState(l, req, state);
        const reqTarget = reqState.targetUnits || CONFIG.targetCompletionUnitsPerLetter || 20;
        const isReqComplete = (reqState.completedUnits >= reqTarget) && (reqState.completion === 100);
        if (!isReqComplete) {
          allPreceding100 = false;
          break;
        }
      }
      if (allPreceding100) {
        validUnlocked.push(candidate);
      } else {
        // Preceding letter is incomplete (< 100%); relock candidate and all subsequent
        break;
      }
    }

    state.unlockedUnits = validUnlocked;
    state.stage = Math.max(1, validUnlocked.length - initial.length + 1);
    if (state.newlyUnlockedUnit && !validUnlocked.includes(state.newlyUnlockedUnit)) {
      state.newlyUnlockedUnit = null;
    }
    if (state.focusUnit && !validUnlocked.includes(state.focusUnit)) {
      state.focusUnit = null;
    }
  }

  function loadAdaptiveState(layoutId) {
    const l = normalizeLayout(layoutId);
    const all = loadAllAdaptiveStates();
    if (!all[l] || !all[l].unlockedUnits) {
      all[l] = getFreshState(l);
      saveAllAdaptiveStates(all);
    } else {
      const prevCount = all[l].unlockedUnits.length;
      sanitizeAdaptiveState(l, all[l]);
      if (all[l].unlockedUnits.length !== prevCount) {
        saveAllAdaptiveStates(all);
      }
    }
    return all[l];
  }

  function saveAdaptiveState(layoutId, state) {
    const l = normalizeLayout(layoutId);
    const all = loadAllAdaptiveStates();
    all[l] = state;
    saveAllAdaptiveStates(all);
  }

  function resetAdaptiveState(layoutId) {
    if (!layoutId) {
      saveAllAdaptiveStates({});
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch (e) {}
      return {};
    }
    const l = normalizeLayout(layoutId);
    const all = loadAllAdaptiveStates();
    all[l] = getFreshState(l);
    saveAllAdaptiveStates(all);
    return all[l];
  }

  /* ---------- Vocabulary Access ---------- */
  function getVocabList(layoutId) {
    const l = normalizeLayout(layoutId);
    if (l === 'english') {
      if (typeof global.ENGLISH_ADAPTIVE_WORDS !== 'undefined' && Array.isArray(global.ENGLISH_ADAPTIVE_WORDS)) {
        return global.ENGLISH_ADAPTIVE_WORDS;
      }
      try {
        const mod = require('../data/adaptive-vocab.js');
        if (mod && mod.ENGLISH_ADAPTIVE_WORDS) return mod.ENGLISH_ADAPTIVE_WORDS;
      } catch (e) {}
      return ['air', 'alien', 'all', 'an', 'are', 'area', 'ear', 'earn', 'era', 'ill', 'in', 'inn', 'inner', 'lane', 'lean', 'liar', 'lie', 'line', 'linen', 'nail', 'near', 'rail', 'rain', 'ran', 'rare', 'real', 'rear', 'rein', 'learn', 'linear', 'aerial', 'arena'];
    }

    // Khmer vocab
    if (typeof global.KHMER_ADAPTIVE_WORDS !== 'undefined' && Array.isArray(global.KHMER_ADAPTIVE_WORDS)) {
      return global.KHMER_ADAPTIVE_WORDS;
    }
    try {
      const mod = require('../data/adaptive-vocab.js');
      if (mod && mod.KHMER_ADAPTIVE_WORDS) return mod.KHMER_ADAPTIVE_WORDS;
    } catch (e) {}
    return ['អាវ', 'តា', 'យាយ', 'មាន', 'ខាន', 'បាន', 'ចាន', 'តារា', 'កាច', 'សាលា', 'កាក់', 'ដាក់', 'កូន', 'ដើរ', 'ឆាប់', 'ភ្នំ', 'ទៅ', 'មក', 'រត់', 'យូរ', 'ទិញ', 'ពីរ', 'ដេក', 'ដែក', 'ស្គាល់', 'ស្អាត', 'កម្ពុជា', 'បញ្ជី', 'សង្ឃ', 'សម្បត្តិ', 'ត្រី', 'ក្រៅ', 'ខ្លា', 'ឆ្កែ', 'ផ្លូវ', 'ម្ហូប', 'ស្ងួត', 'ក្បាល', 'ញាតិ', 'ញញឹម', 'អ្នក', 'អាន'];
  }

  /* ---------- Multi-Signal Performance State Classifier ---------- */
  function getLayoutAverageResponseMs(layoutId, state) {
    const l = normalizeLayout(layoutId);
    const s = state || loadAdaptiveState(l);
    let totalMs = 0;
    let count = 0;
    for (const u in s.unitStats) {
      const st = s.unitStats[u];
      if (st && st.avgResponseMs && st.attempts >= 3) {
        totalMs += st.avgResponseMs;
        count++;
      }
    }
    return count > 0 ? (totalMs / count) : 350; // default baseline 350ms
  }

  /* ---------- Keyboard & Finger Awareness ---------- */
  const FINGER_DISPLAY_NAMES = {
    lp: 'Left pinky finger',
    lr: 'Left ring finger',
    lm: 'Left middle finger',
    li: 'Left index finger',
    lt: 'Left thumb',
    rt: 'Right thumb',
    ri: 'Right index finger',
    rm: 'Right middle finger',
    rr: 'Right ring finger',
    rp: 'Right pinky finger'
  };

  const DEFAULT_KEY_FINGER = {
    grave:'lp', k1:'lp', k2:'lr', k3:'lm', k4:'li', k5:'li',
    k6:'ri', k7:'ri', k8:'rm', k9:'rr', k0:'rp', minus:'rp', equal:'rp', backspace:'rp',
    tab:'lp', q:'lp', w:'lr', e:'lm', r:'li', t:'li', y:'ri', u:'ri', i:'rm', o:'rr',
    p:'rp', bracketL:'rp', bracketR:'rp', enter:'rp',
    caps:'lp', a:'lp', s:'lr', d:'lm', f:'li', g:'li', h:'ri', j:'ri', k:'rm', l:'rr',
    semicolon:'rp', quote:'rp', backslash:'rp',
    shiftL:'lp', z:'lp', x:'lr', c:'lm', v:'li', b:'li', n:'ri', m:'ri',
    comma:'rm', period:'rr', slash:'rp', extra:'rp', shiftR:'rp',
    ctrlL:'lt', alt:'lt', space:'rt', altgr:'rt', ctrlR:'rp'
  };

  function resolveKeyAndFinger(layoutId, unit) {
    if (!unit) return { keyId: 'unknown', layer: 'base', finger: 'unknown', fingerName: 'Finger' };
    let keyId = String(unit).toLowerCase();
    let layer = 'base';
    if (typeof global.resolveCharLocation === 'function') {
      try {
        const loc = global.resolveCharLocation(unit);
        if (loc) {
          keyId = loc.id;
          layer = loc.layer || 'base';
        }
      } catch (e) {}
    }
    let finger = 'unknown';
    const kf = (typeof global.window !== 'undefined' && global.window.KEY_FINGER) ||
               (typeof global.KEY_FINGER !== 'undefined' ? global.KEY_FINGER : null) ||
               DEFAULT_KEY_FINGER;
    if (kf && kf[keyId]) {
      finger = kf[keyId];
    } else if (typeof global.resolveFinger === 'function') {
      try {
        finger = global.resolveFinger(keyId);
      } catch (e) {}
    }
    const fingerName = FINGER_DISPLAY_NAMES[finger] || 'Finger';
    return { keyId, layer, finger, fingerName };
  }

  /**
   * Classify unit state using multi-signal evidence:
   * Returns: { unit, keyId, finger, fingerName, state, accuracy, attempts, mistakes, avgResponseMs, recentAccuracy, trend, label, priorityLevel, priorityScore }
   * States: 'locked' | 'active' | 'strong' | 'normal' | 'needs-practice' | 'weak' | 'improving' | 'focus'
   */
  function getUnitState(layoutId, unit, explicitState) {
    const l = normalizeLayout(layoutId);
    const s = explicitState || loadAdaptiveState(l);
    const unlockedSet = new Set((s.unlockedUnits || []).map(u => u.toLowerCase()));
    const uLower = String(unit).toLowerCase();
    const loc = resolveKeyAndFinger(l, unit);

    if (!unlockedSet.has(uLower)) {
      return {
        unit: unit,
        keyId: loc.keyId,
        layer: loc.layer,
        finger: loc.finger,
        fingerName: loc.fingerName,
        state: 'locked',
        label: 'Locked',
        isUnlocked: false,
        completion: 0,
        completedUnits: 0,
        targetUnits: CONFIG.targetCompletionUnitsPerLetter || 20,
        accuracy: 0,
        attempts: 0,
        mistakes: 0,
        avgResponseMs: 0,
        recentAccuracy: 0,
        trend: 0,
        priorityLevel: 'none',
        priorityScore: 0
      };
    }

    const st = s.unitStats[uLower] || {
      attempts: 0,
      mistakes: 0,
      correct: 0,
      completedUnits: 0,
      recentAttempts: [],
      avgResponseMs: 0,
      lastPracticed: null
    };

    const attempts = st.attempts || 0;
    const mistakes = st.mistakes || 0;
    const correct = Math.max(0, attempts - mistakes);
    const accuracy = attempts > 0 ? Math.round((correct / attempts) * 100) : 100;
    let avgResponseMs = st.avgResponseMs || 0;
    const layoutAvgMs = getLayoutAverageResponseMs(l, s);

    // Completion percentage (Strict 100% unlock: 20 / 20 = 100%, separate from accuracy)
    const targetUnits = CONFIG.targetCompletionUnitsPerLetter || 20;
    let completedUnits = (st.completedUnits !== undefined) ? Number(st.completedUnits) : 0;
    let completion = Math.min(100, Math.floor((completedUnits / targetUnits) * 100));
    if (st.completion !== undefined && completedUnits > 0) {
      if (completedUnits >= targetUnits && st.completion === 100) {
        completion = 100;
      } else if (completedUnits < targetUnits) {
        completion = Math.min(99, Number(st.completion));
      }
    }

    // Calculate recent window accuracy and trend
    const recent = (st.recentAttempts && st.recentAttempts.length > 0)
      ? st.recentAttempts
      : [];
    let recentAccuracy = accuracy;
    let recentMistakes = 0;
    if (recent.length > 0) {
      const recentCorrect = recent.filter(Boolean).length;
      recentAccuracy = Math.round((recentCorrect / recent.length) * 100);
      recentMistakes = recent.length - recentCorrect;
    }
    const trend = recentAccuracy - accuracy;

    // Check focus
    const isFocus = (s.focusUnit && s.focusUnit.toLowerCase() === uLower);
    const isNewlyUnlocked = (s.newlyUnlockedUnit && s.newlyUnlockedUnit.toLowerCase() === uLower);

    // Priority score calculation (Deterministic, Explainable)
    let priorityScore = 0;
    if (attempts >= CONFIG.minEvidenceAttempts) {
      if (accuracy < 70) priorityScore += 120 + (70 - accuracy) * 2.5;
      else if (accuracy < 80) priorityScore += 75 + (80 - accuracy) * 2;
      else if (accuracy < 88) priorityScore += 40 + (88 - accuracy) * 1.5;
      else if (accuracy < 92) priorityScore += 15;

      priorityScore += recentMistakes * 10;
      if (avgResponseMs > layoutAvgMs * 1.3 && avgResponseMs > 0) {
        priorityScore += Math.min(25, Math.round(((avgResponseMs - layoutAvgMs) / 100) * 8));
      }
      if (trend < -5) priorityScore += Math.min(20, Math.abs(trend));
      if (isNewlyUnlocked && attempts < 8) priorityScore += 55;
    } else {
      if (isNewlyUnlocked) priorityScore += 50;
      else if (attempts === 0) priorityScore += 20;
      else priorityScore += 10;
    }

    let priorityLevel = 'none';
    if (priorityScore >= 80) priorityLevel = 'very high';
    else if (priorityScore >= 50) priorityLevel = 'high';
    else if (priorityScore >= 25) priorityLevel = 'moderate';
    else if (priorityScore > 0) priorityLevel = 'low';

    // State determination
    let finalState = 'active';
    let label = 'Active';

    if (completion === 0 || attempts === 0 || attempts < CONFIG.minEvidenceAttempts) {
      finalState = (completion > 0 && isFocus) ? 'focus' : 'active';
      label = (completion > 0 && isFocus) ? 'Focus' : 'Active';
      return {
        unit: unit,
        keyId: loc.keyId,
        layer: loc.layer,
        finger: loc.finger,
        fingerName: loc.fingerName,
        state: finalState,
        label: label,
        isUnlocked: true,
        isNewlyUnlocked: isNewlyUnlocked,
        completion: completion,
        completedUnits: completedUnits,
        targetUnits: targetUnits,
        accuracy: accuracy,
        attempts: attempts,
        mistakes: mistakes,
        avgResponseMs: avgResponseMs,
        recentAccuracy: recentAccuracy,
        trend: trend,
        insufficientEvidence: true,
        priorityScore: priorityScore,
        priorityLevel: priorityLevel,
        priority: priorityLevel.replace(/\s+/g, '-')
      };
    }

    if (recent.length >= 3 && trend >= 10 && accuracy < CONFIG.needsPracticeThreshold && recentAccuracy >= 80) {
      finalState = 'improving';
      label = 'Improving';
    } else if (accuracy < CONFIG.weakAccuracyThreshold || recentMistakes >= 3) {
      finalState = 'weak';
      label = 'Weak';
    } else if (accuracy < CONFIG.strongAccuracyThreshold || (avgResponseMs > layoutAvgMs * CONFIG.slowResponseRatio && attempts >= 5)) {
      finalState = 'needs-practice';
      label = 'Needs Practice';
    } else if (accuracy >= CONFIG.strongAccuracyThreshold) {
      finalState = 'strong';
      label = 'Strong';
    } else {
      finalState = 'normal';
      label = 'Normal';
    }

    if (isFocus) {
      finalState = 'focus';
      label = 'Focus';
    }

    return {
      unit: unit,
      keyId: loc.keyId,
      layer: loc.layer,
      finger: loc.finger,
      fingerName: loc.fingerName,
      state: finalState,
      label: label,
      isUnlocked: true,
      isNewlyUnlocked: isNewlyUnlocked,
      completion: completion,
      completedUnits: completedUnits,
      targetUnits: targetUnits,
      accuracy: accuracy,
      attempts: attempts,
      mistakes: mistakes,
      avgResponseMs: avgResponseMs,
      recentAccuracy: recentAccuracy,
      trend: trend,
      insufficientEvidence: false,
      priorityScore: priorityScore,
      priorityLevel: priorityLevel,
      priority: priorityLevel.replace(/\s+/g, '-')
    };
  }

  function getAllUnitsStatus(layoutId) {
    const l = normalizeLayout(layoutId);
    const progression = PROGRESSIONS[l] || PROGRESSIONS.english;
    const s = loadAdaptiveState(l);
    return progression.map(u => getUnitState(l, u, s));
  }

  /* ---------- Weak-Key Focus System Analyzer ---------- */
  function evaluateWeaknesses(layoutId, explicitState) {
    const l = normalizeLayout(layoutId);
    const s = explicitState || loadAdaptiveState(l);
    const unlockedUnits = (s.unlockedUnits || INITIAL_ACTIVE_SETS[l]).slice();

    const evaluated = unlockedUnits.map(u => getUnitState(l, u, s));

    // Sort active units by priority score descending
    const sorted = evaluated.slice().sort((a, b) => b.priorityScore - a.priorityScore);

    // Filter units that have genuine weakness evidence (attempts >= minEvidenceAttempts)
    const struggling = sorted.filter(u => !u.insufficientEvidence && (u.state === 'weak' || u.state === 'needs-practice' || u.priorityScore >= 35));

    // Primary focus: highest priority among struggling units, or existing focusUnit if valid, or null if none
    let focus = null;
    if (struggling.length > 0) {
      focus = struggling[0];
    } else if (s.focusUnit) {
      const explicit = evaluated.find(u => u.unit.toLowerCase() === s.focusUnit.toLowerCase());
      if (explicit && !explicit.insufficientEvidence) focus = explicit;
    }

    // Needs practice: other weak / needs-practice units
    const needsPractice = sorted.filter(u => (!focus || u.unit !== focus.unit) && !u.insufficientEvidence && (u.state === 'weak' || u.state === 'needs-practice' || u.priorityScore >= 25));
    const weakList = sorted.filter(u => !u.insufficientEvidence && (u.state === 'weak' || u.priorityScore >= 70));
    const strong = evaluated.filter(u => u.state === 'strong');
    const improving = evaluated.filter(u => u.state === 'improving');

    // Finger pattern detection: check if 2+ weak/needs-practice units share a finger
    const allStruggling = [focus, ...needsPractice].filter(Boolean);
    const fingerBuckets = {};
    allStruggling.forEach(u => {
      if (u.finger && u.finger !== 'unknown') {
        if (!fingerBuckets[u.finger]) fingerBuckets[u.finger] = { name: u.fingerName, keys: [] };
        fingerBuckets[u.finger].keys.push(u.unit.toUpperCase());
      }
    });

    let fingerPattern = null;
    for (const f in fingerBuckets) {
      if (fingerBuckets[f].keys.length >= 2) {
        fingerPattern = {
          finger: f,
          fingerName: fingerBuckets[f].name,
          keys: fingerBuckets[f].keys,
          message: `${fingerBuckets[f].name} needs additional practice.`
        };
        break;
      }
    }

    return {
      layoutId: l,
      stage: s.stage || 1,
      focus: focus,
      primaryFocus: focus,
      needsPractice: needsPractice,
      weakList: weakList,
      strong: strong,
      improving: improving,
      fingerPattern: fingerPattern,
      allUnits: evaluated
    };
  }

  function getWeakKeyFocus(layoutId) {
    return evaluateWeaknesses(layoutId);
  }

  /* ---------- Controlled Letter Unlocking Logic ---------- */
  /**
   * Evaluates completion across current active units.
   * Hard Rules 10-13:
   * A new letter can unlock ONLY when every currently required active letter has reached 100% completion.
   * 99% completion must NOT unlock the next letter.
   * 100% completion MUST unlock the next letter when all active letters are complete.
   */
  function checkCanUnlockNext(layoutId) {
    const l = normalizeLayout(layoutId);
    const s = loadAdaptiveState(l);
    const progression = PROGRESSIONS[l] || PROGRESSIONS.english;
    const active = s.unlockedUnits || [];

    if (active.length >= progression.length) {
      return { canUnlock: false, reason: 'All letters in progression already unlocked' };
    }

    const requiredUnits = CONFIG.targetCompletionUnitsPerLetter || 20;

    for (const u of active) {
      const uState = getUnitState(l, u, s);
      const isComplete = (uState.completedUnits >= requiredUnits) && (uState.completion === 100);
      if (!isComplete) {
        return {
          canUnlock: false,
          reason: `Letter "${u.toUpperCase()}" is at ${uState.completion}% completion (${uState.completedUnits}/${requiredUnits}). Every active letter must reach 100% completion to unlock the next letter.`
        };
      }
    }

    const nextIndex = active.length;
    const nextUnit = progression[nextIndex];
    return { canUnlock: true, nextUnit: nextUnit, currentStage: s.stage || 1 };
  }

  function unlockNextLetter(layoutId) {
    const l = normalizeLayout(layoutId);
    const check = checkCanUnlockNext(l);
    if (!check.canUnlock || !check.nextUnit) return { unlocked: false, reason: check.reason };

    const s = loadAdaptiveState(l);
    s.unlockedUnits.push(check.nextUnit);
    s.newlyUnlockedUnit = check.nextUnit;
    s.focusUnit = check.nextUnit;
    s.stage = (s.stage || 1) + 1;
    s.stageSessions = 0;

    // Newly unlocked letter starts at 0/20 (0% completion)
    const nextULower = check.nextUnit.toLowerCase();
    s.unitStats[nextULower] = {
      attempts: 0,
      mistakes: 0,
      correct: 0,
      completedUnits: 0,
      recentAttempts: [],
      avgResponseMs: 0,
      lastPracticed: null
    };

    saveAdaptiveState(l, s);

    return {
      unlocked: true,
      unit: check.nextUnit,
      stage: s.stage,
      totalUnlocked: s.unlockedUnits.length,
      totalPossible: (PROGRESSIONS[l] || PROGRESSIONS.english).length
    };
  }

  /* ---------- Word Filtering & Weighting Generator ---------- */
  function getValidWordsForUnlocked(layoutId, unlockedUnits) {
    const l = normalizeLayout(layoutId);
    const vocab = getVocabList(l);
    const validSet = new Set((unlockedUnits || []).map(u => u.toLowerCase()));

    const filtered = vocab.filter(w => {
      const lower = w.toLowerCase();
      // For Khmer, characters might be multi-codepoint, but every character/unit must be in validSet
      for (const ch of lower) {
        if (!validSet.has(ch) && ch !== ' ') return false;
      }
      return true;
    });

    return filtered;
  }

  /**
   * Generates a targeted, natural adaptive drill:
   * - ONLY contains unlocked letters (locked letters NEVER appear)
   * - Weak letters receive higher frequency weighting
   * - Strong letters remain present in rotation
   * - Newly unlocked letters receive extra attention
   * - Deterministic with seed for testing
   */
  function generateAdaptiveDrill(layoutId, options = {}) {
    const l = normalizeLayout(layoutId);
    const s = loadAdaptiveState(l);
    const unlockedUnits = (options.unlockedUnits && options.unlockedUnits.length)
      ? options.unlockedUnits
      : (s.unlockedUnits || INITIAL_ACTIVE_SETS[l]).slice();

    const unlockedSet = new Set(unlockedUnits.map(u => u.toLowerCase()));
    const rng = mulberry32(options.seed !== undefined ? options.seed : (Date.now() & 0xFFFFFFFF));
    const targetWordCount = options.wordCount || CONFIG.defaultDrillWords;

    // Evaluate performance and determine focus + weak keys
    const evalRes = evaluateWeaknesses(l, s);
    const unitWeights = {};
    let primaryWeakUnit = (evalRes.focus && evalRes.focus.unit) ? evalRes.focus.unit : null;

    if (!primaryWeakUnit && evalRes.needsPractice && evalRes.needsPractice.length > 0) {
      primaryWeakUnit = evalRes.needsPractice[0].unit;
    }

    // If caller specified an explicit focus target
    if (options.focusUnit) {
      primaryWeakUnit = options.focusUnit;
    }

    // Set weights for all active units
    unlockedUnits.forEach(u => {
      const uLower = u.toLowerCase();
      const uState = getUnitState(l, u, s);
      let w = CONFIG.weightStrong; // default 1.0

      if (primaryWeakUnit && uLower === primaryWeakUnit.toLowerCase()) {
        w = 4.5; // Primary focus highest weight
      } else if (uState.isNewlyUnlocked) {
        w = CONFIG.weightNew; // 3.5
      } else if (uState.state === 'weak') {
        w = 3.2; // Weak targets
      } else if (uState.state === 'needs-practice') {
        w = 2.4; // Needs practice
      } else if (uState.state === 'improving') {
        w = 2.0; // Consolidate improvement
      } else if (uState.state === 'normal' || uState.state === 'active') {
        w = 1.5;
      }
      unitWeights[uLower] = w;
    });

    const weakUnitsList = evalRes.needsPractice.map(u => u.unit.toLowerCase());

    // Get candidate words containing ONLY unlocked letters
    const validWords = getValidWordsForUnlocked(l, unlockedUnits);

    // Fallback safe: if active set is small or word choices are limited,
    // construct safe syllables / simple words made ONLY from unlocked units
    let candidatePool = validWords.slice();
    if (candidatePool.length < 8) {
      const anchors = unlockedUnits.slice(0, 4);
      anchors.forEach(a => {
        unlockedUnits.forEach(b => {
          if (a !== b) {
            candidatePool.push(a + b);
            candidatePool.push(b + a);
            candidatePool.push(a + b + a);
            candidatePool.push(b + a + b);
          }
        });
      });
    }

    // Score and rank candidates by how well they practice target letters (with Combination Bonus)
    const scoredWords = candidatePool.map(w => {
      let score = 0;
      let containsWeak = false;
      const lower = w.toLowerCase();
      let weakMatches = 0;
      let hasFocus = false;

      for (const ch of lower) {
        const weight = unitWeights[ch] || 1.0;
        score += weight;
        if (primaryWeakUnit && ch === primaryWeakUnit.toLowerCase()) {
          hasFocus = true;
          score += 2.5;
        }
        if (weakUnitsList.includes(ch)) {
          weakMatches++;
        }
      }

      // Combination bonus: weak keys + focus combinations (Requirements 5 & 6)
      if (hasFocus && weakMatches > 0) {
        score += 3.5;
        containsWeak = true;
      } else if (hasFocus || weakMatches > 0) {
        containsWeak = true;
      }
      if (weakMatches >= 2) {
        score += weakMatches * 2.0;
      }

      // Add controlled diversity jitter from PRNG
      const jitter = rng() * 1.5;
      return { word: w, score: score + jitter, containsWeak };
    });

    scoredWords.sort((a, b) => b.score - a.score);

    // Partition words into target-emphasizing and maintenance words
    const targetWords = scoredWords.filter(sw => sw.containsWeak).map(sw => sw.word);
    const maintenanceWords = scoredWords.filter(sw => !sw.containsWeak).map(sw => sw.word);

    // Select targetWordCount words with balanced rotation (no immediate consecutive repeats)
    const selectedWords = [];
    let lastWord = null;

    for (let i = 0; i < targetWordCount; i++) {
      let cand = null;
      // Every 3rd or 4th word, pick a maintenance word if available to keep strong letters active
      const preferMaintenance = (i % 3 === 2) && maintenanceWords.length > 0;

      if (preferMaintenance && maintenanceWords.length > 0) {
        const pIdx = Math.floor(rng() * Math.min(8, maintenanceWords.length));
        cand = maintenanceWords[pIdx];
      } else if (targetWords.length > 0) {
        const pIdx = Math.floor(rng() * Math.min(10, targetWords.length));
        cand = targetWords[pIdx];
      } else if (scoredWords.length > 0) {
        cand = scoredWords[i % scoredWords.length].word;
      } else {
        cand = candidatePool[i % candidatePool.length];
      }

      if (cand === lastWord && candidatePool.length > 1) {
        cand = candidatePool[(i + 1) % candidatePool.length];
      }
      selectedWords.push(cand);
      lastWord = cand;
    }

    // Convert into exercise text and key sequences
    const fullText = selectedWords.join(' ');
    const chars = [];
    const layers = [];
    const keyIds = [];

    // Map through resolveCharLocation if available
    for (let i = 0; i < fullText.length; i++) {
      const ch = fullText[i];
      chars.push(ch);
      let loc = null;
      if (typeof global.resolveCharLocation === 'function') {
        loc = global.resolveCharLocation(ch);
      }
      layers.push(loc ? loc.layer : 'base');
      keyIds.push(loc ? loc.id : (ch === ' ' ? 'space' : ch.toLowerCase()));
    }

    // Snapshot target unit beforeStats for Before/After measurement
    const focusState = primaryWeakUnit ? getUnitState(l, primaryWeakUnit, s) : null;
    const beforeStats = focusState ? {
      unit: primaryWeakUnit,
      accuracy: focusState.accuracy,
      attempts: focusState.attempts,
      mistakes: focusState.mistakes,
      avgResponseMs: focusState.avgResponseMs,
      timestamp: Date.now()
    } : null;

    s.focusUnit = primaryWeakUnit;
    saveAdaptiveState(l, s);

    return {
      id: 'adaptive_' + Date.now(),
      isAdaptive: true,
      layoutId: l,
      title: `Adaptive Practice — Stage ${s.stage || 1}`,
      subtitle: `Focus: ${primaryWeakUnit ? primaryWeakUnit.toUpperCase() : 'Mixed'} (${focusState ? focusState.label : 'Active'}) · Available: ${unlockedUnits.map(u => u.toUpperCase()).join(' ')}`,
      words: selectedWords,
      chars: chars,
      layers: layers,
      keyIds: keyIds,
      sections: [
        {
          id: 'sec_adaptive_1',
          type: 'adaptive',
          title: 'Adaptive Practice',
          startIndex: 0,
          endIndex: Math.max(0, chars.length - 1),
          totalUnits: chars.length
        }
      ],
      unlockedUnits: unlockedUnits,
      targetUnits: Object.keys(unitWeights).filter(k => unitWeights[k] > 1.5),
      focusUnit: primaryWeakUnit,
      focusTarget: evalRes.focus,
      needsPractice: evalRes.needsPractice,
      strongUnits: evalRes.strong,
      fingerPattern: evalRes.fingerPattern,
      beforeStats: beforeStats,
      newlyIntroduced: s.newlyUnlockedUnit
    };
  }

  /* ---------- Real-Time In-Session Tracking & Adaptation ---------- */
  function recordStroke(layoutId, unit, isCorrect, responseTimeMs) {
    if (!unit) return;
    const l = normalizeLayout(layoutId);
    const s = loadAdaptiveState(l);
    const u = unit.toLowerCase();

    if (!s.unitStats[u]) {
      s.unitStats[u] = {
        attempts: 0,
        mistakes: 0,
        correct: 0,
        completedUnits: 0,
        recentAttempts: [],
        avgResponseMs: 0,
        lastPracticed: null
      };
    }

    const st = s.unitStats[u];
    st.attempts = (st.attempts || 0) + 1;
    if (isCorrect) {
      st.correct = (st.correct || 0) + 1;
      st.completedUnits = (st.completedUnits || 0) + 1;
    } else {
      st.mistakes = (st.mistakes || 0) + 1;
    }

    // Update sliding recent window
    if (!st.recentAttempts) st.recentAttempts = [];
    st.recentAttempts.push(!!isCorrect);
    if (st.recentAttempts.length > CONFIG.maxRecentAttempts) {
      st.recentAttempts.shift();
    }

    // Update exponential moving average of response time
    if (responseTimeMs && responseTimeMs > 0 && responseTimeMs < 10000) {
      if (!st.avgResponseMs || st.avgResponseMs === 0) {
        st.avgResponseMs = responseTimeMs;
      } else {
        st.avgResponseMs = Math.round(st.avgResponseMs * 0.8 + responseTimeMs * 0.2);
      }
    }
    st.lastPracticed = Date.now();
    s.totalUnitsTyped = (s.totalUnitsTyped || 0) + 1;

    saveAdaptiveState(l, s);
    return getUnitState(l, u, s);
  }

  /* ---------- Session Completion & Before/After Measurement ---------- */
  function completeAdaptiveSession(layoutId, drillDef, sessionResult = {}) {
    const l = normalizeLayout(layoutId);
    const s = loadAdaptiveState(l);

    s.sessionsCompleted = (s.sessionsCompleted || 0) + 1;
    s.stageSessions = (s.stageSessions || 0) + 1;

    const focusUnit = (drillDef && drillDef.focusUnit) || s.focusUnit || s.unlockedUnits[0];
    const beforeStats = (drillDef && drillDef.beforeStats) || null;
    const afterState = getUnitState(l, focusUnit, s);

    let diffPct = 0;
    if (beforeStats && beforeStats.accuracy !== undefined) {
      diffPct = afterState.accuracy - beforeStats.accuracy;
    }

    // Check if new letter can be unlocked (Hard Rules 10-12: 100% completion on all active letters)
    const unlockCheck = checkCanUnlockNext(l);
    let unlockedNew = false;
    let unlockedUnit = null;

    if (unlockCheck.canUnlock && unlockCheck.nextUnit) {
      const unlockRes = unlockNextLetter(l);
      if (unlockRes.unlocked) {
        unlockedNew = true;
        unlockedUnit = unlockRes.unit;
        // Keep in-memory s synchronized with unlocked units and stage so subsequent saveAdaptiveState preserves it
        const fresh = loadAdaptiveState(l);
        s.unlockedUnits = fresh.unlockedUnits.slice();
        s.stage = fresh.stage;
        s.newlyUnlockedUnit = fresh.newlyUnlockedUnit;
        s.focusUnit = fresh.focusUnit;
        s.unitStats = fresh.unitStats;
        s.stageSessions = 0;
      }
    }

    // Record session history
    const historyEntry = {
      timestamp: Date.now(),
      stage: s.stage || 1,
      focusUnit: focusUnit,
      accuracy: sessionResult.accuracy || 100,
      wpm: sessionResult.wpm || 0,
      mistakes: sessionResult.mistakes || 0,
      timeSec: sessionResult.timeSec || 0,
      unlockedNew: unlockedNew ? unlockedUnit : null,
      beforeAccuracy: beforeStats ? beforeStats.accuracy : null,
      afterAccuracy: afterState.accuracy,
      diffPct: diffPct
    };

    if (!s.sessionHistory) s.sessionHistory = [];
    s.sessionHistory.push(historyEntry);
    if (s.sessionHistory.length > 50) s.sessionHistory.shift();

    // Re-evaluate weaknesses after the session (Requirements 2, 7, 8)
    const evalRes = evaluateWeaknesses(l, s);
    // If the focus unit improved and another weakness has higher priority, change focus!
    if (evalRes.focus && evalRes.focus.unit && evalRes.focus.unit.toLowerCase() !== focusUnit.toLowerCase()) {
      s.focusUnit = evalRes.focus.unit;
    }

    saveAdaptiveState(l, s);

    // Group current letter performance
    const allStatuses = getAllUnitsStatus(l).filter(u => u.isUnlocked);
    const strongLetters = allStatuses.filter(u => u.state === 'strong').map(u => u.unit.toUpperCase());
    const needsPracticeLetters = allStatuses.filter(u => u.state === 'needs-practice' || u.state === 'weak').map(u => u.unit.toUpperCase());
    const weakLetters = allStatuses.filter(u => u.state === 'weak').map(u => u.unit.toUpperCase());

    return {
      layoutId: l,
      stage: s.stage || 1,
      practiceLetters: s.unlockedUnits.map(u => u.toUpperCase()),
      strongLetters: strongLetters,
      needsPracticeLetters: needsPracticeLetters,
      weakLetters: weakLetters,
      focusUnit: focusUnit ? focusUnit.toUpperCase() : null,
      accuracy: sessionResult.accuracy || 100,
      wpm: sessionResult.wpm || 0,
      mistakes: sessionResult.mistakes || 0,
      timeSec: sessionResult.timeSec || 0,
      newLetterUnlocked: unlockedNew ? unlockedUnit.toUpperCase() : null,
      fingerPattern: evalRes.fingerPattern,
      weakAnalysis: evalRes,
      beforeAfter: {
        unit: focusUnit ? focusUnit.toUpperCase() : null,
        beforeAccuracy: beforeStats ? beforeStats.accuracy : 100,
        afterAccuracy: afterState.accuracy,
        diffPct: diffPct
      }
    };
  }

  /* ============================================================
     UI CONTROLLER & INTERACTION ENGINE
     ============================================================ */
  let activeSession = null;
  let highlightedAdaptiveKeyId = null;
  let highlightedAdaptiveModId = null;

  function renderLetterStrip(containerEl, layoutId) {
    const l = normalizeLayout(layoutId || (typeof currentLayoutId !== 'undefined' ? currentLayoutId : 'english'));
    const container = containerEl || (typeof document !== 'undefined' ? document.getElementById('adaptiveLetterStrip') : null);
    if (!container) return;

    const s = loadAdaptiveState(l);
    const statuses = getAllUnitsStatus(l);
    container.innerHTML = '';

    statuses.forEach(st => {
      const isZero = st.isUnlocked && (st.completion === 0);
      const isFocusPill = !isZero && (st.unit === s.focusUnit || st.state === 'focus');
      const pillStateClass = isZero ? 'as-active as-zero' : `as-${st.state}`;

      const pill = document.createElement('div');
      pill.className = `as-pill ${pillStateClass}` + (isFocusPill ? ' as-focus' : '');
      pill.setAttribute('data-unit', st.unit);

      const charSpan = document.createElement('span');
      charSpan.className = 'as-pill-char';
      charSpan.textContent = st.unit.toUpperCase();

      const statSpan = document.createElement('span');
      statSpan.className = 'as-pill-stat';
      if (!st.isUnlocked) {
        statSpan.innerHTML = (typeof pkIcon === 'function') ? pkIcon('lock', 10) : '';
      } else {
        statSpan.textContent = `${st.completion}%`;
      }

      const dot = document.createElement('span');
      dot.className = 'as-pill-dot';

      // Tooltip on hover
      const tooltip = document.createElement('div');
      tooltip.className = 'as-tooltip';
      const statusLabel = st.state === 'locked' ? 'Locked'
        : isZero ? 'Active'
        : st.state === 'strong' ? 'Strong (Mastered)'
        : st.state === 'needs-practice' ? 'Needs Practice'
        : st.state === 'weak' ? 'Weak Target'
        : st.state === 'improving' ? 'Improving'
        : 'Active';

      tooltip.innerHTML = `
        <div style="font-weight:700;color:var(--gold-bright);">${st.unit.toUpperCase()} · ${statusLabel}</div>
        ${st.isUnlocked ? `<div>Completion: <b>${st.completion}%</b> (${st.completedUnits}/${st.targetUnits})</div>
        <div>Accuracy: <b>${st.accuracy}%</b> (${st.correct}/${st.attempts})</div>
        <div>Avg Speed: <b>${st.avgResponseMs > 0 ? st.avgResponseMs + 'ms' : '—'}</b></div>
        <div>Trend: <b>${st.trend}</b></div>` : '<div>Unlocks when all active letters reach 100%</div>'}
      `;

      pill.setAttribute('aria-label', `${st.unit.toUpperCase()} ${statusLabel}: ${st.isUnlocked ? `${st.completion}% complete, ${st.accuracy}% accuracy` : 'Locked'}`);

      pill.appendChild(charSpan);
      pill.appendChild(statSpan);
      if (st.isUnlocked && !isZero) pill.appendChild(dot);
      pill.appendChild(tooltip);
      container.appendChild(pill);
    });
  }

  function updateSidebarCard(layoutId) {
    if (typeof document === 'undefined') return;
    const l = normalizeLayout(layoutId || (typeof currentLayoutId !== 'undefined' ? currentLayoutId : 'english'));
    const subEl = document.getElementById('adaptiveSidebarSub');
    if (!subEl) return;
    const s = loadAdaptiveState(l);
    const activeLetters = s.unlockedUnits.slice(0, 6).map(u => u.toUpperCase()).join(' ');
    const more = s.unlockedUnits.length > 6 ? ` +${s.unlockedUnits.length - 6}` : '';
    subEl.textContent = `Stage ${s.stage} · ${activeLetters}${more}`;
  }

  /* ---------- Weak-Key Focus HUD & Inline Toast ---------- */
  function updateAdaptiveFocusHud(layoutId) {
    if (typeof document === 'undefined') return;
    const l = normalizeLayout(layoutId || (activeSession ? activeSession.layoutId : currentLayoutId));
    const evalRes = evaluateWeaknesses(l);

    const focusChip = document.getElementById('afhFocusChip');
    if (focusChip) {
      if (evalRes.focus && evalRes.focus.unit) {
        focusChip.textContent = evalRes.focus.unit.toUpperCase();
        focusChip.title = `Priority: ${evalRes.focus.priorityLevel} · Accuracy: ${evalRes.focus.accuracy}%`;
      } else {
        focusChip.textContent = '—';
      }
    }

    const weakChips = document.getElementById('afhWeakChips');
    if (weakChips) {
      weakChips.innerHTML = '';
      if (evalRes.needsPractice && evalRes.needsPractice.length > 0) {
        evalRes.needsPractice.forEach(w => {
          const chip = document.createElement('span');
          chip.className = `afh-weak-chip ${w.state === 'needs-practice' ? 'needs-practice' : ''}`;
          chip.textContent = `${w.unit.toUpperCase()} ${w.accuracy}%`;
          chip.title = `${w.label} · Mistakes: ${w.mistakes} · Speed: ${w.avgResponseMs}ms`;
          weakChips.appendChild(chip);
        });
      } else {
        const healthy = document.createElement('span');
        healthy.className = 'afh-healthy-chip';
        healthy.textContent = 'All active keys healthy';
        weakChips.appendChild(healthy);
      }
    }

    const fingerGroup = document.getElementById('afhFingerGroup');
    const fingerNote = document.getElementById('afhFingerNote');
    if (fingerGroup && fingerNote) {
      if (evalRes.fingerPattern) {
        fingerGroup.hidden = false;
        fingerNote.textContent = evalRes.fingerPattern.message;
      } else {
        fingerGroup.hidden = true;
        fingerNote.textContent = '';
      }
    }
  }

  let roundToastTimer = null;
  function showInlineRoundToast(summaryResult) {
    if (typeof document === 'undefined') return;
    const toast = document.getElementById('adaptiveRoundToast');
    if (!toast) return;

    if (roundToastTimer) clearTimeout(roundToastTimer);
    toast.hidden = false;
    toast.style.opacity = '1';
    if (summaryResult && summaryResult.newLetterUnlocked) {
      toast.textContent = `Unlocked '${summaryResult.newLetterUnlocked.toUpperCase()}'! · ${summaryResult.accuracy}% Accuracy · Focus: ${summaryResult.focusUnit || '—'}`;
    } else {
      toast.textContent = `Round Complete · ${summaryResult ? summaryResult.accuracy : 100}% Accuracy · Focus: ${(summaryResult && summaryResult.focusUnit) || '—'}`;
    }

    roundToastTimer = setTimeout(() => {
      toast.style.transition = 'opacity 0.4s ease';
      toast.style.opacity = '0';
      setTimeout(() => {
        toast.hidden = true;
        toast.style.transition = '';
        toast.style.opacity = '1';
      }, 400);
    }, 2200);
  }

  function renderAdaptiveChars() {
    if (typeof document === 'undefined') return;
    const charRow = document.getElementById('adaptiveCharRow');
    if (!charRow || !activeSession || !activeSession.drill) return;
    charRow.innerHTML = '';
    const chars = activeSession.drill.chars;
    const idx = activeSession.index;
    const start = Math.max(0, idx - 2);
    const end = Math.min(chars.length, start + 10);

    for (let i = start; i < end; i++) {
      const s = document.createElement('span');
      const ch = chars[i];
      s.className = 'lc-char' + (i < idx ? ' done' : (i === idx ? ' current' : '')) + (ch === ' ' ? ' lc-space' : '');
      s.textContent = ch === ' ' ? '␣' : ch;
      charRow.appendChild(s);
    }
  }

  function updateAdaptiveKeyHighlight() {
    if (highlightedAdaptiveKeyId && typeof keyEls !== 'undefined' && keyEls[highlightedAdaptiveKeyId]) {
      keyEls[highlightedAdaptiveKeyId].classList.remove('lesson-target');
    }
    if (highlightedAdaptiveModId && typeof keyEls !== 'undefined' && keyEls[highlightedAdaptiveModId]) {
      keyEls[highlightedAdaptiveModId].classList.remove('modifier-target');
    }
    highlightedAdaptiveKeyId = null;
    highlightedAdaptiveModId = null;

    if (!window.adaptiveActive || !activeSession || activeSession.index >= activeSession.drill.chars.length) {
      if (typeof setActiveFinger === 'function') setActiveFinger(null);
      return;
    }

    const keyId = activeSession.drill.keyIds[activeSession.index];
    const layer = activeSession.drill.layers[activeSession.index] || 'base';

    if (keyId && typeof keyEls !== 'undefined' && keyEls[keyId]) {
      highlightedAdaptiveKeyId = keyId;
      keyEls[keyId].classList.add('lesson-target');
    }

    if (typeof modifierInfoFor === 'function') {
      const mod = modifierInfoFor(keyId, layer);
      if (mod && mod.targetKey && typeof keyEls !== 'undefined' && keyEls[mod.targetKey]) {
        highlightedAdaptiveModId = mod.targetKey;
        keyEls[mod.targetKey].classList.add('modifier-target');
      }
    }

    if (typeof setActiveFinger === 'function') {
      setActiveFinger(keyId, layer);
    }
  }

  function updateAdaptiveProgress() {
    if (!activeSession || typeof document === 'undefined') return;
    const total = activeSession.drill.chars.length;
    const idx = activeSession.index;
    const fillEl = document.getElementById('adaptiveProgressFill');
    if (fillEl) {
      fillEl.style.width = total > 0 ? `${(idx / total) * 100}%` : '0%';
    }

    const attempts = idx + activeSession.mistakes;
    const accuracy = attempts > 0 ? Math.round((idx / attempts) * 100) : 100;
    const elapsedSec = (Date.now() - activeSession.startTime) / 1000;
    const wpm = elapsedSec > 0 ? Math.min(180, Math.round((idx / 5) / (elapsedSec / 60))) : 0;

    const accVal = document.getElementById('adaptiveAccVal');
    if (accVal) accVal.textContent = `${accuracy}%`;

    const wpmVal = document.getElementById('adaptiveWpmVal');
    if (wpmVal) wpmVal.textContent = wpm;

    const streakVal = document.getElementById('adaptiveStreakVal');
    if (streakVal) streakVal.textContent = activeSession.streak || 0;

    const mistakesVal = document.getElementById('adaptiveMistakesVal');
    if (mistakesVal) mistakesVal.textContent = activeSession.mistakes;
  }

  function startAdaptiveSession(layoutId, options = {}) {
    const l = normalizeLayout(layoutId || (typeof currentLayoutId !== 'undefined' ? currentLayoutId : 'english'));

    // Cleanly exit normal lessons, race, or trials
    if (typeof lessonActive !== 'undefined' && lessonActive && typeof executeLessonExit === 'function') {
      executeLessonExit();
    }
    if (typeof trialActive !== 'undefined' && trialActive && typeof stopTrial === 'function') {
      stopTrial();
    }
    if (typeof raceMode !== 'undefined' && raceMode && typeof exitRaceMode === 'function') {
      exitRaceMode();
    }

    const drill = generateAdaptiveDrill(l, options);
    const s = loadAdaptiveState(l);

    activeSession = {
      layoutId: l,
      drill: drill,
      index: 0,
      mistakes: 0,
      mistakeUnits: {},
      startTime: Date.now(),
      acceptedUnits: [],
      streak: 0,
      lastStrokeTime: Date.now()
    };
    if (typeof window !== 'undefined') window.adaptiveActive = true;

    // DOM panels
    if (typeof document !== 'undefined') {
      const panel = document.getElementById('adaptivePanel');
      const manuscript = document.getElementById('manuscript');
      const lessonPanel = document.getElementById('lessonPanel');

      if (lessonPanel) lessonPanel.hidden = true;
      if (manuscript) manuscript.hidden = true;
      if (panel) panel.hidden = false;

      // Badges & top meta
      const stageBadge = document.getElementById('adaptiveStageBadge');
      if (stageBadge) stageBadge.textContent = `Stage ${s.stage}`;

      const focusBadge = document.getElementById('adaptiveFocusBadge');
      const focusWrap = document.getElementById('adaptiveFocusWrap');
      const focusVal = document.getElementById('adaptiveFocusVal');
      if (drill.focusUnit) {
        if (focusBadge) {
          focusBadge.hidden = false;
          focusBadge.textContent = `Focus: ${drill.focusUnit.toUpperCase()}`;
        }
        if (focusWrap) focusWrap.style.display = 'inline-flex';
        if (focusVal) focusVal.textContent = drill.focusUnit.toUpperCase();
      } else {
        if (focusBadge) focusBadge.hidden = true;
        if (focusWrap) focusWrap.style.display = 'none';
      }

      const countEl = document.getElementById('adaptiveUnlockedCount');
      if (countEl) {
        countEl.textContent = `${s.unlockedUnits.length}/${(PROGRESSIONS[l] || []).length} Active`;
      }

      renderLetterStrip(null, l);
      updateAdaptiveFocusHud(l);
      renderAdaptiveChars();
      updateAdaptiveProgress();
      updateAdaptiveKeyHighlight();

      if (typeof clearText === 'function') clearText();

      // Scroll board into view if newly starting (not on auto-advance between rounds)
      if (!options || !options.isAutoAdvance) {
        if (typeof requestAnimationFrame === 'function') {
          requestAnimationFrame(() => {
            if (panel && !panel.hidden) {
              const panelRect = panel.getBoundingClientRect();
              const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;
              const targetY = currentScrollY + panelRect.top - 65;
              window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
            }
          });
        }
      }
    }
  }

  function adaptiveHandleChar(val, el, stroke) {
    if ((typeof window !== 'undefined' && !window.adaptiveActive) || !activeSession) return;
    if (activeSession.index >= activeSession.drill.chars.length) return;

    const expected = activeSession.drill.chars[activeSession.index];
    if (!expected) return;

    const isMatch = (typeof compareTypingSequence === 'function')
      ? compareTypingSequence(val, expected)
      : (val === expected);

    const now = Date.now();
    const responseTimeMs = Math.max(20, Math.min(5000, now - activeSession.lastStrokeTime));
    activeSession.lastStrokeTime = now;

    // Record stroke in adaptive engine
    recordStroke(activeSession.layoutId, expected, isMatch, responseTimeMs);

    // Record in Phase 6 Real-time tracker if available
    if (typeof PK_TRACKER !== 'undefined' && typeof PK_TRACKER.recordTypingUnit === 'function') {
      PK_TRACKER.recordTypingUnit({
        layout: activeSession.layoutId,
        lessonId: 'adaptive-stage-' + (loadAdaptiveState(activeSession.layoutId).stage || 1),
        exerciseId: 'adaptive-drill',
        unitIndex: activeSession.index,
        expected: expected,
        produced: val,
        correct: isMatch,
        strokeKeyId: stroke ? stroke.id : null,
        strokeLayer: stroke ? stroke.layer : null,
        expectedKeyId: activeSession.drill.keyIds[activeSession.index],
        expectedLayer: activeSession.drill.layers[activeSession.index]
      });
    }

    if (isMatch) {
      activeSession.acceptedUnits.push({
        index: activeSession.index,
        val: val,
        expected: expected
      });
      activeSession.streak = (activeSession.streak || 0) + 1;
      if (typeof insertText === 'function') insertText(val);
      if (typeof recordKeystroke === 'function') recordKeystroke(true);
      activeSession.index++;

      if (el) {
        el.classList.add('correct');
        setTimeout(() => el.classList.remove('correct'), 260);
      }
      if (typeof emberBurst === 'function') emberBurst(el, null, 5, null);
      if (typeof runeRing === 'function') runeRing(el);

      if (activeSession.index >= activeSession.drill.chars.length) {
        finishAdaptiveSession();
      } else {
        renderAdaptiveChars();
        updateAdaptiveProgress();
        updateAdaptiveKeyHighlight();
        renderLetterStrip(null, activeSession.layoutId);
      }
    } else {
      activeSession.mistakes++;
      activeSession.streak = 0;
      activeSession.mistakeUnits[expected] = (activeSession.mistakeUnits[expected] || 0) + 1;
      if (typeof recordKeystroke === 'function') recordKeystroke(false);

      if (el) {
        el.classList.add('wrong');
        setTimeout(() => el.classList.remove('wrong'), 300);
      }

      if (typeof document !== 'undefined') {
        const curChar = document.querySelector('#adaptiveCharRow .lc-char.current');
        if (curChar) {
          curChar.classList.add('shake');
          setTimeout(() => curChar.classList.remove('shake'), 300);
        }
      }
      updateAdaptiveProgress();
      renderLetterStrip(null, activeSession.layoutId);
    }
  }

  function adaptiveHandleBackspace() {
    if ((typeof window !== 'undefined' && !window.adaptiveActive) || !activeSession) return;
    if (activeSession.index <= 0 || !activeSession.acceptedUnits.length) return;

    const last = activeSession.acceptedUnits.pop();
    activeSession.index--;

    if (typeof backspaceText === 'function') {
      backspaceText(last.val);
    }
    if (typeof PK_TRACKER !== 'undefined' && typeof PK_TRACKER.recordBackspace === 'function') {
      PK_TRACKER.recordBackspace({
        layout: activeSession.layoutId,
        lessonId: 'adaptive-stage-' + (loadAdaptiveState(activeSession.layoutId).stage || 1)
      });
    }

    renderAdaptiveChars();
    updateAdaptiveProgress();
    updateAdaptiveKeyHighlight();
  }

  function finishAdaptiveSession() {
    const elapsed = Math.max(1, (Date.now() - activeSession.startTime) / 1000);
    const totalChars = activeSession.drill.chars.length;
    const attempts = totalChars + activeSession.mistakes;
    const accuracy = attempts > 0 ? Math.round((totalChars / attempts) * 100) : 100;
    const wpm = elapsed > 0 ? Math.min(180, Math.round((totalChars / 5) / (elapsed / 60))) : 0;
    const currentLayoutId = activeSession.layoutId;

    const summaryResult = completeAdaptiveSession(activeSession.layoutId, activeSession.drill, {
      accuracy: accuracy,
      wpm: wpm,
      mistakes: activeSession.mistakes,
      timeSec: elapsed
    });

    // Record in Phase 7 Progress
    if (typeof PK_PROGRESS !== 'undefined' && typeof PK_PROGRESS.recordLessonAttempt === 'function') {
      PK_PROGRESS.recordLessonAttempt({
        layoutId: activeSession.layoutId,
        lessonId: 'adaptive-stage-' + summaryResult.stage,
        levelId: 'adaptive',
        accuracy: accuracy,
        wpm: wpm,
        timeSec: elapsed,
        mistakes: activeSession.mistakes,
        corrections: activeSession.acceptedUnits.length,
        units: totalChars,
        threshold: 85,
        sections: activeSession.drill.sections || []
      });
    }

    // Audio & visuals
    if (typeof playChime === 'function') playChime();
    if (typeof confettiBurst === 'function') {
      const rect = (typeof boardWrap !== 'undefined' && boardWrap ? boardWrap : document.body).getBoundingClientRect();
      confettiBurst(rect.left + rect.width / 2, rect.top + rect.height * 0.3, accuracy === 100 ? 36 : 24);
    }

    // Continuous uninterrupted practice: seamlessly start next round and display clean inline feedback
    // Modal popup completely removed per user request: zero modal popups
    startAdaptiveSession(currentLayoutId, { isAutoAdvance: true });
    showInlineRoundToast(summaryResult);
  }

  function showAdaptiveSummaryModal(res) {
    // Intentionally completely removed per user request: No modal popups in Adaptive Practice
    if (typeof document === 'undefined') return;
    const existing = document.querySelector('.adaptive-complete-overlay');
    if (existing) existing.remove();
  }

  function exitSession(keepSummary = false) {
    if (typeof window !== 'undefined') window.adaptiveActive = false;
    activeSession = null;

    if (highlightedAdaptiveKeyId && typeof keyEls !== 'undefined' && keyEls[highlightedAdaptiveKeyId]) {
      keyEls[highlightedAdaptiveKeyId].classList.remove('lesson-target');
    }
    if (highlightedAdaptiveModId && typeof keyEls !== 'undefined' && keyEls[highlightedAdaptiveModId]) {
      keyEls[highlightedAdaptiveModId].classList.remove('modifier-target');
    }
    highlightedAdaptiveKeyId = null;
    highlightedAdaptiveModId = null;
    if (typeof setActiveFinger === 'function') setActiveFinger(null);

    if (typeof document !== 'undefined') {
      const panel = document.getElementById('adaptivePanel');
      const manuscript = document.getElementById('manuscript');
      if (panel) panel.hidden = true;
      if (manuscript) manuscript.hidden = false;

      if (!keepSummary) {
        const overlay = document.querySelector('.adaptive-complete-overlay');
        if (overlay) overlay.remove();
      }

      updateSidebarCard();
      if (typeof renderLessonStrip === 'function') renderLessonStrip();
    }
  }

  // DOM Event Bindings
  function initDOMBindings() {
    if (typeof document === 'undefined') return;

    const exitBtn = document.getElementById('adaptiveExitBtn');
    if (exitBtn) {
      exitBtn.addEventListener('click', () => exitSession(false));
    }

    const resetBtn = document.getElementById('adaptiveResetBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', async () => {
        const ok = (typeof templeConfirm === 'function')
          ? await templeConfirm('Reset Adaptive Practice progress for this layout? You will restart from the initial letters at 0% completion.', { title: 'Reset Adaptive Progress?', danger: true, confirmLabel: 'Yes, reset' })
          : confirm('Reset Adaptive Practice progress for this layout?');
        if (!ok) return;
        const activeL = (activeSession && activeSession.layoutId) || (typeof window !== 'undefined' && window.currentLayoutId) || (typeof currentLayoutId !== 'undefined' ? currentLayoutId : 'english');
        const l = normalizeLayout(activeL);
        resetAdaptiveState(l);
        renderLetterStrip(null, l);
        updateSidebarCard();
        startAdaptiveSession(l);
      });
    }

    const lshBtn = document.getElementById('lshAdaptiveBtn');
    if (lshBtn) {
      lshBtn.addEventListener('click', () => {
        const activeL = (activeSession && activeSession.layoutId) || (typeof window !== 'undefined' && window.currentLayoutId) || (typeof currentLayoutId !== 'undefined' ? currentLayoutId : 'english');
        startAdaptiveSession(activeL);
      });
    }

    const startBtn = document.getElementById('adaptiveStartBtn');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        const activeL = (activeSession && activeSession.layoutId) || (typeof window !== 'undefined' && window.currentLayoutId) || (typeof currentLayoutId !== 'undefined' ? currentLayoutId : 'english');
        startAdaptiveSession(activeL);
      });
    }

    updateSidebarCard();
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initDOMBindings);
    } else {
      initDOMBindings();
    }
  }

  // Expose global methods
  if (typeof window !== 'undefined') {
    window.adaptiveHandleChar = adaptiveHandleChar;
    window.adaptiveHandleBackspace = adaptiveHandleBackspace;
  }

  /* ============================================================
     EXPORTED API
     ============================================================ */
  const api = {
    PROGRESSIONS,
    INITIAL_ACTIVE_SETS,
    CONFIG,
    loadAdaptiveState,
    saveAdaptiveState,
    resetAdaptiveState,
    sanitizeAdaptiveState,
    getUnitState,
    getAllUnitsStatus,
    checkCanUnlockNext,
    unlockNextLetter,
    getValidWordsForUnlocked,
    generateAdaptiveDrill,
    recordStroke,
    completeAdaptiveSession,
    getVocabList,
    normalizeLayout,
    renderLetterStrip,
    updateSidebarCard,
    startAdaptiveSession,
    exitSession,
    adaptiveHandleChar,
    adaptiveHandleBackspace,
    showAdaptiveSummaryModal,
    evaluateWeaknesses,
    getWeakKeyFocus,
    resolveKeyAndFinger,
    getActiveSession: () => activeSession
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  global.PK_ADAPTIVE = api;

})(typeof window !== 'undefined' ? window : global);
