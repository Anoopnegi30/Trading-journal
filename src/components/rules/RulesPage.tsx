import React, { useState } from 'react';
import { useTradeContext } from '../../context/TradeContext';
import { 
  ShieldCheck, 
  Plus, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  BarChart3, 
  Check, 
  X,
  Lock,
  Flame,
  ArrowUpRight,
  TrendingUp
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

export const RulesPage: React.FC = () => {
  const { rules, toggleRule, deleteRule, addRule, trades } = useTradeContext();
  const [showInactive, setShowInactive] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'Analysis' | 'Psychology' | 'Exit' | 'Risk'>('Risk');

  // Dynamic Rule Adherence Statistics computed from trades
  const totalTrades = trades.length;
  const disciplinedTrades = trades.filter(t => t.followedPlan && t.followedRisk).length;
  const disciplinePercent = totalTrades > 0 ? Math.round((disciplinedTrades / totalTrades) * 100) : 100;

  const handleAddRuleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addRule({
      title: newTitle.trim(),
      description: 'Custom trading discipline guideline.',
      category: newCategory,
      mandatory: true,
      active: true
    });

    setNewTitle('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#111a2e] light:bg-white p-5 rounded-3xl border border-[#1e2942] light:border-slate-200 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white light:text-slate-900 tracking-tight flex items-center gap-2">
              Discipline & Trading Rules
            </h2>
            <p className="text-xs text-slate-400">
              Build high-probability edge by adhering strictly to predefined rules
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-500/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Rule</span>
        </button>
      </div>

      {/* Rules Collection Table */}
      <div className="p-6 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white light:text-slate-900">
            Active Rules Collection ({rules.filter(r => r.active).length} Rules)
          </h3>
          <span className="text-xs text-slate-400">
            August 2026 Discipline: <strong className="text-emerald-400">{disciplinePercent}%</strong>
          </span>
        </div>

        <div className="divide-y divide-[#1e2942] light:divide-slate-200">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="py-3.5 flex items-center justify-between gap-4 hover:bg-[#16223b]/40 light:hover:bg-slate-50 px-3 rounded-2xl transition-colors"
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleRule(rule.id)}
                  className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                    rule.active
                      ? 'bg-emerald-500 border-emerald-400 text-white shadow-sm'
                      : 'border-slate-600 bg-slate-800/40 text-transparent'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <div>
                  <span className={`text-xs font-bold ${rule.active ? 'text-white light:text-slate-900' : 'text-slate-500 line-through'}`}>
                    {rule.title}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">{rule.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded-lg bg-[#18233c] light:bg-slate-100 text-slate-300 light:text-slate-700 text-[10px] font-semibold border border-[#23355b]">
                  {rule.category}
                </span>
                <button
                  onClick={() => deleteRule(rule.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Rule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#111a2e] light:bg-white border border-[#23355b] light:border-slate-300 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white light:text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                Add Trading Discipline Rule
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#16223b]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddRuleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1.5">
                  Rule Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Max 2 trades per day, Never add to a losing trade"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#16223b] light:bg-slate-100 text-white light:text-slate-900 border border-[#23355b] focus:border-blue-500 focus:outline-none text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1.5">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e: any) => setNewCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#16223b] light:bg-slate-100 text-white light:text-slate-900 border border-[#23355b] focus:border-blue-500 focus:outline-none text-xs"
                >
                  <option value="Risk">Risk Management</option>
                  <option value="Psychology">Psychology</option>
                  <option value="Analysis">Analysis & Setup</option>
                  <option value="Exit">Exit & Profit Taking</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/25 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Save Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
