import { Trade, DashboardStats, StrategyPerformance, MistakeAnalysis } from '../types/trade';

export function calculateDashboardStats(trades: Trade[]): DashboardStats {
  const validTrades = trades.filter(t => !t.isNoTradeDay);
  
  if (validTrades.length === 0) {
    return {
      highestPnl: 0,
      highestPnlChangePercent: 0,
      winRate: 0,
      winRateChangePercent: 0,
      avgRiskReward: '1:2.0',
      avgRiskRewardChangePercent: 0,
      tradesThisMonth: 0,
      tradesThisMonthChange: 0,
      totalPnl: 0,
      winningTrades: 0,
      losingTrades: 0,
      breakevenTrades: 0,
      profitFactor: 0,
      confidenceScore: 100,
      confidenceLabel: 'Ready for August 2026',
      confidenceDesc: 'Start logging your trades with strict discipline and rules adherence.'
    };
  }

  let highestPnl = 0;
  let totalPnl = 0;
  let winningTrades = 0;
  let losingTrades = 0;
  let breakevenTrades = 0;
  let totalGrossProfit = 0;
  let totalGrossLoss = 0;

  validTrades.forEach(trade => {
    const net = trade.netPnl;
    totalPnl += net;
    if (net > highestPnl) highestPnl = net;
    if (net > 0) {
      winningTrades++;
      totalGrossProfit += net;
    } else if (net < 0) {
      losingTrades++;
      totalGrossLoss += Math.abs(net);
    } else {
      breakevenTrades++;
    }
  });

  const winRate = validTrades.length > 0 ? (winningTrades / validTrades.length) * 100 : 0;
  const profitFactor = totalGrossLoss > 0 ? totalGrossProfit / totalGrossLoss : totalGrossProfit > 0 ? 99 : 0;

  // Confidence index calculation based on rules adherence and win rate
  const disciplinedTrades = validTrades.filter(t => t.followedPlan && t.followedRisk).length;
  const disciplinePercent = validTrades.length > 0 ? (disciplinedTrades / validTrades.length) * 100 : 80;
  const confidenceScore = Math.min(100, Math.max(10, Math.round(disciplinePercent * 0.6 + winRate * 0.4)));

  let confidenceLabel = 'Moderate Confidence';
  let confidenceDesc = 'Keep focusing on risk control and setup execution.';
  
  if (confidenceScore >= 80) {
    confidenceLabel = 'Very High Confidence';
    confidenceDesc = 'You are trading with excellent discipline and emotional stability.';
  } else if (confidenceScore >= 60) {
    confidenceLabel = 'High Confidence';
    confidenceDesc = 'Good discipline, watch out for occasional emotional entries.';
  } else if (confidenceScore <= 40) {
    confidenceLabel = 'Low Confidence / Risk Alert';
    confidenceDesc = 'High occurrence of trading mistakes. Consider pausing and reviewing rules.';
  }

  return {
    highestPnl,
    highestPnlChangePercent: +10.0,
    winRate: Number(winRate.toFixed(1)),
    winRateChangePercent: 0,
    avgRiskReward: '1:2.5',
    avgRiskRewardChangePercent: 0,
    tradesThisMonth: validTrades.length,
    tradesThisMonthChange: validTrades.length,
    totalPnl,
    winningTrades,
    losingTrades,
    breakevenTrades,
    profitFactor: Number(profitFactor.toFixed(2)),
    confidenceScore,
    confidenceLabel,
    confidenceDesc
  };
}

export function getStrategyPerformance(trades: Trade[]): StrategyPerformance[] {
  const validTrades = trades.filter(t => !t.isNoTradeDay && t.strategy);
  const strategyMap = new Map<string, { trades: number; wins: number; totalPnl: number; totalGain: number; totalLoss: number; avgRR: string }>();

  validTrades.forEach(t => {
    const s = t.strategy.trim() || 'Uncategorized';
    const current = strategyMap.get(s) || { trades: 0, wins: 0, totalPnl: 0, totalGain: 0, totalLoss: 0, avgRR: t.riskReward || '1:2.0' };
    current.trades += 1;
    if (t.netPnl > 0) {
      current.wins += 1;
      current.totalGain += t.netPnl;
    } else {
      current.totalLoss += Math.abs(t.netPnl);
    }
    current.totalPnl += t.netPnl;
    if (t.riskReward) current.avgRR = t.riskReward;
    strategyMap.set(s, current);
  });

  return Array.from(strategyMap.entries()).map(([name, data]) => {
    let realizedRR = data.avgRR || '1:2.0';
    if (data.totalLoss > 0 && data.totalGain > 0 && data.trades > 1) {
      const avgWin = data.totalGain / (data.wins || 1);
      const avgLoss = data.totalLoss / (data.trades - data.wins || 1);
      if (avgLoss > 0) realizedRR = `1:${(avgWin / avgLoss).toFixed(1)}`;
    }

    return {
      name,
      totalTrades: data.trades,
      winCount: data.wins,
      winRate: Number(((data.wins / data.trades) * 100).toFixed(1)),
      totalPnl: Number(data.totalPnl.toFixed(2)),
      avgPnl: Number((data.totalPnl / data.trades).toFixed(2)),
      realizedRR
    };
  }).sort((a, b) => b.totalPnl - a.totalPnl);
}

export function getMistakesBreakdown(trades: Trade[]): MistakeAnalysis[] {
  const mistakeMap = new Map<string, { count: number; totalLoss: number }>();
  let grandLoss = 0;

  trades.forEach(t => {
    if (t.mistakes && t.mistakes.length > 0) {
      const lossPortion = t.netPnl < 0 ? Math.abs(t.netPnl) / t.mistakes.length : 0;
      t.mistakes.forEach(m => {
        const current = mistakeMap.get(m) || { count: 0, totalLoss: 0 };
        current.count += 1;
        current.totalLoss += lossPortion;
        grandLoss += lossPortion;
        mistakeMap.set(m, current);
      });
    }
  });

  return Array.from(mistakeMap.entries()).map(([name, data]) => ({
    name,
    tradeCount: data.count,
    totalLoss: Number(data.totalLoss.toFixed(2)),
    percentage: grandLoss > 0 ? Number(((data.totalLoss / grandLoss) * 100).toFixed(1)) : 0
  })).sort((a, b) => b.totalLoss - a.totalLoss);
}

export function getDailyPnlData(trades: Trade[]) {
  const dailyMap = new Map<string, number>();
  
  // Sort trades chronologically
  const sorted = [...trades].filter(t => !t.isNoTradeDay).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  sorted.forEach(t => {
    const formattedDate = new Date(t.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    const current = dailyMap.get(formattedDate) || 0;
    dailyMap.set(formattedDate, current + t.netPnl);
  });

  return Array.from(dailyMap.entries()).map(([date, pnl]) => ({
    date,
    pnl: Number(pnl.toFixed(2)),
    isPositive: pnl >= 0
  }));
}

export function getCumulativePnlData(trades: Trade[]) {
  const sorted = [...trades].filter(t => !t.isNoTradeDay).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  let runningPnl = 0;
  return sorted.map(t => {
    runningPnl += t.netPnl;
    const formattedDate = new Date(t.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    return {
      date: formattedDate,
      fullDate: t.date,
      pnl: Number(runningPnl.toFixed(2)),
      tradePnl: t.netPnl,
      symbol: t.symbol
    };
  });
}

export function formatINR(val: number): string {
  const isNeg = val < 0;
  const absVal = Math.abs(val);
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  }).format(absVal);
  return `${isNeg ? '-' : ''}₹${formatted}`;
}

export interface IndianChargesBreakdown {
  brokerage: number;
  stt: number;
  exchangeCharges: number;
  gst: number;
  sebiCharges: number;
  stampDuty: number;
  totalCharges: number;
}

export function calculateIndianOptionCharges(
  buyPrice: number,
  sellPrice: number,
  quantity: number
): IndianChargesBreakdown {
  const buyValue = buyPrice * quantity;
  const sellValue = sellPrice * quantity;
  const totalTurnover = buyValue + sellValue;

  // Brokerage: ₹20 per executed order (Buy = ₹20, Sell = ₹20 => ₹40 total)
  const brokerage = 40.0;

  // STT / CTT: 0.0625% on option sell premium turnover
  const stt = Number((sellValue * 0.000625).toFixed(2));

  // Exchange Transaction Charge (NSE F&O: 0.03503% on premium turnover)
  const exchangeCharges = Number((totalTurnover * 0.0003503).toFixed(2));

  // SEBI Turnover Charge: ₹10 / Crore
  const sebiCharges = Number((totalTurnover * 0.000001).toFixed(2));

  // Stamp Duty: 0.003% on Buy Value
  const stampDuty = Number((buyValue * 0.00003).toFixed(2));

  // GST: 18% on (Brokerage + Exchange Charges + SEBI)
  const gst = Number(((brokerage + exchangeCharges + sebiCharges) * 0.18).toFixed(2));

  const totalCharges = Number((brokerage + stt + exchangeCharges + sebiCharges + stampDuty + gst).toFixed(2));

  return {
    brokerage,
    stt,
    exchangeCharges,
    gst,
    sebiCharges,
    stampDuty,
    totalCharges: totalCharges > 0 ? totalCharges : 55.0
  };
}
