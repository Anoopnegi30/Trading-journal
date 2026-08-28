import React, { useState } from 'react';
import { useTradeContext } from '../../context/TradeContext';
import { 
  TrendingUp, 
  Lock, 
  Mail, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  Eye, 
  EyeOff, 
  CheckCircle,
  Database,
  Layers,
  Zap
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, userProfile } = useTradeContext();
  const [email, setEmail] = useState(userProfile.email || 'anonegi5678@gmail.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      login(email, password);
      setIsLoading(false);
    }, 400);
  };

  const handleQuickLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      login('anonegi5678@gmail.com', 'password123');
      setIsLoading(false);
    }, 300);
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0f1d] flex flex-col items-center justify-center p-4 relative overflow-hidden selection:bg-blue-500 selection:text-white">
      
      {/* Background Glow Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Container */}
      <div className="w-full max-w-md relative z-10 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-400 p-0.5 shadow-2xl shadow-blue-500/30">
            <div className="w-full h-full bg-[#0d1527] rounded-[14px] flex items-center justify-center text-white">
              <TrendingUp className="w-7 h-7 text-blue-400" />
            </div>
          </div>

          <h1 className="text-2xl font-black tracking-tight text-white">
            Trade Diary
          </h1>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Advanced F&O & Equity Trading Journal, Psychology & Risk Analytics
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#111a2e]/90 backdrop-blur-xl border border-[#1e2942] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white tracking-tight">Welcome Back</h2>
            <p className="text-xs text-slate-400">Sign in to access your August 2026 trading diary</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="anonegi5678@gmail.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#16223b] text-white border border-[#23355b] focus:border-blue-500 focus:outline-none text-xs font-semibold placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-300">
                  Password
                </label>
                <span className="text-[11px] text-blue-400 hover:underline cursor-pointer">
                  Forgot?
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#16223b] text-white border border-[#23355b] focus:border-blue-500 focus:outline-none text-xs font-mono placeholder:text-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-[#16223b] text-blue-600 focus:ring-0 cursor-pointer"
                />
                <span className="text-xs text-slate-400 font-medium">Keep me signed in</span>
              </label>
            </div>

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all transform active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In to Journal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* One-Click Enter Button */}
            <button
              type="button"
              onClick={handleQuickLogin}
              className="w-full py-2.5 rounded-xl bg-[#16223b] hover:bg-[#1f2f50] text-slate-300 font-semibold text-xs border border-[#23355b] flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>One-Click Quick Login ({userProfile.name})</span>
            </button>
          </form>

        </div>

        {/* Security & Cloudflare Badges */}
        <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Cloudflare D1 Protected
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Database className="w-3.5 h-3.5 text-blue-400" />
            Auto Cloud Sync
          </span>
        </div>

      </div>

    </div>
  );
};
