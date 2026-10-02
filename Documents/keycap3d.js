/* ============================================================
   PK Khmer Type — Interactive 3D Mechanical Keyboard & Switch Engine
   Built with Three.js (Zero-Dependency Offline Bundle)
   Features:
   - Full 61-Key ANSI Mechanical Keyboard with CNC Anodized Aluminum Chassis
   - Sculpted OEM/Cherry Profile Keycaps with Dish Tops & Homing Bars
   - Miniature Mechanical Switch Housings & Colored Stems on Switch Plate
   - Heavy Brass Base Weight, Desk Mat & Coiled Braided Aviator Cable
   - Dynamic Bilingual Canvas Legend Generator (Khmer Standard, NiDA, English)
   - Real-Time Spring Physics & Hardware Typing Listener (Type on real keyboard!)
   - Raycasting Mouse/Touch Interaction on any Key
   - Jarvis / Cyber HUD Holographic Hands Guide with Reticles & Laser Beams
   - Museum-Grade Dedicated Macro Mechanical Switch Anatomy Showcase:
     * CNC Machined Testing Stage with LED Halo Channel
     * PA66 Nylon Bottom Housing with Brass Contact Pins & Center Post
     * High-Conductivity Copper Leaf Switch Contacts
     * 62g Polished Gold Progressive Helical Spring
     * High-Precision Ruby POM MX Cross Stem with Slider Rails
     * Crystal-Clear Frosted Polycarbonate Upper Housing with Snap Latches
     * Double-Shot Sculpted PBT Keycap with Underside Cross Socket
     * Vertical Exploded Separation with Holographic Laser Callout Labels
   - Reactive Mechanical Switch Web Audio Click Synthesizer (Lubed Thock & Clack)
   - Dynamic Chroma RGB Wave & Expanding Keystroke Shockwaves
   - Visual Themes: Angkor Gold, RGB Chroma Wave, Cyber Neon, Ivory Ceramic
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
    { id: 'backspace', unit: 2.0, code: 'Backspace', finger: 'rp', isMod: true, label: 'Backspace' }
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
    { id: 'enter', unit: 1.5, code: 'Enter', finger: 'rp', isMod: true, isAccent: true, label: 'Enter' }
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
      caseColor: 0x0a0e1a,
      caseRim: 0xd4af37,
      plateColor: 0x141a29,
      accentColor: 0xd97706,
      keycapBase: '#121727',
      keycapGradient: '#1e263d',
      legendBase: '#f8fafc',
      legendShift: '#f59e0b',
      legendAltgr: '#38bdf8',
      legendMod: '#fbbf24',
      underglow: 0xffa500,
      underglowIntensity: 2.0,
      lightAmbient: 0xffeedd,
      lightMain: 0xfff3db,
      stemColor: 0xbe123c,
      deskpadColor: 0x090c15
    },
    rgb: {
      name: 'RGB Chroma Wave',
      caseColor: 0x060810,
      caseRim: 0x06b6d4,
      plateColor: 0x0f1522,
      accentColor: 0xec4899,
      keycapBase: '#101422',
      keycapGradient: '#1a2034',
      legendBase: '#ffffff',
      legendShift: '#38bdf8',
      legendAltgr: '#a855f7',
      legendMod: '#22d3ee',
      underglow: 0x06b6d4,
      underglowIntensity: 2.4,
      lightAmbient: 0xedf2f7,
      lightMain: 0xffffff,
      stemColor: 0x10b981,
      deskpadColor: 0x060811
    },
    neon: {
      name: 'Cyber Neon',
      caseColor: 0x0d0718,
      caseRim: 0xec4899,
      plateColor: 0x160c26,
      accentColor: 0x8b5cf6,
      keycapBase: '#170f2a',
      keycapGradient: '#261944',
      legendBase: '#fdf4ff',
      legendShift: '#f43f5e',
      legendAltgr: '#06b6d4',
      legendMod: '#e879f9',
      underglow: 0xd946ef,
      underglowIntensity: 2.2,
      lightAmbient: 0xfdf2f8,
      lightMain: 0xfce7f3,
      stemColor: 0xd946ef,
      deskpadColor: 0x0a0514
    },
    ceramic: {
      name: 'Ivory Ceramic',
      caseColor: 0x1c1917,
      caseRim: 0xd97706,
      plateColor: 0x292524,
      accentColor: 0xb45309,
      keycapBase: '#eae8e0',
      keycapGradient: '#f7f6f2',
      legendBase: '#1c1917',
      legendShift: '#b45309',
      legendAltgr: '#0369a1',
      legendMod: '#78350f',
      underglow: 0xf59e0b,
      underglowIntensity: 1.2,
      lightAmbient: 0xffffff,
      lightMain: 0xfffaf0,
      stemColor: 0xe0e7ff,
      deskpadColor: 0x141210
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

      // 1. Tactile Click Noise Transient (Spring & Leaf engagement)
      const clickLen = Math.floor(audioCtx.sampleRate * 0.014);
      const noiseBuffer = audioCtx.createBuffer(1, clickLen, audioCtx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < clickLen; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (clickLen * 0.32));
      }
      const noiseSource = audioCtx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      const clickFilter = audioCtx.createBiquadFilter();
      clickFilter.type = 'bandpass';
      clickFilter.frequency.setValueAtTime((isPress ? 3800 : 4600) * pitchFactor, t);
      clickFilter.Q.setValueAtTime(3.8, t);

      const clickGain = audioCtx.createGain();
      clickGain.gain.setValueAtTime(isPress ? 0.35 : 0.20, t);
      clickGain.gain.exponentialRampToValueAtTime(0.001, t + (isPress ? 0.014 : 0.009));

      noiseSource.connect(clickFilter);
      clickFilter.connect(clickGain);
      clickGain.connect(audioCtx.destination);
      noiseSource.start(t);

      // 2. Lubed Deep Bottom-Out Thock Resonance (Housing acoustic boom)
      if (isPress) {
        const thockOsc = audioCtx.createOscillator();
        const thockGain = audioCtx.createGain();
        thockOsc.type = 'triangle';
        thockOsc.frequency.setValueAtTime(240 * pitchFactor, t);
        thockOsc.frequency.exponentialRampToValueAtTime(70 * pitchFactor, t + 0.042);

        thockGain.gain.setValueAtTime(0.48, t);
        thockGain.gain.exponentialRampToValueAtTime(0.001, t + 0.046);

        thockOsc.connect(thockGain);
        thockGain.connect(audioCtx.destination);
        thockOsc.start(t);
        thockOsc.stop(t + 0.05);
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
    const height = container.clientHeight || 520;

    // A. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060913, 0.015);

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    const defaultCamLook = new THREE.Vector3(0, -0.4, 0);

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.35;
      container.appendChild(renderer.domElement);
    } catch (err) {
      console.warn('WebGL initialization failed:', err);
      return;
    }

    // B. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffeedd, 0.75);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xfff5e4, 2.2);
    mainLight.position.set(10, 18, 14);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 40;
    mainLight.shadow.camera.left = -14;
    mainLight.shadow.camera.right = 14;
    mainLight.shadow.camera.top = 12;
    mainLight.shadow.camera.bottom = -12;
    mainLight.shadow.bias = -0.0004;
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 1.1);
    fillLight.position.set(-14, 9, -10);
    scene.add(fillLight);

    const underglowLight = new THREE.PointLight(0xffa500, 2.4, 18);
    underglowLight.position.set(0, -0.4, 0);
    scene.add(underglowLight);

    // Subtle Ground Floor
    const floorGeo = new THREE.PlaneGeometry(48, 48);
    const floorMat = new THREE.ShadowMaterial({ opacity: 0.45 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.65;
    floor.receiveShadow = true;
    scene.add(floor);

    // C. Configuration State
    let currentLayout = 'standard';
    let currentThemeKey = 'angkor';
    let currentTheme = THEMES.angkor;
    let viewMode = 'keyboard'; // 'keyboard' | 'switch'
    let autoRotate = true;
    let showHands = true;
    let isWireframe = false;
    let isExploded = false;

    // D. Helper Shapes & Geometries
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

    // Helper: Sculpted OEM/Cherry Keycap Geometry (Tapered profile with dished finger saddle)
    function createSculptedKeycapGeometry(w, d, h, isWide) {
      const geo = new THREE.BoxGeometry(w, h, d, 2, 2, 2);
      const pos = geo.attributes.position;
      const topTaperW = isWide ? 0.92 : 0.78;
      const topTaperD = 0.78;
      for (let i = 0; i < pos.count; i++) {
        const y = pos.getY(i);
        if (y > 0) { // Top half vertices
          pos.setX(i, pos.getX(i) * topTaperW);
          pos.setZ(i, pos.getZ(i) * topTaperD);
          // Subtle cylindrical dish indentation along Z axis
          const normX = pos.getX(i) / (w * topTaperW * 0.5);
          const dish = Math.cos(normX * Math.PI * 0.45) * 0.022;
          pos.setY(i, y - dish);
        }
      }
      geo.computeVertexNormals();
      return geo;
    }

    // ============================================================
    // E. ASSEMBLE 1: FULL 61-KEY MECHANICAL KEYBOARD
    // ============================================================
    const keyboardRoot = new THREE.Group();
    keyboardRoot.rotation.x = 0.09; // 5.2 degree ergonomic mechanical incline
    scene.add(keyboardRoot);

    const U = 1.0;
    const GAP = 0.07;
    const PITCH = U + GAP;
    const TOTAL_COLS = 15;
    const TOTAL_ROWS = 5;

    const boardWidth = TOTAL_COLS * PITCH + 0.85;
    const boardDepth = TOTAL_ROWS * PITCH + 0.85;
    const boardHeight = 0.95;

    // 1. Sleek Desk Mat (Custom Dark Texture with Stitched Perimeter)
    const deskpadWidth = boardWidth + 3.2;
    const deskpadDepth = boardDepth + 3.6;
    const deskpadShape = createRoundedRectShape(deskpadWidth, deskpadDepth, 0.6);
    const deskpadGeo = new THREE.ShapeGeometry(deskpadShape);
    deskpadGeo.rotateX(-Math.PI / 2);
    const deskpadMat = new THREE.MeshStandardMaterial({
      color: currentTheme.deskpadColor,
      roughness: 0.88,
      metalness: 0.1
    });
    const deskpadMesh = new THREE.Mesh(deskpadGeo, deskpadMat);
    deskpadMesh.position.y = -boardHeight - 0.02;
    deskpadMesh.receiveShadow = true;
    keyboardRoot.add(deskpadMesh);

    // Glowing Desk Mat Stitched Border
    const deskpadBorder = new THREE.LineSegments(
      new THREE.EdgesGeometry(deskpadGeo),
      new THREE.LineBasicMaterial({ color: currentTheme.underglow, transparent: true, opacity: 0.35 })
    );
    deskpadBorder.position.copy(deskpadMesh.position);
    deskpadBorder.position.y += 0.002;
    keyboardRoot.add(deskpadBorder);

    // 2. Custom Coiled Aviator Cable (Enthusiast Braided Cable)
    const cableGroup = new THREE.Group();
    cableGroup.position.set(-boardWidth * 0.38, -boardHeight + 0.08, -boardDepth * 0.58);

    const cableCurve = new THREE.CatmullRomCurve3(
      Array.from({ length: 65 }, (_, i) => {
        const p = i / 64;
        const coils = 9;
        const theta = p * Math.PI * 2 * coils;
        const coilR = 0.16;
        const x = (p - 0.5) * 2.8;
        return new THREE.Vector3(x, Math.sin(theta) * coilR + 0.18, Math.cos(theta) * coilR);
      })
    );
    const cableGeo = new THREE.TubeGeometry(cableCurve, 65, 0.042, 8, false);
    const cableMat = new THREE.MeshStandardMaterial({
      color: currentTheme.caseRim,
      roughness: 0.45,
      metalness: 0.6
    });
    const cableMesh = new THREE.Mesh(cableGeo, cableMat);
    cableGroup.add(cableMesh);

    // Aviator Quick-Disconnect Silver Cylinder
    const aviatorGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.38, 16);
    aviatorGeo.rotateZ(Math.PI / 2);
    const aviatorMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.15 });
    const aviatorMesh = new THREE.Mesh(aviatorGeo, aviatorMat);
    aviatorMesh.position.set(1.6, 0.18, 0);
    cableGroup.add(aviatorMesh);
    keyboardRoot.add(cableGroup);

    // 3. CNC Anodized Aluminum Chassis Body
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
      roughness: 0.35,
      metalness: 0.65
    });
    const caseMesh = new THREE.Mesh(caseGeo, caseMat);
    caseMesh.castShadow = true;
    caseMesh.receiveShadow = true;
    keyboardRoot.add(caseMesh);

    // Polished Precision Chamfer Rim
    const rimShape = createRoundedRectShape(boardWidth + 0.06, boardDepth + 0.06, 0.48);
    const rimGeo = new THREE.ExtrudeGeometry(rimShape, {
      depth: 0.07,
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
      roughness: 0.2,
      metalness: 0.92
    });
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    keyboardRoot.add(rimMesh);

    // Perimeter Underglow Diffuser Strip (Rectangular Frosted Diffuser)
    const underglowShape = createRoundedRectShape(boardWidth + 0.16, boardDepth + 0.16, 0.48);
    const underglowGeo = new THREE.ShapeGeometry(underglowShape);
    underglowGeo.rotateX(-Math.PI / 2);
    const underglowMat = new THREE.MeshBasicMaterial({
      color: currentTheme.underglow,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide
    });
    const underglowMesh = new THREE.Mesh(underglowGeo, underglowMat);
    underglowMesh.position.y = -boardHeight * 0.94;
    keyboardRoot.add(underglowMesh);

    // Brushed Aluminum Switch Plate (Tray with per-switch mounting recesses)
    const plateShape = createRoundedRectShape(boardWidth - 0.42, boardDepth - 0.42, 0.25);
    const plateGeo = new THREE.ShapeGeometry(plateShape);
    plateGeo.rotateX(-Math.PI / 2);
    const plateMat = new THREE.MeshStandardMaterial({
      color: currentTheme.plateColor,
      roughness: 0.65,
      metalness: 0.45
    });
    const plateMesh = new THREE.Mesh(plateGeo, plateMat);
    plateMesh.position.y = 0.02;
    plateMesh.receiveShadow = true;
    keyboardRoot.add(plateMesh);

    // 4. Dynamic High-DPI Keycap Texture Generator
    function generateKeyTexture(keyDef, layoutKey, theme) {
      const isWide = keyDef.unit >= 2.0;
      const cvWidth = isWide ? 1024 : 512;
      const cvHeight = 512;

      const canvas = document.createElement('canvas');
      canvas.width = cvWidth;
      canvas.height = cvHeight;
      const ctx = canvas.getContext('2d');

      // Satin PBT Radial Texture Gradient
      const grad = ctx.createRadialGradient(cvWidth / 2, cvHeight * 0.35, 20, cvWidth / 2, cvHeight / 2, cvWidth * 0.75);
      grad.addColorStop(0, theme.keycapGradient);
      grad.addColorStop(1, theme.keycapBase);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, cvWidth, cvHeight);

      // Inset Edge Bevel
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.09)';
      ctx.lineWidth = 12;
      ctx.strokeRect(12, 12, cvWidth - 24, cvHeight - 24);

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      if (keyDef.isMod) {
        if (keyDef.label) {
          ctx.font = 'bold 96px "Inter", "Segoe UI", sans-serif';
          ctx.fillStyle = keyDef.isAccent ? '#ffffff' : theme.legendMod;
          ctx.shadowColor = 'rgba(0,0,0,0.6)';
          ctx.shadowBlur = 12;
          ctx.fillText(keyDef.label, cvWidth / 2, cvHeight / 2 + 4);
        } else if (keyDef.isSpace) {
          ctx.font = 'bold 56px "Inter", sans-serif';
          ctx.fillStyle = 'rgba(255,255,255,0.28)';
          ctx.letterSpacing = '8px';
          ctx.fillText('PK KHMER TYPE', cvWidth / 2, cvHeight / 2);
        }
      } else {
        const map = keyDef[layoutKey] || keyDef.std || {};
        const baseChar = map.base || '';
        const shiftChar = map.shift || '';
        const altgrChar = map.altgr || '';

        // Shifted Glyph (Upper right)
        if (shiftChar) {
          ctx.font = 'bold 102px "Khmer OS Siemreap", "Kantumruy Pro", "Segoe UI", sans-serif';
          ctx.fillStyle = theme.legendShift;
          ctx.shadowColor = 'rgba(245, 158, 11, 0.45)';
          ctx.shadowBlur = 10;
          ctx.textAlign = 'right';
          ctx.fillText(shiftChar, cvWidth - 52, 128);
        }

        // AltGr Glyph (Upper left)
        if (altgrChar) {
          ctx.font = 'bold 84px "Khmer OS Siemreap", "Kantumruy Pro", "Segoe UI", sans-serif';
          ctx.fillStyle = theme.legendAltgr;
          ctx.textAlign = 'left';
          ctx.fillText(altgrChar, 52, 128);
        }

        // Base Glyph (Center/lower prominent)
        if (baseChar) {
          ctx.font = 'bold 172px "Khmer OS Siemreap", "Kantumruy Pro", "Segoe UI", sans-serif';
          ctx.fillStyle = theme.legendBase;
          ctx.shadowColor = 'rgba(0,0,0,0.7)';
          ctx.shadowBlur = 14;
          ctx.textAlign = 'center';
          ctx.fillText(baseChar, cvWidth * 0.48, cvHeight * 0.62);
        }

        // Homing nub on F and J
        if (keyDef.hasBump) {
          ctx.fillStyle = theme.legendMod;
          ctx.beginPath();
          ctx.rect(cvWidth / 2 - 45, cvHeight - 48, 90, 12);
          ctx.fill();
        }
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.generateMipmaps = true;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      return texture;
    }

    // 5. 61-Key Keycap Assembly Matrix
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
        const keyH = 0.44;
        const keyCenterX = currentX + keyW / 2;
        currentX += keyW + GAP;

        const keyGroup = new THREE.Group();
        keyGroup.position.set(keyCenterX, 0.22, zPos);

        // A. Miniature Switch Housing on Plate Underneath Keycap
        const miniSwGeo = new THREE.BoxGeometry(0.72, 0.20, 0.72);
        const miniSwMat = new THREE.MeshStandardMaterial({ color: 0x181e2b, roughness: 0.4, metalness: 0.3 });
        const miniSw = new THREE.Mesh(miniSwGeo, miniSwMat);
        miniSw.position.set(0, -0.10, 0);
        keyGroup.add(miniSw);

        // Miniature POM Stem
        const miniStemGeo = new THREE.BoxGeometry(0.24, 0.22, 0.24);
        const miniStemMat = new THREE.MeshStandardMaterial({ color: currentTheme.stemColor, roughness: 0.25 });
        const miniStem = new THREE.Mesh(miniStemGeo, miniStemMat);
        miniStem.position.set(0, 0.02, 0);
        keyGroup.add(miniStem);

        // B. Sculpted OEM Keycap Body
        const capGeo = createSculptedKeycapGeometry(keyW * 0.94, keyD * 0.94, keyH, keyDef.unit >= 2.0);
        const texture = generateKeyTexture(keyDef, currentLayout, currentTheme);

        const sideMat = new THREE.MeshStandardMaterial({
          color: keyDef.isAccent ? currentTheme.accentColor : currentTheme.caseColor,
          roughness: 0.42,
          metalness: 0.22
        });
        const topMat = new THREE.MeshStandardMaterial({
          map: texture,
          roughness: 0.38,
          metalness: 0.16,
          emissive: 0x000000
        });

        const capMaterials = [sideMat, sideMat, topMat, sideMat, sideMat, sideMat];
        const capMesh = new THREE.Mesh(capGeo, capMaterials);
        capMesh.castShadow = true;
        capMesh.receiveShadow = true;
        capMesh.position.y = keyH / 2 + 0.04;
        keyGroup.add(capMesh);

        // 3D Homing Bump nub on F and J
        if (keyDef.hasBump) {
          const bumpGeo = new THREE.BoxGeometry(0.22, 0.03, 0.04);
          const bumpMat = new THREE.MeshStandardMaterial({ color: currentTheme.caseRim, metalness: 0.8 });
          const bumpMesh = new THREE.Mesh(bumpGeo, bumpMat);
          bumpMesh.position.set(0, keyH + 0.045, keyD * 0.28);
          keyGroup.add(bumpMesh);
        }

        // Per-Key Backlight / RGB Emissive Light
        const keyLight = new THREE.PointLight(currentTheme.underglow, 0, 1.4);
        keyLight.position.set(0, keyH + 0.15, 0);
        keyGroup.add(keyLight);

        keyboardRoot.add(keyGroup);

        const keyState = {
          def: keyDef,
          group: keyGroup,
          capMesh: capMesh,
          miniStemMat: miniStemMat,
          topMat: topMat,
          sideMat: sideMat,
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
            this.targetY = 0.06;
            this.topMat.emissive.setHex(currentTheme.underglow);
            this.topMat.emissiveIntensity = 0.95;
            this.keyLight.intensity = 2.0;
            playMechanicalSound(true, 1.0 + (Math.random() * 0.08 - 0.04));
            strikeHolographicFinger(this.def);
            triggerRippleWave(this.group.position.x, this.group.position.z);
            updateTelemetry(this.def);
          },
          release() {
            this.isPressed = false;
            this.targetY = isExploded ? 1.6 : this.baseY;
            this.topMat.emissive.setHex(0x000000);
            this.topMat.emissiveIntensity = 0;
            this.keyLight.intensity = 0;
            playMechanicalSound(false, 1.12 + (Math.random() * 0.08 - 0.04));
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

    // Reactive Key Shockwave Ripple Propagation
    function triggerRippleWave(sourceX, sourceZ) {
      keyObjects.forEach(k => {
        if (k.isPressed) return;
        const dist = Math.hypot(k.group.position.x - sourceX, k.group.position.z - sourceZ);
        if (dist > 0.1 && dist < 5.5) {
          const delay = dist * 28;
          setTimeout(() => {
            k.topMat.emissive.setHex(currentTheme.underglow);
            k.topMat.emissiveIntensity = Math.max(0.1, 0.7 - dist * 0.12);
            setTimeout(() => {
              if (!k.isPressed) {
                k.topMat.emissive.setHex(0x000000);
                k.topMat.emissiveIntensity = 0;
              }
            }, 160);
          }, delay);
        }
      });
    }

    // Telemetry Display Helper
    function updateTelemetry(def) {
      const keyNameEl = document.getElementById('telemetryKeyName');
      const keySubEl = document.getElementById('telemetryKeyDetail');
      if (!keyNameEl) return;
      const map = def[currentLayout] || def.std || {};
      const glyph = map.base || def.label || def.code || 'KEY';
      keyNameEl.textContent = glyph;
      if (keySubEl) {
        const fingerMap = { lp: 'Left Pinky', lr: 'Left Ring', lm: 'Left Middle', li: 'Left Index', lt: 'Left Thumb',
                             rp: 'Right Pinky', rr: 'Right Ring', rm: 'Right Middle', ri: 'Right Index', rt: 'Right Thumb' };
        keySubEl.textContent = `${fingerMap[def.finger] || 'Index'} · 62g Mechanical Linear`;
      }
    }

    // ============================================================
    // F. ASSEMBLE 2: MUSEUM-GRADE MACRO MECHANICAL SWITCH SHOWCASE
    // ============================================================
    const macroSwitchGroup = new THREE.Group();
    macroSwitchGroup.position.set(0, 0, 0);
    macroSwitchGroup.visible = false;
    scene.add(macroSwitchGroup);

    // 1. CNC Machined Testing Stage (Heavy Anodized Stage Pedestal)
    const stageGeo = new THREE.CylinderGeometry(2.6, 2.8, 0.45, 64);
    const stageMat = new THREE.MeshStandardMaterial({
      color: 0x121726,
      metalness: 0.85,
      roughness: 0.25
    });
    const stageMesh = new THREE.Mesh(stageGeo, stageMat);
    stageMesh.position.y = -0.55;
    stageMesh.receiveShadow = true;
    macroSwitchGroup.add(stageMesh);

    // Glowing Halo LED Channel around Stage
    const haloGeo = new THREE.TorusGeometry(2.4, 0.045, 16, 64);
    haloGeo.rotateX(Math.PI / 2);
    const haloMat = new THREE.MeshBasicMaterial({
      color: currentTheme.underglow,
      transparent: true,
      opacity: 0.85
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    haloMesh.position.y = -0.32;
    macroSwitchGroup.add(haloMesh);

    // Stage Spec Rim Line
    const stageRim = new THREE.LineSegments(
      new THREE.EdgesGeometry(stageGeo),
      new THREE.LineBasicMaterial({ color: currentTheme.caseRim, transparent: true, opacity: 0.45 })
    );
    stageRim.position.copy(stageMesh.position);
    macroSwitchGroup.add(stageRim);

    // 2. PA66 Nylon Bottom Switch Housing
    const swBaseGroup = new THREE.Group();
    swBaseGroup.position.y = -0.15;
    macroSwitchGroup.add(swBaseGroup);

    const baseBodyGeo = new THREE.BoxGeometry(1.56, 0.62, 1.56);
    const baseBodyMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.65,
      metalness: 0.2
    });
    const baseBody = new THREE.Mesh(baseBodyGeo, baseBodyMat);
    baseBody.position.y = 0.31;
    baseBody.castShadow = true;
    swBaseGroup.add(baseBody);

    // Dual Bottom Brass PCB Pins
    const pinGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.42, 12);
    const pinMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.95, roughness: 0.15 });
    const pin1 = new THREE.Mesh(pinGeo, pinMat);
    pin1.position.set(-0.4, 0.0, -0.3);
    const pin2 = new THREE.Mesh(pinGeo, pinMat);
    pin2.position.set(0.4, 0.0, 0.3);
    swBaseGroup.add(pin1, pin2);

    // Gold-Crosspoint Copper Leaf Contacts
    const leafGroup = new THREE.Group();
    leafGroup.position.set(0.35, 0.45, 0);
    const leafGeo1 = new THREE.BoxGeometry(0.04, 0.52, 0.42);
    const leafMat = new THREE.MeshStandardMaterial({ color: 0xb87333, metalness: 0.9, roughness: 0.2 });
    const leafMesh1 = new THREE.Mesh(leafGeo1, leafMat);
    const leafGeo2 = new THREE.BoxGeometry(0.04, 0.38, 0.32);
    const leafMesh2 = new THREE.Mesh(leafGeo2, leafMat);
    leafMesh2.position.set(0.12, -0.07, 0);
    leafMesh2.rotation.z = -0.15;
    leafGroup.add(leafMesh1, leafMesh2);
    swBaseGroup.add(leafGroup);

    // 3. 62g Polished Gold Progressive Helical Spring
    const springGroup = new THREE.Group();
    springGroup.position.y = 0.20;
    macroSwitchGroup.add(springGroup);

    function buildHelicalSpringMesh(turns = 10, height = 0.72, radius = 0.22) {
      const curve = new THREE.CatmullRomCurve3(
        Array.from({ length: 65 }, (_, i) => {
          const p = i / 64;
          const theta = p * Math.PI * 2 * turns;
          const y = p * height;
          return new THREE.Vector3(Math.cos(theta) * radius, y, Math.sin(theta) * radius);
        })
      );
      const geo = new THREE.TubeGeometry(curve, 65, 0.032, 8, false);
      const mat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        metalness: 0.95,
        roughness: 0.12
      });
      return new THREE.Mesh(geo, mat);
    }
    const macroSpringMesh = buildHelicalSpringMesh();
    macroSpringMesh.castShadow = true;
    springGroup.add(macroSpringMesh);

    // 4. High-Precision Ruby POM MX Cross Stem
    const stemGroup = new THREE.Group();
    stemGroup.position.y = 0.48;
    macroSwitchGroup.add(stemGroup);

    const stemMat = new THREE.MeshStandardMaterial({
      color: currentTheme.stemColor,
      roughness: 0.28,
      metalness: 0.08
    });

    // Cross mount '+' shape
    const stemCrossV = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.95, 0.54), stemMat);
    const stemCrossH = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.95, 0.16), stemMat);
    stemCrossV.position.y = 0.47;
    stemCrossH.position.y = 0.47;
    stemGroup.add(stemCrossV, stemCrossH);

    // Stem Slider Rail Wings
    const railL = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.72, 0.24), stemMat);
    railL.position.set(-0.48, 0.36, 0);
    const railR = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.72, 0.24), stemMat);
    railR.position.set(0.48, 0.36, 0);
    stemGroup.add(railL, railR);

    // Stem Actuator Legs (Tactile/Linear ramp contacting leaf)
    const legMesh = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.28, 0.22), stemMat);
    legMesh.position.set(0.32, 0.14, 0);
    legMesh.rotation.z = 0.25;
    stemGroup.add(legMesh);

    // 5. Crystal-Clear Frosted Polycarbonate Upper Housing
    const topHousingGroup = new THREE.Group();
    topHousingGroup.position.y = 0.46;
    macroSwitchGroup.add(topHousingGroup);

    const topShellGeo = new THREE.BoxGeometry(1.58, 0.56, 1.58);
    const topShellMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.42,
      roughness: 0.12,
      metalness: 0.1
    });
    const topShell = new THREE.Mesh(topShellGeo, topShellMat);
    topShell.position.y = 0.28;
    topHousingGroup.add(topShell);

    // Four Snap Latches extending down
    const latchGeo = new THREE.BoxGeometry(0.12, 0.42, 0.22);
    [
      [-0.78, 0.08, 0], [0.78, 0.08, 0],
      [0, 0.08, -0.78], [0, 0.08, 0.78]
    ].forEach(([lx, ly, lz]) => {
      const latch = new THREE.Mesh(latchGeo, topShellMat);
      latch.position.set(lx, ly, lz);
      topHousingGroup.add(latch);
    });

    // 6. Showcase Double-Shot PBT Keycap with Underside Stem Socket
    const macroCapGroup = new THREE.Group();
    macroCapGroup.position.y = 1.02;
    macroSwitchGroup.add(macroCapGroup);

    const macroCapGeo = createSculptedKeycapGeometry(1.72, 1.72, 0.78, false);
    let activeGlyphChar = 'ក';
    const macroTexture = generateKeyTexture(ROW3_DEFS[8], 'standard', currentTheme);

    const macroCapSideMat = new THREE.MeshStandardMaterial({
      color: currentTheme.caseColor,
      roughness: 0.4,
      metalness: 0.2
    });
    const macroCapTopMat = new THREE.MeshStandardMaterial({
      map: macroTexture,
      roughness: 0.36,
      metalness: 0.15,
      emissive: 0x000000
    });
    const macroCapMaterials = [macroCapSideMat, macroCapSideMat, macroCapTopMat, macroCapSideMat, macroCapSideMat, macroCapSideMat];
    const macroCapMesh = new THREE.Mesh(macroCapGeo, macroCapMaterials);
    macroCapMesh.castShadow = true;
    macroCapMesh.position.y = 0.39;
    macroCapGroup.add(macroCapMesh);

    // Underside Cross Stem Mount Socket (Authentic inner detail)
    const socketGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.35, 16);
    const socketMat = new THREE.MeshStandardMaterial({ color: 0x1f293d, roughness: 0.5 });
    const socketMesh = new THREE.Mesh(socketGeo, socketMat);
    socketMesh.position.y = 0.08;
    macroCapGroup.add(socketMesh);

    // 7. Holographic Laser Callout Lines & Glowing HUD Badges in Exploded View
    const explodedLabelsGroup = new THREE.Group();
    explodedLabelsGroup.visible = false;
    macroSwitchGroup.add(explodedLabelsGroup);

    const CALLOUT_DATA = [
      { name: 'PBT Double-Shot Keycap', y: 2.50, offset: 2.2 },
      { name: 'Polycarbonate Upper Housing', y: 1.75, offset: 2.3 },
      { name: 'High-Precision POM Stem', y: 1.10, offset: -2.3 },
      { name: '62g Gold-Plated Helical Spring', y: 0.52, offset: 2.2 },
      { name: 'High-Conductivity Copper Leaf', y: 0.08, offset: -2.3 },
      { name: 'Nylon PA66 Lower Base', y: -0.28, offset: 2.3 }
    ];

    CALLOUT_DATA.forEach(c => {
      // Holographic laser line
      const linePoints = [
        new THREE.Vector3(c.offset > 0 ? 0.8 : -0.8, c.y, 0),
        new THREE.Vector3(c.offset * 0.9, c.y, 0),
        new THREE.Vector3(c.offset * 1.15, c.y + 0.1, 0)
      ];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(linePoints);
      const lineMat = new THREE.LineBasicMaterial({
        color: currentTheme.caseRim,
        transparent: true,
        opacity: 0.85
      });
      const lineMesh = new THREE.Line(lineGeo, lineMat);
      explodedLabelsGroup.add(lineMesh);

      // Glowing HUD Target Node
      const nodeGeo = new THREE.CircleGeometry(0.08, 16);
      const nodeMat = new THREE.MeshBasicMaterial({ color: currentTheme.caseRim, side: THREE.DoubleSide });
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeMesh.position.copy(linePoints[0]);
      explodedLabelsGroup.add(nodeMesh);

      // 3D Text Badge Plane (Canvas Billboard)
      const badgeCv = document.createElement('canvas');
      badgeCv.width = 512;
      badgeCv.height = 128;
      const bCtx = badgeCv.getContext('2d');
      bCtx.fillStyle = 'rgba(10, 14, 26, 0.85)';
      bCtx.roundRect ? bCtx.roundRect(8, 8, 496, 112, 16) : bCtx.rect(8, 8, 496, 112);
      bCtx.fill();
      bCtx.strokeStyle = 'rgba(212, 175, 55, 0.6)';
      bCtx.lineWidth = 4;
      bCtx.stroke();
      bCtx.font = 'bold 36px "Inter", "Segoe UI", sans-serif';
      bCtx.fillStyle = '#ffffff';
      bCtx.textAlign = 'center';
      bCtx.textBaseline = 'middle';
      bCtx.fillText(c.name, 256, 64);

      const badgeTex = new THREE.CanvasTexture(badgeCv);
      const badgePlaneGeo = new THREE.PlaneGeometry(1.6, 0.4);
      const badgePlaneMat = new THREE.MeshBasicMaterial({ map: badgeTex, transparent: true, side: THREE.DoubleSide });
      const badgeMesh = new THREE.Mesh(badgePlaneGeo, badgePlaneMat);
      badgeMesh.position.set(c.offset * 1.15 + (c.offset > 0 ? 0.85 : -0.85), c.y + 0.1, 0);
      explodedLabelsGroup.add(badgeMesh);
    });

    // Macro Switch Spring Physics State
    let macroCurrentY = 1.02;
    let macroVelocity = 0;
    let isMacroPressed = false;

    function pressMacroSwitch() {
      if (isMacroPressed) return;
      isMacroPressed = true;
      macroCapTopMat.emissive.setHex(currentTheme.underglow);
      macroCapTopMat.emissiveIntensity = 0.9;
      playMechanicalSound(true, 0.95);
      setTimeout(() => {
        isMacroPressed = false;
        macroCapTopMat.emissive.setHex(0x000000);
        macroCapTopMat.emissiveIntensity = 0;
        playMechanicalSound(false, 1.08);
      }, 150);
    }

    // ============================================================
    // G. JARVIS / CYBER HUD HOLOGRAPHIC HANDS GUIDE
    // ============================================================
    const handsGuideGroup = new THREE.Group();
    keyboardRoot.add(handsGuideGroup);

    const leftHandColor = 0x06b6d4;  // Electric Cyan (Left hand)
    const rightHandColor = 0xd946ef; // Cyber Magenta (Right hand)

    function createCyberHandRig(isLeft) {
      const handRig = new THREE.Group();
      const color = isLeft ? leftHandColor : rightHandColor;
      const palmX = isLeft ? -4.1 : 2.5;
      const palmY = 0.52;
      const palmZ = 3.65;

      // 1. Futuristic Concentric Targeting Reticle Palm
      const reticleOuterGeo = new THREE.RingGeometry(0.85, 0.92, 32);
      reticleOuterGeo.rotateX(-Math.PI / 2);
      const reticleInnerGeo = new THREE.RingGeometry(0.38, 0.44, 32);
      reticleInnerGeo.rotateX(-Math.PI / 2);

      const reticleMat = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.65,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });
      const reticleOuter = new THREE.Mesh(reticleOuterGeo, reticleMat);
      reticleOuter.position.set(palmX, palmY, palmZ);
      const reticleInner = new THREE.Mesh(reticleInnerGeo, reticleMat);
      reticleInner.position.set(palmX, palmY, palmZ);
      handRig.add(reticleOuter, reticleInner);

      // Core Glowing Node
      const coreLight = new THREE.PointLight(color, 1.0, 5.0);
      coreLight.position.set(palmX, palmY + 0.25, palmZ);
      handRig.add(coreLight);

      // Knuckle Arc Wireframe Nodes
      const anchorKeyIds = isLeft
        ? ['a', 's', 'd', 'f', 'space']
        : ['j', 'k', 'l', 'semicolon', 'space'];

      const fingers = [];

      anchorKeyIds.forEach((keyId, idx) => {
        const keyObj = keyMapById.get(keyId);
        let homeX = 0;
        let homeZ = 0;
        if (keyId === 'space') {
          homeX = isLeft ? -1.4 : 1.4;
          homeZ = keyObj ? keyObj.group.position.z : 2.14;
        } else if (keyObj) {
          homeX = keyObj.group.position.x;
          homeZ = keyObj.group.position.z;
        }
        const homeY = 0.50;

        // Floating HUD Reticle Ring above Keycap
        const ringGeo = new THREE.RingGeometry(0.18, 0.28, 32);
        ringGeo.rotateX(-Math.PI / 2);
        const ringMat = new THREE.MeshBasicMaterial({
          color: color,
          transparent: true,
          opacity: 0.88,
          side: THREE.DoubleSide,
          depthWrite: false,
          blending: THREE.AdditiveBlending
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.position.set(homeX, homeY, homeZ);
        handRig.add(ringMesh);

        // Center Pulsing Pip
        const pipGeo = new THREE.CircleGeometry(0.08, 16);
        pipGeo.rotateX(-Math.PI / 2);
        const pipMesh = new THREE.Mesh(pipGeo, ringMat);
        pipMesh.position.set(homeX, homeY + 0.005, homeZ);
        handRig.add(pipMesh);

        // Knuckle Anchor Coordinates
        let knuckleX, knuckleZ;
        const knuckleY = palmY + 0.06;
        if (isLeft) {
          if (idx === 4) { // Thumb
            knuckleX = -2.4;
            knuckleZ = palmZ - 0.25;
          } else {
            const leftKnuckles = [-5.0, -4.25, -3.5, -2.75];
            knuckleX = leftKnuckles[idx];
            knuckleZ = palmZ - 0.95;
          }
        } else {
          if (idx === 4) { // Thumb
            knuckleX = 1.1;
            knuckleZ = palmZ - 0.25;
          } else {
            const rightKnuckles = [1.2, 1.95, 2.7, 3.45];
            knuckleX = rightKnuckles[idx];
            knuckleZ = palmZ - 0.95;
          }
        }

        // Knuckle Glowing Sphere Node
        const knNodeGeo = new THREE.SphereGeometry(0.07, 12, 12);
        const knNodeMat = new THREE.MeshBasicMaterial({ color: color, blending: THREE.AdditiveBlending });
        const knNode = new THREE.Mesh(knNodeGeo, knNodeMat);
        knNode.position.set(knuckleX, knuckleY, knuckleZ);
        handRig.add(knNode);

        // Sleek Holographic Laser Tracer Beam
        const kPos = new THREE.Vector3(knuckleX, knuckleY, knuckleZ);
        const tPos = new THREE.Vector3(homeX, homeY, homeZ);
        const mPos = new THREE.Vector3((knuckleX + homeX) / 2, homeY + 0.36, (knuckleZ + homeZ) / 2);

        const beamCurve = new THREE.QuadraticBezierCurve3(kPos, mPos, tPos);
        const beamGeo = new THREE.TubeGeometry(beamCurve, 16, 0.024, 6, false);
        const beamMat = new THREE.MeshBasicMaterial({
          color: color,
          transparent: true,
          opacity: 0.65,
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

      return { rig: handRig, fingers: fingers, reticleOuter: reticleOuter, reticleInner: reticleInner, coreLight: coreLight };
    }

    const leftHand = createCyberHandRig(true);
    const rightHand = createCyberHandRig(false);
    handsGuideGroup.add(leftHand.rig);
    handsGuideGroup.add(rightHand.rig);

    // Strike Kinematic Holographic Finger
    function strikeHolographicFinger(keyDef) {
      if (!showHands) return;
      const fingerType = keyDef.finger || 'li';
      const isLeft = fingerType.startsWith('l');
      const hand = isLeft ? leftHand : rightHand;

      let fingerIdx = 0;
      if (isLeft) {
        if (fingerType.endsWith('p')) fingerIdx = 0;
        else if (fingerType.endsWith('r')) fingerIdx = 1;
        else if (fingerType.endsWith('m')) fingerIdx = 2;
        else if (fingerType.endsWith('i')) fingerIdx = 3;
        else if (fingerType.endsWith('t')) fingerIdx = 4;
      } else {
        if (fingerType.endsWith('i')) fingerIdx = 0;
        else if (fingerType.endsWith('m')) fingerIdx = 1;
        else if (fingerType.endsWith('r')) fingerIdx = 2;
        else if (fingerType.endsWith('p')) fingerIdx = 3;
        else if (fingerType.endsWith('t')) fingerIdx = 4;
      }

      const f = hand.fingers[fingerIdx];
      if (!f) return;

      const targetKey = keyMapById.get(keyDef.id);
      if (targetKey) {
        f.targetPos.set(targetKey.group.position.x, 0.32, targetKey.group.position.z);
        f.strikePhase = 1.0;
        f.ringMesh.scale.set(1.5, 1.5, 1.5);
      }
    }

    // ============================================================
    // H. CAMERA ORBIT CONTROLLER & INPUT INTERACTIONS
    // ============================================================
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let sphericalTheta = 0;
    let sphericalPhi = Math.PI / 3.4;
    let sphericalRadius = 18.5;
    let targetRadius = 18.5;

    function updateCameraFromAngles() {
      const targetLook = viewMode === 'switch' ? new THREE.Vector3(0, 1.0, 0) : defaultCamLook;
      camera.position.x = targetLook.x + targetRadius * Math.sin(sphericalPhi) * Math.sin(sphericalTheta);
      camera.position.y = targetLook.y + targetRadius * Math.cos(sphericalPhi);
      camera.position.z = targetLook.z + targetRadius * Math.sin(sphericalPhi) * Math.cos(sphericalTheta);
      camera.lookAt(targetLook);
    }
    updateCameraFromAngles();

    // Mouse & Touch Orbit / Key Click
    renderer.domElement.addEventListener('pointerdown', (e) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
      initAudioEngine();

      const rect = renderer.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);

      if (viewMode === 'switch') {
        const switchHits = raycaster.intersectObjects([macroCapMesh, baseBody, macroSpringMesh]);
        if (switchHits.length > 0) {
          pressMacroSwitch();
        }
      } else {
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
      const minR = viewMode === 'switch' ? 4.5 : 8.0;
      const maxR = viewMode === 'switch' ? 16.0 : 34.0;
      targetRadius = Math.max(minR, Math.min(maxR, targetRadius + e.deltaY * 0.015));
    }, { passive: false });

    // Physical Hardware Keyboard Typing Listener
    window.addEventListener('keydown', (e) => {
      if (viewMode === 'switch') {
        pressMacroSwitch();
      } else {
        const keyObj = keyMapByCode.get(e.code);
        if (keyObj && !keyObj.isPressed) {
          keyObj.press();
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      if (viewMode !== 'switch') {
        const keyObj = keyMapByCode.get(e.code);
        if (keyObj) {
          keyObj.release();
        }
      }
    });

    // ============================================================
    // I. UI CONTROLS TOOLBAR INTEGRATION
    // ============================================================
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
          haloMat.color.setHex(currentTheme.underglow);
          stageRim.material.color.setHex(currentTheme.caseRim);
          deskpadMat.color.setHex(currentTheme.deskpadColor);
          deskpadBorder.material.color.setHex(currentTheme.underglow);
          cableMat.color.setHex(currentTheme.caseRim);

          keyObjects.forEach(k => {
            k.miniStemMat.color.setHex(currentTheme.stemColor);
            k.sideMat.color.setHex(k.def.isAccent ? currentTheme.accentColor : currentTheme.caseColor);
            k.updateTexture();
          });

          stemMat.color.setHex(currentTheme.stemColor);
          macroCapSideMat.color.setHex(currentTheme.caseColor);
        });
      });

      // 3. View Mode (Full Keyboard vs Switch Anatomy)
      const viewButtons = document.querySelectorAll('.key-view-btn');
      viewButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          viewButtons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          viewMode = btn.dataset.view || 'keyboard';

          const titleEl = document.querySelector('.keycap3d-title');
          const hintEl = document.querySelector('.keycap3d-hint');

          if (viewMode === 'switch') {
            keyboardRoot.visible = false;
            macroSwitchGroup.visible = true;
            targetRadius = 9.2;
            sphericalPhi = Math.PI / 3.1;
            if (titleEl) titleEl.textContent = 'Precision Mechanical Switch Anatomy & Physics';
            if (hintEl) hintEl.textContent = 'Click switch to press · Click Explode to separate components · Drag to inspect 360°';
          } else {
            keyboardRoot.visible = true;
            macroSwitchGroup.visible = false;
            targetRadius = 18.5;
            sphericalPhi = Math.PI / 3.4;
            if (titleEl) titleEl.textContent = 'PK Khmer Type Mechanical ANSI 61-Key';
            if (hintEl) hintEl.textContent = 'Type on physical keyboard or click keys · Drag to orbit · Scroll to zoom';
          }
        });
      });

      // 4. Action Buttons
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
          stageMat.wireframe = isWireframe;
          baseBodyMat.wireframe = isWireframe;
          macroCapTopMat.wireframe = isWireframe;
          btnWireframe.classList.toggle('active', isWireframe);
        });
      }

      const btnExplode = document.getElementById('btnExplodedView');
      if (btnExplode) {
        btnExplode.addEventListener('click', () => {
          isExploded = !isExploded;
          btnExplode.classList.toggle('active', isExploded);

          if (viewMode !== 'switch') {
            keyObjects.forEach(k => {
              k.targetY = isExploded ? 1.6 : k.baseY;
            });
          } else {
            explodedLabelsGroup.visible = isExploded;
          }
        });
      }

      const btnReset = document.getElementById('btnReset3DView');
      if (btnReset) {
        btnReset.addEventListener('click', () => {
          sphericalTheta = 0;
          sphericalPhi = viewMode === 'switch' ? Math.PI / 3.1 : Math.PI / 3.4;
          targetRadius = viewMode === 'switch' ? 9.2 : 18.5;
          autoRotate = true;
          if (btnRotate) btnRotate.classList.add('active');
        });
      }

      const btnPress = document.getElementById('btnPressTrigger');
      if (btnPress) {
        btnPress.addEventListener('click', () => {
          initAudioEngine();
          if (viewMode === 'switch') {
            pressMacroSwitch();
          } else {
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
          }
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

      // Glyph selector compatibility buttons
      const glyphButtons = document.querySelectorAll('.key-glyph-btn');
      glyphButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          glyphButtons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const char = btn.dataset.glyph || 'ក';
          activeGlyphChar = char;
          const sampleKey = keyMapById.get('k');
          if (sampleKey) {
            sampleKey.press();
            setTimeout(() => sampleKey.release(), 180);
          }
          if (viewMode === 'switch') {
            pressMacroSwitch();
          }
        });
      });
    }
    setupControls();

    // ============================================================
    // J. ANIMATION & PHYSICS RENDER LOOP
    // ============================================================
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

      // 3. Full Keyboard Spring Physics
      keyObjects.forEach(k => {
        const springK = 0.44;
        const damping = 0.72;
        const diff = k.targetY - k.currentY;
        k.velocity += diff * springK;
        k.velocity *= damping;
        k.currentY += k.velocity;
        k.group.position.y = k.currentY;
      });

      // 4. Macro Switch Smooth Physics & Exploded Separation
      if (viewMode === 'switch') {
        const targetCapY = isExploded ? 2.50 : (isMacroPressed ? 0.78 : 1.02);
        const diff = targetCapY - macroCurrentY;
        macroVelocity += diff * 0.45;
        macroVelocity *= 0.72;
        macroCurrentY += macroVelocity;
        macroCapGroup.position.y = macroCurrentY;

        const targetTopY = isExploded ? 1.75 : 0.46;
        topHousingGroup.position.y += (targetTopY - topHousingGroup.position.y) * 0.20;

        const targetStemY = isExploded ? 1.10 : (0.48 + (macroCurrentY - 1.02) * 0.95);
        stemGroup.position.y += (targetStemY - stemGroup.position.y) * 0.24;

        const targetSpringY = isExploded ? 0.52 : 0.20;
        springGroup.position.y += (targetSpringY - springGroup.position.y) * 0.20;

        if (!isExploded) {
          macroSpringMesh.scale.y = Math.max(0.65, 1.0 + (macroCurrentY - 1.02) * 1.3);
        } else {
          macroSpringMesh.scale.y = 1.0;
        }
      }

      // 5. Chroma RGB Wave Effect
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
        haloMat.color.setHSL(underglowHue, 1.0, 0.5);
      }

      // 6. Holographic Kinematic Hands Reticle Animation
      if (showHands) {
        const hoverOffset = Math.sin(time * 2.2) * 0.035;
        leftHand.reticleOuter.position.y = 0.52 + hoverOffset;
        leftHand.reticleInner.position.y = 0.52 + hoverOffset;
        leftHand.reticleOuter.rotation.z += delta * 0.5;
        leftHand.reticleInner.rotation.z -= delta * 0.8;

        rightHand.reticleOuter.position.y = 0.52 + hoverOffset;
        rightHand.reticleInner.position.y = 0.52 + hoverOffset;
        rightHand.reticleOuter.rotation.z -= delta * 0.5;
        rightHand.reticleInner.rotation.z += delta * 0.8;

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
            f.currentPos.lerp(f.targetPos, 0.22);
            f.ringMesh.position.copy(f.currentPos);
            f.pipMesh.position.set(f.currentPos.x, f.currentPos.y + 0.005, f.currentPos.z);
          });
        });
      }

      renderer.render(scene, camera);
    }
    animate();

    // Resize Handler
    window.addEventListener('resize', () => {
      if (!container) return;
      const w = container.clientWidth || 800;
      const h = container.clientHeight || 520;
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
