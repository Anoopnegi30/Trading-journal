import React, { createContext, useContext, useState, useEffect } from 'react';
import { Trade, MarketType, TradingRule, ChecklistItem, MarketTickerItem } from '../types/trade';
import { INITIAL_TRADES, INITIAL_RULES, INITIAL_CHECKLIST, INITIAL_TICKER } from '../utils/mockData';
import { fetchCloudTrades, saveTradeToCloud, syncAllTradesToCloud, deleteTradeFromCloud } from '../utils/cloudSync';
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
  | 'challenge' 
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
  
  isCloudSynced: boolean;
  syncToCloud: () => Promise<void>;
  
  exportCsv: () => void;
  importCsv: (file: File) => Promise<{ success: boolean; count: number; error?: string }>;
  resetToSampleData: () => void;
}

const TradeContext = createContext<TradeContextType | undefined>(undefined);

const TRADES_STORAGE_KEY = 'trade_diary_trades_v3_august_2026';
const THEME_STORAGE_KEY = 'trade_diary_theme_v3';
const RULES_STORAGE_KEY = 'trade_diary_rules_v3';
const CHECKLIST_STORAGE_KEY = 'trade_diary_checklist_v3';

export const TradeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem(THEME_STORAGE_KEY) as 'dark' | 'light') || 'dark';
  });

  // Trades state - Fresh start from August 2026
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
  const [dateFilter, setDateFilter] = useState<string>('August 2026');
  const [ticker, setTicker] = useState<MarketTickerItem[]>(INITIAL_TICKER);
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(true);

  // Initial cloud fetch on startup
  useEffect(() => {
    fetchCloudTrades().then(cloudTrades => {
      if (cloudTrades && Array.isArray(cloudTrades)) {
        setTrades(cloudTrades);
        setIsCloudSynced(true);
      }
    });
  }, []);

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

  const syncToCloud = async () => {
    setIsCloudSynced(false);
    await syncAllTradesToCloud(trades);
    setIsCloudSynced(true);
  };

  const addTrade = (tradeData: Omit<Trade, 'id' | 'createdAt'>) => {
    const newTrade: Trade = {
      ...tradeData,
      id: 'tr-' + Date.now(),
      createdAt: new Date().toISOString()
    };
    
    setTrades(prev => [newTrade, ...prev]);
    saveTradeToCloud(newTrade);

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
    setTrades(prev => {
      const next = prev.map(t => (t.id === id ? { ...t, ...updatedFields } : t));
      const updatedItem = next.find(t => t.id === id);
      if (updatedItem) saveTradeToCloud(updatedItem);
      return next;
    });
  };

  const deleteTrade = (id: string) => {
    setTrades(prev => prev.filter(t => t.id !== id));
    deleteTradeFromCloud(id);
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
      Fees: t.fees,
      NetPnL: t.netPnl,
      Strategy: t.strategy,
      Emotion: t.emotion,
      Confidence: t.confidence,
      Mistakes: (t.mistakes || []).join('; '),
      Notes: t.notes || ''
    })));

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `trade_diary_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const importCsv = async (file: File): Promise<{ success: boolean; count: number; error?: string }> => {
    return new Promise((resolve) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const rows = results.data as any[];
            const importedTrades: Trade[] = rows.map((row, i) => {
              const entry = parseFloat(row.EntryPrice || row.Entry || '0') || 0;
              const exit = parseFloat(row.ExitPrice || row.Exit || '0') || 0;
              const qty = parseFloat(row.Quantity || row.Qty || '1') || 1;
              const fees = parseFloat(row.Fees || row.Charges || '0') || 0;
              const dir = (row.Direction || 'Long').toLowerCase().includes('short') ? 'Short' : 'Long';
              const gross = (exit - entry) * qty;
              const net = row.NetPnL ? parseFloat(row.NetPnL) : gross - fees;

              return {
                id: `import-${Date.now()}-${i}`,
                date: row.Date || new Date().toISOString().split('T')[0],
                time: row.Time || '10:00',
                marketType: (row.Market || 'Indian') as MarketType,
                duration: (row.Duration || 'Intraday') as any,
                symbol: (row.Symbol || 'SYMBOL').toUpperCase(),
                direction: dir as any,
                entryPrice: entry,
                exitPrice: exit,
                quantity: qty,
                totalAmount: entry * qty,
                fees: fees,
                pnl: gross,
                netPnl: net,
                pnlPercent: entry > 0 ? Number(((gross / (entry * qty)) * 100).toFixed(2)) : 0,
                riskReward: '1:2.0',
                strategy: row.Strategy || 'Breakout',
                outcome: net >= 0 ? 'Full Success' : 'Loss',
                emotion: (row.Emotion || 'Disciplined') as any,
                confidence: parseInt(row.Confidence || '80', 10) || 80,
                mistakes: row.Mistakes ? row.Mistakes.split(';').map((s: string) => s.trim()).filter(Boolean) : [],
                followedPlan: true,
                followedRisk: true,
                notes: row.Notes || 'Imported via CSV',
                createdAt: new Date().toISOString()
              };
            });

            if (importedTrades.length > 0) {
              setTrades(prev => [...importedTrades, ...prev]);
              syncAllTradesToCloud(importedTrades);
              resolve({ success: true, count: importedTrades.length });
            } else {
              resolve({ success: false, count: 0, error: 'No valid trade rows found in CSV' });
            }
          } catch (err: any) {
            resolve({ success: false, count: 0, error: err.message || 'Parsing error' });
          }
        },
        error: (error) => {
          resolve({ success: false, count: 0, error: error.message });
        }
      });
    });
  };

  const resetToSampleData = () => {
    if (window.confirm('Clear all trade data and start fresh from August 2026?')) {
      setTrades([]);
      syncAllTradesToCloud([]);
      localStorage.removeItem(TRADES_STORAGE_KEY);
    }
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
        isCloudSynced,
        syncToCloud,
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
