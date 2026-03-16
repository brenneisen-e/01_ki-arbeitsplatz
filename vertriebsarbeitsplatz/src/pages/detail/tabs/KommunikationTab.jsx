import { useState } from 'react';
import Card from '../../../components/ui/Card';
import { clsx } from 'clsx';
import { Mail, Phone, Calendar, MessageCircle, ArrowUpRight, ArrowDownLeft, ChevronDown, ChevronUp, Bot, User, Sparkles, ExternalLink, Globe } from 'lucide-react';
import { formatDatum } from '../../../utils/formatters';
import { useMode } from '../../../hooks/useMode';

const TYP_ICONS = {
  email: Mail,
  telefon: Phone,
  termin: Calendar,
  chatbot: MessageCircle,
  kontaktformular: Globe,
};

const TYP_LABELS = {
  email: 'E-Mail',
  telefon: 'Telefon',
  termin: 'Termin',
  chatbot: 'Chatbot',
  kontaktformular: 'Kontaktanfrage',
};

const TYP_COLORS = {
  email: { bg: 'bg-blue-50', text: 'text-blue-600' },
  telefon: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
  termin: { bg: 'bg-purple-50', text: 'text-purple-600' },
  chatbot: { bg: 'bg-amber-50', text: 'text-amber-600' },
  kontaktformular: { bg: 'bg-cyan-50', text: 'text-cyan-600' },
};

export default function KommunikationTab({ kunde }) {
  const kommunikation = kunde.kommunikation || [];
  const [filterTyp, setFilterTyp] = useState('alle');
  const [expandedItem, setExpandedItem] = useState(null);

  const typen = ['alle', ...new Set(kommunikation.map(k => k.typ))];
  const filtered = filterTyp === 'alle' ? kommunikation : kommunikation.filter(k => k.typ === filterTyp);

  // Count by type
  const typCounts = {};
  kommunikation.forEach(k => { typCounts[k.typ] = (typCounts[k.typ] || 0) + 1; });

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-5 gap-3">
        {Object.entries(TYP_LABELS).map(([typ, label]) => {
          const count = typCounts[typ] || 0;
          if (count === 0) return null;
          const colors = TYP_COLORS[typ] || TYP_COLORS.email;
          const Icon = TYP_ICONS[typ];
          return (
            <div key={typ} className="bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colors.bg}`}>
                <Icon size={16} className={colors.text} />
              </div>
              <div>
                <div className="text-lg font-bold text-slate-800">{count}</div>
                <div className="text-[10px] text-slate-400">{label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {typen.map(t => (
          <button
            key={t}
            onClick={() => setFilterTyp(t)}
            className={clsx(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              filterTyp === t
                ? 'bg-slate-800 text-white'
                : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
            )}
          >
            {t === 'alle' ? `Alle (${kommunikation.length})` : `${TYP_LABELS[t] || t} (${typCounts[t] || 0})`}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <Card hover={false}>
        <h3 className="font-semibold text-slate-800 mb-4">Kommunikations-Timeline</h3>
        {filtered.length === 0 ? (
          <div className="text-sm text-slate-400 py-8 text-center">Keine Kommunikation vorhanden</div>
        ) : (
          <div className="space-y-0">
            {filtered.map((k, i) => (
              <KommunikationEntry
                key={i}
                entry={k}
                isLast={i === filtered.length - 1}
                isExpanded={expandedItem === i}
                onToggle={() => setExpandedItem(expandedItem === i ? null : i)}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function KommunikationEntry({ entry: k, isLast, isExpanded, onToggle }) {
  const Icon = TYP_ICONS[k.typ] || Mail;
  const colors = TYP_COLORS[k.typ] || TYP_COLORS.email;
  const hasDetail = k.inhalt || k.chatverlauf || k.emailBody;
  const { config } = useMode();

  return (
    <div className="flex gap-4 py-3 border-b border-slate-100 last:border-0">
      {/* Timeline line + icon */}
      <div className="flex flex-col items-center">
        <div className={clsx('w-9 h-9 rounded-full flex items-center justify-center', colors.bg)}>
          <Icon size={16} className={colors.text} strokeWidth={1.75} />
        </div>
        {!isLast && <div className="w-px flex-1 bg-slate-200 mt-2" />}
      </div>

      {/* Content */}
      <div className="flex-1 pb-2 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-slate-700">{k.betreff}</span>
          {k.richtung === 'eingehend' ? (
            <ArrowDownLeft size={14} className="text-blue-500" />
          ) : (
            <ArrowUpRight size={14} className="text-slate-400" />
          )}
          <span className={clsx(
            'text-[10px] font-medium px-2 py-0.5 rounded-full',
            colors.bg, colors.text
          )}>
            {TYP_LABELS[k.typ] || k.typ}
          </span>
        </div>
        <div className="text-xs text-slate-400 mb-2">
          {formatDatum(k.datum)} &middot; {k.richtung === 'eingehend' ? 'Eingehend' : 'Ausgehend'}
          {k.kanal && <> &middot; {k.kanal}</>}
        </div>
        <p className="text-sm text-slate-600">{k.zusammenfassung}</p>

        {/* Expand button for detailed content */}
        {hasDetail && (
          <button
            onClick={onToggle}
            className="flex items-center gap-1 mt-2 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {k.chatverlauf ? 'Chatverlauf anzeigen' : k.emailBody ? 'E-Mail anzeigen' : 'Details anzeigen'}
          </button>
        )}

        {/* Expanded detail */}
        {isExpanded && hasDetail && (
          <div className="mt-3 animate-fade-in">
            {/* Chatbot conversation */}
            {k.chatverlauf && (
              <ChatverlaufView verlauf={k.chatverlauf} kiZusammenfassung={k.kiZusammenfassung} config={config} />
            )}

            {/* Email body */}
            {k.emailBody && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-3 pb-2 border-b border-slate-200">
                  <Mail size={12} />
                  <span>Von: {k.absender || 'Berater'}</span>
                  <span>&middot;</span>
                  <span>An: {k.empfaenger || 'Kunde'}</span>
                </div>
                <div className="text-sm text-slate-700 whitespace-pre-line">{k.emailBody}</div>
              </div>
            )}

            {/* Generic detail content */}
            {k.inhalt && !k.chatverlauf && !k.emailBody && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-700 whitespace-pre-line">
                {k.inhalt}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ChatverlaufView({ verlauf, kiZusammenfassung, config }) {
  return (
    <div className="space-y-3">
      {/* AI Summary */}
      {kiZusammenfassung && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={14} className="text-indigo-600" />
            <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">KI-Zusammenfassung</span>
          </div>
          <p className="text-sm text-indigo-900">{kiZusammenfassung}</p>
        </div>
      )}

      {/* Chat messages */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs text-slate-400 pb-2 border-b border-slate-200">
          <MessageCircle size={12} />
          <span className="font-medium">Chatbot-Verlauf</span>
          <span>&middot;</span>
          <span>{verlauf.length} Nachrichten</span>
        </div>
        {verlauf.map((msg, i) => (
          <div key={i} className={clsx('flex gap-2', msg.rolle === 'kunde' ? 'justify-end' : 'justify-start')}>
            {msg.rolle !== 'kunde' && (
              <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
                <Bot size={14} className="text-white" />
              </div>
            )}
            <div className={clsx(
              'max-w-[75%] px-3 py-2 rounded-xl text-sm',
              msg.rolle === 'kunde'
                ? 'bg-blue-600 text-white rounded-br-sm'
                : 'bg-white border border-slate-200 text-slate-700 rounded-bl-sm'
            )}>
              {msg.text}
              {msg.zeit && (
                <div className={clsx('text-[10px] mt-1', msg.rolle === 'kunde' ? 'text-blue-200' : 'text-slate-300')}>
                  {msg.zeit}
                </div>
              )}
            </div>
            {msg.rolle === 'kunde' && (
              <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <User size={14} className="text-blue-600" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
