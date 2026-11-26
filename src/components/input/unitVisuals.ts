export type UnitCardTheme =
  | "emerald"
  | "red"
  | "blue"
  | "cyan"
  | "indigo"
  | "rose"
  | "amber"
  | "teal"
  | "violet";

export interface UnitVisualConfig {
  iconSrc: string;
  iconAlt: string;
  theme: UnitCardTheme;
  accentLabel: string;
}

const THEME_STYLES: Record<
  UnitCardTheme,
  {
    cardBg: string;
    cardBorder: string;
    hoverBorder: string;
    bottomBar: string;
    cornerGlow: string;
    iconDropShadow: string;
    groundShadow: string;
    hoverTitle: string;
    ctaText: string;
    fallbackBg: string;
  }
> = {
  emerald: {
    cardBg: "from-white via-white to-emerald-50/75",
    cardBorder: "border-emerald-200/75",
    hoverBorder: "group-hover:border-emerald-400/90",
    bottomBar: "from-emerald-400 to-emerald-600",
    cornerGlow: "from-emerald-300/35 via-emerald-200/15 to-transparent",
    iconDropShadow: "drop-shadow-[0_10px_14px_rgba(5,150,105,0.30)]",
    groundShadow: "bg-emerald-400/25",
    hoverTitle: "group-hover:text-emerald-900",
    ctaText: "text-emerald-700",
    fallbackBg: "bg-emerald-600",
  },
  red: {
    cardBg: "from-white via-white to-red-50/75",
    cardBorder: "border-red-200/75",
    hoverBorder: "group-hover:border-red-400/90",
    bottomBar: "from-red-400 to-red-600",
    cornerGlow: "from-red-300/35 via-red-200/15 to-transparent",
    iconDropShadow: "drop-shadow-[0_10px_14px_rgba(220,38,38,0.30)]",
    groundShadow: "bg-red-400/25",
    hoverTitle: "group-hover:text-red-900",
    ctaText: "text-red-700",
    fallbackBg: "bg-red-600",
  },
  blue: {
    cardBg: "from-white via-white to-blue-50/75",
    cardBorder: "border-blue-200/75",
    hoverBorder: "group-hover:border-blue-400/90",
    bottomBar: "from-blue-400 to-blue-600",
    cornerGlow: "from-blue-300/35 via-blue-200/15 to-transparent",
    iconDropShadow: "drop-shadow-[0_10px_14px_rgba(37,99,235,0.30)]",
    groundShadow: "bg-blue-400/25",
    hoverTitle: "group-hover:text-blue-900",
    ctaText: "text-blue-700",
    fallbackBg: "bg-blue-600",
  },
  cyan: {
    cardBg: "from-white via-white to-cyan-50/75",
    cardBorder: "border-cyan-200/75",
    hoverBorder: "group-hover:border-cyan-400/90",
    bottomBar: "from-cyan-400 to-sky-600",
    cornerGlow: "from-cyan-300/35 via-cyan-200/15 to-transparent",
    iconDropShadow: "drop-shadow-[0_10px_14px_rgba(8,145,178,0.30)]",
    groundShadow: "bg-cyan-400/25",
    hoverTitle: "group-hover:text-cyan-950",
    ctaText: "text-cyan-700",
    fallbackBg: "bg-cyan-600",
  },
  indigo: {
    cardBg: "from-white via-white to-indigo-50/75",
    cardBorder: "border-indigo-200/75",
    hoverBorder: "group-hover:border-indigo-400/90",
    bottomBar: "from-indigo-400 to-indigo-600",
    cornerGlow: "from-indigo-300/35 via-indigo-200/15 to-transparent",
    iconDropShadow: "drop-shadow-[0_10px_14px_rgba(79,70,229,0.30)]",
    groundShadow: "bg-indigo-400/25",
    hoverTitle: "group-hover:text-indigo-950",
    ctaText: "text-indigo-700",
    fallbackBg: "bg-indigo-600",
  },
  rose: {
    cardBg: "from-white via-white to-rose-50/75",
    cardBorder: "border-rose-200/75",
    hoverBorder: "group-hover:border-rose-400/90",
    bottomBar: "from-rose-400 to-pink-600",
    cornerGlow: "from-rose-300/35 via-rose-200/15 to-transparent",
    iconDropShadow: "drop-shadow-[0_10px_14px_rgba(225,29,72,0.28)]",
    groundShadow: "bg-rose-400/25",
    hoverTitle: "group-hover:text-rose-950",
    ctaText: "text-rose-700",
    fallbackBg: "bg-rose-600",
  },
  amber: {
    cardBg: "from-white via-white to-amber-50/75",
    cardBorder: "border-amber-200/75",
    hoverBorder: "group-hover:border-amber-400/90",
    bottomBar: "from-amber-400 to-orange-600",
    cornerGlow: "from-amber-300/35 via-amber-200/15 to-transparent",
    iconDropShadow: "drop-shadow-[0_10px_14px_rgba(217,119,6,0.30)]",
    groundShadow: "bg-amber-400/25",
    hoverTitle: "group-hover:text-amber-950",
    ctaText: "text-amber-700",
    fallbackBg: "bg-amber-600",
  },
  teal: {
    cardBg: "from-white via-white to-teal-50/75",
    cardBorder: "border-teal-200/75",
    hoverBorder: "group-hover:border-teal-400/90",
    bottomBar: "from-teal-400 to-teal-600",
    cornerGlow: "from-teal-300/35 via-teal-200/15 to-transparent",
    iconDropShadow: "drop-shadow-[0_10px_14px_rgba(13,148,136,0.30)]",
    groundShadow: "bg-teal-400/25",
    hoverTitle: "group-hover:text-teal-950",
    ctaText: "text-teal-700",
    fallbackBg: "bg-teal-600",
  },
  violet: {
    cardBg: "from-white via-white to-violet-50/75",
    cardBorder: "border-violet-200/75",
    hoverBorder: "group-hover:border-violet-400/90",
    bottomBar: "from-violet-400 to-violet-600",
    cornerGlow: "from-violet-300/35 via-violet-200/15 to-transparent",
    iconDropShadow: "drop-shadow-[0_10px_14px_rgba(124,58,237,0.28)]",
    groundShadow: "bg-violet-400/25",
    hoverTitle: "group-hover:text-violet-950",
    ctaText: "text-violet-700",
    fallbackBg: "bg-violet-600",
  },
};

export function getUnitThemeStyle(theme: UnitCardTheme) {
  return THEME_STYLES[theme];
}

/**
 * Pure resolver mapping every hospital unit/room name to its bespoke 3D Pop-Out icon
 * and cohesive visual color identity. Handles exact unit names as well as dynamically
 * added rooms via keyword matching.
 */
export function getUnitVisualConfig(
  unitName: string,
  category?: string
): UnitVisualConfig {
  const n = (unitName || "").trim().toLowerCase();
  const c = (category || "").trim().toLowerCase();

  // Exact & specialized hospital rooms
  if (n === "igd" || n.includes("gawat darurat")) {
    return {
      iconSrc: "/icons/units/igd.png",
      iconAlt: "Ikon 3D Ambulans IGD",
      theme: "red",
      accentLabel: "Gawat Darurat",
    };
  }
  if (n.includes("aisyah anak") || n.includes("anak") || n.includes("pediatri")) {
    return {
      iconSrc: "/icons/units/ranap_anak.png",
      iconAlt: "Ikon 3D Ruang Rawat Inap Anak",
      theme: "cyan",
      accentLabel: "Rawat Inap Anak",
    };
  }
  if (n.includes("aisyah bedah") || n.includes("bedah")) {
    return {
      iconSrc: "/icons/units/ranap_bedah.png",
      iconAlt: "Ikon 3D Kit Bedah Rawat Inap",
      theme: "blue",
      accentLabel: "Rawat Inap Bedah",
    };
  }
  if (n.includes("aisyah")) {
    return {
      iconSrc: "/icons/units/ranap_aisyah.png",
      iconAlt: "Ikon 3D Tempat Tidur Rawat Inap Aisyah",
      theme: "emerald",
      accentLabel: "Rawat Inap",
    };
  }
  if (n.includes("fatimah")) {
    return {
      iconSrc: "/icons/units/ranap_fatimah.png",
      iconAlt: "Ikon 3D Tiang Infus Ranap Fatimah",
      theme: "teal",
      accentLabel: "Rawat Inap",
    };
  }
  if (n.includes("emergency kebidanan")) {
    return {
      iconSrc: "/icons/units/emergency_kebidanan.png",
      iconAlt: "Ikon 3D Sirene Emergency Kebidanan",
      theme: "rose",
      accentLabel: "Gawat Darurat Kebidanan",
    };
  }
  if (n.includes("khadijah") || n.includes("kebidanan") || n.includes("vk")) {
    return {
      iconSrc: "/icons/units/ranap_khadijah.png",
      iconAlt: "Ikon 3D Boks Bayi Kebidanan",
      theme: "rose",
      accentLabel: "Kebidanan",
    };
  }
  if (n.includes("usman")) {
    return {
      iconSrc: "/icons/units/ranap_usman.png",
      iconAlt: "Ikon 3D Perawatan Ranap Usman",
      theme: "blue",
      accentLabel: "Rawat Inap",
    };
  }
  if (n === "icu" || n.includes("intensif") || n.includes("nicu") || n.includes("picu")) {
    return {
      iconSrc: "/icons/units/icu.png",
      iconAlt: "Ikon 3D Monitor Vital ICU",
      theme: "indigo",
      accentLabel: "Perawatan Intensif",
    };
  }
  if (n === "ibs" || n.includes("operasi") || n.includes("kamar bedah")) {
    return {
      iconSrc: "/icons/units/ibs.png",
      iconAlt: "Ikon 3D Lampu Operasi IBS",
      theme: "cyan",
      accentLabel: "Bedah Sentral",
    };
  }
  if (n.includes("rawat jalan") || n.includes("poli")) {
    return {
      iconSrc: "/icons/units/rawat_jalan.png",
      iconAlt: "Ikon 3D Stetoskop Rawat Jalan",
      theme: "emerald",
      accentLabel: "Poliklinik",
    };
  }
  if (n.includes("radiologi") || n.includes("rontgen")) {
    return {
      iconSrc: "/icons/units/radiologi.png",
      iconAlt: "Ikon 3D X-Ray Radiologi",
      theme: "indigo",
      accentLabel: "Penunjang Radiologi",
    };
  }
  if (n.includes("lab")) {
    return {
      iconSrc: "/icons/units/laboratorium.png",
      iconAlt: "Ikon 3D Botol Lab Laboratorium",
      theme: "teal",
      accentLabel: "Penunjang Lab",
    };
  }
  if (n.includes("farmasi") || n.includes("apotek") || n.includes("obat")) {
    return {
      iconSrc: "/icons/units/farmasi.png",
      iconAlt: "Ikon 3D Botol Obat Farmasi",
      theme: "emerald",
      accentLabel: "Penunjang Farmasi",
    };
  }
  if (n.includes("laundry") || n.includes("cssd") || n.includes("steril")) {
    return {
      iconSrc: "/icons/units/laundry_cssd.png",
      iconAlt: "Ikon 3D Mesin Sterilisasi Laundry CSSD",
      theme: "cyan",
      accentLabel: "Sterilisasi & Linen",
    };
  }
  if (n.includes("keamanan") || n.includes("security") || n.includes("satpam")) {
    return {
      iconSrc: "/icons/units/keamanan.png",
      iconAlt: "Ikon 3D Perisai Keamanan",
      theme: "indigo",
      accentLabel: "Keamanan RS",
    };
  }
  if (n.includes("kebersihan") || n.includes("kesling") || n.includes("sanitasi")) {
    return {
      iconSrc: "/icons/units/kebersihan.png",
      iconAlt: "Ikon 3D Botol Sanitasi Kebersihan",
      theme: "emerald",
      accentLabel: "Kesehatan Lingkungan",
    };
  }
  if (n.includes("ponek") || n.includes("neonatal") || n.includes("perina")) {
    return {
      iconSrc: "/icons/units/ponek.png",
      iconAlt: "Ikon 3D Neonatal PONEK",
      theme: "rose",
      accentLabel: "Obstetri Neonatal",
    };
  }
  if (n.includes("ipsrs") || n.includes("teknik") || n.includes("sarana")) {
    return {
      iconSrc: "/icons/units/ipsrs.png",
      iconAlt: "Ikon 3D Kunci Inggris & Gear IPSRS",
      theme: "amber",
      accentLabel: "Pemeliharaan Sarana",
    };
  }
  if (n.includes("rekam medis") || n.includes("rm")) {
    return {
      iconSrc: "/icons/units/rekam_medis.png",
      iconAlt: "Ikon 3D Map Rekam Medis",
      theme: "blue",
      accentLabel: "Rekam Medis",
    };
  }
  if (n.includes("prognas") || n.includes("program nasional")) {
    return {
      iconSrc: "/icons/units/prognas.png",
      iconAlt: "Ikon 3D Program Nasional Kesehatan",
      theme: "teal",
      accentLabel: "Program Nasional",
    };
  }

  // Category-based graceful fallbacks for custom user-added rooms
  if (c.includes("rawat inap")) {
    return {
      iconSrc: "/icons/units/ranap_aisyah.png",
      iconAlt: `Ikon 3D ${unitName}`,
      theme: "emerald",
      accentLabel: category || "Rawat Inap",
    };
  }
  if (c.includes("gawat") || c.includes("intensif")) {
    return {
      iconSrc: "/icons/units/igd.png",
      iconAlt: `Ikon 3D ${unitName}`,
      theme: "red",
      accentLabel: category || "Gawat Darurat",
    };
  }
  if (c.includes("penunjang")) {
    return {
      iconSrc: "/icons/units/laboratorium.png",
      iconAlt: `Ikon 3D ${unitName}`,
      theme: "teal",
      accentLabel: category || "Penunjang",
    };
  }
  return {
    iconSrc: "/icons/units/rawat_jalan.png",
    iconAlt: `Ikon 3D ${unitName}`,
    theme: "emerald",
    accentLabel: category || "Unit Layanan",
  };
}
