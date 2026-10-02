const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const matches = html.match(/data-pill="[^"]+"/g);
console.log('Matches in index.html:', matches);
