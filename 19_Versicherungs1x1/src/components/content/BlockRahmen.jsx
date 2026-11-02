// ===========================================================================
// BlockRahmen.jsx — der einheitliche Rahmen jedes Inhaltsblocks: optionale
// Überschrift (h3, 18 px in Einheiten) mit optionalen Aktionen rechts
// (z. B. „Als Tabelle“, „Als Text kopieren“), darunter der Inhalt, darunter
// eine optionale Fußzeile mit der Quelle („Quelle: …“ in --text-3, 12 px;
// mit sourceUrl als Link). Die Quelle steht wie in Fachpublikationen unter
// dem Inhalt, nicht darüber (Begründung im Bericht).
// ===========================================================================
import { useId } from 'react';
import { ExternalLink } from 'lucide-react';

export default function BlockRahmen({
  titel, quelle, quelleUrl, aktionen, fuss, className = '', nurTitel = false, children, ...rest
}) {
  const titelId = useId();
  const klassen = ['bl-rahmen', className, nurTitel ? 'bl-nur-titel' : ''].filter(Boolean).join(' ');
  return (
    <div className={klassen} aria-labelledby={titel ? titelId : undefined} {...rest}>
      {(titel || aktionen) && (
        <div className="bl-kopf">
          {titel ? <h3 className="bl-titel" id={titelId}>{titel}</h3> : <span />}
          {aktionen && <div className="bl-aktionen">{aktionen}</div>}
        </div>
      )}
      {children}
      {(quelle || fuss) && (
        <div className="bl-fuss">
          {fuss}
          {quelle && (
            <span className="bl-quellenzeile">
              Quelle:{' '}
              {quelleUrl ? (
                <a href={quelleUrl} target="_blank" rel="noopener noreferrer">
                  {quelle}
                  <ExternalLink size={11} aria-hidden="true" />
                  <span className="sr-only"> (öffnet in neuem Tab)</span>
                </a>
              ) : quelle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
