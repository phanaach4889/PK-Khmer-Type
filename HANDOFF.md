# PK Khmer Type — Translation & Curriculum Handoff

## 1. Completed Work in This Session

### A. Static & Structural HTML Translation (`index.html`)
- **Profile Sidebar (`#profileSidebar`)**: Added `.i18n-t` (`data-en` / `data-km`) attributes to profile substat labels (`Best WPM`, `Accuracy`, `Mastered`, `Keystrokes`).
- **Quick Guide Dock (`#guideDock`)**: Added `.i18n-t` attributes to Live Radar metrics (`Acc`, `Streak`), Target Finger callout (`Press Any Key`), Finger Color Map legend (`L Pinky` through `R Pinky`), Subscripts punctuation sample label, and Quick Controls status labels (`ON` / `OFF`).
- **Statistics Modal (`#statsModal`)**: Added `.i18n-ph` (`data-en` / `data-km`) placeholder attributes to `#lessonsLbNameInput`.
- **Settings Modal (`#settingsModal`)**:
  - Added `.i18n-t` / `.i18n-ph` attributes across the header count pill, search bar placeholder, Quick Experience Presets, Category Navigation Tabs, and all 8 Settings Sections (titles, descriptions, choice buttons, storage stats labels, empty search state, and footer buttons).
- **Authentication, Terms & Confirmation Modals (`#authModal`, `#termsModal`, `#templeConfirmModal`)**:
  - Added `.i18n-t` attributes to Sign In, Sign Up, Forgot Password, Signed-In Account panel, Terms & Conditions sections, and `#templeConfirmCancelBtn` / `#templeConfirmOkBtn`.
- **Main Studio Panels & Toolbar (`#manuscript`, `#lessonStrip`, `#adaptivePanel`, `#racePanel`, `.toolbar`)**:
  - Wrapped button text inside `<span class="i18n-t">` on `#copyBtn`, `#clearBtn`, `#soundToggle`, `#handsToggle`, `#cursorGuideToggle`, `#ambienceToggle`, `#trialToggle`, and `#raceToggle` so `<svg>` icons are preserved when switching languages.
  - Added `.i18n-t` / `.i18n-ph` to `#lessonStrip` header (`LESSONS`, `Mastered`), `#lessonUnavailableNote`, `#adaptivePanel` (`Stage 1`, `6/26 Active`, `Focus`, `Needs Practice`, `Pattern`), and `#racePanel` (`#raceNameInput` placeholder, leaderboard tabs, `← Back to Race Setup`, live race header & stats, `YOU` track tag).

### B. Language Engine & Keyboard / Inspector Modules
- **`js/settings.js`**:
  - Updated `applyLang(lang)` to toggle `.site-km-mode` first, preserve child `<svg>` elements on `.i18n-t` nodes, translate `.i18n-ph` input placeholders, and invoke refresh callbacks for dynamic UI modules.
  - Updated `filterSettingsView()` so `#settingsActiveCatCount` updates bilingually (`Controls` / `ការគ្រប់គ្រង`).
- **`js/keyboard.js`**:
  - Added `layerLabelsKm` to `LAYOUTS` (`standard`, `nida`, `english`) and updated `syncLayoutUI()` and `updateQuickGuide()` so `.layer-pill` and Coeng key badges respect Khmer mode.
- **`js/cursor-inspector.js`**:
  - Localized `inspectKey()`, `inspectTextCharacter()`, and `setupToolbarToggle()` (`Keystroke` / `គ្រាប់ចុច`, `Finger` / `ម្រាមដៃ`, `Subscript` / `ជើងព្យញ្ជនៈ`, Khmer finger names, toolbar button label, and toast messages) and exposed `PKCursorInspector.refreshLang()`.

---

## 2. Remaining Work for Next Session

To finish 100% of dynamic JavaScript string translations (while keeping brand names, keyboard keys, shortcuts, units like `WPM`/`KB`/`.json`, and practice target text untranslated):

1. **`js/quick_guide.js`**:
   - Localize dynamic strings in `updateLayout()`, `updateTelemetry()`, `updateTargetFinger()`, `updateWeakKeys()`, and `syncQuickToggles()`, and expose `PKQuickGuide.refreshLang()`.
2. **`js/lessons.js` & `js/feedback.js`**:
   - Localize dynamic strings in `renderLessonStrip()` (`Stage`, `Mastered`, `Ex:`, lesson type badges), `renderLessonMeta()` (`Target Keys`, `Best ...`, `Not attempted yet`, finger labels), `showLessonComplete()`, `buildPostLessonCardHtml()`, `buildIncompleteLessonHtml()`, `renderLessonControlsHtml()`, and `getRealTimeHint()`.
3. **`js/adaptive.js`**:
   - Localize dynamic strings in `renderLetterStrip()` tooltips/states, `updateSidebarCard()`, `updateAdaptiveFocusHud()`, `showInlineRoundToast()`, and `startAdaptiveSession()`, and expose `PK_ADAPTIVE.refreshLang()`.
4. **`js/race.js`**:
   - Localize dynamic strings in `updateRaceSetupBest()`, `renderRaceLeaderboard()`, `enterRaceMode()` / `exitRaceMode()` button text, `startRace()` difficulty label, and `showRaceResults()` modal.
5. **`js/statistics.js`**:
   - Localize dynamic strings in `refreshProfileUI()` and `renderStats()` (`statsHero`, `statsGrid`, `statsLessonBars`, `statsRaceRecords`, `renderLessonsLeaderboard`).
