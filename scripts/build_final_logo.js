const sharp = require('sharp');

async function buildFinalLogo() {
  const markMeta = await sharp('public/images/optimus_3d_mark.png').metadata();
  const totalW = 1000;
  const totalH = 270;
  const markX = Math.round((totalW - markMeta.width) / 2);
  const markY = 4;

  const svgSubtitle = `
    <svg width="${totalW}" height="${totalH}" xmlns="http://www.w3.org/2000/svg">
      <style>
        .sub-text {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          font-weight: 900;
          font-size: 27px;
          letter-spacing: 5.4px;
          text-anchor: middle;
        }
      </style>
      <!-- Pure crisp solid black text, zero shadow -->
      <text x="${totalW / 2}" y="252" class="sub-text" fill="#000000">OPTIMALISASI SISTEM PELAPORAN MUTU RUMAH SAKIT</text>
    </svg>
  `;

  await sharp({
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
  .toFile('public/images/optimus_header_logo.png');

  console.log('Successfully updated public/images/optimus_header_logo.png with black text!');
}

buildFinalLogo().catch(console.error);
