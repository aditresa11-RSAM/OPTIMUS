const fs = require('fs');
const sharp = require('sharp');

// Let's extract the 48x48 or 32x32 BMP from favicon (5).ico and save it
const buf = fs.readFileSync('C:\\Users\\User\\Downloads\\favicon (5).ico');
// The BMP data in ICO is a BITMAPINFOHEADER without the BITMAPFILEHEADER.
// We can reconstruct a valid BMP file by adding the 14-byte BITMAPFILEHEADER!

function saveBmpFromIco(frameIndex, outputPath) {
  const off = 6 + frameIndex * 16;
  const w = buf[off] || 256;
  const h = buf[off+1] || 256;
  const sz = buf.readUInt32LE(off+8);
  const imgOff = buf.readUInt32LE(off+12);
  const dibData = buf.subarray(imgOff, imgOff + sz);

  // BITMAPINFOHEADER has biHeight = 2 * h (because it includes mask in ICO).
  // Let's create a copy of dib and adjust biHeight to h if needed, or see if sharp can read it directly.
  // Actually, Sharp can read PNG directly, or we can check what files are in Downloads.
  console.log(`Frame ${frameIndex}: ${w}x${h}, size: ${sz}`);
}

saveBmpFromIco(0, 'frame0.bmp');
saveBmpFromIco(1, 'frame1.bmp');
saveBmpFromIco(2, 'frame2.bmp');
saveBmpFromIco(3, 'frame3.bmp');
