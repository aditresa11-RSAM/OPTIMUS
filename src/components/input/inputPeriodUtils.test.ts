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

test("buildIsoDate clamps invalid end-of-month days safely", () => {
  assert.equal(buildIsoDate(2026, 2, 31), "2026-02-28");
  assert.equal(buildIsoDate(2024, 2, 31), "2024-02-29");
  assert.equal(buildIsoDate(2026, 10, 15), "2026-10-15");
  assert.deepEqual(parseIsoDateParts("2026-10-15"), { year: 2026, month: 10, day: 15 });
  assert.equal(formatIndonesianMonthYear("2026-10-15"), "Oktober 2026");
  assert.equal(formatIndonesianDate("2026-10-15"), "15 Okt 2026");
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
