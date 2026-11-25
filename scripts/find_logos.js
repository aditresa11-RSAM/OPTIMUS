const fs = require('fs');
const path = require('path');

const dl = 'C:\\Users\\User\\Downloads';
fs.readdirSync(dl).filter(f => f.toLowerCase().includes('optimus') || f.toLowerCase().includes('ico') || f.toLowerCase().includes('logo')).forEach(f => {
  console.log('DL:', f, fs.statSync(path.join(dl, f)).size);
});
