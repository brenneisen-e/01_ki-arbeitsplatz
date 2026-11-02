import { useState, useMemo } from 'react';
import { Sparkles, Repeat, ChevronDown, PawPrint, AlertTriangle, Search, PiggyBank } from 'lucide-react';
import Card from '../../../components/ui/Card';
import DonutChart from '../../../components/charts/DonutChart';
import { formatEur } from '../../../utils/formatters';
import { useMode } from '../../../hooks/useMode';
import useTranslation from '../../../i18n/useTranslation';
import translations from '../../../i18n/translations';

// ─── Module-level translation helpers (for code outside React components) ───
import { getLang } from '../../../utils/langHelper';
function tx(key) { const entry = translations[key]; if (!entry) return key; return getLang() === 'en' ? entry.en : entry.de; }

// ─── Badge component for transaction status ───
function TxBadge({ type, label }) {
  const styles = {
    bekannt:   'bg-(--tint-success) text-(--color-success)',
    unbekannt: 'bg-(--bg-inset) text-(--text-secondary) border border-(--border-light)',
    versichert:'bg-(--tint-info) text-(--color-info)',
    luecke:    'bg-(--tint-danger) text-(--color-danger)',
    insight:   'bg-(--tint-warning) text-(--color-warning)',
    'tier-hint':'bg-purple-50 text-purple-700',
  };
  return (
    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${styles[type] || styles.unbekannt}`}>
      {label}
    </span>
  );
}

// ─── Kategoriefarben: Modusfarbe und Gold in Abstufungen, keine Regenbogen-Palette ───
const KATEGORIE_FARBEN = [
  'var(--mode-chart)',
  'var(--mode-accent)',
  'color-mix(in oklab, var(--mode-chart) 62%, white)',
  'color-mix(in oklab, var(--mode-accent) 62%, white)',
  'var(--text-tertiary)',
  'color-mix(in oklab, var(--mode-chart) 38%, white)',
  'color-mix(in oklab, var(--mode-accent) 38%, white)',
  'var(--border-strong)',
  'color-mix(in oklab, var(--text-tertiary) 55%, white)',
  'color-mix(in oklab, var(--mode-chart) 20%, white)',
  'color-mix(in oklab, var(--mode-accent) 20%, white)',
];

// ─── Generate detailed Kontotransaktionen from basic transaction data ───
// IMPORTANT: Item amounts MUST sum up to the actual transaction amounts from
// kunde.transaktionen so that this section matches "Einnahmen & Ausgaben" above.
function generateKontoumsaetze(kunde) {
  const now = new Date();
  const vm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const fmtDate = (m, d) => {
    const dt = new Date(m.getFullYear(), m.getMonth(), d);
    return dt.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const PRODUKT_LABELS = { wohngebaeude: tx('finanzprofil.produktLabel.wohngebaeude'), hausrat: tx('finanzprofil.produktLabel.hausrat'), haftpflicht: tx('finanzprofil.produktLabel.haftpflicht'), kfz: tx('finanzprofil.produktLabel.kfz'), kfz2: tx('finanzprofil.produktLabel.kfz2'), bu: tx('finanzprofil.produktLabel.bu'), unfall: tx('finanzprofil.produktLabel.unfall'), rechtsschutz: tx('finanzprofil.produktLabel.rechtsschutz'), pkv: tx('finanzprofil.produktLabel.pkv'), girokonto: tx('finanzprofil.produktLabel.girokonto'), festgeld: tx('finanzprofil.produktLabel.festgeld'), tagesgeld: tx('finanzprofil.produktLabel.tagesgeld'), depot: tx('finanzprofil.produktLabel.depot'), kredit: tx('finanzprofil.produktLabel.kredit'), bausparvertrag: tx('finanzprofil.produktLabel.bausparvertrag'), lebensversicherung: tx('finanzprofil.produktLabel.lebensversicherung'), rlv: tx('finanzprofil.produktLabel.rlv'), du: tx('finanzprofil.produktLabel.du') };

  // Helper: split a total into sub-items that sum exactly to total
  function splitTotal(total, shares) {
    let remaining = total;
    return shares.map((s, i) => {
      if (i === shares.length - 1) return remaining;
      const val = Math.round(total * s);
      remaining -= val;
      return val;
    });
  }

  const categories = [];
  const txn = kunde.transaktionen || [];

  // Wohnen (baufi or miete)
  const baufi = txn.find(t => t.kategorie === 'baufi');
  const miete = txn.find(t => t.kategorie === 'miete');
  const haus = txn.find(t => t.kategorie === 'haus');
  if (baufi || miete || haus) {
    const wohnenItems = [];
    if (baufi) wohnenItems.push({ name: `${tx('finanzprofil.hypothek')} ${baufi.empfaenger}`, amount: Math.abs(baufi.betrag), datum: fmtDate(vm, 5), badge: 'bekannt', badgeLabel: tx('finanzprofil.bekannt'), recurring: true });
    if (miete) wohnenItems.push({ name: `${tx('finanzprofil.miete')} ${miete.empfaenger}`, amount: Math.abs(miete.betrag), datum: fmtDate(vm, 1), recurring: true });
    if (haus) {
      const hausTotal = Math.abs(haus.betrag);
      const [strom, nk] = splitTotal(hausTotal, [0.45, 0.55]);
      wohnenItems.push({ name: tx('finanzprofil.stromGas'), amount: strom, datum: fmtDate(vm, 3), recurring: true });
      wohnenItems.push({ name: tx('finanzprofil.nebenkosten'), amount: nk, datum: fmtDate(vm, 1), recurring: true });
    }
    categories.push({ name: tx('finanzprofil.wohnen'), total: wohnenItems.reduce((s, i) => s + i.amount, 0), items: wohnenItems });
  }

  // Versicherungen - use actual transaction amounts, distribute across products
  const versEigen = txn.find(t => t.kategorie === 'versicherung_eigen');
  const versFremd = txn.find(t => t.kategorie === 'versicherung_fremd' || t.kategorie === 'versicherung');
  const versItems = [];
  if (versEigen) {
    const eigenTotal = Math.abs(versEigen.betrag);
    const eigenProdukte = (kunde.eigeneProdukte || []).slice(0, 4);
    if (eigenProdukte.length > 0) {
      const praemienRaw = eigenProdukte.map(p => p.praemie || 50);
      const praemienSum = praemienRaw.reduce((s, v) => s + v, 0);
      let remaining = eigenTotal;
      eigenProdukte.forEach((p, i) => {
        const label = PRODUKT_LABELS[p.typ] || p.typ;
        const amount = i === eigenProdukte.length - 1 ? remaining : Math.round(eigenTotal * praemienRaw[i] / praemienSum);
        remaining -= amount;
        versItems.push({ name: `${label} (${tx('finanzprofil.eigenerBestand')})`, amount, datum: fmtDate(vm, 1), badge: 'bekannt', badgeLabel: tx('finanzprofil.betreut') });
      });
    }
  }
  if (versFremd) {
    const fremdTotalMonthly = Math.abs(versFremd.betrag);
    // Only true insurance products belong in the Versicherungen category.
    // The previous blacklist filter accidentally lumped Bausparverträge and
    // Kredite into "Versicherungen" (see Klaus Fischer). We now whitelist
    // actual insurance typ values.
    const INSURANCE_TYPES = new Set([
      'versicherung', 'kfz', 'kfz_fremd', 'kfz2', 'haftpflicht', 'hausrat',
      'rechtsschutz', 'rlv', 'bu', 'du', 'pkv', 'pkv_ehemann', 'unfall',
      'lebensversicherung', 'praxis_hp', 'betriebshaftpflicht',
      'inhaltsversicherung', 'wohngebaeude', 'it_hp', 'dno', 'kk',
    ]);
    const fremdProdukte = (kunde.fremdProdukte || []).filter(p => INSURANCE_TYPES.has(p.typ));

    // Use each policy's actual monthly premium (volumen is annual). Bundled
    // items with 0 premium are skipped – they are already represented by
    // the main carrier row.
    let knownMonthly = 0;
    fremdProdukte.forEach((p) => {
      const annual = Number(p.volumen) || 0;
      if (annual <= 0) return;
      const monthly = Math.round(annual / 12);
      knownMonthly += monthly;
      const label = p.produktart || PRODUKT_LABELS[p.typ] || p.typ;
      versItems.push({
        name: `${label} (${p.institut || tx('finanzprofil.fremd')})`,
        amount: monthly,
        datum: fmtDate(vm, 1),
        badge: 'unbekannt',
        badgeLabel: tx('finanzprofil.fremd'),
        recurring: true,
      });
    });

    // If the transaction total exceeds the sum of known premiums, surface the
    // gap as a separate "hidden" insurance item. It cannot be linked to any
    // Open-Finance product – typically it is an external policy paid via a
    // partner account (e.g. Kfz-Versicherung der Partnerin).
    const gap = fremdTotalMonthly - knownMonthly;
    if (gap >= 10) {
      versItems.push({
        name: 'Unzugeordnete Versicherung',
        amount: gap,
        datum: fmtDate(vm, 5),
        badge: 'insight',
        badgeLabel: 'Nicht in Open Finance',
        insight: 'Diese Abbuchung taucht nicht in den Open-Finance-Daten auf – vermutlich eine Versicherung, die über das Partnerkonto oder einen Dritten läuft (z. B. KFZ-Versicherung der Partnerin).',
        recurring: true,
      });
    } else if (versItems.length === 0) {
      versItems.push({ name: tx('finanzprofil.versicherungFremd'), amount: fremdTotalMonthly, datum: fmtDate(vm, 1), badge: 'unbekannt', badgeLabel: tx('finanzprofil.fremd') });
    }
  }
  if (versItems.length > 0) {
    categories.push({ name: tx('finanzprofil.versicherungen'), total: versItems.reduce((s, i) => s + i.amount, 0), items: versItems });
  }

  // Kredit & Finanzierung
  const kredit = txn.find(t => t.kategorie === 'kredit');
  if (kredit) {
    categories.push({ name: tx('finanzprofil.kreditFinanzierung'), total: Math.abs(kredit.betrag), items: [
      { name: `${tx('finanzprofil.kredit')} ${kredit.empfaenger}`, amount: Math.abs(kredit.betrag), datum: fmtDate(vm, 5), badge: 'luecke', badgeLabel: tx('finanzprofil.restschuldOffen'), recurring: true }
    ]});
  }

  // Lebensmittel & Alltag — items sum to exact konsum amount only
  const konsum = txn.find(t => t.kategorie === 'konsum');
  const konsumItems = [];
  if (konsum) {
    const total = Math.abs(konsum.betrag);
    const [rewe, edeka, dm] = splitTotal(total, [0.45, 0.30, 0.25]);
    konsumItems.push({ name: 'REWE Supermarkt', amount: rewe, datum: fmtDate(vm, 8) });
    konsumItems.push({ name: 'EDEKA', amount: edeka, datum: fmtDate(vm, 15) });
    konsumItems.push({ name: 'dm Drogerie', amount: dm, datum: fmtDate(vm, 10) });
  }
  if (konsumItems.length > 0) {
    categories.push({ name: tx('finanzprofil.lebensmittelAlltag'), total: konsumItems.reduce((s, i) => s + i.amount, 0), items: konsumItems });
  }

  // Mobilität - items sum to exact mobilitaet amount
  const mob = txn.find(t => t.kategorie === 'mobilitaet');
  if (mob) {
    const mobTotal = Math.abs(mob.betrag);
    const [tank, adac, park] = splitTotal(mobTotal, [0.6, 0.15, 0.25]);
    categories.push({ name: tx('finanzprofil.mobilitaet'), total: mobTotal, items: [
      { name: 'ARAL Tankstelle', amount: tank, datum: fmtDate(vm, 6) },
      { name: 'ADAC Mitgliedschaft', amount: adac, datum: fmtDate(vm, 1), recurring: true },
      { name: tx('finanzprofil.parkhausParken'), amount: park, datum: fmtDate(vm, 9) },
    ]});
  }

  // Sparen & Investment
  const sparplan = txn.find(t => t.kategorie === 'sparplan' || t.kategorie === 'sparen');
  if (sparplan) {
    categories.push({ name: tx('finanzprofil.sparenInvestment'), total: Math.abs(sparplan.betrag), items: [
      { name: `${tx('finanzprofil.sparplan')} ${sparplan.empfaenger}`, amount: Math.abs(sparplan.betrag), datum: fmtDate(vm, 1), badge: 'bekannt', badgeLabel: tx('finanzprofil.bekannt'), recurring: true }
    ]});
  }

  // Freizeit & Abos - items sum to exact abos amount
  const abos = txn.find(t => t.kategorie === 'abos');
  if (abos) {
    const abosTotal = Math.abs(abos.betrag);
    const seed2 = (kunde.name || '').charCodeAt(0) || 65;
    const hasRisiko = seed2 % 5 === 0;
    const freizeitItems = [];
    if (hasRisiko) {
      const [streaming, restaurant, skydive] = splitTotal(abosTotal, [0.4, 0.45, 0.15]);
      freizeitItems.push({ name: abos.empfaenger || 'Netflix, Spotify', amount: streaming, datum: fmtDate(vm, 1), recurring: true });
      freizeitItems.push({ name: tx('finanzprofil.restaurantLieferdienst'), amount: restaurant, datum: fmtDate(vm, 11) });
      freizeitItems.push({
        name: 'Skydive Academy', amount: skydive, datum: fmtDate(vm, 14),
        badge: 'insight', badgeLabel: tx('finanzprofil.risikosport'),
        insight: tx('finanzprofil.insightRisikoInline')
      });
    } else {
      const [streaming, restaurant] = splitTotal(abosTotal, [0.5, 0.5]);
      freizeitItems.push({ name: abos.empfaenger || 'Netflix, Spotify', amount: streaming, datum: fmtDate(vm, 1), recurring: true });
      freizeitItems.push({ name: tx('finanzprofil.restaurantLieferdienst'), amount: restaurant, datum: fmtDate(vm, 11) });
    }
    categories.push({ name: tx('finanzprofil.freizeitHobbies'), total: abosTotal, items: freizeitItems });
  }

  // Kinder
  const kinder = txn.find(t => t.kategorie === 'kinder');
  if (kinder) {
    const kinderTotal = Math.abs(kinder.betrag);
    const [kita, kleidung] = splitTotal(kinderTotal, [0.6, 0.4]);
    categories.push({ name: tx('finanzprofil.kinder'), total: kinderTotal, items: [
      { name: tx('finanzprofil.kitaBetreuung'), amount: kita, datum: fmtDate(vm, 1), recurring: true },
      { name: tx('finanzprofil.kinderkleidungBedarf'), amount: kleidung, datum: fmtDate(vm, 12) },
    ]});
  }

  // Tierbedarf + Tierarzt. Quellen:
  //   (a) explizite `tierbedarf`/`tierarzt`-Eintraege in kunde.transaktionen
  //   (b) `kunde.tiere.umsaetze` bzw. `kunde.haustiere.umsaetze` — dort
  //        stehen bei vielen Demo-Kunden (z. B. Klaus Fischer) die Tier-
  //        Umsaetze, weil das Tier selbst noch „vermutet" ist.
  const tierbedarf = txn.find(t => t.kategorie === 'tierbedarf');
  const tierarzt = txn.find(t => t.kategorie === 'tierarzt');
  const stammdatenTiere = kunde.tiere || kunde.haustiere || null;
  const extraTierUmsaetze = Array.isArray(stammdatenTiere?.umsaetze) ? stammdatenTiere.umsaetze : [];
  const hasAnyTier = tierbedarf || tierarzt || extraTierUmsaetze.length > 0;
  if (hasAnyTier) {
    const tierItems = [];
    if (tierbedarf) tierItems.push({ name: tierbedarf.empfaenger || 'Fressnapf', amount: Math.abs(tierbedarf.betrag), datum: fmtDate(vm, 12), badge: 'tier-hint', badgeLabel: tx('finanzprofil.haustierErkannt'), recurring: true, insight: tx('finanzprofil.insightHaustierInline') });
    if (tierarzt) tierItems.push({ name: tierarzt.empfaenger || 'Tierarzt', amount: Math.abs(tierarzt.betrag), datum: fmtDate(vm, 18), badge: 'tier-hint', badgeLabel: tx('finanzprofil.haustierErkannt'), recurring: true });
    // Umsaetze aus den Stammdaten (haeufigkeit monatlich/quartalsweise/halbjährlich)
    extraTierUmsaetze.forEach((u, idx) => {
      // bereits via transaktionen abgedeckt? (gleicher Empfaenger-Prefix)
      const alreadyAdded = tierItems.some(t => (t.name || '').toLowerCase().startsWith((u.empfaenger || '').toLowerCase().split(' ')[0]));
      if (alreadyAdded) return;
      const hLabel = u.haeufigkeit || 'monatlich';
      tierItems.push({
        name: u.empfaenger || 'Tier',
        amount: Math.abs(u.betrag || 0),
        datum: fmtDate(vm, 8 + idx * 6),
        badge: 'tier-hint',
        badgeLabel: tx('finanzprofil.haustierErkannt'),
        recurring: true,
        frequency: hLabel,
      });
    });
    if (tierItems.length > 0) {
      categories.push({ name: tx('finanzprofil.tierbedarf'), total: tierItems.reduce((s, i) => s + i.amount, 0), items: tierItems });
    }
  }

  categories.forEach((c, i) => { c.color = KATEGORIE_FARBEN[i % KATEGORIE_FARBEN.length]; });
  return categories;
}

// ─── AI Insights derived from transactions ───
function generateInsights(kontoumsaetze, kunde) {
  const insights = [];
  const allItems = kontoumsaetze.flatMap(c => c.items);

  // Pet detection
  const tierItems = allItems.filter(i => i.badge === 'tier-hint');
  if (tierItems.length > 0) {
    insights.push({
      type: 'tier',
      icon: null,
      title: tx('finanzprofil.insightHaustierTitle'),
      text: tx('finanzprofil.insightHaustierText'),
      prio: 'hoch',
      potential: tx('finanzprofil.potentialJahr')
    });
  }

  // Risk sport detection
  const riskItems = allItems.filter(i => i.badge === 'insight' || i.insight?.includes('Extremsport') || i.insight?.includes('Extreme sport'));
  if (riskItems.length > 0) {
    insights.push({
      type: 'risiko',
      icon: null,
      title: tx('finanzprofil.insightRisikoTitle'),
      text: tx('finanzprofil.insightRisikoText'),
      prio: 'mittel',
      potential: tx('finanzprofil.potentialRisikominimierung')
    });
  }

  // Insurance gap from unknown products
  const unknownIns = allItems.filter(i => i.badge === 'unbekannt');
  if (unknownIns.length > 0) {
    const lang = getLang();
    const suffix = unknownIns.length > 1 ? (lang === 'en' ? 'ies' : 'en') : (lang === 'en' ? 'y' : '');
    const verb = unknownIns.length > 1 ? (lang === 'en' ? 'were' : 'wurden') : (lang === 'en' ? 'was' : 'wurde');
    insights.push({
      type: 'luecke',
      icon: null,
      title: tx('finanzprofil.insightFremdversTitle').replace('{count}', unknownIns.length).replace('{suffix}', suffix),
      text: tx('finanzprofil.insightFremdversText').replace('{verb}', verb).replace('{count}', unknownIns.length).replace('{suffix}', suffix),
      prio: 'hoch',
      potential: tx('finanzprofil.potentialBestandskonsolidierung')
    });
  }

  // Free budget → savings potential
  const totalEin = (kunde.transaktionen || []).filter(t => t.betrag > 0).reduce((s, t) => s + t.betrag, 0);
  const totalAus = (kunde.transaktionen || []).filter(t => t.betrag < 0).reduce((s, t) => s + Math.abs(t.betrag), 0);
  const frei = totalEin - totalAus;
  if (frei > 300) {
    insights.push({
      type: 'sparen',
      icon: null,
      title: tx('finanzprofil.insightFreiTitle'),
      text: tx('finanzprofil.insightFreiText').replace('{amount}', formatEur(frei)),
      prio: 'mittel',
      potential: tx('finanzprofil.insightFreiPotential').replace('{amount}', formatEur(Math.round(frei * 0.5)))
    });
  }

  return insights;
}

// ─── Category Row (collapsible) ───
function CategoryRow({ category, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-(--border-light) rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-(--bg-inset) hover:bg-(--bg-table-hover) transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
          <span className="text-sm font-medium text-(--text-primary)">{category.name}</span>
          <span className="text-xs text-(--text-tertiary)">{category.items.length} {tx('finanzprofil.posten')}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-mono font-semibold text-(--text-primary)">{formatEur(category.total)}</span>
          <ChevronDown size={16} className={`text-(--text-tertiary) transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>
      {open && (
        <div className="divide-y divide-(--border-light)">
          {category.items.map((item, i) => (
            <div key={i} className="px-3 py-2 flex items-center justify-between hover:bg-(--bg-table-hover) transition-colors">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-sm text-(--text-secondary) truncate">{item.name}</span>
                {item.badge && <TxBadge type={item.badge} label={item.badgeLabel || item.badge} />}
                {item.recurring && <Repeat size={11} className="text-(--text-tertiary) shrink-0" aria-label={tx('finanzprofil.posten')} />}
              </div>
              <div className="flex items-center gap-2 ml-2">
                <span className="text-xs text-(--text-tertiary) font-mono">{item.datum}</span>
                <span className="text-sm font-mono text-(--text-primary) w-20 text-right">{formatEur(item.amount)}</span>
              </div>
            </div>
          ))}
          {/* Show insight if any item has one */}
          {category.items.filter(i => i.insight).map((item, idx) => (
            <div key={`insight-${idx}`} className="px-3 py-2 bg-(--tint-warning) border-t border-(--border-light)">
              <div className="flex items-start gap-2">
                <Sparkles size={14} className="text-(--color-warning) mt-0.5 shrink-0" strokeWidth={2} />
                <span className="text-xs text-(--text-primary)">{item.insight}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── SVG Icons for AI Insights ───
const InsightIcons = {
  tier: <PawPrint size={18} className="text-(--text-secondary)" strokeWidth={1.75} />,
  risiko: <AlertTriangle size={18} className="text-(--text-secondary)" strokeWidth={1.75} />,
  luecke: <Search size={18} className="text-(--text-secondary)" strokeWidth={1.75} />,
  sparen: <PiggyBank size={18} className="text-(--text-secondary)" strokeWidth={1.75} />,
};

// ─── AI Insight Card ───
function InsightCard({ insight }) {
  const prioBg = insight.prio === 'hoch' ? 'border-l-(--color-danger)' : insight.prio === 'mittel' ? 'border-l-(--color-warning)' : 'border-l-(--border-strong)';
  return (
    <div className={`border border-(--border-light) rounded-lg p-3 border-l-[3px] ${prioBg}`}>
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 shrink-0">{InsightIcons[insight.type] || insight.icon}</span>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold text-(--text-primary)">{insight.title}</span>
            {insight.potential && (
              <span className="text-xs font-medium text-(--color-success) bg-(--tint-success) px-2 py-0.5 rounded">{insight.potential}</span>
            )}
          </div>
          <p className="text-xs text-(--text-secondary) leading-relaxed">{insight.text}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───
export default function FinanzprofilTab({ kunde }) {
  const { t } = useTranslation();
  const { modeId } = useMode();
  const isVV = modeId === 'vermoegensverwaltung';
  const { config } = useMode();
  const transaktionen = kunde.transaktionen || [];
  const einnahmen = transaktionen.filter(t => t.betrag > 0);
  const ausgaben = transaktionen.filter(t => t.betrag < 0);
  const totalEin = einnahmen.reduce((s, t) => s + t.betrag, 0);
  const totalAus = ausgaben.reduce((s, t) => s + Math.abs(t.betrag), 0);
  const frei = totalEin - totalAus;

  // Kategorien für Donut
  const kategorieMap = {};
  ausgaben.forEach(t => {
    const kat = kategorieLabel(t.kategorie);
    kategorieMap[kat] = (kategorieMap[kat] || 0) + Math.abs(t.betrag);
  });
  if (frei > 0) kategorieMap[t('finanzprofil.frei')] = frei;

  const donutData = Object.entries(kategorieMap).map(([name, value]) => ({ name, value }));
  const COLORS = KATEGORIE_FARBEN;

  // Generate detailed transaction data (Open Banking / Tink style)
  const kontoumsaetze = useMemo(() => generateKontoumsaetze(kunde), [kunde]);
  const insights = useMemo(() => generateInsights(kontoumsaetze, kunde), [kontoumsaetze, kunde]);
  const totalKontoumsaetze = kontoumsaetze.reduce((s, c) => s + c.total, 0);

  const [activeFilter, setActiveFilter] = useState('alle');
  const filteredCategories = activeFilter === 'alle'
    ? kontoumsaetze
    : kontoumsaetze.filter(c => c.name.toLowerCase().includes(activeFilter));

  return (
    <div className="space-y-4">
      {/* Row 1: Einnahmen/Ausgaben + Donut */}
      <div className="grid grid-cols-2 gap-4">
        <Card hover={false}>
          <h3 className="font-semibold text-(--text-primary) mb-4">{t('einnahmenAusgaben')}</h3>
          <div className="mb-4">
            <div className="flex justify-between text-sm font-semibold text-(--text-primary) mb-2">
              <span>{t('einnahmen')}</span>
              <span className="font-mono text-(--color-success)">{formatEur(totalEin)}</span>
            </div>
            <div className="border-t border-(--border-light) pt-2 space-y-1.5">
              {einnahmen.map((t, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-(--text-secondary)">{kategorieLabel(t.kategorie)}</span>
                  <span className="font-mono text-(--text-primary)">{formatEur(t.betrag)}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <div className="flex justify-between text-sm font-semibold text-(--text-primary) mb-2">
              <span>{t('ausgaben')}</span>
              <span className="font-mono text-(--color-danger)">{formatEur(totalAus)}</span>
            </div>
            <div className="border-t border-(--border-light) pt-2 space-y-1.5">
              {ausgaben.map((t, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-(--text-secondary)">{kategorieLabel(t.kategorie)}</span>
                  <span className="font-mono text-(--text-primary)">{formatEur(Math.abs(t.betrag))}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t-2 border-(--border-medium) pt-3">
            <div className="flex justify-between text-sm font-semibold">
              <span className="text-(--text-primary)">{t('freiVerfuegbarLabel')}</span>
              <span className={`font-mono text-base ${frei >= 0 ? 'text-(--color-success)' : 'text-(--color-danger)'}`}>{formatEur(frei)}</span>
            </div>
          </div>
        </Card>

        <Card hover={false}>
          <h3 className="font-semibold text-(--text-primary) mb-4">{t('ausgabenVerteilung')}</h3>
          <DonutChart data={donutData} height={260} centerValue={formatEur(totalAus)} centerLabel={t('ausgaben')} colors={COLORS} />
          <div className="mt-4 space-y-1.5">
            {donutData.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-(--text-secondary)">{d.name}</span>
                </div>
                <span className="font-mono text-(--text-primary)">
                  {((d.value / (totalAus + Math.max(0, frei))) * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Row 2: Kontotransaktionen (Open Banking / Tink) - hidden for VV */}
      {!isVV && (
        <Card hover={false}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-(--text-primary)">{t('kontotransaktionen')}</h3>
              <p className="text-xs text-(--text-tertiary) mt-0.5">{t('openBankingPsd2')} · {kontoumsaetze.reduce((s, c) => s + c.items.length, 0)} {t('transaktionenErkannt')}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-(--text-tertiary)">{t('gesamt')}:</span>
              <span className="text-sm font-mono font-semibold text-(--text-primary)">{formatEur(totalKontoumsaetze)}</span>
            </div>
          </div>

          {/* Filter Chips — Value lower-case fuer Vergleich, Label in
              Original-Schreibweise der Kategorie (damit Gross/Klein nach
              "&" stimmt: "Kredit & Finanzierung", "Lebensmittel & Alltag",
              "Sparen & Investment"). */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {[{ value: 'alle', label: t('finanzprofil.alle') },
              ...kontoumsaetze.map(c => ({ value: c.name.toLowerCase(), label: c.name }))
            ].map(f => (
              <button
                key={f.value}
                onClick={() => setActiveFilter(f.value)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                  activeFilter === f.value
                    ? 'bg-(--mode-primary) text-white border-(--mode-primary)'
                    : 'bg-(--bg-card) text-(--text-secondary) border-(--border-light) hover:border-(--border-strong)'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Category Rows */}
          <div className="space-y-2">
            {filteredCategories.map((cat) => (
              <CategoryRow key={cat.name} category={cat} defaultOpen />
            ))}
          </div>
        </Card>
      )}

    </div>
  );
}

function kategorieLabel(kat) {
  const labels = {
    gehalt: tx('kategorie.gehalt'),
    gehalt_partner: tx('kategorie.gehaltPartner'),
    kindergeld: tx('kategorie.kindergeld'),
    rente: tx('kategorie.rente'),
    rente_partner: tx('kategorie.rentePartner'),
    einkommen: tx('kategorie.einkommen'),
    gf_gehalt: tx('kategorie.gfGehalt'),
    baufi: tx('kategorie.baufinanzierung'),
    miete: tx('kategorie.miete'),
    kredit: tx('kategorie.kredit'),
    versicherung_eigen: tx('kategorie.versicherungEigen'),
    versicherung_fremd: tx('kategorie.versicherungFremd'),
    versicherung: tx('kategorie.versicherung'),
    versicherung_firma: tx('kategorie.versicherungFirma'),
    sparplan: tx('kategorie.sparplan'),
    sparplan2: tx('kategorie.sparplan2'),
    sparen: tx('kategorie.sparen'),
    kinder: tx('kategorie.kinder'),
    konsum: tx('kategorie.konsum'),
    mobilitaet: tx('kategorie.mobilitaet'),
    abos: tx('kategorie.abosFreizeit'),
    haus: tx('kategorie.hausNebenkosten'),
    software: tx('kategorie.software'),
    geschaeft: tx('kategorie.geschaeft'),
    haustier: tx('kategorie.haustier'),
    tierbedarf: tx('kategorie.tierbedarf'),
    tierarzt: tx('kategorie.tierarzt'),
  };
  return labels[kat] || (kat ? kat.charAt(0).toUpperCase() + kat.slice(1) : kat);
}
