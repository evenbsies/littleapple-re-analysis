const fs = require('fs');
const path = 'D:\\REA\\LittleApple-extract\\lib\\arm64-v8a\\libjpa.so';
const buf = fs.readFileSync(path);
let strings = [];
let cur = [];
for (let i = 0; i < buf.length; i++) {
  const c = buf[i];
  if (c >= 0x20 && c <= 0x7e) cur.push(c);
  else { if (cur.length >= 6) strings.push(Buffer.from(cur).toString('latin1')); cur = []; }
}
if (cur.length >= 6) strings.push(Buffer.from(cur).toString('latin1'));

const pats = [
  /python/i, /Py[A-Z]/, /_Py|_pyt/, /QuickJS|quickjs|qjs/i,
  /Java_com_/, /JNI_OnLoad/, /micro|chakki|dukpy|jython/i,
  /\.py/, /spider/i, /libpython|python3|embedded/i,
];
const hits = {};
for (const p of pats) hits[p.source] = [];
for (const s of strings) {
  for (const p of pats) {
    if (p.test(s) && hits[p.source].length < 120) hits[p.source].push(s);
  }
}
for (const p of pats) {
  const seen = new Set(); const list = [];
  for (const h of hits[p.source]) { if (!seen.has(h)) { seen.add(h); list.push(h); } }
  console.log('=== /' + p.source + '/ (' + list.length + ') ===');
  for (const l of list.slice(0, 45)) console.log('  ' + l);
}
