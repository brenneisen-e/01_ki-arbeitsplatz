import { useState, useMemo } from 'react';
import { getLang } from '../../../utils/langHelper';
import Card from '../../../components/ui/Card';
import { PrioBadge, QuellenBadge } from '../../../components/ui/Badge';
import { formatEur } from '../../../utils/formatters';
import { useMode } from '../../../hooks/useMode';
import useTranslation from '../../../i18n/useTranslation';
import { Shield, Zap, RefreshCw, CheckCircle, XCircle, ChevronDown, Calendar, User, ExternalLink, TrendingUp, ArrowRight } from 'lucide-react';

const ABSICHERUNGS_TYPEN = [
  { key: 'bu' },
  { key: 'kfz' },
  { key: 'hausrat' },
  { key: 'haftpflicht' },
  { key: 'rlv' },
  { key: 'pflege' },
  { key: 'unfall' },
  { key: 'rechtsschutz' },
  { key: 'wohngebaeude' },
];

export default function ImpulseTab({ kunde }) {
  const { t, tn } = useTranslation();
  const absicherung = kunde.absicherung || { vorhanden: [], fehlend: [] };
  const potentiale = kunde.potentiale || [];
  const whitespots = useMemo(() => potentiale.filter(p => p.typ === 'whitespot'), [potentiale]);
  const anpassungen = useMemo(() => potentiale.filter(p => p.typ === 'anpassung'), [potentiale]);
  const crossSell = useMemo(() => potentiale.filter(p => p.typ === 'cross_sell' || p.typ === 'konsolidierung' || p.typ === 'nextgen' || p.typ === 'beratung'), [potentiale]);
  const luecken = absicherung.fehlend?.length || 0;
  const [expandedIndex, setExpandedIndex] = useState(null);

  return (
    <div className="space-y-4">
      {/* Absicherungsstatus */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield size={20} className="text-slate-500" strokeWidth={1.75} />
            <h3 className="font-semibold text-slate-800">{t('absicherungsstatus')}</h3>
          </div>
          <span className="text-sm text-slate-400">{t('lueckenErkannt', { count: luecken })}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {ABSICHERUNGS_TYPEN.map(typ => {
            const vorhanden = absicherung.vorhanden?.some(v => v.includes(typ.key));
            return (
              <div
                key={typ.key}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${
                  vorhanden
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-red-50 text-red-600 border border-red-200'
                }`}
              >
                {vorhanden ? <CheckCircle size={14} /> : <XCircle size={14} />}
                {t(`absicherung.${typ.key}`)}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Whitespots (Neugeschaeft) */}
      {whitespots.length > 0 && (
        <Card hover={false}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap size={20} style={{ color: 'var(--mode-primary-light)' }} strokeWidth={1.75} />
              <h3 className="font-semibold text-slate-800">{t('whitespotsNeugeschaeft')}</h3>
            </div>
            <span className="text-sm text-slate-400">{whitespots.length} Potentiale</span>
          </div>
          <div className="space-y-3">
            {whitespots.map((p, i) => {
              const key = `ws-${i}`;
              return (
                <PotentialCard
                  key={key}
                  potential={p}
                  kunde={kunde}
                  expanded={expandedIndex === key}
                  onToggle={() => setExpandedIndex(expandedIndex === key ? null : key)}
                  t={t}
                />
              );
            })}
          </div>
        </Card>
      )}

      {/* Anpassungsbedarfe */}
      {anpassungen.length > 0 && (
        <Card hover={false}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <RefreshCw size={20} className="text-amber-500" strokeWidth={1.75} />
              <h3 className="font-semibold text-slate-800">{t('anpassungsbedarfe')}</h3>
            </div>
            <span className="text-sm text-slate-400">{anpassungen.length} Potentiale</span>
          </div>
          <div className="space-y-3">
            {anpassungen.map((p, i) => {
              const key = `an-${i}`;
              return (
                <PotentialCard
                  key={key}
                  potential={p}
                  kunde={kunde}
                  expanded={expandedIndex === key}
                  onToggle={() => setExpandedIndex(expandedIndex === key ? null : key)}
                  t={t}
                />
              );
            })}
          </div>
        </Card>
      )}

      {/* Cross-Sell / Sonstiges */}
      {crossSell.length > 0 && (
        <Card hover={false}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">{t('weiterePotentiale')}</h3>
            <span className="text-sm text-slate-400">{crossSell.length} Potentiale</span>
          </div>
          <div className="space-y-3">
            {crossSell.map((p, i) => {
              const key = `cs-${i}`;
              return (
                <PotentialCard
                  key={key}
                  potential={p}
                  kunde={kunde}
                  expanded={expandedIndex === key}
                  onToggle={() => setExpandedIndex(expandedIndex === key ? null : key)}
                  t={t}
                />
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

function quellenLabel(quellen, t) {
  const map = {
    bestand: t('bestandsanalyse'),
    lebensereignis: t('lebensereignis'),
    finanztransaktion: t('openFinanceFida'),
    wettbewerb: t('wettbewerbsanalyse'),
    kommunikation: t('kommunikationsanalyse'),
  };
  return (quellen || []).map(q => map[q] || q).join(' + ');
}

function PotentialCard({ potential: p, kunde, expanded, onToggle, t }) {
  const { config, navigateTo } = useMode();

  return (
    <div
      className={`border rounded-lg transition-all ${expanded ? 'border-slate-300 shadow-sm' : 'border-slate-100 hover:border-slate-200'}`}
    >
      {/* Clickable header */}
      <div
        className="p-4 cursor-pointer row-hover rounded-t-lg"
        onClick={onToggle}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-slate-800">{p.titel}</h4>
            <div className="flex gap-1 mt-1">
              {p.quellen?.map((q, i) => <QuellenBadge key={i} quelle={q} />)}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <PrioBadge prioritaet={p.prioritaet} />
            <span className="font-mono text-sm font-medium text-slate-700">
              {p.volumen > 0 ? formatEur(p.volumen) : '-'}
              {p.volumenTyp === 'jaehrlich' && '/J.'}
              {p.volumenTyp === 'einmalig' && ` ${t('einmalLabel')}`}
            </span>
            <ChevronDown
              size={16}
              className={`text-slate-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
            />
          </div>
        </div>
        <p className="text-sm text-slate-500">{p.beschreibung}</p>
      </div>

      {/* Expandable detail section */}
      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50/50 p-4 space-y-5 animate-fade-in">
          {/* Herleitung */}
          {p.herleitung && p.herleitung.length > 0 && (
            <div>
              <h5 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">
                {t('herleitungDesImpulses')}
              </h5>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {p.herleitung.map((h, i) => (
                  <HerleitungRow key={i} label={h.label} value={h.value} />
                ))}
              </div>
            </div>
          )}

          {/* Fallback herleitung if no structured data */}
          {(!p.herleitung || p.herleitung.length === 0) && (
            <div>
              <h5 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">
                {t('herleitungDesImpulses')}
              </h5>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <HerleitungRow label={t('datenquelle')} value={quellenLabel(p.quellen, t)} />
                <HerleitungRow label={t('kundeLabel')} value={`${tn(kunde.name)} (${kunde.id})`} />
                <HerleitungRow label={t('erkannteSituation')} value={p.beschreibung} />
                <HerleitungRow label={t('empfohlenesProdukt')} value={p.produktEmpfehlung || '–'} />
              </div>
            </div>
          )}

          {/* Deckungslücke Visualization */}
          {p.deckungsluecke && (
            <DeckungslueckeBar data={p.deckungsluecke} t={t} />
          )}

          {/* Vergleichstabelle */}
          {p.vergleich && (
            <VergleichsTabelle data={p.vergleich} />
          )}

          {/* Aktionen */}
          <div>
            <h5 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">
              {t('aktionen')}
            </h5>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); navigateTo('detail', { kundeId: kunde.id, tab: 'stammdaten' }); }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-white transition-colors"
                style={{ backgroundColor: config.colors.primary }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = config.colors.primaryLight}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = config.colors.primary}
              >
                <User size={14} />
                {t('kundeOeffnen')}
              </button>
              <button
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <Calendar size={14} />
                {p.empfohleneAktion === 'termin_vereinbaren' ? t('terminVereinbaren') :
                 p.empfohleneAktion === 'angebot_erstellen' ? t('angebotErstellen') :
                 p.empfohleneAktion === 'tarifvergleich' ? t('tarifvergleichStarten') : t('aktion')}
              </button>
              {p.produktEmpfehlung && (
                <span className="flex items-center gap-1 text-xs text-slate-400 self-center ml-2">
                  <ExternalLink size={12} />
                  {p.produktEmpfehlung}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function HerleitungRow({ label, value }) {
  return (
    <div className="bg-white rounded-lg px-3 py-2 border border-slate-100">
      <span className="text-xs text-slate-400 block">{label}</span>
      <span className="text-slate-700 font-medium">{value}</span>
    </div>
  );
}

function DeckungslueckeBar({ data, t }) {
  const { gehalt, aktuelleAbsicherung, empfohleneAbsicherung, einheit, label } = data;
  const gehaltLabel = data.gehaltLabel || 'Nettoeinkommen';
  const absicherungLabel = data.absicherungLabel || 'Aktuelle Absicherung';
  const pctAbgesichert = gehalt > 0 ? Math.round((aktuelleAbsicherung / gehalt) * 100) : 0;
  const pctEmpfohlen = gehalt > 0 ? Math.round((empfohleneAbsicherung / gehalt) * 100) : 0;
  const luecke = empfohleneAbsicherung - aktuelleAbsicherung;

  return (
    <div>
      <h5 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">
        {label || t('deckungslueckenAnalyse')}
      </h5>
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
        {/* Key numbers */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-slate-50 rounded-lg p-3">
            <div className="text-xs text-slate-400 mb-1">{gehaltLabel}</div>
            <div className="text-lg font-bold text-slate-800">{gehalt.toLocaleString(getLang() === 'en' ? 'en-US' : 'de-DE')}{einheit?.replace('€/mtl.', '€')}</div>
            <div className="text-xs text-slate-400">/mtl.</div>
          </div>
          <div className="bg-red-50 rounded-lg p-3">
            <div className="text-xs text-red-400 mb-1">{absicherungLabel}</div>
            <div className="text-lg font-bold text-red-600">{aktuelleAbsicherung.toLocaleString(getLang() === 'en' ? 'en-US' : 'de-DE')}€</div>
            <div className="text-xs text-red-400">/mtl. ({pctAbgesichert}%)</div>
          </div>
          <div className="bg-emerald-50 rounded-lg p-3">
            <div className="text-xs text-emerald-500 mb-1">{t('empfehlungLabel')}</div>
            <div className="text-lg font-bold text-emerald-700">{empfohleneAbsicherung.toLocaleString(getLang() === 'en' ? 'en-US' : 'de-DE')}€</div>
            <div className="text-xs text-emerald-500">/mtl. ({pctEmpfohlen}%)</div>
          </div>
        </div>

        {/* Visual bar */}
        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>{pctAbgesichert}% {t('abgesichert')}</span>
            <span>{t('zielLabel')}: {pctEmpfohlen}%</span>
          </div>
          <div className="w-full h-6 bg-slate-100 rounded-full relative overflow-hidden">
            {/* Empfohlen (target) */}
            <div
              className="absolute inset-y-0 left-0 bg-emerald-100 rounded-full border-r-2 border-dashed border-emerald-400"
              style={{ width: `${Math.min(pctEmpfohlen, 100)}%` }}
            />
            {/* Aktuell */}
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(pctAbgesichert, 100)}%`,
                background: pctAbgesichert >= pctEmpfohlen
                  ? 'linear-gradient(90deg, #10b981, #34d399)'
                  : pctAbgesichert > 0
                    ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                    : 'linear-gradient(90deg, #ef4444, #f87171)',
              }}
            />
            {/* Label on bar */}
            <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-slate-700">
              {pctAbgesichert > 0 ? `${pctAbgesichert}% ${t('abgesichert')}` : t('keineAbsicherung')}
            </div>
          </div>
        </div>

        {/* Gap callout */}
        {luecke > 0 && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            <TrendingUp size={16} className="text-amber-500 shrink-0" />
            <span className="text-sm text-amber-800">
              <strong>{t('deckungsluecke')}: {luecke.toLocaleString(getLang() === 'en' ? 'en-US' : 'de-DE')}€/mtl.</strong>
              {' '}— {aktuelleAbsicherung === 0 ? t('vollstaendigUngeschuetzt') : t('nurAbgesichert', { pct: pctAbgesichert })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function VergleichsTabelle({ data }) {
  const { titel, spalten, zeilen } = data;

  return (
    <div>
      <h5 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">
        {titel}
      </h5>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50">
              {spalten.map((s, i) => (
                <th
                  key={i}
                  className={`px-4 py-2.5 text-left font-semibold text-slate-600 ${
                    i === 0 ? 'text-slate-500' : ''
                  } ${i === spalten.length - 1 ? 'text-right' : ''}`}
                >
                  {s}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {zeilen.map((z, i) => (
              <tr
                key={i}
                className={`border-t border-slate-100 ${i % 2 === 1 ? 'bg-slate-50/50' : ''}`}
              >
                <td className="px-4 py-2.5 text-slate-600 font-medium">{z.merkmal}</td>
                <td className="px-4 py-2.5 text-slate-500">{z.aktuell}</td>
                <td className={`px-4 py-2.5 text-right font-medium ${
                  z.highlight ? 'text-emerald-600' : 'text-slate-700'
                }`}>
                  {z.highlight && <span className="font-semibold">{z.angebot}</span>}
                  {!z.highlight && z.angebot}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
