import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, Save, Printer, Download, Clock, Calculator, Activity, 
  CheckCircle2, AlertTriangle, ShieldAlert, UploadCloud, FileText, 
  Check, X, Minus, Info
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, Legend, ResponsiveContainer, RadarChart, 
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line 
} from 'recharts';

interface FormSupervisiPPIProps {
  onBack: () => void;
  onViewRiwayat: () => void;
}

type NilaiPPI = 'SESUAI' | 'SEBAGIAN' | 'TIDAK_SESUAI' | 'NA' | null;

interface PPIItem {
  id: string;
  kategori: string;
  uraian: string;
  nilai: NilaiPPI;
  catatan: string;
  bukti: string; // just a mock string for file name if uploaded
}

const KATEGORI_PPI = [
  'Kebersihan Tangan',
  'Penggunaan APD',
  'Kewaspadaan Isolasi',
  'Pengelolaan Limbah',
  'Pengelolaan Linen',
  'Dekontaminasi & Sterilisasi',
  'Pengendalian Lingkungan',
  'Surveilans HAIs',
  'Edukasi Pasien & Keluarga',
  'Ketersediaan Dokumen PPI'
];

const INITIAL_ITEMS: PPIItem[] = [
  { id: '1', kategori: 'Kebersihan Tangan', uraian: 'Fasilitas cuci tangan tersedia dan berfungsi baik (Wastafel, air mengalir, sabun, hand towel)', nilai: null, catatan: '', bukti: '' },
  { id: '2', kategori: 'Kebersihan Tangan', uraian: 'Handrub tersedia di setiap titik perawatan (Point of Care)', nilai: null, catatan: '', bukti: '' },
  { id: '3', kategori: 'Kebersihan Tangan', uraian: 'Kepatuhan 5 Momen Kebersihan Tangan oleh petugas', nilai: null, catatan: '', bukti: '' },
  { id: '4', kategori: 'Penggunaan APD', uraian: 'Ketersediaan APD lengkap sesuai standar di ruangan', nilai: null, catatan: '', bukti: '' },
  { id: '5', kategori: 'Penggunaan APD', uraian: 'Petugas menggunakan APD sesuai indikasi dan transmisi penyakit', nilai: null, catatan: '', bukti: '' },
  { id: '6', kategori: 'Kewaspadaan Isolasi', uraian: 'Terdapat ruang isolasi (airborne/droplet) yang memenuhi standar', nilai: null, catatan: '', bukti: '' },
  { id: '7', kategori: 'Pengelolaan Limbah', uraian: 'Pemisahan limbah infeksius dan non-infeksius dilakukan dengan benar', nilai: null, catatan: '', bukti: '' },
  { id: '8', kategori: 'Pengelolaan Limbah', uraian: 'Tempat sampah tertutup dan menggunakan pedal injak', nilai: null, catatan: '', bukti: '' },
  { id: '9', kategori: 'Pengelolaan Linen', uraian: 'Pemisahan linen infeksius dan non-infeksius dengan kantong berbeda', nilai: null, catatan: '', bukti: '' },
  { id: '10', kategori: 'Dekontaminasi & Sterilisasi', uraian: 'Pembersihan alat medis (pre-cleaning) sesuai standar sebelum dikirim ke CSSD', nilai: null, catatan: '', bukti: '' },
  { id: '11', kategori: 'Pengendalian Lingkungan', uraian: 'Pembersihan ruangan (High Touch Area) dilakukan rutin', nilai: null, catatan: '', bukti: '' },
  { id: '12', kategori: 'Surveilans HAIs', uraian: 'Data surveilans infeksi (VAP, IAD, ISK, IDO) diisi dengan rutin dan dilaporkan', nilai: null, catatan: '', bukti: '' },
  { id: '13', kategori: 'Edukasi Pasien & Keluarga', uraian: 'Terdapat edukasi kebersihan tangan dan etika batuk kepada pasien/keluarga', nilai: null, catatan: '', bukti: '' },
  { id: '14', kategori: 'Ketersediaan Dokumen PPI', uraian: 'SPO PPI tersedia di unit dan mudah diakses oleh staf', nilai: null, catatan: '', bukti: '' }
];

export default function FormSupervisiPPI({ onBack, onViewRiwayat }: FormSupervisiPPIProps) {
  const [items, setItems] = useState<PPIItem[]>(INITIAL_ITEMS);
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [unit, setUnit] = useState('');
  const [supervisor, setSupervisor] = useState('Tim PPI');
  const [pjUnit, setPjUnit] = useState('');
  
  // RTL State
  const [rtl, setRtl] = useState({
    kesimpulan: '',
    program: '',
    pic: '',
    target: '',
    prioritas: 'Menengah',
    status: 'Draft',
    tglMonitoring: ''
  });

  const [activeTab, setActiveTab] = useState<'form' | 'dashboard' | 'history'>('form');

  const updateItem = (id: string, field: keyof PPIItem, value: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleFileUpload = (id: string) => {
    const fileName = `bukti_${id}_${Math.floor(Math.random()*1000)}.jpg`;
    updateItem(id, 'bukti', fileName);
  };

  // Calculations
  const stats = useMemo(() => {
    let total = 0;
    let sesuai = 0;
    let sebagian = 0;
    let tidakSesuai = 0;
    let na = 0;

    let catScore: Record<string, { total: number, score: number }> = {};
    KATEGORI_PPI.forEach(k => catScore[k] = { total: 0, score: 0 });

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
          catScore[it.kategori].score += 0;
        }
        if (it.nilai === 'NA') na++;
      }
    });

    const applicable = sesuai + sebagian + tidakSesuai;
    const maxScore = applicable * 10;
    const currentScore = (sesuai * 10) + (sebagian * 5);
    const persentase = maxScore === 0 ? 0 : Math.round((currentScore / maxScore) * 100);

    const radarData = KATEGORI_PPI.map(k => {
      const c = catScore[k];
      return {
        subject: k,
        A: c.total > 0 ? Math.round((c.score / c.total) * 100) : 0,
        fullMark: 100
      };
    }).filter(d => d.A > 0 || total > 5);

    const barData = KATEGORI_PPI.map(k => {
      const c = catScore[k];
      return {
        name: k.substring(0, 15) + (k.length > 15 ? '...' : ''),
        Kepatuhan: c.total > 0 ? Math.round((c.score / c.total) * 100) : 0
      };
    }).filter(d => d.Kepatuhan > 0 || total > 5);

    const pieData = [
      { name: 'Sesuai', value: sesuai, color: '#10b981' },
      { name: 'Sebagian', value: sebagian, color: '#f59e0b' },
      { name: 'Tidak Sesuai', value: tidakSesuai, color: '#ef4444' }
    ].filter(d => d.value > 0);

    // Get lowest category
    let lowestCat = '';
    let lowestScore = 100;
    radarData.forEach(d => {
      if (d.A < lowestScore && d.A > 0) {
        lowestScore = d.A;
        lowestCat = d.subject;
      }
    });

    return { 
      total, sesuai, sebagian, tidakSesuai, na, persentase, 
      radarData, barData, pieData, lowestCat, lowestScore
    };
  }, [items]);

  // Auto Analysis text
  const getAutoAnalysis = () => {
    if (stats.total === 0) return 'Silakan isi checklist supervisi untuk mendapatkan analisa otomatis.';
    
    let analysis = `Supervisi PPI telah dilakukan di unit ${unit || 'terpilih'} pada tanggal ${tanggal}. Tingkat kepatuhan keseluruhan mencapai ${stats.persentase}%.`;
    
    if (stats.lowestCat) {
      analysis += ` Area yang paling memerlukan perbaikan adalah "${stats.lowestCat}" dengan tingkat kepatuhan ${stats.lowestScore}%.`;
    }

    if (stats.persentase >= 85) {
      analysis += ' Secara umum kepatuhan PPI sudah sangat baik. Pertahankan kedisiplinan staf dan lakukan monitoring berkala.';
    } else if (stats.persentase >= 70) {
      analysis += ' Kepatuhan PPI cukup baik namun masih ada gap yang perlu ditutup, terutama terkait konsistensi pelaksanaan SPO.';
    } else {
      analysis += ' Peringatan: Kepatuhan PPI di unit ini masih di bawah standar. Diperlukan intervensi segera dan re-edukasi staf.';
    }

    return analysis;
  };

  const trendData = [
    { name: 'Jan', nilai: 75 },
    { name: 'Feb', nilai: 78 },
    { name: 'Mar', nilai: 82 },
    { name: 'Apr', nilai: 79 },
    { name: 'Mei', nilai: stats.persentase || 85 }
  ];

  const handleSave = () => {
    alert('Data Supervisi PPI Berhasil Disimpan!');
    setActiveTab('dashboard');
  };

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Top Actions */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold text-sm bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm transition-all"
        >
          <ArrowLeft size={16} />
          Kembali ke Menu
        </button>
        
        <div className="flex flex-wrap items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
          <button 
            onClick={() => setActiveTab('form')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'form' ? 'bg-[#007A4D] text-white' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            Checklist
          </button>
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'dashboard' ? 'bg-[#007A4D] text-white' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            Dashboard Ringkasan
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'history' ? 'bg-[#007A4D] text-white' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            Riwayat
          </button>
        </div>
      </div>

      {activeTab === 'form' && (
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden mb-6">
        {/* Title Header */}
        <div className="bg-emerald-700 px-6 py-8 text-center text-white border-b-4 border-emerald-900 relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-2xl md:text-3xl font-black tracking-wide">Supervisi Pencegahan dan Pengendalian Infeksi (PPI)</h1>
            <p className="mt-3 text-sm text-emerald-100 font-bold tracking-widest uppercase">UOBK RSUD AL-MULK KOTA SUKABUMI</p>
          </div>
          <div className="absolute top-0 right-0 p-8 opacity-10">
             <ShieldAlert size={120} />
          </div>
        </div>

        {/* Input Header Area */}
        <div className="p-6 md:p-8 bg-slate-50 border-b border-slate-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tanggal Supervisi</label>
            <input 
              type="date" 
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Unit / Ruangan</label>
            <select 
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-sm"
            >
              <option value="">-- Pilih Unit --</option>
              {['IGD', 'ICU', 'IBS', 'Rawat Inap', 'Poliklinik', 'Laboratorium', 'Radiologi', 'Gizi'].map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Supervisor</label>
            <input 
              type="text" 
              value={supervisor}
              onChange={(e) => setSupervisor(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Penanggung Jawab Unit</label>
            <input 
              type="text" 
              value={pjUnit}
              onChange={(e) => setPjUnit(e.target.value)}
              placeholder="Nama Karu/Kainst"
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-sm"
            />
          </div>
        </div>

        {/* Dynamic Checklist Table */}
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
                <tr key={item.id} className="border-b border-slate-100 hover:bg-emerald-50/30 transition-colors">
                  <td className="p-4 border-r border-slate-100 text-center text-sm font-bold text-slate-400 align-top">{idx + 1}</td>
                  <td className="p-4 border-r border-slate-100 text-xs font-bold text-emerald-700 align-top">
                     <div className="bg-emerald-50 px-2 py-1.5 rounded-md inline-block">{item.kategori}</div>
                  </td>
                  <td className="p-4 border-r border-slate-100 text-sm font-semibold text-slate-700 align-top leading-relaxed">{item.uraian}</td>
                  <td className="p-3 border-r border-slate-100 align-top">
                    <select
                      value={item.nilai === null ? '' : item.nilai}
                      onChange={(e) => updateItem(item.id, 'nilai', e.target.value === '' ? null : e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-2 text-sm font-bold text-slate-700 outline-none focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20"
                    >
                      <option value="">Pilih</option>
                      <option value="SESUAI">10 (Sesuai)</option>
                      <option value="SEBAGIAN">5 (Sebagian)</option>
                      <option value="TIDAK_SESUAI">0 (Tidak)</option>
                      <option value="NA">N/A</option>
                    </select>
                  </td>
                  <td className="p-3 border-r border-slate-100 align-top">
                    <textarea 
                      value={item.catatan}
                      onChange={(e) => updateItem(item.id, 'catatan', e.target.value)}
                      placeholder="Catatan..."
                      className="w-full h-16 resize-none bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-400"
                    />
                  </td>
                  <td className="p-3 align-top text-center">
                    {item.bukti ? (
                      <div className="flex flex-col items-center gap-1">
                        <FileText size={24} className="text-emerald-600" />
                        <span className="text-[10px] text-emerald-600 font-bold px-2 py-1 bg-emerald-50 rounded-full line-clamp-1 truncate w-20">{item.bukti}</span>
                        <button onClick={() => updateItem(item.id, 'bukti', '')} className="text-[10px] text-rose-500 font-bold hover:underline">Hapus</button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleFileUpload(item.id)}
                        className="w-full h-16 flex flex-col items-center justify-center gap-1 border-2 border-dashed border-slate-300 rounded-lg text-slate-400 hover:bg-slate-50 hover:border-emerald-400 hover:text-emerald-500 transition-colors"
                      >
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

        {/* Conclusion and Action Plan */}
        <div className="p-6 md:p-8 bg-slate-50 border-t border-slate-200">
           <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
              <CheckCircle2 className="text-emerald-600" />
              Kesimpulan & Rencana Tindak Lanjut (RTL)
           </h3>
           <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                 <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Kesimpulan Supervisi</label>
                    <textarea 
                      value={rtl.kesimpulan}
                      onChange={e => setRtl({...rtl, kesimpulan: e.target.value})}
                      placeholder="Masukkan kesimpulan umum..."
                      className="w-full h-32 resize-none bg-white border border-slate-200 rounded-xl p-4 text-sm font-medium text-slate-700 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                 </div>
                 <button 
                   onClick={() => setRtl({...rtl, kesimpulan: getAutoAnalysis()})}
                   className="w-full py-2.5 bg-emerald-50 text-emerald-700 font-bold text-sm rounded-xl border border-emerald-200 hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2"
                 >
                   <Activity size={16} /> Generate Kesimpulan Otomatis
                 </button>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                 <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Program Perbaikan / RTL</label>
                    <input 
                      value={rtl.program} onChange={e => setRtl({...rtl, program: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium outline-none focus:border-emerald-500" 
                    />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-1">PIC</label>
                      <input 
                        value={rtl.pic} onChange={e => setRtl({...rtl, pic: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium outline-none focus:border-emerald-500" 
                      />
                   </div>
                   <div>
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Target Penyelesaian</label>
                      <input 
                        type="date"
                        value={rtl.target} onChange={e => setRtl({...rtl, target: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium outline-none focus:border-emerald-500" 
                      />
                   </div>
                   <div>
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Prioritas</label>
                      <select 
                        value={rtl.prioritas} onChange={e => setRtl({...rtl, prioritas: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium outline-none focus:border-emerald-500" 
                      >
                         <option>Tinggi</option><option>Menengah</option><option>Rendah</option>
                      </select>
                   </div>
                   <div>
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Status Workflow</label>
                      <select 
                        value={rtl.status} onChange={e => setRtl({...rtl, status: e.target.value})}
                        className="w-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500" 
                      >
                         <option value="Draft">Draft</option>
                         <option value="Menunggu Validasi">Menunggu Validasi</option>
                         <option value="Revisi">Revisi</option>
                         <option value="Selesai">Selesai</option>
                      </select>
                   </div>
                 </div>
              </div>
           </div>
        </div>
        
        {/* Save Footer */}
        <div className="bg-white p-6 border-t border-slate-200 flex justify-end gap-4">
           <button className="px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors">
              Simpan Draft
           </button>
           <button 
             onClick={handleSave}
             className="flex items-center gap-2 px-8 py-3 bg-[#007A4D] text-white font-bold rounded-xl hover:bg-[#005F3A] shadow-lg shadow-emerald-500/30 transition-all"
           >
              <Save size={18} />
              Simpan & Lanjutkan
           </button>
        </div>
      </div>
      )}

      {/* DASHBOARD TAB */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
           {/* Counters */}
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm text-center">
                 <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Total Item</p>
                 <p className="text-3xl font-black text-slate-800">{stats.total}</p>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-emerald-200 bg-emerald-50 shadow-sm text-center">
                 <p className="text-[10px] font-bold text-emerald-700 uppercase mb-1">Sesuai</p>
                 <p className="text-3xl font-black text-emerald-600">{stats.sesuai}</p>
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
                 <p className="text-[10px] font-bold text-slate-300 uppercase mb-1">Kepatuhan PPI</p>
                 <p className={`text-3xl font-black ${stats.persentase >= 85 ? 'text-emerald-400' : stats.persentase >= 70 ? 'text-amber-400' : 'text-rose-400'}`}>
                   {stats.persentase}%
                 </p>
              </div>
           </div>

           {/* Charts */}
           <div className="grid lg:grid-cols-2 gap-6">
              
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                 <h3 className="text-base font-bold text-slate-800 mb-6 text-center">Distribusi Hasil Supervisi</h3>
                 <div className="h-64">
                   <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                       <Pie
                         data={stats.pieData}
                         cx="50%"
                         cy="50%"
                         innerRadius={60}
                         outerRadius={90}
                         paddingAngle={5}
                         dataKey="value"
                         label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                       >
                         {stats.pieData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.color} />
                         ))}
                       </Pie>
                       <RechartsTooltip />
                     </PieChart>
                   </ResponsiveContainer>
                 </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                 <h3 className="text-base font-bold text-slate-800 mb-6 text-center">Analisa Area PPI (Radar)</h3>
                 <div className="h-64">
                   <ResponsiveContainer width="100%" height="100%">
                     <RadarChart cx="50%" cy="50%" outerRadius="70%" data={stats.radarData}>
                       <PolarGrid stroke="#e2e8f0" />
                       <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
                       <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                       <Radar name="Kepatuhan" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
                       <RechartsTooltip />
                     </RadarChart>
                   </ResponsiveContainer>
                 </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2">
                 <h3 className="text-base font-bold text-slate-800 mb-6">Kepatuhan Per Kategori PPI</h3>
                 <div className="h-80">
                   <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={stats.barData} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                       <XAxis dataKey="name" angle={-45} textAnchor="end" tick={{ fontSize: 11, fill: '#64748b' }} interval={0} />
                       <YAxis tick={{ fontSize: 11, fill: '#64748b' }} domain={[0, 100]} />
                       <RechartsTooltip cursor={{ fill: '#f8fafc' }} />
                       <Bar dataKey="Kepatuhan" fill="#007A4D" radius={[4, 4, 0, 0]} maxBarSize={50} />
                     </BarChart>
                   </ResponsiveContainer>
                 </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2">
                 <h3 className="text-base font-bold text-slate-800 mb-6">Trend Kepatuhan PPI Bulanan</h3>
                 <div className="h-64">
                   <ResponsiveContainer width="100%" height="100%">
                     <LineChart data={trendData}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                       <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
                       <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#64748b' }} />
                       <RechartsTooltip />
                       <Line type="monotone" dataKey="nilai" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
                     </LineChart>
                   </ResponsiveContainer>
                 </div>
              </div>

           </div>
        </div>
      )}

      {/* HISTORY TAB */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 animate-in slide-in-from-bottom-4 duration-500">
           <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
              <h3 className="text-lg font-black text-slate-800">Riwayat Supervisi PPI</h3>
              <div className="flex gap-2">
                 <select className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium outline-none">
                   <option>Tahun 2024</option>
                 </select>
                 <select className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium outline-none">
                   <option>Semua Bulan</option>
                   <option>Mei</option>
                 </select>
                 <select className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium outline-none">
                   <option>Semua Unit</option>
                   <option>IGD</option>
                 </select>
              </div>
           </div>

           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                 <thead className="bg-slate-100 text-slate-600 border-b border-slate-200 sticky top-0">
                    <tr>
                       <th className="p-4 text-xs font-bold uppercase tracking-wider">Tanggal</th>
                       <th className="p-4 text-xs font-bold uppercase tracking-wider">Unit</th>
                       <th className="p-4 text-xs font-bold uppercase tracking-wider">Supervisor</th>
                       <th className="p-4 text-xs font-bold uppercase tracking-wider">Skor Kepatuhan</th>
                       <th className="p-4 text-xs font-bold uppercase tracking-wider">Status Validasi</th>
                       <th className="p-4 text-xs font-bold uppercase tracking-wider text-right">Aksi</th>
                    </tr>
                 </thead>
                 <tbody>
                    <tr className="border-b border-slate-100 hover:bg-slate-50">
                       <td className="p-4 text-sm font-bold text-slate-700">{tanggal}</td>
                       <td className="p-4 text-sm font-bold text-slate-700">{unit || 'IGD'}</td>
                       <td className="p-4 text-sm text-slate-600">{supervisor}</td>
                       <td className="p-4">
                         <div className="flex items-center gap-2">
                           <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                             <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${stats.persentase || 85}%` }}></div>
                           </div>
                           <span className="text-sm font-bold text-slate-700">{stats.persentase || 85}%</span>
                         </div>
                       </td>
                       <td className="p-4">
                         <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-bold">Menunggu Validasi</span>
                       </td>
                       <td className="p-4 text-right">
                          <button className="text-xs font-bold text-emerald-600 hover:underline mr-3">Detail</button>
                          <button className="text-xs font-bold text-blue-600 hover:underline mr-3">Edit</button>
                          <button className="text-xs font-bold text-slate-500 hover:underline">PDF</button>
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
