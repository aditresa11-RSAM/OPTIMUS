const fs = require('fs');
let code = fs.readFileSync('src/pages/risiko.tsx', 'utf8');
code = code.replace(
  'const borderColorClass = bgColorClass.replace(\'bg-\', \'border-\');',
  'const borderColorClass = bgColorClass.replace(\'bg-\', \'border-\').replace(\'slate\', \'gray\');' // just in case some colors don't map perfectly, but bg-blue-500 maps to border-blue-500
);
fs.writeFileSync('src/pages/risiko.tsx', code);
