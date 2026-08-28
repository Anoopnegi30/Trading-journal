import React, { useState } from 'react';
import { Trade } from '../../types/trade';
import { getCumulativePnlData, formatINR } from '../../utils/calculations';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { TrendingUp } from 'lucide-react';

interface Props {
  trades: Trade[];
}

export const CumulativePnlChart: React.FC<Props> = ({ trades }) => {
  const [timeframe, setTimeframe] = useState<'D' | 'W' | 'M'>('D');
  const data = getCumulativePnlData(trades);

  const finalPnl = data.length > 0 ? data[data.length - 1].pnl : 0;
  const isPositive = finalPnl >= 0;

  return (
    <div className="p-5 rounded-2xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-lg flex flex-col">
      {/* Header with Title and Timeframe Toggle */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/15 text-blue-400">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white light:text-slate-900">
              Cumulative P&L
            </h3>
            <p className="text-[11px] text-slate-400">
              Total Growth: <span className={isPositive ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>{formatINR(finalPnl)}</span>
            </p>
          </div>
        </div>

        {/* Timeframe pill buttons */}
        <div className="flex items-center bg-[#18243e] light:bg-slate-100 p-1 rounded-xl border border-[#23355b] light:border-slate-200">
          {(['D', 'W', 'M'] as const).map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                timeframe === tf
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="w-full h-64 mt-2 flex items-center justify-center">
        {data.length === 0 ? (
          <div className="text-center p-4">
            <TrendingUp className="w-8 h-8 text-slate-600 light:text-slate-400 mx-auto mb-2 opacity-60" />
            <p className="text-xs font-semibold text-slate-300 light:text-slate-700">No Cumulative Equity Curve yet</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Your P&L growth curve for August 2026 will render here</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="pnlGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2942" vertical={false} />
              <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    return (
                      <div className="p-3 bg-[#0d1527] border border-[#223558] rounded-xl shadow-xl text-xs">
                        <p className="font-semibold text-slate-300">{item.fullDate}</p>
                        <p className="text-emerald-400 font-bold text-sm mt-0.5">
                          Cumulative: {formatINR(item.pnl)}
                        </p>
                        <p className="text-slate-400 text-[11px] mt-0.5">
                          Trade PnL: <span className={item.tradePnl >= 0 ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                            {formatINR(item.tradePnl)}
                          </span> ({item.symbol})
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="pnl"
                stroke="#10b981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#pnlGradient)"
                dot={{ r: 4, fill: '#10b981', stroke: '#0d1527', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#34d399', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
