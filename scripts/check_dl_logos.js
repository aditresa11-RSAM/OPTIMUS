const sharp = require('sharp');
const fs = require('fs');

async function check() {
  const f1 = 'C:\\Users\\User\\Downloads\\LOGO 1.png';
  const f2 = 'C:\\Users\\User\\Downloads\\LOGO_2-removebg-preview.png';
  if (fs.existsSync(f1)) {
    console.log('LOGO 1:', await sharp(f1).metadata());
  }
  if (fs.existsSync(f2)) {
    console.log('LOGO 2 removebg:', await sharp(f2).metadata());
  }
}
check().catch(console.error);
