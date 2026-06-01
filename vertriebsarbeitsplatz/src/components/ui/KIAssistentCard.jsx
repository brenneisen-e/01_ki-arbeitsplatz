import { useState } from 'react';
import { Sparkles, Send, Calendar, Search, PenLine, Calculator, MessageCircle } from 'lucide-react';
import { tx } from '../../utils/langHelper';
import useTranslation from '../../i18n/useTranslation';

/**
 * Inline AI assistant card with a subtle purple accent.
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
    <div
      className="relative rounded-2xl p-5 overflow-hidden border"
      style={{
        background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 50%, #e0e7ff 100%)',
        borderColor: '#d8d4ff',
        boxShadow: '0 6px 20px -8px rgba(124, 58, 237, 0.25), 0 2px 6px -2px rgba(124, 58, 237, 0.08)',
      }}
    >
      {/* Decorative blur circles */}
      <div
        className="absolute -top-10 -right-10 w-32 h-32 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(167, 139, 250, 0.35) 0%, transparent 70%)' }}
      />
      <div
        className="absolute -bottom-8 -left-6 w-24 h-24 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(196, 181, 253, 0.4) 0%, transparent 70%)' }}
      />

      {/* Header */}
      <div className="relative flex items-center gap-2 mb-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm"
          style={{
            background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
          }}
        >
          <Sparkles size={18} className="text-white" strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-900 text-sm">{t('kiVertriebsassistent')}</h3>
          <div className="text-[11px] text-slate-500">{t('fidaKontextLive')}</div>
        </div>
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white uppercase tracking-wider"
          style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }}
        >
          Beta
        </span>
      </div>

      {/* Prompt */}
      <div className="relative mb-4">
        <h4 className="text-lg font-bold text-slate-800 leading-tight mb-1">
          {t('wieKannIchDirHelfen')}
        </h4>
        <p className="text-xs text-slate-600 leading-snug">
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
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/80 backdrop-blur border border-white hover:bg-white hover:shadow-md transition-all text-left group"
              title={prompt}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: '#ede9fe' }}
              >
                <Icon size={14} style={{ color: '#7c3aed' }} strokeWidth={2} />
              </div>
              <span className="text-xs font-semibold text-slate-700 truncate group-hover:text-slate-900">
                {cat.label()}
              </span>
            </button>
          );
        })}
      </div>

      {/* Input */}
      <form
        className="relative flex items-center gap-2 bg-white/90 backdrop-blur border border-white rounded-xl px-3 py-2 shadow-sm"
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
          className="flex-1 bg-transparent outline-none text-sm text-slate-700 placeholder-slate-400"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-opacity disabled:opacity-40"
          style={{
            background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
          }}
          aria-label={t('senden')}
        >
          <Send size={14} className="text-white" strokeWidth={2.5} />
        </button>
      </form>
    </div>
  );
}
