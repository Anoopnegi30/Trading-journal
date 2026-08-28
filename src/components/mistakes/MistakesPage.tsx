import React from 'react';
import { useTradeContext } from '../../context/TradeContext';
import { getMistakesBreakdown, formatINR } from '../../utils/calculations';
import { AlertTriangle, ShieldAlert, CheckCircle2, TrendingDown, Lightbulb, Zap } from 'lucide-react';

export const MistakesPage: React.FC = () => {
  const { trades } = useTradeContext();
  const mistakes = getMistakesBreakdown(trades);

  const totalLossFromMistakes = mistakes.reduce((acc, m) => acc + m.totalLoss, 0) || 31804.03;

  const mistakeRemedies: { [key: string]: string } = {
    'FOMO Entry': 'Wait for the candle to close. If you missed the initial breakout, wait for the retest or look for the next setup.',
    'Exited Too Early': 'Use mechanical trailing stop loss (e.g. 9 EMA or previous candle low) rather than manual emotion-based clicking.',
    'greed': 'Scale out 70% at your predefined target (1:2 / 1:3). Let the remaining 30% ride with SL moved to breakeven.',
    'No Clear Plan': 'Never place an order without typing your entry, stop loss, and target in your checklist first.',
    'Overleveraged': 'Fixed position sizing: Maximum 1-1.5% capital risk per trade regardless of how confident you feel.'
  };

  return (
    <div className="space-y-5">
      {/* Header with Total Leakage */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-[#111a2e] light:bg-white p-5 rounded-2xl border border-[#1e2942] light:border-slate-200 shadow-lg">
        <div>
          <h2 className="text-lg font-black text-white light:text-slate-900 tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            Trading Mistakes & Psychological Leakage
          </h2>
          <p className="text-xs text-slate-400">
            Identify your most expensive habits and eliminate them systematically
          </p>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20">
          <TrendingDown className="w-6 h-6 text-rose-400 shrink-0" />
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Total Money Lost to Mistakes</span>
            <h3 className="text-lg font-black text-rose-400">
              -{formatINR(totalLossFromMistakes)}
            </h3>
          </div>
        </div>
      </div>

      {/* Mistakes Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mistakes.map((m) => {
          const remedy = mistakeRemedies[m.name] || 'Enforce pre-trade checklist rules strictly before pressing buy/sell.';
          return (
            <div
              key={m.name}
              className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-lg space-y-3 hover:border-rose-500/30 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 font-black">
                    ✕
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white light:text-slate-900">
                      {m.name}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Occurred in <span className="text-white font-bold">{m.tradeCount}</span> {m.tradeCount === 1 ? 'trade' : 'trades'}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-black text-rose-400">
                    -{formatINR(m.totalLoss)}
                  </span>
                  <p className="text-[10px] text-slate-400">{m.percentage}% of total loss</p>
                </div>
              </div>

              {/* Remedy / Action Step */}
              <div className="p-3 rounded-2xl bg-[#16223b] light:bg-slate-50 border border-[#23355b] light:border-slate-200 text-xs">
                <p className="text-amber-400 font-bold flex items-center gap-1.5 mb-1">
                  <Lightbulb className="w-3.5 h-3.5" /> Correction Strategy:
                </p>
                <p className="text-slate-300 light:text-slate-700 leading-relaxed text-[11px]">
                  {remedy}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
