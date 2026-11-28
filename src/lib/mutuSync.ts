import type { DataMutuPayload, IndicatorProfile } from "@/store/useStore";

export const INDONESIAN_MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
] as const;

export function normalizeCategory(rawCategory?: string | null): string {
  const clean = String(rawCategory || "").trim();
  const upper = clean.toUpperCase();
  if (upper === "IMP UNIT" || upper === "IMP-UNIT" || upper === "IMP_UNIT") {
    return "IMP-Unit";
  }
  if (upper === "IMP RS" || upper === "IMP-RS" || upper === "IMP_RS") {
    return "IMP-RS";
  }
  if (upper === "INM") return "INM";
  if (upper === "SPM") return "SPM";
  if (upper === "IKP") return "IKP";
  return clean || "INM";
}

/**
 * Timezone-safe date parser for YYYY-MM-DD (or ISO) strings.
 * Avoids `new Date("YYYY-MM-01")` shifting to the previous month in UTC-negative timezones.
 */
export function parseIsoDateParts(
  dateStr?: string | null,
): { year: number; monthIndex: number; day: number; monthName: string } | null {
  if (!dateStr) return null;
  const trimmed = String(dateStr).trim();
  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const year = Number(isoMatch[1]);
    const monthIndex = Number(isoMatch[2]) - 1;
    const day = Number(isoMatch[3]);
    if (
      !Number.isNaN(year) &&
      monthIndex >= 0 &&
      monthIndex <= 11 &&
      day >= 1 &&
      day <= 31
    ) {
      return {
        year,
        monthIndex,
        day,
        monthName: INDONESIAN_MONTHS[monthIndex],
      };
    }
  }

  const fallback = new Date(trimmed);
  if (Number.isNaN(fallback.getTime())) return null;
  const monthIndex = fallback.getMonth();
  return {
    year: fallback.getFullYear(),
    monthIndex,
    day: fallback.getDate(),
    monthName: INDONESIAN_MONTHS[monthIndex] || "Januari",
  };
}

export function getLocalCurrentYearMonth(now: Date = new Date()): {
  year: number;
  yearStr: string;
  monthIndex: number;
  monthName: string;
} {
  const year = now.getFullYear();
  const monthIndex = now.getMonth();
  return {
    year,
    yearStr: String(year),
    monthIndex,
    monthName: INDONESIAN_MONTHS[monthIndex] || "Januari",
  };
}

export function parseNumericTarget(
  rawTarget: string | number | undefined | null,
  fallback = 80,
): number {
  if (typeof rawTarget === "number" && !Number.isNaN(rawTarget)) {
    return rawTarget;
  }
  const str = String(rawTarget ?? "").replace(",", ".");
  const match = str.match(/(\d+(?:\.\d+)?)/);
  if (!match) return fallback;
  const num = parseFloat(match[1]);
  return Number.isNaN(num) ? fallback : num;
}

export function isReverseIndicatorTarget(
  rawTarget?: string | number | null,
  profileReverse?: boolean,
): boolean {
  if (profileReverse) return true;
  const clean = String(rawTarget ?? "").trim();
  return (
    clean.startsWith("<") ||
    clean.startsWith("≤") ||
    clean === "0%" ||
    clean === "0"
  );
}

export function evaluateAchievementStatus(
  capaian: number,
  rawTarget: string | number | undefined | null,
  profileReverse?: boolean,
): {
  status: "Tercapai" | "Mendekati" | "Tidak Tercapai";
  colorStatus: "green" | "orange" | "red";
  isSuccess: boolean;
  isReverse: boolean;
  targetNum: number;
} {
  const isReverse = isReverseIndicatorTarget(rawTarget, profileReverse);
  const targetNum = parseNumericTarget(rawTarget, isReverse ? 0 : 80);
  const clean = String(rawTarget ?? "").trim();

  let isSuccess = false;
  if (isReverse) {
    if (clean.startsWith("<") && !clean.startsWith("<=")) {
      isSuccess = targetNum === 0 ? capaian <= 0 : capaian < targetNum;
    } else {
      isSuccess = capaian <= targetNum;
    }
  } else {
    isSuccess = capaian >= targetNum;
  }

  if (isSuccess) {
    return {
      status: "Tercapai",
      colorStatus: "green",
      isSuccess: true,
      isReverse,
      targetNum,
    };
  }

  const gap = isReverse ? capaian - targetNum : targetNum - capaian;
  if (gap <= 10) {
    return {
      status: "Mendekati",
      colorStatus: "orange",
      isSuccess: false,
      isReverse,
      targetNum,
    };
  }

  return {
    status: "Tidak Tercapai",
    colorStatus: "red",
    isSuccess: false,
    isReverse,
    targetNum,
  };
}

export function adaptMasterProfileFromDb(dbItem: any): IndicatorProfile {
  return {
    id: dbItem.id,
    category: normalizeCategory(dbItem.category),
    indicator_title: dbItem.title || dbItem.indicator_title || "",
    rationale: dbItem.rationale || "—",
    quality_dimension: dbItem.quality_dimension || "—",
    objective: dbItem.purpose || dbItem.objective || "—",
    operational_definition: dbItem.operational_definition || "—",
    indicator_type: dbItem.indicator_type || "Proses",
    measurement_unit:
      dbItem.measurement_unit === "Rasio"
        ? "Indeks"
        : dbItem.satuan_pengukuran || dbItem.measurement_unit || "Persen (%)",
    numerator: dbItem.numerator || "—",
    denominator: dbItem.denominator || "—",
    target:
      dbItem.target === null || dbItem.target === undefined
        ? ""
        : String(dbItem.target),
    criteria: dbItem.criteria || "—",
    formula: dbItem.formula || "—",
    data_collection_method: dbItem.data_collection_method || "Retrospektif",
    data_source: dbItem.data_source || "Rekam Medis",
    sampling_method: dbItem.sampling_method || "Total Sampling",
    data_collection_tool:
      dbItem.data_collection_instrument || dbItem.data_collection_tool || "—",
    sample_size: dbItem.sample_size || "—",
    collection_period: dbItem.collection_period || "Bulanan",
    analysis_period: dbItem.analysis_period || "Triwulanan",
    data_presentation: dbItem.data_presentation || "Tabel & Grafik",
    person_responsible:
      dbItem.person_in_charge || dbItem.person_responsible || "—",
    reverse: Boolean(dbItem.reverse),
    created_at: dbItem.created_at,
    updated_at: dbItem.updated_at,
  };
}

export function mapDbInputsToMutuPayloads(
  rows: any[],
  profiles: IndicatorProfile[],
): DataMutuPayload[] {
  const profileMap = new Map<string, IndicatorProfile>();
  for (const p of profiles) {
    profileMap.set(p.id, p);
  }

  return (rows || []).map((dbInput: any) => {
    const matchedProfile = dbInput.indicator_id
      ? profileMap.get(dbInput.indicator_id)
      : undefined;
    const persentase = Number(dbInput.achievement_percentage) || 0;
    const rawTarget = dbInput.target ?? matchedProfile?.target ?? 80;
    const evalRes = evaluateAchievementStatus(
      persentase,
      rawTarget,
      matchedProfile?.reverse,
    );

    let notesData: Record<string, any> = {};
    if (typeof dbInput.notes === "string" && dbInput.notes.trim()) {
      try {
        const parsed = JSON.parse(dbInput.notes);
        if (typeof parsed === "object" && parsed !== null) {
          notesData = parsed;
        } else {
          notesData = { keterangan: dbInput.notes };
        }
      } catch {
        notesData = { keterangan: dbInput.notes };
      }
    } else if (dbInput.notes && typeof dbInput.notes === "object") {
      notesData = dbInput.notes;
    }

    const kategori = normalizeCategory(dbInput.category_id);

    return {
      id: dbInput.id,
      unit: dbInput.unit_id || "",
      tanggal: dbInput.input_date || "",
      kategori,
      indikator_id: dbInput.indicator_id || undefined,
      indikator_name: matchedProfile?.indicator_title || undefined,
      numerator: Number(dbInput.numerator_value) || 0,
      denominator:
        dbInput.denominator_value !== null &&
        dbInput.denominator_value !== undefined
          ? Number(dbInput.denominator_value)
          : 0,
      target: evalRes.targetNum,
      capaian: persentase,
      status: (kategori === "IKP" ? "N/A" : evalRes.status) as any,
      keterangan: notesData.keterangan ?? "",
      kpc: Number(notesData.kpc) || 0,
      knc: Number(notesData.knc) || 0,
      ktc: Number(notesData.ktc) || 0,
      ktd: Number(notesData.ktd) || 0,
      sentinel: Number(notesData.sentinel) || 0,
      visite_details: Array.isArray(notesData.visite_details)
        ? notesData.visite_details
        : [],
      jatuh_details: Array.isArray(notesData.jatuh_details)
        ? notesData.jatuh_details
        : [],
      identifikasi_details: Array.isArray(notesData.identifikasi_details)
        ? notesData.identifikasi_details
        : [],
      waktu_tunggu_details: Array.isArray(notesData.waktu_tunggu_details)
        ? notesData.waktu_tunggu_details
        : Array.isArray(notesData.details)
          ? notesData.details
          : [],
      ...(notesData.fullFormData
        ? { fullFormData: notesData.fullFormData }
        : {}),
    } as DataMutuPayload;
  });
}

/**
 * Consistent weighted-ratio aggregation used across Dashboard, Grafik, and Laporan.
 * If denominator totals > 0, computes (sum(numerator) / sum(denominator)) * 100;
 * otherwise falls back to mean of entry.capaian.
 */
export function aggregateEntriesCapaian(entries: DataMutuPayload[]): {
  capaian: number;
  numeratorTotal: number;
  denominatorTotal: number;
  count: number;
} {
  if (!entries || entries.length === 0) {
    return { capaian: 0, numeratorTotal: 0, denominatorTotal: 0, count: 0 };
  }

  let numeratorTotal = 0;
  let denominatorTotal = 0;
  let capaianSum = 0;

  for (const e of entries) {
    numeratorTotal += Number(e.numerator) || 0;
    denominatorTotal += Number(e.denominator) || 0;
    capaianSum += Number(e.capaian) || 0;
  }

  const capaian =
    denominatorTotal > 0
      ? Number(((numeratorTotal / denominatorTotal) * 100).toFixed(2))
      : Number((capaianSum / entries.length).toFixed(2));

  return {
    capaian,
    numeratorTotal,
    denominatorTotal,
    count: entries.length,
  };
}
