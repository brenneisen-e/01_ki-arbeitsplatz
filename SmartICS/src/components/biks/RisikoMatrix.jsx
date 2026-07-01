import { STUFE_MAP, bewertePrioritaet } from '../../data/biksAgent';

const W = 720, H = 470;
const M = { top: 26, right: 28, bottom: 80, left: 104 };
const PW = W - M.left - M.right;
const PH = H - M.top - M.bottom;

const RANK = { niedrig: 1, 'niedrig-mittel': 1.5, mittel: 2, 'mittel-hoch': 2.5, hoch: 3 };
const frac = (rank) => (rank - 0.5) / 3;
const xFor = (rank) => M.left + frac(rank) * PW;
// Schadenshöhe steigt nach oben: hoch oben, niedrig unten (konventionell).
const yFor = (rank) => M.top + (1 - frac(rank)) * PH;

function cellColor(sRank, eRank) {
  const score = sRank * eRank;
  if (score >= 6) return '#DC2626';
  if (score >= 3) return '#EAB308';
  return '#16A34A';
}

export default function RisikoMatrix({ risiken, onOpen, hoverId = null, onHover, hoverTier = null, hoverRisikoart = null }) {
  const hovered = hoverId;
  const setHovered = onHover || (() => {});

  // Positionen berechnen; bei identischer (Schaden × EW)-Zelle leicht auffächern.
  const groups = {};
  risiken.forEach(r => {
    const key = `${r.schaden}|${r.eintritt}`;
    (groups[key] = groups[key] || []).push(r);
  });
  const points = [];
  Object.values(groups).forEach(list => {
    const n = list.length;
    list.forEach((r, i) => {
      const sRank = RANK[r.schaden] ?? 2;
      const eRank = RANK[r.eintritt] ?? 2;
      let dx = 0, dy = 0;
      if (n > 1) {
        const rad = 24;
        const ang = (-90 + (i * 360) / n) * Math.PI / 180;
        dx = rad * Math.cos(ang);
        dy = rad * Math.sin(ang);
      }
      points.push({ r, x: xFor(eRank) + dx, y: yFor(sRank) + dy });
    });
  });

  const cols = ['niedrig', 'mittel', 'hoch'];        // X: EW, links → rechts
  const rowsTop = ['hoch', 'mittel', 'niedrig'];     // Y: Schaden, hoch oben → niedrig unten
  const tip = points.find(p => p.r.id === hovered);

  return (
    <div className="card-base p-5">
      <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
        <div className="text-sm font-semibold">Risikomatrix</div>
        <div className="text-[11px] text-slate-500">Blase anklicken, um das Risiko zu öffnen · Hover für Details</div>
      </div>
      <div className="text-xs text-slate-500 mb-3">Schadenshöhe × Eintrittswahrscheinlichkeit</div>

      <div className="mx-auto" style={{ maxWidth: 560 }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" className="select-none">
        {/* Heatmap-Zellen */}
        {rowsTop.map((sr, ri) => cols.map((ec, ci) => {
          const col = cellColor(RANK[sr], RANK[ec]);
          return (
            <rect
              key={`${ri}-${ci}`}
              x={M.left + ci * (PW / 3)}
              y={M.top + ri * (PH / 3)}
              width={PW / 3}
              height={PH / 3}
              fill={col}
              fillOpacity={0.13}
              stroke="#E2E8F0"
            />
          );
        }))}

        {/* X-Tick-Labels (EW) */}
        {cols.map((ec, ci) => (
          <text key={ec} x={M.left + (ci + 0.5) * (PW / 3)} y={M.top + PH + 24} textAnchor="middle" fontSize="12.5" fontWeight="600" fill="#475569">
            {STUFE_MAP[ec].label}
          </text>
        ))}
        {/* Y-Tick-Labels (Schaden) */}
        {rowsTop.map((sr, ri) => (
          <text key={sr} x={M.left - 14} y={M.top + (ri + 0.5) * (PH / 3) + 4} textAnchor="end" fontSize="12.5" fontWeight="600" fill="#475569">
            {STUFE_MAP[sr].label}
          </text>
        ))}

        {/* Achsenbeschriftung */}
        <text x={M.left + PW / 2} y={H - 14} textAnchor="middle" fontSize="12.5" fontWeight="700" fill="#0F172A">
          Eintrittswahrscheinlichkeit →
        </text>
        <text x={26} y={M.top + PH / 2} textAnchor="middle" fontSize="12.5" fontWeight="700" fill="#0F172A" transform={`rotate(-90 26 ${M.top + PH / 2})`}>
          Schadenshöhe →
        </text>

        {/* Bubbles */}
        {points.map(({ r, x, y }) => {
          const tier = bewertePrioritaet(r.schaden, r.eintritt);
          const isHover = hovered === r.id;
          const tierMatch = hoverTier && tier.tier === hoverTier;
          const artMatch = hoverRisikoart && r.risikoart === hoverRisikoart;
          const active = isHover || tierMatch || artMatch;
          const dim = (hovered || hoverTier || hoverRisikoart) && !active;
          const rad = active ? 24 : 17;
          const numColor = tier.tier === 'mid' ? '#713F12' : 'white';
          return (
            <g
              key={r.id}
              style={{ cursor: 'pointer', opacity: dim ? 0.32 : 1, transition: 'opacity 0.15s ease' }}
              onMouseEnter={() => setHovered(r.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onOpen(r.id)}
            >
              {active && <circle cx={x} cy={y} r={rad + 9} fill={tier.fill} opacity={0.22} className="matrix-pulse" />}
              <circle
                cx={x} cy={y} r={rad}
                fill={tier.fill}
                stroke="white"
                strokeWidth={active ? 4 : 2.5}
                style={{ filter: active ? 'drop-shadow(0 4px 8px rgba(15,23,42,0.4))' : 'drop-shadow(0 2px 3px rgba(15,23,42,0.25))', transition: 'r 0.12s ease' }}
              />
              <text x={x} y={y + (active ? 6.5 : 5)} textAnchor="middle" fontSize={active ? 19 : 14} fontWeight="700" fill={numColor} style={{ pointerEvents: 'none' }}>{r.nummer}</text>
            </g>
          );
        })}

        {/* Tooltip */}
        {tip && (() => {
          const tw = 320, th = 118;
          let tx = Math.max(6, Math.min(tip.x - tw / 2, W - tw - 6));
          let ty = tip.y - th - 20;
          if (ty < 4) ty = tip.y + 30;
          return (
            <foreignObject x={tx} y={ty} width={tw} height={th} style={{ pointerEvents: 'none', overflow: 'visible' }}>
              <div style={{ background: '#0F172A', color: 'white', borderRadius: 12, padding: '11px 14px', boxShadow: '0 10px 26px rgba(15,23,42,0.4)' }}>
                <div style={{ fontSize: 12.5, opacity: 0.72, marginBottom: 3 }}>Risiko {tip.r.nummer} · {tip.r.risikoart}</div>
                <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.25 }}>{tip.r.titel}</div>
                <div style={{ fontSize: 12.5, marginTop: 6, opacity: 0.9 }}>
                  Schaden {STUFE_MAP[tip.r.schaden]?.label} · EW {STUFE_MAP[tip.r.eintritt]?.label}
                </div>
              </div>
            </foreignObject>
          );
        })()}
      </svg>
      </div>

      {/* Legende */}
      <div className="flex items-center gap-4 mt-2 justify-center flex-wrap">
        {[['#16A34A', 'Gering'], ['#EAB308', 'Mittel'], ['#DC2626', 'Hoch']].map(([c, l]) => (
          <span key={l} className="inline-flex items-center gap-1.5 text-[11px] text-slate-500">
            <span className="w-3 h-3 rounded" style={{ background: `color-mix(in srgb, ${c} 22%, white)`, border: `1px solid ${c}` }} /> Priorität {l}
          </span>
        ))}
      </div>
    </div>
  );
}
