import React from 'react';
import { useTradeContext } from '../../context/TradeContext';
import { formatINR } from '../../utils/calculations';
import { 
  X, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Clock, 
  Tag, 
  ShieldCheck, 
  AlertTriangle,
  HeartPulse,
  Trash2,
  CheckCircle2,
  FileText
} from 'lucide-react';

export const TradeDetailModal: React.FC = () => {
  const { selectedTrade, setSelectedTrade, deleteTrade } = useTradeContext();

  if (!selectedTrade) return null;

  const isProfit = selectedTrade.netPnl > 0;
  const isLoss = selectedTrade.netPnl < 0;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#1e2942] light:border-slate-100">
          <div>
            <div className="flex items-center gap-2.5">
              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                selectedTrade.direction === 'Long'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}>
                {selectedTrade.direction}
              </span>
              <h3 className="text-xl font-black text-white light:text-slate-900">
                {selectedTrade.symbol}
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-500/15 text-blue-400">
                {selectedTrade.marketType} • {selectedTrade.duration}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(selectedTrade.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              {selectedTrade.time && (
                <>
                  <span>•</span>
                  <Clock className="w-3.5 h-3.5" />
                  {selectedTrade.time}
                </>
              )}
            </p>
          </div>

          <button
            onClick={() => setSelectedTrade(null)}
            className="p-2 rounded-xl text-slate-400 hover:text-white light:hover:text-slate-900 bg-[#16223b] light:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* PnL & Financial Card */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-[#16223b] light:bg-slate-50 border border-[#23355b] light:border-slate-200">
          <div>
            <span className="text-[11px] text-slate-400 font-medium">Net P&L</span>
            <p className={`text-lg font-black mt-0.5 ${
              isProfit ? 'text-emerald-400' : isLoss ? 'text-rose-400' : 'text-slate-300'
            }`}>
              {isProfit ? `+${formatINR(selectedTrade.netPnl)}` : formatINR(selectedTrade.netPnl)}
            </p>
            <p className="text-[10px] text-slate-400">{selectedTrade.pnlPercent}% return</p>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 font-medium">Entry / Exit</span>
            <p className="text-sm font-bold text-white light:text-slate-900 mt-0.5">
              ₹{selectedTrade.entryPrice} → ₹{selectedTrade.exitPrice}
            </p>
            <p className="text-[10px] text-slate-400">Qty: {selectedTrade.quantity}</p>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 font-medium">Risk / Reward</span>
            <p className="text-sm font-bold text-purple-400 mt-0.5">
              {selectedTrade.riskReward || '1:2.0'}
            </p>
            <p className="text-[10px] text-slate-400">
              SL: ₹{selectedTrade.stopLoss || 0} | Tgt: ₹{selectedTrade.target || 0}
            </p>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 font-medium">Setup Strategy</span>
            <p className="text-sm font-bold text-blue-400 mt-0.5">
              {selectedTrade.strategy || 'Breakout'}
            </p>
            <p className="text-[10px] text-emerald-400 font-semibold">{selectedTrade.outcome}</p>
          </div>
        </div>

        {/* Trade Analysis & Notes */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-300 light:text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-blue-400" />
            Trade Analysis & Execution Reason
          </h4>
          <div className="p-3.5 rounded-2xl bg-[#0d1527] light:bg-slate-100 border border-[#1e2942] light:border-slate-200 text-xs text-slate-300 light:text-slate-700 leading-relaxed">
            {selectedTrade.analysis || selectedTrade.notes || 'No analysis recorded for this trade.'}
          </div>
        </div>

        {/* Psychology & Discipline Breakdown */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-300 light:text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <HeartPulse className="w-4 h-4 text-rose-400" />
            Psychology & Discipline Review
          </h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-[#16223b] light:bg-slate-50 border border-[#23355b] light:border-slate-200 text-xs space-y-1">
              <span className="text-slate-400 font-medium">Emotional State:</span>
              <p className="font-bold text-white light:text-slate-900">{selectedTrade.emotion || 'Disciplined'}</p>
              <div className="flex items-center gap-2 pt-1 text-[11px]">
                <span className="text-slate-400">Confidence Rating:</span>
                <span className="text-emerald-400 font-bold">{selectedTrade.confidence || 85}%</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#16223b] light:bg-slate-50 border border-[#23355b] light:border-slate-200 text-xs space-y-1">
              <span className="text-slate-400 font-medium">Tagged Mistakes:</span>
              {selectedTrade.mistakes && selectedTrade.mistakes.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedTrade.mistakes.map((m, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      ✕ {m}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-emerald-400 font-semibold flex items-center gap-1 pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> None (Disciplined execution)
                </p>
              )}
            </div>
          </div>

          {selectedTrade.lessonLearned && (
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
              <span className="font-bold text-blue-400">💡 Key Lesson: </span>
              {selectedTrade.lessonLearned}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-[#1e2942] light:border-slate-100">
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this trade?')) {
                deleteTrade(selectedTrade.id);
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 text-xs font-semibold transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Trade
          </button>

          <button
            onClick={() => setSelectedTrade(null)}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-md"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
