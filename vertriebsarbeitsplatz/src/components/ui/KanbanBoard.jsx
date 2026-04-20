import { useState, useMemo, useRef } from 'react';
import {
  Search,
  Filter,
  AlertTriangle,
  Sparkles,
  X,
  RotateCcw,
  Database,
  Clock,
  ChevronDown,
  ChevronRight,
  Check,
} from 'lucide-react';
import { PrioBadge, QuellenBadge } from './Badge';
import { formatEur } from '../../utils/formatters';

const COLUMNS = [
  { id: 'identifiziert', label: 'Identifiziert', color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe' },
  { id: 'angeschrieben', label: 'Angeschrieben', color: '#f59e0b', bg: '#fffbeb', border: '#fde68a' },
  { id: 'termin', label: 'Termin', color: '#22c55e', bg: '#f0fdf4', border: '#bbf7d0' },
  { id: 'abgeschlossen', label: 'Abgeschlossen', color: '#16a34a', bg: '#ecfdf5', border: '#a7f3d0' },
  { id: 'nicht_sinnvoll', label: 'Nicht sinnvoll', color: '#64748b', bg: '#f8fafc', border: '#cbd5e1' },
];

// Welche Bewegungen erlaubt sind. Abschlüsse sind final.
const ALLOWED_MOVES = {
  identifiziert: ['angeschrieben', 'termin', 'nicht_sinnvoll'],
  angeschrieben: ['identifiziert', 'termin', 'nicht_sinnvoll'],
  termin: ['angeschrieben', 'abgeschlossen', 'nicht_sinnvoll'],
  abgeschlossen: [],
  nicht_sinnvoll: ['identifiziert'],
};

const REASON_OPTIONS = [
  { id: 'bereits_abgesichert', label: 'Kunde hat bereits Absicherung (anderer Anbieter)' },
  { id: 'kein_interesse', label: 'Kunde hat kein Interesse signalisiert' },
  { id: 'falsche_erkennung', label: 'Falsche Erkennung – trifft nicht zu' },
  { id: 'timing', label: 'Timing passt nicht – vielleicht später' },
  { id: 'kunde_wechselt', label: 'Kunde wechselt / ist in Kündigung' },
  { id: 'anderer_grund', label: 'Anderer Grund' },
];

const REASON_LABELS = REASON_OPTIONS.reduce((acc, r) => ({ ...acc, [r.id]: r.label }), {});

export default function KanbanBoard({ potentiale, kunden, onMoveCard, onReactivate, onCardClick }) {
  const [filters, setFilters] = useState({
    kunde: 'alle',
    kategorie: 'alle',
    prio: 'alle',
    quelle: 'alle',
    suche: '',
  });
  const [draggedCard, setDraggedCard] = useState(null);
  const [hoverColumn, setHoverColumn] = useState(null);
  const [feedbackModal, setFeedbackModal] = useState(null); // { potential, targetStatus }
  const [closeModal, setCloseModal] = useState(null); // { potential }
  const [sortMode, setSortMode] = useState('prioritaet');
  // Jede Spalte zeigt höchstens 5 Karten. Per „Mehr anzeigen" kann eine
  // einzelne Spalte aufgeklappt werden — ein zweiter Klick blendet wieder ein.
  const CARDS_PER_COLUMN = 5;
  const [expandedColumns, setExpandedColumns] = useState({});

  // Filter Pipeline
  const filtered = useMemo(() => {
    return potentiale.filter(p => {
      if (filters.kunde !== 'alle' && p.kundeId !== filters.kunde) return false;
      if (filters.prio !== 'alle' && p.prioritaet !== filters.prio) return false;
      if (filters.quelle !== 'alle' && !(p.quellen || []).includes(filters.quelle)) return false;
      if (filters.suche) {
        const q = filters.suche.toLowerCase();
        const hay = `${p.titel} ${p.kundeName} ${p.beschreibung || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [potentiale, filters]);

  // Group by column
  const columnsMap = useMemo(() => {
    const map = {};
    COLUMNS.forEach(c => { map[c.id] = []; });
    const prioRank = { sehr_hoch: 4, hoch: 3, mittel: 2, niedrig: 1 };
    filtered.forEach(p => {
      const col = p.status || 'identifiziert';
      if (map[col]) map[col].push(p);
    });
    Object.keys(map).forEach(key => {
      map[key].sort((a, b) => {
        // Showcase-Kunde (z. B. Peter Schmidt in Versicherung) immer zuerst
        if (a._showcase !== b._showcase) return a._showcase ? -1 : 1;
        if (sortMode === 'volumen') return (b.volumen || 0) - (a.volumen || 0);
        if (sortMode === 'kunde') return (a.kundeName || '').localeCompare(b.kundeName || '');
        // prioritaet (default)
        const pa = prioRank[a.prioritaet] || 0;
        const pb = prioRank[b.prioritaet] || 0;
        if (pb !== pa) return pb - pa;
        return (b.volumen || 0) - (a.volumen || 0);
      });
    });
    return map;
  }, [filtered, sortMode]);

  // Drag & Drop handlers
  const handleDragStart = (e, p) => {
    setDraggedCard(p);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedCard(null);
    setHoverColumn(null);
  };

  const handleDragOver = (e, columnId) => {
    if (!draggedCard) return;
    const allowed = ALLOWED_MOVES[draggedCard.status] || [];
    if (allowed.includes(columnId)) {
      e.preventDefault();
      setHoverColumn(columnId);
    }
  };

  const handleDragLeave = () => {
    setHoverColumn(null);
  };

  const handleDrop = (e, columnId) => {
    e.preventDefault();
    if (!draggedCard) return;
    const allowed = ALLOWED_MOVES[draggedCard.status] || [];
    if (!allowed.includes(columnId)) {
      setDraggedCard(null);
      setHoverColumn(null);
      return;
    }
    if (columnId === 'nicht_sinnvoll') {
      setFeedbackModal({ potential: draggedCard });
    } else if (columnId === 'abgeschlossen') {
      setCloseModal({ potential: draggedCard });
    } else {
      onMoveCard(draggedCard._id, columnId);
    }
    setDraggedCard(null);
    setHoverColumn(null);
  };

  const handleConfirmFeedback = (reason, comment) => {
    if (!feedbackModal) return;
    onMoveCard(feedbackModal.potential._id, 'nicht_sinnvoll', { reason, comment });
    setFeedbackModal(null);
  };

  const handleConfirmAbschluss = (data) => {
    if (!closeModal) return;
    onMoveCard(closeModal.potential._id, 'abgeschlossen', data);
    setCloseModal(null);
  };

  // KPI für „Nicht sinnvoll" Header
  const nichtSinnvollStats = useMemo(() => {
    const arr = potentiale.filter(p => p.status === 'nicht_sinnvoll');
    const falscheErkennung = arr.filter(p => p._override?.reason === 'falsche_erkennung').length;
    return { total: arr.length, falscheErkennung };
  }, [potentiale]);

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={filters.suche}
            onChange={e => setFilters(f => ({ ...f, suche: e.target.value }))}
            placeholder="Potenzial, Kunde, Beschreibung…"
            className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300"
          />
        </div>
        <FilterSelect
          value={filters.kunde}
          onChange={v => setFilters(f => ({ ...f, kunde: v }))}
          options={[{ value: 'alle', label: 'Alle Kunden' }, ...kunden.map(k => ({ value: k.id, label: k.name }))]}
        />
        <FilterSelect
          value={filters.prio}
          onChange={v => setFilters(f => ({ ...f, prio: v }))}
          options={[
            { value: 'alle', label: 'Alle Prios' },
            { value: 'sehr_hoch', label: 'Sehr hoch' },
            { value: 'hoch', label: 'Hoch' },
            { value: 'mittel', label: 'Mittel' },
            { value: 'niedrig', label: 'Niedrig' },
          ]}
        />
        <FilterSelect
          value={filters.quelle}
          onChange={v => setFilters(f => ({ ...f, quelle: v }))}
          options={[
            { value: 'alle', label: 'Alle Quellen' },
            { value: 'finanztransaktion', label: 'FinTx' },
            { value: 'bestand', label: 'Bestand' },
            { value: 'wettbewerb', label: 'Wettbewerb' },
            { value: 'lebensereignis', label: 'Lebensereignis' },
            { value: 'direktvertrieb', label: 'Direktvertrieb' },
          ]}
        />
        <FilterSelect
          value={sortMode}
          onChange={setSortMode}
          options={[
            { value: 'prioritaet', label: 'Sort: Priorität' },
            { value: 'volumen', label: 'Sort: Volumen' },
            { value: 'kunde', label: 'Sort: Kunde' },
          ]}
        />
      </div>

      {/* Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {COLUMNS.map(col => {
          const cards = columnsMap[col.id] || [];
          const totalVol = cards.reduce((s, c) => s + (c.volumen || 0), 0);
          const isHover = hoverColumn === col.id;
          const isDropTarget = draggedCard && (ALLOWED_MOVES[draggedCard.status] || []).includes(col.id);
          const isInvalidTarget = draggedCard && !isDropTarget && draggedCard.status !== col.id;

          return (
            <div
              key={col.id}
              className="rounded-xl border-2 transition-all overflow-visible"
              style={{
                backgroundColor: isHover ? col.border : col.bg,
                borderColor: isHover ? col.color : col.border,
                opacity: isInvalidTarget ? 0.5 : 1,
              }}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              {/* Column header */}
              <div className="px-3 py-3 border-b sticky top-0" style={{ borderColor: col.border, backgroundColor: col.bg }}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: col.color }}
                    />
                    <span className="font-bold text-sm text-slate-800 truncate">{col.label}</span>
                  </div>
                  <span
                    className="text-xs font-bold rounded-full px-2 py-0.5 shrink-0"
                    style={{ backgroundColor: 'white', color: col.color, border: `1px solid ${col.border}` }}
                  >
                    {cards.length}
                  </span>
                </div>
                {totalVol > 0 && (
                  <div className="text-[11px] font-mono text-slate-500 mt-1">
                    Σ {formatEur(totalVol)}
                  </div>
                )}
                {col.id === 'nicht_sinnvoll' && nichtSinnvollStats.total > 0 && (
                  <div className="mt-2 pt-2 border-t border-slate-200">
                    <div className="text-[11px] text-slate-600 leading-snug">
                      Dein Feedback hat die KI-Trefferquote von <strong>78%</strong> auf <strong>86%</strong> verbessert.
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {nichtSinnvollStats.total} verworfen · {nichtSinnvollStats.falscheErkennung} Fehlerkennungen korrigiert
                    </div>
                  </div>
                )}
              </div>

              {/* Cards */}
              <div className="p-2 space-y-2 min-h-[150px]">
                {(() => {
                  // Gruppieren nach Kunde: dieselbe Person soll nicht mehrfach
                  // mit je einem Potenzial erscheinen. Die interne Reihenfolge
                  // innerhalb eines Clusters bleibt die Sortierung aus
                  // columnsMap (Prio/Volumen), also ist das erste Item auch das
                  // "Top-Potenzial" des Kunden.
                  const groups = [];
                  const seen = {};
                  cards.forEach(p => {
                    const key = p.kundeId || p._id;
                    if (seen[key] == null) {
                      seen[key] = groups.length;
                      groups.push([p]);
                    } else {
                      groups[seen[key]].push(p);
                    }
                  });

                  const isExpanded = !!expandedColumns[col.id];
                  const visibleGroups = isExpanded
                    ? groups
                    : groups.slice(0, CARDS_PER_COLUMN);
                  const hiddenGroupCount = groups.length - visibleGroups.length;
                  return (
                    <>
                      {visibleGroups.map((items, idx) => {
                        if (items.length === 1) {
                          return (
                            <PotenzialCard
                              key={items[0]._id}
                              p={items[0]}
                              columnColor={col.color}
                              onDragStart={handleDragStart}
                              onDragEnd={handleDragEnd}
                              onReactivate={onReactivate}
                              onCardClick={onCardClick}
                            />
                          );
                        }
                        return (
                          <PotenzialClusterCard
                            key={`cluster_${items[0].kundeId}_${idx}`}
                            items={items}
                            columnColor={col.color}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                            onReactivate={onReactivate}
                            onCardClick={onCardClick}
                          />
                        );
                      })}
                      {cards.length === 0 && (
                        <div className="text-center text-[11px] text-slate-400 italic py-4">
                          {isDropTarget ? 'Hier ablegen' : '—'}
                        </div>
                      )}
                      {groups.length > CARDS_PER_COLUMN && (
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedColumns(prev => ({
                              ...prev,
                              [col.id]: !prev[col.id],
                            }))
                          }
                          className="w-full mt-1 py-2 rounded-lg text-[11px] font-semibold border border-dashed transition-colors hover:bg-white"
                          style={{ color: col.color, borderColor: col.border }}
                        >
                          {isExpanded
                            ? 'Weniger anzeigen'
                            : `Mehr anzeigen (+${hiddenGroupCount} Kunden)`}
                        </button>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Feedback Modal */}
      {feedbackModal && (
        <FeedbackModal
          potential={feedbackModal.potential}
          onClose={() => setFeedbackModal(null)}
          onConfirm={handleConfirmFeedback}
        />
      )}

      {/* Abschluss Modal */}
      {closeModal && (
        <AbschlussModal
          potential={closeModal.potential}
          onClose={() => setCloseModal(null)}
          onConfirm={handleConfirmAbschluss}
        />
      )}
    </div>
  );
}

function FilterSelect({ value, onChange, options }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="appearance-none bg-white border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 cursor-pointer"
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
    </div>
  );
}

function PotenzialCard({ p, columnColor, onDragStart, onDragEnd, onReactivate, onCardClick }) {
  const dragStartedRef = useRef(false);
  const isClosed = p.status === 'abgeschlossen';
  const isDismissed = p.status === 'nicht_sinnvoll';
  const ageInDays = computeAge(p);
  const ageWarn = ageInDays != null && ageInDays > 30;

  const initials = (p.kundeName || '').split(' ').map(n => n[0]).join('').slice(0, 2);

  const fida = (p.quellen || []).includes('finanztransaktion');

  // Einheitlich dünne Karten-Umrandung — keine dicke Alters-Warnkontur,
  // visueller Druck kommt nur über das kleine Warn-Icon im Header.
  const cardOpacity = isClosed ? 0.55 : isDismissed ? 0.7 : 1;
  const cardBg = isClosed ? '#f8fafc' : '#ffffff';

  return (
    <div
      draggable={p.status !== 'abgeschlossen'}
      onDragStart={(e) => { dragStartedRef.current = true; onDragStart(e, p); }}
      onDragEnd={(e) => { onDragEnd(e); setTimeout(() => { dragStartedRef.current = false; }, 0); }}
      onClick={() => {
        if (dragStartedRef.current) return; // ignore click that came from a drag
        onCardClick?.(p);
      }}
      className="rounded-lg p-2.5 shadow-sm hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5 transition-all cursor-pointer active:cursor-grabbing relative border border-slate-200"
      style={{
        backgroundColor: cardBg,
        opacity: cardOpacity,
      }}
    >
      {/* Header: Avatar + Name */}
      <div className="flex items-center gap-2 mb-1.5">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
          style={{ backgroundColor: columnColor }}
        >
          {initials || '?'}
        </div>
        <span className={`text-xs font-semibold truncate flex-1 ${isClosed ? 'text-slate-500 line-through' : 'text-slate-700'}`}>{p.kundeName}</span>
        {isClosed && (
          <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500 shrink-0" title="Abgeschlossen">
            <Check size={11} className="text-white" strokeWidth={3} />
          </span>
        )}
        {!isClosed && fida && (
          <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" title="FIDA-Daten" />
        )}
        {ageWarn && !isDismissed && !isClosed && (
          <AlertTriangle size={11} className="text-red-500 shrink-0" />
        )}
      </div>

      {/* Title */}
      <div className="text-[12px] font-bold text-slate-800 leading-snug mb-1.5 line-clamp-2">
        {p.titel}
      </div>

      {/* Dismissal info */}
      {isDismissed && p._override && (
        <div className="mb-1.5 px-1.5 py-1 bg-slate-50 rounded border border-slate-200">
          <div className="text-[10px] font-bold text-slate-600 flex items-center gap-1">
            <X size={10} /> {REASON_LABELS[p._override.reason] || 'Verworfen'}
          </div>
          {p._override.comment && (
            <div className="text-[10px] text-slate-500 italic mt-0.5 line-clamp-2">
              „{p._override.comment}"
            </div>
          )}
        </div>
      )}

      {/* Badges */}
      {!isDismissed && (
        <div className="flex items-center gap-1 flex-wrap mb-1.5">
          <PrioBadge prioritaet={p.prioritaet} />
          {(p.quellen || []).slice(0, 1).map((q, qi) => (
            <QuellenBadge key={qi} quelle={q} />
          ))}
        </div>
      )}

      {/* Volumen + Alter */}
      <div className="flex items-center justify-between text-[11px] mt-1">
        <span className="font-mono font-semibold text-slate-700">
          {p.volumen ? `${formatEur(p.volumen)}${p.volumenTyp === 'jaehrlich' ? ' /J.' : ''}` : '—'}
        </span>
        {ageInDays != null && !isDismissed && (
          <span
            className="flex items-center gap-0.5 text-[10px]"
            style={{ color: ageWarn ? '#dc2626' : '#94a3b8' }}
          >
            <Clock size={10} /> {ageInDays}T
          </span>
        )}
      </div>

      {/* Reactivate button for dismissed */}
      {isDismissed && (
        <button
          onClick={(e) => { e.stopPropagation(); onReactivate(p._id); }}
          className="mt-1.5 w-full text-[10px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded px-2 py-1 flex items-center justify-center gap-1 transition-colors"
        >
          <RotateCcw size={10} /> Reaktivieren
        </button>
      )}
    </div>
  );
}

const QUELLEN_THEME_LABELS = {
  finanztransaktion: 'FIDA-Signal',
  bestand: 'Bestandssignal',
  wettbewerb: 'Wettbewerb',
  lebensereignis: 'Lebensereignis',
  direktvertrieb: 'Direktvertrieb',
  kontoumsaetze: 'Kontoumsätze',
  risikosignal: 'Risikosignal',
  kommunikation: 'Kommunikation',
  markt: 'Marktdaten',
};

function PotenzialClusterCard({ items, columnColor, onDragStart, onDragEnd, onReactivate, onCardClick }) {
  const [expanded, setExpanded] = useState(false);
  const top = items[0];
  const kundeName = top.kundeName || '';
  const initials = kundeName.split(' ').map(n => n[0]).join('').slice(0, 2);

  const totalEinmalig = items
    .filter(p => p.volumenTyp !== 'jaehrlich')
    .reduce((s, p) => s + (p.volumen || 0), 0);
  const totalJaehrlich = items
    .filter(p => p.volumenTyp === 'jaehrlich')
    .reduce((s, p) => s + (p.volumen || 0), 0);

  const fida = items.some(p => (p.quellen || []).includes('finanztransaktion'));

  const quelleCounts = {};
  items.forEach(p => (p.quellen || []).forEach(q => {
    quelleCounts[q] = (quelleCounts[q] || 0) + 1;
  }));
  const sortedQuellen = Object.entries(quelleCounts).sort((a, b) => b[1] - a[1]);

  let themaText = '';
  if (sortedQuellen.length > 0) {
    const [topQ, topCount] = sortedQuellen[0];
    const topLabel = QUELLEN_THEME_LABELS[topQ] || topQ;
    if (topCount >= 2) {
      themaText = `${topCount}× ${topLabel}`;
      if (sortedQuellen.length > 1) {
        const secondLabel = QUELLEN_THEME_LABELS[sortedQuellen[1][0]] || sortedQuellen[1][0];
        themaText += ` + ${secondLabel}`;
      }
      themaText += ' — Bestandskonsolidierung';
    } else if (sortedQuellen.length > 1) {
      const secondLabel = QUELLEN_THEME_LABELS[sortedQuellen[1][0]] || sortedQuellen[1][0];
      themaText = `${topLabel} + ${secondLabel}`;
    } else {
      themaText = topLabel;
    }
  }

  const topVolText = top.volumen
    ? `${formatEur(top.volumen)}${top.volumenTyp === 'jaehrlich' ? ' /J.' : ''}`
    : '';

  if (expanded) {
    return (
      <div className="rounded-lg border p-2 bg-white/60 space-y-2" style={{ borderColor: columnColor + '55' }}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
              style={{ backgroundColor: columnColor }}
            >
              {initials || '?'}
            </div>
            <span className="text-[11px] font-bold text-slate-700 truncate">{kundeName}</span>
            <span className="text-[10px] text-slate-400 shrink-0">· {items.length} Potenziale</span>
          </div>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setExpanded(false); }}
            className="text-[10px] font-semibold text-slate-500 hover:text-slate-900 px-1.5 py-0.5 rounded hover:bg-slate-100 shrink-0"
          >
            Einklappen
          </button>
        </div>
        <div className="space-y-2">
          {items.map(p => (
            <PotenzialCard
              key={p._id}
              p={p}
              columnColor={columnColor}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onReactivate={onReactivate}
              onCardClick={onCardClick}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => onCardClick?.(top)}
      className="rounded-lg p-2.5 shadow-sm hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5 transition-all cursor-pointer relative border border-slate-200 bg-white"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
          style={{ backgroundColor: columnColor }}
        >
          {initials || '?'}
        </div>
        <span className="text-xs font-semibold truncate flex-1 text-slate-700">{kundeName}</span>
        {fida && (
          <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" title="FIDA-Daten" />
        )}
      </div>

      {/* Summary line */}
      <div className="text-[11px] font-mono text-slate-500 mb-1.5">
        {items.length} Potenziale
        {(totalEinmalig + totalJaehrlich) > 0 && (
          <>
            {' · Σ '}
            {totalEinmalig > 0 && formatEur(totalEinmalig)}
            {totalEinmalig > 0 && totalJaehrlich > 0 && ' + '}
            {totalJaehrlich > 0 && `${formatEur(totalJaehrlich)} /J.`}
          </>
        )}
      </div>

      {/* Bullet points */}
      <ul className="space-y-1 mb-2">
        <li className="text-[11px] text-slate-700 leading-snug flex gap-1.5">
          <span className="text-slate-400 shrink-0">•</span>
          <span className="min-w-0">
            <span className="font-semibold">Top:</span>{' '}
            <span className="text-slate-800">{top.titel}</span>
            {topVolText && <span className="text-slate-500"> ({topVolText})</span>}
          </span>
        </li>
        {themaText && (
          <li className="text-[11px] text-slate-700 leading-snug flex gap-1.5">
            <span className="text-slate-400 shrink-0">•</span>
            <span className="min-w-0">
              <span className="font-semibold">Thema:</span>{' '}
              <span className="text-slate-600">{themaText}</span>
            </span>
          </li>
        )}
      </ul>

      {/* Badges + expand */}
      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-1 flex-wrap">
          <PrioBadge prioritaet={top.prioritaet} />
          {items.length > 1 && (
            <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 rounded-full px-1.5 py-0.5">
              +{items.length - 1}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setExpanded(true); }}
          className="flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded hover:bg-slate-100 shrink-0"
          style={{ color: columnColor }}
        >
          Aufklappen <ChevronRight size={10} />
        </button>
      </div>
    </div>
  );
}

function computeAge(p) {
  const ov = p._override;
  if (ov?.movedAt) {
    const t = new Date(ov.movedAt).getTime();
    return Math.max(0, Math.floor((Date.now() - t) / (1000 * 60 * 60 * 24)));
  }
  // Demo-Alter aus Hash über kundeId + titel, damit es stabil ist
  const seed = `${p.kundeId}_${p.titel}`.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
  return seed % 35;
}

function FeedbackModal({ potential, onClose, onConfirm }) {
  const [reason, setReason] = useState('falsche_erkennung');
  const [comment, setComment] = useState('');

  return (
    <ModalShell onClose={onClose}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Potenzial verwerfen</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {potential.kundeName} · {potential.titel}
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700"
        >
          <X size={18} />
        </button>
      </div>

      <div className="text-sm font-semibold text-slate-800 mb-2">
        Warum passt dieses Potenzial nicht?
      </div>
      <div className="space-y-1.5 mb-4">
        {REASON_OPTIONS.map(r => (
          <label
            key={r.id}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
              reason === r.id
                ? 'border-indigo-300 bg-indigo-50'
                : 'border-slate-200 hover:bg-slate-50'
            }`}
          >
            <input
              type="radio"
              name="reason"
              checked={reason === r.id}
              onChange={() => setReason(r.id)}
              className="accent-indigo-600"
            />
            <span className="text-sm text-slate-700">{r.label}</span>
          </label>
        ))}
      </div>

      <div className="mb-4">
        <label className="text-xs font-semibold text-slate-600 mb-1 block">
          Optionaler Kommentar
        </label>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          rows={3}
          placeholder='z.B. "Hund gehört der Ex-Partnerin"'
          className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300"
        />
      </div>

      <div className="rounded-lg bg-indigo-50 border border-indigo-200 p-3 mb-4">
        <div className="flex items-start gap-2">
          <Sparkles size={14} className="text-indigo-600 mt-0.5 shrink-0" />
          <div className="text-xs text-indigo-800 leading-relaxed">
            Dieses Feedback hilft der KI, zukünftige Potenziale besser zu bewerten.
            Je präziser deine Begründung, desto weniger Fehlerkennungen.
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100"
        >
          Abbrechen
        </button>
        <button
          onClick={() => onConfirm(reason, comment)}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-800 text-white hover:bg-slate-900"
        >
          Potenzial verwerfen
        </button>
      </div>
    </ModalShell>
  );
}

function AbschlussModal({ potential, onClose, onConfirm }) {
  const [produkt, setProdukt] = useState(potential.produktEmpfehlung || '');
  const [volumen, setVolumen] = useState(potential.volumen || '');
  const [datum, setDatum] = useState(new Date().toISOString().split('T')[0]);

  return (
    <ModalShell onClose={onClose}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Abschluss erfassen</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {potential.kundeName} · {potential.titel}
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700"
        >
          <X size={18} />
        </button>
      </div>

      <div className="space-y-3 mb-4">
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1 block">Produkt</label>
          <input
            type="text"
            value={produkt}
            onChange={e => setProdukt(e.target.value)}
            className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1 block">Volumen (€)</label>
          <input
            type="number"
            value={volumen}
            onChange={e => setVolumen(e.target.value)}
            className="w-full border border-slate-200 rounded-lg p-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-1 block">Abschlussdatum</label>
          <input
            type="date"
            value={datum}
            onChange={e => setDatum(e.target.value)}
            className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100"
        >
          Abbrechen
        </button>
        <button
          onClick={() => onConfirm({ produkt, volumen: Number(volumen) || 0, datum })}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700"
        >
          Abschluss erfassen
        </button>
      </div>
    </ModalShell>
  );
}

function ModalShell({ children, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
