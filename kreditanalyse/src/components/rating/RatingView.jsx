import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import StepCompleteBar from '../shared/StepCompleteBar';
import {
  ArrowLeft,
  BarChart3,
  ClipboardList,
  UserCheck,
  Landmark,
  Award,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  Printer,
  ToggleLeft,
  ToggleRight,
  Shield,
  Building2,
  CircleDot,
} from 'lucide-react';

import { calculateAllRatios } from '../../utils/financialCalculations';
import {
  calculateQuantitativeRating,
  calculateQualitativeRating,
  calculateAccountRating,
  calculateOwnerRating,
  calculateOverallRating,
  scoreToRatingClass,
  ratingColor,
  scoreToTrafficLight,
  quantitativeWeights,
} from '../../utils/ratingEngine';
import { formatPercent, formatNumber, formatCurrency } from '../../utils/formatters';
import { sparkassenSkala, vrSkala } from '../../data/ratingScales';

// =============================================================================
// Constants
// =============================================================================

const TABS = [
  { id: 'quantitativ', label: 'Quantitatives Rating', icon: BarChart3 },
  { id: 'qualitativ', label: 'Qualitatives Rating', icon: ClipboardList },
  { id: 'eigentuemer', label: 'Eigentümer-Rating', icon: UserCheck },
  { id: 'konto', label: 'Kontoführungsrating', icon: Landmark },
  { id: 'gesamt', label: 'Gesamtrating & PD', icon: Award },
];

const METRIC_LABELS = {
  eigenkapitalquote: 'Eigenkapitalquote',
  verschuldungsgrad: 'Verschuldungsgrad',
  gesamtkapitalrentabilitaet: 'Gesamtkapitalrentabilität',
  ebitda_marge: 'EBITDA-Marge',
  dynamischer_verschuldungsgrad: 'Dyn. Verschuldungsgrad',
  zinsdeckungsgrad: 'Zinsdeckungsgrad',
  cashflow_rate: 'Cashflow-Rate',
  liquiditaet3: 'Liquiditätsgrad III',
};

// Metrics that are displayed as percentages
const PERCENT_METRICS = [
  'eigenkapitalquote',
  'verschuldungsgrad',
  'gesamtkapitalrentabilitaet',
  'ebitda_marge',
  'cashflow_rate',
  'liquiditaet3',
];

const QUALITATIVE_GROUPS = [
  {
    title: 'Management & Organisation',
    icon: UserCheck,
    questions: [
      { key: 'management_qualifikation', label: 'Fachliche Qualifikation der GF' },
      { key: 'branchenerfahrung', label: 'Branchenerfahrung' },
      { key: 'nachfolge', label: 'Nachfolgeregelung' },
      { key: 'kompetenzabdeckung', label: 'Kompetenzabdeckung' },
      { key: 'rechnungswesen', label: 'Qualität Rechnungswesen/Controlling' },
    ],
  },
  {
    title: 'Markt & Wettbewerb',
    icon: TrendingUp,
    questions: [
      { key: 'branchenaussichten', label: 'Branchenaussichten' },
      { key: 'marktstellung', label: 'Marktstellung/Wettbewerbsposition' },
      { key: 'kundenkonzentration', label: 'Kundenkonzentration (Klumpenrisiko)' },
      { key: 'lieferantenabhaengigkeit', label: 'Lieferantenabhängigkeit' },
      { key: 'substitutionsrisiko', label: 'Substitutionsrisiko' },
    ],
  },
  {
    title: 'Geschäftsmodell',
    icon: Building2,
    questions: [
      { key: 'cashflow_stabilitaet', label: 'Stabilität der Cashflows' },
      { key: 'diversifikation', label: 'Diversifikation' },
      { key: 'investitionsrueckstand', label: 'Investitionsrückstand' },
      { key: 'digitalisierung', label: 'Digitalisierungsgrad' },
      { key: 'esg_risiko', label: 'ESG-Risikoprofil' },
    ],
  },
  {
    title: 'Informationsverhalten',
    icon: ClipboardList,
    questions: [
      { key: 'termintreue', label: 'Termintreue Unterlageneinreichung' },
      { key: 'unterlagenqualitaet', label: 'Qualität der Unterlagen' },
      { key: 'kooperationsbereitschaft', label: 'Kooperationsbereitschaft' },
    ],
  },
];

const SCORE_LABELS = {
  1: 'Sehr gut',
  2: 'Gut',
  3: 'Befriedigend',
  4: 'Ausreichend',
  5: 'Mangelhaft',
};

const DEFAULT_QUALITATIVE_ANSWERS = {
  management_qualifikation: 2,
  branchenerfahrung: 2,
  nachfolge: 3,
  kompetenzabdeckung: 2,
  rechnungswesen: 3,
  branchenaussichten: 2,
  marktstellung: 3,
  kundenkonzentration: 3,
  lieferantenabhaengigkeit: 3,
  substitutionsrisiko: 2,
  cashflow_stabilitaet: 2,
  diversifikation: 3,
  investitionsrueckstand: 3,
  digitalisierung: 3,
  esg_risiko: 2,
  termintreue: 2,
  unterlagenqualitaet: 2,
  kooperationsbereitschaft: 2,
};

const VERMOEGEN_OPTIONS = [
  { value: 'geordnet', label: 'Geordnet' },
  { value: 'durchschnittlich', label: 'Durchschnittlich' },
  { value: 'angespannt', label: 'Angespannt' },
];

const NEGATIV_MERKMALE = [
  { key: 'haftbefehl', label: 'Haftbefehl' },
  { key: 'eidesstattliche', label: 'Eidesstattliche Versicherung' },
  { key: 'pfaendungen', label: 'Pfändungen' },
];

// =============================================================================
// Helper: score dot color
// =============================================================================

function scoreDotColor(score) {
  if (score <= 2) return 'bg-green-500';
  if (score <= 4) return 'bg-amber-500';
  return 'bg-red-500';
}

function scoreBgColor(score) {
  if (score <= 2) return 'bg-green-50 text-green-700';
  if (score <= 4) return 'bg-amber-50 text-amber-700';
  return 'bg-red-50 text-red-700';
}

function formatMetricValue(key, value) {
  if (value == null || isNaN(value)) return '–';
  if (PERCENT_METRICS.includes(key)) {
    return formatNumber(value, 1) + ' %';
  }
  if (key === 'dynamischer_verschuldungsgrad') {
    return formatNumber(value, 1) + ' x Jahre';
  }
  if (key === 'zinsdeckungsgrad') {
    return formatNumber(value, 1) + ' x';
  }
  return formatNumber(value, 2);
}

// =============================================================================
// Main Component
// =============================================================================

export default function RatingView() {
  const { state, navigate, getSelectedCompany, dispatch } = useApp();
  const company = getSelectedCompany();

  const [activeTab, setActiveTab] = useState('quantitativ');

  // Qualitative answers - local state with defaults
  const [qualAnswers, setQualAnswers] = useState(DEFAULT_QUALITATIVE_ANSWERS);

  // Owner state
  const [ownerInsolvenz, setOwnerInsolvenz] = useState(() => {
    if (!company?.gf) return {};
    return company.gf.reduce((acc, _, i) => ({ ...acc, [i]: false }), {});
  });
  const [ownerVermoegen, setOwnerVermoegen] = useState(() => {
    if (!company?.gf) return {};
    return company.gf.reduce((acc, _, i) => ({ ...acc, [i]: 'geordnet' }), {});
  });
  const [ownerNegativ, setOwnerNegativ] = useState(() => {
    if (!company?.gf) return {};
    return company.gf.reduce(
      (acc, _, i) => ({
        ...acc,
        [i]: { haftbefehl: false, eidesstattliche: false, pfaendungen: false },
      }),
      {}
    );
  });

  // Gesamtrating toggle
  const [ratingSkala, setRatingSkala] = useState('sparkassen');

  // ---------- No company placeholder ----------
  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-24">
        <div className="bg-surface-card border border-border rounded-2xl p-12 text-center max-w-md shadow-sm">
          <BarChart3 className="mx-auto text-text-muted mb-4" size={48} strokeWidth={1.5} />
          <h2 className="font-headline text-xl font-semibold text-text-primary mb-2">
            Kein Unternehmen ausgewählt
          </h2>
          <p className="text-text-secondary text-sm mb-6">
            Bitte wählen Sie zuerst ein Unternehmen aus dem Dashboard aus, um das Rating durchzuführen.
          </p>
          <button
            onClick={() => navigate('dashboard')}
            className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-light transition-colors"
          >
            <ArrowLeft size={16} strokeWidth={1.5} />
            Zum Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ---------- Calculations ----------
  const ratios = calculateAllRatios(company.bilanz[2023]);
  const quantResult = calculateQuantitativeRating(ratios, company.branche);
  const qualScore = calculateQualitativeRating(qualAnswers);
  const accountScore = calculateAccountRating(company.konto);

  // Owner score
  const schufaScores = company.gf.map((_, i) => {
    const key = `gf${i + 1}`;
    return company.schufa[key] ?? null;
  });
  const avgSchufa =
    schufaScores.filter((s) => s != null).reduce((a, b) => a + b, 0) /
    Math.max(1, schufaScores.filter((s) => s != null).length);
  const ownerScore = calculateOwnerRating(avgSchufa, company.creditreform_index);

  // Owner adjustment: deviation from neutral (2.5) scaled down
  const ownerAdjustment = Math.round(((ownerScore - 2.5) * 0.3) * 100) / 100;

  // Check for negative merkmale across all owners
  const hasNegativMerkmale = Object.values(ownerNegativ).some((nm) =>
    Object.values(nm).some((v) => v)
  );
  const hasInsolvenz = Object.values(ownerInsolvenz).some((v) => v);
  const negativAdjustment = (hasNegativMerkmale ? 0.5 : 0) + (hasInsolvenz ? 0.3 : 0);
  const totalOwnerAdjustment = Math.round((ownerAdjustment + negativAdjustment) * 100) / 100;

  const overallScore = calculateOverallRating({
    quantitativeScore: quantResult.score,
    qualitativeScore: qualScore,
    accountScore: accountScore,
    ownerAdjustment: totalOwnerAdjustment,
  });

  const ratingClass = scoreToRatingClass(overallScore);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('dashboard')}
            className="p-2 rounded-lg hover:bg-surface text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowLeft size={20} strokeWidth={1.5} />
          </button>
          <div>
            <h1 className="font-headline text-xl font-semibold text-text-primary">
              Rating-Analyse
            </h1>
            <p className="text-sm text-text-secondary">{company.firma}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-mono font-semibold"
            style={{
              backgroundColor: ratingColor(ratingClass.klasse) + '18',
              color: ratingColor(ratingClass.klasse),
            }}
          >
            <Award size={14} strokeWidth={1.5} />
            Klasse {ratingClass.klasse}
          </span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-surface-card border border-border rounded-xl overflow-hidden">
        <nav className="flex border-b border-border overflow-x-auto no-print">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
                }`}
              >
                <Icon size={16} strokeWidth={1.5} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        <div className="p-6">
          {activeTab === 'quantitativ' && (
            <QuantitativesRating quantResult={quantResult} ratios={ratios} />
          )}
          {activeTab === 'qualitativ' && (
            <QualitativesRating
              answers={qualAnswers}
              setAnswers={setQualAnswers}
              qualScore={qualScore}
            />
          )}
          {activeTab === 'eigentuemer' && (
            <EigentuemerRating
              company={company}
              schufaScores={schufaScores}
              ownerScore={ownerScore}
              ownerInsolvenz={ownerInsolvenz}
              setOwnerInsolvenz={setOwnerInsolvenz}
              ownerVermoegen={ownerVermoegen}
              setOwnerVermoegen={setOwnerVermoegen}
              ownerNegativ={ownerNegativ}
              setOwnerNegativ={setOwnerNegativ}
              totalOwnerAdjustment={totalOwnerAdjustment}
            />
          )}
          {activeTab === 'konto' && (
            <KontofuehrungsRating konto={company.konto} accountScore={accountScore} />
          )}
          {activeTab === 'gesamt' && (
            <GesamtRating
              quantScore={quantResult.score}
              qualScore={qualScore}
              accountScore={accountScore}
              ownerAdjustment={totalOwnerAdjustment}
              overallScore={overallScore}
              ratingClass={ratingClass}
              ratingSkala={ratingSkala}
              setRatingSkala={setRatingSkala}
              company={company}
            />
          )}
        </div>
      </div>

      <StepCompleteBar currentStep="rating" />
    </div>
  );
}

// =============================================================================
// Tab 1: Quantitatives Rating
// =============================================================================

function QuantitativesRating({ quantResult, ratios }) {
  const { details, score } = quantResult;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-1">
        <BarChart3 size={18} strokeWidth={1.5} className="text-primary" />
        <h2 className="font-headline text-lg font-semibold text-text-primary">
          Quantitatives Rating
        </h2>
      </div>
      <p className="text-sm text-text-secondary -mt-4">
        Automatisch berechnet auf Basis der Jahresabschlussdaten 2023. Die Einzelkennzahlen werden
        branchenspezifisch bewertet und gewichtet.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface">
              <th className="text-left py-3 px-4 font-medium text-text-secondary font-body">
                Kennzahl
              </th>
              <th className="text-right py-3 px-4 font-medium text-text-secondary font-body">
                Wert
              </th>
              <th className="text-center py-3 px-4 font-medium text-text-secondary font-body">
                Score (1-6)
              </th>
              <th className="text-right py-3 px-4 font-medium text-text-secondary font-body">
                Gewichtung
              </th>
              <th className="text-right py-3 px-4 font-medium text-text-secondary font-body">
                Gewichteter Score
              </th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(quantitativeWeights).map(([key, weight]) => {
              const detail = details[key];
              if (!detail) return null;
              return (
                <tr key={key} className="border-b border-border/50 hover:bg-surface/50">
                  <td className="py-3 px-4 text-text-primary font-body">
                    {METRIC_LABELS[key]}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-text-primary">
                    {formatMetricValue(key, detail.value)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${scoreDotColor(detail.score)}`}
                      />
                      <span className="font-mono font-medium">{detail.score}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-text-secondary">
                    {(weight * 100).toFixed(0)} %
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-medium text-text-primary">
                    {detail.weightedScore.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-surface">
              <td className="py-3 px-4 font-semibold text-text-primary font-headline" colSpan={2}>
                Finanzielles Gesamtrating
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center justify-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${scoreDotColor(score)}`} />
                  <span className="font-mono font-bold text-base">{score.toFixed(2)}</span>
                </div>
              </td>
              <td className="py-3 px-4 text-right font-mono font-semibold text-text-secondary">
                100 %
              </td>
              <td className="py-3 px-4 text-right font-mono font-bold text-base text-text-primary">
                {score.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-xs text-text-muted pt-2">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          Score 1-2 (gut)
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          Score 3-4 (mittel)
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          Score 5-6 (schwach)
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Tab 2: Qualitatives Rating
// =============================================================================

function QualitativesRating({ answers, setAnswers, qualScore }) {
  const handleChange = (key, value) => {
    setAnswers((prev) => ({ ...prev, [key]: parseInt(value, 10) }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-1">
        <ClipboardList size={18} strokeWidth={1.5} className="text-primary" />
        <h2 className="font-headline text-lg font-semibold text-text-primary">
          Qualitatives Rating
        </h2>
      </div>
      <p className="text-sm text-text-secondary -mt-4">
        Bewertung nicht-finanzieller Faktoren durch den Kreditanalysten. Jede Frage wird auf einer
        Skala von 1 (Sehr gut) bis 5 (Mangelhaft) bewertet.
      </p>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {QUALITATIVE_GROUPS.map((group) => {
          const GroupIcon = group.icon;
          return (
            <div
              key={group.title}
              className="border border-border rounded-xl overflow-hidden"
            >
              <div className="flex items-center gap-2 px-4 py-3 bg-surface border-b border-border">
                <GroupIcon size={16} strokeWidth={1.5} className="text-primary-light" />
                <h3 className="font-headline text-sm font-semibold text-text-primary">
                  {group.title}
                </h3>
              </div>
              <div className="divide-y divide-border/50">
                {group.questions.map((q) => (
                  <div
                    key={q.key}
                    className="flex items-center justify-between gap-4 px-4 py-3"
                  >
                    <label
                      htmlFor={q.key}
                      className="text-sm text-text-primary font-body flex-1"
                    >
                      {q.label}
                    </label>
                    <div className="flex items-center gap-2">
                      <select
                        id={q.key}
                        value={answers[q.key] ?? 3}
                        onChange={(e) => handleChange(q.key, e.target.value)}
                        className="border border-border rounded-lg px-3 py-1.5 text-sm font-body bg-surface-card text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary min-w-[160px]"
                      >
                        {Object.entries(SCORE_LABELS).map(([val, label]) => (
                          <option key={val} value={val}>
                            {val} - {label}
                          </option>
                        ))}
                      </select>
                      <span
                        className={`w-2.5 h-2.5 rounded-full shrink-0 ${scoreDotColor(
                          answers[q.key] ?? 3
                        )}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Qualitative Score Summary */}
      <div className="flex items-center justify-between bg-surface border border-border rounded-xl px-6 py-4">
        <div className="flex items-center gap-3">
          <span className={`w-3 h-3 rounded-full ${scoreDotColor(qualScore)}`} />
          <span className="font-headline font-semibold text-text-primary">
            Qualitatives Gesamtrating
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center rounded-lg px-3 py-1 text-sm font-mono font-semibold ${scoreBgColor(
              qualScore
            )}`}
          >
            {qualScore.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Tab 3: Eigentuemer-Rating
// =============================================================================

function schufaToScore(value) {
  if (value == null) return null;
  if (value >= 97.5) return 1;
  if (value >= 95) return 2;
  if (value >= 90) return 3;
  if (value >= 85) return 4;
  return 5;
}

function creditreformToScore(value) {
  if (value == null) return null;
  if (value <= 200) return 1;
  if (value <= 250) return 2;
  if (value <= 300) return 3;
  if (value <= 350) return 4;
  return 5;
}

function EigentuemerRating({
  company,
  schufaScores,
  ownerScore,
  ownerInsolvenz,
  setOwnerInsolvenz,
  ownerVermoegen,
  setOwnerVermoegen,
  ownerNegativ,
  setOwnerNegativ,
  totalOwnerAdjustment,
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-1">
        <UserCheck size={18} strokeWidth={1.5} className="text-primary" />
        <h2 className="font-headline text-lg font-semibold text-text-primary">
          Eigentümer-Rating
        </h2>
      </div>
      <p className="text-sm text-text-secondary -mt-4">
        Bewertung der Geschäftsführer/Eigentümer anhand externer Bonitätsinformationen und
        individueller Risikofaktoren.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {company.gf.map((gf, idx) => {
          const schufaVal = schufaScores[idx];
          const schufaSc = schufaToScore(schufaVal);
          const crScore = creditreformToScore(company.creditreform_index);

          return (
            <div
              key={idx}
              className="border border-border rounded-xl overflow-hidden"
            >
              {/* GF Header */}
              <div className="flex items-center gap-3 px-5 py-4 bg-surface border-b border-border">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <UserCheck size={18} strokeWidth={1.5} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-headline text-sm font-semibold text-text-primary">
                    {gf.name}
                  </h3>
                  <p className="text-xs text-text-muted">
                    {gf.funktion}
                    {gf.anteil != null && ` · ${gf.anteil}% Anteil`}
                    {gf.erfahrung != null && ` · ${gf.erfahrung} Jahre Erfahrung`}
                  </p>
                </div>
              </div>

              <div className="p-5 space-y-4">
                {/* Schufa Score */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">Schufa-Score</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-medium text-text-primary">
                      {schufaVal != null ? formatNumber(schufaVal, 1) : '–'}
                    </span>
                    {schufaSc != null && (
                      <span
                        className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-mono font-medium ${scoreBgColor(
                          schufaSc
                        )}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${scoreDotColor(schufaSc)}`} />
                        {schufaSc}
                      </span>
                    )}
                  </div>
                </div>

                {/* Creditreform Index */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">
                    Creditreform-Bonitätsindex
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-medium text-text-primary">
                      {company.creditreform_index}
                    </span>
                    {crScore != null && (
                      <span
                        className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-mono font-medium ${scoreBgColor(
                          crScore
                        )}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${scoreDotColor(crScore)}`}
                        />
                        {crScore}
                      </span>
                    )}
                  </div>
                </div>

                <div className="border-t border-border/50 pt-4 space-y-3">
                  {/* Insolvenzhistorie */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">Insolvenzhistorie</span>
                    <button
                      onClick={() =>
                        setOwnerInsolvenz((prev) => ({ ...prev, [idx]: !prev[idx] }))
                      }
                      className="flex items-center gap-2"
                    >
                      {ownerInsolvenz[idx] ? (
                        <ToggleRight
                          size={28}
                          strokeWidth={1.5}
                          className="text-danger"
                        />
                      ) : (
                        <ToggleLeft
                          size={28}
                          strokeWidth={1.5}
                          className="text-accent"
                        />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          ownerInsolvenz[idx] ? 'text-danger' : 'text-accent'
                        }`}
                      >
                        {ownerInsolvenz[idx] ? 'Ja' : 'Nein'}
                      </span>
                    </button>
                  </div>

                  {/* Vermoegenserhaeltnisse */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">Vermögensverhältnisse</span>
                    <select
                      value={ownerVermoegen[idx] ?? 'geordnet'}
                      onChange={(e) =>
                        setOwnerVermoegen((prev) => ({
                          ...prev,
                          [idx]: e.target.value,
                        }))
                      }
                      className="border border-border rounded-lg px-3 py-1.5 text-sm font-body bg-surface-card text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      {VERMOEGEN_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Negativmerkmale */}
                  <div>
                    <span className="text-sm text-text-secondary block mb-2">
                      Negativmerkmale
                    </span>
                    <div className="flex flex-wrap gap-3">
                      {NEGATIV_MERKMALE.map((nm) => (
                        <label
                          key={nm.key}
                          className="inline-flex items-center gap-1.5 text-sm cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={ownerNegativ[idx]?.[nm.key] ?? false}
                            onChange={(e) =>
                              setOwnerNegativ((prev) => ({
                                ...prev,
                                [idx]: {
                                  ...(prev[idx] || {}),
                                  [nm.key]: e.target.checked,
                                },
                              }))
                            }
                            className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
                          />
                          <span className="text-text-primary">{nm.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Owner Score Summary */}
      <div className="flex items-center justify-between bg-surface border border-border rounded-xl px-6 py-4">
        <div className="flex items-center gap-3">
          <span className={`w-3 h-3 rounded-full ${scoreDotColor(ownerScore)}`} />
          <span className="font-headline font-semibold text-text-primary">
            Eigentümer-Score
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span
            className={`inline-flex items-center rounded-lg px-3 py-1 text-sm font-mono font-semibold ${scoreBgColor(
              ownerScore
            )}`}
          >
            {ownerScore.toFixed(1)}
          </span>
          <span className="text-sm text-text-secondary">
            Adjustierung:{' '}
            <span
              className={`font-mono font-semibold ${
                totalOwnerAdjustment > 0
                  ? 'text-danger'
                  : totalOwnerAdjustment < 0
                  ? 'text-accent'
                  : 'text-text-muted'
              }`}
            >
              {totalOwnerAdjustment >= 0 ? '+' : ''}
              {totalOwnerAdjustment.toFixed(2)}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Tab 4: Kontofuehrungsrating
// =============================================================================

function KontofuehrungsRating({ konto, accountScore }) {
  // Scoring helpers for display
  const auslastungScore = konto.auslastung_avg > 90 ? 5 : konto.auslastung_avg > 75 ? 3 : 1;
  const ueberziehungScore =
    konto.ueberziehungen_12m > 6 ? 5 : konto.ueberziehungen_12m > 3 ? 3 : 1;
  const rlScore =
    konto.ruecklastschriften_12m > 3 ? 5 : konto.ruecklastschriften_12m > 0 ? 3 : 1;

  const trendIcon =
    konto.umsatztrend === 'steigend' ? (
      <TrendingUp size={18} strokeWidth={1.5} className="text-accent" />
    ) : konto.umsatztrend === 'fallend' ? (
      <TrendingDown size={18} strokeWidth={1.5} className="text-danger" />
    ) : (
      <Minus size={18} strokeWidth={1.5} className="text-accent-warm" />
    );

  const trendLabel =
    konto.umsatztrend === 'steigend'
      ? 'Steigend'
      : konto.umsatztrend === 'fallend'
      ? 'Fallend'
      : 'Stabil';

  const trendColor =
    konto.umsatztrend === 'steigend'
      ? 'text-accent'
      : konto.umsatztrend === 'fallend'
      ? 'text-danger'
      : 'text-accent-warm';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-1">
        <Landmark size={18} strokeWidth={1.5} className="text-primary" />
        <h2 className="font-headline text-lg font-semibold text-text-primary">
          Kontoführungsrating
        </h2>
      </div>
      <p className="text-sm text-text-secondary -mt-4">
        Analyse des Zahlungsverhaltens und der Kontoführung auf Basis der letzten 12 Monate.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Kontoauslastung */}
        <div className="border border-border rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-text-secondary">
              Durchschn. Kontoauslastung
            </span>
            <span
              className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-mono font-medium ${scoreBgColor(
                auslastungScore
              )}`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${scoreDotColor(auslastungScore)}`}
              />
              {auslastungScore <= 2 ? 'Gut' : auslastungScore <= 4 ? 'Mittel' : 'Kritisch'}
            </span>
          </div>
          <div className="flex items-end gap-2">
            <span className="font-mono text-2xl font-bold text-text-primary">
              {konto.auslastung_avg}%
            </span>
          </div>
          {/* Gauge bar */}
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full transition-all ${
                konto.auslastung_avg > 90
                  ? 'bg-red-500'
                  : konto.auslastung_avg > 75
                  ? 'bg-amber-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(100, konto.auslastung_avg)}%` }}
            />
          </div>
          <p className="text-xs text-text-muted">
            Schwellenwerte: &le;75% gut, 75-90% mittel, &gt;90% kritisch
          </p>
        </div>

        {/* Ueberziehungen */}
        <div className="border border-border rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-text-secondary">
              Überziehungen (12M)
            </span>
            <span
              className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-mono font-medium ${scoreBgColor(
                ueberziehungScore
              )}`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${scoreDotColor(ueberziehungScore)}`}
              />
              {ueberziehungScore <= 2 ? 'Gut' : ueberziehungScore <= 4 ? 'Mittel' : 'Kritisch'}
            </span>
          </div>
          <div className="flex items-end gap-2">
            <span className="font-mono text-2xl font-bold text-text-primary">
              {konto.ueberziehungen_12m}
            </span>
            <span className="text-sm text-text-muted mb-0.5">Mal</span>
          </div>
          <p className="text-xs text-text-muted">
            Schwellenwerte: &le;3 gut, 4-6 mittel, &gt;6 kritisch
          </p>
        </div>

        {/* Ruecklastschriften */}
        <div className="border border-border rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-text-secondary">
              Rücklastschriften (12M)
            </span>
            <span
              className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-mono font-medium ${scoreBgColor(
                rlScore
              )}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${scoreDotColor(rlScore)}`} />
              {rlScore <= 2 ? 'Gut' : rlScore <= 4 ? 'Mittel' : 'Kritisch'}
            </span>
          </div>
          <div className="flex items-end gap-2">
            <span className="font-mono text-2xl font-bold text-text-primary">
              {konto.ruecklastschriften_12m}
            </span>
            <span className="text-sm text-text-muted mb-0.5">Stück</span>
          </div>
          <p className="text-xs text-text-muted">
            Schwellenwerte: 0 gut, 1-3 mittel, &gt;3 kritisch
          </p>
        </div>

        {/* Pfaendungen */}
        <div className="border border-border rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-text-secondary">Pfändungen</span>
            {konto.pfaendungen ? (
              <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium bg-red-50 text-red-700">
                <XCircle size={12} strokeWidth={1.5} />
                Vorhanden
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium bg-green-50 text-green-700">
                <CheckCircle2 size={12} strokeWidth={1.5} />
                Keine
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {konto.pfaendungen ? (
              <AlertTriangle size={24} strokeWidth={1.5} className="text-danger" />
            ) : (
              <Shield size={24} strokeWidth={1.5} className="text-accent" />
            )}
            <span
              className={`font-semibold text-lg ${
                konto.pfaendungen ? 'text-danger' : 'text-accent'
              }`}
            >
              {konto.pfaendungen ? 'Ja' : 'Nein'}
            </span>
          </div>
        </div>

        {/* Ungenehmigte Ueberziehungen */}
        <div className="border border-border rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-text-secondary">
              Ungenehm. Überziehungen
            </span>
            {konto.ueberziehungen_12m > 6 ? (
              <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium bg-red-50 text-red-700">
                <AlertTriangle size={12} strokeWidth={1.5} />
                Auffällig
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium bg-green-50 text-green-700">
                <CheckCircle2 size={12} strokeWidth={1.5} />
                Unauffällig
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {konto.ueberziehungen_12m > 6 ? (
              <AlertTriangle size={24} strokeWidth={1.5} className="text-danger" />
            ) : (
              <Shield size={24} strokeWidth={1.5} className="text-accent" />
            )}
            <span
              className={`font-semibold text-lg ${
                konto.ueberziehungen_12m > 6 ? 'text-danger' : 'text-accent'
              }`}
            >
              {konto.ueberziehungen_12m > 6 ? 'Häufig' : 'Selten/Keine'}
            </span>
          </div>
        </div>

        {/* Umsatztrend */}
        <div className="border border-border rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-text-secondary">Umsatztrend</span>
          </div>
          <div className="flex items-center gap-3">
            {trendIcon}
            <span className={`font-semibold text-lg ${trendColor}`}>{trendLabel}</span>
          </div>
          <p className="text-xs text-text-muted">
            Basierend auf Kontoumsätzen der letzten 12 Monate
          </p>
        </div>
      </div>

      {/* Account Score Summary */}
      <div className="flex items-center justify-between bg-surface border border-border rounded-xl px-6 py-4">
        <div className="flex items-center gap-3">
          <span className={`w-3 h-3 rounded-full ${scoreDotColor(accountScore)}`} />
          <span className="font-headline font-semibold text-text-primary">
            Kontoführungs-Gesamtscore
          </span>
        </div>
        <span
          className={`inline-flex items-center rounded-lg px-3 py-1 text-sm font-mono font-semibold ${scoreBgColor(
            accountScore
          )}`}
        >
          {accountScore.toFixed(1)}
        </span>
      </div>
    </div>
  );
}

// =============================================================================
// Tab 5: Gesamtrating & PD-Zuordnung
// =============================================================================

function GesamtRating({
  quantScore,
  qualScore,
  accountScore,
  ownerAdjustment,
  overallScore,
  ratingClass,
  ratingSkala,
  setRatingSkala,
  company,
}) {
  const color = ratingColor(ratingClass.klasse);

  // Map to VR scale by finding closest PD
  const vrMatch = useMemo(() => {
    const pd = ratingClass.pd;
    let best = vrSkala[0];
    let bestDiff = Math.abs(vrSkala[0].pd - pd);
    for (const entry of vrSkala) {
      if (entry.ausfall) continue;
      const diff = Math.abs(entry.pd - pd);
      if (diff < bestDiff) {
        bestDiff = diff;
        best = entry;
      }
    }
    return best;
  }, [ratingClass.pd]);

  // Map to Sparkassen scale by finding closest PD
  const spkMatch = useMemo(() => {
    const pd = ratingClass.pd;
    let best = sparkassenSkala[0];
    let bestDiff = Math.abs(sparkassenSkala[0].pd - pd);
    for (const entry of sparkassenSkala) {
      if (entry.ausfall) continue;
      const diff = Math.abs(entry.pd - pd);
      if (diff < bestDiff) {
        bestDiff = diff;
        best = entry;
      }
    }
    return best;
  }, [ratingClass.pd]);

  const displayScale = ratingSkala === 'sparkassen' ? spkMatch : vrMatch;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 mb-1">
        <Award size={18} strokeWidth={1.5} className="text-primary" />
        <h2 className="font-headline text-lg font-semibold text-text-primary">
          Gesamtrating & PD-Zuordnung
        </h2>
      </div>

      {/* Score Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Score table */}
        <div className="border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-3 bg-surface border-b border-border">
            <h3 className="font-headline text-sm font-semibold text-text-primary">
              Rating-Komposition
            </h3>
          </div>
          <div className="p-5">
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-border/50">
                  <td className="py-3 text-text-secondary">Quantitatives Rating</td>
                  <td className="py-3 text-right text-text-muted font-mono">(65%)</td>
                  <td className="py-3 text-right font-mono font-semibold text-text-primary pl-4">
                    {quantScore.toFixed(2)}
                  </td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3 text-text-secondary">Qualitatives Rating</td>
                  <td className="py-3 text-right text-text-muted font-mono">(25%)</td>
                  <td className="py-3 text-right font-mono font-semibold text-text-primary pl-4">
                    {qualScore.toFixed(2)}
                  </td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-3 text-text-secondary">Kontoführungsrating</td>
                  <td className="py-3 text-right text-text-muted font-mono">(10%)</td>
                  <td className="py-3 text-right font-mono font-semibold text-text-primary pl-4">
                    {accountScore.toFixed(2)}
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-3 text-text-secondary">Eigentümer-Adjustierung</td>
                  <td className="py-3 text-right text-text-muted font-mono" />
                  <td
                    className={`py-3 text-right font-mono font-semibold pl-4 ${
                      ownerAdjustment > 0
                        ? 'text-danger'
                        : ownerAdjustment < 0
                        ? 'text-accent'
                        : 'text-text-muted'
                    }`}
                  >
                    {ownerAdjustment >= 0 ? '+' : ''}
                    {ownerAdjustment.toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 font-headline font-bold text-text-primary">GESAMTRATING</td>
                  <td />
                  <td className="py-3 text-right font-mono font-bold text-base text-text-primary pl-4">
                    {overallScore.toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td className="py-1 text-text-secondary">Ratingklasse</td>
                  <td />
                  <td className="py-1 text-right">
                    <span
                      className="inline-flex items-center rounded-lg px-3 py-1 text-sm font-mono font-bold"
                      style={{
                        backgroundColor: color + '18',
                        color: color,
                      }}
                    >
                      Klasse {ratingClass.klasse}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-1 text-text-secondary">Ausfallwahrscheinlichkeit</td>
                  <td />
                  <td className="py-1 text-right font-mono font-semibold text-text-primary">
                    {ratingClass.pd.toFixed(2)}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Large rating badge */}
        <div className="flex flex-col items-center justify-center border border-border rounded-xl p-8">
          <div
            className="w-36 h-36 rounded-full flex flex-col items-center justify-center shadow-lg mb-4"
            style={{
              backgroundColor: color + '15',
              border: `4px solid ${color}`,
            }}
          >
            <span className="text-xs font-body uppercase tracking-wider" style={{ color }}>
              Klasse
            </span>
            <span className="text-4xl font-headline font-bold" style={{ color }}>
              {ratingClass.klasse}
            </span>
          </div>
          <p className="text-sm text-text-secondary mt-2">Ausfallwahrscheinlichkeit</p>
          <p className="font-mono text-2xl font-bold text-text-primary">
            {ratingClass.pd.toFixed(2)}%
          </p>
          <p className="text-xs text-text-muted mt-1">
            p.a. (1-Jahres-PD)
          </p>
        </div>
      </div>

      {/* Scale Toggle */}
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 bg-surface border-b border-border">
          <h3 className="font-headline text-sm font-semibold text-text-primary">
            Rating-Skala Zuordnung
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setRatingSkala('sparkassen')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                ratingSkala === 'sparkassen'
                  ? 'bg-primary text-white'
                  : 'bg-surface-card border border-border text-text-secondary hover:text-text-primary'
              }`}
            >
              Sparkassen-Masterskala
            </button>
            <button
              onClick={() => setRatingSkala('vr')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                ratingSkala === 'vr'
                  ? 'bg-primary text-white'
                  : 'bg-surface-card border border-border text-text-secondary hover:text-text-primary'
              }`}
            >
              VR-Rating
            </button>
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center shrink-0"
              style={{
                backgroundColor: displayScale.farbe + '18',
                border: `2px solid ${displayScale.farbe}`,
              }}
            >
              <span
                className="text-lg font-mono font-bold"
                style={{ color: displayScale.farbe }}
              >
                {displayScale.klasse}
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">
                {ratingSkala === 'sparkassen' ? 'Sparkassen' : 'VR'}-Klasse {displayScale.klasse}
              </p>
              <p className="text-sm text-text-secondary">{displayScale.bezeichnung}</p>
              <p className="text-xs text-text-muted font-mono mt-0.5">
                PD: {displayScale.pd.toFixed(2)}%
              </p>
            </div>
          </div>

          {/* Mini scale visualization */}
          <div className="mt-5 pt-4 border-t border-border/50">
            <p className="text-xs text-text-muted mb-2">
              Position auf der {ratingSkala === 'sparkassen' ? 'Sparkassen' : 'VR'}-Skala:
            </p>
            <div className="flex gap-0.5">
              {(ratingSkala === 'sparkassen' ? sparkassenSkala : vrSkala)
                .filter((s) => !s.ausfall)
                .map((s) => {
                  const isActive = s.klasse === displayScale.klasse;
                  return (
                    <div
                      key={s.klasse}
                      className="flex-1 relative group"
                      title={`${s.klasse}: ${s.bezeichnung} (PD ${s.pd}%)`}
                    >
                      <div
                        className={`h-3 rounded-sm transition-all ${
                          isActive ? 'ring-2 ring-offset-1 ring-primary scale-y-150' : ''
                        }`}
                        style={{
                          backgroundColor: isActive ? s.farbe : s.farbe + '50',
                        }}
                      />
                      {isActive && (
                        <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                          <span className="text-[10px] font-mono font-bold text-text-primary whitespace-nowrap">
                            {s.klasse}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-text-muted">Gut</span>
              <span className="text-[10px] text-text-muted">Schlecht</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rating Card (print-friendly summary) */}
      <div className="border border-border rounded-xl overflow-hidden" id="rating-karte">
        <div className="flex items-center justify-between px-5 py-3 bg-surface border-b border-border">
          <h3 className="font-headline text-sm font-semibold text-text-primary">
            Rating-Karte
          </h3>
          <button
            onClick={() => window.print()}
            className="no-print inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-surface-card border border-border text-text-secondary hover:text-text-primary transition-colors"
          >
            <Printer size={14} strokeWidth={1.5} />
            Drucken
          </button>
        </div>

        <div className="p-6">
          {/* Company header */}
          <div className="flex items-start justify-between mb-6 pb-4 border-b border-border">
            <div>
              <h4 className="font-headline text-base font-semibold text-text-primary">
                {company.firma}
              </h4>
              <p className="text-xs text-text-muted mt-0.5">
                {company.rechtsform} | {company.branche} | {company.adresse.ort}
              </p>
              <p className="text-xs text-text-muted">
                Bearbeiter: {company.bearbeiter} | Stand:{' '}
                {new Date().toLocaleDateString('de-DE')}
              </p>
            </div>
            <div
              className="w-20 h-20 rounded-full flex flex-col items-center justify-center shrink-0"
              style={{
                backgroundColor: color + '15',
                border: `3px solid ${color}`,
              }}
            >
              <span className="text-[9px] font-body uppercase tracking-wider" style={{ color }}>
                Klasse
              </span>
              <span className="text-2xl font-headline font-bold" style={{ color }}>
                {ratingClass.klasse}
              </span>
            </div>
          </div>

          {/* Components grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-surface rounded-lg p-3 text-center">
              <p className="text-xs text-text-muted mb-1">Quantitativ (65%)</p>
              <p className="font-mono font-bold text-lg text-text-primary">
                {quantScore.toFixed(2)}
              </p>
              <span
                className={`inline-block w-2 h-2 rounded-full mt-1 ${scoreDotColor(quantScore)}`}
              />
            </div>
            <div className="bg-surface rounded-lg p-3 text-center">
              <p className="text-xs text-text-muted mb-1">Qualitativ (25%)</p>
              <p className="font-mono font-bold text-lg text-text-primary">
                {qualScore.toFixed(2)}
              </p>
              <span
                className={`inline-block w-2 h-2 rounded-full mt-1 ${scoreDotColor(qualScore)}`}
              />
            </div>
            <div className="bg-surface rounded-lg p-3 text-center">
              <p className="text-xs text-text-muted mb-1">Kontoführung (10%)</p>
              <p className="font-mono font-bold text-lg text-text-primary">
                {accountScore.toFixed(1)}
              </p>
              <span
                className={`inline-block w-2 h-2 rounded-full mt-1 ${scoreDotColor(
                  accountScore
                )}`}
              />
            </div>
            <div className="bg-surface rounded-lg p-3 text-center">
              <p className="text-xs text-text-muted mb-1">Eigentümer-Adj.</p>
              <p
                className={`font-mono font-bold text-lg ${
                  ownerAdjustment > 0
                    ? 'text-danger'
                    : ownerAdjustment < 0
                    ? 'text-accent'
                    : 'text-text-muted'
                }`}
              >
                {ownerAdjustment >= 0 ? '+' : ''}
                {ownerAdjustment.toFixed(2)}
              </p>
              <span
                className={`inline-block w-2 h-2 rounded-full mt-1 ${scoreDotColor(
                  Math.abs(ownerAdjustment) < 0.3 ? 2 : Math.abs(ownerAdjustment) < 0.7 ? 3 : 5
                )}`}
              />
            </div>
          </div>

          {/* Bottom summary */}
          <div
            className="rounded-xl p-4 flex items-center justify-between"
            style={{ backgroundColor: color + '0A', border: `1px solid ${color}30` }}
          >
            <div>
              <p className="text-xs text-text-muted">Gesamtrating</p>
              <p className="font-headline text-lg font-bold text-text-primary">
                Klasse {ratingClass.klasse}
              </p>
              <p className="text-xs text-text-secondary">
                Score: {overallScore.toFixed(2)} | PD: {ratingClass.pd.toFixed(2)}% p.a.
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-text-muted">
                {ratingSkala === 'sparkassen' ? 'Sparkassen-Skala' : 'VR-Rating'}
              </p>
              <p className="font-headline text-sm font-semibold text-text-primary">
                {displayScale.klasse} - {displayScale.bezeichnung}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
