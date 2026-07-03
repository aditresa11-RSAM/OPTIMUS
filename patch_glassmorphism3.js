const fs = require('fs');
let code = fs.readFileSync('src/pages/risiko.tsx', 'utf8');

const oldSummary = `const SummaryCard = ({ title, value, icon: Icon, shadowClass, colorClass }: any) => {
  return (
    <motion.div 
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
      className={\`bg-white/80 backdrop-blur-xl p-6 rounded-[24px] shadow-lg \${shadowClass} flex flex-col justify-between relative overflow-hidden group min-h-[140px]\`}
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
      className={\`bg-white/80 backdrop-blur-xl p-6 rounded-[24px] shadow-lg \${shadowClass} flex flex-col justify-between relative overflow-hidden group min-h-[140px]\`}
    >
      <div className="flex justify-between items-start w-full relative z-10">
        <div className="space-y-1">
          <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">{title}</p>
          <p className="text-4xl font-black text-slate-800 tracking-tight">{value}</p>
        </div>
        <div className={\`flex items-center justify-center \${textClass}\`}>
          <Icon size={36} strokeWidth={2.5} />
        </div>
      </div>
    </motion.div>
  );
};`;

code = code.replace(oldSummary, newSummary);

code = code.replace(
  '<SummaryCard title="Total Unit" value={totalUnits} icon={Building2} shadowClass="shadow-blue-500/40" colorClass="bg-blue-500 text-white" />',
  '<SummaryCard title="Total Unit" value={totalUnits} icon={Building2} shadowClass="shadow-blue-500/40" textClass="text-blue-500" />'
);
code = code.replace(
  '<SummaryCard title="Unit Sudah Mengisi" value={unitsFilled} icon={CheckCircle2} shadowClass="shadow-emerald-500/40" colorClass="bg-emerald-500 text-white" />',
  '<SummaryCard title="Unit Sudah Mengisi" value={unitsFilled} icon={CheckCircle2} shadowClass="shadow-emerald-500/40" textClass="text-emerald-500" />'
);
code = code.replace(
  '<SummaryCard title="Unit Belum Mengisi" value={unitsNotFilled} icon={XCircle} shadowClass="shadow-orange-500/40" colorClass="bg-orange-500 text-white" />',
  '<SummaryCard title="Unit Belum Mengisi" value={unitsNotFilled} icon={XCircle} shadowClass="shadow-orange-500/40" textClass="text-orange-500" />'
);
code = code.replace(
  '<SummaryCard title="Total Risiko" value={totalRisks} icon={AlertTriangle} shadowClass="shadow-slate-500/40" colorClass="bg-slate-700 text-white" />',
  '<SummaryCard title="Total Risiko" value={totalRisks} icon={AlertTriangle} shadowClass="shadow-slate-500/40" textClass="text-slate-600" />'
);
code = code.replace(
  '<SummaryCard title="Risiko Extreme" value={extremeRisks} icon={Activity} shadowClass="shadow-red-500/40" colorClass="bg-red-500 text-white" />',
  '<SummaryCard title="Risiko Extreme" value={extremeRisks} icon={Activity} shadowClass="shadow-red-500/40" textClass="text-red-500" />'
);
code = code.replace(
  '<SummaryCard title="Rata-rata Score" value={avgRiskScore} icon={TrendingUp} shadowClass="shadow-indigo-500/40" colorClass="bg-indigo-500 text-white" />',
  '<SummaryCard title="Rata-rata Score" value={avgRiskScore} icon={TrendingUp} shadowClass="shadow-indigo-500/40" textClass="text-indigo-500" />'
);

fs.writeFileSync('src/pages/risiko.tsx', code);
