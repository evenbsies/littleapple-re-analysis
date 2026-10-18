// Extract URL strings and package markers from classes.dex (ordinary Node, not REA evidence)
const fs = require('fs');
const buf = fs.readFileSync('D:\\REA\\LittleApple-extract\\classes.dex');

// pull printable ASCII runs of >= 8 chars
const runs = [];
let cur = [];
for (let i = 0; i < buf.length; i++) {
  const c = buf[i];
  if (c >= 32 && c <= 126) cur.push(c);
  else { if (cur.length >= 8) runs.push(Buffer.from(cur).toString('latin1')); cur = []; }
}
if (cur.length >= 8) runs.push(Buffer.from(cur).toString('latin1'));

const urls = new Set();
const pkgs = new Set();
for (const s of runs) {
  for (const m of s.matchAll(/https?:\/\/[A-Za-z0-9._~:\/?#@!$&'()*+,;=%-]{6,120}/g)) {
    // keep base host+path without query
    urls.add(m[0].split('?')[0]);
  }
  for (const m of s.matchAll(/\b(?:com|org|cn|net)\.[A-Za-z0-9_]+(?:\.[A-Za-z0-9_]+){1,4}\b/g)) {
    pkgs.add(m[0]);
  }
}
const urlList = [...urls];
const pkgList = [...pkgs].filter(p => !/^(java|android|androidx|kotlin|kotlinx|com\.google)\b|^(com\.google\.android\.(material|gms))/.test(p));

function topHosts(list) {
  const hosts = {};
  for (const u of list) { try { const h = new URL(u).host; hosts[h] = (hosts[h]||0)+1; } catch {} }
  return Object.entries(hosts).sort((a,b)=>b[1]-a[1]);
}

console.log('== DEX SIZE ==', buf.length);
console.log('== TOP HOSTS ==');
console.log(JSON.stringify(topHosts(urlList).slice(0, 25), null, 1));
console.log('== SAMPLE URLS ==');
console.log(JSON.stringify(urlList.filter(u=>/xpg|vip|pay|user|api|host|key|sign/i.test(u)).slice(0, 40), null, 1));
console.log('== APP PACKAGES (non-std) ==');
console.log(JSON.stringify(pkgList.filter(p => /[a-z]{3}/.test(p)).slice(0, 60), null, 1));
