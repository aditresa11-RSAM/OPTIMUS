const fs = require('fs');
const sharp = require('sharp');

const buf = fs.readFileSync('C:\\Users\\User\\Downloads\\favicon (5).ico');
// In ICO format, Frame 3 (256x256) is at offset 15102, size 270376.
// The DIB header:
// 40 bytes BITMAPINFOHEADER:
// biWidth = 256 (offset + 4)
// biHeight = 512 (offset + 8) -> in ICO, biHeight = 2 * height (image + mask)
// biPlanes = 1 (offset + 12)
// biBitCount = 32 (offset + 14)
// biCompression = 0 (BI_RGB)
// Pixel data is BGRA, bottom-up!
const dibOffset = 15102;
const w = 256;
const h = 256;
const pixelDataOffset = dibOffset + 40; // no palette for 32bpp
const rawPixels = Buffer.alloc(w * h * 4);

// Convert bottom-up BGRA to top-down RGBA
for (let row = 0; row < h; row++) {
  const srcRow = (h - 1 - row);
  const srcRowStart = pixelDataOffset + srcRow * w * 4;
  const dstRowStart = row * w * 4;
  for (let col = 0; col < w; col++) {
    const srcPixel = srcRowStart + col * 4;
    const dstPixel = dstRowStart + col * 4;
    const b = buf[srcPixel];
    const g = buf[srcPixel + 1];
    const r = buf[srcPixel + 2];
    const a = buf[srcPixel + 3];
    rawPixels[dstPixel] = r;
    rawPixels[dstPixel + 1] = g;
    rawPixels[dstPixel + 2] = b;
    rawPixels[dstPixel + 3] = a;
  }
}

sharp(rawPixels, {
  raw: {
    width: w,
    height: h,
    channels: 4
  }
})
.png()
.toFile('scripts/extracted_favicon.png')
.then(() => {
  console.log('Successfully saved extracted_favicon.png!');
})
.catch(err => {
  console.error('Error saving png:', err);
});
