import React, { useState } from 'react';
import { X, Copy, Check, Share2, Globe, Lock } from 'lucide-react';
import { useTradeContext } from '../../context/TradeContext';

interface ShareJournalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareJournalModal: React.FC<ShareJournalModalProps> = ({ isOpen, onClose }) => {
  const { trades } = useTradeContext();
  const [copied, setCopied] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const shareUrl = `https://tradediary.in/share/pratyay-prakash`;

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-[#1e2942] light:border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white light:text-slate-900">
                Share Trading Journal
              </h3>
              <p className="text-xs text-slate-400">Share your verified performance with friends or mentor</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#16223b] light:bg-slate-50 border border-[#23355b]">
            <div className="flex items-center gap-2">
              {isPublic ? <Globe className="w-4 h-4 text-emerald-400" /> : <Lock className="w-4 h-4 text-amber-400" />}
              <div>
                <p className="font-bold text-white light:text-slate-900">Public Link Sharing</p>
                <p className="text-[11px] text-slate-400">Anyone with the link can view your analytics</p>
              </div>
            </div>
            <button
              onClick={() => setIsPublic(!isPublic)}
              className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                isPublic ? 'bg-blue-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  isPublic ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="space-y-1">
            <label className="block text-slate-400 font-medium">Public Journal URL</label>
            <div className="flex items-center gap-2 bg-[#0d1527] border border-[#23355b] rounded-xl p-1.5 pl-3">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 bg-transparent text-slate-200 text-xs font-mono focus:outline-none"
              />
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#16223b] hover:bg-[#202f50] text-slate-200 text-xs font-bold transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
