const fs = require('fs');
const sharp = require('sharp');

async function test() {
  const f = 'C:\\Users\\User\\Downloads\\LOGO_2-removebg-preview.png';
  const meta = await sharp(f).metadata();
  console.log('meta:', meta);
}
test().catch(console.error);
