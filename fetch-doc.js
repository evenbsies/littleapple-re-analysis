const https = require('https');
const fs = require('fs');
function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'node' } }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        // wait for FULL body before following redirect
        let b = [];
        res.on('data', d => b.push(d));
        res.on('end', () => { b; /* consume then redirect */ get(res.headers.location).then(resolve, reject); });
        return;
      }
      let chunks = [];
      res.on('data', d => chunks.push(d));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}
(async () => {
  const urls = [
    ['https://raw.githubusercontent.com/morluto/rea/main/docs/android-analysis.md', 'D:\\REA\\docs\\android-analysis.md'],
    ['https://raw.githubusercontent.com/morluto/rea/main/docs/installation.md', 'D:\\REA\\docs\\installation.md']
  ];
  for (const [u, p] of urls) {
    const buf = await get(u);
    fs.mkdirSync('D:\\REA\\docs', { recursive: true });
    fs.writeFileSync(p, buf);
    console.log(p, buf.length, 'bytes');
  }
})();
