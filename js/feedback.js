/* ============================================================
   PK Khmer Type — Learner Feedback System (Real-Time Feedback)
   ============================================================
   Analyzes typing performance data collected by PK_TRACKER and
   turns it into immediate, actionable, and non-judgmental
   feedback during active lessons, at lesson completion, and
   upon early lesson exit.
   100% offline, privacy-first, zero network telemetry.
   ============================================================ */

(function(global){
  'use strict';

  // Finger names mapping for educational feedback
  const FINGER_DISPLAY_NAMES = {
    lp: 'Left Pinky',
    lr: 'Left Ring',
    lm: 'Left Middle',
    li: 'Left Index',
    lt: 'Left Thumb',
    rt: 'Right Thumb',
    ri: 'Right Index',
    rm: 'Right Middle',
    rr: 'Right Ring',
    rp: 'Right Pinky',
    thumb: 'Thumb'
  };

  function safeIcon(id, size = 14) {
    if (typeof pkIcon === 'function') return pkIcon(id, size);
    return '';
  }

  // Khmer compound and special characters dictionary for meaningful feedback
  const KHMER_SPECIAL_UNITS = {
    'ុំ': { name: 'Compound Vowel ុំ', category: 'compound-vowel', desc: 'Sra U + Nikahit' },
    'ុះ': { name: 'Compound Vowel ុះ', category: 'compound-vowel', desc: 'Sra U + Reahmuk' },
    'ាំ': { name: 'Compound Vowel ាំ', category: 'compound-vowel', desc: 'Sra Aa + Nikahit' },
    'េះ': { name: 'Compound Vowel េះ', category: 'compound-vowel', desc: 'Sra E + Reahmuk' },
    'ោះ': { name: 'Compound Vowel ោះ', category: 'compound-vowel', desc: 'Sra O + Reahmuk' },
    '្': { name: 'Subscript Key ្ (Coeng / J)', category: 'subscript-sign', desc: 'Forms consonant clusters' },
    '់': { name: 'Bantoc ់', category: 'diacritic', desc: 'Final shortener stop' },
    '៉': { name: 'Muusikatoan ៉', category: 'diacritic', desc: 'Consonant shifter' },
    '៊': { name: 'Triisap ៊', category: 'diacritic', desc: 'Consonant shifter' },
    '័': { name: 'Samiyok Sanna ័', category: 'diacritic', desc: 'Short vowel diacritic' },
    '៍': { name: 'Tandakhât ៍', category: 'diacritic', desc: 'Silent final letter mark' },
    '៏': { name: 'Asda ៏', category: 'diacritic', desc: 'Emphasis marker' },
    '៌': { name: 'Robat ៌', category: 'diacritic', desc: 'Top repha diacritic' },
    '៛': { name: 'Riel Currency ៛', category: 'currency', desc: 'Khmer currency sign' },
    '។': { name: 'Khan Full Stop ។', category: 'punctuation', desc: 'Khmer sentence end' },
    '៕': { name: 'Bariyoosan ៕', category: 'punctuation', desc: 'Chapter / text end mark' },
    'ៗ': { name: 'Lek To ៗ', category: 'diacritic', desc: 'Word duplication mark' },
    '៖': { name: 'Camnoc Pii Kuuh ៖', category: 'punctuation', desc: 'Colon mark' }
  };

  function formatFingerName(f){
    return FINGER_DISPLAY_NAMES[f] || 'Finger';
  }

  function formatUnitName(unit, layoutId){
    if(!unit) return 'None';
    if(unit === ' ') return 'Space';
    if(unit === '\u200B') return 'Zero-Width Space';

    const l = (layoutId || 'nida').toLowerCase();

    // 1. Check special Khmer units
    if(KHMER_SPECIAL_UNITS[unit]){
      return KHMER_SPECIAL_UNITS[unit].name;
    }

    // Coeng foot units (subscript consonants)
    if(unit.startsWith('្') && unit.length > 1){
      const baseChar = unit.slice(1);
      return `Subscript Foot ${unit} (Coeng + ${baseChar})`;
    }

    // 2. Check catalog metadata if available
    if(typeof global.PK_REVIEW !== 'undefined' && typeof global.PK_REVIEW.getCharacterMeta === 'function'){
      const meta = global.PK_REVIEW.getCharacterMeta(l, unit);
      if(meta){
        if(meta.name && meta.nameKm){
          return `${meta.type === 'consonant' ? 'Consonant' : meta.type === 'vowel' || meta.type === 'dependent-vowel' ? 'Vowel' : ''} ${meta.char} (${meta.name})`;
        }
        if(meta.name){
          return `${meta.char} (${meta.name})`;
        }
      }
    }

    // 3. English classifications
    const PUNC_NAMES = {
      '.': 'Period',
      ',': 'Comma',
      ';': 'Semicolon',
      ':': 'Colon',
      '!': 'Exclamation Mark',
      '?': 'Question Mark',
      "'": 'Apostrophe',
      '"': 'Quote',
      '-': 'Hyphen'
    };

    if(l === 'english' || /^[a-zA-Z0-9\s.,!?:;'"\-+=\[\]{}()\/\\_<>`~]$/.test(unit)){
      if(/[A-Z]/.test(unit)) return `Capital '${unit}' (Shift)`;
      if(/[a-z]/.test(unit)) return `Letter '${unit}'`;
      if(/[0-9]/.test(unit)) return `Number '${unit}'`;
      if(PUNC_NAMES[unit]) return `${PUNC_NAMES[unit]} ${unit}`;
      if(/[.,!?:;'"\-]/.test(unit)) return `Punctuation '${unit}'`;
      if(/[\-+=\[\]{}()\/\\_<>`~]/.test(unit)) return `Symbol '${unit}'`;
    }

    return `"${unit}"`;
  }

  /* ============================================================
     1. REAL-TIME HINT ENGINE
     ============================================================ */

  /**
   * Generates a subtle, non-judgmental live hint during an active lesson.
   * STRICT RULE: Never flags a problem on a single mistake.
   * Requires repeated evidence (>= 2 mistakes on key/unit, >= 3 on finger).
   */
  function getRealTimeHint(metrics){
    if(!metrics || !metrics.active) return null;
    if(metrics.mistakeCount < 2) return null;

    // Check most missed key
    if(metrics.mostMissedKey){
      const k = typeof metrics.mostMissedKey === 'object' ? metrics.mostMissedKey.key : metrics.mostMissedKey;
      const displayKey = k.length === 1 ? k.toUpperCase() : k;
      const count = (typeof metrics.mostMissedKey === 'object' && metrics.mostMissedKey.count) || (metrics.keyMistakes && metrics.keyMistakes[k]) || 2;
      return `Tip: Key ${displayKey} has caused ${count} mistakes in this lesson.`;
    }

    // Check most missed unit
    if(metrics.mostMissedUnit){
      const u = typeof metrics.mostMissedUnit === 'object' ? metrics.mostMissedUnit.unit : metrics.mostMissedUnit;
      if(u && u !== ' '){
        const uName = formatUnitName(u, metrics.layoutId);
        const count = (typeof metrics.mostMissedUnit === 'object' && metrics.mostMissedUnit.count) || (metrics.unitMistakes && metrics.unitMistakes[u]) || 2;
        return `Tip: ${uName} has caused ${count} mistakes in this lesson.`;
      }
    }

    // Check finger concentration
    if(metrics.difficultFinger){
      const fName = formatFingerName(metrics.difficultFinger.finger);
      return `Tip: Steady your hand on ${fName} (${metrics.difficultFinger.pct}% of mistakes).`;
    }

    // High backspace correction count
    if(metrics.backspaceCount >= 4 && metrics.position > 5){
      return `Tip: Pace yourself smoothly to reduce backspace corrections.`;
    }

    return null;
  }

  /* ============================================================
     2. POST-LESSON PERFORMANCE & WEAKNESS ANALYSIS
     ============================================================ */

  /**
   * Analyzes completed or active lesson metrics to produce a comprehensive
   * learner feedback summary object.
   */
  function analyzeLesson(metrics, lessonDef, layoutId){
    const lId = (layoutId || (metrics && metrics.layoutId) || 'nida').toLowerCase();
    const def = lessonDef || {};
    const threshold = def.threshold || 85;

    // Base performance numbers
    const totalUnits = metrics?.totalUnits || 0;
    const correctCount = metrics?.correctCount || 0;
    const mistakeCount = metrics?.mistakeCount || 0;
    const backspaceCount = metrics?.backspaceCount || 0;
    const correctedCount = metrics?.correctedCount || 0;
    const accuracy = metrics?.accuracy !== undefined ? metrics.accuracy : (totalUnits > 0 ? Math.round((correctCount / (correctCount + mistakeCount)) * 100) : 100);
    const wpm = metrics?.wpm || 0;
    const activeTimeSec = metrics?.activeTypingDurationSec || 0;
    const bestStreak = metrics?.bestStreak || 0;
    const avgResponseTimeMs = metrics?.avgResponseTimeMs || 300;

    // 1. WHAT WENT WELL
    const strongestKeys = [];
    const keyAttempts = metrics?.keyAttempts || {};
    Object.keys(keyAttempts).forEach(k => {
      const ka = keyAttempts[k];
      if(ka && ka.attempts >= 2 && ka.mistakes === 0){
        const avgTime = Math.round(ka.totalTimeMs / ka.attempts);
        strongestKeys.push({ key: k, attempts: ka.attempts, avgTimeMs: avgTime });
      }
    });
    strongestKeys.sort((a, b) => b.attempts - a.attempts);

    const strongestUnits = [];
    const unitAttempts = metrics?.unitAttempts || {};
    Object.keys(unitAttempts).forEach(u => {
      const ua = unitAttempts[u];
      if(ua && ua.attempts >= 2 && ua.mistakes === 0 && u !== ' '){
        strongestUnits.push({ unit: u, name: formatUnitName(u, lId), attempts: ua.attempts });
      }
    });
    strongestUnits.sort((a, b) => b.attempts - a.attempts);

    const highAccuracyExercises = [];
    const difficultExercises = [];
    const exerciseStats = metrics?.exerciseStats || {};
    Object.keys(exerciseStats).forEach(eid => {
      const es = exerciseStats[eid];
      if(es.totalUnits > 0){
        if(es.accuracy >= 90){
          highAccuracyExercises.push(es);
        } else if(es.accuracy < threshold || es.mistakes >= 2){
          difficultExercises.push(es);
        }
      }
    });

    // Highlights list
    const highlights = [];
    if(accuracy === 100){
      highlights.push('Flawless 100% accuracy throughout the lesson!');
    } else if(accuracy >= 95){
      highlights.push(`Exceptional accuracy of ${accuracy}%!`);
    } else if(accuracy >= threshold){
      highlights.push(`Target accuracy achieved (${accuracy}% vs ${threshold}% required).`);
    }

    if(bestStreak >= 15){
      highlights.push(`Longest rhythm streak: ${bestStreak} consecutive correct units.`);
    }

    if(strongestKeys.length >= 3){
      const top3 = strongestKeys.slice(0, 3).map(k => k.key.toUpperCase()).join(', ');
      highlights.push(`100% precision on keys: ${top3}.`);
    }

    if(backspaceCount === 0 && totalUnits > 10){
      highlights.push('Zero backspaces used — confident forward rhythm!');
    } else if(correctedCount > 0 && mistakeCount > 0){
      highlights.push(`Good self-correction: corrected ${correctedCount} errors with Backspace.`);
    }

    // 2. WHAT NEEDS PRACTICE
    // RULE: Use repeated evidence. Never flag a key with only 1 mistake as weak!
    const weakKeys = [];
    const keyMistakes = metrics?.keyMistakes || {};
    Object.keys(keyMistakes).forEach(k => {
      const cnt = keyMistakes[k];
      if(cnt >= 2){
        const ka = keyAttempts[k] || { attempts: cnt, correct: 0 };
        const acc = ka.attempts > 0 ? Math.round((ka.correct / ka.attempts) * 100) : 0;
        weakKeys.push({ key: k, mistakes: cnt, attempts: ka.attempts, accuracy: acc });
      }
    });
    weakKeys.sort((a, b) => b.mistakes - a.mistakes);

    const weakUnits = [];
    const unitMistakes = metrics?.unitMistakes || {};
    Object.keys(unitMistakes).forEach(u => {
      const cnt = unitMistakes[u];
      if(cnt >= 2){
        const ua = unitAttempts[u] || { attempts: cnt, correct: 0 };
        const acc = ua.attempts > 0 ? Math.round((ua.correct / ua.attempts) * 100) : 0;
        weakUnits.push({
          unit: u,
          name: formatUnitName(u, lId),
          mistakes: cnt,
          attempts: ua.attempts,
          accuracy: acc
        });
      }
    });
    weakUnits.sort((a, b) => b.mistakes - a.mistakes);

    // Slow keys: avg response time > 1.8x lesson average (min 3 attempts)
    const slowKeys = [];
    Object.keys(keyAttempts).forEach(k => {
      const ka = keyAttempts[k];
      if(ka && ka.attempts >= 3){
        const kAvg = Math.round(ka.totalTimeMs / ka.attempts);
        if(kAvg > Math.max(500, avgResponseTimeMs * 1.8)){
          const ratio = Math.round((kAvg / Math.max(1, avgResponseTimeMs)) * 10) / 10;
          slowKeys.push({ key: k, avgTimeMs: kAvg, lessonAvgMs: avgResponseTimeMs, ratio });
        }
      }
    });
    slowKeys.sort((a, b) => b.ratio - a.ratio);

    // Finger groups with repeated mistakes
    const weakFingers = [];
    const fingerMistakes = metrics?.fingerMistakes || {};
    if(mistakeCount >= 3){
      Object.keys(fingerMistakes).forEach(f => {
        const cnt = fingerMistakes[f];
        const pct = Math.round((cnt / mistakeCount) * 100);
        if(cnt >= 3 && pct >= 35){
          weakFingers.push({
            finger: f,
            name: formatFingerName(f),
            mistakes: cnt,
            pct: pct
          });
        }
      });
      weakFingers.sort((a, b) => b.mistakes - a.mistakes);
    }

    const shiftMistakes = metrics?.shiftMistakes || 0;

    // 3. DATA-BACKED NEXT STEP RECOMMENDATION
    let recommendationText = '';
    let recommendationAction = 'next'; // 'next', 'review', 'retry'

    if(shiftMistakes >= 3){
      recommendationAction = (accuracy < threshold) ? 'retry' : 'review';
      recommendationText = `Shift coordination caused ${shiftMistakes} mistakes. Hold Shift before pressing the character key.`;
    } else if(accuracy < threshold){
      recommendationAction = 'retry';
      if(weakKeys.length > 0){
        recommendationText = `Review this lesson to strengthen ${weakKeys.slice(0, 2).map(k => k.key.toUpperCase()).join(' and ')} before moving forward.`;
      } else {
        recommendationText = `Accuracy was ${accuracy}% (minimum ${threshold}% required). Practice this lesson again to unlock the next level.`;
      }
    } else if(weakUnits.some(u => KHMER_SPECIAL_UNITS[u.unit])){
      recommendationAction = 'review';
      const special = weakUnits.find(u => KHMER_SPECIAL_UNITS[u.unit]);
      recommendationText = `Take time on ${special.name}. Mastering modifier combinations will boost your typing fluency.`;
    } else if(weakKeys.length >= 2){
      recommendationAction = 'review';
      const top2 = weakKeys.slice(0, 2).map(k => k.key.toUpperCase()).join(' and ');
      recommendationText = `Focus on ${top2} in the review drill to eliminate hesitation.`;
    } else if(weakFingers.length > 0){
      recommendationAction = 'next';
      recommendationText = `${weakFingers[0].name} produced ${weakFingers[0].pct}% of errors. Keep fingers lightly rested on home keys.`;
    } else if(slowKeys.length > 0){
      recommendationAction = 'next';
      recommendationText = `Your accuracy is high, but key ${slowKeys[0].key.toUpperCase()} slowed your pace (${slowKeys[0].ratio}× average time).`;
    } else {
      recommendationAction = 'next';
      recommendationText = `Strong accuracy and rhythm! You are ready for the next lesson.`;
    }

    // Exercise section breakdown array
    const exerciseBreakdown = Object.keys(exerciseStats).map(eid => {
      const es = exerciseStats[eid];
      return {
        id: es.id,
        title: es.title || es.id,
        type: es.type || 'drill',
        totalUnits: es.totalUnits,
        correct: es.correct,
        mistakes: es.mistakes,
        accuracy: es.accuracy
      };
    });

    let historyComparison = null;
    const progressApi = (typeof window !== 'undefined' && window.PK_PROGRESS) || (typeof global !== 'undefined' && global.PK_PROGRESS);
    if(progressApi && typeof progressApi.compareWithHistory === 'function'){
      historyComparison = progressApi.compareWithHistory(lId, def.id || (metrics && metrics.lessonId), { accuracy, wpm, timeSec: activeTimeSec });
    }

    return {
      lessonId: def.id || (metrics && metrics.lessonId),
      layout: lId,
      threshold,
      completed: true,
      performance: {
        accuracy,
        wpm,
        totalUnits,
        correctUnits: correctCount,
        mistakes: mistakeCount,
        backspaces: backspaceCount,
        correctedMistakes: correctedCount,
        activeTimeSec,
        bestStreak,
        avgResponseTimeMs
      },
      wentWell: {
        strongestKeys,
        strongestUnits,
        highAccuracyExercises,
        longestStreak: bestStreak,
        highlights
      },
      needsPractice: {
        weakKeys,
        weakUnits,
        slowKeys,
        weakFingers,
        shiftMistakes,
        difficultExercises
      },
      recommendation: {
        text: recommendationText,
        action: recommendationAction
      },
      exerciseBreakdown,
      historyComparison
    };
  }

  /* ============================================================
     3. INCOMPLETE LESSON (WHAT THE USER MISSED)
     ============================================================ */

  /**
   * Generates a structured summary when a learner pauses or exits a lesson early.
   * Reports exactly what was completed vs what remains unfinished.
   */
  function analyzeIncompleteLesson(metrics, lessonDef, layoutId){
    const lId = (layoutId || (metrics && metrics.layoutId) || 'nida').toLowerCase();
    const def = lessonDef || {};
    const totalUnits = metrics?.totalUnits || 0;
    const position = metrics?.position || 0;
    const remainingUnits = Math.max(0, totalUnits - position);
    const completionPct = totalUnits > 0 ? Math.round((position / totalUnits) * 100) : 0;
    const mistakesSoFar = metrics?.mistakeCount || 0;
    const lastExpected = metrics?.lastExpectedUnit || null;
    const lastExpectedName = formatUnitName(lastExpected, lId);

    const sections = metrics?.sections || [];
    const completedSections = [];
    const remainingSections = [];

    sections.forEach(s => {
      if(position > s.endIndex){
        completedSections.push(s);
      } else {
        remainingSections.push(s);
      }
    });

    const message = `You completed ${completionPct}% of this lesson (${position}/${totalUnits} typing units). ${remainingUnits} units remain.`;

    return {
      lessonId: def.id || (metrics && metrics.lessonId),
      layout: lId,
      completed: false,
      completionPct,
      completedUnits: position,
      totalUnits,
      remainingUnits,
      mistakesSoFar,
      lastExpectedUnit: lastExpected,
      lastExpectedName,
      completedSections,
      remainingSections,
      message
    };
  }

  /* ============================================================
     4. UI MODAL GENERATION & RENDERING
     ============================================================ */

  /**
   * Builds the rich post-lesson feedback card HTML with 3 clear sections:
   * 1. Performance Grid (Accuracy, WPM, Units, Mistakes, Fixes, Streak)
   * 2. What Went Well & What Needs Practice
   * 3. Next Step Recommendation
   */
  function buildPostLessonCardHtml(summary, def, isNewBest, prevLesson, nextLesson){
    const p = summary.performance;
    const w = summary.wentWell;
    const np = summary.needsPractice;
    const rec = summary.recommendation;
    const threshold = summary.threshold || 85;
    const passed = p.accuracy >= threshold;

    const heading = (p.accuracy === 100) ? 'Flawless Lesson!'
      : (isNewBest) ? 'New Personal Best!'
      : (passed) ? 'Lesson Complete'
      : 'Keep Practicing';

    const headingColor = (p.accuracy === 100) ? '#64d2ff'
      : (passed) ? 'var(--gold-bright)'
      : '#ff6b81';

    // HTML chips for weak keys
    let weakChipsHtml = '';
    if(np.weakKeys.length > 0 || np.weakUnits.length > 0){
      const items = [];
      np.weakKeys.forEach(k => {
        items.push(`<span class="pk-fb-chip warn"><b>${k.key.toUpperCase()}</b> <small>${k.mistakes}×</small></span>`);
      });
      np.weakUnits.forEach(u => {
        if(!np.weakKeys.some(k => k.key === u.unit)){
          items.push(`<span class="pk-fb-chip warn"><b>${u.unit}</b> <small>${u.mistakes}×</small></span>`);
        }
      });
      weakChipsHtml = items.slice(0, 6).join(' ');
    } else {
      weakChipsHtml = `<span class="pk-fb-empty">No recurring mistakes detected!</span>`;
    }

    // HTML chips for strong keys
    let strongChipsHtml = '';
    if(w.strongestKeys.length > 0){
      strongChipsHtml = w.strongestKeys.slice(0, 6).map(k => {
        return `<span class="pk-fb-chip good"><b>${k.key.toUpperCase()}</b> <small>100%</small></span>`;
      }).join(' ');
    } else {
      strongChipsHtml = `<span class="pk-fb-empty">Keep practicing to build key consistency.</span>`;
    }

    // Finger feedback notice
    let fingerNoticeHtml = '';
    if(np.weakFingers.length > 0){
      const wf = np.weakFingers[0];
      fingerNoticeHtml = `<div class="pk-fb-finger-note"><svg class="pk-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> ${wf.name} produced ${wf.pct}% of your mistakes (${wf.mistakes} errors).</div>`;
    }

    // Exercise breakdown rows
    let exercisesHtml = '';
    if(summary.exerciseBreakdown.length > 1){
      exercisesHtml = `
      <div class="pk-fb-section-breakdown">
        <span class="pk-fb-subhead">Section Performance</span>
        <div class="pk-fb-exercise-bars">
          ${summary.exerciseBreakdown.map((ex, idx) => `
            <div class="pk-fb-ex-row">
              <span class="pk-fb-ex-name">Sec ${idx + 1}: ${ex.title}</span>
              <div class="pk-fb-ex-track">
                <div class="pk-fb-ex-fill ${ex.accuracy < threshold ? 'warn' : ''}" style="width:${ex.accuracy}%"></div>
              </div>
              <span class="pk-fb-ex-acc">${ex.accuracy}%</span>
            </div>
          `).join('')}
        </div>
      </div>`;
    }

    // Trend feedback notice from Phase 7 history comparison
    let trendHtml = '';
    if(summary.historyComparison && summary.historyComparison.hasHistory){
      const hc = summary.historyComparison;
      const icon = hc.trend === 'improving' ? safeIcon('trending-up', 12) : (hc.trend === 'declining' ? safeIcon('trending-down', 12) : safeIcon('arrow-right', 12));
      trendHtml = `
      <div class="pk-fb-trend-row ${hc.trend}">
        <span class="pk-fb-trend-badge">${icon} Attempt #${hc.totalAttempts}</span>
        <span class="pk-fb-trend-text">${hc.message}</span>
      </div>`;
    }

    return `
    <div class="lesson-complete-card pk-fb-complete-card">
      <div class="pk-fb-header">
        <h2 style="color:${headingColor}">${heading}</h2>
        <p class="pk-fb-lesson-title">${def.title || 'Lesson'}</p>
      </div>

      ${trendHtml}

      <!-- PERFORMANCE GRID -->
      <div class="pk-fb-perf-grid">
        <div class="pk-fb-stat-box highlight">
          <span class="val">${p.accuracy}%</span>
          <span class="lbl">Accuracy</span>
        </div>
        <div class="pk-fb-stat-box">
          <span class="val">${p.wpm}</span>
          <span class="lbl">WPM</span>
        </div>
        <div class="pk-fb-stat-box">
          <span class="val">${p.activeTimeSec}s</span>
          <span class="lbl">Active Time</span>
        </div>
        <div class="pk-fb-stat-box">
          <span class="val">${p.correctUnits}/${p.totalUnits}</span>
          <span class="lbl">Completed</span>
        </div>
        <div class="pk-fb-stat-box ${p.mistakes > 0 ? 'has-err' : ''}">
          <span class="val">${p.mistakes}</span>
          <span class="lbl">Mistakes</span>
        </div>
        <div class="pk-fb-stat-box">
          <span class="val">${p.backspaces}</span>
          <span class="lbl">Fixes (⌫)</span>
          <span class="lbl">Fixes (${safeIcon('backspace', 11)})</span>
        </div>
      </div>

      <!-- WHAT WENT WELL & WHAT NEEDS PRACTICE -->
      <div class="pk-fb-insights-row">
        <div class="pk-fb-insight-col">
          <span class="pk-fb-subhead good"><svg class="pk-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> What Went Well</span>
          <div class="pk-fb-chip-group">${strongChipsHtml}</div>
        </div>

        <div class="pk-fb-insight-col">
          <span class="pk-fb-subhead warn"><svg class="pk-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Needs Practice</span>
          <div class="pk-fb-chip-group">${weakChipsHtml}</div>
        </div>
      </div>

      ${fingerNoticeHtml}
      ${exercisesHtml}

      <!-- NEXT STEP RECOMMENDATION -->
      <div class="pk-fb-rec-banner ${rec.action}">
        <span class="pk-fb-rec-icon"><svg class="pk-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg></span>
        <div class="pk-fb-rec-content">
          <b>Next Step:</b> ${rec.text}
        </div>
      </div>

      <!-- ACTIONS -->
      <div class="lesson-complete-actions pk-fb-actions">
        ${p.mistakes > 0 ? '<button class="lc-mistakes primary">⟲ Review Mistakes</button>' : ''}
        ${prevLesson ? '<button class="lc-prev">← Previous</button>' : ''}
        <button class="lc-retry">↻ Retry</button>
        ${nextLesson ? '<button class="lc-next' + (p.mistakes === 0 ? ' primary' : '') + '">Next Lesson →</button>' : '<button class="lc-close primary">Close</button>'}
        ${p.mistakes > 0 ? `<button class="lc-mistakes primary">${safeIcon('target', 14)} Review Mistakes</button>` : ''}
        ${prevLesson ? `<button class="lc-prev">${safeIcon('arrow-left', 14)} Previous</button>` : ''}
        <button class="lc-retry">${safeIcon('reset', 14)} Retry</button>
        ${nextLesson ? `<button class="lc-next${(p.mistakes === 0 ? ' primary' : '')}">Next Lesson ${safeIcon('arrow-right', 14)}</button>` : '<button class="lc-close primary">Close</button>'}
        ${nextLesson ? '<button class="lc-close">Close</button>' : ''}
      </div>
    </div>`;
  }

  /**
   * Builds the Incomplete Lesson (Lesson Paused) modal HTML.
   */
  function buildIncompleteLessonHtml(inc, def){
    return `
    <div class="lesson-complete-card pk-fb-paused-card">
      <div class="pk-fb-header">
        <h2 style="color:var(--gold-bright)">Lesson Paused</h2>
        <p class="pk-fb-lesson-title">${def?.title || 'Lesson'}</p>
      </div>

      <div class="pk-fb-pause-progress">
        <div class="pk-fb-pause-bar">
          <div class="pk-fb-pause-fill" style="width:${inc.completionPct}%"></div>
        </div>
        <div class="pk-fb-pause-meta">
          <span>${inc.completionPct}% Completed</span>
          <span>${inc.remainingUnits} units remaining</span>
        </div>
      </div>

      <div class="pk-fb-pause-details">
        <div class="pk-fb-pause-row">
          <span>Completed Units:</span>
          <b>${inc.completedUnits} of ${inc.totalUnits}</b>
        </div>
        <div class="pk-fb-pause-row">
          <span>Mistakes so far:</span>
          <b>${inc.mistakesSoFar}</b>
        </div>
        ${inc.lastExpectedUnit ? `
        <div class="pk-fb-pause-row">
          <span>Last character reached:</span>
          <b>${inc.lastExpectedName}</b>
        </div>` : ''}
        ${inc.remainingSections.length > 0 ? `
        <div class="pk-fb-pause-row">
          <span>Remaining sections:</span>
          <b>${inc.remainingSections.map(s => s.title || s.type).join(', ')}</b>
        </div>` : ''}
      </div>

      <div class="pk-fb-rec-banner review">
        <div class="pk-fb-rec-content">
          ${inc.message}
        </div>
      </div>

      <div class="lesson-complete-actions pk-fb-actions">
        <button class="lc-resume primary">▶ Resume Lesson</button>
        <button class="lc-retry">↻ Restart</button>
        <button class="lc-resume primary">${safeIcon('play', 14)} Resume Lesson</button>
        <button class="lc-retry">${safeIcon('reset', 14)} Restart</button>
        <button class="lc-exit-confirm secondary">Exit to Course</button>
      </div>
    </div>`;
  }

  /* Public API */
  const api = {
    formatFingerName,
    formatUnitName,
    getRealTimeHint,
    analyzeLesson,
    analyzeIncompleteLesson,
    buildPostLessonCardHtml,
    buildIncompleteLessonHtml
  };

  global.PK_FEEDBACK = api;

})(typeof window !== 'undefined' ? window : global);
