const fs = require('fs');
const sharp = require('sharp');

// Let's see if we can convert the first or 256x256 image from favicon (5).ico to a png, or see what files are in public/images
const files = fs.readdirSync('public/images');
console.log('public/images files:', files);

// Let's also check if public/favicon.ico exists and its size
if (fs.existsSync('public/favicon.ico')) {
  console.log('public/favicon.ico size:', fs.statSync('public/favicon.ico').size);
}
