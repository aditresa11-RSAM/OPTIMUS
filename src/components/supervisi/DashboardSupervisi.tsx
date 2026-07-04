import React from 'react';
import { ArrowLeft, TrendingUp, Users, CheckCircle2, ShieldAlert } from 'lucide-react';

interface DashboardSupervisiProps {
  onBack: () => void;
}

export default function DashboardSupervisi({ onBack }: DashboardSupervisiProps) {
  return (
    <div className="w-full animate-in fade-in zoom-in-95 duration-500 pb-12">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold text-sm bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm transition-all"
        >
          <ArrowLeft size={16} />
          Kembali
        </button>
        <h1 className="text-2xl font-black text-slate-800">Dashboard Evaluasi Supervisi</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-500">Total Supervisi</h3>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="text-4xl font-black text-slate-800">124</div>
          <p className="text-sm font-bold text-emerald-500 mt-2">+12% dari bulan lalu</p>
          <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors"></div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-500">Unit Disupervisi</h3>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center">
              <Users size={20} />
            </div>
          </div>
          <div className="text-4xl font-black text-slate-800">28</div>
          <p className="text-xs font-bold text-slate-400 mt-2">Dari total 32 unit</p>
          <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-colors"></div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-500">Rata-rata Nilai</h3>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="text-4xl font-black text-slate-800">86%</div>
          <p className="text-sm font-bold text-emerald-500 mt-2">Kategori BAIK</p>
          <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors"></div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-500">Perlu Tindak Lanjut</h3>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
              <ShieldAlert size={20} />
            </div>
          </div>
          <div className="text-4xl font-black text-slate-800">5</div>
          <p className="text-sm font-bold text-rose-500 mt-2">Unit dengan nilai &lt; 70%</p>
          <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/10 transition-colors"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Trend Nilai Supervisi</h3>
          <div className="h-64 w-full bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
             <p className="text-slate-400 font-bold text-sm">Line Chart (Recharts) akan diimplementasikan disini</p>
          </div>
        </div>
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Pencapaian Unit</h3>
          <div className="h-64 w-full bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
             <p className="text-slate-400 font-bold text-sm">Bar Chart (Recharts) akan diimplementasikan disini</p>
          </div>
        </div>
      </div>
    </div>
  );
}
