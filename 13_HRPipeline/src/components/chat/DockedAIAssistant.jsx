import { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, User, X, Send, MessageCircle, Sparkles } from 'lucide-react';
import { useInstitut } from '../../hooks/useInstitut';
import { formatAssistantHtml } from './assistantFormatter';
import { getAssistantResponses, getStarterQuestions, getWelcome } from './assistantResponses';

export default function DockedAIAssistant({ mode, open, onOpenChange, triggerAction }) {
  const { institut } = useInstitut();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  const welcome = getWelcome(mode, institut.mode);
  const starters = getStarterQuestions(mode, institut.mode);
  const responses = getAssistantResponses(mode, institut.mode);

  useEffect(() => { setMessages([]); }, [mode, institut.mode]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, typing]);
  useEffect(() => { if (open) inputRef.current?.focus(); }, [open]);

  const send = useCallback((raw) => {
    const text = (raw || '').trim();
    if (!text || typing) return;
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      const key = Object.keys(responses).find(k => text.toLowerCase().includes(k.toLowerCase())) || '__fallback__';
      const answer = responses[key] || responses.__fallback__;
      setMessages(prev => [...prev, { role: 'assistant', content: answer }]);
      setTyping(false);
    }, 700 + Math.random() * 500);
  }, [responses, typing]);

  useEffect(() => {
    if (!triggerAction?.prompt) return;
    onOpenChange?.(true);
    send(triggerAction.prompt);
  }, [triggerAction?.ts]); // eslint-disable-line

  if (!open) {
    return (
      <button className="hp-ai-toggle" onClick={() => onOpenChange?.(true)} title="KI-Assistent">
        <MessageCircle size={22} />
      </button>
    );
  }

  const hasReply = messages.some(m => m.role === 'assistant');
  const panelClass = `hp-ai-panel ${hasReply ? 'wide' : ''}`;
  const showSuggestions = messages.length === 0 || (messages[messages.length - 1]?.role === 'assistant' && !typing);

  return (
    <aside className={panelClass} aria-label="KI-Assistent">
      <header className="hp-ai-header">
        <div className="hp-ai-header-title"><Bot size={20} /><span>KI-Assistent</span></div>
        <button className="hp-ai-close" onClick={() => onOpenChange?.(false)}><X size={18} /></button>
      </header>
      <div className="hp-ai-messages">
        {messages.length === 0 && <div className="hp-ai-welcome">{welcome}</div>}
        {messages.map((m, i) => (
          <div key={i} className={`hp-ai-row ${m.role}`}>
            {m.role === 'assistant' && <div className="hp-ai-avatar bot"><Bot size={16} /></div>}
            {m.role === 'assistant' ? (
              <div className="hp-ai-bubble bot" dangerouslySetInnerHTML={{ __html: formatAssistantHtml(m.content) }} />
            ) : (
              <div className="hp-ai-bubble user">{m.content}</div>
            )}
            {m.role === 'user' && <div className="hp-ai-avatar user"><User size={16} /></div>}
          </div>
        ))}
        {typing && (
          <div className="hp-ai-row assistant">
            <div className="hp-ai-avatar bot"><Bot size={16} /></div>
            <div className="hp-ai-bubble bot typing"><span /><span /><span /></div>
          </div>
        )}
        {showSuggestions && starters.length > 0 && (
          <div className="hp-ai-suggestions">
            {starters.map(q => (
              <button key={q} className="hp-ai-suggestion" onClick={() => send(q)}>
                <Sparkles size={13} />{q}
              </button>
            ))}
          </div>
        )}
        <div ref={endRef} />
      </div>
      <form className="hp-ai-input" onSubmit={e => { e.preventDefault(); send(input); }}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); } }}
          placeholder="Frage stellen..."
          rows={1}
        />
        <button type="submit" disabled={!input.trim() || typing} aria-label="Senden"><Send size={16} /></button>
      </form>
    </aside>
  );
}
