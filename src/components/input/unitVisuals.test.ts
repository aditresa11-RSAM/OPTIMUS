import test from "node:test";
import assert from "node:assert/strict";
import { getUnitVisualConfig, getUnitThemeStyle } from "./unitVisuals";

const ALL_HOSPITAL_UNITS = [
  { name: "IGD", category: "Umum", expectedIcon: "/icons/units/igd.png" },
  { name: "Ranap Aisyah Anak", category: "Rawat Inap", expectedIcon: "/icons/units/ranap_anak.png" },
  { name: "Ranap Aisyah Bedah", category: "Rawat Inap", expectedIcon: "/icons/units/ranap_bedah.png" },
  { name: "Ranap Aisyah", category: "Rawat Inap", expectedIcon: "/icons/units/ranap_aisyah.png" },
  { name: "Ranap Fatimah", category: "Rawat Inap", expectedIcon: "/icons/units/ranap_fatimah.png" },
  { name: "Ranap Khadijah", category: "Rawat Inap", expectedIcon: "/icons/units/ranap_khadijah.png" },
  { name: "Emergency Kebidanan", category: "Gawat Darurat", expectedIcon: "/icons/units/emergency_kebidanan.png" },
  { name: "Ranap Usman", category: "Rawat Inap", expectedIcon: "/icons/units/ranap_usman.png" },
  { name: "ICU", category: "Intensif", expectedIcon: "/icons/units/icu.png" },
  { name: "IBS", category: "Khusus", expectedIcon: "/icons/units/ibs.png" },
  { name: "Rawat Jalan", category: "Rawat Jalan", expectedIcon: "/icons/units/rawat_jalan.png" },
  { name: "Radiologi", category: "Penunjang", expectedIcon: "/icons/units/radiologi.png" },
  { name: "Laboratorium", category: "Penunjang", expectedIcon: "/icons/units/laboratorium.png" },
  { name: "Farmasi", category: "Penunjang", expectedIcon: "/icons/units/farmasi.png" },
  { name: "Laundry / CSSD", category: "Penunjang", expectedIcon: "/icons/units/laundry_cssd.png" },
  { name: "Keamanan", category: "Umum", expectedIcon: "/icons/units/keamanan.png" },
  { name: "Kebersihan / Kesling", category: "Penunjang", expectedIcon: "/icons/units/kebersihan.png" },
  { name: "PONEK", category: "Khusus", expectedIcon: "/icons/units/ponek.png" },
  { name: "IPSRS", category: "Penunjang", expectedIcon: "/icons/units/ipsrs.png" },
  { name: "Rekam Medis", category: "Penunjang", expectedIcon: "/icons/units/rekam_medis.png" },
  { name: "Prognas", category: "Khusus", expectedIcon: "/icons/units/prognas.png" },
];

test("all 21 hospital units resolve to unique, dedicated 3D icons and valid themes", () => {
  const seenIcons = new Set<string>();
  for (const unit of ALL_HOSPITAL_UNITS) {
    const cfg = getUnitVisualConfig(unit.name, unit.category);
    assert.equal(cfg.iconSrc, unit.expectedIcon, `Expected ${unit.name} to map to ${unit.expectedIcon}`);
    assert.ok(cfg.iconAlt.length > 0);
    assert.ok(getUnitThemeStyle(cfg.theme).cardBg.length > 0);
    seenIcons.add(cfg.iconSrc);
  }
  assert.equal(seenIcons.size, 21, "Every one of the 21 hospital rooms should have its own unique 3D icon");
});

test("custom dynamically added rooms fall back cleanly based on category", () => {
  const ranapCustom = getUnitVisualConfig("Ruang VIP Baru", "Rawat Inap");
  assert.equal(ranapCustom.iconSrc, "/icons/units/ranap_aisyah.png");

  const penunjangCustom = getUnitVisualConfig("Unit Gizi Baru", "Penunjang");
  assert.equal(penunjangCustom.iconSrc, "/icons/units/laboratorium.png");
});
