import React, { useState, useEffect } from "react";
import Link from "next/link";
import Sidebar from "./Sidebar";
import { useStore } from "@/store/useStore";
import { Hospital, Calendar, Clock, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import type { NextRouter } from "next/router";

interface LayoutProps {
  children: React.ReactNode;
  router?: NextRouter;
}

// High-precision isolated clock component to prevent Layout re-renders
const ClockWidget = React.memo(function ClockWidget() {
  const [timeString, setTimeString] = useState<string>("");
  const [dateString, setDateString] = useState<string>("");
  const [tickToggle, setTickToggle] = useState<boolean>(false);

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      const ss = String(now.getSeconds()).padStart(2, "0");
      setTimeString(`${hh}:${mm}:${ss}`);

      const options: Intl.DateTimeFormatOptions = {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      };
      setDateString(now.toLocaleDateString("id-ID", options));
      setTickToggle((prev) => !prev);
    };

    updateDateTime();
    const intervalId = setInterval(updateDateTime, 1000);
    return () => clearInterval(intervalId);
  }, []);

  if (!timeString) return null;

  return (
    <motion.div
      key={timeString}
      animate={{
        y: tickToggle ? [-0.2, 0.2, 0] : [0.2, -0.2, 0],
      }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="flex items-center bg-white/40 backdrop-blur-md border border-white/20 rounded-full px-3.5 py-2 text-xs font-bold text-gray-700 shadow-[0_8px_32px_0_rgba(16,163,127,0.05)] select-none hover:shadow-[0_8px_24px_rgba(16,163,127,0.08)] transition-all duration-300 gap-2"
    >
      {dateString && (
        <span className="hidden sm:inline text-gray-600 text-[11px] md:text-xs font-semibold">
          {dateString}
        </span>
      )}
      {dateString && <span className="hidden sm:inline text-emerald-400/80 font-semibold font-mono">•</span>}
      <span className="font-mono tracking-tight text-emerald-600 text-xs md:text-sm font-black">
        {timeString}
      </span>
    </motion.div>
  );
});

export default function Layout({ children, router }: LayoutProps) {
  const hospitalLogo = useStore((state) => state.hospitalLogo);
  const sidebarMinimized = useStore((state) => state.sidebarMinimized);

  // Safely check router to avoid SSG not-mounted errors
  const isWelcomePage = router?.pathname === "/";

  if (isWelcomePage) {
    return (
      <div id="welcome-fullscreen-layout" className="min-h-screen bg-slate-950 text-white overflow-hidden animate-in fade-in duration-500">
        {children}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-gray-50 pb-24 md:pb-0">
      {/* Nav Sidebar component handles both desktop and mobile bottom bar */}
      <Sidebar />

      {/* Content flex alignment container */}
      <div className={`flex-1 flex flex-col min-h-screen ${sidebarMinimized ? 'md:pl-20' : 'md:pl-64'} w-full min-w-0 transition-all duration-300`}>
        {/* PREMIUM UNIFIED GLASSMORPHISM TOP HEADER - SOFT PEARL OFF-WHITE SURFACE */}
        <header className={`fixed top-0 left-0 right-0 ${sidebarMinimized ? 'md:left-20' : 'md:left-64'} z-40 flex items-center justify-between h-16 md:h-[88px] px-4 md:px-8 bg-gradient-to-r from-[#eaedf2] via-[#f1f4f7] to-[#eaedf2] backdrop-blur-md border-b border-slate-200/85 shadow-xs w-full md:w-auto transition-all duration-300`}>
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-400 shadow-[0_2px_15px_rgba(16,163,127,0.8)] z-40" />
          {/* Left Side: Brand Identity Logo (Crisp Without Dropshadow, White Details Contrast Clearly on Off-White) */}
          <Link
            href="/dashboard"
            className="flex items-center group py-0.5 select-none focus:outline-hidden transition-transform duration-200"
            title="OPTIMUS - Optimalisasi Sistem Pelaporan Mutu Rumah Sakit"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/optimus_header_logo.png?v=3"
              alt="OPTIMUS - Optimalisasi Sistem Pelaporan Mutu Rumah Sakit"
              className="h-11 sm:h-13 md:h-[70px] lg:h-[74px] w-auto max-w-[280px] sm:max-w-[350px] md:max-w-[430px] object-contain select-none transition-transform duration-300 group-hover:scale-[1.02]"
            />
          </Link>

          {/* Right Side: High-Precision Calendar & Clock Widget */}
          <div className="flex items-center gap-2.5">
            <ClockWidget />
          </div>
        </header>

        {/* Primary Page views main insertion wrapper */}
        <main className="flex-1 w-full px-4 sm:px-5 md:px-6 lg:px-6 xl:px-8 pt-20 md:pt-[104px] pb-10">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
