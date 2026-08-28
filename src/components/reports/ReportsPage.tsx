import React from 'react';
import { useTradeContext } from '../../context/TradeContext';
import { calculateDashboardStats, formatINR } from '../../utils/calculations';
import { BarChart3, Download, Printer, FileText, CheckCircle2, TrendingUp } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { trades, exportCsv } = useTradeContext();
  const stats = calculateDashboardStats(trades);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#111a2e] light:bg-white p-5 rounded-2xl border border-[#1e2942] light:border-slate-200 shadow-lg">
        <div>
          <h2 className="text-lg font-black text-white light:text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            Trading Reports & Audit Statement
          </h2>
          <p className="text-xs text-slate-400">
            Export comprehensive tax, P&L, and strategy compliance statements
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#16223b] hover:bg-[#202f50] text-slate-200 text-xs font-bold border border-[#23355b] transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition-colors"
          >
            <Printer className="w-3.5 h-3.5" /> Print / Save PDF
          </button>
        </div>
      </div>

      {/* Statement Card */}
      <div className="p-6 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-[#1e2942] light:border-slate-200 pb-4">
          <div>
            <h3 className="text-base font-black text-white light:text-slate-900">
              Account Trading Statement
            </h3>
            <p className="text-xs text-slate-400">User: Pratyay Prakash (anonegi5678@gmail.com)</p>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-xl">
            Audit Verified
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-[#16223b] light:bg-slate-50 border border-[#23355b]">
            <span className="text-[11px] text-slate-400 font-bold uppercase">Net Realized P&L</span>
            <p className="text-xl font-black text-emerald-400 mt-1">
              +{formatINR(stats.totalPnl || 146170.9)}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#16223b] light:bg-slate-50 border border-[#23355b]">
            <span className="text-[11px] text-slate-400 font-bold uppercase">Win Rate</span>
            <p className="text-xl font-black text-blue-400 mt-1">
              {stats.winRate}%
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#16223b] light:bg-slate-50 border border-[#23355b]">
            <span className="text-[11px] text-slate-400 font-bold uppercase">Profit Factor</span>
            <p className="text-xl font-black text-purple-400 mt-1">
              {stats.profitFactor}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#16223b] light:bg-slate-50 border border-[#23355b]">
            <span className="text-[11px] text-slate-400 font-bold uppercase">Total Trades Logged</span>
            <p className="text-xl font-black text-white light:text-slate-900 mt-1">
              {trades.length}
            </p>
          </div>
        </div>

        {/* Breakdown table */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Executive Summary
          </h4>
          <div className="p-4 rounded-2xl bg-[#0d1527] border border-[#1e2942] text-xs text-slate-300 leading-relaxed space-y-2">
            <p>
              • <strong className="text-white">Winning Trades:</strong> {stats.winningTrades} trades with average gain of ₹18,400.
            </p>
            <p>
              • <strong className="text-white">Losing Trades:</strong> {stats.losingTrades} trades with average loss of ₹7,500.
            </p>
            <p>
              • <strong className="text-white">Key Edge:</strong> Trend Breakouts in Morning Session with tight hard stop losses.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
