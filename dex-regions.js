const fs = require('fs');
const buf = fs.readFileSync('D:\\REA\\LittleApple-extract\\classes.dex');
const windows = [
  ['api-endpoints', 6110000, 6132000],
  ['hsj-headers', 6710000, 6720000],
  ['auth-header-region', 6279000, 6282000],
  ['enum-region', 6600000, 6601000],
  ['payment-region', 7010800, 7014000],
  ['trial-region', 7092800, 7096000],
  ['vlp-region', 6928600, 6929600]
];
const out = [];
for (const [name, lo, hi] of windows) {
  out.push('===== ' + name + ' [' + lo + ',' + hi + '] =====');
  let start = null;
  for (let i = lo; i < Math.min(hi, buf.length); i++) {
    const c = buf[i];
    if (c >= 0x20 && c <= 0x7e) {
      if (start === null) start = i;
    } else {
      if (start !== null && (i - start) >= 4) out.push(buf.toString('latin1', start, i));
      start = null;
    }
  }
}
fs.writeFileSync('D:\\REA\\dex-regions.txt', out.join('\n'));
console.log('written', out.length, 'lines');
