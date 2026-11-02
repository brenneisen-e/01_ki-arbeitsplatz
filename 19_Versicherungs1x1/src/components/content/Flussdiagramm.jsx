// ===========================================================================
// Flussdiagramm.jsx — Blocktyp `sankey` (neu): Daten aus
// kapitel.chartData[block.chartKey] mit nodes/links/value. Das SVG zeichnet
// charts/Sankey.jsx; hier: Einheit erkennen (Anteile je Ausgangsknoten, wenn
// alle auf 100 summieren), Legende, „Als Tabelle“-Umschalter; unter rund
// 480 px Blockbreite steht automatisch die Tabelle.
// ===========================================================================
import { lazy, Suspense, useMemo, useRef, useState } from 'react';
import BlockRahmen from './BlockRahmen.jsx';
import Segment from '../ui/Segment.jsx';
import { zahl } from '../../lib/format.js';
import { useBreite } from './hilfen.js';

const Sankey = lazy(() => import('../charts/Sankey.jsx'));
const ANSICHTEN = [{ wert: 'diagramm', label: 'Diagramm' }, { wert: 'tabelle', label: 'Tabelle' }];

export default function Flussdiagramm({ block, kapitel }) {
  const cd = kapitel?.chartData?.[block.chartKey];
  const ref = useRef(null);
  const breite = useBreite(ref);
  const [ansicht, setAnsicht] = useState('diagramm');
  const nodes = Array.isArray(cd?.nodes) ? cd.nodes : [];
  const links = Array.isArray(cd?.links) ? cd.links : [];

  const einheit = useMemo(() => {
    if (block.unit || cd?.unit) return block.unit || cd.unit;
    const ids = new Set(nodes.map((n) => n.id));
    const hatEingang = new Set(links.map((l) => l.target));
    const quellen = [...ids].filter((id) => !hatEingang.has(id));
    if (quellen.length === 0) return '';
    const alle100 = quellen.every((id) => {
      const s = links.filter((l) => l.source === id).reduce((a, l) => a + (Number(l.value) || 0), 0);
      return Math.abs(s - 100) < 0.75;
    });
    return alle100 ? '%' : '';
  }, [block.unit, cd, nodes, links]);

  if (!cd || nodes.length === 0 || links.length === 0) {
    if (import.meta.env.DEV) console.warn(`[Flussdiagramm] chartKey „${block.chartKey}“ ohne nodes/links.`);
    return null;
  }

  const fmt = (v) => (einheit ? `${zahl(v)} ${einheit}` : zahl(v));
  const label = (id) => String(nodes.find((n) => n.id === id)?.label ?? id);
  const schmal = breite > 0 && breite < 480;
  const zeigeTabelle = ansicht === 'tabelle' || schmal;
  const innen = Math.max(0, Math.floor(breite) - 2);

  return (
    <BlockRahmen
      titel={block.title}
      quelle={block.source}
      quelleUrl={block.sourceUrl}
      aktionen={!schmal && <Segment optionen={ANSICHTEN} wert={ansicht} onWechsel={setAnsicht} label="Ansicht" klein />}
      className="bl-fluss-block"
    >
      <div ref={ref}>
        {zeigeTabelle ? (
          <div className="bl-tabelle-huelle bl-tabelle-eigen" style={{ overflowX: 'auto' }}>
            <table className="bl-tabelle bl-tabelle-klein">
              <caption className="sr-only">{block.title}</caption>
              <thead><tr><th scope="col">Von</th><th scope="col">Nach</th><th scope="col" className="bl-zahl">Wert</th></tr></thead>
              <tbody>
                {links.map((l, i) => (
                  <tr key={i}><td>{label(l.source)}</td><td>{label(l.target)}</td><td className="bl-zahl">{fmt(Number(l.value) || 0)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <figure className="bl-diagramm">
            {innen > 0 ? (
              <Suspense fallback={<div className="skelett" style={{ width: '100%', height: 340 }} aria-busy="true" />}>
                <Sankey nodes={nodes} links={links} breite={innen - 8} hoehe={340} fmt={fmt} />
              </Suspense>
            ) : <div className="skelett" style={{ width: '100%', height: 340 }} aria-busy="true" />}
            <figcaption className="bl-legende bl-legende-text">
              <span>Bandbreite entspricht dem Wert{einheit === '%' ? ' – Anteile je Ausgangsgruppe in Prozent' : ''}. Zeiger oder Tastatur auf einem Knoten hebt seine Ströme hervor.</span>
            </figcaption>
          </figure>
        )}
      </div>
    </BlockRahmen>
  );
}
