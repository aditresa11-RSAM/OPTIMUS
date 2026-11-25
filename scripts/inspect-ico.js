const fs = require('fs');
const path = require('path');

const icoPath = 'C:\\Users\\User\\Downloads\\favicon (5).ico';
if (fs.existsSync(icoPath)) {
  const buf = fs.readFileSync(icoPath);
  console.log('File size:', buf.length);
  console.log('First 16 bytes (hex):', buf.subarray(0, 16).toString('hex'));
  
  // ICO header check: 00 00 01 00
  if (buf[0] === 0 && buf[1] === 0 && buf[2] === 1 && buf[3] === 0) {
    const numImages = buf.readUInt16LE(4);
    console.log('Valid ICO header detected. Number of images:', numImages);
    for (let i = 0; i < Math.min(numImages, 10); i++) {
      const offset = 6 + i * 16;
      const width = buf[offset] === 0 ? 256 : buf[offset];
      const height = buf[offset + 1] === 0 ? 256 : buf[offset + 1];
      const bpp = buf.readUInt16LE(offset + 6);
      const size = buf.readUInt32LE(offset + 8);
      const imgOffset = buf.readUInt32LE(offset + 12);
      console.log(`Image ${i+1}: ${width}x${height}, bpp: ${bpp}, size: ${size}, offset: ${imgOffset}`);
    }
  } else {
    // Check if it's actually PNG or JPEG
    console.log('NOT A STANDARD ICO HEADER!');
    if (buf.subarray(0, 8).toString('hex') === '89504e470d0a1a0a') {
      console.log('This is actually a raw PNG file renamed to .ico!');
    } else if (buf[0] === 0xff && buf[1] === 0xd8) {
      console.log('This is actually a JPEG file renamed to .ico!');
    }
  }
} else {
  console.log('File not found:', icoPath);
}
