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
  AlertCircle,
  Clock,
  Sliders,
  DollarSign,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Lightbulb
} from 'lucide-react';
import { formatINR, calculateDashboardStats } from '../../utils/calculations';
import confetti from 'canvas-confetti';

export const ChallengePage: React.FC = () => {
  const { trades, challenge, saveChallenge } = useTradeContext();
  const [showSetChallengeModal, setShowSetChallengeModal] = useState(false);

  // Form states initialized with persistent challenge
  const [challengeName, setChallengeName] = useState(challenge.name || 'Capital Growth Challenge');
  const [startingCapital, setStartingCapital] = useState<number>(challenge.startingCapital || 100000);
  const [targetCapital, setTargetCapital] = useState<number>(challenge.targetCapital || 200000);
  const [targetDays, setTargetDays] = useState<number>(challenge.targetDays || 30);
  const [maxRiskPercent, setMaxRiskPercent] = useState<number>(challenge.maxRiskPerTrade || 2);
  const [maxDailyLoss, setMaxDailyLoss] = useState<number>(challenge.maxDailyLoss || 3000);
  const [notes, setNotes] = useState<string>(challenge.notes || '');

  // Simulator State
  const [simTradesPlan, setSimTradesPlan] = useState<number>(30);
  const [simDailyTrades, setSimDailyTrades] = useState<number>(2);
  const [simWinRate, setSimWinRate] = useState<number>(60);

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
  const validTrades = trades.filter(t => !t.isNoTradeDay);
  
  const currentCapital = startingCapital + stats.totalPnl;
  const targetProfit = targetCapital - startingCapital;
  const realizedProfit = stats.totalPnl;
  const remainingProfitNeeded = Math.max(0, targetCapital - currentCapital);
  
  const progressPercent = targetProfit > 0 
    ? Math.min(100, Math.max(0, Math.round((realizedProfit / targetProfit) * 100))) 
    : 0;

  // Real Historical Performance Metrics
  const winTrades = validTrades.filter(t => t.netPnl > 0);
  const lossTrades = validTrades.filter(t => t.netPnl < 0);
  const avgWinPnl = winTrades.length > 0 ? winTrades.reduce((s, t) => s + t.netPnl, 0) / winTrades.length : 2500;
  const avgLossPnl = lossTrades.length > 0 ? Math.abs(lossTrades.reduce((s, t) => s + t.netPnl, 0) / lossTrades.length) : 1000;
  const winRate = validTrades.length > 0 ? (winTrades.length / validTrades.length) : 0.6;
  const lossRate = 1 - winRate;
  
  // Real Net Expectancy Per Trade
  const netExpectancyPerTrade = (winRate * avgWinPnl) - (lossRate * avgLossPnl);
  const effectiveExpectancy = netExpectancyPerTrade > 100 ? netExpectancyPerTrade : (avgWinPnl * 0.5);

  // Target Projections Calculations
  const estimatedTradesRemaining = remainingProfitNeeded > 0
    ? Math.ceil(remainingProfitNeeded / effectiveExpectancy)
    : 0;

  const estimatedDaysRemaining = simDailyTrades > 0 
    ? Math.ceil(estimatedTradesRemaining / simDailyTrades)
    : 0;

  const requiredProfitPerTrade = simTradesPlan > 0 
    ? Math.round(remainingProfitNeeded / simTradesPlan)
    : 0;

  const requiredProfitPerDay = targetDays > 0 
    ? Math.round(remainingProfitNeeded / Math.max(1, targetDays))
    : 0;

  const safeRiskPerTrade = Math.round(currentCapital * (maxRiskPercent / 100));

  // Simulator Dynamic Computation
  const simWinTradesCount = Math.round(simTradesPlan * (simWinRate / 100));
  const simLossTradesCount = simTradesPlan - simWinTradesCount;
  const simEstimatedTotalLoss = simLossTradesCount * safeRiskPerTrade;
  const simTotalGainNeeded = remainingProfitNeeded + simEstimatedTotalLoss;
  const simRequiredProfitPerWinTrade = simWinTradesCount > 0 ? Math.round(simTotalGainNeeded / simWinTradesCount) : 0;
  const simRequiredRR = safeRiskPerTrade > 0 ? (simRequiredProfitPerWinTrade / safeRiskPerTrade).toFixed(1) : '2.0';

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
              Set ambitious growth targets, calculate trade run-rate, and track target roadmap
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

        {/* Milestone Checkpoints */}
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
      </div>

      {/* ========================================================================= */}
      {/* 🚀 TARGET COMPLETION ROADMAP: EXACT RUN-RATE & TRADES NEEDED */}
      {/* ========================================================================= */}
      <div>
        <h3 className="text-sm font-black text-white light:text-slate-900 tracking-tight flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-emerald-400" />
          Target Completion Roadmap & Trade Projections
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Remaining Money to Target */}
          <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-2">
            <span className="text-xs font-bold text-slate-400 flex items-center justify-between">
              <span>Remaining to Goal</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </span>
            <div className="text-2xl font-black text-emerald-400 font-mono">
              {formatINR(remainingProfitNeeded)}
            </div>
            <p className="text-[11px] text-slate-400">
              Gap needed to reach {formatINR(targetCapital)}
            </p>
          </div>

          {/* Card 2: Estimated Trades Remaining */}
          <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-2">
            <span className="text-xs font-bold text-slate-400 flex items-center justify-between">
              <span>Estimated Trades Left</span>
              <Zap className="w-4 h-4 text-blue-400" />
            </span>
            <div className="text-2xl font-black text-blue-400 font-mono">
              {remainingProfitNeeded === 0 ? '0' : `~${estimatedTradesRemaining}`} trades
            </div>
            <p className="text-[11px] text-slate-400">
              Based on current net expectancy ({formatINR(effectiveExpectancy)}/trade)
            </p>
          </div>

          {/* Card 3: Required Net Profit Per Trade */}
          <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-2">
            <span className="text-xs font-bold text-slate-400 flex items-center justify-between">
              <span>Required Profit / Trade</span>
              <Flame className="w-4 h-4 text-amber-400" />
            </span>
            <div className="text-2xl font-black text-amber-400 font-mono">
              {formatINR(requiredProfitPerTrade)}
            </div>
            <p className="text-[11px] text-slate-400">
              If completed in next {simTradesPlan} planned trades
            </p>
          </div>

          {/* Card 4: Safe Max Risk per Trade */}
          <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-2">
            <span className="text-xs font-bold text-slate-400 flex items-center justify-between">
              <span>Max Stop Loss / Trade</span>
              <ShieldCheck className="w-4 h-4 text-rose-400" />
            </span>
            <div className="text-2xl font-black text-rose-400 font-mono">
              {formatINR(safeRiskPerTrade)}
            </div>
            <p className="text-[11px] text-slate-400">
              Strict {maxRiskPercent}% risk limit on current capital
            </p>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🎛️ INTERACTIVE TARGET CALCULATOR & SIMULATOR */}
      {/* ========================================================================= */}
      <div className="p-6 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#1e2942] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/15 text-blue-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white light:text-slate-900 tracking-tight">
                Interactive Challenge Simulator
              </h3>
              <p className="text-xs text-slate-400">
                Adjust planned trades, win rate, and daily frequency to see exact targets required
              </p>
            </div>
          </div>

          <span className="px-3 py-1 text-xs font-bold text-blue-400 bg-blue-500/10 rounded-xl border border-blue-500/20 font-mono">
            Target Gap: {formatINR(remainingProfitNeeded)}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Controls Column */}
          <div className="space-y-4 text-xs">
            {/* Slider 1: Planned Trades */}
            <div className="p-4 rounded-2xl bg-[#16223b] light:bg-slate-50 border border-[#23355b] space-y-2">
              <div className="flex justify-between font-bold">
                <span className="text-slate-300 light:text-slate-700">Planned Trades to Goal</span>
                <span className="text-blue-400 font-mono text-sm">{simTradesPlan} trades</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={simTradesPlan}
                onChange={(e) => setSimTradesPlan(Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>10 trades (Aggressive)</span>
                <span>100 trades (Conservative)</span>
              </div>
            </div>

            {/* Slider 2: Daily Trades Frequency */}
            <div className="p-4 rounded-2xl bg-[#16223b] light:bg-slate-50 border border-[#23355b] space-y-2">
              <div className="flex justify-between font-bold">
                <span className="text-slate-300 light:text-slate-700">Trades per Day</span>
                <span className="text-emerald-400 font-mono text-sm">{simDailyTrades} trades / day</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={simDailyTrades}
                onChange={(e) => setSimDailyTrades(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>1 trade (Strict Quality)</span>
                <span>5 trades (High Frequency)</span>
              </div>
            </div>

            {/* Slider 3: Expected Win Rate */}
            <div className="p-4 rounded-2xl bg-[#16223b] light:bg-slate-50 border border-[#23355b] space-y-2">
              <div className="flex justify-between font-bold">
                <span className="text-slate-300 light:text-slate-700">Expected Win Rate</span>
                <span className="text-purple-400 font-mono text-sm">{simWinRate}%</span>
              </div>
              <input
                type="range"
                min="40"
                max="80"
                step="5"
                value={simWinRate}
                onChange={(e) => setSimWinRate(Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>40% (High R:R required)</span>
                <span>80% (High Accuracy)</span>
              </div>
            </div>
          </div>

          {/* Results Display Column */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Box 1: Required Profit per Winning Trade */}
            <div className="p-5 rounded-2xl bg-[#16223b]/90 light:bg-slate-50 border border-[#23355b] space-y-2 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400">Required Profit Per Winning Trade</span>
                <div className="text-3xl font-black text-emerald-400 font-mono mt-1">
                  {formatINR(simRequiredProfitPerWinTrade)}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  At {simWinRate}% win rate across {simWinTradesCount} expected winning trades
                </p>
              </div>
              <div className="pt-2 border-t border-[#1e2942] text-[11px] text-slate-300 flex items-center justify-between">
                <span>Required R:R Ratio:</span>
                <span className="font-bold text-blue-400 font-mono">1 : {simRequiredRR}</span>
              </div>
            </div>

            {/* Box 2: Estimated Days & Completion Time */}
            <div className="p-5 rounded-2xl bg-[#16223b]/90 light:bg-slate-50 border border-[#23355b] space-y-2 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400">Estimated Days to Reach Target</span>
                <div className="text-3xl font-black text-blue-400 font-mono mt-1">
                  {Math.ceil(simTradesPlan / simDailyTrades)} Days
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  ~{(Math.ceil(simTradesPlan / simDailyTrades) / 5).toFixed(1)} trading weeks at {simDailyTrades} trades/day
                </p>
              </div>
              <div className="pt-2 border-t border-[#1e2942] text-[11px] text-slate-300 flex items-center justify-between">
                <span>Daily Profit Run-Rate:</span>
                <span className="font-bold text-emerald-400 font-mono">
                  {formatINR(Math.round(remainingProfitNeeded / Math.max(1, Math.ceil(simTradesPlan / simDailyTrades))))} / day
                </span>
              </div>
            </div>

            {/* Box 3: Total Loss Buffer Allocated */}
            <div className="p-5 rounded-2xl bg-[#16223b]/90 light:bg-slate-50 border border-[#23355b] space-y-2 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400">Expected Loss Buffer</span>
                <div className="text-2xl font-black text-rose-400 font-mono mt-1">
                  -{formatINR(simEstimatedTotalLoss)}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Buffer for {simLossTradesCount} losing trades @ {formatINR(safeRiskPerTrade)} max SL
                </p>
              </div>
              <div className="pt-2 border-t border-[#1e2942] text-[11px] text-slate-400">
                Losing trades are natural — proper R:R compensates for them.
              </div>
            </div>

            {/* Box 4: Execution Strategy Recommendation */}
            <div className="p-5 rounded-2xl bg-[#16223b]/90 light:bg-slate-50 border border-[#23355b] space-y-2 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4" /> Recommended Execution Plan
                </span>
                <p className="text-xs text-slate-200 light:text-slate-800 font-semibold mt-2 leading-relaxed">
                  Focus on taking strictly <strong className="text-white font-bold">{simDailyTrades} high-probability trades/day</strong> with minimum <strong className="text-emerald-400 font-bold">1:{simRequiredRR} Risk-to-Reward</strong> to achieve {formatINR(targetCapital)} safely!
                </p>
              </div>
              <div className="pt-2 border-t border-[#1e2942] text-[11px] text-slate-400 flex items-center justify-between">
                <span>Discipline Target:</span>
                <span className="text-emerald-400 font-bold">100% Plan Adherence</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🛡️ RISK RULES & MOTIVATION NOTES RIBBON */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 text-xs shadow-lg space-y-1">
          <span className="text-slate-400 font-semibold block">Max Risk Per Trade</span>
          <span className="text-base font-bold text-white light:text-slate-900 font-mono">{challenge.maxRiskPerTrade || 2}% of Capital ({formatINR(safeRiskPerTrade)})</span>
          <p className="text-[10px] text-slate-500">Limits drawdown on bad trading sessions</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 text-xs shadow-lg space-y-1">
          <span className="text-slate-400 font-semibold block">Daily Max Loss Limit</span>
          <span className="text-base font-bold text-rose-400 font-mono">{formatINR(challenge.maxDailyLoss || 3000)}</span>
          <p className="text-[10px] text-slate-500">Stop trading immediately if hit</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 text-xs shadow-lg space-y-1">
          <span className="text-slate-400 font-semibold block">Challenge Strategy / Rule</span>
          <span className="text-base font-bold text-emerald-400">Trend Line & Breakouts</span>
          <p className="text-[10px] text-slate-500">Only execute predefined A+ setups</p>
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
                  <p className="text-[11px] text-slate-400">Settings are permanently saved in your journal & cloud</p>
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
