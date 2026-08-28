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
  Target,
  CheckCircle2
} from 'lucide-react';

export const StrategiesPage: React.FC = () => {
  const { trades, strategies, addStrategy } = useTradeContext();
  const [showNewStrategyModal, setShowNewStrategyModal] = useState(false);
  const [newStrategyName, setNewStrategyName] = useState('');
  const [newStrategyDesc, setNewStrategyDesc] = useState('');
  const [newTargetWinRate, setNewTargetWinRate] = useState('60%');
  const [newTargetRR, setNewTargetRR] = useState('1:2.5');
  const [newTimeframe, setNewTimeframe] = useState('5 Min');

  // Dynamic Strategy performance calculated from real trades
  const strategyStats = getStrategyPerformance(trades);
  const statsMap = new Map(strategyStats.map(s => [s.name.toLowerCase().trim(), s]));

  const handleCreateStrategy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStrategyName.trim()) return;

    addStrategy({
      name: newStrategyName.trim(),
      description: newStrategyDesc.trim() || 'Custom technical trading setup.',
      targetWinRate: newTargetWinRate,
      targetRiskReward: newTargetRR,
      timeframe: newTimeframe,
      active: true
    });

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
              Trading Setups & Strategies ({strategies.length})
            </h2>
            <p className="text-xs text-slate-400">
              Your defined trading setups, target parameters, and real-time execution performance
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

      {/* Strategy Performance & Setup Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {strategies.map((strat) => {
          const perf = statsMap.get(strat.name.toLowerCase().trim());
          const hasTrades = perf && perf.totalTrades > 0;
          const isPositive = hasTrades ? perf.totalPnl >= 0 : true;

          return (
            <div
              key={strat.id}
              className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-4 hover:border-slate-600 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-white light:text-slate-900 bg-[#16223b] light:bg-slate-100 px-3 py-1 rounded-xl border border-[#23355b]">
                    {strat.name}
                  </span>
                  <span className={`text-xs font-bold flex items-center gap-1 ${
                    !hasTrades ? 'text-slate-400' : isPositive ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {hasTrades ? (
                      <>
                        {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        {formatINR(perf.totalPnl)}
                      </>
                    ) : (
                      <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        Active Setup
                      </span>
                    )}
                  </span>
                </div>

                <p className="text-xs text-slate-300 light:text-slate-600 leading-relaxed">
                  {strat.description}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#1e2942] light:border-slate-200 text-xs">
                <div className="p-2 rounded-xl bg-[#16223b]/60 light:bg-slate-50 border border-[#23355b]/50">
                  <span className="text-[10px] text-slate-400">Target Win</span>
                  <p className="font-bold text-white light:text-slate-900 mt-0.5">{strat.targetWinRate || '60%'}</p>
                </div>
                <div className="p-2 rounded-xl bg-[#16223b]/60 light:bg-slate-50 border border-[#23355b]/50">
                  <span className="text-[10px] text-slate-400">Target R:R</span>
                  <p className="font-bold text-white light:text-slate-900 mt-0.5">{strat.targetRiskReward || '1:2.5'}</p>
                </div>
                <div className="p-2 rounded-xl bg-[#16223b]/60 light:bg-slate-50 border border-[#23355b]/50">
                  <span className="text-[10px] text-slate-400">Aug Trades</span>
                  <p className="font-bold text-blue-400 mt-0.5">{hasTrades ? perf.totalTrades : '0'}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1.5">
                    Target Win Rate
                  </label>
                  <input
                    type="text"
                    value={newTargetWinRate}
                    onChange={(e) => setNewTargetWinRate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#16223b] light:bg-slate-100 text-white light:text-slate-900 border border-[#23355b] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1.5">
                    Target R:R
                  </label>
                  <input
                    type="text"
                    value={newTargetRR}
                    onChange={(e) => setNewTargetRR(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#16223b] light:bg-slate-100 text-white light:text-slate-900 border border-[#23355b] text-xs"
                  />
                </div>
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
