import React, { useState } from 'react';
import { useTradeContext } from '../../context/TradeContext';
import { Trade } from '../../types/trade';
import { formatINR } from '../../utils/calculations';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  TrendingUp, 
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  BookOpen
} from 'lucide-react';

export const CalendarPage: React.FC = () => {
  const { trades, setSelectedTrade } = useTradeContext();
  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 1)); // August 2026 default
  const [selectedDayTrades, setSelectedDayTrades] = useState<{ date: string; trades: Trade[] } | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Group trades by date string YYYY-MM-DD
  const tradesByDate = new Map<string, Trade[]>();
  trades.forEach(t => {
    const list = tradesByDate.get(t.date) || [];
    list.push(t);
    tradesByDate.set(t.date, list);
  });

  // Calendar calculations
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Calculate Monthly Totals
  let monthlyPnl = 0;
  let winningDays = 0;
  let losingDays = 0;
  let monthlyTradesCount = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayTrades = tradesByDate.get(dateStr);
    if (dayTrades && dayTrades.length > 0) {
      monthlyTradesCount += dayTrades.length;
      const dayNet = dayTrades.reduce((acc, t) => acc + t.netPnl, 0);
      monthlyPnl += dayNet;
      if (dayNet > 0) winningDays++;
      else if (dayNet < 0) losingDays++;
    }
  }

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-5">
      {/* Header & Monthly KPIs */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-[#111a2e] light:bg-white p-5 rounded-2xl border border-[#1e2942] light:border-slate-200 shadow-lg">
        <div>
          <h2 className="text-lg font-black text-white light:text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-400" />
            Trading Calendar & P&L Heatmap
          </h2>
          <p className="text-xs text-slate-400">
            Visual daily profit & loss breakdown
          </p>
        </div>

        {/* Month Navigator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#16223b] light:bg-slate-100 p-1 rounded-xl border border-[#23355b] light:border-slate-200">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#202f50] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-4 text-xs font-bold text-white light:text-slate-900">
              {monthName}
            </span>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#202f50] transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Month Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Month P&L</span>
          <h3 className={`text-xl font-black mt-1 ${monthlyPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {monthlyPnl >= 0 ? `+${formatINR(monthlyPnl)}` : formatINR(monthlyPnl)}
          </h3>
        </div>

        <div className="p-4 rounded-2xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Winning Days</span>
          <h3 className="text-xl font-black text-emerald-400 mt-1">
            {winningDays} <span className="text-xs text-slate-400 font-normal">days</span>
          </h3>
        </div>

        <div className="p-4 rounded-2xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Losing Days</span>
          <h3 className="text-xl font-black text-rose-400 mt-1">
            {losingDays} <span className="text-xs text-slate-400 font-normal">days</span>
          </h3>
        </div>

        <div className="p-4 rounded-2xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Total Trades</span>
          <h3 className="text-xl font-black text-blue-400 mt-1">
            {monthlyTradesCount}
          </h3>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl">
        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-2 mb-2 text-center">
          {daysOfWeek.map((day, i) => (
            <div
              key={day}
              className={`text-xs font-black py-2 rounded-xl uppercase tracking-wider ${
                i === 0 || i === 6 ? 'text-slate-500 bg-[#0d1527]/40' : 'text-slate-400 bg-[#16223b]/50'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Empty cells before 1st day */}
          {Array.from({ length: firstDayIndex }).map((_, idx) => (
            <div key={`empty-${idx}`} className="h-24 sm:h-28 rounded-2xl bg-[#0e1628]/30 border border-transparent" />
          ))}

          {/* Days in current month */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const dayTrades = tradesByDate.get(dateStr) || [];
            
            const hasTrades = dayTrades.length > 0;
            const dayNet = dayTrades.reduce((acc, t) => acc + t.netPnl, 0);
            const isProfit = dayNet > 0;
            const isLoss = dayNet < 0;
            const isNoTradeDay = dayTrades.some(t => t.isNoTradeDay);

            return (
              <div
                key={`day-${dayNum}`}
                onClick={() => {
                  if (hasTrades) {
                    setSelectedDayTrades({ date: dateStr, trades: dayTrades });
                  }
                }}
                className={`h-24 sm:h-28 p-2 rounded-2xl border transition-all flex flex-col justify-between relative group ${
                  hasTrades
                    ? isProfit
                      ? 'bg-emerald-950/20 hover:bg-emerald-900/30 border-emerald-500/30 cursor-pointer shadow-lg shadow-emerald-950/20'
                      : isLoss
                      ? 'bg-rose-950/20 hover:bg-rose-900/30 border-rose-500/30 cursor-pointer shadow-lg shadow-rose-950/20'
                      : 'bg-[#16223b] hover:bg-[#1f2f52] border-[#23355b] cursor-pointer'
                    : 'bg-[#0e1628]/60 light:bg-slate-50 border-[#1a253e] light:border-slate-200'
                }`}
              >
                {/* Day number */}
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${
                    hasTrades ? 'text-white' : 'text-slate-500'
                  }`}>
                    {dayNum}
                  </span>
                  {hasTrades && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-[#0d1527] text-slate-300 border border-[#23355b]">
                      {dayTrades.length} {dayTrades.length === 1 ? 'tr' : 'trs'}
                    </span>
                  )}
                </div>

                {/* Day P&L preview */}
                {hasTrades ? (
                  <div className="text-center my-auto">
                    {isNoTradeDay ? (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-700/50 text-slate-300">
                        No Trade
                      </span>
                    ) : (
                      <>
                        <p className={`text-xs sm:text-sm font-black ${
                          isProfit ? 'text-emerald-400' : isLoss ? 'text-rose-400' : 'text-slate-300'
                        }`}>
                          {isProfit ? `+${formatINR(dayNet)}` : formatINR(dayNet)}
                        </p>
                        <p className="text-[9px] text-slate-400 mt-0.5 truncate">
                          {dayTrades[0].symbol}
                        </p>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="h-6" />
                )}

                {/* Bottom active indicator */}
                {hasTrades && (
                  <div className={`h-1 w-full rounded-full ${
                    isProfit ? 'bg-emerald-400' : isLoss ? 'bg-rose-400' : 'bg-slate-500'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Modal Details */}
      {selectedDayTrades && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between border-b border-[#1e2942] light:border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-black text-white light:text-slate-900">
                  Trades on {new Date(selectedDayTrades.date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedDayTrades.trades.length} trades recorded
                </p>
              </div>
              <button
                onClick={() => setSelectedDayTrades(null)}
                className="text-slate-400 hover:text-white font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 max-h-80 overflow-y-auto">
              {selectedDayTrades.trades.map(t => (
                <div
                  key={t.id}
                  onClick={() => {
                    setSelectedDayTrades(null);
                    setSelectedTrade(t);
                  }}
                  className="p-3.5 rounded-2xl bg-[#16223b] light:bg-slate-100 border border-[#23355b] hover:border-blue-500 cursor-pointer flex items-center justify-between transition-all"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.direction === 'Long' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {t.direction}
                      </span>
                      <span className="font-bold text-xs text-white light:text-slate-900">
                        {t.symbol}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Strategy: {t.strategy} • {t.outcome}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className={`text-xs font-black ${t.netPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {t.netPnl >= 0 ? `+${formatINR(t.netPnl)}` : formatINR(t.netPnl)}
                    </p>
                    <span className="text-[10px] text-slate-400 flex items-center justify-end gap-0.5">
                      <BookOpen className="w-3 h-3 text-blue-400" /> View
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setSelectedDayTrades(null)}
              className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-500 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
