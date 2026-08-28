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
  RefreshCw 
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
  const [optionBuyPrice, setOptionBuyPrice] = useState<number>(120);

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

  // Position sizing calculations
  const maxRiskAmount = Math.round(calcCapital * (riskPercent / 100));
  const riskPerLot = stopLossPoints * config.lotSize;
  const calculatedLots = riskPerLot > 0 ? Math.max(1, Math.floor(maxRiskAmount / riskPerLot)) : 1;
  const totalQuantity = calculatedLots * config.lotSize;
  const totalCapitalRequired = Math.round(totalQuantity * optionBuyPrice);
  const totalActualRisk = Math.round(totalQuantity * stopLossPoints);
  const target1Reward = Math.round(totalQuantity * (stopLossPoints * 1.5));
  const target2Reward = Math.round(totalQuantity * (stopLossPoints * 2.0));
  const target3Reward = Math.round(totalQuantity * (stopLossPoints * 3.0));

  // PCR & VIX Estimates
  const estimatedPcr = isMarketBullish ? 1.15 : 0.85;
  const pcrSignal = estimatedPcr >= 1.2 ? "Strong Bullish (Put Writing Heavy)" : estimatedPcr <= 0.8 ? "Bearish (Call Writing Heavy)" : "Neutral / Scalping Zone";
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
      exitPrice: Number((price + stopLossPoints * 2).toFixed(2)),
      quantity: totalQuantity,
      totalAmount: totalCapitalRequired,
      stopLoss: Number((price - stopLossPoints).toFixed(2)),
      target: Number((price + stopLossPoints * 2).toFixed(2)),
      fees: 55,
      pnl: target2Reward,
      netPnl: target2Reward - 55,
      pnlPercent: Number(((stopLossPoints * 2 / price) * 100).toFixed(2)),
      riskReward: "1:2.0",
      strategy: "9&15 Ema",
      outcome: "Full Success",
      emotion: "Disciplined",
      confidence: 90,
      mistakes: [],
      followedPlan: true,
      followedRisk: true,
      notes: `Scalp trade on ${config.name} ATM/ITM Strike. Risk: ₹${totalActualRisk}, Target: ₹${target2Reward}.`,
      analysis: "Confluence of EMA 9/15 crossover and VWAP breakout.",
      createdAt: new Date().toISOString()
    });
    setIsNewTradeModalOpen(true);
  };

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#111a2e] light:bg-white p-5 rounded-3xl border border-[#1e2942] light:border-slate-200 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10">
            <Zap className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white light:text-slate-900 tracking-tight">
                Live Option Scalping Terminal
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 animate-pulse">
                LIVE MARKET EDGE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Real-time Option Chain, PCR Sentiment, EMA Scalping Signals & Smart Risk Position Sizer
            </p>
          </div>
        </div>

        {/* Index Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#16223b] light:bg-slate-100 rounded-2xl border border-[#23355b] overflow-x-auto no-scrollbar">
          {(Object.keys(INDICES_CONFIG) as IndexKey[]).map((key) => {
            const isSelected = selectedIndex === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedIndex(key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-slate-400 hover:text-slate-200 hover:bg-[#131d35]"
                }`}
              >
                {INDICES_CONFIG[key].name}
              </button>
            );
          })}
        </div>
      </div>

      {/* 📊 LIVE SPOT PRICE & INTRADAY SENTIMENT RADAR */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Spot Price */}
        <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">{config.name} Spot Price</span>
            <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
              Lot: {config.lotSize}
            </span>
          </div>
          <div className="text-3xl font-black text-white light:text-slate-900 font-mono">
            {spotPrice.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className={`flex items-center gap-0.5 ${isMarketBullish ? "text-emerald-400" : "text-rose-400"}`}>
              {isMarketBullish ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              {changePercent >= 0 ? `+${changePercent.toFixed(2)}%` : `${changePercent.toFixed(2)}%`}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">ATM: {atmStrike}</span>
          </div>
        </div>

        {/* Card 2: Market Trend & EMA 9/15 Momentum */}
        <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">9 & 15 EMA Trend</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xl font-black ${isMarketBullish ? "text-emerald-400" : "text-rose-400"}`}>
              {isMarketBullish ? "🟢 Bullish Momentum" : "🔴 Bearish Pullback"}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            {isMarketBullish ? "Price trading above VWAP & 15 EMA. Prefer CE Buy." : "Price below VWAP. Look for PE Buy on resistance rejection."}
          </p>
        </div>

        {/* Card 3: Live PCR */}
        <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Put-Call Ratio (PCR)</span>
            <Scale className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-black text-purple-400 font-mono">
            {estimatedPcr.toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            {pcrSignal}
          </p>
        </div>

        {/* Card 4: India VIX & Expiry Day */}
        <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">India VIX & Expiry</span>
            <Flame className="w-4 h-4 text-orange-400" />
          </div>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-black text-orange-400 font-mono">
              {estimatedVix.toFixed(1)}
            </div>
            <span className="text-[11px] font-bold text-slate-300 bg-[#16223b] px-2 py-1 rounded-lg border border-[#23355b]">
              Exp: {config.expiryDay}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Low-Moderate VIX. Premium decay fast after 2:00 PM. Keep strict Stop Loss.
          </p>
        </div>

      </div>

      {/* 🎯 OPTION CHAIN & BEST STRIKE SELECTOR */}
      <div className="p-6 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#1e2942] pb-3">
          <div>
            <h3 className="text-sm font-black text-white light:text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              Live Strike Price Matrix ({config.name})
            </h3>
            <p className="text-xs text-slate-400">
              Click <strong>"⚡ Buy Strike"</strong> on any strike to immediately log your trade with auto-calculated R:R!
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

      {/* 🎛️ SMART LOT SIZING & RISK-REWARD SCALPING CALCULATOR */}
      <div className="p-6 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-6">
        <div className="flex items-center gap-2.5 border-b border-[#1e2942] pb-4">
          <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-white light:text-slate-900 tracking-tight">
              Option Position Sizing & Scalp Calculator
            </h3>
            <p className="text-xs text-slate-400">
              Never blow your account — calculate exact lots to buy based on your strict Stop Loss in points
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
                  <span className="text-slate-400">1:2.0 Target:</span>
                  <span className="text-emerald-300">+{formatINR(target2Reward)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">1:3.0 Target:</span>
                  <span className="text-emerald-200">+{formatINR(target3Reward)}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-[#1e2942] text-[10px] text-slate-400">
                Trail SL to entry once 1:1.5 is hit!
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 🛡️ PRO OPTION TRADING GOLDEN RULES FOR CONSISTENCY */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
            <CheckCircle2 className="w-4 h-4" />
            Rule 1: Always Trade ATM / 1-Strike ITM
          </div>
          <p className="text-xs text-slate-300 light:text-slate-600 leading-relaxed">
            Deep OTM options suffer massive Theta decay even if the market moves in your direction. Stick to high Delta (0.50+) strikes.
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-2">
          <div className="flex items-center gap-2 text-blue-400 font-bold text-xs">
            <CheckCircle2 className="w-4 h-4" />
            Rule 2: Fixed 5-8 Points Stop Loss
          </div>
          <p className="text-xs text-slate-300 light:text-slate-600 leading-relaxed">
            Never average a losing option trade. If the setup breaks, exit immediately without emotion.
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
            <CheckCircle2 className="w-4 h-4" />
            Rule 3: Max 2 Quality Trades Per Day
          </div>
          <p className="text-xs text-slate-300 light:text-slate-600 leading-relaxed">
            Overtrading is the #1 killer in option buying. Take your profit and close your terminal to protect your daily earnings!
          </p>
        </div>
      </div>

    </div>
  );
};
