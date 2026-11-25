const sharp = require('sharp');

async function inspectTopRight() {
  const src = 'public/uploads/input_right_illustration_fixed.png';
  const { data, info } = await sharp(src).raw().toBuffer({ resolveWithObject: true });

  console.log(`Size: ${info.width}x${info.height}`);
  // Sample pixels near top-right corner (x = info.width - 20, y = 15)
  for (let y = 0; y < 35; y += 5) {
    const idx = (y * info.width + (info.width - 20)) * info.channels;
    console.log(`y=${y}, x=${info.width - 20}: rgb(${data[idx]}, ${data[idx+1]}, ${data[idx+2]}, alpha: ${data[idx+3]})`);
  }
}

inspectTopRight().catch(console.error);
