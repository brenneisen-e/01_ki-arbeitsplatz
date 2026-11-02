import { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  Brain,
  Cpu,
  Sigma,
} from 'lucide-react';
import { PrioBadge, QuellenBadge } from './Badge';
import { formatEur } from '../../utils/formatters';
import { getKundeFoto } from '../../utils/kundenFotos';
import { tx } from '../../utils/langHelper';

// Cockpit 2026: zarte Tönung einer Token-Farbe auf Weiß (Zähler, Avatare,
// Drop-Ziel). Die Statusfarbe selbst bleibt Punkt, Text und Hairline.
const tint = (farbe, anteil = 14) => `color-mix(in oklab, ${farbe} ${anteil}%, white)`;

// Avatar fuer eine Kanban-Karte: versucht zuerst das Kundenfoto; faellt auf
// die farbige Initialen-Bubble zurueck, wenn kein Foto vorhanden ist oder
// das Laden scheitert.
function KundenAvatar({ kundeId, kundeName, columnColor, size = 24 }) {
  const [failed, setFailed] = useState(false);
  const foto = getKundeFoto(kundeId);
  const initials = (kundeName || '').split(' ').map(n => n[0]).join('').slice(0, 2);
  if (foto && !failed) {
    return (
      <img
        src={foto}
        alt={kundeName || ''}
        onError={() => setFailed(true)}
        className="rounded-full object-cover shrink-0 border border-(--border-light)"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="rounded-full flex items-center justify-center font-bold shrink-0"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.42), backgroundColor: tint(columnColor, 16), color: columnColor }}
    >
      {initials || '?'}
    </div>
  );
}

const COLUMN_LABELS = {
  identifiziert: () => tx('Identifiziert', 'Identified'),
  angeschrieben: () => tx('Angeschrieben', 'Contacted'),
  termin: () => tx('Termin', 'Appointment'),
  abgeschlossen: () => tx('Abgeschlossen', 'Closed'),
  nicht_sinnvoll: () => tx('Nicht sinnvoll', 'Not relevant'),
};
const colLabel = (id) => (COLUMN_LABELS[id] ? COLUMN_LABELS[id]() : id);
// Spalten sind vertiefte Flächen (--bg-inset) mit Hairline. Die Statusfarbe
// steht nur im Punkt, im Zähler und in der getönten Fläche, sobald eine Karte
// über die Spalte gezogen wird.
const COLUMNS = [
  { id: 'identifiziert', color: 'var(--color-info)' },
  { id: 'angeschrieben', color: 'var(--color-warning)' },
  { id: 'termin', color: 'var(--mode-chart)' },
  { id: 'abgeschlossen', color: 'var(--color-success)' },
  { id: 'nicht_sinnvoll', color: 'var(--text-tertiary)' },
];
const SPALTE_BG = 'var(--bg-inset)';
const SPALTE_RAND = 'var(--border-light)';

function SpaltenZaehler({ farbe, anzahl }) {
  return (
    <span
      className="font-mono text-[11px] font-semibold rounded-md px-1.5 py-0.5 leading-none"
      style={{ backgroundColor: tint(farbe, 14), color: farbe }}
    >
      {anzahl}
    </span>
  );
}

function SpaltenSumme({ betrag }) {
  return (
    <div className="flex items-center gap-1 text-[11px] font-mono text-(--text-tertiary) mt-1">
      <Sigma size={11} strokeWidth={2} /> {formatEur(betrag)}
    </div>
  );
}

// Welche Bewegungen erlaubt sind. Abschlüsse sind final.
const ALLOWED_MOVES = {
  identifiziert: ['angeschrieben', 'termin', 'nicht_sinnvoll'],
  angeschrieben: ['identifiziert', 'termin', 'nicht_sinnvoll'],
  termin: ['angeschrieben', 'abgeschlossen', 'nicht_sinnvoll'],
  abgeschlossen: [],
  nicht_sinnvoll: ['identifiziert'],
};

const REASON_OPTIONS = [
  { id: 'bereits_abgesichert', label: () => tx('Kunde hat bereits Absicherung (anderer Anbieter)', 'Customer already covered (other provider)') },
  { id: 'kein_interesse', label: () => tx('Kunde hat kein Interesse signalisiert', 'Customer signalled no interest') },
  { id: 'falsche_erkennung', label: () => tx('Falsche Erkennung – trifft nicht zu', 'False detection – does not apply') },
  { id: 'timing', label: () => tx('Timing passt nicht – vielleicht später', 'Timing not right – maybe later') },
  { id: 'kunde_wechselt', label: () => tx('Kunde wechselt / ist in Kündigung', 'Customer switching / cancelling') },
  { id: 'anderer_grund', label: () => tx('Anderer Grund', 'Other reason') },
];

const reasonLabel = (id) => {
  const r = REASON_OPTIONS.find((o) => o.id === id);
  return r ? r.label() : id;
};

// Eingabefeld der Modals: vertiefte Fläche, Fokus über die Gold-Hairline und
// den globalen Fokusring.
const FELD = 'surface-inset w-full rounded-[10px] p-2 text-sm text-(--text-primary) placeholder:text-(--text-tertiary) focus:border-(--mode-accent) transition-colors';

// Modale und Toast hängen als Portal am Modus-Wrapper der App: der Tab-
// Container behält nach seiner Einblend-Animation ein transform (forwards-
// Fill) und würde `position: fixed` sonst an sich statt an den Viewport
// binden. Der Wrapper trägt die Modus-Tokens, daher nicht document.body.
function portalZiel() {
  return document.querySelector('[data-mode]') || document.body;
}

export default function KanbanBoard({ potentiale, kunden, onMoveCard, onReactivate, onCardClick }) {
  const [filters, setFilters] = useState({
    kunde: 'alle',
    kategorie: 'alle',
    prio: 'alle',
    quelle: 'alle',
    suche: '',
  });
  // draggedCard repraesentiert entweder ein einzelnes Potenzial oder ein
  // Cluster (mehrere Potenziale desselben Kunden). Beim Drop werden alle
  // Items im Cluster ueberfuehrt. Shape: { status, items: Potential[] }.
  const [draggedCard, setDraggedCard] = useState(null);
  const [hoverColumn, setHoverColumn] = useState(null);
  const [feedbackModal, setFeedbackModal] = useState(null); // { potential, targetStatus }
  const [closeModal, setCloseModal] = useState(null); // { potential }
  const [sortMode, setSortMode] = useState('prioritaet');
  // Jede Spalte zeigt höchstens 5 Karten. Per „Mehr anzeigen" kann eine
  // einzelne Spalte aufgeklappt werden — ein zweiter Klick blendet wieder ein.
  const CARDS_PER_COLUMN = 5;
  const [expandedColumns, setExpandedColumns] = useState({});
  // Eine einzelne Karte (Einzel- oder Cluster-Karte) kann „groß" aufgeklappt
  // werden. Dann wird die zugehörige Spalte breiter, damit die Details
  // ordentlich Platz haben. Nur eine Karte gleichzeitig.
  const [expandedCard, setExpandedCard] = useState(null); // { id, columnId } | null

  // Ganze Spalten koennen eingeklappt werden. Default: nur „Identifiziert"
  // ist offen, die restlichen Spalten erscheinen als schmaler vertikaler
  // Strip und lassen sich per Klick auf den Strip wieder aufklappen. Drop-
  // Targets bleiben auch im kollabierten Zustand aktiv.
  const [collapsedColumns, setCollapsedColumns] = useState(() => {
    // Default: alle Spalten offen. User kann einzelne Spalten via Chevron
    // im Header einklappen, dann erscheint dort das Bookmark-Placeholder.
    return {};
  });
  const toggleColumnCollapsed = (columnId) => {
    setCollapsedColumns(prev => ({ ...prev, [columnId]: !prev[columnId] }));
    // Wenn wir eine Spalte einklappen, in der gerade eine Karte "gross"
    // aufgeklappt ist, auch die Karten-Ansicht schliessen.
    setExpandedCard(prev => (prev && prev.columnId === columnId ? null : prev));
  };

  // Nach einer „Nicht sinnvoll"-Rueckmeldung zeigen wir kurz eine Animation,
  // die visualisiert, dass die KI aus dem Feedback lernt.
  const [trainingToast, setTrainingToast] = useState(null); // { kundeName, reason }

  const toggleExpandCard = (id, columnId) => {
    setExpandedCard(prev => (prev && prev.id === id ? null : { id, columnId }));
  };
  const collapseExpandedCard = () => setExpandedCard(null);

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

  // Führt das Move für EINEN Drag-Payload aus — egal ob ein Einzel-Potenzial
  // oder ein Cluster (alle Potenziale eines Kunden). Bei einem Cluster werden
  // alle Items in die Zielspalte verschoben.
  const moveDraggedTo = (dragged, columnId, extra) => {
    if (!dragged) return;
    if (Array.isArray(dragged.items) && dragged.items.length > 0) {
      dragged.items.forEach(it => onMoveCard(it._id, columnId, extra));
    } else if (dragged._id) {
      onMoveCard(dragged._id, columnId, extra);
    }
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
      moveDraggedTo(draggedCard, columnId);
      collapseExpandedCard();
    }
    setDraggedCard(null);
    setHoverColumn(null);
  };

  const handleConfirmFeedback = (reason, comment) => {
    if (!feedbackModal) return;
    const potential = feedbackModal.potential;
    moveDraggedTo(potential, 'nicht_sinnvoll', { reason, comment });
    setFeedbackModal(null);
    collapseExpandedCard();
    // Zeige die „KI-lernt"-Animation als Overlay fuer ein paar Sekunden.
    const isCluster = Array.isArray(potential.items) && potential.items.length > 1;
    setTrainingToast({
      kundeName: potential.kundeName,
      titel: isCluster ? tx(`${potential.items.length} Potenziale`, `${potential.items.length} potentials`) : potential.titel,
      reason,
    });
  };

  const handleConfirmAbschluss = (data) => {
    if (!closeModal) return;
    moveDraggedTo(closeModal.potential, 'abgeschlossen', data);
    setCloseModal(null);
    collapseExpandedCard();
  };

  const handleReactivateWithCollapse = (id) => {
    onReactivate(id);
    collapseExpandedCard();
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
      <div className="surface-card p-3 flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-(--text-tertiary)" />
          <input
            type="text"
            value={filters.suche}
            onChange={e => setFilters(f => ({ ...f, suche: e.target.value }))}
            placeholder={tx('Potenzial, Kunde, Beschreibung…', 'Potential, customer, description…')}
            className="surface-inset w-full h-9 pl-8 pr-3 rounded-[10px] text-sm text-(--text-primary) placeholder:text-(--text-tertiary) focus:border-(--mode-accent) transition-colors"
          />
        </div>
        <FilterSelect
          value={filters.kunde}
          onChange={v => setFilters(f => ({ ...f, kunde: v }))}
          options={[{ value: 'alle', label: tx('Alle Kunden', 'All customers') }, ...kunden.map(k => ({ value: k.id, label: k.name }))]}
        />
        <FilterSelect
          value={filters.prio}
          onChange={v => setFilters(f => ({ ...f, prio: v }))}
          options={[
            { value: 'alle', label: tx('Alle Prios', 'All priorities') },
            { value: 'sehr_hoch', label: tx('Sehr hoch', 'Very high') },
            { value: 'hoch', label: tx('Hoch', 'High') },
            { value: 'mittel', label: tx('Mittel', 'Medium') },
            { value: 'niedrig', label: tx('Niedrig', 'Low') },
          ]}
        />
        <FilterSelect
          value={filters.quelle}
          onChange={v => setFilters(f => ({ ...f, quelle: v }))}
          options={[
            { value: 'alle', label: tx('Alle Quellen', 'All sources') },
            { value: 'finanztransaktion', label: 'FinTx' },
            { value: 'bestand', label: tx('Bestand', 'Portfolio') },
            { value: 'wettbewerb', label: tx('Wettbewerb', 'Competition') },
            { value: 'lebensereignis', label: tx('Lebensereignis', 'Life event') },
            { value: 'direktvertrieb', label: tx('Direktvertrieb', 'Direct sales') },
          ]}
        />
        <FilterSelect
          value={sortMode}
          onChange={setSortMode}
          options={[
            { value: 'prioritaet', label: tx('Sort: Priorität', 'Sort: Priority') },
            { value: 'volumen', label: tx('Sort: Volumen', 'Sort: Volume') },
            { value: 'kunde', label: tx('Sort: Kunde', 'Sort: Customer') },
          ]}
        />
      </div>

      {/* Board
          Alle Spalten behalten im Grunde ihre Breite (~1fr). Kollabierte
          Spalten wirken nur wie ein eingeklapptes Bookmark: Tab-Header
          bleibt sichtbar, der Karten-Stream wird ausgeblendet. Nur wenn
          eine einzelne Karte "gross" ausgeklappt wird, bekommt ihre
          Spalte etwas mehr Platz (1.6fr). */}
      <div
        className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:[grid-template-columns:var(--kanban-cols)] transition-[grid-template-columns] duration-300"
        style={{
          '--kanban-cols': COLUMNS.map(c => {
            if (expandedCard && expandedCard.columnId === c.id) return '1.6fr';
            return 'minmax(0,1fr)';
          }).join(' '),
        }}
      >
        {COLUMNS.map(col => {
          const cards = columnsMap[col.id] || [];
          const totalVol = cards.reduce((s, c) => s + (c.volumen || 0), 0);
          const isHover = hoverColumn === col.id;
          const isDropTarget = draggedCard && (ALLOWED_MOVES[draggedCard.status] || []).includes(col.id);
          const isInvalidTarget = draggedCard && !isDropTarget && draggedCard.status !== col.id;
          const isCollapsed = !!collapsedColumns[col.id];

          if (isCollapsed) {
            // Bookmark-Look: horizontaler Tab-Header bleibt, Karten-
            // Stream wird durch einen dezenten "eingeklappt"-Slot ersetzt.
            // Die Spalte behaelt ihre normale Breite, sodass das Board
            // visuell nicht kippt.
            return (
              <div
                key={col.id}
                className="rounded-xl border transition-all overflow-hidden cursor-pointer flex flex-col"
                style={{
                  backgroundColor: isHover ? tint(col.color, 10) : SPALTE_BG,
                  borderColor: isHover ? col.color : isDropTarget ? 'var(--border-strong)' : SPALTE_RAND,
                  opacity: isInvalidTarget ? 0.5 : 1,
                }}
                onDragOver={(e) => handleDragOver(e, col.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, col.id)}
                onClick={() => toggleColumnCollapsed(col.id)}
                title={`${colLabel(col.id)} ${tx('aufklappen', 'expand')}`}
              >
                {/* Column header (wie ausgeklappt, nur mit Aufklapp-Chevron) */}
                <div className="px-3 py-3 border-b" style={{ borderColor: SPALTE_RAND }}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: col.color }}
                      />
                      <span className="font-semibold text-sm text-(--text-primary) truncate">{colLabel(col.id)}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <SpaltenZaehler farbe={col.color} anzahl={cards.length} />
                      <ChevronRight size={14} className="text-(--text-tertiary)" />
                    </div>
                  </div>
                  {totalVol > 0 && <SpaltenSumme betrag={totalVol} />}
                </div>
                {/* Leerer "eingeklappt"-Slot — gestrichelter, fadebarer
                    Bookmark-Bereich; Drop-Target bleibt durch den Outer-Div
                    funktional. */}
                <div
                  className="flex-1 flex items-center justify-center text-[11px] text-(--text-tertiary) px-2"
                  style={{ minHeight: 140 }}
                >
                  <div className="text-center">
                    <div className="font-semibold text-(--text-secondary) mb-0.5">{tx('Eingeklappt', 'Collapsed')}</div>
                    <div>{tx('Klick zum Aufklappen', 'Click to expand')}</div>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div
              key={col.id}
              className="rounded-xl border transition-all overflow-visible"
              style={{
                backgroundColor: isHover ? tint(col.color, 10) : SPALTE_BG,
                borderColor: isHover ? col.color : isDropTarget ? 'var(--border-strong)' : SPALTE_RAND,
                opacity: isInvalidTarget ? 0.5 : 1,
              }}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              {/* Column header */}
              <div className="px-3 py-3 border-b sticky top-0 rounded-t-xl" style={{ borderColor: SPALTE_RAND, backgroundColor: isHover ? tint(col.color, 10) : SPALTE_BG }}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: col.color }}
                    />
                    <span className="font-semibold text-sm text-(--text-primary) truncate">{colLabel(col.id)}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <SpaltenZaehler farbe={col.color} anzahl={cards.length} />
                    <button
                      type="button"
                      onClick={() => toggleColumnCollapsed(col.id)}
                      className="p-0.5 rounded hover:bg-(--bg-card) text-(--text-tertiary) hover:text-(--text-primary) transition-colors"
                      title={`${colLabel(col.id)} ${tx('einklappen', 'collapse')}`}
                    >
                      <ChevronDown size={14} />
                    </button>
                  </div>
                </div>
                {totalVol > 0 && <SpaltenSumme betrag={totalVol} />}
                {col.id === 'nicht_sinnvoll' && nichtSinnvollStats.total > 0 && (
                  <div className="mt-2 pt-2 border-t border-(--border-light)">
                    <div className="text-[11px] text-(--text-secondary) leading-snug" dangerouslySetInnerHTML={{ __html: tx('Dein Feedback hat die KI-Trefferquote von <strong>78%</strong> auf <strong>86%</strong> verbessert.', 'Your feedback improved the AI hit rate from <strong>78%</strong> to <strong>86%</strong>.') }} />
                    <div className="text-[10px] text-(--text-tertiary) mt-0.5">
                      {tx(`${nichtSinnvollStats.total} verworfen · ${nichtSinnvollStats.falscheErkennung} Fehlerkennungen korrigiert`, `${nichtSinnvollStats.total} dismissed · ${nichtSinnvollStats.falscheErkennung} false detections corrected`)}
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
                          const cardId = items[0]._id;
                          const isCardExpanded = expandedCard?.id === cardId;
                          return (
                            <PotenzialCard
                              key={cardId}
                              p={items[0]}
                              columnColor={col.color}
                              onDragStart={handleDragStart}
                              onDragEnd={handleDragEnd}
                              onReactivate={handleReactivateWithCollapse}
                              onCardClick={onCardClick}
                              isExpanded={isCardExpanded}
                              onToggleExpand={() => toggleExpandCard(cardId, col.id)}
                            />
                          );
                        }
                        const clusterId = `cluster_${items[0].kundeId}_${idx}`;
                        const isClusterExpanded = expandedCard?.id === clusterId;
                        return (
                          <PotenzialClusterCard
                            key={clusterId}
                            items={items}
                            columnColor={col.color}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                            onReactivate={handleReactivateWithCollapse}
                            onCardClick={onCardClick}
                            isExpanded={isClusterExpanded}
                            onToggleExpand={() => toggleExpandCard(clusterId, col.id)}
                          />
                        );
                      })}
                      {cards.length === 0 && (
                        <div className="text-center text-[11px] text-(--text-tertiary) py-4">
                          {isDropTarget ? tx('Hier ablegen', 'Drop here') : '–'}
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
                          className="w-full mt-1 py-2 rounded-[10px] text-[11px] font-semibold border border-dashed border-(--border-strong) text-(--text-secondary) hover:bg-(--bg-card) hover:text-(--text-primary) transition-colors"
                        >
                          {isExpanded
                            ? tx('Weniger anzeigen', 'Show less')
                            : tx(`Mehr anzeigen (+${hiddenGroupCount} Kunden)`, `Show more (+${hiddenGroupCount} customers)`)}
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

      {/* KI-Lernt-Animation nach einem „Nicht sinnvoll"-Feedback */}
      {trainingToast && (
        <KITrainingToast
          kundeName={trainingToast.kundeName}
          titel={trainingToast.titel}
          reason={trainingToast.reason}
          onDone={() => setTrainingToast(null)}
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
        className="surface-inset appearance-none h-9 rounded-[10px] pl-3 pr-8 text-xs font-medium text-(--text-primary) focus:border-(--mode-accent) cursor-pointer transition-colors"
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-(--text-tertiary)" />
    </div>
  );
}

function PotenzialCard({ p, columnColor, onDragStart, onDragEnd, onReactivate, onCardClick, isExpanded, onToggleExpand }) {
  const dragStartedRef = useRef(false);
  const isClosed = p.status === 'abgeschlossen';
  const isDismissed = p.status === 'nicht_sinnvoll';
  const ageInDays = computeAge(p);
  const ageWarn = ageInDays != null && ageInDays > 30;

  const fida = (p.quellen || []).includes('finanztransaktion');
  const canExpand = typeof onToggleExpand === 'function' && !isDismissed;

  // Einheitlich dünne Karten-Umrandung — keine dicke Alters-Warnkontur,
  // visueller Druck kommt nur über das kleine Warn-Icon im Header.
  const cardOpacity = isClosed ? 0.55 : isDismissed ? 0.7 : 1;
  const cardBg = isClosed ? 'var(--bg-primary)' : 'var(--bg-card)';

  return (
    <div
      draggable={p.status !== 'abgeschlossen'}
      onDragStart={(e) => { dragStartedRef.current = true; onDragStart(e, p); }}
      onDragEnd={(e) => { onDragEnd(e); setTimeout(() => { dragStartedRef.current = false; }, 0); }}
      onClick={() => {
        if (dragStartedRef.current) return; // ignore click that came from a drag
        onCardClick?.(p);
      }}
      className="rounded-[10px] p-2.5 border border-(--border-light) shadow-[0_1px_2px_rgba(28,26,23,0.04)] hover:shadow-[0_6px_16px_rgba(28,26,23,0.08)] hover:border-(--mode-primary-light) hover:-translate-y-0.5 transition-all cursor-pointer active:cursor-grabbing relative"
      style={{
        backgroundColor: cardBg,
        opacity: cardOpacity,
      }}
    >
      {/* Header: Avatar + Name */}
      <div className="flex items-center gap-2 mb-1.5">
        <KundenAvatar kundeId={p.kundeId} kundeName={p.kundeName} columnColor={columnColor} size={24} />
        <span className={`text-xs font-semibold truncate flex-1 ${isClosed ? 'text-(--text-tertiary) line-through' : 'text-(--text-primary)'}`}>{p.kundeName}</span>
        {isClosed && (
          <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-(--tint-success) text-(--color-success) shrink-0" title={tx('Abgeschlossen', 'Closed')}>
            <Check size={11} strokeWidth={3} />
          </span>
        )}
        {!isClosed && fida && (
          <span className="w-2 h-2 rounded-full bg-(--quelle-finanztransaktion) shrink-0" title={tx('FIDA-Daten', 'FIDA data')} />
        )}
        {ageWarn && !isDismissed && !isClosed && (
          <AlertTriangle size={11} className="text-(--color-danger) shrink-0" />
        )}
      </div>

      {/* Title */}
      <div className="text-[12px] font-semibold text-(--text-primary) leading-snug mb-1.5 line-clamp-2">
        {p.titel}
      </div>

      {/* Dismissal info */}
      {isDismissed && p._override && (
        <div className="mb-1.5 px-1.5 py-1 surface-inset rounded-md">
          <div className="text-[10px] font-semibold text-(--text-secondary) flex items-center gap-1">
            <X size={10} /> {reasonLabel(p._override.reason) || tx('Verworfen', 'Dismissed')}
          </div>
          {p._override.comment && (
            <div className="text-[10px] text-(--text-tertiary) italic mt-0.5 line-clamp-2">
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
        <span className="font-mono font-semibold text-(--text-primary)">
          {p.volumen ? `${formatEur(p.volumen)}${p.volumenTyp === 'jaehrlich' ? tx(' /J.', ' /yr') : ''}` : '–'}
        </span>
        {ageInDays != null && !isDismissed && (
          <span
            className="flex items-center gap-0.5 text-[10px] font-mono"
            style={{ color: ageWarn ? 'var(--color-danger)' : 'var(--text-tertiary)' }}
          >
            <Clock size={10} /> {ageInDays}{tx('T', 'd')}
          </span>
        )}
      </div>

      {/* Expandable details */}
      {canExpand && isExpanded && (
        <div
          className="mt-2 pt-2 border-t border-(--border-light) space-y-2"
          onClick={(e) => e.stopPropagation()}
        >
          {p.beschreibung && (
            <div className="text-[11px] text-(--text-secondary) leading-snug">
              {p.beschreibung}
            </div>
          )}
          {(p.quellen || []).length > 0 && (
            <div>
              <div className="text-[10px] font-semibold text-(--text-tertiary) uppercase tracking-wider mb-1">
                {tx('Quellen', 'Sources')}
              </div>
              <div className="flex items-center gap-1 flex-wrap">
                {(p.quellen || []).map((q, qi) => (
                  <QuellenBadge key={qi} quelle={q} />
                ))}
              </div>
            </div>
          )}
          {p.produktEmpfehlung && (
            <div>
              <div className="text-[10px] font-semibold text-(--text-tertiary) uppercase tracking-wider mb-0.5">
                {tx('Produkt-Empfehlung', 'Product recommendation')}
              </div>
              <div className="text-[11px] text-(--text-primary) font-semibold">
                {p.produktEmpfehlung}
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onCardClick?.(p); }}
            className="w-full text-[11px] font-semibold text-white rounded-md px-2 py-1.5 bg-(--mode-primary) hover:bg-(--mode-primary-light) transition-colors"
          >
            {tx('Zum Kundenprofil', 'To customer profile')}
          </button>
        </div>
      )}

      {/* Expand / collapse toggle */}
      {canExpand && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onToggleExpand(); }}
          className="mt-1.5 w-full flex items-center justify-center gap-0.5 text-[10px] font-semibold text-(--text-tertiary) hover:text-(--text-primary) rounded py-0.5 hover:bg-(--bg-inset) transition-colors"
        >
          {isExpanded ? (
            <>{tx('Weniger anzeigen', 'Show less')} <ChevronDown size={10} /></>
          ) : (
            <>{tx('Details', 'Details')} <ChevronRight size={10} /></>
          )}
        </button>
      )}

      {/* Reactivate button for dismissed */}
      {isDismissed && (
        <button
          onClick={(e) => { e.stopPropagation(); onReactivate(p._id); }}
          className="surface-inset mt-1.5 w-full text-[10px] font-semibold text-(--text-secondary) hover:text-(--text-primary) hover:border-(--mode-accent) rounded-md px-2 py-1 flex items-center justify-center gap-1 transition-colors"
        >
          <RotateCcw size={10} /> {tx('Reaktivieren', 'Reactivate')}
        </button>
      )}
    </div>
  );
}

const QUELLEN_THEME_LABELS = {
  finanztransaktion: () => tx('FIDA-Signal', 'FIDA signal'),
  bestand: () => tx('Bestandssignal', 'Portfolio signal'),
  wettbewerb: () => tx('Wettbewerb', 'Competition'),
  lebensereignis: () => tx('Lebensereignis', 'Life event'),
  direktvertrieb: () => tx('Direktvertrieb', 'Direct sales'),
  kontoumsaetze: () => tx('Kontoumsätze', 'Account transactions'),
  risikosignal: () => tx('Risikosignal', 'Risk signal'),
  kommunikation: () => tx('Kommunikation', 'Communication'),
  markt: () => tx('Marktdaten', 'Market data'),
};
const quellenThemeLabel = (q) => (QUELLEN_THEME_LABELS[q] ? QUELLEN_THEME_LABELS[q]() : q);

function PotenzialClusterCard({ items, columnColor, onDragStart, onDragEnd, onReactivate, onCardClick, isExpanded, onToggleExpand }) {
  const [localExpanded, setLocalExpanded] = useState(false);
  const dragStartedRef = useRef(false);
  const controlled = typeof isExpanded === 'boolean' && typeof onToggleExpand === 'function';
  const expanded = controlled ? isExpanded : localExpanded;
  const toggleExpanded = () => {
    if (controlled) onToggleExpand();
    else setLocalExpanded(v => !v);
  };
  // Ganzes Cluster (z. B. alle Potenziale von Peter Seidel) als Drag-Payload:
  // Statt einzelner _id übertragen wir ein Array von Items, damit der Drop
  // alle Potenziale gemeinsam verschiebt.
  const clusterPayload = {
    _id: items[0]?._id,
    kundeId: items[0]?.kundeId,
    kundeName: items[0]?.kundeName,
    titel: items[0]?.titel,
    status: items[0]?.status,
    items,
  };
  const top = items[0];
  const kundeName = top.kundeName || '';

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
    const topLabel = quellenThemeLabel(topQ);
    if (topCount >= 2) {
      themaText = `${topCount}× ${topLabel}`;
      if (sortedQuellen.length > 1) {
        const secondLabel = quellenThemeLabel(sortedQuellen[1][0]);
        themaText += ` + ${secondLabel}`;
      }
      themaText += `: ${tx('Bestandskonsolidierung', 'Portfolio consolidation')}`;
    } else if (sortedQuellen.length > 1) {
      const secondLabel = quellenThemeLabel(sortedQuellen[1][0]);
      themaText = `${topLabel} + ${secondLabel}`;
    } else {
      themaText = topLabel;
    }
  }

  const topVolText = top.volumen
    ? `${formatEur(top.volumen)}${top.volumenTyp === 'jaehrlich' ? tx(' /J.', ' /yr') : ''}`
    : '';

  if (expanded) {
    return (
      <div className="rounded-[10px] border p-2 bg-(--bg-card) space-y-2" style={{ borderColor: tint(columnColor, 45) }}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <KundenAvatar kundeId={top.kundeId} kundeName={kundeName} columnColor={columnColor} size={20} />
            <span className="text-[11px] font-semibold text-(--text-primary) truncate">{kundeName}</span>
            <span className="text-[10px] text-(--text-tertiary) shrink-0">· {items.length} {tx('Potenziale', 'potentials')}</span>
          </div>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); toggleExpanded(); }}
            className="text-[10px] font-semibold text-(--text-tertiary) hover:text-(--text-primary) px-1.5 py-0.5 rounded hover:bg-(--bg-inset) shrink-0 transition-colors"
          >
            {tx('Einklappen', 'Collapse')}
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
      draggable={top.status !== 'abgeschlossen'}
      onDragStart={(e) => { dragStartedRef.current = true; onDragStart?.(e, clusterPayload); }}
      onDragEnd={(e) => { onDragEnd?.(e); setTimeout(() => { dragStartedRef.current = false; }, 0); }}
      onClick={() => {
        if (dragStartedRef.current) return;
        onCardClick?.(top);
      }}
      className="rounded-[10px] p-2.5 bg-(--bg-card) border border-(--border-light) shadow-[0_1px_2px_rgba(28,26,23,0.04)] hover:shadow-[0_6px_16px_rgba(28,26,23,0.08)] hover:border-(--mode-primary-light) hover:-translate-y-0.5 transition-all cursor-pointer active:cursor-grabbing relative"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <KundenAvatar kundeId={top.kundeId} kundeName={kundeName} columnColor={columnColor} size={24} />
        <span className="text-xs font-semibold truncate flex-1 text-(--text-primary)">{kundeName}</span>
        {fida && (
          <span className="w-2 h-2 rounded-full bg-(--quelle-finanztransaktion) shrink-0" title={tx('FIDA-Daten', 'FIDA data')} />
        )}
      </div>

      {/* Summary line */}
      <div className="flex items-center flex-wrap gap-x-1 text-[11px] font-mono text-(--text-tertiary) mb-1.5">
        <span>{items.length} {tx('Potenziale', 'potentials')}</span>
        {(totalEinmalig + totalJaehrlich) > 0 && (
          <>
            <span>·</span>
            <Sigma size={11} strokeWidth={2} className="shrink-0" />
            <span>
              {totalEinmalig > 0 && formatEur(totalEinmalig)}
              {totalEinmalig > 0 && totalJaehrlich > 0 && ' + '}
              {totalJaehrlich > 0 && `${formatEur(totalJaehrlich)}${tx(' /J.', ' /yr')}`}
            </span>
          </>
        )}
      </div>

      {/* Top-Potenzial und Thema als Zeilen mit Kicker statt Aufzählungszeichen */}
      <div className="space-y-1 mb-2">
        <div className="text-[11px] leading-snug flex gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-(--text-tertiary) shrink-0 w-11 pt-px">{tx('Top', 'Top')}</span>
          <span className="min-w-0 text-(--text-primary)">
            {top.titel}
            {topVolText && <span className="text-(--text-tertiary) font-mono"> ({topVolText})</span>}
          </span>
        </div>
        {themaText && (
          <div className="text-[11px] leading-snug flex gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-(--text-tertiary) shrink-0 w-11 pt-px">{tx('Thema', 'Topic')}</span>
            <span className="min-w-0 text-(--text-secondary)">{themaText}</span>
          </div>
        )}
      </div>

      {/* Badges + expand */}
      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-1 flex-wrap">
          <PrioBadge prioritaet={top.prioritaet} />
          {items.length > 1 && (
            <span className="text-[10px] font-mono font-semibold text-(--text-secondary) bg-(--bg-inset) border border-(--border-light) rounded-full px-1.5 py-0.5">
              +{items.length - 1}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); toggleExpanded(); }}
          className="flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded text-(--mode-primary) hover:bg-(--bg-inset) shrink-0 transition-colors"
        >
          {tx('Aufklappen', 'Expand')} <ChevronRight size={10} />
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
          <h3 className="text-lg font-semibold text-(--text-primary)">{tx('Potenzial verwerfen', 'Dismiss potential')}</h3>
          <p className="text-xs text-(--text-tertiary) mt-0.5">
            {potential.kundeName} · {potential.titel}
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg hover:bg-(--bg-inset) flex items-center justify-center text-(--text-tertiary) hover:text-(--text-primary) transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      <div className="text-sm font-semibold text-(--text-primary) mb-2">
        {tx('Warum passt dieses Potenzial nicht?', 'Why does this potential not fit?')}
      </div>
      <div className="space-y-1.5 mb-4">
        {REASON_OPTIONS.map(r => (
          <label
            key={r.id}
            className={`flex items-center gap-2 px-3 py-2 rounded-[10px] border cursor-pointer transition-colors ${
              reason === r.id
                ? 'border-(--mode-primary) bg-(--mode-primary-soft)'
                : 'border-(--border-light) hover:bg-(--bg-inset)'
            }`}
          >
            <input
              type="radio"
              name="reason"
              checked={reason === r.id}
              onChange={() => setReason(r.id)}
              className="accent-(--mode-primary)"
            />
            <span className="text-sm text-(--text-primary)">{r.label()}</span>
          </label>
        ))}
      </div>

      <div className="mb-4">
        <label className="text-xs font-semibold text-(--text-secondary) mb-1 block">
          {tx('Optionaler Kommentar', 'Optional comment')}
        </label>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          rows={3}
          placeholder={tx('z.B. "Hund gehört der Ex-Partnerin"', 'e.g. "Dog belongs to the ex-partner"')}
          className={FELD}
        />
      </div>

      <div className="rounded-[10px] bg-(--bg-inset) border border-(--border-light) border-l-2 border-l-(--mode-accent) p-3 mb-4">
        <div className="flex items-start gap-2">
          <Sparkles size={14} className="text-(--mode-accent) mt-0.5 shrink-0" />
          <div className="text-xs text-(--text-secondary) leading-relaxed">
            {tx('Dieses Feedback hilft der KI, zukünftige Potenziale besser zu bewerten. Je präziser deine Begründung, desto weniger Fehlerkennungen.', 'This feedback helps the AI assess future potentials better. The more precise your reasoning, the fewer false detections.')}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <button
          onClick={onClose}
          className="h-9 px-4 rounded-[10px] text-sm font-medium text-(--text-secondary) hover:bg-(--bg-inset) hover:text-(--text-primary) transition-colors"
        >
          {tx('Abbrechen', 'Cancel')}
        </button>
        <button
          onClick={() => onConfirm(reason, comment)}
          className="h-9 px-4 rounded-[10px] text-sm font-semibold bg-(--mode-primary) text-white hover:bg-(--mode-primary-light) transition-colors"
        >
          {tx('Potenzial verwerfen', 'Dismiss potential')}
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
          <h3 className="text-lg font-semibold text-(--text-primary)">{tx('Abschluss erfassen', 'Record closing')}</h3>
          <p className="text-xs text-(--text-tertiary) mt-0.5">
            {potential.kundeName} · {potential.titel}
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg hover:bg-(--bg-inset) flex items-center justify-center text-(--text-tertiary) hover:text-(--text-primary) transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      <div className="space-y-3 mb-4">
        <div>
          <label className="text-xs font-semibold text-(--text-secondary) mb-1 block">{tx('Produkt', 'Product')}</label>
          <input
            type="text"
            value={produkt}
            onChange={e => setProdukt(e.target.value)}
            className={FELD}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-(--text-secondary) mb-1 block">{tx('Volumen (€)', 'Volume (€)')}</label>
          <input
            type="number"
            value={volumen}
            onChange={e => setVolumen(e.target.value)}
            className={`${FELD} font-mono`}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-(--text-secondary) mb-1 block">{tx('Abschlussdatum', 'Closing date')}</label>
          <input
            type="date"
            lang="de-DE"
            value={datum}
            onChange={e => setDatum(e.target.value)}
            className={FELD}
          />
          {/* Der native Datums-Picker rendert in der Browsersprache; die
              deutsche Schreibweise steht deshalb sichtbar darunter. */}
          {datum && (
            <div className="text-[11px] font-mono text-(--text-tertiary) mt-1">
              {new Date(datum).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <button
          onClick={onClose}
          className="h-9 px-4 rounded-[10px] text-sm font-medium text-(--text-secondary) hover:bg-(--bg-inset) hover:text-(--text-primary) transition-colors"
        >
          {tx('Abbrechen', 'Cancel')}
        </button>
        <button
          onClick={() => onConfirm({ produkt, volumen: Number(volumen) || 0, datum })}
          className="h-9 px-4 rounded-[10px] text-sm font-semibold bg-(--mode-primary) text-white hover:bg-(--mode-primary-light) transition-colors"
        >
          {tx('Abschluss erfassen', 'Record closing')}
        </button>
      </div>
    </ModalShell>
  );
}

// KI-Lernt-Overlay nach einem „Nicht sinnvoll"-Feedback.
// Zeigt eine kurze Animation: Sparkles + progressiver Fortschrittsbalken,
// der suggeriert, dass das Modell mit der neuen Rueckmeldung trainiert
// wird. Dismisst sich automatisch nach ~3.5 Sekunden.
function KITrainingToast({ kundeName, titel, reason, onDone }) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(0); // 0 → lernend, 1 → fertig
  const REASON_LABELS_FULL = {
    bereits_abgesichert: tx('Kunde hat bereits Absicherung', 'Customer already covered'),
    kein_interesse: tx('Kunde hat kein Interesse', 'Customer not interested'),
    falsche_erkennung: tx('Fehlerkennung', 'False detection'),
    timing: tx('Timing passt nicht', 'Timing not right'),
    kunde_wechselt: tx('Kunde wechselt / kündigt', 'Customer switching / cancelling'),
    anderer_grund: tx('Anderer Grund', 'Other reason'),
  };
  const reasonLabelText = REASON_LABELS_FULL[reason] || tx('Feedback', 'Feedback');
  const ziel = useRef(null);
  if (!ziel.current) ziel.current = portalZiel();

  useEffect(() => {
    // Progress-Bar in Schritten hochziehen.
    let mounted = true;
    const tick = (target, delay) => setTimeout(() => { if (mounted) setProgress(target); }, delay);
    const ts = [tick(18, 80), tick(42, 420), tick(68, 900), tick(88, 1500), tick(100, 2200)];
    const done = setTimeout(() => { if (mounted) setPhase(1); }, 2400);
    const dismiss = setTimeout(() => { if (mounted) onDone?.(); }, 3600);
    return () => {
      mounted = false;
      ts.forEach(clearTimeout);
      clearTimeout(done);
      clearTimeout(dismiss);
    };
  }, [onDone]);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(28,26,23,0.45)] backdrop-blur-sm animate-fade-in">
      <div className="surface-elevated w-[420px] max-w-full rounded-2xl overflow-hidden animate-fade-in-up">
        <div className="p-5">
          <div className="flex items-start gap-3">
            <div className="relative w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-(--mode-primary) text-white">
              {phase === 0 ? (
                <Brain size={20} className="animate-pulse" strokeWidth={2.25} />
              ) : (
                <Check size={20} strokeWidth={2.75} />
              )}
              {phase === 0 && (
                <>
                  <span className="absolute -top-1 -right-1">
                    <Sparkles size={10} className="text-(--mode-accent) animate-ping" />
                  </span>
                  <span className="absolute -bottom-1 -left-1">
                    <Sparkles size={8} className="text-(--mode-accent) animate-ping [animation-delay:300ms]" />
                  </span>
                </>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-(--mode-primary) bg-(--mode-primary-soft) px-1.5 py-0.5 rounded-full">
                  <Cpu size={9} /> {tx('KI lernt', 'AI learning')}
                </span>
                <span className="text-[10px] text-(--text-tertiary)">&middot; {tx('aus deinem Feedback', 'from your feedback')}</span>
              </div>
              <div className="text-sm font-semibold text-(--text-primary) leading-snug">
                {phase === 0
                  ? tx('Feedback wird in das Scoring-Modell eingearbeitet…', 'Feedback is being incorporated into the scoring model…')
                  : tx('Modell aktualisiert: ähnliche Potenziale werden künftig besser bewertet.', 'Model updated: similar potentials will be scored better in future.')}
              </div>
              <div className="text-[11px] text-(--text-tertiary) mt-1 leading-snug">
                {titel && <span className="font-medium">„{titel}"</span>}
                {titel && kundeName && <span> · </span>}
                {kundeName && <span>{kundeName}</span>}
                {reasonLabelText && (
                  <span className="block mt-0.5">{tx('Grund', 'Reason')}: <span className="text-(--text-primary) font-medium">{reasonLabelText}</span></span>
                )}
              </div>
            </div>
          </div>
          <div className="progress-track mt-3 h-1.5 rounded-full overflow-hidden">
            <div
              className="progress-fill h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-1.5 text-[10px] text-(--text-tertiary)">
            <span>{progress < 100 ? tx('Re-Training läuft…', 'Re-training in progress…') : tx('Abgeschlossen', 'Completed')}</span>
            <span className="font-mono">{progress}%</span>
          </div>
        </div>
      </div>
    </div>,
    ziel.current
  );
}

function ModalShell({ children, onClose }) {
  const ziel = useRef(null);
  if (!ziel.current) ziel.current = portalZiel();
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(28,26,23,0.45)] backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="surface-elevated rounded-2xl max-w-md w-full p-6"
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    ziel.current
  );
}
