const sharp = require('sharp');

async function generateVariants() {
  const markMeta = await sharp('public/images/optimus_3d_mark.png').metadata();
  const totalW = 960;
  const totalH = 265;
  const markX = Math.round((totalW - markMeta.width) / 2);
  const markY = 4;

  // Variant A: Crisp white subtitle with clean sharp dark outline (no blur/drop shadow)
  const svgWhite = `
    <svg width="${totalW}" height="${totalH}" xmlns="http://www.w3.org/2000/svg">
      <style>
        .sub-text {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          font-weight: 900;
          font-size: 27px;
          letter-spacing: 5px;
          text-anchor: middle;
        }
      </style>
      <text x="${totalW / 2}" y="248" class="sub-text" fill="#FFFFFF" stroke="#334155" stroke-width="2" paint-order="stroke fill">OPTIMALISASI SISTEM PELAPORAN MUTU RUMAH SAKIT</text>
    </svg>
  `;

  // Variant B: Crisp dark slate (#334155) subtitle, zero shadow
  const svgSlate = `
    <svg width="${totalW}" height="${totalH}" xmlns="http://www.w3.org/2000/svg">
      <style>
        .sub-text {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          font-weight: 800;
          font-size: 26px;
          letter-spacing: 5.5px;
          text-anchor: middle;
        }
      </style>
      <text x="${totalW / 2}" y="248" class="sub-text" fill="#334155">OPTIMALISASI SISTEM PELAPORAN MUTU RUMAH SAKIT</text>
    </svg>
  `;

  await sharp({
    create: { width: totalW, height: totalH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } }
  })
  .composite([
    { input: 'public/images/optimus_3d_mark.png', top: markY, left: markX },
    { input: Buffer.from(svgWhite), top: 0, left: 0 }
  ])
  .png()
  .toFile('public/images/optimus_header_logo_white.png');

  await sharp({
    create: { width: totalW, height: totalH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } }
  })
  .composite([
    { input: 'public/images/optimus_3d_mark.png', top: markY, left: markX },
    { input: Buffer.from(svgSlate), top: 0, left: 0 }
  ])
  .png()
  .toFile('public/images/optimus_header_logo_slate.png');

  console.log('Generated both variants successfully!');
}

generateVariants().catch(console.error);
