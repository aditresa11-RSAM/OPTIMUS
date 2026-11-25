const sharp = require('sharp');

async function fixHairTip() {
  const src = 'public/uploads/input_right_illustration.png';
  const { data, info } = await sharp(src).raw().toBuffer({ resolveWithObject: true });

  const w = info.width;
  const h = info.height;
  const channels = info.channels;

  // In this extracted image, the original x=420 corresponds to local x=0.
  // The boy's hair was at original x=790..840, so in local coords:
  // localX = 790 - 420 = 370 to 840 - 420 = 420.
  console.log(`Checking hair at localX = 370..420, y = 0..5`);

  // Let's create a new image with 12px of extra headroom at the top (h + 12)
  // so the hair has space to taper naturally to a point!
  const padTop = 12;
  const newH = h + padTop;
  const newData = Buffer.alloc(w * newH * channels, 0);

  // Copy original data shifted down by padTop
  for (let y = 0; y < h; y++) {
    const srcStart = y * w * channels;
    const dstStart = (y + padTop) * w * channels;
    data.copy(newData, dstStart, srcStart, srcStart + w * channels);
  }

  // Background in the headroom:
  // For x outside the hair/hijab, the background is transparent or near-white.
  // For the boy's hair at x=370..425:
  // Let's taper the hair locks from y = padTop down to y = 0!
  // At y=padTop (which was the old y=0), we saw:
  // x=390..415 had hair pixels.
  // We can draw tapered locks of hair between y = 2 and y = padTop - 1, using the same dark brown/black hair color [35, 25, 20, 255]!
  
  // Let's sample the exact hair color at old y=1:
  const sampleIdx = (padTop + 1) * w * channels + 400 * channels;
  const hr = newData[sampleIdx], hg = newData[sampleIdx+1], hb = newData[sampleIdx+2];
  console.log(`Hair base color: rgb(${hr}, ${hg}, ${hb})`);

  // Define spiky locks tapering upward:
  // Spike 1: peak at x=388, y=4
  // Spike 2: peak at x=402, y=2
  // Spike 3: peak at x=414, y=3
  function drawTaperedSpike(peakX, peakY, baseLeftX, baseRightX) {
    for (let y = peakY; y < padTop; y++) {
      const progress = (y - peakY) / (padTop - peakY); // 0 at peak, 1 at base
      const left = Math.round(peakX - (peakX - baseLeftX) * progress);
      const right = Math.round(peakX + (baseRightX - peakX) * progress);
      for (let x = left; x <= right; x++) {
        const idx = (y * w + x) * channels;
        // Blend softly at peak edges
        const edgeDist = Math.min(x - left, right - x);
        const alpha = Math.min(255, Math.round(180 + progress * 75 + edgeDist * 30));
        newData[idx] = hr;
        newData[idx + 1] = hg;
        newData[idx + 2] = hb;
        newData[idx + 3] = alpha;
      }
    }
  }

  drawTaperedSpike(388, 5, 383, 394);
  drawTaperedSpike(403, 2, 395, 409);
  drawTaperedSpike(414, 4, 410, 422);

  // Save the fixed image
  await sharp(newData, { raw: { width: w, height: newH, channels } })
    .png()
    .toFile('public/uploads/input_right_illustration_fixed.png');

  // Also create 2x version
  await sharp('public/uploads/input_right_illustration_fixed.png')
    .resize(w * 2, newH * 2, { kernel: sharp.kernel.lanczos3 })
    .sharpen({ sigma: 0.8, m1: 0.5, m2: 1.5 })
    .png({ compressionLevel: 8 })
    .toFile('public/uploads/input_right_illustration_fixed_2x.png');

  console.log(`Saved fixed hair illustration with +${padTop}px headroom! Height is now ${newH}px.`);
}

fixHairTip().catch(console.error);
