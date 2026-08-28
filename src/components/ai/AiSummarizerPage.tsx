import React, { useState } from 'react';
import { useTradeContext } from '../../context/TradeContext';
import { 
  Bot, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Award, 
  Clock, 
  Filter, 
  ArrowRight,
  Brain,
  Zap,
  HeartPulse
} from 'lucide-react';
import { calculateDashboardStats, formatINR } from '../../utils/calculations';

export const AiSummarizerPage: React.FC = () => {
  const { trades, marketFilter, setMarketFilter } = useTradeContext();
  const [selectedPeriod, setSelectedPeriod] = useState<string>('August 2026');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const stats = calculateDashboardStats(trades);

  const handleGenerateSummary = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-white light:text-slate-900 tracking-tight">
          AI Trading Analysis & Diagnostic
        </h2>
      </div>

      {/* Top Generator Card */}
      <div className="p-6 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-black text-white light:text-slate-900 flex items-center gap-2">
              <Bot className="w-5 h-5 text-blue-400" />
              Generate AI Summary
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Analyze your August 2026 performance with deep behavioral diagnostics
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <select
              value={marketFilter}
              onChange={(e) => setMarketFilter(e.target.value)}
              className="bg-[#16223b] light:bg-slate-100 text-slate-200 light:text-slate-800 text-xs font-semibold rounded-xl px-3.5 py-2 border border-[#23355b] focus:outline-none"
            >
              <option value="Indian">Indian (NSE/BSE)</option>
              <option value="Crypto">Crypto</option>
              <option value="Forex">Forex</option>
            </select>

            <button
              onClick={handleGenerateSummary}
              disabled={isAnalyzing}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isAnalyzing ? 'Analyzing Pattern...' : 'Generate Analysis'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content or Clean Empty State */}
      {trades.length === 0 ? (
        <div className="p-12 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl text-center space-y-3">
          <Brain className="w-12 h-12 text-blue-400 mx-auto opacity-50" />
          <h3 className="text-base font-bold text-white light:text-slate-900">Ready to Analyze Your August 2026 Trades</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Once you log trades for August 2026, our AI Diagnostic Engine will identify your psychological blindspots, highest EV setups, and risk-reward optimization actions.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="p-6 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-3">
            <h4 className="text-sm font-bold text-white light:text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              August 2026 Executive Summary
            </h4>
            <p className="text-xs text-slate-300 light:text-slate-700 leading-relaxed">
              You have logged <strong>{stats.tradesThisMonth} trades</strong> this month with a win rate of <strong>{stats.winRate}%</strong> and net P&L of <strong>{formatINR(stats.totalPnl)}</strong>. Confidence Score is currently at <strong>{stats.confidenceScore}%</strong>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
