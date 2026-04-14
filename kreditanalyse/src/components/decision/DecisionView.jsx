/**
 * DecisionView -- Kreditentscheidung (Credit Decision) view.
 *
 * Two tabs:
 *   1. Votierung              -- Dual vote (Markt / Marktfolge), KI credit memo
 *   2. Genehmigungsworkflow   -- Competency matrix, approval workflow stepper
 *
 * Finanzierungsstruktur & Konditionenberechnung moved to CreditProposalView.
 */

import { useState, useMemo } from 'react';
import {
  ArrowLeft,
  AlertCircle,
  Landmark,
  Calculator,
  Vote,
  GitBranch,
  CheckCircle,
  Circle,
  Plus,
  Trash2,
  Sparkles,
  Loader2,
  Clock,
  User,
  FileText,
  ChevronRight,
  Shield,
  Lock,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  BadgeCheck,
  FileSignature,
  Download,
  ClipboardCheck,
  Gavel,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import { useApp } from '../../context/AppContext';
import StepCompleteBar from '../shared/StepCompleteBar';
import { formatCurrency, formatPercent, formatNumber } from '../../utils/formatters';
import {
  competencyMatrix,
  approvalHierarchy,
  getRequiredApprover,
} from '../../data/competencyMatrix';
import { fillContractTemplate } from '../../utils/contractTemplate';
import { exportContractAsDocx } from '../../utils/contractExport';
import { generateKiKreditempfehlung, convertKiResultToHtml } from '../../utils/kiEmpfehlung';

// =============================================================================
// Constants
// =============================================================================

const TABS = [
  { key: 'votierung', label: 'Votierung', icon: Vote },
  { key: 'workflow', label: 'Genehmigungsworkflow', icon: GitBranch },
];

const TODAY = new Date().toISOString().slice(0, 10);

// =============================================================================
// Helper: generate annuity repayment schedule
// =============================================================================

function generateTilgungsplan(betrag, zinsSatz, tilgungsSatz, laufzeitMonate, tilgungsfreiMonate, sondertilgung) {
  const laufzeitJahre = Math.ceil(laufzeitMonate / 12);
  const annualRate = (zinsSatz + tilgungsSatz) / 100;
  const annuitaet = betrag * annualRate;
  const rows = [];
  let restschuld = betrag;

  for (let jahr = 1; jahr <= laufzeitJahre && restschuld > 0.01; jahr++) {
    const startSchuld = restschuld;
    const zinsen = startSchuld * (zinsSatz / 100);

    let tilgung;
    if (jahr * 12 <= tilgungsfreiMonate) {
      // fully within grace period
      tilgung = 0;
    } else if ((jahr - 1) * 12 < tilgungsfreiMonate) {
      // partial grace period year
      const monate_tilgungsfrei = tilgungsfreiMonate - (jahr - 1) * 12;
      const monate_tilgung = 12 - monate_tilgungsfrei;
      tilgung = (annuitaet - zinsen) * (monate_tilgung / 12);
    } else {
      tilgung = annuitaet - zinsen + sondertilgung;
    }

    tilgung = Math.min(tilgung, restschuld);
    const zahlung = zinsen + tilgung;
    restschuld = startSchuld - tilgung;

    rows.push({
      jahr,
      startSchuld: Math.round(startSchuld * 100) / 100,
      tilgung: Math.round(tilgung * 100) / 100,
      zinsen: Math.round(zinsen * 100) / 100,
      annuitaet: Math.round(zahlung * 100) / 100,
      endSchuld: Math.round(Math.max(restschuld, 0) * 100) / 100,
    });
  }

  return rows;
}

// =============================================================================
// Custom Recharts tooltip
// =============================================================================

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-card border border-border rounded-lg shadow-lg p-3 text-xs font-body">
      <p className="font-semibold text-text-primary mb-1">Jahr {label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="text-text-secondary">
          <span className="inline-block w-3 h-3 rounded-sm mr-2" style={{ backgroundColor: entry.color }} />
          {entry.name}: {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  );
}

// =============================================================================
// Section heading
// =============================================================================

function SectionHeading({ children }) {
  return <h3 className="text-base font-semibold font-headline text-text-primary mt-8 mb-3">{children}</h3>;
}

// =============================================================================
// Main component
// =============================================================================

export default function DecisionView() {
  const { state, getSelectedCompany, navigate, dispatch } = useApp();
  const company = getSelectedCompany();
  const currentUser = state.currentUser;
  const customName = typeof window !== 'undefined' ? localStorage.getItem('kia_user_fullname') : '';

  // Erstvotum = Firmenkundenberater (weber), Zweitvotum = Kreditanalyst (fischer)
  const marktUser = state.availableUsers.find(u => u.id === 'weber') || state.availableUsers[0];
  const marktfolgeUser = state.availableUsers.find(u => u.id === 'fischer') || state.availableUsers[1];

  // If the current user matches the slot AND has a custom profile name, use it
  const erstvotumName = (currentUser.id === marktUser.id && customName) ? customName : marktUser.name;
  const zweitvotumName = (currentUser.id === marktfolgeUser.id && customName) ? customName : marktfolgeUser.name;

  const [activeTab, setActiveTab] = useState('votierung');

  // --- Tab 1: Finanzierungsstruktur state ---
  const [zinsSatz, setZinsSatz] = useState(5.2);
  const [tilgungsSatz, setTilgungsSatz] = useState(null); // null => derived from laufzeit
  const [sondertilgung, setSondertilgung] = useState(0);

  // --- Tab 2: Konditionenberechnung state ---
  const [refiSatz, setRefiSatz] = useState(3.20);
  const [liquiditaet, setLiquiditaet] = useState(0.15);
  const [standardRisiko, setStandardRisiko] = useState(0.60);
  const [eigenkapitalKosten, setEigenkapitalKosten] = useState(0.45);
  const [betriebsKosten, setBetriebsKosten] = useState(0.50);
  const [gewinnMarge, setGewinnMarge] = useState(0.30);

  // --- Tab 3: Votierung state ---
  // Rhein-Immobilien Demo-Szenario: Erstvotum ist bereits signiert (vor 2 Stunden),
  // Zweitvotum ist noch leer und wartet auf den Marktfolge-Prüfer.
  const isRheinImmoDemo = company?.id === 'CRED-2024-007';
  const demoErstvotumSignedAt = isRheinImmoDemo
    ? new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    : null;

  const [marktEmpfehlung, setMarktEmpfehlung] = useState('genehmigung');
  const [marktfolgeEmpfehlung, setMarktfolgeEmpfehlung] = useState('genehmigung');
  const [marktBegruendung, setMarktBegruendung] = useState('');
  const [marktfolgeBegruendung, setMarktfolgeBegruendung] = useState('');
  const [marktEindruck, setMarktEindruck] = useState('');
  const [marktfolgeEindruck, setMarktfolgeEindruck] = useState('');
  const [marktAuflagen, setMarktAuflagen] = useState(['Quartalsweise Einreichung der BWA', 'Nachweis der zweckgebundenen Mittelverwendung']);
  const [marktfolgeAuflagen, setMarktfolgeAuflagen] = useState(['Halbjährliche Sicherheitenüberprüfung', 'Einhaltung der Financial Covenants (EK-Quote > 25%)']);
  const [marktDatum, setMarktDatum] = useState(TODAY);
  const [marktfolgeDatum, setMarktfolgeDatum] = useState(TODAY);
  const [marktSigniert, setMarktSigniert] = useState(() => isRheinImmoDemo);
  const [marktfolgeSigniert, setMarktfolgeSigniert] = useState(false);
  const [marktSignedAt, setMarktSignedAt] = useState(demoErstvotumSignedAt);
  const [marktfolgeSignedAt, setMarktfolgeSignedAt] = useState(null);

  // Wrapper: signature toggle sets timestamp
  const handleSetMarktSigniert = (checked) => {
    setMarktSigniert(checked);
    setMarktSignedAt(checked ? new Date().toISOString() : null);
  };
  const handleSetMarktfolgeSigniert = (checked) => {
    setMarktfolgeSigniert(checked);
    setMarktfolgeSignedAt(checked ? new Date().toISOString() : null);
  };

  // ---------------------------------------------------------------------------
  // No-company fallback
  // ---------------------------------------------------------------------------
  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle size={48} strokeWidth={1.5} className="text-text-muted" />
        <p className="text-text-secondary font-body text-lg">
          Bitte wähle einen Kreditantrag aus.
        </p>
        <button
          type="button"
          onClick={() => navigate('dashboard')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-body text-sm hover:bg-primary-light transition-colors"
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
          Zum Dashboard
        </button>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Derived data
  // ---------------------------------------------------------------------------
  const kredit = company.kredit || {};
  const betrag = kredit.betrag || 0;
  const laufzeit = kredit.laufzeit || 60;
  const tilgungsfrei = kredit.tilgungsfrei || 0;
  const bilanz = company.bilanz || {};
  const b23 = bilanz[2023] || {};
  const bestVerbind = company.bestehende_verbindlichkeiten || [];

  // Finanzierungsstruktur derived
  const investitionsSumme = betrag * 1.2;
  const eigenanteil = betrag * 0.2;
  const investitionsKredit = betrag * 0.8;
  const kontokorrent = betrag * 0.2;

  // Default tilgungssatz from laufzeit
  const effectiveTilgungsSatz = tilgungsSatz !== null ? tilgungsSatz : Math.round((100 / (laufzeit / 12)) * 100) / 100;

  // Tilgungsplan
  const tilgungsplan = useMemo(
    () => generateTilgungsplan(betrag, zinsSatz, effectiveTilgungsSatz, laufzeit, tilgungsfrei, sondertilgung),
    [betrag, zinsSatz, effectiveTilgungsSatz, laufzeit, tilgungsfrei, sondertilgung]
  );

  // Konditionenberechnung total
  const kundenZins = refiSatz + liquiditaet + standardRisiko + eigenkapitalKosten + betriebsKosten + gewinnMarge;

  // Votierung result
  const getVotierungsErgebnis = () => {
    const anyNeg = marktEmpfehlung === 'ablehnung' || marktfolgeEmpfehlung === 'ablehnung';
    const bothPos = (marktEmpfehlung === 'genehmigung' || marktEmpfehlung === 'auflagen') &&
                    (marktfolgeEmpfehlung === 'genehmigung' || marktfolgeEmpfehlung === 'auflagen');
    if (anyNeg) return 'negativ';
    if (bothPos) return 'positiv';
    return 'divergent';
  };

  // Simulated rating for the company (use creditreform index as proxy -> rating class)
  const simulatedRating = company.creditreform_index
    ? (company.creditreform_index <= 200 ? 3 : company.creditreform_index <= 250 ? 5 : company.creditreform_index <= 350 ? 8 : 12)
    : 5;

  const requiredApprover = getRequiredApprover(betrag, simulatedRating);

  // Pre-fill Begruendungen
  const defaultMarktBegruendung = `Die ${company.firma} beantragt einen ${kredit.art || 'Investitionskredit'} über ${formatCurrency(betrag)} zur Finanzierung von "${kredit.verwendung || 'Investitionsvorhaben'}". Das Unternehmen ist seit ${company.gruendung || 'Jahren'} in der Branche ${company.branche || 'tätig'} etabliert und verfügt über eine stabile Marktposition im regionalen Umfeld.

Die Bilanzanalyse der Jahresabschlüsse 2021–2023 zeigt eine solide Ertrags- und Vermögenslage. Die Eigenkapitalquote bewegt sich auf einem branchenüberdurchschnittlichen Niveau, und die Kapitaldienstfähigkeit ist sowohl im Basis- als auch im Stressszenario gegeben. Die Geschäftsleitung verfügt über langjährige Branchenerfahrung und hat das Unternehmen erfolgreich durch wirtschaftlich herausfordernde Phasen geführt.

Die angebotene Besicherung durch ${company.sicherheiten?.map(s => s.art).join(', ') || 'diverse Sicherheiten'} deckt das Kreditengagement in ausreichendem Umfang ab. Die Blankoposition ist unter Berücksichtigung der Bonität des Kreditnehmers vertretbar.

Auf Basis der durchgeführten Analyse empfehle ich die Genehmigung des beantragten Kreditengagements unter den genannten Auflagen.`;

  const defaultMarktfolgeBegruendung = `Die marktfolgeseitige Prüfung des Kreditantrags der ${company.firma} bestätigt die positive Einschätzung der Marktseite im Wesentlichen. Die quantitative Analyse ergibt ein internes Rating der Klasse ${simulatedRating}, was einer befriedigenden bis guten Bonität entspricht.

Die Kapitaldienstfähigkeitsberechnung zeigt unter konservativen Annahmen (Umsatzrückgang -10%, Kostensteigerung +5%) einen Kapitaldienstdeckungsgrad von über 1,2x. Die Verschuldungskapazität des Unternehmens ist für das beantragte Kreditvolumen ausreichend.

Die Sicherheitenbewertung wurde nach den institutsinternen Beleihungswertrichtlinien überprüft. Die Beleihungswerte der angebotenen Sicherheiten ergeben eine rechnerische Deckungsquote von ca. ${company.sicherheiten ? Math.round(company.sicherheiten.reduce((s, si) => s + (si.wert - (si.vorlasten || 0)), 0) / betrag * 100) : 85}% des Gesamtengagements.

Die regulatorischen Anforderungen gemäß §18 KWG, MaRisk BTO 1.2 sowie CRR/CRD sind erfüllt. Die Kreditvorlage enthält alle erforderlichen Unterlagen.

Empfehlung: Genehmigung unter den nachfolgend genannten Auflagen und Bedingungen.`;

  // Initialize defaults once — Erstvotum wird vorbelegt, Zweitvotum bleibt leer
  // (der Marktfolge-Prüfer füllt es manuell oder per KI-Empfehlung im Zweitvotum-Card).
  if (!marktBegruendung) {
    // Using a trick: we set via timeout 0 to avoid setState during render
    setTimeout(() => {
      setMarktBegruendung(defaultMarktBegruendung);
      setMarktEindruck('Herr ' + (company.gf?.[0]?.name?.split(' ').pop() || 'Geschäftsführer') + ' machte im persönlichen Gespräch am ' + new Date().toLocaleDateString('de-DE') + ' einen kompetenten und vertrauenswürdigen Eindruck. Die Investitionspläne wurden schlüssig und detailliert dargelegt. Das Unternehmen wird gut geführt und verfügt über klare strategische Ziele.');
    }, 0);
  }

  // Inline KI-Empfehlung: füllt Begründung + Eindruck des jeweiligen Votums direkt.
  // target = 'markt' | 'marktfolge'
  const [kiLoadingMarkt, setKiLoadingMarkt] = useState(false);
  const [kiLoadingMarktfolge, setKiLoadingMarktfolge] = useState(false);

  const handleKiFillVotum = (target) => {
    if (target === 'markt') setKiLoadingMarkt(true);
    else setKiLoadingMarktfolge(true);

    setTimeout(() => {
      const plainText = generateKiKreditempfehlung(company, kredit, betrag, bilanz, b23, simulatedRating, bestVerbind, kundenZins);
      if (target === 'markt') {
        setMarktBegruendung(plainText);
        if (!marktEindruck) {
          setMarktEindruck('Herr ' + (company.gf?.[0]?.name?.split(' ').pop() || 'Geschäftsführer') + ' machte im persönlichen Gespräch einen kompetenten und vertrauenswürdigen Eindruck.');
        }
        setKiLoadingMarkt(false);
      } else {
        setMarktfolgeBegruendung(plainText);
        if (!marktfolgeEindruck) {
          setMarktfolgeEindruck('Die Unterlagen wurden vollständig und termingerecht eingereicht. Die wirtschaftlichen Verhältnisse wurden gemäß §18 KWG geprüft. Die Sicherheitenbewertung erfolgte nach den institutsinternen Beleihungswertrichtlinien.');
        }
        setKiLoadingMarktfolge(false);
      }
    }, 1800);
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-headline text-text-primary">
            Kreditentscheidung
          </h1>
          <p className="text-sm text-text-secondary mt-0.5">
            {company.firma} &mdash; {kredit.art || 'Kredit'} {formatCurrency(betrag)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('dashboard')}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-body text-text-secondary border border-border rounded-lg hover:bg-surface transition-colors"
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
          Zurück
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-body transition-colors border-b-2 -mb-px ${
              activeTab === key
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
            }`}
          >
            <Icon size={16} strokeWidth={1.5} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'votierung' && renderVotierung()}
      {activeTab === 'workflow' && renderWorkflow()}
    </div>
  );

  // ===========================================================================
  // TAB 1: Finanzierungsstruktur
  // ===========================================================================
  function renderFinanzierung() {
    return (
      <div className="space-y-6">
        {/* Overview card */}
        <div className="bg-surface-card border border-border rounded-xl p-6">
          <h2 className="text-base font-semibold font-headline text-text-primary mb-4">
            Finanzierungsübersicht
          </h2>
          <table className="w-full max-w-xl">
            <tbody className="text-sm">
              <FinRow label="Investitionssumme" value={investitionsSumme} bold />
              <FinRow label="Eigenanteil Kunde" value={eigenanteil} sub={`(${formatNumber(eigenanteil / investitionsSumme * 100, 1)}%)`} />
              <FinRow label="Kreditbetrag" value={betrag} bold />
              <tr><td colSpan={3} className="pt-1 pb-0.5 pl-4 text-xs text-text-muted">davon:</td></tr>
              <FinRow label="  Investitionskredit" value={investitionsKredit} sub="(80%)" indent />
              <FinRow label="  Kontokorrentlinie" value={kontokorrent} sub="(20%)" indent />
            </tbody>
          </table>
        </div>

        {/* Tilgungsplan Generator */}
        <div className="bg-surface-card border border-border rounded-xl p-6">
          <h2 className="text-base font-semibold font-headline text-text-primary mb-4">
            Tilgungsplan-Generator
          </h2>

          {/* Parameter inputs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <ParamInput
              label="Zinssatz (%)"
              value={zinsSatz}
              onChange={(v) => setZinsSatz(v)}
              min={0.5}
              max={15}
              step={0.1}
            />
            <ParamInput
              label="Tilgungssatz (%)"
              value={effectiveTilgungsSatz}
              onChange={(v) => setTilgungsSatz(v)}
              min={1}
              max={30}
              step={0.5}
            />
            <div>
              <label className="block text-xs font-body text-text-secondary mb-1">Tilgungsfrei (Monate)</label>
              <div className="px-3 py-2 bg-surface rounded-lg border border-border text-sm font-mono text-text-primary">
                {tilgungsfrei}
              </div>
            </div>
            <ParamInput
              label="Sondertilgung p.a. (€)"
              value={sondertilgung}
              onChange={(v) => setSondertilgung(v)}
              min={0}
              max={betrag * 0.2}
              step={1000}
              isCurrency
            />
          </div>

          {/* Tilgungsplan table */}
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-border">
                  {['Jahr', 'Restschuld (Beginn)', 'Tilgung', 'Zinsen', 'Annuität', 'Restschuld (Ende)'].map((h) => (
                    <th key={h} className="px-3 py-2 text-left font-semibold font-headline text-text-secondary text-xs uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tilgungsplan.map((row, i) => (
                  <tr key={row.jahr} className={i % 2 === 0 ? 'bg-surface/50' : ''}>
                    <td className="px-3 py-2 font-mono text-text-primary">{row.jahr}</td>
                    <td className="px-3 py-2 font-mono text-text-primary text-right">{formatCurrency(row.startSchuld)}</td>
                    <td className="px-3 py-2 font-mono text-accent text-right">{formatCurrency(row.tilgung)}</td>
                    <td className="px-3 py-2 font-mono text-accent-warm text-right">{formatCurrency(row.zinsen)}</td>
                    <td className="px-3 py-2 font-mono text-text-primary font-semibold text-right">{formatCurrency(row.annuitaet)}</td>
                    <td className="px-3 py-2 font-mono text-text-primary text-right">{formatCurrency(row.endSchuld)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border font-semibold">
                  <td className="px-3 py-2 text-text-primary">Gesamt</td>
                  <td className="px-3 py-2" />
                  <td className="px-3 py-2 font-mono text-accent text-right">
                    {formatCurrency(tilgungsplan.reduce((s, r) => s + r.tilgung, 0))}
                  </td>
                  <td className="px-3 py-2 font-mono text-accent-warm text-right">
                    {formatCurrency(tilgungsplan.reduce((s, r) => s + r.zinsen, 0))}
                  </td>
                  <td className="px-3 py-2 font-mono text-text-primary text-right">
                    {formatCurrency(tilgungsplan.reduce((s, r) => s + r.annuitaet, 0))}
                  </td>
                  <td className="px-3 py-2" />
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Bar chart */}
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tilgungsplan} margin={{ top: 10, right: 20, bottom: 5, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="jahr" tick={{ fontSize: 12, fontFamily: 'IBM Plex Mono' }} />
                <YAxis
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 11, fontFamily: 'IBM Plex Mono' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: 12, fontFamily: 'IBM Plex Sans' }}
                />
                <Bar dataKey="tilgung" name="Tilgung" stackId="a" fill="#00875A" radius={[0, 0, 0, 0]} />
                <Bar dataKey="zinsen" name="Zinsen" stackId="a" fill="#D97706" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  }

  // ===========================================================================
  // TAB 2: Konditionenberechnung
  // ===========================================================================
  function renderKonditionen() {
    const rows = [
      { label: 'Refinanzierungssatz (Swap)', value: refiSatz, set: setRefiSatz, min: 1, max: 5, step: 0.05 },
      { label: 'Liquiditätsrisikoprämie', value: liquiditaet, set: setLiquiditaet, min: 0, max: 0.5, step: 0.01, prefix: '+' },
      { label: 'Standardrisikokosten (PD×LGD)', value: standardRisiko, set: setStandardRisiko, min: 0, max: 2, step: 0.05, prefix: '+' },
      { label: 'Eigenkapitalkosten', value: eigenkapitalKosten, set: setEigenkapitalKosten, min: 0, max: 1, step: 0.05, prefix: '+' },
      { label: 'Betriebskosten', value: betriebsKosten, set: setBetriebsKosten, min: 0, max: 1, step: 0.05, prefix: '+' },
      { label: 'Gewinnmarge', value: gewinnMarge, set: setGewinnMarge, min: 0, max: 1, step: 0.05, prefix: '+' },
    ];

    // Market range (simulated)
    const marketMin = 4.5;
    const marketMax = 6.0;
    const rangeWidth = marketMax - marketMin;
    const offerPos = Math.max(0, Math.min(100, ((kundenZins - marketMin) / rangeWidth) * 100));

    return (
      <div className="space-y-6">
        {/* Rate breakdown */}
        <div className="bg-surface-card border border-border rounded-xl p-6">
          <h2 className="text-base font-semibold font-headline text-text-primary mb-6">
            Zins-Kalkulation
          </h2>

          <div className="max-w-2xl space-y-3">
            {rows.map((r) => (
              <div key={r.label} className="grid grid-cols-12 gap-3 items-center">
                <div className="col-span-5 text-sm text-text-secondary font-body flex items-center gap-1">
                  {r.prefix && <span className="text-text-muted">{r.prefix}</span>}
                  {r.label}
                </div>
                <div className="col-span-5">
                  <input
                    type="range"
                    min={r.min}
                    max={r.max}
                    step={r.step}
                    value={r.value}
                    onChange={(e) => r.set(parseFloat(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none bg-border accent-primary cursor-pointer"
                  />
                </div>
                <div className="col-span-2 text-right">
                  <span className="font-mono text-sm text-text-primary">
                    {formatNumber(r.value, 2)}%
                  </span>
                </div>
              </div>
            ))}

            {/* Divider */}
            <div className="border-t-2 border-primary/20 my-2" />

            {/* Total */}
            <div className="grid grid-cols-12 gap-3 items-center">
              <div className="col-span-5 text-sm font-bold text-text-primary font-headline">
                KUNDENZINS
              </div>
              <div className="col-span-5" />
              <div className="col-span-2 text-right">
                <span className="font-mono text-base font-bold text-primary">
                  {formatNumber(kundenZins, 2)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Market comparison */}
        <div className="bg-surface-card border border-border rounded-xl p-6">
          <h2 className="text-base font-semibold font-headline text-text-primary mb-4">
            Marktkonditionen-Vergleich
          </h2>
          <p className="text-sm text-text-secondary mb-4">
            Aktuelle Marktbandbreite für vergleichbare Finanzierungen: {formatNumber(marketMin, 1)}% – {formatNumber(marketMax, 1)}%
          </p>

          {/* Range bar */}
          <div className="relative max-w-xl">
            {/* Background bar */}
            <div className="h-6 rounded-full bg-gradient-to-r from-accent/20 via-accent-warm/20 to-danger/20 border border-border relative">
              {/* Market range shaded area */}
              <div className="absolute inset-0 rounded-full bg-primary/10" />

              {/* Our offer marker */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary border-2 border-white shadow-md z-10 transition-all"
                style={{ left: `calc(${offerPos}% - 8px)` }}
                title={`Unser Angebot: ${formatNumber(kundenZins, 2)}%`}
              />
            </div>

            {/* Labels */}
            <div className="flex justify-between mt-1.5 text-xs text-text-muted font-mono">
              <span>{formatNumber(marketMin, 1)}%</span>
              <span>{formatNumber(marketMax, 1)}%</span>
            </div>

            {/* Our offer label */}
            <div
              className="absolute -bottom-7 text-xs font-semibold text-primary font-mono transition-all"
              style={{ left: `calc(${offerPos}% - 20px)` }}
            >
              {formatNumber(kundenZins, 2)}%
            </div>
          </div>

          {/* Assessment */}
          <div className="mt-10 flex items-start gap-3 p-3 bg-surface rounded-lg border border-border">
            {kundenZins <= (marketMin + marketMax) / 2 ? (
              <>
                <TrendingDown size={18} strokeWidth={1.5} className="text-accent shrink-0 mt-0.5" />
                <p className="text-sm text-text-secondary">
                  Der Kundenzins von <strong className="text-text-primary">{formatNumber(kundenZins, 2)}%</strong> liegt im
                  <strong className="text-accent"> unteren Bereich</strong> der aktuellen Marktspanne. Dies deutet auf ein wettbewerbsfähiges Angebot hin.
                </p>
              </>
            ) : (
              <>
                <TrendingUp size={18} strokeWidth={1.5} className="text-accent-warm shrink-0 mt-0.5" />
                <p className="text-sm text-text-secondary">
                  Der Kundenzins von <strong className="text-text-primary">{formatNumber(kundenZins, 2)}%</strong> liegt im
                  <strong className="text-accent-warm"> oberen Bereich</strong> der aktuellen Marktspanne. Eine Anpassung der Marge kann erwogen werden.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ===========================================================================
  // TAB 3: Votierung
  // ===========================================================================
  function renderVotierung() {
    const ergebnis = getVotierungsErgebnis();

    return (
      <div className="space-y-6">
        {/* Two-column votes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Erstvotum (Markt) */}
          <VotumCard
            title="Erstvotum (Markt)"
            bearbeiter={`${erstvotumName}, ${marktUser.role}`}
            empfehlung={marktEmpfehlung}
            setEmpfehlung={setMarktEmpfehlung}
            begruendung={marktBegruendung}
            setBegruendung={setMarktBegruendung}
            eindruck={marktEindruck}
            setEindruck={setMarktEindruck}
            auflagen={marktAuflagen}
            setAuflagen={setMarktAuflagen}
            datum={marktDatum}
            setDatum={setMarktDatum}
            signiert={marktSigniert}
            setSigniert={handleSetMarktSigniert}
            signedAt={marktSignedAt}
            onKiFill={() => handleKiFillVotum('markt')}
            kiLoading={kiLoadingMarkt}
            accentColor="primary"
            readOnly={currentUser.id !== marktUser.id}
            readOnlyHint={`Nur ${marktUser.name} (${marktUser.role}) kann das Erstvotum bearbeiten.`}
          />

          {/* Zweitvotum (Marktfolge) */}
          <VotumCard
            title="Zweitvotum (Marktfolge)"
            bearbeiter={`${zweitvotumName}, ${marktfolgeUser.role}`}
            empfehlung={marktfolgeEmpfehlung}
            setEmpfehlung={setMarktfolgeEmpfehlung}
            begruendung={marktfolgeBegruendung}
            setBegruendung={setMarktfolgeBegruendung}
            eindruck={marktfolgeEindruck}
            setEindruck={setMarktfolgeEindruck}
            auflagen={marktfolgeAuflagen}
            setAuflagen={setMarktfolgeAuflagen}
            datum={marktfolgeDatum}
            setDatum={setMarktfolgeDatum}
            signiert={marktfolgeSigniert}
            setSigniert={handleSetMarktfolgeSigniert}
            signedAt={marktfolgeSignedAt}
            onKiFill={() => handleKiFillVotum('marktfolge')}
            kiLoading={kiLoadingMarktfolge}
            accentColor="primary-light"
            readOnly={currentUser.id !== marktfolgeUser.id}
            readOnlyHint={`Nur ${marktfolgeUser.name} (${marktfolgeUser.role}) kann das Zweitvotum bearbeiten.`}
          />
        </div>

        {/* Votierungs-Ergebnis */}
        <div className={`rounded-xl p-4 border flex items-center gap-3 ${
          ergebnis === 'positiv'
            ? 'bg-green-50 border-green-200 text-green-800'
            : ergebnis === 'divergent'
            ? 'bg-red-50 border-red-200 text-red-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {ergebnis === 'positiv' ? (
            <>
              <CheckCircle size={22} strokeWidth={1.5} className="text-green-600 shrink-0" />
              <div className="flex-1">
                <p className="font-semibold font-headline text-sm">Beide Voten positiv – Weiter zur Genehmigung</p>
                <p className="text-xs mt-0.5 opacity-80">Die Kreditvorlage kann dem zuständigen Kompetenzträger vorgelegt werden.</p>
              </div>
            </>
          ) : ergebnis === 'divergent' ? (
            <>
              <AlertTriangle size={22} strokeWidth={1.5} className="text-red-600 shrink-0" />
              <div>
                <p className="font-semibold font-headline text-sm">Abweichende Voten – Eskalation erforderlich</p>
                <p className="text-xs mt-0.5 opacity-80">Gemäß MaRisk BTO 1.1 Tz. 4 ist eine Eskalation an die nächsthöhere Kompetenzstufe erforderlich.</p>
              </div>
            </>
          ) : (
            <>
              <AlertCircle size={22} strokeWidth={1.5} className="text-red-600 shrink-0" />
              <div>
                <p className="font-semibold font-headline text-sm">Negatives Votum – Ablehnung oder Eskalation</p>
                <p className="text-xs mt-0.5 opacity-80">Mindestens ein Votum lautet auf Ablehnung. Prüfung durch den Vorgesetzten erforderlich.</p>
              </div>
            </>
          )}
        </div>

        {/* Entscheidung des Kompetenzträgers */}
        {company.status !== 'approved' && company.status !== 'rejected' && company.status !== 'contract' && (
          <div className="bg-surface-card border border-border rounded-xl p-6">
            <div className="flex items-start gap-3 mb-4">
              <Gavel size={20} strokeWidth={1.5} className="text-primary shrink-0 mt-0.5" />
              <div>
                <h2 className="text-base font-semibold font-headline text-text-primary">
                  Entscheidung durch Kompetenzträger
                </h2>
                <p className="text-sm text-text-secondary mt-1">
                  Zuständig: <strong className="text-text-primary">{requiredApprover.approver}</strong>
                  {' '}({getApproverName(requiredApprover.approver)})
                </p>
              </div>
            </div>

            {!(marktSigniert && marktfolgeSigniert) && (
              <div className="flex items-start gap-2 p-3 mb-4 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
                <AlertCircle size={14} strokeWidth={1.5} className="shrink-0 mt-0.5" />
                <span>
                  Beide Voten (Erst- und Zweitvotum) müssen digital signiert sein, bevor die Entscheidung getroffen werden kann.
                </span>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                disabled={!(marktSigniert && marktfolgeSigniert)}
                onClick={() => {
                  dispatch({ type: 'SET_COMPANY_STATUS', companyId: company.id, status: 'approved' });
                }}
                className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-lg text-sm font-semibold font-body hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <CheckCircle size={16} strokeWidth={1.5} />
                Kredit genehmigen
              </button>
              <button
                type="button"
                disabled={!(marktSigniert && marktfolgeSigniert)}
                onClick={() => {
                  dispatch({ type: 'SET_COMPANY_STATUS', companyId: company.id, status: 'rejected' });
                }}
                className="inline-flex items-center gap-2 px-5 py-3 bg-red-600 text-white rounded-lg text-sm font-semibold font-body hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <AlertTriangle size={16} strokeWidth={1.5} />
                Kredit ablehnen
              </button>
            </div>
          </div>
        )}

        {/* Kreditvertrag generieren (nur nach Genehmigung) */}
        {company.status === 'approved' && (
          <div className="bg-surface-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold font-headline text-text-primary">
                Kreditvertrag
              </h2>
            </div>
            <p className="text-sm text-text-secondary mb-4">
              Der Kredit wurde genehmigt. Generiere den Kreditvertrag als Word-Dokument basierend auf der STANDARD LOAN AGREEMENT Vorlage.
            </p>
            <button
              type="button"
              onClick={async () => {
                const contractText = fillContractTemplate(company);
                const contractNr = `${company.id} / ${new Date().getFullYear()}`;
                await exportContractAsDocx(contractText, company, contractNr);
              }}
              className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-lg text-sm font-semibold font-body hover:bg-emerald-700 transition-colors"
            >
              <FileSignature size={18} />
              Kreditvertrag generieren
            </button>
          </div>
        )}
      </div>
    );
  }

  // ===========================================================================
  // TAB 4: Genehmigungsworkflow
  // ===========================================================================
  function renderWorkflow() {
    // Determine which cell is highlighted
    const betragsKeys = Object.keys(competencyMatrix);
    const ratingKeys = ['1-5', '6-9', '10+'];

    // Workflow steps
    const steps = [
      {
        label: 'Erstvotum',
        person: erstvotumName,
        role: marktUser.role,
        status: 'completed',
        timestamp: '03.03.2026, 09:15',
        icon: FileText,
      },
      {
        label: 'Zweitvotum',
        person: zweitvotumName,
        role: marktfolgeUser.role,
        status: 'completed',
        timestamp: '03.03.2026, 14:30',
        icon: Shield,
      },
      {
        label: 'Kompetenzträger',
        person: requiredApprover.approver,
        role: getApproverName(requiredApprover.approver),
        status: 'active',
        timestamp: 'Ausstehend',
        icon: BadgeCheck,
      },
      {
        label: 'Entscheidung',
        person: '–',
        role: 'Kreditbeschluss',
        status: 'pending',
        timestamp: '–',
        icon: Landmark,
      },
    ];

    return (
      <div className="space-y-6">
        {/* Competency matrix */}
        <div className="bg-surface-card border border-border rounded-xl p-6">
          <h2 className="text-base font-semibold font-headline text-text-primary mb-4">
            Kompetenzmatrix
          </h2>
          <p className="text-sm text-text-secondary mb-4">
            Erforderliche Genehmigungsstufe basierend auf Kreditbetrag und Rating-Klasse.
            Aktuell: <strong className="text-text-primary">{requiredApprover.betragsBereich}</strong> / Rating <strong className="text-text-primary">{requiredApprover.ratingBereich}</strong> → <strong className="text-primary">{requiredApprover.approver}</strong>
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-border">
                  <th className="px-4 py-3 text-left font-semibold font-headline text-text-secondary text-xs uppercase tracking-wide">
                    Betrag
                  </th>
                  {ratingKeys.map((rk) => (
                    <th key={rk} className="px-4 py-3 text-center font-semibold font-headline text-text-secondary text-xs uppercase tracking-wide">
                      Rating {rk}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {betragsKeys.map((bk, i) => (
                  <tr key={bk} className={i % 2 === 0 ? 'bg-surface/50' : ''}>
                    <td className="px-4 py-3 font-body text-text-primary font-medium whitespace-nowrap">
                      {bk}
                    </td>
                    {ratingKeys.map((rk) => {
                      const isActive = bk === requiredApprover.betragsBereich && rk === requiredApprover.ratingBereich;
                      return (
                        <td
                          key={rk}
                          className={`px-4 py-3 text-center font-body transition-colors ${
                            isActive
                              ? 'bg-primary/10 text-primary font-bold border-2 border-primary/30 rounded'
                              : 'text-text-secondary'
                          }`}
                        >
                          {competencyMatrix[bk]?.[rk] || '–'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Workflow stepper */}
        <div className="bg-surface-card border border-border rounded-xl p-6">
          <h2 className="text-base font-semibold font-headline text-text-primary mb-6">
            Genehmigungsworkflow
          </h2>

          {/* Horizontal stepper */}
          <div className="flex items-start justify-between relative">
            {/* Connecting line */}
            <div className="absolute top-5 left-12 right-12 h-0.5 bg-border z-0" />

            {steps.map((step, idx) => {
              const StepIcon = step.icon;
              const isCompleted = step.status === 'completed';
              const isActive = step.status === 'active';

              return (
                <div key={step.label} className="flex flex-col items-center relative z-10 flex-1">
                  {/* Icon circle */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                      isCompleted
                        ? 'bg-accent border-accent text-white'
                        : isActive
                        ? 'bg-primary border-primary text-white animate-pulse'
                        : 'bg-surface-card border-border text-text-muted'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle size={20} strokeWidth={1.5} />
                    ) : isActive ? (
                      <StepIcon size={20} strokeWidth={1.5} />
                    ) : (
                      <Circle size={20} strokeWidth={1.5} />
                    )}
                  </div>

                  {/* Label */}
                  <p className={`mt-2 text-xs font-semibold font-headline text-center ${
                    isCompleted ? 'text-accent' : isActive ? 'text-primary' : 'text-text-muted'
                  }`}>
                    {step.label}
                  </p>

                  {/* Person */}
                  <p className="mt-0.5 text-xs text-text-secondary text-center">{step.person}</p>
                  <p className="text-[10px] text-text-muted text-center">{step.role}</p>

                  {/* Timestamp */}
                  <p className={`mt-1 text-[10px] font-mono text-center ${
                    isCompleted ? 'text-accent' : isActive ? 'text-primary' : 'text-text-muted'
                  }`}>
                    {step.timestamp}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current status summary */}
        <div className="bg-surface-card border border-border rounded-xl p-6">
          <h2 className="text-base font-semibold font-headline text-text-primary mb-4">
            Aktueller Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatusItem label="Erforderliche Kompetenz" value={requiredApprover.approver} />
            <StatusItem label="Rating-Klasse" value={`Klasse ${simulatedRating} (${requiredApprover.ratingBereich})`} />
            <StatusItem label="Kreditbetrag" value={formatCurrency(betrag)} />
          </div>
        </div>

        {/* Approval banner & Contract button */}
        {company.status === 'approved' && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                <CheckCircle size={20} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-accent">Kredit genehmigt</p>
                <p className="text-xs text-text-secondary">am {new Date().toLocaleDateString('de-DE')} durch {requiredApprover.approver}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                dispatch({ type: 'ADVANCE_TO_CONTRACT', companyId: company.id });
                navigate('contract');
              }}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-base font-semibold font-body bg-accent text-white shadow-sm hover:bg-accent/90 transition-colors"
            >
              Kreditvertrag erstellen
              <ChevronRight size={20} />
            </button>
          </div>
        )}

        {company.status === 'rejected' && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-danger flex items-center justify-center">
              <AlertTriangle size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-danger">Kredit abgelehnt</p>
              <p className="text-xs text-text-secondary">am {new Date().toLocaleDateString('de-DE')}</p>
            </div>
          </div>
        )}
      </div>
    );
  }
}

// =============================================================================
// Reusable sub-components
// =============================================================================

/** Row in the Finanzierungsübersicht table */
function FinRow({ label, value, sub, bold, indent }) {
  return (
    <tr>
      <td className={`py-1.5 pr-6 text-sm font-body ${bold ? 'font-semibold text-text-primary' : 'text-text-secondary'} ${indent ? 'pl-6' : ''}`}>
        {label}
      </td>
      <td className={`py-1.5 text-right font-mono text-sm ${bold ? 'font-semibold text-text-primary' : 'text-text-primary'}`}>
        {formatCurrency(value)}
      </td>
      {sub && (
        <td className="py-1.5 pl-2 text-xs text-text-muted font-mono">{sub}</td>
      )}
    </tr>
  );
}

/** Editable parameter input */
function ParamInput({ label, value, onChange, min, max, step, isCurrency }) {
  return (
    <div>
      <label className="block text-xs font-body text-text-secondary mb-1">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => {
          const v = parseFloat(e.target.value);
          if (!isNaN(v)) onChange(v);
        }}
        min={min}
        max={max}
        step={step}
        className="w-full px-3 py-2 bg-surface-card rounded-lg border border-border text-sm font-mono text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
      />
    </div>
  );
}

/** Votum card (reused for Markt and Marktfolge) */
function VotumCard({
  title,
  bearbeiter,
  empfehlung,
  setEmpfehlung,
  begruendung,
  setBegruendung,
  eindruck,
  setEindruck,
  auflagen,
  setAuflagen,
  datum,
  setDatum,
  signiert,
  setSigniert,
  signedAt,
  onKiFill,
  kiLoading = false,
  accentColor,
  readOnly = false,
  readOnlyHint = '',
}) {
  const empfehlungOptions = [
    { value: 'genehmigung', label: 'Genehmigung' },
    { value: 'auflagen', label: 'Genehmigung mit Auflagen' },
    { value: 'ablehnung', label: 'Ablehnung' },
  ];

  const begruendungLen = (begruendung || '').length;
  const min500 = 500;

  return (
    <div className={`bg-surface-card border ${readOnly ? 'border-dashed border-border' : 'border-border'} rounded-xl p-5 space-y-4 ${readOnly ? 'opacity-90' : ''}`}>
      <div className={`flex items-center gap-2 pb-3 border-b border-border`}>
        <Vote size={18} strokeWidth={1.5} className={`text-${accentColor}`} />
        <h3 className="text-sm font-bold font-headline text-text-primary">{title}</h3>
        {readOnly && (
          <span className="ml-auto inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300 shadow-sm">
            <Lock size={11} strokeWidth={2.5} />
            Nur Lesezugriff
          </span>
        )}
      </div>

      {readOnly && readOnlyHint && (
        <div className="text-xs text-text-muted font-body italic -mt-1 flex items-start gap-1">
          <AlertCircle size={12} strokeWidth={1.5} className="shrink-0 mt-0.5" />
          {readOnlyHint}
        </div>
      )}

      {/* Bearbeiter */}
      <div>
        <label className="block text-xs font-body text-text-secondary mb-1">Bearbeiter</label>
        <div className="flex items-center gap-2 px-3 py-2 bg-surface rounded-lg border border-border text-sm text-text-primary">
          <User size={14} strokeWidth={1.5} className="text-text-muted" />
          {bearbeiter}
        </div>
      </div>

      {/* Empfehlung */}
      <div>
        <label className="block text-xs font-body text-text-secondary mb-1.5">Empfehlung</label>
        <div className="flex flex-col gap-1.5">
          {empfehlungOptions.map((opt) => (
            <label key={opt.value} className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={`${title}-empfehlung`}
                value={opt.value}
                checked={empfehlung === opt.value}
                onChange={() => setEmpfehlung(opt.value)}
                disabled={readOnly}
                className="accent-primary w-3.5 h-3.5 disabled:cursor-not-allowed"
              />
              <span className={`text-sm font-body ${
                opt.value === 'ablehnung' ? 'text-danger' : 'text-text-primary'
              }`}>
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Begründung */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-body text-text-secondary">Begründung</label>
          <span className={`text-[10px] font-mono ${begruendungLen >= min500 ? 'text-accent' : 'text-accent-warm'}`}>
            {begruendungLen}/{min500} Zeichen
          </span>
        </div>
        <textarea
          value={begruendung}
          onChange={(e) => setBegruendung(e.target.value)}
          rows={6}
          readOnly={readOnly}
          className={`w-full px-3 py-2 bg-surface rounded-lg border border-border text-sm font-body text-text-primary resize-y focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary ${readOnly ? 'cursor-not-allowed bg-slate-50' : ''}`}
        />
      </div>

      {/* Persönlicher Eindruck */}
      <div>
        <label className="block text-xs font-body text-text-secondary mb-1">Persönlicher Eindruck</label>
        <textarea
          value={eindruck}
          onChange={(e) => setEindruck(e.target.value)}
          rows={3}
          readOnly={readOnly}
          className={`w-full px-3 py-2 bg-surface rounded-lg border border-border text-sm font-body text-text-primary resize-y focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary ${readOnly ? 'cursor-not-allowed bg-slate-50' : ''}`}
        />
      </div>

      {/* Auflagen */}
      <div>
        <label className="block text-xs font-body text-text-secondary mb-1.5">Auflagen</label>
        <div className="space-y-1.5">
          {auflagen.map((a, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs text-text-muted font-mono w-5 text-right shrink-0">{i + 1}.</span>
              <input
                type="text"
                value={a}
                onChange={(e) => {
                  const next = [...auflagen];
                  next[i] = e.target.value;
                  setAuflagen(next);
                }}
                readOnly={readOnly}
                className={`flex-1 px-2 py-1.5 bg-surface rounded border border-border text-sm font-body text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary ${readOnly ? 'cursor-not-allowed bg-slate-50' : ''}`}
              />
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => setAuflagen(auflagen.filter((_, j) => j !== i))}
                  className="text-text-muted hover:text-danger transition-colors p-1"
                  title="Entfernen"
                >
                  <Trash2 size={14} strokeWidth={1.5} />
                </button>
              )}
            </div>
          ))}
          {!readOnly && (
          <button
            type="button"
            onClick={() => setAuflagen([...auflagen, ''])}
            className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary-light transition-colors mt-1"
          >
            <Plus size={14} strokeWidth={1.5} />
            Auflage hinzufügen
          </button>
          )}
        </div>
      </div>

      {/* Datum */}
      <div>
        <label className="block text-xs font-body text-text-secondary mb-1">Datum</label>
        <input
          type="date"
          value={datum}
          onChange={(e) => setDatum(e.target.value)}
          lang="de-DE"
          readOnly={readOnly}
          className={`w-full px-3 py-2 bg-surface rounded-lg border border-border text-sm font-mono text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary ${readOnly ? 'cursor-not-allowed bg-slate-50' : ''}`}
        />
        {datum && (
          <p className="text-[10px] text-text-muted mt-1 font-mono">
            {new Date(datum).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
          </p>
        )}
      </div>

      {/* Signatur + Inline KI-Empfehlung */}
      <div className="pt-2 border-t border-border space-y-2">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <label className={`flex items-center gap-2 ${readOnly ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
            <input
              type="checkbox"
              checked={signiert}
              onChange={(e) => setSigniert(e.target.checked)}
              disabled={readOnly}
              className="accent-primary w-4 h-4 disabled:cursor-not-allowed"
            />
            <span className="text-sm font-semibold font-body text-text-primary">Votum digital signieren</span>
            {signiert && <BadgeCheck size={16} strokeWidth={1.5} className="text-accent" />}
          </label>

          {!readOnly && onKiFill && (
            <button
              type="button"
              onClick={onKiFill}
              disabled={kiLoading || signiert}
              title="Begründung automatisch aus KI-Kreditempfehlung befüllen"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold font-body bg-primary text-white hover:bg-primary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {kiLoading ? (
                <Loader2 size={14} strokeWidth={1.5} className="animate-spin" />
              ) : (
                <Sparkles size={14} strokeWidth={1.5} />
              )}
              {kiLoading ? 'Generiere …' : 'KI-Kreditempfehlung generieren'}
            </button>
          )}
        </div>

        {/* Signatur-Zeitstempel */}
        {signiert && signedAt && (
          <div className="flex items-center gap-1.5 text-[11px] text-accent font-mono">
            <Clock size={11} strokeWidth={1.5} />
            Signiert am {new Date(signedAt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            {' um '}
            {new Date(signedAt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
            {' Uhr'}
          </div>
        )}
      </div>
    </div>
  );
}

/** Status summary item */
function StatusItem({ label, value }) {
  return (
    <div className="bg-surface rounded-lg border border-border p-3">
      <p className="text-xs text-text-muted font-body mb-1">{label}</p>
      <p className="text-sm font-semibold text-text-primary font-headline">{value}</p>
    </div>
  );
}

/** Get approver name for display */
function getApproverName(approver) {
  const names = {
    'Sachbearbeiter': 'S. Brandt',
    'Abteilungsleiter': 'H. Schneider, Abteilungsleiter Kredit',
    'Bereichsleiter': 'Dr. M. Hartmann, Bereichsleiter Firmenkredit',
    'Vorstand': 'J. Berger, Vorstandsmitglied',
    'Gesamtvorstand': 'Gesamtvorstand der Bank',
    'Gesamtvorstand + AR': 'Gesamtvorstand + Aufsichtsrat',
  };
  return names[approver] || approver;
}

