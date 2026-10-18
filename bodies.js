const fs = require('fs');
const files = process.argv.slice(2);
for (const f of files) {
  const raw = fs.readFileSync(f);
  let s = raw.toString('utf16le').replace(/\x00/g, '');
  if (!/body_status|overload_count/.test(s)) s = raw.toString('utf8').replace(/\x00/g, '');
  // find '  text,"{"method_name"...' lines or '  body:'
  const out = [];
  for (const line of s.split(/\r?\n/)) {
    const m = line.match(/^\s+text,"(.*)$/);
    if (m) out.push(m[1]);
    const b = line.match(/^\s+body: "(.*)$/);
    if (b) out.push('BODY: ' + b[1]);
    const t = line.match(/^\s+text: "(.*)$/);
    if (t) out.push('SRC: ' + t[1]);
  }
  console.log('########## ' + f + ' ##########');
  let text = out.join('\n');
  text = text.replace(/\\u003c/g, '<').replace(/\\u003e/g, '>').replace(/\\u0026/g, '&')
             .replace(/\\r\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\')
             .replace(/ \\n/g, '\n').replace(/\\n/g, '\n');
  console.log(text);
}
