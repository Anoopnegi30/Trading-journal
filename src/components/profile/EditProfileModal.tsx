import React, { useState } from 'react';
import { useTradeContext } from '../../context/TradeContext';
import { User, Mail, DollarSign, Sparkles, X, Check, Shield, Briefcase, Phone, FileText, Receipt } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const EditProfileModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { userProfile, updateUserProfile } = useTradeContext();

  const [name, setName] = useState(userProfile.name);
  const [email, setEmail] = useState(userProfile.email);
  const [tradingStyle, setTradingStyle] = useState(userProfile.tradingStyle);
  const [initialCapital, setInitialCapital] = useState(userProfile.initialCapital);
  const [defaultFee, setDefaultFee] = useState(userProfile.defaultFee || 55);
  const [phone, setPhone] = useState(userProfile.phone || '');
  const [bio, setBio] = useState(userProfile.bio || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name: name.trim() || 'Anoop Negi',
      email: email.trim() || 'anonegi5678@gmail.com',
      tradingStyle,
      initialCapital: Number(initialCapital) || 100000,
      defaultFee: Number(defaultFee) || 55,
      phone,
      bio
    });
    onClose();
  };

  const initial = (name.trim() || 'A').charAt(0).toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-[#111a2e] light:bg-white border border-[#23355b] light:border-slate-300 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1e2942] light:border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center font-bold">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-white light:text-slate-900 tracking-tight">
                Edit Trader Profile & Settings
              </h3>
              <p className="text-[11px] text-slate-400">Update personal details, trading style, capital & default fees</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white light:hover:text-slate-900 bg-[#16223b] light:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Avatar Card Preview */}
        <div className="p-4 rounded-2xl bg-[#16223b] light:bg-slate-50 border border-[#23355b] flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-2xl shadow-lg ring-2 ring-blue-500/30">
            {initial}
          </div>
          <div>
            <h4 className="font-bold text-white light:text-slate-900 text-sm">{name || 'Your Name'}</h4>
            <p className="text-xs text-slate-400">{email || 'email@example.com'}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-md bg-blue-500/15 text-blue-400 text-[10px] font-bold border border-blue-500/20">
              {tradingStyle}
            </span>
          </div>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 light:text-slate-700 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Anoop Negi"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#16223b] light:bg-slate-100 text-white light:text-slate-900 border border-[#23355b] focus:border-blue-500 focus:outline-none text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 light:text-slate-700 mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. anonegi5678@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#16223b] light:bg-slate-100 text-white light:text-slate-900 border border-[#23355b] focus:border-blue-500 focus:outline-none text-xs font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 light:text-slate-700 mb-1">
                Primary Trading Style
              </label>
              <select
                value={tradingStyle}
                onChange={(e) => setTradingStyle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#16223b] light:bg-slate-100 text-white light:text-slate-900 border border-[#23355b] focus:border-blue-500 focus:outline-none text-xs font-semibold"
              >
                <option value="Intraday Options Buyer">Intraday Options Buyer (CE/PE)</option>
                <option value="Options Seller / Theta Scalper">Options Seller / Theta Scalper</option>
                <option value="Futures & Momentum Trader">Futures & Momentum Trader</option>
                <option value="Swing Trader">Swing Trader</option>
                <option value="Price Action Scalper">Price Action Scalper</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 light:text-slate-700 mb-1">
                Starting Capital (₹)
              </label>
              <input
                type="number"
                value={initialCapital}
                onChange={(e) => setInitialCapital(Number(e.target.value))}
                placeholder="100000"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#16223b] light:bg-slate-100 text-white light:text-slate-900 border border-[#23355b] focus:border-blue-500 focus:outline-none text-xs font-mono font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 light:text-slate-700 mb-1">
                Default Charges / Trade (₹)
              </label>
              <input
                type="number"
                value={defaultFee}
                onChange={(e) => setDefaultFee(Number(e.target.value))}
                placeholder="55"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#16223b] light:bg-slate-100 text-white light:text-slate-900 border border-[#23355b] focus:border-blue-500 focus:outline-none text-xs font-mono font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 light:text-slate-700 mb-1">
              Trading Bio & Focus
            </label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="e.g. Nifty & BankNifty 5-min index trader. Focusing on risk management & avoiding FOMO."
              className="w-full px-3.5 py-2 rounded-xl bg-[#16223b] light:bg-slate-100 text-white light:text-slate-900 border border-[#23355b] focus:border-blue-500 focus:outline-none text-xs"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1e2942] light:border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/25 flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              Save Profile Changes
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
