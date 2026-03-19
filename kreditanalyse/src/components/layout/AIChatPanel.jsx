import { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAI } from '../../hooks/useAI';
import { X, Send, Bot, User, Loader2, Download } from 'lucide-react';

const viewContextPrompts = {
  dashboard: 'Du hilfst bei der Übersicht über das Kreditportfolio und offene Anträge.',
  application: 'Du hilfst bei der Erfassung und Voranalyse von Kreditanträgen.',
  kyc: 'Du hilfst bei KYC-Prüfungen, UBO-Ermittlung, PEP-Screening und Sanktionslistenprüfungen gemäß GwG.',
  analysis: 'Du hilfst bei der §18 KWG Prüfung, Bilanzanalyse, BWA-Auswertung und Kapitaldienstfähigkeitsberechnung.',
  rating: 'Du hilfst bei der Erstellung und Bewertung von Kreditratings (quantitativ, qualitativ, Eigentümer, Kontoführung).',
  collateral: 'Du hilfst bei der Bewertung von Kreditsicherheiten, Haircut-Berechnung und Blankoanteil-Ermittlung.',
  'credit-proposal': 'Du hilfst bei der Erstellung der Kreditempfehlung, Zusammenfassung der Analyseergebnisse und Konditionierung.',
  decision: 'Du hilfst bei der Kreditentscheidung, Konditionenberechnung, Votierung und dem Genehmigungsworkflow.',
  contract: 'Du hilfst bei der Kreditvertragserstellung, Vertragsklauseln und LMA-Standardverträgen.',
  monitoring: 'Du hilfst beim Kreditmonitoring, Frühwarnindikatoren, Rating-Migration und Watchlist-Management.',
};

const viewSuggestedQuestions = {
  dashboard: [
    'Welche Anträge haben höchste Priorität?',
    'Gibt es überfällige Vorgänge?',
    'Wie ist die aktuelle Pipeline-Verteilung?',
  ],
  application: [
    'Sind alle Pflichtunterlagen eingereicht?',
    'Was fehlt noch für die Antragsvollständigkeit?',
    'Wie ist die Kredithistorie mit diesem Kunden?',
  ],
  kyc: [
    'Gibt es Auffälligkeiten bei der KYC-Prüfung?',
    'Wer sind die wirtschaftlich Berechtigten (UBOs)?',
    'Liegen PEP- oder Sanktionstreffer vor?',
  ],
  analysis: [
    'Wie bewertest du die Bilanz im Dreijahresvergleich?',
    'Ist die Kapitaldienstfähigkeit gegeben?',
    'Welche Kennzahlen weichen von Branchenwerten ab?',
  ],
  rating: [
    'Wie setzt sich das Rating zusammen?',
    'Welche Faktoren treiben das Rating nach oben/unten?',
    'Wie hat sich das Rating im Zeitverlauf entwickelt?',
  ],
  collateral: [
    'Reichen die Sicherheiten zur Deckung aus?',
    'Wie hoch ist der Blankoanteil?',
    'Welche zusätzlichen Sicherheiten wären sinnvoll?',
  ],
  'credit-proposal': [
    'Erstelle eine Zusammenfassung der Kreditempfehlung.',
    'Welche Auflagen sollten vereinbart werden?',
    'Welche Risiken sollten im Votum angesprochen werden?',
  ],
  decision: [
    'Wie bewertest du das Gesamtrisiko des Engagements?',
    'Ist die vorgeschlagene Konditionierung marktgerecht?',
    'Welche Auflagen empfiehlst du für die Genehmigung?',
  ],
  contract: [
    'Welche Vertragsklauseln sind besonders wichtig?',
    'Gibt es regulatorische Anforderungen an den Vertrag?',
    'Welche Financial Covenants sollten aufgenommen werden?',
  ],
  monitoring: [
    'Gibt es aktuelle Frühwarnindikatoren?',
    'Wie hat sich das Rating seit Bewilligung verändert?',
    'Welche Covenants sollten überprüft werden?',
  ],
};

const viewLabels = {
  dashboard: 'Dashboard',
  application: 'Kreditantrag',
  kyc: 'KYC & Compliance',
  analysis: '§18 KWG Prüfung',
  rating: 'Rating',
  collateral: 'Sicherheiten',
  'credit-proposal': 'Kreditempfehlung',
  decision: 'Kreditentscheidung',
  contract: 'Kreditvertrag',
  monitoring: 'Monitoring',
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

  const handleExportPdf = (content) => {
    const companyName = company?.firma || 'Kreditanalyse';
    const date = new Date().toLocaleDateString('de-DE');
    const html = `<!DOCTYPE html>
<html lang="de"><head><meta charset="UTF-8"/>
<title>KI-Analyse – ${companyName}</title>
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; max-width: 700px; margin: 40px auto; padding: 20px; color: #1a1a2e; line-height: 1.6; }
  h1 { font-size: 18px; color: #1B2B4B; border-bottom: 2px solid #00875A; padding-bottom: 8px; }
  .meta { font-size: 12px; color: #64748B; margin-bottom: 24px; }
  .content { font-size: 14px; white-space: pre-wrap; }
  .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94A3B8; }
  @media print { body { margin: 20px; } }
</style></head><body>
<h1>KI-Kreditanalyse – Zusammenfassung</h1>
<div class="meta">${companyName} · Erstellt am ${date}</div>
<div class="content">${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
<div class="footer">Generiert durch KI-Kreditanalyse-Modul · Vertraulich</div>
</body></html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (win) {
      win.addEventListener('load', () => {
        win.print();
      });
    }
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  };

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
      <div className="border-b border-border shrink-0">
        <div className="flex items-center justify-between px-4 h-14">
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
        {/* Current context indicator */}
        <div className="px-4 pb-2.5 flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-[11px] text-text-muted font-body">
            Kontext: <span className="font-semibold text-text-secondary">{viewLabels[state.currentView] || state.currentView}</span>
            {company && <span className="text-text-muted"> · {company.firma}</span>}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {state.aiMessages.length === 0 && (
          <div className="text-center text-text-muted text-sm py-6">
            <Bot size={32} className="mx-auto mb-3 opacity-30" />
            <p className="mb-1">Ich bin im Bereich <strong className="text-text-secondary">{viewLabels[state.currentView] || state.currentView}</strong>.</p>
            <p className="text-xs text-text-muted mb-4">Hier sind passende Fragen:</p>
            <div className="space-y-2">
              {(viewSuggestedQuestions[state.currentView] || viewSuggestedQuestions.dashboard).map((q) => (
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
              {msg.role === 'assistant' && (
                <button
                  onClick={() => handleExportPdf(msg.content)}
                  className="mt-2 inline-flex items-center gap-1 text-[11px] text-text-muted hover:text-primary transition-colors"
                  title="Als PDF exportieren"
                >
                  <Download size={12} />
                  PDF Export
                </button>
              )}
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
