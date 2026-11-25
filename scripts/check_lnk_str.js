const fs = require('fs');

const p = 'C:\\Users\\User\\OneDrive\\Desktop\\OPTIMUS.lnk';
const buf = fs.readFileSync(p);
console.log('Size of OPTIMUS.lnk:', buf.length);

// Look for Icon string in .lnk file
const s = buf.toString('latin1');
console.log('Contains optimus_app.ico?', s.includes('optimus_app.ico'));
console.log('Contains favicon?', s.includes('favicon'));
console.log('Contains Downloads?', s.includes('Downloads'));
