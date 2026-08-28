import React, { useState } from 'react';
import { TradeProvider, useTradeContext, NavTab } from './context/TradeContext';
import { LoginPage } from './components/auth/LoginPage';
import { Sidebar } from './components/layout/Sidebar';
import { TickerBar } from './components/layout/TickerBar';
import { DashboardPage } from './components/dashboard/DashboardPage';
import { TradesPage } from './components/trades/TradesPage';
import { CalendarPage } from './components/calendar/CalendarPage';
import { StrategiesPage } from './components/strategies/StrategiesPage';
import { MistakesPage } from './components/mistakes/MistakesPage';
import { ChecklistPage } from './components/checklist/ChecklistPage';
import { RulesPage } from './components/rules/RulesPage';
import { AiSummarizerPage } from './components/ai/AiSummarizerPage';
import { RiskManagementPage } from './components/risk/RiskManagementPage';
import { ReportsPage } from './components/reports/ReportsPage';
import { ChallengePage } from './components/challenge/ChallengePage';
import { NewTradeModal } from './components/modal/NewTradeModal';
import { TradeDetailModal } from './components/trades/TradeDetailModal';
import { AiChatWidget } from './components/ai/AiChatWidget';
import { 
  Menu, 
  X, 
  LayoutDashboard, 
  TrendingUp, 
  Trophy, 
  Lightbulb, 
  Plus,
  Layers
} from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeTab, setActiveTab, isAuthenticated, setIsNewTradeModalOpen } = useTradeContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If not authenticated, render Login Page
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage />;
      case 'trades':
        return <TradesPage />;
      case 'calendar':
        return <CalendarPage />;
      case 'strategies':
        return <StrategiesPage />;
      case 'mistakes':
        return <MistakesPage />;
      case 'checklist':
        return <ChecklistPage />;
      case 'rules':
        return <RulesPage />;
      case 'ai-summarizer':
        return <AiSummarizerPage />;
      case 'risk-management':
        return <RiskManagementPage />;
      case 'reports':
        return <ReportsPage />;
      case 'challenge':
        return <ChallengePage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0a0f1d] light:bg-[#f1f5f9] text-slate-100 light:text-slate-900 transition-colors">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex animate-in fade-in duration-200">
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10 w-64 h-full bg-[#0a101f] shadow-2xl">
            <Sidebar onNavigate={() => setMobileMenuOpen(false)} />
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-4 right-4 text-slate-400 p-1.5 rounded-lg bg-[#16223b]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
        {/* Ticker & Navigation Header */}
        <TickerBar />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-3 sm:p-5 lg:p-6 max-w-7xl w-full mx-auto">
          {renderActivePage()}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Phone view) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0a101f]/95 backdrop-blur-md border-t border-[#1e2942] px-2 py-1.5 flex items-center justify-around shadow-2xl">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-[10px] font-bold transition-all ${
            activeTab === 'dashboard' ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('trades')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-[10px] font-bold transition-all ${
            activeTab === 'trades' ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-5 h-5" />
          <span>Trades</span>
        </button>

        {/* Center Quick + Log Trade Button */}
        <button
          onClick={() => setIsNewTradeModalOpen(true)}
          className="w-11 h-11 -mt-4 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/40 transform active:scale-95 transition-transform"
        >
          <Plus className="w-6 h-6 stroke-[3]" />
        </button>

        <button
          onClick={() => setActiveTab('challenge')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-[10px] font-bold transition-all ${
            activeTab === 'challenge' ? 'text-amber-400 bg-amber-500/10' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Trophy className="w-5 h-5" />
          <span>Challenge</span>
        </button>

        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-[10px] font-bold text-slate-400 hover:text-slate-200"
        >
          <Menu className="w-5 h-5" />
          <span>Menu</span>
        </button>
      </div>

      {/* Global Modals & Widgets */}
      <NewTradeModal />
      <TradeDetailModal />
      <AiChatWidget />
    </div>
  );
};

export default function App() {
  return (
    <TradeProvider>
      <MainContent />
    </TradeProvider>
  );
}
