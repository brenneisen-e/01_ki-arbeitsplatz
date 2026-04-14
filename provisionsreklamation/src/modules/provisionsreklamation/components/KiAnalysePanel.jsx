import { clsx } from 'clsx';
import { Sparkles, AlertTriangle, CheckCircle, XCircle, Shield, Info } from 'lucide-react';
import { DEMO_VERTRAGSDATEN } from '../data/demoData';

const AMPEL_CONFIG = {
  gruen: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', icon: CheckCircle, label: 'Berechtigt' },
  gelb: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: AlertTriangle, label: 'Klärungsbedarf' },
  rot: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: XCircle, label: 'Unbegründet' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', icon: AlertTriangle, label: 'Systemischer Fehler' },
  blau: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: Info, label: 'Fachliche Anfrage' },
};

export default function KiAnalysePanel({ vorgang, analyse, loading }) {
  if (loading) {
    return (
      <div className="card-base p-6">
        <div className="flex items-center gap-3">
          <Sparkles size={18} className="text-blue-400 animate-pulse-subtle" />
          <span className="text-sm text-slate-500">KI analysiert den Vorgang...</span>
        </div>
        <div className="mt-4 space-y-3">
          <div className="h-4 bg-slate-100 rounded animate-pulse w-3/4" />
          <div className="h-4 bg-slate-100 rounded animate-pulse w-1/2" />
          <div className="h-4 bg-slate-100 rounded animate-pulse w-5/6" />
        </div>
      </div>
    );
  }

  if (!analyse) return null;

  const { provisionsberechnung, bewertung } = analyse;
  const ampel = AMPEL_CONFIG[bewertung.ampel] || AMPEL_CONFIG.gelb;
  const AmpelIcon = ampel.icon;
  const vertragsdaten = DEMO_VERTRAGSDATEN[vorgang.vsNummer];

  const formatEur = (val) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(val);

  return (
    <div className="space-y-4 animate-fade-in-up">
      {/* Demo-Hinweis */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg">
        <Sparkles size={14} className="text-slate-400" />
        <span className="text-xs text-slate-400">Demo-Modus: KI-Analyse aus Beispieldaten geladen.</span>
      </div>

      {/* B.1 — Vertragsdaten */}
      {vertragsdaten && (
        <div className="card-base p-4">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Shield size={12} />
            Vertragsdaten
          </h4>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
            <VDRow label="VS-Nr." value={vorgang.vsNummer} />
            <VDRow label="Produkt" value={vertragsdaten.produkt} />
            <VDRow label="Tarif" value={vertragsdaten.tarif} />
            <VDRow label="VN" value={vorgang.vnName} />
            <VDRow label="Vertragsbeginn" value={vorgang.vertragsbeginn} />
            <VDRow label="Monatsbeitrag" value={`${vorgang.monatsbeitrag.toFixed(2)} EUR`} />
            <VDRow label="Status" value={vertragsdaten.vertragsstatus} />
            <VDRow label="Dynamik" value={vertragsdaten.dynamik} />
            <VDRow label="Vermittler" value={`${vorgang.vermittler} (${vorgang.vermittlerNr})`} />
            <VDRow label="Courtage" value={vertragsdaten.courtagevereinbarung} />
            <VDRow label="AP-Satz" value={vertragsdaten.apSatz} />
            <VDRow label="BP-Satz" value={vertragsdaten.bpSatz} />
            <VDRow label="Stornohaftung" value={vertragsdaten.stornohaftungszeit} />
            <VDRow label="Stornoreserve" value={vertragsdaten.stornoreserveEinbehalt} />
          </div>
        </div>
      )}

      {/* B.2 — Provisionsberechnung SOLL vs. IST */}
      <div className="card-base p-4">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Provisionsberechnung (SOLL vs. IST)
        </h4>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-1.5 text-slate-500 font-medium">Position</th>
              <th className="text-right py-1.5 text-slate-500 font-medium">SOLL</th>
              <th className="text-right py-1.5 text-slate-500 font-medium">IST</th>
              <th className="text-right py-1.5 text-slate-500 font-medium">Differenz</th>
            </tr>
          </thead>
          <tbody>
            {provisionsberechnung.positionen.map((pos, i) => (
              <tr key={i} className="border-b border-slate-100">
                <td className="py-1.5 text-slate-700">{pos.position}</td>
                <td className="py-1.5 text-right font-mono text-slate-600">{formatEur(pos.soll)}</td>
                <td className="py-1.5 text-right font-mono text-slate-600">{formatEur(pos.ist)}</td>
                <td className={clsx('py-1.5 text-right font-mono font-medium', pos.differenz < 0 ? 'text-red-600' : 'text-slate-600')}>
                  {formatEur(pos.differenz)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-300">
              <td className="py-2 font-semibold text-slate-800">Gesamt</td>
              <td className="py-2 text-right font-mono font-semibold text-slate-800">{formatEur(provisionsberechnung.gesamt_soll)}</td>
              <td className="py-2 text-right font-mono font-semibold text-slate-800">{formatEur(provisionsberechnung.gesamt_ist)}</td>
              <td className={clsx('py-2 text-right font-mono font-bold', provisionsberechnung.gesamt_differenz < 0 ? 'text-red-600' : 'text-slate-800')}>
                {formatEur(provisionsberechnung.gesamt_differenz)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* B.3 — KI-Vorprüfung & Bewertung */}
      <div className={clsx('rounded-lg border p-4', ampel.bg, ampel.border)}>
        <div className="flex items-center gap-2 mb-3">
          <AmpelIcon size={18} className={ampel.text} strokeWidth={2} />
          <h4 className={clsx('text-sm font-semibold', ampel.text)}>
            Bewertung: {bewertung.titel}
          </h4>
        </div>
        <div className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
          {bewertung.analyse}
        </div>
        {bewertung.handlungsempfehlung && (
          <div className="mt-3 pt-3 border-t border-current/10">
            <p className="text-xs font-semibold text-slate-600 mb-1">Handlungsempfehlung:</p>
            <p className="text-sm text-slate-700 whitespace-pre-line">{bewertung.handlungsempfehlung}</p>
          </div>
        )}
        {bewertung.auffaelligkeit?.erkannt && (
          <div className="mt-3 pt-3 border-t border-current/10 bg-white/50 rounded p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <AlertTriangle size={14} className="text-orange-600" />
              <p className="text-xs font-semibold text-orange-700">Systemisches Muster erkannt</p>
            </div>
            <p className="text-xs text-slate-600">{bewertung.auffaelligkeit.muster}</p>
            <p className="text-xs text-slate-500 mt-1">Geschätzte Betroffene: {bewertung.auffaelligkeit.geschaetzte_betroffene}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function VDRow({ label, value }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-slate-400 shrink-0">{label}</span>
      <span className="text-slate-700 font-medium text-right truncate">{value}</span>
    </div>
  );
}
