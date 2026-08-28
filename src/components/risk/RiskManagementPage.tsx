import React, { useState } from 'react';
import { Scale, Calculator, ShieldAlert, CheckCircle2, TrendingUp, AlertTriangle } from 'lucide-react';
import { formatINR } from '../../utils/calculations';

export const RiskManagementPage: React.FC = () => {
  const [totalCapital, setTotalCapital] = useState<number>(500000);
  const [riskPercent, setRiskPercent] = useState<number>(1.5);
  const [entryPrice, setEntryPrice] = useState<number>(150);
  const [stopLoss, setStopLoss] = useState<number>(140);
  const [targetPrice, setTargetPrice] = useState<number>(180);
  const [lotSize, setLotSize] = useState<number>(25); // e.g. Nifty / Bank Nifty lot size

  const maxRiskAmount = (totalCapital * riskPercent) / 100;
  const slDistance = Math.abs(entryPrice - stopLoss);
  const targetDistance = Math.abs(targetPrice - entryPrice);

  let allowedShares = 0;
  let allowedLots = 0;
  let totalInvestment = 0;
  let maxPotentialLoss = 0;
  let maxPotentialGain = 0;
  let rrRatio = '1:0.0';

  if (slDistance > 0) {
    allowedShares = Math.floor(maxRiskAmount / slDistance);
    allowedLots = lotSize > 0 ? Math.floor(allowedShares / lotSize) : 0;
    totalInvestment = allowedShares * entryPrice;
    maxPotentialLoss = allowedShares * slDistance;
    maxPotentialGain = allowedShares * targetDistance;
    rrRatio = `1:${(targetDistance / slDistance).toFixed(2)}`;
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-[#111a2e] light:bg-white p-5 rounded-2xl border border-[#1e2942] light:border-slate-200 shadow-lg">
        <h2 className="text-lg font-black text-white light:text-slate-900 tracking-tight flex items-center gap-2">
          <Scale className="w-5 h-5 text-purple-400" />
          Position Sizing & Risk Management Calculator
        </h2>
        <p className="text-xs text-slate-400">
          Calculate the mathematical exact position size before entering orders to protect your capital
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Input Parameters */}
        <div className="p-6 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-lg space-y-4 text-xs">
          <h3 className="text-sm font-bold text-white light:text-slate-900 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-blue-400" /> Setup Parameters
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 light:text-slate-700 font-bold mb-1">
                Account Capital (₹)
              </label>
              <input
                type="number"
                value={totalCapital}
                onChange={(e) => setTotalCapital(Number(e.target.value))}
                className="w-full bg-[#16223b] light:bg-slate-100 border border-[#23355b] rounded-xl px-3 py-2 text-slate-200 font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 light:text-slate-700 font-bold mb-1">
                Risk per Trade (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={riskPercent}
                onChange={(e) => setRiskPercent(Number(e.target.value))}
                className="w-full bg-[#16223b] light:bg-slate-100 border border-[#23355b] rounded-xl px-3 py-2 text-slate-200 font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 light:text-slate-700 font-bold mb-1">
                Entry Price (₹)
              </label>
              <input
                type="number"
                step="any"
                value={entryPrice}
                onChange={(e) => setEntryPrice(Number(e.target.value))}
                className="w-full bg-[#16223b] light:bg-slate-100 border border-[#23355b] rounded-xl px-3 py-2 text-slate-200 font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 light:text-slate-700 font-bold mb-1">
                Stop Loss Price (₹)
              </label>
              <input
                type="number"
                step="any"
                value={stopLoss}
                onChange={(e) => setStopLoss(Number(e.target.value))}
                className="w-full bg-[#16223b] light:bg-slate-100 border border-[#23355b] rounded-xl px-3 py-2 text-slate-200 font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 light:text-slate-700 font-bold mb-1">
                Target Price (₹)
              </label>
              <input
                type="number"
                step="any"
                value={targetPrice}
                onChange={(e) => setTargetPrice(Number(e.target.value))}
                className="w-full bg-[#16223b] light:bg-slate-100 border border-[#23355b] rounded-xl px-3 py-2 text-slate-200 font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 light:text-slate-700 font-bold mb-1">
                Lot Multiplier (e.g. 25/50)
              </label>
              <input
                type="number"
                value={lotSize}
                onChange={(e) => setLotSize(Number(e.target.value))}
                className="w-full bg-[#16223b] light:bg-slate-100 border border-[#23355b] rounded-xl px-3 py-2 text-slate-200 font-mono focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Output Sizing Output Cards */}
        <div className="p-6 rounded-3xl bg-gradient-to-b from-[#131d35] to-[#111a2e] border border-[#1e2942] shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-purple-400 uppercase tracking-wider">
            Optimal Position Size Results
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-[#0e1628] border border-[#1c2a47]">
              <span className="text-[11px] text-slate-400 font-medium">Exact Allowed Quantity</span>
              <p className="text-2xl font-black text-white mt-1">
                {allowedShares} <span className="text-xs text-slate-400 font-normal">shares / units</span>
              </p>
              {lotSize > 1 && (
                <p className="text-[11px] text-cyan-400 mt-0.5">({allowedLots} Lots of {lotSize})</p>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-[#0e1628] border border-[#1c2a47]">
              <span className="text-[11px] text-slate-400 font-medium">Risk-to-Reward Ratio</span>
              <p className="text-2xl font-black text-purple-400 mt-1">
                {rrRatio}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">SL distance: ₹{slDistance.toFixed(2)}</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#0e1628] border border-[#1c2a47]">
              <span className="text-[11px] text-slate-400 font-medium">Max Planned Loss</span>
              <p className="text-xl font-black text-rose-400 mt-1">
                -{formatINR(maxPotentialLoss)}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">{riskPercent}% of account</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#0e1628] border border-[#1c2a47]">
              <span className="text-[11px] text-slate-400 font-medium">Target Potential Profit</span>
              <p className="text-xl font-black text-emerald-400 mt-1">
                +{formatINR(maxPotentialGain)}
              </p>
              <p className="text-[11px] text-emerald-400 mt-0.5">
                +{((maxPotentialGain / totalCapital) * 100).toFixed(1)}% account gain
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#0e1628] border border-[#1c2a47] text-xs text-slate-300 flex items-center justify-between">
            <span className="text-slate-400">Total Capital Required for Entry:</span>
            <span className="font-bold text-white font-mono">{formatINR(totalInvestment)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
