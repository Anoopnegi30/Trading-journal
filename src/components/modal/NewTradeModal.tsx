import React, { useState, useEffect } from 'react';
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
  Zap,
  Edit3,
  Scale
} from 'lucide-react';

export const NewTradeModal: React.FC = () => {
  const { 
    isNewTradeModalOpen, 
    setIsNewTradeModalOpen, 
    addTrade, 
    updateTrade, 
    editingTrade, 
    setEditingTrade, 
    rules, 
    strategies,
    availableMistakes,
    addCustomMistake
  } = useTradeContext();
  
  // Navigation tabs in modal
  const [activeSubTab, setActiveSubTab] = useState<'general' | 'psychology'>('general');
  const [isNoTradeDay, setIsNoTradeDay] = useState(false);

  // General Tab State
  const [marketType, setMarketType] = useState<MarketType>('Indian');
  const [duration, setDuration] = useState<TradeDuration>('Intraday');
  const [tradeType, setTradeType] = useState<TradeType>('Option Buying');
  const [symbol, setSymbol] = useState('NIFTY 50');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [direction, setDirection] = useState<TradeDirection>('Long');
  const [entryPrice, setEntryPrice] = useState<number | ''>(110);
  const [exitPrice, setExitPrice] = useState<number | ''>(120);
  const [quantity, setQuantity] = useState<number | ''>(65);
  const [fees, setFees] = useState<number | ''>(55);
  const [stopLoss, setStopLoss] = useState<number | ''>('');
  const [target, setTarget] = useState<number | ''>('');
  const [strategy, setStrategy] = useState('Random Scalp');
  const [outcome, setOutcome] = useState<TradeOutcome>('Full Success');
  const [analysis, setAnalysis] = useState('');
  const [selectedRules, setSelectedRules] = useState<string[]>([
    '5-10 points SL in nifty',
    'stop loss trailing'
  ]);
  const [ruleSearchQuery, setRuleSearchQuery] = useState('');
  const [showRuleDropdown, setShowRuleDropdown] = useState(false);
  const [uploadedScreenshot, setUploadedScreenshot] = useState<string | null>(null);

  // Psychology Tab State
  const [entryConfidence, setEntryConfidence] = useState<number>(5); // 1-10 slider (Default 5)
  const [satisfactionRating, setSatisfactionRating] = useState<number>(5); // 1-10 slider
  const [emotionalState, setEmotionalState] = useState<string>('Impatient');
  const [selectedMistakes, setSelectedMistakes] = useState<string[]>(['Overtrading', 'Impatient Entry']);
  const [lessonLearned, setLessonLearned] = useState('');
  const [isAddingMistake, setIsAddingMistake] = useState(false);
  const [newMistakeName, setNewMistakeName] = useState('');

  // Sync state when editing an existing trade
  useEffect(() => {
    if (editingTrade) {
      setMarketType(editingTrade.marketType || 'Indian');
      setDuration(editingTrade.duration || 'Intraday');
      setTradeType(editingTrade.tradeType || 'Option Buying');
      setSymbol(editingTrade.symbol || 'NIFTY 50');
      setDate(editingTrade.date || new Date().toISOString().split('T')[0]);
      setDirection(editingTrade.direction || 'Long');
      setEntryPrice(editingTrade.entryPrice);
      setExitPrice(editingTrade.exitPrice);
      setQuantity(editingTrade.quantity);
      setFees(editingTrade.fees);
      setStopLoss(editingTrade.stopLoss !== undefined && editingTrade.stopLoss !== null ? editingTrade.stopLoss : '');
      setTarget(editingTrade.target !== undefined && editingTrade.target !== null ? editingTrade.target : '');
      let st = editingTrade.strategy || 'Random Scalp';
      if (st === 'Dhan Auto-Sync') st = 'Random Scalp';
      setStrategy(st);
      setOutcome(editingTrade.outcome || 'Full Success');
      setAnalysis(editingTrade.notes || editingTrade.analysis || '');
      setEmotionalState(editingTrade.emotion || (st === 'Random Scalp' ? 'Impatient' : 'Disciplined'));
      setEntryConfidence(editingTrade.confidence ? Math.round(editingTrade.confidence / 10) : (st === 'Random Scalp' ? 5 : 8));
      
      const loadedMistakes = editingTrade.mistakes && editingTrade.mistakes.length > 0
        ? editingTrade.mistakes
        : (st === 'Random Scalp' ? ['Overtrading', 'Impatient Entry'] : []);
      setSelectedMistakes(loadedMistakes);
      setLessonLearned(editingTrade.lessonLearned || '');
      setUploadedScreenshot(editingTrade.chartImage || null);
    }
  }, [editingTrade]);

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

  // Mistakes list dynamic from context
  const currentMistakesList = availableMistakes && availableMistakes.length > 0 ? availableMistakes : [
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
    'Chasing Market',
    'Hesitation / Late Entry'
  ];

  const handleReset = () => {
    setSymbol('NIFTY 50');
    setEntryPrice(110);
    setExitPrice(120);
    setQuantity(65);
    setFees(55);
    setStopLoss('');
    setTarget('');
    setAnalysis('');
    setSelectedMistakes([]);
    setLessonLearned('');
    setUploadedScreenshot(null);
    setIsNoTradeDay(false);
    setActiveSubTab('general');
    setEditingTrade(null);
  };

  // Auto computations
  const numEntry = Number(entryPrice) || 0;
  const numExit = Number(exitPrice) || 0;
  const numQty = Number(quantity) || 0;
  const numFees = Number(fees) || 0;
  const totalAmount = numEntry * numQty;

  let grossPnl = 0;
  if (numEntry > 0 && numExit > 0 && numQty > 0) {
    if (tradeType === 'Option Buying') {
      grossPnl = (numExit - numEntry) * numQty;
    } else {
      grossPnl = (numEntry - numExit) * numQty;
    }
  }
  const netPnl = grossPnl - numFees;
  const pnlPercent = totalAmount > 0 ? Number(((grossPnl / totalAmount) * 100).toFixed(2)) : 0;

  // Smart Auto R:R Calculation Logic
  const numStopLoss = Number(stopLoss) || 0;
  const numTarget = Number(target) || 0;

  let riskPts = 0;
  let rewardPts = 0;
  let computedRr = '1:2.0';
  let actualCapturedPts = 0;
  let actualCapturedRr = '';

  if (numEntry > 0) {
    if (numStopLoss > 0) {
      riskPts = Math.abs(numEntry - numStopLoss);
    } else {
      riskPts = numEntry > 50 ? 5 : Number((numEntry * 0.05).toFixed(2));
    }

    if (numTarget > 0) {
      rewardPts = Math.abs(numTarget - numEntry);
    } else if (numExit > 0) {
      rewardPts = Math.abs(numExit - numEntry);
    } else {
      rewardPts = riskPts * 2;
    }

    if (riskPts > 0) {
      const ratio = rewardPts / riskPts;
      computedRr = `1:${ratio >= 10 ? ratio.toFixed(1) : ratio.toFixed(2)}`;

      if (numExit > 0) {
        const diff = direction === 'Short' ? (numExit - numEntry) : (numExit - numEntry);
        actualCapturedPts = numExit - numEntry;
        const capturedRatio = Math.abs(actualCapturedPts) / riskPts;
        actualCapturedRr = `1:${capturedRatio >= 10 ? capturedRatio.toFixed(1) : capturedRatio.toFixed(2)}`;
      }
    }
  }

  const handleApplyPresetRR = (multiplier: number) => {
    if (!numEntry) return;
    const slDist = riskPts > 0 ? riskPts : 5;
    if (direction === 'Long') {
      const calculatedSl = Number((numEntry - slDist).toFixed(2));
      const calculatedTarget = Number((numEntry + slDist * multiplier).toFixed(2));
      setStopLoss(calculatedSl > 0 ? calculatedSl : 1);
      setTarget(calculatedTarget);
    } else {
      const calculatedSl = Number((numEntry + slDist).toFixed(2));
      const calculatedTarget = Number((numEntry - slDist * multiplier).toFixed(2));
      setStopLoss(calculatedSl);
      setTarget(calculatedTarget > 0 ? calculatedTarget : 1);
    }
  };

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedScreenshot(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isNoTradeDay) {
      if (editingTrade) {
        updateTrade(editingTrade.id, {
          date,
          isNoTradeDay: true,
          notes: analysis || 'Disciplined No-Trade Day recorded.'
        });
      } else {
        addTrade({
          date,
          time: '10:00',
          marketType: 'Indian',
          duration: 'Intraday',
          tradeType: 'Option Buying',
          symbol: 'NO_TRADE',
          direction: 'Long',
          entryPrice: 0,
          exitPrice: 0,
          quantity: 0,
          totalAmount: 0,
          fees: 0,
          pnl: 0,
          netPnl: 0,
          pnlPercent: 0,
          riskReward: 'N/A',
          strategy: 'None',
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
      }
      setIsNewTradeModalOpen(false);
      handleReset();
      return;
    }

    if (!symbol.trim()) {
      alert('Please enter a trading symbol');
      return;
    }

    const tradePayload = {
      date,
      time: editingTrade?.time || '10:00',
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
      outcome,
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
    };

    if (editingTrade) {
      updateTrade(editingTrade.id, tradePayload);
    } else {
      addTrade(tradePayload);
    }

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
            <h2 className="text-lg font-black text-white light:text-slate-900 tracking-tight flex items-center gap-2">
              {editingTrade ? <Edit3 className="w-5 h-5 text-blue-400" /> : null}
              {editingTrade ? `Edit Trade (${editingTrade.symbol})` : 'Trade Journal'}
            </h2>
            <p className="text-xs text-slate-400">
              {editingTrade ? 'Update execution, strategy, psychology, and lessons' : 'Capture setup, execution, and psychology in one flow'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* "No Trade Day" toggle */}
            {!editingTrade && (
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
            )}

            <button
              onClick={() => {
                setIsNewTradeModalOpen(false);
                handleReset();
              }}
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
            className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeSubTab === 'general'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'text-slate-400 hover:text-white light:hover:text-slate-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>1. Trade Setup & Execution</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('psychology')}
            className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeSubTab === 'psychology'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'text-slate-400 hover:text-white light:hover:text-slate-900'
            }`}
          >
            <Brain className="w-3.5 h-3.5 text-purple-400" />
            <span>2. Psychology & Rules</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {activeSubTab === 'general' ? (
            <div className="space-y-4">
              
              {/* Row 1: Market, Duration, Type, Symbol, Date */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 light:text-slate-700 mb-1">
                    Market <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={marketType}
                    onChange={(e) => setMarketType(e.target.value as MarketType)}
                    className="w-full bg-[#16223b] light:bg-slate-100 border border-[#23355b] light:border-slate-300 rounded-xl px-3 py-2 text-slate-200 light:text-slate-900 focus:outline-none"
                  >
                    <option value="Indian">Indian</option>
                    <option value="Crypto">Crypto</option>
                    <option value="Forex">Forex</option>
                    <option value="US Stocks">US Stocks</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 light:text-slate-700 mb-1">
                    Duration <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value as TradeDuration)}
                    className="w-full bg-[#16223b] light:bg-slate-100 border border-[#23355b] light:border-slate-300 rounded-xl px-3 py-2 text-slate-200 light:text-slate-900 focus:outline-none"
                  >
                    <option value="Intraday">Intraday</option>
                    <option value="Swing">Swing</option>
                    <option value="Scalp">Scalp</option>
                    <option value="Position">Position</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 light:text-slate-700 mb-1">
                    Trade Type <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={tradeType}
                    onChange={(e) => setTradeType(e.target.value as TradeType)}
                    className="w-full bg-[#16223b] light:bg-slate-100 border border-[#23355b] light:border-slate-300 rounded-xl px-3 py-2 text-slate-200 light:text-slate-900 font-semibold focus:outline-none"
                  >
                    <option value="Option Buying">Option Buying (CE/PE)</option>
                    <option value="Option Selling">Option Selling</option>
                    <option value="Equity / Futures">Equity / Futures</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 light:text-slate-700 mb-1">
                    Symbol <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. NIFTY 24800 CE"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    className="w-full bg-[#16223b] light:bg-slate-100 border border-[#23355b] light:border-slate-300 rounded-xl px-3 py-2 text-slate-200 light:text-slate-900 font-bold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 light:text-slate-700 mb-1">
                    Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-[#16223b] light:bg-slate-100 border border-[#23355b] light:border-slate-300 rounded-xl px-3 py-2 text-slate-200 light:text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 2: Entry Price, Exit Price, Quantity, Total Amount */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 light:text-slate-700 mb-1">
                    Entry Price (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="Buy Price"
                    value={entryPrice}
                    onChange={(e) => setEntryPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-[#16223b] light:bg-slate-100 border border-[#23355b] light:border-slate-300 rounded-xl px-3 py-2 text-slate-200 light:text-slate-900 font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 light:text-slate-700 mb-1">
                    Exit Price (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="Sell Price"
                    value={exitPrice}
                    onChange={(e) => setExitPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-[#16223b] light:bg-slate-100 border border-[#23355b] light:border-slate-300 rounded-xl px-3 py-2 text-slate-200 light:text-slate-900 font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 light:text-slate-700 mb-1">
                    Quantity <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="Quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-[#16223b] light:bg-slate-100 border border-[#23355b] light:border-slate-300 rounded-xl px-3 py-2 text-slate-200 light:text-slate-900 font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 light:text-slate-700 mb-1">
                    Total Turnover (₹)
                  </label>
                  <div className="w-full bg-[#16223b] light:bg-slate-100 border border-[#23355b] light:border-slate-300 rounded-xl px-3 py-2 text-slate-300 light:text-slate-700 font-mono font-bold">
                    {formatINR(totalAmount)}
                  </div>
                </div>
              </div>

              {/* Row 3: P&L Amount, Fees, Direction, Stop Loss, Target */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 light:text-slate-700 mb-1">
                    Net P&L (₹)
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
                    Brokerage & Taxes (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 55"
                    value={fees}
                    onChange={(e) => setFees(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-[#16223b] light:bg-slate-100 border border-[#23355b] light:border-slate-300 rounded-xl px-3 py-2 text-slate-200 light:text-slate-900 font-mono focus:outline-none"
                  />
                  <p className="text-[9px] text-slate-400 mt-0.5">₹40 Brokerage + STT/GST/NSE</p>
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

              {/* Live Auto Risk-to-Reward (R:R) Calculation Banner */}
              <div className="p-3.5 rounded-2xl bg-[#16223b]/80 light:bg-slate-50 border border-[#23355b] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-inner">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                    <Scale className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-bold text-slate-300 light:text-slate-700">Planned R:R:</span>
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-black bg-blue-600 text-white font-mono shadow-sm">
                        {computedRr}
                      </span>
                      {numExit > 0 && numTarget > 0 && Math.abs(numExit - numTarget) > 0.1 && (
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold font-mono ${actualCapturedPts >= 0 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'}`}>
                          Captured: {actualCapturedRr} ({actualCapturedPts >= 0 ? '+' : ''}{actualCapturedPts.toFixed(2)} pts)
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Risk: <strong className="text-rose-400 font-mono">{riskPts.toFixed(2)} pts ({formatINR(riskPts * numQty)})</strong> • Target: <strong className="text-emerald-400 font-mono">{rewardPts.toFixed(2)} pts ({formatINR(rewardPts * numQty)})</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 w-full sm:w-auto flex-wrap">
                  <span className="text-[10px] text-slate-400 font-semibold mr-1">Auto-Set Target:</span>
                  {[1.5, 2.0, 2.5, 3.0].map(multiplier => (
                    <button
                      key={multiplier}
                      type="button"
                      onClick={() => handleApplyPresetRR(multiplier)}
                      className="px-2 py-1 rounded-lg bg-[#111a2e] hover:bg-blue-600 hover:text-white text-slate-300 border border-[#23355b] text-[10px] font-bold font-mono transition-colors cursor-pointer"
                    >
                      1:{multiplier.toFixed(1)}
                    </button>
                  ))}
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
                    className="w-full bg-[#16223b] light:bg-slate-100 border border-[#23355b] light:border-slate-300 rounded-xl px-3 py-2 text-slate-200 light:text-slate-900 focus:outline-none font-semibold"
                  >
                    {strategies.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                    <option value="Random Scalp">Random Scalp</option>
                    <option value="Trend Continuation">Trend Continuation</option>
                    <option value="Fibonacci Retracement">Fibonacci Retracement</option>
                    <option value="News-based">News-based</option>
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
                    className="w-full bg-[#16223b] light:bg-slate-100 border border-[#23355b] light:border-slate-300 rounded-xl px-3 py-2 text-slate-200 light:text-slate-900 focus:outline-none font-semibold"
                  >
                    <option value="Full Success">Full Success</option>
                    <option value="Partial Success">Partial Success</option>
                    <option value="Breakeven">Breakeven</option>
                    <option value="Loss">Loss</option>
                    <option value="Mistake">Mistake</option>
                  </select>
                </div>
              </div>

              {/* Row 5: Notes & Analysis */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 light:text-slate-700 mb-1">
                  Trade Notes / Analysis
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe your thesis, key price levels, market context..."
                  value={analysis}
                  onChange={(e) => setAnalysis(e.target.value)}
                  className="w-full bg-[#16223b] light:bg-slate-100 border border-[#23355b] rounded-xl p-3 text-slate-200 focus:outline-none text-xs"
                />
              </div>

              {/* Row 6: Screenshot Upload */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 light:text-slate-700 mb-1">
                  Attach Chart Screenshot
                </label>
                <div className="flex items-center gap-3">
                  <label className="px-4 py-2 rounded-xl bg-[#16223b] border border-[#23355b] hover:border-blue-500 cursor-pointer flex items-center gap-2 text-xs font-semibold text-slate-300">
                    <Upload className="w-4 h-4 text-blue-400" />
                    <span>Choose Image</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                  {uploadedScreenshot && (
                    <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Image Attached
                    </span>
                  )}
                </div>
              </div>

            </div>
          ) : (
            /* Psychology Tab */
            <div className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Confidence Slider */}
                <div className="p-4 rounded-2xl bg-[#16223b] border border-[#23355b] space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="font-bold text-slate-300">Entry Confidence</label>
                    <span className="font-mono font-bold text-blue-400 text-sm">{entryConfidence}/10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={entryConfidence}
                    onChange={(e) => setEntryConfidence(Number(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                    <span>1 (Hesitant)</span>
                    <span>5 (Neutral)</span>
                    <span>10 (High Conviction)</span>
                  </div>
                </div>

                {/* Emotional State Dropdown */}
                <div className="p-4 rounded-2xl bg-[#16223b] border border-[#23355b] space-y-2">
                  <label className="font-bold text-slate-300 block">Emotional State</label>
                  <select
                    value={emotionalState}
                    onChange={(e) => setEmotionalState(e.target.value)}
                    className="w-full bg-[#0d1527] border border-[#23355b] rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none font-semibold"
                  >
                    <option value="Disciplined">Disciplined & Calm</option>
                    <option value="Confident">High Confidence</option>
                    <option value="FOMO">FOMO (Fear of Missing Out)</option>
                    <option value="Greed">Greed / Over-leveraged</option>
                    <option value="Revenge">Revenge Trading</option>
                    <option value="Anxious">Anxious / Stressed</option>
                    <option value="Impatient">Impatient Entry</option>
                  </select>
                </div>

              </div>

              {/* Mistakes Checklist with Custom Mistake Creator */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[11px] font-bold text-slate-300 light:text-slate-700">
                    Mistakes Identified (If any)
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsAddingMistake(prev => !prev)}
                    className="text-[11px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Custom Mistake</span>
                  </button>
                </div>

                {/* Inline Custom Mistake Creator Form */}
                {isAddingMistake && (
                  <div className="mb-2.5 p-3 rounded-2xl bg-[#0d1527] light:bg-slate-50 border border-blue-500/30 flex items-center gap-2 animate-in fade-in duration-150">
                    <input
                      type="text"
                      autoFocus
                      placeholder="Enter new mistake (e.g. Trailing SL cut early, Traded before 9:30)..."
                      value={newMistakeName}
                      onChange={(e) => setNewMistakeName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (newMistakeName.trim()) {
                            addCustomMistake(newMistakeName.trim());
                            setSelectedMistakes(prev => [...prev, newMistakeName.trim()]);
                            setNewMistakeName('');
                            setIsAddingMistake(false);
                          }
                        }
                      }}
                      className="flex-1 bg-[#16223b] light:bg-white border border-[#23355b] light:border-slate-300 rounded-xl px-3 py-1.5 text-xs text-white light:text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newMistakeName.trim()) {
                          addCustomMistake(newMistakeName.trim());
                          setSelectedMistakes(prev => [...prev, newMistakeName.trim()]);
                          setNewMistakeName('');
                          setIsAddingMistake(false);
                        }
                      }}
                      disabled={!newMistakeName.trim()}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shrink-0"
                    >
                      Add Tag
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingMistake(false);
                        setNewMistakeName('');
                      }}
                      className="px-2.5 py-1.5 rounded-xl text-slate-400 hover:text-white text-xs cursor-pointer shrink-0"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {currentMistakesList.map(m => {
                    const isSelected = selectedMistakes.includes(m);
                    return (
                      <button
                        type="button"
                        key={m}
                        onClick={() => toggleMistake(m)}
                        className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? m === 'No Mistakes'
                              ? 'bg-emerald-600/20 border-emerald-500/40 text-emerald-300'
                              : 'bg-rose-600/20 border-rose-500/40 text-rose-300'
                            : 'bg-[#16223b] light:bg-slate-100 border-[#23355b] light:border-slate-300 text-slate-300 light:text-slate-700 hover:border-slate-500'
                        }`}
                      >
                        <span className="truncate">{m}</span>
                        {isSelected && <span>✓</span>}
                      </button>
                    );
                  })}

                  {!isAddingMistake && (
                    <button
                      type="button"
                      onClick={() => setIsAddingMistake(true)}
                      className="p-2.5 rounded-xl border border-dashed border-[#23355b] light:border-slate-300 hover:border-blue-500/50 text-blue-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all bg-[#16223b]/50 light:bg-slate-50 hover:bg-blue-500/10 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ New Mistake</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Lesson Learned */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 light:text-slate-700 mb-1">
                  Lesson Learned / Journal Takeaway
                </label>
                <textarea
                  rows={3}
                  placeholder="What was the key takeaway from this trade execution?"
                  value={lessonLearned}
                  onChange={(e) => setLessonLearned(e.target.value)}
                  className="w-full bg-[#16223b] border border-[#23355b] rounded-xl p-3 text-slate-200 focus:outline-none"
                />
              </div>

            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1e2942] light:border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsNewTradeModalOpen(false);
                handleReset();
              }}
              className="px-5 py-2.5 rounded-xl text-slate-400 hover:text-white font-bold text-xs bg-[#16223b] hover:bg-[#202f50] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all transform active:scale-95 cursor-pointer"
            >
              {editingTrade ? 'Save Changes & Update Trade' : 'Save Trade'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
