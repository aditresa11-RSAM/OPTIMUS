import React, { useState, useRef, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { supabase } from "@/lib/supabase";
import { 
  Database as PhDatabase, 
  CloudArrowDown, 
  CloudArrowUp, 
  CheckCircle as PhCheckCircle, 
  ArrowsClockwise, 
  ShieldCheck as PhShieldCheck, 
  FolderSimple, 
  HardDrives,
  FileText as PhFileText
} from "@phosphor-icons/react";
import { 
  Upload, Check, AlertCircle, Building2, Trash2, Image as ImageIcon,
  Download, Database, Server, Wifi, Copy, Shield, Users, RefreshCw
} from "lucide-react";

export default function Pengaturan() {
  const hospitalLogo = useStore((state) => state.hospitalLogo);
  const setHospitalLogo = useStore((state) => state.setHospitalLogo);

  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  
  const [bgImage, setBgImage] = useState("");
  const [bgVideo, setBgVideo] = useState("");
  const [bgUploading, setBgUploading] = useState(false);
  const [bgSuccessMsg, setBgSuccessMsg] = useState("");
  const [bgErrorMsg, setBgErrorMsg] = useState("");
  const [isBgDragOver, setIsBgDragOver] = useState(false);

  const [showGuide, setShowGuide] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgFileInputRef = useRef<HTMLInputElement>(null);
  const restoreInputRef = useRef<HTMLInputElement>(null);

  // Backup & Restore State
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isSyncingGdrive, setIsSyncingGdrive] = useState(false);
  const [gdriveSyncMsg, setGdriveSyncMsg] = useState("");
  const [backupMsg, setBackupMsg] = useState("");
  const [copiedLan, setCopiedLan] = useState(false);
  const [backupStats, setBackupStats] = useState<{
    lastModified: string | null;
    fileSizeKb: number;
    realtimeBackupExists: boolean;
    totalTables: number;
    totalRecords: number;
    realtimeBackupPath: string;
    gdriveMounted?: boolean;
    gdriveBackupPath?: string;
  } | null>(null);

  const localIp = "192.168.100.23:3002";

  const fetchBackupStats = async () => {
    try {
      const res = await fetch("/api/db?getBackupStatus=true");
      if (res.ok) {
        const json = await res.json();
        setBackupStats(json);
      }
    } catch (e) {
      console.warn("Could not fetch backup stats", e);
    }
  };

  useEffect(() => {
    fetchBackupStats();
  }, []);

  const handleSyncGdriveNow = async () => {
    setIsSyncingGdrive(true);
    setGdriveSyncMsg("");
    try {
      const res = await fetch("/api/db?syncGdriveNow=true");
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Gagal sinkronisasi ke Google Drive");
      }
      setGdriveSyncMsg("Sinkronisasi Berhasil! Database telah disalin langsung ke Google Drive (G:\\My Drive\\BACKUP_OPTIMUS_RSUD_ALMULK)");
      fetchBackupStats();
    } catch (err: any) {
      alert("Peringatan Sinkronisasi: " + err.message);
    } finally {
      setIsSyncingGdrive(false);
    }
  };

  const handleDownloadBackup = async () => {
    setIsBackingUp(true);
    setBackupMsg("");
    try {
      const res = await fetch("/api/db?exportAll=true");
      if (!res.ok) throw new Error("Gagal mengambil data dari server");
      const data = await res.json();
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const now = new Date();
      const dateStr = now.toISOString().split("T")[0];
      const timeStr = `${String(now.getHours()).padStart(2, "0")}-${String(now.getMinutes()).padStart(2, "0")}`;
      a.href = url;
      a.download = `BACKUP_OPTIMUS_RSUD_ALMULK_${dateStr}_${timeStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setBackupMsg("Cadangan database berhasil diunduh! File ini siap disimpan di Google Drive Anda.");
      fetchBackupStats();
    } catch (e: any) {
      alert("Gagal mengunduh cadangan: " + e.message);
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestoreFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm(`PENTING: Anda akan memulihkan database dari file "${file.name}". Seluruh data yang ada saat ini akan digantikan dengan data dari file cadangan ini. Lanjutkan?`)) {
      e.target.value = "";
      return;
    }

    setIsRestoring(true);
    try {
      const text = await file.text();
      const payload = JSON.parse(text);

      const res = await fetch("/api/db", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "restore",
          payload,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal memulihkan database");

      alert("SUKSES: " + json.message + ` (${json.tablesRestored.length} tabel dipulihkan). Halaman akan dimuat ulang.`);
      window.location.reload();
    } catch (e: any) {
      alert("Gagal memulihkan database: " + e.message);
    } finally {
      setIsRestoring(false);
      e.target.value = "";
    }
  };

  const handleCopyLan = () => {
    navigator.clipboard.writeText(`http://${localIp}`);
    setCopiedLan(true);
    setTimeout(() => setCopiedLan(false), 3000);
  };

  // Load current logo from store / localStorage
  useEffect(() => {
    const savedLogo = localStorage.getItem("hospital_logo");
    if (savedLogo) {
      setHospitalLogo(savedLogo);
    }
    
    // Load background image or video
    const loadSettings = async () => {
      try {
        const { data } = await supabase.from("welcome_settings").select("*").eq("id", "1");
        if (data && data.length > 0) {
          if (data[0].video_url) {
            setBgVideo(data[0].video_url);
            setBgImage("");
          } else if (data[0].image_url) {
            setBgImage(data[0].image_url);
            setBgVideo("");
          } else {
            const localImage = localStorage.getItem("welcome_bg_image");
            const localVideo = localStorage.getItem("welcome_bg_video");
            if (localVideo) {
              setBgVideo(localVideo);
              setBgImage("");
            } else if (localImage) {
              setBgImage(localImage);
              setBgVideo("");
            }
          }
        } else {
          const localImage = localStorage.getItem("welcome_bg_image");
          const localVideo = localStorage.getItem("welcome_bg_video");
          if (localVideo) {
            setBgVideo(localVideo);
            setBgImage("");
          } else if (localImage) {
            setBgImage(localImage);
            setBgVideo("");
          }
        }
      } catch (e) {
        console.warn("Could not load welcome settings", e);
        const localImage = localStorage.getItem("welcome_bg_image");
        const localVideo = localStorage.getItem("welcome_bg_video");
        if (localVideo) {
          setBgVideo(localVideo);
          setBgImage("");
        } else if (localImage) {
          setBgImage(localImage);
          setBgVideo("");
        }
      }
    };
    loadSettings();
  }, [setHospitalLogo]);

  // Convert image file to Base64 (for local fallback storage)
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleLogoUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Format berkas harus berupa gambar (PNG, JPG, JPEG, WEBP)!");
      return;
    }
    
    // Check size limit: 20MB max
    if (file.size > 20 * 1024 * 1024) {
      setErrorMsg("Ukuran logo terlalu besar! Maksimal adalah 20MB.");
      return;
    }

    try {
      setUploading(true);
      setErrorMsg("");
      setSuccessMsg("");

      const fileExt = file.name.split(".").pop() || "png";
      const fileName = `hospital-logo-${Date.now()}.${fileExt}`;
      const bucketName = "logos";

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        throw new Error(uploadError.message || "Gagal mengunggah logo");
      }

      const logoUrl = (uploadData as any)?.url || (uploadData as any)?.publicUrl || (uploadData as any)?.fullUrl || ((uploadData as any)?.path ? `/uploads/${(uploadData as any).path}` : `/uploads/${fileName}`);

      await supabase.from("welcome_settings").upsert(
        { id: "logo", image_url: logoUrl },
        { onConflict: "id" }
      );

      localStorage.setItem("hospital_logo", logoUrl);
      setHospitalLogo(logoUrl);
      setSuccessMsg("Logo RS berhasil diperbarui dan disimpan secara permanen!");
    } catch (err: any) {
      console.error("Upload error:", err);
      setErrorMsg(`Gagal mengunggah logo: ${err.message || err.toString()}`);
    } finally {
      setUploading(false);
    }
  };

  const handleBgUpload = async (file: File) => {
    const isVideo = file.type.startsWith("video/") || file.name.endsWith(".mp4");
    const isImage = file.type.startsWith("image/");

    if (!isImage && !isVideo) {
      setBgErrorMsg("Format berkas harus berupa gambar (PNG, JPG, JPEG, WEBP) atau video MP4!");
      return;
    }

    if (isVideo && !file.type.includes("mp4") && !file.name.endsWith(".mp4")) {
      setBgErrorMsg("Format video harus berupa MP4!");
      return;
    }

    // Size limit verification: 20MB max for both image and video
    if (file.size > 20 * 1024 * 1024) {
      setBgErrorMsg(
        isVideo
          ? "Ukuran video terlalu besar! Maksimal adalah 20MB."
          : "Ukuran gambar terlalu besar! Maksimal adalah 20MB."
      );
      return;
    }

    try {
      setBgUploading(true);
      setBgErrorMsg("");
      setBgSuccessMsg("");

      const fileExt = file.name.split(".").pop() || (isVideo ? "mp4" : "png");
      const fileName = `welcome-bg-${Date.now()}.${fileExt}`;
      const bucketName = "backgrounds";

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, { cacheControl: "3600", upsert: true });

      if (uploadError) {
        throw new Error(uploadError.message || "Gagal mengunggah berkas");
      }

      const uploadedUrl = (uploadData as any)?.url || (uploadData as any)?.publicUrl || (uploadData as any)?.fullUrl || ((uploadData as any)?.path ? `/uploads/${(uploadData as any).path}` : `/uploads/${fileName}`);

      const updatePayload = isVideo
        ? { id: "1", video_url: uploadedUrl, image_url: "", youtube_url: "", google_drive_url: "" }
        : { id: "1", image_url: uploadedUrl, video_url: "", youtube_url: "", google_drive_url: "" };

      const { error: dbError } = await supabase.from("welcome_settings").upsert(
        updatePayload,
        { onConflict: "id" }
      );

      if (dbError) throw dbError;

      if (isVideo) {
        setBgVideo(uploadedUrl);
        setBgImage("");
        localStorage.setItem("welcome_bg_video", uploadedUrl);
        localStorage.removeItem("welcome_bg_image");
      } else {
        setBgImage(uploadedUrl);
        setBgVideo("");
        localStorage.setItem("welcome_bg_image", uploadedUrl);
        localStorage.removeItem("welcome_bg_video");
      }
      setBgSuccessMsg(
        isVideo
          ? "Video background berhasil diunggah dan disimpan!"
          : "Gambar background resolusi tinggi berhasil diunggah dan disimpan!"
      );
    } catch (err: any) {
      console.error("BG Upload error:", err);
      setBgErrorMsg(`Gagal memproses background (${err.message || err.toString()}).`);
    } finally {
      setBgUploading(false);
    }
  };

  const handleRemoveBg = async () => {
    setBgImage("");
    setBgVideo("");
    localStorage.removeItem("welcome_bg_image");
    localStorage.removeItem("welcome_bg_video");
    try {
      await supabase.from("welcome_settings").update({ image_url: "", video_url: "" }).eq("id", "1");
    } catch (err) {}
    setBgSuccessMsg("Latar belakang berhasil dihapus. Menggunakan media bawaan.");
    setBgErrorMsg("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleLogoUpload(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleLogoUpload(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveLogo = async () => {
    localStorage.removeItem("hospital_logo");
    setHospitalLogo("");
    
    try {
      await supabase.from("welcome_settings").delete().eq("id", "logo");
    } catch (err) {
      console.warn("Could not delete from Supabase settings table", err);
    }

    setSuccessMsg("Logo RS berhasil dihapus. Menggunakan ikon bawaan.");
    setErrorMsg("");
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-6 max-w-5xl mx-auto">
      {/* Welcome Hero Greeting Banner - 3D Out-of-Bounds Pop-Out Style (Pengaturan Sistem) */}
      <div id="pengaturan-header-panel" className="relative pt-0 group">
        {/* Card Main Body */}
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

          {/* Left Side: Real Vector Typography & Description with Accent Bar */}
          <div className="relative z-10 flex items-start gap-3.5 md:gap-4 flex-1 min-w-0 w-full lg:max-w-[60%] xl:max-w-[62%]">
            {/* Vertical Green Accent Bar */}
            <div className="w-1.5 self-stretch bg-gradient-to-b from-[#10a37f] via-[#059669] to-[#007A4D] rounded-full shrink-0 shadow-[0_0_12px_rgba(16,163,127,0.4)]" />

            <div className="space-y-1.5 sm:space-y-2 min-w-0">
              <h1 className="text-2xl sm:text-3xl md:text-[31px] font-extrabold text-[#007A4D] tracking-tight leading-tight">
                Pengaturan Sistem OPTIMUS
              </h1>

              <p className="text-xs sm:text-[13px] md:text-sm font-bold text-slate-800 leading-snug pt-0.5">
                Kelola Profil Rumah Sakit, Backup/Restore Database, dan Pengaturan Aplikasi
              </p>

              <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed italic max-w-xl">
                &quot;Pusat kendali integrasi database, manajemen logo instansi, serta pemeliharaan sistem terpadu UOBK RSUD Al-Mulk.&quot;
              </p>
            </div>
          </div>

          {/* Spacer on Desktop for the 3D Pop-Out Characters */}
          <div className="hidden lg:block w-[320px] xl:w-[370px] shrink-0" />
        </div>

        {/* 3D Out-of-Bounds Pop-Out Characters Layer */}
        <div className="relative lg:absolute lg:bottom-[1px] lg:right-5 xl:right-8 z-20 flex justify-center lg:justify-end mt-2 lg:mt-0 pointer-events-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/uploads/pengaturan_character_popout.png"
            alt="Pengaturan Sistem 3D"
            className="h-[145px] sm:h-[160px] lg:h-[174px] xl:h-[182px] w-auto object-contain object-bottom drop-shadow-[0_10px_20px_rgba(0,95,58,0.22)] transition-transform duration-500 group-hover:scale-[1.03] origin-bottom"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-[0_4px_30px_-5px_rgba(0,0,0,0.05)] border border-gray-100 p-8 space-y-8">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-2">
            <Building2 className="text-emerald-500" size={22} />
            Identitas & Logo Rumah Sakit
          </h2>
          <p className="text-gray-500 text-sm">
            Logo ini akan diintegrasikan langsung pada tab browser (Favicon), menu bilah sisi (Sidebar), dan kop laporan dinamis UOBK RSUD AL-MULK Kota Sukabumi.
          </p>
        </div>

        {/* Messaging banners */}
        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
            <Check className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
            <p className="text-sm font-semibold">{successMsg}</p>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-semibold">{errorMsg}</p>
          </div>
        )}

        {/* Logo Integration Panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Logo Preview */}
          <div className="flex flex-col items-center justify-center bg-gray-50 border border-gray-100 p-8 rounded-2xl text-center">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
              Pratinjau Logo
            </span>
            <div className="h-28 w-28 rounded-2xl bg-white shadow-md border border-gray-100 flex items-center justify-center overflow-hidden mb-4 p-1 relative group">
              {hospitalLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={hospitalLogo}
                  alt="Hospital logo"
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-300">
                  <Building2 size={40} className="text-gray-300" />
                  <span className="text-[10px] font-bold text-gray-400 mt-2">Bawaan (Default)</span>
                </div>
              )}
            </div>
            {hospitalLogo && (
              <button
                onClick={handleRemoveLogo}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-200/50"
              >
                <Trash2 size={13} />
                Hapus Logo
              </button>
            )}
          </div>

          {/* Drag & Drop Upload Space */}
          <div className="md:col-span-2">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`h-48 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all ${
                isDragOver
                  ? "border-emerald-500 bg-emerald-50/40 scale-[0.99]"
                  : "border-gray-200 bg-gray-50/30 hover:border-emerald-400 hover:bg-emerald-50/5"
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <div className="bg-emerald-100 text-emerald-600 p-3.5 rounded-full mb-3.5">
                <Upload size={24} strokeWidth={2.5} />
              </div>
              <p className="text-sm font-bold text-gray-700">
                {uploading ? (
                  <span className="text-emerald-600 animate-pulse">Mengunggah logo ke Supabase...</span>
                ) : (
                  "Seret & Letakkan logo di sini, atau klik untuk memilih"
                )}
              </p>
              <p className="text-xs text-gray-400 mt-1.5 font-medium">
                Format PNG, JPG, atau WEBP (Maks. 20MB)
              </p>
            </div>
          </div>
        </div>

        {/* Background Image/Video Integration Panel */}
        <div className="border-t border-gray-100 pt-8 mt-6 grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          <div className="md:col-span-3">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-2">
              <ImageIcon className="text-emerald-500" size={22} />
              Media Latar (Halaman Depan)
            </h2>
            <p className="text-gray-500 text-sm mb-4">
              Pilih gambar resolusi tinggi atau video MP4 untuk menjadi latar belakang sinematik halaman selamat datang utama.
            </p>
          </div>
          
          {bgSuccessMsg && (
            <div className="md:col-span-3 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <Check className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
              <p className="text-sm font-semibold">{bgSuccessMsg}</p>
            </div>
          )}

          {bgErrorMsg && (
            <div className="md:col-span-3 p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-semibold">{bgErrorMsg}</p>
            </div>
          )}

          {/* BG Preview */}
          <div className="flex flex-col items-center justify-center bg-gray-50 border border-gray-100 p-8 rounded-2xl text-center">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
              Pratinjau Background
            </span>
            <div className="h-28 w-full rounded-2xl bg-white shadow-md border border-gray-100 flex items-center justify-center overflow-hidden mb-4 p-0 relative group">
              {bgVideo ? (
                <video
                  src={bgVideo}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : bgImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={bgImage}
                  alt="Background preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-300">
                  <ImageIcon size={40} className="text-gray-300" />
                  <span className="text-[10px] font-bold text-gray-400 mt-2">Media Bawaan</span>
                </div>
              )}
            </div>
            {(bgImage || bgVideo) && (
              <button
                onClick={handleRemoveBg}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-200/50"
              >
                <Trash2 size={13} />
                Kembalikan Default
              </button>
            )}
          </div>

          {/* BG Drag & Drop Upload Space */}
          <div className="md:col-span-2">
            <div
              onDragOver={(e) => { e.preventDefault(); setIsBgDragOver(true); }}
              onDragLeave={() => setIsBgDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsBgDragOver(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleBgUpload(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => bgFileInputRef.current?.click()}
              className={`h-48 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all ${
                isBgDragOver
                  ? "border-emerald-500 bg-emerald-50/40 scale-[0.99]"
                  : "border-gray-200 bg-gray-50/30 hover:border-emerald-400 hover:bg-emerald-50/5"
              }`}
            >
              <input
                type="file"
                ref={bgFileInputRef}
                onChange={(e) => e.target.files && e.target.files[0] && handleBgUpload(e.target.files[0])}
                accept="image/*,video/mp4"
                className="hidden"
              />
              <div className="bg-emerald-100 text-emerald-600 p-3.5 rounded-full mb-3.5">
                <Upload size={24} strokeWidth={2.5} />
              </div>
              <p className="text-sm font-bold text-gray-700">
                {bgUploading ? (
                  <span className="text-emerald-600 animate-pulse">Mengunggah media...</span>
                ) : (
                  "Seret & Letakkan gambar/video di sini, atau klik untuk memilih"
                )}
              </p>
              <p className="text-xs text-gray-400 mt-1.5 font-medium">
                Pilih Gambar Resolusi Tinggi (Maks. 20MB) atau Video MP4 (Maks. 20MB)
              </p>
            </div>
          </div>
        </div>

        {/* 1. Cadangan & Pemulihan Database (Backup & Restore Otomatis) */}
        <div className="border-t border-gray-100 pt-8 mt-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-2xl shadow-xs">
                <PhDatabase weight="duotone" size={26} className="text-[#007A4D]" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-slate-800 tracking-tight">
                  Cadangan & Pemulihan Database (Backup & Restore Otomatis)
                </h3>
                <p className="text-xs text-slate-500">
                  Amankan seluruh data mutu ke Google Drive secara otomatis & realtime, atau pulihkan data kapan saja.
                </p>
              </div>
            </div>

            {/* Realtime Status Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200/80 rounded-xl shrink-0 self-start sm:self-auto">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              <span className="text-xs font-bold text-emerald-800">
                Auto-Backup Realtime: <strong className="text-emerald-950 font-black">Aktif</strong>
              </span>
            </div>
          </div>

          {/* Database Live Stats Banner */}
          <div className="bg-gradient-to-r from-emerald-50/80 via-white to-teal-50/70 border border-emerald-200/60 rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs shadow-xs">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pembaruan Terakhir</p>
              <p className="font-extrabold text-slate-800 mt-0.5">
                {backupStats?.lastModified 
                  ? new Date(backupStats.lastModified).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) 
                  : "Baru Saja"}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Ukuran Database</p>
              <p className="font-extrabold text-slate-800 mt-0.5">
                {backupStats?.fileSizeKb || 0} KB
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Rekaman Data</p>
              <p className="font-extrabold text-slate-800 mt-0.5">
                {backupStats?.totalRecords || 0} Data ({backupStats?.totalTables || 0} Tabel)
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Snapshot Realtime</p>
              <p className="font-extrabold text-emerald-700 flex items-center gap-1 mt-0.5">
                <PhCheckCircle weight="duotone" size={14} className="text-emerald-600" />
                Tersimpan Otomatis
              </p>
            </div>
          </div>

          {backupMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2.5 animate-in fade-in duration-300">
              <Check size={18} className="text-emerald-600 shrink-0" />
              <span>{backupMsg}</span>
            </div>
          )}

          {/* 2 Main Action Cards: Download & Restore */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Download Backup */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-md">
                    Cadangan Mandiri
                  </span>
                  <HardDrives weight="duotone" size={20} className="text-emerald-600" />
                </div>
                <h4 className="font-bold text-slate-800 text-sm mt-1">Unduh Salinan Cadangan Lengkap (.JSON)</h4>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Ekspor seluruh data (profil indikator, capaian bulanan, insiden IKP, manajemen risiko, dan supervisi) ke file JSON bertanggal. File ini bisa langsung Anda simpan di <strong>Google Drive</strong> atau flashdisk.
                </p>
              </div>
              <button
                onClick={handleDownloadBackup}
                disabled={isBackingUp}
                className="mt-5 flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/15 transition-all cursor-pointer disabled:opacity-50"
              >
                <CloudArrowDown weight="duotone" size={18} />
                {isBackingUp ? "Mengekspor Database..." : "Unduh Cadangan Database (.JSON)"}
              </button>
            </div>

            {/* Restore Database */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-amber-300 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-md">
                    Pemulihan Darurat
                  </span>
                  <ArrowsClockwise weight="duotone" size={20} className="text-amber-600" />
                </div>
                <h4 className="font-bold text-slate-800 text-sm mt-1">Pulihkan Database dari File Cadangan</h4>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Pilih file cadangan JSON dari <strong>Google Drive</strong> atau komputer Anda untuk mengembalikan seluruh data jika Anda ganti laptop baru atau setelah melakukan install ulang sistem.
                </p>
              </div>
              <input
                type="file"
                ref={restoreInputRef}
                onChange={handleRestoreFile}
                accept=".json,application/json"
                className="hidden"
              />
              <button
                onClick={() => restoreInputRef.current?.click()}
                disabled={isRestoring}
                className="mt-5 flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-900 active:bg-black text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <CloudArrowUp weight="duotone" size={18} className={isRestoring ? "animate-spin" : ""} />
                {isRestoring ? "Memulihkan Database..." : "Pilih File Cadangan untuk Dipulihkan"}
              </button>
            </div>
          </div>

          {/* Google Drive Realtime Integration Card */}
          <div className="bg-gradient-to-r from-blue-50/80 via-sky-50/60 to-indigo-50/50 border border-blue-200/80 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-xs shrink-0 mt-0.5">
                  <FolderSimple weight="duotone" size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-extrabold text-sm text-blue-950">
                      Integrasi Google Drive Realtime (Drive G:)
                    </h4>
                    {backupStats?.gdriveMounted ? (
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full flex items-center gap-1.5 shadow-xs">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        Drive G: Terhubung & Aktif
                      </span>
                    ) : (
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 bg-amber-100 text-amber-800 border border-amber-300 rounded-full">
                        Drive G: Belum Terdeteksi
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Setiap kali Anda menambah, mengubah, atau menghapus data di aplikasi OPTIMUS, sistem akan <strong>secara otomatis menduplikasi data ke Google Drive G: secara realtime</strong> tanpa perlu menunggu atau mengklik tombol apa pun.
                  </p>
                </div>
              </div>

              {/* Instant Manual Sync Button */}
              <button
                onClick={handleSyncGdriveNow}
                disabled={isSyncingGdrive}
                className="shrink-0 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <ArrowsClockwise weight="duotone" size={17} className={isSyncingGdrive ? "animate-spin" : ""} />
                {isSyncingGdrive ? "Menyinkronkan..." : "Sinkronkan ke Google Drive (G:) Sekarang"}
              </button>
            </div>

            {gdriveSyncMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in duration-300">
                <Check size={16} className="text-emerald-600 shrink-0" />
                <span>{gdriveSyncMsg}</span>
              </div>
            )}

            {/* Folder location & Desktop Shortcut Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="bg-white/80 border border-blue-200/60 rounded-xl p-3">
                <p className="text-[10px] font-black uppercase tracking-wider text-blue-900 mb-1">
                  Lokasi Penyimpanan Google Drive
                </p>
                <code className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded block break-all">
                  G:\My Drive\BACKUP_OPTIMUS_RSUD_ALMULK\
                </code>
                <p className="text-[11px] text-slate-500 mt-1.5 leading-snug">
                  File <code>db_latest.json</code> dan <code>db_YYYY-MM-DD.json</code> otomatis selalu sinkron dan bisa dibuka/dipulihkan kapan saja di laptop mana pun.
                </p>
              </div>

              <div className="bg-white/80 border border-blue-200/60 rounded-xl p-3">
                <p className="text-[10px] font-black uppercase tracking-wider text-blue-900 mb-1">
                  Pencadangan Total Termasuk Koding Aplikasi
                </p>
                <p className="text-[11px] text-slate-600 leading-snug">
                  Sudah tersedia shortcut <strong>BACKUP_OPTIMUS_KE_GDRIVE.bat</strong> di Desktop Anda. Cukup klik ganda (double-click) untuk mencadangkan seluruh kodingan ke Google Drive menjadi berkas zip ringan (~115 MB) dalam waktu 30 detik tanpa perlu menyalin <code>node_modules</code> yang lama.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Akses Jaringan Lokal RSUD Al-Mulk (LAN / Wi-Fi) */}
        <div className="border-t border-gray-100 pt-8 mt-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-sky-100 text-sky-700 rounded-xl">
              <Wifi size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-800">Akses Jaringan Lokal RSUD Al-Mulk (LAN / Wi-Fi)</h3>
              <p className="text-xs text-slate-500">Bagikan alamat ini agar staf di ruangan lain bisa membuka aplikasi dari laptop/tablet mereka.</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-sky-50 to-indigo-50/50 p-5 rounded-2xl border border-sky-100 mt-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-[11px] font-extrabold uppercase text-sky-700 tracking-wider">Alamat Jaringan Komputer Ini</p>
              <div className="flex items-center gap-3">
                <code className="text-base font-black text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-sky-200/80 font-mono">
                  http://{localIp}
                </code>
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-100/60 px-2.5 py-1 rounded-md">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Aktif
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Perangkat lain harus terhubung ke jaringan Wi-Fi atau kabel LAN yang sama dengan komputer ini.
              </p>
            </div>

            <button
              onClick={handleCopyLan}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-sky-800 border border-sky-200 hover:bg-sky-50 font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
            >
              {copiedLan ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
              {copiedLan ? "Tersalin ke Clipboard!" : "Salin Alamat Jaringan"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
