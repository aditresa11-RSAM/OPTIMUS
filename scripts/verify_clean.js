const sharp = require('sharp');

async function verifyClean() {
  const file = 'public/uploads/input_data_art_clean.png';
  // Check the left 300px where the text used to be (y from 50 to 400)
  const { data, info } = await sharp(file)
    .extract({ left: 0, top: 50, width: 350, height: 350 })
    .resize(70, 20)
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  console.log('ASCII of left area in cleaned image:');
  for (let y = 0; y < info.height; y++) {
    let row = '';
    for (let x = 0; x < info.width; x++) {
      const v = data[y * info.width + x];
      row += v < 140 ? '#' : (v < 220 ? '.' : ' ');
    }
    console.log(row);
  }
}

verifyClean().catch(console.error);
