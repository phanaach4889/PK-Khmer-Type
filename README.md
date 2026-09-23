# PK Khmer Type — ក្តារចុចខ្មែរ PK

<p align="center">
  <img src="https://img.shields.io/badge/Language-Khmer%20%7C%20English-00f5c4?style=for-the-badge" alt="Bilingual">
  <img src="https://img.shields.io/badge/Stack-Vanilla%20HTML5%20%2F%20CSS3%20%2F%20JS-ffd166?style=for-the-badge" alt="Vanilla JS">
  <img src="https://img.shields.io/badge/Architecture-Modular%20%26%20Clean-5fd694?style=for-the-badge" alt="Modular">
  <img src="https://img.shields.io/badge/Platform-PWA%20Ready-ff7bee?style=for-the-badge" alt="PWA Ready">
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="MIT">
</p>

<p align="center">
  <b>A modern, browser-based Khmer typing tutor with animated finger guides, structured lessons, and real-time feedback.</b><br>
  កម្មវិធីហ្វឹកហ្វឺនវាយអក្សរខ្មែរ ដែលមានមគ្គុទ្ទេសន៍មេដៃ មេរៀនជាលំដាប់ និងមតិប្រតិកម្មភ្លាមៗ។
</p>

---

## Overview

**PK Khmer Type** is a free, offline-ready typing trainer built for learning Khmer and English on a standard QWERTY keyboard. It runs entirely in the browser — no install, no server, no build step required.

**Built by Phanna Kurosaki** — a student developer — to make Khmer typing education free and accessible for everyone.

---

## Features

| Feature | Details |
| :--- | :--- |
| 🎹 **3 Keyboard Layouts** | Khmer Standard, Khmer NiDA, English US QWERTY |
| 📚 **Structured Lessons** | 60+ lessons (Standard), 16 lessons (NiDA), across 4 progressive levels each |
| 🤲 **Animated Finger Guide** | Live hand overlay shows which finger to use for every key |
| 🏁 **Temple Trial / Race Mode** | Speed drills and competitive typing race with bot pacers |
| 🔁 **Adaptive Remedial Drills** | Auto-detects weak keys and builds targeted review exercises |
| 🔇 **Focus Mode** | Hides sidebars and distractions for deep practice sessions |
| 🔊 **Web Audio Sounds** | Mechanical key click and chime effects — no audio files needed |
| 💾 **Progress Saving** | Auto-saves to `localStorage`; export/import JSON backup |
| 📱 **PWA Ready** | Installable as an app, works offline via Service Worker |

---

## How Khmer Typing Works

Khmer is an **abugida** script. Understanding a few rules makes learning much easier:

### 1. Base Consonant First
Always type the base consonant before any vowel or diacritic.

> Example: `K` → `ក` + `A` → `ា` = **`កា`**

### 2. Subscript Consonants (Coeng ្)
To stack a consonant below another, type the Coeng marker first, then the consonant.

| Layout | Coeng Key |
| :--- | :--- |
| Khmer Standard | `Shift` + `J` = `្` |
| Khmer NiDA | `Space` = `​` (zero-width space / Coeng) |

> Example (Standard): `ក` + `Shift+J` + `ខ` = **`ក្ខ`**

### 3. Word Spacing in Khmer Layouts

> **Both Khmer layouts use `Shift + Space` to insert a visible space between words.**  
> Plain `Space` alone inserts a Coeng or zero-width joiner depending on the layout.

### 4. Modifier Layers

| Layer | How to Activate | Contains |
| :--- | :--- | :--- |
| **Base** | Type normally | Common consonants, dependent vowels |
| **Shift** | Hold `Shift` | Secondary characters, subscript trigger, space |
| **Ctrl** | Hold `Ctrl` | Rare/archaic glyphs |
| **AltGr** | Hold `AltGr` (Right Alt) | Specialized punctuation, religious marks |

---

## Lessons & Levels

Each keyboard layout has its own lesson track:

| Layout | Levels | Lessons |
| :--- | :---: | :---: |
| Khmer Standard | 4 | 60+ |
| Khmer NiDA | 4 | 16 |
| English US | 4 | 20+ |

**Levels:** Beginner → Intermediate → Advanced → Master

The sidebar lesson panel:
- Always stays visible so you can track progress mid-lesson.
- **Auto-expands** when you open more than one level at the same time.
- **Collapses** when you click a lesson card or click outside the panel.

---

## Getting Started

### Open Locally (No Server Needed)

Just open `index.html` in your browser:

```bash
# Windows
start index.html

# macOS / Linux
open index.html
```

### Optional: Local Dev Server

For full JSON loading over HTTP:

```bash
npx serve .
# or
python -m http.server 8080
```

Then visit `http://localhost:8080`.

---

## Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Shift` + `Space` | Insert a word space (Khmer layouts) |
| `Alt` + `F` | Toggle Focus Mode |
| `Esc` | Exit Focus Mode / close modals |
| `Shift` (hold) | Switch to Shift layer |
| `Ctrl` (hold) | Switch to Ctrl layer |
| `AltGr` (hold) | Switch to AltGr layer |
| `Caps Lock` | Toggle uppercase (English layout) |

---

## Project Structure

```text
PK-Khmer-Type/
├── index.html              # Main page
├── manifest.json           # PWA manifest
├── sw.js                   # Service Worker (offline support)
│
├── css/
│   ├── base.css            # Variables, themes, modals, fonts
│   ├── keyboard.css        # Key grid, modifier layers, hand overlay
│   ├── typing.css          # Manuscript area, caret, race UI
│   ├── lessons.css         # Lesson sidebar, level accordion, cards
│   └── responsive.css      # Mobile, tablet, desktop breakpoints
│
├── js/
│   ├── app.js              # Bootstrap, data loader, PWA setup
│   ├── keyboard.js         # Layouts, key mapping, hand kinematics
│   ├── typing.js           # Keystroke capture, IME shaping, feedback
│   ├── lessons.js          # Lesson engine, progression, remedial drills
│   ├── race.js             # Temple Trial & Typing Race mode
│   ├── statistics.js       # WPM, accuracy, achievements, mastery
│   ├── settings.js         # Themes, audio, focus mode, localization
│   ├── storage.js          # localStorage, progress export/import
│   └── icons.js            # Inline SVG icon library
│
└── data/
    ├── keyboard.json        # Layout definitions, key codes, finger maps
    ├── lessons.json         # All lesson & level definitions (all layouts)
    └── typing-content.json  # Word banks and race configurations
```

---

## Tech Stack

- **HTML5** — Semantic, accessible markup (WAI-ARIA)
- **CSS3** — Grid, Flexbox, custom properties, backdrop filters
- **Vanilla JS (ES6+)** — Zero dependencies, modular, fast
- **Web Audio API** — Procedural key sounds, no audio files
- **SVG** — Scalable icons and hand overlay graphics

---

## Author

**Phanna Kurosaki** — Student Developer, EST. 2026  
Free Khmer typing education for students and learners worldwide. 🇰🇭
