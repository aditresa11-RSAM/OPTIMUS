const sharp = require('sharp');
const fs = require('fs');

async function createPerfectUnifiedArt() {
  const file = 'C:/Users/User/Downloads/Modern Hospital Data Dashboard Banner.png';
  const img = sharp(file);
  const { data, info } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height;

  // 1. Inpaint / erase ALL text in the area x = 700 to 1380, y = 175 to 565
  for (let x = 700; x < 1380; x++) {
    const topIdx = (175 * w + x) * 4;
    const tr = data[topIdx], tg = data[topIdx + 1], tb = data[topIdx + 2];

    const botIdx = (565 * w + x) * 4;
    const br = data[botIdx], bg = data[botIdx + 1], bb = data[botIdx + 2];

    for (let y = 175; y <= 565; y++) {
      const idx = (y * w + x) * 4;
      const r = data[idx], g = data[idx + 1], b = data[idx + 2];

      const t = (y - 175) / (565 - 175);
      const bgR = Math.round(tr + (br - tr) * t);
      const bgG = Math.round(tg + (bg - tg) * t);
      const bgB = Math.round(tb + (bb - tb) * t);

      // Check if text pixel or anti-aliased text fringe
      const diff = (bgR - r) + (bgG - g) + (bgB - b);
      if (diff > 20 || (r < 150 && g < 150 && b < 150)) {
        data[idx] = bgR;
        data[idx + 1] = bgG;
        data[idx + 2] = bgB;
      }
    }
  }

  // 2. Inpaint Canva's inner top border line at y = 158..163 from x = 950 to 1420 (before male character hair)
  // and from x = 1830 to 2140 (after male character hair)
  function inpaintHLine(yStart, yEnd, xStart, xEnd) {
    for (let x = xStart; x <= xEnd; x++) {
      const refIdx1 = ((yStart - 3) * w + x) * 4;
      const refIdx2 = ((yEnd + 3) * w + x) * 4;
      for (let y = yStart; y <= yEnd; y++) {
        const idx = (y * w + x) * 4;
        const t = (y - yStart) / (yEnd - yStart + 1);
        data[idx] = Math.round(data[refIdx1] + (data[refIdx2] - data[refIdx1]) * t);
        data[idx + 1] = Math.round(data[refIdx1 + 1] + (data[refIdx2 + 1] - data[refIdx1 + 1]) * t);
        data[idx + 2] = Math.round(data[refIdx1 + 2] + (data[refIdx2 + 2] - data[refIdx1 + 2]) * t);
      }
    }
  }

  inpaintHLine(157, 164, 950, 1420);
  inpaintHLine(157, 164, 1835, 2135);

  // 3. For the region above y = 158 (around male character hair, from y = 70 to 157):
  // Let's extend the mint background upward so the male character hair has natural mint sky/background
  // instead of a harsh white box!
  // Between x = 1420 and 1835, y = 70 to 157:
  // If pixel is near-white background (r > 240, g > 240, b > 240):
  // Fill with the mint sky color from y = 165 at the same x!
  for (let x = 1400; x <= 1850; x++) {
    const skyIdx = (168 * w + x) * 4;
    const sr = data[skyIdx], sg = data[skyIdx + 1], sb = data[skyIdx + 2];
    for (let y = 70; y < 158; y++) {
      const idx = (y * w + x) * 4;
      const r = data[idx], g = data[idx + 1], b = data[idx + 2];
      if (r >= 238 && g >= 242 && b >= 242) {
        data[idx] = sr;
        data[idx + 1] = sg;
        data[idx + 2] = sb;
      }
    }
  }

  // 4. Now let's crop the illustration to fit the card:
  // The card height in our design will hold the illustration from y = 72 to 611 (height = 540)
  // Let's take from x = 1000 to 2138 (width = 1138)
  const cropX = 1000;
  const cropY = 72;
  const cropW = 2138 - cropX; // 1138
  const cropH = 611 - cropY;  // 539

  const outBuf = Buffer.alloc(cropW * cropH * 4);

  for (let y = 0; y < cropH; y++) {
    const srcY = cropY + y;
    for (let x = 0; x < cropW; x++) {
      const srcX = cropX + x;
      const srcIdx = (srcY * w + srcX) * 4;
      const dstIdx = (y * cropW + x) * 4;

      outBuf[dstIdx] = data[srcIdx];
      outBuf[dstIdx + 1] = data[srcIdx + 1];
      outBuf[dstIdx + 2] = data[srcIdx + 2];

      // Smooth horizontal fade on the left edge (from local x = 0 to 180):
      // Fades seamlessly from 100% transparent to 100% opaque!
      if (x < 180) {
        const factor = Math.min(1, Math.max(0, x / 180));
        const smooth = factor * factor * (3 - 2 * factor);
        outBuf[dstIdx + 3] = Math.round(255 * smooth);
      } else {
        outBuf[dstIdx + 3] = 255;
      }
    }
  }

  // Save the master unified header art
  const outPath = 'public/uploads/input_data_header_unified.png';
  await sharp(outBuf, { raw: { width: cropW, height: cropH, channels: 4 } })
    .png({ quality: 95 })
    .toFile(outPath);

  // Also overwrite input_data_header_art_hq.png and input_data_header_art_2x.png
  await sharp(outPath).png({ quality: 95 }).toFile('public/uploads/input_data_header_art_hq.png');
  await sharp(outPath).png({ quality: 95 }).toFile('public/uploads/input_data_header_art_2x.png');

  console.log(`Successfully generated ${outPath} (${cropW}x${cropH}) with zero text and zero inner border!`);
}

createPerfectUnifiedArt().catch(console.error);
