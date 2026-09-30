const KHMER_COMPOUND_VOWELS = Object.freeze([
  '\u17BB\u17C6', // ុំ (comma base)
  '\u17BB\u17C7', // ុះ (comma shift)
  '\u17B6\u17C6', // ាំ (a shift)
  '\u17C1\u17C7', // េះ (v shift)
  '\u17C4\u17C7', // ោះ (semicolon shift)
]);

export function normalizeInput(text) {
  if (text === null || text === undefined) return '';
  const str = typeof text === 'string' ? text : String(text);
  return str.normalize('NFC');
}

export function splitIntoTypingUnits(text, layoutId) {
  if (!text) return [];
  const normalized = normalizeInput(text);
  const units = [];
  let i = 0;
  while (i < normalized.length) {
    if (layoutId === 'nida' && i + 1 < normalized.length) {
      const pair = normalized.slice(i, i + 2);
      if (KHMER_COMPOUND_VOWELS.includes(pair)) {
        units.push(pair);
        i += 2;
        continue;
      }
    }
    const code = normalized.codePointAt(i);
    const ch = String.fromCodePoint(code);
    units.push(ch);
    i += ch.length;
  }
  return units;
}

export function compareTypingSequence(produced, expected) {
  if (produced === expected) return true;
  const pNorm = normalizeInput(produced);
  const eNorm = normalizeInput(expected);
  return pNorm === eNorm;
}

// For backwards compatibility with the simplified React migration
export function normalizeUnits(text = '', layoutId = 'standard') {
  return splitIntoTypingUnits(text, layoutId);
}
