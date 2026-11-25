const sharp = require('sharp');

sharp('scripts/extracted_favicon.png').metadata().then(m => {
  console.log('extracted_favicon meta:', m);
}).catch(console.error);

sharp('public/images/optimus_header_logo.png').metadata().then(m => {
  console.log('optimus_header_logo meta:', m);
}).catch(console.error);
