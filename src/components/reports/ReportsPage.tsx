import React, { useState } from 'react';
import { useTradeContext } from '../../context/TradeContext';
import { 
  BarChart3, 
  Download, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Target, 
  ShieldCheck, 
  PieChart as PieChartIcon, 
  Scale, 
  Award, 
  Activity, 
  Percent, 
  FileText,
  DollarSign,
  ChevronDown,
  Trophy
} from 'lucide-react';
import { formatINR, calculateDashboardStats } from '../../utils/calculations';

export const ReportsPage: React.FC = () => {
  const { trades, dateFilter, setDateFilter, marketFilter, setMarketFilter, exportCsv } = useTradeContext();
  const [activeReportTab, setActiveReportTab] = useState<'All' | 'Performance' | 'Psychology' | 'Risk' | 'Journal'>('All');

  const stats = calculateDashboardStats(trades);
  const validTrades = trades.filter(t => !t.isNoTradeDay);

  // Dynamic calculations
  const totalVolume = validTrades.reduce((sum, t) => sum + (t.totalAmount || t.entryPrice * t.quantity), 0);
  const totalFees = validTrades.reduce((sum, t) => sum + t.fees, 0);
  const winningTradesList = validTrades.filter(t => t.netPnl > 0);
  const losingTradesList = validTrades.filter(t => t.netPnl < 0);
  const avgWin = winningTradesList.length > 0 ? winningTradesList.reduce((sum, t) => sum + t.netPnl, 0) / winningTradesList.length : 0;
  const avgLoss = losingTradesList.length > 0 ? Math.abs(losingTradesList.reduce((sum, t) => sum + t.netPnl, 0) / losingTradesList.length) : 0;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#111a2e] light:bg-white p-5 rounded-3xl border border-[#1e2942] light:border-slate-200 shadow-xl">
        <div>
          <h2 className="text-xl font-black text-white light:text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-400" />
            Comprehensive Analytics & Reports
          </h2>
          <p className="text-xs text-slate-400">
            Deep dive into execution quality, win rate matrix, and capital performance
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={exportCsv}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#16223b] light:bg-slate-100 hover:bg-[#202f50] text-slate-300 light:text-slate-800 text-xs font-semibold border border-[#23355b]"
            title="Export CSV"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 12-Card Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* Card 1: Trade Performance */}
        <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400">Trade Performance</span>
              <div className="text-xl font-black text-white light:text-slate-900 mt-0.5">
                <span className="text-emerald-400">{stats.winningTrades}</span> / <span className="text-rose-400">{stats.losingTrades}</span> / <span className="text-slate-400">{stats.breakevenTrades}</span>
              </div>
              <p className="text-[10px] text-slate-400">Win / Loss / Break Even</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1e2942] text-xs">
            <div className="p-2.5 rounded-xl bg-[#16223b] light:bg-slate-50 border border-[#23355b]">
              <span className="text-[10px] text-slate-400">Avg Win</span>
              <p className="font-bold text-emerald-400 mt-0.5">{formatINR(avgWin)}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-[#16223b] light:bg-slate-50 border border-[#23355b]">
              <span className="text-[10px] text-slate-400">Avg Loss</span>
              <p className="font-bold text-rose-400 mt-0.5">{formatINR(avgLoss)}</p>
            </div>
          </div>
        </div>

        {/* Card 2: Daily Performance */}
        <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400">Net P&L (August 2026)</span>
              <div className={`text-xl font-black mt-0.5 ${stats.totalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatINR(stats.totalPnl)}
              </div>
              <p className="text-[10px] text-slate-400">Profit Factor: {stats.profitFactor}</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1e2942] text-xs">
            <div className="p-2.5 rounded-xl bg-[#16223b] light:bg-slate-50 border border-[#23355b]">
              <span className="text-[10px] text-slate-400">Win Rate</span>
              <p className="font-bold text-emerald-400 mt-0.5">{stats.winRate}%</p>
            </div>
            <div className="p-2.5 rounded-xl bg-[#16223b] light:bg-slate-50 border border-[#23355b]">
              <span className="text-[10px] text-slate-400">Total Trades</span>
              <p className="font-bold text-white light:text-slate-900 mt-0.5">{validTrades.length}</p>
            </div>
          </div>
        </div>

        {/* Card 3: Capital & Volume */}
        <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400">Turnover & Charges</span>
              <div className="text-xl font-black text-white light:text-slate-900 mt-0.5">
                {formatINR(totalVolume)}
              </div>
              <p className="text-[10px] text-slate-400">Total Volume Traded</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1e2942] text-xs">
            <div className="p-2.5 rounded-xl bg-[#16223b] light:bg-slate-50 border border-[#23355b]">
              <span className="text-[10px] text-slate-400">Brokerage & Fees</span>
              <p className="font-bold text-rose-400 mt-0.5">{formatINR(totalFees)}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-[#16223b] light:bg-slate-50 border border-[#23355b]">
              <span className="text-[10px] text-slate-400">Net Return</span>
              <p className={`font-bold mt-0.5 ${stats.totalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatINR(stats.totalPnl)}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
