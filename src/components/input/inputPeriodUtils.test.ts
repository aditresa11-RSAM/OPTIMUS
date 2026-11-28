import test from "node:test";
import assert from "node:assert/strict";
import {
  stripIndicatorCountSuffix,
  buildIsoDate,
  parseIsoDateParts,
  formatIndonesianMonthYear,
  formatIndonesianDate,
  parseSavedNotes,
  matchUnitAndMonth,
  countSavedDetailRows,
  splitChecklistIntoColumns,
  buildCalendarDaysGrid,
  buildYearRange,
} from "./inputPeriodUtils";

test("stripIndicatorCountSuffix removes trailing indicator count in parentheses", () => {
  assert.equal(
    stripIndicatorCountSuffix("Mutu Ruang IBS / Kamar Operasi (11 Indikator Wajib)"),
    "Mutu Ruang IBS / Kamar Operasi",
  );
  assert.equal(
    stripIndicatorCountSuffix("Mutu Ruang Laboratorium (2 Indikator Wajib)"),
    "Mutu Ruang Laboratorium",
  );
  assert.equal(
    stripIndicatorCountSuffix("Mutu Ruang IGD"),
    "Mutu Ruang IGD",
  );
});

test("buildIsoDate clamps invalid end-of-month days safely and supports birth years back to 1900", () => {
  assert.equal(buildIsoDate(2026, 2, 31), "2026-02-28");
  assert.equal(buildIsoDate(2024, 2, 31), "2024-02-29");
  assert.equal(buildIsoDate(1965, 5, 14), "1965-05-14");
  assert.equal(buildIsoDate(2026, 10, 15), "2026-10-15");
  assert.deepEqual(parseIsoDateParts("1965-05-14"), { year: 1965, month: 5, day: 14 });
  assert.equal(formatIndonesianMonthYear("2026-10-15"), "Oktober 2026");
  assert.equal(formatIndonesianDate("2026-10-15"), "15 Okt 2026");
});

test("buildCalendarDaysGrid generates 42 calendar cells and buildYearRange spans descending years", () => {
  const cells = buildCalendarDaysGrid(2026, 11);
  assert.equal(cells.length, 42);
  const currentMonthCells = cells.filter((c) => c.isCurrentMonth);
  assert.equal(currentMonthCells.length, 30);
  assert.equal(currentMonthCells[0].isoDate, "2026-11-01");
  assert.equal(currentMonthCells[29].isoDate, "2026-11-30");

  const years = buildYearRange(1920, 2035);
  assert.equal(years[0], 2035);
  assert.equal(years[years.length - 1], 1920);
  assert.equal(years.includes(1985), true);
});

test("matchUnitAndMonth matches exact unit and sub-unit entries for a given month", () => {
  assert.equal(matchUnitAndMonth("Laboratorium", "2026-10-12", "Laboratorium", "2026-10"), true);
  assert.equal(matchUnitAndMonth("Rawat Jalan - Poli Anak", "2026-10-05", "Rawat Jalan", "2026-10"), true);
  assert.equal(matchUnitAndMonth("Laboratorium", "2026-11-12", "Laboratorium", "2026-10"), false);
  assert.equal(matchUnitAndMonth("IBS", "2026-10-12", "Laboratorium", "2026-10"), false);
});

test("parseSavedNotes and countSavedDetailRows extract saved table rows safely", () => {
  const jsonStr = JSON.stringify({
    hasil_kritis_lab_details: [{ id: "1", nama_pasien: "Budi" }, { id: "2", nama_pasien: "Siti" }],
    keterangan: "Lengkap",
  });
  const parsed = parseSavedNotes(jsonStr);
  assert.equal(parsed.keterangan, "Lengkap");
  assert.equal(countSavedDetailRows(parsed), 2);
  assert.deepEqual(parseSavedNotes("Catatan biasa"), { keterangan: "Catatan biasa" });
});

test("splitChecklistIntoColumns arranges numbers top-to-bottom then right column", () => {
  assert.deepEqual(splitChecklistIntoColumns([1, 2, 3, 4, 5, 6]), [
    [1, 2, 3],
    [4, 5, 6],
  ]);
  assert.deepEqual(splitChecklistIntoColumns([1, 2, 3, 4]), [
    [1, 2],
    [3, 4],
  ]);
  assert.deepEqual(splitChecklistIntoColumns([1, 2, 3, 4, 5, 6, 7]), [
    [1, 2, 3, 4],
    [5, 6, 7],
  ]);
  assert.deepEqual(splitChecklistIntoColumns([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]), [
    [1, 2, 3, 4, 5, 6],
    [7, 8, 9, 10, 11],
  ]);
  assert.deepEqual(splitChecklistIntoColumns([1]), [[1], []]);
  assert.deepEqual(splitChecklistIntoColumns([]), [[], []]);
});
