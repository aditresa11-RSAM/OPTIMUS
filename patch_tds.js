const fs = require('fs');
let code = fs.readFileSync('src/pages/risiko.tsx', 'utf8');

// Severity Table TDs

// Deskripsi column (Insignificant, Minor, Moderate, Major, Catastrophic)
code = code.replace(
  '<td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700">',
  '<td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700 text-center text-[10px]">'
);
code = code.replace(
  '<td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700">',
  '<td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700 text-center text-[10px]">'
);
code = code.replace(
  '<td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700">',
  '<td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700 text-center text-[10px]">'
);
code = code.replace(
  '<td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700">',
  '<td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700 text-center text-[10px]">'
);
code = code.replace(
  '<td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700">',
  '<td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700 text-center text-[10px]">'
);


// Other columns
// replace globally for Severity table's non-modified text-slate-700. Wait, this could be tricky since there are many.
// I can just replace `text-slate-700">` with `text-slate-700 text-[10px]">` for the rest of Severity.
// Let's use regex to replace all `text-slate-700">` that are in align-top (Severity table).
code = code.replace(/<td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700">/g, '<td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700 text-[10px]">');

// Probability Table TDs
// `align-middle border-l border-gray-200 font-bold text-slate-800 text-center`
code = code.replace(/<td className="px-4 py-4 align-middle border-l border-gray-200 font-bold text-slate-800 text-center">/g, '<td className="px-4 py-4 align-middle border-l border-gray-200 font-bold text-slate-800 text-center text-[11px]">');

// `align-middle border-l border-gray-200 text-slate-700`
code = code.replace(/<td className="px-4 py-4 align-middle border-l border-gray-200 text-slate-700">/g, '<td className="px-4 py-4 align-middle border-l border-gray-200 text-slate-700 text-[11px]">');

fs.writeFileSync('src/pages/risiko.tsx', code);
