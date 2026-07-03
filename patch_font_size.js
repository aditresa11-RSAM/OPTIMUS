const fs = require('fs');
let code = fs.readFileSync('src/pages/risiko.tsx', 'utf8');

// For Severity Table
// th: KESELAMATAN & KESEHATAN PASIEN
code = code.replace(
  '<th className="px-4 py-3 font-bold border-b border-[#0e906f]">KESELAMATAN & KESEHATAN PASIEN</th>',
  '<th className="px-4 py-3 font-bold border-b border-[#0e906f] text-[12px] leading-[19.5px]">KESELAMATAN & KESEHATAN PASIEN</th>'
);

// td: Tidak ada cedera
code = code.replace(
  '<td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700">Tidak ada cedera</td>',
  '<td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700 text-[10px]">Tidak ada cedera</td>'
);

// td: Cedera ringan (list)
code = code.replace(
  '<td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700">\n                            <ul className="list-disc pl-4 space-y-1">\n                              <li>Cedera ringan</li>\n                              <li>Dapat diatasi dengan pertolongan pertama</li>\n                            </ul>\n                          </td>',
  '<td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700 text-[10px]">\n                            <ul className="list-disc pl-4 space-y-1">\n                              <li>Cedera ringan</li>\n                              <li>Dapat diatasi dengan pertolongan pertama</li>\n                            </ul>\n                          </td>'
);

// td: Cedera sedang (list)
code = code.replace(
  '<td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700">\n                            <span className="font-semibold block mb-1">Cedera sedang</span>\n                            <ul className="list-disc pl-4 space-y-1">\n                              <li>Berkurangnya fungsi motorik, sensorik, psikologis atau intelektual secara reversibel</li>\n                              <li>Setiap kasus yang memperpanjang perawatan</li>\n                            </ul>\n                          </td>',
  '<td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700 text-[10px]">\n                            <span className="font-semibold block mb-1">Cedera sedang</span>\n                            <ul className="list-disc pl-4 space-y-1">\n                              <li>Berkurangnya fungsi motorik, sensorik, psikologis atau intelektual secara reversibel</li>\n                              <li>Setiap kasus yang memperpanjang perawatan</li>\n                            </ul>\n                          </td>'
);

// td: Cedera berat (list)
code = code.replace(
  '<td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700">\n                            <span className="font-semibold block mb-1">Cedera berat</span>\n                            <ul className="list-disc pl-4 space-y-1">\n                              <li>Kehilangan fungsi utama permanen (motorik, sensorik, psikologis, intelektual) secara irreversibel</li>\n                              <li>Tidak berhubungan dengan penyakit yang mendasarinya</li>\n                            </ul>\n                          </td>',
  '<td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700 text-[10px]">\n                            <span className="font-semibold block mb-1">Cedera berat</span>\n                            <ul className="list-disc pl-4 space-y-1">\n                              <li>Kehilangan fungsi utama permanen (motorik, sensorik, psikologis, intelektual) secara irreversibel</li>\n                              <li>Tidak berhubungan dengan penyakit yang mendasarinya</li>\n                            </ul>\n                          </td>'
);

// td: Kematian yang tidak berhubungan dengan perjalanan penyakit yang mendasarinya
code = code.replace(
  '<td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700">Kematian yang tidak berhubungan dengan perjalanan penyakit yang mendasarinya</td>',
  '<td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700 text-[10px]">Kematian yang tidak berhubungan dengan perjalanan penyakit yang mendasarinya</td>'
);

// For Probability Table (Table 2)
// td 3: KEJADIAN AKTUAL

code = code.replace(
  '<td className="px-4 py-4 align-middle border-l border-gray-200 text-slate-700">Dapat terjadi dalam lebih dari 5 tahun</td>',
  '<td className="px-4 py-4 align-middle border-l border-gray-200 text-slate-700 text-[10px]">Dapat terjadi dalam lebih dari 5 tahun</td>'
);

code = code.replace(
  '<td className="px-4 py-4 align-middle border-l border-gray-200 text-slate-700">Dapat terjadi dalam 2 - 5 tahun</td>',
  '<td className="px-4 py-4 align-middle border-l border-gray-200 text-slate-700 text-[10px]">Dapat terjadi dalam 2 - 5 tahun</td>'
);

code = code.replace(
  '<td className="px-4 py-4 align-middle border-l border-gray-200 text-slate-700">Dapat terjadi tiap 1 - 2 tahun</td>',
  '<td className="px-4 py-4 align-middle border-l border-gray-200 text-slate-700 text-[10px]">Dapat terjadi tiap 1 - 2 tahun</td>'
);

code = code.replace(
  '<td className="px-4 py-4 align-middle border-l border-gray-200 text-slate-700">Dapat terjadi beberapa kali dalam setahun</td>',
  '<td className="px-4 py-4 align-middle border-l border-gray-200 text-slate-700 text-[10px]">Dapat terjadi beberapa kali dalam setahun</td>'
);

code = code.replace(
  '<td className="px-4 py-4 align-middle border-l border-gray-200 text-slate-700">Terjadi dalam minggu / bulan</td>',
  '<td className="px-4 py-4 align-middle border-l border-gray-200 text-slate-700 text-[10px]">Terjadi dalam minggu / bulan</td>'
);

fs.writeFileSync('src/pages/risiko.tsx', code);
