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
  Trophy,
  ArrowRightLeft,
  CalendarDays,
  Receipt,
  AlertTriangle,
  Brain,
  CheckCircle2,
  BookOpen,
  Layers,
  Sparkles,
  Zap
} from 'lucide-react';
import { formatINR, calculateDashboardStats } from '../../utils/calculations';

type ReportTab = 'Performance' | 'Psychology' | 'Risk' | 'Journal';

export const ReportsPage: React.FC = () => {
  const { trades, dateFilter, setDateFilter, marketFilter, setMarketFilter, exportCsv } = useTradeContext();
  const [activeReportTab, setActiveReportTab] = useState<ReportTab>('Performance');

  const validTrades = trades.filter(t => !t.isNoTradeDay);
  const stats = calculateDashboardStats(trades);

  // ==========================================
  // Comprehensive Analytics Calculations
  // ==========================================
  const totalTrades = validTrades.length;
  const winTrades = validTrades.filter(t => t.netPnl > 0);
  const lossTrades = validTrades.filter(t => t.netPnl < 0);
  const breakEvenTrades = validTrades.filter(t => t.netPnl === 0);

  const winCount = winTrades.length;
  const lossCount = lossTrades.length;
  const breakEvenCount = breakEvenTrades.length;

  const totalWinPnl = winTrades.reduce((sum, t) => sum + t.netPnl, 0);
  const totalLossPnl = Math.abs(lossTrades.reduce((sum, t) => sum + t.netPnl, 0));

  const avgWin = winCount > 0 ? totalWinPnl / winCount : 0;
  const avgLoss = lossCount > 0 ? totalLossPnl / lossCount : 0;
  const winRate = totalTrades > 0 ? Math.round((winCount / totalTrades) * 100) : 0;
  const lossRate = totalTrades > 0 ? (lossCount / totalTrades) : 0;
  const expectancy = totalTrades > 0 ? ((winRate / 100) * avgWin) - (lossRate * avgLoss) : 0;

  // Group by Date for Daily Performance
  const dailyPnlMap = new Map<string, { pnl: number; trades: number; charges: number }>();
  validTrades.forEach(t => {
    const d = t.date;
    const current = dailyPnlMap.get(d) || { pnl: 0, trades: 0, charges: 0 };
    current.pnl += t.netPnl;
    current.trades += 1;
    current.charges += (t.fees || 0);
    dailyPnlMap.set(d, current);
  });

  const dailyPnls = Array.from(dailyPnlMap.values());
  const tradingDays = dailyPnls.length;
  const winDaysList = dailyPnls.filter(d => d.pnl > 0);
  const lossDaysList = dailyPnls.filter(d => d.pnl < 0);
  const breakEvenDaysList = dailyPnls.filter(d => d.pnl === 0);

  const winDays = winDaysList.length;
  const lossDays = lossDaysList.length;
  const breakEvenDays = breakEvenDaysList.length;

  const bestDay = dailyPnls.length > 0 ? Math.max(...dailyPnls.map(d => d.pnl)) : 0;
  const worstDay = dailyPnls.length > 0 ? Math.min(...dailyPnls.map(d => d.pnl)) : 0;
  const avgWinDay = winDays > 0 ? winDaysList.reduce((sum, d) => sum + d.pnl, 0) / winDays : 0;
  const avgLossDay = lossDays > 0 ? Math.abs(lossDaysList.reduce((sum, d) => sum + d.pnl, 0) / lossDays) : 0;

  // Execution Streaks
  let consecutiveWins = 0;
  let consecutiveLosses = 0;
  let currentWinStreak = 0;
  let currentLossStreak = 0;

  // Sort chronological
  const sortedTrades = [...validTrades].sort((a, b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || '')));
  sortedTrades.forEach(t => {
    if (t.netPnl > 0) {
      currentWinStreak += 1;
      currentLossStreak = 0;
      if (currentWinStreak > consecutiveWins) consecutiveWins = currentWinStreak;
    } else if (t.netPnl < 0) {
      currentLossStreak += 1;
      currentWinStreak = 0;
      if (currentLossStreak > consecutiveLosses) consecutiveLosses = currentLossStreak;
    }
  });

  // Daily Streaks
  const sortedDays = Array.from(dailyPnlMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  let consecutiveWinDays = 0;
  let consecutiveLossDays = 0;
  let curWinDays = 0;
  let curLossDays = 0;
  sortedDays.forEach(([_, data]) => {
    if (data.pnl > 0) {
      curWinDays += 1;
      curLossDays = 0;
      if (curWinDays > consecutiveWinDays) consecutiveWinDays = curWinDays;
    } else if (data.pnl < 0) {
      curLossDays += 1;
      curWinDays = 0;
      if (curLossDays > consecutiveLossDays) consecutiveLossDays = curLossDays;
    }
  });

  // Capital and Quantity Analysis
  const capitalList = validTrades.map(t => ({
    amount: t.totalAmount || (t.entryPrice * t.quantity),
    pnl: t.netPnl,
    qty: t.quantity
  }));

  const maxCapitalTrade = capitalList.length > 0 ? capitalList.reduce((prev, cur) => cur.amount > prev.amount ? cur : prev, capitalList[0]) : null;
  const minCapitalTrade = capitalList.length > 0 ? capitalList.reduce((prev, cur) => cur.amount < prev.amount ? cur : prev, capitalList[0]) : null;
  const avgCapitalUsed = capitalList.length > 0 ? capitalList.reduce((sum, c) => sum + c.amount, 0) / capitalList.length : 0;

  const maxQtyTrade = capitalList.length > 0 ? capitalList.reduce((prev, cur) => cur.qty > prev.qty ? cur : prev, capitalList[0]) : null;
  const minQtyTrade = capitalList.length > 0 ? capitalList.reduce((prev, cur) => cur.qty < prev.qty ? cur : prev, capitalList[0]) : null;
  const avgQty = capitalList.length > 0 ? capitalList.reduce((sum, c) => sum + c.qty, 0) / capitalList.length : 0;

  // Strategy Setup Effectiveness
  const strategyStatsMap = new Map<string, { trades: number; wins: number; pnl: number }>();
  validTrades.forEach(t => {
    const s = t.strategy?.trim() || 'General Setup';
    const cur = strategyStatsMap.get(s) || { trades: 0, wins: 0, pnl: 0 };
    cur.trades += 1;
    if (t.netPnl > 0) cur.wins += 1;
    cur.pnl += t.netPnl;
    strategyStatsMap.set(s, cur);
  });

  const strategyEffectiveness = Array.from(strategyStatsMap.entries()).map(([name, data]) => ({
    name,
    trades: data.trades,
    winRate: Math.round((data.wins / data.trades) * 100),
    pnl: data.pnl
  })).sort((a, b) => b.pnl - a.pnl);

  const mostProfitableStrategy = strategyEffectiveness.length > 0 && strategyEffectiveness[0].pnl > 0 
    ? strategyEffectiveness[0].name 
    : (strategyEffectiveness[0]?.name || 'N/A');

  // Symbol Breakdown
  const symbolStatsMap = new Map<string, { trades: number; wins: number; pnl: number }>();
  validTrades.forEach(t => {
    const sym = t.symbol.trim();
    const cur = symbolStatsMap.get(sym) || { trades: 0, wins: 0, pnl: 0 };
    cur.trades += 1;
    if (t.netPnl > 0) cur.wins += 1;
    cur.pnl += t.netPnl;
    symbolStatsMap.set(sym, cur);
  });

  const symbolList = Array.from(symbolStatsMap.entries()).map(([name, data]) => ({
    name,
    trades: data.trades,
    winRate: Math.round((data.wins / data.trades) * 100),
    pnl: data.pnl
  }));

  const mostTradedSymbol = symbolList.length > 0 ? symbolList.reduce((p, c) => c.trades > p.trades ? c : p, symbolList[0]).name : 'N/A';
  const mostProfitableSymbol = symbolList.length > 0 ? symbolList.reduce((p, c) => c.pnl > p.pnl ? c : p, symbolList[0]) : null;
  const leastProfitableSymbol = symbolList.length > 0 ? symbolList.reduce((p, c) => c.pnl < p.pnl ? c : p, symbolList[0]) : null;
  const highestWinRateSymbol = symbolList.length > 0 ? symbolList.reduce((p, c) => c.winRate > p.winRate ? c : p, symbolList[0]) : null;
  const lowestWinRateSymbol = symbolList.length > 0 ? symbolList.reduce((p, c) => c.winRate < p.winRate ? c : p, symbolList[0]) : null;

  // Weekday Analytics (Monday = 1, Tuesday = 2, Wednesday = 3, Thursday = 4, Friday = 5)
  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const weekdayStats: Record<string, { trades: number; wins: number; pnl: number; charges: number; rrList: number[] }> = {
    Monday: { trades: 0, wins: 0, pnl: 0, charges: 0, rrList: [] },
    Tuesday: { trades: 0, wins: 0, pnl: 0, charges: 0, rrList: [] },
    Wednesday: { trades: 0, wins: 0, pnl: 0, charges: 0, rrList: [] },
    Thursday: { trades: 0, wins: 0, pnl: 0, charges: 0, rrList: [] },
    Friday: { trades: 0, wins: 0, pnl: 0, charges: 0, rrList: [] }
  };

  validTrades.forEach(t => {
    const dayIdx = new Date(t.date).getDay(); // 0 = Sun, 1 = Mon, ...
    const dayName = weekdays[dayIdx - 1];
    if (dayName && weekdayStats[dayName]) {
      weekdayStats[dayName].trades += 1;
      if (t.netPnl > 0) weekdayStats[dayName].wins += 1;
      weekdayStats[dayName].pnl += t.netPnl;
      weekdayStats[dayName].charges += (t.fees || 0);
      weekdayStats[dayName].rrList.push(2.0); // default base R:R
    }
  });

  const weekdayPnlList = Object.entries(weekdayStats).filter(([_, data]) => data.trades > 0);
  const mostProfitableWeekday = weekdayPnlList.length > 0 
    ? weekdayPnlList.reduce((p, c) => c[1].pnl > p[1].pnl ? c : p, weekdayPnlList[0])[0] 
    : 'None';
  const leastProfitableWeekday = weekdayPnlList.length > 0 
    ? weekdayPnlList.reduce((p, c) => c[1].pnl < p[1].pnl ? c : p, weekdayPnlList[0])[0] 
    : 'None';

  // Daily Trade Activity
  const avgTradesPerDay = tradingDays > 0 ? Number((totalTrades / tradingDays).toFixed(1)) : 0;
  const maxTradesInADay = dailyPnls.length > 0 ? Math.max(...dailyPnls.map(d => d.trades)) : 0;
  const daysWithOnly1Trade = dailyPnls.filter(d => d.trades === 1).length;
  const overtradingDays = dailyPnls.filter(d => d.trades >= 7).length;

  return (
    <div className="space-y-6">
      {/* Top Header with Navigation Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#111a2e] light:bg-white p-5 rounded-3xl border border-[#1e2942] light:border-slate-200 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white light:text-slate-900 tracking-tight flex items-center gap-2">
              Performance & Trading Reports
            </h2>
            <p className="text-xs text-slate-400">
              In-depth execution quality, psychological metrics, and weekday win rate matrix
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap">
          <button
            onClick={exportCsv}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#16223b] light:bg-slate-100 hover:bg-[#202f50] text-slate-300 light:text-slate-800 text-xs font-semibold border border-[#23355b] cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Sub-tabs Ribbon matching tradediary.in */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#0e1628] light:bg-slate-200 border border-[#1e2942] light:border-slate-300 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveReportTab('Performance')}
          className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeReportTab === 'Performance'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#16223b]/60'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Performance</span>
        </button>

        <button
          onClick={() => setActiveReportTab('Psychology')}
          className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeReportTab === 'Psychology'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#16223b]/60'
          }`}
        >
          <Brain className="w-4 h-4" />
          <span>Psychology</span>
        </button>

        <button
          onClick={() => setActiveReportTab('Risk')}
          className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeReportTab === 'Risk'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#16223b]/60'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Risk</span>
        </button>

        <button
          onClick={() => setActiveReportTab('Journal')}
          className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeReportTab === 'Journal'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#16223b]/60'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Journal</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: PERFORMANCE (12 Comprehensive Cards matching screenshots) */}
      {/* ========================================================================= */}
      {activeReportTab === 'Performance' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          
          {/* Card 1: Trade Performance */}
          <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400">Trade Performance</span>
                <div className="text-2xl font-black mt-1">
                  <span className="text-emerald-400">{winCount}</span> <span className="text-slate-500">/</span> <span className="text-rose-400">{lossCount}</span> <span className="text-slate-500">/</span> <span className="text-slate-400">{breakEvenCount}</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Win / Loss / Break Even</p>
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
                <p className="font-bold text-rose-400 mt-0.5">{avgLoss > 0 ? `-${formatINR(avgLoss)}` : '₹0'}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-[#16223b] light:bg-slate-50 border border-[#23355b]">
                <span className="text-[10px] text-slate-400">Win Rate</span>
                <p className="font-bold text-white light:text-slate-900 mt-0.5">{winRate}%</p>
              </div>
              <div className="p-2.5 rounded-xl bg-[#16223b] light:bg-slate-50 border border-[#23355b]">
                <span className="text-[10px] text-slate-400">Expectancy</span>
                <p className={`font-bold mt-0.5 ${expectancy >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {expectancy >= 0 ? '+' : ''}{formatINR(expectancy)}
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Daily Performance */}
          <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400">Daily Performance</span>
                <div className="text-2xl font-black mt-1">
                  <span className="text-emerald-400">{winDays}</span> <span className="text-slate-500">/</span> <span className="text-rose-400">{lossDays}</span> <span className="text-slate-500">/</span> <span className="text-slate-400">{breakEvenDays}</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Win / Loss / Break Even Days</p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1e2942] text-xs">
              <div className="p-2.5 rounded-xl bg-[#16223b] light:bg-slate-50 border border-[#23355b]">
                <span className="text-[10px] text-slate-400">Best Day</span>
                <p className="font-bold text-emerald-400 mt-0.5">{bestDay > 0 ? `+${formatINR(bestDay)}` : '₹0'}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-[#16223b] light:bg-slate-50 border border-[#23355b]">
                <span className="text-[10px] text-slate-400">Worst Day</span>
                <p className="font-bold text-rose-400 mt-0.5">{worstDay < 0 ? formatINR(worstDay) : '₹0'}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-[#16223b] light:bg-slate-50 border border-[#23355b]">
                <span className="text-[10px] text-slate-400">Avg Win Day</span>
                <p className="font-bold text-emerald-400 mt-0.5">{formatINR(avgWinDay)}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-[#16223b] light:bg-slate-50 border border-[#23355b]">
                <span className="text-[10px] text-slate-400">Avg Loss Day</span>
                <p className="font-bold text-rose-400 mt-0.5">{avgLossDay > 0 ? `-${formatINR(avgLossDay)}` : '₹0'}</p>
              </div>
            </div>
          </div>

          {/* Card 3: Trade Execution */}
          <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Trade Execution</span>
              <div className="w-10 h-10 rounded-2xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
                <ArrowRightLeft className="w-5 h-5" />
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-[#1e2942]">
                <span className="text-slate-400">Total Trades</span>
                <span className="font-bold text-white light:text-slate-900 font-mono">{totalTrades}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#1e2942]">
                <span className="text-slate-400">Avg Capital Used</span>
                <span className="font-bold text-white light:text-slate-900 font-mono">{formatINR(avgCapitalUsed)}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#1e2942]">
                <span className="text-slate-400">Most Profitable Strategy</span>
                <span className="font-bold text-emerald-400">{mostProfitableStrategy}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#1e2942]">
                <span className="text-slate-400">Consecutive Wins</span>
                <span className="font-bold text-emerald-400 font-mono">{consecutiveWins}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400">Consecutive Losses</span>
                <span className="font-bold text-rose-400 font-mono">{consecutiveLosses}</span>
              </div>
            </div>
          </div>

          {/* Card 4: Time Metrics */}
          <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Time Metrics</span>
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-[#1e2942]">
                <span className="text-slate-400">Trading Days</span>
                <span className="font-bold text-white light:text-slate-900 font-mono">{tradingDays}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#1e2942]">
                <span className="text-slate-400">Consecutive Win Days</span>
                <span className="font-bold text-emerald-400 font-mono">{consecutiveWinDays}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#1e2942]">
                <span className="text-slate-400">Consecutive Loss Days</span>
                <span className="font-bold text-rose-400 font-mono">{consecutiveLossDays}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#1e2942]">
                <span className="text-slate-400">Most Profitable Day</span>
                <span className="font-bold text-emerald-400">{mostProfitableWeekday}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400">Least Profitable Day</span>
                <span className="font-bold text-slate-400">{leastProfitableWeekday}</span>
              </div>
            </div>
          </div>

          {/* Card 5: Setup Effectiveness */}
          <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Setup Effectiveness</span>
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>

            <div className="space-y-2.5 text-xs max-h-52 overflow-y-auto no-scrollbar">
              {strategyEffectiveness.length === 0 ? (
                <p className="text-slate-500 text-[11px] py-4 text-center">No strategy trades executed yet</p>
              ) : (
                strategyEffectiveness.map((s) => (
                  <div key={s.name} className="flex items-center justify-between py-1 border-b border-[#1e2942]">
                    <span className="text-slate-300 light:text-slate-700 font-medium truncate max-w-[150px]">{s.name}</span>
                    <span className={`font-bold font-mono ${s.winRate >= 50 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {s.winRate}% win rate
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Card 6: Symbol Frequency */}
          <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Symbol Frequency</span>
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-[#1e2942]">
                <span className="text-slate-400">Most Traded Symbol</span>
                <span className="font-bold text-white light:text-slate-900 truncate max-w-[140px]">{mostTradedSymbol}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#1e2942]">
                <span className="text-slate-400">Most Profitable Symbol</span>
                <span className="font-bold text-emerald-400 truncate max-w-[140px]">{mostProfitableSymbol?.name || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#1e2942]">
                <span className="text-slate-400">Least Profitable Symbol</span>
                <span className="font-bold text-rose-400 truncate max-w-[140px]">{leastProfitableSymbol?.name || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#1e2942]">
                <span className="text-slate-400">Highest Win Rate</span>
                <span className="font-bold text-emerald-400">{highestWinRateSymbol ? `${highestWinRateSymbol.winRate}%` : 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400">Lowest Win Rate</span>
                <span className="font-bold text-rose-400">{lowestWinRateSymbol ? `${lowestWinRateSymbol.winRate}%` : 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Card 7: Capital Usage */}
          <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Capital Usage</span>
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-[#1e2942]">
                <span className="text-slate-400">Maximum</span>
                <span className="font-bold text-white light:text-slate-900 font-mono">{formatINR(maxCapitalTrade?.amount || 0)}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#1e2942]">
                <span className="text-slate-400">Minimum</span>
                <span className="font-bold text-white light:text-slate-900 font-mono">{formatINR(minCapitalTrade?.amount || 0)}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#1e2942]">
                <span className="text-slate-400">Average</span>
                <span className="font-bold text-white light:text-slate-900 font-mono">{formatINR(avgCapitalUsed)}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#1e2942]">
                <span className="text-slate-400">P&L at Max Capital</span>
                <span className={`font-bold font-mono ${(maxCapitalTrade?.pnl || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {(maxCapitalTrade?.pnl || 0) >= 0 ? '+' : ''}{formatINR(maxCapitalTrade?.pnl || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400">P&L at Min Capital</span>
                <span className={`font-bold font-mono ${(minCapitalTrade?.pnl || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {(minCapitalTrade?.pnl || 0) >= 0 ? '+' : ''}{formatINR(minCapitalTrade?.pnl || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Card 8: Quantity Analysis */}
          <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Quantity Analysis</span>
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-[#1e2942]">
                <span className="text-slate-400">Maximum</span>
                <span className="font-bold text-white light:text-slate-900 font-mono">{maxQtyTrade?.qty || 0}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#1e2942]">
                <span className="text-slate-400">Minimum</span>
                <span className="font-bold text-white light:text-slate-900 font-mono">{minQtyTrade?.qty || 0}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#1e2942]">
                <span className="text-slate-400">Average</span>
                <span className="font-bold text-white light:text-slate-900 font-mono">{Math.round(avgQty)}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#1e2942]">
                <span className="text-slate-400">P&L at Max Qty</span>
                <span className={`font-bold font-mono ${(maxQtyTrade?.pnl || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {(maxQtyTrade?.pnl || 0) >= 0 ? '+' : ''}{formatINR(maxQtyTrade?.pnl || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400">P&L at Min Qty</span>
                <span className={`font-bold font-mono ${(minQtyTrade?.pnl || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {(minQtyTrade?.pnl || 0) >= 0 ? '+' : ''}{formatINR(minQtyTrade?.pnl || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Card 9: Weekday Avg R:R */}
          <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Weekday Avg R:R</span>
              <div className="w-10 h-10 rounded-2xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
                <Scale className="w-5 h-5" />
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              {weekdays.map((day) => {
                const dayData = weekdayStats[day];
                const hasTrades = dayData.trades > 0;
                return (
                  <div key={day} className="flex items-center justify-between py-1 border-b border-[#1e2942] last:border-0">
                    <span className="text-slate-300 light:text-slate-700">{day}</span>
                    <span className="font-bold text-white light:text-slate-900 font-mono">
                      {hasTrades ? '1:2.0' : '1:0'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 10: Weekday Win Rate */}
          <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Weekday Win Rate</span>
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
                <CalendarDays className="w-5 h-5" />
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              {weekdays.map((day) => {
                const dayData = weekdayStats[day];
                const dayWinRate = dayData.trades > 0 ? Math.round((dayData.wins / dayData.trades) * 100) : 0;
                return (
                  <div key={day} className="flex items-center justify-between py-1 border-b border-[#1e2942] last:border-0">
                    <span className="text-slate-300 light:text-slate-700">{day}</span>
                    <span className={`font-bold font-mono ${dayData.trades === 0 ? 'text-slate-500' : dayWinRate >= 50 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {dayData.trades > 0 ? `${dayWinRate}%` : '0%'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 11: Daily Charges */}
          <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Daily Charges</span>
              <div className="w-10 h-10 rounded-2xl bg-rose-500/15 text-rose-400 flex items-center justify-center">
                <Receipt className="w-5 h-5" />
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              {weekdays.map((day) => {
                const dayData = weekdayStats[day];
                return (
                  <div key={day} className="flex items-center justify-between py-1 border-b border-[#1e2942] last:border-0">
                    <span className="text-slate-300 light:text-slate-700">{day}</span>
                    <span className="font-bold text-white light:text-slate-900 font-mono">
                      {formatINR(dayData.charges)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 12: Daily Trade Activity */}
          <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Daily Trade Activity</span>
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-[#1e2942]">
                <span className="text-slate-400">Avg Trades Per Day</span>
                <span className="font-bold text-white light:text-slate-900 font-mono">{avgTradesPerDay}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#1e2942]">
                <span className="text-slate-400">Max Trades in a Day</span>
                <span className="font-bold text-white light:text-slate-900 font-mono">{maxTradesInADay}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#1e2942]">
                <span className="text-slate-400">Days With Only 1 Trade</span>
                <span className="font-bold text-white light:text-slate-900 font-mono">{daysWithOnly1Trade}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400">Overtrading Days (&gt;7 trades)</span>
                <span className={`font-bold font-mono ${overtradingDays > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>{overtradingDays}</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PSYCHOLOGY */}
      {/* ========================================================================= */}
      {activeReportTab === 'Psychology' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Emotional Discipline Index</span>
              <Brain className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-3xl font-black text-white light:text-slate-900">
              {stats.confidenceScore}%
            </div>
            <p className="text-xs text-slate-300 light:text-slate-600">{stats.confidenceDesc}</p>
          </div>

          <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Trading Plan Adherence</span>
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-emerald-400">
              {validTrades.length > 0 ? Math.round((validTrades.filter(t => t.followedPlan).length / validTrades.length) * 100) : 100}%
            </div>
            <p className="text-xs text-slate-400">Trades executed fully according to predefined checklist</p>
          </div>

          <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Risk Rule Adherence</span>
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="text-3xl font-black text-indigo-400">
              {validTrades.length > 0 ? Math.round((validTrades.filter(t => t.followedRisk).length / validTrades.length) * 100) : 100}%
            </div>
            <p className="text-xs text-slate-400">Trades with strict Stop Loss and position sizing</p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: RISK */}
      {/* ========================================================================= */}
      {activeReportTab === 'Risk' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-3">
            <span className="text-xs font-bold text-slate-400">Profit Factor</span>
            <div className="text-3xl font-black text-emerald-400">{stats.profitFactor}</div>
            <p className="text-xs text-slate-400">Gross Profits ÷ Gross Losses</p>
          </div>

          <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-3">
            <span className="text-xs font-bold text-slate-400">Payoff Ratio</span>
            <div className="text-3xl font-black text-blue-400">
              {avgLoss > 0 ? (avgWin / avgLoss).toFixed(2) : (avgWin > 0 ? '∞' : '0.00')}
            </div>
            <p className="text-xs text-slate-400">Average Win Amount ÷ Average Loss Amount</p>
          </div>

          <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-3">
            <span className="text-xs font-bold text-slate-400">Max Risk / Trade Limit</span>
            <div className="text-3xl font-black text-amber-400">2.0%</div>
            <p className="text-xs text-slate-400">Strict maximum exposure per execution</p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: JOURNAL */}
      {/* ========================================================================= */}
      {activeReportTab === 'Journal' && (
        <div className="space-y-4">
          {sortedDays.length === 0 ? (
            <div className="p-12 text-center bg-[#111a2e] rounded-3xl border border-[#1e2942] text-slate-400">
              No journal entries recorded for this period.
            </div>
          ) : (
            sortedDays.map(([date, data]) => {
              const dayTrades = validTrades.filter(t => t.date === date);
              return (
                <div key={date} className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-blue-500/15 text-blue-400 flex items-center justify-center font-bold text-xs">
                        {date.split('-')[2]}
                      </div>
                      <div>
                        <h4 className="font-bold text-white light:text-slate-900 text-sm">{date}</h4>
                        <p className="text-xs text-slate-400">{dayTrades.length} trade{dayTrades.length > 1 ? 's' : ''} executed</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`text-base font-black font-mono ${data.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {data.pnl >= 0 ? '+' : ''}{formatINR(data.pnl)}
                      </span>
                      <p className="text-[11px] text-slate-400">Charges: {formatINR(data.charges)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#1e2942]">
                    {dayTrades.map(dt => (
                      <div key={dt.id} className="p-3 rounded-2xl bg-[#16223b] light:bg-slate-50 border border-[#23355b] flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-white light:text-slate-900">{dt.symbol}</p>
                          <p className="text-[11px] text-slate-400">{dt.strategy} • Qty: {dt.quantity}</p>
                        </div>
                        <div className="text-right font-mono font-bold">
                          <p className={dt.netPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                            {dt.netPnl >= 0 ? '+' : ''}{formatINR(dt.netPnl)}
                          </p>
                          <p className="text-[10px] text-slate-500">{dt.outcome}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

    </div>
  );
};
