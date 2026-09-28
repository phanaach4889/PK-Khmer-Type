# PK KHMER TYPE — LESSON OVERHAUL IMPLEMENTATION MASTER PLAN
**Target Codebase:** PK Khmer Type (`idk`)  
**Status:** ARCHITECTURAL MASTER PLAN — EXPANDED & IMPLEMENTATION-READY  
**Single Source of Truth:** `lesson_overhaul_plan.md`  

---

## 0. EXECUTIVE SUMMARY & SCOPE

**What this plan is:** The complete curriculum architecture (218 lessons across English US, Khmer NiDA, and Khmer Standard) is content-complete and machine-validated (Phases 1–9). This document is the single source of truth for (a) how that curriculum is structured and taught, and (b) the remaining engineering work — checkpoint gatekeeping, practice-mode expansion, Khmer adaptive parity, localization, verification, and release (Phases 10–15) — required to ship it.

**What "better and stronger" means for this revision:** the original plan was strong on *what* to build but underspecified on *how much it costs*, *what could go wrong*, and *how we'll know it worked*. This revision adds four things without changing any existing pedagogical or architectural decision:
- A **Risk Register** (Section 16) naming the specific ways this plan could fail and the mitigation for each.
- **Effort estimates and a critical-path timeline** (Section 15) so sequencing decisions are auditable, not just diagrammed.
- **Post-launch Success Metrics** (Section 17), separate from the engineering Definition of Done, so "shipped" and "working for learners" are not conflated.
- A **Rollout & Release Strategy** (Section 18) covering schema versioning, staged rollout of the new checkpoint gate, and rollback — because Phase 10 changes what "locked" means for lessons real users have already completed.

It also resolves every item in the former "Unknowns & Open Questions" list into an explicit decision (Section 15.3), and tightens the testing matrix and Definition of Done to cover the failure modes named in the Risk Register.

**This revision adds one more thing:** a complete, letter-by-letter **Character Coverage Ledger (Appendix B)** consolidating every character across all three layouts — every English letter, digit, and symbol; all 33 Khmer consonants; every dependent and independent vowel; every diacritic — into one auditable table with the level that introduces each one. Building that ledger surfaced a real finding, not just a formatting improvement: **17 Khmer vowels are never individually named anywhere in the original plan**, which means Section 11's "Full Glyph Coverage" validation gate cannot have been meaningfully exercised against them. This is now tracked as **Risk R8** and **Definition of Done item 14**, and should be checked against the real `data/keyboard.json` before Phase 10 locks in checkpoint content — a curriculum that gates learners on ≥90% accuracy should not be doing so on top of an unverified character set.

### Non-Goals (Explicit Exclusions)
To keep this plan executable, the following are **out of scope** for Phases 10–15 unless a future revision states otherwise:
- **No new keyboard layouts.** English (US), Khmer NiDA, and Khmer Standard remain the complete set; adding e.g. a Khmer mobile/Telex layout is a separate proposal.
- **No server-side or account-based progress sync.** Progress remains 100% local (`localStorage`), per the resolution in Section 15.3.
- **No new lesson content beyond the existing 218 lessons** as part of Phases 10–15. These phases harden, gate, localize, and test the existing curriculum; they do not expand it. (Word-bank and race-text *expansion* in Phase 11 is practice-mode content, not curriculum lessons, and is bounded by the targets in that phase's spec.)
- **No monetization, accounts, or social features** — a shared cloud leaderboard is explicitly deferred (Section 15.3, Decision 1).
- **No redesign of the 10-stage pedagogical model** (Section 4). It is treated as validated and fixed for this release cycle.

---

## 1. CURRENT SYSTEM SUMMARY & ARCHITECTURAL FOUNDATION

PK Khmer Type currently supports three keyboard layouts: **English US (QWERTY)**, **Khmer NiDA**, and **Khmer Standard**. The curriculum architecture operates as a data-driven pipeline with instant offline hydration:

```mermaid
flowchart TD
    subgraph StaticData ["Data Layer (data/ & data/curriculum/)"]
        CD["data/curriculum-data.js (Pre-bundled Zero-Latency Cache)"]
        EN_JSON["data/curriculum/english/*.json"]
        NIDA_JSON["data/curriculum/nida/*.json"]
        STD_JSON["data/curriculum/standard/*.json"]
    end

    subgraph BrowserRuntime ["Browser Runtime (js/lessons.js)"]
        BL["Bundled Data Loader (initCurriculumFromBundle)"]
        NET_LOAD["Async Network Hydration (loadAllCurricula)"]
        CM["Lesson Model Factory (createLessonModel)"]
        LS["LESSONS_STANDARD"]
        LN["LESSONS_NIDA"]
        LE["LESSONS_ENGLISH"]
        RUN["Lesson Runner, Input Processor & UI Strip"]
    end

    subgraph Engines ["Engine & State Subsystems"]
        PR["Progress & Persistence (js/progress.js - khmerProgressData_v2)"]
        AD["Adaptive Practice (js/adaptive.js - pk_adaptive_state_v1)"]
        RV["Targeted Review Engine (js/review.js)"]
        KB["Keyboard Physics & Kinematics (js/keyboard.js & data/keyboard.json)"]
        TK["Keystroke Tracker (js/tracker.js)"]
    end

    CD --> BL
    EN_JSON -.-> NET_LOAD
    NIDA_JSON -.-> NET_LOAD
    STD_JSON -.-> NET_LOAD
    BL --> CM
    NET_LOAD --> CM
    CM --> LS
    CM --> LN
    CM --> LE
    LS --> RUN
    LN --> RUN
    LE --> RUN
    RUN <--> PR
    RUN <--> KB
    RUN --> TK
    TK --> RV
    AD -.->|Isolated Session & State| KB
```

### Core Subsystems and Strict Boundaries:
1. **Curriculum Data Sources (`data/curriculum/`):**
   - Clean, modular JSON definitions partitioned by layout: `data/curriculum/{english,nida,standard}/` containing `levels.json`, `lessons.json`, and `exercises.json`.
   - `data/curriculum-data.js`: Pre-bundled zero-latency file declaring `window.CURRICULUM_DATA = { standard, nida, english }`. Enables instantaneous startup offline and via `file:///` protocol without CORS blocks.
2. **Lesson Execution Engine (`js/lessons.js`):**
   - Calls `initCurriculumFromBundle()` during initialization.
   - Converts serialized JSON lesson models into runtime objects via `createLessonModel()`.
   - Splits exercise content into typing units via `splitIntoTypingUnits(content, layoutId)`.
   - Resolves characters to physical keys and modifier layers via `resolveCharLocation()`.
   - Dynamically renders level accordions, lesson cards, mastery stars, lock icons, and progress meters.
3. **Progression & Persistence Subsystem (`js/progress.js`):**
   - Stores per-layout records in `state.courses = { standard, nida, english }`.
   - Saves to `localStorage` under `khmerProgressData_v2` and legacy compatibility keys `khmerLessonBest_<id>`.
   - Manages unlocking via `isLessonLocked(id)`: Lesson $N$ unlocks when Lesson $N-1$ has recorded at least one completion attempt.
4. **Adaptive Practice Boundary (`js/adaptive.js`):**
   - Completely autonomous, letter-mastery-driven engine tracking 20 units/letter mastery under `pk_adaptive_state_v1`.
   - Fixed English progression sequence (`E N I A R L...`).
   - Mutual session suspension: Launching standard curriculum calls `PK_ADAPTIVE.exitSession(false)`; entering Adaptive Practice suspends curriculum lessons.
5. **Targeted Review Subsystem (`js/review.js`):**
   - Monitors learner stats across layouts. Flags keys with accuracy $< 85\%$ or staleness $> 7$ days.
   - Supplies targeted drilling based on telemetry in `PK_TRACKER` and `PK_PROGRESS`.

---

## 2. LESSON INVENTORY & STRUCTURAL BASELINE

The curriculum baseline encompasses 218 lessons structured across all three layouts:

| Layout | Levels | Lessons | Exercises | Total Units | Avg Units/Lesson | % Below 80 Units | Key Focus Areas |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **English (US)** | 14 | 64 | 204 | 6,159 | **96.2** | **0%** | Anchors, home row, reaches, vowels, full alphabet, Shift capitals, numbers, symbols, paragraphs, timed challenges. |
| **Khmer NiDA** | 13 | 77 | 230 | 7,222 | **93.8** | **0%** | Anchors (ថ/ក), home consonants, ើ/់, top reaches, bottom reaches, Shift+J Coeng (`្`), Shift consonants, Shift vowels, clusters, diacritics, vocabulary, Shift+Space prose, AltGr independent vowels. |
| **Khmer Standard** | 13 | 77 | 230 | 7,417 | **96.3** | **0%** | Spacebar Coeng (`្`), ះ on Semicolon, Shift vowels (ៃ, ាំ, ុះ, ៏, ុំ), bottom reaches (អ on comma), Spacebar subscript clusters, Shift consonants, diacritics, sentences. |
| **Combined** | **40** | **218** | **664** | **20,798** | **95.4** | **0%** | Complete three-layout coverage meeting substantial practice standards. |

---

## 3. CORE PEDAGOGICAL PHILOSOPHY: MANY SHORT FOCUSED LESSONS

The curriculum rejects both "microscopic 10-second lessons" and "fatiguing 300-word endurance marathons." The curriculum adheres to the **Focused Micro-Drilling Principle**:

```
Small New Skill → Target Finger Isolation → Known-Key Rhythm → Combination Pairs → Real Vocabulary → Spaced Review → Checkpoint → Next Step
```

### Educational Principles:
1. **Explicit Purpose for Every Lesson:**
   - Every lesson must answer:
     - *What physical key/finger skill is introduced?*
     - *Why does it appear at this point in the motor sequence?*
     - *What dictionary words or orthographic patterns are now unlocked?*
     - *What immediate next skill does it prepare the learner for?*
2. **Strict Cognitive Budget (Small Increments):**
   - Introduce at most **1 or 2 new keys/characters** in a non-review lesson.
   - Never introduce multiple modifier layers or complex cluster mechanics in a single introductory lesson.
3. **Substantial Practice Without Senseless Padding:**
   - Single-key & introductory lessons: **80–120 keystroke units** (approx. 35–50 seconds).
   - Word & combination lessons: **120–160 keystroke units** (approx. 50–75 seconds).
   - Review & checkpoint lessons: **150–220 keystroke units** (approx. 70–100 seconds).
   - Paragraph & timed endurance lessons: **200–350 keystroke units** (approx. 90–150 seconds).
   - **Anti-Padding Rule:** Never repeat raw unspaced characters (`ffffffffffff`). Drill variation must use structured companion pairs (`fjf jfj ff jj`), anchor alternations, and natural syllables.

---

## 4. THE 10-STAGE PROGRESSIVE CURRICULUM ARCHITECTURE

Each level advances through a 10-stage difficulty ladder. Not every individual lesson contains all 10 stages; stages are distributed purposefully across the level:

```mermaid
flowchart TD
    S1["1. INTRODUCE<br>(Physical Target & Finger)"] --> S2["2. ISOLATE<br>(Single-Key Cadence)"]
    S2 --> S3["3. PAIR WITH ANCHORS<br>(Alternate Hand Rhythm)"]
    S3 --> S4["4. COMBINE WITH KNOWN<br>(Bigrams & Trigrams)"]
    S4 --> S5["5. PATTERN PRACTICE<br>(Kinematic Roll & Reaches)"]
    S5 --> S6["6. SHORT WORDS<br>(Valid Dictionary Words)"]
    S6 --> S7["7. MIXED STRINGS<br>(Phrases & Flow)"]
    S7 --> S8["8. SPACED REVIEW<br>(Decay Mitigation)"]
    S8 --> S9["9. CHECKPOINT<br>(Milestone Gate)"]
    S9 --> S10["10. MASTERY CHALLENGE<br>(Speed & Accuracy Test)"]
```

### Functional Breakdown of the 10 Stages:
1. **Stage 1 — Introduce:** Visual presentation of key position, finger assignment (`li`, `lm`, `lr`, `lp`, `ri`, `rm`, `rr`, `rp`, `thumb`), layer requirement, and tactile guide.
2. **Stage 2 — Isolate:** Single-finger taps, double taps, and deliberate reset to home-row rest positions.
3. **Stage 3 — Pair with Anchors:** Rapid alternating strokes with the opposite-hand index anchor (`F` and `J` in English; `ថ` and `ក` in Khmer).
4. **Stage 4 — Combine with Known:** Systematic pairing with all previously unlocked characters (e.g., if `D` and `K` are known, drill `fd`, `df`, `jk`, `kj`, `dk`, `kd`).
5. **Stage 5 — Pattern Practice:** Ergonomic finger rolls, inside-out cascades, and multi-finger coordination drills.
6. **Stage 6 — Short Words:** Authentic dictionary words formed strictly from the cumulative unlocked character pool. Zero nonsense strings.
7. **Stage 7 — Mixed Strings & Phrases:** Contextual typing featuring realistic short phrases, natural word boundaries (`Space` or `Shift+Space`), and terminal punctuation.
8. **Stage 8 — Spaced Review:** Explicit reintroduction of older characters learned in earlier levels to combat motor memory decay.
9. **Stage 9 — Checkpoint:** Focused assessment requiring $\ge 90\%$ accuracy before level advancement.
10. **Stage 10 — Mastery Challenge:** Timed endurance challenge consolidating all material learned across the level and preceding stages.

---

## 5. ENGLISH US CURRICULUM PROGRESSION

Preserves the natural home-row outward motor progression while guaranteeing that every word exercise uses verified English vocabulary:

```mermaid
graph TD
    subgraph EnglishMotorSequence ["English Progression Ladder"]
        L0["Level 0: Anchors (F, J, Space)"] --> L1["Level 1: Core Middle & Ring (D, K, S, L)"]
        L1 --> L2["Level 2: Pinkies (A, ;) & First Words"]
        L2 --> L3["Level 3: Center Reaches (G, H) & Home Checkpoint"]
        L3 --> L4["Level 4: High Vowels & Index Reaches (E, I, R, U)"]
        L4 --> L5["Level 5: Top Perimeter (T, Y, W, O, Q, P) & Top Checkpoint"]
        L5 --> L6["Level 6: Bottom Row & Punctuation (C, V, B, N, M, Z, X, Comma, Period)"]
        L6 --> L7["Level 7: Full Alphabet Consolidation & Pangrams"]
        L7 --> L8["Level 8: Shift Layer & Capitalization Coordination"]
        L8 --> L9["Level 9: Top Number Row (1–0)"]
        L9 --> L10["Level 10: Punctuation, Quotes, Hyphens & Brackets"]
        L10 --> L11["Level 11: Connected Prose & Complete Sentences"]
        L11 --> L12["Level 12: Continuous Multi-Sentence Paragraphs"]
        L12 --> L13["Level 13: Timed Speed Endurance & Keyboard Mastery"]
    end
```

### Cumulative Vocabulary Gating Rules for English:
- **Level 0 (F, J, Space):** Only tactile rhythm and anchor pairs (`fff jjj fjf jfj`). No English words exist with only F and J.
- **Level 1 (add D, K, S, L):** Hand coordination drills. No complete words without vowels.
- **Level 2 (add A, ;):** **First English Words Unlocked:** `as`, `ask`, `sad`, `dad`, `fall`, `lass`, `flask`, `salad`, `all`, `add`, `alas`, `falls`, `dads`, `lads`, `sass`.
- **Level 3 (add G, H):** **Vocabulary Expanded:** `glad`, `flag`, `half`, `hall`, `dash`, `flash`, `glass`, `shall`, `hash`, `gash`, `had`, `has`, `gall`, `ash`.
  - *Checkpoint 1:* 120-unit comprehensive home-row assessment.
- **Level 4 (add E, I, R, U):** **Vowel Vocabulary Explosion:** `see`, `red`, `ride`, `fire`, `dear`, `sure`, `rule`, `rise`, `sir`, `lid`, `like`, `side`, `idle`, `rude`, `hire`, `drill`, `risk`, `skill`, `dark`, `fear`, `hear`, `safe`, `feed`, `seed`.
- **Level 5 (add T, Y, W, O, Q, P):** **Full Top Row Words:** `type`, `word`, `work`, `quit`, `play`, `power`, `write`, `poetry`, `water`, `story`, `quiet`, `quote`, `sweet`, `today`, `reply`, `people`, `proper`.
  - *Checkpoint 2:* Home + Top row cross-layer examination.
- **Level 6 (add C, V, B, N, M, Z, X, Comma, Period):** **Full Lower Row Vocabulary:** `can`, `come`, `back`, `been`, `make`, `name`, `much`, `move`, `seven`, `never`, `cover`, `number`, `voice`, `brave`, `cabin`, `complex`, `examine`, `zero`, `buzz`, `extra`. Punctuation cadence (`one, two, three.`).
- **Level 7 to Level 13:** All 26 letters active. Pangrams, capitalization, numbers, full punctuation, sentences, multi-sentence paragraphs, and 3-minute timed tests.

---

## 6. KHMER NiDA CURRICULUM SPECIFICATION

Khmer NiDA must be taught strictly according to Cambodian typing conventions and Unicode grapheme cluster mechanics:

```mermaid
graph TD
    subgraph NiDAProgression ["Khmer NiDA Curriculum Architecture"]
        N0["Level 0: Anchors (ថ on F, ក on K, Space)"] --> N1["Level 1: Home Consonants & ស្រៈ ា (A)"]
        N1 --> N2["Level 2: Home Vowel ើ (;) & Bantoc ់ (')"]
        N2 --> N3["Level 3: High-Frequency Top Row (េ, រ, ត, យ, ុ, ិ, ោ)"]
        N3 --> N4["Level 4: High-Frequency Bottom Row (ច, វ, ប, ន, ម, ។)"]
        N4 --> N5["Level 5: Remaining Base Keys & Coeng Key (Shift+J = ្)"]
        N5 --> N6["Level 6: Shift Consonants (គ, ជ, ទ, ធ, ព, ភ, ឌ, ណ, អ, ឃ...)"]
        N6 --> N7["Level 7: Shift Vowels & Dedicated Compound Vowels"]
        N7 --> N8["Level 8: Consonant Clusters & Advanced Coeng Practice"]
        N8 --> N9["Level 9: Diacritics, Numerals & Currency (៉, ៊, ៍, ៏, ័, ៌, ៛, ៗ)"]
        N9 --> N10["Level 10: Rich Khmer Vocabulary by Semantic Domain"]
        N10 --> N11["Level 11: Connected Prose with Shift+Space Word Separation"]
        N11 --> N12["Level 12: Independent Vowels & Professional Speed Mastery"]
    end
```

### Orthographic Typing Mechanics to Enforce:
1. **The Coeng (Subscript) Keystroke Sequence:**
   - In NiDA, the subscript character `្` (U+17D2) is located at **`Shift + J`**.
   - Keystroke sequence: **Base Consonant $\rightarrow$ `Shift + J` (្) $\rightarrow$ Subscript Consonant**.
   - Example: `ខ្លា` = `ខ` (X) + `Shift+J` (្) + `ល` (L) + `ា` (A).
2. **Dedicated Compound Vowel Keys (No Splitting):**
   - Vowels such as `ាំ` (Shift+A), `ុំ` (Comma), `ុះ` (Shift+Comma), `េះ` (Shift+V), and `ោះ` (Shift+;) are dedicated physical keys. The curriculum must teach them as single keystrokes rather than constructed multi-part characters.
3. **Final Consonant Shortening with Bantoc:**
   - Consonant + `់` (Quote key) shortens vowel sounds (`កាក់`, `ដាក់`, `សក់`).
4. **Logical Keystroke Order vs. Visual Placement:**
   - In Khmer orthography, vowels like `េ` (E) or `ែ` (Shift+E) display to the left of the consonant, but **mechanically they are always typed AFTER the base consonant** (or cluster).
   - The curriculum explicitly trains: Consonant $\rightarrow$ Subscript $\rightarrow$ Vowel.
5. **Word Separation with Shift+Space:**
   - In NiDA typing, base Space produces a Zero-Width Space (`\u200B`), while **`Shift + Space`** produces the visible space separator `' '` used for typing exercises.

---

## 7. KHMER STANDARD CURRICULUM SPECIFICATION

Khmer Standard layout features fundamentally different key placements and typing mechanics from NiDA. The curriculum must never treat Standard as a clone of NiDA:

### Detailed Physical Comparison: Standard vs. NiDA
| Key / Symbol | Khmer NiDA | Khmer Standard | Pedagogical Consequence for Standard |
| :--- | :--- | :--- | :--- |
| **Coeng (`្`)** | **`Shift + J`** | **`Space` (Base Layer Thumb!)** | **Core Skill:** In Standard, the thumb spacebar produces the Coeng subscript marker! |
| **Word Space** | `Shift + Space` | `Shift + Space` | Both use Shift+Space for visible word boundaries, but base space is Coeng in Standard. |
| **Key `J`** | Base `ញ`, Shift `្` | Base `ញ`, Shift `ុំ` | Key `J` has compound `ុំ` on Shift in Standard, never Coeng. |
| **Key `;`** | Base `ើ`, Shift `ោះ` | Base `ះ`, Shift `៖` | `ះ` is on Semicolon in Standard (taught in Level 2 instead of Level 7). |
| **Key `[`** | Base `ៀ`, Shift `ឿ` | Base `ើ`, Shift `ោះ` | `ើ` and `ោះ` are moved to left bracket in Standard. |
| **Key `]`** | Base `ឪ`, Shift `ឧ` | Base `ឿ`, Shift `ៀ` | `ៀ` and `ឿ` are on right bracket in Standard. |
| **Key `A`** | Base `ា`, Shift `ាំ` | Base `ា`, Shift `ៃ` | Shift+A produces `ៃ` in Standard. |
| **Key `S`** | Base `ស`, Shift `ៃ` | Base `ស`, Shift `ាំ` | Shift+S produces `ាំ` in Standard. |
| **Key `,`** | Base `ុំ`, Shift `ុះ` | Base `អ`, Shift `,` | Consonant `អ` is on comma in Standard (introduced in Level 4 Bottom Row). |
| **Key `G`** | Base `ង`, Shift `អ` | Base `ង`, Shift `ុះ` | Shift+G produces `ុះ` in Standard. |
| **Key `H`** | Base `ហ`, Shift `ះ` | Base `ហ`, Shift `៏` | Shift+H produces diacritic `៏` in Standard. |

### Standard Curriculum Specifics:
- **Level 0 (Anchors & Spacebar Coeng):**
  - Introduces: `ថ` (F), `ក` (K), and explains the dual nature of `Space` (Thumb = Coeng `្`, Shift+Thumb = Word Space).
- **Level 1 (Standard Home Row Consonants):**
  - Introduces: `ា` (A), `ស` (S), `ដ` (D), `ង` (G), `ហ` (H), `ល` (L), `ញ` (J).
- **Level 2 (Standard Home Vowels & Signs):**
  - Introduces: `ះ` (Semicolon), `់` (Quote - Bantoc), and words: `កាក់`, `ដាក់`, `សះ`.
- **Level 3 (Top Row Reaches):**
  - Introduces: `េ` (E), `រ` (R), `ត` (T), `យ` (Y), `ុ` (U), `ិ` (I), `ោ` (O).
- **Level 4 (Bottom Row Reaches & Consonant `អ`):**
  - Introduces: `ច` (C), `វ` (V), `ប` (B), `ន` (N), `ម` (M), `អ` (Comma), `។` (Period).
- **Level 5 (Spacebar Subscript Clusters):**
  - Dedicated training on using the **Thumb Spacebar** to generate subscripts: `ក` + `Space` + `ក` = `ក្ក`; `ស` + `Space` + `ល` = `ស្ល`; `ប` + `Space` + `រ` = `ប្រ`.
- **Level 6 (Standard Shift Consonants & Vowels):**
  - Focuses on the unique Standard shift locations: `ៃ` (Shift+A), `ាំ` (Shift+S), `ុះ` (Shift+G), `៏` (Shift+H), `ុំ` (Shift+J).
- **Level 7 to Level 12:** Complex clusters, diacritics, vocabulary, sentences, and speed mastery.

---

## 8. SMART DATA-DRIVEN CONTENT SELECTION

Content generation must never guess which characters are available. The system maintains a deterministic character availability registry:

```mermaid
flowchart LR
    L_PREV["Lessons 1..N-1 Cumulative Keys"] --> REG["Character Availability Registry"]
    L_CURR["Lesson N: newKeys"] --> REG
    REG --> VF["Vocabulary & Exercise Filter"]
    DICT["Verified Lexicon Bank"] --> VF
    VF --> EX["Generated Exercise Content"]
    EX --> VAL["Compile-Time Prerequisite Validator"]
```

### Content Validation Rules:
1. **Zero Future Characters:** An exercise within Lesson $N$ must only contain characters that belong to `CumulativeKeys(N)`. If a character has not been introduced in Lesson $N$ or earlier, its appearance is a blocking compilation error.
2. **Deterministic Unlocking Registry:**
   $$\text{AvailableChars}(N) = \text{AvailableChars}(N-1) \cup \text{NewChars}(N)$$
   - The compile-time validation harness simulates this accumulator across all 218 lessons.
3. **Lexical Authenticity:** Every word exercise draws from a curated dictionary of real words. Nonsense strings are strictly restricted to Stages 2–5 (finger isolation and pattern rolling).

---

## 9. SPACED REVIEW & WEAK-KEY REINFORCEMENT

The curriculum integrates three complementary layers of review:

```mermaid
flowchart TD
    subgraph Layer1 ["Layer 1: In-Curriculum Spaced Review"]
        CR["Periodic Review Lessons (every 3–4 lessons within a level)"]
        CP["End-of-Level Checkpoints (multi-row consolidation)"]
    end

    subgraph Layer2 ["Layer 2: Remedial Review Mistakes"]
        RM["Post-Lesson 'Review Mistakes' Button (id: -1)"]
        RMD["Targeted n-grams on missed keys via seqReviewMistakes()"]
    end

    subgraph Layer3 ["Layer 3: Autonomous Review Subsystem"]
        AR["Adaptive Review Tab (js/review.js)"]
        ARC["Multi-factor weakness detection & decay tracking via PK_TRACKER"]
    end

    CR --> CP
    RM --> RMD
    Layer1 -.->|Telemetry| Layer3
```

1. **In-Curriculum Spaced Review (Stage 8):**
   - At least **25% of all lessons** in each level are dedicated consolidation lessons.
   - Older characters are re-introduced in later levels (e.g., home row keys are continuously mixed into bottom-row and shift-layer exercises).
2. **Post-Lesson Remedial Drilling ("Review Mistakes"):**
   - Built directly into `js/lessons.js` (lines 2085–2110). If the user commits mistakes on specific characters during a lesson, clicking `Review Mistakes` launches an ad-hoc practice session (`id: -1`) targeting those exact characters and companion keys.
3. **External Adaptive Review (`js/review.js`):**
   - Monitors per-key accuracy and staleness across sessions.
   - Automatically surfaces keys falling below $85\%$ accuracy or unpracticed for $> 7$ days.

---

## 10. CHECKPOINTS & FINAL KEYBOARD MASTERY

### Mini Checkpoints:
- Placed at critical ergonomic boundaries (e.g., end of Home Row, end of Top Row, completion of Base Layer).
- Require $\ge 90\%$ accuracy to earn full star credit.
- Provide clear milestone feedback on typing rhythm, reach confidence, and accuracy.

### True Final Keyboard Mastery:
Mastery is **not** defined by simply clicking through every lesson. True Keyboard Mastery requires:
1. **100% Curriculum Completion:** Every lesson in the layout completed with recorded best scores.
2. **High Accuracy Standard:** Overall layout average accuracy $\ge 92\%$.
3. **Speed Competency:** Minimum sustained typing speed:
   - English: $\ge 40$ WPM on continuous paragraph challenges.
   - Khmer NiDA / Standard: $\ge 25$ WPM on continuous prose with Shift+Space word separation.
4. **Endurance Verification:** Passing the 3-minute continuous timed typing test without excessive backspacing ($< 5\%$ error rate).

---

## 11. AUTOMATED COVERAGE CHECKER & REGRESSION HARNESS

Completeness and correctness are enforced via machine-executable validation scripts:

```mermaid
flowchart TD
    SCRIPT["scripts/validate_curriculum.js"] --> S1["1. Structural Integrity Check"]
    SCRIPT --> S2["2. Pedagogical Progression Check"]
    SCRIPT --> S3["3. Keystroke Depth Check"]
    SCRIPT --> S4["4. Layout Coverage Check"]

    S1 -->|Validates| V1["No duplicate IDs, no empty exercises, valid previousLesson links"]
    S2 -->|Validates| V2["Zero unlearned characters, correct layer requirements"]
    S3 -->|Validates| V3["Minimum 80 units/lesson, orientation exceptions"]
    S4 -->|Validates| V4["100% of required keyboard glyphs mapped and taught"]
```

### What the Automated Harness Validates:
1. **Full Glyph Coverage:** Scans `data/keyboard.json` for every printable glyph across base, shift, and altgr layers, verifying that each glyph appears as an introduced character in at least one lesson.
2. **Zero Pre-Introduction Violations:** Replays the curriculum lesson-by-lesson and verifies that every character typed in an exercise was introduced in that lesson or an earlier one.
3. **Minimum Keystroke Depth:** Flags any lesson with fewer than 80 keystroke units (with an explicit threshold of 20 for orientation lessons).
4. **Duplication Detector:** Flags lessons that share identical introduced keys, exercise contents, and objectives.

---

## 12. PRESERVATION OF EXISTING SYSTEMS

The curriculum overhaul is strictly isolated to lesson content and curriculum loading. The following existing systems must remain untouched:

| System | File(s) | Preserved Functionality |
| :--- | :--- | :--- |
| **Adaptive Practice** | `js/adaptive.js`, `data/adaptive-vocab.js` | Letter progression sequence (`E N I A R L...`), 20-unit letter mastery engine, isolated `localStorage` key `pk_adaptive_state_v1`, granular letter mastery progress bars. |
| **Progress Persistence** | `js/progress.js` | Storage keys `khmerProgressData_v2` and `khmerLessonBest_<id>`, course records (`standard`, `nida`, `english`), `resetAll()` behavior. |
| **Keyboard Subsystem** | `js/keyboard.js`, `data/keyboard.json` | Virtual keyboard DOM generation, row/key styling, active layer transitions, kinematic hands overlay. |
| **Review Engine** | `js/review.js` | Adaptive review tab, weak-key cataloging, staleness decay equations. |
| **Keystroke Tracker** | `js/tracker.js` | Raw timing events, WPM calculation, latency measurement. |
| **UI Strip & Modals** | `index.html`, `js/lessons.js` | Level collapse/expansion, lesson cards, mastery stars, lock icons, shortcuts dialog, settings modal. |

---

## 13. MIGRATION & BACKWARD COMPATIBILITY STRATEGY

To ensure that existing users do not lose completed lesson progress or stars:
1. **Preserve Legacy Lesson IDs:**
   - English lessons retain IDs matching `en-Lxx-yy`.
   - NiDA lessons retain IDs matching `nida-Lxx-yy`.
   - Standard lessons use `standard-Lxx-yy` while supporting legacy numeric IDs (`1` through `58`) via `progress.js` migration mappings.
2. **Storage Key Continuity:**
   - Progress continues to read from and write to `khmerProgressData_v2` and legacy fallback `khmerLessonBest_<id>`.
3. **Graceful Upgrades:**
   - When new lessons or expanded exercises are introduced, existing completion records in `state.courses[layout].lessons[id]` remain valid. A completed lesson is never relocked because of an exercise expansion.

---

## 14. DATA ARCHITECTURE SPECIFICATION

Curriculum files are organized under `data/curriculum/`:

```
data/curriculum/
├── english/
│   ├── levels.json       # 14 levels with title, description, objective, lesson refs
│   ├── lessons.json      # 64 lessons with newKeys, requiredKeys, targets, exerciseRefs
│   └── exercises.json    # 204 exercises with type, content, description
├── nida/
│   ├── levels.json       # 13 levels with Khmer titles (titleKm)
│   ├── lessons.json      # 77 lessons with NiDA key mappings
│   └── exercises.json    # 230 exercises with authentic Khmer text
├── standard/
│   ├── levels.json       # 13 levels matching Standard keyboard mechanics
│   ├── lessons.json      # 77 lessons with Standard key mappings (Space Coeng)
│   └── exercises.json    # 230 exercises with Standard-specific text
└── ...
data/curriculum-data.js   # Single pre-bundled bundle file for offline zero-latency startup
```

### JSON Schema Definitions:

#### `levels.json` Schema:
```json
{
  "id": "en-L01",
  "levelNumber": 1,
  "title": "Core Home Row: D, K, S, L",
  "description": "Middle and ring finger home-row keys",
  "objective": "Master D, K, S, and L from anchor positions",
  "lessons": ["en-L01-01", "en-L01-02", "en-L01-03", "en-L01-04"],
  "unlockRequirements": { "previousLevel": "en-L00" },
  "completionRequirements": { "allLessonsCompleted": true, "minLevelAccuracy": 90 }
}
```

#### `lessons.json` Schema:
```json
{
  "id": "en-L01-01",
  "level": "en-L01",
  "order": 1,
  "title": "Middle Fingers: D and K",
  "description": "Middle Fingers: D and K",
  "objective": "Master Middle Fingers: D and K",
  "type": "single-char",
  "newKeys": [
    { "keyId": "d", "layer": "base", "char": "d", "finger": "lm" },
    { "keyId": "k", "layer": "base", "char": "k", "finger": "rm" }
  ],
  "requiredKeys": ["d", "k"],
  "fingerFocus": ["lm", "rm"],
  "difficulty": 1,
  "accuracyTarget": 90,
  "speedTarget": null,
  "mistakeTolerance": 5,
  "exerciseRefs": ["en-L01-01-E01", "en-L01-01-E02", "en-L01-01-E03", "en-L01-01-E04", "en-L01-01-E05"],
  "unlockRequirements": { "previousLesson": "en-L00-04" }
}
```

#### `exercises.json` Schema:
```json
{
  "en-L01-01-E01": {
    "type": "single-char",
    "content": "ddd kkk dkd kdk",
    "description": "Middle finger isolation"
  }
}
```

### Schema Versioning & Change Management
Curriculum JSON has no version marker today, which means a future field addition (or removal) cannot be distinguished from a malformed file by either the validator or `js/progress.js`'s migration logic. To keep Section 13's backward-compatibility guarantees enforceable as the schema evolves:
- Every `levels.json`, `lessons.json`, and `exercises.json` file gains a top-level `"schemaVersion": 1` field (or an equivalent bundle-level field in `data/curriculum-data.js`).
- `scripts/validate_curriculum.js` rejects any file whose `schemaVersion` it does not recognize, rather than attempting to parse it optimistically — a loud failure at build time, not a silent one at runtime.
- Any change that adds a required field, removes a field, or changes a field's meaning (not just additive/optional fields) increments `schemaVersion` and requires a corresponding migration note in this document's Section 13.
- `js/progress.js` reads `schemaVersion` before applying legacy-ID mapping, so future ID-format changes don't have to guess which mapping table applies.

---

# Curriculum Architecture

This section documents how the new lesson curriculum will be generated, stored, validated, and consumed by the browser application.

## Core Design Principle
The pipeline strictly follows a simple, robust flow:  
**Generate → Validate → Store → Bundle → Use**

```
Generator (scripts/generate_curricula.js)
    ↓
Curriculum Source Files (data/curriculum/*)
    ↓
Curriculum Validator (scripts/validate_curriculum.js)
    ↓
Browser Bundle (data/curriculum-data.js)
    ↓
Browser App (js/lessons.js, js/progress.js, etc.)
```

## Architecture Diagram

```mermaid
flowchart TD
    GEN["scripts/generate_curricula.js<br>(Layout-Aware Generation Engine)"]
    
    GEN --> GE["generateEnglishCurriculum()"]
    GEN --> GN["generateNidaCurriculum()"]
    GEN --> GS["generateStandardCurriculum()"]
    
    GE --> DIR_EN["data/curriculum/english/<br>(levels, lessons, exercises.json)"]
    GN --> DIR_NI["data/curriculum/nida/<br>(levels, lessons, exercises.json)"]
    GS --> DIR_ST["data/curriculum/standard/<br>(levels, lessons, exercises.json)"]
    
    DIR_EN --> VAL["scripts/validate_curriculum.js<br>(Pre-Bundle Automated Integrity Check)"]
    DIR_NI --> VAL
    DIR_ST --> VAL
    
    VAL -->|Pass 0 Errors| BUNDLE["data/curriculum-data.js<br>(window.CURRICULUM_DATA: english, nida, standard)"]
    
    BUNDLE --> APP["Browser Application Runtime"]
    
    APP --> UI["Lesson UI Strip<br>(js/lessons.js)"]
    APP --> PROG["Saved Progress & Unlocks<br>(js/progress.js)"]
    APP --> REV["Review & Checkpoints<br>(js/review.js & lessons.js)"]
    APP --> ADAPT["Adaptive Practice Boundary<br>(js/adaptive.js - Isolated Session)"]
```

## What Each Part Means

### 1. `scripts/generate_curricula.js`
The curriculum generator is responsible for producing structured lesson data. It maintains separate generation logic for:
- **English US**
- **Khmer NiDA**
- **Khmer Standard**

The generator uses actual keyboard definitions (`data/keyboard.json` and `js/keyboard.js`) to resolve physical keys, finger assignments, and modifier layers rather than guessing or hardcoding characters.

---

### 2. `data/curriculum/`
This is the human-readable, maintainable curriculum source of truth. The three layouts are kept strictly separated:
```text
data/curriculum/
├── english/     # levels.json, lessons.json, exercises.json
├── nida/        # levels.json, lessons.json, exercises.json
└── standard/    # levels.json, lessons.json, exercises.json
```
Each layout folder contains structured modular files defining:
- Levels (objectives, sequencing, unlock rules)
- Lessons (new keys, required keys, finger assignments, target accuracy)
- Exercises (content text, drill types, descriptions)
- Metadata & layout progression information

NiDA and Standard remain separate curricula with layout-specific physical mechanics.

---

### 3. `data/curriculum-data.js`
This is the browser-consumable, zero-latency curriculum bundle. It exposes the compiled object:
```text
CURRICULUM_DATA
├── english
├── nida
└── standard
```
The browser consumes this structured bundle directly on load, eliminating multi-file fetch latency and allowing PK Khmer Type to run offline and via the `file:///` protocol without CORS restrictions.

---

### 4. Browser App
The client application consumes `CURRICULUM_DATA` to operate lessons dynamically:
- **Lesson UI Strip (`js/lessons.js`):** Materializes lesson models, renders level accordions, lesson cards, and mastery stars.
- **Lesson Progression & Unlocks (`js/progress.js`):** Evaluates lesson unlocks and persists attempt statistics.
- **Review & Checkpoints:** Feeds error telemetry into the post-lesson "Review Mistakes" modal and targeted practice.
- **Adaptive Practice Boundary (`js/adaptive.js`):** Runs independently with its own letter mastery engine, suspending curriculum lessons during practice sessions.

The curriculum data provides the lesson content; existing application subsystems handle execution, input processing, and state persistence.

---

### 5. Validation Step
Before bundling or release, the curriculum runs through the validation gate (`scripts/validate_curriculum.js`):
```text
Generator → Curriculum Data → Curriculum Validator → Browser Bundle
```
The validator automatically detects and prevents:
- Missing keys or characters on the layout
- Invalid lesson dependencies (broken `previousLesson` links)
- Future characters appearing before their introduction lesson
- Duplicate lesson or level IDs
- Broken progression or unmapped glyphs
- Sub-minimum keystroke depth ($<80$ units)
- Missing review or mastery coverage

---

# Lesson Generation Flow

This section explains how a single lesson is created from raw keyboard data through validation.

```mermaid
flowchart TD
    KB["Keyboard Definition\n(data/keyboard.json)"] --> AC["Available Characters\n(All printable glyphs per layout)"]
    AC --> LR["Lesson Rules\n(Max 1–2 new keys, finger sequencing,\nlevel placement, stage type)"]
    PREV["Previously Introduced Keys\n(Cumulative from Lessons 1..N-1)"] --> LR
    LR --> LG["Lesson Generator\n(Builds exercises from known + new keys)"]
    LG --> GL["Generated Lesson\n(JSON: newKeys, requiredKeys, exercises)"]
    GL --> CV["Curriculum Validator\n(scripts/validate_curriculum.js)"]
    CV -->|Pass| CD["Curriculum Data\n(data/curriculum/{layout}/*.json)"]
    CV -->|Fail| REJ["❌ Rejected\n(Fix errors before re-generating)"]
```

**How it works:**

1. **Keyboard definitions** (`data/keyboard.json`) provide the actual characters, physical key IDs, finger assignments, and modifier layers for each layout.
2. **The generator tracks what has already been introduced.** Before generating Lesson $N$, the cumulative set $\text{AvailableChars}(N-1)$ is computed from all preceding lessons.
3. **Lesson rules** determine what type of lesson to produce (introduce, combine, review, checkpoint) and enforce constraints: at most 1–2 new keys per introductory lesson, ergonomic finger ordering, proper stage placement.
4. **Generated lessons are validated** by `scripts/validate_curriculum.js` before becoming part of the curriculum. The validator checks for pre-introduction violations, missing keys, broken links, and insufficient depth.
5. **Invalid lessons are rejected** — they must never silently enter the curriculum. A validation failure is a blocking error that must be fixed before the lesson is accepted.

---

# Lesson Progression Flow

This section shows how the learner moves through the curriculum from introduction to mastery.

```mermaid
flowchart TD
    INTRO["🔤 Introduce\n(New key shown, finger assigned)"] --> PRACTICE["⌨️ Practice\n(Isolate key, anchor pairs)"]
    PRACTICE --> COMBINE["🔗 Combine\n(Bigrams/trigrams with known keys)"]
    COMBINE --> WORDS["📝 Words / Sequences\n(Real vocabulary from unlocked pool)"]
    WORDS --> REVIEW["🔄 Review\n(Revisit older keys from earlier levels)"]
    REVIEW --> CHECK["✅ Checkpoint\n(≥90% accuracy gate)"]
    CHECK -->|Pass| NEXT["➡️ Next Lesson"]
    CHECK -->|Fail| REMEDIAL["🔁 Remedial Review\n(Review Mistakes button)"]
    REMEDIAL --> CHECK
    NEXT --> NEXTLVL["⬆️ Next Level\n(New finger region or modifier layer)"]
    NEXTLVL --> INTRO
```

**Key principles:**

- Progression follows a strict pedagogical sequence. The learner does **not** randomly jump between unrelated skills.
- Each step builds on the one before it: new keys are isolated first, then combined with familiar keys, then used in real words.
- **Checkpoints act as gates** — the learner must demonstrate accuracy before advancing.
- Remedial review loops exist for learners who struggle — they re-enter through the "Review Mistakes" mechanism already built into `js/lessons.js`.
- Moving to the next **level** resets the cycle: a new finger region or modifier layer is introduced, and the progression repeats.

---

# Character Coverage System

This section shows how the system tracks whether a keyboard layout is fully covered by the curriculum.

```mermaid
flowchart TD
    KB["Keyboard Definition\n(data/keyboard.json)"] --> REQ["Required Characters\n(All printable glyphs:\nbase, shift, altgr layers)"]
    CUR["Curriculum Lessons\n(data/curriculum/{layout}/lessons.json)"] --> INTRO_SET["Introduced Characters\n(Union of all newKeys across lessons)"]
    CUR --> PRAC_SET["Practiced Characters\n(Characters appearing in exercises)"]
    CUR --> REV_SET["Reviewed Characters\n(Characters in review/checkpoint lessons)"]
    
    REQ --> DIFF["Coverage Comparator"]
    INTRO_SET --> DIFF
    PRAC_SET --> DIFF
    REV_SET --> DIFF
    
    DIFF -->|100% Coverage| COMPLETE["✅ Complete\n(Every required glyph introduced,\npracticed, and reviewed)"]
    DIFF -->|Gaps Found| MISSING["❌ Missing Characters Report\n(List of unintroduced glyphs)"]
```

**What this means:**

- The keyboard definition is the **single source of truth** for what characters must be taught. Every printable glyph across base, shift, and altgr layers is a required character.
- The coverage system computes three sets per layout:
  - **Introduced:** Characters that appear in at least one lesson's `newKeys`.
  - **Practiced:** Characters that appear in exercise content.
  - **Reviewed:** Characters that appear in review or checkpoint lessons.
- A layout is **complete** only when every required character is introduced, practiced, and reviewed.
- `scripts/validate_curriculum.js` performs this coverage check automatically during validation. Missing characters produce blocking errors.

---

# Review and Weak-Key Flow

This section shows how normal review coexists with Adaptive Practice. They are **two separate systems** that must never interfere.

```mermaid
flowchart TD
    subgraph CurriculumReview ["Curriculum Review (js/lessons.js + js/review.js)"]
        LP["Lesson Practice\n(Learner types exercises)"] --> PERF["Performance Recorded\n(Accuracy, WPM, per-key errors)"]
        PERF --> NR["Normal Review\n(In-curriculum Stage 8 review lessons)"]
        PERF --> WK["Weak Keys Detected\n(Accuracy <85% or stale >7 days)"]
        WK --> REINF["Reinforcement Drills\n(Review Mistakes button → ad-hoc session)"]
        NR --> CP_R["Checkpoint Review\n(End-of-level consolidation)"]
    end
    
    subgraph AdaptivePractice ["Adaptive Practice (js/adaptive.js) — ISOLATED"]
        AP["Adaptive Practice Tab\n(Own UI, own state)"]
        AP --> APS["pk_adaptive_state_v1\n(Independent localStorage key)"]
    end
    
    PERF -.->|"Telemetry only\n(PK_TRACKER feeds both)"| AP
    
    CurriculumReview -.->|"Mutual Suspension\n(exitSession / suspendCurriculum)"| AdaptivePractice
```

**Critical boundaries:**

- **Curriculum Review** is built into the lesson progression: review lessons (Stage 8), checkpoints (Stage 9), and the post-lesson "Review Mistakes" button.
- **Adaptive Practice** is a completely independent system with its own letter progression (`E N I A R L...`), its own mastery tracking (20 units per letter), and its own storage key (`pk_adaptive_state_v1`).
- They share keystroke telemetry through `PK_TRACKER` but **never share state or storage**.
- Mutual suspension ensures only one is active at a time: entering a curriculum lesson calls `PK_ADAPTIVE.exitSession(false)`; entering Adaptive Practice suspends the curriculum.

---

# Curriculum Validation Flow

This section details the automated validation pipeline that runs before any curriculum data is accepted.

```mermaid
flowchart TD
    INPUT["Curriculum Source Files\n(levels.json, lessons.json, exercises.json)"] --> S1["1. Schema Check\n(Valid JSON, required fields,\ncorrect ID formats)"]
    S1 -->|Pass| S2["2. Coverage Check\n(Every keyboard glyph\nintroduced in at least one lesson)"]
    S2 -->|Pass| S3["3. Dependency Check\n(All previousLesson links resolve,\nno broken chains)"]
    S3 -->|Pass| S4["4. Progression Check\n(Zero pre-introduction violations:\nevery exercise char ∈ CumulativeKeys)"]
    S4 -->|Pass| S5["5. Duplicate Check\n(No duplicate lesson IDs,\nno duplicate level IDs)"]
    S5 -->|Pass| S6["6. Depth Check\n(≥80 units per lesson,\n≥20 for orientation)"]
    S6 -->|Pass| PASS["✅ PASS\n(Curriculum ready for bundling)"]
    
    S1 -->|Fail| FAIL["❌ FAIL\n(Error report with line-level detail)"]
    S2 -->|Fail| FAIL
    S3 -->|Fail| FAIL
    S4 -->|Fail| FAIL
    S5 -->|Fail| FAIL
    S6 -->|Fail| FAIL
```

**Validation is a hard gate.** If any check fails, the entire curriculum is rejected. There is no "partial pass." This ensures that the browser application never receives corrupted or incomplete lesson data.

---

# Existing Progress Migration

This section shows how the new curriculum coexists with existing learner progress data.

```mermaid
flowchart TD
    EP["Existing Progress\n(khmerProgressData_v2 +\nkhmerLessonBest_<id> keys)"] --> MC["Migration Check\n(js/progress.js startup)"]
    
    MC --> COMPAT["Compatible?\n(Lesson IDs match new curriculum)"]
    
    COMPAT -->|Yes| PRESERVE["✅ Preserved Progress\n(Stars, completion records,\nand unlocks remain valid)"]
    
    COMPAT -->|Legacy IDs| MAP["ID Mapping\n(Legacy numeric IDs 1-58 →\nnew format standard-Lxx-yy)"]
    MAP --> PRESERVE
    
    PRESERVE --> NEW_CUR["New Curriculum Loaded\n(Expanded exercises, same lesson IDs)"]
    
    NEW_CUR --> RULE["Key Rule:\nA completed lesson is\nNEVER relocked due to\nexercise expansion"]
```

**Migration principles:**

- **Lesson IDs are stable.** English uses `en-Lxx-yy`, NiDA uses `nida-Lxx-yy`, Standard uses `standard-Lxx-yy`.
- **Legacy numeric IDs** (from the original Standard `buildCourse()` system) are mapped to new IDs by the migration logic in `js/progress.js` (lines 406–456).
- **Existing completion records remain valid.** If a learner completed a lesson before the expansion, that lesson stays completed even though it now has more/longer exercises.
- **No relocking.** Expanding exercise content within an existing lesson does not reset the learner's progress or re-lock previously unlocked lessons.

---

# Layout Separation

This section shows that English, NiDA, and Standard are fully independent curricula — each with its own lessons, progress, and progression.

```mermaid
flowchart TD
    subgraph CurriculumSystem ["Curriculum System"]
        direction LR
        subgraph ENG ["English"]
            EL["14 Levels"] --> ELES["64 Lessons"]
            ELES --> EPROG["english progress\n(state.courses.english)"]
        end
        subgraph NIDA ["Khmer NiDA"]
            NL["13 Levels"] --> NLES["77 Lessons"]
            NLES --> NPROG["nida progress\n(state.courses.nida)"]
        end
        subgraph STD ["Khmer Standard"]
            SL["13 Levels"] --> SLES["77 Lessons"]
            SLES --> SPROG["standard progress\n(state.courses.standard)"]
        end
    end
    
    ENG -.->|"Independent"| NIDA
    NIDA -.->|"Independent"| STD
    
    SWITCH["Layout Switcher\n(UI dropdown)"] --> ENG
    SWITCH --> NIDA
    SWITCH --> STD
```

**Separation rules:**

- Each layout has its **own levels, lessons, exercises, and progression** — they never share lesson content or IDs.
- Progress is tracked **per layout** in `state.courses = { english, nida, standard }`.
- Completing English lessons has **zero effect** on NiDA or Standard progress, and vice versa.
- The UI layout switcher dynamically reloads the lesson strip for the selected layout without affecting other layouts' state.
- Keyboard physics differ between layouts (Coeng on `Shift+J` vs `Space`, different vowel placements), so lesson content cannot be cross-layout.

---

# Final Mastery Flow

This section shows the end-game progression where the learner has been introduced to all keys and works toward full keyboard mastery.

```mermaid
flowchart TD
    ALL["All Keys Introduced\n(100% coverage reached)"] --> COMBO["Combination Practice\n(Complex bigrams, trigrams,\nclusters across all rows)"]
    COMBO --> MIXED["Mixed Exercises\n(Full-alphabet sentences,\nconnected prose with punctuation)"]
    MIXED --> ENDURANCE["Endurance Drills\n(Multi-paragraph continuous typing)"]
    ENDURANCE --> FINAL_REV["Final Review\n(Cross-level consolidation\nof weakest keys)"]
    FINAL_REV --> MASTERY["Mastery Check"]
    
    MASTERY --> Q1{"Accuracy ≥92%?"}
    Q1 -->|Yes| Q2{"Speed ≥40 WPM (EN)\nor ≥25 WPM (KH)?"}
    Q1 -->|No| FINAL_REV
    Q2 -->|Yes| Q3{"3-min timed test\n<5% error rate?"}
    Q2 -->|No| ENDURANCE
    Q3 -->|Yes| DONE["🏆 Keyboard Mastery\nAchieved"]
    Q3 -->|No| ENDURANCE
```

**Mastery is earned, not given.** Simply completing every lesson does not grant mastery. The learner must:

1. Complete 100% of the curriculum.
2. Maintain overall accuracy $\ge 92\%$.
3. Reach sustained speed: $\ge 40$ WPM (English) or $\ge 25$ WPM (Khmer).
4. Pass a 3-minute continuous timed test with $< 5\%$ error rate.

Failing any criterion sends the learner back into targeted practice at the appropriate stage.

---

# Overall System Diagram

This is the big-picture view connecting every part of the lesson overhaul system from source definitions through to learner mastery.

```mermaid
flowchart TD
    subgraph Sources ["Source Definitions"]
        KB_DEF["Keyboard Definitions\n(data/keyboard.json)"]
        KB_JS["Keyboard Physics\n(js/keyboard.js)"]
    end
    
    subgraph Generation ["Curriculum Generation"]
        GEN_EN["generateEnglishCurriculum()"]
        GEN_NI["generateNidaCurriculum()"]
        GEN_ST["generateStandardCurriculum()"]
    end
    
    subgraph CurriculumData ["Curriculum Source Files"]
        JSON_EN["data/curriculum/english/"]
        JSON_NI["data/curriculum/nida/"]
        JSON_ST["data/curriculum/standard/"]
    end
    
    subgraph Validation ["Quality Gate"]
        VAL["scripts/validate_curriculum.js\n(Schema + Coverage + Progression\n+ Dependencies + Depth)"]
    end
    
    subgraph Bundle ["Browser-Ready Bundle"]
        BUNDLE_JS["data/curriculum-data.js\n(window.CURRICULUM_DATA)"]
    end
    
    subgraph BrowserApp ["Browser Application"]
        LESSONS["Lesson Engine\n(js/lessons.js)"]
        PROGRESS["Progress & Unlocks\n(js/progress.js)"]
        ADAPTIVE["Adaptive Practice\n(js/adaptive.js)\n— ISOLATED —"]
        REVIEW["Review & Checkpoints\n(js/review.js)"]
        TRACKER["Keystroke Tracker\n(js/tracker.js)"]
    end
    
    subgraph LearnerJourney ["Learner Progression"]
        INTRO_J["Introduce"] --> PRAC_J["Practice"]
        PRAC_J --> COMB_J["Combine"]
        COMB_J --> WORD_J["Words"]
        WORD_J --> REV_J["Review"]
        REV_J --> CHECK_J["Checkpoint"]
        CHECK_J --> MAST_J["🏆 Mastery"]
    end
    
    KB_DEF --> GEN_EN
    KB_DEF --> GEN_NI
    KB_DEF --> GEN_ST
    KB_JS --> GEN_EN
    KB_JS --> GEN_NI
    KB_JS --> GEN_ST
    
    GEN_EN --> JSON_EN
    GEN_NI --> JSON_NI
    GEN_ST --> JSON_ST
    
    JSON_EN --> VAL
    JSON_NI --> VAL
    JSON_ST --> VAL
    
    VAL -->|"PASS"| BUNDLE_JS
    
    BUNDLE_JS --> LESSONS
    LESSONS <--> PROGRESS
    LESSONS --> TRACKER
    TRACKER --> REVIEW
    
    LESSONS --> LearnerJourney
    PROGRESS --> LearnerJourney
    REVIEW --> LearnerJourney
```

**This diagram answers: "How does everything connect?"**

1. **Keyboard definitions** are the root source of truth — they define what characters exist.
2. **Generators** produce structured JSON curricula from those definitions.
3. **Validation** ensures curriculum integrity before anything reaches the browser.
4. **Bundling** compiles validated JSON into a single zero-latency file.
5. **The browser app** consumes the bundle through its lesson engine, progress system, and review subsystems.
6. **Adaptive Practice** runs alongside but in strict isolation.
7. **The learner** progresses through the 10-stage pedagogical sequence from introduction to mastery.

---

## 15. MASTER ROADMAP & ARCHITECTURAL MAP (PHASE 9 TO PRODUCTION COMPLETION)

### Status Key:
- `[COMPLETED]`: Fully implemented, verified with tests, and active in the repository.
- `[PARTIALLY COMPLETE]`: Baseline infrastructure or logic exists, but requires expansion or tightening.
- `[NEXT]`: The immediate upcoming phase to be implemented.
- `[PLANNED]`: Designed and scheduled in the master roadmap.
- `[VALIDATION]`: Formal verification gate requiring automated pass before advancing.
- `[BLOCKED]`: Waiting on a prerequisite phase.

### Subsystem Health & Status Summary:
| Subsystem | Status | Current Baseline | What Remains |
| :--- | :---: | :--- | :--- |
| **Curriculum Data** | `[COMPLETED]` | 40 levels, 218 lessons, 664 exercises, 20,798 units across English, NiDA, Standard. Zero lessons below 80 units. | Checkpoint gating & review interleaving verification. |
| **Curriculum Bundler & Validator** | `[COMPLETED]` | `validate_curriculum.js` & `bundle_curricula.js` enforce 0 progression violations and 0 broken links. | Continuous execution in CI/validation gates. |
| **Runtime Lesson Engine** | `[COMPLETED]` | `js/lessons.js` hydrates all 3 layouts from `window.CURRICULUM_DATA` with offline fallback. | Checkpoint gate enforcement ($\ge 90\%$ accuracy). |
| **Typing Engine Core** | `[COMPLETED]` | Unicode NFC normalization, IME composition handling, multi-codepoint unit slicing, backspace stack. | Audio profile customization & sound latency tuning. |
| **Real-Time Keystroke Tracker** | `[COMPLETED]` | `js/tracker.js` (`PK_TRACKER`) zero-latency logging per key, finger, unit, layout, and active session. | Exporting aggregated telemetry for analytics dashboard. |
| **Review Engine Core** | `[COMPLETED]` | `js/review.js` (`PK_REVIEW`) character catalog, confusion matrix, staleness detection, candidate queue. | Connecting candidate queue to standalone targeted practice UI. |
| **Adaptive Practice (English)** | `[COMPLETED]` | Keybr-style letter progress bars, dynamic percentages (+2%/+3% correct, -1%..-4% wrong), 2,143 words. | Parity for Khmer NiDA & Standard. |
| **Adaptive Practice (Khmer)** | `[PARTIALLY COMPLETE]` | Basic syllable progression in `js/adaptive.js`, 384 Khmer words/syllables in `data/adaptive-vocab.js`. | Syllable-aware dynamic cluster generator, Coeng spacebar handling. |
| **Practice Modes (Trial & Race)** | `[PARTIALLY COMPLETE]` | `js/race.js` has live race track, local leaderboard, Temple Trial streak mechanics. | Word banks limited (9 Khmer, 20 English); race texts need multi-tier expansion. |
| **Progress & Account Persistence** | `[COMPLETED]` | `khmerProgressData_v2`, legacy migration, course isolation (`english`, `nida`, `standard`), backup export/import. | Granular historical attempt graphing. |
| **Localization & i18n** | `[PARTIALLY COMPLETE]` | `data/shared/i18n.json` exists; header and settings toggle English/Khmer. | 100% translation coverage for lesson cards, badges, and modals. |

---

### 15.1 Effort Estimates & Critical-Path Timeline

Diagrams show dependency order but not cost. Effort is given in **engineer-days (E-D)** for a single senior developer familiar with the codebase, sized off the actual scope in each phase's Main Work list (word counts, test counts, file counts). These are planning estimates, not commitments — track actuals against them and revise Section 15.2's critical path if any phase overruns by more than 30%.

| Phase | Effort (E-D) | Basis for Estimate | Can Slip Without Blocking Release? |
| :--- | :---: | :--- | :--- |
| **10 — Checkpoints & Spaced Review** | 4–6 | 40 levels × checkpoint wiring + review-distribution audit script. | No — every later phase assumes gating exists. |
| **11 — Practice System Expansion** | 6–9 | 500+ Khmer / 1,000+ English word curation and filtering, 4-tier race text sourcing and licensing check. | Yes — runs parallel to Phase 12. |
| **12 — Khmer Adaptive Syllable Engine** | 8–12 | New grapheme-cluster generator plus two layout-specific Coeng adaptations (Standard spacebar, NiDA Shift+J); highest algorithmic risk in the roadmap. | Yes — runs parallel to Phase 11. |
| **13 — Localization & A11y Polish** | 5–8 | 218 lesson titles/objectives/descriptions × 2 languages, audio engine, ARIA pass. | No — Phase 14's cross-browser suite assumes finished UI strings. |
| **14 — Verification & Regression** | 4–6 | Headless 218-lesson playthrough × 3 layouts × 3 browsers, orthography stress set. | No — release gate. |
| **15 — Release Candidate & Sign-off** | 2–3 | PWA/offline audit, cleanup, docs. | No — final gate. |
| **Total (critical path only, excluding parallel Phase 11)** | **~23–35 E-D** | Sum of 10, 12, 13, 14, 15 (Phase 11 absorbed into the Phase 12 window). | — |

**Reading this table:** Phase 12 is the single largest and riskiest phase — it is new algorithmic work (syllable-valid generation under phonotactic constraints), not a data-entry or wiring task like the others. If the timeline needs to be compressed, Phase 12 is the phase to descope first (e.g., ship Standard-layout adaptive parity before NiDA, per Risk R3 in Section 16) rather than compressing Phase 14's verification work.

---

### The Master Architecture & Development Map

```mermaid
flowchart TD
    classDef done fill:#1b3d2f,stroke:#2dd4a7,stroke-width:2px,color:#fff;
    classDef partial fill:#3d361b,stroke:#ffd166,stroke-width:2px,color:#fff;
    classDef next fill:#3d1b33,stroke:#ff5a70,stroke-width:3px,color:#fff;
    classDef planned fill:#1a2238,stroke:#4fe8ff,stroke-width:2px,color:#fff;
    classDef gate fill:#2c1b4d,stroke:#a06bff,stroke-width:2px,stroke-dasharray: 5 5,color:#fff;

    %% COMPLETED BASELINE
    subgraph BASELINE ["🏁 COMPLETED FOUNDATION (PHASES 1–9)"]
        P1_P2["Phase 1 & 2: Validator & Bundler Normalization"]:::done
        P3_P5["Phases 3–5: 218 Lessons Built (EN, NiDA, STD)"]:::done
        P6_P7["Phases 6 & 7: Runtime Hydration & Progress Isolation"]:::done
        P8_P9["Phases 8 & 9: Automated Coverage & Headless Browser Hydration"]:::done
        ENG_CORE["Typing Engine Core (NFC, IME, Backspace Stack)"]:::done
        TRACKER["Real-Time Keystroke Tracker (PK_TRACKER)"]:::done
        ADAPT_EN["Adaptive Practice for English (Keybr-style HUD)"]:::done
    end

    %% CRITICAL PATH & FUTURE PHASES
    P8_P9 --> PHASE10
    
    subgraph PHASE10_SUB ["PHASE 10: CHECKPOINTS, GATES & SPACED REVIEW"]
        PHASE10["Phase 10: Checkpoints & Spaced Review Audit"]:::next
        CP_GATE["Checkpoint Enforcement (≥90% Acc Required to Advance)"]:::planned
        SPACED_REV["Spaced Review Distribution Audit (≥25% Review/Level)"]:::planned
        TIMED_CHALLENGE["Timed Challenge Mechanics (1-min & 3-min Timers)"]:::planned
        PHASE10 --> CP_GATE
        PHASE10 --> SPACED_REV
        PHASE10 --> TIMED_CHALLENGE
    end

    subgraph PHASE11_SUB ["PHASE 11: PRACTICE SYSTEM EXPANSION"]
        PHASE11["Phase 11: Temple Trial & Typing Race Overhaul"]:::planned
        TRIAL_EXP["Temple Trial Expansion (Rich Word Bank from Vocab)"]:::planned
        RACE_EXP["Typing Race Text Engine (Multi-tier EN & Khmer Texts)"]:::planned
        REVIEW_UI["Targeted Weak-Key Drill Launcher (Connecting PK_REVIEW)"]:::planned
        PHASE11 --> TRIAL_EXP
        PHASE11 --> RACE_EXP
        PHASE11 --> REVIEW_UI
    end

    subgraph PHASE12_SUB ["PHASE 12: KHMER ADAPTIVE SYLLABLE ENGINE"]
        PHASE12["Phase 12: Khmer Adaptive Engine & Syllable Generator"]:::planned
        KM_SYLLABLE["Grapheme Cluster Syllable Generator (Zero-Leak)"]:::planned
        STD_SPACE["Standard Layout Coeng (Spacebar) Adaptive Support"]:::planned
        NIDA_COENG["NiDA Shift+J Subscript Adaptive Sequences"]:::planned
        PHASE12 --> KM_SYLLABLE
        PHASE12 --> STD_SPACE
        PHASE12 --> NIDA_COENG
    end

    subgraph PHASE13_SUB ["PHASE 13: LOCALIZATION & UX POLISH"]
        PHASE13["Phase 13: Complete i18n & Sensory/A11y Refinement"]:::planned
        I18N_FULL["Full Dual-Language Coverage (All 218 Lessons & Modals)"]:::planned
        AUDIO_PROFILE["Sound Engine Customization (Mechanical, Thock, Typewriter)"]:::planned
        A11Y_FOCUS["Accessibility, High-Contrast & Focus Mode Hardening"]:::planned
        PHASE13 --> I18N_FULL
        PHASE13 --> AUDIO_PROFILE
        PHASE13 --> A11Y_FOCUS
    end

    subgraph PHASE14_SUB ["PHASE 14: FULL-SYSTEM TEST SUITE"]
        PHASE14["Phase 14: Comprehensive Verification & Regression"]:::planned
        E2E_ALL["Automated E2E Suite (218 Lessons Load & Complete)"]:::planned
        KM_ORTHO["Khmer Orthography Stress Tests (Complex Clusters & Signs)"]:::planned
        ISOLATION_TEST["Cross-Layout Progress & Storage Resilience Tests"]:::planned
        PHASE14 --> E2E_ALL
        PHASE14 --> KM_ORTHO
        PHASE14 --> ISOLATION_TEST
    end

    subgraph PHASE15_SUB ["PHASE 15: RELEASE CANDIDATE & SIGN-OFF"]
        PHASE15["Phase 15: Final Release Audit & Delivery"]:::planned
        RELEASE_GATE["Quality Gate Verification (0 Errors, 100% Pass)"]:::gate
        DOCS["Final User & Developer Documentation"]:::planned
        SIGN_OFF["🏆 PK Khmer Type Production Ready"]:::done
        PHASE15 --> RELEASE_GATE
        RELEASE_GATE --> DOCS
        DOCS --> SIGN_OFF
    end

    %% INTER-PHASE DEPENDENCIES
    PHASE10_SUB --> PHASE11_SUB
    PHASE10_SUB --> PHASE12_SUB
    PHASE11_SUB --> PHASE13_SUB
    PHASE12_SUB --> PHASE13_SUB
    PHASE13_SUB --> PHASE14_SUB
    PHASE14_SUB --> PHASE15_SUB
```

---

### Detailed Specification of Future Phases (Phases 10–15)

```text
================================================================================
PHASE 10: CHECKPOINTS, GATEKEEPING & SPACED REVIEW AUDIT
================================================================================
Status:       [NEXT]
Dependencies: Phase 9 (Completed)
Files:        js/lessons.js, js/progress.js, data/curriculum/*

Goal:
Enforce true pedagogical gatekeeping across the 218 lessons and verify spaced
review distribution so learners do not advance without demonstrating accuracy.

Why It Exists:
Currently, lesson unlocking relies on a simple completion flag. Checkpoints and
timed challenges must act as genuine milestones requiring ≥90% accuracy.

Main Work:
1. Implement Checkpoint Gatekeeping:
   - Identify checkpoint lessons in each level (Stage 9).
   - In js/progress.js and js/lessons.js, require ≥90% accuracy on Checkpoints
     before unlocking the next level.
2. Timed Challenge Mechanics:
   - Wire 1-minute and 3-minute countdown timers into Level 12/13 speed lessons.
   - Calculate live net WPM and display celebratory pass criteria.
3. Spaced Review Audit:
   - Run audit verifying that ≥25% of exercises in every level systematically
     re-introduce characters from preceding levels.

Expected Result:
Learners cannot breeze through lessons with poor accuracy; checkpoints enforce
mastery, and timed drills function with active countdown timers.

Validation:
Automated test verifying checkpoint locks next level when accuracy <90%, and
unlocks when accuracy ≥90%. All 40 levels verified for review distribution.
```

```text
================================================================================
PHASE 11: PRACTICE SYSTEM EXPANSION (TEMPLE TRIAL & TYPING RACE)
================================================================================
Status:       [PLANNED]
Dependencies: Phase 10
Files:        js/race.js, data/typing-content.json, data/shared/race-config.json

Goal:
Transform Temple Trial and Typing Race from basic stubs into rich, layout-aware
practice modes with extensive vocabularies and authentic texts.

Why It Exists:
Temple Trial currently has only 9 Khmer words and 20 English words. Typing Race
lacks multi-tier literary content and layout-aware difficulty scaling.

Main Work:
1. Temple Trial Vocabulary Expansion:
   - Expand word pools to 500+ authentic Khmer words and 1,000+ English words
     drawn from adaptive vocabulary banks.
   - Filter words based on the learner's unlocked keys in the active layout.
2. Typing Race Text Engine:
   - Populate Easy, Medium, Hard, and Expert categories with authentic Khmer
     literature, proverbs, historical narratives, and English classic prose.
   - Integrate scoring formula from data/shared/race-config.json (netWPM * acc^2.2).
3. Targeted Review Drill Launcher:
   - Connect js/review.js candidate queue to a 1-click "Targeted Drill" button.

Expected Result:
Temple Trial provides endless varied practice; Typing Race features authentic,
challenging texts across 4 difficulties; targeted review is instantly accessible.

Validation:
Unit tests confirming zero locked-letter leakage in Temple Trial; live Chrome
test completing a 30s race and saving scores to local leaderboard.
```

```text
================================================================================
PHASE 12: KHMER ADAPTIVE SYLLABLE ENGINE & LAYOUT ISOLATION
================================================================================
Status:       [PLANNED]
Dependencies: Phase 10, Phase 11
Files:        js/adaptive.js, data/adaptive-vocab.js

Goal:
Bring full Khmer adaptive learning parity to match the English Keybr-style
trainer, supporting Khmer orthography and layout-specific mechanics.

Why It Exists:
English Adaptive Practice is fully mature, but Khmer requires syllable-aware
grapheme generation rather than arbitrary letter shuffling to form valid words.

Main Work:
1. Grapheme Cluster Syllable Generator:
   - Build dynamic Khmer syllable assembler respecting consonant-subscript-vowel
     phonotactics using strictly unlocked keys.
2. Standard Layout Spacebar Coeng Adaptation:
   - Ensure target word generation on Standard layout guides the user to use
     the thumb Spacebar for subscripts (`ក` + `Space` + `ក` = `ក្ក`).
3. NiDA Layout Shift+J Adaptation:
   - Ensure NiDA adaptive practice trains `Shift+J` for subscripts.
4. Granular Letter Progress UI for Khmer:
   - Render the horizontal progress strip for Khmer consonants and vowels.

Expected Result:
Learners can launch Adaptive Practice in Khmer NiDA and Khmer Standard, drilling
valid syllables with real-time weakness detection and Keybr-style progress.

Validation:
Automated test verifying 0 syntax errors in generated Khmer syllables, correct
subscript mapping per layout, and dynamic percentage updates.
```

```text
================================================================================
PHASE 13: FULL i18n LOCALIZATION & SENSORY/A11Y POLISH
================================================================================
Status:       [PLANNED]
Dependencies: Phase 11, Phase 12
Files:        data/shared/i18n.json, js/app.js, css/*.css, index.html

Goal:
Deliver complete dual-language (Khmer / English) localization and refine sensory
and accessibility features for all user tiers.

Why It Exists:
The app is founded in Cambodia for Khmer and international learners. Every UI
element, lesson card, and feedback message must be fluently available in both languages.

Main Work:
1. 100% i18n Translation Coverage:
   - Localize all 218 lesson titles, level titles, objectives, and exercise
     descriptions into both Khmer and English.
   - Ensure dynamic string replacement when toggling language (Alt+L).
2. Audio Profile Engine:
   - Implement audio synthesizers/samples for distinct key profiles: Mechanical
     Clicky (Blue), Smooth Linear (Red), Deep Thock, and Antique Typewriter.
3. Accessibility & Focus Mode:
   - Implement ARIA live regions announcing typing errors for screen readers.
   - Enforce modal focus traps and Esc-key dismissals.
   - Refine Focus Mode (Alt+F) to dim distractions with smooth transitions.

Expected Result:
Instantaneous, flawless switching between Khmer and English UI; satisfying,
customizable tactile audio; full accessibility compliance.

Validation:
Lighthouse accessibility score ≥95; automated check confirming 0 missing
translation keys in data/shared/i18n.json.
```

```text
================================================================================
PHASE 14: COMPREHENSIVE VERIFICATION & CROSS-BROWSER REGRESSION
================================================================================
Status:       [PLANNED]
Dependencies: Phases 10–13
Files:        scripts/validate_curriculum.js, scratch/test_*.js

Goal:
Execute an exhaustive automated test battery covering every lesson, subsystem,
and edge case across major browser runtimes.

Why It Exists:
Before declaring the system ready for production, machine-verifiable proof must
guarantee zero regressions, zero progression bugs, and rock-solid persistence.

Main Work:
1. 218-Lesson Automated Playthrough Suite:
   - Headless script that programmatically inputs correct keystrokes for all
     218 lessons across English, NiDA, and Standard.
   - Verify completion triggers, star assignments, and unlock cascades.
2. Khmer Orthography Stress Testing:
   - Verify complex clusters (e.g. `ស្ដេច`, `កញ្ជ្រោង`, `សម្បត្តិ`, `កិត្តិយស`).
   - Test Robat (`៌`), Bantoc (`់`), Coeng spacebar, and ZWSP handling.
3. Storage & State Resilience Tests:
   - Simulate storage quota limits, corrupted JSON recovery, and export/import.
4. Cross-Browser Verification:
   - Verify rendering and key capture across Chromium, Firefox, and WebKit.

Expected Result:
All test suites pass 100% with zero failures, confirming rock-solid stability.

Validation:
Master test script outputs: "ALL SUITES PASSED (218/218 Lessons, 0 Regressions)".
```

```text
================================================================================
PHASE 15: RELEASE CANDIDATE AUDIT & FINAL DELIVERY
================================================================================
Status:       [PLANNED]
Dependencies: Phase 14
Files:        README.md, manifest.json, service-worker.js

Goal:
Package the completed PK Khmer Type learning system for production release,
verifying offline PWA readiness and documenting the codebase.

Why It Exists:
Provides final validation against the Definition of Done, cleans up scratch
development artifacts, and guarantees flawless zero-latency offline operation.

Main Work:
1. PWA & Offline Packaging:
   - Audit service worker cache to ensure all assets (audio, fonts, curricula)
     cache for 100% offline functionality.
2. Code Cleanup:
   - Remove temporary scratch scripts and diagnostic logs.
3. Documentation Finalization:
   - Update README.md with complete curriculum details, shortcut reference,
     and technical architecture notes.
4. Final Sign-off Report:
   - Deliver comprehensive sign-off audit verifying all acceptance criteria.

Expected Result:
PK Khmer Type is completely packaged, documented, verified, and ready for release.

Validation:
Clean git working tree, verified offline PWA audit, 100% passing test matrix.
```

---

### 15.2 Critical Path & Execution Sequencing

$$\mathbf{Phase\ 9\ [Done]} \longrightarrow \mathbf{Phase\ 10\ [Next]} \longrightarrow \mathbf{Phase\ 12} \longrightarrow \mathbf{Phase\ 13} \longrightarrow \mathbf{Phase\ 14} \longrightarrow \mathbf{Phase\ 15\ [Release]}$$

*Parallel Opportunity:* **Phase 11 (Practice Expansion)** can execute concurrently with **Phase 12 (Khmer Adaptive Engine)** since practice word banks and race texts are decoupled from the adaptive algorithm. Both depend only on Phase 10 and both must finish before Phase 13 begins (Phase 13 localizes UI strings that Phase 11's race/trial UI and Phase 12's Khmer adaptive UI introduce).

**Sequencing rationale (why this order, not another):**
- **Phase 10 must come first** because Phases 11–14 all assume the ≥90% checkpoint gate exists — Phase 14's regression suite, for instance, verifies gating behavior directly.
- **Phase 13 (Localization) is deliberately placed *after* Phases 11 and 12**, not in parallel with them, because both phases introduce new user-facing strings (race categories, adaptive Khmer progress labels) that would otherwise need translating twice.
- **Phase 14 must be last before release** so it verifies the *final* state of the UI and content, not an intermediate one.
- If engineering capacity allows a second developer, Phase 11 and Phase 12 assigned to different people is the only safe parallelization point in this roadmap — every other adjacent pair has a real data or UI dependency.

### 15.3 Decisions Log (Resolved Open Questions)

The original plan carried three unresolved questions into the roadmap. Shipping a plan with open questions in its execution phases is a risk in itself — each is resolved below, with the reasoning, so Phases 11–15 can be implemented without re-litigating them mid-build. Any future reversal of a decision here should be logged as a dated addendum rather than a silent edit.

| # | Question | Decision | Reasoning |
| :---: | :--- | :--- | :--- |
| 1 | Should Typing Race have a cloud leaderboard (e.g. Firebase)? | **No — local storage only**, for this release. Revisit post-launch only if usage data shows demand for social/competitive features. | Matches the Non-Goals in Section 0 (no accounts, no server dependency) and the product's stated zero-external-network-dependency posture. A cloud leaderboard also introduces moderation, abuse, and privacy surface area disproportionate to its value at this stage. |
| 2 | Should key-click sounds be Web Audio synthesis or audio samples? | **Web Audio API synthesis.** | Zero added network payload, no licensing questions for sampled sounds, and consistent with the offline-first / `file:///`-protocol requirement already enforced for curriculum data (Section 1). |
| 3 | Should early Khmer adaptive practice use isolated syllables or full dictionary words? | **Authentic syllables from `data/adaptive-vocab.js`**, escalating to full words only once enough consonants/vowels are unlocked to form them validly. | Matches how the rest of the curriculum already gates vocabulary by cumulative unlocked characters (Section 8); forcing full words too early would either violate the zero-future-characters rule or produce an unnaturally tiny word pool. |

**One new open item surfaced by this revision** (not present in the original plan): **What is the maximum acceptable size for `data/curriculum-data.js`?** At 664 exercises and growing practice-mode word banks (Phase 11 adds 500+ Khmer / 1,000+ English words), the single-bundle-for-zero-latency-offline-load design (Section 1) could grow large enough to slow initial page load on low-end devices. *Recommendation:* set an explicit budget — e.g. 2 MB gzipped for `curriculum-data.js` — and have `scripts/bundle_curricula.js` fail the build if exceeded, splitting practice-mode word banks into a lazily-loaded secondary bundle if the budget is hit. This is tracked as **Risk R6** in Section 16.

---

### Connections to Existing Planning Documents

| Existing Plan / Spec | File Location | How It Connects to Master Roadmap | Action |
| :--- | :--- | :--- | :--- |
| **Lesson Overhaul Master Plan** | `lesson_overhaul_plan.md` | Single source of truth for curriculum structure, 218 lesson specs, 10-stage pedagogy, and keyboard physics comparison. | **CONTINUE FROM EXISTING PLAN** (Phases 10–12 directly continue from here) |
| **Implementation Tasks Baseline** | `task.md` | Tracks foundational phases (Phases 2–7.9) including tracking (`PK_TRACKER`), review rules, and lesson strip fixes. | **ARCHIVED RECORD OF WORK** (Incorporated into Phase 1–9 baseline) |
| **Phase 7 Progress Spec** | `implementation_plan.md` | Architectural blueprint for character mastery classification (`locked` $\to$ `learning` $\to$ `proficient` $\to$ `mastered`). | **SUBSYSTEM SPEC** (Governs `js/review.js` candidate queues in Phase 11) |
| **Phase 8 Adaptive Practice Report** | `walkthrough.md` | Detailed report on adaptive practice architecture, dynamic percentage formula, Keybr-style UI, and word generator. | **SUBSYSTEM SPEC** (Governs Phase 12 Khmer adaptive expansion) |
| **Data Models & Characters** | `data/characters/*.json` | Character catalogs, key assignments, and unicode codepoint mappings. | **DATA ASSETS** (Referenced continuously) |
| **Curriculum Data Sources** | `data/curriculum/*/*.json` | Raw levels, lessons, and exercises partitioned by layout. | **DATA ASSETS** (Directly audited in Phase 10) |

---

## 16. RISK REGISTER & MITIGATION STRATEGY

Every phase in Section 15 assumes its Main Work goes roughly as planned. This register names the specific ways it might not, ranked by severity, so mitigation is designed in advance rather than improvised mid-phase.

| # | Risk | Phase(s) Affected | Likelihood | Impact | Mitigation |
| :---: | :--- | :--- | :---: | :---: | :--- |
| **R1** | **Checkpoint gate retroactively locks existing users out of progress they already earned**, because a lesson that was previously unlockable-by-completion no longer meets the new ≥90% accuracy bar. | 10 | Medium | High | Apply the new gate only to lessons **completed after** the Phase 10 release; grandfather existing completions as-is (consistent with the no-relocking rule already established in Section 13). See Section 18 for the staged rollout mechanism. |
| **R2** | **Khmer syllable generator (Phase 12) produces a grapheme cluster that is Unicode-valid but not a real or pronounceable Khmer syllable**, undermining the "authentic vocabulary" principle (Section 3). | 12 | Medium | Medium | Validate generator output against `data/adaptive-vocab.js`'s known-syllable set in the Phase 12 test suite (Section 16→19 Testing Matrix row "Khmer Syllable Engine") before allowing novel (non-dictionary) combinations into practice. |
| **R3** | **Phase 12 (Khmer adaptive) is harder than estimated** because Standard's spacebar-Coeng and NiDA's Shift+J-Coeng require materially different generator logic, not a shared implementation with a flag. | 12 | Medium | High | Ship Standard-layout adaptive parity first (simpler: Coeng is a plain keystroke), NiDA second. This is a real, shippable partial win if the phase overruns, unlike an all-or-nothing implementation. |
| **R4** | **Localization debt reappears** — new strings introduced in Phases 11–12 (race categories, Khmer adaptive UI) ship untranslated because Phase 13 already treated i18n as "done" for content that existed before them. | 13 | Medium | Medium | Section 15.2 already sequences Phase 13 after 11 and 12 for this reason; additionally, add the missing-translation-key check (already specified as a Phase 13 validation) to the Phase 14 regression suite so it re-runs on every subsequent content change, not just once. |
| **R5** | **`scripts/validate_curriculum.js` or `bundle_curricula.js` is run manually and forgotten** before a content change ships, letting an invalid or stale bundle reach production. | 10–15 (ongoing) | Medium | High | Wire both scripts into a pre-commit or CI check that blocks merges on non-zero exit code, rather than relying on developer discipline. (Not previously specified anywhere in this plan — see Section 18.) |
| **R6** | **`data/curriculum-data.js` bundle grows too large** for the zero-latency offline-load design as Phase 11 adds large word banks, degrading first-load time on low-end devices. | 11, 15 | Low–Medium | Medium | Enforce the bundle-size budget from Section 15.3's new open item; split practice-mode word banks into a separately-bundled, lazily-hydrated file if the curriculum-lesson bundle alone stays under budget. |
| **R7** | **Cross-browser Khmer rendering inconsistencies** (complex cluster shaping, ZWSP handling) surface only in Phase 14, late enough that fixing them threatens the release date. | 14 | Low | High | Pull forward a small, informal cross-browser smoke test (the specific cluster strings already listed in Phase 14's Main Work) into Phase 12, when the Khmer adaptive engine is first generating novel clusters — don't wait for the formal Phase 14 suite to be the first time these render in Firefox/WebKit. |
| **R8** | **Appendix B's character ledger and the real `data/keyboard.json` / `data/curriculum/*/lessons.json` disagree**, most likely in the 17 vowels Appendix B marks **(inferred)** — meaning Section 11's "Full Glyph Coverage" check is either silently failing today or was never actually exercised against the full glyph set. | Immediate (pre-Phase-10) | Medium–High | High | Before starting Phase 10, run `scripts/validate_curriculum.js`'s glyph-coverage check and diff its output against Appendix B by hand. Any glyph in Appendix B not found in the lessons data is a real content gap to fix now, not a documentation typo to fix later — a checkpoint gate (Phase 10) enforced on top of an incomplete character set would certify learners as "mastering" a layout they were never fully taught. |

**Register maintenance:** review this table at the start of each phase in Section 15; add a row for any newly-identified risk rather than handling it only in that phase's own "Main Work" prose, so risk visibility doesn't require re-reading every phase spec.

---

## 17. SUCCESS METRICS (POST-LAUNCH)

The Definition of Done (Section 21) certifies that the system was **built correctly**. It does not tell us whether it **works for learners**. These are separate questions, and conflating them is how a fully-tested release can still fail its actual purpose. The metrics below are what to watch in the weeks after Phase 15 ships, using the telemetry already captured by `js/tracker.js` (`PK_TRACKER`) and `js/progress.js` — no new instrumentation is required to observe them.

| Metric | Target | Source | Why It Matters |
| :--- | :--- | :--- | :--- |
| **Lesson-1 → Level-1-checkpoint completion rate** | ≥ 70% of learners who start Lesson 1 reach their first checkpoint | `khmerProgressData_v2` | Tests whether the new ≥90% accuracy gate (Phase 10) is a genuine milestone or an early-funnel drop-off cliff. If this is materially lower post-Phase-10 than pre-Phase-10, the gate is too strict and Risk R1's grandfathering logic should be re-examined for tuning, not just new-user impact. |
| **Checkpoint retry rate** | Median ≤ 2 attempts before passing | `PK_TRACKER` attempt logs | A learner needing many retries suggests the preceding lessons under-prepared them — a pedagogical signal, not just a UX one. |
| **Adaptive Practice adoption (Khmer)** | ≥ 30% of Khmer-layout learners who reach Level 5+ try Adaptive Practice at least once within Phase 12's first month live | `pk_adaptive_state_v1` presence | Directly measures whether Phase 12 closed the parity gap in a way learners actually use, not just in a way that passes its own test suite. |
| **Typing Race / Temple Trial repeat usage** | ≥ 40% of learners who try either mode return to it a second time within 7 days | Local session logs | Validates that Phase 11's word-bank and text expansion made these modes engaging enough to revisit, rather than a one-time novelty. |
| **Cross-layout completion parity** | Completion-rate gap between English and the two Khmer layouts ≤ 10 percentage points | `state.courses.{english,nida,standard}` | Section 1's layout-independence design should not translate into a quality gap; a persistent gap here would indicate the Khmer curricula (Sections 6–7) need attention despite passing all structural validation. |
| **Zero-latency load confirmation** | 95th-percentile time-to-interactive ≤ 1.5s on a mid-tier device, offline or online | Manual device-lab spot check (no existing telemetry for this) | Directly tests whether Risk R6 (bundle growth) materialized in practice, not just in size-budget theory. |

These are proposed targets calibrated to the scale of the current user base and codebase maturity, not benchmarked figures — revisit the thresholds once one release cycle of real data exists.

---

## 18. ROLLOUT & RELEASE STRATEGY

Phase 15 ("Release Candidate & Sign-off") currently ends at documentation and a clean git tree. That is necessary but not sufficient given Risk R1: Phase 10 changes the meaning of "unlocked" for a system with existing users and locally-persisted progress. This section specifies how the release actually reaches users.

1. **Staged rollout of checkpoint gating (addresses R1):**
   - On first load after the Phase 10 update, `js/progress.js` tags every currently-completed lesson with a `gateVersion: 0` marker (pre-gate). New completions are tagged `gateVersion: 1`.
   - The ≥90% accuracy requirement applies only to unlocking decisions made under `gateVersion: 1`. A `gateVersion: 0` completion continues to count as satisfying its `previousLesson` requirement for whoever already earned it — no learner is relocked by a rule that didn't exist when they completed the lesson.
   - This mechanism is temporary scaffolding, not a permanent schema feature; it can be retired (all records normalized to `gateVersion: 1`) once telemetry confirms no active users remain on pre-Phase-10 data, consistent with the Section 14 "Schema Versioning" migration-note requirement.
2. **CI enforcement of the validation gate (addresses R5):**
   - `scripts/validate_curriculum.js` and `scripts/bundle_curricula.js` run as a required, blocking check on every pull request that touches `data/curriculum/*` or `data/keyboard.json` — not just as a manual pre-release step. A red check blocks merge.
3. **Bundle-size budget enforcement (addresses R6):**
   - `scripts/bundle_curricula.js` fails the build if `data/curriculum-data.js` exceeds the gzipped-size budget set in Section 15.3. This failure is loud (non-zero exit, explicit message naming the offending section) rather than a silent oversize bundle shipping to users.
4. **Rollback plan:** the release artifact is the single `data/curriculum-data.js` bundle plus the versioned service worker (`service-worker.js`). If a Phase-15 release introduces a regression, reverting to the previous bundle and service-worker version is sufficient to roll back content and gating behavior without touching learner progress data, because progress is keyed by stable lesson IDs (Section 13) rather than by bundle version.
5. **Post-release monitoring window:** the Section 17 success metrics are reviewed at day 3, day 7, and day 30 post-release — not only once at an arbitrary "launch complete" point — so a metric that looks fine on day 1 but degrades (e.g., checkpoint retry rate climbing as more users reach it) is caught before it becomes the new normal.

---

## 19. COMPREHENSIVE TESTING MATRIX

| Test Domain | Target System | Tool / Method | Success Criteria |
| :--- | :--- | :--- | :--- |
| **Content Progression** | All Curricula | `scripts/validate_curriculum.js` | 0 unintroduced characters, 0 missing exercises, 0 broken lesson links across 218 lessons. |
| **Keystroke Depth** | All Curricula | `scripts/audit_curriculum_depth.js` | 0 lessons below 80 units (except Level 0 orientation). Layout average $\ge 90$ units. |
| **Keyboard Physics** | Standard vs. NiDA | Compile-time key lookup | Standard Coeng resolved to `space` base layer; NiDA Coeng resolved to `Shift+J`. |
| **Offline Startup** | Pre-bundled cache | `scripts/bundle_curricula.js` | `window.CURRICULUM_DATA` contains `standard`, `nida`, `english` with zero-latency load. |
| **Runtime Rendering** | UI Lesson Strip | Headless Chrome (CDP) | DOM contains correct card count on load; switching layout updates cards without reload. |
| **Persistence** | Progress Store | `js/progress.js` mock | Lesson completions save to `khmerProgressData_v2`; lesson $N$ completion unlocks $N+1$. |
| **Adaptive Decoupling** | Adaptive Engine | Storage key inspection | `pk_adaptive_state_v1` untouched by lesson sessions; mutual suspension works cleanly. |
| **Checkpoint Gating** | Progress / Lessons | Unit test (`test_checkpoints.js`) | Level $L+1$ unlocks only when Level $L$ checkpoint achieves $\ge 90\%$ accuracy. |
| **Khmer Syllable Engine**| Adaptive Engine | Automated test | Generates 100% grammatically valid syllables with 0 locked letters; every generated cluster cross-checked against `data/adaptive-vocab.js` (Risk R2). |
| **Full E2E Playthrough** | Complete Engine | Headless Chrome automated run | All 218 lessons simulate typing, reach completion, and assign stars without crash. |
| **Legacy Progress Preservation** | Progress / Migration | Unit test seeding pre-Phase-10 `khmerProgressData_v2` fixtures | No previously-completed lesson (`gateVersion: 0`) becomes locked after the Phase 10 update ships (Risk R1). |
| **State Resilience** | Progress Store | Corrupted-JSON and storage-quota-exceeded simulation | App degrades gracefully (no crash, no silent data loss) and surfaces a recovery path rather than a blank state. |
| **Bundle Size Budget** | Curriculum Bundle | `scripts/bundle_curricula.js` size check | `data/curriculum-data.js` stays under the gzipped budget set in Section 15.3 (Risk R6); build fails loudly if exceeded. |
| **Cross-Browser Rendering** | Khmer Text Shaping | Manual + automated smoke test on Chromium, Firefox, WebKit | Complex clusters (`ស្ដេច`, `កញ្ជ្រោង`) and ZWSP render identically across engines (Risk R7). |
| **CI Gate Enforcement** | Build Pipeline | Pull request check | `validate_curriculum.js` and `bundle_curricula.js` block merge on failure for any change touching `data/curriculum/*` or `data/keyboard.json` (Risk R5). |
| **Ledger↔Source Sync** | Character Coverage | Manual diff of Appendix B against `scripts/validate_curriculum.js` glyph-coverage output | Zero discrepancies between the documented character ledger and the actual JSON data, with special attention to the 17 characters Appendix B marks **(inferred)** (Risk R8). |

---

## 20. FINAL CURRICULUM AUDIT & ACCEPTANCE CRITERIA

Before final sign-off, the curriculum and application must satisfy the following checklist across all three layouts:

### English US Checklist:
- [x] Complete home-row anchor foundation (`f`, `j`, `space`).
- [x] Progressive reaches to top and bottom rows.
- [x] All 26 letters of the English alphabet systematically introduced.
- [x] Opposite-hand Shift coordination for capital letters.
- [x] Number row reaches (1–0) with structured finger assignments.
- [x] Punctuation, quotation marks, parentheses, and arithmetic symbols.
- [x] Authentic English word banks at every stage (zero nonsense words).
- [x] End-of-level checkpoints and 3-minute timed speed challenges.

### Khmer NiDA Checklist:
- [x] Index anchor keys `ថ` (F) and `ក` (K) with tactile rest rhythm.
- [x] Correct sequential introduction of home row consonants and vowel `ា`.
- [x] Coeng subscript mechanism explicitly taught at `Shift + J`.
- [x] Dedicated compound vowels (`ាំ`, `ុំ`, `ុះ`, `េះ`, `ោះ`) taught as single strokes.
- [x] Logical typing order enforced: Consonant $\rightarrow$ Subscript $\rightarrow$ Vowel.
- [x] Word separation with `Shift + Space`.
- [x] Comprehensive coverage of aspirated Shift consonants and dependent Shift vowels.
- [x] Diacritics (`៉`, `៊`, `៍`, `៏`, `័`, `៌`), Riel sign (`៛`), and repetition mark (`ៗ`).
- [x] AltGr independent vowels (`ឪ`, `ឧ`, `ឲ`, `ឯ`, `ឱ`).

### Khmer Standard Checklist:
- [x] Standard-specific keyboard physics strictly mapped and verified.
- [x] Coeng subscript marker explicitly taught on the **Spacebar base layer**.
- [x] Visible word separation taught on **`Shift + Space`**.
- [x] Unique Standard vowel placements: `ះ` on Semicolon, `ើ` and `ោះ` on brackets.
- [x] Unique Standard shift locations: `ៃ` (Shift+A), `ាំ` (Shift+S), `ុះ` (Shift+G), `៏` (Shift+H), `ុំ` (Shift+J).
- [x] Consonant `អ` correctly located and taught on Comma key.
- [x] Subscript cluster drills utilizing the thumb Spacebar Coeng sequence.
- [x] Independent vowels and speed mastery challenges matching Standard layout physics.

---

## 21. DEFINITION OF DONE

The learning system of PK Khmer Type is 100% complete and ready for release when:

1. **Parity Across All Layouts:** English (14 levels, 64 lessons), Khmer NiDA (13 levels, 77 lessons), and Khmer Standard (13 levels, 77 lessons) are fully specified and bundled in `data/curriculum-data.js`.
2. **Substantial Practice Depth:** Zero non-orientation lessons under 80 keystroke units; overall curriculum average exceeds 95 keystroke units per lesson.
3. **Machine-Verified Progression:** `scripts/validate_curriculum.js` outputs **`OVERALL RESULT: PASS`** with 0 errors, 0 warnings, and 0 out-of-order key violations across all 218 lessons.
4. **Browser Runtime Parity:** Switching between layouts dynamically updates the lesson strip with matching card counts in real browser testing.
5. **Progress & Adaptive Integrity:** User completion records persist safely without collisions, and Adaptive Practice functions in complete isolation.
6. **Milestone Gatekeeping:** Checkpoint lessons enforce $\ge 90\%$ accuracy before unlocking subsequent levels, **and no learner's pre-existing completion is retroactively relocked** (Section 18, Risk R1).
7. **Complete Practice Modes:** Temple Trial and Typing Race are populated with multi-tier authentic vocabularies and literary passages.
8. **Khmer Adaptive Parity:** Adaptive practice supports syllable-aware cluster generation for Khmer NiDA and Standard, with generated clusters validated against `data/adaptive-vocab.js` (Risk R2).
9. **Localization & Accessibility:** 100% translation coverage in English and Khmer, keyboard-accessible navigation, and WCAG high-contrast compliance.
10. **Full Regression Clearance:** Headless test battery confirms 218/218 lessons complete cleanly with zero errors across Chromium, Firefox, and WebKit (Section 19, "Cross-Browser Rendering").
11. **Build Pipeline Enforced:** `scripts/validate_curriculum.js` and `scripts/bundle_curricula.js` run as blocking CI checks, not manual steps (Section 18, Risk R5).
12. **Bundle Within Budget:** `data/curriculum-data.js` stays under the gzipped size budget defined in Section 15.3 (Risk R6).
13. **Rollback Verified:** A dry-run revert of the release bundle and service worker restores prior behavior without corrupting or relocking any learner's progress (Section 18).
14. **Character Ledger Confirmed:** Every character in Appendix B — including the 17 flagged **(inferred)** — is verified present in `data/curriculum/{nida,standard}/lessons.json` and `data/keyboard.json`, with zero discrepancies (Risk R8).

**Note:** items 1–10 are largely inherited from the original plan and confirm the system was *built* correctly. Items 11–14 close the gaps this revision identified — the release process itself and the completeness of the underlying data, not just the code, must be verified. Meeting all fourteen is the engineering gate; the Section 17 Success Metrics are the separate, later gate for confirming the release actually serves learners well.

---

## APPENDIX A: GLOSSARY

| Term | Meaning |
| :--- | :--- |
| **Finger codes** (`li`, `lm`, `lr`, `lp`, `ri`, `rm`, `rr`, `rp`, `thumb`) | Left/Right + Index/Middle/Ring/Pinky, plus `thumb` for the spacebar. Used throughout lesson `newKeys` and `fingerFocus` fields (Section 14) to drive the kinematic hands overlay in `js/keyboard.js`. |
| **Coeng** (`្`, U+17D2) | The Khmer subscript-forming character. Typed *after* the base consonant, before the consonant to be subscripted — its keyboard location is the single biggest mechanical difference between NiDA (`Shift+J`) and Standard (bare `Space`) (Section 7). |
| **Bantoc** (`់`) | A diacritic that shortens the preceding vowel sound (e.g. `កាក់`) — introduced early (Level 2) in Standard because of its high frequency (Section 7). |
| **ZWSP** | Zero-Width Space (`\u200B`) — what a bare `Space` keystroke produces in Khmer layouts; the *visible* word separator requires `Shift+Space` instead (Section 6). |
| **Typing unit** | The atomic slice of content the lesson engine advances by on each correct input, as produced by `splitIntoTypingUnits()` (Section 1) — not always a single Unicode codepoint, since Khmer grapheme clusters can span several codepoints. |
| **`gateVersion`** | The migration marker introduced in Section 18 to distinguish lesson completions earned before vs. after Phase 10's checkpoint-accuracy requirement took effect, so existing users are never retroactively relocked. |
| **E-D** | Engineer-days — the effort unit used in Section 15.1's estimates, calibrated to a single senior developer already familiar with this codebase. |

---

## APPENDIX B: MASTER CHARACTER COVERAGE LEDGER (EVERY LETTER, EVERY LAYOUT)

Sections 5–7 establish the *motor sequence* (which finger region unlocks when) but state individual characters piecemeal, spread across prose, comparison tables, and Mermaid node labels. That's sufficient for a human reading level-by-level, but it means no single place in the plan answers "has every character this layout can produce been assigned to a level?" — which is exactly the invariant Section 8's Content Validation Rules and Section 11's Automated Coverage Checker are supposed to guarantee. This appendix is that single place: every printable character in each layout, in one ledger, with the level that introduces it.

**Authority note:** `data/keyboard.json` remains the single source of truth for exact per-key layer assignment (Section 1) — this ledger is the human-auditable cross-check against it, not a replacement for it. Where this ledger assigns a character to a level and `data/keyboard.json` or `data/curriculum/*/lessons.json` disagrees, the JSON wins and this table must be corrected to match (see Risk R8 below). Cells marked **(inferred)** complete a level's set from its stated category (e.g., "remaining base keys") but were not individually named in Sections 5–7; they must be confirmed against `data/keyboard.json` before Phase 10 locks in checkpoint content, not assumed correct by virtue of appearing here.

### B.1 English (US) — All 26 Letters + Digits + Symbols (64 lessons / 14 levels)

| Level | New Characters Introduced | Count | Running Total |
| :---: | :--- | :---: | :---: |
| 0 | `f` `j` (+ `Space`) | 2 | 2 |
| 1 | `d` `k` `s` `l` | 4 | 6 |
| 2 | `a` `;` | 2 | 8 |
| 3 | `g` `h` | 2 | 10 |
| 4 | `e` `i` `r` `u` | 4 | 14 |
| 5 | `t` `y` `w` `o` `q` `p` | 6 | 20 |
| 6 | `c` `v` `b` `n` `m` `z` `x` `,` `.` | 9 | 29 |
| 7 | *(no new characters — full-alphabet pangram consolidation)* | 0 | 29 |
| 8 | `A`–`Z` (Shift layer / capitalization of all 26 letters as one mechanical concept, not 26 separate introductions) | +1 concept | 29 letters + Shift |
| 9 | `1` `2` `3` `4` `5` `6` `7` `8` `9` `0` | 10 | 39 |
| 10 | `!` `@` `#` `$` `%` `^` `&` `*` `(` `)` `-` `_` `=` `+` `[` `]` `{` `}` `\` `` ` `` `'` `"` `/` `?` `<` `>` `:` **(inferred distribution across Level 10's stated "Punctuation, Quotes, Hyphens & Brackets" scope)** | 26 | 65 |
| 11–13 | *(no new characters — prose, paragraphs, timed endurance)* | 0 | 65 |

**Reconciliation:** 26 letters + 10 digits + 26 symbols + 2 (`,` `.`, already counted in Level 6) + `;` (Level 2) + `Space` (Level 0) = every key on a standard 104-key US QWERTY layout's printable base/shift layers. This confirms Section 2's "0% below 80 units" and "96.2 avg units/lesson" figures rest on a complete, not partial, character set.

### B.2 Khmer NiDA & Khmer Standard — All 33 Consonants

Both layouts teach the same 33 Khmer consonants (the physical keys are shared for most base-layer letters, per the comparison table in Section 7 — e.g. `S`→`ស` and `K`→`ក` are identical in both layouts). What differs is *which layer* (base vs. Shift vs. Space) a handful of signs sit on, already itemized in Section 7's comparison table. The level column below applies to **both** layouts unless marked otherwise.

| Level | Consonants Introduced | Notes |
| :---: | :--- | :--- |
| 0 | ក ថ | Anchor pair, opposite-hand index fingers. |
| 1 | ស ដ ង ហ ល ញ | Home-row consonants (shared base-layer keys in both layouts, per Section 7's comparison table). |
| 3 | រ ត យ | Top-row high-frequency consonants (with vowels េ ុ ិ ោ — see B.3). |
| 4 | ច វ ប ន ម | Bottom-row high-frequency consonants (Standard also gains **អ** here, on Comma — Section 7). NiDA places អ at Level 6 instead (see Section 7's comparison table: Key `,` Shift in NiDA is `អ`... *(inferred placement — confirm against `data/keyboard.json`)*). |
| 5 | ខ ឆ ឋ ឡ **(inferred)** | Remaining *base-layer* consonants not yet covered — Section 6 names this level "Remaining Base Keys" without enumerating them individually. |
| 6 | គ ជ ទ ធ ព ភ ឌ ណ អ ឃ ឈ ឍ ផ **(last three inferred; first ten stated in Section 6)** | Aspirated / Shift-layer consonant pairs. |

**Total check:** 2 + 6 + 3 + 5 + 4 + 13 = 33. ✅ Matches the known Khmer consonant inventory exactly, confirming no consonant is orphaned outside the level ladder.

### B.3 Khmer NiDA & Khmer Standard — Vowels, Signs & Diacritics

| Category | Characters | Level | Source |
| :--- | :--- | :---: | :--- |
| Dependent vowel (home) | ា | 1 | Section 6 (`ស្រៈ ា`) |
| Dependent vowel (home) | ើ | 2 | Section 6 |
| Sign | ់ (Bantoc) | 2 | Sections 6 & 7 |
| Dependent vowels (top row) | េ ុ ិ ោ | 3 | Section 6 |
| Sign | ។ (Khan / full stop) | 4 | Section 6 |
| Coeng | ្ (U+17D2) | 5 | Section 6 — NiDA: `Shift+J`; Standard: base `Space` (Section 7). Different key, same level, per each layout's own ladder. |
| Dependent vowels (Shift / dedicated compound) | ែ ាំ ុំ ុះ េះ ោះ ៀ ឿ ៃ ៏(sign, see below) | 7 | Section 6 heading "Shift Vowels & Dedicated Compound Vowels"; individual glyphs drawn from Section 7's comparison table entries. |
| Dependent vowels **(inferred remainder)** | ី ឹ ឺ ូ ួ ៅ | 7–8 **(inferred)** | Not individually named in Sections 6–7; complete the 16-member dependent-vowel set. Must be confirmed against `data/keyboard.json` before treating Level 7's "Shift Vowels" as 100% covered. |
| Diacritics & signs | ៉ ៊ ៍ ៏ ័ ៌ ៛ ៗ | 9 | Section 6, fully enumerated — no inference needed. |
| Independent vowels (named) | ឪ ឧ ឲ ឯ ឱ | 12 | Section 17's NiDA checklist, fully enumerated. |
| Independent vowels **(inferred remainder)** | ឣ ឤ ឥ ឦ ឩ ឫ ឬ ឭ ឮ ឰ ឳ | 12 **(inferred)** | Completes the 16-member independent-vowel set as a single batch at the same level as the five named ones — these are rare enough in running text that batching them is pedagogically defensible, but the batch itself was not stated in the original plan. |

**Why this table matters more than it looks:** the rows marked **(inferred)** are precisely the gap between "the plan reads as complete" and "the plan *is* complete." Six dependent vowels and eleven independent vowels appear nowhere in the original document's prose, diagrams, or checklists — yet Section 11's Automated Coverage Checker claims "Full Glyph Coverage" as a hard validation gate. If those seventeen characters aren't actually in `data/curriculum/{nida,standard}/lessons.json` today, Section 11's checker should currently be failing, not passing. **This is a new, concrete action item, not just documentation cleanup — see Risk R8.**

---

