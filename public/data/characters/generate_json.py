import json
import os

FINGERS = {
    "grave": "lp", "k1": "lp", "k2": "lr", "k3": "lm", "k4": "li", "k5": "li", "k6": "ri", "k7": "ri", "k8": "rm", "k9": "rr", "k0": "rp",
    "q": "lp", "w": "lr", "e": "lm", "r": "li", "t": "li", "y": "ri", "u": "ri", "i": "rm", "o": "rr", "p": "rp",
    "a": "lp", "s": "lr", "d": "lm", "f": "li", "g": "li", "h": "ri", "j": "ri", "k": "rm", "l": "rr", "semicolon": "rp", "quote": "rp", "backslash": "rp",
    "z": "lp", "x": "lr", "c": "lm", "v": "li", "b": "li", "n": "ri", "m": "ri", "comma": "rm", "period": "rr", "slash": "rp",
    "minus": "rp", "equal": "rp", "bracketL": "rp", "bracketR": "rp",
    "space": "lt"
}

def get_hand(finger):
    return "L" if finger.startswith("l") else "R"

# Frequencies
freq_map = {}
freqs = {
    "very-high": "ក ន ម រ ល ស ត យ ប អ ា ិ េ ុ ោ ។ e t a o i n s h r".split(),
    "high": "គ ទ ព ញ ដ វ ង ហ ី ូ ួ ើ ៀ ែ ់ ្ d l c u m w f g y p".split(),
    "medium": "ផ ភ ជ ច ខ ណ ធ ថ ៃ ៅ ឹ ំ ះ b v k j x q z".split(),
    "low": "ឆ ឈ ឋ ឌ ឍ ឃ ឡ ឺ ឿ ុំ ុះ ាំ ោះ េះ 0 1 2 3 4 5 6 7 8 9 . , ; : ' \" / ? - _ + = [ ] { } | \\ ` ~ < >".split()
}
for k, v in freqs.items():
    for char in v:
        freq_map[char] = k

a_series = list("កខចឆដឋតថបផសហអឡ")

khmer_chars = []
consonants_raw = [
    ("ក", "k", "base", "velar", "Ka", "កា"),
    ("ខ", "x", "base", "velar", "Kha", "ខា"),
    ("គ", "k", "shift", "velar", "Ko", "គោ"),
    ("ឃ", "x", "shift", "velar", "Kho", "ឃោ"),
    ("ង", "g", "base", "velar", "Ngo", "ង៉ោ"),
    ("ច", "c", "base", "palatal", "Ca", "ចា"),
    ("ឆ", "q", "base", "palatal", "Cha", "ឆា"),
    ("ជ", "c", "shift", "palatal", "Co", "ជោ"),
    ("ឈ", "q", "shift", "palatal", "Cho", "ឈោ"),
    ("ញ", "j", "shift", "palatal", "Nyo", "ញោ"),
    ("ដ", "d", "base", "retroflex", "Da", "ដា"),
    ("ឋ", "z", "base", "retroflex", "Tha", "ឋា"),
    ("ឌ", "d", "shift", "retroflex", "Do", "ឌោ"),
    ("ឍ", "z", "shift", "retroflex", "Tho", "ឍោ"),
    ("ណ", "n", "shift", "retroflex", "Na", "ណា"),
    ("ត", "t", "base", "dental", "Ta", "តា"),
    ("ថ", "f", "base", "dental", "Tha", "ថា"),
    ("ទ", "t", "shift", "dental", "To", "ទោ"),
    ("ធ", "f", "shift", "dental", "Tho", "ធោ"),
    ("ន", "n", "base", "dental", "No", "នោ"),
    ("ប", "b", "base", "labial", "Ba", "បា"),
    ("ផ", "p", "base", "labial", "Pha", "ផា"),
    ("ព", "b", "shift", "labial", "Po", "ពោ"),
    ("ភ", "p", "shift", "labial", "Pho", "ភោ"),
    ("ម", "m", "base", "labial", "Mo", "មោ"),
    ("យ", "y", "base", "other", "Yo", "យោ"),
    ("រ", "r", "base", "other", "Ro", "រោ"),
    ("ល", "l", "base", "other", "Lo", "លោ"),
    ("វ", "v", "base", "other", "Vo", "វោ"),
    ("ស", "s", "base", "other", "Sa", "សា"),
    ("ហ", "h", "base", "other", "Ha", "ហា"),
    ("ឡ", "l", "shift", "other", "La", "ឡា"),
    ("អ", "g", "shift", "other", "Qa", "អា")
]

for char, key, layer, grp, name, nameKm in consonants_raw:
    c_series = "a-series" if char in a_series else "o-series"
    khmer_chars.append({
        "char": char,
        "unicode": f"U+{ord(char):04X}",
        "codepoint": ord(char),
        "name": name,
        "nameKm": nameKm,
        "type": "consonant",
        "series": c_series,
        "group": grp,
        "keyId": key,
        "layer": layer,
        "finger": FINGERS[key],
        "hand": get_hand(FINGERS[key]),
        "frequency": freq_map.get(char, "rare")
    })

for i, c1 in enumerate(khmer_chars):
    for c2 in khmer_chars:
        if c1["keyId"] == c2["keyId"] and c1["layer"] != c2["layer"] and c1["char"] != c2["char"]:
            c1["pairedChar"] = c2["char"]
            c1["pairedKeyId"] = c2["keyId"]
            c1["pairedLayer"] = c2["layer"]

vowels = [
    ("ា", "a", "base"), ("ិ", "i", "base"), ("ី", "i", "shift"), ("ុ", "u", "base"), ("ូ", "u", "shift"), ("ួ", "y", "shift"),
    ("ើ", "semicolon", "base"), ("ឿ", "bracketL", "shift"), ("ៀ", "bracketL", "base"), ("េ", "e", "base"), ("ែ", "e", "shift"),
    ("ៃ", "s", "shift"), ("ោ", "o", "base"), ("ៅ", "o", "shift"), ("ឹ", "w", "base"), ("ឺ", "w", "shift")
]
for char, key, layer in vowels:
    khmer_chars.append({
        "char": char,
        "unicode": f"U+{ord(char):04X}",
        "codepoint": ord(char),
        "type": "dependent-vowel",
        "keyId": key,
        "layer": layer,
        "finger": FINGERS[key],
        "hand": get_hand(FINGERS[key]),
        "frequency": freq_map.get(char, "rare")
    })

compound_vowels = [
    ("ុំ", "comma", "base", ["U+17BB", "U+17C6"]),
    ("ុះ", "comma", "shift", ["U+17BB", "U+17C7"]),
    ("ាំ", "a", "shift", ["U+17B6", "U+17C6"]),
    ("េះ", "v", "shift", ["U+17C1", "U+17C7"]),
    ("ោះ", "semicolon", "shift", ["U+17C4", "U+17C7"]),
    ("ះ", "h", "shift", ["U+17C7"]),
    ("ំ", "m", "shift", ["U+17C6"])
]
for char, key, layer, uni_list in compound_vowels:
    khmer_chars.append({
        "char": char,
        "unicode": "+".join(uni_list),
        "codepoint": ord(char[0]) if len(char)==1 else [ord(c) for c in char],
        "type": "compound-vowel",
        "keyId": key,
        "layer": layer,
        "finger": FINGERS[key],
        "hand": get_hand(FINGERS[key]),
        "frequency": freq_map.get(char, "rare")
    })

coeng = [("្", "j", "base")]
for char, key, layer in coeng:
    khmer_chars.append({
        "char": char,
        "unicode": f"U+{ord(char):04X}",
        "codepoint": ord(char),
        "type": "coeng",
        "keyId": key,
        "layer": layer,
        "finger": FINGERS[key],
        "hand": get_hand(FINGERS[key]),
        "frequency": freq_map.get(char, "rare")
    })

diacritics = [
    ("់", "quote", "base"), ("៉", "quote", "shift"), ("៊", "slash", "base"), ("៍", "k6", "shift"),
    ("៏", "k8", "shift"), ("័", "k7", "shift"), ("៌", "minus", "shift")
]
for char, key, layer in diacritics:
    khmer_chars.append({
        "char": char,
        "unicode": f"U+{ord(char):04X}",
        "codepoint": ord(char),
        "type": "diacritic",
        "keyId": key,
        "layer": layer,
        "finger": FINGERS[key],
        "hand": get_hand(FINGERS[key]),
        "frequency": freq_map.get(char, "rare")
    })

special = [
    ("ៗ", "k2", "shift"), ("៛", "k4", "shift"), ("។", "period", "base"), ("៕", "period", "shift"),
    ("៖", "semicolon", "altgr"), ("ៈ", "quote", "altgr"), ("«", "grave", "base"), ("»", "grave", "shift")
]
for char, key, layer in special:
    khmer_chars.append({
        "char": char,
        "unicode": f"U+{ord(char):04X}",
        "codepoint": ord(char),
        "type": "special-mark",
        "keyId": key,
        "layer": layer,
        "finger": FINGERS.get(key, "unknown"),
        "hand": get_hand(FINGERS.get(key, "unknown")),
        "frequency": freq_map.get(char, "rare")
    })

indep = [
    ("ឥ", "minus", "base"), ("ឦ", "i", "altgr"), ("ឧ", "bracketR", "shift"), ("ឩ", "bracketL", "altgr"), ("ឪ", "bracketR", "base"),
    ("ឫ", "r", "altgr"), ("ឬ", "r", "shift"), ("ឭ", "backslash", "shift"), ("ឮ", "backslash", "base"), ("ឯ", "e", "altgr"),
    ("ឰ", "p", "altgr"), ("ឱ", "o", "altgr"), ("ឲ", "equal", "base"), ("ឳ", "bracketR", "altgr")
]
for char, key, layer in indep:
    khmer_chars.append({
        "char": char,
        "unicode": f"U+{ord(char):04X}",
        "codepoint": ord(char),
        "type": "independent-vowel",
        "keyId": key,
        "layer": layer,
        "finger": FINGERS.get(key, "unknown"),
        "hand": get_hand(FINGERS.get(key, "unknown")),
        "frequency": freq_map.get(char, "rare")
    })

digits = [
    ("០", "k0", "base"), ("១", "k1", "base"), ("២", "k2", "base"), ("៣", "k3", "base"), ("៤", "k4", "base"),
    ("៥", "k5", "base"), ("៦", "k6", "base"), ("៧", "k7", "base"), ("៨", "k8", "base"), ("៩", "k9", "base")
]
for char, key, layer in digits:
    khmer_chars.append({
        "char": char,
        "unicode": f"U+{ord(char):04X}",
        "codepoint": ord(char),
        "type": "digit",
        "keyId": key,
        "layer": layer,
        "finger": FINGERS[key],
        "hand": get_hand(FINGERS[key]),
        "frequency": freq_map.get(char, "rare")
    })

khmer_data = {
    "version": "1.0.0",
    "characters": khmer_chars
}

base_dir = r"e:\Code\khmer keyboard\keyboard\idk\data\characters"
os.makedirs(base_dir, exist_ok=True)
with open(os.path.join(base_dir, "khmer.json"), "w", encoding="utf-8") as f:
    json.dump(khmer_data, f, ensure_ascii=False, indent=2)

eng_chars = []
for c in "abcdefghijklmnopqrstuvwxyz":
    key = c
    eng_chars.append({
        "char": c,
        "type": "letter",
        "case": "lower",
        "keyId": key,
        "layer": "base",
        "finger": FINGERS[key],
        "hand": get_hand(FINGERS[key]),
        "frequency": freq_map.get(c, "rare"),
        "pairedChar": c.upper(),
        "pairedLayer": "shift"
    })
for c in "ABCDEFGHIJKLMNOPQRSTUVWXYZ":
    key = c.lower()
    eng_chars.append({
        "char": c,
        "type": "letter",
        "case": "upper",
        "keyId": key,
        "layer": "shift",
        "finger": FINGERS[key],
        "hand": get_hand(FINGERS[key]),
        "frequency": freq_map.get(c.lower(), "rare"),
        "pairedChar": c.lower(),
        "pairedLayer": "base"
    })

for c in "0123456789":
    key = f"k{c}"
    eng_chars.append({
        "char": c,
        "type": "digit",
        "keyId": key,
        "layer": "base",
        "finger": FINGERS[key],
        "hand": get_hand(FINGERS[key]),
        "frequency": "low"
    })

shift_sym = {"1":"!","2":"@","3":"#","4":"$","5":"%","6":"^","7":"&","8":"*","9":"(","0":")"}
for d, c in shift_sym.items():
    key = f"k{d}"
    eng_chars.append({
        "char": c,
        "type": "symbol",
        "keyId": key,
        "layer": "shift",
        "finger": FINGERS[key],
        "hand": get_hand(FINGERS[key]),
        "frequency": freq_map.get(c, "rare")
    })

punct = {
    ".": "period", ",": "comma", ";": "semicolon", ":": "semicolon", "'": "quote", "\"": "quote",
    "/": "slash", "?": "slash", "-": "minus", "_": "minus", "+": "equal", "=": "equal",
    "[": "bracketL", "{": "bracketL", "]": "bracketR", "}": "bracketR", "|": "backslash", "\\": "backslash",
    "`": "grave", "~": "grave", "<": "comma", ">": "period"
}
for c, key in punct.items():
    layer = "shift" if c in ':"?_+{}|~<>' else "base"
    eng_chars.append({
        "char": c,
        "type": "punctuation",
        "keyId": key,
        "layer": layer,
        "finger": FINGERS[key],
        "hand": get_hand(FINGERS[key]),
        "frequency": freq_map.get(c, "low")
    })

eng_chars.append({
    "char": " ",
    "type": "space",
    "keyId": "space",
    "layer": "base",
    "finger": "lt",
    "hand": "L",
    "frequency": "very-high"
})

eng_data = {
    "version": "1.0.0",
    "characters": eng_chars
}

with open(os.path.join(base_dir, "english.json"), "w", encoding="utf-8") as f:
    json.dump(eng_data, f, ensure_ascii=False, indent=2)

print("Successfully generated JSON files.")
