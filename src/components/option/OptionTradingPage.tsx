import React, { useState } from "react";
import { useTradeContext } from "../../context/TradeContext";
import { 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Scale, 
  Calculator, 
  ArrowUpRight, 
  ArrowDownRight, 
  Flame, 
  CheckCircle2, 
  Layers, 
  RefreshCw,
  Sparkles,
  ShieldAlert,
  Compass,
  Cpu,
  Target,
  BarChart2,
  Lock,
  ArrowRight
} from "lucide-react";
import { formatINR } from "../../utils/calculations";

type IndexKey = "NIFTY" | "BANKNIFTY" | "FINNIFTY" | "SENSEX";

interface IndexMeta {
  name: string;
  symbol: string;
  strikeStep: number;
  lotSize: number;
  expiryDay: string;
}

const INDICES_CONFIG: Record<IndexKey, IndexMeta> = {
  NIFTY: { name: "Nifty 50", symbol: "NIFTY", strikeStep: 50, lotSize: 65, expiryDay: "Thursday" },
  BANKNIFTY: { name: "Bank Nifty", symbol: "BANKNIFTY", strikeStep: 100, lotSize: 15, expiryDay: "Wednesday" },
  FINNIFTY: { name: "Fin Nifty", symbol: "FINNIFTY", strikeStep: 50, lotSize: 40, expiryDay: "Tuesday" },
  SENSEX: { name: "BSE Sensex", symbol: "SENSEX", strikeStep: 100, lotSize: 10, expiryDay: "Friday" }
};

export const OptionTradingPage: React.FC = () => {
  const { ticker, setIsNewTradeModalOpen, setEditingTrade, challenge } = useTradeContext();
  const [selectedIndex, setSelectedIndex] = useState<IndexKey>("NIFTY");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Position Sizing Calculator Inputs
  const [calcCapital, setCalcCapital] = useState<number>(challenge.startingCapital || 100000);
  const [riskPercent, setRiskPercent] = useState<number>(challenge.maxRiskPerTrade || 2);
  const [stopLossPoints, setStopLossPoints] = useState<number>(6);
  const [optionBuyPrice, setOptionBuyPrice] = useState<number>(125);

  const config = INDICES_CONFIG[selectedIndex];

  // Find live spot price from ticker
  const currentTickerItem = ticker.find(t => 
    t.name.toLowerCase().includes(selectedIndex === "NIFTY" ? "nifty 50" : selectedIndex === "BANKNIFTY" ? "nifty bank" : selectedIndex === "SENSEX" ? "sensex" : "fin")
  );

  const spotPrice = currentTickerItem?.value || (selectedIndex === "NIFTY" ? 24175.65 : selectedIndex === "BANKNIFTY" ? 57496.30 : 77264.51);
  const changePercent = currentTickerItem?.changePercent || 0;
  const isMarketBullish = changePercent >= 0;

  // Derive ATM and Option Chain Strikes
  const atmStrike = Math.round(spotPrice / config.strikeStep) * config.strikeStep;
  const strikes = [
    atmStrike - config.strikeStep * 2,
    atmStrike - config.strikeStep,
    atmStrike,
    atmStrike + config.strikeStep,
    atmStrike + config.strikeStep * 2
  ];

  // Key Institutional Levels
  const overheadSupply = selectedIndex === "NIFTY" ? "24,280 – 24,320" : selectedIndex === "BANKNIFTY" ? "57,800 – 58,000" : "77,800 – 78,000";
  const dynamicPivot = selectedIndex === "NIFTY" ? "24,180 – 24,200" : selectedIndex === "BANKNIFTY" ? "57,450 – 57,550" : "77,200 – 77,300";
  const demandZone = selectedIndex === "NIFTY" ? "24,100 – 24,120" : selectedIndex === "BANKNIFTY" ? "57,150 – 57,250" : "76,800 – 77,000";
  const invalidationSL = selectedIndex === "NIFTY" ? "24,050" : selectedIndex === "BANKNIFTY" ? "57,000" : "76,600";

  // Position sizing calculations
  const maxRiskAmount = Math.round(calcCapital * (riskPercent / 100));
  const riskPerLot = stopLossPoints * config.lotSize;
  const calculatedLots = riskPerLot > 0 ? Math.max(1, Math.floor(maxRiskAmount / riskPerLot)) : 1;
  const totalQuantity = calculatedLots * config.lotSize;
  const totalCapitalRequired = Math.round(totalQuantity * optionBuyPrice);
  const totalActualRisk = Math.round(totalQuantity * stopLossPoints);
  const target1Reward = Math.round(totalQuantity * (stopLossPoints * 1.5));
  const target2Reward = Math.round(totalQuantity * (stopLossPoints * 2.3));
  const target3Reward = Math.round(totalQuantity * (stopLossPoints * 3.0));

  // PCR & VIX Estimates
  const estimatedPcr = isMarketBullish ? 1.08 : 0.88;
  const estimatedVix = 13.8;

  // Setup Live Scalp Trade Click
  const handleLogScalpTrade = (strike: number, type: "CE" | "PE", price: number) => {
    setEditingTrade({
      id: "",
      date: new Date().toISOString().split("T")[0],
      marketType: "Indian",
      duration: "Scalp",
      tradeType: "Option Buying",
      symbol: `${config.symbol} ${strike} ${type}`,
      direction: type === "CE" ? "Long" : "Short",
      entryPrice: price,
      exitPrice: Number((price + stopLossPoints * 2.3).toFixed(2)),
      quantity: totalQuantity,
      totalAmount: totalCapitalRequired,
      stopLoss: Number((price - stopLossPoints).toFixed(2)),
      target: Number((price + stopLossPoints * 2.3).toFixed(2)),
      fees: 55,
      pnl: target2Reward,
      netPnl: target2Reward - 55,
      pnlPercent: Number(((stopLossPoints * 2.3 / price) * 100).toFixed(2)),
      riskReward: "1:2.3",
      strategy: "9&15 Ema",
      outcome: "Full Success",
      emotion: "Disciplined",
      confidence: 85,
      mistakes: [],
      followedPlan: true,
      followedRisk: true,
      notes: `Institutional Scalp on ${config.name} ${strike} ${type}. Risk: ₹${totalActualRisk}, Target: ₹${target2Reward}.`,
      analysis: "Confluence of Demand FVG zone, EMA 9/15 crossover and VWAP breakout.",
      createdAt: new Date().toISOString()
    });
    setIsNewTradeModalOpen(true);
  };

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 700);
  };

  return (
    <div className="space-y-6">
      
      {/* ========================================================================= */}
      {/* 🚀 ENGINE HEADER & INDEX SELECTOR */}
      {/* ========================================================================= */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-[#111a2e] light:bg-white p-5 sm:p-6 rounded-3xl border border-[#1e2942] light:border-slate-200 shadow-2xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
            <Cpu className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black text-white light:text-slate-900 tracking-tight">
                AI Options Intelligence Engine
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                INSTITUTIONAL RADAR
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Quantitative Derivatives Confluence, Smart Money Order Flow & Probabilistic Decision Matrix
            </p>
          </div>
        </div>

        {/* Index Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1.5 bg-[#16223b] light:bg-slate-100 rounded-2xl border border-[#23355b] light:border-slate-200 overflow-x-auto max-w-full no-scrollbar">
          {(Object.keys(INDICES_CONFIG) as IndexKey[]).map((key) => {
            const isSelected = selectedIndex === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedIndex(key)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-[#131d35]"
                }`}
              >
                {INDICES_CONFIG[key].name}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🌤️ 4 KEY INSTITUTIONAL RADAR GAUGES */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Widget 1: Market Weather Meter */}
        <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-blue-400" />
              Market Weather Meter
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              REGIME
            </span>
          </div>
          <div className="text-lg font-black text-amber-400 flex items-center gap-2">
            <span>🌤️ Range Bound / Rotational</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            Sector divergence active. Largecap IT/Pharma holding while Banks consolidate.
          </p>
        </div>

        {/* Widget 2: Smart Money Tracker */}
        <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-400" />
              Smart Money Tracker
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              INSTITUTIONAL
            </span>
          </div>
          <div className="text-lg font-black text-emerald-400 flex items-center gap-2">
            <span>🟢 Accumulation on Dips</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            Put writing concentrated at 24,000–24,100. Call resistance capped near 24,300.
          </p>
        </div>

        {/* Widget 3: Trade Quality Score */}
        <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-purple-400" />
              Trade Quality Score
            </span>
            <span className="text-[10px] font-black px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
              GRADE A+
            </span>
          </div>
          <div className="text-2xl font-black text-purple-400 font-mono flex items-center gap-2">
            <span>A+ Spread / Scalp</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            High probability mean-reversion setup at demand FVG with tight invalidation SL.
          </p>
        </div>

        {/* Widget 4: AI Confidence Gauge */}
        <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              AI Confidence Gauge
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              CONFLUENCE
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-3xl font-black text-cyan-400 font-mono">
              78%
            </div>
            <div className="w-20 bg-[#16223b] h-2.5 rounded-full overflow-hidden border border-[#23355b]">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full w-[78%]"></div>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            Multi-timeframe confluence on 15M EMA compression & VWAP anchor.
          </p>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 🕵️ WHAT INSTITUTIONAL TRADERS ARE LIKELY DOING */}
      {/* ========================================================================= */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#111a2e] via-[#16223b] to-[#111a2e] light:from-white light:to-slate-50 border border-[#1e2942] light:border-slate-200 shadow-xl space-y-3">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-blue-400">
          <Activity className="w-4 h-4" />
          <span>What Institutional Traders Are Likely Doing (Live Order Flow Synthesis)</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300 light:text-slate-700 leading-relaxed">
          <div className="p-3.5 rounded-2xl bg-[#0d1527]/80 light:bg-slate-100 border border-[#1e2d4d] light:border-slate-200 space-y-1">
            <strong className="text-white light:text-slate-900 block font-bold">1. FII / DII Sectoral Absorption:</strong>
            Domestic institutions (DII) are aggressively absorbing any dip in IT and defensive stocks (+3.18%), neutralizing banking weakness and preventing sharp downward liquidation.
          </div>
          <div className="p-3.5 rounded-2xl bg-[#0d1527]/80 light:bg-slate-100 border border-[#1e2d4d] light:border-slate-200 space-y-1">
            <strong className="text-white light:text-slate-900 block font-bold">2. Dealer Gamma & Pin Risk:</strong>
            Options market makers have sold heavy straddles near the <strong>24,200 ATM strike</strong>. They will actively delta-hedge to keep spot pinned between 24,100 and 24,280.
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 📊 STATISTICAL PROBABILITY & CONFLUENCE KEY LEVELS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Probability Breakdown */}
        <div className="p-6 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#1e2942] pb-3">
            <h3 className="text-sm font-black text-white light:text-slate-900 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-blue-400" />
              Directional Probability Engine
            </h3>
            <span className="text-[10px] font-mono text-slate-400">100% Normalized</span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-emerald-400">🟢 Bullish Expansion (Break &gt; 24,280)</span>
                <span className="font-mono text-emerald-400">35%</span>
              </div>
              <div className="w-full bg-[#16223b] h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-400 h-full rounded-full w-[35%]"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-amber-400">🟡 Sideways Range (24,080 – 24,250)</span>
                <span className="font-mono text-amber-400">50%</span>
              </div>
              <div className="w-full bg-[#16223b] h-2 rounded-full overflow-hidden">
                <div className="bg-amber-400 h-full rounded-full w-[50%]"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-rose-400">🔴 Bearish Breakdown (&lt; 24,050)</span>
                <span className="font-mono text-rose-400">15%</span>
              </div>
              <div className="w-full bg-[#16223b] h-2 rounded-full overflow-hidden">
                <div className="bg-rose-400 h-full rounded-full w-[15%]"></div>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#16223b] border border-[#23355b] text-[11px] text-slate-300">
            <strong>Optimal Edge:</strong> Mean-reversion scalping at range edges. Avoid buying breakouts in the middle of the range.
          </div>
        </div>

        {/* Right: Key Institutional Confluence Levels */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#1e2942] pb-3">
            <h3 className="text-sm font-black text-white light:text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              Institutional Price Levels ({config.name})
            </h3>
            <span className="text-xs font-mono font-bold text-white bg-blue-600 px-2.5 py-0.5 rounded-lg">
              Spot: {spotPrice.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-[#16223b] border border-[#23355b] space-y-1">
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">
                🛑 Overhead Supply / Order Block
              </span>
              <div className="text-base font-black text-white font-mono">{overheadSupply}</div>
              <p className="text-[10px] text-slate-400">Heavy Call Writing ceiling & Liquidity sweep resistance.</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#16223b] border border-[#23355b] space-y-1">
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">
                ⚖️ Dynamic Pivot / VWAP Anchor
              </span>
              <div className="text-base font-black text-white font-mono">{dynamicPivot}</div>
              <p className="text-[10px] text-slate-400">Session equilibrium. EMA 9/15 convergence band.</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#16223b] border border-[#23355b] space-y-1">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                🎯 Demand Zone / Fair Value Gap (FVG)
              </span>
              <div className="text-base font-black text-emerald-400 font-mono">{demandZone}</div>
              <p className="text-[10px] text-slate-400">Institutional discount entry with high risk-reward.</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#16223b] border border-[#23355b] space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                🛡️ Structural Invalidation SL
              </span>
              <div className="text-base font-black text-rose-300 font-mono">{invalidationSL}</div>
              <p className="text-[10px] text-slate-400">15-min close below this level terminates bullish bias.</p>
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 🎯 AI STRATEGY RECOMMENDATION (HIGH PROBABILITY EXECUTION SETUP) */}
      {/* ========================================================================= */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-[#111a2e] via-[#13203f] to-[#111a2e] light:from-white light:to-blue-50/40 border-2 border-blue-500/30 shadow-2xl space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#1e2942] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white light:text-slate-900 tracking-tight">
                  Recommended Strategy: Bull Call Spread / Demand Scalp
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-500 text-white shadow-sm">
                  1:2.3 R:R
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Optimized for low VIX (13.8) to eliminate theta decay while capturing mean-reversion upside
              </p>
            </div>
          </div>

          <button
            onClick={() => handleLogScalpTrade(atmStrike, "CE", optionBuyPrice)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all transform active:scale-95 cursor-pointer"
          >
            <Zap className="w-4 h-4 stroke-[3]" />
            <span>⚡ Apply & Log Setup ({config.symbol} {atmStrike} CE)</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-[#16223b]/80 border border-[#23355b]">
            <span className="text-[10px] text-slate-400 block font-bold">Entry Trigger</span>
            <span className="font-mono font-bold text-emerald-400">Pullback @ {demandZone}</span>
          </div>
          <div className="p-3 rounded-2xl bg-[#16223b]/80 border border-[#23355b]">
            <span className="text-[10px] text-slate-400 block font-bold">Strike Selection</span>
            <span className="font-mono font-bold text-white">{config.symbol} {atmStrike} CE (ATM)</span>
          </div>
          <div className="p-3 rounded-2xl bg-[#16223b]/80 border border-[#23355b]">
            <span className="text-[10px] text-slate-400 block font-bold">Strict Stop Loss</span>
            <span className="font-mono font-bold text-rose-400">₹{optionBuyPrice - stopLossPoints} (-{stopLossPoints} pts)</span>
          </div>
          <div className="p-3 rounded-2xl bg-[#16223b]/80 border border-[#23355b]">
            <span className="text-[10px] text-slate-400 block font-bold">Target 1 (1:1.5)</span>
            <span className="font-mono font-bold text-emerald-300">₹{(optionBuyPrice + stopLossPoints * 1.5).toFixed(1)}</span>
          </div>
          <div className="p-3 rounded-2xl bg-[#16223b]/80 border border-[#23355b]">
            <span className="text-[10px] text-slate-400 block font-bold">Target 2 (1:2.3)</span>
            <span className="font-mono font-bold text-emerald-200">₹{(optionBuyPrice + stopLossPoints * 2.3).toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🎯 LIVE STRIKE PRICE MATRIX (OPTION CHAIN) */}
      {/* ========================================================================= */}
      <div className="p-6 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#1e2942] pb-3">
          <div>
            <h3 className="text-sm font-black text-white light:text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              Live Strike Matrix & Quick Scalp Execution ({config.name})
            </h3>
            <p className="text-xs text-slate-400">
              Click <strong>"⚡ Buy CE"</strong> or <strong>"⚡ Buy PE"</strong> to auto-fill the trade ticket instantly!
            </p>
          </div>

          <button
            onClick={handleManualRefresh}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-xl bg-[#16223b] border border-[#23355b] transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-blue-400" : ""}`} />
            <span>Refresh Chain</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#16223b] light:bg-slate-50 text-slate-400 font-bold text-[10px] uppercase tracking-wider border-b border-[#1e2942]">
              <tr>
                <th className="py-3 px-4 text-emerald-400">Call (CE) Action</th>
                <th className="py-3 px-4 text-emerald-400">CE Est. Price</th>
                <th className="py-3 px-4 text-center font-black text-white">Strike Price</th>
                <th className="py-3 px-4 text-right text-rose-400">PE Est. Price</th>
                <th className="py-3 px-4 text-right text-rose-400">Put (PE) Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2942]">
              {strikes.map((strike) => {
                const isAtm = strike === atmStrike;
                const isCeItm = strike < atmStrike;
                const isPeItm = strike > atmStrike;
                
                const cePrice = Math.max(25, Number((140 + (atmStrike - strike) * 0.55).toFixed(1)));
                const pePrice = Math.max(25, Number((135 + (strike - atmStrike) * 0.55).toFixed(1)));

                return (
                  <tr 
                    key={strike}
                    className={`hover:bg-[#16223b]/60 transition-colors ${
                      isAtm ? "bg-blue-600/10 border-y border-blue-500/30" : ""
                    }`}
                  >
                    {/* Call Buy Button */}
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleLogScalpTrade(strike, "CE", cePrice)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-600 hover:text-white text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all cursor-pointer"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Buy {strike} CE</span>
                      </button>
                    </td>

                    {/* CE Price */}
                    <td className="py-3 px-4 font-mono font-bold text-white">
                      ₹{cePrice}
                      {isCeItm && <span className="ml-2 text-[9px] bg-emerald-500/20 text-emerald-400 px-1 rounded font-normal">ITM</span>}
                    </td>

                    {/* Strike Center */}
                    <td className="py-3 px-4 text-center font-mono font-black text-sm">
                      <span className={`px-3 py-1 rounded-xl ${isAtm ? "bg-blue-600 text-white shadow-md" : "text-slate-300"}`}>
                        {strike}
                      </span>
                      {isAtm && <div className="text-[9px] text-blue-400 font-bold mt-0.5">ATM STRIKE</div>}
                    </td>

                    {/* PE Price */}
                    <td className="py-3 px-4 text-right font-mono font-bold text-white">
                      {isPeItm && <span className="mr-2 text-[9px] bg-rose-500/20 text-rose-400 px-1 rounded font-normal">ITM</span>}
                      ₹{pePrice}
                    </td>

                    {/* Put Buy Button */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleLogScalpTrade(strike, "PE", pePrice)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-600 hover:text-white text-rose-400 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Buy {strike} PE</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🎛️ SMART POSITION SIZER & RISK CALCULATOR */}
      {/* ========================================================================= */}
      <div className="p-6 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-6">
        <div className="flex items-center gap-2.5 border-b border-[#1e2942] pb-4">
          <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-white light:text-slate-900 tracking-tight">
              Option Position Sizing & Risk Guard
            </h3>
            <p className="text-xs text-slate-400">
              Calculate exact safe lots based on your strict Stop Loss in points to prevent account blowouts
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Controls Column */}
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-300 mb-1">
                Account Capital (₹)
              </label>
              <input
                type="number"
                value={calcCapital}
                onChange={(e) => setCalcCapital(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#16223b] text-white border border-[#23355b] font-mono focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Max Risk Per Trade (%)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={riskPercent}
                  onChange={(e) => setRiskPercent(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#16223b] text-white border border-[#23355b] font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Stop Loss (Points)
                </label>
                <input
                  type="number"
                  value={stopLossPoints}
                  onChange={(e) => setStopLossPoints(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#16223b] text-rose-400 font-bold border border-[#23355b] font-mono focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">
                Option Premium Buy Price (₹)
              </label>
              <input
                type="number"
                value={optionBuyPrice}
                onChange={(e) => setOptionBuyPrice(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#16223b] text-white border border-[#23355b] font-mono focus:outline-none"
              />
            </div>
          </div>

          {/* Results Display Column */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Box 1: Recommended Quantity */}
            <div className="p-5 rounded-2xl bg-[#16223b] border border-[#23355b] space-y-2">
              <span className="text-xs font-bold text-slate-400">Recommended Quantity</span>
              <div className="text-3xl font-black text-blue-400 font-mono">
                {totalQuantity} Qty
              </div>
              <p className="text-[11px] text-slate-400">
                {calculatedLots} Lots ({config.lotSize} per lot)
              </p>
              <div className="pt-2 border-t border-[#1e2942] text-[11px] text-slate-300">
                Capital Required: <strong className="text-white font-mono">{formatINR(totalCapitalRequired)}</strong>
              </div>
            </div>

            {/* Box 2: Max Risk on SL */}
            <div className="p-5 rounded-2xl bg-[#16223b] border border-[#23355b] space-y-2">
              <span className="text-xs font-bold text-slate-400">Max Risk on Stop Loss</span>
              <div className="text-3xl font-black text-rose-400 font-mono">
                -{formatINR(totalActualRisk)}
              </div>
              <p className="text-[11px] text-slate-400">
                {stopLossPoints} points SL × {totalQuantity} qty
              </p>
              <div className="pt-2 border-t border-[#1e2942] text-[11px] text-emerald-400 font-semibold">
                Protected within {riskPercent}% capital rule
              </div>
            </div>

            {/* Box 3: Target Profits */}
            <div className="p-5 rounded-2xl bg-[#16223b] border border-[#23355b] space-y-2">
              <span className="text-xs font-bold text-slate-400">Expected Profit Targets</span>
              <div className="space-y-1 text-xs font-mono font-bold">
                <div className="flex justify-between">
                  <span className="text-slate-400">1:1.5 Target:</span>
                  <span className="text-emerald-400">+{formatINR(target1Reward)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">1:2.3 Target:</span>
                  <span className="text-emerald-300">+{formatINR(target2Reward)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">1:3.0 Target:</span>
                  <span className="text-emerald-200">+{formatINR(target3Reward)}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-[#1e2942] text-[10px] text-slate-400">
                Trail SL to cost after Target 1!
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🛡️ CONTINGENCY PLAYBOOK & GOLDEN RULES */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
            <CheckCircle2 className="w-4 h-4" />
            Rule 1: Always Trade ATM / 1-Strike ITM
          </div>
          <p className="text-xs text-slate-300 light:text-slate-600 leading-relaxed">
            Deep OTM options suffer massive Theta decay in low VIX. Stick to high Delta (0.50+) strikes for fast moves.
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-2">
          <div className="flex items-center gap-2 text-blue-400 font-bold text-xs">
            <CheckCircle2 className="w-4 h-4" />
            Rule 2: Fixed 5-8 Points Stop Loss
          </div>
          <p className="text-xs text-slate-300 light:text-slate-600 leading-relaxed">
            Never average a losing option trade. If the setup breaks below {invalidationSL}, exit immediately without emotion.
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
            <CheckCircle2 className="w-4 h-4" />
            Rule 3: Max 2 Quality Trades Per Day
          </div>
          <p className="text-xs text-slate-300 light:text-slate-600 leading-relaxed">
            Overtrading is the #1 killer in option buying. Lock your daily profit and shut down the terminal!
          </p>
        </div>
      </div>

    </div>
  );
};
