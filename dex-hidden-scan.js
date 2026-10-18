const fs = require('fs');
const buf = fs.readFileSync('D:\\REA\\LittleApple-extract\\classes.dex');
// 1. count dex magic occurrences
const magic = 'dex\n';
const positions = [];
let idx = 0;
while (true) {
  idx = buf.indexOf(magic, idx);
  if (idx === -1) break;
  if (buf[idx + 4] !== 0x0a) { idx++; continue; } // wait, magic 'dex\n035' = 64 65 78 0a 30 33 35
  positions.push(idx);
  idx++;
}
console.log('dex magic candidates:', positions.length, positions.slice(0, 20));

// 2. locate key strings and check context
function findStr(s) {
  const list = [];
  let i = 0;
  while (true) {
    i = buf.indexOf(Buffer.from(s, 'utf8'), i);
    if (i === -1) break;
    list.push(i);
    i++;
  }
  return list;
}
for (const s of ['AccessDecision', 'MembershipOrder', 'membership_order_create', 'qr.alipay.com', 'haotv.store/vlp', 'trial_android_hash', 'LITTLEAPPLE_AUTH_V1', 'X-Device-Token']) {
  const pos = findStr(s);
  console.log('\n"' + s + '" x' + pos.length + ' at offsets:', pos.slice(0, 10));
  for (const p of pos.slice(0, 2)) {
    const ws = Math.max(0, p - 120);
    console.log('  ctx[' + p + ']: ' + buf.toString('latin1', ws, Math.min(buf.length, p + 160)).replace(/[\x00-\x09\x0b-\x1f]/g, '.'));
  }
}
