// ===========================================================================
// Provisionsrechner.jsx — Blocktyp `provisionCalc` (früher ProvisionCalc.jsx,
// nur im toten levels-Zweig sichtbar). Sparte als Segmentschalter, Eingaben
// je Sparte, Ergebnis mit deutschen Formaten (1.234 €); die Stornozeile
// erscheint nur, wenn die Stornoquote größer als 0 ist. Rechenweg:
//   Leben:    BWS = Monatsbeitrag × 12 × Laufzeit; AP = BWS × Satz ‰; Bestand 2 %/Jahr; Storno 15 %
//   PKV:      BWS = Monatsbeitrag × Faktor (Monatsbeiträge); AP = BWS; Bestand 2 %/Jahr; Storno 10 %
//   Komposit: BWS = Jahresbeitrag; AP = BWS × Satz %; Bestand 20 %/Jahr; kein Storno
// ===========================================================================
import { useId, useMemo, useState } from 'react';
import BlockRahmen from './BlockRahmen.jsx';
import Segment from '../ui/Segment.jsx';
import { euro, prozent, zahl } from '../../lib/format.js';

const SPARTEN = [
  { wert: 'leben', label: 'Leben' },
  { wert: 'pkv', label: 'PKV' },
  { wert: 'sach', label: 'Komposit' },
];
const ANNAHMEN = {
  leben: { bestand: 0.02, storno: 0.15 },
  pkv: { bestand: 0.02, storno: 0.10 },
  sach: { bestand: 0.20, storno: 0 },
};

function Zahlfeld({ id, label, wert, min, max, schritt = 1, einheit, onAendern }) {
  return (
    <div className="bl-feld">
      <label className="feldname" htmlFor={id}>{label}</label>
      <div className="bl-feld-huelle">
        <input id={id} type="number" inputMode="decimal" className="eingabe" min={min} max={max} step={schritt} value={wert} onChange={(e) => onAendern(e.target.value === '' ? '' : Number(e.target.value))} />
        {einheit && <span className="bl-feld-einheit" aria-hidden="true">{einheit}</span>}
      </div>
    </div>
  );
}

function Schieber({ id, label, wert, min, max, schritt = 1, anzeige, onAendern }) {
  return (
    <div className="bl-regler">
      <div className="bl-regler-kopf">
        <label htmlFor={id}>{label}</label>
        <output htmlFor={id} className="bl-regler-wert">{anzeige(wert)}</output>
      </div>
      <input id={id} type="range" min={min} max={max} step={schritt} value={wert} onChange={(e) => onAendern(Number(e.target.value))} aria-valuetext={anzeige(wert)} />
      <div className="bl-regler-skala" aria-hidden="true"><span>{anzeige(min)}</span><span>{anzeige(max)}</span></div>
    </div>
  );
}

export default function Provisionsrechner({ block }) {
  const id = useId();
  const [sparte, setSparte] = useState('leben');
  const [beitrag, setBeitrag] = useState(150);
  const [laufzeit, setLaufzeit] = useState(35);
  const [promille, setPromille] = useState(40);
  const [mbFaktor, setMbFaktor] = useState(7);
  const [satzSach, setSatzSach] = useState(5);

  const e = useMemo(() => {
    const mb = Math.max(0, Number(beitrag) || 0);
    const lz = Math.max(0, Number(laufzeit) || 0);
    const a = ANNAHMEN[sparte];
    let bws;
    let abschluss;
    if (sparte === 'leben') { bws = mb * 12 * lz; abschluss = (bws * promille) / 1000; }
    else if (sparte === 'pkv') { bws = mb * mbFaktor; abschluss = bws; }
    else { bws = mb * 12; abschluss = (bws * satzSach) / 100; }
    const bestand = mb * 12 * a.bestand;
    const storno = abschluss * a.storno;
    return { bws, abschluss, bestand, storno, netto: abschluss - storno, stornoQuote: a.storno, bestandQuote: a.bestand };
  }, [sparte, beitrag, laufzeit, promille, mbFaktor, satzSach]);

  const zeilen = [
    { label: 'Bewertungssumme (BWS)', wert: e.bws, hinweis: sparte === 'leben' ? 'Monatsbeitrag × 12 × Laufzeit' : sparte === 'pkv' ? `Monatsbeitrag × ${zahl(mbFaktor)}` : 'Jahresbeitrag' },
    { label: 'Abschlussprovision', wert: e.abschluss, hervor: true, hinweis: sparte === 'leben' ? `BWS × ${zahl(promille)} ‰` : sparte === 'pkv' ? 'entspricht der BWS' : `BWS × ${prozent(satzSach, 0)}` },
    { label: 'Bestandsprovision je Jahr', wert: e.bestand, hinweis: `${prozent(e.bestandQuote * 100, 0)} des Jahresbeitrags` },
  ];
  if (e.stornoQuote > 0) {
    zeilen.push({ label: `Stornoreserve (${prozent(e.stornoQuote * 100, 0)})`, wert: -e.storno, hinweis: 'vereinfachte Annahme für die Stornohaftungszeit' });
    zeilen.push({ label: 'Netto-Auszahlung', wert: e.netto, summe: true });
  }

  return (
    <BlockRahmen titel={block.title || 'Provisionsrechner'} className="bl-rechner-block">
      <div className="bl-rechner">
        <div className="bl-feld">
          <span className="feldname" id={`${id}-sparte`}>Sparte</span>
          <Segment optionen={SPARTEN} wert={sparte} onWechsel={setSparte} label="Sparte" />
        </div>
        <div className="bl-rechner-eingaben">
          <Zahlfeld id={`${id}-beitrag`} label="Monatsbeitrag" wert={beitrag} min={0} max={100000} einheit="€" onAendern={setBeitrag} />
          {sparte === 'leben' && <Zahlfeld id={`${id}-laufzeit`} label="Laufzeit" wert={laufzeit} min={1} max={60} einheit="Jahre" onAendern={setLaufzeit} />}
          {sparte === 'leben' && <Schieber id={`${id}-promille`} label="Provisionssatz" wert={promille} min={10} max={60} anzeige={(v) => `${zahl(v)} ‰`} onAendern={setPromille} />}
          {sparte === 'pkv' && <Schieber id={`${id}-mb`} label="Provisionssatz in Monatsbeiträgen" wert={mbFaktor} min={2} max={9} anzeige={(v) => `${zahl(v)} MB`} onAendern={setMbFaktor} />}
          {sparte === 'sach' && <Schieber id={`${id}-sach`} label="Abschlusssatz" wert={satzSach} min={0} max={30} anzeige={(v) => prozent(v, 0)} onAendern={setSatzSach} />}
        </div>
        <dl className="bl-rechner-zeilen" aria-live="polite">
          {zeilen.map((z) => (
            <div key={z.label} className="bl-rechner-zeile" data-hervor={z.hervor || undefined} data-summe={z.summe || undefined}>
              <dt>
                {z.label}
                {z.hinweis && <span className="bl-rechner-hinweis">{z.hinweis}</span>}
              </dt>
              <dd>{euro(Math.round(z.wert))}</dd>
            </div>
          ))}
        </dl>
        <p className="meta">Vereinfachte Modellrechnung ohne Steuern, Rückversicherung und individuelle Vereinbarungen.</p>
      </div>
    </BlockRahmen>
  );
}
