const sharp = require('sharp');
const fs = require('fs');

async function generateProfilUnified() {
  const file = 'C:\\Users\\User\\Downloads\\Profil Indikator Mutu Rumah Sakit.png';
  const img = sharp(file);
  const { data, info } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height;

  // 1. Inpaint / erase any text pixels in x = 700 to 920, y = 240 to 650
  for (let x = 700; x <= 920; x++) {
    // Sample background above and below the text zone
    const topIdx = (265 * w + x) * 4;
    const tr = data[topIdx], tg = data[topIdx + 1], tb = data[topIdx + 2];

    const botIdx = (645 * w + x) * 4;
    const br = data[botIdx], bg = data[botIdx + 1], bb = data[botIdx + 2];

    for (let y = 270; y <= 640; y++) {
      const idx = (y * w + x) * 4;
      const r = data[idx], g = data[idx + 1], b = data[idx + 2];

      const t = (y - 270) / (640 - 270);
      const bgR = Math.round(tr + (br - tr) * t);
      const bgG = Math.round(tg + (bg - tg) * t);
      const bgB = Math.round(tb + (bb - tb) * t);

      // Check if text pixel (dark or antialiased fringe)
      const diff = (bgR - r) + (bgG - g) + (bgB - b);
      if (diff > 15 || (r < 180 && g < 180 && b < 180)) {
        data[idx] = bgR;
        data[idx + 1] = bgG;
        data[idx + 2] = bgB;
      }
    }
  }

  // 2. Extend the mint sky upward in the region y = 205..254:
  // For any pixel where r > 245 && g > 245 && b > 245 (i.e. canvas white outside hair):
  // Set it to match the card top color at y = 256 for that x
  for (let x = 700; x <= 1658; x++) {
    const cardTopIdx = (257 * w + x) * 4;
    const cr = data[cardTopIdx], cg = data[cardTopIdx + 1], cb = data[cardTopIdx + 2];
    for (let y = 205; y < 255; y++) {
      const idx = (y * w + x) * 4;
      const r = data[idx], g = data[idx + 1], b = data[idx + 2];
      // Only replace if white/canvas background, do not touch doctor hair or hair shadow!
      if (r >= 246 && g >= 248 && b >= 248) {
        data[idx] = cr;
        data[idx + 1] = cg;
        data[idx + 2] = cb;
      }
    }
  }

  // 3. Crop coordinates:
  // Let's crop from x = 750 to 1658 (width = 908)
  // y = 205 to 656 (height = 451)
  const cropX = 750;
  const cropY = 205;
  const cropW = 1658 - cropX; // 908
  const cropH = 656 - cropY;  // 451

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

      // Left alpha fade:
      // Fade over the first 180px smoothly from 0 to 255
      if (x < 180) {
        const factor = Math.min(1, Math.max(0, x / 180));
        const smooth = factor * factor * (3 - 2 * factor);
        outBuf[dstIdx + 3] = Math.round(255 * smooth);
      } else {
        outBuf[dstIdx + 3] = 255;
      }
    }
  }

  const outPath = 'public/uploads/profil_indikator_header_unified.png';
  await sharp(outBuf, { raw: { width: cropW, height: cropH, channels: 4 } })
    .png({ quality: 95 })
    .toFile(outPath);

  console.log(`Successfully created ${outPath} (${cropW}x${cropH})!`);
}

generateProfilUnified().catch(console.error);
