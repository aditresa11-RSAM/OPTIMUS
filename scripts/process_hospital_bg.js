const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function processHospitalBackground() {
  const inputPath = 'C:/Users/User/.gemini/antigravity/brain/bc1bd40a-d89f-426d-b5a2-e8651167bada/hospital_background_3d_1793089394170.jpg';
  const outputPath = path.resolve(__dirname, '../public/uploads/hospital_background_3d.png');

  const metadata = await sharp(inputPath).metadata();
  console.log('Original dimensions:', metadata.width, 'x', metadata.height);

  // Resize to clean standard resolution for banner background (e.g. 1200 x 600 or keep 1376x768)
  const width = metadata.width;
  const height = metadata.height;

  // Read raw RGBA
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const fadeWidth = Math.round(width * 0.28); // 28% width fade on left side
  console.log(`Applying smooth alpha fade on left ${fadeWidth}px...`);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      if (x < fadeWidth) {
        // Smooth S-curve (cosine)
        const t = x / fadeWidth;
        const factor = 0.5 - 0.5 * Math.cos(Math.PI * t);
        data[idx + 3] = Math.round(data[idx + 3] * factor);
      }
    }
  }

  // Save as high-quality PNG
  await sharp(data, {
    raw: {
      width,
      height,
      channels: 4,
    },
  })
    .png({ quality: 90, compressionLevel: 8 })
    .toFile(outputPath);

  console.log('Successfully saved to:', outputPath);

  const outMeta = await sharp(outputPath).metadata();
  console.log('Output dimensions:', outMeta.width, 'x', outMeta.height, 'size:', fs.statSync(outputPath).size);
}

processHospitalBackground().catch(console.error);
