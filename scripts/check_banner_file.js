const sharp = require('sharp');

async function checkBanner() {
  const p = 'C:/Users/User/Downloads/Modern Hospital Data Dashboard Banner.png';
  const meta = await sharp(p).metadata();
  console.log('Size:', meta.width, meta.height);
}

checkBanner().catch(console.error);
