import { FileText } from 'lucide-react';
import StatusBadge from './StatusBadge';
import KiAnalysePanel from './KiAnalysePanel';
import AntwortEntwurf from './AntwortEntwurf';

export default function VorgangDetail({ vorgang, analyse, analyseLoading, onStatusChange }) {
  if (!vorgang) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400 p-12">
        <div className="text-center">
          <FileText size={40} className="mx-auto mb-3 text-slate-300" strokeWidth={1.5} />
          <p className="text-sm">Wählen Sie einen Vorgang aus der Liste</p>
        </div>
      </div>
    );
  }

  const formatEur = (val) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(val);

  return (
    <div className="space-y-4 animate-fade-in-up">
      {/* Bereich A: Vorgangsdaten */}
      <div className="card-base p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-800">Vorgangsdaten</h3>
          <StatusBadge status={vorgang.status} />
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
          <DetailRow label="Vorgangsnummer" value={vorgang.id} mono />
          <DetailRow label="Eingangsdatum" value={vorgang.eingangsdatum} />
          <DetailRow label="Vermittler" value={`${vorgang.vermittler} (${vorgang.vermittlerNr})`} />
          <DetailRow label="Agentur" value={vorgang.agentur} />
          <DetailRow label="E-Mail" value={vorgang.email} />
          <DetailRow label="VS-Nr." value={vorgang.vsNummer} mono />
          <DetailRow label="Sparte" value={vorgang.sparte} />
          <DetailRow label="VN" value={vorgang.vnName} />
          <DetailRow label="Reklamationstyp" value={vorgang.typ} />
          <DetailRow label="Vertragsbeginn" value={vorgang.vertragsbeginn} />
          <DetailRow label="Monatsbeitrag" value={`${vorgang.monatsbeitrag?.toFixed(2)} EUR`} />
          <DetailRow label="Zeitraum" value={`${vorgang.zeitraumVon} – ${vorgang.zeitraumBis}`} />
          <DetailRow label="Erwartet" value={formatEur(vorgang.erwartet)} />
          <DetailRow label="Erhalten" value={formatEur(vorgang.erhalten)} />
          <div className="col-span-2">
            <DetailRow
              label="Differenz"
              value={formatEur(vorgang.differenz)}
              highlight={vorgang.differenz !== 0}
              neutral={vorgang.differenz === 0}
            />
          </div>
        </div>
        {vorgang.beschreibung && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <p className="text-xs text-slate-400 mb-1">Beschreibung / Begründung:</p>
            <p className="text-xs text-slate-600 leading-relaxed">{vorgang.beschreibung}</p>
          </div>
        )}
      </div>

      {/* Bereich B: KI-Analyse */}
      <KiAnalysePanel
        vorgang={vorgang}
        analyse={analyse}
        loading={analyseLoading}
      />

      {/* Bereich C: Antwort-Entwurf */}
      {analyse && !analyseLoading && (
        <AntwortEntwurf
          antwortText={analyse.antwort_entwurf}
          onStatusChange={(newStatus) => onStatusChange(vorgang.id, newStatus)}
        />
      )}
    </div>
  );
}

function DetailRow({ label, value, mono, highlight, neutral }) {
  const textClass = neutral
    ? 'font-semibold text-slate-500'
    : highlight
      ? 'font-semibold text-red-600'
      : 'text-slate-700 font-medium';
  return (
    <div className="flex justify-between gap-2">
      <span className="text-slate-400 shrink-0">{label}</span>
      <span className={`text-right truncate ${mono ? 'font-mono' : ''} ${textClass}`}>
        {value}
      </span>
    </div>
  );
}
