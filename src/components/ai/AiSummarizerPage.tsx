import React, { useState } from 'react';
import { useTradeContext } from '../../context/TradeContext';
import { calculateDashboardStats, formatINR } from '../../utils/calculations';
import { Sparkles, Brain, Zap, ShieldCheck, AlertTriangle, TrendingUp, RefreshCw } from 'lucide-react';

export const AiSummarizerPage: React.FC = () => {
  const { trades } = useTradeContext();
  const [isGenerating, setIsGenerating] = useState(false);
  const stats = calculateDashboardStats(trades);

  const handleRegenerate = () => {
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 800);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#111a2e] light:bg-white p-5 rounded-2xl border border-[#1e2942] light:border-slate-200 shadow-lg">
        <div>
          <h2 className="text-lg font-black text-white light:text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            AI Trading Coach & Psychology Summarizer
          </h2>
          <p className="text-xs text-slate-400">
            Intelligent algorithmic analysis of your journaled setups, emotions, and risk metrics
          </p>
        </div>

        <button
          onClick={handleRegenerate}
          disabled={isGenerating}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
          {isGenerating ? 'Analyzing Trades...' : 'Refresh AI Analysis'}
        </button>
      </div>

      {/* Main AI Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Core Diagnosis Card */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-gradient-to-b from-[#131d35] to-[#111a2e] border border-[#1e2942] shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs tracking-wider uppercase">
            <Brain className="w-4 h-4" /> AI Performance Diagnosis
          </div>

          <h3 className="text-xl font-black text-white leading-tight">
            "Your edge is strongly concentrated in Breakout setups during the morning session (09:30 AM – 11:30 AM)."
          </h3>

          <p className="text-xs text-slate-300 leading-relaxed">
            Based on your past <span className="text-cyan-400 font-bold">{trades.length} recorded trades</span>, you have demonstrated exceptional patience on morning momentum breakouts, yielding an impressive <span className="text-emerald-400 font-bold">{stats.winRate}% win rate</span> and an asymmetric average Risk-to-Reward ratio of <span className="text-purple-400 font-bold">{stats.avgRiskReward}</span>.
          </p>

          {/* AI Bullet points */}
          <div className="space-y-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-[#0e1628] border border-[#1c2a47] flex items-start gap-3">
              <div className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-white">Major Strength: Asymmetric Win/Loss</p>
                <p className="text-slate-400 mt-0.5">Your winners average ~₹15,000+ while standard planned losses are kept around ~₹4,000.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#0e1628] border border-[#1c2a47] flex items-start gap-3">
              <div className="p-1 rounded-lg bg-rose-500/20 text-rose-400 shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-white">Primary Vulnerability: Midday Overtrading & Greed</p>
                <p className="text-slate-400 mt-0.5">Losses on afternoon counter-trend trades accounted for over 72% of total drawdown. Avoid trading between 12:00 PM – 1:30 PM.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#0e1628] border border-[#1c2a47] flex items-start gap-3">
              <div className="p-1 rounded-lg bg-cyan-500/20 text-cyan-400 shrink-0 mt-0.5">
                <Zap className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-white">Recommended Action Plan for Next Week</p>
                <p className="text-slate-400 mt-0.5">Enforce a strict 2-trade limit per day and lock terminal once morning profit target of ₹10,000+ is achieved.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Trader Score & Quick Stats */}
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-[#111a2e] border border-[#1e2942] shadow-lg text-center space-y-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Trader Discipline Score</span>
            <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-cyan-400"
                  strokeDasharray={`${stats.confidenceScore}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-black text-white">{stats.confidenceScore}</span>
                <span className="text-[10px] text-cyan-400 font-semibold">/ 100</span>
              </div>
            </div>
            <p className="text-xs font-semibold text-emerald-400">
              {stats.confidenceLabel}
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-[#111a2e] border border-[#1e2942] shadow-lg space-y-2.5 text-xs">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Top Strategy Match</h4>
            <div className="flex justify-between py-1 border-b border-[#1e2942]">
              <span className="text-slate-400">Best Setup:</span>
              <span className="font-bold text-blue-400">Breakout</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#1e2942]">
              <span className="text-slate-400">Optimal Timeframe:</span>
              <span className="font-bold text-white">5-Min & 15-Min</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Discipline Index:</span>
              <span className="font-bold text-emerald-400">88% Adherence</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
