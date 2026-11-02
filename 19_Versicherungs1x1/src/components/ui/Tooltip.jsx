// Tooltip — Portal auf document.body, im Fenster geklemmt, Hover (mit kurzer
// Verzögerung) und Fokus, role="tooltip", per aria-describedby verknüpft.
// Das Kind muss ein einzelnes Element sein (Knopf, Link, Span).
import { Children, cloneElement, isValidElement, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { berechnePosition } from './schweben.js';

export default function Tooltip({ text, seite = 'unten', verzoegerung = 350, children }) {
  const id = useId();
  const [offen, setOffen] = useState(false);
  const [pos, setPos] = useState(null);
  const ankerRef = useRef(null);
  const blaseRef = useRef(null);
  const timer = useRef(0);

  const zeige = () => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOffen(true), verzoegerung);
  };
  const zeigeSofort = () => { window.clearTimeout(timer.current); setOffen(true); };
  const verberge = () => { window.clearTimeout(timer.current); setOffen(false); };

  useEffect(() => () => window.clearTimeout(timer.current), []);

  useEffect(() => {
    if (!offen) return undefined;
    const aufEsc = (e) => { if (e.key === 'Escape') setOffen(false); };
    document.addEventListener('keydown', aufEsc);
    return () => document.removeEventListener('keydown', aufEsc);
  }, [offen]);

  useLayoutEffect(() => {
    if (!offen || !ankerRef.current || !blaseRef.current) { setPos(null); return undefined; }
    const setze = () => {
      const anker = ankerRef.current.getBoundingClientRect();
      const b = blaseRef.current.getBoundingClientRect();
      setPos(berechnePosition(anker, { width: b.width, height: b.height }, { seite, abstand: 8 }));
    };
    setze();
    window.addEventListener('scroll', setze, true);
    window.addEventListener('resize', setze);
    return () => { window.removeEventListener('scroll', setze, true); window.removeEventListener('resize', setze); };
  }, [offen, seite, text]);

  const kind = Children.only(children);
  if (!isValidElement(kind) || !text) return kind;
  const anker = cloneElement(kind, {
    ref: ankerRef,
    'aria-describedby': offen ? id : kind.props['aria-describedby'],
    onMouseEnter: (e) => { kind.props.onMouseEnter && kind.props.onMouseEnter(e); zeige(); },
    onMouseLeave: (e) => { kind.props.onMouseLeave && kind.props.onMouseLeave(e); verberge(); },
    onFocus: (e) => { kind.props.onFocus && kind.props.onFocus(e); zeigeSofort(); },
    onBlur: (e) => { kind.props.onBlur && kind.props.onBlur(e); verberge(); },
    onPointerDown: (e) => { kind.props.onPointerDown && kind.props.onPointerDown(e); verberge(); },
  });

  return (
    <>
      {anker}
      {offen && createPortal(
        <div
          ref={blaseRef}
          id={id}
          role="tooltip"
          className="tooltip-blase"
          style={{ top: pos ? pos.top : -9999, left: pos ? pos.left : -9999, visibility: pos ? 'visible' : 'hidden' }}
        >
          {text}
        </div>,
        document.body,
      )}
    </>
  );
}
