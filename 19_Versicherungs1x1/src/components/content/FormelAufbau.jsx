// ===========================================================================
// FormelAufbau.jsx — Blocktyp `formelAufbau` (Deck-Folie 54,
// Prämienberechnung): die Glieder einer Formel nebeneinander, getrennt durch
// ihre Rechenzeichen, jedes Glied anklickbar (Tab-Muster mit Pfeiltasten).
// Darunter die Erklärung des gewählten Glieds und die Ergebniszeile.
//
// Unter 560 px Blockbreite tritt die vollständige Liste aller Glieder an die
// Stelle der Reiter — dort steht jede Erklärung ohne Klick da.
// ===========================================================================
import { Fragment, useId, useMemo, useRef, useState } from 'react';
import { GrafikRahmen, ZEICHEN_WORT, ersterText, useZweitfassung } from './grafikteile.jsx';
import InlineHtml from './Inline.jsx';

export default function FormelAufbau({ block }) {
  const id = useId();
  const knoepfe = useRef([]);
  const [aktiv, setAktiv] = useState(0);
  const { ref, schmal } = useZweitfassung(560);

  const glieder = useMemo(() => (Array.isArray(block.glieder) ? block.glieder : [])
    .filter((g) => g && typeof g === 'object')
    .map((g) => ({
      zeichen: ersterText(g.zeichen) || '+',
      name: ersterText(g.name, g.titel, g.title),
      text: ersterText(g.text),
      beispiel: ersterText(g.beispiel),
    })), [block]);

  if (glieder.length === 0) return null;
  const n = glieder.length;
  const ergebnis = block.ergebnis && typeof block.ergebnis === 'object' ? block.ergebnis : null;
  const ergebnisName = ersterText(ergebnis?.name, ergebnis?.titel, ergebnis?.title);
  const ergebnisText = ersterText(ergebnis?.text);
  const index = Math.min(aktiv, n - 1);
  const g = glieder[index];

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

  const ergebnisZeile = (ergebnisName || ergebnisText) && (
    <div className="bl-formel-ergebniszeile">
      <span className="bl-formel-zeichen bl-formel-zeichen-gross" aria-hidden="true">=</span>
      <div className="bl-formel-ergebniszeile-koerper">
        <h4>{ergebnisName}</h4>
        {ergebnisText && <p><InlineHtml html={ergebnisText} begriffe={false} /></p>}
      </div>
    </div>
  );

  return (
    <GrafikRahmen block={block} titelFallback="Aufbau der Formel" className="bl-formel-block">
      <div ref={ref} className="bl-formel-huelle">
        {schmal ? (
          <ol className="bl-formel-liste">
            {glieder.map((glied, i) => (
              <li key={i}>
                <span className="bl-formel-liste-zeichen" aria-hidden="true">{i === 0 ? '' : glied.zeichen}</span>
                <div className="bl-formel-liste-koerper">
                  <h5>
                    {i > 0 && <span className="sr-only">{ZEICHEN_WORT[glied.zeichen] || glied.zeichen} </span>}
                    {glied.name}
                  </h5>
                  {glied.text && <p><InlineHtml html={glied.text} begriffe={false} /></p>}
                  {glied.beispiel && <p className="bl-formel-liste-beispiel">{glied.beispiel}</p>}
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <>
            <div className="bl-formel-reihe">
              <div className="bl-formel-tabs" role="tablist" aria-label={ersterText(block.title) || 'Glieder der Formel'}>
                {glieder.map((glied, i) => (
                  <Fragment key={i}>
                    {i > 0 && <span className="bl-formel-zeichen" aria-hidden="true">{glied.zeichen}</span>}
                    <button
                      ref={(el) => { knoepfe.current[i] = el; }}
                      type="button"
                      role="tab"
                      id={`${id}-tab-${i}`}
                      aria-selected={index === i}
                      aria-controls={`${id}-tafel`}
                      tabIndex={index === i ? 0 : -1}
                      className="bl-formel-glied"
                      onClick={() => waehle(i)}
                      onKeyDown={(e) => aufTaste(e, i)}
                    >
                      {i > 0 && <span className="sr-only">{ZEICHEN_WORT[glied.zeichen] || glied.zeichen} </span>}
                      <span className="bl-formel-glied-name">{glied.name}</span>
                    </button>
                  </Fragment>
                ))}
              </div>
              {ergebnisName && (
                <>
                  <span className="bl-formel-zeichen" aria-hidden="true">=</span>
                  <div className="bl-formel-summe">{ergebnisName}</div>
                </>
              )}
            </div>
            <div className="bl-formel-tafel" role="tabpanel" id={`${id}-tafel`} aria-labelledby={`${id}-tab-${index}`} tabIndex={-1}>
              <div className="bl-formel-tafel-kopf">
                <span className="meta">Glied {index + 1} von {n}</span>
                <h4>{g.name}</h4>
              </div>
              {g.text && <p className="bl-formel-tafel-text"><InlineHtml html={g.text} begriffe={false} /></p>}
              {g.beispiel && <p className="bl-formel-tafel-text bl-formel-beispiel">{g.beispiel}</p>}
            </div>
          </>
        )}
        {ergebnisZeile}
      </div>
    </GrafikRahmen>
  );
}
