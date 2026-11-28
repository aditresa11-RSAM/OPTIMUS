import test from "node:test";
import assert from "node:assert/strict";
import {
  parseIsoDateParts,
  normalizeCategory,
  mapDbInputsToMutuPayloads,
  aggregateEntriesCapaian,
  evaluateAchievementStatus,
} from "./mutuSync";
import type { IndicatorProfile } from "@/store/useStore";

test("parseIsoDateParts parses 1st of month without UTC timezone shift", () => {
  const parsed = parseIsoDateParts("2026-11-01");
  assert.deepEqual(parsed, {
    year: 2026,
    monthIndex: 10,
    day: 1,
    monthName: "November",
  });

  const jan = parseIsoDateParts("2026-01-01T00:00:00.000Z");
  assert.deepEqual(jan, {
    year: 2026,
    monthIndex: 0,
    day: 1,
    monthName: "Januari",
  });
});

test("normalizeCategory unifies IMP Unit variants", () => {
  assert.equal(normalizeCategory("IMP Unit"), "IMP-Unit");
  assert.equal(normalizeCategory("IMP-UNIT"), "IMP-Unit");
  assert.equal(normalizeCategory("imp-rs"), "IMP-RS");
  assert.equal(normalizeCategory("inm"), "INM");
  assert.equal(normalizeCategory("spm"), "SPM");
});

test("mapDbInputsToMutuPayloads preserves numerator, denominator, title, and details", () => {
  const profiles: IndicatorProfile[] = [
    {
      id: "11110011-4a11-4000-9000-000000000011",
      category: "IMP-Unit",
      indicator_title: "Kepatuhan Asesmen Ulang Nyeri",
      rationale: "",
      quality_dimension: "",
      objective: "",
      operational_definition: "",
      indicator_type: "Proses",
      measurement_unit: "Persen (%)",
      numerator: "",
      denominator: "",
      target: "100%",
      criteria: "",
      formula: "",
      data_collection_method: "",
      data_source: "",
      sampling_method: "",
      data_collection_tool: "",
      sample_size: "",
      collection_period: "",
      analysis_period: "",
      data_presentation: "",
      person_responsible: "",
      reverse: false,
    },
  ];

  const mapped = mapDbInputsToMutuPayloads(
    [
      {
        id: "row-1",
        unit_id: "Ranap Aisyah Bedah",
        input_date: "2026-11-01",
        category_id: "IMP-Unit",
        indicator_id: "11110011-4a11-4000-9000-000000000011",
        numerator_value: 8,
        denominator_value: 10,
        achievement_percentage: 80,
        notes: JSON.stringify({
          keterangan: "Audit November",
          visite_details: [{ pasien: "A" }],
        }),
      },
    ],
    profiles,
  );

  assert.equal(mapped.length, 1);
  assert.equal(mapped[0].indikator_name, "Kepatuhan Asesmen Ulang Nyeri");
  assert.equal(mapped[0].numerator, 8);
  assert.equal(mapped[0].denominator, 10);
  assert.equal(mapped[0].capaian, 80);
  assert.equal(mapped[0].status, "Tidak Tercapai");
  assert.equal(mapped[0].keterangan, "Audit November");
  assert.equal(mapped[0].visite_details?.length, 1);
});

test("aggregateEntriesCapaian calculates weighted ratio when denominators exist", () => {
  const agg = aggregateEntriesCapaian([
    {
      id: "1",
      unit: "A",
      tanggal: "2026-11-01",
      kategori: "IMP-Unit",
      numerator: 1,
      denominator: 2,
      target: 100,
      capaian: 50,
      status: "Tidak Tercapai",
      keterangan: "",
    },
    {
      id: "2",
      unit: "B",
      tanggal: "2026-11-15",
      kategori: "IMP-Unit",
      numerator: 8,
      denominator: 8,
      target: 100,
      capaian: 100,
      status: "Tercapai",
      keterangan: "",
    },
  ]);

  assert.equal(agg.numeratorTotal, 9);
  assert.equal(agg.denominatorTotal, 10);
  assert.equal(agg.capaian, 90);
});

test("evaluateAchievementStatus handles normal and reverse targets accurately", () => {
  assert.equal(
    evaluateAchievementStatus(100, "100%", false).status,
    "Tercapai",
  );
  assert.equal(
    evaluateAchievementStatus(92, "100%", false).status,
    "Mendekati",
  );
  assert.equal(
    evaluateAchievementStatus(3, "≤ 5%", true).status,
    "Tercapai",
  );
  assert.equal(
    evaluateAchievementStatus(8, "≤ 5%", true).status,
    "Mendekati",
  );
  assert.equal(
    evaluateAchievementStatus(20, "≤ 5%", true).status,
    "Tidak Tercapai",
  );
});
