import { useState } from 'react';
import { ArrowRight, TrendingDown } from 'lucide-react';
import { STUFE_MAP } from '../../data/optimierungAgent';

// Kompakte Schaden×EW-Mini-Matrix (Restrisiko nach Kontrollwirkung).
const W = 300, H = 240;
const M = { top: 16, right: 14, bottom: 44, left: 60 };
const PW = W - M.left - M.right;
const PH = H - M.top - M.bottom;

const RANK = { niedrig: 1, 'niedrig-mittel': 1.5, mittel: 2, 'mittel-hoch': 2.5, hoch: 3 };
const frac = (r) => (r - 0.5) / 3;
const xFor = (r) => M.left + frac(r) * PW;
const yFor = (r) => M.top + (1 - frac(r)) * PH;

function cellColor(s, e) {
  const score = s * e;
  if (score >= 6) return '#DC2626';
  if (score >= 3) return '#EAB308';
  return '#16A34A';
}

const cols = ['niedrig', 'mittel', 'hoch'];
const rowsTop = ['hoch', 'mittel', 'niedrig'];

function MiniMatrix({ risiken, feld, titel, hoverId, onHover }) {
  // Punkte je (Schaden×EW)-Zelle auffächern.
  const groups = {};
  risiken.forEach(r => {
    const pos = r[feld];
    const key = `${pos.schaden}|${pos.eintritt}`;
    (groups[key] = groups[key] || []).push(r);
  });
  const points = [];
  Object.values(groups).forEach(list => {
    const n = list.length;
    list.forEach((r, i) => {
      const sRank = RANK[r[feld].schaden] ?? 2;
      const eRank = RANK[r[feld].eintritt] ?? 2;
      let dx = 0, dy = 0;
      if (n > 1) {
        const rad = 15;
        const ang = (-90 + (i * 360) / n) * Math.PI / 180;
        dx = rad * Math.cos(ang); dy = rad * Math.sin(ang);
      }
      points.push({ r, x: xFor(eRank) + dx, y: yFor(sRank) + dy });
    });
  });

  return (
    <div className="flex-1 min-w-0">
      <div className="text-center text-[12px] font-semibold text-slate-600 mb-1">{titel}</div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" className="select-none">
        {rowsTop.map((sr, ri) => cols.map((ec, ci) => (
          <rect key={`${ri}-${ci}`} x={M.left + ci * (PW / 3)} y={M.top + ri * (PH / 3)} width={PW / 3} height={PH / 3} fill={cellColor(RANK[sr], RANK[ec])} fillOpacity={0.12} stroke="#E2E8F0" />
        )))}
        {cols.map((ec, ci) => (
          <text key={ec} x={M.left + (ci + 0.5) * (PW / 3)} y={M.top + PH + 16} textAnchor="middle" fontSize="9.5" fontWeight="600" fill="#64748B">{STUFE_MAP[ec].label}</text>
        ))}
        {rowsTop.map((sr, ri) => (
          <text key={sr} x={M.left - 8} y={M.top + (ri + 0.5) * (PH / 3) + 3} textAnchor="end" fontSize="9.5" fontWeight="600" fill="#64748B">{STUFE_MAP[sr].label}</text>
        ))}
        <text x={M.left + PW / 2} y={H - 6} textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#334155">Eintrittswahrscheinlichkeit →</text>
        <text x={12} y={M.top + PH / 2} textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#334155" transform={`rotate(-90 12 ${M.top + PH / 2})`}>Schadenshöhe →</text>
        {points.map(({ r, x, y }) => {
          const active = hoverId === r.id;
          const rad = active ? 15 : 11;
          const fill = cellColor(RANK[r[feld].schaden], RANK[r[feld].eintritt]);
          return (
            <g key={r.id} style={{ cursor: 'pointer', opacity: hoverId && !active ? 0.35 : 1, transition: 'opacity 0.15s' }}
               onMouseEnter={() => onHover(r.id)} onMouseLeave={() => onHover(null)}>
              <circle cx={x} cy={y} r={rad} fill={fill} stroke="white" strokeWidth={active ? 3 : 2} style={{ filter: 'drop-shadow(0 1px 2px rgba(15,23,42,0.3))', transition: 'r 0.12s' }} />
              <text x={x} y={y + (active ? 5 : 4)} textAnchor="middle" fontSize={active ? 13 : 10} fontWeight="700" fill="white" style={{ pointerEvents: 'none' }}>{r.nummer}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function BeforeAfterMatrix({ risiken }) {
  const [hoverId, setHoverId] = useState(null);
  // Risiken, deren Restrisiko sich durch Automatisierung verbessert.
  const verbessert = risiken.filter(r =>
    (RANK[r.restVorher.schaden] * RANK[r.restVorher.eintritt]) >
    (RANK[r.restNachher.schaden] * RANK[r.restNachher.eintritt])
  );

  return (
    <div className="card-base p-5">
      <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
        <div className="text-sm font-semibold">Restrisiko-Matrix — Vorher / Nachher</div>
        <div className="text-[11px] text-slate-500">Restrisiko nach Kontrollwirkung · Blase = Risiko-Nr.</div>
      </div>
      <div className="text-xs text-slate-500 mb-3">
        Die Optimierung senkt kein Risiko durch Kontrollabbau — dort wo manuelle Kontrollen automatisiert werden, sinkt die
        Eintrittswahrscheinlichkeit fehlerbedingter Ereignisse.
      </div>

      <div className="flex items-center gap-2">
        <MiniMatrix risiken={risiken} feld="restVorher" titel="Vorher (Bestand)" hoverId={hoverId} onHover={setHoverId} />
        <div className="shrink-0 flex flex-col items-center justify-center text-slate-300 px-1">
          <ArrowRight size={22} strokeWidth={2} />
        </div>
        <MiniMatrix risiken={risiken} feld="restNachher" titel="Nachher (Zielinventar)" hoverId={hoverId} onHover={setHoverId} />
      </div>

      {/* Legende + Bewegungshinweis */}
      <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          {[['#16A34A', 'Gering'], ['#EAB308', 'Mittel'], ['#DC2626', 'Hoch']].map(([c, l]) => (
            <span key={l} className="inline-flex items-center gap-1.5 text-[11px] text-slate-500">
              <span className="w-3 h-3 rounded" style={{ background: `color-mix(in srgb, ${c} 22%, white)`, border: `1px solid ${c}` }} /> {l}
            </span>
          ))}
        </div>
        {verbessert.length > 0 && (
          <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1">
            <TrendingDown size={13} /> Restrisiko verbessert bei R{verbessert.map(r => r.nummer).join(', R')}
          </span>
        )}
      </div>
    </div>
  );
}
