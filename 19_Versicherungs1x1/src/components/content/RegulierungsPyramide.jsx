// ===========================================================================
// RegulierungsPyramide.jsx — Blocktyp `regulatoryPyramid`: Ebenen als
// aufklappbare Stufen, Breite nimmt nach unten zu (echte Pyramide, ab etwa
// 560 px Blockbreite), Töne aus der sequenziellen Grün-Rampe statt der
// Datenfarben (Kontrast), Text stets in --text. Erste Ebene offen.
// ===========================================================================
import { useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import BlockRahmen from './BlockRahmen.jsx';
import { mehrzahl } from '../../lib/format.js';

export default function RegulierungsPyramide({ block }) {
  const ebenen = Array.isArray(block.levels) ? block.levels : [];
  const [offen, setOffen] = useState(() => new Set([0]));
  const id = useId();
  const n = Math.max(1, ebenen.length);

  const schalte = (i) => setOffen((alt) => {
    const neu = new Set(alt);
    if (neu.has(i)) neu.delete(i); else neu.add(i);
    return neu;
  });

  return (
    <BlockRahmen titel={block.title} quelle={block.source} quelleUrl={block.sourceUrl} className="bl-pyramide-block">
      <div className="bl-pyramide">
        {ebenen.map((e, i) => {
          const istOffen = offen.has(i);
          const items = Array.isArray(e.items) ? e.items : [];
          const breite = n === 1 ? 100 : 62 + (38 * i) / (n - 1);
          const tint = Math.min(300, 100 + i * 100);
          return (
            <div key={i} className="bl-pyramide-ebene" style={{ '--ebene-breite': `${breite}%`, '--ebene-tint': `var(--viz-sequenz-${tint})` }} data-offen={istOffen}>
              <button type="button" className="bl-pyramide-kopf" aria-expanded={istOffen} aria-controls={`${id}-${i}`} onClick={() => schalte(i)}>
                <span className="bl-pyramide-nr" aria-hidden="true">{i + 1}</span>
                <span className="bl-pyramide-label">{e.label}</span>
                <span className="bl-pyramide-zahl">{mehrzahl(items.length, 'Eintrag', 'Einträge')}</span>
                <ChevronDown size={16} className="bl-pyramide-pfeil" aria-hidden="true" />
              </button>
              <ul id={`${id}-${i}`} className="bl-pyramide-liste" hidden={!istOffen}>
                {items.map((item, j) => <li key={j}>{item}</li>)}
              </ul>
            </div>
          );
        })}
      </div>
    </BlockRahmen>
  );
}
