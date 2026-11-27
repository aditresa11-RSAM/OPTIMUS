import React, { useState, useRef, useMemo, useEffect, useCallback } from "react";
import KopSurat from "@/components/common/KopSurat";
import {
  Download,
  FileText,
  Printer,
  FileSpreadsheet,
  Filter,
  X,
  Calendar,
  Activity,
  BookOpen,
  Sparkles,
  KeyRound,
  Table2,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useStore, DataMutuPayload, IndicatorProfile } from "@/store/useStore";
import { supabase } from "@/lib/supabase";
import { formatTarget } from "../../lib/utils";
import OfficialMutuReport, {
  ReportChapterFilter,
  ReportSignatures,
  DEFAULT_REPORT_SIGNATURES,
} from "@/components/laporan/OfficialMutuReport";
import {
  buildPeriodMeta,
  buildOfficialReportModel,
  INM_13_SPECS,
} from "@/components/laporan/laporanAggregation";
import {
  DEFAULT_RAWAT_INAP_STATS,
  RawatInapStatItem,
} from "@/components/laporan/RiskRegisterDefaults";
import { AiNarrativeResult } from "@/pages/api/ai-laporan";

const adaptProfileFromDb = (dbItem: any): IndicatorProfile => ({
  id: dbItem.id,
  category:
    dbItem.category === "IMP Unit" ? "IMP-Unit" : dbItem.category || "INM",
  indicator_title: dbItem.title || dbItem.indicator_title || "",
  rationale: dbItem.rationale || "—",
  quality_dimension: dbItem.quality_dimension || "—",
  objective: dbItem.purpose || dbItem.objective || "—",
  operational_definition: dbItem.operational_definition || "—",
  indicator_type: dbItem.indicator_type || "Proses",
  measurement_unit:
    dbItem.satuan_pengukuran || dbItem.measurement_unit || "Persen (%)",
  numerator: dbItem.numerator || "—",
  denominator: dbItem.denominator || "—",
  target: String(dbItem.target ?? "100%"),
  criteria: dbItem.criteria || "—",
  formula: dbItem.formula || "—",
  data_collection_method: dbItem.data_collection_method || "Retrospektif",
  data_source: dbItem.data_source || "Rekam Medis",
  sampling_method: dbItem.sampling_method || "Total Sampling",
  data_collection_tool:
    dbItem.data_collection_instrument || dbItem.data_collection_tool || "—",
  sample_size: dbItem.sample_size || "—",
  collection_period: dbItem.collection_period || "Bulanan",
  analysis_period: dbItem.analysis_period || "Triwulanan",
  data_presentation: dbItem.data_presentation || "Tabel & Grafik",
  person_responsible:
    dbItem.person_in_charge || dbItem.person_responsible || "—",
  reverse: Boolean(dbItem.reverse),
  created_at: dbItem.created_at,
});

export default function Laporan() {
  const dataMutuList = useStore((state) => state.dataMutuList);
  const setDataMutuList = useStore((state) => state.setDataMutuList);
  const indicatorProfiles = useStore((state) => state.indicatorProfiles);
  const setIndicatorProfiles = useStore((state) => state.setIndicatorProfiles);

  const reportBookRef = useRef<HTMLDivElement>(null);
  const matrixRef = useRef<HTMLDivElement>(null);

  // Primary View Mode: Official Book (default) vs Quick Matrix Table
  const [viewMode, setViewMode] = useState<"official" | "matrix">("official");
  const [chapterFilter, setChapterFilter] = useState<ReportChapterFilter>("ALL");

  // Period Filter States (defaults to current quarter & year)
  const currentQuarter = String(Math.floor(new Date().getMonth() / 3) + 1);
  const [periode, setPeriode] = useState("Triwulan");
  const [bulan, setBulan] = useState(String(new Date().getMonth()));
  const [triwulan, setTriwulan] = useState(currentQuarter);
  const [semester, setSemester] = useState(Number(currentQuarter) <= 2 ? "1" : "2");
  const [tahun, setTahun] = useState(new Date().getFullYear().toString());
  const [kategoriMatrix, setKategoriMatrix] = useState("Mutu Keseluruhan");

  // Extra DB tables for full report integration
  const [liveRiskRecords, setLiveRiskRecords] = useState<any[]>([]);
  const [surveiBudayaRows, setSurveiBudayaRows] = useState<any[]>([]);
  const [rawatInapStats, setRawatInapStats] = useState<RawatInapStatItem[]>(
    DEFAULT_RAWAT_INAP_STATS,
  );
  const [signatures, setSignatures] = useState<ReportSignatures>(
    DEFAULT_REPORT_SIGNATURES,
  );

  // AI Narrative States
  const [aiConfigured, setAiConfigured] = useState(false);
  const [aiSource, setAiSource] = useState<string>("none");
  const [aiNarratives, setAiNarratives] = useState<Record<string, AiNarrativeResult>>({});
  const [generatingKey, setGeneratingKey] = useState<string | null>(null);
  const [aiProgressText, setAiProgressText] = useState<string>("");
  const [showAiModal, setShowAiModal] = useState(false);
  const [apiKeyDraft, setApiKeyDraft] = useState("");
  const [toastMsg, setToastMsg] = useState<{ text: string; type: "ok" | "err" } | null>(
    null,
  );

  const showToast = useCallback((text: string, type: "ok" | "err" = "ok") => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 4500);
  }, []);

  const periodMeta = useMemo(
    () => buildPeriodMeta({ periode, bulan, triwulan, semester, tahun }),
    [periode, bulan, triwulan, semester, tahun],
  );

  // 1. Load Master Indikator, Inputs, Risiko, Survei Budaya
  const fetchAllReportData = useCallback(async () => {
    try {
      const [profRes, inpRes, riskRes, survRes] = await Promise.all([
        supabase.from("master_indikator").select("*").order("created_at", { ascending: true }),
        supabase.from("indicator_inputs").select("*").order("created_at", { ascending: true }),
        supabase.from("manajemen_risiko").select("*"),
        supabase.from("survei_budaya").select("*"),
      ]);

      let activeProfiles = indicatorProfiles;
      if (Array.isArray(profRes.data) && profRes.data.length > 0) {
        activeProfiles = profRes.data.map(adaptProfileFromDb);
        setIndicatorProfiles(activeProfiles);
      }

      if (Array.isArray(inpRes.data)) {
        const mappedInputs: DataMutuPayload[] = inpRes.data.map((dbInput: any) => {
          const matchedProfile = activeProfiles.find(
            (p) => p.id === dbInput.indicator_id,
          );
          const persentase = Number(dbInput.achievement_percentage) || 0;
          const rawTarget = dbInput.target || matchedProfile?.target || 80;
          const targetNum =
            parseFloat(String(rawTarget).replace(/[^0-9.]/g, "")) || 80;
          const isReverse = matchedProfile?.reverse || false;
          const isSuccess = isReverse
            ? persentase <= targetNum
            : persentase >= targetNum;

          let notesData: any = {};
          if (dbInput.notes) {
            try {
              const parsed = JSON.parse(dbInput.notes);
              if (typeof parsed === "object" && parsed !== null) {
                notesData = parsed;
              }
            } catch {
              notesData = { keterangan: dbInput.notes };
            }
          }

          return {
            id: dbInput.id,
            unit: dbInput.unit_id,
            tanggal: dbInput.input_date,
            kategori: dbInput.category_id,
            indikator_id: dbInput.indicator_id || undefined,
            indikator_name: matchedProfile?.indicator_title || undefined,
            numerator: Number(dbInput.numerator_value) || 0,
            denominator: Number(dbInput.denominator_value) || 1,
            target: rawTarget,
            capaian: persentase,
            status:
              dbInput.category_id === "IKP"
                ? "N/A"
                : isSuccess
                  ? "Tercapai"
                  : "Tidak Tercapai",
            keterangan: notesData.keterangan || "",
            kpc: Number(notesData.kpc) || 0,
            knc: Number(notesData.knc) || 0,
            ktc: Number(notesData.ktc) || 0,
            ktd: Number(notesData.ktd) || 0,
            sentinel: Number(notesData.sentinel) || 0,
            visite_details: notesData.visite_details || [],
            jatuh_details: notesData.jatuh_details || [],
            identifikasi_details: notesData.identifikasi_details || [],
            waktu_tunggu_details:
              notesData.waktu_tunggu_details || notesData.details || [],
            ...(notesData.fullFormData ? { fullFormData: notesData.fullFormData } : {}),
          } as DataMutuPayload;
        });
        setDataMutuList(mappedInputs);
      }

      if (Array.isArray(riskRes.data)) setLiveRiskRecords(riskRes.data);
      if (Array.isArray(survRes.data)) setSurveiBudayaRows(survRes.data);
    } catch (err) {
      console.warn("Error loading report data:", err);
    }
  }, [indicatorProfiles, setDataMutuList, setIndicatorProfiles]);

  useEffect(() => {
    fetchAllReportData();
    const ch = supabase
      .channel("laporan-official-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "indicator_inputs" },
        () => fetchAllReportData(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "manajemen_risiko" },
        () => fetchAllReportData(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Load cached AI narratives & Rawat Inap overrides when period changes
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch(
          `/api/ai-laporan?periodKey=${encodeURIComponent(periodMeta.periodKey)}`,
        );
        if (res.ok) {
          const json = await res.json();
          if (!active) return;
          setAiConfigured(Boolean(json.configured));
          setAiSource(json.source || "none");
          setAiNarratives(json.cachedNarratives || {});
        }
      } catch {
        // Ignore offline errors
      }

      try {
        const [ranapRes, sigRes] = await Promise.all([
          supabase
            .from("settings")
            .select("*")
            .eq("key", `rawat_inap_stats_${periodMeta.periodKey}`),
          supabase.from("settings").select("*").eq("key", "laporan_signatures"),
        ]);
        if (active && Array.isArray(ranapRes.data) && ranapRes.data[0]?.value) {
          setRawatInapStats(JSON.parse(ranapRes.data[0].value));
        } else if (active) {
          setRawatInapStats(DEFAULT_RAWAT_INAP_STATS);
        }
        if (active && Array.isArray(sigRes.data) && sigRes.data[0]?.value) {
          setSignatures({ ...DEFAULT_REPORT_SIGNATURES, ...JSON.parse(sigRes.data[0].value) });
        }
      } catch {
        if (active) setRawatInapStats(DEFAULT_RAWAT_INAP_STATS);
      }
    })();
    return () => {
      active = false;
    };
  }, [periodMeta.periodKey]);

  // 3. Build Complete Official Report Model
  const reportModel = useMemo(
    () =>
      buildOfficialReportModel({
        period: periodMeta,
        dataMutuList,
        indicatorProfiles,
        rawatInapStats,
        liveRiskRecords,
        surveiBudayaRows,
        aiNarratives,
      }),
    [
      periodMeta,
      dataMutuList,
      indicatorProfiles,
      rawatInapStats,
      liveRiskRecords,
      surveiBudayaRows,
      aiNarratives,
    ],
  );

  // 4. Handlers for AI & Manual Narrative Saves
  const handleSaveManualNarrative = async (
    itemKey: string,
    updated: AiNarrativeResult,
  ) => {
    const nextMap = { ...aiNarratives, [itemKey]: updated };
    setAiNarratives(nextMap);
    try {
      await fetch("/api/ai-laporan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_cache",
          periodKey: periodMeta.periodKey,
          saveNarratives: nextMap,
        }),
      });
      showToast("Narasi analisa & rekomendasi berhasil disimpan.");
    } catch {
      showToast("Narasi tersimpan secara lokal.");
    }
  };

  const handleUpdateRawatInapStats = async (next: RawatInapStatItem[]) => {
    setRawatInapStats(next);
    try {
      await supabase.from("settings").upsert({
        key: `rawat_inap_stats_${periodMeta.periodKey}`,
        value: JSON.stringify(next),
      });
      showToast("Data indikator pelayanan rawat inap berhasil diperbarui.");
    } catch {
      showToast("Gagal menyimpan ke database.", "err");
    }
  };

  const handleUpdateSignatures = async (next: ReportSignatures) => {
    setSignatures(next);
    try {
      await supabase.from("settings").upsert({
        key: "laporan_signatures",
        value: JSON.stringify(next),
      });
      showToast("Nama penandatangan laporan resmi berhasil disimpan.");
    } catch {
      showToast("Gagal menyimpan data penandatangan.", "err");
    }
  };

  const handleGenerateSingleAi = async (itemKey: string) => {
    const targetItem = reportModel.aiPromptItems.find((x) => x.key === itemKey);
    if (!targetItem) return;

    setGeneratingKey(itemKey);
    try {
      const res = await fetch("/api/ai-laporan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate",
          periodKey: periodMeta.periodKey,
          periodLabel: `${periodMeta.shortPeriodTitle} (${periodMeta.rangeLabel})`,
          items: [targetItem],
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        if (json.missingKey) {
          setShowAiModal(true);
        }
        showToast(json.error || "Gagal memproses AI.", "err");
        setGeneratingKey(null);
        return;
      }
      if (json.narratives) {
        setAiNarratives((prev) => ({ ...prev, ...json.narratives }));
        setAiConfigured(true);
        showToast(`Narasi "${targetItem.title}" berhasil diperbarui dengan AI (${json.model}).`);
      }
    } catch (err: any) {
      showToast(`Kesalahan koneksi AI: ${err?.message || ""}`, "err");
    } finally {
      setGeneratingKey(null);
    }
  };

  const handleGenerateAllAi = async () => {
    if (!aiConfigured) {
      setShowAiModal(true);
      return;
    }
    const allItems = reportModel.aiPromptItems;
    if (allItems.length === 0) return;

    setGeneratingKey("__ALL__");
    const chunkSize = 8;
    let merged = { ...aiNarratives };

    try {
      for (let i = 0; i < allItems.length; i += chunkSize) {
        const batch = allItems.slice(i, i + chunkSize);
        setAiProgressText(
          `Menganalisis ${Math.min(i + chunkSize, allItems.length)} / ${allItems.length} indikator...`,
        );
        const res = await fetch("/api/ai-laporan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "generate",
            periodKey: periodMeta.periodKey,
            periodLabel: `${periodMeta.shortPeriodTitle} (${periodMeta.rangeLabel})`,
            items: batch,
          }),
        });
        const json = await res.json();
        if (!res.ok) {
          if (json.missingKey) setShowAiModal(true);
          throw new Error(json.error || "Gagal memproses batch AI");
        }
        if (json.narratives) {
          merged = { ...merged, ...json.narratives };
          setAiNarratives({ ...merged });
        }
      }
      showToast("Seluruh narasi Analisa & Rekomendasi berhasil diperbarui oleh AI Gemini!");
    } catch (err: any) {
      showToast(err?.message || "Proses AI terhenti.", "err");
    } finally {
      setGeneratingKey(null);
      setAiProgressText("");
    }
  };

  const handleSaveApiKey = async () => {
    try {
      const res = await fetch("/api/ai-laporan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save_key", apiKey: apiKeyDraft }),
      });
      const json = await res.json();
      if (res.ok) {
        setAiConfigured(Boolean(json.configured));
        setAiSource(json.source || "db");
        setShowAiModal(false);
        setApiKeyDraft("");
        showToast(
          json.configured
            ? "API Key Gemini berhasil disimpan dan siap digunakan."
            : "API Key dikosongkan; menggunakan Mesin Narasi Standar Mutu RS otomatis.",
        );
      }
    } catch {
      showToast("Gagal menyimpan API Key.", "err");
    }
  };

  // 5. Print & Exports
  const handlePrintOfficial = () => {
    if (viewMode === "official" && chapterFilter !== "ALL") {
      setChapterFilter("ALL");
      setTimeout(() => window.print(), 350);
    } else {
      window.print();
    }
  };

  const handleExportWord = () => {
    const container =
      viewMode === "official" ? reportBookRef.current : matrixRef.current;
    if (!container) return;

    const cloned = container.cloneNode(true) as HTMLElement;
    cloned
      .querySelectorAll(".no-print, .print\\:hidden, button")
      .forEach((el) => el.remove());

    const htmlBody = cloned.innerHTML;
    const docHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8" />
        <title>Laporan Terintegrasi PMKP RSUD Al-Mulk ${periodMeta.shortPeriodTitle}</title>
        <style>
          @page Section1 {
            size: 21.5cm 33.0cm;
            margin: 2.5cm 2.5cm 2.5cm 2.5cm;
            mso-header-margin: 1.25cm;
            mso-footer-margin: 1.25cm;
          }
          div.Section1 { page: Section1; }
          body { font-family: Arial, sans-serif; font-size: 12pt; line-height: 1.5; color: #0f172a; }
          p, li { font-family: Arial, sans-serif; font-size: 12pt; line-height: 1.5; }
          table { width: 100%; border-collapse: collapse; margin: 6pt 0; font-family: Arial, sans-serif; font-size: 10.5pt; line-height: 1.35; }
          th, td { border: 1px solid #0f172a; padding: 3.5pt 5pt; }
          th { background: #f1f5f9; font-weight: bold; }
          h1, h2, h3, h4 { font-family: Arial, sans-serif; font-size: 12pt; line-height: 1.5; color: #0f172a; margin-top: 8pt; margin-bottom: 4pt; }
          section.official-f4-page { page-break-after: always; }
          section.official-f4-page:last-child { page-break-after: auto; }
        </style>
      </head>
      <body><div class="Section1">${htmlBody}</div></body>
    </html>`;

    const blob = new Blob([`\uFEFF${docHtml}`], {
      type: "application/msword;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Laporan_Resmi_PMKP_F4_RSUD_AlMulk_${periodMeta.periodKey}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportExcel = () => {
    const container =
      viewMode === "official" ? reportBookRef.current : matrixRef.current;
    if (!container) return;
    const tables = Array.from(container.querySelectorAll("table"))
      .map((t) => t.outerHTML)
      .join("<br/><br/>");
    if (!tables) return;
    const blob = new Blob([`\uFEFF<html><head><meta charset="utf-8"/></head><body>${tables}</body></html>`], {
      type: "application/vnd.ms-excel;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Tabel_Laporan_Mutu_RSUD_AlMulk_${periodMeta.periodKey}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // --- Matrix & Unit Drilldown Modal Support ---
  const [selectedIndikatorDetail, setSelectedIndikatorDetail] = useState<{
    id: string;
    matchIds: string[];
    name: string;
    category: string;
  } | null>(null);

  const handleInspectFromOfficial = (
    inmKey: string,
    title: string,
    category: string,
  ) => {
    const spec = INM_13_SPECS.find((s) => s.key === inmKey);
    const prof = indicatorProfiles.find((p) =>
      spec?.matchIds.includes(p.id),
    );
    setSelectedIndikatorDetail({
      id: prof?.id || spec?.matchIds[0] || inmKey,
      matchIds: spec?.matchIds || [inmKey],
      name: title,
      category,
    });
  };

  const detailInputsByUnit = useMemo(() => {
    if (!selectedIndikatorDetail) return {};
    const mSet = new Set(
      selectedIndikatorDetail.matchIds.map((s) => s.toLowerCase()),
    );
    const mIndices = new Set(periodMeta.monthCols.map((m) => m.monthIndex));
    const filtered = dataMutuList.filter((d) => {
      if (!d.tanggal) return false;
      const dt = new Date(d.tanggal);
      if (String(dt.getFullYear()) !== periodMeta.currYear) return false;
      if (!mIndices.has(dt.getMonth())) return false;
      return mSet.has(String(d.indikator_id || "").toLowerCase());
    });
    const grouped: Record<string, DataMutuPayload[]> = {};
    filtered.forEach((item) => {
      const u = item.unit || "Unit Pelayanan";
      if (!grouped[u]) grouped[u] = [];
      grouped[u].push(item);
    });
    return grouped;
  }, [selectedIndikatorDetail, dataMutuList, periodMeta]);

  const allMatrixIndicators = useMemo(() => {
    return indicatorProfiles.map((p) => ({
      id: p.id,
      category: p.category,
      name: p.indicator_title,
      formattedTarget: formatTarget(p.target, p.measurement_unit, p.reverse),
      targetVal: parseFloat(String(p.target).replace(/[^0-9.]/g, "")) || 80,
      reverse: p.reverse,
    }));
  }, [indicatorProfiles]);

  const getMatrixCell = (indId: string, mIdx: number) => {
    const recs = dataMutuList.filter((d) => {
      if (!d.tanggal || d.indikator_id !== indId) return false;
      const dt = new Date(d.tanggal);
      return (
        dt.getMonth() === mIdx &&
        String(dt.getFullYear()) === periodMeta.currYear
      );
    });
    if (recs.length === 0) return "-";
    const avg =
      recs.reduce((acc, c) => acc + (Number(c.capaian) || 0), 0) / recs.length;
    return `${avg.toFixed(2)}%`;
  };

  const monthNamesFull = [
    "JANUARI",
    "FEBRUARI",
    "MARET",
    "APRIL",
    "MEI",
    "JUNI",
    "JULI",
    "AGUSTUS",
    "SEPTEMBER",
    "OKTOBER",
    "NOVEMBER",
    "DESEMBER",
  ];

  const chapterTabs: Array<{ key: ReportChapterFilter; label: string }> = [
    { key: "ALL", label: "Semua Halaman (F4 Lengkap)" },
    { key: "COVER_FRONT", label: "Sampul & Daftar (i–iv)" },
    { key: "BAB_1", label: "BAB I (Pendahuluan)" },
    { key: "BAB_2", label: "BAB II (Situasi Awal)" },
    { key: "BAB_3", label: "BAB III (Tujuan & Sasaran)" },
    { key: "BAB_4", label: "BAB IV (Strategi)" },
    { key: "BAB_5_INM", label: "BAB V: Program, Ranap & INM 1–13" },
    { key: "BAB_5_IMP_PPI", label: "BAB V: IMP-RS, IMP-Unit & PPI" },
    { key: "BAB_5_SPM", label: "BAB V: Indikator SPM" },
    { key: "BAB_5_CP_IKP", label: "BAB V: PPK/CP & IKP" },
    { key: "BAB_5_RISIKO", label: "BAB V: Manajemen Risiko (26 Unit)" },
    { key: "BAB_6", label: "BAB VI (Penutup & Disposisi)" },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-5 max-w-7xl mx-auto w-full p-2 md:p-0">
      {/* Toast Notification */}
      {toastMsg && (
        <div
          className={`no-print fixed bottom-5 right-5 z-[120] px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-bottom-3 ${
            toastMsg.type === "ok"
              ? "bg-emerald-900 text-white border-emerald-700"
              : "bg-red-900 text-white border-red-700"
          }`}
        >
          {toastMsg.type === "ok" ? (
            <CheckCircle2 size={16} className="text-emerald-300 shrink-0" />
          ) : (
            <AlertCircle size={16} className="text-red-300 shrink-0" />
          )}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* 3D Hero Greeting Banner (Hidden during print) */}
      <div id="laporan-header-panel" className="no-print relative pt-0 group">
        <div className="bg-white rounded-3xl border border-emerald-200/60 drop-shadow-card p-4 sm:p-5 md:py-5 md:px-6 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-4 min-h-[152px] sm:min-h-[162px] transition-all duration-300">
          <div className="absolute top-0 left-8 right-8 h-[1.5px] bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent pointer-events-none" />
          <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-[55%] xl:w-[50%] pointer-events-none z-0 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/uploads/hospital_background_3d.png?v=3"
              alt="Gedung RSUD Al-Mulk 3D"
              className="w-full h-full object-cover object-[center_35%] opacity-100 select-none"
            />
          </div>

          <div className="relative z-10 flex items-start gap-3.5 md:gap-4 flex-1 min-w-0 w-full lg:max-w-[60%] xl:max-w-[62%]">
            <div className="w-1.5 self-stretch bg-gradient-to-b from-[#10a37f] via-[#059669] to-[#007A4D] rounded-full shrink-0 shadow-[0_0_12px_rgba(16,163,127,0.4)]" />
            <div className="space-y-1.5 sm:space-y-2 min-w-0">
              <h1 className="text-2xl sm:text-3xl md:text-[31px] font-extrabold text-[#007A4D] tracking-tight leading-tight">
                Laporan Mutu RS
              </h1>
              <p className="text-xs sm:text-[13px] md:text-sm font-bold text-slate-800 leading-snug pt-0.5">
                Buku Laporan Resmi Terintegrasi PMKP (BAB I – VI) & Analisis AI Otomatis
              </p>
              <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed italic max-w-xl">
                &quot;Dokumen resmi pertanggungjawaban tata kelola mutu, keselamatan pasien, dan manajemen risiko UOBK RSUD Al-Mulk Kota Sukabumi.&quot;
              </p>
            </div>
          </div>

          <div className="hidden lg:block w-[320px] xl:w-[370px] shrink-0" />
        </div>

        <div className="relative lg:absolute lg:bottom-[1px] lg:right-5 xl:right-8 z-20 flex justify-center lg:justify-end mt-2 lg:mt-0 pointer-events-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/uploads/laporan_character_popout.png"
            alt="Laporan Mutu RS 3D"
            className="h-[145px] sm:h-[160px] lg:h-[174px] xl:h-[182px] w-auto object-contain object-bottom drop-shadow-[0_10px_20px_rgba(0,95,58,0.22)] transition-transform duration-500 group-hover:scale-[1.03] origin-bottom"
          />
        </div>
      </div>

      {/* Control Panel: Mode Switcher, AI Actions, Exports & Period Selectors */}
      <div className="no-print bg-white rounded-3xl border border-slate-200/90 drop-shadow-card p-4 sm:p-6 space-y-5">
        {/* Top Row: View Mode + AI + Export Buttons */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          {/* View Mode Toggle */}
          <div className="inline-flex p-1 rounded-2xl bg-slate-100 border border-slate-200/80 self-start">
            <button
              type="button"
              onClick={() => setViewMode("official")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                viewMode === "official"
                  ? "bg-[#007A4D] text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <BookOpen size={15} />
              <span>Buku Laporan Resmi (BAB I – VI)</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("matrix")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                viewMode === "matrix"
                  ? "bg-[#007A4D] text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Table2 size={15} />
              <span>Tabel Matriks Cepat</span>
            </button>
          </div>

          {/* AI & Export Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {viewMode === "official" && (
              <>
                <button
                  type="button"
                  disabled={generatingKey !== null}
                  onClick={handleGenerateAllAi}
                  className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-60"
                >
                  {generatingKey === "__ALL__" ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Sparkles size={15} />
                  )}
                  <span>
                    {generatingKey === "__ALL__"
                      ? aiProgressText || "Memproses AI..."
                      : "Analisis AI Seluruh Laporan"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowAiModal(true)}
                  className={`inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    aiConfigured
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                      : "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
                  }`}
                  title="Konfigurasi API Key Gemini AI"
                >
                  <KeyRound size={14} />
                  <span>{aiConfigured ? "AI Aktif" : "Set API Key AI"}</span>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={handlePrintOfficial}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Printer size={15} />
              <span>Cetak / PDF F4</span>
            </button>

            <button
              type="button"
              onClick={handleExportWord}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <FileText size={15} />
              <span>Export Word F4</span>
            </button>

            <button
              type="button"
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-[#10a37f] hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <FileSpreadsheet size={15} />
              <span>Export Excel</span>
            </button>
          </div>
        </div>

        {/* Period Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
              Jenis Periode Laporan
            </label>
            <div className="relative">
              <Filter
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                size={15}
              />
              <select
                value={periode}
                onChange={(e) => setPeriode(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#10a37f] outline-none text-xs font-bold text-slate-800 cursor-pointer"
              >
                <option value="Triwulan">Triwulan (Standar Buku Resmi)</option>
                <option value="Bulanan">Bulanan</option>
                <option value="Semester">Semester</option>
                <option value="Tahunan">Tahunan</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
              {periode === "Bulanan"
                ? "Pilih Bulan"
                : periode === "Triwulan"
                  ? "Pilih Triwulan"
                  : periode === "Semester"
                    ? "Pilih Semester"
                    : "Cakupan Tahun"}
            </label>
            {periode === "Bulanan" && (
              <select
                value={bulan}
                onChange={(e) => setBulan(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#10a37f] outline-none text-xs font-bold text-slate-800 cursor-pointer"
              >
                {monthNamesFull.map((m, i) => (
                  <option key={i} value={i}>
                    {m}
                  </option>
                ))}
              </select>
            )}
            {periode === "Triwulan" && (
              <select
                value={triwulan}
                onChange={(e) => setTriwulan(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#10a37f] outline-none text-xs font-bold text-slate-800 cursor-pointer"
              >
                <option value="1">Triwulan I (Januari – Maret)</option>
                <option value="2">Triwulan II (April – Juni)</option>
                <option value="3">Triwulan III (Juli – September)</option>
                <option value="4">Triwulan IV (Oktober – Desember)</option>
              </select>
            )}
            {periode === "Semester" && (
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#10a37f] outline-none text-xs font-bold text-slate-800 cursor-pointer"
              >
                <option value="1">Semester I (Januari – Juni)</option>
                <option value="2">Semester II (Juli – Desember)</option>
              </select>
            )}
            {periode === "Tahunan" && (
              <div className="px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-600">
                Januari – Desember (12 Bulan)
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
              Tahun Pelaporan
            </label>
            <select
              value={tahun}
              onChange={(e) => setTahun(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#10a37f] outline-none text-xs font-bold text-slate-800 cursor-pointer"
            >
              <option value="2027">2027</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
              {viewMode === "official" ? "Ringkasan Data Terintegrasi" : "Filter Kategori Matriks"}
            </label>
            {viewMode === "official" ? (
              <div className="px-3.5 py-2 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-[11px] font-bold text-emerald-900 flex items-center justify-between">
                <span>INM Terukur: {reportModel.inmMeasuredCount}/13</span>
                <span>•</span>
                <span>IKP: {reportModel.ikp.totals.total}</span>
                <span>•</span>
                <span>SPM: {reportModel.spmTotalCount}</span>
              </div>
            ) : (
              <select
                value={kategoriMatrix}
                onChange={(e) => setKategoriMatrix(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#10a37f] outline-none text-xs font-bold text-slate-800 cursor-pointer"
              >
                <option value="Mutu Keseluruhan">Semua Kategori</option>
                <option value="INM">INM</option>
                <option value="IMP-RS">IMP-RS</option>
                <option value="IMP-Unit">IMP-Unit</option>
                <option value="SPM">SPM</option>
              </select>
            )}
          </div>
        </div>

        {/* Quick Chapter Filter Pills (when in Official Book Mode) */}
        {viewMode === "official" && (
          <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase mr-1 shrink-0">
              Navigasi Bab:
            </span>
            {chapterTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setChapterFilter(tab.key)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                  chapterFilter === tab.key
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* =========================================================
          MAIN CONTENT AREA: OFFICIAL BOOK vs MATRIX VIEW
      ========================================================= */}
      {viewMode === "official" ? (
        <div ref={reportBookRef} className="pt-1">
          <OfficialMutuReport
            model={reportModel}
            chapterFilter={chapterFilter}
            generatingKey={generatingKey}
            signatures={signatures}
            onGenerateSingleAi={handleGenerateSingleAi}
            onSaveManualNarrative={handleSaveManualNarrative}
            onUpdateRawatInapStats={handleUpdateRawatInapStats}
            onUpdateSignatures={handleUpdateSignatures}
            onInspectIndicator={handleInspectFromOfficial}
            onRequestChapter={setChapterFilter}
          />
        </div>
      ) : (
        <div
          ref={matrixRef}
          className="drop-shadow-table overflow-x-auto bg-white w-full p-4 md:p-8 rounded-3xl"
        >
          <KopSurat
            subJudul={`REKAPITULASI MATRIKS INDIKATOR MUTU — ${periodMeta.shortPeriodTitle.toUpperCase()}`}
          />
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[#10a37f] text-white">
                <th className="py-3.5 px-4 font-extrabold text-xs text-center w-14">NO</th>
                <th className="py-3.5 px-4 font-extrabold text-xs uppercase">INDIKATOR</th>
                <th className="py-3.5 px-4 font-extrabold text-xs text-center uppercase w-28">
                  TARGET
                </th>
                {periodMeta.monthCols.map((mc) => (
                  <th
                    key={mc.monthIndex}
                    className="py-3.5 px-4 font-extrabold text-xs text-center uppercase"
                  >
                    {mc.upper}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(["INM", "IMP-RS", "IMP-Unit", "SPM"] as const).map((cat) => {
                if (
                  kategoriMatrix !== "Mutu Keseluruhan" &&
                  kategoriMatrix !== cat
                ) {
                  return null;
                }
                const rows = allMatrixIndicators.filter((i) => i.category === cat);
                if (rows.length === 0) return null;
                return (
                  <React.Fragment key={cat}>
                    <tr className="bg-emerald-50/70">
                      <td
                        colSpan={3 + periodMeta.monthCols.length}
                        className="px-4 py-3 font-extrabold text-xs text-emerald-950 uppercase tracking-wider"
                      >
                        Kategori: {cat} ({rows.length} Indikator)
                      </td>
                    </tr>
                    {rows.map((row, idx) => (
                      <tr
                        key={row.id}
                        className="border-b border-slate-100 hover:bg-slate-50/60"
                      >
                        <td className="py-3 px-4 text-xs text-center text-slate-500 font-semibold">
                          {idx + 1}
                        </td>
                        <td
                          onClick={() =>
                            setSelectedIndikatorDetail({
                              id: row.id,
                              matchIds: [row.id],
                              name: row.name,
                              category: row.category,
                            })
                          }
                          className="py-3 px-4 text-xs font-semibold text-slate-800 hover:text-emerald-700 cursor-pointer"
                        >
                          {row.name}
                        </td>
                        <td className="py-3 px-4 text-xs text-center font-bold text-slate-700">
                          {row.formattedTarget}
                        </td>
                        {periodMeta.monthCols.map((mc) => {
                          const cell = getMatrixCell(row.id, mc.monthIndex);
                          return (
                            <td
                              key={mc.monthIndex}
                              className="py-3 px-4 text-xs text-center font-bold"
                            >
                              {cell}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* =========================================================
          MODAL PENGATURAN API KEY GEMINI AI
      ========================================================= */}
      {showAiModal && (
        <div className="no-print fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Konfigurasi AI Gemini (Analisis Standar Mutu RS)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Model: <code className="font-bold">gemini-3.8-flash</code> • Acuan STARKES & PMK 80/2020
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 space-y-1.5 leading-relaxed">
              <p>
                <strong>Status Saat Ini:</strong>{" "}
                {aiConfigured ? (
                  <span className="text-emerald-700 font-bold">
                    Terhubung (Sumber: {aiSource === "env" ? ".env.local" : "Database Lokal"})
                  </span>
                ) : (
                  <span className="text-amber-700 font-bold">
                    Menggunakan Mesin Narasi Otomatis Standar Mutu RS (Bawaan)
                  </span>
                )}
              </p>
              <p>
                Secara otomatis setiap tabel sudah dilengkapi Analisa & Rekomendasi dinamis
                sesuai capaian data. Untuk menghasilkan narasi mendalam menggunakan model AI
                terbaru Google Gemini, masukkan <strong>API Key Google AI Studio</strong> di bawah
                ini (tersimpan aman secara lokal di komputer rumah sakit).
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Google Gemini API Key
              </label>
              <input
                type="password"
                placeholder="Tempel API Key (AIzaSy...)"
                value={apiKeyDraft}
                onChange={(e) => setApiKeyDraft(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={handleSaveApiKey}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white cursor-pointer"
              >
                Simpan Konfigurasi AI
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL RINCIAN INPUT UNIT PER INDIKATOR
      ========================================================= */}
      {selectedIndikatorDetail && (
        <div className="no-print fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/45 backdrop-blur-xs p-4 md:p-8">
          <div className="bg-white w-full max-w-4xl max-h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-100">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-emerald-50/40">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Rincian Data Input Unit — {selectedIndikatorDetail.name}
                </h3>
                <p className="text-xs text-emerald-800 font-semibold">
                  {selectedIndikatorDetail.category} • {periodMeta.shortPeriodTitle} ({periodMeta.rangeLabel})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedIndikatorDetail(null)}
                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {Object.keys(detailInputsByUnit).length === 0 ? (
                <div className="p-10 text-center bg-slate-50 rounded-2xl border border-slate-200/70">
                  <Calendar className="mx-auto text-slate-400 mb-2" size={26} />
                  <p className="text-sm font-bold text-slate-600">
                    Belum ada data input dari unit untuk indikator ini pada {periodMeta.shortPeriodTitle}.
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Silakan input data melalui menu Input Data agar otomatis terintegrasi ke buku laporan.
                  </p>
                </div>
              ) : (
                Object.entries(detailInputsByUnit).map(([unitName, list]) => (
                  <div key={unitName} className="space-y-2">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-900 bg-emerald-50 px-3 py-1.5 rounded-lg border-l-4 border-emerald-600">
                      Unit: {unitName} ({list.length} Entri)
                    </h4>
                    <table className="w-full border-collapse border border-slate-200 text-xs">
                      <thead>
                        <tr className="bg-slate-100 font-bold text-center">
                          <th className="border border-slate-200 px-3 py-2">Tanggal</th>
                          <th className="border border-slate-200 px-3 py-2">Numerator</th>
                          <th className="border border-slate-200 px-3 py-2">Denominator</th>
                          <th className="border border-slate-200 px-3 py-2">Capaian</th>
                          <th className="border border-slate-200 px-3 py-2 text-left">Keterangan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {list.map((u) => (
                          <tr key={u.id} className="text-center hover:bg-slate-50">
                            <td className="border border-slate-200 px-3 py-2 font-semibold">
                              {u.tanggal}
                            </td>
                            <td className="border border-slate-200 px-3 py-2">{u.numerator}</td>
                            <td className="border border-slate-200 px-3 py-2">{u.denominator}</td>
                            <td className="border border-slate-200 px-3 py-2 font-bold text-emerald-700">
                              {Number(u.capaian || 0).toFixed(2)}%
                            </td>
                            <td className="border border-slate-200 px-3 py-2 text-left text-slate-600">
                              {u.keterangan || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
