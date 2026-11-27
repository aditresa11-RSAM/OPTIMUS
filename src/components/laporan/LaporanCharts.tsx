import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
} from "recharts";
import { MonthColumn } from "./laporanAggregation";

interface InmChartProps {
  title: string;
  prevYear: string;
  currYear: string;
  monthCols: MonthColumn[];
  prevValues: Array<number | null>;
  currValues: Array<number | null>;
  targetNum: number;
  useBar?: boolean;
}

export const InmComparisonChart: React.FC<InmChartProps> = ({
  title,
  prevYear,
  currYear,
  monthCols,
  prevValues,
  currValues,
  targetNum,
  useBar = false,
}) => {
  const data = monthCols.map((m, idx) => ({
    name: m.short,
    [prevYear]: prevValues[idx] ?? 0,
    [currYear]: currValues[idx] ?? 0,
    Standar: targetNum,
  }));

  const maxVal = Math.max(
    100,
    targetNum,
    ...prevValues.map((v) => v ?? 0),
    ...currValues.map((v) => v ?? 0),
  );
  const yDomain: [number, number] = [0, Math.ceil(maxVal / 10) * 10];

  return (
    <div className="border border-slate-400/90 rounded-lg bg-white px-4 py-3 my-2.5 break-inside-avoid">
      <p className="text-center text-[10.5pt] font-bold text-slate-900 uppercase mb-2 leading-[1.35]">
        {title}
      </p>
      <div className="w-full h-[215px]">
        <ResponsiveContainer width="100%" height="100%">
          {useBar ? (
            <BarChart data={data} margin={{ top: 18, right: 20, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
              <XAxis
                dataKey="name"
                interval={0}
                tick={{ fontSize: 10, fill: "#1e293b", fontFamily: "Arial" }}
              />
              <YAxis domain={yDomain} tick={{ fontSize: 10, fill: "#1e293b", fontFamily: "Arial" }} />
              <Tooltip contentStyle={{ fontSize: "11px", fontFamily: "Arial" }} />
              <Legend wrapperStyle={{ fontSize: "11px", fontFamily: "Arial" }} />
              <Bar dataKey={prevYear} fill="#60a5fa" isAnimationActive={false} radius={[3, 3, 0, 0]}>
                <LabelList dataKey={prevYear} position="top" style={{ fontSize: 9.5, fill: "#1e3a8a", fontFamily: "Arial" }} />
              </Bar>
              <Bar dataKey={currYear} fill="#059669" isAnimationActive={false} radius={[3, 3, 0, 0]}>
                <LabelList dataKey={currYear} position="top" style={{ fontSize: 9.5, fill: "#065f46", fontWeight: 700, fontFamily: "Arial" }} />
              </Bar>
              <Bar dataKey="Standar" fill="#f59e0b" isAnimationActive={false} radius={[3, 3, 0, 0]} />
            </BarChart>
          ) : (
            <LineChart data={data} margin={{ top: 18, right: 24, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
              <XAxis
                dataKey="name"
                interval={0}
                tick={{ fontSize: 10, fill: "#1e293b", fontFamily: "Arial" }}
              />
              <YAxis domain={yDomain} tick={{ fontSize: 10, fill: "#1e293b", fontFamily: "Arial" }} />
              <Tooltip contentStyle={{ fontSize: "11px", fontFamily: "Arial" }} />
              <Legend wrapperStyle={{ fontSize: "11px", fontFamily: "Arial" }} />
              <Line
                type="monotone"
                dataKey={prevYear}
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 3.5 }}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey={currYear}
                stroke="#059669"
                strokeWidth={2.5}
                dot={{ r: 4 }}
                isAnimationActive={false}
              >
                <LabelList dataKey={currYear} position="top" style={{ fontSize: 9.5, fill: "#065f46", fontWeight: 700, fontFamily: "Arial" }} />
              </Line>
              <Line
                type="monotone"
                dataKey="Standar"
                stroke="#dc2626"
                strokeWidth={2}
                strokeDasharray="5 4"
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

interface SingleTargetChartProps {
  title: string;
  labels: string[];
  values: Array<number | null>;
  targetNum: number;
  compact?: boolean;
  size?: "compact" | "normal" | "large";
}

export const SingleTargetLineChart: React.FC<SingleTargetChartProps> = ({
  title,
  labels,
  values,
  targetNum,
  compact = false,
  size,
}) => {
  const resolvedSize: "compact" | "normal" | "large" =
    size || (compact ? "compact" : "normal");
  const isAnnual = labels.length > 6;

  const data = labels.map((lbl, idx) => ({
    name: lbl,
    Capaian: values[idx] ?? 0,
    Standar: targetNum,
  }));

  const maxVal = Math.max(100, targetNum, ...values.map((v) => v ?? 0));
  const yDomain: [number, number] = [0, Math.ceil(maxVal / 10) * 10];

  const heightClass =
    resolvedSize === "large"
      ? isAnnual
        ? "w-full h-[275px]"
        : "w-full h-[230px]"
      : resolvedSize === "compact"
        ? "w-full h-[155px]"
        : "w-full h-[215px]";

  const boxClass =
    resolvedSize === "large"
      ? "border border-slate-400/90 rounded-lg bg-white px-4 py-3.5 my-2.5 break-inside-avoid"
      : resolvedSize === "compact"
        ? "border border-slate-300 rounded-md bg-white p-2 break-inside-avoid"
        : "border border-slate-300 rounded-md bg-white p-3.5 my-3 break-inside-avoid";

  const titleClass =
    resolvedSize === "large"
      ? "text-center font-bold text-slate-900 uppercase mb-2.5 text-[11pt] leading-[1.35]"
      : resolvedSize === "compact"
        ? "text-center font-bold text-slate-800 uppercase mb-1.5 text-[9.5px] line-clamp-2"
        : "text-center font-bold text-slate-900 uppercase mb-2 text-[10.5pt] leading-[1.35]";

  const tickSize = resolvedSize === "large" ? 11 : resolvedSize === "compact" ? 9 : 10;

  return (
    <div className={boxClass}>
      <p className={titleClass}>{title}</p>
      <div className={heightClass}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={
              resolvedSize === "large"
                ? { top: 20, right: 24, left: 4, bottom: 8 }
                : { top: 16, right: 18, left: -4, bottom: 4 }
            }
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
            <XAxis
              dataKey="name"
              interval={0}
              tick={{ fontSize: tickSize, fill: "#1e293b", fontFamily: "Arial" }}
            />
            <YAxis
              domain={yDomain}
              tick={{ fontSize: tickSize, fill: "#1e293b", fontFamily: "Arial" }}
            />
            <Tooltip contentStyle={{ fontSize: "11px", fontFamily: "Arial" }} />
            <Legend
              wrapperStyle={{
                fontSize: resolvedSize === "large" ? "11.5px" : "10.5px",
                paddingTop: "6px",
                fontFamily: "Arial",
              }}
            />
            <Line
              type="monotone"
              dataKey="Standar"
              stroke="#2563eb"
              strokeWidth={resolvedSize === "large" ? 2.5 : 2}
              strokeDasharray="5 4"
              dot={{ r: resolvedSize === "large" ? 3.5 : 2.5 }}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="Capaian"
              stroke="#ea580c"
              strokeWidth={resolvedSize === "large" ? 3 : 2.5}
              dot={{ r: resolvedSize === "large" ? 4.5 : 3.5 }}
              isAnimationActive={false}
            >
              <LabelList
                dataKey="Capaian"
                position="top"
                offset={8}
                style={{
                  fontSize: resolvedSize === "large" ? 10.5 : 9,
                  fill: "#9a3412",
                  fontWeight: 700,
                  fontFamily: "Arial",
                }}
              />
            </Line>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const IkpPieChartBox: React.FC<{
  title: string;
  items: Array<{ name: string; value: number; color: string }>;
}> = ({ title, items }) => {
  const total = items.reduce((acc, x) => acc + x.value, 0);
  const chartData = total > 0 ? items : [{ name: "Nihil (0)", value: 1, color: "#cbd5e1" }];

  return (
    <div className="border border-slate-300 rounded-md bg-white p-3 my-3 break-inside-avoid">
      <p className="text-center text-[11px] font-bold text-slate-800 uppercase mb-2">{title}</p>
      <div className="w-full h-[210px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={68}
              isAnimationActive={false}
              label={({ name, value }) => (total > 0 ? `${name}: ${value}` : "0 Laporan")}
            >
              {chartData.map((entry, idx) => (
                <Cell key={idx} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ fontSize: "11px" }} />
            <Legend wrapperStyle={{ fontSize: "10.5px" }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const IkpTrendLineChart: React.FC<{
  title: string;
  rows: Array<{
    monthUpper: string;
    knc: number;
    ktc: number;
    ktd: number;
    kpc: number;
    sentinel: number;
  }>;
}> = ({ title, rows }) => {
  return (
    <div className="border border-slate-300 rounded-md bg-white p-3 my-3 break-inside-avoid">
      <p className="text-center text-[11px] font-bold text-slate-800 uppercase mb-2">{title}</p>
      <div className="w-full h-[210px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows} margin={{ top: 14, right: 20, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="monthUpper" tick={{ fontSize: 10 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
            <Tooltip contentStyle={{ fontSize: "11px" }} />
            <Legend wrapperStyle={{ fontSize: "10.5px" }} />
            <Line type="monotone" dataKey="knc" name="KNC" stroke="#2563eb" strokeWidth={2} isAnimationActive={false} />
            <Line type="monotone" dataKey="ktc" name="KTC" stroke="#16a34a" strokeWidth={2} isAnimationActive={false} />
            <Line type="monotone" dataKey="ktd" name="KTD" stroke="#eab308" strokeWidth={2} isAnimationActive={false} />
            <Line type="monotone" dataKey="kpc" name="KPC" stroke="#0d9488" strokeWidth={2.5} isAnimationActive={false} />
            <Line type="monotone" dataKey="sentinel" name="SENTINEL" stroke="#dc2626" strokeWidth={2} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const IkpGroupedBarChart: React.FC<{
  title: string;
  categories: string[];
  monthNames: string[];
  matrix: number[][]; // [categoryIdx][monthIdx]
}> = ({ title, categories, monthNames, matrix }) => {
  const palette = ["#2563eb", "#ea580c", "#16a34a", "#7c3aed", "#0891b2", "#dc2626"];
  const data = categories.map((cat, cIdx) => {
    const row: Record<string, any> = {
      kategori: cat.length > 26 ? `${cat.slice(0, 24)}…` : cat,
    };
    monthNames.forEach((m, mIdx) => {
      row[m] = matrix[cIdx]?.[mIdx] ?? 0;
    });
    return row;
  });

  if (data.length === 0) {
    return null;
  }

  return (
    <div className="border border-slate-300 rounded-md bg-white p-3 my-3 break-inside-avoid">
      <p className="text-center text-[11px] font-bold text-slate-800 uppercase mb-2">{title}</p>
      <div className="w-full h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 14, right: 20, left: 0, bottom: 16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="kategori" tick={{ fontSize: 9.5 }} interval={0} />
            <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
            <Tooltip contentStyle={{ fontSize: "11px" }} />
            <Legend wrapperStyle={{ fontSize: "10.5px" }} />
            {monthNames.map((m, idx) => (
              <Bar
                key={m}
                dataKey={m}
                fill={palette[idx % palette.length]}
                isAnimationActive={false}
                radius={[2, 2, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
