// CountUp — zählt eine Kennzahl einmalig hoch, wenn sie zum ersten Mal ins
// Bild kommt; danach steht der Wert sofort (auch nach jeder Navigation).
// Respektiert prefers-reduced-motion (Zielwert sofort). Deutsche Formatierung,
// Dezimalen aus dem Wert (17,4 bleibt 17,4) oder per `dezimalen`.
import { useEffect, useRef, useState } from 'react';
import { zahl, dezimalenVon } from '../../lib/format.js';

const gelaufen = new Set();

function reduziert() {
  return typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export default function CountUp({ wert, dezimalen, dauer = 900, kennung, className = '' }) {
  const ziel = Number(wert) || 0;
  const d = dezimalen == null ? dezimalenVon(ziel) : dezimalen;
  const schluessel = kennung || `${ziel}|${d}`;
  const sofort = gelaufen.has(schluessel) || reduziert();
  const [anzeige, setAnzeige] = useState(sofort ? ziel : 0);
  const ref = useRef(null);

  useEffect(() => {
    if (sofort) { setAnzeige(ziel); return undefined; }
    const el = ref.current;
    if (!el) return undefined;
    let raf = 0;
    let beobachter = null;
    const laufe = () => {
      gelaufen.add(schluessel);
      const start = performance.now();
      const schritt = (t) => {
        const p = Math.min(1, (t - start) / dauer);
        const eased = 1 - Math.pow(1 - p, 3);
        setAnzeige(ziel * eased);
        if (p < 1) raf = requestAnimationFrame(schritt);
        else setAnzeige(ziel);
      };
      raf = requestAnimationFrame(schritt);
    };
    if (typeof IntersectionObserver === 'undefined') { laufe(); return () => cancelAnimationFrame(raf); }
    beobachter = new IntersectionObserver((eintraege) => {
      if (eintraege.some((e) => e.isIntersecting)) {
        beobachter.disconnect();
        beobachter = null;
        laufe();
      }
    }, { threshold: 0.2 });
    beobachter.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      if (beobachter) beobachter.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ziel, d, dauer, schluessel]);

  return (
    <span ref={ref} className={`tabular ${className}`.trim()}>
      <span aria-hidden="true">{zahl(anzeige, d)}</span>
      <span className="sr-only">{zahl(ziel, d)}</span>
    </span>
  );
}
