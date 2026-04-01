import { useState } from 'react';
import Card from '../../../components/ui/Card';
import LogoImg from '../../../components/ui/LogoImg';
import { StatusBadge, SparteBadge } from '../../../components/ui/Badge';
import { formatEur } from '../../../utils/formatters';
import { useMode } from '../../../hooks/useMode';
import useTranslation from '../../../i18n/useTranslation';
import { ChevronDown, ChevronRight, ExternalLink, Award } from 'lucide-react';

function ProduktRow({ produkt, modeId, onNavigateKontoumsaetze, t }) {
  const [expanded, setExpanded] = useState(false);
  const isGiro = produkt.typ === 'girokonto';

  return (
    <>
      <tr
        className="border-t border-slate-100 cursor-pointer transition-colors row-hover"
        onClick={() => setExpanded(!expanded)}
      >
        <td className="px-4 py-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">
              {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </span>
            {produkt.versicherer && <LogoImg name={produkt.versicherer} size={18} />}
            <span className="font-medium text-slate-700">{produkt.produkt}</span>
          </div>
        </td>
        <td className="px-4 py-3 text-sm">
          {produkt.sparte ? <SparteBadge sparte={produkt.sparte} /> : '-'}
        </td>
        <td className="px-4 py-3 text-sm text-slate-700">{produkt.details}</td>
        {modeId === 'banking' && (
          <td className="px-4 py-3 text-sm">
            {produkt.volumen ? <span className="font-mono text-slate-500">{formatEur(produkt.volumen)}</span> : '-'}
          </td>
        )}
        <td className="px-4 py-3 text-sm"><span className="font-mono font-medium">{formatEur(produkt.praemie)}</span></td>
        <td className="px-4 py-3 text-sm">{produkt.seit}</td>
        <td className="px-4 py-3 text-sm">
          <StatusBadge status={produkt.status} />
        </td>
        <td className="px-4 py-3 text-sm">
          {produkt.fbRating ? (
            <FbRatingBadge rating={produkt.fbRating} klasse={produkt.fbKlasse} />
          ) : (
            <span className="text-slate-300">–</span>
          )}
        </td>
      </tr>
      {expanded && (
        <tr className="bg-slate-50/80">
          <td colSpan={modeId === 'banking' ? 8 : 7} className="px-4 py-3">
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
              {produkt.fbRating && (
                <div className="col-span-2 md:col-span-4 mt-1">
                  <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                    <img src="https://img.logo.dev/franke-bornberg.de?token=pk_H7vb5Y2lTsW47U4Xq-w3HA&size=40&format=png" alt="Franke & Bornberg" className="w-5 h-5 rounded" onError={(e) => e.target.style.display='none'} />
                    <div>
                      <span className="text-xs text-slate-500">{t('fbRatingLabel')}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${produkt.fbRating >= 75 ? 'text-emerald-600' : produkt.fbRating >= 55 ? 'text-amber-600' : 'text-red-600'}`}>
                          {produkt.fbRating}/100
                        </span>
                        <span className="text-xs text-slate-500">{produkt.fbKlasse}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
        <Card hover={false} padding={false} className="overflow-hidden">
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
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wider font-semibold text-slate-400">{t('fbRating')}</th>
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
        </Card>
      </Card>

      <Card hover={false}>
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

function FbRatingBadge({ rating, klasse }) {
  if (!rating) return null;
  const color = rating >= 75 ? 'emerald' : rating >= 55 ? 'amber' : 'red';

  return (
    <div className="flex items-center gap-1.5" title={`Franke & Bornberg: ${rating}/100 – ${klasse || ''}`}>
      <img
        src="https://img.logo.dev/franke-bornberg.de?token=pk_H7vb5Y2lTsW47U4Xq-w3HA&size=32&format=png"
        alt="F&B"
        className="w-3.5 h-3.5 rounded"
        onError={(e) => e.target.style.display='none'}
      />
      <span className={`rh-badge text-xs font-bold px-1.5 py-0.5 rounded ${
        color === 'emerald' ? 'bg-emerald-50 text-emerald-700'
        : color === 'amber' ? 'bg-amber-50 text-amber-700'
        : 'bg-red-50 text-red-600'
      }`}>
        {rating}
      </span>
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
