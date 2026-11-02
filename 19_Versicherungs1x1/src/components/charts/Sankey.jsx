// ===========================================================================
// charts/Sankey.jsx — Flussdiagramm als reines SVG ohne Bibliothek.
// Knoten als Säulen je Stufe (Tiefe = längster Pfad von den Quellen),
// Bänder als kubische Bézier-Pfade mit Strichbreite proportional zum Wert.
// Hover oder Fokus hebt Knoten mit seinen Bändern bzw. ein Band hervor und
// zeigt eine Blase mit Wert; Knoten sind per Tastatur erreichbar.
// ===========================================================================
import { useMemo, useState } from 'react';

function summe(liste, f) { return liste.reduce((s, x) => s + f(x), 0); }

/**
 * Layout eines Sankey: Knoten mit x, y, h, b und Kanten mit Pfad und Breite.
 * @param {Array<{id:string,label?:string}>} nodes
 * @param {Array<{source:string,target:string,value:number}>} links
 * @param {number} W Breite, @param {number} H Höhe
 */
export function berechneSankey(nodes, links, W, H, opt = {}) {
  const { knotenBreite = 14, abstand = 14, oben = 6, unten = 6, randLinks = 0, randRechts = 0 } = opt;
  const k = new Map();
  (nodes || []).forEach((n, i) => { if (n && n.id != null && !k.has(n.id)) k.set(n.id, { id: n.id, label: String(n.label ?? n.id), index: i, ein: [], aus: [], tiefe: 0 }); });
  const kanten = (links || [])
    .filter((l) => l && k.has(l.source) && k.has(l.target) && l.source !== l.target)
    .map((l, i) => ({ index: i, quelle: k.get(l.source), ziel: k.get(l.target), wert: Math.max(0, Number(l.value) || 0), label: l.label }));
  for (const e of kanten) { e.quelle.aus.push(e); e.ziel.ein.push(e); }
  for (let runde = 0; runde <= k.size; runde += 1) {
    let geaendert = false;
    for (const e of kanten) {
      if (e.ziel.tiefe < e.quelle.tiefe + 1 && e.quelle.tiefe + 1 <= k.size) { e.ziel.tiefe = e.quelle.tiefe + 1; geaendert = true; }
    }
    if (!geaendert) break;
  }
  const knoten = [...k.values()];
  const maxTiefe = Math.max(0, ...knoten.map((n) => n.tiefe));
  for (const n of knoten) if (n.aus.length === 0 && n.ein.length > 0) n.tiefe = maxTiefe;
  for (const n of knoten) n.wert = Math.max(summe(n.ein, (e) => e.wert), summe(n.aus, (e) => e.wert));
  const spalten = [];
  for (const n of knoten.sort((a, b) => a.index - b.index)) { (spalten[n.tiefe] ||= []).push(n); }
  const nSpalten = maxTiefe + 1;
  const innenH = H - oben - unten;
  let skala = Infinity;
  for (const sp of spalten) {
    if (!sp) continue;
    const s = summe(sp, (n) => n.wert);
    const frei = innenH - abstand * (sp.length - 1);
    if (s > 0) skala = Math.min(skala, frei / s);
  }
  if (!Number.isFinite(skala) || skala <= 0) skala = 1;
  const xSchritt = nSpalten > 1 ? (W - randLinks - randRechts - knotenBreite) / (nSpalten - 1) : 0;
  for (let t = 0; t < nSpalten; t += 1) {
    const sp = spalten[t] || [];
    const hoehe = summe(sp, (n) => n.wert * skala) + abstand * (sp.length - 1);
    let y = oben + Math.max(0, (innenH - hoehe) / 2);
    for (const n of sp) {
      n.x = randLinks + t * xSchritt;
      n.y = y;
      n.h = Math.max(2, n.wert * skala);
      n.b = knotenBreite;
      y += n.h + abstand;
    }
  }
  for (const n of knoten) {
    n.aus.sort((a, b) => a.ziel.y - b.ziel.y || a.index - b.index);
    let y = n.y;
    for (const e of n.aus) { e.y0 = y + (e.wert * skala) / 2; y += e.wert * skala; }
    n.ein.sort((a, b) => a.quelle.y - b.quelle.y || a.index - b.index);
    y = n.y;
    for (const e of n.ein) { e.y1 = y + (e.wert * skala) / 2; y += e.wert * skala; }
  }
  for (const e of kanten) {
    e.breite = Math.max(1, e.wert * skala);
    e.x0 = e.quelle.x + knotenBreite;
    e.x1 = e.ziel.x;
    const xm = (e.x0 + e.x1) / 2;
    e.pfad = `M${e.x0},${e.y0}C${xm},${e.y0} ${xm},${e.y1} ${e.x1},${e.y1}`;
  }
  return { knoten, kanten, spalten: nSpalten };
}

export default function Sankey({ nodes, links, breite, hoehe = 340, fmt = (v) => String(v), beschriftung }) {
  const [aktiv, setAktiv] = useState(null); // { art: 'knoten', id } | { art: 'kante', index }
  const letzteBreite = useMemo(() => {
    const max = Math.max(0, ...(nodes || []).map((n) => String(n.label ?? n.id).length));
    return Math.min(Math.round(breite / 3), max * 7.4 + 10);
  }, [nodes, breite]);
  const layout = useMemo(() => berechneSankey(nodes, links, breite, hoehe, { randRechts: letzteBreite }), [nodes, links, breite, hoehe, letzteBreite]);

  const istAktiv = (e) => {
    if (!aktiv) return false;
    if (aktiv.art === 'kante') return aktiv.index === e.index;
    return e.quelle.id === aktiv.id || e.ziel.id === aktiv.id;
  };
  const knotenAktiv = (n) => {
    if (!aktiv) return false;
    if (aktiv.art === 'knoten') return aktiv.id === n.id;
    const e = layout.kanten[aktiv.index];
    return e && (e.quelle.id === n.id || e.ziel.id === n.id);
  };

  let blase = null;
  if (aktiv && aktiv.art === 'kante') {
    const e = layout.kanten[aktiv.index];
    if (e) blase = { x: (e.x0 + e.x1) / 2, y: (e.y0 + e.y1) / 2, titel: `${e.quelle.label} → ${e.ziel.label}`, wert: fmt(e.wert) };
  } else if (aktiv && aktiv.art === 'knoten') {
    const n = layout.knoten.find((x) => x.id === aktiv.id);
    if (n) blase = { x: n.x + n.b / 2, y: n.y, titel: n.label, wert: fmt(n.wert), zusatz: beschriftung ? beschriftung(n) : null };
  }

  return (
    <div className="bl-fluss-huelle" style={{ height: hoehe }}>
      <svg className="bl-fluss" width={breite} height={hoehe} viewBox={`0 0 ${breite} ${hoehe}`} role="img" aria-label="Flussdiagramm">
        <g>
          {layout.kanten.map((e) => (
            <path
              key={e.index}
              d={e.pfad}
              className="bl-fluss-band"
              strokeWidth={e.breite}
              data-aktiv={istAktiv(e)}
              data-passiv={aktiv ? !istAktiv(e) : false}
              onMouseEnter={() => setAktiv({ art: 'kante', index: e.index })}
              onMouseLeave={() => setAktiv(null)}
            >
              <title>{`${e.quelle.label} → ${e.ziel.label}: ${fmt(e.wert)}`}</title>
            </path>
          ))}
        </g>
        <g>
          {layout.knoten.map((n) => {
            const rechts = n.tiefe < layout.spalten - 1;
            return (
              <g
                key={n.id}
                className="bl-fluss-knoten"
                data-aktiv={knotenAktiv(n)}
                tabIndex={0}
                role="img"
                aria-label={`${n.label}: ${fmt(n.wert)}${n.ein.length ? `, ${n.ein.length} eingehende` : ''}${n.aus.length ? `, ${n.aus.length} ausgehende Verbindungen` : ''}`}
                onMouseEnter={() => setAktiv({ art: 'knoten', id: n.id })}
                onMouseLeave={() => setAktiv(null)}
                onFocus={() => setAktiv({ art: 'knoten', id: n.id })}
                onBlur={() => setAktiv(null)}
              >
                <rect x={n.x} y={n.y} width={n.b} height={n.h} rx={3} />
                <text className="bl-fluss-label" x={rechts ? n.x + n.b + 6 : n.x - 6} y={n.y + n.h / 2 - 2} textAnchor={rechts ? 'start' : 'end'} dominantBaseline="middle">{n.label}</text>
                <text className="bl-fluss-wert" x={rechts ? n.x + n.b + 6 : n.x - 6} y={n.y + n.h / 2 + 12} textAnchor={rechts ? 'start' : 'end'} dominantBaseline="middle">{fmt(n.wert)}</text>
              </g>
            );
          })}
        </g>
      </svg>
      {blase && (
        <div
          className="bl-tooltip bl-schwebe-tooltip"
          style={{
            left: Math.max(0, Math.min(breite - 200, blase.x - 100)),
            top: Math.max(0, blase.y - 12),
            transform: blase.y > 80 ? 'translateY(-100%)' : 'translateY(16px)',
          }}
        >
          <div className="bl-tooltip-titel">{blase.titel}</div>
          <div className="bl-tooltip-zeile"><span className="bl-tooltip-wert">{blase.wert}</span>{blase.zusatz && <span className="bl-tooltip-name">{blase.zusatz}</span>}</div>
        </div>
      )}
    </div>
  );
}
