import {
  Layers3, Cpu, CalendarClock, ArrowRight, Info, Hand,
} from 'lucide-react';
import { clsx } from 'clsx';
import {
  KONTROLLTYPEN, WIRKUNG_MAP, AUTOMATISIERBARKEIT_MAP,
  TURNUS_SENKUNG, KONTROLL_TURNUS_LABEL, AUSFUEHRUNG_MAP,
  turnusErsparnis, kontrolltypenKennzahlen,
} from '../../data/istAnalyse';

const nf0 = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 });
const nf1 = new Intl.NumberFormat('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/**
 * Kontrolltypen — Anzahl je Typ als Indikator für die Komplexität des
 * Kontrollsystems. Ein Balken je Typ: eine Serie, also keine Legende.
 * Wirkung und Automatisierbarkeit tragen Badges, nicht die Balkenfarbe.
 */
function Kontrolltypen() {
  const k = kontrolltypenKennzahlen();
  const max = Math.max(...KONTROLLTYPEN.map(t => t.anzahl));

  return (
    <div className="card-base">
      <div className="px-5 py-4 border-b border-slate-200 flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <h3 className="text-[15px] font-bold tracking-tight flex items-center gap-2">
            <Layers3 size={16} style={{ color: 'var(--mode-primary, #0F4D2A)' }} /> Kontrolltypen
          </h3>
          <p className="text-[12px] text-slate-500 mt-0.5 max-w-2xl">
            Jeder zusätzliche Kontrolltyp bringt eigene Nachweisformen, Prüfwege und Schulungsbedarf mit sich — die Zahl der
            geführten Typen ist damit ein Indikator für die Komplexität des Kontrollsystems.
          </p>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          {[
            { wert: k.typen, label: 'Typen im Einsatz' },
            { wert: `${k.top3Anteil} %`, label: 'in den Top 3' },
            { wert: `${k.hochAutomatisierbarAnteil} %`, label: 'hoch automatisierbar' },
          ].map(x => (
            <div key={x.label} className="text-right">
              <div className="text-[19px] font-bold leading-none text-slate-800">{x.wert}</div>
              <div className="text-[10.5px] text-slate-500 mt-0.5">{x.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 py-3 divide-y divide-slate-100">
        {k.sortiert.map(t => {
          const w = WIRKUNG_MAP[t.wirkung];
          const a = AUTOMATISIERBARKEIT_MAP[t.automatisierbarkeit];
          return (
            <div key={t.id} className="py-2.5 grid gap-3 items-center"
                 style={{ gridTemplateColumns: 'minmax(150px,235px) 1fr 52px 200px' }}>
              <div className="min-w-0 pr-1">
                <div className="text-[13px] font-semibold leading-tight">{t.label}</div>
              </div>
              <div style={{ height: 14 }} title={`${nf0.format(t.anzahl)} Kontrollen`}>
                <div className="h-full" style={{
                  width: `${(t.anzahl / max) * 100}%`, minWidth: 3, background: '#1D7B3F',
                  borderTopRightRadius: 4, borderBottomRightRadius: 4,
                }} />
              </div>
              <div className="text-[12.5px] font-semibold tabular-nums text-right text-slate-700">{nf0.format(t.anzahl)}</div>
              <div className="flex items-center gap-1.5 justify-end flex-wrap">
                <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                      style={{ background: w.bg, color: w.color }}>{w.label}</span>
                <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                      style={{ background: a.bg, color: a.color }} title={t.hinweis}>
                  <Cpu size={10} /> {a.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-5 py-2.5 border-t border-slate-100 text-[11.5px] text-slate-500 leading-snug">
        {nf0.format(k.praeventiv)} präventive und {nf0.format(k.detektiv)} detektive Kontrollen.
        {' '}Auf die {nf0.format(k.hochAutomatisierbar)} Kontrollen der hoch automatisierbaren Typen entfällt der grösste Teil des
        Automatisierungspotenzials — überwiegend Abstimmungen, Plausibilisierungen und Berechtigungskontrollen.
      </div>
    </div>
  );
}

/** Anteil manueller und automatisierter Kontrollen im Gesamtbestand. */
function Automatisierungsgrad({ gesamt }) {
  const teile = [
    { id: 'manuell', label: 'Manuell / systemgestützt', anzahl: gesamt.manuell, farbe: '#6FBF8C' },
    { id: 'auto', label: 'Teil- / vollautomatisiert', anzahl: gesamt.automatisiert, farbe: '#0F4D2A' },
  ];
  const k = kontrolltypenKennzahlen();

  return (
    <div className="card-base p-5">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
        <div>
          <h3 className="text-[15px] font-bold tracking-tight flex items-center gap-2">
            <Cpu size={16} style={{ color: 'var(--mode-primary, #0F4D2A)' }} /> Automatisierungsgrad
          </h3>
          <p className="text-[12px] text-slate-500 mt-0.5">
            Anteil manueller und automatisierter Kontrollen im Gesamtbestand.
          </p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[26px] font-bold leading-none" style={{ color: 'var(--mode-primary, #0F4D2A)' }}>
            {nf0.format(gesamt.automatisierungsgrad)}<span className="text-[13px] text-slate-400 font-semibold"> %</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">automatisiert</div>
        </div>
      </div>

      {/* Anteilsbalken — 2px Flächenlücke zwischen den Segmenten */}
      <div className="flex" style={{ height: 18 }}>
        {teile.map((t, i) => (
          <div key={t.id} className="h-full relative" title={`${t.label}: ${nf0.format(t.anzahl)} Kontrollen`}
               style={{
                 flex: `${t.anzahl} 1 0`,
                 background: t.farbe,
                 marginRight: i === teile.length - 1 ? 0 : 2,
                 borderTopLeftRadius: i === 0 ? 4 : 0, borderBottomLeftRadius: i === 0 ? 4 : 0,
                 borderTopRightRadius: i === teile.length - 1 ? 4 : 0,
                 borderBottomRightRadius: i === teile.length - 1 ? 4 : 0,
               }} />
        ))}
      </div>
      <div className="flex items-center gap-4 mt-2.5 flex-wrap">
        {teile.map(t => (
          <span key={t.id} className="inline-flex items-center gap-1.5 text-[11.5px] text-slate-600">
            <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: t.farbe }} />
            {t.label}
            <span className="font-semibold tabular-nums text-slate-800">{nf0.format(t.anzahl)}</span>
          </span>
        ))}
      </div>

      <div className="mt-3.5 rounded-xl p-3 flex items-start gap-2.5"
           style={{ background: 'color-mix(in srgb, var(--mode-primary, #0F4D2A) 5%, white)' }}>
        <Hand size={15} className="shrink-0 mt-0.5" style={{ color: 'var(--mode-primary, #0F4D2A)' }} />
        <p className="text-[12.5px] text-slate-700 leading-relaxed">
          {nf0.format(gesamt.manuell)} Kontrollen laufen weiterhin manuell oder rein systemgestützt. Davon entfallen
          {' '}{nf0.format(k.hochAutomatisierbar)} auf Typen mit hoher Automatisierbarkeit — dort liegt der Hebel, nicht bei
          den Vier-Augen-Kontrollen, die personengebunden bleiben müssen.
        </p>
      </div>
    </div>
  );
}

/** Turnus senken — Ersparnis aus demselben Aufwandsmodell gerechnet. */
function Turnus({ annahmen }) {
  const zeilen = TURNUS_SENKUNG.map(e => ({ ...e, r: turnusErsparnis(e, annahmen) }));
  const gesamtPT = zeilen.reduce((s, z) => s + z.r.ersparnisPT, 0);
  const gesamtAnzahl = zeilen.reduce((s, z) => s + z.anzahl, 0);

  return (
    <div className="card-base">
      <div className="px-5 py-4 border-b border-slate-200 flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <h3 className="text-[15px] font-bold tracking-tight flex items-center gap-2">
            <CalendarClock size={16} style={{ color: 'var(--mode-primary, #0F4D2A)' }} /> Kontrollturnus senken
          </h3>
          <p className="text-[12px] text-slate-500 mt-0.5 max-w-2xl">
            Welche Kontrollen können seltener laufen, ohne dass die Risikoabdeckung sinkt? Die Ersparnis rechnet der Agent aus
            demselben Aufwandsmodell wie im Analyzer — sie folgt Ihren Annahmen.
          </p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[26px] font-bold leading-none" style={{ color: 'var(--mode-primary, #0F4D2A)' }}>
            {nf0.format(gesamtPT)}<span className="text-[13px] text-slate-400 font-semibold"> PT</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">bei {nf0.format(gesamtAnzahl)} Kontrollen</div>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {zeilen.map(z => (
          <div key={z.id} className="px-5 py-3.5">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11.5px] font-semibold bg-slate-100 text-slate-600">
                {KONTROLL_TURNUS_LABEL[z.von]}
              </span>
              <ArrowRight size={14} className="text-slate-400" />
              <span className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11.5px] font-bold"
                    style={{ background: 'color-mix(in srgb, var(--mode-primary, #0F4D2A) 12%, white)', color: 'var(--mode-primary, #0F4D2A)' }}>
                {KONTROLL_TURNUS_LABEL[z.nach]}
              </span>
              <span className="chip">{nf0.format(z.anzahl)} Kontrollen, davon {nf0.format(z.schluessel)} Schlüssel</span>
              <span className="chip">{AUSFUEHRUNG_MAP[z.art]?.label}</span>
              <span className="ml-auto text-[13px] font-bold tabular-nums text-emerald-700">
                −{nf1.format(z.r.ersparnisPT)} PT
              </span>
            </div>
            <div className="text-[12px] text-slate-500 mb-1.5">
              <span className="tabular-nums">{nf0.format(z.r.vorherPT)} PT</span> heute →
              {' '}<span className="tabular-nums font-semibold text-slate-700">{nf0.format(z.r.nachherPT)} PT</span> im Zielturnus
              {' · '}{z.bereich}
            </div>
            <p className="text-[12.5px] text-slate-600 leading-relaxed">{z.begruendung}</p>
            <div className="mt-1.5 flex items-start gap-1.5 text-[11.5px] text-slate-500 leading-snug">
              <Info size={12} className="shrink-0 mt-0.5 text-slate-400" />
              <span>{z.bedingung}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PortfolioHebel({ istAnalyse, annahmen }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">Portfolio-Ebene</span>
        <span className="text-[11.5px] text-slate-500">
          Hebel über den gesamten Kontrollbestand ({nf0.format(istAnalyse.gesamt.kontrollen)} Kontrollen)
        </span>
      </div>
      <Automatisierungsgrad gesamt={istAnalyse.gesamt} />
      <Kontrolltypen />
      <Turnus annahmen={annahmen} />
    </div>
  );
}
