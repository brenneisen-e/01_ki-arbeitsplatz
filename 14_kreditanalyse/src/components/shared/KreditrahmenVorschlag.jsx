/**
 * KreditrahmenVorschlag -- KI-Vorschlag für den maximalen Kreditbetrag im
 * Abschnitt "Kreditwunsch" (Kreditantrag der Bank und Kundenantrag).
 *
 * Rechnet mit `berechneKreditrahmen` aus Bilanz, GuV, Rating und den
 * bestehenden Verbindlichkeiten; der beantragte Betrag wird dagegen
 * gestellt, der Vorschlag lässt sich übernehmen. Die Herleitung zeigt jede
 * Zahl der Rechnung.
 */

import { useMemo, useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp, ArrowDownToLine, CalendarClock, Info } from 'lucide-react';
import { berechneKreditrahmen } from '../../utils/kreditrahmen';
import { formatCurrency, formatNumber } from '../../utils/formatters';

const STATUS = {
  'im-rahmen': { text: 'im Rahmen', cls: 'bg-[var(--tint-success)] text-emerald-700', balken: 'bg-emerald-600' },
  'am-limit': { text: 'am Limit', cls: 'bg-[var(--tint-warning)] text-amber-700', balken: 'bg-amber-600' },
  ueber: { text: 'über dem Rahmen', cls: 'bg-[var(--tint-danger)] text-red-700', balken: 'bg-red-600' },
};

const prozent = (v) => `${formatNumber(v * 100, 0)} %`;

function Zeile({ label, wert, stark, hinweis }) {
  return (
    <div className={`flex items-baseline justify-between gap-4 py-1.5 ${stark ? 'border-t border-border mt-1 pt-2' : ''}`}>
      <span className={`text-xs ${stark ? 'font-medium text-text-primary' : 'text-text-secondary'}`}>
        {label}
        {hinweis && <span className="block text-[11px] text-text-muted">{hinweis}</span>}
      </span>
      <span className={`font-mono text-xs whitespace-nowrap ${stark ? 'font-medium text-text-primary' : 'text-text-primary'}`}>{wert}</span>
    </div>
  );
}

export default function KreditrahmenVorschlag({
  company,
  betrag,
  laufzeit,
  tilgungsfrei,
  verbindlichkeiten,
  onUebernehmen,
  onLaufzeit,
  perspektive = 'bank',
}) {
  const [offen, setOffen] = useState(false);
  const kunde = perspektive === 'kunde';

  const r = useMemo(
    () => berechneKreditrahmen(company, { betrag, laufzeit, tilgungsfrei, verbindlichkeiten }),
    [company, betrag, laufzeit, tilgungsfrei, verbindlichkeiten],
  );

  if (!r) {
    return (
      <div className="rounded-xl border border-dashed border-border-strong bg-surface px-5 py-4 flex items-start gap-3">
        <Info size={16} strokeWidth={1.75} className="text-text-muted mt-0.5 shrink-0" />
        <p className="text-xs text-text-secondary">
          {kunde
            ? 'Sobald Bilanz und GuV ausgelesen sind, zeigen wir hier, bis zu welchem Betrag ein Kredit voraussichtlich darstellbar ist.'
            : 'Für den Vorschlag eines maximalen Kreditbetrags werden Bilanz und GuV benötigt. Sobald die Jahresabschlüsse vorliegen, rechnet die KI ihn hier aus.'}
        </p>
      </div>
    );
  }

  const st = STATUS[r.status];
  const skala = Math.max(r.max, r.beantragt, 1);
  const jahre = r.cashflow.werte.map((w) => w.jahr).sort();
  const zeitraum = jahre.length > 1 ? `${jahre[0]}–${jahre[jahre.length - 1]}` : String(jahre[0] || '');
  const bindendText = {
    kapitaldienst: 'begrenzt durch die Kapitaldienstfähigkeit',
    verschuldung: 'begrenzt durch die Verschuldungsgrenze',
    eigenkapital: 'begrenzt durch die Mindest-Eigenkapitalquote',
  }[r.bindend.key];
  const tilgungsMonate = r.laufzeit - r.tilgungsfrei;
  const kriterienMax = Math.max(...r.kriterien.map((k) => k.grenze), 1);

  return (
    <div className="@container rounded-xl border border-border bg-surface">
      {/* Kopf */}
      <div className="flex flex-wrap items-start justify-between gap-3 px-5 pt-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[var(--tint-ki)] flex items-center justify-center shrink-0">
            <Sparkles size={16} strokeWidth={1.75} className="text-[var(--ki)]" />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-medium text-text-primary">
              {kunde ? 'Vorläufige Einschätzung: möglicher Kreditbetrag' : 'KI-Vorschlag: maximaler Kreditbetrag'}
            </h4>
            <p className="text-xs text-text-muted mt-0.5">
              {kunde
                ? `Aus Ihren Jahresabschlüssen ${zeitraum} und den bestehenden Verbindlichkeiten`
                : `Aus Bilanz und GuV ${zeitraum}, Rating ${r.rating.klasse} (PD ${formatNumber(r.rating.pd, 2)} %) und bestehenden Verbindlichkeiten`}
            </p>
          </div>
        </div>
        {st && <span className={`text-[11px] font-medium px-2 py-1 rounded-md ${st.cls}`}>{st.text}</span>}
      </div>

      <div className="grid grid-cols-1 @3xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-5 px-5 pt-4 pb-4">
        {/* Vorschlag */}
        <div>
          <p className="text-[11px] text-text-muted">{kunde ? 'Darstellbar bis ca.' : 'Maximal darstellbar'}</p>
          <p className="font-mono text-[28px] leading-tight font-medium tracking-[-0.02em] text-text-primary">{formatCurrency(r.max)}</p>
          {r.max > 0 ? (
            <p className="text-xs text-text-secondary mt-1">
              {bindendText} · Rate ca. <span className="font-mono">{formatCurrency(r.rateMax)}</span> mtl. bei{' '}
              <span className="font-mono">{formatNumber(r.zins, 2)} %</span> über {tilgungsMonate} Tilgungsmonate
              {r.tilgungsfrei > 0 && <> nach {r.tilgungsfrei} tilgungsfreien Monaten</>}
            </p>
          ) : (
            <p className="text-xs text-red-700 mt-1">
              {r.bindend.key === 'kapitaldienst'
                ? 'Kein zusätzlicher Kapitaldienst tragbar: Der nachhaltige Cashflow deckt schon den bestehenden Kapitaldienst nicht mit der nötigen Reserve.'
                : `Kein Spielraum: ${bindendText.replace('begrenzt durch', 'Grenze ist')} bereits erreicht.`}
            </p>
          )}
          <div className="flex flex-wrap gap-2 mt-3">
            {onUebernehmen && (
              <button
                type="button"
                onClick={() => onUebernehmen(r.max)}
                disabled={r.max <= 0 || r.max === r.beantragt}
                className="inline-flex items-center gap-2 px-4 h-9 rounded-[10px] bg-primary text-white text-sm font-medium hover:bg-primary-light disabled:opacity-50 disabled:cursor-default transition-colors"
              >
                <ArrowDownToLine size={15} strokeWidth={1.75} />
                Als Kreditbetrag übernehmen
              </button>
            )}
            {onLaufzeit && r.laufzeitFuerBeantragt && (
              <button
                type="button"
                onClick={() => onLaufzeit(r.laufzeitFuerBeantragt)}
                className="inline-flex items-center gap-2 px-4 h-9 rounded-[10px] bg-surface-inset text-sm font-medium text-text-primary hover:bg-border transition-colors"
              >
                <CalendarClock size={15} strokeWidth={1.75} />
                Laufzeit auf {r.laufzeitFuerBeantragt} Monate
              </button>
            )}
          </div>
        </div>

        {/* Beantragt gegen Vorschlag und die drei Grenzen */}
        <div className="space-y-4 min-w-0">
          <div>
            <div className="flex items-baseline justify-between gap-3 text-xs">
              <span className="text-text-secondary">{kunde ? 'Gewünscht' : 'Beantragt'}</span>
              <span className="font-mono text-text-primary">
                {r.beantragt ? formatCurrency(r.beantragt) : '–'}
                {r.beantragt > 0 && r.max > 0 && <span className="text-text-muted"> · {prozent(r.auslastung)} des Rahmens</span>}
              </span>
            </div>
            <div className="relative h-2 mt-1.5 rounded-full bg-surface-inset overflow-hidden">
              <div className="absolute inset-y-0 left-0 bg-[var(--mode-pastel)] border-r-2 border-primary" style={{ width: `${(r.max / skala) * 100}%` }} />
              {r.beantragt > 0 && (
                <div className={`absolute left-0 top-0.5 bottom-0.5 rounded-full ${st?.balken || 'bg-primary'}`} style={{ width: `${(r.beantragt / skala) * 100}%` }} />
              )}
            </div>
            {r.beantragt > 0 && r.dscrBeantragt != null && !kunde && (
              <p className="text-[11px] text-text-muted mt-1.5">
                Kapitaldienstdeckung mit dem beantragten Betrag: <span className="font-mono text-text-secondary">{formatNumber(r.dscrBeantragt, 2)}</span>
                {' '}(Mindestwert {formatNumber(r.rating.stufe.dscr, 2)})
              </p>
            )}
            {r.status === 'ueber' && r.laufzeitFuerBeantragt && (
              <p className="text-[11px] text-text-muted mt-1">
                Mit {r.laufzeitFuerBeantragt} Monaten Laufzeit trägt der Kapitaldienst den {kunde ? 'gewünschten' : 'beantragten'} Betrag.
              </p>
            )}
          </div>

          <ul className="space-y-2.5">
            {r.kriterien.map((k) => {
              const bindend = k.key === r.bindend.key;
              return (
                <li key={k.key}>
                  <div className="flex items-baseline justify-between gap-3 text-xs">
                    <span className={bindend ? 'font-medium text-text-primary' : 'text-text-secondary'}>
                      {k.label}
                      {bindend && <span className="ml-1.5 text-[10px] font-medium px-1.5 py-0.5 rounded bg-[var(--tint-warning)] text-amber-800">bindend</span>}
                    </span>
                    <span className="font-mono text-text-primary">{formatCurrency(abrundenAnzeige(k.grenze))}</span>
                  </div>
                  <div className="h-1 mt-1 rounded-full bg-surface-inset overflow-hidden">
                    <div className={`h-full rounded-full ${bindend ? 'bg-gold' : 'bg-[var(--mode-chart)] opacity-50'}`} style={{ width: `${Math.max(2, (k.grenze / kriterienMax) * 100)}%` }} />
                  </div>
                  <p className="text-[11px] text-text-muted mt-0.5">{k.regel}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Herleitung */}
      <div className="border-t border-border">
        <button
          type="button"
          onClick={() => setOffen(!offen)}
          className="w-full flex items-center justify-between px-5 py-2.5 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors"
        >
          So rechnet die KI
          {offen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>
        {offen && (
          <div className="grid grid-cols-1 @3xl:grid-cols-3 gap-x-6 gap-y-4 px-5 pb-5">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-text-muted mb-1">1 · Kapitaldienstfähigkeit</p>
              {r.cashflow.werte.map((w) => (
                <Zeile key={w.jahr} label={`Cashflow vor Zinsen ${w.jahr}`} wert={formatCurrency(w.wert)} />
              ))}
              <Zeile
                label="Nachhaltiger Cashflow"
                hinweis={r.cashflow.gedeckelt ? 'gewichtet 3:2:1, gedeckelt auf das letzte Jahr' : 'gewichtet 3:2:1 (JÜ + AfA + Zinsen)'}
                wert={formatCurrency(r.cashflow.wert)}
                stark
              />
              <Zeile label={`÷ Mindest-DSCR ${formatNumber(r.rating.stufe.dscr, 2)}`} wert={formatCurrency(r.kdTragbar)} />
              {r.bestand.posten.map((p, i) => (
                <Zeile key={i} label={`− ${p.name}${p.art ? ` (${p.art})` : ''}`} wert={formatCurrency(-p.jahr)} />
              ))}
              {r.bestand.geschaetzt && (
                <Zeile label="− bestehender Kapitaldienst" hinweis="geschätzt aus Zinsaufwand und langfristigen Verbindlichkeiten" wert={formatCurrency(-r.bestand.summe)} />
              )}
              <Zeile label="Freier Kapitaldienst p. a." wert={formatCurrency(r.freierKd)} stark />
              <Zeile
                label="Tragbarer Kreditbetrag"
                hinweis={`Barwert über ${tilgungsMonate} Monate zu ${formatNumber(r.zins, 2)} %`}
                wert={formatCurrency(r.kriterien[0].grenze)}
                stark
              />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-text-muted mb-1">2 · Verschuldung</p>
              <Zeile label="EBITDA nachhaltig" hinweis="gewichtet 3:2:1" wert={formatCurrency(r.ebitda.wert)} />
              <Zeile label={`× Obergrenze ${formatNumber(r.rating.stufe.dynVg, 1)} Jahre`} wert={formatCurrency(r.ebitda.wert * r.rating.stufe.dynVg)} />
              <Zeile label="− Nettoverschuldung 2023" hinweis="Verbindlichkeiten abzüglich liquider Mittel" wert={formatCurrency(-r.nettoVerschuldung)} />
              <Zeile label="Spielraum" wert={formatCurrency(r.kriterien[1].grenze)} stark />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-text-muted mb-1">3 · Eigenkapital</p>
              <Zeile label="Eigenkapital 2023" wert={formatCurrency(r.eigenkapital)} />
              <Zeile label={`÷ Mindestquote ${formatNumber(r.rating.stufe.ekMin, 1)} %`} wert={formatCurrency(r.eigenkapital / (r.rating.stufe.ekMin / 100))} />
              <Zeile label="− Bilanzsumme 2023" wert={formatCurrency(-r.bilanzsumme)} />
              <Zeile label="Spielraum" wert={formatCurrency(r.kriterien[2].grenze)} stark />
              {!kunde && (
                <p className="text-[11px] text-text-muted mt-3">
                  Rating {r.rating.klasse} ({r.rating.stufe.name}) aus derselben Rechnung wie Schritt 4, mit den
                  Standardwerten der qualitativen Bewertung. Der Vorschlag ist gerundet und ersetzt nicht die
                  Kreditentscheidung.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function abrundenAnzeige(v) {
  return v > 0 ? Math.floor(v / 1000) * 1000 : 0;
}
