// Segment — Segmentschalter als role="radiogroup": Pfeiltasten wechseln,
// Home/Ende springen, ein Tab-Stopp (roving tabindex).
// optionen: [{ wert, label, punktFarbe?, deaktiviert?, hinweis? }]
import { useId, useRef } from 'react';

export default function Segment({ optionen = [], wert, onWechsel, label, klein = false, className = '' }) {
  const id = useId();
  const knoepfe = useRef([]);
  const aktivIndex = Math.max(0, optionen.findIndex((o) => o.wert === wert));

  const waehle = (i) => {
    const o = optionen[i];
    if (!o || o.deaktiviert) return;
    onWechsel && onWechsel(o.wert);
    knoepfe.current[i] && knoepfe.current[i].focus();
  };

  const aufTaste = (e, i) => {
    const n = optionen.length;
    let ziel = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') ziel = (i + 1) % n;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') ziel = (i - 1 + n) % n;
    else if (e.key === 'Home') ziel = 0;
    else if (e.key === 'End') ziel = n - 1;
    if (ziel === null) return;
    e.preventDefault();
    // deaktivierte Optionen überspringen
    let schritte = 0;
    while (optionen[ziel]?.deaktiviert && schritte < n) { ziel = (ziel + (e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 1) + n) % n; schritte += 1; }
    waehle(ziel);
  };

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={`segment ${klein ? 'segment-klein' : ''} ${className}`.trim()}
      id={id}
    >
      {optionen.map((o, i) => (
        <button
          key={o.wert}
          ref={(el) => { knoepfe.current[i] = el; }}
          type="button"
          role="radio"
          aria-checked={o.wert === wert}
          tabIndex={i === aktivIndex ? 0 : -1}
          disabled={o.deaktiviert}
          title={o.hinweis}
          className="segment-option"
          onClick={() => waehle(i)}
          onKeyDown={(e) => aufTaste(e, i)}
        >
          {o.punktFarbe && <span className="segment-punkt" style={{ background: o.punktFarbe }} aria-hidden="true" />}
          {o.label}
        </button>
      ))}
    </div>
  );
}
