// Chip — kleine Auswahl- oder Verweisfläche (mind. 28 px hoch).
// aktiv → aria-pressed bei Knöpfen, aria-current bei Links.
export default function Chip({ aktiv = false, symbol: Symbol, zahl, href, className = '', children, ...rest }) {
  const klassen = ['chip', aktiv ? 'chip-aktiv' : '', className].filter(Boolean).join(' ');
  const inhalt = (
    <>
      {Symbol && <Symbol size={14} aria-hidden="true" />}
      <span>{children}</span>
      {zahl != null && <span className="chip-zahl">{zahl}</span>}
    </>
  );
  if (href) {
    return <a href={href} className={klassen} aria-current={aktiv ? 'true' : undefined} {...rest}>{inhalt}</a>;
  }
  return <button type="button" className={klassen} aria-pressed={rest.onClick ? aktiv : undefined} {...rest}>{inhalt}</button>;
}
