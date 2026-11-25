const sharp = require('sharp');

async function renderOverlapAscii() {
  const file = 'public/uploads/inspect_overlap.png';
  // Resize to 120 x 40
  const { data, info } = await sharp(file).resize(120, 40).grayscale().raw().toBuffer({ resolveWithObject: true });
  for (let y = 0; y < info.height; y++) {
    let row = '';
    for (let x = 0; x < info.width; x++) {
      const v = data[y * info.width + x];
      row += v < 120 ? '#' : (v < 210 ? '.' : ' ');
    }
    console.log(row);
  }
}

renderOverlapAscii().catch(console.error);
