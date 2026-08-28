import React from 'react';
import { useTradeContext, NavTab } from '../../context/TradeContext';
import {
  LayoutDashboard,
  CheckSquare,
  TrendingUp,
  Lightbulb,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  BarChart3,
  Scale,
  Calendar,
  Trophy,
  Plus,
  Zap
} from 'lucide-react';

interface NavItem {
  id: NavTab;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

interface SidebarProps {
  onNavigate?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onNavigate }) => {
  const { activeTab, setActiveTab, setIsNewTradeModalOpen } = useTradeContext();

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'checklist', label: 'Trading Checklist', icon: CheckSquare },
    { id: 'trades', label: 'Trades', icon: TrendingUp },
    { id: 'strategies', label: 'Strategies', icon: Lightbulb },
    { id: 'rules', label: 'Rules', icon: ShieldCheck },
    { id: 'mistakes', label: 'Mistakes', icon: AlertTriangle },
    { id: 'ai-summarizer', label: 'AI Summarizer', icon: Sparkles },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'risk-management', label: 'Risk Management', icon: Scale },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'challenge', label: 'Challenge', icon: Trophy },
    { id: 'option-trading', label: 'Option Trading', icon: Zap, badge: 'PRO' }
  ];

  return (
    <aside className="w-64 bg-[#0a101f] light:bg-slate-900 border-r border-[#1e2942] light:border-slate-800 flex flex-col shrink-0 h-screen sticky top-0 transition-colors">
      {/* Brand Header */}
      <div className="p-5 flex items-center justify-between border-b border-[#1e2942] light:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
            <TrendingUp className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
              Trade Diary
            </h1>
            <p className="text-[10px] text-blue-400 font-medium">Advanced Journal</p>
          </div>
        </div>
      </div>

      {/* New Trade Primary Button in Sidebar */}
      <div className="px-4 py-3">
        <button
          onClick={() => {
            setIsNewTradeModalOpen(true);
            onNavigate?.();
          }}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          + New Trade
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto no-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                onNavigate?.();
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-inner font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#131d35]/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-md">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer info */}
      <div className="p-3.5 border-t border-[#1e2942] light:border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
        <span>v2.5 Pro Sync</span>
        <span className="inline-flex items-center gap-1 text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          Cloud Connected
        </span>
      </div>
    </aside>
  );
};
