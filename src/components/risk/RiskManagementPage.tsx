import React, { useState } from 'react';
import { useTradeContext } from '../../context/TradeContext';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  TrendingDown, 
  Target, 
  Percent, 
  Zap, 
  Activity,
  Flame
} from 'lucide-react';
import { formatINR } from '../../utils/calculations';

export const RiskManagementPage: React.FC = () => {
  const { trades } = useTradeContext();

  const validTrades = trades.filter(t => !t.isNoTradeDay);
  const totalTradesCount = validTrades.length;
  const tradesWithSL = validTrades.filter(t => t.stopLoss && t.stopLoss > 0).length;
  const slDisciplinePercent = totalTradesCount > 0 ? Math.round((tradesWithSL / totalTradesCount) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#111a2e] light:bg-white p-5 rounded-3xl border border-[#1e2942] light:border-slate-200 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white light:text-slate-900 tracking-tight flex items-center gap-2">
              Risk Management & Drawdown Control
            </h2>
            <p className="text-xs text-slate-400">
              Preserve trading capital and maintain optimal risk-to-reward parameters
            </p>
          </div>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl">
          <span className="text-xs font-bold text-slate-400">Stop-Loss Discipline</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            {slDisciplinePercent}%
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Trades with defined SL</p>
        </div>

        <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl">
          <span className="text-xs font-bold text-slate-400">Max Risk / Trade Target</span>
          <div className="text-2xl font-black text-blue-400 mt-1">
            1.5% - 2.0%
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Standard account risk cap</p>
        </div>

        <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl">
          <span className="text-xs font-bold text-slate-400">Max Drawdown (Aug 2026)</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            0.00%
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Capital peak-to-trough drop</p>
        </div>

        <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl">
          <span className="text-xs font-bold text-slate-400">Total August Trades</span>
          <div className="text-2xl font-black text-white light:text-slate-900 mt-1">
            {totalTradesCount}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Logged in journal</p>
        </div>
      </div>
    </div>
  );
};
