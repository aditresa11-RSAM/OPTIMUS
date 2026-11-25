import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, TrendingUp, Users, CheckCircle2, ShieldAlert, 
  Search, Filter, Eye, Printer, Calendar, RefreshCw, Award
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface DashboardSupervisiProps {
  onBack: () => void;
}

export default function DashboardSupervisi({ onBack }: DashboardSupervisiProps) {
  const [dataList, setDataList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJenis, setSelectedJenis] = useState('Semua');
  const [selectedUnit, setSelectedUnit] = useState('Semua');
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);

  const fetchSupervisi = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('supervisi')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) {
        setDataList(data);
      }
    } catch (e) {
      console.error('Error fetching supervisi:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSupervisi();
  }, []);

  // Filtered list
  const filteredList = useMemo(() => {
    return dataList.filter(item => {
      const matchSearch = 
        (item.unit || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.supervisor || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.jenis || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchJenis = selectedJenis === 'Semua' || item.jenis === selectedJenis;
      const matchUnit = selectedUnit === 'Semua' || item.unit === selectedUnit;

      return matchSearch && matchJenis && matchUnit;
    });
  }, [dataList, searchQuery, selectedJenis, selectedUnit]);

  // KPIs
  const kpis = useMemo(() => {
    const total = dataList.length;
    const uniqueUnits = new Set(dataList.map(d => d.unit).filter(Boolean)).size;
    const avgScore = total === 0 ? 0 : Math.round(dataList.reduce((acc, curr) => acc + (Number(curr.skor) || 0), 0) / total);
    const needFollowUp = dataList.filter(d => (Number(d.skor) || 0) < 70).length;

    return { total, uniqueUnits, avgScore, needFollowUp };
  }, [dataList]);

  // Unique units for dropdown
  const unitOptions = useMemo(() => {
    const units = Array.from(new Set(dataList.map(d => d.unit).filter(Boolean)));
    return ['Semua', ...units];
  }, [dataList]);

  return (
    <div className="w-full animate-in fade-in zoom-in-95 duration-500 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold text-sm bg-white border border-slate-200 px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer hover:bg-slate-50"
          >
            <ArrowLeft size={16} />
            Kembali
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Dashboard & Evaluasi Supervisi</h1>
            <p className="text-xs text-slate-500 font-medium">Rekapitulasi supervisi klinis, PPI, K3RS, dan tata kelola mutu RSUD Al-Mulk</p>
          </div>
        </div>

        <button
          onClick={fetchSupervisi}
          disabled={isLoading}
          className="flex items-center gap-2 self-start sm:self-auto px-4 py-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs rounded-xl border border-emerald-200 transition-colors cursor-pointer"
        >
          <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          Segarkan Data
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-500 text-sm">Total Supervisi</h3>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="text-4xl font-black text-slate-800">{kpis.total}</div>
          <p className="text-xs font-bold text-emerald-600 mt-2">Audit tersimpan di database</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-500 text-sm">Unit Ter-Supervisi</h3>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Users size={20} />
            </div>
          </div>
          <div className="text-4xl font-black text-slate-800">{kpis.uniqueUnits}</div>
          <p className="text-xs font-bold text-purple-600 mt-2">Unit pelayanan aktif</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-500 text-sm">Rata-rata Kepatuhan</h3>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="text-4xl font-black text-slate-800">{kpis.avgScore}%</div>
          <p className="text-xs font-bold text-emerald-600 mt-2">
            {kpis.avgScore >= 85 ? 'Kategori BAIK' : kpis.avgScore >= 70 ? 'Kategori CUKUP' : 'PERLU PERBAIKAN'}
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-500 text-sm">Perlu Tindak Lanjut</h3>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <ShieldAlert size={20} />
            </div>
          </div>
          <div className="text-4xl font-black text-slate-800">{kpis.needFollowUp}</div>
          <p className="text-xs font-bold text-rose-600 mt-2">Nilai skor &lt; 70%</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari unit, supervisor..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-emerald-500 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Jenis Supervisi Filter */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            {['Semua', 'Mutu', 'PPI', 'K3RS', 'Keperawatan'].map((j) => (
              <button
                key={j}
                onClick={() => setSelectedJenis(j)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedJenis === j 
                    ? 'bg-white text-emerald-700 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {j}
              </button>
            ))}
          </div>

          {/* Unit Filter */}
          <select
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer"
          >
            {unitOptions.map(u => (
              <option key={u} value={u}>{u === 'Semua' ? 'Semua Unit' : u}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 text-base">Riwayat Laporan Supervisi Terintegrasi</h3>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {filteredList.length} Catatan
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-400 font-bold text-sm">
            <RefreshCw size={24} className="animate-spin mx-auto mb-3 text-emerald-600" />
            Memuat data supervisi...
          </div>
        ) : filteredList.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-bold text-sm">
            <Award size={32} className="mx-auto mb-3 text-slate-300" />
            Belum ada data supervisi yang tersimpan. Silakan isi form supervisi pada menu sebelumnya.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/80 text-slate-600 border-b border-slate-200 text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-4 px-6">Tanggal</th>
                  <th className="py-4 px-6">Modul / Jenis</th>
                  <th className="py-4 px-6">Unit Pelayanan</th>
                  <th className="py-4 px-6">Supervisor</th>
                  <th className="py-4 px-6">Skor Kepatuhan</th>
                  <th className="py-4 px-6">Kategori</th>
                  <th className="py-4 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredList.map((item) => {
                  const skor = Number(item.skor) || 0;
                  const isGood = skor >= 85;
                  const isModerate = skor >= 70 && skor < 85;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6 font-semibold text-slate-700 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-slate-400" />
                          {item.tanggal || item.created_at?.split('T')[0] || '-'}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-extrabold ${
                          item.jenis === 'Mutu' ? 'bg-sky-100 text-sky-800' :
                          item.jenis === 'PPI' ? 'bg-emerald-100 text-emerald-800' :
                          item.jenis === 'K3RS' ? 'bg-amber-100 text-amber-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {item.jenis || 'Umum'}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-bold text-slate-800">{item.unit || '-'}</td>
                      <td className="py-4 px-6 text-slate-600 text-xs font-medium">{item.supervisor || '-'}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${isGood ? 'bg-emerald-500' : isModerate ? 'bg-amber-500' : 'bg-rose-500'}`}
                              style={{ width: `${Math.min(100, Math.max(0, skor))}%` }}
                            />
                          </div>
                          <span className="font-extrabold text-slate-800">{skor}%</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          isGood ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          isModerate ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {item.kategori || (isGood ? 'BAIK' : isModerate ? 'CUKUP' : 'PERLU TINDAK LANJUT')}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedRecord(item)}
                          className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer mr-1"
                          title="Lihat Detail Supervisi"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedRecord(item);
                            setTimeout(() => window.print(), 300);
                          }}
                          className="p-2 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Cetak Laporan"
                        >
                          <Printer size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6 pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                  Supervisi {selectedRecord.jenis}
                </span>
                <h3 className="text-xl font-black text-slate-800 mt-2">
                  Unit: {selectedRecord.unit}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Tanggal: {selectedRecord.tanggal} | Supervisor: {selectedRecord.supervisor}
                </p>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs font-medium text-slate-700">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl">
                <div>
                  <p className="text-slate-400 text-[10px] uppercase font-bold">Skor Akhir</p>
                  <p className="text-2xl font-black text-slate-800">{selectedRecord.skor}%</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] uppercase font-bold">Status Evaluasi</p>
                  <p className="text-sm font-bold text-emerald-700 mt-1">{selectedRecord.kategori || 'Selesai'}</p>
                </div>
              </div>

              {selectedRecord.detail?.analisa && (
                <div className="bg-sky-50/60 p-4 rounded-xl border border-sky-100 space-y-2">
                  <h4 className="font-bold text-sky-800 text-xs">Analisa & Rekomendasi:</h4>
                  {selectedRecord.detail.analisa.kesimpulan && (
                    <p><strong>Kesimpulan:</strong> {selectedRecord.detail.analisa.kesimpulan}</p>
                  )}
                  {selectedRecord.detail.analisa.rekomendasi && (
                    <p><strong>Rekomendasi:</strong> {selectedRecord.detail.analisa.rekomendasi}</p>
                  )}
                  {selectedRecord.detail.analisa.tindakLanjut && (
                    <p><strong>Tindak Lanjut:</strong> {selectedRecord.detail.analisa.tindakLanjut}</p>
                  )}
                </div>
              )}

              {Array.isArray(selectedRecord.detail?.items) && (
                <div>
                  <h4 className="font-bold text-slate-800 mb-2">Daftar Checklist Supervisi:</h4>
                  <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                    {selectedRecord.detail.items.map((it: any, idx: number) => (
                      <div key={idx} className="p-3 text-xs flex justify-between items-center gap-4 bg-white hover:bg-slate-50">
                        <span className="text-slate-700">{it.uraian || it.kegiatan || it.nama || `Item ${idx + 1}`}</span>
                        <span className="font-bold text-slate-800 whitespace-nowrap">
                          {it.nilai !== null && it.nilai !== undefined ? `${it.nilai}` : '-'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-5 py-2.5 bg-rose-50 text-rose-700 font-bold text-xs rounded-xl hover:bg-rose-100 transition-colors cursor-pointer"
              >
                <Printer size={14} /> Cetak Bukti
              </button>
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-5 py-2.5 bg-slate-800 text-white font-bold text-xs rounded-xl hover:bg-slate-900 transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
