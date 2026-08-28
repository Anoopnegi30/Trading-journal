import React, { useState, useRef } from 'react';
import { useTradeContext } from '../../context/TradeContext';
import { MarketType, TradeDuration, TradeDirection, TradeOutcome, EmotionType } from '../../types/trade';
import { formatINR } from '../../utils/calculations';
import {
  X,
  RotateCcw,
  Save,
  Info,
  Brain,
  UploadCloud,
  Check,
  Search,
  Trash2
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
  
  // Rules Followed (Search & Select)
  const [ruleSearch, setRuleSearch] = useState('');
  const [isRuleDropdownOpen, setIsRuleDropdownOpen] = useState(false);
  const [selectedRules, setSelectedRules] = useState<string[]>([
    '5-10 points SL in nifty',
    'stop loss trailing'
  ]);

  // Screenshot Upload State
  const [uploadedScreenshot, setUploadedScreenshot] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Psychology Form state (Image 4 exact match)
  const [entryConfidence, setEntryConfidence] = useState<number>(5); // 1-10
  const [satisfactionRating, setSatisfactionRating] = useState<number>(5); // 1-10
  const [emotionalState, setEmotionalState] = useState<string>('Disciplined Execution');
  const [selectedMistakes, setSelectedMistakes] = useState<string[]>([]);
  const [lessonLearned, setLessonLearned] = useState('');

  if (!isNewTradeModalOpen) return null;

  // Available rules matching screenshot 2
  const predefinedRules = [
    'avoid trading after 3 winning strik',
    'book partial quantity on TP',
    'fixed quantity ( 600 quantity in nifty )',
    '5-10 points SL in nifty',
    'Maximum 2 trade in a day',
    'stop loss trailing'
  ];

  // Mistakes list matching screenshot 4
  const allMistakes = [
    'Overtrading',
    'Revenge Trading',
    'Risked Too Much',
    'Exited Too Early',
    'Exited Too Late',
    'FOMO Entry',
    'Ignored Signals',
    'No Clear Plan',
    'Ignored Stop Loss',
    'No Mistakes',
    'greed',
    'against trend',
    'heavy quantity'
  ];

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

  let computedRr = '1:2.0';
  if (numEntry > 0 && Number(stopLoss) > 0 && Number(target) > 0) {
    const risk = Math.abs(numEntry - Number(stopLoss));
    const reward = Math.abs(Number(target) - numEntry);
    if (risk > 0) {
      computedRr = `1:${(reward / risk).toFixed(2)}`;
    }
  }

  const toggleMistake = (m: string) => {
    if (m === 'No Mistakes') {
      setSelectedMistakes(prev => prev.includes('No Mistakes') ? [] : ['No Mistakes']);
      return;
    }
    setSelectedMistakes(prev => {
      const filtered = prev.filter(x => x !== 'No Mistakes');
      return filtered.includes(m) ? filtered.filter(x => x !== m) : [...filtered, m];
    });
  };

  const toggleRule = (r: string) => {
    setSelectedRules(prev => 
      prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]
    );
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedScreenshot(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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
    setUploadedScreenshot(null);
    setIsNoTradeDay(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isNoTradeDay) {
      addTrade({
        date,
        time: '09:15',
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
        notes: analysis || 'Disciplined No-Trade Day recorded.',
        analysis: analysis || 'Markets lacked edge. Capital protected.'
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
      time: '10:00',
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
      outcome: netPnl >= 0 ? outcome : (selectedMistakes.length > 0 && !selectedMistakes.includes('No Mistakes') ? 'Mistake' : 'Loss'),
      isNoTradeDay: false,
      emotion: (emotionalState.includes('FOMO') ? 'FOMO' : emotionalState.includes('Greed') ? 'Greed' : emotionalState.includes('Revenge') ? 'Revenge' : 'Disciplined') as EmotionType,
      confidence: entryConfidence * 10,
      mistakes: selectedMistakes.filter(m => m !== 'No Mistakes'),
      followedPlan: selectedRules.length > 0,
      followedRisk: true,
      analysis,
      notes: analysis,
      chartImage: uploadedScreenshot || undefined,
      lessonLearned
    });

    setIsNewTradeModalOpen(false);
    handleReset();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 rounded-3xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[95vh] overflow-y-auto">
        
        {/* Modal Header matching screenshots */}
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
            {/* "No Trade Day" toggle */}
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
          {/* ===================== GENERAL TAB ===================== */}
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
                        : 'bg-[#16223b] light:bg-slate-100 text-slate-400 hover:text-slate-200 border border-[#23355b]'
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
                        : 'bg-[#16223b] light:bg-slate-100 text-slate-400 hover:text-slate-200 border border-[#23355b]'
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
                    className="w-full bg-[#16223b] light:bg-slate-100 border border-[#23355b] light:border-slate-300 rounded-xl px-3 py-2 text-slate-200 light:text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full bg-[#16223b] light:bg-slate-100 border border-[#23355b] light:border-slate-300 rounded-xl px-3 py-2 text-slate-200 light:text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full bg-[#16223b] light:bg-slate-100 border border-[#23355b] light:border-slate-300 rounded-xl px-3 py-2 text-slate-200 light:text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full bg-[#16223b] light:bg-slate-100 border border-[#23355b] light:border-slate-300 rounded-xl px-3 py-2 text-slate-200 light:text-slate-900 font-mono focus:outline-none"
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
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'bg-[#16223b] light:bg-slate-100 text-slate-400 border border-[#23355b]'
                      }`}
                    >
                      ↑ Long
                    </button>
                    <button
                      type="button"
                      onClick={() => setDirection('Short')}
                      className={`flex-1 py-2 rounded-xl font-bold flex items-center justify-center gap-1 ${
                        direction === 'Short'
                          ? 'bg-rose-600 text-white shadow-md'
                          : 'bg-[#16223b] light:bg-slate-100 text-slate-400 border border-[#23355b]'
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
                    className="w-full bg-[#16223b] light:bg-slate-100 border border-[#23355b] rounded-xl px-3 py-2 text-slate-200 font-mono focus:outline-none"
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
                    className="w-full bg-[#16223b] light:bg-slate-100 border border-[#23355b] rounded-xl px-3 py-2 text-slate-200 font-mono focus:outline-none"
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
                    className="w-full bg-[#16223b] light:bg-slate-100 border border-[#23355b] rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
                  >
                    <option value="Breakout">Breakout</option>
                    <option value="Reversal">Reversal</option>
                    <option value="Pullback">Pullback</option>
                    <option value="News-based">News-based</option>
                    <option value="Trend">Trend</option>
                    <option value="Fibonacci retracement">Fibonacci retracement</option>
                    <option value="9&15 Ema">9&15 Ema</option>
                    <option value="Other">Other</option>
                    <option value="9&15 Ema">9&15 Ema</option>
                    <option value="Pullback">Pullback</option>
                    <option value="Support & Resistance">Support & Resistance</option>
                    <option value="Scalping">Scalping</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 light:text-slate-700 mb-1">
                    Outcome Summary <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={outcome}
                    onChange={(e) => setOutcome(e.target.value as TradeOutcome)}
                    className="w-full bg-[#16223b] light:bg-slate-100 border border-[#23355b] rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
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
                  rows={2}
                  placeholder="Why did you take this trade? What was your analysis?"
                  value={analysis}
                  onChange={(e) => setAnalysis(e.target.value)}
                  className="w-full bg-[#16223b] light:bg-slate-100 border border-[#23355b] rounded-xl p-3 text-slate-200 focus:outline-none"
                />
              </div>

              {/* Rules Followed (Search or Add Rules Dropdown matching screenshot 2) */}
              <div className="relative">
                <label className="block text-[11px] font-bold text-slate-300 light:text-slate-700 mb-1">
                  Rules Followed
                </label>
                
                <div
                  onClick={() => setIsRuleDropdownOpen(!isRuleDropdownOpen)}
                  className="w-full bg-[#16223b] light:bg-slate-100 border border-[#23355b] rounded-xl p-2.5 cursor-pointer flex flex-wrap items-center gap-1.5 min-h-[42px]"
                >
                  {selectedRules.length === 0 && (
                    <span className="text-slate-500 text-xs">Search or add rules...</span>
                  )}
                  {selectedRules.map(r => (
                    <span
                      key={r}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleRule(r);
                      }}
                    >
                      {r}
                      <span className="text-blue-400 hover:text-rose-400 font-bold ml-1">✕</span>
                    </span>
                  ))}
                </div>

                {isRuleDropdownOpen && (
                  <div className="absolute z-30 w-full mt-1 rounded-2xl bg-[#111a2e] border border-[#1e2942] shadow-2xl p-2 space-y-1">
                    <input
                      type="text"
                      placeholder="Type rule to filter..."
                      value={ruleSearch}
                      onChange={(e) => setRuleSearch(e.target.value)}
                      className="w-full bg-[#16223b] text-xs px-3 py-1.5 rounded-lg border border-[#23355b] text-white focus:outline-none mb-1"
                    />
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {predefinedRules
                        .filter(r => r.toLowerCase().includes(ruleSearch.toLowerCase()))
                        .map(r => {
                          const isSel = selectedRules.includes(r);
                          return (
                            <div
                              key={r}
                              onClick={() => toggleRule(r)}
                              className={`px-3 py-2 rounded-xl text-xs flex items-center justify-between cursor-pointer transition-colors ${
                                isSel ? 'bg-blue-600/30 text-blue-300' : 'hover:bg-[#16223b] text-slate-300'
                              }`}
                            >
                              <span>{r}</span>
                              {isSel && <Check className="w-3.5 h-3.5 text-blue-400" />}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>

              {/* Trade Screenshots Drag & Drop Zone matching screenshot 3 */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 light:text-slate-700 mb-1">
                  Trade Screenshots
                </label>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  accept="image/png, image/jpeg, image/jpg"
                  className="hidden"
                />

                {uploadedScreenshot ? (
                  <div className="relative rounded-2xl overflow-hidden border border-emerald-500/40 p-2 bg-[#0d1527] flex items-center gap-3">
                    <img
                      src={uploadedScreenshot}
                      alt="Trade Chart Screenshot"
                      className="w-20 h-16 object-cover rounded-xl border border-slate-700"
                    />
                    <div className="flex-1">
                      <p className="font-bold text-white text-xs">Trade Screenshot Attached</p>
                      <p className="text-[10px] text-emerald-400">Ready to save with trade record</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setUploadedScreenshot(null)}
                      className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-[#23355b] hover:border-blue-500 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-[#131d35]/40 hover:bg-[#16223b]"
                  >
                    <UploadCloud className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <p className="font-bold text-xs text-white light:text-slate-800">
                      Drag & drop your trade screenshots here
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Supports JPG, PNG (Max 5MB each)
                    </p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ===================== PSYCHOLOGY TAB (Image 4 exact match) ===================== */}
          {activeSubTab === 'psychology' && (
            <div className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Left Column: Sliders & Emotional state */}
                <div className="space-y-4">
                  {/* Entry Confidence Level (1-10) */}
                  <div className="p-3.5 rounded-2xl bg-[#16223b] light:bg-slate-50 border border-[#23355b]">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-slate-300 light:text-slate-800">
                        Entry Confidence Level (1-10)
                      </span>
                      <span className="text-blue-400 font-black text-sm">{entryConfidence}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={entryConfidence}
                      onChange={(e) => setEntryConfidence(Number(e.target.value))}
                      className="w-full accent-blue-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                      <span>Low</span>
                      <span>Medium</span>
                      <span>High</span>
                    </div>
                  </div>

                  {/* Satisfaction Rating (1-10) */}
                  <div className="p-3.5 rounded-2xl bg-[#16223b] light:bg-slate-50 border border-[#23355b]">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-slate-300 light:text-slate-800">
                        Satisfaction Rating (1-10)
                      </span>
                      <span className="text-blue-400 font-black text-sm">{satisfactionRating}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={satisfactionRating}
                      onChange={(e) => setSatisfactionRating(Number(e.target.value))}
                      className="w-full accent-blue-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                      <span>Not Satisfied</span>
                      <span>Average</span>
                      <span>Satisfied</span>
                    </div>
                  </div>

                  {/* Emotional State During Trade * */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 light:text-slate-700 mb-1">
                      Emotional State During Trade <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={emotionalState}
                      onChange={(e) => setEmotionalState(e.target.value)}
                      className="w-full bg-[#16223b] light:bg-slate-100 border border-[#23355b] rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
                    >
                      <option value="Disciplined Execution">Disciplined Execution</option>
                      <option value="Calm & Relaxed">Calm & Relaxed</option>
                      <option value="Confident & Focused">Confident & Focused</option>
                      <option value="FOMO Entry">FOMO Entry</option>
                      <option value="Greed / Chasing Move">Greed / Chasing Move</option>
                      <option value="Revenge / Angry">Revenge / Angry</option>
                      <option value="Anxious & Hesitant">Anxious & Hesitant</option>
                    </select>
                  </div>
                </div>

                {/* Right Column: Mistakes Made Checklist (Image 4 exact match) */}
                <div className="p-3.5 rounded-2xl bg-[#16223b] light:bg-slate-50 border border-[#23355b]">
                  <label className="block text-[11px] font-bold text-slate-300 light:text-slate-700 mb-2">
                    Mistakes Made
                  </label>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {allMistakes.map(m => {
                      const isChecked = selectedMistakes.includes(m);
                      return (
                        <label
                          key={m}
                          onClick={() => toggleMistake(m)}
                          className={`flex items-center gap-2 p-2 rounded-xl border transition-all cursor-pointer ${
                            isChecked
                              ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                              : 'bg-[#0d1527] light:bg-white border-[#1e2942] text-slate-300 hover:border-slate-600'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="rounded accent-rose-500"
                          />
                          <span className="text-[11px] font-medium truncate">{m}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Bottom: Lessons Learned Textarea (Image 4 exact match) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 light:text-slate-700 mb-1">
                  Lessons Learned
                </label>
                <textarea
                  rows={2}
                  placeholder="What did you learn from this trade?"
                  value={lessonLearned}
                  onChange={(e) => setLessonLearned(e.target.value)}
                  className="w-full bg-[#16223b] light:bg-slate-100 border border-[#23355b] rounded-xl p-3 text-slate-200 focus:outline-none"
                />
              </div>

            </div>
          )}

          {/* Modal Footer */}
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
