const sharp = require('sharp');

async function analyzeOverlap() {
  const file = 'public/uploads/inspect_overlap.png';
  const { data, info } = await sharp(file).raw().toBuffer({ resolveWithObject: true });
  console.log('inspect_overlap info:', info.width, 'x', info.height);

  // In this crop, left=1050 in original.
  // Let's find where the text pixels are in this crop:
  // Text pixels: r < 120, g < 120, b < 120
  let minX = info.width, maxX = 0;
  let textRegions = [];
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const idx = (y * info.width + x) * info.channels;
      const r = data[idx], g = data[idx+1], b = data[idx+2];
      if (r < 115 && g < 115 && b < 115) {
        if (x < 300) { // text is on the left of this crop
          textRegions.push({ x: 1050 + x, y: 100 + y });
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
        }
      }
    }
  }
  console.log('Text in crop spans local x:', minX, 'to', maxX, '(original x:', 1050 + minX, 'to', 1050 + maxX, ')');
}

analyzeOverlap().catch(console.error);
