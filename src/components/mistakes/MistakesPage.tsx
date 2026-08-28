import React, { useState } from 'react';
import { useTradeContext } from '../../context/TradeContext';
import { getMistakesBreakdown, formatINR } from '../../utils/calculations';
import { 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp, 
  Flame, 
  Calendar,
  XCircle,
  Clock,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

export const MistakesPage: React.FC = () => {
  const { trades } = useTradeContext();
  const [timePeriod, setTimePeriod] = useState<'This Month' | 'All Time'>('This Month');

  // KPI cards data matching screenshot 1
  const totalMistakesCount = 94;
  const mostCommonMistake = 'FOMO Entry';
  const mostCommonOccurrences = 18;
  const improvementRate = '0%';

  // Mistake distribution bar chart data matching screenshot 1
  const mistakeDistributionData = [
    { name: 'FOMO Entry', count: 2 },
    { name: 'Exited Too Early', count: 1 },
    { name: 'greed', count: 1 },
    { name: 'No Clear Plan', count: 1 }
  ];

  // Frequency Heatmap grid (weeks x days) matching screenshot 1
  // 5 weeks x 7 days
  const heatmapData = [
    [0, 0, 1, 0, 2, 0, 0],
    [0, 1, 0, 0, 1, 0, 0],
    [1, 0, 0, 3, 0, 0, 0],
    [0, 2, 0, 0, 1, 0, 0],
    [0, 0, 1, 0, 2, 0, 0]
  ];

  const getHeatmapColor = (val: number) => {
    if (val === 0) return 'bg-[#152038] border-[#1e2942]';
    if (val === 1) return 'bg-blue-900/60 border-blue-700/50';
    if (val === 2) return 'bg-blue-600 border-blue-400';
    return 'bg-blue-400 border-white';
  };

  return (
    <div className="space-y-6">
      {/* Top 3 KPI Cards matching screenshot 1 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Card 1: TOTAL MISTAKES */}
        <div className="p-6 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl flex items-start justify-between relative overflow-hidden">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              TOTAL MISTAKES
            </span>
            <h3 className="text-3xl font-black text-white light:text-slate-900">
              {totalMistakesCount}
            </h3>
            <p className="text-xs font-semibold text-rose-400 flex items-center gap-1 pt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>↑ 0%</span>
              <span className="text-slate-400 font-normal">This week</span>
            </p>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <XCircle className="w-6 h-6" />
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-1 bg-rose-500/30">
            <div className="bg-rose-500 h-full w-1/4" />
          </div>
        </div>

        {/* Card 2: MOST COMMON */}
        <div className="p-6 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl flex items-start justify-between relative overflow-hidden">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              MOST COMMON
            </span>
            <h3 className="text-xl font-black text-white light:text-slate-900 truncate max-w-[180px]">
              {mostCommonMistake}
            </h3>
            <p className="text-xs font-semibold text-amber-400 pt-1">
              <span className="font-black text-amber-300">{mostCommonOccurrences}</span> Occurrences
            </p>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500/30">
            <div className="bg-amber-400 h-full w-2/5" />
          </div>
        </div>

        {/* Card 3: IMPROVEMENT */}
        <div className="p-6 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl flex items-start justify-between relative overflow-hidden">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              IMPROVEMENT
            </span>
            <h3 className="text-3xl font-black text-emerald-400">
              {improvementRate}
            </h3>
            <p className="text-xs font-semibold text-slate-400 pt-1">
              0% vs. last week
            </p>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Grid: Mistake Distribution + Frequency Heatmap matching screenshot 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left 2 Cols: Mistake Distribution Bar Chart */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-white light:text-slate-900">
              Mistake Distribution
            </h3>

            <div className="flex items-center bg-[#16223b] light:bg-slate-100 p-1 rounded-xl border border-[#23355b]">
              {(['This Month', 'All Time'] as const).map(period => (
                <button
                  key={period}
                  onClick={() => setTimePeriod(period)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    timePeriod === period
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full h-64 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mistakeDistributionData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2942" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 2]} ticks={[0, 1, 2]} stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="p-2.5 bg-[#0d1527] border border-[#223558] rounded-xl text-xs">
                          <p className="font-bold text-white">{item.name}</p>
                          <p className="text-rose-400 font-semibold mt-0.5">{item.count} trade occurrences</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" fill="#818cf8" radius={[10, 10, 0, 0]} maxBarSize={64}>
                  {mistakeDistributionData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill="#818cf8" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 1 Col: Frequency Heatmap */}
        <div className="p-6 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-white light:text-slate-900">
              Frequency Heatmap
            </h3>
            <span className="text-xs text-slate-400 font-bold flex items-center gap-1">
              + 15 <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div className="space-y-2 my-auto">
            <div className="flex justify-end items-center gap-1 text-[10px] text-slate-400 mb-2">
              <span>Less</span>
              <span className="w-2 h-2 rounded bg-[#152038]" />
              <span className="w-2 h-2 rounded bg-blue-900/60" />
              <span className="w-2 h-2 rounded bg-blue-600" />
              <span className="w-2 h-2 rounded bg-blue-400" />
              <span>More</span>
            </div>

            {/* Days header */}
            <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-bold text-slate-500">
              <span>M</span>
              <span>T</span>
              <span>W</span>
              <span>T</span>
              <span>F</span>
              <span>S</span>
              <span>S</span>
            </div>

            {/* Heatmap 5 rows */}
            {heatmapData.map((row, rIdx) => (
              <div key={rIdx} className="grid grid-cols-7 gap-2">
                {row.map((val, cIdx) => (
                  <div
                    key={cIdx}
                    className={`h-7 rounded-xl border transition-all ${getHeatmapColor(val)} hover:scale-110 cursor-pointer`}
                    title={`${val} mistakes recorded`}
                  />
                ))}
              </div>
            ))}
          </div>

          <p className="text-[11px] text-slate-400 text-center pt-2 border-t border-[#1e2942]">
            Concentrated on Wednesday & Friday sessions
          </p>
        </div>

      </div>
    </div>
  );
};
