# PK Khmer Type — ក្តារចុចខ្មែរ PK

<p align="center">
  <img src="logo.svg" alt="PK Khmer Type Logo" width="72" height="72">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Language-Khmer%20%7C%20English-ffd166?style=for-the-badge" alt="Bilingual Khmer & English">
  <img src="https://img.shields.io/badge/Engine-Vanilla%20ES6%2B%20%7C%20CSS3-ff9d2e?style=for-the-badge" alt="Vanilla JS & CSS3">
  <img src="https://img.shields.io/badge/Audio-Web%20Audio%20Synth-2dd4a7?style=for-the-badge" alt="Web Audio Synthesizer">
  <img src="https://img.shields.io/badge/Curriculum-40%20Levels%20%7C%20218%20Lessons-38bdf8?style=for-the-badge" alt="218 Lessons">
</p>

<p align="center">
  <b>Master Khmer Standard, Khmer NiDA, and English QWERTY typing through structured lessons, 3D kinematic hand guides, real-time audio synthesis, and adaptive drills.</b><br>
  រៀនវាយអក្សរខ្មែរ (Standard & NiDA) និងអង់គ្លេស តាមរយៈមេរៀនតាមលំដាប់លំដោយ មគ្គុទ្ទេសក៍ម្រាមដៃ 3D និងការហ្វឹកហាត់ឆ្លាតវៃ។
</p>

---

## Overview

**PK Khmer Type** is a standalone, zero-dependency browser typing studio built specifically for mastering the Khmer abugida script (**Khmer Standard** and **Official Khmer NiDA**) alongside **English (US) QWERTY**.

Designed to run effortlessly both **online via any static server** and **100% offline directly from `index.html` (`file:///`)**, it combines a 218-lesson progressive curriculum with a customizable mechanical keyboard studio, transparent glassmorphism themes, and per-key mastery analytics.

---

## Key Features

| Feature | Description |
| :--- | :--- |
| **3 Complete Keyboard Layouts** | Instant switching between **Khmer Standard**, **Khmer NiDA**, and **English (US) QWERTY** (`Alt + 1/2/3`). |
| **218-Lesson Curriculum** | **40 structured levels**, **218 lessons**, and **664+ exercises** built with strict progressive key unlocking (no unseen characters in early drills). |
| **Dual-Hand 3D Kinematic Guide** | Translucent left and right hand overlays dynamically reach toward target keys and simultaneous modifier keys (`Shift`, `Ctrl`, `AltGr`). |
| **Smart Mouse Cursor Inspector** | Hover over any keycap or Khmer character to inspect its Unicode breakdown, keystroke recipe, and phonetic details (`Alt + M`). |
| **Settings & Command Studio** | Searchable 40+ control command center with instant presets (*Default, Pro Typist, Full Immersion, Battery Saver*). |
| **8 Studio Themes & Glassmorphism** | Choose from *Dark, Temple, Moonlight, Jungle, Sunset, Sepia, Light,* or *System*, plus custom background wallpaper support with frosted transparent glass (`backdrop-filter: blur(5px)`). |
| **Web Audio Switch Synthesizer** | Real-time procedural mechanical switch audio (*Topre Thock, Holy Panda Tactile, Cherry MX Blue, Silent Linear*) and Temple Ambience — zero external audio files required. |
| **Adaptive Practice & Weak-Key Review** | Tracks per-key latency and error rates to automatically generate personalized remedial drills and spaced repetition reviews. |
| **Temple Trial & Typing Race** | Timed vocabulary survival mode and competitive typing races against adaptive bot pacers with local leaderboards. |
| **Bilingual UI (`English` / `ភាសាខ្មែរ`)** | Toggle the entire interface, menus, tooltips, and quick guides between English and Khmer at any time (`Alt + L`). |
| **PK Documents & 3D Studio** | Built-in interactive Khmer script reference guide and Three.js 3D mechanical keycap studio (`Documents/index.html`). |
| **Offline `file:///` Ready** | Pre-bundled curriculum (`data/curriculum-data.js`) allows opening `index.html` directly from your filesystem without CORS errors. |

---

## How Khmer Typing Works

Khmer is an **abugida** script where vowels and subscripts attach around a base consonant. Following these core rules makes typing natural:

### 1. Base Consonant First
Always type the base consonant before its dependent vowel or diacritic — even if the vowel appears to the left, top, or bottom visually.
> **Example:** `ក` (`K`) + `េ` (`E`) → **`កេ`**

### 2. Subscript Consonants (`ជើងអក្សរ` — Coeng `្`)
To stack a subscript consonant beneath a base consonant, press the **Coeng key** first, followed by the second consonant:

| Keyboard Layout | Coeng (`្`) Trigger | Example (`ក្ខ`) |
| :--- | :--- | :--- |
| **Khmer Standard** | `Space` | `ក` + `Space` + `ខ` = **`ក្ខ`** |
| **Khmer NiDA** | `Shift` + `J` (`្`) | `ក` + `Shift+J` + `ខ` = **`ក្ខ`** |

### 3. Visible Word Space (`Shift + Space`)
> **Important:** In Khmer layouts, plain `Space` types the Coeng subscript marker (`្`) on Khmer Standard or Zero-Width Space on NiDA.  
> Always press **`Shift + Space`** to insert a visible space between clauses or words.

### 4. Four Modifier Layers
Each keyboard layout supports up to 4 live layers that can be previewed by hovering or holding the modifier keys:

| Layer | Activation | Typical Contents |
| :--- | :--- | :--- |
| **Base** | Normal typing | Primary consonants, common dependent vowels |
| **Shift** | Hold `Shift` | Voiced consonants (`ឃោសៈ`), secondary vowels, diacritics |
| **Ctrl** | Hold `Ctrl` | Currency symbols, punctuation, independent vowels |
| **AltGr** | Hold `AltGr` (Right Alt) | Khmer numerals, lunar date symbols, specialized marks |

*(Includes native Windows OS `AltGr` filtering so holding physical `AltGr` cleanly activates only the `AltGr` layer without ghost-triggering `Ctrl`.)*

---

## Curriculum Breakdown

Each layout maintains independent progress, mastery stars, WPM records, and unlock states:

| Course Track | Levels | Lessons | Exercises | Focus Progression |
| :--- | :---: | :---: | :---: | :--- |
| **Khmer Standard** | 13 | 77 | 235+ | Home row anchors → Consonants → Dependent vowels → Coeng clusters → Shift layer → Numerals & prose |
| **Khmer NiDA** | 13 | 77 | 235+ | Official NiDA home row → Vowel combinations → Subscript stacks → Independent vowels → Full texts |
| **English (US)** | 14 | 64 | 194+ | Home row (`ASDF JKL;`) → Top & bottom rows → Capitalization → Numbers & symbols → Speed paragraphs |
| **Total** | **40** | **218** | **664+** | **Complete zero-to-fluent mastery across all three layouts** |

---

## Getting Started

### Option 1: Open Directly (Offline / No Install)
Simply double-click **`index.html`** in any modern browser (Edge, Chrome, Brave, Firefox, Safari). All 218 lessons and audio synthesizers work out of the box via `file:///`.

### Option 2: Run Local Development Server
If you have **Node.js** installed, you can launch the included zero-cache static development server:

```sh
node scripts/dev_server.js
```

Then open **`http://localhost:5174/`** in your browser.

### Curriculum Validation & Bundling
When editing curriculum JSON files inside `data/curriculum/`, run the validation and bundling scripts:

```sh
# Validate all 3 curricula for schema integrity and character progression
node scripts/validate_curriculum.js

# Re-bundle JSON files into data/curriculum-data.js for offline file:// support
node scripts/bundle_curricula.js
```

---

## Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Shift` + `Space` | Insert visible space (Khmer Standard & NiDA) |
| `Alt` + `F` | Toggle **Focus Mode** (hide sidebars & distractions) |
| `Alt` + `L` | Toggle **Interface Language** (English ↔ Khmer) |
| `Alt` + `M` | Toggle **Smart Mouse Cursor Inspector** |
| `Alt` + `S` | Open **Settings & Studio** |
| `?` | Open **Keyboard Shortcuts** cheat sheet |
| `Esc` | Close active modal / exit lesson / exit Focus Mode |

---

## Project Structure

```text
.
├── index.html                      # Main application shell
├── manifest.json                   # PWA manifest metadata
├── logo.svg                        # PK Khmer Type vector crest
├── css/
│   ├── base.css                    # Core layout, themes (Dark/Light/Sepia/etc.), glassmorphism
│   ├── keyboard.css                # Keycaps, 3D hand overlay, and mechanical key animations
│   ├── typing.css                  # Manuscript prompt, character states, and haptic shake
│   ├── lessons.css                 # Lesson dock, level accordions, completion modals
│   ├── settings.css                # Settings & Studio command center styles
│   └── responsive.css              # Tablet and mobile responsive breakpoints
├── js/
│   ├── app.js                      # Application bootstrap and data loader
│   ├── keyboard.js                 # Keyboard rendering, layer switching, 3D hand kinematics
│   ├── typing.js                   # Input engine, Windows AltGr filter, Web Audio synth
│   ├── lessons.js                  # Curriculum runner, exercise grading, mistake review
│   ├── adaptive.js                 # Adaptive practice generator and key mastery engine
│   ├── review.js                   # Spaced repetition & weak-key detector
│   ├── race.js                     # Temple Trial & Typing Race mode with bot pacers
│   ├── cursor-inspector.js         # Smart Mouse Cursor Inspector & HUD
│   ├── settings.js                 # 40+ studio settings, themes, custom wallpaper manager
│   ├── statistics.js               # WPM, accuracy, streak, and level progress analytics
│   ├── shortcuts.js                # Global keyboard shortcuts & modal navigation
│   ├── progress.js                 # Lesson unlock state and star rating logic
│   ├── tracker.js                  # Per-key stroke telemetry
│   ├── storage.js                  # LocalStorage persistence, JSON export/import
│   ├── feedback.js                 # Toast notifications and particle effects
│   └── icons.js                    # Inline SVG icon registry
├── Documents/
│   ├── index.html                  # PK Documents & 3D Mechanical Keycap Studio
│   ├── docs.css / docs.js          # Interactive Khmer orthography documentation
│   └── keycap3d.js / three.min.js  # Three.js interactive 3D mechanical switch viewer
├── data/
│   ├── keyboard.json               # Full keycap mappings for Standard, NiDA, and English
│   ├── curriculum-data.js          # Pre-bundled curriculum for offline file:// execution
│   ├── adaptive-vocab.js           # Vocabulary bank for adaptive drills
│   └── curriculum/
│       ├── standard/               # levels.json, lessons.json, exercises.json
│       ├── nida/                   # levels.json, lessons.json, exercises.json
│       └── english/                # levels.json, lessons.json, exercises.json
└── scripts/
    ├── dev_server.js               # Zero-cache local HTTP server (port 5174)
    ├── validate_curriculum.js      # Automated curriculum audit & validation suite
    └── bundle_curricula.js         # Bundles JSON curricula into data/curriculum-data.js
```

---

## Credits

Founded, designed, and built by **Phanna Kurosaki** to make Khmer and English typing education accessible, modern, and enjoyable for everyone.
