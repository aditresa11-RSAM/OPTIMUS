const sharp = require('sharp');
const fs = require('fs');

async function createPerfectHeaderArt() {
  const src = 'C:/Users/User/.gemini/antigravity/brain/bc1bd40a-d89f-426d-b5a2-e8651167bada/.user_uploaded/media_1793063763616_bc10998b.png';
  const meta = await sharp(src).metadata();

  // The card in the original image is 1024x261.
  // The illustration starts around x=420 and goes to x=1024.
  // In the original, the card border is at y=31 to y=258.
  // The boy's hair was clipped at y=0.
  // Let's take x from 410 to 1024 (width = 614).
  // Let's add 14px headroom at the top so the boy's hair has room to taper smoothly!
  
  const cropX = 410;
  const cropW = 1024 - cropX; // 614
  const cropH = 261;

  const { data, info } = await sharp(src)
    .extract({ left: cropX, top: 0, width: cropW, height: cropH })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const padTop = 14;
  const newW = cropW;
  const newH = cropH + padTop;
  const channels = info.channels;
  const outBuf = Buffer.alloc(newW * newH * channels, 0);

  // Copy original data shifted down by padTop
  for (let y = 0; y < cropH; y++) {
    const srcRow = y * cropW * channels;
    const dstRow = (y + padTop) * newW * channels;
    data.copy(outBuf, dstRow, srcRow, srcRow + cropW * channels);
  }

  // Taper the boy's hair at the top:
  // In local coords, hair is at x = 790 - cropX to 840 - cropX = 380 to 430.
  // Base hair color:
  const hr = 75, hg = 52, hb = 52; // dark hair tint

  // Function to draw smooth hair spikes in the headroom
  function addHairLock(tipX, tipY, baseLeft, baseRight) {
    for (let y = tipY; y < padTop; y++) {
      const t = (y - tipY) / (padTop - tipY);
      const l = Math.round(tipX - (tipX - baseLeft) * t);
      const r = Math.round(tipX + (baseRight - tipX) * t);
      for (let x = l; x <= r; x++) {
        const idx = (y * newW + x) * channels;
        const edgeDist = Math.min(x - l, r - x);
        const a = Math.min(255, Math.round(180 + t * 75 + edgeDist * 30));
        outBuf[idx] = hr;
        outBuf[idx + 1] = hg;
        outBuf[idx + 2] = hb;
        outBuf[idx + 3] = a;
      }
    }
  }

  addHairLock(398, 4, 393, 404);
  addHairLock(413, 2, 405, 420);
  addHairLock(424, 5, 418, 431);

  // Smooth left-edge transparency fade:
  // From x = 0 to x = 80 (approx x=410 to 490 in original image)
  // This ensures the illustration blends 100% seamlessly into the white card background!
  for (let y = 0; y < newH; y++) {
    for (let x = 0; x < 90; x++) {
      const idx = (y * newW + x) * channels;
      const factor = Math.min(1, Math.max(0, (x - 10) / 70));
      outBuf[idx + 3] = Math.round(outBuf[idx + 3] * factor);
    }
  }

  // Also remove any stray white border pixels at the very top edge (y < padTop) outside the hair
  for (let y = 0; y < padTop; y++) {
    for (let x = 0; x < newW; x++) {
      if (x < 370 || x > 440) {
        const idx = (y * newW + x) * channels;
        outBuf[idx + 3] = 0; // transparent
      }
    }
  }

  // Save the master header art
  const outPath = 'public/uploads/input_data_header_art.png';
  await sharp(outBuf, { raw: { width: newW, height: newH, channels } })
    .png()
    .toFile(outPath);

  // Also create a 2x upscaled version with Lanczos3
  const outPath2x = 'public/uploads/input_data_header_art_2x.png';
  await sharp(outPath)
    .resize(newW * 2, newH * 2, { kernel: sharp.kernel.lanczos3 })
    .sharpen({ sigma: 0.8, m1: 0.5, m2: 1.5 })
    .png({ compressionLevel: 8 })
    .toFile(outPath2x);

  console.log(`Created ${outPath} (${newW}x${newH}) and 2x version (${newW*2}x${newH*2})`);
}

createPerfectHeaderArt().catch(console.error);
