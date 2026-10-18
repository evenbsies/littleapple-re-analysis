// Decrypt hsj9.jar string literals protected by com.github.catvod.spider.harden.a2.m244
// AES-256-GCM: key = f1 XOR f2, iv = first 12 bytes, tag = last 16 bytes.
// DEX string_data carries a uleb128 utf16 length prefix (often printable, e.g. 0x30 = '0'),
// so every run is retried at several leading offsets and tail trims.
const fs = require('fs');
const crypto = require('crypto');

const f1 = [-1, -7, 90, -80, 125, -61, 85, -61, -34, 96, -56, -45, 75, -111, -51, 117, -40, 1, 82, 17, -54, 93, 63, -10, -65, -21, -121, -64, 39, 56, -98, 55];
const f2 = [41, 10, -123, 56, 89, 92, 32, 125, -106, 16, 26, 126, -124, -33, -110, 33, -66, -2, 35, 99, 25, 39, -113, 38, -86, 14, 34, -49, -120, 88, -44, 18];

const key = Buffer.alloc(32);
for (let i = 0; i < 32; i++) key[i] = (f1[i] ^ f2[i]) & 0xff;

const dexPath = process.argv[2];
const outPath = process.argv[3] || 'hsj9_strings.txt';
const buf = fs.readFileSync(dexPath);

const runs = new Set();
let start = -1;
for (let i = 0; i <= buf.length; i++) {
  const b = i < buf.length ? buf[i] : 0;
  const printable = b >= 0x21 && b <= 0x7e;
  if (printable) {
    if (start < 0) start = i;
  } else {
    if (start >= 0 && i - start >= 28) runs.add(buf.toString('latin1', start, i));
    start = -1;
  }
}

function attempt(candidate) {
  if (candidate.length < 28 || !/^[A-Za-z0-9+/]+={0,2}$/.test(candidate)) return null;
  if (candidate.length % 4 !== 0) return null;
  const b = Buffer.from(candidate, 'base64');
  if (b.length < 28) return null;
  if (b.toString('base64') !== candidate) return null;
  const iv = b.subarray(0, 12);
  const tag = b.subarray(b.length - 16);
  const ct = b.subarray(12, b.length - 16);
  try {
    const d = crypto.createDecipheriv('aes-256-gcm', key, iv);
    d.setAuthTag(tag);
    const pt = Buffer.concat([d.update(ct), d.final()]).toString('utf8');
    if (!pt) return null;
    for (const ch of pt) {
      const code = ch.codePointAt(0);
      if (code < 0x20 && ch !== '\n' && ch !== '\r' && ch !== '\t') return null;
      if (code === 0xfffd) return null;
    }
    return pt;
  } catch (e) {
    return null;
  }
}

const found = new Map();
for (const s of runs) {
  for (let lead = 0; lead <= 8; lead++) {
    for (let trim = 0; trim <= 3; trim++) {
      const cand = s.slice(lead, s.length - trim);
      if (cand.length < 28) continue;
      const pt = attempt(cand);
      if (pt !== null) {
        if (!found.has(pt)) found.set(pt, cand);
        break;
      }
    }
  }
}

const lines = [...found.entries()].map(([pt, enc]) => pt + '\t' + enc).sort();
fs.writeFileSync(outPath, lines.join('\n'), 'utf8');
console.log('printable runs:', runs.size, '| decrypted:', found.size, '| written:', outPath);
