// ===========================================================================
// Heatmap.jsx — Blocktyp `heatmapGrid`: Zeilen × Spalten, Zellfarbe aus der
// sequenziellen Grün-Rampe (--viz-sequenz-100 … 700, relativ zum Maximum),
// Wert in der Zelle, Textfarbe nach Helligkeit (Weiß oder Text, was mehr
// Kontrast hat), Legendenbalken mit Minimum und Maximum.
// ===========================================================================
import { useMemo } from 'react';
import BlockRahmen from './BlockRahmen.jsx';
import { zahl } from '../../lib/format.js';
import { sequenzFarbe, textFarbeAuf, einheitAusTitel } from './hilfen.js';

export default function Heatmap({ block }) {
  const zeilen = Array.isArray(block.rows) ? block.rows : [];
  const spalten = Array.isArray(block.columns) ? block.columns : [];
  const daten = Array.isArray(block.data) ? block.data : [];
  const einheit = block.unit || einheitAusTitel(block.title);
  const max = useMemo(() => Math.max(1, ...daten.flat().map((v) => Number(v) || 0)), [daten]);
  const fmt = (v) => (einheit ? `${zahl(v)} ${einheit}` : zahl(v));
  const stufen = [0, 1, 2, 3, 4, 5, 6];

  return (
    <BlockRahmen titel={block.title} quelle={block.source} quelleUrl={block.sourceUrl} className="bl-heatmap-block">
      {/* Rollrahmen wie bei der Tabelle: mit Tastaturzugang und Namen, damit
          auch ohne Maus gescrollt werden kann (die Werte stehen als Text in
          den Zellen, die Tabelle selbst ist für Vorleseprogramme lesbar). */}
      <div className="bl-heatmap-huelle" data-rollen="absicht" tabIndex={0} role="region" aria-label={`${block.title || 'Heatmap'} (seitlich scrollbar)`}>
        <table className="bl-heatmap">
          {block.title && <caption className="sr-only">{block.title}</caption>}
          <thead>
            <tr>
              <th scope="col" className="bl-heatmap-ecke"><span className="sr-only">Zeile</span></th>
              {spalten.map((s, i) => <th key={i} scope="col">{s}</th>)}
            </tr>
          </thead>
          <tbody>
            {zeilen.map((z, ri) => (
              <tr key={ri}>
                <th scope="row">{z}</th>
                {spalten.map((s, ci) => {
                  const v = Number(daten[ri]?.[ci]);
                  if (!Number.isFinite(v)) return <td key={ci} className="bl-heatmap-leer">–</td>;
                  const farbe = sequenzFarbe((v / max) * 6);
                  return (
                    <td key={ci} className="bl-heatmap-zelle" style={{ background: farbe, color: textFarbeAuf(farbe) }} title={`${z} × ${s}: ${fmt(v)}`}>
                      {fmt(v)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bl-heatmap-legende" aria-hidden="true">
        <span>{fmt(0)}</span>
        <span className="bl-heatmap-balken">
          {stufen.map((s) => <span key={s} style={{ background: sequenzFarbe(s) }} />)}
        </span>
        <span>{fmt(max)}</span>
      </div>
    </BlockRahmen>
  );
}
