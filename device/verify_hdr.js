#!/usr/bin/env node
/** 抓 play_auth 的响应头，验证 verifyResponse 的消息构造 */
const fs = require('fs');
const crypto = require('crypto');
const { buildRequest } = require('./sign_request.js');

const SEED = Buffer.from('huasj:fongmi:auth:v1:20260707:ndk', 'utf8');
const KEY_HEX = '245a46d69c39d4d0815c5cf02e8dc714af493891f1c50e15f9b4a9abd675335e';
const BASE = 'https://la.9box.store/api.php/fongmi';

const xml = fs.readFileSync('prefs.xml', 'utf8').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
const uuid = xml.match(/name="auth_device_uuid">([^<]*)</)[1];
const token = JSON.parse(xml.match(/name="auth_device_login">([\s\S]*?)<\/string>/)[1]).token;

function b64uDecode(s) {
  const pad = s.length % 4 === 0 ? 0 : 4 - (s.length % 4);
  return Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat(pad), 'base64');
}

(async () => {
  const form = 'device_uuid=' + uuid + '&device_token=' + token;
  const req = buildRequest({ base: BASE, path: '/play_auth', form, token, key: KEY_HEX });
  const res = await fetch(req.url, { method: 'POST', headers: req.headers, body: req.body });
  const text = await res.text();

  const hdrs = {};
  res.headers.forEach((v, k) => { hdrs[k] = v; });
  console.log('=== 响应头 ===');
  for (const [k, v] of Object.entries(hdrs)) console.log('  ' + k + ': ' + (v.length > 90 ? v.slice(0, 90) + '...' : v));

  const env = JSON.parse(text);
  const iv = b64uDecode(env.iv);
  const data = b64uDecode(env.data);
  const d = crypto.createDecipheriv('aes-256-gcm', Buffer.from(KEY_HEX, 'hex'), iv);
  d.setAuthTag(data.subarray(data.length - 16));
  const plain = Buffer.concat([d.update(data.subarray(0, data.length - 16)), d.final()]).toString('utf8');

  const ts = hdrs['x-hsj-timestamp'];
  const nonce = hdrs['x-hsj-nonce'];
  const sig = hdrs['x-hsj-signature'];
  const bodyHashHex = crypto.createHash('sha256').update(Buffer.from(plain, 'utf8')).digest('hex');

  console.log('\n=== 验签要素 ===');
  console.log('  ts      :', ts);
  console.log('  nonce   :', nonce);
  console.log('  sign    :', sig);
  console.log('  bodyHash:', bodyHashHex);
  console.log('  头里的 body-sha256:', hdrs['x-hsj-body-sha256'] || '(无)');

  if (!sig) { console.log('\n响应没带 X-HSJ-* 头，验签走不通'); return; }

  const KVN = 'hsj-auth-v1';
  const cands = {
    'kv+bh+ts+nonce': [KVN, bodyHashHex, ts, nonce].join('\n'),
    'kv+ts+nonce+bh': [KVN, ts, nonce, bodyHashHex].join('\n'),
    'kv+POST+bh+ts+nonce': [KVN, 'POST', bodyHashHex, ts, nonce].join('\n'),
    'kv+POST+path+ts+nonce+bh': [KVN, 'POST', '/play_auth', ts, nonce, bodyHashHex].join('\n'),
    'bh+ts+nonce': [bodyHashHex, ts, nonce].join('\n'),
    'ts+nonce+bh': [ts, nonce, bodyHashHex].join('\n'),
    'nonce+bh': [nonce, bodyHashHex].join('\n'),
  };
  console.log('\n=== 验签尝试 ===');
  let hit = null;
  for (const [n, m] of Object.entries(cands)) {
    const h = crypto.createHmac('sha256', SEED).update(m).digest('hex');
    const ok = h === sig;
    if (ok) hit = n;
    console.log((ok ? 'MATCH ' : '      ') + n.padEnd(26) + h.slice(0, 20));
  }
  console.log('\n结论: ' + (hit ? '命中 -> ' + hit : '未命中'));
  fs.writeFileSync('play_auth_plain.json', JSON.stringify(JSON.parse(plain), null, 2), 'utf8');
})();
