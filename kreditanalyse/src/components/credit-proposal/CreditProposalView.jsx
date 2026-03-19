import { useState, useMemo } from 'react';
import {
  ArrowLeft,
  AlertCircle,
  ClipboardList,
  Calculator,
  Sparkles,
  Loader2,
  ChevronDown,
  ChevronUp,
  Building2,
  Banknote,
  BarChart3,
  Lock,
  FileText,
  Users,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import StepCompleteBar from '../shared/StepCompleteBar';
import RatingBadge from '../shared/RatingBadge';
import PercentageBar from '../shared/PercentageBar';
import SparklineChart from '../shared/SparklineChart';
import { formatCurrency, formatPercent, formatNumber } from '../../utils/formatters';
import {
  calculateAllRatios,
  getEBITDA,
  getOperativerCashflow,
  getBilanzsumme,
} from '../../utils/financialCalculations';
import {
  calculateQuantitativeRating,
  calculateOverallRating,
  calculateAccountRating,
  calculateOwnerRating,
  scoreToRatingClass,
} from '../../utils/ratingEngine';
import { haircutRates } from '../../data/haircutRates';
import { generateKiKreditempfehlung, convertKiResultToHtml } from '../../utils/kiEmpfehlung';

const TABS = [
  { key: 'vorlage', label: 'Kreditempfehlung', icon: ClipboardList },
  { key: 'konditionen', label: 'Konditionierung', icon: Calculator },
];

function SectionHeading({ icon: Icon, letter, title }) {
  return (
    <div className="flex items-center gap-3 mt-8 mb-4 first:mt-0">
      <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/5 text-primary">
        <Icon size={16} />
      </div>
      <h3 className="text-sm font-headline font-semibold text-text-primary">
        <span className="text-[#00A3BF] mr-1.5">{letter}</span>
        {title}
      </h3>
    </div>
  );
}

function DataRow({ label, value, mono }) {
  return (
    <div className="flex justify-between py-1.5 border-b border-border/50 last:border-0">
      <span className="text-xs text-text-secondary">{label}</span>
      <span className={`text-xs font-medium text-text-primary ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
}

function KennzahlCard({ label, value, trend, color }) {
  const colorClass = color === 'green' ? 'text-accent' : color === 'red' ? 'text-danger' : 'text-accent-warm';
  return (
    <div className="bg-surface border border-border rounded-lg p-3">
      <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-lg font-mono font-semibold ${colorClass}`}>{value}</p>
      {trend && <p className="text-[10px] text-text-muted mt-1">{trend}</p>}
    </div>
  );
}

export default function CreditProposalView() {
  const { getSelectedCompany, navigate } = useApp();
  const company = getSelectedCompany();
  const [activeTab, setActiveTab] = useState('vorlage');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiHtml, setAiHtml] = useState(null);
  const [aiExpanded, setAiExpanded] = useState(true);

  // Konditionierung state
  const [refiSatz, setRefiSatz] = useState(3.20);
  const [liquiditaet, setLiquiditaet] = useState(0.15);
  const [standardRisiko, setStandardRisiko] = useState(0.60);
  const [eigenkapitalKosten, setEigenkapitalKosten] = useState(0.45);
  const [betriebsKosten, setBetriebsKosten] = useState(0.50);
  const [gewinnMarge, setGewinnMarge] = useState(0.30);

  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle size={48} strokeWidth={1.5} className="text-text-muted" />
        <p className="text-text-secondary font-body text-lg">Bitte wähle einen Kreditantrag aus.</p>
        <button type="button" onClick={() => navigate('dashboard')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-body text-sm hover:bg-primary-light transition-colors">
          <ArrowLeft size={16} /> Zum Dashboard
        </button>
      </div>
    );
  }

  const kredit = company.kredit || {};
  const betrag = kredit.betrag || 0;
  const laufzeit = kredit.laufzeit || 60;
  const bilanz = company.bilanz || {};
  const years = Object.keys(bilanz).map(Number).sort();
  const latestYear = years[years.length - 1] || 2023;
  const b23 = bilanz[latestYear] || {};

  // Financial ratios
  const ratios = useMemo(() => calculateAllRatios(b23), [b23]);
  const ebitda = getEBITDA(b23);
  const cashflow = getOperativerCashflow(b23);
  const bilanzsumme = getBilanzsumme(b23);

  // Rating
  const quantRating = useMemo(() => calculateQuantitativeRating(ratios, company.branche), [ratios, company.branche]);
  const accountScore = useMemo(() => company.konto ? calculateAccountRating(company.konto) : 3, [company.konto]);
  const ownerAdj = useMemo(() => {
    if (company.schufa && company.creditreform_index) {
      const ownerScore = calculateOwnerRating(company.schufa, company.creditreform_index);
      return ownerScore > 3 ? 0.3 : ownerScore < 2 ? -0.2 : 0;
    }
    return 0;
  }, [company.schufa, company.creditreform_index]);
  const overallScore = useMemo(() => {
    return calculateOverallRating({ quantitativeScore: quantRating.score, qualitativeScore: 2.5, accountScore, ownerAdjustment: ownerAdj });
  }, [quantRating, accountScore, ownerAdj]);
  const ratingClass = scoreToRatingClass(overallScore);

  // Sicherheiten
  const sicherheiten = company.sicherheiten || [];
  const totalWert = sicherheiten.reduce((s, si) => s + (si.wert || 0), 0);
  const totalVorlasten = sicherheiten.reduce((s, si) => s + (si.vorlasten || 0), 0);

  const getHaircut = (art) => {
    const entry = Object.values(haircutRates).find(h => art.toLowerCase().includes(h.label?.toLowerCase().split(' ')[0] || '___'));
    return entry?.standard || 50;
  };

  const sichBewertung = sicherheiten.map(s => {
    const haircut = getHaircut(s.art);
    const beleihungswert = Math.round(s.wert * (1 - haircut / 100));
    const anrechenbar = Math.max(0, beleihungswert - (s.vorlasten || 0));
    return { ...s, haircut, beleihungswert, anrechenbar };
  });
  const totalAnrechenbar = sichBewertung.reduce((s, si) => s + si.anrechenbar, 0);
  const blankoanteil = Math.max(0, betrag - totalAnrechenbar);
  const deckungsgrad = betrag > 0 ? (totalAnrechenbar / betrag) * 100 : 0;

  // Konditionierung
  const kundenZins = refiSatz + liquiditaet + standardRisiko + eigenkapitalKosten + betriebsKosten + gewinnMarge;
  const monatlicheRate = betrag > 0 ? (betrag * (kundenZins / 100 / 12)) / (1 - Math.pow(1 + kundenZins / 100 / 12, -laufzeit)) : 0;

  // Sparkline data for ratios over years
  const ekQuoteTrend = years.map(y => ratios.eigenkapitalquote != null ? calculateAllRatios(bilanz[y]).eigenkapitalquote : null).filter(v => v != null);

  // Simulated rating for the company
  const simulatedRating = company.creditreform_index
    ? (company.creditreform_index <= 200 ? 3 : company.creditreform_index <= 250 ? 5 : company.creditreform_index <= 350 ? 8 : 12)
    : 5;
  const bestVerbind = company.bestehende_verbindlichkeiten || [];

  // KI Kreditempfehlung generation
  const generateProposal = () => {
    setAiLoading(true);
    setAiResult(null);
    setAiHtml(null);
    setTimeout(() => {
      setAiLoading(false);
      const plainText = generateKiKreditempfehlung(company, kredit, betrag, bilanz, b23, simulatedRating, bestVerbind, kundenZins);
      setAiResult(plainText);
      setAiHtml(convertKiResultToHtml(plainText));
    }, 2000);
  };

  // Color helper for ratios
  const ratioColor = (val, goodThreshold, badThreshold, higherBetter = true) => {
    if (val == null) return 'yellow';
    if (higherBetter) return val >= goodThreshold ? 'green' : val >= badThreshold ? 'yellow' : 'red';
    return val <= goodThreshold ? 'green' : val <= badThreshold ? 'yellow' : 'red';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#00A3BF] text-white">
          <ClipboardList size={20} />
        </div>
        <div>
          <h2 className="text-lg font-headline font-semibold text-text-primary">
            Kreditempfehlung – {company.firma}
          </h2>
          <p className="text-xs text-text-muted font-body">
            Aggregierte Übersicht aller Antragsdaten für den Kreditausschuss
          </p>
        </div>
        <span className="ml-auto text-xs bg-[#00A3BF]/10 text-[#00A3BF] px-2 py-0.5 rounded font-semibold">
          KI-Effizienz: bis zu 75%
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.key;
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-body font-medium border-b-2 transition-colors ${
                active ? 'border-[#00A3BF] text-[#00A3BF]' : 'border-transparent text-text-muted hover:text-text-secondary'
              }`}>
              <Icon size={15} /> {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'vorlage' && (
        <div className="space-y-2">
          {/* Section A – Kreditnehmer */}
          <SectionHeading icon={Building2} letter="A" title="Kreditnehmer-Profil" />
          <div className="bg-surface-card border border-border rounded-lg p-5">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8">
              <DataRow label="Firma" value={company.firma} />
              <DataRow label="Rechtsform" value={company.rechtsform} />
              <DataRow label="HRB" value={company.hrb} mono />
              <DataRow label="Gründung" value={company.gruendung} mono />
              <DataRow label="Branche" value={company.branche} />
              <DataRow label="Mitarbeiter" value={company.mitarbeiter} mono />
              <DataRow label="Umsatz letztes GJ" value={formatCurrency(b23.umsatz)} mono />
            </div>
            {company.gf?.length > 0 && (
              <div className="mt-4 pt-3 border-t border-border">
                <p className="text-[10px] text-text-muted uppercase tracking-wider mb-2">Geschäftsführung & Gesellschafter</p>
                <div className="space-y-1">
                  {company.gf.map((g, i) => (
                    <p key={i} className="text-xs text-text-secondary">
                      <span className="font-medium text-text-primary">{g.name}</span> – {g.funktion}, {g.anteil}%, seit {g.seit}, {g.erfahrung}J Erfahrung
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section B – Kreditwunsch */}
          <SectionHeading icon={Banknote} letter="B" title="Kreditwunsch" />
          <div className="bg-surface-card border border-border rounded-lg p-5">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8">
              <DataRow label="Kreditart" value={kredit.art} />
              <DataRow label="Betrag" value={formatCurrency(betrag)} mono />
              <DataRow label="Laufzeit" value={`${laufzeit} Monate`} mono />
              <DataRow label="Tilgungsfrei" value={`${kredit.tilgungsfrei || 0} Monate`} mono />
              <DataRow label="Verwendungszweck" value={kredit.verwendung || '–'} />
              <DataRow label="Auszahlung" value={kredit.auszahlung || '–'} mono />
            </div>
            {company.bestehende_verbindlichkeiten?.length > 0 && (
              <div className="mt-4 pt-3 border-t border-border">
                <p className="text-[10px] text-text-muted uppercase tracking-wider mb-2">Bestehende Verbindlichkeiten</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-1 text-text-muted font-medium">Gläubiger</th>
                        <th className="text-left py-1 text-text-muted font-medium">Art</th>
                        <th className="text-right py-1 text-text-muted font-medium">Restschuld</th>
                        <th className="text-right py-1 text-text-muted font-medium">Rate/Monat</th>
                      </tr>
                    </thead>
                    <tbody>
                      {company.bestehende_verbindlichkeiten.map((v, i) => (
                        <tr key={i} className="border-b border-border/50">
                          <td className="py-1">{v.glaeubiger}</td>
                          <td className="py-1">{v.art}</td>
                          <td className="py-1 text-right font-mono">{formatCurrency(v.restschuld)}</td>
                          <td className="py-1 text-right font-mono">{formatCurrency(v.rate)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Section C – Finanzlage */}
          <SectionHeading icon={TrendingUp} letter="C" title="Finanzlage (Zusammenfassung §18)" />
          <div className="bg-surface-card border border-border rounded-lg p-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <KennzahlCard label="EK-Quote" value={formatPercent(ratios.eigenkapitalquote)}
                color={ratioColor(ratios.eigenkapitalquote, 30, 20)} />
              <KennzahlCard label="EBITDA-Marge" value={formatPercent(ratios.ebitda_marge)}
                color={ratioColor(ratios.ebitda_marge, 10, 5)} />
              <KennzahlCard label="Dyn. Verschuldungsgrad" value={ratios.dynamischer_verschuldungsgrad != null ? `${ratios.dynamischer_verschuldungsgrad.toFixed(1)}x` : '–'}
                color={ratioColor(ratios.dynamischer_verschuldungsgrad, 3, 5, false)} />
              <KennzahlCard label="Zinsdeckungsgrad" value={ratios.zinsdeckungsgrad != null ? `${ratios.zinsdeckungsgrad.toFixed(1)}x` : '–'}
                color={ratioColor(ratios.zinsdeckungsgrad, 3, 1.5)} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 mt-4 pt-3 border-t border-border">
              <DataRow label="EBITDA" value={formatCurrency(ebitda)} mono />
              <DataRow label="Operativer Cashflow" value={formatCurrency(cashflow)} mono />
              <DataRow label="Bilanzsumme" value={formatCurrency(bilanzsumme)} mono />
            </div>
            {ekQuoteTrend.length > 1 && (
              <div className="mt-3 flex items-center gap-2">
                <span className="text-[10px] text-text-muted">EK-Quote Trend:</span>
                <SparklineChart data={ekQuoteTrend} width={80} height={20} color="#00875A" />
              </div>
            )}
          </div>

          {/* Section D – Rating */}
          <SectionHeading icon={BarChart3} letter="D" title="Rating" />
          <div className="bg-surface-card border border-border rounded-lg p-5">
            <div className="flex items-center gap-6 mb-4">
              <RatingBadge klasse={ratingClass.klasse} large />
              <div>
                <p className="text-sm font-semibold text-text-primary">Ratingklasse {ratingClass.klasse}</p>
                <p className="text-xs text-text-secondary">PD: {ratingClass.pd}% | Score: {overallScore?.toFixed(2)}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8">
              <DataRow label="Quantitativ (65%)" value={quantRating.score?.toFixed(2)} mono />
              <DataRow label="Qualitativ (25%)" value="2,50" mono />
              <DataRow label="Kontoführung (10%)" value={accountScore?.toFixed(2) || '–'} mono />
              <DataRow label="Eigentümer-Adj." value={ownerAdj?.toFixed(2) || '0,00'} mono />
            </div>
          </div>

          {/* Section E – Sicherheiten */}
          <SectionHeading icon={Lock} letter="E" title="Sicherheiten" />
          <div className="bg-surface-card border border-border rounded-lg p-5">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-1.5 text-text-muted font-medium">Sicherheit</th>
                    <th className="text-right py-1.5 text-text-muted font-medium">Zeitwert</th>
                    <th className="text-right py-1.5 text-text-muted font-medium">Haircut</th>
                    <th className="text-right py-1.5 text-text-muted font-medium">Beleihungswert</th>
                    <th className="text-right py-1.5 text-text-muted font-medium">Anrechenbar</th>
                  </tr>
                </thead>
                <tbody>
                  {sichBewertung.map((s, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td className="py-1.5">{s.bezeichnung}</td>
                      <td className="py-1.5 text-right font-mono">{formatCurrency(s.wert)}</td>
                      <td className="py-1.5 text-right font-mono">{s.haircut}%</td>
                      <td className="py-1.5 text-right font-mono">{formatCurrency(s.beleihungswert)}</td>
                      <td className="py-1.5 text-right font-mono font-semibold">{formatCurrency(s.anrechenbar)}</td>
                    </tr>
                  ))}
                  <tr className="font-semibold border-t-2 border-border">
                    <td className="py-1.5">Gesamt</td>
                    <td className="py-1.5 text-right font-mono">{formatCurrency(totalWert)}</td>
                    <td></td>
                    <td></td>
                    <td className="py-1.5 text-right font-mono">{formatCurrency(totalAnrechenbar)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-[10px] text-text-muted uppercase mb-1">Deckungsgrad</p>
                <PercentageBar value={Math.min(deckungsgrad, 100)} color={deckungsgrad >= 80 ? 'green' : deckungsgrad >= 60 ? 'yellow' : 'red'} />
                <p className="text-xs font-mono mt-1">{deckungsgrad.toFixed(1)}%</p>
              </div>
              <DataRow label="Blankoanteil" value={formatCurrency(blankoanteil)} mono />
              <DataRow label="LTV" value={totalWert > 0 ? `${((betrag / totalWert) * 100).toFixed(1)}%` : '–'} mono />
            </div>
          </div>

          {/* Section F – Konditionenberechnung */}
          <SectionHeading icon={Calculator} letter="F" title="Konditionenberechnung" />
          <div className="bg-surface-card border border-border rounded-lg p-5">
            <div className="space-y-1.5 max-w-md">
              <DataRow label="Refinanzierungssatz" value={`${refiSatz.toFixed(2)}%`} mono />
              <DataRow label="+ Liquiditätsrisikoprämie" value={`${liquiditaet.toFixed(2)}%`} mono />
              <DataRow label="+ Standardrisikokosten" value={`${standardRisiko.toFixed(2)}%`} mono />
              <DataRow label="+ Eigenkapitalkosten" value={`${eigenkapitalKosten.toFixed(2)}%`} mono />
              <DataRow label="+ Betriebskosten" value={`${betriebsKosten.toFixed(2)}%`} mono />
              <DataRow label="+ Gewinnmarge" value={`${gewinnMarge.toFixed(2)}%`} mono />
              <div className="flex justify-between py-2 border-t-2 border-primary">
                <span className="text-sm font-semibold text-text-primary">KUNDENZINS</span>
                <span className="text-sm font-semibold font-mono text-primary">{kundenZins.toFixed(2)}% p.a.</span>
              </div>
              <DataRow label="Monatliche Rate (Annuität)" value={formatCurrency(Math.round(monatlicheRate))} mono />
            </div>
          </div>

          {/* Section G – Vertragsparteien */}
          <SectionHeading icon={Users} letter="G" title="Vertragsparteien" />
          <div className="bg-surface-card border border-border rounded-lg p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-[10px] text-text-muted uppercase tracking-wider mb-2">Kreditgeber</p>
                <p className="text-sm font-semibold">Musterbank AG</p>
                <p className="text-xs text-text-secondary">Musterstraße 1, 50667 Köln</p>
              </div>
              <div>
                <p className="text-[10px] text-text-muted uppercase tracking-wider mb-2">Kreditnehmer</p>
                <p className="text-sm font-semibold">{company.firma}</p>
                <p className="text-xs text-text-secondary">
                  {company.adresse?.strasse}, {company.adresse?.plz} {company.adresse?.ort}
                </p>
                <p className="text-xs text-text-secondary mt-1">
                  Vertreten durch: {company.gf?.map(g => g.name).join(', ')}
                </p>
              </div>
            </div>
          </div>

          {/* Section H – KI-Empfehlung */}
          <SectionHeading icon={Sparkles} letter="H" title="Empfehlung (KI-generiert)" />
          <div className="bg-surface-card border border-border rounded-lg overflow-hidden">
            <div className="p-5">
              <button
                type="button"
                onClick={generateProposal}
                disabled={aiLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00A3BF] text-white rounded-lg text-sm font-semibold font-body hover:bg-[#00A3BF]/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {aiLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                {aiLoading ? 'Kreditempfehlung wird generiert...' : 'KI-Kreditempfehlung generieren'}
              </button>
            </div>
            {aiHtml && (
              <div className="border-t border-border">
                <button
                  type="button"
                  onClick={() => setAiExpanded(!aiExpanded)}
                  className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm font-semibold text-text-primary flex items-center gap-2">
                    <Sparkles size={14} className="text-[#00A3BF]" />
                    KI-Kreditempfehlung
                  </span>
                  {aiExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {aiExpanded && (
                  <div className="px-5 pb-5 prose prose-sm max-w-none">
                    <div
                      className="text-sm text-text-primary font-body leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: aiHtml }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'konditionen' && (
        <div className="bg-surface-card border border-border rounded-lg p-6 space-y-6">
          <h3 className="text-base font-semibold font-headline text-text-primary">Konditionenberechnung</h3>
          <div className="max-w-lg space-y-4">
            {[
              { label: 'Refinanzierungssatz', value: refiSatz, set: setRefiSatz, min: 1, max: 6 },
              { label: 'Liquiditätsrisikoprämie', value: liquiditaet, set: setLiquiditaet, min: 0, max: 1 },
              { label: 'Standardrisikokosten (PD × LGD)', value: standardRisiko, set: setStandardRisiko, min: 0, max: 3 },
              { label: 'Eigenkapitalkosten', value: eigenkapitalKosten, set: setEigenkapitalKosten, min: 0, max: 2 },
              { label: 'Betriebskosten', value: betriebsKosten, set: setBetriebsKosten, min: 0, max: 2 },
              { label: 'Gewinnmarge', value: gewinnMarge, set: setGewinnMarge, min: 0, max: 2 },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-text-secondary">{item.label}</span>
                  <span className="font-mono font-medium text-text-primary">{item.value.toFixed(2)}%</span>
                </div>
                <input type="range" min={item.min * 100} max={item.max * 100} value={Math.round(item.value * 100)}
                  onChange={e => item.set(parseInt(e.target.value) / 100)}
                  className="w-full h-1.5 rounded-full appearance-none bg-border accent-[#00A3BF]" />
              </div>
            ))}

            <div className="pt-4 border-t-2 border-primary">
              <div className="flex justify-between">
                <span className="text-base font-semibold text-text-primary">KUNDENZINS</span>
                <span className="text-base font-semibold font-mono text-primary">{kundenZins.toFixed(2)}% p.a.</span>
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-xs text-text-secondary">Monatliche Annuität</span>
                <span className="text-sm font-mono font-medium">{formatCurrency(Math.round(monatlicheRate))}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-text-secondary">Gesamtzins über Laufzeit</span>
                <span className="text-sm font-mono font-medium">{formatCurrency(Math.round(monatlicheRate * laufzeit - betrag))}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <StepCompleteBar currentStep="credit-proposal" />
    </div>
  );
}
