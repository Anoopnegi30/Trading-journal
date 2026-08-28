import React from 'react';
import { useTradeContext } from '../../context/TradeContext';
import { getStrategyPerformance, formatINR } from '../../utils/calculations';
import { Lightbulb, Trophy, TrendingUp, TrendingDown, Target, Percent } from 'lucide-react';

export const StrategiesPage: React.FC = () => {
  const { trades, setIsNewTradeModalOpen } = useTradeContext();
  const strategies = getStrategyPerformance(trades);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#111a2e] light:bg-white p-5 rounded-2xl border border-[#1e2942] light:border-slate-200 shadow-lg">
        <div>
          <h2 className="text-lg font-black text-white light:text-slate-900 tracking-tight flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-400" />
            Strategy Performance Analytics
          </h2>
          <p className="text-xs text-slate-400">
            Compare win rates, profit factor, and return distribution across setups
          </p>
        </div>

        <button
          onClick={() => setIsNewTradeModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md"
        >
          + Log Setup Trade
        </button>
      </div>

      {/* Strategies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {strategies.map((st, idx) => {
          const isProfit = st.totalPnl >= 0;
          return (
            <div
              key={st.name}
              className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-lg flex flex-col justify-between hover:border-blue-500/40 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                      idx === 0 ? 'bg-amber-400/20 text-amber-400 border border-amber-400/30' :
                      'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                    }`}>
                      #{idx + 1}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-white light:text-slate-900">
                        {st.name}
                      </h3>
                      <p className="text-[11px] text-slate-400">{st.totalTrades} trades logged</p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-xl text-xs font-bold ${
                    st.winRate >= 60 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    'bg-amber-500/20 text-amber-400'
                  }`}>
                    {st.winRate}% Win
                  </span>
                </div>

                <div className="space-y-3 py-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Total Net P&L:</span>
                    <span className={`font-black text-sm ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isProfit ? `+${formatINR(st.totalPnl)}` : formatINR(st.totalPnl)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Avg P&L per Trade:</span>
                    <span className="font-semibold text-slate-200 light:text-slate-800">
                      {formatINR(st.avgPnl)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Win / Loss Ratio:</span>
                    <span className="font-medium text-slate-300">
                      <span className="text-emerald-400 font-bold">{st.winCount}</span> W / <span className="text-rose-400 font-bold">{st.totalTrades - st.winCount}</span> L
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4 pt-3 border-t border-[#1e2942] light:border-slate-100">
                <div className="w-full bg-[#18233c] light:bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${isProfit ? 'bg-emerald-400' : 'bg-rose-400'}`}
                    style={{ width: `${Math.min(100, Math.max(10, st.winRate))}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
