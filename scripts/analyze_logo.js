const sharp = require('sharp');

async function run() {
  const { data, info } = await sharp('public/images/optimus_header_logo.png')
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  console.log(`Dimensions: ${width}x${height}, channels: ${channels}`);

  for (let y = 0; y < height; y += 10) {
    let nonZero = 0;
    let whiteCount = 0;
    let blackShadowCount = 0;
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels;
      const a = data[idx + 3];
      if (a > 20) {
        nonZero++;
        const r = data[idx], g = data[idx + 1], b = data[idx + 2];
        if (r > 200 && g > 200 && b > 200) whiteCount++;
        if (r < 60 && g < 60 && b < 60) blackShadowCount++;
      }
    }
    console.log(`y=${y}: nonZero=${nonZero}, white=${whiteCount}, shadow=${blackShadowCount}`);
  }
}

run().catch(console.error);
