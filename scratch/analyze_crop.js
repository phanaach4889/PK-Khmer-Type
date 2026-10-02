const fs = require('fs');
const zlib = require('zlib');
const buf = fs.readFileSync('C:/Users/Kurosaki Kon/.gemini/antigravity/brain/9ef964bc-db6f-4cb5-9c9a-20b607235a59/.user_uploaded/media_1790920574577.png');

let pos = 8;
const idatChunks = [];
while (pos < buf.length) {
  const len = buf.readUInt32BE(pos);
  const type = buf.toString('ascii', pos + 4, pos + 8);
  if (type === 'IDAT') {
    idatChunks.push(buf.slice(pos + 8, pos + 8 + len));
  }
  pos += 12 + len;
}
const compressed = Buffer.concat(idatChunks);
const raw = zlib.inflateSync(compressed);
const width = 1024;
const height = 47;
const stride = 1 + width * 4;

for (let y = 34; y < 45; y += 2) {
  for (let x = 150; x < 850; x += 100) {
    const r = raw[y * stride + 1 + x * 4];
    const g = raw[y * stride + 1 + x * 4 + 1];
    const b = raw[y * stride + 1 + x * 4 + 2];
    if (r > 30 || g > 30 || b > 30) {
      console.log('x=' + x + ', y=' + y + ': rgb(' + r + ',' + g + ',' + b + ')');
    }
  }
}
