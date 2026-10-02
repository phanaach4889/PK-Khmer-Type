/* ============================================================
   PK Khmer Type — Interactive 3D Mechanical Keycap & Switch Engine
   Built with Three.js (Local Zero-Dependency)
   Features:
   - Sculpted OEM-profile keycap with Khmer glyphs & golden bevels
   - Mechanical switch assembly (housing, cross stem, coiled spring, pins)
   - Interactive orbit rotation, zoom, and mouse drag
   - Spring-damped mechanical keystroke press animation with Web Audio clicks
   - Legend selector (ក, ថ, ្, PK, A)
   - Material themes (Angkor Gold, Cyber Neon, Ceramic Ivory)
   - Exploded view mode & wireframe inspection
   ============================================================ */

(function () {
  'use strict';

  function init3DKeycap() {
    const container = document.getElementById('keycap3dContainer');
    if (!container || typeof THREE === 'undefined') return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 420;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060812, 0.025);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(5.5, 4.8, 6.5);
    camera.lookAt(0, 0.2, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    container.appendChild(renderer.domElement);

    // 2. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffeedd, 0.65);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xfff4e0, 1.8);
    mainLight.position.set(6, 10, 8);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 25;
    mainLight.shadow.bias = -0.0005;
    scene.add(mainLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.1);
    rimLight.position.set(-8, 5, -6);
    scene.add(rimLight);

    const keyGlowLight = new THREE.PointLight(0xff9d2e, 1.2, 8);
    keyGlowLight.position.set(0, 1.2, 0);
    scene.add(keyGlowLight);

    // Soft Shadow Contact Floor
    const floorGeo = new THREE.PlaneGeometry(16, 16);
    const floorMat = new THREE.ShadowMaterial({ opacity: 0.35 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Subtle Grid Pedestal
    const gridHelper = new THREE.GridHelper(8, 16, 0xff9d2e, 0x1f293d);
    gridHelper.position.y = -1.19;
    scene.add(gridHelper);

    // 3. Audio Synthesizer for Mechanical Switch Click
    let audioCtx = null;
    function playSwitchSound(isPress) {
      try {
        if (!audioCtx) {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          if (AudioContext) audioCtx = new AudioContext();
        }
        if (!audioCtx) return;
        if (audioCtx.state === 'suspended') audioCtx.resume();

        const t = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        if (isPress) {
          // Sharp tactile downstroke click
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(320, t);
          osc.frequency.exponentialRampToValueAtTime(140, t + 0.04);
          gain.gain.setValueAtTime(0.28, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
        } else {
          // Subtle spring upstroke clack
          osc.type = 'sine';
          osc.frequency.setValueAtTime(520, t);
          osc.frequency.exponentialRampToValueAtTime(260, t + 0.03);
          gain.gain.setValueAtTime(0.18, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
        }

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(t);
        osc.stop(t + 0.05);
      } catch (e) {}
    }

    // 4. Texture Generator for Keycap Legend
    let currentLegend = 'ក';
    let currentTheme = 'angkor';

    function createKeycapTexture(text, theme) {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');

      // Base background gradient matching keycap top
      if (theme === 'neon') {
        ctx.fillStyle = '#0a1020';
        ctx.fillRect(0, 0, 512, 512);
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 14;
        ctx.strokeRect(16, 16, 480, 480);
      } else if (theme === 'ceramic') {
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, 512, 512);
        ctx.strokeStyle = 'rgba(255, 157, 46, 0.35)';
        ctx.lineWidth = 12;
        ctx.strokeRect(16, 16, 480, 480);
      } else {
        // Angkor Gold Default
        ctx.fillStyle = '#0f1322';
        ctx.fillRect(0, 0, 512, 512);

        // Golden filigree border
        const borderGrad = ctx.createLinearGradient(0, 0, 512, 512);
        borderGrad.addColorStop(0, '#ffd166');
        borderGrad.addColorStop(1, '#ff9d2e');
        ctx.strokeStyle = borderGrad;
        ctx.lineWidth = 10;
        ctx.strokeRect(18, 18, 476, 476);

        // Corner accents
        ctx.fillStyle = '#ffd166';
        ctx.beginPath(); ctx.arc(32, 32, 6, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(480, 32, 6, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(32, 480, 6, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(480, 480, 6, 0, Math.PI * 2); ctx.fill();
      }

      // Main Glyph Text
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      if (theme === 'neon') {
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 24;
        ctx.fillStyle = '#e0f2fe';
      } else if (theme === 'ceramic') {
        ctx.fillStyle = '#1e293b';
        ctx.shadowColor = 'rgba(0,0,0,0.1)';
        ctx.shadowBlur = 6;
      } else {
        const textGrad = ctx.createLinearGradient(150, 100, 360, 400);
        textGrad.addColorStop(0, '#fff4cc');
        textGrad.addColorStop(0.5, '#ffd166');
        textGrad.addColorStop(1, '#ff9d2e');
        ctx.fillStyle = textGrad;
        ctx.shadowColor = 'rgba(255, 209, 102, 0.7)';
        ctx.shadowBlur = 18;
      }

      const fontFace = (text === 'PK' || text === 'A' || text === 'Space') ? 'Space Grotesk' : 'Kantumruy Pro';
      const fontSize = (text === 'Space' || text === 'PK') ? '110px' : '180px';
      ctx.font = `bold ${fontSize} ${fontFace}, -apple-system, sans-serif`;
      ctx.fillText(text, 256, 256);

      // Sub-label at bottom
      ctx.shadowBlur = 0;
      ctx.font = '600 36px "JetBrains Mono", monospace';
      ctx.fillStyle = theme === 'ceramic' ? '#64748b' : 'rgba(255, 209, 102, 0.55)';
      ctx.fillText('PK TYPE', 256, 420);

      const texture = new THREE.CanvasTexture(canvas);
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
      texture.needsUpdate = true;
      return texture;
    }

    // 5. Materials Setup
    const materials = {
      angkor: {
        capSides: new THREE.MeshStandardMaterial({
          color: 0x111626,
          roughness: 0.35,
          metalness: 0.15
        }),
        capTop: new THREE.MeshStandardMaterial({
          color: 0xffffff,
          map: createKeycapTexture(currentLegend, 'angkor'),
          roughness: 0.28,
          metalness: 0.25
        }),
        stem: new THREE.MeshStandardMaterial({ color: 0xff9d2e, roughness: 0.3, metalness: 0.4 }),
        housing: new THREE.MeshPhysicalMaterial({
          color: 0x1a2138,
          roughness: 0.2,
          transmission: 0.6,
          thickness: 0.8,
          transparent: true,
          opacity: 0.85
        }),
        spring: new THREE.MeshStandardMaterial({ color: 0xffd166, roughness: 0.2, metalness: 0.9 })
      },
      neon: {
        capSides: new THREE.MeshStandardMaterial({
          color: 0x091428,
          roughness: 0.2,
          metalness: 0.5
        }),
        capTop: new THREE.MeshStandardMaterial({
          color: 0xffffff,
          map: createKeycapTexture(currentLegend, 'neon'),
          roughness: 0.2,
          metalness: 0.6
        }),
        stem: new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.2, metalness: 0.7 }),
        housing: new THREE.MeshPhysicalMaterial({
          color: 0x0f172a,
          roughness: 0.1,
          transmission: 0.75,
          thickness: 1.0,
          transparent: true,
          opacity: 0.8
        }),
        spring: new THREE.MeshStandardMaterial({ color: 0xa855f7, roughness: 0.2, metalness: 0.9 })
      },
      ceramic: {
        capSides: new THREE.MeshStandardMaterial({
          color: 0xedebe6,
          roughness: 0.15,
          metalness: 0.05
        }),
        capTop: new THREE.MeshStandardMaterial({
          color: 0xffffff,
          map: createKeycapTexture(currentLegend, 'ceramic'),
          roughness: 0.18,
          metalness: 0.1
        }),
        stem: new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3, metalness: 0.3 }),
        housing: new THREE.MeshPhysicalMaterial({
          color: 0xffffff,
          roughness: 0.2,
          transmission: 0.5,
          thickness: 0.5,
          transparent: true,
          opacity: 0.9
        }),
        spring: new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.2, metalness: 0.85 })
      }
    };

    // 6. Geometry Assembly
    const rootAssembly = new THREE.Group();
    scene.add(rootAssembly);

    // Group A: Keycap (moves down during keypress)
    const keycapGroup = new THREE.Group();
    keycapGroup.position.y = 0.55;
    rootAssembly.add(keycapGroup);

    // Sculpted OEM Keycap Body
    // Using a cylinder with 4 segments to form a trapezoidal prism (tapered box)
    const capGeo = new THREE.CylinderGeometry(1.05, 1.35, 0.82, 4, 1);
    capGeo.rotateY(Math.PI / 4);

    // Create 6-material array for cylinder faces [side, top, bottom]
    const capMatArray = [
      materials[currentTheme].capSides,
      materials[currentTheme].capTop,
      materials[currentTheme].capSides
    ];

    const keycapMesh = new THREE.Mesh(capGeo, capMatArray);
    keycapMesh.castShadow = true;
    keycapMesh.receiveShadow = true;
    keycapGroup.add(keycapMesh);

    // Golden Bevel Trim around top dish
    const trimGeo = new THREE.RingGeometry(0.92, 1.02, 4);
    trimGeo.rotateX(-Math.PI / 2);
    trimGeo.rotateY(Math.PI / 4);
    const trimMat = new THREE.MeshStandardMaterial({
      color: 0xffd166,
      roughness: 0.15,
      metalness: 0.95
    });
    const trimMesh = new THREE.Mesh(trimGeo, trimMat);
    trimMesh.position.y = 0.412;
    keycapGroup.add(trimMesh);

    // Group B: Mechanical Switch Base & Housing
    const switchGroup = new THREE.Group();
    switchGroup.position.y = -0.35;
    rootAssembly.add(switchGroup);

    // Switch Top Housing (Upper Shell)
    const housingGeo = new THREE.BoxGeometry(1.65, 0.7, 1.65);
    const housingMesh = new THREE.Mesh(housingGeo, materials[currentTheme].housing);
    housingMesh.castShadow = true;
    switchGroup.add(housingMesh);

    // Switch Bottom Housing (Black base)
    const baseGeo = new THREE.BoxGeometry(1.72, 0.45, 1.72);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x0c0f18, roughness: 0.6 });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -0.48;
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    switchGroup.add(baseMesh);

    // Switch Metal Plate Collar
    const plateGeo = new THREE.BoxGeometry(2.1, 0.08, 2.1);
    const plateMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.3, metalness: 0.8 });
    const plateMesh = new THREE.Mesh(plateGeo, plateMat);
    plateMesh.position.y = -0.22;
    switchGroup.add(plateMesh);

    // Cross (+) Stem (slides inside the switch)
    const stemGroup = new THREE.Group();
    stemGroup.position.y = 0.45;
    switchGroup.add(stemGroup);

    const stemBar1 = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.65, 0.75), materials[currentTheme].stem);
    const stemBar2 = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.65, 0.24), materials[currentTheme].stem);
    stemBar1.castShadow = true;
    stemBar2.castShadow = true;
    stemGroup.add(stemBar1);
    stemGroup.add(stemBar2);

    // Helical Coiled Spring (Internal)
    class HelixCurve extends THREE.Curve {
      constructor(radius = 0.32, height = 0.6, coils = 5) {
        super();
        this.radius = radius;
        this.height = height;
        this.coils = coils;
      }
      getPoint(t) {
        const phi = t * Math.PI * 2 * this.coils;
        const x = this.radius * Math.cos(phi);
        const y = (t - 0.5) * this.height;
        const z = this.radius * Math.sin(phi);
        return new THREE.Vector3(x, y, z);
      }
    }
    const springGeo = new THREE.TubeGeometry(new HelixCurve(0.32, 0.62, 5.5), 64, 0.04, 8, false);
    const springMesh = new THREE.Mesh(springGeo, materials[currentTheme].spring);
    springMesh.position.y = -0.05;
    switchGroup.add(springMesh);

    // 7. Interactive State Variables
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let autoRotate = true;
    let isPressed = false;
    let pressProgress = 0;
    let isExploded = false;
    let isWireframe = false;

    // 8. Keystroke Press Animation Trigger
    function pressKey() {
      if (isPressed) return;
      isPressed = true;
      playSwitchSound(true);

      // Light flash
      keyGlowLight.intensity = 2.8;
      setTimeout(() => {
        keyGlowLight.intensity = 1.2;
      }, 140);
    }

    function releaseKey() {
      if (!isPressed) return;
      isPressed = false;
      playSwitchSound(false);
    }

    // Click / Touch bindings on canvas
    const canvas = renderer.domElement;
    canvas.addEventListener('mousedown', (e) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
      pressKey();
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
      releaseKey();
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouseX;
      const dy = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      rootAssembly.rotation.y += dx * 0.008;
      rootAssembly.rotation.x += dy * 0.008;
      rootAssembly.rotation.x = Math.max(-0.6, Math.min(1.2, rootAssembly.rotation.x));
      autoRotate = false;
    });

    // Touch support for mobile devices
    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        prevMouseX = e.touches[0].clientX;
        prevMouseY = e.touches[0].clientY;
        pressKey();
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      isDragging = false;
      releaseKey();
    });

    window.addEventListener('touchmove', (e) => {
      if (!isDragging || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - prevMouseX;
      const dy = e.touches[0].clientY - prevMouseY;
      prevMouseX = e.touches[0].clientX;
      prevMouseY = e.touches[0].clientY;

      rootAssembly.rotation.y += dx * 0.008;
      rootAssembly.rotation.x += dy * 0.008;
      autoRotate = false;
    }, { passive: true });

    // Scroll to zoom
    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      camera.position.z += e.deltaY * 0.005;
      camera.position.z = Math.max(4, Math.min(11, camera.position.z));
    }, { passive: false });

    // Global Keydown to trigger press if container is in view
    window.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'k' || e.key === 'K') {
        const rect = container.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          pressKey();
          setTimeout(releaseKey, 110);
        }
      }
    });

    // 9. UI Control Panel Bindings
    // Glyph Selector
    document.querySelectorAll('.key-glyph-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.key-glyph-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentLegend = btn.dataset.glyph;
        materials[currentTheme].capTop.map = createKeycapTexture(currentLegend, currentTheme);
        materials[currentTheme].capTop.needsUpdate = true;
        pressKey();
        setTimeout(releaseKey, 120);
      });
    });

    // Theme Selector
    document.querySelectorAll('.key-theme-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.key-theme-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentTheme = btn.dataset.theme;

        const th = materials[currentTheme];
        keycapMesh.material = [th.capSides, th.capTop, th.capSides];
        th.capTop.map = createKeycapTexture(currentLegend, currentTheme);
        th.capTop.needsUpdate = true;

        stemBar1.material = th.stem;
        stemBar2.material = th.stem;
        housingMesh.material = th.housing;
        springMesh.material = th.spring;
        pressKey();
        setTimeout(releaseKey, 120);
      });
    });

    // Exploded View Button
    const explodeBtn = document.getElementById('btnExplodedView');
    if (explodeBtn) {
      explodeBtn.addEventListener('click', () => {
        isExploded = !isExploded;
        explodeBtn.classList.toggle('active', isExploded);
      });
    }

    // Auto-Rotate Toggle Button
    const autoRotateBtn = document.getElementById('btnAutoRotate');
    if (autoRotateBtn) {
      autoRotateBtn.addEventListener('click', () => {
        autoRotate = !autoRotate;
        autoRotateBtn.classList.toggle('active', autoRotate);
      });
    }

    // Wireframe Toggle Button
    const wireframeBtn = document.getElementById('btnWireframe');
    if (wireframeBtn) {
      wireframeBtn.addEventListener('click', () => {
        isWireframe = !isWireframe;
        wireframeBtn.classList.toggle('active', isWireframe);
        scene.traverse((obj) => {
          if (obj.isMesh && obj.material) {
            if (Array.isArray(obj.material)) {
              obj.material.forEach(m => m.wireframe = isWireframe);
            } else {
              obj.material.wireframe = isWireframe;
            }
          }
        });
      });
    }

    // Reset View Button
    const resetViewBtn = document.getElementById('btnReset3DView');
    if (resetViewBtn) {
      resetViewBtn.addEventListener('click', () => {
        rootAssembly.rotation.set(0.18, 0.42, 0);
        camera.position.set(5.5, 4.8, 6.5);
        camera.lookAt(0, 0.2, 0);
        autoRotate = true;
        if (autoRotateBtn) autoRotateBtn.classList.add('active');
      });
    }

    // Press Trigger Button
    const pressTriggerBtn = document.getElementById('btnPressTrigger');
    if (pressTriggerBtn) {
      pressTriggerBtn.addEventListener('click', () => {
        pressKey();
        setTimeout(releaseKey, 140);
      });
    }

    // 10. Resize Observer
    const resizeObserver = new ResizeObserver(() => {
      const w = container.clientWidth || 600;
      const h = container.clientHeight || 420;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    resizeObserver.observe(container);

    // Initial orientation
    rootAssembly.rotation.set(0.18, 0.42, 0);

    // 11. Animation Render Loop
    let clock = new THREE.Clock();
    function animate() {
      requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Idle auto-rotation
      if (autoRotate && !isDragging) {
        rootAssembly.rotation.y += delta * 0.45;
      }

      // Floating gentle hover bob
      rootAssembly.position.y = Math.sin(elapsed * 1.8) * 0.06;

      // Spring Physics for Keycap Keystroke Travel
      const targetTravel = isPressed ? 0.32 : 0;
      pressProgress += (targetTravel - pressProgress) * (isPressed ? 0.45 : 0.22);

      // Exploded View target positions
      const explodeOffset = isExploded ? 1.6 : 0;
      const stemExplodeOffset = isExploded ? 0.75 : 0;

      // Apply positions
      keycapGroup.position.y = (0.55 + explodeOffset) - pressProgress;
      stemGroup.position.y = (0.45 + stemExplodeOffset) - (pressProgress * 0.9);
      springMesh.scale.y = 1 - (pressProgress * 0.6) + (isExploded ? 0.4 : 0);

      renderer.render(scene, camera);
    }
    animate();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init3DKeycap);
  } else {
    init3DKeycap();
  }
})();
