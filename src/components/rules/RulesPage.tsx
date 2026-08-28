import React, { useState } from 'react';
import { useTradeContext } from '../../context/TradeContext';
import { ShieldCheck, Plus, Trash2, CheckCircle2, AlertOctagon } from 'lucide-react';

export const RulesPage: React.FC = () => {
  const { rules, toggleRule, deleteRule, addRule } = useTradeContext();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState<'Risk' | 'Execution' | 'Psychology'>('Risk');

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addRule({
      title: newTitle.trim(),
      description: newDesc.trim(),
      category: newCategory,
      mandatory: true,
      active: true
    });
    setNewTitle('');
    setNewDesc('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#111a2e] light:bg-white p-5 rounded-2xl border border-[#1e2942] light:border-slate-200 shadow-lg">
        <div>
          <h2 className="text-lg font-black text-white light:text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            Trading Rules & Non-Negotiables
          </h2>
          <p className="text-xs text-slate-400">
            Define and enforce your risk and emotional control guidelines
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          Add New Rule
        </button>
      </div>

      {/* Rules List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className={`p-5 rounded-3xl border shadow-lg space-y-3 transition-all ${
              rule.active
                ? 'bg-[#111a2e] light:bg-white border-[#1e2942] light:border-slate-200'
                : 'bg-[#0e1628]/40 border-[#1a253e] opacity-60'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold ${
                  rule.category === 'Risk' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                  rule.category === 'Psychology' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                  'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                }`}>
                  {rule.category}
                </span>
                {rule.mandatory && (
                  <span className="text-[10px] text-amber-400 font-semibold">
                    ★ Mandatory
                  </span>
                )}
              </div>

              {/* Active Toggle & Delete */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleRule(rule.id)}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                    rule.active ? 'bg-emerald-600' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      rule.active ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
                <button
                  onClick={() => deleteRule(rule.id)}
                  className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-white light:text-slate-900 leading-snug">
                {rule.title}
              </h3>
              {rule.description && (
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {rule.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Rule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-white light:text-slate-900">
              Add Trading Rule
            </h3>

            <form onSubmit={handleAddRule} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Rule Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full bg-[#16223b] light:bg-slate-100 border border-[#23355b] rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
                >
                  <option value="Risk">Risk Management</option>
                  <option value="Execution">Execution & Entry</option>
                  <option value="Psychology">Psychology & Discipline</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Rule Statement</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Maximum 2 losses allowed in a single day"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#16223b] light:bg-slate-100 border border-[#23355b] rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Description / Rationale</label>
                <textarea
                  rows={2}
                  placeholder="Why is this rule crucial for your edge?"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-[#16223b] light:bg-slate-100 border border-[#23355b] rounded-xl p-3 text-slate-200 focus:outline-none"
                />
              </div>

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
