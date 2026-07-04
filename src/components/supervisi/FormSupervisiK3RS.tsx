import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, Save, Printer, Download, Clock, Activity, 
  CheckCircle2, AlertTriangle, ShieldAlert, UploadCloud, FileText, 
  User, Calendar, MapPin, Briefcase, FileCheck2, Trash2, X
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, ResponsiveContainer, RadarChart, 
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { supabase } from "@/lib/supabase";
import { useStore } from "@/store/useStore";

interface FormSupervisiK3RSProps {
  onBack: () => void;
  onViewRiwayat: () => void;
}

type NilaiK3RS = 10 | 5 | 0 | null;

interface K3RSItem {
  id: string;
  kategori: string;
  uraian: string;
  standar: string;
  metode: string;
  nilai: NilaiK3RS;
  temuan: string;
  rekomendasi: string;
}

const INITIAL_ITEMS: K3RSItem[] = [
  { id: '1', kategori: 'Pengelolaan B3', standar: 'MFK 5', metode: 'Observasi', uraian: 'Penyimpanan B3 sesuai standar (tidak menempel ke dinding, diberikan alas, terdapat prosedur jika terjadi pajanan)', nilai: null, temuan: '', rekomendasi: '' },
  { id: '2', kategori: 'Pengelolaan B3', standar: 'MFK 5 (c)', metode: 'Wawancara', uraian: 'Staf dapat menjelaskan jika penanganan tumpahan B3', nilai: null, temuan: '', rekomendasi: '' },
  { id: '3', kategori: 'Limbah B3', standar: 'MFK 5.1', metode: 'Observasi', uraian: 'Penyimpanan limbah B3', nilai: null, temuan: '', rekomendasi: '' },
  { id: '4', kategori: 'Larangan Merokok', standar: 'MFK 6 (c)', metode: 'Observasi', uraian: 'Pelaksanaan kebijakan larangan merokok', nilai: null, temuan: '', rekomendasi: '' },
  { id: '5', kategori: 'Proteksi Kebakaran', standar: 'MFK 6 (f)', metode: 'Observasi', uraian: 'Peralatan pemadaman kebakaran aktif dan sistem peringatan dini serta proteksi kebakaran secara pasif telah diinventarisasi, diperiksa, diujicoba dan dipelihara sesuai dengan peraturan perundang-undangan dan didokumentasikan.', nilai: null, temuan: '', rekomendasi: '' },
  { id: '6', kategori: 'Kedaruratan', standar: 'MFK 9 (d)', metode: 'PL', uraian: 'Staf dapat menjelaskan atau memperagakan prosedur dan peran mereka dalam kedaruratan serta bencana', nilai: null, temuan: '', rekomendasi: '' },
  { id: '7', kategori: 'Pelatihan MFK', standar: 'MFK 11 (d)', metode: 'PL/Observasi', uraian: 'Staf telah diberikan pelatihan program manajemen MFK', nilai: null, temuan: '', rekomendasi: '' },
];

export default function FormSupervisiK3RS({ onBack, onViewRiwayat }: FormSupervisiK3RSProps) {
  const { units, addUnit, deleteUnit } = useStore();
  const [items, setItems] = useState<K3RSItem[]>(INITIAL_ITEMS);
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [unit, setUnit] = useState('');
  const [supervisor, setSupervisor] = useState('Tim K3RS');
  
  const [dokumentasi, setDokumentasi] = useState<string[]>([]);
  
  const [activeTab, setActiveTab] = useState<'form' | 'history'>('form');

  const updateItem = (id: string, field: keyof K3RSItem, value: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleAddUnit = async () => {
    const newUnitName = window.prompt("Masukkan nama ruangan baru:");
    if (!newUnitName || !newUnitName.trim()) return;
    const newId = Date.now().toString();
    const newUnitObj = { id: newId, name: newUnitName.trim(), category: 'Umum', status: 'Aktif' as const };
    addUnit(newUnitObj);
    setUnit(newUnitObj.name);
    try {
      await supabase.from('units').insert(newUnitObj);
    } catch(e) {
      console.warn("Supabase insert failed", e);
    }
  };

  const handleDeleteUnit = async (id: string, name: string) => {
    if (!window.confirm(`Hapus ruangan ${name}?`)) return;
    deleteUnit(id);
    if (unit === name) setUnit('');
    try {
      await supabase.from('units').delete().eq('id', id);
    } catch(e) {
      console.warn("Supabase delete failed", e);
    }
  };

  const handleDokumentasiUpload = () => {
    const fileName = `dokumentasi_${Math.floor(Math.random() * 1000)}.jpg`;
    setDokumentasi([...dokumentasi, fileName]);
  };

  const stats = useMemo(() => {
    let total = items.length;
    let filled = 0;
    let sesuai = 0;
    let sebagian = 0;
    let tidakSesuai = 0;
    let jumlahTemuan = 0;
    let jumlahRekomendasi = 0;

    let catStats: Record<string, { total: number, score: number }> = {
      'Pengelolaan B3': { total: 0, score: 0 },
      'Limbah B3': { total: 0, score: 0 },
      'Larangan Merokok': { total: 0, score: 0 },
      'Proteksi Kebakaran': { total: 0, score: 0 },
      'Kedaruratan': { total: 0, score: 0 },
      'Pelatihan MFK': { total: 0, score: 0 }
    };

    items.forEach(it => {
      if (it.nilai !== null) {
        filled++;
        catStats[it.kategori].total += 10;
        
        if (it.nilai === 10) {
          sesuai++;
          catStats[it.kategori].score += 10;
        } else if (it.nilai === 5) {
          sebagian++;
          catStats[it.kategori].score += 5;
        } else if (it.nilai === 0) {
          tidakSesuai++;
        }
      }
      
      if (it.temuan.trim() !== '') jumlahTemuan++;
      if (it.rekomendasi.trim() !== '') jumlahRekomendasi++;
    });

    const maxScore = filled * 10;
    const currentScore = (sesuai * 10) + (sebagian * 5);
    const persentase = maxScore === 0 ? 0 : Math.round((currentScore / maxScore) * 100);

    let status = 'Belum Ada Penilaian';
    let statusColor = 'bg-slate-100 text-slate-600 border-slate-200';
    let icon = <Activity size={24} />;

    if (filled > 0) {
      if (persentase >= 95) {
        status = 'Sangat Baik';
        statusColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
        icon = <CheckCircle2 size={24} className="text-emerald-600" />;
      } else if (persentase >= 85) {
        status = 'Baik';
        statusColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        icon = <CheckCircle2 size={24} className="text-emerald-500" />;
      } else if (persentase >= 75) {
        status = 'Cukup';
        statusColor = 'bg-amber-100 text-amber-800 border-amber-300';
        icon = <AlertTriangle size={24} className="text-amber-600" />;
      } else if (persentase >= 60) {
        status = 'Kurang';
        statusColor = 'bg-orange-100 text-orange-800 border-orange-300';
        icon = <AlertTriangle size={24} className="text-orange-600" />;
      } else {
        status = 'Sangat Kurang';
        statusColor = 'bg-rose-100 text-rose-800 border-rose-300';
        icon = <ShieldAlert size={24} className="text-rose-600" />;
      }
    }

    const radarData = Object.keys(catStats).map(k => {
      const c = catStats[k];
      return {
        subject: k,
        A: c.total > 0 ? Math.round((c.score / c.total) * 100) : 0,
        fullMark: 100
      };
    });

    const barData = Object.keys(catStats).map(k => {
      const c = catStats[k];
      return {
        name: k.substring(0, 15) + (k.length > 15 ? '...' : ''),
        Kepatuhan: c.total > 0 ? Math.round((c.score / c.total) * 100) : 0
      };
    }).filter(d => d.Kepatuhan > 0 || filled > 5);

    const pieData = [
      { name: 'Sesuai', value: sesuai, color: '#10b981' },
      { name: 'Sebagian', value: sebagian, color: '#eab308' },
      { name: 'Tidak Sesuai', value: tidakSesuai, color: '#ef4444' }
    ].filter(d => d.value > 0);

    const progress = Math.round((filled / total) * 100);

    return { 
      total, filled, sesuai, sebagian, tidakSesuai, persentase, status, statusColor, icon, 
      radarData, barData, pieData, progress, jumlahTemuan, jumlahRekomendasi, currentScore, maxScore
    };
  }, [items]);

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Top Header Navigation */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold text-sm bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm transition-all"
        >
          <ArrowLeft size={16} /> Kembali ke Menu
        </button>
        <div className="flex flex-wrap items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
          <button onClick={() => setActiveTab('form')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'form' ? 'bg-[#007A4D] text-white' : 'text-slate-600 hover:bg-slate-50'}`}>Checklist & Hasil</button>
          <button onClick={() => setActiveTab('history')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'history' ? 'bg-[#007A4D] text-white' : 'text-slate-600 hover:bg-slate-50'}`}>Riwayat Supervisi</button>
        </div>
      </div>

      {activeTab === 'form' && (
      <div className="space-y-6">
        {/* Header Form Card */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden relative p-8">
          <div className="absolute top-0 left-0 w-2 h-full bg-[#007A4D]"></div>
          
          <div className="text-center mb-8">
             <h1 className="text-2xl font-black text-slate-800 tracking-wider">FORMULIR SUPERVISI</h1>
             <p className="text-sm font-bold text-slate-600 mt-1 uppercase">Peningkatan Kualitas Pelayanan Rumah Sakit</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
             <div className="flex items-center gap-4">
                <label className="text-sm font-bold text-slate-500 w-32 shrink-0">Area Supervisi</label>
                <div className="flex-1 font-bold text-slate-800">: <input type="text" className="ml-2 w-[80%] outline-none border-b border-dashed border-slate-300 focus:border-[#007A4D] bg-transparent" placeholder="Ketik Area..." defaultValue="UOBK RSUD AL-MULK" /></div>
             </div>
             <div className="flex items-center gap-4">
                <label className="text-sm font-bold text-slate-500 w-32 shrink-0">Tanggal</label>
                <div className="flex-1 font-bold text-slate-800">: <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} className="ml-2 w-[80%] outline-none border-b border-dashed border-slate-300 focus:border-[#007A4D] bg-transparent" /></div>
             </div>
             <div className="flex items-center gap-4">
                <label className="text-sm font-bold text-slate-500 w-32 shrink-0">Unit / Ruangan</label>
                <div className="flex-1 font-bold text-slate-800 flex items-center gap-2"> 
                   :
                   <select value={unit} onChange={(e) => {
                     if (e.target.value === 'ADD_NEW') {
                       handleAddUnit();
                     } else {
                       setUnit(e.target.value);
                     }
                   }} className="ml-2 flex-1 outline-none border-b border-dashed border-slate-300 focus:border-[#007A4D] bg-transparent cursor-pointer">
                     <option value="">-- Pilih Unit --</option>
                     {units.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                     <option value="ADD_NEW" className="font-bold text-[#007A4D]">+ Tambah Ruangan Baru</option>
                   </select>
                   {unit && unit !== 'ADD_NEW' && (
                     <button onClick={() => {
                       const found = units.find(u => u.name === unit);
                       if (found) handleDeleteUnit(found.id, found.name);
                     }} className="text-rose-500 hover:text-rose-600 px-2" title="Hapus Unit">
                       <Trash2 size={16} />
                     </button>
                   )}
                </div>
             </div>
             <div className="flex items-center gap-4">
                <label className="text-sm font-bold text-slate-500 w-32 shrink-0">Supervisor</label>
                <div className="flex-1 font-bold text-slate-800">: <input type="text" value={supervisor} onChange={(e) => setSupervisor(e.target.value)} className="ml-2 w-[80%] outline-none border-b border-dashed border-slate-300 focus:border-[#007A4D] bg-transparent" placeholder="Nama Supervisor" /></div>
             </div>
          </div>
        </div>

        {/* Tabel Supervisi */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="bg-[#007A4D] text-white">
                <tr>
                  <th className="p-4 text-xs font-extrabold w-12 text-center uppercase tracking-wider border-r border-[#005F3A]">No</th>
                  <th className="p-4 text-xs font-extrabold w-[25%] text-center uppercase tracking-wider border-r border-[#005F3A]">Uraian yang Disupervisi</th>
                  <th className="p-4 text-xs font-extrabold w-20 text-center uppercase tracking-wider border-r border-[#005F3A]">Acuan</th>
                  <th className="p-4 text-xs font-extrabold w-20 text-center uppercase tracking-wider border-r border-[#005F3A]">Metode</th>
                  <th className="p-4 text-xs font-extrabold w-32 text-center uppercase tracking-wider border-r border-[#005F3A]">Nilai (0/5/10)</th>
                  <th className="p-4 text-xs font-extrabold w-[20%] text-center uppercase tracking-wider border-r border-[#005F3A]">Temuan</th>
                  <th className="p-4 text-xs font-extrabold w-[20%] text-center uppercase tracking-wider">Rekomendasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item, idx) => (
                  <React.Fragment key={item.id}>
                    {/* Render Category Header if it's the first item of the category */}
                    {(idx === 0 || items[idx - 1].kategori !== item.kategori) && (
                      <tr className="bg-slate-50">
                        <td colSpan={7} className="p-3 text-xs font-black text-slate-800 border-y border-slate-200">
                          <div className="flex items-center gap-2">
                             <div className="w-1.5 h-4 bg-[#007A4D] rounded-full"></div>
                             {item.kategori}
                          </div>
                        </td>
                      </tr>
                    )}
                    <tr className="hover:bg-emerald-50/30 transition-colors group">
                      <td className="p-4 border-r border-slate-100 text-center text-xs font-bold text-slate-400 align-top">{idx + 1}</td>
                      <td className="p-4 border-r border-slate-100 text-[11px] font-semibold text-slate-700 align-top leading-relaxed whitespace-pre-line">{item.uraian}</td>
                      <td className="p-3 border-r border-slate-100 align-top text-center">
                         <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded">{item.standar}</span>
                      </td>
                      <td className="p-3 border-r border-slate-100 align-top text-center">
                         <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded">{item.metode}</span>
                      </td>
                      
                      <td className="p-3 border-r border-slate-100 align-top">
                        <select
                          value={item.nilai === null ? '' : item.nilai}
                          onChange={(e) => updateItem(item.id, 'nilai', e.target.value === '' ? null : Number(e.target.value))}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-2 text-[10px] font-bold text-slate-700 outline-none focus:border-[#007A4D] focus:ring-2 focus:ring-[#007A4D]/20"
                        >
                          <option value="">Pilih</option>
                          <option value="10">10 (Sesuai)</option>
                          <option value="5">5 (Sebagian Sesuai)</option>
                          <option value="0">0 (Tidak Sesuai)</option>
                        </select>
                      </td>

                      <td className="p-3 border-r border-slate-100 align-top">
                        <textarea 
                          value={item.temuan} 
                          onChange={(e) => updateItem(item.id, 'temuan', e.target.value)} 
                          placeholder="Tuliskan hasil temuan supervisi..." 
                          className="w-full h-24 resize-none bg-white border border-slate-200 rounded-lg p-2 text-[10px] font-medium text-slate-700 outline-none focus:border-[#007A4D] placeholder:text-slate-300 transition-colors" 
                        />
                      </td>
                      <td className="p-3 align-top">
                        <textarea 
                          value={item.rekomendasi} 
                          onChange={(e) => updateItem(item.id, 'rekomendasi', e.target.value)} 
                          placeholder="Tuliskan rekomendasi tindak lanjut..." 
                          className="w-full h-24 resize-none bg-white border border-slate-200 rounded-lg p-2 text-[10px] font-medium text-slate-700 outline-none focus:border-[#007A4D] placeholder:text-slate-300 transition-colors" 
                        />
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dashboard Summary & Charts inline below form */}
        <div className="grid lg:grid-cols-3 gap-6 pt-6">
           {/* Card Summary */}
           <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col gap-4">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-2">Summary K3RS</h3>
              
              <div className="grid grid-cols-2 gap-3">
                 <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Total Item</p>
                    <p className="text-2xl font-black text-slate-800">{stats.total}</p>
                 </div>
                 <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                    <p className="text-[10px] font-bold text-emerald-700 uppercase">Kepatuhan (%)</p>
                    <p className="text-2xl font-black text-emerald-600">{stats.persentase}%</p>
                 </div>
                 <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                    <p className="text-[10px] font-bold text-emerald-700 uppercase">Sesuai</p>
                    <p className="text-xl font-black text-emerald-600">{stats.sesuai}</p>
                 </div>
                 <div className="bg-rose-50 p-3 rounded-xl border border-rose-100">
                    <p className="text-[10px] font-bold text-rose-700 uppercase">Tidak Sesuai</p>
                    <p className="text-xl font-black text-rose-600">{stats.tidakSesuai}</p>
                 </div>
                 <div className="bg-amber-50 p-3 rounded-xl border border-amber-100">
                    <p className="text-[10px] font-bold text-amber-700 uppercase">Jumlah Temuan</p>
                    <p className="text-xl font-black text-amber-600">{stats.jumlahTemuan}</p>
                 </div>
                 <div className="bg-sky-50 p-3 rounded-xl border border-sky-100">
                    <p className="text-[10px] font-bold text-sky-700 uppercase">Rekomendasi</p>
                    <p className="text-xl font-black text-sky-600">{stats.jumlahRekomendasi}</p>
                 </div>
              </div>
           </div>

           {/* Radar Chart */}
           <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:col-span-1 flex flex-col">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4 text-center">Fokus Area K3RS</h3>
              <div className="flex-1 min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="65%" data={stats.radarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 9, fontWeight: 700 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                    <Radar name="Kepatuhan" dataKey="A" stroke="#007A4D" fill="#007A4D" fillOpacity={0.3} />
                    <RechartsTooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
           </div>

           {/* Foto/Dokumentasi Upload */}
           <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:col-span-1 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Dokumentasi / Foto</h3>
                 <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-full">{dokumentasi.length} File</span>
              </div>
              <div className="flex-1 flex flex-col gap-3 overflow-y-auto max-h-[220px]">
                 {dokumentasi.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                       {dokumentasi.map((doc, idx) => (
                          <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-200 aspect-square flex items-center justify-center bg-slate-50">
                             <FileText size={24} className="text-slate-400" />
                             <span className="absolute bottom-1 w-full text-center text-[8px] font-bold text-slate-500 truncate px-1">{doc}</span>
                             <button onClick={() => setDokumentasi(dokumentasi.filter((_, i) => i !== idx))} className="absolute top-1 right-1 p-1 bg-white/90 rounded-md text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                                <Trash2 size={12} />
                             </button>
                          </div>
                       ))}
                    </div>
                 ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl p-4">
                       <UploadCloud size={32} className="mb-2 text-slate-300" />
                       <p className="text-xs font-semibold text-center">Belum ada dokumentasi</p>
                    </div>
                 )}
              </div>
              <button onClick={handleDokumentasiUpload} className="mt-4 w-full py-2.5 flex items-center justify-center gap-2 bg-emerald-50 text-[#007A4D] font-bold text-xs rounded-xl border border-emerald-200 hover:bg-emerald-100 transition-colors">
                 <UploadCloud size={14} /> Tambah Foto/Dokumen
              </button>
           </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-4 pt-6 mt-4 border-t border-slate-200">
           <button 
             onClick={() => { alert('Data Supervisi K3RS Berhasil Disimpan!'); }} 
             disabled={stats.progress < 100}
             className={`flex items-center justify-center gap-2 px-8 py-3 font-bold rounded-xl shadow-lg transition-all ${stats.progress === 100 ? 'bg-[#007A4D] text-white hover:bg-[#005F3A] shadow-emerald-500/30' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
           >
              <Save size={18} /> Simpan Hasil Supervisi
           </button>
        </div>
      </div>
      )}

      {/* HISTORY TAB */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 animate-in slide-in-from-bottom-4 duration-500">
           <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
              <h3 className="text-xl font-black text-slate-800">Riwayat Supervisi K3RS</h3>
              
              <div className="flex flex-wrap gap-2">
                 <select className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-600 outline-none focus:border-[#007A4D]">
                   <option>Tahun 2024</option>
                 </select>
                 <select className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-600 outline-none focus:border-[#007A4D]">
                   <option>Semua Triwulan</option>
                   <option>Triwulan I</option>
                   <option>Triwulan II</option>
                 </select>
                 <select className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-600 outline-none focus:border-[#007A4D]">
                   <option>Semua Unit</option>
                   <option>IGD</option>
                 </select>
              </div>
           </div>

           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                 <thead className="bg-[#007A4D] text-white rounded-t-xl">
                    <tr>
                       <th className="p-4 text-xs font-bold uppercase tracking-wider first:rounded-tl-xl">Tanggal</th>
                       <th className="p-4 text-xs font-bold uppercase tracking-wider">Unit</th>
                       <th className="p-4 text-xs font-bold uppercase tracking-wider">Supervisor</th>
                       <th className="p-4 text-xs font-bold uppercase tracking-wider text-center">Persentase</th>
                       <th className="p-4 text-xs font-bold uppercase tracking-wider text-center">Status</th>
                       <th className="p-4 text-xs font-bold uppercase tracking-wider text-right last:rounded-tr-xl">Aksi</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    <tr className="hover:bg-slate-50 transition-colors">
                       <td className="p-4 text-sm font-bold text-slate-700">{tanggal}</td>
                       <td className="p-4 text-sm font-bold text-slate-700">{unit || 'IGD'}</td>
                       <td className="p-4 text-sm font-semibold text-slate-600">{supervisor}</td>
                       <td className="p-4 text-center">
                          <span className="text-sm font-black text-[#007A4D]">{stats.persentase > 0 ? stats.persentase : 92}%</span>
                       </td>
                       <td className="p-4 text-center">
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-black uppercase tracking-wider">
                             Selesai
                          </span>
                       </td>
                       <td className="p-4 text-right">
                          <button className="text-xs font-bold text-[#007A4D] hover:underline mr-4">Lihat Detail</button>
                          <button className="text-xs font-bold text-slate-500 hover:underline">Download PDF</button>
                       </td>
                    </tr>
                 </tbody>
              </table>
           </div>
        </div>
      )}
    </div>
  );
}

