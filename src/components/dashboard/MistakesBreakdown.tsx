import React from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { Trade } from '../../types/trade';
import { getMistakesBreakdown, formatINR } from '../../utils/calculations';
import { useTradeContext } from '../../context/TradeContext';

interface MistakesBreakdownProps {
  trades?: Trade[];
}

export const MistakesBreakdown: React.FC<MistakesBreakdownProps> = ({ trades: propsTrades }) => {
  const context = useTradeContext();
  const trades = propsTrades || context.trades || [];
  const mistakes = getMistakesBreakdown(trades);

  return (
    <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-4">
      {/* Header */}
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
          August 2026
        </span>
      </div>

      {/* Dynamic List */}
      {mistakes.length === 0 ? (
        <div className="py-8 flex flex-col items-center justify-center text-center p-4 bg-[#16223b]/50 light:bg-slate-50 rounded-2xl border border-dashed border-[#23355b]">
          <CheckCircle className="w-8 h-8 text-emerald-400 mb-2 opacity-80" />
          <p className="text-xs font-bold text-white light:text-slate-900">Zero Trading Mistakes Logged</p>
          <p className="text-[11px] text-slate-400 mt-1 max-w-[240px]">
            Keep maintaining strict discipline and rules execution in August 2026.
          </p>
        </div>
      ) : (
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
                  <span className="text-[11px] text-slate-400">{m.tradeCount} {m.tradeCount > 1 ? 'trades' : 'trade'}</span>
                  <span className="font-bold text-rose-400 font-mono text-xs">
                    -{formatINR(m.totalLoss)}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-[#18233c] light:bg-slate-200 h-1 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full"
                  style={{ width: `${Math.max(15, m.percentage)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
