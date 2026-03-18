import { useState } from 'react';
import Card from '../../../components/ui/Card';
import LogoImg from '../../../components/ui/LogoImg';
import { StatusBadge, SparteBadge } from '../../../components/ui/Badge';
import { formatEur } from '../../../utils/formatters';
import { useMode } from '../../../hooks/useMode';
import useTranslation from '../../../i18n/useTranslation';
import { ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';

function ProduktRow({ produkt, modeId, onNavigateKontoumsaetze, t }) {
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const isGiro = produkt.typ === 'girokonto';

  return (
    <>
      <tr
        className="border-t border-slate-100 cursor-pointer transition-colors"
        style={hovered && !expanded ? { backgroundColor: 'var(--mode-primary-light)', color: '#ffffff' } : undefined}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => setExpanded(!expanded)}
      >
        <td className="px-4 py-3 text-sm">
          <div className="flex items-center gap-2">
            <span className={hovered && !expanded ? 'text-white' : 'text-slate-400'}>
              {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </span>
            {produkt.versicherer && <LogoImg name={produkt.versicherer} size={18} />}
            <span className={`font-medium ${hovered && !expanded ? 'text-white' : 'text-slate-700'}`}>{produkt.produkt}</span>
          </div>
        </td>
        <td className="px-4 py-3 text-sm">
          {hovered && !expanded
            ? <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/20 text-white">{produkt.sparte || '-'}</span>
            : (produkt.sparte ? <SparteBadge sparte={produkt.sparte} /> : '-')
          }
        </td>
        <td className={`px-4 py-3 text-sm ${hovered && !expanded ? 'text-white/90' : 'text-slate-700'}`}>{produkt.details}</td>
        {modeId === 'banking' && (
          <td className={`px-4 py-3 text-sm ${hovered && !expanded ? 'text-white' : ''}`}>
            {produkt.volumen ? <span className={`font-mono ${hovered && !expanded ? 'text-white' : 'text-slate-500'}`}>{formatEur(produkt.volumen)}</span> : '-'}
          </td>
        )}
        <td className={`px-4 py-3 text-sm ${hovered && !expanded ? 'text-white' : ''}`}><span className={`font-mono font-medium ${hovered && !expanded ? 'text-white' : ''}`}>{formatEur(produkt.praemie)}</span></td>
        <td className={`px-4 py-3 text-sm ${hovered && !expanded ? 'text-white/80' : ''}`}>{produkt.seit}</td>
        <td className="px-4 py-3 text-sm">
          {hovered && !expanded
            ? <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/20 text-white">{produkt.status}</span>
            : <StatusBadge status={produkt.status} />
          }
        </td>
      </tr>
      {expanded && (
        <tr className="bg-slate-50/80">
          <td colSpan={modeId === 'banking' ? 7 : 6} className="px-4 py-3">
            <div className="pl-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 uppercase tracking-wider">{t('vertragsbeginn')}</span>
                <div className="font-medium text-slate-700 mt-0.5">{produkt.seit}</div>
              </div>
              <div>
                <span className="text-slate-400 uppercase tracking-wider">{t('status')}</span>
                <div className="mt-0.5"><StatusBadge status={produkt.status} /></div>
              </div>
              <div>
                <span className="text-slate-400 uppercase tracking-wider">{t('sparte')}</span>
                <div className="font-medium text-slate-700 mt-0.5">{produkt.sparte || '-'}</div>
              </div>
              <div>
                <span className="text-slate-400 uppercase tracking-wider">{t('details')}</span>
                <div className="font-medium text-slate-700 mt-0.5">{produkt.details}</div>
              </div>
              {produkt.status === 'optimierbar' && (
                <div className="col-span-2 md:col-span-4 mt-1">
                  <div className="bg-amber-50 border border-amber-200 rounded px-3 py-2 text-amber-800 text-xs">
                    {t('optimierungspotenzial')}
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
                    {t('kontoumsaetzeAnzeigen')}
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

// Replace the base institut name in product names with the currently selected institut
const INSTITUT_REPLACEMENTS = {
  versicherung: 'ERGO',
  banking: 'VR',
};

function adaptProduktName(name, modeId, institut) {
  if (!institut || !name) return name;
  const baseInstitut = INSTITUT_REPLACEMENTS[modeId];
  if (!baseInstitut) return name;
  // Extract short name for replacement (e.g., "Allianz" from "Allianz", "Zukunftsversicherung" etc.)
  const shortInstitut = institut.split(' ')[0];
  if (shortInstitut === baseInstitut) return name;
  return name.replace(new RegExp(baseInstitut, 'g'), shortInstitut);
}

export default function VertraegeTab({ kunde }) {
  const { t } = useTranslation();
  const { modeId, setActiveTab, config } = useMode();
  const institut = config?.institut;
  const produkte = (kunde.eigeneProdukte || []).map(p => ({
    ...p,
    produkt: adaptProduktName(p.produkt, modeId, institut),
  }));

  const praemieLabel = modeId === 'banking' ? t('jahreskosten') : modeId === 'vermoegensverwaltung' ? t('volumenLabel') : t('gesamtpraemie').replace('/J.', '') + '/J.';
  const sumLabel = modeId === 'banking' ? t('gesamtkostenJ') : modeId === 'vermoegensverwaltung' ? t('gesamtvolumen') : t('gesamtpraemie');

  return (
    <div className="space-y-4">
      <Card hover={false}>
        <h3 className="font-semibold text-slate-800 mb-4">
          {t('eigeneProdukte')} ({produkte.length} {modeId === 'banking' ? t('produkteLabel') : t('vertraege')})
        </h3>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden" style={{ boxShadow: 'var(--card-shadow)' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wider font-semibold text-slate-400">{t('produkt')}</th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wider font-semibold text-slate-400">{t('sparte')}</th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wider font-semibold text-slate-400">{t('tarifDetails')}</th>
                  {modeId === 'banking' && (
                    <th className="px-4 py-3 text-left text-xs uppercase tracking-wider font-semibold text-slate-400">{t('volumenLabel')}</th>
                  )}
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wider font-semibold text-slate-400">{praemieLabel}</th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wider font-semibold text-slate-400">{t('seit')}</th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wider font-semibold text-slate-400">{t('status')}</th>
                </tr>
              </thead>
              <tbody>
                {produkte.map((p, i) => (
                  <ProduktRow
                    key={p.id || i}
                    produkt={p}
                    modeId={modeId}
                    onNavigateKontoumsaetze={p.typ === 'girokonto' ? () => setActiveTab('finanzprofil') : null}
                    t={t}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold text-slate-800 mb-4">{t('vertragszusammenfassung')}</h3>
        <div className="grid grid-cols-3 gap-6">
          <SummaryItem label={sumLabel} value={formatEur(produkte.reduce((s, p) => s + (p.praemie || 0), 0))} />
          <SummaryItem label={modeId === 'banking' ? t('anzahlProdukte') : t('anzahlVertraege')} value={produkte.length} />
          <SummaryItem label={t('optimierbar')} value={produkte.filter(p => p.status === 'optimierbar').length} highlight />
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
