import React from 'react';
import { useTradeContext } from '../../context/TradeContext';
import { calculateDashboardStats } from '../../utils/calculations';
import { KpiCards } from './KpiCards';
import { ConfidenceIndex } from './ConfidenceIndex';
import { CumulativePnlChart } from './CumulativePnlChart';
import { WinLossDonut } from './WinLossDonut';
import { StrategyPnlChart } from './StrategyPnlChart';
import { MistakesBreakdown } from './MistakesBreakdown';
import { DailyPnlChart } from './DailyPnlChart';
import { RecentTrades } from './RecentTrades';
import { Plus, Globe, Calendar as CalendarIcon, Filter } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { 
    trades, 
    marketFilter, 
    setMarketFilter, 
    dateFilter, 
    setDateFilter,
    setIsNewTradeModalOpen 
  } = useTradeContext();

  const stats = calculateDashboardStats(trades);

  return (
    <div className="space-y-5">
      {/* Top filter toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#111a2e]/60 light:bg-white/80 p-3.5 rounded-2xl border border-[#1e2942] light:border-slate-200">
        <div>
          <h2 className="text-lg font-black text-white light:text-slate-900 tracking-tight">
            Trading Performance
          </h2>
          <p className="text-xs text-slate-400">
            Real-time analytics and psychological discipline tracking
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Market dropdown */}
          <div className="relative">
            <select
              value={marketFilter}
              onChange={(e) => setMarketFilter(e.target.value)}
              className="bg-[#16223b] light:bg-slate-100 text-slate-200 light:text-slate-800 border border-[#23355b] light:border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer appearance-none pr-8"
            >
              <option value="Indian">🇮🇳 Indian Markets</option>
              <option value="Crypto">🪙 Crypto</option>
              <option value="Forex">💱 Forex</option>
              <option value="US Stocks">🇺🇸 US Stocks</option>
            </select>
            <div className="absolute right-2.5 top-2.5 pointer-events-none text-slate-400">
              ▼
            </div>
          </div>

          {/* Date range filter */}
          <div className="relative">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-[#16223b] light:bg-slate-100 text-slate-200 light:text-slate-800 border border-[#23355b] light:border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer appearance-none pr-8"
            >
              <option value="Last 30 Days">📅 Last 30 Days</option>
              <option value="This Month">📅 This Month</option>
              <option value="Last Month">📅 Last Month</option>
              <option value="All Time">📅 All Time</option>
            </select>
            <div className="absolute right-2.5 top-2.5 pointer-events-none text-slate-400">
              ▼
            </div>
          </div>

          {/* Primary CTA */}
          <button
            onClick={() => setIsNewTradeModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all transform active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            New Trade
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <KpiCards stats={stats} />

      {/* Confidence Index Meter */}
      <ConfidenceIndex stats={stats} />

      {/* Grid: Cumulative PnL + Top Trades */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <CumulativePnlChart trades={trades} />
        </div>
        <div className="lg:col-span-1">
          <RecentTrades />
        </div>
      </div>

      {/* Grid: Win/Loss Donut + Strategy PnL */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <WinLossDonut stats={stats} />
        <StrategyPnlChart trades={trades} />
      </div>

      {/* Grid: Mistakes Breakdown + Daily PnL */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <MistakesBreakdown trades={trades} />
        <DailyPnlChart trades={trades} />
      </div>
    </div>
  );
};
