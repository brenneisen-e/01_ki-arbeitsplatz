// ===========================================================================
// Diagramm.jsx — Blocktypen chartLine, chartBar, chartDonut aus
// kapitel.chartData[block.chartKey]. Recharts kommt LAZY (React.lazy mit
// Skelett) aus charts/Recharts.jsx. Farben: Reihen in fester Reihenfolge
// --viz-1 … --viz-6 (Datenfarben werden ignoriert), Sammelsegment „Sonstige“
// in Neutralgrau; Legende ab zwei Reihen (mit Direktwerten beim Donut);
// „Als Tabelle“-Umschalter mit derselben Datenbasis; Donut höchstens sechs
// Segmente plus „Sonstige“; Quelle als Fußzeile.
// ===========================================================================
import { lazy, Suspense, useMemo, useRef, useState } from 'react';
import BlockRahmen from './BlockRahmen.jsx';
import Segment from '../ui/Segment.jsx';
import { zahl } from '../../lib/format.js';
import { vizFarbe, VIZ_ANZAHL, token, einheitAusTitel, useBreite, schoeneTicks } from './hilfen.js';

const RechartsDiagramm = lazy(() => import('../charts/Recharts.jsx'));

const SAMMEL = /^(rest|sonstige|sonstiges|andere|übrige|others?|other)$/i;
const ANSICHTEN = [{ wert: 'diagramm', label: 'Diagramm' }, { wert: 'tabelle', label: 'Tabelle' }];

function bereite(block, cd) {
  const labels = Array.isArray(cd.labels) ? cd.labels.map(String) : [];
  const datasets = (Array.isArray(cd.datasets) ? cd.datasets : []).filter((d) => d && Array.isArray(d.data));
  const typ = String(cd.type || '').toLowerCase();
  const art = typ === 'doughnut' || typ === 'pie' || block.type === 'chartDonut'
    ? 'donut'
    : (typ === 'bar' || block.type === 'chartBar' ? 'bar' : 'line');
  const horizontal = cd.options?.indexAxis === 'y' || block.horizontal === true;
  const gestapelt = Boolean(cd.options?.scales?.x?.stacked || cd.options?.scales?.y?.stacked);

  if (art === 'donut') {
    const werte = (datasets[0]?.data || []).map((v) => Number(v) || 0);
    const roh = labels.map((name, i) => ({ name, wert: werte[i] ?? 0 }));
    const summe = roh.reduce((s, r) => s + r.wert, 0);
    const einheit = block.unit || cd.unit || einheitAusTitel(cd.title, block.title) || (Math.abs(summe - 100) < 0.75 ? '%' : '');
    const benannt = roh.filter((r) => !SAMMEL.test(r.name.trim()));
    const sammel = roh.filter((r) => SAMMEL.test(r.name.trim()));
    const behalten = benannt.slice(0, VIZ_ANZAHL);
    const gefaltet = [...benannt.slice(VIZ_ANZAHL), ...sammel];
    const segmente = behalten.map((r, i) => ({ ...r, farbe: vizFarbe(i) }));
    if (gefaltet.length > 0) {
      const wert = gefaltet.reduce((s, r) => s + r.wert, 0);
      const nurRest = gefaltet.length === 1 && sammel.length === 1;
      segmente.push({ name: nurRest ? gefaltet[0].name : 'Sonstige', wert, farbe: token('--neutral-300'), enthaelt: nurRest ? [] : gefaltet.map((r) => r.name) });
    }
    return { art, segmente, summe, einheit, reihen: [], punkte: [], horizontal, gestapelt };
  }

  const reihen = datasets.map((d, i) => ({ key: `r${i}`, label: String(d.label || `Reihe ${i + 1}`), farbe: vizFarbe(i) }));
  const punkte = labels.map((name, i) => {
    const p = { name };
    datasets.forEach((d, j) => { p[`r${j}`] = Number.isFinite(Number(d.data[i])) ? Number(d.data[i]) : null; });
    return p;
  });
  const einheit = block.unit || cd.unit || einheitAusTitel(cd.title, block.title, datasets[0]?.label);
  const max = Math.max(0, ...punkte.flatMap((p) => reihen.map((r) => p[r.key] || 0)));
  const maxStapel = gestapelt ? Math.max(0, ...punkte.map((p) => reihen.reduce((s, r) => s + (p[r.key] || 0), 0))) : max;
  return { art, reihen, punkte, einheit, horizontal, gestapelt, max, maxStapel, segmente: [], summe: 0 };
}

export default function Diagramm({ block, kapitel }) {
  const cd = kapitel?.chartData?.[block.chartKey];
  const [ansicht, setAnsicht] = useState('diagramm');
  const [aktiv, setAktiv] = useState(null);
  const ref = useRef(null);
  const breite = useBreite(ref);
  const d = useMemo(() => (cd ? bereite(block, cd) : null), [block, cd]);

  if (!cd || !d) {
    if (import.meta.env.DEV) console.warn(`[Diagramm] chartKey „${block.chartKey}“ nicht in chartData gefunden.`);
    return null;
  }

  const einheit = d.einheit;
  const fmt = (v, ohneEinheit = false) => {
    if (v == null || !Number.isFinite(Number(v))) return '–';
    const z = zahl(Number(v));
    return einheit && !ohneEinheit ? `${z} ${einheit}` : z;
  };
  const prozentDomain = d.gestapelt && einheit === '%' && d.maxStapel <= 100.5;
  const skala = prozentDomain ? { max: 100, ticks: [0, 25, 50, 75, 100] } : schoeneTicks(d.gestapelt ? d.maxStapel : d.max, 6);
  const innen = Math.max(0, Math.floor(breite) - 2);
  const hoehe = d.art === 'donut' ? 280 : d.horizontal ? d.punkte.length * 34 + 44 : 320;
  const katBreite = Math.min(150, Math.max(60, Math.max(0, ...d.punkte.map((p) => p.name.length)) * 7.2 + 12));
  const yBreite = Math.min(80, Math.max(36, String(fmt(skala.max, true)).length * 7.5 + 12));
  const titel = block.title || cd.title;

  const umschalter = <Segment optionen={ANSICHTEN} wert={ansicht} onWechsel={setAnsicht} label="Ansicht" klein />;
  const aktivesSegment = d.art === 'donut' ? d.segmente[aktiv ?? 0] : null;

  return (
    <BlockRahmen titel={titel} quelle={block.source} quelleUrl={block.sourceUrl} aktionen={umschalter} className="bl-diagramm-block">
      {ansicht === 'tabelle' ? (
        <Tabellenansicht d={d} fmt={fmt} titel={titel} />
      ) : (
        <figure className="bl-diagramm" aria-label={`${titel || 'Diagramm'} – Werte in der Tabellenansicht`}>
          {einheit && d.art !== 'donut' && <div className="bl-diagramm-einheit">in {einheit}</div>}
          <div className={d.art === 'donut' ? 'bl-diagramm-donut' : 'bl-diagramm-flaeche'} ref={ref} role="img" aria-label={titel || 'Diagramm'}>
            {d.art === 'donut' && (
              <div className="bl-donut-huelle" style={{ width: Math.min(innen || 280, 280), height: 280 }}>
                {innen > 0 && (
                  <Suspense fallback={<div className="skelett" style={{ width: '100%', height: 280, borderRadius: '50%' }} aria-busy="true" />}>
                    <RechartsDiagramm art="donut" segmente={d.segmente} fmt={fmt} breite={Math.min(innen, 280)} hoehe={280} aktiv={aktiv} onAktiv={setAktiv} />
                  </Suspense>
                )}
                {aktivesSegment && (
                  <div className="bl-donut-mitte" aria-hidden="true">
                    <span className="bl-donut-mitte-wert">{fmt(aktivesSegment.wert)}</span>
                    <span className="bl-donut-mitte-name">{aktivesSegment.name}</span>
                  </div>
                )}
              </div>
            )}
            {d.art !== 'donut' && innen > 0 && (
              <Suspense fallback={<div className="skelett" style={{ width: '100%', height: hoehe }} aria-busy="true" />}>
                <RechartsDiagramm
                  art={d.art}
                  punkte={d.punkte}
                  reihen={d.reihen}
                  fmt={fmt}
                  horizontal={d.horizontal}
                  gestapelt={d.gestapelt}
                  breite={innen}
                  hoehe={hoehe}
                  skala={skala}
                  katBreite={katBreite}
                  yBreite={yBreite}
                />
              </Suspense>
            )}
            {d.art !== 'donut' && innen === 0 && <div className="skelett" style={{ width: '100%', height: hoehe }} aria-busy="true" />}
            {d.art === 'donut' && (
              <ul className="bl-legende-donut" aria-label="Legende">
                {d.segmente.map((s, i) => (
                  <li key={i} data-aktiv={aktiv === i} onMouseEnter={() => setAktiv(i)} onMouseLeave={() => setAktiv(null)} title={s.enthaelt?.length ? `Enthält: ${s.enthaelt.join(', ')}` : undefined}>
                    <span className="bl-legende-rechteck" style={{ background: s.farbe }} aria-hidden="true" />
                    <span className="bl-legende-name">{s.name}{s.enthaelt?.length ? <span className="bl-legende-zusatz"> ({s.enthaelt.join(', ')})</span> : null}</span>
                    <span className="bl-legende-wert">{fmt(s.wert)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {d.art !== 'donut' && d.reihen.length > 1 && (
            <ul className="bl-legende" aria-label="Legende">
              {d.reihen.map((r) => (
                <li key={r.key} className="bl-legende-eintrag">
                  <span className={d.art === 'line' ? 'bl-legende-linie' : 'bl-legende-rechteck'} style={{ background: r.farbe }} aria-hidden="true" />
                  {r.label}
                </li>
              ))}
            </ul>
          )}
        </figure>
      )}
    </BlockRahmen>
  );
}

function Tabellenansicht({ d, fmt, titel }) {
  if (d.art === 'donut') {
    return (
      <div className="bl-tabelle-huelle bl-tabelle-eigen">
        <table className="bl-tabelle bl-tabelle-klein">
          <caption className="sr-only">{titel}</caption>
          <thead><tr><th scope="col">Segment</th><th scope="col" className="bl-zahl">Wert</th></tr></thead>
          <tbody>
            {d.segmente.map((s, i) => (
              <tr key={i}><td>{s.name}{s.enthaelt?.length ? ` (${s.enthaelt.join(', ')})` : ''}</td><td className="bl-zahl">{fmt(s.wert)}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  return (
    <div className="bl-tabelle-huelle bl-tabelle-eigen" style={{ overflowX: 'auto' }}>
      <table className="bl-tabelle bl-tabelle-klein">
        <caption className="sr-only">{titel}</caption>
        <thead>
          <tr>
            <th scope="col"><span className="sr-only">Kategorie</span></th>
            {d.reihen.map((r) => <th key={r.key} scope="col" className="bl-zahl">{r.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {d.punkte.map((p, i) => (
            <tr key={i}>
              <th scope="row">{p.name}</th>
              {d.reihen.map((r) => <td key={r.key} className="bl-zahl">{fmt(p[r.key])}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
