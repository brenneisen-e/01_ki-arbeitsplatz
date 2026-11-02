// Lesefortschritt — 2 px dünne Linie unter der Topbar (nur Kapitelseite).
// Liest die CSS-Variable --lesefortschritt (0..1) auf document.documentElement,
// die der Kapitel-Agent beim Scrollen setzt:
//   document.documentElement.style.setProperty('--lesefortschritt', String(anteil))
// Beim Verlassen der Kapitelseite wird die Variable zurückgesetzt.
import { useEffect } from 'react';

export default function Lesefortschritt() {
  useEffect(() => () => {
    document.documentElement.style.removeProperty('--lesefortschritt');
  }, []);
  return (
    <div className="lesefortschritt" aria-hidden="true">
      <div className="lesefortschritt-balken" />
    </div>
  );
}
