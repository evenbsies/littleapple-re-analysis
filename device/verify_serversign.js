#!/usr/bin/env node
/** 逆向 x-server-sign 的构造（服务端响应签名） */
const fs = require('fs');
const crypto = require('crypto');
const { buildRequest } = require('./sign_request.js');

const SEED = Buffer.from('huasj:fongmi:auth:v1:20260707:ndk', 'utf8');
const KEY_HEX = '245a46d69c39d4d0815c5cf02e8dc714af493891f1c50e15f9b4a9abd675335e';
const BASE = 'https://la.9box.store/api.php/fongmi';
const KVN = 'hsj-auth-v1';

const xml = fs.readFileSync('prefs.xml', 'utf8').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
const uuid = xml.match(/name="auth_device_uuid">([^<]*)</)[1];
const token = JSON.parse(xml.match(/name="auth_device_login">([\s\S]*?)<\/string>/)[1]).token;

function b64uDecode(s) {
  const pad = s.length % 4 === 0 ? 0 : 4 - (s.length % 4);
  return Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat(pad), 'base64');
}
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');

(async () => {
  const form = 'device_uuid=' + uuid + '&device_token=' + token;
  const req = buildRequest({ base: BASE, path: '/play_auth', form, token, key: KEY_HEX });
  const res = await fetch(req.url, { method: 'POST', headers: req.headers, body: req.body });
  const raw = await res.text();

  const h = {};
  res.headers.forEach((v, k) => { h[k] = v; });
  const time = h['x-server-time'];
  const nonce = h['x-server-nonce'];
  const sign = h['x-server-sign'];

  const env = JSON.parse(raw);
  const iv = b64uDecode(env.iv);
  const data = b64uDecode(env.data);
  const d = crypto.createDecipheriv('aes-256-gcm', Buffer.from(KEY_HEX, 'hex'), iv);
  d.setAuthTag(data.subarray(data.length - 16));
  const plain = Buffer.concat([d.update(data.subarray(0, data.length - 16)), d.final()]).toString('utf8');

  console.log('time :', time);
  console.log('nonce:', nonce);
  console.log('sign :', sign);
  console.log('sha(raw密文) :', sha(Buffer.from(raw)));
  console.log('sha(明文)    :', sha(Buffer.from(plain)));
  console.log('sha(请求体)  :', sha(Buffer.from(req.body)));

  const hashes = {
    'rawCipher': sha(Buffer.from(raw)),
    'plain': sha(Buffer.from(plain)),
    'reqBody': sha(Buffer.from(req.body)),
  };

  console.log('\n=== 尝试 ===');
  let hit = null;
  for (const [hn, bh] of Object.entries(hashes)) {
    const cands = {
      'kv+bh+time+nonce': [KVN, bh, time, nonce].join('\n'),
      'kv+time+nonce+bh': [KVN, time, nonce, bh].join('\n'),
      'bh+time+nonce': [bh, time, nonce].join('\n'),
      'time+nonce+bh': [time, nonce, bh].join('\n'),
      'kv+bh+nonce+time': [KVN, bh, nonce, time].join('\n'),
      'bh+nonce': [bh, nonce].join('\n'),
      'nonce+bh': [nonce, bh].join('\n'),
      'kv+nonce+time+bh': [KVN, nonce, time, bh].join('\n'),
      'resp+bh+time+nonce': ['POST', bh, time, nonce].join('\n'),
    };
    for (const [cn, m] of Object.entries(cands)) {
      const got = crypto.createHmac('sha256', SEED).update(m).digest('hex');
      if (got === sign) { hit = hn + ' | ' + cn; console.log('MATCH ' + hn + ' | ' + cn + '  msg=' + JSON.stringify(m)); }
    }
  }
  console.log('\n结论: ' + (hit ? hit : '未命中'));
})();
