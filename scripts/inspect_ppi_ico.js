const fs = require('fs');

const icoPath = 'C:\\Users\\User\\Downloads\\LOGO SMART PPI BARU.ico';
const buf = fs.readFileSync(icoPath);
console.log('Size:', buf.length);
console.log('First 16 bytes:', buf.subarray(0, 16).toString('hex'));
const numImages = buf.readUInt16LE(4);
console.log('Images:', numImages);
for (let i = 0; i < numImages; i++) {
  const off = 6 + i * 16;
  const w = buf[off] || 256;
  const h = buf[off+1] || 256;
  const bpp = buf.readUInt16LE(off+6);
  const sz = buf.readUInt32LE(off+8);
  const imgOff = buf.readUInt32LE(off+12);
  const imgData = buf.subarray(imgOff, imgOff + sz);
  const isPng = imgData.subarray(0, 8).toString('hex') === '89504e470d0a1a0a';
  const isBmp = imgData.readUInt32LE(0) === 40;
  console.log(`Image ${i+1}: ${w}x${h}, bpp: ${bpp}, size: ${sz}, offset: ${imgOff}, isPng: ${isPng}, isBmp: ${isBmp}`);
}
