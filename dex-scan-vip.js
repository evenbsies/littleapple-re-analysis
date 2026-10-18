const fs = require('fs');
const buf = fs.readFileSync('D:\\REA\\LittleApple-extract\\classes.dex');
// extract printable ascii strings >=5 chars
let strings = [];
let cur = [];
for (let i = 0; i < buf.length; i++) {
  const c = buf[i];
  if (c >= 0x20 && c <= 0x7e) { cur.push(c); }
  else { if (cur.length >= 5) strings.push(Buffer.from(cur).toString('latin1')); cur = []; }
}
if (cur.length >= 5) strings.push(Buffer.from(cur).toString('latin1'));
console.log('total strings', strings.length);

const patterns = [
  /AccessDecision/, /MembershipOrder/, /\bauth\b/, /NativeAuth/, /isvip/i, /vip/i,
  /pay/i, /alipay/i, /wechat/i, /weixin/i, /wxpay/i, /recharge/i, /member/i,
  /membership/i, /order/i, /subscription/i, /expire/i, /trial/i, /token/i,
  /haotv/, /xpgtv/, /littleapple/i, /api\.php/
];
const hits = {};
for (const [idx, p] of patterns.entries()) hits[idx] = [];
for (const s of strings) {
  patterns.forEach((p, idx) => {
    if (p.test(s) && hits[idx].length < 200) hits[idx].push(s);
  });
}
patterns.forEach((p, idx) => {
  console.log('=== /' + patterns[idx].source + '/ (' + hits[idx].length + ') ===');
  // dedupe
  const seen = new Set();
  for (const h of hits[idx]) {
    if (seen.has(h)) continue; seen.add(h);
    console.log('  ' + h.slice(0, 300));
    if (seen.size > 80) { console.log('  ...'); break; }
  }
});
