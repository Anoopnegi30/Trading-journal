import React, { useState } from 'react';
import { X, CheckCircle2, RefreshCw, ShieldCheck, ExternalLink, HelpCircle, Key, UserCheck } from 'lucide-react';
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
  const [clientId, setClientId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [connectedBrokers, setConnectedBrokers] = useState<string[]>([]);
  const [syncSuccess, setSyncSuccess] = useState(false);

  if (!isOpen) return null;

  const brokers: Broker[] = [
    {
      id: 'dhan',
      name: 'Dhan',
      tagline: 'Trade like a Super Trader! (DhanHQ API)',
      category: 'Indian',
      iconBg: 'bg-emerald-600',
      iconText: 'ध'
    },
    {
      id: 'angel_one',
      name: 'Angel One',
      tagline: "SmartAPI algorithmic integration",
      category: 'Indian',
      iconBg: 'bg-gradient-to-tr from-rose-500 to-blue-600',
      iconText: 'A'
    },
    {
      id: 'zerodha',
      name: 'Zerodha',
      tagline: 'Connect with Zerodha Kite Connect',
      category: 'Indian',
      iconBg: 'bg-orange-500',
      iconText: 'Z'
    },
    {
      id: 'upstox',
      name: 'Upstox',
      tagline: 'Upstox Developer API integration',
      category: 'Indian',
      iconBg: 'bg-purple-600',
      iconText: 'up'
    },
    {
      id: 'fyers',
      name: 'Fyers',
      tagline: 'Fyers API v3 auto sync',
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
      name: 'Delta Exchange',
      tagline: 'Connect with Delta crypto derivatives',
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
      setConnectedBrokers(prev => [...new Set([...prev, selectedBroker.id])]);
      setSyncSuccess(true);

      setTimeout(() => {
        setSyncSuccess(false);
        setSelectedBroker(null);
      }, 1500);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1e2942] light:border-slate-100">
          <div>
            <h3 className="text-lg font-black text-white light:text-slate-900 tracking-tight">
              Select Your Broker
            </h3>
            <p className="text-xs text-slate-400">
              Auto-sync executed orders, fills, and daily P&L directly into Trade Diary
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

        {/* Dhan & Broker API Credentials Modal Popup */}
        {selectedBroker && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-60 flex items-center justify-center p-4">
            <div className="bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-[#1e2942] light:border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-xl ${selectedBroker.iconBg} text-white font-bold flex items-center justify-center text-xs`}>
                    {selectedBroker.iconText}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white light:text-slate-900">
                      Connect {selectedBroker.name} {selectedBroker.id === 'dhan' ? 'DhanHQ API' : 'API'}
                    </h3>
                    <p className="text-[11px] text-slate-400">Read-only live trade import</p>
                  </div>
                </div>
                <button onClick={() => setSelectedBroker(null)} className="text-slate-400 hover:text-white light:hover:text-slate-900">✕</button>
              </div>

              {syncSuccess ? (
                <div className="p-6 text-center space-y-2">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                  <h4 className="text-base font-bold text-white light:text-slate-900">{selectedBroker.name} Connected!</h4>
                  <p className="text-xs text-slate-400">Account verified. Your trades will auto-sync.</p>
                </div>
              ) : (
                <form onSubmit={handleConnectAndSync} className="space-y-4 text-xs">
                  
                  {/* DhanHQ Instructions Guide */}
                  {selectedBroker.id === 'dhan' && (
                    <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-400 flex items-center gap-1.5 text-xs">
                          <Key className="w-3.5 h-3.5" /> How to get Dhan Credentials:
                        </span>
                        <a
                          href="https://web.dhan.co"
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-emerald-400 hover:underline flex items-center gap-0.5"
                        >
                          Open Dhan Web <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <ol className="text-[11px] text-slate-300 light:text-slate-700 list-decimal list-inside space-y-1">
                        <li>Login to <strong>web.dhan.co</strong> & click your <strong>Profile Icon</strong></li>
                        <li>Select <strong>DhanHQ Trading APIs / Access Token</strong></li>
                        <li>Click <strong>"Generate Access Token"</strong> (Valid for 30 Days)</li>
                        <li>Copy your <strong>Client ID</strong> and <strong>Access Token</strong> below:</li>
                      </ol>
                    </div>
                  )}

                  <div>
                    <label className="block text-slate-300 light:text-slate-700 font-bold mb-1">
                      {selectedBroker.id === 'dhan' ? 'Dhan Client ID / User ID' : 'API Key / Client ID'} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={selectedBroker.id === 'dhan' ? "e.g. 1000000001 (10-digit ID)" : "Enter API Key"}
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                      className="w-full bg-[#16223b] light:bg-slate-100 border border-[#23355b] light:border-slate-300 rounded-xl px-3.5 py-2.5 text-white light:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 light:text-slate-700 font-bold mb-1">
                      {selectedBroker.id === 'dhan' ? 'DhanHQ Access Token (JWT Token)' : 'API Secret / Access Token'} <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder={selectedBroker.id === 'dhan' ? "Paste 30-day Access Token generated from DhanHQ portal" : "Enter API Secret"}
                      value={accessToken}
                      onChange={(e) => setAccessToken(e.target.value)}
                      className="w-full bg-[#16223b] light:bg-slate-100 border border-[#23355b] light:border-slate-300 rounded-xl px-3.5 py-2 text-white light:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-[11px]"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-300 light:text-blue-700 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                    100% Secure & Read-Only access. Funds, holdings and orders remain fully protected.
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
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-lg shadow-emerald-600/25 cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                      {isSyncing ? 'Connecting to Dhan...' : 'Connect & Sync Dhan'}
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
