import React, { useState } from 'react';
import { useTradeContext } from '../../context/TradeContext';
import { 
  MarketType, 
  TradeDuration, 
  TradeDirection, 
  TradeOutcome, 
  EmotionType,
  TradeType 
} from '../../types/trade';
import { formatINR } from '../../utils/calculations';
import { 
  X, 
  Upload, 
  Brain, 
  Sliders, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck,
  Search,
  Plus,
  HelpCircle,
  ShoppingBag,
  Zap
} from 'lucide-react';

export const NewTradeModal: React.FC = () => {
  const { isNewTradeModalOpen, setIsNewTradeModalOpen, addTrade, rules } = useTradeContext();
  
  // Navigation tabs in modal
  const [activeSubTab, setActiveSubTab] = useState<'general' | 'psychology'>('general');
  const [isNoTradeDay, setIsNoTradeDay] = useState(false);

  // General Tab State
  const [marketType, setMarketType] = useState<MarketType>('Indian');
  const [duration, setDuration] = useState<TradeDuration>('Intraday');
  const [tradeType, setTradeType] = useState<TradeType>('Option Buying');
  const [symbol, setSymbol] = useState('NIFTY 50');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [direction, setDirection] = useState<TradeDirection>('Short');
  const [entryPrice, setEntryPrice] = useState<number | ''>(110);
  const [exitPrice, setExitPrice] = useState<number | ''>(120);
  const [quantity, setQuantity] = useState<number | ''>(65);
  const [fees, setFees] = useState<number | ''>(20);
  const [stopLoss, setStopLoss] = useState<number | ''>('');
  const [target, setTarget] = useState<number | ''>('');
  const [strategy, setStrategy] = useState('Breakout');
  const [outcome, setOutcome] = useState<TradeOutcome>('Full Success');
  const [analysis, setAnalysis] = useState('');
  const [selectedRules, setSelectedRules] = useState<string[]>([
    '5-10 points SL in nifty',
    'stop loss trailing'
  ]);
  const [ruleSearchQuery, setRuleSearchQuery] = useState('');
  const [showRuleDropdown, setShowRuleDropdown] = useState(false);
  const [uploadedScreenshot, setUploadedScreenshot] = useState<string | null>(null);

  // Psychology Tab State (Exact match to screenshot 4)
  const [entryConfidence, setEntryConfidence] = useState<number>(5); // 1-10 slider
  const [satisfactionRating, setSatisfactionRating] = useState<number>(5); // 1-10 slider
  const [emotionalState, setEmotionalState] = useState<string>('Select emotional state');
  const [selectedMistakes, setSelectedMistakes] = useState<string[]>([]);
  const [lessonLearned, setLessonLearned] = useState('');

  // Rules list for search dropdown
  const allAvailableRules = [
    'avoid trading after 3 winning strik',
    'book partial quantity on TP',
    'fixed quantity ( 600 quantity in nifty )',
    '5-10 points SL in nifty',
    'Maximum 2 trade in a day',
    'stop loss trailing',
    'Wait for 15-min candle close',
    'Never risk > 2% per trade'
  ];

  // Mistakes list matching screenshots
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

  // P&L calculation:
  // In Option Buying (CE or PE): Entry is buy premium, Exit is sell premium.
  // When premium badhta hai (exit > entry), it's ALWAYS a profit!
  let grossPnl = 0;
  if (numEntry > 0 && numExit > 0 && numQty > 0) {
    if (tradeType === 'Option Buying') {
      grossPnl = (numExit - numEntry) * numQty;
    } else {
      // Option Selling / Futures Shorting
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
    setSymbol('NIFTY 50');
    setEntryPrice('');
    setExitPrice('');
    setQuantity('');
    setFees(20);
    setStopLoss('');
    setTarget('');
    setAnalysis('');
    setSelectedRules([]);
    setEntryConfidence(5);
    setSatisfactionRating(5);
    setEmotionalState('Select emotional state');
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
        tradeType,
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
      tradeType,
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

  if (!isNewTradeModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 rounded-3xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[95vh] overflow-y-auto">
        
        {/* Modal Header */}
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
              <span className="text-xs font-semibold text-slate-300 light:text-slate-700">No Trade Day</span>
              <button
                type="button"
                onClick={() => setIsNoTradeDay(!isNoTradeDay)}
                className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                  isNoTradeDay ? 'bg-blue-600' : 'bg-slate-700'
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

        {/* Tab Headers: General vs Psychology */}
        <div className="grid grid-cols-2 gap-2 bg-[#16223b] light:bg-slate-100 p-1 rounded-2xl border border-[#23355b] light:border-slate-200">
          <button
            type="button"
            onClick={() => setActiveSubTab('general')}
            className={`py-2 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              activeSubTab === 'general'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>ℹ️</span>
            General
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('psychology')}
            className={`py-2 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              activeSubTab === 'psychology'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
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
              
              {/* Trade Instrument / Style Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    Trade Instrument Style
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setTradeType('Option Buying')}
                      className={`flex-1 py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                        tradeType === 'Option Buying'
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                          : 'bg-[#16223b] light:bg-slate-100 text-slate-400 hover:text-slate-200 border border-[#23355b]'
                      }`}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      Option Buying (Buy Low, Sell High)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTradeType('Option Selling')}
                      className={`flex-1 py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                        tradeType === 'Option Selling'
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                          : 'bg-[#16223b] light:bg-slate-100 text-slate-400 hover:text-slate-200 border border-[#23355b]'
                      }`}
                    >
                      <Zap className="w-3.5 h-3.5" />
                      Option Selling / Short
                    </button>
                  </div>
                </div>

                {/* Trade Duration Toggle */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">
                    Trade Duration
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
                  <div className={`w-full py-2 px-3 rounded-xl border font-mono font-bold flex items-center justify-between ${
                    netPnl > 0
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : netPnl < 0
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                      : 'bg-[#16223b] border-[#23355b] text-slate-400'
                  }`}>
                    <span>{formatINR(netPnl)}</span>
                    {netPnl > 0 && <span className="text-[10px] bg-emerald-500/20 px-1 rounded">PROFIT</span>}
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
                    Direction (View) <span className="text-rose-500">*</span>
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

              {/* Row 4: Strategy, Outcome */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 light:text-slate-700 mb-1">
                    Strategy <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={strategy}
                    onChange={(e) => setStrategy(e.target.value)}
                    className="w-full bg-[#16223b] light:bg-slate-100 border border-[#23355b] light:border-slate-300 rounded-xl px-3 py-2 text-slate-200 light:text-slate-900 focus:outline-none"
                  >
                    <option value="Breakout">Breakout</option>
                    <option value="Reversal">Reversal</option>
                    <option value="Pullback">Pullback</option>
                    <option value="News-based">News-based</option>
                    <option value="Trend">Trend</option>
                    <option value="Fibonacci retracement">Fibonacci retracement</option>
                    <option value="9&15 Ema">9&15 Ema</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 light:text-slate-700 mb-1">
                    Outcome Summary <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={outcome}
                    onChange={(e) => setOutcome(e.target.value as TradeOutcome)}
                    className="w-full bg-[#16223b] light:bg-slate-100 border border-[#23355b] light:border-slate-300 rounded-xl px-3 py-2 text-slate-200 light:text-slate-900 focus:outline-none"
                  >
                    <option value="Full Success">Full Success</option>
                    <option value="Partial Success">Partial Success</option>
                    <option value="Breakeven">Breakeven</option>
                    <option value="Loss">Loss</option>
                    <option value="Mistake">Mistake</option>
                  </select>
                </div>
              </div>

              {/* Trade Analysis Textarea */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 light:text-slate-700 mb-1">
                  Trade Analysis
                </label>
                <textarea
                  rows={2}
                  placeholder="Why did you take this trade? What was your analysis?"
                  value={analysis}
                  onChange={(e) => setAnalysis(e.target.value)}
                  className="w-full bg-[#16223b] light:bg-slate-100 border border-[#23355b] light:border-slate-300 rounded-xl p-3 text-slate-200 light:text-slate-900 focus:outline-none"
                />
              </div>

              {/* Rules Followed Tag Selector */}
              <div className="space-y-1.5 relative">
                <label className="block text-[11px] font-bold text-slate-300 light:text-slate-700">
                  Rules Followed
                </label>
                
                {/* Selected Rules Badges Container */}
                <div 
                  onClick={() => setShowRuleDropdown(!showRuleDropdown)}
                  className="min-h-[42px] p-2 bg-[#16223b] light:bg-slate-100 border border-[#23355b] light:border-slate-300 rounded-xl flex flex-wrap gap-1.5 items-center cursor-pointer"
                >
                  {selectedRules.length === 0 ? (
                    <span className="text-slate-400 text-xs">Search & select trading rules followed...</span>
                  ) : (
                    selectedRules.map((rule) => (
                      <span
                        key={rule}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-600/30 text-blue-300 border border-blue-500/40 flex items-center gap-1.5"
                      >
                        {rule}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleRule(rule);
                          }}
                          className="hover:text-rose-400 font-bold"
                        >
                          ✕
                        </button>
                      </span>
                    ))
                  )}
                </div>

                {/* Dropdown Menu */}
                {showRuleDropdown && (
                  <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-[#111a2e] border border-[#23355b] rounded-2xl shadow-2xl p-2 space-y-1 max-h-48 overflow-y-auto">
                    <div className="p-1.5">
                      <input
                        type="text"
                        placeholder="Search rules..."
                        value={ruleSearchQuery}
                        onChange={(e) => setRuleSearchQuery(e.target.value)}
                        className="w-full bg-[#16223b] border border-[#23355b] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                      />
                    </div>
                    {allAvailableRules
                      .filter(r => r.toLowerCase().includes(ruleSearchQuery.toLowerCase()))
                      .map((rule) => {
                        const isSelected = selectedRules.includes(rule);
                        return (
                          <div
                            key={rule}
                            onClick={() => toggleRule(rule)}
                            className={`p-2 rounded-xl text-xs flex items-center justify-between cursor-pointer transition-colors ${
                              isSelected ? 'bg-blue-600/20 text-blue-300 font-bold' : 'hover:bg-[#16223b] text-slate-300'
                            }`}
                          >
                            <span>{rule}</span>
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />}
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              {/* Trade Screenshots Drag & Drop Upload Zone */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-300 light:text-slate-700">
                  Trade Screenshots
                </label>
                <div className="border-2 border-dashed border-[#23355b] light:border-slate-300 rounded-2xl p-4 text-center hover:border-blue-500/60 transition-colors bg-[#0d1527]/50 relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {uploadedScreenshot ? (
                    <div className="space-y-2">
                      <img
                        src={uploadedScreenshot}
                        alt="Trade Preview"
                        className="max-h-32 mx-auto rounded-xl object-contain border border-[#23355b]"
                      />
                      <p className="text-[11px] text-emerald-400 font-semibold">Screenshot attached (Click to change)</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center space-y-1">
                      <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                        <Upload className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-semibold text-slate-300">
                        Drop &amp; drop your trade screenshot here
                      </p>
                      <p className="text-[10px] text-slate-500">Supports PNG, JPG (Max 5MB)</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* ===================== PSYCHOLOGY TAB ===================== */}
          {activeSubTab === 'psychology' && (
            <div className="space-y-5 text-xs">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Left Column: Sliders & Emotional State */}
                <div className="space-y-4">
                  
                  {/* Slider 1: Entry Confidence Level (1-10) */}
                  <div className="p-4 rounded-2xl bg-[#16223b] light:bg-slate-50 border border-[#23355b] space-y-2">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-slate-300 light:text-slate-700">Entry Confidence Level (1-10)</span>
                      <span className="text-base font-black text-blue-400 font-mono">{entryConfidence}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={entryConfidence}
                      onChange={(e) => setEntryConfidence(Number(e.target.value))}
                      className="w-full h-2 bg-[#0d1527] rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                      <span>Low</span>
                      <span>Medium</span>
                      <span>High</span>
                    </div>
                  </div>

                  {/* Slider 2: Satisfaction Rating (1-10) */}
                  <div className="p-4 rounded-2xl bg-[#16223b] light:bg-slate-50 border border-[#23355b] space-y-2">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-slate-300 light:text-slate-700">Satisfaction Rating (1-10)</span>
                      <span className="text-base font-black text-emerald-400 font-mono">{satisfactionRating}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={satisfactionRating}
                      onChange={(e) => setSatisfactionRating(Number(e.target.value))}
                      className="w-full h-2 bg-[#0d1527] rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                      <span>Not Satisfied</span>
                      <span>Average</span>
                      <span>Satisfied</span>
                    </div>
                  </div>

                  {/* Emotional State Dropdown */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 light:text-slate-700 mb-1">
                      Emotional State During Trade <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={emotionalState}
                      onChange={(e) => setEmotionalState(e.target.value)}
                      className="w-full bg-[#16223b] light:bg-slate-100 border border-[#23355b] rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
                    >
                      <option value="Select emotional state">Select emotional state</option>
                      <option value="Calm & Disciplined">Calm & Disciplined</option>
                      <option value="Confident & Focused">Confident & Focused</option>
                      <option value="FOMO (Fear of Missing Out)">FOMO (Fear of Missing Out)</option>
                      <option value="Greedy / Overleveraged">Greedy / Overleveraged</option>
                      <option value="Anxious & Impatient">Anxious & Impatient</option>
                      <option value="Revenge Mindset">Revenge Mindset</option>
                    </select>
                  </div>

                </div>

                {/* Right Column: Mistakes Checklist 2-Column Grid */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-slate-300 light:text-slate-700">
                    Mistakes Made <span className="text-slate-500 font-normal">(Select all that occurred)</span>
                  </label>

                  <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1 no-scrollbar">
                    {allMistakes.map((m) => {
                      const isSelected = selectedMistakes.includes(m);
                      return (
                        <button
                          type="button"
                          key={m}
                          onClick={() => toggleMistake(m)}
                          className={`p-2.5 rounded-xl border text-left flex items-center justify-between text-[11px] font-bold transition-all ${
                            isSelected
                              ? m === 'No Mistakes'
                                ? 'bg-emerald-600/20 border-emerald-500/40 text-emerald-300'
                                : 'bg-rose-600/20 border-rose-500/40 text-rose-300'
                              : 'bg-[#16223b] light:bg-slate-50 border-[#23355b] text-slate-300 hover:border-slate-500'
                          }`}
                        >
                          <span className="truncate">{m}</span>
                          {isSelected && <span className="text-xs">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Bottom: Lessons Learned Textarea */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 light:text-slate-700 mb-1">
                  Lessons Learned
                </label>
                <textarea
                  rows={3}
                  placeholder="What did you learn from this trade? What will you do differently next time?"
                  value={lessonLearned}
                  onChange={(e) => setLessonLearned(e.target.value)}
                  className="w-full bg-[#16223b] light:bg-slate-100 border border-[#23355b] rounded-xl p-3 text-slate-200 focus:outline-none"
                />
              </div>

            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1e2942] light:border-slate-100">
            <button
              type="button"
              onClick={() => setIsNewTradeModalOpen(false)}
              className="px-5 py-2.5 rounded-xl text-slate-400 hover:text-white font-bold text-xs bg-[#16223b] hover:bg-[#202f50] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all transform active:scale-95"
            >
              Save Trade
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
