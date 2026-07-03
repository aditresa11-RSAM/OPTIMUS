const fs = require('fs');
let code = fs.readFileSync('src/pages/risiko.tsx', 'utf8');

const regex = /<div className="relative">\s*<Search className="absolute left-3 top-1\/2 -translate-y-1\/2 text-gray-400" size=\{18\} \/>\s*<input\s*type="text"\s*placeholder="Cari risiko atau penyebab\.\.\."\s*value=\{searchTerm\}\s*onChange=\{\(e\) => setSearchTerm\(e\.target\.value\)\}\s*className="w-full sm:w-64 pl-10 pr-4 py-2\.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm font-medium"\s*\/>\s*<\/div>[\s\S]*?<label className="text-sm font-bold text-slate-700">Identifikasi Risiko<\/label>/;

const replacement = `<div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        type="text" 
                        placeholder="Cari risiko atau penyebab..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full sm:w-64 pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm font-medium"
                      />
                    </div>
                    
                    <select 
                      value={filterGrading}
                      onChange={(e) => setFilterGrading(e.target.value)}
                      className="px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium text-slate-700 bg-white"
                    >
                      <option value="All">Semua Grading</option>
                      <option value="Low">Low</option>
                      <option value="Moderate">Moderate</option>
                      <option value="High">High</option>
                      <option value="Extreme">Extreme</option>
                    </select>

                    <select 
                      value={filterUnit}
                      onChange={(e) => setFilterUnit(e.target.value)}
                      className="px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium text-slate-700 bg-white"
                    >
                      <option value="All">Semua Unit</option>
                      {units.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                    </select>
                  </div>
                  
                  <div className="flex items-center gap-3 w-full lg:w-auto">
                    <button className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-slate-600 hover:bg-gray-50 hover:text-emerald-600 font-bold text-sm transition-colors">
                      <Download size={16} /> Export Excel
                    </button>
                    <button className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-slate-600 hover:bg-gray-50 hover:text-emerald-600 font-bold text-sm transition-colors">
                      <Printer size={16} /> Print
                    </button>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto rounded-xl border border-gray-100">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-emerald-600 text-white text-sm">
                        <th className="px-4 py-3.5 font-bold rounded-tl-xl whitespace-nowrap">No</th>
                        <th className="px-4 py-3.5 font-bold whitespace-nowrap">Tahun</th>
                        <th className="px-4 py-3.5 font-bold whitespace-nowrap">Unit</th>
                        <th className="px-4 py-3.5 font-bold min-w-[200px]">Risiko</th>
                        <th className="px-4 py-3.5 font-bold text-center whitespace-nowrap">Severity</th>
                        <th className="px-4 py-3.5 font-bold text-center whitespace-nowrap">Probability</th>
                        <th className="px-4 py-3.5 font-bold text-center whitespace-nowrap">Score</th>
                        <th className="px-4 py-3.5 font-bold text-center whitespace-nowrap">Grading</th>
                        <th className="px-4 py-3.5 font-bold rounded-tr-xl text-center whitespace-nowrap">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredRecords.length > 0 ? filteredRecords.map((record, index) => (
                        <tr key={record.id} className="hover:bg-emerald-50/30 transition-colors group">
                          <td className="px-4 py-3.5 text-sm font-semibold text-slate-500">{index + 1}</td>
                          <td className="px-4 py-3.5 text-sm text-slate-700 font-medium">{record.tahun}</td>
                          <td className="px-4 py-3.5 text-sm text-slate-700 font-semibold">{record.unit}</td>
                          <td className="px-4 py-3.5 text-sm text-slate-600">{record.risiko}</td>
                          <td className="px-4 py-3.5 text-sm text-center font-bold text-slate-700">{record.severity}</td>
                          <td className="px-4 py-3.5 text-sm text-center font-bold text-slate-700">{record.probability}</td>
                          <td className="px-4 py-3.5 text-sm text-center">
                            <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mx-auto font-black text-slate-700">
                              {record.riskScore}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <span className={\`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border \${getBadgeColor(record.grading)}\`}>
                              {record.grading}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleViewDetail(record)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg tooltip" title="Detail">
                                <Info size={16} />
                              </button>
                              <button onClick={() => handleEdit(record)} className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-lg tooltip" title="Edit">
                                <Edit2 size={16} />
                              </button>
                              <button onClick={() => { setRecordToDelete(record.id); setIsDeleteModalOpen(true); }} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg tooltip" title="Hapus">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={9} className="px-4 py-12 text-center text-gray-500 font-medium">
                            Tidak ada data risiko yang ditemukan.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500 font-medium">
                    Menampilkan <span className="font-bold text-slate-700">{filteredRecords.length}</span> data
                  </p>
                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:text-emerald-600 hover:border-emerald-200 disabled:opacity-50">
                      <ChevronLeft size={18} />
                    </button>
                    <button className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center">1</button>
                    <button className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:text-emerald-600 hover:border-emerald-200 disabled:opacity-50">
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* INPUT FORM TAB */}
          {activeTab === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-emerald-600 px-6 py-4">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    {editingId ? <Edit2 size={20} /> : <PlusCircle size={20} />}
                    {editingId ? 'Edit Data Manajemen Risiko' : 'Form Input Manajemen Risiko'}
                  </h2>
                </div>
                
                <div className="p-6 md:p-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Tahun</label>
                      <select 
                        value={formData.tahun}
                        onChange={(e) => setFormData({...formData, tahun: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-700"
                      >
                        {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Unit / Instalasi</label>
                      <div className="flex gap-2">
                        <select 
                          value={formData.unit}
                          onChange={(e) => setFormData({...formData, unit: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-700"
                        >
                          <option value="" disabled>Pilih Unit</option>
                          {units.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                        </select>
                        <button 
                          onClick={() => setIsUnitModalOpen(true)}
                          className="px-4 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 hover:bg-emerald-100 transition-colors flex items-center justify-center font-bold"
                          title="Kelola Unit"
                        >
                          <PlusCircle size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Identifikasi Risiko</label>`;

code = code.replace(regex, replacement);

fs.writeFileSync('src/pages/risiko.tsx', code);
