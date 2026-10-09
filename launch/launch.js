(() => {
  'use strict';

  const root = new URL('../', window.location.href);
  const assetUrl = (path) => new URL(path, root).href;
  const layouts = {
    standard: { label: 'Khmer Keyboard Layout', course: 'standard' },
    nida: { label: 'Khmer NiDA Keyboard', course: 'nida' },
    english: { label: 'English (US)', course: 'english' },
  };
  const state = {
    data: null,
    layout: 'standard',
    layer: 'base',
    practiceLayout: 'standard',
    sequence: '',
    cursor: 0,
    attempts: 0,
    mistakes: 0,
    typed: '',
    currentKeyId: null,
    motionOff: false,
  };

  const byId = (id) => document.getElementById(id);
  const keyboard = byId('keyboard');
  const inspectorGlyph = byId('inspector-glyph');
  const inspectorMeta = byId('inspector-meta');
  const inspectorLabel = document.querySelector('.inspector-label');
  const exerciseEntry = byId('exercise-entry');

  function announceKey(glyph, text, keyId) {
    if (inspectorGlyph) inspectorGlyph.textContent = glyph || '·';
    if (inspectorMeta) inspectorMeta.textContent = text;
    if (inspectorLabel) inspectorLabel.textContent = keyId ? `KEY ${keyId.toUpperCase()}` : 'SELECT A KEY';
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
    const layers = ['base', 'shift'];
    for (const layer of layers) {
      const key = allKeys(layoutName).find((item) => item.kind !== 'mod' && characterFor(item, layer, layout) === expected);
      if (key) return key.id;
    }
    if (expected === ' ') return 'space';
    return null;
  }

  function renderKeyboard() {
    if (!keyboard || !state.data) return;
    const layout = state.data.LAYOUTS[state.layout];
    if (!layout) return;
    const wanted = state.layout === state.practiceLayout ? nextKeyId(state.practiceLayout) : null;
    keyboard.replaceChildren();
    keyboard.setAttribute('aria-label', `${layout.label}, ${state.layer} layer`);
    layout.rows.forEach((row, rowIndex) => {
      const rowEl = document.createElement('div');
      rowEl.className = 'key-row';
      rowEl.setAttribute('role', 'group');
      rowEl.setAttribute('aria-label', `Keyboard row ${rowIndex + 1}`);
      row.forEach((key) => {
        const glyph = characterFor(key, state.layer, layout);
        const btn = document.createElement('button');
        const isModifier = key.kind === 'mod';
        const isSpace = key.id === 'space';
        const isBlank = !isModifier && !glyph;
        btn.type = 'button';
        btn.className = `keycap${isModifier ? ' is-modifier' : ''}${isBlank ? ' is-blank' : ''}${key.wide ? ' is-wide' : ''}${isSpace ? ' is-space' : ''}${wanted === key.id ? ' is-target' : ''}${state.currentKeyId === key.id ? ' is-pressed' : ''}`;
        btn.dataset.keyId = key.id;
        btn.dataset.shift = key.shift || '';
        btn.disabled = isBlank;
        btn.setAttribute('aria-label', isModifier ? `${key.label || 'Space'} key${glyph ? `, character ${glyph}` : ''}` : `${key.id} key, ${glyph || 'no character'} on ${state.layer} layer`);
        const face = document.createElement('span');
        face.className = 'key-base';
        face.textContent = isSpace ? (glyph === ' ' ? 'SPACE' : glyph || 'SPACE') : glyph || key.label || '·';
        btn.append(face);
        if (isBlank) btn.tabIndex = -1;
        btn.addEventListener('click', () => {
          if (isBlank) return;
          state.currentKeyId = key.id;
          announceKey(glyph || '␠', `${key.label || key.id.toUpperCase()} · ${state.layer} layer${glyph ? ` · ${glyph}` : ''}`, key.id);
          if (state.layout === state.practiceLayout && glyph) acceptCharacter(glyph);
          renderKeyboard();
          window.setTimeout(() => {
            if (state.currentKeyId === key.id) {
              state.currentKeyId = null;
              renderKeyboard();
            }
          }, 150);
        });
        rowEl.append(btn);
      });
      keyboard.append(rowEl);
    });
    const label = byId('layout-label');
    if (label) label.textContent = layout.label;
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

  function renderPrompt() {
    renderExerciseEntry();
    const prompt = byId('exercise-prompt');
    if (!prompt) return;
    prompt.replaceChildren();
    Array.from(state.sequence).forEach((glyph, index) => {
      const span = document.createElement('span');
      span.className = index < state.cursor ? 'done' : index === state.cursor ? 'current' : '';
      span.textContent = glyph;
      if (index === state.cursor) span.setAttribute('aria-label', `${glyph}, next character`);
      prompt.append(span);
    });
    const counter = byId('practice-progress-label');
    if (counter) counter.textContent = `${state.cursor} / ${state.sequence.length}`;
    const acc = byId('practice-accuracy');
    if (acc) acc.textContent = state.attempts ? `${Math.round((state.attempts - state.mistakes) / state.attempts * 100)}% accuracy` : '—';
  }

  function renderExerciseEntry() {
    if (!exerciseEntry) return;
    exerciseEntry.replaceChildren();
    if (state.typed) {
      exerciseEntry.textContent = state.typed;
      exerciseEntry.setAttribute('aria-label', `Typed so far: ${state.typed}. Type the next character.`);
    } else {
      const hint = document.createElement('span');
      hint.className = 'entry-placeholder';
      hint.textContent = 'Click here, then type…';
      exerciseEntry.append(hint);
      exerciseEntry.setAttribute('aria-label', 'Typing practice area. Press Enter or Space to focus, then type the prompt.');
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
        setMessage('Nice work. You completed this short starter drill.', 'success');
      } else {
        setMessage('That’s it. Keep going, one key at a time.', 'success');
      }
    } else {
      state.mistakes += 1;
      setMessage(`Not that one — look for ${expected} on the highlighted key.`, 'error');
    }
    renderPrompt();
    renderKeyboard();
  }

  function keyFromPhysicalEvent(event, layoutName = state.layout) {
    if (!state.data) return null;
    const id = event.code?.startsWith('Key') ? event.code.slice(3).toLowerCase()
      : event.code?.startsWith('Digit') ? `k${event.code.slice(5)}`
        : ({ Minus: 'minus', Equal: 'equal', BracketLeft: 'bracketL', BracketRight: 'bracketR', Semicolon: 'semicolon', Quote: 'quote', Backslash: 'backslash', Comma: 'comma', Period: 'period', Slash: 'slash', Backquote: 'grave', Space: 'space' }[event.code]);
    if (!id) return null;
    const layout = state.data.LAYOUTS[layoutName];
    const key = allKeys(layoutName).find((item) => item.id === id);
    if (!key) return null;
    const layer = event.shiftKey ? 'shift' : 'base';
    const glyph = characterFor(key, layer, layout);
    return glyph ? { id, glyph } : null;
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
    const section = document.querySelector('.practice-layouts');
    section?.querySelectorAll('.practice-layout').forEach((button) => {
      const active = button.dataset.practiceLayout === name;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    if (state.layout !== name) {
      state.layout = name;
      state.layer = 'base';
      renderKeyboard();
    } else {
      renderKeyboard();
    }
    renderPrompt();
    setMessage('The highlighted key shows what comes next.');
    renderExerciseEntry();
  }

  function focusPractice() {
    if (!exerciseEntry) return;
    exerciseEntry.focus();
  }

  function attachPracticeEvents() {
    exerciseEntry?.addEventListener('click', focusPractice);
    exerciseEntry?.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') event.preventDefault();
    });
    document.addEventListener('keydown', (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey || event.isComposing || event.key === 'Tab') return;
      const inPractice = document.activeElement === exerciseEntry;
      const inKeyboard = keyboard?.contains(document.activeElement);
      if (!inPractice && !inKeyboard) return;
      const layoutName = inKeyboard ? state.layout : state.practiceLayout;
      const hit = keyFromPhysicalEvent(event, layoutName);
      if (!hit) return;
      if (inPractice && state.sequence[state.cursor]) {
        event.preventDefault();
        acceptCharacter(hit.glyph);
      }
      state.currentKeyId = hit.id;
      announceKey(hit.glyph, `${hit.id.toUpperCase()} · ${event.shiftKey ? 'shift' : 'base'} layer · typed from your keyboard`, hit.id);
      renderKeyboard();
      window.setTimeout(() => {
        if (state.currentKeyId === hit.id) {
          state.currentKeyId = null;
          renderKeyboard();
        }
      }, 130);
    });
  }

  function setupMotion() {
    const toggle = byId('motion-toggle');
    if (!toggle) return;
    const prefersLess = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    state.motionOff = prefersLess || window.localStorage.getItem('pkLaunchMotion') === 'off';
    if (prefersLess) document.body.classList.add('no-motion');
    if (state.motionOff && !prefersLess) document.body.classList.add('no-motion');
    const update = () => {
      const motion = state.motionOff ? 'off' : 'on';
      toggle.textContent = `Motion: ${motion}`;
      toggle.setAttribute('aria-pressed', String(state.motionOff));
      toggle.title = state.motionOff ? 'Turn nonessential animations on' : 'Turn nonessential animations off';
    };
    update();
    toggle.addEventListener('click', () => {
      state.motionOff = !state.motionOff;
      document.body.classList.toggle('no-motion', state.motionOff || prefersLess);
      window.localStorage.setItem('pkLaunchMotion', state.motionOff ? 'off' : 'on');
      update();
      if (state.motionOff) document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
    });
  }

  function setupReveals() {
    const items = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches || state.motionOff) {
      items.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver((entries, activeObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          activeObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -35px 0px' });
    items.forEach((el) => observer.observe(el));
  }

  function populateExercise(layoutName) {
    return fetch(assetUrl(`data/curriculum/${layouts[layoutName].course}/exercises.json`))
      .then((response) => {
        if (!response.ok) throw new Error('Curriculum request failed');
        return response.json();
      })
      .then((data) => {
        const firstExercise = Object.values(data.exercises || {})[0];
        if (!firstExercise?.content) throw new Error('No starter exercise found');
        const sequence = Array.from(firstExercise.content).filter((character) => !/\s/u.test(character)).slice(0, 10).join('');
        setPracticeLayout(layoutName, sequence);
      });
  }

  function setupControls() {
    document.querySelectorAll('.layout-tab').forEach((button) => button.addEventListener('click', () => {
      state.layout = button.dataset.layout;
      state.layer = 'base';
      state.currentKeyId = null;
      renderKeyboard();
      if (state.layout !== state.practiceLayout) announceKey('·', `Choose a key from ${layouts[state.layout].label}.`, null);
    }));
    document.querySelectorAll('.layer-tab').forEach((button) => button.addEventListener('click', () => {
      state.layer = button.dataset.layer;
      state.currentKeyId = null;
      renderKeyboard();
      const prettyLayer = button.textContent.trim();
      announceKey('·', `${layouts[state.layout].label} · ${prettyLayer} layer`, null);
    }));
    document.querySelectorAll('.practice-layout').forEach((button) => button.addEventListener('click', () => {
      populateExercise(button.dataset.practiceLayout).catch(() => setMessage('This starter drill could not be loaded. Please try the full studio.', 'error'));
    }));
    byId('reset-practice')?.addEventListener('click', () => {
      populateExercise(state.practiceLayout).catch(() => setMessage('This starter drill could not be loaded.', 'error'));
    });
  }

  function initialize() {
    setupMotion();
    setupControls();
    attachPracticeEvents();
    setupReveals();
    fetch(assetUrl('data/keyboard.json'))
      .then((response) => {
        if (!response.ok) throw new Error('Keyboard map request failed');
        return response.json();
      })
      .then((data) => {
        state.data = data;
        state.layout = 'standard';
        renderKeyboard();
        return populateExercise('standard');
      })
      .catch(() => {
        if (keyboard) keyboard.textContent = 'The interactive keyboard is unavailable right now.';
        setMessage('The starter exercise could not be loaded. Open the full typing studio to begin.');
      });
  }

  initialize();
})();
