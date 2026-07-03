const fs = require('fs');
let code = fs.readFileSync('src/pages/risiko.tsx', 'utf8');

// add imports
code = code.replace(
  'import Head from "next/head";',
  'import Head from "next/head";\nimport { supabase } from "@/lib/supabase";\nimport { useStore } from "@/store/useStore";'
);

// remove DUMMY_UNITS
code = code.replace(
  /const DUMMY_UNITS = \[\s*"IGD", "ICU", "Rawat Inap", "Rawat Jalan", "Farmasi", "Laboratorium", "Radiologi", "Kamar Operasi"\s*\];/,
  ''
);

// inside ManajemenRisiko
code = code.replace(
  'export default function ManajemenRisiko() {',
  `export default function ManajemenRisiko() {\n  const { units, addUnit, deleteUnit } = useStore();\n  const [isLoading, setIsLoading] = useState(true);\n  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);\n  const [newUnitName, setNewUnitName] = useState('');`
);

// add fetch from Supabase
code = code.replace(
  /const \[records, setRecords\] = useState<RiskRecord\[\]>\(initialData\);/,
  `const [records, setRecords] = useState<RiskRecord[]>([]);\n\n  useEffect(() => {\n    const fetchRecords = async () => {\n      setIsLoading(true);\n      try {\n        const { data, error } = await supabase.from('manajemen_risiko').select('*');\n        if (data && !error) {\n          const mapped = data.map(d => ({\n            id: d.id,\n            tahun: d.tahun,\n            unit: d.unit,\n            risiko: d.risiko,\n            penyebab: d.penyebab,\n            severity: d.severity,\n            probability: d.probability,\n            riskScore: d.risk_score,\n            pengelolaan: d.pengelolaan,\n            pic: d.pic,\n            grading: d.grading,\n            createdAt: d.created_at,\n            updatedAt: d.updated_at\n          }));\n          setRecords(mapped);\n        }\n      } catch (err) {}\n      setIsLoading(false);\n    };\n    fetchRecords();\n  }, []);`
);

// totalUnits calculation
code = code.replace(
  'const totalUnits = DUMMY_UNITS.length;',
  'const totalUnits = units.length;'
);

// Filter by unit
code = code.replace(
  /\{DUMMY_UNITS.map\(u => <option key=\{u\} value=\{u\}>\{u\}<\/option>\)\}/g,
  '{units.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}'
);

// Replace unit select in input tab to include add button
code = code.replace(
  /<select[\s\S]*?value=\{formData.unit\}[\s\S]*?onChange=\{\(e\) => setFormData\(\{\.\.\.formData, unit: e\.target\.value\}\)\}[\s\S]*?className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-700"[\s\S]*?>[\s\S]*?<option value="" disabled>Pilih Unit<\/option>[\s\S]*?\{units\.map\(u => <option key=\{u\.id\} value=\{u\.name\}>\{u\.name\}<\/option>\)\}[\s\S]*?<\/select>/g,
  `<div className="flex gap-2">
                        <select 
                          value={formData.unit}
                          onChange={(e) => setFormData({...formData, unit: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-700"
                        >
                          <option value="" disabled>Pilih Unit</option>
                          {units.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                        </select>
                        <button 
                          onClick={() => setIsUnitModalOpen(true)}
                          className="px-4 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 hover:bg-emerald-100 transition-colors flex items-center justify-center font-bold"
                          title="Kelola Unit"
                        >
                          <PlusCircle size={20} />
                        </button>
                      </div>`
);

// Save logic update to also save to Supabase
code = code.replace(
  'if (editingId) {',
  `
    const saveToSupabase = async (record: RiskRecord) => {
      try {
        const payload = {
          id: record.id,
          tahun: record.tahun,
          unit: record.unit,
          risiko: record.risiko,
          penyebab: record.penyebab,
          severity: record.severity,
          probability: record.probability,
          risk_score: record.riskScore,
          pengelolaan: record.pengelolaan,
          pic: record.pic,
          grading: record.grading,
          updated_at: record.updatedAt,
          created_at: record.createdAt
        };
        if (editingId) {
          await supabase.from('manajemen_risiko').update(payload).eq('id', record.id);
        } else {
          await supabase.from('manajemen_risiko').insert(payload);
        }
      } catch(e) {}
    };
    saveToSupabase(newRecord);

    if (editingId) {`
);

// Delete logic update
code = code.replace(
  /if \(recordToDelete\) \{\s*setRecords\(prev => prev\.filter\(r => r\.id !== recordToDelete\)\);\s*\}/,
  `if (recordToDelete) {
      setRecords(prev => prev.filter(r => r.id !== recordToDelete));
      supabase.from('manajemen_risiko').delete().eq('id', recordToDelete).then();
    }`
);

fs.writeFileSync('src/pages/risiko.tsx', code);
