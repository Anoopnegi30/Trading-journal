import React from 'react';
import { DashboardStats } from '../../types/trade';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface Props {
  stats: DashboardStats;
}

export const WinLossDonut: React.FC<Props> = ({ stats }) => {
  const winning = stats.winningTrades || 12;
  const losing = stats.losingTrades || 4;
  const winRate = stats.winRate || 75;

  const data = [
    { name: 'Winning Trades', value: winning, color: '#10b981' },
    { name: 'Losing Trades', value: losing, color: '#f43f5e' }
  ];

  return (
    <div className="p-5 rounded-2xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-lg flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-white light:text-slate-900">
          Win/Loss Distribution
        </h3>
        <span className="text-xs text-slate-400">All Setups</span>
      </div>

      {/* Donut with Center Text */}
      <div className="relative w-full h-52 flex items-center justify-center my-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="p-2 bg-[#0d1527] border border-[#223558] rounded-lg text-xs font-semibold text-white">
                      <span style={{ color: item.color }}>● </span>
                      {item.name}: {item.value} ({((item.value / (winning + losing)) * 100).toFixed(1)}%)
                    </div>
                  );
                }
                return null;
              }}
            />
            <Pie
              data={data}
              innerRadius={62}
              outerRadius={86}
              paddingAngle={4}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Win Rate Text */}
        <div className="absolute flex flex-col items-center justify-center pointer-events-none text-center">
          <span className="text-2xl font-black text-white light:text-slate-900 tracking-tight">
            {winRate}%
          </span>
          <span className="text-[10px] font-semibold text-slate-400">
            Win Rate
          </span>
          <span className="text-[9px] font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> LIVE
          </span>
        </div>
      </div>

      {/* Legend Footer */}
      <div className="flex items-center justify-around pt-3 border-t border-[#1e2942] light:border-slate-100 text-xs">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5 font-black text-lg text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            {winning}
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Winning Trades</span>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5 font-black text-lg text-rose-400">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
            {losing}
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Losing Trades</span>
        </div>
      </div>
    </div>
  );
};
