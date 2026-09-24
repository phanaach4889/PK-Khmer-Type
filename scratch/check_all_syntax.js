const fs = require('fs');
const { execFileSync } = require('child_process');

let hasError = false;
fs.readdirSync('js').forEach(f => {
  if (!f.endsWith('.js')) return;
  try {
    execFileSync('node', ['-c', 'js/' + f], { stdio: 'pipe' });
    console.log('PASS: ' + f);
  } catch(e) {
    hasError = true;
    console.error('FAIL: ' + f + '\n' + e.stderr.toString());
  }
});

fs.readdirSync('data').forEach(f => {
  if (!f.endsWith('.js')) return;
  try {
    execFileSync('node', ['-c', 'data/' + f], { stdio: 'pipe' });
    console.log('PASS: data/' + f);
  } catch(e) {
    hasError = true;
    console.error('FAIL: data/' + f + '\n' + e.stderr.toString());
  }
});

if (hasError) process.exit(1);

