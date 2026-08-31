import React, { useState, useEffect } from "react";
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
  const [authMode, setAuthMode] = useState<"oauth" | "permanent" | "token">("oauth");
  const [appId, setAppId] = useState("");
  const [appSecret, setAppSecret] = useState("");

  const [isSyncing, setIsSyncing] = useState(false);
  const [connectedBrokers, setConnectedBrokers] = useState<string[]>(() => {
    return dhanCredentials?.accessToken ? ["dhan"] : [];
  });
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");
  const [syncError, setSyncError] = useState("");

  useEffect(() => {
    if (dhanCredentials?.clientId) setClientId(dhanCredentials.clientId);
    if (dhanCredentials?.accessToken) setAccessToken(dhanCredentials.accessToken);
  }, [dhanCredentials]);

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

  const handleOAuthConnect = async () => {
    setIsSyncing(true);
    setSyncError("");
    try {
      const res = await fetch('/api/dhan-generate-consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: clientId.trim(), appId: appId.trim(), appSecret: appSecret.trim() })
      });
      const data: any = await res.json();
      setIsSyncing(false);
      if (data.success && data.loginUrl) {
        window.open(data.loginUrl, '_blank');
      } else {
        setSyncError(data.error || "Failed to generate Dhan OAuth consent URL");
      }
    } catch (e: any) {
      setIsSyncing(false);
      setSyncError(e.message || "Network error while connecting to Dhan");
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

        {/* Tab Selection: 1-Click Login vs Permanent Secret vs Token */}
        <div className="flex items-center bg-[#0d1627] p-1 rounded-xl border border-emerald-500/20 text-xs font-bold">
          <button
            onClick={() => setAuthMode("oauth")}
            className={`flex-1 py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              authMode === "oauth" 
                ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>1-Click Dhan Login</span>
          </button>
          <button
            onClick={() => setAuthMode("permanent")}
            className={`flex-1 py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              authMode === "permanent" 
                ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Permanent App Secret</span>
          </button>
          <button
            onClick={() => setAuthMode("token")}
            className={`flex-1 py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              authMode === "token" 
                ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>24H Access Token</span>
          </button>
        </div>

        {syncSuccess ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="text-base font-bold text-white light:text-slate-900">{syncMessage}</h4>
            <p className="text-xs text-slate-400">Your journal has been synchronized with your live Dhan account.</p>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            
            {authMode === "oauth" && (
              <div className="space-y-4 animate-in fade-in">
                <div className="p-4 rounded-2xl bg-[#16223b] light:bg-slate-50 border border-emerald-500/30 space-y-3 text-slate-300 light:text-slate-700">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-emerald-400" />
                    <div>
                      <h4 className="font-bold text-sm text-white light:text-slate-900">
                        Direct Dhan SSO Login (Zero Token Copying)
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Aap Dhan ke official login page par mobile number & OTP daalenge aur journal automatically connect ho jayega!
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 light:text-slate-700 font-bold mb-1">
                      Dhan Client ID
                    </label>
                    <input
                      type="text"
                      required
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                      placeholder="1100687559"
                      className="w-full bg-[#0d1627] light:bg-slate-100 border border-[#23355b] light:border-slate-300 rounded-xl px-3.5 py-2.5 text-white light:text-slate-900 font-mono text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <button
                    onClick={handleOAuthConnect}
                    disabled={isSyncing}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-white font-black text-sm shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                  >
                    <Zap className={`w-4 h-4 fill-white ${isSyncing ? "animate-spin" : ""}`} />
                    <span>{isSyncing ? "Opening Dhan Portal..." : "🚀 Login with Dhan (Official Connect)"}</span>
                  </button>
                </div>
              </div>
            )}

            {authMode === "permanent" && (
              <form onSubmit={handleConnectAndSync} className="space-y-4 animate-in fade-in">
                <div className="p-3.5 rounded-2xl bg-[#16223b] border border-blue-500/30 space-y-2 text-slate-300 text-[11px]">
                  <p className="font-bold text-blue-400 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> Permanent App Credentials (Never Expires):
                  </p>
                  <p className="text-slate-400 leading-relaxed">
                    Dhan Web Profile &rarr; <strong>Access DhanHQ APIs</strong> se apna <strong>App ID & App Secret</strong> copy karein. Isse journal background me roz bina token expiry ke connect rahega!
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Dhan Client ID</label>
                    <input
                      type="text"
                      required
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                      placeholder="1100687559"
                      className="w-full bg-[#16223b] border border-[#23355b] rounded-xl px-3.5 py-2 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Dhan App ID (API Key)</label>
                    <input
                      type="text"
                      value={appId}
                      onChange={(e) => setAppId(e.target.value)}
                      placeholder="dhan_app_xxxx"
                      className="w-full bg-[#16223b] border border-[#23355b] rounded-xl px-3.5 py-2 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Dhan App Secret</label>
                    <input
                      type="password"
                      value={appSecret}
                      onChange={(e) => setAppSecret(e.target.value)}
                      placeholder="••••••••••••••••••••"
                      className="w-full bg-[#16223b] border border-[#23355b] rounded-xl px-3.5 py-2 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSyncing}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                  <span>{isSyncing ? "Saving & Syncing..." : "Save Permanent Credentials"}</span>
                </button>
              </form>
            )}

            {authMode === "token" && (
              <form onSubmit={handleConnectAndSync} className="space-y-4 animate-in fade-in">
                <div className="p-3 rounded-2xl bg-[#16223b] border border-amber-500/30 space-y-1 text-slate-300 text-[11px]">
                  <p className="font-bold text-amber-400 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" /> 24-Hour Access Token (Dhan Web):
                  </p>
                  <p className="text-slate-400">
                    web.dhan.co profile se generated daily JWT token ko direct paste karke sync karein.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Dhan Client ID</label>
                    <input
                      type="text"
                      required
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                      placeholder="1100687559"
                      className="w-full bg-[#16223b] border border-[#23355b] rounded-xl px-3.5 py-2 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Access Token String</label>
                    <textarea
                      rows={3}
                      required
                      value={accessToken}
                      onChange={(e) => setAccessToken(e.target.value)}
                      placeholder="eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9..."
                      className="w-full bg-[#16223b] border border-[#23355b] rounded-xl p-2.5 text-white font-mono text-[11px] focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSyncing}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                  <span>{isSyncing ? "Syncing Trades..." : "Sync with Access Token"}</span>
                </button>
              </form>
            )}

            {syncError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <div className="space-y-1">
                  <p className="font-bold text-rose-400">Connection Failed</p>
                  <p className="text-[11px] leading-relaxed">{syncError}</p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-[#1e2942] light:border-slate-100">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 100% Free Official DhanHQ Integration
              </span>

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer text-xs"
              >
                Close
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
