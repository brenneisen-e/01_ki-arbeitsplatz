import { useMemo } from 'react';
import { Download, FileSpreadsheet, FileText, Key, AlertTriangle, ShieldCheck, CheckCircle2, FileX } from 'lucide-react';
import { useSmartIcs } from '../../hooks/useSmartIcs';
import { useInstitut } from '../../hooks/useInstitut';
import { RISIKO_KATEGORIEN } from '../../data/risikoKatalog';
import { exportRkmCsv, exportRkmPdf, buildRkmRows, buildExportSummary } from '../../utils/exportRkm';

function getKategorie(id) { return RISIKO_KATEGORIEN.find(k => k.id === id); }

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

function VerteilungChart({ session }) {
  const data = useMemo(() => {
    const counts = {};
    Object.values(session.risikoCandidates).flat().filter(r => r.selected).forEach(r => {
      counts[r.kategorie] = (counts[r.kategorie] || 0) + 1;
    });
    return Object.entries(counts).map(([k, v]) => {
      const kat = getKategorie(k);
      return { label: kat?.name?.split(' ')[0] || k, value: v, color: kat?.color || '#94A3B8' };
    });
  }, [session]);

  if (data.length === 0) return null;
  const max = Math.max(...data.map(d => d.value), 1);
  const W = 600, H = 200, pad = 40;

  return (
    <div className="card-base p-5">
      <div className="text-sm font-semibold mb-1">Risikoverteilung nach Risikoart</div>
      <div className="text-xs text-slate-500 mb-3">Anzahl ausgewählter Risiken</div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H}>
        {(() => {
          const bw = (W - pad * 2) / data.length;
          return data.map((d, i) => {
            const h = (d.value / max) * (H - pad - 30);
            const x = pad + i * bw + bw * 0.15;
            const y = H - 30 - h;
            return (
              <g key={d.label}>
                <rect x={x} y={y} width={bw * 0.7} height={h} fill={d.color} rx={4} opacity={0.85} />
                <text x={x + bw * 0.35} y={y - 6} textAnchor="middle" fontSize={11} fontWeight={600} fill="#0F172A">{d.value}</text>
                <text x={x + bw * 0.35} y={H - 12} textAnchor="middle" fontSize={11} fill="#64748B">{d.label}</text>
              </g>
            );
          });
        })()}
        <line x1={pad} y1={H - 30} x2={W - pad} y2={H - 30} stroke="#CBD5E1" />
      </svg>
    </div>
  );
}

function TierChart({ summary }) {
  const total = summary.tierCount.high + summary.tierCount.mid + summary.tierCount.low;
  if (total === 0) return null;
  const segments = [
    { tier: 'high', label: 'Hoch', value: summary.tierCount.high, color: '#DC2626' },
    { tier: 'mid',  label: 'Mittel', value: summary.tierCount.mid, color: '#D97706' },
    { tier: 'low',  label: 'Gering', value: summary.tierCount.low, color: '#059669' },
  ];
  return (
    <div className="card-base p-5">
      <div className="text-sm font-semibold mb-1">Verteilung nach Risiko-Tier</div>
      <div className="text-xs text-slate-500 mb-3">Heatmap-Klassifizierung</div>
      <div className="flex items-stretch gap-2 mb-3 h-6 rounded-md overflow-hidden">
        {segments.map(s => (
          <div
            key={s.tier}
            style={{ flex: s.value, background: s.color, minWidth: s.value > 0 ? 12 : 0 }}
            title={`${s.label}: ${s.value}`}
          />
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
  const { session } = useSmartIcs();
  const { institut } = useInstitut();

  if (!session) {
    return (
      <div className="card-base p-10 text-center">
        <FileX size={36} className="mx-auto text-slate-300 mb-3" />
        <div className="text-base font-semibold mb-1">Noch keine RKM erstellt</div>
        <div className="text-sm text-slate-500 mb-4 max-w-md mx-auto">
          Starten Sie den Smart-ICS-Workflow, um eine Risiko-Kontroll-Matrix zu erzeugen.
        </div>
        <button
          onClick={onStartWorkflow}
          className="px-4 py-2 rounded-lg text-white text-sm font-semibold inline-flex items-center gap-2"
          style={{ background: 'var(--mode-primary, #0F4D2A)' }}
        >
          <ShieldCheck size={16} /> Workflow starten
        </button>
      </div>
    );
  }

  const rows = buildRkmRows(session);
  const summary = buildExportSummary(session);

  return (
    <div className="space-y-5">
      <div className="card-base p-5 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="text-xs text-slate-500">Risiko-Kontroll-Matrix</div>
          <div className="text-lg font-semibold">{session.name}</div>
          <div className="text-xs text-slate-500 mt-1">
            {session.beschreibung} · erstellt am {new Date(session.createdAt).toLocaleDateString('de-DE')}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportRkmCsv(session)}
            className="px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-sm font-medium inline-flex items-center gap-2"
          >
            <FileSpreadsheet size={16} className="text-emerald-700" /> CSV
          </button>
          <button
            onClick={() => exportRkmPdf(session, institut)}
            className="px-3 py-2 rounded-lg text-white text-sm font-semibold inline-flex items-center gap-2"
            style={{ background: 'var(--mode-primary, #0F4D2A)' }}
          >
            <Download size={16} /> PDF Export
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-3">
        <StatCard label="Risiken" value={summary.risikoCount} sub="ausgewählt & beschrieben" icon={AlertTriangle} color="#DC2626" />
        <StatCard label="Schlüsselkontrollen" value={summary.keyControls} sub={`über ${summary.rowCount} Zuordnungen`} icon={Key} color="#1D7B3F" />
        <StatCard label="Coverage" value={`${summary.risikoCount ? Math.round((summary.keyControls / summary.risikoCount) * 100) : 0} %`} sub="Risiken mit Schlüsselkontrolle" icon={CheckCircle2} color="#0F4D2A" />
        <StatCard label="Lücken" value={summary.ohneKontrolle} sub="Risiken ohne Kontrolle" icon={FileX} color="#B91C1C" />
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <VerteilungChart session={session} />
        <TierChart summary={summary} />
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
                <th>Aktivität</th>
                <th>Risikoart</th>
                <th>Risikobeschreibung</th>
                <th>EW / Schaden</th>
                <th>Tier</th>
                <th>Kontrolle</th>
                <th>Art / Frequenz</th>
                <th>Verantwortlich</th>
                <th style={{ width: 70 }}>Key</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td>{r.aktivitaet}</td>
                  <td>
                    <div className="text-[12px] font-semibold">{r.risikoart}</div>
                    <div className="text-[11px] text-slate-500">{r.risikoUnterart}</div>
                  </td>
                  <td className="text-[12px]">{r.risikoBeschreibung}</td>
                  <td className="text-[12px] whitespace-nowrap">
                    <div>{r.eintrittsW}</div>
                    <div className="text-slate-500">{r.schaden}</div>
                  </td>
                  <td>
                    <span className={`chip ${r.tier === 'high' ? 'risk-tier-high' : r.tier === 'mid' ? 'risk-tier-mid' : 'risk-tier-low'}`}>
                      {r.tier === 'high' ? 'Hoch' : r.tier === 'mid' ? 'Mittel' : 'Gering'}
                    </span>
                  </td>
                  <td>
                    <div className="text-[12px] font-semibold">{r.kontrolle || '—'}</div>
                    <div className="text-[11px] text-slate-500 line-clamp-2">{r.kontrolleBeschreibung === 'KEINE KONTROLLE' ? '⚠ keine Kontrolle hinterlegt' : r.kontrolleBeschreibung}</div>
                  </td>
                  <td className="text-[11px]">
                    {r.kontrolleArt && <div>{r.kontrolleArt} · {r.kontrolleTyp}</div>}
                    {r.kontrolleFrequenz && <div className="text-slate-500">{r.kontrolleFrequenz}</div>}
                  </td>
                  <td className="text-[12px]">{r.kontrolleWer || '—'}</td>
                  <td>
                    {r.isKey ? (
                      <span className="chip selected"><Key size={11} /> Key</span>
                    ) : r.kontrolle ? (
                      <span className="chip">—</span>
                    ) : (
                      <span className="chip" style={{ background: '#FEE2E2', color: '#991B1B', borderColor: '#FCA5A5' }}>Lücke</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
