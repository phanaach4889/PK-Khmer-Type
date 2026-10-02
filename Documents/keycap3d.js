/**
 * PK KHMER TYPE — Premium 3D Mechanical Keyboard & Switch Experience
 * High-performance WebGL interactive keyboard built with Three.js.
 *
 * Features:
 * - Full 61-Key ANSI Mechanical Keyboard with sculpted OEM keycaps.
 * - Dynamic Multi-Color Enthusiast Colorways (Angkor Gold, RGB Chroma, Cyber Neon, Matcha & Sakura).
 * - Differentiated Alpha, Modifier, and Accent color harmonies.
 * - High-DPI un-stretched canvas texturing with top-centered Shift badges and zero AltGr clutter.
 * - Museum-grade Mechanical Switch Anatomy (pyramid polycarbonate housing, chimney aperture, gold progressive spring, MX cross stem).
 * - Ergonomic stylized translucent touch-typing hand model (hidden by default).
 * - Web Audio API synthesized mechanical soundboard with lubed switch acoustics.
 *
 * Author: Phanna Kurosaki
 */

(function () {
  'use strict';

  // ------------------------------------------------------------
  // 1. KEYBOARD MATRIX DATA & LAYOUT DEFINITIONS (61-Key ANSI)
  // ------------------------------------------------------------
  const ROW1_DEFS = [
    { id: 'grave', unit: 1.0, code: 'Backquote', finger: 'lp', isAccent: true, label: 'Esc',
      std: { base: '', shift: '' },
      nida: { base: '«', shift: '»' },
      en: { base: '`', shift: '~' } },
    { id: 'k1', unit: 1.0, code: 'Digit1', finger: 'lp', col: 1,
      std: { base: '១', shift: '!' },
      nida: { base: '១', shift: '!' },
      en: { base: '1', shift: '!' } },
    { id: 'k2', unit: 1.0, code: 'Digit2', finger: 'lr', col: 2,
      std: { base: '២', shift: 'ៗ' },
      nida: { base: '២', shift: 'ៗ' },
      en: { base: '2', shift: '@' } },
    { id: 'k3', unit: 1.0, code: 'Digit3', finger: 'lm', col: 3,
      std: { base: '៣', shift: '"' },
      nida: { base: '៣', shift: '"' },
      en: { base: '3', shift: '#' } },
    { id: 'k4', unit: 1.0, code: 'Digit4', finger: 'li', col: 4,
      std: { base: '៤', shift: '៛' },
      nida: { base: '៤', shift: '៛' },
      en: { base: '4', shift: '$' } },
    { id: 'k5', unit: 1.0, code: 'Digit5', finger: 'li', col: 5,
      std: { base: '៥', shift: '%' },
      nida: { base: '៥', shift: '%' },
      en: { base: '5', shift: '%' } },
    { id: 'k6', unit: 1.0, code: 'Digit6', finger: 'ri', col: 6,
      std: { base: '៦', shift: '៍' },
      nida: { base: '៦', shift: '៍' },
      en: { base: '6', shift: '^' } },
    { id: 'k7', unit: 1.0, code: 'Digit7', finger: 'ri', col: 7,
      std: { base: '៧', shift: '័' },
      nida: { base: '៧', shift: '័' },
      en: { base: '7', shift: '&' } },
    { id: 'k8', unit: 1.0, code: 'Digit8', finger: 'rm', col: 8,
      std: { base: '៨', shift: '៏' },
      nida: { base: '៨', shift: '៏' },
      en: { base: '8', shift: '*' } },
    { id: 'k9', unit: 1.0, code: 'Digit9', finger: 'rr', col: 9,
      std: { base: '៩', shift: '៎' },
      nida: { base: '៩', shift: '(' },
      en: { base: '9', shift: '(' } },
    { id: 'k0', unit: 1.0, code: 'Digit0', finger: 'rp', col: 10,
      std: { base: '០', shift: '៌' },
      nida: { base: '០', shift: ')' },
      en: { base: '0', shift: ')' } },
    { id: 'minus', unit: 1.0, code: 'Minus', finger: 'rp', col: 11,
      std: { base: '-', shift: '_' },
      nida: { base: 'ឥ', shift: '៌' },
      en: { base: '-', shift: '_' } },
    { id: 'equal', unit: 1.0, code: 'Equal', finger: 'rp', col: 12,
      std: { base: '=', shift: '+' },
      nida: { base: 'ឲ', shift: '=' },
      en: { base: '=', shift: '+' } },
    { id: 'backspace', unit: 2.0, code: 'Backspace', finger: 'rp', col: 13, isMod: true, label: 'Backspace' }
  ];

  const ROW2_DEFS = [
    { id: 'tab', unit: 1.5, code: 'Tab', finger: 'lp', col: 0, isMod: true, label: 'Tab' },
    { id: 'q', unit: 1.0, code: 'KeyQ', finger: 'lp', col: 1,
      std: { base: 'ឆ', shift: 'ឈ' },
      nida: { base: 'ឆ', shift: 'ឈ' },
      en: { base: 'q', shift: 'Q' } },
    { id: 'w', unit: 1.0, code: 'KeyW', finger: 'lr', col: 2,
      std: { base: 'ឹ', shift: 'ឺ' },
      nida: { base: 'ឹ', shift: 'ឺ' },
      en: { base: 'w', shift: 'W' } },
    { id: 'e', unit: 1.0, code: 'KeyE', finger: 'lm', col: 3,
      std: { base: 'េ', shift: 'ែ' },
      nida: { base: 'េ', shift: 'ែ' },
      en: { base: 'e', shift: 'E' } },
    { id: 'r', unit: 1.0, code: 'KeyR', finger: 'li', col: 4,
      std: { base: 'រ', shift: 'ឬ' },
      nida: { base: 'រ', shift: 'ឬ' },
      en: { base: 'r', shift: 'R' } },
    { id: 't', unit: 1.0, code: 'KeyT', finger: 'li', col: 5,
      std: { base: 'ត', shift: 'ទ' },
      nida: { base: 'ត', shift: 'ទ' },
      en: { base: 't', shift: 'T' } },
    { id: 'y', unit: 1.0, code: 'KeyY', finger: 'ri', col: 6,
      std: { base: 'យ', shift: 'ួ' },
      nida: { base: 'យ', shift: 'ួ' },
      en: { base: 'y', shift: 'Y' } },
    { id: 'u', unit: 1.0, code: 'KeyU', finger: 'ri', col: 7,
      std: { base: 'ុ', shift: 'ូ' },
      nida: { base: 'ុ', shift: 'ូ' },
      en: { base: 'u', shift: 'U' } },
    { id: 'i', unit: 1.0, code: 'KeyI', finger: 'rm', col: 8,
      std: { base: 'ិ', shift: 'ី' },
      nida: { base: 'ិ', shift: 'ី' },
      en: { base: 'i', shift: 'I' } },
    { id: 'o', unit: 1.0, code: 'KeyO', finger: 'rr', col: 9,
      std: { base: 'ោ', shift: 'ៅ' },
      nida: { base: 'ោ', shift: 'ៅ' },
      en: { base: 'o', shift: 'O' } },
    { id: 'p', unit: 1.0, code: 'KeyP', finger: 'rp', col: 10,
      std: { base: 'ផ', shift: 'ភ' },
      nida: { base: 'ផ', shift: 'ភ' },
      en: { base: 'p', shift: 'P' } },
    { id: 'bracketL', unit: 1.0, code: 'BracketLeft', finger: 'rp', col: 11,
      std: { base: 'ើ', shift: 'ោះ' },
      nida: { base: 'ៀ', shift: 'ឿ' },
      en: { base: '[', shift: '{' } },
    { id: 'bracketR', unit: 1.0, code: 'BracketRight', finger: 'rp', col: 12,
      std: { base: 'ឿ', shift: 'ៀ' },
      nida: { base: 'ឪ', shift: 'ឧ' },
      en: { base: ']', shift: '}' } },
    { id: 'backslash', unit: 1.5, code: 'Backslash', finger: 'rp', col: 13, isMod: true, label: '\\' }
  ];

  const ROW3_DEFS = [
    { id: 'caps', unit: 1.75, code: 'CapsLock', finger: 'lp', col: 0, isMod: true, label: 'Caps' },
    { id: 'a', unit: 1.0, code: 'KeyA', finger: 'lp', col: 1,
      std: { base: 'ា', shift: 'ៃ' },
      nida: { base: 'ា', shift: 'ាំ' },
      en: { base: 'a', shift: 'A' } },
    { id: 's', unit: 1.0, code: 'KeyS', finger: 'lr', col: 2,
      std: { base: 'ស', shift: 'ាំ' },
      nida: { base: 'ស', shift: 'ៃ' },
      en: { base: 's', shift: 'S' } },
    { id: 'd', unit: 1.0, code: 'KeyD', finger: 'lm', col: 3,
      std: { base: 'ដ', shift: 'ឌ' },
      nida: { base: 'ដ', shift: 'ឌ' },
      en: { base: 'd', shift: 'D' } },
    { id: 'f', unit: 1.0, code: 'KeyF', finger: 'li', col: 4, hasBump: true,
      std: { base: 'ថ', shift: 'ធ' },
      nida: { base: 'ថ', shift: 'ធ' },
      en: { base: 'f', shift: 'F' } },
    { id: 'g', unit: 1.0, code: 'KeyG', finger: 'li', col: 5,
      std: { base: 'ង', shift: 'អ' },
      nida: { base: 'ង', shift: 'អ' },
      en: { base: 'g', shift: 'G' } },
    { id: 'h', unit: 1.0, code: 'KeyH', finger: 'ri', col: 6,
      std: { base: 'ហ', shift: 'ះ' },
      nida: { base: 'ហ', shift: 'ះ' },
      en: { base: 'h', shift: 'H' } },
    { id: 'j', unit: 1.0, code: 'KeyJ', finger: 'ri', col: 7, hasBump: true,
      std: { base: '្', shift: 'ញ' },
      nida: { base: '្', shift: 'ញ' },
      en: { base: 'j', shift: 'J' } },
    { id: 'k', unit: 1.0, code: 'KeyK', finger: 'rm', col: 8,
      std: { base: 'ក', shift: 'គ' },
      nida: { base: 'ក', shift: 'គ' },
      en: { base: 'k', shift: 'K' } },
    { id: 'l', unit: 1.0, code: 'KeyL', finger: 'rr', col: 9,
      std: { base: 'ល', shift: 'ឡ' },
      nida: { base: 'ល', shift: 'ឡ' },
      en: { base: 'l', shift: 'L' } },
    { id: 'semicolon', unit: 1.0, code: 'Semicolon', finger: 'rp', col: 10,
      std: { base: 'ះ', shift: '៖' },
      nida: { base: 'ើ', shift: 'ោះ' },
      en: { base: ';', shift: ':' } },
    { id: 'quote', unit: 1.0, code: 'Quote', finger: 'rp', col: 11,
      std: { base: '់', shift: '៉' },
      nida: { base: '់', shift: '៉' },
      en: { base: "'", shift: '"' } },
    { id: 'enter', unit: 2.25, code: 'Enter', finger: 'rp', col: 12, isAccent: true, isMod: true, label: 'Enter' }
  ];

  const ROW4_DEFS = [
    { id: 'shiftL', unit: 2.25, code: 'ShiftLeft', finger: 'lp', col: 0, isMod: true, label: 'Shift' },
    { id: 'z', unit: 1.0, code: 'KeyZ', finger: 'lp', col: 1,
      std: { base: 'ឋ', shift: 'ឍ' },
      nida: { base: 'ឋ', shift: 'ឍ' },
      en: { base: 'z', shift: 'Z' } },
    { id: 'x', unit: 1.0, code: 'KeyX', finger: 'lr', col: 2,
      std: { base: 'ខ', shift: 'ឃ' },
      nida: { base: 'ខ', shift: 'ឃ' },
      en: { base: 'x', shift: 'X' } },
    { id: 'c', unit: 1.0, code: 'KeyC', finger: 'lm', col: 3,
      std: { base: 'ច', shift: 'ជ' },
      nida: { base: 'ច', shift: 'ជ' },
      en: { base: 'c', shift: 'C' } },
    { id: 'v', unit: 1.0, code: 'KeyV', finger: 'li', col: 4,
      std: { base: 'វ', shift: 'េះ' },
      nida: { base: 'វ', shift: 'េះ' },
      en: { base: 'v', shift: 'V' } },
    { id: 'b', unit: 1.0, code: 'KeyB', finger: 'li', col: 5,
      std: { base: 'ប', shift: 'ព' },
      nida: { base: 'ប', shift: 'ព' },
      en: { base: 'b', shift: 'B' } },
    { id: 'n', unit: 1.0, code: 'KeyN', finger: 'ri', col: 6,
      std: { base: 'ន', shift: 'ណ' },
      nida: { base: 'ន', shift: 'ណ' },
      en: { base: 'n', shift: 'N' } },
    { id: 'm', unit: 1.0, code: 'KeyM', finger: 'ri', col: 7,
      std: { base: 'ម', shift: 'ំ' },
      nida: { base: 'ម', shift: 'ំ' },
      en: { base: 'm', shift: 'M' } },
    { id: 'comma', unit: 1.0, code: 'Comma', finger: 'rm', col: 8,
      std: { base: 'អ', shift: ',' },
      nida: { base: 'ុំ', shift: 'ុះ' },
      en: { base: ',', shift: '<' } },
    { id: 'period', unit: 1.0, code: 'Period', finger: 'rr', col: 9,
      std: { base: '។', shift: '.' },
      nida: { base: '។', shift: '៕' },
      en: { base: '.', shift: '>' } },
    { id: 'slash', unit: 1.0, code: 'Slash', finger: 'rp', col: 10,
      std: { base: '”', shift: '?' },
      nida: { base: '៊', shift: '?' },
      en: { base: '/', shift: '?' } },
    { id: 'shiftR', unit: 2.75, code: 'ShiftRight', finger: 'rp', col: 11, isMod: true, label: 'Shift' }
  ];

  const ROW5_DEFS = [
    { id: 'ctrlL', unit: 1.5, code: 'ControlLeft', finger: 'lp', col: 0, isMod: true, label: 'Ctrl' },
    { id: 'alt', unit: 1.25, code: 'AltLeft', finger: 'lt', col: 1, isMod: true, label: 'Alt' },
    { id: 'space', unit: 7.5, code: 'Space', finger: 'lt', col: 2, isMod: true, label: '', isSpace: true },
    { id: 'altgr', unit: 1.25, code: 'AltRight', finger: 'rt', col: 3, isMod: true, label: 'Alt' },
    { id: 'ctrlR', unit: 1.5, code: 'ControlRight', finger: 'rp', col: 4, isMod: true, label: 'Ctrl' }
  ];

  const ALL_ROWS = [ROW1_DEFS, ROW2_DEFS, ROW3_DEFS, ROW4_DEFS, ROW5_DEFS];

  // ------------------------------------------------------------
  // 2. ENTHUSIAST COLOR PALETTES (Vibrant & Richly Differentiated)
  // ------------------------------------------------------------
  const THEMES = {
    angkor: {
      name: 'Angkor Gold',
      caseColor: 0x0c1322,         // Anodized Royal Midnight Navy
      caseRim: 0xf59e0b,           // Polished 24K Gold Bevel Rim
      plateColor: 0xb45309,        // Sandblasted Brass Switch Plate
      accentColor: 0xf59e0b,       // Radiant 24K Gold Accent
      alphaBase: '#1e293b',        // Slate Indigo Alphas
      alphaGrad: '#334155',
      modBase: '#172033',          // Deep Midnight Navy Modifiers
      modGrad: '#25334d',
      accentBase: '#b45309',       // Golden Amber Accents (Enter/Esc)
      accentGrad: '#f59e0b',
      spaceBase: '#1e293b',
      spaceGrad: '#334155',
      legendBase: '#ffffff',       // Pure White High Contrast
      legendShift: '#fbbf24',      // Radiant Amber Gold
      legendMod: '#fde047',        // Bright Gold Mod Labels
      underglow: 0xf59e0b,         // Warm Amber RGB Aura
      underglowIntensity: 2.5,
      lightAmbient: 0xffedd5,
      lightMain: 0xfffbeb,
      stemColor: 0xe11d48,         // Ruby Red POM Switch Stem
      deskpadColor: 0x070b14,
      deskpadStitch: 0xd97706
    },
    rgb: {
      name: 'RGB Chroma Wave',
      caseColor: 0x1e293b,         // Satin Space Grey Aluminum
      caseRim: 0x38bdf8,           // Electric Azure Chamfer Rim
      plateColor: 0x0f172a,        // Matte Carbon Plate
      accentColor: 0x0284c7,       // Electric Azure Accent
      alphaBase: '#0f172a',
      alphaGrad: '#1e293b',
      modBase: '#18181b',          // Deep Carbon Modifiers
      modGrad: '#27272a',
      accentBase: '#0284c7',       // Vivid Azure Accents
      accentGrad: '#38bdf8',
      spaceBase: '#0f172a',
      spaceGrad: '#1e293b',
      legendBase: '#ffffff',
      legendShift: '#38bdf8',
      legendMod: '#22d3ee',
      underglow: 0x06b6d4,         // Flowing Rainbow RGB Wave
      underglowIntensity: 2.8,
      lightAmbient: 0xf1f5f9,
      lightMain: 0xffffff,
      stemColor: 0x06b6d4,         // Teal POM Stem
      deskpadColor: 0x090d16,
      deskpadStitch: 0x06b6d4
    },
    neon: {
      name: 'Cyber Neon',
      caseColor: 0x160829,         // Deep Midnight Ultraviolet
      caseRim: 0xf43f5e,           // Electric Neon Pink Rim
      plateColor: 0x2e1065,        // Purple Anodized Plate
      accentColor: 0xf43f5e,       // Hot Magenta Accent
      alphaBase: '#2e1065',        // Ultraviolet Alphas
      alphaGrad: '#4c1d95',
      modBase: '#083344',          // Cyber Teal Modifiers
      modGrad: '#0891b2',
      accentBase: '#881337',       // Hot Magenta Accents
      accentGrad: '#f43f5e',
      spaceBase: '#2e1065',
      spaceGrad: '#4c1d95',
      legendBase: '#fdf4ff',       // Crisp Ice White
      legendShift: '#22d3ee',      // Electric Cyan
      legendMod: '#38bdf8',
      underglow: 0xd946ef,         // Luminous Neon Magenta Underglow
      underglowIntensity: 3.0,
      lightAmbient: 0xfdf2f8,
      lightMain: 0xffe4e6,
      stemColor: 0xf43f5e,         // Hot Pink POM Stem
      deskpadColor: 0x0b0414,
      deskpadStitch: 0xf43f5e
    },
    ceramic: {
      name: 'Matcha & Sakura',     // Fresh Colorful Pastel Candy
      caseColor: 0xf8fafc,         // Crisp Pearl Arctic White
      caseRim: 0xf472b6,           // Rose Gold Chamfer Rim
      plateColor: 0xd1fae5,        // Sage Mint Plate
      accentColor: 0xf43f5e,       // Strawberry Coral Accent
      alphaBase: '#a7f3d0',        // Fresh Matcha Milk Alphas
      alphaGrad: '#d1fae5',
      modBase: '#fbcfe8',          // Soft Sakura Rose Modifiers
      modGrad: '#fce7f3',
      accentBase: '#fb7185',       // Strawberry Coral Accents
      accentGrad: '#fda4af',
      spaceBase: '#a7f3d0',
      spaceGrad: '#d1fae5',
      legendBase: '#064e3b',       // Deep Forest Pine
      legendShift: '#831843',      // Berry Rose
      legendMod: '#831843',
      underglow: 0xf472b6,         // Soft Sakura Blossom Underglow
      underglowIntensity: 2.0,
      lightAmbient: 0xffffff,
      lightMain: 0xfffaf0,
      stemColor: 0x10b981,         // Matcha Jade POM Stem
      deskpadColor: 0xe2e8f0,
      deskpadStitch: 0xf472b6
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

      // 2. Lubed Deep Bottom-Out Thock Resonance
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
    const ambientLight = new THREE.AmbientLight(0xffedd5, 0.85);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xfffbeb, 2.4);
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

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    fillLight.position.set(-14, 9, -10);
    scene.add(fillLight);

    const underglowLight = new THREE.PointLight(0xf59e0b, 2.6, 18);
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
    let showHands = false; // Hidden by default
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
      const topTaperW = isWide ? 0.94 : 0.80;
      const topTaperD = 0.80;
      for (let i = 0; i < pos.count; i++) {
        const y = pos.getY(i);
        if (y > 0) {
          pos.setX(i, pos.getX(i) * topTaperW);
          pos.setZ(i, pos.getZ(i) * topTaperD);
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
      new THREE.LineBasicMaterial({ color: currentTheme.deskpadStitch, transparent: true, opacity: 0.55 })
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

    // Perimeter Underglow Diffuser Strip
    const underglowShape = createRoundedRectShape(boardWidth + 0.16, boardDepth + 0.16, 0.48);
    const underglowGeo = new THREE.ShapeGeometry(underglowShape);
    underglowGeo.rotateX(-Math.PI / 2);
    const underglowMat = new THREE.MeshBasicMaterial({
      color: currentTheme.underglow,
      transparent: true,
      opacity: 0.55,
      side: THREE.DoubleSide
    });
    const underglowMesh = new THREE.Mesh(underglowGeo, underglowMat);
    underglowMesh.position.y = -boardHeight * 0.94;
    keyboardRoot.add(underglowMesh);

    // Brushed Aluminum Switch Plate
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

    // Dynamic Color Resolver Helper
    function resolveKeyStyle(keyDef, themeKey, theme) {
      if (themeKey === 'rgb') {
        const colIdx = keyDef.col !== undefined ? keyDef.col : 7;
        const hue = (colIdx / 14);
        if (keyDef.isAccent) {
          return { base: '#0284c7', grad: '#38bdf8', sideHex: 0x0284c7, textShift: '#ffffff', textBase: '#ffffff' };
        }
        if (keyDef.isMod) {
          return { base: '#18181b', grad: '#27272a', sideHex: 0x18181b, textShift: '#38bdf8', textBase: '#ffffff' };
        }
        const c1 = new THREE.Color().setHSL(hue, 0.72, 0.38).getHexString();
        const c2 = new THREE.Color().setHSL(hue, 0.85, 0.52).getHexString();
        return {
          base: '#' + c1,
          grad: '#' + c2,
          sideHex: parseInt(c1, 16),
          textShift: '#ffffff',
          textBase: '#ffffff'
        };
      }

      if (keyDef.isAccent) {
        return {
          base: theme.accentBase,
          grad: theme.accentGrad,
          sideHex: parseInt(theme.accentBase.replace('#', ''), 16),
          textShift: '#ffffff',
          textBase: '#ffffff'
        };
      }
      if (keyDef.isSpace) {
        return {
          base: theme.spaceBase,
          grad: theme.spaceGrad,
          sideHex: parseInt(theme.spaceBase.replace('#', ''), 16),
          textShift: theme.legendShift,
          textBase: theme.legendBase
        };
      }
      if (keyDef.isMod) {
        return {
          base: theme.modBase,
          grad: theme.modGrad,
          sideHex: parseInt(theme.modBase.replace('#', ''), 16),
          textShift: theme.legendShift,
          textBase: theme.legendMod
        };
      }
      return {
        base: theme.alphaBase,
        grad: theme.alphaGrad,
        sideHex: parseInt(theme.alphaBase.replace('#', ''), 16),
        textShift: theme.legendShift,
        textBase: theme.legendBase
      };
    }

    // 4. Dynamic High-DPI Keycap Texture Generator (Strictly 1:1 Aspect Ratio to Prevent Distortion)
    function generateKeyTexture(keyDef, layoutKey, theme, themeKey = currentThemeKey) {
      const style = resolveKeyStyle(keyDef, themeKey, theme);

      // Match canvas width directly to key aspect ratio (preventing any horizontal stretching)
      const unit = keyDef.unit || 1.0;
      const cvWidth = keyDef.isSpace ? 3840 : (unit >= 2.0 ? Math.round(512 * unit) : 512);
      const cvHeight = 512;

      const canvas = document.createElement('canvas');
      canvas.width = cvWidth;
      canvas.height = cvHeight;
      const ctx = canvas.getContext('2d');

      // Satin PBT Radial Texture Gradient
      const grad = ctx.createRadialGradient(cvWidth / 2, cvHeight * 0.35, 20, cvWidth / 2, cvHeight / 2, cvWidth * 0.75);
      grad.addColorStop(0, style.grad);
      grad.addColorStop(1, style.base);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, cvWidth, cvHeight);

      // Inset Edge Bevel
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 14;
      ctx.strokeRect(10, 10, cvWidth - 20, cvHeight - 20);

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      if (keyDef.isMod) {
        if (keyDef.label) {
          ctx.font = 'bold 94px "Inter", "Segoe UI", sans-serif';
          ctx.fillStyle = keyDef.isAccent ? '#ffffff' : style.textBase;
          ctx.shadowColor = 'rgba(0,0,0,0.6)';
          ctx.shadowBlur = 12;
          ctx.fillText(keyDef.label, cvWidth / 2, cvHeight / 2 + 4);
        } else if (keyDef.isSpace) {
          // Subtle Gold/Accent Laser Line
          ctx.fillStyle = theme.legendShift || '#f59e0b';
          ctx.fillRect(cvWidth / 2 - 240, cvHeight / 2 - 42, 480, 5);

          // Perfectly Proportioned Centered Logo Typography
          ctx.font = 'bold 50px "Space Grotesk", "Inter", sans-serif';
          ctx.fillStyle = 'rgba(255, 255, 255, 0.78)';
          ctx.letterSpacing = '8px';
          ctx.fillText('PK KHMER TYPE', cvWidth / 2, cvHeight / 2 + 18);
        }
      } else {
        const map = keyDef[layoutKey] || keyDef.std || {};
        const baseChar = map.base || '';
        const shiftChar = map.shift || '';

        // Shifted Glyph (Cleanly Centered on Top)
        if (shiftChar) {
          ctx.font = 'bold 106px "Khmer OS Siemreap", "Kantumruy Pro", "Segoe UI", sans-serif';
          ctx.fillStyle = style.textShift;
          ctx.shadowColor = 'rgba(245, 158, 11, 0.45)';
          ctx.shadowBlur = 8;
          ctx.fillText(shiftChar, cvWidth / 2, 114);
        }

        // Base Glyph (Cleanly Centered in Middle)
        if (baseChar) {
          ctx.font = 'bold 176px "Khmer OS Siemreap", "Kantumruy Pro", "Segoe UI", sans-serif';
          ctx.fillStyle = style.textBase;
          ctx.shadowColor = 'rgba(0,0,0,0.7)';
          ctx.shadowBlur = 14;
          const yPos = shiftChar ? cvHeight * 0.64 : cvHeight * 0.52;
          ctx.fillText(baseChar, cvWidth / 2, yPos);
        }

        // Homing nub on F and J
        if (keyDef.hasBump) {
          ctx.fillStyle = style.textShift;
          ctx.beginPath();
          ctx.rect(cvWidth / 2 - 45, cvHeight - 46, 90, 12);
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
        const initialStyle = resolveKeyStyle(keyDef, currentThemeKey, currentTheme);
        const texture = generateKeyTexture(keyDef, currentLayout, currentTheme, currentThemeKey);

        const sideMat = new THREE.MeshStandardMaterial({
          color: initialStyle.sideHex,
          roughness: 0.40,
          metalness: 0.18
        });
        const topMat = new THREE.MeshStandardMaterial({
          map: texture,
          roughness: 0.36,
          metalness: 0.14,
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
            const s = resolveKeyStyle(this.def, currentThemeKey, currentTheme);
            this.sideMat.color.setHex(s.sideHex);
            this.texture = generateKeyTexture(this.def, currentLayout, currentTheme, currentThemeKey);
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

    // ============================================================
    // F. ASSEMBLE 2: MUSEUM-GRADE MECHANICAL SWITCH SHOWCASE
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

    // 2. PA66 Nylon Bottom Switch Housing (Beveled Body with Guide Rails & Pins)
    const swBaseGroup = new THREE.Group();
    swBaseGroup.position.y = -0.15;
    macroSwitchGroup.add(swBaseGroup);

    const baseBodyGeo = new THREE.BoxGeometry(1.56, 0.62, 1.56);
    const baseBodyMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.55,
      metalness: 0.25
    });
    const baseBody = new THREE.Mesh(baseBodyGeo, baseBodyMat);
    baseBody.position.y = 0.31;
    baseBody.castShadow = true;
    swBaseGroup.add(baseBody);

    // Center Spring Well Column Guide
    const centerWellGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.38, 24);
    const centerWellMat = new THREE.MeshStandardMaterial({ color: 0x1f2430, roughness: 0.4 });
    const centerWell = new THREE.Mesh(centerWellGeo, centerWellMat);
    centerWell.position.y = 0.38;
    swBaseGroup.add(centerWell);

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
    springGroup.position.y = 0.22;
    macroSwitchGroup.add(springGroup);

    function buildHelicalSpringMesh(turns = 11, height = 0.72, radius = 0.21) {
      const curve = new THREE.CatmullRomCurve3(
        Array.from({ length: 65 }, (_, i) => {
          const p = i / 64;
          const theta = p * Math.PI * 2 * turns;
          const y = p * height;
          return new THREE.Vector3(Math.cos(theta) * radius, y, Math.sin(theta) * radius);
        })
      );
      const geo = new THREE.TubeGeometry(curve, 65, 0.034, 8, false);
      const mat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        metalness: 0.96,
        roughness: 0.12
      });
      return new THREE.Mesh(geo, mat);
    }
    const macroSpringMesh = buildHelicalSpringMesh();
    macroSpringMesh.castShadow = true;
    springGroup.add(macroSpringMesh);

    // 4. High-Precision Lustrous POM MX Cross Stem
    const stemGroup = new THREE.Group();
    stemGroup.position.y = 0.56;
    macroSwitchGroup.add(stemGroup);

    const stemMat = new THREE.MeshStandardMaterial({
      color: currentTheme.stemColor,
      roughness: 0.22,
      metalness: 0.06
    });

    // Stem Center Core Column
    const stemCoreGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.54, 16);
    const stemCore = new THREE.Mesh(stemCoreGeo, stemMat);
    stemCore.position.y = 0.27;
    stemGroup.add(stemCore);

    // Genuine Cherry MX Cross Mount '+' Shape
    const stemCrossV = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.44, 0.48), stemMat);
    const stemCrossH = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.44, 0.14), stemMat);
    stemCrossV.position.y = 0.58;
    stemCrossH.position.y = 0.58;
    stemGroup.add(stemCrossV, stemCrossH);

    // Stem Slider Rail Wings
    const railL = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.48, 0.26), stemMat);
    railL.position.set(-0.46, 0.24, 0);
    const railR = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.48, 0.26), stemMat);
    railR.position.set(0.46, 0.24, 0);
    stemGroup.add(railL, railR);

    // Stem Actuator Legs (Tactile/Linear ramp contacting leaf)
    const legMesh = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.24, 0.22), stemMat);
    legMesh.position.set(0.32, 0.12, 0);
    legMesh.rotation.z = 0.22;
    stemGroup.add(legMesh);

    // 5. Crystal-Clear Polycarbonate Upper Housing with Central Chimney Aperture
    const topHousingGroup = new THREE.Group();
    topHousingGroup.position.y = 0.50;
    macroSwitchGroup.add(topHousingGroup);

    const topShellMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.38,
      roughness: 0.08,
      metalness: 0.12,
      side: THREE.DoubleSide
    });

    // Perimeter lower collar
    const collarGeo = new THREE.BoxGeometry(1.58, 0.18, 1.58);
    const collarMesh = new THREE.Mesh(collarGeo, topShellMat);
    collarMesh.position.y = 0.09;
    topHousingGroup.add(collarMesh);

    // Chamfered Inward-Sloping Pyramid Roof with Center Hole
    const chimneyCollarGeo = new THREE.BoxGeometry(0.82, 0.28, 0.82);
    const chimneyMesh = new THREE.Mesh(chimneyCollarGeo, topShellMat);
    chimneyMesh.position.y = 0.32;
    topHousingGroup.add(chimneyMesh);

    // 4 Corner Angled Slopes
    [
      [-0.58, 0.20, 0], [0.58, 0.20, 0],
      [0, 0.20, -0.58], [0, 0.20, 0.58]
    ].forEach(([sx, sy, sz]) => {
      const slopeMesh = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.22, 0.42), topShellMat);
      slopeMesh.position.set(sx, sy, sz);
      topHousingGroup.add(slopeMesh);
    });

    // Four Snap Latches extending down
    const latchGeo = new THREE.BoxGeometry(0.12, 0.40, 0.22);
    [
      [-0.78, -0.06, 0], [0.78, -0.06, 0],
      [0, -0.06, -0.78], [0, -0.06, 0.78]
    ].forEach(([lx, ly, lz]) => {
      const latch = new THREE.Mesh(latchGeo, topShellMat);
      latch.position.set(lx, ly, lz);
      topHousingGroup.add(latch);
    });

    // 6. Showcase Double-Shot PBT Keycap with Underside Stem Socket
    const macroCapGroup = new THREE.Group();
    macroCapGroup.position.y = 1.08;
    macroSwitchGroup.add(macroCapGroup);

    const macroCapGeo = createSculptedKeycapGeometry(1.72, 1.72, 0.78, false);
    let activeGlyphChar = 'ក';
    const macroTexture = generateKeyTexture(ROW3_DEFS[8], 'standard', currentTheme, currentThemeKey);

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
      { name: 'Double-Shot PBT Keycap', y: 2.85, offset: 1.8 },
      { name: 'Polycarbonate Upper Housing', y: 2.05, offset: -1.8 },
      { name: 'Ruby POM MX Cross Stem', y: 1.35, offset: 1.8 },
      { name: '62g Gold Progressive Spring', y: 0.70, offset: -1.8 },
      { name: 'PA66 Nylon Bottom Housing', y: 0.05, offset: 1.8 }
    ];

    CALLOUT_DATA.forEach(c => {
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

      const nodeGeo = new THREE.CircleGeometry(0.08, 16);
      const nodeMat = new THREE.MeshBasicMaterial({ color: currentTheme.caseRim, side: THREE.DoubleSide });
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeMesh.position.copy(linePoints[0]);
      explodedLabelsGroup.add(nodeMesh);

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
    let macroCurrentY = 1.08;
    let macroVelocity = 0;
    let isMacroPressed = false;

    function pressMacroSwitch() {
      if (isMacroPressed) return;
      isMacroPressed = true;
      macroCapTopMat.emissive.setHex(currentTheme.underglow);
      macroCapTopMat.emissiveIntensity = 0.95;
      playMechanicalSound(true, 0.95);

      setTimeout(() => {
        isMacroPressed = false;
        macroCapTopMat.emissive.setHex(0x000000);
        macroCapTopMat.emissiveIntensity = 0;
        playMechanicalSound(false, 1.08);
      }, 150);
    }

    // ============================================================
    // G. ERGONOMIC TRANSLUCENT TOUCH-TYPING HAND MODEL
    // ============================================================
    const handsGuideGroup = new THREE.Group();
    handsGuideGroup.visible = false; // Hidden by default
    keyboardRoot.add(handsGuideGroup);

    const leftHandColor = 0x38bdf8;  // Ice Cyan (Left hand)
    const rightHandColor = 0xf472b6; // Coral Rose (Right hand)

    function createErgonomicHand(isLeft) {
      const handRig = new THREE.Group();
      const color = isLeft ? leftHandColor : rightHandColor;

      // Rest position coordinates in front of keyboard
      const palmX = isLeft ? -3.8 : 3.8;
      const palmY = 0.58;
      const palmZ = 3.35;

      const handMat = new THREE.MeshStandardMaterial({
        color: color,
        transparent: true,
        opacity: 0.28,
        roughness: 0.20,
        metalness: 0.12,
        depthWrite: false
      });

      // 1. Ergonomic Curved Palm Dorsum
      const palmShape = new THREE.Shape();
      palmShape.moveTo(-1.0, -0.8);
      palmShape.quadraticCurveTo(-1.1, 0.8, -0.8, 1.1);
      palmShape.quadraticCurveTo(0, 1.25, 0.8, 1.1);
      palmShape.quadraticCurveTo(1.1, 0.8, 1.0, -0.8);
      palmShape.quadraticCurveTo(0, -1.0, -1.0, -0.8);

      const palmGeo = new THREE.ExtrudeGeometry(palmShape, {
        depth: 0.28,
        bevelEnabled: true,
        bevelSegments: 3,
        bevelSize: 0.08,
        bevelThickness: 0.08
      });
      palmGeo.rotateX(-Math.PI / 2);
      const palmMesh = new THREE.Mesh(palmGeo, handMat);
      palmMesh.position.set(palmX, palmY, palmZ);
      palmMesh.rotation.y = isLeft ? 0.14 : -0.14;
      handRig.add(palmMesh);

      // Wrist Taper Base
      const wristGeo = new THREE.CylinderGeometry(0.55, 0.65, 0.65, 20);
      wristGeo.rotateX(Math.PI / 2.3);
      const wristMesh = new THREE.Mesh(wristGeo, handMat);
      wristMesh.position.set(palmX, palmY - 0.08, palmZ + 1.1);
      handRig.add(wristMesh);

      // 2. Five Articulated Curved Fingers in Relaxed Home-Row Posture
      const homeKeys = isLeft
        ? ['a', 's', 'd', 'f', 'space']
        : ['j', 'k', 'l', 'semicolon', 'space'];

      const knuckleOffsets = isLeft
        ? [ [-0.85, 0.6], [-0.35, 0.85], [0.15, 0.95], [0.65, 0.85], [0.85, -0.1] ]
        : [ [-0.65, 0.85], [-0.15, 0.95], [0.35, 0.85], [0.85, 0.6], [-0.85, -0.1] ];

      const fingers = [];

      homeKeys.forEach((keyId, idx) => {
        const keyObj = keyMapById.get(keyId);
        let targetX = 0;
        let targetZ = 0;
        if (keyId === 'space') {
          targetX = isLeft ? -1.3 : 1.3;
          targetZ = keyObj ? keyObj.group.position.z : 2.14;
        } else if (keyObj) {
          targetX = keyObj.group.position.x;
          targetZ = keyObj.group.position.z;
        }
        const targetY = 0.38;

        const kX = palmX + knuckleOffsets[idx][0];
        const kY = palmY + 0.05;
        const kZ = palmZ + knuckleOffsets[idx][1];

        // Knuckle Joint Node
        const knGeo = new THREE.SphereGeometry(0.11, 16, 16);
        const knMesh = new THREE.Mesh(knGeo, handMat);
        knMesh.position.set(kX, kY, kZ);
        handRig.add(knMesh);

        // Natural Anatomical Curved Finger Arch (Bezier Curve)
        const archPeakY = Math.max(kY, targetY) + 0.35;
        const midX = (kX + targetX) * 0.5;
        const midZ = (kZ + targetZ) * 0.5;

        const p1 = new THREE.Vector3(kX, kY, kZ);
        const p2 = new THREE.Vector3(midX, archPeakY, midZ);
        const p3 = new THREE.Vector3(targetX, targetY, targetZ);

        const fingerCurve = new THREE.QuadraticBezierCurve3(p1, p2, p3);
        const fingerGeo = new THREE.TubeGeometry(fingerCurve, 20, 0.075, 12, false);
        const fingerMesh = new THREE.Mesh(fingerGeo, handMat);
        handRig.add(fingerMesh);

        // Soft Glowing Fingertip Pad
        const tipGeo = new THREE.SphereGeometry(0.12, 16, 16);
        const tipMat = new THREE.MeshStandardMaterial({
          color: color,
          roughness: 0.1,
          metalness: 0.1,
          emissive: color,
          emissiveIntensity: 0.4
        });
        const tipMesh = new THREE.Mesh(tipGeo, tipMat);
        tipMesh.position.set(targetX, targetY, targetZ);
        handRig.add(tipMesh);

        fingers.push({
          keyId: keyId,
          baseY: targetY,
          tipMesh: tipMesh,
          strikePhase: 0
        });
      });

      return { rig: handRig, palmMesh: palmMesh, fingers: fingers };
    }

    const leftHand = createErgonomicHand(true);
    const rightHand = createErgonomicHand(false);
    handsGuideGroup.add(leftHand.rig);
    handsGuideGroup.add(rightHand.rig);

    // Strike Kinematic Finger on Keypress
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
      if (f) {
        f.strikePhase = 1.0;
      }
    }

    // ============================================================
    // H. INTERACTION, ORBIT CONTROLS, & RAYCASTING
    // ============================================================
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let sphericalTheta = 0;
    let sphericalPhi = Math.PI / 3.4;
    let sphericalRadius = 18.5;
    let targetRadius = 18.5;

    function updateCameraFromAngles() {
      const x = sphericalRadius * Math.sin(sphericalPhi) * Math.sin(sphericalTheta);
      const y = sphericalRadius * Math.cos(sphericalPhi);
      const z = sphericalRadius * Math.sin(sphericalPhi) * Math.cos(sphericalTheta);
      camera.position.set(x, y, z);
      camera.lookAt(defaultCamLook);
    }
    updateCameraFromAngles();

    // Mouse Drag to Orbit
    const cvElement = renderer.domElement;
    cvElement.style.cursor = 'grab';

    cvElement.addEventListener('mousedown', (e) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
      cvElement.style.cursor = 'grabbing';
      initAudioEngine();
    });

    window.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        cvElement.style.cursor = 'grab';
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouseX;
      const dy = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      sphericalTheta -= dx * 0.007;
      sphericalPhi -= dy * 0.007;
      sphericalPhi = Math.max(0.15, Math.min(Math.PI / 2.05, sphericalPhi));
      updateCameraFromAngles();
    });

    // Scroll to Zoom
    cvElement.addEventListener('wheel', (e) => {
      e.preventDefault();
      targetRadius += e.deltaY * 0.012;
      const minR = viewMode === 'switch' ? 4.5 : 9.0;
      const maxR = viewMode === 'switch' ? 18.0 : 32.0;
      targetRadius = Math.max(minR, Math.min(maxR, targetRadius));
    }, { passive: false });

    // Touch Support for Mobile / Tablet
    cvElement.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        prevMouseX = e.touches[0].clientX;
        prevMouseY = e.touches[0].clientY;
        initAudioEngine();
      }
    }, { passive: true });

    cvElement.addEventListener('touchmove', (e) => {
      if (!isDragging || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - prevMouseX;
      const dy = e.touches[0].clientY - prevMouseY;
      prevMouseX = e.touches[0].clientX;
      prevMouseY = e.touches[0].clientY;

      sphericalTheta -= dx * 0.009;
      sphericalPhi -= dy * 0.009;
      sphericalPhi = Math.max(0.15, Math.min(Math.PI / 2.05, sphericalPhi));
      updateCameraFromAngles();
    }, { passive: true });

    cvElement.addEventListener('touchend', () => {
      isDragging = false;
    });

    // Raycaster Click Detection on 3D Keycaps
    const raycaster = new THREE.Raycaster();
    const mouseCoord = new THREE.Vector2();

    cvElement.addEventListener('click', (e) => {
      const rect = cvElement.getBoundingClientRect();
      mouseCoord.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseCoord.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouseCoord, camera);

      if (viewMode === 'switch') {
        const hits = raycaster.intersectObjects(macroSwitchGroup.children, true);
        if (hits.length > 0) {
          pressMacroSwitch();
        }
      } else {
        const capMeshes = keyObjects.map(k => k.capMesh);
        const hits = raycaster.intersectObjects(capMeshes, false);
        if (hits.length > 0) {
          const hitMesh = hits[0].object;
          const keyObj = keyObjects.find(k => k.capMesh === hitMesh);
          if (keyObj) {
            keyObj.press();
            setTimeout(() => keyObj.release(), 160);
          }
        }
      }
    });

    // Physical Hardware Keyboard Sync
    window.addEventListener('keydown', (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
      const k = keyMapByCode.get(e.code);
      if (k) {
        k.press();
      }
      if (viewMode === 'switch') {
        pressMacroSwitch();
      }
    });

    window.addEventListener('keyup', (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
      const k = keyMapByCode.get(e.code);
      if (k) {
        k.release();
      }
    });

    // ============================================================
    // I. TOOLBAR CONTROLS & EVENT WIRING
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
          if (macroTexture) {
            macroTexture.dispose();
            const newTex = generateKeyTexture(ROW3_DEFS[8], currentLayout, currentTheme, currentThemeKey);
            macroCapTopMat.map = newTex;
            macroCapTopMat.needsUpdate = true;
          }
        });
      });

      // 2. Theme Switching
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
          deskpadBorder.material.color.setHex(currentTheme.deskpadStitch);
          cableMat.color.setHex(currentTheme.caseRim);

          keyObjects.forEach(k => {
            k.miniStemMat.color.setHex(currentTheme.stemColor);
            k.updateTexture();
          });

          stemMat.color.setHex(currentTheme.stemColor);
          macroCapSideMat.color.setHex(currentTheme.caseColor);
          if (macroTexture) {
            macroTexture.dispose();
            const newTex = generateKeyTexture(ROW3_DEFS[8], currentLayout, currentTheme, currentThemeKey);
            macroCapTopMat.map = newTex;
            macroCapTopMat.needsUpdate = true;
          }
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
        const targetCapY = isExploded ? 2.50 : (isMacroPressed ? 0.78 : 1.08);
        const diff = targetCapY - macroCurrentY;
        macroVelocity += diff * 0.45;
        macroVelocity *= 0.72;
        macroCurrentY += macroVelocity;
        macroCapGroup.position.y = macroCurrentY;

        const targetTopY = isExploded ? 1.75 : 0.50;
        topHousingGroup.position.y += (targetTopY - topHousingGroup.position.y) * 0.20;

        const targetStemY = isExploded ? 1.10 : (0.56 + (macroCurrentY - 1.08) * 0.95);
        stemGroup.position.y += (targetStemY - stemGroup.position.y) * 0.24;

        const targetSpringY = isExploded ? 0.52 : 0.22;
        springGroup.position.y += (targetSpringY - springGroup.position.y) * 0.20;

        if (!isExploded) {
          macroSpringMesh.scale.y = Math.max(0.65, 1.0 + (macroCurrentY - 1.08) * 1.3);
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
            k.topMat.emissive.setHSL(hue, 0.9, 0.12);
          }
        });
        const underglowHue = (time * 0.28) % 1.0;
        underglowMat.color.setHSL(underglowHue, 1.0, 0.5);
        underglowLight.color.setHSL(underglowHue, 1.0, 0.5);
        haloMat.color.setHSL(underglowHue, 1.0, 0.5);
      }

      // 6. Holographic Kinematic Hands Reticle Animation
      if (showHands) {
        [leftHand, rightHand].forEach(hand => {
          hand.fingers.forEach(f => {
            if (f.strikePhase > 0) {
              f.strikePhase = Math.max(0, f.strikePhase - delta * 4.0);
              const dip = Math.sin(f.strikePhase * Math.PI) * 0.24;
              f.tipMesh.position.y = f.baseY - dip;
            } else {
              f.tipMesh.position.y = f.baseY;
            }
          });
        });
      }

      renderer.render(scene, camera);
    }
    animate();

    // Responsive Canvas Resize Listener
    window.addEventListener('resize', () => {
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      if (nw && nh) {
        camera.aspect = nw / nh;
        camera.updateProjectionMatrix();
        renderer.setSize(nw, nh);
      }
    });
  }

  // Auto-boot on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initKeyboard3D);
  } else {
    initKeyboard3D();
  }
})();
