const sharp = require('sharp');
sharp('public/images/optimus_3d_mark.png').metadata().then(meta => {
  console.log('optimus_3d_mark metadata:', meta.width, meta.height, meta.format);
}).catch(err => {
  console.error(err);
});
