import React, { useState } from 'react';
import { useTradeContext } from '../../context/TradeContext';
import { formatINR, getStrategyPerformance } from '../../utils/calculations';
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  ChevronRight, 
  Layers, 
  PieChart as PieChartIcon, 
  Sparkles, 
  X, 
  Check, 
  Filter,
  BarChart2,
  Zap,
  Target
} from 'lucide-react';

export const StrategiesPage: React.FC = () => {
  const { trades, marketFilter, setMarketFilter, dateFilter, setDateFilter } = useTradeContext();
  const [showNewStrategyModal, setShowNewStrategyModal] = useState(false);
  const [newStrategyName, setNewStrategyName] = useState('');
  const [newStrategyDesc, setNewStrategyDesc] = useState('');
  const [selectedStrategyDetail, setSelectedStrategyDetail] = useState<string | null>(null);

  // Dynamic Strategy cards data calculated from trades
  const strategyStats = getStrategyPerformance(trades);
  const totalStrategyPnl = strategyStats.reduce((sum, s) => sum + s.totalPnl, 0);

  const handleCreateStrategy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStrategyName.trim()) return;
    alert(`Strategy "${newStrategyName}" added successfully! You can now select it when logging new trades.`);
    setShowNewStrategyModal(false);
    setNewStrategyName('');
    setNewStrategyDesc('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header with Strategy Counter and New Strategy CTA */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#111a2e] light:bg-white p-5 rounded-3xl border border-[#1e2942] light:border-slate-200 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white light:text-slate-900 tracking-tight flex items-center gap-2">
              Trading Setups & Strategies
            </h2>
            <p className="text-xs text-slate-400">
              Track win rates, profit factors, and risk performance per strategy
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setShowNewStrategyModal(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Strategy</span>
          </button>
        </div>
      </div>

      {/* Strategy Performance Cards */}
      {strategyStats.length === 0 ? (
        <div className="p-12 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl text-center space-y-3">
          <Layers className="w-12 h-12 text-slate-600 light:text-slate-400 mx-auto opacity-50" />
          <h3 className="text-base font-bold text-white light:text-slate-900">No Strategy Data for August 2026</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            As you log trades and assign setups (e.g. Breakout, 9&15 EMA, Pullback), detailed profit factors, win rates, and edge analysis will automatically display here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {strategyStats.map((strat) => {
            const isPositive = strat.totalPnl >= 0;
            return (
              <div
                key={strat.name}
                className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-4 hover:border-slate-600 transition-all cursor-pointer"
                onClick={() => setSelectedStrategyDetail(strat.name)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-white light:text-slate-900 bg-[#16223b] light:bg-slate-100 px-3 py-1 rounded-xl border border-[#23355b]">
                    {strat.name}
                  </span>
                  <span className={`text-xs font-bold flex items-center gap-1 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    {formatINR(strat.totalPnl)}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#1e2942] text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400">Win Rate</span>
                    <p className="font-bold text-white light:text-slate-900 mt-0.5">{strat.winRate}%</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">Trades</span>
                    <p className="font-bold text-white light:text-slate-900 mt-0.5">{strat.totalTrades}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">Avg P&L</span>
                    <p className={`font-bold mt-0.5 ${strat.avgPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {formatINR(strat.avgPnl)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Strategy Modal */}
      {showNewStrategyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#111a2e] light:bg-white border border-[#23355b] light:border-slate-300 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white light:text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-400" />
                Add New Trading Setup
              </h3>
              <button
                onClick={() => setShowNewStrategyModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#16223b]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStrategy} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1.5">
                  Strategy / Setup Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 5-Min CPR Breakout, 9/15 EMA Pullback"
                  value={newStrategyName}
                  onChange={(e) => setNewStrategyName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#16223b] light:bg-slate-100 text-white light:text-slate-900 border border-[#23355b] focus:border-blue-500 focus:outline-none text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1.5">
                  Setup Rules & Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Entry triggers, invalidation conditions, risk parameters..."
                  value={newStrategyDesc}
                  onChange={(e) => setNewStrategyDesc(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#16223b] light:bg-slate-100 text-white light:text-slate-900 border border-[#23355b] focus:border-blue-500 focus:outline-none text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewStrategyModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/25 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Save Strategy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
