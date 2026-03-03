/**
 * AnalysisView -- §18 KWG Pruefung (Analysis) view for credit analysis.
 *
 * Four tabs:
 *   1. Dokumenten-Upload   -- §18 threshold check, document status cards
 *   2. Bilanzanalyse       -- Balance sheet tables, GuV, Kennzahlen dashboard, KI analysis
 *   3. BWA-Analyse         -- Monthly revenue/profit chart with Recharts
 *   4. Kapitaldienstfaehigkeit -- DSCR calculator with stress-test sliders
 */

import { useState, useMemo } from 'react';
import {
  FileText,
  Upload,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Loader2,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  ShieldCheck,
  ShieldAlert,
  TrendingUp,
  TrendingDown,
  Calculator,
  BarChart3,
  ClipboardList,
  Info,
} from 'lucide-react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { useApp } from '../../context/AppContext';
import {
  calculateAllRatios,
  changePercent,
  getBilanzsumme,
  getAnlagevermoegen,
  getUmlaufvermoegen,
  getEBITDA,
  getEBIT,
  getFremdkapital,
  getNettoverschuldung,
  getOperativerCashflow,
  getGesamtleistung,
} from '../../utils/financialCalculations';
import { formatCurrency, formatPercent, formatNumber } from '../../utils/formatters';
import { scoreMetric, scoreToTrafficLight } from '../../utils/ratingEngine';

// =============================================================================
// Constants
// =============================================================================

const YEARS = [2023, 2022, 2021];

const TABS = [
  { key: 'dokumente', label: 'Dokumenten-Upload', icon: ClipboardList },
  { key: 'bilanz', label: 'Bilanzanalyse', icon: BarChart3 },
  { key: 'bwa', label: 'BWA-Analyse', icon: TrendingUp },
  { key: 'kapitaldienst', label: 'Kapitaldienstfähigkeit', icon: Calculator },
];

const DOCUMENTS = [
  { name: 'Jahresabschluss 2023', status: 'Extrahiert', type: 'bilanz' },
  { name: 'Jahresabschluss 2022', status: 'Extrahiert', type: 'bilanz' },
  { name: 'Jahresabschluss 2021', status: 'Extrahiert', type: 'bilanz' },
  { name: 'BWA aktuell', status: 'Hochgeladen', type: 'bwa' },
  { name: 'Summen-Saldenliste', status: 'Offen', type: 'ssl' },
  { name: 'Steuerbescheide', status: 'Offen', type: 'steuer' },
  { name: 'Planungsrechnung', status: 'Offen', type: 'plan' },
];

const STATUS_STYLES = {
  Extrahiert: 'bg-green-50 text-green-700 border-green-200',
  Hochgeladen: 'bg-amber-50 text-amber-700 border-amber-200',
  Offen: 'bg-slate-100 text-text-muted border-border',
};

const MONTH_LABELS = [
  'Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun',
  'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez',
];

/** Hardcoded KI analysis demo text */
const KI_ANALYSIS_TEXT = `**Zusammenfassung der Bilanzanalyse**

Die Analyse der Jahresabschlüsse 2021–2023 zeigt eine insgesamt solide wirtschaftliche Entwicklung des Unternehmens mit einigen bemerkenswerten Trends:

**Vermögens- und Kapitalstruktur:**
Die Eigenkapitalquote liegt mit über 30% auf einem branchenüberdurchschnittlichen Niveau und hat sich im Betrachtungszeitraum leicht verbessert. Die Anlagendeckung II übersteigt konsistent 100%, was auf eine fristenkongruente Finanzierung hindeutet. Der Verschuldungsgrad ist moderat und rückläufig.

**Ertragslage:**
Die Umsatzerlöse zeigen eine positive Entwicklung mit einem Wachstum von ca. 5–8% p.a. Die EBITDA-Marge hat sich stabilisiert und liegt im branchentypischen Korridor. Die Personalaufwandsquote ist leicht gestiegen, was auf Investitionen in qualifiziertes Personal hindeutet. Der Jahresüberschuss konnte trotz gestiegener Materialkosten gehalten werden.

**Liquiditätslage:**
Die Liquidität 2. Grades liegt deutlich über 100%, was eine solide kurzfristige Zahlungsfähigkeit signalisiert. Die Working-Capital-Position ist positiv und hat sich verbessert. Die liquiden Mittel sind ausreichend für den operativen Geschäftsbetrieb.

**Entschuldungsfähigkeit:**
Der dynamische Verschuldungsgrad liegt unter 5 Jahren, was auf eine angemessene Entschuldungsfähigkeit hindeutet. Der Zinsdeckungsgrad ist komfortabel und zeigt ausreichend Puffer für den zusätzlichen Kapitaldienst des beantragten Kredits.

**Risikofaktoren:**
- Steigende Materialkosten könnten die Margen unter Druck setzen
- Die Forderungslaufzeiten haben sich leicht verlängert
- Abhängigkeit von wenigen Großkunden sollte beobachtet werden

**Gesamturteil:**
Das Unternehmen weist eine stabile Bilanzstruktur, ausreichende Ertragskraft und angemessene Entschuldungsfähigkeit auf. Die Kapitaldienstfähigkeit für den beantragten Kredit erscheint gegeben. Eine Fortführung der positiven Entwicklung ist bei stabilem Marktumfeld wahrscheinlich.`;

// =============================================================================
// Metric definitions for Kennzahlen dashboard
// =============================================================================

const METRIC_GROUPS = [
  {
    title: 'Vermögens-/Kapitalstruktur',
    metrics: [
      { key: 'eigenkapitalquote', label: 'Eigenkapitalquote', unit: '%', formula: 'Eigenkapital / Bilanzsumme × 100' },
      { key: 'verschuldungsgrad', label: 'Verschuldungsgrad', unit: '%', formula: 'Fremdkapital / Eigenkapital × 100' },
      { key: 'anlagendeckung1', label: 'Anlagendeckung I', unit: '%', formula: 'Eigenkapital / Anlagevermögen × 100' },
      { key: 'anlagendeckung2', label: 'Anlagendeckung II', unit: '%', formula: '(EK + langfr. FK) / AV × 100' },
      { key: 'anlagenintensitaet', label: 'Anlagenintensität', unit: '%', formula: 'Anlagevermögen / Bilanzsumme × 100' },
    ],
  },
  {
    title: 'Ertragskraft',
    metrics: [
      { key: 'umsatzrentabilitaet', label: 'Umsatzrentabilität', unit: '%', formula: 'Jahresüberschuss / Umsatz × 100' },
      { key: 'gesamtkapitalrentabilitaet', label: 'GK-Rentabilität', unit: '%', formula: '(JÜ + Zinsen) / Bilanzsumme × 100' },
      { key: 'ebitda_marge', label: 'EBITDA-Marge', unit: '%', formula: 'EBITDA / Umsatz × 100' },
      { key: 'cashflow_rate', label: 'Cashflow-Rate', unit: '%', formula: 'Operativer CF / Umsatz × 100' },
      { key: 'personalaufwandsquote', label: 'Personalaufwandsquote', unit: '%', formula: 'Personalaufwand / Gesamtleistung × 100' },
      { key: 'materialaufwandsquote', label: 'Materialaufwandsquote', unit: '%', formula: 'Materialaufwand / Gesamtleistung × 100' },
    ],
  },
  {
    title: 'Liquidität',
    metrics: [
      { key: 'liquiditaet1', label: 'Liquidität 1. Grades', unit: '%', formula: 'Liquide Mittel / kurzfr. Verb. × 100' },
      { key: 'liquiditaet2', label: 'Liquidität 2. Grades', unit: '%', formula: '(Liquide + Ford.) / kurzfr. Verb. × 100' },
      { key: 'liquiditaet3', label: 'Liquidität 3. Grades', unit: '%', formula: 'Umlaufvermögen / kurzfr. Verb. × 100' },
      { key: 'working_capital', label: 'Working Capital', unit: '€', formula: 'Umlaufvermögen − kurzfr. Verb.' },
    ],
  },
  {
    title: 'Entschuldungsfähigkeit',
    metrics: [
      { key: 'dynamischer_verschuldungsgrad', label: 'Dyn. Verschuldungsgrad', unit: 'J.', formula: 'Nettoverschuldung / EBITDA' },
      { key: 'zinsdeckungsgrad', label: 'Zinsdeckungsgrad', unit: 'x', formula: 'EBIT / Zinsaufwand' },
      { key: 'schuldentilgungsdauer', label: 'Schuldentilgungsdauer', unit: 'J.', formula: 'Nettoverschuldung / Oper. CF' },
    ],
  },
];

// =============================================================================
// Helper components
// =============================================================================

/** Traffic light dot */
function TrafficDot({ color, size = 'md' }) {
  const sizeClass = size === 'sm' ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5';
  const colorClass =
    color === 'green' ? 'bg-green-500' :
    color === 'yellow' ? 'bg-amber-400' :
    'bg-red-500';
  return <span className={`inline-block ${sizeClass} rounded-full ${colorClass} shrink-0`} />;
}

/** Formatted change percentage with color */
function ChangeCell({ current, previous }) {
  const pct = changePercent(current, previous);
  if (pct == null) return <td className="px-3 py-2 text-right font-mono text-xs text-text-muted">--</td>;
  const positive = pct >= 0;
  const color = positive ? 'text-green-600' : 'text-red-600';
  return (
    <td className={`px-3 py-2 text-right font-mono text-xs ${color}`}>
      {positive ? '+' : ''}{formatNumber(pct, 1)}%
    </td>
  );
}

/** Section heading inside a tab */
function SectionHeading({ children }) {
  return <h3 className="text-base font-semibold font-headline text-text-primary mt-8 mb-3">{children}</h3>;
}

// =============================================================================
// Main component
// =============================================================================

export default function AnalysisView() {
  const { getSelectedCompany, navigate } = useApp();
  const company = getSelectedCompany();

  const [activeTab, setActiveTab] = useState('bilanz');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiExpanded, setAiExpanded] = useState(true);

  // Kapitaldienstfaehigkeit editable state
  const [kdOverrides, setKdOverrides] = useState({});
  const [stressUmsatz, setStressUmsatz] = useState(10);
  const [stressKosten, setStressKosten] = useState(5);
  const [stressZins, setStressZins] = useState(2);

  // ---------------------------------------------------------------------------
  // No-company fallback
  // ---------------------------------------------------------------------------
  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle size={48} strokeWidth={1.5} className="text-text-muted" />
        <p className="text-text-secondary font-body text-lg">
          Bitte wählen Sie einen Kreditantrag aus.
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
  const bilanz = company.bilanz || {};
  const b23 = bilanz[2023] || {};
  const b22 = bilanz[2022] || {};
  const b21 = bilanz[2021] || {};
  const branche = company.branche || 'Maschinenbau';

  const ratios23 = calculateAllRatios(b23);
  const ratios22 = calculateAllRatios(b22);
  const ratios21 = calculateAllRatios(b21);

  // §18 obligo calculation
  const bestVerbind = company.bestehende_verbindlichkeiten || [];
  const sumRestschuld = bestVerbind.reduce((s, v) => s + (v.restschuld || 0), 0);
  const kreditBetrag = company.kredit?.betrag || 0;
  const totalObligo = sumRestschuld + kreditBetrag;
  const obligo750 = totalObligo > 750000;

  // ---------------------------------------------------------------------------
  // KI Analysis handler
  // ---------------------------------------------------------------------------
  const handleKiAnalysis = () => {
    setAiLoading(true);
    setAiResult(null);
    setTimeout(() => {
      setAiLoading(false);
      setAiResult(KI_ANALYSIS_TEXT);
      setAiExpanded(true);
    }, 2000);
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
            §18 KWG Prüfung
          </h1>
          <p className="text-sm text-text-secondary font-body mt-0.5">
            {company.firma} — Kreditantrag {company.id}
          </p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex bg-surface-card border border-border rounded-lg overflow-hidden shadow-sm">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            className={`inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium font-body transition-colors ${
              activeTab === key
                ? 'bg-primary text-white'
                : 'bg-surface-card text-text-secondary hover:bg-surface hover:text-text-primary'
            }`}
          >
            <Icon size={16} strokeWidth={1.5} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'dokumente' && (
        <TabDokumente
          obligo750={obligo750}
          totalObligo={totalObligo}
        />
      )}
      {activeTab === 'bilanz' && (
        <TabBilanz
          b23={b23} b22={b22} b21={b21}
          ratios23={ratios23} ratios22={ratios22} ratios21={ratios21}
          branche={branche}
          aiLoading={aiLoading}
          aiResult={aiResult}
          aiExpanded={aiExpanded}
          setAiExpanded={setAiExpanded}
          onKiAnalysis={handleKiAnalysis}
        />
      )}
      {activeTab === 'bwa' && (
        <TabBWA b23={b23} />
      )}
      {activeTab === 'kapitaldienst' && (
        <TabKapitaldienst
          b23={b23}
          company={company}
          kdOverrides={kdOverrides}
          setKdOverrides={setKdOverrides}
          stressUmsatz={stressUmsatz}
          setStressUmsatz={setStressUmsatz}
          stressKosten={stressKosten}
          setStressKosten={setStressKosten}
          stressZins={stressZins}
          setStressZins={setStressZins}
        />
      )}
    </div>
  );
}

// =============================================================================
// TAB 1: Dokumenten-Upload
// =============================================================================

function TabDokumente({ obligo750, totalObligo }) {
  return (
    <div className="space-y-6">
      {/* §18 threshold banner */}
      <div
        className={`flex items-start gap-3 p-4 rounded-lg border ${
          obligo750
            ? 'bg-red-50 border-red-200'
            : 'bg-green-50 border-green-200'
        }`}
      >
        {obligo750 ? (
          <ShieldAlert size={24} strokeWidth={1.5} className="text-red-600 shrink-0 mt-0.5" />
        ) : (
          <ShieldCheck size={24} strokeWidth={1.5} className="text-green-600 shrink-0 mt-0.5" />
        )}
        <div>
          <p className={`text-sm font-semibold font-headline ${obligo750 ? 'text-red-800' : 'text-green-800'}`}>
            {obligo750
              ? '§18 KWG Offenlegungspflicht'
              : 'Vereinfachte Bonitätsprüfung möglich'}
          </p>
          <p className={`text-xs mt-1 ${obligo750 ? 'text-red-700' : 'text-green-700'}`}>
            Gesamtobligo: <span className="font-mono font-medium">{formatCurrency(totalObligo)}</span>
            {obligo750
              ? ' — Schwellenwert 750.000 € überschritten. Vollständige Offenlegung der wirtschaftlichen Verhältnisse gem. §18 KWG erforderlich.'
              : ' — Schwellenwert 750.000 € nicht erreicht. Vereinfachte Prüfung zulässig.'}
          </p>
        </div>
      </div>

      {/* Document cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {DOCUMENTS.map((doc) => (
          <div
            key={doc.name}
            className="bg-surface-card border border-border rounded-lg p-4 flex items-start gap-3 hover:shadow-sm transition-shadow"
          >
            <div className="p-2 rounded-lg bg-surface">
              <FileText size={20} strokeWidth={1.5} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium font-body text-text-primary truncate">{doc.name}</p>
              <div className="mt-1.5 flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border ${STATUS_STYLES[doc.status]}`}>
                  {doc.status === 'Extrahiert' && <CheckCircle size={12} strokeWidth={1.5} />}
                  {doc.status === 'Hochgeladen' && <AlertCircle size={12} strokeWidth={1.5} />}
                  {doc.status}
                </span>
                {doc.status === 'Extrahiert' && doc.name.includes('2021') && (
                  <span className="text-xs text-accent-warm font-body">Alter: 2+ Jahre</span>
                )}
              </div>
            </div>
            <button
              type="button"
              className="p-1.5 rounded-md hover:bg-surface transition-colors text-text-muted hover:text-primary"
              title={doc.status === 'Offen' ? 'Hochladen' : 'Ersetzen'}
            >
              <Upload size={16} strokeWidth={1.5} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// TAB 2: Bilanzanalyse
// =============================================================================

function TabBilanz({
  b23, b22, b21,
  ratios23, ratios22, ratios21,
  branche,
  aiLoading, aiResult, aiExpanded, setAiExpanded,
  onKiAnalysis,
}) {
  // Build data rows for the tables
  const years = [b23, b22, b21];

  return (
    <div className="space-y-2">
      {/* ---- AKTIVA ---- */}
      <SectionHeading>Aktiva</SectionHeading>
      <div className="overflow-x-auto">
        <table className="w-full text-sm font-body">
          <thead>
            <tr className="bg-primary text-white">
              <th className="px-3 py-2 text-left font-medium">Position</th>
              {YEARS.map((y) => (
                <th key={y} className="px-3 py-2 text-right font-medium">{y}</th>
              ))}
              <th className="px-3 py-2 text-right font-medium">Δ 23/22</th>
              <th className="px-3 py-2 text-right font-medium">Δ 22/21</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            <BilanRow label="Immaterielle VG" field="immateriell" years={years} />
            <BilanRow label="Sachanlagen" field="sachanlagen" years={years} />
            <BilanRow label="Finanzanlagen" field="finanzanlagen" years={years} />
            <BilanRow label="Anlagevermögen" computed={years.map(getAnlagevermoegen)} bold />
            <BilanRow label="Vorräte" field="vorraete" years={years} />
            <BilanRow label="Forderungen LuL" field="forderungen" years={years} />
            <BilanRow label="Liquide Mittel" field="liquide" years={years} />
            <BilanRow label="Umlaufvermögen" computed={years.map(getUmlaufvermoegen)} bold />
            <BilanRow label="BILANZSUMME" computed={years.map(getBilanzsumme)} bold total />
          </tbody>
        </table>
      </div>

      {/* ---- PASSIVA ---- */}
      <SectionHeading>Passiva</SectionHeading>
      <div className="overflow-x-auto">
        <table className="w-full text-sm font-body">
          <thead>
            <tr className="bg-primary text-white">
              <th className="px-3 py-2 text-left font-medium">Position</th>
              {YEARS.map((y) => (
                <th key={y} className="px-3 py-2 text-right font-medium">{y}</th>
              ))}
              <th className="px-3 py-2 text-right font-medium">Δ 23/22</th>
              <th className="px-3 py-2 text-right font-medium">Δ 22/21</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            <BilanRow label="Eigenkapital" field="eigenkapital" years={years} />
            <BilanRow label="Rückstellungen" field="rueckstellungen" years={years} />
            <BilanRow label="Kurzfr. Verbindlichkeiten" field="verb_kurz" years={years} />
            <BilanRow label="Langfr. Verbindlichkeiten" field="verb_lang" years={years} />
            <BilanRow
              label="BILANZSUMME"
              computed={years.map((b) => (b.eigenkapital || 0) + (b.rueckstellungen || 0) + (b.verb_kurz || 0) + (b.verb_lang || 0))}
              bold total
            />
          </tbody>
        </table>
      </div>

      {/* ---- GUV ---- */}
      <SectionHeading>Gewinn- und Verlustrechnung</SectionHeading>
      <div className="overflow-x-auto">
        <table className="w-full text-sm font-body">
          <thead>
            <tr className="bg-primary text-white">
              <th className="px-3 py-2 text-left font-medium">Position</th>
              {YEARS.map((y) => (
                <th key={y} className="px-3 py-2 text-right font-medium">{y}</th>
              ))}
              <th className="px-3 py-2 text-right font-medium">Δ 23/22</th>
              <th className="px-3 py-2 text-right font-medium">Δ 22/21</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            <BilanRow label="Umsatzerlöse" field="umsatz" years={years} />
            <BilanRow label="Sonstige Erträge" field="sonstige_ertraege" years={years} />
            <BilanRow label="Gesamtleistung" computed={years.map(getGesamtleistung)} bold />
            <BilanRow label="Materialaufwand" field="materialaufwand" years={years} negative />
            <BilanRow label="Personalaufwand" field="personalaufwand" years={years} negative />
            <BilanRow label="Abschreibungen" field="abschreibungen" years={years} negative />
            <BilanRow label="Sonstige Aufwendungen" field="sonstige_aufwendungen" years={years} negative />
            <BilanRow label="EBITDA" computed={years.map(getEBITDA)} bold />
            <BilanRow label="EBIT" computed={years.map(getEBIT)} bold />
            <BilanRow label="Zinsaufwand" field="zinsaufwand" years={years} negative />
            <BilanRow label="Steuern" field="steuern" years={years} negative />
            <BilanRow label="Jahresüberschuss" field="jahresueberschuss" years={years} bold total />
          </tbody>
        </table>
      </div>

      {/* ---- KENNZAHLEN DASHBOARD ---- */}
      <SectionHeading>Kennzahlen-Dashboard</SectionHeading>
      {METRIC_GROUPS.map((group) => (
        <div key={group.title} className="mb-6">
          <h4 className="text-sm font-semibold font-headline text-text-secondary mb-2">{group.title}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {group.metrics.map((m) => {
              const v23 = ratios23[m.key];
              const v22 = ratios22[m.key];
              const v21 = ratios21[m.key];
              const score = scoreMetric(m.key, v23, branche);
              const light = scoreToTrafficLight(score);

              const formatVal = (v) => {
                if (v == null || isNaN(v)) return '--';
                if (m.unit === '€') return formatCurrency(v);
                if (m.unit === 'x') return formatNumber(v, 1) + 'x';
                if (m.unit === 'J.') return formatNumber(v, 1) + ' J.';
                return formatNumber(v, 1) + '%';
              };

              return (
                <div
                  key={m.key}
                  className="bg-surface-card border border-border rounded-lg p-3 hover:shadow-sm transition-shadow"
                  title={m.formula}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-text-secondary font-body truncate pr-2">{m.label}</span>
                    <TrafficDot color={light} size="sm" />
                  </div>
                  <p className="text-lg font-semibold font-mono text-text-primary">{formatVal(v23)}</p>
                  {/* Mini sparkline -- 3-year values as small bar indicators */}
                  <div className="flex items-end gap-1 mt-2 h-5">
                    {[v21, v22, v23].map((v, i) => {
                      const vals = [v21, v22, v23].filter((x) => x != null && !isNaN(x));
                      const max = vals.length > 0 ? Math.max(...vals.map(Math.abs)) : 1;
                      const height = v != null && !isNaN(v) && max > 0
                        ? Math.max(4, (Math.abs(v) / max) * 20)
                        : 4;
                      return (
                        <div
                          key={i}
                          className={`w-3 rounded-sm ${i === 2 ? 'bg-primary' : 'bg-primary/30'}`}
                          style={{ height: `${height}px` }}
                          title={`${YEARS[2 - i]}: ${formatVal([v21, v22, v23][i])}`}
                        />
                      );
                    })}
                    <span className="text-[10px] text-text-muted font-mono ml-1">
                      {formatVal(v21)} → {formatVal(v23)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* ---- KI BILANZANALYSE ---- */}
      <SectionHeading>KI-Bilanzanalyse</SectionHeading>
      <div className="space-y-3">
        <button
          type="button"
          onClick={onKiAnalysis}
          disabled={aiLoading}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg font-body text-sm font-medium hover:bg-primary-light transition-colors disabled:opacity-60"
        >
          {aiLoading ? (
            <Loader2 size={16} strokeWidth={1.5} className="animate-spin" />
          ) : (
            <Sparkles size={16} strokeWidth={1.5} />
          )}
          {aiLoading ? 'Analyse wird generiert...' : 'KI-Bilanzanalyse generieren'}
        </button>

        {aiResult && (
          <div className="bg-surface-card border border-border rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setAiExpanded((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-surface transition-colors"
            >
              <span className="text-sm font-semibold font-headline text-text-primary flex items-center gap-2">
                <Sparkles size={16} strokeWidth={1.5} className="text-accent" />
                KI-Analyse Ergebnis
              </span>
              {aiExpanded ? (
                <ChevronUp size={16} strokeWidth={1.5} className="text-text-muted" />
              ) : (
                <ChevronDown size={16} strokeWidth={1.5} className="text-text-muted" />
              )}
            </button>
            {aiExpanded && (
              <div className="px-4 pb-4 text-sm font-body text-text-primary leading-relaxed whitespace-pre-line">
                {aiResult.split('**').map((part, idx) =>
                  idx % 2 === 1
                    ? <strong key={idx}>{part}</strong>
                    : <span key={idx}>{part}</span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/** Reusable balance-sheet table row */
function BilanRow({ label, field, years, computed, bold, total, negative }) {
  const vals = computed || (years || []).map((b) => b[field] || 0);
  const [v23, v22, v21] = vals;

  const rowClass = total
    ? 'bg-surface font-bold'
    : bold
    ? 'bg-slate-50 font-semibold'
    : '';

  return (
    <tr className={rowClass}>
      <td className={`px-3 py-2 text-left ${bold || total ? 'font-semibold' : ''}`}>{label}</td>
      {vals.map((v, i) => (
        <td key={i} className="px-3 py-2 text-right font-mono text-xs">
          {negative && v > 0 ? `−${formatCurrency(v)}` : formatCurrency(v)}
        </td>
      ))}
      <ChangeCell current={v23} previous={v22} />
      <ChangeCell current={v22} previous={v21} />
    </tr>
  );
}

// =============================================================================
// TAB 3: BWA-Analyse
// =============================================================================

function TabBWA({ b23 }) {
  // Generate 12 months of simulated data based on annual figures
  const monthlyData = useMemo(() => {
    const annualUmsatz = b23.umsatz || 0;
    const annualErgebnis = b23.jahresueberschuss || 0;
    const monthlyUmsatzBase = annualUmsatz / 12;
    const monthlyErgebnisBase = annualErgebnis / 12;

    // Seed-based pseudo-random for consistent variance
    const variance = [0.92, 0.97, 1.05, 1.08, 1.12, 0.95, 0.88, 0.83, 1.03, 1.10, 1.15, 0.98];

    let umsatzKum = 0;
    let ergebnisKum = 0;
    const sollUmsatzKum = (i) => monthlyUmsatzBase * (i + 1);

    return MONTH_LABELS.map((monat, i) => {
      const umsatz = Math.round(monthlyUmsatzBase * variance[i]);
      const ergebnis = Math.round(monthlyErgebnisBase * variance[i] * (0.9 + Math.random() * 0.2));
      umsatzKum += umsatz;
      ergebnisKum += ergebnis;
      return {
        monat,
        umsatz,
        ergebnis,
        umsatzKum,
        ergebnisKum,
        sollUmsatz: Math.round(sollUmsatzKum(i)),
      };
    });
  }, [b23]);

  const lastMonth = monthlyData[monthlyData.length - 1];

  return (
    <div className="space-y-6">
      <SectionHeading>Monatliche Umsatz- und Ergebnisentwicklung</SectionHeading>

      {/* Chart */}
      <div className="bg-surface-card border border-border rounded-lg p-4">
        <ResponsiveContainer width="100%" height={360}>
          <ComposedChart data={monthlyData} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="monat" tick={{ fontSize: 12, fontFamily: 'IBM Plex Sans' }} />
            <YAxis
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              tick={{ fontSize: 11, fontFamily: 'IBM Plex Mono' }}
            />
            <RechartsTooltip
              formatter={(value, name) => [
                formatCurrency(value),
                name === 'umsatz' ? 'Umsatz' : 'Ergebnis',
              ]}
              labelStyle={{ fontFamily: 'IBM Plex Sans', fontWeight: 600 }}
            />
            <Legend
              formatter={(value) => (value === 'umsatz' ? 'Umsatz' : 'Ergebnis')}
              wrapperStyle={{ fontFamily: 'IBM Plex Sans', fontSize: 12 }}
            />
            <Bar dataKey="umsatz" fill="#1B2B4B" radius={[3, 3, 0, 0]} barSize={28} />
            <Line
              type="monotone"
              dataKey="ergebnis"
              stroke="#00875A"
              strokeWidth={2}
              dot={{ r: 3, fill: '#00875A' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Summary table */}
      <SectionHeading>Soll-Ist-Vergleich (kumuliert)</SectionHeading>
      <div className="overflow-x-auto">
        <table className="w-full text-sm font-body">
          <thead>
            <tr className="bg-primary text-white">
              <th className="px-3 py-2 text-left font-medium">Position</th>
              <th className="px-3 py-2 text-right font-medium">Ist kumuliert</th>
              <th className="px-3 py-2 text-right font-medium">Soll kumuliert</th>
              <th className="px-3 py-2 text-right font-medium">Abweichung</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            <tr>
              <td className="px-3 py-2 font-medium">Umsatzerlöse</td>
              <td className="px-3 py-2 text-right font-mono text-xs">{formatCurrency(lastMonth.umsatzKum)}</td>
              <td className="px-3 py-2 text-right font-mono text-xs">{formatCurrency(lastMonth.sollUmsatz)}</td>
              <td className={`px-3 py-2 text-right font-mono text-xs ${lastMonth.umsatzKum >= lastMonth.sollUmsatz ? 'text-green-600' : 'text-red-600'}`}>
                {lastMonth.umsatzKum >= lastMonth.sollUmsatz ? '+' : ''}
                {formatNumber(((lastMonth.umsatzKum - lastMonth.sollUmsatz) / lastMonth.sollUmsatz) * 100, 1)}%
              </td>
            </tr>
            <tr>
              <td className="px-3 py-2 font-medium">Ergebnis</td>
              <td className="px-3 py-2 text-right font-mono text-xs">{formatCurrency(lastMonth.ergebnisKum)}</td>
              <td className="px-3 py-2 text-right font-mono text-xs">{formatCurrency(b23.jahresueberschuss || 0)}</td>
              <td className={`px-3 py-2 text-right font-mono text-xs ${lastMonth.ergebnisKum >= (b23.jahresueberschuss || 0) ? 'text-green-600' : 'text-red-600'}`}>
                {lastMonth.ergebnisKum >= (b23.jahresueberschuss || 0) ? '+' : ''}
                {formatNumber(((lastMonth.ergebnisKum - (b23.jahresueberschuss || 0)) / Math.abs(b23.jahresueberschuss || 1)) * 100, 1)}%
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// =============================================================================
// TAB 4: Kapitaldienstfaehigkeit
// =============================================================================

function TabKapitaldienst({
  b23, company,
  kdOverrides, setKdOverrides,
  stressUmsatz, setStressUmsatz,
  stressKosten, setStressKosten,
  stressZins, setStressZins,
}) {
  const bestVerbind = company.bestehende_verbindlichkeiten || [];
  const kreditBetrag = company.kredit?.betrag || 0;
  const kreditLaufzeit = company.kredit?.laufzeit || 84;

  // EBITDA and overrides
  const baseEBITDA = getEBITDA(b23);
  const ebitda = kdOverrides.ebitda != null ? kdOverrides.ebitda : baseEBITDA;
  const privatentnahmen = kdOverrides.privatentnahmen != null ? kdOverrides.privatentnahmen : 0;
  const ertragsteuern = kdOverrides.ertragsteuern != null ? kdOverrides.ertragsteuern : (b23.steuern || 0);

  // Kapitaldienstgrenze
  const kdGrenze = ebitda - privatentnahmen - ertragsteuern;

  // Bestehender Kapitaldienst
  const zinsenBestand = bestVerbind.reduce((s, v) => s + ((v.restschuld || 0) * (v.zins || 0) / 100), 0);
  const tilgungBestand = bestVerbind.reduce((s, v) => s + ((v.rate || 0) * 12), 0);

  // Neuer Kapitaldienst
  const zinsenNeu = kreditBetrag * 0.052;
  const tilgungNeu = (kreditBetrag / kreditLaufzeit) * 12;

  const gesamtKapitaldienst = zinsenBestand + tilgungBestand + zinsenNeu + tilgungNeu;
  const auslastungsquote = kdGrenze > 0 ? (gesamtKapitaldienst / kdGrenze) * 100 : 999;

  // Auslastung traffic light
  const auslastungColor =
    auslastungsquote <= 60 ? 'green' :
    auslastungsquote <= 75 ? 'yellow' :
    auslastungsquote <= 100 ? 'orange' :
    'red';
  const auslastungBg =
    auslastungsquote <= 60 ? 'bg-green-50 border-green-200 text-green-800' :
    auslastungsquote <= 75 ? 'bg-amber-50 border-amber-200 text-amber-800' :
    auslastungsquote <= 100 ? 'bg-orange-50 border-orange-200 text-orange-800' :
    'bg-red-50 border-red-200 text-red-800';

  // Stress test calculations
  const stressedUmsatz = (b23.umsatz || 0) * (1 - stressUmsatz / 100);
  const stressedKosten = ((b23.materialaufwand || 0) + (b23.personalaufwand || 0) + (b23.sonstige_aufwendungen || 0)) * (1 + stressKosten / 100);
  const baseKosten = (b23.materialaufwand || 0) + (b23.personalaufwand || 0) + (b23.sonstige_aufwendungen || 0);
  const stressedEBITDA = stressedUmsatz + (b23.sonstige_ertraege || 0) - stressedKosten;
  const stressedKdGrenze = stressedEBITDA - privatentnahmen - ertragsteuern;
  const stressedZinsenNeu = kreditBetrag * ((0.052 + stressZins / 100));
  const stressedGesamtKD = zinsenBestand + tilgungBestand + stressedZinsenNeu + tilgungNeu;
  const stressedAuslastung = stressedKdGrenze > 0 ? (stressedGesamtKD / stressedKdGrenze) * 100 : 999;

  const stressColor =
    stressedAuslastung <= 60 ? 'green' :
    stressedAuslastung <= 75 ? 'yellow' :
    stressedAuslastung <= 100 ? 'orange' :
    'red';
  const stressBg =
    stressedAuslastung <= 60 ? 'bg-green-50 border-green-200 text-green-800' :
    stressedAuslastung <= 75 ? 'bg-amber-50 border-amber-200 text-amber-800' :
    stressedAuslastung <= 100 ? 'bg-orange-50 border-orange-200 text-orange-800' :
    'bg-red-50 border-red-200 text-red-800';

  const handleOverride = (key, val) => {
    const num = val === '' ? null : parseFloat(val);
    setKdOverrides((prev) => ({ ...prev, [key]: isNaN(num) ? null : num }));
  };

  return (
    <div className="space-y-6">
      <SectionHeading>Kapitaldienstfähigkeitsberechnung</SectionHeading>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: KD-Grenze */}
        <div className="bg-surface-card border border-border rounded-lg p-5 space-y-4">
          <h4 className="text-sm font-semibold font-headline text-text-primary">Kapitaldienstgrenze</h4>

          <KDRow
            label="EBITDA"
            value={ebitda}
            editable
            onChange={(v) => handleOverride('ebitda', v)}
            defaultValue={baseEBITDA}
          />
          <KDRow
            label="− Privatentnahmen / Ausschüttungen"
            value={privatentnahmen}
            editable
            onChange={(v) => handleOverride('privatentnahmen', v)}
            defaultValue={0}
            subtract
          />
          <KDRow
            label="− Ertragsteuern"
            value={ertragsteuern}
            editable
            onChange={(v) => handleOverride('ertragsteuern', v)}
            defaultValue={b23.steuern || 0}
            subtract
          />
          <div className="border-t-2 border-primary pt-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold font-headline text-text-primary">= KAPITALDIENSTGRENZE</span>
              <span className="text-lg font-bold font-mono text-primary">{formatCurrency(kdGrenze)}</span>
            </div>
          </div>
        </div>

        {/* Right: Kapitaldienst */}
        <div className="bg-surface-card border border-border rounded-lg p-5 space-y-4">
          <h4 className="text-sm font-semibold font-headline text-text-primary">Gesamter Kapitaldienst</h4>

          <div className="space-y-1">
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Bestehender Kapitaldienst</p>
            <KDRow label="Zinsen Bestandskredite" value={zinsenBestand} />
            <KDRow label="Tilgung Bestandskredite" value={tilgungBestand} />
          </div>

          <div className="space-y-1">
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Neuer Kapitaldienst</p>
            <KDRow label="Zinsen neuer Kredit (5,2%)" value={zinsenNeu} />
            <KDRow label="Tilgung neuer Kredit" value={tilgungNeu} />
          </div>

          <div className="border-t-2 border-primary pt-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold font-headline text-text-primary">= GESAMTER KAPITALDIENST</span>
              <span className="text-lg font-bold font-mono text-primary">{formatCurrency(gesamtKapitaldienst)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Auslastungsquote result */}
      <div className={`flex items-center justify-between p-5 rounded-lg border-2 ${auslastungBg}`}>
        <div className="flex items-center gap-3">
          <span className={`w-5 h-5 rounded-full shrink-0 ${
            auslastungColor === 'green' ? 'bg-green-500' :
            auslastungColor === 'yellow' ? 'bg-amber-400' :
            auslastungColor === 'orange' ? 'bg-orange-500' :
            'bg-red-500'
          }`} />
          <div>
            <p className="text-sm font-bold font-headline">AUSLASTUNGSQUOTE</p>
            <p className="text-xs mt-0.5">Kapitaldienst / Kapitaldienstgrenze</p>
          </div>
        </div>
        <span className="text-3xl font-bold font-mono">{formatNumber(auslastungsquote, 1)}%</span>
      </div>

      {/* Stresstest */}
      <SectionHeading>Stresstest</SectionHeading>
      <div className="bg-surface-card border border-border rounded-lg p-5 space-y-6">
        <p className="text-xs text-text-secondary font-body">
          Passen Sie die Stress-Parameter an, um die Kapitaldienstfähigkeit unter adversen Szenarien zu prüfen.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Slider: Umsatzrueckgang */}
          <StressSlider
            label="Umsatzrückgang"
            value={stressUmsatz}
            onChange={setStressUmsatz}
            min={0} max={30} step={1}
            unit="%"
          />
          {/* Slider: Kostensteigerung */}
          <StressSlider
            label="Kostensteigerung"
            value={stressKosten}
            onChange={setStressKosten}
            min={0} max={15} step={1}
            unit="%"
          />
          {/* Slider: Zinssteigerung */}
          <StressSlider
            label="Zinssteigerung"
            value={stressZins}
            onChange={setStressZins}
            min={0} max={5} step={0.5}
            unit=" Pp."
          />
        </div>

        {/* Stressed results */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="flex items-center justify-between p-3 rounded-lg bg-surface border border-border">
            <span className="text-sm font-body text-text-secondary">Stressed EBITDA</span>
            <span className="text-base font-bold font-mono text-text-primary">{formatCurrency(stressedEBITDA)}</span>
          </div>
          <div className={`flex items-center justify-between p-3 rounded-lg border-2 ${stressBg}`}>
            <div className="flex items-center gap-2">
              <span className={`w-4 h-4 rounded-full shrink-0 ${
                stressColor === 'green' ? 'bg-green-500' :
                stressColor === 'yellow' ? 'bg-amber-400' :
                stressColor === 'orange' ? 'bg-orange-500' :
                'bg-red-500'
              }`} />
              <span className="text-sm font-semibold font-headline">Stressed Auslastung</span>
            </div>
            <span className="text-xl font-bold font-mono">{formatNumber(Math.min(stressedAuslastung, 999), 1)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** KD calculation row -- optionally editable */
function KDRow({ label, value, editable, onChange, defaultValue, subtract }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-sm font-body text-text-secondary">{label}</span>
      {editable ? (
        <input
          type="number"
          className="w-36 text-right font-mono text-sm px-2 py-1 border border-border rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={formatNumber(defaultValue)}
        />
      ) : (
        <span className="font-mono text-sm text-text-primary">{formatCurrency(value)}</span>
      )}
    </div>
  );
}

/** Stress-test slider */
function StressSlider({ label, value, onChange, min, max, step, unit }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-sm font-body text-text-primary">{label}</label>
        <span className="text-sm font-mono font-semibold text-primary">
          {formatNumber(value, step < 1 ? 1 : 0)}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 rounded-lg appearance-none bg-border accent-primary cursor-pointer"
      />
      <div className="flex justify-between text-[10px] text-text-muted font-mono mt-0.5">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}
