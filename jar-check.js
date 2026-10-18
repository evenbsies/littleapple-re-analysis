const fs = require('fs');
const c = require('crypto');
const p = 'D:/REA/android/jadx-headless-mcp-0.7.1-all.jar';
const st = fs.statSync(p);
const b = fs.readFileSync(p);
console.log('size:', st.size);
console.log('sha256:', c.createHash('sha256').update(b).digest('hex'));
