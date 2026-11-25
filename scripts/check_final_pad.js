const sharp = require('sharp');

async function check() {
  const { data, info } = await sharp('public/images/optimus_header_logo.png')
    .raw()
    .toBuffer({ resolveWithObject: true });

  let minX = info.width, maxX = 0, minY = info.height, maxY = 0;
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      if (data[(y * info.width + x) * 4 + 3] > 20) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  console.log('Final bounds: W=' + info.width + ', H=' + info.height);
  console.log('X range: [' + minX + ', ' + maxX + '], Left pad: ' + minX + 'px, Right pad: ' + (info.width - 1 - maxX) + 'px');
  console.log('Y range: [' + minY + ', ' + maxY + '], Top pad: ' + minY + 'px, Bottom pad: ' + (info.height - 1 - maxY) + 'px');

  // Check subtitle line explicitly
  let sMinX = info.width, sMaxX = 0;
  for (let y = 220; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      if (data[(y * info.width + x) * 4 + 3] > 20) {
        if (x < sMinX) sMinX = x;
        if (x > sMaxX) sMaxX = x;
      }
    }
  }
  console.log('Subtitle X range: [' + sMinX + ', ' + sMaxX + '], Subtitle Left Pad: ' + sMinX + 'px, Right Pad: ' + (info.width - 1 - sMaxX) + 'px');
}

check().catch(console.error);
