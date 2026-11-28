import React, { useState, useMemo, useEffect } from "react";
import InteractiveDashboardModal from "../components/dashboard/InteractiveDashboardModal";
import {
  Target as PhTarget,
  TrendUp,
  Warning as PhWarning,
  TrendDown,
  ShieldWarning,
  FileText as PhFileText,
  ListChecks,
  UsersThree,
  Buildings,
  Hospital as PhHospital,
  ShieldCheck as PhShieldCheck,
} from "@phosphor-icons/react";
import {
  Target,
  AlertTriangle,
  TrendingUp,
  ListTodo,
  Activity,
  ChevronRight,
  CheckCircle2,
  ShieldAlert,
  BarChart3,
  HelpCircle,
  TrendingDown,
  PlusCircle,
  X,
  Search,
  Filter,
  FileText,
  Users,
  ShieldCheck,
  Building,
  Building2,
} from "lucide-react";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LabelList,
  ComposedChart,
  Bar,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
  Label,
} from "recharts";
import { motion, AnimatePresence } from "motion/react";
import { useStore } from "@/store/useStore";
import { supabase } from "@/lib/supabase";
import {
  INDONESIAN_MONTHS,
  normalizeCategory,
  parseIsoDateParts,
  getLocalCurrentYearMonth,
  evaluateAchievementStatus,
  mapDbInputsToMutuPayloads,
  aggregateEntriesCapaian,
  parseNumericTarget,
  isReverseIndicatorTarget,
} from "@/lib/mutuSync";
import { formatTarget } from "../../lib/utils";
import Link from "next/link";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-100 shadow-xl rounded-xl">
        <p className="text-xs font-bold text-gray-800 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div
            key={index}
            className="flex flex-row items-center justify-between gap-4 mb-1"
          >
            <div className="flex items-center gap-1.5">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-[10px] font-semibold text-gray-500 uppercase">
                {entry.name}
              </span>
            </div>
            <span className="text-xs font-black" style={{ color: entry.color }}>
              {entry.value}%
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const TwoDShadowBar = (props: any) => {
  const { fill, x, y, width, height } = props;

  if (height === undefined || height <= 0 || Number.isNaN(height)) {
    return <rect x={x} y={y} width={width} height={0} fill={fill} />;
  }

  const radius = Math.min(6, width / 2);
  const path = `
    M ${x},${y + height}
    L ${x},${y + radius}
    A ${radius},${radius} 0 0,1 ${x + radius},${y}
    L ${x + width - radius},${y}
    A ${radius},${radius} 0 0,1 ${x + width},${y + radius}
    L ${x + width},${y + height}
    Z
  `;

  return (
    <g>
      <path
        d={path}
        fill="#000000"
        opacity="0.18"
        style={{ transform: "translate(3px, 3px)", filter: "blur(1.5px)" }}
      />
      <path d={path} fill={fill} />
    </g>
  );
};

export default function Dashboard() {
  // Redirect to welcome screen on very first load
  useEffect(() => {
    if (typeof window !== "undefined") {
      const seen = localStorage.getItem("welcome_seen");
      if (seen !== "true") {
        window.location.replace("/");
      }
    }
  }, []);

  const dataMutuList = useStore((state) => state.dataMutuList);
  const addDataMutu = useStore((state) => state.addDataMutu);
  const setDataMutuList = useStore((state) => state.setDataMutuList);
  const indicatorProfiles = useStore((state) => state.indicatorProfiles);

  const inmCount = indicatorProfiles.filter(
    (p) => normalizeCategory(p.category) === "INM",
  ).length;
  const impRsCount = indicatorProfiles.filter(
    (p) => normalizeCategory(p.category) === "IMP-RS",
  ).length;
  const impUnitCount = indicatorProfiles.filter(
    (p) => normalizeCategory(p.category) === "IMP-Unit",
  ).length;
  const spmCount = indicatorProfiles.filter(
    (p) => normalizeCategory(p.category) === "SPM",
  ).length;

  const [chartCategory, setChartCategory] = useState<
    "INM" | "IMP-RS" | "IMP-Unit" | "SPM"
  >("INM");
  const [selectedIndikatorId, setSelectedIndikatorId] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownSearch, setDropdownSearch] = useState("");

  // Filter Period State (deterministic SSR initial values, synced to local clock on mount)
  const [periodeMode, setPeriodeMode] = useState("Bulanan");
  const [currentYear, setCurrentYear] = useState(2026);
  const [selectedBulan, setSelectedBulan] = useState("Januari");
  const [selectedTahun, setSelectedTahun] = useState("2026");
  const [selectedTriwulan, setSelectedTriwulan] = useState("Triwulan 1");
  const [selectedSemester, setSelectedSemester] = useState("Semester 1");

  useEffect(() => {
    const rafId = requestAnimationFrame(() => {
      const localNow = getLocalCurrentYearMonth();
      setCurrentYear(localNow.year);
      setSelectedBulan(localNow.monthName);
      setSelectedTahun(localNow.yearStr);
    });
    return () => cancelAnimationFrame(rafId);
  }, []);

  // Dynamic Realtime Greeting (Selamat Pagi / Siang / Sore / Malam)
  const [greeting, setGreeting] = useState<{ text: string; image: string }>({
    text: "Selamat Datang",
    image: "/icons/greeting_siang.png",
  });

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      if (hour >= 4 && hour < 11) {
        setGreeting({ text: "Selamat Pagi", image: "/icons/greeting_pagi.png" });
      } else if (hour >= 11 && hour < 15) {
        setGreeting({ text: "Selamat Siang", image: "/icons/greeting_siang.png" });
      } else if (hour >= 15 && hour < 18) {
        setGreeting({ text: "Selamat Sore", image: "/icons/greeting_sore.png" });
      } else {
        setGreeting({ text: "Selamat Malam", image: "/icons/greeting_malam.png" });
      }
    };
    updateGreeting();
    const interval = setInterval(updateGreeting, 60000);
    return () => clearInterval(interval);
  }, []);

  // Modal State
  const [activeModal, setActiveModal] = useState<
    "TERCAPAI" | "BELUM_TERCAPAI" | "IKP" | "ALL" | null
  >(null);
  const [modalSearch, setModalSearch] = useState("");

  // Strictly filter only standard 13 INM profiles (exclude IMP-RS or duplicates)
  const strictlyInmProfiles = useMemo(() => {
    const rawInm = indicatorProfiles.filter(
      (item) => (item.category || "").trim().toUpperCase() === "INM",
    );
    // Deduplicate by normalized title
    const seenTitles = new Set<string>();
    const unique = rawInm.filter((item) => {
      const norm = (item.indicator_title || "").toLowerCase().replace(/[^a-z0-9]/g, "");
      if (seenTitles.has(norm)) return false;
      seenTitles.add(norm);
      return true;
    });

    // Exclude any doctor/non-INM indicators that might have been miscategorized
    const cleaned = unique.filter((item) => {
      const titleLower = (item.indicator_title || "").toLowerCase();
      if (titleLower.includes("dokter") && titleLower.includes("kebersihan tangan")) return false;
      return true;
    });

    // Sort strictly by standard 13 INM Kemenkes sequence
    const getInmRank = (title: string) => {
      const t = (title || "").toLowerCase();
      if (t.includes("kebersihan tangan") || t.includes("hand hygiene")) return 1;
      if (t.includes("alat pelindung diri") || t.includes("apd")) return 2;
      if (t.includes("identifikasi")) return 3;
      if (t.includes("seksio") || t.includes("sectio") || t.includes("caesarea")) return 4;
      if (t.includes("waktu tunggu") || t.includes("rawat jalan")) return 5;
      if (t.includes("penundaan operasi") || t.includes("elektif")) return 6;
      if (t.includes("visite") || t.includes("dpjp")) return 7;
      if (t.includes("hasil kritis") || t.includes("laboratorium")) return 8;
      if (t.includes("formularium") || t.includes("fornas")) return 9;
      if (t.includes("alur klinis") || t.includes("clinical pathway")) return 10;
      if (t.includes("jatuh")) return 11;
      if (t.includes("komplain") || t.includes("pengaduan")) return 12;
      if (t.includes("kepuasan")) return 13;
      return 99;
    };

    cleaned.sort((a, b) => getInmRank(a.indicator_title) - getInmRank(b.indicator_title));
    return cleaned.slice(0, 13);
  }, [indicatorProfiles]);

  const chartCategoryProfiles = useMemo(() => {
    if (chartCategory === "INM") return strictlyInmProfiles;
    return indicatorProfiles.filter(
      (p) => normalizeCategory(p.category) === chartCategory,
    );
  }, [chartCategory, strictlyInmProfiles, indicatorProfiles]);

  const filteredDropdownProfiles = useMemo(() => {
    return chartCategoryProfiles.filter(
      (p) =>
        !dropdownSearch ||
        p.indicator_title.toLowerCase().includes(dropdownSearch.toLowerCase()),
    );
  }, [chartCategoryProfiles, dropdownSearch]);

  const activeIndikatorId = useMemo(() => {
    if (
      selectedIndikatorId &&
      chartCategoryProfiles.some((p) => p.id === selectedIndikatorId)
    ) {
      return selectedIndikatorId;
    }
    return (
      filteredDropdownProfiles[0]?.id ||
      chartCategoryProfiles[0]?.id ||
      strictlyInmProfiles[0]?.id ||
      ""
    );
  }, [
    selectedIndikatorId,
    chartCategoryProfiles,
    filteredDropdownProfiles,
    strictlyInmProfiles,
  ]);

  // Fetch inputs from Local DB on mount & subscribe to realtime updates
  useEffect(() => {
    const fetchSupabaseInputs = async () => {
      try {
        const { data, error } = await supabase
          .from("indicator_inputs")
          .select("*")
          .order("created_at", { ascending: true });

        if (!error && Array.isArray(data)) {
          const currentProfiles = useStore.getState().indicatorProfiles;
          setDataMutuList(mapDbInputsToMutuPayloads(data, currentProfiles));
        }
      } catch (err) {
        console.warn(
          "Supabase load skipped or delayed, relying on client memory",
          err,
        );
      }
    };
    fetchSupabaseInputs();

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchSupabaseInputs();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    // Set up Realtime listener for indicator inputs & master indicator updates
    const inputsChannel = supabase
      .channel("dashboard-inputs-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "indicator_inputs" },
        () => {
          fetchSupabaseInputs();
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "master_indikator" },
        () => {
          fetchSupabaseInputs();
        },
      )
      .subscribe();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      supabase.removeChannel(inputsChannel);
    };
  }, [indicatorProfiles, setDataMutuList]);

  // Filtered Input Data based on Period (Timezone-Safe & Real-Time)
  const filteredDataMutu = useMemo(() => {
    return dataMutuList.filter((d) => {
      const parts = parseIsoDateParts(d.tanggal);
      if (!parts) return false;
      const mYear = String(parts.year);
      const monthIndex = parts.monthIndex; // 0 - 11
      const mMonthName = parts.monthName;

      if (mYear !== selectedTahun) return false;

      if (periodeMode === "Bulanan") {
        return mMonthName === selectedBulan;
      }
      if (periodeMode === "Triwulan") {
        if (selectedTriwulan === "Triwulan 1")
          return monthIndex >= 0 && monthIndex <= 2;
        if (selectedTriwulan === "Triwulan 2")
          return monthIndex >= 3 && monthIndex <= 5;
        if (selectedTriwulan === "Triwulan 3")
          return monthIndex >= 6 && monthIndex <= 8;
        if (selectedTriwulan === "Triwulan 4")
          return monthIndex >= 9 && monthIndex <= 11;
      }
      if (periodeMode === "Semester") {
        if (selectedSemester === "Semester 1")
          return monthIndex >= 0 && monthIndex <= 5;
        if (selectedSemester === "Semester 2")
          return monthIndex >= 6 && monthIndex <= 11;
      }
      if (periodeMode === "Tahunan") {
        return true;
      }
      return true;
    });
  }, [
    dataMutuList,
    periodeMode,
    selectedBulan,
    selectedTahun,
    selectedTriwulan,
    selectedSemester,
  ]);

  const buildTableRowForProfile = (item: any, index: number) => {
    const matchingEntries = filteredDataMutu.filter(
      (d) => d.indikator_id === item.id,
    );
    let capaianVal = 0;
    let status: "green" | "orange" | "red" = "red";

    if (matchingEntries.length > 0) {
      const agg = aggregateEntriesCapaian(matchingEntries);
      capaianVal = agg.capaian;
      const rawTarget = item.target || matchingEntries[0]?.target || 80;
      const evalRes = evaluateAchievementStatus(
        capaianVal,
        rawTarget,
        item.reverse,
      );
      status = evalRes.colorStatus;
    }

    const formattedTarget = formatTarget(
      item.target,
      item.measurement_unit,
      item.reverse,
    );

    const uniqueUnits = Array.from(
      new Set(matchingEntries.map((e) => e.unit).filter(Boolean)),
    );

    return {
      no: index + 1,
      id: item.id,
      name: item.indicator_title,
      category: normalizeCategory(item.category),
      target: formattedTarget,
      targetNum: parseNumericTarget(item.target, 80),
      capaian: matchingEntries.length > 0 ? `${capaianVal.toFixed(1)}%` : "0%",
      status: matchingEntries.length > 0 ? status : "red",
      unit_id: uniqueUnits.length > 0 ? uniqueUnits.join(", ") : "-",
      tanggal:
        matchingEntries.length > 0
          ? matchingEntries[matchingEntries.length - 1].tanggal
          : "-",
    };
  };

  // Map 13 indicators table data based strictly on standard INM profiles
  const inmTableData = strictlyInmProfiles.map((item, index) =>
    buildTableRowForProfile(item, index),
  );

  // Full active indicators table data (INM, IMP-RS, IMP-Unit, SPM) for "Total Indikator Aktif" modal
  const allIndicatorsTableData = indicatorProfiles.map((item, index) =>
    buildTableRowForProfile(item, index),
  );

  const tercapaiCount = inmTableData.filter((i) => i.status === "green").length;
  const belumTercapaiCount = inmTableData.filter(
    (i) => i.status === "red" || i.status === "orange",
  ).length;

  // IKP (Insiden Keselamatan Pasien) Aggregation Logic
  const ikpDataRaw = filteredDataMutu.filter((d) => d.kategori === "IKP");
  const totalIkp = {
    KPC: ikpDataRaw.reduce((sum, item) => sum + (Number(item.kpc) || 0), 0),
    KNC: ikpDataRaw.reduce((sum, item) => sum + (Number(item.knc) || 0), 0),
    KTC: ikpDataRaw.reduce((sum, item) => sum + (Number(item.ktc) || 0), 0),
    KTD: ikpDataRaw.reduce((sum, item) => sum + (Number(item.ktd) || 0), 0),
    Sentinel: ikpDataRaw.reduce(
      (sum, item) => sum + (Number(item.sentinel) || 0),
      0,
    ),
  };

  // Convert to clean list of records with count > 0 for Pie Chart representation (Diagram Lingkaran saja)
  const ikpPieData = [
    { name: "KPC", value: totalIkp.KPC, color: "#10a37f" },
    { name: "KNC", value: totalIkp.KNC, color: "#3b82f6" },
    { name: "KTC", value: totalIkp.KTC, color: "#eab308" },
    { name: "KTD", value: totalIkp.KTD, color: "#f97316" },
    { name: "Sentinel", value: totalIkp.Sentinel, color: "#ef4444" },
  ].filter((item) => item.value > 0);

  const totalIncidentCount = ikpPieData.reduce(
    (sum, item) => sum + item.value,
    0,
  );

  // Find detail setup of chosen indicator
  const selectedIndikatorProfile = useMemo(() => {
    return indicatorProfiles.find((p) => p.id === activeIndikatorId);
  }, [indicatorProfiles, activeIndikatorId]);

  // Compute real-time monthly performance for chosen indicator based strictly on standard input records
  const selectedChartData = useMemo(() => {
    const matching = filteredDataMutu.filter(
      (d) => d.indikator_id === activeIndikatorId,
    );
    if (matching.length === 0) return [];

    // Group actual records by Month index (timezone-safe) to yield authentic progress statistics
    const monthlyGroups = new Map<number, typeof matching>();
    matching.forEach((item) => {
      const parts = parseIsoDateParts(item.tanggal);
      if (!parts) return;
      const list = monthlyGroups.get(parts.monthIndex) || [];
      list.push(item);
      monthlyGroups.set(parts.monthIndex, list);
    });

    const rawTarget = selectedIndikatorProfile?.target ?? matching[0]?.target ?? 80;
    const isRev = isReverseIndicatorTarget(
      rawTarget,
      selectedIndikatorProfile?.reverse,
    );
    const numTarget = parseNumericTarget(rawTarget, isRev ? 0 : 80);

    return Array.from(monthlyGroups.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([monthIdx, items]) => {
        const agg = aggregateEntriesCapaian(items);
        return {
          name: INDONESIAN_MONTHS[monthIdx] || "Januari",
          Capaian: Number.isNaN(agg.capaian) ? 0 : agg.capaian,
          Target: numTarget,
        };
      });
  }, [filteredDataMutu, activeIndikatorId, selectedIndikatorProfile]);

  const selectedChartAnalysis = useMemo(() => {
    if (
      !selectedChartData ||
      selectedChartData.length === 0 ||
      !selectedIndikatorProfile
    )
      return null;

    let totalCap = 0;
    selectedChartData.forEach((d) => (totalCap += d.Capaian));
    const avgCap =
      selectedChartData.length > 0
        ? parseFloat((totalCap / selectedChartData.length).toFixed(2))
        : 0;
    const target = selectedChartData[0]?.Target ?? 80;

    const evalRes = evaluateAchievementStatus(
      avgCap,
      selectedIndikatorProfile.target ?? target,
      selectedIndikatorProfile.reverse,
    );
    const isReverse = evalRes.isReverse;
    const isSuccess = evalRes.isSuccess;

    const status =
      evalRes.status === "Mendekati" ? "Mendekati Target" : evalRes.status;

    let longPeriodName = `Tahun ${selectedTahun}`;
    let shortPeriod = "Tahunan";
    if (periodeMode === "Bulanan") {
      longPeriodName = `bulan ${selectedBulan} Tahun ${selectedTahun}`;
      shortPeriod = "Bulanan";
    }
    if (periodeMode === "Triwulan") {
      let twStr = "";
      if (selectedTriwulan.includes("1")) twStr = "Triwulan I";
      if (selectedTriwulan.includes("2")) twStr = "Triwulan II";
      if (selectedTriwulan.includes("3")) twStr = "Triwulan III";
      if (selectedTriwulan.includes("4")) twStr = "Triwulan IV";
      longPeriodName = `${twStr} Tahun ${selectedTahun}`;
      shortPeriod = "Triwulan";
    }
    if (periodeMode === "Semester") {
      let semStr = "";
      if (selectedSemester.includes("1")) semStr = "Semester I";
      if (selectedSemester.includes("2")) semStr = "Semester II";
      longPeriodName = `${semStr} Tahun ${selectedTahun}`;
      shortPeriod = "Semester";
    }

    const indTitle = selectedIndikatorProfile.indicator_title;
    
    // Generate base narrative
    let narasi = "";
    if (shortPeriod === "Bulanan") {
      narasi = `Berdasarkan hasil pemantauan ${longPeriodName} di UOBK RSUD Al-Mulk Kota Sukabumi, capaian indikator ${indTitle} sebesar ${avgCap}%, `;
    } else {
      narasi = `Berdasarkan hasil pemantauan ${longPeriodName} di UOBK RSUD Al-Mulk Kota Sukabumi, diperoleh rata-rata capaian indikator ${indTitle} sebesar ${avgCap}%, `;
    }

    const opTargetText = isReverse ? `≤${target}%` : `≥${target}%`;
    if (isSuccess) {
      narasi += `telah mencapai target nasional yaitu ${opTargetText}.`;
    } else {
      narasi += `masih berada di bawah target nasional yaitu ${opTargetText}.`;
    }

    // Trend analysis
    let trendStr = "";
    if (selectedChartData.length > 1) {
      const firstCap = selectedChartData[0].Capaian;
      const lastCap = selectedChartData[selectedChartData.length - 1].Capaian;
      const diff = lastCap - firstCap;

      let isMonotonicIncrease = true;
      let isMonotonicDecrease = true;

      for (let i = 1; i < selectedChartData.length; i++) {
        const prev = selectedChartData[i - 1].Capaian;
        const curr = selectedChartData[i].Capaian;
        if (curr < prev) isMonotonicIncrease = false;
        if (curr > prev) isMonotonicDecrease = false;
      }

      if (isMonotonicIncrease && diff > 0) {
        trendStr = `Terdapat tren peningkatan capaian dari bulan ${selectedChartData[0].name.toLowerCase()} hingga ${selectedChartData[selectedChartData.length - 1].name.toLowerCase()} yang menunjukkan adanya perbaikan kepatuhan petugas terhadap indikator yang diukur.`;
      } else if (isMonotonicDecrease && diff < 0) {
        trendStr = `Terdapat tren penurunan capaian dari bulan ${selectedChartData[0].name.toLowerCase()} hingga ${selectedChartData[selectedChartData.length - 1].name.toLowerCase()} yang perlu menjadi perhatian untuk dilakukan evaluasi lebih lanjut.`;
      } else if (diff > 5) {
        trendStr = "Terdapat tren peningkatan capaian pada beberapa periode terakhir yang menunjukkan perbaikan berkelanjutan.";
      } else if (diff < -5) {
        trendStr = "Terdapat tren penurunan capaian pada beberapa periode yang perlu menjadi perhatian untuk dilakukan evaluasi lebih lanjut.";
      } else {
        trendStr = "Capaian indikator relatif stabil pada seluruh periode pemantauan.";
      }
    }

    // Conclusion
    let conclusion = "";
    if (isSuccess) {
      conclusion = "Walaupun terdapat variasi capaian antar periode, indikator telah memenuhi target yang ditetapkan sehingga mutu pelayanan dinilai baik.";
    } else {
      conclusion = "Hal ini menunjukkan pencapaian masih belum optimal. Indikator masih belum mencapai target yang ditetapkan sehingga diperlukan upaya perbaikan berkelanjutan melalui monitoring dan evaluasi rutin.";
    }

    // Recommendations
    let recommendations: string[] = [];
    if (!isSuccess) {
      recommendations = [
        "Meningkatkan sosialisasi kepada petugas.",
        "Melakukan audit internal secara berkala.",
        "Memperkuat supervisi kepala unit.",
        "Memberikan umpan balik hasil monitoring.",
        "Menyusun rencana tindak lanjut perbaikan."
      ];
    } else {
      recommendations = [
        "Mempertahankan capaian yang sudah baik.",
        "Melakukan monitoring rutin.",
        "Menjadikan unit dengan capaian tinggi sebagai role model."
      ];
    }

    return {
      avgCap,
      target,
      status,
      longPeriodName,
      indicatorTitle: indTitle,
      narasi,
      trendStr,
      conclusion,
      recommendations
    };
  }, [
    selectedChartData,
    selectedIndikatorProfile,
    periodeMode,
    selectedBulan,
    selectedTriwulan,
    selectedSemester,
    selectedTahun,
  ]);

  return (
    <div className="dashboard-3d-cards space-y-5 md:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-6 w-full max-w-full px-2 sm:px-4 md:px-0 md:overflow-visible">
      {/* Welcome Hero Greeting Banner - 3D Out-of-Bounds Pop-Out Character Style (Aligned with Sidebar Menu) */}
      <div className="relative pt-0 group">
        {/* Card Main Body (Clipped inside rounded-3xl border) */}
        <div className="bg-white rounded-3xl border border-emerald-200/60 drop-shadow-card p-4 sm:p-5 md:py-5 md:px-6 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-4 min-h-[152px] sm:min-h-[162px] transition-all duration-300">
          {/* Top Edge Highlight Line */}
          <div className="absolute top-0 left-8 right-8 h-[1.5px] bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent pointer-events-none" />

          {/* 3D Animated Hospital Background (RSUD AL-MULK) - Original Vibrant Colors */}
          <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-[55%] xl:w-[50%] pointer-events-none z-0 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/uploads/hospital_background_3d.png?v=3"
              alt="Gedung RSUD Al-Mulk 3D Animation"
              className="w-full h-full object-cover object-[center_35%] opacity-100 select-none"
            />
          </div>

          {/* Left Side: Dynamic Greeting & Title with Accent Bar */}
          <div className="relative z-10 flex items-start gap-3.5 md:gap-4 flex-1 min-w-0 w-full lg:max-w-[60%] xl:max-w-[62%]">
            {/* Vertical Green Accent Bar */}
            <div className="w-1.5 self-stretch bg-gradient-to-b from-[#10a37f] via-[#059669] to-[#007A4D] rounded-full shrink-0 shadow-[0_0_12px_rgba(16,163,127,0.4)]" />

            <div className="space-y-1 sm:space-y-1.5 min-w-0">
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl md:text-[31px] font-extrabold text-[#007A4D] tracking-tight leading-tight flex items-center gap-2.5">
                  <span>{greeting.text}</span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={greeting.image}
                    alt={greeting.text}
                    className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 object-contain drop-shadow-[0_4px_10px_rgba(245,158,11,0.22)] select-none transition-transform duration-300 hover:scale-110"
                  />
                </h1>
              </div>

              <h2 className="text-xl sm:text-2xl md:text-[25px] font-extrabold text-[#007A4D] tracking-tight leading-tight">
                Hai, Sobat UOBK RSUD AL-MULK
              </h2>

              <p className="text-sm sm:text-[15px] md:text-base font-bold text-slate-800 leading-snug pt-0.5">
                Selamat Datang di Dashboard Aplikasi Mutu Rumah Sakit
              </p>
              <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed italic max-w-xl">
                &quot;Optimalisasi Sistem Pelaporan Mutu (OPTIMUS) untuk pemantauan capaian indikator, keselamatan pasien, dan peningkatan mutu berkelanjutan.&quot;
              </p>
            </div>
          </div>

          {/* Spacer on Desktop for the 3D Pop-Out Characters */}
          <div className="hidden lg:block w-[320px] xl:w-[370px] shrink-0" />
        </div>

        {/* 3D Out-of-Bounds Pop-Out Characters Layer (Breaks Out Above Card Top Border, Slides Cleanly Under Fixed Header) */}
        <div className="relative lg:absolute lg:bottom-[1px] lg:right-5 xl:right-8 z-20 flex justify-center lg:justify-end mt-2 lg:mt-0 pointer-events-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/uploads/medical_team_popout.png?v=3"
            alt="Tim Medis UOBK RSUD Al-Mulk"
            className="h-[150px] sm:h-[168px] lg:h-[180px] xl:h-[188px] w-auto object-contain object-bottom drop-shadow-[0_10px_20px_rgba(0,95,58,0.22)] transition-transform duration-500 group-hover:scale-[1.03] origin-bottom"
          />
        </div>
      </div>

      {/* Metric Controls Bar: Filter Periode tepat di pojok kanan atas 4 Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.9)] animate-pulse" />
          <span className="text-xs sm:text-[13px] font-black text-slate-700 uppercase tracking-wide">
            REKAPITULASI CAPAIAN INDIKATOR MUTU RUMAH SAKIT
          </span>
        </div>

        {/* Filter Periode di pojok kanan atas 4 Card */}
        <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto bg-white/95 backdrop-blur-xs p-1 sm:p-1.5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-center gap-1.5 clay-select px-3 py-1.5 shrink-0">
            <Filter size={13} className="text-emerald-600" />
            <select
              value={periodeMode}
              onChange={(e) => setPeriodeMode(e.target.value)}
              className="py-0.5 bg-transparent outline-none text-xs font-bold text-gray-700 cursor-pointer"
            >
              <option value="Bulanan">Bulanan</option>
              <option value="Triwulan">Triwulan</option>
              <option value="Semester">Semester</option>
              <option value="Tahunan">Tahunan</option>
            </select>
          </div>

          {periodeMode === "Bulanan" && (
            <select
              value={selectedBulan}
              onChange={(e) => setSelectedBulan(e.target.value)}
              className="px-3 py-1.5 clay-select outline-none text-xs font-bold text-gray-700 cursor-pointer"
            >
              {[
                "Januari",
                "Februari",
                "Maret",
                "April",
                "Mei",
                "Juni",
                "Juli",
                "Agustus",
                "September",
                "Oktober",
                "November",
                "Desember",
              ].map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          )}

          {periodeMode === "Triwulan" && (
            <select
              value={selectedTriwulan}
              onChange={(e) => setSelectedTriwulan(e.target.value)}
              className="px-3 py-1.5 clay-select outline-none text-xs font-bold text-gray-700 cursor-pointer"
            >
              <option value="Triwulan 1">Triwulan 1 (Jan-Mar)</option>
              <option value="Triwulan 2">Triwulan 2 (Apr-Jun)</option>
              <option value="Triwulan 3">Triwulan 3 (Jul-Sep)</option>
              <option value="Triwulan 4">Triwulan 4 (Okt-Des)</option>
            </select>
          )}

          {periodeMode === "Semester" && (
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="px-3 py-1.5 clay-select outline-none text-xs font-bold text-gray-700 cursor-pointer"
            >
              <option value="Semester 1">Semester 1 (Jan-Jun)</option>
              <option value="Semester 2">Semester 2 (Jul-Des)</option>
            </select>
          )}

          <select
            value={selectedTahun}
            onChange={(e) => setSelectedTahun(e.target.value)}
            className="px-3 py-1.5 clay-select outline-none text-xs font-bold text-gray-700 cursor-pointer"
          >
            {Array.from({ length: 5 }).map((_, i) => {
              const y = currentYear - i;
              return (
                <option key={y} value={y}>
                  {y}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 md:gap-3.5 xl:gap-4.5 2xl:gap-5">
        {/* Card 1: Pemenuhan Target INM */}
        <div
          role="button"
          tabIndex={0}
          aria-label="Pemenuhan Target INM"
          onClick={() => setActiveModal("TERCAPAI")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setActiveModal("TERCAPAI");
            }
          }}
          className="clay-card-emerald p-3 sm:p-3.5 xl:p-4.5 2xl:p-5 flex flex-col cursor-pointer relative overflow-hidden group h-full select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          {/* Garis Warna Efek Bawah Card */}
          <div className="absolute bottom-0 left-0 right-0 h-1.5 md:h-2 bg-gradient-to-r from-emerald-400 to-emerald-600 shadow-[0_0_15px_rgba(16,163,127,0.8)] opacity-90 group-hover:opacity-100 group-hover:h-2.5 transition-all duration-300" />
          <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-200/20 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-start justify-between">
              <div className="p-2 sm:p-2.5 xl:p-3 rounded-2xl xl:rounded-[20px] clay-icon-emerald text-white flex-shrink-0 transition-transform duration-200 group-hover:scale-105">
                <PhTarget weight="duotone" className="h-5 w-5 sm:h-5.5 sm:w-5.5 xl:h-6.5 xl:w-6.5 text-white drop-shadow-sm" />
              </div>
              <div className="p-1 sm:p-1.5 xl:p-2 bg-emerald-100/70 border border-emerald-200/60 rounded-xl text-emerald-700 shadow-xs shrink-0">
                <TrendUp weight="duotone" className="w-3.5 h-3.5 sm:w-4 sm:h-4 xl:w-5 xl:h-5" />
              </div>
            </div>

            <div className="mt-2 sm:mt-2.5 xl:mt-3.5">
              <p className="text-[10px] sm:text-[10.5px] md:text-[10px] lg:text-[10.5px] xl:text-[12px] 2xl:text-[13px] font-extrabold text-slate-500 uppercase tracking-tight whitespace-nowrap overflow-hidden text-ellipsis leading-tight mb-0.5">
                Pemenuhan Target INM
              </p>
              <h3 className="text-[24px] sm:text-[28px] lg:text-[32px] xl:text-[38px] 2xl:text-[44px] font-black text-slate-800 leading-none mt-1 sm:mt-1.5 md:mt-2 mb-1.5 md:mb-2 flex items-baseline tracking-tight tabular-nums">
                {tercapaiCount}
                <span className="text-xs sm:text-sm xl:text-lg 2xl:text-xl text-slate-400 font-bold ml-1.5">
                  / 13
                </span>
              </h3>
            </div>

            {/* Progress bar sunken slot */}
            <div className="space-y-1 mt-1 sm:mt-1.5">
              <div className="flex items-center justify-between text-[9.5px] sm:text-[10.5px] font-black text-slate-400 tabular-nums">
                <span>0%</span>
                <span className="text-emerald-600 font-black">{((tercapaiCount / 13) * 100).toFixed(0)}%</span>
              </div>
              <div className="h-1.5 sm:h-2 xl:h-2.5 w-full clay-inset rounded-full p-0.5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full shadow-[0_1px_3px_rgba(16,185,129,0.5)] relative overflow-hidden transition-all duration-500"
                  style={{ width: `${(tercapaiCount / 13) * 100}%` }}
                >
                  <div className="absolute top-0 left-0 bottom-0 right-0 bg-white/30 animate-pulse" />
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-auto pt-2 sm:pt-2.5 xl:pt-3.5 border-t border-emerald-100/70">
              <span className="clay-badge-emerald px-2 sm:px-2.5 xl:px-3 py-1 sm:py-1.5 xl:py-2 rounded-full text-emerald-700 text-[9px] sm:text-[9.5px] xl:text-[10.5px] 2xl:text-xs font-extrabold flex items-center justify-center gap-1.5 w-full text-center whitespace-nowrap overflow-hidden text-ellipsis">
                <span className="inline-block w-1.5 h-1.5 xl:w-2 xl:h-2 rounded-full bg-emerald-500 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.9)]" />
                <span className="truncate">
                  {tercapaiCount > 0
                    ? "Target INM Tercapai"
                    : "Belum Ada Indikator Tercapai"}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Indikator Belum Tercapai */}
        <div
          role="button"
          tabIndex={0}
          aria-label="Indikator Belum Tercapai"
          onClick={() => setActiveModal("BELUM_TERCAPAI")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setActiveModal("BELUM_TERCAPAI");
            }
          }}
          className="clay-card-red p-3 sm:p-3.5 xl:p-4.5 2xl:p-5 flex flex-col cursor-pointer relative overflow-hidden group h-full select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
        >
          {/* Garis Warna Efek Bawah Card */}
          <div className="absolute bottom-0 left-0 right-0 h-1.5 md:h-2 bg-gradient-to-r from-red-400 to-red-600 shadow-[0_0_15px_rgba(220,38,38,0.8)] opacity-90 group-hover:opacity-100 group-hover:h-2.5 transition-all duration-300" />
          <div className="absolute top-0 right-0 w-36 h-36 bg-red-200/20 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-start justify-between">
              <div className="p-2 sm:p-2.5 xl:p-3 rounded-2xl xl:rounded-[20px] clay-icon-red text-white flex-shrink-0 transition-transform duration-200 group-hover:scale-105">
                <PhWarning weight="duotone" className="h-5 w-5 sm:h-5.5 sm:w-5.5 xl:h-6.5 xl:w-6.5 text-white drop-shadow-sm" />
              </div>
              <div className="p-1 sm:p-1.5 xl:p-2 bg-red-100/70 border border-red-200/60 rounded-xl text-red-600 shadow-xs shrink-0">
                <TrendDown weight="duotone" className="w-3.5 h-3.5 sm:w-4 sm:h-4 xl:w-5 xl:h-5" />
              </div>
            </div>

            <div className="mt-2 sm:mt-2.5 xl:mt-3.5">
              <p className="text-[10px] sm:text-[10.5px] md:text-[10px] lg:text-[10.5px] xl:text-[12px] 2xl:text-[13px] font-extrabold text-slate-500 uppercase tracking-tight whitespace-nowrap overflow-hidden text-ellipsis leading-tight mb-0.5">
                Indikator Belum Tercapai
              </p>
              <h3 className="text-[24px] sm:text-[28px] lg:text-[32px] xl:text-[38px] 2xl:text-[44px] font-black text-slate-800 leading-none mt-1 sm:mt-1.5 md:mt-2 mb-1.5 md:mb-2 tracking-tight tabular-nums">
                {belumTercapaiCount}
              </h3>
            </div>

            <div className="relative z-10 mt-auto pt-2 sm:pt-2.5 xl:pt-3.5 border-t border-red-100/70">
              <span className="clay-badge-red px-2 sm:px-2.5 xl:px-3 py-1 sm:py-1.5 xl:py-2 rounded-full text-red-700 text-[9px] sm:text-[9.5px] xl:text-[10.5px] 2xl:text-xs font-extrabold flex items-center justify-center gap-1.5 w-full text-center whitespace-nowrap overflow-hidden text-ellipsis">
                <span className="inline-block w-1.5 h-1.5 xl:w-2 xl:h-2 rounded-full bg-red-500 shrink-0 shadow-[0_0_8px_rgba(239,68,68,0.9)]" />
                <span className="truncate">Perlu Perbaikan Mutu</span>
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Kejadian IKP */}
        <div
          role="button"
          tabIndex={0}
          aria-label="Kejadian IKP Tercatat"
          onClick={() => setActiveModal("IKP")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setActiveModal("IKP");
            }
          }}
          className="clay-card-blue p-3 sm:p-3.5 xl:p-4.5 2xl:p-5 flex flex-col cursor-pointer relative overflow-hidden group h-full select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          {/* Garis Warna Efek Bawah Card */}
          <div className="absolute bottom-0 left-0 right-0 h-1.5 md:h-2 bg-gradient-to-r from-blue-400 to-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.8)] opacity-90 group-hover:opacity-100 group-hover:h-2.5 transition-all duration-300" />
          <div className="absolute top-0 right-0 w-36 h-36 bg-blue-200/20 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-start justify-between">
              <div className="p-2 sm:p-2.5 xl:p-3 rounded-2xl xl:rounded-[20px] clay-icon-blue text-white flex-shrink-0 transition-transform duration-200 group-hover:scale-105">
                <ShieldWarning weight="duotone" className="h-5 w-5 sm:h-5.5 sm:w-5.5 xl:h-6.5 xl:w-6.5 text-white drop-shadow-sm" />
              </div>
              <div className="p-1 sm:p-1.5 xl:p-2 bg-blue-100/70 border border-blue-200/60 rounded-xl text-blue-600 shadow-xs shrink-0">
                <PhFileText weight="duotone" className="w-3.5 h-3.5 sm:w-4 sm:h-4 xl:w-5 xl:h-5" />
              </div>
            </div>

            <div className="mt-2 sm:mt-2.5 xl:mt-3.5">
              <p className="text-[10px] sm:text-[10.5px] md:text-[10px] lg:text-[10.5px] xl:text-[12px] 2xl:text-[13px] font-extrabold text-slate-500 uppercase tracking-tight whitespace-nowrap overflow-hidden text-ellipsis leading-tight mb-0.5">
                Kejadian IKP Tercatat
              </p>
              <div className="flex items-baseline gap-1 sm:gap-1.5 mt-1 sm:mt-1.5 md:mt-2 mb-1.5 md:mb-2">
                <h3 className="text-[24px] sm:text-[28px] lg:text-[32px] xl:text-[38px] 2xl:text-[44px] font-black text-slate-800 leading-none tracking-tight tabular-nums">
                  {totalIncidentCount}
                </h3>
                <span className="text-xs sm:text-sm xl:text-lg 2xl:text-xl text-slate-400 font-bold">
                  Laporan
                </span>
              </div>
            </div>

            <div className="relative z-10 mt-auto pt-2 sm:pt-2.5 xl:pt-3.5 border-t border-blue-100/70">
              <div className="clay-badge-blue px-2 sm:px-2.5 xl:px-3 py-1 sm:py-1.5 xl:py-2 rounded-full flex items-center justify-between w-full gap-1">
                <span className="text-blue-700 text-[9px] sm:text-[9.5px] xl:text-[10.5px] 2xl:text-xs font-extrabold flex items-center gap-1 sm:gap-1.5 whitespace-nowrap shrink-0">
                  <span className="inline-block w-1.5 h-1.5 xl:w-2 xl:h-2 rounded-full bg-blue-500 shrink-0 shadow-[0_0_8px_rgba(59,130,246,0.9)]" />
                  Laporan Masuk
                </span>
                <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-blue-600 text-white text-[7.5px] sm:text-[8px] xl:text-[9px] font-black uppercase flex items-center gap-1 shadow-xs shrink-0 whitespace-nowrap">
                  Realtime <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Total Indikator */}
        <div
          role="button"
          tabIndex={0}
          aria-label="Total Indikator Aktif"
          onClick={() => setActiveModal("ALL")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setActiveModal("ALL");
            }
          }}
          className="clay-card-orange p-3 sm:p-3.5 xl:p-4.5 2xl:p-5 flex flex-col cursor-pointer relative overflow-hidden group h-full select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
        >
          {/* Garis Warna Efek Bawah Card */}
          <div className="absolute bottom-0 left-0 right-0 h-1.5 md:h-2 bg-gradient-to-r from-orange-400 to-orange-600 shadow-[0_0_15px_rgba(234,88,12,0.8)] opacity-90 group-hover:opacity-100 group-hover:h-2.5 transition-all duration-300" />
          <div className="absolute top-0 right-0 w-36 h-36 bg-orange-200/20 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-start justify-between">
              <div className="p-2 sm:p-2.5 xl:p-3 rounded-2xl xl:rounded-[20px] clay-icon-orange text-white flex-shrink-0 transition-transform duration-200 group-hover:scale-105">
                <ListChecks weight="duotone" className="h-5 w-5 sm:h-5.5 sm:w-5.5 xl:h-6.5 xl:w-6.5 text-white drop-shadow-sm" />
              </div>
              <div className="p-1 sm:p-1.5 xl:p-2 bg-orange-100/70 border border-orange-200/60 rounded-xl text-orange-600 shadow-xs shrink-0">
                <UsersThree weight="duotone" className="w-3.5 h-3.5 sm:w-4 sm:h-4 xl:w-5 xl:h-5" />
              </div>
            </div>

            <div className="mt-2 sm:mt-2.5 xl:mt-3.5">
              <p className="text-[10px] sm:text-[10.5px] md:text-[10px] lg:text-[10.5px] xl:text-[12px] 2xl:text-[13px] font-extrabold text-slate-500 uppercase tracking-tight whitespace-nowrap overflow-hidden text-ellipsis leading-tight mb-0.5">
                Total Indikator Aktif
              </p>
              <h3 className="text-[24px] sm:text-[28px] lg:text-[32px] xl:text-[38px] 2xl:text-[44px] font-black text-slate-800 leading-none mt-1 sm:mt-1.5 md:mt-2 mb-1.5 md:mb-2 tracking-tight tabular-nums">
                {indicatorProfiles.length}
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-1 sm:gap-1.5 xl:gap-2 mt-auto pt-2 sm:pt-2.5 xl:pt-3.5 border-t border-orange-100/70">
              <div className="clay-badge-orange px-1.5 sm:px-2 py-1 xl:py-1.5 rounded-lg xl:rounded-xl flex items-center justify-center sm:justify-start gap-1 min-w-0">
                <PhShieldCheck weight="duotone" className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
                <span className="text-[8.5px] sm:text-[9px] xl:text-[10px] font-bold text-slate-600 whitespace-nowrap truncate tabular-nums">INM: <strong className="text-slate-900">{inmCount}</strong></span>
              </div>
              <div className="clay-badge-orange px-1.5 sm:px-2 py-1 xl:py-1.5 rounded-lg xl:rounded-xl flex items-center justify-center sm:justify-start gap-1 min-w-0">
                <Buildings weight="duotone" className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 shrink-0" />
                <span className="text-[8.5px] sm:text-[9px] xl:text-[10px] font-bold text-slate-600 whitespace-nowrap truncate tabular-nums">IMP-RS: <strong className="text-slate-900">{impRsCount}</strong></span>
              </div>
              <div className="clay-badge-orange px-1.5 sm:px-2 py-1 xl:py-1.5 rounded-lg xl:rounded-xl flex items-center justify-center sm:justify-start gap-1 min-w-0">
                <PhHospital weight="duotone" className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600 shrink-0" />
                <span className="text-[8.5px] sm:text-[9px] xl:text-[10px] font-bold text-slate-600 whitespace-nowrap truncate tabular-nums">IMP-U: <strong className="text-slate-900">{impUnitCount}</strong></span>
              </div>
              <div className="clay-badge-orange px-1.5 sm:px-2 py-1 xl:py-1.5 rounded-lg xl:rounded-xl flex items-center justify-center sm:justify-start gap-1 min-w-0">
                <PhFileText weight="duotone" className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-600 shrink-0" />
                <span className="text-[8.5px] sm:text-[9px] xl:text-[10px] font-bold text-slate-600 whitespace-nowrap truncate tabular-nums">SPM: <strong className="text-slate-900">{spmCount}</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 1. 13 Indikator Nasional Mutu (INM) Table */}
      <div className="clay-surface p-4 md:p-6 lg:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 md:mb-8 gap-3 md:gap-4 md:px-2">
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-[#10a37f] tracking-tight leading-normal">
              13 Indikator Nasional Mutu (INM)
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2 md:gap-5 text-[9px] md:text-xs font-bold text-gray-600">
            <div className="flex items-center gap-1.5 md:gap-2">
              <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-emerald-500 shadow-xs shrink-0" />
              <span>Tercapai</span>
            </div>
            <div className="flex items-center gap-1.5 md:gap-2">
              <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-orange-400 shadow-xs shrink-0" />
              <span>Mendekati</span>
            </div>
            <div className="flex items-center gap-1.5 md:gap-2">
              <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-red-500 shadow-xs shrink-0" />
              <span>Tidak Tercapai</span>
            </div>
          </div>
        </div>

        <div className="overflow-hidden md:overflow-x-auto drop-shadow-table">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[400px] md:min-w-[700px] text-left border-collapse table-fixed">
              <thead>
                <tr className="bg-[#10a37f] text-white">
                  <th className="py-2 px-1.5 md:py-4 md:px-8 font-black text-[8px] md:text-xs border-r border-[#10a37f]/20 w-6 md:w-16 text-center">
                    NO
                  </th>
                  <th className="py-2 px-2 md:py-4 md:px-6 font-black text-[8px] md:text-xs uppercase tracking-wider text-center">
                    Indikator Mutu
                  </th>
                  <th className="py-2 px-1.5 md:py-4 md:px-6 font-black text-[8px] md:text-xs text-center uppercase tracking-wider w-12 md:w-32">
                    Target
                  </th>
                  <th className="py-2 px-1.5 md:py-4 md:px-8 font-black text-[8px] md:text-xs text-center uppercase tracking-wider w-14 md:w-32">
                    Capaian
                  </th>
                </tr>
              </thead>
              <tbody>
                {inmTableData.map((item, idx) => (
                  <tr
                    key={idx}
                    className={`border-b border-gray-50 hover:bg-emerald-50/45 transition-colors ${
                      idx % 2 === 0 ? "bg-white" : "bg-[#fafdfc]"
                    }`}
                  >
                    <td className="py-2 px-1.5 md:py-4 md:px-8 text-[8px] md:text-sm font-bold text-gray-500 text-center border-r border-gray-50">
                      {item.no}
                    </td>
                    <td className="py-2 px-2 md:py-4 md:px-6 text-[8px] md:text-sm font-extrabold text-gray-800 leading-snug break-words max-w-[120px] md:max-w-none">
                      {item.name}
                    </td>
                    <td className="py-2 px-1.5 md:py-4 md:px-6 text-[8px] md:text-sm font-black text-emerald-950 text-center">
                      {item.target}
                    </td>
                    <td className="py-2 px-1 md:py-4 md:px-8 text-center">
                      <span
                        className={`inline-block px-1 md:px-4 py-0.5 md:py-1.5 rounded-full text-[7px] md:text-xs font-black whitespace-nowrap border min-w-[40px] md:min-w-[75px] text-center ${
                          item.capaian === "0%"
                            ? "bg-slate-50 text-slate-400 border-slate-100"
                            : item.status === "red"
                              ? "bg-red-50 text-red-600 border-red-100"
                              : item.status === "orange"
                                ? "bg-orange-50 text-orange-600 border-orange-100"
                                : "bg-emerald-50 text-emerald-600 border-emerald-100"
                        }`}
                      >
                        {item.capaian}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 2. Real-time Performance Interactive Chart (INM, IMP-RS, IMP-Unit, SPM) */}
      <div className="clay-surface p-4 lg:p-8 space-y-4 md:space-y-6 transition-all duration-300">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 md:gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="text-[#10a37f] h-[18px] w-[18px] md:h-5 md:w-5" />
              <h3 className="text-sm md:text-xl font-extrabold text-[#10a37f] tracking-tight leading-normal" style={{ fontSize: "16px" }}>
                GRAFIK CAPAIAN MUTU {chartCategory}
              </h3>
            </div>
            <div className="inline-flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 gap-1">
              {(["INM", "IMP-RS", "IMP-Unit", "SPM"] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setChartCategory(cat);
                    setSelectedIndikatorId("");
                    setDropdownSearch("");
                    setIsDropdownOpen(false);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${
                    chartCategory === cat
                      ? "bg-[#10a37f] text-white shadow-xs"
                      : "text-slate-600 hover:text-emerald-700"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Selection filter - Professional Searchable Dropdown */}
          <div className="relative w-full lg:w-96 select-none z-30">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between px-4 py-3 clay-select outline-none text-xs font-black text-gray-700 cursor-pointer"
            >
              <span className="truncate pr-2">
                {selectedIndikatorProfile?.indicator_title ||
                  "Pilih Indikator Mutu"}
              </span>
              <ChevronRight
                size={16}
                className={`text-[#10a37f] transition-transform duration-300 transform ${
                  isDropdownOpen ? "rotate-90" : ""
                }`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in duration-200">
                <div className="p-2 border-b border-gray-100 bg-slate-50">
                  <input
                    type="text"
                    value={dropdownSearch}
                    onChange={(e) => setDropdownSearch(e.target.value)}
                    placeholder="Cari nama indikator..."
                    className="w-full px-3 py-2 text-xs font-semibold border border-slate-250 rounded-lg outline-none focus:ring-2 focus:ring-[#10a37f] transition-all bg-white text-gray-700"
                  />
                </div>
                <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-200 scrollbar-track-transparent">
                  {filteredDropdownProfiles.length === 0 ? (
                    <div className="p-4 text-center text-xs text-gray-400 font-bold">
                      Tidak ada hasil ditemukan
                    </div>
                  ) : (
                    filteredDropdownProfiles
                      .map((p) => {
                        const isSelected = p.id === activeIndikatorId;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              setSelectedIndikatorId(p.id);
                              setIsDropdownOpen(false);
                              setDropdownSearch("");
                            }}
                            className={`w-full text-left px-4 py-3 text-xs font-bold transition-colors hover:bg-emerald-50/50 flex items-center justify-between ${
                              isSelected
                                ? "bg-emerald-50/70 text-[#10a37f]"
                                : "text-gray-700"
                            }`}
                          >
                            <span className="truncate leading-tight block pr-2">
                              {p.indicator_title}
                            </span>
                            {isSelected && (
                              <CheckCircle2
                                size={14}
                                className="text-[#10a37f] shrink-0 ml-2"
                              />
                            )}
                          </button>
                        );
                      })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {selectedChartData.length === 0 ? (
          <div className="w-full flex items-center justify-center">
            <div className="flex flex-col items-center justify-center py-16 px-4 bg-slate-50/20 rounded-3xl border border-dashed border-gray-200 w-full animate-pulse">
              <div className="bg-slate-100 text-slate-400 p-4 rounded-full mb-3">
                <Activity size={24} />
              </div>
              <p className="text-slate-800 text-sm font-extrabold text-center">
                Belum Ada Catatan Riwayat Audit Indikator Ini
              </p>
              <p className="text-[11px] text-gray-400 mt-2 max-w-xs text-center leading-relaxed font-semibold">
                Silakan isi data laporan lewat tombol{" "}
                <Link
                  href="/input"
                  className="font-extrabold text-[#10a37f] hover:underline"
                >
                  Menu Input Data
                </Link>{" "}
                untuk merespons grafik progres riwayat mutu secara langsung.
              </p>
            </div>
          </div>
        ) : (
          <div className="drop-shadow-card p-6 flex flex-col items-center mt-3">
            <div className="text-center mb-6 w-full px-4">
              <h3 className="text-[16px] font-bold text-slate-800 leading-tight" style={{ fontSize: "16px" }}>
                {selectedChartAnalysis?.indicatorTitle}
              </h3>
              <p className="text-xs font-bold text-slate-500 mt-1.5 uppercase tracking-wider">
                UOBK RSUD AL-MULK KOTA SUKABUMI
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {selectedChartAnalysis?.longPeriodName}
              </p>
            </div>

            <div className="relative w-full h-[280px] shrink-0 mt-4">
              <div className="absolute inset-0 overflow-hidden">
                <ResponsiveContainer width="100%" height="100%" debounce={50} minWidth={0}>
                  <ComposedChart
                    data={selectedChartData}
                    margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 15, fill: "#64748b", fontWeight: "bold" }}
                      axisLine={false}
                      tickLine={false}
                      dy={10}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tickFormatter={(val) => (val === 0 ? "0" : val)}
                      tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 600 }}
                      axisLine={false}
                      tickLine={false}
                      tickCount={5}
                    />
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{ fill: "transparent" }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      align="center"
                      iconType="circle"
                      wrapperStyle={{
                        fontSize: "11px",
                        fontWeight: 600,
                        paddingTop: "15px",
                      }}
                    />
                    <Bar
                      shape={<TwoDShadowBar />}
                      dataKey="Capaian"
                      name="Capaian"
                      fill="#2563EB"
                      maxBarSize={48}
                      isAnimationActive={false}
                    >
                      <LabelList
                        dataKey="Capaian"
                        position="top"
                        offset={10}
                        formatter={(val: number) => val + "%"}
                        style={{
                          fontSize: "12px",
                          fontWeight: "bold",
                          fill: "#2563EB",
                        }}
                      />
                    </Bar>
                    <Bar
                      shape={<TwoDShadowBar />}
                      dataKey="Target"
                      name="Target"
                      fill="#DC2626"
                      maxBarSize={48}
                      isAnimationActive={false}
                    >
                      <LabelList
                        dataKey="Target"
                        position="top"
                        offset={10}
                        formatter={(val: number) => val + "%"}
                        style={{
                          fontSize: "12px",
                          fontWeight: "bold",
                          fill: "#DC2626",
                        }}
                      />
                    </Bar>
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="w-full mt-6 bg-slate-50/70 p-5 md:p-6 rounded-2xl border border-slate-100/80">
              <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Analisa Capaian
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed font-medium mb-4 text-justify">
                {selectedChartAnalysis?.narasi} {selectedChartAnalysis?.trendStr} {selectedChartAnalysis?.conclusion}
              </p>
              
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm mt-4">
                <h5 className="text-[13px] font-bold text-slate-800 mb-2 uppercase tracking-wide">
                  Rekomendasi Tindak Lanjut:
                </h5>
                <ul className="list-none space-y-2 pl-0 mb-0">
                  {selectedChartAnalysis?.recommendations?.map((rec: string, i: number) => (
                    <li key={i} className="text-[13px] text-slate-600 flex items-start gap-2.5">
                      <span className="text-emerald-500 mt-[-1px] leading-none" style={{ fontStyle: "normal", fontWeight: "bold", fontSize: "15px" }}>•</span>
                      <span className="font-medium">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Patients Safety Incident (IKP) Card - diagram lingkaran saja */}
      <div className="clay-surface p-6 lg:p-10 transition-all duration-300">
        
        {/* Header IKP */}
        <div className="flex flex-col items-center justify-center text-center mb-8 pb-6 border-b border-gray-100">
          <h2 className="text-xl md:text-2xl font-black text-gray-800 tracking-tight leading-tight">
            INSIDEN KESELAMATAN PASIEN (IKP)
          </h2>
          <h3 className="text-sm md:text-base font-bold text-gray-500 mt-1">
            UOBK RSUD AL-MULK KOTA SUKABUMI
          </h3>
          <div className="mt-3 bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-black tracking-wider uppercase border border-emerald-100/50 shadow-sm inline-block">
            PERIODE : {
              periodeMode === "Bulanan" ? `BULAN ${selectedBulan.toUpperCase()} ${selectedTahun}` :
              periodeMode === "Triwulan" ? `${selectedTriwulan.toUpperCase().replace("TRIWULAN 1", "TRIWULAN I").replace("TRIWULAN 2", "TRIWULAN II").replace("TRIWULAN 3", "TRIWULAN III").replace("TRIWULAN 4", "TRIWULAN IV")} TAHUN ${selectedTahun}` :
              periodeMode === "Semester" ? `${selectedSemester.toUpperCase().replace("SEMESTER 1", "SEMESTER I").replace("SEMESTER 2", "SEMESTER II")} TAHUN ${selectedTahun}` :
              `TAHUN ${selectedTahun}`
            }
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white/40 rounded-3xl p-2 md:p-4">
          {/* Pie chart representation */}
          <div className="lg:col-span-7 flex justify-center items-center h-80 md:h-[400px]">
            {ikpPieData.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 bg-slate-50/50 rounded-[20px] border border-dashed border-slate-200 w-full h-full max-w-md mx-auto">
                <div className="bg-emerald-50 text-emerald-500 p-4 rounded-full mb-4 shadow-sm">
                  <CheckCircle2 size={32} />
                </div>
                <p className="text-slate-700 text-lg font-black text-center">
                  Laporan Nihil
                </p>
                <p className="text-sm text-slate-500 mt-2 max-w-sm text-center font-medium leading-relaxed">
                  Tidak ada catatan laporan insiden keselamatan pada periode ini. Kondisi Pasien Aman.
                </p>
              </div>
            ) : (
              <div className="relative w-full h-full shrink-0 flex justify-center items-center">
                <ResponsiveContainer width="100%" height="100%" debounce={50} minWidth={0}>
                  <PieChart>
                    <Pie
                      data={ikpPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={90}
                      outerRadius={140}
                      paddingAngle={6}
                      dataKey="value"
                      stroke="none"
                      isAnimationActive={true}
                      animationBegin={0}
                      animationDuration={800}
                      animationEasing="ease-out"
                      labelLine={false}
                      label={({
                        cx,
                        cy,
                        midAngle,
                        innerRadius,
                        outerRadius,
                        percent,
                      }) => {
                        const RADIAN = Math.PI / 180;
                        const radius =
                          innerRadius + (outerRadius - innerRadius) * 0.5;
                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                        const y = cy + radius * Math.sin(-midAngle * RADIAN);
                        if (percent < 0.03) return null;
                        return (
                          <text
                            x={x}
                            y={y}
                            fill="white"
                            textAnchor="middle"
                            dominantBaseline="central"
                            fontSize={12}
                            fontWeight={800}
                            style={{
                              textShadow: "0px 1px 3px rgba(0,0,0,0.4)",
                            }}
                          >
                            {`${(percent * 100).toFixed(0)}%`}
                          </text>
                        );
                      }}
                    >
                      {ikpPieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          className="hover:opacity-80 transition-opacity duration-300 outline-none"
                          style={{
                            filter: "drop-shadow(0px 8px 16px rgba(0,0,0,0.15)) inset 0px 4px 8px rgba(255,255,255,0.2)",
                          }}
                        />
                      ))}
                      <Label
                        content={({ viewBox }) => {
                          const { cx, cy } = viewBox as any;
                          const sorted = [...ikpPieData].sort((a,b) => b.value - a.value);
                          const dominant = sorted[0];
                          const dominantPct = ((dominant.value / totalIncidentCount) * 100).toFixed(0);

                          return (
                            <text
                              x={cx}
                              y={cy - 10}
                              textAnchor="middle"
                              dominantBaseline="central"
                            >
                              <tspan
                                x={cx}
                                y={cy - 15}
                                fill="#0f172a"
                                fontSize="48"
                                fontWeight="900"
                                style={{ letterSpacing: "-0.05em" }}
                              >
                                {totalIncidentCount}
                              </tspan>
                              <tspan
                                x={cx}
                                dy="30"
                                fill="#64748b"
                                fontSize="12"
                                fontWeight="800"
                                style={{ letterSpacing: "0.1em" }}
                                textAnchor="middle"
                              >
                                INSIDEN
                              </tspan>
                              <tspan
                                x={cx}
                                dy="22"
                                fill={dominant.color}
                                fontSize="11"
                                fontWeight="700"
                                textAnchor="middle"
                              >
                                Dominan: {dominant.name} ({dominantPct}%)
                              </tspan>
                            </text>
                          );
                        }}
                      />
                    </Pie>
                    <Tooltip
                      formatter={(value: any, name: string) => [
                        `${value} Kasus (${((Number(value) / totalIncidentCount) * 100).toFixed(0)}%)`,
                        name,
                      ]}
                      contentStyle={{
                        borderRadius: "16px",
                        border: "none",
                        boxShadow: "0 10px 40px -10px rgba(0,0,0,0.15)",
                        fontWeight: "900",
                        fontSize: "13px",
                        padding: "10px 16px",
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(8px)',
                      }}
                      itemStyle={{ color: "#0f172a", fontWeight: "900", marginTop: "4px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Counts & Legends block */}
          <div className="lg:col-span-5 space-y-4 px-2 md:px-0">
            <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 px-1 border-b border-slate-100 pb-3">
              Data Jumlah Insiden
            </h4>

            <div className="space-y-3">
              {[
                {
                  name: "KPC",
                  label: "Kondisi Potensial Cedera",
                  val: totalIkp.KPC,
                  color: "#10a37f",
                },
                {
                  name: "KNC",
                  label: "Kejadian Nyaris Cedera",
                  val: totalIkp.KNC,
                  color: "#3b82f6",
                },
                {
                  name: "KTC",
                  label: "Kejadian Tidak Cedera",
                  val: totalIkp.KTC,
                  color: "#eab308",
                },
                {
                  name: "KTD",
                  label: "Kejadian Tidak Diharapkan",
                  val: totalIkp.KTD,
                  color: "#f97316",
                },
                {
                  name: "Sentinel",
                  label: "Kejadian Sentinel",
                  val: totalIkp.Sentinel,
                  color: "#ef4444",
                },
              ].map((item) => {
                 const pct = totalIncidentCount > 0 ? ((item.val / totalIncidentCount) * 100).toFixed(0) : "0";
                 
                 return (
                <div
                  key={item.name}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white hover:bg-slate-50 p-3.5 rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0 shadow-inner"
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-slate-800 flex items-center gap-2">
                        {item.name}
                        {item.val > 0 && <span className="bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0.5 rounded font-bold">{pct}%</span>}
                      </span>
                      {item.label && (
                        <span className="text-xs text-slate-500 font-medium">
                          {item.label}
                        </span>
                      )}
                    </div>
                  </div>
                  {item.val > 0 ? (
                     <span className="text-sm font-bold text-white px-3 py-1.5 rounded-xl text-center min-w-[3rem] shadow-sm self-start sm:self-auto" style={{ backgroundColor: item.color }}>
                       {item.val} <span className="text-[10px] font-medium opacity-90 hidden sm:inline">Kasus</span>
                     </span>
                  ) : (
                     <span className="text-sm font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 text-center min-w-[3rem] self-start sm:self-auto">
                       0
                     </span>
                  )}
                </div>
              )})}
            </div>
          </div>
        </div>

        {/* Automatic Analysis Section */}
        <div className="mt-8 bg-slate-50/70 p-5 md:p-6 rounded-2xl border border-slate-100/80">
          <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Analisa Data Insiden Keselamatan Pasien
          </h4>
          <p className="text-sm text-slate-600 leading-relaxed font-medium text-justify">
            {(() => {
              if (totalIncidentCount === 0) {
                return `Tidak terdapat laporan insiden keselamatan pasien pada ${periodeMode === "Bulanan" ? `bulan ${selectedBulan.toLowerCase()} ${selectedTahun}` : periodeMode === "Triwulan" ? `periode ${selectedTriwulan.toLowerCase().replace("triwulan 1", "triwulan I").replace("triwulan 2", "triwulan II").replace("triwulan 3", "triwulan III").replace("triwulan 4", "triwulan IV")} ${selectedTahun}` : periodeMode === "Semester" ? `periode ${selectedSemester.toLowerCase().replace("semester 1", "semester I").replace("semester 2", "semester II")} ${selectedTahun}` : `tahun ${selectedTahun}`}. Kondisi lingkungan klinis terpantau aman.`;
              }

              const sorted = [...ikpPieData].sort((a,b) => b.value - a.value);
              const dominant = sorted[0];
              const percentage = ((dominant.value / totalIncidentCount) * 100).toFixed(0);
              
              const labelMapping: Record<string, string> = {
                KPC: "Kondisi Potensial Cedera",
                KNC: "Kejadian Nyaris Cedera",
                KTC: "Kejadian Tidak Cedera",
                KTD: "Kejadian Tidak Diharapkan",
                Sentinel: "Kejadian Sentinel"
              };

              const periodeText = periodeMode === "Bulanan" ? `bulan ${selectedBulan.toLowerCase()} ${selectedTahun}` : periodeMode === "Triwulan" ? `periode ${selectedTriwulan.toLowerCase().replace("triwulan 1", "triwulan I").replace("triwulan 2", "triwulan II").replace("triwulan 3", "triwulan III").replace("triwulan 4", "triwulan IV")} ${selectedTahun}` : periodeMode === "Semester" ? `periode ${selectedSemester.toLowerCase().replace("semester 1", "semester I").replace("semester 2", "semester II")} ${selectedTahun}` : `tahun ${selectedTahun}`;

              let analysis = `Berdasarkan data ${periodeText}, tercatat ${totalIncidentCount} laporan insiden keselamatan pasien. Jenis insiden yang paling dominan adalah ${dominant.name} (${labelMapping[dominant.name] || dominant.name}) sebanyak ${dominant.value} kejadian atau ${percentage}% dari total laporan.`;
              
              if (sorted.length > 1) {
                const second = sorted[1];
                const secondPct = ((second.value / totalIncidentCount) * 100).toFixed(0);
                analysis += ` ${second.name} menempati urutan kedua sebanyak ${second.value} kejadian (${secondPct}%).`;
              }
              
              const rest = sorted.slice(2).map(i => i.name).join(", ");
              if (rest.length > 0) {
                 analysis += ` Kategori lainnya meliputi ${rest} yang berkontribusi pada sisa total insiden.`;
              }

              if (dominant.name === "KPC") {
                analysis += ` Data ini menunjukkan bahwa potensi risiko masih menjadi kategori yang paling sering ditemukan dan memerlukan tindak lanjut pencegahan proaktif untuk mengurangi kemungkinan terjadinya cedera pada pasien.`;
              } else if (dominant.name === "KTD" || dominant.name === "Sentinel") {
                analysis += ` Tingginya angka ${dominant.name} memerlukan prioritas investigasi mendalam (Root Cause Analysis) dan perbaikan sistem secara komprehensif demi keselamatan pasien.`;
              } else {
                analysis += ` Evaluasi dan peningkatan standar prosedur keselamatan ruang rawat secara berkesinambungan tetap harus dijalankan.`;
              }

              return analysis;
            })()}
          </p>
        </div>
      </div>

      <InteractiveDashboardModal
        activeModal={activeModal}
        setActiveModal={setActiveModal}
        inmTableData={inmTableData}
        allIndicatorsTableData={allIndicatorsTableData}
        ikpDataRaw={ikpDataRaw}
        indicatorProfiles={indicatorProfiles}
        filteredDataMutu={filteredDataMutu}
        dataMutuList={dataMutuList}
        periodeText={periodeMode === "Bulanan" ? `Bulan ${selectedBulan} ${selectedTahun}` : periodeMode === "Triwulan" ? `${selectedTriwulan} ${selectedTahun}` : periodeMode === "Semester" ? `${selectedSemester} ${selectedTahun}` : `Tahun ${selectedTahun}`}
      />
    </div>
  );
}
