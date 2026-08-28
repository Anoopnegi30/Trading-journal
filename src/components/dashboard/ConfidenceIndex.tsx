import React from 'react';
import { DashboardStats } from '../../types/trade';
import { ShieldCheck, Info } from 'lucide-react';

interface Props {
  stats: DashboardStats;
}

export const ConfidenceIndex: React.FC<Props> = ({ stats }) => {
  const score = stats.confidenceScore || 85;

  return (
    <div className="p-5 rounded-2xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-white light:text-slate-900 tracking-wide flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Confidence Index
          </h3>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            {score}% Discipline
          </span>
        </div>
        <span className="text-xs text-slate-400 light:text-slate-500 font-medium">
          Last 30 Days
        </span>
      </div>

      {/* Gradient Bar with Tracker Pin */}
      <div className="relative my-4">
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-1.5 px-0.5">
          <span className="text-rose-400">Low</span>
          <span className="text-amber-400">Moderate</span>
          <span className="text-emerald-400">High</span>
        </div>

        {/* Gradient track */}
        <div className="w-full h-2.5 rounded-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-500 relative overflow-hidden shadow-inner" />

        {/* Pin indicator */}
        <div
          className="absolute -top-1 transform -translate-x-1/2 transition-all duration-700 ease-out"
          style={{ left: `${Math.min(97, Math.max(3, score))}%` }}
        >
          <div className="w-5 h-5 rounded-full bg-white dark:bg-slate-900 border-3 border-cyan-400 shadow-lg shadow-cyan-400/50 flex items-center justify-center animate-pulse" />
        </div>
      </div>

      {/* Description text matching screenshot */}
      <div className="text-center mt-3">
        <p className="text-xs font-semibold text-slate-200 light:text-slate-700">
          <span className="text-emerald-400 font-bold">{stats.confidenceLabel}</span> – {stats.confidenceDesc}
        </p>
      </div>
    </div>
  );
};
