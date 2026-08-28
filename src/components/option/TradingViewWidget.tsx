import React, { useEffect, useRef, memo } from "react";
import { useTradeContext } from "../../context/TradeContext";

interface TradingViewWidgetProps {
  symbol: string;
}

const TRADINGVIEW_SYMBOLS: Record<string, string> = {
  NIFTY: "NSE:NIFTY",
  BANKNIFTY: "NSE:BANKNIFTY",
  FINNIFTY: "NSE:FINNIFTY",
  SENSEX: "BSE:SENSEX"
};

export const TradingViewWidget: React.FC<TradingViewWidgetProps> = memo(({ symbol }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTradeContext();

  const tvSymbol = TRADINGVIEW_SYMBOLS[symbol] || "NSE:NIFTY";

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
    <div 
      className="tradingview-widget-container w-full h-[520px] rounded-2xl overflow-hidden border border-[#1e2d4d] light:border-slate-200 shadow-inner" 
      ref={containerRef} 
    />
  );
});

TradingViewWidget.displayName = "TradingViewWidget";
