import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabase";
import { 
  ArrowRight, 
  Clock, 
  MapPin, 
  Volume2, 
  VolumeX, 
  Activity, 
  ShieldCheck,
  Hospital,
  TrendingUp,
  Award
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
  const [complianceScore, setComplianceScore] = useState(90);
  const [isExiting, setIsExiting] = useState(false);

  const backgroundImageSrc = settings.image_url;

  const handleEnterDashboard = () => {
    localStorage.setItem("welcome_seen", "true");
    router.push("/dashboard");
  };

  // Sync real-time compliance score animation from 90% to 100%
  useEffect(() => {
    let active = true;
    let timer: any;
    
    const runAnimation = () => {
      const duration = 2500; // 2.5 seconds to go from 90 to 100
      const startTime = Date.now();
      
      const update = () => {
        if (!active) return;
        const now = Date.now();
        const elapsed = now - startTime;
        
        if (elapsed >= duration) {
          setComplianceScore(100);
          // Stay at 100% for 3 seconds, then reset to 90% and restart
          timer = setTimeout(() => {
            if (active) {
              setComplianceScore(90);
              runAnimation();
            }
          }, 3000);
        } else {
          const progress = elapsed / duration;
          const current = Math.floor(90 + progress * 10);
          setComplianceScore(current);
          requestAnimationFrame(update);
        }
      };
      
      requestAnimationFrame(update);
    };

    runAnimation();

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, []);

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

  // Fetch Welcome Page Assets Configuration
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data } = await supabase.from("welcome_settings").select("*").eq("id", "1");
        if (data && data.length > 0) {
          setSettings(data[0]);
          try {
            localStorage.setItem("welcome_settings_cache", JSON.stringify(data[0]));
          } catch (e) {
            console.warn("Could not write welcome settings to cache (Quota exceeded?)");
          }
        }
      } catch (e) {
        console.warn("Could not query dynamic welcome media", e);
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
            try {
              localStorage.setItem("welcome_settings_cache", JSON.stringify(payload.new));
            } catch (e) {
              console.warn("Could not write real-time welcome settings to cache (Quota exceeded?)");
            }
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
              className="w-full h-full object-cover opacity-80"
              frameBorder="0"
              allow="autoplay; encrypted-media"
              title="OPTIMUS Background Stream"
            />
          </div>
        ) : isDrive ? (
          // Google Drive stream representation
          <div className="absolute inset-0">
            {/* Fallback layout styled cleanly with static image but subtle blur */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={backgroundImageSrc}
              alt="Background Fallback" 
              className="w-full h-full object-cover opacity-80 filter blur-[2px]"
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
            className="w-full h-full object-cover opacity-[0.6]"
          />
        ) : isImage ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={backgroundImageSrc}
              alt="Welcome Background Image Fallback" 
              className="w-full h-full object-cover opacity-80 transition-all duration-700"
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

      {/* CONTENT LAYER */}
      <motion.main 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full px-6 md:px-12 pb-12 md:pb-16 flex-1 flex flex-col lg:flex-row items-start lg:items-end justify-end lg:justify-between gap-8 lg:gap-6 xl:gap-12"
      >
        <style dangerouslySetInnerHTML={{ __html: `
          .glass-emboss-text {
            color: #ffffff;
            text-shadow: 
            1px 1px 2px rgba(0, 0, 0, 0.8),
            2px 2px 4px rgba(0, 0, 0, 0.6),
            0 10px 25px rgba(0, 0, 0, 0.5);
          }
          .glass-emboss-sub {
            color: rgba(255, 255, 255, 0.95);
            text-shadow: 
            1px 1px 2px rgba(0, 0, 0, 0.8),
            0 4px 12px rgba(0, 0, 0, 0.5);
          }
        `}} />
        
        {/* LEFT COLUMN: TITLE & CONTROLS */}
        <div className="w-full lg:max-w-[440px] xl:max-w-xl space-y-5 text-left flex flex-col justify-end mt-auto lg:mt-0">
          
          <div className="space-y-3">
            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl min-[360px]:text-6xl sm:text-8xl lg:text-[85px] lg:leading-[85px] xl:text-[110px] xl:leading-none font-black tracking-normal leading-none select-none text-[#2dd96e] glass-emboss-text"
              style={{
                fontFamily: "Poppins, sans-serif",
                fontStyle: "italic",
                fontWeight: 900,
                letterSpacing: "0.02em",
                marginBottom: "0px",
                textDecorationLine: "none"
              }}
            >
              OPTIMUS
            </motion.h1>
            <h2 
              className="font-bold tracking-normal leading-tight glass-emboss-sub text-[14px] sm:text-[18px] lg:text-[16px] xl:text-[21px] whitespace-normal xl:whitespace-nowrap"
              style={{
                marginBottom: "6px",
                color: "#2dd96e",
                textShadow: "0px 2px 4px rgba(0, 0, 0, 0.95), 0px 4px 12px rgba(0, 0, 0, 0.85)"
              }}
            >
              Optimalisasi Sistem Pelaporan Mutu Rumah Sakit
            </h2>
            <p 
              className="text-[13px] sm:text-xs md:text-sm lg:text-[14px] text-slate-200/85 font-medium leading-relaxed glass-emboss-sub w-full lg:max-w-[420px] xl:max-w-[555px] h-auto"
              style={{
                fontSize: "14px",
                lineHeight: "22.75px"
              }}
            >
              Sistem terintegrasi untuk meningkatkan kualitas laporan, keselamatan pasien dan tata kelola mutu rumah sakit secara berkelanjutan.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={handleEnterDashboard}
              className="px-6 py-3.5 rounded-xl bg-emerald-600 border border-emerald-500 text-white font-black text-xs tracking-wider uppercase hover:bg-emerald-700 hover:border-emerald-600 active:scale-95 transition-all duration-300 flex items-center gap-2.5 cursor-pointer shadow-[0_8px_24px_0_rgba(16,185,129,0.3)]"
            >
              <span style={{ textShadow: "1px 1.5px 1px rgba(0, 0, 0, 0.95)" }}>BUKA DASHBOARD</span>
              <motion.div
                animate={{ x: [0, 6, 0] }}
                transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
              >
                <ArrowRight size={14} className="stroke-[3]" />
              </motion.div>
            </button>
          </div>

        </div>

        {/* RIGHT COLUMN: GLASSMORPHISM ANALYTICS WIDGETS */}
        <div className="hidden lg:flex flex-col sm:flex-row items-stretch sm:items-end gap-4 xl:gap-5 w-full lg:w-auto shrink-0 justify-center lg:justify-end">
          
          {/* Widget 1: Capaian Mutu (Floating Bar Chart) */}
          <motion.div 
            animate={{ y: [0, -8, 0] }}
            transition={{ 
              repeat: Infinity, 
              duration: 3.5, 
              ease: "easeInOut" 
            }}
            whileHover={{ scale: 1.03 }}
            className="bg-slate-950/40 backdrop-blur-xl border border-white/10 p-4 xl:p-5 rounded-2xl shadow-2xl flex flex-col justify-between w-full lg:w-[240px] xl:w-[280px] min-h-[200px]"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Capaian Mutu</p>
                <p className="text-sm font-black text-emerald-400">Target Tercapai</p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-[#2dd96e] flex items-center justify-center">
                <TrendingUp size={16} />
              </div>
            </div>

            {/* Custom Interactive rounded wide bars with bounce animations */}
            <div className="h-28 flex items-end justify-between gap-2 px-0.5 mt-5">
              {[
                { month: "Jan", pct: "62%", hRange: ["45%", "65%"], duration: 2.2, delay: 0.1, color: "from-emerald-500/30 to-[#2dd96e]", glow: "shadow-[0_0_10px_rgba(45,217,110,0.5)]", textColor: "text-emerald-400" },
                { month: "Feb", pct: "74%", hRange: ["55%", "78%"], duration: 2.5, delay: 0.3, color: "from-emerald-500/30 to-[#2dd96e]", glow: "shadow-[0_0_10px_rgba(45,217,110,0.5)]", textColor: "text-emerald-400" },
                { month: "Mar", pct: "58%", hRange: ["40%", "60%"], duration: 2.1, delay: 0.5, color: "from-emerald-500/30 to-[#2dd96e]", glow: "shadow-[0_0_10px_rgba(45,217,110,0.5)]", textColor: "text-emerald-400" },
                { month: "Apr", pct: "81%", hRange: ["65%", "85%"], duration: 2.4, delay: 0.2, color: "from-emerald-500/30 to-[#2dd96e]", glow: "shadow-[0_0_10px_rgba(45,217,110,0.5)]", textColor: "text-[#2dd96e]" },
                { month: "Mei", pct: "89%", hRange: ["70%", "92%"], duration: 2.3, delay: 0.4, color: "from-emerald-500/30 to-[#2dd96e]", glow: "shadow-[0_0_10px_rgba(45,217,110,0.5)]", textColor: "text-[#2dd96e]" },
                { month: "Jun", pct: "94%", hRange: ["75%", "98%"], duration: 2.6, delay: 0.6, color: "from-emerald-500/30 to-[#2dd96e]", glow: "shadow-[0_0_10px_rgba(45,217,110,0.5)]", textColor: "text-[#2dd96e]" }
              ].map((bar, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end relative">
                  {/* Bar wrapper */}
                  <div className="w-full flex-1 bg-white/5 rounded-t-lg overflow-visible flex items-end relative">
                    <motion.div 
                      animate={{ height: bar.hRange }}
                      transition={{
                        repeat: Infinity,
                        repeatType: "reverse",
                        duration: bar.duration,
                        delay: bar.delay,
                        ease: "easeInOut"
                      }}
                      className={`w-full bg-gradient-to-t ${bar.color} rounded-t-lg relative flex items-start justify-center ${bar.glow}`}
                    >
                      {/* Floating percentage above it */}
                      <div className="absolute -top-4 flex flex-col items-center">
                        <span className={`text-[9px] font-black ${bar.textColor} tracking-tighter select-none`}>
                          {bar.pct}
                        </span>
                      </div>
                    </motion.div>
                  </div>
                  {/* Month Label */}
                  <span className="text-[10px] font-bold text-slate-400 tracking-wider font-sans select-none">
                    {bar.month}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Widget 2: Kepatuhan Mutu (Floating Percentage) */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ 
              repeat: Infinity, 
              duration: 4, 
              ease: "easeInOut",
              delay: 0.5
            }}
            whileHover={{ scale: 1.03 }}
            className="bg-slate-950/40 backdrop-blur-xl border border-white/10 p-4 xl:p-5 rounded-2xl shadow-2xl flex flex-col justify-between w-full lg:w-44 xl:w-56 min-h-[180px]"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Kepatuhan Mutu</p>
                <p className="text-sm font-black text-[#2dd96e]" style={{ fontSize: "12px" }}>Akreditasi Paripurna</p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-[#2dd96e] flex items-center justify-center">
                <Award size={16} />
              </div>
            </div>

            <div className="mt-4 flex flex-col justify-end flex-1">
              {/* Score text displaying anim score from 90 to 100 */}
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-black text-white tracking-tight drop-shadow-md" style={{ fontStyle: "italic" }}>
                  {complianceScore}
                </span>
                <span className="text-2xl font-extrabold text-[#2dd96e]">%</span>
              </div>
              <p className="text-[10px] text-slate-300 font-medium mt-1 leading-normal">
                Indeks kepatuhan pelaporan indikator nasional mutu (INM).
              </p>
            </div>
          </motion.div>

        </div>

      </motion.main>

    </div>
  );
}
