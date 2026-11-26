import React, { useState } from "react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Building2,
  LayoutGrid,
  X,
} from "lucide-react";
import type { Unit } from "@/store/useStore";
import { getUnitVisualConfig, getUnitThemeStyle } from "./unitVisuals";

interface UnitCardSelectorProps {
  units: Unit[];
  selectedUnit: Unit | null;
  unitSearch: string;
  onSearchChange: (val: string) => void;
  onSelectUnit: (unit: Unit) => void;
  onClearUnit: () => void;
  onAddRoom: () => void;
  onEditRoom: (e: React.MouseEvent, unit: Unit) => void;
  onDeleteRoom: (e: React.MouseEvent, unitId: string) => void;
}

function UnitPopOutIcon({
  src,
  alt,
  dropShadow,
  groundShadow,
  fallbackBg,
  size = "card",
}: {
  src: string;
  alt: string;
  dropShadow: string;
  groundShadow: string;
  fallbackBg: string;
  size?: "card" | "banner";
}) {
  const [failed, setFailed] = useState(false);

  const imgClasses =
    size === "banner"
      ? "w-[54px] h-[54px] sm:w-[62px] sm:h-[62px]"
      : "w-[58px] h-[58px] sm:w-[64px] sm:h-[64px] xl:w-[70px] xl:h-[70px]";

  return (
    <div
      className={
        size === "banner"
          ? "relative shrink-0 pointer-events-none select-none flex items-end justify-center"
          : "absolute top-0 right-2.5 sm:right-3 z-20 pointer-events-none select-none flex items-end justify-center"
      }
      aria-hidden="true"
    >
      {/* Ambient ground shadow below the 3D icon */}
      <div
        className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 ${
          size === "banner" ? "w-10 h-2" : "w-10 sm:w-12 h-2.5"
        } rounded-full blur-md transition-all duration-300 group-hover:w-14 group-hover:opacity-90 ${groundShadow}`}
      />
      {!failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={() => setFailed(true)}
          className={`relative z-10 ${imgClasses} object-contain origin-bottom transition-transform duration-300 ease-out group-hover:-translate-y-1.5 group-hover:scale-110 group-hover:rotate-3 ${dropShadow}`}
        />
      ) : (
        <div
          className={`relative z-10 p-3 rounded-2xl ${fallbackBg} text-white shadow-md`}
        >
          <Building2 className="w-6 h-6" />
        </div>
      )}
    </div>
  );
}

export default function UnitCardSelector({
  units,
  selectedUnit,
  unitSearch,
  onSearchChange,
  onSelectUnit,
  onClearUnit,
  onAddRoom,
  onEditRoom,
  onDeleteRoom,
}: UnitCardSelectorProps) {
  const handleSelect = (unit: Unit) => {
    onSelectUnit(unit);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Active room view: compact hero strip so the mutu input list opens immediately at the top
  if (selectedUnit) {
    const visual = getUnitVisualConfig(selectedUnit.name, selectedUnit.category);
    const style = getUnitThemeStyle(visual.theme);

    return (
      <div
        data-testid="unit-selected-banner"
        className="relative pt-2 animate-in fade-in slide-in-from-top-2 duration-300"
      >
        <div
          className={`relative overflow-hidden rounded-[24px] bg-gradient-to-r ${style.cardBg} border ${style.cardBorder} shadow-[0_4px_16px_rgba(15,23,42,0.06)] px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
        >
          {/* Bottom color accent bar */}
          <div
            className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${style.bottomBar}`}
          />
          {/* Subtle top-right radial glow */}
          <div
            className={`absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-bl ${style.cornerGlow} rounded-full blur-2xl pointer-events-none`}
          />

          <div className="relative z-10 flex items-center gap-3.5 sm:gap-4 min-w-0">
            <UnitPopOutIcon
              src={visual.iconSrc}
              alt={visual.iconAlt}
              dropShadow={style.iconDropShadow}
              groundShadow={style.groundShadow}
              fallbackBg={style.fallbackBg}
              size="banner"
            />
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-slate-500">
                Unit Aktif · {selectedUnit.category}
              </p>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight truncate">
                {selectedUnit.name}
              </h2>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onClearUnit}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/90 text-xs font-extrabold shadow-xs transition-all cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <ArrowLeft size={14} className="text-emerald-600" />
              Ganti Ruangan
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Room Gallery View: 4-column card grid with 3D Pop-Out Hero Banner icons in top-right corner
  return (
    <div
      data-testid="unit-card-selector"
      className="space-y-5 animate-in fade-in duration-300"
    >
      {/* Header & Search Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <LayoutGrid size={17} className="text-[#10a37f] shrink-0" />
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
              Pilih Unit / Ruangan
            </h2>
            <span className="text-xs font-semibold text-slate-400 tabular-nums">
              · {units.length} Ruangan
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Klik card ruangan di bawah ini untuk langsung membuka daftar indikator mutu dan melakukan penginputan.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          {/* Live Search Input */}
          <div className="relative flex-1 md:w-64">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Cari ruangan / layanan..."
              value={unitSearch}
              onChange={(e) => onSearchChange(e.target.value)}
              aria-label="Cari ruangan atau layanan"
              className="w-full h-10 pl-9 pr-8 rounded-xl bg-white border border-slate-200/90 text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none focus:border-[#10a37f] focus:ring-2 focus:ring-emerald-500/15 shadow-2xs transition-all"
            />
            {unitSearch && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                aria-label="Hapus pencarian"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Admin Add Room Trigger */}
          <button
            type="button"
            onClick={onAddRoom}
            className="h-10 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100/90 text-[#0d8c6d] border border-emerald-200/80 text-xs font-extrabold flex items-center justify-center transition-colors shadow-2xs whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            title="Tambah Ruangan"
          >
            <span>Tambah Unit</span>
          </button>
        </div>
      </div>

      {/* 4-Column Room Card Grid */}
      {units.length === 0 ? (
        <div className="py-12 px-6 text-center rounded-2xl bg-white border border-slate-200/80 space-y-2">
          <p className="text-sm font-bold text-slate-700">
            Ruangan tidak ditemukan
          </p>
          <p className="text-xs text-slate-500">
            Tidak ada unit yang cocok dengan kata kunci &quot;{unitSearch}&quot;.
          </p>
          {unitSearch && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="mt-2 inline-flex items-center px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Tampilkan Semua Ruangan
            </button>
          )}
        </div>
      ) : (
        <div
          data-testid="unit-card-grid"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 xl:gap-x-5 gap-y-5 xl:gap-y-6 pt-1"
        >
          {units.map((u, idx) => {
            const visual = getUnitVisualConfig(u.name, u.category);
            const style = getUnitThemeStyle(visual.theme);

            return (
              <div
                key={`${u.id}-${idx}`}
                data-testid="unit-card"
                className="relative pt-5 sm:pt-6 group h-full select-none transition-transform duration-300 ease-out hover:-translate-y-1.5 active:translate-y-0"
              >
                {/* 3D Pop-Out Hero Banner Icon breaking out of top-right corner */}
                <UnitPopOutIcon
                  src={visual.iconSrc}
                  alt={visual.iconAlt}
                  dropShadow={style.iconDropShadow}
                  groundShadow={style.groundShadow}
                  fallbackBg={style.fallbackBg}
                />

                {/* Admin Edit/Delete sibling actions at top-left (never nested inside select button) */}
                <div className="absolute top-[30px] sm:top-[34px] left-3 z-30 flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200">
                  <button
                    type="button"
                    onClick={(e) => onEditRoom(e, u)}
                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-white/95 rounded-lg transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    title={`Edit ${u.name}`}
                    aria-label={`Edit unit ${u.name}`}
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => onDeleteRoom(e, u.id)}
                    className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-white/95 rounded-lg transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                    title={`Hapus ${u.name}`}
                    aria-label={`Hapus unit ${u.name}`}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                {/* Native Button Card Body */}
                <button
                  type="button"
                  aria-label={`Pilih unit ${u.name}`}
                  onClick={() => handleSelect(u)}
                  className={`relative w-full text-center overflow-hidden h-full min-h-[132px] xl:min-h-[142px] rounded-[22px] bg-gradient-to-br ${style.cardBg} border ${style.cardBorder} ${style.hoverBorder} shadow-[0_2px_4px_rgba(15,23,42,0.04),0_8px_20px_rgba(15,23,42,0.07)] group-hover:shadow-[0_6px_14px_rgba(15,23,42,0.06),0_18px_32px_rgba(15,23,42,0.12)] transition-all duration-300 flex flex-col px-4 pt-3.5 pb-4 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500`}
                >
                  {/* Top Edge Specular Highlight Line */}
                  <div className="absolute top-0 left-5 right-5 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none" />

                  {/* Top-Right Radial Spotlight Glow behind 3D Pop-Out Icon */}
                  <div
                    className={`absolute -top-8 -right-8 w-28 h-28 bg-gradient-to-bl ${style.cornerGlow} rounded-full blur-xl pointer-events-none`}
                  />

                  {/* Bottom Accent Bar */}
                  <div
                    className={`absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r ${style.bottomBar} opacity-85 group-hover:opacity-100 group-hover:h-2 transition-all duration-300`}
                  />

                  {/* Top Spacer clearing admin controls (left) and 3D Pop-Out icon (right) */}
                  <div className="relative z-10 w-full min-h-[26px]" aria-hidden="true" />

                  {/* Center: Room Name & Subtle Category */}
                  <div className="relative z-10 w-full flex-1 flex flex-col items-center justify-center text-center px-1 py-1.5">
                    <h3
                      className={`text-[15px] xl:text-base font-extrabold text-slate-800 ${style.hoverTitle} tracking-tight leading-snug text-balance transition-colors`}
                    >
                      {u.name}
                    </h3>
                    <p className="text-[11px] font-semibold text-slate-500 mt-1">
                      {u.category}
                    </p>
                  </div>

                  {/* Subtle Footer Affordance */}
                  <div className="relative z-10 w-full pt-2 mt-1 border-t border-slate-200/50 flex items-center justify-center">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold ${style.ctaText} opacity-80 group-hover:opacity-100 transition-all`}
                    >
                      Input Mutu
                      <ArrowRight
                        size={12}
                        className="transition-transform duration-200 group-hover:translate-x-1"
                      />
                    </span>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
