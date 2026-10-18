#!/usr/bin/env node
/**
 * 小苹果影视盒子 2.0.3 —— 授权请求离线构造器
 *
 * 算法（从 libhsjtv.so 逆出并验证）：
 *   key = "huasj:fongmi:auth:v1:20260707:ndk"          // 原始 ASCII，XOR 0x5A 混淆存于 .rodata
 *   msg = KEY_VERSION + "\n" + METHOD + "\n" + PATH + "\n" + TIMESTAMP + "\n" + NONCE + "\n" + BODY_SHA256
 *   X-HSJ-Signature = HMAC-SHA256(key, msg) 的小写 hex
 *
 *   BODY_SHA256 = sha256(最终请求体) 的小写 hex
 *   请求体      = enc=1&alg=AES-256-GCM&kid=<KEY_VERSION>&iv=<b64url>&data=<b64url>
 *   其中 data   = AES-256-GCM(cryptoKey, iv=12B随机, plaintext=表单串)，tag 附在末尾
 *
 * 用法：
 *   node sign_request.js --path /play_auth --base https://la.9box.store/api.php/fongmi \
 *        --token <X-Device-Token> --key <cryptoKey-hex> --form "device_uuid=...&device_token=..."
 *   node sign_request.js --selftest      # 用抓包样本自检
 */
const crypto = require('crypto');

const SEED = Buffer.from('huasj:fongmi:auth:v1:20260707:ndk', 'utf8');
const KEY_VERSION = 'hsj-auth-v1';

function b64u(buf) {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function fromB64u(s) {
  const pad = s.length % 4 === 0 ? 0 : 4 - (s.length % 4);
  return Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat(pad), 'base64');
}

function sha256hex(s) {
  return crypto.createHash('sha256').update(s).digest('hex');
}

function sign(method, path, timestamp, nonce, bodySha256) {
  const msg = [KEY_VERSION, method.toUpperCase(), path, timestamp, nonce, bodySha256].join('\n');
  return crypto.createHmac('sha256', SEED).update(msg).digest('hex');
}

function encryptForm(cryptoKeyHex, plaintext) {
  const key = Buffer.from(cryptoKeyHex.replace(/[^0-9a-fA-F]/g, ''), 'hex');
  if (key.length !== 32) throw new Error('cryptoKey 必须是 32 字节');
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ct = Buffer.concat([c.update(Buffer.from(plaintext, 'utf8')), c.final()]);
  const tag = c.getAuthTag();
  return { iv: b64u(iv), data: b64u(Buffer.concat([ct, tag])) };
}

function buildRequest(opts) {
  const method = (opts.method || 'POST').toUpperCase();
  const path = opts.path;                       // 相对路径，如 /play_auth
  const base = opts.base.replace(/\/+$/, '');
  const url = base + path;

  const { iv, data } = encryptForm(opts.key, opts.form || '');
  const body = `enc=1&alg=AES-256-GCM&kid=${KEY_VERSION}&iv=${iv}&data=${data}`;

  const timestamp = String(opts.timestamp || Math.floor(Date.now() / 1000));
  const nonce = opts.nonce || crypto.randomBytes(16).toString('hex');
  const bodySha256 = sha256hex(body);
  const signature = sign(method, path, timestamp, nonce, bodySha256);

  return {
    url,
    method,
    headers: {
      'X-Device-Token': opts.token,
      'X-HSJ-Encrypted': '1',
      'X-HSJ-Key-Version': KEY_VERSION,
      'X-HSJ-Timestamp': timestamp,
      'X-HSJ-Nonce': nonce,
      'X-HSJ-Body-SHA256': bodySha256,
      'X-HSJ-Signature': signature,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'okhttp/5.0.0-alpha.14',
    },
    body,
  };
}

// ---------- 自检：用真实抓包样本复算 ----------
function selftest() {
  const cases = [
    // 来自 cap5.log（会话 A）
    ['POST', '/play_auth', '1792256979', '4d9f51c5c681f4434c456f7897a2de86',
     '87c7ba8add9c4bdd1fd5d1676c4cad09466d4739f6b6e3f737b1a0908d039776',
     '21de1917ee5af5602f7596818356d0e58afa33e17678558791f56a242af09d68'],
    ['POST', '/play_auth', '1792256979', '207e95c80278d293510e106fd98acb43',
     '154f10aabece613414c556e2cbb7aa7d72ef65e8c7c4156405f8540e03504114',
     'c6f2cdb6dc482f115c7aa3341b7a61b86127e4190f655bb4b2d75bb20c0e7d8f'],
    ['POST', '/play_auth', '1792256987', '7e06d22766d3d6fb3f6bce9e224b5808',
     'b97537eb387a04bc82ed5cdd757934e8b37d12b792b4914a632bb46b1caab3b7',
     '1f56979bddafe6cd21d4f9325562fc227cd947a9627e5b2c47cadd916665dd33'],
    ['POST', '/play_auth', '1792256987', '0bc32da6a8d89c3f481469c8bd51c689',
     'b4fbdcb7d1d841f63901bd73129cd92bf0f268f08bade67c732a943165fb933b',
     '36a8566ad32df26da8038b7b574059488b42646082e1b31500b26b0d1e001e21'],
    // 来自 hook_sig.js 实时抓的（会话 B，含另一个接口）
    ['POST', '/play_auth', '1792257889', '35e1d15ee1709fe20fd16faa632c6f6f',
     'eb8a43861bb7addddd252ca7c024b7b67d1268ef793ac31acd0bd231554a1566',
     'e8844522de385c3e5db1b4dca45690c2ae04871a8c0a1e25cb40cb29eb99e31d'],
    ['POST', '/device_trial', '1792257891', '82471525393e0530caf7a8c9f8acdb86',
     '400007304119194a672a49a1889ed70f5f2c714ba2a2493cf928788f47e52352',
     '95687a5926a95bfc6dd827861f72f1b76328ff819e975a9b0ec73ad4fef5639f'],
  ];
  let pass = 0;
  for (const [m, p, ts, n, bh, want] of cases) {
    const got = sign(m, p, ts, n, bh);
    const ok = got === want;
    if (ok) pass++;
    console.log((ok ? 'PASS' : 'FAIL') + '  ' + m + ' ' + p + '  ' + got.slice(0, 16) + '...');
  }
  console.log(`\n${pass}/${cases.length} 通过`);
  return pass === cases.length;
}

function parseArgs(argv) {
  const out = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--selftest') { out.selftest = true; continue; }
    if (a.startsWith('--')) {
      out[a.slice(2)] = argv[++i];
    }
  }
  return out;
}

if (require.main === module) {
  const args = parseArgs(process.argv);
  if (args.selftest || !args.path) {
    const ok = selftest();
    process.exit(ok ? 0 : 1);
  }
  const req = buildRequest({
    base: args.base || 'https://la.9box.store/api.php/fongmi',
    method: args.method || 'POST',
    path: args.path,
    form: args.form || '',
    token: args.token || '',
    key: args.key || '',
    timestamp: args.timestamp,
    nonce: args.nonce,
  });
  console.log(req.method + ' ' + req.url);
  for (const [k, v] of Object.entries(req.headers)) console.log('  ' + k + ': ' + v);
  console.log('\n' + req.body);
}

module.exports = { sign, encryptForm, buildRequest, SEED, KEY_VERSION };
