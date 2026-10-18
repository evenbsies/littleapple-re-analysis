const fs = require('fs');
const buf = fs.readFileSync('D:\\REA\\LittleApple-extract\\classes.dex');
let strings = [];
let cur = [];
for (let i = 0; i < buf.length; i++) {
  const c = buf[i];
  if (c >= 0x20 && c <= 0x7e) cur.push(c);
  else { if (cur.length >= 6) strings.push(Buffer.from(cur).toString('latin1')); cur = []; }
}
if (cur.length >= 6) strings.push(Buffer.from(cur).toString('latin1'));
console.log('strings:', strings.length);

const pats = [
  /^com\.github\.catvod/, /spider/i, /quickjs/i, /catvod/,
  /^api\.php/, /vod_id/, /vod_name/, /episodes/,
  /play_url|playUrl/, /handler_sniffer/, /api\.json|site\.json/,
  /^\$\$/, /proxy\?do/, /^127\.0\.0\.1/, /9978|7777|6677/,
  /^class=/, /jar=/, /vipsite/, /Spider/, /jars\//
];
const hits = {};
for (const p of pats) hits[p.source] = [];
for (const s of strings) {
  for (const p of pats) {
    if (p.test(s) && hits[p.source].length < 150) hits[p.source].push(s);
  }
}
for (const p of pats) {
  const seen = new Set();
  const list = [];
  for (const h of hits[p.source]) { if (!seen.has(h)) { seen.add(h); list.push(h); } }
  console.log('=== /' + p.source + '/ (' + list.length + ') ===');
  for (const l of list.slice(0, 50)) console.log('  ' + l);
}
