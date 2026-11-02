// ===========================================================================
// charts/Recharts.jsx — die lazy geladene Recharts-Hülle (React.lazy aus
// content/Diagramm.jsx; vite.config.js hält recharts im Bündel
// vendor-recharts). Drei Formen: Linien, Säulen/Balken (auch gestapelt und
// horizontal), Donut. Achsen sind DIREKTE Kinder der Diagramme — nie in
// einem Fragment (Recharts ignoriert sie sonst, Audit K3). Farben kommen
// aufgelöst aus den Tokens, Zahlen deutsch formatiert, Tooltip im Hausstil.
// Breite und Höhe werden vom Aufrufer gemessen und übergeben (kein
// ResponsiveContainer, keine 0-Breiten-Warnung beim ersten Render).
// ===========================================================================
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid, LabelList,
} from 'recharts';
import { token } from '../content/hilfen.js';

function HausTooltip({ active, payload, label, fmt, art }) {
  if (!active || !payload || payload.length === 0) return null;
  const zeilen = art === 'donut'
    ? payload.map((p) => ({ name: p.name, wert: p.value, farbe: p.payload?.fill || p.color }))
    : payload.map((p) => ({ name: p.name, wert: p.value, farbe: p.color }));
  const titel = art === 'donut' ? null : label;
  return (
    <div className="bl-tooltip">
      {titel != null && <div className="bl-tooltip-titel">{titel}</div>}
      {zeilen.map((z, i) => (
        <div key={i} className="bl-tooltip-zeile">
          <span className="bl-tooltip-schluessel" data-form={art === 'line' ? 'linie' : 'rechteck'} style={{ background: z.farbe }} />
          <span className="bl-tooltip-wert">{fmt(z.wert)}</span>
          <span className="bl-tooltip-name">{z.name}</span>
        </div>
      ))}
    </div>
  );
}

function EndMarke({ x, y, value, index, letzter, fmt }) {
  if (index !== letzter || value == null || x == null || y == null) return null;
  return (
    <text x={x + 7} y={y + 4} fontSize={12} fontWeight={600} fill={token('--text-2')} style={{ paintOrder: 'stroke', stroke: token('--flaeche-karte'), strokeWidth: 3, strokeLinejoin: 'round' }}>
      {fmt(value)}
    </text>
  );
}

export default function RechartsDiagramm({
  art, punkte = [], reihen = [], segmente = [], fmt, horizontal = false, gestapelt = false,
  breite, hoehe, skala = null, katBreite = 90, yBreite = 44, aktiv = null, onAktiv,
}) {
  const gitter = token('--viz-gitter');
  const achse = token('--viz-achse');
  const text2 = token('--text-2');
  const flaeche = token('--flaeche-karte');
  const tickZahl = { fontSize: 12, fill: achse };
  const tickKategorie = { fontSize: 12, fill: text2 };
  const fmtAchse = (v) => fmt(v, true);

  if (art === 'donut') {
    const groesse = Math.max(200, Math.min(breite, hoehe));
    return (
      <PieChart width={groesse} height={groesse} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
        <Pie
          data={segmente}
          dataKey="wert"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius="58%"
          outerRadius="90%"
          paddingAngle={1.2}
          stroke={flaeche}
          strokeWidth={2}
          isAnimationActive={false}
          onMouseEnter={(_, i) => onAktiv && onAktiv(i)}
          onMouseLeave={() => onAktiv && onAktiv(null)}
        >
          {segmente.map((s, i) => (
            <Cell key={i} fill={s.farbe} fillOpacity={aktiv == null || aktiv === i ? 1 : 0.4} />
          ))}
        </Pie>
      </PieChart>
    );
  }

  if (art === 'bar' && horizontal) {
    return (
      <BarChart data={punkte} layout="vertical" width={breite} height={hoehe} margin={{ top: 4, right: 56, bottom: 4, left: 4 }} barCategoryGap={8}>
        <CartesianGrid horizontal={false} stroke={gitter} />
        <XAxis type="number" tick={tickZahl} tickFormatter={fmtAchse} axisLine={false} tickLine={false} domain={skala ? [0, skala.max] : [0, 'auto']} ticks={skala ? skala.ticks : undefined} />
        <YAxis type="category" dataKey="name" width={katBreite} tick={tickKategorie} axisLine={{ stroke: gitter }} tickLine={false} interval={0} />
        <Tooltip content={<HausTooltip fmt={fmt} art="bar" />} cursor={{ fill: 'rgba(15, 23, 42, 0.04)' }} />
        {reihen.map((r) => (
          <Bar key={r.key} dataKey={r.key} name={r.label} fill={r.farbe} barSize={22} radius={[0, 4, 4, 0]} isAnimationActive={false}>
            {reihen.length === 1 && <LabelList dataKey={r.key} position="right" formatter={fmtAchse} style={{ fill: text2, fontSize: 12, fontWeight: 600 }} />}
          </Bar>
        ))}
      </BarChart>
    );
  }

  if (art === 'bar') {
    return (
      <BarChart data={punkte} width={breite} height={hoehe} margin={{ top: 12, right: 12, bottom: 4, left: 4 }} barCategoryGap="28%" barGap={4}>
        <CartesianGrid vertical={false} stroke={gitter} />
        <XAxis dataKey="name" tick={tickKategorie} axisLine={{ stroke: gitter }} tickLine={false} tickMargin={8} interval="preserveStartEnd" />
        <YAxis tick={tickZahl} tickFormatter={fmtAchse} axisLine={false} tickLine={false} width={yBreite} domain={skala ? [0, skala.max] : [0, 'auto']} ticks={skala ? skala.ticks : undefined} />
        <Tooltip content={<HausTooltip fmt={fmt} art="bar" />} cursor={{ fill: 'rgba(15, 23, 42, 0.04)' }} />
        {reihen.map((r, i) => (
          <Bar
            key={r.key}
            dataKey={r.key}
            name={r.label}
            fill={r.farbe}
            stackId={gestapelt ? 'stapel' : undefined}
            barSize={gestapelt ? 28 : 24}
            stroke={gestapelt ? flaeche : undefined}
            strokeWidth={gestapelt ? 2 : 0}
            radius={!gestapelt ? [4, 4, 0, 0] : (i === reihen.length - 1 ? [3, 3, 0, 0] : 0)}
            isAnimationActive={false}
          >
            {!gestapelt && reihen.length === 1 && <LabelList dataKey={r.key} position="top" formatter={fmtAchse} style={{ fill: text2, fontSize: 12, fontWeight: 600 }} />}
          </Bar>
        ))}
      </BarChart>
    );
  }

  const letzter = punkte.length - 1;
  return (
    <LineChart data={punkte} width={breite} height={hoehe} margin={{ top: 12, right: 52, bottom: 4, left: 4 }}>
      <CartesianGrid vertical={false} stroke={gitter} />
      <XAxis dataKey="name" tick={tickKategorie} axisLine={{ stroke: gitter }} tickLine={false} tickMargin={8} minTickGap={10} />
      <YAxis tick={tickZahl} tickFormatter={fmtAchse} axisLine={false} tickLine={false} width={yBreite} domain={skala ? [0, skala.max] : [0, 'auto']} ticks={skala ? skala.ticks : undefined} />
      <Tooltip content={<HausTooltip fmt={fmt} art="line" />} cursor={{ stroke: token('--rand-stark'), strokeWidth: 1 }} />
      {reihen.map((r) => (
        <Line
          key={r.key}
          type="monotone"
          dataKey={r.key}
          name={r.label}
          stroke={r.farbe}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 5, strokeWidth: 2, stroke: flaeche, fill: r.farbe }}
          isAnimationActive={false}
        >
          {reihen.length <= 4 && <LabelList dataKey={r.key} content={<EndMarke letzter={letzter} fmt={fmtAchse} />} />}
        </Line>
      ))}
    </LineChart>
  );
}
