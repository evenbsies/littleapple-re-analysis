#!/usr/bin/env node
/**
 * A 步：直接向授权服务发 play_auth / device_trial，拿到响应并用 cryptoKey 解密。
 * 报文与应用自身发出的完全等价（同样的令牌、同样的签名算法、同样的加密体）。
 */
const fs = require('fs');
const crypto = require('crypto');
const { buildRequest, KEY_VERSION } = require('./sign_request.js');

const PREFS = process.argv[2] || 'prefs.xml';
const BASES = [
  'https://la.9box.store/api.php/fongmi',
  'https://la.haotv.store/api.php/fongmi',
];
const KEY_HEX = '245a46d69c39d4d0815c5cf02e8dc714af493891f1c50e15f9b4a9abd675335e';

const xml = fs.readFileSync(PREFS, 'utf8').replace(/&quot;/g, '"').replace(/&amp;/g, '&');

function pick(re) {
  const m = xml.match(re);
  return m ? m[1] : null;
}

const uuid = pick(/name="auth_device_uuid">([^<]*)</);
const loginRaw = pick(/name="auth_device_login">([\s\S]*?)<\/string>/);
if (!uuid || !loginRaw) {
  console.error('解析 prefs 失败');
  process.exit(1);
}
const login = JSON.parse(loginRaw);
const token = login.token;

console.log('device_uuid:', uuid);
console.log('token.iat  :', JSON.parse(Buffer.from(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64')).iat);
console.log('token.jti  :', JSON.parse(Buffer.from(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64')).jti);
console.log('');

function b64uDecode(s) {
  const pad = s.length % 4 === 0 ? 0 : 4 - (s.length % 4);
  return Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat(pad), 'base64');
}

function tryDecrypt(text) {
  let o;
  try { o = JSON.parse(text); } catch (e) { return { plain: null, raw: text, note: '非 JSON' }; }
  if (o.enc !== 1) return { plain: null, raw: text, note: '未加密' };
  try {
    const iv = b64uDecode(o.iv);
    const data = b64uDecode(o.data);
    const tag = data.subarray(data.length - 16);
    const ct = data.subarray(0, data.length - 16);
    const d = crypto.createDecipheriv('aes-256-gcm', Buffer.from(KEY_HEX, 'hex'), iv);
    d.setAuthTag(tag);
    return { plain: Buffer.concat([d.update(ct), d.final()]).toString('utf8'), raw: text };
  } catch (e) {
    return { plain: null, raw: text, note: '解密失败: ' + e.message };
  }
}

async function call(base, path, form) {
  const req = buildRequest({ base, path, form, token, key: KEY_HEX });
  console.log('=== POST ' + req.url);
  console.log('    X-HSJ-Timestamp: ' + req.headers['X-HSJ-Timestamp']);
  console.log('    X-HSJ-Signature: ' + req.headers['X-HSJ-Signature']);
  let res, text;
  try {
    res = await fetch(req.url, { method: 'POST', headers: req.headers, body: req.body });
    text = await res.text();
  } catch (e) {
    console.log('    请求失败: ' + e.message + '\n');
    return null;
  }
  console.log('    HTTP ' + res.status + '  ' + text.length + 'B');
  const r = tryDecrypt(text);
  if (r.plain) {
    console.log('    解密后:');
    try {
      console.log(JSON.stringify(JSON.parse(r.plain), null, 2));
    } catch (e) {
      console.log(r.plain);
    }
  } else {
    console.log('    (' + (r.note || '明文') + ') ' + r.raw.slice(0, 600));
  }
  console.log('');
  return r.plain || text;
}

(async () => {
  const form = 'device_uuid=' + uuid + '&device_token=' + token;
  let ok = false;
  for (const base of BASES) {
    const out = await call(base, '/play_auth', form);
    if (out) { ok = true; break; }
  }
  if (ok) {
    for (const base of BASES.slice(0, 1)) {
      await call(base, '/device_trial', form);
    }
  }
})();
