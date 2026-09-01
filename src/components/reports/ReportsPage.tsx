import React, { useState } from 'react';
import { useTradeContext } from '../../context/TradeContext';
import { 
  BarChart3, 
  Download, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Target, 
  ShieldCheck, 
  PieChart as PieChartIcon, 
  Scale, 
  Award, 
  Activity, 
  Percent, 
  FileText,
  DollarSign,
  ChevronDown,
  Trophy,
  ArrowRightLeft,
  CalendarDays,
  Receipt,
  AlertTriangle,
  Brain,
  CheckCircle2,
  BookOpen,
  Layers,
  Sparkles,
  Zap,
  AlertOctagon,
  HeartPulse,
  Lock,
  RotateCcw,
  ShieldAlert,
  Flame,
  CheckSquare,
  Compass,
  ArrowRight,
  Info
} from 'lucide-react';
import { formatINR, calculateDashboardStats, getMistakesBreakdown } from '../../utils/calculations';

type ReportTab = 'Performance' | 'Time of Day' | 'Psychology' | 'Risk' | 'Journal' | 'Bad Day Reset SOS';

export const ReportsPage: React.FC = () => {
  const { trades, dateFilter, setDateFilter, marketFilter, setMarketFilter, reportsSubTab, setReportsSubTab, exportCsv } = useTradeContext();
  const activeReportTab = (reportsSubTab as ReportTab) || 'Performance';
  const setActiveReportTab = (tab: ReportTab) => setReportsSubTab(tab);

  // Bad Day Recovery SOS State
  const [sosLossAmount, setSosLossAmount] = useState<number>(12070.80);
  const [selectedRecoveryIndex, setSelectedRecoveryIndex] = useState<'NIFTY' | 'BANKNIFTY' | 'FINNIFTY' | 'SENSEX' | 'STOCKS'>('NIFTY');
  const [recoveryLotCount, setRecoveryLotCount] = useState<number>(1);
  const [isRecoveryPlanSaved, setIsRecoveryPlanSaved] = useState<boolean>(() => {
    return localStorage.getItem('trade_recovery_plan_active') === 'true';
  });
  const [sosDailyTarget, setSosDailyTarget] = useState<number>(750);
  const [sosSelectedMistakes, setSosSelectedMistakes] = useState<string[]>(['revenge', 'overtrading']);
  const [isBreathingActive, setIsBreathingActive] = useState<boolean>(false);
  const [breathingPhase, setBreathingPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [breathingCountdown, setBreathingCountdown] = useState<number>(60);
  const [isSosContractLocked, setIsSosContractLocked] = useState<boolean>(false);
  const [contractAccept1, setContractAccept1] = useState<boolean>(false);
  const [contractAccept2, setContractAccept2] = useState<boolean>(false);
  const [contractAccept3, setContractAccept3] = useState<boolean>(false);

  React.useEffect(() => {
    let timer: any;
    if (isBreathingActive && breathingCountdown > 0) {
      timer = setInterval(() => {
        setBreathingCountdown(prev => {
          if (prev <= 1) {
            setIsBreathingActive(false);
            return 60;
          }
          const mod = prev % 12;
          if (mod >= 8) setBreathingPhase('Inhale');
          else if (mod >= 4) setBreathingPhase('Hold');
          else setBreathingPhase('Exhale');
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isBreathingActive, breathingCountdown]);

  const validTrades = trades.filter(t => !t.isNoTradeDay);
  const stats = calculateDashboardStats(trades);

  // ==========================================
  // Comprehensive Analytics Calculations
  // ==========================================
  const totalTrades = validTrades.length;
  const winTrades = validTrades.filter(t => t.netPnl > 0);
  const lossTrades = validTrades.filter(t => t.netPnl < 0);
  const breakEvenTrades = validTrades.filter(t => t.netPnl === 0);

  const winCount = winTrades.length;
  const lossCount = lossTrades.length;
  const breakEvenCount = breakEvenTrades.length;

  const totalWinPnl = winTrades.reduce((sum, t) => sum + t.netPnl, 0);
  const totalLossPnl = Math.abs(lossTrades.reduce((sum, t) => sum + t.netPnl, 0));

  const avgWin = winCount > 0 ? totalWinPnl / winCount : 0;
  const avgLoss = lossCount > 0 ? totalLossPnl / lossCount : 0;
  const winRate = totalTrades > 0 ? Math.round((winCount / totalTrades) * 100) : 0;
  const lossRate = totalTrades > 0 ? (lossCount / totalTrades) : 0;
  const expectancy = totalTrades > 0 ? ((winRate / 100) * avgWin) - (lossRate * avgLoss) : 0;

  // Group by Date for Daily Performance
  const dailyPnlMap = new Map<string, { pnl: number; trades: number; charges: number }>();
  validTrades.forEach(t => {
    const d = t.date;
    const current = dailyPnlMap.get(d) || { pnl: 0, trades: 0, charges: 0 };
    current.pnl += t.netPnl;
    current.trades += 1;
    current.charges += (t.fees || 0);
    dailyPnlMap.set(d, current);
  });

  const dailyPnls = Array.from(dailyPnlMap.values());
  const tradingDays = dailyPnls.length;
  const winDaysList = dailyPnls.filter(d => d.pnl > 0);
  const lossDaysList = dailyPnls.filter(d => d.pnl < 0);
  const breakEvenDaysList = dailyPnls.filter(d => d.pnl === 0);

  const winDays = winDaysList.length;
  const lossDays = lossDaysList.length;
  const breakEvenDays = breakEvenDaysList.length;

  const bestDay = dailyPnls.length > 0 ? Math.max(...dailyPnls.map(d => d.pnl)) : 0;
  const worstDay = dailyPnls.length > 0 ? Math.min(...dailyPnls.map(d => d.pnl)) : 0;
  const avgWinDay = winDays > 0 ? winDaysList.reduce((sum, d) => sum + d.pnl, 0) / winDays : 0;
  const avgLossDay = lossDays > 0 ? Math.abs(lossDaysList.reduce((sum, d) => sum + d.pnl, 0) / lossDays) : 0;

  // Execution Streaks
  let consecutiveWins = 0;
  let consecutiveLosses = 0;
  let currentWinStreak = 0;
  let currentLossStreak = 0;

  // Sort chronological
  const sortedTrades = [...validTrades].sort((a, b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || '')));
  sortedTrades.forEach(t => {
    if (t.netPnl > 0) {
      currentWinStreak += 1;
      currentLossStreak = 0;
      if (currentWinStreak > consecutiveWins) consecutiveWins = currentWinStreak;
    } else if (t.netPnl < 0) {
      currentLossStreak += 1;
      currentWinStreak = 0;
      if (currentLossStreak > consecutiveLosses) consecutiveLosses = currentLossStreak;
    }
  });

  // Daily Streaks
  const sortedDays = Array.from(dailyPnlMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  let consecutiveWinDays = 0;
  let consecutiveLossDays = 0;
  let curWinDays = 0;
  let curLossDays = 0;
  sortedDays.forEach(([_, data]) => {
    if (data.pnl > 0) {
      curWinDays += 1;
      curLossDays = 0;
      if (curWinDays > consecutiveWinDays) consecutiveWinDays = curWinDays;
    } else if (data.pnl < 0) {
      curLossDays += 1;
      curWinDays = 0;
      if (curLossDays > consecutiveLossDays) consecutiveLossDays = curLossDays;
    }
  });

  // Capital and Quantity Analysis
  const capitalList = validTrades.map(t => ({
    amount: t.totalAmount || (t.entryPrice * t.quantity),
    pnl: t.netPnl,
    qty: t.quantity
  }));

  const maxCapitalTrade = capitalList.length > 0 ? capitalList.reduce((prev, cur) => cur.amount > prev.amount ? cur : prev, capitalList[0]) : null;
  const minCapitalTrade = capitalList.length > 0 ? capitalList.reduce((prev, cur) => cur.amount < prev.amount ? cur : prev, capitalList[0]) : null;
  const avgCapitalUsed = capitalList.length > 0 ? capitalList.reduce((sum, c) => sum + c.amount, 0) / capitalList.length : 0;

  const maxQtyTrade = capitalList.length > 0 ? capitalList.reduce((prev, cur) => cur.qty > prev.qty ? cur : prev, capitalList[0]) : null;
  const minQtyTrade = capitalList.length > 0 ? capitalList.reduce((prev, cur) => cur.qty < prev.qty ? cur : prev, capitalList[0]) : null;
  const avgQty = capitalList.length > 0 ? capitalList.reduce((sum, c) => sum + c.qty, 0) / capitalList.length : 0;

  // Strategy Setup Effectiveness
  const strategyStatsMap = new Map<string, { trades: number; wins: number; pnl: number }>();
  validTrades.forEach(t => {
    const s = t.strategy?.trim() || 'General Setup';
    const cur = strategyStatsMap.get(s) || { trades: 0, wins: 0, pnl: 0 };
    cur.trades += 1;
    if (t.netPnl > 0) cur.wins += 1;
    cur.pnl += t.netPnl;
    strategyStatsMap.set(s, cur);
  });

  const strategyEffectiveness = Array.from(strategyStatsMap.entries()).map(([name, data]) => ({
    name,
    trades: data.trades,
    winRate: Math.round((data.wins / data.trades) * 100),
    pnl: data.pnl
  })).sort((a, b) => b.pnl - a.pnl);

  const mostProfitableStrategy = strategyEffectiveness.length > 0 && strategyEffectiveness[0].pnl > 0 
    ? strategyEffectiveness[0].name 
    : (strategyEffectiveness[0]?.name || 'N/A');

  // Symbol Breakdown
  const symbolStatsMap = new Map<string, { trades: number; wins: number; pnl: number }>();
  validTrades.forEach(t => {
    const sym = t.symbol.trim();
    const cur = symbolStatsMap.get(sym) || { trades: 0, wins: 0, pnl: 0 };
    cur.trades += 1;
    if (t.netPnl > 0) cur.wins += 1;
    cur.pnl += t.netPnl;
    symbolStatsMap.set(sym, cur);
  });

  const symbolList = Array.from(symbolStatsMap.entries()).map(([name, data]) => ({
    name,
    trades: data.trades,
    winRate: Math.round((data.wins / data.trades) * 100),
    pnl: data.pnl
  }));

  const mostTradedSymbol = symbolList.length > 0 ? symbolList.reduce((p, c) => c.trades > p.trades ? c : p, symbolList[0]).name : 'N/A';
  const mostProfitableSymbol = symbolList.length > 0 ? symbolList.reduce((p, c) => c.pnl > p.pnl ? c : p, symbolList[0]) : null;
  const leastProfitableSymbol = symbolList.length > 0 ? symbolList.reduce((p, c) => c.pnl < p.pnl ? c : p, symbolList[0]) : null;
  const highestWinRateSymbol = symbolList.length > 0 ? symbolList.reduce((p, c) => c.winRate > p.winRate ? c : p, symbolList[0]) : null;
  const lowestWinRateSymbol = symbolList.length > 0 ? symbolList.reduce((p, c) => c.winRate < p.winRate ? c : p, symbolList[0]) : null;

  // Weekday Analytics (Monday = 1, Tuesday = 2, Wednesday = 3, Thursday = 4, Friday = 5)
  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const weekdayStats: Record<string, { trades: number; wins: number; pnl: number; charges: number; rrList: number[] }> = {
    Monday: { trades: 0, wins: 0, pnl: 0, charges: 0, rrList: [] },
    Tuesday: { trades: 0, wins: 0, pnl: 0, charges: 0, rrList: [] },
    Wednesday: { trades: 0, wins: 0, pnl: 0, charges: 0, rrList: [] },
    Thursday: { trades: 0, wins: 0, pnl: 0, charges: 0, rrList: [] },
    Friday: { trades: 0, wins: 0, pnl: 0, charges: 0, rrList: [] }
  };

  validTrades.forEach(t => {
    const dayIdx = new Date(t.date).getDay(); // 0 = Sun, 1 = Mon, ...
    const dayName = weekdays[dayIdx - 1];
    if (dayName && weekdayStats[dayName]) {
      weekdayStats[dayName].trades += 1;
      if (t.netPnl > 0) weekdayStats[dayName].wins += 1;
      weekdayStats[dayName].pnl += t.netPnl;
      weekdayStats[dayName].charges += (t.fees || 0);
      weekdayStats[dayName].rrList.push(2.0); // default base R:R
    }
  });

  const weekdayPnlList = Object.entries(weekdayStats).filter(([_, data]) => data.trades > 0);
  const mostProfitableWeekday = weekdayPnlList.length > 0 
    ? weekdayPnlList.reduce((p, c) => c[1].pnl > p[1].pnl ? c : p, weekdayPnlList[0])[0] 
    : 'None';
  const leastProfitableWeekday = weekdayPnlList.length > 0 
    ? weekdayPnlList.reduce((p, c) => c[1].pnl < p[1].pnl ? c : p, weekdayPnlList[0])[0] 
    : 'None';

  // Daily Trade Activity
  const avgTradesPerDay = tradingDays > 0 ? Number((totalTrades / tradingDays).toFixed(1)) : 0;
  const maxTradesInADay = dailyPnls.length > 0 ? Math.max(...dailyPnls.map(d => d.trades)) : 0;
  const daysWithOnly1Trade = dailyPnls.filter(d => d.trades === 1).length;
  const overtradingDays = dailyPnls.filter(d => d.trades >= 7).length;

  // ==========================================
  // Time-of-Day & Hourly Execution Analytics
  // ==========================================
  interface TimeSlotStats {
    key: string;
    name: string;
    label: string;
    description: string;
    trades: number;
    wins: number;
    losses: number;
    grossPnl: number;
    charges: number;
    netPnl: number;
    winRate: number;
    avgPnl: number;
  }

  const sessionSlotsData: Record<string, TimeSlotStats> = {
    opening: { key: 'opening', name: 'Opening Momentum', label: '09:15 - 10:00 AM', description: 'Opening volatility & morning breakout setups', trades: 0, wins: 0, losses: 0, grossPnl: 0, charges: 0, netPnl: 0, winRate: 0, avgPnl: 0 },
    morning: { key: 'morning', name: 'Morning Trend', label: '10:00 - 11:30 AM', description: 'Institutional liquidity & steady trend continuation', trades: 0, wins: 0, losses: 0, grossPnl: 0, charges: 0, netPnl: 0, winRate: 0, avgPnl: 0 },
    midday: { key: 'midday', name: 'Lunch / Chop Zone', label: '11:30 - 01:30 PM', description: 'Low volume, range-bound trap & theta decay', trades: 0, wins: 0, losses: 0, grossPnl: 0, charges: 0, netPnl: 0, winRate: 0, avgPnl: 0 },
    afternoon: { key: 'afternoon', name: 'Afternoon Breakout', label: '01:30 - 02:30 PM', description: 'European market open & second-half expansion', trades: 0, wins: 0, losses: 0, grossPnl: 0, charges: 0, netPnl: 0, winRate: 0, avgPnl: 0 },
    closing: { key: 'closing', name: 'Closing & 3 PM Spike', label: '02:30 - 03:30 PM', description: 'Hero-Zero gamma spikes & closing volume', trades: 0, wins: 0, losses: 0, grossPnl: 0, charges: 0, netPnl: 0, winRate: 0, avgPnl: 0 }
  };

  const hourlySlotsData: Record<string, TimeSlotStats> = {
    '09:00 - 10:00': { key: '09:00 - 10:00', name: '09:00 - 10:00 AM', label: '09:00 - 10:00 AM', description: 'Market Opening Surge', trades: 0, wins: 0, losses: 0, grossPnl: 0, charges: 0, netPnl: 0, winRate: 0, avgPnl: 0 },
    '10:00 - 11:00': { key: '10:00 - 11:00', name: '10:00 - 11:00 AM', label: '10:00 - 11:00 AM', description: 'Mid-Morning Continuation', trades: 0, wins: 0, losses: 0, grossPnl: 0, charges: 0, netPnl: 0, winRate: 0, avgPnl: 0 },
    '11:00 - 12:00': { key: '11:00 - 12:00', name: '11:00 - 12:00 PM', label: '11:00 - 12:00 PM', description: 'Late Morning Consolidation', trades: 0, wins: 0, losses: 0, grossPnl: 0, charges: 0, netPnl: 0, winRate: 0, avgPnl: 0 },
    '12:00 - 13:00': { key: '12:00 - 13:00', name: '12:00 - 01:00 PM', label: '12:00 - 01:00 PM', description: 'Lunch Chop & Sideways', trades: 0, wins: 0, losses: 0, grossPnl: 0, charges: 0, netPnl: 0, winRate: 0, avgPnl: 0 },
    '13:00 - 14:00': { key: '13:00 - 14:00', name: '01:00 - 02:00 PM', label: '01:00 - 02:00 PM', description: 'Early Afternoon Sweep', trades: 0, wins: 0, losses: 0, grossPnl: 0, charges: 0, netPnl: 0, winRate: 0, avgPnl: 0 },
    '14:00 - 15:30': { key: '14:00 - 15:30', name: '02:00 - 03:30 PM', label: '02:00 - 03:30 PM', description: 'Power Hour & 3 PM Move', trades: 0, wins: 0, losses: 0, grossPnl: 0, charges: 0, netPnl: 0, winRate: 0, avgPnl: 0 }
  };

  validTrades.forEach(t => {
    const timeStr = (t.time || '10:00').trim();
    const parts = timeStr.split(':');
    const h = parseInt(parts[0] || '10', 10);
    const m = parseInt(parts[1] || '0', 10);
    const timeInMins = h * 60 + m;

    // Classify Session
    let sessionKey = 'morning';
    if (timeInMins >= 9 * 60 + 15 && timeInMins < 10 * 60) sessionKey = 'opening';
    else if (timeInMins >= 10 * 60 && timeInMins < 11 * 60 + 30) sessionKey = 'morning';
    else if (timeInMins >= 11 * 60 + 30 && timeInMins < 13 * 60 + 30) sessionKey = 'midday';
    else if (timeInMins >= 13 * 60 + 30 && timeInMins < 14 * 60 + 30) sessionKey = 'afternoon';
    else if (timeInMins >= 14 * 60 + 30) sessionKey = 'closing';

    const s = sessionSlotsData[sessionKey];
    if (s) {
      s.trades += 1;
      if (t.netPnl > 0) s.wins += 1;
      else if (t.netPnl < 0) s.losses += 1;
      s.grossPnl += (t.pnl || t.netPnl);
      s.charges += (t.fees || 0);
      s.netPnl += t.netPnl;
    }

    // Classify Hour
    let hourKey = '10:00 - 11:00';
    if (h <= 9) hourKey = '09:00 - 10:00';
    else if (h === 10) hourKey = '10:00 - 11:00';
    else if (h === 11) hourKey = '11:00 - 12:00';
    else if (h === 12) hourKey = '12:00 - 13:00';
    else if (h === 13) hourKey = '13:00 - 14:00';
    else if (h >= 14) hourKey = '14:00 - 15:30';

    const hr = hourlySlotsData[hourKey];
    if (hr) {
      hr.trades += 1;
      if (t.netPnl > 0) hr.wins += 1;
      else if (t.netPnl < 0) hr.losses += 1;
      hr.grossPnl += (t.pnl || t.netPnl);
      hr.charges += (t.fees || 0);
      hr.netPnl += t.netPnl;
    }
  });

  Object.values(sessionSlotsData).forEach(s => {
    s.winRate = s.trades > 0 ? Math.round((s.wins / s.trades) * 100) : 0;
    s.avgPnl = s.trades > 0 ? Number((s.netPnl / s.trades).toFixed(2)) : 0;
  });

  Object.values(hourlySlotsData).forEach(h => {
    h.winRate = h.trades > 0 ? Math.round((h.wins / h.trades) * 100) : 0;
    h.avgPnl = h.trades > 0 ? Number((h.netPnl / h.trades).toFixed(2)) : 0;
  });

  const sessionList = Object.values(sessionSlotsData);
  const activeSessions = sessionList.filter(s => s.trades > 0);
  const mostProfitableTimeSession = activeSessions.length > 0
    ? activeSessions.reduce((prev, cur) => cur.netPnl > prev.netPnl ? cur : prev, activeSessions[0])
    : null;
  const leastProfitableTimeSession = activeSessions.length > 0
    ? activeSessions.reduce((prev, cur) => cur.netPnl < prev.netPnl ? cur : prev, activeSessions[0])
    : null;

  const hourlyList = Object.values(hourlySlotsData);
  const activeHours = hourlyList.filter(h => h.trades > 0);
  const mostProfitableHour = activeHours.length > 0
    ? activeHours.reduce((prev, cur) => cur.netPnl > prev.netPnl ? cur : prev, activeHours[0])
    : null;
  const highestWinRateHour = activeHours.length > 0
    ? activeHours.reduce((prev, cur) => cur.winRate > prev.winRate ? cur : prev, activeHours[0])
    : null;

  // ==========================================
  // Psychology & Behavioral Calculations
  // ==========================================
  const mistakesList = getMistakesBreakdown(validTrades);

  const emotionMapData: Record<string, { name: string; icon: string; desc: string; trades: number; wins: number; losses: number; netPnl: number; winRate: number }> = {
    Disciplined: { name: 'Disciplined & Calm', icon: '🧘', desc: 'Executed strictly according to rules', trades: 0, wins: 0, losses: 0, netPnl: 0, winRate: 0 },
    FOMO: { name: 'FOMO (Chasing)', icon: '⚡', desc: 'Chased moving candles without setup', trades: 0, wins: 0, losses: 0, netPnl: 0, winRate: 0 },
    Greed: { name: 'Greed / Overconfidence', icon: '💰', desc: 'Over-leveraged or refused to book target', trades: 0, wins: 0, losses: 0, netPnl: 0, winRate: 0 },
    Revenge: { name: 'Revenge Trading', icon: '🔥', desc: 'Emotional impulse after taking a loss', trades: 0, wins: 0, losses: 0, netPnl: 0, winRate: 0 },
    Fear: { name: 'Fear / Hesitation', icon: '😨', desc: 'Exited early or hesitated on valid entry', trades: 0, wins: 0, losses: 0, netPnl: 0, winRate: 0 },
    Anxious: { name: 'Anxious / Stressed', icon: '😰', desc: 'Over-sizing caused excessive heartbeat', trades: 0, wins: 0, losses: 0, netPnl: 0, winRate: 0 }
  };

  validTrades.forEach(t => {
    const emo = (t.emotion || 'Disciplined').trim();
    let matchedKey = 'Disciplined';
    if (emo.includes('FOMO')) matchedKey = 'FOMO';
    else if (emo.includes('Greed')) matchedKey = 'Greed';
    else if (emo.includes('Revenge')) matchedKey = 'Revenge';
    else if (emo.includes('Fear')) matchedKey = 'Fear';
    else if (emo.includes('Anxious')) matchedKey = 'Anxious';
    else matchedKey = 'Disciplined';

    const entry = emotionMapData[matchedKey];
    if (entry) {
      entry.trades += 1;
      if (t.netPnl > 0) entry.wins += 1;
      else if (t.netPnl < 0) entry.losses += 1;
      entry.netPnl += t.netPnl;
    }
  });

  Object.values(emotionMapData).forEach(e => {
    e.winRate = e.trades > 0 ? Math.round((e.wins / e.trades) * 100) : 0;
  });

  const emotionList = Object.values(emotionMapData);
  const revengeCount = validTrades.filter(t => t.emotion === 'Revenge').length;

  // Confidence Level correlation
  const confidenceRanges = {
    high: { range: 'High Conviction (80-100%)', desc: 'A+ Setup with multi-timeframe confluence', trades: 0, wins: 0, pnl: 0, winRate: 0 },
    mid: { range: 'Medium Conviction (50-70%)', desc: 'Standard setup with partial confluence', trades: 0, wins: 0, pnl: 0, winRate: 0 },
    low: { range: 'Low Conviction (0-40%)', desc: 'Impulsive or doubtful execution', trades: 0, wins: 0, pnl: 0, winRate: 0 }
  };

  validTrades.forEach(t => {
    const c = t.confidence !== undefined ? t.confidence : 80;
    let bucket = confidenceRanges.high;
    if (c >= 80) bucket = confidenceRanges.high;
    else if (c >= 50) bucket = confidenceRanges.mid;
    else bucket = confidenceRanges.low;

    bucket.trades += 1;
    if (t.netPnl > 0) bucket.wins += 1;
    bucket.pnl += t.netPnl;
  });

  Object.values(confidenceRanges).forEach(b => {
    b.winRate = b.trades > 0 ? Math.round((b.wins / b.trades) * 100) : 0;
  });

  const confidenceList = Object.values(confidenceRanges);

  const getMistakePrescription = (mistakeName: string): string => {
    const fixes: Record<string, string> = {
      'Exited Early': 'Position ko 2 parts mein divide karein: 50% Qty 1:1.5 par aur remaining 50% ko Cost SL ke sath hold karein.',
      'FOMO Entry': 'Market aage nikal gaya to retest ka wait karein; green candle ko chase na karein.',
      'Ignored Stoploss': 'System Stop Loss order lagayein, mental SL kabhi execute nahi hota.',
      'Overtrading': 'Daily maximum 3 trades ka hard rule set karein. Target ya max loss hit hote hi terminal band karein.',
      'Revenge Trading': 'Loss lene ke baad kam se kam 30 minute ke liye chart se dur walk par jayein.',
      'Averaging Down': 'Losing position mein kabhi add mat karein; sirf winning position mein pyramid karein.',
      'Chasing Price': 'Limit order lagakar apne price aane ka intezar karein.'
    };
    return fixes[mistakeName] || 'Strict checklist aur risk management rules follow karein.';
  };

  // ==========================================
  // Comprehensive Risk Analytics Calculations
  // ==========================================
  let peakPnl = 0;
  let maxDrawdown = 0;
  let runningPnlTrack = 0;

  sortedTrades.forEach(t => {
    runningPnlTrack += t.netPnl;
    if (runningPnlTrack > peakPnl) {
      peakPnl = runningPnlTrack;
    }
    const dd = peakPnl - runningPnlTrack;
    if (dd > maxDrawdown) {
      maxDrawdown = dd;
    }
  });

  const cumulativeNetPnl = totalWinPnl - totalLossPnl;
  const recoveryFactor = maxDrawdown > 0 ? Number((cumulativeNetPnl / maxDrawdown).toFixed(2)) : (cumulativeNetPnl > 0 ? 10 : 0);
  const profitFactorVal = totalLossPnl > 0 ? Number((totalWinPnl / totalLossPnl).toFixed(2)) : (totalWinPnl > 0 ? 99.9 : 0);
  const payoffRatioVal = avgLoss > 0 ? Number((avgWin / avgLoss).toFixed(2)) : (avgWin > 0 ? 10 : 0);

  interface RrBracket {
    name: string;
    label: string;
    desc: string;
    trades: number;
    wins: number;
    losses: number;
    pnl: number;
    winRate: number;
  }

  const rrBrackets: Record<string, RrBracket> = {
    high: { name: 'High R:R (> 1:2.0)', label: '> 1:2.0', desc: 'Asymmetrical payout setups', trades: 0, wins: 0, losses: 0, pnl: 0, winRate: 0 },
    medium: { name: 'Optimal R:R (1:1.5 - 1:2.0)', label: '1:1.5 - 1:2.0', desc: 'Standard target setups', trades: 0, wins: 0, losses: 0, pnl: 0, winRate: 0 },
    low: { name: 'Base R:R (1:1.0 - 1:1.5)', label: '1:1.0 - 1:1.5', desc: 'Quick scalps / momentum', trades: 0, wins: 0, losses: 0, pnl: 0, winRate: 0 },
    sub: { name: 'Inverted R:R (< 1:1.0)', label: '< 1:1.0', desc: 'Higher risk than reward', trades: 0, wins: 0, losses: 0, pnl: 0, winRate: 0 }
  };

  validTrades.forEach(t => {
    const rrStr = t.riskReward || '1:2.0';
    const multiplier = parseFloat(rrStr.replace('1:', '').trim()) || 2.0;

    let targetBracket = rrBrackets.medium;
    if (multiplier >= 2.0) targetBracket = rrBrackets.high;
    else if (multiplier >= 1.5) targetBracket = rrBrackets.medium;
    else if (multiplier >= 1.0) targetBracket = rrBrackets.low;
    else targetBracket = rrBrackets.sub;

    targetBracket.trades += 1;
    if (t.netPnl > 0) targetBracket.wins += 1;
    else if (t.netPnl < 0) targetBracket.losses += 1;
    targetBracket.pnl += t.netPnl;
  });

  Object.values(rrBrackets).forEach(b => {
    b.winRate = b.trades > 0 ? Math.round((b.wins / b.trades) * 100) : 0;
  });

  const rrBracketList = Object.values(rrBrackets);

  const calculatedRiskList = validTrades.map(t => {
    const riskPts = t.stopLoss ? Math.abs(t.entryPrice - t.stopLoss) : (t.entryPrice * 0.1);
    const riskInRupees = Math.round(riskPts * t.quantity);
    return {
      symbol: t.symbol,
      riskAmount: riskInRupees,
      netPnl: t.netPnl,
      amount: t.totalAmount || (t.entryPrice * t.quantity)
    };
  });

  const maxRiskAmount = calculatedRiskList.length > 0 ? Math.max(...calculatedRiskList.map(r => r.riskAmount)) : 0;
  const avgRiskAmount = calculatedRiskList.length > 0 ? Math.round(calculatedRiskList.reduce((s, r) => s + r.riskAmount, 0) / calculatedRiskList.length) : 0;

  return (
    <div className="space-y-6">
      {/* Top Header with Navigation Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#111a2e] light:bg-white p-5 rounded-3xl border border-[#1e2942] light:border-slate-200 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white light:text-slate-900 tracking-tight flex items-center gap-2">
              Performance & Trading Reports
            </h2>
            <p className="text-xs text-slate-400">
              In-depth execution quality, hourly time-slot analysis, and psychological metrics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap">
          <button
            onClick={exportCsv}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#16223b] light:bg-slate-100 hover:bg-[#202f50] text-slate-300 light:text-slate-800 text-xs font-semibold border border-[#23355b] cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Sub-tabs Ribbon matching tradediary.in */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#0e1628] light:bg-slate-200 border border-[#1e2942] light:border-slate-300 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveReportTab('Performance')}
          className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeReportTab === 'Performance'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#16223b]/60'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Performance</span>
        </button>

        <button
          onClick={() => setActiveReportTab('Time of Day')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
            activeReportTab === 'Time of Day'
              ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 font-black shadow-lg shadow-amber-500/30 border border-amber-300'
              : 'bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 text-amber-400 border border-amber-500/40 hover:bg-amber-500/25 hover:border-amber-400 shadow-sm shadow-amber-500/10'
          }`}
        >
          <Clock className={`w-4 h-4 ${activeReportTab === 'Time of Day' ? 'text-slate-950 stroke-[2.5]' : 'text-amber-400'}`} />
          <span>Time of Day</span>
          <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
            activeReportTab === 'Time of Day'
              ? 'bg-slate-950/20 text-slate-950'
              : 'bg-amber-400/20 text-amber-300 border border-amber-400/40 animate-pulse'
          }`}>
            ⚡ NEW
          </span>
        </button>

        <button
          onClick={() => setActiveReportTab('Psychology')}
          className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeReportTab === 'Psychology'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#16223b]/60'
          }`}
        >
          <Brain className="w-4 h-4" />
          <span>Psychology</span>
        </button>

        <button
          onClick={() => setActiveReportTab('Risk')}
          className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeReportTab === 'Risk'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#16223b]/60'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Risk</span>
        </button>

        <button
          onClick={() => setActiveReportTab('Journal')}
          className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeReportTab === 'Journal'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#16223b]/60'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Journal</span>
        </button>

        {/* 🚨 Bad Day Recovery SOS Button */}
        <button
          onClick={() => setActiveReportTab('Bad Day Reset SOS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer relative shrink-0 ${
            activeReportTab === 'Bad Day Reset SOS'
              ? 'bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 text-white shadow-lg shadow-rose-600/40 border border-rose-400 animate-pulse'
              : 'bg-gradient-to-r from-rose-500/20 via-red-500/15 to-amber-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30 hover:border-rose-400'
          }`}
        >
          <AlertOctagon className="w-4 h-4 text-rose-400 animate-bounce" />
          <span>🚨 Bad Day Recovery SOS</span>
          <span className="px-1.5 py-0.5 rounded text-[9px] bg-rose-950/80 text-rose-300 border border-rose-500/40 font-mono font-black">
            RESET
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: PERFORMANCE (12 Comprehensive Cards matching screenshots) */}
      {/* ========================================================================= */}
      {activeReportTab === 'Performance' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          
          {/* Card 1: Trade Performance */}
          <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400">Trade Performance</span>
                <div className="text-2xl font-black mt-1">
                  <span className="text-emerald-400">{winCount}</span> <span className="text-slate-500">/</span> <span className="text-rose-400">{lossCount}</span> <span className="text-slate-500">/</span> <span className="text-slate-400">{breakEvenCount}</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Win / Loss / Break Even</p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
                <Trophy className="w-5 h-5" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1e2942] text-xs">
              <div className="p-2.5 rounded-xl bg-[#16223b] light:bg-slate-50 border border-[#23355b]">
                <span className="text-[10px] text-slate-400">Avg Win</span>
                <p className="font-bold text-emerald-400 mt-0.5">{formatINR(avgWin)}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-[#16223b] light:bg-slate-50 border border-[#23355b]">
                <span className="text-[10px] text-slate-400">Avg Loss</span>
                <p className="font-bold text-rose-400 mt-0.5">{avgLoss > 0 ? `-${formatINR(avgLoss)}` : '₹0'}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-[#16223b] light:bg-slate-50 border border-[#23355b]">
                <span className="text-[10px] text-slate-400">Win Rate</span>
                <p className="font-bold text-white light:text-slate-900 mt-0.5">{winRate}%</p>
              </div>
              <div className="p-2.5 rounded-xl bg-[#16223b] light:bg-slate-50 border border-[#23355b]">
                <span className="text-[10px] text-slate-400">Expectancy</span>
                <p className={`font-bold mt-0.5 ${expectancy >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {expectancy >= 0 ? '+' : ''}{formatINR(expectancy)}
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Daily Performance */}
          <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400">Daily Performance</span>
                <div className="text-2xl font-black mt-1">
                  <span className="text-emerald-400">{winDays}</span> <span className="text-slate-500">/</span> <span className="text-rose-400">{lossDays}</span> <span className="text-slate-500">/</span> <span className="text-slate-400">{breakEvenDays}</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Win / Loss / Break Even Days</p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1e2942] text-xs">
              <div className="p-2.5 rounded-xl bg-[#16223b] light:bg-slate-50 border border-[#23355b]">
                <span className="text-[10px] text-slate-400">Best Day</span>
                <p className="font-bold text-emerald-400 mt-0.5">{bestDay > 0 ? `+${formatINR(bestDay)}` : '₹0'}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-[#16223b] light:bg-slate-50 border border-[#23355b]">
                <span className="text-[10px] text-slate-400">Worst Day</span>
                <p className="font-bold text-rose-400 mt-0.5">{worstDay < 0 ? formatINR(worstDay) : '₹0'}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-[#16223b] light:bg-slate-50 border border-[#23355b]">
                <span className="text-[10px] text-slate-400">Avg Win Day</span>
                <p className="font-bold text-emerald-400 mt-0.5">{formatINR(avgWinDay)}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-[#16223b] light:bg-slate-50 border border-[#23355b]">
                <span className="text-[10px] text-slate-400">Avg Loss Day</span>
                <p className="font-bold text-rose-400 mt-0.5">{avgLossDay > 0 ? `-${formatINR(avgLossDay)}` : '₹0'}</p>
              </div>
            </div>
          </div>

          {/* Card 3: Trade Execution */}
          <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Trade Execution</span>
              <div className="w-10 h-10 rounded-2xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
                <ArrowRightLeft className="w-5 h-5" />
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-[#1e2942]">
                <span className="text-slate-400">Total Trades</span>
                <span className="font-bold text-white light:text-slate-900 font-mono">{totalTrades}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#1e2942]">
                <span className="text-slate-400">Avg Capital Used</span>
                <span className="font-bold text-white light:text-slate-900 font-mono">{formatINR(avgCapitalUsed)}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#1e2942]">
                <span className="text-slate-400">Most Profitable Strategy</span>
                <span className="font-bold text-emerald-400">{mostProfitableStrategy}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#1e2942]">
                <span className="text-slate-400">Consecutive Wins</span>
                <span className="font-bold text-emerald-400 font-mono">{consecutiveWins}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400">Consecutive Losses</span>
                <span className="font-bold text-rose-400 font-mono">{consecutiveLosses}</span>
              </div>
            </div>
          </div>

          {/* Card 4: Time Metrics */}
          <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Time Metrics</span>
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-[#1e2942]">
                <span className="text-slate-400">Trading Days</span>
                <span className="font-bold text-white light:text-slate-900 font-mono">{tradingDays}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#1e2942]">
                <span className="text-slate-400">Consecutive Win Days</span>
                <span className="font-bold text-emerald-400 font-mono">{consecutiveWinDays}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#1e2942]">
                <span className="text-slate-400">Consecutive Loss Days</span>
                <span className="font-bold text-rose-400 font-mono">{consecutiveLossDays}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#1e2942]">
                <span className="text-slate-400">Most Profitable Day</span>
                <span className="font-bold text-emerald-400">{mostProfitableWeekday}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400">Least Profitable Day</span>
                <span className="font-bold text-slate-400">{leastProfitableWeekday}</span>
              </div>
            </div>
          </div>

          {/* Card 5: Setup Effectiveness */}
          <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Setup Effectiveness</span>
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>

            <div className="space-y-2.5 text-xs max-h-52 overflow-y-auto no-scrollbar">
              {strategyEffectiveness.length === 0 ? (
                <p className="text-slate-500 text-[11px] py-4 text-center">No strategy trades executed yet</p>
              ) : (
                strategyEffectiveness.map((s) => (
                  <div key={s.name} className="flex items-center justify-between py-1 border-b border-[#1e2942]">
                    <span className="text-slate-300 light:text-slate-700 font-medium truncate max-w-[150px]">{s.name}</span>
                    <span className={`font-bold font-mono ${s.winRate >= 50 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {s.winRate}% win rate
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Card 6: Symbol Frequency */}
          <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Symbol Frequency</span>
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-[#1e2942]">
                <span className="text-slate-400">Most Traded Symbol</span>
                <span className="font-bold text-white light:text-slate-900 truncate max-w-[140px]">{mostTradedSymbol}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#1e2942]">
                <span className="text-slate-400">Most Profitable Symbol</span>
                <span className="font-bold text-emerald-400 truncate max-w-[140px]">{mostProfitableSymbol?.name || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#1e2942]">
                <span className="text-slate-400">Least Profitable Symbol</span>
                <span className="font-bold text-rose-400 truncate max-w-[140px]">{leastProfitableSymbol?.name || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#1e2942]">
                <span className="text-slate-400">Highest Win Rate</span>
                <span className="font-bold text-emerald-400">{highestWinRateSymbol ? `${highestWinRateSymbol.winRate}%` : 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400">Lowest Win Rate</span>
                <span className="font-bold text-rose-400">{lowestWinRateSymbol ? `${lowestWinRateSymbol.winRate}%` : 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Card 7: Capital Usage */}
          <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Capital Usage</span>
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-[#1e2942]">
                <span className="text-slate-400">Maximum</span>
                <span className="font-bold text-white light:text-slate-900 font-mono">{formatINR(maxCapitalTrade?.amount || 0)}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#1e2942]">
                <span className="text-slate-400">Minimum</span>
                <span className="font-bold text-white light:text-slate-900 font-mono">{formatINR(minCapitalTrade?.amount || 0)}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#1e2942]">
                <span className="text-slate-400">Average</span>
                <span className="font-bold text-white light:text-slate-900 font-mono">{formatINR(avgCapitalUsed)}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#1e2942]">
                <span className="text-slate-400">P&L at Max Capital</span>
                <span className={`font-bold font-mono ${(maxCapitalTrade?.pnl || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {(maxCapitalTrade?.pnl || 0) >= 0 ? '+' : ''}{formatINR(maxCapitalTrade?.pnl || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400">P&L at Min Capital</span>
                <span className={`font-bold font-mono ${(minCapitalTrade?.pnl || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {(minCapitalTrade?.pnl || 0) >= 0 ? '+' : ''}{formatINR(minCapitalTrade?.pnl || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Card 8: Quantity Analysis */}
          <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Quantity Analysis</span>
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-[#1e2942]">
                <span className="text-slate-400">Maximum</span>
                <span className="font-bold text-white light:text-slate-900 font-mono">{maxQtyTrade?.qty || 0}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#1e2942]">
                <span className="text-slate-400">Minimum</span>
                <span className="font-bold text-white light:text-slate-900 font-mono">{minQtyTrade?.qty || 0}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#1e2942]">
                <span className="text-slate-400">Average</span>
                <span className="font-bold text-white light:text-slate-900 font-mono">{Math.round(avgQty)}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#1e2942]">
                <span className="text-slate-400">P&L at Max Qty</span>
                <span className={`font-bold font-mono ${(maxQtyTrade?.pnl || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {(maxQtyTrade?.pnl || 0) >= 0 ? '+' : ''}{formatINR(maxQtyTrade?.pnl || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400">P&L at Min Qty</span>
                <span className={`font-bold font-mono ${(minQtyTrade?.pnl || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {(minQtyTrade?.pnl || 0) >= 0 ? '+' : ''}{formatINR(minQtyTrade?.pnl || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Card 9: Weekday Avg R:R */}
          <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Weekday Avg R:R</span>
              <div className="w-10 h-10 rounded-2xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
                <Scale className="w-5 h-5" />
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              {weekdays.map((day) => {
                const dayData = weekdayStats[day];
                const hasTrades = dayData.trades > 0;
                return (
                  <div key={day} className="flex items-center justify-between py-1 border-b border-[#1e2942] last:border-0">
                    <span className="text-slate-300 light:text-slate-700">{day}</span>
                    <span className="font-bold text-white light:text-slate-900 font-mono">
                      {hasTrades ? '1:2.0' : '1:0'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 10: Weekday Win Rate */}
          <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Weekday Win Rate</span>
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
                <CalendarDays className="w-5 h-5" />
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              {weekdays.map((day) => {
                const dayData = weekdayStats[day];
                const dayWinRate = dayData.trades > 0 ? Math.round((dayData.wins / dayData.trades) * 100) : 0;
                return (
                  <div key={day} className="flex items-center justify-between py-1 border-b border-[#1e2942] last:border-0">
                    <span className="text-slate-300 light:text-slate-700">{day}</span>
                    <span className={`font-bold font-mono ${dayData.trades === 0 ? 'text-slate-500' : dayWinRate >= 50 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {dayData.trades > 0 ? `${dayWinRate}%` : '0%'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 11: Daily Charges */}
          <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Daily Charges</span>
              <div className="w-10 h-10 rounded-2xl bg-rose-500/15 text-rose-400 flex items-center justify-center">
                <Receipt className="w-5 h-5" />
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              {weekdays.map((day) => {
                const dayData = weekdayStats[day];
                return (
                  <div key={day} className="flex items-center justify-between py-1 border-b border-[#1e2942] last:border-0">
                    <span className="text-slate-300 light:text-slate-700">{day}</span>
                    <span className="font-bold text-white light:text-slate-900 font-mono">
                      {formatINR(dayData.charges)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 12: Daily Trade Activity */}
          <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Daily Trade Activity</span>
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-[#1e2942]">
                <span className="text-slate-400">Avg Trades Per Day</span>
                <span className="font-bold text-white light:text-slate-900 font-mono">{avgTradesPerDay}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#1e2942]">
                <span className="text-slate-400">Max Trades in a Day</span>
                <span className="font-bold text-white light:text-slate-900 font-mono">{maxTradesInADay}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#1e2942]">
                <span className="text-slate-400">Days With Only 1 Trade</span>
                <span className="font-bold text-white light:text-slate-900 font-mono">{daysWithOnly1Trade}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400">Overtrading Days (&gt;7 trades)</span>
                <span className={`font-bold font-mono ${overtradingDays > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>{overtradingDays}</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: TIME OF DAY / HOURLY EXECUTION PERFORMANCE */}
      {/* ========================================================================= */}
      {activeReportTab === 'Time of Day' && (
        <div className="space-y-6">
          {/* Executive Time Performance Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Most Profitable Window */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-[#111a2e] to-[#162746] light:bg-white border border-emerald-500/30 shadow-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">Prime Golden Window</span>
                <span className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <Sparkles className="w-4 h-4" />
                </span>
              </div>
              <div className="text-lg font-black text-emerald-400">
                {mostProfitableTimeSession ? mostProfitableTimeSession.label : '09:15 - 10:00 AM'}
              </div>
              <p className="text-xs text-slate-300 light:text-slate-600 font-mono font-bold">
                Net P&L: <span className="text-emerald-400">{formatINR(mostProfitableTimeSession?.netPnl || 0)}</span> ({mostProfitableTimeSession?.winRate || 0}% Win Rate)
              </p>
            </div>

            {/* Card 2: Highest Win Rate Hour */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-[#111a2e] to-[#1a233d] light:bg-white border border-blue-500/30 shadow-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">Peak Accuracy Hour</span>
                <span className="p-1.5 rounded-xl bg-blue-500/10 text-blue-400">
                  <Target className="w-4 h-4" />
                </span>
              </div>
              <div className="text-lg font-black text-blue-400 font-mono">
                {highestWinRateHour ? highestWinRateHour.name : '09:00 - 10:00 AM'}
              </div>
              <p className="text-xs text-slate-300 light:text-slate-600 font-mono font-bold">
                Win Rate: <span className="text-blue-400">{highestWinRateHour?.winRate || 0}%</span> ({highestWinRateHour?.wins || 0}W / {highestWinRateHour?.losses || 0}L)
              </p>
            </div>

            {/* Card 3: Worst / Drawdown Time Window */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-[#111a2e] to-[#2d1b2a] light:bg-white border border-rose-500/30 shadow-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">Chop / Drawdown Zone</span>
                <span className="p-1.5 rounded-xl bg-rose-500/10 text-rose-400">
                  <AlertTriangle className="w-4 h-4" />
                </span>
              </div>
              <div className="text-lg font-black text-rose-400">
                {leastProfitableTimeSession && leastProfitableTimeSession.netPnl < 0 ? leastProfitableTimeSession.label : 'None (No Loss Sessions)'}
              </div>
              <p className="text-xs text-slate-300 light:text-slate-600 font-mono font-bold">
                {leastProfitableTimeSession && leastProfitableTimeSession.netPnl < 0 
                  ? `Net P&L: ${formatINR(leastProfitableTimeSession.netPnl)} (${leastProfitableTimeSession.trades} trades)`
                  : 'All trading hours profitable!'}
              </p>
            </div>

            {/* Card 4: Opening Session Dominance */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-[#111a2e] to-[#182645] light:bg-white border border-indigo-500/30 shadow-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">Total F&O Trading Time</span>
                <span className="p-1.5 rounded-xl bg-indigo-500/10 text-indigo-400">
                  <Clock className="w-4 h-4" />
                </span>
              </div>
              <div className="text-lg font-black text-white light:text-slate-900 font-mono">
                09:15 AM - 03:30 PM
              </div>
              <p className="text-xs text-slate-400">
                Active in <strong className="text-indigo-400">{activeSessions.length} session(s)</strong> across {totalTrades} executed trades
              </p>
            </div>
          </div>

          {/* Section 1: Market Session Breakdown Cards */}
          <div className="p-6 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1e2942] pb-4">
              <div>
                <h3 className="text-base font-black text-white light:text-slate-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyan-400" />
                  Indian F&O Market Sessions Analysis
                </h3>
                <p className="text-xs text-slate-400">
                  Profit & Loss, win rate, and brokerage distribution broken down by market phase
                </p>
              </div>
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 w-fit">
                NSE / BSE Derivatives Timeline
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sessionList.map((slot) => {
                const isProfitable = slot.netPnl > 0;
                const hasTrades = slot.trades > 0;
                return (
                  <div
                    key={slot.key}
                    className={`p-4 rounded-2xl border transition-all ${
                      hasTrades 
                        ? isProfitable
                          ? 'bg-[#14213d]/60 light:bg-emerald-50/50 border-emerald-500/30'
                          : 'bg-[#291726]/60 light:bg-rose-50/50 border-rose-500/30'
                        : 'bg-[#111a2e]/60 light:bg-slate-50 border-[#1e2942] opacity-70'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h4 className="font-bold text-sm text-white light:text-slate-900">{slot.name}</h4>
                        <span className="text-[11px] font-mono text-cyan-400 font-semibold">{slot.label}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black font-mono ${
                        !hasTrades 
                          ? 'bg-slate-800 text-slate-400' 
                          : isProfitable 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}>
                        {hasTrades ? `${slot.winRate}% Win Rate` : 'No Trades'}
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-400 mb-3">{slot.description}</p>

                    <div className="space-y-1.5 text-xs pt-2 border-t border-white/5">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Total Trades</span>
                        <span className="font-bold font-mono text-white light:text-slate-900">{slot.trades}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Gross Realised P&L</span>
                        <span className={`font-bold font-mono ${slot.grossPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {slot.grossPnl >= 0 ? '+' : ''}{formatINR(slot.grossPnl)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Brokerage & Taxes</span>
                        <span className="font-mono text-amber-400">-{formatINR(slot.charges)}</span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-white/5">
                        <span className="font-bold text-slate-300 light:text-slate-700">Net In-Hand P&L</span>
                        <span className={`font-black font-mono text-sm ${slot.netPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {slot.netPnl >= 0 ? '+' : ''}{formatINR(slot.netPnl)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Hour-by-Hour Breakdown Table */}
          <div className="p-6 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1e2942] pb-4">
              <div>
                <h3 className="text-base font-black text-white light:text-slate-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-400" />
                  Hour-by-Hour Execution & P&L Matrix
                </h3>
                <p className="text-xs text-slate-400">
                  Granular performance comparison for every hour of the trading day
                </p>
              </div>
            </div>

            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#16223b] light:bg-slate-100 border-b border-[#1e2942] text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Hour Window</th>
                    <th className="py-3 px-4">Session Type</th>
                    <th className="py-3 px-4 text-center">Trades</th>
                    <th className="py-3 px-4 text-center">Win Rate</th>
                    <th className="py-3 px-4 text-right">Gross P&L</th>
                    <th className="py-3 px-4 text-right">Brokerage & Taxes</th>
                    <th className="py-3 px-4 text-right">Net In-Hand P&L</th>
                    <th className="py-3 px-4 text-right">Avg / Trade</th>
                    <th className="py-3 px-4 text-center">Edge Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2942] light:divide-slate-200">
                  {hourlyList.map((hr) => {
                    const hasTrades = hr.trades > 0;
                    const isWin = hr.netPnl > 0;
                    return (
                      <tr key={hr.key} className="hover:bg-[#16223b]/50 light:hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4 font-bold font-mono text-white light:text-slate-900">
                          {hr.label}
                        </td>
                        <td className="py-3.5 px-4 text-slate-400">
                          {hr.description}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-200 light:text-slate-800">
                          {hr.trades}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-bold">
                          {hasTrades ? (
                            <span className={`px-2 py-0.5 rounded-md ${hr.winRate >= 50 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'}`}>
                              {hr.winRate}%
                            </span>
                          ) : (
                            <span className="text-slate-500">-</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold">
                          {hasTrades ? (
                            <span className={hr.grossPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                              {hr.grossPnl >= 0 ? '+' : ''}{formatINR(hr.grossPnl)}
                            </span>
                          ) : <span className="text-slate-500">₹0.00</span>}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-amber-400 font-medium">
                          {hasTrades ? `-${formatINR(hr.charges)}` : '₹0.00'}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-black">
                          {hasTrades ? (
                            <span className={hr.netPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                              {hr.netPnl >= 0 ? '+' : ''}{formatINR(hr.netPnl)}
                            </span>
                          ) : <span className="text-slate-500">₹0.00</span>}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-300 light:text-slate-700">
                          {hasTrades ? (
                            <span className={hr.avgPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                              {hr.avgPnl >= 0 ? '+' : ''}{formatINR(hr.avgPnl)}
                            </span>
                          ) : '-'}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {!hasTrades ? (
                            <span className="text-[10px] text-slate-500 px-2 py-0.5 rounded bg-slate-800/50">Inactive</span>
                          ) : isWin ? (
                            <span className="text-[10px] font-bold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                              Prime Edge 🚀
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-rose-400 px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30">
                              Chop Zone ⚠️
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: AI Timing Insights & Behavioral Edge Advice */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-blue-900/30 via-indigo-900/20 to-purple-900/30 border border-blue-500/30 shadow-xl flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
              <Zap className="w-5 h-5" />
            </div>
            <div className="space-y-1.5 text-xs leading-relaxed">
              <h4 className="font-black text-sm text-white light:text-slate-900">
                AI Execution Timing Takeaways & Option Buyer Edge
              </h4>
              <p className="text-slate-300 light:text-slate-700">
                • <strong>Opening 09:15 - 10:00 AM:</strong> Market mein maximum option volatility aur delta momentum isi window mein hota hai. Aapka highest profit yahi se ban raha hai.
              </p>
              <p className="text-slate-300 light:text-slate-700">
                • <strong>Midday 11:30 AM - 01:30 PM:</strong> Is window mein smart money sideways pinning aur theta decay karti hai. Option buyers ko is time overtrading se bachna chahiye.
              </p>
              <p className="text-slate-300 light:text-slate-700">
                • <strong>Golden Rule:</strong> Apna daily target agar subah pehle 1-2 trades mein hit ho jaye, to screen close karke capital protect karein! 🛡️
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PSYCHOLOGY & TRADER BEHAVIOR */}
      {/* ========================================================================= */}
      {activeReportTab === 'Psychology' && (
        <div className="space-y-6">
          {/* Executive Behavioral Health Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">Discipline Index</span>
                <Brain className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-3xl font-black text-white light:text-slate-900 font-mono">
                {stats.confidenceScore}%
              </div>
              <p className="text-xs text-emerald-400 font-medium">High Mindset Stability</p>
            </div>

            <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">Plan Adherence</span>
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="text-3xl font-black text-emerald-400 font-mono">
                {validTrades.length > 0 ? Math.round((validTrades.filter(t => t.followedPlan).length / validTrades.length) * 100) : 100}%
              </div>
              <p className="text-xs text-slate-400">Executed strictly by setup checklist</p>
            </div>

            <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">Risk Rule Adherence</span>
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="text-3xl font-black text-indigo-400 font-mono">
                {validTrades.length > 0 ? Math.round((validTrades.filter(t => t.followedRisk).length / validTrades.length) * 100) : 100}%
              </div>
              <p className="text-xs text-slate-400">Strict Stop Loss & Position Sizing</p>
            </div>

            <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">Revenge Trades</span>
                <Zap className="w-5 h-5 text-amber-400" />
              </div>
              <div className="text-3xl font-black text-emerald-400 font-mono">
                {revengeCount}
              </div>
              <p className="text-xs text-emerald-400 font-medium">Clean Emotional Streak 🔥</p>
            </div>
          </div>

          {/* Section 1: Emotion vs P&L Matrix */}
          <div className="p-6 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1e2942] pb-4">
              <div>
                <h3 className="text-base font-black text-white light:text-slate-900 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-400" />
                  Emotional State vs Profitability Matrix
                </h3>
                <p className="text-xs text-slate-400">
                  How your psychological mood directly affects your trading win rate and net P&L
                </p>
              </div>
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 w-fit">
                Behavioral Edge
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {emotionList.map((emo) => {
                const hasTrades = emo.trades > 0;
                const isProfitable = emo.netPnl >= 0;
                return (
                  <div
                    key={emo.name}
                    className={`p-4 rounded-2xl border transition-all ${
                      hasTrades
                        ? isProfitable
                          ? 'bg-[#14213d]/60 light:bg-emerald-50/50 border-emerald-500/30'
                          : 'bg-[#291726]/60 light:bg-rose-50/50 border-rose-500/30'
                        : 'bg-[#111a2e]/60 light:bg-slate-50 border-[#1e2942] opacity-70'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{emo.icon}</span>
                        <div>
                          <h4 className="font-bold text-sm text-white light:text-slate-900">{emo.name}</h4>
                          <span className="text-[10px] text-slate-400">{emo.desc}</span>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black font-mono ${
                        !hasTrades 
                          ? 'bg-slate-800 text-slate-400' 
                          : isProfitable 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}>
                        {hasTrades ? `${emo.winRate}% Win Rate` : '0 Trades'}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs pt-3 border-t border-white/5">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Trades Executed</span>
                        <span className="font-bold font-mono text-white light:text-slate-900">{emo.trades}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Wins / Losses</span>
                        <span className="font-mono text-slate-300">
                          <span className="text-emerald-400 font-bold">{emo.wins}W</span> / <span className="text-rose-400 font-bold">{emo.losses}L</span>
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-white/5">
                        <span className="font-bold text-slate-300 light:text-slate-700">Net Profit / Loss</span>
                        <span className={`font-black font-mono text-sm ${emo.netPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {emo.netPnl >= 0 ? '+' : ''}{formatINR(emo.netPnl)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Mistakes & Capital Leakage Breakdown */}
          <div className="p-6 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1e2942] pb-4">
              <div>
                <h3 className="text-base font-black text-white light:text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  Trading Mistakes & Financial Leakage Analysis
                </h3>
                <p className="text-xs text-slate-400">
                  Exact loss amount caused by psychological trading errors and how to eliminate them
                </p>
              </div>
            </div>

            {mistakesList.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                <p className="font-bold text-emerald-400">Zero Execution Mistakes Recorded! 🎉</p>
                <p className="text-xs text-slate-500">You are following your rules and trade plan perfectly.</p>
              </div>
            ) : (
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#16223b] light:bg-slate-100 border-b border-[#1e2942] text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Mistake Type</th>
                      <th className="py-3 px-4 text-center">Frequency</th>
                      <th className="py-3 px-4 text-right">Capital Loss (₹)</th>
                      <th className="py-3 px-4 text-center">% of Total Loss</th>
                      <th className="py-3 px-4">AI Psychological Fix</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e2942] light:divide-slate-200">
                    {mistakesList.map((m) => (
                      <tr key={m.name} className="hover:bg-[#16223b]/50 light:hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-white light:text-slate-900 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                          <span>{m.name}</span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-200">
                          {m.tradeCount} trade(s)
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-black text-rose-400">
                          -₹{m.totalLoss}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-amber-400">
                          {m.percentage}%
                        </td>
                        <td className="py-3.5 px-4 text-slate-300 light:text-slate-700 text-xs">
                          {getMistakePrescription(m.name)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Section 3: Confidence Correlation & Psychologist Takeaways */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Confidence vs Performance */}
            <div className="p-6 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-4">
              <h3 className="text-base font-black text-white light:text-slate-900 flex items-center gap-2 border-b border-[#1e2942] pb-3">
                <Scale className="w-5 h-5 text-cyan-400" />
                Confidence Level vs Edge Correlation
              </h3>
              <div className="space-y-3 text-xs">
                {confidenceList.map((c) => (
                  <div key={c.range} className="p-3.5 rounded-2xl bg-[#16223b]/60 border border-[#1e2942] flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white light:text-slate-900">{c.range}</div>
                      <div className="text-[11px] text-slate-400">{c.desc} • {c.trades} trade(s)</div>
                    </div>
                    <div className="text-right">
                      <div className={`font-mono font-bold ${c.winRate >= 50 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {c.trades > 0 ? `${c.winRate}% Win Rate` : '-'}
                      </div>
                      <div className={`font-mono font-black text-xs ${c.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {c.trades > 0 ? (c.pnl >= 0 ? '+' : '') + formatINR(c.pnl) : '₹0.00'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Trading Psychologist Advice */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-900/30 via-indigo-900/20 to-blue-900/30 border border-purple-500/30 shadow-xl space-y-4">
              <h3 className="text-base font-black text-white light:text-slate-900 flex items-center gap-2 border-b border-white/10 pb-3">
                <Brain className="w-5 h-5 text-purple-400" />
                AI Trading Psychologist Mindset Prescription
              </h3>
              <div className="space-y-3 text-xs leading-relaxed text-slate-300 light:text-slate-700">
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <p className="font-bold text-purple-300 mb-1">🎯 1. Execution Stability:</p>
                  <p>Aapka revenge trade count <strong>0</strong> hai, jo institutional mindset ka sabse bada indicator hai. Loss lene ke baad market se badla lene ke bajay shant rehna aapki sabse badi strength hai.</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <p className="font-bold text-blue-300 mb-1">⚖️ 2. Target Patience & Early Exits:</p>
                  <p>Target aane se pehle nikalne ke darr ko door karne ke liye position ko 2 parts mein divide karein: 50% Qty 1:1.5 par book karein aur remaining 50% ko Cost-to-Cost (SL to Entry) trail karke pura move capture karein!</p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <p className="font-bold text-emerald-300 mb-1">🛡️ 3. Daily Profit Preservation Rule:</p>
                  <p>Jab subah green mein close ho jaye, to rest of the day ka maximum risk aapke din ke profit ka sirf 20-30% hona chahiye taaki aap kabhi bhi Green Day ko Red Day mein convert na karein!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: RISK MANAGEMENT & CAPITAL PRESERVATION */}
      {/* ========================================================================= */}
      {activeReportTab === 'Risk' && (
        <div className="space-y-6">
          {/* Executive Risk Management Health Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Profit Factor */}
            <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">Profit Factor</span>
                <Scale className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="text-3xl font-black text-emerald-400 font-mono">
                {profitFactorVal}
              </div>
              <p className="text-xs text-slate-400">Total Wins ₹{Math.round(totalWinPnl)} ÷ Losses ₹{Math.round(totalLossPnl)}</p>
            </div>

            {/* Card 2: Expectancy Per Trade */}
            <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">Trade Expectancy</span>
                <Percent className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-3xl font-black text-blue-400 font-mono">
                {expectancy >= 0 ? '+' : ''}{formatINR(expectancy)}
              </div>
              <p className="text-xs text-slate-400">Mathematical statistical edge per trade</p>
            </div>

            {/* Card 3: Payoff Ratio */}
            <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">Payoff Ratio (Avg W/L)</span>
                <Trophy className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="text-3xl font-black text-indigo-400 font-mono">
                {payoffRatioVal}:1
              </div>
              <p className="text-xs text-slate-400">Avg Win {formatINR(avgWin)} ÷ Avg Loss {formatINR(avgLoss)}</p>
            </div>

            {/* Card 4: Max Drawdown */}
            <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">Max Equity Drawdown</span>
                <TrendingDown className="w-5 h-5 text-rose-400" />
              </div>
              <div className="text-3xl font-black text-rose-400 font-mono">
                -{formatINR(maxDrawdown)}
              </div>
              <p className="text-xs text-emerald-400 font-medium">Recovery Factor: {recoveryFactor}x</p>
            </div>
          </div>

          {/* Section 1: Risk-to-Reward (R:R) Bracket Distribution */}
          <div className="p-6 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1e2942] pb-4">
              <div>
                <h3 className="text-base font-black text-white light:text-slate-900 flex items-center gap-2">
                  <Scale className="w-5 h-5 text-cyan-400" />
                  Risk-to-Reward (R:R) Efficiency Distribution
                </h3>
                <p className="text-xs text-slate-400">
                  Performance and profitability segmented by target reward vs stop loss ratio
                </p>
              </div>
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 w-fit">
                Asymmetrical Returns
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {rrBracketList.map((bracket) => {
                const hasTrades = bracket.trades > 0;
                const isWin = bracket.pnl >= 0;
                return (
                  <div
                    key={bracket.name}
                    className={`p-4 rounded-2xl border transition-all ${
                      hasTrades
                        ? isWin
                          ? 'bg-[#14213d]/60 light:bg-emerald-50/50 border-emerald-500/30'
                          : 'bg-[#291726]/60 light:bg-rose-50/50 border-rose-500/30'
                        : 'bg-[#111a2e]/60 light:bg-slate-50 border-[#1e2942] opacity-70'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h4 className="font-bold text-sm text-white light:text-slate-900">{bracket.name}</h4>
                        <span className="text-[10px] text-slate-400">{bracket.desc}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black font-mono ${
                        !hasTrades 
                          ? 'bg-slate-800 text-slate-400' 
                          : isWin 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}>
                        {hasTrades ? `${bracket.winRate}% Win` : '0 Trades'}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs pt-3 border-t border-white/5">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Trades Count</span>
                        <span className="font-bold font-mono text-white light:text-slate-900">{bracket.trades}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Wins / Losses</span>
                        <span className="font-mono text-slate-300">
                          <span className="text-emerald-400 font-bold">{bracket.wins}W</span> / <span className="text-rose-400 font-bold">{bracket.losses}L</span>
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-white/5">
                        <span className="font-bold text-slate-300 light:text-slate-700">Net Realized P&L</span>
                        <span className={`font-black font-mono text-sm ${bracket.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {bracket.pnl >= 0 ? '+' : ''}{formatINR(bracket.pnl)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Capital Exposure & Risk Per Trade Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Capital Allocation & Risk Metrics */}
            <div className="p-6 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-4">
              <h3 className="text-base font-black text-white light:text-slate-900 flex items-center gap-2 border-b border-[#1e2942] pb-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                Capital Exposure & Risk Parameters
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between py-2 border-b border-[#1e2942]">
                  <span className="text-slate-400">Average Risk Taken per Trade</span>
                  <span className="font-bold text-white light:text-slate-900 font-mono">₹{avgRiskAmount}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[#1e2942]">
                  <span className="text-slate-400">Maximum Single-Trade Risk Exposure</span>
                  <span className="font-bold text-amber-400 font-mono">₹{maxRiskAmount}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[#1e2942]">
                  <span className="text-slate-400">Average Position Turnover</span>
                  <span className="font-bold text-white light:text-slate-900 font-mono">{formatINR(avgCapitalUsed)}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[#1e2942]">
                  <span className="text-slate-400">Stop Loss Compliance Rate</span>
                  <span className="font-bold text-emerald-400 font-mono">100% (Strict SL)</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400">Prop Firm Risk Score</span>
                  <span className="font-bold text-emerald-400 font-mono">96 / 100 (Safe)</span>
                </div>
              </div>
            </div>

            {/* AI Risk Guardrails & Safety Guidelines */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-900/30 via-blue-900/20 to-cyan-900/30 border border-indigo-500/30 shadow-xl space-y-4">
              <h3 className="text-base font-black text-white light:text-slate-900 flex items-center gap-2 border-b border-white/10 pb-3">
                <Zap className="w-5 h-5 text-amber-400" />
                Institutional Risk Guardrails & Rules
              </h3>
              <div className="space-y-3 text-xs leading-relaxed text-slate-300 light:text-slate-700">
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <p className="font-bold text-blue-300 mb-1">🛡️ 1. 2% Capital Rule (Fixed Fractional):</p>
                  <p>Kisi bhi single trade mein aapka total risk (Entry Price - Stop Loss × Quantity) total trading capital ke <strong>2%</strong> se jyada nahi hona chahiye.</p>
                </div>
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                  <p className="font-bold text-rose-300 mb-1">🛑 2. Daily Loss Circuit Breaker:</p>
                  <p>Agar din mein <strong>2 consecutive SL hit</strong> ho jayein ya total daily drawdown ₹1,500 cross kare, to turant trading close karein aur agle din fresh mind se trade karein.</p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <p className="font-bold text-emerald-300 mb-1">📈 3. Asymmetric R:R Focus:</p>
                  <p>Hamesha minimum <strong>1:1.5 se 1:2 R:R</strong> wale high-probability setups ko prefer karein taaki 50% win rate par bhi aap highly profitable rahein!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: 🚨 BAD DAY RECOVERY & RESET SOS PROTOCOL */}
      {/* ========================================================================= */}
      {activeReportTab === 'Bad Day Reset SOS' && (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
          
          {/* SECTION 1: EMERGENCY HALT & PSYCHOLOGICAL DE-ESCALATION HERO */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-rose-950/80 via-[#181124] to-[#111a2e] border-2 border-rose-500/40 shadow-2xl relative overflow-hidden space-y-6">
            <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-rose-500/20 pb-5">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-rose-600/30 text-rose-400 border border-rose-500/40 flex items-center justify-center shadow-lg shadow-rose-600/30 shrink-0 animate-pulse">
                  <ShieldAlert className="w-8 h-8 text-rose-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white uppercase tracking-wider">
                      EMERGENCY PROTOCOL
                    </span>
                    <span className="text-xs text-rose-300 font-bold">CIRCUIT BREAKER ACTIVATED</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white mt-1 tracking-tight">
                    🛑 Step 1: Close Your Broker Terminal Right Now
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsBreathingActive(!isBreathingActive)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg cursor-pointer ${
                    isBreathingActive 
                      ? 'bg-amber-500 text-slate-950 shadow-amber-500/30' 
                      : 'bg-[#1e2942] hover:bg-[#28385a] text-slate-200 border border-slate-700'
                  }`}
                >
                  <HeartPulse className={`w-4 h-4 ${isBreathingActive ? 'animate-spin' : 'text-rose-400'}`} />
                  <span>{isBreathingActive ? `Breathing (${breathingCountdown}s)` : '🧘 60s Box Breathing Reset'}</span>
                </button>
              </div>
            </div>

            {/* Breathing Animation Banner when active */}
            {isBreathingActive && (
              <div className="p-4 rounded-2xl bg-black/50 border border-amber-500/40 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full border-4 border-amber-400 flex items-center justify-center font-black text-amber-300 text-sm animate-pulse">
                    {breathingCountdown}s
                  </div>
                  <div>
                    <p className="text-sm font-black text-amber-300 uppercase tracking-wide">
                      {breathingPhase === 'Inhale' && '🌬️ Inhale Slowly (Naak se saans andar lo)...'}
                      {breathingPhase === 'Hold' && '🛑 Hold Breath (Saans roke rakhein)...'}
                      {breathingPhase === 'Exhale' && '💨 Exhale Slowly (Mooh se saans bahar chhodo)...'}
                    </p>
                    <p className="text-xs text-slate-400">
                      Yeh aapke heart rate aur cortisol (gussa/stress) ko normal level par lata hai.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsBreathingActive(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs"
                >
                  Stop
                </button>
              </div>
            )}

            {/* The Harsh Truth & Reassurance Banner */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-[#141b2d]/80 border border-rose-500/30 space-y-1.5">
                <p className="font-bold text-rose-400 flex items-center gap-1.5 text-sm">
                  <Flame className="w-4 h-4" /> 1. Market Band Nahi Ho Raha:
                </p>
                <p className="text-slate-300 leading-relaxed">
                  Market kal bhi khulega, agle hafte bhi rahega aur 10 saal baad bhi rahega. Lekin agar aapne gusse me aaj capital uda diya, to aap kal trade nahi kar payenge.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#141b2d]/80 border border-amber-500/30 space-y-1.5">
                <p className="font-bold text-amber-400 flex items-center gap-1.5 text-sm">
                  <AlertTriangle className="w-4 h-4" /> 2. Revenge Trading = 98% Ruin:
                </p>
                <p className="text-slate-300 leading-relaxed">
                  Pehle loss ke baad jo agla trade gusse me liya jata hai, usme 98% probability loss ki hoti hai kyunki dimaag analysis nahi sirf paisa wapis chahta hai.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#141b2d]/80 border border-emerald-500/30 space-y-1.5">
                <p className="font-bold text-emerald-400 flex items-center gap-1.5 text-sm">
                  <ShieldCheck className="w-4 h-4" /> 3. Tuition Fee, Not The End:
                </p>
                <p className="text-slate-300 leading-relaxed">
                  Duniya ke har legendary trader (Mark Minervini, Paul Tudor Jones) ka bada loss hua hai. Yeh loss aapki <strong className="text-emerald-300">Market Tuition Fee</strong> hai, agar aap isse seekh kar aaj terminal band kar dein!
                </p>
              </div>
            </div>

          </div>

          {/* SECTION 2: BIGGEST LOSS DISPLAY & RECOVERY TARGET SELECTOR */}
          <div className="p-6 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#1e2942] pb-4">
              <div>
                <h3 className="text-base sm:text-lg font-black text-white light:text-slate-900 flex items-center gap-2">
                  <Flame className="w-5 h-5 text-rose-500" />
                  Your Loss History & Recovery Targets
                </h3>
                <p className="text-xs text-slate-400">
                  Select your biggest historical loss or today's loss to generate an exact Index-based recovery blueprint:
                </p>
              </div>

              <div className="flex items-center gap-2 bg-[#16223b] px-3.5 py-1.5 rounded-xl border border-[#23355b]">
                <span className="text-xs text-slate-400 font-medium">Recovery Goal:</span>
                <span className="text-sm font-bold text-rose-400 font-mono">₹</span>
                <input
                  type="number"
                  value={sosLossAmount}
                  onChange={(e) => setSosLossAmount(Math.max(100, Number(e.target.value)))}
                  className="w-28 bg-transparent text-sm font-black text-rose-400 font-mono focus:outline-none"
                />
              </div>
            </div>

            {/* Quick Loss Preset Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
              
              {/* Card 1: All-Time Biggest Day Loss */}
              <div 
                onClick={() => setSosLossAmount(Math.abs(worstDay < 0 ? worstDay : 12070.80))}
                className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                  sosLossAmount === Math.abs(worstDay < 0 ? worstDay : 12070.80)
                    ? 'bg-rose-500/20 border-rose-500 shadow-lg shadow-rose-500/20'
                    : 'bg-[#16223b] border-[#23355b] hover:border-slate-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium text-[11px] uppercase tracking-wider">💥 All-Time Biggest Loss Day</span>
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-rose-500/30 text-rose-300">Worst Day</span>
                </div>
                <p className="text-xl font-black text-rose-400 font-mono">
                  -{formatINR(Math.abs(worstDay < 0 ? worstDay : 12070.80))}
                </p>
                <button className="w-full py-1.5 rounded-xl bg-rose-600/30 hover:bg-rose-600/50 text-rose-200 text-[11px] font-bold border border-rose-500/40 cursor-pointer">
                  ⚡ Plan Recovery for This Loss
                </button>
              </div>

              {/* Card 2: Today's Loss */}
              <div 
                onClick={() => setSosLossAmount(Math.abs(worstDay < 0 ? worstDay : 5000))}
                className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                  sosLossAmount === 5000
                    ? 'bg-amber-500/20 border-amber-500 shadow-lg shadow-amber-500/20'
                    : 'bg-[#16223b] border-[#23355b] hover:border-slate-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium text-[11px] uppercase tracking-wider">💔 Standard Target Goal</span>
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-500/30 text-amber-300">₹5,000 Target</span>
                </div>
                <p className="text-xl font-black text-amber-400 font-mono">
                  -₹5,000.00
                </p>
                <button className="w-full py-1.5 rounded-xl bg-amber-600/30 hover:bg-amber-600/50 text-amber-200 text-[11px] font-bold border border-amber-500/40 cursor-pointer">
                  ⚡ Plan for ₹5,000
                </button>
              </div>

              {/* Card 3: ₹20,000 Major Drawdown */}
              <div 
                onClick={() => setSosLossAmount(20000)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                  sosLossAmount === 20000
                    ? 'bg-purple-500/20 border-purple-500 shadow-lg shadow-purple-500/20'
                    : 'bg-[#16223b] border-[#23355b] hover:border-slate-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium text-[11px] uppercase tracking-wider">🛡️ Full Milestone Reset</span>
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-purple-500/30 text-purple-300">₹20,000 Goal</span>
                </div>
                <p className="text-xl font-black text-purple-400 font-mono">
                  -₹20,000.00
                </p>
                <button className="w-full py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 text-[11px] font-bold border border-purple-500/40 cursor-pointer">
                  ⚡ Plan for ₹20,000
                </button>
              </div>

            </div>
          </div>

          {/* SECTION 3: INDEX-SPECIFIC SYSTEMATIC RECOVERY BLUEPRINT ENGINE */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#1e2942] pb-4">
              <div>
                <h3 className="text-base sm:text-lg font-black text-white light:text-slate-900 flex items-center gap-2">
                  <Target className="w-5 h-5 text-emerald-400" />
                  Index-Specific Recovery Blueprint (NIFTY / Bank Nifty / Stocks)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Choose which index or instrument you will trade to systematically recover {formatINR(sosLossAmount)}:
                </p>
              </div>

              {/* Index Selector Tabs */}
              <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#0e1628] border border-[#1e2942] overflow-x-auto no-scrollbar">
                {[
                  { id: 'NIFTY', label: '📈 NIFTY 50', lot: 25 },
                  { id: 'BANKNIFTY', label: '🏦 BANK NIFTY', lot: 15 },
                  { id: 'FINNIFTY', label: '⚡ FINNIFTY', lot: 25 },
                  { id: 'SENSEX', label: '🏛️ SENSEX', lot: 10 },
                  { id: 'STOCKS', label: '💎 INTRADAY STOCKS', lot: 1 }
                ].map(idx => (
                  <button
                    key={idx.id}
                    onClick={() => setSelectedRecoveryIndex(idx.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      selectedRecoveryIndex === idx.id
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[#16223b]'
                    }`}
                  >
                    {idx.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tactical Blueprint Grid for Chosen Index */}
            {(() => {
              const indexDetails: Record<string, { name: string; lotSize: number; targetPts: number; slPts: number; rr: string; time: string; setup: string; trap: string; optPremium: number }> = {
                NIFTY: {
                  name: 'NIFTY 50',
                  lotSize: 25,
                  targetPts: 25,
                  slPts: 10,
                  rr: '1:2.5',
                  time: '9:45 AM - 11:15 AM & 1:45 PM - 3:00 PM',
                  setup: '15-Min VWAP Pullback & Level Breakout at Key Day High/Low',
                  trap: 'Do not trade between 11:45 AM - 1:30 PM (lunchtime premium decay chop). Trade ATM options only.',
                  optPremium: 120
                },
                BANKNIFTY: {
                  name: 'BANK NIFTY',
                  lotSize: 15,
                  targetPts: 50,
                  slPts: 20,
                  rr: '1:2.5',
                  time: '9:30 AM - 11:00 AM & 2:00 PM - 3:15 PM',
                  setup: 'HDFC Bank + ICICI Bank Combined Momentum Direction',
                  trap: 'Never buy cheap OTM hero-zero calls on expiry afternoon. Strictly trade ATM.',
                  optPremium: 250
                },
                FINNIFTY: {
                  name: 'FINNIFTY',
                  lotSize: 25,
                  targetPts: 30,
                  slPts: 12,
                  rr: '1:2.5',
                  time: '10:00 AM - 11:30 AM',
                  setup: 'Financial & NBFC Heavyweights Support Confirmation',
                  trap: 'Avoid chasing 30-point green candle spikes without pullback.',
                  optPremium: 110
                },
                SENSEX: {
                  name: 'BSE SENSEX',
                  lotSize: 10,
                  targetPts: 80,
                  slPts: 30,
                  rr: '1:2.6',
                  time: '9:45 AM - 11:30 AM',
                  setup: 'Reliance + HDFC Heavyweight Trend Pullback',
                  trap: 'Always use Limit Orders to avoid wide bid-ask spread slippage.',
                  optPremium: 220
                },
                STOCKS: {
                  name: 'INTRADAY STOCKS (CASH)',
                  lotSize: 1,
                  targetPts: 1.5,
                  slPts: 0.6,
                  rr: '1:2.5',
                  time: '9:30 AM - 10:45 AM',
                  setup: 'High Relative Volume (RVOL) Gap & Go Stocks (e.g. Tata Motors, Reliance)',
                  trap: 'Zero theta decay! Ideal for regaining psychological calmness without option expiration stress.',
                  optPremium: 0
                }
              };

              const cur = indexDetails[selectedRecoveryIndex] || indexDetails.NIFTY;
              const rewardPerTrade = selectedRecoveryIndex === 'STOCKS' ? 750 * recoveryLotCount : cur.targetPts * cur.lotSize * recoveryLotCount;
              const riskPerTrade = selectedRecoveryIndex === 'STOCKS' ? 300 * recoveryLotCount : cur.slPts * cur.lotSize * recoveryLotCount;
              const dailyTradesCap = 2;
              const dailyNetGainExpectation = rewardPerTrade;
              const totalSessionsNeeded = Math.ceil(sosLossAmount / Math.max(100, dailyNetGainExpectation));

              return (
                <div className="space-y-6">
                  {/* Parameter Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3.5 rounded-2xl bg-[#16223b] border border-[#23355b] space-y-1">
                      <span className="text-slate-400">Position Size (Fixed)</span>
                      <p className="text-base font-black text-white font-mono">
                        {recoveryLotCount} Lot ({selectedRecoveryIndex === 'STOCKS' ? 'Cash Stock' : `${cur.lotSize * recoveryLotCount} Qty`})
                      </p>
                      <span className="text-[10px] text-emerald-400 font-bold">100% Capital Protection</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#16223b] border border-[#23355b] space-y-1">
                      <span className="text-slate-400">Target Per Trade</span>
                      <p className="text-base font-black text-emerald-400 font-mono">
                        +{formatINR(rewardPerTrade)} ({cur.targetPts} {selectedRecoveryIndex === 'STOCKS' ? '%' : 'pts'})
                      </p>
                      <span className="text-[10px] text-slate-400 font-bold">R:R = {cur.rr}</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#16223b] border border-[#23355b] space-y-1">
                      <span className="text-slate-400">Max Risk (Stop Loss)</span>
                      <p className="text-base font-black text-rose-400 font-mono">
                        -{formatINR(riskPerTrade)} ({cur.slPts} {selectedRecoveryIndex === 'STOCKS' ? '%' : 'pts'})
                      </p>
                      <span className="text-[10px] text-rose-300 font-bold">Hard System SL</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 space-y-1">
                      <span className="text-slate-300">Total Recovery Time</span>
                      <p className="text-lg font-black text-emerald-400 font-mono">
                        {totalSessionsNeeded} Trading Sessions
                      </p>
                      <span className="text-[10px] text-emerald-300 font-bold">0% Account Stress</span>
                    </div>
                  </div>

                  {/* 4-PHASE MILESTONE ROADMAP */}
                  <div className="p-5 rounded-2xl bg-[#0e1628] border border-[#1e2942] space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-amber-400" />
                        4-Phase Milestone Recovery Tracker ({cur.name})
                      </h4>
                      <span className="text-[11px] text-slate-400 font-mono">Total Goal: {formatINR(sosLossAmount)}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-[#16223b] border border-blue-500/30 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-blue-400">Phase 1 (25%)</span>
                          <span className="text-[10px] text-slate-400">Day 1 - {Math.ceil(totalSessionsNeeded * 0.25)}</span>
                        </div>
                        <p className="text-sm font-black text-white font-mono">+{formatINR(Math.round(sosLossAmount * 0.25))}</p>
                        <p className="text-[10px] text-slate-400">Rebuilding confidence & breathing calm.</p>
                      </div>

                      <div className="p-3 rounded-xl bg-[#16223b] border border-cyan-500/30 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-cyan-400">Phase 2 (50%)</span>
                          <span className="text-[10px] text-slate-400">Day {Math.ceil(totalSessionsNeeded * 0.25) + 1} - {Math.ceil(totalSessionsNeeded * 0.50)}</span>
                        </div>
                        <p className="text-sm font-black text-white font-mono">+{formatINR(Math.round(sosLossAmount * 0.50))}</p>
                        <p className="text-[10px] text-slate-400">Psychological stability restored.</p>
                      </div>

                      <div className="p-3 rounded-xl bg-[#16223b] border border-purple-500/30 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-purple-400">Phase 3 (75%)</span>
                          <span className="text-[10px] text-slate-400">Day {Math.ceil(totalSessionsNeeded * 0.50) + 1} - {Math.ceil(totalSessionsNeeded * 0.75)}</span>
                        </div>
                        <p className="text-sm font-black text-white font-mono">+{formatINR(Math.round(sosLossAmount * 0.75))}</p>
                        <p className="text-[10px] text-slate-400">Capital compounding comfortably.</p>
                      </div>

                      <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-emerald-400">Phase 4 (100%)</span>
                          <span className="text-[10px] text-emerald-300">Final Day {totalSessionsNeeded}</span>
                        </div>
                        <p className="text-sm font-black text-emerald-400 font-mono">+{formatINR(sosLossAmount)}</p>
                        <p className="text-[10px] text-emerald-300">Full capital redemption & ATH!</p>
                      </div>
                    </div>
                  </div>

                  {/* High-Probability Tactical Rules for Selected Index */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
                    <div className="p-3.5 rounded-xl bg-[#16223b] border border-[#23355b] space-y-1">
                      <span className="font-bold text-amber-400 flex items-center gap-1.5">
                        <Clock className="w-4 h-4" /> Best Execution Window:
                      </span>
                      <p className="text-slate-300">{cur.time}</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#16223b] border border-[#23355b] space-y-1">
                      <span className="font-bold text-blue-400 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4" /> Primary High-Winrate Setup:
                      </span>
                      <p className="text-slate-300">{cur.setup}</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/30 space-y-1">
                      <span className="font-bold text-rose-400 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4" /> Deadliest Trap to Avoid:
                      </span>
                      <p className="text-rose-200">{cur.trap}</p>
                    </div>
                  </div>

                  {/* Activate Blueprint Action */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-blue-900/30 via-indigo-900/20 to-blue-900/30 border border-blue-500/30">
                    <div>
                      <h4 className="text-xs font-bold text-white">
                        Commit to the {cur.name} Recovery Protocol
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {totalSessionsNeeded} disciplined sessions with 1 lot. No revenge, no heavy sizing.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        localStorage.setItem('trade_recovery_plan_active', 'true');
                        setIsRecoveryPlanSaved(true);
                      }}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white text-xs font-black shadow-lg shadow-emerald-600/30 transition-all cursor-pointer shrink-0"
                    >
                      {isRecoveryPlanSaved ? '✅ Recovery Blueprint Activated!' : `🚀 Activate ${cur.name} Recovery Plan`}
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* SECTION 4: HONEST MISTAKE DIAGNOSIS (KAHAN GUKTI HUI?) */}
          <div className="p-6 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-black text-white light:text-slate-900 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-400" />
                  Honest Mistake Diagnosis (Aaj Kahan Galti Hui?)
                </h3>
                <p className="text-xs text-slate-400">
                  Jo galtiyan aaj aapse hui hain unpar tap karein taaki hum unka exact psychological solution nikal sakein:
                </p>
              </div>
              <span className="text-xs font-bold text-slate-400">Tap to Select</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              {[
                { id: 'revenge', label: '🔥 Revenge Trading', desc: 'Pehle loss ka gussa nikalne ke liye turant doosri trade maari bina setup ke', fix: 'Rule: 1 loss ke baad minimum 45 minute ka mandatory screen walk-away break.' },
                { id: 'overtrading', label: '⚡ Overtrading (4+ Trades)', desc: 'Din me limit se zyada trades li, screen se chipke rahe', fix: 'Rule: Daily Maximum 2 Trades hard limit. Win ho ya Loss terminal close.' },
                { id: 'oversizing', label: '💣 Oversizing / Heavy Lots', desc: 'Jaldi recover karne ke liye standard lot size se 2x ya 4x bada lot liya', fix: 'Rule: Kal se 50% lot size (sirf 1 lot) par fixed trade karenge jab tak confidence na aaye.' },
                { id: 'averaging', label: '🕳️ Averaging in Loss (Hope)', desc: 'Loss me ja rahe trade me aur quantity add kar li ki market ghoomega', fix: 'Rule: Losing trade me 1 single quantity bhi add karna suicide hai. Instant SL hit hone par nikalna hai.' },
                { id: 'no_sl', label: '🚫 Stop-Loss Cut Nahi Kiya', desc: 'SL hit hone par bhi nikalne ki jagah hold kiya ki wapis aayega', fix: 'Rule: System Stop-Loss order terminal me entry ke sath hi place hoga, mental SL kabhi nahi.' },
                { id: 'fomo', label: '🏃 FOMO Candle Chasing', desc: 'Badi green/red candle bhaagte dekh bina level ke jump kar gaye', fix: 'Rule: Market ko aapke level par aane do, bhaagti train me chadhna band karo.' }
              ].map(item => {
                const isSelected = sosSelectedMistakes.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSosSelectedMistakes(prev => 
                        prev.includes(item.id) ? prev.filter(x => x !== item.id) : [...prev, item.id]
                      );
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                      isSelected
                        ? 'bg-rose-500/15 border-rose-500 text-white shadow-md shadow-rose-500/20'
                        : 'bg-[#16223b] light:bg-slate-50 border-[#23355b] text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-white light:text-slate-900">{item.label}</span>
                      <CheckCircle2 className={`w-4 h-4 ${isSelected ? 'text-rose-400' : 'text-slate-600'}`} />
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{item.desc}</p>
                    {isSelected && (
                      <div className="p-2 rounded-xl bg-black/40 border border-rose-500/30 text-[10px] text-rose-300 font-medium animate-in fade-in">
                        <strong>Antidote:</strong> {item.fix}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 4: 5 GOLDEN RULES FOR TOMORROW MORNING */}
          <div className="p-6 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-4">
            <h3 className="text-base sm:text-lg font-black text-white light:text-slate-900 flex items-center gap-2">
              <Compass className="w-5 h-5 text-blue-400" />
              5 Golden Commandments For Tomorrow Morning (Pre-Flight Protocol)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
              <div className="p-4 rounded-2xl bg-[#16223b] border border-[#23355b] space-y-1.5">
                <span className="font-bold text-blue-400 flex items-center gap-1.5">
                  1. Lot Size Cut to 50% 📉
                </span>
                <p className="text-slate-300 leading-relaxed">
                  Kal sirf 1 fixed lot me trade karein. Jab tak 3 consecutive green days na aayein, tab tak lot size nahi badhana hai.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#16223b] border border-[#23355b] space-y-1.5">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  2. Maximum 2 Trades Hard Limit 🛑
                </span>
                <p className="text-slate-300 leading-relaxed">
                  Chahe pehle trade me profit ho ya loss, din me maximum 2 trades ke baad terminal close kar dena hai.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#16223b] border border-[#23355b] space-y-1.5">
                <span className="font-bold text-purple-400 flex items-center gap-1.5">
                  3. System SL In Terminal 🛡️
                </span>
                <p className="text-slate-300 leading-relaxed">
                  Mental Stop Loss bilkul nahi chalega. Order punch hote hi broker terminal me Stop-Loss order lagana mandatory hai.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#16223b] border border-[#23355b] space-y-1.5">
                <span className="font-bold text-amber-400 flex items-center gap-1.5">
                  4. No 9:15 - 9:30 AM Trading ⏱️
                </span>
                <p className="text-slate-300 leading-relaxed">
                  Pehle 15 minute market ko settle hone dein. 9:30 AM ke baad jab clean candle structure bane tabhi setup lena hai.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#16223b] border border-[#23355b] space-y-1.5">
                <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                  5. Fresh Day 1 Mindset 🌅
                </span>
                <p className="text-slate-300 leading-relaxed">
                  Kal market me 'aaj ka loss recover karne' mat jana. Kal sirf '1 clean setup perfect execute' karne jana hai.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#16223b] border border-[#23355b] space-y-1.5">
                <span className="font-bold text-rose-400 flex items-center gap-1.5">
                  6. No Option Buying in Choppy VIX 📊
                </span>
                <p className="text-slate-300 leading-relaxed">
                  Agar VIX 11 se neeche ho to OTM option mat khareedo, sideways market me premium decay se bachein.
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 5: INTERACTIVE ACCEPTANCE & PROTECTION CONTRACT */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#16223b] via-[#111a2e] to-[#16223b] border border-blue-500/30 shadow-2xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">
                  Trader's Discipline & Capital Protection Commitment
                </h3>
                <p className="text-xs text-slate-400">
                  Apne trading career ko protect karne ke liye yeh 3 commitments tick karke Lock karein:
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <label className="flex items-start gap-3 p-3.5 rounded-xl bg-[#0e1628] border border-[#1e2942] cursor-pointer hover:border-blue-500/40 transition-all">
                <input
                  type="checkbox"
                  checked={contractAccept1}
                  onChange={(e) => setContractAccept1(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
                />
                <span className="text-slate-300 leading-relaxed">
                  <strong>1. Maine aaj ka loss accept kar liya hai:</strong> Main aaj broker terminal dubara open nahi karunga aur koi revenge trade nahi lunga.
                </span>
              </label>

              <label className="flex items-start gap-3 p-3.5 rounded-xl bg-[#0e1628] border border-[#1e2942] cursor-pointer hover:border-blue-500/40 transition-all">
                <input
                  type="checkbox"
                  checked={contractAccept2}
                  onChange={(e) => setContractAccept2(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
                />
                <span className="text-slate-300 leading-relaxed">
                  <strong>2. 1 Bad Day se mera trading career khatam nahi hota:</strong> Main is loss ko learning aur rule refinement ki tarah use karunga.
                </span>
              </label>

              <label className="flex items-start gap-3 p-3.5 rounded-xl bg-[#0e1628] border border-[#1e2942] cursor-pointer hover:border-blue-500/40 transition-all">
                <input
                  type="checkbox"
                  checked={contractAccept3}
                  onChange={(e) => setContractAccept3(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
                />
                <span className="text-slate-300 leading-relaxed">
                  <strong>3. Kal main strictly 1 lot & 1:2 R:R follow karunga:</strong> Maximum 2 trades ke baad main terminal close kar dunga.
                </span>
              </label>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="text-xs text-slate-400">
                {isSosContractLocked ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Day Locked & Capital Protected! You won today's mental battle.
                  </span>
                ) : (
                  <span>Tick all 3 checkboxes to officially lock today's session.</span>
                )}
              </div>

              <button
                disabled={!(contractAccept1 && contractAccept2 && contractAccept3)}
                onClick={() => setIsSosContractLocked(true)}
                className={`px-6 py-3 rounded-2xl text-xs font-black transition-all shadow-xl flex items-center gap-2 cursor-pointer ${
                  isSosContractLocked
                    ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                    : contractAccept1 && contractAccept2 && contractAccept3
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-600/30 transform hover:scale-105 active:scale-95'
                      : 'bg-[#1e2942] text-slate-500 opacity-50 cursor-not-allowed'
                }`}
              >
                <Lock className="w-4 h-4" />
                <span>{isSosContractLocked ? '🔒 Day Successfully Locked' : 'Sign & Lock Today\'s Session'}</span>
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
