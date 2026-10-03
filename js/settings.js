/* ============================================================
   PK Khmer Type — Settings & Studio Command Center
   Themes, Mechanical Audio Profiles, 3D Hands, Cursor HUD,
   Practice Rules, Accessibility, Presets & Self-Healing
   ============================================================ */

const LS = Object.assign(window.LS || {}, {
  theme: "khmerSettingTheme",
  reducedMotion: "khmerSettingReducedMotion",
  largeText: "khmerSettingLargeText",
  sound: "khmerSettingSound",
  hands: "khmerSettingHands",
  handsOpacity: "khmerSettingHandsOpacity",
  accent: "khmerSettingAccent",
  khmerFont: "khmerSettingKhmerFont",
  shiftPreview: "khmerSettingShiftPreview",
  keyHighlight: "khmerSettingKeyHighlight",
  highContrast: "khmerSettingHighContrast",
  compactKeys: "khmerSettingCompactKeys",
  keyFx: "khmerSettingKeyFx",
  motes: "khmerSettingMotes",
  torches: "khmerSettingTorches",
  scanlines: "khmerSettingScanlines",
  focusMode: "khmerSettingFocusMode",
  sideDocks: "khmerSettingSideDocks",
  dyslexiaSpacing: "khmerSettingDyslexiaSpacing",
  switchProfile: "khmerSettingSwitchProfile",
  soundVolume: "khmerSettingSoundVolume",
  chime: "khmerSettingChime",
  ambienceVolume: "khmerSettingAmbienceVolume",
  reticle: "khmerSettingReticle",
  shockwave: "khmerSettingShockwave",
  layerHover: "khmerSettingLayerHover",
  strictMode: "khmerSettingStrictMode",
  autoAdvance: "khmerSettingAutoAdvance",
  liveStatsHud: "khmerSettingLiveStatsHud",
  targetWpm: "khmerSettingTargetWpm",
  wallpaperBlur: "khmerCustomWallpaperBlur",
  totals: "khmerGlobalStats"
});
window.LS = LS;

function safeGet(k, fallback) {
  try {
    const v = localStorage.getItem(k);
    return v === null ? fallback : v;
  } catch (e) {
    return fallback;
  }
}
function safeSet(k, v) {
  try {
    localStorage.setItem(k, v);
  } catch (e) {}
}

/* ---------- 0. Fortress Self-Healing (CSS + Right Hand + Modal DOM) ---------- */
function ensureSettingsStylesheet() {
  if (!document.querySelector('link[href*="css/settings.css"]')) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "css/settings.css?v=2";
    document.head.appendChild(link);
  }
}

function healBothHandsOverlay() {
  try {
    if (typeof FINGERS !== "undefined" && Array.isArray(FINGERS)) {
      const rpDef = { id: "rp", hand: "R", home: "semicolon", kind: "pinky", baseW: 12.5, tipW: 7.5, kDist: 68, restLen: 52, restAng: 0.10 };
      const existingIdx = FINGERS.findIndex((f) => f && f.id === "rp");
      if (existingIdx === -1) {
        FINGERS.push(rpDef);
      } else if (!FINGERS[existingIdx].kind) {
        FINGERS[existingIdx] = rpDef;
      }
      if (typeof fingerEls !== "undefined" && !fingerEls["rp"] && typeof createFingerElement === "function") {
        createFingerElement(rpDef);
      }
      if (typeof updateHandsOverlay === "function") {
        updateHandsOverlay();
      }
    }
    if (typeof render === "function") {
      render();
    }
  } catch (e) {}
}

function ensureUpgradedSettingsModalDOM() {
  const modal = document.getElementById("settingsModal");
  if (!modal || document.getElementById("settingsCategoryTabs")) return;

  // Preserve existing DOM buttons that storage.js already attached listeners to
  const existingExportBtn = document.getElementById("exportProgressBtn");
  const existingImportBtn = document.getElementById("importProgressBtn");
  const existingImportInput = document.getElementById("importProgressInput");
  const existingResetBtn = document.getElementById("resetProgressBtn");

  modal.innerHTML = `
  <div class="modal-card settings-modal-card">
    <div class="settings-header-wrap">
      <div class="settings-header-top">
        <div class="settings-title-group">
          <div class="settings-icon-badge" aria-hidden="true">
            <svg class="pk-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </div>
          <h2 id="settingsModalTitle"><span class="i18n-t" data-en="Settings &amp; Studio" data-km="ការកំណត់ និងស្ទូឌីយោ">Settings &amp; Studio</span> <span class="km-sub">ការកំណត់</span></h2>
          <span class="settings-count-pill" id="settingsActiveCatCount">32 Controls</span>
        </div>
        <button class="modal-close" id="settingsCloseBtn" aria-label="Close settings">&times;</button>
      </div>
      <div class="settings-tools-row">
        <div class="settings-search-box">
          <svg class="pk-icon settings-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" id="settingsSearchInput" class="settings-search-input" placeholder="Search settings (e.g. sound, hands, theme, font, cursor, lessons)..." autocomplete="off" spellcheck="false">
          <button type="button" id="settingsSearchClear" class="settings-search-clear" aria-label="Clear search" hidden>&times;</button>
        </div>
        <div class="settings-presets-bar">
          <span class="preset-chip-label">Presets:</span>
          <button type="button" class="settings-preset-btn" data-preset="default">Default</button>
          <button type="button" class="settings-preset-btn" data-preset="pro">Pro Typist</button>
          <button type="button" class="settings-preset-btn" data-preset="immersion">Full Immersion</button>
          <button type="button" class="settings-preset-btn" data-preset="performance">Battery Saver</button>
        </div>
      </div>
    </div>
    <div class="settings-tabs-scroll" id="settingsCategoryTabs" role="tablist">
      <button type="button" class="settings-cat-tab active" data-cat="all" role="tab" aria-selected="true">All Settings</button>
      <button type="button" class="settings-cat-tab" data-cat="general" role="tab" aria-selected="false">General &amp; Layout</button>
      <button type="button" class="settings-cat-tab" data-cat="keyboard" role="tab" aria-selected="false">Hands &amp; Cursor</button>
      <button type="button" class="settings-cat-tab" data-cat="audio" role="tab" aria-selected="false">Sound &amp; Audio</button>
      <button type="button" class="settings-cat-tab" data-cat="typing" role="tab" aria-selected="false">Typing &amp; Lessons</button>
      <button type="button" class="settings-cat-tab" data-cat="appearance" role="tab" aria-selected="false">Appearance &amp; Themes</button>
      <button type="button" class="settings-cat-tab" data-cat="immersion" role="tab" aria-selected="false">Immersion &amp; FX</button>
      <button type="button" class="settings-cat-tab" data-cat="a11y" role="tab" aria-selected="false">Accessibility</button>
      <button type="button" class="settings-cat-tab" data-cat="data" role="tab" aria-selected="false">Data &amp; Backup</button>
    </div>
    <div class="settings-body-scroll" id="settingsBodyScroll">
      <div class="settings-section" data-cat-section="general">
        <div class="settings-section-header"><h3 class="settings-section-title">General, Layout &amp; Language</h3><span class="settings-section-count">3 settings</span></div>
        <div class="settings-row" data-search="keyboard layout khmer standard nida english qwerty unicode">
          <div class="settings-row-info"><div class="settings-row-title-line"><span class="settings-row-name">Active Keyboard Layout</span><span class="settings-row-km">ប្លង់ក្តារចុច</span></div><div class="settings-row-desc">Switch the active keyboard mapping and lesson curriculum immediately.</div><div class="settings-layout-live-status" id="settingsLayoutLiveStatus"><span class="settings-layout-live-badge" id="settingsActiveLayoutBadge">Khmer Standard</span><span class="settings-layout-live-sample" id="settingsActiveLayoutPreview">Space = ្ (Coeng) • ក ខ គ ឃ ង</span></div></div>
          <div class="settings-row-control"><div class="settings-choice" id="settingsLayoutChoice"><button type="button" data-layout-set="standard" class="active">Khmer Standard</button><button type="button" data-layout-set="nida">Khmer NiDA</button><button type="button" data-layout-set="english">English (US)</button></div></div>
        </div>
        <div class="settings-row" data-search="language translate khmer english ui interface ភាសាខ្មែរ">
          <div class="settings-row-info"><div class="settings-row-title-line"><span class="settings-row-name">Interface Language</span><span class="settings-row-km">ភាសា</span></div><div class="settings-row-desc">Translate menus, buttons, and lesson guides between English and Khmer (Alt+L).</div></div>
          <div class="settings-row-control"><div class="settings-choice" id="settingsLangChoice"><button type="button" data-lang-set="en" class="active">English</button><button type="button" data-lang-set="km">ភាសាខ្មែរ (Khmer)</button></div></div>
        </div>
        <div class="settings-row" data-search="quick links documents 3d mechanical studio shortcuts statistics">
          <div class="settings-row-info"><div class="settings-row-title-line"><span class="settings-row-name">Studio &amp; Reference Tools</span><span class="settings-row-km">ឧបករណ៍ជំនួយ</span></div><div class="settings-row-desc">Jump directly to documentation, 3D mechanical viewer, shortcuts, or statistics.</div></div>
          <div class="settings-row-control"><div class="settings-quick-links"><button type="button" class="settings-action-pill" id="settingsOpenShortcutsBtn">Shortcuts</button><button type="button" class="settings-action-pill" id="settingsOpenStatsBtn">Statistics</button><a href="Documents/index.html" class="settings-action-pill">PK Documents</a><a href="keyboard-3d.html" class="settings-action-pill">3D Studio</a></div></div>
        </div>
      </div>

      <div class="settings-section" data-cat-section="keyboard">
        <div class="settings-section-header"><h3 class="settings-section-title">3D Hands, Keyboard &amp; Smart Cursor</h3><span class="settings-section-count">10 settings</span></div>
        <div class="settings-row" data-search="finger guide 3d hands kinematic left right hand"><div class="settings-row-info"><div class="settings-row-title-line"><span class="settings-row-name">3D Kinematic Finger Guide</span><span class="settings-row-km">មគ្គុទ្ទេសក៍ដៃ</span></div><div class="settings-row-desc">Display translucent left and right hands that reach to each target key.</div></div><div class="settings-row-control"><div class="toggle-switch on" id="settingsHandsToggle" role="switch" aria-checked="true" tabindex="0"></div></div></div>
        <div class="settings-row" data-search="hand opacity transparency alpha see through"><div class="settings-row-info"><div class="settings-row-title-line"><span class="settings-row-name">3D Hand Opacity</span><span class="settings-row-km">កម្រិតថ្លានៃដៃ</span></div><div class="settings-row-desc">Control how solid or see-through the 3D hands appear over the keycaps.</div></div><div class="settings-row-control"><div class="settings-slider-wrap"><input type="range" id="handsOpacitySlider" min="15" max="100" value="85"><span class="settings-slider-badge" id="handsOpacityValue">85%</span></div></div></div>
        <div class="settings-row" data-search="mouse cursor inspector hud tooltip character hover pronunciation"><div class="settings-row-info"><div class="settings-row-title-line"><span class="settings-row-name">Smart Mouse Cursor Inspector</span><span class="settings-row-km">ឧបករណ៍ពិនិត្យម៉ៅ</span></div><div class="settings-row-desc">Show character details, keystroke recipes, and sound when hovering keys or text (Alt+M).</div></div><div class="settings-row-control"><div class="toggle-switch on" id="settingsMouseInspectorToggle" role="switch" aria-checked="true" tabindex="0"></div></div></div>
        <div class="settings-row" data-search="cursor reticle pointer target ring cyber"><div class="settings-row-info"><div class="settings-row-title-line"><span class="settings-row-name">Precision Cursor Reticle</span><span class="settings-row-km">រង្វង់ម៉ៅ</span></div><div class="settings-row-desc">Render the cyber targeting ring around your mouse pointer.</div></div><div class="settings-row-control"><div class="toggle-switch on" id="settingsReticleToggle" role="switch" aria-checked="true" tabindex="0"></div></div></div>
        <div class="settings-row" data-search="click shockwave ripple ring mouse"><div class="settings-row-info"><div class="settings-row-title-line"><span class="settings-row-name">Mouse Click Shockwaves</span><span class="settings-row-km">រលកពេលចុចម៉ៅ</span></div><div class="settings-row-desc">Emit expanding ripple shockwaves on mouse clicks.</div></div><div class="settings-row-control"><div class="toggle-switch on" id="settingsShockwaveToggle" role="switch" aria-checked="true" tabindex="0"></div></div></div>
        <div class="settings-row" data-search="hover layer preview shift ctrl altgr pointer"><div class="settings-row-info"><div class="settings-row-title-line"><span class="settings-row-name">Hover Layer Auto-Preview</span><span class="settings-row-km">មើលស្រទាប់ពេលដាក់ម៉ៅ</span></div><div class="settings-row-desc">Rest your pointer on Shift, Ctrl, or AltGr to preview that layer on the board.</div></div><div class="settings-row-control"><div class="toggle-switch on" id="settingsLayerHoverToggle" role="switch" aria-checked="true" tabindex="0"></div></div></div>
        <div class="settings-row" data-search="shift key preview corner badge symbol"><div class="settings-row-info"><div class="settings-row-title-line"><span class="settings-row-name">Shift-key Corner Previews</span><span class="settings-row-km">សញ្ញា Shift លើគ្រាប់ចុច</span></div><div class="settings-row-desc">Display secondary shifted characters in the top-right corner of every keycap.</div></div><div class="settings-row-control"><div class="toggle-switch on" id="shiftPreviewToggle" role="switch" aria-checked="true" tabindex="0"></div></div></div>
        <div class="settings-row" data-search="highlight next key target glow pulse lesson"><div class="settings-row-info"><div class="settings-row-title-line"><span class="settings-row-name">Highlight Next Target Key</span><span class="settings-row-km">បន្លិចគ្រាប់ចុច</span></div><div class="settings-row-desc">Glow and pulse the required target key and modifier during practice drills.</div></div><div class="settings-row-control"><div class="toggle-switch on" id="keyHighlightToggle" role="switch" aria-checked="true" tabindex="0"></div></div></div>
        <div class="settings-row" data-search="key press effects ripple spark burst animation"><div class="settings-row-info"><div class="settings-row-title-line"><span class="settings-row-name">Key Press Spark Effects</span><span class="settings-row-km">បែបផែនចុច</span></div><div class="settings-row-desc">Trigger impact ripples and spark bursts on every keystroke.</div></div><div class="settings-row-control"><div class="toggle-switch on" id="keyFxToggle" role="switch" aria-checked="true" tabindex="0"></div></div></div>
        <div class="settings-row" data-search="compact keyboard small tight size"><div class="settings-row-info"><div class="settings-row-title-line"><span class="settings-row-name">Compact Keyboard Proportions</span><span class="settings-row-km">ក្តារចុចតូច</span></div><div class="settings-row-desc">Reduce keycap padding and gap for a tighter mechanical footprint.</div></div><div class="settings-row-control"><div class="toggle-switch" id="compactKeysToggle" role="switch" aria-checked="false" tabindex="0"></div></div></div>
      </div>

      <div class="settings-section" data-cat-section="audio">
        <div class="settings-section-header"><h3 class="settings-section-title">Sound &amp; Mechanical Audio Engine</h3><span class="settings-section-count">6 settings</span></div>
        <div class="settings-row" data-search="sound effects audio click keystroke mute soft"><div class="settings-row-info"><div class="settings-row-title-line"><span class="settings-row-name">Mechanical Key Sound</span><span class="settings-row-km">សំឡេងគ្រាប់ចុច</span></div><div class="settings-row-desc">Synthesize warm, real-time mechanical switch acoustics when typing (Alt+S).</div></div><div class="settings-row-control"><button type="button" class="settings-action-pill" id="settingsTestSoundBtn" title="Audition current switch sound">🔊 Test Sound</button><div class="toggle-switch on" id="settingsSoundToggle" role="switch" aria-checked="true" tabindex="0"></div></div></div>
        <div class="settings-row" data-search="switch profile sound soft cream raindrop marble holy panda tactile brown clicky blue red thock typewriter silent pillow"><div class="settings-row-info"><div class="settings-row-title-line"><span class="settings-row-name">Mechanical Switch Profile</span><span class="settings-row-km">ប្រភេទសំឡេងស្វ៊ីច</span></div><div class="settings-row-desc">Select your switch acoustic signature (click any switch to hear a live key press &amp; release).</div><div class="settings-layout-live-status" id="switchProfileLiveStatus"><span class="settings-layout-live-badge" id="switchProfileActiveBadge">Soft Cream</span><span class="settings-layout-live-sample" id="switchProfileActiveDesc">Warm, velvety lubed POM linear — soft &amp; gentle on the ears</span></div></div><div class="settings-row-control"><div class="settings-choice" id="switchProfileChoice"><button type="button" data-switch="soft-cream" class="active">Soft Cream</button><button type="button" data-switch="raindrop">Raindrop Marble</button><button type="button" data-switch="silent">Silent Pillow</button><button type="button" data-switch="red">Thocky Red</button><button type="button" data-switch="brown">Tactile Brown</button><button type="button" data-switch="holy-panda">Holy Panda</button><button type="button" data-switch="blue">Clicky Blue</button><button type="button" data-switch="typewriter">Typewriter</button></div></div></div>
        <div class="settings-row" data-search="sound volume loudness key click level"><div class="settings-row-info"><div class="settings-row-title-line"><span class="settings-row-name">Key Sound Volume</span><span class="settings-row-km">កម្រិតសំឡេងគ្រាប់ចុច</span></div><div class="settings-row-desc">Adjust master volume for mechanical switch clicks and chimes.</div></div><div class="settings-row-control"><div class="settings-slider-wrap"><input type="range" id="soundVolumeSlider" min="10" max="100" value="80"><span class="settings-slider-badge" id="soundVolumeValue">80%</span></div></div></div>
        <div class="settings-row" data-search="completion chime bell milestone lesson pass sound"><div class="settings-row-info"><div class="settings-row-title-line"><span class="settings-row-name">Completion &amp; Milestone Chimes</span><span class="settings-row-km">សំឡេងជោគជ័យ</span></div><div class="settings-row-desc">Play harmonic celebration chimes when completing a drill or mastering a lesson.</div></div><div class="settings-row-control"><div class="toggle-switch on" id="settingsChimeToggle" role="switch" aria-checked="true" tabindex="0"></div></div></div>
        <div class="settings-row" data-search="temple ambience drone background music relax meditation"><div class="settings-row-info"><div class="settings-row-title-line"><span class="settings-row-name">Temple Ambience Drone</span><span class="settings-row-km">សំឡេងបរិយាកាសប្រាសាទ</span></div><div class="settings-row-desc">Play a warm, meditative harmonic temple drone in the background.</div></div><div class="settings-row-control"><div class="toggle-switch" id="settingsAmbienceToggle" role="switch" aria-checked="false" tabindex="0"></div></div></div>
        <div class="settings-row" data-search="ambience volume drone loudness level"><div class="settings-row-info"><div class="settings-row-title-line"><span class="settings-row-name">Ambience Volume</span><span class="settings-row-km">កម្រិតសំឡេងបរិយាកាស</span></div><div class="settings-row-desc">Adjust the background temple ambience drone level.</div></div><div class="settings-row-control"><div class="settings-slider-wrap"><input type="range" id="ambienceVolumeSlider" min="10" max="100" value="50"><span class="settings-slider-badge" id="ambienceVolumeValue">50%</span></div></div></div>
      </div>

      <div class="settings-section" data-cat-section="typing">
        <div class="settings-section-header"><h3 class="settings-section-title">Typing, Lessons &amp; Practice</h3><span class="settings-section-count">5 settings</span></div>
        <div class="settings-row" data-search="unlock all lessons sandbox free practice 77 levels"><div class="settings-row-info"><div class="settings-row-title-line"><span class="settings-row-name">Unlock All Lessons (Sandbox Mode)</span><span class="settings-row-km">បើកមេរៀនទាំងអស់</span></div><div class="settings-row-desc">Unlock all 77 lessons across every curriculum so you can jump to any level freely.</div></div><div class="settings-row-control"><div class="toggle-switch" id="unlockAllLessonsToggle" role="switch" aria-checked="false" tabindex="0"></div></div></div>
        <div class="settings-row" data-search="strict mistake mode stop on error accuracy"><div class="settings-row-info"><div class="settings-row-title-line"><span class="settings-row-name">Strict Mistake Mode (Stop on Error)</span><span class="settings-row-km">តម្រូវឱ្យវាយត្រូវមុនទៅមុខ</span></div><div class="settings-row-desc">Require typing the exact target character before the prompt cursor advances.</div></div><div class="settings-row-control"><div class="toggle-switch on" id="strictModeToggle" role="switch" aria-checked="true" tabindex="0"></div></div></div>
        <div class="settings-row" data-search="auto advance next exercise drill lesson"><div class="settings-row-info"><div class="settings-row-title-line"><span class="settings-row-name">Auto-Advance Next Exercise</span><span class="settings-row-km">បន្តលំហាត់បន្ទាប់ស្វ័យប្រវត្តិ</span></div><div class="settings-row-desc">Automatically advance to the next drill step upon finishing an exercise.</div></div><div class="settings-row-control"><div class="toggle-switch on" id="autoAdvanceToggle" role="switch" aria-checked="true" tabindex="0"></div></div></div>
        <div class="settings-row" data-search="live speed wpm accuracy counter hud stats"><div class="settings-row-info"><div class="settings-row-title-line"><span class="settings-row-name">Show Live Speed &amp; Accuracy Counters</span><span class="settings-row-km">បង្ហាញល្បឿន និងភាពត្រឹមត្រូវផ្ទាល់</span></div><div class="settings-row-desc">Display real-time WPM and accuracy telemetry while practicing.</div></div><div class="settings-row-control"><div class="toggle-switch on" id="liveStatsHudToggle" role="switch" aria-checked="true" tabindex="0"></div></div></div>
        <div class="settings-row" data-search="target wpm goal speed benchmark"><div class="settings-row-info"><div class="settings-row-title-line"><span class="settings-row-name">Personal Target WPM Goal</span><span class="settings-row-km">គោលដៅល្បឿន WPM</span></div><div class="settings-row-desc">Set your personal words-per-minute speed goal for practice sessions.</div></div><div class="settings-row-control"><div class="settings-slider-wrap"><input type="range" id="targetWpmSlider" min="15" max="120" step="5" value="40"><span class="settings-slider-badge" id="targetWpmValue">40 WPM</span></div></div></div>
      </div>

      <div class="settings-section" data-cat-section="appearance">
        <div class="settings-section-header"><h3 class="settings-section-title">Appearance, Themes &amp; Wallpaper</h3><span class="settings-section-count">7 settings</span></div>
        <div class="settings-row" data-search="theme dark temple moonlight jungle sunset sepia light system color"><div class="settings-row-info"><div class="settings-row-title-line"><span class="settings-row-name">Studio Color Theme</span><span class="settings-row-km">ស្បែកកម្មវិធី</span></div><div class="settings-row-desc">Select the overall atmosphere and lighting palette.</div></div><div class="settings-row-control"><div class="settings-choice" id="themeChoice"><button type="button" data-theme="dark" class="active"><span class="theme-dot dark"></span>Dark</button><button type="button" data-theme="temple"><span class="theme-dot temple"></span>Temple</button><button type="button" data-theme="moonlight"><span class="theme-dot moonlight"></span>Moonlight</button><button type="button" data-theme="jungle"><span class="theme-dot jungle"></span>Jungle</button><button type="button" data-theme="sunset"><span class="theme-dot sunset"></span>Sunset</button><button type="button" data-theme="sepia"><span class="theme-dot sepia"></span>Sepia</button><button type="button" data-theme="light"><span class="theme-dot light"></span>Light</button><button type="button" data-theme="system"><span class="theme-dot system"></span>System</button></div></div></div>
        <div class="settings-row" data-search="accent color gold jade sapphire ruby cyan amethyst"><div class="settings-row-info"><div class="settings-row-title-line"><span class="settings-row-name">Primary Accent Color</span><span class="settings-row-km">ពណ៌លេចធ្លោ</span></div><div class="settings-row-desc">Choose the highlight glow color for active keys, badges, and buttons.</div></div><div class="settings-row-control"><div class="settings-choice accent-choice" id="accentChoice"><button type="button" data-accent="gold" class="active" style="--sw:#ffd166" aria-label="Gold accent"></button><button type="button" data-accent="jade" style="--sw:#5fd694" aria-label="Jade accent"></button><button type="button" data-accent="sapphire" style="--sw:#2dd4a7" aria-label="Sapphire accent"></button><button type="button" data-accent="ruby" style="--sw:#ff5a70" aria-label="Ruby accent"></button><button type="button" data-accent="cyan" style="--sw:#38bdf8" aria-label="Cyber Cyan accent"></button><button type="button" data-accent="amethyst" style="--sw:#c084fc" aria-label="Amethyst accent"></button></div></div></div>
        <div class="settings-row" data-search="khmer font family kantumruy noto sans serif battambang moul typography"><div class="settings-row-info"><div class="settings-row-title-line"><span class="settings-row-name">Khmer Script Font Family</span><span class="settings-row-km">ពុម្ពអក្សរខ្មែរ</span></div><div class="settings-row-desc">Choose the Khmer typeface for keycaps, HUD cards, and typing prompts.</div><div class="khmer-font-preview-box" id="khmerFontPreviewBox"><span class="khmer-font-preview-tag" id="khmerFontActiveTag">Kantumruy Pro</span><span class="khmer-font-preview-sample" id="khmerFontPreviewSample">ភាសាខ្មែរ • ក ខ គ ឃ ង • កម្ពុជា ១២៣៤៥</span></div></div><div class="settings-row-control"><div class="settings-choice" id="khmerFontChoice"><button type="button" data-kfont="kantumruy" class="active">Kantumruy Pro</button><button type="button" data-kfont="noto-sans">Noto Sans Khmer</button><button type="button" data-kfont="noto-serif">Noto Serif Khmer</button><button type="button" data-kfont="battambang">Battambang</button><button type="button" data-kfont="moul">Moul (ឆ្លាក់)</button></div></div></div>
        <div class="settings-row" data-search="larger text font size big scale zoom"><div class="settings-row-info"><div class="settings-row-title-line"><span class="settings-row-name">Larger Text &amp; Key Glyphs</span><span class="settings-row-km">អក្សរធំ</span></div><div class="settings-row-desc">Increase font size across keycaps, reading prompts, and menus.</div></div><div class="settings-row-control"><div class="toggle-switch" id="largeTextToggle" role="switch" aria-checked="false" tabindex="0"></div></div></div>
        <div class="settings-row wallpaper-settings-row" data-search="custom wallpaper background image photo url upload"><div class="settings-row-info"><div class="settings-row-title-line"><span class="settings-row-name">Custom Background Wallpaper</span><span class="settings-row-km">រូបភាពផ្ទៃក្រោយ</span></div><div class="settings-row-desc">Upload an image or paste an image URL for your studio backdrop.</div></div><div class="settings-row-control"><div class="wallpaper-actions"><input type="file" id="wallpaperFileInput" accept="image/*" style="display:none;"><button type="button" class="wallpaper-btn" id="uploadWallpaperBtn">Choose Image</button><button type="button" class="wallpaper-btn" id="urlWallpaperBtn">URL</button><button type="button" class="wallpaper-btn danger" id="removeWallpaperBtn" style="display:none;">Remove</button></div></div></div>
        <div class="settings-row wallpaper-dim-row" id="wallpaperDimControl" style="display:none;" data-search="wallpaper dimming brightness dark"><div class="settings-row-info"><div class="settings-row-title-line"><span class="settings-row-name">Wallpaper Dimming</span></div><div class="settings-row-desc">Darken the custom wallpaper so the keyboard stays crisp.</div></div><div class="settings-row-control"><div class="settings-slider-wrap"><input type="range" id="wallpaperDimSlider" min="15" max="90" value="65"><span class="settings-slider-badge" id="wallpaperDimValue">65%</span></div></div></div>
        <div class="settings-row" data-search="wallpaper blur glass backdrop"><div class="settings-row-info"><div class="settings-row-title-line"><span class="settings-row-name">Backdrop Glass Blur</span><span class="settings-row-km">កម្រិតព្រាលផ្ទៃក្រោយ</span></div><div class="settings-row-desc">Apply soft optical depth-of-field blur to custom wallpapers.</div></div><div class="settings-row-control"><div class="settings-slider-wrap"><input type="range" id="wallpaperBlurSlider" min="0" max="24" value="0"><span class="settings-slider-badge" id="wallpaperBlurValue">0px</span></div></div></div>
      </div>

      <div class="settings-section" data-cat-section="immersion">
        <div class="settings-section-header"><h3 class="settings-section-title">Immersion, Atmosphere &amp; Panels</h3><span class="settings-section-count">5 settings</span></div>
        <div class="settings-row" data-search="focus mode zen distraction free hide panels"><div class="settings-row-info"><div class="settings-row-title-line"><span class="settings-row-name">Focus Mode</span><span class="settings-row-km">របៀបផ្តោត</span></div><div class="settings-row-desc">Dim headers and sidebars so only the keyboard and typing prompt remain (Alt+F).</div></div><div class="settings-row-control"><div class="toggle-switch" id="focusModeToggle" role="switch" aria-checked="false" tabindex="0"></div></div></div>
        <div class="settings-row" data-search="side docks panels quick guide lessons sidebar"><div class="settings-row-info"><div class="settings-row-title-line"><span class="settings-row-name">Show Side Reference Docks</span><span class="settings-row-km">បង្ហាញផ្ទាំងសងខាង</span></div><div class="settings-row-desc">Display the Quick Guide (left) and Lessons Navigator (right) side panels.</div></div><div class="settings-row-control"><div class="toggle-switch on" id="sideDocksToggle" role="switch" aria-checked="true" tabindex="0"></div></div></div>
        <div class="settings-row" data-search="ember particles ambient motes floating dust"><div class="settings-row-info"><div class="settings-row-title-line"><span class="settings-row-name">Floating Ember Particles</span><span class="settings-row-km">ភាគល្អិតពន្លឺ</span></div><div class="settings-row-desc">Render drifting ambient light motes across the backdrop.</div></div><div class="settings-row-control"><div class="toggle-switch on" id="motesToggle" role="switch" aria-checked="true" tabindex="0"></div></div></div>
        <div class="settings-row" data-search="torch flames fire temple light"><div class="settings-row-info"><div class="settings-row-title-line"><span class="settings-row-name">Temple Torch Flames</span><span class="settings-row-km">អណ្តាតភ្លើង</span></div><div class="settings-row-desc">Display warm flickering torchlight along the sides of the screen.</div></div><div class="settings-row-control"><div class="toggle-switch on" id="torchesToggle" role="switch" aria-checked="true" tabindex="0"></div></div></div>
        <div class="settings-row" data-search="scanline overlay crt holographic retro"><div class="settings-row-info"><div class="settings-row-title-line"><span class="settings-row-name">Holographic Scanline Overlay</span><span class="settings-row-km">បន្ទាត់ស្កេន</span></div><div class="settings-row-desc">Add a subtle cybernetic CRT scanline texture across the viewport.</div></div><div class="settings-row-control"><div class="toggle-switch" id="scanlinesToggle" role="switch" aria-checked="false" tabindex="0"></div></div></div>
      </div>

      <div class="settings-section" data-cat-section="a11y">
        <div class="settings-section-header"><h3 class="settings-section-title">Accessibility &amp; Visual Comfort</h3><span class="settings-section-count">3 settings</span></div>
        <div class="settings-row" data-search="reduced motion animations disable smooth"><div class="settings-row-info"><div class="settings-row-title-line"><span class="settings-row-name">Reduced Motion</span><span class="settings-row-km">កាត់បន្ថយចលនា</span></div><div class="settings-row-desc">Minimize animations, floating effects, and camera transitions.</div></div><div class="settings-row-control"><div class="toggle-switch" id="reducedMotionToggle" role="switch" aria-checked="false" tabindex="0"></div></div></div>
        <div class="settings-row" data-search="high contrast borders visibility sharp"><div class="settings-row-info"><div class="settings-row-title-line"><span class="settings-row-name">High Contrast Mode</span><span class="settings-row-km">កម្រិតពណ៌ខ្ពស់</span></div><div class="settings-row-desc">Strengthen keycap borders, text contrast, and button outlines.</div></div><div class="settings-row-control"><div class="toggle-switch" id="highContrastToggle" role="switch" aria-checked="false" tabindex="0"></div></div></div>
        <div class="settings-row" data-search="dyslexia wide letter spacing prompt readability"><div class="settings-row-info"><div class="settings-row-title-line"><span class="settings-row-name">Wide Prompt Character Spacing</span><span class="settings-row-km">គម្លាតអក្សរទូលាយ</span></div><div class="settings-row-desc">Add generous horizontal spacing between characters in lesson prompts for easier reading.</div></div><div class="settings-row-control"><div class="toggle-switch" id="dyslexiaSpacingToggle" role="switch" aria-checked="false" tabindex="0"></div></div></div>
      </div>

      <div class="settings-section" data-cat-section="data">
        <div class="settings-section-header"><h3 class="settings-section-title">Progress Data, Backup &amp; Reset</h3><span class="settings-section-count">Storage &amp; Backup</span></div>
        <div class="settings-storage-card" data-search="storage progress stats keys typed lessons mastered">
          <div class="settings-storage-grid">
            <div class="settings-storage-stat"><span class="settings-stat-label">Total Keys Typed</span><span class="settings-stat-val" id="settingsStatKeys">0</span></div>
            <div class="settings-storage-stat"><span class="settings-stat-label">Lessons Mastered</span><span class="settings-stat-val" id="settingsStatMastered">0 / 77</span></div>
            <div class="settings-storage-stat"><span class="settings-stat-label">Best Speed</span><span class="settings-stat-val" id="settingsStatBestWpm">0 WPM</span></div>
            <div class="settings-storage-stat"><span class="settings-stat-label">Local Storage</span><span class="settings-stat-val" id="settingsStatStorage">0 KB</span></div>
          </div>
        </div>
        <div class="settings-row" data-search="export import backup json save restore file">
          <div class="settings-row-info"><div class="settings-row-title-line"><span class="settings-row-name">Backup &amp; Restore Progress (.json)</span><span class="settings-row-km">បម្រុងទុក និងទាញយកទិន្នន័យ</span></div><div class="settings-row-desc">Download a portable JSON backup of your progress and settings, or restore from a file.</div></div>
          <div class="settings-row-control" id="settingsBackupBtnSlot"></div>
        </div>
        <div class="settings-row" data-search="reset all progress delete clear lessons stats danger">
          <div class="settings-row-info"><div class="settings-row-title-line"><span class="settings-row-name" style="color:#f87171;">Reset All Typing Progress</span><span class="settings-row-km">លុបវឌ្ឍនភាពទាំងអស់</span></div><div class="settings-row-desc">Permanently erase all completed lessons, WPM records, and history.</div></div>
          <div class="settings-row-control" id="settingsResetBtnSlot"></div>
        </div>
      </div>

      <div class="settings-empty-search" id="settingsEmptySearch" hidden>
        No settings found matching "<strong id="settingsSearchTerm"></strong>". Try searching for <em>sound</em>, <em>hands</em>, <em>theme</em>, <em>cursor</em>, or <em>lessons</em>.
      </div>
    </div>
    <div class="settings-footer-wrap">
      <div class="settings-footer-left">All changes apply immediately and save automatically.</div>
      <div class="settings-footer-actions">
        <button type="button" class="settings-btn-ghost" id="resetPreferencesBtn">Reset Default Settings</button>
        <button type="button" class="settings-btn-primary" id="settingsDoneBtn">Done</button>
      </div>
    </div>
  </div>`;

  const backupSlot = document.getElementById("settingsBackupBtnSlot");
  if (backupSlot) {
    if (existingExportBtn) backupSlot.appendChild(existingExportBtn);
    if (existingImportBtn) backupSlot.appendChild(existingImportBtn);
    if (existingImportInput) backupSlot.appendChild(existingImportInput);
  }
  const resetSlot = document.getElementById("settingsResetBtnSlot");
  if (resetSlot && existingResetBtn) {
    existingResetBtn.style.width = "auto";
    existingResetBtn.style.margin = "0";
    existingResetBtn.style.padding = "8px 14px";
    resetSlot.appendChild(existingResetBtn);
  }
}

/* ---------- temple confirm dialog (replaces native confirm()) ---------- */
function templeConfirm(message, opts) {
  opts = opts || {};
  const backdrop = document.getElementById("templeConfirmModal");
  const titleEl = document.getElementById("templeConfirmTitle");
  const msgEl = document.getElementById("templeConfirmMsg");
  const iconEl = document.getElementById("templeConfirmIcon");
  const okBtn = document.getElementById("templeConfirmOkBtn");
  const cancelBtn = document.getElementById("templeConfirmCancelBtn");

  if (!backdrop || !okBtn || !cancelBtn) {
    return Promise.resolve(window.confirm(message));
  }

  titleEl.textContent = opts.title || "Are you sure?";
  msgEl.textContent = message;
  iconEl.innerHTML = opts.icon || (opts.danger ? pkIcon("alert", 24) : pkIcon("settings", 24));
  okBtn.textContent = opts.confirmLabel || (opts.danger ? "Yes, continue" : "Continue");
  cancelBtn.textContent = opts.cancelLabel || "Cancel";
  backdrop.classList.toggle("is-danger", !!opts.danger);

  return new Promise((resolve) => {
    let settled = false;
    function close(result) {
      if (settled) return;
      settled = true;
      backdrop.hidden = true;
      okBtn.removeEventListener("click", onOk);
      cancelBtn.removeEventListener("click", onCancel);
      backdrop.removeEventListener("click", onBackdrop);
      document.removeEventListener("keydown", onKey);
      resolve(result);
    }
    function onOk() { close(true); }
    function onCancel() { close(false); }
    function onBackdrop(e) { if (e.target === backdrop) close(false); }
    function onKey(e) {
      if (e.key === "Escape") close(false);
      if (e.key === "Enter") close(true);
    }
    okBtn.addEventListener("click", onOk);
    cancelBtn.addEventListener("click", onCancel);
    backdrop.addEventListener("click", onBackdrop);
    document.addEventListener("keydown", onKey);
    backdrop.hidden = false;
    requestAnimationFrame(() => cancelBtn.focus());
  });
}

/* ---------- Audio Engine: Multi-Switch Profiles, Volume, Chimes & Ambience ---------- */
let audioCtx = null;
let noiseBuffer = null;
let velvetNoiseBuffer = null;
let soundOn = safeGet(LS.sound, "1") !== "0";
let chimeOn = safeGet(LS.chime, "1") !== "0";
let switchProfile = safeGet(LS.switchProfile, "soft-cream");
let soundVolumePct = parseInt(safeGet(LS.soundVolume, "80"), 10) || 80;
let ambienceVolumePct = parseInt(safeGet(LS.ambienceVolume, "50"), 10) || 50;
let ambienceOn = false;
let ambienceNodes = null;
const soundToggle = document.getElementById("soundToggle");
const ambienceToggle = document.getElementById("ambienceToggle");

const SWITCH_PROFILE_META = {
  "soft-cream": {
    label: "Soft Cream",
    desc: "Warm, velvety lubed POM linear — soft & gentle on the ears",
    useVelvet: true,
    filterType: "lowpass",
    downFilterFreq: 720,
    upFilterFreq: 920,
    filterQ: 0.9,
    downNoiseAmp: 0.14,
    upNoiseAmp: 0.065,
    downBodyFreq: 138,
    upBodyFreq: 176,
    downBodyEnd: 68,
    upBodyEnd: 98,
    downBodyAmp: 0.19,
    upBodyAmp: 0.085,
    bodyType: "sine",
    overtoneRatio: 2.0,
    overtoneAmp: 0.045,
    decay: 0.072
  },
  raindrop: {
    label: "Raindrop Marble",
    desc: "Deep, creamy marble pebble tap on a gasket-mounted plate",
    useVelvet: true,
    filterType: "bandpass",
    downFilterFreq: 960,
    upFilterFreq: 1180,
    filterQ: 1.75,
    downNoiseAmp: 0.16,
    upNoiseAmp: 0.075,
    downBodyFreq: 168,
    upBodyFreq: 210,
    downBodyEnd: 88,
    upBodyEnd: 118,
    downBodyAmp: 0.21,
    upBodyAmp: 0.095,
    bodyType: "sine",
    overtoneRatio: 2.35,
    overtoneAmp: 0.065,
    decay: 0.068
  },
  silent: {
    label: "Silent Pillow",
    desc: "Whisper-soft silicone dampened switch for quiet late-night typing",
    useVelvet: true,
    filterType: "lowpass",
    downFilterFreq: 490,
    upFilterFreq: 620,
    filterQ: 0.7,
    downNoiseAmp: 0.075,
    upNoiseAmp: 0.035,
    downBodyFreq: 108,
    upBodyFreq: 134,
    downBodyEnd: 56,
    upBodyEnd: 74,
    downBodyAmp: 0.10,
    upBodyAmp: 0.045,
    bodyType: "sine",
    overtoneRatio: 1.8,
    overtoneAmp: 0.02,
    decay: 0.052
  },
  red: {
    label: "Thocky Red",
    desc: "Deep, full-bodied PBT keycap bottom-out thock",
    useVelvet: true,
    filterType: "lowpass",
    downFilterFreq: 860,
    upFilterFreq: 1120,
    filterQ: 1.05,
    downNoiseAmp: 0.17,
    upNoiseAmp: 0.08,
    downBodyFreq: 126,
    upBodyFreq: 164,
    downBodyEnd: 62,
    upBodyEnd: 86,
    downBodyAmp: 0.22,
    upBodyAmp: 0.10,
    bodyType: "sine",
    overtoneRatio: 1.95,
    overtoneAmp: 0.05,
    decay: 0.082
  },
  brown: {
    label: "Tactile Brown",
    desc: "Gentle, rounded tactile bump with warm mid-range body",
    useVelvet: true,
    filterType: "bandpass",
    downFilterFreq: 1180,
    upFilterFreq: 1480,
    filterQ: 1.25,
    downNoiseAmp: 0.19,
    upNoiseAmp: 0.09,
    downBodyFreq: 156,
    upBodyFreq: 198,
    downBodyEnd: 82,
    upBodyEnd: 110,
    downBodyAmp: 0.17,
    upBodyAmp: 0.08,
    bodyType: "sine",
    overtoneRatio: 2.15,
    overtoneAmp: 0.055,
    decay: 0.068
  },
  "holy-panda": {
    label: "Holy Panda",
    desc: "Snappy, poppy tactile bump with rich resonant housing",
    useVelvet: false,
    filterType: "bandpass",
    downFilterFreq: 1380,
    upFilterFreq: 1720,
    filterQ: 1.6,
    downNoiseAmp: 0.22,
    upNoiseAmp: 0.10,
    downBodyFreq: 184,
    upBodyFreq: 232,
    downBodyEnd: 96,
    upBodyEnd: 128,
    downBodyAmp: 0.19,
    upBodyAmp: 0.09,
    bodyType: "triangle",
    overtoneRatio: 2.4,
    overtoneAmp: 0.06,
    decay: 0.064
  },
  blue: {
    label: "Clicky Blue",
    desc: "Crisp, musical tactile click jacket with clean bottom-out",
    useVelvet: false,
    filterType: "bandpass",
    downFilterFreq: 2450,
    upFilterFreq: 2950,
    filterQ: 2.1,
    downNoiseAmp: 0.25,
    upNoiseAmp: 0.12,
    downBodyFreq: 340,
    upBodyFreq: 420,
    downBodyEnd: 165,
    upBodyEnd: 210,
    downBodyAmp: 0.14,
    upBodyAmp: 0.065,
    bodyType: "triangle",
    overtoneRatio: 2.75,
    overtoneAmp: 0.07,
    decay: 0.055
  },
  typewriter: {
    label: "Typewriter",
    desc: "Classic vintage mechanical typebar strike on paper platen",
    useVelvet: false,
    filterType: "bandpass",
    downFilterFreq: 1950,
    upFilterFreq: 2400,
    filterQ: 1.5,
    downNoiseAmp: 0.28,
    upNoiseAmp: 0.13,
    downBodyFreq: 265,
    upBodyFreq: 330,
    downBodyEnd: 118,
    upBodyEnd: 158,
    downBodyAmp: 0.17,
    upBodyAmp: 0.075,
    bodyType: "triangle",
    overtoneRatio: 3.1,
    overtoneAmp: 0.065,
    decay: 0.062
  }
};

function ensureAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const sr = audioCtx.sampleRate;
    const len = Math.floor(sr * 0.065);

    // 1. Crisp shaped transient buffer with 1.5ms raised-cosine attack (prevents digital clicks)
    noiseBuffer = audioCtx.createBuffer(1, len, sr);
    const crispData = noiseBuffer.getChannelData(0);
    const attackSamples = Math.max(12, Math.floor(sr * 0.0015));
    for (let i = 0; i < len; i++) {
      const attackEnv = i < attackSamples ? 0.5 * (1 - Math.cos((Math.PI * i) / attackSamples)) : 1.0;
      const decayEnv = Math.pow(1 - i / len, 2.2);
      crispData[i] = (Math.random() * 2 - 1) * attackEnv * decayEnv;
    }

    // 2. Warm pink/velvet filtered noise buffer for soft, creamy & thocky switches
    velvetNoiseBuffer = audioCtx.createBuffer(1, len, sr);
    const velvetData = velvetNoiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.997 * b0 + white * 0.029;
      b1 = 0.985 * b1 + white * 0.032;
      b2 = 0.950 * b2 + white * 0.048;
      const pink = (b0 + b1 + b2 + white * 0.18) * 1.65;
      const attackEnv = i < attackSamples ? 0.5 * (1 - Math.cos((Math.PI * i) / attackSamples)) : 1.0;
      const decayEnv = Math.pow(1 - i / len, 2.5);
      velvetData[i] = Math.max(-1, Math.min(1, pink)) * attackEnv * decayEnv;
    }
  }
  if (audioCtx.state === "suspended") audioCtx.resume();
}

function startAmbience() {
  try {
    ensureAudio();
    const t = audioCtx.currentTime;
    const master = audioCtx.createGain();
    const targetGain = 0.08 * (ambienceVolumePct / 100);
    master.gain.setValueAtTime(0, t);
    master.gain.linearRampToValueAtTime(targetGain, t + 1.0);
    master.connect(audioCtx.destination);

    const drone1 = audioCtx.createOscillator();
    drone1.type = "sine";
    drone1.frequency.setValueAtTime(98, t);
    const drone2 = audioCtx.createOscillator();
    drone2.type = "sine";
    drone2.frequency.setValueAtTime(147.5, t);
    const lfo = audioCtx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.setValueAtTime(0.08, t);
    const lfoGain = audioCtx.createGain();
    lfoGain.gain.setValueAtTime(0.015 * (ambienceVolumePct / 100), t);
    lfo.connect(lfoGain).connect(master.gain);

    drone1.connect(master);
    drone2.connect(master);
    drone1.start(t);
    drone2.start(t);
    lfo.start(t);
    ambienceNodes = { master, drone1, drone2, lfo };
  } catch (e) {}
}

function stopAmbience() {
  if (!ambienceNodes) return;
  try {
    const t = audioCtx.currentTime;
    ambienceNodes.master.gain.linearRampToValueAtTime(0, t + 0.5);
    const oldNodes = ambienceNodes;
    ambienceNodes = null;
    setTimeout(() => {
      try {
        oldNodes.drone1.stop();
        oldNodes.drone2.stop();
        oldNodes.lfo.stop();
      } catch (e) {}
    }, 550);
  } catch (e) {
    ambienceNodes = null;
  }
}

function syncAmbienceUI() {
  if (ambienceToggle) {
    ambienceToggle.classList.toggle("on", ambienceOn);
    ambienceToggle.setAttribute("aria-pressed", String(ambienceOn));
    ambienceToggle.innerHTML = pkIcon("castle", 15) + " " + (ambienceOn ? "Ambience on" : "Temple ambience");
  }
  const settingsAmbienceToggle = document.getElementById("settingsAmbienceToggle");
  if (settingsAmbienceToggle) {
    settingsAmbienceToggle.classList.toggle("on", ambienceOn);
    settingsAmbienceToggle.setAttribute("aria-checked", String(ambienceOn));
  }
}

if (ambienceToggle) {
  ambienceToggle.addEventListener("click", () => {
    ambienceOn = !ambienceOn;
    if (ambienceOn) startAmbience();
    else stopAmbience();
    syncAmbienceUI();
  });
}

function playChime() {
  if (!soundOn || !chimeOn) return;
  try {
    ensureAudio();
    const t = audioCtx.currentTime;
    const volScale = Math.max(0.1, soundVolumePct / 100);
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t + i * 0.065);
      gain.gain.setValueAtTime(0.0001, t + i * 0.065);
      gain.gain.exponentialRampToValueAtTime(0.11 * volScale, t + i * 0.065 + 0.018);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.065 + 0.48);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(t + i * 0.065);
      osc.stop(t + i * 0.065 + 0.52);
    });
  } catch (e) {}
}

function playClick(kind, keyId, forceAudition) {
  if (!soundOn && !forceAudition) return;
  try {
    ensureAudio();
    const t = audioCtx.currentTime;
    const vol = Math.max(0.08, soundVolumePct / 100);
    const isDown = kind !== "up";
    const p = SWITCH_PROFILE_META[switchProfile] || SWITCH_PROFILE_META["soft-cream"];

    // Key-specific acoustic weight (Spacebar = deeper stabilized thock, Enter/Backspace/Shift = medium-deep)
    let pitchScale = 1.0;
    let bodyBoost = 1.0;
    if (keyId === "space") {
      pitchScale = 0.78;
      bodyBoost = 1.22;
    } else if (keyId === "enter" || keyId === "backspace" || keyId === "shiftL" || keyId === "shiftR") {
      pitchScale = 0.87;
      bodyBoost = 1.12;
    } else if (keyId) {
      let hash = 0;
      for (let i = 0; i < keyId.length; i++) hash = (hash * 31 + keyId.charCodeAt(i)) & 0xff;
      pitchScale = 0.97 + (hash / 255) * 0.06;
    }
    const jitter = 0.985 + Math.random() * 0.03;
    const finalScale = pitchScale * jitter;

    // 1. Felt / Stem Cushion Filtered Noise Layer
    const noise = audioCtx.createBufferSource();
    noise.buffer = p.useVelvet ? velvetNoiseBuffer : noiseBuffer;
    const noiseFilter = audioCtx.createBiquadFilter();
    noiseFilter.type = p.filterType;
    noiseFilter.frequency.setValueAtTime((isDown ? p.downFilterFreq : p.upFilterFreq) * finalScale, t);
    noiseFilter.Q.setValueAtTime(p.filterQ || 1.0, t);

    const WarmShelf = audioCtx.createBiquadFilter();
    WarmShelf.type = "lowpass";
    WarmShelf.frequency.setValueAtTime(p.useVelvet ? 2600 : 4200, t);

    const noiseGain = audioCtx.createGain();
    const peakNoise = (isDown ? p.downNoiseAmp : p.upNoiseAmp) * vol;
    noiseGain.gain.setValueAtTime(0.0001, t);
    noiseGain.gain.linearRampToValueAtTime(peakNoise, t + 0.0018);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.036);
    noise.connect(noiseFilter).connect(WarmShelf).connect(noiseGain).connect(audioCtx.destination);
    noise.start(t);
    noise.stop(t + 0.042);

    // 2. Primary Keycap & Gasket Plate Body Resonance
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = p.bodyType;
    const startFreq = (isDown ? p.downBodyFreq : p.upBodyFreq) * finalScale;
    const endFreq = (isDown ? p.downBodyEnd : p.upBodyEnd) * finalScale;
    const bodyDecay = isDown ? p.decay : p.decay * 0.72;
    const peakBody = (isDown ? p.downBodyAmp : p.upBodyAmp) * bodyBoost * vol;

    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(Math.max(35, endFreq), t + bodyDecay);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(peakBody, t + 0.0022);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + bodyDecay + 0.016);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + bodyDecay + 0.02);

    // 3. Harmonic Wooden/PBT Overtone Layer (adds plush creamy/marble character)
    if (p.overtoneAmp) {
      const overOsc = audioCtx.createOscillator();
      const overGain = audioCtx.createGain();
      overOsc.type = "sine";
      const overStart = startFreq * (p.overtoneRatio || 2.0);
      overOsc.frequency.setValueAtTime(overStart, t);
      overOsc.frequency.exponentialRampToValueAtTime(Math.max(60, overStart * 0.55), t + bodyDecay * 0.65);
      const peakOver = (isDown ? p.overtoneAmp : p.overtoneAmp * 0.45) * vol;
      overGain.gain.setValueAtTime(0.0001, t);
      overGain.gain.linearRampToValueAtTime(peakOver, t + 0.0016);
      overGain.gain.exponentialRampToValueAtTime(0.0001, t + bodyDecay * 0.68);
      overOsc.connect(overGain).connect(audioCtx.destination);
      overOsc.start(t);
      overOsc.stop(t + bodyDecay * 0.72);
    }
  } catch (e) {}
}

function auditionSwitchSound() {
  playClick("down", "k", true);
  setTimeout(() => playClick("up", "k", true), 68);
  setTimeout(() => playClick("down", "space", true), 165);
  setTimeout(() => playClick("up", "space", true), 240);
}

function syncSoundToggleUI() {
  const isKm = document.documentElement.classList.contains("site-km-mode");
  if (soundToggle) {
    soundToggle.classList.toggle("on", soundOn);
    soundToggle.setAttribute("aria-pressed", String(soundOn));
    const label = isKm ? (soundToggle.getAttribute("data-km") || "សំឡេងគ្រាប់ចុច") : (soundToggle.getAttribute("data-en") || "Key sound");
    soundToggle.innerHTML = (soundOn ? pkIcon("volume", 15) : pkIcon("volume-mute", 15)) + " " + label;
  }
  const settingsSoundToggle = document.getElementById("settingsSoundToggle");
  if (settingsSoundToggle) {
    settingsSoundToggle.classList.toggle("on", soundOn);
    settingsSoundToggle.setAttribute("aria-checked", String(soundOn));
  }
}

function setSoundEnabled(on, shouldAudition) {
  soundOn = !!on;
  safeSet(LS.sound, soundOn ? "1" : "0");
  syncSoundToggleUI();
  if (soundOn && shouldAudition) {
    playClick("down", "k", true);
    setTimeout(() => playClick("up", "k", true), 70);
  }
}

window.playClick = playClick;
window.setSoundEnabled = setSoundEnabled;
window.auditionSwitchSound = auditionSwitchSound;

if (soundToggle) {
  syncSoundToggleUI();
  soundToggle.addEventListener("click", () => {
    setSoundEnabled(!soundOn, true);
  });
}

/* ---------- Settings & Studio Command Center Initialization ---------- */
function initSettingsToggles() {
  ensureSettingsStylesheet();
  ensureUpgradedSettingsModalDOM();
  healBothHandsOverlay();
  setTimeout(healBothHandsOverlay, 350);

  function bindSwitch(el, onToggle) {
    if (!el) return;
    el.addEventListener("click", () => onToggle(!el.classList.contains("on")));
    el.addEventListener("keydown", (e) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        onToggle(!el.classList.contains("on"));
      }
    });
  }

  function setSwitchUI(el, on) {
    if (!el) return;
    el.classList.toggle("on", !!on);
    el.setAttribute("aria-checked", String(!!on));
  }

  /* ---------- 1. Category Tabs & Real-Time Search Filter ---------- */
  const catTabs = document.querySelectorAll("#settingsCategoryTabs .settings-cat-tab");
  const sections = document.querySelectorAll("#settingsBodyScroll .settings-section");
  const searchInput = document.getElementById("settingsSearchInput");
  const searchClear = document.getElementById("settingsSearchClear");
  const emptySearch = document.getElementById("settingsEmptySearch");
  const searchTermEl = document.getElementById("settingsSearchTerm");
  const activeCatCountEl = document.getElementById("settingsActiveCatCount");
  let activeCategory = "all";

  function filterSettingsView() {
    const query = (searchInput ? searchInput.value : "").trim().toLowerCase();
    if (searchClear) searchClear.hidden = !query;

    let totalVisibleRows = 0;

    sections.forEach((sec) => {
      const cat = sec.getAttribute("data-cat-section");
      const catMatches = query ? true : (activeCategory === "all" || activeCategory === cat);
      if (!catMatches) {
        sec.hidden = true;
        return;
      }

      const rows = sec.querySelectorAll(".settings-row");
      let visibleInSec = 0;
      rows.forEach((row) => {
        if (row.id === "wallpaperDimControl" && !document.body.classList.contains("has-custom-wallpaper")) {
          row.hidden = true;
          return;
        }
        if (!query) {
          row.hidden = false;
          visibleInSec++;
        } else {
          const hay = ((row.getAttribute("data-search") || "") + " " + row.textContent).toLowerCase();
          const match = hay.includes(query);
          row.hidden = !match;
          if (match) visibleInSec++;
        }
      });

      sec.hidden = visibleInSec === 0;
      totalVisibleRows += visibleInSec;
    });

    if (emptySearch) {
      emptySearch.hidden = !(query && totalVisibleRows === 0);
      if (searchTermEl) searchTermEl.textContent = query;
    }
    if (activeCatCountEl) {
      activeCatCountEl.textContent = totalVisibleRows + (totalVisibleRows === 1 ? " Control" : " Controls");
    }
  }

  catTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      activeCategory = tab.getAttribute("data-cat") || "all";
      catTabs.forEach((t) => {
        const isAct = t === tab;
        t.classList.toggle("active", isAct);
        t.setAttribute("aria-selected", String(isAct));
      });
      if (searchInput && searchInput.value) {
        searchInput.value = "";
      }
      filterSettingsView();
    });
  });

  if (searchInput) {
    searchInput.addEventListener("input", filterSettingsView);
  }
  if (searchClear && searchInput) {
    searchClear.addEventListener("click", () => {
      searchInput.value = "";
      filterSettingsView();
      searchInput.focus();
    });
  }

  /* ---------- 2. General: Keyboard Layout & Interface Language ---------- */
  const layoutChoiceBtns = document.querySelectorAll("#settingsLayoutChoice button");
  const LAYOUT_PREVIEWS = {
    standard: { badge: "Khmer Standard", sample: "Home Row: ា ស ដ ថ · ញ ក ល ៈ (Space = ្ Coeng)" },
    nida:     { badge: "Khmer NiDA",     sample: "Home Row: ា ស ដ ថ · ្ ក ល ើ (J = ្ Coeng)" },
    english:  { badge: "English (US)",   sample: "Home Row: A S D F · J K L ; (Standard QWERTY)" }
  };
  function syncLayoutChoiceUI() {
    const cur = (typeof currentLayoutId !== "undefined" && currentLayoutId)
      ? currentLayoutId
      : safeGet("khmerActiveLayout", safeGet("khmerLayout", "standard"));
    layoutChoiceBtns.forEach((b) => {
      const isAct = b.dataset.layoutSet === cur;
      b.classList.toggle("active", isAct);
      b.setAttribute("aria-pressed", String(isAct));
    });
    const lp = LAYOUT_PREVIEWS[cur] || LAYOUT_PREVIEWS.standard;
    const badgeEl = document.getElementById("settingsActiveLayoutBadge");
    const prevEl = document.getElementById("settingsActiveLayoutPreview");
    if (badgeEl) badgeEl.textContent = lp.badge;
    if (prevEl) prevEl.textContent = lp.sample;
  }
  layoutChoiceBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetLayout = btn.dataset.layoutSet;
      if (!targetLayout) return;
      if (typeof switchLayout === "function") {
        switchLayout(targetLayout, true);
      } else {
        const topBtn = document.querySelector(`#layoutStrip .layout-pill[data-layout="${targetLayout}"]`);
        if (topBtn) topBtn.click();
      }
      if (typeof syncLayoutUI === "function") {
        syncLayoutUI(targetLayout);
      }
      syncLayoutChoiceUI();
      if (typeof playClick === "function" && soundOn) playClick("down");
      if (typeof showToast === "function") {
        const lp = LAYOUT_PREVIEWS[targetLayout] || LAYOUT_PREVIEWS.standard;
        showToast(pkIcon("keyboard", 18), lp.badge + " Active", lp.sample);
      }
      setTimeout(healBothHandsOverlay, 60);
    });
  });
  const mainLayoutStrip = document.getElementById("layoutStrip");
  if (mainLayoutStrip) {
    mainLayoutStrip.addEventListener("click", () => {
      setTimeout(syncLayoutChoiceUI, 20);
    });
  }
  syncLayoutChoiceUI();

  const langChoiceBtns = document.querySelectorAll("#settingsLangChoice button");
  function syncLangChoiceUI() {
    const isKm = document.documentElement.classList.contains("site-km-mode");
    const cur = isKm ? "km" : "en";
    langChoiceBtns.forEach((b) => b.classList.toggle("active", b.dataset.langSet === cur));
  }
  langChoiceBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetLang = btn.dataset.langSet;
      try { localStorage.setItem("kk_site_lang", targetLang); } catch (e) {}
      if (typeof window.applySiteLanguage === "function") {
        window.applySiteLanguage(targetLang);
      }
      syncLangChoiceUI();
    });
  });
  syncLangChoiceUI();

  // Studio & Reference Quick Action buttons
  const openShortcutsBtn = document.getElementById("settingsOpenShortcutsBtn");
  const openStatsBtn = document.getElementById("settingsOpenStatsBtn");
  if (openShortcutsBtn) {
    openShortcutsBtn.addEventListener("click", () => {
      const settingsModal = document.getElementById("settingsModal");
      if (settingsModal) settingsModal.hidden = true;
      const scBtn = document.getElementById("shortcutsOpenBtn");
      const scModal = document.getElementById("shortcutsModal");
      if (scBtn) scBtn.click();
      else if (scModal) scModal.hidden = false;
    });
  }
  if (openStatsBtn) {
    openStatsBtn.addEventListener("click", () => {
      const settingsModal = document.getElementById("settingsModal");
      if (settingsModal) settingsModal.hidden = true;
      const stBtn = document.getElementById("statsOpenBtn");
      if (stBtn) stBtn.click();
    });
  }

  /* ---------- 3. Appearance: Theme, Accent, Font, Text Scale & Wallpaper ---------- */
  const themeButtons = document.querySelectorAll("#themeChoice button");
  function applyTheme(mode) {
    const sysDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const effective = mode === "system" ? (sysDark ? "dark" : "light") : mode;
    document.documentElement.classList.toggle("theme-light", effective === "light");
    document.documentElement.classList.toggle("theme-temple", effective === "temple");
    document.documentElement.classList.toggle("theme-moonlight", effective === "moonlight");
    document.documentElement.classList.toggle("theme-jungle", effective === "jungle");
    document.documentElement.classList.toggle("theme-sunset", effective === "sunset");
    document.documentElement.classList.toggle("theme-sepia", effective === "sepia");
    themeButtons.forEach((b) => b.classList.toggle("active", b.dataset.theme === mode));
    safeSet(LS.theme, mode);
  }
  themeButtons.forEach((b) => b.addEventListener("click", () => applyTheme(b.dataset.theme)));
  applyTheme(safeGet(LS.theme, "dark"));

  const ACCENTS = {
    gold:     { gold: "#ff9d2e", bright: "#ffd166" },
    jade:     { gold: "#3f9d6b", bright: "#5fd694" },
    sapphire: { gold: "#2f6fa8", bright: "#2dd4a7" },
    ruby:     { gold: "#a8404a", bright: "#ff5a70" },
    cyan:     { gold: "#0284c7", bright: "#38bdf8" },
    amethyst: { gold: "#9333ea", bright: "#c084fc" }
  };
  const accentButtons = document.querySelectorAll("#accentChoice button");
  function applyAccent(name) {
    const a = ACCENTS[name] || ACCENTS.gold;
    document.documentElement.style.setProperty("--gold", a.gold);
    document.documentElement.style.setProperty("--gold-bright", a.bright);
    accentButtons.forEach((b) => b.classList.toggle("active", b.dataset.accent === name));
    safeSet(LS.accent, name);
  }
  accentButtons.forEach((b) => b.addEventListener("click", () => applyAccent(b.dataset.accent)));
  applyAccent(safeGet(LS.accent, "gold"));

  // Khmer Script Font Family
  const KHMER_FONTS = {
    "kantumruy":  { label: "Kantumruy Pro",    css: "'Kantumruy Pro', 'Noto Sans Khmer', sans-serif" },
    "noto-sans":  { label: "Noto Sans Khmer",  css: "'Noto Sans Khmer', sans-serif" },
    "noto-serif": { label: "Noto Serif Khmer", css: "'Noto Serif Khmer', Georgia, serif" },
    "battambang": { label: "Battambang",       css: "'Battambang', 'Khmer OS Battambang', serif" },
    "moul":       { label: "Moul (Display)",   css: "'Moul', 'Noto Serif Khmer', serif" }
  };
  const khmerFontBtns = document.querySelectorAll("#khmerFontChoice button");
  function applyKhmerFont(fontKey, notify) {
    fontKey = KHMER_FONTS[fontKey] ? fontKey : "kantumruy";
    const fDef = KHMER_FONTS[fontKey];
    document.documentElement.setAttribute("data-khmer-font", fontKey);
    document.documentElement.style.setProperty("--khmer-font-family", fDef.css);
    khmerFontBtns.forEach((b) => {
      const isAct = b.dataset.kfont === fontKey;
      b.classList.toggle("active", isAct);
      b.setAttribute("aria-pressed", String(isAct));
    });
    const tagEl = document.getElementById("khmerFontActiveTag");
    if (tagEl) tagEl.textContent = fDef.label;
    safeSet(LS.khmerFont, fontKey);
    if (notify) {
      if (typeof playClick === "function" && soundOn) playClick("down");
      if (typeof showToast === "function") {
        showToast(pkIcon("sparkles", 18), "Khmer Font: " + fDef.label, "Applied to keycaps, lesson prompts & HUD.");
      }
    }
  }
  khmerFontBtns.forEach((b) => b.addEventListener("click", () => applyKhmerFont(b.dataset.kfont, true)));
  applyKhmerFont(safeGet(LS.khmerFont, "kantumruy"), false);

  // Custom Wallpaper + Dimming + Glass Blur
  const customWallpaperLayer = document.getElementById("customWallpaperLayer");
  const uploadWallpaperBtn = document.getElementById("uploadWallpaperBtn");
  const urlWallpaperBtn = document.getElementById("urlWallpaperBtn");
  const wallpaperFileInput = document.getElementById("wallpaperFileInput");
  const removeWallpaperBtn = document.getElementById("removeWallpaperBtn");
  const wallpaperDimControl = document.getElementById("wallpaperDimControl");
  const wallpaperDimSlider = document.getElementById("wallpaperDimSlider");
  const wallpaperDimValue = document.getElementById("wallpaperDimValue");
  const wallpaperBlurSlider = document.getElementById("wallpaperBlurSlider");
  const wallpaperBlurValue = document.getElementById("wallpaperBlurValue");

  const WALLPAPER_KEY = "khmerCustomWallpaper";
  const WALLPAPER_DIM_KEY = "khmerCustomWallpaperDim";

  function applyWallpaperBlur(px) {
    px = Math.max(0, Math.min(24, parseInt(px, 10) || 0));
    document.documentElement.style.setProperty("--wallpaper-blur", px + "px");
    if (customWallpaperLayer) {
      customWallpaperLayer.style.filter = px > 0 ? `blur(${px}px)` : "";
    }
    if (wallpaperBlurSlider) wallpaperBlurSlider.value = px;
    if (wallpaperBlurValue) wallpaperBlurValue.textContent = px + "px";
    safeSet(LS.wallpaperBlur, String(px));
  }
  if (wallpaperBlurSlider) {
    wallpaperBlurSlider.addEventListener("input", () => applyWallpaperBlur(wallpaperBlurSlider.value));
  }
  applyWallpaperBlur(safeGet(LS.wallpaperBlur, "0"));

  function applyWallpaper(url, dimPct) {
    if (!url || !customWallpaperLayer) return;
    dimPct = dimPct !== undefined ? dimPct : (parseInt(safeGet(WALLPAPER_DIM_KEY, "65"), 10) || 65);
    customWallpaperLayer.style.backgroundImage = 'url("' + url + '")';
    document.documentElement.style.setProperty("--wallpaper-dim", (dimPct / 100).toString());
    document.body.classList.add("has-custom-wallpaper");
    if (removeWallpaperBtn) removeWallpaperBtn.style.display = "inline-flex";
    if (wallpaperDimControl) {
      wallpaperDimControl.style.display = "flex";
      wallpaperDimControl.hidden = false;
    }
    if (wallpaperDimSlider) wallpaperDimSlider.value = dimPct;
    if (wallpaperDimValue) wallpaperDimValue.textContent = dimPct + "%";
  }

  function removeWallpaper() {
    try { localStorage.removeItem(WALLPAPER_KEY); } catch (e) {}
    try { localStorage.removeItem(WALLPAPER_DIM_KEY); } catch (e) {}
    document.body.classList.remove("has-custom-wallpaper");
    if (customWallpaperLayer) customWallpaperLayer.style.backgroundImage = "";
    if (removeWallpaperBtn) removeWallpaperBtn.style.display = "none";
    if (wallpaperDimControl) wallpaperDimControl.style.display = "none";
    if (wallpaperFileInput) wallpaperFileInput.value = "";
    if (typeof showToast === "function") showToast(pkIcon("reset", 18), "Wallpaper removed", "Restored default background.");
  }

  if (uploadWallpaperBtn && wallpaperFileInput) {
    uploadWallpaperBtn.addEventListener("click", () => wallpaperFileInput.click());
    wallpaperFileInput.addEventListener("change", () => {
      const file = wallpaperFileInput.files && wallpaperFileInput.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 1920;
          let w = img.width, h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) { h = Math.round((h * maxDim) / w); w = maxDim; }
            else { w = Math.round((w * maxDim) / h); h = maxDim; }
          }
          const canvas = document.createElement("canvas");
          canvas.width = w; canvas.height = h;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, w, h);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
          safeSet(WALLPAPER_KEY, dataUrl);
          applyWallpaper(dataUrl);
          if (typeof showToast === "function") showToast(pkIcon("check", 18), "Wallpaper applied", "Custom background updated.");
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  if (urlWallpaperBtn) {
    urlWallpaperBtn.addEventListener("click", () => {
      const current = safeGet(WALLPAPER_KEY, "");
      const url = prompt("Enter image URL (PNG, JPG, WebP):", current.startsWith("http") ? current : "");
      if (url && url.trim()) {
        const cleanUrl = url.trim();
        safeSet(WALLPAPER_KEY, cleanUrl);
        applyWallpaper(cleanUrl);
        if (typeof showToast === "function") showToast(pkIcon("check", 18), "Wallpaper applied", "Custom background updated.");
      }
    });
  }
  if (removeWallpaperBtn) removeWallpaperBtn.addEventListener("click", removeWallpaper);
  if (wallpaperDimSlider) {
    wallpaperDimSlider.addEventListener("input", () => {
      const val = parseInt(wallpaperDimSlider.value, 10) || 65;
      document.documentElement.style.setProperty("--wallpaper-dim", (val / 100).toString());
      if (wallpaperDimValue) wallpaperDimValue.textContent = val + "%";
      safeSet(WALLPAPER_DIM_KEY, String(val));
    });
  }
  const savedWallpaper = safeGet(WALLPAPER_KEY, null);
  if (savedWallpaper) {
    applyWallpaper(savedWallpaper, parseInt(safeGet(WALLPAPER_DIM_KEY, "65"), 10));
  }

  /* ---------- 4. 3D Hands, Keyboard & Smart Mouse Cursor ---------- */
  const handsOpacitySlider = document.getElementById("handsOpacitySlider");
  const handsOpacityValue = document.getElementById("handsOpacityValue");
  function applyHandsOpacity(pct) {
    pct = Math.max(15, Math.min(100, parseInt(pct, 10) || 85));
    document.documentElement.style.setProperty("--hands-opacity", (pct / 100).toFixed(2));
    const overlayEl = document.getElementById("handsOverlay");
    if (overlayEl) overlayEl.style.opacity = (pct / 100).toFixed(2);
    if (handsOpacitySlider) handsOpacitySlider.value = pct;
    if (handsOpacityValue) handsOpacityValue.textContent = pct + "%";
    safeSet(LS.handsOpacity, String(pct));
  }
  if (handsOpacitySlider) {
    handsOpacitySlider.addEventListener("input", () => applyHandsOpacity(handsOpacitySlider.value));
  }
  applyHandsOpacity(safeGet(LS.handsOpacity, "85"));

  // Smart Mouse Cursor Inspector toggle
  const settingsMouseInspectorToggle = document.getElementById("settingsMouseInspectorToggle");
  function applyMouseInspector(on) {
    if (window.PKCursorInspector && typeof window.PKCursorInspector.setEnabled === "function") {
      window.PKCursorInspector.setEnabled(on);
    } else {
      safeSet("khmerCursorInspector", on ? "1" : "0");
    }
    setSwitchUI(settingsMouseInspectorToggle, on);
  }
  bindSwitch(settingsMouseInspectorToggle, applyMouseInspector);
  setSwitchUI(settingsMouseInspectorToggle, safeGet("khmerCursorInspector", "1") !== "0");

  // Precision Cursor Reticle
  const settingsReticleToggle = document.getElementById("settingsReticleToggle");
  function applyReticle(on) {
    document.documentElement.classList.toggle("hide-cursor-reticle", !on);
    setSwitchUI(settingsReticleToggle, on);
    safeSet(LS.reticle, on ? "1" : "0");
  }
  bindSwitch(settingsReticleToggle, applyReticle);
  applyReticle(safeGet(LS.reticle, "1") === "1");

  // Mouse Click Shockwaves
  const settingsShockwaveToggle = document.getElementById("settingsShockwaveToggle");
  function applyShockwave(on) {
    document.documentElement.classList.toggle("hide-cursor-shockwave", !on);
    setSwitchUI(settingsShockwaveToggle, on);
    safeSet(LS.shockwave, on ? "1" : "0");
  }
  bindSwitch(settingsShockwaveToggle, applyShockwave);
  applyShockwave(safeGet(LS.shockwave, "1") === "1");

  // Hover Layer Auto-Preview
  const settingsLayerHoverToggle = document.getElementById("settingsLayerHoverToggle");
  function applyLayerHover(on) {
    window.PKDisableLayerHover = !on;
    setSwitchUI(settingsLayerHoverToggle, on);
    safeSet(LS.layerHover, on ? "1" : "0");
  }
  bindSwitch(settingsLayerHoverToggle, applyLayerHover);
  applyLayerHover(safeGet(LS.layerHover, "1") === "1");

  // Shift-key corner preview
  const shiftPreviewToggle = document.getElementById("shiftPreviewToggle");
  function applyShiftPreview(on) {
    document.documentElement.classList.toggle("hide-shift-badges", !on);
    setSwitchUI(shiftPreviewToggle, on);
    safeSet(LS.shiftPreview, on ? "1" : "0");
  }
  bindSwitch(shiftPreviewToggle, applyShiftPreview);
  applyShiftPreview(safeGet(LS.shiftPreview, "1") === "1");

  // Highlight Next Target Key
  const keyHighlightToggle = document.getElementById("keyHighlightToggle");
  function applyKeyHighlight(on) {
    document.documentElement.classList.toggle("hide-key-highlight", !on);
    setSwitchUI(keyHighlightToggle, on);
    safeSet(LS.keyHighlight, on ? "1" : "0");
  }
  bindSwitch(keyHighlightToggle, applyKeyHighlight);
  applyKeyHighlight(safeGet(LS.keyHighlight, "1") === "1");

  // Compact Keyboard Proportions
  const compactKeysToggle = document.getElementById("compactKeysToggle");
  function applyCompactKeys(on) {
    document.documentElement.classList.toggle("compact-keys", on);
    setSwitchUI(compactKeysToggle, on);
    safeSet(LS.compactKeys, on ? "1" : "0");
    setTimeout(healBothHandsOverlay, 50);
  }
  bindSwitch(compactKeysToggle, applyCompactKeys);
  applyCompactKeys(safeGet(LS.compactKeys, "0") === "1");

  // Key Press Spark Effects
  const keyFxToggle = document.getElementById("keyFxToggle");
  function applyKeyFx(on) {
    document.documentElement.classList.toggle("hide-key-fx", !on);
    setSwitchUI(keyFxToggle, on);
    safeSet(LS.keyFx, on ? "1" : "0");
  }
  bindSwitch(keyFxToggle, applyKeyFx);
  applyKeyFx(safeGet(LS.keyFx, "1") === "1");

  /* ---------- 5. Sound & Mechanical Audio Engine Controls ---------- */
  const switchBtns = document.querySelectorAll("#switchProfileChoice button");
  function applySwitchProfile(profile, audition) {
    switchProfile = (profile && SWITCH_PROFILE_META[profile]) ? profile : "soft-cream";
    switchBtns.forEach((b) => b.classList.toggle("active", b.dataset.switch === switchProfile));
    const meta = SWITCH_PROFILE_META[switchProfile] || SWITCH_PROFILE_META["soft-cream"];
    const badgeEl = document.getElementById("switchProfileActiveBadge");
    const descEl = document.getElementById("switchProfileActiveDesc");
    if (badgeEl) badgeEl.textContent = meta.label;
    if (descEl) descEl.textContent = meta.desc;
    safeSet(LS.switchProfile, switchProfile);
    if (audition) {
      if (!soundOn) setSoundEnabled(true, false);
      auditionSwitchSound();
    }
  }
  switchBtns.forEach((b) => b.addEventListener("click", () => applySwitchProfile(b.dataset.switch, true)));
  applySwitchProfile(safeGet(LS.switchProfile, "soft-cream"), false);

  const settingsTestSoundBtn = document.getElementById("settingsTestSoundBtn");
  if (settingsTestSoundBtn) {
    settingsTestSoundBtn.addEventListener("click", () => {
      if (!soundOn) setSoundEnabled(true, false);
      auditionSwitchSound();
    });
  }

  const soundVolumeSlider = document.getElementById("soundVolumeSlider");
  const soundVolumeValue = document.getElementById("soundVolumeValue");
  function applySoundVolume(pct) {
    soundVolumePct = Math.max(10, Math.min(100, parseInt(pct, 10) || 80));
    if (soundVolumeSlider) soundVolumeSlider.value = soundVolumePct;
    if (soundVolumeValue) soundVolumeValue.textContent = soundVolumePct + "%";
    safeSet(LS.soundVolume, String(soundVolumePct));
  }
  if (soundVolumeSlider) {
    soundVolumeSlider.addEventListener("input", () => applySoundVolume(soundVolumeSlider.value));
    soundVolumeSlider.addEventListener("change", () => {
      playClick("down", "k", true);
      setTimeout(() => playClick("up", "k", true), 68);
    });
  }
  applySoundVolume(safeGet(LS.soundVolume, "80"));

  const settingsChimeToggle = document.getElementById("settingsChimeToggle");
  function applyChime(on) {
    chimeOn = !!on;
    setSwitchUI(settingsChimeToggle, chimeOn);
    safeSet(LS.chime, chimeOn ? "1" : "0");
    if (chimeOn && soundOn) playChime();
  }
  bindSwitch(settingsChimeToggle, (on) => applyChime(on));
  setSwitchUI(settingsChimeToggle, safeGet(LS.chime, "1") !== "0");

  const settingsAmbienceToggle = document.getElementById("settingsAmbienceToggle");
  bindSwitch(settingsAmbienceToggle, (on) => {
    ambienceOn = !!on;
    if (ambienceOn) startAmbience();
    else stopAmbience();
    syncAmbienceUI();
  });
  syncAmbienceUI();

  const ambienceVolumeSlider = document.getElementById("ambienceVolumeSlider");
  const ambienceVolumeValue = document.getElementById("ambienceVolumeValue");
  function applyAmbienceVolume(pct) {
    ambienceVolumePct = Math.max(10, Math.min(100, parseInt(pct, 10) || 50));
    if (ambienceVolumeSlider) ambienceVolumeSlider.value = ambienceVolumePct;
    if (ambienceVolumeValue) ambienceVolumeValue.textContent = ambienceVolumePct + "%";
    safeSet(LS.ambienceVolume, String(ambienceVolumePct));
    if (ambienceNodes && audioCtx) {
      ambienceNodes.master.gain.setTargetAtTime(0.08 * (ambienceVolumePct / 100), audioCtx.currentTime, 0.15);
    }
  }
  if (ambienceVolumeSlider) {
    ambienceVolumeSlider.addEventListener("input", () => applyAmbienceVolume(ambienceVolumeSlider.value));
  }
  applyAmbienceVolume(safeGet(LS.ambienceVolume, "50"));

  /* ---------- 6. Typing, Lessons & Practice Controls ---------- */
  const unlockAllLessonsToggle = document.getElementById("unlockAllLessonsToggle");
  function applyUnlockAllLessons(on) {
    setSwitchUI(unlockAllLessonsToggle, on);
    if (window.PKProgress && typeof window.PKProgress.setUnlockAll === "function") {
      window.PKProgress.setUnlockAll(!!on);
      if (typeof renderLessonAccordion === "function") renderLessonAccordion();
    } else {
      safeSet("pk_unlock_all_lessons", on ? "1" : "0");
    }
  }
  bindSwitch(unlockAllLessonsToggle, (on) => {
    applyUnlockAllLessons(on);
    if (typeof showToast === "function") {
      showToast(pkIcon("trophy", 18), on ? "All 77 Lessons Unlocked" : "Standard Progression Restored", on ? "Sandbox Mode active — jump to any lesson freely." : "Lessons unlock sequentially as you master them.");
    }
  });
  const initialUnlockAll = (window.PKProgress && typeof window.PKProgress.isUnlockAll === "function")
    ? window.PKProgress.isUnlockAll()
    : safeGet("pk_unlock_all_lessons", "0") === "1";
  setSwitchUI(unlockAllLessonsToggle, initialUnlockAll);

  const strictModeToggle = document.getElementById("strictModeToggle");
  function applyStrictMode(on) {
    window.PKStrictMistakeMode = !!on;
    setSwitchUI(strictModeToggle, on);
    safeSet(LS.strictMode, on ? "1" : "0");
  }
  bindSwitch(strictModeToggle, applyStrictMode);
  applyStrictMode(safeGet(LS.strictMode, "1") === "1");

  const autoAdvanceToggle = document.getElementById("autoAdvanceToggle");
  function applyAutoAdvance(on) {
    window.PKAutoAdvanceExercise = !!on;
    setSwitchUI(autoAdvanceToggle, on);
    safeSet(LS.autoAdvance, on ? "1" : "0");
  }
  bindSwitch(autoAdvanceToggle, applyAutoAdvance);
  applyAutoAdvance(safeGet(LS.autoAdvance, "1") === "1");

  const liveStatsHudToggle = document.getElementById("liveStatsHudToggle");
  function applyLiveStatsHud(on) {
    document.documentElement.classList.toggle("hide-live-stats", !on);
    setSwitchUI(liveStatsHudToggle, on);
    safeSet(LS.liveStatsHud, on ? "1" : "0");
  }
  bindSwitch(liveStatsHudToggle, applyLiveStatsHud);
  applyLiveStatsHud(safeGet(LS.liveStatsHud, "1") === "1");

  const targetWpmSlider = document.getElementById("targetWpmSlider");
  const targetWpmValue = document.getElementById("targetWpmValue");
  function applyTargetWpm(wpm) {
    wpm = Math.max(15, Math.min(120, parseInt(wpm, 10) || 40));
    window.PKTargetWpmGoal = wpm;
    if (targetWpmSlider) targetWpmSlider.value = wpm;
    if (targetWpmValue) targetWpmValue.textContent = wpm + " WPM";
    safeSet(LS.targetWpm, String(wpm));
  }
  if (targetWpmSlider) {
    targetWpmSlider.addEventListener("input", () => applyTargetWpm(targetWpmSlider.value));
  }
  applyTargetWpm(safeGet(LS.targetWpm, "40"));

  /* ---------- 7. Immersion, Atmosphere & Accessibility ---------- */
  const sideDocksToggle = document.getElementById("sideDocksToggle");
  function applySideDocks(on) {
    document.documentElement.classList.toggle("hide-side-docks", !on);
    setSwitchUI(sideDocksToggle, on);
    safeSet(LS.sideDocks, on ? "1" : "0");
  }
  bindSwitch(sideDocksToggle, applySideDocks);
  applySideDocks(safeGet(LS.sideDocks, "1") === "1");

  const motesToggle = document.getElementById("motesToggle");
  function applyMotes(on) {
    document.documentElement.classList.toggle("hide-motes", !on);
    setSwitchUI(motesToggle, on);
    safeSet(LS.motes, on ? "1" : "0");
  }
  bindSwitch(motesToggle, applyMotes);
  applyMotes(safeGet(LS.motes, "1") === "1");

  const torchesToggle = document.getElementById("torchesToggle");
  function applyTorches(on) {
    document.documentElement.classList.toggle("hide-torches", !on);
    setSwitchUI(torchesToggle, on);
    safeSet(LS.torches, on ? "1" : "0");
  }
  bindSwitch(torchesToggle, applyTorches);
  applyTorches(safeGet(LS.torches, "1") === "1");

  const scanlinesToggle = document.getElementById("scanlinesToggle");
  function applyScanlines(on) {
    document.documentElement.classList.toggle("scanlines-on", on);
    setSwitchUI(scanlinesToggle, on);
    safeSet(LS.scanlines, on ? "1" : "0");
  }
  bindSwitch(scanlinesToggle, applyScanlines);
  applyScanlines(safeGet(LS.scanlines, "0") === "1");

  const reducedMotionToggle = document.getElementById("reducedMotionToggle");
  function applyReducedMotion(on) {
    document.documentElement.classList.toggle("reduce-motion", on);
    document.documentElement.classList.toggle("motion-override", true);
    setSwitchUI(reducedMotionToggle, on);
    safeSet(LS.reducedMotion, on ? "1" : "0");
  }
  bindSwitch(reducedMotionToggle, applyReducedMotion);
  applyReducedMotion(safeGet(LS.reducedMotion, (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) ? "1" : "0") === "1");

  const highContrastToggle = document.getElementById("highContrastToggle");
  function applyHighContrast(on) {
    document.documentElement.classList.toggle("high-contrast", on);
    setSwitchUI(highContrastToggle, on);
    safeSet(LS.highContrast, on ? "1" : "0");
  }
  bindSwitch(highContrastToggle, applyHighContrast);
  applyHighContrast(safeGet(LS.highContrast, "0") === "1");

  const largeTextToggle = document.getElementById("largeTextToggle");
  function applyLargeText(on) {
    document.documentElement.classList.toggle("large-text", on);
    setSwitchUI(largeTextToggle, on);
    safeSet(LS.largeText, on ? "1" : "0");
  }
  bindSwitch(largeTextToggle, applyLargeText);
  applyLargeText(safeGet(LS.largeText, "0") === "1");

  const dyslexiaSpacingToggle = document.getElementById("dyslexiaSpacingToggle");
  function applyDyslexiaSpacing(on) {
    document.documentElement.classList.toggle("wide-prompt-spacing", on);
    setSwitchUI(dyslexiaSpacingToggle, on);
    safeSet(LS.dyslexiaSpacing, on ? "1" : "0");
  }
  bindSwitch(dyslexiaSpacingToggle, applyDyslexiaSpacing);
  applyDyslexiaSpacing(safeGet(LS.dyslexiaSpacing, "0") === "1");

  /* ---------- 8. Focus Mode ---------- */
  const focusModeToggle = document.getElementById("focusModeToggle");
  const focusModeBtn = document.getElementById("focusModeBtn");

  window.applyFocusMode = applyFocusMode;
  function applyFocusMode(on) {
    document.documentElement.classList.toggle("focus-mode", on);
    setSwitchUI(focusModeToggle, on);
    if (focusModeBtn) {
      focusModeBtn.classList.toggle("active", on);
      focusModeBtn.setAttribute("aria-pressed", String(on));
      const textSpan = focusModeBtn.querySelector(".focus-btn-text");
      const isKm = document.documentElement.classList.contains("site-km-mode");
      if (textSpan) {
        if (on) {
          textSpan.setAttribute("data-en", "Exit Focus");
          textSpan.setAttribute("data-km", "ចាកចេញពីផ្ដោត");
          textSpan.textContent = isKm ? "ចាកចេញពីផ្ដោត" : "Exit Focus";
        } else {
          textSpan.setAttribute("data-en", "Focus");
          textSpan.setAttribute("data-km", "ផ្ដោត");
          textSpan.textContent = isKm ? "ផ្ដោត" : "Focus";
        }
      }
    }
    if (on) {
      const ls = document.getElementById("lessonStrip");
      if (ls) ls.classList.remove("expanded");
    }
    requestAnimationFrame(() => {
      if (typeof window.updateHandsOverlay === "function") {
        window.updateHandsOverlay();
      } else if (typeof window.render === "function") {
        window.render();
      }
      window.dispatchEvent(new Event("resize"));
    });
    safeSet(LS.focusMode, on ? "1" : "0");
  }
  bindSwitch(focusModeToggle, applyFocusMode);

  if (focusModeBtn) {
    focusModeBtn.addEventListener("click", () => {
      const willBeOn = !document.documentElement.classList.contains("focus-mode");
      applyFocusMode(willBeOn);
      if (typeof showToast === "function") {
        if (willBeOn) showToast(pkIcon("zap", 18), "Focus Mode Active", "Distractions hidden. Press Esc or Alt+F anytime to exit.");
        else showToast(pkIcon("eye", 18), "Focus Mode Off", "Interface restored.");
      }
    });
  }

  window.applyFocusMode = applyFocusMode;
  applyFocusMode(safeGet(LS.focusMode, "0") === "1");

  /* ---------- 9. Mirror Sound & Finger-Guide Toggles ---------- */
  const settingsSoundToggle = document.getElementById("settingsSoundToggle");
  const settingsHandsToggle = document.getElementById("settingsHandsToggle");
  function syncSettingsMirrors() {
    syncSoundToggleUI();
    if (settingsHandsToggle && typeof handsToggle !== "undefined" && handsToggle) {
      setSwitchUI(settingsHandsToggle, handsToggle.classList.contains("on"));
    }
    if (settingsMouseInspectorToggle && window.PKCursorInspector && typeof window.PKCursorInspector.isEnabled === "function") {
      setSwitchUI(settingsMouseInspectorToggle, window.PKCursorInspector.isEnabled());
    }
    syncLayoutChoiceUI();
    syncLangChoiceUI();
    syncAmbienceUI();
  }
  window.syncSettingsMirrors = syncSettingsMirrors;
  bindSwitch(settingsSoundToggle, (on) => {
    setSoundEnabled(on, true);
    syncSettingsMirrors();
  });
  if (soundToggle) {
    soundToggle.addEventListener("click", syncSettingsMirrors);
  }
  if (settingsHandsToggle && typeof handsToggle !== "undefined" && handsToggle) {
    settingsHandsToggle.addEventListener("click", () => {
      handsToggle.click();
      syncSettingsMirrors();
    });
    handsToggle.addEventListener("click", syncSettingsMirrors);
  }
  syncSettingsMirrors();

  /* ---------- 10. One-Click Studio Presets ---------- */
  const presetBtns = document.querySelectorAll(".settings-preset-btn");
  function applyStudioPreset(presetName) {
    presetBtns.forEach((b) => b.classList.toggle("active", b.dataset.preset === presetName));
    if (presetName === "default") {
      applyTheme("dark");
      applyAccent("gold");
      applyKhmerFont("kantumruy");
      applyLargeText(false);
      applyCompactKeys(false);
      applyHandsOpacity(85);
      if (typeof handsToggle !== "undefined" && handsToggle && !handsToggle.classList.contains("on")) handsToggle.click();
      setSoundEnabled(true, false);
      applySwitchProfile("soft-cream", false);
      applySoundVolume(80);
      applyMouseInspector(true);
      applyReticle(true);
      applyShockwave(true);
      applyLayerHover(true);
      applyShiftPreview(true);
      applyKeyHighlight(true);
      applyKeyFx(true);
      applySideDocks(true);
      applyMotes(true);
      applyTorches(true);
      applyScanlines(false);
      applyFocusMode(false);
      applyReducedMotion(false);
      applyHighContrast(false);
      applyDyslexiaSpacing(false);
    } else if (presetName === "pro") {
      applyTheme("moonlight");
      applyAccent("cyan");
      applyCompactKeys(false);
      applyHandsOpacity(40);
      setSoundEnabled(true, false);
      applySwitchProfile("raindrop", true);
      applyKeyFx(false);
      applyMotes(false);
      applyTorches(false);
      applyScanlines(false);
      applyReticle(false);
      applyShockwave(false);
      applyTargetWpm(75);
    } else if (presetName === "immersion") {
      applyTheme("temple");
      applyAccent("gold");
      applyCompactKeys(false);
      applyHandsOpacity(90);
      if (typeof handsToggle !== "undefined" && handsToggle && !handsToggle.classList.contains("on")) handsToggle.click();
      setSoundEnabled(true, false);
      applySwitchProfile("soft-cream", true);
      applyKeyFx(true);
      applyMotes(true);
      applyTorches(true);
      applyScanlines(true);
      applyMouseInspector(true);
      applyReticle(true);
      applyShockwave(true);
      if (!ambienceOn) { ambienceOn = true; startAmbience(); syncAmbienceUI(); }
    } else if (presetName === "performance") {
      applyReducedMotion(true);
      applyKeyFx(false);
      applyMotes(false);
      applyTorches(false);
      applyScanlines(false);
      applyReticle(false);
      applyShockwave(false);
      if (ambienceOn) { ambienceOn = false; stopAmbience(); syncAmbienceUI(); }
    }
    syncSettingsMirrors();
    if (typeof showToast === "function") {
      const labels = { default: "Default Studio", pro: "Pro Typist", immersion: "Full Immersion", performance: "Battery Saver" };
      showToast(pkIcon("sliders", 18), (labels[presetName] || "Preset") + " Applied", "All studio preferences updated.");
    }
  }
  presetBtns.forEach((btn) => {
    btn.addEventListener("click", () => applyStudioPreset(btn.dataset.preset));
  });

  // Reset Default Settings button (keeps typing progress safe!)
  const resetPreferencesBtn = document.getElementById("resetPreferencesBtn");
  if (resetPreferencesBtn) {
    resetPreferencesBtn.addEventListener("click", async () => {
      const ok = await templeConfirm(
        "Reset all visual, audio, hand, and cursor settings back to their defaults? Your lesson progress and WPM records will NOT be deleted.",
        { title: "Reset Default Settings?", confirmLabel: "Reset Settings", cancelLabel: "Cancel" }
      );
      if (!ok) return;
      removeWallpaper();
      applyWallpaperBlur(0);
      applyUnlockAllLessons(false);
      applyStrictMode(true);
      applyAutoAdvance(true);
      applyLiveStatsHud(true);
      applyTargetWpm(40);
      applyStudioPreset("default");
    });
  }

  /* ---------- 11. Live Storage & Progress Overview Card ---------- */
  function updateSettingsStorageStats() {
    try {
      const keysEl = document.getElementById("settingsStatKeys");
      const masteredEl = document.getElementById("settingsStatMastered");
      const bestWpmEl = document.getElementById("settingsStatBestWpm");
      const storageEl = document.getElementById("settingsStatStorage");

      const statsRaw = JSON.parse(safeGet(LS.totals, "{}") || "{}");
      if (keysEl) keysEl.textContent = Number(statsRaw.totalKeys || 0).toLocaleString();
      if (bestWpmEl) bestWpmEl.textContent = Math.round(Number(statsRaw.bestWpm || 0)) + " WPM";

      let masteredCount = 0;
      if (window.PKProgress && typeof window.PKProgress.load === "function") {
        const p = window.PKProgress.load();
        const lessonsMap = (p && p.lessons) || {};
        Object.values(lessonsMap).forEach((entry) => {
          if (entry && (entry.completed || entry.stars > 0)) masteredCount++;
        });
      }
      if (masteredEl) masteredEl.textContent = masteredCount + " / 77";

      let bytes = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i) || "";
        const v = localStorage.getItem(k) || "";
        bytes += (k.length + v.length) * 2;
      }
      if (storageEl) storageEl.textContent = Math.max(1, Math.round(bytes / 1024)) + " KB";
    } catch (e) {}
  }

  /* ---------- 12. Settings Modal Open / Close ---------- */
  const settingsModal = document.getElementById("settingsModal");
  const settingsOpenBtn = document.getElementById("settingsOpenBtn");
  const settingsCloseBtn = document.getElementById("settingsCloseBtn");
  const settingsDoneBtn = document.getElementById("settingsDoneBtn");

  function openSettingsModal() {
    syncSettingsMirrors();
    updateSettingsStorageStats();
    filterSettingsView();
    if (settingsModal) {
      settingsModal.hidden = false;
      if (settingsCloseBtn) settingsCloseBtn.focus();
    }
  }
  function closeSettingsModal() {
    if (settingsModal) settingsModal.hidden = true;
  }

  window.openSettingsModal = openSettingsModal;
  window.closeSettingsModal = closeSettingsModal;

  if (settingsOpenBtn) settingsOpenBtn.addEventListener("click", openSettingsModal);
  if (settingsCloseBtn) settingsCloseBtn.addEventListener("click", closeSettingsModal);
  if (settingsDoneBtn) settingsDoneBtn.addEventListener("click", closeSettingsModal);
  if (settingsModal) {
    settingsModal.addEventListener("click", (e) => {
      if (e.target === settingsModal) closeSettingsModal();
    });
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initSettingsToggles);
} else {
  initSettingsToggles();
}

/* ---------- Site Language I18N & Developer Note Modal ---------- */
(function () {
  var LANG_KEY = "kk_site_lang";
  function safeGetLang(k, fb) {
    try {
      var v = localStorage.getItem(k);
      return v === null ? fb : v;
    } catch (e) {
      return fb;
    }
  }
  function safeSetLang(k, v) {
    try {
      localStorage.setItem(k, v);
    } catch (e) {}
  }

  var toggleBtn = document.getElementById("siteLangToggle");
  var toggleLabel = document.getElementById("siteLangToggleLabel");
  var topToggleBtn = document.getElementById("topLangToggleBtn");
  var topToggleLabel = document.getElementById("topLangToggleLabel");

  function applyLang(lang) {
    var isKm = lang === "km";
    var nodes = document.querySelectorAll(".i18n-t");
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var text = el.getAttribute(isKm ? "data-km" : "data-en");
      if (text !== null) {
        el.innerHTML = text;
      }
      if (isKm) {
        el.setAttribute("lang", "km");
      } else {
        el.removeAttribute("lang");
      }
    }
    document.documentElement.setAttribute("lang", isKm ? "km" : "en");
    document.documentElement.classList.toggle("site-km-mode", isKm);
    if (toggleBtn) toggleBtn.setAttribute("aria-pressed", String(isKm));
    if (toggleLabel) toggleLabel.textContent = isKm ? "English" : "ភាសាខ្មែរ";
    if (toggleBtn) toggleBtn.setAttribute("aria-label", isKm ? "Switch site back to English" : "Translate site to Khmer");

    if (topToggleBtn) {
      topToggleBtn.setAttribute("aria-pressed", String(isKm));
      topToggleBtn.setAttribute("aria-label", isKm ? "Switch back to English" : "Translate English to Khmer");
      topToggleBtn.setAttribute("title", isKm ? "Switch back to English (Alt+L)" : "Translate English to Khmer (Alt+L)");
      topToggleBtn.classList.toggle("active", isKm);
    }
    if (topToggleLabel) {
      topToggleLabel.textContent = isKm ? "English" : "Translate to Khmer";
    }
    var langChoiceBtns = document.querySelectorAll("#settingsLangChoice button");
    langChoiceBtns.forEach(function (b) {
      b.classList.toggle("active", b.dataset.langSet === (isKm ? "km" : "en"));
    });
  }

  function toggleSiteLanguage() {
    var next = document.documentElement.classList.contains("site-km-mode") ? "en" : "km";
    safeSetLang(LANG_KEY, next);
    applyLang(next);
  }

  var startLang = safeGetLang(LANG_KEY, "en");
  applyLang(startLang);

  if (toggleBtn) toggleBtn.addEventListener("click", toggleSiteLanguage);
  if (topToggleBtn) topToggleBtn.addEventListener("click", toggleSiteLanguage);
  window.applySiteLanguage = applyLang;
  window.toggleSiteLanguage = toggleSiteLanguage;

  /* ---------- developer note modal ---------- */
  var devNoteModal = document.getElementById("devNoteModal");
  var devNoteBtn = document.getElementById("siteDevNoteBtn");
  var devNoteCloseBtn = document.getElementById("devNoteCloseBtn");
  var devNoteCloseBtn2 = document.getElementById("devNoteCloseBtn2");
  function openDevNote() {
    if (!devNoteModal) return;
    devNoteModal.hidden = false;
    if (devNoteCloseBtn) devNoteCloseBtn.focus();
  }
  function closeDevNote() {
    if (devNoteModal) devNoteModal.hidden = true;
  }
  if (devNoteBtn) devNoteBtn.addEventListener("click", openDevNote);
  if (devNoteCloseBtn) devNoteCloseBtn.addEventListener("click", closeDevNote);
  if (devNoteCloseBtn2) devNoteCloseBtn2.addEventListener("click", closeDevNote);
  if (devNoteModal) {
    devNoteModal.addEventListener("click", function (e) {
      if (e.target === devNoteModal) closeDevNote();
    });
    devNoteModal.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeDevNote();
    });
  }
})();
