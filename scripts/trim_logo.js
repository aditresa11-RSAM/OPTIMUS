const sharp = require('sharp');

async function trimAndSave() {
  const totalW = 1200;
  const totalH = 300;
  const markMeta = await sharp('public/images/optimus_3d_mark.png').metadata();
  const markX = Math.round((totalW - markMeta.width) / 2);
  const markY = 10;

  // Font-size 25px, letter-spacing 4.2px, perfectly proportioned
  const svgSubtitle = `
    <svg width="${totalW}" height="${totalH}" xmlns="http://www.w3.org/2000/svg">
      <style>
        .sub-text {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          font-weight: 900;
          font-size: 25px;
          letter-spacing: 4.2px;
          text-anchor: middle;
        }
      </style>
      <text x="${totalW / 2}" y="264" class="sub-text" fill="#000000">OPTIMALISASI SISTEM PELAPORAN MUTU RUMAH SAKIT</text>
    </svg>
  `;

  // Render full canvas first
  const buf = await sharp({
    create: {
      width: totalW,
      height: totalH,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
  .composite([
    { input: 'public/images/optimus_3d_mark.png', top: markY, left: markX },
    { input: Buffer.from(svgSubtitle), top: 0, left: 0 }
  ])
  .png()
  .toBuffer();

  // Now extract with a clean, comfortable 24px margin around all content
  // Content bounds were: X from 130 to 1070 (width 941), Y from 10 to 264 (height 255)
  // Let's crop: left = 105, top = 2, width = 990, height = 275
  await sharp(buf)
    .extract({ left: 105, top: 0, width: 990, height: 278 })
    .toFile('public/images/optimus_header_logo.png');

  console.log('Successfully saved trimmed & fully padded public/images/optimus_header_logo.png (990x278)');
}

trimAndSave().catch(console.error);
