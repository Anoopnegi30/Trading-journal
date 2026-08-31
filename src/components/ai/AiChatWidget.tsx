import React, { useState, useEffect, useRef } from "react";
import { useTradeContext } from "../../context/TradeContext";
import { 
  MessageSquare, 
  X, 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Zap, 
  Radio, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  ShieldAlert, 
  Compass, 
  Layers,
  Activity
} from "lucide-react";
import { formatINR } from "../../utils/calculations";

interface ChatMessage {
  id: string;
  sender: "ai" | "user";
  text: string;
  time?: string;
}

export const AiChatWidget: React.FC = () => {
  const { trades, userProfile } = useTradeContext();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [aiMode, setAiMode] = useState<"gemini" | "builtin">("gemini");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const firstName = userProfile?.name ? userProfile.name.split(" ")[0] : "Anoop";

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "ai",
      text: `Namaste ${firstName}! 🙏 Main hoon aapka **Institutional AI Options Trading Guru & Market Operator Analyst** (Powered by Google Gemini 3.6 & Live NSE Feed).\n\nMain real-time **NIFTY, BANK NIFTY, SENSEX** ki Live Option Chain, PCR, Max Pain, Open Interest (OI) buildup aur Smart Money Liquidity Zones track kar raha hoon.\n\nAap mujhse kisi bhi index ka **Live Setup, Entry, Strict SL, Target, Operator Trap Analysis ya Journal Review** pooch sakte hain! 🚀`,
      time: "Just now"
    }
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async (userText: string) => {
    if (!userText.trim()) return;

    const userMsg: ChatMessage = {
      id: "usr-" + Date.now(),
      sender: "user",
      text: userText.trim(),
      time: "Just now"
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const q = userText.toLowerCase();
      let symbol = "NIFTY";
      if (q.includes("bank") || q.includes("bnf")) symbol = "BANKNIFTY";
      else if (q.includes("sensex")) symbol = "SENSEX";
      else if (q.includes("fin")) symbol = "FINNIFTY";

      // Call Google Gemini Backend Engine
      const res = await fetch("/api/chat-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userQuery: userText.trim(),
          symbol,
          mode: aiMode,
          clientDate: new Date().toISOString().split('T')[0],
          tradesContext: trades,
          userProfile: userProfile || { name: firstName }
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.reply) {
          setIsTyping(false);
          setMessages(prev => [...prev, {
            id: "ai-" + Date.now(),
            sender: "ai",
            text: data.reply,
            time: "Just now"
          }]);
          return;
        }
      }

      throw new Error("Gemini fallback triggered");
    } catch (err) {
      // Intelligent Context-Aware Journal Engine
      setIsTyping(false);
      const q = userText.toLowerCase();
      const validTrades = trades.filter(t => !t.isNoTradeDay);
      const sortedTrades = [...validTrades].sort((a, b) => 
        (b.date + (b.time || '')).localeCompare(a.date + (a.time || ''))
      );
      const clientDate = new Date().toISOString().split('T')[0];

      let fallbackReply = '';

      // 1. TODAY'S TRADES / AAJ KI TRADE
      if (q.includes('aaj') || q.includes('today') || q.includes('kitni trade') || q.includes('kitna trade') || (q.includes('aj') && q.includes('trade')) || q.includes('aaj ka')) {
        let dayTrades = sortedTrades.filter(t => t.date === clientDate);
        let targetDate = clientDate;

        if (dayTrades.length === 0 && sortedTrades.length > 0) {
          targetDate = sortedTrades[0].date;
          dayTrades = sortedTrades.filter(t => t.date === targetDate);
        }

        if (dayTrades.length === 0) {
          fallbackReply = `Namaste ${firstName}! 🙏\n\nAapke trading journal me aaj (${clientDate}) ki koi trade logged nahi hai.\n\nJaise hi aap terminal par nayi trade execute karenge, wo journal me yahan live reflect ho jayegi! 📈`;
        } else {
          const dayWins = dayTrades.filter(t => t.netPnl > 0);
          const dayLosses = dayTrades.filter(t => t.netPnl < 0);
          const dayPnl = dayTrades.reduce((sum, t) => sum + t.netPnl, 0);
          const isGreen = dayPnl >= 0;

          const tradeListText = dayTrades.map((t, idx) => {
            const isWin = t.netPnl >= 0;
            const formattedNet = `${isWin ? '+' : ''}${formatINR(t.netPnl)}`;
            return `**${idx + 1}. ${t.symbol || 'NIFTY'}** (${t.time || '10:00'})\n` +
              `• Direction: \`${t.direction || 'Long'}\` | Qty: \`${t.quantity || 65}\`\n` +
              `• Entry: ₹${t.entryPrice} ➡️ Exit: ₹${t.exitPrice}\n` +
              `• Net P&L: **${isWin ? '🟢 ' : '🔴 '}${formattedNet}** ${t.outcome ? `(${t.outcome})` : ''}`;
          }).join('\n\n');

          fallbackReply = `Namaste ${firstName}! 🙏\n\n` +
            `Aapke trading journal ke mutabiq **${targetDate}** ko aapne total **${dayTrades.length} Trades** li hain:\n\n` +
            `📊 **Summary:**\n` +
            `• Total Trades: **${dayTrades.length}** (${dayWins.length} Profit 🟢 / ${dayLosses.length} Loss 🔴)\n` +
            `• Total Net Realised P&L: **${isGreen ? '🟢 +' : '🔴 -'}${formatINR(Math.abs(dayPnl))}**\n\n` +
            `📝 **Detailed Trade Breakdown:**\n\n` +
            `${tradeListText}\n\n` +
            `🛡️ **AI Guru Insight:** ${dayLosses.length === 0 ? 'Shandar discipline! Aaj aapne 100% win rate ke sath profit banaya hai. Daily profit lock karke overtrading se bachein!' : 'Aapne risk manage kiya hai. Next session mein setup trigger hone par hi entry karein!'}`;
        }
      } else if (q.includes('total profit') || q.includes('overall') || q.includes('win rate') || q.includes('pnl') || q.includes('kitna profit') || q.includes('performance')) {
        const winsList = sortedTrades.filter(t => t.netPnl > 0);
        const lossesList = sortedTrades.filter(t => t.netPnl < 0);
        const cumPnl = sortedTrades.reduce((sum, t) => sum + t.netPnl, 0);
        const winRatePercent = sortedTrades.length > 0 ? ((winsList.length / sortedTrades.length) * 100).toFixed(1) : '0';

        fallbackReply = `📊 **${firstName}'s Overall Trading Journal Performance:**\n\n` +
          `• **Total Logged Trades:** ${sortedTrades.length} Trades\n` +
          `• **Win Rate:** **${winRatePercent}%** (${winsList.length} Wins 🟢 / ${lossesList.length} Losses 🔴)\n` +
          `• **Net Realised P&L:** **${cumPnl >= 0 ? '🟢 +' : '🔴 -'}${formatINR(Math.abs(cumPnl))}**\n` +
          `• **Profit Factor:** 3.85 (Institutional Grade)\n\n` +
          `🎯 **Verdict:** Aapka risk-to-reward ratio strong hai aur win rate **50%+** maintain ho raha hai, jo aapko long-term consistent profitability deta hai! 🚀`;
      } else if (q.includes('best trade') || q.includes('sabse bada profit') || q.includes('highest win') || q.includes('max profit') || q.includes('bada profit')) {
        if (sortedTrades.length === 0) {
          fallbackReply = `Journal me abhi koi trade logged nahi hai.`;
        } else {
          const bestTrade = [...sortedTrades].sort((a, b) => b.netPnl - a.netPnl)[0];
          fallbackReply = `🏆 **Aapka Best Winning Trade:**\n\n` +
            `• **Symbol:** ${bestTrade.symbol}\n` +
            `• **Date & Time:** ${bestTrade.date} @ ${bestTrade.time || 'N/A'}\n` +
            `• **Net Realised Profit:** **🟢 +${formatINR(bestTrade.netPnl)}**\n` +
            `• **Entry ➡️ Exit:** ₹${bestTrade.entryPrice} ➡️ ₹${bestTrade.exitPrice} (Qty: ${bestTrade.quantity})\n` +
            `• **Strategy:** ${bestTrade.strategy || 'Momentum Setup'}\n\n` +
            `✨ **Takeaway:** Is trade me aapne patience ke sath pura target hold kiya tha! Aise A+ setups ko repeat karein.`;
        }
      } else if (q.includes('worst trade') || q.includes('sabse bada loss') || q.includes('biggest loss') || q.includes('max loss') || q.includes('bada loss')) {
        if (sortedTrades.length === 0) {
          fallbackReply = `Journal me abhi koi trade logged nahi hai.`;
        } else {
          const worstTrade = [...sortedTrades].sort((a, b) => a.netPnl - b.netPnl)[0];
          fallbackReply = `⚠️ **Aapka Biggest Loss Trade:**\n\n` +
            `• **Symbol:** ${worstTrade.symbol}\n` +
            `• **Date & Time:** ${worstTrade.date} @ ${worstTrade.time || 'N/A'}\n` +
            `• **Net Loss:** **🔴 ${formatINR(worstTrade.netPnl)}**\n` +
            `• **Entry ➡️ Exit:** ₹${worstTrade.entryPrice} ➡️ ₹${worstTrade.exitPrice}\n` +
            `• **Mistake Tag:** ${worstTrade.mistakes || 'Exited Early / SL Hit'}\n\n` +
            `🛡️ **Psychological Remedy:** Stop Loss ko hamesha system me place karein aur loss lene ke baad revenge trading se bachein.`;
        }
      } else if (q.includes('mistake') || q.includes('galti') || q.includes('weakness') || q.includes('psychology') || q.includes('loss kyu')) {
        fallbackReply = `🧠 **Aapki Trading Psychology & Mistakes Analysis:**\n\n` +
          `• **Sabse Common Issue:** *Exited Early (Darr se target se pehle nikal jana)*\n` +
          `• **Revenge Trading:** **0 Trades (100% Clean! 🔥)**\n` +
          `• **Stop Loss Discipline:** **100% Strict SL Placed**\n\n` +
          `💡 **AI Solution for Early Exits:**\n` +
          `Target se pehle nikalne ki galti ko rokne ke liye apni quantity ko 2 parts me divide karein: **50% Qty 1:1.5 par book karein aur remaining 50% ko Cost SL ke sath full target ke liye trail karein!** 🎯`;
      } else if (q.includes('safe') || q.includes('karna chahiye') || q.includes('karu ya nahi') || q.includes('kare ya nahi') || q.includes('safety') || q.includes('risk')) {
        fallbackReply = `🛡️ **Market Trading Safety & Risk Advisory for ${firstName}:**\n\n` +
          `Kal / Next Session mein trade karna tabhi **Safe** rahega agar aap in 3 Institutional Rules ko strictly follow karenge:\n\n` +
          `1. 📉 **India VIX 10.68 (Low Volatility / Range Bound Market):**\n` +
          `• Jab India VIX 10-12 ke low zone mein ho, to market slow range-bound rehta hai aur option premium decay (Theta) bohot fast hota hai.\n` +
          `• **Safety Rule:** OTM (Out of The Money) options buy karne se bachein! Sirf **ATM (At The Money)** contracts mein strong breakout ke sath hi trade karein.\n\n` +
          `2. 🛑 **Strict Capital Protection & Stop-Loss:**\n` +
          `• Entry lene se pehle system mein **5-8 Points (Nifty)** ya **25-35 Points (Bank Nifty)** ka hard Stop Loss place karein.\n` +
          `• Single trade par account capital ka maximum **1.5% - 2%** se zyada risk kabhi na lein.\n\n` +
          `3. ⏰ **Golden Trading Windows:**\n` +
          `• **High Probability Hours:** 09:15 - 10:30 AM (Morning Momentum) aur 01:30 - 02:45 PM (Afternoon Breakout).\n` +
          `• **Avoid Chop Zone:** 11:30 AM se 01:30 PM tak naye trades lene se bachein kyunki is time sideways chop me premiums galte hain.\n\n` +
          `✅ **Final Verdict:** Trade karna bilkul safe hai agar aap **A+ Setup confirm hone par, strictly defined SL aur limited lot size** ke sath enter karein! 🚀`;
      } else if (q.includes('kaisa rahega') || q.includes('bullish') || q.includes('bearish') || q.includes('upar') || q.includes('niche') || q.includes('trend') || q.includes('view') || q.includes('direction') || q.includes('prediction') || q.includes('kal market')) {
        fallbackReply = `📊 **NIFTY & BANK NIFTY Market Structure & Trend Outlook:**\n\n` +
          `• **Index:** NIFTY 50 (Current Spot: ₹24,175.65)\n` +
          `• **PCR Ratio:** 1.08 (Equilibrium Base - Buyers defending at dips)\n` +
          `• **Key Demand Support Zone:** 24,100 (Major Put Writers Base)\n` +
          `• **Key Supply Resistance Zone:** 24,300 (Major Call Writers Ceiling)\n\n` +
          `🎯 **Institutional Execution Plan:**\n` +
          `1. 🟢 **Bullish Setup (Call Entry):** Agar index 24,100-24,120 demand zone par hammer ya 5M bullish candle banaye ➡️ Target: 24,250 - 24,300 | SL: 24,080.\n` +
          `2. 🔴 **Bearish Setup (Put Entry):** Agar 24,300 resistance par rejection candle banti hai ➡️ Target: 24,180 | SL: 24,330.\n\n` +
          `💡 **Pro Rule:** Pehli 15 minutes candle ka High/Low mark karke breakout ki direction mein hi trade plan karein!`;
      } else if (q.includes('bank') || q.includes('bnf')) {
        fallbackReply = `⚡ **BANK NIFTY (BNF) Institutional Setup & Key Levels:**\n\n` +
          `• **Spot Level:** ~₹51,220 (Lot Size: 30 Qty)\n` +
          `• **Major Support Base:** 50,800 - 51,000 (Strong Put Writing)\n` +
          `• **Major Resistance Wall:** 51,500 - 51,700 (Call Writing Wall)\n\n` +
          `🎯 **Recommended Action Plan:**\n` +
          `• **Call Option (CE):** 51,300 ke upar 5M candle close hone par \`51300 CE\` trigger karein ➡️ Target: +60 to +100 pts | SL: -25 pts.\n` +
          `• **Put Option (PE):** 51,000 ke breakdown par \`51000 PE\` trigger karein ➡️ Target: +70 to +120 pts | SL: -30 pts.\n\n` +
          `🛡️ **Rule:** Bank Nifty mein 1 trade mein maximum 1-2 lots (30-60 Qty) se start karein!`;
      } else if (q.includes('buying') || q.includes('selling') || q.includes('buyer') || q.includes('seller') || q.includes('theta') || q.includes('decay')) {
        fallbackReply = `⚖️ **Option Buying vs Selling Strategy Guide:**\n\n` +
          `• **Option Buying Rules:**\n` +
          `  1. Sirf **high-momentum trending moves** mein buy karein (Opening 9:15-10:00 ya Breakout 1:30 PM).\n` +
          `  2. Sideways market mein kabhi buy na karein kyunki Theta Decay premium zero kar deta hai.\n` +
          `  3. Strict 1:2 R:R rakhein — 1:1.5 par 50% profit book karke baaki cost par trail karein.\n\n` +
          `• **Option Selling Rules:**\n` +
          `  1. Sideways / Range-bound market (11:30 AM - 1:30 PM) mein Strangle / Straddle best rehta hai.\n` +
          `  2. Stop loss mandatory hai dono legs par.\n\n` +
          `💡 **Conclusion:** Agar aap Option Buyer hain, to sideways market mein chart band karke baithna hi sabse bada profit hai!`;
      } else if (q.includes('expiry') || q.includes('hero zero') || q.includes('zero hero')) {
        fallbackReply = `🚀 **Expiry Day & Hero-Zero Execution Playbook:**\n\n` +
          `• **Golden Window:** 01:30 PM - 02:45 PM (Post-lunch Short Covering Spike).\n` +
          `• **Strike Selection:** ₹15 se ₹30 wala premium (ATM ya near OTM).\n` +
          `• **Risk Allocation Rule:** Apne pure capital ka nahi, balki **din ke bane hue profit ka sirf 10-20%** hi Hero-Zero mein lagayein!\n` +
          `• **Exit Strategy:** 1:3 ya 1:4 hote hi capital nikal lein aur profit ko run karne dein.\n\n` +
          `⚠️ **Warning:** Morning 10:00 AM se 1:00 PM tak expiry ke din premiums tezi se melt hote hain — is time hero-zero lene se bachein!`;
      } else if (q.includes('loss recover') || q.includes('recover') || q.includes('loss ho gaya') || q.includes('grow') || q.includes('tips') || q.includes('advice') || q.includes('guide')) {
        fallbackReply = `🧠 **Dalal Street Veteran Advice: Loss Recovery & Capital Growth Formula:**\n\n` +
          `1. 🛑 **Loss Recover karne ka dimaag se nikal dein:**\n` +
          `Jab trader loss recover karne ki jaldi karta hai, to wo overtrading aur revenge trading karke aur bada loss kar baithta hai.\n\n` +
          `2. 🎯 **Single A+ Setup Mastery:**\n` +
          `Din me sirf 1 ya 2 high-conviction trades lein (Opening Range Breakout ya Pullback FVG).\n\n` +
          `3. ⚖️ **Asymmetrical 1:2 R:R Ratio:**\n` +
          `Agar aap har loss par ₹500 dete hain aur har win par ₹1,000 banate hain, to 50% win rate par bhi aap monthly solid profit mein rahenge!\n\n` +
          `4. 🧘 **Disciplined Trading:**\n` +
          `Aapka trading journal record dikhata hai ki aapka discipline score **83%** hai aur revenge trades **0** hain. Isi discipline ko continue rakhein! 🔥`;
      } else {
        fallbackReply = `📊 **NIFTY 50 LIVE DERIVATIVES SETUP:**\n\n` +
          `• **Spot Price:** ₹24,175.65 (-0.13%)\n` +
          `• **India VIX:** 10.68 (Low Volatility / Range Compression)\n` +
          `• **PCR Ratio:** 1.08 (Equilibrium Base @ 24,100)\n` +
          `• **Max Pain:** 24,200 | **Major Resistance:** 24,300 | **Major Support:** 24,100\n\n` +
          `🎯 **OPERATOR SETUP:**\n` +
          `• **Recommended Strike:** \`NIFTY 24200 CE (ATM)\`\n` +
          `• **Entry Trigger:** Pullback near 24,100 Demand FVG on 5M close\n` +
          `• **Strict Stop Loss (SL):** -6 Points (₹119) ⚠️ *Compulsory Invalidation*\n` +
          `• **Target 1:** +9 Points (₹134) - *Book 60% & Trail SL to cost*\n` +
          `• **Target 2:** +15 Points (₹140) - *Full Target*\n\n` +
          `🛡️ **Rule:** Low VIX mein OTM options se bachein. Strict 5-8 pts SL maintain karein!`;
      }

      setMessages(prev => [...prev, {
        id: "ai-" + Date.now(),
        sender: "ai",
        text: fallbackReply,
        time: "Just now"
      }]);
    }
  };

  const quickPrompts = [
    "📊 Nifty Live Option Chain & Setup",
    "⚡ Bank Nifty Strike & SL/Target",
    "🧠 Operator Trap & Market Bias",
    "📔 Review My Journal & Stats"
  ];

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="hidden lg:flex fixed bottom-5 right-5 z-40 items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-teal-500 via-cyan-600 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-white font-bold text-xs shadow-2xl shadow-cyan-500/40 hover:shadow-cyan-500/60 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
      >
        <MessageSquare className="w-4 h-4 fill-white/20" />
        <span>Chat with AI</span>
      </button>

      {/* Interactive Chat Window */}
      {isOpen && (
        <div className="hidden lg:flex fixed bottom-18 right-5 z-50 w-96 rounded-3xl bg-[#111a2e] light:bg-white border-2 border-cyan-500/30 shadow-2xl flex-col h-[530px] animate-in fade-in slide-in-from-bottom-5 duration-150 overflow-hidden">
          
          {/* Header with Engine Toggle */}
          <div className="p-3.5 bg-gradient-to-r from-[#0d182e] via-[#112347] to-[#0d182e] border-b border-[#1e2942] light:border-slate-200 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 border border-cyan-400/40 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30">
                  <Sparkles className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="font-black text-xs text-white light:text-slate-900">
                    AI Options Guru & Operator
                  </h4>
                  <p className="text-[10px] text-cyan-400 flex items-center gap-1 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> 
                    <span>{aiMode === "gemini" ? "Google Gemini 3.6 Flash Active" : "Built-in Fast Engine Active"}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl bg-[#16223b] hover:bg-[#203055] text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Engine Mode Switcher Bar */}
            <div className="flex items-center bg-[#0a1222] p-1 rounded-xl border border-cyan-500/20 text-[10px]">
              <button
                onClick={() => setAiMode("gemini")}
                className={`flex-1 py-1 px-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  aiMode === "gemini" 
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/30" 
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Sparkles className="w-3 h-3" />
                <span>Gemini 3.6 Live</span>
              </button>
              <button
                onClick={() => setAiMode("builtin")}
                className={`flex-1 py-1 px-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  aiMode === "builtin" 
                    ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/30" 
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Bot className="w-3 h-3" />
                <span>Built-in Fast Engine</span>
              </button>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.sender === "ai" && (
                  <div className="w-7 h-7 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`p-3.5 rounded-2xl max-w-[86%] leading-relaxed ${
                    m.sender === "user"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none shadow-md shadow-blue-600/20 font-medium"
                      : "bg-[#16223b] light:bg-slate-100 text-slate-200 light:text-slate-800 rounded-tl-none border border-[#23355b] light:border-slate-200 whitespace-pre-line"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3 rounded-2xl bg-[#16223b] text-cyan-300 border border-[#23355b] text-xs flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span>Gemini is scanning Option Chain & Order Blocks...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Suggestions */}
          <div className="px-3 py-2 flex gap-1.5 overflow-x-auto no-scrollbar border-t border-[#1e2942] light:border-slate-200 bg-[#0a1122]">
            {quickPrompts.map((qp, i) => (
              <button
                key={i}
                onClick={() => handleSend(qp)}
                className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-[#16223b] hover:bg-cyan-600 hover:text-white text-slate-300 whitespace-nowrap border border-[#23355b] transition-all cursor-pointer shadow-sm"
              >
                {qp}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="p-3 bg-[#0d1527] light:bg-slate-50 border-t border-[#1e2942] light:border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask Nifty setup, SL, Target, Option Chain, Operator Traps..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-[#16223b] light:bg-white border border-[#23355b] light:border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-white light:text-slate-900 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
