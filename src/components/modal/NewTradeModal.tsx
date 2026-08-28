import React, { useState } from 'react';
import { useTradeContext } from '../../context/TradeContext';
import { MarketType, TradeDuration, TradeDirection, TradeOutcome, EmotionType } from '../../types/trade';
import { formatINR } from '../../utils/calculations';
import {
  X,
  RotateCcw,
  Save,
  Info,
  Brain,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Check
} from 'lucide-react';

export const NewTradeModal: React.FC = () => {
  const { isNewTradeModalOpen, setIsNewTradeModalOpen, addTrade } = useTradeContext();

  const [activeSubTab, setActiveSubTab] = useState<'general' | 'psychology'>('general');
  const [isNoTradeDay, setIsNoTradeDay] = useState(false);

  // General Form state
  const [duration, setDuration] = useState<TradeDuration>('Intraday');
  const [marketType, setMarketType] = useState<MarketType>('Indian');
  const [symbol, setSymbol] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState('09:30');
  const [direction, setDirection] = useState<TradeDirection>('Long');
  const [entryPrice, setEntryPrice] = useState<number | ''>('');
  const [exitPrice, setExitPrice] = useState<number | ''>('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [stopLoss, setStopLoss] = useState<number | ''>('');
  const [target, setTarget] = useState<number | ''>('');
  const [fees, setFees] = useState<number | ''>(20);
  const [strategy, setStrategy] = useState('Breakout');
  const [outcome, setOutcome] = useState<TradeOutcome>('Full Success');
  const [analysis, setAnalysis] = useState('');

  // Psychology Form state
  const [emotion, setEmotion] = useState<EmotionType>('Disciplined');
  const [confidence, setConfidence] = useState<number>(85);
  const [selectedMistakes, setSelectedMistakes] = useState<string[]>([]);
  const [followedPlan, setFollowedPlan] = useState(true);
  const [followedRisk, setFollowedRisk] = useState(true);
  const [lessonLearned, setLessonLearned] = useState('');

  if (!isNewTradeModalOpen) return null;

  // Auto computations
  const numEntry = Number(entryPrice) || 0;
  const numExit = Number(exitPrice) || 0;
  const numQty = Number(quantity) || 0;
  const numFees = Number(fees) || 0;
  const totalAmount = numEntry * numQty;

  let grossPnl = 0;
  if (numEntry > 0 && numExit > 0 && numQty > 0) {
    if (direction === 'Long') {
      grossPnl = (numExit - numEntry) * numQty;
    } else {
      grossPnl = (numEntry - numExit) * numQty;
    }
  }
  const netPnl = grossPnl - numFees;
  const pnlPercent = totalAmount > 0 ? Number(((grossPnl / totalAmount) * 100).toFixed(2)) : 0;

  // Risk:Reward computation
  let computedRr = '1:2.0';
  if (numEntry > 0 && Number(stopLoss) > 0 && Number(target) > 0) {
    const risk = Math.abs(numEntry - Number(stopLoss));
    const reward = Math.abs(Number(target) - numEntry);
    if (risk > 0) {
      computedRr = `1:${(reward / risk).toFixed(2)}`;
    }
  }

  const commonMistakesList = [
    'FOMO Entry',
    'Exited Too Early',
    'greed',
    'No Clear Plan',
    'Overleveraged',
    'Averaging Down',
    'Revenge Trading',
    'Traded Lunch Chop',
    'Ignored Stop Loss'
  ];

  const toggleMistake = (m: string) => {
    setSelectedMistakes(prev => 
      prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]
    );
  };

  const handleReset = () => {
    setSymbol('');
    setEntryPrice('');
    setExitPrice('');
    setQuantity('');
    setStopLoss('');
    setTarget('');
    setAnalysis('');
    setSelectedMistakes([]);
    setLessonLearned('');
    setIsNoTradeDay(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isNoTradeDay) {
      addTrade({
        date,
        time,
        marketType,
        duration: 'Intraday',
        symbol: 'NO_TRADE',
        direction: 'Long',
        entryPrice: 0,
        exitPrice: 0,
        quantity: 0,
        totalAmount: 0,
        pnl: 0,
        fees: 0,
        netPnl: 0,
        pnlPercent: 0,
        riskReward: 'N/A',
        strategy: 'Discipline Rule',
        outcome: 'Full Success',
        isNoTradeDay: true,
        emotion: 'Disciplined',
        confidence: 100,
        mistakes: [],
        followedPlan: true,
        followedRisk: true,
        notes: analysis || 'Disciplined No-Trade Day maintained.',
        analysis: analysis || 'Markets lacked edge. Capital preserved.'
      });
      setIsNewTradeModalOpen(false);
      handleReset();
      return;
    }

    if (!symbol.trim()) {
      alert('Please enter a trading symbol');
      return;
    }

    addTrade({
      date,
      time,
      marketType,
      duration,
      symbol: symbol.toUpperCase().trim(),
      direction,
      entryPrice: numEntry,
      exitPrice: numExit,
      quantity: numQty,
      totalAmount,
      stopLoss: Number(stopLoss) || undefined,
      target: Number(target) || undefined,
      pnl: grossPnl,
      fees: numFees,
      netPnl,
      pnlPercent,
      riskReward: computedRr,
      strategy,
      outcome: netPnl >= 0 ? outcome : (selectedMistakes.length > 0 ? 'Mistake' : 'Loss'),
      isNoTradeDay: false,
      emotion,
      confidence,
      mistakes: selectedMistakes,
      followedPlan,
      followedRisk,
      analysis,
      notes: analysis,
      lessonLearned
    });

    setIsNewTradeModalOpen(false);
    handleReset();
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 rounded-3xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[95vh] overflow-y-auto">
        
        {/* Modal Header matching screenshot 5 */}
        <div className="flex items-center justify-between border-b border-[#1e2942] light:border-slate-100 pb-3">
          <div>
            <h2 className="text-lg font-black text-white light:text-slate-900 tracking-tight">
              Trade Journal
            </h2>
            <p className="text-xs text-slate-400">
              Capture setup, execution, and psychology in one flow
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* "No Trade Day" toggle switch */}
            <div className="flex items-center gap-2 bg-[#16223b] light:bg-slate-100 px-3 py-1.5 rounded-xl border border-[#23355b] light:border-slate-200">
              <span className="text-xs font-semibold text-slate-300 light:text-slate-700">
                No Trade Day
              </span>
              <button
                type="button"
                onClick={() => setIsNoTradeDay(!isNoTradeDay)}
                className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                  isNoTradeDay ? 'bg-blue-600' : 'bg-slate-700 light:bg-slate-300'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    isNoTradeDay ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <button
              onClick={() => setIsNewTradeModalOpen(false)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white light:hover:text-slate-900 bg-[#16223b] light:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tabs: General vs Psychology */}
        <div className="flex border-b border-[#1e2942] light:border-slate-200">
          <button
            type="button"
            onClick={() => setActiveSubTab('general')}
            className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeSubTab === 'general'
                ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Info className="w-4 h-4" />
            General
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('psychology')}
            className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
              activeSubTab === 'psychology'
                ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Brain className="w-4 h-4" />
            Psychology
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ----------------- GENERAL TAB ----------------- */}
          {activeSubTab === 'general' && (
            <div className="space-y-4 text-xs">
              
              {/* Trade Duration Toggle */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1.5">
                  Trade Duration <span className="text-slate-500 font-normal">Select whether this is an intraday or swing trade</span>
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setDuration('Intraday')}
                    className={`flex-1 py-2 px-4 rounded-xl font-bold transition-all ${
                      duration === 'Intraday'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'bg-[#16223b] light:bg-slate-100 text-slate-400 hover:text-slate-200 border border-[#23355b] light:border-slate-200'
                    }`}
                  >
                    ⏱️ Intraday
                  </button>
                  <button
                    type="button"
                    onClick={() => setDuration('Swing')}
                    className={`flex-1 py-2 px-4 rounded-xl font-bold transition-all ${
                      duration === 'Swing'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'bg-[#16223b] light:bg-slate-100 text-slate-400 hover:text-slate-200 border border-[#23355b] light:border-slate-200'
                    }`}
                  >
                    📅 Swing
                  </button>
                </div>
              </div>

              {/* Row 1: Market Type, Symbol, Entry Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 light:text-slate-700 mb-1">
                    Market type <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={marketType}
                    onChange={(e) => setMarketType(e.target.value as MarketType)}
                    className="w-full bg-[#16223b] light:bg-slate-100 border border-[#23355b] light:border-slate-300 rounded-xl px-3 py-2 text-slate-200 light:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Indian">Indian</option>
                    <option value="Crypto">Crypto</option>
                    <option value="Forex">Forex</option>
                    <option value="US Stocks">US Stocks</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 light:text-slate-700 mb-1">
                    Symbol <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required={!isNoTradeDay}
                    placeholder="RELIANCE, NIFTY 50, etc."
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    className="w-full bg-[#16223b] light:bg-slate-100 border border-[#23355b] light:border-slate-300 rounded-xl px-3 py-2 text-slate-200 light:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 light:text-slate-700 mb-1">
                    Entry Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-[#16223b] light:bg-slate-100 border border-[#23355b] light:border-slate-300 rounded-xl px-3 py-2 text-slate-200 light:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Row 2: Entry Price, Quantity, Total Amount, Exit Price */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 light:text-slate-700 mb-1">
                    Entry Price (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="Entry Price"
                    value={entryPrice}
                    onChange={(e) => setEntryPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-[#16223b] light:bg-slate-100 border border-[#23355b] light:border-slate-300 rounded-xl px-3 py-2 text-slate-200 light:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 light:text-slate-700 mb-1">
                    Quantity <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="Quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-[#16223b] light:bg-slate-100 border border-[#23355b] light:border-slate-300 rounded-xl px-3 py-2 text-slate-200 light:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 light:text-slate-700 mb-1">
                    Total amount (₹)
                  </label>
                  <input
                    type="text"
                    readOnly
                    disabled
                    value={totalAmount > 0 ? `₹${totalAmount.toLocaleString('en-IN')}` : 'Amount'}
                    className="w-full bg-[#0d1527] light:bg-slate-200 border border-[#1e2942] light:border-slate-300 rounded-xl px-3 py-2 text-slate-400 light:text-slate-600 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 light:text-slate-700 mb-1">
                    Exit Price (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="Exit Price"
                    value={exitPrice}
                    onChange={(e) => setExitPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-[#16223b] light:bg-slate-100 border border-[#23355b] light:border-slate-300 rounded-xl px-3 py-2 text-slate-200 light:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              {/* Row 3: P&L Amount, Fees, Direction, Stop Loss, Target */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 light:text-slate-700 mb-1">
                    P&L Amount (₹)
                  </label>
                  <div className={`w-full py-2 px-3 rounded-xl border font-mono font-bold ${
                    netPnl > 0
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : netPnl < 0
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                      : 'bg-[#16223b] border-[#23355b] text-slate-400'
                  }`}>
                    {formatINR(netPnl)}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 light:text-slate-700 mb-1">
                    Fees (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="Fees & charges"
                    value={fees}
                    onChange={(e) => setFees(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-[#16223b] light:bg-slate-100 border border-[#23355b] light:border-slate-300 rounded-xl px-3 py-2 text-slate-200 light:text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 light:text-slate-700 mb-1">
                    Direction <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setDirection('Long')}
                      className={`flex-1 py-2 rounded-xl font-bold flex items-center justify-center gap-1 ${
                        direction === 'Long'
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                          : 'bg-[#16223b] light:bg-slate-100 text-slate-400 border border-[#23355b] light:border-slate-200'
                      }`}
                    >
                      ↑ Long
                    </button>
                    <button
                      type="button"
                      onClick={() => setDirection('Short')}
                      className={`flex-1 py-2 rounded-xl font-bold flex items-center justify-center gap-1 ${
                        direction === 'Short'
                          ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                          : 'bg-[#16223b] light:bg-slate-100 text-slate-400 border border-[#23355b] light:border-slate-200'
                      }`}
                    >
                      ↓ Short
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 light:text-slate-700 mb-1">
                    Stop Loss (₹)
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="Stop Loss"
                    value={stopLoss}
                    onChange={(e) => setStopLoss(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-[#16223b] light:bg-slate-100 border border-[#23355b] light:border-slate-300 rounded-xl px-3 py-2 text-slate-200 light:text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 light:text-slate-700 mb-1">
                    Target (₹)
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="Target"
                    value={target}
                    onChange={(e) => setTarget(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-[#16223b] light:bg-slate-100 border border-[#23355b] light:border-slate-300 rounded-xl px-3 py-2 text-slate-200 light:text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Row 4: Strategy & Outcome Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 light:text-slate-700 mb-1">
                    Strategy <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={strategy}
                    onChange={(e) => setStrategy(e.target.value)}
                    className="w-full bg-[#16223b] light:bg-slate-100 border border-[#23355b] light:border-slate-300 rounded-xl px-3 py-2 text-slate-200 light:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Breakout">Breakout</option>
                    <option value="9&15 Ema">9&15 Ema</option>
                    <option value="Pullback">Pullback</option>
                    <option value="Support & Resistance">Support & Resistance</option>
                    <option value="Scalping">Scalping</option>
                    <option value="Mean Reversion">Mean Reversion</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 light:text-slate-700 mb-1">
                    Outcome Summary <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={outcome}
                    onChange={(e) => setOutcome(e.target.value as TradeOutcome)}
                    className="w-full bg-[#16223b] light:bg-slate-100 border border-[#23355b] light:border-slate-300 rounded-xl px-3 py-2 text-slate-200 light:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Full Success">Full Success</option>
                    <option value="Partial Success">Partial Success</option>
                    <option value="Loss">Loss</option>
                    <option value="Mistake">Mistake</option>
                    <option value="Breakeven">Breakeven</option>
                  </select>
                </div>
              </div>

              {/* Trade Analysis */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 light:text-slate-700 mb-1">
                  Trade Analysis
                </label>
                <textarea
                  rows={3}
                  placeholder="Why did you take this trade? What was your technical setup and trigger?"
                  value={analysis}
                  onChange={(e) => setAnalysis(e.target.value)}
                  className="w-full bg-[#16223b] light:bg-slate-100 border border-[#23355b] light:border-slate-300 rounded-xl p-3 text-slate-200 light:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

            </div>
          )}

          {/* ----------------- PSYCHOLOGY TAB ----------------- */}
          {activeSubTab === 'psychology' && (
            <div className="space-y-4 text-xs">
              
              {/* Emotion Selection */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 light:text-slate-700 mb-2">
                  Pre-Trade Emotional State
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['Disciplined', 'Calm', 'Confident', 'FOMO', 'Greed', 'Revenge', 'Anxious', 'Impatient'] as EmotionType[]).map(e => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setEmotion(e)}
                      className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                        emotion === e
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-[#16223b] light:bg-slate-100 text-slate-400 hover:text-slate-200 border border-[#23355b] light:border-slate-200'
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              {/* Confidence Rating Slider */}
              <div className="p-3.5 rounded-2xl bg-[#16223b] light:bg-slate-50 border border-[#23355b] light:border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-300 light:text-slate-700">
                    Execution Confidence Rating
                  </span>
                  <span className="text-emerald-400 font-bold text-sm">{confidence}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={confidence}
                  onChange={(e) => setConfidence(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>Hesitant / Low</span>
                  <span>Average</span>
                  <span>Rock Solid / High</span>
                </div>
              </div>

              {/* Mistakes Tagging */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 light:text-slate-700 mb-2">
                  Tag Any Psychological or Execution Mistakes
                </label>
                <div className="flex flex-wrap gap-2">
                  {commonMistakesList.map(m => {
                    const isSelected = selectedMistakes.includes(m);
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => toggleMistake(m)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                          isSelected
                            ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                            : 'bg-[#16223b] light:bg-slate-100 text-slate-400 hover:text-slate-200 border border-[#23355b] light:border-slate-200'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        {m}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Discipline Checks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <label className="flex items-center gap-2 p-3 rounded-xl bg-[#16223b] light:bg-slate-50 border border-[#23355b] light:border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={followedPlan}
                    onChange={(e) => setFollowedPlan(e.target.checked)}
                    className="rounded accent-blue-500"
                  />
                  <span className="text-slate-300 light:text-slate-700 font-medium">
                    Followed Setup Rules & Entry Plan
                  </span>
                </label>

                <label className="flex items-center gap-2 p-3 rounded-xl bg-[#16223b] light:bg-slate-50 border border-[#23355b] light:border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={followedRisk}
                    onChange={(e) => setFollowedRisk(e.target.checked)}
                    className="rounded accent-blue-500"
                  />
                  <span className="text-slate-300 light:text-slate-700 font-medium">
                    Kept Max Risk Within Defined Limits
                  </span>
                </label>
              </div>

              {/* Lessons Learned */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 light:text-slate-700 mb-1">
                  Key Lesson / Post-Trade Takeaway
                </label>
                <input
                  type="text"
                  placeholder="What will you do differently next time to improve?"
                  value={lessonLearned}
                  onChange={(e) => setLessonLearned(e.target.value)}
                  className="w-full bg-[#16223b] light:bg-slate-100 border border-[#23355b] light:border-slate-300 rounded-xl px-3 py-2 text-slate-200 light:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

            </div>
          )}

          {/* Modal Footer matching screenshot 5 */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1e2942] light:border-slate-100">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-slate-400 hover:text-white light:hover:text-slate-900 bg-[#16223b] light:bg-slate-100 text-xs font-semibold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>

            <button
              type="submit"
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all transform active:scale-95"
            >
              <Save className="w-4 h-4" />
              Save Trade
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
