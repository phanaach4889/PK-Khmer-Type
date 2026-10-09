(() => {
  'use strict';

  /* ============================================================
     PK Khmer Type — Launch Page Interactive Keyboard Deck & Engine
     ============================================================ */

  const root = new URL('../', window.location.href);
  const assetUrl = (path) => new URL(path, root).href;

  const layouts = {
    standard: { label: 'Khmer Standard', course: 'standard', deckId: 'STANDARD' },
    nida: { label: 'Khmer NiDA', course: 'nida', deckId: 'NiDA' },
    english: { label: 'English (US)', course: 'english', deckId: 'ENGLISH' },
  };

  const state = {
    data: null,
    layout: 'standard',
    layer: 'base',
    physicalLayer: null,
    practiceLayout: 'standard',
    sequence: '',
    cursor: 0,
    attempts: 0,
    mistakes: 0,
    typed: '',
    currentKeyId: null,
    soundOn: true,
    motionOff: false,
  };

  const byId = (id) => document.getElementById(id);
  const boardWrap = byId('boardWrap');
  const keyboard = byId('keyboard');
  const chassisLayoutLabel = byId('chassisLayoutLabel');
  const exercisePrompt = byId('exercise-prompt');
  const exerciseEntry = byId('exercise-entry');
  const inspectorGlyph = byId('inspector-glyph');
  const inspectorCode = byId('inspector-code');
  const inspectorName = byId('inspector-name');
  const inspectorLayer = byId('inspector-layer');
  const inspectorShift = byId('inspector-shift');
  const inspectorFinger = byId('inspector-finger');

  /* Physical keyboard code map matching app engine */
  const CODE_MAP = {
    Backquote: 'grave', Digit1: 'k1', Digit2: 'k2', Digit3: 'k3', Digit4: 'k4', Digit5: 'k5',
    Digit6: 'k6', Digit7: 'k7', Digit8: 'k8', Digit9: 'k9', Digit0: 'k0',
    Minus: 'minus', Equal: 'equal', Backspace: 'backspace',
    Tab: 'tab', KeyQ: 'q', KeyW: 'w', KeyE: 'e', KeyR: 'r', KeyT: 't', KeyY: 'y', KeyU: 'u',
    KeyI: 'i', KeyO: 'o', KeyP: 'p', BracketLeft: 'bracketL', BracketRight: 'bracketR', Enter: 'enter',
    CapsLock: 'caps', KeyA: 'a', KeyS: 's', KeyD: 'd', KeyF: 'f', KeyG: 'g', KeyH: 'h', KeyJ: 'j',
    KeyK: 'k', KeyL: 'l', Semicolon: 'semicolon', Quote: 'quote', Backslash: 'backslash',
    ShiftLeft: 'shiftL', ShiftRight: 'shiftR', KeyZ: 'z', KeyX: 'x', KeyC: 'c', KeyV: 'v', KeyB: 'b',
    KeyN: 'n', KeyM: 'm', Comma: 'comma', Period: 'period', Slash: 'slash',
    ControlLeft: 'ctrlL', ControlRight: 'ctrlR', AltLeft: 'alt', AltRight: 'altgr', Space: 'space',
  };

  const FINGER_MAP = {
    grave: 'Left Pinky', k1: 'Left Pinky', tab: 'Left Pinky', q: 'Left Pinky', caps: 'Left Pinky', a: 'Left Pinky', shiftL: 'Left Pinky', z: 'Left Pinky', ctrlL: 'Left Pinky',
    k2: 'Left Ring', w: 'Left Ring', s: 'Left Ring', x: 'Left Ring',
    k3: 'Left Middle', e: 'Left Middle', d: 'Left Middle', c: 'Left Middle',
    k4: 'Left Index', k5: 'Left Index', r: 'Left Index', t: 'Left Index', f: 'Left Index', g: 'Left Index', v: 'Left Index', b: 'Left Index',
    space: 'Left / Right Thumb', alt: 'Left Thumb',
    k6: 'Right Index', k7: 'Right Index', y: 'Right Index', u: 'Right Index', h: 'Right Index', j: 'Right Index', n: 'Right Index', m: 'Right Index',
    k8: 'Right Middle', i: 'Right Middle', k: 'Right Middle', comma: 'Right Middle',
    k9: 'Right Ring', o: 'Right Ring', l: 'Right Ring', period: 'Right Ring',
    k0: 'Right Pinky', minus: 'Right Pinky', equal: 'Right Pinky', backspace: 'Right Pinky',
    p: 'Right Pinky', bracketL: 'Right Pinky', bracketR: 'Right Pinky', enter: 'Right Pinky',
    semicolon: 'Right Pinky', quote: 'Right Pinky', backslash: 'Right Pinky',
    shiftR: 'Right Pinky', slash: 'Right Pinky', extra: 'Right Pinky',
    altgr: 'Right Thumb / Pinky', ctrlR: 'Right Pinky',
  };

  const KHMER_NAMES = {
    'ក': 'Khmer Consonant Ka', 'ខ': 'Khmer Consonant Kha', 'គ': 'Khmer Consonant Ko', 'ឃ': 'Khmer Consonant Kho', 'ង': 'Khmer Consonant Ngo',
    'ច': 'Khmer Consonant Ca', 'ឆ': 'Khmer Consonant Cha', 'ជ': 'Khmer Consonant Co', 'ឈ': 'Khmer Consonant Cho', 'ញ': 'Khmer Consonant Nyo',
    'ដ': 'Khmer Consonant Da', 'ឋ': 'Khmer Consonant Ththe', 'ឌ': 'Khmer Consonant Do', 'ឍ': 'Khmer Consonant Tho', 'ណ': 'Khmer Consonant Nno',
    'ត': 'Khmer Consonant Ta', 'ថ': 'Khmer Consonant Tha', 'ទ': 'Khmer Consonant To', 'ធ': 'Khmer Consonant Tho', 'ន': 'Khmer Consonant No',
    'ប': 'Khmer Consonant Ba', 'ផ': 'Khmer Consonant Pha', 'ព': 'Khmer Consonant Po', 'ភ': 'Khmer Consonant Pho', 'ម': 'Khmer Consonant Mo',
    'យ': 'Khmer Consonant Yo', 'រ': 'Khmer Consonant Ro', 'ល': 'Khmer Consonant Lo', 'វ': 'Khmer Consonant Vo', 'ស': 'Khmer Consonant Sa',
    'ហ': 'Khmer Consonant Ha', 'ឡ': 'Khmer Consonant La', 'អ': 'Khmer Consonant Qa',
    'ា': 'Vowel Aa', 'ិ': 'Vowel I', 'ី': 'Vowel Ii', 'ឹ': 'Vowel Y', 'ឺ': 'Vowel Yy', 'ុ': 'Vowel U', 'ូ': 'Vowel Uu',
    'ួ': 'Vowel Ua', 'ើ': 'Vowel Oe', 'ឿ': 'Vowel Ya', 'ៀ': 'Vowel Ie', 'េ': 'Vowel E', 'ែ': 'Vowel Ae', 'ៃ': 'Vowel Ai',
    'ោ': 'Vowel Oo', 'ៅ': 'Vowel Au', 'ុំ': 'Vowel Um', 'ំ': 'Sign Nikahit', 'ះ': 'Sign Reahmuk', 'ុះ': 'Vowel Uh',
    'េះ': 'Vowel Eh', 'ោះ': 'Vowel Oh', 'ាំ': 'Vowel Aam',
    '្': 'Subscript Sign (Coeng)', '់': 'Bantoc Mark', '៉': 'Muusikatoan Mark', '៊': 'Triisap Mark', '៍': 'Tandakhiat Mark',
    '័': 'Sanhyoak Sannya', '៏': 'Ahsda Mark', '៌': 'Robat Mark', '៎': 'Kakabat Mark', '៝': 'Atthacan Mark',
    '។': 'Khan (Full Stop)', '៕': 'Bariyoosan', '៖': 'Camnuc Pii Kuuh (Colon)', 'ៗ': 'Lek To (Duplicate)',
    '៛': 'Khmer Riel Sign', '៚': 'Koyuutika (Ending)', '៙': 'Phnek Kkla (Beginning)',
    '០': 'Khmer Digit 0', '១': 'Khmer Digit 1', '២': 'Khmer Digit 2', '៣': 'Khmer Digit 3', '៤': 'Khmer Digit 4',
    '៥': 'Khmer Digit 5', '៦': 'Khmer Digit 6', '៧': 'Khmer Digit 7', '៨': 'Khmer Digit 8', '៩': 'Khmer Digit 9',
    'ឥ': 'Indep. Vowel Qi', 'ឦ': 'Indep. Vowel Qii', 'ឧ': 'Indep. Vowel Qu', 'ឩ': 'Indep. Vowel Quu', 'ឪ': 'Indep. Vowel Qov',
    'ឫ': 'Indep. Vowel Ry', 'ឬ': 'Indep. Vowel Ryy', 'ឭ': 'Indep. Vowel Ly', 'ឮ': 'Indep. Vowel Lyy', 'ឯ': 'Indep. Vowel Qe',
    'ឰ': 'Indep. Vowel Qai', 'ឱ': 'Indep. Vowel Qoo', 'ឲ': 'Indep. Vowel Qau',
  };

  /* ---------- Web Audio Procedural Mechanical Switch Synthesizer ---------- */
  let audioCtx = null;

  function ensureAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playClick(kind = 'down') {
    if (!state.soundOn) return;
    try {
      ensureAudio();
      if (!audioCtx) return;
      const t = audioCtx.currentTime;
      const isDown = kind === 'down';

      // 1. Resonant switch body oscillator
      const osc = audioCtx.createOscillator();
      const oscGain = audioCtx.createGain();
      osc.type = isDown ? 'triangle' : 'sine';
      const startFreq = isDown ? 310 : 420;
      const endFreq = isDown ? 135 : 210;
      osc.frequency.setValueAtTime(startFreq, t);
      osc.frequency.exponentialRampToValueAtTime(Math.max(40, endFreq), t + 0.045);

      oscGain.gain.setValueAtTime(isDown ? 0.32 : 0.18, t);
      oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

      osc.connect(oscGain);
      oscGain.connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.055);

      // 2. High frequency tactile mechanical snap
      const bufferSize = Math.floor(audioCtx.sampleRate * 0.032);
      const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const noise = audioCtx.createBufferSource();
      noise.buffer = noiseBuffer;

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(isDown ? 2800 : 3600, t);
      filter.Q.setValueAtTime(3.4, t);

      const noiseGain = audioCtx.createGain();
      noiseGain.gain.setValueAtTime(isDown ? 0.38 : 0.22, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(audioCtx.destination);
      noise.start(t);
      noise.stop(t + 0.032);
    } catch (e) {}
  }

  /* ---------- Visual Key Burst / Shockwave ---------- */
  function burst(element, event) {
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'key-ripple';
    const x = (event && event.clientX) ? (event.clientX - rect.left) : (rect.width / 2);
    const y = (event && event.clientY) ? (event.clientY - rect.top) : (rect.height / 2);
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    element.appendChild(ripple);
    window.setTimeout(() => ripple.remove(), 450);
  }

  /* ---------- Telemetry & Inspector HUD ---------- */
  function announceKey(glyph, keyObj, keyId) {
    if (inspectorGlyph) inspectorGlyph.textContent = glyph || (keyObj?.label || '·');
    if (inspectorCode) inspectorCode.textContent = keyId ? `KEY ${keyId.toUpperCase()}` : 'KEY READY';

    const char = glyph || '';
    let nameText = 'Standard Key';
    let uniCode = '—';

    if (char) {
      const cp = char.codePointAt(0);
      uniCode = `U+${cp.toString(16).toUpperCase().padStart(4, '0')}`;
      nameText = KHMER_NAMES[char] || `Character '${char}'`;
    } else if (keyObj?.kind === 'mod') {
      nameText = `${keyObj.label || keyId.toUpperCase()} Modifier`;
    }

    if (inspectorName) inspectorName.textContent = nameText;
    if (inspectorLayer) inspectorLayer.textContent = `${activeLayer().toUpperCase()} LAYER`;
    if (inspectorShift) inspectorShift.textContent = keyObj?.shift ? `Shift: ${keyObj.shift}` : (uniCode !== '—' ? uniCode : 'Modifier');
    if (inspectorFinger) inspectorFinger.textContent = FINGER_MAP[keyId] || 'Touch Position';
  }

  function activeLayer() {
    return state.physicalLayer || state.layer;
  }

  function characterFor(key, layer, layout) {
    if (key.kind === 'mod') {
      if (key.id === 'space') return layout.spaceMap?.[layer] || ' ';
      return '';
    }
    return key[layer] || '';
  }

  function allKeys(layoutName) {
    const layout = state.data?.LAYOUTS?.[layoutName];
    if (!layout) return [];
    return layout.rows.flat();
  }

  function nextKeyId(layoutName) {
    const expected = state.sequence[state.cursor];
    if (!expected || !state.data) return null;
    const layout = state.data.LAYOUTS[layoutName];
    const layers = ['base', 'shift', 'altgr', 'ctrl'];
    for (const layer of layers) {
      const key = allKeys(layoutName).find((item) => item.kind !== 'mod' && characterFor(item, layer, layout) === expected);
      if (key) return key.id;
    }
    if (expected === ' ') return 'space';
    return null;
  }

  /* ---------- Keyboard Rendering ---------- */
  function renderKeyboard() {
    if (!keyboard || !state.data) return;
    const layout = state.data.LAYOUTS[state.layout];
    if (!layout) return;

    const layer = activeLayer();
    const wanted = state.layout === state.practiceLayout ? nextKeyId(state.practiceLayout) : null;

    if (boardWrap) {
      boardWrap.classList.toggle('layer-shift', layer === 'shift');
      boardWrap.classList.toggle('layer-ctrl', layer === 'ctrl');
      boardWrap.classList.toggle('layer-altgr', layer === 'altgr');
    }

    if (chassisLayoutLabel) {
      chassisLayoutLabel.textContent = layouts[state.layout]?.deckId || state.layout.toUpperCase();
    }

    keyboard.replaceChildren();
    keyboard.setAttribute('aria-label', `${layout.label}, ${layer} layer`);

    layout.rows.forEach((row, rowIndex) => {
      const rowEl = document.createElement('div');
      rowEl.className = 'row';
      rowEl.setAttribute('role', 'group');
      rowEl.setAttribute('aria-label', `Row ${rowIndex + 1}`);

      row.forEach((k) => {
        const glyph = characterFor(k, layer, layout);
        const btn = document.createElement('div');
        const isModifier = k.kind === 'mod';
        const isSpace = k.id === 'space';
        const isBlank = !isModifier && !glyph;

        btn.className = 'key notranslate';
        btn.setAttribute('translate', 'no');
        btn.dataset.key = k.id;
        if (k.wide) btn.style.flexGrow = k.wide;
        if (k.cls) btn.classList.add(k.cls);
        if (isModifier) btn.classList.add('is-modifier');
        if (isBlank) btn.classList.add('empty');
        if (k.id === 'f' || k.id === 'j') btn.classList.add('homing');
        if (wanted === k.id) btn.classList.add('is-target');
        if (state.currentKeyId === k.id) btn.classList.add('pressed');

        if (isModifier) {
          if (isSpace) {
            btn.classList.add('space');
            if (state.layout === 'standard') {
              btn.innerHTML = '<span class="space-glyph">្</span><span class="space-label">ជើង (Coeng)</span><span class="shift-badge">Space</span>';
            } else if (state.layout === 'nida') {
              btn.innerHTML = '<span class="space-glyph">␣</span><span class="space-label">ដកឃ្លា · Spacebar</span>';
            } else {
              btn.innerHTML = '<span class="space-label">Space</span>';
            }
          } else {
            btn.textContent = k.label || k.id;
          }
        } else {
          const g = document.createElement('span');
          g.className = 'glyph notranslate';
          g.setAttribute('translate', 'no');
          g.textContent = glyph || k.base || '';
          btn.appendChild(g);

          if (k.shift && layer === 'base') {
            const hint = document.createElement('span');
            hint.className = 'shift-badge notranslate';
            hint.setAttribute('translate', 'no');
            hint.textContent = k.shift;
            btn.appendChild(hint);
          }
        }

        btn.addEventListener('pointerdown', (ev) => {
          if (isBlank && !isModifier) return;
          state.currentKeyId = k.id;
          burst(btn, ev);
          playClick('down');
          announceKey(glyph || (isSpace ? ' ' : ''), k, k.id);

          if (isModifier) {
            if (k.cls === 'key-shift') {
              state.physicalLayer = 'shift';
              renderKeyboard();
            } else if (k.cls === 'key-ctrl') {
              state.physicalLayer = 'ctrl';
              renderKeyboard();
            } else if (k.cls === 'key-altgr') {
              state.physicalLayer = 'altgr';
              renderKeyboard();
            }
          } else if (state.layout === state.practiceLayout && glyph) {
            acceptCharacter(glyph);
          }
          btn.classList.add('pressed');
        });

        btn.addEventListener('pointerup', () => {
          playClick('up');
          if (isModifier && state.physicalLayer) {
            state.physicalLayer = null;
            renderKeyboard();
          }
          window.setTimeout(() => {
            if (state.currentKeyId === k.id) {
              state.currentKeyId = null;
              btn.classList.remove('pressed');
            }
          }, 120);
        });

        rowEl.appendChild(btn);
      });

      keyboard.appendChild(rowEl);
    });

    // Update active tab buttons
    document.querySelectorAll('.layout-tab').forEach((button) => {
      const active = button.dataset.layout === state.layout;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });

    document.querySelectorAll('.layer-tab').forEach((button) => {
      const active = button.dataset.layer === state.layer;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  /* ---------- Starter Drill Engine ---------- */
  function renderPrompt() {
    renderExerciseEntry();
    if (!exercisePrompt) return;
    exercisePrompt.replaceChildren();

    Array.from(state.sequence).forEach((glyph, index) => {
      const span = document.createElement('span');
      span.className = index < state.cursor ? 'done' : index === state.cursor ? 'current' : '';
      span.textContent = glyph;
      if (index === state.cursor) span.setAttribute('aria-label', `${glyph}, target character`);
      exercisePrompt.append(span);
    });

    const counter = byId('practice-progress-label');
    if (counter) counter.textContent = `${state.cursor} / ${state.sequence.length}`;

    const acc = byId('practice-accuracy');
    if (acc) {
      acc.textContent = state.attempts ? `${Math.round(((state.attempts - state.mistakes) / state.attempts) * 100)}% accuracy` : '100% accuracy';
    }
  }

  function renderExerciseEntry() {
    if (!exerciseEntry) return;
    exerciseEntry.replaceChildren();
    if (state.typed) {
      exerciseEntry.textContent = state.typed;
    } else {
      const hint = document.createElement('span');
      hint.className = 'entry-placeholder';
      hint.textContent = 'Click here or press any key to type…';
      exerciseEntry.append(hint);
    }
  }

  function setMessage(text, type = '') {
    const message = byId('practice-message');
    if (message) {
      message.textContent = text;
      message.classList.toggle('is-error', type === 'error');
      message.classList.toggle('is-success', type === 'success');
    }
  }

  function acceptCharacter(glyph) {
    if (!state.sequence || state.cursor >= state.sequence.length) return;
    state.attempts += 1;
    const expected = state.sequence[state.cursor];

    if (glyph === expected) {
      state.typed += glyph;
      state.cursor += 1;
      if (state.cursor === state.sequence.length) {
        setMessage('Brilliant work. You completed this starter exercise.', 'success');
      } else {
        setMessage('Correct stroke. Keep following the highlighted keys.', 'success');
      }
    } else {
      state.mistakes += 1;
      setMessage(`Looking for ${expected} — see the glowing beacon on the deck.`, 'error');
    }

    renderPrompt();
    renderKeyboard();
  }

  function keyFromPhysicalEvent(event, layoutName = state.layout) {
    if (!state.data) return null;
    const id = CODE_MAP[event.code];
    if (!id) return null;

    const layout = state.data.LAYOUTS[layoutName];
    const key = allKeys(layoutName).find((item) => item.id === id);
    if (!key) return null;

    let layer = 'base';
    if (event.shiftKey) layer = 'shift';
    else if (event.altKey) layer = 'altgr';
    else if (event.ctrlKey) layer = 'ctrl';

    const glyph = characterFor(key, layer, layout);
    return { id, key, glyph, layer };
  }

  function setPracticeLayout(name, sequence) {
    if (!layouts[name]) return;
    state.practiceLayout = name;
    state.sequence = sequence;
    state.cursor = 0;
    state.attempts = 0;
    state.mistakes = 0;
    state.typed = '';
    state.currentKeyId = null;

    document.querySelectorAll('.practice-layout').forEach((button) => {
      const active = button.dataset.practiceLayout === name;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });

    if (state.layout !== name) {
      state.layout = name;
      state.layer = 'base';
    }

    renderKeyboard();
    renderPrompt();
    setMessage('The highlighted gold/cyan key shows what comes next.');
  }

  function populateExercise(layoutName) {
    return fetch(assetUrl(`data/curriculum/${layouts[layoutName].course}/exercises.json`))
      .then((res) => {
        if (!res.ok) throw new Error('Curriculum fetch failed');
        return res.json();
      })
      .then((data) => {
        const firstExercise = Object.values(data.exercises || {})[0];
        if (!firstExercise?.content) throw new Error('No starter drill content');
        const sequence = Array.from(firstExercise.content).filter((char) => !/\s/u.test(char)).slice(0, 10).join('');
        setPracticeLayout(layoutName, sequence);
      })
      .catch(() => {
        const fallbacks = {
          standard: 'កខគឃង',
          nida: 'កខគឃង',
          english: 'asdfjkl',
        };
        setPracticeLayout(layoutName, fallbacks[layoutName] || 'កខគ');
      });
  }

  /* ---------- Event Handlers ---------- */
  function attachKeyboardEvents() {
    exerciseEntry?.addEventListener('click', () => exerciseEntry.focus());

    document.addEventListener('keydown', (event) => {
      if (event.metaKey || event.isComposing || event.key === 'Tab') return;

      // Handle modifier layer holding
      if (event.key === 'Shift') {
        state.physicalLayer = 'shift';
        renderKeyboard();
      } else if (event.key === 'Control') {
        state.physicalLayer = 'ctrl';
        renderKeyboard();
      } else if (event.key === 'Alt') {
        state.physicalLayer = 'altgr';
        renderKeyboard();
      }

      const inPractice = document.activeElement === exerciseEntry;
      const inKeyboard = keyboard?.contains(document.activeElement);

      const hit = keyFromPhysicalEvent(event, inPractice ? state.practiceLayout : state.layout);
      if (!hit) return;

      playClick('down');
      state.currentKeyId = hit.id;

      const targetEl = keyboard?.querySelector(`[data-key="${hit.id}"]`);
      if (targetEl) {
        targetEl.classList.add('pressed');
        burst(targetEl);
      }

      announceKey(hit.glyph, hit.key, hit.id);

      if ((inPractice || !document.activeElement || document.activeElement === document.body) && state.sequence[state.cursor]) {
        event.preventDefault();
        acceptCharacter(hit.glyph);
      }

      window.setTimeout(() => {
        if (state.currentKeyId === hit.id) {
          state.currentKeyId = null;
          if (targetEl) targetEl.classList.remove('pressed');
        }
      }, 140);
    });

    document.addEventListener('keyup', (event) => {
      playClick('up');
      if (event.key === 'Shift' || event.key === 'Control' || event.key === 'Alt') {
        state.physicalLayer = null;
        renderKeyboard();
      }
    });
  }

  function setupControls() {
    // Layout buttons
    document.querySelectorAll('.layout-tab').forEach((button) => {
      button.addEventListener('click', () => {
        state.layout = button.dataset.layout;
        state.layer = 'base';
        state.currentKeyId = null;
        renderKeyboard();
        announceKey('·', null, state.layout.toUpperCase());
      });
    });

    // Layer buttons
    document.querySelectorAll('.layer-tab').forEach((button) => {
      button.addEventListener('click', () => {
        state.layer = button.dataset.layer;
        state.currentKeyId = null;
        renderKeyboard();
      });
    });

    // Sound toggle
    const soundToggle = byId('soundToggle');
    if (soundToggle) {
      soundToggle.addEventListener('click', () => {
        state.soundOn = !state.soundOn;
        soundToggle.classList.toggle('is-active', state.soundOn);
        soundToggle.setAttribute('aria-pressed', String(state.soundOn));
        const span = soundToggle.querySelector('span');
        if (span) span.textContent = state.soundOn ? 'Key Sound' : 'Muted';
        if (state.soundOn) playClick('down');
      });
    }

    // Practice layout switches
    document.querySelectorAll('.practice-layout').forEach((button) => {
      button.addEventListener('click', () => {
        populateExercise(button.dataset.practiceLayout);
      });
    });

    // Reset button
    byId('reset-practice')?.addEventListener('click', () => {
      populateExercise(state.practiceLayout);
    });

    // Layout card triggers in intro section
    document.querySelectorAll('.load-deck-btn').forEach((button) => {
      button.addEventListener('click', () => {
        const targetLayout = button.dataset.targetLayout;
        if (targetLayout && layouts[targetLayout]) {
          state.layout = targetLayout;
          state.layer = 'base';
          renderKeyboard();
          byId('keyboard-deck')?.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  function setupMotion() {
    const toggle = byId('motion-toggle');
    if (!toggle) return;
    const prefersLess = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    state.motionOff = prefersLess || window.localStorage.getItem('pkLaunchMotion') === 'off';

    if (state.motionOff) document.body.classList.add('no-motion');

    const update = () => {
      const mode = state.motionOff ? 'off' : 'on';
      toggle.textContent = `Motion: ${mode}`;
      toggle.setAttribute('aria-pressed', String(state.motionOff));
      toggle.title = state.motionOff ? 'Turn nonessential animations on' : 'Turn nonessential animations off';
    };

    update();

    toggle.addEventListener('click', () => {
      state.motionOff = !state.motionOff;
      document.body.classList.toggle('no-motion', state.motionOff);
      window.localStorage.setItem('pkLaunchMotion', state.motionOff ? 'off' : 'on');
      update();
      if (state.motionOff) {
        document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
      }
    });
  }

  function setupReveals() {
    const items = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches || state.motionOff) {
      items.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
    items.forEach((el) => observer.observe(el));
  }

  function initialize() {
    setupMotion();
    setupControls();
    attachKeyboardEvents();
    setupReveals();

    fetch(assetUrl('data/keyboard.json'))
      .then((res) => {
        if (!res.ok) throw new Error('Keyboard JSON load failed');
        return res.json();
      })
      .then((data) => {
        state.data = data;
        state.layout = 'standard';
        renderKeyboard();
        announceKey('ក', { label: 'K', shift: 'គ' }, 'k');
        return populateExercise('standard');
      })
      .catch((err) => {
        console.warn('Fallback loading', err);
        if (keyboard) keyboard.textContent = 'Interactive deck loading...';
      });
  }

  initialize();
})();
