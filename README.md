# PK Khmer Type (ក្តារចុចខ្មែរ PK)

<p align="center">
  <img src="https://img.shields.io/badge/Language-Khmer%20%7C%20English-00f5c4?style=for-the-badge" alt="Bilingual">
  <img src="https://img.shields.io/badge/Stack-Vanilla%20HTML5%20%2F%20CSS3%20%2F%20JS-ffd166?style=for-the-badge" alt="Vanilla JS">
  <img src="https://img.shields.io/badge/Architecture-Modular%20%26%20Clean-5fd694?style=for-the-badge" alt="Modular Architecture">
  <img src="https://img.shields.io/badge/Platform-PWA%20Ready-ff7bee?style=for-the-badge" alt="PWA Ready">
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="License">
</p>

<p align="center">
  <b>A modern, modular interactive Khmer typing tutor, layer visualizer, and speed trainer.</b><br>
  កម្មវិធីមើលស្រទាប់ក្តារចុច និងហ្វឹកហាត់វាយអក្សរខ្មែរទំនើប ងាយស្រួលប្រើប្រាស់ និងមានប្រសិទ្ធភាពខ្ពស់។
</p>

---

## 1. Overview

**PK Khmer Type** is an interactive, browser-based typing tutor and keyboard layer visualizer designed specifically for the Khmer writing system. It guides learners through touch-typing techniques, layer manipulation (Shift, Ctrl, AltGr), subscript consonant clustering (*Coeng*), and real-time accuracy scoring.

Originally created as a monolithic web app, the project has been professionally refactored into a clean, maintainable, modular structure adhering to software engineering best practices:
- **Separation of Concerns**: HTML handles semantic structure, CSS governs aesthetics and responsive layout, JavaScript drives interaction and state, and JSON stores data.
- **Offline-First Compatibility**: Runs directly from local disk (`file:///`) by double-clicking `index.html`, with zero build steps or required dependencies.
- **Data-Driven Architecture**: Keyboard layouts, lesson curricula, and word pools are externalized into JSON files while retaining automatic in-memory fallback.

---

## 2. Project Architecture and Directory Structure

```text
PK-Khmer-Type/
├── index.html                  # Core semantic HTML page structure (~850 lines)
├── manifest.json               # Progressive Web App (PWA) manifest
├── sw.js                       # Service Worker for offline caching
├── README.md                   # Technical documentation and project guide
│
├── css/                        # Modular stylesheet system
│   ├── base.css                # Typography, CSS variables, themes, modals, reset
│   ├── keyboard.css            # Virtual keyboard grid, key styling, hands overlay
│   ├── typing.css              # Manuscript input display, caret, stats toolbar
│   ├── lessons.css             # Lesson dock, level accordion, cards, remedial view
│   └── responsive.css          # Breakpoints (mobile, tablet, desktop) & media queries
│
├── js/                         # Modular JavaScript application engine
│   ├── app.js                  # Application orchestrator, data loader, PWA setup
│   ├── keyboard.js             # Keyboard builder, layout switching, hands kinematics
│   ├── typing.js               # Manuscript buffer, keystroke input & visual feedback
│   ├── lessons.js              # Lesson sequencer, adaptive learning, mistake review
│   ├── race.js                 # Temple Trial challenge and real-time Typing Race
│   ├── statistics.js           # Session stats, WPM/accuracy tracking, achievements
│   ├── settings.js             # Themes, audio synthesis, cosmetic toggles, i18n
│   ├── storage.js              # User authentication state, cloud & local progress
│   └── icons.js                # Optimized vector SVG icon library
│
├── data/                       # Externalized data models
│   ├── keyboard.json           # Layout definitions, key codes, and finger mappings
│   ├── lessons.json            # 60+ structured lessons across 8 progressive levels
│   └── typing-content.json     # Word banks, vocabulary pools, and race configurations
│
└── assets/                     # Static media and branding
    ├── logo.svg                # Vector site emblem
    └── icons/                  # PWA and browser application icons
```

---

## 3. Module Responsibilities

### CSS Architecture (`css/`)
1. **`base.css`**: Global design tokens (`:root`), font declarations, Angkor-inspired color palettes, modal dialog foundations, toast notifications, founder HUD profile, and distraction-free Focus Mode rules.
2. **`keyboard.css`**: CSS Grid and Flexbox layouts for the 5 rows of keys, modifier switch states (`.layer-shift`, `.layer-ctrl`, `.layer-altgr`), key active/press animations, and vector hands overlay styling.
3. **`typing.css`**: The manuscript workspace, cursor animation, caret positioning, character status feedback (correct, incorrect, pending), and race track UI.
4. **`lessons.css`**: Multi-column collapsible level accordion, lesson cards, prompt indicators, badge counters, and the remedial mistake review modal.
5. **`responsive.css`**: Consolidated media queries for mobile handsets, tablets, ultrawide monitors, and accessibility preferences (`prefers-reduced-motion`).

### JavaScript Modules (`js/`)
1. **`app.js`**: Central bootstrap script. Loads JSON datasets asynchronously with graceful fallback for local `file:///` contexts, mounts DOM components, and registers service workers.
2. **`keyboard.js`**: Manages keyboard layouts (Standard, NiDA, English QWERTY), key code mapping, modifier hold states, and mathematical hand kinematics (wrist anchors and finger reach vectors).
3. **`typing.js`**: Captures physical and virtual keystrokes, applies IME character shaping, updates manuscript output, and coordinates sound effects and visual feedback.
4. **`lessons.js`**: Implements curriculum progression, mistake tracking, adaptive drill extension, level accordion expansion/collapse, and viewport auto-scrolling.
5. **`race.js`**: Powers the Temple Trial streak drill and competitive Typing Race mode with bot ghost pacers and difficulty tiers.
6. **`statistics.js`**: Calculates live WPM, CPM, and accuracy percentage, updates mastery scores, unlocks achievements, and renders the stats dashboard.
7. **`settings.js`**: Controls theme switching, accent colors, synthetic Web Audio key clicks/chimes, Focus Mode toggling, and bilingual localization (Khmer and English).
8. **`storage.js`**: Manages client-side storage, guest and authenticated user profiles, session persistence, and progress JSON export/import.
9. **`icons.js`**: Provides clean SVG vector glyphs rendered on demand without external icon font dependencies.

### Externalized Data (`data/`)
- **`keyboard.json`**: Physical layout matrix, key identifiers, glyph maps per layer, and touch-typing finger assignments.
- **`lessons.json`**: Curriculum definitions, lesson categories, level thresholds, and drill sequences.
- **`typing-content.json`**: Khmer and English vocabulary pools, word banks, and race configuration options.

---

## 4. Key Features

- **Comprehensive Khmer Layouts**: Instant switching between Khmer Standard (ប្លង់ក្តារចុចខ្មែរ), Khmer NiDA (ក្តារចុចខ្មែរ និដា), and English US QWERTY.
- **Interactive Hand Kinematics**: Illustrated translucent hands overlay showing the anatomical reach vectors and proper finger assignments for each character.
- **Adaptive Remedial System**: Automatically identifies mistyped characters during practice and generates customized remedial drills targeting weak keys.
- **Distraction-Free Focus Mode**: Instant toggle (`Alt + F` or `Escape`) to hide sidebars, banners, and non-essential UI elements for deep concentration.
- **Sound Synthesis**: Real-time mechanical click and chime audio synthesized entirely via the Web Audio API without requiring external audio files.
- **Data Persistence**: Automatic progress saving via browser `localStorage` with full JSON backup export and restoration tools.

---

## 5. How Khmer Typing Works

Khmer writing is an abugida script featuring base consonants, subscript consonants (*Coeng*), dependent vowels, and independent vowels:

1. **Consonant-First Principle**: Always type the base consonant first, followed by dependent vowels or diacritics.
   - Example: Type <kbd>K</kbd> (`ក`) + <kbd>A</kbd> (`ា`) = **`កា`**.
2. **Subscript Consonants (*Coeng*)**: Subscripts are formed by typing the subscript marker (<kbd>Shift</kbd> + <kbd>J</kbd> = `្`) followed by the consonant to be subscripted.
   - Example: Type <kbd>ក</kbd> + <kbd>្</kbd> + <kbd>ខ</kbd> = **`ក្ខ`**.
3. **Modifier Layers**:
   - **Base Layer**: Most common consonants and dependent vowels.
   - **Shift Layer**: Secondary consonants, independent vowels, and subscript trigger.
   - **Ctrl & AltGr Layers**: Rare religious glyphs, archaic characters, and specialized punctuation marks.

---

## 6. Getting Started

### Local Execution (No Server Required)
Open `index.html` directly in any standard browser:
```bash
# Windows
start index.html

# macOS
open index.html

# Linux
xdg-open index.html
```

### Local Development Server (Optional)
To test asynchronous JSON fetching over HTTP:
```bash
# Using Node / npx
npx serve .

# Using Python 3
python -m http.server 8080
```
Navigate to `http://localhost:8080` in your web browser.

---

## 7. Keyboard Shortcuts

| Shortcut | Function |
| :--- | :--- |
| <kbd>Alt</kbd> + <kbd>F</kbd> | Toggle Focus Mode (distraction-free view) |
| <kbd>Esc</kbd> | Exit Focus Mode / Close open modal windows |
| <kbd>Shift</kbd> (Hold) | Reveal and type on the Shift layer |
| <kbd>Ctrl</kbd> (Hold) | Reveal and type on the Ctrl layer |
| <kbd>AltGr</kbd> (Hold) | Reveal and type on the AltGr layer |
| <kbd>Caps Lock</kbd> | Toggle uppercase state (English layout) |

---

## 8. Technology Stack

- **HTML5**: Semantic, accessible markup using WAI-ARIA standards.
- **CSS3**: Modern layouts using CSS Grid, Flexbox, custom properties, and backdrop filters.
- **Vanilla JavaScript (ES6+)**: Zero framework dependencies, fast execution, modular organization.
- **Web Audio API**: Real-time procedural audio synthesis for key presses and chimes.
- **Vector Graphics (SVG)**: Scalable visual assets for key icons, hands, and branding.

---

## 9. Author and Credits

- **Developer**: Phanna Kurosaki (Student Developer, EST. 2026)
- **Project**: PK Khmer Type
- **Purpose**: Developed to provide free, high-quality, accessible Khmer typing education for students and learners worldwide.
