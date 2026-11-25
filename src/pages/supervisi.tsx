import React, { useState } from 'react';
import Head from 'next/head';
import SupervisiMenu from '../components/supervisi/SupervisiMenu';
import FormSupervisiMutu from '../components/supervisi/FormSupervisiMutu';
import FormSupervisiPPI from '../components/supervisi/FormSupervisiPPI';
import FormSupervisiK3RS from '../components/supervisi/FormSupervisiK3RS';
import FormSupervisiKeperawatan from '../components/supervisi/FormSupervisiKeperawatan';
import DashboardSupervisi from '../components/supervisi/DashboardSupervisi';
// import { ShieldCheck } from 'lucide-react';

export default function SupervisiPage() {
  const [activeView, setActiveView] = useState<'menu' | 'form-mutu' | 'form-ppi' | 'form-k3rs' | 'form-keperawatan' | 'dashboard' | 'riwayat'>('menu');

  const renderContent = () => {
    switch (activeView) {
      case 'form-mutu':
        return (
          <FormSupervisiMutu 
            onBack={() => setActiveView('menu')} 
            onViewRiwayat={() => setActiveView('riwayat')} 
          />
        );
      case 'form-ppi':
        return (
          <FormSupervisiPPI 
            onBack={() => setActiveView('menu')} 
            onViewRiwayat={() => setActiveView('riwayat')} 
          />
        );
      case 'form-k3rs':
        return (
          <FormSupervisiK3RS 
            onBack={() => setActiveView('menu')} 
            onViewRiwayat={() => setActiveView('riwayat')} 
          />
        );
      case 'form-keperawatan':
        return (
          <FormSupervisiKeperawatan 
            onBack={() => setActiveView('menu')} 
            onViewRiwayat={() => setActiveView('riwayat')} 
          />
        );
      case 'dashboard':
        return <DashboardSupervisi onBack={() => setActiveView('menu')} />;
      case 'riwayat':
        // Reuse Dashboard or create placeholder Riwayat. For now fallback to Dashboard visually
        return <DashboardSupervisi onBack={() => setActiveView('form-mutu')} />;
      default:
        return (
          <SupervisiMenu 
            onSelect={(menu) => {
              if (menu === 'mutu') setActiveView('form-mutu');
              else if (menu === 'ppi') setActiveView('form-ppi');
              else if (menu === 'k3rs') setActiveView('form-k3rs');
              else if (menu === 'keperawatan') setActiveView('form-keperawatan');
              else alert('Modul ini sedang dalam pengembangan.');
            }} 
            onViewDashboard={() => setActiveView('dashboard')}
          />
        );
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto w-full flex flex-col min-h-[calc(100vh-140px)] mb-20">
      <Head>
        <title>Supervisi Mutu Terintegrasi - OptiMus</title>
      </Head>

      {/* Welcome Hero Greeting Banner - 3D Out-of-Bounds Pop-Out Style (Supervisi Mutu) */}
      {activeView === 'menu' && (
        <div id="supervisi-header-panel" className="relative pt-0 group mb-6">
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
                  Supervisi Mutu Terintegrasi
                </h1>

                <p className="text-xs sm:text-[13px] md:text-sm font-bold text-slate-800 leading-snug pt-0.5">
                  Monitoring Kepatuhan Standar, Audit Klinis, dan Evaluasi Lapangan Berkala
                </p>

                <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed italic max-w-xl">
                  &quot;Pelaksanaan supervisi mutu internal berkelanjutan demi mempertahankan standar mutu paripurna di seluruh unit kerja.&quot;
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
              src="/uploads/supervisi_character_popout.png"
              alt="Supervisi Mutu 3D"
              className="h-[145px] sm:h-[160px] lg:h-[174px] xl:h-[182px] w-auto object-contain object-bottom drop-shadow-[0_10px_20px_rgba(0,95,58,0.22)] transition-transform duration-500 group-hover:scale-[1.03] origin-bottom"
            />
          </div>
        </div>
      )}

      <div className={activeView === 'menu' ? "" : "pt-2"}>
        {renderContent()}
      </div>
    </div>
  );
}
