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
  'Kundenpotenzial analysieren',
  'Gesprächsleitfaden erstellen',
  'Cross-Selling Chancen',
];

function getDemoResponse(message) {
  const lower = message.toLowerCase();

  if (lower.includes('bu') || lower.includes('berufsunfähigkeit')) {
    return 'Die BU-Analyse zeigt, dass der Kunde aufgrund seines Berufsbilds (kaufmännischer Angestellter, 38 Jahre) ein moderates Risikoprofil aufweist. Empfehlung: BU-Rente von mindestens 1.800 € monatlich mit Nachversicherungsgarantie. Die aktuelle Absicherungslücke beträgt ca. 1.200 €/Monat.';
  }
  if (lower.includes('cross-selling') || lower.includes('cross selling')) {
    return 'Basierend auf dem aktuellen Vertragsbestand sehe ich folgende Cross-Selling-Chancen:\n\n1. **Betriebliche Altersvorsorge** – Arbeitgeberzuschuss noch nicht ausgeschöpft\n2. **Rechtsschutzversicherung** – Kein bestehender Vertrag\n3. **Unfallversicherung** – Nur Grundschutz vorhanden\n\nPriorisierung: bAV hat das höchste Abschlusspotenzial (geschätzt 85%).';
  }
  if (lower.includes('kundenpotenzial') || lower.includes('potenzial') || lower.includes('analysieren')) {
    return 'Kundenpotenzial-Analyse:\n\n• **Absicherungsgrad:** 62% – es bestehen Lücken in der Arbeitskraftabsicherung und Altersvorsorge\n• **Lebenssituation:** Familiengründung vor 2 Jahren → erhöhter Bedarf an Risikolebens- und Kinderabsicherung\n• **Einkommen:** Überdurchschnittlich für Altersgruppe → Potenzial für Kapitalanlageprodukte\n• **Nächster Impuls:** Jahresgespräch in 3 Wochen terminieren';
  }
  if (lower.includes('gesprächsleitfaden') || lower.includes('gespräch') || lower.includes('leitfaden')) {
    return 'Gesprächsleitfaden für das nächste Kundengespräch:\n\n1. **Einstieg** – Bezug auf letztes Gespräch, aktuelle Lebenssituation erfragen\n2. **Bedarfsanalyse** – Veränderungen seit letztem Kontakt? Neue Wünsche/Sorgen?\n3. **Absicherungscheck** – Bestehende Verträge gemeinsam durchgehen, Lücken aufzeigen\n4. **Empfehlung** – Maximal 2 konkrete Produktvorschläge unterbreiten\n5. **Abschluss** – Nächste Schritte vereinbaren, Folgetermin festlegen\n\n💡 Tipp: Den Kunden zuerst erzählen lassen – offene Fragen stellen!';
  }
  if (lower.includes('kredit') || lower.includes('finanzierung')) {
    return 'Für die Kreditanalyse empfehle ich folgende Schritte:\n\n1. **Bonitätsprüfung** – Schufa-Score und Einkommensnachweise prüfen\n2. **Kapitaldienstfähigkeit** – Monatliche Belastungsquote berechnen (max. 35-40%)\n3. **Sicherheiten** – Vorhandene Sicherheiten bewerten\n4. **Konditionsvergleich** – Passende Kreditprodukte gegenüberstellen\n\nSoll ich eine detaillierte Berechnung für einen bestimmten Kunden erstellen?';
  }
  if (lower.includes('portfolio') || lower.includes('anlage') || lower.includes('depot')) {
    return 'Portfolio-Analyse:\n\n• **Aktuelle Allokation:** 45% Aktien, 30% Anleihen, 15% Immobilien, 10% Liquidität\n• **Risikoprofil:** Ausgewogen (Stufe 3/5)\n• **Performance YTD:** +4,2% (Benchmark: +3,8%)\n• **Empfehlung:** Leichte Übergewichtung europäischer Dividendenwerte, Reduktion der Liquiditätsquote auf 5%';
  }

  return 'Vielen Dank für deine Frage! Ich habe die relevanten Kundendaten und Vertriebsinformationen analysiert. Basierend auf dem aktuellen Bestand und den Marktbedingungen empfehle ich, zunächst die bestehenden Vertragsbeziehungen zu prüfen und dann gezielt auf die identifizierten Bedarfslücken einzugehen. Soll ich einen konkreten Bereich genauer analysieren?';
}

export default function VertriebsAssistent() {
  const { modeId, config } = useMode();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const { primary, primaryLight, gradient } = config.colors;

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
        const response = getDemoResponse(text);
        setMessages((prev) => [...prev, { role: 'assistant', content: response }]);
        setIsTyping(false);
      }, 1000);
    },
    [isTyping],
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
                  {' '}Schreibt...
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
