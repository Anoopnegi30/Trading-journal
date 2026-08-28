import React, { useState } from 'react';
import { useTradeContext } from '../../context/TradeContext';
import { 
  Sun, 
  Moon, 
  Settings, 
  ChevronDown, 
  TrendingUp, 
  TrendingDown, 
  User, 
  LogOut, 
  Database,
  RotateCcw,
  Sparkles
} from 'lucide-react';

export const TickerBar: React.FC = () => {
  const { ticker, theme, toggleTheme, resetToSampleData } = useTradeContext();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  return (
    <header className="sticky top-0 z-30 w-full bg-[#0d1527]/90 dark:bg-[#0d1527]/95 light:bg-white/95 backdrop-blur-md border-b border-[#1e2942] light:border-slate-200 px-4 py-2.5 flex items-center justify-between gap-4 transition-colors">
      {/* Brand logo for mobile/header */}
      <div className="flex items-center gap-3 shrink-0 lg:hidden">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 font-bold">
          <TrendingUp className="w-5 h-5" />
        </div>
        <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-blue-400 via-indigo-300 to-white bg-clip-text text-transparent">
          Trade Diary
        </span>
      </div>

      {/* Live Market Ticker */}
      <div className="flex-1 overflow-hidden relative mx-2 hidden sm:block">
        <div className="flex items-center gap-6 whitespace-nowrap overflow-x-auto no-scrollbar scroll-smooth">
          {ticker.map((item, idx) => {
            const isPositive = item.changePercent >= 0;
            return (
              <div
                key={idx}
                className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md bg-[#131d35]/60 light:bg-slate-100 border border-[#1e2d4d] light:border-slate-200 transition-all hover:bg-[#192647]"
              >
                <span className="font-medium text-slate-300 light:text-slate-700">{item.name}:</span>
                <span
                  className={`font-semibold flex items-center gap-0.5 ${
                    isPositive ? 'text-emerald-400 light:text-emerald-600' : 'text-rose-400 light:text-rose-600'
                  }`}
                >
                  {isPositive ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {isPositive ? `+${item.changePercent.toFixed(2)}%` : `${item.changePercent.toFixed(2)}%`}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right controls: Settings, Dark/Light Mode, Profile */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Settings Button */}
        <button
          onClick={() => setShowSettingsModal(!showSettingsModal)}
          className="p-2 rounded-xl text-slate-400 hover:text-white light:hover:text-slate-900 hover:bg-[#16223d] light:hover:bg-slate-100 border border-transparent hover:border-[#23355b] transition-all"
          title="Settings & Data Management"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="relative flex items-center bg-[#131d35] light:bg-slate-200 p-1 rounded-full border border-[#23355b] light:border-slate-300 transition-all"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          <div className="flex items-center gap-1 px-1">
            <Moon className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-blue-400' : 'text-slate-400'}`} />
            <Sun className={`w-3.5 h-3.5 ${theme === 'light' ? 'text-amber-500' : 'text-slate-500'}`} />
          </div>
          <div
            className={`absolute top-0.5 w-4 h-4 rounded-full bg-blue-500 shadow-md transform transition-transform duration-200 ease-in-out ${
              theme === 'dark' ? 'left-0.5' : 'left-5'
            }`}
          />
        </button>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 p-1 pr-2.5 rounded-xl hover:bg-[#16223d] light:hover:bg-slate-100 transition-all border border-transparent hover:border-[#23355b]"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs ring-2 ring-blue-500/30">
              P
            </div>
            <span className="text-xs font-semibold text-slate-200 light:text-slate-800 hidden md:inline">
              Pratyay Prakash
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 border-b border-[#1e2942] light:border-slate-100 mb-1">
                <p className="text-xs font-semibold text-white light:text-slate-900">Pratyay Prakash</p>
                <p className="text-[11px] text-slate-400 truncate">anonegi5678@gmail.com</p>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    PRO TRADER
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/20 text-emerald-400">
                    Live Sync
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  resetToSampleData();
                  setShowProfileMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-300 light:text-slate-700 hover:bg-[#1a2744] light:hover:bg-slate-100 rounded-xl transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                Reset Sample Trades
              </button>

              <button
                onClick={() => setShowProfileMenu(false)}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white light:text-slate-900 flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-400" /> Settings & Data
              </h3>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-slate-400 hover:text-white text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-300 light:text-slate-600">
              <div className="p-3.5 rounded-xl bg-[#16223b] light:bg-slate-50 border border-[#23355b] light:border-slate-200 space-y-2">
                <p className="font-semibold text-slate-200 light:text-slate-800">Account / Deployment</p>
                <p>Email: <span className="text-blue-400 font-mono">anonegi5678@gmail.com</span></p>
                <p>Storage: <span className="text-emerald-400 font-mono">Browser LocalStorage (Encrypted)</span></p>
                <p>Cloud Sync: <span className="text-emerald-400">Ready for Cloudflare Pages</span></p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#16223b] light:bg-slate-50 border border-[#23355b] light:border-slate-200">
                <p className="font-semibold text-slate-200 light:text-slate-800 mb-2">Data Management</p>
                <button
                  onClick={() => {
                    resetToSampleData();
                    setShowSettingsModal(false);
                  }}
                  className="w-full py-2 px-3 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition-all font-medium flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Restore Default Mock Data
                </button>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-medium text-xs hover:bg-blue-500 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
