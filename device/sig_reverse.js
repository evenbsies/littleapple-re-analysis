// 用真实抓包数据反推签名算法
// signRequest(method, path, timestamp, nonce, bodySha256)
const crypto = require('crypto');
const fs = require('fs');

const logPath = process.argv[2] || 'cap5.log';
const keyHex = process.argv[3] || '245a46d69c39d4d0815c5cf02e8dc714af493891f1c50e15f9b4a9abd675335e';

// 从抓包里取一条 play_auth
const lines = fs.readFileSync(logPath, 'utf8').split('\n');
let s = null;
for (const line of lines) {
  if (!line.includes('"t": "REQ"')) continue;
  let o; try { o = JSON.parse(line); } catch (e) { continue; }
  if (!/play_auth/.test(o.url || '')) continue;
  const h = {};
  for (const kv of (o.h || '').split(' | ')) {
    const i = kv.indexOf('='); if (i > 0) h[kv.slice(0, i)] = kv.slice(i + 1);
  }
  if (!h['X-HSJ-Signature'] || !o.body) continue;
  s = { url: o.url, method: o.m, body: o.body, h };
  break;
}
if (!s) { console.log('no sample'); process.exit(1); }

const u = new URL(s.url);
const sample = {
  method: s.method.toUpperCase(),
  path: u.pathname,
  ts: s.h['X-HSJ-Timestamp'],
  nonce: s.h['X-HSJ-Nonce'],
  bodyHash: s.h['X-HSJ-Body-SHA256'],
  sig: s.h['X-HSJ-Signature'],
  keyVersion: s.h['X-HSJ-Key-Version'],
  url: s.url,
  body: s.body,
};

console.log('=== 样本 ===');
console.log('method   :', sample.method);
console.log('path     :', sample.path);
console.log('timestamp:', sample.ts);
console.log('nonce    :', sample.nonce);
console.log('bodyHash :', sample.bodyHash);
console.log('signature:', sample.sig);

// 1) 验证 bodySha256 = sha256(body) 的 hex
const sha256hex = (b) => crypto.createHash('sha256').update(b).digest('hex');
console.log('\n=== body hash 校验 ===');
console.log('sha256(body)        :', sha256hex(sample.body));
console.log('sha256(body) 匹配头 :', sha256hex(sample.body) === sample.bodyHash);

// 2) 穷举消息拼接
const parts = {
  m: sample.method,
  p: sample.path,
  t: sample.ts,
  n: sample.nonce,
  b: sample.bodyHash,
};
const names = Object.keys(parts);
const seps = ['', '\n', ':', '&', '|', '/', '-', '.', ';', ' ', '\r\n'];

const keys = {
  raw: Buffer.from(keyHex, 'hex'),
  rawHex: Buffer.from(keyHex, 'utf8'),
  keyVersion: Buffer.from(sample.keyVersion, 'utf8'),
  sha256raw: Buffer.from(sha256hex(Buffer.from(keyHex, 'hex')), 'hex'),
};

function hmac(k, msg, alg) {
  return crypto.createHmac(alg || 'sha256', k).update(msg).digest('hex');
}

const found = [];
let tried = 0;
for (const sep of seps) {
  // 全部 5 个字段的不同顺序
  const perms = permute(names.slice());
  for (const order of perms) {
    const msg = order.map((k) => parts[k]).join(sep);
    for (const [kn, k] of Object.entries(keys)) {
      const h = hmac(k, msg);
      tried++;
      if (h === sample.sig) found.push({ sep: JSON.stringify(sep), order: order.join(''), key: kn, msg });
    }
  }
  // 也试试 4 个字段的组合（不含 method / 不含 path）
  const subsets = [['p', 't', 'n', 'b'], ['m', 't', 'n', 'b'], ['p', 'n', 'b'], ['t', 'n', 'b']];
  for (const sub of subsets) {
    const msg = sub.map((k) => parts[k]).join(sep);
    for (const [kn, k] of Object.entries(keys)) {
      tried++;
      if (hmac(k, msg) === sample.sig) found.push({ sep: JSON.stringify(sep), order: sub.join(''), key: kn, msg });
    }
  }
}

function permute(a) {
  if (a.length <= 1) return [a];
  const out = [];
  for (let i = 0; i < a.length; i++) {
    const rest = a.slice(0, i).concat(a.slice(i + 1));
    for (const p of permute(rest)) out.push([a[i]].concat(p));
  }
  return out;
}

console.log('\n=== 穷举结果 ===');
console.log('尝试组合:', tried);
if (found.length) {
  for (const f of found) console.log('命中!', JSON.stringify(f));
} else {
  console.log('未命中 HMAC-SHA256 的直接拼接');
}
