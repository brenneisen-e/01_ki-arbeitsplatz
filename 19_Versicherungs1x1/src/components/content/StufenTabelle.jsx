// ===========================================================================
// StufenTabelle.jsx – Blocktyp `stufenTabelle` (Deck-Folien 68 und 69):
// ein Rechenschema (Versicherungs-GuV, Kennzahlen) mit Rechenzeichen in
// eigener schmaler Spalte, Posten, Zwischensummen und Endsumme.
//
//   Posten        normaler Grund
//   Zwischensumme --marke-weich mit linker Kante in --marke
//   Endsumme      --marke mit weißer Schrift
//
// Die optionale Formel steht klein unter der Bedeutung. Unter 560 px
// Blockbreite wird jede Zeile zu einem Block (Zeile über Bedeutung) – der
// Tabellenkopf entfällt dann sichtbar, bleibt aber für Vorlesehilfen da.
// ===========================================================================
import { useMemo } from 'react';
import { Check, Copy } from 'lucide-react';
import Knopf from '../ui/Knopf.jsx';
import InlineHtml from './Inline.jsx';
import { GrafikRahmen, ZEICHEN_WORT, ersterText, useZweitfassung } from './grafikteile.jsx';
import { useKopieren } from './hilfen.js';
import { entferneHtml } from '../../lib/text.js';

const ARTEN = new Set(['zwischensumme', 'endsumme', 'posten']);
/** Sichtbare Form der Rechenzeichen: echtes Minus statt Bindestrich. */
const ZEICHEN_ANZEIGE = { '-': '−' };

export default function StufenTabelle({ block }) {
  const [kopiert, kopiere] = useKopieren();
  const { ref, schmal } = useZweitfassung(560);

  const zeilen = useMemo(() => (Array.isArray(block.zeilen) ? block.zeilen : [])
    .filter((z) => z && typeof z === 'object')
    .map((z) => ({
      zeichen: ersterText(z.zeichen),
      text: ersterText(z.text),
      bedeutung: ersterText(z.bedeutung),
      formel: ersterText(z.formel),
      art: ARTEN.has(String(z.art || '')) ? String(z.art) : 'posten',
    })), [block]);

  if (zeilen.length === 0) return null;

  const kopf = Array.isArray(block.kopf) ? block.kopf : [];
  const kopfZeile = ersterText(kopf[0]) || 'Zeile';
  const kopfBedeutung = ersterText(kopf[1]) || 'Bedeutung';

  const alsText = () => [
    ['', kopfZeile, kopfBedeutung].join('\t'),
    ...zeilen.map((z) => [z.zeichen, entferneHtml(z.text), entferneHtml([z.bedeutung, z.formel].filter(Boolean).join(' – '))].join('\t')),
  ].join('\n');

  return (
    <GrafikRahmen
      block={block}
      titelFallback="Rechenschema"
      className="bl-stufen-block"
      aktionen={(
        <Knopf groesse="klein" variante="still" symbol={kopiert === 'kopiert' ? Check : Copy} onClick={() => kopiere(alsText())} aria-live="polite">
          {kopiert === 'kopiert' ? 'Kopiert' : 'Als Text kopieren'}
        </Knopf>
      )}
    >
      <div ref={ref} className="bl-stufen-huelle" data-schmal={schmal || undefined}>
        <table className="bl-stufen">
          <thead>
            <tr>
              <th scope="col"><span className="sr-only">Rechenzeichen</span></th>
              <th scope="col">{kopfZeile}</th>
              <th scope="col">{kopfBedeutung}</th>
            </tr>
          </thead>
          <tbody>
            {zeilen.map((z, i) => (
              <tr key={i} className="bl-stufen-zeile" data-art={z.art}>
                <td className="bl-stufen-zeichen">
                  <span aria-hidden="true">{ZEICHEN_ANZEIGE[z.zeichen] || z.zeichen}</span>
                  <span className="sr-only">{ZEICHEN_WORT[z.zeichen] || z.zeichen}</span>
                </td>
                <th scope="row" className="bl-stufen-text">
                  <InlineHtml html={z.text} begriffe={false} />
                </th>
                <td className="bl-stufen-bedeutung">
                  <span className="bl-stufen-bedeutung-text"><InlineHtml html={z.bedeutung} begriffe={false} /></span>
                  {z.formel && <span className="bl-stufen-formel">{z.formel}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GrafikRahmen>
  );
}
