// ===========================================================================
// CombinedRatioRechner.jsx — Blocktyp `combinedRatioCalc`: zwei Regler
// (Schadenquote, Kostenquote) mit Wertanzeige, Ergebniskarte mit deutscher
// Formatierung und Einordnung (Gewinn / Break-even / Verlust). Regler sind
// native Bereichsfelder — per Tastatur bedienbar. Lebt in der Lesespalte.
// ===========================================================================
import { useId, useState } from 'react';
import BlockRahmen from './BlockRahmen.jsx';
import { prozent } from '../../lib/format.js';

function Regler({ id, label, wert, min, max, onAendern, hinweis }) {
  return (
    <div className="bl-regler">
      <div className="bl-regler-kopf">
        <label htmlFor={id}>{label}</label>
        <output htmlFor={id} className="bl-regler-wert">{prozent(wert, 0)}</output>
      </div>
      <input id={id} type="range" min={min} max={max} step={1} value={wert} onChange={(e) => onAendern(Number(e.target.value))} aria-valuetext={prozent(wert, 0)} />
      <div className="bl-regler-skala" aria-hidden="true"><span>{prozent(min, 0)}</span>{hinweis && <span>{hinweis}</span>}<span>{prozent(max, 0)}</span></div>
    </div>
  );
}

export default function CombinedRatioRechner({ block }) {
  const [schaden, setSchaden] = useState(65);
  const [kosten, setKosten] = useState(28);
  const id = useId();
  const summe = schaden + kosten;
  const ton = summe < 100 ? 'erfolg' : summe === 100 ? 'warnung' : 'fehler';
  const deutung = summe < 100
    ? `Versicherungstechnischer Gewinn von ${prozent(100 - summe, 0)} der Beiträge`
    : summe === 100
      ? 'Break-even – weder versicherungstechnischer Gewinn noch Verlust'
      : `Versicherungstechnischer Verlust von ${prozent(summe - 100, 0)} der Beiträge`;

  return (
    <BlockRahmen titel={block.title || 'Combined-Ratio-Rechner'} className="bl-rechner-block">
      <div className="bl-rechner">
        <p className="bl-rechner-formel">Combined Ratio = Schadenquote + Kostenquote</p>
        <div className="bl-rechner-eingaben">
          <Regler id={`${id}-schaden`} label="Schadenquote (Loss Ratio)" wert={schaden} min={30} max={120} onAendern={setSchaden} />
          <Regler id={`${id}-kosten`} label="Kostenquote (Expense Ratio)" wert={kosten} min={10} max={60} onAendern={setKosten} />
        </div>
        <div className="bl-rechner-ergebnis" data-ton={ton} aria-live="polite">
          <span className="bl-rechner-ergebnis-label">Combined Ratio</span>
          <span className="bl-rechner-ergebnis-wert">{prozent(summe, 0)}</span>
          <span className="bl-rechner-ergebnis-text">{deutung}</span>
        </div>
      </div>
    </BlockRahmen>
  );
}
