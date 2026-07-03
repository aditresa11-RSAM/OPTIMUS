const fs = require('fs');
let code = fs.readFileSync('src/pages/risiko.tsx', 'utf8');

// Severity Table Header
code = code.replace(
  '<th className="px-4 py-3 font-bold border-b border-[#0e906f]">DESKRIPSI</th>',
  '<th className="px-4 py-3 font-bold border-b border-[#0e906f] text-center">DESKRIPSI</th>'
);
code = code.replace(
  '<th className="px-4 py-3 font-bold border-b border-[#0e906f] text-[12px] leading-[19.5px]">KESELAMATAN & KESEHATAN PASIEN</th>',
  '<th className="px-4 py-3 font-bold border-b border-[#0e906f] text-[12px] leading-[19.5px] text-center">KESELAMATAN & KESEHATAN PASIEN</th>'
);
code = code.replace(
  '<th className="px-4 py-3 font-bold border-b border-[#0e906f]">PENUNDAAN PELAYANAN</th>',
  '<th className="px-4 py-3 font-bold border-b border-[#0e906f] text-center">PENUNDAAN PELAYANAN</th>'
);
code = code.replace(
  '<th className="px-4 py-3 font-bold border-b border-[#0e906f]">TUNTUTAN GANTI RUGI</th>',
  '<th className="px-4 py-3 font-bold border-b border-[#0e906f] text-center">TUNTUTAN GANTI RUGI</th>'
);
code = code.replace(
  '<th className="px-4 py-3 font-bold border-b border-[#0e906f]">DAMPAK KEUANGAN</th>',
  '<th className="px-4 py-3 font-bold border-b border-[#0e906f] text-center">DAMPAK KEUANGAN</th>'
);
code = code.replace(
  '<th className="px-4 py-3 font-bold border-b border-[#0e906f]">CONTOH DESKRIPSI</th>',
  '<th className="px-4 py-3 font-bold border-b border-[#0e906f] text-center">CONTOH DESKRIPSI</th>'
);


// Probability Table Header
code = code.replace(
  '<th className="px-4 py-3 font-bold border-b border-[#0e906f]">FREKUENSI</th>',
  '<th className="px-4 py-3 font-bold border-b border-[#0e906f] text-center">FREKUENSI</th>'
);
code = code.replace(
  '<th className="px-4 py-3 font-bold border-b border-[#0e906f]">KEJADIAN AKTUAL</th>',
  '<th className="px-4 py-3 font-bold border-b border-[#0e906f] text-center">KEJADIAN AKTUAL</th>'
);
code = code.replace(
  '<th className="px-4 py-3 font-bold border-b border-[#0e906f]">KRITERIA PERISTIWA</th>',
  '<th className="px-4 py-3 font-bold border-b border-[#0e906f] text-center">KRITERIA PERISTIWA</th>'
);

fs.writeFileSync('src/pages/risiko.tsx', code);
