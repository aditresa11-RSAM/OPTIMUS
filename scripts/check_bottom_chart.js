const sharp = require('sharp');

async function checkBottomChart() {
  const file = 'public/uploads/inspect_overlap.png';
  const { data, info } = await sharp(file).raw().toBuffer({ resolveWithObject: true });

  // In inspect_overlap, y=260 to 450 (which is y=360 to 550 in original)
  // Let's find where the circular turquoise gauge / chart is
  let minChartX = info.width;
  for (let y = 260; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const idx = (y * info.width + x) * 3;
      const r = data[idx], g = data[idx+1], b = data[idx+2];
      // Turquoise / green circle: g > 150, b > 150, r < 100
      if (g > 150 && b > 150 && r < 120) {
        if (x < minChartX) minChartX = x;
      }
    }
  }
  console.log('Bottom circular chart leftmost pixel: local x =', minChartX, 'original x =', 1050 + minChartX);
}

checkBottomChart().catch(console.error);
