const fs = require('fs');
const targets = ['libhsjtv.so', 'libjpa.so', 'libcore.so', 'libmedia3ext.so', 'librtmp.so', 'libffmpeg.so'];
for (const t of targets) {
  const p = 'D:\\REA\\LittleApple-extract\\lib\\arm64-v8a\\' + t;
  if (!fs.existsSync(p)) { console.log('=== ' + t + ': MISSING'); continue; }
  const buf = fs.readFileSync(p);
  const pats = [/AccessDecision/, /MembershipOrder/, /MembershipDialog/, /membership/, /is_vip/, /NativeAuth/, /LITTLEAPPLE_AUTH/, /haotv/, /vlp/, /trial_android_hash/, /qr\.alipay/, /VIP_REQUIRED/];
  let found = {};
  let cur = [];
  for (let i = 0; i < buf.length; i++) {
    const c = buf[i];
    if ((c >= 0x20 && c <= 0x7e) || c === 0x09) { cur.push(c); }
    else {
      if (cur.length >= 6) {
        const s = Buffer.from(cur).toString('latin1');
        for (const pat of pats) {
          if (pat.test(s)) { (found[pat.source] = found[pat.source] || []).push(s.slice(0, 200)); }
        }
      }
      cur = [];
    }
  }
  console.log('=== ' + t + ' ===');
  for (const k of Object.keys(found)) {
    console.log(' /' + k + '/ x' + found[k].length);
    for (const s of found[k].slice(0, 6)) console.log('   ' + s);
  }
}
