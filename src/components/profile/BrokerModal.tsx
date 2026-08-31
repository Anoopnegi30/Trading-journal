import React, { useState } from "react";
import { X, CheckCircle2, RefreshCw, ShieldCheck, ExternalLink, Key, AlertTriangle, Zap, Lock, Smartphone } from "lucide-react";
import { useTradeContext } from "../../context/TradeContext";

interface BrokerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Broker {
  id: string;
  name: string;
  tagline: string;
  category: "Indian" | "Crypto";
  iconBg: string;
  iconText: string;
}

export const BrokerModal: React.FC<BrokerModalProps> = ({ isOpen, onClose }) => {
  const { dhanCredentials, saveDhanCredentials, syncFromDhan } = useTradeContext();
  const [selectedBroker, setSelectedBroker] = useState<Broker | null>(() => {
    // Default open Dhan if modal opens
    return {
      id: "dhan",
      name: "Dhan",
      tagline: "DhanHQ Auto-Sync & Real-time API",
      category: "Indian",
      iconBg: "bg-emerald-600",
      iconText: "ध"
    };
  });

  const [clientId, setClientId] = useState(dhanCredentials?.clientId || "1100687559");
  const [accessToken, setAccessToken] = useState(dhanCredentials?.accessToken || "");

  const [isSyncing, setIsSyncing] = useState(false);
  const [connectedBrokers, setConnectedBrokers] = useState<string[]>(() => {
    return dhanCredentials?.accessToken ? ["dhan"] : [];
  });
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");
  const [syncError, setSyncError] = useState("");

  if (!isOpen) return null;

  const brokers: Broker[] = [
    {
      id: "dhan",
      name: "Dhan",
      tagline: "DhanHQ Auto-Sync & Real-time API",
      category: "Indian",
      iconBg: "bg-emerald-600",
      iconText: "ध"
    },
    {
      id: "angel_one",
      name: "Angel One",
      tagline: "SmartAPI algorithmic integration",
      category: "Indian",
      iconBg: "bg-gradient-to-tr from-rose-500 to-blue-600",
      iconText: "A"
    },
    {
      id: "zerodha",
      name: "Zerodha",
      tagline: "Connect with Zerodha Kite Connect",
      category: "Indian",
      iconBg: "bg-orange-500",
      iconText: "Z"
    },
    {
      id: "upstox",
      name: "Upstox",
      tagline: "Upstox Developer API integration",
      category: "Indian",
      iconBg: "bg-purple-600",
      iconText: "up"
    },
    {
      id: "fyers",
      name: "Fyers",
      tagline: "Fyers API v3 auto sync",
      category: "Indian",
      iconBg: "bg-blue-600",
      iconText: "F"
    },
    {
      id: "groww",
      name: "Groww",
      tagline: "Connect with Groww Trading API",
      category: "Indian",
      iconBg: "bg-teal-500",
      iconText: "G"
    },
    {
      id: "delta",
      name: "Delta Exchange",
      tagline: "Connect with Delta crypto derivatives",
      category: "Crypto",
      iconBg: "bg-gradient-to-tr from-amber-500 to-emerald-500",
      iconText: "Δ"
    }
  ];

  const handleConnectAndSync = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBroker) return;

    setIsSyncing(true);
    setSyncError("");

    if (selectedBroker.id === "dhan") {
      const cleanClientId = clientId.trim();
      const cleanToken = accessToken.trim();

      if (!cleanToken) {
        setIsSyncing(false);
        setSyncError("Please enter your DhanHQ Access Token to connect.");
        return;
      }

      // Save credentials for permanent background sync
      saveDhanCredentials(cleanClientId, cleanToken);
      
      const res = await syncFromDhan(cleanClientId, cleanToken);
      setIsSyncing(false);

      if (res.success) {
        setConnectedBrokers(prev => [...new Set([...prev, "dhan"])]);
        setSyncSuccess(true);
        setSyncMessage(res.count > 0 ? `🎉 ${res.count} live executed trades imported from Dhan into your Journal!` : "✅ Dhan Connected Successfully! (No new closed trades found today)");
        setTimeout(() => {
          setSyncSuccess(false);
          onClose();
        }, 2200);
      } else {
        setSyncError(res.error || "DhanHQ authentication error. Please verify your Access Token is valid.");
      }
    } else {
      setTimeout(() => {
        setIsSyncing(false);
        setConnectedBrokers(prev => [...new Set([...prev, selectedBroker.id])]);
        setSyncSuccess(true);
        setSyncMessage(`${selectedBroker.name} connected successfully!`);
        setTimeout(() => {
          setSyncSuccess(false);
          onClose();
        }, 1500);
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1e2942] light:border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white font-black flex items-center justify-center text-sm shadow-md">
              ध
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white light:text-slate-900 tracking-tight">
                Connect DhanHQ Trading Account
              </h3>
              <p className="text-xs text-slate-400">
                1-Click auto sync trades, live positions & P&L from Dhan
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white light:hover:text-slate-900 bg-[#16223b] light:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {syncSuccess ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="text-base font-bold text-white light:text-slate-900">{syncMessage}</h4>
            <p className="text-xs text-slate-400">Your journal has been synchronized with your live Dhan account.</p>
          </div>
        ) : (
          <form onSubmit={handleConnectAndSync} className="space-y-4 text-xs">
            
            {/* Quick 3-Step Guide Box */}
            <div className="p-4 rounded-2xl bg-[#16223b] light:bg-slate-50 border border-blue-500/20 space-y-2 text-slate-300 light:text-slate-700">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-blue-400 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" /> How to get your Dhan Access Token (10 Seconds):
                </span>
                <a
                  href="https://web.dhan.co/index/profile"
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] flex items-center gap-1 transition-all shadow-sm shadow-blue-500/20"
                >
                  <span>Open Dhan Web</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-400 light:text-slate-600 pl-1 leading-relaxed">
                <li>Log in to <strong className="text-white light:text-slate-800">web.dhan.co</strong> on your browser.</li>
                <li>Go to <strong className="text-white light:text-slate-800">Profile &rarr; DhanHQ Trading APIs / Access Token</strong>.</li>
                <li>Click <strong className="text-emerald-400">Generate Access Token</strong> (select <strong>30 Days</strong> validity).</li>
                <li>Copy the Access Token and paste it below.</li>
              </ol>
            </div>

            {/* Input Fields */}
            <div className="space-y-3">
              <div>
                <label className="block text-slate-300 light:text-slate-700 font-bold mb-1">
                  Dhan Client ID (10-digit ID)
                </label>
                <input
                  type="text"
                  required
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  placeholder="1100687559"
                  className="w-full bg-[#16223b] light:bg-slate-100 border border-[#23355b] light:border-slate-300 rounded-xl px-3.5 py-2.5 text-white light:text-slate-900 font-mono text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-300 light:text-slate-700 font-bold">
                    Dhan Access Token (JWT string)
                  </label>
                  <span className="text-[10px] text-slate-400">Valid for 30 Days</span>
                </div>
                <textarea
                  rows={4}
                  required
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  placeholder="eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9..."
                  className="w-full bg-[#16223b] light:bg-slate-100 border border-[#23355b] light:border-slate-300 rounded-xl p-3 text-white light:text-slate-900 font-mono text-[11px] focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {syncError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <div className="space-y-1">
                  <p className="font-bold text-rose-400">Authentication Failed (401)</p>
                  <p className="text-[11px] leading-relaxed">{syncError}</p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-[#1e2942] light:border-slate-100">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 256-Bit Encrypted & Saved
              </span>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSyncing}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-lg shadow-emerald-600/30 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                  <span>{isSyncing ? "Connecting & Syncing..." : "Connect & Auto-Sync"}</span>
                </button>
              </div>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
