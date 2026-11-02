import { useState, useMemo, useEffect } from 'react';
import { getLang } from '../../../utils/langHelper';
import Card from '../../../components/ui/Card';
import { PrioBadge, QuellenBadge } from '../../../components/ui/Badge';
import { formatEur } from '../../../utils/formatters';
import { useMode } from '../../../hooks/useMode';
import { findeTopLead, istTopLead } from '../../../utils/topLead';
import useTranslation from '../../../i18n/useTranslation';
import { Shield, Landmark, ShieldCheck, LineChart, CheckCircle, XCircle, ChevronDown, Calendar, Mail, ExternalLink, TrendingUp, ArrowRight, Sparkles, Star } from 'lucide-react';
import AnschreibenModal from '../../../components/ui/AnschreibenModal';
import HerleitungBlock from '../../../components/ui/HerleitungBlocks';
import { KiZusammenfassung, teileHerleitung, DatenquellenLeiste, FaktenPanel, AktionenLeiste } from '../../../components/ui/ImpulsHerleitung';
import { interpolateDynamicDates } from '../../../utils/dynamicDates';
import { getHaustierConfirmation } from '../../../utils/haustierConfirmation';

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
const PRODUKT_KATEGORIEN = [
  { key: 'anlage',        labelKey: 'anlageprodukte',        icon: LineChart },
  { key: 'versicherung',  labelKey: 'versicherungsprodukte', icon: ShieldCheck },
  { key: 'bank',          labelKey: 'bankprodukte',          icon: Landmark },
];

// Anzeige-Reihenfolge je Modus: die eigenen Produkte des Hauses stehen oben,
// in der Bank also die Bankprodukte, im Versicherungsvertrieb die Policen.
const KATEGORIE_REIHENFOLGE = {
  banking: ['bank', 'anlage', 'versicherung'],
  versicherung: ['versicherung', 'bank', 'anlage'],
  vermoegensverwaltung: ['anlage', 'bank', 'versicherung'],
};
function kategorienFuerModus(modeId) {
  const reihenfolge = KATEGORIE_REIHENFOLGE[modeId];
  if (!reihenfolge) return PRODUKT_KATEGORIEN;
  return reihenfolge.map(key => PRODUKT_KATEGORIEN.find(k => k.key === key));
}

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
  const { config, modeId } = useMode();
  const ctx = { institut: config?.institut };
  const kategorien = useMemo(() => kategorienFuerModus(modeId), [modeId]);
  // Der belastbarste neue Lead des Modus trägt im Kopf seiner Karte das Badge
  // „Top-Lead“, dieselbe Regel wie beim KI-Vertriebsassistenten.
  const topLead = useMemo(() => findeTopLead(modeId), [modeId]);
  // Prefer a derived coverage view so it is always consistent with the
  // Finanzübersicht. The hand-curated `kunde.absicherung` is used only as a
  // fallback if no product data is available at all.
  const absicherung = useMemo(() => {
    const derived = deriveAbsicherung(kunde);
    const hasAnyData = (kunde.eigeneProdukte?.length || 0) + (kunde.fremdProdukte?.length || 0) + (kunde.openFinance?.versicherungenFremd?.length || 0) > 0;
    if (hasAnyData) return derived;
    return kunde.absicherung || { vorhanden: [], fremd: [], fehlend: [] };
  }, [kunde]);
  // Haustier-Bestätigung aus den Stammdaten (localStorage). Wird in den
  // Tier-Leads verarbeitet, damit dort statt "Haustier vermutet" der real
  // bestätigte Tiertyp + Name erscheint.
  const [haustierConf, setHaustierConf] = useState(() => getHaustierConfirmation(kunde.id));
  useEffect(() => {
    setHaustierConf(getHaustierConfirmation(kunde.id));
    const onConfirm = (e) => {
      if (e?.detail?.kundeId === kunde.id) {
        setHaustierConf(e.detail.data || null);
      }
    };
    window.addEventListener('kia:haustier-confirmed', onConfirm);
    return () => window.removeEventListener('kia:haustier-confirmed', onConfirm);
  }, [kunde.id]);

  const potentiale = useMemo(() => {
    const raw = kunde.potentiale || [];
    if (!haustierConf?.typ) return raw;
    const art = haustierConf.typ;
    const name = haustierConf.name ? ` „${haustierConf.name}"` : '';
    // Tier-bezogene Leads mit dem bestätigten Tier anreichern.
    return raw.map(p => {
      const hay = `${p.titel || ''} ${p.beschreibung || ''} ${p.produktEmpfehlung || ''}`.toLowerCase();
      if (!/tierhalter|haustier|tierhaftpflicht/i.test(hay)) return p;
      return {
        ...p,
        titel: `Tierhalterhaftpflicht – ${art}${name}`,
        beschreibung: `${art}${name} aus Stammdaten bestätigt – Fressnapf + Tierarzt-Umsätze passen ins Muster.`,
        herleitung: (p.herleitung || []).map(h => {
          if (/Vermutung|Tierart|Haustier/i.test(h.label || '')) {
            return { label: 'Bestätigtes Haustier', value: `${art}${name}` };
          }
          return h;
        }),
      };
    });
  }, [kunde.potentiale, haustierConf]);
  const luecken = absicherung.fehlend?.length || 0;
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [anschreibenFor, setAnschreibenFor] = useState(null);
  // Kategorien standardmäßig aufgeklappt — der Berater sieht beim Öffnen
  // des Tabs sofort die Bank-/Versicherungs-/Anlage-Leads. Wer es ruhiger
  // mag, klappt einzelne Kategorien gezielt zu.
  const [openCategories, setOpenCategories] = useState(() =>
    Object.fromEntries(PRODUKT_KATEGORIEN.map(k => [k.key, true]))
  );

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
      {/* Leads / Potenziale geclustert nach Produktkategorie.
          Kategorie-Cards sind standardmäßig eingeklappt und zeigen nur die
          Anzahl der Leads. Klick öffnet sie zu einem Grid mit bis zu 3
          Tile-Kacheln pro Reihe. In der Versicherungs-Kategorie wird
          zusätzlich der Absicherungsstatus oberhalb der Leads angezeigt. */}
      {kategorien.map(kat => {
        const list = gruppiert[kat.key] || [];
        if (list.length === 0) return null;
        const Icon = kat.icon;
        const isOpen = !!openCategories[kat.key];
        return (
          <Card key={kat.key} hover={false}>
            <button
              type="button"
              className="w-full flex items-center justify-between gap-3 text-left"
              onClick={() => setOpenCategories(s => ({ ...s, [kat.key]: !s[kat.key] }))}
            >
              <div className="flex items-center gap-2">
                <Icon size={20} className="text-(--mode-accent)" strokeWidth={1.75} />
                <h3 className="font-semibold text-(--text-primary)">{t(kat.labelKey)}</h3>
                <span className="ml-1 inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full text-[11px] font-semibold bg-(--bg-inset) text-(--text-secondary) border border-(--border-light)">
                  {list.length}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-(--text-tertiary)">
                  {list.length === 1 ? '1 Lead' : `${list.length} Leads`}
                </span>
                <ChevronDown
                  size={16}
                  className={`text-(--text-tertiary) transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
              </div>
            </button>
            {isOpen && (
              <div className="animate-fade-in">
                {kat.key === 'versicherung' && (
                  <div className="mt-4 rounded-xl surface-inset p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Shield size={16} className="text-(--mode-accent)" strokeWidth={1.75} />
                        <h4 className="text-sm font-semibold text-(--text-primary)">{t('absicherungsstatus')}</h4>
                      </div>
                      <span className="text-xs text-(--text-tertiary)">{t('lueckenErkannt', { count: luecken })}</span>
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
                                ? 'bg-(--tint-success) text-(--color-success)'
                                : fremd
                                  ? 'bg-(--bg-card) text-(--text-secondary) border border-(--border-light)'
                                  : 'bg-(--tint-danger) text-(--color-danger)'
                            }`}
                          >
                            {eigen ? <CheckCircle size={14} /> : fremd ? <CheckCircle size={14} className="text-(--text-tertiary)" /> : <XCircle size={14} />}
                            {t(`absicherung.${typ.key}`)}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {list.map((p, i) => {
                    const key = `${kat.key}-${i}`;
                    const isExpanded = expandedIndex === key;
                    const istTop = istTopLead(p, kunde.id, topLead);
                    return (
                      <div
                        key={key}
                        className={isExpanded ? 'md:col-span-2 lg:col-span-3' : ''}
                        data-praes={istTop ? 'top-lead' : undefined}
                        data-expanded={istTop ? String(isExpanded) : undefined}
                      >
                        <PotentialCard
                          potential={p}
                          topLead={istTop}
                          kunde={kunde}
                          expanded={isExpanded}
                          onToggle={() => setExpandedIndex(isExpanded ? null : key)}
                          onAnschreiben={() => setAnschreibenFor(p)}
                          t={t}
                          ctx={ctx}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
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

function PotentialCard({ potential: p, kunde, expanded, onToggle, onAnschreiben, t, ctx = {}, topLead = false }) {
  return (
    <div
      className={`border rounded-xl transition-colors h-full ${expanded ? 'border-(--mode-primary-light) bg-(--bg-card)' : 'border-(--border-light) bg-(--bg-inset) hover:border-(--border-medium)'}`}
      style={expanded ? { boxShadow: 'var(--card-shadow)' } : undefined}
    >
      {/* Clickable header */}
      <div
        data-praes-toggle
        className="p-4 cursor-pointer row-hover rounded-t-xl"
        onClick={onToggle}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            {/* Kicker über dem Titel: der belastbarste neue Lead des Modus */}
            {topLead && (
              <span
                className="rh-badge inline-flex items-center gap-1 mb-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap"
                style={{ background: 'var(--mode-accent)', color: 'var(--text-on-dark)' }}
                title={t('topLeadHinweis')}
              >
                <Star size={10} strokeWidth={2.25} />
                {t('topLead')}
              </span>
            )}
            <h4 className="text-sm font-semibold text-(--text-primary)">{p.titel}</h4>
            <div className="flex gap-1 mt-1">
              {p.quellen?.map((q, i) => <QuellenBadge key={i} quelle={q} />)}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <PrioBadge prioritaet={p.prioritaet} />
            <span className="font-mono text-sm font-medium text-(--text-primary)">
              {p.volumen > 0 ? formatEur(p.volumen) : '-'}
              {p.volumenTyp === 'jaehrlich' && '/J.'}
              {p.volumenTyp === 'einmalig' && ` ${t('einmalLabel')}`}
            </span>
            <ChevronDown
              size={16}
              className={`text-(--text-tertiary) transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
            />
          </div>
        </div>
        <p className="text-sm text-(--text-secondary)">{interpolateDynamicDates(p.beschreibung, ctx)}</p>
      </div>

      {/* Aufgeklappte Herleitung: links Story und Bloecke, rechts Kennzahlen
          und Aktionen (siehe ImpulsHerleitung.jsx). */}
      {expanded && (() => {
        const herleitung = (p.herleitung || []).map((h) => ({
          label: interpolateDynamicDates(h.label, ctx),
          value: typeof h.value === 'string' ? interpolateDynamicDates(h.value, ctx) : h.value,
        }));
        const { quellen, fakten } = teileHerleitung(herleitung);
        const faktenListe = fakten.length > 0 ? fakten : [
          { label: t('datenquelle'), value: quellenLabel(p.quellen, t) },
          { label: t('erkannteSituation'), value: interpolateDynamicDates(p.beschreibung, ctx) },
          { label: t('empfohlenesProdukt'), value: p.produktEmpfehlung || '–' },
        ];
        const bloecke = p.herleitungBlocks || [];
        const aktionLabel = p.empfohleneAktion === 'termin_vereinbaren' ? t('terminVereinbaren') :
          p.empfohleneAktion === 'angebot_erstellen' ? t('angebotErstellen') :
          p.empfohleneAktion === 'tarifvergleich' ? t('tarifvergleichStarten') : t('aktion');
        // Bloecke nebeneinander: Verlauf breit, Signale und Szenarien schmaler.
        const spanne = (block) => block.type === 'liquiditaetsverlauf' || block.type === 'transaktionen' || block.type === 'depotpositionen' || block.type === 'chatverlauf'
          ? 'xl:col-span-6' : 'xl:col-span-3';
        return (
          <div className="border-t border-(--border-light) bg-(--bg-inset) p-4 lg:p-5 animate-fade-in">
            <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_340px]">
              <div className="min-w-0 space-y-4">
                {p.kiDescription && (
                  <KiZusammenfassung text={interpolateDynamicDates(p.kiDescription, ctx)} titel={t('kiZusammenfassung')} />
                )}

                {bloecke.length > 0 && (
                  <div className="grid gap-4 xl:grid-cols-6">
                    {bloecke.map((block, i) => (
                      <div key={i} className={`min-w-0 ${bloecke.length === 1 ? 'xl:col-span-6' : spanne(block)}`}>
                        <HerleitungBlock block={block} />
                      </div>
                    ))}
                  </div>
                )}

                {p.deckungsluecke && <DeckungslueckeBar data={p.deckungsluecke} t={t} />}
                {p.einzelVergleiche && p.einzelVergleiche.length > 0 && (
                  <EinzelVergleiche einzelVergleiche={interpolateDeep(p.einzelVergleiche, ctx)} />
                )}
                {p.vergleich && <VergleichsTabelle data={interpolateDeep(p.vergleich, ctx)} />}

                <DatenquellenLeiste quellen={quellen} titel={t('herleitungDesImpulses')} />
              </div>

              <aside className="min-w-0 2xl:sticky 2xl:top-4 self-start space-y-4">
                <FaktenPanel
                  fakten={faktenListe}
                  titel={t('aufEinenBlick')}
                  kinder={(
                    <AktionenLeiste
                      className="mt-4 pt-4 border-t border-(--border-light)"
                      onAnschreiben={onAnschreiben}
                      anschreibenLabel={t('anschreibenFormulieren')}
                      aktionLabel={aktionLabel}
                      produkt={p.produktEmpfehlung}
                    />
                  )}
                />
              </aside>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

function HerleitungRow({ label, value, ctx }) {
  return (
    <div className="bg-(--bg-card) rounded-lg px-3 py-2 border border-(--border-light) hover:border-(--border-medium) transition-colors">
      <span className="text-xs text-(--text-tertiary) block">{label}</span>
      <span className="text-(--text-primary) font-medium">{typeof value === 'string' ? interpolateDynamicDates(value, ctx) : value}</span>
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
      <h5 className="text-[11px] font-semibold text-(--text-tertiary) uppercase tracking-wider mb-3">
        {label || t('deckungslueckenAnalyse')}
      </h5>
      <Card hover={false} className="space-y-4">
        {/* Key numbers */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="surface-inset rounded-lg p-3 metric-box">
            <div className="text-xs text-(--text-tertiary) mb-1">{gehaltLabel}</div>
            <div className="text-lg font-semibold font-mono text-(--text-primary)">{gehalt.toLocaleString(getLang() === 'en' ? 'en-US' : 'de-DE')}{einheit?.replace('€/mtl.', '€')}</div>
            <div className="text-xs text-(--text-tertiary)">/mtl.</div>
          </div>
          <div className="bg-(--tint-danger) rounded-lg p-3 metric-box">
            <div className="text-xs text-(--color-danger) mb-1">{absicherungLabel}</div>
            <div className="text-lg font-semibold font-mono text-(--color-danger)">{aktuelleAbsicherung.toLocaleString(getLang() === 'en' ? 'en-US' : 'de-DE')}€</div>
            <div className="text-xs text-(--color-danger)">/mtl. ({pctAbgesichert}%)</div>
          </div>
          <div className="bg-(--tint-success) rounded-lg p-3 metric-box">
            <div className="text-xs text-(--color-success) mb-1">{t('empfehlungLabel')}</div>
            <div className="text-lg font-semibold font-mono text-(--color-success)">{empfohleneAbsicherung.toLocaleString(getLang() === 'en' ? 'en-US' : 'de-DE')}€</div>
            <div className="text-xs text-(--color-success)">/mtl. ({pctEmpfohlen}%)</div>
          </div>
        </div>

        {/* Visual bar */}
        <div>
          <div className="flex justify-between text-xs text-(--text-tertiary) mb-1">
            <span>{pctAbgesichert}% {t('abgesichert')}</span>
            <span>{t('zielLabel')}: {pctEmpfohlen}%</span>
          </div>
          <div className="w-full h-6 bg-(--bg-inset) rounded-full relative overflow-hidden">
            {/* Empfohlen (target) */}
            <div
              className="absolute inset-y-0 left-0 bg-(--tint-success) rounded-full border-r-2 border-dashed border-(--color-success)"
              style={{ width: `${Math.min(pctEmpfohlen, 100)}%` }}
            />
            {/* Aktuell */}
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(pctAbgesichert, 100)}%`,
                background: pctAbgesichert >= pctEmpfohlen
                  ? 'var(--color-success)'
                  : pctAbgesichert > 0
                    ? 'var(--color-warning)'
                    : 'var(--color-danger)',
              }}
            />
            {/* Label on bar */}
            <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-(--text-primary)">
              {pctAbgesichert > 0 ? `${pctAbgesichert}% ${t('abgesichert')}` : t('keineAbsicherung')}
            </div>
          </div>
        </div>

        {/* Gap callout */}
        {luecke > 0 && (
          <div className="flex items-center gap-2 bg-(--tint-warning) border border-(--border-light) rounded-lg px-3 py-2">
            <TrendingUp size={16} className="text-(--color-warning) shrink-0" />
            <span className="text-sm text-(--text-primary)">
              <strong>{t('deckungsluecke')}: {luecke.toLocaleString(getLang() === 'en' ? 'en-US' : 'de-DE')}€/mtl.</strong>
              {' ('}{aktuelleAbsicherung === 0 ? t('vollstaendigUngeschuetzt') : t('nurAbgesichert', { pct: pctAbgesichert })}{')'}
            </span>
          </div>
        )}
      </Card>
    </div>
  );
}

function ScoreBadge({ score }) {
  const color = score >= 85 ? { bg: 'bg-(--tint-success)', text: 'text-(--color-success)', bar: 'var(--color-success)' }
             : score >= 70 ? { bg: 'bg-lime-50', text: 'text-lime-700', bar: 'var(--color-lime-600)' }
             : score >= 55 ? { bg: 'bg-(--tint-warning)', text: 'text-(--color-warning)', bar: 'var(--color-warning)' }
             : { bg: 'bg-(--tint-danger)', text: 'text-(--color-danger)', bar: 'var(--color-danger)' };
  return (
    <div className="inline-flex items-center gap-2">
      <div className="w-16 h-1.5 rounded-full bg-(--border-light) overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${score}%`, background: color.bar }} />
      </div>
      <span className={`rh-badge text-[11px] font-bold px-2 py-0.5 rounded-full ${color.bg} ${color.text}`}>{score}</span>
    </div>
  );
}

function EinzelVergleiche({ einzelVergleiche }) {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      <h5 className="text-[11px] font-semibold text-(--text-tertiary) uppercase tracking-wider">{t('einzelvergleichProVersicherung')}</h5>
      {einzelVergleiche.map((v, idx) => {
        const delta = (v.neu?.score ?? 0) - (v.bisher?.score ?? 0);
        const alleMerkmale = Array.from(new Set([
          ...(v.bisher?.merkmale || []).map(m => m.label),
          ...(v.neu?.merkmale || []).map(m => m.label),
        ]));
        const bisherMap = Object.fromEntries((v.bisher?.merkmale || []).map(m => [m.label, m.wert]));
        const neuMap = Object.fromEntries((v.neu?.merkmale || []).map(m => [m.label, m.wert]));
        return (
          <div key={idx} className="border border-(--border-light) rounded-xl overflow-hidden bg-(--bg-card)">
            <div className="flex items-center justify-between px-4 py-2.5 bg-(--bg-inset) border-b border-(--border-light)">
              <div className="flex items-center gap-2">
                <Shield size={15} className="text-(--mode-accent)" />
                <span className="text-sm font-semibold text-(--text-primary)">{v.titel}</span>
              </div>
              {delta !== 0 && (
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  delta > 0 ? 'bg-(--tint-success) text-(--color-success)' : 'bg-(--tint-danger) text-(--color-danger)'
                }`}>
                  {delta > 0 ? `+${delta}` : delta} {t('punkteBewertung')}
                </span>
              )}
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-(--border-light)">
                  <th className="px-4 py-2 text-left text-[11px] uppercase tracking-wider font-semibold text-(--text-tertiary) w-1/3">{t('merkmal')}</th>
                  <th className="px-4 py-2 text-left text-[11px] uppercase tracking-wider font-semibold text-(--text-secondary)">{t('bisher')}: {v.bisher?.anbieter || '–'}</th>
                  <th className="px-4 py-2 text-left text-[11px] uppercase tracking-wider font-semibold text-(--color-success)">{t('neu')}: {v.neu?.anbieter || '–'}</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-(--border-light)">
                  <td className="px-4 py-2 text-(--text-secondary) font-medium">{t('bewertung')}</td>
                  <td className="px-4 py-2"><ScoreBadge score={v.bisher?.score ?? 0} /></td>
                  <td className="px-4 py-2"><ScoreBadge score={v.neu?.score ?? 0} /></td>
                </tr>
                <tr className="border-t border-(--border-light) bg-(--bg-table-stripe)">
                  <td className="px-4 py-2 text-(--text-secondary) font-medium">{t('praemie')}</td>
                  <td className="px-4 py-2 font-mono text-(--text-primary)">{v.bisher?.praemie || '–'}</td>
                  <td className="px-4 py-2 font-mono text-(--color-success) font-semibold">{v.neu?.praemie || '–'}</td>
                </tr>
                {alleMerkmale.map((label, i) => (
                  <tr key={label} className={`border-t border-(--border-light) ${i % 2 === 0 ? '' : 'bg-(--bg-table-stripe)'}`}>
                    <td className="px-4 py-2 text-(--text-secondary) font-medium">{label}</td>
                    <td className="px-4 py-2 text-(--text-secondary)">{bisherMap[label] || '–'}</td>
                    <td className="px-4 py-2 text-(--text-primary) font-medium">{neuMap[label] || '–'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {v.fazit && (
              <div className="px-4 py-2.5 bg-(--tint-success) border-t border-(--border-light) flex items-start gap-2">
                <Sparkles size={13} className="text-(--color-success) mt-0.5 shrink-0" />
                <span className="text-xs text-(--text-primary)">{v.fazit}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function VergleichsTabelle({ data }) {
  const { t } = useTranslation();
  const { titel, spalten, zeilen, fbVergleich } = data;

  return (
    <div>
      <h5 className="text-[11px] font-semibold text-(--text-tertiary) uppercase tracking-wider mb-3">
        {titel}
      </h5>
      {/* F&B Rating Vergleich Header */}
      {fbVergleich && (
        <div className="flex items-center gap-4 mb-3 p-3 surface-inset rounded-xl">
          <img
            src="https://img.logo.dev/franke-bornberg.de?token=pk_H7vb5Y2lTsW47U4Xq-w3HA&size=48&format=png"
            alt="Franke & Bornberg"
            className="w-6 h-6 rounded"
            onError={(e) => e.target.style.display='none'}
          />
          <div className="flex items-center gap-6 flex-1">
            <div className="text-center">
              <div className="text-[11px] text-(--text-tertiary) uppercase tracking-wider">{t('bisherig')}</div>
              <div className={`text-lg font-semibold font-mono ${fbVergleich.alt >= 75 ? 'text-(--color-success)' : fbVergleich.alt >= 55 ? 'text-(--color-warning)' : 'text-(--color-danger)'}`}>
                {fbVergleich.alt}
              </div>
              <div className="text-xs text-(--text-tertiary)">{fbVergleich.altKlasse}</div>
            </div>
            <ArrowRight size={16} className="text-(--text-tertiary)" />
            <div className="text-center">
              <div className="text-[11px] text-(--text-tertiary) uppercase tracking-wider">{t('empfehlungLabel')}</div>
              <div className={`text-lg font-semibold font-mono ${fbVergleich.neu >= 75 ? 'text-(--color-success)' : fbVergleich.neu >= 55 ? 'text-(--color-warning)' : 'text-(--color-danger)'}`}>
                {fbVergleich.neu}
              </div>
              <div className="text-xs text-(--text-tertiary)">{fbVergleich.neuKlasse}</div>
            </div>
            {fbVergleich.neu > fbVergleich.alt && (
              <span className="ml-auto text-xs font-medium px-2 py-1 rounded-full bg-(--tint-success) text-(--color-success)">
                +{fbVergleich.neu - fbVergleich.alt} {t('punkte')}
              </span>
            )}
          </div>
        </div>
      )}
      <Card hover={false} padding={false} className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-(--bg-inset)">
              {spalten.map((s, i) => (
                <th
                  key={i}
                  className={`px-4 py-2.5 text-left text-[11px] uppercase tracking-wider font-semibold text-(--text-tertiary) ${i === spalten.length - 1 ? 'text-right' : ''}`}
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
                className={`border-t border-(--border-light) ${i % 2 === 1 ? 'bg-(--bg-table-stripe)' : ''} ${z.isFbRating ? 'bg-(--mode-pastel)' : ''}`}
              >
                <td className="px-4 py-2.5 text-(--text-secondary) font-medium">
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
                <td className={`px-4 py-2.5 ${z.isFbRating ? 'font-bold' : ''} text-(--text-secondary)`}>
                  {z.isFbRating ? (
                    <span className={parseInt(z.aktuell) >= 75 ? 'text-(--color-success)' : parseInt(z.aktuell) >= 55 ? 'text-(--color-warning)' : 'text-(--color-danger)'}>
                      {z.aktuell}
                    </span>
                  ) : z.aktuell}
                </td>
                <td className={`px-4 py-2.5 text-right font-medium ${
                  z.highlight ? 'text-(--color-success)' : 'text-(--text-primary)'
                }`}>
                  {z.isFbRating ? (
                    <span className={`font-bold ${parseInt(z.angebot) >= 75 ? 'text-(--color-success)' : parseInt(z.angebot) >= 55 ? 'text-(--color-warning)' : 'text-(--color-danger)'}`}>
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
