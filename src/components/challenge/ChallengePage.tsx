import React, { useState, useEffect } from 'react';
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
  Flame,
  Zap,
  Edit3,
  RotateCcw,
  Award,
  AlertCircle
} from 'lucide-react';
import { formatINR, calculateDashboardStats } from '../../utils/calculations';
import confetti from 'canvas-confetti';

export const ChallengePage: React.FC = () => {
  const { trades, challenge, saveChallenge, resetChallenge } = useTradeContext();
  const [showSetChallengeModal, setShowSetChallengeModal] = useState(false);

  // Form states initialized with persistent challenge
  const [challengeName, setChallengeName] = useState(challenge.name || 'August 2026 Capital Growth Challenge');
  const [startingCapital, setStartingCapital] = useState<number>(challenge.startingCapital || 100000);
  const [targetCapital, setTargetCapital] = useState<number>(challenge.targetCapital || 200000);
  const [targetDays, setTargetDays] = useState<number>(challenge.targetDays || 30);
  const [maxRiskPercent, setMaxRiskPercent] = useState<number>(challenge.maxRiskPerTrade || 2);
  const [maxDailyLoss, setMaxDailyLoss] = useState<number>(challenge.maxDailyLoss || 3000);
  const [notes, setNotes] = useState<string>(challenge.notes || '');

  // Keep local form in sync when persistent challenge changes
  useEffect(() => {
    setChallengeName(challenge.name);
    setStartingCapital(challenge.startingCapital);
    setTargetCapital(challenge.targetCapital);
    setTargetDays(challenge.targetDays);
    setMaxRiskPercent(challenge.maxRiskPerTrade);
    setMaxDailyLoss(challenge.maxDailyLoss);
    setNotes(challenge.notes || '');
  }, [challenge]);

  const stats = calculateDashboardStats(trades);
  const currentCapital = startingCapital + stats.totalPnl;
  const targetProfit = targetCapital - startingCapital;
  const realizedProfit = stats.totalPnl;
  
  const progressPercent = targetProfit > 0 
    ? Math.min(100, Math.max(0, Math.round((realizedProfit / targetProfit) * 100))) 
    : 0;

  const handleSetChallenge = (e: React.FormEvent) => {
    e.preventDefault();
    saveChallenge({
      id: challenge.id || 'challenge-aug-2026',
      name: challengeName.trim() || 'August 2026 Capital Growth Challenge',
      startingCapital: Number(startingCapital) || 100000,
      targetCapital: Number(targetCapital) || 200000,
      startDate: challenge.startDate || '2026-08-01',
      targetDays: Number(targetDays) || 30,
      maxRiskPerTrade: Number(maxRiskPercent) || 2,
      maxDailyLoss: Number(maxDailyLoss) || 3000,
      isActive: true,
      notes: notes.trim()
    });

    setShowSetChallengeModal(false);

    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {}
  };

  const milestones = [
    { label: '25% Goal Achieved', target: startingCapital + targetProfit * 0.25, achieved: realizedProfit >= targetProfit * 0.25 },
    { label: '50% Halfway Mark', target: startingCapital + targetProfit * 0.50, achieved: realizedProfit >= targetProfit * 0.50 },
    { label: '75% Growth Surge', target: startingCapital + targetProfit * 0.75, achieved: realizedProfit >= targetProfit * 0.75 },
    { label: '100% Target Completed', target: targetCapital, achieved: realizedProfit >= targetProfit }
  ];

  return (
    <div className="space-y-6">
      {/* Header with CTA */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#111a2e] light:bg-white p-5 rounded-3xl border border-[#1e2942] light:border-slate-200 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white light:text-slate-900 tracking-tight flex items-center gap-2">
              {challenge.name || 'Capital Growth Challenge'}
            </h2>
            <p className="text-xs text-slate-400">
              Set ambitious growth targets, lock in discipline, and track real-time milestones
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setShowSetChallengeModal(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-500/20 cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Challenge Settings</span>
          </button>
        </div>
      </div>

      {/* Main Challenge Progress Card */}
      <div className="p-6 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Account Balance</span>
            <div className="text-4xl font-black text-white light:text-slate-900 tracking-tight">
              {formatINR(currentCapital)}
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap justify-center md:justify-start">
              <span>Starting: <strong className="text-slate-200 light:text-slate-800 font-mono">{formatINR(startingCapital)}</strong></span>
              <span>•</span>
              <span>Target: <strong className="text-emerald-400 font-mono">{formatINR(targetCapital)}</strong></span>
              <span>•</span>
              <span>P&L: <strong className={`font-mono ${realizedProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{realizedProfit >= 0 ? '+' : ''}{formatINR(realizedProfit)}</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-28 h-28 rounded-3xl bg-gradient-to-tr from-blue-600/20 to-emerald-500/20 border border-blue-500/30 flex flex-col items-center justify-center p-3 text-center shadow-lg">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Progress</span>
              <span className="text-2xl font-black text-white light:text-slate-900">{progressPercent}%</span>
              <span className="text-[10px] text-emerald-400 font-semibold">{realizedProfit >= 0 ? 'Profitable' : 'Drawdown'}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold text-slate-400">
            <span>{formatINR(startingCapital)}</span>
            <span className="text-blue-400 font-bold">{progressPercent}% Target Completed</span>
            <span>{formatINR(targetCapital)}</span>
          </div>
          <div className="w-full bg-[#18233c] light:bg-slate-200 h-3.5 rounded-full overflow-hidden p-0.5 border border-[#23355b]">
            <div
              className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-400 rounded-full transition-all duration-700 shadow-md"
              style={{ width: `${Math.max(3, progressPercent)}%` }}
            />
          </div>
        </div>

        {/* Challenge Milestones */}
        <div>
          <h4 className="text-xs font-bold text-slate-300 light:text-slate-700 uppercase tracking-wider mb-3">
            Milestone Benchmarks
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {milestones.map((m, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl border transition-all ${
                  m.achieved
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-[#16223b]/60 light:bg-slate-50 border-[#23355b]/60 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold">{m.label}</span>
                  {m.achieved ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-600" />}
                </div>
                <div className="text-sm font-mono font-black text-white light:text-slate-900">
                  {formatINR(m.target)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rules & Risk Parameters Ribbon */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-[#16223b] light:bg-slate-50 border border-[#23355b] text-xs">
            <span className="text-slate-400 block mb-0.5">Max Risk Per Trade</span>
            <span className="text-sm font-bold text-white light:text-slate-900 font-mono">{challenge.maxRiskPerTrade || 2}% of Capital</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#16223b] light:bg-slate-50 border border-[#23355b] text-xs">
            <span className="text-slate-400 block mb-0.5">Daily Max Loss Limit</span>
            <span className="text-sm font-bold text-rose-400 font-mono">{formatINR(challenge.maxDailyLoss || 3000)}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#16223b] light:bg-slate-50 border border-[#23355b] text-xs">
            <span className="text-slate-400 block mb-0.5">Target Duration</span>
            <span className="text-sm font-bold text-blue-400 font-mono">{challenge.targetDays || 30} Days</span>
          </div>
        </div>

      </div>

      {/* Set Challenge Modal */}
      {showSetChallengeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-[#111a2e] light:bg-white border border-[#23355b] light:border-slate-300 rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-[#1e2942] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center font-bold">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white light:text-slate-900 tracking-tight">
                    Set Trading Growth Challenge
                  </h3>
                  <p className="text-[11px] text-slate-400">Settings are permanently saved in your journal</p>
                </div>
              </div>

              <button
                onClick={() => setShowSetChallengeModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white light:hover:text-slate-900 bg-[#16223b] light:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSetChallenge} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 light:text-slate-700 mb-1">
                  Challenge Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={challengeName}
                  onChange={(e) => setChallengeName(e.target.value)}
                  placeholder="e.g. August 2026 100k to 200k Capital Growth"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#16223b] light:bg-slate-100 text-white light:text-slate-900 border border-[#23355b] focus:border-blue-500 focus:outline-none font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 light:text-slate-700 mb-1">
                    Starting Capital (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={startingCapital}
                    onChange={(e) => setStartingCapital(Number(e.target.value))}
                    placeholder="100000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#16223b] light:bg-slate-100 text-white light:text-slate-900 border border-[#23355b] focus:border-blue-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 light:text-slate-700 mb-1">
                    Target Capital (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={targetCapital}
                    onChange={(e) => setTargetCapital(Number(e.target.value))}
                    placeholder="200000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#16223b] light:bg-slate-100 text-white light:text-slate-900 border border-[#23355b] focus:border-blue-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 light:text-slate-700 mb-1">
                    Target Days
                  </label>
                  <input
                    type="number"
                    value={targetDays}
                    onChange={(e) => setTargetDays(Number(e.target.value))}
                    placeholder="30"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#16223b] light:bg-slate-100 text-white light:text-slate-900 border border-[#23355b] focus:border-blue-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 light:text-slate-700 mb-1">
                    Max Risk / Trade (%)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={maxRiskPercent}
                    onChange={(e) => setMaxRiskPercent(Number(e.target.value))}
                    placeholder="2"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#16223b] light:bg-slate-100 text-white light:text-slate-900 border border-[#23355b] focus:border-blue-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 light:text-slate-700 mb-1">
                    Daily Loss Limit (₹)
                  </label>
                  <input
                    type="number"
                    value={maxDailyLoss}
                    onChange={(e) => setMaxDailyLoss(Number(e.target.value))}
                    placeholder="3000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#16223b] light:bg-slate-100 text-white light:text-slate-900 border border-[#23355b] focus:border-blue-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 light:text-slate-700 mb-1">
                  Challenge Motivation / Rules
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Strict 1:2 R:R, Max 2 trades per day, No revenge trading after loss."
                  className="w-full px-3.5 py-2 rounded-xl bg-[#16223b] light:bg-slate-100 text-white light:text-slate-900 border border-[#23355b] focus:border-blue-500 focus:outline-none text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1e2942]">
                <button
                  type="button"
                  onClick={() => setShowSetChallengeModal(false)}
                  className="px-4 py-2 font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-blue-500/25 flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  Save & Lock Challenge
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
