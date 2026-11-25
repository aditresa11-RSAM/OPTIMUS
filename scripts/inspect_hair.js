const sharp = require('sharp');

async function inspectHair() {
  const src = 'C:/Users/User/.gemini/antigravity/brain/bc1bd40a-d89f-426d-b5a2-e8651167bada/.user_uploaded/media_1793063763616_bc10998b.png';
  const { data, info } = await sharp(src).raw().toBuffer({ resolveWithObject: true });

  console.log('Top rows x=760..860:');
  for (let y = 0; y < 8; y++) {
    let rowStr = '';
    for (let x = 790; x <= 840; x += 2) {
      const idx = (y * info.width + x) * info.channels;
      const r = data[idx], g = data[idx+1], b = data[idx+2];
      // '#' if hair (dark), '.' if background (light)
      rowStr += (r < 100 && g < 100 && b < 100) ? '#' : '.';
    }
    console.log(`y=${y}: ${rowStr}`);
  }
}

inspectHair().catch(console.error);
