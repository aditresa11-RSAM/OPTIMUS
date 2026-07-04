import React, { useState, useEffect, useMemo } from "react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip as RechartsTooltip,
} from "recharts";
import { 
  Activity, 
  ClipboardList, 
  RefreshCw, 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Sparkles,
  Trash2,
  X
} from "lucide-react";
import SurveiForm from "@/components/survei/SurveiForm";
import { supabase } from "@/lib/supabase";

interface DimensionDefinition {
  id: number;
  name: string;
  shortName: string;
  items: {
    section: 'bagian_a' | 'bagian_b' | 'bagian_c' | 'bagian_d' | 'bagian_f';
    key: string;
    isReverse: boolean;
  }[];
}

const DIMENSION_MAPPING: DimensionDefinition[] = [
  {
    id: 1,
    name: "Keterbukaam dalam komunikasi",
    shortName: "Komunikasi Terbuka",
    items: [
      { section: "bagian_c", key: "c_1", isReverse: false },
      { section: "bagian_c", key: "c_3", isReverse: false },
      { section: "bagian_c", key: "c_5", isReverse: true }
    ]
  },
  {
    id: 2,
    name: "Umpan balik dan komunikasi tentang kesalahan",
    shortName: "Umpan Balik Error",
    items: [
      { section: "bagian_c", key: "c_0", isReverse: false },
      { section: "bagian_c", key: "c_2", isReverse: false },
      { section: "bagian_c", key: "c_4", isReverse: false }
    ]
  },
  {
    id: 3,
    name: "Frekuensi kejadian yang dilaporkan",
    shortName: "Laporan Insiden",
    items: [
      { section: "bagian_d", key: "d_0", isReverse: false },
      { section: "bagian_d", key: "d_1", isReverse: false },
      { section: "bagian_d", key: "d_2", isReverse: false }
    ]
  },
  {
    id: 4,
    name: "Serah terima dan pergantian/peralihan",
    shortName: "Serah Terima Shift",
    items: [
      { section: "bagian_f", key: "f_2", isReverse: true },
      { section: "bagian_f", key: "f_4", isReverse: true },
      { section: "bagian_f", key: "f_10", isReverse: true }
    ]
  },
  {
    id: 5,
    name: "Dukungan manajemen untuk keselamatan pasien",
    shortName: "Dukungan Manajemen",
    items: [
      { section: "bagian_f", key: "f_0", isReverse: false },
      { section: "bagian_f", key: "f_7", isReverse: false },
      { section: "bagian_f", key: "f_8", isReverse: true }
    ]
  },
  {
    id: 6,
    name: "Respon nonhukuman (nonpunitive) terhadap kesalahan",
    shortName: "Respon Nonhukuman",
    items: [
      { section: "bagian_a", key: "a_7", isReverse: true },
      { section: "bagian_a", key: "a_11", isReverse: true },
      { section: "bagian_a", key: "a_15", isReverse: true }
    ]
  },
  {
    id: 7,
    name: "Pembelajaran organisasi-perbaikan terus-menerus",
    shortName: "Pembelajaran Org",
    items: [
      { section: "bagian_a", key: "a_8", isReverse: false },
      { section: "bagian_a", key: "a_12", isReverse: false }
    ]
  },
  {
    id: 8,
    name: "Persepsi keseluruhan tentang keselamatan pasien",
    shortName: "Persepsi Keselamatan",
    items: [
      { section: "bagian_a", key: "a_5", isReverse: false },
      { section: "bagian_a", key: "a_9", isReverse: true },
      { section: "bagian_a", key: "a_14", isReverse: false },
      { section: "bagian_a", key: "a_16", isReverse: true },
      { section: "bagian_a", key: "a_17", isReverse: false }
    ]
  },
  {
    id: 9,
    name: "Staffing",
    shortName: "Kecukupan Staf",
    items: [
      { section: "bagian_a", key: "a_1", isReverse: false },
      { section: "bagian_a", key: "a_4", isReverse: true },
      { section: "bagian_a", key: "a_6", isReverse: true },
      { section: "bagian_a", key: "a_13", isReverse: true }
    ]
  },
  {
    id: 10,
    name: "Ekspektasi dan tindakan supervisor/manajer untuk meningkatkan keselamatan pasien",
    shortName: "Ekspektasi Manajer",
    items: [
      { section: "bagian_b", key: "b_0", isReverse: false },
      { section: "bagian_b", key: "b_1", isReverse: false },
      { section: "bagian_b", key: "b_2", isReverse: true },
      { section: "bagian_b", key: "b_3", isReverse: true }
    ]
  },
  {
    id: 11,
    name: "Kerja sama antar unit",
    shortName: "Kerjasama Antar Unit",
    items: [
      { section: "bagian_f", key: "f_1", isReverse: true },
      { section: "bagian_f", key: "f_3", isReverse: false },
      { section: "bagian_f", key: "f_5", isReverse: true },
      { section: "bagian_f", key: "f_6", isReverse: true },
      { section: "bagian_f", key: "f_9", isReverse: false }
    ]
  },
  {
    id: 12,
    name: "Kerja tim dalam unit",
    shortName: "Kerjasama Tim Unit",
    items: [
      { section: "bagian_a", key: "a_0", isReverse: false },
      { section: "bagian_a", key: "a_2", isReverse: false },
      { section: "bagian_a", key: "a_3", isReverse: false },
      { section: "bagian_a", key: "a_10", isReverse: false }
    ]
  }
];

function isPositiveResponse(val: string | undefined, isReverse: boolean): boolean {
  if (!val) return false;
  const normalized = val.trim().toLowerCase();
  if (!isReverse) {
    return (
      normalized === "setuju" ||
      normalized === "sangat setuju" ||
      normalized === "sering" ||
      normalized === "selalu"
    );
  } else {
    return (
      normalized === "sangat tidak setuju" ||
      normalized === "tidak setuju" ||
      normalized === "tidak pernah" ||
      normalized === "jarang sekali"
    );
  }
}

export default function SurveiBudaya() {
  const [view, setView] = useState<"dashboard" | "form">("dashboard");
  const [surveys, setSurveys] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const [showSqlGuide, setShowSqlGuide] = useState<boolean>(false);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);

  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  const yearOptions = useMemo(() => {
    const years = [];
    for (let y = currentYear; y >= currentYear - 5; y--) {
      years.push(y);
    }
    return years;
  }, [currentYear]);

  const filteredSurveys = useMemo(() => {
    return surveys.filter(survey => {
      if (!survey.created_at) return true; // Keep if no date is specified
      const surveyYear = new Date(survey.created_at).getFullYear();
      return surveyYear === selectedYear;
    });
  }, [surveys, selectedYear]);

  const getLocalSurveys = (): any[] => {
    if (typeof window !== "undefined") {
      try {
        const local = localStorage.getItem("survei_budaya_local");
        return local ? JSON.parse(local) : [];
      } catch (e) {
        console.error("Error reading local storage", e);
      }
    }
    return [];
  };

  const saveLocalSurveys = (data: any[]) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("survei_budaya_local", JSON.stringify(data));
      } catch (e) {
        console.error("Error saving to local storage", e);
      }
    }
  };

  const fetchSurveys = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("survei_budaya")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) {
        if (error.code === "PGRST205" || error.message?.includes("survei_budaya")) {
          setDbError("missing_table");
        } else {
          setDbError(error.message);
        }
        throw error;
      }
      
      setDbError(null);
      const localData = getLocalSurveys();
      const merged = [...(data || [])];
      localData.forEach((lItem: any) => {
        if (!merged.some(mItem => mItem.id === lItem.id)) {
          merged.push(lItem);
        }
      });
      setSurveys(merged);
    } catch (err) {
      console.error("Error fetching surveys:", err);
      // Fallback entirely to local storage if supabase fails or table is missing
      const localData = getLocalSurveys();
      setSurveys(localData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from("survei_budaya")
          .select("*")
          .order("created_at", { ascending: false });
        
        if (error) {
          if (error.code === "PGRST205" || error.message?.includes("survei_budaya")) {
            setDbError("missing_table");
          } else {
            setDbError(error.message);
          }
          throw error;
        }
        
        if (active) {
          setDbError(null);
          const localData = getLocalSurveys();
          const merged = [...(data || [])];
          localData.forEach((lItem: any) => {
            if (!merged.some(mItem => mItem.id === lItem.id)) {
              merged.push(lItem);
            }
          });
          setSurveys(merged);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error loading surveys:", err);
        const localData = getLocalSurveys();
        if (active) {
          setSurveys(localData);
          setLoading(false);
        }
      }
    };
    if (view === "dashboard") {
      load();
    }
    return () => {
      active = false;
    };
  }, [view]);

  // Real-time calculations
  const computedDimensions = useMemo(() => {
    return DIMENSION_MAPPING.map(d => {
      let totalAnswers = 0;
      let positiveAnswers = 0;

      filteredSurveys.forEach(survey => {
        d.items.forEach(item => {
          const sectionData = survey[item.section];
          if (sectionData) {
            const val = sectionData[item.key];
            if (val && val.trim() !== "") {
              totalAnswers++;
              if (isPositiveResponse(val, item.isReverse)) {
                positiveAnswers++;
              }
            }
          }
        });
      });

      const score = totalAnswers > 0 ? (positiveAnswers / totalAnswers) * 100 : 0;
      return {
        ...d,
        score,
        totalAnswers,
        positiveAnswers,
      };
    });
  }, [filteredSurveys]);

  const totalScore = useMemo(() => {
    if (computedDimensions.length === 0) return 0;
    const sum = computedDimensions.reduce((acc, curr) => acc + curr.score, 0);
    return sum / computedDimensions.length;
  }, [computedDimensions]);

  const counts = useMemo(() => {
    let baik = 0;
    let sedang = 0;
    let lemah = 0;

    computedDimensions.forEach(d => {
      if (d.score > 75) {
        baik++;
      } else if (d.score >= 50) {
        sedang++;
      } else {
        lemah++;
      }
    });

    return { baik, sedang, lemah };
  }, [computedDimensions]);

  const weakestDimension = useMemo(() => {
    if (computedDimensions.length === 0) return null;
    let minDim = computedDimensions[0];
    computedDimensions.forEach(d => {
      if (d.score < minDim.score) {
        minDim = d;
      }
    });
    return minDim;
  }, [computedDimensions]);

  const radarData = useMemo(() => {
    return computedDimensions.map(d => ({
      subject: d.shortName,
      A: Math.round(d.score),
      fullMark: 100,
    }));
  }, [computedDimensions]);

  const formatPercent = (val: number) => {
    return val.toFixed(2).replace(".", ",") + "%";
  };

  const handleSimulateData = async () => {
    setLoading(true);
    const mockUnits = ["IGD", "ICU", "Rawat Inap Mawar", "Poliklinik", "Laboratorium"];
    const mockSurveys: any[] = [];
    
    for (let u = 0; u < 5; u++) {
      const unit = mockUnits[u];
      
      const parts: any = {
        unit_kerja: unit,
        bagian_a: {},
        bagian_b: {},
        bagian_c: {},
        bagian_d: {},
        bagian_e: ["Sangat Baik", "Bisa diterima", "Sempurna"][Math.floor(Math.random() * 3)],
        bagian_f: {},
        bagian_g: ["3 - 5 laporan", "6 - 10 laporan"][Math.floor(Math.random() * 2)],
        bagian_h: {
          h_0: "1 - 5 tahun",
          h_1: "1 - 5 tahun",
          h_2: "40 jam atau lebih seminggu",
          h_3: ["Dokter", "Perawat", "Bidan"][Math.floor(Math.random() * 3)],
          h_4: "Ya",
          h_5: "1 - 5 tahun"
        },
        bagian_i_komentar: "Secara umum, pelayanan asuhan dan koordinasi keselamatan pasien di ruangan sudah berjalan baik."
      };
      
      // Populate bagian_a (18 items) with realistic values biased to be positive
      for (let i = 0; i < 18; i++) {
        const rand = Math.random();
        let val = "Setuju";
        if (rand < 0.2) val = "Kadang-kadang";
        else if (rand < 0.5) val = "Sangat Setuju";
        else if (rand < 0.6) val = "Tidak Setuju";
        else if (rand < 0.65) val = "Sangat tidak setuju";
        parts.bagian_a[`a_${i}`] = val;
      }
      
      // Populate bagian_b (4 items)
      for (let i = 0; i < 4; i++) {
        const rand = Math.random();
        let val = "Setuju";
        if (rand < 0.2) val = "Kadang-kadang";
        else if (rand < 0.55) val = "Sangat Setuju";
        else if (rand < 0.65) val = "Tidak Setuju";
        parts.bagian_b[`b_${i}`] = val;
      }

      // Populate bagian_c (6 items)
      for (let i = 0; i < 6; i++) {
        const rand = Math.random();
        let val = "Sering";
        if (rand < 0.2) val = "Kadang-kadang";
        else if (rand < 0.6) val = "Selalu";
        else if (rand < 0.7) val = "Jarang sekali";
        parts.bagian_c[`c_${i}`] = val;
      }

      // Populate bagian_d (3 items)
      for (let i = 0; i < 3; i++) {
        const rand = Math.random();
        let val = "Sering";
        if (rand < 0.25) val = "Kadang-kadang";
        else if (rand < 0.65) val = "Selalu";
        else if (rand < 0.7) val = "Jarang sekali";
        parts.bagian_d[`d_${i}`] = val;
      }

      // Populate bagian_f (11 items)
      for (let i = 0; i < 11; i++) {
        const rand = Math.random();
        let val = "Setuju";
        if (rand < 0.2) val = "Kadang-kadang";
        else if (rand < 0.5) val = "Sangat Setuju";
        else if (rand < 0.65) val = "Tidak Setuju";
        parts.bagian_f[`f_${i}`] = val;
      }
      
      mockSurveys.push(parts);
    }

    try {
      const { error } = await supabase.from('survei_budaya').insert(mockSurveys);
      if (error) throw error;
      alert("Berhasil mensimulasikan 5 data kuesioner baru ke database cloud!");
      fetchSurveys();
    } catch (err: any) {
      console.warn("Gagal simulasi ke database, mencoba simulasi ke Penyimpanan Lokal:", err);
      // Fallback local simulation
      const localData = getLocalSurveys();
      const updatedLocal = [...localData];
      
      mockSurveys.forEach((item, idx) => {
        item.id = "local-mock-" + Date.now() + "-" + idx;
        item.created_at = new Date().toISOString();
        updatedLocal.push(item);
      });
      
      saveLocalSurveys(updatedLocal);
      alert("Tabel 'survei_budaya' belum terpasang di database Supabase Anda.\n\nData simulasi kuesioner berhasil disimpan ke Penyimpanan Lokal (Local Storage) browser!");
      
      // Update state in real-time
      const merged = [...surveys];
      mockSurveys.forEach(item => {
        if (!merged.some(mItem => mItem.id === item.id)) {
          merged.push(item);
        }
      });
      setSurveys(merged);
    } finally {
      setLoading(false);
    }
  };

  const handleResetData = async () => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus semua data kuesioner? Tindakan ini tidak dapat dibatalkan.")) return;
    setLoading(true);
    
    // Clear local storage
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("survei_budaya_local");
      } catch (e) {
        console.error(e);
      }
    }

    try {
      const { error } = await supabase
        .from('survei_budaya')
        .delete()
        .neq('unit_kerja', '___nonexistent_unit___');
      
      if (error && error.code !== "PGRST205") throw error;
      
      alert("Semua data kuesioner berhasil dihapus!");
      fetchSurveys();
    } catch (err: any) {
      alert("Semua data kuesioner lokal berhasil dihapus.");
      fetchSurveys();
    } finally {
      setLoading(false);
    }
  };

  if (view === "form") {
    return (
      <div className="w-full px-2 md:px-0">
        <SurveiForm onBack={() => setView("dashboard")} />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-6 max-w-7xl mx-auto w-full p-2 md:p-0">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-2">
        <div>
          <h1 className="text-3xl font-bold text-[#10a37f] tracking-tight">
            Survei Budaya Keselamatan Pasien
          </h1>
          <p className="text-gray-900 mt-1 text-[12px] font-semibold">
            Evaluasi budaya keselamatan pasien per dimensi terintegrasi database secara real-time.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setView("form")}
            className="flex items-center gap-2 bg-[#10a37f] hover:bg-[#0e8f6e] text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/30 text-sm whitespace-nowrap"
          >
            <ClipboardList size={18} />
            Isi Kuesioner
          </button>

          <div className="relative">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 pr-10 rounded-xl font-bold text-sm transition-all shadow-xs outline-none cursor-pointer focus:border-[#10a37f] appearance-none"
            >
              {yearOptions.map(year => (
                <option key={year} value={year}>
                  Periode {year}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>

          {surveys.length > 0 && (
            <button
              onClick={handleResetData}
              className="flex items-center justify-center bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 p-2.5 rounded-xl font-bold transition-all shadow-xs w-10 h-10 shrink-0"
              title="Reset Semua Data Kuesioner"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>

      {dbError === "missing_table" && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-amber-900 shadow-sm space-y-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={24} />
            <div className="space-y-1">
              <h4 className="font-extrabold text-base">⚠️ Tabel Database Supabase Belum Siap</h4>
              <p className="text-sm font-medium leading-relaxed">
                Tabel <code className="bg-amber-100 px-1.5 py-0.5 rounded text-amber-900 font-bold font-mono text-xs">survei_budaya</code> belum dibuat di dalam database Supabase Anda. Untuk menjamin data Anda tidak hilang, sistem secara otomatis mengaktifkan **Penyimpanan Lokal Cadangan (Local Storage)**. Anda dapat terus mengisi kuesioner dan melihat hasil grafik saat ini!
              </p>
            </div>
          </div>
          <div className="pt-2 border-t border-amber-200 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowSqlGuide(!showSqlGuide)}
              className="text-xs font-black bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl transition-all shadow-sm"
            >
              {showSqlGuide ? "Sembunyikan Panduan SQL" : "Cara Membuat Tabel di Supabase (Sangat Mudah)"}
            </button>
            <span className="text-xs font-bold text-amber-700">
              *Data survei saat ini disimpan aman di browser Anda.
            </span>
          </div>

          {showSqlGuide && (
            <div className="bg-slate-900 rounded-xl p-5 text-slate-100 font-mono text-xs space-y-3 border border-slate-800 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex justify-between items-center text-[10px] text-slate-400 border-b border-slate-800 pb-2">
                <span>SKRIP SQL SETUP TABLE & POLICIES</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`CREATE TABLE IF NOT EXISTS public.survei_budaya (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  unit_kerja TEXT,
  bagian_a JSONB,
  bagian_b JSONB,
  bagian_c JSONB,
  bagian_d JSONB,
  bagian_e TEXT,
  bagian_f JSONB,
  bagian_g TEXT,
  bagian_h JSONB,
  bagian_i_komentar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.survei_budaya ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read survei_budaya" ON public.survei_budaya;
DROP POLICY IF EXISTS "Public All survei_budaya" ON public.survei_budaya;
CREATE POLICY "Public Read survei_budaya" ON public.survei_budaya FOR SELECT USING (true);
CREATE POLICY "Public All survei_budaya" ON public.survei_budaya FOR ALL USING (true) WITH CHECK (true);`);
                    alert("Skrip SQL berhasil disalin! Silakan paste pada menu SQL Editor di dashboard Supabase Anda.");
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded font-bold transition-all"
                >
                  Salin Skrip
                </button>
              </div>
              <p className="text-[11px] text-emerald-400 font-sans">
                <strong>Langkah Cepat:</strong> 1. Masuk ke dasbor Supabase Anda -&gt; 2. Klik menu <strong>SQL Editor</strong> -&gt; 3. Klik <strong>New query</strong> -&gt; 4. Paste skrip di bawah ini -&gt; 5. Klik <strong>Run</strong>. Selesai!
              </p>
              <pre className="overflow-x-auto whitespace-pre p-3 bg-slate-950 rounded-lg max-h-[250px] leading-relaxed">
{`CREATE TABLE IF NOT EXISTS public.survei_budaya (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  unit_kerja TEXT,
  bagian_a JSONB,
  bagian_b JSONB,
  bagian_c JSONB,
  bagian_d JSONB,
  bagian_e TEXT,
  bagian_f JSONB,
  bagian_g TEXT,
  bagian_h JSONB,
  bagian_i_komentar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.survei_budaya ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read survei_budaya" ON public.survei_budaya;
DROP POLICY IF EXISTS "Public All survei_budaya" ON public.survei_budaya;
CREATE POLICY "Public Read survei_budaya" ON public.survei_budaya FOR SELECT USING (true);
CREATE POLICY "Public All survei_budaya" ON public.survei_budaya FOR ALL USING (true) WITH CHECK (true);`}
              </pre>
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
          <RefreshCw size={40} className="text-emerald-500 animate-spin mb-4" />
          <p className="text-gray-600 font-bold">Sedang memuat data dari database...</p>
        </div>
      ) : surveys.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
          <Database size={48} className="text-gray-300 mb-4" />
          <h3 className="text-xl font-black text-gray-800 mb-2">Belum Ada Data Survei</h3>
          <p className="text-gray-500 max-w-md text-sm mb-6">
            Database kuesioner kosong. Silakan isi kuesioner baru, atau simulasikan data awal untuk langsung memvisualisasikan dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setView("form")}
              className="flex items-center justify-center gap-2 bg-[#10a37f] hover:bg-[#0e8f6e] text-white px-6 py-3 rounded-xl font-bold transition-all"
            >
              <ClipboardList size={18} />
              Mulai Isi Kuesioner
            </button>
            <button
              onClick={handleSimulateData}
              className="flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 px-6 py-3 rounded-xl font-bold transition-all"
            >
              <Sparkles size={18} />
              Simulasikan 5 Data Responden
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6 w-full">
          
          {/* Metadata Bar */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-emerald-800 text-xs font-bold">
            <button
              onClick={() => setShowHistoryModal(true)}
              className="flex items-center gap-1.5 hover:text-emerald-950 transition-all cursor-pointer focus:outline-none"
              title="Klik untuk melihat riwayat unit yang sudah mengisi kuesioner"
            >
              <Database size={14} className="animate-pulse" />
              <span>Total Responden: <span className="underline decoration-dotted font-extrabold">{filteredSurveys.length} orang</span></span>
            </button>
            <span className="bg-emerald-100 text-emerald-900 px-2.5 py-1 rounded-full text-[10px]">
              Kondisi Terkini
            </span>
          </div>

          {/* TABLE SECTION: A. DATA HASIL SURVEY BUDAYA KESELAMATAN PASIEN */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 md:p-8 overflow-hidden w-full">
            <h3 className="text-base sm:text-lg font-black text-[#10a37f] tracking-tight uppercase border-b pb-4 mb-5 text-center">
              DATA HASIL SURVEY BUDAYA KESELAMATAN PASIEN
            </h3>
            
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead className="bg-slate-50 text-gray-700 border-b border-gray-200">
                  <tr>
                    <th className="p-4 text-center text-xs font-black uppercase w-16 bg-[#10a37f] text-white border-r border-[#0e8f6e]/60">No</th>
                    <th className="p-4 text-center text-xs font-black uppercase bg-[#10a37f] text-[#eceff5] border-r border-[#0e8f6e]/60">Dimensi</th>
                    <th className="p-4 text-center text-xs font-black uppercase w-48 bg-[#10a37f] text-[#fefefe]">Hasil pengukuran (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-slate-800 text-sm">
                  {computedDimensions.map((dim, idx) => (
                    <tr key={dim.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 text-center font-bold text-gray-500 border-r border-gray-200">{idx + 1}</td>
                      <td className="p-4 font-semibold text-gray-800 border-r border-gray-200">{dim.name}</td>
                      <td className="p-4 text-center font-black text-emerald-700 bg-emerald-50/20">
                        {Math.round(dim.score)}%
                      </td>
                    </tr>
                  ))}
                  {/* TOTAL SKOR ROW */}
                  <tr className="bg-slate-100/80 text-gray-900 font-extrabold border-t-2 border-slate-300">
                    <td colSpan={2} className="p-4 text-center text-[16px] uppercase tracking-wider font-black bg-[#10a37f] text-white border-r border-[#0e8f6e]/60">
                      TOTAL SKOR
                    </td>
                    <td className="p-4 text-center text-base font-black bg-[#10a37f] text-white">
                      {formatPercent(totalScore)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Explanatory text below the table */}
            <div className="mt-6 border-t pt-5 border-slate-100 space-y-3">
              <p className="text-sm font-semibold text-slate-700">
                Tabel di atas merupakan data hasil survey budaya keselamatan pasien di UOBK RSUD Al-Mulk dikategorikan dalam 12 dimensi.
              </p>
              <ul className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-xs font-bold">
                <li className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-3 py-2.5 rounded-xl border border-emerald-100">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>{counts.baik} dimensi baik (&gt;75%)</span>
                </li>
                <li className="flex items-center gap-2 text-amber-700 bg-amber-50 px-3 py-2.5 rounded-xl border border-amber-100">
                  <AlertTriangle size={16} className="text-amber-500 shrink-0" />
                  <span>{counts.sedang} dimensi sedang (50-75%)</span>
                </li>
                <li className="flex items-center gap-2 text-rose-700 bg-rose-50 px-3 py-2.5 rounded-xl border border-rose-100">
                  <XCircle size={16} className="text-rose-500 shrink-0" />
                  <span>{counts.lemah} dimensi lemah (&lt;50%)</span>
                </li>
              </ul>
            </div>
          </div>

          {/* CHARTS GRID SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 w-full">
            
            {/* Radar Chart Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 w-full min-w-0 overflow-hidden flex flex-col justify-between">
              <h3 className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2">
                <Activity className="text-emerald-500" size={20} />
                Radar Capaian Dimensi
              </h3>
              <div className="relative w-full h-[320px] md:h-[350px] shrink-0 mt-4 overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                  <ResponsiveContainer width="100%" height="100%" debounce={50} minWidth={0}>
                    <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                      <PolarGrid stroke="#e5e7eb" />
                      <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: "#4b5563", fontSize: 9, fontWeight: 700 }}
                      />
                      <PolarRadiusAxis
                        angle={30}
                        domain={[0, 100]}
                        tick={{ fill: "#9ca3af", fontSize: 8 }}
                      />
                      <Radar
                        name="Skor RS"
                        dataKey="A"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.4}
                        isAnimationActive={false}
                      />
                      <Legend />
                      <RechartsTooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Average Score Card */}
            <div className="bg-white text-emerald-950 rounded-2xl shadow-sm border border-emerald-100 p-6 md:p-8 flex flex-col justify-center items-center text-center w-full min-w-0 overflow-hidden">
              <h3 className="text-xl sm:text-2xl font-bold mb-2 text-slate-800">Nilai Rata-Rata Budaya</h3>
              <div className="text-5xl sm:text-6xl font-black text-[#10a37f] mb-4 drop-shadow-xs">
                {totalScore.toFixed(2).replace(".", ",")}%
              </div>
              
              <div className={`px-4 py-2 rounded-full font-black text-xs uppercase tracking-wider mb-4 border ${
                totalScore >= 75 
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                  : totalScore >= 50 
                    ? 'bg-amber-100 text-amber-800 border-amber-200' 
                    : 'bg-rose-100 text-rose-800 border-rose-200'
              }`}>
                KATEGORI {totalScore >= 75 ? "BAIK" : totalScore >= 50 ? "SEDANG" : "LEMAH"}
              </div>

              <p className="text-slate-600 font-medium max-w-sm text-sm leading-relaxed">
                Budaya keselamatan pasien di RS saat ini secara keseluruhan berada dalam kategori{" "}
                <span className={`font-black underline decoration-2 underline-offset-4 ${
                  totalScore >= 75 ? "text-emerald-600 decoration-emerald-500" : "text-amber-600 decoration-amber-500"
                }`}>
                  {totalScore >= 75 ? "BAIK" : totalScore >= 50 ? "SEDANG" : "LEMAH"}
                </span>.
                {weakestDimension && weakestDimension.score < 75 ? (
                  <span> Perlu perhatian khusus dan peningkatan berkala terutama pada area <strong className="text-rose-600">{weakestDimension.name}</strong>.</span>
                ) : (
                  <span> Seluruh dimensi sudah menunjukkan kinerja di atas standar minimal. Pertahankan kedisiplinan dan koordinasi tim!</span>
                )}
              </p>
            </div>
            
          </div>
        </div>
      )}

      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-start pb-4 border-b border-slate-100 mb-4 shrink-0">
              <div>
                <h3 className="text-lg font-black text-[#10a37f] tracking-tight">
                  Riwayat Responden ({selectedYear})
                </h3>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                  Unit yang telah melakukan input kuesioner pada periode ini.
                </p>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
                title="Tutup"
              >
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-2 pr-1 min-h-[150px]">
              {filteredSurveys.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm font-semibold">
                  Belum ada responden pada periode {selectedYear}.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredSurveys.map((survey, index) => {
                    const dateStr = survey.created_at
                      ? new Date(survey.created_at).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "-";
                    return (
                      <div key={survey.id || index} className="py-3 flex justify-between items-center text-sm gap-2">
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-full bg-[#10a37f]/10 text-[#10a37f] flex items-center justify-center text-xs font-black shrink-0">
                            {index + 1}
                          </span>
                          <div>
                            <p className="font-extrabold text-slate-800">
                              {survey.unit_kerja || "Unit Tidak Diketahui"}
                            </p>
                            <p className="text-xs text-slate-400 font-medium">
                              {dateStr}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full whitespace-nowrap">
                          Selesai
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500 font-bold shrink-0">
              <span>Total: {filteredSurveys.length} Responden</span>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="bg-[#10a37f] hover:bg-[#0e8f6e] text-white px-5 py-2.5 rounded-xl font-black transition-all text-xs cursor-pointer shadow-md shadow-emerald-500/20"
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
