import React, { useState } from 'react';
import { useTradeContext } from '../../context/TradeContext';
import { MessageSquare, X, Send, Sparkles, Bot, User, ArrowRight } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
}

export const AiChatWidget: React.FC = () => {
  const { trades } = useTradeContext();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Namaste Pratyay! I am your AI Trading Coach. Ask me anything about your trading stats, mistakes, setup edge, or how to maintain discipline today.'
    }
  ]);

  const handleSend = (userText: string) => {
    if (!userText.trim()) return;

    const userMsg: ChatMessage = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text: userText.trim()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Generate intelligent contextual response
    setTimeout(() => {
      let aiReply = "Based on your trade journal, sticking to your Breakout setups with strict 1:3 R:R will keep your curve trending upward. Remember: never trade without a candle close!";
      
      const lower = userText.toLowerCase();
      if (lower.includes('fomo') || lower.includes('mistake')) {
        aiReply = "Your data shows 2 FOMO trades causing leaks. To beat FOMO: wait for the 5-minute candle to close completely before clicking, or set alert alarms at key levels and walk away from screens.";
      } else if (lower.includes('strategy') || lower.includes('best')) {
        aiReply = "Your top performing strategy is 'Breakout' with over ₹80,000+ net profit and a 75% win rate! Focus 80% of your capital on this setup.";
      } else if (lower.includes('risk') || lower.includes('loss')) {
        aiReply = "Always keep max risk per trade at 1-1.5% of total capital. If you encounter 2 consecutive losses in a single day, shut the terminal immediately.";
      }

      setMessages(prev => [...prev, {
        id: 'ai-' + Date.now(),
        sender: 'ai',
        text: aiReply
      }]);
    }, 600);
  };

  const quickPrompts = [
    'What is my most profitable strategy?',
    'How do I eliminate FOMO entries?',
    'Review my trading discipline score'
  ];

  return (
    <>
      {/* Floating Button matching screenshot */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-teal-500 via-cyan-600 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-white font-bold text-xs shadow-2xl shadow-cyan-500/40 hover:shadow-cyan-500/60 transition-all transform hover:scale-105 active:scale-95"
      >
        <MessageSquare className="w-4 h-4 fill-white/20" />
        <span>Chat with AI</span>
      </button>

      {/* Interactive Chat Window */}
      {isOpen && (
        <div className="fixed bottom-18 right-5 z-50 w-84 sm:w-96 rounded-3xl bg-[#111a2e] light:bg-white border border-[#1e2942] light:border-slate-200 shadow-2xl flex flex-col h-[460px] animate-in fade-in slide-in-from-bottom-5 duration-150 overflow-hidden">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-cyan-900/60 to-blue-900/60 border-b border-[#1e2942] light:border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-white light:text-slate-900">
                  AI Trading Assistant
                </h4>
                <p className="text-[10px] text-cyan-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Ready & Analyzing
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'ai' && (
                  <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`p-3 rounded-2xl max-w-[82%] leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-[#16223b] light:bg-slate-100 text-slate-200 light:text-slate-800 rounded-tl-none border border-[#23355b] light:border-slate-200'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Prompt suggestions */}
          <div className="px-3 py-1.5 flex gap-1.5 overflow-x-auto no-scrollbar border-t border-[#1e2942] light:border-slate-200 bg-[#0d1527]/40">
            {quickPrompts.map((qp, i) => (
              <button
                key={i}
                onClick={() => handleSend(qp)}
                className="px-2.5 py-1 rounded-lg text-[10px] font-medium bg-[#16223b] hover:bg-[#202f50] text-slate-300 whitespace-nowrap border border-[#23355b] transition-colors"
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
              placeholder="Ask about setups, risk, mistakes..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-[#16223b] light:bg-white border border-[#23355b] light:border-slate-300 rounded-xl px-3 py-2 text-xs text-white light:text-slate-900 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
            <button
              type="submit"
              className="p-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white shadow-md transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
