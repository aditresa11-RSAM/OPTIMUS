import React, { useMemo, useState } from "react";
import { Clock, FileUp, Plus, Trash2, X } from "lucide-react";
import { WaktuTungguData } from "@/store/useStore";

export const RAJAL_SHEET_POLIS = [
  "Penyakit Dalam",
  "Bedah",
  "Anak",
  "Obgyn",
  "Umum",
] as const;

export type RajalSheetPoli = (typeof RAJAL_SHEET_POLIS)[number];

const makeRowId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const MONTH_ID_MAP: Record<string, string> = {
  januari: "01",
  jan: "01",
  februari: "02",
  feb: "02",
  maret: "03",
  mar: "03",
  april: "04",
  apr: "04",
  mei: "05",
  may: "05",
  juni: "06",
  jun: "06",
  juli: "07",
  jul: "07",
  agustus: "08",
  agu: "08",
  agt: "08",
  aug: "08",
  september: "09",
  sep: "09",
  oktober: "10",
  okt: "10",
  oct: "10",
  november: "11",
  nov: "11",
  desember: "12",
  des: "12",
  dec: "12",
};

export const normalizeRajalTimeHMS = (raw: string): string => {
  const clean = String(raw || "").trim().replace(/\./g, ":");
  const parts = clean.split(":");
  if (parts.length < 2) return "";
  const h = Number(parts[0]);
  const m = Number(parts[1]);
  const s = Number(parts[2] ?? 0);
  if (
    isNaN(h) ||
    isNaN(m) ||
    isNaN(s) ||
    h < 0 ||
    h > 23 ||
    m < 0 ||
    m > 59 ||
    s < 0 ||
    s > 59
  ) {
    return "";
  }
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
};

export const calculateRajalInterval = (start: string, end: string) => {
  const nStart = normalizeRajalTimeHMS(start);
  const nEnd = normalizeRajalTimeHMS(end);
  if (!nStart || !nEnd) {
    return {
      diffSecs: 0,
      diffMinutes: 0,
      intervalText: "",
      hasTimes: false,
      isStandar: false,
    };
  }
  const [sH, sM, sS] = nStart.split(":").map(Number);
  const [eH, eM, eS] = nEnd.split(":").map(Number);
  let diffSecs = eH * 3600 + eM * 60 + eS - (sH * 3600 + sM * 60 + sS);
  if (diffSecs < 0) diffSecs += 24 * 3600;
  const totalMins = Math.floor(diffSecs / 60);
  const hours = Math.floor(totalMins / 60);
  const minutes = totalMins % 60;
  return {
    diffSecs,
    diffMinutes: totalMins,
    intervalText: `${hours} Jam ${minutes} Menit`,
    hasTimes: true,
    isStandar: diffSecs <= 3600,
  };
};

export const parseExcelRajalDate = (raw: string, fallback: string): string => {
  const s = String(raw || "").trim();
  if (!s) return fallback;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const dmy = s.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
  if (dmy) {
    return `${dmy[3]}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}`;
  }
  const idMatch = s.match(/^(\d{1,2})\s+([a-zA-Z]+)\s+(\d{4})$/);
  if (idMatch) {
    const mm = MONTH_ID_MAP[idMatch[2].toLowerCase()];
    if (mm) return `${idMatch[3]}-${mm}-${idMatch[1].padStart(2, "0")}`;
  }
  return fallback;
};

export const createEmptyWaktuTungguRow = (
  defaultDate: string,
  poli: RajalSheetPoli = "Penyakit Dalam",
): WaktuTungguData => ({
  id: makeRowId(),
  tanggal: defaultDate,
  nama_pasien: "",
  no_rm: "",
  jam_datang: "",
  jam_dilayani: "",
  selisih_menit: 0,
  selisih_detik: 0,
  interval_text: "",
  poli,
  memenuhi_standar: undefined,
});

export const isRajalRowFilled = (r: WaktuTungguData): boolean =>
  r.nama_pasien.trim() !== "" ||
  r.no_rm.trim() !== "" ||
  r.jam_datang.trim() !== "" ||
  r.jam_dilayani.trim() !== "";

export const isRajalRowCompliant = (r: WaktuTungguData): boolean => {
  if (!r.jam_datang || !r.jam_dilayani) return false;
  if (typeof r.memenuhi_standar === "boolean") return r.memenuhi_standar;
  if (typeof r.selisih_detik === "number" && r.selisih_detik > 0) {
    return r.selisih_detik <= 3600;
  }
  return r.selisih_menit <= 60;
};

interface Props {
  rows: WaktuTungguData[];
  onChange: (next: WaktuTungguData[]) => void;
  activeSheet: RajalSheetPoli;
  onSheetChange: (sheet: RajalSheetPoli) => void;
  defaultDate: string;
  bulanLabel: string;
  tahunLabel: string;
  computedCapaian: number;
}

export default function WaktuTungguRajalForm({
  rows,
  onChange,
  activeSheet,
  onSheetChange,
  defaultDate,
  bulanLabel,
  tahunLabel,
  computedCapaian,
}: Props) {
  const [showPasteBox, setShowPasteBox] = useState(false);
  const [pasteText, setPasteText] = useState("");

  const sheetRows = useMemo(
    () => rows.filter((r) => (r.poli || "Penyakit Dalam") === activeSheet),
    [rows, activeSheet],
  );

  const filledAllRows = useMemo(() => rows.filter(isRajalRowFilled), [rows]);
  const totalCompliant = useMemo(
    () => filledAllRows.filter(isRajalRowCompliant).length,
    [filledAllRows],
  );

  const sheetFilled = useMemo(
    () => sheetRows.filter(isRajalRowFilled),
    [sheetRows],
  );
  const sheetN = useMemo(
    () => sheetFilled.filter(isRajalRowCompliant).length,
    [sheetFilled],
  );
  const sheetD = sheetFilled.length;
  const sheetRatio = sheetD > 0 ? (sheetN / sheetD).toFixed(2) : "0.00";
  const sheetPct = sheetD > 0 ? ((sheetN / sheetD) * 100).toFixed(2) : "0";

  const handleSelectSheet = (sheet: RajalSheetPoli) => {
    onSheetChange(sheet);
    setShowPasteBox(false);
    // Ensure at least one editable row appears on the newly opened sheet
    const hasRowsInSheet = rows.some((r) => (r.poli || "Penyakit Dalam") === sheet);
    if (!hasRowsInSheet) {
      onChange([...rows, createEmptyWaktuTungguRow(defaultDate, sheet)]);
    }
  };

  const handleAddRow = () => {
    onChange([...rows, createEmptyWaktuTungguRow(defaultDate, activeSheet)]);
  };

  const handleRemoveRow = (id: string) => {
    onChange(rows.filter((r) => r.id !== id));
  };

  const handleUpdateRow = (
    id: string,
    field: keyof WaktuTungguData,
    value: any,
  ) => {
    onChange(
      rows.map((r) => {
        if (r.id !== id) return r;
        const updated: WaktuTungguData = { ...r, [field]: value };
        if (field === "jam_datang" || field === "jam_dilayani") {
          const calc = calculateRajalInterval(
            updated.jam_datang,
            updated.jam_dilayani,
          );
          if (calc.hasTimes) {
            updated.selisih_detik = calc.diffSecs;
            updated.selisih_menit = calc.diffMinutes;
            updated.interval_text = calc.intervalText;
            updated.memenuhi_standar = calc.isStandar;
          } else {
            updated.selisih_detik = 0;
            updated.selisih_menit = 0;
            updated.interval_text = "";
            updated.memenuhi_standar = undefined;
          }
        }
        return updated;
      }),
    );
  };

  const handleImportPaste = () => {
    const lines = pasteText
      .split(/\r?\n/)
      .map((l) => l.trimEnd())
      .filter((l) => l.trim() !== "");
    if (lines.length === 0) return;

    const parsed: WaktuTungguData[] = [];
    for (const line of lines) {
      const cols = line.split("\t").map((c) => c.trim());
      if (cols.length < 4) continue;
      const low = line.toLowerCase();
      if (
        low.includes("nama pasien") ||
        low.includes("uobk rsud") ||
        low.includes("waktu tunggu rawat jalan") ||
        (low.includes("unit :") && low.includes("bulan :"))
      ) {
        continue;
      }

      const hasNo = /^\d+$/.test(cols[0]) && cols.length >= 6;
      const off = hasNo ? 1 : 0;
      const tanggal = parseExcelRajalDate(cols[off] || "", defaultDate);
      const nama = cols[off + 1] || "";
      const rm = cols[off + 2] || "";
      const jamDatangRaw = cols[off + 3] || "";
      const jamDilayaniRaw = cols[off + 4] || "";
      if (!nama && !rm) continue;

      const normDatang = normalizeRajalTimeHMS(jamDatangRaw) || jamDatangRaw;
      const normDilayani = normalizeRajalTimeHMS(jamDilayaniRaw) || jamDilayaniRaw;
      const calc = calculateRajalInterval(normDatang, normDilayani);

      parsed.push({
        id: makeRowId(),
        tanggal,
        nama_pasien: nama,
        no_rm: rm,
        jam_datang: normDatang,
        jam_dilayani: normDilayani,
        selisih_menit: calc.diffMinutes,
        selisih_detik: calc.diffSecs,
        interval_text: calc.intervalText,
        poli: activeSheet,
        memenuhi_standar: calc.hasTimes ? calc.isStandar : undefined,
      });
    }

    if (parsed.length === 0) {
      alert(
        "Tidak ada baris valid terbaca. Pastikan menyalin baris dari Excel (kolom: NO | TANGGAL | NAMA PASIEN | NO.RM | JAM DATANG | JAM DILAYANI).",
      );
      return;
    }

    // Remove blank placeholder rows belonging only to the active sheet before appending
    const cleaned = rows.filter(
      (r) => (r.poli || "Penyakit Dalam") !== activeSheet || isRajalRowFilled(r),
    );
    onChange([...cleaned, ...parsed]);
    setPasteText("");
    setShowPasteBox(false);
  };

  return (
    <div className="bg-[#f8fafc] border border-white rounded-[28px] overflow-hidden shadow-[8px_8px_20px_rgba(160,175,195,0.2),-8px_-8px_20px_rgba(255,255,255,0.95)] animate-in fade-in">
      {/* Header Bar */}
      <div className="bg-emerald-600 p-5 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Clock size={20} className="text-white" />
          <div>
            <h3 className="font-extrabold text-white tracking-wide text-sm md:text-base">
              Formulir Waktu Tunggu Rawat Jalan &lt; 60 Menit
            </h3>
            <p className="text-[11px] font-semibold text-emerald-100">
              Unit: Rawat Jalan • Sheet Aktif: Poli {activeSheet} • Bulan:{" "}
              {bulanLabel} • Target: &ge; 80%
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleAddRow}
            className="flex items-center justify-center bg-white text-emerald-800 hover:bg-emerald-50 px-4 py-1.5 rounded-xl text-xs font-black transition-colors cursor-pointer"
          >
            Tambah Pasien
          </button>
        </div>
      </div>

      {/* Excel Workbook Sheet Tabs in exact left-to-right order */}
      <div className="bg-slate-100 border-b border-slate-300 px-4 pt-2.5 flex flex-wrap gap-1.5">
        {RAJAL_SHEET_POLIS.map((poli) => {
          const isAct = activeSheet === poli;
          const cnt = rows.filter(
            (r) => (r.poli || "Penyakit Dalam") === poli && isRajalRowFilled(r),
          ).length;
          return (
            <button
              key={poli}
              type="button"
              onClick={() => handleSelectSheet(poli)}
              className={`px-4 py-2 rounded-t-xl text-xs font-extrabold border border-b-0 transition-all flex items-center gap-2 ${
                isAct
                  ? "bg-white text-emerald-800 border-slate-300 shadow-2xs -mb-px pb-2.5"
                  : "bg-slate-200/70 text-slate-600 border-transparent hover:bg-white/70"
              }`}
            >
              <span>{poli}</span>
              <span
                className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
                  isAct
                    ? "bg-emerald-100 text-emerald-800"
                    : cnt > 0
                      ? "bg-emerald-100/70 text-emerald-800"
                      : "bg-slate-300/70 text-slate-700"
                }`}
              >
                {cnt}
              </span>
            </button>
          );
        })}
      </div>

      <div className="p-5 space-y-4">
        {/* Exact Excel Header Banner */}
        <div className="bg-white border border-slate-400 rounded-xl p-3 space-y-2">
          <div className="text-center border-b border-slate-300 pb-2">
            <p className="text-xs md:text-sm font-black text-slate-900 uppercase">
              UOBK RSUD AL - MULK KOTA SUKABUMI
            </p>
            <p className="text-xs font-black text-slate-800 uppercase">
              WAKTU TUNGGU RAWAT JALAN &lt; 60 MENIT
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-extrabold text-slate-800 px-1">
            <span>UNIT : POLI {activeSheet.toUpperCase()}</span>
            <span>SAMPLE : {sheetD}</span>
            <span>BULAN : {bulanLabel.toUpperCase()}</span>
            <span>TAHUN : {tahunLabel}</span>
          </div>
        </div>

        {/* Excel Table + Right Formula Card Layout */}
        <div className="flex flex-col xl:flex-row gap-4 items-start">
          <div className="flex-1 w-full overflow-x-auto">
            <table className="w-full text-left border-collapse border border-slate-400 bg-white text-xs min-w-[820px]">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-400 text-slate-900">
                  <th
                    rowSpan={2}
                    className="py-2 px-2 font-extrabold text-center w-12 border-r border-slate-400"
                  >
                    NO
                  </th>
                  <th
                    rowSpan={2}
                    className="py-2 px-2 font-extrabold text-center w-36 border-r border-slate-400"
                  >
                    TANGGAL
                  </th>
                  <th
                    rowSpan={2}
                    className="py-2 px-3 font-extrabold text-center min-w-[200px] border-r border-slate-400"
                  >
                    NAMA PASIEN
                  </th>
                  <th
                    rowSpan={2}
                    className="py-2 px-2 font-extrabold text-center w-28 border-r border-slate-400"
                  >
                    NO.RM
                  </th>
                  <th className="py-1 px-2 font-extrabold text-center w-32 border-r border-b border-slate-400">
                    JAM PASIEN
                  </th>
                  <th className="py-1 px-2 font-extrabold text-center w-36 border-r border-b border-slate-400">
                    JAM PASIEN
                  </th>
                  <th className="py-1 px-2 font-extrabold text-center w-36 border-r border-b border-slate-400">
                    INTERVAL
                  </th>
                  <th
                    rowSpan={2}
                    className="py-2 px-2 font-extrabold text-center w-12"
                  >
                    AKSI
                  </th>
                </tr>
                <tr className="bg-slate-100 border-b border-slate-400 text-slate-900">
                  <th className="py-1 px-2 font-extrabold text-[11px] text-center border-r border-slate-400">
                    DATANG
                  </th>
                  <th className="py-1 px-2 font-extrabold text-[11px] text-center border-r border-slate-400">
                    DILAYANI DOKTER
                  </th>
                  <th className="py-1 px-2 font-extrabold text-[11px] text-center border-r border-slate-400">
                    WAKTU
                  </th>
                </tr>
              </thead>
              <tbody>
                {sheetRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-10 text-center text-gray-400 italic font-semibold"
                    >
                      Belum ada pasien di Poli {activeSheet}. Klik &quot;Tambah
                      Pasien&quot;.
                    </td>
                  </tr>
                ) : (
                  sheetRows.map((row, idx) => {
                    const calc = calculateRajalInterval(
                      row.jam_datang,
                      row.jam_dilayani,
                    );
                    const intervalDisplay =
                      row.interval_text ||
                      calc.intervalText ||
                      "-";
                    const compliant = isRajalRowCompliant(row);
                    return (
                      <tr
                        key={`${row.id}-${idx}`}
                        className="border-b border-slate-300 hover:bg-emerald-50/20 transition-colors"
                      >
                        <td className="py-2 px-2 text-center font-bold text-slate-700 border-r border-slate-300 tabular-nums">
                          {idx + 1}
                        </td>
                        <td className="py-2 px-2 border-r border-slate-300">
                          <input
                            type="date"
                            value={row.tanggal}
                            onChange={(e) =>
                              handleUpdateRow(row.id, "tanggal", e.target.value)
                            }
                            className="w-full bg-transparent outline-none text-xs font-semibold text-slate-800 text-center"
                          />
                        </td>
                        <td className="py-2 px-2.5 border-r border-slate-300">
                          <input
                            type="text"
                            placeholder="Nama Pasien"
                            value={row.nama_pasien}
                            onChange={(e) =>
                              handleUpdateRow(
                                row.id,
                                "nama_pasien",
                                e.target.value,
                              )
                            }
                            className="w-full bg-transparent outline-none text-xs font-bold text-slate-900 uppercase placeholder:normal-case placeholder:font-normal"
                          />
                        </td>
                        <td className="py-2 px-2 border-r border-slate-300">
                          <input
                            type="text"
                            placeholder="No. RM"
                            value={row.no_rm}
                            onChange={(e) =>
                              handleUpdateRow(row.id, "no_rm", e.target.value)
                            }
                            className="w-full bg-transparent outline-none text-xs font-semibold text-slate-800 text-center tabular-nums"
                          />
                        </td>
                        <td className="py-2 px-2 border-r border-slate-300 text-center">
                          <input
                            type="time"
                            step="1"
                            value={row.jam_datang}
                            onChange={(e) =>
                              handleUpdateRow(
                                row.id,
                                "jam_datang",
                                e.target.value,
                              )
                            }
                            className="w-full bg-transparent outline-none text-xs font-semibold text-slate-900 text-center tabular-nums"
                          />
                        </td>
                        <td className="py-2 px-2 border-r border-slate-300 text-center">
                          <input
                            type="time"
                            step="1"
                            value={row.jam_dilayani}
                            onChange={(e) =>
                              handleUpdateRow(
                                row.id,
                                "jam_dilayani",
                                e.target.value,
                              )
                            }
                            className="w-full bg-transparent outline-none text-xs font-semibold text-slate-900 text-center tabular-nums"
                          />
                        </td>
                        <td className="py-2 px-2 text-center border-r border-slate-300">
                          {row.jam_datang && row.jam_dilayani ? (
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-xs font-extrabold ${
                                compliant
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-rose-100 text-rose-800"
                              }`}
                            >
                              {intervalDisplay}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-2 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveRow(row.id)}
                            title="Hapus Baris"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded-lg transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Excel Right-Hand Formula Box (N / D x 100%) */}
          <div className="w-full xl:w-52 shrink-0 bg-white border border-slate-400 rounded-xl overflow-hidden text-xs">
            <div className="bg-slate-100 border-b border-slate-400 grid grid-cols-2 font-black text-center">
              <div className="py-2 px-2 border-r border-slate-400">N</div>
              <div className="py-2 px-2">&times; 100 %</div>
            </div>
            <div className="border-b border-slate-300 text-center py-1 text-[10px] font-bold text-slate-500">
              D (Poli {activeSheet})
            </div>
            <div className="grid grid-cols-2 text-center border-b border-slate-300 font-black">
              <div className="py-2 border-r border-slate-300 text-emerald-700 tabular-nums">
                {sheetN}
              </div>
              <div className="py-2 text-slate-700">
                &times; 100%
              </div>
            </div>
            <div className="grid grid-cols-2 text-center border-b border-slate-300 font-bold">
              <div className="py-2 border-r border-slate-300 text-slate-900 tabular-nums">
                {sheetD}
              </div>
              <div className="py-2 text-slate-600 tabular-nums">{sheetRatio}</div>
            </div>
            <div className="py-2.5 px-3 bg-emerald-50 text-center font-black text-emerald-800">
              {sheetPct}%
            </div>
          </div>
        </div>
      </div>

      {/* Footer Summary */}
      <div className="px-6 py-4 bg-emerald-50/70 border-t border-emerald-100 flex flex-wrap items-center justify-between gap-4">
        <p className="text-xs font-bold text-emerald-900">
          Poli {activeSheet}: <span className="font-black">{sheetN}</span> /{" "}
          <span className="font-black">{sheetD}</span> ({sheetPct}%) • Total
          Semua Sheet Diisi:{" "}
          <span className="font-black">
            {totalCompliant} / {filledAllRows.length}
          </span>
        </p>
        <p className="text-xs font-extrabold text-emerald-800">
          Nilai / Persentase Capaian:{" "}
          <span className="text-sm font-black">{computedCapaian}%</span>
        </p>
      </div>
    </div>
  );
}
