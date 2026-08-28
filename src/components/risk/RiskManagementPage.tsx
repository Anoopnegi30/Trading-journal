import React, { useState } from 'react';
import { useTradeContext } from '../../context/TradeContext';
import { 
  Scale, 
  TrendingDown, 
  TrendingUp, 
  ShieldAlert, 
  ShieldCheck, 
  Crosshair, 
  Percent, 
  Calendar,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
  Cell,
  PieChart,
  Pie
} from 'recharts';

export const RiskManagementPage: React.FC = () => {
  const { marketFilter, setMarketFilter } = useTradeContext();
  const [period, setPeriod] = useState<'30D' | '90D' | '1Y'>('30D');

  // Top 4 KPI metrics matching screenshot 2
  const avgRiskPerTrade = '5.04%';
  const todaysAvgRisk = '0%';
  const maxRiskTaken = '11.41%';
  const maxDrawdown = '25.01%';

  // Historical vs Today Bar Chart Data matching screenshot 2
  const riskHistoryData = [
    { day: 'Wed 13', risk: 7.2 },
    { day: 'Thu 14', risk: 0 },
    { day: 'Fri 15', risk: 0 },
    { day: 'Sat 16', risk: 0 },
    { day: 'Sun 17', risk: 0 },
    { day: 'Mon 18', risk: 4.8 },
    { day: 'Today', risk: 0 }
  ];

  // Risk-Reward Scatter Plot Data matching screenshot 1
  const scatterData = [
    { risk: 1.8, reward: 8, name: 'Trade 1' },
    { risk: 3.2, reward: 14, name: 'Trade 2' },
    { risk: 3.8, reward: 15, name: 'Trade 3' },
    { risk: 4.2, reward: 22, name: 'Trade 4' },
    { risk: 11.2, reward: 52, name: 'Trade 5' },
    { risk: 7.0, reward: 58, isBest: true, name: 'Best R:R (SENSEX Trade)' }
  ];

  // Stop-Loss Discipline Donut Data matching screenshot 1
  const stopLossData = [
    { name: 'With SL', value: 47, color: '#10b981' },
    { name: 'Without SL', value: 53, color: '#1e2942' }
  ];

  return (
    <div className="space-y-6">
      {/* Header matching screenshot 2 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#111a2e] light:bg-white p-5 rounded-3xl border border-[#1e2942] light:border-slate-200 shadow-xl">
        <div>
          <h2 className="text-xl font-black text-white light:text-slate-900 tracking-tight">
            Risk Management
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={marketFilter}
            onChange={(e) => setMarketFilter(e.target.value)}
            className="bg-[#16223b] light:bg-slate-100 text-slate-200 text-xs font-semibold rounded-xl px-3.5 py-2 border border-[#23355b] focus:outline-none cursor-pointer"
          >
            <option value="Indian">Indian</option>
            <option value="Crypto">Crypto</option>
            <option value="Forex">Forex</option>
          </select>

          <div className="flex items-center bg-[#16223b] light:bg-slate-100 p-1 rounded-xl border border-[#23355b]">
            {(['30D', '90D', '1Y'] as const).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  period === p
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Top 4 KPI Cards matching screenshot 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: AVG RISK / TRADE */}
        <div className="p-6 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-2 relative overflow-hidden">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            AVG RISK / TRADE
          </span>
          <h3 className="text-3xl font-black text-white light:text-slate-900">
            {avgRiskPerTrade}
          </h3>
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-400">Last 30 days</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
              ↑ 1.05%
            </span>
          </div>
        </div>

        {/* Card 2: TODAY'S AVG RISK */}
        <div className="p-6 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-2 relative overflow-hidden">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            TODAY'S AVG RISK
          </span>
          <h3 className="text-3xl font-black text-white light:text-slate-900">
            {todaysAvgRisk}
          </h3>
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-400">0 trades today</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              ↓ 5.0%
            </span>
          </div>
        </div>

        {/* Card 3: MAX RISK TAKEN */}
        <div className="p-6 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-2 relative overflow-hidden">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            MAX RISK TAKEN
          </span>
          <h3 className="text-3xl font-black text-white light:text-slate-900">
            {maxRiskTaken}
          </h3>
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-400">Highest single trade</span>
            <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-[#16223b] text-slate-300 border border-[#23355b]">
              All time
            </span>
          </div>
        </div>

        {/* Card 4: MAX DRAWDOWN */}
        <div className="p-6 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-2 relative overflow-hidden">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            MAX DRAWDOWN
          </span>
          <h3 className="text-3xl font-black text-white light:text-slate-900">
            {maxDrawdown}
          </h3>
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-400">Deepest experienced</span>
            <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-[#16223b] text-slate-300 border border-[#23355b]">
              All time
            </span>
          </div>
        </div>

      </div>

      {/* Middle Row: Historical vs Today Bar Chart + Comparison Card matching screenshot 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Bar Chart */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white light:text-slate-900 flex items-center gap-2">
              <span className="w-1 h-3.5 bg-rose-500 rounded-full" /> Avg Risk — Historical vs Today
            </h3>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-600" /> Historical</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500" /> Today</span>
            </div>
          </div>

          <div className="w-full h-56 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskHistoryData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2942" vertical={false} />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 10]} ticks={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]} stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="p-2 bg-[#0d1527] border border-[#223558] rounded-xl text-xs">
                          <p className="font-bold text-white">{item.day}</p>
                          <p className="text-rose-400 font-bold mt-0.5">{item.risk}% Risk Taken</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="risk" fill="#334155" radius={[6, 6, 0, 0]} maxBarSize={28}>
                  {riskHistoryData.map((entry, index) => (
                    <Cell
                      key={`risk-bar-${index}`}
                      fill={entry.day === 'Today' ? '#f43f5e' : '#334155'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: TODAY VS HISTORICAL Comparison */}
        <div className="p-6 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              TODAY VS HISTORICAL
            </span>
            <h3 className="text-3xl font-black text-emerald-400 mt-2">
              -5.04%
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Lower than your last 30 days average.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#1e2942] text-xs">
            <div className="p-3 rounded-2xl bg-[#16223b] light:bg-slate-50 border border-[#23355b]">
              <span className="text-slate-400 text-[10px]">Historical avg</span>
              <p className="font-bold text-white mt-0.5">5.04%</p>
            </div>
            <div className="p-3 rounded-2xl bg-[#16223b] light:bg-slate-50 border border-[#23355b]">
              <span className="text-slate-400 text-[10px]">Today's avg</span>
              <p className="font-bold text-white mt-0.5">0%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Risk-Reward Scatter + Stop-Loss Discipline matching screenshot 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left 2 Cols: Risk-Reward Scatter Plot */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white light:text-slate-900 flex items-center gap-2">
              <span className="w-1 h-3.5 bg-emerald-400 rounded-full" /> Risk–Reward Scatter
            </h3>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-500" /> Trades</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" /> Best R:R</span>
            </div>
          </div>

          <div className="w-full h-64 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2942" />
                <XAxis type="number" dataKey="risk" name="Risk" domain={[0, 12]} ticks={[0, 2, 4, 6, 8, 10, 12]} stroke="#94a3b8" fontSize={11} unit="%" />
                <YAxis type="number" dataKey="reward" name="Reward" domain={[0, 60]} ticks={[0, 10, 20, 30, 40, 50, 60]} stroke="#64748b" fontSize={11} unit="%" />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="p-2.5 bg-[#0d1527] border border-[#223558] rounded-xl text-xs">
                          <p className="font-bold text-white">{item.name}</p>
                          <p className="text-slate-400 mt-0.5">Risk: {item.risk}% | Reward: <span className="text-emerald-400 font-bold">{item.reward}%</span></p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="Trades" data={scatterData}>
                  {scatterData.map((entry, index) => (
                    <Cell
                      key={`scatter-cell-${index}`}
                      fill={entry.isBest ? '#10b981' : '#64748b'}
                      r={entry.isBest ? 8 : 5}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 1 Col: Stop-Loss Discipline & Gauge matching screenshot 1 */}
        <div className="p-6 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white light:text-slate-900 flex items-center gap-2">
              <span className="w-1 h-3.5 bg-blue-500 rounded-full" /> Stop-Loss Discipline
            </h3>
            <span className="text-xs text-slate-400 font-bold">+ 10 &gt;</span>
          </div>

          {/* Semi-Circle / Donut Gauge */}
          <div className="relative w-full h-36 flex items-center justify-center my-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stopLossData}
                  cx="50%"
                  cy="70%"
                  startAngle={180}
                  endAngle={0}
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {stopLossData.map((entry, index) => (
                    <Cell key={`gauge-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute top-16 text-center pointer-events-none">
              <span className="text-2xl font-black text-white light:text-slate-900">47%</span>
              <p className="text-[10px] text-slate-400 font-medium">with SL</p>
            </div>
          </div>

          {/* Metrics breakdown list */}
          <div className="space-y-2 pt-2 border-t border-[#1e2942] text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Trades with SL</span>
              <span className="font-bold text-white">47%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">SL Respected</span>
              <span className="font-bold text-emerald-400">47%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">SL Violated</span>
              <span className="font-bold text-slate-400">0%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Without SL</span>
              <span className="font-bold text-rose-400">53%</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
