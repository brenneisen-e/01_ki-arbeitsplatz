import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  FileText, RefreshCw, ShieldCheck, Sparkles, X, ListChecks, KeyRound,
  AlertTriangle, FileSpreadsheet, Download, SlidersHorizontal, LayoutGrid, Table2, ArrowUpRight, Flame,
} from 'lucide-react';
import { useBiks } from '../../hooks/useBiks';
import { useInstitut } from '../../hooks/useInstitut';
import {
  BIKS_STATUS, STATUS_MAP, CLUSTER_MAP, KONTROLL_ART, KONTROLL_TYP, KONTROLL_TURNUS,
  STUFE_MAP, bewertePrioritaet,
} from '../../data/biksAgent';
import RisikoKachel from './RisikoKachel';
import RisikoMatrix from './RisikoMatrix';
import RisikoDetailDrawer from './RisikoDetailDrawer';
import { StatusIcon, StatusBadge } from './StatusControls';
import { exportBiksCsv, exportBiksPdf, buildBiksRows, buildBiksSummary } from '../../utils/exportBiks';

function lbl(list, id) { return list.find(x => x.id === id)?.label || id || ''; }

function QuelleModal({ analyse, onClose }) {
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div className="relative card-base w-full max-w-2xl max-h-[85vh] overflow-y-auto scrollbar-thin bg-white">
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-slate-400" />
            <div>
              <div className="text-[14px] font-semibold">{analyse.quelldokument?.name}</div>
              <div className="text-[11px] text-slate-500">Quelldokument · {analyse.typ}</div>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <div className="text-[11px] font-bold tracking-wider uppercase text-slate-400 mb-2">Prozessschritte</div>
            <ol className="space-y-2">
              {analyse.prozessschritte.map((p, i) => (
                <li key={p.id} className="flex gap-3">
                  <span className="w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0" style={{ background: 'color-mix(in srgb, var(--mode-primary, #0F4D2A) 10%, white)', color: 'var(--mode-primary, #0F4D2A)' }}>{i + 1}</span>
                  <div>
                    <div className="text-[13px] font-semibold">{p.name}</div>
                    <div className="text-[12px] text-slate-500 leading-snug">{p.beschreibung}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <div className="text-[11px] font-bold tracking-wider uppercase text-slate-400 mb-2">Auszüge</div>
            <div className="space-y-3">
              {analyse.quelltext.map((q, i) => (
                <div key={i} className="rounded-lg p-3" style={{ background: '#F8FAFC', border: '1px solid #EEF2F6' }}>
                  <div className="text-[12.5px] font-semibold text-slate-700 mb-0.5">{q.titel}</div>
                  <div className="text-[12.5px] text-slate-600 leading-snug">{q.text}</div>
                </div>
              ))}
            </div>
          </div>
          {analyse.weitereInfos && (
            <div className="rounded-lg p-3" style={{ background: '#EFF6FF', border: '1px solid #DBEAFE' }}>
              <div className="text-[11px] font-bold tracking-wider uppercase text-blue-700 mb-1">Weitere Informationen / Inputs</div>
              <div className="text-[12.5px] text-slate-700 leading-snug">{analyse.weitereInfos}</div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

function StatDonut({ counts, total }) {
  // horizontaler Statusbalken
  return (
    <div className="flex items-stretch gap-1 h-2.5 rounded-full overflow-hidden bg-slate-100">
      {BIKS_STATUS.map(s => {
        const v = counts[s.id] || 0;
        if (v === 0) return null;
        return <div key={s.id} style={{ flex: v, background: s.color, minWidth: 6 }} title={`${s.label}: ${v}`} />;
      })}
    </div>
  );
}

function ClusterChart({ risiken }) {
  const data = useMemo(() => {
    const map = new Map();
    risiken.forEach(r => {
      const e = map.get(r.risikoart) || { label: r.risikoart, value: 0, color: CLUSTER_MAP[r.cluster]?.color || '#94A3B8' };
      e.value += 1; map.set(r.risikoart, e);
    });
    return [...map.values()];
  }, [risiken]);
  if (!data.length) return null;
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="card-base p-5">
      <div className="text-sm font-semibold mb-1">Risiken nach Risikoart</div>
      <div className="text-xs text-slate-500 mb-3">Benennung gemäß gewählter Risiko-Vorgabe</div>
      <div className="space-y-2.5">
        {data.map(d => (
          <div key={d.label} className="flex items-center gap-3">
            <span className="text-[12px] text-slate-600 w-36 shrink-0 truncate" title={d.label}>{d.label}</span>
            <div className="flex-1 h-4 rounded bg-slate-100 overflow-hidden">
              <div className="h-full rounded" style={{ width: `${(d.value / max) * 100}%`, background: d.color }} />
            </div>
            <span className="text-[12px] font-semibold w-5 text-right">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PriorityChart({ tierCount, activeTier, onHoverTier, onToggleTier }) {
  const total = tierCount.high + tierCount.mid + tierCount.low;
  if (total === 0) return null;
  // fill = kräftige Ampelfarbe (Balken), text = gut lesbare Variante (Zahl)
  const segments = [
    { tier: 'high', label: 'Hoch', value: tierCount.high, fill: '#DC2626', text: '#DC2626' },
    { tier: 'mid', label: 'Mittel', value: tierCount.mid, fill: '#EAB308', text: '#CA8A04' },
    { tier: 'low', label: 'Gering', value: tierCount.low, fill: '#16A34A', text: '#059669' },
  ];
  const dim = (t) => activeTier && activeTier !== 'alle' && activeTier !== t;
  const segs = segments.filter(s => s.value > 0); // 0er-Tiers ausblenden
  const activeSeg = segments.find(s => s.tier === activeTier);
  return (
    <div className="card-base p-5">
      <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
        <div className="text-sm font-semibold">Verteilung nach Priorität</div>
        <div className="text-[11px] text-slate-500">Balken: Hover markiert · Klick filtert</div>
      </div>
      <div className="text-xs text-slate-500 mb-3">Schadenshöhe × Eintrittswahrscheinlichkeit</div>
      {/* Spalten: Balken proportional, Zahl direkt darunter */}
      <div className="flex items-end gap-2">
        {segs.map(s => (
          <button
            key={s.tier}
            type="button"
            onMouseEnter={() => onHoverTier && onHoverTier(s.tier)}
            onMouseLeave={() => onHoverTier && onHoverTier(null)}
            onClick={() => onToggleTier && onToggleTier(s.tier)}
            title={`Priorität ${s.label}: ${s.value} — klicken zum Filtern`}
            className="min-w-0 rounded-lg text-center transition-all hover:brightness-95"
            style={{ flex: s.value, cursor: 'pointer', opacity: dim(s.tier) ? 0.4 : 1, background: activeTier === s.tier ? `color-mix(in srgb, ${s.fill} 12%, white)` : 'transparent', padding: '3px 3px 6px', border: activeTier === s.tier ? `1px solid ${s.fill}` : '1px solid transparent' }}
          >
            <div className="h-7 rounded-md w-full" style={{ background: s.fill, boxShadow: activeTier === s.tier ? 'inset 0 0 0 3px #0F172A' : 'none' }} />
            <div className="text-2xl font-bold mt-2" style={{ color: s.text }}>{s.value}</div>
            <div className="text-[11px] uppercase tracking-wider text-slate-500">{s.label}</div>
          </button>
        ))}
      </div>
      {activeSeg && (
        <div className="text-center mt-2">
          <button onClick={() => onToggleTier(activeSeg.tier)} className="text-[11.5px] text-slate-500 hover:text-slate-800 underline">
            Filter „Priorität {activeSeg.label}" aufheben
          </button>
        </div>
      )}
    </div>
  );
}

function RkmTabelle({ risiken, onOpen, hoverId, onHover }) {
  const rows = useMemo(() => buildBiksRows({ risiken }), [risiken]);
  return (
    <div className="card-base">
      <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
        <div className="text-sm font-semibold">Risiko-Kontroll-Matrix</div>
        <div className="text-[11px] text-slate-500">{rows.length} Einträge · Zeile anklicken zum Öffnen</div>
      </div>
      <div className="overflow-x-auto scrollbar-thin">
        <table className="matrix-table">
          <thead>
            <tr>
              <th style={{ width: 36 }}>Nr.</th>
              <th>Risikoart</th>
              <th>Risiko</th>
              <th>Bewertung</th>
              <th style={{ width: 108 }}>Risiko-Status</th>
              <th>Schlüsselkontrolle</th>
              <th>Ansatz / Turnus</th>
              <th>Verantwortlich</th>
              <th style={{ width: 116 }}>Kontroll-Status</th>
              <th style={{ width: 34 }}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ r, k }, i) => {
              const prio = bewertePrioritaet(r.schaden, r.eintritt);
              const c = CLUSTER_MAP[r.cluster];
              return (
                <tr
                  key={i}
                  onClick={() => onOpen(r.id)}
                  onMouseEnter={() => onHover && onHover(r.id)}
                  onMouseLeave={() => onHover && onHover(null)}
                  style={{ cursor: 'pointer', background: hoverId === r.id ? 'color-mix(in srgb, var(--mode-primary, #0F4D2A) 6%, white)' : undefined }}
                >
                  <td className="font-mono text-slate-400">{r.nummer}</td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: c?.color }} />
                      <span className="text-[12px] font-semibold">{r.risikoart}</span>
                    </div>
                  </td>
                  <td className="text-[12px] max-w-[230px]">
                    <div className="font-semibold">{r.titel}</div>
                    <div className="text-slate-500 line-clamp-2">{r.risikospezifikation}</div>
                  </td>
                  <td className="text-[11.5px] whitespace-nowrap">
                    <div>Schaden: <span className="font-semibold" style={{ color: STUFE_MAP[r.schaden]?.color }}>{STUFE_MAP[r.schaden]?.label}</span></div>
                    <div>EW: <span className="font-semibold" style={{ color: STUFE_MAP[r.eintritt]?.color }}>{STUFE_MAP[r.eintritt]?.label}</span></div>
                    <span className="chip mt-1" style={{ background: `color-mix(in srgb, ${prio.color} 12%, white)`, color: prio.color, borderColor: 'transparent' }}>Prio {prio.label}</span>
                  </td>
                  <td><StatusBadge statusId={r.status} /></td>
                  <td className="text-[12px] max-w-[210px]">
                    <div className="font-semibold">{k ? k.name : '—'}</div>
                    {k && <div className="text-slate-500 line-clamp-2">{k.ziel}</div>}
                  </td>
                  <td className="text-[11.5px]">
                    {k ? <><div>{lbl(KONTROLL_ART, k.art)} · {lbl(KONTROLL_TYP, k.typ)}</div><div className="text-slate-500">{lbl(KONTROLL_TURNUS, k.turnus)}</div></> : '—'}
                  </td>
                  <td className="text-[12px]">{k?.wer || '—'}</td>
                  <td>{k ? <StatusBadge statusId={k.status} /> : '—'}</td>
                  <td><ArrowUpRight size={14} className="text-slate-300" /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ResultBoard() {
  const { analyse, resetAnalyse, activeRisikoId, setActiveRisikoId } = useBiks();
  const { institut } = useInstitut();
  const [filter, setFilter] = useState('alle');
  const [prioFilter, setPrioFilter] = useState('alle'); // 'alle' | 'high' | 'mid' | 'low'
  const [showQuelle, setShowQuelle] = useState(false);
  const [hoverId, setHoverId] = useState(null);
  const [hoverTier, setHoverTier] = useState(null); // Hover über Prioritäts-Balken
  const [view, setView] = useState('tabelle'); // 'kacheln' | 'tabelle'

  const summary = useMemo(() => (analyse ? buildBiksSummary(analyse) : null), [analyse]);

  const stats = useMemo(() => {
    if (!analyse) return null;
    const risiken = analyse.risiken;
    const statusCounts = {};
    let kontrollen = 0;
    let kontrollCounts = {};
    risiken.forEach(r => {
      statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
      r.schluesselkontrollen.forEach(k => {
        kontrollen++;
        kontrollCounts[k.status] = (kontrollCounts[k.status] || 0) + 1;
      });
    });
    const abgenommen = statusCounts['abgenommen'] || 0;
    return { total: risiken.length, statusCounts, kontrollen, kontrollCounts, abgenommen };
  }, [analyse]);

  if (!analyse) return null;

  const gefiltert = analyse.risiken.filter(r => {
    const okStatus = filter === 'alle' || r.status === filter;
    const okPrio = prioFilter === 'alle' || bewertePrioritaet(r.schaden, r.eintritt).tier === prioFilter;
    return okStatus && okPrio;
  });
  const riskTier = (r) => bewertePrioritaet(r.schaden, r.eintritt).tier;
  const togglePrio = (t) => setPrioFilter(prev => (prev === t ? 'alle' : t));

  return (
    <div className="space-y-5 animate-fade-in-up">
      {/* Kopf */}
      <div className="card-base p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-1">
              <Sparkles size={12} className="text-emerald-600" /> b-IKS Agent · Analyseergebnis
            </div>
            <h1 className="text-xl font-bold tracking-tight">{analyse.prozessName}</h1>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <button onClick={() => setShowQuelle(true)} className="chip hover:bg-slate-100 transition-colors" title="Quelldokument anzeigen">
                <FileText size={12} /> {analyse.quelldokument?.name}
              </button>
              <span className="chip">{analyse.kategorie}</span>
              {analyse.risikoVorgaben ? (
                <span className="chip" title="Verwendete Risiko-Vorgaben — bestimmen die Benennung der Risikoart">
                  <SlidersHorizontal size={11} /> Vorgaben: {analyse.risikoVorgaben.name}
                </span>
              ) : (
                <span className="chip" title="Ohne Risiko-Vorgaben — operationelle Risikoarten der Knowledge Base">
                  <SlidersHorizontal size={11} /> Ohne Vorgaben (KB-Fallback)
                </span>
              )}
              {analyse.regulatorik?.map(r => <span key={r} className="chip"><ShieldCheck size={11} /> {r}</span>)}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => exportBiksCsv(analyse)} className="px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-[13px] font-medium inline-flex items-center gap-2">
              <FileSpreadsheet size={15} className="text-emerald-700" /> CSV
            </button>
            <button onClick={() => exportBiksPdf(analyse, institut)} className="px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-[13px] font-medium inline-flex items-center gap-2">
              <Download size={15} /> PDF
            </button>
            <button onClick={resetAnalyse} className="px-3 py-2 rounded-lg text-white text-[13px] font-semibold inline-flex items-center gap-2" style={{ background: 'var(--mode-primary, #0F4D2A)' }}>
              <RefreshCw size={15} /> Neue Analyse
            </button>
          </div>
        </div>

        {/* Ergebnis-Intro */}
        <div className="mt-4 rounded-xl p-3.5 flex gap-3" style={{ background: 'color-mix(in srgb, var(--mode-primary, #0F4D2A) 5%, white)', border: '1px solid color-mix(in srgb, var(--mode-primary, #0F4D2A) 15%, transparent)' }}>
          <Sparkles size={16} className="shrink-0 mt-0.5" style={{ color: 'var(--mode-primary, #0F4D2A)' }} />
          <p className="text-[13px] text-slate-700 leading-relaxed">{analyse.ergebnisIntro}</p>
        </div>
      </div>

      {/* Kennzahlen */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
        <div className="card-base p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#FEF2F2', color: '#DC2626' }}><AlertTriangle size={18} /></div>
          <div><div className="text-xs text-slate-500">Wesentliche Risiken</div><div className="text-2xl font-bold leading-none mt-1">{stats.total}</div><div className="text-[11px] text-slate-500 mt-1">Top-5 priorisiert</div></div>
        </div>
        <div className="card-base p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'color-mix(in srgb, #16A34A 12%, white)', color: '#15803D' }}><KeyRound size={18} /></div>
          <div><div className="text-xs text-slate-500">Schlüsselkontrollen</div><div className="text-2xl font-bold leading-none mt-1">{stats.kontrollen}</div><div className="text-[11px] text-slate-500 mt-1">vorgeschlagen & ergänzt</div></div>
        </div>
        <div className="card-base p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#FEF2F2', color: '#B91C1C' }}><Flame size={18} /></div>
          <div><div className="text-xs text-slate-500">Hohe Priorität</div><div className="text-2xl font-bold leading-none mt-1">{summary.tierCount.high}</div><div className="text-[11px] text-slate-500 mt-1">Risiken mit Tier Hoch</div></div>
        </div>
        <div className="card-base p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#ECFDF5', color: '#059669' }}><ListChecks size={18} /></div>
          <div><div className="text-xs text-slate-500">Abnahmefortschritt</div><div className="text-2xl font-bold leading-none mt-1">{Math.round((stats.abgenommen / stats.total) * 100)} %</div><div className="text-[11px] text-slate-500 mt-1">{stats.abgenommen} von {stats.total} abgenommen</div></div>
        </div>
        <div className="card-base p-4">
          <div className="text-xs text-slate-500 mb-2">Status-Verteilung</div>
          <StatDonut counts={stats.statusCounts} total={stats.total} />
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2.5">
            {BIKS_STATUS.filter(s => stats.statusCounts[s.id]).map(s => (
              <span key={s.id} className="inline-flex items-center gap-1 text-[11px]">
                <span className="w-2 h-2 rounded-full" style={{ background: s.color }} /> {s.label} <span className="font-semibold">{stats.statusCounts[s.id]}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Risikomatrix */}
      <RisikoMatrix risiken={analyse.risiken} onOpen={(id) => setActiveRisikoId(id)} hoverId={hoverId} onHover={setHoverId} hoverTier={hoverTier} />

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-3">
        <ClusterChart risiken={analyse.risiken} />
        <PriorityChart tierCount={summary.tierCount} activeTier={prioFilter} onHoverTier={setHoverTier} onToggleTier={togglePrio} />
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-500 mr-1"><SlidersHorizontal size={14} /> Filter:</span>
        <button
          onClick={() => setFilter('alle')}
          className={`chip ${filter === 'alle' ? 'selected' : ''}`}
          style={{ cursor: 'pointer' }}
        >
          Alle <span className="font-semibold ml-0.5">{analyse.risiken.length}</span>
        </button>
        {BIKS_STATUS.map(s => {
          const n = stats.statusCounts[s.id] || 0;
          if (n === 0) return null;
          const active = filter === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setFilter(active ? 'alle' : s.id)}
              className="inline-flex items-center gap-1.5 rounded-full font-semibold transition-all"
              style={{
                background: active ? s.color : s.bg,
                color: active ? 'white' : s.color,
                border: `1px solid color-mix(in srgb, ${s.color} 30%, transparent)`,
                padding: '0.2rem 0.6rem', fontSize: 11.5, cursor: 'pointer',
              }}
            >
              <StatusIcon statusId={s.id} size={12} /> <span style={active ? { color: 'white' } : undefined}>{s.label}</span> <span className="font-bold">{n}</span>
            </button>
          );
        })}

        {prioFilter !== 'alle' && (() => {
          const pt = bewertePrioritaet(prioFilter === 'high' ? 'hoch' : prioFilter === 'low' ? 'niedrig' : 'mittel', prioFilter === 'high' ? 'hoch' : prioFilter === 'low' ? 'niedrig' : 'mittel');
          return (
            <button
              onClick={() => setPrioFilter('alle')}
              className="inline-flex items-center gap-1.5 rounded-full font-semibold"
              style={{ background: `color-mix(in srgb, ${pt.fill} 16%, white)`, color: pt.text || pt.color, border: `1px solid ${pt.fill}`, padding: '0.2rem 0.6rem', fontSize: 12, cursor: 'pointer' }}
              title="Prioritätsfilter aufheben"
            >
              Priorität {pt.label} <X size={12} />
            </button>
          );
        })()}

        {/* Ansicht umschalten: Kacheln / Tabelle */}
        <div className="ml-auto inline-flex items-center gap-2">
          <span className="text-[13px] font-semibold text-slate-500">Ansicht:</span>
          <div className="inline-flex items-center rounded-lg border border-slate-200 p-0.5 bg-white">
            {[['kacheln', LayoutGrid, 'Kacheln'], ['tabelle', Table2, 'Tabelle']].map(([id, Icon, label]) => (
              <button
                key={id}
                onClick={() => setView(id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13.5px] font-semibold transition-colors ${view === id ? '' : 'hover:bg-slate-100'}`}
                style={view === id ? { background: 'var(--mode-primary, #0F4D2A)', color: 'white' } : { color: '#475569' }}
              >
                <Icon size={15} /> {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Risikoliste: Kacheln oder Tabelle */}
      {gefiltert.length === 0 ? (
        <div className="card-base p-10 text-center text-slate-400">
          <ListChecks size={32} className="mx-auto mb-2 text-slate-300" />
          Keine Risiken mit Status „{STATUS_MAP[filter]?.label}".
        </div>
      ) : view === 'kacheln' ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {gefiltert.map(r => (
            <RisikoKachel
              key={r.id}
              risiko={r}
              onOpen={() => setActiveRisikoId(r.id)}
              active={hoverId === r.id || (hoverTier && riskTier(r) === hoverTier)}
              onHover={setHoverId}
            />
          ))}
        </div>
      ) : (
        <RkmTabelle risiken={gefiltert} onOpen={(id) => setActiveRisikoId(id)} hoverId={hoverId} onHover={setHoverId} />
      )}

      {activeRisikoId && (
        <RisikoDetailDrawer risikoId={activeRisikoId} onClose={() => setActiveRisikoId(null)} />
      )}
      {showQuelle && <QuelleModal analyse={analyse} onClose={() => setShowQuelle(false)} />}
    </div>
  );
}
