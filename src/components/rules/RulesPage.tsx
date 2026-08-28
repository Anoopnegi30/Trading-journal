import React, { useState } from 'react';
import { useTradeContext } from '../../context/TradeContext';
import { 
  Trophy, 
  AlertTriangle, 
  TrendingUp, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  CheckCircle2,
  ArrowRight,
  Filter
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
  const { rules, toggleRule, deleteRule, addRule, dateFilter, setDateFilter } = useTradeContext();
  const [showInactive, setShowInactive] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'Analysis' | 'Psychology' | 'Exit' | 'Risk management'>('Risk management');

  // Top 5 Most Followed Rules matching screenshot 4
  const topFollowedRules = [
    { percent: 20, name: 'book partial quantity on TP', category: 'Analysis', uses: 12 },
    { percent: 19, name: 'fixed quantity ( 600 quantity in nifty )', category: 'Psychology', uses: 11 },
    { percent: 17, name: 'avoid trading after 3 winning strik', category: 'Psychology', uses: 10 },
    { percent: 14, name: '5-10 points SL in nifty', category: 'Exit', uses: 8 },
    { percent: 14, name: 'Maximum 2 trade in a day', category: 'Analysis', uses: 8 }
  ];

  // Least Used Rules matching screenshot 4
  const leastUsedRules = [
    { name: 'Followed risk management', category: 'Risk management', uses: 3, icon: 'red' },
    { name: 'stop loss trailing', category: 'Risk management', uses: 7, icon: 'red' },
    { name: 'Maximum 2 trade in a day', category: 'Analysis', uses: 8, icon: 'orange' },
    { name: '5-10 points SL in nifty', category: 'Exit', uses: 8, icon: 'red' },
    { name: 'avoid trading after 3 winning strik', category: 'Psychology', uses: 10, icon: 'red' }
  ];

  // Rules Discipline Daily Chart Data matching screenshot 3
  const dailyDisciplineData = [
    { date: '20-04', followed: 7 },
    { date: '22-04', followed: 6 },
    { date: '24-04', followed: 6 },
    { date: '27-04', followed: 7 },
    { date: '04-05', followed: 6 },
    { date: '12-05', followed: 5 },
    { date: '13-05', followed: 6 },
    { date: '18-05', followed: 6 }
  ];

  // Rules collection table list matching screenshot 3
  const rulesCollection = [
    {
      id: 'rc-1',
      title: '5-10 points SL in nifty',
      category: 'Exit',
      categoryColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      adherence: '47%',
      tradesRatio: '8/17 trades',
      usagePercent: 47,
      active: true
    },
    {
      id: 'rc-2',
      title: 'book partial quantity on TP',
      category: 'Analysis',
      categoryColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      adherence: '70%',
      tradesRatio: '12/17 trades',
      usagePercent: 70,
      active: true
    },
    {
      id: 'rc-3',
      title: 'fixed quantity ( 600 quantity in nifty )',
      category: 'Psychology',
      categoryColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      adherence: '65%',
      tradesRatio: '11/17 trades',
      usagePercent: 65,
      active: true
    },
    {
      id: 'rc-4',
      title: 'avoid trading after 3 winning strik',
      category: 'Psychology',
      categoryColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      adherence: '59%',
      tradesRatio: '10/17 trades',
      usagePercent: 59,
      active: true
    },
    {
      id: 'rc-5',
      title: 'Maximum 2 trade in a day',
      category: 'Analysis',
      categoryColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      adherence: '47%',
      tradesRatio: '8/17 trades',
      usagePercent: 47,
      active: true
    },
    {
      id: 'rc-6',
      title: 'stop loss trailing',
      category: 'Risk management',
      categoryColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      adherence: '41%',
      tradesRatio: '7/17 trades',
      usagePercent: 41,
      active: true
    }
  ];

  const handleAddRuleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addRule({
      title: newTitle.trim(),
      description: 'Custom rule added to your discipline setup.',
      category: newCategory === 'Risk management' ? 'Risk' : (newCategory as any),
      mandatory: true,
      active: true
    });
    setNewTitle('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header matching screenshot 4 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#111a2e] light:bg-white p-5 rounded-3xl border border-[#1e2942] light:border-slate-200 shadow-xl">
        <div>
          <h2 className="text-lg font-black text-white light:text-slate-900 tracking-tight">
            Rules Performance Analysis
          </h2>
          <p className="text-xs text-slate-400">
            Track your trading discipline and rule adherence
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-[#16223b] light:bg-slate-100 text-slate-200 text-xs font-semibold rounded-xl px-3.5 py-2 border border-[#23355b] focus:outline-none cursor-pointer"
          >
            <option value="Last 30 days">Last 30 days</option>
            <option value="This Month">This Month</option>
            <option value="All Time">All Time</option>
          </select>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all"
          >
            <Plus className="w-4 h-4" /> Add Rule
          </button>
        </div>
      </div>

      {/* Grid: Top 5 Most Followed vs Least Used Rules matching screenshot 4 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Top 5 Most Followed Rules */}
        <div className="p-6 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
              <Trophy className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white light:text-slate-900">
              Top 5 Most Followed Rules
            </h3>
          </div>

          <div className="space-y-2.5 pt-1">
            {topFollowedRules.map((r, i) => (
              <div
                key={i}
                className="p-3 rounded-2xl bg-[#16223b] light:bg-slate-50 border border-[#23355b] flex items-center justify-between hover:border-blue-500/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {/* Circular % badge */}
                  <div className="w-9 h-9 rounded-full bg-[#0d1527] border border-blue-500/40 flex items-center justify-center font-bold text-[11px] text-blue-400 shrink-0">
                    {r.percent}%
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-white light:text-slate-900">
                      {r.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">{r.category}</p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
                  {r.uses} uses
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Least Used Rules */}
        <div className="p-6 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white light:text-slate-900">
              Least Used Rules
            </h3>
          </div>

          <div className="space-y-2.5 pt-1">
            {leastUsedRules.map((r, i) => (
              <div
                key={i}
                className="p-3 rounded-2xl bg-[#16223b] light:bg-slate-50 border border-[#23355b] flex items-center justify-between hover:border-rose-500/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-2xl flex items-center justify-center text-xs font-black shrink-0 ${
                    r.icon === 'orange'
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                  }`}>
                    ✕
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-white light:text-slate-900">
                      {r.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">{r.category}</p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-[#0d1527] text-slate-300 border border-[#23355b] shrink-0">
                  {r.uses} uses
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Rules Discipline Daily Chart matching screenshot 3 */}
      <div className="p-6 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-white light:text-slate-900">
              Rules Discipline
            </h3>
            <p className="text-xs text-slate-400">Daily rules followed across the selected period</p>
          </div>
          
          <span className="px-3 py-1 rounded-xl text-xs font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            Discipline Trend
          </span>
        </div>

        <div className="w-full h-56 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyDisciplineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2942" vertical={false} />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis domain={[0, 7]} ticks={[0, 1, 2, 3, 4, 5, 6, 7]} stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    return (
                      <div className="p-2 bg-[#0d1527] border border-[#223558] rounded-xl text-xs">
                        <p className="font-bold text-white">{item.date}</p>
                        <p className="text-emerald-400 font-bold mt-0.5">{item.followed} / 7 Rules Followed</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="followed" fill="#10b981" radius={[8, 8, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Rules Collection Table matching screenshot 3 */}
      <div className="rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl overflow-hidden">
        <div className="p-5 border-b border-[#1e2942] flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-white light:text-slate-900">
              Rules Collection
            </h3>
            <p className="text-xs text-slate-400">Review adherence, usage, and maintenance actions</p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Show Inactive</span>
            <button
              onClick={() => setShowInactive(!showInactive)}
              className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                showInactive ? 'bg-blue-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  showInactive ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#1e2942] bg-[#0d1527]/70 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-5">Rule</th>
                <th className="py-3.5 px-5">Category</th>
                <th className="py-3.5 px-5">Adherence</th>
                <th className="py-3.5 px-5">Usage</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#18243e]">
              {rulesCollection.map((rc) => (
                <tr key={rc.id} className="hover:bg-[#152038]/60 transition-colors">
                  <td className="py-4 px-5 font-bold text-white flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">➔</span>
                    {rc.title}
                  </td>
                  <td className="py-4 px-5">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${rc.categoryColor}`}>
                      {rc.category}
                    </span>
                  </td>
                  <td className="py-4 px-5">
                    <span className="font-bold text-slate-200">{rc.adherence}</span>
                    <span className="text-slate-400 text-[11px] ml-1.5">({rc.tradesRatio})</span>
                  </td>
                  <td className="py-4 px-5">
                    <div className="w-32">
                      <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                        <span>{rc.usagePercent}% used</span>
                      </div>
                      <div className="w-full bg-[#18233c] h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-500 h-full rounded-full"
                          style={{ width: `${rc.usagePercent}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <button
                      onClick={() => deleteRule(rc.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                      title="Delete Rule"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Custom Rule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111a2e] border border-[#1e2942] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-white">Add Trading Rule</h3>
            <form onSubmit={handleAddRuleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Rule Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full bg-[#16223b] border border-[#23355b] rounded-xl px-3 py-2 text-white focus:outline-none"
                >
                  <option value="Risk management">Risk Management</option>
                  <option value="Analysis">Analysis</option>
                  <option value="Psychology">Psychology</option>
                  <option value="Exit">Exit</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Rule Statement</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 5-10 points SL in nifty"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#16223b] border border-[#23355b] rounded-xl px-3 py-2 text-white focus:outline-none"
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
