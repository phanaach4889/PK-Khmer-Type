# Khmer Writing System Reference for PK Khmer Type

**Audience:** AI coding agents (especially Google Antigravity) and developers rebuilding or improving PK Khmer Type.
**Purpose:** A practical, verified specification of the Khmer writing system, its Unicode encoding, its keyboard layouts, and how a typing-learning site should model all of it as data.
**Last verified:** 2 October 2026 (Unicode 16/17 core spec, Unicode Technical Note #61, Windows keyboard driver tables).

---

## 0. How to Read This Document

### 0.1 Confidence tags

Every non-trivial statement carries one of these tags so you can tell fact from advice.

| Tag | Meaning |
|---|---|
| **[UNI]** | Verified against the Unicode Standard (Chapter 16.4 and the Khmer code charts) or the Unicode character database. |
| **[UTN61]** | From Unicode Technical Note #61, "Khmer Encoding Structure" (M. Hosken, SIL, Feb 2025). Informative, **not normative**, but authoritative engineering guidance. |
| **[KBD]** | Verified from the Windows keyboard driver tables (`KBDKHMR.DLL` "Khmer", `KBDKNI.DLL` "Khmer (NIDA)"), via kbdlayout.info. |
| **[REF]** | Reference works on Khmer (Wikipedia "Khmer alphabet", UNGEGN romanization report, *Basic Khmer* by V. Sok). Good, but secondary. |
| **[TEACH]** | A simplified teaching explanation. Useful for learners, not strictly precise. |
| **[REC]** | A design recommendation for PK Khmer Type. A decision, not a fact about Khmer. |
| **[UNVERIFIED]** | Could not be verified. Do not hard-code without checking. |

### 0.2 Corrections to the starting notes you supplied

| Starting note | Verdict | Correction / nuance |
|---|---|---|
| "abugida writing system used for Khmer and Pali" | Mostly right | Khmer script is an abugida (alphasyllabary). It writes Khmer, and Pali in Cambodian and Thai Buddhist liturgy **[REF]**. It also writes Sanskrit and minority languages such as Tampuan, Krung, and Cham **[UNI]**. |
| "primary consonants, dependent vowels, subscript consonants, diacritics, and numerals" | Incomplete, one misleading part | Also has **independent vowels** and its own **punctuation**. Subscript consonants are **not separate characters** in Unicode: each is the two-character sequence `U+17D2 + consonant` **[UNI]**. |
| "two series based on their inherent vowels" | Right, with nuance | Each consonant has an inherent vowel, either â /ɑː/ or ô /ɔː/ **[REF]**. The series also changes how attached dependent vowels are pronounced **[UNI]**. Historically the series were voiceless vs. voiced **[REF]**. |
| "developed from South Indian scripts, including the Pallava tradition" | Right, hedge needed | Adapted from Pallava-type scripts of South India (5th-6th c.), ultimately from Brahmi **[REF]**. The Unicode Standard says the *exact* source is undetermined **[UNI]**. |
| "Khmer is the longest alphabet in the world" | Misleading | See section 1.7. |

### 0.3 Scope and assumptions

- This document covers **Modern Khmer**. Old/Middle Khmer and minority-language extensions are noted only where they affect data modelling.
- I have **not** seen the existing PK Khmer Type project files. Naming in this document may differ from the project. Where they conflict, follow the procedure in the "Instructions for AI Coding Agents" section.
- Phonetic values are **approximate and secondary** **[REF]**. They are not needed for typing correctness. Do not display pronunciation unless it comes from the data files below.

---

## 1. Khmer Alphabet Overview

### 1.1 What the Khmer script is

- Khmer script (អក្សរខ្មែរ, *âksâr khmêr*) is the official script of Cambodia. It is written **left to right** **[UNI]**.
- It is an **abugida** (also called alphasyllabary): the basic unit is a consonant that carries an inherent vowel, and other vowels are marked by signs attached to the consonant **[REF]**.
- Words in a phrase are generally **run together without spaces**. Spaces separate phrases or clauses, roughly where English would use a comma **[UNI][REF]**.
- Two main styles exist: **អក្សរជ្រៀង** (*âksâr chriĕng*, slanted) and **អក្សរមូល** (*âksâr mul*, round, used for titles, headings, banknotes). There is no structural difference between them **[UNI]**.

### 1.2 The inventory at a glance

| Category | Count | Unicode range | Notes |
|---|---|---|---|
| Consonant letters | **35** encoded, **33** used in modern Khmer | U+1780-U+17A2 | ឝ (U+179D) and ឞ (U+179E) are obsolete, used only for Pali/Sanskrit transliteration **[REF]** |
| Independent vowels | 15 in normal use | U+17A5-U+17B3 | Plus 2 **deprecated** (U+17A3, U+17A4) |
| Dependent vowel signs | 16 | U+17B6-U+17C5 | `ំ` (U+17C6) acts as vowel *am*; `ុំ` and `ាំ` are sequences **[UNI]** |
| Diacritics / signs | 12 + coeng + 1 discouraged | U+17C6-U+17D3 | See section 6 |
| Punctuation / symbols | 10 | U+17D4-U+17DD | Includes riel ៛ and atthacan ៝ |
| Digits | 10 | U+17E0-U+17E9 | ០-៩ |
| Divination numerals | 10 | U+17F0-U+17F9 | Not for arithmetic |
| Lunar date symbols | 32 | U+19E0-U+19FF (separate block) | Added Unicode 4.0 **[UNI]** |
| Inherent-vowel marks | 2 | U+17B4, U+17B5 | Invisible; **discouraged**, do not use |

Block sanity check: the Khmer block holds **114** assigned code points (35 + 2 + 15 + 2 + 16 + 14 + 10 + 10 + 10) **[UNI]**.

### 1.3 How the system works

A Khmer **orthographic syllable** is built around one base letter and optional attached parts:

```
base consonant (or independent vowel)
  + optional robat           ៌
  + 0-2 subscript consonants (coeng + consonant)
  + optional register shifter ៉ ៊
  + optional dependent vowel
  + optional signs/diacritics
  + optional final sign       ះ ៈ
```

The standard order of components, as BNF **[UNI]**:

```
B {R | C} {S {R}}* {{Z} V} {O} {S}
B = base (consonant, independent vowel)     R = robat
C = consonant shifter                       S = subscript consonant / independent-vowel sign
V = dependent vowel                         Z = ZWNJ or ZWJ
O = any other sign
```

The **stored order always follows pronunciation order**, never the visual order **[UNI]**.

### 1.4 The two consonant series (registers)

- **a-series (first series, "voiceless" in Khmer terminology):** inherent vowel â /ɑː/.
- **o-series (second series, "voiced" in Khmer terminology):** inherent vowel ô /ɔː/.
- The two series once marked voiceless vs. voiced consonants. Sound changes in Middle Khmer preserved the vowel differences even after the voicing contrast was lost **[REF]**.
- Counts: **15 a-series + 18 o-series = 33** modern consonants, plus the 2 obsolete letters **[REF][UTN61]**.
- Many a-series letters have an o-series twin with the same consonant sound (ក/គ, ខ/ឃ, ច/ជ ...). For the rest, **register shifters** switch a letter's series **[UNI]**:
  - `៉` MUUSIKATOAN (U+17C9): o-series to a-series. Example: រ៉ (ro + muusikatoan) is a-series.
  - `៊` TRIISAP (U+17CA): a-series to o-series. Example: ស៊ី (sa + triisap + ii).

### 1.5 The inherent vowel concept

- A consonant with no vowel sign written after it (in a strong syllable) is read with its inherent vowel: ចង = [cɑːŋ], ជត = [cɔːt] **[REF]**.
- In final position a bare consonant is read with no vowel. In weak initial syllables the inherent vowel is shortened **[REF]**.
- The **series determines the inherent vowel** and also the reading of attached vowel signs. Compare ក + ា = កា [kaː] with គ + ា = គា [kiə] **[UNI][REF]**.
- In a consonant **cluster** the series of the whole cluster is decided by the dominant consonant. Stops and fricatives dominate sonorants. When both are dominant, the subscript decides **[REF]**.

### 1.6 Why Khmer differs from an alphabetic system such as English

| Aspect | English (alphabet) | Khmer (abugida) | Consequence for PK Khmer Type |
|---|---|---|---|
| Unit of writing | One letter per sound | Consonant + inherent vowel; vowels attach as signs | Teach the *syllable*, not the letter sequence. |
| Order of characters | Visual order = typing order = reading order | Stored order follows **pronunciation**; visual order often differs | Engine must separate logical, visual, and key order. |
| Vowel pronunciation | Mostly independent of neighbours | One vowel sign has **two readings** depending on series | Teach series before vowels. |
| Consonant clusters | Adjacent letters | Second consonant is a **subscript form** attached via coeng | `C C` is not `C coeng C`. |
| Word spacing | Spaces between words | Usually none between words | Do not treat spaces as word boundaries in scoring. |
| Character count vs. perceived unit | One code point ≈ one letter | One perceived syllable = several code points | Cursor, backspace, comparison work on syllable-aware units. |
| Normalization | Rarely an issue | Visually identical text can have different underlying sequences | Normalize before comparing (section 8). |

### 1.7 The "longest alphabet in the world" claim

**Status: widely repeated, poorly sourced, and terminologically inaccurate. Do not put it in the product as a fact.**

1. **Terminology.** Khmer is an *abugida/alphasyllabary*, not an alphabet in the strict sense. Vowels are mostly dependent signs attached to consonants **[REF]**. Even sources that repeat the claim concede this.
2. **Source.** It is usually attributed to a 1995 Guinness record with the figure **74** letters. I could not locate the original Guinness entry; every source found was secondary **[UNVERIFIED]**.
3. **Arithmetic.** The popular breakdown "33 consonants + 23 vowels + 12 independent vowels" sums to **68**, not 74. One breakdown that reaches 74 is 35 consonants + 24 dependent vowels + 15 independent vowels. That is *my own inference*, and no source I found states it **[UNVERIFIED]**.
4. **Counting is a choice.** Unicode counts 16 dependent vowel signs, while teaching traditions count about 21-24 by including combinations (ុំ, ាំ, ុះ, េះ ...). Whether subscripts or diacritics are "letters" is a convention, not a fact.

**[REC]** If the product mentions it, phrase it as: *"Khmer script is often described as having one of the largest character sets of any alphabet-like system, though counts vary depending on what you include."* Better still, omit it.

### 1.8 Terminology table (English and Khmer)

Khmer script forms below are taken from verified sources. Items marked † are **derived from a stated naming rule** and should be spot-checked by a Khmer speaker before being shown to users.

| English | Khmer | Romanization | Notes |
|---|---|---|---|
| Khmer script | អក្សរខ្មែរ | *âksâr khmêr* | **[REF]** |
| Consonant | ព្យញ្ជនៈ | *pyĕnchônéa* | † commonly used term |
| a-series / first series | (voiceless series) | *â-series* | **[REF]** |
| o-series / second series | (voiced series) | *ô-series* | **[REF]** |
| Subscript consonant | ជើងអក្សរ | *cheung âksâr* "foot of a letter" | **[REF]** |
| Coeng (generator) | U+17D2 `្` | *coeng* "foot" | The Unicode character is a *generator*, not itself a subscript **[UNI]** |
| Dependent vowel | ស្រៈនិស្ស័យ / ស្រៈផ្សំ | *srăk nĭssăy / srăk phsâm* | **[REF]** |
| Independent vowel | ស្រៈពេញតួ | *srăk pénh tuŏ* "complete vowel" | **[REF]** |
| Diacritic | វណ្ណយុត្តិ | *vônnâyŭttĕ* | **[REF]** |
| Nikahit | និគ្គហិត | *nĭkkôhĕt* | **[REF]** |
| Khan (full stop) | ខណ្ឌ | *khând* | **[REF]** |
| Orthographic syllable | n/a | n/a | Unicode term for base + attached parts **[UNI]** |
| Register shifter | n/a | *muusikatoan, triisap* | Unicode term "consonant shifter"; both names in use **[UNI]** |

---

## 2. Complete Khmer Consonant Inventory

### 2.1 Conventions

- **Code** is the Unicode code point. All 35 are in U+1780-U+17A2 **[UNI]**.
- **Spoken name** = the consonant's sound + its inherent vowel (for example ក is named /kɑː/). Romanization is the Cambodian Geographic Department / UNGEGN style (â = a-series vowel, ô = o-series vowel) **[REF]**.
- **Initial sound (IPA)** is the sound before a vowel, in Standard (Battambang-based) Khmer **[REF]**. Approximate. Obsolete letters carry no modern value.
- **Series** follows UTN #61 and standard references. Disagreements are in section 2.4.
- **STD / NiDA key** = physical key on the Windows layouts, verified from the driver tables **[KBD]**. See section 9 for full layouts.

### 2.2 Consonant table (all 35)

| # | Char | Code | Unicode name | Romanized name | Series | Initial sound | STD key | NiDA key |
|---|---|---|---|---|---|---|---|---|
| 1 | ក | U+1780 | KHMER LETTER KA | kâ | a | [k] | K | K |
| 2 | ខ | U+1781 | KHMER LETTER KHA | khâ | a | [kʰ] | X | X |
| 3 | គ | U+1782 | KHMER LETTER KO | kô | o | [k] | Shift+K | Shift+K |
| 4 | ឃ | U+1783 | KHMER LETTER KHO | khô | o | [kʰ] | Shift+X | Shift+X |
| 5 | ង | U+1784 | KHMER LETTER NGO | ngô | o | [ŋ] | G | G |
| 6 | ច | U+1785 | KHMER LETTER CA | châ | a | [c] | C | C |
| 7 | ឆ | U+1786 | KHMER LETTER CHA | chhâ | a | [cʰ] | Q | Q |
| 8 | ជ | U+1787 | KHMER LETTER CO | chô | o | [c] | Shift+C | Shift+C |
| 9 | ឈ | U+1788 | KHMER LETTER CHO | chhô | o | [cʰ] | Shift+Q | Shift+Q |
| 10 | ញ | U+1789 | KHMER LETTER NYO | nhô | o | [ɲ] | J | Shift+J |
| 11 | ដ | U+178A | KHMER LETTER DA | dâ | a | [ɗ] | D | D |
| 12 | ឋ | U+178B | KHMER LETTER TTHA | thâ | a | [tʰ] | Z | Z |
| 13 | ឌ | U+178C | KHMER LETTER DO | dô | o | [ɗ] | Shift+D | Shift+D |
| 14 | ឍ | U+178D | KHMER LETTER TTHO | thô | o | [tʰ] | Shift+Z | Shift+Z |
| 15 | ណ | U+178E | KHMER LETTER NNO | nâ | **a** (see 2.4) | [n] | Shift+N | Shift+N |
| 16 | ត | U+178F | KHMER LETTER TA | tâ | a | [t] | T | T |
| 17 | ថ | U+1790 | KHMER LETTER THA | thâ | a | [tʰ] | F | F |
| 18 | ទ | U+1791 | KHMER LETTER TO | tô | o | [t] | Shift+T | Shift+T |
| 19 | ធ | U+1792 | KHMER LETTER THO | thô | o | [tʰ] | Shift+F | Shift+F |
| 20 | ន | U+1793 | KHMER LETTER NO | nô | o | [n] | N | N |
| 21 | ប | U+1794 | KHMER LETTER BA | bâ | a | [ɓ] | B | B |
| 22 | ផ | U+1795 | KHMER LETTER PHA | phâ | a | [pʰ] | P | P |
| 23 | ព | U+1796 | KHMER LETTER PO | pô | o | [p] | Shift+B | Shift+B |
| 24 | ភ | U+1797 | KHMER LETTER PHO | phô | o | [pʰ] | Shift+P | Shift+P |
| 25 | ម | U+1798 | KHMER LETTER MO | mô | o | [m] | M | M |
| 26 | យ | U+1799 | KHMER LETTER YO | yô | o | [j] | Y | Y |
| 27 | រ | U+179A | KHMER LETTER RO | rô | o | [r] | R | R |
| 28 | ល | U+179B | KHMER LETTER LO | lô | o | [l] | L | L |
| 29 | វ | U+179C | KHMER LETTER VO | vô | o | [ʋ] | V | V |
| 30 | ឝ | U+179D | KHMER LETTER SHA | (śa) | **contested** (see 2.4) | none (obsolete) | Ctrl+Alt+Shift+. | **not present** |
| 31 | ឞ | U+179E | KHMER LETTER SSO | (ṣa) | a (see 2.4) | none (obsolete) | Ctrl+Alt+Shift+/ | **not present** |
| 32 | ស | U+179F | KHMER LETTER SA | sâ | a | [s] | S | S |
| 33 | ហ | U+17A0 | KHMER LETTER HA | hâ | a | [h] | H | H |
| 34 | ឡ | U+17A1 | KHMER LETTER LA | lâ | a | [l] | Shift+L | Shift+L |
| 35 | អ | U+17A2 | KHMER LETTER QA | ’â | a | [ʔ] | `,` key (unshifted) | Shift+G |

Series count (modern 33): **a = 15** (ក ខ ច ឆ ដ ឋ ណ ត ថ ប ផ ស ហ ឡ អ), **o = 18** (គ ឃ ង ជ ឈ ញ ឌ ឍ ទ ធ ន ព ភ ម យ រ ល វ) **[REF][UTN61]**.

### 2.3 Pronunciation notes (important, all [REF] unless stated)

- **Aspirated letters** (ខ ឆ ឋ ថ ផ and o-series ឃ ឈ ឍ ធ ភ) are aspirated only before a vowel. Slight aspiration of k/ch/t/p before certain consonants occurs regardless of spelling.
- **ប** is [ɓ] only before a vowel. Final, or followed by subscript ល, it is [p]. Written with `៉` (ប៉) it is the separate sound [p] **[UNI]**.
- **ដ** and **ឌ** are [t] when final. **ត** is [ɗ] in some weak syllables.
- **ក ខ** (k-sounds) at the end of certain syllables are realized as a glottal stop [ʔ].
- **រ** is silent when final in most dialects. **ស** final is pronounced /h/.
- **ញ** loses its lower curve when it carries a subscript. When subscripted to itself it becomes a smaller whole letter: ញ្ញ **[REF][UNI]**.
- **ឋ ឌ ឍ ណ** (with ដ) were retroflex consonants in the Indic parent scripts. ឋ, ឌ, ឍ are rare and occur only in Pali/Sanskrit loans. ណ was adapted as an a-series counterpart of ន because /n/ is common **[REF]**.
- **ឝ and ឞ** are obsolete, used only for Pali/Sanskrit transliteration; historically palatal and retroflex sibilants **[REF]**.
- **Supplementary consonants** for loanwords (French/Thai) are digraphs made from ហ + subscript, with ៊ if needed. ប៉ is the odd one: pa is ប + muusikatoan **[REF]**. They are *spelled* with existing characters, so no extra code points exist.

### 2.4 Source disagreements about series (do not silently choose)

| Letter | What sources say | Resolution in this document |
|---|---|---|
| ណ (U+178E) | Wikipedia, UTN #61, Sok's *Basic Khmer*: **a-series**. The Unicode **name** "NNO" (with "o") suggests o-series; UTN #61 says the series is "swapped from that implied by the Unicode name". One learner site (learnkhmer.org) lists it as o-series. | **a-series.** Never infer series from Unicode names. Store series explicitly in data. |
| ឞ (U+179E) | UTN #61: series 1 (a), also swapped relative to its name "SSO". | **a-series**, obsolete. |
| ឝ (U+179D) | UTN #61: historically series 1 for Pali/Sanskrit; re-assigned series 2 for current minority-language use. | **contested**; mark `series: "contested"`, `status: "obsolete"`. |
| Number of vowel readings | Some sources give identical readings for ឹ and េ in both series; Wikipedia and others show a difference for ឹ. | See section 3.3. |

### 2.5 Subscript (coeng) form for every consonant

Every consonant has a subscript form **except ឡ** in standard Cambodian orthography (a `U+17D2 U+17A1` form exists in Unicode and in Thai-used Khmer) **[UNI]**. All entries are the sequence `U+17D2` + consonant code point **[UNI]**.

| Consonant | Subscript | Sequence | Notes |
|---|---|---|---|
| ក ខ គ ឃ ង | ្ក ្ខ ្គ ្ឃ ្ង | 17D2 1780 / 1781 / 1782 / 1783 / 1784 | ្ឃ has an ascender to the right |
| ច ឆ ជ ឈ | ្ច ្ឆ ្ជ ្ឈ | 17D2 1785 / 1786 / 1787 / 1788 | ្ឈ has an ascender to the right |
| ញ | ្ញ | 17D2 1789 | Shape changes after ញ itself (ញ្ញ) |
| ដ | ្ដ | 17D2 178A | **Looks identical to ្ត in modern fonts** |
| ឋ ឌ ឍ ណ | ្ឋ ្ឌ ្ឍ ្ណ | 17D2 178B / 178C / 178D / 178E | |
| ត ថ ទ ធ ន | ្ត ្ថ ្ទ ្ធ ្ន | 17D2 178F / 1790 / 1791 / 1792 / 1793 | ្ត is the preferred storage for the shared ្ត/្ដ form (section 5.6) |
| ប ផ ព ភ ម | ្ប ្ផ ្ព ្ភ ្ម | 17D2 1794 / 1795 / 1796 / 1797 / 1798 | ្ប has an ascender |
| យ | ្យ | 17D2 1799 | Right-spacing |
| រ | ្រ | 17D2 179A | **Drawn to the LEFT of the base**; special ordering (section 5.4) |
| ល វ | ្ល ្វ | 17D2 179B / 179C | |
| ឝ ឞ | ្ឝ ្ឞ | 17D2 179D / 179E | Obsolete |
| ស ហ | ្ស ្ហ | 17D2 179F / 17A0 | ្ស has an ascender |
| ឡ | (none in Cambodia) | 17D2 17A1 | Non-standard; confusable with ្ប in some fonts **[UTN61]** |
| អ | ្អ | 17D2 17A2 | Unicode names it "KHMER VOWEL SIGN COENG QA" **[UNI]** |

**Independent vowels with subscript forms** (rare): `17D2 17A7` ្ឧ, `17D2 17AB` ្ឫ, `17D2 17AC` ្ឬ, `17D2 17AF` ្ឯ **[UNI]**. A common word uses one: **ឲ្យ / ឱ្យ** "to give" (`17B2 17D2 1799` or `17B1 17D2 1799`).


---

## 3. Khmer Dependent Vowels

### 3.1 The 16 dependent vowel signs

Dependent vowel signs (ស្រៈនិស្ស័យ) **cannot stand alone**. They attach to a consonant or consonant cluster. They are always **stored after** the consonant (and after any coeng and shifter) even when part of the glyph is drawn to the left **[UNI]**. In charts they are shown on a dotted circle ◌ (U+25CC), which is a *display placeholder*, never part of Khmer text.

| Sign | Code | Unicode name | Khmer name (derived †) | a-series value | o-series value | Where drawn | STD key | NiDA key |
|---|---|---|---|---|---|---|---|---|
| ◌ា | U+17B6 | VOWEL SIGN AA | ស្រៈអា | /aː/ | /iə/ | after (right) | A | A |
| ◌ិ | U+17B7 | VOWEL SIGN I | ស្រៈអិ | /e/ (also /ə/) | /i/ (also /ɨ/) | above | I | I |
| ◌ី | U+17B8 | VOWEL SIGN II | ស្រៈអី | /əj/ | /iː/ | above | Shift+I | Shift+I |
| ◌ឹ | U+17B9 | VOWEL SIGN Y | ស្រៈអឹ | /ə/ | /ɨ/ | above | W | W |
| ◌ឺ | U+17BA | VOWEL SIGN YY | ស្រៈអឺ | /əɨ/ | /ɨː/ | above | Shift+W | Shift+W |
| ◌ុ | U+17BB | VOWEL SIGN U | ស្រៈអុ | /o/ | /u/ | below | U | U |
| ◌ូ | U+17BC | VOWEL SIGN UU | ស្រៈអូ | /ou/ | /uː/ | below | Shift+U | Shift+U |
| ◌ួ | U+17BD | VOWEL SIGN UA | ស្រៈអួ | /uə/ | /uə/ | below | Shift+Y | Shift+Y |
| ◌ើ | U+17BE | VOWEL SIGN OE | ស្រៈអើ | /aə/ | /əː/ | before **and** above | `[` | `;` |
| ◌ឿ | U+17BF | VOWEL SIGN YA | ស្រៈអឿ | /ɨə/ | /ɨə/ | split: before and after | `]` | Shift+`[` |
| ◌ៀ | U+17C0 | VOWEL SIGN IE | ស្រៈអៀ | /iə/ | /iə/ | split: before and after | Shift+`]` | `[` |
| ◌េ | U+17C1 | VOWEL SIGN E | ស្រៈអេ | /eː/ (see 3.3) | /eː/ | **before** (left) | E | E |
| ◌ែ | U+17C2 | VOWEL SIGN AE | ស្រៈអែ | /ae/ | /ɛː/ | **before** (left) | Shift+E | Shift+E |
| ◌ៃ | U+17C3 | VOWEL SIGN AI | ស្រៈអៃ | /aj/ | /ɨj/ | **before** (left) | Shift+A | Shift+S |
| ◌ោ | U+17C4 | VOWEL SIGN OO | ស្រៈអោ | /ao/ | /oː/ | split: before and after | O | O |
| ◌ៅ | U+17C5 | VOWEL SIGN AU | ស្រៈអៅ | /aw/ | /ɨw/ | split: before and after | Shift+O | Shift+O |

Sources: code points, names, keys **[UNI][KBD]**. Placement from UTN #61 (pre-base: 17BE, 17C1-17C3; split with pre- and post-base parts: 17BF, 17C0, 17C4, 17C5) **[UTN61]**. IPA values are representative of Standard Khmer **[REF]** and transcription conventions differ between sources. Khmer names † are derived from the rule "ស្រៈ + glottal stop + the a-series value" **[REF]**.

### 3.2 Vowels that combine with a sign (vowel-plus-final)

| Sequence | Code points | Notes | a-series / o-series |
|---|---|---|---|
| ◌ុំ | `17BB 17C6` | "om". A **sequence**, not a single character **[UNI]** | /om/, /um/ |
| ◌ាំ | `17B6 17C6` | "aam". A **sequence** **[UNI]** | /am/, /oəm/ |
| ◌ំ | `17C6` | "am". Encoded as the nikahit sign | /ɑm/, /um/ |
| ◌ះ | `17C7` | final -h (reahmuk) | /ah/, /eəh/ |
| ◌ុះ, ◌េះ, ◌ោះ, ◌ិះ | vowel + `17C7` | common vowel + final h forms | varies by series |

Nikahit is used with ា and ុ but **not** with ី, េ, ួ, ើ, ោ and similar vowels **[UNI]**.

### 3.3 Where sources disagree on vowel readings

- **ឹ (U+17B9):** most references give a-series /ə/, o-series /ɨ/. *Basic Khmer* (Sok) groups ឹ with vowels read the same in both series (/ə/), a common teaching simplification and a real feature of Phnom Penh speech **[REF]**.
- **េ (U+17C1):** sources variously show /eː/ in both series, or /ei/ (a-series) vs /eː/ (o-series).
- **ិ (U+17B7):** a-series /e/ vs /ə/, and o-series /i/ vs /ɨ/, depending on source and context.

**[REC]** Store the pronunciation field as `ipa: { a: "...", o: "..." }` with `confidence: "approximate"` and `sources`. Do **not** use IPA in any correctness logic. It is for display only.

### 3.4 Logical order vs. visual order vs. key order

This is the single most important concept for the typing engine.

| Term | Meaning | Example: syllable កេ (ke) |
|---|---|---|
| **Logical (Unicode) order** | The order of code points in the string; follows **pronunciation** | `1780 17C1`: consonant first, then the vowel |
| **Visual order** | Left-to-right order of glyphs on screen | េ glyph appears to the **left** of ក |
| **Key order** | The order the learner presses keys | K, then E (same as logical here) |

**Rules [UNI]**

1. All Khmer dependent vowels are encoded **after** their consonant, even when drawn to its left. (This differs from Thai and Lao, where left-side vowels are typed first.)
2. The shaping engine/font chooses the visual placement. The application must **never** store glyph fragments in visual order.
3. Pressing the vowel key first and the consonant second produces `17C1 1780`, which is an **invalid** sequence (a dotted circle or detached vowel will render).
4. Split vowels (ោ ៅ ឿ ៀ) and pre-base vowels (េ ែ ៃ ើ) are **one code point each**. There is no separate "left half" character to type or store.
5. ◌ាំ and ◌ុំ are **two** code points that render as one visual vowel.

**Worked examples** (stored order always base, coeng(s), shifter, vowel, signs):

| Word | Visual idea | Logical code points | STD keys | NiDA keys |
|---|---|---|---|---|
| កេ | េ drawn left of ក | `1780 17C1` | K, E | K, E |
| ច្រើន | ្រ drawn left of ច; ើ drawn left+above | `1785 17D2 179A 17BE 1793` | C, Space, R, `[`, N | C, J, R, `;`, N |
| សៀវភៅ | ៀ and ៅ each split around their consonant | `179F 17C0 179C 1797 17C5` | S, Shift+`]`, V, Shift+P, Shift+O | S, `[`, V, Shift+P, Shift+O |
| ខ្ញុំ | five code points, one syllable | `1781 17D2 1789 17BB 17C6` | X, Space, J, Shift+J **or** U then Shift+M | X, J, Shift+J, `,` **or** U then Shift+M |

### 3.5 Spelling and combination rules

1. **One vowel per syllable** in Modern Khmer. Multiple-vowel sequences occur only in Middle Khmer and a few names **[UTN61]**.
2. **Use the single code point where one exists.** ើ is `17BE`, not `17C1 17B8`. ោ is `17C4`, not `17C1 17B6`. The pairs look identical but are not canonically equivalent **[UTN61]**.
3. **ុ (17BB) is not a stand-in for a shifter.** When ៉ or ៊ is followed by an upper vowel, the font draws the shifter with the shape of ុ. The correct storage is still the shifter (`17C9`/`17CA`), not `17BB` **[UNI][UTN61]**.
4. **បា ligature:** ប + ា is drawn in a modified shape (បា) to avoid confusion with ហ. The code points are unchanged **[UNI]**.
5. **Series decides the reading**, not the code point. The same stored sequence is read differently for a-series and o-series consonants.
6. **ZWNJ** (`U+200C`) is inserted *before* the shifter only when a shifter must stay superscript instead of downshifting (see 5.7). Example: ប‌៊ីយែរ `1794 200C 17CA 17B8 1799 17C2 179A` **[UNI]**.

### 3.6 Examples per vowel (verified words; spelling still needs lexicon QA)

| Vowel | a-series example | o-series example |
|---|---|---|
| ា | ការ `1780 17B6 179A` job | ទា `1791 17B6` duck |
| ិ | កិ (syllable) | គិត think |
| ី | បី three | ពីរ two |
| ឹ | ដឹក transport | ទឹក `1791 17B9 1780` water |
| ឺ | (syllable កឺ) | ឈឺ sick |
| ុ | តុ table | លុយ money |
| ូ | អូរ stream | គូរ `1782 17BC 179A` draw |
| ួ | សួរ ask | យួរ carry |
| ើ | កើត be born | (o-series: syllable គើ) |
| ឿ | តឿ dwarf | ជឿ believe |
| ៀ | បៀរ beer | កៀរ gather up |
| េ | ដេរ sew | ភេ otter |
| ែ | កែ correct | (syllable គែ) |
| ៃ | ដៃ hand | រៃ cicada |
| ោ | កោ shave | គោ cow |
| ៅ | ចៅ grandchild | ទៅ `1791 17C5` go |

Example words come from *Basic Khmer* (Sok), Unicode Chapter 16, and common vocabulary **[REF][UNI]**. Where no safe word is listed, the syllable is shown purely for demonstration.

---

## 4. Independent Vowels

### 4.1 What they are

Independent vowels (ស្រៈពេញតួ, "complete vowels") are **standalone letters** that carry a vowel with an initial glottal stop or liquid. They behave like consonants in the syllable structure: they are base characters, can take coeng signs, and (technically) shifters **[UNI][UTN61]**. They differ from dependent vowels because they **never attach to a consonant**; they start a syllable.

Most can also be spelled as **អ (qa) + dependent vowel**, but this is **not always interchangeable**: some words use one spelling to the exclusion of the other **[UNI]**. They appear mostly in words of Indic origin, so pronunciation is somewhat inconsistent **[REF]**.

### 4.2 Complete inventory

| Char | Code | Unicode name | Equivalent "អ/រ/ល + sign" (Unicode Table 16-6) | Notes | STD key | NiDA key |
|---|---|---|---|---|---|---|
| ឥ | U+17A5 | INDEPENDENT VOWEL QI | អិ, អ៊ិ, អី | in **ឥឡូវ** "now" [ʔəjləw] | AltGr+I | `-` (unshifted) |
| ឦ | U+17A6 | INDEPENDENT VOWEL QII | អី, អ៊ិ | | AltGr+T | AltGr+I |
| ឧ | U+17A7 | INDEPENDENT VOWEL QU | អុ, អ៊ុ | has a coeng form ្ឧ | AltGr+U | Shift+`]` |
| ឨ | U+17A8 | INDEPENDENT VOWEL QUK | អុក | rare | **no key** | **no key** |
| ឩ | U+17A9 | INDEPENDENT VOWEL QUU | អូ, អ៊ូ | | AltGr+A | AltGr+`[` |
| ឪ | U+17AA | INDEPENDENT VOWEL QUUV | អូវ | in **ឪពុក** "father" [ʔəwpuk] | AltGr+S | `]` (unshifted) |
| ឫ | U+17AB | INDEPENDENT VOWEL RY | រឹ | vocalic r; coeng form ្ឫ | AltGr+R | AltGr+R |
| ឬ | U+17AC | INDEPENDENT VOWEL RYY | រឺ | **ឬ** "or" [rɨː]; coeng form ្ឬ | Shift+R | Shift+R |
| ឭ | U+17AD | INDEPENDENT VOWEL LY | លឹ | vocalic l | AltGr+K | Shift+`\` |
| ឮ | U+17AE | INDEPENDENT VOWEL LYY | លឺ | **ឮ** "hear" [lɨː] | AltGr+J | `\` (unshifted) |
| ឯ | U+17AF | INDEPENDENT VOWEL QE | អេ, អែ | **ឯង** "oneself/you", **ឯណា** "where"; coeng form ្ឯ | AltGr+E | AltGr+E |
| ឰ | U+17B0 | INDEPENDENT VOWEL QAI | អៃ | | AltGr+L | AltGr+P |
| ឱ | U+17B1 | INDEPENDENT VOWEL QOO TYPE ONE | អោ | | AltGr+O | AltGr+O |
| ឲ | U+17B2 | INDEPENDENT VOWEL QOO TYPE TWO | អោ | variant of ឱ; in **ឲ្យ** "give" | AltGr+Y | `=` (unshifted) |
| ឳ | U+17B3 | INDEPENDENT VOWEL QAU | អៅ | | AltGr+P | AltGr+`]` |

Word glosses and IPA are from Wikipedia's Khmer alphabet article **[REF]**; equivalents from Unicode Table 16-6 **[UNI]**. Keys **[KBD]**. AltGr = right Alt (Ctrl+Alt) on Windows.

### 4.3 Deprecated and discouraged characters (never output, never teach)

| Char | Code | Name | Status | Use instead |
|---|---|---|---|---|
| ឣ | U+17A3 | INDEPENDENT VOWEL QAQ | **Deprecated** | អ (`17A2`) |
| ឤ | U+17A4 | INDEPENDENT VOWEL QAA | **Deprecated** | អា (`17A2 17B6`) |
| (invisible) | U+17B4 | VOWEL INHERENT AQ | Discouraged | nothing |
| (invisible) | U+17B5 | VOWEL INHERENT AA | Discouraged | nothing |

Unicode states that neither ឣ nor ឤ actually exists in the Khmer script **[UNI]**.

### 4.4 Differences from dependent vowels

| | Dependent vowel | Independent vowel |
|---|---|---|
| Can start a syllable alone | No | **Yes** |
| Needs a consonant | **Yes** | No |
| Position relative to base | Before/above/below/after | It *is* the base |
| Code point range | U+17B6-U+17C5 | U+17A5-U+17B3 |
| Frequency | Very high | Low (mostly Indic loans), a few very common words |
| Can take a subscript | n/a | Four can: ឧ ឫ ឬ ឯ |

### 4.5 Teaching guidance **[REC]**

- Teach independent vowels **after** dependent vowels and after coeng. Learners need the "អ + sign" idea first.
- Teach as **word-anchored vocabulary**, not as an alphabet row: ឬ (or), ឮ (hear), ឯង, ឪពុក, ឥឡូវ, ឲ្យ.
- Introduce ឲ្យ / ឱ្យ together as one word with two accepted spellings. The scoring engine must decide whether both count (see section 12).
- Mark ឨ as **recognition-only** (no key on either verified layout).
- Never offer U+17A3/U+17A4/U+17B4/U+17B5 as selectable characters.

---

## 5. Subscript Consonants / Coeng

### 5.1 What coeng is

- Khmer calls a subscript consonant sign a **coeng** (ជើង, "foot"). It is used to write consonant clusters, where the vowel between two consonants is suppressed **[UNI][REF]**.
- **U+17D2 `្` KHMER SIGN COENG is not itself a subscript.** It is a *generator* (a virama-like control character) that tells the renderer: "draw the next consonant in subscript form". The glyph shown in code charts is arbitrary and never rendered directly **[UNI]**.
- Therefore **every subscript consonant is a two-character sequence: `U+17D2` + a base character.** Unicode assigns **no separate code points** to subscript consonants **[UNI]**.
- Unicode says the pair "should be treated as a unit for most processing purposes" **[UNI]**. For PK Khmer Type, treat `coeng + consonant` as **one typing unit**.

### 5.2 `consonant + consonant` vs. `consonant + coeng + consonant`

| | `C C` | `C coeng C` |
|---|---|---|
| Code points | `179B 1784` | `179B 17D2 1784` |
| Glyphs | លង (side by side) | ល្ង (second letter stacked below) |
| Vowel between consonants | **Inherent vowel is kept** | **Suppressed** (a cluster) |
| Reading | [lɔ̀ːŋ] "to haunt" | [lŋɔ̀ː] "sesame" |
| Syllable structure | Two syllables' worth of letters | One orthographic syllable |

Source of the example pair: Unicode Chapter 16 **[UNI]**. Two consecutive consonant letters can **never** express a cluster, because the inherent vowel between them is retained **[UNI]**.

**Why a subscript is not "just another consonant":**

1. A consonant letter can form a syllable on its own; a subscript sign **cannot** **[UNI]**.
2. It is rendered in a different place and often in a reduced or altered shape (ញ loses its tail; ្រ goes left of the base; ្ឃ ្ប ្ស have ascenders) **[UNI][REF]**.
3. It has a different role: it marks that the previous consonant has no vowel before this one.
4. Its encoding depends on a preceding `17D2`; the sequence has its own validity rules (5.8).
5. It sorts and segments differently (collation puts "consonant + vowel" before "consonant + coeng") **[UTN61]**.

### 5.3 Typical sequences

| Cluster | Word | Code points | Gloss | Notes |
|---|---|---|---|---|
| ក្រ | ក្រុម | `1780 17D2 179A 17BB 1798` | group | coeng ro |
| ក្យ | ពាក្យ | `1796 17B6 1780 17D2 1799` | word | |
| ខ្ញ | ខ្ញុំ | `1781 17D2 1789 17BB 17C6` | I (me) | ញ has no tail in subscript; ុំ is a sequence |
| ខ្ម | ខ្មែរ | `1781 17D2 1798 17C2 179A` | Khmer | |
| ខ្ល | ខ្លួន | `1781 17D2 179B 17BD 1793` | self | |
| ភ្ន | ភ្នំ | `1797 17D2 1793 17C6` | mountain | |
| ម្ស | ម្សៅ | `1798 17D2 179F 17C5` | powder | ្ស ascender forms a ligature with ៅ **[UNI]** |
| ម្ព | កម្ពុជា | `1780 1798 17D2 1796 17BB 1787 17B6` | Cambodia | cluster mid-word (syllable chaining) |
| ស្ត | សួស្តី | `179F 17BD 179F 17D2 178F 17B8` | hello | uses coeng **ta** (section 5.6) |
| ស្រ | ស្រី | `179F 17D2 179A 17B8` | woman | |
| ផ្ស | ផ្សារ | `1795 17D2 179F 17B6 179A` | market | |
| ព្រ | ព្រះ | `1796 17D2 179A 17C7` | monk/deity | |
| ត្រ | ត្រា | `178F 17D2 179A 17B6` | stamp/seal | |
| ប្រ | ប្រទេស | `1794 17D2 179A 1791 17C1 179F` | country | |
| ច្រ | ច្រើន | `1785 17D2 179A 17BE 1793` | many | |
| ល្ង | ល្ង | `179B 17D2 1784` | sesame | |
| ហ្វ | កាហ្វេ | `1780 17B6 17A0 17D2 179C 17C1` | coffee | foreign sound (ហ + subscript វ) |
| ង្គ + ្រ | សង្គ្រាម | `179F 1784 17D2 1782 17D2 179A 17B6 1798` | war | **two** coengs, ro second **[UNI]** |

**Syllable chaining.** In សង្គ្រាម the base ង is both the final of the first spoken syllable and the start of the next orthographic syllable **[UTN61]**. This is why "orthographic syllable" is not the same as "spoken syllable".

### 5.4 Coeng ro (`17D2 179A`): the special case

- It is the **only coeng drawn to the left of the base**, with a hook running under the following consonant **[REF][UTN61]**.
- Storage is **still logical**: `base + 17D2 + 179A`. The glyph is moved visually by the font **[UNI]**.
- **Ordering rule:** when two coengs occur, coeng ro is stored **second**, even if it is spoken or looks first: `C 17D2 1782 17D2 179A`, never `C 17D2 179A 17D2 1782` **[UTN61][UNI]**. Fonts render both orders alike, so this is a major source of invisible typing differences.
- Coeng ro must never follow a vowel or sign **[UTN61]**.

### 5.5 Final subscripts (rare, legacy)

Unicode allows a coeng after a vowel to mark a final consonant, as in ទាំ្ង = ទាំង and ហើ្យ = ហើយ **[UNI]**. UTN #61 says Modern Khmer should **not** store coengs after vowels (the sequences are visually near-identical and the user cannot see which was typed) **[UTN61]**.

**[REC]** Treat `vowel + coeng` as an error in lessons and show the corrected form.

### 5.6 Coeng ta vs. coeng da

- `17D2 178F` (្ត) and `17D2 178A` (្ដ) **look identical in modern fonts** **[UTN61][REF]**.
- They are pronounced alike in initial clusters ([ɗ]); in medial position it may be [ɗ] or [t] depending on the word **[REF]**.
- Learners and professionals regularly type the wrong one, and the error is invisible **[UTN61]**.
- UTN #61 recommends **storing coeng ta (`17D2 178F`) for both** in Modern Khmer and never emitting coeng da **[UTN61]**. This is a proposal, not yet universal practice.

**[REC]** Lesson data uses `17D2 178F`. The comparer treats `17D2 178A` and `17D2 178F` as equivalent. Do not mark a learner wrong for choosing one over the other, and show an informational hint.

### 5.7 Consonant shifters, coeng, and ZWNJ

The register shifters interact with coeng placement.

- **Unicode Standard (Ch. 16):** a shifter "should always be encoded immediately following the base consonant". Example ម៉្ងៃ = `1798 17C9 17D2 1784 17C3` **[UNI]**.
- **UTN #61 (informative proposal):** store the shifter at the **end of the consonant cluster**, after coengs, because it applies to the cluster **[UTN61]**. The same note admits that "very often a shifter is stored before the coeng" in existing data.

> **Source disagreement.** Existing text is very often stored in the Unicode Chapter 16 order **[UTN61]**. UTN #61 proposes a different canonical order. **[REC]** Pick **one** internal canonical order, record it in data, and make the comparer accept **both** orders as equivalent. Do not silently change either.

- **Down-shifting.** When a shifter is followed by an upper vowel (ិ ី ឹ ឺ ើ ័ and ាំ), fonts draw it with the shape of ុ. Storage remains `17C9`/`17CA` **[UNI][UTN61]**.
- **ZWNJ (`U+200C`)** goes **before** the shifter to force the normal superscript shape, only where down-shifting would otherwise occur **[UNI]**.

### 5.8 Validation rules for coeng sequences **[UNI][UTN61]**

A typing engine must classify every input state as **valid**, **incomplete (pending)**, or **invalid**.

| # | Rule | State if violated |
|---|---|---|
| 1 | `17D2` must be **preceded** by a base, robat, or an earlier coeng-consonant in the same syllable | invalid |
| 2 | `17D2` must be **followed** by a consonant or an independent vowel (Unicode Table 16-10 lists four: ឧ ឫ ឬ ឯ; UTN #61 permits any base) | **incomplete** at end of input, **invalid** if followed by anything else |
| 3 | At most **two** coengs per orthographic syllable | invalid |
| 4 | With two coengs, coeng ro (`17D2 179A`) is **second** | invalid, auto-correctable |
| 5 | No `17D2` after a dependent vowel or sign (Modern Khmer) | invalid, auto-correctable |
| 6 | No `17D2` at the start of text or after space, digit, or punctuation | invalid |
| 7 | `17D2 178A` should be stored as `17D2 178F` | warning, auto-normalizable |
| 8 | `17D2 17A1` (coeng la) is non-standard in Cambodia | warning |
| 9 | `17D2` followed by `17D2` is meaningless | invalid |

**Structural lint pattern (JavaScript, `u` flag).** Derived from the Modern Khmer structure in UTN #61. It checks *shape only*, not shifter-series rules, vowel-sequence exclusions, or sign combinations. It is a lint, not a spec.

```js
const BASE   = '[\\u1780-\\u17A2\\u17A5-\\u17B3]';
const NONRO  = '[\\u1780-\\u1799\\u179B-\\u17A2\\u17A5-\\u17B3]';
const SYLLABLE = new RegExp(
  BASE + '\\u17CC?' +
  '(?:\\u17D2' + NONRO + ')?(?:\\u17D2' + BASE + ')?' +   // 0-2 coengs; first of two is not ro
  '(?:[\\u17C9\\u17CA]\\u200C?)?' +                        // register shifter (+ optional ZWNJ)
  '[\\u17B6-\\u17C5]?' +                                   // one dependent vowel
  '(?:[\\u17C6\\u17CB\\u17CD-\\u17D1\\u17DD]{1,2})?' +     // up to two modifier signs
  '[\\u17C7\\u17C8]?',                                     // final sign
  'u');
```

### 5.9 Common coeng typing mistakes (expanded in section 12)

1. Typing two consonants instead of consonant + coeng + consonant.
2. Forgetting the coeng key (STD: **Space**; NiDA: **J**).
3. Typing the coeng **after** the vowel.
4. Typing the wrong coeng consonant (ត vs ដ; ប vs ឡ-lookalikes).
5. Typing coeng ro **before** another coeng.
6. Leaving a dangling coeng at the end.
7. Trying to type coeng for ឡ.

---

## 6. Khmer Diacritics and Signs

### 6.1 Overview

Khmer signs are called វណ្ណយុត្តិ (*vônnâyŭttĕ*) **[REF]**. In the Unicode block there are **12 diacritic signs** at U+17C6-U+17D1, followed by coeng (U+17D2) and the discouraged U+17D3 **[REF][UNI]**. **They do not all behave alike.** The table groups them by *behavior*, which is what the typing engine needs.

| Behaviour group | Signs | Role in syllable structure **[UTN61]** |
|---|---|---|
| Register shifters | ៉ ៊ | after the cluster (position varies, see 5.7) |
| Robat | ៌ | immediately after the base |
| Modifier signs (up to two) | ំ ់ ៍ ៎ ៏ ័ ៑ ៝ | after the vowel |
| Final signs (spacing) | ះ ៈ | last in the syllable |
| Generator | ្ | before a base character (coeng) |

### 6.2 Sign-by-sign reference

| Sign | Code | Unicode name | Function **[UNI][REF]** | Drawn | Example | STD key | NiDA key |
|---|---|---|---|---|---|---|---|
| ◌ំ | U+17C6 | NIKAHIT | final nasal [m]; acts as vowel *am*; used with ា (aam), ុ (om), or alone | above | ខ្ញុំ, ភ្នំ | Shift+M | Shift+M |
| ◌ះ | U+17C7 | REAHMUK | final -h; may follow an independent vowel | right (spacing) | ព្រះ, នេះ | Shift+H | Shift+H |
| ◌ៈ | U+17C8 | YUUKALEAPINTU | stopped short vowel (glottal stop); alone or after another vowel | right (spacing) | n/a | `;` | AltGr+`'` |
| ◌៉ | U+17C9 | MUUSIKATOAN | shifts o-series to a-series; also makes ប into [p] | above (or ុ-shape) | ប៉ី, រ៉ | Shift+`'` | Shift+`'` |
| ◌៊ | U+17CA | TRIISAP | shifts a-series to o-series | above (or ុ-shape) | ស៊ី | Shift+3 | `/` |
| ◌់ | U+17CB | BANTOC | shortens the vowel of the syllable it ends; sits over the final consonant | above | បត់ | `'` | `'` |
| ◌៌ | U+17CC | ROBAT | final *r* of the previous phonetic syllable (Devanagari *repha*); often silent. Equivalent to ro + coeng + consonant | above | ពត៌មាន `1796 178F 17CC 1798 17B6 1793` | Shift+6 | Shift+`-` |
| ◌៍ | U+17CD | TOANDAKHIAT | silencer: marks a letter as unpronounced; rare | above | after ិ most often | Shift+7 | Shift+6 |
| ◌៎ | U+17CE | KAKABAT | marks exclamation; renders above any vowel; does not push a shifter down | above | ចា៎ះ | Shift+9 | AltGr+`=` |
| ◌៏ | U+17CF | AHSDA | highlights a consonant as a discrete word, or marks a final consonant as vowelled | above | តំណ៏ | Shift+8 | Shift+8 |
| ◌័ | U+17D0 | SAMYOK SANNYA | behaves like ា + bantoc; modifies vowel and final; pushes a muusikatoan down | above | ហឫទ័យ `17A0 17AB 1791 17D0 1799` | Shift+5 | Shift+7 |
| ◌៑ | U+17D1 | VIRIAM | kills the inherent vowel (marks a final); mainly Old Khmer transliteration | above | rare | Shift+0 | AltGr+3 |
| ◌្ | U+17D2 | COENG | generator for subscript consonants (section 5) | invisible | see section 5 | Space | J |
| ◌៓ | U+17D3 | BATHAMASAT | originally for lunar dates; **discouraged**, obsolete | n/a | do not use | none | none |
| ◌៝ | U+17DD | ATTHACAN | keeps the inherent vowel; rare. **Canonical combining class 230** (see section 8) | above | rare | AltGr+`'` | none |
| ៜ | U+17DC | AVAKRAHASANYA | rare Sanskrit avagraha sign | spacing | rare | none | none |

Placement ("above/right") is typical rendering behaviour; the font decides **[UNI]**. Examples marked "rare" were not independently verified as words.

### 6.3 Key behaviours to implement

- **ំ (nikahit):** valid after ា, ុ, or a bare consonant. Not used together with ី, េ, ួ, ើ, ោ **[UNI]**.
- **៉ ៊:** a shifter changes the series of the whole **cluster**, not just the base letter. Which shifter is correct depends on the dominant consonant in the cluster (UTN #61 sonority rules) **[UTN61]**. For lesson data, store the correct shifter explicitly rather than computing it.
- **ប + ៉ = [p]** is a *different consonant sound*, not just a series change **[UNI]**.
- **់ ័:** `័` is equivalent to ា + ់ in reading and cannot co-occur with ុ (`17BB 17D0` is a do-not-use sequence) **[UTN61]**.
- **ៈ vs. colon:** ៈ (U+17C8) is widely confused with ASCII `:`. Khmer writers often insert a space before a real colon to keep them apart **[UTN61]**. Never substitute one for the other in comparison without flagging.
- **ៈ ះ** are **final, spacing** signs. Nothing should be typed after them within the same syllable **[UTN61]**.
- **៌ (robat)** comes straight after the base, never after coengs in Modern Khmer **[UTN61]**.
- **Do not teach ៓ (U+17D3) or ៘ (U+17D8)** as active characters.

---

## 7. Khmer Numerals and Symbols

### 7.1 Actual Khmer writing characters

**Digits (U+17E0-U+17E9) [UNI]**

| Khmer | ០ | ១ | ២ | ៣ | ៤ | ៥ | ៦ | ៧ | ៨ | ៩ |
|---|---|---|---|---|---|---|---|---|---|---|
| Value | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |
| Code | 17E0 | 17E1 | 17E2 | 17E3 | 17E4 | 17E5 | 17E6 | 17E7 | 17E8 | 17E9 |

- Western digits are also commonly used, but less so than Khmer digits in formal Khmer writing **[REF]**.
- In large numbers, groups of three digits are separated by Western-style periods, and the decimal separator is a comma **[REF]**.
- Both verified Windows layouts place Khmer digits **unshifted** on the number row **[KBD]**.

**Punctuation and symbols (U+17D4-U+17DB) [UNI][REF]**

| Char | Code | Name | Use | STD key | NiDA key |
|---|---|---|---|---|---|
| ។ | U+17D4 | KHAN | full stop / end of sentence | `.` | `.` |
| ៕ | U+17D5 | BARIYOOSAN | marks end of a text or chapter | AltGr+`/` | Shift+`.` |
| ៖ | U+17D6 | CAMNUC PII KUUH | colon-like; introduces a list, quotation, or explanation | Shift+`;` | AltGr+`;` |
| ៗ | U+17D7 | LEK TOO | repetition mark ("figure two") | Shift+2 | Shift+2 |
| ៘ | U+17D8 | BEYYAL | "etc."; **discouraged**: spell out ។ល។ instead **[UNI]** | none | none |
| ៙ | U+17D9 | PHNAEK MUAN | ornamental mark in formal/traditional texts **[UNVERIFIED usage detail]** | AltGr+`` ` `` | AltGr+6 |
| ៚ | U+17DA | KOOMUUT | ornamental mark in formal/traditional texts **[UNVERIFIED usage detail]** | AltGr+`\` | AltGr+7 |
| ៛ | U+17DB | CURRENCY SYMBOL RIEL | Cambodian currency (also abbreviated រ) | Shift+4 | Shift+4 |

### 7.2 Khmer-block characters that are **not** everyday writing

| Group | Range | Notes |
|---|---|---|
| Divination numerals | U+17F0-U+17F9 | Not used for arithmetic **[REF]** |
| Lunar date symbols | U+19E0-U+19FF | 32 characters: 15 waxing days, 15 waning days, and two for the intercalary eighth month **[UNI]**. Reachable only on the standard layout's Shift+AltGr layer **[KBD]** |
| Legacy "digit + coeng + khan" tricks | n/a | Old fonts drew a lunar symbol from `០ 17D2 ។`. The new structure does **not** allow this; use U+19E0-U+19FF **[UTN61]** |

### 7.3 Characters used in Khmer text that are **not Khmer-script characters**

Keep these in a **separate** data group so they are never confused with Khmer letters.

| Character | Code | Role in Khmer typing |
|---|---|---|
| Space | U+0020 | Marks a phrase/clause boundary, not each word |
| Zero-width space | U+200B | Invisible word-break hint. **Produced by a key on both verified Windows layouts** (STD: `/`; NiDA: **Space**) **[KBD]** |
| Zero-width non-joiner | U+200C | Controls shifter shape and ligatures **[UNI]** |
| Zero-width joiner | U+200D | Requests ligatures; used for final coeng marking in UTN #61 **[UNI][UTN61]** |
| « » | U+00AB / U+00BB | Guillemets commonly used as quotation marks **[REF]** (NiDA: Backquote key) |
| ASCII digits `0-9` | U+0030-0039 | Used in places; not Khmer digits |
| Hyphen `-` | U+002D | Between name parts, number ranges **[REF]** |
| Period `.` / comma `,` | U+002E / U+002C | Digit grouping and decimal separator; abbreviations **[REF]** |

### 7.4 Typing considerations

- Learner scoring must decide whether **ZWSP, ZWNJ, ZWJ** in the typed stream are ignored, normalized, or required (section 8.6).
- Treat Khmer digits and ASCII digits as **different** characters unless the lesson says otherwise.
- Do not treat a space as a word boundary when measuring words-per-minute; use syllable or character units.
- Show ៛ and ។ as part of the punctuation lesson, not the consonant lessons.
