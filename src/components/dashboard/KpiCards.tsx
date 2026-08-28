import React from 'react';
import { DashboardStats } from '../../types/trade';
import { Wallet, Trophy, Scale, BarChart2, TrendingUp, TrendingDown } from 'lucide-react';
import { formatINR } from '../../utils/calculations';

interface Props {
  stats: DashboardStats;
}

export const KpiCards: React.FC<Props> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Highest P&L */}
      <div className="p-5 rounded-2xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 relative overflow-hidden shadow-lg transition-all hover:border-[#2d3f66]">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-bold tracking-wider text-slate-400 light:text-slate-500 uppercase">
              Highest P&L
            </p>
            <h3 className="text-2xl font-black text-emerald-400 mt-1">
              {formatINR(stats.highestPnl)}
            </h3>
            <p className="text-[11px] font-medium text-emerald-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>+{stats.highestPnlChangePercent}%</span>
              <span className="text-slate-400 light:text-slate-500 font-normal">vs last 30 days</span>
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Wallet className="w-5 h-5" />
          </div>
        </div>
        {/* Visual progress line */}
        <div className="w-full bg-[#18233c] light:bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
          <div className="bg-emerald-400 h-full rounded-full w-3/4" />
        </div>
      </div>

      {/* Win Rate */}
      <div className="p-5 rounded-2xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 relative overflow-hidden shadow-lg transition-all hover:border-[#2d3f66]">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-bold tracking-wider text-slate-400 light:text-slate-500 uppercase">
              Win Rate
            </p>
            <h3 className="text-2xl font-black text-blue-400 mt-1">
              {stats.winRate}%
            </h3>
            <p className="text-[11px] font-medium text-rose-400 mt-1 flex items-center gap-1">
              <TrendingDown className="w-3 h-3" />
              <span>{stats.winRateChangePercent}%</span>
              <span className="text-slate-400 light:text-slate-500 font-normal">vs last 30 days</span>
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
        </div>
        <div className="w-full bg-[#18233c] light:bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
          <div
            className="bg-blue-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, stats.winRate))}%` }}
          />
        </div>
      </div>

      {/* Avg. Risk/Reward */}
      <div className="p-5 rounded-2xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 relative overflow-hidden shadow-lg transition-all hover:border-[#2d3f66]">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-bold tracking-wider text-slate-400 light:text-slate-500 uppercase">
              Avg. Risk/Reward
            </p>
            <h3 className="text-2xl font-black text-purple-400 mt-1">
              {stats.avgRiskReward}
            </h3>
            <p className="text-[11px] font-medium text-emerald-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>+{stats.avgRiskRewardChangePercent}%</span>
              <span className="text-slate-400 light:text-slate-500 font-normal">vs last 30 days</span>
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
            <Scale className="w-5 h-5" />
          </div>
        </div>
        <div className="w-full bg-[#18233c] light:bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
          <div className="bg-purple-400 h-full rounded-full w-2/3" />
        </div>
      </div>

      {/* Trades This Month */}
      <div className="p-5 rounded-2xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 relative overflow-hidden shadow-lg transition-all hover:border-[#2d3f66]">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-bold tracking-wider text-slate-400 light:text-slate-500 uppercase">
              Trades This Month
            </p>
            <h3 className="text-2xl font-black text-orange-400 mt-1">
              {stats.tradesThisMonth}
            </h3>
            <p className="text-[11px] font-medium text-emerald-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>+{stats.tradesThisMonthChange}</span>
              <span className="text-slate-400 light:text-slate-500 font-normal">vs last 30 days</span>
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
            <BarChart2 className="w-5 h-5" />
          </div>
        </div>
        <div className="w-full bg-[#18233c] light:bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
          <div className="bg-orange-400 h-full rounded-full w-4/5" />
        </div>
      </div>
    </div>
  );
};
