// Knopf — Varianten primaer · sekundaer (Standard) · still · weich,
// Größen klein · normal · gross; mit href wird ein Link daraus.
// Reine Symbolknöpfe brauchen ein aria-label.
const GROESSE_ICON = { klein: 14, normal: 16, gross: 18 };

export default function Knopf({
  variante = 'sekundaer', groesse = 'normal',
  symbol: Symbol, symbolRechts: SymbolRechts, nurSymbol = false,
  href, breit = false, className = '', type = 'button', children, ...rest
}) {
  const klassen = ['knopf'];
  if (variante === 'primaer') klassen.push('knopf-primaer');
  if (variante === 'still') klassen.push('knopf-still');
  if (variante === 'weich') klassen.push('knopf-weich');
  if (groesse === 'klein') klassen.push('knopf-klein');
  if (groesse === 'gross') klassen.push('knopf-gross');
  if (nurSymbol) klassen.push('knopf-symbol');
  if (breit) klassen.push('knopf-breit');
  if (className) klassen.push(className);
  const px = GROESSE_ICON[groesse] || 16;
  const inhalt = (
    <>
      {Symbol && <Symbol size={px} aria-hidden="true" />}
      {!nurSymbol && children}
      {SymbolRechts && <SymbolRechts size={px} aria-hidden="true" />}
    </>
  );
  if (href) {
    return <a href={href} className={klassen.join(' ')} {...rest}>{inhalt}</a>;
  }
  return <button type={type} className={klassen.join(' ')} {...rest}>{inhalt}</button>;
}
