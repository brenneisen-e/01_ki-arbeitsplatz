import { useState, useMemo } from 'react';
import Card from '../../../components/ui/Card';
import DonutChart from '../../../components/charts/DonutChart';
import { formatEur } from '../../../utils/formatters';
import { useMode } from '../../../hooks/useMode';

// ─── Badge component for transaction status ───
function TxBadge({ type, label }) {
  const styles = {
    bekannt:   'bg-emerald-50 text-emerald-700 border-emerald-200',
    unbekannt: 'bg-slate-50 text-slate-500 border-slate-200',
    versichert:'bg-blue-50 text-blue-700 border-blue-200',
    luecke:    'bg-red-50 text-red-600 border-red-200',
    insight:   'bg-amber-50 text-amber-700 border-amber-200',
    'tier-hint':'bg-purple-50 text-purple-700 border-purple-200',
  };
  return (
    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${styles[type] || styles.unbekannt}`}>
      {label}
    </span>
  );
}

// ─── Generate detailed Kontotransaktionen from basic transaction data ───
function generateKontoumsaetze(kunde) {
  const now = new Date();
  const vm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const fmtDate = (m, d) => {
    const dt = new Date(m.getFullYear(), m.getMonth(), d);
    return dt.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const categories = [];

  // Wohnen
  const baufi = kunde.transaktionen?.find(t => t.kategorie === 'baufi');
  const miete = kunde.transaktionen?.find(t => t.kategorie === 'miete');
  if (baufi || miete) {
    const wohnenItems = [];
    if (baufi) {
      wohnenItems.push({ name: `Hypothek ${baufi.empfaenger}`, amount: Math.abs(baufi.betrag), datum: fmtDate(vm, 5), badge: 'bekannt', badgeLabel: 'Bekannt', recurring: true });
    }
    if (miete) {
      wohnenItems.push({ name: `Miete ${miete.empfaenger}`, amount: Math.abs(miete.betrag), datum: fmtDate(vm, 1), recurring: true });
    }
    wohnenItems.push({ name: 'Nebenkosten / Strom', amount: 190, datum: fmtDate(vm, 3), recurring: true });
    categories.push({ name: 'Wohnen', color: '#93b8e8', total: wohnenItems.reduce((s, i) => s + i.amount, 0), items: wohnenItems });
  }

  // Versicherungen
  const versEigen = kunde.transaktionen?.find(t => t.kategorie === 'versicherung_eigen');
  const versFremd = kunde.transaktionen?.find(t => t.kategorie === 'versicherung_fremd' || t.kategorie === 'versicherung');
  const versItems = [];
  const PRODUKT_LABELS = { wohngebaeude: 'Wohngebäude', hausrat: 'Hausrat', haftpflicht: 'Haftpflicht', kfz: 'Kfz', kfz2: 'Kfz (Zweitwagen)', bu: 'BU', unfall: 'Unfall', rechtsschutz: 'Rechtsschutz', pkv: 'PKV', girokonto: 'Girokonto', festgeld: 'Festgeld', tagesgeld: 'Tagesgeld', depot: 'Depot', kredit: 'Kredit', bausparvertrag: 'Bausparvertrag', lebensversicherung: 'Lebensversicherung', rlv: 'Risikoleben', du: 'Dienstunfähigkeit' };
  if (versEigen) {
    (kunde.eigeneProdukte || []).slice(0, 3).forEach(p => {
      const label = PRODUKT_LABELS[p.typ] || p.typ;
      versItems.push({ name: `${label} (Eigener Bestand)`, amount: Math.round((p.praemie || 50) / 12), datum: fmtDate(vm, 1), badge: 'bekannt', badgeLabel: 'Betreut' });
    });
  }
  if (versFremd || (kunde.fremdProdukte || []).some(p => p.typ?.includes('versicherung') || p.typ === 'kfz' || p.typ === 'haftpflicht')) {
    (kunde.fremdProdukte || []).filter(p => p.typ !== 'baufinanzierung' && p.typ !== 'depot').slice(0, 2).forEach(p => {
      const label = PRODUKT_LABELS[p.typ] || p.typ;
      versItems.push({ name: `${label} (${p.institut || 'Fremd'})`, amount: Math.round((p.praemie || 40) / 12), datum: fmtDate(vm, 1), badge: 'unbekannt', badgeLabel: 'Fremd' });
    });
  }
  if (versItems.length > 0) {
    categories.push({ name: 'Versicherungen', color: '#7ecba1', total: versItems.reduce((s, i) => s + i.amount, 0), items: versItems });
  }

  // Kredit & Finanzierung
  const kredit = kunde.transaktionen?.find(t => t.kategorie === 'kredit');
  if (kredit) {
    categories.push({ name: 'Kredit & Finanzierung', color: '#b8a9e2', total: Math.abs(kredit.betrag), items: [
      { name: `Kredit ${kredit.empfaenger}`, amount: Math.abs(kredit.betrag), datum: fmtDate(vm, 5), badge: 'luecke', badgeLabel: 'Restschuld offen', recurring: true }
    ]});
  }

  // Lebensmittel & Alltag — with pet detection
  const konsum = kunde.transaktionen?.find(t => t.kategorie === 'konsum');
  const haustier = kunde.transaktionen?.find(t => t.kategorie === 'haustier');
  const konsumItems = [];
  if (konsum) {
    const total = Math.abs(konsum.betrag);
    konsumItems.push({ name: 'REWE Supermarkt', amount: Math.round(total * 0.4), datum: fmtDate(vm, 8) });
    konsumItems.push({ name: 'EDEKA', amount: Math.round(total * 0.25), datum: fmtDate(vm, 15) });
    konsumItems.push({ name: 'dm Drogerie', amount: Math.round(total * 0.1), datum: fmtDate(vm, 10) });
  }
  if (haustier) {
    konsumItems.push({
      name: `Fressnapf Tiernahrung`, amount: Math.abs(haustier.betrag), datum: fmtDate(vm, 12),
      badge: 'tier-hint', badgeLabel: 'Haustier erkannt', recurring: true,
      insight: 'Regelmäßige Tierfutter-Käufe erkannt — Tierhalterhaftpflicht & OP-Versicherung prüfen'
    });
  } else {
    // Random chance to detect pet from "Konsum" patterns
    const seed = (kunde.name || '').length + (kunde.vorname || '').length;
    if (seed % 3 === 0) {
      konsumItems.push({
        name: 'Fressnapf Tiernahrung', amount: 42, datum: fmtDate(vm, 12),
        badge: 'tier-hint', badgeLabel: 'Haustier erkannt', recurring: true,
        insight: 'Regelmäßige Tierfutter-Käufe erkannt — Tierhalterhaftpflicht & OP-Versicherung prüfen'
      });
    }
  }
  if (konsumItems.length > 0) {
    categories.push({ name: 'Lebensmittel & Alltag', color: '#f0c78a', total: konsumItems.reduce((s, i) => s + i.amount, 0), items: konsumItems });
  }

  // Mobilität
  const mob = kunde.transaktionen?.find(t => t.kategorie === 'mobilitaet');
  if (mob) {
    categories.push({ name: 'Mobilität', color: '#f0a0a0', total: Math.abs(mob.betrag), items: [
      { name: 'ARAL Tankstelle', amount: Math.round(Math.abs(mob.betrag) * 0.6), datum: fmtDate(vm, 6) },
      { name: 'ADAC Mitgliedschaft', amount: 30, datum: fmtDate(vm, 1), recurring: true },
      { name: 'Parkhaus', amount: Math.round(Math.abs(mob.betrag) * 0.1), datum: fmtDate(vm, 9) },
    ]});
  }

  // Sparen & Investment
  const sparplan = kunde.transaktionen?.find(t => t.kategorie === 'sparplan' || t.kategorie === 'sparen');
  if (sparplan) {
    categories.push({ name: 'Sparen & Investment', color: '#10b981', total: Math.abs(sparplan.betrag), items: [
      { name: `Sparplan ${sparplan.empfaenger}`, amount: Math.abs(sparplan.betrag), datum: fmtDate(vm, 1), badge: 'bekannt', badgeLabel: 'Bekannt', recurring: true }
    ]});
  }

  // Freizeit & Abos
  const abos = kunde.transaktionen?.find(t => t.kategorie === 'abos');
  if (abos) {
    const freizeitItems = [
      { name: abos.empfaenger || 'Netflix, Spotify', amount: Math.round(Math.abs(abos.betrag) * 0.5), datum: fmtDate(vm, 1), recurring: true },
      { name: 'Restaurant / Lieferdienst', amount: Math.round(Math.abs(abos.betrag) * 0.5), datum: fmtDate(vm, 11) },
    ];
    // Risikosport-Erkennung für manche Kunden
    const seed2 = (kunde.name || '').charCodeAt(0) || 65;
    if (seed2 % 5 === 0) {
      freizeitItems.push({
        name: 'Skydive Academy', amount: 25, datum: fmtDate(vm, 14),
        badge: 'insight', badgeLabel: 'Risikosport',
        insight: 'Extremsport erkannt — Unfallversicherung & BU-Risikoprüfung empfohlen'
      });
    }
    categories.push({ name: 'Freizeit & Hobbies', color: '#8fd4e6', total: freizeitItems.reduce((s, i) => s + i.amount, 0), items: freizeitItems });
  }

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
      title: 'Haustier erkannt',
      text: 'Regelmäßige Käufe bei Fressnapf deuten auf Tierhaltung hin. Tierhalterhaftpflicht und Tier-OP-Versicherung als Cross-Sell prüfen.',
      prio: 'hoch',
      potential: '€ 120–250 / Jahr'
    });
  }

  // Risk sport detection
  const riskItems = allItems.filter(i => i.insight?.includes('Extremsport') || i.insight?.includes('Risikosport'));
  if (riskItems.length > 0) {
    insights.push({
      type: 'risiko',
      icon: null,
      title: 'Risikosport erkannt',
      text: 'Ausgaben für Fallschirmspringen / Extremsport. Unfallversicherung mit Risikosport-Klausel und BU-Risikoprüfung empfohlen.',
      prio: 'mittel',
      potential: 'Risikominimierung'
    });
  }

  // Insurance gap from unknown products
  const unknownIns = allItems.filter(i => i.badge === 'unbekannt');
  if (unknownIns.length > 0) {
    insights.push({
      type: 'luecke',
      icon: null,
      title: `${unknownIns.length} Fremdversicherung${unknownIns.length > 1 ? 'en' : ''} erkannt`,
      text: `Aus Kontoumsätzen ${unknownIns.length > 1 ? 'wurden' : 'wurde'} ${unknownIns.length} nicht betreute Versicherung${unknownIns.length > 1 ? 'en' : ''} identifiziert. Konsolidierungspotential prüfen.`,
      prio: 'hoch',
      potential: 'Bestandskonsolidierung'
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
      title: 'Freie Liquidität erkannt',
      text: `${formatEur(frei)} monatlich frei verfügbar. Sparrate erhöhen oder Altersvorsorge-Produkt empfehlen.`,
      prio: 'mittel',
      potential: `${formatEur(Math.round(frei * 0.5))} / Mon. Sparrate`
    });
  }

  return insights;
}

// ─── Category Row (collapsible) ───
function CategoryRow({ category, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-slate-50 hover:bg-slate-100 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
          <span className="text-sm font-medium text-slate-700">{category.name}</span>
          <span className="text-xs text-slate-400">{category.items.length} Posten</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-mono font-semibold text-slate-700">{formatEur(category.total)}</span>
          <svg className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M6 9l6 6 6-6" /></svg>
        </div>
      </button>
      {open && (
        <div className="divide-y divide-slate-100">
          {category.items.map((item, i) => (
            <div key={i} className="px-3 py-2 flex items-center justify-between hover:bg-slate-50/50">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-sm text-slate-600 truncate">{item.name}</span>
                {item.badge && <TxBadge type={item.badge} label={item.badgeLabel || item.badge} />}
                {item.recurring && <span className="text-[10px] text-slate-400">↻</span>}
              </div>
              <div className="flex items-center gap-2 ml-2">
                <span className="text-xs text-slate-400">{item.datum}</span>
                <span className="text-sm font-mono text-slate-700 w-20 text-right">{formatEur(item.amount)}</span>
              </div>
            </div>
          ))}
          {/* Show insight if any item has one */}
          {category.items.filter(i => i.insight).map((item, idx) => (
            <div key={`insight-${idx}`} className="px-3 py-2 bg-amber-50 border-t border-amber-100">
              <div className="flex items-start gap-2">
                <span className="text-amber-500 text-sm mt-0.5">💡</span>
                <span className="text-xs text-amber-800">{item.insight}</span>
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
  tier: (
    <svg className="w-5 h-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="8" cy="6" rx="2" ry="2.5"/><ellipse cx="16" cy="6" rx="2" ry="2.5"/>
      <ellipse cx="5" cy="11" rx="1.5" ry="2"/><ellipse cx="19" cy="11" rx="1.5" ry="2"/>
      <path d="M8 17c0-2.2 1.8-4 4-4s4 1.8 4 4v1a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-1z"/>
    </svg>
  ),
  risiko: (
    <svg className="w-5 h-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  luecke: (
    <svg className="w-5 h-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  sparen: (
    <svg className="w-5 h-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  ),
  header: (
    <svg className="w-4 h-4 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 9h6v6H9z"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3"/>
    </svg>
  ),
};

// ─── AI Insight Card ───
function InsightCard({ insight }) {
  const prioBg = insight.prio === 'hoch' ? 'border-l-red-400' : insight.prio === 'mittel' ? 'border-l-amber-400' : 'border-l-slate-300';
  return (
    <div className={`border border-slate-200 rounded-lg p-3 border-l-4 ${prioBg}`}>
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 shrink-0">{InsightIcons[insight.type] || insight.icon}</span>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold text-slate-800">{insight.title}</span>
            {insight.potential && (
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{insight.potential}</span>
            )}
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">{insight.text}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───
export default function FinanzprofilTab({ kunde }) {
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
  if (frei > 0) kategorieMap['Frei'] = frei;

  const donutData = Object.entries(kategorieMap).map(([name, value]) => ({ name, value }));
  const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#6b7280', '#14b8a6', '#f97316', '#a855f7', '#ef4444', '#06b6d4'];

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
        <Card>
          <h3 className="font-semibold text-slate-800 mb-4">Einnahmen & Ausgaben</h3>
          <div className="mb-4">
            <div className="flex justify-between text-sm font-semibold text-slate-700 mb-2">
              <span>Einnahmen</span>
              <span className="font-mono text-emerald-600">{formatEur(totalEin)}</span>
            </div>
            <div className="border-t border-slate-200 pt-2 space-y-1.5">
              {einnahmen.map((t, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-slate-500">{kategorieLabel(t.kategorie)}</span>
                  <span className="font-mono text-slate-700">{formatEur(t.betrag)}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <div className="flex justify-between text-sm font-semibold text-slate-700 mb-2">
              <span>Ausgaben</span>
              <span className="font-mono text-red-500">{formatEur(totalAus)}</span>
            </div>
            <div className="border-t border-slate-200 pt-2 space-y-1.5">
              {ausgaben.map((t, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-slate-500">{kategorieLabel(t.kategorie)}</span>
                  <span className="font-mono text-slate-700">{formatEur(Math.abs(t.betrag))}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t-2 border-slate-300 pt-3">
            <div className="flex justify-between text-sm font-bold">
              <span className="text-slate-800">FREI VERFÜGBAR</span>
              <span className={`font-mono ${frei >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{formatEur(frei)}</span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-slate-800 mb-4">Ausgaben-Verteilung</h3>
          <DonutChart data={donutData} height={260} centerValue={formatEur(totalAus)} centerLabel="Ausgaben" colors={COLORS} />
          <div className="mt-4 space-y-1.5">
            {donutData.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-slate-600">{d.name}</span>
                </div>
                <span className="font-mono text-slate-700">
                  {((d.value / (totalAus + Math.max(0, frei))) * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Row 2: Kontotransaktionen (Open Banking / Tink) - hidden for VV */}
      {!isVV && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-800">Kontotransaktionen</h3>
              <p className="text-xs text-slate-400 mt-0.5">Open Banking (PSD2/FIDA) · {kontoumsaetze.reduce((s, c) => s + c.items.length, 0)} Transaktionen erkannt</p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400">Gesamt:</span>
              <span className="text-sm font-mono font-semibold text-slate-700">{formatEur(totalKontoumsaetze)}</span>
            </div>
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {['alle', ...kontoumsaetze.map(c => c.name.toLowerCase())].map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                  activeFilter === f
                    ? 'bg-slate-800 text-white border-slate-800'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
                }`}
              >
                {f === 'alle' ? 'Alle' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Category Rows */}
          <div className="space-y-2">
            {filteredCategories.map((cat, i) => (
              <CategoryRow key={cat.name} category={cat} defaultOpen={i === 0} />
            ))}
          </div>
        </Card>
      )}

      {/* Row 3: KI-Erkenntnisse aus Kontoumsätzen - hidden for VV */}
      {!isVV && insights.length > 0 && (
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <span className="shrink-0">{InsightIcons.header}</span>
            <h3 className="font-semibold text-slate-800">KI-Erkenntnisse aus Kontoumsätzen</h3>
            <span className="text-xs text-slate-400 ml-auto">{insights.length} Erkenntnisse</span>
          </div>
          <div className="space-y-2.5">
            {insights.map((ins, i) => (
              <InsightCard key={i} insight={ins} />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function kategorieLabel(kat) {
  const labels = {
    gehalt: 'Gehalt',
    gehalt_partner: 'Gehalt Partner',
    kindergeld: 'Kindergeld',
    rente: 'Rente',
    rente_partner: 'Rente Partner',
    einkommen: 'Einkommen',
    gf_gehalt: 'GF-Gehalt',
    baufi: 'Baufinanzierung',
    miete: 'Miete',
    kredit: 'Kredit',
    versicherung_eigen: 'Versicherung (eigen)',
    versicherung_fremd: 'Versicherung (fremd)',
    versicherung: 'Versicherung',
    versicherung_firma: 'Versicherung Firma',
    sparplan: 'Sparplan',
    sparplan2: 'Sparplan 2',
    sparen: 'Sparen',
    kinder: 'Kinder',
    konsum: 'Konsum',
    mobilitaet: 'Mobilität',
    abos: 'Abos/Freizeit',
    haus: 'Haus/Nebenkosten',
    software: 'Software',
    geschaeft: 'Geschäft',
    haustier: 'Haustier',
    tierbedarf: 'Tierbedarf',
    tierarzt: 'Tierarzt',
  };
  return labels[kat] || (kat ? kat.charAt(0).toUpperCase() + kat.slice(1) : kat);
}
