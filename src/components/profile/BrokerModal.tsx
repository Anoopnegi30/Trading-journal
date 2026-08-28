import React, { useState } from 'react';
import { X, CheckCircle2, RefreshCw, ShieldCheck } from 'lucide-react';
import { useTradeContext } from '../../context/TradeContext';

interface BrokerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Broker {
  id: string;
  name: string;
  tagline: string;
  category: 'Indian' | 'Crypto';
  iconBg: string;
  iconText: string;
}

export const BrokerModal: React.FC<BrokerModalProps> = ({ isOpen, onClose }) => {
  const { addTrade } = useTradeContext();
  const [selectedBroker, setSelectedBroker] = useState<Broker | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [connectedBrokers, setConnectedBrokers] = useState<string[]>(['zerodha']);
  const [syncSuccess, setSyncSuccess] = useState(false);

  if (!isOpen) return null;

  const brokers: Broker[] = [
    {
      id: 'dhan',
      name: 'Dhan',
      tagline: 'Trade like a Super Trader!',
      category: 'Indian',
      iconBg: 'bg-emerald-600',
      iconText: 'ध'
    },
    {
      id: 'angel_one',
      name: 'Angel One',
      tagline: "India's largest retail stockbroker",
      category: 'Indian',
      iconBg: 'bg-gradient-to-tr from-rose-500 to-blue-600',
      iconText: 'A'
    },
    {
      id: 'zerodha',
      name: 'Zerodha',
      tagline: 'Connect with Zerodha Kite',
      category: 'Indian',
      iconBg: 'bg-orange-500',
      iconText: 'Z'
    },
    {
      id: 'upstox',
      name: 'Upstox',
      tagline: 'Trade Smart Online',
      category: 'Indian',
      iconBg: 'bg-purple-600',
      iconText: 'up'
    },
    {
      id: 'fyers',
      name: 'Fyers',
      tagline: 'Connect with Fyers',
      category: 'Indian',
      iconBg: 'bg-blue-600',
      iconText: 'F'
    },
    {
      id: 'groww',
      name: 'Groww',
      tagline: 'Connect with Groww Trading API',
      category: 'Indian',
      iconBg: 'bg-teal-500',
      iconText: 'G'
    },
    {
      id: 'delta',
      name: 'Delta exchange',
      tagline: 'Connect with delta',
      category: 'Crypto',
      iconBg: 'bg-gradient-to-tr from-amber-500 to-emerald-500',
      iconText: 'Δ'
    }
  ];

  const handleConnectAndSync = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBroker) return;

    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setConnectedBrokers(prev => [...prev, selectedBroker.id]);
      setSyncSuccess(true);

      // Auto-import mock broker trade
      addTrade({
        date: new Date().toISOString().slice(0, 10),
        time: '14:20',
        marketType: 'Indian',
        duration: 'Intraday',
        symbol: `${selectedBroker.name.toUpperCase()}-NIFTY-23500-CE`,
        direction: 'Long',
        entryPrice: 165.20,
        exitPrice: 198.40,
        quantity: 450,
        totalAmount: 74340,
        stopLoss: 155,
        target: 200,
        pnl: 14940,
        fees: 28.5,
        netPnl: 14911.5,
        pnlPercent: 20.09,
        riskReward: '1:3.25',
        strategy: 'Breakout',
        outcome: 'Full Success',
        notes: `Auto-synced from ${selectedBroker.name} Trading API`,
        analysis: 'Executed via Broker API webhook.',
        emotion: 'Disciplined',
        confidence: 90,
        mistakes: [],
        followedPlan: true,
        followedRisk: true
      });

      setTimeout(() => {
        setSyncSuccess(false);
        setSelectedBroker(null);
      }, 1200);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        
        {/* Header matching screenshot 5 */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1e2942] light:border-slate-100">
          <div>
            <h3 className="text-lg font-black text-white light:text-slate-900 tracking-tight">
              Select Your Broker
            </h3>
            <p className="text-xs text-slate-400">
              Auto-sync orders, fills, and daily P&L directly into Trade Diary
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white light:hover:text-slate-900 bg-[#16223b] light:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Broker Grid */}
        <div className="space-y-4">
          <div>
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              Indian Stock Brokers
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {brokers.filter(b => b.category === 'Indian').map(b => {
                const isConnected = connectedBrokers.includes(b.id);
                return (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBroker(b)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                      isConnected
                        ? 'bg-emerald-950/20 border-emerald-500/40 hover:border-emerald-400'
                        : 'bg-[#16223b] light:bg-slate-50 border-[#23355b] light:border-slate-200 hover:border-blue-500/50 hover:bg-[#1a2947]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-2xl ${b.iconBg} text-white font-black flex items-center justify-center text-sm shadow-md`}>
                        {b.iconText}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white light:text-slate-900 group-hover:text-blue-400 transition-colors">
                          {b.name}
                        </h4>
                        <p className="text-[11px] text-slate-400">{b.tagline}</p>
                      </div>
                    </div>

                    {isConnected ? (
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-500/20 text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Synced
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500 group-hover:text-blue-400 font-bold">
                        Connect →
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              Crypto Brokers
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {brokers.filter(b => b.category === 'Crypto').map(b => (
                <div
                  key={b.id}
                  onClick={() => setSelectedBroker(b)}
                  className="p-4 rounded-2xl bg-[#16223b] light:bg-slate-50 border border-[#23355b] light:border-slate-200 hover:border-blue-500/50 cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl ${b.iconBg} text-white font-black flex items-center justify-center text-sm shadow-md`}>
                      {b.iconText}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white light:text-slate-900 group-hover:text-blue-400 transition-colors">
                        {b.name}
                      </h4>
                      <p className="text-[11px] text-slate-400">{b.tagline}</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500 group-hover:text-blue-400 font-bold">
                    Connect →
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Coming soon banner matching screenshot 5 */}
        <div className="p-3.5 rounded-2xl bg-[#0e1628] border border-[#1e2942] text-center text-xs font-semibold text-slate-400">
          More brokers coming soon... Stay tuned!
        </div>

        {/* API Credentials Modal popup */}
        {selectedBroker && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-60 flex items-center justify-center p-4">
            <div className="bg-[#111a2e] border border-[#1e2942] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#1e2942] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-xl ${selectedBroker.iconBg} text-white font-bold flex items-center justify-center text-xs`}>
                    {selectedBroker.iconText}
                  </div>
                  <h3 className="font-bold text-sm text-white">
                    Connect {selectedBroker.name} API
                  </h3>
                </div>
                <button onClick={() => setSelectedBroker(null)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              {syncSuccess ? (
                <div className="p-6 text-center space-y-2">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                  <h4 className="text-base font-bold text-white">Connected & Synced!</h4>
                  <p className="text-xs text-slate-400">Latest trade fills imported into journal.</p>
                </div>
              ) : (
                <form onSubmit={handleConnectAndSync} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">API Key / App Key</label>
                    <input
                      type="text"
                      required
                      placeholder="Enter API Key from broker developer portal"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="w-full bg-[#16223b] border border-[#23355b] rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">API Secret / TOTP Token</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••••••••••••••"
                      value={apiSecret}
                      onChange={(e) => setApiSecret(e.target.value)}
                      className="w-full bg-[#16223b] border border-[#23355b] rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-300 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                    Read-only API access. Your funds and holdings remain 100% secure.
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedBroker(null)}
                      className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSyncing}
                      className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                      {isSyncing ? 'Authenticating...' : 'Connect & Sync'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
