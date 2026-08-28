import React from 'react';
import { Trade } from '../../types/trade';
import { getDailyPnlData, formatINR } from '../../utils/calculations';
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

export const DailyPnlChart: React.FC<Props> = ({ trades }) => {
  const data = getDailyPnlData(trades);

  return (
    <div className="p-5 rounded-2xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-lg flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-white light:text-slate-900">
          Daily P&L
        </h3>
        <span className="text-xs text-slate-400">Net Daily P&L</span>
      </div>

      <div className="w-full h-56 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2942" vertical={false} />
            <XAxis
              dataKey="date"
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
              tickFormatter={(v) => `+₹${(v / 1000).toFixed(0)}k`}
            />
            <ReferenceLine y={0} stroke="#334155" />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="p-2.5 bg-[#0d1527] border border-[#223558] rounded-xl text-xs">
                      <p className="font-semibold text-slate-300">{item.date}</p>
                      <p className={`font-bold text-sm mt-0.5 ${item.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {formatINR(item.pnl)}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="pnl" radius={[6, 6, 0, 0]} maxBarSize={38}>
              {data.map((entry, index) => (
                <Cell
                  key={`daily-bar-${index}`}
                  fill={entry.pnl >= 0 ? '#10b981' : '#f43f5e'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
