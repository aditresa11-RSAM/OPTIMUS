import React, { useMemo, useState } from "react";
import {
  Sparkles,
  Edit3,
  Check,
  X,
  ExternalLink,
  Loader2,
  FileText,
  ArrowRight,
} from "lucide-react";
import { OfficialReportModel, SpmIndicatorBlock, fmtPct } from "./laporanAggregation";
import { DEFAULT_SAPRAS_TIM_MUTU, RawatInapStatItem } from "./RiskRegisterDefaults";
import {
  InmComparisonChart,
  SingleTargetLineChart,
  IkpPieChartBox,
  IkpTrendLineChart,
  IkpGroupedBarChart,
} from "./LaporanCharts";
import { AiNarrativeResult } from "@/pages/api/ai-laporan";

export type ReportChapterFilter =
  | "ALL"
  | "COVER_FRONT"
  | "BAB_1"
  | "BAB_2"
  | "BAB_3"
  | "BAB_4"
  | "BAB_5_INM"
  | "BAB_5_IMP_PPI"
  | "BAB_5_SPM"
  | "BAB_5_CP_IKP"
  | "BAB_5_RISIKO"
  | "BAB_6";

export interface ReportSignatures {
  direkturTitle: string;
  direkturName: string;
  dinkesTitle: string;
  dinkesName: string;
}

export const DEFAULT_REPORT_SIGNATURES: ReportSignatures = {
  direkturTitle: "Direktur UOBK RSUD AL-MULK",
  direkturName: "Dr. Deni Purnama, S.Kep., MKM., FISQua",
  dinkesTitle: "Kepala Dinas Kesehatan",
  dinkesName: "Ida Halimah, SKM., M.Si.",
};

interface OfficialMutuReportProps {
  model: OfficialReportModel;
  chapterFilter: ReportChapterFilter;
  generatingKey: string | null;
  signatures: ReportSignatures;
  onGenerateSingleAi: (itemKey: string) => void;
  onSaveManualNarrative: (itemKey: string, updated: AiNarrativeResult) => void;
  onUpdateRawatInapStats: (next: RawatInapStatItem[]) => void;
  onUpdateSignatures: (next: ReportSignatures) => void;
  onInspectIndicator?: (indicatorIdOrKey: string, title: string, category: string) => void;
  onRequestChapter?: (chapter: ReportChapterFilter) => void;
}

interface ReportPageDef {
  id: string;
  anchors?: string[];
  group: ReportChapterFilter;
  content: React.ReactNode;
}

/**
 * Single physical F4 sheet (215mm x 330mm, 25mm margins on all four sides).
 * On screen: renders at exact 215mm x 330mm with 25mm internal padding.
 * In print: @page sets 215mm 330mm + 25mm margin, and CSS strips padding/shadow so margins never double.
 */
const F4Page: React.FC<{
  id: string;
  pageLabel?: string;
  isCover?: boolean;
  children: React.ReactNode;
}> = ({ id, pageLabel, isCover = false, children }) => (
  <section
    id={id}
    data-page-label={pageLabel || "COVER"}
    className={
      isCover
        ? "official-f4-page official-cover-page bg-white text-slate-900 shadow-[0_10px_32px_rgba(15,23,42,0.14)] border border-slate-300/80 mx-auto mb-8 relative overflow-hidden"
        : "official-f4-page bg-white text-slate-900 shadow-[0_10px_32px_rgba(15,23,42,0.12)] border border-slate-300/80 mx-auto mb-8 relative flex flex-col justify-between"
    }
  >
    {isCover ? (
      children
    ) : (
      <>
        <div className="official-f4-body flex-1">{children}</div>
        {pageLabel && (
          <footer className="official-f4-footer mt-5 pt-2 border-t border-slate-300/80 flex items-center justify-between text-[10px] text-slate-600 select-none">
            <span>Laporan Terintegrasi PMKP — UOBK RSUD Al-Mulk Kota Sukabumi</span>
            <span className="font-bold text-slate-900 tabular-nums text-[11px]">{pageLabel}</span>
          </footer>
        )}
      </>
    )}
  </section>
);

const ChapterHeader: React.FC<{ bab: string; title?: string }> = ({ bab, title }) => (
  <div className="text-center mb-5 pb-2.5 border-b-2 border-slate-900">
    <p className="text-[13pt] font-bold tracking-wider uppercase text-slate-900 leading-[1.5]">
      {bab}
    </p>
    {title && (
      <h2 className="text-[13pt] font-bold tracking-wide uppercase text-slate-900 mt-0.5 leading-[1.5]">
        {title}
      </h2>
    )}
  </div>
);

const NarrativeEditorBlock: React.FC<{
  itemKey: string;
  analisa: string;
  rekomendasi: string[];
  rekomendasiLabel?: string;
  generatingKey: string | null;
  onGenerateAi: (key: string) => void;
  onSaveManual: (key: string, val: AiNarrativeResult) => void;
}> = ({
  itemKey,
  analisa,
  rekomendasi,
  rekomendasiLabel = "Rekomendasi :",
  generatingKey,
  onGenerateAi,
  onSaveManual,
}) => {
  const [editing, setEditing] = useState(false);
  const [draftAnalisa, setDraftAnalisa] = useState(analisa);
  const [draftRekom, setDraftRekom] = useState(rekomendasi.join("\n"));

  const isBusy = generatingKey === itemKey || generatingKey === "__ALL__";

  const startEdit = () => {
    setDraftAnalisa(analisa);
    setDraftRekom(rekomendasi.join("\n"));
    setEditing(true);
  };

  const saveEdit = () => {
    const lines = draftRekom
      .split(/\r?\n/)
      .map((s) => s.replace(/^[-•\d.)\s]+/, "").trim())
      .filter(Boolean);
    onSaveManual(itemKey, {
      analisa: draftAnalisa.trim(),
      rekomendasi: lines.length > 0 ? lines : rekomendasi,
    });
    setEditing(false);
  };

  return (
    <div className="mt-2.5 text-[12pt] leading-[1.5] text-justify bg-slate-50/60 print:bg-transparent rounded-md p-2.5 print:p-0 border border-slate-200/80 print:border-0">
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="font-bold text-slate-900">Analisa :</span>
        <div className="flex items-center gap-1.5 print:hidden font-sans">
          <button
            type="button"
            disabled={isBusy}
            onClick={() => onGenerateAi(itemKey)}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors cursor-pointer disabled:opacity-50"
            title="Buat ulang narasi Analisa & Rekomendasi berbasis AI sesuai standar mutu RS"
          >
            {isBusy ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
            <span>{isBusy ? "Memproses AI..." : "Analisis AI"}</span>
          </button>
          {!editing && (
            <button
              type="button"
              onClick={startEdit}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
              title="Sunting manual narasi analisa & rekomendasi"
            >
              <Edit3 size={10} />
              <span>Edit</span>
            </button>
          )}
        </div>
      </div>

      {editing ? (
        <div className="space-y-2 font-sans print:hidden mt-1.5">
          <div>
            <label className="block text-[10.5px] font-bold text-slate-600 mb-0.5">
              Narasi Analisa
            </label>
            <textarea
              rows={4}
              value={draftAnalisa}
              onChange={(e) => setDraftAnalisa(e.target.value)}
              className="w-full text-[11px] p-2 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
            />
          </div>
          <div>
            <label className="block text-[10.5px] font-bold text-slate-600 mb-0.5">
              Butir Rekomendasi / Tindak Lanjut (1 baris per poin)
            </label>
            <textarea
              rows={4}
              value={draftRekom}
              onChange={(e) => setDraftRekom(e.target.value)}
              className="w-full text-[11px] p-2 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
            />
          </div>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
            >
              <X size={12} /> Batal
            </button>
            <button
              type="button"
              onClick={saveEdit}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Check size={12} /> Simpan Narasi
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="mb-1.5 text-slate-800">{analisa}</p>
          <p className="font-bold text-slate-900 mb-0.5">{rekomendasiLabel}</p>
          <ol className="list-decimal pl-5 space-y-0.5 text-slate-800">
            {rekomendasi.map((rek, idx) => (
              <li key={idx}>{rek}</li>
            ))}
          </ol>
        </>
      )}
    </div>
  );
};

function chunkArray<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
}

const gradingBgColor = (grading: string) => {
  const low = grading.toLowerCase();
  if (low.includes("extreme")) return "bg-red-600 text-white font-bold";
  if (low.includes("tinggi") || low.includes("high"))
    return "bg-amber-400 text-slate-900 font-bold";
  if (low.includes("sedang") || low.includes("moderate"))
    return "bg-emerald-500 text-white font-semibold";
  return "bg-sky-500 text-white font-semibold";
};

export default function OfficialMutuReport({
  model,
  chapterFilter,
  generatingKey,
  signatures,
  onGenerateSingleAi,
  onSaveManualNarrative,
  onUpdateRawatInapStats,
  onUpdateSignatures,
  onInspectIndicator,
  onRequestChapter,
}: OfficialMutuReportProps) {
  const { period } = model;
  const [editingRanap, setEditingRanap] = useState(false);
  const [ranapDraft, setRanapDraft] = useState<RawatInapStatItem[]>(model.rawatInapStats);
  const [editingSig, setEditingSig] = useState(false);
  const [sigDraft, setSigDraft] = useState<ReportSignatures>(signatures);
  const [jumpPageInput, setJumpPageInput] = useState("");

  const handleSaveRanap = () => {
    onUpdateRawatInapStats(ranapDraft);
    setEditingRanap(false);
  };

  const handleSaveSignatures = () => {
    onUpdateSignatures(sigDraft);
    setEditingSig(false);
  };

  // =========================================================================
  // BUILD ALL INDIVIDUAL F4 BODY PAGES (1..N) — ZERO MERGED PAGES!
  // =========================================================================
  const bodyPages = useMemo<ReportPageDef[]>(() => {
    const pages: ReportPageDef[] = [];

    const programMutuRows: Array<[string, string]> = [
      [
        "Pemilihan dan penetapan prioritas perbaikan mutu RS dan indikator mutu prioritas",
        "Prioritas perbaikan mutu meliputi seluruh area rumah sakit. Pengukuran indikator dilakukan setiap bulan melalui aplikasi OPTIMUS dan dilaporkan kepada Direktur serta Dinas Kesehatan beserta rekomendasinya tiap 3 bulan.",
      ],
      [
        "Pengumpulan data, analisis capaian, validasi dan pelaporan data indikator mutu",
        "Analisis capaian dilakukan pada indikator yang belum stabil capaiannya, indikator yang belum mencapai target dan indikator yang sangat sulit tercapai. Pelaporan data unit kerja terintegrasi dengan menu Input Data OPTIMUS.",
      ],
      [
        "Failure Mode Effect Analysis (FMEA) dilakukan satu tahun sekali",
        `FMEA dilaksanakan pada Tahun ${period.currYear} dengan topik peningkatan hasil kinerja petugas kebersihan dan pengendalian proses berisiko tinggi.`,
      ],
      [
        "Evaluasi dan monitoring Clinical Pathways (CP)",
        "Monitoring pelaksanaan 5 Clinical Pathway prioritas dilakukan oleh Tim Peningkatan Mutu bersama Komite Medik untuk meningkatkan kepatuhan PPA dalam pengisian CP.",
      ],
      [
        "Pelaporan dan analisis insiden keselamatan pasien (IKP)",
        model.ikp.totals.total > 0
          ? `Terdapat ${model.ikp.totals.total} laporan IKP selama periode ${period.rangeLabel} (KPC: ${model.ikp.totals.kpc}, KNC: ${model.ikp.totals.knc}, KTC: ${model.ikp.totals.ktc}, KTD: ${model.ikp.totals.ktd}, Sentinel: ${model.ikp.totals.sentinel}). Laporan IKP telah diinput ke aplikasi Kemenkes RI setiap bulannya.`
          : `Pelaporan dan pemantauan IKP berjalan aktif selama periode ${period.rangeLabel} (tercatat 0 insiden pada filter periode ini) dan dilaporkan ke aplikasi Kemenkes RI setiap bulannya.`,
      ],
      [
        "Penerapan sasaran keselamatan pasien",
        "Tim Keselamatan Pasien memandu penerapan keselamatan pasien dan memonitor 6 indikator Sasaran Keselamatan Pasien (SKP 1 – SKP 6) di seluruh unit pelayanan.",
      ],
      [
        "Pemantauan pelaksanaan program / indikator peningkatan mutu lainnya",
        "Laporan dari komite lain yang telah dilaporkan dan terintegrasi kepada Tim Mutu adalah dari Tim PPI (surveilans cuci tangan, kepatuhan APD, dan angka HAIs).",
      ],
      [
        "Pelaksanaan audit medis dan atau audit klinis",
        `Evaluasi kepatuhan alur klinis dan koordinasi audit medis/klinis dilaksanakan bersama Komite Medik dan KSM terkait pada Tahun ${period.currYear}.`,
      ],
      [
        "Evaluasi program PMKP dengan Komite Medik, Komite lainnya dan kepala unit",
        "Koordinasi dan komunikasi dilakukan pada seluruh unit kerja dan komite-komite untuk membahas review, pencapaian indikator, rapat koordinasi dan feedback unit kerja setiap 3 bulan.",
      ],
      [
        "Root Cause Analysis (RCA) dilaksanakan sesuai insiden sentinel dan KTD",
        model.ikp.totals.sentinel + model.ikp.totals.ktd > 0
          ? `Terdapat ${model.ikp.totals.sentinel + model.ikp.totals.ktd} kasus KTD/Sentinel pada periode ${period.rangeLabel} yang ditindaklanjuti dengan investigasi RCA.`
          : `Tidak ada kasus Sentinel maupun KTD yang memerlukan RCA pada periode ${period.rangeLabel}.`,
      ],
      [
        "Penerapan dan pengukuran budaya keselamatan",
        "Telah dilakukan orientasi dan pembekalan mutu serta keselamatan pasien terhadap karyawan baru dan peserta didik, serta pengukuran survei budaya keselamatan RS.",
      ],
      [
        "Penyelenggaraan pelatihan peningkatan mutu dan keselamatan pasien",
        `Sosialisasi internal pengumpulan data, validasi indikator pada aplikasi OPTIMUS, serta pengajuan pelatihan/workshop PMKP untuk seluruh staf pada Tahun ${period.currYear}.`,
      ],
      [
        "Pelaporan manajemen risiko",
        `Pelaporan daftar risiko (Risk Register) seluruh unit kerja dan pemantauan prioritas risiko rumah sakit disampaikan kepada Direktur secara berkala Tahun ${period.currYear}.`,
      ],
    ];

    // -----------------------------------------------------------------------
    // BAB I: PENDAHULUAN (3 Individual F4 Pages — Hal. 1, 2, 3)
    // -----------------------------------------------------------------------
    pages.push({
      id: "page-bab1-1",
      anchors: ["sec-bab-1", "sec-bab-1-1"],
      group: "BAB_1",
      content: (
        <div>
          <ChapterHeader bab="BAB I" title="PENDAHULUAN" />
          <div className="space-y-3 text-justify text-[12pt] leading-[1.5]">
            <h3 className="font-bold uppercase text-[12pt]">1.1 Latar Belakang</h3>
            <p className="indent-8">
              Rumah Sakit (RS) adalah institusi pelayanan kesehatan yang menyelenggarakan
              pelayanan kesehatan perorangan secara paripurna yang menyediakan pelayanan rawat
              inap, rawat jalan, dan gawat darurat. Kompleksitas ini muncul karena pelayanan di
              rumah sakit menyangkut berbagai fungsi pelayanan, pendidikan dan penelitian, serta
              mencakup berbagai tingkatan maupun jenis disiplin. Rumah sakit harus memiliki sumber
              daya manusia yang profesional baik di bidang teknis medis maupun administrasi
              kesehatan. Untuk menjaga dan meningkatkan mutu, rumah sakit harus mempunyai suatu
              ukuran yang menjamin peningkatan mutu dan keselamatan pasien di semua tingkatan.
              Oleh karena itu Rumah Sakit wajib memiliki laporan dari hasil monitoring dan evaluasi
              untuk memperbaiki proses pelayanan terhadap pasien, agar kejadian tidak diinginkan
              dapat dicegah melalui rencana pelayanan yang komprehensif.
            </p>
            <p className="indent-8">
              Komite Mutu / Tim Mutu RS yang selanjutnya disebut Tim Mutu adalah unsur organisasi
              non struktural yang membantu Direktur RS dalam mengelola dan memandu program
              peningkatan mutu dan keselamatan pasien, serta mempertahankan standar pelayanan RS.
              Setiap RS wajib menyelenggarakan tata kelola mutu. Tata kelola mutu dilakukan untuk
              meningkatkan mutu dan keselamatan pasien RS serta mempertahankan standar pelayanan
              RS.
            </p>
            <p className="indent-8">
              Dalam rangka meningkatkan mutu pelayanan pasien dan menjamin keselamatan pasien maka
              RSUD Al-Mulk Kota Sukabumi mempunyai program peningkatan mutu dan keselamatan pasien
              yang menjangkau ke seluruh unit kerja yang terkait yang nantinya dipakai sebagai
              ukuran kinerja pelayanan RSUD Al-Mulk dan sebagai manajemen kontrol untuk pengambilan
              keputusan. Untuk mencapai tujuan, ditetapkan 5 (lima) sasaran sebagai berikut:
            </p>
            <ol className="list-decimal pl-10 space-y-1.5">
              <li>Terlaksananya pengelolaan kegiatan peningkatan mutu dan keselamatan pasien;</li>
              <li>Terlaksananya pemilihan, pengumpulan, analisis dan validasi data indikator mutu;</li>
              <li>Terlaksananya pelaporan dan analisis Insiden Keselamatan Pasien (IKP);</li>
              <li>Terlaksananya pencapaian dan mempertahankan perbaikan;</li>
              <li>Terlaksananya manajemen risiko RS.</li>
            </ol>
          </div>
        </div>
      ),
    });

    pages.push({
      id: "page-bab1-2",
      anchors: ["sec-bab-1-2", "sec-bab-1-3"],
      group: "BAB_1",
      content: (
        <div className="space-y-3 text-justify text-[12pt] leading-[1.5]">
          <p className="indent-8">
            Penyelenggaraan tata kelola mutu selanjutnya akan dievaluasi dan dilaporkan secara
            berkala oleh Tim Mutu kepada Direktur dan dilaporkan kepada Dewan Pengawas RS / Pemilik
            dalam hal ini Dinas Kesehatan. Laporan berkala yang disusun terdiri atas Laporan
            Triwulan dan Laporan Tahunan di mana keduanya merupakan laporan pelaksanaan tugas dan
            fungsi yang memuat perkembangan dan hasil pencapaian kinerja Tim Mutu RS dalam kurun
            waktu 3 bulan maupun satu tahun.
          </p>
          <p className="indent-8">
            Laporan berkala ini merupakan bentuk pertanggungjawaban kinerja Tim Mutu RS yang dapat
            menjadi media informasi, umpan balik (<em>feedback</em>), dan menjadi bahan evaluasi
            terhadap penyelenggaraan tata kelola mutu RS. Laporan ini dimaksudkan untuk mengetahui
            dan menilai sejauh mana pencapaian kinerja dan progres program yang terlaksana di setiap
            periodenya dengan mengacu pada program mutu RS Tahun {period.currYear}.
          </p>

          <h3 className="font-bold uppercase text-[12pt] pt-3">1.2 Maksud dan Tujuan</h3>
          <p className="indent-8">
            RS berkewajiban untuk meningkatkan mutu dan mempertahankan standar pelayanan RS melalui
            penyelenggaraan tata kelola mutu RS yang baik. Tim Mutu RS sesuai Permenkes Nomor 80
            Tahun 2020 adalah unsur organisasi non struktural yang membantu Direktur RS dalam
            mengelola dan memandu program peningkatan mutu dan keselamatan pasien.
          </p>
          <p className="indent-8">
            Tim Mutu RSUD Al-Mulk sebagai bentuk pertanggungjawaban kepada Direktur membuat laporan
            berkala (Laporan Triwulan dan Laporan Tahunan). Maksud penyusunan Laporan{" "}
            {period.shortPeriodTitle} adalah sebagai laporan pertanggungjawaban tentang
            penyelenggaraan tata kelola mutu RS dengan tujuan untuk meningkatkan mutu RS dan
            mempertahankan standar pelayanan di RSUD Al-Mulk Kota Sukabumi.
          </p>
          <p className="indent-8">
            Laporan {period.shortPeriodTitle} Tim Mutu RSUD Al-Mulk merupakan rangkuman dari suatu
            proses penyelenggaraan tata kelola mutu di masing-masing unit kerja RS. Laporan ini
            dapat memberikan gambaran tentang pencapaian penyelenggaraan mutu RS dengan
            memperhatikan 7 (tujuh) dimensi mutu, yaitu: aman, adil, berorientasi pasien, tepat
            waktu, efektif, efisien, dan terintegrasi.
          </p>
          <p className="indent-8">
            Laporan yang disajikan memberi gambaran tentang kondisi yang dicapai saat ini, kendala
            dan permasalahan yang terjadi dalam upaya pencapaian kinerja, upaya-upaya yang sudah
            dilakukan, dan rencana tindak lanjut sebagai dasar{" "}
            <em>continuous quality improvement</em>.
          </p>

          <h3 className="font-bold uppercase text-[12pt] pt-3">1.3 Ruang Lingkup</h3>
          <p className="indent-8">
            Ruang lingkup laporan ini adalah laporan tentang penyelenggaraan tata kelola mutu di
            RSUD Al-Mulk Kota Sukabumi terkait upaya peningkatan mutu, keselamatan pasien dan
            manajemen risiko RS dalam kurun waktu <strong>{period.rangeLabel}</strong>.
          </p>
        </div>
      ),
    });

    pages.push({
      id: "page-bab1-3",
      anchors: ["sec-bab-1-4"],
      group: "BAB_1",
      content: (
        <div className="space-y-3 text-justify text-[12pt] leading-[1.5]">
          <h3 className="font-bold uppercase text-[12pt]">1.4 Sistematika Penulisan</h3>
          <p className="indent-8">
            Laporan {period.shortPeriodTitle} Tim Mutu RSUD Al-Mulk menjelaskan pencapaian terhadap
            penyelenggaraan tata kelola mutu di RSUD Al-Mulk pada periode{" "}
            <strong>{period.rangeLabel}</strong>. Capaian tersebut mengacu kepada upaya peningkatan
            mutu, keselamatan pasien dan manajemen risiko RS.
          </p>
          <p>Sistematika penyajian laporan adalah sebagai berikut:</p>
          <div className="space-y-2.5 pl-4">
            <div>
              <p className="font-bold">BAB I. PENDAHULUAN</p>
              <p className="indent-6">
                Pada bab ini menjelaskan tentang latar belakang, maksud dan tujuan, ruang lingkup,
                dan sistematika penulisan laporan.
              </p>
            </div>
            <div>
              <p className="font-bold">BAB II. ANALISIS SITUASI AWAL TAHUN</p>
              <p className="indent-6">
                Pada bab ini menjelaskan hambatan yang dihadapi pada tahun yang lalu, uraian tentang
                kelembagaan serta kondisi sumber daya yang dimiliki Tim Mutu RSUD Al-Mulk dalam
                kurun waktu {period.rangeLabel} meliputi sumber daya manusia dan sumber daya sarana
                serta prasarana.
              </p>
            </div>
            <div>
              <p className="font-bold">BAB III. TUJUAN DAN SASARAN KERJA</p>
              <p className="indent-6">
                Pada bab ini menguraikan tentang dasar hukum yang menjadi acuan dalam menetapkan
                tujuan, sasaran, dan indikator RSUD Al-Mulk. Tujuan yang akan dicapai mengacu kepada
                visi dan misi RS. Kemudian dicapai secara nyata dalam rumusan sasaran yang lebih
                spesifik, terukur serta berkesinambungan sejalan tujuan yang telah ditetapkan.
                Tingkat keberhasilan pencapaian sasaran diukur melalui indikator sasaran disertai
                dengan rencana target. Pengukuran indikator mengacu pada upaya peningkatan mutu,
                keselamatan pasien dan manajemen risiko RS.
              </p>
            </div>
            <div>
              <p className="font-bold">BAB IV. STRATEGI PELAKSANAAN</p>
              <p className="indent-6">
                Pada bab ini menguraikan bagaimana mencapai tujuan dan sasaran melalui
                strategi-strategi, hambatan yang terjadi dalam pelaksanaan strategi, dan upaya
                tindak lanjut untuk mengatasi hambatan pada pelaksanaan strategi tersebut.
              </p>
            </div>
            <div>
              <p className="font-bold">BAB V. HASIL KERJA</p>
              <p className="indent-6">
                Pada bab ini menguraikan tentang hasil pencapaian dari penyelenggaraan tata kelola
                mutu RS. Hasil kinerja meliputi capaian Program Mutu RS, capaian Indikator Pelayanan
                Rawat Inap, Indikator Nasional Mutu (INM), Indikator Mutu Prioritas RS (IMP-RS),
                Indikator Mutu Prioritas Unit (IMP-Unit), Mutu Pencegahan dan Pengendalian Infeksi
                (PPI), Indikator Standar Pelayanan Minimal (SPM), Evaluasi Panduan Praktik Klinik
                (PPK) / Clinical Pathway (CP), Keselamatan Pasien dan Budaya Keselamatan RS, serta
                Manajemen Risiko RS.
              </p>
            </div>
            <div>
              <p className="font-bold">BAB VI. PENUTUP</p>
              <p className="indent-6">
                Pada bab ini menguraikan kesimpulan dan rekomendasi dari uraian sebelumnya beserta
                lembar disposisi rekomendasi pimpinan.
              </p>
            </div>
          </div>
        </div>
      ),
    });

    // -----------------------------------------------------------------------
    // BAB II: ANALISIS SITUASI AWAL TAHUN (6 Individual F4 Pages — Hal. 4..9)
    // -----------------------------------------------------------------------
    pages.push({
      id: "page-bab2-1",
      anchors: ["sec-bab-2", "sec-bab-2-1"],
      group: "BAB_2",
      content: (
        <div>
          <ChapterHeader bab="BAB II" title="ANALISIS SITUASI AWAL TAHUN" />
          <div className="space-y-3 text-justify text-[12pt] leading-[1.5]">
            <h3 className="font-bold uppercase text-[12pt]">2.1 Hambatan Tahun Lalu</h3>
            <p className="indent-8">
              Dampak dari pergantian pengumpul dan pengolahan data, pengukuran mutu dan keselamatan
              pasien yang telah berjalan rutin dari waktu ke waktu dan keberlangsungan pengukuran
              menghadapi tantangan pada perubahan kondisi di masa pergantian pengumpulan dan
              pengolahan data ini. Hambatan-hambatan dalam pelaksanaan program mutu adalah:
            </p>
            <div className="space-y-3 pl-2">
              <div>
                <p className="font-bold">1. Tim Peningkatan Mutu</p>
                <ol className="list-[lower-alpha] pl-8 space-y-1 mt-1">
                  <li>Belum seluruh unit kerja menyusun program peningkatan mutu;</li>
                  <li>Belum seluruh petugas memiliki pemahaman yang sama tentang mutu;</li>
                  <li>
                    Pengukuran dan pelaporan indikator kinerja belum akurat dan tepat waktu
                    dilakukan oleh seluruh unit kerja;
                  </li>
                  <li>Sosialisasi, edukasi, dan pendampingan unit kerja belum optimal;</li>
                  <li>Pemantauan pelaksanaan PMKP dan supervisi berjenjang belum optimal;</li>
                  <li>
                    Audit medis dan audit klinik belum kolaboratif antar Profesional Pemberi Asuhan
                    (PPA);
                  </li>
                  <li>Belum terlaksananya manajemen data terintegrasi berbasis IT secara penuh.</li>
                </ol>
              </div>
              <div>
                <p className="font-bold">2. Tim Keselamatan Pasien</p>
                <ol className="list-[lower-alpha] pl-8 space-y-1 mt-1">
                  <li>
                    Belum seluruh petugas memiliki pemahaman yang sama tentang keselamatan pasien
                    dan budaya keselamatan RS;
                  </li>
                  <li>Pelaporan insiden keselamatan pasien belum tepat waktu;</li>
                  <li>Monitoring dan evaluasi keselamatan pasien belum optimal;</li>
                  <li>Supervisi berjenjang belum optimal;</li>
                  <li>Budaya mutu dan keselamatan pasien belum optimal.</li>
                </ol>
              </div>
              <div>
                <p className="font-bold">3. Tim Manajemen Risiko</p>
                <ol className="list-[lower-alpha] pl-8 space-y-1 mt-1">
                  <li>Belum seluruh unit kerja menyusun program manajemen risiko;</li>
                  <li>
                    Tidak adanya sosialisasi PMK Nomor 25 Tahun 2019 tentang &ldquo;Penerapan
                    Manajemen Risiko Terintegrasi di Lingkungan Kementerian Kesehatan RI&rdquo;;
                  </li>
                  <li>Program manajemen risiko unit kerja belum terlaksana secara seragam;</li>
                  <li>
                    Manajemen risiko yang telah dibuat tahun sebelumnya tidak dilakukan pengelolaan
                    dan pemantauan secara konsisten;
                  </li>
                  <li>Pendampingan manajemen risiko unit kerja belum optimal;</li>
                  <li>Manajemen risiko di unit kerja belum terdokumentasi dengan baik.</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      ),
    });

    pages.push({
      id: "page-bab2-2",
      anchors: ["sec-bab-2-2", "sec-bab-2-2-1"],
      group: "BAB_2",
      content: (
        <div className="space-y-3 text-justify text-[12pt] leading-[1.5]">
          <h3 className="font-bold uppercase text-[12pt]">2.2 Kelembagaan</h3>
          <p className="indent-8">
            Tim Mutu RSUD Al-Mulk Kota Sukabumi dibentuk dan ditetapkan dengan Surat Keputusan
            Direktur Nomor 147/SK/XII/2022. Tim Mutu RS berada di bawah dan bertanggung jawab
            kepada Direktur.
          </p>
          <h4 className="font-bold uppercase text-[12pt] pt-1">2.2.1 Struktur Organisasi</h4>
          <div className="my-3 flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/laporan/struktur_organisasi_tim_mutu.jpeg"
              alt="Struktur Organisasi Tim Mutu RSUD Al-Mulk"
              className="max-h-[340px] w-auto object-contain rounded border border-slate-300"
            />
          </div>
          <p className="font-semibold">Penjelasan dari bagan di atas adalah:</p>
          <div className="space-y-2 pl-2">
            <div>
              <p className="font-bold">
                1. Tim Mutu RSUD Al-Mulk Kota Sukabumi dipilih, diangkat, dan diberhentikan oleh
                Direktur, terdiri dari:
              </p>
              <ol className="list-[lower-alpha] pl-8 space-y-0.5 mt-0.5">
                <li>Ketua;</li>
                <li>Sekretaris;</li>
                <li>Ketua Tim Peningkatan Mutu;</li>
                <li>Ketua Tim Keselamatan Pasien;</li>
                <li>Ketua Tim Manajemen Risiko;</li>
                <li>PIC Data.</li>
              </ol>
            </div>
            <div>
              <p className="font-bold">2. Komite-Komite</p>
              <p className="pl-4">
                Tim Mutu melakukan koordinasi dengan seluruh Komite-Komite di RSUD Al-Mulk, yaitu:
              </p>
              <ol className="list-[lower-alpha] pl-8 space-y-0.5 mt-0.5">
                <li>Komite Medik</li>
                <li>Komite Keperawatan</li>
                <li>Tim PPI</li>
                <li>Komite Nakes Lain</li>
                <li>Komite Etik dan Hukum</li>
              </ol>
            </div>
          </div>
        </div>
      ),
    });

    pages.push({
      id: "page-bab2-3",
      anchors: ["sec-bab-2-2-2"],
      group: "BAB_2",
      content: (
        <div className="space-y-3 text-justify text-[12pt] leading-[1.5]">
          <div className="pl-2">
            <p className="font-bold">3. Dewan Pengawas / Pemilik</p>
            <p className="indent-8 mt-1">
              Tim Mutu membuat laporan dan rekomendasi kepada Direktur setiap bulan atau
              sewaktu-waktu bila diperlukan. Direktur melaporkan hasil kegiatan penyelenggaraan
              mutu kepada Pemilik RSUD Al-Mulk dalam hal ini Dinas Kesehatan Kota Sukabumi. Pemilik
              RS memberikan umpan balik berupa rekomendasi kepada Direktur untuk ditindaklanjuti.
            </p>
          </div>

          <h4 className="font-bold uppercase text-[12pt] pt-2">2.2.2 Tugas dan Fungsi</h4>
          <p className="indent-8">
            Tim Mutu RSUD Al-Mulk Kota Sukabumi bertugas membantu Direktur RS dalam pelaksanaan dan
            evaluasi peningkatan mutu, keselamatan pasien, dan manajemen risiko di rumah sakit,
            sebagai berikut:
          </p>
          <ol className="list-decimal pl-8 space-y-1">
            <li>Sebagai motor penggerak penyusunan program PMKP RS;</li>
            <li>Melakukan monitoring dan memandu penerapan program PMKP di unit kerja;</li>
            <li>
              Membantu dan melakukan koordinasi dengan pimpinan unit pelayanan dalam memilih
              prioritas perbaikan, pengukuran mutu / indikator mutu, dan menindaklanjuti hasil
              capaian indikator;
            </li>
            <li>
              Melakukan koordinasi dan pengorganisasian pemilihan prioritas program di tingkat unit
              kerja serta menggabungkan menjadi prioritas RS secara keseluruhan. Prioritas program
              RS ini harus terkoordinasi dengan baik dalam pelaksanaannya;
            </li>
            <li>
              Menentukan profil indikator mutu, metode analisis dan validasi data dari data indikator
              mutu yang dikumpulkan dari seluruh unit kerja di RS;
            </li>
            <li>
              Menyusun formulir untuk mengumpulkan data, menentukan jenis data, serta bagaimana alur
              data dan pelaporan dilaksanakan;
            </li>
            <li>
              Menjalin komunikasi yang baik dengan semua pihak terkait serta menyampaikan masalah
              terkait pelaksanaan program mutu dan keselamatan pasien;
            </li>
            <li>Terlibat secara penuh dalam kegiatan pendidikan dan pelatihan PMKP;</li>
            <li>
              Bertanggung jawab untuk mengomunikasikan masalah-masalah mutu secara rutin kepada
              semua staf;
            </li>
            <li>Menyusun regulasi terkait dengan pengawasan dan penerapan program PMKP;</li>
            <li>
              Menangani insiden keselamatan pasien yang meliputi pelaporan, verifikasi, investigasi
              dan analisis penyebab insiden keselamatan pasien;
            </li>
            <li>Mengoordinasikan penyusunan program manajemen risiko RS.</li>
          </ol>

          <p className="pt-1 font-semibold">
            Dalam melaksanakan tugas pelaksanaan dan evaluasi peningkatan mutu, Tim Mutu RSUD
            Al-Mulk memiliki fungsi:
          </p>
          <ol className="list-decimal pl-8 space-y-1">
            <li>
              Penyusunan kebijakan, pedoman dan program kerja terkait pengelolaan dan penerapan
              program mutu pelayanan RS;
            </li>
            <li>
              Pemberian masukan dan pertimbangan kepada Direktur RS terkait perbaikan mutu tingkat
              RS;
            </li>
          </ol>
        </div>
      ),
    });

    pages.push({
      id: "page-bab2-4",
      group: "BAB_2",
      content: (
        <div className="space-y-3 text-justify text-[12pt] leading-[1.5]">
          <ol start={3} className="list-decimal pl-8 space-y-1">
            <li>
              Pemilihan prioritas perbaikan tingkat RS dan pengukuran indikator tingkat RS serta
              menindaklanjuti hasil capaian indikator tersebut;
            </li>
            <li>Pemantauan dan memandu penerapan program mutu di unit kerja;</li>
            <li>
              Pemantauan dan memandu unit kerja dalam memilih prioritas perbaikan, pengukuran mutu /
              indikator mutu dan menindaklanjuti hasil capaian indikator mutu;
            </li>
            <li>Fasilitasi penyusunan profil indikator mutu dan instrumen untuk pengumpulan data;</li>
            <li>
              Fasilitasi pengumpulan data, analisis capaian, validasi dan pelaporan data dari
              seluruh unit kerja;
            </li>
            <li>
              Pengumpulan data, analisis capaian, validasi dan pelaporan data indikator prioritas RS
              dan indikator mutu nasional RS;
            </li>
            <li>
              Koordinasi dan komunikasi dengan Komite Medis dan Komite lainnya, Satuan Pemeriksaan
              Internal dan unit kerja lainnya yang terkait, serta staf;
            </li>
            <li>Pelaksanaan dukungan untuk implementasi budaya mutu di RS;</li>
            <li>
              Pengkajian standar mutu pelayanan di RS terhadap pelayanan, pendidikan dan penelitian;
            </li>
            <li>Penyelenggaraan pelatihan peningkatan mutu;</li>
            <li>Penyusunan laporan pelaksanaan program peningkatan mutu.</li>
          </ol>

          <p className="pt-1 font-semibold">
            Dalam melaksanakan tugas pelaksanaan dan evaluasi keselamatan pasien, Tim Mutu RSUD
            Al-Mulk memiliki fungsi:
          </p>
          <ol className="list-decimal pl-8 space-y-1">
            <li>
              Penyusunan kebijakan, pedoman dan program kerja terkait keselamatan pasien RS;
            </li>
            <li>
              Pemberian masukan dan pertimbangan kepada Direktur RS dalam rangka pengambilan
              kebijakan keselamatan pasien;
            </li>
            <li>Pemantauan dan memandu penerapan keselamatan pasien di unit kerja;</li>
            <li>
              Motivasi, edukasi, konsultasi, pemantauan dan penilaian tentang penerapan program
              keselamatan pasien;
            </li>
            <li>
              Pencatatan, analisis dan pelaporan insiden, termasuk melakukan{" "}
              <em>Root Cause Analysis</em> (RCA) dan pemberian solusi untuk meningkatkan keselamatan
              pasien;
            </li>
            <li>
              Pelaporan insiden secara kontinu sesuai dengan ketentuan peraturan
              perundang-undangan;
            </li>
            <li>Melaksanakan pelatihan keselamatan pasien;</li>
            <li>Penyusunan laporan pelaksanaan program keselamatan pasien.</li>
          </ol>

          <p className="pt-1 font-semibold">
            Dalam melaksanakan tugas pelaksanaan dan evaluasi manajemen risiko, Tim Mutu RSUD
            Al-Mulk memiliki fungsi:
          </p>
          <ol className="list-decimal pl-8 space-y-1">
            <li>Penyusunan kebijakan, pedoman dan program kerja terkait manajemen risiko RS;</li>
            <li>
              Pemberian masukan dan pertimbangan kepada Direktur RS terkait manajemen risiko di RS;
            </li>
            <li>Pemantauan dan memandu penerapan manajemen risiko di unit kerja;</li>
            <li>Pemberian usulan atas profil risiko dan rencana penanganannya;</li>
          </ol>
        </div>
      ),
    });

    pages.push({
      id: "page-bab2-5",
      group: "BAB_2",
      content: (
        <div className="space-y-3 text-justify text-[12pt] leading-[1.5]">
          <ol start={5} className="list-decimal pl-8 space-y-1">
            <li>Pelaksanaan dan pelaporan rencana penanganan risiko sesuai lingkup tugasnya;</li>
            <li>Pemberian usulan rencana kontingensi apabila kondisi yang tidak normal terjadi;</li>
            <li>Pelaksanaan penanganan risiko tinggi;</li>
            <li>Pelaksanaan pelatihan manajemen risiko;</li>
            <li>Penyusunan laporan pelaksanaan program manajemen risiko.</li>
          </ol>

          <p className="pt-2 font-semibold">
            Pelaksanaan tugas dan fungsi berdasarkan program kerja Tim Mutu meliputi:
          </p>
          <ol className="list-decimal pl-8 space-y-1.5">
            <li>
              Pengukuran mutu indikator termasuk Indikator Nasional Mutu (INM), Indikator Mutu
              Prioritas Rumah Sakit (IMP-RS), dan Indikator Mutu Prioritas Unit (IMP-Unit).
            </li>
            <li>Meningkatkan perbaikan mutu dan mempertahankan perbaikan berkelanjutan.</li>
            <li>
              Mengurangi varian dalam praktik klinis dengan menerapkan PPK / Algoritma / Protokol
              dan melakukan pengukuran dengan <em>Clinical Pathway</em>.
            </li>
            <li>
              Mengukur dampak efisiensi dan efektivitas prioritas perbaikan terhadap keuangan dan
              sumber daya misalnya SDM.
            </li>
            <li>Pelaporan dan analisis insiden keselamatan pasien.</li>
            <li>Penerapan sasaran keselamatan pasien.</li>
            <li>Evaluasi kontrak klinis dan kontrak manajemen.</li>
            <li>
              Pelatihan semua staf sesuai perannya dalam program peningkatan mutu dan keselamatan
              pasien.
            </li>
            <li>
              Mengomunikasikan hasil pengukuran mutu meliputi masalah mutu dan capaian data kepada
              staf.
            </li>
          </ol>

          <p className="indent-8 pt-2">
            Selain melaksanakan fungsi tersebut, Tim Mutu RSUD Al-Mulk juga melaksanakan fungsi
            persiapan dan penyelenggaraan akreditasi Rumah Sakit. Hasil pelaksanaan tugas dan fungsi
            dilaporkan secara tertulis kepada Direktur disertai rekomendasi, paling sedikit setiap 3
            (tiga) bulan atau sewaktu-waktu bila diperlukan. Direktur melaporkan hasil kegiatan
            penyelenggaraan mutu kepada Pemilik RSUD Al-Mulk dalam hal ini Dinas Kesehatan Kota
            Sukabumi. Pemilik atau Dewan Pengawas memberikan umpan balik berupa rekomendasi kepada
            Direktur untuk ditindaklanjuti.
          </p>
          <p className="indent-8">
            Dalam rangka meningkatkan kinerja pelaksanaan tugas dan fungsi Tim Mutu, dapat dilakukan
            upaya peningkatan kapasitas keanggotaan Tim Mutu. Upaya peningkatan kapasitas
            dilaksanakan melalui pelatihan baik internal maupun eksternal.
          </p>
        </div>
      ),
    });

    pages.push({
      id: "page-bab2-6",
      anchors: ["sec-bab-2-3", "sec-bab-2-3-1", "sec-bab-2-3-2", "tbl-2-1"],
      group: "BAB_2",
      content: (
        <div className="space-y-3.5 text-justify text-[12pt] leading-[1.5]">
          <h3 className="font-bold uppercase text-[12pt]">2.3 Sumber Daya</h3>
          <h4 className="font-bold uppercase text-[12pt]">2.3.1 Sumber Daya Manusia</h4>
          <p className="indent-8">
            Tim Mutu RSUD Al-Mulk Kota Sukabumi dipilih, diangkat dan diberhentikan oleh Direktur
            terdiri dari:
          </p>
          <ol className="list-decimal pl-10 space-y-0.5">
            <li>Ketua;</li>
            <li>Sekretaris;</li>
            <li>Ketua Tim Peningkatan Mutu;</li>
            <li>Ketua Tim Keselamatan Pasien;</li>
            <li>Ketua Tim Manajemen Risiko;</li>
            <li>PIC Data.</li>
          </ol>
          <p className="indent-8">
            Keanggotaan Tim Mutu RS terdiri atas: tenaga medis; tenaga keperawatan; tenaga kesehatan
            lain; dan tenaga non kesehatan, yang merupakan tenaga paruh waktu.
          </p>

          <h4 className="font-bold uppercase text-[12pt] pt-2">
            2.3.2 Sumber Daya Sarana dan Prasarana
          </h4>
          <p className="indent-8">
            Tim Mutu berada di lantai II Gedung Manajemen RSUD Al-Mulk Kota Sukabumi yang dilengkapi
            dengan sarana dan prasarana untuk menunjang penyelenggaraan tata kelola mutu di RSUD
            Al-Mulk Kota Sukabumi.
          </p>

          <div className="pt-2">
            <p className="text-center font-bold text-[11.5pt] mb-2">
              Tabel 2.1 Sarana prasarana tim mutu {period.shortPeriodTitle} RSUD Al-Mulk
            </p>
            <table className="w-full border-collapse border border-slate-900 text-[10.5pt] leading-[1.35]">
              <thead>
                <tr className="bg-slate-100 font-bold text-center">
                  <th rowSpan={2} className="border border-slate-900 px-2 py-1.5 w-10">
                    No
                  </th>
                  <th rowSpan={2} className="border border-slate-900 px-3 py-1.5 text-left">
                    Nama Sapras
                  </th>
                  <th colSpan={3} className="border border-slate-900 px-2 py-1">
                    {period.shortPeriodTitle}
                  </th>
                  <th rowSpan={2} className="border border-slate-900 px-3 py-1.5">
                    Keterangan
                  </th>
                </tr>
                <tr className="bg-slate-100 font-bold text-center">
                  <th className="border border-slate-900 px-2 py-1">Sapras Awal</th>
                  <th className="border border-slate-900 px-2 py-1">(+) / (-)</th>
                  <th className="border border-slate-900 px-2 py-1">Sapras Akhir</th>
                </tr>
              </thead>
              <tbody>
                {DEFAULT_SAPRAS_TIM_MUTU.map((s) => (
                  <tr key={s.no}>
                    <td className="border border-slate-900 px-2 py-1.5 text-center">{s.no}</td>
                    <td className="border border-slate-900 px-3 py-1.5">{s.nama}</td>
                    <td className="border border-slate-900 px-2 py-1.5 text-center">{s.awal}</td>
                    <td className="border border-slate-900 px-2 py-1.5 text-center">
                      {s.perubahan}
                    </td>
                    <td className="border border-slate-900 px-2 py-1.5 text-center">{s.akhir}</td>
                    <td className="border border-slate-900 px-3 py-1.5 text-center">
                      {s.keterangan}
                    </td>
                  </tr>
                ))}
                <tr className="font-bold bg-slate-50">
                  <td colSpan={2} className="border border-slate-900 px-3 py-1.5 text-center">
                    Total
                  </td>
                  <td className="border border-slate-900 px-2 py-1.5 text-center">10</td>
                  <td className="border border-slate-900 px-2 py-1.5 text-center">-</td>
                  <td className="border border-slate-900 px-2 py-1.5 text-center">10</td>
                  <td className="border border-slate-900 px-3 py-1.5 text-center">-</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ),
    });

    // -----------------------------------------------------------------------
    // BAB III: TUJUAN DAN SASARAN KERJA (3 Individual F4 Pages — Hal. 10..12)
    // -----------------------------------------------------------------------
    pages.push({
      id: "page-bab3-1",
      anchors: ["sec-bab-3", "sec-bab-3-1"],
      group: "BAB_3",
      content: (
        <div>
          <ChapterHeader bab="BAB III" title="TUJUAN DAN SASARAN KERJA" />
          <div className="space-y-3 text-justify text-[12pt] leading-[1.5]">
            <h3 className="font-bold uppercase text-[12pt]">3.1 Dasar Hukum</h3>
            <p className="indent-8">
              Dasar hukum penyelenggaraan tata kelola mutu UOBK RSUD Al-Mulk adalah sebagai berikut:
            </p>
            <ol className="list-decimal pl-8 space-y-1.5">
              <li>
                Undang-Undang Dasar Negara Republik Indonesia Tahun 1945 Bab V tentang Kementerian
                Negara Pasal 17 ayat (3) Setiap Menteri Membidangi Urusan Tertentu Dalam
                Pemerintahan;
              </li>
              <li>
                Undang-Undang Nomor 39 Tahun 2008 tentang Kementerian Negara (Lembaran Negara
                Republik Indonesia Tahun 2008 Nomor 166, Tambahan Lembaran Negara Republik Indonesia
                Nomor 4916);
              </li>
              <li>
                Undang-Undang Nomor 36 Tahun 2009 tentang Kesehatan (Lembaran Negara Republik
                Indonesia Tahun 2009 Nomor 144, Tambahan Lembaran Negara Republik Indonesia Nomor
                5063);
              </li>
              <li>
                Undang-Undang Nomor 44 Tahun 2009 tentang Rumah Sakit (Lembaran Negara Republik
                Indonesia Tahun 2009 Nomor 153, Tambahan Lembaran Negara Republik Indonesia Nomor
                5072);
              </li>
              <li>
                Undang-Undang Nomor 36 Tahun 2014 tentang Tenaga Kesehatan (Lembaran Negara Republik
                Indonesia Tahun 2014 Nomor 298, Tambahan Lembaran Negara Republik Indonesia Nomor
                5607);
              </li>
              <li>
                Keputusan Menteri Kesehatan Nomor 772/Menkes/SK/VI/2002 tentang Pedoman Peraturan
                Internal Rumah Sakit;
              </li>
              <li>
                Peraturan Menteri Kesehatan Nomor 1045/Menkes/Per/XI/2006 tentang Pedoman Organisasi
                Rumah Sakit di Lingkungan Departemen Kesehatan;
              </li>
              <li>
                Keputusan Menteri Kesehatan Republik Indonesia Nomor 983/Menkes/SK/XI/1992 tentang
                Pedoman Rumah Sakit Umum;
              </li>
              <li>
                Peraturan Presiden Nomor 35 Tahun 2015 tentang Kementerian Kesehatan (Lembaran Negara
                Republik Indonesia Tahun 2015 Nomor 59);
              </li>
              <li>
                Peraturan Presiden Nomor 77 Tahun 2015 tentang Pedoman Organisasi Rumah Sakit
                (Lembaran Negara Republik Indonesia Nomor 159 Tahun 2015);
              </li>
              <li>
                Peraturan Menteri Kesehatan Republik Indonesia Nomor 11 Tahun 2017 tentang Keselamatan
                Pasien (Berita Negara Republik Indonesia Tahun 2017 Nomor 308);
              </li>
              <li>
                Peraturan Menteri Kesehatan Republik Indonesia Nomor 34 Tahun 2017 tentang Akreditasi
                Rumah Sakit;
              </li>
              <li>
                Peraturan Menteri Kesehatan Republik Indonesia Nomor 25 Tahun 2019 tentang Penerapan
                Manajemen Risiko Terintegrasi di Lingkungan Kementerian Kesehatan;
              </li>
            </ol>
          </div>
        </div>
      ),
    });

    pages.push({
      id: "page-bab3-2",
      anchors: ["sec-bab-3-2", "sec-bab-3-2-1"],
      group: "BAB_3",
      content: (
        <div className="space-y-3 text-justify text-[12pt] leading-[1.5]">
          <ol start={14} className="list-decimal pl-8 space-y-1.5">
            <li>
              Peraturan Menteri Kesehatan Republik Indonesia Nomor 3 Tahun 2020 tentang Klasifikasi
              dan Perizinan Rumah Sakit (Berita Negara Republik Indonesia Tahun 2020 Nomor 21);
            </li>
            <li>
              Peraturan Menteri Kesehatan Republik Indonesia Nomor 80 Tahun 2020 tentang Komite Mutu
              Rumah Sakit;
            </li>
            <li>
              Peraturan Menteri Kesehatan Republik Indonesia Nomor 25 Tahun 2020 tentang Organisasi
              dan Tata Kerja Kementerian Kesehatan (Berita Negara Republik Indonesia Tahun 2020
              Nomor 1146);
            </li>
            <li>
              Keputusan Direktur Jenderal Pelayanan Kesehatan Nomor HK.02.02/I/4405/2020 tentang
              Pedoman Pemantauan dan Evaluasi Kesiapan Rumah Sakit pada Masa Pandemi Covid-19;
            </li>
            <li>
              Peraturan Menteri Kesehatan Nomor 4 Tahun 2019 tentang Standar Teknis Pemenuhan Mutu
              Pelayanan Dasar pada Standar Pelayanan Minimal Bidang Kesehatan;
            </li>
            <li>
              Keputusan Menteri Kesehatan Nomor HK.01.07/Menkes/1591/2020 tentang Protokol Kesehatan
              di Fasilitas Pelayanan Kesehatan dalam Rangka Pencegahan dan Pengendalian Covid-19
              Panduan Teknis Pelayanan Rumah Sakit pada Masa Adaptasi Kebiasaan Baru;
            </li>
            <li>
              Peraturan Menteri Kesehatan Republik Indonesia Nomor 30 Tahun 2022 tentang Indikator
              Nasional Mutu Pelayanan Kesehatan serta Keputusan Menteri Kesehatan Nomor
              129/Menkes/SK/II/2008 tentang Standar Pelayanan Minimal Rumah Sakit.
            </li>
          </ol>

          <h3 className="font-bold uppercase text-[12pt] pt-3">
            3.2 Tujuan, Sasaran dan Indikator
          </h3>
          <h4 className="font-bold uppercase text-[12pt]">3.2.1 Tujuan</h4>
          <p className="indent-8">
            Mutu RSUD Al-Mulk adalah pelayanan bagi individu dan populasi yang dapat meningkatkan
            keluaran (<em>outcome</em>) kesehatan yang optimal, diberikan sesuai dengan standar
            pelayanan, perkembangan ilmu pengetahuan terkini serta memperhatikan hak dan keterlibatan
            pasien-masyarakat. 7 (Tujuh) dimensi mutu yang harus dilaksanakan adalah aman, adil,
            berorientasi pasien, tepat waktu, efektif, efisien, dan terintegrasi. Tujuan
            penyelenggaraan tata kelola mutu adalah mempertahankan mutu dan keselamatan pasien RSUD
            Al-Mulk.
          </p>
          <p className="indent-8">
            Mutu harus menjadi dasar kegiatan di RSUD Al-Mulk. Secara rinci, mutu yang dilaksanakan
            harus:
          </p>
          <ol className="list-decimal pl-8 space-y-1">
            <li>
              Menjamin bahwa sistem kesehatan memiliki infrastruktur informasi dan teknologi
              informasi yang dapat mengukur dan melaporkan mutu RS;
            </li>
            <li>
              Mengembangkan SDM yang memiliki kemampuan untuk memenuhi permintaan dan kebutuhan
              pelayanan kesehatan yang bermutu tinggi;
            </li>
            <li>
              Menunjukkan akuntabilitas untuk menyediakan pelayanan yang aman dan bermutu tinggi;
            </li>
            <li>Menutup kesenjangan antara mutu yang diterima dan yang dapat dicapai;</li>
            <li>Mengembangkan tata kelola RS yang baik;</li>
          </ol>
        </div>
      ),
    });

    pages.push({
      id: "page-bab3-3",
      anchors: ["sec-bab-3-2-2"],
      group: "BAB_3",
      content: (
        <div className="space-y-3.5 text-justify text-[12pt] leading-[1.5]">
          <ol start={6} className="list-decimal pl-8 space-y-1.5">
            <li>
              Menjamin bahwa reformasi kesehatan menguatkan mutu RS dalam sistem pelayanan
              kesehatannya;
            </li>
            <li>
              Menguatkan kemitraan antara penyedia dan penerima pelayanan kesehatan sehingga
              mendorong upaya peningkatan mutu;
            </li>
            <li>Melakukan riset untuk peningkatan mutu pelayanan.</li>
          </ol>

          <h4 className="font-bold uppercase text-[12pt] pt-4">3.2.2 Sasaran dan Indikator</h4>
          <p className="indent-8">
            Sasaran adalah hasil yang akan dicapai secara nyata dalam rumusan yang lebih spesifik
            dan terukur pada Tahun {period.currYear}. Indikator adalah ukuran tingkat keberhasilan
            pencapaian sasaran untuk diwujudkan pada Tahun {period.currYear}. Setiap indikator
            disertai dengan rencana target masing-masing yang mengacu pada dokumen:
          </p>
          <ol className="list-decimal pl-10 space-y-1.5">
            <li>Indikator Nasional Mutu (INM);</li>
            <li>Indikator Mutu Prioritas Rumah Sakit (IMP-RS);</li>
            <li>Indikator Mutu Prioritas Unit (IMP-Unit);</li>
            <li>Indikator Mutu Pencegahan dan Pengendalian Infeksi (PPI);</li>
            <li>Indikator Mutu Standar Pelayanan Minimal (SPM);</li>
            <li>Panduan Praktik Klinik (PPK) / <em>Clinical Pathway</em> (CP);</li>
            <li>Indikator Mutu Program Nasional (Prognas);</li>
            <li>Indikator Keselamatan Pasien dan Budaya Keselamatan RS;</li>
            <li>Manajemen Risiko RS.</li>
          </ol>
        </div>
      ),
    });

    // -----------------------------------------------------------------------
    // BAB IV: STRATEGI PELAKSANAAN (4 Individual F4 Pages — Hal. 13..16)
    // -----------------------------------------------------------------------
    pages.push({
      id: "page-bab4-1",
      anchors: ["sec-bab-4", "sec-bab-4-1"],
      group: "BAB_4",
      content: (
        <div>
          <ChapterHeader bab="BAB IV" title="STRATEGI PELAKSANAAN" />
          <div className="space-y-3 text-justify text-[12pt] leading-[1.5]">
            <h3 className="font-bold uppercase text-[12pt]">
              4.1 Strategi Pencapaian Tujuan dan Sasaran
            </h3>
            <p>Strategi-strategi umum yang dilakukan Tim Mutu RSUD Al-Mulk adalah:</p>
            <ol className="list-decimal pl-8 space-y-1">
              <li>
                Meningkatkan akses pelayanan kesehatan yang bermutu dan mengutamakan keselamatan
                pasien-masyarakat;
              </li>
              <li>
                Meningkatkan kepatuhan terhadap standar mutu klinis dan keselamatan
                pasien-masyarakat;
              </li>
              <li>
                Mendorong budaya peningkatan mutu dan keselamatan pasien pada pelaksanaan program
                RS;
              </li>
              <li>Memberdayakan pasien, keluarga dan masyarakat;</li>
              <li>
                Menguatkan regulasi, tata kelola, struktur organisasi, sumber daya dan peran seluruh
                komponen sistem kesehatan lainnya;
              </li>
              <li>Meningkatkan komitmen mutu;</li>
              <li>
                Mendorong pengukuran mutu, penelitian dan pemanfaatan informasi strategis.
              </li>
            </ol>

            <p className="indent-8 pt-1">
              Pelatihan-pelatihan mengenai peningkatan mutu dan keselamatan pasien dilakukan dengan
              memodifikasi sistem daring dan luring. Inti dari peningkatan mutu melalui pendekatan{" "}
              <em>rapid learning cycle</em> (RLC) adalah menetapkan tujuan perubahan, menentukan
              cara pengukuran perubahan, dan menciptakan perubahan untuk menghasilkan peningkatan
              mutu. Ini diikuti dengan siklus <strong>Plan-Do-Study-Act (PDSA)</strong> yang diulang
              untuk memvalidasi atau memperbesar perubahan. Pendekatan PDSA dan kepemimpinan di
              semua level mampu mengoordinasi, mengembangkan protokol dan mengimplementasikan
              perubahan yang terjadi.
            </p>

            <p className="font-semibold pt-1">
              Langkah PDSA RSUD Al-Mulk dalam pelaksanaan peningkatan mutu dan keselamatan pasien
              adalah:
            </p>
            <ol className="list-decimal pl-8 space-y-1.5">
              <li>
                <strong>Plan:</strong> RS mendukung pelaksanaan PMKP, membentuk Tim PMKP,
                perencanaan dan sarana prasarana untuk pelaksanaan program PMKP.
              </li>
              <li>
                <strong>Do:</strong> Membuat regulasi pelaksanaan program peningkatan mutu dan
                keselamatan pasien dan mengajukan pelatihan baik internal maupun eksternal RS.
              </li>
              <li>
                <strong>Study:</strong> Update keilmuan dan regulasi terbaru sesuai peraturan
                pemerintah.
              </li>
              <li>
                <strong>Act:</strong> Pelaksanaan program kerja, monitoring dan evaluasi setiap
                triwulan, pengajuan pelatihan.
              </li>
            </ol>
          </div>
        </div>
      ),
    });

    pages.push({
      id: "page-bab4-2",
      group: "BAB_4",
      content: (
        <div className="space-y-3 text-justify text-[12pt] leading-[1.5]">
          <p className="font-bold">
            Strategi khusus untuk mempertahankan mutu dan keselamatan pasien RSUD Al-Mulk adalah:
          </p>
          <ol className="list-decimal pl-8 space-y-1.5">
            <li>
              Pimpinan berperan aktif dalam proses penentuan serta penilaian komponen / indikator
              mutu;
            </li>
            <li>
              Optimalisasi SDM dan sistem yang bersinergi dalam penyediaan data untuk pengukuran /
              indikator mutu;
            </li>
            <li>
              Pemusatan data dan informasi yang memudahkan dalam pencarian serta penyediaan data
              dengan membangun aplikasi{" "}
              <strong>OPTIMUS (Optimalisasi Sistem Pelaporan Mutu Rumah Sakit)</strong>;
            </li>
            <li>Penyederhanaan profil indikator;</li>
            <li>
              Penguatan Pencegahan dan Pengendalian Infeksi (PPI) seluruh pegawai RS yang
              berkelanjutan;
            </li>
            <li>
              Webinar, pelatihan, dan workshop yang diselenggarakan secara daring dan luring, yaitu:
              <ul className="list-disc pl-6 mt-1 space-y-1">
                <li>
                  Pertemuan internal pengumpulan data, analisis hingga validasi indikator mutu;
                </li>
                <li>
                  Workshop Pelaporan Insiden Keselamatan Pasien yang diselenggarakan oleh Direktorat
                  Mutu dan Akreditasi Pelayanan Kesehatan Kementerian Kesehatan;
                </li>
              </ul>
            </li>
            <li>
              Pelaporan indikator mutu nasional dan insiden keselamatan pasien setiap bulan serta{" "}
              <em>self assessment hospital readiness</em> ke aplikasi{" "}
              <span className="underline">http://mutufasyankes.kemkes.go.id/</span>;
            </li>
            <li>Pelaporan bulanan seluruh indikator mutu RS;</li>
            <li>Pelaksanaan dan monitoring kepatuhan serta audit penerapan PPK / CP;</li>
            <li>
              Inovasi: Membuat dan mengembangkan aplikasi <strong>OPTIMUS</strong> untuk
              pengumpulan data terintegrasi dan pelaporannya dari yang sebelumnya menggunakan google
              spreadsheet;
            </li>
            <li>Melakukan rapat feedback capaian mutu unit kerja setiap triwulan;</li>
            <li>Membuat profil manajemen risiko RS;</li>
            <li>
              Melakukan pendampingan, sosialisasi dan pemantauan manajemen risiko unit kerja;
            </li>
            <li>
              Melakukan <em>continuous quality improvement</em> di semua unit kerja.
            </li>
          </ol>
        </div>
      ),
    });

    pages.push({
      id: "page-bab4-3",
      anchors: ["sec-bab-4-2"],
      group: "BAB_4",
      content: (
        <div className="space-y-3.5 text-justify text-[12pt] leading-[1.5]">
          <h3 className="font-bold uppercase text-[12pt]">
            4.2 Hambatan dalam Pelaksanaan Tujuan
          </h3>
          <p className="indent-8">
            Tim Mutu RSUD Al-Mulk berusaha menjalankan program/kegiatan dengan baik, efektif dan
            efisien agar lancar dan tercapai tujuan. Strategi-strategi yang disusun dalam upaya
            mempertahankan mutu dan keselamatan pasien telah dilaksanakan, namun dalam
            pelaksanaannya ada beberapa hambatan yang ditemui, antara lain:
          </p>
          <div className="space-y-3 pl-2">
            <div>
              <p className="font-bold">1. Man (Sumber Daya Manusia):</p>
              <ul className="list-disc pl-8 space-y-1 mt-1">
                <li>Pelaporan indikator mutu RS belum <em>real time</em>;</li>
                <li>Implementasi aplikasi OPTIMUS belum merata di seluruh unit;</li>
                <li>
                  Pemahaman terkait mutu, budaya keselamatan dan manajemen risiko belum optimal;
                </li>
                <li>Budaya pelaporan IKP belum optimal dan kadang tidak tepat waktu;</li>
                <li>
                  Perubahan ruangan yang cepat, sehingga penempatan dan keberadaan PIC data tidak
                  sesuai lagi dengan SK yang ditetapkan;
                </li>
                <li>
                  Apabila PIC data cuti, sakit, izin, dan lain-lain tidak melapor ke atasan
                  langsung, sehingga pelaporan terlambat dan harus diingatkan.
                </li>
              </ul>
            </div>
            <div>
              <p className="font-bold">2. Method (Metode):</p>
              <ul className="list-disc pl-8 space-y-1 mt-1">
                <li>Pendampingan ke unit kerja secara daring dan luring belum optimal;</li>
                <li>Sosialisasi dan edukasi belum optimal;</li>
                <li>Metode edukasi keselamatan pasien belum optimal;</li>
                <li>Supervisi mutu dan keselamatan pasien belum optimal;</li>
                <li>Pengelolaan dan pemantauan manajemen risiko belum sepenuhnya seragam.</li>
              </ul>
            </div>
            <div>
              <p className="font-bold">3. Machines (Sarana Sistem &amp; Perangkat):</p>
              <ul className="list-disc pl-8 space-y-1 mt-1">
                <li>
                  Optimalisasi integrasi pelaporan mutu dan pelaporan IKP secara elektronik penuh
                  masih dalam tahap transisi di beberapa unit;
                </li>
                <li>Dukungan perangkat keras (<em>hardware</em>) belum sepenuhnya sesuai standar.</li>
              </ul>
            </div>
            <div>
              <p className="font-bold">4. Materials (Bahan):</p>
              <p className="pl-6 mt-0.5">-</p>
            </div>
          </div>
        </div>
      ),
    });

    pages.push({
      id: "page-bab4-4",
      anchors: ["sec-bab-4-3"],
      group: "BAB_4",
      content: (
        <div className="space-y-3.5 text-justify text-[12pt] leading-[1.5]">
          <h3 className="font-bold uppercase text-[12pt]">4.3 Upaya Tindak Lanjut</h3>
          <p className="indent-8">
            Untuk meminimalkan hambatan dalam pelaksanaan strategi dilakukan beberapa upaya antara
            lain adalah:
          </p>
          <div className="space-y-3 pl-2">
            <div>
              <p className="font-bold">1. Man (Sumber Daya Manusia):</p>
              <ul className="list-disc pl-8 space-y-1 mt-1">
                <li>Optimalisasi dan pengembangan aplikasi OPTIMUS secara <em>real time</em>;</li>
                <li>
                  Sosialisasi dan edukasi tentang mutu, keselamatan pasien, budaya keselamatan dan
                  manajemen risiko secara berkala;
                </li>
                <li>Pelatihan / workshop manajemen risiko sesuai PMK Nomor 25 Tahun 2019;</li>
                <li>
                  Optimalisasi pendampingan dan monev sesuai dengan pembagian area yang ada;
                </li>
                <li>Meningkatkan kesadaran pentingnya pelaporan IKP tepat waktu;</li>
                <li>
                  Terkait PIC data, Kepala ruangan diminta untuk menunjuk petugas baru untuk menjadi
                  PIC data pengganti sehingga monev di ruangan tetap dapat dilaksanakan;
                </li>
                <li>
                  Peningkatan kompetensi Tim Mutu dalam rangka optimalisasi capaian program melalui
                  seminar, workshop, pelatihan, dan lainnya;
                </li>
                <li>Mendorong penelitian di bidang mutu dan keselamatan pasien.</li>
              </ul>
            </div>
            <div>
              <p className="font-bold">2. Method (Metode):</p>
              <ul className="list-disc pl-8 space-y-1 mt-1">
                <li>Pendampingan dan supervisi unit kerja terkait pelaporan IKP;</li>
                <li>Pendampingan mutu ke unit kerja secara daring dan luring;</li>
                <li>
                  Modifikasi kegiatan sosialisasi dan edukasi melalui media cetak, elektronik, maupun
                  daring;
                </li>
                <li>Supervisi mutu dan keselamatan pasien dijadwalkan setiap bulan;</li>
                <li>
                  Pengelolaan dan pemantauan manajemen risiko dilaksanakan setiap bulan oleh Tim
                  Manajemen Risiko sesuai pembagian areanya;
                </li>
                <li>
                  Optimalisasi pelaksanaan budaya mutu dan keselamatan pasien di seluruh unit kerja
                  RS.
                </li>
              </ul>
            </div>
            <div>
              <p className="font-bold">3. Machines (Sarana Sistem &amp; Perangkat):</p>
              <ul className="list-disc pl-8 space-y-1 mt-1">
                <li>
                  Implementasi aplikasi OPTIMUS untuk mutu dan keselamatan pasien dan dilakukan
                  evaluasi tiap bulan;
                </li>
                <li>Usulan pengadaan <em>hardware</em> untuk seluruh unit kerja;</li>
                <li>Pengembangan berkelanjutan fitur pelaporan &amp; analitik aplikasi OPTIMUS.</li>
              </ul>
            </div>
            <div>
              <p className="font-bold">4. Materials (Bahan):</p>
              <ul className="list-disc pl-8 space-y-1 mt-1">
                <li>Optimalisasi layanan RS sesuai standar;</li>
                <li>
                  Menyusun standar sarana, prasarana dan alat kesehatan sebagai pedoman dalam
                  pemenuhan kebutuhan unit kerja.
                </li>
              </ul>
            </div>
          </div>
        </div>
      ),
    });

    // -----------------------------------------------------------------------
    // BAB V: HASIL KERJA
    // 5.1 Realisasi Program Mutu (2 Individual F4 Pages — Hal. 17, 18)
    // -----------------------------------------------------------------------
    pages.push({
      id: "page-bab5-1a",
      anchors: ["sec-bab-5", "sec-bab-5-1", "tbl-5-1"],
      group: "BAB_5_INM",
      content: (
        <div>
          <ChapterHeader bab="BAB V" title="HASIL KERJA" />
          <div className="space-y-2.5 text-justify text-[12pt] leading-[1.5]">
            <p className="indent-8">
              Strategi pencapaian tujuan dan sasaran merupakan penjabaran operasional kebijakan dan
              program sebagai upaya pencapaian target (sasaran kerja) Tim Mutu RSUD Al-Mulk.
              Pengukuran kinerja dilakukan untuk membandingkan kinerja yang dicapai dengan standar,
              rencana atau target menggunakan indikator yang telah ditetapkan. Pengukuran kinerja
              diperlukan untuk mengetahui sejauh mana keberhasilan dan kegagalan dari sasaran dengan
              alat ukur berupa indikator-indikator.
            </p>
            <p className="indent-8">
              Berdasarkan pengukuran kinerja tersebut diperoleh informasi mengenai kondisi, kendala
              dan permasalahan, upaya yang sudah dilakukan dan rencana tindak lanjut untuk upaya
              pencapaian program di masa yang akan datang. Adapun hasil pengukuran kinerja{" "}
              <strong>{period.shortPeriodTitle}</strong> ({period.rangeLabel}) adalah sebagai
              berikut:
            </p>
            <h3 className="font-bold uppercase text-[12pt] pt-1">5.1 Realisasi Program Mutu</h3>
            <p>
              Realisasi program peningkatan mutu {period.shortPeriodTitle} adalah sebagai berikut:
            </p>
            <p className="text-center font-bold text-[11.5pt] pt-1">
              Tabel 5.1 Realisasi Program Peningkatan Mutu {period.shortPeriodTitle}
              <br />
              RSUD Al-Mulk Kota Sukabumi
            </p>
            <table className="w-full border-collapse border border-slate-900 text-[10.5pt] leading-[1.35]">
              <thead>
                <tr className="bg-slate-100 font-bold text-center">
                  <th className="border border-slate-900 px-2 py-1.5 w-9">NO</th>
                  <th className="border border-slate-900 px-2.5 py-1.5 w-[38%]">PROGRAM</th>
                  <th className="border border-slate-900 px-2.5 py-1.5">REALISASI</th>
                </tr>
              </thead>
              <tbody>
                {programMutuRows.slice(0, 7).map(([prog, real], idx) => (
                  <tr key={idx}>
                    <td className="border border-slate-900 px-2 py-1.5 text-center align-top">
                      {idx + 1}
                    </td>
                    <td className="border border-slate-900 px-2.5 py-1.5 align-top font-semibold text-left">
                      {prog}
                    </td>
                    <td className="border border-slate-900 px-2.5 py-1.5 align-top text-left">
                      {real}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ),
    });

    pages.push({
      id: "page-bab5-1b",
      group: "BAB_5_INM",
      content: (
        <div className="space-y-3 text-justify text-[12pt] leading-[1.5]">
          <p className="text-center font-bold text-[11.5pt]">
            Tabel 5.1 (Lanjutan) Realisasi Program Peningkatan Mutu {period.shortPeriodTitle}
          </p>
          <table className="w-full border-collapse border border-slate-900 text-[10.5pt] leading-[1.35]">
            <thead>
              <tr className="bg-slate-100 font-bold text-center">
                <th className="border border-slate-900 px-2 py-1.5 w-9">NO</th>
                <th className="border border-slate-900 px-2.5 py-1.5 w-[38%]">PROGRAM</th>
                <th className="border border-slate-900 px-2.5 py-1.5">REALISASI</th>
              </tr>
            </thead>
            <tbody>
              {programMutuRows.slice(7).map(([prog, real], idx) => (
                <tr key={idx + 7}>
                  <td className="border border-slate-900 px-2 py-1.5 text-center align-top">
                    {idx + 8}
                  </td>
                  <td className="border border-slate-900 px-2.5 py-1.5 align-top font-semibold text-left">
                    {prog}
                  </td>
                  <td className="border border-slate-900 px-2.5 py-1.5 align-top text-left">
                    {real}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ),
    });

    // -----------------------------------------------------------------------
    // 5.2 Realisasi Indikator Pelayanan Rawat Inap RS (1 Individual F4 Page — Hal. 19)
    // -----------------------------------------------------------------------
    pages.push({
      id: "page-bab5-2",
      anchors: ["sec-bab-5-2", "tbl-5-2"],
      group: "BAB_5_INM",
      content: (
        <div className="space-y-3.5 text-justify text-[12pt] leading-[1.5]">
          <div className="flex items-center justify-between gap-2 border-b-2 border-slate-900 pb-1.5">
            <h3 className="font-bold uppercase text-[12pt]">
              5.2 Realisasi Indikator Pelayanan Rawat Inap Rumah Sakit
            </h3>
            <button
              type="button"
              onClick={() => {
                setRanapDraft(model.rawatInapStats);
                setEditingRanap(!editingRanap);
              }}
              className="print:hidden font-sans inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10.5px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 cursor-pointer shrink-0"
            >
              <Edit3 size={11} />
              <span>{editingRanap ? "Tutup Edit" : "Edit BOR/AVLOS/TOI"}</span>
            </button>
          </div>

          <p className="text-center font-bold text-[11.5pt]">
            Tabel 5.2 Indikator Pelayanan Rawat Inap Rumah Sakit ({period.shortPeriodTitle})
          </p>
          <table className="w-full border-collapse border border-slate-900 text-[10.5pt] leading-[1.35]">
            <thead>
              <tr className="bg-slate-100 font-bold text-center">
                <th className="border border-slate-900 px-2 py-2 w-10">NO</th>
                <th className="border border-slate-900 px-3 py-2 text-left">INDIKATOR</th>
                <th className="border border-slate-900 px-3 py-2 w-28">STANDAR</th>
                <th className="border border-slate-900 px-3 py-2 w-36">
                  CAPAIAN {period.shortPeriodTitle.toUpperCase()}
                </th>
              </tr>
            </thead>
            <tbody>
              {(editingRanap ? ranapDraft : model.rawatInapStats).map((r, idx) => (
                <tr key={r.key}>
                  <td className="border border-slate-900 px-2 py-2 text-center">{r.no}</td>
                  <td className="border border-slate-900 px-3 py-2 text-left">{r.indikator}</td>
                  <td className="border border-slate-900 px-3 py-2 text-center">{r.standar}</td>
                  <td className="border border-slate-900 px-3 py-2 text-center font-semibold">
                    {editingRanap ? (
                      <div className="flex items-center gap-1 justify-center font-sans">
                        <input
                          type="text"
                          value={r.capaian}
                          onChange={(e) => {
                            const next = [...ranapDraft];
                            next[idx] = { ...next[idx], capaian: e.target.value };
                            setRanapDraft(next);
                          }}
                          className="w-20 px-1.5 py-0.5 text-xs border border-slate-300 rounded text-center"
                        />
                        <label className="text-[10px] flex items-center gap-0.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={r.tercapai}
                            onChange={(e) => {
                              const next = [...ranapDraft];
                              next[idx] = { ...next[idx], tercapai: e.target.checked };
                              setRanapDraft(next);
                            }}
                          />
                          <span>OK</span>
                        </label>
                      </div>
                    ) : (
                      r.capaian
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {editingRanap && (
            <div className="flex justify-end print:hidden font-sans">
              <button
                type="button"
                onClick={handleSaveRanap}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
              >
                <Check size={13} /> Simpan Indikator Rawat Inap
              </button>
            </div>
          )}

          <p className="indent-8 pt-1">
            Berdasarkan tabel di atas diketahui bahwa realisasi indikator pelayanan rawat inap rumah
            sakit adalah sebesar <strong>{fmtPct(model.rawatInapPct)}</strong>, di mana terdapat{" "}
            <strong>{model.rawatInapMetCount} indikator</strong> yang mencapai target (
            {model.rawatInapStats
              .filter((x) => x.tercapai)
              .map((x) => x.key.toUpperCase())
              .join(", ")}
            ) dari {model.rawatInapStats.length} indikator yang diukur.
          </p>
          <p className="indent-8">
            Upaya peningkatan mutu dan efisiensi penggunaan tempat tidur rumah sakit dilakukan
            melalui beberapa langkah strategis sebagai berikut:
          </p>
          <ol className="list-decimal pl-8 space-y-1">
            <li>Peningkatan promosi layanan unggulan dan informasi pelayanan RSUD Al-Mulk;</li>
            <li>Pemenuhan serta pemeliharaan sarana prasarana dan alat kesehatan penunjang klinis;</li>
            <li>
              Perbaikan alur asuhan medis dan keperawatan sesuai Panduan Praktik Klinik (PPK) dan
              Clinical Pathway;
            </li>
            <li>Optimalisasi ketepatan jadwal visite DPJP dan proses pemulangan pasien;</li>
            <li>Peningkatan kecukupan serta kompetensi SDM medis, keperawatan, dan penunjang.</li>
          </ol>
        </div>
      ),
    });

    // -----------------------------------------------------------------------
    // 5.3 Realisasi INM 1 – INM 13 (13 Dedicated F4 Pages — Hal. 20..32)
    // -----------------------------------------------------------------------
    model.inmList.forEach((inm, idx) => {
      pages.push({
        id: `page-inm-${idx + 1}`,
        anchors: [
          ...(idx === 0 ? ["sec-bab-5-3"] : []),
          `tbl-inm-${idx + 1}`,
          `grafik-inm-${idx + 1}`,
        ],
        group: "BAB_5_INM",
        content: (
          <div className="space-y-2.5 text-[12pt] leading-[1.5]">
            {idx === 0 && (
              <div className="mb-2">
                <h3 className="font-bold uppercase text-[12pt] border-b-2 border-slate-900 pb-1 mb-1.5">
                  5.3 Realisasi Indikator Nasional Mutu (INM)
                </h3>
                <p className="text-justify text-[12pt]">
                  Hasil pengukuran 13 Indikator Nasional Mutu (INM) pada{" "}
                  <strong>{period.shortPeriodTitle}</strong> yang terintegrasi secara langsung
                  dengan menu Input Data aplikasi OPTIMUS adalah sebagai berikut:
                </p>
              </div>
            )}

            <div className="flex items-center justify-between gap-2">
              <h4 className="font-bold text-[12pt] text-slate-900">
                {idx + 1}. {inm.title}
              </h4>
              {onInspectIndicator && (
                <button
                  type="button"
                  onClick={() => onInspectIndicator(inm.key, inm.title, "INM")}
                  className="print:hidden font-sans inline-flex items-center gap-1 text-[10.5px] font-semibold text-emerald-700 hover:text-emerald-900 cursor-pointer shrink-0"
                >
                  <span>Rincian Input ({inm.participatingUnits.length} Unit)</span>
                  <ExternalLink size={10} />
                </button>
              )}
            </div>

            <p className="text-[11.5pt] font-bold text-slate-900">
              {inm.tableNumber} {inm.code}: {inm.title}
            </p>
            <table className="w-full border-collapse border border-slate-900 text-[10pt] leading-[1.35]">
              <tbody>
                <tr>
                  <td className="border border-slate-900 px-2 py-1 font-bold bg-slate-50 w-24">
                    Numerator
                  </td>
                  <td
                    colSpan={2 + period.monthCols.length}
                    className="border border-slate-900 px-2 py-1 text-left"
                  >
                    {inm.numeratorLabel}
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-900 px-2 py-1 font-bold bg-slate-50">
                    Denumerator
                  </td>
                  <td
                    colSpan={2 + period.monthCols.length}
                    className="border border-slate-900 px-2 py-1 text-left"
                  >
                    {inm.denominatorLabel}
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-900 px-2 py-1 font-bold bg-slate-50">
                    Target
                  </td>
                  <td
                    colSpan={2 + period.monthCols.length}
                    className="border border-slate-900 px-2 py-1 font-bold text-left"
                  >
                    {inm.targetText}
                  </td>
                </tr>
                <tr className="bg-slate-100 font-bold text-center">
                  <td className="border border-slate-900 px-1.5 py-1" />
                  <td className="border border-slate-900 px-1.5 py-1 w-14">Tahun</td>
                  <td className="border border-slate-900 px-1.5 py-1 w-20">
                    {period.avgHeaderLabel}
                  </td>
                  {period.monthCols.map((mc) => (
                    <td key={mc.monthIndex} className="border border-slate-900 px-1.5 py-1">
                      {mc.short}
                    </td>
                  ))}
                </tr>
                <tr className="text-center">
                  <td rowSpan={2} className="border border-slate-900 px-1.5 py-1 font-bold bg-slate-50">
                    Pencapaian
                  </td>
                  <td className="border border-slate-900 px-1.5 py-1 font-semibold">
                    {period.prevYear}
                  </td>
                  <td className="border border-slate-900 px-1.5 py-1 font-semibold">
                    {fmtPct(inm.prevYearAvg)}
                  </td>
                  {inm.prevYearValues.map((v, mIdx) => (
                    <td key={mIdx} className="border border-slate-900 px-1.5 py-1">
                      {v !== null ? fmtPct(v, "") : "-"}
                    </td>
                  ))}
                </tr>
                <tr className="text-center bg-emerald-50/35">
                  <td className="border border-slate-900 px-1.5 py-1 font-bold">
                    {period.currYear}
                  </td>
                  <td
                    className={`border border-slate-900 px-1.5 py-1 font-bold ${
                      inm.isMet === true
                        ? "text-emerald-800"
                        : inm.isMet === false
                          ? "text-red-700"
                          : "text-slate-600"
                    }`}
                  >
                    {fmtPct(inm.currYearAvg)}
                  </td>
                  {inm.currYearValues.map((v, mIdx) => (
                    <td key={mIdx} className="border border-slate-900 px-1.5 py-1 font-semibold">
                      {v !== null ? fmtPct(v, "") : "-"}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>

            <InmComparisonChart
              title={`${inm.chartNumber} ${inm.code}: ${inm.title} ${period.shortPeriodTitle} — UOBK RSUD Al-Mulk Kota Sukabumi`}
              prevYear={period.prevYear}
              currYear={period.currYear}
              monthCols={period.monthCols}
              prevValues={inm.prevYearValues}
              currValues={inm.currYearValues}
              targetNum={inm.targetNum}
              useBar={inm.key === "inm_13"}
            />

            <NarrativeEditorBlock
              itemKey={inm.key}
              analisa={inm.analisa}
              rekomendasi={inm.rekomendasi}
              generatingKey={generatingKey}
              onGenerateAi={onGenerateSingleAi}
              onSaveManual={onSaveManualNarrative}
            />
          </div>
        ),
      });
    });

    // -----------------------------------------------------------------------
    // 5.4 Realisasi IMP-RS (1 Dedicated F4 Page per IMP-RS indicator -> 9 pages)
    // -----------------------------------------------------------------------
    model.impRsList.forEach((imp, idx) => {
      const prevGroup = idx > 0 ? model.impRsList[idx - 1].groupTitle : "";
      const showGroupHeading = imp.groupTitle !== prevGroup;
      const isLastImp = idx === model.impRsList.length - 1;
      pages.push({
        id: `page-imprs-${idx + 1}`,
        anchors: [...(idx === 0 ? ["sec-bab-5-4"] : []), `grafik-imprs-${idx + 1}`],
        group: "BAB_5_IMP_PPI",
        content: (
          <div className="space-y-3 text-[12pt] leading-[1.5]">
            {idx === 0 && (
              <h3 className="font-bold uppercase text-[12pt] border-b-2 border-slate-900 pb-1.5 mb-2">
                5.4 Realisasi Indikator Mutu Prioritas Rumah Sakit (IMP-RS)
              </h3>
            )}
            {showGroupHeading && (
              <h4 className="font-bold uppercase text-[12pt] text-slate-900 bg-slate-100 px-3 py-1.5 border-l-4 border-emerald-700">
                {imp.groupTitle}
              </h4>
            )}
            <div>
              <p className="font-bold text-[12pt] text-slate-900">{imp.subCode}</p>
              <p className="italic text-slate-700 text-[11.5pt] mt-0.5">
                Indikator: {imp.indicatorTitle} (Standar: {imp.targetText})
              </p>
            </div>

            <table className="w-full border-collapse border border-slate-900 text-[10.5pt] leading-[1.35] text-center">
              <thead>
                <tr className="bg-slate-100 font-bold">
                  <th className="border border-slate-900 px-2 py-1.5">Standar</th>
                  {period.monthCols.map((m) => (
                    <th key={m.monthIndex} className="border border-slate-900 px-2 py-1.5">
                      {m.full}
                    </th>
                  ))}
                  <th className="border border-slate-900 px-2 py-1.5">{period.avgHeaderLabel}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-slate-900 px-2 py-1.5 font-bold">{imp.targetText}</td>
                  {imp.monthlyValues.map((v, i) => (
                    <td key={i} className="border border-slate-900 px-2 py-1.5">
                      {fmtPct(v)}
                    </td>
                  ))}
                  <td className="border border-slate-900 px-2 py-1.5 font-bold">
                    {fmtPct(imp.avgValue)}
                  </td>
                </tr>
              </tbody>
            </table>

            <SingleTargetLineChart
              title={`${imp.chartNumber} — ${imp.subCode} (${period.shortPeriodTitle})`}
              labels={period.monthCols.map((m) => m.short)}
              values={imp.monthlyValues}
              targetNum={imp.targetNum}
            />

            <NarrativeEditorBlock
              itemKey={imp.key}
              analisa={imp.analisa}
              rekomendasi={imp.rekomendasi}
              generatingKey={generatingKey}
              onGenerateAi={onGenerateSingleAi}
              onSaveManual={onSaveManualNarrative}
            />

            {isLastImp && (
              <div className="pt-3 border-t border-slate-300">
                <h4 className="font-bold uppercase text-[12pt] text-slate-900 bg-slate-100 px-3 py-1.5 border-l-4 border-emerald-700 mb-2">
                  5. INDIKATOR MANAJEMEN RISIKO
                </h4>
                <p className="text-justify indent-8">
                  Pelaksanaan <em>Failure Mode and Effect Analysis</em> (FMEA) di lingkungan UOBK
                  RSUD Al-Mulk Kota Sukabumi pada Tahun {period.currYear} difokuskan pada
                  pengendalian proses berisiko tinggi lintas unit pelayanan serta hasil kinerja
                  petugas kebersihan rumah sakit guna mencegah potensi kegagalan layanan sebelum
                  berdampak pada pasien.
                </p>
              </div>
            )}
          </div>
        ),
      });
    });

    // -----------------------------------------------------------------------
    // 5.5 Realisasi IMP-Unit (Tabel 5.16, paginated 13 rows per F4 page)
    // -----------------------------------------------------------------------
    const impUnitChunks = chunkArray(model.impUnitRows, 13);
    impUnitChunks.forEach((rowsChunk, cIdx) => {
      const isLastChunk = cIdx === impUnitChunks.length - 1;
      pages.push({
        id: `page-impunit-${cIdx + 1}`,
        anchors: cIdx === 0 ? ["sec-bab-5-5", "tbl-5-16"] : [],
        group: "BAB_5_IMP_PPI",
        content: (
          <div className="space-y-3 text-[12pt] leading-[1.5]">
            {cIdx === 0 ? (
              <>
                <h3 className="font-bold uppercase text-[12pt] border-b-2 border-slate-900 pb-1.5">
                  5.5 Realisasi Indikator Mutu Prioritas Unit (IMP-Unit)
                </h3>
                <p>
                  Hasil capaian indikator mutu prioritas unit pada{" "}
                  <strong>{period.shortPeriodTitle}</strong> adalah sebagai berikut:
                </p>
                <p className="text-center font-bold text-[11.5pt]">
                  Tabel 5.16 Indikator Mutu Prioritas Unit ({period.shortPeriodTitle})
                </p>
              </>
            ) : (
              <p className="text-center font-bold text-[11.5pt]">
                Tabel 5.16 (Lanjutan) Indikator Mutu Prioritas Unit ({period.shortPeriodTitle})
              </p>
            )}

            <table className="w-full border-collapse border border-slate-900 text-[10.5pt] leading-[1.35]">
              <thead>
                <tr className="bg-slate-100 font-bold text-center">
                  <th className="border border-slate-900 px-2 py-1.5 w-9">NO</th>
                  <th className="border border-slate-900 px-2.5 py-1.5 text-left">
                    JUDUL INDIKATOR
                  </th>
                  <th className="border border-slate-900 px-2 py-1.5 w-20">STANDAR</th>
                  <th className="border border-slate-900 px-2 py-1.5 w-24">
                    {period.avgHeaderLabel.toUpperCase()}
                  </th>
                  <th className="border border-slate-900 px-2 py-1.5 w-28">KETERANGAN</th>
                </tr>
              </thead>
              <tbody>
                {rowsChunk.map((row) => (
                  <tr key={row.id}>
                    <td className="border border-slate-900 px-2 py-1.5 text-center">{row.no}</td>
                    <td className="border border-slate-900 px-2.5 py-1.5 text-left">{row.title}</td>
                    <td className="border border-slate-900 px-2 py-1.5 text-center">
                      {row.standar}
                    </td>
                    <td className="border border-slate-900 px-2 py-1.5 text-center font-semibold">
                      {row.capaianText}
                    </td>
                    <td
                      className={`border border-slate-900 px-2 py-1.5 text-center font-semibold ${
                        row.isMet === true
                          ? "text-emerald-800"
                          : row.isMet === false
                            ? "text-red-700"
                            : "text-slate-500"
                      }`}
                    >
                      {row.keterangan}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {isLastChunk && (
              <p className="text-justify indent-8 pt-2">
                Dari total <strong>{model.impUnitRows.length} indikator</strong> mutu prioritas unit
                di UOBK RSUD Al-Mulk, pada periode ini terdapat{" "}
                <strong>{model.impUnitMetCount} indikator</strong> yang telah mencapai target
                standar, <strong>{model.impUnitUnmetCount} indikator</strong> yang belum mencapai
                target, dan{" "}
                <strong>
                  {model.impUnitRows.length - model.impUnitMetCount - model.impUnitUnmetCount}{" "}
                  indikator
                </strong>{" "}
                yang menunggu kelengkapan input periode berjalan. Bagi indikator yang belum mencapai
                standar wajib ditindaklanjuti dengan penyusunan siklus PDSA oleh masing-masing
                kepala unit kerja.
              </p>
            )}
          </div>
        ),
      });
    });

    // -----------------------------------------------------------------------
    // 5.6 Realisasi Mutu PPI (2 Dedicated F4 Pages)
    // -----------------------------------------------------------------------
    pages.push({
      id: "page-ppi-1",
      anchors: ["sec-bab-5-6", "tbl-5-17", "tbl-5-18"],
      group: "BAB_5_IMP_PPI",
      content: (
        <div className="space-y-4 text-[12pt] leading-[1.5]">
          <h3 className="font-bold uppercase text-[12pt] border-b-2 border-slate-900 pb-1.5">
            5.6 Realisasi Mutu Pencegahan dan Pengendalian Infeksi (PPI)
          </h3>
          <p className="text-justify">
            Hasil realisasi indikator mutu Pencegahan dan Pengendalian Infeksi (PPI) pada{" "}
            <strong>{period.shortPeriodTitle}</strong> adalah sebagai berikut:
          </p>

          <div>
            <p className="font-bold mb-1">1. Angka Kepatuhan Cuci Tangan (Standar ≥ 85%)</p>
            <p className="text-[11.5pt] font-bold mb-1">Tabel 5.17 Angka Kepatuhan Cuci Tangan</p>
            <table className="w-full border-collapse border border-slate-900 text-[10.5pt] leading-[1.35] text-center mb-2">
              <thead>
                <tr className="bg-slate-100 font-bold">
                  <th rowSpan={2} className="border border-slate-900 px-2.5 py-1 text-left">
                    Uraian
                  </th>
                  <th
                    colSpan={2 + period.monthCols.length}
                    className="border border-slate-900 px-2 py-1"
                  >
                    Realisasi (%)
                  </th>
                  <th rowSpan={2} className="border border-slate-900 px-2 py-1">
                    {period.avgHeaderLabel}
                  </th>
                </tr>
                <tr className="bg-slate-100 font-bold">
                  <th className="border border-slate-900 px-1.5 py-1">Standar</th>
                  <th className="border border-slate-900 px-1.5 py-1">
                    {period.prevPeriodShortLabel}
                  </th>
                  {period.monthCols.map((m) => (
                    <th key={m.monthIndex} className="border border-slate-900 px-1.5 py-1">
                      {m.short}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-slate-900 px-2.5 py-1.5 text-left font-semibold">
                    Kepatuhan cuci tangan keseluruhan
                  </td>
                  <td className="border border-slate-900 px-1.5 py-1.5">85%</td>
                  <td className="border border-slate-900 px-1.5 py-1.5">
                    {fmtPct(model.ppiData.hhPrevAvg)}
                  </td>
                  {model.ppiData.hhMonthly.map((v, i) => (
                    <td key={i} className="border border-slate-900 px-1.5 py-1.5">
                      {fmtPct(v)}
                    </td>
                  ))}
                  <td className="border border-slate-900 px-1.5 py-1.5 font-bold">
                    {fmtPct(model.ppiData.hhCurrAvg)}
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-900 px-2.5 py-1.5 text-left">
                    Kepatuhan cuci tangan Dokter / DPJP
                  </td>
                  <td className="border border-slate-900 px-1.5 py-1.5">85%</td>
                  <td className="border border-slate-900 px-1.5 py-1.5">-</td>
                  {model.ppiData.hhDokterMonthly.map((v, i) => (
                    <td key={i} className="border border-slate-900 px-1.5 py-1.5">
                      {fmtPct(v)}
                    </td>
                  ))}
                  <td className="border border-slate-900 px-1.5 py-1.5 font-bold">
                    {fmtPct(model.ppiData.hhDokterAvg)}
                  </td>
                </tr>
              </tbody>
            </table>
            <p className="text-justify mb-1.5">{model.ppiData.hhAnalisa}</p>
            <p className="font-bold">Rencana tindak lanjut:</p>
            <ol className="list-decimal pl-6 space-y-0.5 text-[12pt]">
              <li>
                Edukasi dan motivasi staf tentang pentingnya Hand Hygiene berdasarkan 5 moment;
              </li>
              <li>Sosialisasi cuci tangan di unit pelayanan klinis maupun penunjang;</li>
              <li>
                Mengevaluasi kebutuhan sarana prasarana cuci tangan dan audit berkala oleh IPCN.
              </li>
            </ol>
          </div>

          <div className="pt-2">
            <p className="font-bold mb-1">
              2. Angka Kepatuhan Penggunaan Alat Pelindung Diri (APD)
            </p>
            <p className="text-[11.5pt] font-bold mb-1">
              Tabel 5.18 Angka Kepatuhan Penggunaan Alat Pelindung Diri
            </p>
            <table className="w-full border-collapse border border-slate-900 text-[10.5pt] leading-[1.35] text-center mb-2">
              <thead>
                <tr className="bg-slate-100 font-bold">
                  <th className="border border-slate-900 px-2.5 py-1.5 text-left">
                    Penggunaan APD
                  </th>
                  <th className="border border-slate-900 px-1.5 py-1.5">Standar</th>
                  <th className="border border-slate-900 px-1.5 py-1.5">
                    {period.prevPeriodShortLabel}
                  </th>
                  {period.monthCols.map((m) => (
                    <th key={m.monthIndex} className="border border-slate-900 px-1.5 py-1.5">
                      {m.short}
                    </th>
                  ))}
                  <th className="border border-slate-900 px-1.5 py-1.5">
                    {period.avgHeaderLabel}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-slate-900 px-2.5 py-1.5 text-left font-semibold">
                    Capaian
                  </td>
                  <td className="border border-slate-900 px-1.5 py-1.5">100%</td>
                  <td className="border border-slate-900 px-1.5 py-1.5">
                    {fmtPct(model.ppiData.apdPrevAvg)}
                  </td>
                  {model.ppiData.apdMonthly.map((v, i) => (
                    <td key={i} className="border border-slate-900 px-1.5 py-1.5">
                      {fmtPct(v)}
                    </td>
                  ))}
                  <td className="border border-slate-900 px-1.5 py-1.5 font-bold">
                    {fmtPct(model.ppiData.apdCurrAvg)}
                  </td>
                </tr>
              </tbody>
            </table>
            <p className="text-justify">{model.ppiData.apdAnalisa}</p>
          </div>
        </div>
      ),
    });

    pages.push({
      id: "page-ppi-2",
      anchors: ["tbl-5-19"],
      group: "BAB_5_IMP_PPI",
      content: (
        <div className="space-y-4 text-[12pt] leading-[1.5]">
          <div>
            <p className="font-bold mb-1">3. Monitoring Kepatuhan Pengelolaan Benda Tajam</p>
            <p className="text-justify indent-8">
              Monitoring kepatuhan pemilahan dan pembuangan limbah benda tajam pada{" "}
              <em>safety box</em> dilaksanakan secara rutin di seluruh unit tindakan (IGD, Rawat
              Inap, IBS, Laboratorium, dan Rawat Jalan) disertai edukasi larangan{" "}
              <em>recapping</em> jarum suntik dan penggantian <em>safety box</em> sebelum melebihi
              kapasitas ¾ volume.
            </p>
          </div>

          <div>
            <p className="font-bold mb-1">4. Kepatuhan PPI di Instalasi Gizi</p>
            <p className="text-justify indent-8">
              Pemantauan sanitasi pengelolaan makanan, kepatuhan higiene penjamah makanan, serta
              suhu penyimpanan bahan makanan dilaksanakan berkala setiap bulan oleh Tim PPI RSUD
              Al-Mulk Kota Sukabumi untuk menjamin keamanan pangan pasien.
            </p>
          </div>

          <div className="pt-1">
            <p className="font-bold mb-1">
              5. Angka HAIs (<em>Healthcare-Associated Infections</em>)
            </p>
            <p className="text-[11.5pt] font-bold mb-1">Tabel 5.19 Angka HAIs</p>
            <table className="w-full border-collapse border border-slate-900 text-[10.5pt] leading-[1.35] text-center mb-3">
              <thead>
                <tr className="bg-slate-100 font-bold">
                  <th className="border border-slate-900 px-2.5 py-1.5 text-left">Jenis HAIs</th>
                  <th className="border border-slate-900 px-1.5 py-1.5">Standar</th>
                  <th className="border border-slate-900 px-1.5 py-1.5">
                    {period.prevPeriodShortLabel}
                  </th>
                  {period.monthCols.map((m) => (
                    <th key={m.monthIndex} className="border border-slate-900 px-1.5 py-1.5">
                      {m.short}
                    </th>
                  ))}
                  <th className="border border-slate-900 px-1.5 py-1.5">
                    {period.avgHeaderLabel}
                  </th>
                </tr>
              </thead>
              <tbody>
                {model.ppiData.haisRows.map((h) => (
                  <tr key={h.nama}>
                    <td className="border border-slate-900 px-2.5 py-1.5 text-left font-semibold">
                      {h.nama}
                    </td>
                    <td className="border border-slate-900 px-1.5 py-1.5">{h.standar}</td>
                    <td className="border border-slate-900 px-1.5 py-1.5">{h.prevVal}</td>
                    {h.monthly.map((mv, idx) => (
                      <td key={idx} className="border border-slate-900 px-1.5 py-1.5">
                        {mv}
                      </td>
                    ))}
                    <td className="border border-slate-900 px-1.5 py-1.5 font-bold">{h.avg}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-justify mb-2">{model.ppiData.haisAnalisa}</p>
            <p className="font-bold">Rekomendasi Pengendalian Infeksi (PPI):</p>
            <ol className="list-decimal pl-6 space-y-1 text-[12pt] mt-1">
              <li>
                Mempertahankan pelaksanaan <em>bundles</em> pencegahan IDO, Phlebitis, ISK, VAP, dan
                Dekubitus pada seluruh pasien rawat inap dan tindakan invasif.
              </li>
              <li>
                Melaksanakan surveilans aktif harian oleh IPCLN di setiap ruang perawatan dan
                verifikasi bulanan oleh IPCN.
              </li>
              <li>
                Memastikan ketersediaan cairan antiseptik, <em>handrub</em>, dan sarana dekontaminasi
                alat steril secara berkesinambungan.
              </li>
            </ol>
          </div>
        </div>
      ),
    });

    // -----------------------------------------------------------------------
    // 5.7 Realisasi Indikator SPM — Stacked Full-Width Layout
    // (Tabel penuh di atas, Grafik berukuran besar penuh di bawah tabel — lega untuk Triwulan & Tahunan!)
    // -----------------------------------------------------------------------
    let firstSpmSection = true;
    const seenDomains = new Set<string>();
    const domainAnchorMap: Record<string, string> = {
      "BIDANG YANMED & KEPERAWATAN": "tbl-5-20",
      "BIDANG PELAYANAN PENUNJANG": "tbl-5-21",
      "PELAYANAN ADMINISTRASI & MANAJEMEN": "tbl-5-22",
    };

    const monthCount = period.monthCols.length;
    const isExtendedPeriod = monthCount >= 4; // Semester (6 bln) atau Tahunan (12 bln)

    model.spmGroups.forEach((grp, gIdx) => {
      // Dynamic vertical height budget per F4 page (max 10 units ≈ 265mm usable content height)
      // - Tahunan/Semester: 1 charted SPM item per F4 page agar tabel 6-12 bulan & grafik besar tidak mepet
      // - Triwulan/Bulanan: maks 2 charted SPM item per F4 page (atau 1 pada halaman pembuka 5.7 / jika ada catatan)
      const isNewDomain = !seenDomains.has(grp.domainGroup);
      if (isNewDomain) seenDomains.add(grp.domainGroup);

      const slices: Array<{ items: Array<{ item: SpmIndicatorBlock; num: number }> }> = [];
      let currentSlice: Array<{ item: SpmIndicatorBlock; num: number }> = [];
      let currentWeight = firstSpmSection ? 2.5 : isNewDomain ? 1.5 : 0.8;

      grp.items.forEach((item, idx) => {
        const w = item.isAnnualOnly
          ? 1.6
          : isExtendedPeriod
            ? 8.5
            : item.inlineNote
              ? 5.2
              : 4.4;
        if (currentSlice.length > 0 && currentWeight + w > 10) {
          slices.push({ items: currentSlice });
          currentSlice = [];
          currentWeight = 0.8; // continued section heading
        }
        currentSlice.push({ item, num: idx + 1 });
        currentWeight += w;
      });
      if (currentSlice.length > 0) {
        slices.push({ items: currentSlice });
      }

      slices.forEach((slice, sIdx) => {
        const anchors: string[] = [];
        if (firstSpmSection && sIdx === 0) {
          anchors.push("sec-bab-5-7", "grafik-5-23");
        }
        if (isNewDomain && sIdx === 0 && domainAnchorMap[grp.domainGroup]) {
          anchors.push(domainAnchorMap[grp.domainGroup]);
        }

        const isVeryFirstSpmPage = firstSpmSection && sIdx === 0;
        if (isVeryFirstSpmPage) firstSpmSection = false;

        pages.push({
          id: `page-spm-${gIdx + 1}-${sIdx + 1}`,
          anchors,
          group: "BAB_5_SPM",
          content: (
            <div className="space-y-3 text-[12pt] leading-[1.5]">
              {isVeryFirstSpmPage && (
                <div className="mb-1">
                  <h3 className="font-bold uppercase text-[12pt] leading-[1.5] border-b-2 border-slate-900 pb-1 mb-1.5">
                    5.7 Realisasi Indikator Standar Pelayanan Minimal (SPM)
                  </h3>
                  <p className="text-justify text-[12pt] leading-[1.5]">
                    Realisasi pengukuran {model.spmTotalCount} indikator Standar Pelayanan Minimal
                    (SPM) Rumah Sakit (Kepmenkes No. 129/Menkes/SK/II/2008 sesuai layanan aktif RSUD
                    Al-Mulk) pada <strong>{period.shortPeriodTitle}</strong>:
                  </p>
                </div>
              )}

              {isNewDomain && sIdx === 0 && (
                <div className="bg-emerald-900 text-white px-3.5 py-1.5 font-bold text-[11pt] leading-[1.4] tracking-wide uppercase rounded-xs">
                  REALISASI INDIKATOR {grp.domainGroup}
                </div>
              )}

              <h4 className="font-bold uppercase text-[12pt] leading-[1.5] text-slate-900 border-b border-slate-600 pb-0.5">
                {gIdx + 1}. {grp.sectionTitle} {sIdx > 0 ? "(Lanjutan)" : ""}
              </h4>

              <div className="space-y-4">
                {slice.items.map(({ item, num }) => (
                  <div key={item.id} className="break-inside-avoid space-y-2">
                    <p className="font-bold text-[12pt] leading-[1.5] text-slate-900">
                      {num}) {item.title}
                    </p>
                    {item.isAnnualOnly ? (
                      <div className="border border-slate-400 bg-slate-50 px-3.5 py-2 text-[11.5pt] leading-[1.5] italic text-slate-700">
                        Data diukur per tahun (Standar: {item.standar})
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {/* Tabel Full-Width di Atas */}
                        <table className="w-full border-collapse border border-slate-900 text-[10.5pt] leading-[1.35] text-center">
                          <thead>
                            <tr className="bg-slate-100 font-bold">
                              <th className="border border-slate-900 px-3 py-1.5 text-left w-[34%]">
                                Bulan
                              </th>
                              <th className="border border-slate-900 px-2.5 py-1.5 w-[22%]">
                                Standar
                              </th>
                              <th className="border border-slate-900 px-2.5 py-1.5 w-[22%]">
                                Capaian
                              </th>
                              <th className="border border-slate-900 px-2.5 py-1.5 w-[22%]">
                                Rata-rata
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {item.monthlyRows.map((mr, mIdx) => (
                              <tr key={mIdx}>
                                <td className="border border-slate-900 px-3 py-1 text-left">
                                  {mr.bulan}
                                </td>
                                <td className="border border-slate-900 px-2.5 py-1">
                                  {mr.standar}
                                </td>
                                <td className="border border-slate-900 px-2.5 py-1 font-semibold">
                                  {mr.capaianText}
                                </td>
                                {mIdx === 0 && (
                                  <td
                                    rowSpan={item.monthlyRows.length}
                                    className={`border border-slate-900 px-2.5 py-1 font-bold align-middle ${
                                      item.isMet === true
                                        ? "text-emerald-800 bg-emerald-50/40"
                                        : item.isMet === false
                                          ? "text-red-700 bg-red-50/40"
                                          : "text-slate-600"
                                    }`}
                                  >
                                    {item.avgText}
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        {/* Grafik Ukuran Besar Full-Width di Bawah Tabel */}
                        <SingleTargetLineChart
                          size="large"
                          title={item.title}
                          labels={item.monthlyRows.map((r) => r.bulan.slice(0, 3).toUpperCase())}
                          values={item.monthlyRows.map((r) => r.capaianVal)}
                          targetNum={item.targetNum}
                        />
                      </div>
                    )}
                    {item.inlineNote && (
                      <p className="text-[11.5pt] leading-[1.5] text-justify text-red-900 bg-amber-50/70 border-l-3 border-amber-500 pl-3 py-1.5 mt-1">
                        {item.inlineNote}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ),
        });
      });
    });

    // Dedicated F4 Summary Page for 5.7 SPM
    pages.push({
      id: "page-spm-summary",
      group: "BAB_5_SPM",
      content: (
        <div className="space-y-3.5 text-justify text-[12pt] leading-[1.5]">
          <h4 className="font-bold uppercase text-[12pt] border-b-2 border-slate-900 pb-1.5">
            Rekapitulasi Evaluasi Indikator Standar Pelayanan Minimal (SPM)
          </h4>
          <p className="indent-8">
            Berdasarkan rekapitulasi pengukuran dari total{" "}
            <strong>{model.spmTotalCount} profil indikator SPM</strong> aktif di UOBK RSUD Al-Mulk
            Kota Sukabumi pada <strong>{period.shortPeriodTitle}</strong>, terdapat{" "}
            <strong>{model.spmMeasuredCount} indikator</strong> yang telah memiliki data pengukuran
            periode berjalan dengan tingkat pencapaian standar sebesar{" "}
            <strong>{fmtPct(model.spmPct)}</strong> ({model.spmMetCount} indikator mencapai
            standar).
          </p>

          {model.spmUnmetTitles.length > 0 ? (
            <div>
              <p className="font-bold mb-1">
                Indikator SPM yang terukur namun belum mencapai standar (
                {model.spmUnmetTitles.length} indikator):
              </p>
              <ol className="list-decimal pl-7 text-[12pt] space-y-0.5">
                {model.spmUnmetTitles.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ol>
            </div>
          ) : (
            <p className="italic text-slate-700">
              Seluruh indikator SPM yang telah memiliki data observasi pada periode ini memenuhi
              standar target yang ditetapkan.
            </p>
          )}

          <div className="pt-2">
            <p className="font-bold mb-1.5">
              Rekomendasi Strategi Penyelesaian Indikator SPM:
            </p>
            <ol className="list-decimal pl-7 space-y-1.5">
              <li>
                Sosialisasi pemanfaatan pendaftaran online (SI PRAJA) untuk mempercepat waktu
                pelayanan rawat jalan dan meningkatkan kepuasan pasien;
              </li>
              <li>
                Penyediaan anggaran pendidikan dan pelatihan / <em>in-house training</em>{" "}
                berkelanjutan bagi tenaga medis, keperawatan, dan penunjang;
              </li>
              <li>
                Peningkatan kenyamanan, kebersihan, dan kerapian lingkungan ruang pelayanan bagi
                masyarakat;
              </li>
              <li>
                Pemutakhiran, kalibrasi, serta pemeliharaan sarana prasarana alat kesehatan untuk
                mendukung ketepatan waktu layanan;
              </li>
              <li>
                Meningkatkan kedisiplinan PPA dan petugas unit dalam melaksanakan pelayanan serta
                pelaporan data sesuai SPO di aplikasi OPTIMUS.
              </li>
            </ol>
          </div>
        </div>
      ),
    });

    // -----------------------------------------------------------------------
    // 5.8 Evaluasi PPK / Clinical Pathway (1 Dedicated F4 Page)
    // -----------------------------------------------------------------------
    pages.push({
      id: "page-bab5-8",
      anchors: ["sec-bab-5-8", "grafik-5-26"],
      group: "BAB_5_CP_IKP",
      content: (
        <div className="space-y-3 text-[12pt] leading-[1.5]">
          <h3 className="font-bold uppercase text-[12pt] border-b-2 border-slate-900 pb-1.5">
            5.8 Evaluasi Panduan Praktik Klinik (PPK) / Clinical Pathways (CP)
          </h3>
          <p className="text-justify indent-8">
            Standarisasi asuhan klinis diukur melalui indikator kepatuhan terhadap PPK /{" "}
            <em>Clinical Pathway</em> (CP). CP mengintegrasikan PPK berbasis bukti melalui
            kolaborasi multidisiplin (dokter, keperawatan, farmasi, gizi, dan tenaga kesehatan
            lain). Audit kepatuhan PPK/CP dilaksanakan pada 5 kasus prioritas RSUD Al-Mulk Kota
            Sukabumi, yaitu:
          </p>
          <ol className="list-decimal pl-9 space-y-0.5 text-[12pt]">
            <li>Hipertensi</li>
            <li>Diabetes Mellitus Tipe 2</li>
            <li>Tuberculosis (TB)</li>
            <li>HIV / AIDS</li>
            <li>Asuhan Persalinan Normal</li>
          </ol>

          <InmComparisonChart
            title={`Grafik 5.26 Evaluasi Kepatuhan PPK / Clinical Pathway Tahun ${period.currYear} — UOBK RSUD Al-Mulk Kota Sukabumi`}
            prevYear={period.prevYear}
            currYear={period.currYear}
            monthCols={model.cpEvaluation.months12.map((s, idx) => ({
              monthIndex: idx,
              short: s,
              full: s,
              upper: s.toUpperCase(),
            }))}
            prevValues={model.cpEvaluation.prevYear12}
            currValues={model.cpEvaluation.currYear12}
            targetNum={model.cpEvaluation.standarVal}
          />

          <NarrativeEditorBlock
            itemKey="cp_5_8"
            analisa={model.cpEvaluation.analisa}
            rekomendasi={model.cpEvaluation.rekomendasi}
            generatingKey={generatingKey}
            onGenerateAi={onGenerateSingleAi}
            onSaveManual={onSaveManualNarrative}
          />
        </div>
      ),
    });

    // -----------------------------------------------------------------------
    // 5.9 Realisasi Keselamatan Pasien & IKP (5 Dedicated F4 Pages — 1 per Tabel)
    // -----------------------------------------------------------------------
    // IKP Page 1: Jenis IKP (Tabel 5.23)
    pages.push({
      id: "page-ikp-1",
      anchors: ["sec-bab-5-9", "tbl-5-23", "grafik-5-27"],
      group: "BAB_5_CP_IKP",
      content: (
        <div className="space-y-3 text-[12pt] leading-[1.5]">
          <h3 className="font-bold uppercase text-[12pt] border-b-2 border-slate-900 pb-1.5">
            5.9 Realisasi Keselamatan Pasien dan Budaya Keselamatan RS
          </h3>
          <p className="text-center font-bold text-[11.5pt] uppercase">
            Tabel 5.23 Pelaporan IKP UOBK RSUD Al-Mulk Periode {period.rangeLabel}
          </p>
          <table className="w-full border-collapse border border-slate-900 text-[10.5pt] leading-[1.35] text-center">
            <thead>
              <tr className="bg-slate-100 font-bold">
                <th className="border border-slate-900 px-2 py-1.5 w-12">NO</th>
                <th className="border border-slate-900 px-3 py-1.5 text-left">JENIS IKP</th>
                <th className="border border-slate-900 px-3 py-1.5 w-24">JUMLAH</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["KNC (Kejadian Nyaris Cedera)", model.ikp.totals.knc],
                ["KTC (Kejadian Tidak Cedera)", model.ikp.totals.ktc],
                ["KTD (Kejadian Tidak Diharapkan)", model.ikp.totals.ktd],
                ["KPC (Kondisi Potensial Cedera)", model.ikp.totals.kpc],
                ["SENTINEL", model.ikp.totals.sentinel],
              ].map(([lbl, val], idx) => (
                <tr key={idx}>
                  <td className="border border-slate-900 px-2 py-1">{idx + 1}</td>
                  <td className="border border-slate-900 px-3 py-1 text-left font-semibold">
                    {lbl}
                  </td>
                  <td className="border border-slate-900 px-3 py-1 font-bold">{val}</td>
                </tr>
              ))}
              <tr className="bg-slate-100 font-bold">
                <td colSpan={2} className="border border-slate-900 px-3 py-1">
                  JUMLAH
                </td>
                <td className="border border-slate-900 px-3 py-1">{model.ikp.totals.total}</td>
              </tr>
            </tbody>
          </table>

          <IkpPieChartBox
            title={`Grafik 5.27 Pelaporan Jenis IKP Periode ${period.rangeLabel.toUpperCase()}`}
            items={[
              { name: "KNC", value: model.ikp.totals.knc, color: "#2563eb" },
              { name: "KTC", value: model.ikp.totals.ktc, color: "#16a34a" },
              { name: "KTD", value: model.ikp.totals.ktd, color: "#eab308" },
              { name: "KPC", value: model.ikp.totals.kpc, color: "#0d9488" },
              { name: "SENTINEL", value: model.ikp.totals.sentinel, color: "#dc2626" },
            ]}
          />

          <NarrativeEditorBlock
            itemKey="ikp_5_9"
            analisa={model.ikp.analisaJenis}
            rekomendasi={model.ikp.tindakLanjutJenis}
            rekomendasiLabel="Tindak lanjut :"
            generatingKey={generatingKey}
            onGenerateAi={onGenerateSingleAi}
            onSaveManual={onSaveManualNarrative}
          />

          {(model.ikp.incidentDescriptions.knc.length > 0 ||
            model.ikp.incidentDescriptions.kpc.length > 0 ||
            model.ikp.incidentDescriptions.ktd.length > 0) && (
            <div className="border border-slate-400 p-2.5 text-[11px] space-y-1 bg-white">
              <p className="font-bold uppercase">Rincian Catatan Insiden Terlapor:</p>
              {model.ikp.incidentDescriptions.knc.length > 0 && (
                <div>
                  <p className="font-semibold">Insiden KNC:</p>
                  <ol className="list-decimal pl-5">
                    {model.ikp.incidentDescriptions.knc.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ol>
                </div>
              )}
              {model.ikp.incidentDescriptions.kpc.length > 0 && (
                <div>
                  <p className="font-semibold">Laporan KPC:</p>
                  <ol className="list-decimal pl-5">
                    {model.ikp.incidentDescriptions.kpc.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}
        </div>
      ),
    });

    // IKP Page 2: Trend IKP (Tabel 5.24)
    pages.push({
      id: "page-ikp-2",
      anchors: ["tbl-5-24"],
      group: "BAB_5_CP_IKP",
      content: (
        <div className="space-y-3.5 text-[12pt] leading-[1.5]">
          <p className="text-center font-bold text-[12pt] uppercase">
            Tabel 5.24 Trend IKP UOBK RSUD Al-Mulk Periode {period.rangeLabel}
          </p>
          <table className="w-full border-collapse border border-slate-900 text-[10.5pt] leading-[1.35] text-center">
            <thead>
              <tr className="bg-slate-100 font-bold">
                <th className="border border-slate-900 px-2 py-1.5 w-10">NO</th>
                <th className="border border-slate-900 px-3 py-1.5 text-left">JENIS IKP</th>
                {model.ikp.monthlyTrend.map((m) => (
                  <th key={m.monthUpper} className="border border-slate-900 px-2 py-1.5">
                    {m.monthUpper}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(["knc", "ktc", "ktd", "kpc", "sentinel"] as const).map((field, idx) => (
                <tr key={field}>
                  <td className="border border-slate-900 px-2 py-1.5">{idx + 1}</td>
                  <td className="border border-slate-900 px-3 py-1.5 text-left font-semibold uppercase">
                    {field}
                  </td>
                  {model.ikp.monthlyTrend.map((m) => (
                    <td key={m.monthUpper} className="border border-slate-900 px-2 py-1.5">
                      {m[field]}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="bg-slate-100 font-bold">
                <td colSpan={2} className="border border-slate-900 px-3 py-1.5">
                  JUMLAH
                </td>
                {model.ikp.monthlyTrend.map((m) => (
                  <td key={m.monthUpper} className="border border-slate-900 px-2 py-1.5">
                    {m.total}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>

          <IkpTrendLineChart
            title={`Tren Pelaporan IKP UOBK RSUD Al-Mulk (${period.rangeLabel.toUpperCase()})`}
            rows={model.ikp.monthlyTrend}
          />

          <div className="space-y-1.5 text-justify pt-1">
            <p className="font-bold">Analisa:</p>
            <p className="indent-8">{model.ikp.analisaTrend}</p>
            <p className="font-bold pt-1">Tindak Lanjut:</p>
            <ol className="list-decimal pl-6 space-y-1">
              {model.ikp.tindakLanjutTrend.map((tl, idx) => (
                <li key={idx}>{tl}</li>
              ))}
            </ol>
          </div>
        </div>
      ),
    });

    // IKP Page 3: Penyebab IKP (Tabel 5.25)
    pages.push({
      id: "page-ikp-3",
      anchors: ["tbl-5-25"],
      group: "BAB_5_CP_IKP",
      content: (
        <div className="space-y-3.5 text-[12pt] leading-[1.5]">
          <p className="text-center font-bold text-[12pt] uppercase">
            Tabel 5.25 Penyebab IKP UOBK RSUD Al-Mulk Periode {period.rangeLabel}
          </p>
          <table className="w-full border-collapse border border-slate-900 text-[10.5pt] leading-[1.35] text-center">
            <thead>
              <tr className="bg-slate-100 font-bold">
                <th className="border border-slate-900 px-2 py-1.5 w-10">NO</th>
                <th className="border border-slate-900 px-3 py-1.5 text-left">PENYEBAB</th>
                {period.monthCols.map((m) => (
                  <th key={m.monthIndex} className="border border-slate-900 px-2 py-1.5">
                    {m.upper}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {model.ikp.causes.map((c) => (
                <tr key={c.no}>
                  <td className="border border-slate-900 px-2 py-1.5">{c.no}</td>
                  <td className="border border-slate-900 px-3 py-1.5 text-left">{c.penyebab}</td>
                  {c.perMonth.map((v, i) => (
                    <td key={i} className="border border-slate-900 px-2 py-1.5">
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <IkpGroupedBarChart
            title={`Klasifikasi Penyebab IKP Periode ${period.rangeLabel.toUpperCase()}`}
            categories={model.ikp.causes.map((c) => c.penyebab)}
            monthNames={period.monthCols.map((m) => m.upper)}
            matrix={model.ikp.causes.map((c) => c.perMonth)}
          />

          <div className="space-y-1.5 text-justify pt-1">
            <p className="font-bold">Analisa:</p>
            <p className="indent-8">{model.ikp.analisaPenyebab}</p>
            <p className="font-bold pt-1">Tindak Lanjut:</p>
            <ol className="list-decimal pl-6 space-y-1">
              {model.ikp.tindakLanjutPenyebab.map((tl, idx) => (
                <li key={idx}>{tl}</li>
              ))}
            </ol>
          </div>
        </div>
      ),
    });

    // IKP Page 4: Lokasi IKP (Tabel 5.26)
    pages.push({
      id: "page-ikp-4",
      anchors: ["tbl-5-26"],
      group: "BAB_5_CP_IKP",
      content: (
        <div className="space-y-3.5 text-[12pt] leading-[1.5]">
          <p className="text-center font-bold text-[12pt] uppercase">
            Tabel 5.26 Lokasi IKP UOBK RSUD Al-Mulk Periode {period.rangeLabel}
          </p>
          <table className="w-full border-collapse border border-slate-900 text-[10.5pt] leading-[1.35] text-center">
            <thead>
              <tr className="bg-slate-100 font-bold">
                <th className="border border-slate-900 px-2 py-1.5 w-10">NO</th>
                <th className="border border-slate-900 px-3 py-1.5 text-left">LOKASI UNIT</th>
                {period.monthCols.map((m) => (
                  <th key={m.monthIndex} className="border border-slate-900 px-2 py-1.5">
                    {m.upper}
                  </th>
                ))}
                <th className="border border-slate-900 px-2 py-1.5 w-20">JUMLAH</th>
              </tr>
            </thead>
            <tbody>
              {model.ikp.locations.length === 0 ? (
                <tr>
                  <td
                    colSpan={3 + period.monthCols.length}
                    className="border border-slate-900 px-3 py-3 text-slate-500 italic"
                  >
                    Tidak ada insiden keselamatan pasien yang terlapor pada periode{" "}
                    {period.rangeLabel} (0 insiden).
                  </td>
                </tr>
              ) : (
                model.ikp.locations.map((loc) => (
                  <tr key={loc.no}>
                    <td className="border border-slate-900 px-2 py-1.5">{loc.no}</td>
                    <td className="border border-slate-900 px-3 py-1.5 text-left font-semibold">
                      {loc.lokasi}
                    </td>
                    {loc.perMonth.map((v, i) => (
                      <td key={i} className="border border-slate-900 px-2 py-1.5">
                        {v}
                      </td>
                    ))}
                    <td className="border border-slate-900 px-2 py-1.5 font-bold">{loc.total}</td>
                  </tr>
                ))
              )}
              <tr className="bg-slate-100 font-bold">
                <td colSpan={2 + period.monthCols.length} className="border border-slate-900 px-3 py-1.5">
                  TOTAL INSIDEN
                </td>
                <td className="border border-slate-900 px-2 py-1.5">{model.ikp.totals.total}</td>
              </tr>
            </tbody>
          </table>

          {model.ikp.locations.length > 0 && (
            <IkpGroupedBarChart
              title={`Distribusi Lokasi IKP Periode ${period.rangeLabel.toUpperCase()}`}
              categories={model.ikp.locations.map((l) => l.lokasi)}
              monthNames={period.monthCols.map((m) => m.upper)}
              matrix={model.ikp.locations.map((l) => l.perMonth)}
            />
          )}

          <div className="space-y-1.5 text-justify pt-1">
            <p className="font-bold">Analisa:</p>
            <p className="indent-8">{model.ikp.analisaLokasi}</p>
            <p className="font-bold pt-1">Tindak Lanjut:</p>
            <ol className="list-decimal pl-6 space-y-1">
              {model.ikp.tindakLanjutLokasi.map((tl, idx) => (
                <li key={idx}>{tl}</li>
              ))}
            </ol>
          </div>
        </div>
      ),
    });

    // IKP Page 5: Matriks Grading Risiko IKP (Tabel 5.27) & Budaya Keselamatan
    pages.push({
      id: "page-ikp-5",
      anchors: ["tbl-5-27"],
      group: "BAB_5_CP_IKP",
      content: (
        <div className="space-y-3.5 text-[12pt] leading-[1.5]">
          <p className="text-center font-bold text-[12pt] uppercase">
            Tabel 5.27 Matriks Grading Risiko IKP Periode {period.rangeLabel}
          </p>
          <table className="w-full border-collapse border border-slate-900 text-[10.5pt] leading-[1.35] text-center">
            <thead>
              <tr className="bg-slate-100 font-bold">
                <th className="border border-slate-900 px-2 py-1.5 w-12">NO</th>
                <th className="border border-slate-900 px-3 py-1.5 text-left">GRADING RISIKO</th>
                <th className="border border-slate-900 px-3 py-1.5 w-28">JUMLAH</th>
              </tr>
            </thead>
            <tbody>
              {model.ikp.gradings.map((g) => (
                <tr key={g.no}>
                  <td className="border border-slate-900 px-2 py-1.5">{g.no}</td>
                  <td className="border border-slate-900 px-3 py-1.5 text-left font-semibold">
                    {g.grading}
                  </td>
                  <td className="border border-slate-900 px-3 py-1.5 font-bold">{g.jumlah}</td>
                </tr>
              ))}
              <tr className="bg-slate-100 font-bold">
                <td colSpan={2} className="border border-slate-900 px-3 py-1.5">
                  JUMLAH
                </td>
                <td className="border border-slate-900 px-3 py-1.5">{model.ikp.totals.total}</td>
              </tr>
            </tbody>
          </table>

          <IkpPieChartBox
            title={`Persentase Matriks Grading Risiko IKP (${period.rangeLabel.toUpperCase()})`}
            items={[
              { name: "BIRU", value: model.ikp.gradings[0].jumlah, color: "#2563eb" },
              { name: "HIJAU", value: model.ikp.gradings[1].jumlah, color: "#16a34a" },
              { name: "KUNING", value: model.ikp.gradings[2].jumlah, color: "#eab308" },
              { name: "MERAH", value: model.ikp.gradings[3].jumlah, color: "#dc2626" },
            ]}
          />

          <div className="space-y-1.5 text-justify">
            <p className="font-bold">Analisa:</p>
            <p className="indent-8">{model.ikp.analisaGrading}</p>
            <p className="font-bold pt-1">Tindak Lanjut &amp; Budaya Keselamatan RS:</p>
            <ol className="list-decimal pl-6 space-y-1">
              {model.ikp.tindakLanjutGrading.map((tl, idx) => (
                <li key={idx}>{tl}</li>
              ))}
            </ol>
            {model.budayaScorePct !== null && (
              <p className="indent-8 pt-1">
                Berdasarkan hasil survei budaya keselamatan pasien RS yang terintegrasi dari menu
                Survei Budaya, rata-rata skor capaian tercatat sebesar{" "}
                <strong>{fmtPct(model.budayaScorePct)}</strong> (kategori sedang — memerlukan
                penguatan sistem pelaporan terbuka tanpa menyalahkan / <em>no-blame culture</em>).
              </p>
            )}
          </div>
        </div>
      ),
    });

    // -----------------------------------------------------------------------
    // 6.0 Manajemen Risiko Rumah Sakit — 1 Dedicated F4 Page per Unit (chunked at 11 rows)
    // -----------------------------------------------------------------------
    model.riskGroups.forEach((grp, gIdx) => {
      const rowChunks = chunkArray(grp.rows, 11);
      rowChunks.forEach((chunk, cIdx) => {
        pages.push({
          id: `page-risk-${gIdx + 1}-${cIdx + 1}`,
          anchors: gIdx === 0 && cIdx === 0 ? ["sec-bab-6-0"] : [],
          group: "BAB_5_RISIKO",
          content: (
            <div className="space-y-2.5 text-[10pt] leading-[1.4]">
              {gIdx === 0 && cIdx === 0 && (
                <div className="mb-1">
                  <h3 className="font-bold uppercase text-[12pt] border-b-2 border-slate-900 pb-1">
                    6.0 Manajemen Risiko Rumah Sakit
                  </h3>
                  <p className="font-bold text-center text-[11.5px] uppercase mt-2">
                    Daftar Risiko Rumah Sakit dan Rencana Penanganan RSUD Al-Mulk Kota Sukabumi
                  </p>
                </div>
              )}

              <p className="font-bold text-[11px] uppercase bg-slate-100 px-2.5 py-1 border-l-4 border-slate-900">
                Unit ({gIdx + 1}/{model.riskGroups.length}): {grp.unitTitle}
                {cIdx > 0 ? " (Lanjutan)" : ""}
              </p>

              <table className="w-full border-collapse border border-slate-900 text-[8.5pt] leading-[1.3]">
                <thead>
                  <tr className="bg-slate-100 font-bold text-center">
                    <th rowSpan={2} className="border border-slate-900 px-1 py-1 w-6">
                      NO
                    </th>
                    <th rowSpan={2} className="border border-slate-900 px-1.5 py-1 text-left w-[19%]">
                      RISIKO YANG MUNGKIN TERJADI
                    </th>
                    <th rowSpan={2} className="border border-slate-900 px-1.5 py-1 text-left w-[18%]">
                      PENYEBAB TERJADINYA
                    </th>
                    <th colSpan={3} className="border border-slate-900 px-1 py-0.5">
                      IDENTIFIKASI
                    </th>
                    <th rowSpan={2} className="border border-slate-900 px-1 py-1 w-14">
                      GRADING
                    </th>
                    <th rowSpan={2} className="border border-slate-900 px-1 py-1 w-10">
                      RANK
                    </th>
                    <th rowSpan={2} className="border border-slate-900 px-1.5 py-1 text-left">
                      PENGELOLAAN RISIKO (Pencegahan - Mitigasi)
                    </th>
                    <th rowSpan={2} className="border border-slate-900 px-1.5 py-1 w-20">
                      PIC
                    </th>
                  </tr>
                  <tr className="bg-slate-100 font-bold text-center">
                    <th className="border border-slate-900 px-1 py-0.5 w-6">S</th>
                    <th className="border border-slate-900 px-1 py-0.5 w-6">P</th>
                    <th className="border border-slate-900 px-1 py-0.5 w-8">SxP</th>
                  </tr>
                </thead>
                <tbody>
                  {chunk.map((r) => (
                    <tr key={`${grp.unitTitle}-${r.no}-${r.risiko}`}>
                      <td className="border border-slate-900 px-1 py-1 text-center align-top">
                        {r.no}
                      </td>
                      <td className="border border-slate-900 px-1.5 py-1 font-semibold align-top">
                        {r.risiko}
                        {r.isLiveDb && (
                          <span className="ml-1 inline-block px-1 bg-emerald-100 text-emerald-800 text-[8.5px] rounded font-sans print:hidden">
                            Input Baru
                          </span>
                        )}
                      </td>
                      <td className="border border-slate-900 px-1.5 py-1 align-top">
                        {r.penyebab}
                      </td>
                      <td className="border border-slate-900 px-1 py-1 text-center align-top">
                        {r.severity}
                      </td>
                      <td className="border border-slate-900 px-1 py-1 text-center align-top">
                        {r.probability}
                      </td>
                      <td className="border border-slate-900 px-1 py-1 text-center font-bold align-top">
                        {r.score}
                      </td>
                      <td
                        className={`border border-slate-900 px-1 py-1 text-center align-middle ${gradingBgColor(
                          r.grading,
                        )}`}
                      >
                        {r.grading}
                      </td>
                      <td className="border border-slate-900 px-1 py-1 text-center align-top">
                        {r.peringkat}
                      </td>
                      <td className="border border-slate-900 px-1.5 py-1 align-top">
                        {r.pengelolaan}
                      </td>
                      <td className="border border-slate-900 px-1.5 py-1 align-top">{r.pic}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ),
        });
      });
    });

    // Prioritas Risiko Setiap Unit (2 Dedicated F4 Pages — 13 rows each)
    const priorityChunks = chunkArray(model.priorityRisks, 13);
    priorityChunks.forEach((pChunk, pIdx) => {
      pages.push({
        id: `page-risk-priority-${pIdx + 1}`,
        anchors: pIdx === 0 ? ["sec-bab-6-0-prioritas"] : [],
        group: "BAB_5_RISIKO",
        content: (
          <div className="space-y-2.5 text-[10pt] leading-[1.4]">
            <p className="font-bold text-center text-[11.5px] uppercase border-b-2 border-slate-900 pb-1.5">
              Prioritas Risiko Setiap Unit dan Pemantauan Pelaksanaan Rencana Penanganan RSUD
              Al-Mulk {pIdx > 0 ? "(Lanjutan)" : ""}
            </p>
            <table className="w-full border-collapse border border-slate-900 text-[8.5pt] leading-[1.3]">
              <thead>
                <tr className="bg-slate-100 font-bold text-center">
                  <th className="border border-slate-900 px-1 py-1.5 w-7">NO</th>
                  <th className="border border-slate-900 px-1.5 py-1.5 text-left w-[15%]">
                    PEMILIK RISIKO
                  </th>
                  <th className="border border-slate-900 px-1.5 py-1.5 text-left w-[18%]">
                    PRIORITAS RISIKO
                  </th>
                  <th className="border border-slate-900 px-1.5 py-1.5 text-left w-[18%]">
                    PENYEBAB TERJADINYA
                  </th>
                  <th className="border border-slate-900 px-1.5 py-1.5 text-left">
                    AKSI / PENGENDALIAN
                  </th>
                  <th className="border border-slate-900 px-1.5 py-1.5 w-[15%]">
                    STATUS PELAKSANAAN
                  </th>
                  <th className="border border-slate-900 px-1.5 py-1.5 w-[14%]">
                    PENANGGUNG JAWAB
                  </th>
                </tr>
              </thead>
              <tbody>
                {pChunk.map((pr) => (
                  <tr key={pr.no}>
                    <td className="border border-slate-900 px-1 py-1 text-center align-top">
                      {pr.no}
                    </td>
                    <td className="border border-slate-900 px-1.5 py-1 font-semibold align-top">
                      {pr.pemilik}
                    </td>
                    <td className="border border-slate-900 px-1.5 py-1 align-top">
                      {pr.prioritas}
                    </td>
                    <td className="border border-slate-900 px-1.5 py-1 align-top">{pr.penyebab}</td>
                    <td className="border border-slate-900 px-1.5 py-1 align-top">
                      {pr.pengendalian}
                    </td>
                    <td className="border border-slate-900 px-1.5 py-1 text-center align-top">
                      {pr.status}
                    </td>
                    <td className="border border-slate-900 px-1.5 py-1 align-top">{pr.pj}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ),
      });
    });

    // -----------------------------------------------------------------------
    // BAB VI: PENUTUP (3 Dedicated F4 Pages — Hal. N-2, N-1, N)
    // -----------------------------------------------------------------------
    pages.push({
      id: "page-bab6-1",
      anchors: ["sec-bab-6", "sec-bab-6-1"],
      group: "BAB_6",
      content: (
        <div>
          <ChapterHeader bab="BAB VI" title="PENUTUP" />
          <div className="space-y-3 text-justify text-[12pt] leading-[1.5]">
            <h3 className="font-bold uppercase text-[12pt]">6.1 Kesimpulan</h3>
            <p className="indent-8">
              Tim Mutu RSUD Al-Mulk Kota Sukabumi selalu berupaya melaksanakan tugas dan fungsi
              dalam upaya peningkatan mutu dan keselamatan pasien RS. Dukungan seluruh staf dan
              manajemen dalam proses pelaksanaan menjadi penyemangat Tim Mutu dalam meningkatkan
              kinerja. Keberhasilan atas pencapaian kinerja pada{" "}
              <strong>{period.shortPeriodTitle}</strong> hendaknya dapat dipertahankan dan
              ditingkatkan serta dapat menjadi parameter untuk pencapaian kinerja selanjutnya.
              Hal-hal yang menjadi kendala dan permasalahan untuk mencapai target dan rencana
              kinerja diharapkan diselesaikan melalui proses <em>continuous quality improvement</em>{" "}
              dengan cara memperbaiki, mencari solusi dan alternatif penyelesaiannya.
            </p>
            <ol className="list-decimal pl-8 space-y-2">
              <li>
                Program Tim Mutu sebagian besar sudah terlaksana. Peran aktif dari 3 (tiga) tim
                yaitu Tim Peningkatan Mutu, Tim Keselamatan Pasien, dan Tim Manajemen Risiko
                memberikan sumbangan untuk tercapainya program;
              </li>
              <li>
                Kesadaran pegawai terhadap mutu sudah meningkat. Pemahaman tentang mutu, keselamatan
                pasien, budaya keselamatan dan manajemen risiko masih perlu dioptimalkan melalui
                sosialisasi berkala dan pendampingan secara berkelanjutan oleh masing-masing tim;
              </li>
              <li>
                <strong>Realisasi Indikator Pelayanan Rawat Inap:</strong> Realisasi indikator
                pelayanan rawat inap pada {period.shortPeriodTitle} yaitu sebesar{" "}
                <strong>{fmtPct(model.rawatInapPct)}</strong> atau{" "}
                <strong>{model.rawatInapMetCount} indikator</strong> yang mencapai target dari{" "}
                {model.rawatInapStats.length} indikator yang ada (
                {model.rawatInapStats
                  .filter((x) => x.tercapai)
                  .map((x) => x.key.toUpperCase())
                  .join(", ")}
                );
              </li>
              <li>
                <strong>Realisasi Indikator Nasional Mutu (INM):</strong> Dari{" "}
                {model.inmList.length} indikator INM ({model.inmMeasuredCount} indikator memiliki
                data observasi pada periode ini), realisasi pencapaian target adalah sebesar{" "}
                <strong>{fmtPct(model.inmPct)}</strong> ({model.inmMetCount} indikator mencapai
                target). Indikator yang belum mencapai target perlu monev rutin untuk menyamakan
                persepsi tentang definisi operasional serta optimalisasi pelaporan online melalui
                aplikasi OPTIMUS;
              </li>
              <li>
                <strong>Realisasi Indikator Mutu Prioritas RS (IMP-RS):</strong> Realisasi capaian
                IMP-RS adalah sebesar <strong>{fmtPct(model.impRsPct)}</strong> (
                {model.impRsMetCount} indikator tercapai dari {model.impRsMeasuredCount} indikator
                terukur pada {model.impRsList.length} indikator IMP-RS);
              </li>
              <li>
                <strong>Realisasi Indikator SPM RS:</strong> Capaian indikator Standar Pelayanan
                Minimal (SPM) rumah sakit pada {period.shortPeriodTitle} sebesar{" "}
                <strong>{fmtPct(model.spmPct)}</strong> ({model.spmMetCount} indikator mencapai
                standar dari {model.spmMeasuredCount} indikator terukur pada total{" "}
                {model.spmTotalCount} indikator SPM aktif).
              </li>
            </ol>
          </div>
        </div>
      ),
    });

    pages.push({
      id: "page-bab6-2",
      group: "BAB_6",
      content: (
        <div className="space-y-3 text-justify text-[12pt] leading-[1.5]">
          <ol start={7} className="list-decimal pl-8 space-y-2.5">
            <li>
              <strong>Realisasi Indikator Mutu Prioritas Unit (IMP-Unit):</strong> Capaian indikator
              mutu unit rumah sakit pada {period.shortPeriodTitle} sebesar{" "}
              <strong>{fmtPct(model.impUnitPct)}</strong> ({model.impUnitMetCount} indikator
              tercapai, {model.impUnitUnmetCount} indikator belum mencapai standar dari total{" "}
              {model.impUnitRows.length} indikator mutu unit);
            </li>
            <li>
              <strong>Realisasi Keselamatan Pasien dan Budaya Keselamatan RS:</strong> Pada periode{" "}
              {period.rangeLabel} tercatat total{" "}
              <strong>{model.ikp.totals.total} laporan IKP</strong> (KPC: {model.ikp.totals.kpc},
              KNC: {model.ikp.totals.knc}, KTC: {model.ikp.totals.ktc}, KTD: {model.ikp.totals.ktd},
              Sentinel: {model.ikp.totals.sentinel}).{" "}
              {model.budayaScorePct !== null
                ? `Hasil survei budaya keselamatan pasien tercatat sebesar ${fmtPct(
                    model.budayaScorePct,
                  )} (kategori sedang), sehingga masih perlu perbaikan sistem untuk bidang aspek yang dinilai.`
                : "Peningkatan budaya keselamatan pasien terus didorong agar setiap unit aktif melaporkan insiden secara transparan dan tepat waktu."}
            </li>
            <li>
              Penerapan budaya mutu dan keselamatan pasien perlu dipandu secara konsisten oleh Tim
              Mutu dan Tim Keselamatan Pasien terutama dalam optimalisasi pelaporan insiden secara
              elektronik melalui aplikasi OPTIMUS;
            </li>
            <li>
              Hasil capaian indikator perlu digunakan secara optimal oleh setiap kepala unit sebagai
              dasar untuk memperbaiki performa unit kerja melalui siklus PDSA;
            </li>
            <li>
              Monev dan supervisi berjenjang perlu terus dioptimalkan secara terjadwal di seluruh
              unit pelayanan maupun penunjang;
            </li>
            <li>
              Audit PPK / <em>Clinical Pathway</em> (CP) perlu dilaksanakan lebih komprehensif
              dengan melibatkan seluruh Profesional Pemberi Asuhan (PPA);
            </li>
            <li>
              Pelayanan di RSUD Al-Mulk Kota Sukabumi tetap memprioritaskan mutu dan keselamatan
              pasien berdasarkan peraturan perundang-undangan yang berlaku. Laporan hasil
              identifikasi dan analisis risiko kegiatan RSUD Al-Mulk memuat hasil kegiatan yang
              berjalan, identifikasi risiko, dampak, analisis risiko, rencana penanganan serta
              status pengendalian risiko yang bertujuan mewujudkan visi dan misi RSUD Al-Mulk.
            </li>
          </ol>
        </div>
      ),
    });

    pages.push({
      id: "page-bab6-3",
      anchors: ["sec-bab-6-2"],
      group: "BAB_6",
      content: (
        <div className="space-y-4 text-justify text-[12pt] leading-[1.5]">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-bold uppercase text-[12pt]">6.2 Rekomendasi</h3>
            <button
              type="button"
              onClick={() => {
                setSigDraft(signatures);
                setEditingSig(!editingSig);
              }}
              className="print:hidden font-sans inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10.5px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 cursor-pointer"
            >
              <Edit3 size={11} />
              <span>{editingSig ? "Tutup Edit Pejabat" : "Edit Nama Penandatangan"}</span>
            </button>
          </div>

          <p>
            Pelaksanaan kegiatan dan pengawasan tetap harus dilakukan agar program dapat dicapai.
            Rekomendasi dari Laporan Tim Mutu {period.shortPeriodTitle} adalah:
          </p>
          <ol className="list-decimal pl-8 space-y-1.5">
            <li>
              Meningkatkan koordinasi dan sosialisasi untuk pelaksanaan program dan kegiatan secara
              menyeluruh dan berkesinambungan;
            </li>
            <li>
              Meningkatkan monev dan supervisi secara berjenjang dan berkala untuk melihat kegiatan
              yang dilaksanakan sudah sesuai dengan standar yang ditetapkan;
            </li>
            <li>
              <em>Feedback</em> dan pembelajaran terhadap capaian indikator mutu RS;
            </li>
            <li>
              Melaksanakan review dan revisi PPK/CP dengan melibatkan Komite Medik, Komite
              Keperawatan, dan Komite Nakes Lain;
            </li>
            <li>Melaksanakan audit medik dan audit klinik secara komprehensif;</li>
            <li>Meningkatkan implementasi budaya keselamatan.</li>
          </ol>

          {editingSig && (
            <div className="print:hidden font-sans p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700">Jabatan Pimpinan RS</label>
                <input
                  type="text"
                  value={sigDraft.direkturTitle}
                  onChange={(e) => setSigDraft({ ...sigDraft, direkturTitle: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                />
                <label className="block font-bold text-slate-700">Nama Direktur</label>
                <input
                  type="text"
                  value={sigDraft.direkturName}
                  onChange={(e) => setSigDraft({ ...sigDraft, direkturName: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700">Jabatan Pemilik / Dinkes</label>
                <input
                  type="text"
                  value={sigDraft.dinkesTitle}
                  onChange={(e) => setSigDraft({ ...sigDraft, dinkesTitle: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                />
                <label className="block font-bold text-slate-700">Nama Kepala Dinas Kesehatan</label>
                <input
                  type="text"
                  value={sigDraft.dinkesName}
                  onChange={(e) => setSigDraft({ ...sigDraft, dinkesName: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                />
              </div>
              <div className="sm:col-span-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingSig(false)}
                  className="px-3 py-1 rounded bg-slate-200 text-slate-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveSignatures}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded bg-emerald-600 text-white font-bold"
                >
                  <Check size={12} /> Simpan Pejabat
                </button>
              </div>
            </div>
          )}

          {/* Lembar Rekomendasi Pimpinan (Persis halaman penutup dokumen resmi) */}
          <div className="pt-4 space-y-5">
            <table className="w-full border-collapse border border-slate-900 text-[10.5pt] leading-[1.35]">
              <thead>
                <tr className="bg-slate-100 font-bold text-center">
                  <th className="border border-slate-900 px-3 py-1.5 w-36">Tanggal</th>
                  <th className="border border-slate-900 px-4 py-1.5">Rekomendasi</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-slate-900 px-3 py-14 align-top text-center text-slate-500">
                    .... / .... / {period.currYear}
                  </td>
                  <td className="border border-slate-900 px-6 py-3 align-bottom">
                    <div className="h-16" />
                    <div className="text-right pr-2">
                      <p className="font-bold">{signatures.direkturTitle}</p>
                      <div className="h-14" />
                      <p className="font-bold underline underline-offset-2">
                        {signatures.direkturName}
                      </p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            <table className="w-full border-collapse border border-slate-900 text-[10.5pt] leading-[1.35]">
              <thead>
                <tr className="bg-slate-100 font-bold text-center">
                  <th className="border border-slate-900 px-3 py-1.5 w-36">Tanggal</th>
                  <th className="border border-slate-900 px-4 py-1.5">Rekomendasi</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-slate-900 px-3 py-14 align-top text-center text-slate-500">
                    .... / .... / {period.currYear}
                  </td>
                  <td className="border border-slate-900 px-6 py-3 align-bottom">
                    <div className="h-16" />
                    <div className="text-right pr-2">
                      <p className="font-bold">{signatures.dinkesTitle}</p>
                      <div className="h-14" />
                      <p className="font-bold underline underline-offset-2">
                        {signatures.dinkesName}
                      </p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ),
    });

    return pages;
  }, [
    model,
    period,
    editingRanap,
    ranapDraft,
    editingSig,
    sigDraft,
    signatures,
    generatingKey,
    onGenerateSingleAi,
    onSaveManualNarrative,
    onInspectIndicator,
  ]);

  // =========================================================================
  // AUTO-COMPUTE EXACT SINGLE PAGE NUMBERS FOR DAFTAR ISI / TABEL / GRAFIK
  // =========================================================================
  const { anchorPageMap, anchorDomIdMap } = useMemo(() => {
    const pageMap: Record<string, number> = {};
    const domMap: Record<string, string> = {};
    bodyPages.forEach((p, idx) => {
      const pageNum = idx + 1;
      domMap[p.id] = p.id;
      (p.anchors || []).forEach((a) => {
        if (pageMap[a] === undefined) {
          pageMap[a] = pageNum;
          domMap[a] = p.id;
        }
      });
    });
    return { anchorPageMap: pageMap, anchorDomIdMap: domMap };
  }, [bodyPages]);

  const pgOf = (anchor: string) => String(anchorPageMap[anchor] ?? "-");

  const jumpToAnchor = (anchor: string) => {
    const domId = anchorDomIdMap[anchor] || anchor;
    if (chapterFilter !== "ALL" && onRequestChapter) {
      onRequestChapter("ALL");
      setTimeout(() => {
        document.getElementById(domId)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 140);
    } else {
      document.getElementById(domId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleJumpToPageNumber = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = jumpPageInput.trim().toLowerCase();
    if (!raw) return;
    if (["i", "ii", "iii", "iv"].includes(raw)) {
      const mapRoman: Record<string, string> = {
        i: "sec-kata-pengantar",
        ii: "sec-daftar-isi",
        iii: "sec-daftar-tabel",
        iv: "sec-daftar-grafik",
      };
      jumpToAnchor(mapRoman[raw]);
      return;
    }
    const num = parseInt(raw, 10);
    if (!Number.isNaN(num) && num >= 1 && num <= bodyPages.length) {
      const targetPage = bodyPages[num - 1];
      jumpToAnchor(targetPage.id);
    }
  };

  const showFront = chapterFilter === "ALL" || chapterFilter === "COVER_FRONT";
  const visibleBodyPages = useMemo(
    () =>
      bodyPages
        .map((p, idx) => ({ page: p, pageNum: idx + 1 }))
        .filter(({ page }) => chapterFilter === "ALL" || page.group === chapterFilter),
    [bodyPages, chapterFilter],
  );

  const totalBookPages = 5 + bodyPages.length; // Cover + i..iv + 1..N

  return (
    <div className="official-mutu-desk bg-slate-200/75 print:bg-white rounded-3xl print:rounded-none py-5 px-2 sm:px-5 print:p-0 border border-slate-300/70 print:border-0">
      {/* Non-printing Page Specification & Quick Page Jump Bar */}
      <div className="no-print max-w-[215mm] mx-auto mb-4 px-4 py-2.5 bg-white/95 backdrop-blur-xs rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 font-sans text-xs">
        <div className="flex items-center gap-2 text-slate-700 font-semibold">
          <FileText size={15} className="text-emerald-700 shrink-0" />
          <span>
            Format Resmi: <strong className="text-slate-900">Kertas F4 (21,5 × 33 cm)</strong> •
            Margin <strong className="text-slate-900">2,5 cm</strong> •{" "}
            <strong className="text-slate-900">Arial 12pt (Spasi 1,5)</strong> •{" "}
            <strong className="text-emerald-800">{totalBookPages} Halaman</strong> (Sampul + i–iv +
            Hal. 1–{bodyPages.length})
          </span>
        </div>

        <form onSubmit={handleJumpToPageNumber} className="flex items-center gap-1.5">
          <label htmlFor="jump-f4-page" className="text-[11px] font-bold text-slate-500">
            Loncat Hal.:
          </label>
          <input
            id="jump-f4-page"
            type="text"
            placeholder={`i–iv / 1–${bodyPages.length}`}
            value={jumpPageInput}
            onChange={(e) => setJumpPageInput(e.target.value)}
            className="w-24 px-2 py-1 text-[11px] border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-center font-semibold"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold cursor-pointer"
          >
            <span>Buka</span>
            <ArrowRight size={11} />
          </button>
        </form>
      </div>

      {/* Scrollable wrapper so 215mm F4 pages render at true aspect ratio without squishing */}
      <div className="official-mutu-book overflow-x-auto print:overflow-visible pb-2 print:pb-0">
        {/* =================================================================
            FRONT MATTER (5 INDIVIDUAL F4 SHEETS: COVER, i, ii, iii, iv)
        ================================================================= */}
        {showFront && (
          <>
            {/* 1. COVER PAGE (Full-bleed F4 215mm x 330mm, no page number) */}
            <F4Page id="sec-cover" isCover>
              <div className="relative w-full h-full bg-white select-none overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/laporan/cover_rsud_almulk.png"
                  alt="Sampul Laporan Resmi UOBK RSUD Al-Mulk"
                  className="w-full h-full object-cover"
                />
                <div
                  className="absolute left-0 right-0 flex flex-col items-center justify-center text-center px-10"
                  style={{ top: "67.2%", height: "19.5%" }}
                >
                  <h1 className="font-sans font-black text-white uppercase tracking-wide text-[21px] leading-snug drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]">
                    LAPORAN TERINTEGRASI PENINGKATAN MUTU DAN KESELAMATAN PASIEN
                  </h1>
                  <p className="font-sans font-extrabold text-lime-300 uppercase tracking-wider text-[17px] mt-2 drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]">
                    {period.coverPeriodBanner}
                  </p>
                  <p className="font-sans font-bold text-white/95 uppercase tracking-[0.18em] text-[12px] mt-2">
                    UOBK RSUD AL-MULK KOTA SUKABUMI
                  </p>
                </div>
              </div>
            </F4Page>

            {/* 2. KATA PENGANTAR (Halaman i) */}
            <F4Page id="sec-kata-pengantar" pageLabel="i">
              <div>
                <ChapterHeader bab="KATA PENGANTAR" />
                <div className="space-y-4 text-justify indent-8 text-[12pt] leading-[1.5]">
                  <p>
                    Dengan menyebut nama Allah yang Maha Pengasih lagi Maha Penyayang, penulis
                    panjatkan puji syukur atas kehadirat-Nya, yang telah melimpahkan rahmat,
                    hidayah, dan inayah-Nya kepada penulis, sehingga penulis dapat menyelesaikan
                    penyusunan{" "}
                    <strong>
                      Laporan Peningkatan Mutu dan Keselamatan Pasien {period.shortPeriodTitle} di
                      UOBK RSUD Al-Mulk Kota Sukabumi
                    </strong>
                    .
                  </p>
                  <p>
                    Laporan mutu UOBK RSUD Al-Mulk Kota Sukabumi ini dibuat dimaksudkan untuk
                    memberikan informasi mengenai data kinerja dan pertanggungjawaban mengenai
                    penyelenggaraan tata kelola mutu UOBK RSUD Al-Mulk Kota Sukabumi. Laporan ini
                    juga merupakan bentuk pertanggungjawaban Tim Mutu UOBK RSUD Al-Mulk mengenai
                    pelaksanaan tugas pokok dan fungsi serta kewenangan dalam bentuk program dan
                    kegiatan dalam kurun waktu <strong>{period.rangeLabel}</strong>.
                  </p>
                  <p>
                    Ucapan terima kasih kepada semua pihak yang tidak bisa disebutkan satu persatu
                    yang telah membantu dalam pengumpulan data dan informasi sehingga laporan ini
                    bisa diselesaikan tepat pada waktunya.
                  </p>
                  <p>
                    Terlepas dari semua itu, penulis menyadari sepenuhnya bahwa penulisan laporan
                    ini masih jauh dari kesempurnaan baik dari segi susunan kalimat maupun tata
                    bahasanya. Oleh karena itu dengan tangan terbuka penulis menerima segala saran
                    dan kritik dari pembaca agar laporan ini mencapai kesempurnaan. Kami berharap
                    mendapatkan umpan balik (<em>feedback</em>) dari berbagai pihak sebagai bahan
                    evaluasi dan bersama-sama berupaya untuk melakukan{" "}
                    <em>continuous quality improvement</em> di UOBK RSUD Al-Mulk. Akhir kata penulis
                    berharap semoga laporan ini bermanfaat bagi pelayanan kesehatan di UOBK RSUD
                    Al-Mulk Kota Sukabumi.
                  </p>
                </div>
                <div className="mt-14 flex justify-end pr-8 text-[12pt]">
                  <div className="text-center">
                    <p className="font-semibold">Sukabumi, {period.currYear}</p>
                    <p className="font-bold mt-1">Tim Penyusun</p>
                    <div className="h-16" />
                    <p className="font-bold underline underline-offset-4">Tim Mutu</p>
                  </div>
                </div>
              </div>
            </F4Page>

            {/* 3. DAFTAR ISI (Halaman ii — Auto-computed Exact Single Page Numbers) */}
            <F4Page id="sec-daftar-isi" pageLabel="ii">
              <div>
                <ChapterHeader bab="DAFTAR ISI" />
                <div className="space-y-1 text-[11pt] leading-[1.42]">
                  {[
                    { label: "KATA PENGANTAR", pg: "i", target: "sec-kata-pengantar", bold: true },
                    { label: "DAFTAR ISI", pg: "ii", target: "sec-daftar-isi", bold: true },
                    { label: "DAFTAR TABEL", pg: "iii", target: "sec-daftar-tabel", bold: true },
                    { label: "DAFTAR GRAFIK", pg: "iv", target: "sec-daftar-grafik", bold: true },
                    { label: "BAB I PENDAHULUAN", pg: pgOf("sec-bab-1"), target: "sec-bab-1", bold: true },
                    { label: "1.1 Latar Belakang", pg: pgOf("sec-bab-1-1"), target: "sec-bab-1-1" },
                    { label: "1.2 Maksud dan Tujuan", pg: pgOf("sec-bab-1-2"), target: "sec-bab-1-2" },
                    { label: "1.3 Ruang Lingkup", pg: pgOf("sec-bab-1-3"), target: "sec-bab-1-3" },
                    { label: "1.4 Sistematika Penulisan", pg: pgOf("sec-bab-1-4"), target: "sec-bab-1-4" },
                    { label: "BAB II ANALISIS SITUASI AWAL TAHUN", pg: pgOf("sec-bab-2"), target: "sec-bab-2", bold: true },
                    { label: "2.1 Hambatan Tahun Lalu", pg: pgOf("sec-bab-2-1"), target: "sec-bab-2-1" },
                    { label: "2.2 Kelembagaan", pg: pgOf("sec-bab-2-2"), target: "sec-bab-2-2" },
                    { label: "2.2.1 Struktur Organisasi", pg: pgOf("sec-bab-2-2-1"), target: "sec-bab-2-2-1", indent2: true },
                    { label: "2.2.2 Tugas dan Fungsi", pg: pgOf("sec-bab-2-2-2"), target: "sec-bab-2-2-2", indent2: true },
                    { label: "2.3 Sumber Daya", pg: pgOf("sec-bab-2-3"), target: "sec-bab-2-3" },
                    { label: "2.3.1 Sumber Daya Manusia", pg: pgOf("sec-bab-2-3-1"), target: "sec-bab-2-3-1", indent2: true },
                    { label: "2.3.2 Sumber Daya Sarana dan Prasarana", pg: pgOf("sec-bab-2-3-2"), target: "sec-bab-2-3-2", indent2: true },
                    { label: "BAB III TUJUAN DAN SASARAN KERJA", pg: pgOf("sec-bab-3"), target: "sec-bab-3", bold: true },
                    { label: "3.1 Dasar Hukum", pg: pgOf("sec-bab-3-1"), target: "sec-bab-3-1" },
                    { label: "3.2 Tujuan, Sasaran dan Indikator", pg: pgOf("sec-bab-3-2"), target: "sec-bab-3-2" },
                    { label: "3.2.1 Tujuan", pg: pgOf("sec-bab-3-2-1"), target: "sec-bab-3-2-1", indent2: true },
                    { label: "3.2.2 Sasaran dan Indikator", pg: pgOf("sec-bab-3-2-2"), target: "sec-bab-3-2-2", indent2: true },
                    { label: "BAB IV STRATEGI PELAKSANAAN", pg: pgOf("sec-bab-4"), target: "sec-bab-4", bold: true },
                    { label: "4.1 Strategi Pencapaian Tujuan dan Sasaran", pg: pgOf("sec-bab-4-1"), target: "sec-bab-4-1" },
                    { label: "4.2 Hambatan dalam Pelaksanaan Tujuan", pg: pgOf("sec-bab-4-2"), target: "sec-bab-4-2" },
                    { label: "4.3 Upaya Tindak Lanjut", pg: pgOf("sec-bab-4-3"), target: "sec-bab-4-3" },
                    { label: "BAB V HASIL KERJA", pg: pgOf("sec-bab-5"), target: "sec-bab-5", bold: true },
                    { label: "5.1 Realisasi Program Mutu", pg: pgOf("sec-bab-5-1"), target: "sec-bab-5-1" },
                    { label: "5.2 Realisasi Indikator Pelayanan Rawat Inap Rumah Sakit", pg: pgOf("sec-bab-5-2"), target: "sec-bab-5-2" },
                    { label: "5.3 Realisasi Indikator Nasional Mutu (INM)", pg: pgOf("sec-bab-5-3"), target: "sec-bab-5-3" },
                    { label: "5.4 Realisasi Indikator Mutu Prioritas Rumah Sakit (IMP-RS)", pg: pgOf("sec-bab-5-4"), target: "sec-bab-5-4" },
                    { label: "5.5 Realisasi Indikator Mutu Prioritas Unit (IMP-Unit)", pg: pgOf("sec-bab-5-5"), target: "sec-bab-5-5" },
                    { label: "5.6 Realisasi Mutu Pencegahan dan Pengendalian Infeksi (PPI)", pg: pgOf("sec-bab-5-6"), target: "sec-bab-5-6" },
                    { label: "5.7 Realisasi Indikator Standar Pelayanan Minimal (SPM)", pg: pgOf("sec-bab-5-7"), target: "sec-bab-5-7" },
                    { label: "5.8 Evaluasi Panduan Praktik Klinik (PPK) / Clinical Pathway (CP)", pg: pgOf("sec-bab-5-8"), target: "sec-bab-5-8" },
                    { label: "5.9 Realisasi Keselamatan Pasien dan Budaya Keselamatan RS", pg: pgOf("sec-bab-5-9"), target: "sec-bab-5-9" },
                    { label: "6.0 Manajemen Risiko Rumah Sakit", pg: pgOf("sec-bab-6-0"), target: "sec-bab-6-0" },
                    { label: "BAB VI PENUTUP", pg: pgOf("sec-bab-6"), target: "sec-bab-6", bold: true },
                    { label: "6.1 Kesimpulan", pg: pgOf("sec-bab-6-1"), target: "sec-bab-6-1" },
                    { label: "6.2 Rekomendasi & Lembar Disposisi Pimpinan", pg: pgOf("sec-bab-6-2"), target: "sec-bab-6-2" },
                  ].map((row, idx) => (
                    <div
                      key={idx}
                      onClick={() => jumpToAnchor(row.target)}
                      className={`flex items-baseline gap-1.5 cursor-pointer hover:text-emerald-700 transition-colors ${
                        row.bold
                          ? "font-bold pt-1 text-slate-900"
                          : row.indent2
                            ? "pl-9 text-slate-700"
                            : "pl-4 text-slate-800"
                      }`}
                    >
                      <span>{row.label}</span>
                      <span className="flex-1 border-b border-dotted border-slate-400 mx-1" />
                      <span className="tabular-nums font-semibold">{row.pg}</span>
                    </div>
                  ))}
                </div>
              </div>
            </F4Page>

            {/* 4. DAFTAR TABEL (Halaman iii — Dedicated Individual F4 Sheet) */}
            <F4Page id="sec-daftar-tabel" pageLabel="iii">
              <div>
                <ChapterHeader bab="DAFTAR TABEL" />
                <div className="space-y-1.5 text-[11.5pt] leading-[1.48]">
                  {[
                    {
                      label: `Tabel 2.1 Sarana prasarana tim mutu ${period.shortPeriodTitle}`,
                      target: "tbl-2-1",
                    },
                    {
                      label: `Tabel 5.1 Realisasi Program Peningkatan Mutu ${period.shortPeriodTitle}`,
                      target: "tbl-5-1",
                    },
                    {
                      label: "Tabel 5.2 Indikator Pelayanan Rawat Inap Rumah Sakit",
                      target: "tbl-5-2",
                    },
                    ...model.inmList.map((inm, i) => ({
                      label: `${inm.tableNumber} ${inm.code}: ${inm.title}`,
                      target: `tbl-inm-${i + 1}`,
                    })),
                    {
                      label: `Tabel 5.16 Indikator Mutu Prioritas Unit (${model.impUnitRows.length} Indikator)`,
                      target: "tbl-5-16",
                    },
                    { label: "Tabel 5.17 Angka Kepatuhan Cuci Tangan", target: "tbl-5-17" },
                    {
                      label: "Tabel 5.18 Angka Kepatuhan Penggunaan Alat Pelindung Diri",
                      target: "tbl-5-18",
                    },
                    { label: "Tabel 5.19 Angka HAIs", target: "tbl-5-19" },
                    {
                      label: "Tabel 5.20 Realisasi Indikator SPM Bidang Yanmed & Keperawatan",
                      target: "tbl-5-20",
                    },
                    {
                      label: "Tabel 5.21 Realisasi Indikator SPM Bidang Pelayanan Penunjang",
                      target: "tbl-5-21",
                    },
                    {
                      label: "Tabel 5.22 Realisasi Indikator SPM Pelayanan Administrasi & Manajemen",
                      target: "tbl-5-22",
                    },
                    {
                      label: `Tabel 5.23 Pelaporan Jenis IKP Periode ${period.rangeLabel}`,
                      target: "tbl-5-23",
                    },
                    {
                      label: `Tabel 5.24 Trend IKP Periode ${period.rangeLabel}`,
                      target: "tbl-5-24",
                    },
                    {
                      label: `Tabel 5.25 Penyebab IKP Periode ${period.rangeLabel}`,
                      target: "tbl-5-25",
                    },
                    {
                      label: `Tabel 5.26 Lokasi IKP Periode ${period.rangeLabel}`,
                      target: "tbl-5-26",
                    },
                    {
                      label: `Tabel 5.27 Matriks Grading Risiko IKP Periode ${period.rangeLabel}`,
                      target: "tbl-5-27",
                    },
                  ].map((row, idx) => (
                    <div
                      key={idx}
                      onClick={() => jumpToAnchor(row.target)}
                      className="flex items-baseline gap-1.5 cursor-pointer hover:text-emerald-700 transition-colors text-slate-800"
                    >
                      <span>{row.label}</span>
                      <span className="flex-1 border-b border-dotted border-slate-400 mx-1" />
                      <span className="tabular-nums font-semibold">{pgOf(row.target)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </F4Page>

            {/* 5. DAFTAR GRAFIK (Halaman iv — Dedicated Individual F4 Sheet) */}
            <F4Page id="sec-daftar-grafik" pageLabel="iv">
              <div>
                <ChapterHeader bab="DAFTAR GRAFIK" />
                <div className="space-y-1.5 text-[11.5pt] leading-[1.48]">
                  {[
                    ...model.inmList.map((inm, i) => ({
                      label: `${inm.chartNumber} ${inm.code}: ${inm.title} ${period.shortPeriodTitle}`,
                      target: `grafik-inm-${i + 1}`,
                    })),
                    ...model.impRsList.map((imp, i) => ({
                      label: `${imp.chartNumber} ${imp.subCode}`,
                      target: `grafik-imprs-${i + 1}`,
                    })),
                    {
                      label:
                        "Grafik 5.23 – 5.25 Realisasi Indikator Standar Pelayanan Minimal (SPM)",
                      target: "grafik-5-23",
                    },
                    {
                      label: `Grafik 5.26 Evaluasi Kepatuhan PPK / Clinical Pathway ${period.shortPeriodTitle}`,
                      target: "grafik-5-26",
                    },
                    {
                      label:
                        "Grafik 5.27 Realisasi Keselamatan Pasien dan Budaya Keselamatan RS (IKP)",
                      target: "grafik-5-27",
                    },
                  ].map((row, idx) => (
                    <div
                      key={idx}
                      onClick={() => jumpToAnchor(row.target)}
                      className="flex items-baseline gap-1.5 cursor-pointer hover:text-emerald-700 transition-colors text-slate-800"
                    >
                      <span>{row.label}</span>
                      <span className="flex-1 border-b border-dotted border-slate-400 mx-1" />
                      <span className="tabular-nums font-semibold">{pgOf(row.target)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </F4Page>
          </>
        )}

        {/* =================================================================
            ALL BODY PAGES (INDIVIDUAL F4 SHEETS: 1, 2, 3, ..., N)
        ================================================================= */}
        {visibleBodyPages.map(({ page, pageNum }) => (
          <F4Page key={page.id} id={page.id} pageLabel={String(pageNum)}>
            {page.content}
          </F4Page>
        ))}
      </div>
    </div>
  );
}
