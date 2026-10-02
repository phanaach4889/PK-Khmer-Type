/* ============================================================
   PK Khmer Type — Interactive 3D Mechanical Keyboard & Switch Engine
   Built with Three.js (Zero-Dependency Offline Bundle)
   Features:
   - Full 61-Key ANSI Mechanical Keyboard with Ergonomic Sculpted Chassis
   - OEM-Profile Sculpted Keycaps with Sculpted Dishes & Tactile Homing Bars
   - Dynamic Bilingual Canvas Legend Generator (Khmer Standard, Khmer NiDA, English QWERTY)
   - Real-Time Spring Physics & Hardware Typing Listener (Type on real keyboard!)
   - Raycasting Mouse/Touch Interaction on any Key
   - Kinematic Holographic Hands Guide with Translucent Palms & Glowing Fingertip Rings
   - Reactive Mechanical Switch Web Audio Click Synthesizer (Bottom-out thock & spring click)
   - View Modes: Full 3D Keyboard & Macro Switch Anatomy (Exploded View)
   - Visual Themes: Angkor Gold, RGB Chroma Wave, Cyber Neon, Ivory Ceramic
   - Auto-Type Melodic Demo Player & Smooth Camera Turntable
   ============================================================ */

(function () {
  'use strict';

  // ------------------------------------------------------------
  // 1. KEYBOARD MATRIX DATA & LAYOUT DEFINITIONS
  // ------------------------------------------------------------
  const ROW1_DEFS = [
    { id: 'grave', unit: 1.0, code: 'Backquote', finger: 'lp',
      std: { base: '', shift: '', altgr: '◎' },
      nida: { base: '«', shift: '»', altgr: '‍' },
      en: { base: '`', shift: '~' } },
    { id: 'k1', unit: 1.0, code: 'Digit1', finger: 'lp',
      std: { base: '១', shift: '!', altgr: '1' },
      nida: { base: '១', shift: '!', altgr: '‌' },
      en: { base: '1', shift: '!' } },
    { id: 'k2', unit: 1.0, code: 'Digit2', finger: 'lr',
      std: { base: '២', shift: 'ៗ', altgr: '2' },
      nida: { base: '២', shift: 'ៗ', altgr: '@' },
      en: { base: '2', shift: '@' } },
    { id: 'k3', unit: 1.0, code: 'Digit3', finger: 'lm',
      std: { base: '៣', shift: '"', altgr: '3' },
      nida: { base: '៣', shift: '"', altgr: '៑' },
      en: { base: '3', shift: '#' } },
    { id: 'k4', unit: 1.0, code: 'Digit4', finger: 'li',
      std: { base: '៤', shift: '៛', altgr: '4' },
      nida: { base: '៤', shift: '៛', altgr: '$' },
      en: { base: '4', shift: '$' } },
    { id: 'k5', unit: 1.0, code: 'Digit5', finger: 'li',
      std: { base: '៥', shift: '%', altgr: '5' },
      nida: { base: '៥', shift: '%', altgr: '€' },
      en: { base: '5', shift: '%' } },
    { id: 'k6', unit: 1.0, code: 'Digit6', finger: 'ri',
      std: { base: '៦', shift: '៍', altgr: '6' },
      nida: { base: '៦', shift: '៍', altgr: '៙' },
      en: { base: '6', shift: '^' } },
    { id: 'k7', unit: 1.0, code: 'Digit7', finger: 'ri',
      std: { base: '៧', shift: '័', altgr: '7' },
      nida: { base: '៧', shift: '័', altgr: '៚' },
      en: { base: '7', shift: '&' } },
    { id: 'k8', unit: 1.0, code: 'Digit8', finger: 'rm',
      std: { base: '៨', shift: '៏', altgr: '8' },
      nida: { base: '៨', shift: '៏', altgr: '*' },
      en: { base: '8', shift: '*' } },
    { id: 'k9', unit: 1.0, code: 'Digit9', finger: 'rr',
      std: { base: '៩', shift: '៎', altgr: '9' },
      nida: { base: '៩', shift: '(', altgr: '{' },
      en: { base: '9', shift: '(' } },
    { id: 'k0', unit: 1.0, code: 'Digit0', finger: 'rp',
      std: { base: '០', shift: '៌', altgr: '0' },
      nida: { base: '០', shift: ')', altgr: '}' },
      en: { base: '0', shift: ')' } },
    { id: 'minus', unit: 1.0, code: 'Minus', finger: 'rp',
      std: { base: '-', shift: '_', altgr: '{' },
      nida: { base: 'ឥ', shift: '៌', altgr: '×' },
      en: { base: '-', shift: '_' } },
    { id: 'equal', unit: 1.0, code: 'Equal', finger: 'rp',
      std: { base: '=', shift: '+', altgr: '}' },
      nida: { base: 'ឲ', shift: '=', altgr: '៎' },
      en: { base: '=', shift: '+' } },
    { id: 'backspace', unit: 2.0, code: 'Backspace', finger: 'rp', isMod: true, label: 'Backsp.' }
  ];

  const ROW2_DEFS = [
    { id: 'tab', unit: 1.5, code: 'Tab', finger: 'lp', isMod: true, label: 'Tab' },
    { id: 'q', unit: 1.0, code: 'KeyQ', finger: 'lp',
      std: { base: 'ឆ', shift: 'ឈ', altgr: '*' },
      nida: { base: 'ឆ', shift: 'ឈ' },
      en: { base: 'q', shift: 'Q' } },
    { id: 'w', unit: 1.0, code: 'KeyW', finger: 'lr',
      std: { base: 'ឹ', shift: 'ឺ' },
      nida: { base: 'ឹ', shift: 'ឺ' },
      en: { base: 'w', shift: 'W' } },
    { id: 'e', unit: 1.0, code: 'KeyE', finger: 'lm',
      std: { base: 'េ', shift: 'ែ', altgr: 'ឯ' },
      nida: { base: 'េ', shift: 'ែ', altgr: 'ឯ' },
      en: { base: 'e', shift: 'E' } },
    { id: 'r', unit: 1.0, code: 'KeyR', finger: 'li',
      std: { base: 'រ', shift: 'ឬ', altgr: 'ឫ' },
      nida: { base: 'រ', shift: 'ឬ', altgr: 'ឫ' },
      en: { base: 'r', shift: 'R' } },
    { id: 't', unit: 1.0, code: 'KeyT', finger: 'li',
      std: { base: 'ត', shift: 'ទ', altgr: 'ឦ' },
      nida: { base: 'ត', shift: 'ទ' },
      en: { base: 't', shift: 'T' } },
    { id: 'y', unit: 1.0, code: 'KeyY', finger: 'ri',
      std: { base: 'យ', shift: 'ួ' },
      nida: { base: 'យ', shift: 'ួ' },
      en: { base: 'y', shift: 'Y' } },
    { id: 'u', unit: 1.0, code: 'KeyU', finger: 'ri',
      std: { base: 'ុ', shift: 'ូ', altgr: 'ឧ' },
      nida: { base: 'ុ', shift: 'ូ' },
      en: { base: 'u', shift: 'U' } },
    { id: 'i', unit: 1.0, code: 'KeyI', finger: 'rm',
      std: { base: 'ិ', shift: 'ី', altgr: 'ឥ' },
      nida: { base: 'ិ', shift: 'ី', altgr: 'ឦ' },
      en: { base: 'i', shift: 'I' } },
    { id: 'o', unit: 1.0, code: 'KeyO', finger: 'rr',
      std: { base: 'ោ', shift: 'ៅ', altgr: 'ឱ' },
      nida: { base: 'ោ', shift: 'ៅ', altgr: 'ឱ' },
      en: { base: 'o', shift: 'O' } },
    { id: 'p', unit: 1.0, code: 'KeyP', finger: 'rp',
      std: { base: 'ផ', shift: 'ភ', altgr: 'ឳ' },
      nida: { base: 'ផ', shift: 'ភ', altgr: 'ឰ' },
      en: { base: 'p', shift: 'P' } },
    { id: 'bracketL', unit: 1.0, code: 'BracketLeft', finger: 'rp',
      std: { base: 'ើ', shift: 'ោះ', altgr: '[' },
      nida: { base: 'ៀ', shift: 'ឿ', altgr: 'ឩ' },
      en: { base: '[', shift: '{' } },
    { id: 'bracketR', unit: 1.0, code: 'BracketRight', finger: 'rp',
      std: { base: 'ឿ', shift: 'ៀ', altgr: ']' },
      nida: { base: 'ឪ', shift: 'ឧ', altgr: 'ឳ' },
      en: { base: ']', shift: '}' } },
    { id: 'enter', unit: 1.5, code: 'Enter', finger: 'rp', isMod: true, label: 'Enter' }
  ];

  const ROW3_DEFS = [
    { id: 'caps', unit: 1.75, code: 'CapsLock', finger: 'lp', isMod: true, label: 'Caps' },
    { id: 'a', unit: 1.0, code: 'KeyA', finger: 'lp', isHome: true,
      std: { base: 'ា', shift: 'ៃ', altgr: 'ឩ' },
      nida: { base: 'ា', shift: 'ាំ' },
      en: { base: 'a', shift: 'A' } },
    { id: 's', unit: 1.0, code: 'KeyS', finger: 'lr', isHome: true,
      std: { base: 'ស', shift: 'ាំ', altgr: 'ឪ' },
      nida: { base: 'ស', shift: 'ៃ' },
      en: { base: 's', shift: 'S' } },
    { id: 'd', unit: 1.0, code: 'KeyD', finger: 'lm', isHome: true,
      std: { base: 'ដ', shift: 'ឌ' },
      nida: { base: 'ដ', shift: 'ឌ' },
      en: { base: 'd', shift: 'D' } },
    { id: 'f', unit: 1.0, code: 'KeyF', finger: 'li', isHome: true, hasBump: true,
      std: { base: 'ថ', shift: 'ធ' },
      nida: { base: 'ថ', shift: 'ធ' },
      en: { base: 'f', shift: 'F' } },
    { id: 'g', unit: 1.0, code: 'KeyG', finger: 'li',
      std: { base: 'ង', shift: 'ុះ' },
      nida: { base: 'ង', shift: 'អ' },
      en: { base: 'g', shift: 'G' } },
    { id: 'h', unit: 1.0, code: 'KeyH', finger: 'ri',
      std: { base: 'ហ', shift: '៏' },
      nida: { base: 'ហ', shift: 'ះ' },
      en: { base: 'h', shift: 'H' } },
    { id: 'j', unit: 1.0, code: 'KeyJ', finger: 'ri', isHome: true, hasBump: true,
      std: { base: 'ញ', shift: 'ុំ', altgr: 'ឮ' },
      nida: { base: '្', shift: 'ញ' },
      en: { base: 'j', shift: 'J' } },
    { id: 'k', unit: 1.0, code: 'KeyK', finger: 'rm', isHome: true,
      std: { base: 'ក', shift: 'គ', altgr: 'ឭ' },
      nida: { base: 'ក', shift: 'គ' },
      en: { base: 'k', shift: 'K' } },
    { id: 'l', unit: 1.0, code: 'KeyL', finger: 'rr', isHome: true,
      std: { base: 'ល', shift: 'ឡ', altgr: 'ឰ' },
      nida: { base: 'ល', shift: 'ឡ' },
      en: { base: 'l', shift: 'L' } },
    { id: 'semicolon', unit: 1.0, code: 'Semicolon', finger: 'rp', isHome: true,
      std: { base: 'ះ', shift: '៖', altgr: ';' },
      nida: { base: 'ើ', shift: 'ោះ', altgr: '៖' },
      en: { base: ';', shift: ':' } },
    { id: 'quote', unit: 1.0, code: 'Quote', finger: 'rp',
      std: { base: '់', shift: '៉', altgr: '៝' },
      nida: { base: '់', shift: '៉', altgr: 'ៈ' },
      en: { base: '\'', shift: '"' } },
    { id: 'backslash', unit: 2.25, code: 'Backslash', finger: 'rp',
      std: { base: '\\', shift: '/', altgr: '៚' },
      nida: { base: 'ឮ', shift: 'ឭ', altgr: '\\' },
      en: { base: '\\', shift: '|' } }
  ];

  const ROW4_DEFS = [
    { id: 'shiftL', unit: 2.25, code: 'ShiftLeft', finger: 'lp', isMod: true, label: 'Shift' },
    { id: 'z', unit: 1.0, code: 'KeyZ', finger: 'lp',
      std: { base: 'ឋ', shift: 'ឍ', altgr: '#' },
      nida: { base: 'ឋ', shift: 'ឍ' },
      en: { base: 'z', shift: 'Z' } },
    { id: 'x', unit: 1.0, code: 'KeyX', finger: 'lr',
      std: { base: 'ខ', shift: 'ឃ', altgr: '@' },
      nida: { base: 'ខ', shift: 'ឃ' },
      en: { base: 'x', shift: 'X' } },
    { id: 'c', unit: 1.0, code: 'KeyC', finger: 'lm',
      std: { base: 'ច', shift: 'ជ', altgr: '&' },
      nida: { base: 'ច', shift: 'ជ' },
      en: { base: 'c', shift: 'C' } },
    { id: 'v', unit: 1.0, code: 'KeyV', finger: 'li',
      std: { base: 'វ', shift: 'េះ', altgr: '$' },
      nida: { base: 'វ', shift: 'េះ' },
      en: { base: 'v', shift: 'V' } },
    { id: 'b', unit: 1.0, code: 'KeyB', finger: 'li',
      std: { base: 'ប', shift: 'ព', altgr: '%' },
      nida: { base: 'ប', shift: 'ព' },
      en: { base: 'b', shift: 'B' } },
    { id: 'n', unit: 1.0, code: 'KeyN', finger: 'ri',
      std: { base: 'ន', shift: 'ណ', altgr: '(' },
      nida: { base: 'ន', shift: 'ណ' },
      en: { base: 'n', shift: 'N' } },
    { id: 'm', unit: 1.0, code: 'KeyM', finger: 'ri',
      std: { base: 'ម', shift: 'ំ', altgr: ')' },
      nida: { base: 'ម', shift: 'ំ' },
      en: { base: 'm', shift: 'M' } },
    { id: 'comma', unit: 1.0, code: 'Comma', finger: 'rm',
      std: { base: 'អ', shift: ',', altgr: '‹' },
      nida: { base: 'ុំ', shift: 'ុះ', altgr: ',' },
      en: { base: ',', shift: '<' } },
    { id: 'period', unit: 1.0, code: 'Period', finger: 'rr',
      std: { base: '។', shift: '.', altgr: '›' },
      nida: { base: '។', shift: '៕', altgr: '.' },
      en: { base: '.', shift: '>' } },
    { id: 'slash', unit: 1.0, code: 'Slash', finger: 'rp',
      std: { base: '”', shift: '?', altgr: '៕' },
      nida: { base: '៊', shift: '?', altgr: '/' },
      en: { base: '/', shift: '?' } },
    { id: 'shiftR', unit: 2.75, code: 'ShiftRight', finger: 'rp', isMod: true, label: 'Shift' }
  ];

  const ROW5_DEFS = [
    { id: 'ctrlL', unit: 1.5, code: 'ControlLeft', finger: 'lp', isMod: true, label: 'Ctrl' },
    { id: 'alt', unit: 1.25, code: 'AltLeft', finger: 'lt', isMod: true, label: 'Alt' },
    { id: 'space', unit: 7.5, code: 'Space', finger: 'lt', isMod: true, label: '', isSpace: true },
    { id: 'altgr', unit: 1.25, code: 'AltRight', finger: 'rt', isMod: true, label: 'AltGr' },
    { id: 'ctrlR', unit: 1.5, code: 'ControlRight', finger: 'rp', isMod: true, label: 'Ctrl' }
  ];

  const ALL_ROWS = [ROW1_DEFS, ROW2_DEFS, ROW3_DEFS, ROW4_DEFS, ROW5_DEFS];

  // ------------------------------------------------------------
  // 2. THEME COLOR PALETTES
  // ------------------------------------------------------------
  const THEMES = {
    angkor: {
      name: 'Angkor Gold',
      caseColor: 0x0f1322,
      caseRim: 0xd4af37,
      plateColor: 0x141828,
      keycapBase: '#161c2e',
      keycapGradient: '#1e253c',
      legendBase: '#f1f5f9',
      legendShift: '#f59e0b',
      legendAltgr: '#38bdf8',
      legendMod: '#e2b76e',
      underglow: 0xff9d2e,
      underglowIntensity: 1.2,
      lightAmbient: 0xffeedd,
      lightMain: 0xfff4e0
    },
    rgb: {
      name: 'RGB Chroma Wave',
      caseColor: 0x0a0c16,
      caseRim: 0x22d3ee,
      plateColor: 0x111422,
      keycapBase: '#141829',
      keycapGradient: '#1e2338',
      legendBase: '#ffffff',
      legendShift: '#38bdf8',
      legendAltgr: '#a855f7',
      legendMod: '#38bdf8',
      underglow: 0x06b6d4,
      underglowIntensity: 1.5,
      lightAmbient: 0xedf2f7,
      lightMain: 0xffffff
    },
    neon: {
      name: 'Cyber Neon',
      caseColor: 0x0b0914,
      caseRim: 0xec4899,
      plateColor: 0x150f24,
      keycapBase: '#18112a',
      keycapGradient: '#241a3e',
      legendBase: '#fdf4ff',
      legendShift: '#f43f5e',
      legendAltgr: '#06b6d4',
      legendMod: '#e879f9',
      underglow: 0xd946ef,
      underglowIntensity: 1.4,
      lightAmbient: 0xfdf2f8,
      lightMain: 0xfce7f3
    },
    ceramic: {
      name: 'Ivory Ceramic',
      caseColor: 0x252422,
      caseRim: 0xcca43b,
      plateColor: 0x363533,
      keycapBase: '#eae8e0',
      keycapGradient: '#f6f5f0',
      legendBase: '#1f2937',
      legendShift: '#b45309',
      legendAltgr: '#0369a1',
      legendMod: '#78350f',
      underglow: 0xffbe0b,
      underglowIntensity: 0.8,
      lightAmbient: 0xffffff,
      lightMain: 0xfffaf0
    }
  };

  // ------------------------------------------------------------
  // 3. MECHANICAL SWITCH AUDIO SYNTHESIZER
  // ------------------------------------------------------------
  let audioCtx = null;
  let isMuted = false;

  function initAudioEngine() {
    if (audioCtx) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    } catch (e) {
      // Audio fallback
    }
  }

  function playMechanicalSound(isPress, pitchFactor = 1.0) {
    if (isMuted) return;
    try {
      initAudioEngine();
      if (!audioCtx) return;
      if (audioCtx.state === 'suspended') audioCtx.resume();

      const t = audioCtx.currentTime;

      // 1. Tactile Click Noise Transient
      const clickLen = audioCtx.sampleRate * 0.012;
      const noiseBuffer = audioCtx.createBuffer(1, clickLen, audioCtx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < clickLen; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (clickLen * 0.35));
      }
      const noiseSource = audioCtx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      const clickFilter = audioCtx.createBiquadFilter();
      clickFilter.type = 'bandpass';
      clickFilter.frequency.setValueAtTime((isPress ? 3400 : 4400) * pitchFactor, t);
      clickFilter.Q.setValueAtTime(3.5, t);

      const clickGain = audioCtx.createGain();
      clickGain.gain.setValueAtTime(isPress ? 0.32 : 0.18, t);
      clickGain.gain.exponentialRampToValueAtTime(0.001, t + (isPress ? 0.012 : 0.008));

      noiseSource.connect(clickFilter);
      clickFilter.connect(clickGain);
      clickGain.connect(audioCtx.destination);
      noiseSource.start(t);

      // 2. Solid Aluminum Case Bottom-out Resonance (Press only)
      if (isPress) {
        const thockOsc = audioCtx.createOscillator();
        const thockGain = audioCtx.createGain();
        thockOsc.type = 'triangle';
        thockOsc.frequency.setValueAtTime(220 * pitchFactor, t);
        thockOsc.frequency.exponentialRampToValueAtTime(75 * pitchFactor, t + 0.038);

        thockGain.gain.setValueAtTime(0.42, t);
        thockGain.gain.exponentialRampToValueAtTime(0.001, t + 0.042);

        thockOsc.connect(thockGain);
        thockGain.connect(audioCtx.destination);
        thockOsc.start(t);
        thockOsc.stop(t + 0.045);
      }
    } catch (e) {
      // Audio error suppressed
    }
  }

  // ------------------------------------------------------------
  // 4. MAIN 3D APPLICATION ENGINE
  // ------------------------------------------------------------
  function initKeyboard3D() {
    const container = document.getElementById('keycap3dContainer');
    if (!container || typeof THREE === 'undefined') return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    // A. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x070a14, 0.018);

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    // Ergonomic 3D isometric perspective: elevated angle showing top legends and sculpted profile
    const defaultCamPos = new THREE.Vector3(0, 11.5, 14.2);
    const defaultCamLook = new THREE.Vector3(0, -0.6, 0);
    camera.position.copy(defaultCamPos);
    camera.lookAt(defaultCamLook);

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.3;
      container.appendChild(renderer.domElement);
    } catch (err) {
      console.warn('WebGL initialization failed:', err);
      return;
    }

    // B. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffeedd, 0.7);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xfff4e0, 1.8);
    mainLight.position.set(8, 16, 12);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 40;
    mainLight.shadow.camera.left = -12;
    mainLight.shadow.camera.right = 12;
    mainLight.shadow.camera.top = 10;
    mainLight.shadow.camera.bottom = -10;
    mainLight.shadow.bias = -0.0005;
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.9);
    fillLight.position.set(-12, 8, -8);
    scene.add(fillLight);

    const underglowLight = new THREE.PointLight(0xff9d2e, 2.0, 15);
    underglowLight.position.set(0, -0.6, 0);
    scene.add(underglowLight);

    // Subtle Ground Shadow Floor
    const floorGeo = new THREE.PlaneGeometry(36, 36);
    const floorMat = new THREE.ShadowMaterial({ opacity: 0.35 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.5;
    floor.receiveShadow = true;
    scene.add(floor);

    // Subtle Studio Grid
    const gridHelper = new THREE.GridHelper(26, 26, 0xff9d2e, 0x171f33);
    gridHelper.position.y = -1.49;
    scene.add(gridHelper);

    // Root Assembly Group (Tilted ~4.5° for mechanical ergonomic incline)
    const keyboardRoot = new THREE.Group();
    keyboardRoot.rotation.x = 0.08; // 4.6 degree typing incline
    scene.add(keyboardRoot);

    // C. Configuration State
    let currentLayout = 'standard';
    let currentThemeKey = 'angkor';
    let currentTheme = THEMES.angkor;
    let viewMode = 'keyboard'; // 'keyboard' | 'switch'
    let autoRotate = true;
    let showHands = true;
    let isWireframe = false;
    let isExploded = false;

    // D. Procedural Chassis Construction
    const U = 1.0;          // 1u width
    const GAP = 0.07;       // gap between keys
    const PITCH = U + GAP;  // 1.07 center-to-center
    const TOTAL_COLS = 15;
    const TOTAL_ROWS = 5;

    const boardWidth = TOTAL_COLS * PITCH + 0.8;
    const boardDepth = TOTAL_ROWS * PITCH + 0.8;
    const boardHeight = 0.95;

    // Helper: Rounded Rectangle Shape
    function createRoundedRectShape(w, d, r) {
      const shape = new THREE.Shape();
      const x = -w / 2;
      const y = -d / 2;
      shape.moveTo(x + r, y);
      shape.lineTo(x + w - r, y);
      shape.quadraticCurveTo(x + w, y, x + w, y + r);
      shape.lineTo(x + w, y + d - r);
      shape.quadraticCurveTo(x + w, y + d, x + w - r, y + d);
      shape.lineTo(x + r, y + d);
      shape.quadraticCurveTo(x, y + d, x, y + d - r);
      shape.lineTo(x, y + r);
      shape.quadraticCurveTo(x, y, x + r, y);
      return shape;
    }

    // Chassis Body
    const caseShape = createRoundedRectShape(boardWidth, boardDepth, 0.45);
    const caseGeo = new THREE.ExtrudeGeometry(caseShape, {
      depth: boardHeight,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.12,
      bevelThickness: 0.12
    });
    caseGeo.rotateX(Math.PI / 2);
    caseGeo.translate(0, -boardHeight / 2, 0);

    const caseMat = new THREE.MeshStandardMaterial({
      color: currentTheme.caseColor,
      roughness: 0.38,
      metalness: 0.55
    });
    const caseMesh = new THREE.Mesh(caseGeo, caseMat);
    caseMesh.castShadow = true;
    caseMesh.receiveShadow = true;
    keyboardRoot.add(caseMesh);

    // Golden Chamfer Rim Trim
    const rimShape = createRoundedRectShape(boardWidth + 0.08, boardDepth + 0.08, 0.48);
    const rimGeo = new THREE.ExtrudeGeometry(rimShape, {
      depth: 0.08,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.04,
      bevelThickness: 0.04
    });
    rimGeo.rotateX(Math.PI / 2);
    rimGeo.translate(0, 0.06, 0);

    const rimMat = new THREE.MeshStandardMaterial({
      color: currentTheme.caseRim,
      roughness: 0.22,
      metalness: 0.88
    });
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    keyboardRoot.add(rimMesh);

    // Perimeter Underglow Diffuser Strip
    const underglowGeo = new THREE.RingGeometry(boardWidth * 0.46, boardWidth * 0.51, 64);
    underglowGeo.rotateX(-Math.PI / 2);
    const underglowMat = new THREE.MeshBasicMaterial({
      color: currentTheme.underglow,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide
    });
    const underglowMesh = new THREE.Mesh(underglowGeo, underglowMat);
    underglowMesh.position.y = -boardHeight * 0.95;
    keyboardRoot.add(underglowMesh);

    // Switch Plate (Recessed interior tray)
    const plateShape = createRoundedRectShape(boardWidth - 0.4, boardDepth - 0.4, 0.25);
    const plateGeo = new THREE.ShapeGeometry(plateShape);
    plateGeo.rotateX(-Math.PI / 2);
    const plateMat = new THREE.MeshStandardMaterial({
      color: currentTheme.plateColor,
      roughness: 0.7,
      metalness: 0.3
    });
    const plateMesh = new THREE.Mesh(plateGeo, plateMat);
    plateMesh.position.y = 0.02;
    plateMesh.receiveShadow = true;
    keyboardRoot.add(plateMesh);

    // E. Dynamic Keycap Canvas Texture Generator
    function generateKeyTexture(keyDef, layoutKey, theme) {
      const isWide = keyDef.unit >= 2.0;
      const cvWidth = isWide ? 512 : 256;
      const cvHeight = 256;

      const canvas = document.createElement('canvas');
      canvas.width = cvWidth;
      canvas.height = cvHeight;
      const ctx = canvas.getContext('2d');

      // 1. Background PBT Satin Gradient
      const grad = ctx.createRadialGradient(cvWidth / 2, cvHeight * 0.35, 10, cvWidth / 2, cvHeight / 2, cvWidth * 0.7);
      grad.addColorStop(0, theme.keycapGradient);
      grad.addColorStop(1, theme.keycapBase);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, cvWidth, cvHeight);

      // Fine Inset Bevel Border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 6;
      ctx.strokeRect(6, 6, cvWidth - 12, cvHeight - 12);

      // 2. Glyph & Label Rendering
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      if (keyDef.isMod) {
        // Modifier Key Text (Tab, Caps, Shift, Ctrl, Enter, etc.)
        if (keyDef.label) {
          ctx.font = 'bold 50px "Inter", "Segoe UI", sans-serif';
          ctx.fillStyle = theme.legendMod;
          ctx.shadowColor = 'rgba(0,0,0,0.5)';
          ctx.shadowBlur = 8;
          ctx.fillText(keyDef.label, cvWidth / 2, cvHeight / 2 + 2);
        } else if (keyDef.isSpace) {
          // Spacebar PK branding accent
          ctx.font = '600 32px "Inter", sans-serif';
          ctx.fillStyle = 'rgba(255,255,255,0.18)';
          ctx.fillText('PK KHMER TYPE', cvWidth / 2, cvHeight / 2);
        }
      } else {
        // Glyph Key
        const map = keyDef[layoutKey] || keyDef.std || {};
        const baseChar = map.base || '';
        const shiftChar = map.shift || '';
        const altgrChar = map.altgr || '';

        // Shifted Glyph (Upper right/center in golden amber)
        if (shiftChar) {
          ctx.font = 'bold 54px "Khmer OS Siemreap", "Kantumruy Pro", "Segoe UI", sans-serif';
          ctx.fillStyle = theme.legendShift;
          ctx.shadowColor = 'rgba(245, 158, 11, 0.4)';
          ctx.shadowBlur = 6;
          ctx.textAlign = 'right';
          ctx.fillText(shiftChar, cvWidth - 28, 64);
        }

        // AltGr Glyph (Upper left in cyan if present)
        if (altgrChar) {
          ctx.font = 'bold 42px "Khmer OS Siemreap", "Kantumruy Pro", "Segoe UI", sans-serif';
          ctx.fillStyle = theme.legendAltgr;
          ctx.textAlign = 'left';
          ctx.fillText(altgrChar, 28, 64);
        }

        // Base Glyph (Center/lower prominent in crisp white)
        if (baseChar) {
          ctx.font = 'bold 88px "Khmer OS Siemreap", "Kantumruy Pro", "Segoe UI", sans-serif';
          ctx.fillStyle = theme.legendBase;
          ctx.shadowColor = 'rgba(0,0,0,0.6)';
          ctx.shadowBlur = 8;
          ctx.textAlign = 'center';
          ctx.fillText(baseChar, cvWidth * 0.48, cvHeight * 0.62);
        }

        // Tactile Homing Bump Indicator (on F and J home keys)
        if (keyDef.hasBump) {
          ctx.fillStyle = theme.legendMod;
          ctx.beginPath();
          ctx.roundRect ? ctx.roundRect(cvWidth / 2 - 24, cvHeight - 26, 48, 6, 3) : ctx.rect(cvWidth / 2 - 24, cvHeight - 26, 48, 6);
          ctx.fill();
        }
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.generateMipmaps = true;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      return texture;
    }

    // F. Keycap Geometry & Assembly Matrix
    const keyObjects = [];
    const keyMapById = new Map();
    const keyMapByCode = new Map();

    const startZ = -((TOTAL_ROWS - 1) * PITCH) / 2;

    ALL_ROWS.forEach((rowDefs, rowIdx) => {
      const zPos = startZ + rowIdx * PITCH;
      const rowStartX = -((TOTAL_COLS * PITCH) / 2);
      let currentX = rowStartX;

      rowDefs.forEach((keyDef) => {
        const keyW = keyDef.unit * U + (keyDef.unit - 1) * GAP;
        const keyD = U;
        const keyH = 0.46;
        const keyCenterX = currentX + keyW / 2;
        currentX += keyW + GAP;

        // Group container for individual spring travel
        const keyGroup = new THREE.Group();
        keyGroup.position.set(keyCenterX, 0.22, zPos);

        // Keycap Body (OEM Profile Tapered Chamfered Box)
        const topRatio = keyDef.unit > 3.0 ? 0.94 : 0.82;
        const topW = keyW * topRatio;
        const topD = keyD * 0.82;

        // Construct tapered sculpted keycap mesh
        const capGeo = new THREE.BoxGeometry(topW, keyH, topD);
        const texture = generateKeyTexture(keyDef, currentLayout, currentTheme);

        // Materials: Top face textured, sides satin matte
        const sideMat = new THREE.MeshStandardMaterial({
          color: currentTheme.caseColor,
          roughness: 0.45,
          metalness: 0.2
        });
        const topMat = new THREE.MeshStandardMaterial({
          map: texture,
          roughness: 0.4,
          metalness: 0.15,
          emissive: 0x000000
        });

        // BoxGeometry face materials order: +X, -X, +Y (top), -Y (bottom), +Z, -Z
        const capMaterials = [sideMat, sideMat, topMat, sideMat, sideMat, sideMat];
        const capMesh = new THREE.Mesh(capGeo, capMaterials);
        capMesh.castShadow = true;
        capMesh.receiveShadow = true;
        capMesh.position.y = keyH / 2;
        keyGroup.add(capMesh);

        // Tactile Homing Bump 3D nub on F and J
        if (keyDef.hasBump) {
          const bumpGeo = new THREE.BoxGeometry(0.2, 0.03, 0.04);
          const bumpMat = new THREE.MeshStandardMaterial({ color: currentTheme.caseRim, metalness: 0.7 });
          const bumpMesh = new THREE.Mesh(bumpGeo, bumpMat);
          bumpMesh.position.set(0, keyH + 0.015, topD * 0.34);
          keyGroup.add(bumpMesh);
        }

        // Per-Key RGB / Backlight Emissive Point Light
        const keyLight = new THREE.PointLight(currentTheme.underglow, 0, 1.2);
        keyLight.position.set(0, keyH + 0.1, 0);
        keyGroup.add(keyLight);

        keyboardRoot.add(keyGroup);

        // Store Physics & Interactive State
        const keyState = {
          def: keyDef,
          group: keyGroup,
          capMesh: capMesh,
          topMat: topMat,
          texture: texture,
          keyLight: keyLight,
          baseY: 0.22,
          currentY: 0.22,
          targetY: 0.22,
          velocity: 0,
          isPressed: false,
          press() {
            if (this.isPressed) return;
            this.isPressed = true;
            this.targetY = 0.06; // Spring stroke depth
            this.topMat.emissive.setHex(currentTheme.underglow);
            this.topMat.emissiveIntensity = 0.95;
            this.keyLight.intensity = 1.8;
            playMechanicalSound(true, 1.0 + (Math.random() * 0.1 - 0.05));
            strikeHolographicFinger(this.def);
            triggerKeystrokeRipple(this);
            updateKeyReadoutHUD(this.def);
          },
          release() {
            this.isPressed = false;
            this.targetY = this.baseY;
            this.topMat.emissive.setHex(0x000000);
            this.topMat.emissiveIntensity = 0;
            this.keyLight.intensity = 0;
            playMechanicalSound(false, 1.1 + (Math.random() * 0.1 - 0.05));
          },
          updateTexture() {
            if (this.texture) this.texture.dispose();
            this.texture = generateKeyTexture(this.def, currentLayout, currentTheme);
            this.topMat.map = this.texture;
            this.topMat.needsUpdate = true;
          }
        };

        keyObjects.push(keyState);
        keyMapById.set(keyDef.id, keyState);
        if (keyDef.code) keyMapByCode.set(keyDef.code, keyState);
      });
    });

    // G. Switch Anatomy Model (Central Exploded View Sub-Assembly)
    const switchAnatomyGroup = new THREE.Group();
    switchAnatomyGroup.position.set(0, 0.4, 0);
    switchAnatomyGroup.visible = false;
    keyboardRoot.add(switchAnatomyGroup);

    // Switch Bottom Housing (Black Nylon)
    const swBottomGeo = new THREE.BoxGeometry(1.4, 0.6, 1.4);
    const swBottomMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.6 });
    const swBottom = new THREE.Mesh(swBottomGeo, swBottomMat);
    swBottom.position.y = 0.3;
    switchAnatomyGroup.add(swBottom);

    // Coiled Helical Spring Wire
    const springCurve = new THREE.CatmullRomCurve3(
      Array.from({ length: 40 }, (_, i) => {
        const theta = (i / 40) * Math.PI * 12;
        const y = 0.6 + (i / 40) * 0.8;
        return new THREE.Vector3(Math.cos(theta) * 0.22, y, Math.sin(theta) * 0.22);
      })
    );
    const springGeo = new THREE.TubeGeometry(springCurve, 40, 0.035, 8, false);
    const springMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9, roughness: 0.2 });
    const springMesh = new THREE.Mesh(springGeo, springMat);
    switchAnatomyGroup.add(springMesh);

    // MX Cross Stem (Vibrant POM Plastic)
    const stemGroup = new THREE.Group();
    const stemCrossV = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.9, 0.55), new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 }));
    const stemCrossH = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.9, 0.18), new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 }));
    stemGroup.add(stemCrossV, stemCrossH);
    stemGroup.position.y = 1.3;
    switchAnatomyGroup.add(stemGroup);

    // Translucent Switch Upper Housing
    const swTopGeo = new THREE.BoxGeometry(1.42, 0.55, 1.42);
    const swTopMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.45, roughness: 0.15 });
    const swTop = new THREE.Mesh(swTopGeo, swTopMat);
    swTop.position.y = 0.9;
    switchAnatomyGroup.add(swTop);

    // Showcase Macro Keycap
    const macroCapGeo = new THREE.BoxGeometry(1.6, 0.7, 1.6);
    const macroTexture = generateKeyTexture(ROW3_DEFS[8], 'standard', currentTheme); // Key 'k' / 'ក'
    const macroCapMat = new THREE.MeshStandardMaterial({ map: macroTexture, roughness: 0.35 });
    const macroCap = new THREE.Mesh(macroCapGeo, macroCapMat);
    macroCap.position.y = 2.1;
    switchAnatomyGroup.add(macroCap);

    // H. Holographic Kinematic Hands Guide
    const handsGuideGroup = new THREE.Group();
    keyboardRoot.add(handsGuideGroup);

    const leftHandColor = 0xffa01e;  // Amber Gold (Matches left hand in app)
    const rightHandColor = 0xd946ef; // Magenta Purple (Matches right hand in app)

    function createHandRig(isLeft) {
      const handRig = new THREE.Group();
      const color = isLeft ? leftHandColor : rightHandColor;
      const palmX = isLeft ? -3.95 : 2.45;
      const palmY = 0.50;
      const palmZ = 3.65;

      // 1. Translucent Holographic Palm Plate
      const palmShape = new THREE.Shape();
      palmShape.moveTo(-1.6, -1.05);
      palmShape.lineTo(1.6, -1.05);
      palmShape.quadraticCurveTo(1.7, 0.1, 1.35, 1.05);
      palmShape.lineTo(-1.35, 1.05);
      palmShape.quadraticCurveTo(-1.7, 0.1, -1.6, -1.05);
      palmShape.closePath();

      const palmGeo = new THREE.ShapeGeometry(palmShape);
      palmGeo.rotateX(-Math.PI / 2);

      const palmMat = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.25,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });
      const palmMesh = new THREE.Mesh(palmGeo, palmMat);
      palmMesh.position.set(palmX, palmY, palmZ);
      palmMesh.rotation.y = isLeft ? -0.06 : 0.06;
      handRig.add(palmMesh);

      // Glowing Palm Perimeter
      const palmEdges = new THREE.LineSegments(
        new THREE.EdgesGeometry(palmGeo),
        new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending })
      );
      palmEdges.position.copy(palmMesh.position);
      palmEdges.rotation.copy(palmMesh.rotation);
      handRig.add(palmEdges);

      // Soft Palm Core Glow Light
      const palmLight = new THREE.PointLight(color, 0.8, 6.0);
      palmLight.position.set(palmX, palmY + 0.3, palmZ);
      handRig.add(palmLight);

      // 2. Luminous Fingertip Beacons & Beams
      const anchorKeyIds = isLeft
        ? ['a', 's', 'd', 'f', 'space']
        : ['j', 'k', 'l', 'semicolon', 'space'];

      const fingers = [];

      anchorKeyIds.forEach((keyId, idx) => {
        const keyObj = keyMapById.get(keyId);
        let homeX = 0;
        let homeZ = 0;
        if (keyId === 'space') {
          homeX = isLeft ? -1.5 : 1.5;
          homeZ = keyObj ? keyObj.group.position.z : 2.14;
        } else if (keyObj) {
          homeX = keyObj.group.position.x;
          homeZ = keyObj.group.position.z;
        }
        const homeY = 0.50;

        // Holographic Glowing Beacon Ring hovering above Keycap
        const ringGeo = new THREE.RingGeometry(0.18, 0.30, 32);
        ringGeo.rotateX(-Math.PI / 2);
        const ringMat = new THREE.MeshBasicMaterial({
          color: color,
          transparent: true,
          opacity: 0.9,
          side: THREE.DoubleSide,
          depthWrite: false,
          blending: THREE.AdditiveBlending
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.position.set(homeX, homeY, homeZ);
        handRig.add(ringMesh);

        // Center Glowing Pip
        const pipGeo = new THREE.CircleGeometry(0.09, 16);
        pipGeo.rotateX(-Math.PI / 2);
        const pipMesh = new THREE.Mesh(pipGeo, ringMat);
        pipMesh.position.set(homeX, homeY + 0.005, homeZ);
        handRig.add(pipMesh);

        // Knuckle Anchor Coordinates along top arch of palm
        let knuckleX, knuckleZ;
        const knuckleY = palmY + 0.08;
        if (isLeft) {
          if (idx === 4) { // Thumb
            knuckleX = -2.3;
            knuckleZ = palmZ - 0.25;
          } else { // Pinky (-5.1), Ring (-4.3), Middle (-3.5), Index (-2.7)
            const leftKnuckles = [-5.0, -4.25, -3.5, -2.75];
            knuckleX = leftKnuckles[idx];
            knuckleZ = palmZ - 1.0;
          }
        } else {
          if (idx === 4) { // Thumb
            knuckleX = 1.05;
            knuckleZ = palmZ - 0.25;
          } else { // Index (1.1), Middle (1.9), Ring (2.7), Pinky (3.5)
            const rightKnuckles = [1.15, 1.9, 2.7, 3.5];
            knuckleX = rightKnuckles[idx];
            knuckleZ = palmZ - 1.0;
          }
        }

        // Tapered Cyber Beam connecting Palm Knuckle to Fingertip
        const kPos = new THREE.Vector3(knuckleX, knuckleY, knuckleZ);
        const tPos = new THREE.Vector3(homeX, homeY, homeZ);
        const mPos = new THREE.Vector3((knuckleX + homeX) / 2, homeY + 0.38, (knuckleZ + homeZ) / 2);

        const beamCurve = new THREE.QuadraticBezierCurve3(kPos, mPos, tPos);
        const beamGeo = new THREE.TubeGeometry(beamCurve, 16, 0.045, 6, false);
        const beamMat = new THREE.MeshBasicMaterial({
          color: color,
          transparent: true,
          opacity: 0.52,
          depthWrite: false,
          blending: THREE.AdditiveBlending
        });
        const beamMesh = new THREE.Mesh(beamGeo, beamMat);
        handRig.add(beamMesh);

        fingers.push({
          keyId: keyId,
          homePos: new THREE.Vector3(homeX, homeY, homeZ),
          currentPos: new THREE.Vector3(homeX, homeY, homeZ),
          targetPos: new THREE.Vector3(homeX, homeY, homeZ),
          knucklePos: kPos,
          ringMesh: ringMesh,
          pipMesh: pipMesh,
          beamMesh: beamMesh,
          beamMat: beamMat,
          strikePhase: 0
        });
      });

      return { rig: handRig, fingers: fingers, palmMesh: palmMesh, palmEdges: palmEdges, palmLight: palmLight };
    }

    const leftHand = createHandRig(true);
    const rightHand = createHandRig(false);
    handsGuideGroup.add(leftHand.rig);
    handsGuideGroup.add(rightHand.rig);

    // Strike Kinematic Finger
    function strikeHolographicFinger(keyDef) {
      if (!showHands) return;
      const fingerType = keyDef.finger || 'li';
      const isLeft = fingerType.startsWith('l');
      const hand = isLeft ? leftHand : rightHand;

      let fingerIdx = 0;
      if (isLeft) {
        if (fingerType.endsWith('p')) fingerIdx = 0; // Pinky (a)
        else if (fingerType.endsWith('r')) fingerIdx = 1; // Ring (s)
        else if (fingerType.endsWith('m')) fingerIdx = 2; // Middle (d)
        else if (fingerType.endsWith('i')) fingerIdx = 3; // Index (f)
        else if (fingerType.endsWith('t')) fingerIdx = 4; // Thumb (space)
      } else {
        if (fingerType.endsWith('i')) fingerIdx = 0; // Index (j)
        else if (fingerType.endsWith('m')) fingerIdx = 1; // Middle (k)
        else if (fingerType.endsWith('r')) fingerIdx = 2; // Ring (l)
        else if (fingerType.endsWith('p')) fingerIdx = 3; // Pinky (semicolon)
        else if (fingerType.endsWith('t')) fingerIdx = 4; // Thumb (space)
      }

      const f = hand.fingers[fingerIdx];
      if (!f) return;

      const targetKey = keyMapById.get(keyDef.id);
      if (targetKey) {
        f.targetPos.set(targetKey.group.position.x, 0.32, targetKey.group.position.z);
        f.strikePhase = 1.0;
        f.ringMesh.scale.set(1.4, 1.4, 1.4);
      }
    }

    // Reactive Keystroke Light Ripple Wave
    function triggerKeystrokeRipple(originKey) {
      const ox = originKey.group.position.x;
      const oz = originKey.group.position.z;
      const color = currentTheme.underglow;

      keyObjects.forEach(k => {
        if (k === originKey) return;
        const dx = k.group.position.x - ox;
        const dz = k.group.position.z - oz;
        const dist = Math.sqrt(dx * dx + dz * dz);

        if (dist <= 6.5) {
          const delayMs = dist * 28;
          setTimeout(() => {
            if (!k.isPressed) {
              k.topMat.emissive.setHex(color);
              k.topMat.emissiveIntensity = 0.55 * (1 - dist / 6.5);
              setTimeout(() => {
                if (!k.isPressed && currentThemeKey !== 'rgb') {
                  k.topMat.emissive.setHex(0x000000);
                  k.topMat.emissiveIntensity = 0;
                }
              }, 130);
            }
          }, delayMs);
        }
      });
    }

    // Real-time Cybernetic HUD Keystroke Readout
    function updateKeyReadoutHUD(keyDef) {
      const valEl = document.getElementById('readoutKeyVal');
      const fingerEl = document.getElementById('readoutFingerVal');
      if (!valEl || !fingerEl) return;

      const fingerNames = {
        lp: 'Left Hand · Pinky',
        lr: 'Left Hand · Ring',
        lm: 'Left Hand · Middle',
        li: 'Left Hand · Index',
        lt: 'Left Hand · Thumb',
        ri: 'Right Hand · Index',
        rm: 'Right Hand · Middle',
        rr: 'Right Hand · Ring',
        rp: 'Right Hand · Pinky',
        rt: 'Right Hand · Thumb'
      };

      let label = '';
      if (keyDef.isMod) {
        label = keyDef.label ? `[ ${keyDef.label} ]` : (keyDef.isSpace ? '[ Spacebar ]' : `[ ${keyDef.id} ]`);
      } else {
        const map = keyDef[currentLayout] || keyDef.std || {};
        const baseChar = map.base || '';
        const enChar = keyDef.en ? keyDef.en.base.toUpperCase() : '';
        label = baseChar && enChar ? `[ ${baseChar}  /  ${enChar} ]` : `[ ${baseChar || enChar || keyDef.id} ]`;
      }

      valEl.textContent = label;
      fingerEl.textContent = (fingerNames[keyDef.finger] || 'Any Finger') + (keyDef.isHome ? ' · Home Anchor' : '');
    }

    // I. Smooth Orbit & Pan Camera Controller
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let sphericalTheta = 0;
    let sphericalPhi = Math.PI / 3.4;
    let sphericalRadius = 18.5;
    let targetRadius = 18.5;

    function updateCameraFromAngles() {
      const targetLook = viewMode === 'switch' ? new THREE.Vector3(0, 1.4, 0) : defaultCamLook;
      camera.position.x = targetLook.x + targetRadius * Math.sin(sphericalPhi) * Math.sin(sphericalTheta);
      camera.position.y = targetLook.y + targetRadius * Math.cos(sphericalPhi);
      camera.position.z = targetLook.z + targetRadius * Math.sin(sphericalPhi) * Math.cos(sphericalTheta);
      camera.lookAt(targetLook);
    }
    updateCameraFromAngles();

    // Mouse & Touch Interaction
    renderer.domElement.addEventListener('pointerdown', (e) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
      initAudioEngine();

      // Raycast to click 3D keycaps
      const rect = renderer.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);

      const interactiveMeshes = keyObjects.map(k => k.capMesh);
      const intersects = raycaster.intersectObjects(interactiveMeshes);

      if (intersects.length > 0) {
        const hitCap = intersects[0].object;
        const hitKey = keyObjects.find(k => k.capMesh === hitCap);
        if (hitKey) {
          hitKey.press();
          setTimeout(() => hitKey.release(), 140);
        }
      }
    });

    window.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouseX;
      const dy = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      sphericalTheta -= dx * 0.007;
      sphericalPhi = Math.max(0.18, Math.min(Math.PI / 2.05, sphericalPhi - dy * 0.007));
      autoRotate = false;
      const spinBtn = document.getElementById('btnAutoRotate');
      if (spinBtn) spinBtn.classList.remove('active');
    });

    window.addEventListener('pointerup', () => { isDragging = false; });
    window.addEventListener('pointercancel', () => { isDragging = false; });

    renderer.domElement.addEventListener('wheel', (e) => {
      e.preventDefault();
      targetRadius = Math.max(8, Math.min(32, targetRadius + e.deltaY * 0.015));
    }, { passive: false });

    // J. Physical Hardware Keyboard Event Listeners
    window.addEventListener('keydown', (e) => {
      const keyObj = keyMapByCode.get(e.code);
      if (keyObj && !keyObj.isPressed) {
        keyObj.press();
      }
    });

    window.addEventListener('keyup', (e) => {
      const keyObj = keyMapByCode.get(e.code);
      if (keyObj) {
        keyObj.release();
      }
    });

    // K. UI Controls Toolbar Integration
    function setupControls() {
      // 1. Layout Switching
      const layoutButtons = document.querySelectorAll('.key-layout-btn');
      layoutButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          layoutButtons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          currentLayout = btn.dataset.layout || 'standard';
          keyObjects.forEach(k => k.updateTexture());
        });
      });

      // 2. Material Themes
      const themeButtons = document.querySelectorAll('.key-theme-btn');
      themeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          themeButtons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          currentThemeKey = btn.dataset.theme || 'angkor';
          currentTheme = THEMES[currentThemeKey] || THEMES.angkor;

          caseMat.color.setHex(currentTheme.caseColor);
          rimMat.color.setHex(currentTheme.caseRim);
          plateMat.color.setHex(currentTheme.plateColor);
          underglowMat.color.setHex(currentTheme.underglow);
          underglowLight.color.setHex(currentTheme.underglow);
          underglowLight.intensity = currentTheme.underglowIntensity;
          ambientLight.color.setHex(currentTheme.lightAmbient);
          mainLight.color.setHex(currentTheme.lightMain);

          keyObjects.forEach(k => k.updateTexture());
        });
      });

      // 3. View Mode (Full Keyboard vs Switch Anatomy)
      const viewButtons = document.querySelectorAll('.key-view-btn');
      viewButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          viewButtons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          viewMode = btn.dataset.view || 'keyboard';

          if (viewMode === 'switch') {
            targetRadius = 7.5;
            sphericalPhi = Math.PI / 4;
            switchAnatomyGroup.visible = true;
          } else {
            targetRadius = 18.5;
            sphericalPhi = Math.PI / 3.4;
            switchAnatomyGroup.visible = false;
          }
        });
      });

      // 4. Camera Angle Presets
      const angleButtons = document.querySelectorAll('.key-angle-btn');
      angleButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          angleButtons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const angle = btn.dataset.angle;
          autoRotate = false;
          const spinBtn = document.getElementById('btnAutoRotate');
          if (spinBtn) spinBtn.classList.remove('active');

          if (angle === 'iso') {
            sphericalTheta = 0;
            sphericalPhi = Math.PI / 3.4;
            targetRadius = 18.5;
          } else if (angle === 'top') {
            sphericalTheta = 0;
            sphericalPhi = 0.18;
            targetRadius = 16.5;
          } else if (angle === 'profile') {
            sphericalTheta = -0.45;
            sphericalPhi = Math.PI / 2.3;
            targetRadius = 14.5;
          }
        });
      });

      // 5. Action Buttons
      const btnRotate = document.getElementById('btnAutoRotate');
      if (btnRotate) {
        btnRotate.addEventListener('click', () => {
          autoRotate = !autoRotate;
          btnRotate.classList.toggle('active', autoRotate);
        });
      }

      const btnHands = document.getElementById('btnToggleHands');
      if (btnHands) {
        btnHands.addEventListener('click', () => {
          showHands = !showHands;
          handsGuideGroup.visible = showHands;
          btnHands.classList.toggle('active', showHands);
        });
      }

      const btnWireframe = document.getElementById('btnWireframe');
      if (btnWireframe) {
        btnWireframe.addEventListener('click', () => {
          isWireframe = !isWireframe;
          caseMat.wireframe = isWireframe;
          keyObjects.forEach(k => { k.topMat.wireframe = isWireframe; });
          btnWireframe.classList.toggle('active', isWireframe);
        });
      }

      const btnExplode = document.getElementById('btnExplodedView');
      if (btnExplode) {
        btnExplode.addEventListener('click', () => {
          isExploded = !isExploded;
          btnExplode.classList.toggle('active', isExploded);
          if (viewMode !== 'switch') {
            // Explode entire keycap layer upwards
            keyObjects.forEach(k => {
              k.targetY = isExploded ? 1.6 : k.baseY;
            });
          } else {
            // Explode switch sub-assembly
            macroCap.position.y = isExploded ? 3.4 : 2.1;
            stemGroup.position.y = isExploded ? 2.2 : 1.3;
            swTop.position.y = isExploded ? 1.5 : 0.9;
          }
        });
      }

      const btnReset = document.getElementById('btnReset3DView');
      if (btnReset) {
        btnReset.addEventListener('click', () => {
          sphericalTheta = 0;
          sphericalPhi = Math.PI / 3.4;
          targetRadius = 18.5;
          autoRotate = true;
          if (btnRotate) btnRotate.classList.add('active');
        });
      }

      const btnPress = document.getElementById('btnPressTrigger');
      if (btnPress) {
        btnPress.addEventListener('click', () => {
          initAudioEngine();
          // Staggered ripple press across home row keys
          const homeKeys = ['a', 's', 'd', 'f', 'j', 'k', 'l', 'semicolon'];
          homeKeys.forEach((id, i) => {
            setTimeout(() => {
              const k = keyMapById.get(id);
              if (k) {
                k.press();
                setTimeout(() => k.release(), 150);
              }
            }, i * 75);
          });
        });
      }

      // Auto-Type Melodic Demo Button
      const btnTypeDemo = document.getElementById('btnTypeDemo');
      if (btnTypeDemo) {
        let isTypingDemo = false;
        btnTypeDemo.addEventListener('click', () => {
          if (isTypingDemo) return;
          isTypingDemo = true;
          btnTypeDemo.classList.add('active');
          initAudioEngine();

          const phrase = ['p', 'k', 'space', 'k', 'h', 'm', 'e', 'r', 'space', 't', 'y', 'p', 'e'];
          phrase.forEach((id, idx) => {
            setTimeout(() => {
              const k = keyMapById.get(id);
              if (k) {
                k.press();
                setTimeout(() => k.release(), 130);
              }
              if (idx === phrase.length - 1) {
                setTimeout(() => {
                  isTypingDemo = false;
                  btnTypeDemo.classList.remove('active');
                }, 400);
              }
            }, idx * 160);
          });
        });
      }

      // Audio Mute Toggle
      const btnSound = document.getElementById('btnToggleSound');
      if (btnSound) {
        btnSound.addEventListener('click', () => {
          isMuted = !isMuted;
          btnSound.classList.toggle('active', !isMuted);
        });
      }

      // Compatibility glyph selector buttons
      const glyphButtons = document.querySelectorAll('.key-glyph-btn');
      glyphButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          glyphButtons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const sampleKey = keyMapById.get('k');
          if (sampleKey) {
            sampleKey.press();
            setTimeout(() => sampleKey.release(), 180);
          }
        });
      });
    }
    setupControls();

    // L. Animation & Physics Render Loop
    const clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.1);
      const time = clock.getElapsedTime();

      // 1. Auto Turntable Orbit
      if (autoRotate && !isDragging) {
        sphericalTheta += 0.28 * delta;
      }

      // 2. Smooth Zoom Interpolation
      sphericalRadius += (targetRadius - sphericalRadius) * 0.1;
      updateCameraFromAngles();

      // 3. Spring Keycap Physics Simulation
      keyObjects.forEach(k => {
        const springK = 0.42;
        const damping = 0.74;
        const diff = k.targetY - k.currentY;
        k.velocity += diff * springK;
        k.velocity *= damping;
        k.currentY += k.velocity;
        k.group.position.y = k.currentY;
      });

      // 4. Chroma RGB Wave Effect
      if (currentThemeKey === 'rgb') {
        keyObjects.forEach(k => {
          const hue = (time * 0.28 + (k.group.position.x / boardWidth) + (k.group.position.z / boardDepth)) % 1.0;
          k.keyLight.color.setHSL(hue, 1.0, 0.5);
          if (!k.isPressed) {
            k.topMat.emissive.setHSL(hue, 0.9, 0.15);
          }
        });
        const underglowHue = (time * 0.28) % 1.0;
        underglowMat.color.setHSL(underglowHue, 1.0, 0.5);
        underglowLight.color.setHSL(underglowHue, 1.0, 0.5);
      }

      // 5. Holographic Kinematic Hands Floating Oscillation
      if (showHands) {
        const hoverOffset = Math.sin(time * 2.2) * 0.035;
        leftHand.palmMesh.position.y = 0.52 + hoverOffset;
        leftHand.palmEdges.position.y = 0.52 + hoverOffset;
        if (leftHand.palmLight) leftHand.palmLight.position.y = 0.82 + hoverOffset;

        rightHand.palmMesh.position.y = 0.52 + hoverOffset;
        rightHand.palmEdges.position.y = 0.52 + hoverOffset;
        if (rightHand.palmLight) rightHand.palmLight.position.y = 0.82 + hoverOffset;

        // Kinematic Finger Recoil Decay
        [leftHand, rightHand].forEach(hand => {
          hand.fingers.forEach(f => {
            if (f.strikePhase > 0) {
              f.strikePhase -= delta * 3.5;
              if (f.strikePhase <= 0) {
                f.strikePhase = 0;
                f.targetPos.copy(f.homePos);
                f.ringMesh.scale.set(1.0, 1.0, 1.0);
              }
            }
            f.currentPos.lerp(f.targetPos, 0.2);
            f.ringMesh.position.copy(f.currentPos);
            f.pipMesh.position.set(f.currentPos.x, f.currentPos.y + 0.005, f.currentPos.z);
          });
        });
      }

      renderer.render(scene, camera);
    }
    animate();

    // M. Window Resize Handling
    window.addEventListener('resize', () => {
      if (!container) return;
      const w = container.clientWidth || 800;
      const h = container.clientHeight || 500;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
  }

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initKeyboard3D);
  } else {
    initKeyboard3D();
  }
})();
