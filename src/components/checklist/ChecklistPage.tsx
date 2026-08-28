import React, { useState } from 'react';
import { useTradeContext } from '../../context/TradeContext';
import { 
  CheckSquare, 
  Sun, 
  Moon, 
  Plus, 
  Save, 
  Calendar, 
  TrendingUp, 
  Sparkles, 
  CheckCircle2, 
  BarChart2,
  X
} from 'lucide-react';

interface ChecklistItem {
  id: string;
  text: string;
  category: string;
  completed: boolean;
}

export const ChecklistPage: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'Checklist' | 'Analysis'>('Checklist');
  const [currentDate] = useState('28-08-2026');
  const [isSaved, setIsSaved] = useState(false);

  // Pre-Market items matching screenshot 2 & 3
  const [preMarketItems, setPreMarketItems] = useState<ChecklistItem[]>([
    { id: 'pre-1', text: 'Check Global Indices & Geopolitics', category: 'ANALYSIS', completed: false },
    { id: 'pre-2', text: 'Review Nifty/BankNifty Key Levels', category: 'ANALYSIS', completed: false },
    { id: 'pre-3', text: 'Analyze FII/DII Data & OI', category: 'ANALYSIS', completed: false },
    { id: 'pre-4', text: 'Check Economic Calendar', category: 'NEWS', completed: false },
    { id: 'pre-5', text: 'Define Daily Bias (Bull/Bear/Range)', category: 'PLAN', completed: false },
    { id: 'pre-6', text: 'Select 2-3 Focus Stocks', category: 'PLAN', completed: false },
    { id: 'pre-7', text: 'Define Maximum Loss Limit for Today', category: 'RISK', completed: false },
    { id: 'pre-8', text: 'Check VIX and Market Volatility', category: 'ANALYSIS', completed: false }
  ]);

  // Post-Market items matching screenshot 2 & 3
  const [postMarketItems, setPostMarketItems] = useState<ChecklistItem[]>([
    { id: 'post-1', text: 'Journal All Executed Trades', category: 'REVIEW', completed: false },
    { id: 'post-2', text: 'Upload Charts with Entries/Exits', category: 'REVIEW', completed: false },
    { id: 'post-3', text: 'Did I Follow My Rules 100%?', category: 'REVIEW', completed: false },
    { id: 'post-4', text: 'Calculate Daily P&L & Charges', category: 'STATS', completed: false },
    { id: 'post-5', text: 'Identify One Mistake to Fix', category: 'GROWTH', completed: false },
    { id: 'post-6', text: 'Identify One Thing I Did Well', category: 'GROWTH', completed: false },
    { id: 'post-7', text: 'Sync Broker Order Book with Journal', category: 'SYNC', completed: false }
  ]);

  const [newItemText, setNewItemText] = useState('');
  const [newItemType, setNewItemType] = useState<'pre' | 'post'>('pre');
  const [showAddModal, setShowAddModal] = useState(false);

  const togglePre = (id: string) => {
    setPreMarketItems(prev => prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
  };

  const togglePost = (id: string) => {
    setPostMarketItems(prev => prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
  };

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;
    const newItem: ChecklistItem = {
      id: `custom-${Date.now()}`,
      text: newItemText.trim(),
      category: 'CUSTOM',
      completed: false
    };
    if (newItemType === 'pre') {
      setPreMarketItems(prev => [...prev, newItem]);
    } else {
      setPostMarketItems(prev => [...prev, newItem]);
    }
    setNewItemText('');
    setShowAddModal(false);
  };

  const preCompletedCount = preMarketItems.filter(i => i.completed).length;
  const prePercent = Math.round((preCompletedCount / preMarketItems.length) * 100) || 0;

  const postCompletedCount = postMarketItems.filter(i => i.completed).length;
  const postPercent = Math.round((postCompletedCount / postMarketItems.length) * 100) || 0;

  return (
    <div className="space-y-6">
      {/* Top Discipline Header matching screenshot 3 */}
      <div className="p-6 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold tracking-wider text-blue-400 uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" /> DAILY DISCIPLINE
            </span>
            <h2 className="text-2xl font-black text-white light:text-slate-900 mt-1">
              Trading Checklist
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Tuesday, May 19, 2026
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#16223b] light:bg-slate-100 px-3 py-2 rounded-xl border border-[#23355b] text-xs font-semibold text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              <span>{currentDate}</span>
              <span className="text-[10px] uppercase font-bold text-blue-400 ml-1">TODAY</span>
            </div>

            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all transform active:scale-95"
            >
              <Save className="w-4 h-4" />
              {isSaved ? 'Saved!' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Tabs Toggle matching screenshot 2 & 3 */}
      <div className="flex justify-center">
        <div className="inline-flex bg-[#16223b] light:bg-slate-200 p-1.5 rounded-2xl border border-[#23355b]">
          <button
            onClick={() => setActiveSubTab('Checklist')}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'Checklist'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            Checklist
          </button>
          <button
            onClick={() => setActiveSubTab('Analysis')}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'Analysis'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            Analysis
          </button>
        </div>
      </div>

      {activeSubTab === 'Checklist' ? (
        <>
          {/* Progress Cards Row (2 Columns) matching screenshot 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Pre-Market Progress Card */}
            <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  PRE-MARKET
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  {preCompletedCount}/{preMarketItems.length} Done
                </span>
              </div>
              <div className="text-3xl font-black text-white light:text-slate-900">
                {prePercent}%
              </div>
              <div className="w-full bg-[#18233c] light:bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(2, prePercent)}%` }}
                />
              </div>
            </div>

            {/* Post-Market Progress Card */}
            <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  POST-MARKET
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  {postCompletedCount}/{postMarketItems.length} Done
                </span>
              </div>
              <div className="text-3xl font-black text-white light:text-slate-900">
                {postPercent}%
              </div>
              <div className="w-full bg-[#18233c] light:bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(2, postPercent)}%` }}
                />
              </div>
            </div>

          </div>

          {/* Checklist Sections 2 Columns matching screenshot 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Left: Pre-Market Preparation */}
            <div className="p-6 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-white light:text-slate-900">
                  <Sun className="w-5 h-5 text-amber-400" />
                  <span>Pre-Market Preparation</span>
                </div>
                <button
                  onClick={() => { setNewItemType('pre'); setShowAddModal(true); }}
                  className="p-1.5 rounded-xl bg-blue-500/20 text-blue-400 hover:bg-blue-600 hover:text-white transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 pt-1">
                {preMarketItems.map((item) => (
                  <label
                    key={item.id}
                    onClick={() => togglePre(item.id)}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      item.completed
                        ? 'bg-blue-600/10 border-blue-500/40 text-blue-300'
                        : 'bg-[#16223b] light:bg-slate-50 border-[#23355b] text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                        item.completed
                          ? 'bg-blue-600 border-blue-500 text-white'
                          : 'border-slate-600 bg-[#0d1527]'
                      }`}>
                        {item.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                      <span className={`text-xs font-semibold ${item.completed ? 'line-through text-slate-400' : ''}`}>
                        {item.text}
                      </span>
                    </div>

                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                      {item.category}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Right: Post-Market Review */}
            <div className="p-6 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-white light:text-slate-900">
                  <Moon className="w-5 h-5 text-indigo-400" />
                  <span>Post-Market Review</span>
                </div>
                <button
                  onClick={() => { setNewItemType('post'); setShowAddModal(true); }}
                  className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-600 hover:text-white transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 pt-1">
                {postMarketItems.map((item) => (
                  <label
                    key={item.id}
                    onClick={() => togglePost(item.id)}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      item.completed
                        ? 'bg-emerald-600/10 border-emerald-500/40 text-emerald-300'
                        : 'bg-[#16223b] light:bg-slate-50 border-[#23355b] text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                        item.completed
                          ? 'bg-emerald-600 border-emerald-500 text-white'
                          : 'border-slate-600 bg-[#0d1527]'
                      }`}>
                        {item.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                      <span className={`text-xs font-semibold ${item.completed ? 'line-through text-slate-400' : ''}`}>
                        {item.text}
                      </span>
                    </div>

                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      {item.category}
                    </span>
                  </label>
                ))}
              </div>
            </div>

          </div>
        </>
      ) : (
        /* Analysis Sub-Tab */
        <div className="p-8 rounded-3xl bg-[#111a2e] border border-[#1e2942] text-center space-y-4">
          <CheckSquare className="w-12 h-12 text-blue-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">Checklist Discipline Score: 92%</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            You completed 92% of your pre-market preparation tasks on winning trading days. Consistency is high.
          </p>
        </div>
      )}

      {/* Add Custom Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111a2e] border border-[#1e2942] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-white">
              Add {newItemType === 'pre' ? 'Pre-Market' : 'Post-Market'} Task
            </h3>
            <form onSubmit={handleAddItem} className="space-y-3.5 text-xs">
              <input
                type="text"
                required
                placeholder="e.g. Check Crude Oil & Dollar Index"
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                className="w-full bg-[#16223b] border border-[#23355b] rounded-xl px-3.5 py-2.5 text-white focus:outline-none"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
