import { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, Send, X, ChevronRight } from 'lucide-react';
import { CHAT_SUGGESTIONS, CHAT_RESPONSES } from '../data';

export default function Chatbot({ onOpenWorkflow }) {
  const [open, setOpen] = useState(true);
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const bodyRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  const sendMessage = useCallback((text) => {
    const msg = text || inputVal.trim();
    if (!msg) return;
    setInputVal('');

    // Add user message
    setMessages(prev => [...prev, { role: 'user', text: msg }]);

    // Add thinking indicator
    setMessages(prev => [...prev, { role: 'assistant', thinking: true }]);

    const delay = 1200 + Math.random() * 800;
    setTimeout(() => {
      // Find matching response
      const lowerMsg = msg.toLowerCase();
      let response = null;
      for (const key of Object.keys(CHAT_RESPONSES)) {
        if (lowerMsg.includes(key)) {
          response = CHAT_RESPONSES[key];
          break;
        }
      }
      if (!response) {
        response = {
          text: 'I can help you with portfolio management queries. Try asking about trade required portfolios, draft orders, portfolios needing attention, or cash drift summary.',
          table: null,
        };
      }

      setMessages(prev => {
        const next = [...prev];
        next[next.length - 1] = { role: 'assistant', response };
        return next;
      });
    }, delay);
  }, [inputVal]);

  // SOD chat entry point
  const openSodChat = useCallback((portfolio, changeReason, portfolioId) => {
    setOpen(true);
    const userMsg = `Analyze SOD break for ${portfolio} (${portfolioId}) - ${changeReason}`;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setMessages(prev => [...prev, { role: 'assistant', thinking: true }]);

    setTimeout(() => {
      const response = CHAT_RESPONSES[`sod:${portfolioId}`] || {
        text: `SOD Break Analysis for ${portfolio} (${portfolioId}):`,
        table: [{ reason: changeReason, status: 'Under Investigation', action: 'Pending Review' }],
        followUp: 'Suggested actions: "mark as change reason A" or "mark as change reason B".',
      };

      const enriched = {
        ...response,
        sodActions: [
          { label: 'Mark as Change Reason A', msg: `mark as change reason A for ${portfolioId}` },
          { label: 'Mark as Change Reason B', msg: `mark as change reason B for ${portfolioId}` },
        ],
      };

      setMessages(prev => {
        const next = [...prev];
        next[next.length - 1] = { role: 'assistant', response: enriched };
        return next;
      });
    }, 1400);
  }, []);

  // Expose method for parent
  useEffect(() => {
    window.__amOpenSodChat = openSodChat;
    return () => { delete window.__amOpenSodChat; };
  }, [openSodChat]);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-[9000] flex items-center gap-2.5 px-5 py-3 bg-[#2d5016] text-white rounded-3xl text-base font-medium cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 hover:shadow-[0_6px_24px_rgba(0,0,0,0.2)] transition-all">
        <Bot size={16} className="text-[#86BC25]" /> How can I help?
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-[9001] w-[400px] h-[500px] bg-white border border-slate-200 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 bg-[#2d5016] text-white shrink-0">
        <div className="flex items-center gap-2 text-base font-semibold">
          <Bot size={16} className="text-[#86BC25]" /> Active Equities Agent
        </div>
        <button onClick={() => setOpen(false)} className="w-7 h-7 flex items-center justify-center bg-white/10 rounded-md text-white hover:bg-white/20 transition-colors">
          <X size={14} />
        </button>
      </div>

      {/* Body */}
      <div ref={bodyRef} className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 && (
          <>
            <div className="text-center py-8 text-slate-500 text-lg">How can I help you today?</div>
            <div className="flex flex-col gap-2 py-2">
              {CHAT_SUGGESTIONS.map((s, i) => (
                <button key={i} onClick={() => sendMessage(s)}
                  className="px-4 py-3 bg-slate-100 border border-slate-200 rounded-[10px] text-[15px] text-slate-800 text-left cursor-pointer hover:bg-slate-200 hover:border-slate-300 transition-all">
                  {s}
                </button>
              ))}
            </div>
          </>
        )}

        {messages.map((msg, i) => {
          if (msg.role === 'user') {
            return (
              <div key={i} className="flex justify-end mb-3 animate-fade-in">
                <div className="bg-[#2d5016] text-white rounded-xl rounded-br-sm px-4 py-3 text-[15px] leading-relaxed max-w-[80%]">{msg.text}</div>
              </div>
            );
          }

          if (msg.thinking) {
            return (
              <div key={i} className="flex gap-2 mb-3 animate-fade-in">
                <div className="w-7 h-7 rounded-full bg-[#2d5016] flex items-center justify-center text-[#86BC25] shrink-0"><Bot size={12} /></div>
                <div className="flex items-center gap-1 px-5 py-3.5">
                  {[0, 1, 2].map(j => (
                    <div key={j} className="w-2 h-2 bg-[#86BC25] rounded-full" style={{ animation: `thinkingDot 1.4s ease-in-out infinite`, animationDelay: `${j * 0.2}s` }} />
                  ))}
                  <span className="text-base text-slate-400 ml-2 italic">Thinking...</span>
                </div>
              </div>
            );
          }

          const resp = msg.response;
          return (
            <div key={i} className="flex gap-2 mb-3 animate-fade-in">
              <div className="w-7 h-7 rounded-full bg-[#2d5016] flex items-center justify-center text-[#86BC25] shrink-0"><Bot size={12} /></div>
              <div className="bg-slate-100 rounded-xl rounded-bl-sm px-4 py-3 text-[15px] leading-relaxed max-w-[85%]">
                <p className="mb-2">{resp.text}</p>
                {resp.table && resp.table.length > 0 && (
                  <table className="w-full border-collapse mt-2 text-base">
                    <thead>
                      <tr>
                        {Object.keys(resp.table[0]).map(k => (
                          <th key={k} className="px-2.5 py-2 text-left font-semibold text-slate-500 border-b border-slate-200 uppercase tracking-wide text-[13px]">{k}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {resp.table.map((row, ri) => (
                        <tr key={ri}>
                          {Object.values(row).map((v, ci) => (
                            <td key={ci} className="px-2.5 py-2 border-b border-slate-100 text-slate-800">{v}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {resp.followUp && <p className="text-base text-slate-500 italic mt-2">{resp.followUp}</p>}
                {resp.actions && resp.actions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {resp.actions.map((a, ai) => (
                      <button key={ai} onClick={() => onOpenWorkflow(a.wfId)}
                        className="inline-flex items-center gap-1 text-[13px] px-2.5 py-1.5 bg-green-50 border border-[#86BC25] text-[#2d5016] rounded-md cursor-pointer hover:bg-[#86BC25] hover:text-white transition-all">
                        <ChevronRight size={10} /> {a.label}
                      </button>
                    ))}
                  </div>
                )}
                {resp.sodActions && (
                  <div className="flex flex-wrap gap-2 mt-2.5">
                    {resp.sodActions.map((a, ai) => (
                      <button key={ai} onClick={() => sendMessage(a.msg)}
                        className="px-3.5 py-1.5 bg-green-50 border border-green-200 rounded-lg text-green-800 text-base font-medium cursor-pointer hover:bg-green-100 transition-all">
                        {a.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="flex gap-2 px-4 py-3 border-t border-slate-200 bg-white shrink-0">
        <input
          type="text"
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
          placeholder="Ask me about portfolios, cashflows, or workflows..."
          className="flex-1 px-4 py-3 border border-slate-200 rounded-[10px] text-[15px] text-slate-800 bg-slate-50 outline-none focus:border-blue-500 focus:bg-white transition-colors placeholder:text-slate-400"
        />
        <button onClick={() => sendMessage()}
          className="w-10 h-10 flex items-center justify-center bg-[#2d5016] text-white rounded-[10px] hover:bg-[#3d6b1e] transition-colors shrink-0">
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
