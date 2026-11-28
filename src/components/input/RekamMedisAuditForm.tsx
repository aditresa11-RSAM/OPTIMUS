import React, { useMemo, useState } from "react";
import {
  Check,
  CheckCheck,
  FileUp,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import {
  RekamMedisAuditBundle,
  RmCellState,
  RmKelengkapan24JamRow,
  RmReviewPulangRow,
  RmReviewRekamMedisRow,
} from "@/store/useStore";

type SheetKey =
  | "review_pulang"
  | "review_rm"
  | "rekap_kuantitatif"
  | "kelengkapan_24jam";

interface ColumnDef<K extends string> {
  key: K;
  label: string;
  group?: string;
}

const makeRowId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

// Sheet 1 columns matching Excel "CLOSE MEDICAL RECORD REVIEW RINGKASAN PASIEN PULANG"
export const PULANG_COLUMNS: ColumnDef<keyof Omit<RmReviewPulangRow, "id" | "no_rm" | "ruangan" | "dpjp" | "keterangan">>[] = [
  { key: "tgl_masuk", label: "TGL MASUK" },
  { key: "tgl_keluar_meninggal", label: "TGL KELUAR / MENINGGAL" },
  { key: "ruang_rawat_terakhir", label: "RUANG RAWAT TERAKHIR" },
  { key: "diagnosa_waktu_masuk", label: "DIAGNOSA / MASALAH WAKTU MASUK" },
  { key: "alasan_dirawat", label: "ALASAN DIRAWAT" },
  { key: "ringkasan_riwayat", label: "RINGKASAN RIWAYAT PENYAKIT" },
  { key: "pem_fisik", label: "PEM. FISIK" },
  { key: "pem_penunjang_lab", label: "LAB", group: "PEM. PENUNJANG" },
  { key: "pem_penunjang_rad", label: "RADIOLOGI", group: "PEM. PENUNJANG" },
  { key: "terapi_selama_rs", label: "TERAPI / PENGOBATAN SELAMA DI RS" },
  { key: "perkembangan_perawatan", label: "PERKEMBANGAN SETELAH PERAWATAN" },
  { key: "alergi_obat", label: "ALERGI (REAKSI OBAT)" },
  { key: "diagnosa_utama", label: "DIAGNOSA UTAMA" },
  { key: "diagnosa_sekunder", label: "DIAGNOSA SEKUNDER" },
  { key: "tindakan_prosedur", label: "TINDAKAN/ PROSEDUR" },
  { key: "kondisi_waktu_keluar", label: "KONDISI WAKTU KELUAR" },
  { key: "pengobatan_dilanjutkan", label: "PENGOBATAN DILANJUTKAN" },
  { key: "tanggal_kontrol", label: "TANGGAL KONTROL" },
  { key: "terapi_pulang", label: "TERAPI PULANG" },
  { key: "edukasi_tindak_lanjut", label: "EDUKASI / INSTRUKSI TINDAK LANJUT" },
  { key: "tindakan_kedaruratan", label: "TINDAKAN JIKA ADA KEDARURATAN" },
  {
    key: "autentikasi_pasien_nama",
    label: "NAMA",
    group: "AUTENTIKASI PASIEN / KELUARGA",
  },
  {
    key: "autentikasi_pasien_ttd",
    label: "TTD",
    group: "AUTENTIKASI PASIEN / KELUARGA",
  },
  { key: "tanggal_ttd", label: "TANGGAL" },
  { key: "autentikasi_dpjp_nama", label: "NAMA DPJP", group: "AUTENTIKASI" },
  { key: "autentikasi_dpjp_ttd", label: "TTD DPJP", group: "AUTENTIKASI" },
];

// Sheet 2 columns matching Excel "CLOSE MEDICAL RECORD REVIEW REKAM MEDIS"
export const RM_COLUMNS: ColumnDef<keyof Omit<RmReviewRekamMedisRow, "id" | "no_rm" | "ruangan" | "dpjp" | "keterangan">>[] = [
  { key: "pengembalian_24_jam", label: "PENGEMBALIAN 24 JAM" },
  { key: "pengembalian_lebih_24_jam", label: "PENGEMBALIAN >24 JAM" },
  {
    key: "pengkajian_keperawatan_nama",
    label: "NAMA PERAWAT",
    group: "PENGKAJIAN AWAL KEPERAWATAN",
  },
  {
    key: "asesmen_medis_identitas",
    label: "NAMA & NO REKAM MEDIS",
    group: "ASESMEN AWAL MEDIS",
  },
  {
    key: "asesmen_medis_tanggal",
    label: "TANGGAL",
    group: "ASESMEN AWAL MEDIS",
  },
  {
    key: "asesmen_medis_diagnosa",
    label: "DIAGNOSA",
    group: "ASESMEN AWAL MEDIS",
  },
  {
    key: "asesmen_medis_ttd",
    label: "TTD DOKTER",
    group: "ASESMEN AWAL MEDIS",
  },
  {
    key: "unsur_nyeri_awal",
    label: "ASSESMEN AWAL NYERI",
    group: "PERSYARATAN UNSUR DOKUMEN SESUAI FORMULIR YANG DITETAPKAN",
  },
  {
    key: "unsur_nyeri_ulang",
    label: "ASSESMEN ULANG NYERI",
    group: "PERSYARATAN UNSUR DOKUMEN SESUAI FORMULIR YANG DITETAPKAN",
  },
  {
    key: "unsur_nyeri_tata_laksana",
    label: "TATA LAKSANA NYERI",
    group: "PERSYARATAN UNSUR DOKUMEN SESUAI FORMULIR YANG DITETAPKAN",
  },
  {
    key: "unsur_jatuh_awal",
    label: "ASSESMEN AWAL RESIKO JATUH",
    group: "PERSYARATAN UNSUR DOKUMEN SESUAI FORMULIR YANG DITETAPKAN",
  },
  {
    key: "unsur_jatuh_ulang",
    label: "ASSESMEN ULANG RESIKO JATUH",
    group: "PERSYARATAN UNSUR DOKUMEN SESUAI FORMULIR YANG DITETAPKAN",
  },
  {
    key: "unsur_cppt",
    label: "CPPT",
    group: "PERSYARATAN UNSUR DOKUMEN SESUAI FORMULIR YANG DITETAPKAN",
  },
  {
    key: "unsur_verifikasi_dpjp",
    label: "VERIFIKASI DPJP",
    group: "PERSYARATAN UNSUR DOKUMEN SESUAI FORMULIR YANG DITETAPKAN",
  },
  {
    key: "unsur_kelengkapan_tanggal",
    label: "KELENGKAPAN PENGISIAN TANGGAL",
    group: "PERSYARATAN UNSUR DOKUMEN SESUAI FORMULIR YANG DITETAPKAN",
  },
  {
    key: "unsur_kelengkapan_jam",
    label: "KELENGKAPAN PENGISIAN JAM",
    group: "PERSYARATAN UNSUR DOKUMEN SESUAI FORMULIR YANG DITETAPKAN",
  },
  {
    key: "unsur_rekonsiliasi_obat",
    label: "REKONSILIASI OBAT",
    group: "PERSYARATAN UNSUR DOKUMEN SESUAI FORMULIR YANG DITETAPKAN",
  },
  {
    key: "unsur_keterbacaan_tulisan",
    label: "KETERBACAAN TULISAN",
    group: "PERSYARATAN UNSUR DOKUMEN SESUAI FORMULIR YANG DITETAPKAN",
  },
  {
    key: "unsur_komunikasi_sbar",
    label: "KOMUNIKASI EFEKTI /S-BAR",
    group: "PERSYARATAN UNSUR DOKUMEN SESUAI FORMULIR YANG DITETAPKAN",
  },
  {
    key: "unsur_singkatan",
    label: "PENGGUNAAN SINGKATAN",
    group: "PERSYARATAN UNSUR DOKUMEN SESUAI FORMULIR YANG DITETAPKAN",
  },
  {
    key: "unsur_simbol",
    label: "PENGGUNAAN SIMBOL",
    group: "PERSYARATAN UNSUR DOKUMEN SESUAI FORMULIR YANG DITETAPKAN",
  },
  {
    key: "ic_ttd_pemberi",
    label: "TTD PEMBERI INFORMASI",
    group: "INFORMED CONSENT",
  },
  {
    key: "ic_ttd_penerima",
    label: "TTD PENERIMA INFORMASI",
    group: "INFORMED CONSENT",
  },
  {
    key: "gc_ttd_pemberi",
    label: "TTD PEMBERI INFORMASI",
    group: "GENERAL CONSENT",
  },
  {
    key: "gc_ttd_penerima",
    label: "TTD PENERIMA INFORMASI",
    group: "GENERAL CONSENT",
  },
];

export const createEmptyRmReviewPulangRow = (): RmReviewPulangRow => ({
  id: makeRowId(),
  no_rm: "",
  ruangan: "",
  dpjp: "",
  tgl_masuk: "",
  tgl_keluar_meninggal: "",
  ruang_rawat_terakhir: "",
  diagnosa_waktu_masuk: "",
  alasan_dirawat: "",
  ringkasan_riwayat: "",
  pem_fisik: "",
  pem_penunjang_lab: "",
  pem_penunjang_rad: "",
  terapi_selama_rs: "",
  perkembangan_perawatan: "",
  alergi_obat: "",
  diagnosa_utama: "",
  diagnosa_sekunder: "",
  tindakan_prosedur: "",
  kondisi_waktu_keluar: "",
  pengobatan_dilanjutkan: "",
  tanggal_kontrol: "",
  terapi_pulang: "",
  edukasi_tindak_lanjut: "",
  tindakan_kedaruratan: "",
  autentikasi_pasien_nama: "",
  autentikasi_pasien_ttd: "",
  tanggal_ttd: "",
  autentikasi_dpjp_nama: "",
  autentikasi_dpjp_ttd: "",
  keterangan: "",
});

export const createEmptyRmReviewRmRow = (): RmReviewRekamMedisRow => ({
  id: makeRowId(),
  no_rm: "",
  ruangan: "",
  dpjp: "",
  pengembalian_24_jam: "",
  pengembalian_lebih_24_jam: "",
  pengkajian_keperawatan_nama: "",
  asesmen_medis_identitas: "",
  asesmen_medis_tanggal: "",
  asesmen_medis_diagnosa: "",
  asesmen_medis_ttd: "",
  unsur_nyeri_awal: "",
  unsur_nyeri_ulang: "",
  unsur_nyeri_tata_laksana: "",
  unsur_jatuh_awal: "",
  unsur_jatuh_ulang: "",
  unsur_cppt: "",
  unsur_verifikasi_dpjp: "",
  unsur_kelengkapan_tanggal: "",
  unsur_kelengkapan_jam: "",
  unsur_rekonsiliasi_obat: "",
  unsur_keterbacaan_tulisan: "",
  unsur_komunikasi_sbar: "",
  unsur_singkatan: "",
  unsur_simbol: "",
  ic_ttd_pemberi: "",
  ic_ttd_penerima: "",
  gc_ttd_pemberi: "",
  gc_ttd_penerima: "",
  keterangan: "",
});

export const createEmptyRmKelengkapan24Row = (
  defaultDate: string,
): RmKelengkapan24JamRow => ({
  id: makeRowId(),
  tanggal: defaultDate,
  nama_pasien: "",
  no_rm: "",
  c1_identitas: "",
  c2_riwayat: "",
  c3_resume: "",
  c4_instruksi: "",
  c5_kembali_24j: "",
  c6_kembali_lebih_24j: "",
  total: 0,
  keterangan: "",
});

export const createEmptyRekamMedisBundle = (
  defaultDate: string,
): RekamMedisAuditBundle => ({
  review_pulang: [createEmptyRmReviewPulangRow()],
  review_rm: [createEmptyRmReviewRmRow()],
  kelengkapan_24jam: [createEmptyRmKelengkapan24Row(defaultDate)],
  penyediaan_rm_rajal: "00:02:00",
  penyediaan_rm_ranap: "00:03:00",
  hasil_analisis: "",
});

export const calcKelengkapan24Total = (r: RmKelengkapan24JamRow): number =>
  r.c1_identitas === "1" &&
  r.c2_riwayat === "1" &&
  r.c3_resume === "1" &&
  r.c4_instruksi === "1" &&
  r.c5_kembali_24j === "1" &&
  r.c6_kembali_lebih_24j !== "1"
    ? 1
    : 0;

export const computeRekamMedisMetrics = (bundle: RekamMedisAuditBundle) => {
  const filled24 = bundle.kelengkapan_24jam.filter(
    (r) =>
      r.no_rm.trim() !== "" ||
      r.nama_pasien.trim() !== "" ||
      r.c1_identitas !== "" ||
      r.c5_kembali_24j !== "",
  );
  const filledRm = bundle.review_rm.filter(
    (r) => r.no_rm.trim() !== "" || r.ruangan.trim() !== "",
  );
  const filledPulang = bundle.review_pulang.filter(
    (r) => r.no_rm.trim() !== "" || r.ruangan.trim() !== "",
  );

  if (filled24.length > 0) {
    const num = filled24.filter((r) => calcKelengkapan24Total(r) === 1).length;
    return {
      num,
      den: filled24.length,
      sourceLabel: "Kelengkapan RM 24 Jam",
      filled24,
      filledRm,
      filledPulang,
    };
  }
  if (filledRm.length > 0) {
    const num = filledRm.filter((r) => r.pengembalian_24_jam === "1").length;
    return {
      num,
      den: filledRm.length,
      sourceLabel: "Close Review Rekam Medis (24 Jam)",
      filled24,
      filledRm,
      filledPulang,
    };
  }
  if (filledPulang.length > 0) {
    const num = filledPulang.filter((r) =>
      PULANG_COLUMNS.every(
        (col) => r[col.key] === "1" || r[col.key] === "TD",
      ),
    ).length;
    return {
      num,
      den: filledPulang.length,
      sourceLabel: "Close Review Ringkasan Pasien Pulang",
      filled24,
      filledRm,
      filledPulang,
    };
  }
  return {
    num: 0,
    den: 1,
    sourceLabel: "Kelengkapan RM 24 Jam",
    filled24,
    filledRm,
    filledPulang,
  };
};

export const stripEmptyRekamMedisRows = (
  bundle: RekamMedisAuditBundle,
): RekamMedisAuditBundle => {
  const m = computeRekamMedisMetrics(bundle);
  return {
    ...bundle,
    review_pulang: m.filledPulang,
    review_rm: m.filledRm,
    kelengkapan_24jam: m.filled24,
  };
};

const parseCellState = (raw: string): RmCellState => {
  const s = String(raw || "").trim().toUpperCase();
  if (s === "1" || s === "ADA" || s === "YA") return "1";
  if (s === "0" || s === "TIDAK" || s === "TIDAK ADA") return "0";
  if (s === "TD" || s === "-") return "TD";
  return "";
};

const parseDateFlexible = (raw: string, fallback: string): string => {
  const s = String(raw || "").trim();
  if (!s) return fallback;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const dmy = s.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
  if (dmy) {
    return `${dmy[3]}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}`;
  }
  return fallback;
};

function buildHeaderGroups<K extends string>(cols: ColumnDef<K>[]) {
  const segments: Array<
    | { type: "single"; col: ColumnDef<K> }
    | { type: "group"; groupName: string; cols: ColumnDef<K>[] }
  > = [];

  for (const col of cols) {
    if (!col.group) {
      segments.push({ type: "single", col });
    } else {
      const last = segments[segments.length - 1];
      if (last && last.type === "group" && last.groupName === col.group) {
        last.cols.push(col);
      } else {
        segments.push({ type: "group", groupName: col.group, cols: [col] });
      }
    }
  }
  return segments;
}

function summarizeColumn<T extends Record<string, any>>(
  rows: T[],
  key: keyof T,
) {
  let ada = 0;
  let tidakAda = 0;
  let tidakDiperlukan = 0;
  for (const row of rows) {
    const val = row[key];
    if (val === "1") ada++;
    else if (val === "0") tidakAda++;
    else if (val === "TD") tidakDiperlukan++;
  }
  return {
    ada,
    tidakAda,
    tidakDiperlukan,
    jumlah: ada + tidakAda + tidakDiperlukan,
  };
}

interface Props {
  bundle: RekamMedisAuditBundle;
  onChange: (next: RekamMedisAuditBundle) => void;
  defaultDate: string;
  unitLabel: string;
  bulanLabel: string;
  tahunLabel: string;
  computedCapaian: number;
}

export default function RekamMedisAuditForm({
  bundle,
  onChange,
  defaultDate,
  unitLabel,
  bulanLabel,
  tahunLabel,
  computedCapaian,
}: Props) {
  const [activeSheet, setActiveSheet] = useState<SheetKey>("review_pulang");
  const [showPasteBox, setShowPasteBox] = useState(false);
  const [pasteText, setPasteText] = useState("");

  const metrics = useMemo(() => computeRekamMedisMetrics(bundle), [bundle]);

  const sheetTabs: Array<{ key: SheetKey; label: string; count?: number }> = [
    {
      key: "review_pulang",
      label: "1. Review Ringkasan Pulang",
      count: metrics.filledPulang.length,
    },
    {
      key: "review_rm",
      label: "2. Review Rekam Medis",
      count: metrics.filledRm.length,
    },
    {
      key: "rekap_kuantitatif",
      label: "3. Rekapitulasi Kuantitatif",
    },
    {
      key: "kelengkapan_24jam",
      label: "4. Kelengkapan RM 24 Jam",
      count: metrics.filled24.length,
    },
  ];

  // Shared helper to update any binary/tri-state review sheet
  const updatePulangRow = (
    id: string,
    field: keyof RmReviewPulangRow,
    value: any,
  ) => {
    onChange({
      ...bundle,
      review_pulang: bundle.review_pulang.map((r) =>
        r.id === id ? { ...r, [field]: value } : r,
      ),
    });
  };

  const fillAllPulangRow = (id: string) => {
    onChange({
      ...bundle,
      review_pulang: bundle.review_pulang.map((r) => {
        if (r.id !== id) return r;
        const copy: RmReviewPulangRow = { ...r };
        PULANG_COLUMNS.forEach((c) => {
          if (!copy[c.key]) copy[c.key] = "1";
        });
        return copy;
      }),
    });
  };

  const updateRmRow = (
    id: string,
    field: keyof RmReviewRekamMedisRow,
    value: any,
  ) => {
    onChange({
      ...bundle,
      review_rm: bundle.review_rm.map((r) => {
        if (r.id !== id) return r;
        const next: RmReviewRekamMedisRow = { ...r, [field]: value };
        if (field === "pengembalian_24_jam" && value === "1") {
          next.pengembalian_lebih_24_jam = "0";
        } else if (field === "pengembalian_lebih_24_jam" && value === "1") {
          next.pengembalian_24_jam = "0";
        }
        return next;
      }),
    });
  };

  const fillAllRmRow = (id: string) => {
    onChange({
      ...bundle,
      review_rm: bundle.review_rm.map((r) => {
        if (r.id !== id) return r;
        const copy: RmReviewRekamMedisRow = { ...r };
        RM_COLUMNS.forEach((c) => {
          if (c.key === "pengembalian_lebih_24_jam") {
            if (!copy[c.key]) copy[c.key] = "0";
          } else if (!copy[c.key]) {
            copy[c.key] = "1";
          }
        });
        return copy;
      }),
    });
  };

  const update24Row = (
    id: string,
    field: keyof RmKelengkapan24JamRow,
    value: any,
  ) => {
    onChange({
      ...bundle,
      kelengkapan_24jam: bundle.kelengkapan_24jam.map((r) => {
        if (r.id !== id) return r;
        const next: RmKelengkapan24JamRow = { ...r, [field]: value };
        if (field === "c5_kembali_24j" && value === "1") {
          next.c6_kembali_lebih_24j = "0";
        } else if (field === "c6_kembali_lebih_24j" && value === "1") {
          next.c5_kembali_24j = "0";
        }
        next.total = calcKelengkapan24Total(next);
        return next;
      }),
    });
  };

  const fillAll24Row = (id: string) => {
    onChange({
      ...bundle,
      kelengkapan_24jam: bundle.kelengkapan_24jam.map((r) => {
        if (r.id !== id) return r;
        const next: RmKelengkapan24JamRow = {
          ...r,
          c1_identitas: "1",
          c2_riwayat: "1",
          c3_resume: "1",
          c4_instruksi: "1",
          c5_kembali_24j: "1",
          c6_kembali_lebih_24j: "0",
        };
        next.total = calcKelengkapan24Total(next);
        return next;
      }),
    });
  };

  const handleImportPaste = () => {
    const lines = pasteText
      .split(/\r?\n/)
      .map((l) => l.trimEnd())
      .filter((l) => l.trim() !== "");
    if (lines.length === 0) return;

    if (activeSheet === "review_pulang") {
      const parsed: RmReviewPulangRow[] = [];
      for (const line of lines) {
        const cols = line.split("\t").map((c) => c.trim());
        if (cols.length < 4) continue;
        const low = line.toLowerCase();
        if (
          low.includes("no. rm") ||
          low.includes("close medical record") ||
          low.startsWith(",,,") ||
          cols[3]?.toUpperCase() === "TIDAK ADA" ||
          cols[3]?.toUpperCase() === "TIDAK DIPERLUKAN" ||
          cols[3]?.toUpperCase() === "JUMLAH"
        ) {
          continue;
        }
        const rm = cols[1] || "";
        const ruangan = cols[2] || "";
        const dpjp = cols[3] || "";
        if (!rm && !ruangan) continue;
        const row = createEmptyRmReviewPulangRow();
        row.no_rm = rm;
        row.ruangan = ruangan;
        row.dpjp = dpjp;
        PULANG_COLUMNS.forEach((col, i) => {
          row[col.key] = parseCellState(cols[4 + i] || "");
        });
        row.keterangan = cols[4 + PULANG_COLUMNS.length] || "";
        parsed.push(row);
      }
      if (parsed.length === 0) {
        alert("Tidak ada baris valid terbaca untuk Review Ringkasan Pasien Pulang.");
        return;
      }
      const existing = metrics.filledPulang;
      onChange({ ...bundle, review_pulang: [...existing, ...parsed] });
    } else if (activeSheet === "review_rm") {
      const parsed: RmReviewRekamMedisRow[] = [];
      for (const line of lines) {
        const cols = line.split("\t").map((c) => c.trim());
        if (cols.length < 4) continue;
        const low = line.toLowerCase();
        if (
          low.includes("no. rm") ||
          low.includes("close medical record") ||
          cols[3]?.toUpperCase() === "ADA" ||
          cols[3]?.toUpperCase() === "TIDAK ADA" ||
          cols[3]?.toUpperCase() === "TIDAK DIPERLUKAN" ||
          cols[3]?.toUpperCase() === "JUMLAH"
        ) {
          continue;
        }
        const rm = cols[1] || "";
        const ruangan = cols[2] || "";
        const dpjp = cols[3] || "";
        if (!rm && !ruangan) continue;
        const row = createEmptyRmReviewRmRow();
        row.no_rm = rm;
        row.ruangan = ruangan;
        row.dpjp = dpjp;
        RM_COLUMNS.forEach((col, i) => {
          row[col.key] = parseCellState(cols[4 + i] || "");
        });
        row.keterangan = cols[4 + RM_COLUMNS.length] || "";
        parsed.push(row);
      }
      if (parsed.length === 0) {
        alert("Tidak ada baris valid terbaca untuk Review Rekam Medis.");
        return;
      }
      const existing = metrics.filledRm;
      onChange({ ...bundle, review_rm: [...existing, ...parsed] });
    } else if (activeSheet === "kelengkapan_24jam") {
      const parsed: RmKelengkapan24JamRow[] = [];
      for (const line of lines) {
        const cols = line.split("\t").map((c) => c.trim());
        if (cols.length < 4) continue;
        const low = line.toLowerCase();
        if (
          low.includes("nama pasien") ||
          low.includes("kelengkapan rekam medis") ||
          low.startsWith("numerator")
        ) {
          continue;
        }
        const hasNo = /^\d+$/.test(cols[0]) && cols.length >= 6;
        const off = hasNo ? 1 : 0;
        const tanggal = parseDateFlexible(cols[off] || "", defaultDate);
        const nama = cols[off + 1] || "";
        const rm = cols[off + 2] || "";
        if (!nama && !rm) continue;
        const row: RmKelengkapan24JamRow = {
          id: makeRowId(),
          tanggal,
          nama_pasien: nama,
          no_rm: rm,
          c1_identitas: (parseCellState(cols[off + 3] || "") === "1" ? "1" : "0") as "1" | "0",
          c2_riwayat: (parseCellState(cols[off + 4] || "") === "1" ? "1" : "0") as "1" | "0",
          c3_resume: (parseCellState(cols[off + 5] || "") === "1" ? "1" : "0") as "1" | "0",
          c4_instruksi: (parseCellState(cols[off + 6] || "") === "1" ? "1" : "0") as "1" | "0",
          c5_kembali_24j: (parseCellState(cols[off + 7] || "") === "1" ? "1" : "0") as "1" | "0",
          c6_kembali_lebih_24j: (parseCellState(cols[off + 8] || "") === "1" ? "1" : "0") as "1" | "0",
          total: 0,
          keterangan: cols[off + 10] || "",
        };
        row.total = calcKelengkapan24Total(row);
        parsed.push(row);
      }
      if (parsed.length === 0) {
        alert("Tidak ada baris valid terbaca untuk Kelengkapan RM 24 Jam.");
        return;
      }
      const existing = metrics.filled24;
      onChange({ ...bundle, kelengkapan_24jam: [...existing, ...parsed] });
    }

    setPasteText("");
    setShowPasteBox(false);
  };

  // Live quantitative recap calculations for Sheet 3
  const recapData = useMemo(() => {
    const pRows = metrics.filledPulang;
    const rRows = metrics.filledRm;

    const statPulang = (key: keyof RmReviewPulangRow) => {
      const s = summarizeColumn(pRows, key);
      const den = s.ada + s.tidakAda;
      const pctOk = den > 0 ? (s.ada / den) * 100 : 0;
      const pctNo = den > 0 ? (s.tidakAda / den) * 100 : 0;
      return { ada: s.ada, tidakAda: s.tidakAda, jumlah: den, pctOk, pctNo };
    };

    const statRm = (key: keyof RmReviewRekamMedisRow) => {
      const s = summarizeColumn(rRows, key);
      const den = s.ada + s.tidakAda;
      const pctOk = den > 0 ? (s.ada / den) * 100 : 0;
      const pctNo = den > 0 ? (s.tidakAda / den) * 100 : 0;
      return { ada: s.ada, tidakAda: s.tidakAda, jumlah: den, pctOk, pctNo };
    };

    const rm1x24 = statRm("pengembalian_24_jam");
    const identNama = pRows.length > 0 ? { ada: pRows.length, tidakAda: 0, jumlah: pRows.length, pctOk: 100, pctNo: 0 } : statRm("asesmen_medis_identitas");
    const identRm = pRows.length > 0 ? { ada: pRows.length, tidakAda: 0, jumlah: pRows.length, pctOk: 100, pctNo: 0 } : statRm("asesmen_medis_identitas");

    const anamnesisItems = [
      { no: "A", label: "Tanggal Masuk", stat: statPulang("tgl_masuk") },
      { no: "B", label: "Tanggal Keluar / Meninggal", stat: statPulang("tgl_keluar_meninggal") },
      { no: "C", label: "Ruang Rawat Terakhir", stat: statPulang("ruang_rawat_terakhir") },
      { no: "D", label: "Diagnosa / Masalah Waktu Masuk", stat: statPulang("diagnosa_waktu_masuk") },
      { no: "E", label: "Alasan Dirawat", stat: statPulang("alasan_dirawat") },
      { no: "F", label: "Ringkasan Riwayat Penyakit", stat: statPulang("ringkasan_riwayat") },
      { no: "G", label: "Pemeriksaan Fisik", stat: statPulang("pem_fisik") },
      { no: "H", label: "Hasil Lab", stat: statPulang("pem_penunjang_lab") },
      { no: "I", label: "Hasil Radiologi", stat: statPulang("pem_penunjang_rad") },
      { no: "J", label: "Terapi / Pengobatan Selama di RS", stat: statPulang("terapi_selama_rs") },
      { no: "K", label: "Perkembangan Setelah Perawatan", stat: statPulang("perkembangan_perawatan") },
      { no: "L", label: "Alergi (Reaksi Obat)", stat: statPulang("alergi_obat") },
      { no: "M", label: "Diagnosa Utama", stat: statPulang("diagnosa_utama") },
      { no: "N", label: "Diagnosa Sekunder", stat: statPulang("diagnosa_sekunder") },
      { no: "O", label: "Tindakan / Prosedur", stat: statPulang("tindakan_prosedur") },
      { no: "P", label: "Kondisi Waktu Keluar", stat: statPulang("kondisi_waktu_keluar") },
      { no: "Q", label: "Pengobatan Dilanjutkan", stat: statPulang("pengobatan_dilanjutkan") },
      { no: "R", label: "Tanggal Kontrol", stat: statPulang("tanggal_kontrol") },
      { no: "S", label: "Terapi Pulang", stat: statPulang("terapi_pulang") },
      { no: "T", label: "Tanggal", stat: statPulang("tanggal_ttd") },
      { no: "U", label: "Nama Penanggung Jawab", stat: statPulang("autentikasi_pasien_nama") },
      { no: "V", label: "TTD Penanggung Jawab", stat: statPulang("autentikasi_pasien_ttd") },
      { no: "W", label: "Nama DPJP", stat: statPulang("autentikasi_dpjp_nama") },
      { no: "X", label: "Tanda Tangan DPJP", stat: statPulang("autentikasi_dpjp_ttd") },
    ];

    const rencanaItems = [
      { no: "a", label: "CPPT", stat: statRm("unsur_cppt") },
      { no: "b", label: "Verifikasi DPJP", stat: statRm("unsur_verifikasi_dpjp") },
      { no: "c", label: "Kelengkapan Pengisian Tanggal", stat: statRm("unsur_kelengkapan_tanggal") },
      { no: "d", label: "Kelengkapan Pengisian Jam", stat: statRm("unsur_kelengkapan_jam") },
      { no: "f", label: "Keterbacaan Tulisan", stat: statRm("unsur_keterbacaan_tulisan") },
      { no: "g", label: "Penggunaan Singkatan", stat: statRm("unsur_singkatan") },
      { no: "h", label: "Penggunaan Simbol", stat: statRm("unsur_simbol") },
      { no: "i", label: "Komunikasi Efektif / S-BAR", stat: statRm("unsur_komunikasi_sbar") },
    ];

    const icItems = [
      { no: "j", label: "TTD Pemberi Informasi", stat: statRm("ic_ttd_pemberi") },
      { no: "k", label: "TTD Penerima Informasi", stat: statRm("ic_ttd_penerima") },
    ];

    const gcItems = [
      { no: "1", label: "TTD Pemberi Informasi", stat: statRm("gc_ttd_pemberi") },
      { no: "2", label: "TTD Penerima Informasi", stat: statRm("gc_ttd_penerima") },
    ];

    const kepItems = [
      { no: "1", label: "Nama Perawat", stat: statRm("pengkajian_keperawatan_nama") },
      { no: "2", label: "Assesmen Awal Nyeri", stat: statRm("unsur_nyeri_awal") },
      { no: "3", label: "Assesmen Ulang Nyeri", stat: statRm("unsur_nyeri_ulang") },
      { no: "4", label: "Tata Laksana Nyeri", stat: statRm("unsur_nyeri_tata_laksana") },
      { no: "5", label: "Assesmen Awal Resiko Jatuh", stat: statRm("unsur_jatuh_awal") },
      { no: "6", label: "Assesmen Ulang Resiko Jatuh", stat: statRm("unsur_jatuh_ulang") },
    ];

    const avgPct = (list: Array<{ stat: { jumlah: number; pctOk: number } }>) => {
      const active = list.filter((x) => x.stat.jumlah > 0);
      if (active.length === 0) return 0;
      return active.reduce((acc, x) => acc + x.stat.pctOk, 0) / active.length;
    };

    const avgAnam = avgPct(anamnesisItems);
    const avgRencana = avgPct(rencanaItems);
    const avgIc = avgPct(icItems);
    const avgGc = avgPct(gcItems);
    const avgKep = avgPct(kepItems);

    return {
      rm1x24,
      identNama,
      identRm,
      anamnesisItems,
      rencanaItems,
      icItems,
      gcItems,
      kepItems,
      avgAnam,
      avgRencana,
      avgIc,
      avgGc,
      avgKep,
      overallAvg: ([rm1x24.pctOk, avgIc, avgGc].reduce((a, b) => a + b, 0)) / 3,
    };
  }, [metrics]);

  const renderMatrixSheet = <
    T extends { id: string; no_rm: string; ruangan: string; dpjp: string; keterangan: string } & Record<string, any>,
    K extends string,
  >(
    sheetTitle: string,
    cols: ColumnDef<K>[],
    rows: T[],
    onUpdate: (id: string, field: any, value: any) => void,
    onFillAll: (id: string) => void,
    onRemove: (id: string) => void,
  ) => {
    const segments = buildHeaderGroups(cols);
    return (
      <div className="p-4 md:p-5 overflow-x-auto">
        <div className="mb-3 text-center bg-slate-50 border border-slate-300 rounded-xl py-2.5 px-4">
          <p className="text-xs md:text-sm font-black text-slate-900 uppercase tracking-wide">
            {sheetTitle} {bulanLabel.toUpperCase()} {tahunLabel}
          </p>
        </div>

        <table className="w-full text-left border-collapse border border-slate-400 bg-white text-[11px]">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-400 text-slate-900">
              <th
                rowSpan={2}
                className="py-2 px-2 font-extrabold text-center w-10 border-r border-slate-400"
              >
                NO
              </th>
              <th
                rowSpan={2}
                className="py-2 px-2 font-extrabold text-center min-w-[95px] border-r border-slate-400"
              >
                NO. RM
              </th>
              <th
                rowSpan={2}
                className="py-2 px-2 font-extrabold text-center min-w-[105px] border-r border-slate-400"
              >
                RUANGAN
              </th>
              <th
                rowSpan={2}
                className="py-2 px-2 font-extrabold text-center min-w-[165px] border-r border-slate-400"
              >
                DPJP
              </th>
              {segments.map((seg, sIdx) =>
                seg.type === "single" ? (
                  <th
                    key={`h1-${String(seg.col.key)}-${sIdx}`}
                    rowSpan={2}
                    className="py-2 px-1.5 font-extrabold text-[10px] text-center min-w-[74px] max-w-[105px] border-r border-slate-400 leading-tight"
                  >
                    {seg.col.label}
                  </th>
                ) : (
                  <th
                    key={`hg-${seg.groupName}-${sIdx}`}
                    colSpan={seg.cols.length}
                    className="py-1.5 px-2 font-extrabold text-[10px] text-center border-r border-b border-slate-400 bg-slate-200/70"
                  >
                    {seg.groupName}
                  </th>
                ),
              )}
              <th
                rowSpan={2}
                className="py-2 px-2 font-extrabold text-center min-w-[125px] border-r border-slate-400"
              >
                KETERANGAN
              </th>
              <th
                rowSpan={2}
                className="py-2 px-2 font-extrabold text-center w-16"
              >
                AKSI
              </th>
            </tr>
            <tr className="bg-slate-100 border-b border-slate-400 text-slate-900">
              {segments.map((seg) =>
                seg.type === "group"
                  ? seg.cols.map((c) => (
                      <th
                        key={`h2-${String(c.key)}`}
                        className="py-1.5 px-1.5 font-extrabold text-[10px] text-center min-w-[74px] max-w-[105px] border-r border-slate-400 leading-tight"
                      >
                        {c.label}
                      </th>
                    ))
                  : null,
              )}
            </tr>
          </thead>
          <tbody>
            {/* 4 Excel Auto-Summary Rows (ADA, TIDAK ADA, TIDAK DIPERLUKAN, JUMLAH) */}
            {(
              [
                { label: "ADA", field: "ada", rowBg: "bg-emerald-50/70 text-emerald-900" },
                { label: "TIDAK ADA", field: "tidakAda", rowBg: "bg-rose-50/70 text-rose-900" },
                { label: "TIDAK DIPERLUKAN", field: "tidakDiperlukan", rowBg: "bg-slate-50 text-slate-700" },
                { label: "JUMLAH", field: "jumlah", rowBg: "bg-slate-200/70 text-slate-900 font-black" },
              ] as const
            ).map((sumRow) => (
              <tr key={sumRow.label} className={`border-b border-slate-300 text-[10px] font-extrabold ${sumRow.rowBg}`}>
                <td colSpan={4} className="py-1 px-3 text-right border-r border-slate-400 tracking-wide">
                  {sumRow.label}
                </td>
                {cols.map((col) => {
                  const s = summarizeColumn(rows, col.key);
                  return (
                    <td
                      key={`sum-${sumRow.label}-${String(col.key)}`}
                      className="py-1 px-1 text-center border-r border-slate-300 tabular-nums"
                    >
                      {s[sumRow.field]}
                    </td>
                  );
                })}
                <td className="py-1 px-2 border-r border-slate-300 text-center">-</td>
                <td className="py-1 px-2 text-center">-</td>
              </tr>
            ))}

            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={cols.length + 6}
                  className="py-10 text-center text-gray-400 italic font-semibold"
                >
                  Belum ada data. Klik &quot;Tambah Baris&quot;.
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => (
                <tr
                  key={`${row.id}-${idx}`}
                  className="border-b border-slate-300 hover:bg-emerald-50/20 transition-colors"
                >
                  <td className="py-1.5 px-2 text-center font-bold text-slate-700 border-r border-slate-300 tabular-nums">
                    {idx + 1}
                  </td>
                  <td className="py-1.5 px-1.5 border-r border-slate-300">
                    <input
                      type="text"
                      placeholder="164042"
                      value={row.no_rm}
                      onChange={(e) => onUpdate(row.id, "no_rm", e.target.value)}
                      className="w-full bg-transparent outline-none text-[11px] font-bold text-slate-900 text-center tabular-nums"
                    />
                  </td>
                  <td className="py-1.5 px-1.5 border-r border-slate-300">
                    <input
                      type="text"
                      list="rm-ruangan-list"
                      placeholder="AISYAH"
                      value={row.ruangan}
                      onChange={(e) => onUpdate(row.id, "ruangan", e.target.value)}
                      className="w-full bg-transparent outline-none text-[11px] font-semibold text-slate-800 uppercase"
                    />
                  </td>
                  <td className="py-1.5 px-1.5 border-r border-slate-300">
                    <input
                      type="text"
                      placeholder="Nama DPJP"
                      value={row.dpjp}
                      onChange={(e) => onUpdate(row.id, "dpjp", e.target.value)}
                      className="w-full bg-transparent outline-none text-[11px] font-medium text-slate-800"
                    />
                  </td>
                  {cols.map((col) => {
                    const val = row[col.key] as RmCellState;
                    return (
                      <td
                        key={`${row.id}-${String(col.key)}`}
                        className="py-1 px-1 text-center border-r border-slate-300"
                      >
                        <div className="inline-flex rounded border border-slate-200 overflow-hidden bg-slate-50">
                          {(["1", "0", "TD"] as const).map((opt) => {
                            const active = val === opt;
                            return (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => onUpdate(row.id, col.key, active ? "" : opt)}
                                title={
                                  opt === "1"
                                    ? "1 = Ada / Lengkap"
                                    : opt === "0"
                                      ? "0 = Tidak Ada"
                                      : "TD = Tidak Diperlukan"
                                }
                                className={`px-1.5 py-0.5 text-[9px] font-black transition-colors ${
                                  active
                                    ? opt === "1"
                                      ? "bg-emerald-600 text-white"
                                      : opt === "0"
                                        ? "bg-rose-600 text-white"
                                        : "bg-slate-600 text-white"
                                    : "text-slate-500 hover:bg-slate-200"
                                }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                    );
                  })}
                  <td className="py-1.5 px-1.5 border-r border-slate-300">
                    <input
                      type="text"
                      placeholder="Catatan"
                      value={row.keterangan}
                      onChange={(e) => onUpdate(row.id, "keterangan", e.target.value)}
                      className="w-full bg-transparent outline-none text-[11px] text-slate-700"
                    />
                  </td>
                  <td className="py-1.5 px-1.5 text-center">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onFillAll(row.id)}
                        title="Isi cepat semua = 1"
                        className="text-emerald-600 hover:bg-emerald-50 p-1 rounded transition-colors"
                      >
                        <CheckCheck size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemove(row.id)}
                        title="Hapus Baris"
                        className="text-red-500 hover:bg-red-50 p-1 rounded transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="bg-[#f8fafc] border border-white rounded-[28px] overflow-hidden shadow-[8px_8px_20px_rgba(160,175,195,0.2),-8px_-8px_20px_rgba(255,255,255,0.95)] animate-in fade-in">
      {/* Header Bar */}
      <div className="bg-emerald-600 p-5 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="font-extrabold text-white tracking-wide text-sm md:text-base">
            Tabel Input Data Kelengkapan Pengisian Rekam Medik Elektronik 24 Jam Setelah Selesai Pelayanan
          </h3>
          <p className="text-[11px] font-semibold text-emerald-100">
            Unit: {unitLabel || "Rekam Medis"} • Bulan: {bulanLabel} • Target: 100%
          </p>
        </div>
        {activeSheet !== "rekap_kuantitatif" && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (activeSheet === "review_pulang") {
                  onChange({
                    ...bundle,
                    review_pulang: [
                      ...bundle.review_pulang,
                      createEmptyRmReviewPulangRow(),
                    ],
                  });
                } else if (activeSheet === "review_rm") {
                  onChange({
                    ...bundle,
                    review_rm: [
                      ...bundle.review_rm,
                      createEmptyRmReviewRmRow(),
                    ],
                  });
                } else if (activeSheet === "kelengkapan_24jam") {
                  onChange({
                    ...bundle,
                    kelengkapan_24jam: [
                      ...bundle.kelengkapan_24jam,
                      createEmptyRmKelengkapan24Row(defaultDate),
                    ],
                  });
                }
              }}
              className="flex items-center justify-center bg-white text-emerald-800 hover:bg-emerald-50 px-4 py-1.5 rounded-xl text-xs font-black transition-colors cursor-pointer"
            >
              Tambah Baris
            </button>
          </div>
        )}
      </div>

      {/* Excel Workbook Sheet Tabs */}
      <div className="bg-slate-100 border-b border-slate-300 px-4 pt-2.5 flex flex-wrap gap-1.5">
        {sheetTabs.map((tab) => {
          const isAct = activeSheet === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                setActiveSheet(tab.key);
                setShowPasteBox(false);
              }}
              className={`px-3.5 py-2 rounded-t-xl text-xs font-extrabold border border-b-0 transition-all flex items-center gap-2 ${
                isAct
                  ? "bg-white text-emerald-800 border-slate-300 shadow-2xs -mb-px pb-2.5"
                  : "bg-slate-200/70 text-slate-600 border-transparent hover:bg-white/70"
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
                    isAct
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-300/70 text-slate-700"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <datalist id="rm-ruangan-list">
        <option value="AISYAH" />
        <option value="USMAN" />
        <option value="FATIMAH" />
        <option value="KHADIJAH" />
        <option value="ICU" />
        <option value="IGD" />
      </datalist>

      {/* SHEET 1 */}
      {activeSheet === "review_pulang" &&
        renderMatrixSheet(
          "CLOSE MEDICAL RECORD REVIEW RINGKASAN PASIEN PULANG",
          PULANG_COLUMNS,
          bundle.review_pulang,
          updatePulangRow,
          fillAllPulangRow,
          (id) =>
            onChange({
              ...bundle,
              review_pulang: bundle.review_pulang.filter((r) => r.id !== id),
            }),
        )}

      {/* SHEET 2 */}
      {activeSheet === "review_rm" &&
        renderMatrixSheet(
          "CLOSE MEDICAL RECORD REVIEW REKAM MEDIS",
          RM_COLUMNS,
          bundle.review_rm,
          updateRmRow,
          fillAllRmRow,
          (id) =>
            onChange({
              ...bundle,
              review_rm: bundle.review_rm.filter((r) => r.id !== id),
            }),
        )}

      {/* SHEET 3: REKAPITULASI ANALISIS KUANTITATIF */}
      {activeSheet === "rekap_kuantitatif" && (
        <div className="p-5 space-y-5 overflow-x-auto">
          <div className="text-center bg-slate-50 border border-slate-300 rounded-xl py-3 px-4">
            <p className="text-xs md:text-sm font-black text-slate-900 uppercase">
              REKAPITULASI ANALISIS KUANTITATIF REKAM MEDIS RAWAT INAP
            </p>
            <p className="text-xs font-bold text-slate-700 uppercase">
              RSUD AL MULK KOTA SUKABUMI • BULAN {bulanLabel.toUpperCase()} {tahunLabel}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <table className="w-full border-collapse border border-slate-400 bg-white text-xs">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-400">
                  <th className="py-2 px-2 border-r border-slate-400 text-center w-10">NO</th>
                  <th className="py-2 px-3 border-r border-slate-400 text-left">KRITERIA ANALISA</th>
                  <th className="py-2 px-2 border-r border-slate-400 text-center">LENGKAP / 24 JAM</th>
                  <th className="py-2 px-2 text-center">TIDAK LENGKAP / 24 JAM</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { no: 1, name: "KELENGKAPAN RM 1X24 JAM", val: recapData.rm1x24.pctOk },
                  { no: 2, name: "INFORMED CONSENT", val: recapData.avgIc },
                  { no: 3, name: "GENERAL CONSENT", val: recapData.avgGc },
                ].map((item) => (
                  <tr key={item.no} className="border-b border-slate-300">
                    <td className="py-1.5 px-2 text-center border-r border-slate-300 font-bold">{item.no}</td>
                    <td className="py-1.5 px-3 border-r border-slate-300 font-bold">{item.name}</td>
                    <td className="py-1.5 px-2 text-center border-r border-slate-300 font-bold text-emerald-700 tabular-nums">
                      {item.val.toFixed(2)}%
                    </td>
                    <td className="py-1.5 px-2 text-center font-bold text-rose-700 tabular-nums">
                      {(100 - item.val).toFixed(2)}%
                    </td>
                  </tr>
                ))}
                <tr className="bg-slate-100 font-black">
                  <td colSpan={2} className="py-1.5 px-3 border-r border-slate-400 text-right">
                    AVERAGE
                  </td>
                  <td className="py-1.5 px-2 text-center border-r border-slate-400 text-emerald-800 tabular-nums">
                    {recapData.overallAvg.toFixed(2)}%
                  </td>
                  <td className="py-1.5 px-2 text-center text-rose-800 tabular-nums">
                    {(100 - recapData.overallAvg).toFixed(2)}%
                  </td>
                </tr>
              </tbody>
            </table>

            <table className="w-full border-collapse border border-slate-400 bg-white text-xs">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-400">
                  <th className="py-2 px-2 border-r border-slate-400 text-center w-10">NO</th>
                  <th className="py-2 px-3 border-r border-slate-400 text-left">KRITERIA ANALISA</th>
                  <th className="py-2 px-3 text-center">WAKTU (HH:MM:SS)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-300">
                  <td className="py-2 px-2 text-center border-r border-slate-300 font-bold">1</td>
                  <td className="py-2 px-3 border-r border-slate-300 font-bold">PENYEDIAAN REKAM MEDIS RAWAT JALAN</td>
                  <td className="py-2 px-3 text-center">
                    <input
                      type="text"
                      value={bundle.penyediaan_rm_rajal || "00:02:00"}
                      onChange={(e) =>
                        onChange({ ...bundle, penyediaan_rm_rajal: e.target.value })
                      }
                      className="w-28 text-center border border-slate-300 rounded px-2 py-1 font-mono font-bold"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-2 text-center border-r border-slate-300 font-bold">2</td>
                  <td className="py-2 px-3 border-r border-slate-300 font-bold">PENYEDIAAN REKAM MEDIS RAWAT INAP</td>
                  <td className="py-2 px-3 text-center">
                    <input
                      type="text"
                      value={bundle.penyediaan_rm_ranap || "00:03:00"}
                      onChange={(e) =>
                        onChange({ ...bundle, penyediaan_rm_ranap: e.target.value })
                      }
                      className="w-28 text-center border border-slate-300 rounded px-2 py-1 font-mono font-bold"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <table className="w-full border-collapse border border-slate-400 bg-white text-xs">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-400">
                <th className="py-2 px-2 border-r border-slate-400 text-center w-12">NO</th>
                <th className="py-2 px-3 border-r border-slate-400 text-left">KRITERIA ANALISA</th>
                <th className="py-2 px-2 border-r border-slate-400 text-center w-20">ADA</th>
                <th className="py-2 px-2 border-r border-slate-400 text-center w-24">TIDAK ADA</th>
                <th className="py-2 px-2 border-r border-slate-400 text-center w-20">JUMLAH</th>
                <th className="py-2 px-2 border-r border-slate-400 text-center w-24">LENGKAP (%)</th>
                <th className="py-2 px-2 text-center w-28">TIDAK LENGKAP (%)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-300 font-bold bg-slate-50">
                <td className="py-1.5 px-2 text-center border-r border-slate-300">1</td>
                <td className="py-1.5 px-3 border-r border-slate-300">Pengembalian RM 1X24 jam</td>
                <td className="py-1.5 px-2 text-center border-r border-slate-300 tabular-nums">{recapData.rm1x24.ada}</td>
                <td className="py-1.5 px-2 text-center border-r border-slate-300 tabular-nums">{recapData.rm1x24.tidakAda}</td>
                <td className="py-1.5 px-2 text-center border-r border-slate-300 tabular-nums">{recapData.rm1x24.jumlah}</td>
                <td className="py-1.5 px-2 text-center border-r border-slate-300 text-emerald-700 tabular-nums">{recapData.rm1x24.pctOk.toFixed(1)}%</td>
                <td className="py-1.5 px-2 text-center text-rose-700 tabular-nums">{recapData.rm1x24.pctNo.toFixed(1)}%</td>
              </tr>
              {[
                { title: "3. Anamnesis Dan Resume", items: recapData.anamnesisItems, avg: recapData.avgAnam },
                { title: "4. Rencana Asuhan, Pelaksanaan Asuhan, Tindak Lanjut", items: recapData.rencanaItems, avg: recapData.avgRencana },
                { title: "Informed Consent", items: recapData.icItems, avg: recapData.avgIc },
                { title: "General Consent", items: recapData.gcItems, avg: recapData.avgGc },
                { title: "Pengkajian Keperawatan", items: recapData.kepItems, avg: recapData.avgKep },
              ].map((sec) => (
                <React.Fragment key={sec.title}>
                  <tr className="bg-slate-200/60 border-b border-slate-300 font-black">
                    <td colSpan={7} className="py-1.5 px-3">{sec.title}</td>
                  </tr>
                  {sec.items.map((it) => (
                    <tr key={`${sec.title}-${it.no}`} className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="py-1 px-2 text-center border-r border-slate-300 font-semibold">{it.no}</td>
                      <td className="py-1 px-3 border-r border-slate-300">{it.label}</td>
                      <td className="py-1 px-2 text-center border-r border-slate-300 tabular-nums">{it.stat.ada}</td>
                      <td className="py-1 px-2 text-center border-r border-slate-300 tabular-nums">{it.stat.tidakAda}</td>
                      <td className="py-1 px-2 text-center border-r border-slate-300 tabular-nums">{it.stat.jumlah}</td>
                      <td className="py-1 px-2 text-center border-r border-slate-300 text-emerald-700 font-bold tabular-nums">{it.stat.pctOk.toFixed(1)}%</td>
                      <td className="py-1 px-2 text-center text-rose-700 font-bold tabular-nums">{it.stat.pctNo.toFixed(1)}%</td>
                    </tr>
                  ))}
                  <tr className="bg-emerald-50/70 border-b border-slate-400 font-black">
                    <td colSpan={5} className="py-1.5 px-3 text-right border-r border-slate-300">
                      AVERAGE ({sec.title})
                    </td>
                    <td className="py-1.5 px-2 text-center border-r border-slate-300 text-emerald-800 tabular-nums">{sec.avg.toFixed(2)}%</td>
                    <td className="py-1.5 px-2 text-center text-rose-800 tabular-nums">{(100 - sec.avg).toFixed(2)}%</td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>

          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-800 uppercase">Hasil Analisis</label>
            <textarea
              rows={3}
              value={bundle.hasil_analisis || ""}
              onChange={(e) => onChange({ ...bundle, hasil_analisis: e.target.value })}
              placeholder="Ringkasan hasil analisis kuantitatif rekam medis rawat inap..."
              className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-800 outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      )}

      {/* SHEET 4: KELENGKAPAN PENGISISAN REKAM MEDIS 24 JAM SETELAH SELESAI PELAYANAN */}
      {activeSheet === "kelengkapan_24jam" && (
        <div className="p-5 space-y-5 overflow-x-auto">
          <div className="text-center bg-slate-50 border border-slate-300 rounded-xl py-3 px-4">
            <p className="text-xs md:text-sm font-black text-slate-900 uppercase">
              KELENGKAPAN PENGISISAN REKAM MEDIS 24 JAM SETELAH SELESAI PELAYANAN
            </p>
            <p className="text-xs font-bold text-slate-700 uppercase">
              UOBK RSUD AL-MULK KOTA SUKABUMI • BULAN {bulanLabel.toUpperCase()} TAHUN {tahunLabel}
            </p>
          </div>

          <div className="flex flex-col xl:flex-row gap-5 items-start">
            <div className="flex-1 w-full overflow-x-auto">
              <table className="w-full text-left border-collapse border border-slate-400 bg-white text-xs min-w-[900px]">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-400 text-slate-900">
                    <th rowSpan={2} className="py-2 px-2 font-extrabold text-center w-10 border-r border-slate-400">NO</th>
                    <th rowSpan={2} className="py-2 px-2 font-extrabold text-center w-32 border-r border-slate-400">TANGGAL</th>
                    <th rowSpan={2} className="py-2 px-3 font-extrabold text-center min-w-[190px] border-r border-slate-400">NAMA PASIEN</th>
                    <th rowSpan={2} className="py-2 px-2 font-extrabold text-center w-24 border-r border-slate-400">NO.RM</th>
                    <th colSpan={7} className="py-1.5 px-2 font-extrabold text-center border-r border-b border-slate-400 bg-slate-200/70">
                      KELENGKAPAN REKAM MEDIS
                    </th>
                    <th rowSpan={2} className="py-2 px-2 font-extrabold text-center min-w-[130px] border-r border-slate-400">KETERANGAN</th>
                    <th rowSpan={2} className="py-2 px-2 font-extrabold text-center w-16">AKSI</th>
                  </tr>
                  <tr className="bg-slate-100 border-b border-slate-400 text-slate-900">
                    {["1", "2", "3", "4", "5", "6", "TOTAL"].map((sub) => (
                      <th key={sub} className="py-1.5 px-2 font-extrabold text-center w-14 border-r border-slate-400">
                        {sub}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bundle.kelengkapan_24jam.length === 0 ? (
                    <tr>
                      <td colSpan={13} className="py-10 text-center text-gray-400 italic font-semibold">
                        Belum ada data pasien. Klik &quot;Tambah Baris&quot;.
                      </td>
                    </tr>
                  ) : (
                    bundle.kelengkapan_24jam.map((row, idx) => {
                      const tot = calcKelengkapan24Total(row);
                      return (
                        <tr key={`${row.id}-${idx}`} className="border-b border-slate-300 hover:bg-emerald-50/20">
                          <td className="py-1.5 px-2 text-center font-bold border-r border-slate-300 tabular-nums">{idx + 1}</td>
                          <td className="py-1.5 px-1.5 border-r border-slate-300">
                            <input
                              type="date"
                              value={row.tanggal}
                              onChange={(e) => update24Row(row.id, "tanggal", e.target.value)}
                              className="w-full bg-transparent outline-none text-xs font-semibold text-slate-800 text-center"
                            />
                          </td>
                          <td className="py-1.5 px-2 border-r border-slate-300">
                            <input
                              type="text"
                              placeholder="Nama Pasien"
                              value={row.nama_pasien}
                              onChange={(e) => update24Row(row.id, "nama_pasien", e.target.value)}
                              className="w-full bg-transparent outline-none text-xs font-bold text-slate-900 uppercase placeholder:normal-case placeholder:font-normal"
                            />
                          </td>
                          <td className="py-1.5 px-2 border-r border-slate-300">
                            <input
                              type="text"
                              placeholder="164042"
                              value={row.no_rm}
                              onChange={(e) => update24Row(row.id, "no_rm", e.target.value)}
                              className="w-full bg-transparent outline-none text-xs font-semibold text-slate-800 text-center tabular-nums"
                            />
                          </td>
                          {(
                            [
                              "c1_identitas",
                              "c2_riwayat",
                              "c3_resume",
                              "c4_instruksi",
                              "c5_kembali_24j",
                              "c6_kembali_lebih_24j",
                            ] as const
                          ).map((fk) => {
                            const val = row[fk];
                            return (
                              <td key={fk} className="py-1 px-1 text-center border-r border-slate-300">
                                <div className="inline-flex rounded border border-slate-200 overflow-hidden bg-slate-50">
                                  {(["1", "0"] as const).map((opt) => (
                                    <button
                                      key={opt}
                                      type="button"
                                      onClick={() => update24Row(row.id, fk, val === opt ? "" : opt)}
                                      className={`px-1.5 py-0.5 text-[10px] font-black transition-colors ${
                                        val === opt
                                          ? opt === "1"
                                            ? fk === "c6_kembali_lebih_24j"
                                              ? "bg-rose-600 text-white"
                                              : "bg-emerald-600 text-white"
                                            : "bg-slate-600 text-white"
                                          : "text-slate-500 hover:bg-slate-200"
                                      }`}
                                    >
                                      {opt}
                                    </button>
                                  ))}
                                </div>
                              </td>
                            );
                          })}
                          <td className="py-1.5 px-2 text-center border-r border-slate-300">
                            <span
                              className={`inline-flex items-center justify-center w-6 h-6 rounded text-xs font-black ${
                                tot === 1
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-rose-100 text-rose-800"
                              }`}
                            >
                              {tot}
                            </span>
                          </td>
                          <td className="py-1.5 px-2 border-r border-slate-300">
                            <input
                              type="text"
                              placeholder="Catatan"
                              value={row.keterangan}
                              onChange={(e) => update24Row(row.id, "keterangan", e.target.value)}
                              className="w-full bg-transparent outline-none text-xs text-slate-700"
                            />
                          </td>
                          <td className="py-1.5 px-1.5 text-center">
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => fillAll24Row(row.id)}
                                title="Lengkap <= 24 Jam"
                                className="text-emerald-600 hover:bg-emerald-50 p-1 rounded"
                              >
                                <Check size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  onChange({
                                    ...bundle,
                                    kelengkapan_24jam: bundle.kelengkapan_24jam.filter(
                                      (r) => r.id !== row.id,
                                    ),
                                  })
                                }
                                title="Hapus Baris"
                                className="text-red-500 hover:bg-red-50 p-1 rounded"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                  <tr className="bg-slate-100 font-black border-t-2 border-slate-400">
                    <td colSpan={10} className="py-2 px-3 text-right border-r border-slate-400">
                      TOTAL LENGKAP ≤ 24 JAM
                    </td>
                    <td className="py-2 px-2 text-center border-r border-slate-400 text-emerald-800 tabular-nums">
                      {bundle.kelengkapan_24jam.filter((r) => calcKelengkapan24Total(r) === 1).length}
                    </td>
                    <td colSpan={2} className="py-2 px-3 text-xs text-slate-600">
                      / {bundle.kelengkapan_24jam.length} Pasien
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Excel Legend Card */}
            <div className="w-full xl:w-72 shrink-0 bg-white border border-slate-400 rounded-xl p-4 space-y-2 text-xs">
              <p className="font-black text-slate-900 uppercase border-b border-slate-200 pb-1.5">
                Keterangan Kolom (1 – 6)
              </p>
              <ol className="space-y-1 text-slate-700 font-semibold list-decimal list-inside">
                <li>Identitas Pasien</li>
                <li>Riwayat Keluar Masuk</li>
                <li>Resume</li>
                <li>Instruksi Dokter</li>
                <li>Kembali dalam waktu 24 jam</li>
                <li>Kembali lebih dari 24 jam</li>
              </ol>
              <div className="pt-2 border-t border-slate-200 space-y-1 text-[11px]">
                <p className="font-bold text-slate-800">
                  Numerator: <span className="font-black text-emerald-700">{metrics.num}</span>
                </p>
                <p className="font-bold text-slate-800">
                  Denomerator: <span className="font-black">{metrics.filled24.length}</span>
                </p>
                <p className="font-bold text-slate-800">
                  Standar: <span className="font-black text-emerald-700">100% (1)</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
