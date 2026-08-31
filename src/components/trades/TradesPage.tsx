import React, { useState, useRef } from 'react';
import { useTradeContext } from '../../context/TradeContext';
import { Trade } from '../../types/trade';
import { formatINR } from '../../utils/calculations';
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Download,
  Upload,
  RefreshCw,
  Edit2,
  Trash2,
  Eye,
  BookOpen,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertOctagon,
  XCircle,
  FileSpreadsheet,
  Zap,
  Building,
  TrendingUp,
  Receipt,
  Wallet
} from 'lucide-react';
import { BrokerModal } from '../profile/BrokerModal';

export const TradesPage: React.FC = () => {
  const { 
    trades, 
    deleteTrade, 
    setIsNewTradeModalOpen, 
    editingTrade,
    setEditingTrade,
    setSelectedTrade,
    exportCsv,
    importCsv,
    dhanCredentials,
    syncFromDhan
  } = useTradeContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [strategyFilter, setStrategyFilter] = useState('All');
  const [outcomeFilter, setOutcomeFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest_pnl' | 'lowest_pnl'>('newest');
  const [isImporting, setIsImporting] = useState(false);
  const [isDhanSyncing, setIsDhanSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showBrokerModal, setShowBrokerModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Extract unique strategies for filter dropdown
  const strategies = ['All', ...Array.from(new Set(trades.map(t => t.strategy).filter(Boolean)))];

  // Filtering & Sorting logic
  const filteredTrades = trades.filter(t => {
    const matchesSearch = 
      t.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.notes && t.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.strategy && t.strategy.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStrategy = strategyFilter === 'All' || t.strategy === strategyFilter;
    const matchesOutcome = outcomeFilter === 'All' || t.outcome === outcomeFilter;

    return matchesSearch && matchesStrategy && matchesOutcome;
  }).sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.date).getTime() - new Date(a.date).getTime();
    if (sortBy === 'oldest') return new Date(a.date).getTime() - new Date(b.date).getTime();
    if (sortBy === 'highest_pnl') return b.netPnl - a.netPnl;
    if (sortBy === 'lowest_pnl') return a.netPnl - b.netPnl;
    return 0;
  });

  // Calculate totals
  const totalGrossPnl = filteredTrades.reduce((sum, t) => sum + (t.pnl || t.netPnl), 0);
  const totalTaxes = filteredTrades.reduce((sum, t) => sum + (t.fees || 0), 0);
  const totalNetPnl = filteredTrades.reduce((sum, t) => sum + t.netPnl, 0);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const result = await importCsv(file);
    setIsImporting(false);

    if (result.success) {
      setSyncFeedback({ type: 'success', message: `Successfully imported ${result.count} trades!` });
    } else {
      setSyncFeedback({ type: 'error', message: result.error || 'Failed to import CSV' });
    }

    setTimeout(() => setSyncFeedback(null), 5000);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDhanSyncClick = async () => {
    if (!dhanCredentials) {
      setShowBrokerModal(true);
      return;
    }

    setIsDhanSyncing(true);
    const res = await syncFromDhan();
    setIsDhanSyncing(false);

    if (res.success) {
      setSyncFeedback({
        type: 'success',
        message: res.count > 0 ? `🎉 ${res.count} live trades imported from Dhan into Journal!` : 'Dhan Synced: No new executed trades found today.'
      });
    } else {
      setSyncFeedback({
        type: 'error',
        message: res.error || 'Dhan sync failed. Please re-enter credentials in Broker modal.'
      });
    }

    setTimeout(() => setSyncFeedback(null), 5000);
  };

  const getOutcomeBadge = (outcome: string) => {
    switch (outcome) {
      case 'Full Success':
        return (
          <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            Full Success
          </span>
        );
      case 'Partial Success':
        return (
          <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            Partial Success
          </span>
        );
      case 'Mistake':
        return (
          <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
            Mistake
          </span>
        );
      case 'Loss':
        return (
          <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/20">
            Loss
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-500/20 text-slate-300">
            {outcome || 'N/A'}
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Controls Toolbar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-[#111a2e] light:bg-white p-4 rounded-2xl border border-[#1e2942] light:border-slate-200 shadow-lg">
        <div>
          <h2 className="text-lg font-black text-white light:text-slate-900 tracking-tight flex items-center gap-2">
            Trade History
            <span className="text-xs font-normal text-slate-400">
              ({filteredTrades.length} trades)
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Manage, review, and auto-sync trades directly from your Dhan terminal
          </p>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto">
          {/* Search input */}
          <div className="relative flex-1 sm:flex-none sm:w-44">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search symbol..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#16223b] light:bg-slate-100 text-slate-200 light:text-slate-800 text-xs border border-[#23355b] light:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#16223b] light:bg-slate-100 text-slate-300 light:text-slate-700 text-xs rounded-xl px-3 py-2 border border-[#23355b] light:border-slate-300 focus:outline-none appearance-none pr-7 cursor-pointer"
            >
              <option value="newest">Sort: Newest</option>
              <option value="oldest">Sort: Oldest</option>
              <option value="highest_pnl">Highest P&L</option>
              <option value="lowest_pnl">Lowest P&L</option>
            </select>
            <ArrowUpDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* Strategy Filter */}
          <select
            value={strategyFilter}
            onChange={(e) => setStrategyFilter(e.target.value)}
            className="bg-[#16223b] light:bg-slate-100 text-slate-300 light:text-slate-700 text-xs rounded-xl px-3 py-2 border border-[#23355b] light:border-slate-300 focus:outline-none cursor-pointer"
          >
            {strategies.map(s => (
              <option key={s} value={s}>{s === 'All' ? 'All Setups' : s}</option>
            ))}
          </select>

          {/* Dhan Live Auto-Sync Button */}
          <button
            onClick={handleDhanSyncClick}
            disabled={isDhanSyncing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-xs font-bold border border-emerald-500/30 transition-all cursor-pointer disabled:opacity-50"
            title="Auto-fetch today's trades from DhanHQ API"
          >
            <Zap className={`w-3.5 h-3.5 ${isDhanSyncing ? 'animate-spin' : ''}`} />
            <span>{isDhanSyncing ? 'Syncing...' : 'Sync Dhan'}</span>
          </button>

          {/* CSV Export Button */}
          <button
            onClick={exportCsv}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-[#16223b] light:bg-slate-100 hover:bg-[#1f2f52] light:hover:bg-slate-200 text-slate-300 light:text-slate-700 text-xs font-semibold border border-[#23355b] light:border-slate-300 transition-all cursor-pointer"
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>

          {/* + New Trade Button */}
          <button
            onClick={() => setIsNewTradeModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-500/25 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Log Trade</span>
          </button>
        </div>
      </div>

      {/* Sync / Import Feedback Banner */}
      {syncFeedback && (
        <div className={`p-3.5 rounded-2xl border text-xs font-semibold flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in duration-200 ${
          syncFeedback.type === 'success'
            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
            : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
        }`}>
          <div className="flex items-center gap-2">
            <span>{syncFeedback.message}</span>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {syncFeedback.type === 'error' && (syncFeedback.message.includes('401') || syncFeedback.message.includes('expired') || syncFeedback.message.includes('token') || syncFeedback.message.includes('credentials')) && (
              <button
                onClick={() => setShowBrokerModal(true)}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-md transition-all cursor-pointer whitespace-nowrap"
              >
                ⚡ Update Dhan Access Token
              </button>
            )}
            <button onClick={() => setSyncFeedback(null)} className="text-slate-400 hover:text-white p-1">✕</button>
          </div>
        </div>
      )}

      {/* Realised vs Net P&L Summary Cards */}
      {filteredTrades.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-md">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-blue-400" /> Dhan Realised P&L (Gross)
            </span>
            <div className={`text-xl font-black mt-1 ${totalGrossPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatINR(totalGrossPnl)}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Matches Dhan Positions Tab</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-md">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5 text-amber-400" /> Brokerage & Govt Taxes
            </span>
            <div className="text-xl font-black text-amber-400 mt-1">
              -{formatINR(totalTaxes)}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">₹40 Brokerage + STT + GST + NSE</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-md">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-emerald-400" /> Net In-Hand P&L
            </span>
            <div className={`text-xl font-black mt-1 ${totalNetPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatINR(totalNetPnl)}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Actual take-home profit</p>
          </div>
        </div>
      )}

      {/* Trades Table Card */}
      <div className="bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#16223b] light:bg-slate-50 border-b border-[#1e2942] light:border-slate-200 text-slate-400 light:text-slate-600 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Symbol / Contract</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Entry (₹)</th>
                <th className="py-3.5 px-4">Exit (₹)</th>
                <th className="py-3.5 px-4">Qty</th>
                <th className="py-3.5 px-4">Gross P&L (Dhan)</th>
                <th className="py-3.5 px-4">Taxes (₹)</th>
                <th className="py-3.5 px-4">Net P&L</th>
                <th className="py-3.5 px-4">R:R</th>
                <th className="py-3.5 px-4">Strategy</th>
                <th className="py-3.5 px-4">Outcome</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2942] light:divide-slate-200">
              {filteredTrades.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-16 text-center text-slate-400">
                    <div className="max-w-xs mx-auto space-y-2">
                      <BookOpen className="w-8 h-8 text-slate-600 mx-auto" />
                      <p className="font-bold text-slate-300 light:text-slate-700">No trades in August 2026 yet</p>
                      <p className="text-xs text-slate-500">
                        Click <strong className="text-emerald-400">"Sync Dhan"</strong> to import today's terminal trades or <strong className="text-blue-400">"Log Trade"</strong> manually.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTrades.map(trade => {
                  const grossPnl = trade.pnl || trade.netPnl;
                  const isGrossWin = grossPnl >= 0;
                  const isNetWin = trade.netPnl >= 0;

                  return (
                    <tr
                      key={trade.id}
                      className="hover:bg-[#16223b]/60 light:hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono text-slate-300 light:text-slate-700">
                        <div>{new Date(trade.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</div>
                        <div className="text-[10px] text-slate-500">{trade.time || '10:00 AM'}</div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-white light:text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <span>{trade.symbol}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                            trade.direction === 'Long' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                          }`}>
                            {trade.direction}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 light:text-slate-700">
                        <span className="text-[11px] bg-[#16223b] light:bg-slate-100 px-2 py-0.5 rounded border border-[#23355b] light:border-slate-200">
                          {trade.tradeType || 'Option Buying'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-300 light:text-slate-800">
                        ₹{trade.entryPrice}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-300 light:text-slate-800">
                        ₹{trade.exitPrice}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-300 light:text-slate-800">
                        {trade.quantity}
                      </td>
                      
                      {/* Gross Realised P&L */}
                      <td className="py-3.5 px-4 font-mono font-bold">
                        <span className={`flex items-center gap-0.5 ${isGrossWin ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isGrossWin ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                          {formatINR(grossPnl)}
                        </span>
                      </td>

                      {/* Taxes & Charges */}
                      <td className="py-3.5 px-4 font-mono text-amber-400 font-medium">
                        -₹{trade.fees || 0}
                      </td>

                      {/* Net In-Hand P&L */}
                      <td className="py-3.5 px-4 font-mono font-black">
                        <span className={`flex items-center gap-0.5 ${isNetWin ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isNetWin ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                          {formatINR(trade.netPnl)}
                        </span>
                      </td>
                      
                      {/* R:R Ratio */}
                      <td className="py-3.5 px-4 font-mono font-bold">
                        <span className="px-2 py-0.5 rounded-md text-[11px] bg-blue-500/15 text-blue-400 border border-blue-500/20">
                          {trade.riskReward || '1:2.0'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-300 light:text-slate-700 font-semibold">
                        {trade.strategy || 'Breakout'}
                      </td>
                      <td className="py-3.5 px-4">
                        {getOutcomeBadge(trade.outcome)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setEditingTrade(trade);
                              setIsNewTradeModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 border border-blue-500/30 transition-colors cursor-pointer"
                            title="Edit Trade Details & Psychology"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setSelectedTrade(trade)}
                            className="p-1.5 rounded-lg bg-[#16223b] light:bg-slate-100 text-slate-400 hover:text-white light:hover:text-slate-900 transition-colors cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete trade ${trade.symbol}?`)) {
                                deleteTrade(trade.id);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-[#16223b] light:bg-slate-100 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                            title="Delete Trade"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <BrokerModal
        isOpen={showBrokerModal}
        onClose={() => setShowBrokerModal(false)}
      />
    </div>
  );
};
