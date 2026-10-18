#!/usr/bin/env node
/**
 * 逆向 verifyResponse：服务端返回的 server_nonce + server_sign
 * verifyResponse(String body, String s2, String s3, String s4) —— 4 个参数
 */
const fs = require('fs');
const crypto = require('crypto');
const { buildRequest } = require('./sign_request.js');

const PREFS = 'prefs.xml';
const SEED = Buffer.from('huasj:fongmi:auth:v1:20260707:ndk', 'utf8');
const KEY_HEX = '245a46d69c39d4d0815c5cf02e8dc714af493891f1c50e15f9b4a9abd675335e';
const BASE = 'https://la.9box.store/api.php/fongmi';

const xml = fs.readFileSync(PREFS, 'utf8').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
const uuid = xml.match(/name="auth_device_uuid">([^<]*)</)[1];
const token = JSON.parse(xml.match(/name="auth_device_login">([\s\S]*?)<\/string>/)[1]).token;

function b64uDecode(s) {
  const pad = s.length % 4 === 0 ? 0 : 4 - (s.length % 4);
  return Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat(pad), 'base64');
}

async function main() {
  const form = 'device_uuid=' + uuid + '&device_token=' + token;
  const req = buildRequest({ base: BASE, path: '/play_auth', form, token, key: KEY_HEX });
  const res = await fetch(req.url, { method: 'POST', headers: req.headers, body: req.body });
  const text = await res.text();
  const env = JSON.parse(text);
  const iv = b64uDecode(env.iv);
  const data = b64uDecode(env.data);
  const d = crypto.createDecipheriv('aes-256-gcm', Buffer.from(KEY_HEX, 'hex'), iv);
  d.setAuthTag(data.subarray(data.length - 16));
  const plain = Buffer.concat([d.update(data.subarray(0, data.length - 16)), d.final()]).toString('utf8');

  const obj = JSON.parse(plain);
  const nonce = obj.server_nonce;
  const sign = obj.server_sign;
  console.log('server_nonce:', nonce);
  console.log('server_sign :', sign);
  console.log('明文长度    :', plain.length);

  // 候选消息：整包 / 去 sign / 规范化
  const withoutSign = JSON.stringify(Object.fromEntries(Object.entries(obj).filter(([k]) => k !== 'server_sign')));
  const withoutNonceSign = JSON.stringify(Object.fromEntries(Object.entries(obj).filter(([k]) => k !== 'server_sign' && k !== 'server_nonce')));

  const msgs = {
    'plain': plain,
    'withoutSign': withoutSign,
    'withoutNonceSign': withoutNonceSign,
    'nonce+plain': nonce + '\n' + plain,
    'plain+nonce': plain + '\n' + nonce,
    'nonce+withoutSign': nonce + '\n' + withoutSign,
    'withoutSign+nonce': withoutSign + '\n' + nonce,
    'nonce': nonce,
    'kv+nonce+plain': ['hsj-auth-v1', nonce, plain].join('\n'),
    'kv+nonce+withoutSign': ['hsj-auth-v1', nonce, withoutSign].join('\n'),
  };

  console.log('\n=== 尝试（key = 种子串）===');
  let hit = null;
  for (const [name, m] of Object.entries(msgs)) {
    const h = crypto.createHmac('sha256', SEED).update(m).digest('hex');
    const ok = h === sign;
    if (ok) hit = name;
    console.log((ok ? 'MATCH ' : '      ') + name.padEnd(24) + h.slice(0, 20));
  }

  // 也试试 sha256(key||msg)
  console.log('\n=== SHA256 变体 ===');
  for (const [name, m] of Object.entries(msgs)) {
    const a = crypto.createHash('sha256').update(Buffer.concat([SEED, Buffer.from(m)])).digest('hex');
    const b = crypto.createHash('sha256').update(Buffer.concat([Buffer.from(m), SEED])).digest('hex');
    if (a === sign) { console.log('MATCH SHA256(key||msg)  ' + name); hit = 'sha256pre:' + name; }
    if (b === sign) { console.log('MATCH SHA256(msg||key)  ' + name); hit = 'sha256post:' + name; }
  }

  console.log('\n结论: ' + (hit ? '命中 -> ' + hit : '未命中，需要看 verifyResponse 的反汇编'));
  fs.writeFileSync('play_auth_plain.json', JSON.stringify(obj, null, 2), 'utf8');
}

main();
