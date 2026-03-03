import { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAI } from '../../hooks/useAI';
import { X, Send, Bot, User, Loader2 } from 'lucide-react';

const viewContextPrompts = {
  dashboard: 'Du hilfst bei der Übersicht über das Kreditportfolio und offene Anträge.',
  application: 'Du hilfst bei der Erfassung und Voranalyse von Kreditanträgen.',
  kyc: 'Du hilfst bei KYC-Prüfungen, UBO-Ermittlung, PEP-Screening und Sanktionslistenprüfungen gemäß GwG.',
  analysis: 'Du hilfst bei der §18 KWG Prüfung, Bilanzanalyse, BWA-Auswertung und Kapitaldienstfähigkeitsberechnung.',
  rating: 'Du hilfst bei der Erstellung und Bewertung von Kreditratings (quantitativ, qualitativ, Eigentümer, Kontoführung).',
  collateral: 'Du hilfst bei der Bewertung von Kreditsicherheiten, Haircut-Berechnung und Blankoanteil-Ermittlung.',
  decision: 'Du hilfst bei der Kreditentscheidung, Konditionenberechnung, Votierung und dem Genehmigungsworkflow.',
  monitoring: 'Du hilfst beim Kreditmonitoring, Frühwarnindikatoren, Rating-Migration und Watchlist-Management.',
};

export default function AIChatPanel() {
  const { state, dispatch, getSelectedCompany } = useApp();
  const { sendChatMessage, loading } = useAI();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const company = getSelectedCompany();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.aiMessages]);

  useEffect(() => {
    if (state.aiPanelOpen) inputRef.current?.focus();
  }, [state.aiPanelOpen]);

  if (!state.aiPanelOpen) return null;

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const message = input.trim();
    setInput('');

    const contextInfo = company
      ? `Aktueller Kontext: ${company.firma} (${company.branche}), Kreditantrag über ${company.kredit?.betrag?.toLocaleString('de-DE')} € für ${company.kredit?.verwendung}.`
      : 'Es ist kein spezifischer Kreditantrag ausgewählt.';

    const systemPrompt = `Du bist ein erfahrener Kreditanalyst bei einer deutschen Bank (Sparkasse/Genossenschaftsbank). ${viewContextPrompts[state.currentView] || ''} ${contextInfo} Antworte auf Deutsch, professionell und präzise. Verwende bankübliche Fachbegriffe. Beziehe dich auf regulatorische Anforderungen (MaRisk, KWG, CRR, GwG) wo relevant.`;

    await sendChatMessage(systemPrompt, message);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-96 bg-white border-l border-border flex flex-col h-full shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <Bot size={18} className="text-primary" />
          <span className="text-sm font-semibold font-headline">KI-Assistent</span>
        </div>
        <button
          onClick={() => dispatch({ type: 'SET_AI_PANEL', open: false })}
          className="p-1 text-text-muted hover:text-text-primary transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {state.aiMessages.length === 0 && (
          <div className="text-center text-text-muted text-sm py-8">
            <Bot size={32} className="mx-auto mb-3 opacity-30" />
            <p>Stellen Sie eine Frage zum aktuellen Bereich.</p>
            <div className="mt-4 space-y-2">
              {['Wie bewertest du die Eigenkapitalquote?', 'Welche Risiken siehst du?', 'Erstelle eine Zusammenfassung.'].map((q) => (
                <button
                  key={q}
                  onClick={() => { setInput(q); inputRef.current?.focus(); }}
                  className="block w-full text-left px-3 py-2 text-xs bg-surface rounded-lg hover:bg-border transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        {state.aiMessages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0 mt-1">
                <Bot size={12} className="text-white" />
              </div>
            )}
            <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
              msg.role === 'user'
                ? 'bg-primary text-white'
                : 'bg-surface text-text-primary'
            }`}>
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
            {msg.role === 'user' && (
              <div className="w-6 h-6 rounded-full bg-text-secondary flex items-center justify-center shrink-0 mt-1">
                <User size={12} className="text-white" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-2">
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
              <Bot size={12} className="text-white" />
            </div>
            <div className="bg-surface rounded-lg px-3 py-2">
              <Loader2 size={16} className="animate-spin text-text-muted" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Frage stellen..."
            rows={1}
            className="flex-1 px-3 py-2 border border-border rounded-lg text-sm resize-none focus:outline-none focus:border-primary-light focus:ring-2 focus:ring-primary-light/10"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
