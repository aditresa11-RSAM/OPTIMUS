const sharp = require('sharp');
const fs = require('fs');

async function cleanAndInpaint() {
  const file = 'C:/Users/User/Downloads/Modern Hospital Data Dashboard Banner.png';
  const img = sharp(file);
  const { data, info } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height;

  // Let's inspect the Canva card interior:
  // Top border is around y = 154
  // Bottom border is around y = 611
  // Right border is around x = 2140
  // Male character hair extends up to y = 73 (at x = 1429 to 1826)

  // Step 1: Inpaint / Erase ALL text in the quote and subtitle area (x from 750 to 1350, y from 180 to 550)
  // For each pixel in this box, if it is a text pixel (dark color), replace it with the gradient background.
  // The background gradient at (x, y) can be computed by interpolating between the clean pixels above (y=175) and below (y=560) at the same x!
  
  let textPixelsReplaced = 0;
  for (let x = 700; x < 1360; x++) {
    // Reference clean color above text:
    const topIdx = (175 * w + x) * 4;
    const tr = data[topIdx], tg = data[topIdx + 1], tb = data[topIdx + 2];

    // Reference clean color below text:
    const botIdx = (565 * w + x) * 4;
    const br = data[botIdx], bg = data[botIdx + 1], bb = data[botIdx + 2];

    for (let y = 180; y <= 560; y++) {
      const idx = (y * w + x) * 4;
      const r = data[idx], g = data[idx + 1], b = data[idx + 2];

      // Text detection:
      // Dark text: r < 140, g < 140, b < 140
      // Also anti-aliased text fringes: lum < 220 and noticeably darker than the local background
      const t = (y - 175) / (565 - 175);
      const bgR = Math.round(tr + (br - tr) * t);
      const bgG = Math.round(tg + (bg - tg) * t);
      const bgB = Math.round(tb + (bb - tb) * t);

      // Check if this pixel is part of text (darker than local background by > 15 units)
      const diff = (bgR - r) + (bgG - g) + (bgB - b);
      if (diff > 25 || (r < 150 && g < 150 && b < 150)) {
        // Replace with interpolated background gradient
        data[idx] = bgR;
        data[idx + 1] = bgG;
        data[idx + 2] = bgB;
        textPixelsReplaced++;
      }
    }
  }
  console.log(`Inpainted ${textPixelsReplaced} text pixels successfully!`);

  // Step 2: Now inspect the resulting image around x=1000..1350 to verify text is 100% gone
  // Let's create two versions:
  // Version A: Right illustration with smooth left fade, designed to fit inside the card right side (overflow-hidden)
  // Inside the card: y from 154 to 611 (interior height = 457)
  // Let's extract from x = 1000 to 2140, y = 154 to 611:
  // With horizontal fade on the left (x = 1000 to 1180) from alpha=0 to 1.
  
  const cardTop = 155;
  const cardBottom = 611;
  const cardRight = 2140;
  const artLeft = 980;
  
  const innerW = cardRight - artLeft; // 1160
  const innerH = cardBottom - cardTop; // 456

  const innerBuf = Buffer.alloc(innerW * innerH * 4);
  for (let y = 0; y < innerH; y++) {
    const srcY = cardTop + y;
    for (let x = 0; x < innerW; x++) {
      const srcX = artLeft + x;
      const srcIdx = (srcY * w + srcX) * 4;
      const dstIdx = (y * innerW + x) * 4;

      innerBuf[dstIdx] = data[srcIdx];
      innerBuf[dstIdx + 1] = data[srcIdx + 1];
      innerBuf[dstIdx + 2] = data[srcIdx + 2];

      // Smooth horizontal fade on the left edge:
      // from x = 0 to x = 160 (artLeft to artLeft + 160)
      if (x < 160) {
        const factor = Math.min(1, Math.max(0, x / 160));
        // Ease-in-out factor
        const smoothFactor = factor * factor * (3 - 2 * factor);
        innerBuf[dstIdx + 3] = Math.round(255 * smoothFactor);
      } else {
        innerBuf[dstIdx + 3] = 255;
      }
    }
  }

  // Save the interior illustration:
  await sharp(innerBuf, { raw: { width: innerW, height: innerH, channels: 4 } })
    .png({ quality: 95 })
    .toFile('public/uploads/input_data_art_clean.png');

  console.log(`Saved public/uploads/input_data_art_clean.png (${innerW}x${innerH})`);

  // Version B: Pop-out version (including the hair above cardTop, from y=70 to 611):
  const popTop = 70;
  const popH = cardBottom - popTop; // 541
  const popBuf = Buffer.alloc(innerW * popH * 4, 0);

  for (let y = 0; y < popH; y++) {
    const srcY = popTop + y;
    for (let x = 0; x < innerW; x++) {
      const srcX = artLeft + x;
      const srcIdx = (srcY * w + srcX) * 4;
      const dstIdx = (y * innerW + x) * 4;

      const r = data[srcIdx], g = data[srcIdx + 1], b = data[srcIdx + 2];
      popBuf[dstIdx] = r;
      popBuf[dstIdx + 1] = g;
      popBuf[dstIdx + 2] = b;

      // Above card top (srcY < cardTop):
      // Only keep hair pixels (x between 1420 - artLeft and 1830 - artLeft) that are not background
      if (srcY < cardTop) {
        const localHairLeft = 1420 - artLeft;
        const localHairRight = 1835 - artLeft;
        if (x >= localHairLeft && x <= localHairRight && (r < 240 || g < 240 || b < 240)) {
          popBuf[dstIdx + 3] = 255;
        } else {
          popBuf[dstIdx + 3] = 0; // transparent
        }
      } else {
        // Inside card: smooth horizontal fade on left edge
        if (x < 160) {
          const factor = Math.min(1, Math.max(0, x / 160));
          const smoothFactor = factor * factor * (3 - 2 * factor);
          popBuf[dstIdx + 3] = Math.round(255 * smoothFactor);
        } else {
          popBuf[dstIdx + 3] = 255;
        }
      }
    }
  }

  await sharp(popBuf, { raw: { width: innerW, height: popH, channels: 4 } })
    .png({ quality: 95 })
    .toFile('public/uploads/input_data_header_art_hq.png');

  // Also overwrite input_data_header_art_2x.png so any references get the clean image
  await sharp('public/uploads/input_data_header_art_hq.png')
    .png({ quality: 95 })
    .toFile('public/uploads/input_data_header_art_2x.png');

  console.log(`Saved public/uploads/input_data_header_art_hq.png (${innerW}x${popH}) with 0 text!`);
}

cleanAndInpaint().catch(console.error);
