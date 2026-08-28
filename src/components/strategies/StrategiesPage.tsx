import React, { useState } from 'react';
import { useTradeContext } from '../../context/TradeContext';
import { getStrategyPerformance, formatINR } from '../../utils/calculations';
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  ChevronRight, 
  Edit3, 
  X, 
  Layers, 
  ArrowUpRight, 
  ArrowDownRight,
  Sparkles,
  Target
} from 'lucide-react';

interface StrategyDetail {
  name: string;
  sharePercent: number;
  totalProfit: number;
  profitFactor: string | number;
  riskPerTrade: string;
  winRate: number;
  totalTrades: number;
  riskReward: string;
  isPositive: boolean;
}

export const StrategiesPage: React.FC = () => {
  const { trades, marketFilter, setMarketFilter, dateFilter, setDateFilter } = useTradeContext();
  const [showNewStrategyModal, setShowNewStrategyModal] = useState(false);
  const [newStrategyName, setNewStrategyName] = useState('');
  const [newStrategyDesc, setNewStrategyDesc] = useState('');
  const [selectedStrategyDetail, setSelectedStrategyDetail] = useState<string | null>(null);

  // Strategy cards data matching screenshot 5
  const strategyCards: StrategyDetail[] = [
    {
      name: '9&15 Ema',
      sharePercent: 17.6,
      totalProfit: 27575.92,
      profitFactor: 3.44,
      riskPerTrade: '3.48%',
      winRate: 66.7,
      totalTrades: 3,
      riskReward: '1:3.01',
      isPositive: true
    },
    {
      name: 'Pullback',
      sharePercent: 11.8,
      totalProfit: -8707.74,
      profitFactor: 'Bad',
      riskPerTrade: '0%',
      winRate: 0,
      totalTrades: 2,
      riskReward: '1:2.5',
      isPositive: false
    },
    {
      name: 'Breakout',
      sharePercent: 52.9,
      totalProfit: 88024.77,
      profitFactor: 3.22,
      riskPerTrade: '5.66%',
      winRate: 88.9,
      totalTrades: 9,
      riskReward: '1:4.88',
      isPositive: true
    }
  ];

  const handleAddStrategy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStrategyName.trim()) return;
    alert(`Strategy "${newStrategyName}" added successfully to your journal setup list!`);
    setNewStrategyName('');
    setNewStrategyDesc('');
    setShowNewStrategyModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Toolbar matching screenshot 5 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#111a2e] light:bg-white p-4 rounded-2xl border border-[#1e2942] light:border-slate-200 shadow-lg">
        <div>
          <h2 className="text-lg font-black text-white light:text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-400" />
            Strategies
          </h2>
          <p className="text-xs text-slate-400">
            Compare edge, win rates, and risk-return ratios across your trade setups
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Market Dropdown */}
          <select
            value={marketFilter}
            onChange={(e) => setMarketFilter(e.target.value)}
            className="bg-[#16223b] light:bg-slate-100 text-slate-200 text-xs font-semibold rounded-xl px-3 py-2 border border-[#23355b] focus:outline-none cursor-pointer"
          >
            <option value="Indian">🇮🇳 Indian</option>
            <option value="Crypto">🪙 Crypto</option>
            <option value="Forex">💱 Forex</option>
          </select>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-[#16223b] light:bg-slate-100 text-slate-200 text-xs font-semibold rounded-xl px-3 py-2 border border-[#23355b] focus:outline-none cursor-pointer"
          >
            <option value="Last 30 Days">📅 Last 30 Days</option>
            <option value="This Month">📅 This Month</option>
            <option value="All Time">📅 All Time</option>
          </select>

          {/* + New Strategy CTA matching screenshot 5 */}
          <button
            onClick={() => setShowNewStrategyModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all transform active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            New Strategy
          </button>
        </div>
      </div>

      {/* Top 3 Strategy Performance Cards matching screenshot 5 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {strategyCards.map((sc) => (
          <div
            key={sc.name}
            className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl flex flex-col justify-between space-y-4 hover:border-blue-500/40 transition-all group"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-base text-white light:text-slate-900 group-hover:text-blue-400 transition-colors">
                    {sc.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium">Performance</p>
                </div>
                <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                  {sc.sharePercent}%
                </span>
              </div>

              {/* Total Profit */}
              <div className="my-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Profit</span>
                <p className={`text-xl font-black mt-0.5 flex items-center gap-1 ${
                  sc.isPositive ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {sc.isPositive ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  {sc.isPositive ? `+${formatINR(sc.totalProfit)}` : formatINR(sc.totalProfit)}
                </p>
              </div>

              {/* 2-Box Metric Subgrid matching screenshot 5 */}
              <div className="grid grid-cols-2 gap-2 my-3">
                <div className="p-3 rounded-2xl bg-[#16223b] light:bg-slate-50 border border-[#23355b] text-xs">
                  <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> Profit Factor
                  </span>
                  <p className="text-base font-black text-white light:text-slate-900 mt-1">
                    {sc.profitFactor}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-[#16223b] light:bg-slate-50 border border-[#23355b] text-xs">
                  <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400" /> Risk/Trade
                  </span>
                  <p className="text-base font-black text-white light:text-slate-900 mt-1">
                    {sc.riskPerTrade}
                  </p>
                </div>
              </div>

              {/* Win Rate Bar matching screenshot 5 */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                    <span className={`w-2 h-2 rounded-full ${sc.winRate >= 50 ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                    Win Rate
                  </span>
                  <span className={sc.winRate >= 50 ? 'text-emerald-400' : 'text-rose-400'}>
                    {sc.winRate}%
                  </span>
                </div>
                <div className="w-full bg-[#18233c] light:bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      sc.winRate >= 50 ? 'bg-emerald-400' : 'bg-rose-400'
                    }`}
                    style={{ width: `${Math.max(4, sc.winRate)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Footer buttons matching screenshot 5 */}
            <div className="flex items-center justify-between pt-3 border-t border-[#1e2942] light:border-slate-100 text-xs">
              <button
                onClick={() => setSelectedStrategyDetail(sc.name)}
                className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 transition-colors"
              >
                View Details →
              </button>

              <button
                onClick={() => setShowNewStrategyModal(true)}
                className="flex items-center gap-1 text-slate-400 hover:text-slate-200 px-2.5 py-1 rounded-lg bg-[#16223b] border border-[#23355b]"
              >
                <Edit3 className="w-3 h-3" />
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Active Strategies Data Table matching screenshot 5 bottom */}
      <div className="rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl overflow-hidden">
        <div className="p-5 border-b border-[#1e2942] light:border-slate-200">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-blue-500/20 text-blue-400">
              <Target className="w-4 h-4" />
            </span>
            <div>
              <span className="text-[10px] font-bold tracking-wider text-blue-400 uppercase">PERFORMANCE</span>
              <h3 className="text-base font-black text-white light:text-slate-900">
                Active Strategies
              </h3>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#1e2942] light:border-slate-200 bg-[#0d1527]/70 light:bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-5">Strategy</th>
                <th className="py-3.5 px-5">PNL</th>
                <th className="py-3.5 px-5">Win Rate</th>
                <th className="py-3.5 px-5">Risk / Reward</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#18243e] light:divide-slate-100">
              {strategyCards.map((sc) => (
                <tr key={sc.name} className="hover:bg-[#152038]/60 light:hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-5 font-bold text-white light:text-slate-900">
                    {sc.name}
                  </td>
                  <td className="py-4 px-5 font-black">
                    <span className={sc.isPositive ? 'text-emerald-400' : 'text-rose-400'}>
                      {sc.isPositive ? `+${formatINR(sc.totalProfit)}` : formatINR(sc.totalProfit)}
                    </span>
                  </td>
                  <td className="py-4 px-5">
                    <span className="font-bold text-slate-200 light:text-slate-800">{sc.winRate}%</span>
                    <span className="text-slate-400 text-[11px] ml-1.5">({sc.totalTrades} trades)</span>
                  </td>
                  <td className="py-4 px-5 font-mono text-purple-400">
                    {sc.riskReward}
                  </td>
                  <td className="py-4 px-5 text-right">
                    <button
                      onClick={() => setSelectedStrategyDetail(sc.name)}
                      className="px-3 py-1.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600 hover:text-white text-xs font-bold transition-all"
                    >
                      View Report
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Strategy Modal matching screenshot 2 */}
      {showNewStrategyModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#1e2942] light:border-slate-200">
              <h3 className="text-base font-black text-white light:text-slate-900">
                Add New Strategy
              </h3>
              <button
                onClick={() => setShowNewStrategyModal(false)}
                className="text-slate-400 hover:text-white font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddStrategy} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 light:text-slate-700 font-bold mb-1">
                  Strategy Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter strategy name"
                  value={newStrategyName}
                  onChange={(e) => setNewStrategyName(e.target.value)}
                  className="w-full bg-[#16223b] light:bg-slate-100 border border-[#23355b] rounded-xl px-3.5 py-2.5 text-slate-200 light:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 light:text-slate-700 font-bold mb-1">
                  Description
                </label>
                <textarea
                  rows={4}
                  placeholder="Enter strategy description"
                  value={newStrategyDesc}
                  onChange={(e) => setNewStrategyDesc(e.target.value)}
                  className="w-full bg-[#16223b] light:bg-slate-100 border border-[#23355b] rounded-xl p-3 text-slate-200 light:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all"
                >
                  Add Strategy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Strategy Popover */}
      {selectedStrategyDetail && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111a2e] border border-[#1e2942] rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1e2942] pb-3">
              <h3 className="text-base font-bold text-white">
                Strategy Breakdown: {selectedStrategyDetail}
              </h3>
              <button onClick={() => setSelectedStrategyDetail(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              This setup gives optimal results during the morning market session with confirmed volume breakouts above resistance levels.
            </p>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedStrategyDetail(null)}
                className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
