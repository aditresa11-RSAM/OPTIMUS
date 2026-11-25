const fs = require('fs');
const buf = fs.readFileSync('public/favicon.ico');
const num = buf.readUInt16LE(4);
console.log('public/favicon.ico has', num, 'images');
for (let i = 0; i < num; i++) {
  const off = 6 + i * 16;
  const w = buf[off] || 256;
  const h = buf[off+1] || 256;
  const sz = buf.readUInt32LE(off+8);
  const imgOff = buf.readUInt32LE(off+12);
  const imgData = buf.subarray(imgOff, imgOff + sz);
  const isPng = imgData.subarray(0, 8).toString('hex') === '89504e470d0a1a0a';
  console.log(`Frame ${i}: ${w}x${h}, size: ${sz}, isPng: ${isPng}`);
}
