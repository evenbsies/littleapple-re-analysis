// Decrypt LittleApple API response envelope:
//   {"enc":1,"alg":"AES-256-GCM","iv":"<b64url-nopad>","data":"<b64url-nopad>"}
// Key = NativeAuth.cryptoKey() (32 bytes, captured by frida hook)
// Android Base64 flags: 11 = URL_SAFE | NO_WRAP | NO_PADDING; cipher init mode 2 = DECRYPT_MODE
//
// usage: node decrypt_resp.js <key-hex> < payload.json
//    or: node decrypt_resp.js <key-hex> <file>
const fs = require('fs');
const crypto = require('crypto');

const keyHex = process.argv[2];
if (!keyHex) {
  console.error('usage: node decrypt_resp.js <key-hex> [file]');
  process.exit(2);
}
const key = Buffer.from(keyHex.replace(/[^0-9a-fA-F]/g, ''), 'hex');
if (key.length !== 32) {
  console.error('key must be 32 bytes (64 hex chars), got ' + key.length);
  process.exit(2);
}

function b64u(s) {
  const pad = s.length % 4 === 0 ? 0 : 4 - (s.length % 4);
  return Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat(pad), 'base64');
}

function decryptEnvelope(text) {
  let obj;
  try {
    obj = JSON.parse(text);
  } catch (e) {
    return { ok: false, reason: 'not json' };
  }
  if (obj.enc !== 1) return { ok: false, reason: 'not encrypted (enc!=1)', plain: text };
  if (obj.alg !== 'AES-256-GCM') return { ok: false, reason: 'unsupported alg ' + obj.alg };
  const iv = b64u(obj.iv);
  const data = b64u(obj.data);
  const tag = data.subarray(data.length - 16);
  const ct = data.subarray(0, data.length - 16);
  try {
    const d = crypto.createDecipheriv('aes-256-gcm', key, iv);
    d.setAuthTag(tag);
    const pt = Buffer.concat([d.update(ct), d.final()]).toString('utf8');
    return { ok: true, plain: pt };
  } catch (e) {
    return { ok: false, reason: 'decrypt failed: ' + e.message };
  }
}

const src = process.argv[3] ? fs.readFileSync(process.argv[3], 'utf8') : fs.readFileSync(0, 'utf8');
const r = decryptEnvelope(src.trim());
if (r.ok) {
  console.log(r.plain);
} else {
  console.error('[' + r.reason + ']');
  if (r.plain) console.log(r.plain);
  process.exit(1);
}
