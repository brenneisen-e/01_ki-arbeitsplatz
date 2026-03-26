import { useState } from 'react';
import { clsx } from 'clsx';
import { Send, Edit3, ArrowUpRight, XCircle, CheckCircle } from 'lucide-react';

export default function AntwortEntwurf({ antwortText, onStatusChange }) {
  const [text, setText] = useState(antwortText || '');
  const [editing, setEditing] = useState(false);
  const [showConfirmReject, setShowConfirmReject] = useState(false);
  const [actionDone, setActionDone] = useState(null);

  if (!antwortText) return null;

  if (actionDone) {
    const isSuccess = actionDone === 'geklaert' || actionDone === 'eskaliert';
    return (
      <div className="card-base p-6 text-center animate-fade-in">
        <div className={clsx(
          'w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3',
          isSuccess ? 'bg-emerald-50' : 'bg-red-50'
        )}>
          {isSuccess
            ? <CheckCircle size={24} className="text-emerald-500" />
            : <XCircle size={24} className="text-red-500" />
          }
        </div>
        <p className="text-sm font-medium text-slate-700">
          {actionDone === 'geklaert' && 'Vorgang abgeschlossen — Antwort übernommen.'}
          {actionDone === 'eskaliert' && 'Vorgang eskaliert.'}
          {actionDone === 'abgelehnt' && 'Reklamation abgelehnt.'}
        </p>
      </div>
    );
  }

  const handleAction = (action) => {
    if (action === 'abgelehnt' && !showConfirmReject) {
      setShowConfirmReject(true);
      return;
    }
    setActionDone(action);
    if (onStatusChange) {
      const statusMap = { geklaert: 'Geklärt', eskaliert: 'Eskaliert', abgelehnt: 'Abgelehnt' };
      onStatusChange(statusMap[action]);
    }
  };

  return (
    <div className="card-base p-4 space-y-4">
      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
        KI-generierter Antwort-Entwurf
      </h4>

      {editing ? (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={12}
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-y font-normal leading-relaxed"
        />
      ) : (
        <div className="text-sm text-slate-700 whitespace-pre-line leading-relaxed bg-slate-50 rounded-lg p-4 border border-slate-100">
          {text}
        </div>
      )}

      {showConfirmReject && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center justify-between">
          <p className="text-sm text-red-700">Reklamation wirklich ablehnen?</p>
          <div className="flex gap-2">
            <button onClick={() => setShowConfirmReject(false)} className="px-3 py-1 text-xs text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
              Abbrechen
            </button>
            <button onClick={() => handleAction('abgelehnt')} className="px-3 py-1 text-xs text-white bg-red-600 rounded-lg hover:bg-red-700">
              Ja, ablehnen
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleAction('geklaert')}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Send size={14} strokeWidth={1.75} />
          Antwort übernehmen & abschließen
        </button>
        <button
          onClick={() => setEditing(!editing)}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <Edit3 size={14} strokeWidth={1.75} />
          {editing ? 'Vorschau' : 'Antwort bearbeiten'}
        </button>
        <button
          onClick={() => handleAction('eskaliert')}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-orange-700 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
        >
          <ArrowUpRight size={14} strokeWidth={1.75} />
          Vorgang eskalieren
        </button>
        <button
          onClick={() => handleAction('abgelehnt')}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
        >
          <XCircle size={14} strokeWidth={1.75} />
          Reklamation ablehnen
        </button>
      </div>
    </div>
  );
}
