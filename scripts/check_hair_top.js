const sharp = require('sharp');

async function checkHairTop() {
  const file = 'public/uploads/input_data_art_clean.png';
  const { data, info } = await sharp(file).raw().toBuffer({ resolveWithObject: true });
  // Check rows 0 to 10 at x = 600 to 800 (where male nurse head is)
  let darkPixelCount = 0;
  for (let y = 0; y < 5; y++) {
    for (let x = 600; x < 800; x++) {
      const idx = (y * info.width + x) * info.channels;
      if (data[idx] < 150) darkPixelCount++;
    }
  }
  console.log('Dark pixels at very top edge of input_data_art_clean:', darkPixelCount);
}

checkHairTop().catch(console.error);
