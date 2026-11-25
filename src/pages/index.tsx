import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabase";
import { 
  ArrowRight, 
  Volume2, 
  VolumeX, 
  Hospital
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useStore } from "@/store/useStore";

interface WelcomeSettings {
  id: string;
  image_url: string;
  video_url: string;
  youtube_url: string;
  google_drive_url: string;
  updated_at: string;
}

const DEFAULT_SETTINGS: WelcomeSettings = {
  id: "1",
  image_url: "",
  video_url: "",
  youtube_url: "",
  google_drive_url: "",
  updated_at: new Date().toISOString()
};

export default function WelcomePage() {
  const router = useRouter();
  const hospitalLogo = useStore((state) => state.hospitalLogo);
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());
  const [settings, setSettings] = useState<WelcomeSettings>(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("welcome_settings_cache");
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch (e) {}
      }
    }
    return DEFAULT_SETTINGS;
  });

  const [loading, setLoading] = useState(true);
  const [muted, setMuted] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const backgroundImageSrc = settings.image_url;

  const handleEnterDashboard = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    localStorage.setItem("welcome_seen", "true");
    router.push("/dashboard");
  };

  // Sync real-time clock tickers
  useEffect(() => {
    const r = requestAnimationFrame(() => {
      setMounted(true);
    });
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => {
      cancelAnimationFrame(r);
      clearInterval(timer);
    };
  }, []);

  // Safe helper to cache settings without exceeding browser localStorage quota
  const saveWelcomeCache = (data: WelcomeSettings) => {
    if (typeof window === "undefined") return;
    try {
      // Do not store massive base64 media data strings in localStorage (avoids QuotaExceededError)
      const isLargeData = (str?: string) => Boolean(str && (str.startsWith("data:") || str.length > 2000));
      const cleanData: WelcomeSettings = {
        ...data,
        image_url: isLargeData(data.image_url) ? "" : (data.image_url || ""),
        video_url: isLargeData(data.video_url) ? "" : (data.video_url || "")
      };
      localStorage.setItem("welcome_settings_cache", JSON.stringify(cleanData));
    } catch {
      // Silently ignore storage quota limits
    }
  };

  // Fetch Welcome Page Assets Configuration
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data } = await supabase.from("welcome_settings").select("*").eq("id", "1");
        if (data && data.length > 0) {
          setSettings(data[0]);
          saveWelcomeCache(data[0]);
        }
      } catch {
        // Fallback silently without warning spam
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
    
    // Set up Realtime Subscription for instantaneous admin changes
    const channel = supabase
      .channel("welcome-changes")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "welcome_settings", filter: "id=eq.1" },
        (payload: any) => {
          if (payload.new) {
            setSettings(payload.new);
            saveWelcomeCache(payload.new);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const formatWIB = (date: Date) => {
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    }) + " WIB";
  };

  const getDayText = (date: Date) => {
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  // Safe YouTube ID extractor
  const getYoutubeVideoId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const ytId = getYoutubeVideoId(settings.youtube_url);
  const isYoutube = !!ytId;
  const isDrive = false;
  const isRawVideo = !!settings.video_url;
  const isImage = !!settings.image_url;
  const videoUrl = settings.video_url;

  return (
    <div 
      id="welcome-fullscreen-canvas" 
      className="relative min-h-screen text-white flex flex-col justify-between overflow-y-auto lg:overflow-hidden origin-center bg-slate-950"
    >
      {/* CINEMATIC MEDIA BACKDROP SCREEN */}
      <div className="absolute inset-0 z-0 select-none overflow-hidden bg-slate-950">
        
        {isYoutube ? (
          <div className="absolute inset-0 pointer-events-none scale-110">
            <iframe
              src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${ytId}&showinfo=0&rel=0&iv_load_policy=3&enablejsapi=1`}
              className="w-full h-full object-cover opacity-100"
              frameBorder="0"
              allow="autoplay; encrypted-media"
              title="OPTIMUS Background Stream"
            />
          </div>
        ) : isDrive ? (
          // Google Drive stream representation
          <div className="absolute inset-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={backgroundImageSrc}
              alt="Background" 
              className="w-full h-full object-cover opacity-100"
              referrerPolicy="no-referrer"
            />
          </div>
        ) : isRawVideo ? (
          <video
            ref={(el) => {
              if (el) {
                el.defaultMuted = true;
                el.muted = muted;
                // Force play if browser defers autoplay
                if (el.paused) {
                  el.play().catch(() => {});
                }
              }
            }}
            src={videoUrl}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="w-full h-full object-cover opacity-100"
          />
        ) : isImage ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={backgroundImageSrc}
              alt="Welcome Background Image" 
              className="w-full h-full object-cover opacity-100 transition-all duration-700"
              referrerPolicy="no-referrer"
            />
          </>
        ) : (
          <div className="w-full h-full bg-slate-950" />
        )}

      </div>

      {/* TOPHEADER TICKER BAR */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full px-6 py-5 md:px-12 flex justify-between items-center font-sans"
      >
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 bg-white border border-emerald-500/10 rounded-xl flex items-center justify-center overflow-hidden shadow-lg p-0.5">
            {hospitalLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={hospitalLogo}
                alt="Logo RS"
                className="h-full w-full object-contain"
              />
            ) : (
              <Hospital className="text-emerald-600 h-6 w-6" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-sm tracking-tight text-white leading-tight truncate drop-shadow-md">
              UOBK RSUD AL-MULK
            </span>
            <span className="text-[12px] font-bold leading-none mt-1 drop-shadow-md text-[#2dd96e]">
              Kota Sukabumi
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {mounted && (
            <div className="hidden md:flex flex-col text-right animate-in fade-in duration-350 drop-shadow-md" style={{ fontFamily: "'Poppins', sans-serif" }}>
              <span className="text-xs font-bold text-white -mb-[5px]">{getDayText(currentTime)}</span>
              <span className="text-[10px] text-slate-200 font-bold mt-[5px]">{formatWIB(currentTime)}</span>
            </div>
          )}

          {/* Sound Toggle controls for raw MP4 backing audio */}
          {isRawVideo && (
            <button 
              onClick={() => setMuted(!muted)}
              className="p-2 border border-white/10 rounded-xl hover:bg-white/5 text-slate-350 hover:text-white transition-colors cursor-pointer"
              title={muted ? "Nyalakan Audio" : "Bisukan Audio"}
            >
              {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>
          )}

        </div>
      </motion.header>

      {/* CONTENT LAYER: TOMBOL MASUK MENU & LOGO WATERMARK KANAN BAWAH */}
      <motion.main 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full px-6 md:px-12 pb-8 md:pb-12 flex-1 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-5"
      >
        <div className="animate-smooth-float">
          <button
            onClick={handleEnterDashboard}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 hover:from-emerald-500 hover:to-emerald-400 border border-emerald-300/60 text-white font-extrabold text-xs md:text-sm tracking-wider uppercase active:scale-95 transition-all duration-300 flex items-center gap-3 cursor-pointer shadow-[0_10px_28px_rgba(16,185,129,0.5)] hover:shadow-[0_16px_36px_rgba(16,185,129,0.7)] group antialiased select-none"
          >
            <span className="drop-shadow-sm font-black tracking-widest">Masuk Menu</span>
            <ArrowRight size={18} className="stroke-[2.5] transition-transform duration-200 group-hover:translate-x-1.5" />
          </button>
        </div>

        {/* 3D OPTIMUS Logo Badge di Sebelah Kanan Bawah - Glassmorphism 2.0 Frosted Glass */}
        <div className="relative overflow-hidden flex items-center bg-gradient-to-b from-white/30 via-white/20 to-white/10 hover:from-white/40 hover:via-white/25 hover:to-white/15 backdrop-blur-xl md:backdrop-blur-2xl border border-white/40 hover:border-white/60 px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl sm:rounded-3xl shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.8),0_12px_32px_0_rgba(0,0,0,0.22)] select-none transition-all duration-300 hover:scale-[1.03] self-end sm:self-auto group cursor-pointer">
          {/* Internal Specular Glass Highlight */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none" />
          <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/15 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/optimus_header_logo.png?v=3"
            alt="OPTIMUS - Optimalisasi Sistem Pelaporan Mutu Rumah Sakit"
            className="h-9 sm:h-11 md:h-14 lg:h-16 w-auto object-contain relative z-10 transition-transform duration-300"
          />
        </div>
      </motion.main>

    </div>
  );
}
