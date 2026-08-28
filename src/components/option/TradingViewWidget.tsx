import React, { useEffect, useRef, useState, memo } from "react";
import { useTradeContext } from "../../context/TradeContext";

interface TradingViewWidgetProps {
  symbol: string;
}

const FEED_MAPPINGS: Record<string, { spot: string; futures: string; index: string }> = {
  NIFTY: { spot: "TVC:INDIA50", futures: "NSE:NIFTY1!", index: "INDEX:NIFTY" },
  BANKNIFTY: { spot: "NSE:BANKNIFTY1!", futures: "NSE:BANKNIFTY1!", index: "INDEX:BANKNIFTY" },
  FINNIFTY: { spot: "NSE:FINNIFTY1!", futures: "NSE:FINNIFTY1!", index: "INDEX:FINNIFTY" },
  SENSEX: { spot: "BSE:SENSEX", futures: "BSE:SENSEX1!", index: "INDEX:SENSEX" }
};

export const TradingViewWidget: React.FC<TradingViewWidgetProps> = memo(({ symbol }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTradeContext();
  const [feedType, setFeedType] = useState<"spot" | "futures" | "index">("spot");

  const activeMapping = FEED_MAPPINGS[symbol] || FEED_MAPPINGS.NIFTY;
  const tvSymbol = activeMapping[feedType] || activeMapping.spot;

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous container content
    containerRef.current.innerHTML = "";

    const widgetContainer = document.createElement("div");
    widgetContainer.className = "tradingview-widget-container__widget";
    widgetContainer.style.height = "100%";
    widgetContainer.style.width = "100%";
    containerRef.current.appendChild(widgetContainer);

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: tvSymbol,
      interval: "5",
      timezone: "Asia/Kolkata",
      theme: theme === "dark" ? "dark" : "light",
      style: "1",
      locale: "in",
      enable_publishing: false,
      backgroundColor: theme === "dark" ? "#0d1527" : "#ffffff",
      gridColor: theme === "dark" ? "rgba(30, 41, 66, 0.6)" : "rgba(226, 232, 240, 0.6)",
      allow_symbol_change: true,
      hide_side_toolbar: false,
      calendar: false,
      studies: [
        "STD;VWAP",
        "STD;EMA",
        "STD;Volume"
      ],
      support_host: "https://www.tradingview.com"
    });

    containerRef.current.appendChild(script);
  }, [tvSymbol, theme]);

  return (
    <div className="space-y-2">
      {/* Feed Switcher Badges */}
      <div className="flex items-center justify-between text-xs px-1">
        <span className="text-[11px] text-slate-400 font-medium">
          Feed: <strong className="text-white font-mono">{tvSymbol}</strong>
        </span>
        <div className="flex items-center gap-1.5 bg-[#16223b] light:bg-slate-100 p-1 rounded-xl border border-[#23355b] light:border-slate-200">
          <button
            onClick={() => setFeedType("spot")}
            className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
              feedType === "spot" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Live Spot / India 50
          </button>
          <button
            onClick={() => setFeedType("futures")}
            className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
              feedType === "futures" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            NSE Continuous Futures
          </button>
          <button
            onClick={() => setFeedType("index")}
            className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
              feedType === "index" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Index Feed
          </button>
        </div>
      </div>

      <div 
        className="tradingview-widget-container w-full h-[520px] rounded-2xl overflow-hidden border border-[#1e2d4d] light:border-slate-200 shadow-inner" 
        ref={containerRef} 
      />
    </div>
  );
});

TradingViewWidget.displayName = "TradingViewWidget";
