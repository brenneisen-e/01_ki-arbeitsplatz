// Karte — weiße Fläche mit 1-px-Rand und 12 px Radius. Mit href ein Link,
// mit onClick ein Knopf (beides mit leisem Hover), sonst ein Element `als`.
export default function Karte({ als = 'div', href, onClick, eng = false, className = '', children, ...rest }) {
  const klassen = ['karte', eng ? 'karte-eng' : '', href || onClick ? 'karte-klickbar' : '', className].filter(Boolean).join(' ');
  if (href) return <a href={href} className={klassen} onClick={onClick} {...rest}>{children}</a>;
  if (onClick) return <button type="button" className={klassen} onClick={onClick} {...rest}>{children}</button>;
  const Element = als;
  return <Element className={klassen} {...rest}>{children}</Element>;
}
