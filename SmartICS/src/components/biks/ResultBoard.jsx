import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  FileText, RefreshCw, ShieldCheck, Sparkles, X, ListChecks, KeyRound,
  AlertTriangle, FileSpreadsheet, Download, SlidersHorizontal,
} from 'lucide-react';
import { useBiks } from '../../hooks/useBiks';
import { useInstitut } from '../../hooks/useInstitut';
import { BIKS_STATUS, STATUS_MAP } from '../../data/biksAgent';
import RisikoKachel from './RisikoKachel';
import RisikoMatrix from './RisikoMatrix';
import RisikoDetailDrawer from './RisikoDetailDrawer';
import { StatusIcon } from './StatusControls';
import { exportBiksCsv, exportBiksPdf } from '../../utils/exportBiks';

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

export default function ResultBoard() {
  const { analyse, resetAnalyse, activeRisikoId, setActiveRisikoId } = useBiks();
  const { institut } = useInstitut();
  const [filter, setFilter] = useState('alle');
  const [showQuelle, setShowQuelle] = useState(false);
  const [hoverId, setHoverId] = useState(null);

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

  const gefiltert = filter === 'alle' ? analyse.risiken : analyse.risiken.filter(r => r.status === filter);

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
      <div className="grid md:grid-cols-4 gap-3">
        <div className="card-base p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#FEF2F2', color: '#DC2626' }}><AlertTriangle size={18} /></div>
          <div><div className="text-xs text-slate-500">Wesentliche Risiken</div><div className="text-2xl font-bold leading-none mt-1">{stats.total}</div><div className="text-[11px] text-slate-500 mt-1">Top-5 priorisiert</div></div>
        </div>
        <div className="card-base p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'color-mix(in srgb, #16A34A 12%, white)', color: '#15803D' }}><KeyRound size={18} /></div>
          <div><div className="text-xs text-slate-500">Schlüsselkontrollen</div><div className="text-2xl font-bold leading-none mt-1">{stats.kontrollen}</div><div className="text-[11px] text-slate-500 mt-1">vorgeschlagen & ergänzt</div></div>
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
      <RisikoMatrix risiken={analyse.risiken} onOpen={(id) => setActiveRisikoId(id)} hoverId={hoverId} onHover={setHoverId} />

      {/* Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-slate-500 mr-1"><SlidersHorizontal size={13} /> Filter:</span>
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
      </div>

      {/* Kacheln */}
      {gefiltert.length > 0 ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {gefiltert.map(r => (
            <RisikoKachel key={r.id} risiko={r} onOpen={() => setActiveRisikoId(r.id)} active={hoverId === r.id} onHover={setHoverId} />
          ))}
        </div>
      ) : (
        <div className="card-base p-10 text-center text-slate-400">
          <ListChecks size={32} className="mx-auto mb-2 text-slate-300" />
          Keine Risiken mit Status „{STATUS_MAP[filter]?.label}".
        </div>
      )}

      {activeRisikoId && (
        <RisikoDetailDrawer risikoId={activeRisikoId} onClose={() => setActiveRisikoId(null)} />
      )}
      {showQuelle && <QuelleModal analyse={analyse} onClose={() => setShowQuelle(false)} />}
    </div>
  );
}
