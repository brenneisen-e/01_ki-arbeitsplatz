import { useEffect, useRef, useState } from 'react';

/** Zählt weich vom letzten auf den neuen Wert (ease-out), z. B. bei Live-Daten. */
export function useHochzaehlen(ziel, dauer = 800, vonNull = false) {
  const [wert, setWert] = useState(vonNull ? 0 : ziel);
  const von = useRef(vonNull ? 0 : ziel);
  const rahmen = useRef(0);

  useEffect(() => {
    const start = performance.now();
    const ausgang = von.current;
    cancelAnimationFrame(rahmen.current);
    const schritt = (t) => {
      const f = Math.min(1, (t - start) / dauer);
      const e = 1 - Math.pow(1 - f, 3);
      const w = ausgang + (ziel - ausgang) * e;
      setWert(w);
      von.current = w;
      if (f < 1) rahmen.current = requestAnimationFrame(schritt);
    };
    rahmen.current = requestAnimationFrame(schritt);
    return () => cancelAnimationFrame(rahmen.current);
  }, [ziel, dauer]);

  return wert;
}

export default function Zaehler({ wert, format = (v) => Math.round(v).toLocaleString('de-DE'), dauer, vonNull = false, className }) {
  const w = useHochzaehlen(wert, dauer, vonNull);
  return <span className={className}>{format(w)}</span>;
}
