import { useState } from 'react';
import { ART_ORDER, ART_RAMPE, AUSFUEHRUNG_MAP } from '../../data/istAnalyse';

// Zahlformate — deutsche Lokalisierung.
const nf0 = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 });
const nf1 = new Intl.NumberFormat('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/**
 * Kontrollbestand je Prozessbereich.
 *
 * Ein Balken je Bereich, gestapelt nach Ausführungsart. Die Ausführungsart ist
 * eine ordinale Größe (manuell → automatisiert), deshalb eine Ein-Hue-Rampe
 * hell → dunkel statt kategorialer Farben. Danebenliegend der Prüfaufwand als
 * eigene, einreihige Skala.
 *
 * Marken-Spezifikation: Balken 18px, 4px gerundetes Datenende, quadratisch an
 * der Grundlinie, 2px Flächenlücke zwischen den Segmenten.
 */
export default function BereichsChart({ bereiche, maxKontrollen, maxPt, onBereichClick, aktiverBereich }) {
  const [hover, setHover] = useState(null);

  return (
    <div className="card-base">
      <div className="px-5 py-4 border-b border-slate-200 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h3 className="text-[15px] font-bold tracking-tight">Kontrollbestand je Prozessbereich</h3>
          <p className="text-[12px] text-slate-500 mt-0.5">
            Balkenlänge = Anzahl Kontrollen, Einfärbung = Ausführungsart. Je heller der Balken, desto manueller der Bereich.
          </p>
        </div>
        {/* Legende — bei mehr als einer Serie immer vorhanden */}
        <div className="flex items-center gap-3 flex-wrap">
          {ART_ORDER.map(art => (
            <span key={art} className="inline-flex items-center gap-1.5 text-[11px] text-slate-600">
              <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: ART_RAMPE[art] }} />
              {AUSFUEHRUNG_MAP[art]?.label || art}
            </span>
          ))}
        </div>
      </div>

      {/* Spaltenköpfe */}
      <div className="px-5 pt-3 pb-1.5 hidden md:grid gap-3 items-end text-[10.5px] font-semibold uppercase tracking-wider text-slate-400"
           style={{ gridTemplateColumns: '215px 1fr 62px 62px 165px' }}>
        <div>Prozessbereich</div>
        <div>Kontrollen nach Ausführungsart</div>
        <div className="text-right">Schlüssel</div>
        <div className="text-right">Kontr./Risiko</div>
        <div className="text-right">Aufwand p. a.</div>
      </div>

      <div className="px-5 pb-4 divide-y divide-slate-100">
        {bereiche.map(b => {
          const aktiv = aktiverBereich === b.id;
          return (
            <div
              key={b.id}
              role="button"
              tabIndex={0}
              aria-pressed={aktiv}
              onClick={() => onBereichClick?.(aktiv ? null : b.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onBereichClick?.(aktiv ? null : b.id); }
              }}
              className="grid gap-3 items-center py-2.5 cursor-pointer rounded-lg transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              style={{ gridTemplateColumns: 'minmax(150px,215px) 1fr 62px 62px 165px' }}
            >
              {/* Bereichsname */}
              <div className="min-w-0 pr-1">
                <div className={`text-[13px] leading-tight ${aktiv ? 'font-bold' : 'font-semibold'}`}>
                  {b.name}
                </div>
                <div className="text-[10.5px] text-slate-400">{b.prozesse} Prozesse · {b.risiken} Risiken</div>
              </div>

              {/* Gestapelter Balken: Kontrollen nach Ausführungsart */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex-1 min-w-0" style={{ height: 18 }}>
                  <div
                    className="flex h-full"
                    style={{ width: `${(b.kontrollen / maxKontrollen) * 100}%`, minWidth: 4 }}
                  >
                    {b.nachArt.filter(s => s.anzahl > 0).map((s, i, arr) => {
                      const letzte = i === arr.length - 1;
                      return (
                        <div
                          key={s.art}
                          onMouseEnter={() => setHover({ bereich: b.id, art: s.art, anzahl: s.anzahl })}
                          onMouseLeave={() => setHover(null)}
                          className="h-full relative"
                          style={{
                            flex: `${s.anzahl} 1 0`,
                            background: ART_RAMPE[s.art],
                            // 2px Flächenlücke zwischen den Segmenten
                            marginRight: letzte ? 0 : 2,
                            // 4px gerundetes Datenende, quadratisch an der Grundlinie
                            borderTopRightRadius: letzte ? 4 : 0,
                            borderBottomRightRadius: letzte ? 4 : 0,
                            opacity: hover && hover.bereich === b.id && hover.art !== s.art ? 0.55 : 1,
                            transition: 'opacity 120ms',
                          }}
                        >
                          {hover?.bereich === b.id && hover?.art === s.art && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-20 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-[11px] shadow-lg pointer-events-none"
                                 style={{ background: '#0F172A', color: 'white' }}>
                              <span className="font-semibold">{AUSFUEHRUNG_MAP[s.art]?.label}</span>
                              {' · '}
                              {nf0.format(s.anzahl)} Kontrollen
                              <span className="text-white/60"> ({Math.round((s.anzahl / b.kontrollen) * 100)} %)</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                {/* Direktes Label am Datenende */}
                <span className="text-[12.5px] font-semibold tabular-nums text-slate-700 w-9 text-right shrink-0">
                  {nf0.format(b.kontrollen)}
                </span>
              </div>

              <div className="text-[12.5px] tabular-nums text-slate-600 text-right">{nf0.format(b.schluessel)}</div>
              <div className="text-[12.5px] tabular-nums text-slate-600 text-right" title="Kontrollen je Risiko">
                {nf1.format(b.kontrollenJeRisiko)}
              </div>

              {/* Prüfaufwand — eigene Skala, einreihig */}
              <div className="flex items-center gap-2 justify-end">
                <div className="flex-1 min-w-0" style={{ height: 8 }}
                     title={`${nf0.format(b.durchfuehrungPT)} PT Durchführung + ${nf0.format(b.testingPT)} PT Testing`}>
                  <div
                    className="h-full"
                    style={{
                      width: `${(b.pt / maxPt) * 100}%`,
                      minWidth: 3,
                      background: '#1D7B3F',
                      borderTopRightRadius: 4,
                      borderBottomRightRadius: 4,
                    }}
                  />
                </div>
                <span className="text-[12.5px] font-semibold tabular-nums text-slate-700 shrink-0">
                  {nf0.format(b.pt)}<span className="text-slate-400 font-normal"> PT</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
