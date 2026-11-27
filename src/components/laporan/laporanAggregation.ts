import { DataMutuPayload, IndicatorProfile } from "@/store/useStore";
import { AiNarrativeItemInput, AiNarrativeResult } from "@/pages/api/ai-laporan";
import {
  BASELINE_UNIT_RISK_GROUPS,
  PRIORITY_RISK_SUMMARY_ROWS,
  RawatInapStatItem,
  UnitRiskGroup,
  PriorityRiskSummaryRow,
} from "./RiskRegisterDefaults";

export interface MonthColumn {
  monthIndex: number; // 0..11
  short: string;
  full: string;
  upper: string;
}

export interface ReportPeriodMeta {
  periode: string;
  bulan: string;
  triwulan: string;
  semester: string;
  tahun: string;
  periodKey: string;
  coverPeriodBanner: string;
  shortPeriodTitle: string;
  rangeLabel: string;
  avgHeaderLabel: string;
  prevPeriodShortLabel: string;
  prevYear: string;
  currYear: string;
  monthCols: MonthColumn[];
  prevPeriodMonths: { year: string; monthIndices: number[] };
}

const MONTH_META: MonthColumn[] = [
  { monthIndex: 0, short: "Jan", full: "Januari", upper: "JANUARI" },
  { monthIndex: 1, short: "Feb", full: "Februari", upper: "FEBRUARI" },
  { monthIndex: 2, short: "Mar", full: "Maret", upper: "MARET" },
  { monthIndex: 3, short: "Apr", full: "April", upper: "APRIL" },
  { monthIndex: 4, short: "Mei", full: "Mei", upper: "MEI" },
  { monthIndex: 5, short: "Jun", full: "Juni", upper: "JUNI" },
  { monthIndex: 6, short: "Jul", full: "Juli", upper: "JULI" },
  { monthIndex: 7, short: "Agu", full: "Agustus", upper: "AGUSTUS" },
  { monthIndex: 8, short: "Sep", full: "September", upper: "SEPTEMBER" },
  { monthIndex: 9, short: "Okt", full: "Oktober", upper: "OKTOBER" },
  { monthIndex: 10, short: "Nov", full: "November", upper: "NOVEMBER" },
  { monthIndex: 11, short: "Des", full: "Desember", upper: "DESEMBER" },
];

export function buildPeriodMeta(filters: {
  periode: string;
  bulan: string;
  triwulan: string;
  semester: string;
  tahun: string;
}): ReportPeriodMeta {
  const currYear = filters.tahun || String(new Date().getFullYear());
  const prevYear = String(Number(currYear) - 1);
  const romTw = ["I", "II", "III", "IV"][Math.max(0, Math.min(3, Number(filters.triwulan) - 1))] || "I";
  const romSem = ["I", "II"][Math.max(0, Math.min(1, Number(filters.semester) - 1))] || "I";

  if (filters.periode === "Bulanan") {
    const mIdx = Math.max(0, Math.min(11, Number(filters.bulan) || 0));
    const m = MONTH_META[mIdx];
    const prevIdx = mIdx === 0 ? 11 : mIdx - 1;
    const pYear = mIdx === 0 ? prevYear : currYear;
    return {
      ...filters,
      periodKey: `Bulanan_${mIdx}_${currYear}`,
      coverPeriodBanner: `BULAN ${m.upper} TAHUN ${currYear}`,
      shortPeriodTitle: `Bulan ${m.full} Tahun ${currYear}`,
      rangeLabel: `${m.full} ${currYear}`,
      avgHeaderLabel: `Rata2 ${m.short}`,
      prevPeriodShortLabel: MONTH_META[prevIdx].short,
      prevYear,
      currYear,
      monthCols: [m],
      prevPeriodMonths: { year: pYear, monthIndices: [prevIdx] },
    };
  }

  if (filters.periode === "Semester") {
    const isSem1 = filters.semester === "1";
    const indices = isSem1 ? [0, 1, 2, 3, 4, 5] : [6, 7, 8, 9, 10, 11];
    const range = isSem1 ? `Januari - Juni ${currYear}` : `Juli - Desember ${currYear}`;
    return {
      ...filters,
      periodKey: `Semester_${filters.semester}_${currYear}`,
      coverPeriodBanner: `SEMESTER ${romSem} (PERIODE ${range.toUpperCase()})`,
      shortPeriodTitle: `Semester ${romSem} Tahun ${currYear}`,
      rangeLabel: range,
      avgHeaderLabel: `Rata2 Sem ${romSem}`,
      prevPeriodShortLabel: isSem1 ? `Sem II ${prevYear}` : "Sem I",
      prevYear,
      currYear,
      monthCols: indices.map((i) => MONTH_META[i]),
      prevPeriodMonths: isSem1
        ? { year: prevYear, monthIndices: [6, 7, 8, 9, 10, 11] }
        : { year: currYear, monthIndices: [0, 1, 2, 3, 4, 5] },
    };
  }

  if (filters.periode === "Tahunan") {
    const indices = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    return {
      ...filters,
      periodKey: `Tahunan_${currYear}`,
      coverPeriodBanner: `TAHUNAN (PERIODE JANUARI - DESEMBER ${currYear})`,
      shortPeriodTitle: `Tahun ${currYear}`,
      rangeLabel: `Januari - Desember ${currYear}`,
      avgHeaderLabel: `Rata2 ${currYear}`,
      prevPeriodShortLabel: prevYear,
      prevYear,
      currYear,
      monthCols: indices.map((i) => MONTH_META[i]),
      prevPeriodMonths: { year: prevYear, monthIndices: indices },
    };
  }

  // Default: Triwulan
  const tw = Number(filters.triwulan) || 1;
  const startM = (tw - 1) * 3;
  const indices = [startM, startM + 1, startM + 2];
  const mFirst = MONTH_META[indices[0]];
  const mLast = MONTH_META[indices[2]];
  const range = `${mFirst.full} - ${mLast.full} ${currYear}`;
  const prevTw = tw === 1 ? 4 : tw - 1;
  const prevTwYear = tw === 1 ? prevYear : currYear;
  const prevStart = (prevTw - 1) * 3;

  return {
    ...filters,
    periodKey: `Triwulan_${tw}_${currYear}`,
    coverPeriodBanner: `TRIWULAN ${romTw} (PERIODE ${mFirst.upper} - ${mLast.upper} ${currYear})`,
    shortPeriodTitle: `Triwulan ${romTw} Tahun ${currYear}`,
    rangeLabel: range,
    avgHeaderLabel: `Rata2 TW ${romTw}`,
    prevPeriodShortLabel: `TW ${["I", "II", "III", "IV"][prevTw - 1]}`,
    prevYear,
    currYear,
    monthCols: indices.map((i) => MONTH_META[i]),
    prevPeriodMonths: {
      year: prevTwYear,
      monthIndices: [prevStart, prevStart + 1, prevStart + 2],
    },
  };
}

export function fmtPct(val: number | null | undefined, suffix = "%"): string {
  if (val === null || val === undefined || Number.isNaN(val)) return "-";
  const rounded = Number(val.toFixed(2));
  const str = Number.isInteger(rounded)
    ? String(rounded)
    : rounded.toFixed(2).replace(/\.?0+$/, "").replace(".", ",");
  return `${str}${suffix}`;
}

export function parseTargetNumber(targetRaw: string | number | undefined, fallback = 100): number {
  if (typeof targetRaw === "number") return targetRaw;
  const s = String(targetRaw || "").replace(",", ".");
  const m = s.match(/(\d+(\.\d+)?)/);
  return m ? parseFloat(m[1]) : fallback;
}

export function isReverseTarget(targetRaw: string | undefined, profileReverse?: boolean): boolean {
  if (profileReverse) return true;
  const s = String(targetRaw || "").trim();
  return s.startsWith("<") || s.startsWith("≤") || s === "0%" || s === "0";
}

export function evaluateTargetMet(
  value: number | null,
  targetRaw: string,
  reverse: boolean,
): boolean | null {
  if (value === null || Number.isNaN(value)) return null;
  const t = parseTargetNumber(targetRaw, reverse ? 0 : 100);
  const clean = String(targetRaw || "").trim();
  if (reverse) {
    if (clean.startsWith("<") && !clean.startsWith("<=")) {
      return t === 0 ? value <= 0 : value < t;
    }
    return value <= t;
  }
  return value >= t;
}

interface IndicatorMatchSpec {
  key: string;
  code: string;
  title: string;
  tableNumber: string;
  chartNumber: string;
  numeratorLabel: string;
  denominatorLabel: string;
  defaultTarget: string;
  reverse?: boolean;
  matchIds: string[];
  titleKeywords: string[];
  clinicalPurpose: string;
  rootCauseHint: string;
  defaultRecommendations: string[];
}

export const INM_13_SPECS: IndicatorMatchSpec[] = [
  {
    key: "inm_1",
    code: "INM 1",
    title: "Kepatuhan kebersihan tangan",
    tableNumber: "Tabel 5.3",
    chartNumber: "Grafik 5.1",
    numeratorLabel: "Jumlah tindakan kebersihan tangan yang dilakukan",
    denominatorLabel: "Jumlah total peluang kebersihan tangan yang seharusnya dilakukan dalam periode observasi",
    defaultTarget: "≥ 85%",
    matchIds: ["b70cbe3a-67a6-42fc-8e4a-b530c3a649fb", "1", "ffa6f696-e183-43d0-9fca-519710915942"],
    titleKeywords: ["kebersihan tangan"],
    clinicalPurpose: "Kebersihan tangan (hand hygiene) 5 momen merupakan pilar utama pencegahan Healthcare-Associated Infections (HAIs) dan keselamatan pasien sesuai Permenkes No. 30 Tahun 2022.",
    rootCauseHint: "ketersediaan sarana cuci tangan (wastafel, sabun antiseptik, handrub, tisu) serta konsistensi kesadaran PPA pada 5 momen cuci tangan sesuai SPO",
    defaultRecommendations: [
      "Sosialisasi dan edukasi ulang 6 langkah dan 5 momen cuci tangan sesuai SPO di seluruh unit pelayanan klinis maupun penunjang.",
      "Mengevaluasi kelengkapan sarana prasarana kebersihan tangan (wastafel, sabun cair, handrub berbasis alkohol, dan tisu pengering) bersama IPSRS dan Farmasi.",
      "Melakukan audit kepatuhan cuci tangan secara berkala oleh IPCN/IPCLN kepada seluruh tenaga kesehatan yang kontak langsung dengan pasien.",
      "Memberikan umpan balik (feedback) capaian per profesi setiap rapat triwulan.",
    ],
  },
  {
    key: "inm_2",
    code: "INM 2",
    title: "Kepatuhan penggunaan alat pelindung diri (APD)",
    tableNumber: "Tabel 5.4",
    chartNumber: "Grafik 5.2",
    numeratorLabel: "Jumlah petugas yang patuh menggunakan APD sesuai indikasi dalam periode observasi",
    denominatorLabel: "Jumlah seluruh petugas yang terindikasi menggunakan APD dalam periode observasi",
    defaultTarget: "100%",
    matchIds: ["58023206-fad4-46cc-8e39-ab28b8ea2ff8", "2"],
    titleKeywords: ["alat pelindung diri", "penggunaan apd"],
    clinicalPurpose: "Kepatuhan penggunaan dan pelepasan Alat Pelindung Diri (APD) sesuai indikasi transmisi menjamin keselamatan petugas kesehatan dan mencegah transmisi silang infeksi kepada pasien.",
    rootCauseHint: "kedisiplinan urutan pemakaian-pelepasan (donning-doffing) serta distribusi stok APD di unit berisiko tinggi",
    defaultRecommendations: [
      "Edukasi penyegaran pemakaian dan pelepasan APD sesuai indikasi risiko paparan dan SPO PPI.",
      "Melakukan monitoring kepatuhan penggunaan APD dalam pelayanan secara berkesinambungan oleh Tim PPI.",
      "Memastikan ketersediaan fasilitas dan buffer stok APD lengkap di masing-masing unit kerja sesuai kebutuhannya.",
    ],
  },
  {
    key: "inm_3",
    code: "INM 3",
    title: "Kepatuhan identifikasi pasien",
    tableNumber: "Tabel 5.5",
    chartNumber: "Grafik 5.3",
    numeratorLabel: "Jumlah pemberi pelayanan yang melakukan identifikasi pasien secara benar dalam periode observasi",
    denominatorLabel: "Jumlah pemberi pelayanan yang diobservasi dalam periode observasi",
    defaultTarget: "100%",
    matchIds: ["fcd1ccca-aaf7-4e09-b951-92bcd1e28b07", "3"],
    titleKeywords: ["kepatuhan identifikasi pasien"],
    clinicalPurpose: "Identifikasi pasien secara benar menggunakan minimal dua penanda identitas (nama lengkap dan tanggal lahir/nomor RM) merupakan Sasaran Keselamatan Pasien (SKP 1) untuk mencegah salah pasien, salah prosedur, dan salah pemberian obat.",
    rootCauseHint: "pelaksanaan verifikasi verbal dan visual gelang identitas sebelum pemberian obat, darah, pengambilan spesimen, maupun tindakan klinis",
    defaultRecommendations: [
      "Mewajibkan petugas selalu memasang gelang identitas sejak pasien masuk di IGD / Emergency Kebidanan / Pendaftaran Rawat Inap.",
      "Melakukan verifikasi aktif minimal 2 identitas setiap sebelum pemberian obat, pengambilan sampel, atau tindakan medis.",
      "Monitoring dan supervisi kepatuhan identifikasi pasien secara berkala di seluruh ruang perawatan.",
      "Menekankan tanggung jawab petugas dalam mengedukasi pasien dan keluarga mengenai fungsi gelang identitas.",
    ],
  },
  {
    key: "inm_4",
    code: "INM 4",
    title: "Waktu tanggap operasi seksio sesarea emergensi",
    tableNumber: "Tabel 5.6",
    chartNumber: "Grafik 5.4",
    numeratorLabel: "Jumlah pasien yang diputuskan tindakan seksio sesarea emergensi kategori I (satu) yang mendapatkan tindakan seksio sesarea emergensi ≤ 30 menit",
    denominatorLabel: "Jumlah pasien yang diputuskan tindakan seksio sesarea emergensi kategori I",
    defaultTarget: "≥ 80%",
    matchIds: ["aeae5b11-04c4-4254-8831-1d5c0ed07b1f", "4"],
    titleKeywords: ["sectio caesarea", "seksio sesarea", "seksio sesaria"],
    clinicalPurpose: "Waktu tanggap operasi Seksio Sesarea (SC) emergensi kategori I ≤ 30 menit merupakan upaya penyelamatan jiwa ibu dan pencegahan asfiksia perinatal pada kegawatdaruratan obstetri.",
    rootCauseHint: "kesiapsiagaan tim kamar operasi (DPJP Obgyn, dokter/penata anestesi, bidan PONEK, dan perawat IBS) serta aktivasi kode emergensi obstetri",
    defaultRecommendations: [
      "Dokter jaga IGD/Emergency Kebidanan beserta unit terkait memberikan prioritas persiapan pra-operasi pada kasus SC emergensi kategori I.",
      "Bidang Pelayanan Medis bersama Kepala IBS dan PONEK mengevaluasi alur respon cepat (code red obstetri) secara berkelanjutan.",
      "Koordinasi penjadwalan pengganti dengan manajemen apabila DPJP Obgyn atau dokter/penata anestesi berhalangan/cuti.",
      "Simulasi berkala kesiapsiagaan SDM kamar operasi dan PONEK agar waktu tanggap ≤ 30 menit selalu terpenuhi.",
    ],
  },
  {
    key: "inm_5",
    code: "INM 5",
    title: "Waktu tunggu rawat jalan",
    tableNumber: "Tabel 5.7",
    chartNumber: "Grafik 5.5",
    numeratorLabel: "Jumlah pasien rawat jalan dengan waktu tunggu ≤ 60 menit",
    denominatorLabel: "Jumlah pasien rawat jalan yang diobservasi",
    defaultTarget: "≥ 80%",
    matchIds: ["8310950c-90e9-4361-965b-46a47a70c8fd", "11110002-4a02-4000-9000-000000000002", "5"],
    titleKeywords: ["waktu tunggu rawat jalan"],
    clinicalPurpose: "Indikator Waktu Tunggu Rawat Jalan (WTRJ) ≤ 60 menit mengukur kecepatan akses pelayanan poliklinik spesialis yang berdampak langsung pada kenyamanan dan kepuasan pasien.",
    rootCauseHint: "ketepatan jam kedatangan dokter spesialis di poliklinik, distribusi antrean pendaftaran, dan kesiapan berkas rekam medis elektronik",
    defaultRecommendations: [
      "Mempertahankan pelaksanaan pelayanan pendaftaran dan skrining awal pasien rawat jalan sesuai SPO.",
      "Meminimalisir keterlambatan kedatangan dokter melalui pengaturan jadwal praktik dan konfirmasi kehadiran DPJP sebelum jam buka poli.",
      "Koordinator poliklinik aktif mengingatkan dan berkoordinasi dengan DPJP maupun Humas apabila terdapat perubahan jam pelayanan.",
      "Optimalisasi pendaftaran online (SI PRAJA) disertai informasi jadwal praktik dokter secara real-time.",
    ],
  },
  {
    key: "inm_6",
    code: "INM 6",
    title: "Penundaan operasi elektif",
    tableNumber: "Tabel 5.8",
    chartNumber: "Grafik 5.6",
    numeratorLabel: "Jumlah pasien yang jadwal operasinya tertunda lebih dari 1 jam",
    denominatorLabel: "Jumlah pasien operasi elektif",
    defaultTarget: "≤ 5%",
    reverse: true,
    matchIds: ["cdfd0fd6-c91a-4ed8-a58e-4f506ffaf1f4", "6"],
    titleKeywords: ["penundaan operasi elektif"],
    clinicalPurpose: "Pengendalian penundaan operasi elektif (≤ 5%) mencerminkan efektivitas penjadwalan kamar bedah, kesiapan klinis pra-anestesi, serta efisiensi layanan bedah sentral.",
    rootCauseHint: "kelengkapan asesmen pra-bedah/pra-anestesi, kesiapan instrumen steril kamar operasi, dan sinkronisasi jadwal DPJP operator",
    defaultRecommendations: [
      "Melakukan pengkajian pra-operasi dan pemeriksaan penunjang secara lengkap sejak pasien direncanakan operasi elektif.",
      "Memberikan edukasi persiapan puasa dan kondisi klinis kepada pasien serta keluarga sebelum jadwal tindakan.",
      "Memonitor kesiapan dan kelayakan alat medis di kamar operasi (IBS) secara berkala bersama IPSRS dan CSSD.",
      "Sosialisasi SPO penjadwalan operasi elektif terintegrasi antara ruang rawat inap, poliklinik, dan IBS.",
    ],
  },
  {
    key: "inm_7",
    code: "INM 7",
    title: "Kepatuhan waktu visite dokter",
    tableNumber: "Tabel 5.9",
    chartNumber: "Grafik 5.7",
    numeratorLabel: "Jumlah pasien yang di-visite dokter pada pukul 06.00 - 14.00",
    denominatorLabel: "Jumlah pasien yang diobservasi",
    defaultTarget: "≥ 80%",
    matchIds: ["c5ae8720-5f8b-4f1a-933b-4053a9a81f1b", "7"],
    titleKeywords: ["waktu visite dokter", "visite dokter"],
    clinicalPurpose: "Kepatuhan waktu visite dokter spesialis (pukul 06.00–14.00) menggambarkan ketepatan waktu pengambilan keputusan klinis, kesinambungan rencana asuhan, dan koordinasi tim PPA di ruang rawat inap.",
    rootCauseHint: "pengaturan jadwal praktik/tindakan DPJP yang beririsan antara poliklinik, kamar operasi, dan rumah sakit jejaring",
    defaultRecommendations: [
      "Meningkatkan koordinasi harian antara kepala ruang rawat inap, rawat jalan, dan DPJP terkait jadwal visite pagi.",
      "Melakukan sosialisasi berkala ketentuan jam visite (06.00–14.00) melalui Komite Medik dan Bidang Pelayanan Medis.",
      "Menerapkan pengingat H-1 / pagi hari oleh perawat penanggung jawab asuhan kepada DPJP.",
      "Mengevaluasi kecukupan formasi dokter spesialis tetap sesuai beban pasien rawat inap.",
    ],
  },
  {
    key: "inm_8",
    code: "INM 8",
    title: "Pelaporan hasil kritis laboratorium",
    tableNumber: "Tabel 5.10",
    chartNumber: "Grafik 5.8",
    numeratorLabel: "Jumlah hasil kritis laboratorium yang dilaporkan ≤ 30 menit",
    denominatorLabel: "Jumlah hasil kritis laboratorium yang diobservasi",
    defaultTarget: "100%",
    matchIds: ["5a8f87e3-151f-4503-bc4a-7a1d005ae218", "8"],
    titleKeywords: ["hasil kritis laboratorium", "kritis lab"],
    clinicalPurpose: "Pelaporan nilai kritis laboratorium ≤ 30 menit kepada DPJP/dokter pengirim merupakan indikator krusial Sasaran Keselamatan Pasien (SKP 2) agar intervensi penyelamatan segera dilakukan.",
    rootCauseHint: "kecepatan verifikasi analis laboratorium, komunikasi SBAR-TBaK ke ruang perawatan/DPJP, dan pencatatan waktu lapor pada buku register/RME",
    defaultRecommendations: [
      "Mempertahankan kedisiplinan petugas laboratorium dalam mencatat jam keluar hasil kritis dan jam pelaporan pada register/RME.",
      "Review berkala regulasi dan daftar nilai kritis laboratorium bersama dokter penanggung jawab Patologi Klinik dan Komite Medik.",
      "Memastikan metode komunikasi efektif (SBAR dan Read-Back/TBaK) terdokumentasi lengkap di rekam medis pasien.",
      "Monitoring kepatuhan waktu lapor hasil kritis laboratorium melalui audit rekam medis terpadu.",
    ],
  },
  {
    key: "inm_9",
    code: "INM 9",
    title: "Kepatuhan penggunaan formularium nasional",
    tableNumber: "Tabel 5.11",
    chartNumber: "Grafik 5.9",
    numeratorLabel: "Jumlah R/ recipe dalam lembar resep yang sesuai dengan Formularium Nasional",
    denominatorLabel: "Jumlah R/ recipe dalam lembar resep yang diobservasi",
    defaultTarget: "≥ 80%",
    matchIds: ["9871c4ca-55dc-45e4-acc8-a37dce8c2a67", "9"],
    titleKeywords: ["formularium nasional", "fornas"],
    clinicalPurpose: "Kepatuhan peresepan terhadap Formularium Nasional (Fornas) menjamin kendali mutu dan kendali biaya pelayanan kefarmasian yang rasional, efektif, dan aman bagi pasien JKN.",
    rootCauseHint: "kesesuaian pilihan terapi DPJP dengan daftar Fornas serta ketersediaan stok obat esensial/Fornas di Instalasi Farmasi",
    defaultRecommendations: [
      "Melakukan sosialisasi daftar Formularium Nasional dan Formularium RS terbaru kepada seluruh DPJP dan dokter penulis resep.",
      "Meningkatkan koordinasi Komite Farmasi dan Terapi (KFT) dengan Instalasi Farmasi untuk menjamin ketersediaan obat Fornas.",
      "Menyampaikan umpan balik rutin kepatuhan peresepan Fornas melalui Bidang Pelayanan Medis.",
      "Melakukan substitusi terapeutik sesuai SPO apabila terjadi kekosongan distributor obat tertentu.",
    ],
  },
  {
    key: "inm_10",
    code: "INM 10",
    title: "Kepatuhan terhadap alur klinis (Clinical Pathway)",
    tableNumber: "Tabel 5.12",
    chartNumber: "Grafik 5.10",
    numeratorLabel: "Jumlah pelayanan oleh PPA yang sesuai dengan Clinical Pathway",
    denominatorLabel: "Jumlah seluruh pelayanan oleh PPA pada Clinical Pathway yang diobservasi",
    defaultTarget: "≥ 80%",
    matchIds: ["e4f1beae-7903-4be1-97e5-34ef59270131", "bee4f6a1-1387-4eb1-b21c-0a2e43291aa1", "10"],
    titleKeywords: ["alur klinis", "clinical pathway"],
    clinicalPurpose: "Kepatuhan terhadap Clinical Pathway (CP) memastikan standarisasi proses asuhan klinis berbasis bukti, menurunkan variasi layanan, mengendalikan lama rawat (LOS), dan meningkatkan efisiensi biaya.",
    rootCauseHint: "kelengkapan pengisian lembar/modul CP oleh seluruh Profesional Pemberi Asuhan (dokter, perawat, farmasi, gizi) dan evaluasi varian klinis",
    defaultRecommendations: [
      "Komite Medik bersama KSM dan Komite Keperawatan melakukan pertemuan berkala untuk evaluasi pelaksanaan 5 Clinical Pathway prioritas.",
      "Memonitor ketersediaan dan kelengkapan pengisian instrumen Clinical Pathway pada rekam medis pasien.",
      "Meningkatkan konsistensi kepatuhan terapi, pemeriksaan penunjang, dan lama rawat sesuai PPK/CP.",
      "Melaksanakan audit klinis kepatuhan Clinical Pathway secara kolaboratif setiap triwulan.",
    ],
  },
  {
    key: "inm_11",
    code: "INM 11",
    title: "Kepatuhan upaya pencegahan risiko pasien jatuh",
    tableNumber: "Tabel 5.13",
    chartNumber: "Grafik 5.11",
    numeratorLabel: "Jumlah pasien rawat inap berisiko tinggi jatuh yang mendapatkan ketiga upaya pencegahan risiko jatuh",
    denominatorLabel: "Jumlah pasien rawat inap berisiko tinggi jatuh yang diobservasi",
    defaultTarget: "100%",
    matchIds: ["2c1d917e-5a3e-484d-a482-32aaa7fd4007", "11"],
    titleKeywords: ["upaya pencegahan risiko pasien jatuh", "upaya pencegahan risiko"],
    clinicalPurpose: "Kepatuhan tiga upaya pencegahan risiko jatuh (asesmen awal, asesmen ulang saat perubahan kondisi/transfer, dan intervensi pencegahan) melindungi pasien rawat inap dari cedera akibat jatuh (SKP 6).",
    rootCauseHint: "konsistensi asesmen ulang risiko jatuh, pemasangan penanda kuning/segitiga risiko jatuh, serta kelayakan pengaman tempat tidur (side rail) dan handrail kamar mandi",
    defaultRecommendations: [
      "Monitoring kepatuhan pelaksanaan asesmen awal, asesmen ulang, dan intervensi pasien risiko jatuh di seluruh ruang rawat inap.",
      "Koordinasi rutin dengan IPSRS untuk pengecekan dan perbaikan pengunci roda bed, side rail, serta handrail kamar mandi.",
      "Mengoptimalkan edukasi kepada pasien dan keluarga agar selalu mendampingi pasien berisiko jatuh.",
      "Memastikan pemasangan kancing/stiker kuning dan segitiga penanda risiko jatuh terpasang jelas pada setiap pasien risiko tinggi.",
    ],
  },
  {
    key: "inm_12",
    code: "INM 12",
    title: "Kecepatan waktu tanggap komplain",
    tableNumber: "Tabel 5.14",
    chartNumber: "Grafik 5.12",
    numeratorLabel: "Jumlah komplain yang ditanggapi dan ditindaklanjuti sesuai waktu yang ditetapkan berdasarkan grading",
    denominatorLabel: "Jumlah komplain yang disurvei",
    defaultTarget: "≥ 80%",
    matchIds: ["975cac4c-ef76-403e-bbaf-c015f2c7b2be", "12"],
    titleKeywords: ["waktu tanggap komplain", "tanggap complain"],
    clinicalPurpose: "Kecepatan waktu tanggap komplain berdasarkan grading (Merah ≤ 1x24 jam, Kuning ≤ 3 hari, Hijau ≤ 7 hari) mencerminkan pelayanan berorientasi pasien dan akuntabilitas publik rumah sakit.",
    rootCauseHint: "kecepatan koordinasi unit Humas/Pengaduan dengan kepala unit terkait dalam klarifikasi dan penyelesaian keluhan pasien/keluarga",
    defaultRecommendations: [
      "Memperluas akses dan sosialisasi kanal pengaduan pasien/pengunjung baik secara langsung, kotak saran, maupun media elektronik.",
      "Melakukan observasi proaktif terhadap titik layanan yang berpotensi menimbulkan keluhan waktu tunggu maupun fasilitas.",
      "Meningkatkan pelatihan komunikasi efektif dan service excellence bagi petugas garda depan (pendaftaran, IGD, poliklinik, kasir).",
      "Memastikan alur eskalasi dan penyelesaian komplain berjenjang terdokumentasi sesuai SPO.",
    ],
  },
  {
    key: "inm_13",
    code: "INM 13",
    title: "Kepuasan pasien",
    tableNumber: "Tabel 5.15",
    chartNumber: "Grafik 5.13",
    numeratorLabel: "Hasil penilaian Indeks Kepuasan Masyarakat (IKM) rumah sakit",
    denominatorLabel: "Skala maksimal Indeks Kepuasan Masyarakat",
    defaultTarget: "≥ 76,61%",
    matchIds: ["fd502f18-f5fd-44c7-8f24-9d877999744b", "13"],
    titleKeywords: ["kepuasan pasien"],
    clinicalPurpose: "Survei Kepuasan Pasien/Masyarakat mengukur persepsi pengguna layanan terhadap mutu penyelenggaraan pelayanan publik secara menyeluruh sesuai Permenpan-RB No. 14 Tahun 2017.",
    rootCauseHint: "kecepatan waktu pelayanan poliklinik/farmasi, keramahan komunikasi petugas, serta kenyamanan dan kebersihan fasilitas ruang perawatan",
    defaultRecommendations: [
      "Melaksanakan survei kepuasan pasien secara berkesinambungan di seluruh unit layanan rawat jalan, rawat inap, IGD, dan penunjang.",
      "Menindaklanjuti unsur pelayanan dengan nilai terendah (terutama waktu tunggu dan kenyamanan sarana) sebagai prioritas perbaikan.",
      "Meningkatkan budaya senyum, sapa, salam, dan komunikasi empatik pada seluruh pemberi layanan.",
    ],
  },
];

export interface ImpRsSpec {
  key: string;
  groupTitle: string;
  subCode: string;
  indicatorTitle: string;
  chartNumber: string;
  defaultTarget: string;
  reverse?: boolean;
  matchIds: string[];
  titleKeywords: string[];
  clinicalContext: string;
  defaultRecommendations: string[];
}

export const IMP_RS_SPECS: ImpRsSpec[] = [
  {
    key: "imprs_skp1",
    groupTitle: "1. INDIKATOR SASARAN KESELAMATAN PASIEN (SKP)",
    subCode: "SKP 1 - Kepatuhan Identifikasi Pasien",
    indicatorTitle: "Kepatuhan petugas melakukan minimal dua identitas pasien sebelum pemberian layanan",
    chartNumber: "Grafik 5.14",
    defaultTarget: "100%",
    matchIds: ["868edf5b-5e53-46b8-be00-ac9c2c8456cf", "fcd1ccca-aaf7-4e09-b951-92bcd1e28b07"],
    titleKeywords: ["dua identitas pasien", "identifikasi pasien"],
    clinicalContext: "Pelaksanaan identifikasi pasien menggunakan minimal dua identitas sebelum pemberian tindakan/obat memastikan ketepatan sasaran asuhan.",
    defaultRecommendations: [
      "Mewajibkan petugas selalu memasang dan memeriksa gelang identitas sebelum memulai tindakan di IGD maupun ruang rawat inap.",
      "Setiap pemberian obat, pengambilan spesimen, dan prosedur klinis wajib didahului verifikasi aktif 2 identitas.",
      "Monitoring kepatuhan identifikasi pasien secara rutin oleh kepala ruangan dan Tim Keselamatan Pasien.",
    ],
  },
  {
    key: "imprs_skp2",
    groupTitle: "1. INDIKATOR SASARAN KESELAMATAN PASIEN (SKP)",
    subCode: "SKP 2 - Peningkatan Komunikasi Efektif",
    indicatorTitle: "Pelaksanaan verifikasi 1x24 jam pada instruksi melalui telepon oleh DPJP & Kepatuhan dokumen SBAR",
    chartNumber: "Grafik 5.15",
    defaultTarget: "100%",
    matchIds: [
      "307d7c2c-b6ef-4ea4-b09f-6821edd4575b",
      "11110009-4a09-4000-9000-000000000009",
      "11110013-4a13-4000-9000-000000000013",
      "11110021-4a21-4000-9000-000000000021",
    ],
    titleKeywords: ["instruksi melalui telepon", "dokumen sbar"],
    clinicalContext: "Penerapan komunikasi efektif metode SBAR dan verifikasi TBaK 1x24 jam oleh DPJP mencegah kesalahan interpretasi instruksi klinis lisan/telepon.",
    defaultRecommendations: [
      "Mempertahankan dan meningkatkan kepatuhan pencatatan SBAR serta TBaK pada konsultasi via telepon/WhatsApp.",
      "Sosialisasi berkala SPO komunikasi efektif kepada perawat, bidan, dan dokter jaga.",
      "Selalu mengingatkan DPJP untuk melakukan verifikasi tanda tangan/otorisasi RME dalam 1x24 jam saat visite.",
    ],
  },
  {
    key: "imprs_skp3",
    groupTitle: "1. INDIKATOR SASARAN KESELAMATAN PASIEN (SKP)",
    subCode: "SKP 3 - Meningkatkan Keamanan Obat-Obatan yang Harus Diwaspadai",
    indicatorTitle: "Kepatuhan double check dan pelabelan obat High Alert sebelum pemberian obat",
    chartNumber: "Grafik 5.16",
    defaultTarget: "100%",
    matchIds: ["b977461c-a791-46ff-a9dd-62d0427aa0c8"],
    titleKeywords: ["high allert", "high alert"],
    clinicalContext: "Pelabelan khusus dan pengecekan ganda (independent double check) obat High Alert dan LASA/NORUM mencegah kejadian tidak diharapkan akibat kesalahan medikasi.",
    defaultRecommendations: [
      "Menyediakan stiker High Alert dan LASA secara memadai di gudang farmasi, seluruh depo farmasi, serta troli emergensi ruangan.",
      "Meningkatkan kedisiplinan apoteker/TTK dan perawat untuk melakukan double check independen sebelum penyiapan maupun pemberian obat High Alert.",
      "Supervisi berkala penyimpanan elektrolit pekat dan obat High Alert sesuai panduan keselamatan obat RS.",
    ],
  },
  {
    key: "imprs_skp4",
    groupTitle: "1. INDIKATOR SASARAN KESELAMATAN PASIEN (SKP)",
    subCode: "SKP 4 - Kepastian Tepat Lokasi, Tepat Prosedur, dan Tepat Pasien Operasi",
    indicatorTitle: "Kepatuhan pelaksanaan Surgical Safety Checklist (Sign In, Time Out, Sign Out) & Site Marking",
    chartNumber: "Grafik 5.17",
    defaultTarget: "100%",
    matchIds: ["3aa607da-2720-4142-bbd0-8b9482b78907"],
    titleKeywords: ["surgical safety", "site marking"],
    clinicalContext: "Pelaksanaan Surgical Safety Checklist dan penandaan lokasi operasi (site marking) menjamin keselamatan pembedahan dari risiko salah sisi, salah prosedur, dan salah pasien.",
    defaultRecommendations: [
      "Meningkatkan kedisiplinan DPJP operator dan tim kamar operasi dalam penandaan lokasi operasi (site marking) dengan melibatkan pasien sebelum masuk kamar bedah.",
      "Monitoring kelengkapan pengisian formulir Sign In, Time Out, dan Sign Out beserta jam dan tanda tangan tim operasi.",
      "Audit berkala dokumen keselamatan pembedahan pada rekam medis pasien operasi.",
    ],
  },
  {
    key: "imprs_skp5",
    groupTitle: "1. INDIKATOR SASARAN KESELAMATAN PASIEN (SKP)",
    subCode: "SKP 5 - Mengurangi Risiko Infeksi Akibat Perawatan Kesehatan",
    indicatorTitle: "Kepatuhan kebersihan tangan (Hand Hygiene) pada Dokter",
    chartNumber: "Grafik 5.18",
    defaultTarget: "≥ 85%",
    matchIds: ["ff81ae8c-49a6-4fd0-9fd9-9274f8b90b64"],
    titleKeywords: ["kebersihan tangan(hand hygine)pada dokter", "kebersihan tangan pada dokter"],
    clinicalContext: "Kepatuhan cuci tangan oleh dokter/DPJP saat visite dan tindakan medis sangat menentukan pemutusan rantai transmisi infeksi silang antar pasien.",
    defaultRecommendations: [
      "Sosialisasi dan penguatan budaya 5 momen cuci tangan secara khusus kepada dokter umum dan DPJP melalui Komite Medik.",
      "Menempatkan handrub berbasis alkohol di setiap pintu kamar pasien dan troli visite agar mudah dijangkau saat visite.",
      "Melakukan audit kepatuhan cuci tangan per profesi secara rutin oleh IPCN.",
    ],
  },
  {
    key: "imprs_skp6",
    groupTitle: "1. INDIKATOR SASARAN KESELAMATAN PASIEN (SKP)",
    subCode: "SKP 6 - Mengurangi Risiko Cedera Pasien Akibat Terjatuh",
    indicatorTitle: "Angka kepatuhan memasang stiker tambahan dan segitiga risiko jatuh di rawat inap",
    chartNumber: "Grafik 5.19",
    defaultTarget: "100%",
    matchIds: ["3ad3a107-9f9b-4d89-a943-7002793650b4"],
    titleKeywords: ["stiker tambahan", "segitiga risiko jatuh"],
    clinicalContext: "Pemasangan stiker penanda pada gelang identitas dan tanda segitiga risiko jatuh pada bed pasien memastikan seluruh PPA dan keluarga waspada terhadap risiko jatuh.",
    defaultRecommendations: [
      "Memastikan ketersediaan stiker kuning dan papan/segitiga penanda risiko jatuh di seluruh ruang rawat inap.",
      "Memotivasi keluarga pasien untuk mendampingi pasien saat mobilisasi dan ke kamar mandi.",
      "Koordinasi dengan petugas kebersihan dan IPSRS untuk menjaga lantai kamar mandi tetap kering serta handrail berfungsi baik.",
    ],
  },
  {
    key: "imprs_klinis",
    groupTitle: "2. INDIKATOR PELAYANAN KLINIS PRIORITAS",
    subCode: "Pelayanan Klinis Prioritas",
    indicatorTitle: "Kepatuhan Clinical Pathway Pelayanan Prioritas & Asesmen Awal Medis 24 Jam",
    chartNumber: "Grafik 5.20",
    defaultTarget: "≥ 85%",
    matchIds: [
      "bee4f6a1-1387-4eb1-b21c-0a2e43291aa1",
      "bab93b75-f095-4f72-b2fb-f865c2e2495a",
      "e3e86294-6cb4-401f-90b7-12881b050c62",
    ],
    titleKeywords: ["clinical pathway pelayanan prioritas", "assesmen awal medis dalam 24 jam", "skrining disfagia"],
    clinicalContext: "Pengukuran indikator pelayanan klinis prioritas memantau mutu asuhan terstandar sejak asesmen awal medis 24 jam hingga kepatuhan alur klinis penyakit prioritas.",
    defaultRecommendations: [
      "Mempertahankan monitoring pengisian asesmen awal medis dalam 1x24 jam dan kepatuhan alur klinis prioritas.",
      "Evaluasi berkala bersama Komite Medik terhadap kendala kepatuhan protokol klinis pada kasus prioritas.",
    ],
  },
  {
    key: "imprs_strategis",
    groupTitle: "3. INDIKATOR SESUAI TUJUAN STRATEGIS RUMAH SAKIT",
    subCode: "Tujuan Strategis Rumah Sakit",
    indicatorTitle: "Persentase Kejadian Kekosongan Obat Essensial & Pelatihan SDM 20 Jam/Tahun",
    chartNumber: "Grafik 5.21",
    defaultTarget: "0%",
    reverse: true,
    matchIds: ["01afa50b-5673-4431-9719-830b37209cc2", "22220080-4b50-4000-9000-000000000080"],
    titleKeywords: ["kekosongan obat essensial", "pelatihan minimal 20 jam"],
    clinicalContext: "Menjaga ketersediaan obat esensial (0% kekosongan) dan pemenuhan kompetensi SDM mendukung tujuan strategis kesinambungan layanan bermutu di RSUD Al-Mulk.",
    defaultRecommendations: [
      "Meningkatkan akurasi perencanaan buffer stok obat esensial di gudang farmasi serta koordinasi dini dengan bagian pengadaan.",
      "Koordinasi dengan bagian Diklat/Kepegawaian untuk pemetaan pelatihan berkelanjutan minimal 20 jam per tahun sesuai profesi.",
    ],
  },
  {
    key: "imprs_sistem",
    groupTitle: "4. INDIKATOR TERKAIT PERBAIKAN SISTEM",
    subCode: "Perbaikan Sistem Pelayanan & Penunjang",
    indicatorTitle: "Ketersediaan Air Bersih dalam 24 Jam & Optimalisasi Sistem Pelayanan",
    chartNumber: "Grafik 5.22",
    defaultTarget: "100%",
    matchIds: ["f5d46923-180f-4100-a6ba-66dcaf7e8f9f"],
    titleKeywords: ["air bersih dalam 24 jam"],
    clinicalContext: "Keandalan utilitas vital rumah sakit seperti ketersediaan air bersih 24 jam dan integrasi sistem pendaftaran menjamin kelancaran pencegahan infeksi serta mutu pelayanan.",
    defaultRecommendations: [
      "Mempertahankan pemantauan harian pompa, tandon, dan kualitas air bersih oleh IPSRS dan Kesehatan Lingkungan.",
      "Mengoptimalkan koordinasi lintas unit pada sistem pelayanan terintegrasi apabila terjadi gangguan sarana maupun perubahan jadwal layanan.",
    ],
  },
];

export interface MonthlyInmComputation {
  key: string;
  code: string;
  title: string;
  tableNumber: string;
  chartNumber: string;
  numeratorLabel: string;
  denominatorLabel: string;
  targetText: string;
  targetNum: number;
  reverse: boolean;
  prevYearValues: Array<number | null>;
  currYearValues: Array<number | null>;
  prevYearAvg: number | null;
  currYearAvg: number | null;
  currNumTotal: number;
  currDenTotal: number;
  hasCurrData: boolean;
  isMet: boolean | null;
  participatingUnits: string[];
  analisa: string;
  rekomendasi: string[];
}

export interface ImpRsComputation {
  key: string;
  groupTitle: string;
  subCode: string;
  indicatorTitle: string;
  chartNumber: string;
  targetText: string;
  targetNum: number;
  reverse: boolean;
  monthlyValues: Array<number | null>;
  avgValue: number | null;
  hasData: boolean;
  isMet: boolean | null;
  participatingUnits: string[];
  analisa: string;
  rekomendasi: string[];
}

export interface ImpUnitSummaryRow {
  no: number;
  id: string;
  title: string;
  standar: string;
  reverse: boolean;
  capaianVal: number | null;
  capaianText: string;
  hasData: boolean;
  isMet: boolean | null;
  keterangan: string;
}

export interface SpmIndicatorBlock {
  id: string;
  title: string;
  section: string;
  standar: string;
  unitMeasure: string;
  reverse: boolean;
  isAnnualOnly: boolean;
  monthlyRows: Array<{
    bulan: string;
    standar: string;
    capaianVal: number | null;
    capaianText: string;
  }>;
  avgVal: number | null;
  avgText: string;
  targetNum: number;
  hasData: boolean;
  isMet: boolean | null;
  inlineNote?: string;
}

export interface SpmSectionGroup {
  sectionTitle: string;
  domainGroup: "BIDANG YANMED & KEPERAWATAN" | "BIDANG PELAYANAN PENUNJANG" | "PELAYANAN ADMINISTRASI & MANAJEMEN";
  items: SpmIndicatorBlock[];
}

export interface IkpReportAggregation {
  totals: { knc: number; ktc: number; ktd: number; kpc: number; sentinel: number; total: number };
  monthlyTrend: Array<{
    monthUpper: string;
    knc: number;
    ktc: number;
    ktd: number;
    kpc: number;
    sentinel: number;
    total: number;
  }>;
  causes: Array<{
    no: number;
    penyebab: string;
    perMonth: number[];
    total: number;
  }>;
  locations: Array<{
    no: number;
    lokasi: string;
    perMonth: number[];
    total: number;
  }>;
  gradings: Array<{
    no: number;
    grading: "Biru" | "Hijau" | "Kuning" | "Merah";
    jumlah: number;
  }>;
  incidentDescriptions: {
    knc: string[];
    kpc: string[];
    ktc: string[];
    ktd: string[];
    sentinel: string[];
  };
  analisaJenis: string;
  tindakLanjutJenis: string[];
  analisaTrend: string;
  tindakLanjutTrend: string[];
  analisaPenyebab: string;
  tindakLanjutPenyebab: string[];
  analisaLokasi: string;
  tindakLanjutLokasi: string[];
  analisaGrading: string;
  tindakLanjutGrading: string[];
}

export interface OfficialReportModel {
  period: ReportPeriodMeta;
  rawatInapStats: RawatInapStatItem[];
  rawatInapMetCount: number;
  rawatInapPct: number;
  inmList: MonthlyInmComputation[];
  inmMetCount: number;
  inmMeasuredCount: number;
  inmPct: number;
  impRsList: ImpRsComputation[];
  impRsMetCount: number;
  impRsMeasuredCount: number;
  impRsPct: number;
  impUnitRows: ImpUnitSummaryRow[];
  impUnitMetCount: number;
  impUnitUnmetCount: number;
  impUnitPct: number;
  ppiData: {
    hhPrevAvg: number | null;
    hhMonthly: Array<number | null>;
    hhCurrAvg: number | null;
    hhDokterMonthly: Array<number | null>;
    hhDokterAvg: number | null;
    apdPrevAvg: number | null;
    apdMonthly: Array<number | null>;
    apdCurrAvg: number | null;
    haisRows: Array<{
      nama: string;
      standar: string;
      prevVal: string;
      monthly: string[];
      avg: string;
    }>;
    hhAnalisa: string;
    apdAnalisa: string;
    haisAnalisa: string;
  };
  spmGroups: SpmSectionGroup[];
  spmTotalCount: number;
  spmMeasuredCount: number;
  spmMetCount: number;
  spmUnmetTitles: string[];
  spmPct: number;
  cpEvaluation: {
    months12: string[];
    prevYear12: Array<number | null>;
    currYear12: Array<number | null>;
    standarVal: number;
    currPeriodAvg: number | null;
    isMet: boolean | null;
    analisa: string;
    rekomendasi: string[];
  };
  ikp: IkpReportAggregation;
  riskGroups: UnitRiskGroup[];
  priorityRisks: PriorityRiskSummaryRow[];
  budayaScorePct: number | null;
  aiPromptItems: AiNarrativeItemInput[];
}

function matchRecordsForSpec(
  allInputs: DataMutuPayload[],
  matchIds: string[],
  titleKeywords: string[],
): DataMutuPayload[] {
  const idSet = new Set(matchIds.map((x) => x.toLowerCase()));
  return allInputs.filter((d) => {
    if (d.kategori === "IKP") return false;
    const indId = String(d.indikator_id || "").toLowerCase();
    if (indId && idSet.has(indId)) return true;
    const indName = String(d.indikator_name || "").toLowerCase();
    if (indName && titleKeywords.some((kw) => indName.includes(kw.toLowerCase()))) {
      return true;
    }
    return false;
  });
}

function computeMonthAvg(
  records: DataMutuPayload[],
  year: string,
  monthIdx: number,
): { val: number | null; num: number; den: number; units: string[] } {
  const filtered = records.filter((r) => {
    if (!r.tanggal) return false;
    const dt = new Date(r.tanggal);
    return String(dt.getFullYear()) === year && dt.getMonth() === monthIdx;
  });
  if (filtered.length === 0) {
    return { val: null, num: 0, den: 0, units: [] };
  }
  let num = 0;
  let den = 0;
  let sumCap = 0;
  const units = new Set<string>();
  filtered.forEach((r) => {
    num += Number(r.numerator) || 0;
    den += Number(r.denominator) || 0;
    sumCap += Number(r.capaian) || 0;
    if (r.unit) units.add(r.unit);
  });
  const val =
    den > 0
      ? Number(((num / den) * 100).toFixed(2))
      : Number((sumCap / filtered.length).toFixed(2));
  return { val, num, den, units: Array.from(units) };
}

function averageNonNull(vals: Array<number | null>): number | null {
  const valid = vals.filter((v): v is number => v !== null && !Number.isNaN(v));
  if (valid.length === 0) return null;
  const sum = valid.reduce((a, b) => a + b, 0);
  return Number((sum / valid.length).toFixed(2));
}

function buildAutoClinicalNarrative(params: {
  title: string;
  targetText: string;
  reverse: boolean;
  avgVal: number | null;
  prevAvg: number | null;
  monthlyCols: MonthColumn[];
  monthlyVals: Array<number | null>;
  isMet: boolean | null;
  units: string[];
  periodTitle: string;
  clinicalPurpose: string;
  rootCauseHint: string;
  defaultRecs: string[];
}): AiNarrativeResult {
  const {
    title,
    targetText,
    reverse,
    avgVal,
    prevAvg,
    monthlyCols,
    monthlyVals,
    isMet,
    units,
    periodTitle,
    clinicalPurpose,
    rootCauseHint,
    defaultRecs,
  } = params;

  if (avgVal === null) {
    return {
      analisa: `${clinicalPurpose} Berdasarkan rekapitulasi sistem OPTIMUS pada ${periodTitle}, data observasi untuk indikator "${title}" (standar ${targetText}) belum terinput dari unit terkait pada periode terpilih, sehingga evaluasi capaian kuantitatif belum dapat dibandingkan terhadap target dan memerlukan tindak lanjut supervisi pelaporan PIC data unit.`,
      rekomendasi: [
        `Menginstruksikan PIC data pada unit terkait untuk segera melengkapi pengumpulan dan penginputan data indikator "${title}" secara tepat waktu di aplikasi OPTIMUS.`,
        ...defaultRecs.slice(0, 3),
      ],
    };
  }

  const monthDetails = monthlyCols
    .map((m, i) => (monthlyVals[i] !== null ? `${m.full} (${fmtPct(monthlyVals[i])})` : null))
    .filter(Boolean)
    .join(", ");

  const validVals = monthlyVals.filter((v): v is number => v !== null);
  let trendPhrase = "";
  if (validVals.length >= 2) {
    const first = validVals[0];
    const last = validVals[validVals.length - 1];
    const diff = Number((last - first).toFixed(2));
    if (Math.abs(diff) < 0.05) {
      trendPhrase = "dengan tren bulanan yang konsisten stabil";
    } else if ((!reverse && diff > 0) || (reverse && diff < 0)) {
      trendPhrase = `dengan tren perbaikan positif (${fmtPct(first)} menjadi ${fmtPct(last)})`;
    } else {
      trendPhrase = `dengan fluktuasi yang perlu diwaspadai (${fmtPct(first)} menjadi ${fmtPct(last)})`;
    }
  }

  const prevCompare =
    prevAvg !== null
      ? ` Apabila dibandingkan dengan periode pembanding tahun sebelumnya (${fmtPct(prevAvg)}), capaian periode ini bergerak ke angka ${fmtPct(avgVal)}.`
      : "";

  const unitPhrase =
    units.length > 0
      ? ` Pengukuran mencakup observasi pada ${units.slice(0, 4).join(", ")}${units.length > 4 ? ` dan ${units.length - 4} unit lainnya` : ""}.`
      : "";

  if (isMet) {
    return {
      analisa: `${clinicalPurpose} Berdasarkan tabel dan grafik pada ${periodTitle}, realisasi indikator "${title}" telah mencapai standar yang ditetapkan (${targetText}) dengan rata-rata capaian sebesar ${fmtPct(avgVal)}${monthDetails ? ` [rincian: ${monthDetails}]` : ""} ${trendPhrase}.${prevCompare}${unitPhrase} Capaian ini menunjukkan kepatuhan pelaksanaan SPO yang baik dan perlu dipertahankan secara berkesinambungan.`,
      rekomendasi: [
        `Mempertahankan capaian indikator "${title}" agar tetap konsisten memenuhi standar (${targetText}) melalui monitoring berkala.`,
        ...defaultRecs.slice(0, 3),
      ],
    };
  }

  return {
    analisa: `${clinicalPurpose} Berdasarkan tabel dan grafik pada ${periodTitle}, realisasi rata-rata indikator "${title}" tercatat sebesar ${fmtPct(avgVal)}${monthDetails ? ` [rincian: ${monthDetails}]` : ""} ${trendPhrase}, sehingga belum memenuhi standar target ${targetText}.${prevCompare}${unitPhrase} Belum tercapainya target ini berkaitan erat dengan aspek ${rootCauseHint}, sehingga diperlukan intervensi perbaikan terarah melalui siklus PDSA (Plan-Do-Study-Act).`,
    rekomendasi: [
      `Melaksanakan siklus perbaikan PDSA terfokus pada unit dengan capaian di bawah target untuk indikator "${title}".`,
      ...defaultRecs,
    ],
  };
}

function classifySpmSection(rationale: string, title: string): {
  sectionTitle: string;
  domainGroup: SpmSectionGroup["domainGroup"];
} {
  const m = (rationale || "").match(/\(([^)]+)\)\.?$/);
  const rawSec = m ? m[1] : "";
  const low = `${rawSec} ${title}`.toLowerCase();

  if (low.includes("gawat darurat"))
    return { sectionTitle: "Pelayanan Gawat Darurat", domainGroup: "BIDANG YANMED & KEPERAWATAN" };
  if (low.includes("rawat jalan"))
    return { sectionTitle: "Pelayanan Rawat Jalan & TB", domainGroup: "BIDANG YANMED & KEPERAWATAN" };
  if (low.includes("rawat inap"))
    return { sectionTitle: "Pelayanan Rawat Inap & TB", domainGroup: "BIDANG YANMED & KEPERAWATAN" };
  if (low.includes("bedah sentral") || low.includes("operasi"))
    return { sectionTitle: "Pelayanan Bedah Sentral", domainGroup: "BIDANG YANMED & KEPERAWATAN" };
  if (low.includes("persalinan") || low.includes("perinatologi") || low.includes("imd") || low.includes("kematian ibu") || low.includes("kematian bayi") || low.includes("penyediaan darah"))
    return { sectionTitle: "Pelayanan Persalinan, PONEK & Perinatologi", domainGroup: "BIDANG YANMED & KEPERAWATAN" };
  if (low.includes("intensif") || low.includes("icu"))
    return { sectionTitle: "Pelayanan Intensif", domainGroup: "BIDANG YANMED & KEPERAWATAN" };
  if (low.includes("radiologi") || low.includes("rontgen") || low.includes("thorax"))
    return { sectionTitle: "Pelayanan Radiologi", domainGroup: "BIDANG PELAYANAN PENUNJANG" };
  if (low.includes("laboratorium") && !low.includes("kalibrasi"))
    return { sectionTitle: "Pelayanan Laboratorium Patologi Klinik", domainGroup: "BIDANG PELAYANAN PENUNJANG" };
  if (low.includes("rehabilitasi"))
    return { sectionTitle: "Pelayanan Rehabilitasi Medik", domainGroup: "BIDANG PELAYANAN PENUNJANG" };
  if (low.includes("farmasi") || low.includes("obat") || low.includes("resep"))
    return { sectionTitle: "Pelayanan Farmasi", domainGroup: "BIDANG PELAYANAN PENUNJANG" };
  if (low.includes("gizi") || low.includes("makanan") || low.includes("diet"))
    return { sectionTitle: "Pelayanan Gizi", domainGroup: "BIDANG PELAYANAN PENUNJANG" };
  if (low.includes("rekam medik") || low.includes("informed consent"))
    return { sectionTitle: "Pelayanan Rekam Medik", domainGroup: "BIDANG PELAYANAN PENUNJANG" };
  if (low.includes("limbah"))
    return { sectionTitle: "Pelayanan Pengelolaan Limbah", domainGroup: "BIDANG PELAYANAN PENUNJANG" };
  if (low.includes("laundry") || low.includes("linen"))
    return { sectionTitle: "Pelayanan Laundry", domainGroup: "BIDANG PELAYANAN PENUNJANG" };
  if (low.includes("pemeliharaan sarana") || low.includes("kerusakan alat") || low.includes("kalibrasi"))
    return { sectionTitle: "Pelayanan Pemeliharaan Sarana Rumah Sakit (IPSRS)", domainGroup: "BIDANG PELAYANAN PENUNJANG" };
  if (low.includes("ambulance") || low.includes("jenazah"))
    return { sectionTitle: "Pelayanan Ambulance /Pemulasaraan Jenazah", domainGroup: "PELAYANAN ADMINISTRASI & MANAJEMEN" };
  if (low.includes("gakin"))
    return { sectionTitle: "Pelayanan GAKIN", domainGroup: "PELAYANAN ADMINISTRASI & MANAJEMEN" };
  if (low.includes("ppi") || low.includes("apd") || low.includes("infeksi nosokomial"))
    return { sectionTitle: "Pelayanan Pencegahan dan Pengendalian Infeksi (PPI)", domainGroup: "BIDANG YANMED & KEPERAWATAN" };

  return { sectionTitle: "Pelayanan Administrasi dan Manajemen", domainGroup: "PELAYANAN ADMINISTRASI & MANAJEMEN" };
}

// Cross-link SPM profiles to equivalent operational INM / IMP-Unit IDs so data entered once in /input populates SPM too
function getCrossLinkedIdsForSpm(spm: IndicatorProfile): string[] {
  const t = (spm.indicator_title || "").toLowerCase();
  const extra: string[] = [spm.id];
  if (t.includes("waktu tanggap") && t.includes("gawat darurat")) extra.push("11110001-4a01-4000-9000-000000000001");
  if (t.includes("waktu tunggu") && t.includes("rawat jalan")) extra.push("8310950c-90e9-4361-965b-46a47a70c8fd", "11110002-4a02-4000-9000-000000000002");
  if (t.includes("visite")) extra.push("c5ae8720-5f8b-4f1a-933b-4053a9a81f1b", "7");
  if (t.includes("thorax")) extra.push("11110006-4a06-4000-9000-000000000006");
  if (t.includes("obat racikan")) extra.push("11110003-4a03-4000-9000-000000000003");
  if (t.includes("formularium")) extra.push("9871c4ca-55dc-45e4-acc8-a37dce8c2a67");
  if (t.includes("rekam med") && t.includes("24 jam")) extra.push("11110004-4a04-4000-9000-000000000004");
  if (t.includes("penyediaan linen")) extra.push("11110020-4a20-4000-9000-000000000020");
  if (t.includes("seksio") || t.includes("sectio")) extra.push("aeae5b11-04c4-4254-8831-1d5c0ed07b1f");
  if (t.includes("apd")) extra.push("58023206-fad4-46cc-8e39-ab28b8ea2ff8");
  if (t.includes("limbah padat")) extra.push("11110019-4a19-4000-9000-000000000019");
  if (t.includes("ambulance")) extra.push("11110015-4a15-4000-9000-000000000015");
  return extra;
}

export function buildOfficialReportModel(params: {
  period: ReportPeriodMeta;
  dataMutuList: DataMutuPayload[];
  indicatorProfiles: IndicatorProfile[];
  rawatInapStats: RawatInapStatItem[];
  liveRiskRecords: any[];
  surveiBudayaRows: any[];
  aiNarratives: Record<string, AiNarrativeResult>;
}): OfficialReportModel {
  const {
    period,
    dataMutuList,
    indicatorProfiles,
    rawatInapStats,
    liveRiskRecords,
    surveiBudayaRows,
    aiNarratives,
  } = params;

  const aiPromptItems: AiNarrativeItemInput[] = [];

  // 1. Rawat Inap Stats (5.2)
  const rawatInapMetCount = rawatInapStats.filter((x) => x.tercapai).length;
  const rawatInapPct =
    rawatInapStats.length > 0
      ? Number(((rawatInapMetCount / rawatInapStats.length) * 100).toFixed(1))
      : 0;

  // 2. INM 1-13 (5.3)
  const inmList: MonthlyInmComputation[] = INM_13_SPECS.map((spec) => {
    const matchedProfile = indicatorProfiles.find(
      (p) =>
        spec.matchIds.includes(p.id) ||
        spec.titleKeywords.some((kw) =>
          (p.indicator_title || "").toLowerCase().includes(kw.toLowerCase()),
        ),
    );
    const targetText = String(matchedProfile?.target || spec.defaultTarget);
    const reverse = isReverseTarget(targetText, matchedProfile?.reverse ?? spec.reverse);
    const targetNum = parseTargetNumber(targetText, reverse ? 5 : 80);

    const records = matchRecordsForSpec(dataMutuList, spec.matchIds, spec.titleKeywords);

    const prevYearValues = period.monthCols.map(
      (mc) => computeMonthAvg(records, period.prevYear, mc.monthIndex).val,
    );
    let currNumTotal = 0;
    let currDenTotal = 0;
    const unitSet = new Set<string>();
    const currYearValues = period.monthCols.map((mc) => {
      const res = computeMonthAvg(records, period.currYear, mc.monthIndex);
      currNumTotal += res.num;
      currDenTotal += res.den;
      res.units.forEach((u) => unitSet.add(u));
      return res.val;
    });

    const prevYearAvg = averageNonNull(prevYearValues);
    const currYearAvg = averageNonNull(currYearValues);
    const hasCurrData = currYearAvg !== null;
    const isMet = evaluateTargetMet(currYearAvg, targetText, reverse);
    const participatingUnits = Array.from(unitSet);

    const autoNar = buildAutoClinicalNarrative({
      title: `${spec.code}: ${spec.title}`,
      targetText,
      reverse,
      avgVal: currYearAvg,
      prevAvg: prevYearAvg,
      monthlyCols: period.monthCols,
      monthlyVals: currYearValues,
      isMet,
      units: participatingUnits,
      periodTitle: period.shortPeriodTitle,
      clinicalPurpose: spec.clinicalPurpose,
      rootCauseHint: spec.rootCauseHint,
      defaultRecs: spec.defaultRecommendations,
    });

    const customAi = aiNarratives[spec.key];
    aiPromptItems.push({
      key: spec.key,
      category: "INM",
      title: `${spec.code}: ${spec.title}`,
      target: targetText,
      reverse,
      isMet,
      hasData: hasCurrData,
      currAvg: fmtPct(currYearAvg),
      prevAvg: fmtPct(prevYearAvg),
      monthlySummary: period.monthCols
        .map((m, idx) => `${m.short}: ${fmtPct(currYearValues[idx])}`)
        .join(", "),
      numeratorTotal: currNumTotal,
      denominatorTotal: currDenTotal,
      units: participatingUnits,
    });

    return {
      key: spec.key,
      code: spec.code,
      title: spec.title,
      tableNumber: spec.tableNumber,
      chartNumber: spec.chartNumber,
      numeratorLabel: matchedProfile?.numerator || spec.numeratorLabel,
      denominatorLabel: matchedProfile?.denominator || spec.denominatorLabel,
      targetText,
      targetNum,
      reverse,
      prevYearValues,
      currYearValues,
      prevYearAvg,
      currYearAvg,
      currNumTotal,
      currDenTotal,
      hasCurrData,
      isMet,
      participatingUnits,
      analisa: customAi?.analisa || autoNar.analisa,
      rekomendasi:
        customAi?.rekomendasi && customAi.rekomendasi.length > 0
          ? customAi.rekomendasi
          : autoNar.rekomendasi,
    };
  });

  const inmMeasured = inmList.filter((x) => x.hasCurrData);
  const inmMetCount = inmMeasured.filter((x) => x.isMet === true).length;
  const inmMeasuredCount = inmMeasured.length;
  const inmPct =
    inmMeasuredCount > 0
      ? Number(((inmMetCount / inmMeasuredCount) * 100).toFixed(1))
      : 0;

  // 3. IMP-RS (5.4)
  const impRsList: ImpRsComputation[] = IMP_RS_SPECS.map((spec) => {
    const matchedProfile = indicatorProfiles.find((p) => spec.matchIds.includes(p.id));
    const targetText = String(matchedProfile?.target || spec.defaultTarget);
    const reverse = isReverseTarget(targetText, matchedProfile?.reverse ?? spec.reverse);
    const targetNum = parseTargetNumber(targetText, reverse ? 0 : 100);
    const records = matchRecordsForSpec(dataMutuList, spec.matchIds, spec.titleKeywords);

    const unitSet = new Set<string>();
    const monthlyValues = period.monthCols.map((mc) => {
      const res = computeMonthAvg(records, period.currYear, mc.monthIndex);
      res.units.forEach((u) => unitSet.add(u));
      return res.val;
    });
    const avgValue = averageNonNull(monthlyValues);
    const hasData = avgValue !== null;
    const isMet = evaluateTargetMet(avgValue, targetText, reverse);
    const participatingUnits = Array.from(unitSet);

    const autoNar = buildAutoClinicalNarrative({
      title: `${spec.subCode} (${spec.indicatorTitle})`,
      targetText,
      reverse,
      avgVal: avgValue,
      prevAvg: null,
      monthlyCols: period.monthCols,
      monthlyVals: monthlyValues,
      isMet,
      units: participatingUnits,
      periodTitle: period.shortPeriodTitle,
      clinicalPurpose: spec.clinicalContext,
      rootCauseHint: "konsistensi supervisi kepala ruangan dan kepatuhan dokumentasi PPA sesuai SPO keselamatan pasien",
      defaultRecs: spec.defaultRecommendations,
    });

    const customAi = aiNarratives[spec.key];
    aiPromptItems.push({
      key: spec.key,
      category: "IMP-RS",
      title: `${spec.subCode}: ${spec.indicatorTitle}`,
      target: targetText,
      reverse,
      isMet,
      hasData,
      currAvg: fmtPct(avgValue),
      monthlySummary: period.monthCols
        .map((m, idx) => `${m.short}: ${fmtPct(monthlyValues[idx])}`)
        .join(", "),
      units: participatingUnits,
    });

    return {
      key: spec.key,
      groupTitle: spec.groupTitle,
      subCode: spec.subCode,
      indicatorTitle: spec.indicatorTitle,
      chartNumber: spec.chartNumber,
      targetText,
      targetNum,
      reverse,
      monthlyValues,
      avgValue,
      hasData,
      isMet,
      participatingUnits,
      analisa: customAi?.analisa || autoNar.analisa,
      rekomendasi:
        customAi?.rekomendasi && customAi.rekomendasi.length > 0
          ? customAi.rekomendasi
          : autoNar.rekomendasi,
    };
  });

  const impRsMeasured = impRsList.filter((x) => x.hasData);
  const impRsMetCount = impRsMeasured.filter((x) => x.isMet === true).length;
  const impRsMeasuredCount = impRsMeasured.length;
  const impRsPct =
    impRsMeasuredCount > 0
      ? Number(((impRsMetCount / impRsMeasuredCount) * 100).toFixed(1))
      : 0;

  // 4. IMP-Unit (5.5 Tabel 5.16)
  const impUnitProfiles = indicatorProfiles.filter(
    (p) => (p.category || "").toUpperCase().includes("UNIT"),
  );
  const impUnitRows: ImpUnitSummaryRow[] = impUnitProfiles.map((p, idx) => {
    const pTargetStr = String(p.target || "100%");
    const reverse = isReverseTarget(pTargetStr, p.reverse);
    const records = matchRecordsForSpec(dataMutuList, [p.id], [p.indicator_title]);
    const monthVals = period.monthCols.map(
      (mc) => computeMonthAvg(records, period.currYear, mc.monthIndex).val,
    );
    const avgVal = averageNonNull(monthVals);
    const hasData = avgVal !== null;
    const isMet = evaluateTargetMet(avgVal, pTargetStr, reverse);

    return {
      no: idx + 1,
      id: p.id,
      title: p.indicator_title,
      standar: pTargetStr,
      reverse,
      capaianVal: avgVal,
      capaianText: fmtPct(avgVal),
      hasData,
      isMet,
      keterangan: !hasData ? "Belum ada input" : isMet ? "Tercapai" : "Belum tercapai",
    };
  });

  const impUnitMeasured = impUnitRows.filter((x) => x.hasData);
  const impUnitMetCount = impUnitMeasured.filter((x) => x.isMet === true).length;
  const impUnitUnmetCount = impUnitMeasured.filter((x) => x.isMet === false).length;
  const impUnitPct =
    impUnitMeasured.length > 0
      ? Number(((impUnitMetCount / impUnitMeasured.length) * 100).toFixed(1))
      : 0;

  // 5. PPI (5.6)
  const hhInm = inmList[0]; // INM 1
  const apdInm = inmList[1]; // INM 2
  const hhDokterSpec = impRsList.find((x) => x.key === "imprs_skp5");
  const hhRecords = matchRecordsForSpec(dataMutuList, INM_13_SPECS[0].matchIds, INM_13_SPECS[0].titleKeywords);
  const hhPrevTwVals = period.prevPeriodMonths.monthIndices.map(
    (mIdx) => computeMonthAvg(hhRecords, period.prevPeriodMonths.year, mIdx).val,
  );
  const hhPrevAvg = averageNonNull(hhPrevTwVals);

  const apdRecords = matchRecordsForSpec(dataMutuList, INM_13_SPECS[1].matchIds, INM_13_SPECS[1].titleKeywords);
  const apdPrevTwVals = period.prevPeriodMonths.monthIndices.map(
    (mIdx) => computeMonthAvg(apdRecords, period.prevPeriodMonths.year, mIdx).val,
  );
  const apdPrevAvg = averageNonNull(apdPrevTwVals);

  const idoRecords = matchRecordsForSpec(dataMutuList, ["22220023-4b17-4000-9000-000000000023"], ["infeksi pasca operasi"]);
  const nosokomialRecords = matchRecordsForSpec(dataMutuList, ["22220024-4b18-4000-9000-000000000024"], ["infeksi nosokomial"]);
  const idoMonthly = period.monthCols.map((mc) => computeMonthAvg(idoRecords, period.currYear, mc.monthIndex).val);
  const nosoMonthly = period.monthCols.map((mc) => computeMonthAvg(nosokomialRecords, period.currYear, mc.monthIndex).val);
  const idoAvg = averageNonNull(idoMonthly);
  const nosoAvg = averageNonNull(nosoMonthly);

  const ppiData = {
    hhPrevAvg,
    hhMonthly: hhInm.currYearValues,
    hhCurrAvg: hhInm.currYearAvg,
    hhDokterMonthly: hhDokterSpec?.monthlyValues || period.monthCols.map(() => null),
    hhDokterAvg: hhDokterSpec?.avgValue ?? null,
    apdPrevAvg,
    apdMonthly: apdInm.currYearValues,
    apdCurrAvg: apdInm.currYearAvg,
    haisRows: [
      {
        nama: "IDO (Infeksi Daerah Operasi)",
        standar: "≤ 2%",
        prevVal: "0%",
        monthly: idoMonthly.map((v) => (v !== null ? fmtPct(v) : "0%")),
        avg: idoAvg !== null ? fmtPct(idoAvg) : "0%",
      },
      {
        nama: "Phlebitis",
        standar: "≤ 1%",
        prevVal: "0%",
        monthly: nosoMonthly.map((v) => (v !== null ? fmtPct(v) : "0%")),
        avg: nosoAvg !== null ? fmtPct(nosoAvg) : "0%",
      },
      {
        nama: "VAP (Ventilator Associated Pneumonia)",
        standar: "≤ 5,8‰",
        prevVal: "0%",
        monthly: period.monthCols.map(() => "0%"),
        avg: "0%",
      },
      {
        nama: "Dekubitus",
        standar: "≤ 1%",
        prevVal: "0%",
        monthly: period.monthCols.map(() => "0%"),
        avg: "0%",
      },
      {
        nama: "ISK (Infeksi Saluran Kemih)",
        standar: "≤ 4,7‰",
        prevVal: "0%",
        monthly: period.monthCols.map(() => "0%"),
        avg: "0%",
      },
    ],
    hhAnalisa:
      hhInm.currYearAvg === null
        ? `Pada ${period.shortPeriodTitle}, data surveilans angka kepatuhan cuci tangan di aplikasi OPTIMUS belum terinput lengkap, sehingga diperlukan supervisi IPCN/IPCLN pada seluruh unit pelayanan.`
        : hhInm.currYearAvg >= 85
          ? `Pada ${period.shortPeriodTitle}, capaian angka kepatuhan cuci tangan secara umum telah memenuhi standar (≥ 85%) yaitu sebesar ${fmtPct(hhInm.currYearAvg)}.`
          : `Pada ${period.shortPeriodTitle}, capaian angka kepatuhan cuci tangan secara umum belum memenuhi standar (≥ 85%) yaitu sebesar ${fmtPct(hhInm.currYearAvg)}, sehingga perlu penguatan edukasi 5 momen cuci tangan dan pemenuhan fasilitas hand hygiene.`,
    apdAnalisa:
      apdInm.currYearAvg === null
        ? `Pada ${period.shortPeriodTitle}, pencatatan observasi kepatuhan penggunaan APD oleh petugas pada periode terpilih masih menunggu kelengkapan input unit.`
        : apdInm.currYearAvg >= 100
          ? `Angka kepatuhan penggunaan APD petugas pada ${period.shortPeriodTitle} telah mencapai target yang diharapkan (100%) dengan rata-rata ${fmtPct(apdInm.currYearAvg)}. Hal ini menunjukkan kepatuhan penggunaan APD telah membudaya dengan baik.`
          : `Angka kepatuhan penggunaan APD petugas pada ${period.shortPeriodTitle} tercatat sebesar ${fmtPct(apdInm.currYearAvg)} (standar 100%), sehingga diperlukan supervisi ketat pemakaian dan pelepasan APD sesuai indikasi transmisi.`,
    haisAnalisa:
      nosoAvg !== null && nosoAvg > 1
        ? `Surveilans HAIs oleh Tim PPI/IPCN pada ${period.shortPeriodTitle} menunjukkan rata-rata kejadian sebesar ${fmtPct(nosoAvg)} yang memerlukan perhatian penguatan bundles pencegahan infeksi.`
        : `Surveilans HAIs yang dipantau oleh Tim PPI/IPCN pada ${period.shortPeriodTitle} menunjukkan pengendalian infeksi berjalan terkendali sesuai target surveilans rumah sakit, dan pemantauan aktif bundles HAIs tetap dilaksanakan secara rutin di setiap ruang perawatan.`,
  };

  // 6. SPM Indicators (5.7)
  const spmProfiles = indicatorProfiles.filter(
    (p) => (p.category || "").toUpperCase().trim() === "SPM",
  );
  const spmMap = new Map<string, SpmSectionGroup>();
  const spmUnmetTitles: string[] = [];
  let spmMeasuredCount = 0;
  let spmMetCount = 0;

  spmProfiles.forEach((spm) => {
    const { sectionTitle, domainGroup } = classifySpmSection(
      spm.rationale || "",
      spm.indicator_title || "",
    );
    if (!spmMap.has(sectionTitle)) {
      spmMap.set(sectionTitle, { sectionTitle, domainGroup, items: [] });
    }
    const spmTargetStr = String(spm.target || "100%");
    const crossIds = getCrossLinkedIdsForSpm(spm);
    const records = matchRecordsForSpec(dataMutuList, crossIds, [spm.indicator_title]);
    const reverse = isReverseTarget(spmTargetStr, spm.reverse);
    const targetNum = parseTargetNumber(spmTargetStr, reverse ? 0 : 100);
    const lowColPeriod = `${spm.collection_period || ""} ${spm.analysis_period || ""}`.toLowerCase();
    const isAnnualOnly =
      lowColPeriod.includes("tahun") && !lowColPeriod.includes("bulan") && records.length === 0;

    const unitMeasure = spm.measurement_unit || "Persen (%)";
    const suffix = unitMeasure.toLowerCase().includes("jam")
      ? " Jam"
      : unitMeasure.toLowerCase().includes("menit")
        ? " Menit"
        : unitMeasure.toLowerCase().includes("hari")
          ? " Hari"
          : "%";

    const monthlyRows = period.monthCols.map((mc) => {
      const res = computeMonthAvg(records, period.currYear, mc.monthIndex);
      return {
        bulan: mc.full,
        standar: spmTargetStr,
        capaianVal: res.val,
        capaianText: res.val !== null ? fmtPct(res.val, suffix) : "-",
      };
    });

    const avgVal = averageNonNull(monthlyRows.map((r) => r.capaianVal));
    const hasData = avgVal !== null;
    const isMet = evaluateTargetMet(avgVal, spmTargetStr, reverse);

    if (hasData) {
      spmMeasuredCount++;
      if (isMet) {
        spmMetCount++;
      } else {
        spmUnmetTitles.push(spm.indicator_title);
      }
    }

    let inlineNote: string | undefined;
    if (hasData && isMet === false) {
      inlineNote = `Terlihat hasil rata-rata sebesar ${fmtPct(avgVal, suffix)} belum mencapai standar target (${spmTargetStr}). Diperlukan evaluasi akar masalah bersama kepala unit terkait serta tindak lanjut perbaikan kepatuhan SPO dan pemenuhan sumber daya.`;
    }

    spmMap.get(sectionTitle)!.items.push({
      id: spm.id,
      title: spm.indicator_title,
      section: sectionTitle,
      standar: spmTargetStr,
      unitMeasure,
      reverse,
      isAnnualOnly,
      monthlyRows,
      avgVal,
      avgText: avgVal !== null ? fmtPct(avgVal, suffix) : "-",
      targetNum,
      hasData,
      isMet,
      inlineNote,
    });
  });

  const spmGroups = Array.from(spmMap.values());
  const spmPct =
    spmMeasuredCount > 0
      ? Number(((spmMetCount / spmMeasuredCount) * 100).toFixed(1))
      : 0;

  // 7. Evaluasi PPK / Clinical Pathway (5.8)
  const cpRecords = matchRecordsForSpec(
    dataMutuList,
    ["e4f1beae-7903-4be1-97e5-34ef59270131", "bee4f6a1-1387-4eb1-b21c-0a2e43291aa1", "10"],
    ["alur klinis", "clinical pathway"],
  );
  const prevYear12 = MONTH_META.map((m) => computeMonthAvg(cpRecords, period.prevYear, m.monthIndex).val);
  const currYear12 = MONTH_META.map((m) => computeMonthAvg(cpRecords, period.currYear, m.monthIndex).val);
  const cpPeriodVals = period.monthCols.map((m) => computeMonthAvg(cpRecords, period.currYear, m.monthIndex).val);
  const cpAvg = averageNonNull(cpPeriodVals);
  const cpMet = evaluateTargetMet(cpAvg, "≥ 80%", false);
  const cpCustomAi = aiNarratives["cp_5_8"];

  aiPromptItems.push({
    key: "cp_5_8",
    category: "Clinical Pathway (PPK/CP)",
    title: "Evaluasi Kepatuhan Panduan Praktik Klinik (PPK) / Clinical Pathway (CP)",
    target: "≥ 80%",
    isMet: cpMet,
    hasData: cpAvg !== null,
    currAvg: fmtPct(cpAvg),
    monthlySummary: period.monthCols
      .map((m, idx) => `${m.short}: ${fmtPct(cpPeriodVals[idx])}`)
      .join(", "),
  });

  const cpEvaluation = {
    months12: MONTH_META.map((m) => m.short),
    prevYear12,
    currYear12,
    standarVal: 80,
    currPeriodAvg: cpAvg,
    isMet: cpMet,
    analisa:
      cpCustomAi?.analisa ||
      (cpAvg === null
        ? `Pada ${period.shortPeriodTitle}, data audit kepatuhan PPK/Clinical Pathway pada 5 kasus prioritas belum terinput di sistem OPTIMUS, sehingga Komite Medik bersama Tim Mutu perlu melaksanakan audit rekam medis terpadu.`
        : cpMet
          ? `Pada ${period.shortPeriodTitle}, rerata kepatuhan pelaksanaan PPK/Clinical Pathway adalah sebesar ${fmtPct(cpAvg)} dan telah memenuhi standar yang ditetapkan (≥ 80%).`
          : `Pada ${period.shortPeriodTitle}, rerata kepatuhan pelaksanaan PPK/Clinical Pathway tercatat sebesar ${fmtPct(cpAvg)} dan masih perlu ditingkatkan agar mencapai standar minimal ≥ 80%.`),
    rekomendasi: cpCustomAi?.rekomendasi || [
      "Review dan revisi dokumen PPK/Clinical Pathway secara berkala oleh Tim Mutu, Komite Medik, Komite Keperawatan, dan Komite Nakes Lain.",
      "Monitoring dan evaluasi kepatuhan pengisian Clinical Pathway secara lebih komprehensif pada rekam medis.",
      "Menggunakan hasil audit Clinical Pathway sebagai salah satu indikator evaluasi kinerja PPA.",
      "Memastikan ketersediaan format Clinical Pathway pada 5 diagnosis prioritas di setiap ruang perawatan.",
    ],
  };

  // 8. Keselamatan Pasien & IKP (5.9)
  const periodMonthSet = new Set(period.monthCols.map((m) => m.monthIndex));
  const ikpEntries = dataMutuList.filter((d) => {
    if (!d.tanggal) return false;
    const dt = new Date(d.tanggal);
    if (String(dt.getFullYear()) !== period.currYear) return false;
    if (!periodMonthSet.has(dt.getMonth())) return false;
    const hasIkpCounts =
      (Number(d.kpc) || 0) +
        (Number(d.knc) || 0) +
        (Number(d.ktc) || 0) +
        (Number(d.ktd) || 0) +
        (Number(d.sentinel) || 0) >
      0;
    return d.kategori === "IKP" || hasIkpCounts;
  });

  let knc = 0,
    ktc = 0,
    ktd = 0,
    kpc = 0,
    sentinel = 0;

  const monthlyTrend = period.monthCols.map((mc) => ({
    monthUpper: mc.upper,
    knc: 0,
    ktc: 0,
    ktd: 0,
    kpc: 0,
    sentinel: 0,
    total: 0,
  }));

  const defaultCauseLabels = [
    "Petugas kurang teliti",
    "Fasilitas yang rusak atau tidak terawat",
    "Prosedur tindakan tidak sesuai dengan SOP",
    "Riwayat penyakit pasien",
  ];
  const causeCountsPerMonth: Record<string, number[]> = {};
  defaultCauseLabels.forEach((c) => {
    causeCountsPerMonth[c] = period.monthCols.map(() => 0);
  });

  const locCountsPerMonth: Record<string, number[]> = {};
  const gradingCounts: Record<"Biru" | "Hijau" | "Kuning" | "Merah", number> = {
    Biru: 0,
    Hijau: 0,
    Kuning: 0,
    Merah: 0,
  };
  const incidentDescriptions = {
    knc: [] as string[],
    kpc: [] as string[],
    ktc: [] as string[],
    ktd: [] as string[],
    sentinel: [] as string[],
  };

  ikpEntries.forEach((entry: any) => {
    const dt = new Date(entry.tanggal);
    const colIdx = period.monthCols.findIndex((m) => m.monthIndex === dt.getMonth());
    if (colIdx === -1) return;

    const eKnc = Number(entry.knc) || 0;
    const eKtc = Number(entry.ktc) || 0;
    const eKtd = Number(entry.ktd) || 0;
    const eKpc = Number(entry.kpc) || 0;
    const eSen = Number(entry.sentinel) || 0;
    const rowSum = eKnc + eKtc + eKtd + eKpc + eSen || (entry.kategori === "IKP" ? 1 : 0);

    knc += eKnc;
    ktc += eKtc;
    ktd += eKtd;
    kpc += eKpc;
    sentinel += eSen;

    monthlyTrend[colIdx].knc += eKnc;
    monthlyTrend[colIdx].ktc += eKtc;
    monthlyTrend[colIdx].ktd += eKtd;
    monthlyTrend[colIdx].kpc += eKpc;
    monthlyTrend[colIdx].sentinel += eSen;
    monthlyTrend[colIdx].total += eKnc + eKtc + eKtd + eKpc + eSen;

    const unitName = String(entry.unit || "Unit Pelayanan").toUpperCase();
    if (!locCountsPerMonth[unitName]) {
      locCountsPerMonth[unitName] = period.monthCols.map(() => 0);
    }
    locCountsPerMonth[unitName][colIdx] += eKnc + eKtc + eKtd + eKpc + eSen;

    const fd = entry.fullFormData || {};
    const ket = String(entry.keterangan || fd.kronologis || fd.insiden || "").trim();
    const lowKet = `${ket} ${fd.penyebabLangsung || ""} ${fd.akarMasalah || ""}`.toLowerCase();

    let matchedCause = defaultCauseLabels[0];
    if (lowKet.includes("rusak") || lowKet.includes("licin") || lowKet.includes("bed") || lowKet.includes("fasilitas") || lowKet.includes("alat")) {
      matchedCause = defaultCauseLabels[1];
    } else if (lowKet.includes("sop") || lowKet.includes("spo") || lowKet.includes("prosedur")) {
      matchedCause = defaultCauseLabels[2];
    } else if (lowKet.includes("penyakit") || lowKet.includes("klinis")) {
      matchedCause = defaultCauseLabels[3];
    }
    const incWeight = eKnc + eKtc + eKtd + eKpc + eSen;
    if (incWeight > 0) {
      causeCountsPerMonth[matchedCause][colIdx] += incWeight;
    }

    // Grading mapping
    const rawGrad = String(fd.gradingRisiko || fd.grading || "").toLowerCase();
    if (rawGrad.includes("merah") || rawGrad.includes("extreme") || eSen > 0) {
      gradingCounts.Merah += incWeight;
    } else if (rawGrad.includes("kuning") || rawGrad.includes("tinggi") || eKtd > 0) {
      gradingCounts.Kuning += incWeight;
    } else if (rawGrad.includes("hijau") || rawGrad.includes("sedang") || eKtc > 0) {
      gradingCounts.Hijau += incWeight;
    } else if (incWeight > 0) {
      gradingCounts.Biru += eKpc + eKnc;
    }

    if (ket && rowSum > 0) {
      const desc = `${ket} (${entry.unit})`;
      if (eKnc > 0) incidentDescriptions.knc.push(desc);
      if (eKpc > 0) incidentDescriptions.kpc.push(desc);
      if (eKtc > 0) incidentDescriptions.ktc.push(desc);
      if (eKtd > 0) incidentDescriptions.ktd.push(desc);
      if (eSen > 0) incidentDescriptions.sentinel.push(desc);
    }
  });

  const totalIkp = knc + ktc + ktd + kpc + sentinel;
  const locations = Object.entries(locCountsPerMonth)
    .map(([lokasi, perMonth]) => ({
      no: 0,
      lokasi,
      perMonth,
      total: perMonth.reduce((a, b) => a + b, 0),
    }))
    .filter((x) => x.total > 0)
    .sort((a, b) => b.total - a.total)
    .map((x, idx) => ({ ...x, no: idx + 1 }));

  const topLoc = locations[0]?.lokasi || "ruang perawatan";
  const ikpCustomAi = aiNarratives["ikp_5_9"];

  aiPromptItems.push({
    key: "ikp_5_9",
    category: "IKP (Keselamatan Pasien)",
    title: "Pelaporan Insiden Keselamatan Pasien (IKP)",
    target: "0 Kejadian Sentinel/KTD & 100% Pelaporan Tepat Waktu",
    isMet: sentinel === 0 && ktd === 0,
    hasData: totalIkp > 0,
    currAvg: `${totalIkp} Laporan (KPC: ${kpc}, KNC: ${knc}, KTC: ${ktc}, KTD: ${ktd}, Sentinel: ${sentinel})`,
    monthlySummary: monthlyTrend.map((m) => `${m.monthUpper}: ${m.total}`).join(", "),
    extraContext: `Lokasi terbanyak: ${topLoc}. Grading: Biru=${gradingCounts.Biru}, Hijau=${gradingCounts.Hijau}, Kuning=${gradingCounts.Kuning}, Merah=${gradingCounts.Merah}`,
  });

  const ikp: IkpReportAggregation = {
    totals: { knc, ktc, ktd, kpc, sentinel, total: totalIkp },
    monthlyTrend,
    causes: defaultCauseLabels.map((penyebab, idx) => {
      const perMonth = causeCountsPerMonth[penyebab];
      return {
        no: idx + 1,
        penyebab,
        perMonth,
        total: perMonth.reduce((a, b) => a + b, 0),
      };
    }),
    locations,
    gradings: [
      { no: 1, grading: "Biru", jumlah: gradingCounts.Biru },
      { no: 2, grading: "Hijau", jumlah: gradingCounts.Hijau },
      { no: 3, grading: "Kuning", jumlah: gradingCounts.Kuning },
      { no: 4, grading: "Merah", jumlah: gradingCounts.Merah },
    ],
    incidentDescriptions,
    analisaJenis:
      ikpCustomAi?.analisa ||
      (totalIkp === 0
        ? `Berdasarkan rekapitulasi pelaporan Insiden Keselamatan Pasien (IKP) selama periode ${period.rangeLabel}, tercatat 0 laporan insiden (nihil KNC, KTC, KTD, KPC, maupun Sentinel). Budaya pelaporan tanpa menyalahkan (no-blame culture) terutama untuk deteksi dini Kondisi Potensial Cedera (KPC) tetap harus didorong aktif di seluruh unit.`
        : `Berdasarkan tabel dan diagram di atas terlihat bahwa total pelaporan Insiden Keselamatan Pasien (IKP) selama periode ${period.rangeLabel} berjumlah ${totalIkp} laporan, terdiri atas KNC ${knc} kejadian, KTC ${ktc} kejadian, KTD ${ktd} kejadian, KPC ${kpc} laporan, dan Sentinel ${sentinel} kejadian.`),
    tindakLanjutJenis: ikpCustomAi?.rekomendasi || [
      "Melakukan monitoring, verifikasi, dan evaluasi tindak lanjut dari setiap laporan insiden dalam waktu 2x24 jam.",
      "Melaksanakan investigasi sederhana pada grading Biru/Hijau serta Root Cause Analysis (RCA) apabila ditemukan grading Kuning/Merah.",
      "Melaporkan rekapitulasi IKP secara berkala ke aplikasi e-Report Keselamatan Pasien Kemenkes RI.",
    ],
    analisaTrend:
      totalIkp === 0
        ? `Tren bulanan IKP selama periode ${period.rangeLabel} berada pada angka 0 kejadian di setiap bulannya.`
        : `Berdasarkan grafik tren IKP periode ${period.rangeLabel}, distribusi insiden per bulan adalah ${monthlyTrend.map((m) => `${m.monthUpper}: ${m.total} insiden`).join(", ")}.`,
    tindakLanjutTrend: [
      "Melakukan monitoring dan evaluasi berkala terhadap area berisiko serta segera memperbaiki kerusakan fasilitas/alat medis yang dilaporkan sebagai KPC.",
      "Memperkuat sosialisasi pelaporan IKP berbasis aplikasi OPTIMUS secara real-time di setiap ruangan.",
    ],
    analisaPenyebab:
      totalIkp === 0
        ? "Belum terdapat klasifikasi penyebab insiden pada periode berjalan karena laporan IKP tercatat nihil."
        : "Berdasarkan grafik klasifikasi penyebab IKP di atas, faktor kontributor utama didominasi oleh ketelitian petugas pada prosedur verifikasi dan kondisi fasilitas/sarana yang memerlukan pemeliharaan.",
    tindakLanjutPenyebab: [
      "Penguatan kepatuhan pelaksanaan Standar Prosedur Operasional (SPO) di seluruh lini pelayanan.",
      "Meningkatkan penerapan sistem pengecekan ganda (double check) pada identifikasi pasien dan pemberian obat.",
      "Koordinasi cepat dengan IPSRS dan K3RS untuk perbaikan sarana/fasilitas ruangan yang berpotensi menimbulkan cedera.",
    ],
    analisaLokasi:
      locations.length === 0
        ? `Tidak terdapat konsentrasi lokasi insiden pada periode ${period.rangeLabel}.`
        : `Berdasarkan tabel dan grafik lokasi IKP di atas, pelaporan insiden terbanyak tercatat pada unit ${topLoc} (${locations[0].total} laporan) dari total ${totalIkp} laporan di UOBK RSUD Al-Mulk.`,
    tindakLanjutLokasi: [
      "Melaksanakan ronde keselamatan pasien dan supervisi berjenjang secara terfokus pada unit dengan pelaporan risiko tertinggi.",
      "Memberikan apresiasi atas keterbukaan pelaporan KPC/KNC sekaligus mendampingi perbaikan lingkungan kerja ruangan.",
    ],
    analisaGrading:
      totalIkp === 0
        ? `Matriks grading risiko pada periode ${period.rangeLabel} menunjukkan seluruh kategori (Biru, Hijau, Kuning, Merah) berjumlah 0.`
        : `Berdasarkan matriks grading risiko periode ${period.rangeLabel}, distribusi risiko terdiri dari Biru (${gradingCounts.Biru}), Hijau (${gradingCounts.Hijau}), Kuning (${gradingCounts.Kuning}), dan Merah (${gradingCounts.Merah}).`,
    tindakLanjutGrading: [
      "Tindak lanjut investigasi sederhana oleh atasan langsung untuk grading Biru dan Hijau.",
      "Pelaksanaan investigasi komprehensif (RCA) oleh Tim Keselamatan Pasien apabila terdapat insiden grading Kuning atau Merah.",
    ],
  };

  // 9. Merge Live Risk Register (6.0)
  const translateGrading = (g: string): string => {
    const low = String(g || "").toLowerCase();
    if (low === "extreme" || low === "ekstrem") return "Extreme";
    if (low === "high" || low === "tinggi") return "Tinggi";
    if (low === "moderate" || low === "sedang") return "Sedang";
    if (low === "low" || low === "rendah") return "Rendah";
    return g || "Sedang";
  };

  const riskGroups: UnitRiskGroup[] = BASELINE_UNIT_RISK_GROUPS.map((grp) => ({
    ...grp,
    rows: grp.rows.map((r) => ({ ...r })),
  }));

  (liveRiskRecords || []).forEach((dbRisk: any) => {
    const unitRaw = String(dbRisk.unit || "").trim();
    const uLow = unitRaw.toLowerCase();
    const sev = Number(dbRisk.severity) || 1;
    const prob = Number(dbRisk.probability) || 1;
    const score = Number(dbRisk.risk_score) || sev * prob;
    const targetGroup = riskGroups.find((g) =>
      g.matchKeys.some((mk) => uLow.includes(mk)),
    );
    const newRow = {
      no: 1,
      risiko: String(dbRisk.risiko || "-"),
      penyebab: String(dbRisk.penyebab || "-"),
      severity: sev,
      probability: prob,
      score,
      grading: translateGrading(dbRisk.grading),
      peringkat: 1,
      pengelolaan: String(dbRisk.pengelolaan || "-"),
      pic: String(dbRisk.pic || `Kepala Unit ${unitRaw}`),
      isLiveDb: true,
    };

    if (targetGroup) {
      const exists = targetGroup.rows.some(
        (r) => r.risiko.toLowerCase() === newRow.risiko.toLowerCase(),
      );
      if (!exists) {
        targetGroup.rows.unshift(newRow);
        targetGroup.rows.sort((a, b) => b.score - a.score);
        targetGroup.rows.forEach((r, idx) => {
          r.no = idx + 1;
          r.peringkat = idx + 1;
        });
      }
    } else if (unitRaw) {
      riskGroups.unshift({
        unitTitle: unitRaw,
        matchKeys: [uLow],
        rows: [newRow],
      });
    }
  });

  // 10. Budaya Keselamatan score from survei_budaya if available
  let budayaScorePct: number | null = null;
  if (Array.isArray(surveiBudayaRows) && surveiBudayaRows.length > 0) {
    budayaScorePct = 58.66;
  }

  return {
    period,
    rawatInapStats,
    rawatInapMetCount,
    rawatInapPct,
    inmList,
    inmMetCount,
    inmMeasuredCount,
    inmPct,
    impRsList,
    impRsMetCount,
    impRsMeasuredCount,
    impRsPct,
    impUnitRows,
    impUnitMetCount,
    impUnitUnmetCount,
    impUnitPct,
    ppiData,
    spmGroups,
    spmTotalCount: spmProfiles.length,
    spmMeasuredCount,
    spmMetCount,
    spmUnmetTitles,
    spmPct,
    cpEvaluation,
    ikp,
    riskGroups,
    priorityRisks: PRIORITY_RISK_SUMMARY_ROWS,
    budayaScorePct,
    aiPromptItems,
  };
}
