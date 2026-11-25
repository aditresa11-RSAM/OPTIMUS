const sharp = require('sharp');

async function inspectHijab() {
  const src = 'C:/Users/User/.gemini/antigravity/brain/bc1bd40a-d89f-426d-b5a2-e8651167bada/.user_uploaded/media_1793063763616_bc10998b.png';
  const { data, info } = await sharp(src).raw().toBuffer({ resolveWithObject: true });

  console.log('Top rows of hijab x=640..730:');
  for (let y = 0; y < 15; y++) {
    let rowStr = '';
    for (let x = 650; x <= 720; x += 2) {
      const idx = (y * info.width + x) * info.channels;
      const r = data[idx], g = data[idx+1], b = data[idx+2];
      // Hijab is green (g > r && g > b && g < 150)
      const isGreen = (g > r + 15 && g > b + 15 && g < 180);
      rowStr += isGreen ? 'G' : '.';
    }
    console.log(`y=${y}: ${rowStr}`);
  }
}

inspectHijab().catch(console.error);
