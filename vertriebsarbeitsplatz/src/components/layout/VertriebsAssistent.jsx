import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { useMode } from '../../hooks/useMode';

const WELCOME_MESSAGES = {
  versicherung:
    'Hallo! Ich bin dein KI-Vertriebsassistent. Ich kann dir bei Kundenanalysen, Produktempfehlungen und Vertriebsstrategien helfen.',
  banking:
    'Hallo! Ich unterstütze dich bei Kreditanalysen, Anlageberatung und Kundengesprächen.',
  vermoegensverwaltung:
    'Hallo! Ich helfe dir bei Portfolioanalysen, Mandatsbetreuung und Compliance-Fragen.',
};

const QUICK_ACTIONS = [
  'Neue Vertriebspotentiale',
  'Kundenpotenzial analysieren',
  'Gesprächsleitfaden erstellen',
  'Cross-Selling Chancen',
];

function getDemoResponse(message, { currentView }) {
  const lower = message.toLowerCase();

  if (lower.includes('vertriebspotentiale') || lower.includes('vertriebspotenziale')) {
    return {
      content: `<div class="space-y-3">
        <p class="font-semibold">Analyse der Vertriebspotentiale</p>
        <p>Ich habe <strong>3 neue Potentiale</strong> für den aktuellen Kunden identifiziert:</p>
        <ol class="list-decimal pl-4 space-y-1">
          <li><strong>Berufsunfähigkeitsversicherung</strong> — Absicherungslücke erkannt, kein bestehender BU-Schutz</li>
          <li><strong>Betriebliche Altersvorsorge</strong> — AG-Zuschuss nicht ausgeschöpft, Steuerersparnis möglich</li>
          <li><strong>Rechtsschutzversicherung</strong> — Kein Vertrag vorhanden, Lebenssituation empfiehlt Absicherung</li>
        </ol>
        <p class="text-xs text-slate-500 mt-2">→ Wechsel zum Tab <em>Vertriebspotenziale</em> für Details...</p>
      </div>`,
      navigateTo: currentView === 'detail' ? 'impulse' : 'potentiale',
    };
  }

  if (lower.includes('bu') || lower.includes('berufsunfähigkeit')) {
    return {
      content: `<div class="space-y-2">
        <p class="font-semibold">BU-Analyse</p>
        <p>Der Kunde weist aufgrund seines Berufsbilds <strong>(kaufm. Angestellter, 38 J.)</strong> ein moderates Risikoprofil auf.</p>
        <table class="w-full text-xs mt-2 border-collapse">
          <tr class="border-b border-slate-200"><td class="py-1 text-slate-500">Empfehlung</td><td class="py-1 font-medium">BU-Rente min. 1.800 €/mtl.</td></tr>
          <tr class="border-b border-slate-200"><td class="py-1 text-slate-500">Absicherungslücke</td><td class="py-1 font-medium text-red-600">ca. 1.200 €/Monat</td></tr>
          <tr><td class="py-1 text-slate-500">Extras</td><td class="py-1 font-medium">Nachversicherungsgarantie empfohlen</td></tr>
        </table>
      </div>`,
    };
  }

  if (lower.includes('cross-selling') || lower.includes('cross selling')) {
    return {
      content: `<div class="space-y-2">
        <p class="font-semibold">Cross-Selling Chancen</p>
        <p>Basierend auf dem aktuellen Vertragsbestand:</p>
        <div class="space-y-2 mt-2">
          <div class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-emerald-500"></span><strong>bAV</strong> — AG-Zuschuss nicht ausgeschöpft <span class="ml-auto text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">85% Potenzial</span></div>
          <div class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-amber-500"></span><strong>Rechtsschutz</strong> — Kein bestehender Vertrag <span class="ml-auto text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">70% Potenzial</span></div>
          <div class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-blue-500"></span><strong>Unfallversicherung</strong> — Nur Grundschutz <span class="ml-auto text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">55% Potenzial</span></div>
        </div>
      </div>`,
    };
  }

  if (lower.includes('kundenpotenzial') || lower.includes('potenzial') || lower.includes('analysieren')) {
    return {
      content: `<div class="space-y-2">
        <p class="font-semibold">Kundenpotenzial-Analyse</p>
        <table class="w-full text-xs mt-1 border-collapse">
          <tr class="border-b border-slate-200"><td class="py-1.5 text-slate-500">Absicherungsgrad</td><td class="py-1.5 font-medium">62% <span class="text-amber-600">— Lücken bei AK & AV</span></td></tr>
          <tr class="border-b border-slate-200"><td class="py-1.5 text-slate-500">Lebenssituation</td><td class="py-1.5 font-medium">Familiengründung vor 2 J. → RL + Kinderabsicherung</td></tr>
          <tr class="border-b border-slate-200"><td class="py-1.5 text-slate-500">Einkommen</td><td class="py-1.5 font-medium text-emerald-600">Überdurchschnittlich → Kapitalanlage-Potenzial</td></tr>
          <tr><td class="py-1.5 text-slate-500">Nächster Impuls</td><td class="py-1.5 font-medium">Jahresgespräch in 3 Wochen terminieren</td></tr>
        </table>
      </div>`,
    };
  }

  if (lower.includes('gesprächsleitfaden') || lower.includes('gespräch') || lower.includes('leitfaden')) {
    return {
      content: `<div class="space-y-2">
        <p class="font-semibold">Gesprächsleitfaden</p>
        <ol class="list-decimal pl-4 space-y-1.5 text-[13px]">
          <li><strong>Einstieg</strong> — Bezug auf letztes Gespräch, aktuelle Lebenssituation erfragen</li>
          <li><strong>Bedarfsanalyse</strong> — Veränderungen seit letztem Kontakt? Neue Wünsche/Sorgen?</li>
          <li><strong>Absicherungscheck</strong> — Bestehende Verträge gemeinsam durchgehen, Lücken aufzeigen</li>
          <li><strong>Empfehlung</strong> — Max. 2 konkrete Produktvorschläge unterbreiten</li>
          <li><strong>Abschluss</strong> — Nächste Schritte vereinbaren, Folgetermin festlegen</li>
        </ol>
        <div class="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
          💡 <strong>Tipp:</strong> Den Kunden zuerst erzählen lassen — offene Fragen stellen!
        </div>
      </div>`,
    };
  }

  if (lower.includes('kredit') || lower.includes('finanzierung')) {
    return {
      content: `<div class="space-y-2">
        <p class="font-semibold">Kreditanalyse — Empfohlene Schritte</p>
        <ol class="list-decimal pl-4 space-y-1">
          <li><strong>Bonitätsprüfung</strong> — Schufa-Score und Einkommensnachweise prüfen</li>
          <li><strong>Kapitaldienstfähigkeit</strong> — Monatl. Belastungsquote (max. 35–40%)</li>
          <li><strong>Sicherheiten</strong> — Vorhandene Sicherheiten bewerten</li>
          <li><strong>Konditionsvergleich</strong> — Passende Kreditprodukte gegenüberstellen</li>
        </ol>
      </div>`,
    };
  }

  if (lower.includes('portfolio') || lower.includes('anlage') || lower.includes('depot')) {
    return {
      content: `<div class="space-y-2">
        <p class="font-semibold">Portfolio-Analyse</p>
        <table class="w-full text-xs mt-1 border-collapse">
          <tr class="border-b border-slate-200"><td class="py-1.5 text-slate-500">Allokation</td><td class="py-1.5 font-medium">45% Aktien · 30% Anleihen · 15% Immo · 10% Cash</td></tr>
          <tr class="border-b border-slate-200"><td class="py-1.5 text-slate-500">Risikoprofil</td><td class="py-1.5 font-medium">Ausgewogen (Stufe 3/5)</td></tr>
          <tr class="border-b border-slate-200"><td class="py-1.5 text-slate-500">Performance YTD</td><td class="py-1.5 font-medium text-emerald-600">+4,2% (Benchmark: +3,8%)</td></tr>
          <tr><td class="py-1.5 text-slate-500">Empfehlung</td><td class="py-1.5 font-medium">EU-Dividendenwerte ↑ · Liquidität auf 5% ↓</td></tr>
        </table>
      </div>`,
    };
  }

  return {
    content: `<div class="space-y-2">
      <p>Ich habe die relevanten Kundendaten und Vertriebsinformationen analysiert.</p>
      <p>Basierend auf dem aktuellen Bestand empfehle ich:</p>
      <ul class="list-disc pl-4 space-y-1">
        <li>Bestehende Vertragsbeziehungen prüfen</li>
        <li>Identifizierte Bedarfslücken gezielt ansprechen</li>
        <li>Nächsten Kundenkontakt terminieren</li>
      </ul>
      <p class="text-slate-500">Soll ich einen konkreten Bereich genauer analysieren?</p>
    </div>`,
  };
}

export default function VertriebsAssistent() {
  const { modeId, config, currentView, setActiveTab } = useMode();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const hasAutoOpened = useRef(false);

  const { primary, primaryLight, gradient } = config.colors;

  // Auto-open on detail page
  useEffect(() => {
    if (currentView === 'detail' && !hasAutoOpened.current) {
      setIsOpen(true);
      hasAutoOpened.current = true;
    }
    if (currentView !== 'detail') {
      hasAutoOpened.current = false;
    }
  }, [currentView]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  // Reset messages when mode changes
  useEffect(() => {
    setMessages([]);
  }, [modeId]);

  const sendMessage = useCallback(
    (text) => {
      if (!text.trim() || isTyping) return;
      const userMsg = { role: 'user', content: text.trim() };
      setMessages((prev) => [...prev, userMsg]);
      setInput('');
      setIsTyping(true);

      setTimeout(() => {
        const result = getDemoResponse(text, { currentView });
        setMessages((prev) => [...prev, { role: 'assistant', content: result.content, isHtml: true }]);
        setIsTyping(false);

        // Navigate to tab if response requests it
        if (result.navigateTo) {
          setTimeout(() => {
            setActiveTab(result.navigateTo);
          }, 800);
        }
      }, 1200);
    },
    [isTyping, currentView, setActiveTab],
  );

  const handleSend = () => sendMessage(input);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const welcomeMessage = WELCOME_MESSAGES[modeId] || WELCOME_MESSAGES.versicherung;

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{ background: gradient }}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white hover:scale-105 transition-transform"
          title="KI-Vertriebsassistent öffnen"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div
          className="fixed bottom-6 right-6 z-50 w-[400px] h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200"
          style={{ maxHeight: 'calc(100vh - 48px)' }}
        >
          {/* Header */}
          <div
            style={{ background: gradient }}
            className="flex items-center justify-between px-4 py-3 shrink-0"
          >
            <div className="flex items-center gap-2 text-white">
              <Bot size={20} />
              <span className="text-sm font-semibold">KI-Vertriebsassistent</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-white/80 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Welcome message */}
            {messages.length === 0 && (
              <div className="space-y-4">
                {/* Bot welcome */}
                <div className="flex gap-2">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{ backgroundColor: primary }}
                  >
                    <Bot size={14} className="text-white" />
                  </div>
                  <div className="bg-gray-100 rounded-lg rounded-tl-none px-3 py-2 text-sm text-gray-800 max-w-[85%]">
                    {welcomeMessage}
                  </div>
                </div>

                {/* Quick action chips */}
                <div className="pl-9 flex flex-wrap gap-2">
                  {QUICK_ACTIONS.map((action) => (
                    <button
                      key={action}
                      onClick={() => sendMessage(action)}
                      className="px-3 py-1.5 text-xs rounded-full border transition-colors"
                      style={{
                        borderColor: primaryLight,
                        color: primary,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = primary;
                        e.currentTarget.style.color = '#fff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = primary;
                      }}
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat messages */}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}
              >
                {msg.role === 'assistant' && (
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{ backgroundColor: primary }}
                  >
                    <Bot size={14} className="text-white" />
                  </div>
                )}
                {msg.isHtml ? (
                  <div
                    className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                      msg.role === 'user'
                        ? 'rounded-tr-none text-white'
                        : 'rounded-tl-none bg-gray-100 text-gray-800'
                    }`}
                    style={msg.role === 'user' ? { backgroundColor: primary } : undefined}
                    dangerouslySetInnerHTML={{ __html: msg.content }}
                  />
                ) : (
                  <div
                    className={`max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'rounded-tr-none text-white'
                        : 'rounded-tl-none bg-gray-100 text-gray-800'
                    }`}
                    style={msg.role === 'user' ? { backgroundColor: primary } : undefined}
                  >
                    {msg.content}
                  </div>
                )}
                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-gray-400 flex items-center justify-center shrink-0 mt-0.5">
                    <User size={14} className="text-white" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex gap-2">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: primary }}
                >
                  <Bot size={14} className="text-white" />
                </div>
                <div className="bg-gray-100 rounded-lg rounded-tl-none px-3 py-2 text-sm text-gray-500">
                  <span className="inline-flex gap-1">
                    <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
                    <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
                    <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
                  </span>
                  {' '}Analysiere...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="p-3 border-t border-gray-200 shrink-0">
            <div className="flex gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nachricht eingeben..."
                rows={1}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 transition-shadow"
                style={{
                  '--tw-ring-color': primaryLight + '40',
                  borderColor: input ? primaryLight : undefined,
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = primaryLight;
                }}
                onBlur={(e) => {
                  if (!input) e.currentTarget.style.borderColor = '';
                }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="px-3 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: primary }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.disabled)
                    e.currentTarget.style.backgroundColor = primaryLight;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = primary;
                }}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
