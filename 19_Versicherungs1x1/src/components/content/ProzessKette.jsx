// ===========================================================================
// ProzessKette.jsx — Blocktyp `prozessKette` (Deck-Folien 58–65): die
// Wertschöpfungskette eines Versicherers. Die Kernfunktionen stehen als
// waagerechte Kette in Pfeilform (Tab-Muster wie die Wertschöpfungskette:
// Pfeiltasten wechseln, Home/Ende springen), ein Klick öffnet darunter den
// Deep Dive mit Aufgaben, Kennzahlen und Projektfeldern. Die
// Supportfunktionen liegen als Bänder unter der Kette.
//
// Die Pfeilform ist eine eigene Ebene im Knopf (`bl-prozess-form`), nicht
// der Knopf selbst — sonst würde die clip-path den Fokusring abschneiden.
// Unter 640 px steht die Kette senkrecht, die Pfeile zeigen nach unten.
// ===========================================================================
import { useId, useMemo, useRef, useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import InlineHtml from './Inline.jsx';
import { GrafikRahmen, alsListe, ersterText } from './grafikteile.jsx';
import { ohneTrennstriche } from './hilfen.js';

export default function ProzessKette({ block }) {
  const id = useId();
  const knoepfe = useRef([]);
  const [aktiv, setAktiv] = useState(0);

  const modell = useMemo(() => {
    const kern = (Array.isArray(block.kern) ? block.kern : [])
      .filter((k) => k && typeof k === 'object')
      .map((k, i) => ({
        id: ersterText(k.id) || `k${i}`,
        titel: ersterText(k.titel, k.title),
        text: ersterText(k.text),
        aufgaben: alsListe(k.aufgaben),
        kennzahlen: (Array.isArray(k.kennzahlen) ? k.kennzahlen : []).filter((z) => z && (z.label || z.wert)),
        projektfelder: alsListe(k.projektfelder),
      }));
    const support = (Array.isArray(block.support) ? block.support : [])
      .filter((s) => s && typeof s === 'object')
      .map((s) => ({ titel: ersterText(s.titel, s.title), text: ersterText(s.text) }));
    return { kern, support };
  }, [block]);

  const { kern, support } = modell;
  if (kern.length === 0 && support.length === 0) return null;
  const n = kern.length;
  const index = Math.min(aktiv, Math.max(0, n - 1));
  const k = kern[index];

  const waehle = (i) => {
    setAktiv(i);
    knoepfe.current[i]?.focus();
  };
  const aufTaste = (e, i) => {
    let ziel = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') ziel = (i + 1) % n;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') ziel = (i - 1 + n) % n;
    else if (e.key === 'Home') ziel = 0;
    else if (e.key === 'End') ziel = n - 1;
    if (ziel === null) return;
    e.preventDefault();
    waehle(ziel);
  };

  return (
    <GrafikRahmen block={block} titelFallback="Wertschöpfungskette" className="bl-prozess-block">
      <div className="bl-prozess">
        {n > 0 && (
          <>
            <h4 className="bl-prozess-ueberschrift" id={`${id}-kern`}>Kernfunktionen</h4>
            <div className="bl-prozess-kette" role="tablist" aria-labelledby={`${id}-kern`}>
              {kern.map((funktion, i) => (
                <button
                  key={funktion.id}
                  ref={(el) => { knoepfe.current[i] = el; }}
                  type="button"
                  role="tab"
                  id={`${id}-tab-${i}`}
                  aria-selected={index === i}
                  aria-controls={`${id}-tafel`}
                  tabIndex={index === i ? 0 : -1}
                  className="bl-prozess-glied"
                  data-erstes={i === 0 || undefined}
                  onClick={() => waehle(i)}
                  onKeyDown={(e) => aufTaste(e, i)}
                >
                  <span className="bl-prozess-form" aria-hidden="true" />
                  <span className="bl-prozess-nr" aria-hidden="true">{i + 1}</span>
                  <span className="bl-prozess-label">{funktion.titel}</span>
                </button>
              ))}
            </div>
            {k && (
              <div className="bl-prozess-tafel" role="tabpanel" id={`${id}-tafel`} aria-labelledby={`${id}-tab-${index}`} tabIndex={-1}>
                <div className="bl-prozess-tafel-kopf">
                  <span className="meta">Kernfunktion {index + 1} von {n}</span>
                  <h4>{ohneTrennstriche(k.titel)}</h4>
                  {k.text && <p className="bl-prozess-tafel-text"><InlineHtml html={k.text} begriffe={false} /></p>}
                </div>
                <div className="bl-prozess-spalten">
                  {k.aufgaben.length > 0 && (
                    <section className="bl-prozess-spalte">
                      <h5>Aufgaben</h5>
                      <ul className="bl-prozess-liste">
                        {k.aufgaben.map((a, i) => (
                          <li key={i}><Check size={14} aria-hidden="true" /><span><InlineHtml html={String(a)} begriffe={false} /></span></li>
                        ))}
                      </ul>
                    </section>
                  )}
                  {k.kennzahlen.length > 0 && (
                    <section className="bl-prozess-spalte">
                      <h5>Kennzahlen</h5>
                      <dl className="bl-prozess-kennzahlen">
                        {k.kennzahlen.map((z, i) => (
                          <div key={i}>
                            <dt>{ersterText(z.label)}</dt>
                            <dd>{ersterText(z.wert)}</dd>
                          </div>
                        ))}
                      </dl>
                    </section>
                  )}
                  {k.projektfelder.length > 0 && (
                    <section className="bl-prozess-spalte">
                      <h5>Projektfelder</h5>
                      <ul className="bl-prozess-liste">
                        {k.projektfelder.map((f, i) => (
                          <li key={i}><ArrowRight size={14} aria-hidden="true" /><span><InlineHtml html={String(f)} begriffe={false} /></span></li>
                        ))}
                      </ul>
                    </section>
                  )}
                </div>
              </div>
            )}
          </>
        )}
        {support.length > 0 && (
          <div className="bl-prozess-support">
            <h4 className="bl-prozess-ueberschrift" id={`${id}-support`}>Supportfunktionen</h4>
            <ul className="bl-prozess-baender" aria-labelledby={`${id}-support`}>
              {support.map((s, i) => (
                <li key={i} className="bl-prozess-band">
                  <span className="bl-prozess-band-titel">{s.titel}</span>
                  {s.text && <span className="bl-prozess-band-text"><InlineHtml html={s.text} begriffe={false} /></span>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </GrafikRahmen>
  );
}
