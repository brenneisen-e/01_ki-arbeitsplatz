import { useState } from 'react';
import Card from '../../../components/ui/Card';
import { clsx } from 'clsx';
import { Mail, Phone, Calendar, MessageCircle, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { formatDatum } from '../../../utils/formatters';

const TYP_ICONS = {
  email: Mail,
  telefon: Phone,
  termin: Calendar,
  chatbot: MessageCircle,
};

const TYP_LABELS = {
  email: 'E-Mail',
  telefon: 'Telefon',
  termin: 'Termin',
  chatbot: 'Chatbot',
};

export default function KommunikationTab({ kunde }) {
  const kommunikation = kunde.kommunikation || [];
  const [filterTyp, setFilterTyp] = useState('alle');

  const typen = ['alle', ...new Set(kommunikation.map(k => k.typ))];
  const filtered = filterTyp === 'alle' ? kommunikation : kommunikation.filter(k => k.typ === filterTyp);

  return (
    <div className="space-y-4">
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
            {t === 'alle' ? 'Alle' : TYP_LABELS[t] || t}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <Card>
        <h3 className="font-semibold text-slate-800 mb-4">Kommunikations-Timeline</h3>
        {filtered.length === 0 ? (
          <div className="text-sm text-slate-400 py-8 text-center">Keine Kommunikation vorhanden</div>
        ) : (
          <div className="space-y-4">
            {filtered.map((k, i) => {
              const Icon = TYP_ICONS[k.typ] || Mail;
              return (
                <div key={i} className="flex gap-4 py-3 border-b border-slate-100 last:border-0">
                  <div className="flex flex-col items-center">
                    <div className={clsx(
                      'w-9 h-9 rounded-full flex items-center justify-center',
                      k.richtung === 'eingehend' ? 'bg-blue-50' : 'bg-slate-100'
                    )}>
                      <Icon size={16} className={k.richtung === 'eingehend' ? 'text-blue-600' : 'text-slate-500'} strokeWidth={1.75} />
                    </div>
                    {i < filtered.length - 1 && <div className="w-px flex-1 bg-slate-200 mt-2" />}
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-slate-700">{k.betreff}</span>
                      {k.richtung === 'eingehend' ? (
                        <ArrowDownLeft size={14} className="text-blue-500" />
                      ) : (
                        <ArrowUpRight size={14} className="text-slate-400" />
                      )}
                    </div>
                    <div className="text-xs text-slate-400 mb-2">
                      {formatDatum(k.datum)} &middot; {TYP_LABELS[k.typ] || k.typ} &middot; {k.richtung}
                    </div>
                    <p className="text-sm text-slate-600">{k.zusammenfassung}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
