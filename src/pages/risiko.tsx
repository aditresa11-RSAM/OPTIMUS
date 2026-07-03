import React, { useState, useMemo, useEffect } from "react";
import { 
  Shield, 
  Activity, 
  AlertTriangle, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  TrendingUp,
  PlusCircle,
  Search,
  Filter,
  Edit2,
  Trash2,
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  Info,
  Building2,
  X,
  PieChart as PieChartIcon
} from "lucide-react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";
import { motion, AnimatePresence } from "motion/react";
import Head from "next/head";
import { supabase } from "@/lib/supabase";
import { useStore } from "@/store/useStore";

// --- Types & Interfaces ---
export type RiskGrading = 'Low' | 'Moderate' | 'High' | 'Extreme';

export interface RiskRecord {
  id: string;
  tahun: string;
  unit: string;
  risiko: string;
  penyebab: string;
  severity: number;
  probability: number;
  riskScore: number;
  pengelolaan: string;
  pic: string;
  grading: RiskGrading;
  createdAt: string;
  updatedAt: string;
}

// --- Helpers ---
export const getRiskGrading = (p: number, s: number): RiskGrading => {
  if (p <= 2) {
    if (s <= 2) return 'Low';
    if (s === 3) return 'Moderate';
    if (s === 4) return 'High';
    return 'Extreme';
  }
  if (p === 3) {
    if (s === 1) return 'Low';
    if (s === 2) return 'Moderate';
    if (s === 3) return 'High';
    return 'Extreme';
  }
  if (p >= 4) {
    if (s <= 2) return 'Moderate';
    if (s === 3) return 'High';
    return 'Extreme';
  }
  return 'Low';
};

const getBadgeColor = (grading: RiskGrading) => {
  switch (grading) {
    case 'Low': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'Moderate': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'High': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'Extreme': return 'bg-red-100 text-red-700 border-red-200';
    default: return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const CHART_COLORS = {
  Low: '#3b82f6', // blue-500
  Moderate: '#10b981', // emerald-500
  High: '#eab308', // yellow-500
  Extreme: '#ef4444' // red-500
};



// --- Mock Data ---
const initialData: RiskRecord[] = [];

// --- Components ---
const SummaryCard = ({ title, value, icon: Icon, shadowClass, textClass }: any) => {
  return (
    <motion.div 
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
      className={`bg-white/80 backdrop-blur-xl p-6 rounded-[24px] shadow-lg ${shadowClass} flex flex-col justify-between relative overflow-hidden group min-h-[140px]`}
    >
      <div className="flex justify-between items-start w-full relative z-10">
        <div className="space-y-1">
          <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">{title}</p>
          <p className="text-4xl font-black text-slate-800 tracking-tight">{value}</p>
        </div>
        <div className={`flex items-center justify-center ${textClass}`}>
          <Icon size={36} strokeWidth={2.5} />
        </div>
      </div>
    </motion.div>
  );
};

export default function ManajemenRisiko() {
  const { units, addUnit, deleteUnit } = useStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [newUnitName, setNewUnitName] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'data' | 'input'>('dashboard');
  const [records, setRecords] = useState<RiskRecord[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("manajemen_risiko");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Error reading manajemen_risiko from localStorage:", e);
        }
      }
    }
    return [];
  });

  useEffect(() => {
    const fetchRecords = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.from('manajemen_risiko').select('*');
        if (data && !error) {
          const mapped = data.map(d => ({
            id: d.id,
            tahun: d.tahun,
            unit: d.unit,
            risiko: d.risiko,
            penyebab: d.penyebab,
            severity: d.severity,
            probability: d.probability,
            riskScore: d.risk_score,
            pengelolaan: d.pengelolaan,
            pic: d.pic,
            grading: d.grading,
            createdAt: d.created_at,
            updatedAt: d.updated_at
          }));
          setRecords(mapped);
          if (typeof window !== "undefined") {
            localStorage.setItem("manajemen_risiko", JSON.stringify(mapped));
          }
        } else if (error) {
          console.warn("Supabase load failed, utilizing localStorage fallback.", error);
        }
      } catch (err) {
        console.error("Supabase load error:", err);
      }
      setIsLoading(false);
    };
    fetchRecords();
  }, []);
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<RiskRecord>>({
    tahun: new Date().getFullYear().toString(),
    unit: '',
    risiko: '',
    penyebab: '',
    severity: 1,
    probability: 1,
    pengelolaan: '',
    pic: ''
  });
  
  // Data Table State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrading, setFilterGrading] = useState<string>('All');
  const [filterUnit, setFilterUnit] = useState<string>('All');
  
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<RiskRecord | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);

  // --- Derived Data for Dashboard ---
  const totalUnits = units.length;
  const unitsFilled = useMemo(() => new Set(records.map(r => r.unit)).size, [records]);
  const unitsNotFilled = totalUnits - unitsFilled;
  const totalRisks = records.length;
  const extremeRisks = records.filter(r => r.grading === 'Extreme').length;
  const avgRiskScore = records.length ? (records.reduce((acc, curr) => acc + curr.riskScore, 0) / records.length).toFixed(1) : '0';

  const distributionData = useMemo(() => {
    const counts = { Low: 0, Moderate: 0, High: 0, Extreme: 0 };
    records.forEach(r => { counts[r.grading]++; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [records]);

  // --- Derived Data for Table ---
  const filteredRecords = useMemo(() => {
    return records
      .filter(r => filterGrading === 'All' ? true : r.grading === filterGrading)
      .filter(r => filterUnit === 'All' ? true : r.unit === filterUnit)
      .filter(r => 
        r.risiko.toLowerCase().includes(searchTerm.toLowerCase()) || 
        r.penyebab.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => b.riskScore - a.riskScore); // Peringkat otomatis dari skor terbesar
  }, [records, filterGrading, filterUnit, searchTerm]);

  // --- Handlers ---
  const handleSeverityProbabilityChange = (field: 'severity' | 'probability', value: number) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      const s = updated.severity || 1;
      const p = updated.probability || 1;
      updated.riskScore = s * p;
      updated.grading = getRiskGrading(p, s);
      return updated;
    });
  };

  const handleSave = () => {
    const s = formData.severity || 1;
    const p = formData.probability || 1;
    const score = s * p;
    const grade = getRiskGrading(p, s);
    
    const newRecord: RiskRecord = {
      id: editingId || Date.now().toString(),
      tahun: formData.tahun || new Date().getFullYear().toString(),
      unit: formData.unit || '',
      risiko: formData.risiko || '',
      penyebab: formData.penyebab || '',
      severity: s,
      probability: p,
      riskScore: score,
      pengelolaan: formData.pengelolaan || '',
      pic: formData.pic || '',
      grading: grade,
      createdAt: editingId ? (records.find(r => r.id === editingId)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Update local state and local storage immediately so it survives refresh
    let updatedRecords: RiskRecord[] = [];
    if (editingId) {
      updatedRecords = records.map(r => r.id === editingId ? newRecord : r);
    } else {
      updatedRecords = [...records, newRecord];
    }
    
    setRecords(updatedRecords);
    if (typeof window !== "undefined") {
      localStorage.setItem("manajemen_risiko", JSON.stringify(updatedRecords));
    }

    const saveToSupabase = async (record: RiskRecord) => {
      try {
        const payload = {
          id: record.id,
          tahun: record.tahun,
          unit: record.unit,
          risiko: record.risiko,
          penyebab: record.penyebab,
          severity: record.severity,
          probability: record.probability,
          risk_score: record.riskScore,
          pengelolaan: record.pengelolaan,
          pic: record.pic,
          grading: record.grading,
          updated_at: record.updatedAt,
          created_at: record.createdAt
        };
        if (editingId) {
          await supabase.from('manajemen_risiko').update(payload).eq('id', record.id);
        } else {
          await supabase.from('manajemen_risiko').insert(payload);
        }
      } catch(e) {
        console.error("Error saving to Supabase, offline mode saved locally:", e);
      }
    };
    saveToSupabase(newRecord);

    // Reset
    setFormData({ tahun: new Date().getFullYear().toString(), unit: '', risiko: '', penyebab: '', severity: 1, probability: 1, pengelolaan: '', pic: '' });
    setEditingId(null);
    setActiveTab('data');
  };

  const handleEdit = (record: RiskRecord) => {
    setFormData({ ...record });
    setEditingId(record.id);
    setActiveTab('input');
  };

  const handleDeleteConfirm = () => {
    if (recordToDelete) {
      const updatedRecords = records.filter(r => r.id !== recordToDelete);
      setRecords(updatedRecords);
      if (typeof window !== "undefined") {
        localStorage.setItem("manajemen_risiko", JSON.stringify(updatedRecords));
      }
      
      const deleteFromSupabase = async () => {
        try {
          await supabase.from('manajemen_risiko').delete().eq('id', recordToDelete);
        } catch (e) {
          console.error("Error deleting from Supabase:", e);
        }
      };
      deleteFromSupabase();
    }
    setIsDeleteModalOpen(false);
    setRecordToDelete(null);
  };

  const handleViewDetail = (record: RiskRecord) => {
    setSelectedRecord(record);
    setIsDetailModalOpen(true);
  };

  // --- Components ---

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Head>
        <title>Manajemen Risiko - OPTIMUS</title>
      </Head>

      {/* Header & Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl md:text-3xl font-black text-[#10a37f] tracking-tight">
                Manajemen Risiko
              </h1>
            </div>
            <p className="text-gray-500 font-medium text-[12px]">
              Identifikasi, evaluasi, dan mitigasi risiko rumah sakit secara terintegrasi.
            </p>
          </div>
          
          <div className="flex bg-gray-100/80 p-1.5 rounded-2xl">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: PieChartIcon },
                { id: 'data', label: 'Data Risiko', icon: FileText },
                { id: 'input', label: editingId ? 'Edit Risiko' : 'Input Baru', icon: PlusCircle }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
                    activeTab === tab.id 
                      ? 'bg-white text-emerald-700 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                  }`}
                >
                  <tab.icon size={18} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          
          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <SummaryCard title="Total Unit" value={totalUnits} icon={Building2} shadowClass="shadow-blue-500/40" textClass="text-blue-500" />
                <SummaryCard title="Unit Sudah Mengisi" value={unitsFilled} icon={CheckCircle2} shadowClass="shadow-emerald-500/40" textClass="text-emerald-500" />
                <SummaryCard title="Unit Belum Mengisi" value={unitsNotFilled} icon={XCircle} shadowClass="shadow-orange-500/40" textClass="text-orange-500" />
                <SummaryCard title="Total Risiko" value={totalRisks} icon={AlertTriangle} shadowClass="shadow-slate-500/40" textClass="text-slate-600" />
                <SummaryCard title="Risiko Extreme" value={extremeRisks} icon={Activity} shadowClass="shadow-red-500/40" textClass="text-red-500" />
                <SummaryCard title="Rata-rata Score" value={avgRiskScore} icon={TrendingUp} shadowClass="shadow-indigo-500/40" textClass="text-indigo-500" />
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Distribusi Risiko Doughnut */}
                <div className="bg-white p-6 rounded-[20px] shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-slate-800 mb-6">Distribusi Grading Risiko</h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%" debounce={50} minWidth={0}>
                      <PieChart>
                        <Pie
                          data={distributionData}
                          innerRadius={80}
                          outerRadius={110}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {distributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[entry.name as keyof typeof CHART_COLORS]} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                        />
                        <Legend iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Grading Bar Chart */}
                <div className="bg-white p-6 rounded-[20px] shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-slate-800 mb-6">Jumlah Risiko per Grading</h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%" debounce={50} minWidth={0}>
                      <BarChart data={distributionData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} />
                        <RechartsTooltip 
                          cursor={{fill: '#f8fafc'}}
                          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                        />
                        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                          {distributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[entry.name as keyof typeof CHART_COLORS]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Circular Progress Indicators */}
                <div className="bg-white p-6 rounded-[20px] shadow-sm border border-gray-100 lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex flex-col items-center justify-center p-4">
                    <h3 className="text-lg font-bold text-slate-800 mb-8">Kepatuhan Pengisian Unit</h3>
                    <div className="relative w-48 h-48">
                      <svg className="w-full h-full" viewBox="0 0 100 100">
                        <circle className="text-gray-100 stroke-current" strokeWidth="10" cx="50" cy="50" r="40" fill="transparent"></circle>
                        <circle className="text-emerald-500 progress-ring__circle stroke-current" strokeWidth="10" strokeLinecap="round" cx="50" cy="50" r="40" fill="transparent" 
                          strokeDasharray="251.2" 
                          strokeDashoffset={251.2 - (251.2 * (unitsFilled / totalUnits))}
                          transform="rotate(-90 50 50)"
                        ></circle>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-black text-slate-800">{Math.round((unitsFilled / totalUnits) * 100)}%</span>
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Sudah Mengisi</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center p-4 border-t md:border-t-0 md:border-l border-gray-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-8">Defisit Pelaporan</h3>
                    <div className="relative w-48 h-48">
                      <svg className="w-full h-full" viewBox="0 0 100 100">
                        <circle className="text-gray-100 stroke-current" strokeWidth="10" cx="50" cy="50" r="40" fill="transparent"></circle>
                        <circle className="text-orange-400 progress-ring__circle stroke-current" strokeWidth="10" strokeLinecap="round" cx="50" cy="50" r="40" fill="transparent" 
                          strokeDasharray="251.2" 
                          strokeDashoffset={251.2 - (251.2 * (unitsNotFilled / totalUnits))}
                          transform="rotate(-90 50 50)"
                        ></circle>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-black text-slate-800">{Math.round((unitsNotFilled / totalUnits) * 100)}%</span>
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Belum Mengisi</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* DATA RISIKO TAB */}
          {activeTab === 'data' && (
            <motion.div
              key="data"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 p-6">
                
                {/* Toolbar */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                  <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                    <div className="relative">
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
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getBadgeColor(record.grading)}`}>
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
                    <label className="text-sm font-bold text-slate-700">Identifikasi Risiko</label>
                    <textarea 
                      value={formData.risiko}
                      onChange={(e) => setFormData({...formData, risiko: e.target.value})}
                      placeholder="Contoh: Kesalahan pemberian obat"
                      rows={2}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-700 resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Penyebab Terjadinya Risiko</label>
                    <textarea 
                      value={formData.penyebab}
                      onChange={(e) => setFormData({...formData, penyebab: e.target.value})}
                      placeholder="Jelaskan akar penyebab terjadinya risiko..."
                      rows={2}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-700 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 flex items-center justify-between">
                        Severity (Dampak)
                        <span className="text-xs font-normal text-slate-400">Skala 1 - 5</span>
                      </label>
                      <select 
                        value={formData.severity}
                        onChange={(e) => handleSeverityProbabilityChange('severity', Number(e.target.value))}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-700 bg-white"
                      >
                        {[1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{v}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 flex items-center justify-between">
                        Probability (Kemungkinan)
                        <span className="text-xs font-normal text-slate-400">Skala 1 - 5</span>
                      </label>
                      <select 
                        value={formData.probability}
                        onChange={(e) => handleSeverityProbabilityChange('probability', Number(e.target.value))}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-700 bg-white"
                      >
                        {[1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{v}</option>)}
                      </select>
                    </div>

                    {/* Auto Calculated Results */}
                    <div className="md:col-span-2 pt-4 flex flex-col md:flex-row gap-6 border-t border-gray-200">
                      <div className="flex-1 space-y-1">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Risk Score</span>
                        <div className="flex items-center gap-3">
                          <span className="text-4xl font-black text-slate-800">{formData.riskScore || (formData.severity || 1) * (formData.probability || 1)}</span>
                          <span className="text-sm font-medium text-slate-400">(S × P)</span>
                        </div>
                      </div>
                      <div className="flex-1 space-y-1">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Grading Risiko</span>
                        <div>
                          <span className={`inline-flex mt-1 items-center px-4 py-1.5 rounded-full text-sm font-bold border ${getBadgeColor(formData.grading || getRiskGrading(formData.probability || 1, formData.severity || 1))}`}>
                            {formData.grading || getRiskGrading(formData.probability || 1, formData.severity || 1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Pengelolaan / Mitigasi Risiko</label>
                    <textarea 
                      value={formData.pengelolaan}
                      onChange={(e) => setFormData({...formData, pengelolaan: e.target.value})}
                      placeholder="Langkah-langkah yang dilakukan untuk mengurangi dampak atau kemungkinan..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-700 resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Penanggung Jawab (PIC)</label>
                    <input 
                      type="text" 
                      value={formData.pic}
                      onChange={(e) => setFormData({...formData, pic: e.target.value})}
                      placeholder="Nama / Jabatan PIC"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-700"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-6">
                    <button 
                      onClick={() => {
                        setEditingId(null);
                        setFormData({ tahun: new Date().getFullYear().toString(), unit: '', risiko: '', penyebab: '', severity: 1, probability: 1, pengelolaan: '', pic: '' });
                        setActiveTab('data');
                      }}
                      className="px-6 py-3 rounded-xl border border-gray-200 text-slate-600 font-bold hover:bg-gray-50 transition-colors"
                    >
                      Batal
                    </button>
                    <button 
                      onClick={handleSave}
                      disabled={!formData.unit || !formData.risiko}
                      className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-emerald-600/20"
                    >
                      {editingId ? 'Simpan Perubahan' : 'Simpan Risiko'}
                    </button>
                  </div>

                </div>
              </div>

              {/* PANDUAN PENGISIAN */}
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
                          <th className="px-4 py-3 font-bold border-b border-[#0e906f] text-center">DESKRIPSI</th>
                          <th className="px-4 py-3 font-bold border-b border-[#0e906f] text-[12px] leading-[19.5px] text-center">KESELAMATAN & KESEHATAN PASIEN</th>
                          <th className="px-4 py-3 font-bold border-b border-[#0e906f] text-center">PENUNDAAN PELAYANAN</th>
                          <th className="px-4 py-3 font-bold border-b border-[#0e906f] text-center">TUNTUTAN GANTI RUGI</th>
                          <th className="px-4 py-3 font-bold border-b border-[#0e906f] text-center">DAMPAK KEUANGAN</th>
                          <th className="px-4 py-3 font-bold border-b border-[#0e906f] text-center">CONTOH DESKRIPSI</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        <tr className="bg-slate-50/50 hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-4 align-top">
                            <div className="w-full aspect-square rounded-md bg-[#0e52db] text-white flex items-center justify-center font-black text-lg">1</div>
                          </td>
                          <td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700 text-center text-[10px]">
                            <span className="font-bold block">Insignificant</span>
                            <span className="text-slate-500">(Tidak Signifikan)</span>
                          </td>
                          <td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700 text-[10px]">Tidak ada cedera</td>
                          <td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700 text-[10px]">Tidak ada penundaan</td>
                          <td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700 text-[10px]">Tidak ada tuntutan</td>
                          <td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700 text-[10px]">Tidak ada biaya tambahan</td>
                          <td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700 text-[10px]">Tidak ada efek merugikan terhadap pasien atau operasional.</td>
                        </tr>
                        <tr className="bg-[#f3faeb]/30 hover:bg-[#f3faeb]/50 transition-colors">
                          <td className="px-4 py-4 align-top">
                            <div className="w-full aspect-square rounded-md bg-[#009e4d] text-white flex items-center justify-center font-black text-lg">2</div>
                          </td>
                          <td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700 text-center text-[10px]">
                            <span className="font-bold block">Minor</span>
                            <span className="text-slate-500">(Ringan)</span>
                          </td>
                          <td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700 text-[10px]">
                            <ul className="list-disc pl-4 space-y-1">
                              <li>Cedera ringan</li>
                              <li>Dapat diatasi dengan pertolongan pertama</li>
                            </ul>
                          </td>
                          <td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700 text-[10px]">Penundaan pelayanan ≤ 1 jam</td>
                          <td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700 text-[10px]">Kemungkinan sangat kecil tuntutan</td>
                          <td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700 text-[10px]">Biaya tambahan sangat kecil</td>
                          <td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700 text-[10px]">Efek minimal, pasien pulih dengan perawatan sederhana.</td>
                        </tr>
                        <tr className="bg-[#fffdf0]/50 hover:bg-[#fffdf0]/80 transition-colors">
                          <td className="px-4 py-4 align-top">
                            <div className="w-full aspect-square rounded-md bg-[#ffce00] text-slate-900 flex items-center justify-center font-black text-lg">3</div>
                          </td>
                          <td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700 text-center text-[10px]">
                            <span className="font-bold block">Moderate</span>
                            <span className="text-slate-500">(Sedang)</span>
                          </td>
                          <td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700 text-[10px]">
                            <span className="font-semibold block mb-1">Cedera sedang</span>
                            <ul className="list-disc pl-4 space-y-1">
                              <li>Berkurangnya fungsi motorik, sensorik, psikologis atau intelektual secara reversibel</li>
                              <li>Setiap kasus yang memperpanjang perawatan</li>
                            </ul>
                          </td>
                          <td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700 text-[10px]">Penundaan pelayanan 1 - 24 jam</td>
                          <td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700 text-[10px]">Kemungkinan kecil tuntutan</td>
                          <td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700 text-[10px]">Biaya tambahan sedang</td>
                          <td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700 text-[10px]">Membutuhkan intervensi medis lebih lanjut, lama rawat bertambah.</td>
                        </tr>
                        <tr className="bg-[#fff8eb]/50 hover:bg-[#fff8eb]/80 transition-colors">
                          <td className="px-4 py-4 align-top">
                            <div className="w-full aspect-square rounded-md bg-[#ff6900] text-white flex items-center justify-center font-black text-lg">4</div>
                          </td>
                          <td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700 text-center text-[10px]">
                            <span className="font-bold block">Major</span>
                            <span className="text-slate-500">(Berat)</span>
                          </td>
                          <td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700 text-[10px]">
                            <span className="font-semibold block mb-1">Cedera berat</span>
                            <ul className="list-disc pl-4 space-y-1">
                              <li>Kehilangan fungsi utama permanen (motorik, sensorik, psikologis, intelektual) secara irreversibel</li>
                              <li>Tidak berhubungan dengan penyakit yang mendasarinya</li>
                            </ul>
                          </td>
                          <td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700 text-[10px]">Penundaan pelayanan &gt; 24 jam atau membahayakan kondisi pasien</td>
                          <td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700 text-[10px]">Kemungkinan sedang tuntutan</td>
                          <td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700 text-[10px]">Biaya tambahan besar</td>
                          <td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700 text-[10px]">Menimbulkan komplikasi serius, perawatan intensif, atau operasi besar.</td>
                        </tr>
                        <tr className="bg-[#fdf2f2]/50 hover:bg-[#fdf2f2]/80 transition-colors">
                          <td className="px-4 py-4 align-top">
                            <div className="w-full aspect-square rounded-md bg-[#d3181f] text-white flex items-center justify-center font-black text-lg">5</div>
                          </td>
                          <td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700 text-center text-[10px]">
                            <span className="font-bold block">Catastrophic</span>
                            <span className="text-slate-500">(Sangat Berat)</span>
                          </td>
                          <td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700 text-[10px]">Kematian yang tidak berhubungan dengan perjalanan penyakit yang mendasarinya</td>
                          <td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700 text-[10px]">Penundaan pelayanan menyebabkan kondisi kritis atau kematian</td>
                          <td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700 text-[10px]">Kemungkinan besar tuntutan</td>
                          <td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700 text-[10px]">Biaya tambahan sangat besar</td>
                          <td className="px-4 py-4 align-top border-l border-gray-200 text-slate-700 text-[10px]">Kematian pasien, cacat permanen, dampak sangat luas secara klinis, hukum, dan finansial.</td>
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
                          <th className="px-4 py-3 font-bold border-b border-[#0e906f] text-center">FREKUENSI</th>
                          <th className="px-4 py-3 font-bold border-b border-[#0e906f] text-center">KEJADIAN AKTUAL</th>
                          <th className="px-4 py-3 font-bold border-b border-[#0e906f] text-center">KRITERIA PERISTIWA</th>
                          <th className="px-4 py-3 font-bold border-b border-[#0e906f] text-center">PERSENTASE KEMUNGKINAN</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        <tr className="bg-slate-50/50 hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-4 align-middle">
                            <div className="w-full h-8 rounded-md bg-[#0e52db] text-white flex items-center justify-center font-black text-base">1</div>
                          </td>
                          <td className="px-4 py-4 align-middle border-l border-gray-200 font-bold text-slate-800 text-center text-[11px]">Sangat Jarang</td>
                          <td className="px-4 py-4 align-middle border-l border-gray-200 text-slate-700 text-[10px]">Dapat terjadi dalam lebih dari 5 tahun</td>
                          <td className="px-4 py-4 align-middle border-l border-gray-200 text-slate-700 text-[11px]">Belum pernah terjadi atau hampir tidak pernah terjadi dalam kondisi normal.</td>
                          <td className="px-4 py-4 align-middle border-l border-gray-200 font-bold text-[#0e52db] text-center">&lt; 1%</td>
                        </tr>
                        <tr className="bg-[#f3faeb]/30 hover:bg-[#f3faeb]/50 transition-colors">
                          <td className="px-4 py-4 align-middle">
                            <div className="w-full h-8 rounded-md bg-[#009e4d] text-white flex items-center justify-center font-black text-base">2</div>
                          </td>
                          <td className="px-4 py-4 align-middle border-l border-gray-200 font-bold text-slate-800 text-center text-[11px]">Jarang</td>
                          <td className="px-4 py-4 align-middle border-l border-gray-200 text-slate-700 text-[10px]">Dapat terjadi dalam 2 - 5 tahun</td>
                          <td className="px-4 py-4 align-middle border-l border-gray-200 text-slate-700 text-[11px]">Pernah terjadi sekali dengan interval panjang atau sangat tidak mungkin terjadi.</td>
                          <td className="px-4 py-4 align-middle border-l border-gray-200 font-bold text-[#009e4d] text-center">1% – 5%</td>
                        </tr>
                        <tr className="bg-[#fffdf0]/50 hover:bg-[#fffdf0]/80 transition-colors">
                          <td className="px-4 py-4 align-middle">
                            <div className="w-full h-8 rounded-md bg-[#ffce00] text-slate-900 flex items-center justify-center font-black text-base">3</div>
                          </td>
                          <td className="px-4 py-4 align-middle border-l border-gray-200 font-bold text-slate-800 text-center text-[11px]">Mungkin</td>
                          <td className="px-4 py-4 align-middle border-l border-gray-200 text-slate-700 text-[10px]">Dapat terjadi tiap 1 - 2 tahun</td>
                          <td className="px-4 py-4 align-middle border-l border-gray-200 text-slate-700 text-[11px]">Pernah terjadi beberapa kali dan masih mungkin terjadi.</td>
                          <td className="px-4 py-4 align-middle border-l border-gray-200 font-bold text-[#ffce00] text-center">5% – 20%</td>
                        </tr>
                        <tr className="bg-[#fff8eb]/50 hover:bg-[#fff8eb]/80 transition-colors">
                          <td className="px-4 py-4 align-middle">
                            <div className="w-full h-8 rounded-md bg-[#ff6900] text-white flex items-center justify-center font-black text-base">4</div>
                          </td>
                          <td className="px-4 py-4 align-middle border-l border-gray-200 font-bold text-slate-800 text-center text-[11px]">Sering</td>
                          <td className="px-4 py-4 align-middle border-l border-gray-200 text-slate-700 text-[10px]">Dapat terjadi beberapa kali dalam setahun</td>
                          <td className="px-4 py-4 align-middle border-l border-gray-200 text-slate-700 text-[11px]">Sering terjadi dalam situasi tertentu dan cukup mungkin terjadi kembali.</td>
                          <td className="px-4 py-4 align-middle border-l border-gray-200 font-bold text-[#ff6900] text-center">20% – 50%</td>
                        </tr>
                        <tr className="bg-[#fdf2f2]/50 hover:bg-[#fdf2f2]/80 transition-colors">
                          <td className="px-4 py-4 align-middle">
                            <div className="w-full h-8 rounded-md bg-[#d3181f] text-white flex items-center justify-center font-black text-base">5</div>
                          </td>
                          <td className="px-4 py-4 align-middle border-l border-gray-200 font-bold text-slate-800 text-center text-[11px]">Sangat Sering</td>
                          <td className="px-4 py-4 align-middle border-l border-gray-200 text-slate-700 text-[10px]">Terjadi dalam minggu / bulan</td>
                          <td className="px-4 py-4 align-middle border-l border-gray-200 text-slate-700 text-[11px]">Sering terjadi bahkan dapat diprediksi akan terjadi kembali dalam waktu dekat.</td>
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {isDetailModalOpen && selectedRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setIsDetailModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-4 bg-emerald-600 flex justify-between items-center sticky top-0 z-10">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Shield size={22} /> Detail Manajemen Risiko
                </h3>
                <button onClick={() => setIsDetailModalOpen(false)} className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded-lg transition-colors">
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-6 md:p-8 overflow-y-auto space-y-6">
                
                <div className="flex flex-wrap gap-4 items-center justify-between pb-4 border-b border-gray-100">
                  <div>
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Unit / Tahun</p>
                    <p className="text-lg font-black text-slate-800">{selectedRecord.unit} <span className="text-gray-400 font-medium ml-2">{selectedRecord.tahun}</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Grading</p>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border ${getBadgeColor(selectedRecord.grading)}`}>
                      {selectedRecord.grading}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-bold text-gray-500 mb-1">Identifikasi Risiko</p>
                    <p className="text-slate-800 font-medium bg-gray-50 p-4 rounded-xl border border-gray-100">{selectedRecord.risiko}</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-500 mb-1">Penyebab</p>
                    <p className="text-slate-800 font-medium bg-gray-50 p-4 rounded-xl border border-gray-100">{selectedRecord.penyebab}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-gray-100 text-center">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Severity</p>
                    <p className="text-2xl font-black text-slate-800">{selectedRecord.severity}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-gray-100 text-center">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Probability</p>
                    <p className="text-2xl font-black text-slate-800">{selectedRecord.probability}</p>
                  </div>
                  <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 text-center">
                    <p className="text-xs font-bold text-emerald-600 uppercase mb-1">Risk Score</p>
                    <p className="text-3xl font-black text-emerald-700">{selectedRecord.riskScore}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-bold text-gray-500 mb-1">Pengelolaan / Mitigasi</p>
                  <p className="text-slate-800 font-medium bg-gray-50 p-4 rounded-xl border border-gray-100">{selectedRecord.pengelolaan || '-'}</p>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-100 text-sm">
                  <p className="text-gray-500 font-bold">PIC: <span className="text-slate-800">{selectedRecord.pic || '-'}</span></p>
                  <p className="text-gray-400">Diinput: {new Date(selectedRecord.createdAt).toLocaleDateString('id-ID')}</p>
                </div>

              </div>
              
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                <button onClick={() => setIsDetailModalOpen(false)} className="px-6 py-2.5 bg-white border border-gray-200 text-slate-700 font-bold rounded-xl hover:bg-gray-50">Tutup</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      
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

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setIsDeleteModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm text-center"
            >
              <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2">Hapus Data?</h3>
              <p className="text-slate-500 mb-6 font-medium">Apakah Anda yakin ingin menghapus data risiko ini? Tindakan ini tidak dapat dibatalkan.</p>
              <div className="flex gap-3">
                <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3 rounded-xl border border-gray-200 text-slate-600 font-bold hover:bg-gray-50">Batal</button>
                <button onClick={handleDeleteConfirm} className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 shadow-lg shadow-red-500/20">Hapus</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
