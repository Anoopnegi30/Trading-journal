import React, { useState } from 'react';
import { useTradeContext } from '../../context/TradeContext';
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  Calendar, 
  ShieldCheck, 
  Plus, 
  CheckCircle2, 
  X, 
  Check,
  Scale,
  Flame
} from 'lucide-react';
import { formatINR, calculateDashboardStats } from '../../utils/calculations';

export const ChallengePage: React.FC = () => {
  const { trades } = useTradeContext();
  const [showSetChallengeModal, setShowSetChallengeModal] = useState(false);

  // Challenge settings
  const [startingCapital, setStartingCapital] = useState<number>(100000);
  const [targetCapital, setTargetCapital] = useState<number>(200000);
  const [timeframe, setTimeframe] = useState<string>('August 2026');
  const [market, setMarket] = useState<string>('Indian');
  const [maxRiskPercent, setMaxRiskPercent] = useState<number>(2);

  const stats = calculateDashboardStats(trades);
  const currentCapital = startingCapital + stats.totalPnl;
  const progressPercent = Math.min(100, Math.max(0, Math.round(((currentCapital - startingCapital) / (targetCapital - startingCapital)) * 100)));

  const handleSetChallenge = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSetChallengeModal(false);
    alert('Trading Growth Challenge set for August 2026! Best of luck.');
  };

  return (
    <div className="space-y-6">
      {/* Header with CTA */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#111a2e] light:bg-white p-5 rounded-3xl border border-[#1e2942] light:border-slate-200 shadow-xl">
        <div>
          <h2 className="text-xl font-black text-white light:text-slate-900 tracking-tight flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-400" />
            Capital Growth Challenge (August 2026)
          </h2>
          <p className="text-xs text-slate-400">
            Set ambitious growth targets and test your execution discipline
          </p>
        </div>

        <button
          onClick={() => setShowSetChallengeModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-500/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Set Challenge</span>
        </button>
      </div>

      {/* Main Challenge Progress Card */}
      <div className="p-6 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-bold text-slate-400">Current Capital Balance</span>
            <div className="text-3xl font-black text-white light:text-slate-900">
              {formatINR(currentCapital)}
            </div>
            <p className="text-xs text-slate-400">
              Starting Capital: <span className="font-semibold text-slate-300 light:text-slate-700">{formatINR(startingCapital)}</span> • Target: <span className="font-semibold text-emerald-400">{formatINR(targetCapital)}</span>
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-full border-4 border-blue-500/20 border-t-blue-500 flex items-center justify-center font-black text-xl text-blue-400">
              {progressPercent}%
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#18233c] light:bg-slate-200 h-2.5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-emerald-400 rounded-full transition-all duration-500"
            style={{ width: `${Math.max(2, progressPercent)}%` }}
          />
        </div>
      </div>

      {/* Set Challenge Modal */}
      {showSetChallengeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#111a2e] light:bg-white border border-[#23355b] light:border-slate-300 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white light:text-slate-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-amber-400" />
                Set Trading Challenge
              </h3>
              <button
                onClick={() => setShowSetChallengeModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#16223b]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSetChallenge} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1.5">
                  Starting Capital (₹)
                </label>
                <input
                  type="number"
                  required
                  value={startingCapital}
                  onChange={(e) => setStartingCapital(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#16223b] light:bg-slate-100 text-white light:text-slate-900 border border-[#23355b] focus:border-blue-500 focus:outline-none text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1.5">
                  Target Capital (₹)
                </label>
                <input
                  type="number"
                  required
                  value={targetCapital}
                  onChange={(e) => setTargetCapital(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#16223b] light:bg-slate-100 text-white light:text-slate-900 border border-[#23355b] focus:border-blue-500 focus:outline-none text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1.5">
                  Max Risk Per Trade (%)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={maxRiskPercent}
                  onChange={(e) => setMaxRiskPercent(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#16223b] light:bg-slate-100 text-white light:text-slate-900 border border-[#23355b] focus:border-blue-500 focus:outline-none text-xs font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSetChallengeModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/25 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Activate Challenge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
