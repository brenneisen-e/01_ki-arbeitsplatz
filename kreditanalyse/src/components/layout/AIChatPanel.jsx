import { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAI } from '../../hooks/useAI';
import { X, Send, Bot, User, Loader2, Download, Sparkles } from 'lucide-react';

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
    'Woher stammen die zugrundeliegenden Daten?',
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

/**
 * Rich formatter for KI-Assistent replies.
 *
 * Erkennt:
 *  - **bold** / *italic*
 *  - Nummerierte Abschnitte ("1. Titel")   → Sub-Headings
 *  - Bereichsüberschriften ("Wichtige Punkte:", "Empfehlung:", ...)
 *  - Quellen-Block (startet mit "Quellen:") → eigenständige Karte
 *  - Bullet-Listen mit - / • / *
 *  - "Label: Wert"-Zeilen innerhalb von Listen (Label bold)
 *  - Hinweis-Tokens (Hohe Risiken, Mittlere Risiken, Geringe Risiken)
 */
function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Inline bar-chart: [chart: Jan=12 Feb=15 Mär=18] or with colors [chart|accent: ...]
function renderInlineBarChart(data) {
  const values = data.map(d => d.value);
  const max = Math.max(...values, 1);
  const W = 320;
  const H = 120;
  const padLeft = 26;
  const padBottom = 20;
  const padTop = 6;
  const barArea = W - padLeft - 6;
  const barSlot = barArea / data.length;
  const barW = barSlot * 0.68;
  const barGap = barSlot * 0.32;
  const chartH = H - padBottom - padTop;

  let bars = '';
  data.forEach((d, i) => {
    const h = Math.max(2, (d.value / max) * chartH);
    const x = padLeft + i * barSlot + barGap / 2;
    const y = H - padBottom - h;
    bars += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barW.toFixed(1)}" height="${h.toFixed(1)}" rx="2" fill="url(#ai-bar-grad)" />`;
    bars += `<text x="${(x + barW / 2).toFixed(1)}" y="${(H - padBottom + 12).toFixed(1)}" text-anchor="middle" font-size="9" fill="#64748B" font-family="IBM Plex Mono">${escapeHtml(d.label)}</text>`;
    bars += `<text x="${(x + barW / 2).toFixed(1)}" y="${(y - 3).toFixed(1)}" text-anchor="middle" font-size="9" fill="#1B2B4B" font-family="IBM Plex Mono" font-weight="600">${escapeHtml(String(d.value))}</text>`;
  });

  return `<div class="ai-chart">
    <svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}">
      <defs>
        <linearGradient id="ai-bar-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#2D4A7A" stop-opacity="0.95" />
          <stop offset="100%" stop-color="#2D4A7A" stop-opacity="0.55" />
        </linearGradient>
      </defs>
      <line x1="${padLeft}" y1="${H - padBottom}" x2="${W - 6}" y2="${H - padBottom}" stroke="#CBD5E1" stroke-width="1"/>
      ${bars}
    </svg>
  </div>`;
}

function parseChartLine(raw) {
  // Format: [chart: Label=Val Label=Val ...]
  const m = raw.match(/^\s*\[chart:\s*(.+?)\s*\]\s*$/i);
  if (!m) return null;
  const pairs = m[1].split(/\s+/).filter(Boolean);
  const data = [];
  for (const p of pairs) {
    const [label, val] = p.split('=');
    const num = parseFloat(val);
    if (label && isFinite(num)) data.push({ label, value: num });
  }
  return data.length ? data : null;
}

// Parses a markdown table block. Returns HTML table or null.
function parseMarkdownTable(lines) {
  if (lines.length < 2) return null;
  const header = lines[0].trim();
  const sep = lines[1].trim();
  if (!header.startsWith('|') || !/^\|[\s:\-|]+\|$/.test(sep)) return null;

  const splitRow = (l) => l.replace(/^\||\|$/g, '').split('|').map(c => c.trim());
  const headers = splitRow(header);
  const rows = lines.slice(2).filter(l => l.trim().startsWith('|')).map(splitRow);

  let html = '<div class="ai-table-wrap"><table class="ai-table"><thead><tr>';
  html += headers.map(h => `<th>${escapeHtml(h).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')}</th>`).join('');
  html += '</tr></thead><tbody>';
  for (const r of rows) {
    html += '<tr>' + r.map(c => `<td>${escapeHtml(c).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')}</td>`).join('') + '</tr>';
  }
  html += '</tbody></table></div>';
  return html;
}

function formatBlock(lines) {
  // Turn consecutive bullets into <ul>, otherwise <p>
  let html = '';
  let listBuffer = [];
  const flushList = () => {
    if (listBuffer.length) {
      html += `<ul class="ai-list">${listBuffer.map(l => `<li>${l}</li>`).join('')}</ul>`;
      listBuffer = [];
    }
  };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    const bullet = line.match(/^[\-•*]\s+(.+)$/);
    if (bullet) {
      let item = escapeHtml(bullet[1]);
      // Label: Wert pattern inside bullet
      item = item.replace(/^([A-Za-zÄÖÜäöüß0-9 .\-/()]+?):\s+(.+)$/, '<span class="ai-label">$1:</span> $2');
      item = item.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      listBuffer.push(item);
    } else {
      flushList();
      let p = escapeHtml(line);
      p = p.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      p = p.replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, '<em>$1</em>');
      html += `<p>${p}</p>`;
    }
  }
  flushList();
  return html;
}

function formatMessageHtml(text) {
  // Split into blocks by blank line
  const rawBlocks = text.split(/\n{2,}/);
  const out = [];
  const risikoLevels = {
    'Hohe Risiken': 'risk-high',
    'Mittlere Risiken': 'risk-mid',
    'Geringe Risiken': 'risk-low',
  };

  let inQuellen = false;
  let quellenLines = [];

  const flushQuellen = () => {
    if (quellenLines.length) {
      const body = formatBlock(quellenLines);
      out.push(`<div class="ai-sources"><div class="ai-sources-title">Quellen</div><div class="ai-sources-body">${body}</div></div>`);
      quellenLines = [];
    }
    inQuellen = false;
  };

  for (const block of rawBlocks) {
    const lines = block.split('\n');
    const first = lines[0].trim();

    // Inline chart directive: block starts with "[chart: ...]"
    if (lines.length === 1) {
      const chartData = parseChartLine(first);
      if (chartData) {
        flushQuellen();
        out.push(renderInlineBarChart(chartData));
        continue;
      }
    }

    // Markdown table (starts with "|" and has a separator row)
    if (first.startsWith('|')) {
      const tableHtml = parseMarkdownTable(lines);
      if (tableHtml) {
        flushQuellen();
        out.push(tableHtml);
        continue;
      }
    }

    // Block starts with a heading line followed by a chart directive, e.g.
    //   Umsatzentwicklung 2021–2023:
    //   [chart: 2021=4100 2022=4420 2023=4980]
    if (lines.length >= 2) {
      const chartData = parseChartLine(lines[1]);
      if (chartData && /:$/.test(first)) {
        flushQuellen();
        out.push(`<div class="ai-heading">${escapeHtml(first.replace(/:$/, ''))}</div>${renderInlineBarChart(chartData)}`);
        continue;
      }
    }

    // Check for "Quellen:" heading (alone on a line or with content below)
    if (/^Quellen\s*:?\s*$/i.test(first)) {
      flushQuellen();
      inQuellen = true;
      // If the block has further lines (sources listed in same block), collect them.
      quellenLines.push(...lines.slice(1));
      continue;
    }
    if (inQuellen) {
      // Continue collecting source lines until non-list content breaks the context
      const hasBullets = lines.some(l => /^\s*[\-•*]\s+/.test(l));
      if (hasBullets || lines.every(l => l.trim() === '')) {
        quellenLines.push(...lines);
        continue;
      }
      flushQuellen();
    }

    // Numbered section: "1. Titel" / "2. Titel"
    const numberedHeading = first.match(/^(\d+)\.\s+(.{2,80})$/);
    if (numberedHeading && lines.length > 1) {
      const idx = numberedHeading[1];
      const title = escapeHtml(numberedHeading[2]);
      const body = formatBlock(lines.slice(1));
      out.push(`<div class="ai-section"><div class="ai-section-title"><span class="ai-section-num">${idx}</span>${title}</div><div class="ai-section-body">${body}</div></div>`);
      continue;
    }

    // Risk-level heading ("Hohe Risiken:")
    const cleanFirst = first.replace(/:$/, '').trim();
    if (risikoLevels[cleanFirst] && lines.length > 1) {
      const cls = risikoLevels[cleanFirst];
      const body = formatBlock(lines.slice(1));
      out.push(`<div class="ai-risk ${cls}"><div class="ai-risk-title">${escapeHtml(cleanFirst)}</div><div class="ai-risk-body">${body}</div></div>`);
      continue;
    }

    // Generic section heading ending with ":" alone on first line
    if (/^[A-ZÄÖÜ].{1,60}:$/.test(first) && lines.length > 1) {
      const body = formatBlock(lines.slice(1));
      out.push(`<div class="ai-heading">${escapeHtml(first.replace(/:$/, ''))}</div>${body}`);
      continue;
    }

    // Default: format block normally
    out.push(formatBlock(lines));
  }

  flushQuellen();
  return out.join('');
}

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

  const suggestions = viewSuggestedQuestions[state.currentView] || viewSuggestedQuestions.dashboard;

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

  const handleSend = async (overrideMessage) => {
    const message = (overrideMessage || input).trim();
    if (!message || loading) return;
    setInput('');

    const contextInfo = company
      ? `Aktueller Kontext: ${company.firma} (${company.branche}), Kreditantrag über ${company.kredit?.betrag?.toLocaleString('de-DE')} € für ${company.kredit?.verwendung}.`
      : 'Es ist kein spezifischer Kreditantrag ausgewählt.';

    const systemPrompt = `Du bist ein erfahrener Kreditanalyst bei einer deutschen Bank (Sparkasse/Genossenschaftsbank). ${viewContextPrompts[state.currentView] || ''} ${contextInfo} Antworte auf Deutsch, professionell und präzise. Verwende bankübliche Fachbegriffe. Beziehe dich auf regulatorische Anforderungen (MaRisk, KWG, CRR, GwG) wo relevant. Formatiere deine Antwort NICHT mit Markdown. Verwende kein ** für Fettdruck. Schreibe in klarem Fließtext mit Absätzen.

WICHTIG – Quellenangaben: Nenne immer transparent, woher du deine Informationen ziehst. Schließe jede Antwort mit einem Abschnitt "Quellen:" ab und liste die konkreten Datenquellen auf (z. B. "Jahresabschluss 2023 des Antragstellers", "BWA März 2026", "Handelsregister HRB 12345", "Creditreform-Auskunft vom 10.04.2026", "Kompetenzmatrix der Bank", "MaRisk BTO 1.2.1"). Wenn Annahmen getroffen werden, markiere sie als "Annahme:".`;

    await sendChatMessage(systemPrompt, message);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /** Suggestion chips - shown initially and after every assistant reply */
  const SuggestionChips = ({ intro }) => (
    <div className={intro ? 'text-center text-text-muted text-sm py-6' : 'py-2'}>
      {intro && (
        <>
          <Bot size={32} className="mx-auto mb-3 opacity-30" />
          <p className="mb-1">Ich bin im Bereich <strong className="text-text-secondary">{viewLabels[state.currentView] || state.currentView}</strong>.</p>
          <p className="text-xs text-text-muted mb-4">Hier sind passende Fragen:</p>
        </>
      )}
      <div className={intro ? 'space-y-2' : 'flex flex-wrap gap-2'}>
        {suggestions.map((q) => (
          <button
            key={q}
            onClick={() => handleSend(q)}
            className={
              intro
                ? 'flex items-center gap-2 w-full text-left px-3.5 py-2.5 text-sm bg-violet-50 text-violet-800 border border-violet-200 rounded-lg hover:bg-violet-100 hover:border-violet-300 font-medium transition-colors'
                : 'inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-violet-50 text-violet-800 border border-violet-200 rounded-lg hover:bg-violet-100 hover:border-violet-300 transition-colors text-left leading-snug'
            }
          >
            <Sparkles size={13} strokeWidth={2} className="shrink-0 text-violet-600" />
            {q}
          </button>
        ))}
      </div>
    </div>
  );

  // Check if the last message is from the assistant (so we show follow-up suggestions)
  const lastMsg = state.aiMessages[state.aiMessages.length - 1];
  const showFollowUpSuggestions = lastMsg?.role === 'assistant' && !loading;

  // Panel wird breiter, sobald der Assistent geantwortet hat — Tabellen und
  // Charts sind sonst zu schwer lesbar. Ohne Antworten bleibt er kompakt.
  const hasAssistantReply = state.aiMessages.some(m => m.role === 'assistant');
  const panelWidth = hasAssistantReply ? 'w-[560px]' : 'w-96';

  return (
    <div className={`${panelWidth} bg-white border-l border-border flex flex-col h-full shrink-0 transition-[width] duration-200`}>
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
          <SuggestionChips intro />
        )}
        {state.aiMessages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0 mt-1">
                <Bot size={12} className="text-white" />
              </div>
            )}
            <div className={`${msg.role === 'user' ? 'max-w-[85%]' : 'max-w-[95%] flex-1'} rounded-lg px-3 py-2 text-sm ${
              msg.role === 'user'
                ? 'bg-primary text-white'
                : 'bg-surface text-text-primary'
            }`}>
              {msg.role === 'assistant' ? (
                <div
                  className="ai-message-content"
                  dangerouslySetInnerHTML={{ __html: formatMessageHtml(msg.content) }}
                />
              ) : (
                <div className="whitespace-pre-wrap">{msg.content}</div>
              )}
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
        {showFollowUpSuggestions && <SuggestionChips />}
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
            onClick={() => handleSend()}
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
