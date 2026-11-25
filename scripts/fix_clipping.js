const sharp = require('sharp');

async function fixClipping() {
  const markMeta = await sharp('public/images/optimus_3d_mark.png').metadata();
  console.log('3D Mark width:', markMeta.width, 'height:', markMeta.height);

  // Mark width is 941px.
  // We want the text "OPTIMALISASI SISTEM PELAPORAN MUTU RUMAH SAKIT"
  // to span approximately 920px - 940px wide, exactly aligning with the 3D mark!
  // Let totalW = 1200 so there is over 130px padding on each side!
  const totalW = 1200;
  const totalH = 300;
  const markX = Math.round((totalW - markMeta.width) / 2); // (1200 - 941) / 2 = 129px
  const markY = 8;

  // With 46 characters:
  // If font-size is 24px and letter-spacing is 4px:
  // Total text width will be roughly ~880px, perfectly fitting under the 941px mark!
  const svgSubtitle = `
    <svg width="${totalW}" height="${totalH}" xmlns="http://www.w3.org/2000/svg">
      <style>
        .sub-text {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          font-weight: 900;
          font-size: 24px;
          letter-spacing: 4px;
          text-anchor: middle;
        }
      </style>
      <text x="${totalW / 2}" y="262" class="sub-text" fill="#000000">OPTIMALISASI SISTEM PELAPORAN MUTU RUMAH SAKIT</text>
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

  // Verify bounding box of content in generated PNG
  const { data, info } = await sharp('public/images/optimus_header_logo.png')
    .raw()
    .toBuffer({ resolveWithObject: true });

  let minX = info.width, maxX = 0, minY = info.height, maxY = 0;
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const a = data[(y * info.width + x) * 4 + 3];
      if (a > 20) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  console.log(`Content bounding box in ${info.width}x${info.height}:`);
  console.log(`X range: [${minX}, ${maxX}] (padding left: ${minX}px, padding right: ${info.width - 1 - maxX}px)`);
  console.log(`Y range: [${minY}, ${maxY}] (padding top: ${minY}px, padding bottom: ${info.height - 1 - maxY}px)`);

  // Check subtitle bottom specifically (y > 230)
  let subMinX = info.width, subMaxX = 0, subMinY = info.height, subMaxY = 0;
  for (let y = 230; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const a = data[(y * info.width + x) * 4 + 3];
      if (a > 20) {
        if (x < subMinX) subMinX = x;
        if (x > subMaxX) subMaxX = x;
        if (y < subMinY) subMinY = y;
        if (y > subMaxY) subMaxY = y;
      }
    }
  }
  console.log(`Subtitle text bounding box: X=[${subMinX}, ${subMaxX}], Y=[${subMinY}, ${subMaxY}]`);
  console.log(`Subtitle width: ${subMaxX - subMinX + 1}px, padding to canvas edges: left ${subMinX}px, right ${info.width - 1 - subMaxX}px, bottom ${info.height - 1 - subMaxY}px`);
}

fixClipping().catch(console.error);
