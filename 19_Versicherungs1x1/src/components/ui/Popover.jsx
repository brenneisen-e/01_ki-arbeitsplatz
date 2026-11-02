// Popover — nicht-modale Fläche am Auslöser: Portal, geklemmt, Fokus rein
// beim Öffnen und zurück beim Schließen, Esc, Klick außerhalb, aria-expanded /
// aria-controls am Auslöser. `ausloeser` ist ein einzelnes Element (Knopf).
// Gesteuert (offen/onOeffnen/onSchliessen) oder ungesteuert.
// `fokus={false}` öffnet ohne Fokuswechsel (und ohne Fokusfalle) — für per
// Zeiger geöffnete Flächen, die niemandem den Fokus aus der Hand nehmen
// dürfen. Wird die Fläche danach angeheftet (Klick), greift die Falle.
import { cloneElement, isValidElement, useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { berechnePosition, useEscape, useFokusfalle } from './schweben.js';

export default function Popover({
  ausloeser, offen: offenProp, onOeffnen, onSchliessen,
  seite = 'unten', ausrichtung = 'anfang', titel, fokus = true, className = '', children,
}) {
  const id = useId();
  const gesteuert = typeof offenProp === 'boolean';
  const [offenIntern, setOffenIntern] = useState(false);
  const offen = gesteuert ? offenProp : offenIntern;
  const [pos, setPos] = useState(null);
  const ankerRef = useRef(null);
  const flaecheRef = useRef(null);

  const oeffne = useCallback(() => { if (!gesteuert) setOffenIntern(true); onOeffnen && onOeffnen(); }, [gesteuert, onOeffnen]);
  const schliesse = useCallback(() => { if (!gesteuert) setOffenIntern(false); onSchliessen && onSchliessen(); }, [gesteuert, onSchliessen]);
  const umschalten = useCallback(() => (offen ? schliesse() : oeffne()), [offen, oeffne, schliesse]);

  useFokusfalle(flaecheRef, offen && fokus !== false);
  useEscape(offen, schliesse);

  useEffect(() => {
    if (!offen) return undefined;
    const aufZeiger = (e) => {
      if (flaecheRef.current?.contains(e.target) || ankerRef.current?.contains(e.target)) return;
      schliesse();
    };
    document.addEventListener('pointerdown', aufZeiger, true);
    return () => document.removeEventListener('pointerdown', aufZeiger, true);
  }, [offen, schliesse]);

  useLayoutEffect(() => {
    if (!offen || !ankerRef.current || !flaecheRef.current) { setPos(null); return undefined; }
    const setze = () => {
      const anker = ankerRef.current.getBoundingClientRect();
      const b = flaecheRef.current.getBoundingClientRect();
      setPos(berechnePosition(anker, { width: b.width, height: b.height }, { seite, ausrichtung, abstand: 8 }));
    };
    setze();
    window.addEventListener('scroll', setze, true);
    window.addEventListener('resize', setze);
    return () => { window.removeEventListener('scroll', setze, true); window.removeEventListener('resize', setze); };
  }, [offen, seite, ausrichtung, children]);

  if (!isValidElement(ausloeser)) return null;
  const anker = cloneElement(ausloeser, {
    ref: ankerRef,
    'aria-expanded': offen,
    'aria-controls': offen ? id : undefined,
    'aria-haspopup': 'dialog',
    onClick: (e) => { ausloeser.props.onClick && ausloeser.props.onClick(e); if (!e.defaultPrevented) umschalten(); },
  });

  return (
    <>
      {anker}
      {offen && createPortal(
        <div
          ref={flaecheRef}
          id={id}
          role="dialog"
          aria-label={typeof titel === 'string' ? titel : undefined}
          tabIndex={-1}
          className={`popover-flaeche ${className}`.trim()}
          style={{ top: pos ? pos.top : -9999, left: pos ? pos.left : -9999, visibility: pos ? 'visible' : 'hidden' }}
        >
          {children}
        </div>,
        document.body,
      )}
    </>
  );
}
