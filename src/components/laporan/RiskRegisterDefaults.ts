export interface SaprasItem {
  no: number;
  nama: string;
  awal: number | string;
  perubahan: string;
  akhir: number | string;
  keterangan: string;
}

export const DEFAULT_SAPRAS_TIM_MUTU: SaprasItem[] = [
  { no: 1, nama: "Meja ½ biro", awal: 1, perubahan: "-", akhir: 1, keterangan: "-" },
  { no: 2, nama: "Kursi", awal: 5, perubahan: "-", akhir: 5, keterangan: "-" },
  { no: 3, nama: "Meja rapat", awal: 1, perubahan: "-", akhir: 1, keterangan: "-" },
  { no: 4, nama: "Lemari arsip", awal: 1, perubahan: "-", akhir: 1, keterangan: "-" },
  { no: 5, nama: "Laptop", awal: 1, perubahan: "-", akhir: 1, keterangan: "Pengajuan" },
  { no: 6, nama: "Printer", awal: 1, perubahan: "-", akhir: 1, keterangan: "-" },
  { no: 7, nama: "Scanner", awal: 0, perubahan: "-", akhir: 0, keterangan: "-" },
];

export interface RawatInapStatItem {
  no: number;
  key: string;
  indikator: string;
  standar: string;
  capaian: string;
  tercapai: boolean;
}

export const DEFAULT_RAWAT_INAP_STATS: RawatInapStatItem[] = [
  {
    no: 1,
    key: "bor",
    indikator: "BOR (persentase pemakaian tempat tidur pada satu satuan waktu tertentu)",
    standar: "60-85%",
    capaian: "79,8%",
    tercapai: true,
  },
  {
    no: 2,
    key: "avlos",
    indikator: "AVLOS (rata-rata lama perawatan seorang pasien) (hari)",
    standar: "6-9 hari",
    capaian: "2,20 hari",
    tercapai: false,
  },
  {
    no: 3,
    key: "bto",
    indikator: "BTO (Frekuensi pemakaian tempat tidur dalam satu satuan waktu tertentu) (kali)",
    standar: "40-50 kali",
    capaian: "17,4 kali",
    tercapai: false,
  },
  {
    no: 4,
    key: "toi",
    indikator: "TOI (rata-rata hari tempat tidur tidak ditempati dari saat terisi sampai berikutnya) (hari)",
    standar: "1-3 hari",
    capaian: "5,18 hari",
    tercapai: false,
  },
  {
    no: 5,
    key: "ndr",
    indikator: "NDR (angka kematian >48 jam setelah dirawat untuk tiap-tiap 1000 penderita keluar) (‰)",
    standar: "<2,5%",
    capaian: "0,00%",
    tercapai: true,
  },
  {
    no: 6,
    key: "gdr",
    indikator: "GDR (angka kematian umum untuk tiap-tiap 1000 penderita keluar) (‰)",
    standar: "<4,5%",
    capaian: "0,22%",
    tercapai: true,
  },
  {
    no: 7,
    key: "akreditasi",
    indikator: "Tingkatan Kelulusan Akreditasi RS",
    standar: "Paripurna",
    capaian: "Paripurna",
    tercapai: true,
  },
];

export interface UnitRiskRow {
  no: number;
  risiko: string;
  penyebab: string;
  severity: number;
  probability: number;
  score: number;
  grading: string;
  peringkat: number;
  pengelolaan: string;
  pic: string;
  isLiveDb?: boolean;
}

export interface UnitRiskGroup {
  unitTitle: string;
  matchKeys: string[];
  rows: UnitRiskRow[];
}

export const BASELINE_UNIT_RISK_GROUPS: UnitRiskGroup[] = [
  {
    unitTitle: "Intensive care unit (ICU)",
    matchKeys: ["icu", "intensive care"],
    rows: [
      { no: 1, risiko: "Pemasangan Infus yang berulang", penyebab: "Kesulitan menemukan pembuluh darah vena", severity: 2, probability: 5, score: 10, grading: "Extreme", peringkat: 1, pengelolaan: "Melakukan edukasi kepada pasien dan keluarga tentang perawatan infus", pic: "Kepala unit ICU" },
      { no: 2, risiko: "Kemungkinan terjadinya phlebitis", penyebab: "Ketidaktepatan pada saat melakukan insersi, tidak melakukan perawatan infus", severity: 3, probability: 3, score: 9, grading: "Tinggi", peringkat: 2, pengelolaan: "Monitoring pemasangan infus dan mengganti posisi infus", pic: "Kepala unit ICU" },
      { no: 3, risiko: "Terpapar cairan tubuh pasien", penyebab: "Pelaksanaan tidak sesuai SPO, tidak menggunakan APD", severity: 3, probability: 3, score: 9, grading: "Tinggi", peringkat: 3, pengelolaan: "Pelaksanaan sesuai SPO; Disiplin dalam penggunaan APD", pic: "Kepala unit ICU" },
      { no: 4, risiko: "Petugas tertusuk benda tajam", penyebab: "Melakukan recapping jarum suntik", severity: 3, probability: 2, score: 6, grading: "Sedang", peringkat: 4, pengelolaan: "Melakukan tindakan sesuai dengan SPO; Melakukan teknik one hand jika memungkinkan; Menyediakan safety box", pic: "Kepala unit ICU" },
      { no: 5, risiko: "Kesalahan dalam pemberian obat", penyebab: "Tidak melakukan identifikasi pasien", severity: 3, probability: 2, score: 6, grading: "Sedang", peringkat: 5, pengelolaan: "Melakukan identifikasi pasien sesuai dengan SPO", pic: "Kepala unit ICU" },
      { no: 6, risiko: "Pasien jatuh dari bed", penyebab: "Kurangnya pengawasan, belum memasang bed rail dan belum memasang stiker risiko jatuh", severity: 5, probability: 1, score: 5, grading: "Extreme", peringkat: 6, pengelolaan: "Meningkatkan pengawasan terhadap pasien; Memasang bed rail; Memasang stiker risiko jatuh", pic: "Kepala unit ICU" },
      { no: 7, risiko: "Kegagalan fungsi gas medis", penyebab: "Kegagalan fungsi", severity: 4, probability: 1, score: 4, grading: "Tinggi", peringkat: 7, pengelolaan: "Melakukan monitoring dan pemeliharaan; Melakukan perbaikan apabila terjadi kerusakan", pic: "Kepala unit ICU, IPSRS" },
      { no: 8, risiko: "Tersetrum listrik", penyebab: "Pemegangan alat kesehatan tidak menggunakan alas kaki, kabel terkelupas", severity: 2, probability: 2, score: 4, grading: "Rendah", peringkat: 8, pengelolaan: "Menggunakan alas kaki; Memperbaiki kerusakan listrik", pic: "Kepala unit ICU, IPSRS" },
      { no: 9, risiko: "Terpeleset", penyebab: "Lantai licin", severity: 3, probability: 1, score: 3, grading: "Sedang", peringkat: 9, pengelolaan: "Menjaga lantai selalu kering", pic: "Kepala unit ICU, petugas kebersihan" },
      { no: 10, risiko: "Kegagalan listrik", penyebab: "Pemadaman dari PLN atau gangguan listrik", severity: 1, probability: 1, score: 1, grading: "Rendah", peringkat: 10, pengelolaan: "Penggunaan genset; Melakukan perbaikan apabila terjadi kerusakan listrik", pic: "Kepala unit ICU, IPSRS" },
    ],
  },
  {
    unitTitle: "Instalasi Bedah Sentral (IBS)",
    matchKeys: ["ibs", "bedah sentral", "ok"],
    rows: [
      { no: 1, risiko: "Operasi terhenti", penyebab: "Listrik padam", severity: 4, probability: 2, score: 8, grading: "Tinggi", peringkat: 1, pengelolaan: "Pastikan pemeliharaan generator set dan UPS koordinasi dengan IPSRS", pic: "Kepala unit IBS, IPSRS" },
      { no: 2, risiko: "Kejadian operasi salah orang", penyebab: "Kesalahan komunikasi dan kelalaian dalam prosedur pra-operasi", severity: 4, probability: 2, score: 8, grading: "Tinggi", peringkat: 2, pengelolaan: "Meningkatkan komunikasi; Sebelum mulai operasi, cek kembali identitas pasien", pic: "Kepala unit IBS" },
      { no: 3, risiko: "Ketidaktersediaan gas", penyebab: "Stock gas yang habis", severity: 4, probability: 2, score: 8, grading: "Tinggi", peringkat: 3, pengelolaan: "Menyediakan stock sesuai kebutuhan gas", pic: "Kepala unit IBS, IPSRS" },
      { no: 4, risiko: "Pasien jatuh saat naik meja operasi", penyebab: "Pemindahan tidak sesuai SPO", severity: 3, probability: 2, score: 6, grading: "Sedang", peringkat: 4, pengelolaan: "Pastikan pemindahan sesuai SPO yang berlaku dan berhati-hati saat melakukan pemindahan pasien", pic: "Kepala unit IBS" },
      { no: 5, risiko: "Kejadian operasi salah posisi", penyebab: "Tidak melakukan site marking", severity: 3, probability: 2, score: 6, grading: "Sedang", peringkat: 5, pengelolaan: "Melakukan site marking sesuai identitas pasien; Sebelum mulai operasi, cek kembali identitas pasien dan lokasi rencana operasi", pic: "Kepala unit IBS" },
      { no: 6, risiko: "Kejadian tertinggalnya instrumen", penyebab: "Kelalaian prosedur", severity: 3, probability: 2, score: 6, grading: "Sedang", peringkat: 6, pengelolaan: "Pengecekan ulang alat kesehatan", pic: "Kepala unit IBS" },
      { no: 7, risiko: "Petugas tertusuk benda tajam", penyebab: "Kelalaian petugas, bekerja tidak sesuai SPO", severity: 2, probability: 2, score: 4, grading: "Sedang", peringkat: 7, pengelolaan: "Motivasi / pembinaan agar bekerja lebih hati-hati; Bekerja sesuai dengan SPO", pic: "Kepala unit IBS" },
      { no: 8, risiko: "Kerusakan alat medis", penyebab: "Tidak melakukan pemeliharaan atau kalibrasi alat", severity: 2, probability: 2, score: 4, grading: "Sedang", peringkat: 8, pengelolaan: "Koordinasi dengan penanggung jawab alat medis untuk jadwal pemeliharaan atau kalibrasi secara rutin", pic: "Kepala unit IBS" },
      { no: 9, risiko: "Petugas terkena cairan tubuh pasien", penyebab: "Kejadian tidak terduga, petugas tidak menggunakan APD", severity: 1, probability: 4, score: 4, grading: "Sedang", peringkat: 9, pengelolaan: "Menggunakan APD lengkap", pic: "Kepala unit IBS" },
      { no: 10, risiko: "Informed consent tidak ada / tidak lengkap", penyebab: "Ketidaktelitian petugas terhadap prosedur", severity: 1, probability: 4, score: 4, grading: "Sedang", peringkat: 10, pengelolaan: "Koordinasi dengan rawat inap di pre operasi. Perbaiki, lengkapi dan buat yang belum ada", pic: "Kepala unit IBS" },
      { no: 11, risiko: "Keterlambatan DPJP", penyebab: "Kesibukan, macet, atau halangan lain", severity: 1, probability: 4, score: 4, grading: "Sedang", peringkat: 11, pengelolaan: "Komunikasi dan mengingatkan DPJP bila belum datang", pic: "Kepala unit IBS" },
      { no: 12, risiko: "Penulisan form rekam medis tidak lengkap", penyebab: "Form persetujuan tidak dilengkapi paraf pasien atau keluarga", severity: 1, probability: 3, score: 3, grading: "Rendah", peringkat: 12, pengelolaan: "Melengkapi dokumen", pic: "Kepala unit IBS" },
      { no: 13, risiko: "Keterlambatan dokter anestesi", penyebab: "Kesibukan, macet atau halangan lain", severity: 1, probability: 2, score: 2, grading: "Rendah", peringkat: 13, pengelolaan: "Komunikasi dan mengingatkan dokter anestesi bila belum datang", pic: "Kepala unit IBS" },
    ],
  },
  {
    unitTitle: "Instalasi Gawat Darurat (IGD)",
    matchKeys: ["igd", "gawat darurat"],
    rows: [
      { no: 1, risiko: "Kelelahan", penyebab: "Penuhnya pasien, Kekurangan SDM", severity: 3, probability: 5, score: 15, grading: "Tinggi", peringkat: 1, pengelolaan: "Penambahan SDM", pic: "Kepala IGD" },
      { no: 2, risiko: "Keributan", penyebab: "Pasien menunggu lama karena IGD penuh", severity: 3, probability: 2, score: 6, grading: "Sedang", peringkat: 2, pengelolaan: "Melakukan komunikasi yang baik dan menjelaskan kepada pasien bahwa IGD sedang penuh", pic: "Kepala IGD" },
      { no: 3, risiko: "Alergi obat pada pasien", penyebab: "Tidak menanyakan riwayat alergi pasien, pasien tidak mengetahui mempunyai alergi", severity: 3, probability: 2, score: 6, grading: "Sedang", peringkat: 3, pengelolaan: "Selalu menanyakan riwayat alergi pasien kepada pasien atau keluarga pasien", pic: "Kepala IGD" },
      { no: 4, risiko: "Risiko pasien jatuh", penyebab: "Kesalahan pada saat pemindahan pasien ke bed, tidak terdapat tanda bahwa pasien risiko jatuh", severity: 5, probability: 1, score: 5, grading: "Extreme", peringkat: 4, pengelolaan: "Bekerja sesuai dengan SPO; Memberikan penanda bahwa pasien risiko jatuh; Meningkatkan pengawasan terhadap pasien", pic: "Kepala IGD" },
      { no: 5, risiko: "Pasien dari IGD terlambat naik ke ruang rawat inap", penyebab: "Ruangan rawat inap penuh, bed pasien terbatas", severity: 1, probability: 4, score: 4, grading: "Sedang", peringkat: 5, pengelolaan: "Melakukan koordinasi dengan petugas rawat inap terkait ketersediaan bed pasien; Menambah bed pasien", pic: "Kepala IGD" },
      { no: 6, risiko: "Tertusuk benda tajam", penyebab: "Kurang fokus dalam melakukan perawatan, tidak bekerja sesuai dengan SPO", severity: 3, probability: 1, score: 3, grading: "Sedang", peringkat: 6, pengelolaan: "Bekerja sesuai dengan SPO; Fokus dalam bekerja", pic: "Kepala IGD" },
      { no: 7, risiko: "Petugas terkena cairan tubuh pasien", penyebab: "Pelaksanaan tidak sesuai SPO, tidak menggunakan APD", severity: 3, probability: 1, score: 3, grading: "Sedang", peringkat: 7, pengelolaan: "Pelaksanaan sesuai SPO; Disiplin dalam penggunaan APD", pic: "Kepala IGD" },
      { no: 8, risiko: "Benda tajam medis habis pakai tidak dibuang pada tempatnya", penyebab: "Kurangnya kepatuhan petugas dalam pembuangan sisa benda tajam ke safety box", severity: 3, probability: 1, score: 3, grading: "Sedang", peringkat: 8, pengelolaan: "Meningkatkan kepatuhan untuk pembuangan benda tajam medis habis pakai ke safety box", pic: "Kepala IGD" },
      { no: 9, risiko: "Limbah infeksius", penyebab: "Pembuangan bahan medis habis pakai yang tidak pada tempatnya", severity: 3, probability: 1, score: 3, grading: "Sedang", peringkat: 9, pengelolaan: "Meningkatkan kepatuhan untuk pembuangan bahan medis habis pakai ke tempat yang sudah ditentukan", pic: "Kepala IGD" },
      { no: 10, risiko: "Infeksi pada pasien", penyebab: "Penggunaan alat perawatan yang berulang", severity: 3, probability: 1, score: 3, grading: "Sedang", peringkat: 10, pengelolaan: "Selalu melakukan sterilisasi alat setelah melakukan perawatan; Mencuci tangan sebelum melakukan pemeriksaan dan tindakan", pic: "Kepala IGD" },
      { no: 11, risiko: "Resep atau instruksi pengobatan tidak terbaca", penyebab: "Tulisan tidak terbaca", severity: 1, probability: 2, score: 2, grading: "Rendah", peringkat: 11, pengelolaan: "Melakukan konfirmasi ulang ke dokter yang bersangkutan", pic: "Kepala IGD" },
      { no: 12, risiko: "Pasien tidak ditangani", penyebab: "Tidak tersedianya dokter yang dituju atau tidak tersedianya alat yang dibutuhkan", severity: 1, probability: 1, score: 1, grading: "Rendah", peringkat: 12, pengelolaan: "Menambah tenaga kesehatan dan alat medis; Merujuk ke Rumah Sakit lain untuk penanganan lebih lanjut", pic: "Kepala IGD" },
    ],
  },
  {
    unitTitle: "Rawat Inap Kebidanan",
    matchKeys: ["khadijah", "kebidanan", "emergency kebidanan", "ponek"],
    rows: [
      { no: 1, risiko: "DPJP telat atau tidak melakukan visite", penyebab: "Kesibukan, macet atau halangan lain", severity: 4, probability: 5, score: 20, grading: "Extreme", peringkat: 1, pengelolaan: "Membuat jadwal jam visite DPJP; Menghubungi DPJP H-1 terkait jadwal visite; Konsultasi via WhatsApp untuk tindakan atau pengobatan", pic: "Kepala rawat inap kebidanan" },
      { no: 2, risiko: "Bayi henti napas", penyebab: "Aspirasi air ketuban, kurang bulan, infeksi pada bayi", severity: 5, probability: 2, score: 10, grading: "Extreme", peringkat: 2, pengelolaan: "Pengawasan intensif dari petugas; Diklat resusitasi neonatus; Penambahan alat terkait bayi ancaman gagal napas", pic: "Kepala rawat inap kebidanan" },
      { no: 3, risiko: "Kurang kebersihan ruangan / toilet", penyebab: "Tidak ada petugas kebersihan pada hari Minggu", severity: 3, probability: 5, score: 15, grading: "Tinggi", peringkat: 3, pengelolaan: "Penambahan SDM petugas kebersihan", pic: "Kepala rawat inap kebidanan, Kepegawaian" },
      { no: 4, risiko: "Risiko pasien jatuh", penyebab: "Pengaman bed yang rusak, kurangnya pengamatan petugas, tidak terpasangnya gelang identitas pasien risiko jatuh", severity: 4, probability: 2, score: 8, grading: "Tinggi", peringkat: 4, pengelolaan: "Pengecekan kondisi bed secara berkala; Melakukan perbaikan apabila terjadi kerusakan, melakukan koordinasi dengan IPSRS; Meningkatkan pengamatan terhadap pasien", pic: "Kepala rawat inap kebidanan" },
      { no: 5, risiko: "Tertinggal kassa tampon", penyebab: "Tidak dilakukan perhitungan jumlah kassa tampon, kurang ketelitian petugas", severity: 3, probability: 2, score: 6, grading: "Sedang", peringkat: 5, pengelolaan: "Setiap penggunaan kassa tampon dicatat di CPPT; Menginformasikan saat operan jaga", pic: "Kepala rawat inap kebidanan" },
      { no: 6, risiko: "Penculikan bayi", penyebab: "Kurangnya pengawasan", severity: 5, probability: 1, score: 5, grading: "Extreme", peringkat: 6, pengelolaan: "Meningkatkan pengawasan; Pemasangan identitas pengunjung; Penggunaan seragam dan identitas karyawan; Berkoordinasi dengan security untuk pengawasan perawatan bayi", pic: "Kepala rawat inap kebidanan" },
      { no: 7, risiko: "Bayi tertukar", penyebab: "Tidak diberi gelang identitas atau penanda nama bayi", severity: 5, probability: 1, score: 5, grading: "Extreme", peringkat: 7, pengelolaan: "Pemberian gelang identitas atau penanda nama bayi untuk menghindari tertukarnya bayi", pic: "Kepala rawat inap kebidanan" },
      { no: 8, risiko: "Pasien jatuh atau terpeleset di kamar mandi", penyebab: "Lantai kamar mandi licin, tidak ada handrail atau handrail rusak", severity: 4, probability: 1, score: 4, grading: "Tinggi", peringkat: 8, pengelolaan: "Koordinasi dengan petugas kebersihan; Koordinasi dengan IPSRS untuk perbaikan; Penambahan bel di toilet", pic: "Kepala rawat inap kebidanan, petugas kebersihan, bagian pengadaan" },
      { no: 9, risiko: "Bayi mengalami hipotermi atau hipertermi", penyebab: "Suhu tidak sesuai, tidak ada ATEM stand by", severity: 4, probability: 1, score: 4, grading: "Tinggi", peringkat: 9, pengelolaan: "Menyesuaikan suhu; Maintenance alat secara rutin", pic: "Kepala rawat inap kebidanan, penanggung jawab alat" },
      { no: 10, risiko: "Tertusuk benda tajam", penyebab: "Petugas bekerja tidak sesuai SPO, petugas terburu-buru", severity: 2, probability: 2, score: 4, grading: "Rendah", peringkat: 10, pengelolaan: "Bekerja sesuai dengan SPO dan berhati-hati pada saat tindakan", pic: "Kepala rawat inap kebidanan" },
      { no: 11, risiko: "Mati listrik", penyebab: "Pemadaman serentak daerah rumah sakit", severity: 1, probability: 4, score: 4, grading: "Sedang", peringkat: 11, pengelolaan: "Maintenance genset sehingga siap untuk dipakai", pic: "Kepala rawat inap kebidanan, IPSRS" },
      { no: 12, risiko: "Bayi terdapat luka lecet", penyebab: "Terkena alat tindakan", severity: 3, probability: 1, score: 3, grading: "Sedang", peringkat: 12, pengelolaan: "Pengawasan ketat terhadap alat-alat tindakan agar tidak memberikan luka pada bayi; Pemeriksaan secara teliti terhadap bayi", pic: "Kepala rawat inap kebidanan" },
      { no: 13, risiko: "Kesalahan identitas pasien", penyebab: "Kurang ketelitian petugas, kurangnya kerja sama antara petugas dengan pasien", severity: 3, probability: 1, score: 3, grading: "Sedang", peringkat: 13, pengelolaan: "Pengecekan gelang identitas pasien; Melakukan identifikasi setiap akan melakukan tindakan", pic: "Kepala rawat inap kebidanan" },
      { no: 14, risiko: "Risiko salah instruksi DPJP melalui telepon / HP", penyebab: "Kurang telitinya petugas dalam pelaporan maupun menerima laporan", severity: 1, probability: 1, score: 1, grading: "Rendah", peringkat: 14, pengelolaan: "Melakukan konfirmasi ulang; Monitoring kondisi pasien secara berkala", pic: "Kepala rawat inap kebidanan" },
    ],
  },
  {
    unitTitle: "Rawat Inap Gabung (Aisyah)",
    matchKeys: ["aisyah", "ranap aisyah"],
    rows: [
      { no: 1, risiko: "Kurang kebersihan ruangan / toilet", penyebab: "Kurangnya SDM, kurangnya monitoring hasil kerja petugas kebersihan", severity: 3, probability: 5, score: 15, grading: "Tinggi", peringkat: 1, pengelolaan: "Pelaksanaan monitoring hasil kebersihan; Penambahan SDM", pic: "Kepala rawat inap aisyah, Kesehatan lingkungan, Kepegawaian" },
      { no: 2, risiko: "Risiko pasien jatuh", penyebab: "Pengaman bed yang rusak, kurangnya pengamatan petugas, tidak terpasangnya gelang identitas pasien risiko jatuh", severity: 4, probability: 2, score: 8, grading: "Tinggi", peringkat: 2, pengelolaan: "Pengecekan kondisi bed secara berkala; Melakukan perbaikan apabila terjadi kerusakan, melakukan koordinasi dengan IPSRS; Meningkatkan pengawasan terhadap pasien; Memasang stiker risiko jatuh", pic: "Kepala rawat inap aisyah" },
      { no: 3, risiko: "Pemasangan infus yang berulang", penyebab: "Kesulitan menemukan pembuluh darah vena", severity: 2, probability: 4, score: 8, grading: "Sedang", peringkat: 3, pengelolaan: "Melakukan edukasi kepada pasien dan keluarga tentang perawatan infus", pic: "Kepala rawat inap aisyah" },
      { no: 4, risiko: "Pasien jatuh atau terpeleset di kamar mandi", penyebab: "Lantai kamar mandi licin, tidak ada handrail atau handrail rusak", severity: 3, probability: 2, score: 6, grading: "Sedang", peringkat: 4, pengelolaan: "Koordinasi dengan petugas kebersihan untuk membersihkan toilet; Koordinasi dengan IPSRS untuk perbaikan atau pengadaan handrail", pic: "Kepala rawat inap aisyah, IPSRS, bagian pengadaan" },
      { no: 5, risiko: "Salah pemberian pengobatan / tindakan", penyebab: "Kesalahan identifikasi pasien", severity: 3, probability: 2, score: 6, grading: "Sedang", peringkat: 5, pengelolaan: "Melakukan identifikasi pasien sesuai dengan SPO", pic: "Kepala rawat inap aisyah" },
      { no: 6, risiko: "Risiko tertular penyakit", penyebab: "Kurangnya kepatuhan dalam melakukan hand hygiene dan penggunaan APD", severity: 3, probability: 2, score: 6, grading: "Sedang", peringkat: 6, pengelolaan: "Motivasi petugas untuk selalu melakukan hand hygiene dan penggunaan APD", pic: "Kepala rawat inap aisyah" },
      { no: 7, risiko: "DPJP telat atau tidak melakukan visite", penyebab: "Kesibukan, macet atau halangan lain", severity: 1, probability: 5, score: 5, grading: "Sedang", peringkat: 7, pengelolaan: "Membuat jadwal jam visite DPJP; Konsultasi menggunakan WhatsApp untuk tindakan atau pengobatan", pic: "Kepala rawat inap aisyah" },
      { no: 8, risiko: "Tertusuk benda tajam", penyebab: "Petugas bekerja tidak sesuai SPO, petugas terburu-buru", severity: 2, probability: 2, score: 4, grading: "Rendah", peringkat: 8, pengelolaan: "Bekerja sesuai dengan SPO; Penggunaan APD", pic: "Kepala rawat inap aisyah" },
      { no: 9, risiko: "Ketidaktepatan jumlah pemberian cairan infus", penyebab: "Kurangnya pengawasan terhadap laju dan dosis cairan infus", severity: 2, probability: 2, score: 4, grading: "Rendah", peringkat: 9, pengelolaan: "Melakukan pengecekan berkala terhadap laju dan dosis cairan infus", pic: "Kepala rawat inap aisyah" },
      { no: 10, risiko: "Kerusakan fasilitas ruangan", penyebab: "Kejadian yang tidak diinginkan", severity: 1, probability: 3, score: 3, grading: "Rendah", peringkat: 10, pengelolaan: "Pemantauan fasilitas ruangan; Apabila terdapat gangguan atau kerusakan fasilitas ruangan berkoordinasi dengan IPSRS untuk perbaikan", pic: "Kepala rawat inap aisyah" },
      { no: 11, risiko: "Risiko tertinggal obat atau barang milik pasien", penyebab: "Kurang teliti keluarga pasien", severity: 1, probability: 3, score: 3, grading: "Rendah", peringkat: 11, pengelolaan: "Pengecekan kembali ruangan setelah pasien pulang, untuk memastikan tidak ada barang yang tertinggal", pic: "Kepala rawat inap aisyah" },
    ],
  },
  {
    unitTitle: "Rawat Inap Isolasi (Fatimah)",
    matchKeys: ["fatimah", "ranap fatimah"],
    rows: [
      { no: 1, risiko: "Kurang kebersihan ruangan / toilet", penyebab: "Kurangnya SDM, kurangnya monitoring hasil kerja petugas kebersihan", severity: 3, probability: 5, score: 15, grading: "Tinggi", peringkat: 1, pengelolaan: "Pelaksanaan hasil monitoring kebersihan; Penambahan SDM", pic: "Kepala rawat inap fatimah, Kesehatan lingkungan, Kepegawaian" },
      { no: 2, risiko: "Ketidaktepatan jumlah pemberian cairan infus", penyebab: "Kurangnya pengawasan terhadap laju dan dosis cairan infus", severity: 3, probability: 4, score: 12, grading: "Tinggi", peringkat: 2, pengelolaan: "Melakukan pengecekan berkala terhadap laju dan dosis cairan infus", pic: "Kepala rawat inap fatimah" },
      { no: 3, risiko: "Risiko tertular penyakit", penyebab: "Kurangnya kepatuhan dalam melakukan hand hygiene dan penggunaan APD", severity: 3, probability: 3, score: 9, grading: "Tinggi", peringkat: 3, pengelolaan: "Motivasi petugas untuk selalu melakukan hand hygiene dan penggunaan APD", pic: "Kepala rawat inap fatimah" },
      { no: 4, risiko: "Pasien jatuh atau terpeleset di kamar mandi", penyebab: "Lantai kamar mandi licin, tidak ada handrail atau handrail rusak", severity: 4, probability: 2, score: 8, grading: "Tinggi", peringkat: 4, pengelolaan: "Koordinasi dengan petugas kebersihan untuk membersihkan toilet; Koordinasi dengan IPSRS untuk perbaikan atau pengadaan handrail", pic: "Kepala rawat inap fatimah, IPSRS, bagian pengadaan" },
      { no: 5, risiko: "Salah pemberian pengobatan / tindakan", penyebab: "Kesalahan identifikasi pasien", severity: 4, probability: 2, score: 8, grading: "Tinggi", peringkat: 5, pengelolaan: "Melakukan identifikasi pasien sesuai dengan SPO", pic: "Kepala rawat inap fatimah" },
      { no: 6, risiko: "Risiko pasien jatuh", penyebab: "Pengaman bed yang rusak, kurangnya pengamatan petugas, tidak terpasangnya gelang identitas pasien risiko jatuh", severity: 4, probability: 2, score: 8, grading: "Tinggi", peringkat: 6, pengelolaan: "Pengecekan kondisi bed secara berkala; Melakukan perbaikan apabila terjadi kerusakan, koordinasi dengan IPSRS; Meningkatkan pengawasan; Memasang stiker risiko jatuh", pic: "Kepala rawat inap fatimah" },
      { no: 7, risiko: "Pemasangan infus yang berulang", penyebab: "Kesulitan menemukan pembuluh darah vena", severity: 2, probability: 4, score: 8, grading: "Sedang", peringkat: 7, pengelolaan: "Melakukan edukasi kepada pasien dan keluarga tentang perawatan infus", pic: "Kepala rawat inap fatimah" },
      { no: 8, risiko: "Tertusuk benda tajam", penyebab: "Petugas bekerja tidak sesuai SPO, petugas terburu-buru", severity: 2, probability: 3, score: 6, grading: "Sedang", peringkat: 8, pengelolaan: "Bekerja sesuai dengan SPO; Penggunaan APD", pic: "Kepala rawat inap fatimah" },
      { no: 9, risiko: "DPJP telat atau tidak melakukan visite", penyebab: "Kesibukan, macet atau halangan lain", severity: 1, probability: 5, score: 5, grading: "Sedang", peringkat: 9, pengelolaan: "Membuat jadwal jam visite DPJP; Konsultasi menggunakan WhatsApp untuk tindakan atau pengobatan", pic: "Kepala rawat inap fatimah" },
      { no: 10, risiko: "Kerusakan fasilitas ruangan", penyebab: "Kejadian yang tidak diinginkan", severity: 1, probability: 4, score: 4, grading: "Sedang", peringkat: 10, pengelolaan: "Pemantauan fasilitas ruangan; Apabila terdapat gangguan atau kerusakan fasilitas ruangan berkoordinasi dengan IPSRS untuk perbaikan", pic: "Kepala rawat inap fatimah, IPSRS" },
      { no: 11, risiko: "Risiko tertinggalnya obat atau barang milik pasien", penyebab: "Kurangnya teliti keluarga pasien", severity: 1, probability: 4, score: 4, grading: "Sedang", peringkat: 11, pengelolaan: "Pengecekan kembali ruangan setelah pasien pulang, untuk memastikan tidak ada barang yang tertinggal", pic: "Kepala rawat inap fatimah" },
    ],
  },
  {
    unitTitle: "Rawat Inap Usman",
    matchKeys: ["usman", "ranap usman"],
    rows: [
      { no: 1, risiko: "Risiko tertular penyakit", penyebab: "Kurangnya kepatuhan dalam melakukan hand hygiene dan penggunaan APD", severity: 3, probability: 3, score: 9, grading: "Tinggi", peringkat: 1, pengelolaan: "Motivasi petugas untuk selalu melakukan hand hygiene dan penggunaan APD", pic: "Kepala rawat inap usman" },
      { no: 2, risiko: "Kerusakan fasilitas ruangan", penyebab: "Kejadian yang tidak diinginkan", severity: 3, probability: 3, score: 9, grading: "Tinggi", peringkat: 2, pengelolaan: "Pemantauan fasilitas ruangan; Apabila terdapat gangguan atau kerusakan fasilitas ruangan berkoordinasi dengan IPSRS untuk perbaikan", pic: "Kepala rawat inap usman, IPSRS" },
      { no: 3, risiko: "Risiko pasien jatuh", penyebab: "Pengaman bed yang rusak, kurangnya pengamatan petugas, tidak terpasangnya gelang identitas pasien risiko jatuh", severity: 4, probability: 2, score: 8, grading: "Tinggi", peringkat: 3, pengelolaan: "Pengecekan kondisi bed secara berkala; Koordinasi dengan IPSRS; Meningkatkan pengawasan; Memasang stiker risiko jatuh", pic: "Kepala rawat inap usman" },
      { no: 4, risiko: "Pasien jatuh atau terpeleset di kamar mandi", penyebab: "Lantai kamar mandi licin, tidak ada handrail atau handrail rusak", severity: 4, probability: 2, score: 8, grading: "Tinggi", peringkat: 4, pengelolaan: "Koordinasi dengan petugas kebersihan untuk membersihkan toilet; Koordinasi dengan IPSRS untuk perbaikan atau pengadaan handrail", pic: "Kepala rawat inap usman" },
      { no: 5, risiko: "Pemasangan infus yang berulang", penyebab: "Kesulitan menemukan pembuluh darah vena", severity: 2, probability: 2, score: 4, grading: "Rendah", peringkat: 5, pengelolaan: "Melakukan edukasi kepada pasien dan keluarga tentang perawatan infus", pic: "Kepala rawat inap usman" },
      { no: 6, risiko: "Ketidaktepatan jumlah pemberian cairan infus", penyebab: "Kurangnya pengawasan terhadap laju dan dosis cairan infus", severity: 2, probability: 2, score: 4, grading: "Rendah", peringkat: 6, pengelolaan: "Melakukan pengecekan berkala terhadap laju dan dosis cairan infus", pic: "Kepala rawat inap usman" },
      { no: 7, risiko: "Tertusuk benda tajam", penyebab: "Petugas bekerja tidak sesuai SPO, petugas terburu-buru", severity: 1, probability: 1, score: 1, grading: "Rendah", peringkat: 7, pengelolaan: "Bekerja sesuai dengan SPO; Penggunaan APD", pic: "Kepala rawat inap usman" },
      { no: 8, risiko: "Salah pemberian pengobatan atau tindakan", penyebab: "Kesalahan identifikasi pasien", severity: 1, probability: 1, score: 1, grading: "Rendah", peringkat: 8, pengelolaan: "Melakukan identifikasi pasien sesuai dengan SPO", pic: "Kepala rawat inap usman" },
      { no: 9, risiko: "Risiko tertinggalnya obat atau barang milik pasien", penyebab: "Kurangnya teliti keluarga pasien", severity: 1, probability: 1, score: 1, grading: "Rendah", peringkat: 9, pengelolaan: "Pengecekan kembali ruangan setelah pasien pulang, untuk memastikan tidak ada barang yang tertinggal", pic: "Kepala rawat inap usman" },
    ],
  },
  {
    unitTitle: "Rawat Jalan",
    matchKeys: ["rawat jalan", "poliklinik", "rajal"],
    rows: [
      { no: 1, risiko: "Kerusakan mata (poli gigi)", penyebab: "Lightcure belum ada kaca pelindung", severity: 4, probability: 4, score: 16, grading: "Extreme", peringkat: 1, pengelolaan: "Permintaan pengadaan kaca pelindung untuk penggunaan light cure", pic: "Kepala unit rawat jalan, bagian pengadaan" },
      { no: 2, risiko: "Terjatuh / Tersandung", penyebab: "Terdapat kotak kayu untuk menutup pipa pada poli gigi", severity: 3, probability: 4, score: 12, grading: "Tinggi", peringkat: 2, pengelolaan: "Melakukan relokasi atau perbaikan agar pasien maupun petugas tidak terjatuh / tersandung", pic: "Kepala unit rawat jalan, IPSRS" },
      { no: 3, risiko: "Kebersihan ruangan / toilet", penyebab: "Kurangnya monitoring hasil kerja petugas kebersihan", severity: 3, probability: 4, score: 12, grading: "Tinggi", peringkat: 3, pengelolaan: "Pelaksanaan monitoring kebersihan", pic: "Kepala unit rawat jalan, Kesehatan lingkungan" },
      { no: 4, risiko: "Terpeleset / tersandung", penyebab: "Lantai basah, pada poli gigi terdapat penutup pipa paralon pembuangan air", severity: 3, probability: 4, score: 12, grading: "Tinggi", peringkat: 4, pengelolaan: "Saat melakukan kegiatan pembersihan memberikan tanda sedang dilakukan pembersihan; Melakukan relokasi pipa paralon atau mengatur ulang ruang kerja", pic: "Kepala unit rawat jalan, IPSRS" },
      { no: 5, risiko: "Petugas tertusuk benda tajam", penyebab: "Melakukan recapping jarum suntik", severity: 3, probability: 3, score: 9, grading: "Tinggi", peringkat: 5, pengelolaan: "Melakukan tindakan sesuai dengan SPO; Melakukan teknik one hand jika memungkinkan; Menyediakan safety box", pic: "Kepala unit rawat jalan" },
      { no: 6, risiko: "Risiko pasien jatuh", penyebab: "Pengaman bed yang rusak, kurangnya pengamatan petugas, tidak terpasangnya gelang identitas pasien risiko jatuh", severity: 3, probability: 2, score: 6, grading: "Sedang", peringkat: 6, pengelolaan: "Pengecekan kondisi bed secara berkala; Koordinasi dengan IPSRS; Meningkatkan pengamatan terhadap pasien", pic: "Kepala unit rawat jalan" },
      { no: 7, risiko: "Risiko tertular penyakit", penyebab: "Penyebaran penyakit melalui udara, petugas tidak menggunakan APD, petugas tidak melakukan hand hygiene", severity: 3, probability: 2, score: 6, grading: "Sedang", peringkat: 7, pengelolaan: "Petugas menggunakan APD; Petugas melakukan hand hygiene", pic: "Kepala unit rawat jalan" },
      { no: 8, risiko: "Petugas tersetrum listrik", penyebab: "Kabel terkelupas atau stop kontak yang terbuka", severity: 3, probability: 2, score: 6, grading: "Sedang", peringkat: 8, pengelolaan: "Melakukan perbaikan untuk kabel atau stop kontak yang terbuka", pic: "Kepala unit rawat jalan, IPSRS" },
      { no: 9, risiko: "Risiko tertunda pemeriksaan penunjang", penyebab: "Petugas belum berada di tempat, petugas sedang sakit atau halangan lain", severity: 2, probability: 3, score: 6, grading: "Sedang", peringkat: 9, pengelolaan: "Selalu berkoordinasi dengan unit penunjang yang dituju", pic: "Kepala unit rawat jalan, kepala unit penunjang" },
      { no: 10, risiko: "Tertusuk / tersayat alat saat tindakan (poli gigi)", penyebab: "Kejadian tidak diinginkan", severity: 2, probability: 2, score: 4, grading: "Rendah", peringkat: 10, pengelolaan: "Meningkatkan kewaspadaan saat melakukan tindakan", pic: "Kepala unit rawat jalan" },
      { no: 11, risiko: "Risiko tertunda pemeriksaan penunjang akibat gagal fungsi mesin atau alat", penyebab: "Kerusakan atau kegagalan fungsi", severity: 2, probability: 2, score: 4, grading: "Rendah", peringkat: 11, pengelolaan: "Berkoordinasi dengan pihak penunjang yang mengalami masalah mesin", pic: "Kepala unit rawat jalan, kepala unit penunjang" },
      { no: 12, risiko: "Salah pemeriksaan pasien", penyebab: "Tidak melakukan identifikasi pasien", severity: 1, probability: 2, score: 2, grading: "Rendah", peringkat: 12, pengelolaan: "Melakukan identifikasi pasien sesuai dengan SPO", pic: "Kepala unit rawat jalan" },
    ],
  },
  {
    unitTitle: "Ambulance",
    matchKeys: ["ambulance", "ambulan"],
    rows: [
      { no: 1, risiko: "Pasien jatuh pada saat pemindahan", penyebab: "Brankar ambulance rujuk pasien tidak berfungsi dengan baik, cara pemindahan pasien tidak sesuai dengan SPO", severity: 4, probability: 2, score: 8, grading: "Tinggi", peringkat: 1, pengelolaan: "Melakukan pengecekan terhadap brankar ambulance; Bekerja sesuai dengan SPO", pic: "Kepala unit ambulance" },
      { no: 2, risiko: "Kecelakaan lalu lintas", penyebab: "Terjadinya kerusakan pada mesin atau sparepart mobil ambulance, kondisi driver ambulance tidak fit", severity: 4, probability: 2, score: 8, grading: "Tinggi", peringkat: 2, pengelolaan: "Membuat jadwal perawatan mobil ambulance dan melakukan perbaikan jika terjadi kerusakan; Bekerja sesuai jam kerja dan istirahat cukup", pic: "Kepala unit ambulance" },
      { no: 3, risiko: "Petugas tertular penyakit", penyebab: "Petugas terpapar cairan tubuh pasien", severity: 3, probability: 2, score: 6, grading: "Sedang", peringkat: 3, pengelolaan: "Penggunaan APD lengkap; Menerapkan hand hygiene", pic: "Kepala unit ambulance" },
      { no: 4, risiko: "Ban mobil ambulance kempis atau bocor", penyebab: "Tidak melakukan pengecekan ban mobil ambulance, terkena benda tajam di jalan", severity: 1, probability: 4, score: 4, grading: "Sedang", peringkat: 4, pengelolaan: "Membuat jadwal perawatan mobil ambulance; Melakukan pengecekan sebelum beraktivitas", pic: "Kepala unit ambulance" },
    ],
  },
  {
    unitTitle: "Central Sterile Services Department (CSSD)",
    matchKeys: ["cssd", "laundry"],
    rows: [
      { no: 1, risiko: "Terkena alat panas", penyebab: "Tidak menggunakan APD", severity: 3, probability: 4, score: 12, grading: "Tinggi", peringkat: 1, pengelolaan: "Penggunaan APD (sarung tangan anti panas)", pic: "Kepala unit CSSD" },
      { no: 2, risiko: "Iritasi mata atau saluran pernapasan", penyebab: "Terpapar debu dari aktivitas sterilisasi", severity: 2, probability: 4, score: 8, grading: "Sedang", peringkat: 2, pengelolaan: "Penggunaan APD", pic: "Kepala unit CSSD" },
      { no: 3, risiko: "Penularan penyakit", penyebab: "Penularan melalui cairan tubuh pasien pada instrumen", severity: 3, probability: 2, score: 6, grading: "Sedang", peringkat: 3, pengelolaan: "Penggunaan APD; Pelaksanaan hand hygiene", pic: "Kepala unit CSSD" },
      { no: 4, risiko: "Tertusuk benda tajam", penyebab: "Pencucian instrumen yang kategori benda tajam", severity: 3, probability: 2, score: 6, grading: "Sedang", peringkat: 4, pengelolaan: "Pemisahan benda tajam dan non tajam; Penggunaan APD", pic: "Kepala unit CSSD" },
      { no: 5, risiko: "Risiko infeksius", penyebab: "Terpapar infeksius dari linen", severity: 3, probability: 2, score: 6, grading: "Sedang", peringkat: 5, pengelolaan: "Melakukan hand hygiene; Penggunaan APD", pic: "Kepala unit CSSD" },
      { no: 6, risiko: "Linen hilang", penyebab: "Linen dibawa oleh pasien", severity: 1, probability: 2, score: 2, grading: "Rendah", peringkat: 6, pengelolaan: "Membuat buku ekspedisi untuk inventarisir distribusi linen; Berkoordinasi dengan petugas rawat inap saat pasien pulang", pic: "Kepala unit CSSD" },
    ],
  },
  {
    unitTitle: "Farmasi",
    matchKeys: ["farmasi", "instalasi farmasi"],
    rows: [
      { no: 1, risiko: "Kesalahan pemberian obat-obat LASA dan high alert tanpa label", penyebab: "Tidak semua shift double check pada saat pelayanan", severity: 5, probability: 3, score: 15, grading: "Extreme", peringkat: 1, pengelolaan: "SDM sesuai standar; 1 shift terdiri dari 2 orang sehingga bisa dilakukan double check sebelum penyerahan obat", pic: "Kepala instalasi farmasi" },
      { no: 2, risiko: "Kehilangan obat-obat khusus (psikotropik-narkotik) di depo OK", penyebab: "Tidak tersedia tenaga apoteker", severity: 5, probability: 2, score: 10, grading: "Extreme", peringkat: 2, pengelolaan: "Di depo OK harus tersedia tenaga apoteker", pic: "Kepala instalasi farmasi, manajemen" },
      { no: 3, risiko: "Kesalahan pencampuran obat", penyebab: "Petugas tidak terlatih", severity: 5, probability: 2, score: 10, grading: "Extreme", peringkat: 3, pengelolaan: "Petugas harus sesuai kompetensinya yaitu yang sudah melaksanakan pelatihan secara berkala", pic: "Kepala instalasi farmasi" },
      { no: 4, risiko: "Kebakaran, pencurian obat, kebocoran atap", penyebab: "Kondisi bangunan gudang tidak memadai", severity: 5, probability: 2, score: 10, grading: "Extreme", peringkat: 4, pengelolaan: "Perbaiki / pindah ke gudang yang sesuai standar gudang farmasi", pic: "Kepala instalasi farmasi, manajemen" },
      { no: 5, risiko: "Kesalahan pendistribusian obat dari gudang ke poli / unit-unit satelit", penyebab: "Di gudang farmasi tidak ada apoteker sehingga fungsi kontrol kurang", severity: 3, probability: 3, score: 9, grading: "Tinggi", peringkat: 5, pengelolaan: "Adanya apoteker di gudang farmasi", pic: "Kepala instalasi farmasi, manajemen" },
      { no: 6, risiko: "Kesalahan penerimaan obat, atau ketidaksesuaian obat yang dipesan dengan yang datang", penyebab: "Di gudang farmasi tidak ada apoteker sehingga fungsi kontrol kurang", severity: 3, probability: 3, score: 9, grading: "Tinggi", peringkat: 6, pengelolaan: "Adanya apoteker di gudang farmasi", pic: "Kepala instalasi farmasi, manajemen" },
      { no: 7, risiko: "Kekosongan obat", penyebab: "Di gudang farmasi tidak ada apoteker sehingga perencanaan kurang maksimal, pengadaan obat berada di unit / pihak lain", severity: 3, probability: 3, score: 9, grading: "Tinggi", peringkat: 7, pengelolaan: "Adanya apoteker di gudang farmasi dan di unit pengadaan", pic: "Kepala instalasi farmasi, manajemen" },
    ],
  },
  {
    unitTitle: "Gizi",
    matchKeys: ["gizi"],
    rows: [
      { no: 1, risiko: "Komplain pasien terhadap makanan", penyebab: "Ketidakpuasan pasien terhadap rasa makanan", severity: 3, probability: 3, score: 9, grading: "Tinggi", peringkat: 1, pengelolaan: "Melakukan monitoring dan evaluasi ke jasa penyedia makanan", pic: "Kepala unit gizi" },
      { no: 2, risiko: "Salah pemberian diet makanan", penyebab: "Petugas kurang teliti dalam melakukan asesmen pasien", severity: 4, probability: 2, score: 8, grading: "Tinggi", peringkat: 2, pengelolaan: "Petugas melakukan asesmen yang baik dan teliti", pic: "Kepala unit gizi" },
      { no: 3, risiko: "Petugas distribusi makanan terpeleset atau terjatuh", penyebab: "Lantai basah, melakukan distribusi makanan dalam jumlah banyak", severity: 3, probability: 2, score: 6, grading: "Sedang", peringkat: 3, pengelolaan: "Petugas lebih berhati-hati dalam pendistribusian; Membawa makanan dengan jumlah cukup agar tidak menghalangi pandangan", pic: "Kepala unit gizi" },
      { no: 4, risiko: "Keterlambatan distribusi makanan", penyebab: "Petugas tidak masuk atau terlambat datang", severity: 2, probability: 3, score: 6, grading: "Sedang", peringkat: 4, pengelolaan: "Melakukan koordinasi apabila tidak masuk atau terlambat datang", pic: "Kepala unit gizi" },
      { no: 5, risiko: "Rencana asuhan gizi pasien tidak optimal", penyebab: "Pencatatan asuhan gizi pasien lupa diisi atau tidak lengkap", severity: 5, probability: 1, score: 5, grading: "Extreme", peringkat: 5, pengelolaan: "Evaluasi untuk selalu mengisi rencana asuhan gizi pasien; Berkoordinasi dengan perawat ruangan", pic: "Kepala unit gizi" },
      { no: 6, risiko: "Kejadian keracunan", penyebab: "Makanan terkontaminasi", severity: 4, probability: 1, score: 4, grading: "Tinggi", peringkat: 6, pengelolaan: "Melakukan monitoring dan evaluasi ke jasa penyedia makanan", pic: "Kepala unit gizi" },
    ],
  },
  {
    unitTitle: "Humas & Marketing",
    matchKeys: ["humas", "marketing"],
    rows: [
      { no: 1, risiko: "Perjanjian kerja sama expired", penyebab: "Tidak melakukan pengecekan database secara rutin", severity: 3, probability: 3, score: 9, grading: "Tinggi", peringkat: 1, pengelolaan: "Melakukan pemantauan perjanjian kerja sama secara rutin setiap bulan", pic: "Kepala unit humas & marketing" },
      { no: 2, risiko: "Salah informasi jadwal praktek dokter", penyebab: "Tidak mengupdate atau menginformasikan jadwal dokter", severity: 3, probability: 3, score: 9, grading: "Tinggi", peringkat: 2, pengelolaan: "Menginformasikan apabila terjadi perubahan jadwal dokter melalui bagian pendaftaran atau media sosial Rumah Sakit", pic: "Kepala unit humas & marketing" },
      { no: 3, risiko: "Kecelakaan lalu lintas", penyebab: "Kejadian yang tidak diharapkan ketika melakukan kegiatan marketing relationship", severity: 4, probability: 2, score: 8, grading: "Tinggi", peringkat: 3, pengelolaan: "Mengecek kendaraan sebelum melakukan kegiatan marketing relationship; Berhati-hati pada saat berkendara", pic: "Kepala unit humas & marketing" },
      { no: 4, risiko: "Komplain terhadap pelayanan Rumah Sakit", penyebab: "Waktu pelayanan, sikap dan perilaku petugas Rumah Sakit dan fasilitas Rumah Sakit", severity: 1, probability: 4, score: 4, grading: "Rendah", peringkat: 4, pengelolaan: "Berkoordinasi dengan pihak atasan petugas untuk melakukan evaluasi agar meningkatkan mutu pelayanan Rumah Sakit", pic: "Kepala unit humas & marketing" },
      { no: 5, risiko: "Permintaan pungli dari LSM atau organisasi masyarakat (ORMAS)", penyebab: "Permintaan dari LSM atau organisasi masyarakat (ORMAS)", severity: 1, probability: 4, score: 4, grading: "Rendah", peringkat: 5, pengelolaan: "Efektivitas penugasan tenaga keamanan di lingkungan kantor manajemen", pic: "Kepala unit humas & marketing" },
      { no: 6, risiko: "Tidak tersampainya informasi mengenai pelayanan penunjang Rumah Sakit", penyebab: "Tidak adanya informasi yang diberikan oleh pelayanan penunjang", severity: 1, probability: 3, score: 3, grading: "Rendah", peringkat: 6, pengelolaan: "Semua pelayanan penunjang memberikan informasi apabila terdapat gangguan pelayanan dan berkoordinasi dengan humas", pic: "Kepala unit humas & marketing, pelayanan penunjang" },
    ],
  },
  {
    unitTitle: "IT",
    matchKeys: ["unit it", "informasi teknologi"],
    rows: [
      { no: 1, risiko: "Kegagalan pelayanan Rumah Sakit", penyebab: "Komputer / laptop atau printer mengalami kerusakan / error", severity: 3, probability: 4, score: 12, grading: "Tinggi", peringkat: 1, pengelolaan: "Melakukan perbaikan; Tersedianya laptop dan printer cadangan", pic: "Kepala unit IT" },
      { no: 2, risiko: "Internet mengalami gangguan", penyebab: "Masalah pada server penyedia jasa internet", severity: 2, probability: 4, score: 8, grading: "Sedang", peringkat: 2, pengelolaan: "Menghubungi penyedia jasa internet untuk segera dilakukan perbaikan", pic: "Kepala unit IT" },
      { no: 3, risiko: "SIMRS Khanza mengalami gangguan", penyebab: "Masalah pada server SIMRS", severity: 2, probability: 4, score: 8, grading: "Sedang", peringkat: 3, pengelolaan: "Melakukan perbaikan; Menghubungi penyedia SIMRS untuk konsultasi perbaikan", pic: "Kepala unit IT" },
      { no: 4, risiko: "Kegagalan fungsi CCTV", penyebab: "CCTV error atau mati", severity: 2, probability: 3, score: 6, grading: "Sedang", peringkat: 4, pengelolaan: "Pemantauan dan pemeliharaan CCTV", pic: "Kepala unit IT" },
      { no: 5, risiko: "Jatuh atau terpeleset dari tangga saat instalasi", penyebab: "Kondisi tangga tidak baik, lantai tidak rata", severity: 5, probability: 1, score: 5, grading: "Extreme", peringkat: 5, pengelolaan: "Menggunakan APD helm; Menggunakan tangga berkualitas baik; Memilih lantai yang rata", pic: "Kepala unit IT" },
      { no: 6, risiko: "Tersengat listrik saat pemasangan komputer", penyebab: "Tidak menggunakan APD", severity: 2, probability: 1, score: 2, grading: "Rendah", peringkat: 6, pengelolaan: "Menggunakan sarung tangan yang tidak menghantarkan listrik dan perlengkapan yang aman", pic: "Kepala unit IT" },
    ],
  },
  {
    unitTitle: "Pelaksanaan Keamanan Informasi",
    matchKeys: ["keamanan informasi"],
    rows: [
      { no: 1, risiko: "Kerusakan komputer", penyebab: "Human error atau komputer sudah usang", severity: 2, probability: 4, score: 8, grading: "Sedang", peringkat: 1, pengelolaan: "Menyediakan backup komputer; Pemeliharaan komputer", pic: "IT, Pengadaan" },
      { no: 2, risiko: "Komputer tidak dapat digunakan", penyebab: "Kesalahan konfigurasi atau sistem", severity: 2, probability: 4, score: 8, grading: "Sedang", peringkat: 2, pengelolaan: "Melakukan perbaikan atau mengupdate software komputer", pic: "IT" },
      { no: 3, risiko: "Kerusakan server", penyebab: "Bencana alam (gempa bumi, kebakaran, atau kehujanan)", severity: 5, probability: 1, score: 5, grading: "Extreme", peringkat: 3, pengelolaan: "Pemantauan infrastruktur ruang server; Perbaikan apabila terjadi kerusakan", pic: "IT" },
      { no: 4, risiko: "Server down", penyebab: "Listrik padam, jaringan gangguan atau komputer server error", severity: 1, probability: 4, score: 4, grading: "Sedang", peringkat: 4, pengelolaan: "Pemasangan UPS, pemantauan jaringan dan komputer server", pic: "IT, Pengadaan" },
      { no: 5, risiko: "Hilangnya komputer", penyebab: "Pencurian", severity: 3, probability: 1, score: 3, grading: "Sedang", peringkat: 5, pengelolaan: "Pengawasan dan pemantauan akses dan mengunci ruangan", pic: "IT, Security" },
      { no: 6, risiko: "Akses informasi PC secara ilegal", penyebab: "Komputer tidak diberi password", severity: 3, probability: 1, score: 3, grading: "Sedang", peringkat: 6, pengelolaan: "Memberikan password masing-masing komputer pegawai dan pantau CCTV", pic: "IT" },
      { no: 7, risiko: "Server mati", penyebab: "Server overheat", severity: 2, probability: 1, score: 2, grading: "Rendah", peringkat: 7, pengelolaan: "Dilakukan pemasangan AC pada ruangan server", pic: "IT, IPSRS, Pengadaan" },
      { no: 8, risiko: "Server overheat", penyebab: "Tidak berfungsinya AC pada ruangan Server", severity: 1, probability: 1, score: 1, grading: "Rendah", peringkat: 8, pengelolaan: "Dilakukan pengecekan rutin ruang server", pic: "IT, IPSRS" },
    ],
  },
  {
    unitTitle: "Kesehatan Lingkungan",
    matchKeys: ["kesehatan lingkungan", "kesling"],
    rows: [
      { no: 1, risiko: "Pencemaran lingkungan dan hygiene sanitasi", penyebab: "Masih terdapat kucing, tikus, kecoa, dan jentik nyamuk di lingkungan Rumah Sakit", severity: 3, probability: 5, score: 15, grading: "Tinggi", peringkat: 1, pengelolaan: "Melakukan penangkapan kucing dan direlokasi; Menambahkan saringan penutup saluran pembuangan; Merapikan ruangan; Penaburan bubuk abate dan PSN", pic: "Kepala unit kesehatan lingkungan" },
      { no: 2, risiko: "Petugas tertular penyakit", penyebab: "Petugas kebersihan terpapar limbah medis atau limbah B3", severity: 3, probability: 2, score: 6, grading: "Sedang", peringkat: 2, pengelolaan: "Petugas kebersihan menggunakan APD lengkap", pic: "Kepala unit kesehatan lingkungan" },
      { no: 3, risiko: "Petugas tertusuk benda tajam", penyebab: "Petugas kebersihan kurang berhati-hati", severity: 3, probability: 2, score: 6, grading: "Sedang", peringkat: 3, pengelolaan: "Bekerja sesuai dengan SPO; Menggunakan sarung tangan rumah tangga", pic: "Kepala unit kesehatan lingkungan" },
      { no: 4, risiko: "Terpapar cairan B3", penyebab: "Tumpahan B3 darah atau cairan lain", severity: 3, probability: 2, score: 6, grading: "Sedang", peringkat: 4, pengelolaan: "Penanganan tumpahan sesuai SPO; Penggunaan APD lengkap; Sosialisasi penanganan tumpahan B3; Penyediaan spill kit", pic: "Kepala unit kesehatan lingkungan, bagian pengadaan" },
      { no: 5, risiko: "Penyebaran penyakit", penyebab: "Terdapatnya vektor yang dapat menyebarkan penyakit", severity: 3, probability: 2, score: 6, grading: "Sedang", peringkat: 5, pengelolaan: "Melakukan pengamatan dan pengendalian vektor", pic: "Kepala unit kesehatan lingkungan" },
      { no: 6, risiko: "Terjatuh", penyebab: "Terdapat septic tank yang tidak tertutup di sekitarnya", severity: 3, probability: 2, score: 6, grading: "Sedang", peringkat: 6, pengelolaan: "Memberikan penanda atau dibuatkan pagar di sekeliling septic tank", pic: "Kepala unit kesehatan lingkungan" },
      { no: 7, risiko: "Terpeleset saat pengambilan air", penyebab: "Petugas kurang berhati-hati dalam melakukan pengambilan sampel air", severity: 2, probability: 2, score: 4, grading: "Rendah", peringkat: 7, pengelolaan: "Meningkatkan fokus dalam pelaksanaan tugas; Menggunakan alas kaki yang tidak licin", pic: "Kepala unit kesehatan lingkungan" },
    ],
  },
  {
    unitTitle: "Laboratorium",
    matchKeys: ["laboratorium", "lab"],
    rows: [
      { no: 1, risiko: "Tertusuk benda tajam", penyebab: "Melakukan recapping jarum suntik", severity: 3, probability: 3, score: 9, grading: "Tinggi", peringkat: 1, pengelolaan: "Melakukan tindakan sesuai dengan SPO; Melakukan teknik one hand jika memungkinkan; Menyediakan safety box", pic: "Kepala unit laboratorium, PPI" },
      { no: 2, risiko: "Tersetrum listrik", penyebab: "Kabel terkelupas, kerusakan listrik", severity: 4, probability: 2, score: 8, grading: "Tinggi", peringkat: 2, pengelolaan: "Memperbaiki kerusakan listrik", pic: "Kepala unit laboratorium, IPSRS" },
      { no: 3, risiko: "Salah atau sampel tertukar", penyebab: "Kesalahan identifikasi atau pelabelan", severity: 2, probability: 4, score: 8, grading: "Sedang", peringkat: 3, pengelolaan: "Melakukan identifikasi pasien dan pelabelan sampel dengan benar", pic: "Kepala unit laboratorium" },
      { no: 4, risiko: "Pengulangan pengambilan sampel", penyebab: "Sampel tidak dapat terbaca", severity: 2, probability: 4, score: 8, grading: "Sedang", peringkat: 4, pengelolaan: "Melakukan pengambilan sampel ulang", pic: "Kepala unit laboratorium" },
      { no: 5, risiko: "Kegagalan fungsi alat pemeriksaan error akibat kepanasan", penyebab: "AC tidak menyala, AC bocor", severity: 2, probability: 4, score: 8, grading: "Sedang", peringkat: 5, pengelolaan: "Koordinasi dengan IPSRS untuk perbaikan", pic: "Kepala unit laboratorium, IPSRS" },
      { no: 6, risiko: "Hasil keluar lambat", penyebab: "Komputer sudah lambat", severity: 2, probability: 4, score: 8, grading: "Sedang", peringkat: 6, pengelolaan: "Pengadaan komputer", pic: "Kepala unit laboratorium, bagian pengadaan" },
      { no: 7, risiko: "Risiko tertular penyakit", penyebab: "Tidak menggunakan APD saat melakukan tindakan", severity: 3, probability: 2, score: 6, grading: "Sedang", peringkat: 7, pengelolaan: "Menggunakan APD pada saat melakukan tindakan; Melaksanakan 5 momen hand hygiene", pic: "Kepala unit laboratorium" },
      { no: 8, risiko: "Alat tidak dapat digunakan", penyebab: "Alat error", severity: 2, probability: 3, score: 6, grading: "Sedang", peringkat: 8, pengelolaan: "Melakukan maintenance alat secara berkala", pic: "Kepala unit laboratorium, penanggung jawab alat" },
      { no: 9, risiko: "Kegagalan fungsi listrik", penyebab: "Kerusakan saluran listrik", severity: 2, probability: 3, score: 6, grading: "Sedang", peringkat: 9, pengelolaan: "Pengecekan saluran listrik", pic: "Kepala unit laboratorium, IPSRS" },
      { no: 10, risiko: "Terpeleset", penyebab: "Lantai licin", severity: 2, probability: 2, score: 4, grading: "Rendah", peringkat: 10, pengelolaan: "Menjaga lantai selalu kering; Memasang tanda apabila sedang melakukan pembersihan", pic: "Kepala unit laboratorium, petugas kebersihan" },
      { no: 11, risiko: "Gagal pengambilan darah", penyebab: "Kesulitan menemukan pembuluh kecil atau tersembunyi", severity: 1, probability: 3, score: 3, grading: "Sedang", peringkat: 11, pengelolaan: "Melakukan edukasi kepada pasien dan keluarga pasien tentang pengambilan darah; Melakukan tindakan sesuai dengan SPO", pic: "Kepala unit laboratorium" },
    ],
  },
  {
    unitTitle: "Pendaftaran",
    matchKeys: ["pendaftaran"],
    rows: [
      { no: 1, risiko: "Pasien tidak mempunyai BPJS / BPJS tidak aktif", penyebab: "Pasien belum mengurus BPJS", severity: 2, probability: 5, score: 10, grading: "Sedang", peringkat: 1, pengelolaan: "Mengedukasi pasien / pendampingan untuk pengurusan BPJS", pic: "Penanggung jawab pendaftaran" },
      { no: 2, risiko: "Internet mengalami gangguan", penyebab: "Masalah pada server penyedia jasa internet", severity: 1, probability: 5, score: 5, grading: "Sedang", peringkat: 2, pengelolaan: "Menghubungi unit IT untuk segera dilakukan perbaikan", pic: "Penanggung jawab pendaftaran, IT" },
      { no: 3, risiko: "Kesalahan penginputan data pasien seperti nama, tanggal lahir, jenis kelamin atau tujuan poli", penyebab: "Petugas terburu-buru pada saat mendaftarkan, petugas tidak fokus", severity: 1, probability: 4, score: 4, grading: "Sedang", peringkat: 3, pengelolaan: "Melakukan verifikasi mengenai data pasien dengan benar", pic: "Penanggung jawab pendaftaran" },
      { no: 4, risiko: "Kegagalan pelayanan", penyebab: "Komputer / laptop atau perangkat pendukung mengalami gangguan", severity: 1, probability: 4, score: 4, grading: "Sedang", peringkat: 4, pengelolaan: "Menghubungi unit IT untuk melakukan perbaikan", pic: "Penanggung jawab pendaftaran, IT" },
      { no: 5, risiko: "Kekerasan verbal", penyebab: "IGD penuh", severity: 1, probability: 4, score: 4, grading: "Sedang", peringkat: 5, pengelolaan: "Mengedukasi pasien mengenai kondisi IGD", pic: "Penanggung jawab pendaftaran" },
      { no: 6, risiko: "Kelelahan mata", penyebab: "Menatap layar komputer atau gadget terlalu lama", severity: 1, probability: 4, score: 4, grading: "Sedang", peringkat: 6, pengelolaan: "Melakukan istirahat mata dengan teknik rileks mata 20-20-20", pic: "Penanggung jawab pendaftaran" },
      { no: 7, risiko: "SIMRS Khanza mengalami gangguan", penyebab: "Masalah pada server penyedia SIMRS", severity: 1, probability: 4, score: 4, grading: "Sedang", peringkat: 7, pengelolaan: "Menghubungi unit IT untuk melakukan perbaikan atau unit IT menghubungi penyedia SIMRS", pic: "Penanggung jawab pendaftaran, IT" },
    ],
  },
  {
    unitTitle: "PKRS",
    matchKeys: ["pkrs"],
    rows: [
      { no: 1, risiko: "Kelelahan mata", penyebab: "Bekerja di depan komputer dalam waktu lama, paparan radiasi dari komputer atau hp", severity: 3, probability: 4, score: 12, grading: "Tinggi", peringkat: 1, pengelolaan: "Mengatur waktu penggunaan dan istirahat; Mengusulkan anti radiasi layar; Teknik rileks mata 20-20-20", pic: "Kepala unit PKRS" },
      { no: 2, risiko: "Tersengat listrik", penyebab: "Adanya korsleting pada alat atau listrik, adanya kabel yang terbuka", severity: 3, probability: 2, score: 6, grading: "Sedang", peringkat: 2, pengelolaan: "Memastikan alat dan kabel yang digunakan dalam keadaan baik", pic: "Kepala unit PKRS" },
      { no: 3, risiko: "Petugas tertular penyakit", penyebab: "Interaksi dengan pasien pada saat melakukan penyuluhan", severity: 2, probability: 3, score: 6, grading: "Sedang", peringkat: 3, pengelolaan: "Petugas menggunakan APD (Masker); Petugas menerapkan hand hygiene", pic: "Kepala unit PKRS" },
      { no: 4, risiko: "Materi morning talk yang diberikan tidak tersampaikan dengan baik", penyebab: "Lingkungan penyampaian materi morning talk tidak kondusif", severity: 1, probability: 5, score: 5, grading: "Sedang", peringkat: 4, pengelolaan: "Mengusulkan tempat baru untuk menyampaikan materi morning talk", pic: "Kepala unit PKRS" },
      { no: 5, risiko: "Gangguan jaringan internet", penyebab: "Tidak stabilnya jaringan internet, gangguan dari provider", severity: 1, probability: 4, score: 4, grading: "Sedang", peringkat: 5, pengelolaan: "Menghubungi pihak provider untuk perbaikan jaringan; Mengusulkan penambahan kecepatan internet", pic: "Kepala unit PKRS" },
      { no: 6, risiko: "Narasumber untuk pojkes terlambat atau tidak datang", penyebab: "Macet, halangan lain", severity: 1, probability: 2, score: 2, grading: "Rendah", peringkat: 6, pengelolaan: "Mengingatkan narasumber H-1 sebelum kegiatan pojkes", pic: "Kepala unit PKRS" },
    ],
  },
  {
    unitTitle: "PPI",
    matchKeys: ["ppi"],
    rows: [
      { no: 1, risiko: "Kejadian phlebitis", penyebab: "Ketidaktepatan pada saat melakukan insersi, tidak melakukan perawatan infus", severity: 3, probability: 4, score: 12, grading: "Tinggi", peringkat: 1, pengelolaan: "Menerapkan bundles insersi PLABSI dan maintenance PLABSI", pic: "PPI" },
      { no: 2, risiko: "Penyebaran air borne infeksi di IGD", penyebab: "Ketidakpatuhan petugas memakai APD", severity: 3, probability: 3, score: 9, grading: "Tinggi", peringkat: 2, pengelolaan: "Memakai APD sesuai dengan jenis penyebaran infeksi", pic: "PPI" },
      { no: 3, risiko: "Penularan penyakit", penyebab: "Ketidakpatuhan petugas dalam mencuci tangan dengan teknik 5 waktu", severity: 3, probability: 2, score: 6, grading: "Sedang", peringkat: 3, pengelolaan: "Melakukan hand hygiene dengan 5 moment dan 6 langkah", pic: "PPI" },
      { no: 4, risiko: "Petugas tertusuk jarum atau benda tajam bekas pasien", penyebab: "Melakukan recapping jarum suntik", severity: 2, probability: 3, score: 6, grading: "Sedang", peringkat: 4, pengelolaan: "Melakukan teknik one hand jika memungkinkan", pic: "PPI" },
      { no: 5, risiko: "Kurang lengkapnya APD di tiap unit", penyebab: "APD belum terinventarisir", severity: 2, probability: 1, score: 2, grading: "Rendah", peringkat: 5, pengelolaan: "Inventarisir APD di setiap unit", pic: "PPI" },
      { no: 6, risiko: "Kejadian IDO", penyebab: "Petugas tidak melakukan perawatan luka dengan teknik aseptik, ruangan IBS tidak melakukan general cleaning berkala", severity: 2, probability: 1, score: 2, grading: "Rendah", peringkat: 6, pengelolaan: "Bundles IDO", pic: "PPI" },
      { no: 7, risiko: "Kejadian ISK", penyebab: "Pada saat pemasangan kateter petugas tidak menerapkan teknik aseptik", severity: 1, probability: 2, score: 2, grading: "Rendah", peringkat: 7, pengelolaan: "Bundles ISK", pic: "PPI" },
    ],
  },
  {
    unitTitle: "Radiologi",
    matchKeys: ["radiologi"],
    rows: [
      { no: 1, risiko: "Alat tidak dapat digunakan", penyebab: "Alat error", severity: 4, probability: 3, score: 12, grading: "Extreme", peringkat: 1, pengelolaan: "Maintenance alat secara berkala", pic: "Kepala unit radiologi" },
      { no: 2, risiko: "Kejadian tersengat listrik", penyebab: "Kabel alat terkelupas, aliran pendek arus listrik", severity: 5, probability: 2, score: 10, grading: "Extreme", peringkat: 2, pengelolaan: "Melakukan pengecekan instalasi listrik secara berkala", pic: "Kepala unit radiologi" },
      { no: 3, risiko: "Terpapar radiasi", penyebab: "Dalam melakukan pemeriksaan petugas tidak menggunakan apron dan tidak menggunakan TLD", severity: 2, probability: 5, score: 10, grading: "Sedang", peringkat: 3, pengelolaan: "Menggunakan apron dan TLD untuk mengetahui paparan radiasi yang diterima petugas", pic: "Kepala unit radiologi" },
      { no: 4, risiko: "Risiko tertular penyakit", penyebab: "Tidak menggunakan APD pada saat melakukan tindakan", severity: 3, probability: 2, score: 6, grading: "Sedang", peringkat: 4, pengelolaan: "Menggunakan APD pada saat melakukan pemeriksaan", pic: "Kepala unit radiologi" },
      { no: 5, risiko: "Kesalahan menyampaikan hasil radiologi", penyebab: "Petugas salah memberikan hasil pemeriksaan radiologi", severity: 1, probability: 5, score: 5, grading: "Sedang", peringkat: 5, pengelolaan: "Selalu mencocokkan identitas pasien sebelum menyerahkan", pic: "Kepala unit radiologi" },
      { no: 6, risiko: "Kesalahan pemeriksaan pasien", penyebab: "Petugas tidak melakukan identifikasi pasien dengan benar", severity: 1, probability: 3, score: 3, grading: "Rendah", peringkat: 6, pengelolaan: "Melakukan identifikasi pasien sesuai dengan SPO", pic: "Kepala unit radiologi" },
      { no: 7, risiko: "Kesalahan penempatan marker", penyebab: "Petugas kurang teliti saat pemasangan marker", severity: 1, probability: 3, score: 3, grading: "Rendah", peringkat: 7, pengelolaan: "Melakukan tindakan pemasangan marker sesuai SPO dan anatomi tubuh pasien", pic: "Kepala unit radiologi" },
    ],
  },
  {
    unitTitle: "Rekam Medis",
    matchKeys: ["rekam medis", "rm"],
    rows: [
      { no: 1, risiko: "Kelengkapan rekam medis yang kurang", penyebab: "DPJP tidak atau telat mengisi diagnosis pasien", severity: 4, probability: 5, score: 20, grading: "Extreme", peringkat: 1, pengelolaan: "Koordinasi dengan petugas ruang rawat inap untuk selalu mengingatkan DPJP dalam pengisian diagnosis", pic: "Kepala unit rekam medis" },
      { no: 2, risiko: "Kerusakan dokumen rekam medis", penyebab: "Kondisi ruangan yang lembab, rak terlalu dekat dengan tembok dan dokumen yang sudah terlalu banyak", severity: 3, probability: 5, score: 15, grading: "Tinggi", peringkat: 2, pengelolaan: "Atur ulang tata letak rak penyimpanan; Penambahan rak penyimpanan", pic: "Kepala unit rekam medis" },
      { no: 3, risiko: "Kerusakan tempat penyimpanan dan dokumen rekam medis", penyebab: "Adanya kebocoran pada atap ruang rekam medis", severity: 4, probability: 3, score: 12, grading: "Extreme", peringkat: 3, pengelolaan: "Melakukan monitoring ruangan rekam medis; Melakukan perbaikan atap yang bocor", pic: "Kepala unit rekam medis" },
      { no: 4, risiko: "Rekam medis hilang", penyebab: "Salah penyimpanan berkas rekam medis", severity: 3, probability: 4, score: 12, grading: "Tinggi", peringkat: 4, pengelolaan: "Ketaatan penyimpanan rekam medis dan meningkatkan ketelitian", pic: "Kepala unit rekam medis" },
      { no: 5, risiko: "Petugas tertimpa berkas atau rak penyimpanan", penyebab: "Ruangan yang sudah terlalu penuh, rak penyimpanan sudah rapuh", severity: 2, probability: 4, score: 8, grading: "Sedang", peringkat: 5, pengelolaan: "Penambahan ruangan rekam medis; Penambahan rak penyimpanan", pic: "Kepala unit rekam medis" },
      { no: 6, risiko: "Pemberian nomor rekam medis yang sama atau ganda", penyebab: "Nomor RM belum terinput di SIMRS, sistem SIMRS error, kesalahan petugas", severity: 1, probability: 4, score: 4, grading: "Sedang", peringkat: 6, pengelolaan: "Menginventarisir berkas RM dan menggabungkan datanya; Selalu mengecek identitas pasien", pic: "Kepala unit rekam medis" },
      { no: 7, risiko: "Keterlambatan penyediaan rekam medis pasien", penyebab: "Rekam medis tidak ada di tempat karena belum dilakukan pengembalian", severity: 1, probability: 2, score: 2, grading: "Rendah", peringkat: 7, pengelolaan: "Melakukan monitor pengembalian rekam medis", pic: "Kepala unit rekam medis" },
    ],
  },
  {
    unitTitle: "Manajemen",
    matchKeys: ["manajemen", "keuangan", "kasir", "casemix"],
    rows: [
      { no: 1, risiko: "Kelelahan mata", penyebab: "Menatap layar komputer atau gadget terlalu lama", severity: 3, probability: 4, score: 9, grading: "Tinggi", peringkat: 1, pengelolaan: "Melakukan istirahat mata dengan teknik rileks mata 20-20-20", pic: "Manajemen" },
      { no: 2, risiko: "Sakit leher atau badan bagian belakang", penyebab: "Duduk terlalu lama pada saat bekerja", severity: 3, probability: 3, score: 9, grading: "Tinggi", peringkat: 2, pengelolaan: "Meluangkan waktu istirahat setiap 30-60 menit untuk peregangan dan memperbanyak konsumsi air", pic: "Manajemen" },
      { no: 3, risiko: "Keterlambatan pembayaran klaim oleh pemerintah atau pihak asuransi", penyebab: "Menunggu anggaran perubahan atau kendala internal pihak pembayar", severity: 3, probability: 2, score: 6, grading: "Sedang", peringkat: 3, pengelolaan: "Melakukan advokasi oleh pimpinan kepada pemerintah atau pihak pembayar", pic: "Manajemen" },
      { no: 4, risiko: "Data hilang", penyebab: "Kegagalan fungsi komputer, komputer terkena virus", severity: 2, probability: 3, score: 6, grading: "Sedang", peringkat: 4, pengelolaan: "Melakukan backup data berkala", pic: "Manajemen" },
      { no: 5, risiko: "Pengarsipan yang tidak tepat (kehilangan arsip)", penyebab: "Kurang ketelitian petugas dalam melakukan pengarsipan", severity: 2, probability: 3, score: 6, grading: "Sedang", peringkat: 5, pengelolaan: "Selalu teliti dalam penyimpanan berkas", pic: "Manajemen" },
      { no: 6, risiko: "Dilema etik non klinis (ketidakmampuan pasien memenuhi biaya RS)", penyebab: "Belum adanya SPO metode pembayaran untuk pasien tidak mampu", severity: 2, probability: 3, score: 6, grading: "Sedang", peringkat: 6, pengelolaan: "Menyusun SOP metode pembayaran bagi pasien yang tidak mampu", pic: "Kepala unit kasir" },
      { no: 7, risiko: "Terlambatnya pengiriman klaim asuransi sosial, komersial / rekanan", penyebab: "Berkas klaim terlambat diserahkan unit ke bagian casemix", severity: 2, probability: 3, score: 6, grading: "Sedang", peringkat: 7, pengelolaan: "Menerapkan aturan one day service untuk berkas klaim diserahkan ke unit casemix", pic: "Pengelola casemix" },
      { no: 8, risiko: "Ketidaktelitian verifikasi jenis cara bayar pasien", penyebab: "Petugas tidak memahami ketentuan kriteria pasien per cara bayar", severity: 1, probability: 4, score: 4, grading: "Sedang", peringkat: 8, pengelolaan: "Pelatihan berkala peraturan penjaminan peserta; Selalu teliti saat penerimaan administrasi", pic: "Kepala unit RM dan pendaftaran" },
      { no: 9, risiko: "Proses pembayaran di kasir terlambat", penyebab: "Petugas ruangan terlambat input tindakan", severity: 1, probability: 4, score: 4, grading: "Sedang", peringkat: 9, pengelolaan: "Petugas kasir mengingatkan perawat secara berkala untuk input tindakan setiap hari", pic: "Kepala unit kasir" },
      { no: 10, risiko: "Double Charged biaya kepada pasien", penyebab: "Kurang telitinya perawat dalam menginput tindakan dan kasir tidak cek ulang", severity: 1, probability: 4, score: 4, grading: "Sedang", peringkat: 10, pengelolaan: "Petugas kasir mengecek print out billing dan konfirmasi ke perawat jika ada kejanggalan", pic: "Kepala unit kasir" },
      { no: 11, risiko: "Kesalahan menghitung jumlah uang setoran atau kembalian", penyebab: "Tidak memiliki alat hitung uang otomatis", severity: 1, probability: 4, score: 4, grading: "Sedang", peringkat: 11, pengelolaan: "Penghitungan secara berulang; Pengadaan alat hitung uang otomatis", pic: "Kepala unit kasir, bagian pengadaan" },
      { no: 12, risiko: "Pasien pulang sebelum menyelesaikan administrasi/pembayaran (kabur)", penyebab: "Kurangnya pemahaman alur pelayanan, pasien tidak membawa uang", severity: 1, probability: 4, score: 4, grading: "Sedang", peringkat: 12, pengelolaan: "Pemasangan alur pelayanan; Mencatat lengkap nomor HP & alamat pasien untuk follow up", pic: "Kepala unit kasir" },
      { no: 13, risiko: "Kesalahan menentukan tarif ambulans", penyebab: "Tidak memahami formulasi perhitungan tarif ambulans", severity: 1, probability: 4, score: 4, grading: "Sedang", peringkat: 13, pengelolaan: "Monitoring dan evaluasi terhadap SOP perhitungan tarif ambulans", pic: "Kepala unit kasir" },
      { no: 14, risiko: "Perhitungan tarif dan biaya per unit tidak sesuai", penyebab: "Belum dilakukan perhitungan unit cost untuk menentukan tarif tindakan", severity: 1, probability: 4, score: 4, grading: "Sedang", peringkat: 14, pengelolaan: "Menyusun tim untuk menghitung unit cost tindakan pelayanan", pic: "Manajemen" },
      { no: 15, risiko: "SPJ Belum lengkap", penyebab: "Penyedia terlambat melengkapi dokumen pembayaran", severity: 1, probability: 4, score: 4, grading: "Sedang", peringkat: 15, pengelolaan: "Menentukan dan menginformasikan batas waktu pemberkasan pembayaran kepada penyedia", pic: "Pengelola keuangan" },
      { no: 16, risiko: "Tidak terpenuhinya permintaan investasi alat medis", penyebab: "Anggaran tidak tersedia", severity: 1, probability: 4, score: 4, grading: "Sedang", peringkat: 16, pengelolaan: "Melakukan perencanaan yang baik tahun sebelum anggaran disahkan", pic: "Pengelola perencanaan" },
      { no: 17, risiko: "Pemesanan Barang Cetakan yang selalu ganti isi/konten", penyebab: "Ketidaktelitian unit dalam menyusun dokumen untuk cetak", severity: 1, probability: 4, score: 4, grading: "Sedang", peringkat: 17, pengelolaan: "Pembahasan dokumen cetak disetujui tim rekam medik sebelum dikirim ke pengadaan", pic: "Unit terkait" },
      { no: 18, risiko: "Berkas klaim tidak layak", penyebab: "Diagnosa tidak sesuai atau tidak dilengkapi hasil penunjang diagnostik", severity: 1, probability: 4, score: 4, grading: "Sedang", peringkat: 18, pengelolaan: "Koder dan pengaju klaim memeriksa berkas pengajuan klaim lebih teliti", pic: "Pengelola casemix" },
      { no: 19, risiko: "Komputer rusak", penyebab: "Kegagalan fungsi komputer, komputer terkena virus", severity: 1, probability: 3, score: 3, grading: "Rendah", peringkat: 19, pengelolaan: "Melakukan backup data berkala; Memperbaiki kerusakan software atau hardware", pic: "Manajemen" },
      { no: 20, risiko: "Kesalahan Pencatatan Kas keluar dan Kas Masuk", penyebab: "Pencatatan Kas keluar dan Kas Masuk masih manual", severity: 1, probability: 3, score: 3, grading: "Rendah", peringkat: 20, pengelolaan: "Petugas harus lebih teliti dalam melakukan pembukuan keuangan", pic: "Kepala unit kasir" },
      { no: 21, risiko: "Kompetensi hasil seleksi pegawai di bawah standar", penyebab: "Proses seleksi terburu-buru dan tanpa perencanaan", severity: 1, probability: 3, score: 3, grading: "Rendah", peringkat: 21, pengelolaan: "Melakukan mapping pegawai dan menyusun rencana kebutuhan SDM sesuai kompetensi", pic: "Pengelola kepegawaian" },
      { no: 22, risiko: "Penjaminan akhir ditolak", penyebab: "Ketidaktelitian petugas dalam menentukan diagnosa dan kelengkapan penunjang klaim", severity: 1, probability: 3, score: 3, grading: "Rendah", peringkat: 22, pengelolaan: "Koder dan pengaju klaim memeriksa berkas pengajuan klaim lebih teliti", pic: "Pengelola casemix" },
      { no: 23, risiko: "Keterlambatan pembayaran gaji / jasa pelayanan", penyebab: "Keterlambatan perhitungan absensi, skoring atau grading dari unit terkait", severity: 1, probability: 2, score: 2, grading: "Rendah", peringkat: 23, pengelolaan: "Menentukan batas waktu pengumpulan absensi dan skoring/grading dari unit terkait", pic: "Pengelola keuangan" },
      { no: 24, risiko: "Adanya uang palsu yang diterima oleh kasir", penyebab: "Tidak memiliki alat pendeteksi uang palsu", severity: 1, probability: 1, score: 1, grading: "Rendah", peringkat: 24, pengelolaan: "Selalu mengecek uang secara visual, diraba, dan diterawang", pic: "Kepala unit kasir" },
    ],
  },
  {
    unitTitle: "Gudang Umum",
    matchKeys: ["gudang umum", "gudang"],
    rows: [
      { no: 1, risiko: "Jatuh pada saat penyimpanan barang", penyebab: "Tangga atau pijakan tidak kokoh, lantai licin", severity: 3, probability: 2, score: 6, grading: "Sedang", peringkat: 1, pengelolaan: "Memastikan tumpuan pijakan kokoh; Lantai tidak licin dan area tidak ada penghalang", pic: "Pelaksana gudang umum" },
      { no: 2, risiko: "Cedera punggung", penyebab: "Salah cara dalam mengangkat barang", severity: 2, probability: 3, score: 6, grading: "Sedang", peringkat: 2, pengelolaan: "Melakukan cara pengangkatan beban yang benar", pic: "Pelaksana gudang umum" },
      { no: 3, risiko: "Kejatuhan atau tertimpa barang", penyebab: "Barang terlalu banyak", severity: 2, probability: 2, score: 4, grading: "Rendah", peringkat: 3, pengelolaan: "Melakukan penataan barang yang rapi dan tersusun; Memasang tanda risiko awas barang jatuh", pic: "Pelaksana gudang umum" },
      { no: 4, risiko: "Salah dalam pendistribusian barang", penyebab: "Keliru dalam memberikan barang", severity: 2, probability: 2, score: 4, grading: "Rendah", peringkat: 4, pengelolaan: "Selalu pengecekan unit yang melakukan pemesanan sebelum pendistribusian barang", pic: "Pelaksana gudang umum" },
      { no: 5, risiko: "Kehilangan barang", penyebab: "Ketika melakukan pendistribusian barang ke ruangan", severity: 2, probability: 2, score: 4, grading: "Rendah", peringkat: 5, pengelolaan: "Selalu mengunci ruangan apabila sedang melakukan pendistribusian", pic: "Pelaksana gudang umum" },
    ],
  },
  {
    unitTitle: "IPSRS",
    matchKeys: ["ipsrs"],
    rows: [
      { no: 1, risiko: "Tertimpa benda", penyebab: "Petugas terburu-buru tidak fokus, Petugas tidak menggunakan APD", severity: 3, probability: 4, score: 12, grading: "Tinggi", peringkat: 1, pengelolaan: "Petugas lebih berhati-hati; Petugas menggunakan APD", pic: "Kepala IPSRS" },
      { no: 2, risiko: "Kegagalan fungsi air", penyebab: "Mengalami kerusakan mesin, korsleting listrik", severity: 2, probability: 4, score: 8, grading: "Sedang", peringkat: 2, pengelolaan: "Melakukan pengecekan rutin; Melakukan perbaikan jika terjadi kerusakan", pic: "Kepala IPSRS" },
      { no: 3, risiko: "Kegagalan fungsi gas medis", penyebab: "Gas medis habis, kebocoran saluran pipa gas medis", severity: 3, probability: 3, score: 9, grading: "Tinggi", peringkat: 3, pengelolaan: "Memastikan ketersediaan gas medis cadangan; Pemantauan dan pemeliharaan sistem gas medis", pic: "Kepala IPSRS" },
      { no: 4, risiko: "Tertusuk benda tajam", penyebab: "Petugas terburu-buru atau tidak sengaja tertusuk benda tajam, tidak menggunakan APD", severity: 2, probability: 4, score: 8, grading: "Sedang", peringkat: 4, pengelolaan: "Petugas lebih berhati-hati; Petugas menggunakan APD", pic: "Kepala IPSRS" },
      { no: 5, risiko: "Kegagalan fungsi AC", penyebab: "AC error atau tidak dingin atau kesalahan orang karena lupa menutup pintu/jendela", severity: 2, probability: 4, score: 8, grading: "Sedang", peringkat: 5, pengelolaan: "Melakukan pemantauan fungsi; Membuat jadwal rutin perawatan AC", pic: "Kepala IPSRS" },
      { no: 6, risiko: "Tersengat listrik", penyebab: "Petugas tidak menggunakan APD", severity: 5, probability: 1, score: 5, grading: "Extreme", peringkat: 6, pengelolaan: "Petugas menggunakan APD dalam melakukan perbaikan", pic: "Kepala IPSRS" },
      { no: 7, risiko: "Listrik padam sehingga mengganggu pelayanan", penyebab: "Generator set tidak berfungsi", severity: 1, probability: 4, score: 4, grading: "Sedang", peringkat: 7, pengelolaan: "Membuat jadwal pengecekan dan perawatan; Melakukan perbaikan jika terjadi kerusakan", pic: "Kepala IPSRS" },
    ],
  },
  {
    unitTitle: "Petugas Kebersihan",
    matchKeys: ["kebersihan", "cleaning"],
    rows: [
      { no: 1, risiko: "Penularan penyakit", penyebab: "Tidak menggunakan APD pada saat melakukan pembersihan", severity: 3, probability: 3, score: 9, grading: "Tinggi", peringkat: 1, pengelolaan: "Penggunaan APD; Pengajuan untuk pemeriksaan kesehatan rutin 6 bulan sekali", pic: "Kepala unit kebersihan" },
      { no: 2, risiko: "Nyeri punggung", penyebab: "Melakukan kegiatan pembersihan secara manual (jongkok/membungkuk) dan luas area kerja", severity: 2, probability: 4, score: 8, grading: "Tinggi", peringkat: 2, pengelolaan: "Pengajuan alat mesin untuk kegiatan pembersihan", pic: "Kepala unit kebersihan" },
      { no: 3, risiko: "Petugas tertusuk benda tajam", penyebab: "Petugas kebersihan kurang berhati-hati", severity: 3, probability: 2, score: 6, grading: "Sedang", peringkat: 3, pengelolaan: "Bekerja sesuai dengan SPO; Menggunakan sarung tangan rumah tangga", pic: "Kepala unit kesehatan lingkungan" },
      { no: 4, risiko: "Terpeleset", penyebab: "Pada saat melakukan pembersihan toilet", severity: 3, probability: 2, score: 6, grading: "Sedang", peringkat: 4, pengelolaan: "Penggunaan APD (masker, sepatu safety anti licin)", pic: "Kepala unit kebersihan, pengadaan" },
    ],
  },
];

export interface PriorityRiskSummaryRow {
  no: number;
  pemilik: string;
  prioritas: string;
  penyebab: string;
  pengendalian: string;
  status: string;
  pj: string;
}

export const PRIORITY_RISK_SUMMARY_ROWS: PriorityRiskSummaryRow[] = [
  { no: 1, pemilik: "Intensive Care Unit (ICU)", prioritas: "Pemasangan infus yang berulang", penyebab: "Kesulitan menemukan pembuluh darah vena", pengendalian: "Melakukan edukasi kepada pasien dan keluarga tentang perawatan infus", status: "Terlaksana Berkelanjutan", pj: "Kepala unit ICU" },
  { no: 2, pemilik: "Instalasi Bedah Sentral (IBS)", prioritas: "Operasi terhenti", penyebab: "Listrik padam", pengendalian: "Pastikan pemeliharaan generator set dan UPS, koordinasi dengan IPSRS", status: "Terlaksana Berkelanjutan", pj: "Kepala IBS, IPSRS" },
  { no: 3, pemilik: "Instalasi Gawat Darurat", prioritas: "Kelelahan", penyebab: "Penuhnya pasien, kekurangan SDM", pengendalian: "Penambahan SDM", status: "Dalam Proses Pengajuan", pj: "Kepala IGD, Kepegawaian" },
  { no: 4, pemilik: "Rawat inap kebidanan (Khadijah)", prioritas: "DPJP telat atau tidak melakukan visite", penyebab: "Kesibukan, macet atau halangan lain", pengendalian: "Membuat jadwal jam visite DPJP, menghubungi DPJP H-1 terkait jadwal visite, konsultasi via WhatsApp", status: "Terlaksana Berkelanjutan", pj: "Kepala unit rawat inap kebidanan" },
  { no: 5, pemilik: "Rawat inap gabungan (Aisyah)", prioritas: "Kurangnya kebersihan ruangan / toilet", penyebab: "Kurangnya SDM, kurangnya monitoring hasil kerja petugas kebersihan", pengendalian: "Meningkatkan pelaksanaan monitoring hasil kebersihan, penambahan SDM", status: "Dalam Pemantauan", pj: "Kepala unit rawat inap gabung, Kesehatan lingkungan, Kepegawaian" },
  { no: 6, pemilik: "Rawat inap dewasa (Fatimah)", prioritas: "Kurangnya kebersihan ruangan / toilet", penyebab: "Kurangnya SDM, kurangnya monitoring hasil kerja petugas kebersihan", pengendalian: "Meningkatkan pelaksanaan monitoring hasil kebersihan, penambahan SDM", status: "Dalam Pemantauan", pj: "Kepala unit rawat inap dewasa, Kesehatan lingkungan, Kepegawaian" },
  { no: 7, pemilik: "Rawat inap Usman", prioritas: "Risiko tertular penyakit", penyebab: "Kurangnya kepatuhan dalam melakukan hand hygiene dan penggunaan APD", pengendalian: "Motivasi petugas untuk selalu melakukan hand hygiene dan penggunaan APD", status: "Terlaksana Berkelanjutan", pj: "Kepala unit rawat inap Usman" },
  { no: 8, pemilik: "Rawat Jalan", prioritas: "Kerusakan mata (poli gigi)", penyebab: "Lightcure belum ada kaca pelindung", pengendalian: "Permintaan pengadaan kaca pelindung untuk penggunaan lightcure", status: "Dalam Proses Pengadaan", pj: "Kepala unit rawat jalan, Pengadaan" },
  { no: 9, pemilik: "Ambulance", prioritas: "Pasien jatuh pada saat pemindahan", penyebab: "Brankar ambulance rujuk pasien tidak berfungsi dengan baik, cara pemindahan tidak sesuai SPO", pengendalian: "Melakukan pengecekan terhadap brankar ambulance, bekerja sesuai SPO", status: "Terlaksana Berkelanjutan", pj: "Kepala unit ambulance" },
  { no: 10, pemilik: "CSSD", prioritas: "Terkena alat panas", penyebab: "Tidak menggunakan APD", pengendalian: "Penggunaan APD", status: "Terlaksana Berkelanjutan", pj: "Kepala unit CSSD" },
  { no: 11, pemilik: "Farmasi", prioritas: "Kesalahan pemberian obat-obat LASA dan high alert tanpa label", penyebab: "Tidak semua shift double check pada saat pelayanan", pengendalian: "SDM sesuai standar (1 shift terdiri dari 2 orang) untuk double check sebelum penyerahan obat", status: "Terlaksana Berkelanjutan", pj: "Kepala instalasi farmasi" },
  { no: 12, pemilik: "Gizi", prioritas: "Komplain pasien terhadap makanan", penyebab: "Ketidakpuasan pasien terhadap rasa makanan", pengendalian: "Melakukan monitoring dan evaluasi ke jasa penyedia makanan", status: "Terlaksana Berkelanjutan", pj: "Kepala unit gizi" },
  { no: 13, pemilik: "Humas & Marketing", prioritas: "Perjanjian kerja sama expired", penyebab: "Tidak melakukan pengecekan database secara rutin", pengendalian: "Melakukan pemantauan perjanjian kerja sama secara rutin setiap bulan", status: "Terlaksana Berkelanjutan", pj: "Kepala unit humas & marketing" },
  { no: 14, pemilik: "IT", prioritas: "Kegagalan pelayanan Rumah Sakit", penyebab: "Komputer / laptop atau printer mengalami kerusakan / error", pengendalian: "Melakukan perbaikan, tersedianya laptop dan printer cadangan", status: "Terlaksana Berkelanjutan", pj: "Kepala unit IT, Pengadaan" },
  { no: 15, pemilik: "Keamanan Informasi", prioritas: "Kerusakan komputer", penyebab: "Human error atau komputer sudah usang", pengendalian: "Menyediakan backup komputer, pemeliharaan komputer", status: "Terlaksana Berkelanjutan", pj: "Kepala unit IT, Pengadaan" },
  { no: 16, pemilik: "Kesehatan lingkungan", prioritas: "Pencemaran lingkungan dan hygiene sanitasi", penyebab: "Masih terdapat kucing, tikus, kecoa, dan jentik nyamuk di lingkungan RS", pengendalian: "Relokasi kucing, pemasangan saringan pembuangan, perapian ruangan, penaburan bubuk abate dan PSN", status: "Terlaksana Berkelanjutan", pj: "Kepala unit kesehatan lingkungan" },
  { no: 17, pemilik: "Laboratorium", prioritas: "Tertusuk benda tajam", penyebab: "Melakukan recapping jarum suntik", pengendalian: "Melakukan tindakan sesuai SPO, teknik one hand jika memungkinkan, penyediaan safety box", status: "Terlaksana Berkelanjutan", pj: "Kepala unit laboratorium, PPI" },
  { no: 18, pemilik: "Pendaftaran", prioritas: "Pasien tidak mempunyai BPJS / BPJS tidak aktif", penyebab: "Pasien belum mengurus BPJS", pengendalian: "Mengedukasi pasien / pendampingan untuk pengurusan BPJS", status: "Terlaksana Berkelanjutan", pj: "Penanggungjawab pendaftaran" },
  { no: 19, pemilik: "PKRS", prioritas: "Kelelahan mata", penyebab: "Bekerja di depan komputer dalam waktu lama, paparan radiasi layar", pengendalian: "Pengaturan waktu istirahat, usulan anti radiasi layar, teknik rileks mata 20-20-20", status: "Terlaksana Berkelanjutan", pj: "Kepala unit PKRS" },
  { no: 20, pemilik: "PPI", prioritas: "Kejadian phlebitis", penyebab: "Ketidaktepatan pada saat melakukan insersi, tidak melakukan perawatan infus", pengendalian: "Menerapkan bundles insersi PLABSI dan maintenance PLABSI", status: "Terlaksana Berkelanjutan", pj: "PPI" },
  { no: 21, pemilik: "Radiologi", prioritas: "Alat tidak dapat digunakan", penyebab: "Alat error", pengendalian: "Maintenance alat secara berkala", status: "Terlaksana Berkelanjutan", pj: "Kepala unit radiologi, Penanggungjawab peralatan medis" },
  { no: 22, pemilik: "Rekam medis", prioritas: "Kelengkapan rekam medis yang kurang", penyebab: "DPJP tidak atau telat mengisi diagnosis pasien", pengendalian: "Koordinasi dengan petugas ruang rawat inap untuk selalu mengingatkan DPJP mengisi diagnosis", status: "Dalam Pemantauan", pj: "Kepala unit rekam medis, Kepala unit rawat inap" },
  { no: 23, pemilik: "Manajemen", prioritas: "Kelelahan mata", penyebab: "Menatap layar komputer atau gadget terlalu lama", pengendalian: "Melakukan istirahat mata dengan rileks mata 20-20-20", status: "Terlaksana Berkelanjutan", pj: "Manajemen" },
  { no: 24, pemilik: "Gudang umum", prioritas: "Jatuh pada saat penyimpanan barang", penyebab: "Tangga atau pijakan tidak kokoh, lantai licin", pengendalian: "Memastikan tumpuan pijakan kokoh, lantai tidak licin dan area tidak ada penghalang", status: "Terlaksana Berkelanjutan", pj: "Pelaksana gudang umum" },
  { no: 25, pemilik: "IPSRS", prioritas: "Tertimpa benda", penyebab: "Petugas terburu-buru tidak fokus, tidak menggunakan APD", pengendalian: "Petugas lebih berhati-hati, petugas menggunakan APD", status: "Terlaksana Berkelanjutan", pj: "Kepala IPSRS" },
  { no: 26, pemilik: "Petugas kebersihan", prioritas: "Penularan penyakit", penyebab: "Tidak menggunakan APD pada saat melakukan pembersihan", pengendalian: "Penggunaan APD, pengajuan pemeriksaan kesehatan rutin 6 bulan sekali", status: "Terlaksana Berkelanjutan", pj: "Kepala unit kesehatan lingkungan, Kepala unit kebersihan" },
];
