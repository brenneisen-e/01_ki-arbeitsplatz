import { useEffect, useState } from 'react';
import {
  X, Sparkles, Calendar, Clock, MapPin, Target, User, CheckSquare,
  ListChecks, MessageSquare, FileText, Loader2, Phone, Mail,
} from 'lucide-react';
import { formatAppointmentDate, formatAppointmentTime, getSimulatedAppointment } from '../../utils/demoClock';

/**
 * TerminPrepModal
 *
 * Wird geöffnet, wenn der Berater auf die bestätigte Terminzusage klickt.
 * Liefert eine KI-gestützte Gesprächsvorbereitung mit Kontext, konkreten
 * Gesprächsbausteinen sowie To-Dos vor und nach dem Termin.
 */
export default function TerminPrepModal({ kunde, onClose }) {
  const [phase, setPhase] = useState('loading');
  const appointment = getSimulatedAppointment();

  // KI-Generierung simulieren
  useEffect(() => {
    const tmr = setTimeout(() => setPhase('ready'), 1100);
    return () => clearTimeout(tmr);
  }, []);

  // ESC zum Schließen
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl max-h-[92vh] overflow-hidden bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-slate-200 bg-gradient-to-r from-violet-50 to-indigo-50">
          <div className="flex items-start gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
              style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)' }}
            >
              <Sparkles size={22} className="text-white" strokeWidth={2} />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">KI-Gesprächsvorbereitung</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Kreditgespräch Immobilienfinanzierung · {kunde?.name || 'Kunde'}
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs">
                <span className="inline-flex items-center gap-1 text-slate-600 bg-white/80 border border-slate-200 px-2 py-0.5 rounded-full">
                  <Calendar size={11} /> {formatAppointmentDate(appointment)}
                </span>
                <span className="inline-flex items-center gap-1 text-slate-600 bg-white/80 border border-slate-200 px-2 py-0.5 rounded-full">
                  <Clock size={11} /> {formatAppointmentTime(appointment)} Uhr
                </span>
                <span className="inline-flex items-center gap-1 text-slate-600 bg-white/80 border border-slate-200 px-2 py-0.5 rounded-full">
                  <MapPin size={11} /> Filiale Gießen
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/70 transition-colors"
          >
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        {/* Body */}
        {phase === 'loading' ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 py-20 text-center">
            <Loader2 size={26} className="text-violet-600 animate-spin" />
            <div>
              <p className="text-sm font-semibold text-slate-700">KI bereitet das Gespräch vor …</p>
              <p className="text-xs text-slate-500 mt-1">
                Analysiert Stammdaten, Potenzial und bisherige Kommunikation.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Ausgangslage */}
            <SectionTitle icon={Target} label="Ausgangslage" />
            <div className="rounded-xl border border-indigo-100 bg-gradient-to-r from-violet-50 to-indigo-50 p-4 text-sm text-slate-700 leading-relaxed">
              Klaus Fischer (32) ist seit 2018 Kunde der Volksbank Mittelhessen. Er arbeitet als
              Vertriebsleiter bei der Continental AG, ist verheiratet mit Sabine und hat zwei
              Kinder (Lukas, 4 und Marie, 1). Nettohaushaltseinkommen: ca. 5.700 €/mtl.
              Die drei erkannten Signale — auslaufender KfW-Kredit, zuteilungsreifer
              Bausparvertrag und langjähriges Newsletter-Interesse — bilden einen sehr
              starken Vertriebsimpuls für ein Erstgespräch zur Immobilienfinanzierung.
            </div>

            {/* Kennzahlen */}
            <SectionTitle icon={FileText} label="Schlüssel-Kennzahlen" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <KPI label="Freie Liquidität ab 06/2026" value="840 €/mtl." accent="text-emerald-600" />
              <KPI label="Bauspar-Zuteilung (Q2/2026)" value="30.000 €" accent="text-emerald-600" />
              <KPI label="VR-Sparkonto" value="15.000 €" />
              <KPI label="Machbarer Kreditrahmen (ca.)" value="250.000 €" accent="text-indigo-600" />
            </div>

            {/* Ziele */}
            <SectionTitle icon={Target} label="Gesprächsziele" />
            <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
              <li>Immobilienwunsch konkretisieren (Region, Objekttyp, Zeitpunkt).</li>
              <li>Gemeinsames Finanzierungsmodell mit BSV-Einsatz und KfW-Förderung aufzeigen.</li>
              <li>Vertrauen durch transparente Beispielrechnung schaffen.</li>
              <li>Folgetermin (Feinbedarf + Dokumenten-Check) innerhalb von 3 Wochen setzen.</li>
            </ul>

            {/* Gesprächsleitfaden */}
            <SectionTitle icon={MessageSquare} label="Gesprächsleitfaden" />
            <div className="space-y-2">
              <LeitfadenStep
                nr={1}
                title="Warm-up & Beziehung"
                text="Kurzer Rückblick auf die letzte Chatbot-Interaktion zum Thema BSV-Zuteilung. Aktiv zuhören, familiäre Situation aufgreifen (Kinder, neue Lebensphase)."
              />
              <LeitfadenStep
                nr={2}
                title="Bedarfsanalyse"
                text="Was stellt sich Klaus konkret vor? Neubau oder Bestand? Region Gießen oder Umgebung? Zeitlicher Horizont? Welche Rolle spielt Sabine bei der Entscheidung?"
              />
              <LeitfadenStep
                nr={3}
                title="Signale spiegeln"
                text={'„Drei Dinge passen bei Ihnen gerade zusammen": KfW-Kredit läuft aus, BSV wird zuteilungsreif, Newsletter-Interesse. Dem Kunden die KI-Erkennung als Mehrwert erlebbar machen.'}
              />
              <LeitfadenStep
                nr={4}
                title="Zahlenbeispiel"
                text="Exemplarisches Szenario: 250.000 € Darlehen, 10 Jahre fest, 1,5% Tilgung, BSV als Eigenkapital, KfW-Wohneigentumsprogramm 2026. Monatsrate dem Haushaltseinkommen gegenüberstellen."
              />
              <LeitfadenStep
                nr={5}
                title="Absicherung ansprechen"
                text="Hinweis: Für eine Baufinanzierung benötigen wir eine Risikolebensversicherung. Gelegenheit, das Versicherungsbündel (R+V) gleich mitzudenken."
              />
              <LeitfadenStep
                nr={6}
                title="Nächste Schritte"
                text="Unterlagenliste übergeben, Einwilligung zur Bonitätsauskunft, Termin für Detailgespräch in 3 Wochen."
              />
            </div>

            {/* To-Dos vor dem Termin */}
            <SectionTitle icon={CheckSquare} label="To-Dos VOR dem Termin" />
            <TodoList
              items={[
                'Aktuelle KfW-Wohneigentum-Förderbedingungen recherchieren (Stand 04/2026).',
                'Exemplarische Finanzierungsrechnung (250.000 €, 10/20 J., mit + ohne BSV) vorbereiten.',
                'Schwäbisch-Hall-Zuteilungsunterlagen abrufen (Vertrag SH-BSV-332).',
                'Kurze Marktübersicht „Immobilien Gießen 2026" drucken.',
                'Einladung kalendarisch bestätigen + Tagesordnung per Mail senden.',
              ]}
            />

            {/* To-Dos nach dem Termin */}
            <SectionTitle icon={ListChecks} label="To-Dos NACH dem Termin" />
            <TodoList
              items={[
                'Gesprächsnotiz in der Kunden­akte hinterlegen (strukturiert nach Leitfaden).',
                'Individuelles Finanzierungsangebot innerhalb von 48 h versenden.',
                'Folgetermin in 3 Wochen fixieren (Dokumenten-Check + Detailangebot).',
                'Risikolebensversicherungs-Vergleich anstoßen (R+V Bündelangebot).',
                'Lead-Status im Pipeline-Board auf „Angebot" setzen.',
              ]}
            />

            {/* Mitzubringen / Kontakt */}
            <SectionTitle icon={User} label="Kontakt" />
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 bg-slate-50">
                <Phone size={14} className="text-slate-400" />
                <span className="text-slate-700">+49 641 55 44 33 22</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 bg-slate-50">
                <Mail size={14} className="text-slate-400" />
                <span className="text-slate-700">klaus.fischer@mail-demo.de</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Schließen
          </button>
          <button
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white shadow-sm"
            style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)' }}
          >
            <FileText size={14} /> Vorbereitung drucken
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ icon: Icon, label }) {
  return (
    <h4 className="flex items-center gap-2 text-xs font-semibold text-slate-600 uppercase tracking-wider">
      <Icon size={13} className="text-violet-500" />
      {label}
    </h4>
  );
}

function KPI({ label, value, accent }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
      <div className="text-[11px] text-slate-400">{label}</div>
      <div className={`text-sm font-semibold ${accent || 'text-slate-800'}`}>{value}</div>
    </div>
  );
}

function LeitfadenStep({ nr, title, text }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3">
      <div className="w-7 h-7 rounded-full bg-violet-100 text-violet-700 text-xs font-semibold flex items-center justify-center shrink-0">
        {nr}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-slate-800">{title}</div>
        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

function TodoList({ items }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
          <div className="mt-0.5 w-4 h-4 rounded border border-slate-300 bg-white shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
