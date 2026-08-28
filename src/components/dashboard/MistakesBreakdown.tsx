import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Trade } from '../../types/trade';

interface MistakesBreakdownProps {
  trades?: Trade[];
}

export const MistakesBreakdown: React.FC<MistakesBreakdownProps> = () => {
  // Exact mistake items from screenshot 1
  const mistakes = [
    {
      name: 'FOMO Entry',
      trades: 2,
      cost: -15.16,
      color: 'from-rose-500 to-pink-500',
      percent: 85
    },
    {
      name: 'Exited Too Early',
      trades: 1,
      cost: -6122.15,
      color: 'from-amber-500 to-orange-500',
      percent: 60
    },
    {
      name: 'greed',
      trades: 1,
      cost: -23081.13,
      color: 'from-amber-500 to-orange-500',
      percent: 60
    },
    {
      name: 'No Clear Plan',
      trades: 1,
      cost: -2585.59,
      color: 'from-amber-500 to-orange-500',
      percent: 60
    }
  ];

  return (
    <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-4">
      {/* Header matching screenshot 1 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-rose-500/15 text-rose-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-white light:text-slate-900">
            Most Common Mistakes
          </h3>
        </div>
        <span className="px-2.5 py-1 text-[11px] font-semibold text-slate-400 bg-[#16223b] light:bg-slate-100 rounded-xl border border-[#23355b]">
          Last 30 days
        </span>
      </div>

      {/* List items with ✕, count, loss, and progress bar */}
      <div className="space-y-3 pt-1">
        {mistakes.map((m) => (
          <div
            key={m.name}
            className="p-3 rounded-2xl bg-[#16223b] light:bg-slate-50 border border-[#23355b] space-y-2 hover:border-slate-600 transition-colors"
          >
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-rose-500/20 text-rose-400 flex items-center justify-center text-[10px] font-black">
                  ✕
                </span>
                <span className="font-bold text-white light:text-slate-900">{m.name}</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[11px] text-slate-400">{m.trades} {m.trades > 1 ? 'trades' : 'trade'}</span>
                <span className="font-bold text-rose-400 font-mono text-xs">
                  {m.cost < 0 ? `-₹${Math.abs(m.cost).toLocaleString('en-IN')}` : `₹${m.cost}`}
                </span>
              </div>
            </div>

            {/* Colored horizontal progress bar */}
            <div className="w-full bg-[#18233c] light:bg-slate-200 h-1 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${m.color} rounded-full`}
                style={{ width: `${m.percent}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
