/**
 * PK Khmer Type — Curriculum Bundler
 * 
 * Reads curriculum JSON files from data/curriculum/{english,nida,standard}/
 * and bundles them into data/curriculum-data.js for zero-latency offline startup.
 * 
 * Usage: node scripts/bundle_curricula.js
 * 
 * Supports: english, nida, standard (standard is optional and skipped if missing)
 */

const fs = require('fs');
const path = require('path');

const CURRICULUM_DIR = path.join(__dirname, '../data/curriculum');
const BUNDLE_OUTPUT = path.join(__dirname, '../data/curriculum-data.js');

const LAYOUTS = ['english', 'nida', 'standard'];

function loadCurriculum(layoutId) {
  const dir = path.join(CURRICULUM_DIR, layoutId);
  const levelsPath = path.join(dir, 'levels.json');
  const lessonsPath = path.join(dir, 'lessons.json');
  const exercisesPath = path.join(dir, 'exercises.json');

  if (!fs.existsSync(levelsPath) || !fs.existsSync(lessonsPath) || !fs.existsSync(exercisesPath)) {
    return null;
  }

  return {
    levels: JSON.parse(fs.readFileSync(levelsPath, 'utf8')).levels,
    lessons: JSON.parse(fs.readFileSync(lessonsPath, 'utf8')).lessons,
    exercises: JSON.parse(fs.readFileSync(exercisesPath, 'utf8')).exercises
  };
}

// Load all available curricula
const bundleData = {};
let totalLayouts = 0;

LAYOUTS.forEach(layoutId => {
  const data = loadCurriculum(layoutId);
  if (data) {
    bundleData[layoutId] = data;
    totalLayouts++;
    console.log(`Loaded ${layoutId}: ${data.levels.length} levels, ${data.lessons.length} lessons, ${Object.keys(data.exercises).length} exercises`);
  } else {
    console.log(`[SKIP] ${layoutId}: curriculum not found (data/curriculum/${layoutId}/ missing)`);
  }
});

if (totalLayouts === 0) {
  console.error('ERROR: No curriculum data found!');
  process.exit(1);
}

// Generate bundle
const bundleContent = `/* PK Khmer Type — Pre-bundled Curriculum Data for Zero-Delay Offline Startup */\n(typeof window !== "undefined" ? window : global).CURRICULUM_DATA = ${JSON.stringify(bundleData)};\n`;

fs.writeFileSync(BUNDLE_OUTPUT, bundleContent, 'utf8');

const bundleSize = fs.statSync(BUNDLE_OUTPUT).size;
console.log(`\nBundle generated: data/curriculum-data.js (${(bundleSize / 1024).toFixed(1)} KB)`);
console.log(`Layouts included: ${Object.keys(bundleData).join(', ')}`);
