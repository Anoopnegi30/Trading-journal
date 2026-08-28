import React from 'react';
import { Trade } from '../../types/trade';
import { getMistakesBreakdown, formatINR } from '../../utils/calculations';
import { AlertTriangle } from 'lucide-react';

interface Props {
  trades: Trade[];
}

export const MistakesBreakdown: React.FC<Props> = ({ trades }) => {
  const mistakes = getMistakesBreakdown(trades);

  const defaultMistakes = [
    { name: 'FOMO Entry', tradeCount: 2, totalLoss: 15.16, color: '#f43f5e' },
    { name: 'Exited Too Early', tradeCount: 1, totalLoss: 6122.15, color: '#fb923c' },
    { name: 'greed', tradeCount: 1, totalLoss: 23081.13, color: '#f97316' },
    { name: 'No Clear Plan', tradeCount: 1, totalLoss: 2585.59, color: '#fb923c' }
  ];

  const list = mistakes.length > 0 ? mistakes : defaultMistakes;
  const maxLoss = Math.max(...list.map(m => m.totalLoss || 1), 1);

  return (
    <div className="p-5 rounded-2xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-lg flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-rose-500/20 text-rose-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-white light:text-slate-900">
            Most Common Mistakes
          </h3>
        </div>
        <span className="text-xs text-slate-400">Last 30 days</span>
      </div>

      <div className="space-y-4 my-1">
        {list.map((m, idx) => {
          const widthPercent = Math.min(100, Math.max(12, Math.round((m.totalLoss / maxLoss) * 100)));
          const barColor = idx === 0 ? 'bg-rose-500' : 'bg-orange-500';

          return (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-rose-400 text-xs font-bold">✕</span>
                  <span className="font-semibold text-slate-200 light:text-slate-800">
                    {m.name}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 text-[11px]">
                    {m.tradeCount} {m.tradeCount === 1 ? 'trade' : 'trades'}
                  </span>
                  <span className="font-bold text-rose-400">
                    {m.totalLoss > 0 ? `-${formatINR(m.totalLoss)}` : '₹0'}
                  </span>
                </div>
              </div>

              {/* Colored progress line */}
              <div className="w-full bg-[#18233c] light:bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${barColor} transition-all duration-500`}
                  style={{ width: `${widthPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-[#1e2942] light:border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>Awareness is 80% of discipline</span>
        <span className="text-rose-400 font-semibold">Total Cost: ~₹31,804</span>
      </div>
    </div>
  );
};
