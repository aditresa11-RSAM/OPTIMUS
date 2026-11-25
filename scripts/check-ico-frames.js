const fs = require('fs');
const buf = fs.readFileSync('public/optimus_app.ico');

const numImages = buf.readUInt16LE(4);
console.log('Images:', numImages);
for (let i = 0; i < numImages; i++) {
  const offset = 6 + i * 16;
  const w = buf[offset] || 256;
  const h = buf[offset + 1] || 256;
  const size = buf.readUInt32LE(offset + 8);
  const imgOffset = buf.readUInt32LE(offset + 12);
  const imgData = buf.subarray(imgOffset, imgOffset + size);
  const isPng = imgData.subarray(0, 8).toString('hex') === '89504e470d0a1a0a';
  const isBmp = imgData.readUInt32LE(0) === 40; // BITMAPINFOHEADER header size is 40
  console.log(`Image ${i+1}: ${w}x${h}, size: ${size}, PNG: ${isPng}, BMP: ${isBmp}`);
}
