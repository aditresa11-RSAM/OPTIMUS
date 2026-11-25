const sharp = require('sharp');

async function analyze() {
  const img = sharp('C:/Users/User/.gemini/antigravity/brain/bc1bd40a-d89f-426d-b5a2-e8651167bada/.user_uploaded/media_1793063763616_bc10998b.png');
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });

  console.log(`Image info: ${info.width}x${info.height}`);

  // Let's inspect the top edge from y=0 to y=35 across all x
  // Where are pixels significantly different from the top-left background [253, 253, 253]?
  const bgR = data[0], bgG = data[1], bgB = data[2];
  console.log(`Background reference at (0,0): rgb(${bgR}, ${bgG}, ${bgB})`);

  let popoutMinX = 10000, popoutMaxX = -1;
  for (let y = 0; y < 31; y++) {
    for (let x = 0; x < info.width; x++) {
      const idx = (y * info.width + x) * info.channels;
      const r = data[idx], g = data[idx+1], b = data[idx+2];
      const diff = Math.abs(r - bgR) + Math.abs(g - bgG) + Math.abs(b - bgB);
      if (diff > 25) {
        if (x < popoutMinX) popoutMinX = x;
        if (x > popoutMaxX) popoutMaxX = x;
      }
    }
  }
  console.log(`Popout characters at top (y < 31) span from x = ${popoutMinX} to x = ${popoutMaxX}`);
}

analyze().catch(console.error);
