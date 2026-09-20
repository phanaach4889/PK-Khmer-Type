# ⌨️ PK Khmer Type (ក្តារចុចខ្មែរ PK)

<p align="center">
  <img src="https://img.shields.io/badge/Language-Khmer%20%7C%20English-00f5c4?style=for-the-badge" alt="Bilingual">
  <img src="https://img.shields.io/badge/Stack-Vanilla%20HTML5%20%2F%20CSS3%20%2F%20JS-ffd166?style=for-the-badge" alt="Vanilla JS">
  <img src="https://img.shields.io/badge/Architecture-PWA%20Ready-5fd694?style=for-the-badge" alt="PWA">
  <img src="https://img.shields.io/badge/Version-2.0.0-ff7bee?style=for-the-badge" alt="Version">
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="License">
</p>

<p align="center">
  <b>A next-generation interactive Khmer typing tutor, layer visualizer, and speed trainer.</b><br>
  កម្មវិធីមើលស្រទាប់ក្តារចុច និងហ្វឹកហាត់វាយអក្សរខ្មែរទំនើប ងាយស្រួលប្រើប្រាស់ និងមានប្រសិទ្ធភាពខ្ពស់។
</p>

---

## 🌟 Overview

**PK Khmer Type** is a comprehensive, distraction-free typing platform designed specifically for the unique nuances of the Khmer script and modern touch-typing standards. Whether you are learning Khmer typing from scratch or mastering complex subscript clusters (*Coeng*) and modifier layers, PK Khmer Type provides real-time kinesthetic guidance, structured courses, and competitive drills.

---

## ✨ Key Features

### 🔤 Comprehensive Layout Engine
- **Multiple Layouts**: Seamlessly switch between:
  - **Khmer Standard** (ប្លង់ក្តារចុចខ្មែរ)
  - **Khmer NiDA** (ក្តារចុចខ្មែរ និដា)
  - **English (US)**
- **Full Modifier Layer Visualizer**: Real-time layer switching for **Base**, **Shift**, **Ctrl**, and **AltGr** layers.
- **Modifier Hold Behavior**: Shift, Ctrl, and Alt keys visually lock and hold like physical switches or modifier combinations.

### 📚 60+ Structured Lessons & Levels
- **Step-by-step Curriculum**:
  - **Level 1**: Home Row Basics & Index Anchors (`ថ`, `ញ`, `ដ`, `ក`, `ង`, `ហ`, `ស`, `ល`, `ា`)
  - **Level 2**: Home Row Combinations, Syllable Triples & Flow
  - **Level 3**: Home Row + Shift Modifiers
  - **Level 4**: Remaining Consonants & Core Characters
  - **Level 5**: Vowels & Signs (`ស្រះនិស្ស័យ និង សញ្ញា`)
  - **Level 6**: Khmer Numerals (`លេខខ្មែរ ០-៩`)
  - **Level 7**: Ctrl & AltGr Advanced Layers
  - **Level 8**: Full Keyboard Mastery & Speed Drills
- **Smart Dynamic Drawer**: 
  - Automatically expands into a 2-column view when multiple levels are opened.
  - Automatically contracts to compact mode on outside click.
  - Level accordion auto-advances to the next level upon completion.
  - Smooth automatic viewport scrolling directly to the active lesson card and prompt.
- **Context-Aware Mistake Review**: Tracks keystroke misfires and builds dedicated, targeted remedial practice sessions.

### 🖐️ Whole-Hand Kinematic Touch-Typing Guide
- Realistic vector hands overlay with color-coded finger zones.
- Natural multi-joint kinematics: wrists pivot, fingers bend and extend naturally toward reach keys.
- Real-time active finger glow showing you exactly which finger to use for the next character.

### 🎯 Focus Mode
- **Zero Distractions**: Hides all sidebars, ambient particles, torch flames, notification popups, and banners with a single click or keystroke (`Alt + F` or `Escape`).
- Keeps typing center stage so you can immerse yourself in uninterrupted flow.

### 🎮 Gamification & Competitive Drills
- **Temple Trial**: Real Khmer vocabulary drills with streak tracking, combo multipliers, and celebration effects.
- **Typing Race**: High-stakes real-time typing race against automated ghost pacers with difficulty selection.
- **Stats Dashboard & Heatmaps**: Track your WPM, CPM, accuracy %, total keystrokes, and per-key mastery.
- **Cross-Device Leaderboard**: Local storage persistence + Firebase Cloud Firestore integration ready.

### 🎨 Immersive Themes & Aesthetics
- **Angkor Stone**: Classic dark basalt and warm golden temple glow.
- **Jungle Ruins**: Deep moss and emerald tones.
- **Midnight Temple**: Electric neon cyan and obsidian night.
- **Sunset Temple**: Warm amber and royal plum gradients.
- **Vintage Sepia**: Antique parchment with warm earth tones.
- **Customizable Atmosphere**: Opt-in holographic CRT scanlines, drifting ember motes, and mechanical stone click audio synthesizer.

---

## 🚀 Quick Start

### 1. Run Locally
No build steps, bundlers, or Node dependencies required. Simply clone and open:

```bash
# Clone the repository
git clone https://github.com/your-username/PK-Khmer-Type.git

# Navigate into the project folder
cd PK-Khmer-Type

# Open index.html in any modern web browser (Brave, Chrome, Edge, Safari, Firefox)
# On Windows:
start index.html
```

### 2. Run with a Local Web Server (Optional)
If you prefer running via a local HTTP server:

```bash
# Using Node / npx
npx serve .

# Using Python 3
python -m http.server 8080
```
Then visit `http://localhost:8080` in your browser.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| <kbd>Alt</kbd> + <kbd>F</kbd> | Toggle **Focus Mode** (Hide distractions) |
| <kbd>Esc</kbd> | Exit Focus Mode / Close active modal |
| <kbd>Shift</kbd> (Hold) | View & type on the **Shift** layer |
| <kbd>Ctrl</kbd> (Hold) | View & type on the **Ctrl** layer |
| <kbd>AltGr</kbd> (Hold) | View & type on the **AltGr** layer |
| <kbd>Caps Lock</kbd> | Toggle Caps Lock (English layout) |

---

## 📁 Project Structure

```text
PK-Khmer-Type/
├── index.html        # Production single-page web app
├── index (1).html    # Development reference build
├── js/
│   └── icons.js      # SVG icon engine and vector asset definitions
└── README.md         # Documentation & guide
```

---

## 💡 How Khmer Typing Works

Unlike Latin scripts, Khmer writing uses base consonants and **combining dependent marks** (ស្រះនិស្ស័យ និង សញ្ញា):

1. **Consonant-First Rule**: In Khmer typing, you always type the **consonant base first**, followed by the dependent vowel or diacritic.
   - Example: Type `K` (<kbd>ក</kbd>) + `A` (<kbd>ា</kbd>) $\rightarrow$ produces **`កា`**.
2. **Subscripts (*Coeng*)**: Subscript consonants are typed using the Subscript / Coeng key (<kbd>Shift</kbd> + <kbd>J</kbd> = `្`) followed by the target consonant.
   - Example: Type <kbd>ក</kbd> + <kbd>្</kbd> + <kbd>ខ</kbd> $\rightarrow$ produces **`ក្ខ`**.
3. **Independent Vowels**: Standalone vowel sounds at the start of a word use independent vowels or the consonant base `អ` followed by a vowel sign.

---

## 🛠️ Technology Stack

- **Markup**: Semantic HTML5 with accessibility attributes (`aria-*`, `role`).
- **Styling**: Modern CSS3, CSS Grid, Flexbox, CSS Custom Properties, and Backdrop Blur filters.
- **Scripting**: Pure Vanilla JavaScript (ES6+), Web Audio API for synthetic key clicks, and Canvas/SVG for hand kinematics.
- **Storage**: Browser `localStorage` for offline persistence with JSON backup export/import.

---

## 👤 Author & Credits

- **Creator & Founder**: Phanna Kurosaki (EST. 2026)
- **Design & Architecture**: Crafted with deep respect for Khmer culture, traditional Angkorian aesthetics, and modern UX design.

---

<p align="center">
  <i>Created with ❤️ for the Khmer language and typing community worldwide.</i><br>
  <b>PK Khmer Type — ប្រណិតភាព និងប្រសិទ្ធភាពនៃការវាយអក្សរខ្មែរ</b>
</p>
