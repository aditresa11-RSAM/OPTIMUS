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

export const INDONESIAN_MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
] as const;

/**
 * Removes trailing parenthetical count suffixes like "(11 Indikator Wajib)"
 * from guided unit header titles.
 */
export function stripIndicatorCountSuffix(title: string): string {
  return (title || "").replace(/\s*\(\s*\d+\s+indikator[^)]*\)\s*$/i, "").trim();
}

export interface IsoDateParts {
  year: number;
  month: number; // 1..12
  day: number; // 1..31
}

export function parseIsoDateParts(isoDate?: string): IsoDateParts {
  if (isoDate && /^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
    const [y, m, d] = isoDate.split("-").map(Number);
    if (y >= 1900 && y <= 2100 && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      return { year: y, month: m, day: d };
    }
  }
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  };
}

export interface CalendarCell {
  isoDate: string;
  year: number;
  month: number;
  day: number;
  isCurrentMonth: boolean;
}

/**
 * Generates a 42-cell (6 weeks × 7 days, Monday-first) calendar grid for a given year & month (1..12).
 */
export function buildCalendarDaysGrid(year: number, month: number): CalendarCell[] {
  const safeYear = Math.min(2100, Math.max(1900, Math.floor(year)));
  const safeMonth = Math.min(12, Math.max(1, Math.floor(month)));
  const firstOfMonth = new Date(safeYear, safeMonth - 1, 1);
  // Convert Sunday=0..Saturday=6 into Monday=0..Sunday=6
  const startOffset = (firstOfMonth.getDay() + 6) % 7;
  const daysInCurrentMonth = new Date(safeYear, safeMonth, 0).getDate();

  const prevMonthYear = safeMonth === 1 ? safeYear - 1 : safeYear;
  const prevMonth = safeMonth === 1 ? 12 : safeMonth - 1;
  const daysInPrevMonth = new Date(prevMonthYear, prevMonth, 0).getDate();

  const nextMonthYear = safeMonth === 12 ? safeYear + 1 : safeYear;
  const nextMonth = safeMonth === 12 ? 1 : safeMonth + 1;

  const cells: CalendarCell[] = [];

  for (let i = startOffset - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    cells.push({
      isoDate: buildIsoDate(prevMonthYear, prevMonth, day),
      year: prevMonthYear,
      month: prevMonth,
      day,
      isCurrentMonth: false,
    });
  }

  for (let day = 1; day <= daysInCurrentMonth; day++) {
    cells.push({
      isoDate: buildIsoDate(safeYear, safeMonth, day),
      year: safeYear,
      month: safeMonth,
      day,
      isCurrentMonth: true,
    });
  }

  let nextDay = 1;
  while (cells.length < 42) {
    cells.push({
      isoDate: buildIsoDate(nextMonthYear, nextMonth, nextDay),
      year: nextMonthYear,
      month: nextMonth,
      day: nextDay,
      isCurrentMonth: false,
    });
    nextDay++;
  }

  return cells;
}

/**
 * Generates a descending list of years from maxYear down to minYear for fast year selection.
 */
export function buildYearRange(minYear = 1920, maxYear = 2035): number[] {
  const years: number[] = [];
  for (let y = maxYear; y >= minYear; y--) {
    years.push(y);
  }
  return years;
}

/**
 * Builds a valid YYYY-MM-DD date string, clamping day to the last day of the target month.
 */
export function buildIsoDate(year: number, month: number, day: number): string {
  const safeMonth = Math.min(12, Math.max(1, Math.floor(month)));
  const safeYear = Math.min(2100, Math.max(1900, Math.floor(year)));
  const maxDay = new Date(safeYear, safeMonth, 0).getDate();
  const safeDay = Math.min(maxDay, Math.max(1, Math.floor(day)));

  const mm = String(safeMonth).padStart(2, "0");
  const dd = String(safeDay).padStart(2, "0");
  return `${safeYear}-${mm}-${dd}`;
}

export function formatIndonesianMonthYear(isoDate?: string): string {
  const { year, month } = parseIsoDateParts(isoDate);
  return `${INDONESIAN_MONTHS[month - 1]} ${year}`;
}

export function formatIndonesianDate(isoDate?: string): string {
  if (!isoDate || !/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return isoDate || "-";
  const { year, month, day } = parseIsoDateParts(isoDate);
  return `${day} ${INDONESIAN_MONTHS_SHORT[month - 1]} ${year}`;
}

export function parseSavedNotes(notes: unknown): Record<string, any> {
  if (!notes) return {};
  if (typeof notes === "object") return notes as Record<string, any>;
  if (typeof notes === "string") {
    try {
      const parsed = JSON.parse(notes);
      return parsed && typeof parsed === "object" ? parsed : { keterangan: notes };
    } catch {
      return { keterangan: notes };
    }
  }
  return {};
}

export function matchUnitAndMonth(
  entryUnit: string | undefined,
  entryDate: string | undefined,
  targetUnitName: string,
  targetMonthPrefix: string,
): boolean {
  const u = (entryUnit || "").trim().toLowerCase();
  const t = targetUnitName.trim().toLowerCase();
  if (!u || !t) return false;
  const unitMatches = u === t || u.startsWith(`${t} -`);
  if (!unitMatches) return false;
  return (entryDate || "").startsWith(targetMonthPrefix);
}

export function countSavedDetailRows(details: Record<string, any>): number {
  const arrayKeys = [
    "visite_details",
    "jatuh_details",
    "identifikasi_details",
    "waktu_tunggu_details",
    "racikan_waktu_tunggu_details",
    "high_alert_details",
    "kekosongan_obat_details",
    "sbar_details",
    "penundaan_operasi_details",
    "surgical_safety_details",
    "pembatalan_operasi_details",
    "penyediaan_darah_details",
    "imd_bayi_details",
    "kematian_ibu_bayi_details",
    "pengkajian_nyeri_details",
    "emergency_respon_time_details",
    "sc_emergency_details",
    "komplikasi_persalinan_details",
    "hasil_kritis_lab_details",
    "sampel_lab_pelabelan_details",
    "kunjungan_keluarga_details",
    "sarana_sanitasi_details",
    "pengangkutan_limbah_details",
    "penyediaan_alat_steril_details",
    "penyediaan_linen_details",
    "ketersediaan_air_details",
    "clinical_pathway_details",
    "verifikasi_telepon_details",
    "ya_tidak_details",
  ];

  for (const key of arrayKeys) {
    if (Array.isArray(details[key]) && details[key].length > 0) {
      return details[key].length;
    }
  }

  if (details.rekam_medis_details && typeof details.rekam_medis_details === "object") {
    const rm = details.rekam_medis_details;
    return (
      (Array.isArray(rm.kelengkapan_24jam) ? rm.kelengkapan_24jam.length : 0) +
      (Array.isArray(rm.review_rekam_medis) ? rm.review_rekam_medis.length : 0) +
      (Array.isArray(rm.review_ringkasan_pulang) ? rm.review_ringkasan_pulang.length : 0)
    );
  }

  if (details.radiologi_details && typeof details.radiologi_details === "object") {
    const rad = details.radiologi_details;
    return (
      (Array.isArray(rad.thorax_waktu_tunggu) ? rad.thorax_waktu_tunggu.length : 0) +
      (Array.isArray(rad.tindakan_ekspertisi) ? rad.tindakan_ekspertisi.length : 0) +
      (Array.isArray(rad.reject_analisis) ? rad.reject_analisis.length : 0)
    );
  }

  if (details.prognas_details && typeof details.prognas_details === "object") {
    return 1;
  }

  return 0;
}

/**
 * Splits checklist items into two vertical columns so numbers flow top-to-bottom
 * in column 1 (1, 2, 3...) before continuing in column 2 (4, 5, 6...).
 */
export function splitChecklistIntoColumns<T>(items: T[]): [T[], T[]] {
  const midpoint = Math.ceil(items.length / 2);
  return [items.slice(0, midpoint), items.slice(midpoint)];
}
