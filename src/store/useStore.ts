import { create } from "zustand";

export interface IndicatorProfile {
  id: string;
  category: string;
  indicator_title: string;
  rationale: string;
  quality_dimension: string;
  objective: string;
  operational_definition: string;
  indicator_type: string;
  measurement_unit: string;
  numerator: string;
  denominator: string;
  target: string | number;
  criteria: string;
  formula: string;
  data_collection_method: string;
  data_source: string;
  sampling_method: string;
  data_collection_tool: string;
  sample_size: string;
  collection_period: string;
  analysis_period: string;
  data_presentation: string;
  person_responsible: string;
  reverse?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface VisiteData {
  id: string;
  tanggal: string;
  nama_pasien: string;
  no_rm?: string;
  jam_visite_kurang_14: boolean;
  jam_visite_lebih_14: boolean;
  dokter_visite: string;
  keterangan: string;
}

export interface ClinicalPathwayData {
  id: string;
  tanggal: string;
  nama_pasien: string;
  no_rm: string;
  nama_dpjp: string;
  los: "Sesuai" | "Tidak Sesuai" | "";
  obat: "Sesuai" | "Tidak Sesuai" | "";
  penunjang: "Sesuai" | "Tidak Sesuai" | "";
  keterangan: "Patuh" | "Tidak Patuh" | "";
}

export interface VerifikasiTeleponData {
  id: string;
  tanggal: string;
  no_rm: string;
  nama_pasien: string;
  jam_instruksi: string;
  jam_verifikasi: string;
  terverifikasi_24jam: boolean | null;
  keterangan: string;
}

export interface YaTidakPasienData {
  id: string;
  tanggal: string;
  no_rm: string;
  nama_pasien: string;
  status_ya: boolean;
  status_tidak: boolean;
  keterangan: string;
}

export interface JatuhData {
  id: string;
  tanggal: string;
  nama_pasien: string;
  no_rm: string;
  asesmen_awal: boolean | null;
  asesmen_ulang: boolean | null;
  intervensi: boolean | null;
}

export interface MomentIdentifikasi {
  aktif: boolean;
  petugas: string;
  tanya_nama: string | null;
  tanya_tgllahir: string | null;
  cara_verbal: string | null;
  cara_visual: string | null;
  lokasi: string;
  patuh: boolean | null;
}

export interface IdentifikasiData {
  id: string;
  tanggal_observasi: string;
  jam_observasi: string;
  nama_observer: string;
  nama_pasien: string;
  no_rm: string;
  tanggal_lahir: string;
  jenis_kelamin: string;
  petugas: string;
  lokasi: string;
  moments: Record<string, MomentIdentifikasi>;
}

export interface WaktuTungguData {
  id: string;
  tanggal: string;
  nama_pasien: string;
  no_rm: string;
  jam_datang: string;
  jam_dilayani: string;
  selisih_menit: number;
  selisih_detik?: number;
  interval_text?: string;
  poli?: string;
  memenuhi_standar?: boolean;
}

export type RmCellState = "1" | "0" | "TD" | "";

export interface RmReviewPulangRow {
  id: string;
  no_rm: string;
  ruangan: string;
  dpjp: string;
  tgl_masuk: RmCellState;
  tgl_keluar_meninggal: RmCellState;
  ruang_rawat_terakhir: RmCellState;
  diagnosa_waktu_masuk: RmCellState;
  alasan_dirawat: RmCellState;
  ringkasan_riwayat: RmCellState;
  pem_fisik: RmCellState;
  pem_penunjang_lab: RmCellState;
  pem_penunjang_rad: RmCellState;
  terapi_selama_rs: RmCellState;
  perkembangan_perawatan: RmCellState;
  alergi_obat: RmCellState;
  diagnosa_utama: RmCellState;
  diagnosa_sekunder: RmCellState;
  tindakan_prosedur: RmCellState;
  kondisi_waktu_keluar: RmCellState;
  pengobatan_dilanjutkan: RmCellState;
  tanggal_kontrol: RmCellState;
  terapi_pulang: RmCellState;
  edukasi_tindak_lanjut: RmCellState;
  tindakan_kedaruratan: RmCellState;
  autentikasi_pasien_nama: RmCellState;
  autentikasi_pasien_ttd: RmCellState;
  tanggal_ttd: RmCellState;
  autentikasi_dpjp_nama: RmCellState;
  autentikasi_dpjp_ttd: RmCellState;
  keterangan: string;
}

export interface RmReviewRekamMedisRow {
  id: string;
  no_rm: string;
  ruangan: string;
  dpjp: string;
  pengembalian_24_jam: RmCellState;
  pengembalian_lebih_24_jam: RmCellState;
  pengkajian_keperawatan_nama: RmCellState;
  asesmen_medis_identitas: RmCellState;
  asesmen_medis_tanggal: RmCellState;
  asesmen_medis_diagnosa: RmCellState;
  asesmen_medis_ttd: RmCellState;
  unsur_nyeri_awal: RmCellState;
  unsur_nyeri_ulang: RmCellState;
  unsur_nyeri_tata_laksana: RmCellState;
  unsur_jatuh_awal: RmCellState;
  unsur_jatuh_ulang: RmCellState;
  unsur_cppt: RmCellState;
  unsur_verifikasi_dpjp: RmCellState;
  unsur_kelengkapan_tanggal: RmCellState;
  unsur_kelengkapan_jam: RmCellState;
  unsur_rekonsiliasi_obat: RmCellState;
  unsur_keterbacaan_tulisan: RmCellState;
  unsur_komunikasi_sbar: RmCellState;
  unsur_singkatan: RmCellState;
  unsur_simbol: RmCellState;
  ic_ttd_pemberi: RmCellState;
  ic_ttd_penerima: RmCellState;
  gc_ttd_pemberi: RmCellState;
  gc_ttd_penerima: RmCellState;
  keterangan: string;
}

export interface RmKelengkapan24JamRow {
  id: string;
  tanggal: string;
  nama_pasien: string;
  no_rm: string;
  c1_identitas: "1" | "0" | "";
  c2_riwayat: "1" | "0" | "";
  c3_resume: "1" | "0" | "";
  c4_instruksi: "1" | "0" | "";
  c5_kembali_24j: "1" | "0" | "";
  c6_kembali_lebih_24j: "1" | "0" | "";
  total: number;
  keterangan: string;
}

export interface RekamMedisAuditBundle {
  review_pulang: RmReviewPulangRow[];
  review_rm: RmReviewRekamMedisRow[];
  kelengkapan_24jam: RmKelengkapan24JamRow[];
  penyediaan_rm_rajal?: string;
  penyediaan_rm_ranap?: string;
  hasil_analisis?: string;
}

export interface RadJumlahPemeriksaanRow {
  id: string;
  nama_pemeriksaan: string;
  jumlah: number | "";
}

export interface RadRejectRow {
  id: string;
  tanggal: string;
  nama_pasien: string;
  no_rm: string;
  jenis_pemeriksaan: string;
  foto_terbaca_baik: "YA" | "TIDAK" | "";
  alasan_tidak_terbaca: string;
  tindak_lanjut: string;
  ket: number | "";
}

export interface RadThoraxRow {
  id: string;
  tanggal: string;
  no_rm_nama: string;
  tindakan: string;
  visit: string;
  visit_exp: string;
  jam_text: string;
  selisih_detik: number;
  kurang_180: boolean | null;
}

export interface RadTindakanRow {
  id: string;
  tanggal: string;
  no_rm_nama: string;
  pemeriksaan: string;
  visit: string;
  dokter: string;
  expertise: boolean;
}

export interface RadiologiAuditBundle {
  jumlah_pemeriksaan: RadJumlahPemeriksaanRow[];
  reject_analisis: RadRejectRow[];
  reject_total_pasien: number | "";
  thorax_waktu_tunggu: RadThoraxRow[];
  tindakan_ekspertisi: RadTindakanRow[];
}

export interface PrognasMutuData {
  tanggal: string;
  indicator_type:
    | "hiv_aids"
    | "kematian_bayi"
    | "kematian_ibu"
    | "imd"
    | "rooming_in";
  target_label: string;
  target_count: number | "";
  target_pct: string;
  capaian_label: string;
  capaian_count: number | "";
  capaian_pct: number;
  tidak_tercapai_label?: string;
  tidak_tercapai_count?: number | "";
  tidak_tercapai_pct?: number;
  analisa: string;
  rekomendasi: string;
}

export interface FornasData {
  id: string;
  tanggal: string;
  jumlah_resep: number | "";
  jumlah_sesuai: number | "";
}

export interface RacikanWaktuTungguData {
  id: string;
  tanggal: string;
  no_rm: string;
  nama_pasien: string;
  jam_menyerahkan: string;
  jam_menerima: string;
  selisih_menit: number;
  sesuai_standar: boolean | null;
  keterangan: string;
}

export interface HighAlertDoubleCheckData {
  id: string;
  tanggal: string;
  no_rm: string;
  nama_pasien: string;
  double_check: "Ya" | "Tidak" | "";
  dokumentasi_lengkap: "Ya" | "Tidak" | "";
  hasil: "Patuh" | "Tidak Patuh" | "";
}

export interface KekosonganObatData {
  id: string;
  tanggal: string;
  no_rm: string;
  nama_pasien: string;
  jenis_obat_kosong: string;
  jumlah_kosong: number | "";
  jumlah_seluruh_obat: number | "";
  keterangan: string;
}

export interface SBARData {
  id: string;
  tanggal: string;
  no_rm: string;
  nama_pasien: string;
  tanggal_konsul: string;
  situation: "Ya" | "Tidak" | "";
  background: "Ya" | "Tidak" | "";
  assesment: "Ya" | "Tidak" | "";
  recomendation: "Ya" | "Tidak" | "";
  verifikasi: "Ya" | "Tidak" | "";
}

export interface PenundaanOperasiData {
  id: string;
  tanggal: string;
  no_rm: string;
  nama_pasien: string;
  jam_rencana: string;
  jam_pelaksanaan: string;
  interval_menit: number;
  tertunda_lebih_60: boolean | null;
  keterangan: string;
}

export interface SurgicalSafetyData {
  id: string;
  tanggal: string;
  no_rm: string;
  nama_pasien: string;
  sign_in: "Ya" | "Tidak" | "";
  time_out: "Ya" | "Tidak" | "";
  sign_out: "Ya" | "Tidak" | "";
  keterangan: string;
}

export interface PembatalanOperasiData {
  id: string;
  tanggal: string;
  no_rm: string;
  nama_pasien: string;
  penyebab_pembatalan: string;
  jumlah_batal: number | "";
  jumlah_seluruh_operasi: number | "";
  keterangan: string;
}

export interface PenyediaanDarahData {
  id: string;
  tanggal: string;
  nama_pasien: string;
  no_rm: string;
  jenis_darah_banyaknya: string;
  jam_permintaan: string;
  jam_diterima: string;
  selisih_menit: number;
  terlambat_lebih_60: boolean | null;
  keterangan: string;
}

export interface ImdBayiData {
  id: string;
  tanggal: string;
  nama_bayi: string;
  no_rm: string;
  imd: "Ya" | "Tidak" | "";
  alasan_tidak_imd: string;
  jumlah_bayi_lahir: number | "";
}

export interface KematianIbuBayiData {
  id: string;
  tanggal: string;
  nama_pasien: string;
  no_rm: string;
  alamat: string;
  dx: string;
  dpjp: string;
  rujukan_status: "Rujukan" | "Non-Rujukan" | "";
  jumlah_kematian: number | "";
  jumlah_populasi: number | "";
}

export interface PengkajianNyeriData {
  id: string;
  tanggal: string;
  no_rm: string;
  nama_pasien: string;
  asesmen_awal_nyeri: "Ya" | "Tidak" | "";
  asesmen_ulang_nyeri: "Ya" | "Tidak" | "";
  keterangan: string;
}

export interface EmergencyResponTimeData {
  id: string;
  tanggal: string;
  nama_pasien: string;
  no_rm: string;
  tgl_lahir: string;
  diagnosa: string;
  jam_reg: string;
  jam_periksa: string;
  interval_detik: number;
  interval_text: string;
  respon_kurang_5: boolean | null;
  keterangan?: string;
}

export interface ScEmergencyData {
  id: string;
  tanggal: string;
  no_rm: string;
  nama_pasien: string;
  jam_diputuskan: string;
  jam_insisi: string;
  interval_menit: number;
  sesuai_standar: boolean | null;
  keterangan: string;
}

export interface KomplikasiPersalinanData {
  id: string;
  tanggal: string;
  no_rm: string;
  nama_pasien: string;
  jenis_komplikasi: string;
  ditangani: "Ya" | "Tidak" | "";
  dirujuk: "Ya" | "Tidak" | "";
}

export interface HasilKritisLabData {
  id: string;
  tanggal: string;
  no_rm: string;
  nama_pasien: string;
  jam_keluar: string;
  jam_lapor: string;
  interval_menit: number;
  sesuai_standar: boolean | null;
  keterangan: string;
}

export interface SampelLabPelabelanData {
  id: string;
  tanggal: string;
  unit_pengirim: string;
  nama_pasien_rm: string;
  jenis_spesimen: string;
  label_ada: "Ya" | "Tidak" | "";
  identitas_lengkap: "Ya" | "Tidak" | "";
  status_sampel: "Diterima" | "Ditolak" | "";
  jumlah_sampel_diterima?: number | "";
  keterangan: string;
}

export interface KunjunganKeluargaData {
  id: string;
  tanggal: string;
  nama_pengunjung: string;
  nama_pasien: string;
  ruangan: string;
  jam_masuk: string;
  jam_keluar: string;
  sesuai_jam_kunjungan: "Ya" | "Tidak" | "";
  jumlah_pasien_ranap: number | "";
  total_kunjungan_keluarga?: number | "";
}

export interface PengangkutanLimbahData {
  id: string;
  tanggal: string;
  jam_pengangkutan: string;
  unit: string;
  tepat_waktu: boolean | null;
  keterangan: string;
}

export interface SaranaSanitasiData {
  id: string;
  tanggal: string;
  unit: string;
  toilet: "Baik" | "Rusak" | "N/A" | "";
  wastafel: "Baik" | "Rusak" | "N/A" | "";
  saluran_pembuangan: "Baik" | "Rusak" | "N/A" | "";
  status_fungsi: "Berfungsi Baik" | "Rusak" | "";
  keterangan: string;
}

export interface PenyediaanAlatSterilData {
  id: string;
  tanggal: string;
  nama_ruangan: string;
  jam_permintaan: string;
  jam_diberikan: string;
  selisih_menit: number;
  sesuai_standar: boolean | null;
  keterangan: string;
}

export interface PenyediaanLinenData {
  id: string;
  tanggal: string;
  nama_ruangan: string;
  jenis_linen: string;
  jam_permintaan: string;
  jam_dikirim: string;
  jam_diterima: string;
  selisih_menit: number;
  sesuai_standar: boolean | null;
  keterangan: string;
}

export interface KetersediaanAirData {
  id: string;
  tanggal: string;
  unit: string;
  jam_gangguan: string;
  jam_kembali_normal: string;
  durasi_gangguan_jam: number;
  jam_tersedia: number;
  keterangan: string;
}

export interface DataMutuPayload {
  id: string;
  unit: string;
  tanggal: string;
  kategori: string;
  indikator_id?: string;
  indikator_name?: string;
  numerator?: number;
  denominator?: number;
  target?: string | number;
  capaian?: number;
  status?: "Tercapai" | "Mendekati" | "Tidak Tercapai" | "N/A";
  keterangan?: string;
  kpc?: number;
  knc?: number;
  ktc?: number;
  ktd?: number;
  sentinel?: number;
  visite_details?: VisiteData[];
  jatuh_details?: JatuhData[];
  waktu_tunggu_details?: WaktuTungguData[];
  identifikasi_details?: IdentifikasiData[];
  fornas_details?: FornasData[];
  clinical_pathway_details?: ClinicalPathwayData[];
  verifikasi_telepon_details?: VerifikasiTeleponData[];
  ya_tidak_details?: YaTidakPasienData[];
  racikan_waktu_tunggu_details?: RacikanWaktuTungguData[];
  high_alert_details?: HighAlertDoubleCheckData[];
  kekosongan_obat_details?: KekosonganObatData[];
  sbar_details?: SBARData[];
  penundaan_operasi_details?: PenundaanOperasiData[];
  surgical_safety_details?: SurgicalSafetyData[];
  pembatalan_operasi_details?: PembatalanOperasiData[];
  penyediaan_darah_details?: PenyediaanDarahData[];
  imd_bayi_details?: ImdBayiData[];
  kematian_ibu_bayi_details?: KematianIbuBayiData[];
  pengkajian_nyeri_details?: PengkajianNyeriData[];
  emergency_respon_time_details?: EmergencyResponTimeData[];
  sc_emergency_details?: ScEmergencyData[];
  komplikasi_persalinan_details?: KomplikasiPersalinanData[];
  hasil_kritis_lab_details?: HasilKritisLabData[];
  sampel_lab_pelabelan_details?: SampelLabPelabelanData[];
  kunjungan_keluarga_details?: KunjunganKeluargaData[];
  pengangkutan_limbah_details?: PengangkutanLimbahData[];
  sarana_sanitasi_details?: SaranaSanitasiData[];
  penyediaan_alat_steril_details?: PenyediaanAlatSterilData[];
  penyediaan_linen_details?: PenyediaanLinenData[];
  ketersediaan_air_details?: KetersediaanAirData[];
  rekam_medis_details?: RekamMedisAuditBundle;
  radiologi_details?: RadiologiAuditBundle;
  prognas_details?: PrognasMutuData;
}

const initialDataMutu: DataMutuPayload[] = [];
const initialIndicatorProfiles: IndicatorProfile[] = [];

interface RootState {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  sidebarMinimized: boolean;
  setSidebarMinimized: (minimized: boolean) => void;
  userRole: string;
  hospitalLogo: string;
  setHospitalLogo: (logo: string) => void;
  dataMutuList: DataMutuPayload[];
  addDataMutu: (data: DataMutuPayload) => void;
  setDataMutuList: (data: DataMutuPayload[]) => void;
  indicatorProfiles: IndicatorProfile[];
  setIndicatorProfiles: (data: IndicatorProfile[]) => void;
  addIndicatorProfile: (data: IndicatorProfile) => void;
  updateIndicatorProfile: (id: string, data: Partial<IndicatorProfile>) => void;
  deleteIndicatorProfile: (id: string) => void;
  units: Unit[];
  addUnit: (unit: Unit) => void;
  updateUnit: (id: string, data: Partial<Unit>) => void;
  deleteUnit: (id: string) => void;
}

export interface Unit {
  id: string;
  name: string;
  category: string;
  status: "Aktif" | "Nonaktif";
}

const initialUnits: Unit[] = [
  { id: "1", name: "IGD", category: "Umum", status: "Aktif" },
  { id: "12", name: "Ranap Aisyah Anak", category: "Rawat Inap", status: "Aktif" },
  { id: "13", name: "Ranap Aisyah Bedah", category: "Rawat Inap", status: "Aktif" },
  { id: "2", name: "Ranap Aisyah", category: "Rawat Inap", status: "Aktif" },
  { id: "3", name: "Ranap Fatimah", category: "Rawat Inap", status: "Aktif" },
  { id: "4", name: "Ranap Khadijah", category: "Rawat Inap", status: "Aktif" },
  { id: "14", name: "Emergency Kebidanan", category: "Gawat Darurat", status: "Aktif" },
  { id: "5", name: "Ranap Usman", category: "Rawat Inap", status: "Aktif" },
  { id: "6", name: "ICU", category: "Intensif", status: "Aktif" },
  { id: "7", name: "IBS", category: "Khusus", status: "Aktif" },
  { id: "8", name: "Rawat Jalan", category: "Rawat Jalan", status: "Aktif" },
  { id: "9", name: "Radiologi", category: "Penunjang", status: "Aktif" },
  { id: "10", name: "Laboratorium", category: "Penunjang", status: "Aktif" },
  { id: "11", name: "Farmasi", category: "Penunjang", status: "Aktif" },
  { id: "1783220607381", name: "Laundry / CSSD", category: "Penunjang", status: "Aktif" },
  { id: "15", name: "Keamanan", category: "Umum", status: "Aktif" },
  { id: "16", name: "Kebersihan / Kesling", category: "Penunjang", status: "Aktif" },
  { id: "17", name: "PONEK", category: "Khusus", status: "Aktif" },
  { id: "18", name: "IPSRS", category: "Penunjang", status: "Aktif" },
  { id: "19", name: "Rekam Medis", category: "Penunjang", status: "Aktif" },
  { id: "20", name: "Prognas", category: "Khusus", status: "Aktif" },
];

export const useStore = create<RootState>((set) => ({
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  sidebarMinimized: false,
  setSidebarMinimized: (minimized) => set({ sidebarMinimized: minimized }),
  userRole: "Admin",
  hospitalLogo: "",
  setHospitalLogo: (logo) => set({ hospitalLogo: logo }),
  dataMutuList: [],
  addDataMutu: (data) =>
    set((state) => ({ dataMutuList: [...state.dataMutuList, data] })),
  setDataMutuList: (data) => set({ dataMutuList: data }),
  indicatorProfiles: [],
  setIndicatorProfiles: (data) => set({ indicatorProfiles: data }),
  addIndicatorProfile: (data) =>
    set((state) => ({ indicatorProfiles: [...state.indicatorProfiles, data] })),
  updateIndicatorProfile: (id, data) =>
    set((state) => ({
      indicatorProfiles: state.indicatorProfiles.map((p) =>
        p.id === id ? { ...p, ...data } : p,
      ),
    })),
  deleteIndicatorProfile: (id) =>
    set((state) => ({
      indicatorProfiles: state.indicatorProfiles.filter((p) => p.id !== id),
    })),
  units: initialUnits,
  addUnit: (unit) =>
    set((state) => {
      const existingIdx = state.units.findIndex(
        (u) =>
          u.id === unit.id ||
          (unit.name && u.name.trim().toLowerCase() === unit.name.trim().toLowerCase()),
      );
      if (existingIdx !== -1) {
        const nextUnits = [...state.units];
        nextUnits[existingIdx] = { ...nextUnits[existingIdx], ...unit };
        return { units: nextUnits };
      }
      return { units: [...state.units, unit] };
    }),
  updateUnit: (id, data) =>
    set((state) => ({
      units: state.units.map((u) => (u.id === id ? { ...u, ...data } : u)),
    })),
  deleteUnit: (id) =>
    set((state) => ({
      units: state.units.filter((u) => u.id !== id),
    })),
}));
