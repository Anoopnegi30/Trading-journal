import React from 'react';
import { useTradeContext } from '../../context/TradeContext';
import { formatINR } from '../../utils/calculations';
import { ArrowUpRight, ArrowDownRight, ChevronRight, Trophy } from 'lucide-react';

export const RecentTrades: React.FC = () => {
  const { trades, setActiveTab, setSelectedTrade } = useTradeContext();

  const topTrades = [...trades]
    .filter(t => !t.isNoTradeDay)
    .sort((a, b) => b.netPnl - a.netPnl)
    .slice(0, 4);

  return (
    <div className="p-5 rounded-2xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-lg flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-white light:text-slate-900">
          Top Trades
        </h3>
        <button
          onClick={() => setActiveTab('trades')}
          className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors cursor-pointer"
        >
          View All <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-2.5">
        {topTrades.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center p-4">
            <Trophy className="w-8 h-8 text-slate-600 light:text-slate-400 mb-2 opacity-50" />
            <p className="text-xs font-semibold text-slate-300 light:text-slate-700">No Trades in August 2026</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Your top performing trades will rank #1, #2 here</p>
          </div>
        ) : (
          topTrades.map((t, idx) => {
            const isProfitable = t.netPnl >= 0;
            return (
              <div
                key={t.id}
                onClick={() => setSelectedTrade(t)}
                className="p-3 rounded-xl bg-[#16223b] light:bg-slate-50 border border-[#23355b] light:border-slate-200 hover:border-blue-500/50 flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01]"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                    idx === 0 ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20' :
                    idx === 1 ? 'bg-slate-300 text-slate-900' :
                    'bg-[#23355b] text-slate-300'
                  }`}>
                    {idx + 1}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-xs text-white light:text-slate-900">
                      <span className="truncate max-w-[130px] sm:max-w-[170px]">{t.symbol}</span>
                      {isProfitable ? (
                        <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                      <span>{new Date(t.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</span>
                      <span>•</span>
                      <span>Entry: ₹{t.entryPrice}</span>
                      <span>Exit: ₹{t.exitPrice}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className={`text-xs font-black ${isProfitable ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {formatINR(t.netPnl)}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {t.pnlPercent > 0 ? `+${t.pnlPercent}%` : `${t.pnlPercent}%`}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
