import React, { useEffect, useMemo, useState } from "react";
import { FileUp, Plus, Trash2, X, Check } from "lucide-react";
import {
  RadiologiAuditBundle,
  RadJumlahPemeriksaanRow,
  RadRejectRow,
  RadThoraxRow,
  RadTindakanRow,
} from "@/store/useStore";

export type RadSheetKey =
  | "jumlah_pemeriksaan"
  | "reject_analisis"
  | "thorax_wt"
  | "tindakan_ekspertisi";

const makeRowId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const DEFAULT_RADIOLOGI_PEMERIKSAAN_LIST = [
  "Abd 3 posisi 3x Penyinaran Non Intensif",
  "Antebrachii 2x Penyinaran Non Intensif",
  "Clavicular 1x Penyinaran Non Intensif",
  "Cruris 2x Penyinaran Intensif",
  "Cruris 2x Penyinaran Non Intensif",
  "Elbow joint 2x Penyinaran Non Intensif",
  "Femur 2x Penyinaran Intensif",
  "Femur 2x Penyinaran Non Intensif",
  "Genu 2x Penyinaran Non Intensif",
  "Manus 2x Penyinaran Non Intensif",
  "Os nasal 2x Penyinaran Non Intensif",
  "Panoramic 1x Penyinaran Non Intensif",
  "Pedis 2x Penyinaran Non Intensif",
  "Schedell 2x Penyinaran Non Intensif",
  "Shoulder 1x Penyinaran Non Intensif",
  "Shoulder 2x Penyinaran Non Intensif",
  "Thorax foto 1x Penyinaran Intensif",
  "Thorax foto 1x Penyinaran Non Intensif",
  "USG Dopler/Echo Cardiografi Non Intensif",
  "USG Organ Khusus Kelas Khusus",
  "USG Upper Abdomen/Lower Abdomen Non Intensif",
  "USG Whole Abdomen Non Intensif",
  "VLS 2x Penyinaran Non Intensif",
  "Wrist joint 2x Penyinaran Non Intensif",
];

// Convert Excel serial date (e.g. 46082) or DD/MM/YYYY or YYYY-MM-DD to YYYY-MM-DD
export const parseExcelSerialOrDate = (raw: string, fallback: string): string => {
  const s = String(raw || "").trim();
  if (!s) return fallback;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const dmy = s.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
  if (dmy) {
    return `${dmy[3]}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}`;
  }
  const num = Number(s);
  if (!isNaN(num) && num >= 30000 && num <= 70000) {
    const utcMs = Math.round((num - 25569) * 86400 * 1000);
    const d = new Date(utcMs);
    if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  }
  return fallback;
};

// Convert Excel decimal fraction of day (e.g. 0.725659722) or HH:MM:SS to HH:MM:SS
export const parseExcelFractionOrTime = (raw: string): string => {
  const s = String(raw || "").trim();
  if (!s) return "";
  if (/^\d{1,2}[:.]\d{2}([:.]\d{2})?$/.test(s)) {
    const parts = s.replace(/\./g, ":").split(":");
    const h = Number(parts[0]);
    const m = Number(parts[1]);
    const sec = Number(parts[2] ?? 0);
    if (h >= 0 && h <= 23 && m >= 0 && m <= 59 && sec >= 0 && sec <= 59) {
      return [h, m, sec].map((v) => String(v).padStart(2, "0")).join(":");
    }
  }
  const frac = Number(s);
  if (!isNaN(frac) && frac >= 0 && frac < 1) {
    const totalSecs = Math.round(frac * 86400);
    const h = Math.floor(totalSecs / 3600) % 24;
    const m = Math.floor((totalSecs % 3600) / 60);
    const sec = totalSecs % 60;
    return [h, m, sec].map((v) => String(v).padStart(2, "0")).join(":");
  }
  return "";
};

export const calcThoraxDuration = (visit: string, visitExp: string) => {
  const n1 = parseExcelFractionOrTime(visit);
  const n2 = parseExcelFractionOrTime(visitExp);
  if (!n1 || !n2) {
    return { diffSecs: 0, jamText: "", hasTimes: false, kurang180: null as boolean | null };
  }
  const [h1, m1, s1] = n1.split(":").map(Number);
  const [h2, m2, s2] = n2.split(":").map(Number);
  let diffSecs = h2 * 3600 + m2 * 60 + s2 - (h1 * 3600 + m1 * 60 + s1);
  if (diffSecs < 0) diffSecs += 24 * 3600;
  const h = Math.floor(diffSecs / 3600);
  const m = Math.floor((diffSecs % 3600) / 60);
  const s = diffSecs % 60;
  const jamText = [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
  return {
    diffSecs,
    jamText,
    hasTimes: true,
    kurang180: diffSecs <= 10800, // 180 minutes = 10800 seconds
  };
};

export const createEmptyRadJumlahRow = (nama = ""): RadJumlahPemeriksaanRow => ({
  id: makeRowId(),
  nama_pemeriksaan: nama,
  jumlah: "",
});

export const createEmptyRadRejectRow = (defaultDate: string): RadRejectRow => ({
  id: makeRowId(),
  tanggal: defaultDate,
  nama_pasien: "",
  no_rm: "",
  jenis_pemeriksaan: "",
  foto_terbaca_baik: "TIDAK",
  alasan_tidak_terbaca: "",
  tindak_lanjut: "DILAKUKAN FOTO ULANG",
  ket: 1,
});

export const createEmptyRadThoraxRow = (defaultDate: string): RadThoraxRow => ({
  id: makeRowId(),
  tanggal: defaultDate,
  no_rm_nama: "",
  tindakan: "Thorax Foto",
  visit: "",
  visit_exp: "",
  jam_text: "",
  selisih_detik: 0,
  kurang_180: null,
});

export const createEmptyRadTindakanRow = (defaultDate: string): RadTindakanRow => ({
  id: makeRowId(),
  tanggal: defaultDate,
  no_rm_nama: "",
  pemeriksaan: "Thorax foto 1x Penyinaran Non Intensif",
  visit: "",
  dokter: "",
  expertise: true,
});

export const createEmptyRadiologiBundle = (defaultDate: string): RadiologiAuditBundle => ({
  jumlah_pemeriksaan: DEFAULT_RADIOLOGI_PEMERIKSAAN_LIST.map((n) =>
    createEmptyRadJumlahRow(n),
  ),
  reject_analisis: [createEmptyRadRejectRow(defaultDate)],
  reject_total_pasien: "",
  thorax_waktu_tunggu: [createEmptyRadThoraxRow(defaultDate)],
  tindakan_ekspertisi: [createEmptyRadTindakanRow(defaultDate)],
});

export const computeRadiologiMetrics = (
  bundle: RadiologiAuditBundle,
  mode: "thorax_wt" | "reject_analisis" | "tindakan_ekspertisi",
) => {
  const totalExamFromSheet = bundle.jumlah_pemeriksaan.reduce(
    (acc, r) => acc + (Number(r.jumlah) || 0),
    0,
  );
  const filledReject = bundle.reject_analisis.filter(
    (r) => r.nama_pasien.trim() !== "" || r.no_rm.trim() !== "" || r.alasan_tidak_terbaca.trim() !== "",
  );
  const filledThorax = bundle.thorax_waktu_tunggu.filter(
    (r) => r.no_rm_nama.trim() !== "" || r.visit.trim() !== "" || r.visit_exp.trim() !== "",
  );
  const filledTindakan = bundle.tindakan_ekspertisi.filter(
    (r) => r.no_rm_nama.trim() !== "" || r.dokter.trim() !== "",
  );

  if (mode === "thorax_wt") {
    const valid = filledThorax.filter((r) => r.kurang_180 !== null);
    const num = valid.filter((r) => r.kurang_180 === true).length;
    const den = valid.length || filledThorax.length || 1;
    return {
      num,
      den,
      filledReject,
      filledThorax,
      filledTindakan,
      totalExamFromSheet,
    };
  }

  if (mode === "reject_analisis") {
    const rejectCount = filledReject.filter(
      (r) => r.foto_terbaca_baik === "TIDAK" || Number(r.ket) === 1,
    ).length;
    const totalPasien =
      Number(bundle.reject_total_pasien) ||
      totalExamFromSheet ||
      filledTindakan.length ||
      filledReject.length ||
      1;
    return {
      num: rejectCount,
      den: totalPasien,
      filledReject,
      filledThorax,
      filledTindakan,
      totalExamFromSheet,
    };
  }

  // tindakan_ekspertisi
  const num = filledTindakan.filter((r) => r.expertise).length;
  const den = filledTindakan.length || 1;
  return {
    num,
    den,
    filledReject,
    filledThorax,
    filledTindakan,
    totalExamFromSheet,
  };
};

export const stripEmptyRadiologiRows = (
  bundle: RadiologiAuditBundle,
): RadiologiAuditBundle => ({
  jumlah_pemeriksaan: bundle.jumlah_pemeriksaan.filter(
    (r) => r.nama_pemeriksaan.trim() !== "" && Number(r.jumlah) > 0,
  ),
  reject_analisis: bundle.reject_analisis.filter(
    (r) => r.nama_pasien.trim() !== "" || r.no_rm.trim() !== "" || r.alasan_tidak_terbaca.trim() !== "",
  ),
  reject_total_pasien: bundle.reject_total_pasien,
  thorax_waktu_tunggu: bundle.thorax_waktu_tunggu.filter(
    (r) => r.no_rm_nama.trim() !== "" || r.visit.trim() !== "" || r.visit_exp.trim() !== "",
  ),
  tindakan_ekspertisi: bundle.tindakan_ekspertisi.filter(
    (r) => r.no_rm_nama.trim() !== "" || r.dokter.trim() !== "",
  ),
});

interface Props {
  bundle: RadiologiAuditBundle;
  onChange: (next: RadiologiAuditBundle) => void;
  defaultTab: "thorax_wt" | "reject_analisis" | "tindakan_ekspertisi";
  defaultDate: string;
  bulanLabel: string;
  tahunLabel: string;
  computedCapaian: number;
}

export default function RadiologiAuditForm({
  bundle,
  onChange,
  defaultTab,
  defaultDate,
  bulanLabel,
  tahunLabel,
  computedCapaian,
}: Props) {
  const [activeSheet, setActiveSheet] = useState<RadSheetKey>(defaultTab);
  const [showPasteBox, setShowPasteBox] = useState(false);
  const [pasteText, setPasteText] = useState("");

  useEffect(() => {
    setActiveSheet(defaultTab);
    setShowPasteBox(false);
  }, [defaultTab]);

  const metrics = useMemo(
    () => computeRadiologiMetrics(bundle, defaultTab),
    [bundle, defaultTab],
  );

  const rejectTotalPasienEffective =
    Number(bundle.reject_total_pasien) || metrics.totalExamFromSheet || 0;
  const rejectCount = metrics.filledReject.filter(
    (r) => r.foto_terbaca_baik === "TIDAK" || Number(r.ket) === 1,
  ).length;
  const rejectRatioPct =
    rejectTotalPasienEffective > 0
      ? ((rejectCount / rejectTotalPasienEffective) * 100).toFixed(2)
      : "0.00";

  const tabs: Array<{ key: RadSheetKey; label: string; badge?: number | string }> = [
    {
      key: "jumlah_pemeriksaan",
      label: "1. Jumlah Pemeriksaan",
      badge: metrics.totalExamFromSheet,
    },
    {
      key: "reject_analisis",
      label: "2. Reject Analisis Rontgent",
      badge: metrics.filledReject.length,
    },
    {
      key: "thorax_wt",
      label: "3. Waktu Tunggu Thorax Foto",
      badge: metrics.filledThorax.length,
    },
    {
      key: "tindakan_ekspertisi",
      label: "4. Tindakan & Ekspertisi",
      badge: metrics.filledTindakan.length,
    },
  ];

  const handleImportPaste = () => {
    const lines = pasteText
      .split(/\r?\n/)
      .map((l) => l.trimEnd())
      .filter((l) => l.trim() !== "");
    if (lines.length === 0) return;

    if (activeSheet === "jumlah_pemeriksaan") {
      const parsed: RadJumlahPemeriksaanRow[] = [];
      for (const line of lines) {
        const cols = line.split("\t").map((c) => c.trim());
        if (cols.length < 2) continue;
        const low = line.toLowerCase();
        if (low.includes("jumlah pemeriksaan") || low.includes("total")) continue;
        const off = /^\d+(\.0)?$/.test(cols[0]) && cols.length >= 3 ? 1 : 0;
        const nama = cols[off] || "";
        const qty = Number(String(cols[off + 1] || "").replace(/[^\d.]/g, ""));
        if (!nama) continue;
        parsed.push({ id: makeRowId(), nama_pemeriksaan: nama, jumlah: isNaN(qty) ? 0 : qty });
      }
      if (parsed.length === 0) {
        alert("Tidak ada baris valid untuk Jumlah Pemeriksaan Radiologi.");
        return;
      }
      onChange({ ...bundle, jumlah_pemeriksaan: parsed });
    } else if (activeSheet === "reject_analisis") {
      const parsed: RadRejectRow[] = [];
      for (const line of lines) {
        const cols = line.split("\t").map((c) => c.trim());
        if (cols.length < 5) continue;
        const low = line.toLowerCase();
        if (
          low.includes("nama pasien") ||
          low.includes("mutu reject") ||
          low.startsWith("total") ||
          low.startsWith("hasil reject")
        ) {
          continue;
        }
        const off = /^\d+(\.0)?$/.test(cols[0]) && cols.length >= 6 ? 1 : 0;
        const tanggal = parseExcelSerialOrDate(cols[off] || "", defaultDate);
        const nama = cols[off + 1] || "";
        const noRm = String(cols[off + 2] || "").replace(/\.0$/, "");
        const jenis = cols[off + 3] || "";
        const hasil = (cols[off + 4] || "").toUpperCase().includes("YA") ? "YA" : "TIDAK";
        const alasan = cols[off + 5] || "";
        const tindak = cols[off + 6] || "";
        const ket = hasil === "TIDAK" ? 1 : 0;
        if (!nama && !noRm) continue;
        parsed.push({
          id: makeRowId(),
          tanggal,
          nama_pasien: nama,
          no_rm: noRm,
          jenis_pemeriksaan: jenis,
          foto_terbaca_baik: hasil,
          alasan_tidak_terbaca: alasan,
          tindak_lanjut: tindak,
          ket,
        });
      }
      if (parsed.length === 0) {
        alert("Tidak ada baris valid untuk Mutu Reject Analisis Pelayanan Rontgent.");
        return;
      }
      onChange({ ...bundle, reject_analisis: [...metrics.filledReject, ...parsed] });
    } else if (activeSheet === "thorax_wt") {
      const parsed: RadThoraxRow[] = [];
      for (const line of lines) {
        const cols = line.split("\t").map((c) => c.trim());
        if (cols.length < 5) continue;
        const low = line.toLowerCase();
        if (low.includes("no rm nama") || low.includes("capaian")) continue;
        const off = /^\d+(\.0)?$/.test(cols[0]) && cols.length >= 6 ? 1 : 0;
        const tanggal = parseExcelSerialOrDate(cols[off] || "", defaultDate);
        const nama = cols[off + 1] || "";
        const tindakan = cols[off + 2] || "Thorax Foto";
        const visit = parseExcelFractionOrTime(cols[off + 3] || "");
        const visitExp = parseExcelFractionOrTime(cols[off + 4] || "");
        if (!nama) continue;
        const calc = calcThoraxDuration(visit, visitExp);
        parsed.push({
          id: makeRowId(),
          tanggal,
          no_rm_nama: nama,
          tindakan,
          visit,
          visit_exp: visitExp,
          jam_text: calc.jamText,
          selisih_detik: calc.diffSecs,
          kurang_180: calc.hasTimes ? calc.kurang180 : null,
        });
      }
      if (parsed.length === 0) {
        alert("Tidak ada baris valid untuk Waktu Tunggu Thorax Foto.");
        return;
      }
      onChange({ ...bundle, thorax_waktu_tunggu: [...metrics.filledThorax, ...parsed] });
    } else if (activeSheet === "tindakan_ekspertisi") {
      const parsed: RadTindakanRow[] = [];
      for (const line of lines) {
        const cols = line.split("\t").map((c) => c.trim());
        if (cols.length < 4) continue;
        const low = line.toLowerCase();
        if (low.includes("no rm nama") || low.includes("tindakan radiologi") || low.startsWith(",total")) continue;
        const off = /^\d+(\.0)?$/.test(cols[0]) && cols.length >= 5 ? 1 : 0;
        const tanggal = parseExcelSerialOrDate(cols[off] || "", defaultDate);
        const nama = cols[off + 1] || "";
        const pemeriksaan = cols[off + 2] || "";
        const visit = parseExcelFractionOrTime(cols[off + 3] || "");
        const dokter = cols[off + 4] || "";
        const expRaw = cols[off + 5] || "√";
        const expertise = expRaw !== "" && expRaw.toUpperCase() !== "TIDAK" && expRaw !== "0";
        if (!nama) continue;
        parsed.push({
          id: makeRowId(),
          tanggal,
          no_rm_nama: nama,
          pemeriksaan,
          visit,
          dokter,
          expertise,
        });
      }
      if (parsed.length === 0) {
        alert("Tidak ada baris valid untuk Tindakan & Ekspertisi Radiologi.");
        return;
      }
      onChange({ ...bundle, tindakan_ekspertisi: [...metrics.filledTindakan, ...parsed] });
    }

    setPasteText("");
    setShowPasteBox(false);
  };

  return (
    <div className="bg-[#f8fafc] border border-white rounded-[28px] overflow-hidden shadow-[8px_8px_20px_rgba(160,175,195,0.2),-8px_-8px_20px_rgba(255,255,255,0.95)] animate-in fade-in">
      <div className="bg-emerald-600 p-5 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="font-extrabold text-white tracking-wide text-sm md:text-base">
            Formulir Mutu Ruang Radiologi
          </h3>
          <p className="text-[11px] font-semibold text-emerald-100">
            Unit: Radiologi • Bulan: {bulanLabel} {tahunLabel} • Indikator Aktif:{" "}
            {defaultTab === "thorax_wt"
              ? "Waktu Tunggu Thorax Foto ≤ 180 Menit (Target: 100%)"
              : defaultTab === "reject_analisis"
                ? "Reject Analisis Pelayanan Rontgent (Target: ≤ 2%)"
                : "Pelaksana Ekspertisi Hasil Pemeriksaan (Target: 100%)"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (activeSheet === "jumlah_pemeriksaan") {
                onChange({
                  ...bundle,
                  jumlah_pemeriksaan: [...bundle.jumlah_pemeriksaan, createEmptyRadJumlahRow()],
                });
              } else if (activeSheet === "reject_analisis") {
                onChange({
                  ...bundle,
                  reject_analisis: [...bundle.reject_analisis, createEmptyRadRejectRow(defaultDate)],
                });
              } else if (activeSheet === "thorax_wt") {
                onChange({
                  ...bundle,
                  thorax_waktu_tunggu: [...bundle.thorax_waktu_tunggu, createEmptyRadThoraxRow(defaultDate)],
                });
              } else {
                onChange({
                  ...bundle,
                  tindakan_ekspertisi: [...bundle.tindakan_ekspertisi, createEmptyRadTindakanRow(defaultDate)],
                });
              }
            }}
            className="flex items-center justify-center bg-white text-emerald-800 hover:bg-emerald-50 px-4 py-1.5 rounded-xl text-xs font-black transition-colors cursor-pointer"
          >
            Tambah Baris
          </button>
        </div>
      </div>

      {/* Sheet Tabs */}
      <div className="bg-slate-100 border-b border-slate-300 px-4 pt-2.5 flex flex-wrap gap-1.5">
        {tabs.map((t) => {
          const isAct = activeSheet === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => {
                setActiveSheet(t.key);
                setShowPasteBox(false);
              }}
              className={`px-3.5 py-2 rounded-t-xl text-xs font-extrabold border border-b-0 transition-all flex items-center gap-2 ${
                isAct
                  ? "bg-white text-emerald-800 border-slate-300 shadow-2xs -mb-px pb-2.5"
                  : "bg-slate-200/70 text-slate-600 border-transparent hover:bg-white/70"
              }`}
            >
              <span>{t.label}</span>
              {t.badge !== undefined && (
                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-black bg-emerald-100 text-emerald-800">
                  {t.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* SHEET 1: JUMLAH PEMERIKSAAN RADIOLOGI */}
      {activeSheet === "jumlah_pemeriksaan" && (
        <div className="p-5 overflow-x-auto space-y-3">
          <div className="text-center bg-slate-50 border border-slate-300 rounded-xl py-2.5 px-4">
            <p className="text-xs md:text-sm font-black text-slate-900 uppercase">
              JUMLAH PEMERIKSAAN RADIOLOGI {bulanLabel.toUpperCase()} {tahunLabel}
            </p>
          </div>
          <table className="w-full border-collapse border border-slate-400 bg-white text-xs max-w-3xl mx-auto">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-400 text-slate-900">
                <th className="py-2 px-2 border-r border-slate-400 text-center w-14">NO</th>
                <th className="py-2 px-3 border-r border-slate-400 text-left">JENIS PEMERIKSAAN</th>
                <th className="py-2 px-3 border-r border-slate-400 text-center w-28">JUMLAH</th>
                <th className="py-2 px-2 text-center w-14">AKSI</th>
              </tr>
            </thead>
            <tbody>
              {bundle.jumlah_pemeriksaan.map((row, idx) => (
                <tr key={`${row.id}-${idx}`} className="border-b border-slate-300 hover:bg-emerald-50/20">
                  <td className="py-1.5 px-2 text-center font-bold border-r border-slate-300 tabular-nums">{idx + 1}</td>
                  <td className="py-1.5 px-2.5 border-r border-slate-300">
                    <input
                      type="text"
                      value={row.nama_pemeriksaan}
                      onChange={(e) =>
                        onChange({
                          ...bundle,
                          jumlah_pemeriksaan: bundle.jumlah_pemeriksaan.map((r) =>
                            r.id === row.id ? { ...r, nama_pemeriksaan: e.target.value } : r,
                          ),
                        })
                      }
                      className="w-full bg-transparent outline-none font-semibold text-slate-800"
                    />
                  </td>
                  <td className="py-1.5 px-2 border-r border-slate-300 text-center">
                    <input
                      type="number"
                      min={0}
                      placeholder="0"
                      value={row.jumlah}
                      onChange={(e) =>
                        onChange({
                          ...bundle,
                          jumlah_pemeriksaan: bundle.jumlah_pemeriksaan.map((r) =>
                            r.id === row.id
                              ? { ...r, jumlah: e.target.value === "" ? "" : Number(e.target.value) }
                              : r,
                          ),
                        })
                      }
                      className="w-20 text-center border border-slate-200 rounded px-2 py-0.5 font-bold tabular-nums"
                    />
                  </td>
                  <td className="py-1.5 px-2 text-center">
                    <button
                      type="button"
                      onClick={() =>
                        onChange({
                          ...bundle,
                          jumlah_pemeriksaan: bundle.jumlah_pemeriksaan.filter((r) => r.id !== row.id),
                        })
                      }
                      className="text-red-500 hover:bg-red-50 p-1 rounded"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              <tr className="bg-emerald-50 font-black border-t-2 border-slate-400">
                <td colSpan={2} className="py-2 px-3 text-right border-r border-slate-400 uppercase">
                  TOTAL
                </td>
                <td className="py-2 px-3 text-center border-r border-slate-400 text-emerald-800 tabular-nums">
                  {metrics.totalExamFromSheet}
                </td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* SHEET 2: MUTU REJECT ANALISIS PELAYANAN RONTGENT */}
      {activeSheet === "reject_analisis" && (
        <div className="p-3 md:p-4 overflow-x-auto space-y-4">
          <div className="text-center bg-slate-50 border border-slate-300 rounded-xl py-2.5 px-4">
            <p className="text-xs md:text-sm font-black text-slate-900 uppercase">
              MUTU REJECT ANALISIS PELAYANAN RONTGENT
            </p>
          </div>

          <table className="w-full border-collapse border border-slate-400 bg-white text-xs min-w-[940px]">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-400 text-slate-900">
                <th className="py-2 px-1.5 border-r border-slate-400 text-center w-9">NO</th>
                <th className="py-2 px-2 border-r border-slate-400 text-center w-[118px]">TANGGAL</th>
                <th className="py-2 px-2.5 border-r border-slate-400 text-center min-w-[130px]">NAMA PASIEN</th>
                <th className="py-2 px-2 border-r border-slate-400 text-center w-20">NO RM</th>
                <th className="py-2 px-2 border-r border-slate-400 text-center min-w-[125px]">JENIS PEMERIKSAAN</th>
                <th className="py-2 px-2 border-r border-slate-400 text-center w-32 leading-tight">
                  HASIL FOTO TERBACA DENGAN BAIK (YA/TIDAK)
                </th>
                <th className="py-2 px-2 border-r border-slate-400 text-center min-w-[135px] leading-tight">
                  BILA TIDAK TERBACA ALASANYA
                </th>
                <th className="py-2 px-2 border-r border-slate-400 text-center min-w-[135px] leading-tight">
                  TINDAK LANJUT BILA FOTO TIDAK TERBACA
                </th>
                <th className="py-2 px-1.5 border-r border-slate-400 text-center w-12">KET</th>
                <th className="py-2 px-1.5 text-center w-11">AKSI</th>
              </tr>
            </thead>
            <tbody>
              {bundle.reject_analisis.map((row, idx) => (
                <tr key={`${row.id}-${idx}`} className="border-b border-slate-300 hover:bg-emerald-50/20">
                  <td className="py-1.5 px-2 text-center font-bold border-r border-slate-300 tabular-nums">{idx + 1}</td>
                  <td className="py-1.5 px-1.5 border-r border-slate-300">
                    <input
                      type="date"
                      value={row.tanggal}
                      onChange={(e) =>
                        onChange({
                          ...bundle,
                          reject_analisis: bundle.reject_analisis.map((r) =>
                            r.id === row.id ? { ...r, tanggal: e.target.value } : r,
                          ),
                        })
                      }
                      className="w-full bg-transparent outline-none text-xs font-semibold text-center"
                    />
                  </td>
                  <td className="py-1.5 px-2 border-r border-slate-300">
                    <input
                      type="text"
                      placeholder="Nama Pasien"
                      value={row.nama_pasien}
                      onChange={(e) =>
                        onChange({
                          ...bundle,
                          reject_analisis: bundle.reject_analisis.map((r) =>
                            r.id === row.id ? { ...r, nama_pasien: e.target.value } : r,
                          ),
                        })
                      }
                      className="w-full bg-transparent outline-none font-bold uppercase placeholder:normal-case placeholder:font-normal"
                    />
                  </td>
                  <td className="py-1.5 px-2 border-r border-slate-300">
                    <input
                      type="text"
                      placeholder="164321"
                      value={row.no_rm}
                      onChange={(e) =>
                        onChange({
                          ...bundle,
                          reject_analisis: bundle.reject_analisis.map((r) =>
                            r.id === row.id ? { ...r, no_rm: e.target.value } : r,
                          ),
                        })
                      }
                      className="w-full bg-transparent outline-none text-center font-semibold tabular-nums"
                    />
                  </td>
                  <td className="py-1.5 px-2 border-r border-slate-300">
                    <input
                      type="text"
                      placeholder="Abd 3 posisi"
                      value={row.jenis_pemeriksaan}
                      onChange={(e) =>
                        onChange({
                          ...bundle,
                          reject_analisis: bundle.reject_analisis.map((r) =>
                            r.id === row.id ? { ...r, jenis_pemeriksaan: e.target.value } : r,
                          ),
                        })
                      }
                      className="w-full bg-transparent outline-none"
                    />
                  </td>
                  <td className="py-1.5 px-2 border-r border-slate-300 text-center">
                    <select
                      value={row.foto_terbaca_baik}
                      onChange={(e) => {
                        const val = e.target.value as "YA" | "TIDAK" | "";
                        onChange({
                          ...bundle,
                          reject_analisis: bundle.reject_analisis.map((r) =>
                            r.id === row.id
                              ? { ...r, foto_terbaca_baik: val, ket: val === "TIDAK" ? 1 : 0 }
                              : r,
                          ),
                        });
                      }}
                      className={`border rounded px-2 py-1 text-xs font-black ${
                        row.foto_terbaca_baik === "TIDAK"
                          ? "bg-rose-50 text-rose-800 border-rose-200"
                          : "bg-emerald-50 text-emerald-800 border-emerald-200"
                      }`}
                    >
                      <option value="TIDAK">TIDAK</option>
                      <option value="YA">YA</option>
                    </select>
                  </td>
                  <td className="py-1.5 px-2 border-r border-slate-300">
                    <input
                      type="text"
                      placeholder="Alasan tidak terbaca"
                      value={row.alasan_tidak_terbaca}
                      onChange={(e) =>
                        onChange({
                          ...bundle,
                          reject_analisis: bundle.reject_analisis.map((r) =>
                            r.id === row.id ? { ...r, alasan_tidak_terbaca: e.target.value } : r,
                          ),
                        })
                      }
                      className="w-full bg-transparent outline-none"
                    />
                  </td>
                  <td className="py-1.5 px-2 border-r border-slate-300">
                    <input
                      type="text"
                      placeholder="Tindak lanjut"
                      value={row.tindak_lanjut}
                      onChange={(e) =>
                        onChange({
                          ...bundle,
                          reject_analisis: bundle.reject_analisis.map((r) =>
                            r.id === row.id ? { ...r, tindak_lanjut: e.target.value } : r,
                          ),
                        })
                      }
                      className="w-full bg-transparent outline-none"
                    />
                  </td>
                  <td className="py-1.5 px-2 border-r border-slate-300 text-center font-black tabular-nums">
                    {row.ket}
                  </td>
                  <td className="py-1.5 px-2 text-center">
                    <button
                      type="button"
                      onClick={() =>
                        onChange({
                          ...bundle,
                          reject_analisis: bundle.reject_analisis.filter((r) => r.id !== row.id),
                        })
                      }
                      className="text-red-500 hover:bg-red-50 p-1 rounded"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}

              <tr className="bg-slate-50 font-black border-t-2 border-slate-400">
                <td colSpan={8} className="py-2 px-3 border-r border-slate-400">TOTAL REJECT</td>
                <td className="py-2 px-2 text-center border-r border-slate-400 text-rose-700 tabular-nums">
                  {rejectCount}
                </td>
                <td />
              </tr>
              <tr className="bg-slate-50 font-black border-t border-slate-300">
                <td colSpan={8} className="py-2 px-3 border-r border-slate-400">
                  TOTAL PASIEN (Otomatis dari Jumlah Pemeriksaan atau isi manual)
                </td>
                <td colSpan={2} className="py-1.5 px-2 text-center">
                  <input
                    type="number"
                    min={1}
                    placeholder={String(metrics.totalExamFromSheet || 0)}
                    value={bundle.reject_total_pasien}
                    onChange={(e) =>
                      onChange({
                        ...bundle,
                        reject_total_pasien: e.target.value === "" ? "" : Number(e.target.value),
                      })
                    }
                    className="w-24 text-center border border-slate-300 rounded px-2 py-1 font-black bg-white tabular-nums"
                  />
                </td>
              </tr>
              <tr className="bg-emerald-50 font-black border-t border-slate-400">
                <td colSpan={8} className="py-2 px-3 border-r border-slate-400">
                  HASIL REJECT ANALYSIS (Standar &le; 2%)
                </td>
                <td
                  colSpan={2}
                  className={`py-2 px-2 text-center tabular-nums ${
                    Number(rejectRatioPct) <= 2 ? "text-emerald-800" : "text-rose-700"
                  }`}
                >
                  {rejectRatioPct}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* SHEET 3: WAKTU TUNGGU HASIL PELAYANAN THORAX FOTO */}
      {activeSheet === "thorax_wt" && (
        <div className="p-5 overflow-x-auto space-y-4">
          <div className="text-center bg-slate-50 border border-slate-300 rounded-xl py-2.5 px-4">
            <p className="text-xs md:text-sm font-black text-slate-900 uppercase">
              WAKTU TUNGGU HASIL PELAYANAN THORAX FOTO (&le; 180 MENIT)
            </p>
          </div>
          <table className="w-full border-collapse border border-slate-400 bg-white text-xs min-w-[920px]">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-400 text-slate-900">
                <th className="py-2 px-2 border-r border-slate-400 text-center w-12">NO</th>
                <th className="py-2 px-2 border-r border-slate-400 text-center w-32">Tanggal</th>
                <th className="py-2 px-3 border-r border-slate-400 text-left min-w-[210px]">No RM Nama</th>
                <th className="py-2 px-2 border-r border-slate-400 text-center w-32">Tindakan</th>
                <th className="py-2 px-2 border-r border-slate-400 text-center w-32">Visit</th>
                <th className="py-2 px-2 border-r border-slate-400 text-center w-32">Visit EXP</th>
                <th className="py-2 px-2 border-r border-slate-400 text-center w-28">JAM</th>
                <th className="py-2 px-2 border-r border-slate-400 text-center w-16">&lt;180</th>
                <th className="py-2 px-2 border-r border-slate-400 text-center w-16">180&gt;</th>
                <th className="py-2 px-2 text-center w-12">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {bundle.thorax_waktu_tunggu.map((row, idx) => (
                <tr key={`${row.id}-${idx}`} className="border-b border-slate-300 hover:bg-emerald-50/20">
                  <td className="py-1.5 px-2 text-center font-bold border-r border-slate-300 tabular-nums">{idx + 1}</td>
                  <td className="py-1.5 px-1.5 border-r border-slate-300">
                    <input
                      type="date"
                      value={row.tanggal}
                      onChange={(e) =>
                        onChange({
                          ...bundle,
                          thorax_waktu_tunggu: bundle.thorax_waktu_tunggu.map((r) =>
                            r.id === row.id ? { ...r, tanggal: e.target.value } : r,
                          ),
                        })
                      }
                      className="w-full bg-transparent outline-none text-xs font-semibold text-center"
                    />
                  </td>
                  <td className="py-1.5 px-2.5 border-r border-slate-300">
                    <input
                      type="text"
                      placeholder="No RM / Nama Pasien"
                      value={row.no_rm_nama}
                      onChange={(e) =>
                        onChange({
                          ...bundle,
                          thorax_waktu_tunggu: bundle.thorax_waktu_tunggu.map((r) =>
                            r.id === row.id ? { ...r, no_rm_nama: e.target.value } : r,
                          ),
                        })
                      }
                      className="w-full bg-transparent outline-none font-bold uppercase placeholder:normal-case placeholder:font-normal"
                    />
                  </td>
                  <td className="py-1.5 px-2 border-r border-slate-300">
                    <input
                      type="text"
                      value={row.tindakan}
                      onChange={(e) =>
                        onChange({
                          ...bundle,
                          thorax_waktu_tunggu: bundle.thorax_waktu_tunggu.map((r) =>
                            r.id === row.id ? { ...r, tindakan: e.target.value } : r,
                          ),
                        })
                      }
                      className="w-full bg-transparent outline-none text-center"
                    />
                  </td>
                  <td className="py-1.5 px-1.5 border-r border-slate-300">
                    <input
                      type="time"
                      step="1"
                      value={row.visit}
                      onChange={(e) => {
                        const val = e.target.value;
                        onChange({
                          ...bundle,
                          thorax_waktu_tunggu: bundle.thorax_waktu_tunggu.map((r) => {
                            if (r.id !== row.id) return r;
                            const c = calcThoraxDuration(val, r.visit_exp);
                            return {
                              ...r,
                              visit: val,
                              jam_text: c.jamText,
                              selisih_detik: c.diffSecs,
                              kurang_180: c.hasTimes ? c.kurang180 : null,
                            };
                          }),
                        });
                      }}
                      className="w-full bg-transparent outline-none font-semibold text-center tabular-nums"
                    />
                  </td>
                  <td className="py-1.5 px-1.5 border-r border-slate-300">
                    <input
                      type="time"
                      step="1"
                      value={row.visit_exp}
                      onChange={(e) => {
                        const val = e.target.value;
                        onChange({
                          ...bundle,
                          thorax_waktu_tunggu: bundle.thorax_waktu_tunggu.map((r) => {
                            if (r.id !== row.id) return r;
                            const c = calcThoraxDuration(r.visit, val);
                            return {
                              ...r,
                              visit_exp: val,
                              jam_text: c.jamText,
                              selisih_detik: c.diffSecs,
                              kurang_180: c.hasTimes ? c.kurang180 : null,
                            };
                          }),
                        });
                      }}
                      className="w-full bg-transparent outline-none font-semibold text-center tabular-nums"
                    />
                  </td>
                  <td className="py-1.5 px-2 text-center font-mono font-bold border-r border-slate-300 tabular-nums">
                    {row.jam_text || "-"}
                  </td>
                  <td className="py-1.5 px-2 text-center border-r border-slate-300 font-black text-emerald-700">
                    {row.kurang_180 === true ? "√" : ""}
                  </td>
                  <td className="py-1.5 px-2 text-center border-r border-slate-300 font-black text-rose-700">
                    {row.kurang_180 === false ? "√" : ""}
                  </td>
                  <td className="py-1.5 px-2 text-center">
                    <button
                      type="button"
                      onClick={() =>
                        onChange({
                          ...bundle,
                          thorax_waktu_tunggu: bundle.thorax_waktu_tunggu.filter((r) => r.id !== row.id),
                        })
                      }
                      className="text-red-500 hover:bg-red-50 p-1 rounded"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              <tr className="bg-slate-100 font-black border-t-2 border-slate-400">
                <td colSpan={6} className="py-2 px-3 text-right border-r border-slate-400">CAPAIAN &amp; REKAP</td>
                <td className="py-2 px-2 text-center border-r border-slate-400 tabular-nums">
                  {metrics.filledThorax.length}
                </td>
                <td className="py-2 px-2 text-center border-r border-slate-400 text-emerald-700 tabular-nums">
                  {metrics.filledThorax.filter((r) => r.kurang_180 === true).length}
                </td>
                <td className="py-2 px-2 text-center border-r border-slate-400 text-rose-700 tabular-nums">
                  {metrics.filledThorax.filter((r) => r.kurang_180 === false).length}
                </td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* SHEET 4: TINDAKAN RADIOLOGI (PELAKSANA EKSPERTISI) */}
      {activeSheet === "tindakan_ekspertisi" && (
        <div className="p-5 overflow-x-auto space-y-4">
          <div className="text-center bg-slate-50 border border-slate-300 rounded-xl py-2.5 px-4">
            <p className="text-xs md:text-sm font-black text-slate-900 uppercase">
              TINDAKAN RADIOLOGI &amp; PELAKSANA EKSPERTISI {bulanLabel.toUpperCase()} {tahunLabel}
            </p>
          </div>
          <datalist id="rad-dokter-list">
            <option value="dr. Rosilah, Sp.Rad." />
            <option value="dr. M. Arifin Ramadhani" />
            <option value="dr. Ade Kurnia Cornellis Bastian" />
            <option value="dr. Nurul Iman" />
            <option value="dr. Maria Savvyany Saputra" />
            <option value="dr. Chrysman Andreria Hatulely" />
          </datalist>
          <table className="w-full border-collapse border border-slate-400 bg-white text-xs min-w-[920px]">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-400 text-slate-900">
                <th className="py-2 px-2 border-r border-slate-400 text-center w-12">NO</th>
                <th className="py-2 px-2 border-r border-slate-400 text-center w-32">Tanggal</th>
                <th className="py-2 px-3 border-r border-slate-400 text-left min-w-[190px]">NO RM Nama</th>
                <th className="py-2 px-3 border-r border-slate-400 text-left min-w-[230px]">Pemeriksaan</th>
                <th className="py-2 px-2 border-r border-slate-400 text-center w-28">Visit</th>
                <th className="py-2 px-3 border-r border-slate-400 text-left min-w-[200px]">Dokter</th>
                <th className="py-2 px-2 border-r border-slate-400 text-center w-24">Expertise</th>
                <th className="py-2 px-2 text-center w-12">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {bundle.tindakan_ekspertisi.map((row, idx) => (
                <tr key={`${row.id}-${idx}`} className="border-b border-slate-300 hover:bg-emerald-50/20">
                  <td className="py-1.5 px-2 text-center font-bold border-r border-slate-300 tabular-nums">{idx + 1}</td>
                  <td className="py-1.5 px-1.5 border-r border-slate-300">
                    <input
                      type="date"
                      value={row.tanggal}
                      onChange={(e) =>
                        onChange({
                          ...bundle,
                          tindakan_ekspertisi: bundle.tindakan_ekspertisi.map((r) =>
                            r.id === row.id ? { ...r, tanggal: e.target.value } : r,
                          ),
                        })
                      }
                      className="w-full bg-transparent outline-none text-xs font-semibold text-center"
                    />
                  </td>
                  <td className="py-1.5 px-2 border-r border-slate-300">
                    <input
                      type="text"
                      placeholder="NO RM / Nama"
                      value={row.no_rm_nama}
                      onChange={(e) =>
                        onChange({
                          ...bundle,
                          tindakan_ekspertisi: bundle.tindakan_ekspertisi.map((r) =>
                            r.id === row.id ? { ...r, no_rm_nama: e.target.value } : r,
                          ),
                        })
                      }
                      className="w-full bg-transparent outline-none font-bold uppercase placeholder:normal-case placeholder:font-normal"
                    />
                  </td>
                  <td className="py-1.5 px-2 border-r border-slate-300">
                    <input
                      type="text"
                      value={row.pemeriksaan}
                      onChange={(e) =>
                        onChange({
                          ...bundle,
                          tindakan_ekspertisi: bundle.tindakan_ekspertisi.map((r) =>
                            r.id === row.id ? { ...r, pemeriksaan: e.target.value } : r,
                          ),
                        })
                      }
                      className="w-full bg-transparent outline-none"
                    />
                  </td>
                  <td className="py-1.5 px-1.5 border-r border-slate-300">
                    <input
                      type="time"
                      step="1"
                      value={row.visit}
                      onChange={(e) =>
                        onChange({
                          ...bundle,
                          tindakan_ekspertisi: bundle.tindakan_ekspertisi.map((r) =>
                            r.id === row.id ? { ...r, visit: e.target.value } : r,
                          ),
                        })
                      }
                      className="w-full bg-transparent outline-none font-semibold text-center tabular-nums"
                    />
                  </td>
                  <td className="py-1.5 px-2 border-r border-slate-300">
                    <input
                      type="text"
                      list="rad-dokter-list"
                      placeholder="Nama Dokter"
                      value={row.dokter}
                      onChange={(e) =>
                        onChange({
                          ...bundle,
                          tindakan_ekspertisi: bundle.tindakan_ekspertisi.map((r) =>
                            r.id === row.id ? { ...r, dokter: e.target.value } : r,
                          ),
                        })
                      }
                      className="w-full bg-transparent outline-none"
                    />
                  </td>
                  <td className="py-1.5 px-2 text-center border-r border-slate-300">
                    <button
                      type="button"
                      onClick={() =>
                        onChange({
                          ...bundle,
                          tindakan_ekspertisi: bundle.tindakan_ekspertisi.map((r) =>
                            r.id === row.id ? { ...r, expertise: !r.expertise } : r,
                          ),
                        })
                      }
                      className={`inline-flex items-center justify-center w-7 h-7 rounded-lg border font-black ${
                        row.expertise
                          ? "bg-emerald-600 text-white border-emerald-700"
                          : "bg-slate-100 text-slate-400 border-slate-300"
                      }`}
                    >
                      {row.expertise ? <Check size={14} /> : "-"}
                    </button>
                  </td>
                  <td className="py-1.5 px-2 text-center">
                    <button
                      type="button"
                      onClick={() =>
                        onChange({
                          ...bundle,
                          tindakan_ekspertisi: bundle.tindakan_ekspertisi.filter((r) => r.id !== row.id),
                        })
                      }
                      className="text-red-500 hover:bg-red-50 p-1 rounded"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              <tr className="bg-slate-100 font-black border-t-2 border-slate-400">
                <td colSpan={6} className="py-2 px-3 text-right border-r border-slate-400">
                  TOTAL EKSPERTISE
                </td>
                <td className="py-2 px-2 text-center border-r border-slate-400 text-emerald-800 tabular-nums">
                  {metrics.filledTindakan.filter((r) => r.expertise).length} / {metrics.filledTindakan.length}
                </td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
