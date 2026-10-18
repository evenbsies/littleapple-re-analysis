const fs = require('fs');
const buf = fs.readFileSync('D:/REA/LittleApple-extract/AndroidManifest.xml');
console.log('fileSize', buf.length, 'magic type', buf.readUInt16LE(0).toString(16), 'headerSize', buf.readUInt16LE(2), 'size', buf.readUInt32LE(4));
let p = 8;
while (p < buf.length) {
  const type = buf.readUInt16LE(p), hs = buf.readUInt16LE(p + 2), size = buf.readUInt32LE(p + 4);
  console.log('chunk type', type.toString(16), 'headerSize', hs, 'size', size, 'at', p);
  if (type === 0x0003) {
    let np = p + hs;
    const end = p + size;
    let count = 0;
    while (np < end && count < 12) {
      const nt = buf.readUInt16LE(np), nhs = buf.readUInt16LE(np + 2), nsize = buf.readUInt32LE(np + 4);
      console.log('  node type', nt.toString(16), 'hs', nhs, 'size', nsize, 'at', np);
      np += nsize; count++;
      if (nsize === 0) break;
    }
  }
  p += size; if (size === 0) break;
}
