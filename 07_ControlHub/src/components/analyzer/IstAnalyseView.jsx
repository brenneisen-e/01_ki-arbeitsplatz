import { useState } from 'react';
import {
  ListChecks, KeyRound, Cpu, Clock, ArrowRight, ShieldCheck, Layers,
  ChevronRight, Target, AlertTriangle, ScanSearch, Building2, Workflow, Shield,
  PlayCircle, ClipboardCheck,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useOptimierung } from '../../hooks/useOptimierung';
import {
  ART_RAMPE, AUSFUEHRUNG_MAP, KONTROLL_TURNUS_LABEL,
  bucketAufwand, groessterHebel, SCHWERE_MAP, DIMENSIONEN,
} from '../../data/istAnalyse';
import BereichsChart from './BereichsChart';
import AufwandHerleitung from './AufwandHerleitung';

const nf0 = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 });
const nf1 = new Intl.NumberFormat('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

function StatKachel({ icon: Icon, label, wert, einheit, zusatz, betonen }) {
  return (
    <div className="card-base p-4">
      <div className="flex items-center gap-2 text-slate-500 mb-2">
        <Icon size={14} strokeWidth={1.75} />
        <span className="text-[11.5px] font-semibold">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className={betonen ? 'text-[30px] font-bold leading-none' : 'text-[26px] font-bold leading-none text-slate-800'}
              style={betonen ? { color: 'var(--mode-primary, #0F4D2A)' } : undefined}>
          {wert}
        </span>
        {einheit && <span className="text-[13px] text-slate-400 font-semibold">{einheit}</span>}
      </div>
      {zusatz && <div className="text-[11.5px] text-slate-500 mt-1.5 leading-snug">{zusatz}</div>}
    </div>
  );
}

/**
 * Abdeckung über die drei Dimensionen Bereich, Prozesse und Risiko.
 * Je Dimension ein Meter — eine Serie, deshalb keine Legende; der ungefüllte
 * Track ist eine hellere Stufe derselben Hue.
 */
function DimensionsAbdeckung({ gesamt, bereiche }) {
  const bereicheOhneLuecke = bereiche.filter(b => b.risikenOhneKontrolle === 0 && b.prozesseOhneSchluesselkontrolle === 0).length;

  const werte = [
    {
      id: 'bereich',
      icon: Building2,
      grad: Math.round((bereicheOhneLuecke / bereiche.length) * 100),
      hauptzahl: `${nf0.format(bereicheOhneLuecke)} von ${nf0.format(bereiche.length)}`,
      einheit: 'Prozessbereichen vollständig abgedeckt',
      detail: `${nf0.format(gesamt.kontrollen)} Kontrollen verteilen sich über ${bereiche.length} Bereiche — ${bereiche[0].kurz} trägt allein ${Math.round((bereiche[0].kontrollen / gesamt.kontrollen) * 100)} %.`,
    },
    {
      id: 'prozess',
      icon: Workflow,
      grad: gesamt.prozessabdeckung,
      hauptzahl: `${nf0.format(gesamt.prozesseMitSchluessel)} von ${nf0.format(gesamt.prozesse)}`,
      einheit: 'Prozessen mit Schlüsselkontrolle',
      detail: `${nf0.format(gesamt.prozesse - gesamt.prozesseMitSchluessel)} Prozesse sind beschrieben, aber ohne prüfungsfest gewidmete Kontrolle.`,
    },
    {
      id: 'risiko',
      icon: Shield,
      grad: gesamt.risikoabdeckung,
      hauptzahl: `${nf0.format(gesamt.risikenMitKontrolle)} von ${nf0.format(gesamt.risiken)}`,
      einheit: 'Risiken kontrolliert',
      detail: `${nf0.format(gesamt.risikoabdeckungSchluessel)} % der Risiken tragen eine Schlüsselkontrolle; ${nf0.format(gesamt.risikenOhneKontrolle)} Risiken haben gar keine.`,
    },
  ];

  return (
    <div className="card-base">
      <div className="px-5 py-4 border-b border-slate-200">
        <h3 className="text-[15px] font-bold tracking-tight">Abdeckung über drei Dimensionen</h3>
        <p className="text-[12px] text-slate-500 mt-0.5">
          Ein Kontrollbestand kann in der Summe vollständig wirken und trotzdem einzelne Prozesse oder Risiken unbesetzt lassen.
        </p>
      </div>
      <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
        {werte.map(w => {
          const Icon = w.icon;
          const dim = DIMENSIONEN.find(d => d.id === w.id);
          const kritisch = w.grad < 90;
          const fuellung = kritisch ? '#B45309' : '#1D7B3F';
          const track = kritisch ? '#F5E3C7' : '#D6EDE0';
          return (
            <div key={w.id} className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon size={14} className="text-slate-400" strokeWidth={1.75} />
                <span className="text-[11.5px] font-semibold text-slate-600">Dimension {dim.label}</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[26px] font-bold leading-none" style={{ color: fuellung }}>{w.grad}</span>
                <span className="text-[13px] text-slate-400 font-semibold">%</span>
              </div>
              <div className="text-[12px] text-slate-600 mt-1">
                <span className="font-semibold">{w.hauptzahl}</span> {w.einheit}
              </div>
              <div className="mt-2.5 rounded-full overflow-hidden" style={{ height: 8, background: track }}>
                <div className="h-full rounded-full" style={{ width: `${w.grad}%`, minWidth: 3, background: fuellung }} />
              </div>
              <p className="text-[11.5px] text-slate-500 mt-2 leading-snug">{w.detail}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** WhiteSpots — wo der Bestand die Zielstruktur nicht trägt. */
function WhiteSpots({ whitespots }) {
  const DIM_ICON = { bereich: Building2, prozess: Workflow, risiko: Shield };
  return (
    <div className="card-base">
      <div className="px-5 py-4 border-b border-slate-200 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h3 className="text-[15px] font-bold tracking-tight flex items-center gap-2">
            <ScanSearch size={16} style={{ color: 'var(--mode-primary, #0F4D2A)' }} /> WhiteSpots
          </h3>
          <p className="text-[12px] text-slate-500 mt-0.5">
            Die wesentlichen Stellen, an denen der Bestand die Zielstruktur nicht trägt — nicht zu viel, sondern zu wenig Kontrolle.
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {Object.entries(SCHWERE_MAP).sort((a, b) => b[1].rang - a[1].rang).map(([id, s]) => {
            const n = whitespots.filter(w => w.schwere === id).length;
            if (!n) return null;
            return (
              <span key={id} className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wide"
                    style={{ background: s.bg, color: s.color }}>
                {n}× {s.label}
              </span>
            );
          })}
        </div>
      </div>
      <div className="divide-y divide-slate-100">
        {whitespots.map(w => {
          const s = SCHWERE_MAP[w.schwere];
          const Icon = DIM_ICON[w.dimension] || Shield;
          return (
            <div key={w.id} className="px-5 py-3.5 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                   style={{ background: s.bg, color: s.color }}>
                <Icon size={17} strokeWidth={1.8} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                        style={{ background: s.bg, color: s.color }}>{s.label}</span>
                  <span className="chip">{w.bereich}</span>
                  <span className="chip">Dimension {DIMENSIONEN.find(d => d.id === w.dimension)?.label}</span>
                </div>
                <div className="text-[13.5px] font-bold mt-1.5 leading-snug">{w.titel}</div>
                <p className="text-[12.5px] text-slate-600 mt-1 leading-relaxed">{w.beschreibung}</p>
                <p className="text-[12px] text-slate-500 mt-1.5 leading-relaxed italic">{w.folge}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function IstAnalyseView({ onViewChange }) {
  const {
    optimierung,
    istAnalyse, istAnalyseStandard,
    annahmen, setAnnahme, setAnnahmeDetail, resetAnnahmen, annahmenGeaendert,
  } = useOptimierung();
  const [aktiverBereich, setAktiverBereich] = useState(null);

  const { bereiche, gesamt, whitespots } = istAnalyse;
  const maxKontrollen = Math.max(...bereiche.map(b => b.kontrollen));
  const maxPt = Math.max(...bereiche.map(b => b.pt));
  const hebel = groessterHebel(bereiche);
  const detail = bereiche.find(b => b.id === aktiverBereich);

  return (
    <div className="space-y-5 animate-fade-in-up">
      {/* Kopf */}
      <div className="card-base p-5 hero-dots">
        <div className="flex items-start gap-4 flex-wrap">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-white"
               style={{ background: 'var(--mode-gradient, linear-gradient(135deg,#0F4D2A,#1D7B3F))' }}>
            <Layers size={22} strokeWidth={1.75} />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold tracking-tight">Analyzer &mdash; Bestandsaufnahme des IKS</h1>
            <p className="text-[13.5px] text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Wo im Haus liegen wie viele Kontrollen, wie vollständig decken sie Bereiche, Prozesse und Risiken ab, wo bleiben
              WhiteSpots — und was kosten Durchführung und Wirksamkeitsnachweis in Personentagen.
              Erst auf dieser Basis setzt der Optimizer an.
            </p>
            <div className="mt-2.5 text-[12px] text-slate-500">
              Inventar: <span className="font-semibold text-slate-700">{optimierung?.quelldokument?.name}</span>
              {' · '}{nf0.format(gesamt.prozesse)} Prozesse in {bereiche.length} Bereichen
              {optimierung?.vorgaben?.length > 0 && (
                <> · <span className="font-semibold text-slate-700">{optimierung.vorgaben.length} IKS-Vorgaben</span> berücksichtigt</>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Kennzahlen */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatKachel
          icon={ListChecks} label="Kontrollen gesamt" wert={nf0.format(gesamt.kontrollen)} betonen
          zusatz={`über ${nf0.format(gesamt.risiken)} Risiken · ${nf1.format(gesamt.kontrollenJeRisiko)} Kontrollen je Risiko`}
        />
        <StatKachel
          icon={KeyRound} label="Schlüsselkontrollen" wert={nf0.format(gesamt.schluessel)}
          zusatz={`${Math.round((gesamt.schluessel / gesamt.kontrollen) * 100)} % des Bestands — nur diese werden unabhängig geprüft`}
        />
        <StatKachel
          icon={Cpu} label="Automatisierungsgrad" wert={nf0.format(gesamt.automatisierungsgrad)} einheit="%"
          zusatz={`${nf0.format(gesamt.manuell)} Kontrollen laufen weiterhin manuell oder rein systemgestützt`}
        />
        <StatKachel
          icon={Clock} label="Aufwand p. a." wert={nf0.format(gesamt.pt)} einheit="PT"
          zusatz={`${nf0.format(gesamt.durchfuehrungPT)} PT Durchführung + ${nf0.format(gesamt.testingPT)} PT Testing — rechnerisch ${nf1.format(gesamt.fte)} Vollzeitkräfte`}
        />
      </div>

      {/* Abdeckung über drei Dimensionen */}
      <DimensionsAbdeckung gesamt={gesamt} bereiche={bereiche} />

      {/* Verteilung je Prozessbereich */}
      <BereichsChart
        bereiche={bereiche} maxKontrollen={maxKontrollen} maxPt={maxPt}
        aktiverBereich={aktiverBereich} onBereichClick={setAktiverBereich}
      />

      {/* Detail eines ausgewählten Bereichs */}
      {detail && (
        <div className="card-base p-5 animate-fade-in-up">
          <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
            <div className="min-w-0">
              <h3 className="text-[15px] font-bold tracking-tight">{detail.name}</h3>
              <p className="text-[12.5px] text-slate-600 mt-1 max-w-2xl leading-relaxed">{detail.beschreibung}</p>
              <div className="flex items-center gap-1.5 flex-wrap mt-2">
                {detail.regulatorik.map(r => <span key={r} className="chip"><ShieldCheck size={11} /> {r}</span>)}
              </div>
            </div>
            <button onClick={() => setAktiverBereich(null)} className="text-[11.5px] text-slate-500 hover:text-slate-800 shrink-0">
              Schließen
            </button>
          </div>

          <div className="grid sm:grid-cols-3 gap-2.5 mb-3.5">
            {[
              { label: 'Prozesse mit Schlüsselkontrolle', wert: `${detail.prozesseMitSchluesselkontrolle} von ${detail.prozesse}`, grad: detail.prozessabdeckung },
              { label: 'Risiken kontrolliert', wert: `${detail.risikenMitKontrolle} von ${detail.risiken}`, grad: detail.risikoabdeckung },
              { label: 'Risiken mit Schlüsselkontrolle', wert: `${detail.risikenMitSchluesselkontrolle} von ${detail.risiken}`, grad: detail.risikoabdeckungSchluessel },
            ].map(k => (
              <div key={k.label} className="rounded-lg border border-slate-200 p-2.5">
                <div className="text-[10.5px] font-semibold uppercase tracking-wide text-slate-400">{k.label}</div>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-[15px] font-bold tabular-nums">{k.wert}</span>
                  <span className={clsx('text-[11.5px] font-semibold', k.grad < 90 ? 'text-amber-700' : 'text-emerald-700')}>
                    {k.grad} %
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl p-3 mb-3.5 flex items-start gap-2.5"
               style={{ background: 'color-mix(in srgb, var(--mode-primary, #0F4D2A) 6%, white)' }}>
            <AlertTriangle size={15} className="shrink-0 mt-0.5" style={{ color: 'var(--mode-primary, #0F4D2A)' }} />
            <p className="text-[12.5px] text-slate-700 leading-relaxed">{detail.befund}</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px]">
              <thead>
                <tr className="text-left text-[10.5px] uppercase tracking-wider text-slate-400 border-b border-slate-200">
                  <th className="py-2 pr-3 font-semibold">Ausführungsart</th>
                  <th className="py-2 pr-3 font-semibold">Turnus</th>
                  <th className="py-2 pr-3 font-semibold text-right">Kontrollen</th>
                  <th className="py-2 pr-3 font-semibold text-right">davon Schlüssel</th>
                  <th className="py-2 pr-3 font-semibold text-right">Durchführung</th>
                  <th className="py-2 font-semibold text-right">Testing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {detail.buckets.map((b, i) => {
                  const a = bucketAufwand(b, annahmen);
                  return (
                    <tr key={i}>
                      <td className="py-2 pr-3">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: ART_RAMPE[b.art] }} />
                          {AUSFUEHRUNG_MAP[b.art]?.label}
                        </span>
                      </td>
                      <td className="py-2 pr-3 text-slate-600">{KONTROLL_TURNUS_LABEL[b.turnus]}</td>
                      <td className="py-2 pr-3 text-right tabular-nums font-semibold">{nf0.format(b.anzahl)}</td>
                      <td className="py-2 pr-3 text-right tabular-nums text-slate-600">{nf0.format(b.schluessel)}</td>
                      <td className="py-2 pr-3 text-right tabular-nums">{nf1.format(a.durchfuehrung.gesamtStd / annahmen.stundenProPT)} PT</td>
                      <td className="py-2 text-right tabular-nums">{nf1.format(a.testing.gesamtStd / annahmen.stundenProPT)} PT</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-200 font-semibold">
                  <td className="py-2 pr-3" colSpan={2}>Summe {detail.kurz}</td>
                  <td className="py-2 pr-3 text-right tabular-nums">{nf0.format(detail.kontrollen)}</td>
                  <td className="py-2 pr-3 text-right tabular-nums">{nf0.format(detail.schluessel)}</td>
                  <td className="py-2 pr-3 text-right tabular-nums" style={{ color: 'var(--mode-primary, #0F4D2A)' }}>
                    {nf0.format(detail.durchfuehrungPT)} PT
                  </td>
                  <td className="py-2 text-right tabular-nums" style={{ color: 'var(--mode-primary, #0F4D2A)' }}>
                    {nf0.format(detail.testingPT)} PT
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* WhiteSpots */}
      <WhiteSpots whitespots={whitespots} />

      {/* Herleitung des Aufwands */}
      <AufwandHerleitung
        istAnalyse={istAnalyse} istAnalyseStandard={istAnalyseStandard}
        annahmen={annahmen} setAnnahme={setAnnahme} setAnnahmeDetail={setAnnahmeDetail}
        resetAnnahmen={resetAnnahmen} annahmenGeaendert={annahmenGeaendert}
      />

      {/* Befunde je Bereich */}
      <div className="card-base">
        <div className="px-5 py-4 border-b border-slate-200">
          <h3 className="text-[15px] font-bold tracking-tight">Befund je Prozessbereich</h3>
          <p className="text-[12px] text-slate-500 mt-0.5">Was die Zahlen fachlich bedeuten — sortiert nach Bestandsgröße.</p>
        </div>
        <div className="divide-y divide-slate-100">
          {bereiche.map(b => (
            <button key={b.id} onClick={() => setAktiverBereich(aktiverBereich === b.id ? null : b.id)}
                    className="w-full px-5 py-3 flex items-start gap-3 text-left hover:bg-slate-50 transition-colors">
              <div className="w-1.5 h-1.5 rounded-full mt-2 shrink-0"
                   style={{ background: ART_RAMPE[b.automatisierungsgrad > 50 ? 'automatisiert' : 'manuell'] }} />
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold">{b.name}</div>
                <p className="text-[12px] text-slate-600 mt-0.5 leading-relaxed">{b.befund}</p>
              </div>
              <div className="text-right shrink-0 hidden sm:block">
                <div className="text-[12.5px] font-semibold tabular-nums">{nf0.format(b.pt)} PT</div>
                <div className="text-[11px] text-slate-400 tabular-nums">{nf0.format(b.automatisierungsgrad)} % autom.</div>
              </div>
              <ChevronRight size={15} className="text-slate-300 shrink-0 mt-1" />
            </button>
          ))}
        </div>
      </div>

      {/* Überleitung zum Optimizer */}
      <div className="card-base p-5" style={{ background: 'color-mix(in srgb, var(--mode-primary, #0F4D2A) 5%, white)' }}>
        <div className="flex items-start gap-4 flex-wrap">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white"
               style={{ background: 'var(--mode-gradient, linear-gradient(135deg,#0F4D2A,#1D7B3F))' }}>
            <Target size={20} strokeWidth={1.75} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[14.5px] font-bold">Größter Hebel: {hebel.name}</div>
            <p className="text-[12.5px] text-slate-600 mt-1 max-w-2xl leading-relaxed">
              {nf0.format(hebel.kontrollen)} Kontrollen, davon {nf0.format(100 - hebel.automatisierungsgrad)} % manuell oder rein
              systemgestützt, bei {nf0.format(hebel.pt)} PT Aufwand im Jahr
              ({nf0.format(hebel.durchfuehrungPT)} Durchführung, {nf0.format(hebel.testingPT)} Testing).
              Der Optimizer zeigt konkret, welche Kontrollen entfallen, automatisiert oder in einem niedrigeren Turnus
              geführt werden können — bei gleichbleibender Risikoabdeckung.
            </p>
          </div>
          <button onClick={() => onViewChange?.('optimizer')}
                  className="px-4 py-2.5 rounded-xl text-white text-[14px] font-semibold inline-flex items-center gap-2 transition-all hover:brightness-110 shrink-0"
                  style={{ background: 'var(--mode-gradient, linear-gradient(135deg,#0F4D2A,#1D7B3F))' }}>
            Weiter zum Optimizer <ArrowRight size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}
