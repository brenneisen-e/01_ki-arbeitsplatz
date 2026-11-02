// Pille — tonale Marke ohne Interaktion. Töne: neutral (Standard), marke,
// erfolg, warnung, fehler, info, basis, vertiefung, experte.
export default function Pille({ ton = 'neutral', punkt = false, className = '', children, ...rest }) {
  return (
    <span className={`pille ${className}`.trim()} data-ton={ton} {...rest}>
      {punkt && <span className="pille-punkt" aria-hidden="true" />}
      {children}
    </span>
  );
}
