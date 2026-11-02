// ===========================================================================
// Zeitleiste.jsx — Blocktyp `timeline`. Ab rund 640 px Blockbreite als
// umbrechendes Raster mit durchgehender Linie je Reihe (Jahr fett, Punkt in
// Typfarbe), darunter vertikal; Legende als Chips — nur für Typen, die in den
// Daten vorkommen. Typfarben in fester Reihenfolge aus --viz-*.
// ===========================================================================
import { useMemo } from 'react';
import BlockRahmen from './BlockRahmen.jsx';

const TYPEN = {
  regulation: { name: 'Regulatorik', farbe: 'var(--viz-2)' },
  market: { name: 'Marktentwicklung', farbe: 'var(--viz-1)' },
  crisis: { name: 'Krise', farbe: 'var(--viz-3)' },
  innovation: { name: 'Innovation', farbe: 'var(--viz-4)' },
};
const UNBEKANNT = { name: 'Ereignis', farbe: 'var(--neutral-400)' };

export default function Zeitleiste({ block }) {
  const events = Array.isArray(block.events) ? block.events : [];
  const typen = useMemo(() => {
    const gesehen = [];
    for (const e of events) {
      const t = e.type || 'market';
      if (!gesehen.includes(t)) gesehen.push(t);
    }
    return gesehen;
  }, [events]);

  return (
    <BlockRahmen titel={block.title} quelle={block.source} quelleUrl={block.sourceUrl} className="bl-zeitleiste-block">
      <div className="bl-zeitleiste-huelle">
        <ol className="bl-zeitleiste">
          {events.map((e, i) => {
            const typ = TYPEN[e.type] || UNBEKANNT;
            return (
              <li key={i} className="bl-ereignis" style={{ '--typfarbe': typ.farbe }}>
                <span className="bl-ereignis-punkt" aria-hidden="true" />
                <div className="bl-ereignis-jahr">{e.year}<span className="sr-only"> · {typ.name}</span></div>
                <div className="bl-ereignis-titel">{e.title}</div>
                {e.description && <p className="bl-ereignis-text">{e.description}</p>}
              </li>
            );
          })}
        </ol>
      </div>
      {typen.length > 1 && (
        <ul className="bl-legende" aria-label="Legende">
          {typen.map((t) => {
            const typ = TYPEN[t] || UNBEKANNT;
            return (
              <li key={t} className="bl-legende-eintrag">
                <span className="bl-legende-punkt" style={{ background: typ.farbe }} aria-hidden="true" />
                {typ.name}
              </li>
            );
          })}
        </ul>
      )}
    </BlockRahmen>
  );
}
