// ModusWahl — vier Moduskarten als Radiogruppe (ein Tab-Stopp, Pfeiltasten,
// Home/Ende), jede mit Symbol, Titel, Erklärung und einer Metazeile mit
// Fragenzahl und Dauer. Eine deaktivierte Karte (Wiederholen ohne fällige
// Fragen) bleibt sichtbar, erklärt sich und lässt sich nicht wählen.
// modi: [{ wert, label, symbol, text, meta, deaktiviert?, hinweis? }]
import { useRef } from 'react';

export default function ModusWahl({ modi = [], wert, onWechsel, label = 'Modus' }) {
  const karten = useRef([]);
  const aktivIndex = Math.max(0, modi.findIndex((m) => m.wert === wert));

  const waehle = (i, fokus = true) => {
    const m = modi[i];
    if (!m || m.deaktiviert) return;
    onWechsel && onWechsel(m.wert);
    if (fokus && karten.current[i]) karten.current[i].focus();
  };

  const aufTaste = (e, i) => {
    const n = modi.length;
    if (n === 0) return;
    let richtung = 0;
    let ziel = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { richtung = 1; ziel = (i + 1) % n; }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { richtung = -1; ziel = (i - 1 + n) % n; }
    else if (e.key === 'Home') { richtung = 1; ziel = 0; }
    else if (e.key === 'End') { richtung = -1; ziel = n - 1; }
    if (ziel === null) return;
    e.preventDefault();
    let schritte = 0;
    while (modi[ziel]?.deaktiviert && schritte < n) { ziel = (ziel + richtung + n) % n; schritte += 1; }
    waehle(ziel);
  };

  return (
    <div role="radiogroup" aria-label={label} className="modus-wahl">
      {modi.map((m, i) => {
        const Symbol = m.symbol;
        const gewaehlt = m.wert === wert;
        return (
          <button
            key={m.wert}
            ref={(el) => { karten.current[i] = el; }}
            type="button"
            role="radio"
            aria-checked={gewaehlt}
            aria-disabled={m.deaktiviert || undefined}
            tabIndex={i === aktivIndex ? 0 : -1}
            className="modus-karte"
            onClick={() => waehle(i, false)}
            onKeyDown={(e) => aufTaste(e, i)}
          >
            <span className="modus-karte-kopf">
              <span className="modus-karte-symbol">{Symbol && <Symbol size={18} aria-hidden="true" />}</span>
              <span className="modus-karte-radio" aria-hidden="true" />
            </span>
            <span className="modus-karte-titel">{m.label}</span>
            <span className="modus-karte-text">{m.deaktiviert && m.hinweis ? m.hinweis : m.text}</span>
            <span className="modus-karte-meta">{m.meta}</span>
          </button>
        );
      })}
    </div>
  );
}
