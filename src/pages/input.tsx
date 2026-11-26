import React, { useState, useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Zap,
  Building2,
  Calendar,
  Layers,
  Activity,
  CheckCircle2,
  ShieldAlert,
  FileText,
  Plus,
  Trash2,
  Search,
  Edit2,
  Check,
  X,
  FileUp,
  Clock,
  ArrowRight,
  ChevronDown,
  Save,
  Target,
  Sparkles,
} from "lucide-react";
import {
  useStore,
  DataMutuPayload,
  VisiteData,
  JatuhData,
  Unit,
  IndicatorProfile,
  WaktuTungguData,
  IdentifikasiData,
  MomentIdentifikasi,
  ClinicalPathwayData,
  VerifikasiTeleponData,
  YaTidakPasienData,
  RacikanWaktuTungguData,
  HighAlertDoubleCheckData,
  KekosonganObatData,
  SBARData,
  PenundaanOperasiData,
  SurgicalSafetyData,
  PembatalanOperasiData,
  PenyediaanDarahData,
  ImdBayiData,
  KematianIbuBayiData,
  PengkajianNyeriData,
  EmergencyResponTimeData,
  ScEmergencyData,
  KomplikasiPersalinanData,
  HasilKritisLabData,
  SampelLabPelabelanData,
  KunjunganKeluargaData,
  PengangkutanLimbahData,
  SaranaSanitasiData,
  PenyediaanAlatSterilData,
  PenyediaanLinenData,
  KetersediaanAirData,
  RekamMedisAuditBundle,
  RadiologiAuditBundle,
  PrognasMutuData,
} from "@/store/useStore";
import RekamMedisAuditForm, {
  createEmptyRekamMedisBundle,
  computeRekamMedisMetrics,
  stripEmptyRekamMedisRows,
} from "@/components/input/RekamMedisAuditForm";
import WaktuTungguRajalForm, {
  RAJAL_SHEET_POLIS,
  RajalSheetPoli,
  createEmptyWaktuTungguRow,
  isRajalRowFilled,
  isRajalRowCompliant,
} from "@/components/input/WaktuTungguRajalForm";
import RadiologiAuditForm, {
  createEmptyRadiologiBundle,
  computeRadiologiMetrics,
  stripEmptyRadiologiRows,
} from "@/components/input/RadiologiAuditForm";
import PrognasMutuForm, {
  PrognasIndicatorType,
  createEmptyPrognasData,
  computePrognasStats,
} from "@/components/input/PrognasMutuForm";
import { supabase } from "@/lib/supabase";
import { motion } from "motion/react";

const RSUD_DPJP_LIST = [
  "dr. Hijrah Saputra WR, Sp.PD",
  "dr. Niko Adhi Husni, Sp.PD., M.Kes., FINASIM",
  "dr. Dhyniek Nurul F.L.A., Sp.A",
  "dr. Ferry Sudarsono, Sp.B",
  "dr. Haris Nur, Sp.N",
  "dr. Billy Nusa Anggara T., Sp.OG",
  "dr. Muthiah Nurul Izzah, Sp.OG",
  "dr. Asep Tajul Mutaqin, Sp.B",
];

interface UnitMutuItem {
  order: number;
  label: string;
  badge: "INM" | "IMP-RS" | "IMP-Unit" | "SPM";
  badgeLabel?: string;
  matchId: string;
  matchTitle: string;
}

type GuidedUnitKey =
  | "ANAK"
  | "BEDAH"
  | "FARMASI"
  | "FATIMAH"
  | "IBS"
  | "ICU"
  | "IGD"
  | "KHADIJAH"
  | "EMERGENCY_KEBIDANAN"
  | "LABORATORIUM"
  | "USMAN"
  | "KEAMANAN"
  | "KEBERSIHAN"
  | "LAUNDRY_CSSD"
  | "PONEK"
  | "IPSRS"
  | "REKAM_MEDIS"
  | "RAWAT_JALAN"
  | "RADIOLOGI"
  | "PROGNAS";

const UNIT_MUTU_BLUEPRINTS: Record<
  GuidedUnitKey,
  { unitTitle: string; items: UnitMutuItem[] }
> = {
  ANAK: {
    unitTitle: "Mutu Ruang Ranap Aisyah Anak (6 Indikator Wajib)",
    items: [
      {
        order: 1,
        label: "Kepatuhan Identifikasi Pasien",
        badge: "INM",
        matchId: "fcd1ccca-aaf7-4e09-b951-92bcd1e28b07",
        matchTitle: "identifikasi pasien",
      },
      {
        order: 2,
        label: "Kepatuhan Upaya Pencegahan Risiko Pasien Jatuh",
        badge: "INM",
        matchId: "2c1d917e-5a3e-484d-a482-32aaa7fd4007",
        matchTitle: "upaya pencegahan risiko",
      },
      {
        order: 3,
        label: "Kepatuhan Jam Visite Dokter",
        badge: "INM",
        matchId: "c5ae8720-5f8b-4f1a-933b-4053a9a81f1b",
        matchTitle: "visite dokter",
      },
      {
        order: 4,
        label: "Kepatuhan Clinical Pathway",
        badge: "INM",
        matchId: "e4f1beae-7903-4be1-97e5-34ef59270131",
        matchTitle: "alur klinis",
      },
      {
        order: 5,
        label: "Pelaksanaan Verifikasi 1x24 Jam Pada Instruksi Melalui Telepon Oleh DPJP",
        badge: "IMP-RS",
        matchId: "307d7c2c-b6ef-4ea4-b09f-6821edd4575b",
        matchTitle: "telepon",
      },
      {
        order: 6,
        label: "Kepatuhan Skrining Risiko Jatuh Pasien Anak",
        badge: "IMP-Unit",
        matchId: "11110010-4a10-4000-9000-000000000010",
        matchTitle: "skrining risiko jatuh pasien anak",
      },
    ],
  },
  BEDAH: {
    unitTitle: "Mutu Ruang Ranap Aisyah Bedah (8 Indikator Wajib)",
    items: [
      {
        order: 1,
        label: "Kepatuhan Identifikasi Pasien",
        badge: "INM",
        matchId: "fcd1ccca-aaf7-4e09-b951-92bcd1e28b07",
        matchTitle: "identifikasi pasien",
      },
      {
        order: 2,
        label: "Kepatuhan Upaya Pencegahan Risiko Pasien Jatuh",
        badge: "INM",
        matchId: "2c1d917e-5a3e-484d-a482-32aaa7fd4007",
        matchTitle: "upaya pencegahan risiko",
      },
      {
        order: 3,
        label: "Kepatuhan Jam Visite Dokter",
        badge: "INM",
        matchId: "c5ae8720-5f8b-4f1a-933b-4053a9a81f1b",
        matchTitle: "visite dokter",
      },
      {
        order: 4,
        label: "Kepatuhan Clinical Pathway",
        badge: "INM",
        matchId: "e4f1beae-7903-4be1-97e5-34ef59270131",
        matchTitle: "alur klinis",
      },
      {
        order: 5,
        label: "Pelaksanaan Verifikasi 1x24 Jam Pada Instruksi Melalui Telepon Oleh DPJP",
        badge: "IMP-RS",
        matchId: "307d7c2c-b6ef-4ea4-b09f-6821edd4575b",
        matchTitle: "telepon",
      },
      {
        order: 6,
        label: "Kepatuhan Skrining Disfagia Pada Pasien Stroke",
        badge: "IMP-RS",
        matchId: "e3e86294-6cb4-401f-90b7-12881b050c62",
        matchTitle: "skrining disfagia",
      },
      {
        order: 7,
        label: "Kelengkapan Asesmen Awal Medis Dalam Waktu 24 Jam Pada Pasien Rawat Inap",
        badge: "IMP-Unit",
        matchId: "11110017-4a17-4000-9000-000000000017",
        matchTitle: "asesmen awal medis dalam waktu 24 jam",
      },
      {
        order: 8,
        label: "Kepatuhan Reasesmen Nyeri (Aisyah Bedah)",
        badge: "IMP-Unit",
        matchId: "11110011-4a11-4000-9000-000000000011",
        matchTitle: "reasesmen nyeri",
      },
    ],
  },
  FARMASI: {
    unitTitle: "Mutu Ruang Farmasi (4 Indikator Wajib)",
    items: [
      {
        order: 1,
        label: "Waktu Tunggu Pelayanan Obat Racikan ≤ 60 Menit",
        badge: "IMP-Unit",
        matchId: "11110003-4a03-4000-9000-000000000003",
        matchTitle: "obat racikan",
      },
      {
        order: 2,
        label: "Kepatuhan Penggunaan Formularium Nasional",
        badge: "INM",
        matchId: "9871c4ca-55dc-45e4-acc8-a37dce8c2a67",
        matchTitle: "formularium nasional",
      },
      {
        order: 3,
        label: "Kepatuhan Double Check Obat High Alert Sebelum Pemberian Obat",
        badge: "IMP-RS",
        matchId: "b977461c-a791-46ff-a9dd-62d0427aa0c8",
        matchTitle: "double check",
      },
      {
        order: 4,
        label: "Presentase Kejadian Kekosongan Obat Essensial",
        badge: "IMP-RS",
        matchId: "01afa50b-5673-4431-9719-830b37209cc2",
        matchTitle: "kekosongan obat",
      },
    ],
  },
  FATIMAH: {
    unitTitle: "Mutu Ruang Ranap Fatimah (7 Indikator Wajib)",
    items: [
      {
        order: 1,
        label: "Kepatuhan Identifikasi Pasien",
        badge: "INM",
        matchId: "fcd1ccca-aaf7-4e09-b951-92bcd1e28b07",
        matchTitle: "identifikasi pasien",
      },
      {
        order: 2,
        label: "Kepatuhan Upaya Pencegahan Risiko Pasien Jatuh",
        badge: "INM",
        matchId: "2c1d917e-5a3e-484d-a482-32aaa7fd4007",
        matchTitle: "upaya pencegahan risiko",
      },
      {
        order: 3,
        label: "Kepatuhan Jam Visite Dokter",
        badge: "INM",
        matchId: "c5ae8720-5f8b-4f1a-933b-4053a9a81f1b",
        matchTitle: "visite dokter",
      },
      {
        order: 4,
        label: "Kepatuhan Clinical Pathway",
        badge: "INM",
        matchId: "e4f1beae-7903-4be1-97e5-34ef59270131",
        matchTitle: "alur klinis",
      },
      {
        order: 5,
        label: "Pelaksanaan Verifikasi 1x24 Jam Pada Instruksi Melalui Telepon Oleh DPJP",
        badge: "IMP-RS",
        matchId: "307d7c2c-b6ef-4ea4-b09f-6821edd4575b",
        matchTitle: "telepon",
      },
      {
        order: 6,
        label: "Kepatuhan Skrining Disfagia Pada Pasien Stroke",
        badge: "IMP-RS",
        matchId: "e3e86294-6cb4-401f-90b7-12881b050c62",
        matchTitle: "skrining disfagia",
      },
      {
        order: 7,
        label: "Kepatuhan Pelaksanaan Dokumen SBAR Pada Rekam Medis (Ruang Fatimah)",
        badge: "IMP-Unit",
        matchId: "11110009-4a09-4000-9000-000000000009",
        matchTitle: "dokumen sbar pada rekam medis (ruang fatimah)",
      },
    ],
  },
  IBS: {
    unitTitle: "Mutu Ruang IBS / Kamar Operasi (11 Indikator Wajib)",
    items: [
      {
        order: 1,
        label: "Penundaan Operasi Elektif",
        badge: "INM",
        matchId: "cdfd0fd6-c91a-4ed8-a58e-4f506ffaf1f4",
        matchTitle: "penundaan operasi elektif",
      },
      {
        order: 2,
        label: "Kepatuhan Identifikasi Pasien",
        badge: "INM",
        matchId: "fcd1ccca-aaf7-4e09-b951-92bcd1e28b07",
        matchTitle: "identifikasi pasien",
      },
      {
        order: 3,
        label: "Kepatuhan Upaya Pencegahan Risiko Pasien Jatuh",
        badge: "INM",
        matchId: "2c1d917e-5a3e-484d-a482-32aaa7fd4007",
        matchTitle: "upaya pencegahan risiko",
      },
      {
        order: 4,
        label: "Pelaksanaan Verifikasi 1x24 Jam Pada Instruksi Melalui Telepon Oleh DPJP",
        badge: "IMP-RS",
        matchId: "307d7c2c-b6ef-4ea4-b09f-6821edd4575b",
        matchTitle: "telepon",
      },
      {
        order: 5,
        label: "Kepatuhan Pelaksanaan Surgical Safety Checklist (SSC)",
        badge: "IMP-RS",
        matchId: "3aa607da-2720-4142-bbd0-8b9482b78907",
        matchTitle: "surgical safety",
      },
      {
        order: 6,
        label: "Angka Kepatuhan Memasang Stiker Tambahan dan Segitiga Risiko Jatuh",
        badge: "IMP-RS",
        matchId: "3ad3a107-9f9b-4d89-a943-7002793650b4",
        matchTitle: "stiker tambahan",
      },
      {
        order: 7,
        label: "Pembatalan Operasi Elektif",
        badge: "IMP-Unit",
        matchId: "11110007-4a07-4000-9000-000000000007",
        matchTitle: "pembatalan operasi elektif",
      },
      {
        order: 8,
        label: "Angka Keterlambatan Penyediaan Darah Pasien Obstetric dan Neonates (> 60 Menit)",
        badge: "SPM",
        badgeLabel: "Mutu PONEK",
        matchId: "22220001-4b01-4000-9000-000000000001",
        matchTitle: "keterlambatan penyediaan darah",
      },
      {
        order: 9,
        label: "Angka Kejadian Tidak Dilakukannya IMD Pada Bayi Baru Lahir",
        badge: "SPM",
        badgeLabel: "Mutu PONEK",
        matchId: "22220002-4b02-4000-9000-000000000002",
        matchTitle: "imd pada bayi baru lahir",
      },
      {
        order: 10,
        label: "Angka Kematian Ibu",
        badge: "SPM",
        badgeLabel: "Mutu PONEK",
        matchId: "22220003-4b03-4000-9000-000000000003",
        matchTitle: "kematian ibu",
      },
      {
        order: 11,
        label: "Angka Kematian Bayi",
        badge: "SPM",
        badgeLabel: "Mutu PONEK",
        matchId: "22220004-4b04-4000-9000-000000000004",
        matchTitle: "kematian bayi",
      },
    ],
  },
  ICU: {
    unitTitle: "Mutu Ruang ICU (7 Indikator Wajib)",
    items: [
      {
        order: 1,
        label: "Kepatuhan Identifikasi Pasien",
        badge: "INM",
        matchId: "fcd1ccca-aaf7-4e09-b951-92bcd1e28b07",
        matchTitle: "identifikasi pasien",
      },
      {
        order: 2,
        label: "Kepatuhan Upaya Pencegahan Risiko Pasien Jatuh",
        badge: "INM",
        matchId: "2c1d917e-5a3e-484d-a482-32aaa7fd4007",
        matchTitle: "upaya pencegahan risiko",
      },
      {
        order: 3,
        label: "Kepatuhan Jam Visite Dokter",
        badge: "INM",
        matchId: "c5ae8720-5f8b-4f1a-933b-4053a9a81f1b",
        matchTitle: "visite dokter",
      },
      {
        order: 4,
        label: "Kepatuhan Clinical Pathway",
        badge: "INM",
        matchId: "e4f1beae-7903-4be1-97e5-34ef59270131",
        matchTitle: "alur klinis",
      },
      {
        order: 5,
        label: "Pelaksanaan Verifikasi 1x24 Jam Pada Instruksi Melalui Telepon Oleh DPJP",
        badge: "IMP-RS",
        matchId: "307d7c2c-b6ef-4ea4-b09f-6821edd4575b",
        matchTitle: "telepon",
      },
      {
        order: 6,
        label: "Kepatuhan Skrining Disfagia Pada Pasien Stroke",
        badge: "IMP-RS",
        matchId: "e3e86294-6cb4-401f-90b7-12881b050c62",
        matchTitle: "skrining disfagia",
      },
      {
        order: 7,
        label: "Kepatuhan Pengkajian Nyeri (ICU)",
        badge: "IMP-Unit",
        matchId: "11110008-4a08-4000-9000-000000000008",
        matchTitle: "pengkajian nyeri",
      },
    ],
  },
  IGD: {
    unitTitle: "Mutu Ruang IGD (4 Indikator Wajib)",
    items: [
      {
        order: 1,
        label: "Emergency Respon Time < 5 Menit",
        badge: "IMP-Unit",
        matchId: "11110001-4a01-4000-9000-000000000001",
        matchTitle: "emergency respon time",
      },
      {
        order: 2,
        label: "Kepatuhan Identifikasi Pasien",
        badge: "INM",
        matchId: "fcd1ccca-aaf7-4e09-b951-92bcd1e28b07",
        matchTitle: "identifikasi pasien",
      },
      {
        order: 3,
        label: "Kepatuhan Upaya Pencegahan Risiko Pasien Jatuh",
        badge: "INM",
        matchId: "2c1d917e-5a3e-484d-a482-32aaa7fd4007",
        matchTitle: "upaya pencegahan risiko",
      },
      {
        order: 4,
        label: "Kepatuhan Pelaksanaan Dokumen SBAR Pada Rekam Medis (Unit IGD)",
        badge: "IMP-Unit",
        matchId: "11110021-4a21-4000-9000-000000000021",
        matchTitle: "dokumen sbar pada rekam medis (unit igd)",
      },
    ],
  },
  KHADIJAH: {
    unitTitle: "Mutu Ruang Kebidanan / Ranap Khadijah (10 Indikator Wajib)",
    items: [
      {
        order: 1,
        label: "Kepatuhan Identifikasi Pasien",
        badge: "INM",
        matchId: "fcd1ccca-aaf7-4e09-b951-92bcd1e28b07",
        matchTitle: "identifikasi pasien",
      },
      {
        order: 2,
        label: "Kepatuhan Upaya Pencegahan Risiko Pasien Jatuh",
        badge: "INM",
        matchId: "2c1d917e-5a3e-484d-a482-32aaa7fd4007",
        matchTitle: "upaya pencegahan risiko",
      },
      {
        order: 3,
        label: "Kepatuhan Jam Visite Dokter",
        badge: "INM",
        matchId: "c5ae8720-5f8b-4f1a-933b-4053a9a81f1b",
        matchTitle: "visite dokter",
      },
      {
        order: 4,
        label: "Waktu Tanggap Operasi Seksio Sesaria Emergency",
        badge: "INM",
        matchId: "aeae5b11-04c4-4254-8831-1d5c0ed07b1f",
        matchTitle: "sectio caesarea",
      },
      {
        order: 5,
        label: "Angka Persalinan Dengan Komplikasi Tertangani",
        badge: "IMP-Unit",
        matchId: "11110012-4a12-4000-9000-000000000012",
        matchTitle: "persalinan dengan komplikasi",
      },
      {
        order: 6,
        label: "Pelaksanaan Verifikasi 1x24 Jam Pada Instruksi Melalui Telepon Oleh DPJP",
        badge: "IMP-RS",
        matchId: "307d7c2c-b6ef-4ea4-b09f-6821edd4575b",
        matchTitle: "telepon",
      },
      {
        order: 7,
        label: "Angka Keterlambatan Penyediaan Darah Pasien Obstetric dan Neonates (> 60 Menit)",
        badge: "SPM",
        badgeLabel: "Mutu PONEK",
        matchId: "22220001-4b01-4000-9000-000000000001",
        matchTitle: "keterlambatan penyediaan darah",
      },
      {
        order: 8,
        label: "Angka Kejadian Tidak Dilakukannya IMD Pada Bayi Baru Lahir",
        badge: "SPM",
        badgeLabel: "Mutu PONEK",
        matchId: "22220002-4b02-4000-9000-000000000002",
        matchTitle: "imd pada bayi baru lahir",
      },
      {
        order: 9,
        label: "Angka Kematian Ibu",
        badge: "SPM",
        badgeLabel: "Mutu PONEK",
        matchId: "22220003-4b03-4000-9000-000000000003",
        matchTitle: "kematian ibu",
      },
      {
        order: 10,
        label: "Angka Kematian Bayi",
        badge: "SPM",
        badgeLabel: "Mutu PONEK",
        matchId: "22220004-4b04-4000-9000-000000000004",
        matchTitle: "kematian bayi",
      },
    ],
  },
  EMERGENCY_KEBIDANAN: {
    unitTitle: "Mutu Ruang Emergency Kebidanan (7 Indikator Wajib)",
    items: [
      {
        order: 1,
        label: "Waktu Tanggap Operasi Seksio Sesaria Emergency",
        badge: "INM",
        matchId: "aeae5b11-04c4-4254-8831-1d5c0ed07b1f",
        matchTitle: "sectio caesarea",
      },
      {
        order: 2,
        label: "Kepatuhan Identifikasi Pasien",
        badge: "INM",
        matchId: "fcd1ccca-aaf7-4e09-b951-92bcd1e28b07",
        matchTitle: "identifikasi pasien",
      },
      {
        order: 3,
        label: "Kepatuhan Upaya Pencegahan Risiko Pasien Jatuh",
        badge: "INM",
        matchId: "2c1d917e-5a3e-484d-a482-32aaa7fd4007",
        matchTitle: "upaya pencegahan risiko",
      },
      {
        order: 4,
        label: "Angka Keterlambatan Penyediaan Darah Pasien Obstetric dan Neonates (> 60 Menit)",
        badge: "SPM",
        badgeLabel: "Mutu PONEK",
        matchId: "22220001-4b01-4000-9000-000000000001",
        matchTitle: "keterlambatan penyediaan darah",
      },
      {
        order: 5,
        label: "Angka Kejadian Tidak Dilakukannya IMD Pada Bayi Baru Lahir",
        badge: "SPM",
        badgeLabel: "Mutu PONEK",
        matchId: "22220002-4b02-4000-9000-000000000002",
        matchTitle: "imd pada bayi baru lahir",
      },
      {
        order: 6,
        label: "Angka Kematian Ibu",
        badge: "SPM",
        badgeLabel: "Mutu PONEK",
        matchId: "22220003-4b03-4000-9000-000000000003",
        matchTitle: "kematian ibu",
      },
      {
        order: 7,
        label: "Angka Kematian Bayi",
        badge: "SPM",
        badgeLabel: "Mutu PONEK",
        matchId: "22220004-4b04-4000-9000-000000000004",
        matchTitle: "kematian bayi",
      },
    ],
  },
  LABORATORIUM: {
    unitTitle: "Mutu Ruang Laboratorium (2 Indikator Wajib)",
    items: [
      {
        order: 1,
        label: "Kepatuhan Pelaporan Hasil Kritis Laboratorium",
        badge: "INM",
        matchId: "5a8f87e3-151f-4503-bc4a-7a1d005ae218",
        matchTitle: "hasil kritis laboratorium",
      },
      {
        order: 2,
        label: "Persentase Sampel Laboratorium Yang Tidak Diberi Pelabelan",
        badge: "IMP-Unit",
        matchId: "11110005-4a05-4000-9000-000000000005",
        matchTitle: "tidak diberi pelabelan",
      },
    ],
  },
  USMAN: {
    unitTitle: "Mutu Ruang Ranap Usman (7 Indikator Wajib)",
    items: [
      {
        order: 1,
        label: "Kepatuhan Identifikasi Pasien",
        badge: "INM",
        matchId: "fcd1ccca-aaf7-4e09-b951-92bcd1e28b07",
        matchTitle: "identifikasi pasien",
      },
      {
        order: 2,
        label: "Kepatuhan Upaya Pencegahan Risiko Pasien Jatuh",
        badge: "INM",
        matchId: "2c1d917e-5a3e-484d-a482-32aaa7fd4007",
        matchTitle: "upaya pencegahan risiko",
      },
      {
        order: 3,
        label: "Kepatuhan Jam Visite Dokter",
        badge: "INM",
        matchId: "c5ae8720-5f8b-4f1a-933b-4053a9a81f1b",
        matchTitle: "visite dokter",
      },
      {
        order: 4,
        label: "Kepatuhan Clinical Pathway",
        badge: "INM",
        matchId: "e4f1beae-7903-4be1-97e5-34ef59270131",
        matchTitle: "alur klinis",
      },
      {
        order: 5,
        label: "Pelaksanaan Verifikasi 1x24 Jam Pada Instruksi Melalui Telepon Oleh DPJP",
        badge: "IMP-RS",
        matchId: "307d7c2c-b6ef-4ea4-b09f-6821edd4575b",
        matchTitle: "telepon",
      },
      {
        order: 6,
        label: "Kepatuhan Skrining Disfagia Pada Pasien Stroke",
        badge: "IMP-RS",
        matchId: "e3e86294-6cb4-401f-90b7-12881b050c62",
        matchTitle: "skrining disfagia",
      },
      {
        order: 7,
        label: "Kepatuhan Pelaksanaan Dokumen SBAR Pada Rekam Medis (Ruang Usman)",
        badge: "IMP-Unit",
        matchId: "11110013-4a13-4000-9000-000000000013",
        matchTitle: "dokumen sbar pada rekam medis (ruang usman)",
      },
    ],
  },
  KEAMANAN: {
    unitTitle: "Mutu Unit Keamanan (1 Indikator Wajib)",
    items: [
      {
        order: 1,
        label: "Angka Kunjungan Keluarga Diluar Kunjungan Rumah Sakit",
        badge: "IMP-Unit",
        matchId: "11110018-4a18-4000-9000-000000000018",
        matchTitle: "kunjungan keluarga",
      },
    ],
  },
  KEBERSIHAN: {
    unitTitle: "Mutu Kebersihan / Kesling (2 Indikator Wajib)",
    items: [
      {
        order: 1,
        label: "Persentase Sarana Sanitasi (Toilet, Wastafel, Saluran Pembuangan Yang Berfungsi Baik)",
        badge: "IMP-Unit",
        matchId: "11110016-4a16-4000-9000-000000000016",
        matchTitle: "sarana sanitasi",
      },
      {
        order: 2,
        label: "Ketepatan Waktu Pengangkutan Limbah Rumah Sakit",
        badge: "IMP-Unit",
        matchId: "11110019-4a19-4000-9000-000000000019",
        matchTitle: "pengangkutan limbah",
      },
    ],
  },
  LAUNDRY_CSSD: {
    unitTitle: "Mutu Unit Laundry / CSSD (2 Indikator Wajib)",
    items: [
      {
        order: 1,
        label: "Ketepatan Waktu Penyediaan Alat Steril",
        badge: "IMP-Unit",
        matchId: "11110014-4a14-4000-9000-000000000014",
        matchTitle: "penyediaan alat steril",
      },
      {
        order: 2,
        label: "Ketepatan Waktu Penyediaan Linen Untuk Rawat Inap",
        badge: "IMP-Unit",
        matchId: "11110020-4a20-4000-9000-000000000020",
        matchTitle: "penyediaan linen",
      },
    ],
  },
  PONEK: {
    unitTitle: "Mutu Tim / Ruang PONEK (5 Indikator Wajib)",
    items: [
      {
        order: 1,
        label: "Waktu Tanggap Operasi Seksio Sesaria Emergency",
        badge: "INM",
        matchId: "aeae5b11-04c4-4254-8831-1d5c0ed07b1f",
        matchTitle: "sectio caesarea",
      },
      {
        order: 2,
        label: "Angka Keterlambatan Penyediaan Darah Pasien Obstetric dan Neonates (> 60 Menit)",
        badge: "SPM",
        badgeLabel: "Mutu PONEK",
        matchId: "22220001-4b01-4000-9000-000000000001",
        matchTitle: "keterlambatan penyediaan darah",
      },
      {
        order: 3,
        label: "Angka Kejadian Tidak Dilakukannya IMD Pada Bayi Baru Lahir",
        badge: "SPM",
        badgeLabel: "Mutu PONEK",
        matchId: "22220002-4b02-4000-9000-000000000002",
        matchTitle: "imd pada bayi baru lahir",
      },
      {
        order: 4,
        label: "Angka Kematian Ibu",
        badge: "SPM",
        badgeLabel: "Mutu PONEK",
        matchId: "22220003-4b03-4000-9000-000000000003",
        matchTitle: "kematian ibu",
      },
      {
        order: 5,
        label: "Angka Kematian Bayi",
        badge: "SPM",
        badgeLabel: "Mutu PONEK",
        matchId: "22220004-4b04-4000-9000-000000000004",
        matchTitle: "kematian bayi",
      },
    ],
  },
  IPSRS: {
    unitTitle: "Mutu Ruang IPSRS (1 Indikator Wajib)",
    items: [
      {
        order: 1,
        label: "Ketersediaan Air Bersih Dalam 24 Jam",
        badge: "IMP-RS",
        matchId: "f5d46923-180f-4100-a6ba-66dcaf7e8f9f",
        matchTitle: "air bersih dalam 24 jam",
      },
    ],
  },
  REKAM_MEDIS: {
    unitTitle: "Mutu Ruang Rekam Medis (1 Indikator Wajib)",
    items: [
      {
        order: 1,
        label: "Kelengkapan Pengisian Rekam Medik Elektronik 24 Jam Setelah Selesai Pelayanan",
        badge: "IMP-Unit",
        matchId: "11110004-4a04-4000-9000-000000000004",
        matchTitle: "rekam medik elektronik 24 jam",
      },
    ],
  },
  RAWAT_JALAN: {
    unitTitle: "Mutu Unit Rawat Jalan (1 Indikator Wajib)",
    items: [
      {
        order: 1,
        label: "Waktu Tunggu Rawat Jalan < 60 Menit",
        badge: "INM",
        matchId: "8310950c-90e9-4361-965b-46a47a70c8fd",
        matchTitle: "waktu tunggu rawat jalan",
      },
    ],
  },
  RADIOLOGI: {
    unitTitle: "Mutu Ruang Radiologi (4 Indikator Wajib)",
    items: [
      {
        order: 1,
        label: "Waktu Tunggu Hasil Pelayanan Thorax Photo ≤ 180 Menit",
        badge: "IMP-Unit",
        matchId: "11110006-4a06-4000-9000-000000000006",
        matchTitle: "waktu tunggu hasil pelayanan thorax",
      },
      {
        order: 2,
        label: "Pelaksana Ekspertisi Hasil Pemeriksaan Radiologi",
        badge: "SPM",
        matchId: "22220039-4b27-4000-9000-000000000039",
        matchTitle: "pelaksana ekspertisi hasil pemeriksaan",
      },
      {
        order: 3,
        label: "Kejadian Kegagalan Pelayanan Rontgen (Reject Analysis)",
        badge: "SPM",
        matchId: "22220040-4b28-4000-9000-000000000040",
        matchTitle: "kegagalan pelayanan rontgen",
      },
      {
        order: 4,
        label: "Kepuasan Pelanggan Radiologi",
        badge: "SPM",
        matchId: "22220041-4b29-4000-9000-000000000041",
        matchTitle: "kepuasan pelanggan radiologi",
      },
    ],
  },
  PROGNAS: {
    unitTitle: "Mutu Unit Prognas (5 Indikator Wajib)",
    items: [
      {
        order: 1,
        label: "Pelayanan Orang Dengan Resiko Terinfeksi HIV/AIDS",
        badge: "IMP-Unit",
        matchId: "11110022-4a22-4000-9000-000000000022",
        matchTitle: "resiko terinfeksi hiv/aids",
      },
      {
        order: 2,
        label: "Angka Kematian Bayi",
        badge: "SPM",
        matchId: "22220004-4b04-4000-9000-000000000004",
        matchTitle: "angka kematian bayi",
      },
      {
        order: 3,
        label: "Angka Kematian Ibu",
        badge: "SPM",
        matchId: "22220003-4b03-4000-9000-000000000003",
        matchTitle: "angka kematian ibu",
      },
      {
        order: 4,
        label: "Angka Kejadian Inisiasi Menyusu Dini (IMD)",
        badge: "SPM",
        matchId: "22220002-4b02-4000-9000-000000000002",
        matchTitle: "inisiasi menyusu dini",
      },
      {
        order: 5,
        label: "Angka Kejadian Rooming In",
        badge: "IMP-Unit",
        matchId: "11110023-4a23-4000-9000-000000000023",
        matchTitle: "rooming in",
      },
    ],
  },
};

interface YaTidakTableConfig {
  key:
    | "skrining_jatuh_anak"
    | "skrining_disfagia"
    | "asesmen_awal_medis_24jam"
    | "reasesmen_nyeri"
    | "fornas_pasien"
    | "stiker_segitiga";
  tableTitle: string;
  subtitle: string;
  yesHeader: string;
  noHeader: string;
}

interface KematianTableConfig {
  key: "kematian_ibu" | "kematian_bayi";
  tableTitle: string;
  subtitle: string;
  populationLabel: string;
  nilLabel: string;
}

// Validation schema for general inputs
const schema = z
  .object({
    unit: z.string().min(1, "Unit harus dipilih"),
    sub_unit: z.string().optional(),
    tanggal: z.string().min(1, "Tanggal harus diisi"),
    kategori: z.string().min(1, "Kategori harus dipilih"),
    indikator_id: z.string().optional(),
    numerator_val: z.number().min(0, "Nilai minimal 0").optional(),
    denominator_val: z.number().min(1, "Nilai minimal 1").optional(),
    kpc: z.number().min(0).optional(),
    knc: z.number().min(0).optional(),
    ktc: z.number().min(0).optional(),
    ktd: z.number().min(0).optional(),
    sentinel: z.number().min(0).optional(),
    keterangan: z.string().optional(),
    bukti_file_name: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.kategori !== "IKP") {
      if (!data.indikator_id) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Pilih Indikator terlebih dahulu",
          path: ["indikator_id"],
        });
      }
    }
  });

const momentHeaders = [
  { code: "M1", title: "Gelang Identitas", label: "Sebelum pemasangan gelang identitas pasien" },
  { code: "M2", title: "Pemberian Obat", label: "Sebelum pemberian obat" },
  { code: "M3", title: "Darah/Produk", label: "Sebelum pemberian darah / produk darah" },
  { code: "M4", title: "Tindakan Medis", label: "Sebelum tindakan" },
  { code: "M5", title: "Cairan Infus", label: "Sebelum pemberian cairan intravena" },
  { code: "M6", title: "Darah/Spesimen", label: "Sebelum pengambilan darah / spesimen" },
  { code: "M7", title: "Pemberian Diet", label: "Sebelum pemberian diet" },
  { code: "M8", title: "Prosedur Dx/Tx", label: "Sebelum melakukan prosedur diagnostik dan terapi" },
  { code: "M9", title: "Periksa Pasien", label: "Sebelum pemeriksaan pasien" },
];

const TriStateSelector = ({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (val: string | null) => void;
}) => {
  return (
    <div className="flex rounded-md overflow-hidden border border-slate-200 bg-white shadow-2xs h-[20px] w-full">
      <button
        type="button"
        onClick={() => onChange(value === "Ya" ? null : "Ya")}
        className={`flex-1 flex items-center justify-center font-black text-[8px] tracking-tighter transition-all ${
          value === "Ya"
            ? "bg-emerald-600 text-white"
            : "text-slate-600 hover:bg-slate-55 bg-white"
        }`}
        title="Ya"
      >
        YA
      </button>
      <button
        type="button"
        onClick={() => onChange(value === "Tidak" ? null : "Tidak")}
        className={`flex-1 flex items-center justify-center font-black text-[8px] tracking-tighter border-x border-slate-150 transition-all ${
          value === "Tidak"
            ? "bg-rose-500 text-white"
            : "text-slate-500 hover:bg-slate-55 bg-white"
        }`}
        title="Tidak"
      >
        TDK
      </button>
      <button
        type="button"
        onClick={() => onChange(value === "N/A" ? null : "N/A")}
        className={`flex-1 flex items-center justify-center font-black text-[8px] tracking-tighter transition-all ${
          value === "N/A"
            ? "bg-slate-400 text-white"
            : "text-slate-500 hover:bg-slate-55 bg-white"
        }`}
        title="Not Applicable"
      >
        N/A
      </button>
    </div>
  );
};

type FormValues = z.infer<typeof schema>;

export default function InputData() {
  const {
    units,
    addUnit,
    updateUnit,
    deleteUnit,
    indicatorProfiles,
    dataMutuList,
    addDataMutu,
  } = useStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  // Searchable Unit parameters
  const [unitSearch, setUnitSearch] = useState("");
  const [showUnitDropdown, setShowUnitDropdown] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [tempUnitName, setTempUnitName] = useState("");
  const [selectedSubUnit, setSelectedSubUnit] = useState("");
  const [aisyahSubMode, setAisyahSubMode] = useState<"ANAK" | "BEDAH" | "">("");
  const [dbSavedEntries, setDbSavedEntries] = useState<
    Array<{ unit_id?: string; category_id?: string; indicator_id?: string; input_date?: string }>
  >([]);

  // Room modal form active status (Admin features)
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [modalUnitId, setModalUnitId] = useState<string | null>(null);
  const [roomNameInput, setRoomNameInput] = useState("");
  const [roomCategoryInput, setRoomCategoryInput] = useState("Rawat Inap");
  const [roomStatusInput, setRoomStatusInput] = useState<"Aktif" | "Nonaktif">(
    "Aktif",
  );
  // Delete confirmation modal state for Kepatuhan Identifikasi Pasien
  const [deleteIdentifikasiId, setDeleteIdentifikasiId] = useState<string | null>(null);

  const unitDropdownRef = useRef<HTMLDivElement>(null);
  const checklistRef = useRef<HTMLDivElement>(null);
  const formSectionRef = useRef<HTMLDivElement>(null);

  // Fetch existing saved inputs summary for Unit checklist progress status
  useEffect(() => {
    let isMounted = true;
    const fetchSavedInputs = async () => {
      try {
        const { data } = await supabase
          .from("indicator_inputs")
          .select("id, unit_id, category_id, indicator_id, input_date");
        if (data && isMounted) {
          setDbSavedEntries(data);
        }
      } catch (err) {
        console.warn("Failed fetching indicator_inputs summary:", err);
      }
    };
    fetchSavedInputs();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch newest units from Supabase if active
  useEffect(() => {
    let isMounted = true;
    const fetchSupabaseUnits = async () => {
      try {
        const { data, error } = await supabase.from("units").select("*");
        if (data && data.length > 0 && isMounted) {
          const uniqueDbUnits = new Map<string, any>();
          data.forEach((dbUnit: any) => {
            const key = dbUnit.id || (dbUnit.name || "").trim().toLowerCase();
            if (key && !uniqueDbUnits.has(key)) {
              uniqueDbUnits.set(key, dbUnit);
            }
          });

          uniqueDbUnits.forEach((dbUnit) => {
            addUnit({
              id: String(dbUnit.id || `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`),
              name: dbUnit.name,
              category: dbUnit.category || "Umum",
              status: dbUnit.status === "Nonaktif" ? "Nonaktif" : "Aktif",
            });
          });
        }
      } catch (err) {
        console.warn(
          "Supabase units select skipped, falling back to local Zustand schema",
          err,
        );
      }
    };
    fetchSupabaseUnits();
    return () => {
      isMounted = false;
    };
  }, [addUnit]);

  // Keyboard navigation click outside handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        unitDropdownRef.current &&
        !unitDropdownRef.current.contains(event.target as Node)
      ) {
        setShowUnitDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Form registration
  const {
    register,
    handleSubmit,
    watch,
    setValue: setFormValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      unit: "",
      sub_unit: "",
      tanggal: new Date().toISOString().split("T")[0],
      kategori: "INM",
      indikator_id: "",
      numerator_val: undefined,
      denominator_val: undefined,
      kpc: 0,
      knc: 0,
      ktc: 0,
      ktd: 0,
      sentinel: 0,
      keterangan: "",
      bukti_file_name: "",
    },
  });

  /* eslint-disable react-hooks/incompatible-library */
  const watchKategori = watch("kategori");
  const watchIndikatorId = watch("indikator_id");
  const watchTanggal = watch("tanggal");
  const watchNumerator = watch("numerator_val");
  const watchDenominator = watch("denominator_val");
  /* eslint-enable react-hooks/incompatible-library */

  // Filter indicator profiles dynamically from state/database
  const filteredIndikators = useMemo(() => {
    let filtered = indicatorProfiles.filter(
      (i) => i.category === watchKategori,
    );
    filtered.sort((a, b) => {
      const aIsKKT = (a.indicator_title || "")
        .toLowerCase()
        .includes("kebersihan tangan");
      const bIsKKT = (b.indicator_title || "")
        .toLowerCase()
        .includes("kebersihan tangan");
      if (aIsKKT && !bIsKKT) return -1;
      if (!aIsKKT && bIsKKT) return 1;
      return 0;
    });
    return filtered;
  }, [indicatorProfiles, watchKategori]);

  const selectedIndikatorProfile = useMemo(() => {
    return indicatorProfiles.find((i) => i.id === watchIndikatorId);
  }, [indicatorProfiles, watchIndikatorId]);

  const formattedBulanLabel = useMemo(() => {
    const base = watchTanggal ? new Date(`${watchTanggal}T00:00:00`) : new Date();
    if (isNaN(base.getTime())) return "-";
    return base.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
  }, [watchTanggal]);

  const bulanOnlyLabel = useMemo(() => {
    const base = watchTanggal ? new Date(`${watchTanggal}T00:00:00`) : new Date();
    if (isNaN(base.getTime())) return "-";
    return base.toLocaleDateString("id-ID", { month: "long" });
  }, [watchTanggal]);

  const tahunOnlyLabel = useMemo(() => {
    const base = watchTanggal ? new Date(`${watchTanggal}T00:00:00`) : new Date();
    if (isNaN(base.getTime())) return String(new Date().getFullYear());
    return String(base.getFullYear());
  }, [watchTanggal]);

  const activeBlueprintKey = useMemo<GuidedUnitKey | null>(() => {
    const uName = (selectedUnit?.name || "").trim().toLowerCase();
    if (uName === "ranap aisyah anak") return "ANAK";
    if (uName === "ranap aisyah bedah") return "BEDAH";
    if (uName === "farmasi" || uName === "instalasi farmasi") return "FARMASI";
    if (uName === "ranap fatimah" || uName === "fatimah") return "FATIMAH";
    if (uName === "ibs") return "IBS";
    if (uName === "icu") return "ICU";
    if (uName === "igd" || uName === "ugd") return "IGD";
    if (
      uName === "ranap khadijah" ||
      uName === "khadijah" ||
      uName === "kebidanan" ||
      uName === "ruang kebidanan"
    ) {
      return "KHADIJAH";
    }
    if (
      uName === "emergency kebidanan" ||
      uName === "ruang emergency kebidanan" ||
      uName === "igd kebidanan"
    ) {
      return "EMERGENCY_KEBIDANAN";
    }
    if (uName === "laboratorium" || uName === "lab") return "LABORATORIUM";
    if (uName === "ranap usman" || uName === "usman") return "USMAN";
    if (uName === "keamanan" || uName === "security") return "KEAMANAN";
    if (
      uName === "kebersihan / kesling" ||
      uName === "kebersihan/kesling" ||
      uName === "kebersihan" ||
      uName === "kesling" ||
      uName === "sanitasi"
    ) {
      return "KEBERSIHAN";
    }
    if (
      uName === "laundry / cssd" ||
      uName === "laundry/cssd" ||
      uName === "cssd/laundry" ||
      uName === "cssd" ||
      uName === "laundry"
    ) {
      return "LAUNDRY_CSSD";
    }
    if (uName === "ponek") return "PONEK";
    if (uName === "ipsrs") return "IPSRS";
    if (
      uName === "rekam medis" ||
      uName === "instalasi rekam medis" ||
      uName === "unit rekam medis"
    ) {
      return "REKAM_MEDIS";
    }
    if (
      uName === "rawat jalan" ||
      uName === "rajal" ||
      uName === "poliklinik"
    ) {
      return "RAWAT_JALAN";
    }
    if (
      uName === "radiologi" ||
      uName === "ruang radiologi" ||
      uName === "instalasi radiologi"
    ) {
      return "RADIOLOGI";
    }
    if (
      uName === "prognas" ||
      uName === "unit prognas" ||
      uName === "tim prognas"
    ) {
      return "PROGNAS";
    }
    if (uName === "ranap aisyah" && (aisyahSubMode === "ANAK" || aisyahSubMode === "BEDAH")) {
      return aisyahSubMode;
    }
    return null;
  }, [selectedUnit, aisyahSubMode]);

  const activeUnitBlueprint = activeBlueprintKey
    ? UNIT_MUTU_BLUEPRINTS[activeBlueprintKey]
    : null;

  const isGuidedUnit = !!activeBlueprintKey;

  const resolveBlueprintProfile = (item: UnitMutuItem): IndicatorProfile | undefined => {
    return (
      indicatorProfiles.find((p) => p.id === item.matchId) ||
      indicatorProfiles.find((p) =>
        (p.indicator_title || "").toLowerCase().includes(item.matchTitle),
      )
    );
  };

  const guidedCompletionSet = useMemo(() => {
    const completedIds = new Set<string>();
    if (!selectedUnit) return completedIds;
    const uName = selectedUnit.name.trim().toLowerCase();
    const monthPrefix = (watchTanggal || new Date().toISOString().slice(0, 10)).slice(0, 7);

    dataMutuList.forEach((entry) => {
      const entryUnit = (entry.unit || "").trim().toLowerCase();
      const entryDate = entry.tanggal || "";
      if (
        (entryUnit === uName || entryUnit.startsWith(`${uName} -`)) &&
        entryDate.startsWith(monthPrefix) &&
        entry.indikator_id
      ) {
        completedIds.add(entry.indikator_id);
      }
    });

    dbSavedEntries.forEach((entry) => {
      const entryUnit = (entry.unit_id || "").trim().toLowerCase();
      const entryDate = entry.input_date || "";
      if (
        (entryUnit === uName || entryUnit.startsWith(`${uName} -`)) &&
        entryDate.startsWith(monthPrefix) &&
        entry.indicator_id
      ) {
        completedIds.add(entry.indicator_id);
      }
    });

    return completedIds;
  }, [selectedUnit, watchTanggal, dataMutuList, dbSavedEntries]);

  const indicatorTitleLower = (selectedIndikatorProfile?.indicator_title || "").toLowerCase();

  const isVisiteDokter =
    watchIndikatorId === "7" ||
    indicatorTitleLower.includes("visite");
  const isRisikoJatuh =
    watchIndikatorId === "11" ||
    indicatorTitleLower.includes("upaya pencegahan risiko");
  const isIdentifikasiPasien =
    watchIndikatorId === "3" ||
    indicatorTitleLower.includes("identifikasi pasien");
  const isWaktuTunggu =
    watchIndikatorId === "5" ||
    indicatorTitleLower.includes("waktu tunggu rawat jalan");
  const isWaktuTungguRacikan =
    watchIndikatorId === "11110003-4a03-4000-9000-000000000003" ||
    indicatorTitleLower.includes("obat racikan");
  const isHighAlertDoubleCheck =
    watchIndikatorId === "b977461c-a791-46ff-a9dd-62d0427aa0c8" ||
    (indicatorTitleLower.includes("double check") &&
      (indicatorTitleLower.includes("high allert") ||
        indicatorTitleLower.includes("high alert")));
  const isKekosonganObat =
    watchIndikatorId === "01afa50b-5673-4431-9719-830b37209cc2" ||
    indicatorTitleLower.includes("kekosongan obat");
  const isClinicalPathway =
    watchIndikatorId === "e4f1beae-7903-4be1-97e5-34ef59270131" ||
    indicatorTitleLower.includes("alur klinis") ||
    indicatorTitleLower.includes("clinical pathway");
  const isVerifikasiTelepon =
    watchIndikatorId === "307d7c2c-b6ef-4ea4-b09f-6821edd4575b" ||
    (indicatorTitleLower.includes("telepon") &&
      (indicatorTitleLower.includes("verifikasi") ||
        indicatorTitleLower.includes("verivikasi")));
  const isSBAR =
    watchIndikatorId === "11110009-4a09-4000-9000-000000000009" ||
    watchIndikatorId === "11110013-4a13-4000-9000-000000000013" ||
    watchIndikatorId === "11110021-4a21-4000-9000-000000000021" ||
    indicatorTitleLower.includes("dokumen sbar");
  const isPenundaanOperasi =
    watchIndikatorId === "cdfd0fd6-c91a-4ed8-a58e-4f506ffaf1f4" ||
    indicatorTitleLower.includes("penundaan operasi elektif");
  const isSurgicalSafety =
    watchIndikatorId === "3aa607da-2720-4142-bbd0-8b9482b78907" ||
    indicatorTitleLower.includes("surgical safety");
  const isPembatalanOperasi =
    watchIndikatorId === "11110007-4a07-4000-9000-000000000007" ||
    indicatorTitleLower.includes("pembatalan operasi elektif");
  const isPenyediaanDarah =
    watchIndikatorId === "22220001-4b01-4000-9000-000000000001" ||
    indicatorTitleLower.includes("keterlambatan penyediaan darah");
  const isPrognasUnit = (selectedUnit?.name || "")
    .trim()
    .toLowerCase()
    .includes("prognas");

  const prognasIndicatorType: PrognasIndicatorType | null = useMemo(() => {
    if (!isPrognasUnit || !watchIndikatorId) return null;
    if (
      watchIndikatorId === "11110022-4a22-4000-9000-000000000022" ||
      indicatorTitleLower.includes("hiv/aids")
    ) {
      return "hiv_aids";
    }
    if (
      watchIndikatorId === "22220004-4b04-4000-9000-000000000004" ||
      indicatorTitleLower.includes("kematian bayi")
    ) {
      return "kematian_bayi";
    }
    if (
      watchIndikatorId === "22220003-4b03-4000-9000-000000000003" ||
      indicatorTitleLower.includes("kematian ibu")
    ) {
      return "kematian_ibu";
    }
    if (
      watchIndikatorId === "22220002-4b02-4000-9000-000000000002" ||
      indicatorTitleLower.includes("imd") ||
      indicatorTitleLower.includes("inisiasi menyusu dini")
    ) {
      return "imd";
    }
    if (
      watchIndikatorId === "11110023-4a23-4000-9000-000000000023" ||
      indicatorTitleLower.includes("rooming in")
    ) {
      return "rooming_in";
    }
    return null;
  }, [isPrognasUnit, watchIndikatorId, indicatorTitleLower]);

  const radiologiMode:
    | "thorax_wt"
    | "reject_analisis"
    | "tindakan_ekspertisi"
    | null = useMemo(() => {
    if (!watchIndikatorId) return null;
    if (
      watchIndikatorId === "11110006-4a06-4000-9000-000000000006" ||
      indicatorTitleLower.includes("thorax")
    ) {
      return "thorax_wt";
    }
    if (
      watchIndikatorId === "22220040-4b28-4000-9000-000000000040" ||
      indicatorTitleLower.includes("kegagalan pelayanan rontgen") ||
      indicatorTitleLower.includes("reject analisis") ||
      indicatorTitleLower.includes("reject analysis")
    ) {
      return "reject_analisis";
    }
    if (
      watchIndikatorId === "22220039-4b27-4000-9000-000000000039" ||
      (indicatorTitleLower.includes("pelaksana ekspertisi") &&
        !indicatorTitleLower.includes("laboratorium"))
    ) {
      return "tindakan_ekspertisi";
    }
    return null;
  }, [watchIndikatorId, indicatorTitleLower]);

  const isImdBayi =
    !prognasIndicatorType &&
    (watchIndikatorId === "22220002-4b02-4000-9000-000000000002" ||
      indicatorTitleLower.includes("imd pada bayi baru lahir"));
  const isPengkajianNyeriIcu =
    watchIndikatorId === "11110008-4a08-4000-9000-000000000008" ||
    indicatorTitleLower.includes("pengkajian nyeri");
  const isEmergencyResponTime =
    watchIndikatorId === "11110001-4a01-4000-9000-000000000001" ||
    indicatorTitleLower.includes("emergency respon time");
  const isScEmergency =
    watchIndikatorId === "aeae5b11-04c4-4254-8831-1d5c0ed07b1f" ||
    indicatorTitleLower.includes("sectio caesarea") ||
    indicatorTitleLower.includes("seksio sesaria");
  const isKomplikasiPersalinan =
    watchIndikatorId === "11110012-4a12-4000-9000-000000000012" ||
    indicatorTitleLower.includes("persalinan dengan komplikasi");
  const isHasilKritisLab =
    watchIndikatorId === "5a8f87e3-151f-4503-bc4a-7a1d005ae218" ||
    indicatorTitleLower.includes("hasil kritis laboratorium");
  const isSampelLabTanpaLabel =
    watchIndikatorId === "11110005-4a05-4000-9000-000000000005" ||
    indicatorTitleLower.includes("tidak diberi pelabelan");
  const isKunjunganKeluarga =
    watchIndikatorId === "11110018-4a18-4000-9000-000000000018" ||
    indicatorTitleLower.includes("kunjungan keluarga");
  const isSaranaSanitasi =
    watchIndikatorId === "11110016-4a16-4000-9000-000000000016" ||
    indicatorTitleLower.includes("sarana sanitasi");
  const isPengangkutanLimbah =
    watchIndikatorId === "11110019-4a19-4000-9000-000000000019" ||
    indicatorTitleLower.includes("pengangkutan limbah");
  const isAlatSteril =
    watchIndikatorId === "11110014-4a14-4000-9000-000000000014" ||
    indicatorTitleLower.includes("penyediaan alat steril");
  const isPenyediaanLinen =
    watchIndikatorId === "11110020-4a20-4000-9000-000000000020" ||
    indicatorTitleLower.includes("penyediaan linen");
  const isAirBersih24Jam =
    watchIndikatorId === "f5d46923-180f-4100-a6ba-66dcaf7e8f9f" ||
    indicatorTitleLower.includes("air bersih dalam 24 jam");
  const isRekamMedis =
    watchIndikatorId === "11110004-4a04-4000-9000-000000000004" ||
    indicatorTitleLower.includes("rekam medik elektronik 24 jam") ||
    indicatorTitleLower.includes("kelengkapan pengisian rekam med");

  const kematianConfig: KematianTableConfig | null = useMemo(() => {
    if (prognasIndicatorType) return null;
    if (
      watchIndikatorId === "22220003-4b03-4000-9000-000000000003" ||
      indicatorTitleLower.includes("kematian ibu")
    ) {
      return {
        key: "kematian_ibu",
        tableTitle: "Formulir Angka Kematian Ibu (PONEK)",
        subtitle:
          "Pencatatan kejadian kematian ibu (atau klik Nihil 0 Kematian serta isi Total Seluruh Pasien Ibu pada bulan berjalan).",
        populationLabel: "Total Seluruh Pasien Ibu",
        nilLabel: "Nihil (0 Kematian Ibu)",
      };
    }
    if (
      watchIndikatorId === "22220004-4b04-4000-9000-000000000004" ||
      indicatorTitleLower.includes("kematian bayi")
    ) {
      return {
        key: "kematian_bayi",
        tableTitle: "Formulir Angka Kematian Bayi (PONEK)",
        subtitle:
          "Pencatatan kejadian kematian bayi < 12 bulan (atau klik Nihil 0 Kematian serta isi Total Bayi Yang Dirawat).",
        populationLabel: "Total Bayi Yang Dirawat",
        nilLabel: "Nihil (0 Kematian Bayi)",
      };
    }
    return null;
  }, [prognasIndicatorType, watchIndikatorId, indicatorTitleLower]);

  const yaTidakConfig: YaTidakTableConfig | null = useMemo(() => {
    if (
      watchIndikatorId === "9871c4ca-55dc-45e4-acc8-a37dce8c2a67" ||
      indicatorTitleLower.includes("formularium nasional")
    ) {
      return {
        key: "fornas_pasien",
        tableTitle: "Formulir Kepatuhan Penggunaan Formularium Nasional",
        subtitle: "Observasi kesesuaian peresepan obat pasien terhadap Formularium Nasional (FORNAS)",
        yesHeader: "Obat Sesuai Fornas (Ya)",
        noHeader: "Obat Sesuai Fornas (Tidak)",
      };
    }
    if (
      watchIndikatorId === "3ad3a107-9f9b-4d89-a943-7002793650b4" ||
      indicatorTitleLower.includes("stiker tambahan")
    ) {
      return {
        key: "stiker_segitiga",
        tableTitle: "Kepatuhan Memasang Stiker Tambahan & Segitiga Risiko Jatuh",
        subtitle: "Observasi kepatuhan pemasangan stiker tambahan dan segitiga risiko jatuh pada pasien risiko jatuh",
        yesHeader: "Terpasang Stiker & Segitiga (Ya)",
        noHeader: "Terpasang Stiker & Segitiga (Tidak)",
      };
    }
    if (
      watchIndikatorId === "11110010-4a10-4000-9000-000000000010" ||
      indicatorTitleLower.includes("skrining risiko jatuh pasien anak")
    ) {
      return {
        key: "skrining_jatuh_anak",
        tableTitle: "Form Input Kepatuhan Skrining Risiko Jatuh Pasien Anak",
        subtitle: "Observasi kepatuhan pelaksanaan skrining risiko jatuh pada pasien anak",
        yesHeader: "Ya (Di Skrining)",
        noHeader: "Tidak (Tidak Di Skrining)",
      };
    }
    if (
      watchIndikatorId === "e3e86294-6cb4-401f-90b7-12881b050c62" ||
      indicatorTitleLower.includes("skrining disfagia")
    ) {
      return {
        key: "skrining_disfagia",
        tableTitle: "Form Input Kepatuhan Skrining Disfagia Pada Pasien Stroke",
        subtitle: "Observasi kepatuhan pelaksanaan skrining disfagia pada pasien stroke",
        yesHeader: "Dilakukan Skrining Disfagia (Ya)",
        noHeader: "Dilakukan Skrining Disfagia (Tidak)",
      };
    }
    if (
      watchIndikatorId === "11110017-4a17-4000-9000-000000000017" ||
      indicatorTitleLower.includes("asesmen awal medis") ||
      indicatorTitleLower.includes("assesmen awal medis")
    ) {
      return {
        key: "asesmen_awal_medis_24jam",
        tableTitle: "Form Input Kelengkapan Asesmen Awal Medis Dalam Waktu 24 Jam",
        subtitle: "Observasi kelengkapan asesmen awal medis dalam waktu ≤ 24 jam pada pasien rawat inap",
        yesHeader: "Kelengkapan Asesmen Awal Medis 24 Jam (Ya)",
        noHeader: "Kelengkapan Asesmen Awal Medis 24 Jam (Tidak)",
      };
    }
    if (
      watchIndikatorId === "11110011-4a11-4000-9000-000000000011" ||
      indicatorTitleLower.includes("reasesmen nyeri")
    ) {
      return {
        key: "reasesmen_nyeri",
        tableTitle: "Form Input Kepatuhan Reasesmen Nyeri",
        subtitle: "Observasi kepatuhan pelaksanaan reasesmen nyeri pasien rawat inap",
        yesHeader: "Reasesmen Nyeri (Ya)",
        noHeader: "Reasesmen Nyeri (Tidak)",
      };
    }
    return null;
  }, [watchIndikatorId, indicatorTitleLower]);

  // States for dynamic custom subgrids/checklists inside section 7
  const [visiteGrid, setVisiteGrid] = useState<VisiteData[]>([]);
  const [jatuhGrid, setJatuhGrid] = useState<JatuhData[]>([]);
  const [jatuhSearchTerm, setJatuhSearchTerm] = useState("");
  const [jatuhFilterDate, setJatuhFilterDate] = useState("");
  const [waktuTungguGrid, setWaktuTungguGrid] = useState<WaktuTungguData[]>([]);
  const [racikanGrid, setRacikanGrid] = useState<RacikanWaktuTungguData[]>([]);
  const [highAlertGrid, setHighAlertGrid] = useState<HighAlertDoubleCheckData[]>([]);
  const [kekosonganObatGrid, setKekosonganObatGrid] = useState<KekosonganObatData[]>([]);
  const [sbarGrid, setSbarGrid] = useState<SBARData[]>([]);
  const [penundaanGrid, setPenundaanGrid] = useState<PenundaanOperasiData[]>([]);
  const [sscGrid, setSscGrid] = useState<SurgicalSafetyData[]>([]);
  const [pembatalanGrid, setPembatalanGrid] = useState<PembatalanOperasiData[]>([]);
  const [penyediaanDarahGrid, setPenyediaanDarahGrid] = useState<PenyediaanDarahData[]>([]);
  const [imdGrid, setImdGrid] = useState<ImdBayiData[]>([]);
  const [kematianGrid, setKematianGrid] = useState<KematianIbuBayiData[]>([]);
  const [pengkajianNyeriGrid, setPengkajianNyeriGrid] = useState<PengkajianNyeriData[]>([]);
  const [emergencyResponGrid, setEmergencyResponGrid] = useState<EmergencyResponTimeData[]>([]);
  const [showErtPasteBox, setShowErtPasteBox] = useState(false);
  const [ertPasteText, setErtPasteText] = useState("");
  const [scEmergencyGrid, setScEmergencyGrid] = useState<ScEmergencyData[]>([]);
  const [komplikasiGrid, setKomplikasiGrid] = useState<KomplikasiPersalinanData[]>([]);
  const [hasilKritisLabGrid, setHasilKritisLabGrid] = useState<HasilKritisLabData[]>([]);
  const [sampelLabGrid, setSampelLabGrid] = useState<SampelLabPelabelanData[]>([]);
  const [sampelLabTotalDenom, setSampelLabTotalDenom] = useState<number | "">("");
  const [kunjunganGrid, setKunjunganGrid] = useState<KunjunganKeluargaData[]>([]);
  const [kunjunganTotalDenom, setKunjunganTotalDenom] = useState<number | "">("");
  const [sanitasiGrid, setSanitasiGrid] = useState<SaranaSanitasiData[]>([]);
  const [limbahGrid, setLimbahGrid] = useState<PengangkutanLimbahData[]>([]);
  const [alatSterilGrid, setAlatSterilGrid] = useState<PenyediaanAlatSterilData[]>([]);
  const [linenGrid, setLinenGrid] = useState<PenyediaanLinenData[]>([]);
  const [airBersihGrid, setAirBersihGrid] = useState<KetersediaanAirData[]>([]);
  const [activeRajalSheet, setActiveRajalSheet] = useState<RajalSheetPoli>("Penyakit Dalam");
  const [rekamMedisBundle, setRekamMedisBundle] = useState<RekamMedisAuditBundle>(() =>
    createEmptyRekamMedisBundle(new Date().toISOString().split("T")[0]),
  );
  const [radiologiBundle, setRadiologiBundle] = useState<RadiologiAuditBundle>(() =>
    createEmptyRadiologiBundle(new Date().toISOString().split("T")[0]),
  );
  const [prognasData, setPrognasData] = useState<PrognasMutuData>(() =>
    createEmptyPrognasData("hiv_aids", new Date().toISOString().split("T")[0]),
  );
  const [clinicalPathwayGrid, setClinicalPathwayGrid] = useState<ClinicalPathwayData[]>([]);
  const [verifikasiTeleponGrid, setVerifikasiTeleponGrid] = useState<VerifikasiTeleponData[]>([]);
  const [yaTidakGrid, setYaTidakGrid] = useState<YaTidakPasienData[]>([]);
  const [identifikasiGrid, setIdentifikasiGrid] = useState<IdentifikasiData[]>([
    {
      id: Math.random().toString(36).substring(7),
      tanggal_observasi: new Date().toISOString().split("T")[0],
      jam_observasi: "",
      nama_observer: "",
      nama_pasien: "",
      no_rm: "",
      tanggal_lahir: "",
      jenis_kelamin: "",
      petugas: "",
      lokasi: "",
      moments: {},
    },
  ]);
  const [averageWaktuTunggu, setAverageWaktuTunggu] = useState<
    number | undefined
  >(undefined);
  const [customNumerator, setCustomNumerator] = useState<number | undefined>(
    undefined,
  );
  const [customDenominator, setCustomDenominator] = useState<
    number | undefined
  >(undefined);
  const [uploadedProofName, setUploadedProofName] = useState<string>("");

  // Sub units list when Rawat Jalan is clicked
  const subUnitsRawatJalan = [
    "Poli Anak",
    "Poli Bedah",
    "Poli Penyakit Dalam",
    "Poli Obgyn",
    "Poli Saraf",
    "Poli DOTS",
    "Poli Arafah",
  ];

  // Dynamically compute real-time score
  const computedCapaian = useMemo(() => {
    let num = watchNumerator !== undefined ? watchNumerator : 0;
    let den =
      watchDenominator !== undefined && watchDenominator > 0
        ? watchDenominator
        : 1;

    // Special calculations
    if (isVisiteDokter) {
      num = visiteGrid.filter(
        (d) => d.jam_visite_kurang_14 && d.keterangan === "Sesuai Jadwal",
      ).length;
      den = visiteGrid.length || 1;
    } else if (isRisikoJatuh) {
      num = jatuhGrid.reduce(
        (acc, curr) =>
          acc +
          (curr.asesmen_awal && curr.asesmen_ulang && curr.intervensi ? 1 : 0),
        0,
      );
      den = jatuhGrid.length || 1;
    } else if (isIdentifikasiPasien) {
      let calcNum = 0;
      let calcDen = 0;
      identifikasiGrid.forEach(row => {
         Object.values(row.moments || {}).forEach(m => {
            if (m.aktif) {
               calcDen++;
               if (m.patuh) calcNum++;
            }
         });
      });
      num = calcNum;
      den = calcDen || 1;
    } else if (isWaktuTunggu) {
      const filledWt = waktuTungguGrid.filter(isRajalRowFilled);
      num = filledWt.filter(isRajalRowCompliant).length;
      den = filledWt.length || 1;
    } else if (isRekamMedis) {
      const rmMetrics = computeRekamMedisMetrics(rekamMedisBundle);
      num = rmMetrics.num;
      den = rmMetrics.den || 1;
    } else if (radiologiMode) {
      const radMetrics = computeRadiologiMetrics(radiologiBundle, radiologiMode);
      num = radMetrics.num;
      den = radMetrics.den || 1;
    } else if (prognasIndicatorType) {
      const pStats = computePrognasStats(prognasData);
      num = pStats.num;
      den = pStats.den || 1;
    } else if (isWaktuTungguRacikan) {
      num = racikanGrid.filter((d) => d.sesuai_standar === true).length;
      den = racikanGrid.length || 1;
    } else if (isHighAlertDoubleCheck) {
      num = highAlertGrid.filter((d) => d.hasil === "Patuh").length;
      den = highAlertGrid.length || 1;
    } else if (isKekosonganObat) {
      num = kekosonganObatGrid.reduce(
        (acc, curr) => acc + (Number(curr.jumlah_kosong) || 0),
        0,
      );
      den =
        Math.max(
          0,
          ...kekosonganObatGrid.map((r) => Number(r.jumlah_seluruh_obat) || 0),
        ) || 1;
    } else if (isSBAR) {
      num = sbarGrid.filter(
        (d) =>
          d.situation === "Ya" &&
          d.background === "Ya" &&
          d.assesment === "Ya" &&
          d.recomendation === "Ya" &&
          d.verifikasi === "Ya",
      ).length;
      den = sbarGrid.length || 1;
    } else if (isPenundaanOperasi) {
      num = penundaanGrid.filter((d) => d.tertunda_lebih_60 === true).length;
      den = penundaanGrid.length || 1;
    } else if (isSurgicalSafety) {
      num = sscGrid.filter(
        (d) =>
          d.sign_in === "Ya" &&
          d.time_out === "Ya" &&
          d.sign_out === "Ya",
      ).length;
      den = sscGrid.length || 1;
    } else if (isPembatalanOperasi) {
      num = pembatalanGrid.reduce(
        (acc, curr) => acc + (Number(curr.jumlah_batal) || 0),
        0,
      );
      den =
        Math.max(
          0,
          ...pembatalanGrid.map((r) => Number(r.jumlah_seluruh_operasi) || 0),
        ) || 1;
    } else if (isPenyediaanDarah) {
      num = penyediaanDarahGrid.filter((d) => d.terlambat_lebih_60 === true).length;
      den = penyediaanDarahGrid.length || 1;
    } else if (isImdBayi) {
      const yaCount = imdGrid.filter((d) => d.imd === "Ya").length;
      const tidakCount = imdGrid.filter((d) => d.imd === "Tidak").length;
      const maxLahir = Math.max(
        0,
        ...imdGrid.map((r) => Number(r.jumlah_bayi_lahir) || 0),
      );
      if (maxLahir > imdGrid.length && yaCount === 0 && tidakCount > 0) {
        num = Math.max(0, maxLahir - tidakCount);
        den = maxLahir;
      } else {
        num = yaCount;
        den = Math.max(imdGrid.length, maxLahir) || 1;
      }
    } else if (kematianConfig) {
      num = kematianGrid.reduce(
        (acc, curr) => acc + (Number(curr.jumlah_kematian) || 0),
        0,
      );
      den =
        Math.max(
          0,
          ...kematianGrid.map((r) => Number(r.jumlah_populasi) || 0),
        ) || 1;
    } else if (isPengkajianNyeriIcu) {
      num = pengkajianNyeriGrid.filter(
        (d) => d.asesmen_awal_nyeri === "Ya" && d.asesmen_ulang_nyeri === "Ya",
      ).length;
      den = pengkajianNyeriGrid.length || 1;
    } else if (isEmergencyResponTime) {
      num = emergencyResponGrid.filter((d) => d.respon_kurang_5 === true).length;
      den = emergencyResponGrid.length || 1;
    } else if (isScEmergency) {
      num = scEmergencyGrid.filter((d) => d.sesuai_standar === true).length;
      den = scEmergencyGrid.length || 1;
    } else if (isKomplikasiPersalinan) {
      num = komplikasiGrid.filter((d) => d.ditangani === "Ya").length;
      den = komplikasiGrid.length || 1;
    } else if (isHasilKritisLab) {
      num = hasilKritisLabGrid.filter((d) => d.sesuai_standar === true).length;
      den = hasilKritisLabGrid.length || 1;
    } else if (isSampelLabTanpaLabel) {
      num = sampelLabGrid.filter(
        (d) =>
          d.label_ada === "Tidak" ||
          d.identitas_lengkap === "Tidak" ||
          d.status_sampel === "Ditolak",
      ).length;
      den =
        Math.max(sampelLabGrid.length, Number(sampelLabTotalDenom) || 0) || 1;
    } else if (isKunjunganKeluarga) {
      num = kunjunganGrid.filter((d) => d.sesuai_jam_kunjungan === "Tidak").length;
      den =
        Math.max(kunjunganGrid.length, Number(kunjunganTotalDenom) || 0) || 1;
    } else if (isSaranaSanitasi) {
      num = sanitasiGrid.filter((d) => d.status_fungsi === "Berfungsi Baik").length;
      den = sanitasiGrid.length || 1;
    } else if (isPengangkutanLimbah) {
      num = limbahGrid.filter((d) => d.tepat_waktu === true).length;
      den = limbahGrid.length || 1;
    } else if (isAlatSteril) {
      num = alatSterilGrid.filter((d) => d.sesuai_standar === true).length;
      den = alatSterilGrid.length || 1;
    } else if (isPenyediaanLinen) {
      num = linenGrid.filter((d) => d.sesuai_standar === true).length;
      den = linenGrid.length || 1;
    } else if (isAirBersih24Jam) {
      num = Number(
        airBersihGrid
          .reduce((acc, curr) => acc + (Number(curr.jam_tersedia) || 0), 0)
          .toFixed(2),
      );
      den = airBersihGrid.length > 0 ? airBersihGrid.length * 24 : 24;
    } else if (isClinicalPathway) {
      num = clinicalPathwayGrid.filter((d) => d.keterangan === "Patuh").length;
      den = clinicalPathwayGrid.length || 1;
    } else if (isVerifikasiTelepon) {
      num = verifikasiTeleponGrid.filter(
        (d) => d.terverifikasi_24jam === true,
      ).length;
      den = verifikasiTeleponGrid.length || 1;
    } else if (yaTidakConfig) {
      num = yaTidakGrid.filter((d) => d.status_ya).length;
      den = yaTidakGrid.length || 1;
    } else if (
      customNumerator !== undefined &&
      customDenominator !== undefined
    ) {
      num = customNumerator;
      den = customDenominator > 0 ? customDenominator : 1;
    }

    const val = parseFloat(((num / (den || 1)) * 100).toFixed(2));
    return isNaN(val) ? 0 : val;
  }, [
    watchNumerator,
    watchDenominator,
    isVisiteDokter,
    isRisikoJatuh,
    isWaktuTunggu,
    isIdentifikasiPasien,
    isWaktuTungguRacikan,
    isHighAlertDoubleCheck,
    isKekosonganObat,
    isSBAR,
    isPenundaanOperasi,
    isSurgicalSafety,
    isPembatalanOperasi,
    isPenyediaanDarah,
    isImdBayi,
    kematianConfig,
    isPengkajianNyeriIcu,
    isEmergencyResponTime,
    isScEmergency,
    isKomplikasiPersalinan,
    isHasilKritisLab,
    isSampelLabTanpaLabel,
    isKunjunganKeluarga,
    isSaranaSanitasi,
    isPengangkutanLimbah,
    isAlatSteril,
    isPenyediaanLinen,
    isAirBersih24Jam,
    isClinicalPathway,
    isVerifikasiTelepon,
    yaTidakConfig,
    visiteGrid,
    jatuhGrid,
    identifikasiGrid,
    waktuTungguGrid,
    racikanGrid,
    highAlertGrid,
    kekosonganObatGrid,
    sbarGrid,
    penundaanGrid,
    sscGrid,
    pembatalanGrid,
    penyediaanDarahGrid,
    imdGrid,
    kematianGrid,
    pengkajianNyeriGrid,
    emergencyResponGrid,
    scEmergencyGrid,
    komplikasiGrid,
    hasilKritisLabGrid,
    sampelLabGrid,
    sampelLabTotalDenom,
    kunjunganGrid,
    kunjunganTotalDenom,
    sanitasiGrid,
    limbahGrid,
    alatSterilGrid,
    linenGrid,
    airBersihGrid,
    isRekamMedis,
    rekamMedisBundle,
    radiologiMode,
    radiologiBundle,
    prognasIndicatorType,
    prognasData,
    clinicalPathwayGrid,
    verifikasiTeleponGrid,
    yaTidakGrid,
    customNumerator,
    customDenominator,
  ]);

  const achievementStatus = useMemo(() => {
    if (!selectedIndikatorProfile) return "N/A";
    const targetRaw = String(selectedIndikatorProfile.target).trim();
    const parsedTarget = parseFloat(targetRaw.replace(",", ".").replace(/[^0-9.]/g, ""));
    const target = Number.isFinite(parsedTarget) ? parsedTarget : 80;
    const isReverse = selectedIndikatorProfile.reverse;

    let success = false;
    if (isReverse) {
      success = targetRaw.startsWith("<")
        ? computedCapaian < target
        : computedCapaian <= target;
    } else {
      success = computedCapaian >= target;
    }

    if (success) return "Tercapai";
    const gap = isReverse ? computedCapaian - target : target - computedCapaian;
    if (gap <= 10) return "Mendekati";
    return "Tidak Tercapai";
  }, [selectedIndikatorProfile, computedCapaian]);

  // Real-time unit list filtering
  const filteredUnits = useMemo(() => {
    const seen = new Set<string>();
    return units.filter((u) => {
      const uniqueKey = u.id || u.name;
      if (seen.has(uniqueKey)) return false;
      seen.add(uniqueKey);
      return (
        u.name.toLowerCase().includes(unitSearch.toLowerCase()) &&
        u.status === "Aktif"
      );
    });
  }, [units, unitSearch]);

  // Interactive functions to manage units via modal (Admin)
  const handleOpenAddRoom = () => {
    setModalMode("add");
    setRoomNameInput("");
    setRoomCategoryInput("Rawat Inap");
    setRoomStatusInput("Aktif");
    setShowRoomModal(true);
  };

  const handleOpenEditRoom = (e: React.MouseEvent, u: Unit) => {
    e.stopPropagation();
    setModalMode("edit");
    setModalUnitId(u.id);
    setRoomNameInput(u.name);
    setRoomCategoryInput(u.category);
    setRoomStatusInput(u.status);
    setShowRoomModal(true);
  };

  const handleSaveRoom = async () => {
    if (!roomNameInput.trim()) return;

    if (modalMode === "add") {
      const newUnit: Unit = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: roomNameInput.trim(),
        category: roomCategoryInput,
        status: roomStatusInput,
      };

      // Zustand Save
      addUnit(newUnit);

      // Supabase Save attempt
      try {
        await supabase.from("units").insert({
          id: newUnit.id,
          name: newUnit.name,
          category: newUnit.category,
          status: newUnit.status,
        });
      } catch (err) {
        console.warn("Supabase save delayed, local sync executed", err);
      }
    } else if (modalMode === "edit" && modalUnitId) {
      // Zustand Update
      updateUnit(modalUnitId, {
        name: roomNameInput.trim(),
        category: roomCategoryInput,
        status: roomStatusInput,
      });

      // Supabase Update attempt
      try {
        await supabase
          .from("units")
          .update({
            name: roomNameInput.trim(),
            category: roomCategoryInput,
            status: roomStatusInput,
          })
          .eq("id", modalUnitId);
      } catch (err) {
        console.warn("Supabase update skipped", err);
      }
    }

    setShowRoomModal(false);
  };

  const handleDeleteRoom = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("Apakah Anda yakin ingin menghapus unit ini?")) {
      deleteUnit(id);
      try {
        await supabase.from("units").delete().eq("id", id);
      } catch (err) {
        console.warn("Supabase connection delay", err);
      }
    }
  };

  const getDefaultInputDate = () =>
    watchTanggal || new Date().toISOString().split("T")[0];

  const makeRowId = () =>
    `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  const createEmptyVisiteRow = (): VisiteData => ({
    id: makeRowId(),
    tanggal: getDefaultInputDate(),
    nama_pasien: "",
    no_rm: "",
    jam_visite_kurang_14: false,
    jam_visite_lebih_14: false,
    dokter_visite: "",
    keterangan: "Sesuai Jadwal",
  });

  const createEmptyJatuhRow = (): JatuhData => ({
    id: makeRowId(),
    tanggal: getDefaultInputDate(),
    nama_pasien: "",
    no_rm: "",
    asesmen_awal: null,
    asesmen_ulang: null,
    intervensi: null,
  });

  const createEmptyIdentifikasiRow = (): IdentifikasiData => ({
    id: makeRowId(),
    tanggal_observasi: getDefaultInputDate(),
    jam_observasi: "",
    nama_observer: "",
    nama_pasien: "",
    no_rm: "",
    tanggal_lahir: "",
    jenis_kelamin: "",
    petugas: "",
    lokasi: "",
    moments: {},
  });

  const createEmptyClinicalPathwayRow = (): ClinicalPathwayData => ({
    id: makeRowId(),
    tanggal: getDefaultInputDate(),
    nama_pasien: "",
    no_rm: "",
    nama_dpjp: "",
    los: "",
    obat: "",
    penunjang: "",
    keterangan: "",
  });

  const createEmptyVerifikasiTeleponRow = (): VerifikasiTeleponData => ({
    id: makeRowId(),
    tanggal: getDefaultInputDate(),
    no_rm: "",
    nama_pasien: "",
    jam_instruksi: "",
    jam_verifikasi: "",
    terverifikasi_24jam: null,
    keterangan: "",
  });

  const createEmptyYaTidakRow = (): YaTidakPasienData => ({
    id: makeRowId(),
    tanggal: getDefaultInputDate(),
    no_rm: "",
    nama_pasien: "",
    status_ya: false,
    status_tidak: false,
    keterangan: "",
  });

  const createEmptyRacikanRow = (): RacikanWaktuTungguData => ({
    id: makeRowId(),
    tanggal: getDefaultInputDate(),
    no_rm: "",
    nama_pasien: "",
    jam_menyerahkan: "",
    jam_menerima: "",
    selisih_menit: 0,
    sesuai_standar: null,
    keterangan: "",
  });

  const createEmptyHighAlertRow = (): HighAlertDoubleCheckData => ({
    id: makeRowId(),
    tanggal: getDefaultInputDate(),
    no_rm: "",
    nama_pasien: "",
    double_check: "",
    dokumentasi_lengkap: "",
    hasil: "",
  });

  const createEmptyKekosonganObatRow = (): KekosonganObatData => ({
    id: makeRowId(),
    tanggal: getDefaultInputDate(),
    no_rm: "",
    nama_pasien: "",
    jenis_obat_kosong: "",
    jumlah_kosong: 0,
    jumlah_seluruh_obat: "",
    keterangan: "",
  });

  const createEmptySBARRow = (): SBARData => ({
    id: makeRowId(),
    tanggal: getDefaultInputDate(),
    no_rm: "",
    nama_pasien: "",
    tanggal_konsul: getDefaultInputDate(),
    situation: "",
    background: "",
    assesment: "",
    recomendation: "",
    verifikasi: "",
  });

  const createEmptyPenundaanOperasiRow = (): PenundaanOperasiData => ({
    id: makeRowId(),
    tanggal: getDefaultInputDate(),
    no_rm: "",
    nama_pasien: "",
    jam_rencana: "",
    jam_pelaksanaan: "",
    interval_menit: 0,
    tertunda_lebih_60: null,
    keterangan: "",
  });

  const createEmptySurgicalSafetyRow = (): SurgicalSafetyData => ({
    id: makeRowId(),
    tanggal: getDefaultInputDate(),
    no_rm: "",
    nama_pasien: "",
    sign_in: "",
    time_out: "",
    sign_out: "",
    keterangan: "",
  });

  const createEmptyPembatalanOperasiRow = (): PembatalanOperasiData => ({
    id: makeRowId(),
    tanggal: getDefaultInputDate(),
    no_rm: "",
    nama_pasien: "",
    penyebab_pembatalan: "",
    jumlah_batal: 0,
    jumlah_seluruh_operasi: "",
    keterangan: "",
  });

  const createEmptyPenyediaanDarahRow = (): PenyediaanDarahData => ({
    id: makeRowId(),
    tanggal: getDefaultInputDate(),
    nama_pasien: "",
    no_rm: "",
    jenis_darah_banyaknya: "",
    jam_permintaan: "",
    jam_diterima: "",
    selisih_menit: 0,
    terlambat_lebih_60: null,
    keterangan: "",
  });

  const createEmptyImdBayiRow = (): ImdBayiData => ({
    id: makeRowId(),
    tanggal: getDefaultInputDate(),
    nama_bayi: "",
    no_rm: "",
    imd: "",
    alasan_tidak_imd: "",
    jumlah_bayi_lahir: "",
  });

  const createEmptyKematianRow = (): KematianIbuBayiData => ({
    id: makeRowId(),
    tanggal: getDefaultInputDate(),
    nama_pasien: "",
    no_rm: "",
    alamat: "",
    dx: "",
    dpjp: "",
    rujukan_status: "",
    jumlah_kematian: 0,
    jumlah_populasi: "",
  });

  const createEmptyPengkajianNyeriRow = (): PengkajianNyeriData => ({
    id: makeRowId(),
    tanggal: getDefaultInputDate(),
    no_rm: "",
    nama_pasien: "",
    asesmen_awal_nyeri: "",
    asesmen_ulang_nyeri: "",
    keterangan: "",
  });

  const createEmptyEmergencyResponRow = (): EmergencyResponTimeData => ({
    id: makeRowId(),
    tanggal: getDefaultInputDate(),
    nama_pasien: "",
    no_rm: "",
    tgl_lahir: "",
    diagnosa: "",
    jam_reg: "",
    jam_periksa: "",
    interval_detik: 0,
    interval_text: "",
    respon_kurang_5: null,
    keterangan: "",
  });

  const createEmptyScEmergencyRow = (): ScEmergencyData => ({
    id: makeRowId(),
    tanggal: getDefaultInputDate(),
    no_rm: "",
    nama_pasien: "",
    jam_diputuskan: "",
    jam_insisi: "",
    interval_menit: 0,
    sesuai_standar: null,
    keterangan: "",
  });

  const createEmptyKomplikasiRow = (): KomplikasiPersalinanData => ({
    id: makeRowId(),
    tanggal: getDefaultInputDate(),
    no_rm: "",
    nama_pasien: "",
    jenis_komplikasi: "",
    ditangani: "",
    dirujuk: "",
  });

  const createEmptyHasilKritisRow = (): HasilKritisLabData => ({
    id: makeRowId(),
    tanggal: getDefaultInputDate(),
    no_rm: "",
    nama_pasien: "",
    jam_keluar: "",
    jam_lapor: "",
    interval_menit: 0,
    sesuai_standar: null,
    keterangan: "",
  });

  const createEmptySampelLabRow = (): SampelLabPelabelanData => ({
    id: makeRowId(),
    tanggal: getDefaultInputDate(),
    unit_pengirim: "",
    nama_pasien_rm: "",
    jenis_spesimen: "",
    label_ada: "",
    identitas_lengkap: "",
    status_sampel: "",
    jumlah_sampel_diterima: "",
    keterangan: "",
  });

  const createEmptyKunjunganRow = (): KunjunganKeluargaData => ({
    id: makeRowId(),
    tanggal: getDefaultInputDate(),
    nama_pengunjung: "",
    nama_pasien: "",
    ruangan: "",
    jam_masuk: "",
    jam_keluar: "",
    sesuai_jam_kunjungan: "",
    jumlah_pasien_ranap: "",
    total_kunjungan_keluarga: "",
  });

  const createEmptySanitasiRow = (): SaranaSanitasiData => ({
    id: makeRowId(),
    tanggal: getDefaultInputDate(),
    unit: "",
    toilet: "",
    wastafel: "",
    saluran_pembuangan: "",
    status_fungsi: "",
    keterangan: "",
  });

  const createEmptyLimbahRow = (): PengangkutanLimbahData => ({
    id: makeRowId(),
    tanggal: getDefaultInputDate(),
    jam_pengangkutan: "",
    unit: "",
    tepat_waktu: null,
    keterangan: "",
  });

  const createEmptyAlatSterilRow = (): PenyediaanAlatSterilData => ({
    id: makeRowId(),
    tanggal: getDefaultInputDate(),
    nama_ruangan: "",
    jam_permintaan: "",
    jam_diberikan: "",
    selisih_menit: 0,
    sesuai_standar: null,
    keterangan: "",
  });

  const createEmptyLinenRow = (): PenyediaanLinenData => ({
    id: makeRowId(),
    tanggal: getDefaultInputDate(),
    nama_ruangan: "",
    jenis_linen: "",
    jam_permintaan: "",
    jam_dikirim: "",
    jam_diterima: "",
    selisih_menit: 0,
    sesuai_standar: null,
    keterangan: "",
  });

  const createEmptyAirBersihRow = (): KetersediaanAirData => ({
    id: makeRowId(),
    tanggal: getDefaultInputDate(),
    unit: "",
    jam_gangguan: "",
    jam_kembali_normal: "",
    durasi_gangguan_jam: 0,
    jam_tersedia: 24,
    keterangan: "",
  });

  // Input actions for specialized checkers
  const handleAddVisiteRow = () => {
    setVisiteGrid([...visiteGrid, createEmptyVisiteRow()]);
  };

  const handleRemoveVisiteRow = (id: string) =>
    setVisiteGrid(visiteGrid.filter((r) => r.id !== id));

  const handleUpdateVisite = (
    id: string,
    field: keyof VisiteData,
    value: any,
  ) => {
    setVisiteGrid(
      visiteGrid.map((r) => {
        if (r.id !== id) return r;
        const updated = { ...r, [field]: value };
        if (field === "jam_visite_kurang_14" && value) {
          updated.jam_visite_lebih_14 = false;
          updated.keterangan = "Sesuai Jadwal";
        }
        if (field === "jam_visite_lebih_14" && value) {
          updated.jam_visite_kurang_14 = false;
          updated.keterangan = "Tidak Sesuai Jadwal";
        }
        return updated;
      }),
    );
  };

  const handleAddJatuhRow = () => {
    setJatuhGrid([...jatuhGrid, createEmptyJatuhRow()]);
  };

  const handleRemoveJatuhRow = (id: string) =>
    setJatuhGrid(jatuhGrid.filter((r) => r.id !== id));

  const handleUpdateJatuh = (
    id: string,
    field: keyof JatuhData,
    value: any,
  ) => {
    setJatuhGrid(
      jatuhGrid.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    );
  };

  const handleAddIdentifikasiRow = () => {
    setIdentifikasiGrid([...identifikasiGrid, createEmptyIdentifikasiRow()]);
  };

  const handleRemoveIdentifikasiRow = (id: string) => {
    setDeleteIdentifikasiId(id);
  };

  const handleConfirmRemoveIdentifikasi = () => {
    if (deleteIdentifikasiId) {
      setIdentifikasiGrid(identifikasiGrid.filter((r) => r.id !== deleteIdentifikasiId));
      setDeleteIdentifikasiId(null);
    }
  };

  const handleUpdateIdentifikasi = (
    id: string,
    field: keyof IdentifikasiData,
    value: any,
  ) => {
    setIdentifikasiGrid(
      identifikasiGrid.map((r) => {
        if (r.id !== id) return r;
        return { ...r, [field]: value };
      }),
    );
  };

  const handleUpdateIdentifikasiMoment = (
    id: string,
    momentIndex: string,
    field: keyof MomentIdentifikasi,
    value: any,
  ) => {
    setIdentifikasiGrid(
      identifikasiGrid.map((r) => {
        if (r.id !== id) return r;
        const currentMoment = r.moments[momentIndex] || {
          aktif: false,
          petugas: "",
          tanya_nama: null,
          tanya_tgllahir: null,
          cara_verbal: null,
          cara_visual: null,
          lokasi: "",
          patuh: null,
        };
        const updatedMoment = { ...currentMoment, [field]: value };

        // Mark as active if it has some data
        if (
          updatedMoment.petugas !== "" ||
          updatedMoment.tanya_nama !== null ||
          updatedMoment.tanya_tgllahir !== null ||
          updatedMoment.cara_verbal !== null ||
          updatedMoment.cara_visual !== null ||
          updatedMoment.lokasi !== ""
        ) {
          updatedMoment.aktif = true;
        } else {
          updatedMoment.aktif = false;
        }

        // Auto-calculate Patuh
        if (
          updatedMoment.tanya_nama !== null ||
          updatedMoment.tanya_tgllahir !== null ||
          updatedMoment.cara_verbal !== null ||
          updatedMoment.cara_visual !== null
        ) {
          if (
            updatedMoment.tanya_nama === "Ya" &&
            updatedMoment.tanya_tgllahir === "Ya" &&
            (updatedMoment.cara_verbal === "Ya" || updatedMoment.cara_visual === "Ya")
          ) {
            updatedMoment.patuh = true;
          } else {
            updatedMoment.patuh = false;
          }
        } else {
          updatedMoment.patuh = null;
        }

        return {
          ...r,
          moments: {
            ...r.moments,
            [momentIndex]: updatedMoment,
          },
        };
      }),
    );
  };

  const calculateMinutesDiff = (start: string, end: string) => {
    if (!start || !end) return 0;
    const [sH, sM] = start.split(":").map(Number);
    const [eH, eM] = end.split(":").map(Number);

    let diff = eH * 60 + eM - (sH * 60 + sM);
    if (diff < 0) diff += 24 * 60; // handle overnight wrap
    return diff;
  };

  // Clinical Pathway handlers
  const handleAddClinicalPathwayRow = () => {
    setClinicalPathwayGrid([...clinicalPathwayGrid, createEmptyClinicalPathwayRow()]);
  };

  const handleRemoveClinicalPathwayRow = (id: string) => {
    setClinicalPathwayGrid(clinicalPathwayGrid.filter((r) => r.id !== id));
  };

  const handleUpdateClinicalPathway = (
    id: string,
    field: keyof ClinicalPathwayData,
    value: any,
  ) => {
    setClinicalPathwayGrid((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const updated = { ...r, [field]: value };
        if (field === "los" || field === "obat" || field === "penunjang") {
          if (
            updated.los === "Tidak Sesuai" ||
            updated.obat === "Tidak Sesuai" ||
            updated.penunjang === "Tidak Sesuai"
          ) {
            updated.keterangan = "Tidak Patuh";
          } else if (
            updated.los === "Sesuai" &&
            updated.obat === "Sesuai" &&
            updated.penunjang === "Sesuai"
          ) {
            updated.keterangan = "Patuh";
          }
        }
        return updated;
      }),
    );
  };

  // Verifikasi 1x24 Jam Instruksi Telepon DPJP handlers
  const handleAddVerifikasiTeleponRow = () => {
    setVerifikasiTeleponGrid([
      ...verifikasiTeleponGrid,
      createEmptyVerifikasiTeleponRow(),
    ]);
  };

  const handleRemoveVerifikasiTeleponRow = (id: string) => {
    setVerifikasiTeleponGrid(verifikasiTeleponGrid.filter((r) => r.id !== id));
  };

  const handleUpdateVerifikasiTelepon = (
    id: string,
    field: keyof VerifikasiTeleponData,
    value: any,
  ) => {
    setVerifikasiTeleponGrid((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const updated = { ...r, [field]: value };
        if (
          (field === "jam_instruksi" || field === "jam_verifikasi") &&
          updated.jam_instruksi &&
          updated.jam_verifikasi &&
          updated.terverifikasi_24jam === null
        ) {
          updated.terverifikasi_24jam = true;
        }
        return updated;
      }),
    );
  };

  // Unified Ya / Tidak observation handlers
  const handleAddYaTidakRow = () => {
    setYaTidakGrid([...yaTidakGrid, createEmptyYaTidakRow()]);
  };

  const handleRemoveYaTidakRow = (id: string) => {
    setYaTidakGrid(yaTidakGrid.filter((r) => r.id !== id));
  };

  const handleUpdateYaTidak = (
    id: string,
    field: keyof YaTidakPasienData,
    value: any,
  ) => {
    setYaTidakGrid((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const updated = { ...r, [field]: value };
        if (field === "status_ya" && value) {
          updated.status_tidak = false;
        } else if (field === "status_tidak" && value) {
          updated.status_ya = false;
        }
        return updated;
      }),
    );
  };

  // Waktu Tunggu Pelayanan Obat Racikan handlers
  const handleAddRacikanRow = () => {
    setRacikanGrid([...racikanGrid, createEmptyRacikanRow()]);
  };

  const handleRemoveRacikanRow = (id: string) => {
    setRacikanGrid(racikanGrid.filter((r) => r.id !== id));
  };

  const handleUpdateRacikan = (
    id: string,
    field: keyof RacikanWaktuTungguData,
    value: any,
  ) => {
    setRacikanGrid((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const updated = { ...r, [field]: value };
        if (field === "jam_menyerahkan" || field === "jam_menerima") {
          if (updated.jam_menyerahkan && updated.jam_menerima) {
            updated.selisih_menit = calculateMinutesDiff(
              updated.jam_menyerahkan,
              updated.jam_menerima,
            );
            updated.sesuai_standar = updated.selisih_menit <= 60;
          } else {
            updated.selisih_menit = 0;
            updated.sesuai_standar = null;
          }
        }
        return updated;
      }),
    );
  };

  // Double Check Obat High Alert handlers
  const handleAddHighAlertRow = () => {
    setHighAlertGrid([...highAlertGrid, createEmptyHighAlertRow()]);
  };

  const handleRemoveHighAlertRow = (id: string) => {
    setHighAlertGrid(highAlertGrid.filter((r) => r.id !== id));
  };

  const handleUpdateHighAlert = (
    id: string,
    field: keyof HighAlertDoubleCheckData,
    value: any,
  ) => {
    setHighAlertGrid((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const updated = { ...r, [field]: value };
        if (field === "double_check" || field === "dokumentasi_lengkap") {
          if (updated.double_check === "Ya" && updated.dokumentasi_lengkap === "Ya") {
            updated.hasil = "Patuh";
          } else if (
            updated.double_check === "Tidak" ||
            updated.dokumentasi_lengkap === "Tidak"
          ) {
            updated.hasil = "Tidak Patuh";
          }
        }
        return updated;
      }),
    );
  };

  // Kekosongan Obat Essensial handlers
  const handleAddKekosonganObatRow = () => {
    const existingDenom =
      kekosonganObatGrid.find((r) => Number(r.jumlah_seluruh_obat) > 0)
        ?.jumlah_seluruh_obat || "";
    setKekosonganObatGrid([
      ...kekosonganObatGrid,
      { ...createEmptyKekosonganObatRow(), jumlah_seluruh_obat: existingDenom },
    ]);
  };

  const handleRemoveKekosonganObatRow = (id: string) => {
    setKekosonganObatGrid(kekosonganObatGrid.filter((r) => r.id !== id));
  };

  const handleUpdateKekosonganObat = (
    id: string,
    field: keyof KekosonganObatData,
    value: any,
  ) => {
    setKekosonganObatGrid((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const updated = { ...r, [field]: value };
        if (field === "jenis_obat_kosong") {
          const vLow = String(value || "").trim().toLowerCase();
          if (
            vLow === "" ||
            vLow === "nihil" ||
            vLow === "tidak ada" ||
            vLow === "-"
          ) {
            updated.jumlah_kosong = 0;
          } else if (Number(updated.jumlah_kosong || 0) === 0) {
            updated.jumlah_kosong = 1;
          }
        }
        return updated;
      }),
    );
  };

  const calculateDelayMinutes = (planned: string, actual: string) => {
    if (!planned || !actual) return 0;
    const [pH, pM] = planned.split(":").map(Number);
    const [aH, aM] = actual.split(":").map(Number);
    const rawDiff = aH * 60 + aM - (pH * 60 + pM);
    if (rawDiff < 0 && Math.abs(rawDiff) <= 720) return 0;
    if (rawDiff < 0) return rawDiff + 24 * 60;
    return rawDiff;
  };

  // Dokumen SBAR handlers (Fatimah / Usman)
  const handleAddSBARRow = () => setSbarGrid([...sbarGrid, createEmptySBARRow()]);
  const handleRemoveSBARRow = (id: string) =>
    setSbarGrid(sbarGrid.filter((r) => r.id !== id));
  const handleUpdateSBAR = (id: string, field: keyof SBARData, value: any) => {
    setSbarGrid((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    );
  };

  // Penundaan Operasi Elektif handlers (IBS)
  const handleAddPenundaanRow = () =>
    setPenundaanGrid([...penundaanGrid, createEmptyPenundaanOperasiRow()]);
  const handleRemovePenundaanRow = (id: string) =>
    setPenundaanGrid(penundaanGrid.filter((r) => r.id !== id));
  const handleUpdatePenundaan = (
    id: string,
    field: keyof PenundaanOperasiData,
    value: any,
  ) => {
    setPenundaanGrid((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const updated = { ...r, [field]: value };
        if (field === "jam_rencana" || field === "jam_pelaksanaan") {
          if (updated.jam_rencana && updated.jam_pelaksanaan) {
            updated.interval_menit = calculateDelayMinutes(
              updated.jam_rencana,
              updated.jam_pelaksanaan,
            );
            updated.tertunda_lebih_60 = updated.interval_menit > 60;
          } else {
            updated.interval_menit = 0;
            updated.tertunda_lebih_60 = null;
          }
        }
        return updated;
      }),
    );
  };

  // Surgical Safety Checklist handlers (IBS)
  const handleAddSscRow = () =>
    setSscGrid([...sscGrid, createEmptySurgicalSafetyRow()]);
  const handleRemoveSscRow = (id: string) =>
    setSscGrid(sscGrid.filter((r) => r.id !== id));
  const handleUpdateSsc = (
    id: string,
    field: keyof SurgicalSafetyData,
    value: any,
  ) => {
    setSscGrid((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    );
  };

  // Pembatalan Operasi Elektif handlers (IBS)
  const handleAddPembatalanRow = () => {
    const existingDenom =
      pembatalanGrid.find((r) => Number(r.jumlah_seluruh_operasi) > 0)
        ?.jumlah_seluruh_operasi || "";
    setPembatalanGrid([
      ...pembatalanGrid,
      { ...createEmptyPembatalanOperasiRow(), jumlah_seluruh_operasi: existingDenom },
    ]);
  };
  const handleRemovePembatalanRow = (id: string) =>
    setPembatalanGrid(pembatalanGrid.filter((r) => r.id !== id));
  const handleUpdatePembatalan = (
    id: string,
    field: keyof PembatalanOperasiData,
    value: any,
  ) => {
    setPembatalanGrid((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const updated = { ...r, [field]: value };
        if (field === "penyebab_pembatalan") {
          const vLow = String(value || "").trim().toLowerCase();
          if (vLow === "" || vLow === "nihil" || vLow === "tidak ada" || vLow === "-") {
            updated.jumlah_batal = 0;
          } else if (Number(updated.jumlah_batal || 0) === 0) {
            updated.jumlah_batal = 1;
          }
        }
        return updated;
      }),
    );
  };

  // Penyediaan Darah PONEK handlers (IBS)
  const handleAddPenyediaanDarahRow = () =>
    setPenyediaanDarahGrid([...penyediaanDarahGrid, createEmptyPenyediaanDarahRow()]);
  const handleRemovePenyediaanDarahRow = (id: string) =>
    setPenyediaanDarahGrid(penyediaanDarahGrid.filter((r) => r.id !== id));
  const handleUpdatePenyediaanDarah = (
    id: string,
    field: keyof PenyediaanDarahData,
    value: any,
  ) => {
    setPenyediaanDarahGrid((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const updated = { ...r, [field]: value };
        if (field === "jam_permintaan" || field === "jam_diterima") {
          if (updated.jam_permintaan && updated.jam_diterima) {
            updated.selisih_menit = calculateMinutesDiff(
              updated.jam_permintaan,
              updated.jam_diterima,
            );
            updated.terlambat_lebih_60 = updated.selisih_menit > 60;
          } else {
            updated.selisih_menit = 0;
            updated.terlambat_lebih_60 = null;
          }
        }
        return updated;
      }),
    );
  };

  // IMD Bayi Baru Lahir handlers (IBS)
  const handleAddImdRow = () =>
    setImdGrid([...imdGrid, createEmptyImdBayiRow()]);
  const handleRemoveImdRow = (id: string) =>
    setImdGrid(imdGrid.filter((r) => r.id !== id));
  const handleUpdateImd = (id: string, field: keyof ImdBayiData, value: any) => {
    setImdGrid((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    );
  };

  // Kematian Ibu & Bayi handlers (IBS)
  const handleAddKematianRow = () => {
    const existingPop =
      kematianGrid.find((r) => Number(r.jumlah_populasi) > 0)?.jumlah_populasi ||
      "";
    setKematianGrid([
      ...kematianGrid,
      { ...createEmptyKematianRow(), jumlah_populasi: existingPop },
    ]);
  };
  const handleRemoveKematianRow = (id: string) =>
    setKematianGrid(kematianGrid.filter((r) => r.id !== id));
  const handleUpdateKematian = (
    id: string,
    field: keyof KematianIbuBayiData,
    value: any,
  ) => {
    setKematianGrid((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const updated = { ...r, [field]: value };
        if (field === "nama_pasien") {
          const vLow = String(value || "").trim().toLowerCase();
          if (vLow === "" || vLow === "nihil" || vLow === "-") {
            updated.jumlah_kematian = 0;
          } else if (Number(updated.jumlah_kematian || 0) === 0) {
            updated.jumlah_kematian = 1;
          }
        }
        return updated;
      }),
    );
  };

  // Pengkajian Nyeri ICU handlers
  const handleAddPengkajianNyeriRow = () =>
    setPengkajianNyeriGrid([...pengkajianNyeriGrid, createEmptyPengkajianNyeriRow()]);
  const handleRemovePengkajianNyeriRow = (id: string) =>
    setPengkajianNyeriGrid(pengkajianNyeriGrid.filter((r) => r.id !== id));
  const handleUpdatePengkajianNyeri = (
    id: string,
    field: keyof PengkajianNyeriData,
    value: any,
  ) => {
    setPengkajianNyeriGrid((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    );
  };

  // Helpers for HH:MM:SS Emergency Respon Time calculations
  const normalizeTimeHMS = (raw: string): string => {
    const clean = String(raw || "").trim().replace(/\./g, ":");
    const parts = clean.split(":");
    if (parts.length < 2) return "";
    const h = Number(parts[0]);
    const m = Number(parts[1]);
    const s = Number(parts[2] ?? 0);
    if (isNaN(h) || isNaN(m) || isNaN(s) || h < 0 || h > 23 || m < 0 || m > 59 || s < 0 || s > 59) {
      return "";
    }
    return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
  };

  const calculateSecondsDiff = (start: string, end: string): number => {
    const nStart = normalizeTimeHMS(start);
    const nEnd = normalizeTimeHMS(end);
    if (!nStart || !nEnd) return 0;
    const [sH, sM, sS] = nStart.split(":").map(Number);
    const [eH, eM, eS] = nEnd.split(":").map(Number);
    let diff = eH * 3600 + eM * 60 + eS - (sH * 3600 + sM * 60 + sS);
    if (diff < 0) diff += 24 * 3600; // overnight wrap
    return diff;
  };

  const formatSecondsToHMS = (totalSecs: number): string => {
    const clamped = Math.max(0, Math.round(totalSecs));
    const h = Math.floor(clamped / 3600);
    const m = Math.floor((clamped % 3600) / 60);
    const s = clamped % 60;
    return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
  };

  const normalizeExcelDate = (raw: string): string => {
    const s = String(raw || "").trim();
    if (!s) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    const m = s.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
    if (m) {
      const dd = m[1].padStart(2, "0");
      const mm = m[2].padStart(2, "0");
      const yyyy = m[3];
      return `${yyyy}-${mm}-${dd}`;
    }
    return "";
  };

  // Emergency Respon Time (IGD <= 5 menit) handlers
  const handleAddEmergencyResponRow = () =>
    setEmergencyResponGrid([...emergencyResponGrid, createEmptyEmergencyResponRow()]);
  const handleRemoveEmergencyResponRow = (id: string) =>
    setEmergencyResponGrid(emergencyResponGrid.filter((r) => r.id !== id));
  const handleUpdateEmergencyRespon = (
    id: string,
    field: keyof EmergencyResponTimeData,
    value: any,
  ) => {
    setEmergencyResponGrid((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const updated = { ...r, [field]: value };
        if (field === "jam_reg" || field === "jam_periksa") {
          const normReg = normalizeTimeHMS(updated.jam_reg);
          const normPeriksa = normalizeTimeHMS(updated.jam_periksa);
          if (normReg && normPeriksa) {
            const diffSecs = calculateSecondsDiff(normReg, normPeriksa);
            updated.interval_detik = diffSecs;
            updated.interval_text = formatSecondsToHMS(diffSecs);
            updated.respon_kurang_5 = diffSecs <= 300;
          } else {
            updated.interval_detik = 0;
            updated.interval_text = "";
            updated.respon_kurang_5 = null;
          }
        }
        return updated;
      }),
    );
  };

  const handleImportErtFromPaste = () => {
    const lines = ertPasteText
      .split(/\r?\n/)
      .map((l) => l.trimEnd())
      .filter((l) => l.trim() !== "");
    if (lines.length === 0) return;

    const parsedRows: EmergencyResponTimeData[] = [];
    for (const line of lines) {
      const cols = line.split("\t").map((c) => c.trim());
      if (cols.length < 4) continue;

      // Skip Excel header line if present
      const lineLow = line.toLowerCase();
      if (
        (lineLow.includes("pasien") && lineLow.includes("jam reg")) ||
        (lineLow.includes("tgl lahir") && lineLow.includes("diagnosa"))
      ) {
        continue;
      }

      // Check if first column is row number (NO)
      const offset = /^\d+$/.test(cols[0]) && cols.length >= 6 ? 1 : 0;
      const pasien = cols[offset] || "";
      const rm = cols[offset + 1] || "";
      const tglLahirRaw = cols[offset + 2] || "";
      const diagnosa = cols[offset + 3] || "";
      const jamRegRaw = cols[offset + 4] || "";
      const jamPeriksaRaw = cols[offset + 5] || "";

      const normReg = normalizeTimeHMS(jamRegRaw);
      const normPeriksa = normalizeTimeHMS(jamPeriksaRaw);
      const diffSecs = normReg && normPeriksa ? calculateSecondsDiff(normReg, normPeriksa) : 0;
      const hasTimes = Boolean(normReg && normPeriksa);

      parsedRows.push({
        id: makeRowId(),
        tanggal: getDefaultInputDate(),
        nama_pasien: pasien,
        no_rm: rm,
        tgl_lahir: normalizeExcelDate(tglLahirRaw),
        diagnosa,
        jam_reg: normReg || jamRegRaw,
        jam_periksa: normPeriksa || jamPeriksaRaw,
        interval_detik: diffSecs,
        interval_text: hasTimes ? formatSecondsToHMS(diffSecs) : "",
        respon_kurang_5: hasTimes ? diffSecs <= 300 : null,
        keterangan: "",
      });
    }

    if (parsedRows.length === 0) {
      alert("Tidak ada baris valid yang terbaca. Pastikan data disalin langsung dari Excel (dipisahkan Tab).");
      return;
    }

    setEmergencyResponGrid((prev) => {
      const isOnlyBlank =
        prev.length === 1 &&
        prev[0].nama_pasien.trim() === "" &&
        prev[0].no_rm.trim() === "" &&
        prev[0].jam_reg.trim() === "" &&
        prev[0].jam_periksa.trim() === "";
      return isOnlyBlank ? parsedRows : [...prev, ...parsedRows];
    });
    setErtPasteText("");
    setShowErtPasteBox(false);
  };

  // Waktu Tanggap SC Emergency (Kebidanan <= 30 menit) handlers
  const handleAddScEmergencyRow = () =>
    setScEmergencyGrid([...scEmergencyGrid, createEmptyScEmergencyRow()]);
  const handleRemoveScEmergencyRow = (id: string) =>
    setScEmergencyGrid(scEmergencyGrid.filter((r) => r.id !== id));
  const handleUpdateScEmergency = (
    id: string,
    field: keyof ScEmergencyData,
    value: any,
  ) => {
    setScEmergencyGrid((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const updated = { ...r, [field]: value };
        if (field === "jam_diputuskan" || field === "jam_insisi") {
          if (updated.jam_diputuskan && updated.jam_insisi) {
            updated.interval_menit = calculateMinutesDiff(
              updated.jam_diputuskan,
              updated.jam_insisi,
            );
            updated.sesuai_standar = updated.interval_menit <= 30;
          } else {
            updated.interval_menit = 0;
            updated.sesuai_standar = null;
          }
        }
        return updated;
      }),
    );
  };

  // Angka Persalinan Dengan Komplikasi Tertangani handlers
  const handleAddKomplikasiRow = () =>
    setKomplikasiGrid([...komplikasiGrid, createEmptyKomplikasiRow()]);
  const handleRemoveKomplikasiRow = (id: string) =>
    setKomplikasiGrid(komplikasiGrid.filter((r) => r.id !== id));
  const handleUpdateKomplikasi = (
    id: string,
    field: keyof KomplikasiPersalinanData,
    value: any,
  ) => {
    setKomplikasiGrid((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const updated = { ...r, [field]: value };
        if (field === "ditangani" && value === "Ya" && updated.dirujuk === "") {
          updated.dirujuk = "Tidak";
        } else if (field === "dirujuk" && value === "Ya" && updated.ditangani === "") {
          updated.ditangani = "Tidak";
        }
        return updated;
      }),
    );
  };

  // Pelaporan Hasil Kritis Laboratorium (< 30 menit) handlers
  const handleAddHasilKritisRow = () =>
    setHasilKritisLabGrid([...hasilKritisLabGrid, createEmptyHasilKritisRow()]);
  const handleRemoveHasilKritisRow = (id: string) =>
    setHasilKritisLabGrid(hasilKritisLabGrid.filter((r) => r.id !== id));
  const handleUpdateHasilKritis = (
    id: string,
    field: keyof HasilKritisLabData,
    value: any,
  ) => {
    setHasilKritisLabGrid((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const updated = { ...r, [field]: value };
        if (field === "jam_keluar" || field === "jam_lapor") {
          if (updated.jam_keluar && updated.jam_lapor) {
            updated.interval_menit = calculateMinutesDiff(
              updated.jam_keluar,
              updated.jam_lapor,
            );
            updated.sesuai_standar = updated.interval_menit < 30;
          } else {
            updated.interval_menit = 0;
            updated.sesuai_standar = null;
          }
        }
        return updated;
      }),
    );
  };

  // Persentase Sampel Laboratorium Yang Tidak Diberi Pelabelan handlers
  const handleAddSampelLabRow = () =>
    setSampelLabGrid([...sampelLabGrid, createEmptySampelLabRow()]);
  const handleAddNihilSampelLabRow = () =>
    setSampelLabGrid([
      ...sampelLabGrid,
      {
        ...createEmptySampelLabRow(),
        unit_pengirim: "Semua Unit",
        nama_pasien_rm: "Nihil (Semua Sampel Berlabel)",
        jenis_spesimen: "Seluruh Spesimen",
        label_ada: "Ya",
        identitas_lengkap: "Ya",
        status_sampel: "Diterima",
        keterangan: "Nihil sampel tanpa label",
      },
    ]);
  const handleRemoveSampelLabRow = (id: string) =>
    setSampelLabGrid(sampelLabGrid.filter((r) => r.id !== id));
  const handleUpdateSampelLab = (
    id: string,
    field: keyof SampelLabPelabelanData,
    value: any,
  ) => {
    setSampelLabGrid((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const updated = { ...r, [field]: value };
        if (field === "label_ada") {
          if (value === "Tidak") {
            updated.identitas_lengkap = "Tidak";
            updated.status_sampel = "Ditolak";
          } else if (value === "Ya" && updated.identitas_lengkap === "Ya") {
            updated.status_sampel = "Diterima";
          }
        } else if (field === "identitas_lengkap") {
          if (value === "Tidak") {
            updated.status_sampel = "Ditolak";
          } else if (value === "Ya" && updated.label_ada === "Ya") {
            updated.status_sampel = "Diterima";
          }
        }
        return updated;
      }),
    );
  };

  // Kunjungan Keluarga Diluar Jam Kunjungan (Keamanan <= 5%) handlers
  const handleAddKunjunganRow = () =>
    setKunjunganGrid([...kunjunganGrid, createEmptyKunjunganRow()]);
  const handleAddNihilKunjunganRow = () =>
    setKunjunganGrid([
      ...kunjunganGrid,
      {
        ...createEmptyKunjunganRow(),
        nama_pengunjung: "Nihil (Semua Sesuai Jam Kunjungan)",
        nama_pasien: "-",
        ruangan: "Seluruh Ruang Rawat Inap",
        jam_masuk: "-",
        jam_keluar: "-",
        sesuai_jam_kunjungan: "Ya",
      },
    ]);
  const handleRemoveKunjunganRow = (id: string) =>
    setKunjunganGrid(kunjunganGrid.filter((r) => r.id !== id));
  const handleUpdateKunjungan = (
    id: string,
    field: keyof KunjunganKeluargaData,
    value: any,
  ) => {
    setKunjunganGrid((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    );
  };

  // Persentase Sarana Sanitasi (Kebersihan/Kesling 100%) handlers
  const handleAddSanitasiRow = () =>
    setSanitasiGrid([...sanitasiGrid, createEmptySanitasiRow()]);
  const handleRemoveSanitasiRow = (id: string) =>
    setSanitasiGrid(sanitasiGrid.filter((r) => r.id !== id));
  const handleUpdateSanitasi = (
    id: string,
    field: keyof SaranaSanitasiData,
    value: any,
  ) => {
    setSanitasiGrid((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const updated = { ...r, [field]: value };
        if (
          field === "toilet" ||
          field === "wastafel" ||
          field === "saluran_pembuangan"
        ) {
          const vals = [updated.toilet, updated.wastafel, updated.saluran_pembuangan];
          if (vals.includes("Rusak")) {
            updated.status_fungsi = "Rusak";
          } else if (vals.includes("Baik")) {
            updated.status_fungsi = "Berfungsi Baik";
          }
        }
        return updated;
      }),
    );
  };

  // Ketepatan Waktu Pengangkutan Limbah (Kebersihan/Kesling 100%) handlers
  const handleAddLimbahRow = () =>
    setLimbahGrid([...limbahGrid, createEmptyLimbahRow()]);
  const handleRemoveLimbahRow = (id: string) =>
    setLimbahGrid(limbahGrid.filter((r) => r.id !== id));
  const handleUpdateLimbah = (
    id: string,
    field: keyof PengangkutanLimbahData,
    value: any,
  ) => {
    setLimbahGrid((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    );
  };

  // Ketepatan Waktu Penyediaan Alat Steril (CSSD 100%) handlers
  const handleAddAlatSterilRow = () =>
    setAlatSterilGrid([...alatSterilGrid, createEmptyAlatSterilRow()]);
  const handleRemoveAlatSterilRow = (id: string) =>
    setAlatSterilGrid(alatSterilGrid.filter((r) => r.id !== id));
  const handleUpdateAlatSteril = (
    id: string,
    field: keyof PenyediaanAlatSterilData,
    value: any,
  ) => {
    setAlatSterilGrid((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const updated = { ...r, [field]: value };
        if (field === "jam_permintaan" || field === "jam_diberikan") {
          if (updated.jam_permintaan && updated.jam_diberikan) {
            updated.selisih_menit = calculateMinutesDiff(
              updated.jam_permintaan,
              updated.jam_diberikan,
            );
            if (updated.sesuai_standar === null) {
              updated.sesuai_standar = true;
            }
          } else {
            updated.selisih_menit = 0;
          }
        }
        return updated;
      }),
    );
  };

  // Ketepatan Waktu Penyediaan Linen Rawat Inap (Laundry <= 30 menit) handlers
  const handleAddLinenRow = () =>
    setLinenGrid([...linenGrid, createEmptyLinenRow()]);
  const handleRemoveLinenRow = (id: string) =>
    setLinenGrid(linenGrid.filter((r) => r.id !== id));
  const handleUpdateLinen = (
    id: string,
    field: keyof PenyediaanLinenData,
    value: any,
  ) => {
    setLinenGrid((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const updated = { ...r, [field]: value };
        if (field === "jam_permintaan" || field === "jam_diterima") {
          if (updated.jam_permintaan && updated.jam_diterima) {
            updated.selisih_menit = calculateMinutesDiff(
              updated.jam_permintaan,
              updated.jam_diterima,
            );
            updated.sesuai_standar = updated.selisih_menit <= 30;
          } else {
            updated.selisih_menit = 0;
            updated.sesuai_standar = null;
          }
        }
        return updated;
      }),
    );
  };

  // Ketersediaan Air Bersih 24 Jam (IPSRS 100%) handlers
  const handleAddAirBersihRow = () =>
    setAirBersihGrid([...airBersihGrid, createEmptyAirBersihRow()]);
  const handleAddNihilAirBersihRow = () =>
    setAirBersihGrid([
      ...airBersihGrid,
      {
        ...createEmptyAirBersihRow(),
        unit: "Seluruh Titik Kritis RS",
        jam_gangguan: "-",
        jam_kembali_normal: "-",
        durasi_gangguan_jam: 0,
        jam_tersedia: 24,
        keterangan: "Nihil gangguan (24 jam penuh)",
      },
    ]);
  const handleRemoveAirBersihRow = (id: string) =>
    setAirBersihGrid(airBersihGrid.filter((r) => r.id !== id));
  const handleUpdateAirBersih = (
    id: string,
    field: keyof KetersediaanAirData,
    value: any,
  ) => {
    setAirBersihGrid((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const updated = { ...r, [field]: value };
        if (field === "jam_gangguan" || field === "jam_kembali_normal") {
          const isValidTime = (s: string) => /^d{2}:d{2}$/.test(s);
          if (
            isValidTime(updated.jam_gangguan) &&
            isValidTime(updated.jam_kembali_normal)
          ) {
            const diffM = calculateMinutesDiff(
              updated.jam_gangguan,
              updated.jam_kembali_normal,
            );
            const hours = Math.min(24, Number((diffM / 60).toFixed(2)));
            updated.durasi_gangguan_jam = hours;
            updated.jam_tersedia = Number(Math.max(0, 24 - hours).toFixed(2));
          }
        } else if (field === "durasi_gangguan_jam") {
          const hours = Math.min(24, Math.max(0, Number(value) || 0));
          updated.durasi_gangguan_jam = hours;
          updated.jam_tersedia = Number(Math.max(0, 24 - hours).toFixed(2));
        }
        return updated;
      }),
    );
  };

  // Guided unit checklist selection handler -> selects category + indicator + opens table directly
  const handleSelectGuidedMutu = (item: UnitMutuItem) => {
    const profile = resolveBlueprintProfile(item);
    if (!profile) {
      alert(
        `Profil indikator "${item.label}" belum ditemukan di Master Indikator. Mohon periksa menu Profil Indikator.`,
      );
      return;
    }

    setFormValue("kategori", profile.category);
    setFormValue("indikator_id", profile.id, { shouldValidate: true });
    setUploadedProofName("");
    setCustomNumerator(undefined);
    setCustomDenominator(undefined);

    const titleLow = (profile.indicator_title || "").toLowerCase();
    setVisiteGrid(
      titleLow.includes("visite") ? [createEmptyVisiteRow()] : [],
    );
    setJatuhGrid(
      titleLow.includes("upaya pencegahan risiko") ? [createEmptyJatuhRow()] : [],
    );
    setIdentifikasiGrid([createEmptyIdentifikasiRow()]);
    const isRajalWt =
      profile.id === "8310950c-90e9-4361-965b-46a47a70c8fd" ||
      profile.id === "11110002-4a02-4000-9000-000000000002" ||
      titleLow.includes("waktu tunggu rawat jalan");
    setActiveRajalSheet("Penyakit Dalam");
    setWaktuTungguGrid(
      isRajalWt
        ? [createEmptyWaktuTungguRow(getDefaultInputDate(), "Penyakit Dalam")]
        : [],
    );
    setRekamMedisBundle(createEmptyRekamMedisBundle(getDefaultInputDate()));
    setRadiologiBundle(createEmptyRadiologiBundle(getDefaultInputDate()));
    const isPrognasSelected = (selectedUnit?.name || "")
      .trim()
      .toLowerCase()
      .includes("prognas");
    if (isPrognasSelected) {
      const pType: PrognasIndicatorType =
        profile.id === "11110022-4a22-4000-9000-000000000022" ||
        titleLow.includes("hiv/aids")
          ? "hiv_aids"
          : profile.id === "22220004-4b04-4000-9000-000000000004" ||
              titleLow.includes("kematian bayi")
            ? "kematian_bayi"
            : profile.id === "22220003-4b03-4000-9000-000000000003" ||
                titleLow.includes("kematian ibu")
              ? "kematian_ibu"
              : profile.id === "22220002-4b02-4000-9000-000000000002" ||
                  titleLow.includes("imd") ||
                  titleLow.includes("inisiasi menyusu dini")
                ? "imd"
                : "rooming_in";
      setPrognasData(createEmptyPrognasData(pType, getDefaultInputDate()));
    }
    setRacikanGrid(
      profile.id === "11110003-4a03-4000-9000-000000000003" ||
        titleLow.includes("obat racikan")
        ? [createEmptyRacikanRow()]
        : [],
    );
    setHighAlertGrid(
      profile.id === "b977461c-a791-46ff-a9dd-62d0427aa0c8" ||
        (titleLow.includes("double check") &&
          (titleLow.includes("high allert") || titleLow.includes("high alert")))
        ? [createEmptyHighAlertRow()]
        : [],
    );
    setKekosonganObatGrid(
      profile.id === "01afa50b-5673-4431-9719-830b37209cc2" ||
        titleLow.includes("kekosongan obat")
        ? [createEmptyKekosonganObatRow()]
        : [],
    );
    setSbarGrid(
      profile.id === "11110009-4a09-4000-9000-000000000009" ||
        profile.id === "11110013-4a13-4000-9000-000000000013" ||
        profile.id === "11110021-4a21-4000-9000-000000000021" ||
        titleLow.includes("dokumen sbar")
        ? [createEmptySBARRow()]
        : [],
    );
    setPenundaanGrid(
      profile.id === "cdfd0fd6-c91a-4ed8-a58e-4f506ffaf1f4" ||
        titleLow.includes("penundaan operasi elektif")
        ? [createEmptyPenundaanOperasiRow()]
        : [],
    );
    setSscGrid(
      profile.id === "3aa607da-2720-4142-bbd0-8b9482b78907" ||
        titleLow.includes("surgical safety")
        ? [createEmptySurgicalSafetyRow()]
        : [],
    );
    setPembatalanGrid(
      profile.id === "11110007-4a07-4000-9000-000000000007" ||
        titleLow.includes("pembatalan operasi elektif")
        ? [createEmptyPembatalanOperasiRow()]
        : [],
    );
    setPenyediaanDarahGrid(
      profile.id === "22220001-4b01-4000-9000-000000000001" ||
        titleLow.includes("keterlambatan penyediaan darah")
        ? [createEmptyPenyediaanDarahRow()]
        : [],
    );
    setImdGrid(
      !isPrognasSelected &&
        (profile.id === "22220002-4b02-4000-9000-000000000002" ||
          titleLow.includes("imd pada bayi baru lahir"))
        ? [createEmptyImdBayiRow()]
        : [],
    );
    setKematianGrid(
      !isPrognasSelected &&
        (profile.id === "22220003-4b03-4000-9000-000000000003" ||
          profile.id === "22220004-4b04-4000-9000-000000000004" ||
          titleLow.includes("kematian ibu") ||
          titleLow.includes("kematian bayi"))
        ? [createEmptyKematianRow()]
        : [],
    );
    setPengkajianNyeriGrid(
      profile.id === "11110008-4a08-4000-9000-000000000008" ||
        titleLow.includes("pengkajian nyeri")
        ? [createEmptyPengkajianNyeriRow()]
        : [],
    );
    setEmergencyResponGrid(
      profile.id === "11110001-4a01-4000-9000-000000000001" ||
        titleLow.includes("emergency respon time")
        ? [createEmptyEmergencyResponRow()]
        : [],
    );
    setShowErtPasteBox(false);
    setErtPasteText("");
    setScEmergencyGrid(
      profile.id === "aeae5b11-04c4-4254-8831-1d5c0ed07b1f" ||
        titleLow.includes("sectio caesarea") ||
        titleLow.includes("seksio sesaria")
        ? [createEmptyScEmergencyRow()]
        : [],
    );
    setKomplikasiGrid(
      profile.id === "11110012-4a12-4000-9000-000000000012" ||
        titleLow.includes("persalinan dengan komplikasi")
        ? [createEmptyKomplikasiRow()]
        : [],
    );
    setHasilKritisLabGrid(
      profile.id === "5a8f87e3-151f-4503-bc4a-7a1d005ae218" ||
        titleLow.includes("hasil kritis laboratorium")
        ? [createEmptyHasilKritisRow()]
        : [],
    );
    setSampelLabGrid(
      profile.id === "11110005-4a05-4000-9000-000000000005" ||
        titleLow.includes("tidak diberi pelabelan")
        ? [createEmptySampelLabRow()]
        : [],
    );
    setSampelLabTotalDenom("");
    setKunjunganGrid(
      profile.id === "11110018-4a18-4000-9000-000000000018" ||
        titleLow.includes("kunjungan keluarga")
        ? [createEmptyKunjunganRow()]
        : [],
    );
    setKunjunganTotalDenom("");
    setSanitasiGrid(
      profile.id === "11110016-4a16-4000-9000-000000000016" ||
        titleLow.includes("sarana sanitasi")
        ? [createEmptySanitasiRow()]
        : [],
    );
    setLimbahGrid(
      profile.id === "11110019-4a19-4000-9000-000000000019" ||
        titleLow.includes("pengangkutan limbah")
        ? [createEmptyLimbahRow()]
        : [],
    );
    setAlatSterilGrid(
      profile.id === "11110014-4a14-4000-9000-000000000014" ||
        titleLow.includes("penyediaan alat steril")
        ? [createEmptyAlatSterilRow()]
        : [],
    );
    setLinenGrid(
      profile.id === "11110020-4a20-4000-9000-000000000020" ||
        titleLow.includes("penyediaan linen")
        ? [createEmptyLinenRow()]
        : [],
    );
    setAirBersihGrid(
      profile.id === "f5d46923-180f-4100-a6ba-66dcaf7e8f9f" ||
        titleLow.includes("air bersih dalam 24 jam")
        ? [createEmptyAirBersihRow()]
        : [],
    );
    setClinicalPathwayGrid(
      titleLow.includes("alur klinis") || titleLow.includes("clinical pathway")
        ? [createEmptyClinicalPathwayRow()]
        : [],
    );
    setVerifikasiTeleponGrid(
      titleLow.includes("telepon") &&
        (titleLow.includes("verifikasi") || titleLow.includes("verivikasi"))
        ? [createEmptyVerifikasiTeleponRow()]
        : [],
    );
    const isYaTidak =
      profile.id === "9871c4ca-55dc-45e4-acc8-a37dce8c2a67" ||
      profile.id === "3ad3a107-9f9b-4d89-a943-7002793650b4" ||
      profile.id === "11110010-4a10-4000-9000-000000000010" ||
      profile.id === "e3e86294-6cb4-401f-90b7-12881b050c62" ||
      profile.id === "11110017-4a17-4000-9000-000000000017" ||
      profile.id === "11110011-4a11-4000-9000-000000000011" ||
      titleLow.includes("formularium nasional") ||
      titleLow.includes("stiker tambahan") ||
      titleLow.includes("skrining risiko jatuh pasien anak") ||
      titleLow.includes("skrining disfagia") ||
      titleLow.includes("asesmen awal medis") ||
      titleLow.includes("assesmen awal medis") ||
      titleLow.includes("reasesmen nyeri");
    setYaTidakGrid(isYaTidak ? [createEmptyYaTidakRow()] : []);

    setTimeout(() => {
      formSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 120);
  };

  // Mock upload handler helper
  const handleFileUploadMock = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedProofName(file.name);
      setFormValue("bukti_file_name", file.name);
    }
  };

  // Form submission fully integrated with Supabase and store payload
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);

    let finalNum = data.numerator_val || 0;
    let finalDen = data.denominator_val || 1;

    if (data.kategori !== "IKP") {
      if (isVisiteDokter) {
        finalNum = visiteGrid.filter(
          (d) => d.jam_visite_kurang_14 && d.keterangan === "Sesuai Jadwal",
        ).length;
        finalDen = visiteGrid.length || 1;
      } else if (isRisikoJatuh) {
        const isValid = jatuhGrid.every(
          (r) =>
            r.nama_pasien.trim() !== "" &&
            r.no_rm.trim() !== "" &&
            r.asesmen_awal !== null &&
            r.asesmen_ulang !== null &&
            r.intervensi !== null,
        );
        if (!isValid && jatuhGrid.length > 0) {
          alert(
            "Data observasi belum lengkap. Mohon lengkapi seluruh kolom wajib terlebih dahulu.",
          );
          setIsSubmitting(false);
          return;
        }
        finalNum = jatuhGrid.reduce(
          (acc, curr) =>
            acc +
            (curr.asesmen_awal && curr.asesmen_ulang && curr.intervensi
              ? 1
              : 0),
          0,
        );
        finalDen = jatuhGrid.length || 1;
      } else if (isIdentifikasiPasien) {
        const isValid = identifikasiGrid.every((r) => {
          if (r.nama_pasien.trim() === "" || r.no_rm.trim() === "") return false;
          if (!r.petugas || r.petugas.trim() === "") return false;
          if (!r.lokasi || r.lokasi.trim() === "") return false;
          
          const moments = Object.values(r.moments || {});
          const activeMoments = moments.filter(m => m.aktif);
          if (activeMoments.length === 0) return false;
          
          return true;
        });

        if (!isValid && identifikasiGrid.length > 0) {
          alert("Data observasi identifikasi pasien belum lengkap (nama pasien, no rm, nama petugas, lokasi identifikasi, dan minimal satu checklist observasi harus terisi).");
          setIsSubmitting(false);
          return;
        }

        let totalNum = 0;
        let totalDen = 0;
        identifikasiGrid.forEach(row => {
           Object.values(row.moments || {}).forEach(m => {
              if (m.aktif) {
                 m.petugas = row.petugas;
                 m.lokasi = row.lokasi;
                 totalDen++;
                 if (m.patuh) totalNum++;
              }
           });
        });
        finalNum = totalNum;
        finalDen = totalDen || 1;
      } else if (isWaktuTunggu) {
        const filledWt = waktuTungguGrid.filter(isRajalRowFilled);
        if (filledWt.length === 0) {
          alert(
            "Data Waktu Tunggu Rawat Jalan masih kosong. Isi minimal 1 pasien pada salah satu sheet Poli.",
          );
          setIsSubmitting(false);
          return;
        }
        const isValidWt = filledWt.every(
          (r) =>
            r.tanggal &&
            r.nama_pasien.trim() !== "" &&
            r.no_rm.trim() !== "" &&
            r.jam_datang.trim() !== "" &&
            r.jam_dilayani.trim() !== "",
        );
        if (!isValidWt) {
          alert(
            "Data Waktu Tunggu Rawat Jalan belum lengkap. Pastikan Tanggal, Nama Pasien, No. RM, Jam Datang, dan Jam Dilayani Dokter terisi pada setiap baris pasien.",
          );
          setIsSubmitting(false);
          return;
        }
        finalNum = filledWt.filter(isRajalRowCompliant).length;
        finalDen = filledWt.length || 1;
      } else if (isRekamMedis) {
        const rmMetrics = computeRekamMedisMetrics(rekamMedisBundle);
        const totalRows =
          rmMetrics.filled24.length +
          rmMetrics.filledRm.length +
          rmMetrics.filledPulang.length;
        if (totalRows === 0) {
          alert(
            "Data Audit Rekam Medis masih kosong. Isi minimal 1 baris pada sheet Kelengkapan RM 24 Jam, Review Rekam Medis, atau Review Ringkasan Pulang.",
          );
          setIsSubmitting(false);
          return;
        }
        finalNum = rmMetrics.num;
        finalDen = rmMetrics.den || 1;
      } else if (radiologiMode) {
        const radMetrics = computeRadiologiMetrics(radiologiBundle, radiologiMode);
        if (radiologiMode === "thorax_wt") {
          if (radMetrics.filledThorax.length === 0) {
            alert(
              "Data Waktu Tunggu Pelayanan Thorax Foto masih kosong. Isi atau paste minimal 1 baris pasien pada sheet Thorax Foto.",
            );
            setIsSubmitting(false);
            return;
          }
          const isValidThorax = radMetrics.filledThorax.every(
            (r) =>
              r.tanggal &&
              r.no_rm_nama.trim() !== "" &&
              r.visit.trim() !== "" &&
              r.visit_exp.trim() !== "" &&
              r.kurang_180 !== null,
          );
          if (!isValidThorax) {
            alert(
              "Data Thorax Foto belum lengkap. Pastikan Tgl, NO RM/NAMA, VISIT, VISIT EXP, dan perhitungan interval terisi.",
            );
            setIsSubmitting(false);
            return;
          }
        } else if (radiologiMode === "tindakan_ekspertisi") {
          if (radMetrics.filledTindakan.length === 0) {
            alert(
              "Data Tindakan Radiologi / Ekspertisi masih kosong. Isi minimal 1 baris tindakan pasien.",
            );
            setIsSubmitting(false);
            return;
          }
        } else if (radiologiMode === "reject_analisis") {
          const totalPasien =
            Number(radiologiBundle.reject_total_pasien) ||
            radMetrics.totalExamFromSheet ||
            radMetrics.filledTindakan.length;
          if (radMetrics.filledReject.length === 0 && totalPasien <= 0) {
            alert(
              "Data Reject Analisis masih kosong. Isi Total Pasien Radiologi (atau sheet Jumlah Pemeriksaan Radiologi) maupun daftar penolakan film.",
            );
            setIsSubmitting(false);
            return;
          }
        }
        finalNum = radMetrics.num;
        finalDen = radMetrics.den || 1;
      } else if (prognasIndicatorType) {
        if (prognasData.target_count === "" || prognasData.capaian_count === "") {
          alert(
            "Data Mutu Prognas belum lengkap. Pastikan angka Target dan Capaian sudah diisi (isi 0 bila nihil).",
          );
          setIsSubmitting(false);
          return;
        }
        const pStats = computePrognasStats(prognasData);
        finalNum = pStats.num;
        finalDen = pStats.den || 1;
      } else if (isWaktuTungguRacikan) {
        if (racikanGrid.length === 0) {
          alert("Data Waktu Tunggu Pelayanan Obat Racikan masih kosong. Tambahkan minimal 1 pasien terlebih dahulu.");
          setIsSubmitting(false);
          return;
        }
        const isValidRacikan = racikanGrid.every(
          (r) =>
            r.tanggal &&
            r.no_rm.trim() !== "" &&
            r.nama_pasien.trim() !== "" &&
            r.jam_menyerahkan.trim() !== "" &&
            r.jam_menerima.trim() !== "" &&
            r.sesuai_standar !== null,
        );
        if (!isValidRacikan) {
          alert(
            "Data Waktu Tunggu Obat Racikan belum lengkap. Pastikan Tanggal, No. RM, Nama Pasien, Jam Menyerahkan Resep, dan Jam Menerima Resep terisi.",
          );
          setIsSubmitting(false);
          return;
        }
        finalNum = racikanGrid.filter((d) => d.sesuai_standar === true).length;
        finalDen = racikanGrid.length || 1;
      } else if (isHighAlertDoubleCheck) {
        if (highAlertGrid.length === 0) {
          alert("Data Double Check Obat High Alert masih kosong. Tambahkan minimal 1 pasien terlebih dahulu.");
          setIsSubmitting(false);
          return;
        }
        const isValidHa = highAlertGrid.every(
          (r) =>
            r.tanggal &&
            r.no_rm.trim() !== "" &&
            r.nama_pasien.trim() !== "" &&
            r.double_check !== "" &&
            r.dokumentasi_lengkap !== "" &&
            r.hasil !== "",
        );
        if (!isValidHa) {
          alert(
            "Data Double Check Obat High Alert belum lengkap. Pastikan Tanggal, No. RM, Nama Pasien, Double Check, Dokumentasi Lengkap, dan Hasil terisi.",
          );
          setIsSubmitting(false);
          return;
        }
        finalNum = highAlertGrid.filter((d) => d.hasil === "Patuh").length;
        finalDen = highAlertGrid.length || 1;
      } else if (isKekosonganObat) {
        if (kekosonganObatGrid.length === 0) {
          alert("Data Kejadian Kekosongan Obat Essensial masih kosong. Tambahkan minimal 1 baris data terlebih dahulu.");
          setIsSubmitting(false);
          return;
        }
        const maxDenomObat = Math.max(
          0,
          ...kekosonganObatGrid.map((r) => Number(r.jumlah_seluruh_obat) || 0),
        );
        const isValidKosong = kekosonganObatGrid.every(
          (r) =>
            r.tanggal &&
            r.jenis_obat_kosong.trim() !== "" &&
            r.jumlah_kosong !== "" &&
            Number(r.jumlah_kosong) >= 0,
        );
        if (!isValidKosong || maxDenomObat <= 0) {
          alert(
            "Data Kekosongan Obat Essensial belum lengkap. Pastikan Tanggal, Jenis Obat Kosong (ketik 'Nihil' jika 0), dan Jumlah Seluruh Obat Essensial (> 0) terisi.",
          );
          setIsSubmitting(false);
          return;
        }
        finalNum = kekosonganObatGrid.reduce(
          (acc, curr) => acc + (Number(curr.jumlah_kosong) || 0),
          0,
        );
        finalDen = maxDenomObat;
      } else if (isSBAR) {
        if (sbarGrid.length === 0) {
          alert("Data Dokumen SBAR masih kosong. Tambahkan minimal 1 baris pasien terlebih dahulu.");
          setIsSubmitting(false);
          return;
        }
        const isValidSbar = sbarGrid.every(
          (r) =>
            r.tanggal &&
            r.no_rm.trim() !== "" &&
            r.nama_pasien.trim() !== "" &&
            r.tanggal_konsul &&
            r.situation !== "" &&
            r.background !== "" &&
            r.assesment !== "" &&
            r.recomendation !== "" &&
            r.verifikasi !== "",
        );
        if (!isValidSbar) {
          alert(
            "Data Dokumen SBAR belum lengkap. Pastikan Tanggal, No. RM, Nama Pasien, Tanggal Konsul, dan seluruh kolom S-B-A-R + Verifikasi terisi.",
          );
          setIsSubmitting(false);
          return;
        }
        finalNum = sbarGrid.filter(
          (d) =>
            d.situation === "Ya" &&
            d.background === "Ya" &&
            d.assesment === "Ya" &&
            d.recomendation === "Ya" &&
            d.verifikasi === "Ya",
        ).length;
        finalDen = sbarGrid.length || 1;
      } else if (isPenundaanOperasi) {
        if (penundaanGrid.length === 0) {
          alert("Data Penundaan Operasi Elektif masih kosong. Tambahkan minimal 1 pasien terlebih dahulu.");
          setIsSubmitting(false);
          return;
        }
        const isValidPenundaan = penundaanGrid.every(
          (r) =>
            r.tanggal &&
            r.no_rm.trim() !== "" &&
            r.nama_pasien.trim() !== "" &&
            r.jam_rencana.trim() !== "" &&
            r.jam_pelaksanaan.trim() !== "" &&
            r.tertunda_lebih_60 !== null,
        );
        if (!isValidPenundaan) {
          alert(
            "Data Penundaan Operasi Elektif belum lengkap. Pastikan Tanggal, No. RM, Nama Pasien, Jam Rencana, dan Jam Pelaksanaan terisi.",
          );
          setIsSubmitting(false);
          return;
        }
        finalNum = penundaanGrid.filter((d) => d.tertunda_lebih_60 === true).length;
        finalDen = penundaanGrid.length || 1;
      } else if (isSurgicalSafety) {
        if (sscGrid.length === 0) {
          alert("Data Surgical Safety Checklist masih kosong. Tambahkan minimal 1 pasien terlebih dahulu.");
          setIsSubmitting(false);
          return;
        }
        const isValidSsc = sscGrid.every(
          (r) =>
            r.tanggal &&
            r.no_rm.trim() !== "" &&
            r.nama_pasien.trim() !== "" &&
            r.sign_in !== "" &&
            r.time_out !== "" &&
            r.sign_out !== "",
        );
        if (!isValidSsc) {
          alert(
            "Data Surgical Safety Checklist belum lengkap. Pastikan Tanggal, No. RM, Nama Pasien, Sign In, Time Out, dan Sign Out terisi.",
          );
          setIsSubmitting(false);
          return;
        }
        finalNum = sscGrid.filter(
          (d) =>
            d.sign_in === "Ya" &&
            d.time_out === "Ya" &&
            d.sign_out === "Ya",
        ).length;
        finalDen = sscGrid.length || 1;
      } else if (isPembatalanOperasi) {
        if (pembatalanGrid.length === 0) {
          alert("Data Pembatalan Operasi Elektif masih kosong. Tambahkan minimal 1 baris data terlebih dahulu.");
          setIsSubmitting(false);
          return;
        }
        const maxDenOp = Math.max(
          0,
          ...pembatalanGrid.map((r) => Number(r.jumlah_seluruh_operasi) || 0),
        );
        const isValidBatal = pembatalanGrid.every(
          (r) =>
            r.tanggal &&
            r.penyebab_pembatalan.trim() !== "" &&
            r.jumlah_batal !== "" &&
            Number(r.jumlah_batal) >= 0,
        );
        if (!isValidBatal || maxDenOp <= 0) {
          alert(
            "Data Pembatalan Operasi Elektif belum lengkap. Pastikan Tanggal, Penyebab Pembatalan (ketik 'Nihil' jika 0), dan Jumlah Seluruh Operasi Elektif Terjadwal (> 0) terisi.",
          );
          setIsSubmitting(false);
          return;
        }
        finalNum = pembatalanGrid.reduce(
          (acc, curr) => acc + (Number(curr.jumlah_batal) || 0),
          0,
        );
        finalDen = maxDenOp;
      } else if (isPenyediaanDarah) {
        if (penyediaanDarahGrid.length === 0) {
          alert("Data Penyediaan Darah Obstetri & Neonatus masih kosong. Tambahkan minimal 1 pasien terlebih dahulu.");
          setIsSubmitting(false);
          return;
        }
        const isValidDarah = penyediaanDarahGrid.every(
          (r) =>
            r.tanggal &&
            r.nama_pasien.trim() !== "" &&
            r.no_rm.trim() !== "" &&
            r.jenis_darah_banyaknya.trim() !== "" &&
            r.jam_permintaan.trim() !== "" &&
            r.jam_diterima.trim() !== "" &&
            r.terlambat_lebih_60 !== null,
        );
        if (!isValidDarah) {
          alert(
            "Data Penyediaan Darah belum lengkap. Pastikan Tanggal, Nama Pasien, No. RM, Jenis/Banyaknya Darah, Jam Permintaan, dan Jam Darah Diterima terisi.",
          );
          setIsSubmitting(false);
          return;
        }
        finalNum = penyediaanDarahGrid.filter(
          (d) => d.terlambat_lebih_60 === true,
        ).length;
        finalDen = penyediaanDarahGrid.length || 1;
      } else if (isImdBayi) {
        if (imdGrid.length === 0) {
          alert("Data IMD Bayi Baru Lahir masih kosong. Tambahkan minimal 1 baris data terlebih dahulu.");
          setIsSubmitting(false);
          return;
        }
        const isValidImd = imdGrid.every(
          (r) =>
            r.tanggal &&
            r.nama_bayi.trim() !== "" &&
            r.no_rm.trim() !== "" &&
            r.imd !== "",
        );
        if (!isValidImd) {
          alert(
            "Data IMD Bayi Baru Lahir belum lengkap. Pastikan Tanggal, Nama, No. RM, dan pilihan IMD (Ya/Tidak) terisi pada setiap baris.",
          );
          setIsSubmitting(false);
          return;
        }
        const yaCount = imdGrid.filter((d) => d.imd === "Ya").length;
        const tidakCount = imdGrid.filter((d) => d.imd === "Tidak").length;
        const maxLahir = Math.max(
          0,
          ...imdGrid.map((r) => Number(r.jumlah_bayi_lahir) || 0),
        );
        if (maxLahir > imdGrid.length && yaCount === 0 && tidakCount > 0) {
          finalNum = Math.max(0, maxLahir - tidakCount);
          finalDen = maxLahir;
        } else {
          finalNum = yaCount;
          finalDen = Math.max(imdGrid.length, maxLahir) || 1;
        }
      } else if (kematianConfig) {
        if (kematianGrid.length === 0) {
          alert(`Data ${kematianConfig.tableTitle} masih kosong. Tambahkan minimal 1 baris data terlebih dahulu.`);
          setIsSubmitting(false);
          return;
        }
        const maxPop = Math.max(
          0,
          ...kematianGrid.map((r) => Number(r.jumlah_populasi) || 0),
        );
        const isValidKem = kematianGrid.every(
          (r) =>
            r.tanggal &&
            r.nama_pasien.trim() !== "" &&
            r.jumlah_kematian !== "" &&
            Number(r.jumlah_kematian) >= 0,
        );
        if (!isValidKem || maxPop <= 0) {
          alert(
            `Data belum lengkap. Pastikan Tanggal, Nama Pasien (atau klik Nihil 0 Kematian), dan ${kematianConfig.populationLabel} (> 0) terisi.`,
          );
          setIsSubmitting(false);
          return;
        }
        finalNum = kematianGrid.reduce(
          (acc, curr) => acc + (Number(curr.jumlah_kematian) || 0),
          0,
        );
        finalDen = maxPop;
      } else if (isPengkajianNyeriIcu) {
        if (pengkajianNyeriGrid.length === 0) {
          alert("Data Pengkajian Nyeri ICU masih kosong. Tambahkan minimal 1 pasien terlebih dahulu.");
          setIsSubmitting(false);
          return;
        }
        const isValidNyeri = pengkajianNyeriGrid.every(
          (r) =>
            r.tanggal &&
            r.no_rm.trim() !== "" &&
            r.nama_pasien.trim() !== "" &&
            r.asesmen_awal_nyeri !== "" &&
            r.asesmen_ulang_nyeri !== "",
        );
        if (!isValidNyeri) {
          alert(
            "Data Pengkajian Nyeri ICU belum lengkap. Pastikan Tanggal, No. RM, Nama Pasien, Asesmen Awal Nyeri, dan Asesmen Ulang Nyeri terisi.",
          );
          setIsSubmitting(false);
          return;
        }
        finalNum = pengkajianNyeriGrid.filter(
          (d) => d.asesmen_awal_nyeri === "Ya" && d.asesmen_ulang_nyeri === "Ya",
        ).length;
        finalDen = pengkajianNyeriGrid.length || 1;
      } else if (isEmergencyResponTime) {
        if (emergencyResponGrid.length === 0) {
          alert("Data Emergency Respon Time masih kosong. Tambahkan minimal 1 pasien terlebih dahulu.");
          setIsSubmitting(false);
          return;
        }
        const isValidErt = emergencyResponGrid.every(
          (r) =>
            r.tanggal &&
            r.nama_pasien.trim() !== "" &&
            r.no_rm.trim() !== "" &&
            r.jam_reg.trim() !== "" &&
            r.jam_periksa.trim() !== "" &&
            r.respon_kurang_5 !== null,
        );
        if (!isValidErt) {
          alert(
            "Data Emergency Respon Time belum lengkap. Pastikan Tanggal, Nama Pasien, RM, Jam Reg, dan Jam Periksa terisi dengan benar.",
          );
          setIsSubmitting(false);
          return;
        }
        finalNum = emergencyResponGrid.filter((d) => d.respon_kurang_5 === true).length;
        finalDen = emergencyResponGrid.length || 1;
      } else if (isScEmergency) {
        if (scEmergencyGrid.length === 0) {
          alert("Data Waktu Tanggap SC Emergency masih kosong. Tambahkan minimal 1 pasien terlebih dahulu.");
          setIsSubmitting(false);
          return;
        }
        const isValidSc = scEmergencyGrid.every(
          (r) =>
            r.tanggal &&
            r.no_rm.trim() !== "" &&
            r.nama_pasien.trim() !== "" &&
            r.jam_diputuskan.trim() !== "" &&
            r.jam_insisi.trim() !== "" &&
            r.sesuai_standar !== null,
        );
        if (!isValidSc) {
          alert(
            "Data Waktu Tanggap SC Emergency belum lengkap. Pastikan Tanggal, No. RM, Nama Pasien, Jam Diputuskan Operasi, dan Jam Insisi Operasi terisi.",
          );
          setIsSubmitting(false);
          return;
        }
        finalNum = scEmergencyGrid.filter((d) => d.sesuai_standar === true).length;
        finalDen = scEmergencyGrid.length || 1;
      } else if (isKomplikasiPersalinan) {
        if (komplikasiGrid.length === 0) {
          alert("Data Persalinan Dengan Komplikasi masih kosong. Tambahkan minimal 1 pasien terlebih dahulu.");
          setIsSubmitting(false);
          return;
        }
        const isValidKomp = komplikasiGrid.every(
          (r) =>
            r.tanggal &&
            r.no_rm.trim() !== "" &&
            r.nama_pasien.trim() !== "" &&
            r.jenis_komplikasi.trim() !== "" &&
            r.ditangani !== "" &&
            r.dirujuk !== "",
        );
        if (!isValidKomp) {
          alert(
            "Data Persalinan Dengan Komplikasi belum lengkap. Pastikan Tanggal, No. RM, Nama Pasien, Jenis Komplikasi, Ditangani, dan Dirujuk terisi.",
          );
          setIsSubmitting(false);
          return;
        }
        finalNum = komplikasiGrid.filter((d) => d.ditangani === "Ya").length;
        finalDen = komplikasiGrid.length || 1;
      } else if (isHasilKritisLab) {
        if (hasilKritisLabGrid.length === 0) {
          alert("Data Pelaporan Hasil Kritis Laboratorium masih kosong. Tambahkan minimal 1 pasien terlebih dahulu.");
          setIsSubmitting(false);
          return;
        }
        const isValidLabKritis = hasilKritisLabGrid.every(
          (r) =>
            r.tanggal &&
            r.no_rm.trim() !== "" &&
            r.nama_pasien.trim() !== "" &&
            r.jam_keluar.trim() !== "" &&
            r.jam_lapor.trim() !== "" &&
            r.sesuai_standar !== null,
        );
        if (!isValidLabKritis) {
          alert(
            "Data Hasil Kritis Laboratorium belum lengkap. Pastikan Tanggal, No. RM, Nama Pasien, Jam Hasil Keluar, dan Jam Dilaporkan Ke Dokter terisi.",
          );
          setIsSubmitting(false);
          return;
        }
        finalNum = hasilKritisLabGrid.filter((d) => d.sesuai_standar === true).length;
        finalDen = hasilKritisLabGrid.length || 1;
      } else if (isSampelLabTanpaLabel) {
        if (sampelLabGrid.length === 0) {
          alert("Data audit pelabelan sampel laboratorium masih kosong. Tambahkan minimal 1 baris data (atau klik Nihil).");
          setIsSubmitting(false);
          return;
        }
        const isValidSampel = sampelLabGrid.every(
          (r) =>
            r.tanggal &&
            r.unit_pengirim.trim() !== "" &&
            r.nama_pasien_rm.trim() !== "" &&
            r.jenis_spesimen.trim() !== "" &&
            r.label_ada !== "" &&
            r.identitas_lengkap !== "" &&
            r.status_sampel !== "",
        );
        if (!isValidSampel) {
          alert(
            "Data pelabelan sampel laboratorium belum lengkap. Pastikan seluruh kolom (Tanggal, Unit Pengirim, Pasien/No. RM, Jenis Spesimen, Label Ada, Identitas Lengkap, Status Sampel) terisi.",
          );
          setIsSubmitting(false);
          return;
        }
        finalNum = sampelLabGrid.filter(
          (d) =>
            d.label_ada === "Tidak" ||
            d.identitas_lengkap === "Tidak" ||
            d.status_sampel === "Ditolak",
        ).length;
        finalDen =
          Math.max(sampelLabGrid.length, Number(sampelLabTotalDenom) || 0) || 1;
      } else if (isKunjunganKeluarga) {
        if (kunjunganGrid.length === 0) {
          alert("Data kunjungan keluarga masih kosong. Tambahkan minimal 1 baris data terlebih dahulu.");
          setIsSubmitting(false);
          return;
        }
        const isValidKunj = kunjunganGrid.every((r) => {
          const isNihil = r.nama_pengunjung.toLowerCase().includes("nihil");
          return (
            r.tanggal &&
            r.nama_pengunjung.trim() !== "" &&
            r.nama_pasien.trim() !== "" &&
            r.ruangan.trim() !== "" &&
            (isNihil || (r.jam_masuk.trim() !== "" && r.jam_keluar.trim() !== "")) &&
            r.sesuai_jam_kunjungan !== ""
          );
        });
        if (!isValidKunj) {
          alert(
            "Data kunjungan keluarga belum lengkap. Pastikan Tanggal, Nama Pengunjung, Nama Pasien, Ruangan, Jam Masuk/Keluar, dan Status Sesuai Jam Kunjungan terisi.",
          );
          setIsSubmitting(false);
          return;
        }
        finalNum = kunjunganGrid.filter(
          (d) => d.sesuai_jam_kunjungan === "Tidak",
        ).length;
        finalDen =
          Math.max(kunjunganGrid.length, Number(kunjunganTotalDenom) || 0) || 1;
      } else if (isSaranaSanitasi) {
        if (sanitasiGrid.length === 0) {
          alert("Data inspeksi sarana sanitasi masih kosong. Tambahkan minimal 1 baris unit terlebih dahulu.");
          setIsSubmitting(false);
          return;
        }
        const isValidSanitasi = sanitasiGrid.every(
          (r) =>
            r.tanggal &&
            r.unit.trim() !== "" &&
            r.status_fungsi !== "",
        );
        if (!isValidSanitasi) {
          alert(
            "Data sarana sanitasi belum lengkap. Pastikan Tanggal, Unit, dan status Berfungsi Baik / Rusak terisi pada setiap baris.",
          );
          setIsSubmitting(false);
          return;
        }
        finalNum = sanitasiGrid.filter(
          (d) => d.status_fungsi === "Berfungsi Baik",
        ).length;
        finalDen = sanitasiGrid.length || 1;
      } else if (isPengangkutanLimbah) {
        if (limbahGrid.length === 0) {
          alert("Data pengangkutan limbah masih kosong. Tambahkan minimal 1 baris jadwal terlebih dahulu.");
          setIsSubmitting(false);
          return;
        }
        const isValidLimbah = limbahGrid.every(
          (r) =>
            r.tanggal &&
            r.jam_pengangkutan.trim() !== "" &&
            r.unit.trim() !== "" &&
            r.tepat_waktu !== null,
        );
        if (!isValidLimbah) {
          alert(
            "Data pengangkutan limbah belum lengkap. Pastikan Tanggal, Jam Pengangkutan, Unit, dan pilihan Tepat Waktu / Tidak Tepat Waktu terisi.",
          );
          setIsSubmitting(false);
          return;
        }
        finalNum = limbahGrid.filter((d) => d.tepat_waktu === true).length;
        finalDen = limbahGrid.length || 1;
      } else if (isAlatSteril) {
        if (alatSterilGrid.length === 0) {
          alert("Data penyediaan alat steril masih kosong. Tambahkan minimal 1 permintaan terlebih dahulu.");
          setIsSubmitting(false);
          return;
        }
        const isValidSteril = alatSterilGrid.every(
          (r) =>
            r.tanggal &&
            r.nama_ruangan.trim() !== "" &&
            r.jam_permintaan.trim() !== "" &&
            r.jam_diberikan.trim() !== "" &&
            r.sesuai_standar !== null,
        );
        if (!isValidSteril) {
          alert(
            "Data penyediaan alat steril belum lengkap. Pastikan Tanggal, Nama Ruangan/Unit, Jam Permintaan, Jam Diberikan, dan Keterangan Tepat/Tidak Tepat terisi.",
          );
          setIsSubmitting(false);
          return;
        }
        finalNum = alatSterilGrid.filter((d) => d.sesuai_standar === true).length;
        finalDen = alatSterilGrid.length || 1;
      } else if (isPenyediaanLinen) {
        if (linenGrid.length === 0) {
          alert("Data penyediaan linen rawat inap masih kosong. Tambahkan minimal 1 permintaan terlebih dahulu.");
          setIsSubmitting(false);
          return;
        }
        const isValidLinen = linenGrid.every(
          (r) =>
            r.tanggal &&
            r.nama_ruangan.trim() !== "" &&
            r.jenis_linen.trim() !== "" &&
            r.jam_permintaan.trim() !== "" &&
            r.jam_dikirim.trim() !== "" &&
            r.jam_diterima.trim() !== "" &&
            r.sesuai_standar !== null,
        );
        if (!isValidLinen) {
          alert(
            "Data penyediaan linen belum lengkap. Pastikan Tanggal, Nama Ruangan, Jenis Linen, Jam Permintaan, Jam Dikirim, Jam Diterima, dan status ≤ 30 Menit terisi.",
          );
          setIsSubmitting(false);
          return;
        }
        finalNum = linenGrid.filter((d) => d.sesuai_standar === true).length;
        finalDen = linenGrid.length || 1;
      } else if (isAirBersih24Jam) {
        if (airBersihGrid.length === 0) {
          alert("Data monitoring air bersih masih kosong. Tambahkan minimal 1 baris data (atau klik Nihil Gangguan) terlebih dahulu.");
          setIsSubmitting(false);
          return;
        }
        const isValidAir = airBersihGrid.every(
          (r) =>
            r.tanggal &&
            r.unit.trim() !== "" &&
            r.durasi_gangguan_jam >= 0 &&
            r.durasi_gangguan_jam <= 24,
        );
        if (!isValidAir) {
          alert(
            "Data monitoring air bersih belum lengkap. Pastikan Tanggal dan Unit / Area Pengamatan terisi.",
          );
          setIsSubmitting(false);
          return;
        }
        finalNum = Number(
          airBersihGrid
            .reduce((acc, curr) => acc + (Number(curr.jam_tersedia) || 0), 0)
            .toFixed(2),
        );
        finalDen = airBersihGrid.length * 24;
      } else if (isClinicalPathway) {
        if (clinicalPathwayGrid.length === 0) {
          alert("Data Clinical Pathway masih kosong. Tambahkan minimal 1 baris pasien terlebih dahulu.");
          setIsSubmitting(false);
          return;
        }
        const isValidCp = clinicalPathwayGrid.every(
          (r) =>
            r.tanggal &&
            r.nama_pasien.trim() !== "" &&
            r.no_rm.trim() !== "" &&
            r.nama_dpjp.trim() !== "" &&
            r.los !== "" &&
            r.obat !== "" &&
            r.penunjang !== "" &&
            r.keterangan !== "",
        );
        if (!isValidCp) {
          alert(
            "Data Clinical Pathway belum lengkap. Pastikan Tanggal, Nama Pasien, No. RM, Nama DPJP, LOS, Obat, Penunjang, dan Keterangan terisi pada setiap baris.",
          );
          setIsSubmitting(false);
          return;
        }
        finalNum = clinicalPathwayGrid.filter((d) => d.keterangan === "Patuh").length;
        finalDen = clinicalPathwayGrid.length || 1;
      } else if (isVerifikasiTelepon) {
        if (verifikasiTeleponGrid.length === 0) {
          alert("Data Verifikasi 1x24 Jam masih kosong. Tambahkan minimal 1 baris pasien terlebih dahulu.");
          setIsSubmitting(false);
          return;
        }
        const isValidTelp = verifikasiTeleponGrid.every(
          (r) =>
            r.tanggal &&
            r.no_rm.trim() !== "" &&
            r.nama_pasien.trim() !== "" &&
            r.jam_instruksi.trim() !== "" &&
            r.jam_verifikasi.trim() !== "" &&
            r.terverifikasi_24jam !== null,
        );
        if (!isValidTelp) {
          alert(
            "Data Verifikasi 1x24 Jam belum lengkap. Pastikan Tanggal, No. RM, Nama Pasien, Jam Instruksi, Jam Verifikasi DPJP, dan Keterangan Sesuai/Tidak terisi.",
          );
          setIsSubmitting(false);
          return;
        }
        finalNum = verifikasiTeleponGrid.filter(
          (d) => d.terverifikasi_24jam === true,
        ).length;
        finalDen = verifikasiTeleponGrid.length || 1;
      } else if (yaTidakConfig) {
        if (yaTidakGrid.length === 0) {
          alert("Data observasi pasien masih kosong. Tambahkan minimal 1 baris pasien terlebih dahulu.");
          setIsSubmitting(false);
          return;
        }
        const isValidYaTidak = yaTidakGrid.every(
          (r) =>
            r.tanggal &&
            r.no_rm.trim() !== "" &&
            r.nama_pasien.trim() !== "" &&
            (r.status_ya || r.status_tidak),
        );
        if (!isValidYaTidak) {
          alert(
            "Data observasi pasien belum lengkap. Pastikan Tanggal, No. RM, Nama Pasien, dan pilihan Ya/Tidak terisi pada setiap baris.",
          );
          setIsSubmitting(false);
          return;
        }
        finalNum = yaTidakGrid.filter((d) => d.status_ya).length;
        finalDen = yaTidakGrid.length || 1;
      } else if (
        customNumerator !== undefined &&
        customDenominator !== undefined
      ) {
        finalNum = customNumerator;
        finalDen = customDenominator;
      }
    }

    let computedCapaian = 0;
    if (selectedIndikatorProfile) {
      const unit = selectedIndikatorProfile.measurement_unit;
      if (unit === "Indeks" || unit === "Rasio") {
        // Handle old "Rasio" values just in case
        computedCapaian = Number(
          ((finalNum / (finalDen || 1)) * 25).toFixed(2),
        );
      } else if (unit === "Jumlah Kasus") {
        computedCapaian = finalNum;
      } else if (["Menit", "Jam", "Hari"].includes(unit)) {
        computedCapaian = Number((finalNum / (finalDen || 1)).toFixed(2));
      } else {
        computedCapaian = Number(
          ((finalNum / (finalDen || 1)) * 100).toFixed(2),
        );
      }
    } else {
      computedCapaian = Number(((finalNum / (finalDen || 1)) * 100).toFixed(2));
    }
    if (isNaN(computedCapaian)) computedCapaian = 0;

    const inferredDate =
      (isVisiteDokter && visiteGrid[0]?.tanggal) ||
      (isRisikoJatuh && jatuhGrid[0]?.tanggal) ||
      (isIdentifikasiPasien && identifikasiGrid[0]?.tanggal_observasi) ||
      (isWaktuTunggu && (waktuTungguGrid.find(isRajalRowFilled)?.tanggal || waktuTungguGrid[0]?.tanggal)) ||
      (isRekamMedis && (rekamMedisBundle.kelengkapan_24jam.find((r) => r.no_rm || r.nama_pasien)?.tanggal || rekamMedisBundle.kelengkapan_24jam[0]?.tanggal)) ||
      (radiologiMode && (
        radiologiBundle.thorax_waktu_tunggu.find((r) => r.no_rm_nama)?.tanggal ||
        radiologiBundle.tindakan_ekspertisi.find((r) => r.no_rm_nama)?.tanggal ||
        radiologiBundle.reject_analisis.find((r) => r.nama_pasien)?.tanggal ||
        getDefaultInputDate()
      )) ||
      (prognasIndicatorType && prognasData.tanggal) ||
      (isWaktuTungguRacikan && racikanGrid[0]?.tanggal) ||
      (isHighAlertDoubleCheck && highAlertGrid[0]?.tanggal) ||
      (isKekosonganObat && kekosonganObatGrid[0]?.tanggal) ||
      (isSBAR && sbarGrid[0]?.tanggal) ||
      (isPenundaanOperasi && penundaanGrid[0]?.tanggal) ||
      (isSurgicalSafety && sscGrid[0]?.tanggal) ||
      (isPembatalanOperasi && pembatalanGrid[0]?.tanggal) ||
      (isPenyediaanDarah && penyediaanDarahGrid[0]?.tanggal) ||
      (isImdBayi && imdGrid[0]?.tanggal) ||
      (kematianConfig && kematianGrid[0]?.tanggal) ||
      (isPengkajianNyeriIcu && pengkajianNyeriGrid[0]?.tanggal) ||
      (isEmergencyResponTime && emergencyResponGrid[0]?.tanggal) ||
      (isScEmergency && scEmergencyGrid[0]?.tanggal) ||
      (isKomplikasiPersalinan && komplikasiGrid[0]?.tanggal) ||
      (isHasilKritisLab && hasilKritisLabGrid[0]?.tanggal) ||
      (isSampelLabTanpaLabel && sampelLabGrid[0]?.tanggal) ||
      (isKunjunganKeluarga && kunjunganGrid[0]?.tanggal) ||
      (isSaranaSanitasi && sanitasiGrid[0]?.tanggal) ||
      (isPengangkutanLimbah && limbahGrid[0]?.tanggal) ||
      (isAlatSteril && alatSterilGrid[0]?.tanggal) ||
      (isPenyediaanLinen && linenGrid[0]?.tanggal) ||
      (isAirBersih24Jam && airBersihGrid[0]?.tanggal) ||
      (isClinicalPathway && clinicalPathwayGrid[0]?.tanggal) ||
      (isVerifikasiTelepon && verifikasiTeleponGrid[0]?.tanggal) ||
      (yaTidakConfig && yaTidakGrid[0]?.tanggal) ||
      data.tanggal ||
      new Date().toISOString().split("T")[0];

    const filledRajalRows = isWaktuTunggu ? waktuTungguGrid.filter(isRajalRowFilled) : [];
    const filledRajalPolis = isWaktuTunggu
      ? RAJAL_SHEET_POLIS.filter((p) =>
          filledRajalRows.some((r) => (r.poli || activeRajalSheet) === p),
        )
      : [];
    const effectiveRajalSubUnit =
      selectedSubUnit ||
      (filledRajalPolis.length === 1
        ? `Poli ${filledRajalPolis[0]}`
        : filledRajalPolis.length > 1
          ? `Multi Poli (${filledRajalPolis.join(", ")})`
          : "");

    const payload: DataMutuPayload = {
      id: Math.random().toString(36).substring(7),
      unit: data.unit + (effectiveRajalSubUnit ? ` - ${effectiveRajalSubUnit}` : ""),
      tanggal: inferredDate,
      kategori: data.kategori,
      indikator_id: data.indikator_id || undefined,
      indikator_name: selectedIndikatorProfile?.indicator_title || undefined,
      numerator: finalNum,
      denominator: finalDen,
      target: selectedIndikatorProfile?.target || undefined,
      capaian: data.kategori === "IKP" ? undefined : computedCapaian,
      status: data.kategori === "IKP" ? "N/A" : (achievementStatus as any),
      keterangan:
        data.keterangan ||
        (prognasIndicatorType && (prognasData.analisa || prognasData.rekomendasi)
          ? [
              prognasData.analisa ? `Analisa: ${prognasData.analisa}` : "",
              prognasData.rekomendasi ? `Rekomendasi: ${prognasData.rekomendasi}` : "",
            ]
              .filter(Boolean)
              .join(" | ")
          : ""),
      kpc: data.kategori === "IKP" ? data.kpc || 0 : undefined,
      knc: data.kategori === "IKP" ? data.knc || 0 : undefined,
      ktc: data.kategori === "IKP" ? data.ktc || 0 : undefined,
      ktd: data.kategori === "IKP" ? data.ktd || 0 : undefined,
      sentinel: data.kategori === "IKP" ? data.sentinel || 0 : undefined,
      visite_details: isVisiteDokter ? [...visiteGrid] : undefined,
      jatuh_details: isRisikoJatuh ? [...jatuhGrid] : undefined,
      identifikasi_details: isIdentifikasiPasien
        ? [...identifikasiGrid]
        : undefined,
      waktu_tunggu_details: isWaktuTunggu ? filledRajalRows : undefined,
      rekam_medis_details: isRekamMedis
        ? stripEmptyRekamMedisRows(rekamMedisBundle)
        : undefined,
      radiologi_details: radiologiMode
        ? stripEmptyRadiologiRows(radiologiBundle)
        : undefined,
      prognas_details: prognasIndicatorType ? { ...prognasData } : undefined,
      racikan_waktu_tunggu_details: isWaktuTungguRacikan
        ? [...racikanGrid]
        : undefined,
      high_alert_details: isHighAlertDoubleCheck
        ? [...highAlertGrid]
        : undefined,
      kekosongan_obat_details: isKekosonganObat
        ? [...kekosonganObatGrid]
        : undefined,
      sbar_details: isSBAR ? [...sbarGrid] : undefined,
      penundaan_operasi_details: isPenundaanOperasi
        ? [...penundaanGrid]
        : undefined,
      surgical_safety_details: isSurgicalSafety ? [...sscGrid] : undefined,
      pembatalan_operasi_details: isPembatalanOperasi
        ? [...pembatalanGrid]
        : undefined,
      penyediaan_darah_details: isPenyediaanDarah
        ? [...penyediaanDarahGrid]
        : undefined,
      imd_bayi_details: isImdBayi ? [...imdGrid] : undefined,
      kematian_ibu_bayi_details: kematianConfig ? [...kematianGrid] : undefined,
      pengkajian_nyeri_details: isPengkajianNyeriIcu
        ? [...pengkajianNyeriGrid]
        : undefined,
      emergency_respon_time_details: isEmergencyResponTime
        ? [...emergencyResponGrid]
        : undefined,
      sc_emergency_details: isScEmergency ? [...scEmergencyGrid] : undefined,
      komplikasi_persalinan_details: isKomplikasiPersalinan
        ? [...komplikasiGrid]
        : undefined,
      hasil_kritis_lab_details: isHasilKritisLab
        ? [...hasilKritisLabGrid]
        : undefined,
      sampel_lab_pelabelan_details: isSampelLabTanpaLabel
        ? sampelLabGrid.map((r) => ({
            ...r,
            jumlah_sampel_diterima:
              Number(sampelLabTotalDenom) || sampelLabGrid.length,
          }))
        : undefined,
      kunjungan_keluarga_details: isKunjunganKeluarga
        ? kunjunganGrid.map((r) => ({
            ...r,
            total_kunjungan_keluarga:
              Number(kunjunganTotalDenom) || kunjunganGrid.length,
          }))
        : undefined,
      sarana_sanitasi_details: isSaranaSanitasi ? [...sanitasiGrid] : undefined,
      pengangkutan_limbah_details: isPengangkutanLimbah
        ? [...limbahGrid]
        : undefined,
      penyediaan_alat_steril_details: isAlatSteril
        ? [...alatSterilGrid]
        : undefined,
      penyediaan_linen_details: isPenyediaanLinen ? [...linenGrid] : undefined,
      ketersediaan_air_details: isAirBersih24Jam
        ? [...airBersihGrid]
        : undefined,
      clinical_pathway_details: isClinicalPathway
        ? [...clinicalPathwayGrid]
        : undefined,
      verifikasi_telepon_details: isVerifikasiTelepon
        ? [...verifikasiTeleponGrid]
        : undefined,
      ya_tidak_details: yaTidakConfig ? [...yaTidakGrid] : undefined,
    };

    // 1. Save locally in Zustand instantly (Optimistic update)
    addDataMutu(payload);
    setDbSavedEntries((prev) => [
      ...prev,
      {
        unit_id: payload.unit,
        category_id: data.kategori,
        indicator_id: data.indikator_id || undefined,
        input_date: inferredDate,
      },
    ]);

    // 2. Perform background Supabase inserts securely (No blocking if fails)
    try {
      await supabase.from("indicator_inputs").insert({
        id: payload.id,
        unit_id: payload.unit,
        sub_unit: effectiveRajalSubUnit || null,
        category_id: data.kategori,
        indicator_id: data.indikator_id || null,
        input_date: inferredDate,
        numerator_value: finalNum,
        denominator_value: finalDen,
        target: selectedIndikatorProfile?.target || null,
        achievement_percentage:
          data.kategori === "IKP" ? null : computedCapaian,
        notes: JSON.stringify({
          kpc: payload.kpc,
          knc: payload.knc,
          ktc: payload.ktc,
          ktd: payload.ktd,
          sentinel: payload.sentinel,
          keterangan: payload.keterangan || data.keterangan,
          visite_details: payload.visite_details,
          jatuh_details: payload.jatuh_details,
          identifikasi_details: payload.identifikasi_details,
          waktu_tunggu_details: payload.waktu_tunggu_details,
          rekam_medis_details: payload.rekam_medis_details,
          radiologi_details: payload.radiologi_details,
          prognas_details: payload.prognas_details,
          racikan_waktu_tunggu_details: payload.racikan_waktu_tunggu_details,
          high_alert_details: payload.high_alert_details,
          kekosongan_obat_details: payload.kekosongan_obat_details,
          sbar_details: payload.sbar_details,
          penundaan_operasi_details: payload.penundaan_operasi_details,
          surgical_safety_details: payload.surgical_safety_details,
          pembatalan_operasi_details: payload.pembatalan_operasi_details,
          penyediaan_darah_details: payload.penyediaan_darah_details,
          imd_bayi_details: payload.imd_bayi_details,
          kematian_ibu_bayi_details: payload.kematian_ibu_bayi_details,
          pengkajian_nyeri_details: payload.pengkajian_nyeri_details,
          emergency_respon_time_details: payload.emergency_respon_time_details,
          sc_emergency_details: payload.sc_emergency_details,
          komplikasi_persalinan_details: payload.komplikasi_persalinan_details,
          hasil_kritis_lab_details: payload.hasil_kritis_lab_details,
          sampel_lab_pelabelan_details: payload.sampel_lab_pelabelan_details,
          kunjungan_keluarga_details: payload.kunjungan_keluarga_details,
          sarana_sanitasi_details: payload.sarana_sanitasi_details,
          pengangkutan_limbah_details: payload.pengangkutan_limbah_details,
          penyediaan_alat_steril_details: payload.penyediaan_alat_steril_details,
          penyediaan_linen_details: payload.penyediaan_linen_details,
          ketersediaan_air_details: payload.ketersediaan_air_details,
          clinical_pathway_details: payload.clinical_pathway_details,
          verifikasi_telepon_details: payload.verifikasi_telepon_details,
          ya_tidak_details: payload.ya_tidak_details,
        }),
        attachment_url: uploadedProofName || null,
        created_at: new Date().toISOString(),
      });

      // Simpan rincian data visite ke tabel visite_dpjp jika applicable
      if (isVisiteDokter && visiteGrid.length > 0) {
        const visitePayload = visiteGrid.map((v) => ({
          tanggal_visite: v.tanggal,
          nama_pasien: v.nama_pasien,
          visite_sebelum_14: v.jam_visite_kurang_14,
          visite_setelah_14: v.jam_visite_lebih_14,
          nama_dokter: v.dokter_visite,
          keterangan:
            v.keterangan ||
            (v.jam_visite_kurang_14 ? "Sesuai Jadwal" : "Tidak Sesuai Jadwal"),
          indikator_id: data.indikator_id || null,
        }));
        try {
          await supabase.from("visite_dpjp").insert(visitePayload);
        } catch (e) {
          console.warn("Failed saving into visite_dpjp:", e);
        }
      }

      // Simpan rincian data waktu tunggu ke tabel waktu_tunggu_rajal
      if (isWaktuTunggu && filledRajalRows.length > 0) {
        const wtPayload = filledRajalRows.map((v) => ({
          tanggal: v.tanggal,
          nama_pasien: v.nama_pasien,
          no_rm: v.no_rm,
          jam_datang: v.jam_datang,
          jam_dilayani: v.jam_dilayani,
          selisih_menit: v.selisih_menit,
          interval_text: v.interval_text || "",
          poli: v.poli || activeRajalSheet,
          memenuhi_standar: isRajalRowCompliant(v),
          indikator_id: data.indikator_id || null,
        }));
        try {
          await supabase.from("waktu_tunggu_rajal").insert(wtPayload);
        } catch (e) {
          console.warn("Failed saving into waktu_tunggu_rajal:", e);
        }
      }
    } catch (supabaseError) {
      console.warn(
        "Supabase sync skipped - data recorded in local Zustand and memory channels",
        supabaseError,
      );
    }

    // Success notifications and state cleanup
    setIsSubmitting(false);
    setSuccessMsg(true);
    setVisiteGrid([]);
    setJatuhGrid([]);
    setIdentifikasiGrid([]);
    setWaktuTungguGrid([]);
    setActiveRajalSheet("Penyakit Dalam");
    setRekamMedisBundle(createEmptyRekamMedisBundle(getDefaultInputDate()));
    setRadiologiBundle(createEmptyRadiologiBundle(getDefaultInputDate()));
    setPrognasData(createEmptyPrognasData("hiv_aids", getDefaultInputDate()));
    setRacikanGrid([]);
    setHighAlertGrid([]);
    setKekosonganObatGrid([]);
    setSbarGrid([]);
    setPenundaanGrid([]);
    setSscGrid([]);
    setPembatalanGrid([]);
    setPenyediaanDarahGrid([]);
    setImdGrid([]);
    setKematianGrid([]);
    setPengkajianNyeriGrid([]);
    setEmergencyResponGrid([]);
    setScEmergencyGrid([]);
    setKomplikasiGrid([]);
    setHasilKritisLabGrid([]);
    setSampelLabGrid([]);
    setSampelLabTotalDenom("");
    setKunjunganGrid([]);
    setKunjunganTotalDenom("");
    setSanitasiGrid([]);
    setLimbahGrid([]);
    setAlatSterilGrid([]);
    setLinenGrid([]);
    setAirBersihGrid([]);
    setClinicalPathwayGrid([]);
    setVerifikasiTeleponGrid([]);
    setYaTidakGrid([]);
    setCustomNumerator(undefined);
    setCustomDenominator(undefined);
    setAverageWaktuTunggu(undefined);
    setUploadedProofName("");

    if (isGuidedUnit && selectedUnit) {
      // Preserve selected guided unit so nurse can continue filling the next Mutu point
      reset({
        unit: data.unit,
        sub_unit: data.sub_unit || "",
        tanggal: data.tanggal,
        kategori: data.kategori,
        indikator_id: "",
        numerator_val: undefined,
        denominator_val: undefined,
        kpc: 0,
        knc: 0,
        ktc: 0,
        ktd: 0,
        sentinel: 0,
        keterangan: "",
        bukti_file_name: "",
      });
      setTimeout(() => {
        checklistRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 150);
    } else {
      // Reset standard fields
      reset({
        unit: "",
        sub_unit: "",
        tanggal: new Date().toISOString().split("T")[0],
        kategori: data.kategori,
        indikator_id: "",
        numerator_val: undefined,
        denominator_val: undefined,
        kpc: 0,
        knc: 0,
        ktc: 0,
        ktd: 0,
        sentinel: 0,
        keterangan: "",
        bukti_file_name: "",
      });

      setUnitSearch("");
      setSelectedUnit(null);
      setSelectedSubUnit("");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    setTimeout(() => setSuccessMsg(false), 5000);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 max-w-7xl mx-auto space-y-6 pb-16">
      {/* Welcome Hero Greeting Banner - Presisi & Tajam Sebagaimana Profil Indikator */}
      <div id="input-header-panel" className="relative pt-0 group">
        {/* Card Main Body (Clipped inside rounded-3xl border - Exact Dashboard & Profil Dimensions) */}
        <div className="bg-white rounded-3xl border border-emerald-200/60 drop-shadow-card p-4 sm:p-5 md:py-5 md:px-6 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-4 min-h-[152px] sm:min-h-[162px] transition-all duration-300">
          {/* Top Edge Highlight Line */}
          <div className="absolute top-0 left-8 right-8 h-[1.5px] bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent pointer-events-none" />

          {/* 3D Animated Hospital Background (RSUD AL-MULK) - Original Vibrant Colors */}
          <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-[55%] xl:w-[50%] pointer-events-none z-0 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/uploads/hospital_background_3d.png?v=3"
              alt="Gedung RSUD Al-Mulk 3D Animation"
              className="w-full h-full object-cover object-[center_35%] opacity-100 select-none"
            />
          </div>

          {/* Left Side: Real Vector Typography & Description with Accent Bar (Teks Tajam, Jelas, & Kontras Sempurna) */}
          <div className="relative z-10 flex items-start gap-3.5 md:gap-4 flex-1 min-w-0 w-full lg:max-w-[60%] xl:max-w-[62%]">
            {/* Vertical Green Accent Bar */}
            <div className="w-1.5 self-stretch bg-gradient-to-b from-[#10a37f] via-[#059669] to-[#007A4D] rounded-full shrink-0 shadow-[0_0_12px_rgba(16,163,127,0.4)]" />

            <div className="space-y-1.5 sm:space-y-2 min-w-0">
              <h1 className="text-2xl sm:text-3xl md:text-[31px] font-extrabold text-[#007A4D] tracking-tight leading-tight">
                Input Data Mutu RS
              </h1>

              <p className="text-xs sm:text-[13px] md:text-sm font-bold text-slate-800 leading-snug pt-0.5 whitespace-nowrap">
                Pencatatan Capaian INM, IMP-RS, IMP-Unit, dan SPM RSUD Al-Mulk
              </p>

              <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed italic max-w-xl">
                &quot;Sistem penginputan data terintegrasi secara realtime, akurat, dan transparan untuk mendukung peningkatan mutu pelayanan berkelanjutan di UOBK RSUD Al-Mulk.&quot;
              </p>
            </div>
          </div>

          {/* Spacer on Desktop for the 3D Pop-Out Characters (Matching Dashboard Sizing) */}
          <div className="hidden lg:block w-[320px] xl:w-[370px] shrink-0" />
        </div>

        {/* 3D Out-of-Bounds Pop-Out Nurses Layer (Transparan, Sama Persis dengan Dashboard) */}
        <div className="relative lg:absolute lg:bottom-[1px] lg:right-5 xl:right-8 z-20 flex justify-center lg:justify-end mt-2 lg:mt-0 pointer-events-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/uploads/input_nurses_canva_popout.png?v=5"
            alt="Tim Perawat Input Data Mutu RSUD Al-Mulk"
            className="h-[135px] sm:h-[148px] lg:h-[158px] xl:h-[166px] w-auto object-contain object-bottom drop-shadow-[0_8px_16px_rgba(0,95,58,0.18)] transition-transform duration-500 group-hover:scale-[1.03] origin-bottom"
          />
        </div>
      </div>

      {/* Primary Input Panel */}
      <div className="bg-[#f8fafc] rounded-[32px] shadow-[12px_12px_28px_rgba(160,175,195,0.22),-12px_-12px_28px_rgba(255,255,255,0.95)] border border-white/80 p-8 md:p-10 space-y-8">
        {successMsg && (
          <div className="p-5 bg-emerald-50 text-emerald-800 rounded-2xl flex items-center gap-3 border border-emerald-100/75 animate-in fade-in duration-500">
            <div className="bg-emerald-600 text-white p-1 rounded-full">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <span className="font-extrabold block text-sm">
                Data Berhasil Disimpan!
              </span>
              <span className="text-xs text-emerald-700/90 font-medium mt-0.5 block">
                Sistem berhasil mengamankan record baru Anda di database dan
                menyinkronkan seluruh visual grafik dashboard secara instan.
              </span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* STEP 1: PILIH UNIT (Tanggal ditangani langsung di dalam masing-masing tabel mutu) */}
          <div className="w-full">
            {/* Pilih Unit Selector */}
            <div
              className="space-y-3 relative animate-in fade-in duration-300"
              ref={unitDropdownRef}
            >
              <label className="flex items-center justify-between text-sm font-extrabold text-slate-800 tracking-wide h-8">
                <span>Pilih Unit</span>

                {/* Admin-only Add Room trigger */}
                <button
                  type="button"
                  onClick={handleOpenAddRoom}
                  className="text-xs font-black text-[#10a37f] hover:text-emerald-800 flex items-center justify-center bg-emerald-50 hover:bg-emerald-100/80 px-2 py-1 rounded-lg border border-emerald-100 transition-colors w-7 h-7 shadow-[2px_2px_5px_rgba(160,175,195,0.25),-2px_-2px_5px_rgba(255,255,255,0.9)]"
                  title="Tambah Ruangan"
                >
                  <Plus size={14} className="stroke-[3]" />
                </button>
              </label>

              {/* Custom Searchable Select Container */}
              <div className="relative">
                <div
                  onClick={() => setShowUnitDropdown(!showUnitDropdown)}
                  className="w-full h-[56px] px-5 rounded-2xl border border-slate-200/90 outline-none transition-all text-slate-800 bg-[#f8fafc] hover:bg-[#f1f5f9] cursor-pointer flex items-center justify-between shadow-[inset_3px_3px_6px_rgba(160,175,195,0.32),inset_-3px_-3px_6px_rgba(255,255,255,0.95)] select-none focus-within:border-[#10a37f] focus-within:shadow-[inset_4px_4px_8px_rgba(140,160,180,0.4),inset_-4px_-4px_8px_rgba(255,255,255,1)]"
                >
                  <span
                    className={
                      selectedUnit
                        ? "text-slate-900 text-sm font-semibold"
                        : "text-gray-400 text-sm font-medium"
                    }
                  >
                    {selectedUnit ? selectedUnit.name : "Silahkan pilih unit"}
                  </span>
                  <ChevronDown
                    className={`text-gray-400 h-4 w-4 transition-transform duration-200 ${showUnitDropdown ? "rotate-180" : ""}`}
                  />
                </div>

                {showUnitDropdown && (
                  <div className="absolute z-50 left-0 right-0 mt-2 bg-[#f8fafc] border border-white rounded-2xl shadow-[8px_8px_20px_rgba(160,175,195,0.3),-8px_-8px_20px_rgba(255,255,255,0.95)] overflow-hidden animate-in fade-in duration-200 max-h-80 flex flex-col">
                    <div className="p-3 border-b border-slate-200/50 flex items-center gap-2 bg-[#f1f5f9]/70 mx-2 my-2 rounded-xl shadow-[inset_2px_2px_4px_rgba(160,175,195,0.25),inset_-2px_-2px_4px_rgba(255,255,255,0.9)]">
                      <Search size={14} className="text-gray-400" />
                      <input
                        type="text"
                        placeholder="Cari Layanan / Unit..."
                        value={unitSearch}
                        onChange={(e) => setUnitSearch(e.target.value)}
                        className="w-full bg-transparent outline-none text-xs font-semibold text-slate-800 placeholder-gray-400"
                        onClick={(e) => e.stopPropagation()} // protect input click
                      />
                    </div>

                    <div className="overflow-y-auto scroll-smooth flex-1 py-1">
                      {filteredUnits.length === 0 ? (
                        <div className="p-4 text-center text-xs text-gray-400 italic font-medium">
                          Unit tidak ditemukan
                        </div>
                      ) : (
                        filteredUnits.map((u, idx) => (
                          <div
                            key={`${u.id}-${idx}`}
                            onClick={() => {
                              setSelectedUnit(u);
                              setFormValue("unit", u.name, { shouldValidate: true });
                              setShowUnitDropdown(false);
                              setSelectedSubUnit("");
                              setFormValue("sub_unit", "");
                              setAisyahSubMode("");
                              setFormValue("indikator_id", "");
                              setVisiteGrid([]);
                              setJatuhGrid([]);
                              setWaktuTungguGrid([]);
                              setActiveRajalSheet("Penyakit Dalam");
                              setRekamMedisBundle(createEmptyRekamMedisBundle(getDefaultInputDate()));
                              setRadiologiBundle(createEmptyRadiologiBundle(getDefaultInputDate()));
                              setPrognasData(createEmptyPrognasData("hiv_aids", getDefaultInputDate()));
                              setRacikanGrid([]);
                              setHighAlertGrid([]);
                              setKekosonganObatGrid([]);
                              setSbarGrid([]);
                              setPenundaanGrid([]);
                              setSscGrid([]);
                              setPembatalanGrid([]);
                              setPenyediaanDarahGrid([]);
                              setImdGrid([]);
                              setKematianGrid([]);
                              setPengkajianNyeriGrid([]);
                              setEmergencyResponGrid([]);
                              setScEmergencyGrid([]);
                              setKomplikasiGrid([]);
                              setHasilKritisLabGrid([]);
                              setSampelLabGrid([]);
                              setSampelLabTotalDenom("");
                              setKunjunganGrid([]);
                              setKunjunganTotalDenom("");
                              setSanitasiGrid([]);
                              setLimbahGrid([]);
                              setAlatSterilGrid([]);
                              setLinenGrid([]);
                              setAirBersihGrid([]);
                              setClinicalPathwayGrid([]);
                              setVerifikasiTeleponGrid([]);
                              setYaTidakGrid([]);
                            }}
                            className="px-5 py-3 hover:bg-emerald-50/50 cursor-pointer flex items-center justify-between transition-colors group"
                          >
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-950">
                                {u.name}
                              </span>
                              <span className="text-[10px] text-gray-400 font-medium">
                                Kategori: {u.category}
                              </span>
                            </div>

                            {/* Edit/Delete triggers for Admin */}
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={(e) => handleOpenEditRoom(e, u)}
                                className="p-1 text-blue-500 hover:bg-blue-50 rounded-md transition-colors"
                                title="Edit Unit"
                              >
                                <Edit2 size={12} />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => handleDeleteRoom(e, u.id)}
                                className="p-1 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                title="Hapus Unit"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              <input type="hidden" {...register("unit")} />
              <input type="hidden" {...register("tanggal")} />
              {errors.unit && (
                <p className="text-red-500 text-xs font-semibold mt-1">
                  {errors.unit.message}
                </p>
              )}
            </div>
          </div>

          {/* DYNAMIC SUB UNIT: RAWAT JALAN SUB SPECIFICATION (manual mode fallback only) */}
          {selectedUnit?.name === "Rawat Jalan" && !activeUnitBlueprint && (
            <div className="bg-[#f8fafc] border border-white rounded-2xl p-6 space-y-3 shadow-[6px_6px_16px_rgba(160,175,195,0.2),-6px_-6px_16px_rgba(255,255,255,0.95)] animate-in slide-in-from-top-2 duration-300">
              <label className="text-xs font-black text-emerald-950 uppercase tracking-wider">
                Pilih Sub-Pelayanan Poli (Rawat Jalan)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {subUnitsRawatJalan.map((poli) => (
                  <button
                    key={poli}
                    type="button"
                    onClick={() => {
                      setSelectedSubUnit(poli);
                      setFormValue("sub_unit", poli);
                    }}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                      selectedSubUnit === poli
                        ? "bg-emerald-600 text-white border-emerald-700 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.25),inset_-2px_-2px_4px_rgba(255,255,255,0.2)] scale-[1.02]"
                        : "bg-[#f8fafc] text-slate-700 border-slate-200/80 shadow-[3px_3px_6px_rgba(160,175,195,0.25),-3px_-3px_6px_rgba(255,255,255,0.95)] hover:shadow-[1px_1px_3px_rgba(160,175,195,0.2)]"
                    }`}
                  >
                    {poli}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* OPTIONAL QUICK ROOM PICKER IF LEGACY "Ranap Aisyah" IS PICKED */}
          {selectedUnit?.name?.trim().toLowerCase() === "ranap aisyah" && (
            <div className="bg-[#f8fafc] border border-emerald-200/80 rounded-2xl p-5 space-y-3 shadow-[6px_6px_16px_rgba(160,175,195,0.2),-6px_-6px_16px_rgba(255,255,255,0.95)] animate-in slide-in-from-top-2 duration-300">
              <label className="text-xs font-black text-emerald-950 uppercase tracking-wider block">
                Pilih Ruang Spesifik Ranap Aisyah untuk Daftar Mutu Terpandu
              </label>
              <div className="flex flex-wrap gap-3">
                {[
                  { key: "ANAK" as const, label: "Ranap Aisyah Anak (6 Mutu Wajib)" },
                  { key: "BEDAH" as const, label: "Ranap Aisyah Bedah (8 Mutu Wajib)" },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setAisyahSubMode(opt.key)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                      aisyahSubMode === opt.key
                        ? "bg-emerald-600 text-white border-emerald-700 shadow-sm"
                        : "bg-white text-slate-700 border-slate-200 hover:border-emerald-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* GUIDED MANDATORY MUTU CHECKLIST FOR RANAP AISYAH ANAK / BEDAH */}
          {activeUnitBlueprint && (
            <div
              ref={checklistRef}
              className="bg-gradient-to-br from-[#f8fafc] via-white to-emerald-50/40 border border-emerald-200/80 rounded-[28px] p-5 md:p-7 space-y-5 shadow-[8px_8px_22px_rgba(160,175,195,0.22),-8px_-8px_22px_rgba(255,255,255,0.95)] animate-in slide-in-from-top-3 duration-300 scroll-mt-6"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-emerald-100/80 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                      <Sparkles size={16} />
                    </div>
                    <h3 className="text-base md:text-lg font-extrabold text-[#0c2415] tracking-tight">
                      {activeUnitBlueprint.unitTitle}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 font-semibold pl-10">
                    Klik poin indikator mutu di bawah ini untuk langsung diarahkan ke tabel pengisian sesuai format unit.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 pl-10 md:pl-0">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold shadow-2xs">
                    <Building2 size={13} className="text-emerald-600" />
                    Unit: {selectedUnit?.name}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold shadow-2xs">
                    <Calendar size={13} className="text-emerald-600" />
                    Bulan: {formattedBulanLabel}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-extrabold shadow-xs">
                    <CheckCircle2 size={13} />
                    {
                      activeUnitBlueprint.items.filter((item) => {
                        const prof = resolveBlueprintProfile(item);
                        return prof ? guidedCompletionSet.has(prof.id) : false;
                      }).length
                    }{" "}
                    / {activeUnitBlueprint.items.length} Selesai
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeUnitBlueprint.items.map((item) => {
                  const matchedProfile = resolveBlueprintProfile(item);
                  const isActive =
                    !!matchedProfile && watchIndikatorId === matchedProfile.id;
                  const isDone =
                    !!matchedProfile && guidedCompletionSet.has(matchedProfile.id);

                  const badgeStyle =
                    item.badge === "INM"
                      ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                      : item.badge === "IMP-RS"
                        ? "bg-sky-100 text-sky-800 border-sky-200"
                        : item.badge === "SPM"
                          ? "bg-amber-100 text-amber-800 border-amber-200"
                          : "bg-violet-100 text-violet-800 border-violet-200";

                  return (
                    <button
                      key={`${activeBlueprintKey}-${item.order}`}
                      type="button"
                      onClick={() => handleSelectGuidedMutu(item)}
                      className={`group text-left p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-3 ${
                        isActive
                          ? "bg-emerald-600 text-white border-emerald-700 shadow-lg shadow-emerald-600/20 scale-[1.01]"
                          : isDone
                            ? "bg-emerald-50/70 hover:bg-emerald-50 border-emerald-200 text-slate-800 shadow-2xs"
                            : "bg-white hover:bg-emerald-50/40 border-slate-200/90 hover:border-emerald-300 text-slate-800 shadow-xs"
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <span
                          className={`w-7 h-7 shrink-0 rounded-xl flex items-center justify-center text-xs font-black transition-colors ${
                            isActive
                              ? "bg-white text-emerald-700"
                              : isDone
                                ? "bg-emerald-600 text-white"
                                : "bg-slate-100 text-slate-700 group-hover:bg-emerald-100 group-hover:text-emerald-800"
                          }`}
                        >
                          {isDone && !isActive ? <Check size={14} /> : item.order}
                        </span>
                        <div className="space-y-1.5 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-black border ${
                                isActive
                                  ? "bg-white/20 text-white border-white/30"
                                  : badgeStyle
                              }`}
                            >
                              {item.badgeLabel || item.badge}
                            </span>
                            {isDone && (
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                  isActive
                                    ? "bg-emerald-900/40 text-white"
                                    : "bg-emerald-100 text-emerald-800"
                                }`}
                              >
                                <CheckCircle2 size={10} /> Sudah Diinput
                              </span>
                            )}
                          </div>
                          <p
                            className={`text-xs md:text-[13px] font-bold leading-snug ${
                              isActive ? "text-white" : "text-slate-800"
                            }`}
                          >
                            {item.label}
                          </p>
                        </div>
                      </div>

                      <div
                        className={`shrink-0 flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1.5 rounded-xl transition-all ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-slate-100 text-slate-600 group-hover:bg-emerald-600 group-hover:text-white"
                        }`}
                      >
                        <span>{isActive ? "Aktif" : "Isi Tabel"}</span>
                        <ArrowRight size={13} />
                      </div>
                    </button>
                  );
                })}
              </div>

              {errors.indikator_id && (
                <p className="text-red-500 text-xs font-semibold pt-1">
                  Silakan klik salah satu poin indikator mutu pada daftar di atas terlebih dahulu.
                </p>
              )}
            </div>
          )}

          {/* FALLBACK CATEGORY & INDICATOR DROPDOWNS: Hidden on initial load and guided units so ward officers only pick Unit -> Mutu list */}
          {selectedUnit &&
            !activeUnitBlueprint &&
            selectedUnit.name.trim().toLowerCase() !== "ranap aisyah" && (
              <>
                <div className="space-y-3 animate-in fade-in duration-300">
                  <label className="text-sm font-extrabold text-slate-800 tracking-wide font-sans">
                    Pilih Kategori Indikator Mutu
                  </label>
                  <div className="relative">
                    <select
                      value={watchKategori || ""}
                      onChange={(e) => {
                        setFormValue("kategori", e.target.value);
                        setFormValue("indikator_id", "");
                        setUploadedProofName("");
                      }}
                      className="w-full px-5 py-4 rounded-2xl border border-slate-200/90 focus:border-[#10a37f] outline-none transition-all text-slate-800 font-bold bg-[#f8fafc] hover:bg-[#f1f5f9] cursor-pointer shadow-[inset_3px_3px_6px_rgba(160,175,195,0.32),inset_-3px_-3px_6px_rgba(255,255,255,0.95)] focus:shadow-[inset_4px_4px_8px_rgba(140,160,180,0.4),inset_-4px_-4px_8px_rgba(255,255,255,1)] text-sm"
                    >
                      <option value="INM">INM</option>
                      <option value="IMP-RS">IMP-RS</option>
                      <option value="IMP-Unit">IMP-Unit</option>
                      <option value="SPM">SPM</option>
                      <option value="IKP">IKP (Insiden Keselamatan Pasien)</option>
                    </select>
                  </div>
                </div>

                {watchKategori !== "IKP" && (
                  <div className="space-y-3 animate-in fade-in duration-300">
                    <label className="text-sm font-extrabold text-slate-800 tracking-wide font-sans">
                      Pilih Indikator Mutu
                    </label>
                    <div className="relative">
                      <select
                        value={watchIndikatorId || ""}
                        onChange={(e) => {
                          setFormValue("indikator_id", e.target.value, {
                            shouldValidate: true,
                          });
                          setUploadedProofName("");
                        }}
                        className={`w-full px-5 py-4 rounded-2xl border border-slate-200/90 focus:border-[#10a37f] outline-none transition-all font-bold bg-[#f8fafc] hover:bg-[#f1f5f9] cursor-pointer shadow-[inset_3px_3px_6px_rgba(160,175,195,0.32),inset_-3px_-3px_6px_rgba(255,255,255,0.95)] focus:shadow-[inset_4px_4px_8px_rgba(140,160,180,0.4),inset_-4px_-4px_8px_rgba(255,255,255,1)] text-sm ${
                          watchIndikatorId ? "text-slate-900" : "text-gray-400/80"
                        }`}
                      >
                        <option value="" className="text-gray-400">
                          Pilih indikator
                        </option>
                        {filteredIndikators.map((i, idx) => (
                          <option key={`${i.id}-${idx}`} value={i.id} className="text-slate-900">
                            {i.indicator_title}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.indikator_id && (
                      <p className="text-red-500 text-xs font-semibold mt-1">
                        {errors.indikator_id.message}
                      </p>
                    )}
                  </div>
                )}
              </>
            )}

          {/* STEP 7: DYNAMIC MEDICAL FORM FIELDS AND SPECIAL CLINICAL GRIDS */}
          {/* A. If Patient Safety Incidents (IKP) */}
          {watchKategori === "IKP" && (
            <div className="bg-[#f8fafc] border border-red-100 rounded-[28px] p-6 md:p-8 space-y-6 shadow-[8px_8px_20px_rgba(160,175,195,0.2),-8px_-8px_20px_rgba(255,255,255,0.95)] animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-3 border-b border-red-100 pb-4">
                <ShieldAlert className="text-red-500 w-6 h-6" />
                <h3 className="text-lg font-bold text-red-900">
                  Form Input Insiden Keselamatan Pasien (IKP)
                </h3>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  { id: "kpc", label: "KPC", sub: "Potensial Cedera" },
                  { id: "knc", label: "KNC", sub: "Nyaris Cedera" },
                  { id: "ktc", label: "KTC", sub: "Tidak Cedera" },
                  { id: "ktd", label: "KTD", sub: "Tidak Diharapkan" },
                  {
                    id: "sentinel",
                    label: "Sentinel",
                    sub: "Kejadian Sentinel",
                  },
                ].map((ikpItem, idx) => (
                  <div
                    key={`${ikpItem.id}-${idx}`}
                    className="bg-[#f8fafc] border border-white rounded-2xl p-4 text-center shadow-[4px_4px_10px_rgba(160,175,195,0.25),-4px_-4px_10px_rgba(255,255,255,0.95)] hover:shadow-[5px_5px_12px_rgba(140,160,180,0.3),-5px_-5px_12px_rgba(255,255,255,1)] transition-all"
                  >
                    <label className="block text-[#0c2415] font-extrabold text-sm mb-1">
                      {ikpItem.label}
                    </label>
                    <span className="block text-[10px] text-gray-400 mb-3 uppercase tracking-wider font-semibold">
                      {ikpItem.sub}
                    </span>
                    <input
                      type="number"
                      min="0"
                      {...register(ikpItem.id as any, { valueAsNumber: true })}
                      className="w-full text-center px-3 py-2.5 bg-[#fef2f2]/60 rounded-xl border border-red-200/70 shadow-[inset_2px_2px_5px_rgba(252,165,165,0.35),inset_-2px_-2px_5px_rgba(255,255,255,0.95)] focus:outline-none focus:border-red-400 font-bold text-lg text-red-900 focus:shadow-[inset_3px_3px_6px_rgba(248,113,113,0.4),inset_-3px_-3px_6px_rgba(255,255,255,1)] transition-all"
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-800 tracking-wide">
                  <FileText size={16} className="text-red-500" />
                  Keterangan Ringkat Laporan Insiden
                </label>
                <textarea
                  {...register("keterangan")}
                  rows={3}
                  placeholder="Tambahkan catatan ringkas lokasi kejadian, tindakan penanganan awal, atau rujukan investigasi..."
                  className="w-full px-5 py-3.5 rounded-2xl border border-slate-200/90 bg-[#f8fafc] shadow-[inset_3px_3px_6px_rgba(160,175,195,0.32),inset_-3px_-3px_6px_rgba(255,255,255,0.95)] focus:shadow-[inset_4px_4px_8px_rgba(140,160,180,0.4),inset_-4px_-4px_8px_rgba(255,255,255,1)] focus:border-red-400 outline-none transition-all text-slate-800 font-medium resize-none"
                />
              </div>
            </div>
          )}

          {/* B. Specialized Clinical Grid Forms */}
          {watchKategori !== "IKP" && selectedIndikatorProfile && (
            <div ref={formSectionRef} className="space-y-6 scroll-mt-6">
              {/* Specialized Form For Visite Dokter (ID "7") */}
              {isVisiteDokter && (
                <div className="bg-[#f8fafc] border border-white rounded-[28px] overflow-hidden shadow-[8px_8px_20px_rgba(160,175,195,0.2),-8px_-8px_20px_rgba(255,255,255,0.95)] animate-in fade-in">
                  <div className="bg-emerald-600 p-5 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <Activity size={20} className="text-white" />
                      <div>
                        <h3 className="font-extrabold text-white tracking-wide text-sm md:text-base">
                          Input Data Indikator Kepatuhan Jam Visite Dokter
                        </h3>
                        <p className="text-[11px] font-semibold text-emerald-100">
                          Unit: {selectedUnit?.name || "-"} {selectedSubUnit ? `(${selectedSubUnit})` : ""} • Bulan: {formattedBulanLabel}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddVisiteRow}
                      className="flex items-center gap-1.5 bg-white text-emerald-800 hover:bg-emerald-50 px-3.5 py-1.5 rounded-xl text-xs font-black transition-colors"
                    >
                      <Plus size={14} /> Tambah Pasien
                    </button>
                  </div>

                  <div className="p-6 overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[920px]">
                      <thead>
                        <tr className="bg-emerald-50/55 border-b border-emerald-100 text-emerald-950">
                          <th className="py-3 px-4 font-extrabold text-xs uppercase w-12 text-center rounded-tl-xl border-r border-emerald-100/30">
                            No
                          </th>
                          <th className="py-3 px-4 font-extrabold text-xs uppercase w-32 border-r border-emerald-100/30">
                            Tanggal
                          </th>
                          <th className="py-3 px-4 font-extrabold text-xs uppercase border-r border-emerald-100/30">
                            Nama Pasien
                          </th>
                          <th className="py-3 px-4 font-extrabold text-xs uppercase w-32 border-r border-emerald-100/30">
                            No. RM
                          </th>
                          <th className="py-3 px-4 font-extrabold text-xs uppercase text-center w-28 border-r border-emerald-100/30">
                            Visite {"<"} 14.00
                          </th>
                          <th className="py-3 px-4 font-extrabold text-xs uppercase text-center w-28 border-r border-emerald-100/30">
                            Visite {">"} 14.00
                          </th>
                          <th className="py-3 px-4 font-extrabold text-xs uppercase border-r border-emerald-100/30 min-w-[200px]">
                            Dokter DPJP
                          </th>
                          <th className="py-3 px-4 font-extrabold text-xs uppercase w-44 border-r border-emerald-100/30">
                            Keterangan
                          </th>
                          <th className="py-3 px-4 font-extrabold text-xs uppercase w-16 text-center rounded-tr-xl">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {visiteGrid.length === 0 ? (
                          <tr>
                            <td
                              colSpan={9}
                              className="py-12 text-center text-gray-400 text-xs italic font-semibold border-b border-emerald-50 bg-[#fafdfc]"
                            >
                              Belum ada baris data audit. Silakan tambahkan
                              pasien untuk memulai verifikasi indikator visite
                              dokter.
                            </td>
                          </tr>
                        ) : (
                          visiteGrid.map((row, idx) => (
                            <tr
                              key={`${row.id}-${idx}`}
                              className="border-b border-gray-50 hover:bg-emerald-50/10 transition-colors"
                            >
                              <td className="py-3 px-4 text-center text-sm font-semibold text-gray-400 border-r border-emerald-50">
                                {idx + 1}
                              </td>
                              <td className="py-3 px-4 border-r border-emerald-50">
                                <input
                                  type="date"
                                  value={row.tanggal}
                                  onChange={(e) =>
                                    handleUpdateVisite(
                                      row.id,
                                      "tanggal",
                                      e.target.value,
                                    )
                                  }
                                  className="w-full bg-transparent outline-none text-xs font-bold text-slate-850"
                                />
                              </td>
                              <td className="py-3 px-4 border-r border-emerald-50">
                                <input
                                  type="text"
                                  placeholder="Nama Lengkap Pasien"
                                  value={row.nama_pasien}
                                  onChange={(e) =>
                                    handleUpdateVisite(
                                      row.id,
                                      "nama_pasien",
                                      e.target.value,
                                    )
                                  }
                                  className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
                                  required
                                />
                              </td>
                              <td className="py-3 px-4 border-r border-emerald-50">
                                <input
                                  type="text"
                                  placeholder="No. RM"
                                  value={row.no_rm || ""}
                                  onChange={(e) =>
                                    handleUpdateVisite(
                                      row.id,
                                      "no_rm",
                                      e.target.value,
                                    )
                                  }
                                  className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
                                />
                              </td>
                              <td className="py-3 px-4 text-center border-r border-emerald-50">
                                <input
                                  type="checkbox"
                                  checked={row.jam_visite_kurang_14}
                                  onChange={(e) =>
                                    handleUpdateVisite(
                                      row.id,
                                      "jam_visite_kurang_14",
                                      e.target.checked,
                                    )
                                  }
                                  className="w-5 h-5 accent-emerald-600 cursor-pointer rounded border-gray-300"
                                />
                              </td>
                              <td className="py-3 px-4 text-center border-r border-emerald-50">
                                <input
                                  type="checkbox"
                                  checked={row.jam_visite_lebih_14}
                                  onChange={(e) =>
                                    handleUpdateVisite(
                                      row.id,
                                      "jam_visite_lebih_14",
                                      e.target.checked,
                                    )
                                  }
                                  className="w-5 h-5 accent-emerald-600 cursor-pointer rounded border-gray-300"
                                />
                              </td>
                              <td className="py-3 px-4 border-r border-emerald-50">
                                <select
                                  value={row.dokter_visite}
                                  onChange={(e) =>
                                    handleUpdateVisite(
                                      row.id,
                                      "dokter_visite",
                                      e.target.value,
                                    )
                                  }
                                  className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
                                  required
                                >
                                  <option value="">
                                    -- Pilih Dokter Spesialis --
                                  </option>
                                  {RSUD_DPJP_LIST.map((dok) => (
                                    <option key={dok} value={dok}>
                                      {dok}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="py-3 px-4 border-r border-emerald-50">
                                <select
                                  value={row.keterangan}
                                  onChange={(e) =>
                                    handleUpdateVisite(
                                      row.id,
                                      "keterangan",
                                      e.target.value,
                                    )
                                  }
                                  className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
                                  required
                                >
                                  <option value="Sesuai Jadwal">
                                    Sesuai Jadwal
                                  </option>
                                  <option value="Tidak Sesuai Jadwal">
                                    Tidak Sesuai Jadwal
                                  </option>
                                </select>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (
                                      window.confirm("Hapus data pasien ini?")
                                    ) {
                                      handleRemoveVisiteRow(row.id);
                                    }
                                  }}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="px-6 py-4 bg-emerald-50/70 border-t border-emerald-100 flex flex-wrap items-center justify-between gap-4">
                    <p className="text-xs font-bold text-emerald-900">
                      Visite {"<"} 14.00 Sesuai Jadwal:{" "}
                      <span className="font-black">
                        {
                          visiteGrid.filter(
                            (d) =>
                              d.jam_visite_kurang_14 &&
                              d.keterangan === "Sesuai Jadwal",
                          ).length
                        }
                      </span>{" "}
                      / Total Pasien: <span className="font-black">{visiteGrid.length}</span>
                    </p>
                    <p className="text-xs font-extrabold text-emerald-800">
                      Nilai / Persentase Capaian:{" "}
                      <span className="text-sm font-black">{computedCapaian}%</span>
                    </p>
                  </div>
                </div>
              )}

              {/* Specialized Form For Upaya Risiko Jatuh (ID "11") */}
              {isRisikoJatuh && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="bg-[#f8fafc] border border-white rounded-[28px] overflow-hidden shadow-[8px_8px_20px_rgba(160,175,195,0.2),-8px_-8px_20px_rgba(255,255,255,0.95)]">
                    <div className="bg-emerald-600 p-5 flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-3">
                        <Activity size={20} className="text-white" />
                        <div>
                          <h3 className="font-extrabold text-white tracking-wide text-sm md:text-base">
                            Data Registrasi Kepatuhan Upaya Pencegahan Risiko Pasien Jatuh
                          </h3>
                          <p className="text-[11px] font-semibold text-emerald-100">
                            Unit: {selectedUnit?.name || "-"} {selectedSubUnit ? `(${selectedSubUnit})` : ""} • Bulan: {formattedBulanLabel}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddJatuhRow}
                        className="flex items-center gap-1.5 bg-white text-emerald-800 hover:bg-emerald-50 px-3.5 py-1.5 rounded-xl text-xs font-black transition-colors"
                      >
                        <Plus size={14} /> Tambah Pasien
                      </button>
                    </div>

                    <div className="p-0 overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-[920px]">
                        <thead>
                          <tr className="bg-emerald-50/55 border-b border-emerald-100 text-emerald-950">
                            <th className="py-3 px-4 font-extrabold text-xs uppercase w-12 text-center border-r border-emerald-100/30">
                              No
                            </th>
                            <th className="py-3 px-4 font-extrabold text-xs uppercase w-32 border-r border-emerald-100/30">
                              Tanggal
                            </th>
                            <th className="py-3 px-4 font-extrabold text-xs uppercase border-r border-emerald-100/30">
                              Nama Pasien
                            </th>
                            <th className="py-3 px-4 font-extrabold text-xs uppercase w-32 border-r border-emerald-100/30">
                              No. RM
                            </th>
                            <th className="py-3 px-4 font-extrabold text-xs uppercase text-center w-32 border-r border-emerald-100/30">
                              Asesmen Awal
                            </th>
                            <th className="py-3 px-4 font-extrabold text-xs uppercase text-center w-32 border-r border-emerald-100/30">
                              Asesmen Ulang
                            </th>
                            <th className="py-3 px-4 font-extrabold text-xs uppercase text-center w-48 border-r border-emerald-100/30">
                              Intervensi (Segitiga Pengaman &amp; Stiker Kuning)
                            </th>
                            <th className="py-3 px-4 font-extrabold text-xs uppercase w-16 text-center">
                              Aksi
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {jatuhGrid.length === 0 ? (
                            <tr>
                              <td
                                colSpan={8}
                                className="py-12 text-center text-gray-400 text-xs italic font-semibold bg-[#fafdfc]"
                              >
                                Belum ada baris data audit. Silakan tambahkan
                                pasien.
                              </td>
                            </tr>
                          ) : (
                            jatuhGrid.map((row, idx) => (
                              <tr
                                key={`${row.id}-${idx}`}
                                className="border-b border-gray-50 hover:bg-emerald-50/10 transition-colors"
                              >
                                <td className="py-3 px-4 text-center text-sm font-semibold text-gray-400 border-r border-emerald-50">
                                  {idx + 1}
                                </td>
                                <td className="py-3 px-4 border-r border-emerald-50">
                                  <input
                                    type="date"
                                    value={row.tanggal}
                                    onChange={(e) =>
                                      handleUpdateJatuh(
                                        row.id,
                                        "tanggal",
                                        e.target.value,
                                      )
                                    }
                                    className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
                                  />
                                </td>
                                <td className="py-3 px-4 border-r border-emerald-50">
                                  <input
                                    type="text"
                                    placeholder="Nama Lengkap Pasien"
                                    value={row.nama_pasien}
                                    onChange={(e) =>
                                      handleUpdateJatuh(
                                        row.id,
                                        "nama_pasien",
                                        e.target.value,
                                      )
                                    }
                                    className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
                                    required
                                  />
                                </td>
                                <td className="py-3 px-4 border-r border-emerald-50">
                                  <input
                                    type="text"
                                    placeholder="No. Rekam Medis"
                                    value={row.no_rm}
                                    onChange={(e) =>
                                      handleUpdateJatuh(
                                        row.id,
                                        "no_rm",
                                        e.target.value,
                                      )
                                    }
                                    className="w-full bg-transparent outline-none text-xs font-bold text-slate-850"
                                    required
                                  />
                                </td>
                                <td className="py-3 px-4 text-center border-r border-emerald-50">
                                  <select
                                    value={
                                      row.asesmen_awal === null
                                        ? ""
                                        : row.asesmen_awal
                                          ? "1"
                                          : "0"
                                    }
                                    onChange={(e) =>
                                      handleUpdateJatuh(
                                        row.id,
                                        "asesmen_awal",
                                        e.target.value === ""
                                          ? null
                                          : e.target.value === "1",
                                      )
                                    }
                                    className={`w-full h-8 rounded-lg outline-none text-xs font-bold text-center appearance-none ${row.asesmen_awal === null ? "bg-slate-100 text-slate-500" : row.asesmen_awal ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}
                                  >
                                    <option value="">-- Pilih --</option>
                                    <option value="1">Ya</option>
                                    <option value="0">Tidak</option>
                                  </select>
                                </td>
                                <td className="py-3 px-4 text-center border-r border-emerald-50">
                                  <select
                                    value={
                                      row.asesmen_ulang === null
                                        ? ""
                                        : row.asesmen_ulang
                                          ? "1"
                                          : "0"
                                    }
                                    onChange={(e) =>
                                      handleUpdateJatuh(
                                        row.id,
                                        "asesmen_ulang",
                                        e.target.value === ""
                                          ? null
                                          : e.target.value === "1",
                                      )
                                    }
                                    className={`w-full h-8 rounded-lg outline-none text-xs font-bold text-center appearance-none ${row.asesmen_ulang === null ? "bg-slate-100 text-slate-500" : row.asesmen_ulang ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}
                                  >
                                    <option value="">-- Pilih --</option>
                                    <option value="1">Ya</option>
                                    <option value="0">Tidak</option>
                                  </select>
                                </td>
                                <td className="py-3 px-4 text-center border-r border-emerald-50">
                                  <select
                                    value={
                                      row.intervensi === null
                                        ? ""
                                        : row.intervensi
                                          ? "1"
                                          : "0"
                                    }
                                    onChange={(e) =>
                                      handleUpdateJatuh(
                                        row.id,
                                        "intervensi",
                                        e.target.value === ""
                                          ? null
                                          : e.target.value === "1",
                                      )
                                    }
                                    className={`w-full h-8 rounded-lg outline-none text-xs font-bold text-center appearance-none ${row.intervensi === null ? "bg-slate-100 text-slate-500" : row.intervensi ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}
                                  >
                                    <option value="">-- Pilih --</option>
                                    <option value="1">Ya</option>
                                    <option value="0">Tidak</option>
                                  </select>
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveJatuhRow(row.id)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className="px-6 py-4 bg-emerald-50/70 border-t border-emerald-100 flex flex-wrap items-center justify-between gap-4">
                      <p className="text-xs font-bold text-emerald-900">
                        Lengkap Ketiga Upaya (Ya semua):{" "}
                        <span className="font-black">
                          {jatuhGrid.filter((d) => d.asesmen_awal && d.asesmen_ulang && d.intervensi).length}
                        </span>{" "}
                        / Total Pasien: <span className="font-black">{jatuhGrid.length}</span>
                      </p>
                      <p className="text-xs font-extrabold text-emerald-800">
                        Nilai / Persentase Capaian:{" "}
                        <span className="text-sm font-black">{computedCapaian}%</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Advanced Custom Form: Kepatuhan Identifikasi Pasien */}
              {isIdentifikasiPasien && (
                <div className="space-y-4 border-t border-emerald-100/10 pt-4 animate-in fade-in duration-300">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-emerald-50/60 border border-emerald-200/70 rounded-2xl p-4">
                    <div>
                      <h4 className="font-extrabold text-sm text-[#0c2415] uppercase tracking-wide">
                        Form Observasi Kepatuhan Identifikasi Pasien
                      </h4>
                      <p className="text-xs text-slate-600 font-semibold mt-1">
                        Pilih dan observasi minimal satu peluang tindakan (Pemasangan Gelang, Pemberian Obat, Produk Darah, Pengambilan Spesimen, Prosedur &amp; Pemberian Diet).
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <span className="px-3 py-1 rounded-xl bg-white border border-emerald-200 text-[11px] font-bold text-emerald-900">
                        Unit: {selectedUnit?.name || "-"}
                      </span>
                      <span className="px-3 py-1 rounded-xl bg-white border border-emerald-200 text-[11px] font-bold text-emerald-900">
                        Bulan: {formattedBulanLabel}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                      {identifikasiGrid.map((row, idx) => (
                        <div
                          key={`${row.id}-${idx}`}
                          className="bg-white border text-left border-gray-200 rounded-2xl shadow-sm p-4 sm:p-5 flex flex-col gap-4 group hover:border-[#10a37f] transition-all relative overflow-hidden"
                        >
                          <div className="absolute top-0 left-0 w-1 h-full bg-[#10a37f] opacity-0 group-hover:opacity-100 transition-opacity"></div>

                          {/* Row Header & Delete */}
                          <div className="flex justify-end items-center border-b border-slate-100 pb-3">
                            <button
                              type="button"
                              onClick={() => handleRemoveIdentifikasiRow(row.id)}
                              className="text-rose-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition-colors ml-2"
                              title="Hapus Form Observasi"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>

                          {/* Top: Observasi Details */}
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="space-y-1">
                              <label className="text-[10px] font-extrabold text-slate-500 uppercase">
                                Tgl Observasi
                              </label>
                              <input
                                type="date"
                                value={row.tanggal_observasi}
                                onChange={(e) =>
                                  handleUpdateIdentifikasi(row.id, "tanggal_observasi", e.target.value)
                                }
                                className="w-full text-xs font-bold border border-slate-200 px-3 py-2 rounded-xl outline-none focus:border-emerald-500 bg-slate-50/50"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-extrabold text-slate-500 uppercase">
                                Jam
                              </label>
                              <input
                                type="time"
                                value={row.jam_observasi}
                                onChange={(e) =>
                                  handleUpdateIdentifikasi(row.id, "jam_observasi", e.target.value)
                                }
                                className="w-full text-xs font-bold border border-slate-200 px-3 py-2 rounded-xl outline-none focus:border-emerald-500 bg-slate-50/50"
                              />
                            </div>
                            <div className="space-y-1 md:col-span-2">
                              <label className="text-[10px] font-extrabold text-slate-500 uppercase">
                                Nama Observer
                              </label>
                              <input
                                type="text"
                                value={row.nama_observer}
                                onChange={(e) =>
                                  handleUpdateIdentifikasi(row.id, "nama_observer", e.target.value)
                                }
                                className="w-full text-xs font-bold border border-slate-200 px-3 py-2 rounded-xl outline-none focus:border-emerald-500 bg-slate-50/50"
                                placeholder="Observer..."
                              />
                            </div>
                          </div>

                          {/* Info Pasien */}
                          <div className="bg-slate-50 rounded-xl p-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 border border-slate-100">
                            <div>
                              <label className="text-[9px] font-extrabold text-slate-400 uppercase">Nama Pasien</label>
                              <input
                                type="text"
                                value={row.nama_pasien}
                                onChange={(e) => handleUpdateIdentifikasi(row.id, "nama_pasien", e.target.value)}
                                className="w-full text-xs font-bold border-b border-slate-200 px-1 py-1 outline-none focus:border-emerald-500 bg-transparent"
                                placeholder="Nama Pasien"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] font-extrabold text-slate-400 uppercase">No RM</label>
                              <input
                                type="text"
                                value={row.no_rm}
                                onChange={(e) => handleUpdateIdentifikasi(row.id, "no_rm", e.target.value)}
                                className="w-full text-xs font-bold border-b border-slate-200 px-1 py-1 outline-none focus:border-emerald-500 bg-transparent"
                                placeholder="00-00-00"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] font-extrabold text-slate-400 uppercase">Tanggal Lahir</label>
                              <input
                                type="date"
                                value={row.tanggal_lahir}
                                onChange={(e) => handleUpdateIdentifikasi(row.id, "tanggal_lahir", e.target.value)}
                                className="w-full text-xs font-bold border-b border-slate-200 px-1 py-1 outline-none focus:border-emerald-500 bg-transparent"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] font-extrabold text-slate-400 uppercase">Jenis Kelamin</label>
                              <select
                                value={row.jenis_kelamin}
                                onChange={(e) => handleUpdateIdentifikasi(row.id, "jenis_kelamin", e.target.value)}
                                className="w-full text-xs font-bold border-b border-slate-200 px-1 py-1 outline-none focus:border-emerald-500 bg-transparent appearance-none"
                              >
                                <option value="">- Pilih JK -</option>
                                <option value="Laki-Laki">Laki-Laki</option>
                                <option value="Perempuan">Perempuan</option>
                              </select>
                            </div>
                          </div>

                          {/* Data Observasi Utama (Horizontal Table) */}
                          <div className="w-full border border-emerald-100 rounded-xl bg-white shadow-xs overflow-hidden">
                             <table className="w-full text-left border-collapse table-fixed">
                               <thead className="bg-[#059669] text-white">
                                 <tr>
                                   <th className="px-2 py-1 font-extrabold uppercase border-r border-[#047857] text-[9px] text-center w-[14%] align-middle bg-[#047857] sticky left-0 z-10">Komponen</th>
                                   {momentHeaders.map((hdr, index) => {
                                      const momentKey = `moment_${index}`;

                                      const isPatuhReal = row.moments[momentKey]?.patuh;
                                      const isAktif = row.moments[momentKey]?.aktif;
                                      return (
                                        <th key={index} className="px-1 py-1 font-bold uppercase text-center border-r border-[#047857] align-middle w-[9.5%] relative group">
                                          <div className="text-[7.5px] font-bold leading-tight truncate px-0.5 py-1 mb-0.5">{hdr.title}</div>
                                          
                                          {/* Status compliance under the header */}
                                          <div className="mt-1 flex justify-center h-4 items-center">
                                             {isAktif ? (
                                               isPatuhReal === true ? (
                                                  <span className="bg-emerald-600 text-white border border-emerald-400 px-1 py-0.2 rounded-[3px] text-[7px] font-extrabold tracking-tight">PATUH</span>
                                               ) : (
                                                  <span className="bg-rose-500 text-white border border-rose-400 px-1 py-0.2 rounded-[3px] text-[7px] font-extrabold tracking-tight">TDK PATUH</span>
                                               )
                                             ) : (
                                                <span className="text-emerald-200/50 text-[7px] font-bold tracking-tight uppercase">OFF</span>
                                             )}
                                          </div>

                                          {/* Enhanced hover tooltip */}
                                          <div className="absolute hidden group-hover:block bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900/95 text-white text-[9px] rounded shadow-lg z-50 text-center font-normal uppercase leading-normal">
                                            {hdr.label}
                                          </div>
                                        </th>
                                      );
                                   })}
                                 </tr>
                               </thead>
                               <tbody className="bg-white">
                                 {/* Baris 1: Siapa yang melakukan (Single inline text input) */}
                                 <tr className="border-b border-slate-100 bg-slate-50/20">
                                   <td className="px-2 py-1.5 font-extrabold text-slate-700 align-middle bg-slate-50 border-r border-slate-100 sticky left-0 z-10 text-[9px]">
                                      1. Siapa melakukan
                                   </td>
                                   <td colSpan={9} className="px-2 py-1 align-middle border-r border-slate-100">
                                      <input 
                                         type="text"
                                         value={row.petugas || ""} 
                                         onChange={(e) => handleUpdateIdentifikasi(row.id, "petugas", e.target.value)}
                                         placeholder="Tulis nama / peran petugas (contoh: Perawat A, Dokter Budi)..."
                                         className="w-full text-[9px] font-bold border border-slate-200 px-2.5 py-1 rounded-sm outline-none focus:border-emerald-500 bg-white placeholder:text-slate-400 placeholder:font-normal"
                                      />
                                   </td>
                                 </tr>

                                 {/* Baris 2: Apa yang ditanyakan? */}
                                 <tr className="border-b border-slate-100 bg-white">
                                   <td colSpan={10} className="px-2 py-1.5 font-bold text-slate-700 bg-transparent align-middle sticky left-0 z-10 text-[9px] leading-tight">
                                      2. Yang ditanyakan?
                                   </td>
                                 </tr>
                                 <tr className="border-b border-slate-100">
                                   <td className="px-2 py-2 pl-4 font-semibold text-slate-600 align-middle bg-slate-50 border-r border-slate-100 sticky left-0 z-10 text-[9px]">
                                      a. Nama Lengkap
                                   </td>
                                   {[0,1,2,3,4,5,6,7,8].map((idx) => {
                                      const momentKey = `moment_${idx}`;
                                      const mData = row.moments[momentKey] || { tanya_nama: null, tanya_tgllahir: null };
                                      return (
                                        <td key={idx} className="px-1 py-1.5 align-middle border-r border-slate-100 text-center">
                                           <TriStateSelector
                                              value={mData.tanya_nama}
                                              onChange={(val) => handleUpdateIdentifikasiMoment(row.id, momentKey, "tanya_nama", val)}
                                           />
                                        </td>
                                      );
                                   })}
                                 </tr>
                                 <tr className="border-b border-slate-100">
                                   <td className="px-2 py-2 pl-4 font-semibold text-slate-600 align-middle bg-slate-50 border-r border-slate-100 sticky left-0 z-10 text-[9px]">
                                      b. Tanggal Lahir
                                   </td>
                                   {[0,1,2,3,4,5,6,7,8].map((idx) => {
                                      const momentKey = `moment_${idx}`;
                                      const mData = row.moments[momentKey] || { tanya_nama: null, tanya_tgllahir: null };
                                      return (
                                        <td key={idx} className="px-1 py-1.5 align-middle border-r border-slate-100 text-center">
                                           <TriStateSelector
                                              value={mData.tanya_tgllahir}
                                              onChange={(val) => handleUpdateIdentifikasiMoment(row.id, momentKey, "tanya_tgllahir", val)}
                                           />
                                        </td>
                                      );
                                   })}
                                 </tr>

                                 {/* Baris 3: Bagaimana menanyakannya? */}
                                 <tr className="border-b border-slate-100 bg-white">
                                   <td colSpan={10} className="px-2 py-1.5 font-bold text-slate-700 bg-transparent align-middle sticky left-0 z-10 text-[9px] leading-tight">
                                      3. Cara menanyakan?
                                   </td>
                                 </tr>
                                 <tr className="border-b border-slate-100">
                                   <td className="px-2 py-2 pl-4 font-semibold text-slate-600 align-middle bg-slate-50 border-r border-slate-100 sticky left-0 z-10 text-[9px]">
                                      a. Secara Verbal
                                   </td>
                                   {[0,1,2,3,4,5,6,7,8].map((idx) => {
                                      const momentKey = `moment_${idx}`;
                                      const mData = row.moments[momentKey] || { cara_verbal: null, cara_visual: null };
                                      return (
                                        <td key={idx} className="px-1 py-1.5 align-middle border-r border-slate-100 text-center">
                                           <TriStateSelector
                                              value={mData.cara_verbal}
                                              onChange={(val) => handleUpdateIdentifikasiMoment(row.id, momentKey, "cara_verbal", val)}
                                           />
                                        </td>
                                      );
                                   })}
                                 </tr>
                                 <tr className="border-b border-slate-100">
                                   <td className="px-2 py-2 pl-4 font-semibold text-slate-600 align-middle bg-slate-50 border-r border-slate-100 sticky left-0 z-10 text-[9px]">
                                      b. Secara Visual
                                   </td>
                                   {[0,1,2,3,4,5,6,7,8].map((idx) => {
                                      const momentKey = `moment_${idx}`;
                                      const mData = row.moments[momentKey] || { cara_verbal: null, cara_visual: null };
                                      return (
                                        <td key={idx} className="px-1 py-1.5 align-middle border-r border-slate-100 text-center">
                                           <TriStateSelector
                                              value={mData.cara_visual}
                                              onChange={(val) => handleUpdateIdentifikasiMoment(row.id, momentKey, "cara_visual", val)}
                                           />
                                        </td>
                                      );
                                   })}
                                 </tr>

                                 {/* Baris 4: Dimana dilakukan identifikasi? */}
                                 <tr className="bg-slate-50/25">
                                   <td className="px-2 py-1.5 font-extrabold text-slate-700 align-middle bg-slate-50 border-r border-slate-100 sticky left-0 z-10 text-[9px]">
                                      4. Lokasi Identifikasi
                                   </td>
                                   <td colSpan={9} className="px-2 py-1 align-middle border-r border-slate-100">
                                      <select 
                                         value={row.lokasi || ""} 
                                         onChange={(e) => handleUpdateIdentifikasi(row.id, "lokasi", e.target.value)}
                                         className="w-full text-[9px] font-bold border border-slate-200 px-2 py-1 rounded-sm outline-none focus:border-emerald-500 bg-white"
                                      >
                                         <option value="">-- Pilih Lokasi Identifikasi --</option>
                                         <option value="Rawat Inap">Rawat Inap</option>
                                         <option value="Rawat Jalan">Rawat Jalan</option>
                                         <option value="IGD">IGD</option>
                                         <option value="Bersalin">Bersalin / Ruang Kebidanan</option>
                                         <option value="Emergency Kebidanan">Emergency Kebidanan</option>
                                         <option value="Haemodialisis">Haemodialisis</option>
                                         <option value="Instalasi Kamar Bedah">Instalasi Kamar Bedah</option>
                                         <option value="ICU">ICU</option>
                                         <option value="Laboratorium">Laboratorium</option>
                                         <option value="Radiologi">Radiologi</option>
                                         <option value="Ruangan Lainnya">Ruangan Lainnya</option>
                                      </select>
                                   </td>
                                 </tr>
                               </tbody>
                             </table>
                          </div>
                        </div>
                      ))}

                      <div className="flex items-center gap-4 pt-2">
                        <button
                          type="button"
                          onClick={handleAddIdentifikasiRow}
                          className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-[#059669] px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-sm"
                        >
                          <Plus size={16} strokeWidth={3} />
                          Tambah Baris Observasi
                        </button>
                      </div>

                      {identifikasiGrid.length > 0 &&
                        (() => {
                          let calcNum = 0;
                          let calcDen = 0;
                          let tglLahirIssue = 0;
                          identifikasiGrid.forEach((d) => {
                             Object.values(d.moments || {}).forEach((m) => {
                                if (m.aktif) {
                                   calcDen++;
                                   if (m.patuh) calcNum++;
                                   if (m.tanya_tgllahir === "Tidak") tglLahirIssue++;
                                }
                             });
                          });
                          
                          const num = calcNum;
                          const den = calcDen;
                          const pct =
                            den > 0 ? ((num / den) * 100).toFixed(2) : "0.00";
                          const target = 100;
                          const isMet = parseFloat(pct) >= target;

                          return (
                            <div className="mt-8 space-y-6">
                              {/* Hasil Perhitungan */}
                              <div className="bg-emerald-50/50 border border-emerald-100 rounded-3xl p-6">
                                <h4 className="font-extrabold text-xs text-emerald-800 uppercase tracking-widest mb-4">
                                  Hasil Perhitungan
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                  <div className="bg-white border border-emerald-100 rounded-2xl p-4 flex flex-col justify-center items-center">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                      Numerator
                                    </span>
                                    <span className="text-2xl font-black text-emerald-600">
                                      {num}
                                    </span>
                                  </div>
                                  <div className="bg-white border border-emerald-100 rounded-2xl p-4 flex flex-col justify-center items-center">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                      Denominator
                                    </span>
                                    <span className="text-2xl font-black text-emerald-600">
                                      {den}
                                    </span>
                                  </div>
                                  <div className="bg-white border border-emerald-100 rounded-2xl p-4 flex flex-col justify-center items-center">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                      Persentase
                                    </span>
                                    <span className="text-2xl font-black text-emerald-600">
                                      {pct}%
                                    </span>
                                  </div>
                                  <div className="bg-white border border-emerald-100 rounded-2xl p-4 flex flex-col justify-center items-center">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                      Target
                                    </span>
                                    <span className="text-2xl font-black text-emerald-600">
                                      100%
                                    </span>
                                  </div>
                                  <div className="bg-white border border-emerald-100 rounded-2xl p-4 flex flex-col justify-center items-center">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                      Status
                                    </span>
                                    {isMet ? (
                                      <span className="text-sm font-black text-emerald-600 bg-emerald-100 px-3 py-1 rounded-lg mt-1">
                                        MENCAPAI
                                      </span>
                                    ) : (
                                      <span className="text-sm font-black text-rose-600 bg-rose-100 px-3 py-1 rounded-lg mt-1">
                                        BELUM
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Analisis & Rekomendasi */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                                  <h4 className="font-extrabold text-sm text-slate-800 mb-3 flex items-center gap-2">
                                    <Sparkles
                                      size={18}
                                      className="text-amber-500"
                                    />{" "}
                                    Analisa Capaian
                                  </h4>
                                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                    Berdasarkan hasil observasi, terdapat{" "}
                                    <strong>{den}</strong> observasi
                                    identifikasi pasien. Sebanyak{" "}
                                    <strong>{num}</strong> observasi dilakukan
                                    sesuai standar dan{" "}
                                    <strong>{den - num}</strong> observasi belum
                                    sesuai standar. Persentase kepatuhan sebesar{" "}
                                    <strong>{pct}%</strong> sehingga{" "}
                                    {isMet
                                      ? "telah mencapai"
                                      : "belum mencapai"}{" "}
                                    target indikator 100%.
                                    {tglLahirIssue > 0 &&
                                      ` Ketidaksesuaian banyak ditemukan pada proses verifikasi tanggal lahir pasien.`}
                                  </p>
                                </div>
                                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                                  <h4 className="font-extrabold text-sm text-slate-800 mb-3 flex items-center gap-2">
                                    <Target
                                      size={18}
                                      className="text-emerald-500"
                                    />{" "}
                                    Rekomendasi Otomatis
                                  </h4>
                                  <ul className="text-xs text-slate-600 leading-relaxed font-medium space-y-2">
                                    <li className="flex gap-2 items-start">
                                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></div>{" "}
                                      <span className="flex-1">
                                        Meningkatkan kepatuhan petugas dalam
                                        melakukan verifikasi dua identitas
                                        pasien.
                                      </span>
                                    </li>
                                    <li className="flex gap-2 items-start">
                                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></div>{" "}
                                      <span className="flex-1">
                                        Melakukan refresh training identifikasi
                                        pasien.
                                      </span>
                                    </li>
                                    <li className="flex gap-2 items-start">
                                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></div>{" "}
                                      <span className="flex-1">
                                        Melakukan supervisi berkala oleh kepala
                                        unit.
                                      </span>
                                    </li>
                                    <li className="flex gap-2 items-start">
                                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></div>{" "}
                                      <span className="flex-1">
                                        Melakukan audit observasi identifikasi
                                        pasien setiap bulan.
                                      </span>
                                    </li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                    </div>
                </div>
              )}

              {/* Specialized Form: Waktu Tunggu Rawat Jalan < 60 Menit (Multi-Sheet Poli Workbook) */}
              {isWaktuTunggu && (
                <WaktuTungguRajalForm
                  rows={waktuTungguGrid}
                  onChange={setWaktuTungguGrid}
                  activeSheet={activeRajalSheet}
                  onSheetChange={setActiveRajalSheet}
                  defaultDate={getDefaultInputDate()}
                  bulanLabel={bulanOnlyLabel}
                  tahunLabel={tahunOnlyLabel}
                  computedCapaian={computedCapaian}
                />
              )}

              {/* Specialized Form: Audit Mutu Ruang Rekam Medis (Multi-Sheet Excel Workbook) */}
              {isRekamMedis && (
                <RekamMedisAuditForm
                  bundle={rekamMedisBundle}
                  onChange={setRekamMedisBundle}
                  defaultDate={getDefaultInputDate()}
                  unitLabel={selectedUnit?.name || "Rekam Medis"}
                  bulanLabel={bulanOnlyLabel}
                  tahunLabel={tahunOnlyLabel}
                  computedCapaian={computedCapaian}
                />
              )}

              {/* Specialized Form: Audit Mutu Ruang Radiologi (4-Sheet Excel Workbook) */}
              {radiologiMode && (
                <RadiologiAuditForm
                  bundle={radiologiBundle}
                  onChange={setRadiologiBundle}
                  defaultTab={radiologiMode}
                  defaultDate={getDefaultInputDate()}
                  bulanLabel={bulanOnlyLabel}
                  tahunLabel={tahunOnlyLabel}
                  computedCapaian={computedCapaian}
                />
              )}

              {/* Specialized Form: Laporan Mutu Unit Prognas */}
              {prognasIndicatorType && (
                <PrognasMutuForm
                  data={prognasData}
                  onChange={setPrognasData}
                  bulanLabel={bulanOnlyLabel}
                  tahunLabel={tahunOnlyLabel}
                  computedCapaian={computedCapaian}
                />
              )}

              {/* Specialized Form: Waktu Tunggu Pelayanan Obat Racikan <= 60 Menit */}
              {isWaktuTungguRacikan && (
                <div className="bg-[#f8fafc] border border-white rounded-[28px] overflow-hidden shadow-[8px_8px_20px_rgba(160,175,195,0.2),-8px_-8px_20px_rgba(255,255,255,0.95)] animate-in fade-in">
                  <div className="bg-emerald-600 p-5 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <Clock size={20} className="text-white" />
                      <div>
                        <h3 className="font-extrabold text-white tracking-wide text-sm md:text-base">
                          Waktu Tunggu Pelayanan Obat Racikan (≤ 60 Menit)
                        </h3>
                        <p className="text-[11px] font-semibold text-emerald-100">
                          Unit: {selectedUnit?.name || "-"} {selectedSubUnit ? `(${selectedSubUnit})` : ""} • Bulan: {formattedBulanLabel}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddRacikanRow}
                      className="flex items-center gap-1.5 bg-white text-emerald-800 hover:bg-emerald-50 px-3.5 py-1.5 rounded-xl text-xs font-black transition-colors"
                    >
                      <Plus size={14} /> Tambah Pasien
                    </button>
                  </div>

                  <div className="p-6 overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                      <thead>
                        <tr className="bg-emerald-50/55 border-b border-emerald-100 text-emerald-950">
                          <th className="py-3 px-3 font-extrabold text-xs uppercase w-12 text-center rounded-tl-xl border-r border-emerald-100/30">
                            No
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase w-32 border-r border-emerald-100/30">
                            Tanggal
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase w-32 border-r border-emerald-100/30">
                            Rekam Medis (No. RM)
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase min-w-[160px] border-r border-emerald-100/30">
                            Nama Pasien
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase text-center w-40 border-r border-emerald-100/30">
                            Jam Pasien Menyerahkan Resep
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase text-center w-40 border-r border-emerald-100/30">
                            Jam Pasien Menerima Resep
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase text-center w-32 border-r border-emerald-100/30">
                            Interval Waktu
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase min-w-[200px] border-r border-emerald-100/30">
                            Keterangan
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase w-14 text-center rounded-tr-xl">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {racikanGrid.length === 0 ? (
                          <tr>
                            <td
                              colSpan={9}
                              className="py-12 text-center text-gray-400 text-xs italic font-semibold border-b border-emerald-50 bg-[#fafdfc]"
                            >
                              Belum ada data waktu tunggu obat racikan. Klik &quot;Tambah Pasien&quot; untuk memulai pencatatan.
                            </td>
                          </tr>
                        ) : (
                          racikanGrid.map((row, idx) => {
                            const hasTimes =
                              row.jam_menyerahkan !== "" && row.jam_menerima !== "";
                            const isSesuai = row.sesuai_standar === true;

                            return (
                              <tr
                                key={`${row.id}-${idx}`}
                                className="border-b border-gray-100 hover:bg-emerald-50/15 transition-colors"
                              >
                                <td className="py-3 px-3 text-center text-xs font-bold text-gray-500 border-r border-emerald-50">
                                  {idx + 1}
                                </td>
                                <td className="py-3 px-3 border-r border-emerald-50">
                                  <input
                                    type="date"
                                    value={row.tanggal}
                                    onChange={(e) =>
                                      handleUpdateRacikan(row.id, "tanggal", e.target.value)
                                    }
                                    className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
                                  />
                                </td>
                                <td className="py-3 px-3 border-r border-emerald-50">
                                  <input
                                    type="text"
                                    placeholder="No. RM"
                                    value={row.no_rm}
                                    onChange={(e) =>
                                      handleUpdateRacikan(row.id, "no_rm", e.target.value)
                                    }
                                    className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
                                  />
                                </td>
                                <td className="py-3 px-3 border-r border-emerald-50">
                                  <input
                                    type="text"
                                    placeholder="Nama Pasien"
                                    value={row.nama_pasien}
                                    onChange={(e) =>
                                      handleUpdateRacikan(row.id, "nama_pasien", e.target.value)
                                    }
                                    className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
                                  />
                                </td>
                                <td className="py-3 px-3 text-center border-r border-emerald-50">
                                  <input
                                    type="time"
                                    value={row.jam_menyerahkan}
                                    onChange={(e) =>
                                      handleUpdateRacikan(row.id, "jam_menyerahkan", e.target.value)
                                    }
                                    className="w-full bg-transparent outline-none text-xs font-bold text-slate-800 text-center"
                                  />
                                </td>
                                <td className="py-3 px-3 text-center border-r border-emerald-50">
                                  <input
                                    type="time"
                                    value={row.jam_menerima}
                                    onChange={(e) =>
                                      handleUpdateRacikan(row.id, "jam_menerima", e.target.value)
                                    }
                                    className="w-full bg-transparent outline-none text-xs font-bold text-slate-800 text-center"
                                  />
                                </td>
                                <td className="py-3 px-3 text-center border-r border-emerald-50">
                                  {hasTimes ? (
                                    <span
                                      className={`inline-block px-2.5 py-1 rounded-lg text-[11px] font-black ${
                                        row.selisih_menit <= 60
                                          ? "bg-emerald-100 text-emerald-800"
                                          : "bg-rose-100 text-rose-800"
                                      }`}
                                    >
                                      {row.selisih_menit} Menit
                                    </span>
                                  ) : (
                                    <span className="text-xs text-gray-400">-</span>
                                  )}
                                </td>
                                <td className="py-3 px-3 border-r border-emerald-50">
                                  <div className="space-y-1.5">
                                    <div className="flex items-center gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleUpdateRacikan(row.id, "sesuai_standar", true)
                                        }
                                        className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-black border transition-all ${
                                          isSesuai
                                            ? "bg-emerald-600 text-white border-emerald-700"
                                            : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-emerald-50"
                                        }`}
                                      >
                                        Sesuai ≤ 60m
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleUpdateRacikan(row.id, "sesuai_standar", false)
                                        }
                                        className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-black border transition-all ${
                                          row.sesuai_standar === false
                                            ? "bg-rose-600 text-white border-rose-700"
                                            : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-rose-50"
                                        }`}
                                      >
                                        &gt; 60 Menit
                                      </button>
                                    </div>
                                    <input
                                      type="text"
                                      placeholder="Catatan (opsional)"
                                      value={row.keterangan}
                                      onChange={(e) =>
                                        handleUpdateRacikan(row.id, "keterangan", e.target.value)
                                      }
                                      className="w-full bg-white/80 border border-slate-200 rounded-md px-2 py-1 text-[11px] font-medium text-slate-700 outline-none focus:border-emerald-400"
                                    />
                                  </div>
                                </td>
                                <td className="py-3 px-3 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveRacikanRow(row.id)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                                    title="Hapus Baris"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="px-6 py-4 bg-emerald-50/70 border-t border-emerald-100 flex flex-wrap items-center justify-between gap-4">
                    <p className="text-xs font-bold text-emerald-900">
                      Selesai ≤ 60 Menit:{" "}
                      <span className="font-black">
                        {racikanGrid.filter((d) => d.sesuai_standar === true).length}
                      </span>{" "}
                      / Total Resep Racikan: <span className="font-black">{racikanGrid.length}</span>
                    </p>
                    <p className="text-xs font-extrabold text-emerald-800">
                      Nilai / Persentase Capaian:{" "}
                      <span className="text-sm font-black">{computedCapaian}%</span>
                    </p>
                  </div>
                </div>
              )}

              {/* Specialized Form: Formulir Pemberian Label & Double Check Obat High Alert */}
              {isHighAlertDoubleCheck && (
                <div className="bg-[#f8fafc] border border-white rounded-[28px] overflow-hidden shadow-[8px_8px_20px_rgba(160,175,195,0.2),-8px_-8px_20px_rgba(255,255,255,0.95)] animate-in fade-in">
                  <div className="bg-emerald-600 p-5 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <Activity size={20} className="text-white" />
                      <div>
                        <h3 className="font-extrabold text-white tracking-wide text-sm md:text-base">
                          Formulir Kepatuhan Double Check Obat High Alert
                        </h3>
                        <p className="text-[11px] font-semibold text-emerald-100">
                          Unit: {selectedUnit?.name || "-"} {selectedSubUnit ? `(${selectedSubUnit})` : ""} • Bulan: {formattedBulanLabel}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddHighAlertRow}
                      className="flex items-center gap-1.5 bg-white text-emerald-800 hover:bg-emerald-50 px-3.5 py-1.5 rounded-xl text-xs font-black transition-colors"
                    >
                      <Plus size={14} /> Tambah Pasien
                    </button>
                  </div>

                  <div className="p-6 overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[940px]">
                      <thead>
                        <tr className="bg-emerald-50/55 border-b border-emerald-100 text-emerald-950">
                          <th className="py-3 px-3 font-extrabold text-xs uppercase w-12 text-center rounded-tl-xl border-r border-emerald-100/30">
                            No
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase w-32 border-r border-emerald-100/30">
                            Tanggal
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase w-32 border-r border-emerald-100/30">
                            No. RM
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase min-w-[170px] border-r border-emerald-100/30">
                            Nama Pasien
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase text-center w-44 border-r border-emerald-100/30">
                            Double Check Dilakukan (Ya / Tidak)
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase text-center w-44 border-r border-emerald-100/30">
                            Dokumentasi Lengkap
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase text-center w-36 border-r border-emerald-100/30">
                            Hasil
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase w-14 text-center rounded-tr-xl">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {highAlertGrid.length === 0 ? (
                          <tr>
                            <td
                              colSpan={8}
                              className="py-12 text-center text-gray-400 text-xs italic font-semibold border-b border-emerald-50 bg-[#fafdfc]"
                            >
                              Belum ada data audit obat high alert. Klik &quot;Tambah Pasien&quot; untuk mulai mengisi formulir.
                            </td>
                          </tr>
                        ) : (
                          highAlertGrid.map((row, idx) => (
                            <tr
                              key={`${row.id}-${idx}`}
                              className="border-b border-gray-100 hover:bg-emerald-50/15 transition-colors"
                            >
                              <td className="py-3 px-3 text-center text-xs font-bold text-gray-500 border-r border-emerald-50">
                                {idx + 1}
                              </td>
                              <td className="py-3 px-3 border-r border-emerald-50">
                                <input
                                  type="date"
                                  value={row.tanggal}
                                  onChange={(e) =>
                                    handleUpdateHighAlert(row.id, "tanggal", e.target.value)
                                  }
                                  className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
                                />
                              </td>
                              <td className="py-3 px-3 border-r border-emerald-50">
                                <input
                                  type="text"
                                  placeholder="No. RM"
                                  value={row.no_rm}
                                  onChange={(e) =>
                                    handleUpdateHighAlert(row.id, "no_rm", e.target.value)
                                  }
                                  className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
                                />
                              </td>
                              <td className="py-3 px-3 border-r border-emerald-50">
                                <input
                                  type="text"
                                  placeholder="Nama Pasien"
                                  value={row.nama_pasien}
                                  onChange={(e) =>
                                    handleUpdateHighAlert(row.id, "nama_pasien", e.target.value)
                                  }
                                  className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
                                />
                              </td>
                              {(["double_check", "dokumentasi_lengkap"] as const).map((fieldKey) => {
                                const val = row[fieldKey];
                                return (
                                  <td
                                    key={fieldKey}
                                    className="py-3 px-2 text-center border-r border-emerald-50"
                                  >
                                    <div className="flex items-center gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleUpdateHighAlert(row.id, fieldKey, "Ya")
                                        }
                                        className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-black border transition-all ${
                                          val === "Ya"
                                            ? "bg-emerald-600 text-white border-emerald-700"
                                            : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-emerald-50"
                                        }`}
                                      >
                                        Ya
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleUpdateHighAlert(row.id, fieldKey, "Tidak")
                                        }
                                        className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-black border transition-all ${
                                          val === "Tidak"
                                            ? "bg-rose-600 text-white border-rose-700"
                                            : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-rose-50"
                                        }`}
                                      >
                                        Tidak
                                      </button>
                                    </div>
                                  </td>
                                );
                              })}
                              <td className="py-3 px-2 text-center border-r border-emerald-50">
                                <select
                                  value={row.hasil}
                                  onChange={(e) =>
                                    handleUpdateHighAlert(row.id, "hasil", e.target.value)
                                  }
                                  className={`w-full h-8 rounded-lg outline-none text-[11px] font-extrabold text-center px-1 ${
                                    row.hasil === ""
                                      ? "bg-slate-100 text-slate-500"
                                      : row.hasil === "Patuh"
                                        ? "bg-emerald-600 text-white"
                                        : "bg-rose-600 text-white"
                                  }`}
                                >
                                  <option value="">-- Hasil --</option>
                                  <option value="Patuh">Patuh</option>
                                  <option value="Tidak Patuh">Tidak Patuh</option>
                                </select>
                              </td>
                              <td className="py-3 px-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveHighAlertRow(row.id)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                                  title="Hapus Baris"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="px-6 py-4 bg-emerald-50/70 border-t border-emerald-100 flex flex-wrap items-center justify-between gap-4">
                    <p className="text-xs font-bold text-emerald-900">
                      Patuh (Double Check &amp; Dokumentasi Lengkap):{" "}
                      <span className="font-black">
                        {highAlertGrid.filter((d) => d.hasil === "Patuh").length}
                      </span>{" "}
                      / Total Pemberian High Alert:{" "}
                      <span className="font-black">{highAlertGrid.length}</span>
                    </p>
                    <p className="text-xs font-extrabold text-emerald-800">
                      Nilai / Persentase Capaian:{" "}
                      <span className="text-sm font-black">{computedCapaian}%</span>
                    </p>
                  </div>
                </div>
              )}

              {/* Specialized Form: Presentase Kejadian Kekosongan Obat Essensial */}
              {isKekosonganObat && (
                <div className="bg-[#f8fafc] border border-white rounded-[28px] overflow-hidden shadow-[8px_8px_20px_rgba(160,175,195,0.2),-8px_-8px_20px_rgba(255,255,255,0.95)] animate-in fade-in">
                  <div className="bg-emerald-600 p-5 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <Activity size={20} className="text-white" />
                      <div>
                        <h3 className="font-extrabold text-white tracking-wide text-sm md:text-base">
                          Input Data Presentase Kejadian Kekosongan Obat Essensial
                        </h3>
                        <p className="text-[11px] font-semibold text-emerald-100">
                          Unit: {selectedUnit?.name || "-"} {selectedSubUnit ? `(${selectedSubUnit})` : ""} • Bulan: {formattedBulanLabel} • Target: ≤ 0%
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddKekosonganObatRow}
                      className="flex items-center gap-1.5 bg-white text-emerald-800 hover:bg-emerald-50 px-3.5 py-1.5 rounded-xl text-xs font-black transition-colors"
                    >
                      <Plus size={14} /> Tambah Baris Data
                    </button>
                  </div>

                  <div className="px-6 pt-4">
                    <p className="text-xs font-semibold text-slate-500">
                      Catat setiap item obat esensial yang mengalami kekosongan stok (atau ketik <strong>Nihil</strong> dengan jumlah kosong <strong>0</strong> bila seluruh obat esensial tersedia lengkap).
                    </p>
                  </div>

                  <div className="p-6 overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[980px]">
                      <thead>
                        <tr className="bg-emerald-50/55 border-b border-emerald-100 text-emerald-950">
                          <th className="py-3 px-3 font-extrabold text-xs uppercase w-12 text-center rounded-tl-xl border-r border-emerald-100/30">
                            No
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase w-32 border-r border-emerald-100/30">
                            Tanggal
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase w-32 border-r border-emerald-100/30">
                            No. RM
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase min-w-[150px] border-r border-emerald-100/30">
                            Nama Pasien
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase min-w-[230px] border-r border-emerald-100/30">
                            Jenis Obat Essensial Yang Kosong
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase text-center w-40 border-r border-emerald-100/30">
                            Jumlah Seluruh Obat Essensial
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase min-w-[150px] border-r border-emerald-100/30">
                            Keterangan
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase w-14 text-center rounded-tr-xl">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {kekosonganObatGrid.length === 0 ? (
                          <tr>
                            <td
                              colSpan={8}
                              className="py-12 text-center text-gray-400 text-xs italic font-semibold border-b border-emerald-50 bg-[#fafdfc]"
                            >
                              Belum ada data monitoring kekosongan obat. Klik &quot;Tambah Baris Data&quot; untuk memulai.
                            </td>
                          </tr>
                        ) : (
                          kekosonganObatGrid.map((row, idx) => (
                            <tr
                              key={`${row.id}-${idx}`}
                              className="border-b border-gray-100 hover:bg-emerald-50/15 transition-colors"
                            >
                              <td className="py-3 px-3 text-center text-xs font-bold text-gray-500 border-r border-emerald-50">
                                {idx + 1}
                              </td>
                              <td className="py-3 px-3 border-r border-emerald-50">
                                <input
                                  type="date"
                                  value={row.tanggal}
                                  onChange={(e) =>
                                    handleUpdateKekosonganObat(row.id, "tanggal", e.target.value)
                                  }
                                  className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
                                />
                              </td>
                              <td className="py-3 px-3 border-r border-emerald-50">
                                <input
                                  type="text"
                                  placeholder="No. RM / -"
                                  value={row.no_rm}
                                  onChange={(e) =>
                                    handleUpdateKekosonganObat(row.id, "no_rm", e.target.value)
                                  }
                                  className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
                                />
                              </td>
                              <td className="py-3 px-3 border-r border-emerald-50">
                                <input
                                  type="text"
                                  placeholder="Nama Pasien / Unit"
                                  value={row.nama_pasien}
                                  onChange={(e) =>
                                    handleUpdateKekosonganObat(row.id, "nama_pasien", e.target.value)
                                  }
                                  className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
                                />
                              </td>
                              <td className="py-3 px-3 border-r border-emerald-50">
                                <div className="space-y-1.5">
                                  <input
                                    type="text"
                                    placeholder="Nama obat kosong (ketik Nihil jika 0)"
                                    value={row.jenis_obat_kosong}
                                    onChange={(e) =>
                                      handleUpdateKekosonganObat(row.id, "jenis_obat_kosong", e.target.value)
                                    }
                                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 outline-none focus:border-emerald-400"
                                  />
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-[10px] font-bold text-slate-500">
                                      Jml Item Kosong:
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                      <input
                                        type="number"
                                        min="0"
                                        value={row.jumlah_kosong}
                                        onChange={(e) =>
                                          handleUpdateKekosonganObat(
                                            row.id,
                                            "jumlah_kosong",
                                            e.target.value === "" ? "" : Number(e.target.value),
                                          )
                                        }
                                        className="w-16 text-center bg-white border border-slate-200 rounded-md px-2 py-0.5 text-xs font-extrabold text-slate-800 outline-none focus:border-emerald-400"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => {
                                          handleUpdateKekosonganObat(row.id, "jenis_obat_kosong", "Nihil");
                                        }}
                                        className="px-2 py-0.5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] font-bold"
                                      >
                                        Nihil (0)
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-3 text-center border-r border-emerald-50">
                                <input
                                  type="number"
                                  min="1"
                                  placeholder="Mis. 150"
                                  value={row.jumlah_seluruh_obat}
                                  onChange={(e) =>
                                    handleUpdateKekosonganObat(
                                      row.id,
                                      "jumlah_seluruh_obat",
                                      e.target.value === "" ? "" : Number(e.target.value),
                                    )
                                  }
                                  className="w-full text-center bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-extrabold text-slate-800 outline-none focus:border-emerald-400"
                                />
                              </td>
                              <td className="py-3 px-3 border-r border-emerald-50">
                                <input
                                  type="text"
                                  placeholder="Keterangan (opsional)"
                                  value={row.keterangan}
                                  onChange={(e) =>
                                    handleUpdateKekosonganObat(row.id, "keterangan", e.target.value)
                                  }
                                  className="w-full bg-transparent outline-none text-xs font-medium text-slate-700"
                                />
                              </td>
                              <td className="py-3 px-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveKekosonganObatRow(row.id)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                                  title="Hapus Baris"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="px-6 py-4 bg-emerald-50/70 border-t border-emerald-100 flex flex-wrap items-center justify-between gap-4">
                    <p className="text-xs font-bold text-emerald-900">
                      Total Item Kosong:{" "}
                      <span className="font-black">
                        {kekosonganObatGrid.reduce(
                          (acc, curr) => acc + (Number(curr.jumlah_kosong) || 0),
                          0,
                        )}
                      </span>{" "}
                      / Total Obat Essensial:{" "}
                      <span className="font-black">
                        {Math.max(
                          0,
                          ...kekosonganObatGrid.map((r) => Number(r.jumlah_seluruh_obat) || 0),
                        )}
                      </span>
                    </p>
                    <p className="text-xs font-extrabold text-emerald-800">
                      Nilai / Persentase Kekosongan:{" "}
                      <span className="text-sm font-black">{computedCapaian}%</span>
                    </p>
                  </div>
                </div>
              )}

              {/* Specialized Form: Kepatuhan Terhadap Alur Klinis (Clinical Pathway) */}
              {isClinicalPathway && (
                <div className="bg-[#f8fafc] border border-white rounded-[28px] overflow-hidden shadow-[8px_8px_20px_rgba(160,175,195,0.2),-8px_-8px_20px_rgba(255,255,255,0.95)] animate-in fade-in">
                  <div className="bg-emerald-600 p-5 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <Activity size={20} className="text-white" />
                      <div>
                        <h3 className="font-extrabold text-white tracking-wide text-sm md:text-base">
                          Input Data Kepatuhan Clinical Pathway
                        </h3>
                        <p className="text-[11px] font-semibold text-emerald-100">
                          Unit: {selectedUnit?.name || "-"} {selectedSubUnit ? `(${selectedSubUnit})` : ""} • Bulan: {formattedBulanLabel}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddClinicalPathwayRow}
                      className="flex items-center gap-1.5 bg-white text-emerald-800 hover:bg-emerald-50 px-3.5 py-1.5 rounded-xl text-xs font-black transition-colors"
                    >
                      <Plus size={14} /> Tambah Pasien
                    </button>
                  </div>

                  <div className="p-6 overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1060px]">
                      <thead>
                        <tr className="bg-emerald-50/55 border-b border-emerald-100 text-emerald-950">
                          <th className="py-3 px-3 font-extrabold text-xs uppercase w-12 text-center rounded-tl-xl border-r border-emerald-100/30">
                            No
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase w-32 border-r border-emerald-100/30">
                            Tanggal
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase min-w-[160px] border-r border-emerald-100/30">
                            Nama Pasien
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase w-32 border-r border-emerald-100/30">
                            No. RM
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase min-w-[200px] border-r border-emerald-100/30">
                            Nama DPJP
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase text-center w-32 border-r border-emerald-100/30">
                            LOS
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase text-center w-32 border-r border-emerald-100/30">
                            Obat
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase text-center w-32 border-r border-emerald-100/30">
                            Penunjang
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase text-center w-36 border-r border-emerald-100/30">
                            Keterangan
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase w-14 text-center rounded-tr-xl">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {clinicalPathwayGrid.length === 0 ? (
                          <tr>
                            <td
                              colSpan={10}
                              className="py-12 text-center text-gray-400 text-xs italic font-semibold border-b border-emerald-50 bg-[#fafdfc]"
                            >
                              Belum ada baris data Clinical Pathway. Klik &quot;Tambah Pasien&quot; untuk memulai audit pasien.
                            </td>
                          </tr>
                        ) : (
                          clinicalPathwayGrid.map((row, idx) => (
                            <tr
                              key={`${row.id}-${idx}`}
                              className="border-b border-gray-100 hover:bg-emerald-50/15 transition-colors"
                            >
                              <td className="py-3 px-3 text-center text-xs font-bold text-gray-500 border-r border-emerald-50">
                                {idx + 1}
                              </td>
                              <td className="py-3 px-3 border-r border-emerald-50">
                                <input
                                  type="date"
                                  value={row.tanggal}
                                  onChange={(e) =>
                                    handleUpdateClinicalPathway(row.id, "tanggal", e.target.value)
                                  }
                                  className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
                                />
                              </td>
                              <td className="py-3 px-3 border-r border-emerald-50">
                                <input
                                  type="text"
                                  placeholder="Nama Pasien"
                                  value={row.nama_pasien}
                                  onChange={(e) =>
                                    handleUpdateClinicalPathway(row.id, "nama_pasien", e.target.value)
                                  }
                                  className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
                                />
                              </td>
                              <td className="py-3 px-3 border-r border-emerald-50">
                                <input
                                  type="text"
                                  placeholder="No. RM"
                                  value={row.no_rm}
                                  onChange={(e) =>
                                    handleUpdateClinicalPathway(row.id, "no_rm", e.target.value)
                                  }
                                  className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
                                />
                              </td>
                              <td className="py-3 px-3 border-r border-emerald-50">
                                <select
                                  value={row.nama_dpjp}
                                  onChange={(e) =>
                                    handleUpdateClinicalPathway(row.id, "nama_dpjp", e.target.value)
                                  }
                                  className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
                                >
                                  <option value="">-- Pilih DPJP --</option>
                                  {RSUD_DPJP_LIST.map((dok) => (
                                    <option key={dok} value={dok}>
                                      {dok}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              {(["los", "obat", "penunjang"] as const).map((fieldKey) => {
                                const val = row[fieldKey];
                                return (
                                  <td
                                    key={fieldKey}
                                    className="py-3 px-2 text-center border-r border-emerald-50"
                                  >
                                    <select
                                      value={val}
                                      onChange={(e) =>
                                        handleUpdateClinicalPathway(row.id, fieldKey, e.target.value)
                                      }
                                      className={`w-full h-8 rounded-lg outline-none text-[11px] font-bold text-center px-1 ${
                                        val === ""
                                          ? "bg-slate-100 text-slate-500"
                                          : val === "Sesuai"
                                            ? "bg-emerald-100 text-emerald-800"
                                            : "bg-rose-100 text-rose-800"
                                      }`}
                                    >
                                      <option value="">-- Pilih --</option>
                                      <option value="Sesuai">Sesuai</option>
                                      <option value="Tidak Sesuai">Tidak Sesuai</option>
                                    </select>
                                  </td>
                                );
                              })}
                              <td className="py-3 px-2 text-center border-r border-emerald-50">
                                <select
                                  value={row.keterangan}
                                  onChange={(e) =>
                                    handleUpdateClinicalPathway(row.id, "keterangan", e.target.value)
                                  }
                                  className={`w-full h-8 rounded-lg outline-none text-[11px] font-extrabold text-center px-1 ${
                                    row.keterangan === ""
                                      ? "bg-slate-100 text-slate-500"
                                      : row.keterangan === "Patuh"
                                        ? "bg-emerald-600 text-white"
                                        : "bg-rose-600 text-white"
                                  }`}
                                >
                                  <option value="">-- Status --</option>
                                  <option value="Patuh">Patuh</option>
                                  <option value="Tidak Patuh">Tidak Patuh</option>
                                </select>
                              </td>
                              <td className="py-3 px-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveClinicalPathwayRow(row.id)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                                  title="Hapus Baris"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="px-6 py-4 bg-emerald-50/70 border-t border-emerald-100 flex flex-wrap items-center justify-between gap-4">
                    <p className="text-xs font-bold text-emerald-900">
                      Patuh (LOS, Obat &amp; Penunjang Sesuai):{" "}
                      <span className="font-black">
                        {clinicalPathwayGrid.filter((d) => d.keterangan === "Patuh").length}
                      </span>{" "}
                      / Total Pasien: <span className="font-black">{clinicalPathwayGrid.length}</span>
                    </p>
                    <p className="text-xs font-extrabold text-emerald-800">
                      Nilai / Persentase Capaian:{" "}
                      <span className="text-sm font-black">{computedCapaian}%</span>
                    </p>
                  </div>
                </div>
              )}

              {/* Specialized Form: Pelaksanaan Verifikasi 1x24 Jam Instruksi Melalui Telepon Oleh DPJP */}
              {isVerifikasiTelepon && (
                <div className="bg-[#f8fafc] border border-white rounded-[28px] overflow-hidden shadow-[8px_8px_20px_rgba(160,175,195,0.2),-8px_-8px_20px_rgba(255,255,255,0.95)] animate-in fade-in">
                  <div className="bg-emerald-600 p-5 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <Clock size={20} className="text-white" />
                      <div>
                        <h3 className="font-extrabold text-white tracking-wide text-sm md:text-base">
                          Pelaksanaan Verifikasi 1x24 Jam Pada Instruksi Melalui Telepon Oleh DPJP
                        </h3>
                        <p className="text-[11px] font-semibold text-emerald-100">
                          Unit: {selectedUnit?.name || "-"} {selectedSubUnit ? `(${selectedSubUnit})` : ""} • Bulan: {formattedBulanLabel}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddVerifikasiTeleponRow}
                      className="flex items-center gap-1.5 bg-white text-emerald-800 hover:bg-emerald-50 px-3.5 py-1.5 rounded-xl text-xs font-black transition-colors"
                    >
                      <Plus size={14} /> Tambah Pasien
                    </button>
                  </div>

                  <div className="p-6 overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[980px]">
                      <thead>
                        <tr className="bg-emerald-50/55 border-b border-emerald-100 text-emerald-950">
                          <th className="py-3 px-3 font-extrabold text-xs uppercase w-12 text-center rounded-tl-xl border-r border-emerald-100/30">
                            No
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase w-32 border-r border-emerald-100/30">
                            Tanggal
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase w-32 border-r border-emerald-100/30">
                            No. RM
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase min-w-[160px] border-r border-emerald-100/30">
                            Nama Pasien
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase text-center w-36 border-r border-emerald-100/30">
                            Jam Instruksi Lewat Telepon
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase text-center w-36 border-r border-emerald-100/30">
                            Jam Verifikasi DPJP
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase min-w-[240px] border-r border-emerald-100/30">
                            Keterangan (Status 1x24 Jam)
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase w-14 text-center rounded-tr-xl">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {verifikasiTeleponGrid.length === 0 ? (
                          <tr>
                            <td
                              colSpan={8}
                              className="py-12 text-center text-gray-400 text-xs italic font-semibold border-b border-emerald-50 bg-[#fafdfc]"
                            >
                              Belum ada data instruksi telepon DPJP. Klik &quot;Tambah Pasien&quot; untuk mulai mencatat verifikasi.
                            </td>
                          </tr>
                        ) : (
                          verifikasiTeleponGrid.map((row, idx) => {
                            const hasTimes = row.jam_instruksi !== "" && row.jam_verifikasi !== "";
                            const diffMins = hasTimes
                              ? calculateMinutesDiff(row.jam_instruksi, row.jam_verifikasi)
                              : 0;
                            const diffH = Math.floor(diffMins / 60);
                            const diffM = diffMins % 60;

                            return (
                              <tr
                                key={`${row.id}-${idx}`}
                                className="border-b border-gray-100 hover:bg-emerald-50/15 transition-colors"
                              >
                                <td className="py-3 px-3 text-center text-xs font-bold text-gray-500 border-r border-emerald-50">
                                  {idx + 1}
                                </td>
                                <td className="py-3 px-3 border-r border-emerald-50">
                                  <input
                                    type="date"
                                    value={row.tanggal}
                                    onChange={(e) =>
                                      handleUpdateVerifikasiTelepon(row.id, "tanggal", e.target.value)
                                    }
                                    className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
                                  />
                                </td>
                                <td className="py-3 px-3 border-r border-emerald-50">
                                  <input
                                    type="text"
                                    placeholder="No. RM"
                                    value={row.no_rm}
                                    onChange={(e) =>
                                      handleUpdateVerifikasiTelepon(row.id, "no_rm", e.target.value)
                                    }
                                    className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
                                  />
                                </td>
                                <td className="py-3 px-3 border-r border-emerald-50">
                                  <input
                                    type="text"
                                    placeholder="Nama Pasien"
                                    value={row.nama_pasien}
                                    onChange={(e) =>
                                      handleUpdateVerifikasiTelepon(row.id, "nama_pasien", e.target.value)
                                    }
                                    className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
                                  />
                                </td>
                                <td className="py-3 px-3 text-center border-r border-emerald-50">
                                  <input
                                    type="time"
                                    value={row.jam_instruksi}
                                    onChange={(e) =>
                                      handleUpdateVerifikasiTelepon(row.id, "jam_instruksi", e.target.value)
                                    }
                                    className="w-full bg-transparent outline-none text-xs font-bold text-slate-800 text-center"
                                  />
                                </td>
                                <td className="py-3 px-3 text-center border-r border-emerald-50">
                                  <input
                                    type="time"
                                    value={row.jam_verifikasi}
                                    onChange={(e) =>
                                      handleUpdateVerifikasiTelepon(row.id, "jam_verifikasi", e.target.value)
                                    }
                                    className="w-full bg-transparent outline-none text-xs font-bold text-slate-800 text-center"
                                  />
                                </td>
                                <td className="py-3 px-3 border-r border-emerald-50">
                                  <div className="space-y-1.5">
                                    <div className="flex items-center gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleUpdateVerifikasiTelepon(row.id, "terverifikasi_24jam", true)
                                        }
                                        className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-black border transition-all ${
                                          row.terverifikasi_24jam === true
                                            ? "bg-emerald-600 text-white border-emerald-700"
                                            : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-emerald-50"
                                        }`}
                                      >
                                        Sesuai ≤ 24 Jam
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleUpdateVerifikasiTelepon(row.id, "terverifikasi_24jam", false)
                                        }
                                        className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-black border transition-all ${
                                          row.terverifikasi_24jam === false
                                            ? "bg-rose-600 text-white border-rose-700"
                                            : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-rose-50"
                                        }`}
                                      >
                                        &gt; 24 Jam
                                      </button>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {hasTimes && (
                                        <span className="text-[10px] font-bold text-slate-500 shrink-0">
                                          Selisih: {diffH}j {diffM}m
                                        </span>
                                      )}
                                      <input
                                        type="text"
                                        placeholder="Catatan (opsional)"
                                        value={row.keterangan}
                                        onChange={(e) =>
                                          handleUpdateVerifikasiTelepon(row.id, "keterangan", e.target.value)
                                        }
                                        className="w-full bg-white/80 border border-slate-200 rounded-md px-2 py-1 text-[11px] font-medium text-slate-700 outline-none focus:border-emerald-400"
                                      />
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 px-3 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveVerifikasiTeleponRow(row.id)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                                    title="Hapus Baris"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="px-6 py-4 bg-emerald-50/70 border-t border-emerald-100 flex flex-wrap items-center justify-between gap-4">
                    <p className="text-xs font-bold text-emerald-900">
                      Terverifikasi 1x24 Jam:{" "}
                      <span className="font-black">
                        {verifikasiTeleponGrid.filter((d) => d.terverifikasi_24jam === true).length}
                      </span>{" "}
                      / Total Instruksi:{" "}
                      <span className="font-black">{verifikasiTeleponGrid.length}</span>
                    </p>
                    <p className="text-xs font-extrabold text-emerald-800">
                      Nilai / Persentase Capaian:{" "}
                      <span className="text-sm font-black">{computedCapaian}%</span>
                    </p>
                  </div>
                </div>
              )}

              {/* Unified Observation Table: Ya / Tidak (Skrining Jatuh Anak, Skrining Disfagia, Asesmen Awal Medis 24 Jam, Reasesmen Nyeri) */}
              {yaTidakConfig && (
                <div className="bg-[#f8fafc] border border-white rounded-[28px] overflow-hidden shadow-[8px_8px_20px_rgba(160,175,195,0.2),-8px_-8px_20px_rgba(255,255,255,0.95)] animate-in fade-in">
                  <div className="bg-emerald-600 p-5 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <Activity size={20} className="text-white" />
                      <div>
                        <h3 className="font-extrabold text-white tracking-wide text-sm md:text-base">
                          {yaTidakConfig.tableTitle}
                        </h3>
                        <p className="text-[11px] font-semibold text-emerald-100">
                          Unit: {selectedUnit?.name || "-"} {selectedSubUnit ? `(${selectedSubUnit})` : ""} • Bulan: {formattedBulanLabel}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddYaTidakRow}
                      className="flex items-center gap-1.5 bg-white text-emerald-800 hover:bg-emerald-50 px-3.5 py-1.5 rounded-xl text-xs font-black transition-colors"
                    >
                      <Plus size={14} /> Tambah Pasien
                    </button>
                  </div>

                  <div className="px-6 pt-4">
                    <p className="text-xs font-semibold text-slate-500">
                      {yaTidakConfig.subtitle}
                    </p>
                  </div>

                  <div className="p-6 overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                      <thead>
                        <tr className="bg-emerald-50/55 border-b border-emerald-100 text-emerald-950">
                          <th className="py-3 px-3 font-extrabold text-xs uppercase w-12 text-center rounded-tl-xl border-r border-emerald-100/30">
                            No
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase w-32 border-r border-emerald-100/30">
                            Tanggal
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase w-32 border-r border-emerald-100/30">
                            No. RM
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase min-w-[180px] border-r border-emerald-100/30">
                            Nama Pasien
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase text-center w-40 border-r border-emerald-100/30">
                            {yaTidakConfig.yesHeader}
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase text-center w-40 border-r border-emerald-100/30">
                            {yaTidakConfig.noHeader}
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase min-w-[170px] border-r border-emerald-100/30">
                            Keterangan
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase w-14 text-center rounded-tr-xl">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {yaTidakGrid.length === 0 ? (
                          <tr>
                            <td
                              colSpan={8}
                              className="py-12 text-center text-gray-400 text-xs italic font-semibold border-b border-emerald-50 bg-[#fafdfc]"
                            >
                              Belum ada data pasien diinput. Klik &quot;Tambah Pasien&quot; untuk mulai mengisi tabel observasi.
                            </td>
                          </tr>
                        ) : (
                          yaTidakGrid.map((row, idx) => (
                            <tr
                              key={`${row.id}-${idx}`}
                              className="border-b border-gray-100 hover:bg-emerald-50/15 transition-colors"
                            >
                              <td className="py-3 px-3 text-center text-xs font-bold text-gray-500 border-r border-emerald-50">
                                {idx + 1}
                              </td>
                              <td className="py-3 px-3 border-r border-emerald-50">
                                <input
                                  type="date"
                                  value={row.tanggal}
                                  onChange={(e) =>
                                    handleUpdateYaTidak(row.id, "tanggal", e.target.value)
                                  }
                                  className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
                                />
                              </td>
                              <td className="py-3 px-3 border-r border-emerald-50">
                                <input
                                  type="text"
                                  placeholder="No. RM"
                                  value={row.no_rm}
                                  onChange={(e) =>
                                    handleUpdateYaTidak(row.id, "no_rm", e.target.value)
                                  }
                                  className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
                                />
                              </td>
                              <td className="py-3 px-3 border-r border-emerald-50">
                                <input
                                  type="text"
                                  placeholder="Nama Pasien"
                                  value={row.nama_pasien}
                                  onChange={(e) =>
                                    handleUpdateYaTidak(row.id, "nama_pasien", e.target.value)
                                  }
                                  className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
                                />
                              </td>
                              <td className="py-3 px-3 text-center border-r border-emerald-50">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleUpdateYaTidak(row.id, "status_ya", !row.status_ya)
                                  }
                                  className={`w-full py-1.5 px-3 rounded-xl text-xs font-black border transition-all inline-flex items-center justify-center gap-1.5 ${
                                    row.status_ya
                                      ? "bg-emerald-600 text-white border-emerald-700 shadow-xs"
                                      : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-emerald-50"
                                  }`}
                                >
                                  {row.status_ya && <Check size={13} />}
                                  <span>Ya</span>
                                </button>
                              </td>
                              <td className="py-3 px-3 text-center border-r border-emerald-50">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleUpdateYaTidak(row.id, "status_tidak", !row.status_tidak)
                                  }
                                  className={`w-full py-1.5 px-3 rounded-xl text-xs font-black border transition-all inline-flex items-center justify-center gap-1.5 ${
                                    row.status_tidak
                                      ? "bg-rose-600 text-white border-rose-700 shadow-xs"
                                      : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-rose-50"
                                  }`}
                                >
                                  {row.status_tidak && <X size={13} />}
                                  <span>Tidak</span>
                                </button>
                              </td>
                              <td className="py-3 px-3 border-r border-emerald-50">
                                <input
                                  type="text"
                                  placeholder="Keterangan (opsional)"
                                  value={row.keterangan}
                                  onChange={(e) =>
                                    handleUpdateYaTidak(row.id, "keterangan", e.target.value)
                                  }
                                  className="w-full bg-transparent outline-none text-xs font-medium text-slate-700"
                                />
                              </td>
                              <td className="py-3 px-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveYaTidakRow(row.id)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                                  title="Hapus Baris"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="px-6 py-4 bg-emerald-50/70 border-t border-emerald-100 flex flex-wrap items-center justify-between gap-4">
                    <p className="text-xs font-bold text-emerald-900">
                      Sesuai / Dilakukan (Ya):{" "}
                      <span className="font-black">
                        {yaTidakGrid.filter((d) => d.status_ya).length}
                      </span>{" "}
                      / Total Pasien: <span className="font-black">{yaTidakGrid.length}</span>
                    </p>
                    <p className="text-xs font-extrabold text-emerald-800">
                      Nilai / Persentase Capaian:{" "}
                      <span className="text-sm font-black">{computedCapaian}%</span>
                    </p>
                  </div>
                </div>
              )}

              {/* Specialized Form: Kepatuhan Pelaksanaan Dokumen SBAR Pada Rekam Medis (Fatimah / Usman) */}
              {isSBAR && (
                <div className="bg-[#f8fafc] border border-white rounded-[28px] overflow-hidden shadow-[8px_8px_20px_rgba(160,175,195,0.2),-8px_-8px_20px_rgba(255,255,255,0.95)] animate-in fade-in">
                  <div className="bg-emerald-600 p-5 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <Activity size={20} className="text-white" />
                      <div>
                        <h3 className="font-extrabold text-white tracking-wide text-sm md:text-base">
                          Formulir Kepatuhan Pelaksanaan Dokumen SBAR Pada Rekam Medis
                        </h3>
                        <p className="text-[11px] font-semibold text-emerald-100">
                          Unit: {selectedUnit?.name || "-"} {selectedSubUnit ? `(${selectedSubUnit})` : ""} • Bulan: {formattedBulanLabel}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddSBARRow}
                      className="flex items-center gap-1.5 bg-white text-emerald-800 hover:bg-emerald-50 px-3.5 py-1.5 rounded-xl text-xs font-black transition-colors"
                    >
                      <Plus size={14} /> Tambah Pasien
                    </button>
                  </div>

                  <div className="p-6 overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1120px]">
                      <thead>
                        <tr className="bg-emerald-50/55 border-b border-emerald-100 text-emerald-950">
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase w-10 text-center rounded-tl-xl border-r border-emerald-100/30">
                            No
                          </th>
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase w-32 border-r border-emerald-100/30">
                            Tanggal
                          </th>
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase w-28 border-r border-emerald-100/30">
                            No. RM
                          </th>
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase min-w-[150px] border-r border-emerald-100/30">
                            Nama Pasien
                          </th>
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase w-32 border-r border-emerald-100/30">
                            Tanggal Konsul
                          </th>
                          {(
                            [
                              { key: "situation", label: "Situation" },
                              { key: "background", label: "Background" },
                              { key: "assesment", label: "Assesment" },
                              { key: "recomendation", label: "Recomendation" },
                              { key: "verifikasi", label: "Verifikasi" },
                            ] as const
                          ).map((col) => (
                            <th
                              key={col.key}
                              className="py-3 px-2 font-extrabold text-[11px] uppercase text-center w-28 border-r border-emerald-100/30"
                            >
                              {col.label}
                            </th>
                          ))}
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase w-14 text-center rounded-tr-xl">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {sbarGrid.length === 0 ? (
                          <tr>
                            <td
                              colSpan={11}
                              className="py-12 text-center text-gray-400 text-xs italic font-semibold border-b border-emerald-50 bg-[#fafdfc]"
                            >
                              Belum ada data dokumen SBAR. Klik &quot;Tambah Pasien&quot; untuk mulai audit kelengkapan SBAR.
                            </td>
                          </tr>
                        ) : (
                          sbarGrid.map((row, idx) => (
                            <tr
                              key={`${row.id}-${idx}`}
                              className="border-b border-gray-100 hover:bg-emerald-50/15 transition-colors"
                            >
                              <td className="py-3 px-2.5 text-center text-xs font-bold text-gray-500 border-r border-emerald-50">
                                {idx + 1}
                              </td>
                              <td className="py-3 px-2.5 border-r border-emerald-50">
                                <input
                                  type="date"
                                  value={row.tanggal}
                                  onChange={(e) =>
                                    handleUpdateSBAR(row.id, "tanggal", e.target.value)
                                  }
                                  className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
                                />
                              </td>
                              <td className="py-3 px-2.5 border-r border-emerald-50">
                                <input
                                  type="text"
                                  placeholder="No. RM"
                                  value={row.no_rm}
                                  onChange={(e) =>
                                    handleUpdateSBAR(row.id, "no_rm", e.target.value)
                                  }
                                  className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
                                />
                              </td>
                              <td className="py-3 px-2.5 border-r border-emerald-50">
                                <input
                                  type="text"
                                  placeholder="Nama Pasien"
                                  value={row.nama_pasien}
                                  onChange={(e) =>
                                    handleUpdateSBAR(row.id, "nama_pasien", e.target.value)
                                  }
                                  className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
                                />
                              </td>
                              <td className="py-3 px-2.5 border-r border-emerald-50">
                                <input
                                  type="date"
                                  value={row.tanggal_konsul}
                                  onChange={(e) =>
                                    handleUpdateSBAR(row.id, "tanggal_konsul", e.target.value)
                                  }
                                  className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
                                />
                              </td>
                              {(
                                [
                                  "situation",
                                  "background",
                                  "assesment",
                                  "recomendation",
                                  "verifikasi",
                                ] as const
                              ).map((fieldKey) => {
                                const val = row[fieldKey];
                                return (
                                  <td
                                    key={fieldKey}
                                    className="py-3 px-1.5 text-center border-r border-emerald-50"
                                  >
                                    <div className="flex items-center gap-1">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleUpdateSBAR(row.id, fieldKey, "Ya")
                                        }
                                        className={`flex-1 py-1 px-1.5 rounded-lg text-[10px] font-black border transition-all ${
                                          val === "Ya"
                                            ? "bg-emerald-600 text-white border-emerald-700"
                                            : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-emerald-50"
                                        }`}
                                      >
                                        Ya
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleUpdateSBAR(row.id, fieldKey, "Tidak")
                                        }
                                        className={`flex-1 py-1 px-1.5 rounded-lg text-[10px] font-black border transition-all ${
                                          val === "Tidak"
                                            ? "bg-rose-600 text-white border-rose-700"
                                            : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-rose-50"
                                        }`}
                                      >
                                        Tdk
                                      </button>
                                    </div>
                                  </td>
                                );
                              })}
                              <td className="py-3 px-2.5 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSBARRow(row.id)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                                  title="Hapus Baris"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="px-6 py-4 bg-emerald-50/70 border-t border-emerald-100 flex flex-wrap items-center justify-between gap-4">
                    <p className="text-xs font-bold text-emerald-900">
                      Lengkap SBAR &amp; Verifikasi:{" "}
                      <span className="font-black">
                        {
                          sbarGrid.filter(
                            (d) =>
                              d.situation === "Ya" &&
                              d.background === "Ya" &&
                              d.assesment === "Ya" &&
                              d.recomendation === "Ya" &&
                              d.verifikasi === "Ya",
                          ).length
                        }
                      </span>{" "}
                      / Total Pasien: <span className="font-black">{sbarGrid.length}</span>
                    </p>
                    <p className="text-xs font-extrabold text-emerald-800">
                      Nilai / Persentase Capaian:{" "}
                      <span className="text-sm font-black">{computedCapaian}%</span>
                    </p>
                  </div>
                </div>
              )}

              {/* Specialized Form: Penundaan Operasi Elektif (IBS - Target < 5%) */}
              {isPenundaanOperasi && (
                <div className="bg-[#f8fafc] border border-white rounded-[28px] overflow-hidden shadow-[8px_8px_20px_rgba(160,175,195,0.2),-8px_-8px_20px_rgba(255,255,255,0.95)] animate-in fade-in">
                  <div className="bg-emerald-600 p-5 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <Clock size={20} className="text-white" />
                      <div>
                        <h3 className="font-extrabold text-white tracking-wide text-sm md:text-base">
                          Formulir Penundaan Operasi Elektif (Target &lt; 5%)
                        </h3>
                        <p className="text-[11px] font-semibold text-emerald-100">
                          Unit: {selectedUnit?.name || "-"} {selectedSubUnit ? `(${selectedSubUnit})` : ""} • Bulan: {formattedBulanLabel}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddPenundaanRow}
                      className="flex items-center gap-1.5 bg-white text-emerald-800 hover:bg-emerald-50 px-3.5 py-1.5 rounded-xl text-xs font-black transition-colors"
                    >
                      <Plus size={14} /> Tambah Pasien
                    </button>
                  </div>

                  <div className="p-6 overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1040px]">
                      <thead>
                        <tr className="bg-emerald-50/55 border-b border-emerald-100 text-emerald-950">
                          <th className="py-3 px-3 font-extrabold text-xs uppercase w-12 text-center rounded-tl-xl border-r border-emerald-100/30">
                            No
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase w-32 border-r border-emerald-100/30">
                            Tanggal
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase w-32 border-r border-emerald-100/30">
                            No. Rekam Medis
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase min-w-[160px] border-r border-emerald-100/30">
                            Nama Pasien
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase text-center w-36 border-r border-emerald-100/30">
                            Jam Rencana Operasi Elektif
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase text-center w-36 border-r border-emerald-100/30">
                            Jam Pelaksanaan Operasi Elektif
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase text-center w-32 border-r border-emerald-100/30">
                            Interval Waktu
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase min-w-[210px] border-r border-emerald-100/30">
                            Keterangan
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase w-14 text-center rounded-tr-xl">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {penundaanGrid.length === 0 ? (
                          <tr>
                            <td
                              colSpan={9}
                              className="py-12 text-center text-gray-400 text-xs italic font-semibold border-b border-emerald-50 bg-[#fafdfc]"
                            >
                              Belum ada data operasi elektif. Klik &quot;Tambah Pasien&quot; untuk mencatat jadwal dan waktu pelaksanaan operasi.
                            </td>
                          </tr>
                        ) : (
                          penundaanGrid.map((row, idx) => {
                            const hasTimes =
                              row.jam_rencana !== "" && row.jam_pelaksanaan !== "";
                            const isDelayed = row.tertunda_lebih_60 === true;

                            return (
                              <tr
                                key={`${row.id}-${idx}`}
                                className="border-b border-gray-100 hover:bg-emerald-50/15 transition-colors"
                              >
                                <td className="py-3 px-3 text-center text-xs font-bold text-gray-500 border-r border-emerald-50">
                                  {idx + 1}
                                </td>
                                <td className="py-3 px-3 border-r border-emerald-50">
                                  <input
                                    type="date"
                                    value={row.tanggal}
                                    onChange={(e) =>
                                      handleUpdatePenundaan(row.id, "tanggal", e.target.value)
                                    }
                                    className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
                                  />
                                </td>
                                <td className="py-3 px-3 border-r border-emerald-50">
                                  <input
                                    type="text"
                                    placeholder="No. RM"
                                    value={row.no_rm}
                                    onChange={(e) =>
                                      handleUpdatePenundaan(row.id, "no_rm", e.target.value)
                                    }
                                    className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
                                  />
                                </td>
                                <td className="py-3 px-3 border-r border-emerald-50">
                                  <input
                                    type="text"
                                    placeholder="Nama Pasien"
                                    value={row.nama_pasien}
                                    onChange={(e) =>
                                      handleUpdatePenundaan(row.id, "nama_pasien", e.target.value)
                                    }
                                    className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
                                  />
                                </td>
                                <td className="py-3 px-3 text-center border-r border-emerald-50">
                                  <input
                                    type="time"
                                    value={row.jam_rencana}
                                    onChange={(e) =>
                                      handleUpdatePenundaan(row.id, "jam_rencana", e.target.value)
                                    }
                                    className="w-full bg-transparent outline-none text-xs font-bold text-slate-800 text-center"
                                  />
                                </td>
                                <td className="py-3 px-3 text-center border-r border-emerald-50">
                                  <input
                                    type="time"
                                    value={row.jam_pelaksanaan}
                                    onChange={(e) =>
                                      handleUpdatePenundaan(row.id, "jam_pelaksanaan", e.target.value)
                                    }
                                    className="w-full bg-transparent outline-none text-xs font-bold text-slate-800 text-center"
                                  />
                                </td>
                                <td className="py-3 px-3 text-center border-r border-emerald-50">
                                  {hasTimes ? (
                                    <span
                                      className={`inline-block px-2.5 py-1 rounded-lg text-[11px] font-black ${
                                        row.interval_menit > 60
                                          ? "bg-rose-100 text-rose-800"
                                          : "bg-emerald-100 text-emerald-800"
                                      }`}
                                    >
                                      {row.interval_menit} Menit
                                    </span>
                                  ) : (
                                    <span className="text-xs text-gray-400">-</span>
                                  )}
                                </td>
                                <td className="py-3 px-3 border-r border-emerald-50">
                                  <div className="space-y-1.5">
                                    <div className="flex items-center gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleUpdatePenundaan(row.id, "tertunda_lebih_60", false)
                                        }
                                        className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-black border transition-all ${
                                          row.tertunda_lebih_60 === false
                                            ? "bg-emerald-600 text-white border-emerald-700"
                                            : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-emerald-50"
                                        }`}
                                      >
                                        Tepat (≤ 1 Jam)
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleUpdatePenundaan(row.id, "tertunda_lebih_60", true)
                                        }
                                        className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-black border transition-all ${
                                          isDelayed
                                            ? "bg-rose-600 text-white border-rose-700"
                                            : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-rose-50"
                                        }`}
                                      >
                                        Tunda &gt; 1 Jam
                                      </button>
                                    </div>
                                    <input
                                      type="text"
                                      placeholder="Catatan (opsional)"
                                      value={row.keterangan}
                                      onChange={(e) =>
                                        handleUpdatePenundaan(row.id, "keterangan", e.target.value)
                                      }
                                      className="w-full bg-white/80 border border-slate-200 rounded-md px-2 py-1 text-[11px] font-medium text-slate-700 outline-none focus:border-emerald-400"
                                    />
                                  </div>
                                </td>
                                <td className="py-3 px-3 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleRemovePenundaanRow(row.id)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                                    title="Hapus Baris"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="px-6 py-4 bg-emerald-50/70 border-t border-emerald-100 flex flex-wrap items-center justify-between gap-4">
                    <p className="text-xs font-bold text-emerald-900">
                      Tertunda &gt; 1 Jam:{" "}
                      <span className="font-black">
                        {penundaanGrid.filter((d) => d.tertunda_lebih_60 === true).length}
                      </span>{" "}
                      / Total Operasi Elektif: <span className="font-black">{penundaanGrid.length}</span>
                    </p>
                    <p className="text-xs font-extrabold text-emerald-800">
                      Nilai / Persentase Penundaan:{" "}
                      <span className="text-sm font-black">{computedCapaian}%</span>
                    </p>
                  </div>
                </div>
              )}

              {/* Specialized Form: Surgical Safety Checklist (IBS) */}
              {isSurgicalSafety && (
                <div className="bg-[#f8fafc] border border-white rounded-[28px] overflow-hidden shadow-[8px_8px_20px_rgba(160,175,195,0.2),-8px_-8px_20px_rgba(255,255,255,0.95)] animate-in fade-in">
                  <div className="bg-emerald-600 p-5 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <Activity size={20} className="text-white" />
                      <div>
                        <h3 className="font-extrabold text-white tracking-wide text-sm md:text-base">
                          Kepatuhan Pelaksanaan Surgical Safety Checklist (SSC)
                        </h3>
                        <p className="text-[11px] font-semibold text-emerald-100">
                          Unit: {selectedUnit?.name || "-"} {selectedSubUnit ? `(${selectedSubUnit})` : ""} • Bulan: {formattedBulanLabel}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddSscRow}
                      className="flex items-center gap-1.5 bg-white text-emerald-800 hover:bg-emerald-50 px-3.5 py-1.5 rounded-xl text-xs font-black transition-colors"
                    >
                      <Plus size={14} /> Tambah Pasien
                    </button>
                  </div>

                  <div className="p-6 overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[960px]">
                      <thead>
                        <tr className="bg-emerald-50/55 border-b border-emerald-100 text-emerald-950">
                          <th className="py-3 px-3 font-extrabold text-xs uppercase w-12 text-center rounded-tl-xl border-r border-emerald-100/30">
                            No
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase w-32 border-r border-emerald-100/30">
                            Tanggal
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase w-32 border-r border-emerald-100/30">
                            No. RM
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase min-w-[160px] border-r border-emerald-100/30">
                            Nama Pasien
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase text-center w-36 border-r border-emerald-100/30">
                            Sign In
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase text-center w-36 border-r border-emerald-100/30">
                            Time Out
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase text-center w-36 border-r border-emerald-100/30">
                            Sign Out
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase min-w-[150px] border-r border-emerald-100/30">
                            Keterangan
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase w-14 text-center rounded-tr-xl">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {sscGrid.length === 0 ? (
                          <tr>
                            <td
                              colSpan={9}
                              className="py-12 text-center text-gray-400 text-xs italic font-semibold border-b border-emerald-50 bg-[#fafdfc]"
                            >
                              Belum ada data Surgical Safety Checklist. Klik &quot;Tambah Pasien&quot; untuk memulai pencatatan.
                            </td>
                          </tr>
                        ) : (
                          sscGrid.map((row, idx) => (
                            <tr
                              key={`${row.id}-${idx}`}
                              className="border-b border-gray-100 hover:bg-emerald-50/15 transition-colors"
                            >
                              <td className="py-3 px-3 text-center text-xs font-bold text-gray-500 border-r border-emerald-50">
                                {idx + 1}
                              </td>
                              <td className="py-3 px-3 border-r border-emerald-50">
                                <input
                                  type="date"
                                  value={row.tanggal}
                                  onChange={(e) =>
                                    handleUpdateSsc(row.id, "tanggal", e.target.value)
                                  }
                                  className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
                                />
                              </td>
                              <td className="py-3 px-3 border-r border-emerald-50">
                                <input
                                  type="text"
                                  placeholder="No. RM"
                                  value={row.no_rm}
                                  onChange={(e) =>
                                    handleUpdateSsc(row.id, "no_rm", e.target.value)
                                  }
                                  className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
                                />
                              </td>
                              <td className="py-3 px-3 border-r border-emerald-50">
                                <input
                                  type="text"
                                  placeholder="Nama Pasien"
                                  value={row.nama_pasien}
                                  onChange={(e) =>
                                    handleUpdateSsc(row.id, "nama_pasien", e.target.value)
                                  }
                                  className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
                                />
                              </td>
                              {(["sign_in", "time_out", "sign_out"] as const).map((stageKey) => {
                                const val = row[stageKey];
                                return (
                                  <td
                                    key={stageKey}
                                    className="py-3 px-2 text-center border-r border-emerald-50"
                                  >
                                    <div className="flex items-center gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleUpdateSsc(row.id, stageKey, "Ya")
                                        }
                                        className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-black border transition-all ${
                                          val === "Ya"
                                            ? "bg-emerald-600 text-white border-emerald-700"
                                            : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-emerald-50"
                                        }`}
                                      >
                                        Ya
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleUpdateSsc(row.id, stageKey, "Tidak")
                                        }
                                        className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-black border transition-all ${
                                          val === "Tidak"
                                            ? "bg-rose-600 text-white border-rose-700"
                                            : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-rose-50"
                                        }`}
                                      >
                                        Tidak
                                      </button>
                                    </div>
                                  </td>
                                );
                              })}
                              <td className="py-3 px-3 border-r border-emerald-50">
                                <input
                                  type="text"
                                  placeholder="Keterangan (opsional)"
                                  value={row.keterangan}
                                  onChange={(e) =>
                                    handleUpdateSsc(row.id, "keterangan", e.target.value)
                                  }
                                  className="w-full bg-transparent outline-none text-xs font-medium text-slate-700"
                                />
                              </td>
                              <td className="py-3 px-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSscRow(row.id)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                                  title="Hapus Baris"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="px-6 py-4 bg-emerald-50/70 border-t border-emerald-100 flex flex-wrap items-center justify-between gap-4">
                    <p className="text-xs font-bold text-emerald-900">
                      SSC Lengkap (Sign In, Time Out &amp; Sign Out = Ya):{" "}
                      <span className="font-black">
                        {
                          sscGrid.filter(
                            (d) =>
                              d.sign_in === "Ya" &&
                              d.time_out === "Ya" &&
                              d.sign_out === "Ya",
                          ).length
                        }
                      </span>{" "}
                      / Total Operasi: <span className="font-black">{sscGrid.length}</span>
                    </p>
                    <p className="text-xs font-extrabold text-emerald-800">
                      Nilai / Persentase Capaian:{" "}
                      <span className="text-sm font-black">{computedCapaian}%</span>
                    </p>
                  </div>
                </div>
              )}

              {/* Specialized Form: Pembatalan Operasi Elektif (IBS - Target <= 2%) */}
              {isPembatalanOperasi && (
                <div className="bg-[#f8fafc] border border-white rounded-[28px] overflow-hidden shadow-[8px_8px_20px_rgba(160,175,195,0.2),-8px_-8px_20px_rgba(255,255,255,0.95)] animate-in fade-in">
                  <div className="bg-emerald-600 p-5 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <Activity size={20} className="text-white" />
                      <div>
                        <h3 className="font-extrabold text-white tracking-wide text-sm md:text-base">
                          Formulir Monitoring Pembatalan Operasi Elektif (Target ≤ 2%)
                        </h3>
                        <p className="text-[11px] font-semibold text-emerald-100">
                          Unit: {selectedUnit?.name || "-"} {selectedSubUnit ? `(${selectedSubUnit})` : ""} • Bulan: {formattedBulanLabel}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddPembatalanRow}
                      className="flex items-center gap-1.5 bg-white text-emerald-800 hover:bg-emerald-50 px-3.5 py-1.5 rounded-xl text-xs font-black transition-colors"
                    >
                      <Plus size={14} /> Tambah Baris Data
                    </button>
                  </div>

                  <div className="px-6 pt-4">
                    <p className="text-xs font-semibold text-slate-500">
                      Catat pasien yang mengalami pembatalan operasi elektif (atau klik <strong>Nihil (0)</strong> bila tidak ada pembatalan) beserta <strong>Jumlah Seluruh Operasi Elektif Terjadwal</strong> pada bulan berjalan.
                    </p>
                  </div>

                  <div className="p-6 overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                      <thead>
                        <tr className="bg-emerald-50/55 border-b border-emerald-100 text-emerald-950">
                          <th className="py-3 px-3 font-extrabold text-xs uppercase w-12 text-center rounded-tl-xl border-r border-emerald-100/30">
                            No
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase w-32 border-r border-emerald-100/30">
                            Tanggal
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase w-32 border-r border-emerald-100/30">
                            No. RM
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase min-w-[150px] border-r border-emerald-100/30">
                            Nama Pasien
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase min-w-[230px] border-r border-emerald-100/30">
                            Penyebab Pembatalan
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase text-center w-40 border-r border-emerald-100/30">
                            Total Operasi Terjadwal
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase min-w-[150px] border-r border-emerald-100/30">
                            Keterangan
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase w-14 text-center rounded-tr-xl">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {pembatalanGrid.length === 0 ? (
                          <tr>
                            <td
                              colSpan={8}
                              className="py-12 text-center text-gray-400 text-xs italic font-semibold border-b border-emerald-50 bg-[#fafdfc]"
                            >
                              Belum ada data pembatalan operasi. Klik &quot;Tambah Baris Data&quot; untuk memulai.
                            </td>
                          </tr>
                        ) : (
                          pembatalanGrid.map((row, idx) => (
                            <tr
                              key={`${row.id}-${idx}`}
                              className="border-b border-gray-100 hover:bg-emerald-50/15 transition-colors"
                            >
                              <td className="py-3 px-3 text-center text-xs font-bold text-gray-500 border-r border-emerald-50">
                                {idx + 1}
                              </td>
                              <td className="py-3 px-3 border-r border-emerald-50">
                                <input
                                  type="date"
                                  value={row.tanggal}
                                  onChange={(e) =>
                                    handleUpdatePembatalan(row.id, "tanggal", e.target.value)
                                  }
                                  className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
                                />
                              </td>
                              <td className="py-3 px-3 border-r border-emerald-50">
                                <input
                                  type="text"
                                  placeholder="No. RM / -"
                                  value={row.no_rm}
                                  onChange={(e) =>
                                    handleUpdatePembatalan(row.id, "no_rm", e.target.value)
                                  }
                                  className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
                                />
                              </td>
                              <td className="py-3 px-3 border-r border-emerald-50">
                                <input
                                  type="text"
                                  placeholder="Nama Pasien / -"
                                  value={row.nama_pasien}
                                  onChange={(e) =>
                                    handleUpdatePembatalan(row.id, "nama_pasien", e.target.value)
                                  }
                                  className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
                                />
                              </td>
                              <td className="py-3 px-3 border-r border-emerald-50">
                                <div className="space-y-1.5">
                                  <input
                                    type="text"
                                    placeholder="Penyebab batal (atau klik Nihil jika 0)"
                                    value={row.penyebab_pembatalan}
                                    onChange={(e) =>
                                      handleUpdatePembatalan(row.id, "penyebab_pembatalan", e.target.value)
                                    }
                                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 outline-none focus:border-emerald-400"
                                  />
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-[10px] font-bold text-slate-500">
                                      Jml Batal:
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                      <input
                                        type="number"
                                        min="0"
                                        value={row.jumlah_batal}
                                        onChange={(e) =>
                                          handleUpdatePembatalan(
                                            row.id,
                                            "jumlah_batal",
                                            e.target.value === "" ? "" : Number(e.target.value),
                                          )
                                        }
                                        className="w-16 text-center bg-white border border-slate-200 rounded-md px-2 py-0.5 text-xs font-extrabold text-slate-800 outline-none focus:border-emerald-400"
                                      />
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleUpdatePembatalan(row.id, "penyebab_pembatalan", "Nihil")
                                        }
                                        className="px-2 py-0.5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] font-bold"
                                      >
                                        Nihil (0)
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-3 text-center border-r border-emerald-50">
                                <input
                                  type="number"
                                  min="1"
                                  placeholder="Mis. 50"
                                  value={row.jumlah_seluruh_operasi}
                                  onChange={(e) =>
                                    handleUpdatePembatalan(
                                      row.id,
                                      "jumlah_seluruh_operasi",
                                      e.target.value === "" ? "" : Number(e.target.value),
                                    )
                                  }
                                  className="w-full text-center bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-extrabold text-slate-800 outline-none focus:border-emerald-400"
                                />
                              </td>
                              <td className="py-3 px-3 border-r border-emerald-50">
                                <input
                                  type="text"
                                  placeholder="Keterangan (opsional)"
                                  value={row.keterangan}
                                  onChange={(e) =>
                                    handleUpdatePembatalan(row.id, "keterangan", e.target.value)
                                  }
                                  className="w-full bg-transparent outline-none text-xs font-medium text-slate-700"
                                />
                              </td>
                              <td className="py-3 px-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemovePembatalanRow(row.id)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                                  title="Hapus Baris"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="px-6 py-4 bg-emerald-50/70 border-t border-emerald-100 flex flex-wrap items-center justify-between gap-4">
                    <p className="text-xs font-bold text-emerald-900">
                      Total Dibatalkan:{" "}
                      <span className="font-black">
                        {pembatalanGrid.reduce((acc, c) => acc + (Number(c.jumlah_batal) || 0), 0)}
                      </span>{" "}
                      / Total Operasi Terjadwal:{" "}
                      <span className="font-black">
                        {Math.max(0, ...pembatalanGrid.map((r) => Number(r.jumlah_seluruh_operasi) || 0))}
                      </span>
                    </p>
                    <p className="text-xs font-extrabold text-emerald-800">
                      Nilai / Persentase Pembatalan:{" "}
                      <span className="text-sm font-black">{computedCapaian}%</span>
                    </p>
                  </div>
                </div>
              )}

              {/* Specialized Form: Keterlambatan Penyediaan Darah Obstetri & Neonatus (> 60 Menit) */}
              {isPenyediaanDarah && (
                <div className="bg-[#f8fafc] border border-white rounded-[28px] overflow-hidden shadow-[8px_8px_20px_rgba(160,175,195,0.2),-8px_-8px_20px_rgba(255,255,255,0.95)] animate-in fade-in">
                  <div className="bg-emerald-600 p-5 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <Clock size={20} className="text-white" />
                      <div>
                        <h3 className="font-extrabold text-white tracking-wide text-sm md:text-base">
                          Formulir Angka Keterlambatan Penyediaan Darah Obstetri &amp; Neonatus (&gt; 60 Menit)
                        </h3>
                        <p className="text-[11px] font-semibold text-emerald-100">
                          Unit: {selectedUnit?.name || "-"} {selectedSubUnit ? `(${selectedSubUnit})` : ""} • Bulan: {formattedBulanLabel} • Target: ≤ 0%
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddPenyediaanDarahRow}
                      className="flex items-center gap-1.5 bg-white text-emerald-800 hover:bg-emerald-50 px-3.5 py-1.5 rounded-xl text-xs font-black transition-colors"
                    >
                      <Plus size={14} /> Tambah Pasien
                    </button>
                  </div>

                  <div className="p-6 overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1080px]">
                      <thead>
                        <tr className="bg-emerald-50/55 border-b border-emerald-100 text-emerald-950">
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase w-12 text-center rounded-tl-xl border-r border-emerald-100/30">
                            No
                          </th>
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase w-32 border-r border-emerald-100/30">
                            Tanggal
                          </th>
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase min-w-[150px] border-r border-emerald-100/30">
                            Nama Pasien
                          </th>
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase w-28 border-r border-emerald-100/30">
                            No. RM
                          </th>
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase min-w-[170px] border-r border-emerald-100/30">
                            Jenis Darah / Banyaknya
                          </th>
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase text-center w-32 border-r border-emerald-100/30">
                            Jam Permintaan
                          </th>
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase text-center w-32 border-r border-emerald-100/30">
                            Jam Darah Diterima
                          </th>
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase min-w-[210px] border-r border-emerald-100/30">
                            Keterangan
                          </th>
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase w-14 text-center rounded-tr-xl">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {penyediaanDarahGrid.length === 0 ? (
                          <tr>
                            <td
                              colSpan={9}
                              className="py-12 text-center text-gray-400 text-xs italic font-semibold border-b border-emerald-50 bg-[#fafdfc]"
                            >
                              Belum ada data penyediaan darah. Klik &quot;Tambah Pasien&quot; untuk mulai mengisi formulir.
                            </td>
                          </tr>
                        ) : (
                          penyediaanDarahGrid.map((row, idx) => {
                            const hasTimes =
                              row.jam_permintaan !== "" && row.jam_diterima !== "";
                            const isLate = row.terlambat_lebih_60 === true;

                            return (
                              <tr
                                key={`${row.id}-${idx}`}
                                className="border-b border-gray-100 hover:bg-emerald-50/15 transition-colors"
                              >
                                <td className="py-3 px-2.5 text-center text-xs font-bold text-gray-500 border-r border-emerald-50">
                                  {idx + 1}
                                </td>
                                <td className="py-3 px-2.5 border-r border-emerald-50">
                                  <input
                                    type="date"
                                    value={row.tanggal}
                                    onChange={(e) =>
                                      handleUpdatePenyediaanDarah(row.id, "tanggal", e.target.value)
                                    }
                                    className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
                                  />
                                </td>
                                <td className="py-3 px-2.5 border-r border-emerald-50">
                                  <input
                                    type="text"
                                    placeholder="Nama Pasien"
                                    value={row.nama_pasien}
                                    onChange={(e) =>
                                      handleUpdatePenyediaanDarah(row.id, "nama_pasien", e.target.value)
                                    }
                                    className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
                                  />
                                </td>
                                <td className="py-3 px-2.5 border-r border-emerald-50">
                                  <input
                                    type="text"
                                    placeholder="No. RM"
                                    value={row.no_rm}
                                    onChange={(e) =>
                                      handleUpdatePenyediaanDarah(row.id, "no_rm", e.target.value)
                                    }
                                    className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
                                  />
                                </td>
                                <td className="py-3 px-2.5 border-r border-emerald-50">
                                  <input
                                    type="text"
                                    placeholder="Mis. PRC Gol A / 2 Kolf"
                                    value={row.jenis_darah_banyaknya}
                                    onChange={(e) =>
                                      handleUpdatePenyediaanDarah(
                                        row.id,
                                        "jenis_darah_banyaknya",
                                        e.target.value,
                                      )
                                    }
                                    className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
                                  />
                                </td>
                                <td className="py-3 px-2.5 text-center border-r border-emerald-50">
                                  <input
                                    type="time"
                                    value={row.jam_permintaan}
                                    onChange={(e) =>
                                      handleUpdatePenyediaanDarah(row.id, "jam_permintaan", e.target.value)
                                    }
                                    className="w-full bg-transparent outline-none text-xs font-bold text-slate-800 text-center"
                                  />
                                </td>
                                <td className="py-3 px-2.5 text-center border-r border-emerald-50">
                                  <input
                                    type="time"
                                    value={row.jam_diterima}
                                    onChange={(e) =>
                                      handleUpdatePenyediaanDarah(row.id, "jam_diterima", e.target.value)
                                    }
                                    className="w-full bg-transparent outline-none text-xs font-bold text-slate-800 text-center"
                                  />
                                </td>
                                <td className="py-3 px-2.5 border-r border-emerald-50">
                                  <div className="space-y-1.5">
                                    <div className="flex items-center gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleUpdatePenyediaanDarah(row.id, "terlambat_lebih_60", false)
                                        }
                                        className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-black border transition-all ${
                                          row.terlambat_lebih_60 === false
                                            ? "bg-emerald-600 text-white border-emerald-700"
                                            : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-emerald-50"
                                        }`}
                                      >
                                        Tepat (≤ 60m)
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleUpdatePenyediaanDarah(row.id, "terlambat_lebih_60", true)
                                        }
                                        className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-black border transition-all ${
                                          isLate
                                            ? "bg-rose-600 text-white border-rose-700"
                                            : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-rose-50"
                                        }`}
                                      >
                                        Telat &gt; 60m
                                      </button>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {hasTimes && (
                                        <span className="text-[10px] font-bold text-slate-500 shrink-0">
                                          {row.selisih_menit}m
                                        </span>
                                      )}
                                      <input
                                        type="text"
                                        placeholder="Catatan (opsional)"
                                        value={row.keterangan}
                                        onChange={(e) =>
                                          handleUpdatePenyediaanDarah(row.id, "keterangan", e.target.value)
                                        }
                                        className="w-full bg-white/80 border border-slate-200 rounded-md px-2 py-1 text-[11px] font-medium text-slate-700 outline-none focus:border-emerald-400"
                                      />
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 px-2.5 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleRemovePenyediaanDarahRow(row.id)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                                    title="Hapus Baris"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="px-6 py-4 bg-emerald-50/70 border-t border-emerald-100 flex flex-wrap items-center justify-between gap-4">
                    <p className="text-xs font-bold text-emerald-900">
                      Terlambat &gt; 60 Menit:{" "}
                      <span className="font-black">
                        {penyediaanDarahGrid.filter((d) => d.terlambat_lebih_60 === true).length}
                      </span>{" "}
                      / Total Permintaan Darah:{" "}
                      <span className="font-black">{penyediaanDarahGrid.length}</span>
                    </p>
                    <p className="text-xs font-extrabold text-emerald-800">
                      Nilai / Persentase Keterlambatan:{" "}
                      <span className="text-sm font-black">{computedCapaian}%</span>
                    </p>
                  </div>
                </div>
              )}

              {/* Specialized Form: IMD Pada Bayi Baru Lahir (PONEK - IBS) */}
              {isImdBayi && (
                <div className="bg-[#f8fafc] border border-white rounded-[28px] overflow-hidden shadow-[8px_8px_20px_rgba(160,175,195,0.2),-8px_-8px_20px_rgba(255,255,255,0.95)] animate-in fade-in">
                  <div className="bg-emerald-600 p-5 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <Activity size={20} className="text-white" />
                      <div>
                        <h3 className="font-extrabold text-white tracking-wide text-sm md:text-base">
                          Formulir Angka Kejadian Tidak Dilakukannya IMD Pada Bayi Baru Lahir
                        </h3>
                        <p className="text-[11px] font-semibold text-emerald-100">
                          Unit: {selectedUnit?.name || "-"} {selectedSubUnit ? `(${selectedSubUnit})` : ""} • Bulan: {formattedBulanLabel} • Target IMD: 100%
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddImdRow}
                      className="flex items-center gap-1.5 bg-white text-emerald-800 hover:bg-emerald-50 px-3.5 py-1.5 rounded-xl text-xs font-black transition-colors"
                    >
                      <Plus size={14} /> Tambah Bayi
                    </button>
                  </div>

                  <div className="p-6 overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[960px]">
                      <thead>
                        <tr className="bg-emerald-50/55 border-b border-emerald-100 text-emerald-950">
                          <th className="py-3 px-3 font-extrabold text-xs uppercase w-12 text-center rounded-tl-xl border-r border-emerald-100/30">
                            No
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase w-32 border-r border-emerald-100/30">
                            Tanggal
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase min-w-[160px] border-r border-emerald-100/30">
                            Nama Bayi / Ibu
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase w-32 border-r border-emerald-100/30">
                            No. RM
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase text-center w-36 border-r border-emerald-100/30">
                            IMD (Ya / Tidak)
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase min-w-[210px] border-r border-emerald-100/30">
                            Alasan Tidak IMD (Diluar Kriteria Eksklusi)
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase text-center w-36 border-r border-emerald-100/30">
                            Jumlah Bayi Yang Lahir
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase w-14 text-center rounded-tr-xl">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {imdGrid.length === 0 ? (
                          <tr>
                            <td
                              colSpan={8}
                              className="py-12 text-center text-gray-400 text-xs italic font-semibold border-b border-emerald-50 bg-[#fafdfc]"
                            >
                              Belum ada data bayi baru lahir. Klik &quot;Tambah Bayi&quot; untuk mulai mencatat IMD.
                            </td>
                          </tr>
                        ) : (
                          imdGrid.map((row, idx) => (
                            <tr
                              key={`${row.id}-${idx}`}
                              className="border-b border-gray-100 hover:bg-emerald-50/15 transition-colors"
                            >
                              <td className="py-3 px-3 text-center text-xs font-bold text-gray-500 border-r border-emerald-50">
                                {idx + 1}
                              </td>
                              <td className="py-3 px-3 border-r border-emerald-50">
                                <input
                                  type="date"
                                  value={row.tanggal}
                                  onChange={(e) =>
                                    handleUpdateImd(row.id, "tanggal", e.target.value)
                                  }
                                  className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
                                />
                              </td>
                              <td className="py-3 px-3 border-r border-emerald-50">
                                <input
                                  type="text"
                                  placeholder="By. Ny..."
                                  value={row.nama_bayi}
                                  onChange={(e) =>
                                    handleUpdateImd(row.id, "nama_bayi", e.target.value)
                                  }
                                  className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
                                />
                              </td>
                              <td className="py-3 px-3 border-r border-emerald-50">
                                <input
                                  type="text"
                                  placeholder="No. RM"
                                  value={row.no_rm}
                                  onChange={(e) =>
                                    handleUpdateImd(row.id, "no_rm", e.target.value)
                                  }
                                  className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
                                />
                              </td>
                              <td className="py-3 px-2 text-center border-r border-emerald-50">
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateImd(row.id, "imd", "Ya")}
                                    className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-black border transition-all ${
                                      row.imd === "Ya"
                                        ? "bg-emerald-600 text-white border-emerald-700"
                                        : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-emerald-50"
                                    }`}
                                  >
                                    Ya
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateImd(row.id, "imd", "Tidak")}
                                    className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-black border transition-all ${
                                      row.imd === "Tidak"
                                        ? "bg-rose-600 text-white border-rose-700"
                                        : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-rose-50"
                                    }`}
                                  >
                                    Tidak
                                  </button>
                                </div>
                              </td>
                              <td className="py-3 px-3 border-r border-emerald-50">
                                <input
                                  type="text"
                                  placeholder="Alasan (jika tidak IMD)"
                                  value={row.alasan_tidak_imd}
                                  onChange={(e) =>
                                    handleUpdateImd(row.id, "alasan_tidak_imd", e.target.value)
                                  }
                                  className="w-full bg-transparent outline-none text-xs font-medium text-slate-700"
                                />
                              </td>
                              <td className="py-3 px-3 text-center border-r border-emerald-50">
                                <input
                                  type="number"
                                  min="1"
                                  placeholder="Mis. 1 atau total"
                                  value={row.jumlah_bayi_lahir}
                                  onChange={(e) =>
                                    handleUpdateImd(
                                      row.id,
                                      "jumlah_bayi_lahir",
                                      e.target.value === "" ? "" : Number(e.target.value),
                                    )
                                  }
                                  className="w-full text-center bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-extrabold text-slate-800 outline-none focus:border-emerald-400"
                                />
                              </td>
                              <td className="py-3 px-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveImdRow(row.id)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                                  title="Hapus Baris"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="px-6 py-4 bg-emerald-50/70 border-t border-emerald-100 flex flex-wrap items-center justify-between gap-4">
                    <p className="text-xs font-bold text-emerald-900">
                      Dilakukan IMD (Ya):{" "}
                      <span className="font-black">
                        {imdGrid.filter((d) => d.imd === "Ya").length}
                      </span>{" "}
                      / Total Baris Data: <span className="font-black">{imdGrid.length}</span>
                    </p>
                    <p className="text-xs font-extrabold text-emerald-800">
                      Nilai / Persentase Capaian IMD:{" "}
                      <span className="text-sm font-black">{computedCapaian}%</span>
                    </p>
                  </div>
                </div>
              )}

              {/* Shared Specialized Form: Angka Kematian Ibu & Angka Kematian Bayi (PONEK - IBS) */}
              {kematianConfig && (
                <div className="bg-[#f8fafc] border border-white rounded-[28px] overflow-hidden shadow-[8px_8px_20px_rgba(160,175,195,0.2),-8px_-8px_20px_rgba(255,255,255,0.95)] animate-in fade-in">
                  <div className="bg-emerald-600 p-5 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <Activity size={20} className="text-white" />
                      <div>
                        <h3 className="font-extrabold text-white tracking-wide text-sm md:text-base">
                          {kematianConfig.tableTitle}
                        </h3>
                        <p className="text-[11px] font-semibold text-emerald-100">
                          Unit: {selectedUnit?.name || "-"} {selectedSubUnit ? `(${selectedSubUnit})` : ""} • Bulan: {formattedBulanLabel}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddKematianRow}
                      className="flex items-center gap-1.5 bg-white text-emerald-800 hover:bg-emerald-50 px-3.5 py-1.5 rounded-xl text-xs font-black transition-colors"
                    >
                      <Plus size={14} /> Tambah Baris Data
                    </button>
                  </div>

                  <div className="px-6 pt-4">
                    <p className="text-xs font-semibold text-slate-500">
                      {kematianConfig.subtitle}
                    </p>
                  </div>

                  <datalist id="ponek-dpjp-list">
                    {RSUD_DPJP_LIST.map((dok) => (
                      <option key={dok} value={dok} />
                    ))}
                  </datalist>

                  <div className="p-6 overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1160px]">
                      <thead>
                        <tr className="bg-emerald-50/55 border-b border-emerald-100 text-emerald-950">
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase w-10 text-center rounded-tl-xl border-r border-emerald-100/30">
                            No
                          </th>
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase w-32 border-r border-emerald-100/30">
                            Tanggal
                          </th>
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase min-w-[190px] border-r border-emerald-100/30">
                            Nama Pasien
                          </th>
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase w-28 border-r border-emerald-100/30">
                            No. RM
                          </th>
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase min-w-[140px] border-r border-emerald-100/30">
                            Alamat
                          </th>
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase min-w-[130px] border-r border-emerald-100/30">
                            DX
                          </th>
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase min-w-[160px] border-r border-emerald-100/30">
                            DPJP
                          </th>
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase w-32 border-r border-emerald-100/30">
                            Rujukan / Non
                          </th>
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase text-center w-36 border-r border-emerald-100/30">
                            {kematianConfig.populationLabel}
                          </th>
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase w-14 text-center rounded-tr-xl">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {kematianGrid.length === 0 ? (
                          <tr>
                            <td
                              colSpan={10}
                              className="py-12 text-center text-gray-400 text-xs italic font-semibold border-b border-emerald-50 bg-[#fafdfc]"
                            >
                              Belum ada data. Klik &quot;Tambah Baris Data&quot; untuk mencatat.
                            </td>
                          </tr>
                        ) : (
                          kematianGrid.map((row, idx) => (
                            <tr
                              key={`${row.id}-${idx}`}
                              className="border-b border-gray-100 hover:bg-emerald-50/15 transition-colors"
                            >
                              <td className="py-3 px-2.5 text-center text-xs font-bold text-gray-500 border-r border-emerald-50">
                                {idx + 1}
                              </td>
                              <td className="py-3 px-2.5 border-r border-emerald-50">
                                <input
                                  type="date"
                                  value={row.tanggal}
                                  onChange={(e) =>
                                    handleUpdateKematian(row.id, "tanggal", e.target.value)
                                  }
                                  className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
                                />
                              </td>
                              <td className="py-3 px-2.5 border-r border-emerald-50">
                                <div className="space-y-1.5">
                                  <input
                                    type="text"
                                    placeholder="Nama Pasien (atau klik Nihil)"
                                    value={row.nama_pasien}
                                    onChange={(e) =>
                                      handleUpdateKematian(row.id, "nama_pasien", e.target.value)
                                    }
                                    className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 outline-none focus:border-emerald-400"
                                  />
                                  <div className="flex items-center justify-between gap-1.5">
                                    <span className="text-[10px] font-bold text-slate-500">
                                      Jml:
                                    </span>
                                    <input
                                      type="number"
                                      min="0"
                                      value={row.jumlah_kematian}
                                      onChange={(e) =>
                                        handleUpdateKematian(
                                          row.id,
                                          "jumlah_kematian",
                                          e.target.value === "" ? "" : Number(e.target.value),
                                        )
                                      }
                                      className="w-12 text-center bg-white border border-slate-200 rounded-md px-1 py-0.5 text-[11px] font-extrabold text-slate-800 outline-none"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        handleUpdateKematian(row.id, "nama_pasien", "Nihil");
                                        handleUpdateKematian(row.id, "no_rm", "-");
                                      }}
                                      className="px-2 py-0.5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] font-bold"
                                    >
                                      {kematianConfig.nilLabel}
                                    </button>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-2.5 border-r border-emerald-50">
                                <input
                                  type="text"
                                  placeholder="No. RM"
                                  value={row.no_rm}
                                  onChange={(e) =>
                                    handleUpdateKematian(row.id, "no_rm", e.target.value)
                                  }
                                  className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
                                />
                              </td>
                              <td className="py-3 px-2.5 border-r border-emerald-50">
                                <input
                                  type="text"
                                  placeholder="Alamat"
                                  value={row.alamat}
                                  onChange={(e) =>
                                    handleUpdateKematian(row.id, "alamat", e.target.value)
                                  }
                                  className="w-full bg-transparent outline-none text-xs font-medium text-slate-700"
                                />
                              </td>
                              <td className="py-3 px-2.5 border-r border-emerald-50">
                                <input
                                  type="text"
                                  placeholder="Diagnosis (DX)"
                                  value={row.dx}
                                  onChange={(e) =>
                                    handleUpdateKematian(row.id, "dx", e.target.value)
                                  }
                                  className="w-full bg-transparent outline-none text-xs font-medium text-slate-700"
                                />
                              </td>
                              <td className="py-3 px-2.5 border-r border-emerald-50">
                                <input
                                  type="text"
                                  list="ponek-dpjp-list"
                                  placeholder="Nama DPJP"
                                  value={row.dpjp}
                                  onChange={(e) =>
                                    handleUpdateKematian(row.id, "dpjp", e.target.value)
                                  }
                                  className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
                                />
                              </td>
                              <td className="py-3 px-2 border-r border-emerald-50">
                                <select
                                  value={row.rujukan_status}
                                  onChange={(e) =>
                                    handleUpdateKematian(row.id, "rujukan_status", e.target.value)
                                  }
                                  className="w-full h-8 rounded-lg bg-slate-100 text-xs font-bold text-slate-800 outline-none px-1.5"
                                >
                                  <option value="">-- Pilih --</option>
                                  <option value="Rujukan">Rujukan</option>
                                  <option value="Non-Rujukan">Non-Rujukan</option>
                                </select>
                              </td>
                              <td className="py-3 px-2.5 text-center border-r border-emerald-50">
                                <input
                                  type="number"
                                  min="1"
                                  placeholder="Mis. 40"
                                  value={row.jumlah_populasi}
                                  onChange={(e) =>
                                    handleUpdateKematian(
                                      row.id,
                                      "jumlah_populasi",
                                      e.target.value === "" ? "" : Number(e.target.value),
                                    )
                                  }
                                  className="w-full text-center bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-extrabold text-slate-800 outline-none focus:border-emerald-400"
                                />
                              </td>
                              <td className="py-3 px-2.5 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveKematianRow(row.id)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                                  title="Hapus Baris"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="px-6 py-4 bg-emerald-50/70 border-t border-emerald-100 flex flex-wrap items-center justify-between gap-4">
                    <p className="text-xs font-bold text-emerald-900">
                      Jumlah Kematian:{" "}
                      <span className="font-black">
                        {kematianGrid.reduce((acc, c) => acc + (Number(c.jumlah_kematian) || 0), 0)}
                      </span>{" "}
                      / {kematianConfig.populationLabel}:{" "}
                      <span className="font-black">
                        {Math.max(0, ...kematianGrid.map((r) => Number(r.jumlah_populasi) || 0))}
                      </span>
                    </p>
                    <p className="text-xs font-extrabold text-emerald-800">
                      Nilai / Persentase:{" "}
                      <span className="text-sm font-black">{computedCapaian}%</span>
                    </p>
                  </div>
                </div>
              )}

              {/* Specialized Form: Kepatuhan Pengkajian Nyeri (ICU) */}
              {isPengkajianNyeriIcu && (
                <div className="bg-[#f8fafc] border border-white rounded-[28px] overflow-hidden shadow-[8px_8px_20px_rgba(160,175,195,0.2),-8px_-8px_20px_rgba(255,255,255,0.95)] animate-in fade-in">
                  <div className="bg-emerald-600 p-5 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <Activity size={20} className="text-white" />
                      <div>
                        <h3 className="font-extrabold text-white tracking-wide text-sm md:text-base">
                          Formulir Kepatuhan Pengkajian Nyeri (ICU)
                        </h3>
                        <p className="text-[11px] font-semibold text-emerald-100">
                          Unit: {selectedUnit?.name || "-"} {selectedSubUnit ? `(${selectedSubUnit})` : ""} • Bulan: {formattedBulanLabel}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddPengkajianNyeriRow}
                      className="flex items-center gap-1.5 bg-white text-emerald-800 hover:bg-emerald-50 px-3.5 py-1.5 rounded-xl text-xs font-black transition-colors"
                    >
                      <Plus size={14} /> Tambah Pasien
                    </button>
                  </div>

                  <div className="p-6 overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[940px]">
                      <thead>
                        <tr className="bg-emerald-50/55 border-b border-emerald-100 text-emerald-950">
                          <th className="py-3 px-3 font-extrabold text-xs uppercase w-12 text-center rounded-tl-xl border-r border-emerald-100/30">
                            No
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase w-32 border-r border-emerald-100/30">
                            Tanggal
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase w-32 border-r border-emerald-100/30">
                            No. RM
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase min-w-[160px] border-r border-emerald-100/30">
                            Nama Pasien
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase text-center w-44 border-r border-emerald-100/30">
                            Asesmen Awal Nyeri
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase text-center w-44 border-r border-emerald-100/30">
                            Asesmen Ulang Nyeri
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase min-w-[160px] border-r border-emerald-100/30">
                            Keterangan
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase w-14 text-center rounded-tr-xl">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {pengkajianNyeriGrid.length === 0 ? (
                          <tr>
                            <td
                              colSpan={8}
                              className="py-12 text-center text-gray-400 text-xs italic font-semibold border-b border-emerald-50 bg-[#fafdfc]"
                            >
                              Belum ada data pengkajian nyeri ICU. Klik &quot;Tambah Pasien&quot; untuk memulai pencatatan.
                            </td>
                          </tr>
                        ) : (
                          pengkajianNyeriGrid.map((row, idx) => (
                            <tr
                              key={`${row.id}-${idx}`}
                              className="border-b border-gray-100 hover:bg-emerald-50/15 transition-colors"
                            >
                              <td className="py-3 px-3 text-center text-xs font-bold text-gray-500 border-r border-emerald-50">
                                {idx + 1}
                              </td>
                              <td className="py-3 px-3 border-r border-emerald-50">
                                <input
                                  type="date"
                                  value={row.tanggal}
                                  onChange={(e) =>
                                    handleUpdatePengkajianNyeri(row.id, "tanggal", e.target.value)
                                  }
                                  className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
                                />
                              </td>
                              <td className="py-3 px-3 border-r border-emerald-50">
                                <input
                                  type="text"
                                  placeholder="No. RM"
                                  value={row.no_rm}
                                  onChange={(e) =>
                                    handleUpdatePengkajianNyeri(row.id, "no_rm", e.target.value)
                                  }
                                  className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
                                />
                              </td>
                              <td className="py-3 px-3 border-r border-emerald-50">
                                <input
                                  type="text"
                                  placeholder="Nama Pasien"
                                  value={row.nama_pasien}
                                  onChange={(e) =>
                                    handleUpdatePengkajianNyeri(row.id, "nama_pasien", e.target.value)
                                  }
                                  className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
                                />
                              </td>
                              {(["asesmen_awal_nyeri", "asesmen_ulang_nyeri"] as const).map(
                                (fieldKey) => {
                                  const val = row[fieldKey];
                                  return (
                                    <td
                                      key={fieldKey}
                                      className="py-3 px-2 text-center border-r border-emerald-50"
                                    >
                                      <div className="flex items-center gap-1.5">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleUpdatePengkajianNyeri(row.id, fieldKey, "Ya")
                                          }
                                          className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-black border transition-all ${
                                            val === "Ya"
                                              ? "bg-emerald-600 text-white border-emerald-700"
                                              : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-emerald-50"
                                          }`}
                                        >
                                          Ya
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleUpdatePengkajianNyeri(row.id, fieldKey, "Tidak")
                                          }
                                          className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-black border transition-all ${
                                            val === "Tidak"
                                              ? "bg-rose-600 text-white border-rose-700"
                                              : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-rose-50"
                                          }`}
                                        >
                                          Tidak
                                        </button>
                                      </div>
                                    </td>
                                  );
                                },
                              )}
                              <td className="py-3 px-3 border-r border-emerald-50">
                                <input
                                  type="text"
                                  placeholder="Keterangan (opsional)"
                                  value={row.keterangan}
                                  onChange={(e) =>
                                    handleUpdatePengkajianNyeri(row.id, "keterangan", e.target.value)
                                  }
                                  className="w-full bg-transparent outline-none text-xs font-medium text-slate-700"
                                />
                              </td>
                              <td className="py-3 px-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemovePengkajianNyeriRow(row.id)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                                  title="Hapus Baris"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="px-6 py-4 bg-emerald-50/70 border-t border-emerald-100 flex flex-wrap items-center justify-between gap-4">
                    <p className="text-xs font-bold text-emerald-900">
                      Asesmen Awal &amp; Ulang Nyeri Lengkap (Ya):{" "}
                      <span className="font-black">
                        {
                          pengkajianNyeriGrid.filter(
                            (d) =>
                              d.asesmen_awal_nyeri === "Ya" &&
                              d.asesmen_ulang_nyeri === "Ya",
                          ).length
                        }
                      </span>{" "}
                      / Total Pasien:{" "}
                      <span className="font-black">{pengkajianNyeriGrid.length}</span>
                    </p>
                    <p className="text-xs font-extrabold text-emerald-800">
                      Nilai / Persentase Capaian:{" "}
                      <span className="text-sm font-black">{computedCapaian}%</span>
                    </p>
                  </div>
                </div>
              )}


              {/* Specialized Form: Emergency Respon Time <= 5 Menit (IGD - Excel SIMRS Format) */}
              {isEmergencyResponTime && (
                <div className="bg-[#f8fafc] border border-white rounded-[28px] overflow-hidden shadow-[8px_8px_20px_rgba(160,175,195,0.2),-8px_-8px_20px_rgba(255,255,255,0.95)] animate-in fade-in">
                  <div className="bg-emerald-600 p-5 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <Clock size={20} className="text-white" />
                      <div>
                        <h3 className="font-extrabold text-white tracking-wide text-sm md:text-base">
                          Formulir Emergency Respon Time (&le; 5 Menit / 00:05:00)
                        </h3>
                        <p className="text-[11px] font-semibold text-emerald-100">
                          Unit: {selectedUnit?.name || "-"} {selectedSubUnit ? `(${selectedSubUnit})` : ""} • Bulan: {formattedBulanLabel} • Target: 100%
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowErtPasteBox((v) => !v)}
                        className="flex items-center gap-1.5 bg-emerald-50 text-emerald-900 hover:bg-white px-3 py-1.5 rounded-xl text-xs font-extrabold transition-colors border border-emerald-200"
                      >
                        <FileUp size={14} /> Tempel dari Excel / SIMRS
                      </button>
                      <button
                        type="button"
                        onClick={handleAddEmergencyResponRow}
                        className="flex items-center gap-1.5 bg-white text-emerald-800 hover:bg-emerald-50 px-3.5 py-1.5 rounded-xl text-xs font-black transition-colors"
                      >
                        <Plus size={14} /> Tambah Pasien
                      </button>
                    </div>
                  </div>

                  {showErtPasteBox && (
                    <div className="mx-6 mt-5 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3 animate-in fade-in">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-bold text-emerald-950">
                          Salin baris dari Excel / SIMRS (kolom: NO | Pasien | RM | Tgl Lahir | Diagnosa | Jam Reg | Jam Periksa | Interval) lalu tempel di bawah ini:
                        </p>
                        <button
                          type="button"
                          onClick={() => setShowErtPasteBox(false)}
                          className="text-slate-500 hover:text-slate-800 p-1 rounded-lg"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <textarea
                        rows={4}
                        value={ertPasteText}
                        onChange={(e) => setErtPasteText(e.target.value)}
                        placeholder={"1\tRIDWAN MAURAKSA\t058727\t10/11/1991\tT78.2 - Anaphylactic shock\t19:00:06\t19:04:06\t00:04:00"}
                        className="w-full rounded-xl border border-emerald-200 bg-white p-3 text-xs font-mono text-slate-800 outline-none focus:border-emerald-500"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowErtPasteBox(false)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-white"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={handleImportErtFromPaste}
                          className="px-4 py-1.5 rounded-xl text-xs font-black bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                          Masukkan ke Tabel
                        </button>
                      </div>
                    </div>
                  )}

                  <datalist id="igd-diagnosa-list">
                    <option value="T78.2 - Anaphylactic shock" />
                    <option value="J45 - Asthma" />
                    <option value="J45.9 - Asthma, unspecified" />
                    <option value="R06.0 - Dyspnoea" />
                    <option value="A09.9 - Gastroenteritis and colitis" />
                    <option value="T14 - Injury of unspecified body" />
                    <option value="T14.0 - Superficial injury of" />
                  </datalist>

                  <div className="p-6 overflow-x-auto">
                    <table className="w-full text-left border-collapse border border-slate-300 bg-white min-w-[1180px]">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-300 text-slate-900">
                          <th className="py-2.5 px-2.5 font-extrabold text-xs uppercase text-center w-12 border-r border-slate-300">
                            NO
                          </th>
                          <th className="py-2.5 px-2.5 font-extrabold text-xs text-center w-32 border-r border-slate-300">
                            Tanggal
                          </th>
                          <th className="py-2.5 px-3 font-extrabold text-xs text-center min-w-[180px] border-r border-slate-300">
                            Pasien
                          </th>
                          <th className="py-2.5 px-2.5 font-extrabold text-xs text-center w-28 border-r border-slate-300">
                            RM
                          </th>
                          <th className="py-2.5 px-2.5 font-extrabold text-xs text-center w-36 border-r border-slate-300">
                            Tgl Lahir
                          </th>
                          <th className="py-2.5 px-3 font-extrabold text-xs text-center min-w-[230px] border-r border-slate-300">
                            Diagnosa
                          </th>
                          <th className="py-2.5 px-2.5 font-extrabold text-xs text-center w-36 border-r border-slate-300">
                            Jam Reg
                          </th>
                          <th className="py-2.5 px-2.5 font-extrabold text-xs text-center w-36 border-r border-slate-300">
                            Jam Periksa
                          </th>
                          <th className="py-2.5 px-2.5 font-extrabold text-xs text-center w-36 border-r border-slate-300">
                            Interval
                          </th>
                          <th className="py-2.5 px-2 font-extrabold text-xs text-center w-12">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {emergencyResponGrid.length === 0 ? (
                          <tr>
                            <td
                              colSpan={10}
                              className="py-12 text-center text-gray-400 text-xs italic font-semibold border-b border-slate-200 bg-[#fafdfc]"
                            >
                              Belum ada data Emergency Respon Time. Klik &quot;Tambah Pasien&quot; atau &quot;Tempel dari Excel / SIMRS&quot; untuk memulai.
                            </td>
                          </tr>
                        ) : (
                          emergencyResponGrid.map((row, idx) => {
                            const hasTimes =
                              row.jam_reg.trim() !== "" &&
                              row.jam_periksa.trim() !== "" &&
                              row.interval_text !== "";
                            const isWithinTarget = row.respon_kurang_5 === true;

                            return (
                              <tr
                                key={`${row.id}-${idx}`}
                                className="border-b border-slate-300 hover:bg-emerald-50/20 transition-colors text-xs"
                              >
                                <td className="py-2 px-2.5 text-center font-bold text-slate-700 border-r border-slate-300 tabular-nums">
                                  {idx + 1}
                                </td>
                                <td className="py-2 px-2 border-r border-slate-300">
                                  <input
                                    type="date"
                                    value={row.tanggal}
                                    onChange={(e) =>
                                      handleUpdateEmergencyRespon(row.id, "tanggal", e.target.value)
                                    }
                                    className="w-full bg-transparent outline-none text-xs font-semibold text-slate-800 text-center"
                                  />
                                </td>
                                <td className="py-2 px-2.5 border-r border-slate-300">
                                  <input
                                    type="text"
                                    placeholder="Nama Pasien"
                                    value={row.nama_pasien}
                                    onChange={(e) =>
                                      handleUpdateEmergencyRespon(row.id, "nama_pasien", e.target.value)
                                    }
                                    className="w-full bg-transparent outline-none text-xs font-bold text-slate-900 uppercase placeholder:normal-case placeholder:font-normal"
                                  />
                                </td>
                                <td className="py-2 px-2 border-r border-slate-300">
                                  <input
                                    type="text"
                                    placeholder="058727"
                                    value={row.no_rm}
                                    onChange={(e) =>
                                      handleUpdateEmergencyRespon(row.id, "no_rm", e.target.value)
                                    }
                                    className="w-full bg-transparent outline-none text-xs font-semibold text-slate-800 text-center tabular-nums"
                                  />
                                </td>
                                <td className="py-2 px-2 border-r border-slate-300">
                                  <input
                                    type="date"
                                    value={row.tgl_lahir}
                                    onChange={(e) =>
                                      handleUpdateEmergencyRespon(row.id, "tgl_lahir", e.target.value)
                                    }
                                    className="w-full bg-transparent outline-none text-xs font-semibold text-slate-800 text-center"
                                  />
                                </td>
                                <td className="py-2 px-2.5 border-r border-slate-300">
                                  <input
                                    type="text"
                                    list="igd-diagnosa-list"
                                    placeholder="J45 - Asthma"
                                    value={row.diagnosa}
                                    onChange={(e) =>
                                      handleUpdateEmergencyRespon(row.id, "diagnosa", e.target.value)
                                    }
                                    className="w-full bg-transparent outline-none text-xs font-medium text-slate-800"
                                  />
                                </td>
                                <td className="py-2 px-2 border-r border-slate-300 text-center">
                                  <input
                                    type="time"
                                    step="1"
                                    value={row.jam_reg}
                                    onChange={(e) =>
                                      handleUpdateEmergencyRespon(row.id, "jam_reg", e.target.value)
                                    }
                                    className="w-full bg-transparent outline-none text-xs font-semibold text-slate-900 text-center tabular-nums"
                                  />
                                </td>
                                <td className="py-2 px-2 border-r border-slate-300 text-center">
                                  <input
                                    type="time"
                                    step="1"
                                    value={row.jam_periksa}
                                    onChange={(e) =>
                                      handleUpdateEmergencyRespon(row.id, "jam_periksa", e.target.value)
                                    }
                                    className="w-full bg-transparent outline-none text-xs font-semibold text-slate-900 text-center tabular-nums"
                                  />
                                </td>
                                <td className="py-2 px-2 text-center border-r border-slate-300">
                                  {hasTimes ? (
                                    <div className="flex flex-col items-center gap-0.5">
                                      <span
                                        className={`inline-block px-2 py-0.5 rounded-md text-xs font-black tabular-nums ${
                                          isWithinTarget
                                            ? "bg-emerald-100 text-emerald-800"
                                            : "bg-rose-100 text-rose-800"
                                        }`}
                                      >
                                        {row.interval_text}
                                      </span>
                                      <span
                                        className={`text-[9px] font-bold ${
                                          isWithinTarget ? "text-emerald-700" : "text-rose-600"
                                        }`}
                                      >
                                        {isWithinTarget ? "≤ 5 Menit" : "> 5 Menit"}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-xs text-gray-400">00:00:00</span>
                                  )}
                                </td>
                                <td className="py-2 px-2 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveEmergencyResponRow(row.id)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded-lg transition-colors"
                                    title="Hapus Baris"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="px-6 py-4 bg-emerald-50/70 border-t border-emerald-100 flex flex-wrap items-center justify-between gap-4">
                    <p className="text-xs font-bold text-emerald-900">
                      Respon Time &le; 5 Menit (00:05:00):{" "}
                      <span className="font-black">
                        {emergencyResponGrid.filter((d) => d.respon_kurang_5 === true).length}
                      </span>{" "}
                      / Total Pasien Gawat Darurat:{" "}
                      <span className="font-black">{emergencyResponGrid.length}</span>
                    </p>
                    <p className="text-xs font-extrabold text-emerald-800">
                      Nilai / Persentase Capaian:{" "}
                      <span className="text-sm font-black">{computedCapaian}%</span>
                    </p>
                  </div>
                </div>
              )}

              {/* Specialized Form: Waktu Tanggap Operasi Seksio Sesaria Emergency (Kebidanan <= 30 Menit) */}
              {isScEmergency && (
                <div className="bg-[#f8fafc] border border-white rounded-[28px] overflow-hidden shadow-[8px_8px_20px_rgba(160,175,195,0.2),-8px_-8px_20px_rgba(255,255,255,0.95)] animate-in fade-in">
                  <div className="bg-emerald-600 p-5 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <Clock size={20} className="text-white" />
                      <div>
                        <h3 className="font-extrabold text-white tracking-wide text-sm md:text-base">
                          Formulir Validasi Waktu Tanggap Operasi Seksio Sesaria Emergency (&le; 30 Menit)
                        </h3>
                        <p className="text-[11px] font-semibold text-emerald-100">
                          Unit: {selectedUnit?.name || "-"} {selectedSubUnit ? `(${selectedSubUnit})` : ""} • Bulan: {formattedBulanLabel} • Target: &ge; 80%
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddScEmergencyRow}
                      className="flex items-center gap-1.5 bg-white text-emerald-800 hover:bg-emerald-50 px-3.5 py-1.5 rounded-xl text-xs font-black transition-colors"
                    >
                      <Plus size={14} /> Tambah Pasien
                    </button>
                  </div>

                  <div className="p-6 overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1040px]">
                      <thead>
                        <tr className="bg-emerald-50/55 border-b border-emerald-100 text-emerald-950">
                          <th className="py-3 px-3 font-extrabold text-xs uppercase w-12 text-center rounded-tl-xl border-r border-emerald-100/30">
                            No
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase w-32 border-r border-emerald-100/30">
                            Tanggal
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase w-32 border-r border-emerald-100/30">
                            No. Rekam Medis
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase min-w-[160px] border-r border-emerald-100/30">
                            Nama Pasien
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase text-center w-36 border-r border-emerald-100/30">
                            Jam Diputuskan Operasi
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase text-center w-36 border-r border-emerald-100/30">
                            Jam Dimulainya Insisi Operasi
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase text-center w-32 border-r border-emerald-100/30">
                            Interval Waktu
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase min-w-[210px] border-r border-emerald-100/30">
                            Keterangan
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase w-14 text-center rounded-tr-xl">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {scEmergencyGrid.length === 0 ? (
                          <tr>
                            <td
                              colSpan={9}
                              className="py-12 text-center text-gray-400 text-xs italic font-semibold border-b border-emerald-50 bg-[#fafdfc]"
                            >
                              Belum ada data SC Emergency. Klik &quot;Tambah Pasien&quot; untuk memulai pencatatan waktu tanggap operasi.
                            </td>
                          </tr>
                        ) : (
                          scEmergencyGrid.map((row, idx) => {
                            const hasTimes =
                              row.jam_diputuskan !== "" && row.jam_insisi !== "";
                            const isFast = row.sesuai_standar === true;

                            return (
                              <tr
                                key={`${row.id}-${idx}`}
                                className="border-b border-gray-100 hover:bg-emerald-50/15 transition-colors"
                              >
                                <td className="py-3 px-3 text-center text-xs font-bold text-gray-500 border-r border-emerald-50">
                                  {idx + 1}
                                </td>
                                <td className="py-3 px-3 border-r border-emerald-50">
                                  <input
                                    type="date"
                                    value={row.tanggal}
                                    onChange={(e) =>
                                      handleUpdateScEmergency(row.id, "tanggal", e.target.value)
                                    }
                                    className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
                                  />
                                </td>
                                <td className="py-3 px-3 border-r border-emerald-50">
                                  <input
                                    type="text"
                                    placeholder="No. RM"
                                    value={row.no_rm}
                                    onChange={(e) =>
                                      handleUpdateScEmergency(row.id, "no_rm", e.target.value)
                                    }
                                    className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
                                  />
                                </td>
                                <td className="py-3 px-3 border-r border-emerald-50">
                                  <input
                                    type="text"
                                    placeholder="Nama Pasien"
                                    value={row.nama_pasien}
                                    onChange={(e) =>
                                      handleUpdateScEmergency(row.id, "nama_pasien", e.target.value)
                                    }
                                    className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
                                  />
                                </td>
                                <td className="py-3 px-3 text-center border-r border-emerald-50">
                                  <input
                                    type="time"
                                    value={row.jam_diputuskan}
                                    onChange={(e) =>
                                      handleUpdateScEmergency(row.id, "jam_diputuskan", e.target.value)
                                    }
                                    className="w-full bg-transparent outline-none text-xs font-bold text-slate-800 text-center"
                                  />
                                </td>
                                <td className="py-3 px-3 text-center border-r border-emerald-50">
                                  <input
                                    type="time"
                                    value={row.jam_insisi}
                                    onChange={(e) =>
                                      handleUpdateScEmergency(row.id, "jam_insisi", e.target.value)
                                    }
                                    className="w-full bg-transparent outline-none text-xs font-bold text-slate-800 text-center"
                                  />
                                </td>
                                <td className="py-3 px-3 text-center border-r border-emerald-50">
                                  {hasTimes ? (
                                    <span
                                      className={`inline-block px-2.5 py-1 rounded-lg text-[11px] font-black ${
                                        row.interval_menit <= 30
                                          ? "bg-emerald-100 text-emerald-800"
                                          : "bg-rose-100 text-rose-800"
                                      }`}
                                    >
                                      {row.interval_menit} Menit
                                    </span>
                                  ) : (
                                    <span className="text-xs text-gray-400">-</span>
                                  )}
                                </td>
                                <td className="py-3 px-3 border-r border-emerald-50">
                                  <div className="space-y-1.5">
                                    <div className="flex items-center gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleUpdateScEmergency(row.id, "sesuai_standar", true)
                                        }
                                        className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-black border transition-all ${
                                          isFast
                                            ? "bg-emerald-600 text-white border-emerald-700"
                                            : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-emerald-50"
                                        }`}
                                      >
                                        Tepat (&le; 30m)
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleUpdateScEmergency(row.id, "sesuai_standar", false)
                                        }
                                        className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-black border transition-all ${
                                          row.sesuai_standar === false
                                            ? "bg-rose-600 text-white border-rose-700"
                                            : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-rose-50"
                                        }`}
                                      >
                                        Telat &gt; 30m
                                      </button>
                                    </div>
                                    <input
                                      type="text"
                                      placeholder="Catatan (opsional)"
                                      value={row.keterangan}
                                      onChange={(e) =>
                                        handleUpdateScEmergency(row.id, "keterangan", e.target.value)
                                      }
                                      className="w-full bg-white/80 border border-slate-200 rounded-md px-2 py-1 text-[11px] font-medium text-slate-700 outline-none focus:border-emerald-400"
                                    />
                                  </div>
                                </td>
                                <td className="py-3 px-3 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveScEmergencyRow(row.id)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                                    title="Hapus Baris"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="px-6 py-4 bg-emerald-50/70 border-t border-emerald-100 flex flex-wrap items-center justify-between gap-4">
                    <p className="text-xs font-bold text-emerald-900">
                      SC Emergency &le; 30 Menit:{" "}
                      <span className="font-black">
                        {scEmergencyGrid.filter((d) => d.sesuai_standar === true).length}
                      </span>{" "}
                      / Total Pasien SC Emergency:{" "}
                      <span className="font-black">{scEmergencyGrid.length}</span>
                    </p>
                    <p className="text-xs font-extrabold text-emerald-800">
                      Nilai / Persentase Capaian:{" "}
                      <span className="text-sm font-black">{computedCapaian}%</span>
                    </p>
                  </div>
                </div>
              )}

              {/* Specialized Form: Angka Persalinan Dengan Komplikasi Tertangani (Kebidanan) */}
              {isKomplikasiPersalinan && (
                <div className="bg-[#f8fafc] border border-white rounded-[28px] overflow-hidden shadow-[8px_8px_20px_rgba(160,175,195,0.2),-8px_-8px_20px_rgba(255,255,255,0.95)] animate-in fade-in">
                  <div className="bg-emerald-600 p-5 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <Activity size={20} className="text-white" />
                      <div>
                        <h3 className="font-extrabold text-white tracking-wide text-sm md:text-base">
                          Formulir Angka Persalinan Dengan Komplikasi Tertangani
                        </h3>
                        <p className="text-[11px] font-semibold text-emerald-100">
                          Unit: {selectedUnit?.name || "-"} {selectedSubUnit ? `(${selectedSubUnit})` : ""} • Bulan: {formattedBulanLabel} • Target: &ge; 95%
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddKomplikasiRow}
                      className="flex items-center gap-1.5 bg-white text-emerald-800 hover:bg-emerald-50 px-3.5 py-1.5 rounded-xl text-xs font-black transition-colors"
                    >
                      <Plus size={14} /> Tambah Pasien
                    </button>
                  </div>

                  <datalist id="komplikasi-obstetri-list">
                    <option value="Perdarahan Postpartum" />
                    <option value="Preeklamsia Berat / Eklamsia" />
                    <option value="Distosia" />
                    <option value="Infeksi Obstetri" />
                    <option value="Gawat Janin" />
                    <option value="Retensio Plasenta" />
                    <option value="Ruptur Uteri" />
                    <option value="Ketuban Pecah Dini (KPD)" />
                  </datalist>

                  <div className="p-6 overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1060px]">
                      <thead>
                        <tr className="bg-emerald-50/55 border-b border-emerald-100 text-emerald-950">
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase w-10 text-center rounded-tl-xl border-r border-emerald-100/30">
                            No
                          </th>
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase w-32 border-r border-emerald-100/30">
                            Tanggal
                          </th>
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase w-28 border-r border-emerald-100/30">
                            No. RM
                          </th>
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase min-w-[150px] border-r border-emerald-100/30">
                            Nama Pasien
                          </th>
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase min-w-[200px] border-r border-emerald-100/30">
                            Jenis Komplikasi Persalinan
                          </th>
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase text-center w-36 border-r border-emerald-100/30">
                            Ditangani
                          </th>
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase text-center w-36 border-r border-emerald-100/30">
                            Dirujuk
                          </th>
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase text-center w-24 border-r border-emerald-100/30">
                            Target (100%)
                          </th>
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase text-center w-24 border-r border-emerald-100/30">
                            Capaian
                          </th>
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase w-14 text-center rounded-tr-xl">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {komplikasiGrid.length === 0 ? (
                          <tr>
                            <td
                              colSpan={10}
                              className="py-12 text-center text-gray-400 text-xs italic font-semibold border-b border-emerald-50 bg-[#fafdfc]"
                            >
                              Belum ada data persalinan dengan komplikasi. Klik &quot;Tambah Pasien&quot; untuk memulai pencatatan.
                            </td>
                          </tr>
                        ) : (
                          komplikasiGrid.map((row, idx) => (
                            <tr
                              key={`${row.id}-${idx}`}
                              className="border-b border-gray-100 hover:bg-emerald-50/15 transition-colors"
                            >
                              <td className="py-3 px-2.5 text-center text-xs font-bold text-gray-500 border-r border-emerald-50">
                                {idx + 1}
                              </td>
                              <td className="py-3 px-2.5 border-r border-emerald-50">
                                <input
                                  type="date"
                                  value={row.tanggal}
                                  onChange={(e) =>
                                    handleUpdateKomplikasi(row.id, "tanggal", e.target.value)
                                  }
                                  className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
                                />
                              </td>
                              <td className="py-3 px-2.5 border-r border-emerald-50">
                                <input
                                  type="text"
                                  placeholder="No. RM"
                                  value={row.no_rm}
                                  onChange={(e) =>
                                    handleUpdateKomplikasi(row.id, "no_rm", e.target.value)
                                  }
                                  className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
                                />
                              </td>
                              <td className="py-3 px-2.5 border-r border-emerald-50">
                                <input
                                  type="text"
                                  placeholder="Nama Pasien"
                                  value={row.nama_pasien}
                                  onChange={(e) =>
                                    handleUpdateKomplikasi(row.id, "nama_pasien", e.target.value)
                                  }
                                  className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
                                />
                              </td>
                              <td className="py-3 px-2.5 border-r border-emerald-50">
                                <input
                                  type="text"
                                  list="komplikasi-obstetri-list"
                                  placeholder="Mis. Perdarahan Postpartum, PEB..."
                                  value={row.jenis_komplikasi}
                                  onChange={(e) =>
                                    handleUpdateKomplikasi(row.id, "jenis_komplikasi", e.target.value)
                                  }
                                  className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
                                />
                              </td>
                              <td className="py-3 px-2 text-center border-r border-emerald-50">
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleUpdateKomplikasi(row.id, "ditangani", "Ya")
                                    }
                                    className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-black border transition-all ${
                                      row.ditangani === "Ya"
                                        ? "bg-emerald-600 text-white border-emerald-700"
                                        : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-emerald-50"
                                    }`}
                                  >
                                    Ya
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleUpdateKomplikasi(row.id, "ditangani", "Tidak")
                                    }
                                    className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-black border transition-all ${
                                      row.ditangani === "Tidak"
                                        ? "bg-rose-600 text-white border-rose-700"
                                        : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-rose-50"
                                    }`}
                                  >
                                    Tidak
                                  </button>
                                </div>
                              </td>
                              <td className="py-3 px-2 text-center border-r border-emerald-50">
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleUpdateKomplikasi(row.id, "dirujuk", "Ya")
                                    }
                                    className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-black border transition-all ${
                                      row.dirujuk === "Ya"
                                        ? "bg-amber-500 text-white border-amber-600"
                                        : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-amber-50"
                                    }`}
                                  >
                                    Ya
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleUpdateKomplikasi(row.id, "dirujuk", "Tidak")
                                    }
                                    className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-black border transition-all ${
                                      row.dirujuk === "Tidak"
                                        ? "bg-emerald-600 text-white border-emerald-700"
                                        : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-emerald-50"
                                    }`}
                                  >
                                    Tidak
                                  </button>
                                </div>
                              </td>
                              <td className="py-3 px-2 text-center border-r border-emerald-50">
                                <span className="inline-block px-2 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-black">
                                  100%
                                </span>
                              </td>
                              <td className="py-3 px-2 text-center border-r border-emerald-50">
                                {row.ditangani === "Ya" ? (
                                  <span className="inline-block px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-[11px] font-black">
                                    100%
                                  </span>
                                ) : row.ditangani === "Tidak" ? (
                                  <span className="inline-block px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 text-[11px] font-black">
                                    0%
                                  </span>
                                ) : (
                                  <span className="text-xs text-gray-400">-</span>
                                )}
                              </td>
                              <td className="py-3 px-2.5 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveKomplikasiRow(row.id)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                                  title="Hapus Baris"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="px-6 py-4 bg-emerald-50/70 border-t border-emerald-100 flex flex-wrap items-center justify-between gap-4">
                    <p className="text-xs font-bold text-emerald-900">
                      Komplikasi Tertangani Sesuai Standar:{" "}
                      <span className="font-black">
                        {komplikasiGrid.filter((d) => d.ditangani === "Ya").length}
                      </span>{" "}
                      / Total Persalinan Dengan Komplikasi:{" "}
                      <span className="font-black">{komplikasiGrid.length}</span>
                    </p>
                    <p className="text-xs font-extrabold text-emerald-800">
                      Nilai / Persentase Capaian:{" "}
                      <span className="text-sm font-black">{computedCapaian}%</span>
                    </p>
                  </div>
                </div>
              )}

              {/* Specialized Form: Pelaporan Hasil Kritis Laboratorium (< 30 Menit) */}
              {isHasilKritisLab && (
                <div className="bg-[#f8fafc] border border-white rounded-[28px] overflow-hidden shadow-[8px_8px_20px_rgba(160,175,195,0.2),-8px_-8px_20px_rgba(255,255,255,0.95)] animate-in fade-in">
                  <div className="bg-emerald-600 p-5 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <Clock size={20} className="text-white" />
                      <div>
                        <h3 className="font-extrabold text-white tracking-wide text-sm md:text-base">
                          Formulir Pelaporan Hasil Kritis Laboratorium (&lt; 30 Menit)
                        </h3>
                        <p className="text-[11px] font-semibold text-emerald-100">
                          Unit: {selectedUnit?.name || "-"} {selectedSubUnit ? `(${selectedSubUnit})` : ""} • Bulan: {formattedBulanLabel} • Target: 100%
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddHasilKritisRow}
                      className="flex items-center gap-1.5 bg-white text-emerald-800 hover:bg-emerald-50 px-3.5 py-1.5 rounded-xl text-xs font-black transition-colors"
                    >
                      <Plus size={14} /> Tambah Pasien
                    </button>
                  </div>

                  <div className="p-6 overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1040px]">
                      <thead>
                        <tr className="bg-emerald-50/55 border-b border-emerald-100 text-emerald-950">
                          <th className="py-3 px-3 font-extrabold text-xs uppercase w-12 text-center rounded-tl-xl border-r border-emerald-100/30">
                            No
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase w-32 border-r border-emerald-100/30">
                            Tanggal
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase w-32 border-r border-emerald-100/30">
                            No. Rekam Medis
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase min-w-[160px] border-r border-emerald-100/30">
                            Nama Pasien
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase text-center w-36 border-r border-emerald-100/30">
                            Jam Hasil Pemeriksaan Keluar
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase text-center w-36 border-r border-emerald-100/30">
                            Jam Hasil Dilaporkan Ke Dokter
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase text-center w-32 border-r border-emerald-100/30">
                            Interval Waktu
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase min-w-[210px] border-r border-emerald-100/30">
                            Keterangan
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase w-14 text-center rounded-tr-xl">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {hasilKritisLabGrid.length === 0 ? (
                          <tr>
                            <td
                              colSpan={9}
                              className="py-12 text-center text-gray-400 text-xs italic font-semibold border-b border-emerald-50 bg-[#fafdfc]"
                            >
                              Belum ada data hasil kritis laboratorium. Klik &quot;Tambah Pasien&quot; untuk mulai mencatat pelaporan.
                            </td>
                          </tr>
                        ) : (
                          hasilKritisLabGrid.map((row, idx) => {
                            const hasTimes = row.jam_keluar !== "" && row.jam_lapor !== "";
                            const isFast = row.sesuai_standar === true;

                            return (
                              <tr
                                key={`${row.id}-${idx}`}
                                className="border-b border-gray-100 hover:bg-emerald-50/15 transition-colors"
                              >
                                <td className="py-3 px-3 text-center text-xs font-bold text-gray-500 border-r border-emerald-50">
                                  {idx + 1}
                                </td>
                                <td className="py-3 px-3 border-r border-emerald-50">
                                  <input
                                    type="date"
                                    value={row.tanggal}
                                    onChange={(e) =>
                                      handleUpdateHasilKritis(row.id, "tanggal", e.target.value)
                                    }
                                    className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
                                  />
                                </td>
                                <td className="py-3 px-3 border-r border-emerald-50">
                                  <input
                                    type="text"
                                    placeholder="No. RM"
                                    value={row.no_rm}
                                    onChange={(e) =>
                                      handleUpdateHasilKritis(row.id, "no_rm", e.target.value)
                                    }
                                    className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
                                  />
                                </td>
                                <td className="py-3 px-3 border-r border-emerald-50">
                                  <input
                                    type="text"
                                    placeholder="Nama Pasien"
                                    value={row.nama_pasien}
                                    onChange={(e) =>
                                      handleUpdateHasilKritis(row.id, "nama_pasien", e.target.value)
                                    }
                                    className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
                                  />
                                </td>
                                <td className="py-3 px-3 text-center border-r border-emerald-50">
                                  <input
                                    type="time"
                                    value={row.jam_keluar}
                                    onChange={(e) =>
                                      handleUpdateHasilKritis(row.id, "jam_keluar", e.target.value)
                                    }
                                    className="w-full bg-transparent outline-none text-xs font-bold text-slate-800 text-center"
                                  />
                                </td>
                                <td className="py-3 px-3 text-center border-r border-emerald-50">
                                  <input
                                    type="time"
                                    value={row.jam_lapor}
                                    onChange={(e) =>
                                      handleUpdateHasilKritis(row.id, "jam_lapor", e.target.value)
                                    }
                                    className="w-full bg-transparent outline-none text-xs font-bold text-slate-800 text-center"
                                  />
                                </td>
                                <td className="py-3 px-3 text-center border-r border-emerald-50">
                                  {hasTimes ? (
                                    <span
                                      className={`inline-block px-2.5 py-1 rounded-lg text-[11px] font-black ${
                                        row.interval_menit < 30
                                          ? "bg-emerald-100 text-emerald-800"
                                          : "bg-rose-100 text-rose-800"
                                      }`}
                                    >
                                      {row.interval_menit} Menit
                                    </span>
                                  ) : (
                                    <span className="text-xs text-gray-400">-</span>
                                  )}
                                </td>
                                <td className="py-3 px-3 border-r border-emerald-50">
                                  <div className="space-y-1.5">
                                    <div className="flex items-center gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleUpdateHasilKritis(row.id, "sesuai_standar", true)
                                        }
                                        className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-black border transition-all ${
                                          isFast
                                            ? "bg-emerald-600 text-white border-emerald-700"
                                            : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-emerald-50"
                                        }`}
                                      >
                                        Lapor &lt; 30m
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleUpdateHasilKritis(row.id, "sesuai_standar", false)
                                        }
                                        className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-black border transition-all ${
                                          row.sesuai_standar === false
                                            ? "bg-rose-600 text-white border-rose-700"
                                            : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-rose-50"
                                        }`}
                                      >
                                        Telat &ge; 30m
                                      </button>
                                    </div>
                                    <input
                                      type="text"
                                      placeholder="Catatan (opsional)"
                                      value={row.keterangan}
                                      onChange={(e) =>
                                        handleUpdateHasilKritis(row.id, "keterangan", e.target.value)
                                      }
                                      className="w-full bg-white/80 border border-slate-200 rounded-md px-2 py-1 text-[11px] font-medium text-slate-700 outline-none focus:border-emerald-400"
                                    />
                                  </div>
                                </td>
                                <td className="py-3 px-3 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveHasilKritisRow(row.id)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                                    title="Hapus Baris"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="px-6 py-4 bg-emerald-50/70 border-t border-emerald-100 flex flex-wrap items-center justify-between gap-4">
                    <p className="text-xs font-bold text-emerald-900">
                      Dilaporkan &lt; 30 Menit:{" "}
                      <span className="font-black">
                        {hasilKritisLabGrid.filter((d) => d.sesuai_standar === true).length}
                      </span>{" "}
                      / Total Hasil Kritis:{" "}
                      <span className="font-black">{hasilKritisLabGrid.length}</span>
                    </p>
                    <p className="text-xs font-extrabold text-emerald-800">
                      Nilai / Persentase Capaian:{" "}
                      <span className="text-sm font-black">{computedCapaian}%</span>
                    </p>
                  </div>
                </div>
              )}

              {/* Specialized Form: Persentase Sampel Laboratorium Yang Tidak Diberi Pelabelan */}
              {isSampelLabTanpaLabel && (
                <div className="bg-[#f8fafc] border border-white rounded-[28px] overflow-hidden shadow-[8px_8px_20px_rgba(160,175,195,0.2),-8px_-8px_20px_rgba(255,255,255,0.95)] animate-in fade-in">
                  <div className="bg-emerald-600 p-5 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <Activity size={20} className="text-white" />
                      <div>
                        <h3 className="font-extrabold text-white tracking-wide text-sm md:text-base">
                          Formulir Persentase Sampel Laboratorium Yang Tidak Diberi Pelabelan
                        </h3>
                        <p className="text-[11px] font-semibold text-emerald-100">
                          Unit: {selectedUnit?.name || "-"} {selectedSubUnit ? `(${selectedSubUnit})` : ""} • Bulan: {formattedBulanLabel} • Target: 0%
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={handleAddNihilSampelLabRow}
                        className="flex items-center gap-1.5 bg-emerald-50 text-emerald-900 hover:bg-white px-3 py-1.5 rounded-xl text-xs font-extrabold transition-colors border border-emerald-200"
                      >
                        <CheckCircle2 size={14} /> Nihil (Semua Berlabel)
                      </button>
                      <button
                        type="button"
                        onClick={handleAddSampelLabRow}
                        className="flex items-center gap-1.5 bg-white text-emerald-800 hover:bg-emerald-50 px-3.5 py-1.5 rounded-xl text-xs font-black transition-colors"
                      >
                        <Plus size={14} /> Tambah Sampel
                      </button>
                    </div>
                  </div>

                  <div className="px-6 pt-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <p className="text-xs font-semibold text-slate-500">
                      Audit penerimaan spesimen harian/bulanan. Sampel dengan label tidak ada / identitas tidak lengkap otomatis terhitung sebagai numerator (&ldquo;Sampel Tidak Diberi Pelabelan&rdquo;).
                    </p>
                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 shrink-0 shadow-2xs">
                      <label className="text-[11px] font-extrabold text-slate-700 whitespace-nowrap">
                        Total Sampel Diterima (Opsional):
                      </label>
                      <input
                        type="number"
                        min={sampelLabGrid.length || 1}
                        placeholder={String(sampelLabGrid.length || 1)}
                        value={sampelLabTotalDenom}
                        onChange={(e) =>
                          setSampelLabTotalDenom(
                            e.target.value === "" ? "" : Number(e.target.value),
                          )
                        }
                        className="w-24 text-center bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-black text-slate-900 outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <datalist id="lab-unit-pengirim-list">
                    <option value="IGD" />
                    <option value="Ranap Aisyah Anak" />
                    <option value="Ranap Aisyah Bedah" />
                    <option value="Ranap Fatimah" />
                    <option value="Ranap Khadijah" />
                    <option value="Emergency Kebidanan" />
                    <option value="Ranap Usman" />
                    <option value="ICU" />
                    <option value="IBS" />
                    <option value="Rawat Jalan" />
                  </datalist>

                  <datalist id="lab-jenis-spesimen-list">
                    <option value="Darah" />
                    <option value="Urin" />
                    <option value="Feses" />
                    <option value="Sputum" />
                    <option value="Cairan Tubuh" />
                    <option value="Swab / Kultur" />
                  </datalist>

                  <div className="p-6 overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1160px]">
                      <thead>
                        <tr className="bg-emerald-50/55 border-b border-emerald-100 text-emerald-950">
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase w-10 text-center rounded-tl-xl border-r border-emerald-100/30">
                            No
                          </th>
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase w-32 border-r border-emerald-100/30">
                            Tanggal
                          </th>
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase min-w-[140px] border-r border-emerald-100/30">
                            Unit Pengirim
                          </th>
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase min-w-[170px] border-r border-emerald-100/30">
                            Nama Pasien / No. RM
                          </th>
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase min-w-[130px] border-r border-emerald-100/30">
                            Jenis Spesimen
                          </th>
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase text-center w-36 border-r border-emerald-100/30">
                            Label Spesimen Ada (Ya/Tidak)
                          </th>
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase text-center w-36 border-r border-emerald-100/30">
                            Identitas Label Lengkap (Ya/Tidak)
                          </th>
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase text-center w-40 border-r border-emerald-100/30">
                            Status Sampel (Diterima/Ditolak)
                          </th>
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase min-w-[140px] border-r border-emerald-100/30">
                            Keterangan
                          </th>
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase w-14 text-center rounded-tr-xl">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {sampelLabGrid.length === 0 ? (
                          <tr>
                            <td
                              colSpan={10}
                              className="py-12 text-center text-gray-400 text-xs italic font-semibold border-b border-emerald-50 bg-[#fafdfc]"
                            >
                              Belum ada data sampel laboratorium. Klik &quot;Tambah Sampel&quot; atau &quot;Nihil (Semua Berlabel)&quot; untuk memulai.
                            </td>
                          </tr>
                        ) : (
                          sampelLabGrid.map((row, idx) => (
                            <tr
                              key={`${row.id}-${idx}`}
                              className="border-b border-gray-100 hover:bg-emerald-50/15 transition-colors"
                            >
                              <td className="py-3 px-2.5 text-center text-xs font-bold text-gray-500 border-r border-emerald-50">
                                {idx + 1}
                              </td>
                              <td className="py-3 px-2.5 border-r border-emerald-50">
                                <input
                                  type="date"
                                  value={row.tanggal}
                                  onChange={(e) =>
                                    handleUpdateSampelLab(row.id, "tanggal", e.target.value)
                                  }
                                  className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
                                />
                              </td>
                              <td className="py-3 px-2.5 border-r border-emerald-50">
                                <input
                                  type="text"
                                  list="lab-unit-pengirim-list"
                                  placeholder="Unit Pengirim"
                                  value={row.unit_pengirim}
                                  onChange={(e) =>
                                    handleUpdateSampelLab(row.id, "unit_pengirim", e.target.value)
                                  }
                                  className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
                                />
                              </td>
                              <td className="py-3 px-2.5 border-r border-emerald-50">
                                <input
                                  type="text"
                                  placeholder="Nama Pasien / No. RM"
                                  value={row.nama_pasien_rm}
                                  onChange={(e) =>
                                    handleUpdateSampelLab(row.id, "nama_pasien_rm", e.target.value)
                                  }
                                  className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
                                />
                              </td>
                              <td className="py-3 px-2.5 border-r border-emerald-50">
                                <input
                                  type="text"
                                  list="lab-jenis-spesimen-list"
                                  placeholder="Darah, Urin..."
                                  value={row.jenis_spesimen}
                                  onChange={(e) =>
                                    handleUpdateSampelLab(row.id, "jenis_spesimen", e.target.value)
                                  }
                                  className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
                                />
                              </td>
                              <td className="py-3 px-2 text-center border-r border-emerald-50">
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleUpdateSampelLab(row.id, "label_ada", "Ya")
                                    }
                                    className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-black border transition-all ${
                                      row.label_ada === "Ya"
                                        ? "bg-emerald-600 text-white border-emerald-700"
                                        : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-emerald-50"
                                    }`}
                                  >
                                    Ya
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleUpdateSampelLab(row.id, "label_ada", "Tidak")
                                    }
                                    className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-black border transition-all ${
                                      row.label_ada === "Tidak"
                                        ? "bg-rose-600 text-white border-rose-700"
                                        : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-rose-50"
                                    }`}
                                  >
                                    Tidak
                                  </button>
                                </div>
                              </td>
                              <td className="py-3 px-2 text-center border-r border-emerald-50">
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleUpdateSampelLab(row.id, "identitas_lengkap", "Ya")
                                    }
                                    className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-black border transition-all ${
                                      row.identitas_lengkap === "Ya"
                                        ? "bg-emerald-600 text-white border-emerald-700"
                                        : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-emerald-50"
                                    }`}
                                  >
                                    Ya
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleUpdateSampelLab(row.id, "identitas_lengkap", "Tidak")
                                    }
                                    className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-black border transition-all ${
                                      row.identitas_lengkap === "Tidak"
                                        ? "bg-rose-600 text-white border-rose-700"
                                        : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-rose-50"
                                    }`}
                                  >
                                    Tidak
                                  </button>
                                </div>
                              </td>
                              <td className="py-3 px-2 text-center border-r border-emerald-50">
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleUpdateSampelLab(row.id, "status_sampel", "Diterima")
                                    }
                                    className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-black border transition-all ${
                                      row.status_sampel === "Diterima"
                                        ? "bg-emerald-600 text-white border-emerald-700"
                                        : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-emerald-50"
                                    }`}
                                  >
                                    Diterima
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleUpdateSampelLab(row.id, "status_sampel", "Ditolak")
                                    }
                                    className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-black border transition-all ${
                                      row.status_sampel === "Ditolak"
                                        ? "bg-rose-600 text-white border-rose-700"
                                        : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-rose-50"
                                    }`}
                                  >
                                    Ditolak
                                  </button>
                                </div>
                              </td>
                              <td className="py-3 px-2.5 border-r border-emerald-50">
                                <input
                                  type="text"
                                  placeholder="Keterangan (opsional)"
                                  value={row.keterangan}
                                  onChange={(e) =>
                                    handleUpdateSampelLab(row.id, "keterangan", e.target.value)
                                  }
                                  className="w-full bg-transparent outline-none text-xs font-medium text-slate-700"
                                />
                              </td>
                              <td className="py-3 px-2.5 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSampelLabRow(row.id)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                                  title="Hapus Baris"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="px-6 py-4 bg-emerald-50/70 border-t border-emerald-100 flex flex-wrap items-center justify-between gap-4">
                    <p className="text-xs font-bold text-emerald-900">
                      Sampel Tidak Berlabel / Ditolak:{" "}
                      <span className="font-black">
                        {
                          sampelLabGrid.filter(
                            (d) =>
                              d.label_ada === "Tidak" ||
                              d.identitas_lengkap === "Tidak" ||
                              d.status_sampel === "Ditolak",
                          ).length
                        }
                      </span>{" "}
                      / Total Sampel Diterima:{" "}
                      <span className="font-black">
                        {Math.max(sampelLabGrid.length, Number(sampelLabTotalDenom) || 0)}
                      </span>
                    </p>
                    <p className="text-xs font-extrabold text-emerald-800">
                      Nilai / Persentase Tanpa Label:{" "}
                      <span className="text-sm font-black">{computedCapaian}%</span>
                    </p>
                  </div>
                </div>
              )}


              {/* Specialized Form: Angka Kunjungan Keluarga Diluar Jam Kunjungan RS (Keamanan <= 5%) */}
              {isKunjunganKeluarga && (
                <div className="bg-[#f8fafc] border border-white rounded-[28px] overflow-hidden shadow-[8px_8px_20px_rgba(160,175,195,0.2),-8px_-8px_20px_rgba(255,255,255,0.95)] animate-in fade-in">
                  <div className="bg-emerald-600 p-5 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <Activity size={20} className="text-white" />
                      <div>
                        <h3 className="font-extrabold text-white tracking-wide text-sm md:text-base">
                          Formulir Angka Kunjungan Keluarga Diluar Jam Kunjungan Rumah Sakit
                        </h3>
                        <p className="text-[11px] font-semibold text-emerald-100">
                          Unit: {selectedUnit?.name || "-"} {selectedSubUnit ? `(${selectedSubUnit})` : ""} • Bulan: {formattedBulanLabel} • Target: &le; 5%
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={handleAddNihilKunjunganRow}
                        className="flex items-center gap-1.5 bg-emerald-50 text-emerald-900 hover:bg-white px-3 py-1.5 rounded-xl text-xs font-extrabold transition-colors border border-emerald-200"
                      >
                        <CheckCircle2 size={14} /> Nihil (Semua Sesuai Jam)
                      </button>
                      <button
                        type="button"
                        onClick={handleAddKunjunganRow}
                        className="flex items-center gap-1.5 bg-white text-emerald-800 hover:bg-emerald-50 px-3.5 py-1.5 rounded-xl text-xs font-black transition-colors"
                      >
                        <Plus size={14} /> Tambah Pengunjung
                      </button>
                    </div>
                  </div>

                  <div className="px-6 pt-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <p className="text-xs font-semibold text-slate-500">
                      Catat kunjungan keluarga. Pilih <strong>Tidak (Diluar Jam)</strong> pada kolom Sesuai Jam Kunjungan bila pengunjung datang di luar jam resmi tanpa izin khusus.
                    </p>
                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 shrink-0 shadow-2xs">
                      <label className="text-[11px] font-extrabold text-slate-700 whitespace-nowrap">
                        Total Kunjungan Keluarga (Opsional):
                      </label>
                      <input
                        type="number"
                        min={kunjunganGrid.length || 1}
                        placeholder={String(kunjunganGrid.length || 1)}
                        value={kunjunganTotalDenom}
                        onChange={(e) =>
                          setKunjunganTotalDenom(
                            e.target.value === "" ? "" : Number(e.target.value),
                          )
                        }
                        className="w-24 text-center bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-black text-slate-900 outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <datalist id="keamanan-ruangan-list">
                    <option value="Ranap Aisyah Anak" />
                    <option value="Ranap Aisyah Bedah" />
                    <option value="Ranap Fatimah" />
                    <option value="Ranap Khadijah" />
                    <option value="Ranap Usman" />
                    <option value="ICU" />
                    <option value="IGD" />
                  </datalist>

                  <div className="p-6 overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1160px]">
                      <thead>
                        <tr className="bg-emerald-50/55 border-b border-emerald-100 text-emerald-950">
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase w-10 text-center rounded-tl-xl border-r border-emerald-100/30">
                            No
                          </th>
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase w-32 border-r border-emerald-100/30">
                            Tanggal
                          </th>
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase min-w-[150px] border-r border-emerald-100/30">
                            Nama Pengunjung
                          </th>
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase min-w-[140px] border-r border-emerald-100/30">
                            Nama Pasien
                          </th>
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase min-w-[130px] border-r border-emerald-100/30">
                            Ruangan
                          </th>
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase text-center w-28 border-r border-emerald-100/30">
                            Jam Masuk
                          </th>
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase text-center w-28 border-r border-emerald-100/30">
                            Jam Keluar
                          </th>
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase text-center w-44 border-r border-emerald-100/30">
                            Sesuai Jam Kunjungan (Ya/Tidak)
                          </th>
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase text-center w-32 border-r border-emerald-100/30">
                            Jumlah Pasien Rawat Inap
                          </th>
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase w-14 text-center rounded-tr-xl">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {kunjunganGrid.length === 0 ? (
                          <tr>
                            <td
                              colSpan={10}
                              className="py-12 text-center text-gray-400 text-xs italic font-semibold border-b border-emerald-50 bg-[#fafdfc]"
                            >
                              Belum ada data kunjungan keluarga. Klik &quot;Tambah Pengunjung&quot; atau &quot;Nihil&quot; untuk memulai.
                            </td>
                          </tr>
                        ) : (
                          kunjunganGrid.map((row, idx) => (
                            <tr
                              key={`${row.id}-${idx}`}
                              className="border-b border-gray-100 hover:bg-emerald-50/15 transition-colors"
                            >
                              <td className="py-3 px-2.5 text-center text-xs font-bold text-gray-500 border-r border-emerald-50">
                                {idx + 1}
                              </td>
                              <td className="py-3 px-2.5 border-r border-emerald-50">
                                <input
                                  type="date"
                                  value={row.tanggal}
                                  onChange={(e) =>
                                    handleUpdateKunjungan(row.id, "tanggal", e.target.value)
                                  }
                                  className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
                                />
                              </td>
                              <td className="py-3 px-2.5 border-r border-emerald-50">
                                <input
                                  type="text"
                                  placeholder="Nama Pengunjung"
                                  value={row.nama_pengunjung}
                                  onChange={(e) =>
                                    handleUpdateKunjungan(row.id, "nama_pengunjung", e.target.value)
                                  }
                                  className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
                                />
                              </td>
                              <td className="py-3 px-2.5 border-r border-emerald-50">
                                <input
                                  type="text"
                                  placeholder="Nama Pasien"
                                  value={row.nama_pasien}
                                  onChange={(e) =>
                                    handleUpdateKunjungan(row.id, "nama_pasien", e.target.value)
                                  }
                                  className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
                                />
                              </td>
                              <td className="py-3 px-2.5 border-r border-emerald-50">
                                <input
                                  type="text"
                                  list="keamanan-ruangan-list"
                                  placeholder="Ruangan"
                                  value={row.ruangan}
                                  onChange={(e) =>
                                    handleUpdateKunjungan(row.id, "ruangan", e.target.value)
                                  }
                                  className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
                                />
                              </td>
                              <td className="py-3 px-2.5 text-center border-r border-emerald-50">
                                <input
                                  type={row.jam_masuk === "-" ? "text" : "time"}
                                  value={row.jam_masuk}
                                  onChange={(e) =>
                                    handleUpdateKunjungan(row.id, "jam_masuk", e.target.value)
                                  }
                                  className="w-full bg-transparent outline-none text-xs font-bold text-slate-800 text-center"
                                />
                              </td>
                              <td className="py-3 px-2.5 text-center border-r border-emerald-50">
                                <input
                                  type={row.jam_keluar === "-" ? "text" : "time"}
                                  value={row.jam_keluar}
                                  onChange={(e) =>
                                    handleUpdateKunjungan(row.id, "jam_keluar", e.target.value)
                                  }
                                  className="w-full bg-transparent outline-none text-xs font-bold text-slate-800 text-center"
                                />
                              </td>
                              <td className="py-3 px-2 text-center border-r border-emerald-50">
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleUpdateKunjungan(row.id, "sesuai_jam_kunjungan", "Ya")
                                    }
                                    className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-black border transition-all ${
                                      row.sesuai_jam_kunjungan === "Ya"
                                        ? "bg-emerald-600 text-white border-emerald-700"
                                        : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-emerald-50"
                                    }`}
                                  >
                                    Ya (Sesuai)
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleUpdateKunjungan(row.id, "sesuai_jam_kunjungan", "Tidak")
                                    }
                                    className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-black border transition-all ${
                                      row.sesuai_jam_kunjungan === "Tidak"
                                        ? "bg-rose-600 text-white border-rose-700"
                                        : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-rose-50"
                                    }`}
                                  >
                                    Tidak (Diluar)
                                  </button>
                                </div>
                              </td>
                              <td className="py-3 px-2.5 text-center border-r border-emerald-50">
                                <input
                                  type="number"
                                  min="0"
                                  placeholder="-"
                                  value={row.jumlah_pasien_ranap}
                                  onChange={(e) =>
                                    handleUpdateKunjungan(
                                      row.id,
                                      "jumlah_pasien_ranap",
                                      e.target.value === "" ? "" : Number(e.target.value),
                                    )
                                  }
                                  className="w-full text-center bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-extrabold text-slate-800 outline-none focus:border-emerald-400"
                                />
                              </td>
                              <td className="py-3 px-2.5 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveKunjunganRow(row.id)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                                  title="Hapus Baris"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="px-6 py-4 bg-emerald-50/70 border-t border-emerald-100 flex flex-wrap items-center justify-between gap-4">
                    <p className="text-xs font-bold text-emerald-900">
                      Kunjungan Diluar Jam Tanpa Izin:{" "}
                      <span className="font-black">
                        {kunjunganGrid.filter((d) => d.sesuai_jam_kunjungan === "Tidak").length}
                      </span>{" "}
                      / Total Kunjungan:{" "}
                      <span className="font-black">
                        {Math.max(kunjunganGrid.length, Number(kunjunganTotalDenom) || 0)}
                      </span>
                    </p>
                    <p className="text-xs font-extrabold text-emerald-800">
                      Nilai / Persentase Diluar Jam:{" "}
                      <span className="text-sm font-black">{computedCapaian}%</span>
                    </p>
                  </div>
                </div>
              )}

              {/* Specialized Form: Persentase Sarana Sanitasi (Kebersihan/Kesling 100%) */}
              {isSaranaSanitasi && (
                <div className="bg-[#f8fafc] border border-white rounded-[28px] overflow-hidden shadow-[8px_8px_20px_rgba(160,175,195,0.2),-8px_-8px_20px_rgba(255,255,255,0.95)] animate-in fade-in">
                  <div className="bg-emerald-600 p-5 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <Activity size={20} className="text-white" />
                      <div>
                        <h3 className="font-extrabold text-white tracking-wide text-sm md:text-base">
                          Formulir Persentase Sarana Sanitasi (Toilet, Wastafel, Saluran Pembuangan)
                        </h3>
                        <p className="text-[11px] font-semibold text-emerald-100">
                          Unit: {selectedUnit?.name || "-"} {selectedSubUnit ? `(${selectedSubUnit})` : ""} • Bulan: {formattedBulanLabel} • Target: 100%
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddSanitasiRow}
                      className="flex items-center gap-1.5 bg-white text-emerald-800 hover:bg-emerald-50 px-3.5 py-1.5 rounded-xl text-xs font-black transition-colors"
                    >
                      <Plus size={14} /> Tambah Unit Inspeksi
                    </button>
                  </div>

                  <datalist id="kesling-unit-list">
                    <option value="IGD" />
                    <option value="Ranap Aisyah Anak" />
                    <option value="Ranap Aisyah Bedah" />
                    <option value="Ranap Fatimah" />
                    <option value="Ranap Khadijah" />
                    <option value="Emergency Kebidanan" />
                    <option value="Ranap Usman" />
                    <option value="ICU" />
                    <option value="IBS" />
                    <option value="Rawat Jalan" />
                    <option value="Radiologi" />
                    <option value="Laboratorium" />
                    <option value="Farmasi" />
                    <option value="Laundry / CSSD" />
                  </datalist>

                  <div className="p-6 overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1120px]">
                      <thead>
                        <tr className="bg-emerald-50/55 border-b border-emerald-100 text-emerald-950">
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase w-10 text-center rounded-tl-xl border-r border-emerald-100/30">
                            No
                          </th>
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase w-32 border-r border-emerald-100/30">
                            Tanggal
                          </th>
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase min-w-[150px] border-r border-emerald-100/30">
                            Unit
                          </th>
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase text-center w-36 border-r border-emerald-100/30">
                            Toilet
                          </th>
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase text-center w-36 border-r border-emerald-100/30">
                            Wastafel
                          </th>
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase text-center w-40 border-r border-emerald-100/30">
                            Saluran Pembuangan
                          </th>
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase text-center w-32 border-r border-emerald-100/30">
                            Berfungsi Baik
                          </th>
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase text-center w-28 border-r border-emerald-100/30">
                            Rusak
                          </th>
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase min-w-[150px] border-r border-emerald-100/30">
                            Keterangan
                          </th>
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase w-14 text-center rounded-tr-xl">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {sanitasiGrid.length === 0 ? (
                          <tr>
                            <td
                              colSpan={10}
                              className="py-12 text-center text-gray-400 text-xs italic font-semibold border-b border-emerald-50 bg-[#fafdfc]"
                            >
                              Belum ada data inspeksi sanitasi. Klik &quot;Tambah Unit Inspeksi&quot; untuk memulai pemeriksaan.
                            </td>
                          </tr>
                        ) : (
                          sanitasiGrid.map((row, idx) => (
                            <tr
                              key={`${row.id}-${idx}`}
                              className="border-b border-gray-100 hover:bg-emerald-50/15 transition-colors"
                            >
                              <td className="py-3 px-2.5 text-center text-xs font-bold text-gray-500 border-r border-emerald-50">
                                {idx + 1}
                              </td>
                              <td className="py-3 px-2.5 border-r border-emerald-50">
                                <input
                                  type="date"
                                  value={row.tanggal}
                                  onChange={(e) =>
                                    handleUpdateSanitasi(row.id, "tanggal", e.target.value)
                                  }
                                  className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
                                />
                              </td>
                              <td className="py-3 px-2.5 border-r border-emerald-50">
                                <input
                                  type="text"
                                  list="kesling-unit-list"
                                  placeholder="Nama Unit"
                                  value={row.unit}
                                  onChange={(e) =>
                                    handleUpdateSanitasi(row.id, "unit", e.target.value)
                                  }
                                  className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
                                />
                              </td>
                              {(["toilet", "wastafel", "saluran_pembuangan"] as const).map(
                                (itemKey) => {
                                  const val = row[itemKey];
                                  return (
                                    <td
                                      key={itemKey}
                                      className="py-3 px-1.5 text-center border-r border-emerald-50"
                                    >
                                      <select
                                        value={val}
                                        onChange={(e) =>
                                          handleUpdateSanitasi(row.id, itemKey, e.target.value)
                                        }
                                        className={`w-full h-8 rounded-lg outline-none text-[11px] font-extrabold text-center px-1 ${
                                          val === ""
                                            ? "bg-slate-100 text-slate-500"
                                            : val === "Baik"
                                              ? "bg-emerald-100 text-emerald-800"
                                              : val === "Rusak"
                                                ? "bg-rose-100 text-rose-800"
                                                : "bg-slate-200 text-slate-700"
                                        }`}
                                      >
                                        <option value="">-- Pilih --</option>
                                        <option value="Baik">Baik</option>
                                        <option value="Rusak">Rusak</option>
                                        <option value="N/A">N/A</option>
                                      </select>
                                    </td>
                                  );
                                },
                              )}
                              <td className="py-3 px-2 text-center border-r border-emerald-50">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleUpdateSanitasi(row.id, "status_fungsi", "Berfungsi Baik")
                                  }
                                  className={`w-full py-1.5 px-2 rounded-xl text-[11px] font-black border transition-all inline-flex items-center justify-center gap-1 ${
                                    row.status_fungsi === "Berfungsi Baik"
                                      ? "bg-emerald-600 text-white border-emerald-700"
                                      : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-emerald-50"
                                  }`}
                                >
                                  {row.status_fungsi === "Berfungsi Baik" && <Check size={12} />}
                                  <span>Baik</span>
                                </button>
                              </td>
                              <td className="py-3 px-2 text-center border-r border-emerald-50">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleUpdateSanitasi(row.id, "status_fungsi", "Rusak")
                                  }
                                  className={`w-full py-1.5 px-2 rounded-xl text-[11px] font-black border transition-all inline-flex items-center justify-center gap-1 ${
                                    row.status_fungsi === "Rusak"
                                      ? "bg-rose-600 text-white border-rose-700"
                                      : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-rose-50"
                                  }`}
                                >
                                  {row.status_fungsi === "Rusak" && <X size={12} />}
                                  <span>Rusak</span>
                                </button>
                              </td>
                              <td className="py-3 px-2.5 border-r border-emerald-50">
                                <input
                                  type="text"
                                  placeholder="Keterangan (opsional)"
                                  value={row.keterangan}
                                  onChange={(e) =>
                                    handleUpdateSanitasi(row.id, "keterangan", e.target.value)
                                  }
                                  className="w-full bg-transparent outline-none text-xs font-medium text-slate-700"
                                />
                              </td>
                              <td className="py-3 px-2.5 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSanitasiRow(row.id)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                                  title="Hapus Baris"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="px-6 py-4 bg-emerald-50/70 border-t border-emerald-100 flex flex-wrap items-center justify-between gap-4">
                    <p className="text-xs font-bold text-emerald-900">
                      Sarana Berfungsi Baik:{" "}
                      <span className="font-black">
                        {sanitasiGrid.filter((d) => d.status_fungsi === "Berfungsi Baik").length}
                      </span>{" "}
                      / Total Diperiksa:{" "}
                      <span className="font-black">{sanitasiGrid.length}</span>
                    </p>
                    <p className="text-xs font-extrabold text-emerald-800">
                      Nilai / Persentase Berfungsi Baik:{" "}
                      <span className="text-sm font-black">{computedCapaian}%</span>
                    </p>
                  </div>
                </div>
              )}

              {/* Specialized Form: Ketepatan Waktu Pengangkutan Limbah RS (Kebersihan/Kesling 100%) */}
              {isPengangkutanLimbah && (
                <div className="bg-[#f8fafc] border border-white rounded-[28px] overflow-hidden shadow-[8px_8px_20px_rgba(160,175,195,0.2),-8px_-8px_20px_rgba(255,255,255,0.95)] animate-in fade-in">
                  <div className="bg-emerald-600 p-5 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <Clock size={20} className="text-white" />
                      <div>
                        <h3 className="font-extrabold text-white tracking-wide text-sm md:text-base">
                          Formulir Ketepatan Waktu Pengangkutan Limbah Rumah Sakit
                        </h3>
                        <p className="text-[11px] font-semibold text-emerald-100">
                          Unit: {selectedUnit?.name || "-"} {selectedSubUnit ? `(${selectedSubUnit})` : ""} • Bulan: {formattedBulanLabel} • Target: 100%
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddLimbahRow}
                      className="flex items-center gap-1.5 bg-white text-emerald-800 hover:bg-emerald-50 px-3.5 py-1.5 rounded-xl text-xs font-black transition-colors"
                    >
                      <Plus size={14} /> Tambah Jadwal
                    </button>
                  </div>

                  <div className="p-6 overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[940px]">
                      <thead>
                        <tr className="bg-emerald-50/55 border-b border-emerald-100 text-emerald-950">
                          <th className="py-3 px-3 font-extrabold text-xs uppercase w-12 text-center rounded-tl-xl border-r border-emerald-100/30">
                            No
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase w-32 border-r border-emerald-100/30">
                            Tanggal
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase text-center w-36 border-r border-emerald-100/30">
                            Jam Pengangkutan
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase min-w-[160px] border-r border-emerald-100/30">
                            Unit
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase text-center w-40 border-r border-emerald-100/30">
                            Tepat Waktu
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase text-center w-40 border-r border-emerald-100/30">
                            Tidak Tepat Waktu
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase min-w-[160px] border-r border-emerald-100/30">
                            Keterangan
                          </th>
                          <th className="py-3 px-3 font-extrabold text-xs uppercase w-14 text-center rounded-tr-xl">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {limbahGrid.length === 0 ? (
                          <tr>
                            <td
                              colSpan={8}
                              className="py-12 text-center text-gray-400 text-xs italic font-semibold border-b border-emerald-50 bg-[#fafdfc]"
                            >
                              Belum ada data pengangkutan limbah. Klik &quot;Tambah Jadwal&quot; untuk memulai monitoring.
                            </td>
                          </tr>
                        ) : (
                          limbahGrid.map((row, idx) => (
                            <tr
                              key={`${row.id}-${idx}`}
                              className="border-b border-gray-100 hover:bg-emerald-50/15 transition-colors"
                            >
                              <td className="py-3 px-3 text-center text-xs font-bold text-gray-500 border-r border-emerald-50">
                                {idx + 1}
                              </td>
                              <td className="py-3 px-3 border-r border-emerald-50">
                                <input
                                  type="date"
                                  value={row.tanggal}
                                  onChange={(e) =>
                                    handleUpdateLimbah(row.id, "tanggal", e.target.value)
                                  }
                                  className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
                                />
                              </td>
                              <td className="py-3 px-3 text-center border-r border-emerald-50">
                                <input
                                  type="time"
                                  value={row.jam_pengangkutan}
                                  onChange={(e) =>
                                    handleUpdateLimbah(row.id, "jam_pengangkutan", e.target.value)
                                  }
                                  className="w-full bg-transparent outline-none text-xs font-bold text-slate-800 text-center"
                                />
                              </td>
                              <td className="py-3 px-3 border-r border-emerald-50">
                                <input
                                  type="text"
                                  list="kesling-unit-list"
                                  placeholder="Unit Layanan"
                                  value={row.unit}
                                  onChange={(e) =>
                                    handleUpdateLimbah(row.id, "unit", e.target.value)
                                  }
                                  className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
                                />
                              </td>
                              <td className="py-3 px-3 text-center border-r border-emerald-50">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleUpdateLimbah(row.id, "tepat_waktu", true)
                                  }
                                  className={`w-full py-1.5 px-3 rounded-xl text-xs font-black border transition-all inline-flex items-center justify-center gap-1.5 ${
                                    row.tepat_waktu === true
                                      ? "bg-emerald-600 text-white border-emerald-700"
                                      : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-emerald-50"
                                  }`}
                                >
                                  {row.tepat_waktu === true && <Check size={13} />}
                                  <span>Tepat Waktu</span>
                                </button>
                              </td>
                              <td className="py-3 px-3 text-center border-r border-emerald-50">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleUpdateLimbah(row.id, "tepat_waktu", false)
                                  }
                                  className={`w-full py-1.5 px-3 rounded-xl text-xs font-black border transition-all inline-flex items-center justify-center gap-1.5 ${
                                    row.tepat_waktu === false
                                      ? "bg-rose-600 text-white border-rose-700"
                                      : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-rose-50"
                                  }`}
                                >
                                  {row.tepat_waktu === false && <X size={13} />}
                                  <span>Terlambat</span>
                                </button>
                              </td>
                              <td className="py-3 px-3 border-r border-emerald-50">
                                <input
                                  type="text"
                                  placeholder="Keterangan (opsional)"
                                  value={row.keterangan}
                                  onChange={(e) =>
                                    handleUpdateLimbah(row.id, "keterangan", e.target.value)
                                  }
                                  className="w-full bg-transparent outline-none text-xs font-medium text-slate-700"
                                />
                              </td>
                              <td className="py-3 px-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveLimbahRow(row.id)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                                  title="Hapus Baris"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="px-6 py-4 bg-emerald-50/70 border-t border-emerald-100 flex flex-wrap items-center justify-between gap-4">
                    <p className="text-xs font-bold text-emerald-900">
                      Pengangkutan Tepat Waktu:{" "}
                      <span className="font-black">
                        {limbahGrid.filter((d) => d.tepat_waktu === true).length}
                      </span>{" "}
                      / Total Jadwal Pengangkutan:{" "}
                      <span className="font-black">{limbahGrid.length}</span>
                    </p>
                    <p className="text-xs font-extrabold text-emerald-800">
                      Nilai / Persentase Capaian:{" "}
                      <span className="text-sm font-black">{computedCapaian}%</span>
                    </p>
                  </div>
                </div>
              )}

              {/* Specialized Form: Ketepatan Waktu Penyediaan Alat Steril (CSSD 100%) */}
              {isAlatSteril && (
                <div className="bg-[#f8fafc] border border-white rounded-[28px] overflow-hidden shadow-[8px_8px_20px_rgba(160,175,195,0.2),-8px_-8px_20px_rgba(255,255,255,0.95)] animate-in fade-in">
                  <div className="bg-emerald-600 p-5 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <Clock size={20} className="text-white" />
                      <div>
                        <h3 className="font-extrabold text-white tracking-wide text-sm md:text-base">
                          Formulir Ketepatan Waktu Penyediaan Alat Steril
                        </h3>
                        <p className="text-[11px] font-semibold text-emerald-100">
                          Unit: {selectedUnit?.name || "-"} {selectedSubUnit ? `(${selectedSubUnit})` : ""} • Bulan: {formattedBulanLabel} • Target: 100%
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddAlatSterilRow}
                      className="flex items-center gap-1.5 bg-white text-emerald-800 hover:bg-emerald-50 px-3.5 py-1.5 rounded-xl text-xs font-black transition-colors"
                    >
                      <Plus size={14} /> Tambah Permintaan
                    </button>
                  </div>

                  <datalist id="cssd-unit-list">
                    <option value="IBS / OK" />
                    <option value="VK / Kebidanan" />
                    <option value="IGD" />
                    <option value="ICU" />
                    <option value="Rawat Jalan" />
                    <option value="Ranap Aisyah Bedah" />
                    <option value="Ranap Aisyah Anak" />
                    <option value="Ranap Fatimah" />
                    <option value="Ranap Khadijah" />
                    <option value="Ranap Usman" />
                  </datalist>

                  <div className="p-6 overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1060px]">
                      <thead>
                        <tr className="bg-emerald-50/55 border-b border-emerald-100 text-emerald-950">
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase w-10 text-center rounded-tl-xl border-r border-emerald-100/30">
                            No
                          </th>
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase w-32 border-r border-emerald-100/30">
                            Tanggal
                          </th>
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase min-w-[160px] border-r border-emerald-100/30">
                            Nama Ruangan / Unit
                          </th>
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase text-center w-40 border-r border-emerald-100/30">
                            Jam Permintaan Alat Steril
                          </th>
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase text-center w-40 border-r border-emerald-100/30">
                            Jam Diberikan Sesuai Permintaan
                          </th>
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase min-w-[220px] border-r border-emerald-100/30">
                            Keterangan
                          </th>
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase text-center w-24 border-r border-emerald-100/30">
                            Target (100%)
                          </th>
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase text-center w-24 border-r border-emerald-100/30">
                            Capaian
                          </th>
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase w-14 text-center rounded-tr-xl">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {alatSterilGrid.length === 0 ? (
                          <tr>
                            <td
                              colSpan={9}
                              className="py-12 text-center text-gray-400 text-xs italic font-semibold border-b border-emerald-50 bg-[#fafdfc]"
                            >
                              Belum ada data permintaan alat steril. Klik &quot;Tambah Permintaan&quot; untuk mulai mencatat.
                            </td>
                          </tr>
                        ) : (
                          alatSterilGrid.map((row, idx) => {
                            const hasTimes =
                              row.jam_permintaan !== "" && row.jam_diberikan !== "";
                            return (
                              <tr
                                key={`${row.id}-${idx}`}
                                className="border-b border-gray-100 hover:bg-emerald-50/15 transition-colors"
                              >
                                <td className="py-3 px-2.5 text-center text-xs font-bold text-gray-500 border-r border-emerald-50">
                                  {idx + 1}
                                </td>
                                <td className="py-3 px-2.5 border-r border-emerald-50">
                                  <input
                                    type="date"
                                    value={row.tanggal}
                                    onChange={(e) =>
                                      handleUpdateAlatSteril(row.id, "tanggal", e.target.value)
                                    }
                                    className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
                                  />
                                </td>
                                <td className="py-3 px-2.5 border-r border-emerald-50">
                                  <input
                                    type="text"
                                    list="cssd-unit-list"
                                    placeholder="Nama Ruangan / Unit"
                                    value={row.nama_ruangan}
                                    onChange={(e) =>
                                      handleUpdateAlatSteril(row.id, "nama_ruangan", e.target.value)
                                    }
                                    className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
                                  />
                                </td>
                                <td className="py-3 px-2.5 text-center border-r border-emerald-50">
                                  <input
                                    type="time"
                                    value={row.jam_permintaan}
                                    onChange={(e) =>
                                      handleUpdateAlatSteril(row.id, "jam_permintaan", e.target.value)
                                    }
                                    className="w-full bg-transparent outline-none text-xs font-bold text-slate-800 text-center"
                                  />
                                </td>
                                <td className="py-3 px-2.5 text-center border-r border-emerald-50">
                                  <input
                                    type="time"
                                    value={row.jam_diberikan}
                                    onChange={(e) =>
                                      handleUpdateAlatSteril(row.id, "jam_diberikan", e.target.value)
                                    }
                                    className="w-full bg-transparent outline-none text-xs font-bold text-slate-800 text-center"
                                  />
                                </td>
                                <td className="py-3 px-2.5 border-r border-emerald-50">
                                  <div className="space-y-1.5">
                                    <div className="flex items-center gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleUpdateAlatSteril(row.id, "sesuai_standar", true)
                                        }
                                        className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-black border transition-all ${
                                          row.sesuai_standar === true
                                            ? "bg-emerald-600 text-white border-emerald-700"
                                            : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-emerald-50"
                                        }`}
                                      >
                                        Tepat Waktu
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleUpdateAlatSteril(row.id, "sesuai_standar", false)
                                        }
                                        className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-black border transition-all ${
                                          row.sesuai_standar === false
                                            ? "bg-rose-600 text-white border-rose-700"
                                            : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-rose-50"
                                        }`}
                                      >
                                        Terlambat
                                      </button>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {hasTimes && (
                                        <span className="text-[10px] font-bold text-slate-500 shrink-0">
                                          {row.selisih_menit}m
                                        </span>
                                      )}
                                      <input
                                        type="text"
                                        placeholder="Catatan (opsional)"
                                        value={row.keterangan}
                                        onChange={(e) =>
                                          handleUpdateAlatSteril(row.id, "keterangan", e.target.value)
                                        }
                                        className="w-full bg-white/80 border border-slate-200 rounded-md px-2 py-1 text-[11px] font-medium text-slate-700 outline-none focus:border-emerald-400"
                                      />
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 px-2 text-center border-r border-emerald-50">
                                  <span className="inline-block px-2 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-black">
                                    100%
                                  </span>
                                </td>
                                <td className="py-3 px-2 text-center border-r border-emerald-50">
                                  {row.sesuai_standar === true ? (
                                    <span className="inline-block px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-[11px] font-black">
                                      100%
                                    </span>
                                  ) : row.sesuai_standar === false ? (
                                    <span className="inline-block px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 text-[11px] font-black">
                                      0%
                                    </span>
                                  ) : (
                                    <span className="text-xs text-gray-400">-</span>
                                  )}
                                </td>
                                <td className="py-3 px-2.5 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveAlatSterilRow(row.id)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                                    title="Hapus Baris"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="px-6 py-4 bg-emerald-50/70 border-t border-emerald-100 flex flex-wrap items-center justify-between gap-4">
                    <p className="text-xs font-bold text-emerald-900">
                      Dipenuhi Tepat Waktu:{" "}
                      <span className="font-black">
                        {alatSterilGrid.filter((d) => d.sesuai_standar === true).length}
                      </span>{" "}
                      / Total Permintaan Alat Steril:{" "}
                      <span className="font-black">{alatSterilGrid.length}</span>
                    </p>
                    <p className="text-xs font-extrabold text-emerald-800">
                      Nilai / Persentase Capaian:{" "}
                      <span className="text-sm font-black">{computedCapaian}%</span>
                    </p>
                  </div>
                </div>
              )}

              {/* Specialized Form: Ketepatan Waktu Penyediaan Linen Rawat Inap (Laundry <= 30 Menit) */}
              {isPenyediaanLinen && (
                <div className="bg-[#f8fafc] border border-white rounded-[28px] overflow-hidden shadow-[8px_8px_20px_rgba(160,175,195,0.2),-8px_-8px_20px_rgba(255,255,255,0.95)] animate-in fade-in">
                  <div className="bg-emerald-600 p-5 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <Clock size={20} className="text-white" />
                      <div>
                        <h3 className="font-extrabold text-white tracking-wide text-sm md:text-base">
                          Formulir Ketepatan Waktu Penyediaan Linen Untuk Rawat Inap (&le; 30 Menit)
                        </h3>
                        <p className="text-[11px] font-semibold text-emerald-100">
                          Unit: {selectedUnit?.name || "-"} {selectedSubUnit ? `(${selectedSubUnit})` : ""} • Bulan: {formattedBulanLabel} • Target: 100%
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddLinenRow}
                      className="flex items-center gap-1.5 bg-white text-emerald-800 hover:bg-emerald-50 px-3.5 py-1.5 rounded-xl text-xs font-black transition-colors"
                    >
                      <Plus size={14} /> Tambah Permintaan
                    </button>
                  </div>

                  <datalist id="laundry-linen-list">
                    <option value="Sprei" />
                    <option value="Sarung Bantal" />
                    <option value="Selimut" />
                    <option value="Stik Laken" />
                    <option value="Baju Pasien" />
                    <option value="Perlak" />
                    <option value="Handuk" />
                  </datalist>

                  <datalist id="laundry-ranap-list">
                    <option value="Ranap Aisyah Anak" />
                    <option value="Ranap Aisyah Bedah" />
                    <option value="Ranap Fatimah" />
                    <option value="Ranap Khadijah" />
                    <option value="Ranap Usman" />
                    <option value="ICU" />
                    <option value="IBS" />
                    <option value="IGD" />
                  </datalist>

                  <div className="p-6 overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1140px]">
                      <thead>
                        <tr className="bg-emerald-50/55 border-b border-emerald-100 text-emerald-950">
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase w-10 text-center rounded-tl-xl border-r border-emerald-100/30">
                            No
                          </th>
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase w-32 border-r border-emerald-100/30">
                            Tanggal
                          </th>
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase min-w-[150px] border-r border-emerald-100/30">
                            Nama Ruangan (Ranap)
                          </th>
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase min-w-[140px] border-r border-emerald-100/30">
                            Jenis Linen
                          </th>
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase text-center w-32 border-r border-emerald-100/30">
                            Jam Permintaan Linen
                          </th>
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase text-center w-32 border-r border-emerald-100/30">
                            Jam Linen Dikirim
                          </th>
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase text-center w-32 border-r border-emerald-100/30">
                            Jam Linen Diterima
                          </th>
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase min-w-[230px] border-r border-emerald-100/30">
                            Standar SOP &le; 30 Menit / Keterangan
                          </th>
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase w-14 text-center rounded-tr-xl">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {linenGrid.length === 0 ? (
                          <tr>
                            <td
                              colSpan={9}
                              className="py-12 text-center text-gray-400 text-xs italic font-semibold border-b border-emerald-50 bg-[#fafdfc]"
                            >
                              Belum ada data distribusi linen. Klik &quot;Tambah Permintaan&quot; untuk mulai mencatat.
                            </td>
                          </tr>
                        ) : (
                          linenGrid.map((row, idx) => {
                            const hasTimes =
                              row.jam_permintaan !== "" && row.jam_diterima !== "";
                            return (
                              <tr
                                key={`${row.id}-${idx}`}
                                className="border-b border-gray-100 hover:bg-emerald-50/15 transition-colors"
                              >
                                <td className="py-3 px-2.5 text-center text-xs font-bold text-gray-500 border-r border-emerald-50">
                                  {idx + 1}
                                </td>
                                <td className="py-3 px-2.5 border-r border-emerald-50">
                                  <input
                                    type="date"
                                    value={row.tanggal}
                                    onChange={(e) =>
                                      handleUpdateLinen(row.id, "tanggal", e.target.value)
                                    }
                                    className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
                                  />
                                </td>
                                <td className="py-3 px-2.5 border-r border-emerald-50">
                                  <input
                                    type="text"
                                    list="laundry-ranap-list"
                                    placeholder="Nama Ruangan"
                                    value={row.nama_ruangan}
                                    onChange={(e) =>
                                      handleUpdateLinen(row.id, "nama_ruangan", e.target.value)
                                    }
                                    className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
                                  />
                                </td>
                                <td className="py-3 px-2.5 border-r border-emerald-50">
                                  <input
                                    type="text"
                                    list="laundry-linen-list"
                                    placeholder="Mis. Sprei, Selimut"
                                    value={row.jenis_linen}
                                    onChange={(e) =>
                                      handleUpdateLinen(row.id, "jenis_linen", e.target.value)
                                    }
                                    className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
                                  />
                                </td>
                                <td className="py-3 px-2.5 text-center border-r border-emerald-50">
                                  <input
                                    type="time"
                                    value={row.jam_permintaan}
                                    onChange={(e) =>
                                      handleUpdateLinen(row.id, "jam_permintaan", e.target.value)
                                    }
                                    className="w-full bg-transparent outline-none text-xs font-bold text-slate-800 text-center"
                                  />
                                </td>
                                <td className="py-3 px-2.5 text-center border-r border-emerald-50">
                                  <input
                                    type="time"
                                    value={row.jam_dikirim}
                                    onChange={(e) =>
                                      handleUpdateLinen(row.id, "jam_dikirim", e.target.value)
                                    }
                                    className="w-full bg-transparent outline-none text-xs font-bold text-slate-800 text-center"
                                  />
                                </td>
                                <td className="py-3 px-2.5 text-center border-r border-emerald-50">
                                  <input
                                    type="time"
                                    value={row.jam_diterima}
                                    onChange={(e) =>
                                      handleUpdateLinen(row.id, "jam_diterima", e.target.value)
                                    }
                                    className="w-full bg-transparent outline-none text-xs font-bold text-slate-800 text-center"
                                  />
                                </td>
                                <td className="py-3 px-2.5 border-r border-emerald-50">
                                  <div className="space-y-1.5">
                                    <div className="flex items-center gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleUpdateLinen(row.id, "sesuai_standar", true)
                                        }
                                        className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-black border transition-all ${
                                          row.sesuai_standar === true
                                            ? "bg-emerald-600 text-white border-emerald-700"
                                            : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-emerald-50"
                                        }`}
                                      >
                                        Ya (&le; 30m)
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleUpdateLinen(row.id, "sesuai_standar", false)
                                        }
                                        className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-black border transition-all ${
                                          row.sesuai_standar === false
                                            ? "bg-rose-600 text-white border-rose-700"
                                            : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-rose-50"
                                        }`}
                                      >
                                        Tidak (&gt; 30m)
                                      </button>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {hasTimes && (
                                        <span
                                          className={`text-[10px] font-black shrink-0 px-1.5 py-0.5 rounded ${
                                            row.selisih_menit <= 30
                                              ? "bg-emerald-100 text-emerald-800"
                                              : "bg-rose-100 text-rose-800"
                                          }`}
                                        >
                                          {row.selisih_menit}m
                                        </span>
                                      )}
                                      <input
                                        type="text"
                                        placeholder="Catatan (opsional)"
                                        value={row.keterangan}
                                        onChange={(e) =>
                                          handleUpdateLinen(row.id, "keterangan", e.target.value)
                                        }
                                        className="w-full bg-white/80 border border-slate-200 rounded-md px-2 py-1 text-[11px] font-medium text-slate-700 outline-none focus:border-emerald-400"
                                      />
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 px-2.5 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveLinenRow(row.id)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                                    title="Hapus Baris"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="px-6 py-4 bg-emerald-50/70 border-t border-emerald-100 flex flex-wrap items-center justify-between gap-4">
                    <p className="text-xs font-bold text-emerald-900">
                      Dipenuhi Tepat Waktu (&le; 30 Menit):{" "}
                      <span className="font-black">
                        {linenGrid.filter((d) => d.sesuai_standar === true).length}
                      </span>{" "}
                      / Total Permintaan Linen:{" "}
                      <span className="font-black">{linenGrid.length}</span>
                    </p>
                    <p className="text-xs font-extrabold text-emerald-800">
                      Nilai / Persentase Capaian:{" "}
                      <span className="text-sm font-black">{computedCapaian}%</span>
                    </p>
                  </div>
                </div>
              )}

              {/* Specialized Form: Ketersediaan Air Bersih Dalam 24 Jam (IPSRS 100%) */}
              {isAirBersih24Jam && (
                <div className="bg-[#f8fafc] border border-white rounded-[28px] overflow-hidden shadow-[8px_8px_20px_rgba(160,175,195,0.2),-8px_-8px_20px_rgba(255,255,255,0.95)] animate-in fade-in">
                  <div className="bg-emerald-600 p-5 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <Clock size={20} className="text-white" />
                      <div>
                        <h3 className="font-extrabold text-white tracking-wide text-sm md:text-base">
                          Formulir Ketersediaan Air Bersih Dalam 24 Jam
                        </h3>
                        <p className="text-[11px] font-semibold text-emerald-100">
                          Unit: {selectedUnit?.name || "-"} {selectedSubUnit ? `(${selectedSubUnit})` : ""} • Bulan: {formattedBulanLabel} • Target: 100%
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={handleAddNihilAirBersihRow}
                        className="flex items-center gap-1.5 bg-emerald-50 text-emerald-900 hover:bg-white px-3 py-1.5 rounded-xl text-xs font-extrabold transition-colors border border-emerald-200"
                      >
                        <CheckCircle2 size={14} /> Nihil Gangguan (24 Jam Penuh)
                      </button>
                      <button
                        type="button"
                        onClick={handleAddAirBersihRow}
                        className="flex items-center gap-1.5 bg-white text-emerald-800 hover:bg-emerald-50 px-3.5 py-1.5 rounded-xl text-xs font-black transition-colors"
                      >
                        <Plus size={14} /> Tambah Baris Data
                      </button>
                    </div>
                  </div>

                  <div className="px-6 pt-4">
                    <p className="text-xs font-semibold text-slate-500">
                      Catat gangguan distribusi air bersih per tanggal/unit (isi Jam Gangguan &amp; Jam Kembali Normal untuk hitung otomatis), atau klik <strong>Nihil Gangguan (24 Jam Penuh)</strong> bila air bersih tersedia 24 jam penuh.
                    </p>
                  </div>

                  <datalist id="ipsrs-unit-list">
                    <option value="Seluruh Titik Kritis RS" />
                    <option value="IGD" />
                    <option value="ICU" />
                    <option value="IBS / Kamar Operasi" />
                    <option value="Rawat Inap" />
                    <option value="Instalasi Gizi / Dapur" />
                    <option value="Laundry / CSSD" />
                    <option value="Laboratorium" />
                  </datalist>

                  <div className="p-6 overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1120px]">
                      <thead>
                        <tr className="bg-emerald-50/55 border-b border-emerald-100 text-emerald-950">
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase w-10 text-center rounded-tl-xl border-r border-emerald-100/30">
                            No
                          </th>
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase w-32 border-r border-emerald-100/30">
                            Tanggal
                          </th>
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase min-w-[170px] border-r border-emerald-100/30">
                            Unit
                          </th>
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase text-center w-32 border-r border-emerald-100/30">
                            Jam Gangguan
                          </th>
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase text-center w-32 border-r border-emerald-100/30">
                            Jam Kembali Normal
                          </th>
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase text-center w-32 border-r border-emerald-100/30">
                            Durasi Gangguan (Jam)
                          </th>
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase text-center w-32 border-r border-emerald-100/30">
                            Jam Tersedia
                          </th>
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase text-center w-28 border-r border-emerald-100/30">
                            Ketersediaan (%)
                          </th>
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase min-w-[150px] border-r border-emerald-100/30">
                            Keterangan
                          </th>
                          <th className="py-3 px-2.5 font-extrabold text-xs uppercase w-14 text-center rounded-tr-xl">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {airBersihGrid.length === 0 ? (
                          <tr>
                            <td
                              colSpan={10}
                              className="py-12 text-center text-gray-400 text-xs italic font-semibold border-b border-emerald-50 bg-[#fafdfc]"
                            >
                              Belum ada data monitoring air bersih. Klik &quot;Tambah Baris Data&quot; atau &quot;Nihil Gangguan&quot; untuk memulai.
                            </td>
                          </tr>
                        ) : (
                          airBersihGrid.map((row, idx) => {
                            const rowPct = Number(
                              (((Number(row.jam_tersedia) || 0) / 24) * 100).toFixed(2),
                            );
                            return (
                              <tr
                                key={`${row.id}-${idx}`}
                                className="border-b border-gray-100 hover:bg-emerald-50/15 transition-colors"
                              >
                                <td className="py-3 px-2.5 text-center text-xs font-bold text-gray-500 border-r border-emerald-50">
                                  {idx + 1}
                                </td>
                                <td className="py-3 px-2.5 border-r border-emerald-50">
                                  <input
                                    type="date"
                                    value={row.tanggal}
                                    onChange={(e) =>
                                      handleUpdateAirBersih(row.id, "tanggal", e.target.value)
                                    }
                                    className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
                                  />
                                </td>
                                <td className="py-3 px-2.5 border-r border-emerald-50">
                                  <input
                                    type="text"
                                    list="ipsrs-unit-list"
                                    placeholder="Unit / Titik Pantau"
                                    value={row.unit}
                                    onChange={(e) =>
                                      handleUpdateAirBersih(row.id, "unit", e.target.value)
                                    }
                                    className="w-full bg-transparent outline-none text-xs font-bold text-slate-800"
                                  />
                                </td>
                                <td className="py-3 px-2.5 text-center border-r border-emerald-50">
                                  <input
                                    type={row.jam_gangguan === "-" ? "text" : "time"}
                                    value={row.jam_gangguan}
                                    onChange={(e) =>
                                      handleUpdateAirBersih(row.id, "jam_gangguan", e.target.value)
                                    }
                                    className="w-full bg-transparent outline-none text-xs font-bold text-slate-800 text-center"
                                  />
                                </td>
                                <td className="py-3 px-2.5 text-center border-r border-emerald-50">
                                  <input
                                    type={row.jam_kembali_normal === "-" ? "text" : "time"}
                                    value={row.jam_kembali_normal}
                                    onChange={(e) =>
                                      handleUpdateAirBersih(row.id, "jam_kembali_normal", e.target.value)
                                    }
                                    className="w-full bg-transparent outline-none text-xs font-bold text-slate-800 text-center"
                                  />
                                </td>
                                <td className="py-3 px-2.5 text-center border-r border-emerald-50">
                                  <input
                                    type="number"
                                    min="0"
                                    max="24"
                                    step="0.25"
                                    value={row.durasi_gangguan_jam}
                                    onChange={(e) =>
                                      handleUpdateAirBersih(
                                        row.id,
                                        "durasi_gangguan_jam",
                                        Number(e.target.value),
                                      )
                                    }
                                    className="w-full text-center bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-extrabold text-slate-800 outline-none focus:border-emerald-400"
                                  />
                                </td>
                                <td className="py-3 px-2.5 text-center border-r border-emerald-50">
                                  <span className="inline-block px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 text-xs font-black">
                                    {row.jam_tersedia} Jam
                                  </span>
                                </td>
                                <td className="py-3 px-2.5 text-center border-r border-emerald-50">
                                  <span
                                    className={`inline-block px-2.5 py-1 rounded-lg text-[11px] font-black ${
                                      rowPct >= 100
                                        ? "bg-emerald-100 text-emerald-800"
                                        : "bg-amber-100 text-amber-800"
                                    }`}
                                  >
                                    {rowPct}%
                                  </span>
                                </td>
                                <td className="py-3 px-2.5 border-r border-emerald-50">
                                  <input
                                    type="text"
                                    placeholder="Keterangan (opsional)"
                                    value={row.keterangan}
                                    onChange={(e) =>
                                      handleUpdateAirBersih(row.id, "keterangan", e.target.value)
                                    }
                                    className="w-full bg-transparent outline-none text-xs font-medium text-slate-700"
                                  />
                                </td>
                                <td className="py-3 px-2.5 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveAirBersihRow(row.id)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                                    title="Hapus Baris"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="px-6 py-4 bg-emerald-50/70 border-t border-emerald-100 flex flex-wrap items-center justify-between gap-4">
                    <p className="text-xs font-bold text-emerald-900">
                      Total Jam Tersedia:{" "}
                      <span className="font-black">
                        {Number(
                          airBersihGrid
                            .reduce((acc, c) => acc + (Number(c.jam_tersedia) || 0), 0)
                            .toFixed(2),
                        )}{" "}
                        Jam
                      </span>{" "}
                      / Total Jam Pengamatan:{" "}
                      <span className="font-black">
                        {airBersihGrid.length > 0 ? airBersihGrid.length * 24 : 24} Jam
                      </span>
                    </p>
                    <p className="text-xs font-extrabold text-emerald-800">
                      Persentase Ketersediaan Air:{" "}
                      <span className="text-sm font-black">{computedCapaian}%</span>
                    </p>
                  </div>
                </div>
              )}

              {/* C. Fallback Fields For Dynamic Standard Indicators */}
              {!isVisiteDokter &&
                !isRisikoJatuh &&
                !isIdentifikasiPasien &&
                !isWaktuTunggu &&
                !isRekamMedis &&
                !radiologiMode &&
                !prognasIndicatorType &&
                !isWaktuTungguRacikan &&
                !isHighAlertDoubleCheck &&
                !isKekosonganObat &&
                !isSBAR &&
                !isPenundaanOperasi &&
                !isSurgicalSafety &&
                !isPembatalanOperasi &&
                !isPenyediaanDarah &&
                !isImdBayi &&
                !kematianConfig &&
                !isPengkajianNyeriIcu &&
                !isEmergencyResponTime &&
                !isScEmergency &&
                !isKomplikasiPersalinan &&
                !isHasilKritisLab &&
                !isSampelLabTanpaLabel &&
                !isKunjunganKeluarga &&
                !isSaranaSanitasi &&
                !isPengangkutanLimbah &&
                !isAlatSteril &&
                !isPenyediaanLinen &&
                !isAirBersih24Jam &&
                !isClinicalPathway &&
                !isVerifikasiTelepon &&
                !yaTidakConfig && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-200/60 pt-6">
                    <div className="bg-[#f8fafc] border border-white rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-[8px_8px_22px_rgba(160,175,195,0.22),-8px_-8px_22px_rgba(255,255,255,0.95)] hover:shadow-[10px_10px_26px_rgba(140,160,180,0.26),-10px_-10px_26px_rgba(255,255,255,1)] transition-all duration-300">
                      <div>
                        <div className="flex items-center gap-2.5 mb-4">
                          <Activity
                            size={20}
                            className="text-emerald-600"
                            strokeWidth={2.5}
                          />
                          <h4 className="font-extrabold text-[11px] tracking-widest text-[#0c2415] uppercase">
                            NUMERATOR
                          </h4>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                          {selectedIndikatorProfile.numerator ||
                            "Isi nilai pembilang indikator."}
                        </p>
                      </div>
                      <div className="mt-6">
                        <input
                          type="number"
                          placeholder="Nilai Pembilang (Numerator)"
                          {...register("numerator_val", {
                            valueAsNumber: true,
                          })}
                          className="w-full px-5 py-3.5 bg-[#f8fafc] rounded-2xl border border-slate-200/90 shadow-[inset_3px_3px_6px_rgba(160,175,195,0.32),inset_-3px_-3px_6px_rgba(255,255,255,0.95)] focus:shadow-[inset_4px_4px_8px_rgba(140,160,180,0.4),inset_-4px_-4px_8px_rgba(255,255,255,1)] focus:border-emerald-500 outline-none text-slate-800 font-extrabold text-base transition-all"
                          min="0"
                          required
                        />
                      </div>
                    </div>

                    <div className="bg-[#f8fafc] border border-white rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-[8px_8px_22px_rgba(160,175,195,0.22),-8px_-8px_22px_rgba(255,255,255,0.95)] hover:shadow-[10px_10px_26px_rgba(140,160,180,0.26),-10px_-10px_26px_rgba(255,255,255,1)] transition-all duration-300">
                      <div>
                        <div className="flex items-center gap-2.5 mb-4">
                          <Layers
                            size={20}
                            className="text-emerald-700"
                            strokeWidth={2.5}
                          />
                          <h4 className="font-extrabold text-[11px] tracking-widest text-[#0c2415] uppercase">
                            DENOMINATOR
                          </h4>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                          {selectedIndikatorProfile.denominator ||
                            "Isi nilai penyebut indikator."}
                        </p>
                      </div>
                      <div className="mt-6">
                        <input
                          type="number"
                          placeholder="Nilai Penyebut (Denominator)"
                          {...register("denominator_val", {
                            valueAsNumber: true,
                          })}
                          className="w-full px-5 py-3.5 bg-[#f8fafc] rounded-2xl border border-slate-200/90 shadow-[inset_3px_3px_6px_rgba(160,175,195,0.32),inset_-3px_-3px_6px_rgba(255,255,255,0.95)] focus:shadow-[inset_4px_4px_8px_rgba(140,160,180,0.4),inset_-4px_-4px_8px_rgba(255,255,255,1)] focus:border-emerald-500 outline-none text-slate-800 font-extrabold text-base transition-all"
                          min="1"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}
            </div>
          )}

          {/* REALTIME SCORE PREVIEW & CALCULATION INSIGHT BAR */}
          {watchKategori !== "IKP" && selectedIndikatorProfile && (
            <div className="bg-[#f8fafc] rounded-[28px] border border-white shadow-[10px_10px_25px_rgba(160,175,195,0.22),-10px_-10px_25px_rgba(255,255,255,0.95)] p-6 md:p-10 flex flex-col items-center justify-center gap-4 animate-in fade-in duration-500 max-w-2xl mx-auto w-full">
              <span className="text-sm md:text-base font-semibold text-gray-500 tracking-wide md:mb-1">
                Persentase Capaian
              </span>

              <div className="flex flex-col items-center gap-5 mt-1">
                <span
                  className={`text-[60px] md:text-[72px] font-bold leading-none tracking-tight transition-all duration-500 drop-shadow-[0_4px_8px_rgba(0,0,0,0.15)] ${
                    achievementStatus === "Tercapai"
                      ? "text-[#10a37f]"
                      : achievementStatus === "Mendekati"
                        ? "text-amber-500"
                        : "text-red-500"
                  }`}
                >
                  {computedCapaian}%
                </span>

                <span
                  className={`px-6 py-2.5 rounded-full text-sm md:text-base font-bold shadow-[inset_1px_1px_3px_rgba(0,0,0,0.06),2px_2px_6px_rgba(160,175,195,0.2)] transition-colors duration-500 ${
                    achievementStatus === "Tercapai"
                      ? "bg-emerald-50 text-[#10a37f] border border-emerald-100/50"
                      : achievementStatus === "Mendekati"
                        ? "bg-amber-50 text-amber-600 border border-amber-100/50"
                        : "bg-red-50 text-red-600 border border-red-100/50"
                  }`}
                >
                  {achievementStatus === "Mendekati"
                    ? "Mendekati Target"
                    : achievementStatus}
                </span>
              </div>
            </div>
          )}

          {/* BUTTON SAVE SUBMISSION */}
          <div className="pt-6 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full md:w-auto px-12 py-4 rounded-2xl font-bold text-white transition-all transform hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 ${
                watchKategori === "IKP"
                  ? "bg-red-600 hover:bg-red-700 shadow-[4px_4px_14px_rgba(220,38,38,0.35),-4px_-4px_14px_rgba(255,255,255,0.85)] active:shadow-[inset_2px_2px_6px_rgba(0,0,0,0.3)]"
                  : "bg-emerald-600 hover:bg-emerald-700 shadow-[4px_4px_14px_rgba(16,163,127,0.35),-4px_-4px_14px_rgba(255,255,255,0.85)] active:shadow-[inset_2px_2px_6px_rgba(0,0,0,0.25)]"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Zap className="animate-spin text-white" size={18} />{" "}
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save size={18} /> Simpan Data
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* DYNAMIC ROOM/UNIT MANAGEMENT MODAL (ADMIN ONLY) */}
      {showRoomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-emerald-950/40 backdrop-blur-xs p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[28px] border border-gray-100 shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-[#10a37f] p-5 flex items-center justify-between text-white">
              <h3 className="font-extrabold text-sm md:text-base tracking-wide flex items-center gap-2">
                <Building2 size={18} />
                {modalMode === "add" ? "Tambah Unit Baru" : "Edit Unit Layanan"}
              </h3>
              <button
                onClick={() => setShowRoomModal(false)}
                className="text-white/80 hover:text-white hover:bg-white/10 p-1 rounded-lg transition-all"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 md:p-8 space-y-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-800 tracking-wide uppercase">
                  Nama Ruangan / Unit *
                </label>
                <input
                  type="text"
                  placeholder="Misal: ICU, Poli Bedah"
                  value={roomNameInput}
                  onChange={(e) => setRoomNameInput(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none rounded-xl text-sm font-bold text-slate-850"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-800 tracking-wide uppercase">
                  Kategori Ruangan
                </label>
                <select
                  value={roomCategoryInput}
                  onChange={(e) => setRoomCategoryInput(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none rounded-xl text-sm font-bold text-slate-850"
                >
                  <option value="Rawat Inap">Rawat Inap</option>
                  <option value="Rawat Jalan">Rawat Jalan</option>
                  <option value="Intensif">Intensif</option>
                  <option value="Penunjang">Penunjang</option>
                  <option value="Umum">Umum</option>
                  <option value="Instalasi Gawat Darurat">Gawat Darurat</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-800 tracking-wide uppercase">
                  Status Pelayanan
                </label>
                <div className="flex gap-4">
                  {["Aktif", "Nonaktif"].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setRoomStatusInput(st as any)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-black border flex-1 text-center transition-all ${
                        roomStatusInput === st
                          ? "bg-emerald-50 border-emerald-500 text-emerald-800"
                          : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 md:p-6 bg-slate-50 flex justify-end gap-3.5 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowRoomModal(false)}
                className="px-5 py-2 rounded-xl text-xs font-bold text-slate-550 hover:bg-slate-100 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveRoom}
                className="px-6 py-2 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-md shadow-emerald-500/20"
              >
                Simpan Unit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL FOR KEPATUHAN IDENTIFIKASI PASIEN */}
      {deleteIdentifikasiId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-rose-950/45 backdrop-blur-xs p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[28px] border border-rose-100 shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-rose-500 p-5 flex items-center justify-between text-white">
              <h3 className="font-extrabold text-sm md:text-base tracking-wide flex items-center gap-2">
                <ShieldAlert size={18} />
                Konfirmasi Hapus Data
              </h3>
              <button
                onClick={() => setDeleteIdentifikasiId(null)}
                className="text-white/80 hover:text-white hover:bg-white/10 p-1 rounded-lg transition-all"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 md:p-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mx-auto text-rose-500">
                <Trash2 size={24} />
              </div>
              <div className="space-y-1.5">
                <h4 className="font-extrabold text-slate-800 text-sm md:text-base">
                  Apakah Anda yakin ingin menghapus form observasi pasien ini?
                </h4>
              </div>
            </div>

            <div className="p-4 md:p-6 bg-slate-50 flex justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteIdentifikasiId(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-550 hover:bg-slate-100 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmRemoveIdentifikasi}
                className="px-5 py-2 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-700 text-white transition-colors shadow-md shadow-rose-500/20"
              >
                Ya, Hapus Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
