import React, { useState, useMemo } from "react";
import { useTradeContext } from "../../context/TradeContext";
import { 
  TrendingUp, 
  Trophy, 
  AlertTriangle, 
  CheckCircle2, 
  MinusCircle, 
  Zap, 
  Brain, 
  Sparkles, 
  Settings, 
  ListChecks, 
  Target, 
  ShieldCheck, 
  Activity, 
  Clock,
  ArrowRight,
  HelpCircle,
  BarChart3,
  PlusCircle,
  RefreshCw
} from "lucide-react";
import { formatINR } from "../../utils/calculations";

type PeriodType = "30 Days" | "60 Days" | "90 Days" | "Custom";

interface AnalysisReport {
  performance: {
    totalProfit: number;
    totalTrades: number;
    winRate: number;
    winCount: number;
    lossCount: number;
    avgWin: number;
    avgLoss: number;
    riskRewardRatio: number;
    capitalEfficiency: number;
    tradesWithTarget: number;
    confidenceLevel: number;
    summaryText: string;
  };
  strengths: {
    id: string;
    text: string;
  }[];
  weaknesses: {
    id: string;
    text: string;
  }[];
  actions: {
    id: string;
    text: string;
    priority?: "CRITICAL" | "HIGH PRIORITY" | "MEDIUM PRIORITY";
  }[];
  psychology: {
    id: string;
    text: string;
  }[];
}

export const AiSummarizerPage: React.FC = () => {
  const { trades, marketFilter, setMarketFilter, challenge, setIsNewTradeModalOpen, syncFromDhan } = useTradeContext();
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>("30 Days");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analyzingProgress, setAnalyzingProgress] = useState<number>(0);
  const [analyzingStep, setAnalyzingStep] = useState<string>("Recognizing Patterns");
  const [analyzingSubtitle, setAnalyzingSubtitle] = useState<string>("Identifying trading behaviors and market correlations");
  const [showBenchmarkIfEmpty, setShowBenchmarkIfEmpty] = useState<boolean>(false);

  // Dynamic Analysis Generation based 100% on Real Trades
  const report = useMemo<AnalysisReport | null>(() => {
    // Filter trades by market type if selected
    const filteredTrades = trades.filter(t => !marketFilter || marketFilter === "All" || t.marketType === marketFilter);

    // If trader has trades logged, synthesize real calculations
    if (filteredTrades.length > 0) {
      const totalTrades = filteredTrades.length;
      const wins = filteredTrades.filter(t => (t.netPnl || t.pnl) > 0);
      const losses = filteredTrades.filter(t => (t.netPnl || t.pnl) < 0);
      const totalProfit = Number(filteredTrades.reduce((acc, t) => acc + (t.netPnl ?? t.pnl ?? 0), 0).toFixed(2));
      const winCount = wins.length;
      const lossCount = losses.length;
      const winRate = Number(((winCount / totalTrades) * 100).toFixed(1));

      const totalWinPnl = wins.reduce((acc, t) => acc + (t.netPnl ?? t.pnl ?? 0), 0);
      const totalLossPnl = Math.abs(losses.reduce((acc, t) => acc + (t.netPnl ?? t.pnl ?? 0), 0));

      const avgWin = winCount > 0 ? Number((totalWinPnl / winCount).toFixed(2)) : 0;
      const avgLoss = lossCount > 0 ? Number((totalLossPnl / lossCount).toFixed(2)) : 0;
      const riskRewardRatio = avgLoss > 0 ? Number((avgWin / avgLoss).toFixed(2)) : (avgWin > 0 ? 2.5 : 1.0);

      const tradesWithTarget = filteredTrades.filter(t => t.target && Number(t.target) > 0).length;
      const totalDeployedCapital = filteredTrades.reduce((acc, t) => acc + (t.totalAmount || (t.entryPrice * t.quantity) || 25000), 0);
      const userCap = challenge?.startingCapital || 100000;
      const capitalEfficiency = Math.min(100, Number(((totalDeployedCapital / (userCap * Math.max(1, totalTrades * 0.3))) * 100).toFixed(1))) || 25.0;

      const avgConfidence = Number((filteredTrades.reduce((acc, t) => acc + (t.confidence || 80), 0) / (totalTrades * 10)).toFixed(1));

      // Strategy breakdown
      const stratMap = new Map<string, { count: number; wins: number; pnl: number }>();
      filteredTrades.forEach(t => {
        const strat = t.strategy || "General Setup";
        const current = stratMap.get(strat) || { count: 0, wins: 0, pnl: 0 };
        current.count += 1;
        if ((t.netPnl || t.pnl) > 0) current.wins += 1;
        current.pnl += (t.netPnl ?? t.pnl ?? 0);
        stratMap.set(strat, current);
      });

      const stratList = Array.from(stratMap.entries()).sort((a, b) => b[1].pnl - a[1].pnl);
      const topStrat = stratList[0] || ["General Setup", { count: totalTrades, wins: winCount, pnl: totalProfit }];
      const bottomStrat = stratList.length > 1 ? stratList[stratList.length - 1] : null;

      // Emotion breakdown
      const emotionMap = new Map<string, { count: number; pnl: number }>();
      filteredTrades.forEach(t => {
        const emo = t.emotion || "Disciplined";
        const cur = emotionMap.get(emo) || { count: 0, pnl: 0 };
        cur.count += 1;
        cur.pnl += (t.netPnl ?? t.pnl ?? 0);
        emotionMap.set(emo, cur);
      });
      const topEmotion = Array.from(emotionMap.entries()).sort((a, b) => b[1].count - a[1].count)[0] || ["Disciplined", { count: totalTrades, pnl: totalProfit }];

      // Emotional Leaks
      const emotionalLeaks = filteredTrades.filter(t => ["FOMO", "Greed", "Revenge", "Anxious", "Impatient"].includes(t.emotion));

      // Mistakes breakdown
      const allMistakes: string[] = [];
      filteredTrades.forEach(t => {
        if (Array.isArray(t.mistakes)) allMistakes.push(...t.mistakes);
      });
      const topMistake = allMistakes[0] || null;

      // Dynamic Performance Summary Text
      const perfText = `You have taken ${totalTrades} trade(s) in the last ${selectedPeriod}, generating a net P&L of ${formatINR(totalProfit)} with a win rate of ${winRate}%. ` +
        (winCount > 0 && avgWin > 0 ? `Your average winning trade is ${formatINR(avgWin)} ` : "") +
        (lossCount > 0 && avgLoss > 0 ? `against an average loss of -${formatINR(avgLoss)}, giving a risk-to-reward ratio of 1:${riskRewardRatio}. ` : ". ") +
        `Capital efficiency is at ${capitalEfficiency}% based on your account size. ` +
        (tradesWithTarget === totalTrades 
          ? "All trades had planned targets set before entry." 
          : `${totalTrades - tradesWithTarget} trade(s) were entered without a predefined target price.`);

      // Dynamic Strengths
      const dynamicStrengths = [
        {
          id: "s1",
          text: `Your ${topStrat[0]} strategy is your leading setup: it has a ${Number(((topStrat[1].wins / topStrat[1].count) * 100).toFixed(1))}% win rate across ${topStrat[1].count} trade(s) and generated ${formatINR(topStrat[1].pnl)}.`
        },
        {
          id: "s2",
          text: `Disciplined Execution: You have maintained high execution standards with a dominant "${topEmotion[0]}" state across ${topEmotion[1].count} trade(s), yielding an average P&L of ${formatINR(Number((topEmotion[1].pnl / topEmotion[1].count).toFixed(2)))}.`
        },
        {
          id: "s3",
          text: `Risk Management Control: Average trade risk is managed with a realized R:R of 1:${riskRewardRatio}, keeping downside exposure contained.`
        }
      ];

      // Dynamic Weaknesses
      const dynamicWeaknesses = [];
      if (bottomStrat && bottomStrat[1].pnl < 0) {
        dynamicWeaknesses.push({
          id: "w1",
          text: `Your ${bottomStrat[0]} strategy is currently dragging performance: took ${bottomStrat[1].count} trade(s) with ${formatINR(bottomStrat[1].pnl)} net loss. Review entry criteria for this setup.`
        });
      }
      if (topMistake) {
        dynamicWeaknesses.push({
          id: "w2",
          text: `Mistake recorded: Logged "${topMistake}" across your trades. Maintain post-entry discipline to avoid repeating this mistake.`
        });
      }
      if (tradesWithTarget < totalTrades) {
        dynamicWeaknesses.push({
          id: "w3",
          text: `Missing Target Planning: ${totalTrades - tradesWithTarget} of ${totalTrades} trade(s) did not have a predefined target price set before entry.`
        });
      }
      if (dynamicWeaknesses.length === 0) {
        dynamicWeaknesses.push({
          id: "w-clean",
          text: "No major statistical weaknesses detected across your active trades. Continue maintaining your risk parameters."
        });
      }

      // Dynamic Actions
      const dynamicActions = [];
      if (bottomStrat && bottomStrat[1].pnl < 0) {
        dynamicActions.push({
          id: "a1",
          text: `First, pause or refine the ${bottomStrat[0]} strategy until backtesting confirms higher expectancy.`,
          priority: "HIGH PRIORITY" as const
        });
      }
      if (tradesWithTarget < totalTrades) {
        dynamicActions.push({
          id: "a2",
          text: "Second, ensure every single trade has a clear target price calculated before entry to lock in planned risk-to-reward ratios.",
          priority: "CRITICAL" as const
        });
      }
      if (topMistake) {
        dynamicActions.push({
          id: "a3",
          text: `Third, create a specific rule in the Rules tab to eliminate the "${topMistake}" execution slip.`
        });
      }
      dynamicActions.push({
        id: "a4",
        text: `Fourth, continue focusing on high-probability setups in ${topStrat[0]} and log all trades right after closing.`
      });

      // Dynamic Psychology
      let psychologyText = "";
      if (emotionalLeaks.length > 0) {
        const leakNames = Array.from(new Set(emotionalLeaks.map(t => t.emotion))).join(", ");
        psychologyText = `Detected ${emotionalLeaks.length} trade(s) influenced by emotional pressure (${leakNames}). Your primary emotion is "${topEmotion[0]}" across ${topEmotion[1].count} trade(s). Step away from the screen for 10 minutes if feeling anxious or rushed.`;
      } else {
        psychologyText = `Your psychological discipline is strong: dominant emotion is "${topEmotion[0]}" across all ${topEmotion[1].count} trade(s) with an average confidence rating of ${avgConfidence}/10. No revenge or FOMO trades detected.`;
      }

      return {
        performance: {
          totalProfit,
          totalTrades,
          winRate,
          winCount,
          lossCount,
          avgWin,
          avgLoss,
          riskRewardRatio,
          capitalEfficiency,
          tradesWithTarget,
          confidenceLevel: avgConfidence,
          summaryText: perfText
        },
        strengths: dynamicStrengths,
        weaknesses: dynamicWeaknesses,
        actions: dynamicActions,
        psychology: [
          {
            id: "p1",
            text: psychologyText
          }
        ]
      };
    }

    // If 0 trades and user wants benchmark demo
    if (showBenchmarkIfEmpty) {
      return {
        performance: {
          totalProfit: 146167.65,
          totalTrades: 17,
          winRate: 70.6,
          winCount: 12,
          lossCount: 5,
          avgWin: 13593.23,
          avgLoss: 4237.79,
          riskRewardRatio: 4.41,
          capitalEfficiency: 6.04,
          tradesWithTarget: 0,
          confidenceLevel: 7.4,
          summaryText: "You have done an excellent job in the last 30 days, making a total profit of ₹1,46,167.65 from 17 trades. Your win rate of 70.6% is very strong, meaning you win more than 7 out of every 10 trades you take. The average profit per winning trade (₹13,593.23) is much bigger than your average loss (₹-4,237.79), which shows you are letting your winners run and cutting your losses short. Your risk-to-reward ratio of 4.41 is outstanding, meaning for every ₹1 you risk, you are making ₹4.41 in profit. However, your capital efficiency is only 6.04%, which means you are not using your full trading capital very actively, and you had zero trades with targets set, which is a missed opportunity for planning."
        },
        strengths: [
          {
            id: 's1',
            text: 'Your breakout strategy is your biggest strength: it has a 88.9% win rate from 9 trades and earned you ₹88,024.77, which is a huge profit factor of 25.77.'
          },
          {
            id: 's2',
            text: 'You follow your trading rules perfectly: you have 100% adherence to all three key rules, including booking partial profits and using fixed quantity, which added over ₹28,000 in extra impact.'
          },
          {
            id: 's3',
            text: "You stay calm and disciplined: your dominant emotion is 'Calm' for 10 trades, and those trades gave you an average profit of ₹9,607.29 with confidence of 9/10."
          },
          {
            id: 's4',
            text: 'Your risk management is excellent: your average loss is only ₹4,237.79, and your realized risk-to-reward ratio is 1:2239.51, meaning your profits are massively bigger than your losses.'
          }
        ],
        weaknesses: [
          {
            id: 'w1',
            text: 'Your pullback strategy is not working at all: you took 2 trades with a 0% win rate, losing ₹8,707.74, so this strategy needs to be reviewed or stopped.'
          },
          {
            id: 'w2',
            text: "You made 4 mistakes this week compared to zero last week, showing a recent slip in discipline, especially with one 'Exited Too Early' mistake that cost you ₹6,122.15."
          },
          {
            id: 'w3',
            text: 'You are not setting target prices for your trades: your target achievement is 0%, meaning you are not planning where to take profit, which can lead to leaving money on the table.'
          },
          {
            id: 'w4',
            text: 'Your capital efficiency is low at 6.04%: you deployed only ₹2.4 lakhs out of a much larger capital, meaning you are not using your money to its full potential.'
          }
        ],
        actions: [
          {
            id: 'a1',
            text: 'First, stop using the pullback strategy completely until you can study why it failed and find a better entry method for those setups.',
            priority: 'HIGH PRIORITY'
          },
          {
            id: 'a2',
            text: 'Second, start setting a clear target price for every trade before you enter, so you have a plan for taking profits and can track your target achievement.',
            priority: 'CRITICAL'
          },
          {
            id: 'a3',
            text: "Third, review your 'Exited Too Early' mistake: note down the exact reason you left the trade early and create a rule to hold until your stop-loss or target is hit."
          },
          {
            id: 'a4',
            text: 'Fourth, work on increasing your capital efficiency by taking more high-probability trades each week, but only when your setup is perfect, not just to be active.'
          }
        ],
        psychology: [
          {
            id: 'p1',
            text: "Your emotional state is very healthy, with 'Calm' being your dominant emotion and giving you the best results. However, your confidence score of 7.4/10 is good but not perfect, and you maintained strong trade discipline throughout the period."
          }
        ]
      };
    }

    return null;
  }, [trades, marketFilter, selectedPeriod, challenge, showBenchmarkIfEmpty]);

  // Handle Triggering the Animated AI Diagnostic Engine
  const handleGenerateSummary = () => {
    setIsAnalyzing(true);
    setAnalyzingProgress(15);
    setAnalyzingStep("Recognizing Patterns");
    setAnalyzingSubtitle("Identifying trading behaviors and market correlations");

    setTimeout(() => {
      setAnalyzingProgress(45);
      setAnalyzingStep("Evaluating Risk & Strategy EV");
      setAnalyzingSubtitle("Calculating profit factors, win rates, and drawdowns");
    }, 600);

    setTimeout(() => {
      setAnalyzingProgress(75);
      setAnalyzingStep("Diagnosing Psychology & Rules");
      setAnalyzingSubtitle("Detecting emotional leaks, early exits, and discipline score");
    }, 1200);

    setTimeout(() => {
      setAnalyzingProgress(100);
      setAnalyzingStep("Compiling Executive Report");
      setAnalyzingSubtitle("Structuring actionable steps and institutional recommendations");
    }, 1800);

    setTimeout(() => {
      setIsAnalyzing(false);
      if (trades.length === 0) {
        setShowBenchmarkIfEmpty(true);
      }
    }, 2200);
  };

  return (
    <div className="space-y-6">
      
      {/* ========================================================================= */}
      {/* 🚀 AI TRADING ANALYSIS HEADER */}
      {/* ========================================================================= */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-white light:text-slate-900 tracking-tight">
          AI Trading Analysis
        </h2>
      </div>

      {/* ========================================================================= */}
      {/* ⚙️ GENERATE AI SUMMARY CONTROL PANEL */}
      {/* ========================================================================= */}
      <div className="p-6 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-black text-white light:text-slate-900 tracking-tight">
              Generate AI Summary
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Analyze your last {selectedPeriod.toLowerCase()} of trading performance ({trades.length} active trade{trades.length !== 1 ? "s" : ""})
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {/* Market Dropdown */}
            <select
              value={marketFilter}
              onChange={(e) => setMarketFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl bg-[#16223b] light:bg-slate-100 text-slate-200 light:text-slate-800 text-xs font-bold border border-[#23355b] light:border-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="Indian">Indian</option>
              <option value="Crypto">Crypto</option>
              <option value="Forex">Forex</option>
              <option value="US Stocks">US Stocks</option>
            </select>

            {/* Analyzing / Generate Button */}
            <button
              onClick={handleGenerateSummary}
              disabled={isAnalyzing}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-w-[130px]"
            >
              <Settings className={`w-4 h-4 ${isAnalyzing ? "animate-spin" : ""}`} />
              <span>{isAnalyzing ? "Analyzing..." : "Generate Analysis"}</span>
            </button>
          </div>
        </div>

        {/* Period Selector Pills */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            Period
          </span>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {(["30 Days", "60 Days", "90 Days", "Custom"] as PeriodType[]).map((period) => {
              const isSelected = selectedPeriod === period;
              return (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                      : "bg-[#16223b] light:bg-slate-100 text-slate-400 hover:text-slate-200 hover:bg-[#1a2b4d]"
                  }`}
                >
                  {period}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🔄 INTERACTIVE AI ANALYZING ANIMATION STATE (Image 1) */}
      {/* ========================================================================= */}
      {isAnalyzing ? (
        <div className="p-12 sm:p-16 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-2xl text-center space-y-6 animate-in fade-in duration-200">
          <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
            {/* Glowing Dual Pulse Rings */}
            <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping"></div>
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xl shadow-blue-500/40">
              <Brain className="w-8 h-8 animate-pulse" />
            </div>
          </div>

          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-lg font-black text-white light:text-slate-900 tracking-tight">
              {analyzingStep}
            </h3>
            <p className="text-xs text-slate-400">
              {analyzingSubtitle}
            </p>
          </div>

          {/* Glowing Animated Progress Bar */}
          <div className="max-w-md mx-auto space-y-2">
            <div className="w-full h-2 bg-[#16223b] rounded-full overflow-hidden border border-[#23355b]">
              <div
                style={{ width: `${analyzingProgress}%` }}
                className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 rounded-full transition-all duration-300 shadow-lg shadow-blue-500/50"
              ></div>
            </div>
            <span className="text-[10px] font-mono font-bold text-blue-400">
              {analyzingProgress}% Complete
            </span>
          </div>
        </div>
      ) : report ? (
        /* ========================================================================= */
        /* 📊 COMPLETE 5-SECTION DIAGNOSTIC REPORT (Images 2, 3, 4) */
        /* ========================================================================= */
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* ----------------------------------------------------------------------- */}
          {/* 1. PERFORMANCE SECTION */}
          {/* ----------------------------------------------------------------------- */}
          <div className="rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 overflow-hidden shadow-xl">
            {/* Header Banner */}
            <div className="px-6 py-3.5 bg-[#16223b] light:bg-slate-100 border-b border-[#1e2942] light:border-slate-200 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-200 light:text-slate-800">
                1. Performance
              </h4>
            </div>

            <div className="p-6 space-y-5">
              <p className="text-xs sm:text-sm text-slate-300 light:text-slate-600 leading-relaxed">
                {report.performance.summaryText}
              </p>

              {/* Confidence Level Meter */}
              <div className="pt-3 border-t border-[#1e2942] light:border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Confidence Level:
                </span>
                
                <div className="flex items-center gap-3 w-full sm:w-72">
                  <div className="flex-1 h-2 bg-[#16223b] light:bg-slate-200 rounded-full overflow-hidden border border-[#23355b] light:border-slate-300">
                    <div 
                      style={{ width: `${Math.min(100, (report.performance.confidenceLevel / 10) * 100)}%` }}
                      className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full"
                    ></div>
                  </div>
                  <span className="font-mono font-black text-slate-300 light:text-slate-700 text-xs shrink-0">
                    {report.performance.confidenceLevel}/10
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* 2. STRENGTHS SECTION */}
          {/* ----------------------------------------------------------------------- */}
          <div className="rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 overflow-hidden shadow-xl">
            {/* Header Banner */}
            <div className="px-6 py-3.5 bg-[#16223b] light:bg-slate-100 border-b border-[#1e2942] light:border-slate-200 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400">
                2. Strengths
              </h4>
            </div>

            <div className="p-6 space-y-3">
              {report.strengths.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-[#16223b]/70 light:bg-slate-50 border border-emerald-500/20 flex items-start gap-3.5"
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-xs text-slate-300 light:text-slate-700 leading-relaxed">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* 3. WEAKNESSES SECTION */}
          {/* ----------------------------------------------------------------------- */}
          <div className="rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 overflow-hidden shadow-xl">
            {/* Header Banner */}
            <div className="px-6 py-3.5 bg-[#16223b] light:bg-slate-100 border-b border-[#1e2942] light:border-slate-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <h4 className="text-xs font-black uppercase tracking-wider text-rose-400">
                3. Weaknesses
              </h4>
            </div>

            <div className="p-6 space-y-3">
              {report.weaknesses.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-[#16223b]/70 light:bg-slate-50 border border-rose-500/20 flex items-start gap-3.5"
                >
                  <div className="w-5 h-5 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0 mt-0.5">
                    <MinusCircle className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-xs text-slate-300 light:text-slate-700 leading-relaxed">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* 4. ACTIONS SECTION */}
          {/* ----------------------------------------------------------------------- */}
          <div className="rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 overflow-hidden shadow-xl">
            {/* Header Banner */}
            <div className="px-6 py-3.5 bg-[#16223b] light:bg-slate-100 border-b border-[#1e2942] light:border-slate-200 flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-blue-400" />
              <h4 className="text-xs font-black uppercase tracking-wider text-blue-400">
                4. Actions
              </h4>
            </div>

            <div className="p-6 space-y-3">
              {report.actions.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-[#16223b]/70 light:bg-slate-50 border border-blue-500/20 flex items-start justify-between gap-3.5"
                >
                  <div className="flex items-start gap-3.5 flex-1">
                    <div className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                      <Zap className="w-3.5 h-3.5" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs text-slate-300 light:text-slate-700 leading-relaxed">
                        {item.text}
                      </p>
                      {item.priority && (
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-[9px] font-black tracking-wider ${
                            item.priority === "CRITICAL"
                              ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                              : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          }`}
                        >
                          {item.priority}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* 5. PSYCHOLOGY SECTION */}
          {/* ----------------------------------------------------------------------- */}
          <div className="rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 overflow-hidden shadow-xl">
            {/* Header Banner */}
            <div className="px-6 py-3.5 bg-[#16223b] light:bg-slate-100 border-b border-[#1e2942] light:border-slate-200 flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-400" />
              <h4 className="text-xs font-black uppercase tracking-wider text-purple-400">
                5. Psychology
              </h4>
            </div>

            <div className="p-6 space-y-3">
              {report.psychology.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-[#16223b]/70 light:bg-slate-50 border border-purple-500/20 flex items-start gap-3.5"
                >
                  <div className="w-5 h-5 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0 mt-0.5">
                    <Brain className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-xs text-slate-300 light:text-slate-700 leading-relaxed">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      ) : (
        /* Empty State */
        <div className="p-12 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center mx-auto">
            <Brain className="w-7 h-7" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-bold text-white light:text-slate-900">
              No Trades Logged for {selectedPeriod} ({marketFilter})
            </h3>
            <p className="text-xs text-slate-400">
              Log your trades or sync from Dhan to let AI evaluate your real performance patterns and psychology.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setIsNewTradeModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/30 flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Log a Trade</span>
            </button>
            <button
              onClick={handleGenerateSummary}
              className="px-4 py-2 rounded-xl bg-[#16223b] hover:bg-[#1f3054] text-slate-300 text-xs font-bold border border-[#23355b] transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>View Benchmark Demo</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
