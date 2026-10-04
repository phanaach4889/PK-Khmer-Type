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
    link.href = "css/settings.css?v=35";
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
          <div class="settings-row-info"><div class="settings-row-title-line"><span class="settings-row-name">Active Keyboard Layout</span><span class="settings-row-km">ប្លង់ក្តារចុច</span></div><div class="settings-row-desc">Switch the active keyboard mapping and lesson curriculum immediately.</div></div>
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
        <div class="settings-row" data-search="sound effects audio click keystroke mute"><div class="settings-row-info"><div class="settings-row-title-line"><span class="settings-row-name">Mechanical Key Sound</span><span class="settings-row-km">សំឡេងគ្រាប់ចុច</span></div><div class="settings-row-desc">Synthesize real-time mechanical switch acoustics when typing.</div></div><div class="settings-row-control"><div class="toggle-switch on" id="settingsSoundToggle" role="switch" aria-checked="true" tabindex="0"></div></div></div>
        <div class="settings-row settings-row-stacked settings-row-switches" data-search="switch profile sound tactile brown clicky blue red thock typewriter silent"><div class="settings-row-info"><div class="settings-row-title-line"><span class="settings-row-name">Mechanical Switch Profile</span><span class="settings-row-km">ប្រភេទសំឡេងស្វ៊ីច</span></div><div class="settings-row-desc">Select your switch acoustic signature (click any switch to audition its sound).</div></div><div class="settings-row-control"><div class="settings-choice" id="switchProfileChoice"><button type="button" data-switch="brown" class="active">Tactile Brown</button><button type="button" data-switch="blue">Clicky Blue</button><button type="button" data-switch="red">Thocky Red</button><button type="button" data-switch="typewriter">Typewriter</button><button type="button" data-switch="silent">Silent Soft</button></div></div></div>
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
        <div class="settings-row settings-row-stacked settings-row-theme" data-search="theme glass transparent dark temple moonlight jungle sunset sepia light system color"><div class="settings-row-info"><div class="settings-row-title-line"><span class="settings-row-name">Studio Color Theme</span><span class="settings-row-km">ស្បែកកម្មវិធី</span></div><div class="settings-row-desc">Select the overall atmosphere and lighting palette.</div></div><div class="settings-row-control"><div class="settings-choice" id="themeChoice"><button type="button" data-theme="glass"><span class="theme-dot glass"></span>Transparent Glass</button><button type="button" data-theme="dark" class="active"><span class="theme-dot dark"></span>Dark</button><button type="button" data-theme="temple"><span class="theme-dot temple"></span>Temple</button><button type="button" data-theme="moonlight"><span class="theme-dot moonlight"></span>Moonlight</button><button type="button" data-theme="jungle"><span class="theme-dot jungle"></span>Jungle</button><button type="button" data-theme="sunset"><span class="theme-dot sunset"></span>Sunset</button><button type="button" data-theme="sepia"><span class="theme-dot sepia"></span>Sepia</button><button type="button" data-theme="light"><span class="theme-dot light"></span>Light</button><button type="button" data-theme="system"><span class="theme-dot system"></span>System</button></div></div></div>
        <div class="settings-row" data-search="accent color gold jade sapphire ruby cyan amethyst"><div class="settings-row-info"><div class="settings-row-title-line"><span class="settings-row-name">Primary Accent Color</span><span class="settings-row-km">ពណ៌លេចធ្លោ</span></div><div class="settings-row-desc">Choose the highlight glow color for active keys, badges, and buttons.</div></div><div class="settings-row-control"><div class="settings-choice accent-choice" id="accentChoice"><button type="button" data-accent="gold" class="active" style="--sw:#ffd166" aria-label="Gold accent"></button><button type="button" data-accent="jade" style="--sw:#5fd694" aria-label="Jade accent"></button><button type="button" data-accent="sapphire" style="--sw:#2dd4a7" aria-label="Sapphire accent"></button><button type="button" data-accent="ruby" style="--sw:#ff5a70" aria-label="Ruby accent"></button><button type="button" data-accent="cyan" style="--sw:#38bdf8" aria-label="Cyber Cyan accent"></button><button type="button" data-accent="amethyst" style="--sw:#c084fc" aria-label="Amethyst accent"></button></div></div></div>
        <div class="settings-row" data-search="khmer font family kantumruy noto sans serif typography"><div class="settings-row-info"><div class="settings-row-title-line"><span class="settings-row-name">Khmer Script Font Family</span><span class="settings-row-km">ពុម្ពអក្សរខ្មែរ</span></div><div class="settings-row-desc">Choose the Khmer typeface for keycaps, HUD cards, and typing prompts.</div></div><div class="settings-row-control"><div class="settings-choice" id="khmerFontChoice"><button type="button" data-kfont="kantumruy" class="active">Kantumruy Pro</button><button type="button" data-kfont="noto-sans">Noto Sans Khmer</button><button type="button" data-kfont="noto-serif">Noto Serif Khmer</button></div></div></div>
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
let soundOn = safeGet(LS.sound, "1") !== "0";
let chimeOn = safeGet(LS.chime, "1") !== "0";
let switchProfile = safeGet(LS.switchProfile, "brown");
let soundVolumePct = parseInt(safeGet(LS.soundVolume, "80"), 10) || 80;
let ambienceVolumePct = parseInt(safeGet(LS.ambienceVolume, "50"), 10) || 50;
let ambienceOn = false;
let ambienceNodes = null;
const ambienceToggle = document.getElementById("ambienceToggle");

let audioMasterCompressor = null;
let audioMasterGain = null;

function ensureAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (!noiseBuffer && audioCtx) {
    const len = Math.floor(audioCtx.sampleRate * 0.15);
    noiseBuffer = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      const pink = b0 + b1 + b2 + white * 0.5362;
      const decay = Math.pow(1 - (i / len), 1.4);
      data[i] = pink * 0.32 * decay;
    }
  }
  if (!audioMasterGain && audioCtx) {
    try {
      audioMasterGain = audioCtx.createGain();
      audioMasterGain.gain.setValueAtTime(1.45, audioCtx.currentTime);

      audioMasterCompressor = audioCtx.createDynamicsCompressor();
      audioMasterCompressor.threshold.setValueAtTime(-14, audioCtx.currentTime);
      audioMasterCompressor.knee.setValueAtTime(6, audioCtx.currentTime);
      audioMasterCompressor.ratio.setValueAtTime(3.5, audioCtx.currentTime);
      audioMasterCompressor.attack.setValueAtTime(0.001, audioCtx.currentTime);
      audioMasterCompressor.release.setValueAtTime(0.05, audioCtx.currentTime);

      audioMasterGain.connect(audioMasterCompressor);
      audioMasterCompressor.connect(audioCtx.destination);
    } catch (e) {
      audioMasterGain = null;
      audioMasterCompressor = null;
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
    [660, 880, 1320].forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t + i * 0.07);
      gain.gain.setValueAtTime(0.0001, t + i * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.12 * volScale, t + i * 0.07 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.07 + 0.5);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(t + i * 0.07);
      osc.stop(t + i * 0.07 + 0.55);
    });
  } catch (e) {}
}

function playClick(kind) {
  if (!soundOn) return;
  try {
    ensureAudio();
    const t = audioCtx.currentTime;
    const vol = Math.max(0.15, (soundVolumePct / 100)) * 1.6;
    const isDown = kind === "down";

    // Switch acoustic profile parameters — tuned for rich presence, loud tactile feedback, and authentic mechanical feel
    const profiles = {
      brown: {
        filterType: "bandpass",
        filterFreq: isDown ? 2200 : 2800,
        filterQ: 2.2,
        noiseAmp: isDown ? 0.78 : 0.46,
        noiseDecay: 0.048,
        bodyFreq: isDown ? 210 : 270,
        bodyEndFreq: isDown ? 135 : 175,
        bodyAmp: isDown ? 0.60 : 0.34,
        bodyType: "triangle",
        decay: 0.075
      },
      blue: {
        filterType: "bandpass",
        filterFreq: isDown ? 3400 : 4200,
        filterQ: 3.6,
        noiseAmp: isDown ? 0.98 : 0.62,
        noiseDecay: 0.044,
        bodyFreq: isDown ? 520 : 640,
        bodyEndFreq: isDown ? 380 : 460,
        bodyAmp: isDown ? 0.55 : 0.32,
        bodyType: "sawtooth",
        decay: 0.065
      },
      red: {
        filterType: "lowpass",
        filterFreq: isDown ? 1400 : 1800,
        filterQ: 1.8,
        noiseAmp: isDown ? 0.72 : 0.42,
        noiseDecay: 0.062,
        bodyFreq: isDown ? 165 : 205,
        bodyEndFreq: isDown ? 85 : 110,
        bodyAmp: isDown ? 0.82 : 0.48,
        bodyType: "sine",
        decay: 0.105
      },
      typewriter: {
        filterType: "bandpass",
        filterFreq: isDown ? 2600 : 3200,
        filterQ: 2.4,
        noiseAmp: isDown ? 1.08 : 0.68,
        noiseDecay: 0.068,
        bodyFreq: isDown ? 340 : 430,
        bodyEndFreq: isDown ? 200 : 260,
        bodyAmp: isDown ? 0.68 : 0.40,
        bodyType: "sawtooth",
        decay: 0.090
      },
      silent: {
        filterType: "lowpass",
        filterFreq: isDown ? 1150 : 1450,
        filterQ: 1.2,
        noiseAmp: isDown ? 0.52 : 0.30,
        noiseDecay: 0.052,
        bodyFreq: isDown ? 140 : 170,
        bodyEndFreq: isDown ? 90 : 115,
        bodyAmp: isDown ? 0.52 : 0.28,
        bodyType: "sine",
        decay: 0.068
      }
    };
    const p = profiles[switchProfile] || profiles.brown;
    const dest = audioMasterGain || audioCtx.destination;

    // Transient mechanical impact noise
    const noise = audioCtx.createBufferSource();
    noise.buffer = noiseBuffer;
    const noiseFilter = audioCtx.createBiquadFilter();
    noiseFilter.type = p.filterType;
    noiseFilter.frequency.setValueAtTime(p.filterFreq, t);
    if (p.filterQ) noiseFilter.Q.setValueAtTime(p.filterQ, t);
    const noiseGain = audioCtx.createGain();
    const actualNoiseAmp = Math.min(1.6, p.noiseAmp * vol);
    noiseGain.gain.setValueAtTime(actualNoiseAmp, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, t + p.noiseDecay);
    noise.connect(noiseFilter).connect(noiseGain).connect(dest);
    noise.start(t);
    noise.stop(t + p.noiseDecay + 0.015);

    // Resonant mechanical body tone
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = p.bodyType;
    const startFreq = p.bodyFreq + (Math.random() * 14 - 7);
    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(Math.max(40, p.bodyEndFreq || (startFreq * 0.6)), t + p.decay);
    const actualBodyAmp = Math.min(1.6, p.bodyAmp * vol);
    gain.gain.setValueAtTime(actualBodyAmp, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + p.decay + 0.018);
    osc.connect(gain).connect(dest);
    osc.start(t);
    osc.stop(t + p.decay + 0.025);
  } catch (e) {}
}

if (typeof soundToggle !== "undefined" && soundToggle) {
  soundToggle.classList.toggle("on", soundOn);
  soundToggle.innerHTML = (soundOn ? pkIcon("volume", 15) : pkIcon("volume-mute", 15)) + " Key sound";
  soundToggle.addEventListener("click", () => {
    soundOn = !soundOn;
    safeSet(LS.sound, soundOn ? "1" : "0");
    soundToggle.classList.toggle("on", soundOn);
    soundToggle.innerHTML = (soundOn ? pkIcon("volume", 15) : pkIcon("volume-mute", 15)) + " Key sound";
    if (soundOn) playClick("down");
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
  function getActiveLayoutId() {
    if (typeof window !== "undefined" && window.currentLayoutId) return window.currentLayoutId;
    if (typeof currentLayoutId !== "undefined" && currentLayoutId) return currentLayoutId;
    try {
      return localStorage.getItem("khmerActiveLayout") || localStorage.getItem("pk_active_layout") || "standard";
    } catch (e) {
      return "standard";
    }
  }

  function syncLayoutChoiceUI(layoutId) {
    const cur = layoutId || getActiveLayoutId();
    const btns = document.querySelectorAll("#settingsLayoutChoice button");
    btns.forEach((b) => {
      const match = (b.dataset.layoutSet || b.getAttribute("data-layout-set")) === cur;
      b.classList.toggle("active", match);
      b.setAttribute("aria-selected", match ? "true" : "false");
    });
  }
  window.syncSettingsLayoutChoiceUI = syncLayoutChoiceUI;

  layoutChoiceBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      const targetLayout = btn.dataset.layoutSet || btn.getAttribute("data-layout-set");
      if (!targetLayout) return;
      if (typeof switchLayout === "function") {
        switchLayout(targetLayout, true);
      } else if (typeof window.switchLayout === "function") {
        window.switchLayout(targetLayout, true);
      } else if (typeof window.setActiveLayout === "function") {
        window.setActiveLayout(targetLayout);
      }
      const topBtn = document.querySelector(`.layout-strip .layout-pill[data-layout="${targetLayout}"]`);
      if (topBtn && !topBtn.classList.contains("active")) {
        topBtn.click();
      }
      syncLayoutChoiceUI(targetLayout);
      if (typeof healBothHandsOverlay === "function") {
        setTimeout(healBothHandsOverlay, 60);
      }
    });
  });
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
  const THEME_WAVE_PALETTES = {
    glass:     { color: "#67e8f9", glow: "rgba(103, 232, 249, 0.45)" },
    dark:      { color: "#38bdf8", glow: "rgba(56, 189, 248, 0.40)" },
    temple:    { color: "#ff9d2e", glow: "rgba(255, 157, 46, 0.45)" },
    moonlight: { color: "#60a5fa", glow: "rgba(96, 165, 250, 0.48)" },
    jungle:    { color: "#34d399", glow: "rgba(52, 211, 153, 0.44)" },
    sunset:    { color: "#f472b6", glow: "rgba(244, 114, 182, 0.45)" },
    sepia:     { color: "#e6b88a", glow: "rgba(212, 163, 115, 0.44)" },
    light:     { color: "#38bdf8", glow: "rgba(148, 163, 184, 0.40)" },
    system:    { color: "#a78bfa", glow: "rgba(167, 139, 250, 0.44)" }
  };

  function spawnChoiceButtonRipple(btn, evt) {
    if (!btn || document.documentElement.classList.contains("reduced-motion")) return;
    try {
      const rect = btn.getBoundingClientRect();
      const x = (evt && evt.clientX) ? (evt.clientX - rect.left) : (rect.width / 2);
      const y = (evt && evt.clientY) ? (evt.clientY - rect.top) : (rect.height / 2);
      const ripple = document.createElement("span");
      ripple.className = "theme-click-ripple";
      ripple.style.left = x + "px";
      ripple.style.top = y + "px";
      btn.appendChild(ripple);
      setTimeout(() => { if (ripple.parentNode) ripple.parentNode.removeChild(ripple); }, 620);

      btn.classList.remove("theme-btn-pop");
      void btn.offsetWidth;
      btn.classList.add("theme-btn-pop");
      setTimeout(() => btn.classList.remove("theme-btn-pop"), 520);
    } catch (err) {}
  }

  function triggerThemeTransitionFX(btn, mode, evt) {
    spawnChoiceButtonRipple(btn, evt);
    if (document.documentElement.classList.contains("reduced-motion")) return;
    try {
      const pal = THEME_WAVE_PALETTES[mode] || THEME_WAVE_PALETTES.dark;
      const parentRow = btn ? btn.closest(".settings-row") : null;
      if (parentRow) {
        parentRow.style.setProperty("--row-flash-color", pal.color);
        parentRow.style.setProperty("--row-flash-glow", pal.glow);
        parentRow.classList.remove("theme-row-flash");
        void parentRow.offsetWidth;
        parentRow.classList.add("theme-row-flash");
        setTimeout(() => parentRow.classList.remove("theme-row-flash"), 650);
      }

      let overlay = document.getElementById("pkThemeWaveOverlay");
      if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "pkThemeWaveOverlay";
        overlay.className = "pk-theme-wave-overlay";
        document.body.appendChild(overlay);
      }
      const rect = btn ? btn.getBoundingClientRect() : null;
      const cx = (evt && evt.clientX) ? evt.clientX : (rect ? (rect.left + rect.width / 2) : (window.innerWidth / 2));
      const cy = (evt && evt.clientY) ? evt.clientY : (rect ? (rect.top + rect.height / 2) : (window.innerHeight / 2));
      const ring = document.createElement("div");
      ring.className = "pk-theme-wave-ring";
      ring.style.setProperty("--wave-x", cx + "px");
      ring.style.setProperty("--wave-y", cy + "px");
      ring.style.setProperty("--wave-color", pal.glow);
      overlay.appendChild(ring);
      setTimeout(() => { if (ring.parentNode) ring.parentNode.removeChild(ring); }, 720);
    } catch (err) {}
  }

  document.querySelectorAll("#settingsBodyScroll .settings-choice button").forEach((choiceBtn) => {
    if (!choiceBtn.closest("#themeChoice")) {
      choiceBtn.addEventListener("click", (e) => spawnChoiceButtonRipple(choiceBtn, e));
    }
  });

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
    document.documentElement.classList.toggle("theme-glass", effective === "glass");
    themeButtons.forEach((b) => b.classList.toggle("active", b.dataset.theme === mode));
    safeSet(LS.theme, mode);
  }
  themeButtons.forEach((b) => {
    b.addEventListener("click", (e) => {
      applyTheme(b.dataset.theme);
      triggerThemeTransitionFX(b, b.dataset.theme, e);
      if (soundOn) playClick("down");
    });
  });
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
  const khmerFontBtns = document.querySelectorAll("#khmerFontChoice button");
  const KHMER_FONT_MAP = {
    "kantumruy": "'Kantumruy Pro', 'Khmer OS Battambang', 'Noto Sans Khmer', sans-serif",
    "noto-sans": "'Noto Sans Khmer', 'Khmer OS Battambang', sans-serif",
    "noto-serif": "'Noto Serif Khmer', 'Khmer OS Battambang', serif"
  };
  function applyKhmerFont(fontKey) {
    fontKey = fontKey || "kantumruy";
    document.documentElement.setAttribute("data-khmer-font", fontKey);
    const fontVal = KHMER_FONT_MAP[fontKey] || KHMER_FONT_MAP.kantumruy;
    document.documentElement.style.setProperty("--khmer-font", fontVal);
    khmerFontBtns.forEach((b) => b.classList.toggle("active", b.dataset.kfont === fontKey));
    safeSet(LS.khmerFont, fontKey);
  }
  khmerFontBtns.forEach((b) => b.addEventListener("click", () => applyKhmerFont(b.dataset.kfont)));
  applyKhmerFont(safeGet(LS.khmerFont, "kantumruy"));

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
    switchProfile = profile || "brown";
    switchBtns.forEach((b) => b.classList.toggle("active", b.dataset.switch === switchProfile));
    safeSet(LS.switchProfile, switchProfile);
    if (audition) {
      if (!soundOn) {
        soundOn = true;
        safeSet(LS.sound, "1");
        if (typeof soundToggle !== "undefined" && soundToggle) {
          soundToggle.classList.add("on");
          soundToggle.innerHTML = pkIcon("volume", 15) + " Key sound";
        }
        if (typeof syncSettingsMirrors === "function") syncSettingsMirrors();
      }
      playClick("down");
    }
  }
  switchBtns.forEach((b) => b.addEventListener("click", () => applySwitchProfile(b.dataset.switch, true)));
  applySwitchProfile(safeGet(LS.switchProfile, "brown"), false);

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
    soundVolumeSlider.addEventListener("change", () => { if (soundOn) playClick("down"); });
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
    safeSet("pk_unlock_all_lessons", on ? "1" : "0");
    safeSet("khmerUnlockAll", on ? "1" : "0");
    if (typeof allLessonsUnlocked !== "undefined") {
      allLessonsUnlocked = !!on;
    }
    window.allLessonsUnlocked = !!on;
    if (typeof renderLessonStrip === "function") renderLessonStrip();
  }
  bindSwitch(unlockAllLessonsToggle, (on) => {
    applyUnlockAllLessons(on);
    if (typeof showToast === "function") {
      showToast(pkIcon("trophy", 18), on ? "All 77 Lessons Unlocked" : "Standard Progression Restored", on ? "Sandbox Mode active — jump to any lesson freely." : "Lessons unlock sequentially as you master them.");
    }
  });
  const initialUnlockAll = safeGet("khmerUnlockAll", safeGet("pk_unlock_all_lessons", "0")) === "1";
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

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && document.documentElement.classList.contains("focus-mode")) {
      const anyModalOpen = document.querySelector(".modal-backdrop:not([hidden])");
      if (!anyModalOpen) applyFocusMode(false);
    } else if (e.altKey && (e.key === "f" || e.key === "F")) {
      e.preventDefault();
      applyFocusMode(!document.documentElement.classList.contains("focus-mode"));
    }
  });
  applyFocusMode(safeGet(LS.focusMode, "0") === "1");

  /* ---------- 9. Mirror Sound & Finger-Guide Toggles ---------- */
  const settingsSoundToggle = document.getElementById("settingsSoundToggle");
  const settingsHandsToggle = document.getElementById("settingsHandsToggle");
  function syncSettingsMirrors() {
    if (settingsSoundToggle && typeof soundToggle !== "undefined" && soundToggle) {
      setSwitchUI(settingsSoundToggle, soundToggle.classList.contains("on"));
    }
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
  if (settingsSoundToggle && typeof soundToggle !== "undefined" && soundToggle) {
    settingsSoundToggle.addEventListener("click", () => {
      soundToggle.click();
      syncSettingsMirrors();
    });
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
      if (typeof soundToggle !== "undefined" && soundToggle && !soundToggle.classList.contains("on")) soundToggle.click();
      applySwitchProfile("brown", false);
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
      applyCompactKeys(true);
      applyHandsOpacity(40);
      applySwitchProfile("red", true);
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
      if (typeof soundToggle !== "undefined" && soundToggle && !soundToggle.classList.contains("on")) soundToggle.click();
      applySwitchProfile("brown", true);
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
      const lessonStatsRaw = JSON.parse(safeGet("khmerLessonStats", "{}") || "{}");
      const memLessonStats = (typeof window.savedLessonStats === "object" && window.savedLessonStats) ? window.savedLessonStats : {};

      let progressUnits = 0;
      let progressBestWpm = 0;
      const masteredSet = new Set();

      if (window.PK_PROGRESS && typeof window.PK_PROGRESS.exportData === "function") {
        const exp = window.PK_PROGRESS.exportData();
        const courses = (exp && exp.courses) || {};
        Object.values(courses).forEach((course) => {
          if (!course) return;
          progressUnits += Number(course.totalTypingUnits || 0);
          const lessonsObj = course.lessons || {};
          Object.entries(lessonsObj).forEach(([lid, rec]) => {
            if (!rec) return;
            if (Number(rec.bestWpm || 0) > progressBestWpm) {
              progressBestWpm = Number(rec.bestWpm || 0);
            }
            if (rec.masteryState === "mastered" || (rec.completed && Number(rec.bestAccuracy || 0) >= 85)) {
              masteredSet.add(String(lid));
            }
          });
        });
      }

      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i) || "";
        if (k.startsWith("khmerLessonBest_")) {
          const lid = k.replace("khmerLessonBest_", "");
          try {
            const b = JSON.parse(localStorage.getItem(k) || "null");
            if (b && (b.mastered || Number(b.accuracy || 0) >= 85)) {
              masteredSet.add(String(lid));
            }
          } catch (_) {}
        }
      }

      if (typeof LESSONS !== "undefined" && Array.isArray(LESSONS) && typeof getLessonBest === "function") {
        LESSONS.forEach((l) => {
          if (!l || !l.id) return;
          const b = getLessonBest(l.id);
          if (b && (b.mastered || Number(b.accuracy || 0) >= 85)) {
            masteredSet.add(String(l.id));
          }
        });
      }

      const totalKeys = Math.max(
        Number(statsRaw.keys || 0),
        Number(statsRaw.totalKeys || 0),
        Number(lessonStatsRaw.keys || 0),
        Number(memLessonStats.keys || 0),
        progressUnits
      );

      const bestWpm = Math.round(Math.max(
        Number(statsRaw.bestWpm || 0),
        Number(lessonStatsRaw.bestWpm || 0),
        Number(lessonStatsRaw.wpm || 0),
        Number(memLessonStats.bestWpm || 0),
        Number(memLessonStats.wpm || 0),
        progressBestWpm
      ));

      let totalLessonsCount = 77;
      if (typeof CURRICULUM_BUNDLE === "object" && CURRICULUM_BUNDLE) {
        let sum = 0;
        ["standard", "nida", "english"].forEach((cid) => {
          if (CURRICULUM_BUNDLE[cid] && Array.isArray(CURRICULUM_BUNDLE[cid].lessons)) {
            sum += CURRICULUM_BUNDLE[cid].lessons.length;
          }
        });
        if (sum > 0) totalLessonsCount = sum;
      }

      if (keysEl) keysEl.textContent = totalKeys.toLocaleString();
      if (bestWpmEl) bestWpmEl.textContent = bestWpm + " WPM";
      if (masteredEl) masteredEl.textContent = masteredSet.size + " / " + totalLessonsCount;

      let bytes = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i) || "";
        const v = localStorage.getItem(k) || "";
        bytes += (k.length + v.length) * 2;
      }
      if (storageEl) storageEl.textContent = Math.max(1, Math.round(bytes / 1024)) + " KB";
    } catch (e) {}
  }
  window.updateSettingsStorageStats = updateSettingsStorageStats;
  updateSettingsStorageStats();

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

  if (settingsOpenBtn) settingsOpenBtn.addEventListener("click", openSettingsModal);
  if (settingsCloseBtn) settingsCloseBtn.addEventListener("click", closeSettingsModal);
  if (settingsDoneBtn) settingsDoneBtn.addEventListener("click", closeSettingsModal);
  if (settingsModal) {
    settingsModal.addEventListener("click", (e) => {
      if (e.target === settingsModal) closeSettingsModal();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (typeof statsModal !== "undefined" && statsModal) statsModal.hidden = true;
      closeSettingsModal();
    }
  });
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
