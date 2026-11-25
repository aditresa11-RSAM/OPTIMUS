const sharp = require('sharp');

async function upscale() {
  const src = 'public/uploads/input_data_card_banner.png';
  const meta = await sharp(src).metadata();
  console.log('Original cleaned size:', meta.width, meta.height);

  // 2x upscale with lanczos3
  await sharp(src)
    .resize(meta.width * 2, meta.height * 2, {
      kernel: sharp.kernel.lanczos3
    })
    .sharpen({ sigma: 0.8, m1: 0.5, m2: 1.5 })
    .png({ compressionLevel: 8 })
    .toFile('public/uploads/input_data_card_banner_2x.png');

  console.log('Successfully created public/uploads/input_data_card_banner_2x.png (2048x522)');
}

upscale().catch(console.error);
