export type MarketType = 'Indian' | 'Crypto' | 'Forex' | 'US Stocks';
export type TradeDuration = 'Intraday' | 'Swing' | 'Position' | 'Scalp';
export type TradeDirection = 'Long' | 'Short';
export type TradeType = 'Option Buying' | 'Option Selling' | 'Equity / Futures';
export type TradeOutcome = 'Full Success' | 'Partial Success' | 'Loss' | 'Mistake' | 'Breakeven';
export type EmotionType = 'Calm' | 'Disciplined' | 'Confident' | 'FOMO' | 'Greed' | 'Revenge' | 'Anxious' | 'Impatient';

export interface UserProfile {
  name: string;
  email: string;
  tradingStyle: string;
  initialCapital: number;
  defaultFee?: number;
  phone?: string;
  bio?: string;
}

export interface Trade {
  id: string;
  date: string; // YYYY-MM-DD
  time?: string;
  marketType: MarketType;
  duration: TradeDuration;
  tradeType?: TradeType;
  symbol: string;
  direction: TradeDirection;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  totalAmount?: number;
  stopLoss?: number;
  target?: number;
  pnl: number;
  pnlPercent: number;
  fees: number;
  netPnl: number;
  riskReward: string;
  strategy: string;
  outcome: TradeOutcome;
  isNoTradeDay?: boolean;
  notes?: string;
  analysis?: string;
  chartImage?: string;
  
  // Psychology & Discipline
  emotion: EmotionType;
  confidence: number; // 1 to 100
  mistakes: string[];
  followedPlan: boolean;
  followedRisk: boolean;
  lessonLearned?: string;
  createdAt: string;
}

export interface DashboardStats {
  highestPnl: number;
  highestPnlChangePercent: number;
  winRate: number;
  winRateChangePercent: number;
  avgRiskReward: string;
  avgRiskRewardChangePercent: number;
  tradesThisMonth: number;
  tradesThisMonthChange: number;
  totalPnl: number;
  winningTrades: number;
  losingTrades: number;
  breakevenTrades: number;
  profitFactor: number;
  confidenceScore: number;
  confidenceLabel: string;
  confidenceDesc: string;
}

export interface StrategyPerformance {
  name: string;
  totalTrades: number;
  winCount: number;
  winRate: number;
  totalPnl: number;
  avgPnl: number;
  realizedRR?: string;
}

export interface MistakeAnalysis {
  name: string;
  tradeCount: number;
  totalLoss: number;
  percentage: number;
}

export interface MarketTickerItem {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

export interface TradingRule {
  id: string;
  title: string;
  description: string;
  category: 'Risk' | 'Execution' | 'Psychology' | 'General' | 'Analysis' | 'Exit';
  mandatory: boolean;
  active: boolean;
}

export interface TradingStrategy {
  id: string;
  name: string;
  description: string;
  targetWinRate?: string;
  targetRiskReward?: string;
  timeframe?: string;
  active: boolean;
}

export interface ChecklistItem {
  id: string;
  title: string;
  category: 'Pre-Market' | 'Execution' | 'Post-Market' | string;
  completed: boolean;
}

export interface TradingChallenge {
  id: string;
  name: string;
  startingCapital: number;
  targetCapital: number;
  startDate: string;
  targetDays: number;
  maxRiskPerTrade: number;
  maxDailyLoss: number;
  isActive: boolean;
  notes?: string;
}
