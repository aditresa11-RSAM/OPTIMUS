const sharp = require('sharp');

async function inspectSubtitle() {
  const { data, info } = await sharp('public/images/optimus_header_logo.png')
    .raw()
    .toBuffer({ resolveWithObject: true });
  
  const width = info.width;
  
  // Check y from 260 to 310
  for (let y = 265; y <= 305; y += 5) {
    let counts = { white: 0, gray: 0, darkShadow: 0, transparent: 0 };
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx], g = data[idx+1], b = data[idx+2], a = data[idx+3];
      if (a < 20) counts.transparent++;
      else if (r > 210 && g > 210 && b > 210) counts.white++;
      else if (r < 70 && g < 70 && b < 70) counts.darkShadow++;
      else counts.gray++;
    }
    console.log(`y=${y}: transparent=${counts.transparent}, white=${counts.white}, gray=${counts.gray}, darkShadow=${counts.darkShadow}`);
  }
}

inspectSubtitle().catch(console.error);
