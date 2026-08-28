import React, { createContext, useContext, useState, useEffect } from 'react';
import { Trade, MarketType, TradingRule, ChecklistItem, MarketTickerItem, TradingStrategy, UserProfile, TradingChallenge } from '../types/trade';
import { INITIAL_TRADES, INITIAL_RULES, INITIAL_CHECKLIST, INITIAL_TICKER, INITIAL_STRATEGIES } from '../utils/mockData';
import { fetchCloudTrades, saveTradeToCloud, syncAllTradesToCloud, deleteTradeFromCloud, syncDhanTrades } from '../utils/cloudSync';
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
  // Auth state
  isAuthenticated: boolean;
  login: (email: string, password?: string) => void;
  logout: () => void;

  // Profile state
  userProfile: UserProfile;
  updateUserProfile: (profile: Partial<UserProfile>) => void;

  // Dhan Integration state
  dhanCredentials: { clientId: string; accessToken: string } | null;
  saveDhanCredentials: (clientId: string, accessToken: string) => void;
  syncFromDhan: (clientId?: string, accessToken?: string) => Promise<{ success: boolean; count: number; error?: string; message?: string }>;

  trades: Trade[];
  addTrade: (trade: Omit<Trade, 'id' | 'createdAt'>) => void;
  updateTrade: (id: string, trade: Partial<Trade>) => void;
  deleteTrade: (id: string) => void;
  
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  
  isNewTradeModalOpen: boolean;
  setIsNewTradeModalOpen: (open: boolean) => void;

  editingTrade: Trade | null;
  setEditingTrade: (trade: Trade | null) => void;
  
  selectedTrade: Trade | null;
  setSelectedTrade: (trade: Trade | null) => void;
  
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  
  marketFilter: string;
  setMarketFilter: (filter: string) => void;
  
  dateFilter: string;
  setDateFilter: (filter: string) => void;
  
  ticker: MarketTickerItem[];
  
  strategies: TradingStrategy[];
  addStrategy: (strat: Omit<TradingStrategy, 'id'>) => void;
  
  rules: TradingRule[];
  addRule: (rule: Omit<TradingRule, 'id'>) => void;
  toggleRule: (id: string) => void;
  deleteRule: (id: string) => void;
  
  checklist: ChecklistItem[];
  toggleChecklist: (id: string) => void;
  resetChecklist: () => void;

  // Challenge state
  challenge: TradingChallenge;
  saveChallenge: (challenge: TradingChallenge) => void;
  resetChallenge: () => void;
  
  isCloudSynced: boolean;
  syncToCloud: () => Promise<void>;
  
  exportCsv: () => void;
  importCsv: (file: File) => Promise<{ success: boolean; count: number; error?: string }>;
  resetToSampleData: () => void;
}

const TradeContext = createContext<TradeContextType | undefined>(undefined);

const TRADES_STORAGE_KEY = 'trade_diary_trades_v4_august_2026';
const THEME_STORAGE_KEY = 'trade_diary_theme_v4';
const RULES_STORAGE_KEY = 'trade_diary_rules_v4';
const STRATEGIES_STORAGE_KEY = 'trade_diary_strategies_v4';
const CHECKLIST_STORAGE_KEY = 'trade_diary_checklist_v4';
const AUTH_STORAGE_KEY = 'trade_diary_auth_v4';
const PROFILE_STORAGE_KEY = 'trade_diary_profile_v4';
const DHAN_CREDS_STORAGE_KEY = 'trade_diary_dhan_creds_v4';
const CHALLENGE_STORAGE_KEY = 'trade_diary_challenge_v4';

const DEFAULT_PROFILE: UserProfile = {
  name: 'Anoop Negi',
  email: 'anonegi5678@gmail.com',
  tradingStyle: 'Intraday Options Buyer',
  initialCapital: 100000,
  defaultFee: 55,
  bio: 'NSE & BSE F&O Index Trader specializing in Nifty and BankNifty setups.'
};

const DEFAULT_CHALLENGE: TradingChallenge = {
  id: 'challenge-aug-2026',
  name: 'August 2026 Capital Growth Challenge',
  startingCapital: 100000,
  targetCapital: 200000,
  startDate: '2026-08-01',
  targetDays: 30,
  maxRiskPerTrade: 2,
  maxDailyLoss: 3000,
  isActive: true,
  notes: 'Disciplined capital growth challenge with strict risk control.'
};

export const TradeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem(AUTH_STORAGE_KEY) === 'true';
  });

  // Profile state
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return DEFAULT_PROFILE;
  });

  // Challenge state (Persistent)
  const [challenge, setChallenge] = useState<TradingChallenge>(() => {
    const saved = localStorage.getItem(CHALLENGE_STORAGE_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return DEFAULT_CHALLENGE;
  });

  // Dhan Credentials state
  const [dhanCredentials, setDhanCredentials] = useState<{ clientId: string; accessToken: string } | null>(() => {
    const saved = localStorage.getItem(DHAN_CREDS_STORAGE_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return null;
  });

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

  // Strategies state
  const [strategies, setStrategies] = useState<TradingStrategy[]>(() => {
    const saved = localStorage.getItem(STRATEGIES_STORAGE_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_STRATEGIES;
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

  const [activeTab, setActiveTab] = useState<NavTab>('trades');
  const [isNewTradeModalOpen, setIsNewTradeModalOpen] = useState<boolean>(false);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [marketFilter, setMarketFilter] = useState<string>('Indian');
  const [dateFilter, setDateFilter] = useState<string>('August 2026');
  const [ticker, setTicker] = useState<MarketTickerItem[]>(INITIAL_TICKER);
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(true);

  // Login handler
  const login = (email: string) => {
    setIsAuthenticated(true);
    localStorage.setItem(AUTH_STORAGE_KEY, 'true');
    if (email) {
      setUserProfile(prev => {
        const next = { ...prev, email };
        localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    }
  };

  // Logout handler
  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  // Update profile handler
  const updateUserProfile = (fields: Partial<UserProfile>) => {
    setUserProfile(prev => {
      const next = { ...prev, ...fields };
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  // Save Challenge handler
  const saveChallenge = (newChallenge: TradingChallenge) => {
    setChallenge(newChallenge);
    localStorage.setItem(CHALLENGE_STORAGE_KEY, JSON.stringify(newChallenge));
  };

  const resetChallenge = () => {
    setChallenge(DEFAULT_CHALLENGE);
    localStorage.setItem(CHALLENGE_STORAGE_KEY, JSON.stringify(DEFAULT_CHALLENGE));
  };

  // Save Dhan Credentials handler
  const saveDhanCredentials = (clientId: string, accessToken: string) => {
    const creds = { clientId: clientId.trim(), accessToken: accessToken.trim() };
    setDhanCredentials(creds);
    localStorage.setItem(DHAN_CREDS_STORAGE_KEY, JSON.stringify(creds));
  };

  // Sync from DhanHQ API
  const syncFromDhan = async (clientIdParam?: string, accessTokenParam?: string) => {
    const cId = clientIdParam || dhanCredentials?.clientId;
    const aToken = accessTokenParam || dhanCredentials?.accessToken;

    if (!cId || !aToken) {
      return { success: false, count: 0, error: 'Dhan credentials not found. Please connect your Dhan account first.' };
    }

    const res = await syncDhanTrades(cId, aToken);
    if (res.success && res.trades && res.trades.length > 0) {
      setTrades(prev => {
        const existingIds = new Set(prev.map(t => t.id));
        const newTrades = res.trades!.filter(t => !existingIds.has(t.id));
        return [...newTrades, ...prev];
      });

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}
    }

    return res;
  };

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
    localStorage.setItem(STRATEGIES_STORAGE_KEY, JSON.stringify(strategies));
  }, [strategies]);

  useEffect(() => {
    localStorage.setItem(RULES_STORAGE_KEY, JSON.stringify(rules));
  }, [rules]);

  useEffect(() => {
    localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(checklist));
  }, [checklist]);

  useEffect(() => {
    localStorage.setItem(CHALLENGE_STORAGE_KEY, JSON.stringify(challenge));
  }, [challenge]);

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

  const addStrategy = (strat: Omit<TradingStrategy, 'id'>) => {
    const newStrat: TradingStrategy = {
      ...strat,
      id: 'strat-' + Date.now()
    };
    setStrategies(prev => [...prev, newStrat]);
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
      GrossPnL: t.pnl,
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
        isAuthenticated,
        login,
        logout,
        userProfile,
        updateUserProfile,
        challenge,
        saveChallenge,
        resetChallenge,
        dhanCredentials,
        saveDhanCredentials,
        syncFromDhan,
        trades,
        addTrade,
        updateTrade,
        deleteTrade,
        activeTab,
        setActiveTab,
        isNewTradeModalOpen,
        setIsNewTradeModalOpen,
        editingTrade,
        setEditingTrade,
        selectedTrade,
        setSelectedTrade,
        theme,
        toggleTheme,
        marketFilter,
        setMarketFilter,
        dateFilter,
        setDateFilter,
        ticker,
        strategies,
        addStrategy,
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
