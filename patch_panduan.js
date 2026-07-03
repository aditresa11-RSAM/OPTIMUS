const fs = require('fs');
let code = fs.readFileSync('src/pages/risiko.tsx', 'utf8');

const oldTitle = `            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
                  Manajemen Risiko
                </h1>
              </div>
              <p className="text-gray-500 font-medium text-sm">
                Identifikasi, evaluasi, dan mitigasi risiko rumah sakit secara terintegrasi.
              </p>
            </div>`;

const newTitle = `            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-black text-[#10a37f] tracking-tight">
                  Manajemen Risiko
                </h1>
              </div>
              <p className="text-gray-500 font-medium text-[12px]">
                Identifikasi, evaluasi, dan mitigasi risiko rumah sakit secara terintegrasi.
              </p>
            </div>`;

code = code.replace(oldTitle, newTitle);

const oldPanduan = /{?\/\*\s*PANDUAN PENGISIAN\s*\*\/}?[\s\S]*?(?=<\/motion\.div>)/;

const newPanduan = `{/* PANDUAN PENGISIAN */}
              <div className="space-y-6">
                
                {/* Tabel Severity */}
                <div className="bg-white rounded-[12px] shadow-sm border border-gray-100 overflow-hidden">
                  <div className="bg-white px-6 py-5 border-b border-gray-100">
                    <div className="flex gap-4 items-start">
                      <div className="mt-1 text-[#10a37f]">
                        <Activity size={32} strokeWidth={2.5} />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-[#10a37f] tracking-wide uppercase">SEVERITY (DAMPAK KLINIS)</h4>
                        <p className="text-slate-500 text-sm mt-1">Menilai tingkat keparahan dampak jika risiko terjadi terhadap pasien, pelayanan, hukum dan keuangan.</p>
                      </div>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[13px] border-collapse">
                      <thead>
                        <tr className="bg-[#10a37f] text-white">
                          <th className="px-4 py-3 font-bold border-b border-[#0e906f] text-center w-[80px]">LEVEL</th>
                          <th className="px-4 py-3 font-bold border-b border-[#0e906f]">DESKRIPSI</th>
                          <th className="px-4 py-3 font-bold border-b border-[#0e906f]">KESELAMATAN & KESEHATAN PASIEN</th>
                          <th className="px-4 py-3 font-bold border-b border-[#0e906f]">PENUNDAAN PELAYANAN</th>
                          <th className="px-4 py-3 font-bold border-b border-[#0e906f]">TUNTUTAN GANTI RUGI</th>
                          <th className="px-4 py-3 font-bold border-b border-[#0e906f]">DAMPAK KEUANGAN</th>
                          <th className="px-4 py-3 font-bold border-b border-[#0e906f]">CONTOH DESKRIPSI</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        <tr className="bg-slate-50/50 hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-4 align-top">
                            <div className="w-full aspect-square rounded-md bg-[#0e52db] text-white flex items-center justify-center font-black text-lg">1</div>
                          </td>
                          <td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700">
                            <span className="font-bold block">Insignificant</span>
                            <span className="text-slate-500">(Tidak Signifikan)</span>
                          </td>
                          <td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700">Tidak ada cedera</td>
                          <td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700">Tidak ada penundaan</td>
                          <td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700">Tidak ada tuntutan</td>
                          <td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700">Tidak ada biaya tambahan</td>
                          <td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700">Tidak ada efek merugikan terhadap pasien atau operasional.</td>
                        </tr>
                        <tr className="bg-[#f3faeb]/30 hover:bg-[#f3faeb]/50 transition-colors">
                          <td className="px-4 py-4 align-top">
                            <div className="w-full aspect-square rounded-md bg-[#009e4d] text-white flex items-center justify-center font-black text-lg">2</div>
                          </td>
                          <td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700">
                            <span className="font-bold block">Minor</span>
                            <span className="text-slate-500">(Ringan)</span>
                          </td>
                          <td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700">
                            <ul className="list-disc pl-4 space-y-1">
                              <li>Cedera ringan</li>
                              <li>Dapat diatasi dengan pertolongan pertama</li>
                            </ul>
                          </td>
                          <td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700">Penundaan pelayanan ≤ 1 jam</td>
                          <td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700">Kemungkinan sangat kecil tuntutan</td>
                          <td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700">Biaya tambahan sangat kecil</td>
                          <td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700">Efek minimal, pasien pulih dengan perawatan sederhana.</td>
                        </tr>
                        <tr className="bg-[#fffdf0]/50 hover:bg-[#fffdf0]/80 transition-colors">
                          <td className="px-4 py-4 align-top">
                            <div className="w-full aspect-square rounded-md bg-[#ffce00] text-slate-900 flex items-center justify-center font-black text-lg">3</div>
                          </td>
                          <td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700">
                            <span className="font-bold block">Moderate</span>
                            <span className="text-slate-500">(Sedang)</span>
                          </td>
                          <td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700">
                            <span className="font-semibold block mb-1">Cedera sedang</span>
                            <ul className="list-disc pl-4 space-y-1">
                              <li>Berkurangnya fungsi motorik, sensorik, psikologis atau intelektual secara reversibel</li>
                              <li>Setiap kasus yang memperpanjang perawatan</li>
                            </ul>
                          </td>
                          <td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700">Penundaan pelayanan 1 - 24 jam</td>
                          <td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700">Kemungkinan kecil tuntutan</td>
                          <td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700">Biaya tambahan sedang</td>
                          <td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700">Membutuhkan intervensi medis lebih lanjut, lama rawat bertambah.</td>
                        </tr>
                        <tr className="bg-[#fff8eb]/50 hover:bg-[#fff8eb]/80 transition-colors">
                          <td className="px-4 py-4 align-top">
                            <div className="w-full aspect-square rounded-md bg-[#ff6900] text-white flex items-center justify-center font-black text-lg">4</div>
                          </td>
                          <td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700">
                            <span className="font-bold block">Major</span>
                            <span className="text-slate-500">(Berat)</span>
                          </td>
                          <td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700">
                            <span className="font-semibold block mb-1">Cedera berat</span>
                            <ul className="list-disc pl-4 space-y-1">
                              <li>Kehilangan fungsi utama permanen (motorik, sensorik, psikologis, intelektual) secara irreversibel</li>
                              <li>Tidak berhubungan dengan penyakit yang mendasarinya</li>
                            </ul>
                          </td>
                          <td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700">Penundaan pelayanan &gt; 24 jam atau membahayakan kondisi pasien</td>
                          <td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700">Kemungkinan sedang tuntutan</td>
                          <td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700">Biaya tambahan besar</td>
                          <td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700">Menimbulkan komplikasi serius, perawatan intensif, atau operasi besar.</td>
                        </tr>
                        <tr className="bg-[#fdf2f2]/50 hover:bg-[#fdf2f2]/80 transition-colors">
                          <td className="px-4 py-4 align-top">
                            <div className="w-full aspect-square rounded-md bg-[#d3181f] text-white flex items-center justify-center font-black text-lg">5</div>
                          </td>
                          <td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700">
                            <span className="font-bold block">Catastrophic</span>
                            <span className="text-slate-500">(Sangat Berat)</span>
                          </td>
                          <td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700">Kematian yang tidak berhubungan dengan perjalanan penyakit yang mendasarinya</td>
                          <td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700">Penundaan pelayanan menyebabkan kondisi kritis atau kematian</td>
                          <td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700">Kemungkinan besar tuntutan</td>
                          <td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700">Biaya tambahan sangat besar</td>
                          <td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700">Kematian pasien, cacat permanen, dampak sangat luas secara klinis, hukum, dan finansial.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Tabel Probability */}
                <div className="bg-white rounded-[12px] shadow-sm border border-gray-100 overflow-hidden mt-6">
                  <div className="bg-white px-6 py-5 border-b border-gray-100">
                    <div className="flex gap-4 items-start">
                      <div className="mt-1 text-[#10a37f]">
                        <Building2 size={32} strokeWidth={2.5} />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-[#10a37f] tracking-wide uppercase">PROBABILITY (KEMUNGKINAN / FREKUENSI)</h4>
                        <p className="text-slate-500 text-sm mt-1">Menilai kemungkinan terjadinya risiko berdasarkan frekuensi kejadian di masa lalu atau potensi terjadi.</p>
                      </div>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[13px] border-collapse">
                      <thead>
                        <tr className="bg-[#10a37f] text-white">
                          <th className="px-4 py-3 font-bold border-b border-[#0e906f] text-center w-[80px]">LEVEL</th>
                          <th className="px-4 py-3 font-bold border-b border-[#0e906f]">FREKUENSI</th>
                          <th className="px-4 py-3 font-bold border-b border-[#0e906f]">KEJADIAN AKTUAL</th>
                          <th className="px-4 py-3 font-bold border-b border-[#0e906f]">KRITERIA PERISTIWA</th>
                          <th className="px-4 py-3 font-bold border-b border-[#0e906f] text-center">PERSENTASE KEMUNGKINAN</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        <tr className="bg-slate-50/50 hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-4 align-middle">
                            <div className="w-full h-8 rounded-md bg-[#0e52db] text-white flex items-center justify-center font-black text-base">1</div>
                          </td>
                          <td className="px-4 py-4 align-middle border-l border-gray-200 font-bold text-slate-800 text-center">Sangat Jarang</td>
                          <td className="px-4 py-4 align-middle border-l border-gray-200 text-slate-700">Dapat terjadi dalam lebih dari 5 tahun</td>
                          <td className="px-4 py-4 align-middle border-l border-gray-200 text-slate-700">Belum pernah terjadi atau hampir tidak pernah terjadi dalam kondisi normal.</td>
                          <td className="px-4 py-4 align-middle border-l border-gray-200 font-bold text-[#0e52db] text-center">&lt; 1%</td>
                        </tr>
                        <tr className="bg-[#f3faeb]/30 hover:bg-[#f3faeb]/50 transition-colors">
                          <td className="px-4 py-4 align-middle">
                            <div className="w-full h-8 rounded-md bg-[#009e4d] text-white flex items-center justify-center font-black text-base">2</div>
                          </td>
                          <td className="px-4 py-4 align-middle border-l border-gray-200 font-bold text-slate-800 text-center">Jarang</td>
                          <td className="px-4 py-4 align-middle border-l border-gray-200 text-slate-700">Dapat terjadi dalam 2 - 5 tahun</td>
                          <td className="px-4 py-4 align-middle border-l border-gray-200 text-slate-700">Pernah terjadi sekali dengan interval panjang atau sangat tidak mungkin terjadi.</td>
                          <td className="px-4 py-4 align-middle border-l border-gray-200 font-bold text-[#009e4d] text-center">1% – 5%</td>
                        </tr>
                        <tr className="bg-[#fffdf0]/50 hover:bg-[#fffdf0]/80 transition-colors">
                          <td className="px-4 py-4 align-middle">
                            <div className="w-full h-8 rounded-md bg-[#ffce00] text-slate-900 flex items-center justify-center font-black text-base">3</div>
                          </td>
                          <td className="px-4 py-4 align-middle border-l border-gray-200 font-bold text-slate-800 text-center">Mungkin</td>
                          <td className="px-4 py-4 align-middle border-l border-gray-200 text-slate-700">Dapat terjadi tiap 1 - 2 tahun</td>
                          <td className="px-4 py-4 align-middle border-l border-gray-200 text-slate-700">Pernah terjadi beberapa kali dan masih mungkin terjadi.</td>
                          <td className="px-4 py-4 align-middle border-l border-gray-200 font-bold text-[#ffce00] text-center">5% – 20%</td>
                        </tr>
                        <tr className="bg-[#fff8eb]/50 hover:bg-[#fff8eb]/80 transition-colors">
                          <td className="px-4 py-4 align-middle">
                            <div className="w-full h-8 rounded-md bg-[#ff6900] text-white flex items-center justify-center font-black text-base">4</div>
                          </td>
                          <td className="px-4 py-4 align-middle border-l border-gray-200 font-bold text-slate-800 text-center">Sering</td>
                          <td className="px-4 py-4 align-middle border-l border-gray-200 text-slate-700">Dapat terjadi beberapa kali dalam setahun</td>
                          <td className="px-4 py-4 align-middle border-l border-gray-200 text-slate-700">Sering terjadi dalam situasi tertentu dan cukup mungkin terjadi kembali.</td>
                          <td className="px-4 py-4 align-middle border-l border-gray-200 font-bold text-[#ff6900] text-center">20% – 50%</td>
                        </tr>
                        <tr className="bg-[#fdf2f2]/50 hover:bg-[#fdf2f2]/80 transition-colors">
                          <td className="px-4 py-4 align-middle">
                            <div className="w-full h-8 rounded-md bg-[#d3181f] text-white flex items-center justify-center font-black text-base">5</div>
                          </td>
                          <td className="px-4 py-4 align-middle border-l border-gray-200 font-bold text-slate-800 text-center">Sangat Sering</td>
                          <td className="px-4 py-4 align-middle border-l border-gray-200 text-slate-700">Terjadi dalam minggu / bulan</td>
                          <td className="px-4 py-4 align-middle border-l border-gray-200 text-slate-700">Sering terjadi bahkan dapat diprediksi akan terjadi kembali dalam waktu dekat.</td>
                          <td className="px-4 py-4 align-middle border-l border-gray-200 font-bold text-[#d3181f] text-center">&gt; 50%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <p className="text-center text-sm text-slate-500 mt-4">
                  Keterangan: Penentuan level probability dan severity harus didasarkan pada data historis, pengalaman, dan pertimbangan profesional.
                </p>
              </div>
            `;

code = code.replace(oldPanduan, newPanduan);

fs.writeFileSync('src/pages/risiko.tsx', code);
