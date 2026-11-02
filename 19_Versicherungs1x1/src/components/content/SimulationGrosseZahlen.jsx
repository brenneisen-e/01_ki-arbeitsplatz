// ===========================================================================
// SimulationGrosseZahlen.jsx — Blocktyp `simulationGrosseZahlen`
// (Deck-Folien 52–53): das Gesetz der großen Zahlen zum Anfassen.
//
// Drei Regler: Kollektivgröße n (10 … 100.000, logarithmisch in 12 Stufen
// je Dekade), Schadenwahrscheinlichkeit p (0,1 … 20 %) und Schadenhöhe S
// (1.000 … 500.000 €). `vorgabe.wahrscheinlichkeit` gilt in Prozent.
//
// Gerechnet wird ehrlich und ohne Zufall (eine Ziehung würde bei jedem
// Rendern wackeln — die Formeln sind exakt):
//   Erwartungsschaden je Kopf      E   = p × S
//   Streuung eines Einzelrisikos   σ   = S × √(p (1 − p))
//   Streuung je Kopf im Kollektiv  σn  = σ / √n
//   Relativer Schwankungsbereich   cv  = σn / E = √((1 − p) / p) / √n
//   Sicherheitszuschlag (Ruin 0,5 %)   = 2,576 × σn   (Normalapproximation)
// Das Diagramm zeichnet den Trichter cv über n selbst als SVG — kein
// Nachladen, keine Bibliothek. Unter 520 px Blockbreite (und über den
// Umschalter) tritt die Tabelle an seine Stelle.
// ===========================================================================
import { useId, useMemo, useState } from 'react';
import { GrafikRahmen, AnsichtsWahl, alsListe, useZweitfassung } from './grafikteile.jsx';
import InlineHtml from './Inline.jsx';
import { euro, prozent, zahl } from '../../lib/format.js';

const Z_RUIN = 2.576; // Normalquantil für eine Ruinwahrscheinlichkeit von 0,5 %
const RUIN = 0.5;
const N_MIN = 10;
const N_MAX = 100000;
const STUFEN_JE_DEKADE = 12;
const STUFEN = STUFEN_JE_DEKADE * 4; // 10 → 100.000
const MERK_KLEIN = 10;
const MERK_GROSS = 10000;
const TABELLE_N = [10, 100, 1000, 10000, 100000];

/** Auf `stellen` bedeutende Stellen runden (10 · 10^(t/12) → 12, 15, 18 …). */
function rundeSig(x, stellen = 2) {
  if (!(x > 0)) return 0;
  const m = 10 ** (Math.floor(Math.log10(x)) - stellen + 1);
  return Math.round(x / m) * m;
}
const nVonStufe = (t) => Math.min(N_MAX, Math.max(N_MIN, rundeSig(N_MIN * 10 ** (t / STUFEN_JE_DEKADE))));
const stufeVonN = (n) => Math.min(STUFEN, Math.max(0, Math.round(STUFEN_JE_DEKADE * Math.log10(Math.max(N_MIN, Number(n) || N_MIN) / N_MIN))));

/** Euro mit wenigen Stellen: ab 100 € ganze Euro, darunter Cent. */
const euroKurz = (v) => euro(Math.abs(v) >= 100 ? Math.round(v) : Math.round(v * 100) / 100);

/** Kennzahlen für eine Kollektivgröße. */
function rechne(n, pAnteil, hoehe) {
  const erwartung = pAnteil * hoehe;
  const sigmaEinzel = hoehe * Math.sqrt(pAnteil * (1 - pAnteil));
  const sigmaKopf = sigmaEinzel / Math.sqrt(n);
  const cv = erwartung > 0 ? sigmaKopf / erwartung : 0;
  return { erwartung, sigmaEinzel, sigmaKopf, cv, zuschlag: Z_RUIN * sigmaKopf, zuschlagRelativ: Z_RUIN * cv };
}

function Regler({ id, label, wert, min, max, schritt, anzeige, skala, onAendern }) {
  return (
    <div className="bl-regler">
      <div className="bl-regler-kopf">
        <label htmlFor={id}>{label}</label>
        <output htmlFor={id} className="bl-regler-wert">{anzeige}</output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={schritt}
        value={wert}
        aria-valuetext={anzeige}
        onChange={(e) => onAendern(Number(e.target.value))}
      />
      <div className="bl-regler-skala" aria-hidden="true"><span>{skala[0]}</span><span>{skala[1]}</span></div>
    </div>
  );
}

export default function SimulationGrosseZahlen({ block }) {
  const id = useId();
  const vorgabe = block.vorgabe && typeof block.vorgabe === 'object' ? block.vorgabe : {};
  const [stufe, setStufe] = useState(() => stufeVonN(vorgabe.kollektiv ?? 1000));
  const [pProzent, setPProzent] = useState(() => {
    const v = Number(vorgabe.wahrscheinlichkeit);
    return Number.isFinite(v) ? Math.min(20, Math.max(0.1, Math.round(v * 10) / 10)) : 1;
  });
  const [hoehe, setHoehe] = useState(() => {
    const v = Number(vorgabe.schadenhoehe);
    return Number.isFinite(v) ? Math.min(500000, Math.max(1000, Math.round(v / 1000) * 1000)) : 100000;
  });
  const [ansicht, setAnsicht] = useState('grafik');
  const { ref, breite, schmal } = useZweitfassung(520);

  const n = nVonStufe(stufe);
  const p = pProzent / 100;
  const e = useMemo(() => rechne(n, p, hoehe), [n, p, hoehe]);
  const merkKlein = rechne(MERK_KLEIN, p, hoehe);
  const merkGross = rechne(MERK_GROSS, p, hoehe);
  const erwarteteSchaeden = n * p;
  const zeigeTabelle = ansicht === 'text' || schmal;

  // ----------------------------------------------------------------- Trichter
  const W = Math.max(280, Math.min(660, Math.floor(breite) || 660));
  const H = schmal ? 200 : 236;
  const padL = 50;
  const padR = 16;
  const padT = 14;
  const padB = 52;
  const plotB = W - padL - padR;
  const plotH = H - padT - padB;
  const bandBei10 = rechne(N_MIN, p, hoehe).zuschlagRelativ * 100;
  const yMax = 200; // feste Achse: der Trichter verlässt links den Rahmen, statt dort zu verflachen
  const xVonN = (wert) => padL + ((Math.log10(wert) - 1) / 4) * plotB;
  // ungeklemmt: Werte außerhalb werden am Rahmen abgeschnitten (clipPath)
  const yVonProzent = (wert) => padT + plotH - (wert / yMax) * plotH;
  const clipId = `${id}-plot`.replace(/:/g, '');
  const punkte = [];
  for (let i = 0; i <= 80; i += 1) {
    const nI = N_MIN * 10 ** ((i / 80) * 4);
    const band = rechne(nI, p, hoehe).zuschlagRelativ * 100;
    punkte.push({ x: xVonN(nI), oben: yVonProzent(100 + band), unten: yVonProzent(100 - band) });
  }
  const pfad = [
    ...punkte.map((pt, i) => `${i === 0 ? 'M' : 'L'}${pt.x.toFixed(1)} ${pt.oben.toFixed(1)}`),
    ...[...punkte].reverse().map((pt) => `L${pt.x.toFixed(1)} ${pt.unten.toFixed(1)}`),
    'Z',
  ].join(' ');
  const kante = (feld) => punkte.map((pt, i) => `${i === 0 ? 'M' : 'L'}${pt.x.toFixed(1)} ${pt[feld].toFixed(1)}`).join(' ');
  const yTicks = [];
  for (let v = 0; v <= yMax; v += 50) yTicks.push(v);
  const xJetzt = xVonN(n);
  const bandJetzt = e.zuschlagRelativ * 100;
  const markeAnker = xJetzt > padL + plotB - 70 ? 'end' : 'start';
  const obenSichtbar = 100 + bandJetzt <= yMax;
  const untenSichtbar = 100 - bandJetzt >= 0;
  const markeY = obenSichtbar ? Math.max(padT + 12, yVonProzent(100 + bandJetzt) - 8) : padT + 12;
  const geklemmt = 100 + bandBei10 > yMax || 100 - bandBei10 < 0;

  const erklaerung = alsListe(block.erklaerung);
  // Zeile der Tabelle, die dem Regler am nächsten liegt (auf der Log-Achse).
  const naechsteStufe = TABELLE_N.reduce((a, b) => (Math.abs(Math.log10(b / n)) < Math.abs(Math.log10(a / n)) ? b : a));

  return (
    <GrafikRahmen
      block={block}
      titelFallback="Gesetz der großen Zahlen"
      className="bl-sim-block"
      aktionen={!schmal && <AnsichtsWahl wert={ansicht} onWechsel={setAnsicht} grafikLabel="Diagramm" textLabel="Tabelle" />}
    >
      <div ref={ref} className="bl-sim">
        <div className="bl-sim-regler">
          <Regler
            id={`${id}-n`}
            label="Kollektivgröße"
            wert={stufe}
            min={0}
            max={STUFEN}
            schritt={1}
            anzeige={`${zahl(n, 0)} Versicherte`}
            skala={[zahl(N_MIN, 0), zahl(N_MAX, 0)]}
            onAendern={setStufe}
          />
          <Regler
            id={`${id}-p`}
            label="Schadenwahrscheinlichkeit"
            wert={pProzent}
            min={0.1}
            max={20}
            schritt={0.1}
            anzeige={prozent(pProzent, 1)}
            skala={[prozent(0.1, 1), prozent(20, 0)]}
            onAendern={setPProzent}
          />
          <Regler
            id={`${id}-s`}
            label="Schadenhöhe"
            wert={hoehe}
            min={1000}
            max={500000}
            schritt={1000}
            anzeige={euro(hoehe)}
            skala={[euro(1000), euro(500000)]}
            onAendern={setHoehe}
          />
        </div>

        <dl className="bl-sim-werte" aria-live="polite">
          <div className="bl-sim-wert">
            <dt>Erwartungsschaden je Kopf<span className="bl-sim-formel">p × Schadenhöhe</span></dt>
            <dd>{euroKurz(e.erwartung)}</dd>
          </div>
          <div className="bl-sim-wert">
            <dt>Streuung je Kopf<span className="bl-sim-formel">σ ÷ √n</span></dt>
            <dd>{euroKurz(e.sigmaKopf)}</dd>
          </div>
          <div className="bl-sim-wert">
            <dt>Schwankungsbereich<span className="bl-sim-formel">± 1 σ, relativ zum Erwartungswert</span></dt>
            <dd>± {prozent(e.cv * 100, e.cv * 100 >= 10 ? 0 : 1)}</dd>
          </div>
          <div className="bl-sim-wert" data-hervor="">
            <dt>Sicherheitszuschlag<span className="bl-sim-formel">{prozent(RUIN, 1)} Ruinwahrscheinlichkeit · {zahl(Z_RUIN, 3)} × σ ÷ √n</span></dt>
            <dd>{euroKurz(e.zuschlag)}<span className="bl-sim-wert-zusatz">{prozent(e.zuschlagRelativ * 100, e.zuschlagRelativ * 100 >= 10 ? 0 : 1)} des Erwartungswerts</span></dd>
          </div>
        </dl>

        <p className="bl-sim-merkzeile">
          Bei {zahl(MERK_KLEIN, 0)} Versicherten schwankt der Schadenbedarf um ± {prozent(merkKlein.cv * 100, merkKlein.cv * 100 >= 10 ? 0 : 1)};
          {' '}bei {zahl(MERK_GROSS, 0)} nur noch um ± {prozent(merkGross.cv * 100, merkGross.cv * 100 >= 10 ? 0 : 1)}.
        </p>

        {erwarteteSchaeden < 10 && (
          <p className="bl-sim-warnung" role="note">
            Dieses Kollektiv erwartet nur {zahl(erwarteteSchaeden, erwarteteSchaeden < 1 ? 2 : 1)} Schäden im Jahr –
            die Normalapproximation ist hier eine grobe Näherung (Faustregel: n × p ≥ 10).
          </p>
        )}

        {zeigeTabelle ? (
          <div className="bl-tabelle-huelle bl-tabelle-eigen bl-sim-tabelle">
            <table className="bl-tabelle bl-tabelle-klein">
              <caption className="sr-only">Streuung und Sicherheitszuschlag je Kollektivgröße</caption>
              <thead>
                <tr>
                  <th scope="col">Kollektiv­größe</th>
                  <th scope="col" className="bl-zahl">Streuung je Kopf</th>
                  <th scope="col" className="bl-zahl">Schwankung ± 1 σ</th>
                  <th scope="col" className="bl-zahl">Sicherheits­zuschlag</th>
                </tr>
              </thead>
              <tbody>
                {TABELLE_N.map((nI) => {
                  const r = rechne(nI, p, hoehe);
                  const ist = nI === naechsteStufe;
                  return (
                    <tr key={nI} data-jetzt={ist || undefined}>
                      <th scope="row">{zahl(nI, 0)}{ist && <span className="bl-sim-jetzt"> (nächste Reglerstufe)</span>}</th>
                      <td className="bl-zahl">{euroKurz(r.sigmaKopf)}</td>
                      <td className="bl-zahl">± {prozent(r.cv * 100, r.cv * 100 >= 10 ? 0 : 1)}</td>
                      <td className="bl-zahl">{euroKurz(r.zuschlag)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <figure className="bl-diagramm bl-sim-diagramm">
            <p className="bl-diagramm-einheit">Schadenbedarf je Kopf in % des Erwartungswerts (Bereich für {prozent(100 - RUIN * 2, 0)} der Jahre)</p>
            <svg
              className="bl-sim-svg"
              width={W}
              height={H}
              viewBox={`0 0 ${W} ${H}`}
              role="img"
              aria-label={`Trichter: bei ${zahl(N_MIN, 0)} Versicherten schwankt der Schadenbedarf um ± ${prozent(merkKlein.zuschlagRelativ * 100, 0)}, bei ${zahl(N_MAX, 0)} nur noch um ± ${prozent(rechne(N_MAX, p, hoehe).zuschlagRelativ * 100, 1)}.`}
            >
              {yTicks.map((v) => (
                <g key={v}>
                  <line className="bl-sim-gitter" x1={padL} y1={yVonProzent(v)} x2={padL + plotB} y2={yVonProzent(v)} />
                  <text className="bl-sim-achsentext" x={padL - 8} y={yVonProzent(v) + 4} textAnchor="end">{prozent(v, 0)}</text>
                </g>
              ))}
              <clipPath id={clipId}><rect x={padL} y={padT} width={plotB} height={plotH} /></clipPath>
              <g clipPath={`url(#${clipId})`}>
                <path className="bl-sim-band" d={pfad} />
                <path className="bl-sim-kante" d={kante('oben')} />
                <path className="bl-sim-kante" d={kante('unten')} />
              </g>
              <line className="bl-sim-erwartung" x1={padL} y1={yVonProzent(100)} x2={padL + plotB} y2={yVonProzent(100)} />
              <text className="bl-sim-achsentext bl-sim-erwartungstext" x={padL + 6} y={yVonProzent(100) - 6} textAnchor="start">Erwartungswert</text>
              <line className="bl-sim-jetztlinie" x1={xJetzt} y1={padT} x2={xJetzt} y2={padT + plotH} />
              {obenSichtbar && <circle className="bl-sim-punkt" cx={xJetzt} cy={yVonProzent(100 + bandJetzt)} r={4.5} />}
              {untenSichtbar && <circle className="bl-sim-punkt" cx={xJetzt} cy={yVonProzent(100 - bandJetzt)} r={4.5} />}
              <text
                className="bl-sim-marke"
                x={xJetzt + (markeAnker === 'end' ? -8 : 8)}
                y={markeY}
                textAnchor={markeAnker}
              >
                ± {prozent(bandJetzt, bandJetzt >= 10 ? 0 : 1)}
              </text>
              <line className="bl-sim-achse" x1={padL} y1={padT + plotH} x2={padL + plotB} y2={padT + plotH} />
              {[10, 100, 1000, 10000, 100000].map((nI, i, alle) => (
                <text
                  key={nI}
                  className="bl-sim-achsentext"
                  x={xVonN(nI)}
                  y={padT + plotH + 18}
                  textAnchor={i === 0 ? 'start' : i === alle.length - 1 ? 'end' : 'middle'}
                >
                  {zahl(nI, 0)}
                </text>
              ))}
              <text className="bl-sim-achsenname" x={padL + plotB / 2} y={H - 10} textAnchor="middle">Kollektivgröße (Versicherte, logarithmisch)</text>
            </svg>
          </figure>
        )}

        <p className="bl-sim-annahmen">
          <strong>Annahmen:</strong> unabhängige Risiken, je Versicherten höchstens ein Schaden im Jahr, für alle die gleiche
          Schadenhöhe, Normalapproximation der Summenverteilung; der Sicherheitszuschlag deckt den Bedarf in {prozent(100 - RUIN, 1)} der
          Jahre (Faktor {zahl(Z_RUIN, 3)}).{geklemmt && !zeigeTabelle ? ` Die Achse endet bei ${prozent(yMax, 0)} und bei 0 % – bei kleinen Kollektiven reicht der gerechnete Bereich darüber hinaus.` : ''}
        </p>

        {erklaerung.length > 0 && (
          <ul className="bl-sim-erklaerung">
            {erklaerung.map((t, i) => <li key={i}><InlineHtml html={String(t)} begriffe={false} /></li>)}
          </ul>
        )}
      </div>
    </GrafikRahmen>
  );
}
