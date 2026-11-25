const sharp = require('sharp');

async function inspectGradient() {
  const file = 'C:/Users/User/Downloads/Modern Hospital Data Dashboard Banner.png';
  const { data, info } = await sharp(file).raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height;

  // Let's sample colors at y = 180 (above quote/subtitle) across x = 800 to 1350
  console.log('Sample background colors at y = 180:');
  for (let x = 800; x <= 1350; x += 50) {
    const idx = (180 * w + x) * 3;
    console.log(`x=${x}: RGB=(${data[idx]}, ${data[idx+1]}, ${data[idx+2]})`);
  }

  // Let's sample colors at y = 560 (below quote) across x = 800 to 1350
  console.log('Sample background colors at y = 560:');
  for (let x = 800; x <= 1350; x += 50) {
    const idx = (560 * w + x) * 3;
    console.log(`x=${x}: RGB=(${data[idx]}, ${data[idx+1]}, ${data[idx+2]})`);
  }
}

inspectGradient().catch(console.error);
