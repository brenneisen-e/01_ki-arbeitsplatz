import { useMemo } from 'react';
import { Download, FileSpreadsheet, Key, AlertTriangle, ShieldCheck, CheckCircle2, FileX, Flame } from 'lucide-react';
import { useBiks } from '../../hooks/useBiks';
import { useInstitut } from '../../hooks/useInstitut';
import {
  CLUSTER_MAP, KONTROLL_ART, KONTROLL_TYP, KONTROLL_TURNUS,
  STUFE_MAP, bewertePrioritaet,
} from '../../data/biksAgent';
import { buildBiksRows, buildBiksSummary, exportBiksCsv, exportBiksPdf } from '../../utils/exportBiks';
import { StatusBadge } from '../biks/StatusControls';
import { formatDateDe } from '../../utils/datetime';

function lbl(list, id) { return list.find(x => x.id === id)?.label || id || ''; }

function StatCard({ label, value, sub, icon: Icon, color }) {
  return (
    <div className="card-base p-4 flex items-start gap-3">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: `color-mix(in srgb, ${color} 12%, white)`, color }}>
        <Icon size={18} />
      </div>
      <div>
        <div className="text-xs text-slate-500">{label}</div>
        <div className="text-2xl font-bold leading-none mt-1">{value}</div>
        {sub && <div className="text-[11px] text-slate-500 mt-1">{sub}</div>}
      </div>
    </div>
  );
}

function ClusterChart({ analyse }) {
  const data = useMemo(() => {
    // Gruppierung nach der (framework-abhängigen) Risikoart-Benennung,
    // eingefärbt über den zugrunde liegenden Cluster.
    const map = new Map();
    analyse.risiken.forEach(r => {
      const entry = map.get(r.risikoart) || { label: r.risikoart, value: 0, color: CLUSTER_MAP[r.cluster]?.color || '#94A3B8' };
      entry.value += 1;
      map.set(r.risikoart, entry);
    });
    return [...map.values()];
  }, [analyse]);
  if (data.length === 0) return null;
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="card-base p-5">
      <div className="text-sm font-semibold mb-1">Risiken nach Risikoart</div>
      <div className="text-xs text-slate-500 mb-3">Benennung gemäß gewählter Risiko-Vorgabe</div>
      <div className="space-y-2.5">
        {data.map(d => (
          <div key={d.label} className="flex items-center gap-3">
            <span className="text-[12px] text-slate-600 w-32 shrink-0 truncate">{d.label}</span>
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

function PriorityChart({ summary }) {
  const total = summary.tierCount.high + summary.tierCount.mid + summary.tierCount.low;
  if (total === 0) return null;
  const segments = [
    { tier: 'high', label: 'Hoch', value: summary.tierCount.high, color: '#DC2626' },
    { tier: 'mid',  label: 'Mittel', value: summary.tierCount.mid, color: '#D97706' },
    { tier: 'low',  label: 'Gering', value: summary.tierCount.low, color: '#059669' },
  ];
  return (
    <div className="card-base p-5">
      <div className="text-sm font-semibold mb-1">Verteilung nach Priorität</div>
      <div className="text-xs text-slate-500 mb-3">Schaden × Eintrittswahrscheinlichkeit</div>
      <div className="flex items-stretch gap-2 mb-3 h-6 rounded-md overflow-hidden">
        {segments.map(s => (
          <div key={s.tier} style={{ flex: s.value, background: s.color, minWidth: s.value > 0 ? 12 : 0 }} title={`${s.label}: ${s.value}`} />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3 text-center">
        {segments.map(s => (
          <div key={s.tier}>
            <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[11px] uppercase tracking-wider text-slate-500">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RkmView({ onStartWorkflow }) {
  const { analyse } = useBiks();
  const { institut } = useInstitut();

  if (!analyse) {
    return (
      <div className="card-base p-10 text-center">
        <FileX size={36} className="mx-auto text-slate-300 mb-3" />
        <div className="text-base font-semibold mb-1">Noch keine Analyse vorhanden</div>
        <div className="text-sm text-slate-500 mb-4 max-w-md mx-auto">
          Laden Sie im b-IKS Agent eine Arbeitsanweisung hoch, um eine Risiko-Kontroll-Matrix zu erzeugen.
        </div>
        <button
          onClick={onStartWorkflow}
          className="px-4 py-2 rounded-lg text-white text-sm font-semibold inline-flex items-center gap-2"
          style={{ background: 'var(--mode-primary, #0F4D2A)' }}
        >
          <ShieldCheck size={16} /> Zum b-IKS Agent
        </button>
      </div>
    );
  }

  const rows = buildBiksRows(analyse);
  const summary = buildBiksSummary(analyse);
  const coverage = summary.risikoCount ? Math.round((summary.kontrollen ? analyse.risiken.filter(r => r.schluesselkontrollen.length > 0).length : 0) / summary.risikoCount * 100) : 0;
  const highPrio = summary.tierCount.high;

  return (
    <div className="space-y-5">
      <div className="card-base p-5 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="text-xs text-slate-500">Risiko-Kontroll-Matrix</div>
          <div className="text-lg font-semibold">{analyse.prozessName}</div>
          <div className="text-xs text-slate-500 mt-1">
            {analyse.kategorie} · erstellt am {formatDateDe(analyse.createdAt)}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => exportBiksCsv(analyse)} className="px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-sm font-medium inline-flex items-center gap-2">
            <FileSpreadsheet size={16} className="text-emerald-700" /> CSV
          </button>
          <button onClick={() => exportBiksPdf(analyse, institut)} className="px-3 py-2 rounded-lg text-white text-sm font-semibold inline-flex items-center gap-2" style={{ background: 'var(--mode-primary, #0F4D2A)' }}>
            <Download size={16} /> PDF Export
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-3">
        <StatCard label="Wesentliche Risiken" value={summary.risikoCount} sub="Top-5 priorisiert" icon={AlertTriangle} color="#DC2626" />
        <StatCard label="Schlüsselkontrollen" value={summary.kontrollen} sub="vorgeschlagen & ergänzt" icon={Key} color="#1D7B3F" />
        <StatCard label="Coverage" value={`${coverage} %`} sub="Risiken mit Schlüsselkontrolle" icon={CheckCircle2} color="#0F4D2A" />
        <StatCard label="Hohe Priorität" value={highPrio} sub="Risiken mit Tier Hoch" icon={Flame} color="#B91C1C" />
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <ClusterChart analyse={analyse} />
        <PriorityChart summary={summary} />
      </div>

      <div className="card-base">
        <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
          <div className="text-sm font-semibold">Vollständige Risiko-Kontroll-Matrix</div>
          <div className="text-[11px] text-slate-500">{rows.length} Einträge</div>
        </div>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="matrix-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}>Nr.</th>
                <th>Risikoart</th>
                <th>Risiko</th>
                <th>Bewertung</th>
                <th style={{ width: 110 }}>Risiko-Status</th>
                <th>Schlüsselkontrolle</th>
                <th>Ansatz / Turnus</th>
                <th>Verantwortlich</th>
                <th style={{ width: 120 }}>Kontroll-Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ r, k }, i) => {
                const prio = bewertePrioritaet(r.schaden, r.eintritt);
                const c = CLUSTER_MAP[r.cluster];
                return (
                  <tr key={i}>
                    <td className="font-mono text-slate-400">{r.nummer}</td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: c?.color }} />
                        <span className="text-[12px] font-semibold">{r.risikoart}</span>
                      </div>
                    </td>
                    <td className="text-[12px] max-w-[240px]">
                      <div className="font-semibold">{r.titel}</div>
                      <div className="text-slate-500 line-clamp-2">{r.risikospezifikation}</div>
                    </td>
                    <td className="text-[11.5px] whitespace-nowrap">
                      <div>Schaden: <span className="font-semibold" style={{ color: STUFE_MAP[r.schaden]?.color }}>{STUFE_MAP[r.schaden]?.label}</span></div>
                      <div>EW: <span className="font-semibold" style={{ color: STUFE_MAP[r.eintritt]?.color }}>{STUFE_MAP[r.eintritt]?.label}</span></div>
                      <span className="chip mt-1" style={{ background: `color-mix(in srgb, ${prio.color} 12%, white)`, color: prio.color, borderColor: 'transparent' }}>Prio {prio.label}</span>
                    </td>
                    <td><StatusBadge statusId={r.status} /></td>
                    <td className="text-[12px] max-w-[220px]">
                      <div className="font-semibold">{k ? k.name : '—'}</div>
                      {k && <div className="text-slate-500 line-clamp-2">{k.ziel}</div>}
                    </td>
                    <td className="text-[11.5px]">
                      {k ? <><div>{lbl(KONTROLL_ART, k.art)} · {lbl(KONTROLL_TYP, k.typ)}</div><div className="text-slate-500">{lbl(KONTROLL_TURNUS, k.turnus)}</div></> : '—'}
                    </td>
                    <td className="text-[12px]">{k?.wer || '—'}</td>
                    <td>{k ? <StatusBadge statusId={k.status} /> : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
