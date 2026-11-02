// ===========================================================================
// Risikokette.jsx — Blocktyp `risikokette` (Deck-Folie 56): die Stufen der
// Risikoweitergabe (Endkunde → Erstversicherer → Rückversicherer →
// Retrozession → Kapitalmarkt/Staat) als Treppe. Jede Stufe nennt, wer das
// Risiko trägt, und ein Beispiel; zwischen den Stufen steht ein
// beschrifteter Pfeil (`uebergang`, sonst „reicht Risiko weiter“).
//
// Die Tönung der Stufenkante folgt der sequenziellen Grün-Rampe — die Kette
// ist geordnet, nicht kategorial. Unter 640 px Blockbreite fällt der
// Treppenversatz weg; die Karten stehen dann untereinander.
// ===========================================================================
import { useMemo } from 'react';
import { ArrowDown, ShieldCheck } from 'lucide-react';
import InlineHtml from './Inline.jsx';
import { GrafikRahmen, ersterText } from './grafikteile.jsx';
import { sequenzFarbe, textFarbeAuf } from './hilfen.js';

export default function Risikokette({ block }) {
  const stufen = useMemo(() => (Array.isArray(block.stufen) ? block.stufen : [])
    .filter((s) => s && typeof s === 'object')
    .map((s) => ({
      titel: ersterText(s.titel, s.title),
      text: ersterText(s.text),
      traegt: ersterText(s.traegt),
      beispiel: ersterText(s.beispiel),
      uebergang: ersterText(s.uebergang),
    })), [block]);

  if (stufen.length === 0) return null;
  const n = stufen.length;

  return (
    <GrafikRahmen block={block} titelFallback="Risikokette" className="bl-risiko-block">
      <ol className="bl-risiko">
        {stufen.map((s, i) => {
          const farbe = sequenzFarbe(n > 1 ? 1 + Math.round((i * 5) / (n - 1)) : 3);
          return (
            <li key={i} className="bl-risiko-stufe" style={{ '--versatz': Math.min(i, 4) }}>
              <div className="bl-risiko-karte" style={{ '--stufenfarbe': farbe }}>
                <div className="bl-risiko-kopf">
                  <span className="bl-risiko-nr" style={{ background: farbe, color: textFarbeAuf(farbe) }} aria-hidden="true">{i + 1}</span>
                  <h4 className="bl-risiko-titel">{s.titel}</h4>
                </div>
                {s.traegt && (
                  <p className="bl-risiko-traegt">
                    <ShieldCheck size={15} aria-hidden="true" />
                    <span><span className="bl-risiko-marke">Trägt:</span> <InlineHtml html={s.traegt} begriffe={false} /></span>
                  </p>
                )}
                {s.text && <p className="bl-risiko-text"><InlineHtml html={s.text} begriffe={false} /></p>}
                {s.beispiel && (
                  <p className="bl-risiko-beispiel">
                    <span className="bl-risiko-marke">Beispiel:</span> <InlineHtml html={s.beispiel} begriffe={false} />
                  </p>
                )}
              </div>
              {i < n - 1 && (
                <p className="bl-risiko-uebergang">
                  <ArrowDown size={17} aria-hidden="true" />
                  <span>{s.uebergang || 'reicht Risiko weiter'}</span>
                </p>
              )}
            </li>
          );
        })}
      </ol>
    </GrafikRahmen>
  );
}
