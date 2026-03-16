import { useState } from 'react';
import Card from '../../../components/ui/Card';
import LogoImg from '../../../components/ui/LogoImg';
import { StatusBadge, SparteBadge } from '../../../components/ui/Badge';
import { formatEur } from '../../../utils/formatters';
import { useMode } from '../../../hooks/useMode';
import { ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';

function ProduktRow({ produkt, modeId, onNavigateKontoumsaetze }) {
  const [expanded, setExpanded] = useState(false);
  const isGiro = produkt.typ === 'girokonto';

  return (
    <>
      <tr
        className="border-t border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <td className="px-4 py-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">
              {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </span>
            {produkt.versicherer && <LogoImg name={produkt.versicherer} size={18} />}
            <span className="font-medium text-slate-700">{produkt.produkt}</span>
          </div>
        </td>
        <td className="px-4 py-3 text-sm">{produkt.sparte ? <SparteBadge sparte={produkt.sparte} /> : '-'}</td>
        <td className="px-4 py-3 text-sm text-slate-700">{produkt.details}</td>
        {modeId === 'banking' && (
          <td className="px-4 py-3 text-sm">
            {produkt.volumen ? <span className="font-mono text-slate-500">{formatEur(produkt.volumen)}</span> : '-'}
          </td>
        )}
        <td className="px-4 py-3 text-sm"><span className="font-mono font-medium">{formatEur(produkt.praemie)}</span></td>
        <td className="px-4 py-3 text-sm">{produkt.seit}</td>
        <td className="px-4 py-3 text-sm"><StatusBadge status={produkt.status} /></td>
      </tr>
      {expanded && (
        <tr className="bg-slate-50/80">
          <td colSpan={modeId === 'banking' ? 7 : 6} className="px-4 py-3">
            <div className="pl-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 uppercase tracking-wider">Vertragsbeginn</span>
                <div className="font-medium text-slate-700 mt-0.5">{produkt.seit}</div>
              </div>
              <div>
                <span className="text-slate-400 uppercase tracking-wider">Status</span>
                <div className="mt-0.5"><StatusBadge status={produkt.status} /></div>
              </div>
              <div>
                <span className="text-slate-400 uppercase tracking-wider">Sparte</span>
                <div className="font-medium text-slate-700 mt-0.5">{produkt.sparte || '-'}</div>
              </div>
              <div>
                <span className="text-slate-400 uppercase tracking-wider">Details</span>
                <div className="font-medium text-slate-700 mt-0.5">{produkt.details}</div>
              </div>
              {produkt.status === 'optimierbar' && (
                <div className="col-span-2 md:col-span-4 mt-1">
                  <div className="bg-amber-50 border border-amber-200 rounded px-3 py-2 text-amber-800 text-xs">
                    Optimierungspotenzial erkannt — Tarifaktualisierung empfohlen
                  </div>
                </div>
              )}
              {isGiro && onNavigateKontoumsaetze && (
                <div className="col-span-2 md:col-span-4 mt-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); onNavigateKontoumsaetze(); }}
                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded transition-colors hover:bg-blue-100 text-blue-600 bg-blue-50 border border-blue-200"
                  >
                    <ExternalLink size={12} />
                    Kontoumsätze anzeigen
                  </button>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function VertraegeTab({ kunde }) {
  const { modeId, setActiveTab } = useMode();
  const produkte = kunde.eigeneProdukte || [];

  const praemieLabel = modeId === 'banking' ? 'Jahreskosten' : modeId === 'vermoegensverwaltung' ? 'Volumen' : 'Prämie/J.';
  const sumLabel = modeId === 'banking' ? 'Gesamtkosten/J.' : modeId === 'vermoegensverwaltung' ? 'Gesamtvolumen' : 'Gesamtprämie/J.';

  return (
    <div className="space-y-4">
      <Card>
        <h3 className="font-semibold text-slate-800 mb-4">
          Eigene Produkte ({produkte.length} {modeId === 'banking' ? 'Produkte' : 'Verträge'})
        </h3>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden" style={{ boxShadow: 'var(--card-shadow)' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wider font-semibold text-slate-400">Produkt</th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wider font-semibold text-slate-400">Sparte</th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wider font-semibold text-slate-400">Tarif / Details</th>
                  {modeId === 'banking' && (
                    <th className="px-4 py-3 text-left text-xs uppercase tracking-wider font-semibold text-slate-400">Volumen</th>
                  )}
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wider font-semibold text-slate-400">{praemieLabel}</th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wider font-semibold text-slate-400">Seit</th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wider font-semibold text-slate-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {produkte.map((p, i) => (
                  <ProduktRow
                    key={p.id || i}
                    produkt={p}
                    modeId={modeId}
                    onNavigateKontoumsaetze={p.typ === 'girokonto' ? () => setActiveTab('finanzprofil') : null}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold text-slate-800 mb-4">Vertragszusammenfassung</h3>
        <div className="grid grid-cols-3 gap-6">
          <SummaryItem label={sumLabel} value={formatEur(produkte.reduce((s, p) => s + (p.praemie || 0), 0))} />
          <SummaryItem label={modeId === 'banking' ? 'Anzahl Produkte' : 'Anzahl Verträge'} value={produkte.length} />
          <SummaryItem label="Optimierbar" value={produkte.filter(p => p.status === 'optimierbar').length} highlight />
        </div>
      </Card>
    </div>
  );
}

function SummaryItem({ label, value, highlight }) {
  return (
    <div>
      <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">{label}</div>
      <div className={`font-mono text-2xl font-bold ${highlight ? 'text-amber-600' : 'text-slate-800'}`}>{value}</div>
    </div>
  );
}
