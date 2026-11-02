import { useState, useMemo, useCallback } from 'react';
import { clsx } from 'clsx';
import { Search, Filter } from 'lucide-react';
import useKiAnalyse from '../hooks/useKiAnalyse';
import StatistikHeader from '../components/StatistikHeader';
import PriorisierungsBanner from '../components/PriorisierungsBanner';
import VorgangCard from '../components/VorgangCard';
import VorgangDetail from '../components/VorgangDetail';
import ClusterGroup from '../components/ClusterGroup';

const STATUS_OPTIONS = ['Alle', 'Neu', 'In Bearbeitung', 'Geklärt', 'Beantwortet', 'Abgelehnt', 'Eskaliert'];
const PRIO_OPTIONS = ['Alle', 'Normal', 'Auffällig'];
const SORT_OPTIONS = [
  { value: 'datum', label: 'Eingangsdatum (neueste zuerst)' },
  { value: 'differenz', label: 'Differenzbetrag' },
  { value: 'prioritaet', label: 'Priorität' },
];

// `vorgaenge` + Status-Änderungen werden vom `ProvisionsreklamationModule`
// gehalten, damit auch das „Reklamation einreichen"-Tab (Vermittler-Inbox)
// vom selben Datenstand liest.
export default function BackofficeView({ vorgaenge, onStatusChange, onMarkVorgangSighted }) {
  const [selectedId, setSelectedId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('Alle');
  const [prioFilter, setPrioFilter] = useState('Alle');
  const [suchtext, setSuchtext] = useState('');
  const [sortierung, setSortierung] = useState('datum');
  const { getAnalyse, isLoading, requestAnalyse } = useKiAnalyse();

  // Filtern & Sortieren
  const gefilterteVorgaenge = useMemo(() => {
    let result = [...vorgaenge];

    if (statusFilter !== 'Alle') {
      result = result.filter(v => v.status === statusFilter);
    }
    if (prioFilter === 'Auffällig') {
      result = result.filter(v => v.auffaellig);
    } else if (prioFilter === 'Normal') {
      result = result.filter(v => !v.auffaellig);
    }
    if (suchtext.trim()) {
      const s = suchtext.toLowerCase();
      result = result.filter(v =>
        v.id.toLowerCase().includes(s) ||
        v.vermittler.toLowerCase().includes(s) ||
        v.vsNummer.toLowerCase().includes(s) ||
        v.vnName.toLowerCase().includes(s)
      );
    }

    result.sort((a, b) => {
      if (sortierung === 'datum') return b.eingangsdatum.localeCompare(a.eingangsdatum);
      if (sortierung === 'differenz') return a.differenz - b.differenz;
      if (sortierung === 'prioritaet') return (b.auffaellig ? 1 : 0) - (a.auffaellig ? 1 : 0);
      return 0;
    });

    return result;
  }, [vorgaenge, statusFilter, prioFilter, suchtext, sortierung]);

  const selectedVorgang = useMemo(() => {
    return vorgaenge.find(v => v.id === selectedId) || null;
  }, [vorgaenge, selectedId]);

  const auffaelligCount = useMemo(() => {
    return vorgaenge.filter(v => v.auffaellig).length;
  }, [vorgaenge]);

  const handleSelect = useCallback((vorgang) => {
    setSelectedId(vorgang.id);
    // „Neu eingereicht"- und „Rückmeldung vom Vermittler"-Flag entfernen,
    // sobald der Sachbearbeiter den Vorgang aktiv auswählt.
    if (onMarkVorgangSighted) onMarkVorgangSighted(vorgang.id);
    requestAnalyse(vorgang);
  }, [requestAnalyse, onMarkVorgangSighted]);

  const handleShowAuffaellig = useCallback(() => {
    setPrioFilter('Auffällig');
  }, []);

  return (
    <div className="p-6 space-y-4 animate-fade-in-up">
      {/* Statistik-Header */}
      <StatistikHeader />

      {/* Priorisierungs-Banner */}
      <PriorisierungsBanner count={auffaelligCount} onShowDetails={handleShowAuffaellig} />

      {/* Filter-Leiste */}
      <div className="card-base p-3 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5">
          <Filter size={14} className="text-slate-400" />
          <span className="text-xs text-slate-500 font-medium">Filter:</span>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs px-2 py-1.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={prioFilter}
          onChange={(e) => setPrioFilter(e.target.value)}
          className="text-xs px-2 py-1.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          {PRIO_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select
          value={sortierung}
          onChange={(e) => setSortierung(e.target.value)}
          className="text-xs px-2 py-1.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          {SORT_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={suchtext}
              onChange={(e) => setSuchtext(e.target.value)}
              placeholder="Suche: Vorgangsnr., Vermittler, VS-Nr..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>
        <span className="text-xs text-slate-400">{gefilterteVorgaenge.length} Vorgänge</span>
      </div>

      {/* Zwei-Spalten-Layout — solange nichts ausgewählt ist, nimmt die Liste
          die komplette Breite ein (mehrspaltig) und das Detail-Panel ist
          ausgeblendet. Sobald ein Vorgang ausgewählt ist, schrumpft die Liste
          auf 380px und das Detail-Panel öffnet sich rechts. */}
      <div className="flex gap-4" style={{ minHeight: 'calc(100vh - 420px)' }}>
        <div className={clsx(
          'overflow-y-auto max-h-[calc(100vh-420px)] pr-1 space-y-2 shrink-0',
          selectedVorgang ? 'w-[380px]' : 'w-[760px]'
        )}>
          {(() => {
            const rendered = new Set();
            const items = [];
            gefilterteVorgaenge.forEach(vorgang => {
              if (rendered.has(vorgang.id)) return;
              const cid = vorgang.clusterId;
              if (cid) {
                const members = gefilterteVorgaenge.filter(v => v.clusterId === cid);
                if (members.length >= 2) {
                  members.forEach(m => rendered.add(m.id));
                  items.push(
                    <ClusterGroup
                      key={`cluster-${cid}`}
                      clusterId={cid}
                      vorgaenge={members}
                      selectedId={selectedId}
                      onSelect={handleSelect}
                    />
                  );
                  return;
                }
              }
              rendered.add(vorgang.id);
              items.push(
                <VorgangCard
                  key={vorgang.id}
                  vorgang={vorgang}
                  isActive={selectedId === vorgang.id}
                  onClick={() => handleSelect(vorgang)}
                />
              );
            });
            return items;
          })()}
          {gefilterteVorgaenge.length === 0 && (
            <div className="text-center py-8 text-sm text-slate-400">
              Keine Vorgänge gefunden.
            </div>
          )}
        </div>

        {/* Detail-Panel (rechts) — nur sichtbar, wenn ein Vorgang ausgewählt ist. */}
        {selectedVorgang && (
          <div className="flex-1 overflow-y-auto max-h-[calc(100vh-420px)] pr-1">
            <VorgangDetail
              vorgang={selectedVorgang}
              analyse={getAnalyse(selectedVorgang.id)}
              analyseLoading={isLoading(selectedVorgang.id)}
              onStatusChange={onStatusChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}
