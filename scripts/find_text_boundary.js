const sharp = require('sharp');

async function inspectTextEnd() {
  const file = 'C:/Users/User/Downloads/Modern Hospital Data Dashboard Banner.png';
  const { data, info } = await sharp(file).raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height;
  
  let maxXText = 0;
  for (let y = 200; y < 550; y++) {
    for (let x = 700; x < 1400; x++) {
      const idx = (y * w + x) * 3;
      const r = data[idx], g = data[idx+1], b = data[idx+2];
      // Text pixels in the quote are dark gray/slate: r < 130, g < 130, b < 130
      if (r < 130 && g < 130 && b < 130) {
        if (x > maxXText) maxXText = x;
      }
    }
  }
  console.log('Max X of text pixels:', maxXText);

  // Also where does the green graphic / illustration start?
  // Female nurse in green hijab: where does her hijab or clipboard start on the left?
  // Let's find green pixels (g > 100, g > r * 1.2, g > b * 1.1) in x = 1100..1600
  let minXGreen = w;
  for (let y = 100; y < 600; y++) {
    for (let x = 1100; x < 1600; x++) {
      const idx = (y * w + x) * 3;
      const r = data[idx], g = data[idx+1], b = data[idx+2];
      if (g > 80 && g > r * 1.15 && g > b * 1.05) {
        if (x < minXGreen) minXGreen = x;
      }
    }
  }
  console.log('Min X of green nurse/chart graphic:', minXGreen);
}

inspectTextEnd().catch(console.error);
