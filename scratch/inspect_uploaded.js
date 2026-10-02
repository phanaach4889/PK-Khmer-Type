const fs = require('fs');
const zlib = require('zlib');
const buf = fs.readFileSync('C:/Users/Kurosaki Kon/.gemini/antigravity/brain/9ef964bc-db6f-4cb5-9c9a-20b607235a59/.user_uploaded/media_1790920574577.png');
let pos = 8;
const idat = [];
while (pos < buf.length) {
  const len = buf.readUInt32BE(pos);
  if (buf.toString('ascii', pos + 4, pos + 8) === 'IDAT') idat.push(buf.slice(pos + 8, pos + 8 + len));
  pos += 12 + len;
}
const raw = zlib.inflateSync(Buffer.concat(idat));
const width = 1024;
const height = 47;
const stride = 1 + width * 4;

console.log('--- Top Row (Y=2) ---');
for (let x = 100; x < 900; x += 80) {
  const r = raw[2 * stride + 1 + x * 4];
  const g = raw[2 * stride + 1 + x * 4 + 1];
  const b = raw[2 * stride + 1 + x * 4 + 2];
  console.log('x=' + x + ': rgb(' + r + ',' + g + ',' + b + ')');
}

console.log('--- Middle Row (Y=15) ---');
for (let x = 100; x < 900; x += 80) {
  const r = raw[15 * stride + 1 + x * 4];
  const g = raw[15 * stride + 1 + x * 4 + 1];
  const b = raw[15 * stride + 1 + x * 4 + 2];
  console.log('x=' + x + ': rgb(' + r + ',' + g + ',' + b + ')');
}

console.log('--- Bottom Row (Y=35) ---');
for (let x = 100; x < 900; x += 80) {
  const r = raw[35 * stride + 1 + x * 4];
  const g = raw[35 * stride + 1 + x * 4 + 1];
  const b = raw[35 * stride + 1 + x * 4 + 2];
  console.log('x=' + x + ': rgb(' + r + ',' + g + ',' + b + ')');
}
