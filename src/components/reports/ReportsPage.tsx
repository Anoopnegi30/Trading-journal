import React, { useState } from 'react';
import { useTradeContext } from '../../context/TradeContext';
import { 
  Trophy, 
  Calendar, 
  ArrowRightLeft, 
  Clock, 
  TrendingUp, 
  PieChart, 
  Wallet, 
  Layers, 
  LineChart, 
  Receipt, 
  Activity, 
  Download, 
  Printer,
  ShieldCheck,
  Brain,
  BookOpen
} from 'lucide-react';
import { formatINR } from '../../utils/calculations';

export const ReportsPage: React.FC = () => {
  const { trades, marketFilter, setMarketFilter, dateFilter, setDateFilter, exportCsv } = useTradeContext();
  const [activeReportTab, setActiveReportTab] = useState<'Performance' | 'Psychology' | 'Risk' | 'Journal'>('Performance');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Header matching screenshot 5 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#111a2e] light:bg-white p-4 rounded-3xl border border-[#1e2942] light:border-slate-200 shadow-xl">
        {/* Sub-tabs Navigation */}
        <div className="flex items-center gap-1 bg-[#16223b] light:bg-slate-100 p-1.5 rounded-2xl border border-[#23355b]">
          {(['Performance', 'Psychology', 'Risk', 'Journal'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveReportTab(tab)}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                activeReportTab === tab
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === 'Performance' && <TrendingUp className="w-3.5 h-3.5" />}
              {tab === 'Psychology' && <Brain className="w-3.5 h-3.5" />}
              {tab === 'Risk' && <ShieldCheck className="w-3.5 h-3.5" />}
              {tab === 'Journal' && <BookOpen className="w-3.5 h-3.5" />}
              {tab}
            </button>
          ))}
        </div>

        {/* Date & Market Filters */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-[#16223b] light:bg-slate-100 text-slate-200 text-xs font-semibold rounded-xl px-3 py-2 border border-[#23355b] focus:outline-none"
          >
            <option value="Last 30 Days">Last 30 Days</option>
            <option value="This Month">This Month</option>
            <option value="All Time">All Time</option>
          </select>

          <select
            value={marketFilter}
            onChange={(e) => setMarketFilter(e.target.value)}
            className="bg-[#16223b] light:bg-slate-100 text-slate-200 text-xs font-semibold rounded-xl px-3 py-2 border border-[#23355b] focus:outline-none"
          >
            <option value="Indian">Indian</option>
            <option value="Crypto">Crypto</option>
            <option value="Forex">Forex</option>
          </select>

          <button
            onClick={exportCsv}
            className="p-2 rounded-xl bg-[#16223b] hover:bg-[#202f50] text-slate-300 border border-[#23355b]"
            title="Export CSV"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 12-Card Analytics Grid matching screenshots 1, 3, 4, 5 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* Card 1: Trade Performance */}
        <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400">Trade Performance</span>
              <div className="text-xl font-black text-white light:text-slate-900 mt-0.5">
                <span className="text-emerald-400">12</span> / <span className="text-rose-400">4</span> / <span className="text-slate-400">1</span>
              </div>
              <p className="text-[10px] text-slate-400">Win / Loss / Break Even</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1e2942] text-xs">
            <div className="p-2.5 rounded-xl bg-[#16223b] light:bg-slate-50 border border-[#23355b]">
              <span className="text-[10px] text-slate-400">Avg Win</span>
              <p className="font-bold text-emerald-400 mt-0.5">₹13,593.23</p>
            </div>
            <div className="p-2.5 rounded-xl bg-[#16223b] light:bg-slate-50 border border-[#23355b]">
              <span className="text-[10px] text-slate-400">Avg Loss</span>
              <p className="font-bold text-rose-400 mt-0.5">-₹4,237.79</p>
            </div>
            <div className="p-2.5 rounded-xl bg-[#16223b] light:bg-slate-50 border border-[#23355b]">
              <span className="text-[10px] text-slate-400">Win Rate</span>
              <p className="font-bold text-white light:text-slate-900 mt-0.5">75%</p>
            </div>
            <div className="p-2.5 rounded-xl bg-[#16223b] light:bg-slate-50 border border-[#23355b]">
              <span className="text-[10px] text-slate-400">Expectancy</span>
              <p className="font-bold text-white light:text-slate-900 mt-0.5">₹9,135.48</p>
            </div>
          </div>
        </div>

        {/* Card 2: Daily Performance */}
        <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400">Daily Performance</span>
              <div className="text-xl font-black text-white light:text-slate-900 mt-0.5">
                <span className="text-emerald-400">10</span> / <span className="text-rose-400">0</span> / <span className="text-slate-400">1</span>
              </div>
              <p className="text-[10px] text-slate-400">Win / Loss / Break Even Days</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1e2942] text-xs">
            <div className="p-2.5 rounded-xl bg-[#16223b] light:bg-slate-50 border border-[#23355b]">
              <span className="text-[10px] text-slate-400">Best Day</span>
              <p className="font-bold text-emerald-400 mt-0.5">₹31,074.54</p>
            </div>
            <div className="p-2.5 rounded-xl bg-[#16223b] light:bg-slate-50 border border-[#23355b]">
              <span className="text-[10px] text-slate-400">Worst Day</span>
              <p className="font-bold text-slate-400 mt-0.5">₹0</p>
            </div>
            <div className="p-2.5 rounded-xl bg-[#16223b] light:bg-slate-50 border border-[#23355b]">
              <span className="text-[10px] text-slate-400">Avg Win Day</span>
              <p className="font-bold text-emerald-400 mt-0.5">₹14,616.77</p>
            </div>
            <div className="p-2.5 rounded-xl bg-[#16223b] light:bg-slate-50 border border-[#23355b]">
              <span className="text-[10px] text-slate-400">Avg Loss Day</span>
              <p className="font-bold text-slate-400 mt-0.5">₹0</p>
            </div>
          </div>
        </div>

        {/* Card 3: Trade Execution */}
        <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400">Trade Execution</span>
              <h3 className="text-xl font-black text-white light:text-slate-900 mt-0.5">
                Overview
              </h3>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-2.5 pt-2 border-t border-[#1e2942] text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Total Trades</span>
              <span className="font-bold text-white light:text-slate-900">17</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Avg Capital Used</span>
              <span className="font-bold text-white light:text-slate-900">₹1,42,287.02</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Most Profitable Strategy</span>
              <span className="font-bold text-blue-400">Breakout</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Consecutive Wins</span>
              <span className="font-bold text-emerald-400">5</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Consecutive Losses</span>
              <span className="font-bold text-rose-400">2</span>
            </div>
          </div>
        </div>

        {/* Card 4: Time Metrics */}
        <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Time Metrics</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-2.5 pt-2 border-t border-[#1e2942] text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Trading Days</span>
              <span className="font-bold text-white light:text-slate-900">11</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Consecutive Win Days</span>
              <span className="font-bold text-emerald-400">7</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Consecutive Loss Days</span>
              <span className="font-bold text-slate-400">0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Most Profitable Day</span>
              <span className="font-bold text-emerald-400">Wednesday</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Least Profitable Day</span>
              <span className="font-bold text-rose-400">Friday</span>
            </div>
          </div>
        </div>

        {/* Card 5: Setup Effectiveness */}
        <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Setup Effectiveness</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-2.5 pt-2 border-t border-[#1e2942] text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Breakout</span>
              <span className="font-bold text-emerald-400">88.9% win rate</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">9&15 Ema</span>
              <span className="font-bold text-emerald-400">66.7% win rate</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Reversal</span>
              <span className="font-bold text-slate-400">0% win rate</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Pullback</span>
              <span className="font-bold text-rose-400">0% win rate</span>
            </div>
          </div>
        </div>

        {/* Card 6: Symbol Frequency */}
        <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Symbol Frequency</span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
              <PieChart className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-2.5 pt-2 border-t border-[#1e2942] text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Most Traded Symbol</span>
              <span className="font-bold text-white light:text-slate-900 truncate max-w-[130px]">NIFTY-APR202...</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Most Profitable Symbol</span>
              <span className="font-bold text-emerald-400 truncate max-w-[130px]">NIFTY-APR202...</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Least Profitable Symbol</span>
              <span className="font-bold text-slate-400 truncate max-w-[130px]">NO_TRADE (₹...</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Highest Win Rate</span>
              <span className="font-bold text-emerald-400 truncate max-w-[130px]">NIFTY-MAY20...</span>
            </div>
          </div>
        </div>

        {/* Card 7: Capital Usage matching screenshot 1 */}
        <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Capital Usage</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-2.5 pt-2 border-t border-[#1e2942] text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Maximum</span>
              <span className="font-bold text-white font-mono">₹954,073</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Minimum</span>
              <span className="font-bold text-white font-mono">₹0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Average</span>
              <span className="font-bold text-white font-mono">₹142,287</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">P&L at Max Capital</span>
              <span className="font-bold text-emerald-400">+₹21,452</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">P&L at Min Capital</span>
              <span className="font-bold text-slate-400">+₹0</span>
            </div>
          </div>
        </div>

        {/* Card 8: Quantity Analysis matching screenshot 1 */}
        <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Quantity Analysis</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-2.5 pt-2 border-t border-[#1e2942] text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Maximum</span>
              <span className="font-bold text-white font-mono">18655</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Minimum</span>
              <span className="font-bold text-white font-mono">100</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Average</span>
              <span className="font-bold text-white font-mono">1974</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">P&L at Max Qty</span>
              <span className="font-bold text-emerald-400">+₹21,452</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">P&L at Min Qty</span>
              <span className="font-bold text-emerald-400">+₹14,494</span>
            </div>
          </div>
        </div>

        {/* Card 9: Weekday Avg R:R matching screenshot 1 */}
        <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Weekday Avg R:R</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
              <LineChart className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-2.5 pt-2 border-t border-[#1e2942] text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Monday</span>
              <span className="font-bold text-white">1:1.47</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Tuesday</span>
              <span className="font-bold text-white">1:1.22</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Wednesday</span>
              <span className="font-bold text-emerald-400">1:3</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Thursday</span>
              <span className="font-bold text-slate-400">1:0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Friday</span>
              <span className="font-bold text-white">1:1.83</span>
            </div>
          </div>
        </div>

        {/* Card 10: Weekday Win Rate matching screenshot 1 */}
        <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Weekday Win Rate</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-2.5 pt-2 border-t border-[#1e2942] text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Monday</span>
              <span className="font-bold text-emerald-400">57%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Tuesday</span>
              <span className="font-bold text-emerald-400">75%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Wednesday</span>
              <span className="font-bold text-emerald-400">100%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Thursday</span>
              <span className="font-bold text-slate-400">0%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Friday</span>
              <span className="font-bold text-white">50%</span>
            </div>
          </div>
        </div>

        {/* Card 11: Daily Charges matching screenshot 1 */}
        <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Daily Charges</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-2.5 pt-2 border-t border-[#1e2942] text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400 font-sans">Monday</span>
              <span className="font-bold text-white">₹673.88</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-sans">Tuesday</span>
              <span className="font-bold text-white">₹851.39</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-sans">Wednesday</span>
              <span className="font-bold text-white">₹403.10</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-sans">Thursday</span>
              <span className="font-bold text-slate-400">₹0.00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-sans">Friday</span>
              <span className="font-bold text-white">₹63.23</span>
            </div>
          </div>
        </div>

        {/* Card 12: Daily Trade Activity matching screenshot 1 */}
        <div className="p-5 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Daily Trade Activity</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-2.5 pt-2 border-t border-[#1e2942] text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Avg Trades Per Day</span>
              <span className="font-bold text-white">2</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Max Trades in a Day</span>
              <span className="font-bold text-white">3</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Days With Only 1 Trade</span>
              <span className="font-bold text-emerald-400">6</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Overtrading Days (&gt;7 trades)</span>
              <span className="font-bold text-emerald-400">0</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
