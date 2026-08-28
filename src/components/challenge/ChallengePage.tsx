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
import { formatINR } from '../../utils/calculations';

export const ChallengePage: React.FC = () => {
  const { trades } = useTradeContext();
  const [showSetChallengeModal, setShowSetChallengeModal] = useState(false);

  // Challenge settings state matching screenshot 5
  const [startingCapital, setStartingCapital] = useState<number>(100000);
  const [targetCapital, setTargetCapital] = useState<number>(250000);
  const [timeframe, setTimeframe] = useState<string>('1 Week');
  const [market, setMarket] = useState<string>('Indian');
  const [excludeHolidays, setExcludeHolidays] = useState<boolean>(true);
  const [maxRiskPercent, setMaxRiskPercent] = useState<number>(2);

  // Current calculated progress
  const currentCapital = 250000;
  const progressPercent = Math.min(100, Math.round(((currentCapital - startingCapital) / (targetCapital - startingCapital)) * 100));

  const handleSetChallenge = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSetChallengeModal(false);
    alert('Trading Growth Challenge Activated! Good luck sticking to your discipline rules.');
  };

  return (
    <div className="space-y-6">
      {/* Header with CTA matching screenshot 3 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#111a2e] light:bg-white p-5 rounded-3xl border border-[#1e2942] light:border-slate-200 shadow-xl">
        <div>
          <h2 className="text-xl font-black text-white light:text-slate-900 tracking-tight flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-400" />
            Trading Challenges
          </h2>
          <p className="text-xs text-slate-400">
            Set ambitious growth targets and test your execution discipline
          </p>
        </div>

        <button
          onClick={() => setShowSetChallengeModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all transform active:scale-95"
        >
          <Target className="w-4 h-4" />
          Set Challenge
        </button>
      </div>

      {/* Main Challenge Card matching screenshot 3 */}
      <div className="p-7 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-6">
        
        {/* Top title & Days Remaining */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e2942] light:border-slate-100 pb-5">
          <div>
            <h3 className="text-2xl font-black text-white light:text-slate-900">
              Capital Growth Challenge
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Track your progress towards your trading goals with real-time analytics and performance metrics.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-[#16223b] light:bg-slate-50 p-2 rounded-2xl border border-[#23355b]">
            <div className="px-3 py-1 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Days Remaining</span>
              <p className="text-base font-black text-amber-400">0</p>
            </div>
            <div className="h-8 w-px bg-[#23355b]" />
            <div className="px-3 py-1 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Projected Date</span>
              <p className="text-xs font-bold text-white light:text-slate-900 mt-0.5">23 Dec 25</p>
            </div>
          </div>
        </div>

        {/* Progress Donut & Target Bars Grid matching screenshot 3 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          
          {/* Progress Donut (Left) */}
          <div className="flex flex-col items-center justify-center p-4">
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-blue-500"
                  strokeDasharray={`${progressPercent}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center text-center">
                <span className="text-4xl font-black text-white light:text-slate-900">{progressPercent}%</span>
                <span className="text-[10px] font-bold text-blue-400 mt-0.5">Progress to target</span>
              </div>
            </div>
          </div>

          {/* Target Bars & Calculations (Right 2 cols) */}
          <div className="lg:col-span-2 space-y-4 text-xs">
            
            {/* Capital Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-bold">
                <span className="text-slate-400">Starting <strong className="text-white font-mono">{formatINR(startingCapital)}</strong></span>
                <span className="text-blue-400">Current <strong className="text-white font-mono">{formatINR(currentCapital)}</strong></span>
                <span className="text-emerald-400">Target <strong className="text-emerald-400 font-mono">{formatINR(targetCapital)}</strong></span>
              </div>
              <div className="w-full bg-[#18233c] light:bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-600 to-emerald-400 h-full rounded-full transition-all duration-700"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Daily Target */}
            <div className="p-4 rounded-2xl bg-[#16223b] light:bg-slate-50 border border-[#23355b] flex items-center justify-between">
              <div>
                <span className="text-slate-400 font-bold">Daily Target Required</span>
                <p className="text-lg font-black text-white light:text-slate-900 mt-0.5">₹714.29<span className="text-xs text-slate-400 font-normal">/day</span></p>
              </div>
              <span className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                +₹0 today
              </span>
            </div>

            {/* Win Rate Requirement */}
            <div className="p-4 rounded-2xl bg-[#16223b] light:bg-slate-50 border border-[#23355b] flex items-center justify-between">
              <div>
                <span className="text-slate-400 font-bold">Win Rate on Challenge Trades</span>
                <p className="text-lg font-black text-emerald-400 mt-0.5">100%</p>
              </div>
              <span className="text-slate-400 text-xs font-medium">Disciplined execution</span>
            </div>

          </div>

        </div>

        {/* Bottom KPI Row matching screenshot 3 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-[#1e2942] light:border-slate-100">
          <div className="p-4 rounded-2xl bg-[#16223b] light:bg-slate-50 border border-[#23355b]">
            <span className="text-[10px] font-bold text-slate-400 uppercase">PROGRESS TO TARGET</span>
            <p className="text-xl font-black text-blue-400 mt-1">100%</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#16223b] light:bg-slate-50 border border-[#23355b]">
            <span className="text-[10px] font-bold text-slate-400 uppercase">AVG RISK:REWARD</span>
            <p className="text-xl font-black text-purple-400 mt-1">1:3.21</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#16223b] light:bg-slate-50 border border-[#23355b]">
            <span className="text-[10px] font-bold text-slate-400 uppercase">HIGHEST PROFIT DAY</span>
            <p className="text-xl font-black text-emerald-400 mt-1">₹31,074.54</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#16223b] light:bg-slate-50 border border-[#23355b]">
            <span className="text-[10px] font-bold text-slate-400 uppercase">MAX DRAWDOWN</span>
            <p className="text-xl font-black text-emerald-400 mt-1">0%</p>
          </div>
        </div>

      </div>

      {/* Set Trading Challenge Modal matching screenshot 5 */}
      {showSetChallengeModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#1e2942] light:border-slate-100">
              <h3 className="text-base font-black text-white light:text-slate-900">
                Set Trading Challenge
              </h3>
              <button
                onClick={() => setShowSetChallengeModal(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSetChallenge} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Starting Capital</label>
                <input
                  type="text"
                  value={`₹ ${startingCapital.toLocaleString('en-IN')}`}
                  onChange={(e) => {
                    const val = Number(e.target.value.replace(/[^0-9]/g, ''));
                    setStartingCapital(val);
                  }}
                  className="w-full bg-[#16223b] border border-[#23355b] rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Target Capital</label>
                <input
                  type="text"
                  value={`₹ ${targetCapital.toLocaleString('en-IN')}`}
                  onChange={(e) => {
                    const val = Number(e.target.value.replace(/[^0-9]/g, ''));
                    setTargetCapital(val);
                  }}
                  className="w-full bg-[#16223b] border border-[#23355b] rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Timeframe</label>
                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  className="w-full bg-[#16223b] border border-[#23355b] rounded-xl px-3 py-2 text-white focus:outline-none"
                >
                  <option value="1 Week">1 Week</option>
                  <option value="1 Month">1 Month</option>
                  <option value="3 Months">3 Months</option>
                  <option value="6 Months">6 Months</option>
                  <option value="1 Year">1 Year</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Select Market</label>
                <select
                  value={market}
                  onChange={(e) => setMarket(e.target.value)}
                  className="w-full bg-[#16223b] border border-[#23355b] rounded-xl px-3 py-2 text-white focus:outline-none"
                >
                  <option value="Indian">Indian</option>
                  <option value="Crypto">Crypto</option>
                  <option value="Forex">Forex</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#16223b] border border-[#23355b]">
                <span className="text-slate-300 font-medium">Exclude Market Holidays</span>
                <button
                  type="button"
                  onClick={() => setExcludeHolidays(!excludeHolidays)}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                    excludeHolidays ? 'bg-blue-600' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      excludeHolidays ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Max Risk Per Trade (%)</label>
                <input
                  type="number"
                  value={maxRiskPercent}
                  onChange={(e) => setMaxRiskPercent(Number(e.target.value))}
                  className="w-full bg-[#16223b] border border-[#23355b] rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Check className="w-4 h-4" />
                  Set Challenge
                </button>
                <button
                  type="button"
                  onClick={() => setShowSetChallengeModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-[#16223b] text-slate-300 font-bold text-xs hover:bg-[#202f50]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
