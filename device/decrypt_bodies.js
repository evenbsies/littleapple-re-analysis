// 解密抓包中的 la.9box.store / la.haotv.store 请求体
// BODY 形式: enc=1&alg=AES-256-GCM&kid=hsj-auth-v1&iv=<b64url>&data=<b64url>
const fs = require('fs');
const crypto = require('crypto');

const keyHex = process.argv[2];
const logPath = process.argv[3];
const key = Buffer.from(keyHex, 'hex');

function b64u(s) {
  const pad = s.length % 4 === 0 ? 0 : 4 - (s.length % 4);
  return Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat(pad), 'base64');
}

function decrypt(ivStr, dataStr) {
  const iv = b64u(ivStr);
  const data = b64u(dataStr);
  const tag = data.subarray(data.length - 16);
  const ct = data.subarray(0, data.length - 16);
  const d = crypto.createDecipheriv('aes-256-gcm', key, iv);
  d.setAuthTag(tag);
  return Buffer.concat([d.update(ct), d.final()]).toString('utf8');
}

const seen = new Set();
const lines = fs.readFileSync(logPath, 'utf8').split('\n');
for (const line of lines) {
  if (!line.includes('"t": "REQ"')) continue;
  let o;
  try { o = JSON.parse(line); } catch (e) { continue; }
  const body = o.body || '';
  if (!body.includes('data=')) continue;
  const p = {};
  for (const kv of body.split('&')) {
    const i = kv.indexOf('=');
    if (i > 0) p[kv.slice(0, i)] = kv.slice(i + 1);
  }
  if (!p.iv || !p.data) continue;
  const sig = p.iv + p.data;
  if (seen.has(sig)) continue;
  seen.add(sig);
  let pt;
  try {
    pt = decrypt(p.iv, p.data);
  } catch (e) {
    pt = '<FAIL: ' + e.message + '>';
  }
  console.log('=== ' + o.url);
  console.log('    headers: ' + (o.h || '').split(' | ').filter(function (x) {
    return /X-HSJ|X-Device/i.test(x);
  }).join('\n             '));
  console.log('    IV: ' + p.iv + '  kid=' + p.kid);
  console.log('    PLAINTEXT: ' + pt);
  console.log('');
}
