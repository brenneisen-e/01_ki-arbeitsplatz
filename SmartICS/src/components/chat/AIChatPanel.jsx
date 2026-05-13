import { useState, useEffect, useRef } from 'react';
import { X, Send, Bot, User, Loader2, Download, Sparkles, MessageSquare } from 'lucide-react';
import { useSmartIcs } from '../../hooks/useSmartIcs';
import { formatMessageHtml } from './messageFormatter';
import { STEP_SUGGESTIONS, STEP_LABELS, buildDefaultResponse } from './assistantResponses';

export default function AIChatPanel({ activeView }) {
  const {
    aiPanelOpen, setAiPanelOpen,
    aiMessages, addAiMessage, clearChat,
    step, session,
  } = useSmartIcs();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  const contextKey = activeView === 'rkm' ? 'rkm' : activeView === 'methodik' ? 'methodik' : step;

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [aiMessages, loading]);
  useEffect(() => { if (aiPanelOpen) setTimeout(() => inputRef.current?.focus(), 60); }, [aiPanelOpen]);

  if (!aiPanelOpen) return null;

  const suggestions = STEP_SUGGESTIONS[contextKey] || STEP_SUGGESTIONS[0];

  const handleSend = (overrideMessage) => {
    const message = (overrideMessage || input).trim();
    if (!message || loading) return;
    setInput('');
    addAiMessage({ role: 'user', content: message, at: Date.now() });
    setLoading(true);
    // Simuliere Latenz
    const latency = 350 + Math.random() * 700;
    setTimeout(() => {
      const reply = buildDefaultResponse({ question: message, step: contextKey, session });
      addAiMessage({ role: 'assistant', content: reply, at: Date.now() });
      setLoading(false);
    }, latency);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleExport = (content) => {
    const date = new Date().toLocaleDateString('de-DE');
    const html = `<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8" /><title>Smart ICS – KI-Antwort</title>
<style>
  body { font-family: 'DM Sans', system-ui, sans-serif; max-width: 720px; margin: 40px auto; padding: 24px; color: #0F172A; line-height: 1.6; }
  h1 { font-size: 20px; color: #0F4D2A; border-bottom: 2px solid #86BC25; padding-bottom: 8px; }
  .meta { font-size: 12px; color: #64748B; margin-bottom: 24px; }
  pre { font-family: inherit; white-space: pre-wrap; font-size: 14px; }
  .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94A3B8; }
</style></head><body>
<h1>Smart ICS – KI-Antwort</h1>
<div class="meta">Erstellt am ${date} · Kontext: ${STEP_LABELS[contextKey] || ''}</div>
<pre>${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
<div class="footer">Generiert durch Smart ICS · vertraulich</div>
</body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const w = window.open(url, '_blank');
    if (w) w.addEventListener('load', () => w.print());
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  };

  const hasMessages = aiMessages.length > 0;
  const hasAssistantReply = aiMessages.some(m => m.role === 'assistant');
  const panelWidth = hasAssistantReply ? 'w-[640px]' : 'w-[440px]';

  const SuggestionChips = ({ intro }) => (
    <div className={intro ? 'text-center text-slate-500 text-sm py-6' : 'py-2'}>
      {intro && (
        <>
          <div className="mx-auto mb-3 w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'color-mix(in srgb, var(--mode-primary, #0F4D2A) 12%, white)', color: 'var(--mode-primary, #0F4D2A)' }}>
            <Bot size={22} />
          </div>
          <p className="mb-1">
            Ich bin im Kontext <strong className="text-slate-700">{STEP_LABELS[contextKey]}</strong>{session ? <> · {session.name}</> : ''}.
          </p>
          <p className="text-xs text-slate-400 mb-4">Hier sind passende Fragen:</p>
        </>
      )}
      <div className={intro ? 'space-y-2' : 'flex flex-wrap gap-2'}>
        {suggestions.map(q => (
          <button
            key={q}
            onClick={() => handleSend(q)}
            className={intro
              ? 'flex items-center gap-2 w-full text-left px-3.5 py-2.5 text-sm rounded-lg border font-medium transition-colors'
              : 'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors text-left leading-snug'}
            style={{
              background: 'color-mix(in srgb, var(--mode-primary, #0F4D2A) 6%, white)',
              borderColor: 'color-mix(in srgb, var(--mode-primary, #0F4D2A) 25%, transparent)',
              color: 'var(--mode-primary, #0F4D2A)',
            }}
          >
            <Sparkles size={13} className="shrink-0" />
            {q}
          </button>
        ))}
      </div>
    </div>
  );

  const showFollowUp = hasAssistantReply && !loading;

  return (
    <div className={`${panelWidth} bg-white border-l border-slate-200 flex flex-col h-full shrink-0 transition-[width] duration-200`}>
      <div className="border-b border-slate-200 shrink-0">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--mode-gradient, linear-gradient(135deg,#0F4D2A,#1D7B3F))' }}>
              <Bot size={16} className="text-white" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold">Smart-ICS KI-Assistent</div>
              <div className="text-[11px] text-slate-500">{STEP_LABELS[contextKey]}</div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {hasMessages && (
              <button
                onClick={clearChat}
                className="text-[11px] px-2 py-1 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title="Verlauf löschen"
              >
                Verlauf leeren
              </button>
            )}
            <button
              onClick={() => setAiPanelOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
              title="Schließen"
            >
              <X size={16} />
            </button>
          </div>
        </div>
        <div className="px-4 pb-2.5 flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse-soft" />
          <span className="text-[11px] text-slate-500">
            Kontext: <span className="font-semibold text-slate-700">{STEP_LABELS[contextKey]}</span>
            {session && <span> · {session.name}</span>}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {!hasMessages && <SuggestionChips intro />}
        {aiMessages.map((m, i) => (
          <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : ''}`}>
            {m.role === 'assistant' && (
              <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1" style={{ background: 'var(--mode-primary, #0F4D2A)' }}>
                <Bot size={12} className="text-white" />
              </div>
            )}
            <div className={`${m.role === 'user' ? 'max-w-[85%]' : 'max-w-[95%] flex-1'} rounded-lg px-3 py-2 text-sm`}
              style={m.role === 'user' ? { background: 'var(--mode-primary, #0F4D2A)', color: 'white' } : { background: '#F7FAF7', color: '#0F172A' }}
            >
              {m.role === 'assistant' ? (
                <div className="ai-message-content" dangerouslySetInnerHTML={{ __html: formatMessageHtml(m.content) }} />
              ) : (
                <div className="whitespace-pre-wrap">{m.content}</div>
              )}
              {m.role === 'assistant' && (
                <button
                  onClick={() => handleExport(m.content)}
                  className="mt-2 inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-emerald-700 transition-colors"
                  title="Antwort als PDF speichern"
                >
                  <Download size={12} />
                  PDF Export
                </button>
              )}
            </div>
            {m.role === 'user' && (
              <div className="w-6 h-6 rounded-full bg-slate-500 flex items-center justify-center shrink-0 mt-1">
                <User size={12} className="text-white" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-2">
            <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ background: 'var(--mode-primary, #0F4D2A)' }}>
              <Bot size={12} className="text-white" />
            </div>
            <div className="bg-slate-50 rounded-lg px-3 py-2"><Loader2 size={16} className="animate-spin text-slate-400" /></div>
          </div>
        )}
        {showFollowUp && <SuggestionChips />}
        <div ref={endRef} />
      </div>

      <div className="p-3 border-t border-slate-200">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Frage stellen..."
            rows={1}
            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm resize-none focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="px-3 py-2 rounded-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'var(--mode-primary, #0F4D2A)' }}
          >
            <Send size={16} />
          </button>
        </div>
        <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
          <MessageSquare size={10} />
          Demo-Modus · Antworten aus lokalem Wissens-Repository
        </p>
      </div>
    </div>
  );
}
