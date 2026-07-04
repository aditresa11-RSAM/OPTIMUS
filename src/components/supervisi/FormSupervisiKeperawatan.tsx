import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, Save, Printer, Download, Clock, Calculator, Activity, 
  CheckCircle2, AlertTriangle, ShieldAlert, UploadCloud, FileText, 
  Check, X, Minus
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, ResponsiveContainer, RadarChart, 
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line 
} from 'recharts';

interface FormSupervisiKeperawatanProps {
  onBack: () => void;
  onViewRiwayat: () => void;
}

type NilaiKep = 'SESUAI' | 'SEBAGIAN' | 'TIDAK_SESUAI' | 'NA' | null;

interface KepItem {
  id: string;
  kategori: string;
  uraian: string;
  nilai: NilaiKep;
  catatan: string;
  bukti: string;
}

const KATEGORI_KEP = [
  'Asuhan Keperawatan',
  'Manajemen Obat',
  'Peralatan Medis',
  'Keselamatan Pasien',
  'Dokumentasi'
];

const INITIAL_ITEMS: KepItem[] = [
  { id: '1', kategori: 'Asuhan Keperawatan', uraian: 'Pengkajian awal keperawatan pasien baru terisi lengkap dalam 24 jam', nilai: null, catatan: '', bukti: '' },
  { id: '2', kategori: 'Asuhan Keperawatan', uraian: 'Perencanaan asuhan (Nursing Care Plan) dibuat sesuai diagnosa', nilai: null, catatan: '', bukti: '' },
  { id: '3', kategori: 'Manajemen Obat', uraian: 'Prinsip 7 Benar pemberian obat dilaksanakan', nilai: null, catatan: '', bukti: '' },
  { id: '4', kategori: 'Manajemen Obat', uraian: 'Penyimpanan obat high alert sesuai standar (Double Lock)', nilai: null, catatan: '', bukti: '' },
  { id: '5', kategori: 'Peralatan Medis', uraian: 'Troli emergency terkunci rapat dengan segel bernomor', nilai: null, catatan: '', bukti: '' },
  { id: '6', kategori: 'Peralatan Medis', uraian: 'Pengecekan alat bantu napas dan oksigen dilakukan setiap shift', nilai: null, catatan: '', bukti: '' },
  { id: '7', kategori: 'Keselamatan Pasien', uraian: 'Identifikasi pasien (gelang nama) terpasang benar', nilai: null, catatan: '', bukti: '' },
  { id: '8', kategori: 'Keselamatan Pasien', uraian: 'Penilaian risiko jatuh (Morse/Humpty Dumpty) dilakukan', nilai: null, catatan: '', bukti: '' },
  { id: '9', kategori: 'Dokumentasi', uraian: 'Catatan Perkembangan Pasien Terintegrasi (CPPT) diisi dengan format SOAP', nilai: null, catatan: '', bukti: '' },
  { id: '10', kategori: 'Dokumentasi', uraian: 'Serah terima pasien (Handover) dicatat dengan SBAR', nilai: null, catatan: '', bukti: '' }
];

export default function FormSupervisiKeperawatan({ onBack, onViewRiwayat }: FormSupervisiKeperawatanProps) {
  const [items, setItems] = useState<KepItem[]>(INITIAL_ITEMS);
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [unit, setUnit] = useState('');
  const [supervisor, setSupervisor] = useState('Bidang Keperawatan');
  
  const [activeTab, setActiveTab] = useState<'form' | 'dashboard' | 'history'>('form');

  const updateItem = (id: string, field: keyof KepItem, value: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleFileUpload = (id: string) => {
    const fileName = `bukti_kep_${id}_${Math.floor(Math.random()*1000)}.jpg`;
    updateItem(id, 'bukti', fileName);
  };

  const stats = useMemo(() => {
    let total = 0;
    let sesuai = 0;
    let sebagian = 0;
    let tidakSesuai = 0;
    let na = 0;

    let catScore: Record<string, { total: number, score: number }> = {};
    KATEGORI_KEP.forEach(k => catScore[k] = { total: 0, score: 0 });

    items.forEach(it => {
      if (it.nilai) {
        total++;
        if (it.nilai !== 'NA') {
           catScore[it.kategori].total += 10;
        }
        if (it.nilai === 'SESUAI') { 
          sesuai++; 
          catScore[it.kategori].score += 10;
        }
        if (it.nilai === 'SEBAGIAN') { 
          sebagian++;
          catScore[it.kategori].score += 5;
        }
        if (it.nilai === 'TIDAK_SESUAI') { 
          tidakSesuai++; 
        }
        if (it.nilai === 'NA') na++;
      }
    });

    const applicable = sesuai + sebagian + tidakSesuai;
    const maxScore = applicable * 10;
    const currentScore = (sesuai * 10) + (sebagian * 5);
    const persentase = maxScore === 0 ? 0 : Math.round((currentScore / maxScore) * 100);

    const pieData = [
      { name: 'Sesuai', value: sesuai, color: '#8b5cf6' },
      { name: 'Sebagian', value: sebagian, color: '#facc15' },
      { name: 'Tidak Sesuai', value: tidakSesuai, color: '#ef4444' }
    ].filter(d => d.value > 0);

    return { total, sesuai, sebagian, tidakSesuai, na, persentase, pieData };
  }, [items]);

  const trendData = [
    { name: 'Jan', nilai: 85 },
    { name: 'Feb', nilai: 86 },
    { name: 'Mar', nilai: 84 },
    { name: 'Apr', nilai: 88 },
    { name: 'Mei', nilai: stats.persentase || 90 }
  ];

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold text-sm bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm transition-all"
        >
          <ArrowLeft size={16} /> Kembali ke Menu
        </button>
        <div className="flex flex-wrap items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
          <button onClick={() => setActiveTab('form')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'form' ? 'bg-[#8b5cf6] text-white' : 'text-slate-600 hover:bg-slate-50'}`}>Checklist</button>
          <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'dashboard' ? 'bg-[#8b5cf6] text-white' : 'text-slate-600 hover:bg-slate-50'}`}>Dashboard Ringkasan</button>
          <button onClick={() => setActiveTab('history')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'history' ? 'bg-[#8b5cf6] text-white' : 'text-slate-600 hover:bg-slate-50'}`}>Riwayat</button>
        </div>
      </div>

      {activeTab === 'form' && (
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden mb-6">
        <div className="bg-violet-600 px-6 py-8 text-center text-white border-b-4 border-violet-800 relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-2xl md:text-3xl font-black tracking-wide">Supervisi Keperawatan</h1>
            <p className="mt-3 text-sm text-violet-100 font-bold tracking-widest uppercase">Bidang Keperawatan RS</p>
          </div>
        </div>

        <div className="p-6 md:p-8 bg-slate-50 border-b border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tanggal Supervisi</label>
            <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 outline-none focus:border-violet-500 shadow-sm" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Unit Keperawatan</label>
            <select value={unit} onChange={(e) => setUnit(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 outline-none focus:border-violet-500 shadow-sm">
              <option value="">-- Pilih Unit --</option>
              {['Ranap Aisyah', 'Ranap Fatimah', 'Ranap Khadijah', 'ICU', 'IGD', 'Poliklinik'].map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Supervisor (KaBid/Kasi)</label>
            <input type="text" value={supervisor} onChange={(e) => setSupervisor(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 outline-none focus:border-violet-500 shadow-sm" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="bg-slate-100 text-slate-600 border-b-2 border-slate-200">
              <tr>
                <th className="p-4 text-xs font-extrabold w-12 text-center uppercase tracking-wider border-r border-slate-200">No</th>
                <th className="p-4 text-xs font-extrabold w-[15%] uppercase tracking-wider border-r border-slate-200">Kategori</th>
                <th className="p-4 text-xs font-extrabold w-[30%] uppercase tracking-wider border-r border-slate-200">Item Supervisi</th>
                <th className="p-4 text-xs font-extrabold w-[25%] text-center uppercase tracking-wider border-r border-slate-200">Penilaian</th>
                <th className="p-4 text-xs font-extrabold uppercase tracking-wider border-r border-slate-200">Catatan</th>
                <th className="p-4 text-xs font-extrabold w-24 text-center uppercase tracking-wider">Bukti</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={item.id} className="border-b border-slate-100 hover:bg-violet-50/30 transition-colors">
                  <td className="p-4 border-r border-slate-100 text-center text-sm font-bold text-slate-400 align-top">{idx + 1}</td>
                  <td className="p-4 border-r border-slate-100 text-xs font-bold text-violet-700 align-top">
                     <div className="bg-violet-50 px-2 py-1.5 rounded-md inline-block">{item.kategori}</div>
                  </td>
                  <td className="p-4 border-r border-slate-100 text-sm font-semibold text-slate-700 align-top leading-relaxed">{item.uraian}</td>
                  <td className="p-3 border-r border-slate-100 align-top">
                    <div className="grid grid-cols-4 gap-1 h-full">
                       <button onClick={() => updateItem(item.id, 'nilai', 'SESUAI')} className={`flex flex-col items-center justify-center p-2 rounded-lg border ${item.nilai === 'SESUAI' ? 'bg-violet-100 border-violet-400 text-violet-700' : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'}`}>
                          <Check size={16} className="mb-1" />
                          <span className="text-[10px] font-bold">Sesuai</span>
                       </button>
                       <button onClick={() => updateItem(item.id, 'nilai', 'SEBAGIAN')} className={`flex flex-col items-center justify-center p-2 rounded-lg border ${item.nilai === 'SEBAGIAN' ? 'bg-amber-100 border-amber-400 text-amber-700' : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'}`}>
                          <AlertTriangle size={16} className="mb-1" />
                          <span className="text-[10px] font-bold">Sebagian</span>
                       </button>
                       <button onClick={() => updateItem(item.id, 'nilai', 'TIDAK_SESUAI')} className={`flex flex-col items-center justify-center p-2 rounded-lg border ${item.nilai === 'TIDAK_SESUAI' ? 'bg-rose-100 border-rose-400 text-rose-700' : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'}`}>
                          <X size={16} className="mb-1" />
                          <span className="text-[10px] font-bold">Tidak</span>
                       </button>
                       <button onClick={() => updateItem(item.id, 'nilai', 'NA')} className={`flex flex-col items-center justify-center p-2 rounded-lg border ${item.nilai === 'NA' ? 'bg-slate-200 border-slate-400 text-slate-700' : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'}`}>
                          <Minus size={16} className="mb-1" />
                          <span className="text-[10px] font-bold">N/A</span>
                       </button>
                    </div>
                  </td>
                  <td className="p-3 border-r border-slate-100 align-top">
                    <textarea value={item.catatan} onChange={(e) => updateItem(item.id, 'catatan', e.target.value)} placeholder="Catatan..." className="w-full h-16 resize-none bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-violet-500 placeholder:text-slate-400" />
                  </td>
                  <td className="p-3 align-top text-center">
                    {item.bukti ? (
                      <div className="flex flex-col items-center gap-1">
                        <FileText size={24} className="text-violet-600" />
                        <span className="text-[10px] text-violet-600 font-bold px-2 py-1 bg-violet-50 rounded-full line-clamp-1 truncate w-20">{item.bukti}</span>
                        <button onClick={() => updateItem(item.id, 'bukti', '')} className="text-[10px] text-rose-500 font-bold hover:underline">Hapus</button>
                      </div>
                    ) : (
                      <button onClick={() => handleFileUpload(item.id)} className="w-full h-16 flex flex-col items-center justify-center gap-1 border-2 border-dashed border-slate-300 rounded-lg text-slate-400 hover:bg-slate-50 hover:border-violet-400 hover:text-violet-500 transition-colors">
                        <UploadCloud size={20} />
                        <span className="text-[10px] font-bold">Upload</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white p-6 border-t border-slate-200 flex justify-end gap-4">
           <button className="px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors">Simpan Draft</button>
           <button onClick={() => { alert('Data Tersimpan!'); setActiveTab('dashboard'); }} className="flex items-center gap-2 px-8 py-3 bg-[#8b5cf6] text-white font-bold rounded-xl hover:bg-violet-700 shadow-lg shadow-violet-500/30 transition-all">
              <Save size={18} /> Simpan & Lanjutkan
           </button>
        </div>
      </div>
      )}

      {activeTab === 'dashboard' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm text-center">
                 <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Total Item</p>
                 <p className="text-3xl font-black text-slate-800">{stats.total}</p>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-violet-200 bg-violet-50 shadow-sm text-center">
                 <p className="text-[10px] font-bold text-violet-700 uppercase mb-1">Sesuai</p>
                 <p className="text-3xl font-black text-violet-600">{stats.sesuai}</p>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-amber-200 bg-amber-50 shadow-sm text-center">
                 <p className="text-[10px] font-bold text-amber-700 uppercase mb-1">Sebagian</p>
                 <p className="text-3xl font-black text-amber-600">{stats.sebagian}</p>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-rose-200 bg-rose-50 shadow-sm text-center">
                 <p className="text-[10px] font-bold text-rose-700 uppercase mb-1">Tidak Sesuai</p>
                 <p className="text-3xl font-black text-rose-600">{stats.tidakSesuai}</p>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm text-center">
                 <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">N/A</p>
                 <p className="text-3xl font-black text-slate-600">{stats.na}</p>
              </div>
              <div className="bg-slate-900 rounded-2xl p-4 shadow-md text-center flex flex-col justify-center">
                 <p className="text-[10px] font-bold text-slate-300 uppercase mb-1">Kepatuhan Keperawatan</p>
                 <p className={`text-3xl font-black ${stats.persentase >= 85 ? 'text-emerald-400' : stats.persentase >= 70 ? 'text-amber-400' : 'text-rose-400'}`}>{stats.persentase}%</p>
              </div>
           </div>

           <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                 <h3 className="text-base font-bold text-slate-800 mb-6 text-center">Distribusi Hasil Supervisi Kep</h3>
                 <div className="h-64">
                   <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                       <Pie data={stats.pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                         {stats.pieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                       </Pie>
                       <RechartsTooltip />
                     </PieChart>
                   </ResponsiveContainer>
                 </div>
              </div>
              
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                 <h3 className="text-base font-bold text-slate-800 mb-6">Trend Kepatuhan Bulanan</h3>
                 <div className="h-64">
                   <ResponsiveContainer width="100%" height="100%">
                     <LineChart data={trendData}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                       <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
                       <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#64748b' }} />
                       <RechartsTooltip />
                       <Line type="monotone" dataKey="nilai" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6' }} activeDot={{ r: 6 }} />
                     </LineChart>
                   </ResponsiveContainer>
                 </div>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 animate-in slide-in-from-bottom-4 duration-500">
           <h3 className="text-lg font-black text-slate-800 mb-6">Riwayat Supervisi Keperawatan</h3>
           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                 <thead className="bg-slate-100 text-slate-600 border-b border-slate-200 sticky top-0">
                    <tr>
                       <th className="p-4 text-xs font-bold uppercase">Tanggal</th>
                       <th className="p-4 text-xs font-bold uppercase">Unit</th>
                       <th className="p-4 text-xs font-bold uppercase">Skor</th>
                       <th className="p-4 text-xs font-bold uppercase">Status</th>
                    </tr>
                 </thead>
                 <tbody>
                    <tr className="border-b border-slate-100 hover:bg-slate-50">
                       <td className="p-4 text-sm font-bold text-slate-700">{tanggal}</td>
                       <td className="p-4 text-sm font-bold text-slate-700">{unit || 'Ranap Aisyah'}</td>
                       <td className="p-4 text-sm font-bold text-violet-600">{stats.persentase || 90}%</td>
                       <td className="p-4"><span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-bold">Selesai</span></td>
                    </tr>
                 </tbody>
              </table>
           </div>
        </div>
      )}
    </div>
  );
}
