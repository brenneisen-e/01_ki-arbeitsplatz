// Leerzustand — freundlich und knapp: Symbol, Titel, ein Satz, eine Aktion.
export default function Leerzustand({ symbol: Symbol, titel, text, aktion, className = '' }) {
  return (
    <div className={`leerzustand ${className}`.trim()}>
      {Symbol && <span className="leerzustand-symbol"><Symbol size={20} aria-hidden="true" /></span>}
      {titel && <div className="leerzustand-titel">{titel}</div>}
      {text && <p className="leerzustand-text">{text}</p>}
      {aktion && <div className="leerzustand-aktion">{aktion}</div>}
    </div>
  );
}
