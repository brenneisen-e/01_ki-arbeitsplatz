// Eingabe — Textfeld mit optionalem Symbol links, Löschknopf und Feldname.
// `ref` wird (React 19) als Prop durchgereicht.
import { useId } from 'react';
import { X } from 'lucide-react';

export default function Eingabe({
  wert = '', onAendern, placeholder, symbol: Symbol, label, loeschbar = false, gross = false,
  className = '', id, ref, ...rest
}) {
  const eigeneId = useId();
  const feldId = id || eigeneId;
  const klassen = ['eingabe', gross ? 'eingabe-gross' : '', loeschbar && wert ? 'eingabe-mit-loeschen' : ''].filter(Boolean).join(' ');
  return (
    <div className={className}>
      {label && <label htmlFor={feldId} className="feldname">{label}</label>}
      <div className="eingabe-huelle">
        {Symbol && <Symbol size={16} aria-hidden="true" />}
        <input
          ref={ref}
          id={feldId}
          type="text"
          className={klassen}
          value={wert}
          onChange={(e) => onAendern && onAendern(e.target.value, e)}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck={false}
          {...rest}
        />
        {loeschbar && wert && (
          <button type="button" className="eingabe-loeschen" aria-label="Eingabe löschen" onClick={() => onAendern && onAendern('')}>
            <X size={14} aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}
