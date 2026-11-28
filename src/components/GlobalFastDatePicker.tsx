import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
} from "lucide-react";
import {
  INDONESIAN_MONTHS,
  INDONESIAN_MONTHS_SHORT,
  buildCalendarDaysGrid,
  buildIsoDate,
  buildYearRange,
  parseIsoDateParts,
} from "@/components/input/inputPeriodUtils";

const DAY_HEADERS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"] as const;

const ALL_YEARS = buildYearRange(1920, 2035);

function triggerReactInputChange(input: HTMLInputElement, nextValue: string) {
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value",
  )?.set;
  if (nativeInputValueSetter) {
    nativeInputValueSetter.call(input, nextValue);
  } else {
    input.value = nextValue;
  }
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

export default function GlobalFastDatePicker() {
  const [targetInput, setTargetInput] = useState<HTMLInputElement | null>(null);
  const [currentValue, setCurrentValue] = useState<string>("");
  const [viewYear, setViewYear] = useState<number>(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(new Date().getMonth() + 1);
  const [mode, setMode] = useState<"calendar" | "year" | "month">("calendar");
  const [yearSearch, setYearSearch] = useState<string>("");
  const yearGridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const openForDateInput = (input: HTMLInputElement) => {
      if (input.disabled || input.readOnly) return;
      const val = input.value || "";
      const parts = parseIsoDateParts(val);
      setTargetInput(input);
      setCurrentValue(val);
      setViewYear(parts.year);
      setViewMonth(parts.month);
      setMode("calendar");
      setYearSearch("");
    };

    const handleMouseDownCapture = (e: MouseEvent) => {
      const el = e.target as HTMLElement | null;
      if (!el) return;
      const dateInput = el.closest('input[type="date"]') as HTMLInputElement | null;
      if (dateInput) {
        e.preventDefault();
        e.stopPropagation();
        openForDateInput(dateInput);
      }
    };

    const handleClickCapture = (e: MouseEvent) => {
      const el = e.target as HTMLElement | null;
      if (!el) return;
      const dateInput = el.closest('input[type="date"]') as HTMLInputElement | null;
      if (dateInput) {
        e.preventDefault();
        e.stopPropagation();
        openForDateInput(dateInput);
      }
    };

    const handleKeyDownCapture = (e: KeyboardEvent) => {
      if (e.key === "Escape" && targetInput) {
        setTargetInput(null);
        return;
      }
      const el = e.target as HTMLElement | null;
      if (!el) return;
      if (
        el.tagName === "INPUT" &&
        (el as HTMLInputElement).type === "date" &&
        (e.key === "Enter" || e.key === " ")
      ) {
        e.preventDefault();
        openForDateInput(el as HTMLInputElement);
      }
    };

    document.addEventListener("mousedown", handleMouseDownCapture, true);
    document.addEventListener("click", handleClickCapture, true);
    document.addEventListener("keydown", handleKeyDownCapture, true);
    return () => {
      document.removeEventListener("mousedown", handleMouseDownCapture, true);
      document.removeEventListener("click", handleClickCapture, true);
      document.removeEventListener("keydown", handleKeyDownCapture, true);
    };
  }, [targetInput]);

  useEffect(() => {
    if (mode === "year" && yearGridRef.current) {
      const activeBtn = yearGridRef.current.querySelector(
        `[data-year="${viewYear}"]`,
      ) as HTMLElement | null;
      if (activeBtn) {
        activeBtn.scrollIntoView({ block: "center" });
      }
    }
  }, [mode, viewYear]);

  const calendarCells = useMemo(
    () => buildCalendarDaysGrid(viewYear, viewMonth),
    [viewYear, viewMonth],
  );

  const filteredYears = useMemo(() => {
    const q = yearSearch.trim();
    if (!q) return ALL_YEARS;
    return ALL_YEARS.filter((y) => String(y).includes(q));
  }, [yearSearch]);

  if (!targetInput) return null;

  const todayIso = new Date().toISOString().split("T")[0];

  const handleSelectDate = (isoDate: string) => {
    triggerReactInputChange(targetInput, isoDate);
    setCurrentValue(isoDate);
    setTargetInput(null);
  };

  const handleClearDate = () => {
    triggerReactInputChange(targetInput, "");
    setCurrentValue("");
    setTargetInput(null);
  };

  const handlePrevMonth = () => {
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear((y) => Math.max(1900, y - 1));
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear((y) => Math.min(2100, y + 1));
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Pilih Tanggal"
      data-testid="global-fast-date-picker-modal"
      className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          setTargetInput(null);
        }
      }}
    >
      <div
        className="w-full max-w-[360px] bg-white rounded-3xl border border-emerald-100 shadow-[0_24px_64px_rgba(15,23,42,0.24)] overflow-hidden animate-in zoom-in-95 duration-150"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#047857] to-[#059669] px-4 py-3.5 text-white flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              data-testid="fast-date-month-button"
              onClick={() => setMode((m) => (m === "month" ? "calendar" : "month"))}
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                mode === "month"
                  ? "bg-white text-emerald-800 shadow-xs"
                  : "bg-white/15 hover:bg-white/25 text-white"
              }`}
            >
              <span>{INDONESIAN_MONTHS[viewMonth - 1]}</span>
              <ChevronDown
                size={13}
                className={`transition-transform ${mode === "month" ? "rotate-180" : ""}`}
              />
            </button>

            <button
              type="button"
              data-testid="fast-date-year-button"
              onClick={() => setMode((m) => (m === "year" ? "calendar" : "year"))}
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-extrabold tabular-nums transition-all cursor-pointer ${
                mode === "year"
                  ? "bg-white text-emerald-800 shadow-xs"
                  : "bg-white/15 hover:bg-white/25 text-white"
              }`}
            >
              <span>{viewYear}</span>
              <ChevronDown
                size={13}
                className={`transition-transform ${mode === "year" ? "rotate-180" : ""}`}
              />
            </button>
          </div>

          <div className="flex items-center gap-1">
            {mode === "calendar" && (
              <>
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  aria-label="Bulan sebelumnya"
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  <ChevronLeft size={15} />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  aria-label="Bulan berikutnya"
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  <ChevronRight size={15} />
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => setTargetInput(null)}
              aria-label="Tutup kalender"
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/25 text-white transition-colors cursor-pointer ml-1"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Body: Mode = Year Selector (Fast Responsive Grid + Search + Decade Presets) */}
        {mode === "year" && (
          <div className="p-3.5 space-y-3 bg-slate-50/50">
            <div className="relative">
              <Search
                size={14}
                className="
                  absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none
                "
              />
              <input
                type="text"
                inputMode="numeric"
                value={yearSearch}
                onChange={(e) => setYearSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && filteredYears.length > 0) {
                    setViewYear(filteredYears[0]);
                    setMode("calendar");
                  }
                }}
                placeholder="Ketik tahun langsung (misal: 1985, 2001)..."
                data-testid="fast-date-year-search"
                className="w-full pl-8 pr-8 py-2 rounded-xl bg-white border border-slate-200 focus:border-emerald-500 text-xs font-bold text-slate-800 outline-none"
                autoFocus
              />
              {yearSearch && (
                <button
                  type="button"
                  onClick={() => setYearSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Responsive 4-Column Year Grid */}
            <div
              ref={yearGridRef}
              data-testid="fast-date-year-grid"
              className="grid grid-cols-4 gap-1.5 max-h-[210px] overflow-y-auto pr-1"
            >
              {filteredYears.map((yr) => {
                const isSelected = yr === viewYear;
                return (
                  <button
                    key={yr}
                    type="button"
                    data-year={yr}
                    data-testid={`fast-date-year-option-${yr}`}
                    onClick={() => {
                      setViewYear(yr);
                      setMode("calendar");
                    }}
                    className={`py-2 rounded-xl text-xs font-extrabold tabular-nums transition-all cursor-pointer ${
                      isSelected
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200/80 hover:border-emerald-300"
                    }`}
                  >
                    {yr}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Body: Mode = Month Selector */}
        {mode === "month" && (
          <div className="p-4 bg-slate-50/50">
            <div className="grid grid-cols-3 gap-2">
              {INDONESIAN_MONTHS.map((mName, idx) => {
                const mNum = idx + 1;
                const isSelected = mNum === viewMonth;
                return (
                  <button
                    key={mName}
                    type="button"
                    data-testid={`fast-date-month-option-${mNum}`}
                    onClick={() => {
                      setViewMonth(mNum);
                      setMode("calendar");
                    }}
                    className={`py-2.5 px-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200/80 hover:border-emerald-300"
                    }`}
                  >
                    {mName}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Body: Mode = Calendar Day Grid */}
        {mode === "calendar" && (
          <div className="p-3.5 space-y-2">
            {/* Weekday Header */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {DAY_HEADERS.map((d) => (
                <div
                  key={d}
                  className="text-[10px] font-extrabold uppercase text-slate-400 py-1"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* 42-Cell Day Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarCells.map((cell) => {
                const isSelected = cell.isoDate === currentValue;
                const isToday = cell.isoDate === todayIso;
                return (
                  <button
                    key={cell.isoDate}
                    type="button"
                    data-testid={`fast-date-day-${cell.isoDate}`}
                    onClick={() => handleSelectDate(cell.isoDate)}
                    className={`h-8 rounded-xl text-xs font-extrabold tabular-nums transition-all cursor-pointer flex items-center justify-center ${
                      isSelected
                        ? "bg-emerald-600 text-white shadow-xs"
                        : !cell.isCurrentMonth
                        ? "text-slate-300 hover:bg-slate-50 hover:text-slate-500"
                        : isToday
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                        : "text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
                    }`}
                  >
                    {cell.day}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={handleClearDate}
            className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
          >
            Hapus
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              data-testid="fast-date-today-button"
              onClick={() => handleSelectDate(todayIso)}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-extrabold transition-colors cursor-pointer"
            >
              Hari Ini
            </button>
            <button
              type="button"
              onClick={() => setTargetInput(null)}
              className="px-3 py-1.5 rounded-xl bg-slate-200/80 hover:bg-slate-300/80 text-slate-700 text-xs font-extrabold transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
