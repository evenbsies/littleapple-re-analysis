const fs = require('fs');
const buf = fs.readFileSync('D:\\REA\\LittleApple-extract\\classes.dex');
// DEX header
const stringIdsSize = buf.readUInt32LE(0x38);
const stringIdsOff = buf.readUInt32LE(0x3c);
const typeIdsSize = buf.readUInt32LE(0x40);
const typeIdsOff = buf.readUInt32LE(0x44);
const classDefsSize = buf.readUInt32LE(0x60);
const classDefsOff = buf.readUInt32LE(0x64);
console.log('stringIds', stringIdsSize, 'typeIds', typeIdsSize, 'classDefs', classDefsSize);

function getMUTF8(strIdx) {
  const off = buf.readUInt32LE(stringIdsOff + strIdx * 4);
  let p = off;
  while (buf[p] !== 0) p++; // wait: that's cstr; MUTF8 string in dex: utf16_size uleb128 then bytes, NUL-terminated
  // simpler: read from off: uleb128 len then data till \0
  return buf.toString('utf8', off, p); // actually offset points to uleb128 begin; descriptor chars start after size. Correction below.
}
// correct: string_data_off -> uleb128 utf16 length, then MUTF8 data, null-term. Use crude approach: find first \0 after decoding uleb.
function getStr(strIdx) {
  const off = buf.readUInt32LE(stringIdsOff + strIdx * 4);
  // skip uleb128
  let p = off, shift = 0, len = 0;
  while (true) {
    const b = buf[p];
    len |= (b & 0x7f) << shift;
    p++;
    if ((b & 0x80) === 0) break;
    shift += 7;
  }
  let q = p;
  while (buf[q] !== 0) q++;
  return buf.toString('utf8', p, q);
}

const classes = [];
for (let i = 0; i < classDefsSize; i++) {
  const cd = classDefsOff + i * 32;
  const typeIdx = buf.readUInt32LE(cd);
  const descriptor = getStr(buf.readUInt32LE(typeIdsOff + typeIdx * 4));
  classes.push(descriptor);
}
console.log('parsed', classes.length, 'class defs');

const fongmi = classes.filter(c => c.includes('fongmi'));
console.log('fongmi classes:', fongmi.length);
for (const c of fongmi) console.log('  ' + c);

console.log('--- exact lookups ---');
for (const want of ['MembershipOrder', 'AccessDecision', 'MembershipDialog', 'NativeAuth']) {
  const hits = classes.filter(c => c.includes(want));
  console.log(want, '=>', hits.length ? hits : 'NOT in class_defs table');
}
fs.writeFileSync('D:\\REA\\dex-classdefs.txt', classes.join('\n'));
console.log('saved D:\\REA\\dex-classdefs.txt');
