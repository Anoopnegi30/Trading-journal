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
  FileSpreadsheet
} from 'lucide-react';

export const TradesPage: React.FC = () => {
  const { 
    trades, 
    deleteTrade, 
    setIsNewTradeModalOpen, 
    setSelectedTrade,
    exportCsv,
    importCsv
  } = useTradeContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [strategyFilter, setStrategyFilter] = useState('All');
  const [outcomeFilter, setOutcomeFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest_pnl' | 'lowest_pnl'>('newest');
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const res = await importCsv(file);
    setIsImporting(false);

    if (res.success) {
      setImportStatus(`Successfully imported ${res.count} trades!`);
    } else {
      setImportStatus(`Import failed: ${res.error || 'Invalid file format'}`);
    }

    setTimeout(() => setImportStatus(null), 4000);
    if (fileInputRef.current) fileInputRef.current.value = '';
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
      {/* Header & Controls Toolbar matching screenshot 4 */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-[#111a2e] light:bg-white p-4 rounded-2xl border border-[#1e2942] light:border-slate-200 shadow-lg">
        <div>
          <h2 className="text-lg font-black text-white light:text-slate-900 tracking-tight flex items-center gap-2">
            Trade History
            <span className="text-xs font-normal text-slate-400">
              ({filteredTrades.length} trades)
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Manage, review, and filter all logged trades
          </p>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto">
          {/* Search input */}
          <div className="relative flex-1 sm:flex-none sm:w-48">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search symbol, notes..."
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
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="highest_pnl">Sort: Highest P&L</option>
              <option value="lowest_pnl">Sort: Lowest P&L</option>
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
              <option key={s} value={s}>Strategy: {s}</option>
            ))}
          </select>

          {/* CSV Export Button */}
          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#16223b] light:bg-slate-100 hover:bg-[#1f2f52] light:hover:bg-slate-200 text-slate-300 light:text-slate-700 text-xs font-semibold border border-[#23355b] light:border-slate-300 transition-all"
            title="Export trades as CSV"
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </button>

          {/* CSV Import Button */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#16223b] light:bg-slate-100 hover:bg-[#1f2f52] light:hover:bg-slate-200 text-slate-300 light:text-slate-700 text-xs font-semibold border border-[#23355b] light:border-slate-300 transition-all"
            title="Import trades from CSV"
          >
            <Upload className="w-3.5 h-3.5" />
            {isImporting ? 'Importing...' : 'Import'}
          </button>

          {/* New Trade Primary CTA */}
          <button
            onClick={() => setIsNewTradeModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all transform active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            New Trade
          </button>
        </div>
      </div>

      {/* Import Status Alert */}
      {importStatus && (
        <div className="p-3 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs flex items-center justify-between">
          <span>{importStatus}</span>
          <button onClick={() => setImportStatus(null)} className="font-bold">✕</button>
        </div>
      )}

      {/* Main Trade History Data Table */}
      <div className="rounded-2xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1e2942] light:border-slate-200 bg-[#0d1527]/70 light:bg-slate-50 text-[11px] font-black tracking-wider text-slate-400 uppercase">
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Symbol</th>
                <th className="py-3.5 px-4">Direction</th>
                <th className="py-3.5 px-4">Entry / Exit</th>
                <th className="py-3.5 px-4">P/L</th>
                <th className="py-3.5 px-4">R:R</th>
                <th className="py-3.5 px-4">Strategy</th>
                <th className="py-3.5 px-4">Outcome</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#18243e] light:divide-slate-100 text-xs">
              {filteredTrades.map((t) => {
                const isProfit = t.netPnl > 0;
                const isLoss = t.netPnl < 0;
                const isNoTrade = t.isNoTradeDay;

                return (
                  <tr
                    key={t.id}
                    className="hover:bg-[#152038]/60 light:hover:bg-slate-50 transition-colors group cursor-pointer"
                    onClick={() => setSelectedTrade(t)}
                  >
                    {/* Date */}
                    <td className="py-4 px-4 font-semibold text-slate-300 light:text-slate-800 whitespace-nowrap">
                      {new Date(t.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>

                    {/* Symbol */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="font-bold text-white light:text-slate-900 group-hover:text-blue-400 transition-colors">
                        {t.symbol}
                      </div>
                      {t.marketType && (
                        <div className="text-[10px] text-slate-400">
                          {t.marketType} • {t.duration}
                        </div>
                      )}
                    </td>

                    {/* Direction */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      {isNoTrade ? (
                        <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-700/50 text-slate-300">
                          No Trade
                        </span>
                      ) : (
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 ${
                            t.direction === 'Long'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {t.direction === 'Long' ? 'Long' : 'Short'}
                        </span>
                      )}
                    </td>

                    {/* Entry / Exit */}
                    <td className="py-4 px-4 font-mono text-slate-300 light:text-slate-700 whitespace-nowrap">
                      {isNoTrade ? (
                        <span className="text-slate-500">₹0 / Open</span>
                      ) : (
                        <div>
                          <div>₹{t.entryPrice.toLocaleString('en-IN')}</div>
                          <div className="text-[11px] text-slate-400">₹{t.exitPrice.toLocaleString('en-IN')}</div>
                        </div>
                      )}
                    </td>

                    {/* P/L */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      {isNoTrade ? (
                        <span className="text-slate-500 font-bold">-</span>
                      ) : (
                        <div>
                          <span
                            className={`font-black ${
                              isProfit ? 'text-emerald-400' : isLoss ? 'text-rose-400' : 'text-slate-300'
                            }`}
                          >
                            {isProfit ? `+${formatINR(t.netPnl)}` : formatINR(t.netPnl)}
                          </span>
                          <div
                            className={`text-[10px] font-semibold ${
                              isProfit ? 'text-emerald-500' : isLoss ? 'text-rose-500' : 'text-slate-400'
                            }`}
                          >
                            {t.pnlPercent > 0 ? `+${t.pnlPercent}%` : `${t.pnlPercent}%`}
                          </div>
                        </div>
                      )}
                    </td>

                    {/* R:R */}
                    <td className="py-4 px-4 font-mono text-slate-300 light:text-slate-700 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-[#18233c] light:bg-slate-100 text-[11px]">
                        {t.riskReward || 'N/A'}
                      </span>
                    </td>

                    {/* Strategy */}
                    <td className="py-4 px-4 font-medium text-slate-200 light:text-slate-800 whitespace-nowrap">
                      {t.strategy || '-'}
                    </td>

                    {/* Outcome */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      {getOutcomeBadge(t.outcome)}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedTrade(t)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                          title="View Trade Notes & Psychology"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete trade ${t.symbol}?`)) {
                              deleteTrade(t.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                          title="Delete Trade"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredTrades.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 text-sm">
                    No trades match your search criteria. Click "+ New Trade" to record one!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
