# PK Khmer Type — ក្តារចុចខ្មែរ PK

<p align="center">
  <img src="https://img.shields.io/badge/Language-Khmer%20%7C%20English-00f5c4?style=for-the-badge" alt="Bilingual">
  <img src="https://img.shields.io/badge/React-UI-61dafb?logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/Vite-build-646cff?logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/Tailwind-CSS-38bdf8?logo=tailwindcss&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Curriculum-218%20lessons-f0b44d" alt="218 lessons">
</p>

<p align="center">
  <b>Learn Khmer and English typing through real lessons, live keyboard feedback, and focused practice.</b><br>
  រៀនវាយអក្សរខ្មែរ និងអង់គ្លេស តាមរយៈមេរៀន ការបង្ហាញក្តារចុច និងការហ្វឹកហាត់ជាក់ស្តែង។
</p>

---

## A Better Way to Practice

PK Khmer Type is a browser-based typing tutor for **Khmer Standard, Khmer NiDA, and English US QWERTY**. Practice with a visual keyboard, track your progress, and switch between guided lessons, adaptive drills, and typing races.

The curriculum is stored as layout-specific JSON, while learner settings and progress are saved locally in the browser.

---

## Features

| Feature | Details |
| :--- | :--- |
| 🎹 **3 Keyboard Layouts** | Khmer Standard, Khmer NiDA, English US QWERTY |
| 📚 **Structured Curriculum** | 218 lessons and 664 exercises across three keyboard layouts |
| 🤲 **Animated Finger Guide** | Live hand overlay shows which finger to use for every key |
| 🏁 **Temple Trial / Race Mode** | Speed drills and competitive typing race with bot pacers |
| 🔁 **Adaptive Remedial Drills** | Auto-detects weak keys and builds targeted review exercises |
| 🔇 **Focus Mode** | Hides sidebars and distractions for deep practice sessions |
| 🔊 **Web Audio Sounds** | Mechanical key click and chime effects — no audio files needed |
| 💾 **Progress Saving** | Auto-saves to `localStorage`; export/import JSON backup |
| 📱 **Legacy Offline Mode** | Open the legacy experience directly from `index.html` without a dev server |

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
| Khmer Standard | `Space` = Coeng (`្`) |
| Khmer NiDA | `Shift` + `J` = Coeng (`្`) |

> Example (Standard): `ក` + `Space` + `ខ` = **`ក្ខ`**

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
| Khmer Standard | 13 | 77 |
| Khmer NiDA | 13 | 77 |
| English US | 14 | 64 |

**Combined:** 40 levels, 218 lessons, and 664 exercises.

The lesson list follows the selected keyboard layout, marks completed lessons, and keeps progress separate for each course.

---

## Run the App

### React App (Recommended)

Requires Node.js and npm. Install dependencies, then start the Vite development server:

```sh
npm install
npm run dev
```

Vite prints the local URL in the terminal, usually `http://localhost:5173`.

### Build and Validate

```sh
npm run build
npm run validate
```

`npm run validate` checks curriculum integrity, legacy JavaScript syntax, and the production build. To inspect a production build locally, run `npm run preview` after building.

### Open the Legacy Experience

Opening the repository's `index.html` directly (`file://`) redirects to `public/legacy.html`. The React/Vite app should be run through Vite, not opened as a local file.

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

## How It’s Organized

```text
.
├── index.html                  # Vite entry; routes file:// users to legacy
├── package.json                # Scripts and dependencies
├── vite.config.mjs             # React plugin and build config
├── tailwind.config.js          # Tailwind content paths
├── src/
│   ├── App.jsx                 # App shell and view routing
│   ├── main.jsx                # React entry point
│   ├── components/             # Keyboard, lessons, typing, adaptive, race, stats, settings
│   ├── hooks/                  # Typing session and progress state
│   ├── logic/                  # Shared application logic
│   └── storage/                # Progress, settings, adaptive state
├── data/
│   ├── keyboard.json           # Keyboard layouts and glyph mappings
│   └── curriculum/{layout}/    # levels.json, lessons.json, exercises.json
├── public/
│   ├── legacy.html             # Direct-file legacy experience
│   └── assets/                 # Public static assets
├── scripts/                    # Curriculum generation and validation
├── css/                         # Legacy application styles
└── js/                          # Legacy application modules
```

---

## Built With

- **React** for the interactive application UI
- **Vite** for local development and production builds
- **Tailwind CSS** for utility-first styling
- **JSON** for keyboard layouts and curriculum content
- **Browser storage** for learner progress and preferences

---

## Contributing

Issues and contributions are welcome. Before submitting a change, run `npm run validate` and include a clear description of the behavior changed.

## Credits

Created by **Phanna Kurosaki** to make Khmer typing education more accessible.

