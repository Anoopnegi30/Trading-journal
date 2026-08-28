import React from 'react';
import { Trade } from '../../types/trade';
import { getStrategyPerformance, formatINR } from '../../utils/calculations';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine
} from 'recharts';

interface Props {
  trades: Trade[];
}

export const StrategyPnlChart: React.FC<Props> = ({ trades }) => {
  const data = getStrategyPerformance(trades);

  // Strategy color mapping matching screenshot
  const getBarColor = (name: string, pnl: number) => {
    if (pnl < 0) return '#f59e0b'; // Amber like Pullback in screenshot
    if (name.toLowerCase().includes('breakout')) return '#3b82f6'; // Blue
    if (name.toLowerCase().includes('ema')) return '#10b981'; // Emerald
    return '#8b5cf6';
  };

  return (
    <div className="p-5 rounded-2xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-lg flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-white light:text-slate-900">
          Strategy vs P&L
        </h3>
        <span className="text-xs text-slate-400">P&L by Setup</span>
      </div>

      <div className="w-full h-56 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2942" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`}
            />
            <ReferenceLine y={0} stroke="#334155" />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="p-2.5 bg-[#0d1527] border border-[#223558] rounded-xl text-xs">
                      <p className="font-bold text-white">{item.name}</p>
                      <p className={`font-bold mt-1 ${item.totalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        Net P&L: {formatINR(item.totalPnl)}
                      </p>
                      <p className="text-slate-400 text-[11px]">
                        Win Rate: {item.winRate}% ({item.winCount}/{item.totalTrades} wins)
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="totalPnl" radius={[6, 6, 0, 0]} maxBarSize={48}>
              {data.map((entry, index) => (
                <Cell key={`bar-${index}`} fill={getBarColor(entry.name, entry.totalPnl)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
