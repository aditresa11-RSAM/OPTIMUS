const sharp = require('sharp');

async function checkBorderLine() {
  const file = 'public/uploads/input_data_header_art_hq.png';
  const { data, info } = await sharp(file).raw().toBuffer({ resolveWithObject: true });
  console.log('Size:', info.width, 'x', info.height);

  // In this image, y=84 was the original cardTop (154 in Canva).
  // Let's sample pixels along y = 84 across x = 0 to 600 (before the nurse)
  for (let x = 100; x <= 500; x += 50) {
    const idx = (84 * info.width + x) * 4;
    console.log(`x=${x}, y=84: RGB=(${data[idx]}, ${data[idx+1]}, ${data[idx+2]}), Alpha=${data[idx+3]}`);
  }

  // Also check y = 60 (above the cardTop):
  for (let x = 100; x <= 500; x += 50) {
    const idx = (60 * info.width + x) * 4;
    console.log(`x=${x}, y=60: RGB=(${data[idx]}, ${data[idx+1]}, ${data[idx+2]}), Alpha=${data[idx+3]}`);
  }
}

checkBorderLine().catch(console.error);
