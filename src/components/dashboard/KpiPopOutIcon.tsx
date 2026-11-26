import React, { useState } from "react";

export type KpiPopOutTheme = "emerald" | "red" | "blue" | "orange";

interface KpiPopOutIconProps {
  src: string;
  alt: string;
  theme: KpiPopOutTheme;
  fallbackIcon: React.ReactNode;
}

const THEME_CONFIG: Record<
  KpiPopOutTheme,
  {
    dropShadow: string;
    fallbackClass: string;
    ringGlow: string;
  }
> = {
  emerald: {
    dropShadow: "drop-shadow-[0_9px_13px_rgba(5,150,105,0.30)]",
    fallbackClass: "clay-icon-emerald",
    ringGlow: "bg-emerald-400/25",
  },
  red: {
    dropShadow: "drop-shadow-[0_9px_13px_rgba(220,38,38,0.30)]",
    fallbackClass: "clay-icon-red",
    ringGlow: "bg-red-400/25",
  },
  blue: {
    dropShadow: "drop-shadow-[0_9px_13px_rgba(37,99,235,0.30)]",
    fallbackClass: "clay-icon-blue",
    ringGlow: "bg-blue-400/25",
  },
  orange: {
    dropShadow: "drop-shadow-[0_9px_13px_rgba(234,88,12,0.30)]",
    fallbackClass: "clay-icon-orange",
    ringGlow: "bg-orange-400/25",
  },
};

/**
 * 3D Out-of-Bounds Pop-Out Hero Icon layer for Dashboard KPI cards.
 * Breaks cleanly above the card's top-left border with themed ground shadow and hover parallax.
 */
export default function KpiPopOutIcon({
  src,
  alt,
  theme,
  fallbackIcon,
}: KpiPopOutIconProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const cfg = THEME_CONFIG[theme];

  return (
    <div
      className="absolute top-0 left-3.5 sm:left-4 xl:left-5 z-20 pointer-events-none select-none flex items-end justify-center"
      aria-hidden="true"
    >
      {/* Soft ambient ground shadow resting on the card's hero pedestal */}
      <div
        className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-8 sm:w-10 xl:w-12 h-2 rounded-full blur-md transition-all duration-300 group-hover:w-10 sm:group-hover:w-12 xl:group-hover:w-14 group-hover:opacity-80 ${cfg.ringGlow}`}
      />

      {!imgFailed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          referrerPolicy="no-referrer"
          onError={() => setImgFailed(true)}
          className={`relative z-10 w-[48px] h-[48px] sm:w-[54px] sm:h-[54px] lg:w-[58px] lg:h-[58px] xl:w-[66px] xl:h-[66px] object-contain origin-bottom transition-transform duration-300 ease-out group-hover:-translate-y-1.5 group-hover:scale-110 group-hover:-rotate-3 ${cfg.dropShadow}`}
        />
      ) : (
        <div
          className={`relative z-10 p-2.5 sm:p-3 xl:p-3.5 rounded-2xl ${cfg.fallbackClass} text-white transition-transform duration-300 ease-out group-hover:-translate-y-1.5 group-hover:scale-110`}
        >
          {fallbackIcon}
        </div>
      )}
    </div>
  );
}
