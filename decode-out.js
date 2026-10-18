const fs = require('fs');
const raw = fs.readFileSync('D:\\REA\\out-inspect-package.txt');
let s = raw.toString('utf16le').replace(/\x00/g, ''); // cmd /u wrote UTF-16 redirect
if (s.includes('EXITCODE=0') === false && s.charCodeAt(0) !== 0xFEFF) {
  // try utf8 if failed
  s = raw.toString('utf8').replace(/\x00/g, '');
}
fs.writeFileSync('D:\\REA\\out-inspect-package.utf8.txt', s);
console.log('len', s.length);
