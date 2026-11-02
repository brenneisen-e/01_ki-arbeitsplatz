// Frage — eine Frage je Bildschirm: Zähler mit Fortschrittsleiste, Kapitel-
// Pille, Fragetext als h2 (erhält den Fokus, damit Screenreader die neue
// Frage ansagen), Optionen als große Knöpfe mit Buchstaben A–D (nach dem
// Mischen vergeben) und Tastenhinweis 1–4, sofortiges Feedback ohne
// Übergangs-Show: richtig in --erfolg, falsch in --fehler mit markierter
// Lösung, Erklärung, „Im Kapitel nachlesen“ und Weiter. Die Tasten selbst
// wertet die Seite aus (ein Handler für alle Fragen).
import { useEffect, useRef } from 'react';
import { X, Check, CircleCheck, CircleX, BookOpen, ArrowRight } from 'lucide-react';
import Pille from '../ui/Pille.jsx';
import Knopf from '../ui/Knopf.jsx';
import Kbd from '../ui/Kbd.jsx';
import { nummer } from '../../lib/text.js';

export default function Frage({ frage, position, gesamt, antwort, nachleseHref, onAntwort, onWeiter, onAbbrechen }) {
  const titelRef = useRef(null);

  // Neue Frage: nach oben, Fokus auf den Fragetext (nie auf einen Knopf, sonst
  // würde Enter die alte Option der neuen Frage wählen).
  useEffect(() => {
    if (window.scrollY > 0) window.scrollTo({ top: 0 });
    if (titelRef.current) titelRef.current.focus({ preventScroll: true });
  }, [frage.frageId, position]);

  const beantwortet = Boolean(antwort);
  const letzte = position >= gesamt;
  const loesung = frage.optionen[frage.richtig];
  const zustandVon = (i) => {
    if (!beantwortet) return undefined;
    if (i === frage.richtig) return antwort.gewaehlt === i ? 'richtig' : 'loesung';
    if (antwort.gewaehlt === i) return 'falsch';
    return 'neutral';
  };
  const zustandText = { richtig: 'richtig', falsch: 'falsch', loesung: 'richtige Antwort', neutral: '' };
  const nachleseZiel = frage.einheitTitel ? `${frage.kapitelTitel} › ${frage.einheitTitel}` : frage.kapitelTitel;

  return (
    <section className="quiz-frage" aria-label={`Frage ${position} von ${gesamt}`}>
      <div className="quiz-frage-kopf">
        <span className="quiz-frage-zaehler">Frage {position} von {gesamt}</span>
        <Pille ton="marke">{nummer(frage.kapitelIndex)} · {frage.kapitelTitel}</Pille>
        <span className="quiz-frage-platz" />
        <Knopf variante="still" groesse="klein" symbol={X} onClick={onAbbrechen}>Abbrechen</Knopf>
      </div>
      <div
        className="quiz-balken"
        role="progressbar"
        aria-label="Fortschritt im Durchgang"
        aria-valuemin={0}
        aria-valuemax={gesamt}
        aria-valuenow={position}
        aria-valuetext={`Frage ${position} von ${gesamt}`}
      >
        <div className="quiz-balken-wert" style={{ width: `${(position / gesamt) * 100}%` }} />
      </div>

      <h2 ref={titelRef} tabIndex={-1} className="quiz-frage-text">{frage.text}</h2>

      <div className="quiz-antworten" role="group" aria-label="Antwortmöglichkeiten">
        {frage.optionen.map((o, i) => {
          const zustand = zustandVon(i);
          return (
            <button
              key={o.buchstabe}
              type="button"
              className="quiz-antwort"
              data-zustand={zustand}
              aria-disabled={beantwortet || undefined}
              onClick={() => { if (!beantwortet) onAntwort(i); }}
            >
              <span className="quiz-antwort-buchstabe" aria-hidden="true">{o.buchstabe}</span>
              <span className="quiz-antwort-text">
                <span className="sr-only">{o.buchstabe}: </span>
                {o.text}
                {zustand && zustandText[zustand] && <span className="sr-only"> – {zustandText[zustand]}</span>}
              </span>
              <span className="quiz-antwort-ende" aria-hidden="true">
                {!beantwortet && <Kbd>{i + 1}</Kbd>}
                {(zustand === 'richtig' || zustand === 'loesung') && <Check size={18} />}
                {zustand === 'falsch' && <X size={18} />}
              </span>
            </button>
          );
        })}
      </div>

      <div className="quiz-feedback" role="status" aria-live="polite" aria-atomic="true">
        {beantwortet && (
          <div className="quiz-feedback-flaeche">
            <div className="quiz-feedback-titel" data-ton={antwort.richtig ? 'erfolg' : 'fehler'}>
              {antwort.richtig ? <CircleCheck size={18} aria-hidden="true" /> : <CircleX size={18} aria-hidden="true" />}
              <span>{antwort.richtig ? 'Richtig' : `Falsch – richtig ist ${loesung.buchstabe}: ${loesung.text}`}</span>
            </div>
            {frage.erklaerung && <p className="quiz-feedback-text">{frage.erklaerung}</p>}
            <div className="quiz-feedback-fuss">
              <span className="quiz-feedback-links">
                <Knopf variante="still" symbol={BookOpen} href={nachleseHref} title={`Nachlesen in ${nachleseZiel}`}>
                  Im Kapitel nachlesen
                </Knopf>
                {antwort.hinweis && <span className="meta">{antwort.hinweis}</span>}
              </span>
              <Knopf variante="primaer" symbolRechts={ArrowRight} onClick={onWeiter}>
                {letzte ? 'Ergebnis anzeigen' : 'Weiter'}
              </Knopf>
            </div>
          </div>
        )}
      </div>

      <div className="quiz-tastenhilfe" aria-hidden="true">
        <span className="quiz-tastenhilfe-teil"><Kbd>1</Kbd>–<Kbd>{Math.min(4, frage.optionen.length)}</Kbd> wählen</span>
        <span className="quiz-tastenhilfe-teil"><Kbd taste="Enter" /> weiter</span>
        <span className="quiz-tastenhilfe-teil"><Kbd taste="Esc" /> abbrechen</span>
      </div>
    </section>
  );
}
