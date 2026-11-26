import React from "react";
import { Activity } from "lucide-react";
import { PrognasMutuData } from "@/store/useStore";

export type PrognasIndicatorType = PrognasMutuData["indicator_type"];

interface PrognasPreset {
  sectionTitle: string;
  targetLabel: string;
  targetPct: string;
  capaianLabel: string;
  tidakTercapaiLabel?: string;
  isReverseRate?: boolean; // true for Kematian Ibu & Bayi where 0% is target
  defaultAnalisaHint: string;
  defaultRekomendasiHint: string;
}

export const PROGNAS_PRESETS: Record<PrognasIndicatorType, PrognasPreset> = {
  hiv_aids: {
    sectionTitle: "PELAYANAN ORANG DENGAN RESIKO TERINFEKSI HIV/AIDS",
    targetLabel: "Jumlah Pasien yang Beresiko Terinfeksi HIV/AIDS (Target)",
    targetPct: "100%",
    capaianLabel: "Jumlah Pasien Beresiko yang dicek HIV/AIDS (Capaian)",
    defaultAnalisaHint:
      "Dari grafik/tabel di atas dapat disimpulkan capaian pemeriksaan pelayanan pada orang dengan resiko HIV/AIDS...",
    defaultRekomendasiHint:
      "Evaluasi kepatuhan terhadap SOP yakni semua pasien TBC dan pasien beresiko wajib di cek HIV/AIDS...",
  },
  kematian_bayi: {
    sectionTitle: "ANGKA KEMATIAN BAYI",
    targetLabel: "Angka Kematian Bayi (Target) / Total Bayi Dirawat",
    targetPct: "0%",
    capaianLabel: "Kejadian Angka Kematian Bayi (Capaian)",
    isReverseRate: true,
    defaultAnalisaHint:
      "Dari grafik/tabel di atas dapat disimpulkan pada bulan berjalan capaian angka kematian bayi...",
    defaultRekomendasiHint:
      "Mengupdate ilmu tentang kegawatdaruratan maternal dan perinatal; Kepatuhan staff medis sesuai SPO; DPJP Spesialis Anak siap siaga 24 jam...",
  },
  kematian_ibu: {
    sectionTitle: "ANGKA KEMATIAN IBU",
    targetLabel: "Angka Kematian Ibu (Target) / Total Pasien Ibu",
    targetPct: "0%",
    capaianLabel: "Kejadian Angka Kematian Ibu (Capaian)",
    isReverseRate: true,
    defaultAnalisaHint:
      "Dari grafik/tabel di atas dapat disimpulkan bulan berjalan capaian angka kematian ibu...",
    defaultRekomendasiHint:
      "Mengupdate ilmu tentang kegawatdaruratan maternal dan perinatal; Kepatuhan staff medis sesuai SPO; DPJP Spesialis Obgyn siap siaga 24 jam...",
  },
  imd: {
    sectionTitle: "ANGKA KEJADIAN INISIASI MENYUSU DINI",
    targetLabel: "Angka Bayi Lahir (Target)",
    targetPct: "100%",
    capaianLabel: "Bayi yang di IMD (Capaian)",
    tidakTercapaiLabel: "Bayi Tidak IMD",
    defaultAnalisaHint:
      "Dari grafik/tabel di atas dapat disimpulkan bahwa capaian kejadian angka IMD...",
    defaultRekomendasiHint:
      "Kepatuhan staff medis dalam melakukan pelayanan sesuai dengan SPO yang berlaku; Evaluasi setiap 3 bulan sekali...",
  },
  rooming_in: {
    sectionTitle: "ANGKA KEJADIAN ROOMING IN",
    targetLabel: "Angka Bayi Lahir (Target)",
    targetPct: "100%",
    capaianLabel: "Bayi Rooming In (Capaian)",
    tidakTercapaiLabel: "Bayi Tidak Rooming In",
    defaultAnalisaHint:
      "Dari grafik/tabel di atas bahwa capaian angka kejadian rooming in...",
    defaultRekomendasiHint:
      "Kepatuhan staff medis dalam melakukan pelayanan sesuai dengan SPO yang berlaku; Evaluasi setiap 3 bulan sekali...",
  },
};

export const createEmptyPrognasData = (
  type: PrognasIndicatorType,
  defaultDate: string,
): PrognasMutuData => {
  const preset = PROGNAS_PRESETS[type];
  return {
    tanggal: defaultDate,
    indicator_type: type,
    target_label: preset.targetLabel,
    target_count: "",
    target_pct: preset.targetPct,
    capaian_label: preset.capaianLabel,
    capaian_count: "",
    capaian_pct: 0,
    tidak_tercapai_label: preset.tidakTercapaiLabel,
    tidak_tercapai_count: preset.tidakTercapaiLabel ? 0 : undefined,
    tidak_tercapai_pct: preset.tidakTercapaiLabel ? 0 : undefined,
    analisa: "",
    rekomendasi: "",
  };
};

export const computePrognasStats = (data: PrognasMutuData) => {
  const preset = PROGNAS_PRESETS[data.indicator_type];
  const targetN = Number(data.target_count) || 0;
  const capaianN = Number(data.capaian_count) || 0;
  let pct = 0;
  if (preset.isReverseRate) {
    pct = targetN > 0 ? Number(((capaianN / targetN) * 100).toFixed(2)) : capaianN === 0 ? 0 : 100;
  } else {
    pct = targetN > 0 ? Number(((capaianN / targetN) * 100).toFixed(2)) : 0;
  }
  const tidakN = Math.max(0, targetN - capaianN);
  const tidakPct = targetN > 0 ? Number(((tidakN / targetN) * 100).toFixed(2)) : 0;
  return {
    num: capaianN,
    den: targetN > 0 ? targetN : 1,
    pct,
    tidakN,
    tidakPct,
  };
};

interface Props {
  data: PrognasMutuData;
  onChange: (next: PrognasMutuData) => void;
  bulanLabel: string;
  tahunLabel: string;
  computedCapaian: number;
}

export default function PrognasMutuForm({
  data,
  onChange,
  bulanLabel,
  tahunLabel,
  computedCapaian,
}: Props) {
  const preset = PROGNAS_PRESETS[data.indicator_type];
  const stats = computePrognasStats(data);

  const updateCounts = (field: "target_count" | "capaian_count", rawVal: string) => {
    const val = rawVal === "" ? "" : Math.max(0, Number(rawVal));
    const updated: PrognasMutuData = { ...data, [field]: val };
    const nextStats = computePrognasStats(updated);
    updated.capaian_pct = nextStats.pct;
    if (preset.tidakTercapaiLabel) {
      updated.tidak_tercapai_count = nextStats.tidakN;
      updated.tidak_tercapai_pct = nextStats.tidakPct;
    }
    onChange(updated);
  };

  return (
    <div className="bg-[#f8fafc] border border-white rounded-[28px] overflow-hidden shadow-[8px_8px_20px_rgba(160,175,195,0.2),-8px_-8px_20px_rgba(255,255,255,0.95)] animate-in fade-in">
      <div className="bg-emerald-600 p-5 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Activity size={20} className="text-white" />
          <div>
            <h3 className="font-extrabold text-white tracking-wide text-sm md:text-base">
              LAPORAN MUTU PROGNAS — {bulanLabel.toUpperCase()} TAHUN {tahunLabel}
            </h3>
            <p className="text-[11px] font-semibold text-emerald-100">
              Unit: Prognas • Indikator: {preset.sectionTitle} • Target: {preset.targetPct}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white/15 px-3 py-1.5 rounded-xl">
          <span className="text-[11px] font-bold text-white">Tanggal:</span>
          <input
            type="date"
            value={data.tanggal}
            onChange={(e) => onChange({ ...data, tanggal: e.target.value })}
            className="bg-white text-slate-900 rounded-lg px-2 py-1 text-xs font-bold outline-none"
          />
        </div>
      </div>

      <div className="p-6 space-y-5">
        <div className="bg-slate-50 border border-slate-300 rounded-xl py-2.5 px-4 text-center">
          <p className="text-xs md:text-sm font-black text-slate-900 uppercase">
            {preset.sectionTitle}
          </p>
        </div>

        {/* Exact Prognas 3-Column Report Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-slate-400 bg-white text-xs md:text-sm">
            <tbody>
              <tr className="border-b border-slate-300">
                <td className="py-3 px-4 font-bold text-slate-900 border-r border-slate-400 w-3/5">
                  {preset.targetLabel}
                </td>
                <td className="py-2.5 px-4 text-center border-r border-slate-400 w-1/5">
                  <input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={data.target_count}
                    onChange={(e) => updateCounts("target_count", e.target.value)}
                    className="w-24 text-center border border-slate-300 rounded-lg px-2 py-1.5 font-black text-slate-900 tabular-nums"
                  />
                </td>
                <td className="py-3 px-4 text-center font-black text-slate-800 w-1/5 bg-slate-50">
                  {preset.targetPct}
                </td>
              </tr>
              <tr className="border-b border-slate-300">
                <td className="py-3 px-4 font-bold text-slate-900 border-r border-slate-400">
                  {preset.capaianLabel}
                </td>
                <td className="py-2.5 px-4 text-center border-r border-slate-400">
                  <input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={data.capaian_count}
                    onChange={(e) => updateCounts("capaian_count", e.target.value)}
                    className="w-24 text-center border border-slate-300 rounded-lg px-2 py-1.5 font-black text-emerald-800 tabular-nums"
                  />
                </td>
                <td className="py-3 px-4 text-center font-black text-emerald-700 bg-emerald-50/70 tabular-nums">
                  {stats.pct}%
                </td>
              </tr>
              {preset.tidakTercapaiLabel && (
                <tr className="border-b border-slate-300 bg-rose-50/30">
                  <td className="py-3 px-4 font-bold text-slate-800 border-r border-slate-400">
                    {preset.tidakTercapaiLabel}
                  </td>
                  <td className="py-3 px-4 text-center font-black text-rose-700 border-r border-slate-400 tabular-nums">
                    {stats.tidakN}
                  </td>
                  <td className="py-3 px-4 text-center font-black text-rose-700 tabular-nums">
                    {stats.tidakPct}%
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Analisa & Rekomendasi Section matching Prognas Report */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-800 uppercase">
              Analisa :
            </label>
            <textarea
              rows={4}
              value={data.analisa}
              onChange={(e) => onChange({ ...data, analisa: e.target.value })}
              placeholder={preset.defaultAnalisaHint}
              className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-800 outline-none focus:border-emerald-500"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-800 uppercase">
              Rekomendasi Evaluasi :
            </label>
            <textarea
              rows={4}
              value={data.rekomendasi}
              onChange={(e) => onChange({ ...data, rekomendasi: e.target.value })}
              placeholder={preset.defaultRekomendasiHint}
              className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-800 outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      <div className="px-6 py-4 bg-emerald-50/70 border-t border-emerald-100 flex flex-wrap items-center justify-between gap-4">
        <p className="text-xs font-bold text-emerald-900">
          Capaian: <span className="font-black">{stats.num}</span> /{" "}
          <span className="font-black">{data.target_count || 0}</span>
        </p>
        <p className="text-xs font-extrabold text-emerald-800">
          Nilai / Persentase Capaian:{" "}
          <span className="text-sm font-black">{computedCapaian}%</span>
        </p>
      </div>
    </div>
  );
}
