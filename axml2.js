// AXML decoder v2 — debug strings + full elements
const fs = require('fs');
const buf = fs.readFileSync('D:/REA/LittleApple-extract/AndroidManifest.xml');
function u16(p){ return buf.readUInt16LE(p); }
function u32(p){ return buf.readUInt32LE(p); }
function i32(p){ return buf.readInt32LE(p); }

const strings = [];
const chunks = [];
let p = 8;
while (p < buf.length) {
  const type = u16(p), size = u32(p + 4);
  chunks.push({ type, offset: p, size });
  p += size; if (size === 0) break;
}

// string pool
const sp = chunks.find(c => c.type === 0x0001);
{
  const stringCount = u32(sp.offset + 8);
  const flags = u32(sp.offset + 20);
  const stringsOffset = u32(sp.offset + 24);
  const utf8 = (flags & 0x100) !== 0;
  const base = sp.offset + stringsOffset;
  for (let i = 0; i < stringCount; i++) {
    const off = u32(sp.offset + 28 + i * 4);
    strings.push(utf8 ? readUtf8(base + off) : buf.toString('utf16le', base + off + 2, base + off + 2 + u16(base + off) * 2));
  }
}
function readUtf8(off) {
  let charLen = buf[off]; let adv = 1;
  if (charLen & 0x80) { charLen = ((charLen & 0x7f) << 8) | buf[off + 1]; adv = 2; }
  let byteLen = buf[off + adv]; let adv2 = 1;
  if (byteLen & 0x80) { byteLen = ((byteLen & 0x7f) << 8) | buf[off + adv + 1]; adv2 = 2; }
  return buf.toString('utf8', off + adv + adv2, off + adv + adv2 + byteLen);
}
console.log('strings:', strings.length, 'utf8Sample:', JSON.stringify(strings.slice(0, 6)));

// resource map
const rm = chunks.find(c => c.type === 0x0180);
const attrIds = [];
if (rm) {
  const n = Math.floor((rm.size - 8) / 4);
  for (let i = 0; i < n; i++) attrIds.push(u32(rm.offset + 8 + i * 4));
}
console.log('attrIds:', attrIds.map(x => x.toString(16)).join(','));

const declared = { package: '', versionCode: '', versionName: '', permissions: [], comps: [] };
for (const c of chunks) {
  if (c.type !== 0x0102) continue;
  const hs = u16(c.offset + 2);
  const el = strings[i32(c.offset + hs + 4)];
  const attrStart = c.offset + hs + 20;
  const attrCount = u16(c.offset + hs + 16 + 12); // attrExt+16 = attrCount? attrExt begins at hs; attrExt+12=attributeCount? framework: ns0,name4,attrStart8,attrSize10,attrCount12 -> at c+hs+12
  // NOTE: use attrExt fields properly: attributeCount at c+hs+12
  const ac = u16(c.offset + hs + 12);
  const attrs = {};
  for (let i = 0; i < ac; i++) {
    const a = attrStart + i * 20;
    const raw = i32(a + 8);
    const dataType = buf[a + 15];
    const data = u32(a + 16);
    const aName = strings[i32(a + 4)] || `?${i32(a + 4)}`;
    let value;
    if (raw !== -1) value = strings[raw];
    else if (dataType === 0x03) value = strings[data];
    else if (dataType === 0x10) value = String(i32(a + 16));
    else if (dataType === 0x12) value = String(data !== 0);
    else if (dataType === 0x01) value = `@ref/${data.toString(16)}`;
    else value = JSON.stringify(data);
    attrs[aName] = value;
  }
  if (el === 'manifest') { declared.package = attrs.package || ''; declared.versionCode = attrs.versionCode; declared.versionName = attrs.versionName; }
  else if (el === 'uses-permission') declared.permissions.push(attrs.name);
  else if (el === 'uses-permission-sdk-23') declared.permissions.push(attrs.name + ' [sdk23]');
  else if (el === 'uses-sdk') declared.sdk = attrs;
  else if (['application','activity','activity-alias','service','receiver','provider'].includes(el)) {
    declared.comps.push({ type: el, name: attrs.name || `(${el})`, exported: attrs.exported, permission: attrs.permission });
  }
}
declared.sdk = declared.sdk || {};
console.log('\npackage:', declared.package, ' versionCode:', declared.versionCode, ' versionName:', declared.versionName);
console.log('minSdk:', declared.sdk.minSdkVersion, ' targetSdk:', declared.sdk.targetSdkVersion);
console.log('\n== USES-PERMISSIONS ==');
console.log([...new Set(declared.permissions)].join('\n'));
console.log('\n== COMPONENTS ==');
for (const ccomp of declared.comps) console.log(`${ccomp.type.toUpperCase().padEnd(9)} ${(ccomp.exported === 'true' ? '[EXPORTED] ' : '')}${ccomp.name}${ccomp.permission ? '  perm=' + ccomp.permission : ''}`);
