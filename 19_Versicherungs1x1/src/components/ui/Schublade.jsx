// Schublade — Drawer von links (Navigation unter 1024 px). Gleiche Mechanik
// wie der Dialog: Fokusfalle, Esc, Schleier-Klick, Scroll-Sperre, inert.
import { useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useEscape, useFokusfalle, useHintergrundInert, useScrollSperre } from './schweben.js';
import Knopf from './Knopf.jsx';

export default function Schublade({ offen, onSchliessen, titel = 'Navigation', children }) {
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
  return createPortal(
    <>
      <div className="schleier schublade-schleier" onMouseDown={onSchliessen} aria-hidden="true" />
      <aside
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-titel`}
        tabIndex={-1}
        className="schublade-flaeche"
      >
        <div className="schublade-kopf">
          {/* eigene Klasse, nicht `marke-wort`: die wird unter 480 px
              ausgeblendet (Topbar) — der Kopf der Schublade stand dort ohne
              Titel da, und der Name des Dialogs war leer. */}
          <span id={`${id}-titel`} className="schublade-titel">{titel}</span>
          <Knopf variante="still" nurSymbol symbol={X} aria-label="Navigation schließen" onClick={onSchliessen} />
        </div>
        <div className="schublade-koerper">{children}</div>
      </aside>
    </>,
    document.body,
  );
}
