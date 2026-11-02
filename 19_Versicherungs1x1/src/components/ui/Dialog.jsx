// Dialog — modal: Schleier, Fokusfalle, Esc, Klick auf den Schleier, Scroll-
// Sperre, Hintergrund inert, aria-modal, Fokus-Rückgabe. Titel wird zur
// Beschriftung (aria-labelledby); ohne Titel ist `label` Pflicht.
// ausrichtung: 'mitte' (Standard) oder 'oben' (Suchpalette).
import { useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useEscape, useFokusfalle, useHintergrundInert, useScrollSperre } from './schweben.js';
import Knopf from './Knopf.jsx';

export default function Dialog({
  offen, onSchliessen, titel, beschreibung, label, ausrichtung = 'mitte',
  breite = 560, schliessenKnopf = true, fuss, className = '', children,
}) {
  const id = useId();
  const ref = useRef(null);
  // Reihenfolge: `useHintergrundInert` VOR `useFokusfalle`. React räumt die
  // Effekte in Deklarationsreihenfolge ab — so ist `inert` schon weg, wenn die
  // Fokusfalle den Fokus an den Auslöser zurückgibt (sonst landet er im <body>).
  useHintergrundInert(offen);
  useFokusfalle(ref, offen, { anfang: 'container' });
  useEscape(offen, onSchliessen);
  useScrollSperre(offen);

  if (!offen) return null;
  const titelId = `${id}-titel`;
  const textId = `${id}-text`;
  return createPortal(
    <>
      <div className="schleier" aria-hidden="true" />
      <div
        className="dialog-huelle"
        data-ausrichtung={ausrichtung}
        onMouseDown={(e) => { if (e.target === e.currentTarget) onSchliessen && onSchliessen(); }}
      >
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titel ? titelId : undefined}
          aria-label={!titel ? label : undefined}
          aria-describedby={beschreibung ? textId : undefined}
          tabIndex={-1}
          className={`dialog-flaeche ${className}`.trim()}
          style={{ maxWidth: breite }}
        >
          {(titel || schliessenKnopf) && (
            <div className="dialog-kopf">
              <div>
                {titel && <h2 id={titelId}>{titel}</h2>}
                {beschreibung && <p id={textId} className="dialog-beschreibung">{beschreibung}</p>}
              </div>
              {schliessenKnopf && (
                <Knopf variante="still" nurSymbol symbol={X} aria-label="Schließen" onClick={onSchliessen} />
              )}
            </div>
          )}
          <div className="dialog-koerper">{children}</div>
          {fuss && <div className="dialog-fuss">{fuss}</div>}
        </div>
      </div>
    </>,
    document.body,
  );
}
