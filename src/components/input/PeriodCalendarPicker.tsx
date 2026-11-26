import React, { useEffect, useRef, useState } from "react";
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import {
  INDONESIAN_MONTHS_SHORT,
  buildIsoDate,
  formatIndonesianMonthYear,
  parseIsoDateParts,
} from "./inputPeriodUtils";

interface PeriodCalendarPickerProps {
  value: string; // YYYY-MM-DD
  onChange: (nextIsoDate: string) => void;
}

export default function PeriodCalendarPicker({
  value,
  onChange,
}: PeriodCalendarPickerProps) {
  const [open, setOpen] = useState(false);
  const parts = parseIsoDateParts(value);
  const [viewYear, setViewYear] = useState(parts.year);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const handleToggle = () => {
    setViewYear(parts.year);
    setOpen((prev) => !prev);
  };

  const handleSelectMonth = (monthIndex1Based: number) => {
    const nextDate = buildIsoDate(viewYear, monthIndex1Based, parts.day);
    onChange(nextDate);
  };

  const handleSelectToday = () => {
    const todayIso = new Date().toISOString().split("T")[0];
    const todayParts = parseIsoDateParts(todayIso);
    setViewYear(todayParts.year);
    onChange(todayIso);
    setOpen(false);
  };

  const formattedLabel = formatIndonesianMonthYear(value);

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={`Ubah bulan dan tahun pelaporan, saat ini ${formattedLabel}`}
        data-testid="period-calendar-trigger"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-emerald-50/70 border border-slate-200 hover:border-emerald-300 text-slate-700 text-xs sm:text-[13px] font-bold shadow-2xs transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
      >
        <Calendar size={14} className="text-emerald-600 shrink-0" />
        <span>Bulan: {formattedLabel}</span>
        <ChevronDown
          size={14}
          className={`text-slate-400 transition-transform duration-200 ${open ? "rotate-180 text-emerald-600" : ""}`}
        />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Pilih Bulan, Tahun, dan Tanggal Pelaporan"
          data-testid="period-calendar-popover"
          className="absolute right-0 top-full mt-2 w-[300px] sm:w-[320px] z-40 rounded-2xl bg-white border border-emerald-200/90 shadow-[0_14px_38px_rgba(15,23,42,0.14)] p-4 space-y-3.5 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Year Stepper */}
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
            <button
              type="button"
              onClick={() => setViewYear((y) => Math.max(2020, y - 1))}
              aria-label="Tahun sebelumnya"
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-500">Tahun</span>
              <span
                data-testid="period-calendar-year"
                className="text-sm font-extrabold text-slate-900 tabular-nums"
              >
                {viewYear}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setViewYear((y) => Math.min(2035, y + 1))}
              aria-label="Tahun berikutnya"
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* 12-Month Grid */}
          <div className="grid grid-cols-4 gap-1.5">
            {INDONESIAN_MONTHS_SHORT.map((label, idx) => {
              const monthNum = idx + 1;
              const isSelected = viewYear === parts.year && monthNum === parts.month;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => handleSelectMonth(monthNum)}
                  className={`py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-transparent hover:border-emerald-200"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Exact Date Picker for backdated reporting */}
          <div className="pt-2 border-t border-slate-100 space-y-1.5">
            <label
              htmlFor="reporting-exact-date"
              className="block text-[11px] font-bold text-slate-500"
            >
              Tanggal Pelaporan Spesifik
            </label>
            <input
              id="reporting-exact-date"
              type="date"
              value={value || ""}
              onChange={(e) => {
                const nextVal = e.target.value;
                if (nextVal && /^\d{4}-\d{2}-\d{2}$/.test(nextVal)) {
                  const nextParts = parseIsoDateParts(nextVal);
                  setViewYear(nextParts.year);
                  onChange(nextVal);
                }
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 outline-none text-xs font-bold text-slate-800 bg-slate-50/70"
            />
          </div>

          {/* Footer Quick Actions */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={handleSelectToday}
              className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
            >
              Kembali ke Bulan Ini
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-colors cursor-pointer"
            >
              Terapkan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
