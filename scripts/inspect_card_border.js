const sharp = require('sharp');

async function inspectCardBorder() {
  const file = 'C:/Users/User/Downloads/Modern Hospital Data Dashboard Banner.png';
  const { data, info } = await sharp(file).raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height;

  // Let's find the top border line:
  // Around x = 1200, y = 140 to 170
  console.log('Top border pixels around y=154 at x=1200:');
  for (let y = 145; y <= 165; y++) {
    const idx = (y * w + 1200) * 3;
    console.log(`y=${y}: RGB=(${data[idx]}, ${data[idx+1]}, ${data[idx+2]})`);
  }

  // Right border pixels around x=2140 at y=350:
  console.log('Right border pixels around x=2140 at y=350:');
  for (let x = 2125; x <= 2160; x += 5) {
    const idx = (350 * w + x) * 3;
    console.log(`x=${x}: RGB=(${data[idx]}, ${data[idx+1]}, ${data[idx+2]})`);
  }

  // Bottom border pixels around y=611 at x=1800:
  console.log('Bottom border pixels around y=611 at x=1800:');
  for (let y = 600; y <= 620; y += 2) {
    const idx = (y * w + 1800) * 3;
    console.log(`y=${y}: RGB=(${data[idx]}, ${data[idx+1]}, ${data[idx+2]})`);
  }
}

inspectCardBorder().catch(console.error);
