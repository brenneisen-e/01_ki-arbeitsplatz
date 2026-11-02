// ===========================================================================
// TrendRadar.jsx — Blocktyp `trendRadar` aus kapitel.chartData[chartKey]:
// Ringe (innen → außen, Farben in fester Reihenfolge --viz-1 …), Segmente,
// nummerierte Punkte mit Beschriftung per Hover und Fokus; die Liste darunter
// (nach Ring gruppiert) trägt dieselben Nummern und hebt den aktiven Punkt
// hervor. Geometrie in Pixeln aus der gemessenen Breite, damit Schrift nie
// unter 11 px fällt; unter rund 460 px stehen die Segmentnamen als Legende.
// ===========================================================================
import { useMemo, useRef, useState } from 'react';
import BlockRahmen from './BlockRahmen.jsx';
import { useBreite } from './hilfen.js';

const RING_STANDARD = ['Adopt', 'Trial', 'Assess', 'Hold'];

function umbrich(text, max = 13) {
  const woerter = String(text).split(/\s+/);
  const zeilen = [];
  let zeile = '';
  for (const w of woerter) {
    if (zeile && (zeile + ' ' + w).length > max) { zeilen.push(zeile); zeile = w; } else zeile = zeile ? `${zeile} ${w}` : w;
  }
  if (zeile) zeilen.push(zeile);
  return zeilen;
}

export default function TrendRadar({ block, kapitel }) {
  const cd = kapitel?.chartData?.[block.chartKey];
  const ref = useRef(null);
  const breite = useBreite(ref);
  const [aktiv, setAktiv] = useState(null);

  const modell = useMemo(() => {
    if (!cd) return null;
    const ringe = Array.isArray(cd.rings) && cd.rings.length ? cd.rings.map(String) : RING_STANDARD;
    const segmente = Array.isArray(cd.segments) ? cd.segments.map(String) : [];
    const items = (Array.isArray(cd.items) ? cd.items : []).map((it, i) => ({
      nr: i + 1,
      label: String(it.label ?? ''),
      description: it.description ? String(it.description) : '',
      ring: Math.max(0, Math.min(ringe.length - 1, Number.isFinite(Number(it.ring)) ? Number(it.ring) : ringe.length - 1)),
      segment: Math.max(0, Math.min(Math.max(0, segmente.length - 1), Number.isFinite(Number(it.segment)) ? Number(it.segment) : 0)),
    }));
    return { ringe, segmente, items };
  }, [cd]);

  if (!cd || !modell) return null;
  const { ringe, segmente, items } = modell;

  const groesse = Math.max(240, Math.min(560, Math.floor(breite) || 560));
  const kompakt = groesse < 460;
  const rand = kompakt ? 30 : 84;
  const cx = groesse / 2;
  const cy = groesse / 2;
  const maxR = groesse / 2 - rand;
  // Innenring bekommt mehr Platz (Gewicht 1,7), damit die Punkte dort nicht klumpen
  const gewichte = ringe.map((_, i) => (i === 0 ? 2 : 1));
  const gesamt = gewichte.reduce((a, b) => a + b, 0);
  const grenzen = [];
  gewichte.reduce((summe, g) => { const s = summe + g; grenzen.push((maxR * s) / gesamt); return s; }, 0);
  const radiusAussen = (i) => grenzen[i];
  const radiusInnen = (i) => (i === 0 ? 0 : grenzen[i - 1]);
  const nSeg = Math.max(1, segmente.length);
  const segWinkel = (2 * Math.PI) / nSeg;

  const gruppen = new Map();
  for (const it of items) {
    const key = `${it.ring}-${it.segment}`;
    if (!gruppen.has(key)) gruppen.set(key, []);
    gruppen.get(key).push(it);
  }
  const positionen = new Map();
  for (const liste of gruppen.values()) {
    liste.forEach((it, k) => {
      const start = it.segment * segWinkel - Math.PI / 2;
      const anteil = (k + 0.5) / liste.length;
      const winkel = start + segWinkel * (0.14 + 0.72 * anteil);
      const innen = radiusInnen(it.ring);
      const breiteRing = radiusAussen(it.ring) - innen;
      const r = innen + breiteRing * (liste.length > 1 ? (k % 2 === 0 ? 0.4 : 0.78) : 0.6);
      positionen.set(it.nr, { x: cx + r * Math.cos(winkel), y: cy + r * Math.sin(winkel) });
    });
  }
  const ringFarbe = (i) => `var(--viz-${Math.min(6, i + 1)})`;
  const aktivesItem = aktiv != null ? items.find((it) => it.nr === aktiv) : null;
  const aktivPos = aktivesItem ? positionen.get(aktivesItem.nr) : null;

  return (
    <BlockRahmen titel={block.title} quelle={block.source} quelleUrl={block.sourceUrl} className="bl-radar-block">
      <div className="bl-radar" ref={ref}>
        <div className="bl-radar-huelle" style={{ width: groesse, height: groesse }}>
          <svg width={groesse} height={groesse} viewBox={`0 0 ${groesse} ${groesse}`} role="img" aria-label={`${block.title || 'Trend-Radar'}: ${items.length} Themen in ${ringe.length} Ringen`}>
            {ringe.map((_, i) => ringe.length - 1 - i).map((i) => (
              <circle key={i} className="bl-radar-ring" cx={cx} cy={cy} r={radiusAussen(i)} style={{ '--ringfarbe': ringFarbe(i) }} />
            ))}
            {segmente.map((s, i) => {
              const w = i * segWinkel - Math.PI / 2;
              const mitte = w + segWinkel / 2;
              const lr = maxR + (kompakt ? 14 : 16);
              const lx = cx + lr * Math.cos(mitte);
              const ly = cy + lr * Math.sin(mitte);
              const c = Math.cos(mitte);
              const anker = c > 0.3 ? 'start' : c < -0.3 ? 'end' : 'middle';
              const zeilen = kompakt ? [String(i + 1)] : umbrich(s);
              const dy = Math.sin(mitte) < -0.3 ? -((zeilen.length - 1) * 13) : Math.sin(mitte) > 0.3 ? 10 : -((zeilen.length - 1) * 6.5);
              return (
                <g key={i}>
                  {nSeg > 1 && <line className="bl-radar-teiler" x1={cx} y1={cy} x2={cx + maxR * Math.cos(w)} y2={cy + maxR * Math.sin(w)} />}
                  {kompakt ? (
                    <g>
                      <circle cx={lx} cy={ly} r={9} className="bl-radar-segmentkreis" />
                      <text className="bl-radar-segmentnr" x={lx} y={ly + 3.5} textAnchor="middle">{i + 1}</text>
                    </g>
                  ) : (
                    <text className="bl-radar-segment" x={lx} y={ly + dy} textAnchor={anker}>
                      {zeilen.map((z, zi) => <tspan key={zi} x={lx} dy={zi === 0 ? 0 : 13}>{z}</tspan>)}
                    </text>
                  )}
                </g>
              );
            })}
            {ringe.map((name, i) => (
              <text key={name} className="bl-radar-ringname" x={cx} y={cy - radiusAussen(i) + 12} textAnchor="middle">{name}</text>
            ))}
            {items.map((it) => {
              const p = positionen.get(it.nr);
              const istAktiv = aktiv === it.nr;
              return (
                <g
                  key={it.nr}
                  className="bl-radar-punkt"
                  data-aktiv={istAktiv}
                  style={{ '--punktfarbe': ringFarbe(it.ring) }}
                  tabIndex={0}
                  role="img"
                  aria-label={`${it.nr}: ${it.label} – ${ringe[it.ring]}, ${segmente[it.segment] || ''}`}
                  onMouseEnter={() => setAktiv(it.nr)}
                  onMouseLeave={() => setAktiv(null)}
                  onFocus={() => setAktiv(it.nr)}
                  onBlur={() => setAktiv(null)}
                >
                  <circle cx={p.x} cy={p.y} r={istAktiv ? 9 : 7} />
                  <text className="bl-radar-nr" x={p.x + 10} y={p.y + 4}>{it.nr}</text>
                </g>
              );
            })}
          </svg>
          {aktivesItem && aktivPos && (
            <div
              className="bl-tooltip bl-schwebe-tooltip"
              style={{
                left: Math.max(0, Math.min(groesse - 220, aktivPos.x - 110)),
                top: aktivPos.y - 14,
                transform: aktivPos.y > 90 ? 'translateY(-100%)' : 'translateY(24px)',
                maxWidth: 220,
              }}
            >
              <div className="bl-tooltip-titel">{aktivesItem.nr} · {aktivesItem.label}</div>
              <div className="bl-tooltip-zeile"><span className="bl-tooltip-schluessel" data-form="rechteck" style={{ background: ringFarbe(aktivesItem.ring) }} /><span className="bl-tooltip-name">{ringe[aktivesItem.ring]} · {segmente[aktivesItem.segment]}</span></div>
            </div>
          )}
        </div>
        <ul className="bl-legende" aria-label="Ringe">
          {ringe.map((r, i) => (
            <li key={r} className="bl-legende-eintrag"><span className="bl-legende-punkt" style={{ background: ringFarbe(i) }} aria-hidden="true" />{r}</li>
          ))}
        </ul>
        {kompakt && segmente.length > 0 && (
          <ol className="bl-radar-segmentlegende" aria-label="Segmente">
            {segmente.map((s, i) => <li key={i}><span className="bl-radar-nr-pille">{i + 1}</span>{s}</li>)}
          </ol>
        )}
        <div className="bl-radar-liste">
          {ringe.map((r, ri) => {
            const liste = items.filter((it) => it.ring === ri);
            if (liste.length === 0) return null;
            return (
              <section key={r} className="bl-radar-gruppe" aria-label={r}>
                <h4><span className="bl-legende-punkt" style={{ background: ringFarbe(ri) }} aria-hidden="true" />{r}</h4>
                <ul>
                  {liste.map((it) => (
                    <li key={it.nr} data-aktiv={aktiv === it.nr} onMouseEnter={() => setAktiv(it.nr)} onMouseLeave={() => setAktiv(null)}>
                      <span className="bl-radar-nr-pille">{it.nr}</span>
                      <span><strong>{it.label}</strong>{it.description && <> – {it.description}</>}</span>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </div>
    </BlockRahmen>
  );
}
