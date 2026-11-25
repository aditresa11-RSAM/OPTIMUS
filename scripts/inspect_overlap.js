const sharp = require('sharp');

async function inspectOverlap() {
  const file = 'C:/Users/User/Downloads/Modern Hospital Data Dashboard Banner.png';
  // Let's crop x=1050 to 1600, y=100 to 600
  await sharp(file)
    .extract({ left: 1050, top: 100, width: 550, height: 500 })
    .png()
    .toFile('public/uploads/inspect_overlap.png');
  console.log('Saved inspect_overlap.png');
}

inspectOverlap().catch(console.error);
