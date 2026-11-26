import React from "react";
import { CheckCircle2, ClipboardList, Edit3, Trash2 } from "lucide-react";
import { formatIndonesianDate } from "./inputPeriodUtils";

export interface SavedRoomEntryView {
  id: string;
  unit: string;
  tanggal: string;
  kategori: string;
  indikator_id: string;
  indikator_name: string;
  numerator: number;
  denominator: number;
  capaian: number;
  target?: string | number;
  status: string;
  rowCount: number;
  notesObj: Record<string, any>;
}

interface SavedRoomDataSectionProps {
  unitName: string;
  monthLabel: string;
  entries: SavedRoomEntryView[];
  activeIndicatorId: string;
  activeEditingId: string | null;
  onOpenEntry: (entry: SavedRoomEntryView) => void;
  onDeleteEntry: (entry: SavedRoomEntryView) => void;
}

export default function SavedRoomDataSection({
  unitName,
  monthLabel,
  entries,
  activeIndicatorId,
  activeEditingId,
  onOpenEntry,
  onDeleteEntry,
}: SavedRoomDataSectionProps) {
  if (entries.length === 0) return null;

  return (
    <section
      data-testid="saved-room-data-section"
      aria-label={`Rekap data terinput ${unitName}`}
      className="bg-white rounded-[26px] border border-emerald-200/80 shadow-[0_6px_22px_rgba(15,23,42,0.05)] overflow-hidden animate-in fade-in duration-300"
    >
      <div className="px-5 md:px-7 py-4 bg-gradient-to-r from-emerald-50/90 via-white to-white border-b border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <ClipboardList size={18} className="text-emerald-600 shrink-0" />
          <div>
            <h3 className="text-sm md:text-base font-extrabold text-slate-900 tracking-tight">
              Data Mutu Terinput — {unitName}
            </h3>
            <p className="text-[11px] font-semibold text-slate-500">
              Periode {monthLabel} · Semua data yang sudah disimpan tetap tampil di sini dan bisa dibuka kembali kapan saja.
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 self-start sm:self-center px-3 py-1 rounded-xl bg-emerald-600 text-white text-xs font-extrabold tabular-nums">
          <CheckCircle2 size={13} />
          {entries.length} Data Tersimpan
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/90 border-b border-slate-100 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4 w-10 text-center">No</th>
              <th className="py-3 px-4">Indikator Mutu</th>
              <th className="py-3 px-4 whitespace-nowrap">Tanggal</th>
              <th className="py-3 px-4 text-center whitespace-nowrap">Num / Den</th>
              <th className="py-3 px-4 text-center whitespace-nowrap">Capaian</th>
              <th className="py-3 px-4 text-center whitespace-nowrap">Rincian</th>
              <th className="py-3 px-4 text-right whitespace-nowrap">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {entries.map((entry, idx) => {
              const isCurrentlyOpen =
                (activeEditingId && activeEditingId === entry.id) ||
                (!activeEditingId && activeIndicatorId === entry.indikator_id);

              const badgeColor =
                entry.kategori === "INM"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : entry.kategori === "IMP-RS"
                    ? "bg-sky-50 text-sky-700 border-sky-200"
                    : entry.kategori === "SPM"
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-violet-50 text-violet-700 border-violet-200";

              return (
                <tr
                  key={entry.id}
                  data-testid="saved-room-entry-row"
                  className={`transition-colors ${
                    isCurrentlyOpen
                      ? "bg-emerald-50/60"
                      : "hover:bg-slate-50/70"
                  }`}
                >
                  <td className="py-3.5 px-4 text-center font-bold text-slate-500 tabular-nums">
                    {idx + 1}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-black border ${badgeColor}`}
                      >
                        {entry.kategori}
                      </span>
                      {isCurrentlyOpen && (
                        <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-600 text-white">
                          Sedang Dibuka
                        </span>
                      )}
                    </div>
                    <p className="font-bold text-slate-800 leading-snug">
                      {entry.indikator_name}
                    </p>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-600 whitespace-nowrap tabular-nums">
                    {formatIndonesianDate(entry.tanggal)}
                  </td>
                  <td className="py-3.5 px-4 text-center font-extrabold text-slate-700 whitespace-nowrap tabular-nums">
                    {entry.numerator} / {entry.denominator}
                  </td>
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-extrabold tabular-nums ${
                        entry.status === "Tercapai"
                          ? "bg-emerald-100 text-emerald-800"
                          : entry.status === "Mendekati"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {entry.capaian}%
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-semibold text-slate-500 whitespace-nowrap">
                    {entry.rowCount > 0 ? `${entry.rowCount} baris` : "Ringkasan"}
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onOpenEntry(entry)}
                        aria-label={`Lihat atau edit ${entry.indikator_name}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200/80 text-[11px] font-bold transition-colors cursor-pointer"
                      >
                        <Edit3 size={12} />
                        Lihat / Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteEntry(entry)}
                        aria-label={`Hapus data ${entry.indikator_name}`}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Hapus data ini"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
