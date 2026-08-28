import React from 'react';
import { useTradeContext } from '../../context/TradeContext';
import { CheckSquare, RotateCcw, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

export const ChecklistPage: React.FC = () => {
  const { checklist, toggleChecklist, resetChecklist } = useTradeContext();

  const completedCount = checklist.filter(c => c.completed).length;
  const totalCount = checklist.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  const categories = ['Pre-Market', 'Execution', 'Post-Market'] as const;

  return (
    <div className="space-y-5">
      {/* Header & Progress */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#111a2e] light:bg-white p-5 rounded-2xl border border-[#1e2942] light:border-slate-200 shadow-lg">
        <div>
          <h2 className="text-lg font-black text-white light:text-slate-900 tracking-tight flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-blue-400" />
            Daily Trading Checklist
          </h2>
          <p className="text-xs text-slate-400">
            Enforce strict discipline before and after taking trades
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex-1 sm:w-48 bg-[#16223b] light:bg-slate-100 p-2.5 rounded-xl border border-[#23355b] light:border-slate-200 text-xs">
            <div className="flex justify-between font-bold mb-1">
              <span className="text-slate-300 light:text-slate-800">Discipline Score</span>
              <span className="text-emerald-400">{progressPercent}%</span>
            </div>
            <div className="w-full bg-[#0d1527] light:bg-slate-300 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <button
            onClick={resetChecklist}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#16223b] light:bg-slate-100 hover:bg-[#202f50] text-xs font-semibold text-slate-300 light:text-slate-700 border border-[#23355b] light:border-slate-200 transition-colors shrink-0"
            title="Reset for new trading day"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Daily
          </button>
        </div>
      </div>

      {/* Categorized Checklist Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {categories.map(cat => {
          const items = checklist.filter(c => c.category === cat);
          const catDone = items.filter(c => c.completed).length;

          return (
            <div
              key={cat}
              className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-lg space-y-4"
            >
              <div className="flex items-center justify-between border-b border-[#1e2942] light:border-slate-100 pb-3">
                <h3 className="font-extrabold text-sm text-white light:text-slate-900">
                  {cat}
                </h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-blue-500/15 text-blue-400">
                  {catDone}/{items.length} done
                </span>
              </div>

              <div className="space-y-2.5">
                {items.map(item => (
                  <label
                    key={item.id}
                    className={`flex items-start gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                      item.completed
                        ? 'bg-emerald-950/20 border-emerald-500/30'
                        : 'bg-[#16223b] light:bg-slate-50 border-[#23355b] light:border-slate-200 hover:border-blue-500/40'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => toggleChecklist(item.id)}
                      className="mt-0.5 rounded accent-emerald-500 w-4 h-4 cursor-pointer"
                    />
                    <span
                      className={`text-xs leading-relaxed transition-all ${
                        item.completed
                          ? 'line-through text-slate-400 font-medium'
                          : 'text-slate-200 light:text-slate-800 font-semibold'
                      }`}
                    >
                      {item.title}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
