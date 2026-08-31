import React, { useState } from "react";
import { useTradeContext } from "../../context/TradeContext";
import { 
  AlertTriangle, 
  HelpCircle, 
  Flame, 
  TrendingDown, 
  CheckCircle, 
  Calendar,
  Sparkles,
  Plus,
  Trash2,
  Tag
} from "lucide-react";
import { formatINR, getMistakesBreakdown } from "../../utils/calculations";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

export const MistakesPage: React.FC = () => {
  const { trades, availableMistakes, addCustomMistake, deleteCustomMistake } = useTradeContext();
  const [timePeriod, setTimePeriod] = useState<"August 2026" | "All Time">("August 2026");
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagInput, setNewTagInput] = useState("");

  // Dynamic calculations from trades
  const mistakeList = getMistakesBreakdown(trades);
  const totalMistakesCount = mistakeList.reduce((sum, m) => sum + m.tradeCount, 0);
  const totalLossFromMistakes = mistakeList.reduce((sum, m) => sum + m.totalLoss, 0);
  const mostCommon = mistakeList.length > 0 ? mistakeList[0].name : "None";

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagInput.trim()) return;
    addCustomMistake(newTagInput.trim());
    setNewTagInput("");
    setIsAddingTag(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#111a2e] light:bg-white p-5 rounded-3xl border border-[#1e2942] light:border-slate-200 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white light:text-slate-900 tracking-tight flex items-center gap-2">
              Mistakes Tracker & Analytics
            </h2>
            <p className="text-xs text-slate-400">
              Eliminate recurring psychological leaks like FOMO, early exit, and revenge trading
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddingTag(prev => !prev)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-500/25 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Mistake Tag</span>
        </button>
      </div>

      {/* Inline Tag Creator */}
      {isAddingTag && (
        <form onSubmit={handleAddTag} className="p-4 rounded-3xl bg-[#111a2e] light:bg-white border border-blue-500/40 shadow-xl flex flex-col sm:flex-row items-stretch sm:items-center gap-3 animate-in fade-in">
          <div className="flex-1 flex items-center gap-2 bg-[#16223b] light:bg-slate-100 border border-[#23355b] light:border-slate-300 rounded-2xl px-3.5 py-2">
            <Tag className="w-4 h-4 text-blue-400 shrink-0" />
            <input
              type="text"
              autoFocus
              placeholder="e.g. Trailing SL cut too early, Overtrading on expiry day, Traded without 15m candle close..."
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              className="bg-transparent text-xs text-white light:text-slate-900 placeholder-slate-500 focus:outline-none w-full"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={!newTagInput.trim()}
              className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-md"
            >
              Save Tag
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAddingTag(false);
                setNewTagInput("");
              }}
              className="px-4 py-2.5 rounded-2xl bg-[#16223b] light:bg-slate-100 text-slate-300 light:text-slate-700 text-xs font-bold hover:bg-[#1a2947] transition-all cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl">
          <span className="text-xs font-bold text-slate-400">Total Mistakes Logged</span>
          <div className="text-2xl font-black text-white light:text-slate-900 mt-1">
            {totalMistakesCount}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Logged in {timePeriod}</p>
        </div>

        <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl">
          <span className="text-xs font-bold text-slate-400">Most Common Leak</span>
          <div className="text-2xl font-black text-rose-400 mt-1 truncate">
            {mostCommon}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Identified execution pattern</p>
        </div>

        <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl">
          <span className="text-xs font-bold text-slate-400">Total Capital Cost</span>
          <div className="text-2xl font-black text-rose-400 mt-1">
            {totalLossFromMistakes > 0 ? `-${formatINR(totalLossFromMistakes)}` : "₹0.00"}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Estimated cost of psychological leaks</p>
        </div>
      </div>

      {/* Distribution Chart or Empty State */}
      {mistakeList.length === 0 ? (
        <div className="p-12 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl text-center space-y-3">
          <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto opacity-70" />
          <h3 className="text-base font-bold text-white light:text-slate-900">Zero Execution Mistakes for August 2026</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            You have zero mistakes recorded. Whenever you log a trade with tag errors (like FOMO, Greed, Early Exit), frequency charts and leak analyses will generate here.
          </p>
        </div>
      ) : (
        <div className="p-6 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white light:text-slate-900">
            Mistake Distribution & Financial Impact
          </h3>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mistakeList} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2942" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="p-2.5 bg-[#0d1527] border border-[#223558] rounded-xl text-xs">
                          <p className="font-bold text-white">{item.name}</p>
                          <p className="text-rose-400 font-bold mt-0.5">Total Cost: -{formatINR(item.totalLoss)}</p>
                          <p className="text-slate-400 text-[11px]">Occurrences: {item.tradeCount}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="tradeCount" fill="#f43f5e" radius={[6, 6, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Mistake Library Tags Box */}
      <div className="p-6 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white light:text-slate-900">
              Active Mistake Tags Library
            </h3>
            <p className="text-xs text-slate-400">These tags appear in your trade logging & psychology forms</p>
          </div>
          <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-xl border border-blue-500/20">
            {availableMistakes?.length || 0} Tags Available
          </span>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {(availableMistakes || []).map(m => (
            <div
              key={m}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#16223b] light:bg-slate-100 border border-[#23355b] light:border-slate-200 text-xs font-semibold text-slate-300 light:text-slate-700 group hover:border-slate-400 transition-all"
            >
              <span>{m}</span>
              {m !== "No Mistakes" && (
                <button
                  type="button"
                  title={`Delete ${m}`}
                  onClick={() => deleteCustomMistake(m)}
                  className="text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={() => setIsAddingTag(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dashed border-blue-500/40 text-blue-400 hover:bg-blue-500/10 text-xs font-bold transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Mistake Tag</span>
          </button>
        </div>
      </div>

    </div>
  );
};
