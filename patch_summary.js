const fs = require('fs');
let code = fs.readFileSync('src/pages/risiko.tsx', 'utf8');

const oldSummary = `const SummaryCard = ({ title, value, icon: Icon, colorClass }: any) => {
  const bgColorClass = colorClass.split(' ')[0];
  const borderColorClass = bgColorClass.replace('bg-', 'border-').replace('slate', 'gray');

  return (
    <motion.div 
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
      className={\`bg-white p-6 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 border-b-[6px] \${borderColorClass} flex flex-col justify-between relative overflow-hidden group min-h-[140px]\`}
    >
      <div className="flex justify-between items-start w-full relative z-10">`;

const newSummary = `const SummaryCard = ({ title, value, icon: Icon, colorClass, borderColorClass }: any) => {
  return (
    <motion.div 
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
      className={\`bg-white p-6 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 border-b-[6px] \${borderColorClass} flex flex-col justify-between relative overflow-hidden group min-h-[140px]\`}
    >
      <div className="flex justify-between items-start w-full relative z-10">`;

code = code.replace(oldSummary, newSummary);

code = code.replace(
  '<SummaryCard title="Total Unit" value={totalUnits} icon={Building2} colorClass="bg-blue-500 text-white" />',
  '<SummaryCard title="Total Unit" value={totalUnits} icon={Building2} colorClass="bg-blue-500 text-white" borderColorClass="border-blue-500" />'
);
code = code.replace(
  '<SummaryCard title="Unit Sudah Mengisi" value={unitsFilled} icon={CheckCircle2} colorClass="bg-emerald-500 text-white" />',
  '<SummaryCard title="Unit Sudah Mengisi" value={unitsFilled} icon={CheckCircle2} colorClass="bg-emerald-500 text-white" borderColorClass="border-emerald-500" />'
);
code = code.replace(
  '<SummaryCard title="Unit Belum Mengisi" value={unitsNotFilled} icon={XCircle} colorClass="bg-orange-500 text-white" />',
  '<SummaryCard title="Unit Belum Mengisi" value={unitsNotFilled} icon={XCircle} colorClass="bg-orange-500 text-white" borderColorClass="border-orange-500" />'
);
code = code.replace(
  '<SummaryCard title="Total Risiko" value={totalRisks} icon={AlertTriangle} colorClass="bg-slate-700 text-white" />',
  '<SummaryCard title="Total Risiko" value={totalRisks} icon={AlertTriangle} colorClass="bg-slate-700 text-white" borderColorClass="border-slate-700" />'
);
code = code.replace(
  '<SummaryCard title="Risiko Extreme" value={extremeRisks} icon={Activity} colorClass="bg-red-500 text-white" />',
  '<SummaryCard title="Risiko Extreme" value={extremeRisks} icon={Activity} colorClass="bg-red-500 text-white" borderColorClass="border-red-500" />'
);
code = code.replace(
  '<SummaryCard title="Rata-rata Score" value={avgRiskScore} icon={TrendingUp} colorClass="bg-indigo-500 text-white" />',
  '<SummaryCard title="Rata-rata Score" value={avgRiskScore} icon={TrendingUp} colorClass="bg-indigo-500 text-white" borderColorClass="border-indigo-500" />'
);

fs.writeFileSync('src/pages/risiko.tsx', code);
