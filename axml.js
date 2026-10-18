// Minimal binary AXML (AndroidManifest.xml) decoder — ordinary Node analysis, not REA evidence
const fs = require('fs');
const buf = fs.readFileSync('D:/REA/LittleApple-extract/AndroidManifest.xml');

let pos = 0;
function u16(p){ return buf.readUInt16LE(p); }
function u32(p){ return buf.readUInt32LE(p); }
function i32(p){ return buf.readInt32LE(p); }

// file header: type(2) headerSize(2) size(4) -> 8 bytes
const TREE_HEADER = 8;

// ---- 1. find StringPool chunk (type 0x0001) right after header ----
const strings = [];
let chunks = [];
let p = TREE_HEADER;
while (p < buf.length) {
  const type = u16(p), size = u32(p + 4);
  chunks.push({ type, offset: p, size });
  if (type === 0x0001) {
    const stringCount = u32(p + 8);
    const flags = u32(p + 20);
    const stringsOffset = u32(p + 24);
    const utf8 = (flags & 0x100) !== 0;
    let sp = p + stringsOffset;
    for (let i = 0; i < stringCount; i++) {
      // offsets stored at p+headerSize
      const off = u32(p + 28 + i * 4);
      const s = utf8 ? readUtf8(p + stringsOffset + off) : readUtf16(sp + off * 2);
      strings.push(s);
    }
  }
  p += size;
  if (size === 0) break;
}

function readUtf16(off) {
  let len = buf.readUInt16LE(off);
  if (len < 0x8000) return buf.toString('utf16le', off + 2, off + 2 + len * 2);
  return buf.toString('utf16le', off + 4, off + 4 + len * 2);
}
function readUtf8(off) {
  let l1 = buf[off];
  let byteLen;
  if (l1 & 0x80) { byteLen = ((l1 & 0x3f) << 8) | buf[off + 1]; off += 2 - 1; } else { byteLen = l1; off += 1; }
  // second length field (bytes)
  let l2 = buf[off];
  if (l2 & 0x80) { off += 2; } else { off += 1; }
  return buf.toString('utf8', off, off + byteLen);
}

// ---- 2. resource map (0x0180): attribute resource ids ----
let attrIds = null;
for (const c of chunks) if (c.type === 0x0180) attrIds = [];
if (attrIds) {
  const c = chunks.find(c => c.type === 0x0180);
  const n = Math.floor((c.size - 8) / 4);
  for (let i = 0; i < n; i++) attrIds.push(u32(c.offset + 8 + i * 4).toString(16));
}

const ANDROID_NS = 'android';
const NAME_ATTR = '1000003'; // android:name
const PERMISSIONS_GROUP = '1000100'; // android:permission

// ---- 3. walk start/end element chunks (0x0102/0x0103) ----
const manifest = { package: null, attrs: {}, components: [], permissions: [], sdk: {} };
let stack = [];
for (const c of chunks) {
  if (c.type !== 0x0102) continue;
  const headerSize = u16(c.offset + 2);
  // start-element: headerSize(2) at +2; line,comment; ns(-1) at +headerSize, name at +header+4
  const ns = i32(c.offset + headerSize);
  const nameIdx = i32(c.offset + headerSize + 4);
  const el = strings[nameIdx] || `?${nameIdx}`;
  const attrStart = c.offset + headerSize + 20;
  const attrCount = u16(c.offset + headerSize + 16);
  const attrs = {};
  for (let i = 0; i < attrCount; i++) {
    const a = attrStart + i * 20;
    const aNs = i32(a), aName = i32(a + 4);
    const raw = i32(a + 8);
    const dataType = buf[a + 15];
    const data = u32(a + 16);
    const attrName = strings[aName] || `?${aName}`;
    const idStr = (aNs === -1 || (aNs >= 0 && (strings[aNs] || '') === ANDROID_NS)) ? (attrIds ? attrIds[i] : null) : `ns:${attrName}`;
    let value;
    if (raw !== -1 && raw < strings.length) value = strings[raw];
    else if (dataType === 0x03) value = strings[data];
    else if (dataType === 0x10) value = String(buf.readInt32LE(a + 16));
    else if (dataType === 0x12) value = String(data !== 0);
    else if (dataType === 0x01) value = `@ref/${data.toString(16)}`;
    else value = JSON.stringify(data) + ` (t${dataType.toString(16)})`;
    attrs[attrName] = value;
  }
  const info = { el, ns: ns >= 0 ? strings[ns] : '(none)', ...attrs };
  if (el === 'manifest') { manifest.package = attrs.package; manifest.attrs = attrs; }
  else if (el === 'uses-permission' || el === 'uses-permission-sdk-23') manifest.permissions.push(attrs.name);
  else if (el === 'uses-sdk') manifest.sdk = attrs;
  else if (['application','activity','activity-alias','service','receiver','provider','meta-data'].includes(el)) {
    manifest.components.push({ type: el, name: attrs.name || '', exported: attrs.exported, permission: attrs.permission, process: attrs.process, extra: el === 'meta-data' ? attrs.value || JSON.stringify(attrs) : undefined });
  }
}

console.log('package:', manifest.package);
console.log('versionCode:', manifest.attrs.versionCode, ' versionName:', manifest.attrs.versionName);
console.log('compileSdk/minSdk/targetSdk:', JSON.stringify(manifest.sdk));
console.log('\n== USES-PERMISSIONS (%d) ==', manifest.permissions.length);
console.log([...new Set(manifest.permissions)].join('\n'));
console.log('\n== COMPONENTS ==');
for (const ccomp of manifest.components) {
  if (ccomp.el === 'application') { console.log('application: label=' + ccomp.label + ' name=' + (ccomp['name']||'') ); continue; }
  if (ccomp.el === 'meta-data') { console.log('meta-data: ' + ccomp['name'] + ' = ' + ccomp.extra); continue; }
  console.log(ccomp.el.toUpperCase() + (ccomp.exported==='true' ? ' [EXPORTED]' : '') + (ccomp.permission ? ' perm=' + ccomp.permission : '') + ' :: ' + ccomp.name);
}
