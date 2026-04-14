import { useState } from 'react';
import { AlertTriangle, ChevronDown, Sparkles, Users, Send } from 'lucide-react';

// Muster-Cluster: vom KI-System erkannte Bestandsmuster. Jeder Cluster zählt
// wie viele Verträge im Gesamtbestand das Fehlerbild zeigen, wie viele davon
// bereits vom Vermittler gemeldet wurden und wie viele unbemerkt blieben —
// dieser Delta-Wert ist das eigentliche proaktive Steuerungssignal.
const MUSTER_CLUSTER = [
  {
    id: 'muster-tfrv-dynamik',
    titel: 'Fehlende Dynamik-AP auf Tarif T-FRV',
    beschreibung: 'Dynamikerhöhungen lösen auf der Tarif-Familie T-FRV keine Abschlussprovision aus. Seit Release 4.1.9 aktiv.',
    gesamtBetroffen: 5,
    gemeldet: 1,
    nichtGemeldet: 4,
    gemeldeteIds: ['RK-2026-0045'],
    beispielVermittler: ['Thomas Bergmann', 'Julia Westphal', 'Markus Dorn', 'Sabine Krämer'],
    schaetzSumme: 1840.00,
  },
  {
    id: 'muster-pkv-bap',
    titel: 'PKV-Bestandsprovision nach BAP zu niedrig',
    beschreibung: 'Seit Release 4.2.1 werden PKV-Bestandsprovisionen nach Beitragsanpassung auf Basis des Alt-Beitrags und mit Standard-Satz (statt Individualsatz) berechnet.',
    gesamtBetroffen: 7,
    gemeldet: 1,
    nichtGemeldet: 6,
    gemeldeteIds: ['RK-2026-0046'],
    beispielVermittler: ['Claudia Weber', 'Dr. Stefan Kuhn', 'Anna Lipp', 'Benedikt Ostermeier', 'Ingrid Falk', 'Paul Rehberg'],
    schaetzSumme: 1640.40,
  },
];

const fmtEur = (val) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(val);

export default function PriorisierungsBanner({ count, onShowDetails }) {
  const [expanded, setExpanded] = useState(false);
  const [benachrichtigt, setBenachrichtigt] = useState({});

  if (!count || count === 0) return null;

  const gesamtNichtGemeldet = MUSTER_CLUSTER.reduce((s, c) => s + c.nichtGemeldet, 0);

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg animate-fade-in overflow-hidden">
      {/* Kopfzeile */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
            <AlertTriangle size={18} className="text-amber-600" strokeWidth={2} />
          </div>
          <div>
            <p className="text-sm font-medium text-amber-800">
              {count} {count === 1 ? 'Vorgang' : 'Vorgänge'} mit erkannten Auffälligkeiten
              <span className="ml-2 text-xs font-normal text-amber-700">
                · {MUSTER_CLUSTER.length} systemische Muster, {gesamtNichtGemeldet} weitere, noch nicht gemeldete Verträge
              </span>
            </p>
            <p className="text-xs text-amber-600">
              Proaktive Steuerung möglich: Vermittler mit identischem Fehlerbild können vor Eingang einer Reklamation informiert werden.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onShowDetails}
            className="px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors whitespace-nowrap"
          >
            Vorgänge filtern
          </button>
          <button
            onClick={() => setExpanded(v => !v)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-amber-800 bg-white border border-amber-300 hover:bg-amber-50 rounded-lg transition-colors whitespace-nowrap"
          >
            Musteranalyse
            <ChevronDown
              size={14}
              className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
              strokeWidth={2}
            />
          </button>
        </div>
      </div>

      {/* Muster-Cluster (ausklappbar) */}
      {expanded && (
        <div className="border-t border-amber-200 bg-white/60 p-4 space-y-3">
          <div className="flex items-center gap-1.5 text-xs text-amber-800 mb-1">
            <Sparkles size={13} strokeWidth={2} />
            <span className="font-medium">KI-Mustererkennung im Bestand</span>
          </div>

          {MUSTER_CLUSTER.map(cluster => {
            const benachr = benachrichtigt[cluster.id];
            const anteilGemeldet = (cluster.gemeldet / cluster.gesamtBetroffen) * 100;

            return (
              <div
                key={cluster.id}
                className="border border-amber-200 rounded-lg bg-white p-3"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800">{cluster.titel}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{cluster.beschreibung}</p>
                  </div>
                  <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-[11px] font-medium">
                    <Users size={11} />
                    {cluster.gesamtBetroffen} Verträge
                  </span>
                </div>

                {/* Balken: gemeldet vs. nicht gemeldet */}
                <div className="mb-2">
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden flex">
                    <div
                      className="bg-emerald-500"
                      style={{ width: `${anteilGemeldet}%` }}
                      title={`${cluster.gemeldet} gemeldet`}
                    />
                    <div
                      className="bg-red-400"
                      style={{ width: `${100 - anteilGemeldet}%` }}
                      title={`${cluster.nichtGemeldet} nicht gemeldet`}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[11px]">
                    <span className="text-emerald-700">
                      <span className="font-semibold">{cluster.gemeldet}</span> gemeldet
                      {cluster.gemeldeteIds.length > 0 && (
                        <span className="text-slate-400 ml-1">
                          ({cluster.gemeldeteIds.join(', ')})
                        </span>
                      )}
                    </span>
                    <span className="text-red-600 font-semibold">
                      {cluster.nichtGemeldet} noch nicht gemeldet
                    </span>
                  </div>
                </div>

                {/* Geschätzter Schaden + betroffene Vermittler */}
                <div className="flex items-end justify-between gap-3">
                  <div className="text-[11px] text-slate-500">
                    <p>
                      Geschätzte Nachbuchungssumme (nicht gemeldet): <span className="font-mono font-semibold text-red-600">{fmtEur(cluster.schaetzSumme)}</span>
                    </p>
                    <p className="mt-0.5">
                      Betroffene Vermittler (nicht gemeldet): {cluster.beispielVermittler.slice(0, 3).join(', ')}
                      {cluster.beispielVermittler.length > 3 && ` +${cluster.beispielVermittler.length - 3} weitere`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBenachrichtigt(prev => ({ ...prev, [cluster.id]: true }))}
                    disabled={benachr}
                    className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      benachr
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                        : 'bg-slate-800 text-white hover:bg-slate-700'
                    }`}
                  >
                    <Send size={12} strokeWidth={2} />
                    {benachr ? 'Benachrichtigt' : `${cluster.nichtGemeldet} proaktiv informieren`}
                  </button>
                </div>
              </div>
            );
          })}

          <p className="text-[11px] text-slate-400 pt-1">
            Hinweis: Die Musteranalyse basiert auf einem Abgleich der gemeldeten Auffälligkeiten mit dem Gesamtbestand. Zahlen sind in der Demo-Umgebung synthetisch.
          </p>
        </div>
      )}
    </div>
  );
}
