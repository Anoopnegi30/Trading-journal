import React, { useState } from 'react';
import { TradeProvider, useTradeContext } from './context/TradeContext';
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
import { Menu, X } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeTab, isAuthenticated } = useTradeContext();
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
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10 w-64 h-full bg-[#0a101f] shadow-2xl">
            <Sidebar />
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
      <div className="flex-1 flex flex-col min-w-0">
        {/* Ticker & Navigation Header */}
        <TickerBar />

        {/* Mobile Menu Trigger Bar */}
        <div className="lg:hidden px-4 py-2 bg-[#0d1527] border-b border-[#1e2942] flex items-center justify-between">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex items-center gap-2 text-xs font-bold text-slate-300 bg-[#16223b] px-3 py-1.5 rounded-xl border border-[#23355b]"
          >
            <Menu className="w-4 h-4" /> Menu
          </button>
          <span className="text-xs font-bold text-blue-400 capitalize">
            {activeTab.replace('-', ' ')}
          </span>
        </div>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-3 sm:p-5 lg:p-6 max-w-7xl w-full mx-auto pb-24">
          {renderActivePage()}
        </main>
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
