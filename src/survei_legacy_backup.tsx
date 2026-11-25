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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
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
  X,
  ChevronRight,
  Eye,
  Printer,
  Download,
  Search,
  Filter,
  Calendar,
  Award,
  TrendingUp,
  BarChart2,
  Clock,
  Briefcase,
  UserCheck,
  Users,
  Maximize2,
  Minimize2
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
    name: "Keterbukaan dalam komunikasi",
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
    name: "Respon non hukuman (nonpunitive) terhadap kesalahan",
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

const QUESTIONS_BAGIAN_A = [
  "Karyawan di unit kami saling mendukung",
  "Unit kami memiliki cukup staf untuk menangani beban kerja yang berlebih",
  "Bila unit kami ada pekerjaan yang harus dilakukan dalam waktu cepat, maka karyawan di unit kami bekerja bersama-sama sebagai tim",
  "Petugas di unit kami saling menghargai",
  "Karyawan di unit kami bekerja dengan waktu yang lebih lama dari normal untuk perawatan pasien",
  "Unit kami secara aktif melakukan kegiatan untuk meningkatkan keselamatan pasien",
  "Unit kami banyak menggunakan tenaga melebihi normal/tambahan untuk kegiatan pelayanan pasien",
  "Karyawan unit kami sering merasa bahwa kesalahan yang mereka lakukan digunakan untuk menyalahkan mereka",
  "Di unit kami, kesalahan yang terjadi digunakan untuk membuat perubahan kearah yang positif",
  "Hanya karena kebetulan saja bila insiden yang lebih serius tidak terjadi di unit kami",
  "Bila salah satu area di unit kami sangat sibuk, maka area lain dari unit kami akan membantu",
  "Bila unit kami melaporkan suatu insiden, yang dibicarakan adalah pelakunya bukan masalahnya",
  "Sesudah membuat perubahan-perubahan untuk meningkatkan Keselamatan Pasien, kita lakukan evaluasi tentang efektivitasnya",
  "Kami bekerja seolah-olah dalam keadaan “krisis”, berusaha bertindak berlebihan dan terlalu cepat",
  "Unit kami tidak pernah mengorbankan keselamatan pasien untuk menyelesaikan pekerjaan yang lebih banyak",
  "Karyawan merasa khawatir kesalahan yang mereka buat akan dicatat di berkas pribadi mereka",
  "Di unit kami banyak masalah keselamatan pasien",
  "Prosedur dan system di unit kami sudah baik dalam mencegah terjadinya error"
];

const QUESTIONS_BAGIAN_B = [
  "Manajer/supervisor di unit kami memberi pujian jika melihat pekerjaan diselesaikan sesuai prosedur keselamatan pasien yang berlaku",
  "Manajer/supervisor dengan serius mempertimbangkan masukan staf untuk meningkatkan keselamatan pasien",
  "Bila beban kerja tinggi, manajer/supervisor kami meminta kami bekerja cepat meski dengan mengambil jalan pintas",
  "Manajer/supervisor kami selalu mengabaikan masalah Keselamatan Pasien yang terjadi berulang kali di unit kami"
];

const QUESTIONS_BAGIAN_C = [
  "Karyawan di unit kami mendapat umpan balik mengenai perubahan yang dilaksanakan atas dasar hasil laporan insiden",
  "Karyawan di unit kami bebas berbicara jika melihat sesuatu yang dapat berdampak negatif pada pelayanan pasien",
  "Karyawan di unit kami mendapat informasi mengenai insiden yang terjadi di unit ini",
  "Karyawan di unit kami merasa bebas untuk mempertanyakan keputusan atau tindakan yang diambil oleh atasannya",
  "Di unit kami, didiskusikan cara untuk mencegah agar insiden tidak terulang kembali",
  "Karyawan di unit kami takut bertanya jika terjadi hal yang kelihatannya tidak benar"
];

const QUESTIONS_BAGIAN_D = [
  "Bila terjadi kesalahan, tetapi sempat diketahui dan dikoreksi sebelum berdampak pada pasien, seberapa sering hal ini dilaporkan?",
  "Bila terjadi kesalahan, tetapi tidak berpotensi mencenderai pasien, seberapa sering hal ini dilaporkan?",
  "Bila terjadi kesalahan, yang dapat mencederai pasien tetapi ternyata tidak terjadi cedera, seberapa sering hal ini dilaporkan?"
];

const QUESTIONS_BAGIAN_F = [
  "Manajemen rumah sakit membuat suasana kerja yang mendukung keselamatan pasien",
  "Antar Unit di RS kami tidak saling berkoordinasi dengan baik",
  "Bila terjadi pemindahan pasien dari unit satu ke unit lain, pasti menimbulkan masalah terkait dengan informasi pasien",
  "Terdapat kerjasama yang baik antar unit di RS yang dibutuhkan untuk menyelesaikan pekerjaan bersama",
  "Informasi penting mengenai pelayanan pasien sering hilang saat pergantian jaga (shift)",
  "Sering kali tidak menyenangkan bekerja dengan staf dari unit lain di RS ini",
  "Masalah sering timbul dalam pertukaran informasi antar unit di RS",
  "Tindakan manajemen RS menunjukkan bahwa keselamatan pasien merupakan prioritas utama",
  "Manajemen RS kelihatan tertarik pada Keselamatan Pasien hanya sesudah terjadi KTD (Kejadian yang Tidak Diharapkan)",
  "Unit-unit di RS bekerjasama dengan baik untuk memberikan pelayanan yang terbaik untuk pasien",
  "Pergantian shift merupakan masalah bagi pasien-pasien di RS ini"
];

function getQuestionText(section: string, key: string): string {
  const parts = key.split("_");
  const index = parseInt(parts[parts.length - 1]);
  if (isNaN(index)) return "Pertanyaan tidak dikenal";
  
  if (section === "bagian_a") return QUESTIONS_BAGIAN_A[index] || "Pertanyaan tidak dikenal";
  if (section === "bagian_b") return QUESTIONS_BAGIAN_B[index] || "Pertanyaan tidak dikenal";
  if (section === "bagian_c") return QUESTIONS_BAGIAN_C[index] || "Pertanyaan tidak dikenal";
  if (section === "bagian_d") return QUESTIONS_BAGIAN_D[index] || "Pertanyaan tidak dikenal";
  if (section === "bagian_f") return QUESTIONS_BAGIAN_F[index] || "Pertanyaan tidak dikenal";
  return "Pertanyaan tidak dikenal";
}

function getResponseCategory(val: string | undefined, isReverse: boolean): "Positif" | "Netral" | "Negatif" {
  if (!val) return "Netral";
  const normalized = val.trim().toLowerCase();
  
  const isPos = isPositiveResponse(val, isReverse);
  if (isPos) return "Positif";
  
  if (normalized === "kadang-kadang" || normalized === "kadang kadang") {
    return "Netral";
  }
  
  return "Negatif";
}

function getResponseValue(val: string | undefined, isReverse: boolean): number {
  if (!val) return 0;
  const normalized = val.trim().toLowerCase();
  let baseValue = 3; // default neutral
  
  if (normalized === "sangat tidak setuju" || normalized === "tidak pernah") {
    baseValue = 1;
  } else if (normalized === "tidak setuju" || normalized === "jarang sekali") {
    baseValue = 2;
  } else if (normalized === "kadang-kadang" || normalized === "kadang kadang") {
    baseValue = 3;
  } else if (normalized === "setuju" || normalized === "sering") {
    baseValue = 4;
  } else if (normalized === "sangat setuju" || normalized === "selalu") {
    baseValue = 5;
  }
  
  if (isReverse) {
    return 6 - baseValue; // reverses 1<->5, 2<->4, 3<->3
  }
  return baseValue;
}

const DIMENSION_RECOMMENDATIONS: Record<number, string[]> = {
  1: [
    "Sosialisasikan budaya 'Speak Up' kepada seluruh staf agar berani berbicara demi keselamatan pasien tanpa takut disalahkan.",
    "Lakukan briefing keselamatan harian (safety huddle) sebelum memulai pelayanan di setiap unit.",
    "Berikan penghargaan kepada staf atau unit kerja yang secara aktif mengidentifikasi potensi bahaya."
  ],
  2: [
    "Bagikan laporan ringkasan perbaikan keselamatan pasien secara berkala sebagai bentuk akuntabilitas.",
    "Lakukan Focus Group Discussion (FGD) rutin untuk mendiskusikan tindak lanjut kasus insiden.",
    "Pasang infografis pembelajaran kasus insiden di area strategis khusus staf."
  ],
  3: [
    "Sederhanakan alur pelaporan insiden keselamatan pasien agar menghemat waktu pengisian staf.",
    "Berikan pemahaman berkala tentang perbedaan kategori insiden (KTD, KNC, KTC, KPC).",
    "Fasilitasi pelaporan insiden online yang mudah diakses kapan saja dari unit kerja."
  ],
  4: [
    "Terapkan secara ketat standar serah terima pasien berbasis komunikasi efektif seperti metode SBAR.",
    "Lakukan audit kepatuhan pengisian berkas transfer atau operan pasien secara rutin.",
    "Sediakan waktu tenang khusus (quiet time) selama pergantian shift agar konsentrasi terjaga."
  ],
  5: [
    "Jadwalkan ronde keselamatan pasien (patient safety walkround) berkala oleh direksi dan manajemen.",
    "Pastikan alokasi anggaran yang memadai untuk pemenuhan sarana pendukung keselamatan pasien.",
    "Libatkan komite mutu dan keselamatan pasien dalam penyusunan kebijakan operasional utama."
  ],
  6: [
    "Deklarasikan komitmen rumah sakit terhadap 'Just Culture' (budaya non-punitive/bebas hukuman).",
    "Fokuskan investigasi insiden pada perbaikan alur sistem, bukan mencari kesalahan personal.",
    "Berikan edukasi kepada seluruh pimpinan unit tentang cara merespons laporan error secara konstruktif."
  ],
  7: [
    "Evaluasi dampak dari perubahan sistem atau SOP baru yang diimplementasikan pasca insiden.",
    "Sediakan pelatihan manajemen risiko klinis secara berkesinambungan bagi semua staf.",
    "Gunakan rapat pleno bulanan unit sebagai sarana pembelajaran dari insiden yang pernah terjadi."
  ],
  8: [
    "Lakukan survei budaya keselamatan secara berkala untuk memonitor tren perbaikan di rumah sakit.",
    "Masukkan indikator keselamatan pasien sebagai salah satu komponen utama penilaian kinerja tahunan.",
    "Tingkatkan kolaborasi fungsional antara Komite Mutu, PPI, dan K3RS."
  ],
  9: [
    "Evaluasi beban kerja (workload analysis) secara berkala di unit-unit dengan tingkat hunian tinggi.",
    "Terapkan penjadwalan shift kerja yang sehat untuk mencegah kelelahan fisik dan mental staf.",
    "Bantu kurangi beban administratif perawat dengan optimalisasi sistem informasi rumah sakit."
  ],
  10: [
    "Berikan pembekalan kepemimpinan keselamatan pasien (patient safety leadership) bagi kepala ruangan.",
    "Apresiasi staf yang konsisten patuh terhadap SOP pelayanan oleh kepala ruangan secara langsung.",
    "Lakukan mentoring berkala bagi staf yang memerlukan penguatan kepatuhan prosedur klinis."
  ],
  11: [
    "Selenggarakan pertemuan koordinasi rutin antar unit pelayanan untuk meminimalisir sekat birokrasi.",
    "Integrasikan rekam medis elektronik rumah sakit agar transfer data pasien berjalan instan dan akurat.",
    "Adakan kegiatan team-building atau simulasi lintas unit untuk memupuk kebersamaan staf."
  ],
  12: [
    "Adakan sesi refleksi berkala di internal unit untuk saling mendukung dan menjaga kekompakan.",
    "Distribusikan penugasan pelayanan secara adil, proporsional, dan transparan sesuai kompetensi.",
    "Sediakan pelatihan komunikasi interprofesional untuk mengurangi risiko kesalahpahaman kerja tim."
  ]
};

function getRecommendations(id: number, positive: number): string[] {
  const base = DIMENSION_RECOMMENDATIONS[id] || [
    "Tingkatkan kepatuhan penerapan SOP keselamatan pasien secara konsisten.",
    "Lakukan evaluasi berkala mengenai pemahaman staf terhadap prosedur keselamatan.",
    "Gunakan data survei ini untuk merumuskan prioritas peningkatan mutu unit kerja."
  ];
  
  const additional: string[] = [];
  if (positive < 50) {
    additional.push("Segera laksanakan lokakarya (workshop) evaluasi kritis bagi seluruh staf di unit kerja.");
    additional.push("Mintalah pendampingan khusus dari Komite Mutu dan Keselamatan Pasien untuk mendesain ulang sistem kerja.");
  } else if (positive < 75) {
    additional.push("Susun rencana aksi peningkatan berkala (Plan-Do-Study-Act) dengan pemantauan setiap bulan.");
  }
  
  return [...base, ...additional];
}

function generateAnalysis(dimensionName: string, positive: number, neutral: number, negative: number): string {
  const roundedPos = Math.round(positive);
  const roundedNeu = Math.round(neutral);
  const roundedNeg = Math.round(negative);

  if (positive >= 75) {
    return `Hasil survei untuk Dimensi "${dimensionName}" menunjukkan tingkat pemahaman yang sangat kuat dengan persentase respon positif mencapai ${roundedPos}%. Mayoritas responden merasa lingkungan kerja telah mendukung standar keselamatan pasien secara optimal, dengan hanya ${roundedNeu}% respon netral dan ${roundedNeg}% respon negatif. Hal ini menandakan budaya kerja yang sangat solid, kolaboratif, dan kondusif dalam menjaga keselamatan pasien di rumah sakit. Pertahankan pencapaian ini dan jadikan praktik baik di dimensi ini sebagai acuan pembelajaran bagi unit atau dimensi lainnya.`;
  } else if (positive >= 50) {
    return `Hasil survei untuk Dimensi "${dimensionName}" berada dalam kategori sedang dengan persentase respon positif sebesar ${roundedPos}%, respon netral ${roundedNeu}%, dan respon negatif ${roundedNeg}%. Meskipun sebagian besar elemen keselamatan telah dipahami, masih terdapat area abu-abu atau keraguan di kalangan staf yang ditunjukkan oleh tingginya respon netral atau negatif. Diperlukan sosialisasi lebih lanjut, penyegaran SOP, serta peningkatan diskusi interaktif guna mengubah persepsi netral menjadi respon positif yang lebih mantap demi peningkatan keselamatan pasien.`;
  } else {
    return `Peringatan: Hasil survei untuk Dimensi "${dimensionName}" menunjukkan kategori lemah / kritis dengan respon positif hanya sebesar ${roundedPos}%, sementara respon netral sebesar ${roundedNeu}% dan respon negatif mencapai ${roundedNeg}%. Tingginya respon negatif ini menandakan adanya kendala atau hambatan nyata dalam sistem kerja sehari-hari yang berpotensi membahayakan keselamatan pasien. Komite Mutu dan Keselamatan Pasien direkomendasikan untuk segera melakukan investigasi mendalam, merancang ulang prosedur operasional, dan memberikan pembekalan intensif demi menekan risiko terjadinya insiden keselamatan pasien di rumah sakit.`;
  }
}

function mapLamaKerja(val: string | undefined): string {
  if (!val) return "Tidak Diisi";
  const normalized = val.trim().toLowerCase();
  if (normalized.includes("kurang") || normalized.includes("<")) {
    return "< 1 Tahun";
  }
  if (normalized.includes("1 - 5") || normalized.includes("1-5") || normalized.includes("1 – 5") || normalized.includes("1 -5")) {
    return "1–5 Tahun";
  }
  if (normalized.includes("6 - 10") || normalized.includes("6-10") || normalized.includes("6 – 10")) {
    return "6–10 Tahun";
  }
  if (normalized.includes("11 - 15") || normalized.includes("11-15") || normalized.includes("11 – 15")) {
    return "11–15 Tahun";
  }
  if (normalized.includes("16 - 20") || normalized.includes("16-20") || normalized.includes("16 – 20")) {
    return "16–20 Tahun";
  }
  if (normalized.includes("21") || normalized.includes(">") || normalized.includes("lebih") || normalized.includes("20")) {
    return "> 20 Tahun";
  }
  return val;
}

function mapJamKerja(val: string | undefined): string {
  if (!val) return "Tidak Diisi";
  const normalized = val.trim().toLowerCase();
  if (normalized.includes("kurang") || normalized.includes("<")) {
    return "<20 Jam";
  }
  if (normalized.includes("20 - 39") || normalized.includes("20-39") || normalized.includes("20 – 39")) {
    return "20–39 Jam";
  }
  if (normalized.includes("40") || normalized.includes(">") || normalized.includes("lebih")) {
    return "> 40 Jam";
  }
  return val;
}

function mapBerhubunganPasien(val: string | undefined): string {
  if (!val) return "Tidak Diisi";
  const normalized = val.trim().toLowerCase();
  if (normalized === "ya") return "Ya";
  if (normalized === "tidak") return "Tidak";
  return val;
}

function mapPosisiJabatan(val: string | undefined): string {
  if (!val) return "Tidak Diisi";
  const v = val.trim();
  const normalized = v.toLowerCase();
  if (normalized === "dokter") return "Dokter";
  if (normalized === "perawat") return "Perawat";
  if (normalized === "bidan") return "Bidan";
  if (normalized === "apoteker") return "Apoteker";
  if (
    normalized.includes("asisten") || 
    normalized.includes("analis") || 
    normalized.includes("radiografer") || 
    normalized.includes("penunjang") ||
    normalized.includes("laboratorium")
  ) {
    return "Tenaga Penunjang";
  }
  if (normalized.includes("manajemen")) return "Manajemen";
  if (normalized.includes("administrasi") || normalized.includes("staff adm")) return "Staff Administrasi";
  if (normalized.includes("lainnya") || normalized.includes("nakes")) return "Nakes Lainnya";
  return v;
}

const PALETTE_RS = ["#10b981", "#34d399", "#6ee7b7", "#a7f3d0", "#059669", "#047857"];
const PALETTE_UNIT = ["#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe", "#2563eb", "#1d4ed8"];
const PALETTE_PASIEN = ["#10b981", "#ef4444"];
const PALETTE_JABATAN = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#64748b", "#a855f7"];
const PALETTE_JAM = ["#10b981", "#f59e0b", "#ef4444"];
const PALETTE_PROFESI = ["#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe", "#7c3aed", "#6d28d9"];

const generateDemographicNarrative = (title: string, data: { name: string; value: number }[], total: number) => {
  if (total === 0 || data.length === 0 || data.every(x => x.value === 0)) {
    return "Belum ada data responden untuk menghasilkan analisis otomatis.";
  }
  
  const sortedDesc = [...data].sort((a, b) => b.value - a.value);
  const sortedAscNonZero = [...data].filter(x => x.value > 0).sort((a, b) => a.value - b.value);
  
  const largest = sortedDesc[0];
  const smallest = sortedAscNonZero[0] || sortedDesc[sortedDesc.length - 1];
  
  const largestPct = total > 0 ? Math.round((largest.value / total) * 100) : 0;
  const smallestPct = total > 0 ? Math.round((smallest.value / total) * 100) : 0;
  
  if (title === "Lama Kerja di Rumah Sakit") {
    return `Berdasarkan hasil survei terhadap ${total} responden, sebagian besar responden memiliki lama kerja di RS ${largest.name} sebanyak ${largestPct}% (${largest.value} responden), sedangkan kategori paling sedikit adalah ${smallest.name} sebanyak ${smallestPct}% (${smallest.value} responden). Hal ini menunjukkan bahwa mayoritas responden merupakan pegawai dengan pengalaman kerja yang sudah cukup untuk memahami budaya keselamatan pasien di rumah sakit.`;
  }
  if (title === "Lama Kerja di Unit") {
    return `Dari total ${total} responden yang berpartisipasi, kelompok responden terbanyak berdasarkan lama kerja di unit adalah ${largest.name} dengan proporsi ${largestPct}% (${largest.value} responden). Kategori paling rendah adalah ${smallest.name} dengan ${smallestPct}% (${smallest.value} responden). Masa kerja di unit yang cukup lama membantu meningkatkan pemahaman prosedur internal dan kebiasaan kerja yang mengutamakan keselamatan pasien.`;
  }
  if (title === "Profesi Berhubungan Langsung dengan Pasien") {
    const yaItem = data.find(x => x.name === "Ya");
    const yaPct = yaItem ? Math.round((yaItem.value / total) * 100) : 0;
    const yaVal = yaItem ? yaItem.value : 0;
    
    if (yaPct > 50) {
      return `Sebagian besar responden (${yaPct}% / ${yaVal} responden) merupakan tenaga yang berhubungan langsung dengan pasien, sehingga hasil survei mencerminkan kondisi budaya keselamatan pasien dari petugas pelayanan langsung secara akurat di rumah sakit.`;
    } else {
      return `Berdasarkan data, sekitar ${yaPct}% (${yaVal} responden) berhubungan langsung dengan pasien. Meskipun banyak yang tidak kontak langsung, peran dari seluruh staf sangat krusial dalam menciptakan sinergi budaya keselamatan pasien yang menyeluruh.`;
    }
  }
  if (title === "Posisi / Jabatan") {
    const secondLargest = sortedDesc[1];
    let narrative = `Berdasarkan hasil survei, responden terbanyak berasal dari profesi ${largest.name} sebanyak ${largestPct}% (${largest.value} responden)`;
    if (secondLargest && secondLargest.value > 0) {
      const secondPct = Math.round((secondLargest.value / total) * 100);
      narrative += `, diikuti oleh ${secondLargest.name} sebanyak ${secondPct}%`;
    }
    narrative += `, sedangkan profesi dengan jumlah paling sedikit adalah ${smallest.name} sebanyak ${smallestPct}% (${smallest.value} responden).`;
    return narrative;
  }
  if (title === "Jam Kerja Dalam Seminggu") {
    return `Analisis jam kerja mingguan dari ${total} responden menunjukkan bahwa mayoritas bekerja dalam kategori ${largest.name} yaitu sebanyak ${largestPct}% (${largest.value} responden). Pengaturan jam kerja yang optimal dan tidak berlebihan sangat penting dalam meminimalisir burnout serta kesalahan kesalahan medis yang tidak disengaja.`;
  }
  if (title === "Lama Kerja Sesuai Profesi") {
    return `Distribusi masa kerja sesuai profesi menunjukkan bahwa mayoritas responden telah berpraktik selama ${largest.name} dengan persentase mencapai ${largestPct}% (${largest.value} responden). Pengalaman profesi yang matang merupakan modal berharga bagi rumah sakit dalam memitigasi risiko klinis secara proaktif.`;
  }
  return `Hasil pengolahan data menunjukkan kategori tertinggi adalah ${largest.name} (${largestPct}%) dan terendah adalah ${smallest.name} (${smallestPct}%).`;
};

export default function SurveiBudaya() {
  const [view, setView] = useState<"dashboard" | "form">("dashboard");
  const [surveys, setSurveys] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const [showSqlGuide, setShowSqlGuide] = useState<boolean>(false);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [showResetPassword, setShowResetPassword] = useState<boolean>(false);
  const [resetPasswordInput, setResetPasswordInput] = useState<string>("");
  const [resetPasswordError, setResetPasswordError] = useState<string | null>(null);
  const [showResetSuccess, setShowResetSuccess] = useState<boolean>(false);

  // States for selected dimension details
  const [selectedDimensionId, setSelectedDimensionId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterUnit, setFilterUnit] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  const [hiddenCategories, setHiddenCategories] = useState<Record<string, string[]>>({});
  const [fullscreenChartId, setFullscreenChartId] = useState<string | null>(null);

  const toggleCategoryVisibility = (chartKey: string, categoryName: string) => {
    setHiddenCategories(prev => {
      const current = prev[chartKey] || [];
      const updated = current.includes(categoryName)
        ? current.filter(c => c !== categoryName)
        : [...current, categoryName];
      return { ...prev, [chartKey]: updated };
    });
  };

  const respondentProfileStats = useMemo(() => {
    const lamaKerjaRS: Record<string, number> = {
      "< 1 Tahun": 0,
      "1–5 Tahun": 0,
      "6–10 Tahun": 0,
      "11–15 Tahun": 0,
      "16–20 Tahun": 0,
      "> 20 Tahun": 0,
    };

    const lamaKerjaUnit: Record<string, number> = {
      "< 1 Tahun": 0,
      "1–5 Tahun": 0,
      "6–10 Tahun": 0,
      "11–15 Tahun": 0,
      "16–20 Tahun": 0,
      "> 20 Tahun": 0,
    };

    const hubunganPasien: Record<string, number> = {
      "Ya": 0,
      "Tidak": 0,
    };

    const posisiJabatan: Record<string, number> = {
      "Dokter": 0,
      "Perawat": 0,
      "Bidan": 0,
      "Apoteker": 0,
      "Tenaga Penunjang": 0,
      "Manajemen": 0,
      "Staff Administrasi": 0,
      "Nakes Lainnya": 0,
    };

    const jamKerja: Record<string, number> = {
      "<20 Jam": 0,
      "20–39 Jam": 0,
      "> 40 Jam": 0,
    };

    const lamaKerjaProfesi: Record<string, number> = {
      "< 1 Tahun": 0,
      "1–5 Tahun": 0,
      "6–10 Tahun": 0,
      "11–15 Tahun": 0,
      "16–20 Tahun": 0,
      "> 20 Tahun": 0,
    };

    let totalResponders = 0;

    filteredSurveys.forEach(survey => {
      const h = survey.bagian_h || {};
      totalResponders++;

      // 1. Lama Kerja RS (h_0)
      const rsVal = mapLamaKerja(h.h_0);
      if (rsVal !== "Tidak Diisi") {
        if (lamaKerjaRS[rsVal] !== undefined) lamaKerjaRS[rsVal]++;
        else lamaKerjaRS[rsVal] = 1;
      }

      // 2. Lama Kerja Unit (h_1)
      const unitVal = mapLamaKerja(h.h_1);
      if (unitVal !== "Tidak Diisi") {
        if (lamaKerjaUnit[unitVal] !== undefined) lamaKerjaUnit[unitVal]++;
        else lamaKerjaUnit[unitVal] = 1;
      }

      // 3. Berhubungan Pasien (h_4)
      const hubVal = mapBerhubunganPasien(h.h_4);
      if (hubVal !== "Tidak Diisi") {
        if (hubunganPasien[hubVal] !== undefined) hubunganPasien[hubVal]++;
        else hubunganPasien[hubVal] = 1;
      }

      // 4. Posisi Jabatan (h_3)
      const posVal = mapPosisiJabatan(h.h_3);
      if (posVal !== "Tidak Diisi") {
        if (posisiJabatan[posVal] !== undefined) posisiJabatan[posVal]++;
        else posisiJabatan[posVal] = 1;
      }

      // 5. Jam Kerja (h_2)
      const jamVal = mapJamKerja(h.h_2);
      if (jamVal !== "Tidak Diisi") {
        if (jamKerja[jamVal] !== undefined) jamKerja[jamVal]++;
        else jamKerja[jamVal] = 1;
      }

      // 6. Lama Kerja Profesi (h_5)
      const profVal = mapLamaKerja(h.h_5);
      if (profVal !== "Tidak Diisi") {
        if (lamaKerjaProfesi[profVal] !== undefined) lamaKerjaProfesi[profVal]++;
        else lamaKerjaProfesi[profVal] = 1;
      }
    });

    const formatChartData = (obj: Record<string, number>) => {
      return Object.entries(obj).map(([name, value]) => ({ name, value }));
    };

    return {
      total: totalResponders,
      lamaKerjaRS: formatChartData(lamaKerjaRS),
      lamaKerjaUnit: formatChartData(lamaKerjaUnit),
      hubunganPasien: formatChartData(hubunganPasien),
      posisiJabatan: formatChartData(posisiJabatan),
      jamKerja: formatChartData(jamKerja),
      lamaKerjaProfesi: formatChartData(lamaKerjaProfesi),
    };
  }, [filteredSurveys]);

  // Memoized detailed dimension analysis calculations
  const dimensionDetailData = useMemo(() => {
    if (selectedDimensionId === null) return null;
    const dim = DIMENSION_MAPPING.find(d => d.id === selectedDimensionId);
    if (!dim) return null;
    
    // 1. Calculate question-by-question stats
    const questionStats = dim.items.map(item => {
      let total = 0;
      let positive = 0;
      let neutral = 0;
      let negative = 0;
      
      filteredSurveys.forEach(survey => {
        const sectionData = survey[item.section];
        if (sectionData) {
          const val = sectionData[item.key];
          if (val && val.trim() !== "") {
            total++;
            const category = getResponseCategory(val, item.isReverse);
            if (category === "Positif") positive++;
            else if (category === "Netral") neutral++;
            else negative++;
          }
        }
      });
      
      return {
        key: item.key.toUpperCase().replace("_", ""),
        section: item.section,
        text: getQuestionText(item.section, item.key),
        isReverse: item.isReverse,
        total,
        positive: total > 0 ? (positive / total) * 100 : 0,
        neutral: total > 0 ? (neutral / total) * 100 : 0,
        negative: total > 0 ? (negative / total) * 100 : 0,
        positiveCount: positive,
        neutralCount: neutral,
        negativeCount: negative,
      };
    });
    
    // 2. Aggregate overall stats for this dimension
    let totalResponses = 0;
    let sumPositive = 0;
    let sumNeutral = 0;
    let sumNegative = 0;
    let totalScoreValueSum = 0;
    let totalScoreValueCount = 0;
    
    questionStats.forEach(q => {
      totalResponses += q.total;
      sumPositive += q.positiveCount;
      sumNeutral += q.neutralCount;
      sumNegative += q.negativeCount;
    });
    
    // 3. Build respondent history rows
    const respondentRows: any[] = [];
    filteredSurveys.forEach((survey, sIdx) => {
      const dateStr = survey.created_at
        ? new Date(survey.created_at).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric"
          })
        : "Penyimpanan Lokal";
        
      const unit = survey.unit_kerja || "Unit Tidak Diketahui";
      const respId = survey.id ? `Resp-${survey.id.slice(0, 5).toUpperCase()}` : `Resp-L${sIdx + 1}`;
      
      dim.items.forEach(item => {
        const sectionData = survey[item.section];
        if (sectionData) {
          const val = sectionData[item.key];
          if (val && val.trim() !== "") {
            const cat = getResponseCategory(val, item.isReverse);
            const valNum = getResponseValue(val, item.isReverse);
            const questionText = getQuestionText(item.section, item.key);
            
            totalScoreValueSum += valNum;
            totalScoreValueCount++;
            
            respondentRows.push({
              id: `${survey.id || sIdx}-${item.key}`,
              dateStr,
              rawDate: survey.created_at ? new Date(survey.created_at) : new Date(0),
              unit,
              respId,
              questionKey: item.key.toUpperCase().replace("_", ""),
              questionText,
              answer: val,
              category: cat,
              value: valNum,
            });
          }
        }
      });
    });
    
    const uniqueRespondentsCount = new Set(filteredSurveys.map(s => s.id || s.created_at)).size;
    
    const overallPositivePercent = totalResponses > 0 ? (sumPositive / totalResponses) * 100 : 0;
    const overallNeutralPercent = totalResponses > 0 ? (sumNeutral / totalResponses) * 100 : 0;
    const overallNegativePercent = totalResponses > 0 ? (sumNegative / totalResponses) * 100 : 0;
    
    // Average Likert score
    const averageScoreValue = totalScoreValueCount > 0 ? totalScoreValueSum / totalScoreValueCount : 0;
    const dimensionScorePercent = averageScoreValue > 0 ? ((averageScoreValue - 1) / 4) * 100 : 0;
    
    let cultureCategory: "Kuat / Baik" | "Sedang" | "Lemah / Kritis" = "Sedang";
    if (overallPositivePercent >= 75) cultureCategory = "Kuat / Baik";
    else if (overallPositivePercent < 50) cultureCategory = "Lemah / Kritis";
    
    const autoAnalysis = generateAnalysis(dim.name, overallPositivePercent, overallNeutralPercent, overallNegativePercent);
    const recommendations = getRecommendations(dim.id, overallPositivePercent);
    
    return {
      dim,
      questionStats,
      respondentRows,
      uniqueRespondentsCount,
      totalResponses,
      overallPositivePercent,
      overallNeutralPercent,
      overallNegativePercent,
      dimensionScorePercent,
      averageScoreValue,
      cultureCategory,
      autoAnalysis,
      recommendations,
    };
  }, [selectedDimensionId, filteredSurveys]);

  const processedRows = useMemo(() => {
    if (!dimensionDetailData) return [];
    return dimensionDetailData.respondentRows.filter(row => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || 
        row.unit.toLowerCase().includes(q) ||
        row.respId.toLowerCase().includes(q) ||
        row.questionText.toLowerCase().includes(q) ||
        row.answer.toLowerCase().includes(q);
        
      const matchesUnit = !filterUnit || row.unit === filterUnit;
      
      let matchesMonth = true;
      if (filterMonth !== "") {
        const rowMonth = row.rawDate.getMonth();
        matchesMonth = rowMonth === parseInt(filterMonth);
      }
      
      return matchesSearch && matchesUnit && matchesMonth;
    });
  }, [dimensionDetailData, searchQuery, filterUnit, filterMonth]);

  const uniqueUnitsForFilter = useMemo(() => {
    if (!dimensionDetailData) return [];
    const units = new Set<string>();
    dimensionDetailData.respondentRows.forEach(r => units.add(r.unit));
    return Array.from(units);
  }, [dimensionDetailData]);

  const totalPages = Math.ceil(processedRows.length / itemsPerPage);
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return processedRows.slice(start, start + itemsPerPage);
  }, [processedRows, currentPage, itemsPerPage]);

  const handleExportCSV = () => {
    if (!dimensionDetailData) return;
    const dimensionName = dimensionDetailData.dim.name;
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent += "No;Tanggal Pengisian;Unit;Kode Responden;Pertanyaan;Jawaban;Nilai;Status\n";
    
    processedRows.forEach((r, idx) => {
      const cleanQ = r.questionText.replace(/;/g, ",").replace(/\n/g, " ");
      const cleanA = r.answer.replace(/;/g, ",").replace(/\n/g, " ");
      csvContent += `${idx + 1};${r.dateStr};${r.unit};${r.respId};${cleanQ};${cleanA};${r.value};${r.category}\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Riwayat_Dimensi_${dimensionName.replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };



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

  const handleConfirmResetStep = () => {
    setShowResetConfirm(false);
    setShowResetPassword(true);
    setResetPasswordInput("");
    setResetPasswordError(null);
  };

  const handleExecuteReset = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (resetPasswordInput !== "230489") {
      setResetPasswordError("Password salah! Silakan coba lagi.");
      return;
    }

    setLoading(true);
    setShowResetPassword(false);
    
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
      
      setShowResetSuccess(true);
      fetchSurveys();
    } catch (err: any) {
      setShowResetSuccess(true);
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
          <h1 className="font-black text-[#10a37f] tracking-tight" style={{ fontSize: "32px" }}>
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
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center justify-center bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 p-2.5 rounded-xl font-bold transition-all shadow-xs w-10 h-10 shrink-0 cursor-pointer"
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
            <h3 className="text-[25px] font-black text-[#10a37f] tracking-tight uppercase border-b pb-4 mb-5 text-center">
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
                  {computedDimensions.map((dim, idx) => {
                    const roundedScore = Math.round(dim.score);
                    let scoreClass = "text-rose-700 bg-rose-50/30";
                    if (roundedScore > 75) {
                      scoreClass = "text-emerald-700 bg-emerald-50/30";
                    } else if (roundedScore >= 50) {
                      scoreClass = "text-amber-700 bg-amber-50/30";
                    }
                    return (
                      <tr key={dim.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 text-center font-bold text-gray-500 border-r border-gray-200">{idx + 1}</td>
                        <td 
                          className="p-4 font-semibold text-slate-800 hover:text-[#10a37f] border-r border-gray-200 transition-colors duration-200 cursor-pointer group"
                          onClick={() => {
                            setSelectedDimensionId(dim.id);
                            setSearchQuery("");
                            setFilterUnit("");
                            setFilterMonth("");
                            setCurrentPage(1);
                          }}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="group-hover:translate-x-1.5 transition-transform duration-200">{dim.name}</span>
                            <span className="text-[#10a37f] opacity-0 group-hover:opacity-100 transition-all duration-200 shrink-0 transform translate-x-1 group-hover:translate-x-0">
                              <Eye size={16} className="inline-block" />
                            </span>
                          </div>
                        </td>
                        <td className={`p-4 text-center font-black ${scoreClass}`}>
                          {roundedScore}%
                        </td>
                      </tr>
                    );
                  })}
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
                <li className="flex items-center justify-center gap-2 text-emerald-700 bg-emerald-50 px-3 py-2.5 rounded-xl border border-emerald-100 text-center">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>{counts.baik} dimensi baik (&gt;75%)</span>
                </li>
                <li className="flex items-center justify-center gap-2 text-amber-700 bg-amber-50 px-3 py-2.5 rounded-xl border border-amber-100 text-center">
                  <AlertTriangle size={16} className="text-amber-500 shrink-0" />
                  <span>{counts.sedang} dimensi sedang (50-75%)</span>
                </li>
                <li className="flex items-center justify-center gap-2 text-rose-700 bg-rose-50 px-3 py-2.5 rounded-xl border border-rose-100 text-center">
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

          {/* DASHBOARD GRAFIK PROFIL RESPONDEN SECTION */}
          <div className="bg-[#10a37f]/5/30 backdrop-blur-md rounded-3xl border border-gray-200/60 p-5 md:p-8 space-y-6 w-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200/80 pb-5">
              <div>
                <h2 className="text-xl md:text-2xl font-black tracking-tight flex items-center gap-2" style={{ color: "#10a37f" }}>
                  <BarChart2 className="text-[#10a37f]" size={24} />
                  DASHBOARD GRAFIK PROFIL RESPONDEN
                </h2>
                <p className="text-xs text-slate-500 font-extrabold mt-0.5">
                  Analisis karakteristik responden kuesioner Budaya Keselamatan Pasien secara dinamis dan real-time.
                </p>
              </div>
              <div className="bg-[#10a37f]/10 text-[#10a37f] border border-[#10a37f]/20 px-4 py-2 rounded-2xl text-xs font-black shrink-0 flex items-center gap-1.5 shadow-sm">
                <Database size={13} />
                <span>Responden : {respondentProfileStats.total} orang</span>
              </div>
            </div>

            {respondentProfileStats.total === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center text-slate-400 font-bold shadow-xs">
                Belum ada data demografi responden. Silakan isi kuesioner atau simulasikan data.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    id: "lamaKerjaRS",
                    title: "Lama Kerja di Rumah Sakit",
                    icon: <Calendar className="text-emerald-500" size={18} />,
                    data: respondentProfileStats.lamaKerjaRS,
                    palette: PALETTE_RS,
                    isDonut: true,
                    titleColor: "#00bc7d",
                  },
                  {
                    id: "lamaKerjaUnit",
                    title: "Lama Kerja di Unit",
                    icon: <Users className="text-blue-500" size={18} />,
                    data: respondentProfileStats.lamaKerjaUnit,
                    palette: PALETTE_UNIT,
                    isDonut: true,
                    titleColor: "#497fc3",
                  },
                  {
                    id: "hubunganPasien",
                    title: "Profesi Berhubungan Langsung dengan Pasien",
                    icon: <UserCheck className="text-rose-500" size={18} />,
                    data: respondentProfileStats.hubunganPasien,
                    palette: PALETTE_PASIEN,
                    isDonut: false,
                    titleColor: "#ff2056",
                  },
                  {
                    id: "posisiJabatan",
                    title: "Posisi / Jabatan",
                    icon: <Briefcase className="text-amber-500" size={18} />,
                    data: respondentProfileStats.posisiJabatan,
                    palette: PALETTE_JABATAN,
                    isDonut: false,
                    titleColor: "#fe9a00",
                  },
                  {
                    id: "jamKerja",
                    title: "Jam Kerja Dalam Seminggu",
                    icon: <Clock className="text-red-500" size={18} />,
                    data: respondentProfileStats.jamKerja,
                    palette: PALETTE_JAM,
                    isDonut: true,
                    titleColor: "#fb2c36",
                  },
                  {
                    id: "lamaKerjaProfesi",
                    title: "Lama Kerja Sesuai Profesi",
                    icon: <Award className="text-purple-500" size={18} />,
                    data: respondentProfileStats.lamaKerjaProfesi,
                    palette: PALETTE_PROFESI,
                    isDonut: true,
                    titleColor: "#ad46ff",
                  }
                ].map(chart => {
                  const hidden = hiddenCategories[chart.id] || [];
                  const activeData = chart.data.filter(item => !hidden.includes(item.name));
                  const totalVal = chart.data.reduce((sum, item) => sum + item.value, 0);

                  const exportPNG = () => {
                    const wrapper = document.getElementById(`chart-container-${chart.id}`);
                    const svgEl = wrapper?.querySelector("svg");
                    if (!svgEl) return;
                    
                    const svgString = new XMLSerializer().serializeToString(svgEl);
                    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
                    const blobURL = URL.createObjectURL(svgBlob);
                    
                    const image = new window.Image();
                    image.onload = () => {
                      const canvas = document.createElement("canvas");
                      canvas.width = svgEl.clientWidth * 2 || 1000;
                      canvas.height = svgEl.clientHeight * 2 || 600;
                      const context = canvas.getContext("2d");
                      if (context) {
                        context.fillStyle = "#ffffff";
                        context.fillRect(0, 0, canvas.width, canvas.height);
                        context.drawImage(image, 0, 0, canvas.width, canvas.height);
                        const png = canvas.toDataURL("image/png");
                        const link = document.createElement("a");
                        link.href = png;
                        link.download = `Grafik_${chart.title.replace(/\s+/g, "_")}.png`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }
                      URL.revokeObjectURL(blobURL);
                    };
                    image.src = blobURL;
                  };

                  const downloadCSV = () => {
                    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
                    csvContent += "Kategori;Jumlah;Persentase\n";
                    chart.data.forEach(item => {
                      const pct = totalVal > 0 ? ((item.value / totalVal) * 100).toFixed(1) : "0";
                      csvContent += `"${item.name}";${item.value};${pct}%\n`;
                    });
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement("a");
                    link.href = encodedUri;
                    link.download = `Data_${chart.title.replace(/\s+/g, "_")}.csv`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  };

                  return (
                    <div 
                      key={chart.id}
                      id={`chart-card-${chart.id}`}
                      className="bg-white rounded-[24px] border border-gray-100 shadow-md shadow-gray-200/40 p-5 md:p-6 hover:shadow-lg hover:shadow-gray-200/50 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
                    >
                      {/* Card Header */}
                      <div className="relative flex justify-between items-start gap-3 border-b border-gray-50 pb-3 mb-4 min-h-[56px]">
                        <div className="flex items-center gap-2.5 flex-1 pr-6">
                          <span className="p-2 bg-slate-50 rounded-xl shrink-0">
                            {chart.icon}
                          </span>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs md:text-sm font-black leading-tight break-words" style={{ color: chart.titleColor }}>
                              {chart.title}
                            </h4>
                            <p className="text-[10px] font-extrabold mt-0.5" style={{ color: "#758295" }}>
                              Responden : {totalVal} orang
                            </p>
                          </div>
                        </div>

                        {/* Chart Utilities: Only Fullscreen Button */}
                        <div className="absolute top-0 right-0">
                          <button
                            onClick={() => setFullscreenChartId(chart.id)}
                            className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-[#10a37f] rounded-lg transition-colors cursor-pointer"
                            title="Fullscreen"
                          >
                            <Maximize2 size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Recharts Pie Chart Wrapper */}
                      <div id={`chart-container-${chart.id}`} className="relative h-44 w-full flex items-center justify-center overflow-hidden mb-2">
                        {activeData.length === 0 || activeData.every(x => x.value === 0) ? (
                          <div className="text-center text-xs text-slate-400 font-bold">
                            Tidak ada kategori aktif.<br />Aktifkan melalui legenda di bawah.
                          </div>
                        ) : (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <defs>
                                <filter id={`shadow-${chart.id}`} height="140%" width="140%" x="-20%" y="-20%">
                                  <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#000000" floodOpacity="0.15" />
                                </filter>
                              </defs>
                              <Pie
                                data={activeData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={chart.isDonut ? "75%" : "70%"}
                                innerRadius={chart.isDonut ? "45%" : "0%"}
                                fill="#8884d8"
                                dataKey="value"
                                isAnimationActive={true}
                              >
                                {activeData.map((entry, index) => {
                                  const originalIdx = chart.data.findIndex(x => x.name === entry.name);
                                  const color = chart.palette[originalIdx % chart.palette.length];
                                  return <Cell key={`cell-${index}`} fill={color} filter={`url(#shadow-${chart.id})`} />;
                                })}
                              </Pie>
                              <RechartsTooltip 
                                formatter={(value: any, name: any) => [
                                  `${value} Responden (${totalVal > 0 ? ((value / totalVal) * 100).toFixed(1) : 0}%)`, 
                                  name
                                ]}
                                contentStyle={{
                                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                                  border: "1px solid #e2e8f0",
                                  borderRadius: "12px",
                                  fontSize: "11px",
                                  fontWeight: "bold",
                                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
                                }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        )}
                      </div>

                      {/* Interactive Legend List: Rata Kiri Rapi & Proporsional */}
                      <div className="mt-2 flex flex-col gap-1.5 h-[110px] overflow-y-auto pr-1 w-full text-left">
                        {chart.data.map((item, idx) => {
                          const isHidden = hidden.includes(item.name);
                          const color = chart.palette[idx % chart.palette.length];
                          const pct = totalVal > 0 ? ((item.value / totalVal) * 100).toFixed(1) : "0";

                          return (
                            <button
                              key={item.name}
                              onClick={() => toggleCategoryVisibility(chart.id, item.name)}
                              className={`flex items-start gap-2 text-[10px] font-extrabold transition-all hover:translate-x-0.5 select-none cursor-pointer focus:outline-none text-left leading-normal w-full ${
                                isHidden ? "opacity-35 line-through text-slate-400" : "text-slate-600"
                              }`}
                              title="Klik untuk menyembunyikan/menampilkan"
                            >
                              <span 
                                className="w-2.5 h-2.5 rounded-full shrink-0 mt-0.5 shadow-xs" 
                                style={{ backgroundColor: isHidden ? "#cbd5e1" : color }}
                              />
                              <div className="flex-1 flex justify-between items-baseline gap-2">
                                <span className="break-words max-w-[70%]">{item.name}</span>
                                <span className="text-[9px] text-slate-400 font-bold shrink-0">{item.value} orang ({pct}%)</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* Footer Analisa Otomatis */}
                      <div className="mt-auto pt-3 border-t border-gray-100 bg-emerald-50/40 rounded-xl p-3 border-l-4 border-[#10a37f]">
                        <h5 className="text-[10px] font-black text-[#10a37f] uppercase tracking-wider mb-1">
                          Analisa Data
                        </h5>
                        <p className="text-[11px] text-slate-600 leading-relaxed font-bold italic text-justify">
                          &ldquo;{generateDemographicNarrative(chart.title, chart.data, totalVal)}&rdquo;
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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

      {/* FULLSCREEN CHART MODAL */}
      {fullscreenChartId && (
        (() => {
          const allCharts = [
            {
              id: "lamaKerjaRS",
              title: "Lama Kerja di Rumah Sakit",
              icon: <Calendar className="text-emerald-500" size={24} />,
              data: respondentProfileStats.lamaKerjaRS,
              palette: PALETTE_RS,
              isDonut: true,
              titleColor: "#00bc7d",
            },
            {
              id: "lamaKerjaUnit",
              title: "Lama Kerja di Unit",
              icon: <Users className="text-blue-500" size={24} />,
              data: respondentProfileStats.lamaKerjaUnit,
              palette: PALETTE_UNIT,
              isDonut: true,
              titleColor: "#497fc3",
            },
            {
              id: "hubunganPasien",
              title: "Profesi Berhubungan Langsung dengan Pasien",
              icon: <UserCheck className="text-rose-500" size={24} />,
              data: respondentProfileStats.hubunganPasien,
              palette: PALETTE_PASIEN,
              isDonut: false,
              titleColor: "#ff2056",
            },
            {
              id: "posisiJabatan",
              title: "Posisi / Jabatan",
              icon: <Briefcase className="text-amber-500" size={24} />,
              data: respondentProfileStats.posisiJabatan,
              palette: PALETTE_JABATAN,
              isDonut: false,
              titleColor: "#fe9a00",
            },
            {
              id: "jamKerja",
              title: "Jam Kerja Dalam Seminggu",
              icon: <Clock className="text-red-500" size={24} />,
              data: respondentProfileStats.jamKerja,
              palette: PALETTE_JAM,
              isDonut: true,
              titleColor: "#fb2c36",
            },
            {
              id: "lamaKerjaProfesi",
              title: "Lama Kerja Sesuai Profesi",
              icon: <Award className="text-purple-500" size={24} />,
              data: respondentProfileStats.lamaKerjaProfesi,
              palette: PALETTE_PROFESI,
              isDonut: true,
              titleColor: "#ad46ff",
            }
          ];
          const activeChart = allCharts.find(c => c.id === fullscreenChartId);
          if (!activeChart) return null;

          const hidden = hiddenCategories[activeChart.id] || [];
          const activeData = activeChart.data.filter(item => !hidden.includes(item.name));
          const totalVal = activeChart.data.reduce((sum, item) => sum + item.value, 0);

          const exportPNG = () => {
            const wrapper = document.getElementById(`fullscreen-chart-wrapper`);
            const svgEl = wrapper?.querySelector("svg");
            if (!svgEl) return;
            
            const svgString = new XMLSerializer().serializeToString(svgEl);
            const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
            const blobURL = URL.createObjectURL(svgBlob);
            
            const image = new window.Image();
            image.onload = () => {
              const canvas = document.createElement("canvas");
              canvas.width = svgEl.clientWidth * 2 || 1200;
              canvas.height = svgEl.clientHeight * 2 || 800;
              const context = canvas.getContext("2d");
              if (context) {
                context.fillStyle = "#ffffff";
                context.fillRect(0, 0, canvas.width, canvas.height);
                context.drawImage(image, 0, 0, canvas.width, canvas.height);
                const png = canvas.toDataURL("image/png");
                const link = document.createElement("a");
                link.href = png;
                link.download = `Grafik_Fullscreen_${activeChart.title.replace(/\s+/g, "_")}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }
              URL.revokeObjectURL(blobURL);
            };
            image.src = blobURL;
          };

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl max-w-4xl w-full p-6 md:p-8 shadow-2xl border border-slate-100 flex flex-col md:flex-row gap-8 relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
                
                {/* Close Button */}
                <button
                  onClick={() => setFullscreenChartId(null)}
                  className="absolute top-5 right-5 p-2 bg-slate-100 text-slate-500 hover:text-slate-800 rounded-full transition-all cursor-pointer focus:outline-none"
                  title="Tutup Fullscreen"
                >
                  <X size={20} />
                </button>

                {/* Left Side: Large Interactive Chart */}
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="flex items-center gap-3 self-start mb-6">
                    <span className="p-3 bg-slate-100 rounded-2xl shrink-0">
                      {activeChart.icon}
                    </span>
                    <div>
                      <h3 className="text-xl font-black" style={{ color: activeChart.titleColor }}>
                        {activeChart.title}
                      </h3>
                      <p className="text-xs font-bold" style={{ color: "#758295" }}>
                        Responden : {totalVal} orang
                      </p>
                    </div>
                  </div>

                  <div id="fullscreen-chart-wrapper" className="w-full h-72 md:h-80 flex items-center justify-center relative">
                    {activeData.length === 0 || activeData.every(x => x.value === 0) ? (
                      <div className="text-center text-sm text-slate-400 font-bold">
                        Tidak ada kategori aktif.<br />Aktifkan melalui legenda di samping.
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <defs>
                            <filter id={`shadow-modal-${activeChart.id}`} height="140%" width="140%" x="-20%" y="-20%">
                              <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#000000" floodOpacity="0.2" />
                            </filter>
                          </defs>
                          <Pie
                            data={activeData}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                            outerRadius="80%"
                            innerRadius={activeChart.isDonut ? "50%" : "0%"}
                            fill="#8884d8"
                            dataKey="value"
                            isAnimationActive={true}
                          >
                            {activeData.map((entry, index) => {
                              const originalIdx = activeChart.data.findIndex(x => x.name === entry.name);
                              const color = activeChart.palette[originalIdx % activeChart.palette.length];
                              return <Cell key={`cell-${index}`} fill={color} filter={`url(#shadow-modal-${activeChart.id})`} />;
                            })}
                          </Pie>
                          <RechartsTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>

                  {/* Interactive Legend inside Modal: Rata Kiri Rapi & Proporsional */}
                  <div className="mt-6 flex flex-col gap-1.5 max-w-lg w-full text-left">
                    {activeChart.data.map((item, idx) => {
                      const isHidden = hidden.includes(item.name);
                      const color = activeChart.palette[idx % activeChart.palette.length];
                      const pct = totalVal > 0 ? ((item.value / totalVal) * 100).toFixed(1) : "0";

                      return (
                        <button
                          key={item.name}
                          onClick={() => toggleCategoryVisibility(activeChart.id, item.name)}
                          className={`flex items-start gap-2 text-xs font-bold transition-all hover:translate-x-0.5 cursor-pointer focus:outline-none text-left leading-normal w-full ${
                            isHidden ? "opacity-35 line-through text-slate-400" : "text-slate-700"
                          }`}
                        >
                          <span 
                            className="w-2.5 h-2.5 rounded-full shrink-0 mt-1 shadow-xs" 
                            style={{ backgroundColor: isHidden ? "#cbd5e1" : color }}
                          />
                          <div className="flex-1 flex justify-between items-baseline gap-2">
                            <span className="break-words">{item.name}</span>
                            <span className="text-[10px] text-slate-400 font-bold shrink-0">{item.value} orang ({pct}%)</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Right Side: Analisa Data & Actions */}
                <div className="w-full md:w-80 shrink-0 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-6">
                  <div className="space-y-5 flex-1">
                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 border-l-4 border-[#10a37f]">
                      <h4 className="text-xs font-black text-[#10a37f] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Activity size={14} />
                        Analisa Data
                      </h4>
                      <p className="text-xs text-slate-700 leading-relaxed font-bold italic text-justify">
                        &ldquo;{generateDemographicNarrative(activeChart.title, activeChart.data, totalVal)}&rdquo;
                      </p>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-4">
                      <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                        Metrik Utama
                      </h4>
                      <ul className="text-xs font-bold text-slate-600 space-y-2">
                        <li className="flex justify-between">
                          <span>Total Responden:</span>
                          <span className="text-slate-800">{totalVal} orang</span>
                        </li>
                        <li className="flex justify-between">
                          <span>Kategori Dominan:</span>
                          <span className="text-emerald-600">
                            {[...activeChart.data].sort((a,b)=>b.value-a.value)[0]?.name || "-"}
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-slate-100 flex flex-col gap-2.5">
                    <button
                      onClick={exportPNG}
                      className="flex items-center justify-center gap-2 bg-[#10a37f] hover:bg-[#0e8f6e] text-white py-3 px-5 rounded-xl font-bold transition-all text-sm shadow-md cursor-pointer focus:outline-none"
                    >
                      <Download size={16} />
                      Ekspor PNG resolusi tinggi
                    </button>
                    <button
                      onClick={() => {
                        window.print();
                      }}
                      className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 px-5 rounded-xl font-bold transition-all text-sm cursor-pointer focus:outline-none"
                    >
                      <Printer size={16} />
                      Ekspor PDF (Cetak Halaman)
                    </button>
                  </div>
                </div>

              </div>
            </div>
          );
        })()
      )}

      {/* MODAL 1: RESET CONFIRMATION */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150 flex flex-col">
            <div className="flex items-center gap-3 text-rose-600 mb-4">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} />
              </div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                Konfirmasi Reset Data
              </h3>
            </div>
            
            <p className="text-sm text-slate-600 font-semibold leading-relaxed mb-6">
              Apakah Anda yakin ingin menghapus seluruh data kuesioner? Tindakan ini akan menghapus semua responden secara permanen dari database cloud dan penyimpanan lokal, serta tidak dapat dibatalkan.
            </p>

            <div className="flex justify-end gap-2.5">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-extrabold transition-all text-xs cursor-pointer focus:outline-none"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmResetStep}
                className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-xl font-extrabold transition-all text-xs cursor-pointer shadow-md shadow-rose-500/20 focus:outline-none"
              >
                Ya, Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: RESET PASSWORD VALIDATION */}
      {showResetPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150 flex flex-col">
            <div className="flex items-center gap-3 text-emerald-600 mb-4">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <Database size={20} className="text-[#10a37f]" />
              </div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                Verifikasi Keamanan
              </h3>
            </div>
            
            <p className="text-sm text-slate-600 font-semibold leading-relaxed mb-4">
              Silakan masukkan password reset untuk memproses penghapusan seluruh data survei keselamatan pasien.
            </p>

            <form onSubmit={(e) => handleExecuteReset(e)} className="space-y-4">
              <div>
                <input
                  type="password"
                  value={resetPasswordInput}
                  onChange={(e) => {
                    setResetPasswordInput(e.target.value);
                    if (resetPasswordError) setResetPasswordError(null);
                  }}
                  placeholder="Masukkan password reset"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-[#10a37f] focus:bg-white transition-all shadow-inner"
                  autoFocus
                />
                {resetPasswordError && (
                  <p className="text-xs text-rose-600 font-bold mt-1.5 flex items-center gap-1">
                    <XCircle size={12} /> {resetPasswordError}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowResetPassword(false);
                    setResetPasswordInput("");
                    setResetPasswordError(null);
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-extrabold transition-all text-xs cursor-pointer focus:outline-none"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-xl font-extrabold transition-all text-xs cursor-pointer shadow-md shadow-rose-500/20 focus:outline-none"
                >
                  Konfirmasi Reset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: RESET SUCCESS FEEDBACK */}
      {showResetSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-[#10a37f] flex items-center justify-center mb-4">
              <Sparkles size={28} />
            </div>
            
            <h3 className="text-lg font-black text-slate-900 tracking-tight mb-2">
              Reset Data Berhasil!
            </h3>
            
            <p className="text-sm text-slate-600 font-semibold leading-relaxed mb-6">
              Seluruh data kuesioner pada database cloud dan penyimpanan lokal telah berhasil dibersihkan.
            </p>

            <button
              onClick={() => setShowResetSuccess(false)}
              className="w-full bg-[#10a37f] hover:bg-[#0e8f6e] text-white py-3 rounded-xl font-black transition-all text-xs cursor-pointer shadow-md shadow-emerald-500/20 focus:outline-none"
            >
              Selesai
            </button>
          </div>
        </div>
      )}

      {/* MODAL 4: DETAIL RIWAYAT PER DIMENSI */}
      {selectedDimensionId !== null && dimensionDetailData && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-0 md:p-6 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <style>{`
            @media print {
              body * {
                visibility: hidden !important;
              }
              #print-area, #print-area * {
                visibility: visible !important;
              }
              #print-area {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                background: white !important;
                color: black !important;
                box-shadow: none !important;
                border: none !important;
              }
              .no-print {
                display: none !important;
              }
            }
          `}</style>
          
          <div 
            id="print-area"
            className="bg-white rounded-none md:rounded-[24px] border border-slate-100 shadow-2xl max-w-5xl w-full flex flex-col my-0 md:my-4 relative overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-300 min-h-screen md:min-h-0"
          >
            {/* Header */}
            <div className="p-6 md:p-8 bg-gradient-to-r from-emerald-600 to-teal-700 text-white relative">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 blur-2xl rounded-full" />
              
              <div className="flex justify-between items-start relative z-10">
                <div className="space-y-1.5 flex-1 pr-6">
                  <h2 className="text-xl sm:text-2xl font-black leading-tight text-white tracking-tight">
                    Dimensi {selectedDimensionId} : {dimensionDetailData.dim.name}
                  </h2>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-bold text-emerald-100">
                    <span className="flex items-center gap-1">
                      <Calendar size={13} /> Periode Survei: {selectedYear}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>
                      Total Pertanyaan: {dimensionDetailData.dim.items.length} butir
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={() => setSelectedDimensionId(null)}
                  className="no-print p-2.5 rounded-xl bg-white/10 hover:bg-white/25 text-white transition-all cursor-pointer outline-none focus:ring-2 focus:ring-emerald-400"
                  aria-label="Tutup detail dimensi"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Main Content Body */}
            <div className="p-6 md:p-8 space-y-8 overflow-y-auto max-h-[80vh]">
              
              {/* Summary Statistics Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col justify-between">
                  <span className="text-slate-500 font-bold text-[11px] uppercase tracking-wider">Total Responden</span>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-[32px] italic font-black text-slate-800">{dimensionDetailData.uniqueRespondentsCount}</span>
                    <span className="text-[16px] italic text-slate-500 font-bold">staf</span>
                  </div>
                </div>

                <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl flex flex-col justify-between">
                  <div className="flex justify-between items-center">
                    <span className="text-emerald-700 font-bold text-[11px] uppercase tracking-wider">Respon Positif</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <div className="flex items-baseline gap-1 mt-2 text-emerald-600">
                    <span className="text-[32px] italic font-black">{Math.round(dimensionDetailData.overallPositivePercent)}%</span>
                  </div>
                </div>

                <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-2xl flex flex-col justify-between">
                  <div className="flex justify-between items-center">
                    <span className="text-amber-700 font-bold text-[11px] uppercase tracking-wider">Respon Netral</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  </div>
                  <div className="flex items-baseline gap-1 mt-2 text-amber-600">
                    <span className="text-[32px] italic font-black">{Math.round(dimensionDetailData.overallNeutralPercent)}%</span>
                  </div>
                </div>

                <div className="bg-rose-50/50 border border-rose-100 p-4 rounded-2xl flex flex-col justify-between">
                  <div className="flex justify-between items-center">
                    <span className="text-rose-700 font-bold text-[11px] uppercase tracking-wider">Respon Negatif</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  </div>
                  <div className="flex items-baseline gap-1 mt-2 text-rose-600">
                    <span className="text-[32px] italic font-black">{Math.round(dimensionDetailData.overallNegativePercent)}%</span>
                  </div>
                </div>

                <div className="col-span-2 lg:col-span-1 bg-[#10a37f]/5 border border-[#10a37f]/20 p-4 rounded-2xl flex flex-col justify-between">
                  <span className="text-[#10a37f] font-bold text-[11px] uppercase tracking-wider flex items-center gap-1">
                    <Award size={12} /> Kategori Budaya
                  </span>
                  <div className="mt-2">
                    <span className={`inline-block text-xs font-black px-2.5 py-1 rounded-lg ${
                      dimensionDetailData.overallPositivePercent >= 75
                        ? "bg-emerald-500 text-white"
                        : dimensionDetailData.overallPositivePercent >= 50
                        ? "bg-amber-500 text-white"
                        : "bg-rose-500 text-white"
                    }`}>
                      {dimensionDetailData.cultureCategory}
                    </span>
                    <p className="text-[10px] text-slate-500 font-bold mt-1.5">Skor: {Math.round(dimensionDetailData.dimensionScorePercent)}%</p>
                  </div>
                </div>
              </div>

              {/* Questions List & Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* Questions Details List (Left 7 Columns) */}
                <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-150 p-5 md:p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5 mb-4 pb-2 border-b">
                      <ClipboardList size={14} className="text-emerald-600" />
                      Daftar Pertanyaan & Distribusi Respon
                    </h3>
                    <div className="space-y-4 max-h-[320px] overflow-y-auto pr-2">
                      {dimensionDetailData.questionStats.map((q, qIdx) => (
                        <div key={q.key} className="space-y-2 text-xs">
                          <div className="flex items-start justify-between gap-4">
                            <span className="font-extrabold text-slate-400 min-w-10 text-left shrink-0">Butir {q.key}</span>
                            <p className="text-slate-700 font-semibold leading-relaxed text-justify flex-1">
                              {q.text} {q.isReverse && <span className="text-rose-600 font-black text-[9px] uppercase tracking-wider bg-rose-50 px-1.5 py-0.5 rounded ml-1" title="Pertanyaan Terbalik (Reversed Key) - Skor dibalik saat perhitungan">Reversed</span>}
                            </p>
                          </div>
                          {/* Mini stacked response distribution bar */}
                          <div className="pl-10 space-y-1">
                            <div className="w-full h-2.5 rounded-full bg-slate-100 flex overflow-hidden">
                              <div style={{ width: `${q.positive}%` }} className="h-full bg-emerald-500 transition-all duration-500" title={`Positif: ${Math.round(q.positive)}%`} />
                              <div style={{ width: `${q.neutral}%` }} className="h-full bg-amber-500 transition-all duration-500" title={`Netral: ${Math.round(q.neutral)}%`} />
                              <div style={{ width: `${q.negative}%` }} className="h-full bg-rose-500 transition-all duration-500" title={`Negatif: ${Math.round(q.negative)}%`} />
                            </div>
                            <div className="flex justify-between items-center text-[10px] text-slate-400 font-extrabold">
                              <span className="text-emerald-600">Positif: {Math.round(q.positive)}%</span>
                              <span className="text-amber-500">Netral: {Math.round(q.neutral)}%</span>
                              <span className="text-rose-600">Negatif: {Math.round(q.negative)}%</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Modern Recharts Grouped Bar Chart (Right 5 Columns) */}
                <div className="lg:col-span-5 bg-slate-50 rounded-2xl border border-slate-150 p-5 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5 mb-4 pb-2 border-b">
                      <BarChart2 size={14} className="text-emerald-600" />
                      Visualisasi Grafik Respon
                    </h3>
                    <div className="flex items-center justify-center min-h-[260px] bg-white rounded-xl p-3 border border-slate-100">
                      <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={dimensionDetailData.questionStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <filter id="bar-shadow" x="-20%" y="-20%" width="140%" height="140%">
                              <feDropShadow dx="1.5" dy="2.5" stdDeviation="2.5" floodColor="#0f172a" floodOpacity="0.4" />
                            </filter>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="key" stroke="#94a3b8" fontSize={11} fontWeight={700} />
                          <YAxis stroke="#94a3b8" fontSize={11} fontWeight={700} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                          <RechartsTooltip 
                            content={({ active, payload }: any) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-xl border border-slate-700 shadow-xl max-w-sm text-xs space-y-1.5 font-sans">
                                    <p className="font-extrabold text-emerald-400">{data.key}</p>
                                    <p className="text-slate-300 font-semibold leading-relaxed mb-2">&ldquo;{data.text}&rdquo;</p>
                                    <div className="flex justify-between gap-4 font-bold">
                                      <span className="text-emerald-400">🟢 Positif: {Math.round(data.positive)}%</span>
                                      <span className="text-amber-400">🟡 Netral: {Math.round(data.neutral)}%</span>
                                      <span className="text-rose-400">🔴 Negatif: {Math.round(data.negative)}%</span>
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            }} 
                          />
                          <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 600 }} />
                          <Bar dataKey="positive" name="Positif" fill="#10b981" radius={[4, 4, 0, 0]} filter="url(#bar-shadow)" />
                          <Bar dataKey="neutral" name="Netral" fill="#f59e0b" radius={[4, 4, 0, 0]} filter="url(#bar-shadow)" />
                          <Bar dataKey="negative" name="Negatif" fill="#ef4444" radius={[4, 4, 0, 0]} filter="url(#bar-shadow)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>

              {/* Respondent History Table Section */}
              <div className="space-y-4 bg-white rounded-2xl border border-slate-150 p-5 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b">
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-1.5">
                      <Database size={16} className="text-[#10a37f]" />
                      Riwayat Pengisian Jawaban Responden
                    </h3>
                    <p className="text-[11px] text-slate-500 font-bold">Tabel data seluruh jawaban responden pada pertanyaan dimensi ini</p>
                  </div>
                </div>

                {/* Filters Row (Hidden in Print) */}
                <div className="no-print grid grid-cols-1 md:grid-cols-12 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {/* Search Input */}
                  <div className="md:col-span-5 relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                      placeholder="Cari unit, butir, atau jawaban..."
                      className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-bold text-slate-700 outline-none focus:border-[#10a37f] transition-all"
                    />
                  </div>

                  {/* Filter Unit */}
                  <div className="md:col-span-3 relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                    <select
                      value={filterUnit}
                      onChange={(e) => {
                        setFilterUnit(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-[#10a37f] transition-all appearance-none cursor-pointer"
                    >
                      <option value="">Semua Unit</option>
                      {uniqueUnitsForFilter.map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>

                  {/* Filter Bulan */}
                  <div className="md:col-span-4 relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                    <select
                      value={filterMonth}
                      onChange={(e) => {
                        setFilterMonth(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-[#10a37f] transition-all appearance-none cursor-pointer"
                    >
                      <option value="">Semua Bulan</option>
                      {["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"].map((m, mIdx) => (
                        <option key={m} value={mIdx}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Table container */}
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-center border-collapse min-w-[700px] text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 font-extrabold text-slate-600">
                        <th className="p-3 text-center w-12 sticky top-0 bg-slate-50 z-10 border border-slate-200">No</th>
                        <th className="p-3 text-center w-32 sticky top-0 bg-slate-50 z-10 border border-slate-200">Tanggal</th>
                        <th className="p-3 text-center w-32 sticky top-0 bg-slate-50 z-10 border border-slate-200">Unit</th>
                        <th className="p-3 text-center w-16 sticky top-0 bg-slate-50 z-10 border border-slate-200">Butir</th>
                        <th className="p-3 text-center sticky top-0 bg-slate-50 z-10 border border-slate-200">Jawaban</th>
                        <th className="p-3 text-center w-16 sticky top-0 bg-slate-50 z-10 border border-slate-200">Nilai</th>
                        <th className="p-3 text-center w-24 sticky top-0 bg-slate-50 z-10 border border-slate-200">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {paginatedRows.length > 0 ? (
                        paginatedRows.map((row, idx) => {
                          const globalIdx = (currentPage - 1) * itemsPerPage + idx + 1;
                          let badgeClass = "bg-rose-50 text-rose-600 border border-rose-100";
                          if (row.category === "Positif") {
                            badgeClass = "bg-emerald-50 text-emerald-600 border border-emerald-100";
                          } else if (row.category === "Netral") {
                            badgeClass = "bg-amber-50 text-amber-600 border border-amber-100";
                          }
                          
                          return (
                            <tr key={row.id} className="hover:bg-slate-50/40 even:bg-slate-50/20 transition-all">
                              <td className="p-3 text-center font-bold text-slate-400 border border-slate-200">{globalIdx}</td>
                              <td className="p-3 text-center whitespace-nowrap text-slate-500 font-bold border border-slate-200">{row.dateStr}</td>
                              <td className="p-3 text-center whitespace-nowrap text-slate-800 font-bold border border-slate-200">{row.unit}</td>
                              <td className="p-3 text-center font-extrabold text-[#10a37f] border border-slate-200">{row.questionKey}</td>
                              <td className="p-3 text-center text-slate-600 pr-4 italic leading-relaxed border border-slate-200" title={row.questionText}>
                                &ldquo;{row.answer}&rdquo;
                              </td>
                              <td className="p-3 text-center font-black text-slate-900 border border-slate-200">{row.value}</td>
                              <td className="p-3 text-center whitespace-nowrap border border-slate-200">
                                <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-extrabold ${badgeClass}`}>
                                  {row.category}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-slate-400 font-bold italic border border-slate-200">
                            Tidak ada riwayat pengisian responden yang cocok dengan kriteria filter saat ini.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls (Hidden in Print) */}
                {totalPages > 1 && (
                  <div className="no-print flex items-center justify-between pt-4 border-t border-slate-100">
                    <span className="text-[11px] text-slate-400 font-extrabold uppercase">
                      Menampilkan {Math.min(processedRows.length, (currentPage - 1) * itemsPerPage + 1)}-
                      {Math.min(processedRows.length, currentPage * itemsPerPage)} dari {processedRows.length} data
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-2 border border-slate-200 text-[11px] font-extrabold rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer focus:outline-none"
                      >
                        Sebelumnya
                      </button>
                      
                      {Array.from({ length: totalPages }).map((_, pIdx) => {
                        const pNum = pIdx + 1;
                        const isCurrent = pNum === currentPage;
                        return (
                          <button
                            key={pNum}
                            onClick={() => setCurrentPage(pNum)}
                            className={`w-8 h-8 rounded-lg text-xs font-black transition-all cursor-pointer focus:outline-none flex items-center justify-center ${
                              isCurrent
                                ? "bg-[#10a37f] text-white shadow-md shadow-emerald-500/10"
                                : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            {pNum}
                          </button>
                        );
                      })}

                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 border border-slate-200 text-[11px] font-extrabold rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer focus:outline-none"
                      >
                        Berikutnya
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Auto Analysis & Recommendation Panel */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Auto Analysis Card */}
                <div className="bg-emerald-50/30 border border-emerald-500/15 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-xl rounded-full" />
                  
                  <div className="space-y-3">
                    <h3 className="text-xs font-black text-emerald-800 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-emerald-500/10">
                      <Sparkles size={14} className="text-emerald-500" />
                      Analisis Hasil Dimensi
                    </h3>
                    <p className="text-xs text-slate-700 leading-relaxed font-semibold text-justify">
                      {dimensionDetailData.autoAnalysis}
                    </p>
                  </div>
                </div>

                {/* Recommendations Card */}
                <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-6 relative flex flex-col justify-between">
                  <div className="space-y-3">
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b">
                      <TrendingUp size={14} className="text-[#10a37f]" />
                      Rekomendasi Perbaikan Mutu
                    </h3>
                    <ul className="space-y-2.5">
                      {dimensionDetailData.recommendations.map((rec, rIdx) => (
                        <li key={rIdx} className="flex items-start gap-2.5 text-xs text-slate-600 font-semibold">
                          <span className="w-5 h-5 rounded-full bg-emerald-100 text-[#10a37f] font-black text-[10px] flex items-center justify-center shrink-0">
                            {rIdx + 1}
                          </span>
                          <span className="leading-relaxed text-justify">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="no-print p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedDimensionId(null)}
                className="bg-slate-800 hover:bg-slate-900 text-white font-extrabold px-6 py-3 rounded-xl text-xs transition-all shadow-md hover:shadow-lg active:scale-95 cursor-pointer focus:outline-none"
              >
                Selesai & Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
