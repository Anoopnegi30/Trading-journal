import { Trade, MarketTickerItem, TradingRule, ChecklistItem, TradingStrategy } from '../types/trade';

export const INITIAL_TICKER: MarketTickerItem[] = [
  { symbol: 'NIFTY 50', name: 'Nifty 50', value: 24850.35, change: 125.50, changePercent: +0.51 },
  { symbol: 'BANKNIFTY', name: 'Nifty Bank', value: 51220.60, change: 180.40, changePercent: +0.35 },
  { symbol: 'SENSEX', name: 'BSE Sensex', value: 81710.80, change: 350.40, changePercent: +0.43 },
  { symbol: 'NIFTY FIN', name: 'Nifty Fin Service', value: 24190.45, change: 89.70, changePercent: +0.37 },
  { symbol: 'NIFTY IT', name: 'Nifty IT', value: 42150.80, change: 410.20, changePercent: +0.98 },
  { symbol: 'REALTY', name: 'Nifty Realty', value: 1085.20, change: 14.70, changePercent: +1.37 },
  { symbol: 'NIFTY ENG', name: 'Nifty Energy', value: 40150.80, change: -19.70, changePercent: -0.05 },
  { symbol: 'NIFTY AUTO', name: 'Nifty Auto', value: 25920.30, change: 141.05, changePercent: +0.55 }
];

// Clean fresh start from August 2026 (0 trades)
export const INITIAL_TRADES: Trade[] = [];

// Pre-defined Trading Setups & Strategies preserved for trader
export const INITIAL_STRATEGIES: TradingStrategy[] = [
  {
    id: 'strat-1',
    name: '9&15 Ema',
    description: '9 & 15 Exponential Moving Average crossover and slope pullback setup on 5-min chart.',
    targetWinRate: '65%',
    targetRiskReward: '1:3.0',
    timeframe: '5 Min',
    active: true
  },
  {
    id: 'strat-2',
    name: 'Pullback',
    description: 'Trend continuation pullback to VWAP, Daily CPR, or key support/resistance zone.',
    targetWinRate: '60%',
    targetRiskReward: '1:2.5',
    timeframe: '5 Min / 15 Min',
    active: true
  },
  {
    id: 'strat-3',
    name: 'Breakout',
    description: 'Consolidation range / chart pattern breakout with volume and open interest expansion.',
    targetWinRate: '55%',
    targetRiskReward: '1:3.5',
    timeframe: '5 Min',
    active: true
  },
  {
    id: 'strat-4',
    name: 'Range Bound',
    description: 'Mean-reversion fading extremes between well-defined daily support & resistance levels.',
    targetWinRate: '60%',
    targetRiskReward: '1:2.0',
    timeframe: '15 Min',
    active: true
  },
  {
    id: 'strat-5',
    name: 'Opening Range Breakout (ORB)',
    description: 'First 15-minute candle high/low breakout with institutional morning momentum.',
    targetWinRate: '55%',
    targetRiskReward: '1:2.5',
    timeframe: '15 Min',
    active: true
  },
  {
    id: 'strat-6',
    name: 'Reversal Setup',
    description: 'Exhaustion pinbar at multi-day support/resistance with RSI divergence confirmation.',
    targetWinRate: '50%',
    targetRiskReward: '1:3.0',
    timeframe: '15 Min',
    active: true
  }
];

export const INITIAL_RULES: TradingRule[] = [
  {
    id: 'rule-1',
    title: '5-10 points SL in nifty',
    description: 'Strict stop-loss limit per Nifty options trade to cap downside risk.',
    category: 'Exit',
    mandatory: true,
    active: true
  },
  {
    id: 'rule-2',
    title: 'book partial quantity on TP',
    description: 'Secure 50-70% quantity at initial target (1:2) and trail the rest.',
    category: 'Analysis',
    mandatory: true,
    active: true
  },
  {
    id: 'rule-3',
    title: 'fixed quantity ( 600 quantity in nifty )',
    description: 'Maintain standardized lot sizing to prevent overleveraging.',
    category: 'Psychology',
    mandatory: true,
    active: true
  },
  {
    id: 'rule-4',
    title: 'avoid trading after 3 winning strik',
    description: 'Protect emotional euphoria and day gains after 3 consecutive winners.',
    category: 'Psychology',
    mandatory: false,
    active: true
  },
  {
    id: 'rule-5',
    title: 'Maximum 2 trade in a day',
    description: 'Overcome overtrading by strictly limiting entries to 2 high-quality setups daily.',
    category: 'Analysis',
    mandatory: true,
    active: true
  },
  {
    id: 'rule-6',
    title: 'stop loss trailing',
    description: 'Trail stop loss mechanically along the 9/15 EMA slope once trade is green.',
    category: 'Risk',
    mandatory: true,
    active: true
  }
];

export const INITIAL_CHECKLIST: ChecklistItem[] = [
  { id: 'chk-1', title: 'Check Global Indices & SGX/Gift Nifty Trend', category: 'Pre-Market', completed: false },
  { id: 'chk-2', title: 'Mark Previous Day High (PDH), Low (PDL) and Major CPR/VWAP Levels', category: 'Pre-Market', completed: false },
  { id: 'chk-3', title: 'Identify Key FII/DII Institutional Support/Resistance and Open Interest (OI)', category: 'Pre-Market', completed: false },
  { id: 'chk-4', title: 'Verify Economic Calendar for RBI/Fed/Earnings Event Triggers', category: 'Pre-Market', completed: false },
  { id: 'chk-5', title: 'Define Max Capital & Daily Max Stop Loss for Today', category: 'Pre-Market', completed: false },
  { id: 'chk-6', title: 'Strictly Wait for Entry Signal Confirmation (No Anticipatory FOMO)', category: 'Execution', completed: false },
  { id: 'chk-7', title: 'Immediate SL Order Placed in Terminal upon Execution', category: 'Execution', completed: false },
  { id: 'chk-8', title: 'Log Trade Execution, Emotion & Attach Chart Screenshot in Journal', category: 'Post-Market', completed: false }
];
