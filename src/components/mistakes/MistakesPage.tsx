import React, { useState } from 'react';
import { useTradeContext } from '../../context/TradeContext';
import { 
  AlertTriangle, 
  HelpCircle, 
  Flame, 
  TrendingDown, 
  CheckCircle, 
  Calendar,
  Sparkles
} from 'lucide-react';
import { formatINR, getMistakesBreakdown } from '../../utils/calculations';
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
  const [timePeriod, setTimePeriod] = useState<'August 2026' | 'All Time'>('August 2026');

  // Dynamic calculations from trades
  const mistakeList = getMistakesBreakdown(trades);
  const totalMistakesCount = mistakeList.reduce((sum, m) => sum + m.tradeCount, 0);
  const totalLossFromMistakes = mistakeList.reduce((sum, m) => sum + m.totalLoss, 0);
  const mostCommon = mistakeList.length > 0 ? mistakeList[0].name : 'None';

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#111a2e] light:bg-white p-5 rounded-3xl border border-[#1e2942] light:border-slate-200 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white light:text-slate-900 tracking-tight flex items-center gap-2">
              Mistakes Tracker & Analytics
            </h2>
            <p className="text-xs text-slate-400">
              Eliminate recurring psychological leaks like FOMO, early exit, and revenge trading
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl">
          <span className="text-xs font-bold text-slate-400">Total Mistakes</span>
          <div className="text-2xl font-black text-white light:text-slate-900 mt-1">
            {totalMistakesCount}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Logged in {timePeriod}</p>
        </div>

        <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl">
          <span className="text-xs font-bold text-slate-400">Most Common Leak</span>
          <div className="text-2xl font-black text-rose-400 mt-1 truncate">
            {mostCommon}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Identified pattern</p>
        </div>

        <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl">
          <span className="text-xs font-bold text-slate-400">Total Capital Cost</span>
          <div className="text-2xl font-black text-rose-400 mt-1">
            {totalLossFromMistakes > 0 ? `-${formatINR(totalLossFromMistakes)}` : '₹0.00'}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Estimated cost of execution leaks</p>
        </div>
      </div>

      {/* Distribution Chart or Empty State */}
      {mistakeList.length === 0 ? (
        <div className="p-12 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl text-center space-y-3">
          <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto opacity-70" />
          <h3 className="text-base font-bold text-white light:text-slate-900">Zero Execution Mistakes for August 2026</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            You have zero mistakes recorded. Whenever you log a trade with tag errors (like FOMO, Greed, Early Exit), frequency charts and leak analyses will generate here.
          </p>
        </div>
      ) : (
        <div className="p-6 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white light:text-slate-900">
            Mistake Distribution & Financial Impact
          </h3>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mistakeList} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2942" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="p-2.5 bg-[#0d1527] border border-[#223558] rounded-xl text-xs">
                          <p className="font-bold text-white">{item.name}</p>
                          <p className="text-rose-400 font-bold mt-0.5">Total Cost: -{formatINR(item.totalLoss)}</p>
                          <p className="text-slate-400 text-[11px]">Occurrences: {item.tradeCount}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="tradeCount" fill="#f43f5e" radius={[6, 6, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
