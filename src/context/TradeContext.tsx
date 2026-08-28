import React, { createContext, useContext, useState, useEffect } from 'react';
import { Trade, MarketType, TradingRule, ChecklistItem, MarketTickerItem } from '../types/trade';
import { INITIAL_TRADES, INITIAL_RULES, INITIAL_CHECKLIST, INITIAL_TICKER } from '../utils/mockData';
import confetti from 'canvas-confetti';
import Papa from 'papaparse';

export type NavTab = 
  | 'dashboard' 
  | 'checklist' 
  | 'trades' 
  | 'strategies' 
  | 'rules' 
  | 'mistakes' 
  | 'ai-summarizer' 
  | 'reports' 
  | 'risk-management' 
  | 'calendar';

interface TradeContextType {
  trades: Trade[];
  addTrade: (trade: Omit<Trade, 'id' | 'createdAt'>) => void;
  updateTrade: (id: string, trade: Partial<Trade>) => void;
  deleteTrade: (id: string) => void;
  
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  
  isNewTradeModalOpen: boolean;
  setIsNewTradeModalOpen: (open: boolean) => void;
  
  selectedTrade: Trade | null;
  setSelectedTrade: (trade: Trade | null) => void;
  
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  
  marketFilter: string;
  setMarketFilter: (filter: string) => void;
  
  dateFilter: string;
  setDateFilter: (filter: string) => void;
  
  ticker: MarketTickerItem[];
  
  rules: TradingRule[];
  addRule: (rule: Omit<TradingRule, 'id'>) => void;
  toggleRule: (id: string) => void;
  deleteRule: (id: string) => void;
  
  checklist: ChecklistItem[];
  toggleChecklist: (id: string) => void;
  resetChecklist: () => void;
  
  exportCsv: () => void;
  importCsv: (file: File) => Promise<{ success: boolean; count: number; error?: string }>;
  resetToSampleData: () => void;
}

const TradeContext = createContext<TradeContextType | undefined>(undefined);

const TRADES_STORAGE_KEY = 'trade_diary_trades_v1';
const THEME_STORAGE_KEY = 'trade_diary_theme_v1';
const RULES_STORAGE_KEY = 'trade_diary_rules_v1';
const CHECKLIST_STORAGE_KEY = 'trade_diary_checklist_v1';

export const TradeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem(THEME_STORAGE_KEY) as 'dark' | 'light') || 'dark';
  });

  // Trades state
  const [trades, setTrades] = useState<Trade[]>(() => {
    const saved = localStorage.getItem(TRADES_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved trades', e);
      }
    }
    return INITIAL_TRADES;
  });

  // Rules state
  const [rules, setRules] = useState<TradingRule[]>(() => {
    const saved = localStorage.getItem(RULES_STORAGE_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_RULES;
  });

  // Checklist state
  const [checklist, setChecklist] = useState<ChecklistItem[]>(() => {
    const saved = localStorage.getItem(CHECKLIST_STORAGE_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_CHECKLIST;
  });

  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isNewTradeModalOpen, setIsNewTradeModalOpen] = useState<boolean>(false);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [marketFilter, setMarketFilter] = useState<string>('Indian');
  const [dateFilter, setDateFilter] = useState<string>('Last 30 Days');
  const [ticker, setTicker] = useState<MarketTickerItem[]>(INITIAL_TICKER);

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem(TRADES_STORAGE_KEY, JSON.stringify(trades));
  }, [trades]);

  useEffect(() => {
    localStorage.setItem(RULES_STORAGE_KEY, JSON.stringify(rules));
  }, [rules]);

  useEffect(() => {
    localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(checklist));
  }, [checklist]);

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [theme]);

  // Subtle live ticker fluctuation simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setTicker(prev => prev.map(item => {
        const delta = (Math.random() - 0.49) * 0.05;
        const newPercent = Number((item.changePercent + delta).toFixed(2));
        const newValue = Number((item.value * (1 + delta / 100)).toFixed(2));
        return {
          ...item,
          value: newValue,
          changePercent: newPercent
        };
      }));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const addTrade = (tradeData: Omit<Trade, 'id' | 'createdAt'>) => {
    const newTrade: Trade = {
      ...tradeData,
      id: 'tr-' + Date.now(),
      createdAt: new Date().toISOString()
    };
    
    setTrades(prev => [newTrade, ...prev]);

    // Celebrate if profitable
    if (newTrade.netPnl > 0) {
      try {
        confetti({
          particleCount: 75,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#10b981', '#34d399', '#6ee7b7', '#3b82f6']
        });
      } catch (e) {}
    }
  };

  const updateTrade = (id: string, updatedFields: Partial<Trade>) => {
    setTrades(prev => prev.map(t => (t.id === id ? { ...t, ...updatedFields } : t)));
  };

  const deleteTrade = (id: string) => {
    setTrades(prev => prev.filter(t => t.id !== id));
    if (selectedTrade?.id === id) {
      setSelectedTrade(null);
    }
  };

  const addRule = (rule: Omit<TradingRule, 'id'>) => {
    const newRule: TradingRule = {
      ...rule,
      id: 'rule-' + Date.now()
    };
    setRules(prev => [...prev, newRule]);
  };

  const toggleRule = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));
  };

  const deleteRule = (id: string) => {
    setRules(prev => prev.filter(r => r.id !== id));
  };

  const toggleChecklist = (id: string) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
  };

  const resetChecklist = () => {
    setChecklist(prev => prev.map(item => ({ ...item, completed: false })));
  };

  const exportCsv = () => {
    const csv = Papa.unparse(trades.map(t => ({
      Date: t.date,
      Time: t.time || '',
      Market: t.marketType,
      Duration: t.duration,
      Symbol: t.symbol,
      Direction: t.direction,
      EntryPrice: t.entryPrice,
      ExitPrice: t.exitPrice,
      Quantity: t.quantity,
      StopLoss: t.stopLoss || '',
      Target: t.target || '',
      Pnl: t.pnl,
      Fees: t.fees,
      NetPnl: t.netPnl,
      PnlPercent: t.pnlPercent,
      RiskReward: t.riskReward,
      Strategy: t.strategy,
      Outcome: t.outcome,
      Emotion: t.emotion,
      Confidence: t.confidence,
      Mistakes: t.mistakes.join('; '),
      Notes: t.notes || ''
    })));

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `trade-diary-export-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const importCsv = async (file: File): Promise<{ success: boolean; count: number; error?: string }> => {
    return new Promise(resolve => {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        complete: (results) => {
          try {
            const rawData = results.data as any[];
            const parsedTrades: Trade[] = [];

            rawData.forEach((row, idx) => {
              if (!row.Symbol && !row.symbol && !row.Date && !row.date) return;
              
              const entry = Number(row.EntryPrice || row.entryPrice || 0);
              const exit = Number(row.ExitPrice || row.exitPrice || 0);
              const qty = Number(row.Quantity || row.quantity || 1);
              const netPnl = Number(row.NetPnl || row.netPnl || (exit - entry) * qty);
              
              const newTrade: Trade = {
                id: 'tr-imp-' + Date.now() + '-' + idx,
                date: String(row.Date || row.date || new Date().toISOString().slice(0, 10)),
                time: String(row.Time || row.time || '10:00'),
                marketType: (row.Market || row.marketType || 'Indian') as MarketType,
                duration: (row.Duration || row.duration || 'Intraday'),
                symbol: String(row.Symbol || row.symbol || 'STOCK'),
                direction: (row.Direction || row.direction || (netPnl >= 0 ? 'Long' : 'Short')),
                entryPrice: entry,
                exitPrice: exit,
                quantity: qty,
                totalAmount: entry * qty,
                stopLoss: Number(row.StopLoss || row.stopLoss || 0),
                target: Number(row.Target || row.target || 0),
                pnl: Number(row.Pnl || row.pnl || netPnl),
                fees: Number(row.Fees || row.fees || 0),
                netPnl: netPnl,
                pnlPercent: Number(row.PnlPercent || row.pnlPercent || 0),
                riskReward: String(row.RiskReward || row.riskReward || '1:2.0'),
                strategy: String(row.Strategy || row.strategy || 'Breakout'),
                outcome: (row.Outcome || row.outcome || (netPnl >= 0 ? 'Full Success' : 'Loss')),
                emotion: (row.Emotion || row.emotion || 'Disciplined'),
                confidence: Number(row.Confidence || row.confidence || 80),
                mistakes: row.Mistakes ? String(row.Mistakes).split(';').map(s => s.trim()) : [],
                followedPlan: true,
                followedRisk: true,
                notes: String(row.Notes || row.notes || ''),
                createdAt: new Date().toISOString()
              };
              parsedTrades.push(newTrade);
            });

            if (parsedTrades.length > 0) {
              setTrades(prev => [...parsedTrades, ...prev]);
              resolve({ success: true, count: parsedTrades.length });
            } else {
              resolve({ success: false, count: 0, error: 'No valid trade rows found in CSV' });
            }
          } catch (err: any) {
            resolve({ success: false, count: 0, error: err?.message || 'Error processing CSV' });
          }
        },
        error: (error) => {
          resolve({ success: false, count: 0, error: error.message });
        }
      });
    });
  };

  const resetToSampleData = () => {
    setTrades(INITIAL_TRADES);
    setRules(INITIAL_RULES);
    setChecklist(INITIAL_CHECKLIST);
    localStorage.removeItem(TRADES_STORAGE_KEY);
    localStorage.removeItem(RULES_STORAGE_KEY);
    localStorage.removeItem(CHECKLIST_STORAGE_KEY);
  };

  return (
    <TradeContext.Provider
      value={{
        trades,
        addTrade,
        updateTrade,
        deleteTrade,
        activeTab,
        setActiveTab,
        isNewTradeModalOpen,
        setIsNewTradeModalOpen,
        selectedTrade,
        setSelectedTrade,
        theme,
        toggleTheme,
        marketFilter,
        setMarketFilter,
        dateFilter,
        setDateFilter,
        ticker,
        rules,
        addRule,
        toggleRule,
        deleteRule,
        checklist,
        toggleChecklist,
        resetChecklist,
        exportCsv,
        importCsv,
        resetToSampleData
      }}
    >
      {children}
    </TradeContext.Provider>
  );
};

export const useTradeContext = () => {
  const context = useContext(TradeContext);
  if (!context) {
    throw new Error('useTradeContext must be used within a TradeProvider');
  }
  return context;
};
