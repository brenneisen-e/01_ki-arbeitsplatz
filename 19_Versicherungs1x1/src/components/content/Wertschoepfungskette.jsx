// ===========================================================================
// Wertschoepfungskette.jsx — Blocktyp `valueChain`: Schritte mit Pfeilen
// (ChevronRight), der aktive Schritt zeigt seine Beschreibung in einer Tafel
// darunter (Tab-Muster: Pfeiltasten wechseln, Home/Ende springen). Auf
// schmalen Blöcken stehen die Schritte untereinander.
// ===========================================================================
import { useId, useRef, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { getIconComponent } from '../ui/Icons.jsx';
import BlockRahmen from './BlockRahmen.jsx';
import { ohneTrennstriche } from './hilfen.js';

export default function Wertschoepfungskette({ block }) {
  const schritte = Array.isArray(block.steps) ? block.steps : [];
  const [aktiv, setAktiv] = useState(0);
  const knoepfe = useRef([]);
  const id = useId();
  const n = schritte.length;

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

  const s = schritte[aktiv];
  return (
    <BlockRahmen titel={block.title} quelle={block.source} quelleUrl={block.sourceUrl} className="bl-kette-block">
      <div className="bl-kette" role="tablist" aria-label={block.title || 'Wertschöpfungskette'}>
        {schritte.map((schritt, i) => {
          const Symbol = getIconComponent(schritt.icon || 'settings-2');
          return (
            <div key={schritt.id || i} className="bl-kette-glied">
              <button
                ref={(el) => { knoepfe.current[i] = el; }}
                type="button"
                role="tab"
                id={`${id}-tab-${i}`}
                aria-selected={aktiv === i}
                aria-controls={`${id}-tafel`}
                tabIndex={aktiv === i ? 0 : -1}
                className="bl-kette-schritt"
                onClick={() => waehle(i)}
                onKeyDown={(e) => aufTaste(e, i)}
              >
                <span className="bl-kette-nr" aria-hidden="true">{i + 1}</span>
                <Symbol size={18} aria-hidden="true" />
                <span className="bl-kette-label">{schritt.label}</span>
              </button>
              {i < n - 1 && <ChevronRight size={16} className="bl-kette-pfeil" aria-hidden="true" />}
            </div>
          );
        })}
      </div>
      {s && (
        <div className="bl-kette-tafel" role="tabpanel" id={`${id}-tafel`} aria-labelledby={`${id}-tab-${aktiv}`}>
          <div className="bl-kette-tafel-kopf">
            <span className="meta">Schritt {aktiv + 1} von {n}</span>
            <h4>{ohneTrennstriche(s.label)}</h4>
          </div>
          {s.description && <p>{s.description}</p>}
        </div>
      )}
    </BlockRahmen>
  );
}
