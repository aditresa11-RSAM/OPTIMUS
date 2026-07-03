const fs = require('fs');
let code = fs.readFileSync('src/pages/risiko.tsx', 'utf8');

const unitModalCode = `
      {/* Unit Management Modal */}
      <AnimatePresence>
        {isUnitModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setIsUnitModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-[24px] shadow-2xl w-full max-w-md overflow-hidden flex flex-col"
            >
              <div className="px-6 py-4 bg-emerald-600 flex justify-between items-center">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Building2 size={20} /> Kelola Unit
                </h3>
                <button onClick={() => setIsUnitModalOpen(false)} className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded-lg transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={newUnitName}
                    onChange={(e) => setNewUnitName(e.target.value)}
                    placeholder="Nama Unit Baru..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-700"
                  />
                  <button 
                    onClick={() => {
                      if (newUnitName.trim()) {
                        const newId = Date.now().toString();
                        addUnit({ id: newId, name: newUnitName.trim(), category: 'Umum', status: 'Aktif' });
                        supabase.from('units').insert({ id: newId, name: newUnitName.trim(), category: 'Umum', status: 'Aktif' }).then();
                        setNewUnitName('');
                      }
                    }}
                    disabled={!newUnitName.trim()}
                    className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                  >
                    Tambah
                  </button>
                </div>
                
                <div className="max-h-[300px] overflow-y-auto rounded-xl border border-gray-100">
                  <table className="w-full text-left text-sm">
                    <tbody className="divide-y divide-gray-100">
                      {units.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-semibold text-slate-700">{u.name}</td>
                          <td className="px-4 py-3 text-right">
                            <button 
                              onClick={() => {
                                deleteUnit(u.id);
                                supabase.from('units').delete().eq('id', u.id).then();
                              }}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {units.length === 0 && (
                        <tr>
                          <td colSpan={2} className="px-4 py-6 text-center text-gray-500">Belum ada unit.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
`;

code = code.replace(
  '{/* Delete Confirmation Modal */}',
  unitModalCode + '\n      {/* Delete Confirmation Modal */}'
);

fs.writeFileSync('src/pages/risiko.tsx', code);
