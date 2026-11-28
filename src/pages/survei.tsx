import React, { useState } from "react";
import Head from "next/head";
import {
  Maximize2,
  RefreshCw,
  ShieldCheck,
  MonitorPlay
} from "lucide-react";

export default function SurveiBudayaPage() {
  const [iframeKey, setIframeKey] = useState(0);

  const portalUrl = "https://www.surveibudayakeselamatanpasien.com/";

  return (
    <>
      <Head>
        <title>Survei Budaya Keselamatan Pasien - OPTIMUS</title>
      </Head>

      <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 w-full max-w-full space-y-5 pb-16">
        {/* ========================================================= */}
        {/* HEADER HERO BANNER (3D RSUD AL-MULK HOSPITAL BACKGROUND) */}
        {/* ========================================================= */}
        <div id="survei-header-panel" className="relative pt-0 group">
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
                  Survei Budaya Keselamatan Pasien
                </h1>

                <p className="text-xs sm:text-[13px] md:text-sm font-bold text-slate-800 leading-snug pt-0.5">
                  Sistem Integrasi Analitik Medclin Pro Academy • UOBK RSUD AL-MULK
                </p>

                <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed italic max-w-xl">
                  &quot;Kelola survei, analisis hasil, dan tingkatkan budaya keselamatan pasien melalui portal analitik resmi berbasis standar AHRQ SOPS Version 2.0.&quot;
                </p>
              </div>
            </div>

            {/* Spacer on Desktop for the 3D Pop-Out Characters */}
            <div className="hidden lg:block w-[320px] xl:w-[370px] shrink-0" />
          </div>

          {/* 3D Out-of-Bounds Pop-Out Medical Team Layer */}
          <div className="relative lg:absolute lg:bottom-[1px] lg:right-5 xl:right-8 z-20 flex justify-center lg:justify-end mt-2 lg:mt-0 pointer-events-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/uploads/medical_team_popout.png?v=3"
              alt="Tim Medis UOBK RSUD Al-Mulk"
              className="h-[140px] sm:h-[155px] lg:h-[170px] xl:h-[178px] w-auto object-contain object-bottom drop-shadow-[0_10px_20px_rgba(0,95,58,0.22)] transition-transform duration-500 group-hover:scale-[1.03] origin-bottom"
            />
          </div>
        </div>

        {/* ========================================================= */}
        {/* CONTROL TOOLBAR & ACTIONS                                 */}
        {/* ========================================================= */}
        <div className="flex items-center justify-between flex-wrap gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold border border-emerald-200/60 shadow-2xs">
              <MonitorPlay className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900">
                  Sistem Survei Budaya Keselamatan Pasien (Live In-App)
                </h4>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Online
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Akses langsung dan kelola hasil survei tanpa perlu berpindah jendela
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIframeKey((prev) => prev + 1)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer shadow-2xs"
              title="Muat Ulang Halaman Survei"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>

            <a
              href={portalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#007A4D] hover:bg-[#00603B] text-white shadow-xs hover:shadow-md transition-all cursor-pointer"
              title="Buka Website di Tab Baru"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Buka Tab Penuh</span>
            </a>
          </div>
        </div>

        {/* ========================================================= */}
        {/* IN-APP EMBEDDED IFRAME CONTAINER                          */}
        {/* ========================================================= */}
        <div className="relative w-full h-[880px] rounded-3xl overflow-hidden border border-slate-200/90 shadow-[0_12px_36px_rgba(0,0,0,0.08)] bg-slate-100 transition-all duration-300">
          <iframe
            key={iframeKey}
            src={portalUrl}
            title="Sistem Survei Budaya Keselamatan Pasien"
            className="w-full h-full border-0 rounded-3xl"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
      </div>
    </>
  );
}
