# PK Khmer Type — Translation & Curriculum Handoff

## 1. Completed Work

### A. Static & Structural HTML Translation (`index.html`)
- **Profile Sidebar (`#profileSidebar`)**: Added `.i18n-t` (`data-en` / `data-km`) attributes to profile substat labels (`Best WPM`, `Accuracy`, `Mastered`, `Keystrokes`).
- **Quick Guide Dock (`#guideDock`)**: Added `.i18n-t` attributes to Live Radar metrics (`Acc`, `Streak`), Target Finger callout (`Press Any Key`), Finger Color Map legend (`L Pinky` through `R Pinky`), Subscripts punctuation sample label, and Quick Controls status labels (`ON` / `OFF`).
- **Statistics Modal (`#statsModal`)**: Added `.i18n-ph` (`data-en` / `data-km`) placeholder attributes to `#lessonsLbNameInput`.
- **Settings Modal (`#settingsModal`)**: Added `.i18n-t` / `.i18n-ph` attributes across the header count pill, search bar placeholder, Quick Experience Presets, Category Navigation Tabs, and all 8 Settings Sections.
- **Authentication, Terms & Confirmation Modals (`#authModal`, `#termsModal`, `#templeConfirmModal`)**: Added `.i18n-t` attributes to Sign In, Sign Up, Forgot Password, Account panel, Terms sections, and confirmation buttons.
- **Main Studio Panels & Toolbar (`#manuscript`, `#lessonStrip`, `#adaptivePanel`, `#racePanel`, `.toolbar`)**: Wrapped button text inside `<span class="i18n-t">` so `<svg>` icons are preserved when switching languages.

### B. Language Engine & Core Modules (`js/settings.js`, `js/keyboard.js`, `js/cursor-inspector.js`)
- **`js/settings.js`**: `applyLang(lang)` toggles `.site-km-mode`, preserves child SVG elements on `.i18n-t` nodes, translates `.i18n-ph` input placeholders, and dispatches refresh calls to dynamic modules.
- **`js/keyboard.js`**: Added `layerLabelsKm` to `LAYOUTS` and updated `syncLayoutUI()` and `updateQuickGuide()`.
- **`js/cursor-inspector.js`**: Localized `inspectKey()`, `inspectTextCharacter()`, and `setupToolbarToggle()`, and exposed `PKCursorInspector.refreshLang()`.

### C. Dynamic JavaScript UI Localizations (Completed)
1. **`js/quick_guide.js`**:
   - Localized dynamic strings in `updateLayout()` (layout badges), `updateTelemetry()` (keystroke streak celebration toasts), `updateToolStatuses()` (`Active`/`Off`, `On`/`Muted`), `updateWeakKeys()`, `drillSpecificChar()`, `launchWeakKeyPractice()`, and the Space shortcut toast.
   - Added and exposed `PKQuickGuide.refreshLang()`.
2. **`js/lessons.js` & `js/feedback.js`**:
   - `js/lessons.js`: Added `FINGER_LABELS_KM` and localized `fingerLabel()`; localized `renderLessonStrip()` (`LESSONS`, `Mastered`, accordion level titles, `Ex:` chip labels, adaptive sub status); localized `renderLessonMeta()` (`Target Keys`, `Level ...`, best run summary); localized fallback in `showLessonComplete()`.
   - `js/feedback.js`: Localized `getRealTimeHint()`; localized `renderLessonControlsHtml()` (`Resume Lesson`, `Restart`, `Exit to Course`, `Review Mistakes`, `Previous`, `Retry`, `Next Lesson`, `Close`); localized `buildPostLessonCardHtml()` (performance grid headers, accuracy/streak headings, insight column subheads, section performance bars, next-step recommendation); localized `buildIncompleteLessonHtml()`.
3. **`js/adaptive.js`**:
   - Localized `renderLetterStrip()` (pill states, completion status labels, detailed hover tooltips); localized `updateSidebarCard()`; localized `updateAdaptiveFocusHud()` (priority tooltips, healthy status chip); localized `showInlineRoundToast()` (unlocked banners and round complete notifications); localized `startAdaptiveSession()` (stage badge, focus badge, active count).
   - Added and exposed `PK_ADAPTIVE.refreshLang()`.
4. **`js/race.js`**:
   - Localized `renderRaceLeaderboard()` empty state; localized `updateRaceSetupBest()`; localized `enterRaceMode()` and `exitRaceMode()` button labels (`Exit Race` / `ចាកចេញពីការប្រណាំង`, `Typing Race` / `ប្រណាំងវាយអក្សរ`); localized `startRace()` difficulty and time/text labels; localized `showRaceResults()` complete modal (podium rank, stat grid, and action buttons).
5. **`js/statistics.js`**:
   - Localized `refreshProfileUI()` (substats, roadmap goal, and stat grid tiles); localized `renderStats()` (`statsRaceRecords` cards, tags, and empty state); localized `renderLessonsLeaderboard()` (`mastered` / `ស្ទាត់` score labels).

### D. Studio Command Bar & HUD Showcase (`index.html`, `css/base.css`, `Documents/`)
- Upgraded `.top-actions` into a frosted-glass Studio Command Dock with distinct inline SVG icons (0 emojis) and high-contrast `<kbd class="focus-kbd-badge">Alt+F</kbd>` keycap badge styling.
- Added the interactive **Studio Command Bar & HUD Controls** showcase (`#studio-controls`) in `Documents/index.html`, `Documents/docs.css`, and `Documents/docs.js`.

---

## 2. Localization Safeguards
- **Brand Names & System Keys**: `PK Khmer Type`, `Shift`, `AltGr`, `Space`, `Enter`, `Bksp`, `Tab`, and shortcut combinations (`Alt+L`, `Alt+F`) remain untranslated.
- **Practice Content**: Never translate exercise prompt characters or practice vocabulary.
- **Technical Units**: Units (`WPM`, `CPM`, `%`, `KB`, `.json`) remain standard.

