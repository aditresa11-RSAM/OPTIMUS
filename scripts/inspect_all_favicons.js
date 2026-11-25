const fs = require('fs');
const path = require('path');
const dl = 'C:\\Users\\User\\Downloads';

fs.readdirSync(dl).filter(f => f.startsWith('favicon')).forEach(f => {
  const p = path.join(dl, f);
  const buf = fs.readFileSync(p);
  const num = buf.readUInt16LE(4);
  console.log(`=== ${f} (${buf.length} bytes, ${num} images) ===`);
  for (let i = 0; i < num; i++) {
    const off = 6 + i * 16;
    const w = buf[off] || 256;
    const h = buf[off+1] || 256;
    const sz = buf.readUInt32LE(off+8);
    const imgOff = buf.readUInt32LE(off+12);
    const dib = buf.subarray(imgOff, imgOff + sz);
    const isPng = dib.subarray(0, 8).toString('hex') === '89504e470d0a1a0a';
    console.log(`  Frame ${i}: ${w}x${h}, size: ${sz}, isPng: ${isPng}`);
  }
});
