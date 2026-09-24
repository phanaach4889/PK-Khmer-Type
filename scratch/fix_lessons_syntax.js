const fs = require('fs');

let lines = fs.readFileSync('js/lessons.js', 'utf8').split('\n');

// Find and fix lines around Lesson 10001
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('// Lesson 10001 (Level 1, intro): Home Row Consonant Anchors')) {
    console.log('Found 10001 at line', i + 1);
    // Replace the block from lines[i] to the end of block
    let endIdx = i + 1;
    while (endIdx < lines.length && !lines[endIdx].includes('// Lesson 10002')) {
      endIdx++;
    }
    const replacement = [
      "  // Lesson 10001 (Level 1, intro): Home Row Consonant Anchors",
      "  {",
      "    const ids = ['k', 'j', 'd', 'f', 'g', 'h', 'l', 's'];",
      "    const ex = ['កក', 'គក', 'ដក', 'ថក', 'ធរ', 'សស', 'ហល', 'អក', 'ញញ'];",
      "    addLesson(1, 'intro', 'Home Row — Consonant Anchors', 'K, J, D, F, H, L, S, G & Shift Consonants',",
      "      () => materialize(seqWords(ex, table)),",
      "      { newIds: ids, newLayer: 'base', examples: ex });",
      "  }",
      ""
    ];
    lines.splice(i, endIdx - i, ...replacement);
    break;
  }
}

// Find and fix lines around Lesson 10005 & 10006
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('// Lesson 10005')) {
    console.log('Found 10005 at line', i + 1);
    let endIdx = i + 1;
    while (endIdx < lines.length && !lines[endIdx].includes('// Lesson 10007')) {
      endIdx++;
    }
    const replacement = [
      "  // Lesson 10005 (Level 2, intro): Subscripts — Coeng Key (Shift+J = ្)",
      "  {",
      "    const ids = ['j'];",
      "    const ex = ['ត្រី', 'ក្រៅ', 'ខ្លា', 'ឆ្កែ', 'ផ្លូវ', 'ម្ហូប', 'ស្ងួត', 'ក្បាល'];",
      "    addLesson(2, 'intro', 'Subscripts — Coeng Key (Shift+J = ្)', 'Base Consonant + Shift+J (្) + Subscript',",
      "      () => materialize(seqWords(ex, table)),",
      "      { newIds: ids, newLayer: 'shift', examples: ex });",
      "  }",
      "",
      "  // Lesson 10006 (Level 2, combo): Subscripts — Shifted Consonants",
      "  {",
      "    const ids = ['j', 'k', 'x', 'c', 't', 'f', 'p', 'g'];",
      "    const ex = ['ស្គាល់', 'ស្អាត', 'កម្ពុជា', 'បញ្ជី', 'សង្ឃ', 'សម្បត្តិ', 'បន្ទប់'];",
      "    addLesson(2, 'combo', 'Subscripts — Shifted Consonants', 'Shift+J followed by Shifted Consonants (្គ, ្ឃ, ្ជ, ្ទ, ្ធ, ្ភ, ្អ)',",
      "      () => materialize(seqWords(ex, table)),",
      "      { newIds: ids, newLayer: 'shift', examples: ex });",
      "  }",
      ""
    ];
    lines.splice(i, endIdx - i, ...replacement);
    break;
  }
}

fs.writeFileSync('js/lessons.js', lines.join('\n'), 'utf8');
console.log('Successfully wrote js/lessons.js!');

