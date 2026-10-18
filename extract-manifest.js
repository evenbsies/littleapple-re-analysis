const fs = require('fs');
const s = fs.readFileSync('D:\\REA\\out-inspect-package.utf8.txt', 'utf8');
// find lines starting with "        text,\"<?xml"
const lines = s.split(/\r?\n/);
let xml = null;
for (const line of lines) {
  const m = line.match(/^\s+text,"(<\?xml[\s\S]*)$/);
  if (m) { xml = m[1]; break; }
}
if (!xml) { console.log('not found'); process.exit(1); }
// line may be truncated by REA report rendering; unescape
xml = xml.replace(/\\r\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
fs.writeFileSync('D:\\REA\\AndroidManifest-decoded.xml', xml);
console.log('xml bytes', xml.length);
