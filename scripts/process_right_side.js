const sharp = require('sharp');

async function processRightSide() {
  const src = 'C:/Users/User/.gemini/antigravity/brain/bc1bd40a-d89f-426d-b5a2-e8651167bada/.user_uploaded/media_1793063763616_bc10998b.png';
  const meta = await sharp(src).metadata();

  // The card interior is from y=31 to y=260 (height=229).
  // The characters extend up to y=0 at x=790..840.
  // If we take y from 0 to 261, but smooth/feather the boy's hair top:
  // Let's create an artwork that spans from x=420 to 1024.
  // On the left (from x=420 to 480), it fades smoothly to 100% transparent.
  // This allows it to sit on ANY card background (whether pure white or gradient) without any visible boundary!
  
  const extractW = 1024 - 420; // 604px
  const extractH = 261;
  
  const { data, info } = await sharp(src)
    .extract({ left: 420, top: 0, width: extractW, height: extractH })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const w = info.width;
  const h = info.height;
  const channels = info.channels;

  // Let's create an alpha mask:
  // 1. Horizontal fade on the left: from x=0 to x=60 (which corresponds to x=420 to 480 in original), alpha transitions from 0 to 1
  // 2. Remove exterior white background around the top-right corner if needed, or if contained inside the card:
  // If placed inside the card with absolute right-0 top-0 h-full:
  // The card container has rounded-3xl overflow-hidden, so the right, bottom, and top are naturally clipped by the card's rounded border!
  // And the left side fades smoothly to transparent into the card's white content area!

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * channels;
      // Horizontal fade on left edge
      if (x < 60) {
        const factor = x / 60; // 0 to 1
        data[idx + 3] = Math.round(data[idx + 3] * factor);
      }
    }
  }

  // Save 1: right_illustration_card.png (full height including characters)
  await sharp(data, { raw: { width: w, height: h, channels } })
    .png()
    .toFile('public/uploads/input_right_illustration.png');

  // Also create a 2x upscaled version for Retina displays
  await sharp('public/uploads/input_right_illustration.png')
    .resize(w * 2, h * 2, { kernel: sharp.kernel.lanczos3 })
    .sharpen({ sigma: 0.8, m1: 0.5, m2: 1.5 })
    .png({ compressionLevel: 8 })
    .toFile('public/uploads/input_right_illustration_2x.png');

  console.log('Saved input_right_illustration.png and 2x version successfully.');
}

processRightSide().catch(console.error);
