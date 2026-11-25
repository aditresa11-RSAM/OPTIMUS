const fs = require('fs');
const path = require('path');
const dl = 'C:\\Users\\User\\Downloads';
const files = fs.readdirSync(dl);
const details = files.map(f => {
  try {
    const s = fs.statSync(path.join(dl, f));
    return { name: f, time: s.mtimeMs, size: s.size };
  } catch (e) {
    return null;
  }
}).filter(Boolean).sort((a, b) => b.time - a.time);

console.log('Top 20 most recent files in Downloads:');
details.slice(0, 20).forEach(d => {
  console.log(new Date(d.time).toLocaleString(), d.size, d.name);
});
