import React from 'react';

interface KopSuratProps {
  subJudul?: string;
  nomorSurat?: string;
}

export default function KopSurat({ subJudul, nomorSurat }: KopSuratProps) {
  return (
    <div className="border-b-4 border-double border-slate-900 pb-4 mb-6">
      <div className="flex items-center justify-between gap-4">
        {/* Logo RSUD Al-Mulk */}
        <div className="w-20 h-20 md:w-24 md:h-24 shrink-0 flex items-center justify-center">
          <img 
            src="/uploads/hospital_logo.png" 
            alt="Logo RSUD Al-Mulk" 
            className="w-full h-full object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/uploads/hospital-logo-1779925289331.png';
            }}
          />
        </div>

        {/* Instansi Text */}
        <div className="flex-1 text-center">
          <h3 className="text-sm md:text-base font-bold uppercase tracking-widest text-slate-800 leading-tight">
            Pemerintah Kota Sukabumi
          </h3>
          <h4 className="text-xs md:text-sm font-semibold uppercase tracking-wider text-slate-700 leading-tight">
            Dinas Kesehatan
          </h4>
          <h1 className="text-lg md:text-2xl font-black uppercase tracking-tight text-slate-900 mt-0.5">
            UOBK RSUD AL-MULK
          </h1>
          <p className="text-[11px] md:text-xs text-slate-600 font-medium leading-snug mt-1">
            Jl. Pelabuhan II KM. 6 Kel. Lembursitu Kec. Lembursitu, Kota Sukabumi, Jawa Barat 43168
          </p>
          <p className="text-[10px] md:text-[11px] text-slate-500 font-medium">
            Email: rsudalmulk@gmail.com | Website: rsudalmulk.sukabumikota.go.id
          </p>
        </div>

        {/* Decorative / Spacer Right */}
        <div className="w-20 md:w-24 shrink-0 hidden sm:flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border border-slate-200 flex items-center justify-center text-[10px] text-slate-400 font-bold text-center leading-tight">
            KARS<br/>PARIPURNA
          </div>
        </div>
      </div>

      {subJudul && (
        <div className="text-center mt-5 pt-3 border-t border-slate-200">
          <h2 className="text-base md:text-lg font-black uppercase text-slate-900 underline decoration-2 underline-offset-4">
            {subJudul}
          </h2>
          {nomorSurat && (
            <p className="text-xs font-semibold text-slate-600 mt-1">
              Nomor: {nomorSurat}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
