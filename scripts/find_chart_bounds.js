const sharp = require('sharp');

async function findChartBounds() {
  const file = 'public/uploads/inspect_overlap.png';
  const { data, info } = await sharp(file).raw().toBuffer({ resolveWithObject: true });

  // Floating chart cards have white background (r > 250, g > 250, b > 250)
  // or green header/borders, surrounded by the cyan gradient background.
  // Let's sample columns at y = 250 (top chart) and y = 430 (bottom chart)
  for (let x = 150; x < 400; x++) {
    const idx = (150 * info.width + x) * 3;
    // let's print color
  }
  // Let's find leftmost pixel of the chart card
  // The chart card has a drop shadow or white card border.
  // In the crop (left=1050), let's find where the background changes or where the chart begins
  console.log('Sampling columns...');
  for (let x = 200; x <= 450; x += 25) {
    const idx = (150 * info.width + x) * 3;
    console.log(`x=${1050+x}: RGB=(${data[idx]}, ${data[idx+1]}, ${data[idx+2]})`);
  }
}

findChartBounds().catch(console.error);
