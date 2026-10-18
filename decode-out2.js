const fs = require('fs');
const [src, dst] = process.argv.slice(2);
const raw = fs.readFileSync(src);
let s = raw.toString('utf16le').replace(/\x00/g, '');
if (!/EXITCODE/.test(s)) s = raw.toString('utf8').replace(/\x00/g, '');
fs.writeFileSync(dst, s);
console.log('len', s.length);
