import { useState } from 'react';
import { Sparkles, Send, Calendar, Search, PenLine, Calculator, MessageCircle } from 'lucide-react';
import { tx } from '../../utils/langHelper';
import useTranslation from '../../i18n/useTranslation';

/**
 * Inline AI assistant card (Cockpit 2026): weiße Karte mit zart getönter
 * Modusfläche, einfarbige Lucide-Icons, Vorschlags-Chips als surface-inset.
 * Dispatches a `kia-chatbot-send` window event when the user picks a
 * suggestion or submits text, which the floating VertriebsAssistent
 * listens for so both surfaces stay in sync.
 */

// Suggestion chips for the inline assistant. Labels/prompts are resolved
// via tx() at render time so they react to language switches.
const SUGGESTION_CATEGORIES = [
  {
    id: 'tagesplanung',
    label: () => tx('Tagesplanung', 'Daily Planning'),
    icon: Calendar,
    prompt: () => tx('Was steht heute an?', "What's on today?"),
  },
  {
    id: 'analyse',
    label: () => tx('Kunden-Analyse', 'Customer Analysis'),
    icon: Search,
    prompt: () => tx('Welche Kunden haben auslaufende Kredite in den nächsten 6 Monaten?', 'Which customers have loans expiring in the next 6 months?'),
  },
  {
    id: 'gespraech',
    label: () => tx('Gespräch vorbereiten', 'Prepare Meeting'),
    icon: MessageCircle,
    prompt: () => tx('Bereite mir ein Erstgespräch mit Markus Wagner vor', 'Prepare an initial meeting with Markus Wagner for me'),
  },
  {
    id: 'formulierung',
    label: () => tx('Mail formulieren', 'Draft Email'),
    icon: PenLine,
    prompt: () => tx('Schreib eine Einladung zur Immobilienfinanzierung für Markus Wagner', 'Write an invitation about mortgage financing for Markus Wagner'),
  },
  {
    id: 'rechnen',
    label: () => tx('Rechenbeispiel', 'Calculation Example'),
    icon: Calculator,
    prompt: () => tx('Rechne mir eine Baufinanzierung für Wagner – 42k Eigenkapital, 840€ Rate', 'Calculate a mortgage for Wagner – €42k equity, €840 installment'),
  },
];

export default function KIAssistentCard() {
  const { t } = useTranslation();
  const [input, setInput] = useState('');

  const sendPrompt = (message) => {
    const text = (message || '').trim();
    if (!text) return;
    window.dispatchEvent(new CustomEvent('kia-chatbot-send', { detail: { message: text } }));
    setInput('');
  };

  return (
    <div className="relative surface-card p-5 overflow-hidden">
      {/* Zarter Modus-Hauch oben rechts statt bunter Verlaufskreise */}
      <div
        className="absolute -top-16 -right-16 w-56 h-56 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, var(--mode-pastel) 0%, transparent 70%)' }}
      />

      {/* Header */}
      <div className="relative flex items-center gap-2.5 mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-(--mode-pastel) text-(--mode-primary)">
          <Sparkles size={18} strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-(--text-primary) text-sm leading-tight">{t('kiVertriebsassistent')}</h3>
          <div className="text-[11px] text-(--text-tertiary)">{t('fidaKontextLive')}</div>
        </div>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider bg-(--mode-primary) text-white">
          Beta
        </span>
      </div>

      {/* Prompt */}
      <div className="relative mb-4">
        <h4 className="text-lg font-semibold text-(--text-primary) leading-tight mb-1">
          {t('wieKannIchDirHelfen')}
        </h4>
        <p className="text-xs text-(--text-secondary) leading-snug">
          {t('kiCardSubtext')}
        </p>
      </div>

      {/* Suggestion chips */}
      <div className="relative grid grid-cols-2 gap-2 mb-4">
        {SUGGESTION_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const prompt = cat.prompt();
          return (
            <button
              key={cat.id}
              onClick={() => sendPrompt(prompt)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl surface-inset hover:bg-(--bg-card) hover:border-(--mode-accent) transition-colors text-left group"
              title={prompt}
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-(--bg-card) border border-(--border-light) text-(--mode-primary)">
                <Icon size={14} strokeWidth={2} />
              </div>
              <span className="text-xs font-semibold text-(--text-secondary) truncate group-hover:text-(--text-primary)">
                {cat.label()}
              </span>
            </button>
          );
        })}
      </div>

      {/* Input */}
      <form
        className="relative flex items-center gap-2 surface-inset rounded-xl pl-3 pr-1.5 py-1.5 focus-within:border-(--mode-accent) transition-colors"
        onSubmit={(e) => {
          e.preventDefault();
          sendPrompt(input);
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('nachrichtEingeben')}
          className="flex-1 bg-transparent outline-none text-sm text-(--text-primary) placeholder:text-(--text-tertiary)"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-(--mode-primary) hover:bg-(--mode-primary-light) text-white transition-colors disabled:opacity-40 disabled:hover:bg-(--mode-primary)"
          aria-label={t('senden')}
        >
          <Send size={14} strokeWidth={2.5} />
        </button>
      </form>
    </div>
  );
}
