// ===========================================================================
// Netzwerk.jsx — Blocktyp `networkGraph` aus kapitel.chartData[chartKey]:
// Knoten im Kreis (Farbe je Typ in fester Reihenfolge --viz-*), Kanten
// dezent; Hover oder Fokus auf einem Knoten hebt seine Nachbarn hervor und
// blendet die Beziehungstexte der Kanten ein; Legende der Typen; Tabellen-
// ansicht (Beziehungen und Akteure) als Umschalter und automatisch, wenn der
// Block schmaler als rund 560 px ist.
// ===========================================================================
import { useMemo, useRef, useState } from 'react';
import BlockRahmen from './BlockRahmen.jsx';
import Segment from '../ui/Segment.jsx';
import { useBreite } from './hilfen.js';

const TYP_NAMEN = {
  aufsicht: 'Aufsicht', verband: 'Verband', verbraucher: 'Verbraucherschutz',
  schlichtung: 'Schlichtung', rating: 'Rating', sicherung: 'Sicherungseinrichtung',
};
const ANSICHTEN = [{ wert: 'grafik', label: 'Grafik' }, { wert: 'tabelle', label: 'Tabelle' }];

export default function Netzwerk({ block, kapitel }) {
  const cd = kapitel?.chartData?.[block.chartKey];
  const ref = useRef(null);
  const breite = useBreite(ref);
  const [ansicht, setAnsicht] = useState('grafik');
  const [aktiv, setAktiv] = useState(null);

  const modell = useMemo(() => {
    if (!cd) return null;
    const knoten = (Array.isArray(cd.nodes) ? cd.nodes : []).filter((n) => n && n.id != null);
    const ids = new Set(knoten.map((n) => n.id));
    const kanten = (Array.isArray(cd.links) ? cd.links : []).filter((l) => l && ids.has(l.source) && ids.has(l.target));
    const typen = [];
    for (const n of knoten) { const t = String(n.type || 'sonstige'); if (!typen.includes(t)) typen.push(t); }
    return { knoten, kanten, typen };
  }, [cd]);

  if (!cd || !modell || modell.knoten.length === 0) return null;
  const { knoten, kanten, typen } = modell;
  const typFarbe = (t) => `var(--viz-${Math.min(6, typen.indexOf(t) + 1)})`;
  const typName = (t) => TYP_NAMEN[t] || t;
  const W = Math.min(720, Math.floor(breite) || 720);
  const H = Math.max(300, Math.round(W * 0.62));
  const r = Math.min(W, H) / 2 - 78;
  const schmal = breite > 0 && r < 90;
  const zeigeTabelle = ansicht === 'tabelle' || schmal;

  const pos = new Map();
  knoten.forEach((n, i) => {
    const w = (i / knoten.length) * 2 * Math.PI - Math.PI / 2;
    pos.set(n.id, { x: W / 2 + r * Math.cos(w), y: H / 2 + r * Math.sin(w), w });
  });
  const nachbarn = new Set();
  if (aktiv) for (const k of kanten) { if (k.source === aktiv) nachbarn.add(k.target); if (k.target === aktiv) nachbarn.add(k.source); }
  const aktiverKnoten = aktiv ? knoten.find((n) => n.id === aktiv) : null;
  const aktivPos = aktiverKnoten ? pos.get(aktiverKnoten.id) : null;

  return (
    <BlockRahmen
      titel={block.title}
      quelle={block.source}
      quelleUrl={block.sourceUrl}
      aktionen={!schmal && <Segment optionen={ANSICHTEN} wert={ansicht} onWechsel={setAnsicht} label="Ansicht" klein />}
      className="bl-netz-block"
    >
      <div ref={ref}>
        {zeigeTabelle ? (
          <div className="bl-netz-tabellen">
            <div className="bl-tabelle-huelle bl-tabelle-eigen" style={{ overflowX: 'auto' }}>
              <table className="bl-tabelle bl-tabelle-klein">
                <caption className="sr-only">Akteure</caption>
                <thead><tr><th scope="col">Akteur</th><th scope="col">Rolle</th><th scope="col">Beschreibung</th></tr></thead>
                <tbody>
                  {knoten.map((n) => (
                    <tr key={n.id}><th scope="row">{n.label}</th><td><span className="bl-legende-eintrag"><span className="bl-legende-punkt" style={{ background: typFarbe(String(n.type || 'sonstige')) }} aria-hidden="true" />{typName(String(n.type || 'sonstige'))}</span></td><td>{n.description}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            {kanten.length > 0 && (
              <div className="bl-tabelle-huelle bl-tabelle-eigen" style={{ overflowX: 'auto' }}>
                <table className="bl-tabelle bl-tabelle-klein">
                  <caption className="sr-only">Beziehungen</caption>
                  <thead><tr><th scope="col">Von</th><th scope="col">Beziehung</th><th scope="col">Nach</th></tr></thead>
                  <tbody>
                    {kanten.map((k, i) => (
                      <tr key={i}><td>{knoten.find((n) => n.id === k.source)?.label}</td><td>{k.label || '–'}</td><td>{knoten.find((n) => n.id === k.target)?.label}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <figure className="bl-diagramm">
            <div className="bl-netz-huelle" style={{ width: '100%', maxWidth: W, height: H }}>
              <svg className="bl-netz" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${block.title || 'Netzwerk'}: ${knoten.length} Akteure, ${kanten.length} Beziehungen`}>
                {kanten.map((k, i) => {
                  const a = pos.get(k.source);
                  const b = pos.get(k.target);
                  const istAktiv = aktiv && (k.source === aktiv || k.target === aktiv);
                  return (
                    <g key={i}>
                      <line className="bl-netz-kante" x1={a.x} y1={a.y} x2={b.x} y2={b.y} data-aktiv={Boolean(istAktiv)} data-passiv={Boolean(aktiv && !istAktiv)} />
                      {istAktiv && k.label && (
                        <text className="bl-netz-kantentext" x={(a.x + b.x) / 2} y={(a.y + b.y) / 2 - 6} textAnchor="middle">{k.label}</text>
                      )}
                    </g>
                  );
                })}
                {knoten.map((n) => {
                  const p = pos.get(n.id);
                  const c = Math.cos(p.w);
                  const anker = c > 0.3 ? 'start' : c < -0.3 ? 'end' : 'middle';
                  const lx = p.x + (anker === 'middle' ? 0 : Math.sign(c) * 20);
                  const ly = p.y + (anker === 'middle' ? (Math.sin(p.w) < 0 ? -24 : 30) : 4);
                  const passiv = aktiv && aktiv !== n.id && !nachbarn.has(n.id);
                  return (
                    <g
                      key={n.id}
                      className="bl-netz-knoten"
                      data-aktiv={aktiv === n.id}
                      data-passiv={Boolean(passiv)}
                      style={{ '--knotenfarbe': typFarbe(String(n.type || 'sonstige')) }}
                      tabIndex={0}
                      role="img"
                      aria-label={`${n.label} (${typName(String(n.type || 'sonstige'))})${n.description ? `: ${n.description}` : ''}`}
                      onMouseEnter={() => setAktiv(n.id)}
                      onMouseLeave={() => setAktiv(null)}
                      onFocus={() => setAktiv(n.id)}
                      onBlur={() => setAktiv(null)}
                    >
                      <circle cx={p.x} cy={p.y} r={aktiv === n.id ? 15 : 13} />
                      <text className="bl-netz-label" x={lx} y={ly} textAnchor={anker}>{n.label}</text>
                    </g>
                  );
                })}
              </svg>
              {aktiverKnoten && aktiverKnoten.description && aktivPos && (
                <div
                  className="bl-tooltip bl-schwebe-tooltip"
                  style={{
                    left: Math.max(0, Math.min(W - 240, aktivPos.x - 120)),
                    top: aktivPos.y + (aktivPos.y > H / 2 ? -22 : 22),
                    transform: aktivPos.y > H / 2 ? 'translateY(-100%)' : 'none',
                    maxWidth: 240,
                  }}
                >
                  <div className="bl-tooltip-titel">{aktiverKnoten.label}</div>
                  <div className="bl-tooltip-name">{aktiverKnoten.description}</div>
                </div>
              )}
            </div>
            <figcaption>
              <ul className="bl-legende" aria-label="Legende">
                {typen.map((t) => (
                  <li key={t} className="bl-legende-eintrag"><span className="bl-legende-punkt" style={{ background: typFarbe(t) }} aria-hidden="true" />{typName(t)}</li>
                ))}
              </ul>
            </figcaption>
          </figure>
        )}
      </div>
    </BlockRahmen>
  );
}
