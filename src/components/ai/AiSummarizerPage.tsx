import React, { useState } from 'react';
import { useTradeContext } from '../../context/TradeContext';
import { 
  Sparkles, 
  Brain, 
  Settings, 
  Calendar, 
  TrendingUp, 
  Trophy, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  ListChecks,
  RefreshCw,
  Zap,
  HeartPulse
} from 'lucide-react';

export const AiSummarizerPage: React.FC = () => {
  const { trades, marketFilter, setMarketFilter } = useTradeContext();
  const [selectedPeriod, setSelectedPeriod] = useState<'30 Days' | '60 Days' | '90 Days' | 'Custom'>('30 Days');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleGenerateSummary = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-white light:text-slate-900 tracking-tight">
          AI Trading Analysis
        </h2>
      </div>

      {/* Top Generator Card matching screenshot 3 */}
      <div className="p-6 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-black text-white light:text-slate-900">
              Generate AI Summary
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Analyze your last 30 days of trading performance
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <select
              value={marketFilter}
              onChange={(e) => setMarketFilter(e.target.value)}
              className="bg-[#16223b] light:bg-slate-100 text-slate-200 text-xs font-semibold rounded-xl px-3.5 py-2 border border-[#23355b] focus:outline-none"
            >
              <option value="Indian">Indian</option>
              <option value="Crypto">Crypto</option>
              <option value="Forex">Forex</option>
            </select>

            <button
              onClick={handleGenerateSummary}
              disabled={isAnalyzing}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Generate AI Summary
                </>
              )}
            </button>
          </div>
        </div>

        {/* Period Selector Pills matching screenshot 3 */}
        <div className="pt-2 border-t border-[#1e2942] light:border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> PERIOD
            </span>
            <div className="flex items-center gap-1.5 ml-2">
              {(['30 Days', '60 Days', '90 Days', 'Custom'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setSelectedPeriod(p)}
                  className={`px-3 py-1 text-xs font-bold rounded-xl transition-all ${
                    selectedPeriod === p
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-[#16223b] light:bg-slate-100 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Loading animation state matching screenshot 3 */}
      {isAnalyzing && (
        <div className="p-12 rounded-3xl bg-[#111a2e] border border-[#1e2942] text-center space-y-4 animate-in fade-in duration-200">
          <div className="w-16 h-16 rounded-full bg-blue-500/20 border-2 border-blue-400 mx-auto flex items-center justify-center text-blue-400 shadow-xl shadow-blue-500/30 animate-pulse">
            <Brain className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white">Recognizing Patterns</h4>
            <p className="text-xs text-slate-400 mt-1">Identifying trading behaviors and market correlations</p>
          </div>
          <div className="w-64 max-w-full bg-[#18233c] h-1.5 rounded-full mx-auto overflow-hidden">
            <div className="bg-blue-500 h-full w-2/3 animate-pulse" />
          </div>
        </div>
      )}

      {/* AI Generated Report Sections matching screenshots 2, 4, 5 */}
      {!isAnalyzing && (
        <div className="space-y-5">
          
          {/* Section 1: PERFORMANCE matching screenshot 5 */}
          <div className="p-6 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-xs tracking-wider uppercase">
              <TrendingUp className="w-4 h-4" /> 1. PERFORMANCE
            </div>

            <p className="text-xs text-slate-300 light:text-slate-700 leading-relaxed">
              You have done an excellent job in the last 30 days, making a total profit of <strong className="text-emerald-400">₹1,46,167.65</strong> from 17 trades. Your win rate of <strong className="text-blue-400">70.6%</strong> is very strong, meaning you win more than 7 out of every 10 trades you take. The average profit per winning trade (<strong className="text-emerald-400">₹13,593.23</strong>) is much bigger than your average loss (<strong className="text-rose-400">-₹4,237.79</strong>), which shows you are letting your winners run and cutting your losses short. Your risk-to-reward ratio of <strong className="text-purple-400">4.41</strong> is outstanding, meaning for every ₹1 you risk, you are making ₹4.41 in profit. However, your capital efficiency is only 6.04%, which means you are not using your full trading capital very actively, and you had zero trades with targets set, which is a missed opportunity for planning.
            </p>

            {/* Confidence Level progress bar matching screenshot 5 */}
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-slate-400 uppercase tracking-wider">CONFIDENCE LEVEL:</span>
                <span className="text-blue-400 font-mono">4.5/10</span>
              </div>
              <div className="w-full bg-[#18233c] light:bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full w-[45%]" />
              </div>
            </div>
          </div>

          {/* Section 2: STRENGTHS matching screenshot 5 */}
          <div className="p-6 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs tracking-wider uppercase">
              <Trophy className="w-4 h-4" /> 2. STRENGTHS
            </div>

            <div className="space-y-2.5">
              <div className="p-3.5 rounded-2xl bg-[#0d1e2c]/60 border border-emerald-500/20 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-300 light:text-slate-800 leading-relaxed">
                  Your breakout strategy is your biggest strength: it has a <strong className="text-emerald-400">88.9% win rate</strong> from 9 trades and earned you <strong className="text-emerald-400">₹88,024.77</strong>, which is a huge profit factor of 25.77.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#0d1e2c]/60 border border-emerald-500/20 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-300 light:text-slate-800 leading-relaxed">
                  You follow your trading rules perfectly: you have <strong className="text-emerald-400">100% adherence</strong> to all three key rules, including booking partial profits and using fixed quantity, which added over <strong className="text-emerald-400">₹28,000</strong> in extra impact.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#0d1e2c]/60 border border-emerald-500/20 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-300 light:text-slate-800 leading-relaxed">
                  You stay calm and disciplined: your dominant emotion is <strong>"Calm"</strong> for 10 trades, and those trades gave you an average profit of <strong className="text-emerald-400">₹9,607.29</strong> with a high confidence of 9/10.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#0d1e2c]/60 border border-emerald-500/20 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-300 light:text-slate-800 leading-relaxed">
                  Your risk management is excellent: your average loss is only <strong className="text-slate-200">₹4,237.79</strong>, and your realized risk-to-reward ratio is <strong className="text-purple-400">1:2239.51</strong>, meaning your profits are massively bigger than your losses.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: WEAKNESSES matching screenshot 4 */}
          <div className="p-6 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs tracking-wider uppercase">
              <AlertTriangle className="w-4 h-4" /> 3. WEAKNESSES
            </div>

            <div className="space-y-2.5">
              <div className="p-3.5 rounded-2xl bg-[#2a1322]/60 border border-rose-500/20 flex items-start gap-3">
                <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-300 light:text-slate-800 leading-relaxed">
                  Your pullback strategy is not working at all: you took 2 trades with a <strong className="text-rose-400">0% win rate</strong>, losing <strong className="text-rose-400">₹8,707.74</strong>, so this strategy needs to be reviewed or stopped.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#2a1322]/60 border border-rose-500/20 flex items-start gap-3">
                <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-300 light:text-slate-800 leading-relaxed">
                  You made 4 mistakes this week compared to zero last week, showing a recent slip in discipline, especially with one <strong className="text-rose-400">"Exited Too Early"</strong> mistake that cost you <strong className="text-rose-400">₹6,122.15</strong>.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#2a1322]/60 border border-rose-500/20 flex items-start gap-3">
                <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-300 light:text-slate-800 leading-relaxed">
                  You are not setting target prices for your trades: your target achievement is 0%, meaning you are not planning where to take profit, which can lead to leaving money on the table.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#2a1322]/60 border border-rose-500/20 flex items-start gap-3">
                <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-300 light:text-slate-800 leading-relaxed">
                  Your capital efficiency is low at 6.04%: you deployed only ₹2.4 lakhs out of a much larger capital, meaning you are not using your money to its full potential.
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: ACTIONS with priority badges matching screenshot 2 */}
          <div className="p-6 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-400 font-bold text-xs tracking-wider uppercase">
                <ListChecks className="w-4 h-4" /> 4. ACTIONS
              </div>
              <span className="text-xs font-bold text-slate-400">+ 10 &gt;</span>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-[#16223b] light:bg-slate-50 border border-[#23355b] space-y-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    HIGH PRIORITY
                  </span>
                </div>
                <p className="text-xs text-slate-300 light:text-slate-800 leading-relaxed">
                  First, stop using the pullback strategy completely until you can study why it failed and find a better entry method for those setups.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#16223b] light:bg-slate-50 border border-[#23355b] space-y-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-rose-400" />
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    CRITICAL
                  </span>
                </div>
                <p className="text-xs text-slate-300 light:text-slate-800 leading-relaxed">
                  Second, start setting a clear target price for every trade before you enter, so you have a plan for taking profits and can track your target achievement.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#16223b] light:bg-slate-50 border border-[#23355b] space-y-2">
                <p className="text-xs text-slate-300 light:text-slate-800 leading-relaxed">
                  Third, review your "Exited Too Early" mistake: note down the exact reason you left the trade early and create a rule to hold until your stop-loss or target is hit.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#16223b] light:bg-slate-50 border border-[#23355b] space-y-2">
                <p className="text-xs text-slate-300 light:text-slate-800 leading-relaxed">
                  Fourth, work on increasing your capital efficiency by taking more high-probability trades each week, but only when your setup is perfect, not just to be active.
                </p>
              </div>
            </div>
          </div>

          {/* Section 5: PSYCHOLOGY matching screenshot 2 */}
          <div className="p-6 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-purple-400 font-bold text-xs tracking-wider uppercase">
              <HeartPulse className="w-4 h-4" /> 5. PSYCHOLOGY
            </div>

            <div className="p-4 rounded-2xl bg-[#16223b] light:bg-slate-50 border border-[#23355b]">
              <p className="text-xs text-slate-300 light:text-slate-800 leading-relaxed">
                Your emotional state is very healthy, with <strong>"Calm"</strong> being your dominant emotion and giving you the best results. However, your confidence score of <strong className="text-blue-400">7.4/10</strong> is good but not perfect, and you had 3 trades with <strong>"Unknown"</strong> emotion that still made good profits, which suggests you may be trading on autopilot.
              </p>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
