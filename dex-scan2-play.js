const fs = require('fs');
const buf = fs.readFileSync('D:\\REA\\LittleApple-extract\\classes.dex');
let strings = [];
let cur = [];
for (let i = 0; i < buf.length; i++) {
  const c = buf[i];
  if (c >= 0x20 && c <= 0x7e) cur.push(c);
  else { if (cur.length >= 5) strings.push(Buffer.from(cur).toString('latin1')); cur = []; }
}
if (cur.length >= 5) strings.push(Buffer.from(cur).toString('latin1'));

const pats = [
  /DexClassLoader/, /loadClass/, /PathClassLoader/,
  /^jar$/, /\.jar$/, /jars\//, /cache.*jar|jar.*cache/i,
  /playerContent|playContent|detailContent|homeContent|categoryContent/,
  /playUrl|playFrom|playFlag|jx|parse&|parse=1|嗅探|sniff/i,
  /127\.0\.0\.1/, /stream\/open/, /proxy\?do=|do=py|do=cat|do=live|do=play/,
  /fconline|jiaohao|/ , /^parse$/, /webParse|web_parse/,
  /playerUrl|player_parse|PlayParse/i,
];
const hits = {};
for (const p of pats) hits[p.source] = [];
for (const s of strings) {
  for (const p of pats) {
    if (p.test(s) && hits[p.source].length < 80) hits[p.source].push(s);
  }
}
for (const p of pats) {
  const seen = new Set(); const list = [];
  for (const h of hits[p.source]) { if (!seen.has(h)) { seen.add(h); list.push(h); } }
  console.log('=== /' + p.source + '/ (' + list.length + ') ===');
  for (const l of list.slice(0, 40)) console.log('  ' + l);
}
