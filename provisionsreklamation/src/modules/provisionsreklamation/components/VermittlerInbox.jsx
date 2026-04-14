import { useState } from 'react';
import { Mail, User, FileText, CheckCircle, ChevronLeft, Send, Reply } from 'lucide-react';

const formatEur = (val) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(val || 0);
const formatDatumDe = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// Zeigt die Perspektive des Vermittlers, der eine Reklamation eingereicht
// hat: oben seine eigenen Kontaktdaten, darunter der Status des Vorgangs und
// die Antwort-E-Mail aus dem Provisionsservice.
export default function VermittlerInbox({ vorgaenge, onMarkGelesen, onAntworten }) {
  const [activeId, setActiveId] = useState(vorgaenge[0]?.id || null);
  const [replyMode, setReplyMode] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sendingStage, setSendingStage] = useState(null); // 'sending' | 'delivered' | null
  const aktuellerVorgang = vorgaenge.find(v => v.id === activeId) || vorgaenge[0];

  if (!aktuellerVorgang) return null;

  const statusLabel = aktuellerVorgang.antwortStatus || aktuellerVorgang.status;
  const isPositiv = statusLabel === 'Geklärt' || statusLabel === 'Beantwortet';

  const startReply = () => {
    setReplyMode(true);
    setReplyText(
      `Sehr geehrte Frau Neumann,\n\nvielen Dank für Ihre Rückmeldung zu Vorgang ${aktuellerVorgang.id}.\n\n\n\nMit freundlichen Grüßen\n${aktuellerVorgang.vermittler}`
    );
  };

  const cancelReply = () => {
    setReplyMode(false);
    setReplyText('');
  };

  const submitReply = () => {
    if (!replyText.trim()) return;
    // Kurze Send-Animation analog zum Backoffice.
    setSendingStage('sending');
    setTimeout(() => {
      setSendingStage('delivered');
      setTimeout(() => {
        setSendingStage(null);
        setReplyMode(false);
        if (onAntworten) onAntworten(aktuellerVorgang.id, replyText.trim());
        setReplyText('');
      }, 900);
    }, 1200);
  };

  if (sendingStage) {
    return (
      <div className="p-6 animate-fade-in-up">
        <div className="card-base p-10 text-center">
          {sendingStage === 'sending' ? (
            <>
              <div className="relative w-16 h-16 mx-auto mb-4">
                <div className="absolute inset-0 rounded-full bg-blue-100 animate-ping opacity-60" />
                <div className="relative w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
                  <Send size={28} className="text-blue-500 animate-pulse" strokeWidth={1.75} />
                </div>
              </div>
              <p className="text-sm font-medium text-slate-700">
                Ihre Antwort wird an den Provisionsservice gesendet …
              </p>
              <div className="flex items-center justify-center gap-1.5 mt-3">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse [animation-delay:150ms]" />
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse [animation-delay:300ms]" />
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4 animate-fade-in-up">
                <Mail size={28} className="text-emerald-500" strokeWidth={1.75} />
              </div>
              <p className="text-sm font-medium text-slate-700">Rückfrage zugestellt.</p>
              <p className="text-xs text-slate-400 mt-1">
                Der Vorgang wird dem Provisionsservice erneut zur Prüfung vorgelegt.
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 animate-fade-in-up space-y-6">
      {/* Kopfzeile: Perspektive-Hinweis */}
      <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
        <Mail size={16} className="text-blue-600" strokeWidth={2} />
        <p className="text-sm text-blue-800">
          <span className="font-semibold">Posteingang Vermittler-Portal</span>
          <span className="text-blue-600 ml-2">— {vorgaenge.length} neue {vorgaenge.length === 1 ? 'Nachricht' : 'Nachrichten'} vom Provisionsservice</span>
        </p>
      </div>

      {/* Vermittler-Perspektive: Profilkopf */}
      <div className="card-base p-5">
        <div className="flex items-start gap-4">
          {aktuellerVorgang.foto ? (
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-slate-200 shrink-0">
              <img src={aktuellerVorgang.foto} alt={aktuellerVorgang.vermittler} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center shrink-0">
              <User size={30} className="text-slate-400" strokeWidth={1.5} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
              Angemeldet als Vermittler
            </div>
            <p className="text-lg font-semibold text-slate-800">{aktuellerVorgang.vermittler}</p>
            <p className="text-sm text-slate-500">{aktuellerVorgang.vermittlerNr} · {aktuellerVorgang.agentur}</p>
            <p className="text-xs text-slate-400 mt-0.5">{aktuellerVorgang.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation bei mehreren Nachrichten */}
      {vorgaenge.length > 1 && (
        <div className="card-base p-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Ihre Nachrichten</p>
          <div className="flex flex-wrap gap-2">
            {vorgaenge.map(v => (
              <button
                key={v.id}
                type="button"
                onClick={() => setActiveId(v.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                  v.id === activeId
                    ? 'bg-blue-50 border-blue-300 text-blue-700 font-medium'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <FileText size={12} />
                <span className="font-mono">{v.id}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Status-Banner */}
      <div className={`rounded-lg border p-4 flex items-start gap-3 ${
        isPositiv
          ? 'bg-emerald-50 border-emerald-200'
          : statusLabel === 'Abgelehnt'
            ? 'bg-red-50 border-red-200'
            : 'bg-amber-50 border-amber-200'
      }`}>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
          isPositiv ? 'bg-emerald-100' : statusLabel === 'Abgelehnt' ? 'bg-red-100' : 'bg-amber-100'
        }`}>
          <CheckCircle size={20} className={isPositiv ? 'text-emerald-600' : statusLabel === 'Abgelehnt' ? 'text-red-600' : 'text-amber-600'} strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1">
          <p className={`text-sm font-semibold ${
            isPositiv ? 'text-emerald-800' : statusLabel === 'Abgelehnt' ? 'text-red-800' : 'text-amber-800'
          }`}>
            Ihr Vorgang <span className="font-mono">{aktuellerVorgang.id}</span> wurde {statusLabel.toLowerCase()}.
          </p>
          <p className={`text-xs mt-0.5 ${
            isPositiv ? 'text-emerald-700' : statusLabel === 'Abgelehnt' ? 'text-red-700' : 'text-amber-700'
          }`}>
            Der Provisionsservice hat Ihre Reklamation bearbeitet. Die vollständige Antwort finden Sie unten.
          </p>
        </div>
      </div>

      {/* Vorgangsdaten (Zusammenfassung) */}
      <div className="card-base p-5">
        <h3 className="text-sm font-semibold text-slate-800 mb-3">Ihre Reklamation</h3>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
          <InfoRow label="Vorgangsnummer" value={aktuellerVorgang.id} mono />
          <InfoRow label="Eingang" value={formatDatumDe(aktuellerVorgang.eingangsdatum)} />
          <InfoRow label="VS-Nr." value={aktuellerVorgang.vsNummer} mono />
          <InfoRow label="VN" value={aktuellerVorgang.vnName} />
          <InfoRow label="Sparte" value={aktuellerVorgang.sparte} />
          <InfoRow label="Typ" value={aktuellerVorgang.typ} />
          <InfoRow label="Erwartet" value={formatEur(aktuellerVorgang.erwartet)} />
          <InfoRow label="Erhalten" value={formatEur(aktuellerVorgang.erhalten)} />
        </dl>
      </div>

      {/* E-Mail-Antwort vom Provisionsservice */}
      <div className="card-base overflow-hidden">
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
          <Mail size={16} className="text-slate-500" strokeWidth={1.75} />
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            E-Mail vom Provisionsservice
          </span>
        </div>
        <div className="p-5">
          <div className="mb-3 pb-3 border-b border-slate-100 text-xs space-y-0.5">
            <p><span className="text-slate-400">Von:</span> <span className="text-slate-700">Lisa Neumann &lt;provisionsservice@beispiel-versicherung.de&gt;</span></p>
            <p><span className="text-slate-400">An:</span> <span className="text-slate-700">{aktuellerVorgang.vermittler} &lt;{aktuellerVorgang.email}&gt;</span></p>
            <p><span className="text-slate-400">Betreff:</span> <span className="text-slate-700">Ihre Reklamation {aktuellerVorgang.id}</span></p>
          </div>
          <div className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
            {aktuellerVorgang.antwortText}
          </div>
        </div>
      </div>

      {/* Antwort-Formular des Vermittlers */}
      {replyMode ? (
        <div className="card-base overflow-hidden">
          <div className="px-5 py-3 bg-blue-50 border-b border-blue-200 flex items-center gap-2">
            <Reply size={16} className="text-blue-600" strokeWidth={1.75} />
            <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
              Rückfrage an den Provisionsservice
            </span>
          </div>
          <div className="p-5 space-y-3">
            <div className="text-xs space-y-0.5">
              <p><span className="text-slate-400">Von:</span> <span className="text-slate-700">{aktuellerVorgang.vermittler} &lt;{aktuellerVorgang.email}&gt;</span></p>
              <p><span className="text-slate-400">An:</span> <span className="text-slate-700">Lisa Neumann &lt;provisionsservice@beispiel-versicherung.de&gt;</span></p>
              <p><span className="text-slate-400">Betreff:</span> <span className="text-slate-700">Re: Ihre Reklamation {aktuellerVorgang.id}</span></p>
            </div>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={10}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-y leading-relaxed"
              placeholder="Ihre Rückfrage…"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={cancelReply}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={submitReply}
                disabled={!replyText.trim()}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={13} strokeWidth={2} />
                Antwort senden
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Aktionen */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-xs text-slate-400 flex-1 min-w-[200px]">
          Nach der Kenntnisnahme verschwindet diese Nachricht aus Ihrem Posteingang.
          Sie können den Vorgang auch direkt beantworten — der Vorgang geht dann erneut an den Provisionsservice.
        </p>
        <div className="flex items-center gap-2">
          {!replyMode && (
            <button
              type="button"
              onClick={startReply}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Reply size={14} strokeWidth={2} />
              Auf Ticket antworten
            </button>
          )}
          <button
            type="button"
            onClick={() => onMarkGelesen(aktuellerVorgang.id)}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            <ChevronLeft size={14} strokeWidth={2} />
            Zur Kenntnis genommen
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, mono }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-slate-400 shrink-0">{label}</dt>
      <dd className={`text-right truncate ${mono ? 'font-mono' : ''} text-slate-700 font-medium`}>
        {value}
      </dd>
    </div>
  );
}
