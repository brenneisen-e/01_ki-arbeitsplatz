// Fortschrittsring — das Erkennungszeichen des Produkts: Grün auf
// --neutral-200, runde Enden, Zahl daneben. Größen 16 · 24 · 40 · 120.
// `fertig` zeigt statt des Rings einen Haken (Kapitel bestanden).
// `zahlInnen` setzt die Prozentzahl in die Mitte (Ergebnis des Wissenschecks,
// Stufe 120) statt daneben; der Wert wird dort nach dem ersten Bild gezeichnet,
// damit die Transition der Ringklasse läuft (reduced-motion: global aus).
import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { anteil as anteilFormat } from '../../lib/format.js';

const STRICH = { 16: 2.25, 24: 2.75, 40: 3.5, 120: 8 };

export default function Fortschrittsring({
  anteil = 0, groesse = 24, prozent = false, zahlInnen = false, fertig = false, label, className = '',
}) {
  const g = STRICH[groesse] ? groesse : 24;
  const strich = STRICH[g];
  const r = (g - strich) / 2;
  const umfang = 2 * Math.PI * r;
  const a = Math.max(0, Math.min(1, Number(anteil) || 0));
  // Die große Stufe zeichnet den Wert erst im zweiten Bild (Transition).
  const [gezeichnet, setGezeichnet] = useState(g >= 120 ? 0 : a);
  useEffect(() => {
    if (g < 120) { setGezeichnet(a); return undefined; }
    const id = requestAnimationFrame(() => setGezeichnet(a));
    return () => cancelAnimationFrame(id);
  }, [a, g]);
  const beschriftung = label || (fertig ? 'Bestanden' : `${anteilFormat(a)} gelesen`);
  return (
    <span
      className={`fortschrittsring ${g === 40 ? 'fortschrittsring-gross' : ''} ${g >= 120 ? 'fortschrittsring-xl' : ''} ${className}`.trim()}
      data-fertig={fertig ? 'true' : undefined}
      role="img"
      aria-label={beschriftung}
    >
      <span className="fortschrittsring-huelle">
        <svg width={g} height={g} viewBox={`0 0 ${g} ${g}`} aria-hidden="true">
          <circle className="fortschrittsring-spur" cx={g / 2} cy={g / 2} r={r} strokeWidth={strich} />
          <circle
            className="fortschrittsring-wert"
            cx={g / 2} cy={g / 2} r={r} strokeWidth={strich}
            strokeDasharray={umfang}
            strokeDashoffset={umfang * (1 - (fertig ? 1 : gezeichnet))}
          />
        </svg>
        {fertig && <span className="fortschrittsring-haken"><Check size={g >= 120 ? 48 : g >= 40 ? 18 : g >= 24 ? 13 : 10} strokeWidth={2.5} aria-hidden="true" /></span>}
        {zahlInnen && !fertig && <span className="fortschrittsring-mitte" aria-hidden="true">{anteilFormat(a)}</span>}
      </span>
      {prozent && <span className="fortschrittsring-zahl">{anteilFormat(a)}</span>}
    </span>
  );
}
