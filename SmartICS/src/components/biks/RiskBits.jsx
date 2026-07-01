import { CLUSTER_MAP, STUFE_MAP, bewertePrioritaet } from '../../data/biksAgent';

export function ClusterDot({ clusterId, size = 9 }) {
  const c = CLUSTER_MAP[clusterId];
  return <span className="rounded-full inline-block shrink-0" style={{ width: size, height: size, background: c?.color || '#94A3B8' }} />;
}

export function RisikoartBadge({ clusterId, label }) {
  const c = CLUSTER_MAP[clusterId];
  const color = c?.color || '#475569';
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full font-semibold whitespace-nowrap"
      style={{ background: `color-mix(in srgb, ${color} 12%, white)`, color, border: `1px solid color-mix(in srgb, ${color} 26%, transparent)`, padding: '0.14rem 0.55rem', fontSize: 11 }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

// Kompakte Schaden/Eintritt-Anzeige
export function SchadenEintritt({ schaden, eintritt }) {
  const s = STUFE_MAP[schaden];
  const e = STUFE_MAP[eintritt];
  const Item = ({ k, stufe }) => (
    <span className="inline-flex items-center gap-1">
      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{k}</span>
      <span className="text-[11.5px] font-semibold" style={{ color: stufe?.color || '#475569' }}>{stufe?.label || '—'}</span>
    </span>
  );
  return (
    <span className="inline-flex items-center gap-3">
      <Item k="Schaden" stufe={s} />
      <span className="text-slate-300">·</span>
      <Item k="EW" stufe={e} />
    </span>
  );
}

export function PrioTier({ schaden, eintritt, showLabel = true }) {
  const t = bewertePrioritaet(schaden, eintritt);
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full font-bold whitespace-nowrap"
      style={{ background: `color-mix(in srgb, ${t.color} 12%, white)`, color: t.color, border: `1px solid color-mix(in srgb, ${t.color} 30%, transparent)`, padding: '0.14rem 0.5rem', fontSize: 10.5 }}
      title="Priorität = Schaden × Eintrittswahrscheinlichkeit"
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: t.color }} />
      {showLabel ? `Priorität ${t.label}` : t.label}
    </span>
  );
}

// Kleine 3×3-Heatmap, markiert die Zelle (Schaden × Eintritt)
export function HeatmapMini({ schaden, eintritt }) {
  const rows = ['hoch', 'mittel', 'niedrig'];      // von oben (hoch) nach unten
  const cols = ['niedrig', 'mittel', 'hoch'];       // von links (niedrig) nach rechts
  const rank = { niedrig: 1, 'niedrig-mittel': 1.5, mittel: 2, 'mittel-hoch': 2.5, hoch: 3 };
  const sRank = rank[schaden] ?? 2;
  const eRank = rank[eintritt] ?? 2;
  const cellColor = (r, c) => {
    const score = (rank[r]) * (rank[c]);
    if (score >= 6) return '#DC2626';
    if (score >= 3) return '#EAB308';
    return '#16A34A';
  };
  // aktive Zelle bestimmen (nächstliegende Stufe)
  const nearest = (val, arr) => arr.reduce((a, b) => (Math.abs(rank[b] - val) < Math.abs(rank[a] - val) ? b : a));
  const activeRow = nearest(sRank, rows);
  const activeCol = nearest(eRank, cols);
  return (
    <div className="inline-flex flex-col gap-[3px]" title="Risikomatrix: Schaden × Eintrittswahrscheinlichkeit">
      {rows.map(r => (
        <div key={r} className="flex gap-[3px]">
          {cols.map(c => {
            const active = r === activeRow && c === activeCol;
            const col = cellColor(r, c);
            return (
              <span
                key={c}
                className="rounded-[3px]"
                style={{
                  width: 12, height: 12,
                  background: active ? col : `color-mix(in srgb, ${col} 16%, white)`,
                  boxShadow: active ? `0 0 0 1.5px white, 0 0 0 3px ${col}` : 'none',
                }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
