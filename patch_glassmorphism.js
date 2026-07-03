const fs = require('fs');
let code = fs.readFileSync('src/pages/risiko.tsx', 'utf8');

const oldSummary = `const SummaryCard = ({ title, value, icon: Icon, colorClass, borderColorClass }: any) => {
  return (
    <motion.div 
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
      className={\`bg-white p-6 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 border-b-[6px] \${borderColorClass} flex flex-col justify-between relative overflow-hidden group min-h-[140px]\`}
    >
      <div className="flex justify-between items-start w-full relative z-10">
        <div className="space-y-1">
          <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">{title}</p>
          <p className="text-4xl font-black text-slate-800 tracking-tight">{value}</p>
        </div>
        <div className={\`w-14 h-14 rounded-[18px] flex items-center justify-center shadow-sm \${colorClass}\`}>
          <Icon size={26} strokeWidth={2.5} className="opacity-90" />
        </div>
      </div>
    </motion.div>
  );
};`;

const newSummary = `const SummaryCard = ({ title, value, icon: Icon, shadowClass, textClass }: any) => {
  return (
    <motion.div 
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
      className={\`bg-white/80 backdrop-blur-xl p-6 rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] \${shadowClass} border border-white/50 flex flex-col justify-between relative overflow-hidden group min-h-[140px]\`}
    >
      <div className="flex justify-between items-start w-full relative z-10">
        <div className="space-y-1">
          <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">{title}</p>
          <p className="text-4xl font-black text-slate-800 tracking-tight">{value}</p>
        </div>
        <div className={\`flex items-center justify-center \${textClass}\`}>
          <Icon size={32} strokeWidth={2.5} />
        </div>
      </div>
    </motion.div>
  );
};`;

code = code.replace(oldSummary, newSummary);

code = code.replace(
  '<SummaryCard title="Total Unit" value={totalUnits} icon={Building2} colorClass="bg-blue-500 text-white" borderColorClass="border-blue-500" />',
  '<SummaryCard title="Total Unit" value={totalUnits} icon={Building2} shadowClass="shadow-xl shadow-blue-500/20" textClass="text-blue-500" />'
);
code = code.replace(
  '<SummaryCard title="Unit Sudah Mengisi" value={unitsFilled} icon={CheckCircle2} colorClass="bg-emerald-500 text-white" borderColorClass="border-emerald-500" />',
  '<SummaryCard title="Unit Sudah Mengisi" value={unitsFilled} icon={CheckCircle2} shadowClass="shadow-xl shadow-emerald-500/20" textClass="text-emerald-500" />'
);
code = code.replace(
  '<SummaryCard title="Unit Belum Mengisi" value={unitsNotFilled} icon={XCircle} colorClass="bg-orange-500 text-white" borderColorClass="border-orange-500" />',
  '<SummaryCard title="Unit Belum Mengisi" value={unitsNotFilled} icon={XCircle} shadowClass="shadow-xl shadow-orange-500/20" textClass="text-orange-500" />'
);
code = code.replace(
  '<SummaryCard title="Total Risiko" value={totalRisks} icon={AlertTriangle} colorClass="bg-slate-700 text-white" borderColorClass="border-slate-700" />',
  '<SummaryCard title="Total Risiko" value={totalRisks} icon={AlertTriangle} shadowClass="shadow-xl shadow-slate-500/20" textClass="text-slate-600" />'
);
code = code.replace(
  '<SummaryCard title="Risiko Extreme" value={extremeRisks} icon={Activity} colorClass="bg-red-500 text-white" borderColorClass="border-red-500" />',
  '<SummaryCard title="Risiko Extreme" value={extremeRisks} icon={Activity} shadowClass="shadow-xl shadow-red-500/20" textClass="text-red-500" />'
);
code = code.replace(
  '<SummaryCard title="Rata-rata Score" value={avgRiskScore} icon={TrendingUp} colorClass="bg-indigo-500 text-white" borderColorClass="border-indigo-500" />',
  '<SummaryCard title="Rata-rata Score" value={avgRiskScore} icon={TrendingUp} shadowClass="shadow-xl shadow-indigo-500/20" textClass="text-indigo-500" />'
);

fs.writeFileSync('src/pages/risiko.tsx', code);
