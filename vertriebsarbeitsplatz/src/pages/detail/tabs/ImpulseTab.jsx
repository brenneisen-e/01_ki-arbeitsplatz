import { useState, useMemo } from 'react';
import { getLang } from '../../../utils/langHelper';
import Card from '../../../components/ui/Card';
import { PrioBadge, QuellenBadge } from '../../../components/ui/Badge';
import { formatEur } from '../../../utils/formatters';
import { useMode } from '../../../hooks/useMode';
import useTranslation from '../../../i18n/useTranslation';
import { Shield, Landmark, ShieldCheck, LineChart, CheckCircle, XCircle, ChevronDown, Calendar, Mail, ExternalLink, TrendingUp, ArrowRight, Sparkles } from 'lucide-react';
import AnschreibenModal from '../../../components/ui/AnschreibenModal';
import HerleitungBlock from '../../../components/ui/HerleitungBlocks';
import { interpolateDynamicDates } from '../../../utils/dynamicDates';

// Rekursive Interpolation für strukturierte Daten (Strings, Arrays, Objekte).
// Der Kontext enthält insb. `institut`, damit Banking-Institut-spezifische
// Versicherungspartner im gesamten Lead-Baum konsistent ersetzt werden.
function interpolateDeep(value, ctx) {
  if (typeof value === 'string') return interpolateDynamicDates(value, ctx);
  if (Array.isArray(value)) return value.map(v => interpolateDeep(v, ctx));
  if (value && typeof value === 'object') {
    const out = {};
    for (const k of Object.keys(value)) out[k] = interpolateDeep(value[k], ctx);
    return out;
  }
  return value;
}

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

// ─── Derive Absicherungsstatus directly from Open Finance / Bestand ────────
// A customer's coverage must always reflect what the Finanzübersicht actually
// shows. We therefore compute `vorhanden` / `fremd` from eigeneProdukte,
// fremdProdukte and openFinance.versicherungenFremd instead of relying on a
// hand-curated `absicherung` field (which can drift out of sync).
const ABSICHERUNG_PATTERNS = {
  bu:         /\bbu\b|berufsunf[aä]higkeit|disability/i,
  kfz:        /\bkfz\b|auto|pkw|vollkasko|teilkasko|haftpflicht\s*auto|kfz[-_\s]*fremd/i,
  hausrat:    /hausrat|inhaltsvers/i,
  haftpflicht:/privathaftpflicht|^haftpflicht$|\bhaftpflicht\b(?!\s*auto)/i,
  rlv:        /\brlv\b|risikoleben/i,
  pflege:     /pflege/i,
  unfall:     /unfall/i,
  rechtsschutz:/rechtsschutz/i,
  wohngebaeude:/wohngeb[aä]ude|geb[aä]udevers/i,
};

function productMatches(product, key) {
  const pattern = ABSICHERUNG_PATTERNS[key];
  if (!pattern) return false;
  const text = [product.typ, product.produktart, product.produkt, product.sparte, product.details]
    .filter(Boolean).join(' ');
  return pattern.test(text);
}

function deriveAbsicherung(kunde) {
  const eigen = kunde.eigeneProdukte || [];
  const fremd = kunde.fremdProdukte || [];
  const ofVers = kunde.openFinance?.versicherungenFremd || [];
  const fremdPool = [...fremd, ...ofVers];
  const result = { vorhanden: [], fremd: [], fehlend: [] };
  Object.keys(ABSICHERUNG_PATTERNS).forEach(key => {
    const inEigen = eigen.some(p => productMatches(p, key));
    const inFremd = fremdPool.some(p => productMatches(p, key));
    if (inEigen) result.vorhanden.push(key);
    else if (inFremd) result.fremd.push(key);
    else result.fehlend.push(key);
  });
  return result;
}

// Produkt-Kategorien nach denen die Leads/Potenziale geclustert werden.
// Die Reihenfolge ist die Anzeige-Reihenfolge.
const PRODUKT_KATEGORIEN = [
  { key: 'bank',          label: 'Bankprodukte',          icon: Landmark,    color: '#0f766e' },
  { key: 'versicherung',  label: 'Versicherungsprodukte', icon: ShieldCheck, color: '#b45309' },
  { key: 'anlage',        label: 'Anlageprodukte',        icon: LineChart,   color: '#6d28d9' },
];

// Priorität → numerische Sortier-Reihenfolge
const PRIO_ORDER = { sehr_hoch: 0, kritisch: 1, hoch: 2, mittel: 3, niedrig: 4 };

// Kategorisiert ein Potential anhand seiner Titel/Empfehlung/Beschreibung
function getProduktKategorie(p) {
  const t = ((p.titel || '') + ' ' + (p.produktEmpfehlung || '') + ' ' + (p.beschreibung || '')).toLowerCase();
  if (/versicher|haftpflicht|\brlv\b|\bbu\b|unfall|tierhalter|hausrat|r\+v|berufsunf/.test(t)) return 'versicherung';
  if (/depot|sparplan|uniondepot|union investment|fonds|\betf\b|wertpapier|trade republic|aktien/.test(t)) return 'anlage';
  return 'bank';
}

export default function ImpulseTab({ kunde }) {
  const { t, tn } = useTranslation();
  const { config } = useMode();
  const ctx = { institut: config?.institut };
  // Prefer a derived coverage view so it is always consistent with the
  // Finanzübersicht. The hand-curated `kunde.absicherung` is used only as a
  // fallback if no product data is available at all.
  const absicherung = useMemo(() => {
    const derived = deriveAbsicherung(kunde);
    const hasAnyData = (kunde.eigeneProdukte?.length || 0) + (kunde.fremdProdukte?.length || 0) + (kunde.openFinance?.versicherungenFremd?.length || 0) > 0;
    if (hasAnyData) return derived;
    return kunde.absicherung || { vorhanden: [], fremd: [], fehlend: [] };
  }, [kunde]);
  const potentiale = kunde.potentiale || [];
  const luecken = absicherung.fehlend?.length || 0;
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [anschreibenFor, setAnschreibenFor] = useState(null);

  // Gruppiere alle Potenziale nach Produktkategorie und sortiere innerhalb
  // jeder Gruppe nach Priorität (sehr_hoch → kritisch → hoch → mittel → niedrig).
  const gruppiert = useMemo(() => {
    const g = { bank: [], versicherung: [], anlage: [] };
    potentiale.forEach(p => {
      const kat = getProduktKategorie(p);
      g[kat].push(p);
    });
    Object.keys(g).forEach(k => {
      g[k].sort((a, b) => (PRIO_ORDER[a.prioritaet] ?? 9) - (PRIO_ORDER[b.prioritaet] ?? 9));
    });
    return g;
  }, [potentiale]);

  return (
    <div className="space-y-4">
      {/* Absicherungsstatus */}
      <Card hover={false}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield size={20} className="text-slate-500" strokeWidth={1.75} />
            <h3 className="font-semibold text-slate-800">{t('absicherungsstatus')}</h3>
          </div>
          <span className="text-sm text-slate-400">{t('lueckenErkannt', { count: luecken })}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {ABSICHERUNGS_TYPEN.map(typ => {
            const eigen = absicherung.vorhanden?.includes(typ.key);
            const fremd = absicherung.fremd?.includes(typ.key);
            return (
              <div
                key={typ.key}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${
                  eigen
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : fremd
                      ? 'bg-slate-100 text-slate-500 border border-slate-200'
                      : 'bg-red-50 text-red-600 border border-red-200'
                }`}
              >
                {eigen ? <CheckCircle size={14} /> : fremd ? <CheckCircle size={14} className="text-slate-400" /> : <XCircle size={14} />}
                {t(`absicherung.${typ.key}`)}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Leads / Potenziale geclustert nach Produktkategorie */}
      {PRODUKT_KATEGORIEN.map(kat => {
        const list = gruppiert[kat.key] || [];
        if (list.length === 0) return null;
        const Icon = kat.icon;
        return (
          <Card key={kat.key} hover={false}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Icon size={20} style={{ color: kat.color }} strokeWidth={1.75} />
                <h3 className="font-semibold text-slate-800">{kat.label}</h3>
              </div>
              <span className="text-sm text-slate-400">{list.length} Potentiale</span>
            </div>
            <div className="space-y-3">
              {list.map((p, i) => {
                const key = `${kat.key}-${i}`;
                return (
                  <PotentialCard
                    key={key}
                    potential={p}
                    kunde={kunde}
                    expanded={expandedIndex === key}
                    onToggle={() => setExpandedIndex(expandedIndex === key ? null : key)}
                    onAnschreiben={() => setAnschreibenFor(p)}
                    t={t}
                    ctx={ctx}
                  />
                );
              })}
            </div>
          </Card>
        );
      })}

      {anschreibenFor && (
        <AnschreibenModal
          kunde={kunde}
          potential={anschreibenFor}
          onClose={() => setAnschreibenFor(null)}
        />
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

function PotentialCard({ potential: p, kunde, expanded, onToggle, onAnschreiben, t, ctx = {} }) {
  const { config } = useMode();

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
        <p className="text-sm text-slate-500">{interpolateDynamicDates(p.beschreibung, ctx)}</p>
      </div>

      {/* Expandable detail section */}
      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50/50 p-4 space-y-5 animate-fade-in">
          {/* KI-Zusammenfassung */}
          {p.kiDescription && (
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={14} className="text-indigo-500" />
                <span className="text-xs font-semibold text-indigo-600">{t('kiZusammenfassung')}</span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">{interpolateDynamicDates(p.kiDescription, ctx)}</p>
            </div>
          )}

          {/* Strukturierte Visualisierungen (Liquiditätsverlauf, Deckungslücke, …) */}
          {p.herleitungBlocks && p.herleitungBlocks.length > 0 && (
            <div className="space-y-3">
              {p.herleitungBlocks.map((block, i) => (
                <HerleitungBlock key={i} block={block} />
              ))}
            </div>
          )}

          {/* Herleitung */}
          {p.herleitung && p.herleitung.length > 0 && (
            <div>
              <h5 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">
                {t('herleitungDesImpulses')}
              </h5>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {p.herleitung.map((h, i) => (
                  <HerleitungRow key={i} label={interpolateDynamicDates(h.label, ctx)} value={h.value} ctx={ctx} />
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

          {/* Einzelne Versicherungen: Bisher vs. Neu inkl. Bewertungs-Score */}
          {p.einzelVergleiche && p.einzelVergleiche.length > 0 && (
            <EinzelVergleiche einzelVergleiche={interpolateDeep(p.einzelVergleiche, ctx)} />
          )}

          {/* Vergleichstabelle */}
          {p.vergleich && (
            <VergleichsTabelle data={interpolateDeep(p.vergleich, ctx)} />
          )}

          {/* Aktionen */}
          <div>
            <h5 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">
              {t('aktionen')}
            </h5>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); onAnschreiben?.(); }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-white transition-colors"
                style={{ backgroundColor: config.colors.primary }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = config.colors.primaryLight}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = config.colors.primary}
              >
                <Sparkles size={14} />
                Anschreiben formulieren
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

function HerleitungRow({ label, value, ctx }) {
  return (
    <div className="bg-white rounded-lg px-3 py-2 border border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition-colors">
      <span className="text-xs text-slate-400 block">{label}</span>
      <span className="text-slate-700 font-medium">{typeof value === 'string' ? interpolateDynamicDates(value, ctx) : value}</span>
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
      <Card hover={false} className="space-y-4">
        {/* Key numbers */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-slate-50 rounded-lg p-3 metric-box">
            <div className="text-xs text-slate-400 mb-1">{gehaltLabel}</div>
            <div className="text-lg font-bold text-slate-800">{gehalt.toLocaleString(getLang() === 'en' ? 'en-US' : 'de-DE')}{einheit?.replace('€/mtl.', '€')}</div>
            <div className="text-xs text-slate-400">/mtl.</div>
          </div>
          <div className="bg-red-50 rounded-lg p-3 metric-box">
            <div className="text-xs text-red-400 mb-1">{absicherungLabel}</div>
            <div className="text-lg font-bold text-red-600">{aktuelleAbsicherung.toLocaleString(getLang() === 'en' ? 'en-US' : 'de-DE')}€</div>
            <div className="text-xs text-red-400">/mtl. ({pctAbgesichert}%)</div>
          </div>
          <div className="bg-emerald-50 rounded-lg p-3 metric-box">
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
      </Card>
    </div>
  );
}

function ScoreBadge({ score }) {
  const color = score >= 85 ? { bg: 'bg-emerald-50', text: 'text-emerald-700', bar: '#10b981' }
             : score >= 70 ? { bg: 'bg-lime-50', text: 'text-lime-700', bar: '#84cc16' }
             : score >= 55 ? { bg: 'bg-amber-50', text: 'text-amber-700', bar: '#f59e0b' }
             : { bg: 'bg-red-50', text: 'text-red-700', bar: '#ef4444' };
  return (
    <div className="inline-flex items-center gap-2">
      <div className="w-16 h-1.5 rounded-full bg-slate-200 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${score}%`, background: color.bar }} />
      </div>
      <span className={`rh-badge text-[11px] font-bold px-2 py-0.5 rounded-full ${color.bg} ${color.text}`}>{score}</span>
    </div>
  );
}

function EinzelVergleiche({ einzelVergleiche }) {
  return (
    <div className="space-y-4">
      <h5 className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Einzelvergleich pro Versicherung</h5>
      {einzelVergleiche.map((v, idx) => {
        const delta = (v.neu?.score ?? 0) - (v.bisher?.score ?? 0);
        const alleMerkmale = Array.from(new Set([
          ...(v.bisher?.merkmale || []).map(m => m.label),
          ...(v.neu?.merkmale || []).map(m => m.label),
        ]));
        const bisherMap = Object.fromEntries((v.bisher?.merkmale || []).map(m => [m.label, m.wert]));
        const neuMap = Object.fromEntries((v.neu?.merkmale || []).map(m => [m.label, m.wert]));
        return (
          <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden bg-white">
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Shield size={15} className="text-slate-500" />
                <span className="text-sm font-semibold text-slate-700">{v.titel}</span>
              </div>
              {delta !== 0 && (
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  delta > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {delta > 0 ? `+${delta}` : delta} Punkte Bewertung
                </span>
              )}
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white border-b border-slate-100">
                  <th className="px-4 py-2 text-left text-xs uppercase tracking-wider font-semibold text-slate-400 w-1/3">Merkmal</th>
                  <th className="px-4 py-2 text-left text-xs uppercase tracking-wider font-semibold text-slate-500">Bisher — {v.bisher?.anbieter || '–'}</th>
                  <th className="px-4 py-2 text-left text-xs uppercase tracking-wider font-semibold text-emerald-700">Neu — {v.neu?.anbieter || '–'}</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-slate-100">
                  <td className="px-4 py-2 text-slate-500 font-medium">Bewertung</td>
                  <td className="px-4 py-2"><ScoreBadge score={v.bisher?.score ?? 0} /></td>
                  <td className="px-4 py-2"><ScoreBadge score={v.neu?.score ?? 0} /></td>
                </tr>
                <tr className="border-t border-slate-100 bg-slate-50/40">
                  <td className="px-4 py-2 text-slate-500 font-medium">Prämie</td>
                  <td className="px-4 py-2 font-mono text-slate-700">{v.bisher?.praemie || '–'}</td>
                  <td className="px-4 py-2 font-mono text-emerald-700 font-semibold">{v.neu?.praemie || '–'}</td>
                </tr>
                {alleMerkmale.map((label, i) => (
                  <tr key={label} className={`border-t border-slate-100 ${i % 2 === 0 ? '' : 'bg-slate-50/40'}`}>
                    <td className="px-4 py-2 text-slate-500 font-medium">{label}</td>
                    <td className="px-4 py-2 text-slate-600">{bisherMap[label] || '–'}</td>
                    <td className="px-4 py-2 text-slate-800 font-medium">{neuMap[label] || '–'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {v.fazit && (
              <div className="px-4 py-2.5 bg-emerald-50/60 border-t border-emerald-100 flex items-start gap-2">
                <Sparkles size={13} className="text-emerald-600 mt-0.5 shrink-0" />
                <span className="text-xs text-emerald-800">{v.fazit}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function VergleichsTabelle({ data }) {
  const { titel, spalten, zeilen, fbVergleich } = data;

  return (
    <div>
      <h5 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">
        {titel}
      </h5>
      {/* F&B Rating Vergleich Header */}
      {fbVergleich && (
        <div className="flex items-center gap-4 mb-3 p-3 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200">
          <img
            src="https://img.logo.dev/franke-bornberg.de?token=pk_H7vb5Y2lTsW47U4Xq-w3HA&size=48&format=png"
            alt="Franke & Bornberg"
            className="w-6 h-6 rounded"
            onError={(e) => e.target.style.display='none'}
          />
          <div className="flex items-center gap-6 flex-1">
            <div className="text-center">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Bisherig</div>
              <div className={`text-lg font-bold ${fbVergleich.alt >= 75 ? 'text-emerald-600' : fbVergleich.alt >= 55 ? 'text-amber-600' : 'text-red-600'}`}>
                {fbVergleich.alt}
              </div>
              <div className="text-[10px] text-slate-400">{fbVergleich.altKlasse}</div>
            </div>
            <ArrowRight size={16} className="text-slate-300" />
            <div className="text-center">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Empfehlung</div>
              <div className={`text-lg font-bold ${fbVergleich.neu >= 75 ? 'text-emerald-600' : fbVergleich.neu >= 55 ? 'text-amber-600' : 'text-red-600'}`}>
                {fbVergleich.neu}
              </div>
              <div className="text-[10px] text-slate-400">{fbVergleich.neuKlasse}</div>
            </div>
            {fbVergleich.neu > fbVergleich.alt && (
              <span className="ml-auto text-xs font-medium px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                +{fbVergleich.neu - fbVergleich.alt} Punkte
              </span>
            )}
          </div>
        </div>
      )}
      <Card hover={false} padding={false} className="overflow-hidden">
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
                className={`border-t border-slate-100 ${i % 2 === 1 ? 'bg-slate-50/50' : ''} ${z.isFbRating ? 'bg-blue-50/30' : ''}`}
              >
                <td className="px-4 py-2.5 text-slate-600 font-medium">
                  <span className="flex items-center gap-1.5">
                    {z.isFbRating && (
                      <img
                        src="https://img.logo.dev/franke-bornberg.de?token=pk_H7vb5Y2lTsW47U4Xq-w3HA&size=24&format=png"
                        alt="F&B"
                        className="w-3.5 h-3.5 rounded"
                        onError={(e) => e.target.style.display='none'}
                      />
                    )}
                    {z.merkmal}
                  </span>
                </td>
                <td className={`px-4 py-2.5 ${z.isFbRating ? 'font-bold' : ''} text-slate-500`}>
                  {z.isFbRating ? (
                    <span className={parseInt(z.aktuell) >= 75 ? 'text-emerald-600' : parseInt(z.aktuell) >= 55 ? 'text-amber-600' : 'text-red-600'}>
                      {z.aktuell}
                    </span>
                  ) : z.aktuell}
                </td>
                <td className={`px-4 py-2.5 text-right font-medium ${
                  z.highlight ? 'text-emerald-600' : 'text-slate-700'
                }`}>
                  {z.isFbRating ? (
                    <span className={`font-bold ${parseInt(z.angebot) >= 75 ? 'text-emerald-600' : parseInt(z.angebot) >= 55 ? 'text-amber-600' : 'text-red-600'}`}>
                      {z.angebot}
                    </span>
                  ) : z.highlight ? (
                    <span className="font-semibold">{z.angebot}</span>
                  ) : z.angebot}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
