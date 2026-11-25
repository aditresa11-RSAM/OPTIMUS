const sharp = require('sharp');

async function process() {
  // 1. Get bounding box of the top 3D OPTIMUS logo (excluding subtitle below y=255)
  // Let's inspect x-range
  const { data, info } = await sharp('public/images/optimus_header_logo.png')
    .raw()
    .toBuffer({ resolveWithObject: true });
  
  const width = info.width;
  const height = info.height;

  let minX = width, maxX = 0, minY = height, maxY = 0;

  for (let y = 0; y < 255; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const a = data[idx + 3];
      if (a > 30) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  console.log(`OPTIMUS 3D mark bounds: x=[${minX}, ${maxX}], y=[${minY}, ${maxY}]`);
  const cropW = maxX - minX + 1;
  const cropH = maxY - minY + 1;
  console.log(`Crop size: ${cropW} x ${cropH}`);

  await sharp('public/images/optimus_header_logo.png')
    .extract({ left: minX, top: minY, width: cropW, height: cropH })
    .toFile('public/images/optimus_3d_mark.png');
  
  console.log('Successfully saved public/images/optimus_3d_mark.png');
}

process().catch(console.error);
