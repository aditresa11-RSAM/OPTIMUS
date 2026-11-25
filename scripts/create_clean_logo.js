const sharp = require('sharp');

async function createCleanLogo() {
  // 1. Take the cropped 3D mark (941 x 214)
  const markMeta = await sharp('public/images/optimus_3d_mark.png').metadata();
  console.log('Mark meta:', markMeta.width, markMeta.height);

  // We want a canvas where mark is centered on top, and subtitle is rendered cleanly below it
  // Total width: 960, Total height: 260
  // Mark is placed at x = (960 - 941)/2 = 9.5 ~ 10, y = 10
  // Subtitle text is rendered at y = 244
  
  const totalW = 960;
  const totalH = 265;
  const markX = Math.round((totalW - markMeta.width) / 2);
  const markY = 6;

  // Let's create an SVG with clean, crisp, sharp typography for the subtitle
  // No fuzzy blurry drop-shadow!
  const svgSubtitle = `
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
      <!-- Clean crisp white text with subtle 1px dark edge for contrast on off-white -->
      <text x="${totalW / 2}" y="248" class="sub-text" fill="#FFFFFF" stroke="#334155" stroke-width="1.8" paint-order="stroke fill">OPTIMALISASI SISTEM PELAPORAN MUTU RUMAH SAKIT</text>
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
  .toFile('public/images/optimus_header_logo_clean.png');

  console.log('Successfully created public/images/optimus_header_logo_clean.png');
}

createCleanLogo().catch(console.error);
