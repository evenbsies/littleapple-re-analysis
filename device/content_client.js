#!/usr/bin/env node
/**
 * 小苹果内容源客户端（苹果源 / mw-movie 接口）
 *
 * 签名（从 hsj9.jar 的 JpysNew / AppRJ 还原并验证）：
 *   params = 查询参数按 key 字典序，k=v 用 & 连接
 *   sb     = params + "&key=cb808529bae6b6be45ecfab29a4889bc&t=" + Date.now()
 *   sign   = SHA1( hex(MD5(sb)) )
 *   headers: sign / t / deviceId / authorization
 *
 * 用法：
 *   node content_client.js search 嫁金钗
 *   node content_client.js hot
 *   node content_client.js detail <vod_id>
 */
const crypto = require('crypto');

const API = 'https://www.hkybqufgh.com/api/mw-movie/anonymous';
const SIGN_KEY = 'cb808529bae6b6be45ecfab29a4889bc';
const DEVICE_ID = '<your-device-uuid>';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)';

function signParams(params) {
  const keys = Object.keys(params).filter((k) => params[k] !== undefined && params[k] !== '').sort();
  const base = keys.map((k) => k + '=' + params[k]).join('&');
  const t = Date.now();
  const sb = (base ? base + '&' : '') + 'key=' + SIGN_KEY + '&t=' + t;
  const md5hex = crypto.createHash('md5').update(sb, 'utf8').digest('hex');
  const sign = crypto.createHash('sha1').update(md5hex, 'utf8').digest('hex');
  return { sign, t: String(t), sb };
}

async function call(path, params) {
  const { sign, t, sb } = signParams(params);
  const qs = Object.keys(params).filter((k) => params[k] !== undefined && params[k] !== '')
    .sort().map((k) => encodeURIComponent(k) + '=' + encodeURIComponent(params[k])).join('&');
  const url = API + path + (qs ? '?' + qs : '');
  const res = await fetch(url, {
    headers: {
      sign: sign,
      t: t,
      deviceId: DEVICE_ID,
      authorization: '',
      'User-Agent': UA,
      Accept: 'application/json, text/plain, */*',
    },
  });
  const text = await res.text();
  return { url, status: res.status, sign, t, sb, body: text };
}

function brief(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (Array.isArray(v)) out[k] = '[array x' + v.length + ']';
    else if (v && typeof v === 'object') out[k] = '[obj]';
    else out[k] = v;
  }
  return out;
}

(async () => {
  const cmd = process.argv[2] || 'hot';
  let r;
  if (cmd === 'search') {
    const kw = process.argv[3] || '爱';
    r = await call('/video/searchByWord', { keyword: kw, pageNum: 1, pageSize: 20 });
  } else if (cmd === 'hot') {
    r = await call('/home/hotSearch', {});
  } else if (cmd === 'detail') {
    r = await call('/video/detail', { id: process.argv[3] });
  } else if (cmd === 'play') {
    r = await call('/v2/video/episode/url', { id: process.argv[3], nid: process.argv[4] || '' });
  } else {
    console.log('用法: search <词> | hot | detail <id>');
    return;
  }

  console.log('GET ' + r.url);
  console.log('签名原文: ' + r.sb);
  console.log('sign=' + r.sign + '  t=' + r.t);
  console.log('HTTP ' + r.status + '  ' + r.body.length + 'B\n');

  try {
    const j = JSON.parse(r.body);
    console.log('顶层字段:', Object.keys(j).join(', '));
    console.log(JSON.stringify(brief(j), null, 2).slice(0, 1200));

    // 尝试列出条目
    const list = j.data && (j.data.list || j.data.records || j.data);
    if (Array.isArray(list)) {
      console.log('\n共 ' + list.length + ' 条，前 5 条:');
      for (const it of list.slice(0, 5)) {
        console.log('  - ' + (it.vod_name || it.name || it.title) + '  id=' + (it.vod_id || it.id));
      }
    }
    require('fs').writeFileSync('content_last.json', JSON.stringify(j, null, 2), 'utf8');
    console.log('\n原始响应已存 content_last.json');
  } catch (e) {
    console.log('非 JSON，前 800 字:');
    console.log(r.body.slice(0, 800));
  }
})();
