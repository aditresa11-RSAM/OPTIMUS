const fs = require('fs');
let code = fs.readFileSync('src/pages/risiko.tsx', 'utf8');

// Revert all to base class
code = code.replace(/<td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700 text-center text-\[10px\]">/g, '<td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700">');
code = code.replace(/<td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700 text-\[10px\]">/g, '<td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700">');

// Now we want Deskripsi (column 2) to be text-center text-[10px].
// Deskripsi cells start with:
// <td className="...">
//   <span className="font-bold block">Insignificant</span>
code = code.replace(/<td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700">\s*(?:<span className="font-bold block">|<span className="font-semibold block)/g, function(match) {
  return match.replace('text-slate-700">', 'text-slate-700 text-center text-[10px]">');
});

// For all other text-slate-700 in align-top, we just want text-[10px]
code = code.replace(/<td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700">/g, '<td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700 text-[10px]">');

fs.writeFileSync('src/pages/risiko.tsx', code);
