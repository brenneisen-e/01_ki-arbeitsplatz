// useLesestand — Lesefortschritt und stilles „gelesen“.
// Setzt beim Scrollen (rAF-gedrosselt) die CSS-Variable --lesefortschritt
// (0..1) auf document.documentElement; die 2-px-Linie zeichnet das Fundament.
// Gemessen wird der Anteil des Inhalts zwischen `anfangRef` und `endeRef`,
// den der Leser schon gesehen hat. Ab 80 % und nach 15 s offen wird die
// Einheit leise als gelesen markiert — außer der Leser hat die Markierung
// in diesem Besuch selbst zurückgenommen (unterdruecktRef).
import { useEffect, useRef } from 'react';
import { useWissen } from '../../store/Wissen.jsx';

const GELESEN_AB = 0.8;
const GELESEN_NACH_MS = 15000;

export function useLesestand({ kapitel, einheit, anfangRef, endeRef, unterdruecktRef }) {
  const { istGelesen, markiereGelesen } = useWissen();
  const istGelesenRef = useRef(istGelesen);
  istGelesenRef.current = istGelesen;

  useEffect(() => {
    if (!kapitel || !einheit) return undefined;
    const html = document.documentElement;
    const offenSeit = Date.now();
    let maxAnteil = 0;
    let raf = 0;

    const pruefeGelesen = () => {
      if (unterdruecktRef && unterdruecktRef.current) return;
      if (maxAnteil >= GELESEN_AB && Date.now() - offenSeit >= GELESEN_NACH_MS && !istGelesenRef.current(kapitel.id, einheit.id)) {
        markiereGelesen(kapitel.id, einheit.id, true);
      }
    };

    const messe = () => {
      raf = 0;
      const anfang = anfangRef.current;
      const ende = endeRef.current;
      let anteil = 1;
      if (anfang && ende) {
        const oben = anfang.getBoundingClientRect().top + window.scrollY;
        const unten = ende.getBoundingClientRect().top + window.scrollY;
        const hoehe = Math.max(1, unten - oben);
        anteil = Math.max(0, Math.min(1, (window.scrollY + window.innerHeight - oben) / hoehe));
      }
      html.style.setProperty('--lesefortschritt', anteil.toFixed(4));
      if (anteil > maxAnteil) maxAnteil = anteil;
      pruefeGelesen();
    };
    const plane = () => { if (!raf) raf = requestAnimationFrame(messe); };

    messe();
    window.addEventListener('scroll', plane, { passive: true });
    window.addEventListener('resize', plane);
    const takt = window.setInterval(messe, 5000);
    return () => {
      window.removeEventListener('scroll', plane);
      window.removeEventListener('resize', plane);
      window.clearInterval(takt);
      if (raf) cancelAnimationFrame(raf);
      html.style.setProperty('--lesefortschritt', '0');
    };
  }, [kapitel, einheit, anfangRef, endeRef, unterdruecktRef, markiereGelesen]);
}
