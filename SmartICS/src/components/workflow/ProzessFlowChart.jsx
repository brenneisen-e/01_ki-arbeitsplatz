import { useMemo, useState } from 'react';
import {
  Play, Square, CheckCircle2, AlertCircle, FileText, Search,
  ShieldCheck, ClipboardList, Calculator, Database, Key, BookOpen,
  Coins, Building2, Filter, ScanLine, Send, BarChart3, FileCheck2,
  Inbox, ShieldAlert, FileSearch, Banknote, Repeat, Layers, Eye,
  ListChecks, Maximize2, X, ZoomIn, ZoomOut,
} from 'lucide-react';

// Mapping passender Lucide-Icons je Aktivität — Fallback: ClipboardList
const ICON_HINTS = [
  { match: /erfass|antrag/i,                  icon: Inbox },
  { match: /kyc|sanktion|identi|pep/i,        icon: ShieldAlert },
  { match: /bonität|§\s*18|bilanz|analyse/i,  icon: FileSearch },
  { match: /sicherheit/i,                     icon: ShieldCheck },
  { match: /rating/i,                         icon: BarChart3 },
  { match: /entscheid|votum|genehmig/i,       icon: FileCheck2 },
  { match: /auszahl|buchung/i,                icon: Banknote },
  { match: /überwach|monitor/i,               icon: Eye },
  { match: /trade.?erfass|trade.?anlage/i,    icon: Inbox },
  { match: /trade.?matching|matching/i,       icon: Layers },
  { match: /confirm/i,                        icon: Send },
  { match: /settlement|instrukt/i,            icon: Repeat },
  { match: /cash|stücke|abwickl/i,            icon: Coins },
  { match: /reconcil|abstimm/i,               icon: Layers },
  { match: /auftrags|annahme/i,               icon: Inbox },
  { match: /plausib/i,                        icon: ScanLine },
  { match: /embargo|sanktions/i,              icon: ShieldAlert },
  { match: /limit/i,                          icon: Filter },
  { match: /freigabe|routing/i,               icon: Send },
  { match: /reporting|melde/i,                icon: BarChart3 },
  { match: /schaden.?meldung/i,               icon: Inbox },
  { match: /deckungs/i,                       icon: ShieldCheck },
  { match: /ermittl|gutacht/i,                icon: FileSearch },
  { match: /reserv/i,                         icon: Database },
  { match: /regulier/i,                       icon: FileCheck2 },
  { match: /regress/i,                        icon: Repeat },
];

function pickIcon(name) {
  for (const h of ICON_HINTS) if (h.match.test(name)) return h.icon;
  return ClipboardList;
}

// Lane-Heuristik basierend auf Aktivitätsname (vereinfachtes BPMN-Swimlane)
function pickLane(name) {
  const n = name.toLowerCase();
  if (/(erfass|annahme|antrag|meldung)/.test(n)) return { id: 'in', label: 'Eingang', color: '#2563EB' };
  if (/(kyc|sanktion|prüf|deckung|plausib|limit|embargo|gutacht)/.test(n)) return { id: 'check', label: 'Prüfung & Kontrolle', color: '#7C3AED' };
  if (/(analyse|bonität|rating|reserv|ermittl|matching|confirm)/.test(n)) return { id: 'ana', label: 'Analyse', color: '#0891B2' };
  if (/(entscheid|votum|genehmig|freigabe|regulier|routing)/.test(n)) return { id: 'dec', label: 'Entscheidung', color: '#D97706' };
  if (/(auszahl|settle|buchung|cash)/.test(n)) return { id: 'exec', label: 'Ausführung', color: '#059669' };
  if (/(monitor|überwach|reporting|reconcil|regress)/.test(n)) return { id: 'mon', label: 'Monitoring', color: '#475569' };
  return { id: 'flow', label: 'Prozess', color: '#0F4D2A' };
}

function ActivityNode({ activity, index, onClick, active, zoom = 1 }) {
  const Icon = pickIcon(activity.name);
  const lane = pickLane(activity.name);
  const confirmed = activity.confirmed !== false;
  const removed = activity._remove;

  if (removed) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex flex-col items-stretch text-left rounded-xl border bg-white transition-all hover:shadow-md ${active ? 'ring-2 ring-emerald-600 ring-offset-2' : ''}`}
      style={{
        width: 200 * zoom,
        borderColor: confirmed ? lane.color : '#CBD5E1',
        boxShadow: confirmed ? `0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px color-mix(in srgb, ${lane.color} 10%, transparent)` : '0 1px 2px rgba(0,0,0,0.04)',
      }}
    >
      <div
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-t-xl text-[10px] font-semibold uppercase tracking-wider text-white"
        style={{ background: lane.color, fontSize: 10 * zoom }}
      >
        <span className="opacity-80">#{String(index + 1).padStart(2, '0')}</span>
        <span className="opacity-90">{lane.label}</span>
        <span className="ml-auto inline-flex items-center gap-0.5">
          {activity.custom && <span className="bg-white/30 px-1 rounded">manuell</span>}
          {confirmed ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
        </span>
      </div>
      <div className="px-3 py-2.5 flex items-start gap-2.5">
        <div
          className="rounded-lg flex items-center justify-center shrink-0"
          style={{
            width: 32 * zoom,
            height: 32 * zoom,
            background: `color-mix(in srgb, ${lane.color} 12%, white)`,
            color: lane.color,
          }}
        >
          <Icon size={16 * zoom} strokeWidth={1.75} />
        </div>
        <div className="min-w-0">
          <div className="font-semibold leading-tight" style={{ fontSize: 13 * zoom, color: '#0F172A' }}>
            {activity.name}
          </div>
          <div className="text-slate-500 leading-snug mt-0.5 line-clamp-3" style={{ fontSize: 11 * zoom }}>
            {activity.beschreibung}
          </div>
        </div>
      </div>
    </button>
  );
}

function FlowConnector({ direction = 'right', color = '#0F4D2A', zoom = 1 }) {
  if (direction === 'right') {
    return (
      <div className="flex items-center" style={{ width: 32 * zoom }}>
        <svg width={32 * zoom} height={20} viewBox="0 0 32 20" fill="none">
          <line x1="0" y1="10" x2="24" y2="10" stroke={color} strokeWidth="1.8" />
          <polygon points="24,4 32,10 24,16" fill={color} />
        </svg>
      </div>
    );
  }
  if (direction === 'left') {
    return (
      <div className="flex items-center" style={{ width: 32 * zoom }}>
        <svg width={32 * zoom} height={20} viewBox="0 0 32 20" fill="none">
          <line x1="8" y1="10" x2="32" y2="10" stroke={color} strokeWidth="1.8" />
          <polygon points="8,4 0,10 8,16" fill={color} />
        </svg>
      </div>
    );
  }
  // down
  return (
    <div className="flex justify-center" style={{ height: 28 * zoom }}>
      <svg width={20} height={28 * zoom} viewBox="0 0 20 28" fill="none">
        <line x1="10" y1="0" x2="10" y2="20" stroke={color} strokeWidth="1.8" />
        <polygon points="4,20 10,28 16,20" fill={color} />
      </svg>
    </div>
  );
}

function StartEndNode({ kind, color, zoom = 1 }) {
  const Icon = kind === 'start' ? Play : Square;
  const label = kind === 'start' ? 'Start' : 'Ende';
  return (
    <div className="flex flex-col items-center justify-center text-center" style={{ width: 90 * zoom }}>
      <div
        className="rounded-full flex items-center justify-center text-white"
        style={{ width: 56 * zoom, height: 56 * zoom, background: color, boxShadow: `0 4px 12px color-mix(in srgb, ${color} 30%, transparent)` }}
      >
        <Icon size={22 * zoom} strokeWidth={2} />
      </div>
      <div className="text-[11px] font-semibold mt-1.5 text-slate-700">{label}</div>
    </div>
  );
}

// =============================================================================
// Hauptkomponente
// =============================================================================
export default function ProzessFlowChart({ session, onSelectActivity, activeId, fullscreen = false, onToggleFullscreen }) {
  const [zoom, setZoom] = useState(1);

  const items = useMemo(
    () => (session?.aktivitaeten || []).filter(a => !a._remove),
    [session]
  );

  // Lane-Statistik
  const laneStats = useMemo(() => {
    const map = new Map();
    for (const a of items) {
      const l = pickLane(a.name);
      const cur = map.get(l.id) || { ...l, count: 0 };
      cur.count += 1;
      map.set(l.id, cur);
    }
    return Array.from(map.values());
  }, [items]);

  const accent = '#0F4D2A';

  // Layout: 4 Knoten pro Zeile, danach Umbruch (Schlangenlinie)
  const COLS = 4;
  const rows = [];
  for (let i = 0; i < items.length; i += COLS) {
    const row = items.slice(i, i + COLS);
    const rowIndex = Math.floor(i / COLS);
    const reverse = rowIndex % 2 === 1; // Boustrophedon-Layout
    rows.push({ row, reverse, rowIndex, offset: i });
  }

  if (!items.length) return null;

  return (
    <div className={fullscreen ? 'fixed inset-0 z-50 bg-slate-950/80 p-6 overflow-auto scrollbar-thin' : ''}>
      <div className={`card-base ${fullscreen ? 'max-w-[1400px] mx-auto' : ''}`}>
        <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'color-mix(in srgb, var(--mode-primary, #0F4D2A) 12%, white)', color: 'var(--mode-primary, #0F4D2A)' }}>
              <Layers size={18} strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate">Erkannter Prozess-Flow</div>
              <div className="text-[11px] text-slate-500 truncate">
                {items.length} Aktivitäten · {laneStats.length} Prozess-Phasen · Quelle: {session?.quelldokument?.name || 'Demo-Bibliothek'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg px-1.5 py-1">
              <button
                onClick={() => setZoom(z => Math.max(0.7, Math.round((z - 0.1) * 10) / 10))}
                className="p-1 hover:bg-white rounded text-slate-600"
                title="Verkleinern"
              >
                <ZoomOut size={14} />
              </button>
              <span className="text-[11px] font-mono font-semibold w-9 text-center">{Math.round(zoom * 100)}%</span>
              <button
                onClick={() => setZoom(z => Math.min(1.4, Math.round((z + 0.1) * 10) / 10))}
                className="p-1 hover:bg-white rounded text-slate-600"
                title="Vergrößern"
              >
                <ZoomIn size={14} />
              </button>
            </div>
            <button
              onClick={onToggleFullscreen}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
              title={fullscreen ? 'Schließen' : 'Vollbild'}
            >
              {fullscreen ? <X size={14} /> : <Maximize2 size={14} />}
            </button>
          </div>
        </div>

        {/* Lane-Legende */}
        <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2 flex-wrap text-[11px]">
          <span className="text-slate-500 font-semibold uppercase tracking-wider mr-1">Phasen:</span>
          {laneStats.map(l => (
            <span key={l.id} className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full" style={{ background: `color-mix(in srgb, ${l.color} 8%, white)`, border: `1px solid color-mix(in srgb, ${l.color} 25%, transparent)`, color: l.color, fontWeight: 600 }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: l.color }} />
              {l.label}
              <span className="font-mono opacity-70">×{l.count}</span>
            </span>
          ))}
        </div>

        <div className="p-5 overflow-x-auto scrollbar-thin">
          <div className="min-w-fit space-y-1">
            {rows.map((rowData, ri) => {
              const isFirst = ri === 0;
              const isLast = ri === rows.length - 1;
              const reverse = rowData.reverse;
              // arr ist die VISUELLE Reihenfolge (links → rechts); bei reverse spiegeln wir.
              const arr = reverse ? [...rowData.row].reverse() : rowData.row;
              // Original-Indizes (logische Position im Gesamtflow)
              const origIdx = (idx) =>
                rowData.offset + (reverse ? rowData.row.length - 1 - idx : idx);
              // Verbinder zwischen zwei Knoten zeigt logisch immer "vorwärts", d.h.
              // in einer reversen Zeile zeigt der Verbinder visuell nach LINKS.
              const interArrow = reverse ? 'left' : 'right';

              // Platzhalter-Breite, damit reverse Rows in der gleichen Spalte enden wie forward Rows.
              const padForReverseAlign = (COLS - rowData.row.length) * (200 + 32) * zoom;

              return (
                <div key={ri}>
                  <div className="flex items-stretch gap-0">
                    {/* === Vorderer Bereich (links) === */}
                    {isFirst && !reverse && (
                      // Erste Zeile, vorwärts: Start-Node links, dann →
                      <>
                        <StartEndNode kind="start" color="#0F4D2A" zoom={zoom} />
                        <FlowConnector direction="right" color={accent} zoom={zoom} />
                      </>
                    )}
                    {isLast && reverse && (
                      // Letzte Zeile, reverse: Ende-Node ganz links (visuell), Pfeil ← in den Node hinein
                      <>
                        <StartEndNode kind="end" color="#86BC25" zoom={zoom} />
                        <FlowConnector direction="left" color={accent} zoom={zoom} />
                      </>
                    )}
                    {/* Spalten-Auffüllung, falls reverse Row weniger als COLS Items hat —
                        sorgt dafür, dass die reverse Row visuell rechts beginnt */}
                    {reverse && rowData.row.length < COLS && (
                      <div style={{ width: padForReverseAlign }} />
                    )}

                    {/* === Items === */}
                    {arr.map((a, idx) => (
                      <div key={a.id} className="flex items-stretch">
                        <ActivityNode
                          activity={a}
                          index={origIdx(idx)}
                          onClick={() => onSelectActivity && onSelectActivity(a.id)}
                          active={activeId === a.id}
                          zoom={zoom}
                        />
                        {idx < arr.length - 1 && (
                          <FlowConnector direction={interArrow} color={accent} zoom={zoom} />
                        )}
                      </div>
                    ))}

                    {/* === Hinterer Bereich (rechts) === */}
                    {isLast && !reverse && (
                      <>
                        <FlowConnector direction="right" color={accent} zoom={zoom} />
                        <StartEndNode kind="end" color="#86BC25" zoom={zoom} />
                      </>
                    )}
                  </div>

                  {/* Down-Connector zur nächsten Zeile */}
                  {!isLast && (() => {
                    // Position der letzten visuell sichtbaren Spalte in dieser Zeile bestimmen.
                    // Forward-Zeile: letzte Spalte = COLS-1 (rechts).
                    // Reverse-Zeile: letzte Spalte (visuell) = 0 (links).
                    // Der Down-Pfeil wird unter dieser Spalte zentriert.
                    const arrowOnRight = !reverse;
                    return (
                      <div
                        className="flex"
                        style={{
                          // Start-Node-Offset auf der ersten Zeile berücksichtigen (90 + 32 px)
                          paddingLeft: arrowOnRight
                            ? ((COLS - 1) * (200 + 32) + (isFirst ? 90 + 32 : 0)) * zoom
                            : 0,
                          paddingRight: arrowOnRight ? 0 : (isFirst ? (90 + 32) * zoom : 0),
                          justifyContent: arrowOnRight ? 'flex-start' : 'flex-start',
                        }}
                      >
                        <div style={{ width: 200 * zoom }}>
                          <FlowConnector direction="down" color={accent} zoom={zoom} />
                        </div>
                      </div>
                    );
                  })()}
                </div>
              );
            })}
          </div>
        </div>

        {/* Hinweis-Footer */}
        <div className="px-5 py-2.5 border-t border-slate-100 flex items-center gap-3 text-[11px] text-slate-500 bg-slate-50/60">
          <FileText size={12} className="text-slate-400" />
          <span>
            Aus dem Quelldokument wurden <strong className="text-slate-700">{items.length} Aktivitäten</strong> automatisch extrahiert,
            in <strong className="text-slate-700">{laneStats.length} Prozess-Phasen</strong> gruppiert und logisch verknüpft.
          </span>
          <span className="ml-auto inline-flex items-center gap-1.5">
            <CheckCircle2 size={12} className="text-emerald-600" />
            {items.filter(a => a.confirmed !== false).length} bestätigt
          </span>
        </div>
      </div>
    </div>
  );
}
