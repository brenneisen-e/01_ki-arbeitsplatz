/**
 * MonitoringView -- Monitoring & Fruehwarnung (Early Warning System)
 *
 * Portfolio-level monitoring view that does NOT require a selected company.
 * Provides four tabs:
 *   1. Portfolio-Uebersicht   -- KPIs, charts, portfolio table
 *   2. Fruehwarnindikatoren   -- Early warning indicators per company
 *   3. Rating-Migration       -- Migration matrix heatmap
 *   4. Watchlist              -- Escalation path tracker (MaRisk BTO 1.2)
 */

import { useState, useMemo } from 'react';
import {
  BarChart3,
  PieChart as PieChartIcon,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Shield,
  Eye,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Activity,
  Users,
  Euro,
  Target,
  Calendar,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Info,
  Search,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import { useApp } from '../../context/AppContext';
import StepIntroCard from '../shared/StepIntroCard';
import {
  formatCurrency,
  formatCurrencyCompact,
  formatPercent,
  formatNumber,
} from '../../utils/formatters';

// =============================================================================
// Constants
// =============================================================================

const TABS = [
  { key: 'portfolio', label: 'Portfolio-Übersicht', icon: BarChart3 },
  { key: 'fruehwarn', label: 'Frühwarnindikatoren', icon: AlertTriangle },
  { key: 'migration', label: 'Rating-Migration', icon: Activity },
  { key: 'watchlist', label: 'Watchlist', icon: Eye },
];

/** Rating class color mapping for pie chart */
const RATING_COLORS = {
  '1-3': 'var(--color-success)',
  '4-6': 'var(--color-warning)',
  '7-9': 'var(--color-orange-600)',
  '10+': 'var(--color-danger)',
};

/** Simulated rating per company ID for consistent display */
const COMPANY_RATINGS = {
  'CRED-2024-001': '3a',
  'CRED-2024-002': '3b',
  'CRED-2024-003': '7a',
  'CRED-2024-004': '4b',
  'CRED-2024-005': '2a',
  'CRED-2024-006': '5a',
  'CRED-2024-007': '4a',
  'CRED-2024-008': '9b',
};

/** Rating class distribution for the pie chart (simulated) */
const RATING_DISTRIBUTION = [
  { name: 'Rating 1-3', value: 35, color: RATING_COLORS['1-3'] },
  { name: 'Rating 4-6', value: 40, color: RATING_COLORS['4-6'] },
  { name: 'Rating 7-9', value: 18, color: RATING_COLORS['7-9'] },
  { name: 'Rating 10+', value: 7, color: RATING_COLORS['10+'] },
];

/** Escalation levels for the watchlist stepper */
const ESCALATION_LEVELS = [
  { key: 'normal', label: 'Normalbetreuung', short: 'Normal' },
  { key: 'watchlist', label: 'Watchlist', short: 'Watchlist' },
  { key: 'intensiv', label: 'Intensivbetreuung', short: 'Intensiv', ref: 'MaRisk BTO 1.2.4' },
  { key: 'problem', label: 'Problemkreditbearbeitung', short: 'Problem', ref: 'BTO 1.2.5' },
  { key: 'sanierung', label: 'Sanierung/Abwicklung', short: 'Sanierung' },
];

/** Migration matrix data (simplified 5x5: rows = Vorjahr, cols = Aktuell) */
const MIGRATION_LABELS = ['1-3', '4-5', '6-7', '8-9', '10+'];
const MIGRATION_DATA = [
  // From 1-3:  mostly stay, some downgrade
  [82, 12, 4, 1, 1],
  // From 4-5:  some upgrade, most stay, some down
  [8, 78, 9, 3, 2],
  // From 6-7:  some up, most stay, some down
  [2, 10, 76, 8, 4],
  // From 8-9:  rare improvement, most stay, some worsen
  [0, 3, 9, 80, 8],
  // From 10+:  very rare improvement, most stay or worsen
  [0, 1, 3, 12, 84],
];

// =============================================================================
// Early Warning Indicator Data (per company, hardcoded)
// =============================================================================

/**
 * Each indicator has:
 *   - name: Display name
 *   - status: 'ok' | 'warn' | 'critical'
 *   - wert: Current value
 *   - schwelle: Threshold
 *   - trend: 'up' | 'stable' | 'down'
 */
const FRUEHWARN_DATA = {
  'CRED-2024-001': {
    firma: 'Müller Maschinenbau GmbH',
    indikatoren: [
      { name: 'Kontoüberziehungen (12M)', status: 'ok', wert: '2 Fälle', schwelle: '> 5 Fälle', trend: 'stable' },
      { name: 'Rücklastschriften (12M)', status: 'ok', wert: '0 Fälle', schwelle: '> 2 Fälle', trend: 'stable' },
      { name: 'Rating-Verschlechterung', status: 'ok', wert: 'Stabil (3a)', schwelle: '> 2 Notches', trend: 'stable' },
      { name: 'Zahlungsverzug', status: 'ok', wert: '0 Tage', schwelle: '> 30 Tage', trend: 'stable' },
      { name: 'BWA-Planabweichung Umsatz', status: 'warn', wert: '-8,2%', schwelle: '> -10%', trend: 'up' },
      { name: 'Branchenrisiko', status: 'ok', wert: 'Moderat', schwelle: 'Hoch/Sehr hoch', trend: 'stable' },
      { name: 'Negative Presse', status: 'ok', wert: 'Keine Treffer', schwelle: 'Treffer vorhanden', trend: 'stable' },
      { name: 'ESG-Risiko-Veränderung', status: 'ok', wert: 'Stabil', schwelle: 'Verschlechterung', trend: 'stable' },
    ],
  },
  'CRED-2024-003': {
    firma: 'Gasthaus zum Goldenen Löwen e.K.',
    indikatoren: [
      { name: 'Kontoüberziehungen (12M)', status: 'critical', wert: '14 Fälle', schwelle: '> 5 Fälle', trend: 'up' },
      { name: 'Rücklastschriften (12M)', status: 'warn', wert: '3 Fälle', schwelle: '> 2 Fälle', trend: 'up' },
      { name: 'Rating-Verschlechterung', status: 'critical', wert: '5a → 7a', schwelle: '> 2 Notches', trend: 'up' },
      { name: 'Zahlungsverzug', status: 'warn', wert: '22 Tage', schwelle: '> 30 Tage', trend: 'up' },
      { name: 'BWA-Planabweichung Umsatz', status: 'critical', wert: '-24,5%', schwelle: '> -10%', trend: 'up' },
      { name: 'Branchenrisiko', status: 'warn', wert: 'Hoch', schwelle: 'Hoch/Sehr hoch', trend: 'up' },
      { name: 'Negative Presse', status: 'ok', wert: 'Keine Treffer', schwelle: 'Treffer vorhanden', trend: 'stable' },
      { name: 'ESG-Risiko-Veränderung', status: 'warn', wert: 'Leicht verschlechtert', schwelle: 'Verschlechterung', trend: 'up' },
    ],
  },
  'CRED-2024-008': {
    firma: 'Digital Commerce UG',
    indikatoren: [
      { name: 'Kontoüberziehungen (12M)', status: 'critical', wert: '23 Fälle', schwelle: '> 5 Fälle', trend: 'up' },
      { name: 'Rücklastschriften (12M)', status: 'critical', wert: '8 Fälle', schwelle: '> 2 Fälle', trend: 'up' },
      { name: 'Rating-Verschlechterung', status: 'critical', wert: '7b → 9b', schwelle: '> 2 Notches', trend: 'up' },
      { name: 'Zahlungsverzug', status: 'critical', wert: '48 Tage', schwelle: '> 30 Tage', trend: 'up' },
      { name: 'BWA-Planabweichung Umsatz', status: 'critical', wert: '-41,2%', schwelle: '> -10%', trend: 'up' },
      { name: 'Branchenrisiko', status: 'warn', wert: 'Hoch', schwelle: 'Hoch/Sehr hoch', trend: 'stable' },
      { name: 'Negative Presse', status: 'warn', wert: '2 Treffer', schwelle: 'Treffer vorhanden', trend: 'up' },
      { name: 'ESG-Risiko-Veränderung', status: 'ok', wert: 'Stabil', schwelle: 'Verschlechterung', trend: 'stable' },
    ],
  },
  'CRED-2024-004': {
    firma: 'Schmidt Logistik GmbH & Co. KG',
    indikatoren: [
      { name: 'Kontoüberziehungen (12M)', status: 'ok', wert: '1 Fall', schwelle: '> 5 Fälle', trend: 'down' },
      { name: 'Rücklastschriften (12M)', status: 'ok', wert: '0 Fälle', schwelle: '> 2 Fälle', trend: 'stable' },
      { name: 'Rating-Verschlechterung', status: 'ok', wert: 'Stabil (4b)', schwelle: '> 2 Notches', trend: 'stable' },
      { name: 'Zahlungsverzug', status: 'ok', wert: '0 Tage', schwelle: '> 30 Tage', trend: 'stable' },
      { name: 'BWA-Planabweichung Umsatz', status: 'warn', wert: '-9,1%', schwelle: '> -10%', trend: 'up' },
      { name: 'Branchenrisiko', status: 'warn', wert: 'Erhöht', schwelle: 'Hoch/Sehr hoch', trend: 'stable' },
      { name: 'Negative Presse', status: 'ok', wert: 'Keine Treffer', schwelle: 'Treffer vorhanden', trend: 'stable' },
      { name: 'ESG-Risiko-Veränderung', status: 'warn', wert: 'Leicht verschlechtert', schwelle: 'Verschlechterung', trend: 'up' },
    ],
  },
  'CRED-2024-002': {
    firma: 'TechVision IT GmbH',
    indikatoren: [
      { name: 'Kontoüberziehungen (12M)', status: 'ok', wert: '0 Fälle', schwelle: '> 5 Fälle', trend: 'stable' },
      { name: 'Rücklastschriften (12M)', status: 'ok', wert: '0 Fälle', schwelle: '> 2 Fälle', trend: 'stable' },
      { name: 'Rating-Verschlechterung', status: 'ok', wert: 'Stabil (3b)', schwelle: '> 2 Notches', trend: 'stable' },
      { name: 'Zahlungsverzug', status: 'ok', wert: '0 Tage', schwelle: '> 30 Tage', trend: 'stable' },
      { name: 'BWA-Planabweichung Umsatz', status: 'ok', wert: '+3,1%', schwelle: '> -10%', trend: 'down' },
      { name: 'Branchenrisiko', status: 'ok', wert: 'Niedrig', schwelle: 'Hoch/Sehr hoch', trend: 'down' },
      { name: 'Negative Presse', status: 'ok', wert: 'Keine Treffer', schwelle: 'Treffer vorhanden', trend: 'stable' },
      { name: 'ESG-Risiko-Veränderung', status: 'ok', wert: 'Stabil', schwelle: 'Verschlechterung', trend: 'stable' },
    ],
  },
};

// =============================================================================
// Watchlist Data (hardcoded)
// =============================================================================

const WATCHLIST_ENTRIES = [
  {
    id: 'CRED-2024-003',
    firma: 'Gasthaus zum Goldenen Löwen e.K.',
    level: 'intensiv',
    begruendung:
      'Signifikante Umsatzrückgänge seit Q2/2025 (-24,5% unter Plan). Wiederholte Kontoüberziehungen und Ratingverschlechterung von 5a auf 7a innerhalb von 12 Monaten. Gastronomiebranche unter anhaltendem Kostendruck (Energie, Personal).',
    massnahmen: [
      'Monatliche BWA-Einreichung bis auf Weiteres (statt quartalsweise)',
      'Persönliches Gespräch mit Inhaber zur Liquiditätsplanung (durchgeführt am 15.01.2026)',
      'Prüfung Nachbesicherungsbedarf (Grundschuld Wohnimmobilie Inhaber)',
      'Erstellung 13-Wochen-Liquiditätsplanung durch Kreditnehmer',
      'Einholung aktueller Warenkreditversicherungs-Bestätigung',
    ],
    verantwortlicher: 'K. Gruber (Firmenkundenberater)',
    naechsterReview: '2026-04-15',
    protokoll: [
      {
        datum: '2026-02-15',
        text: 'Review durchgeführt. Umsatz Dezember/Januar leicht über Plan. Inhaber hat 13-Wochen-Planung eingereicht. Liquidität vorerst gesichert durch Stundung Tilgung (3 Monate). Verbleib in Intensivbetreuung.',
      },
      {
        datum: '2026-01-15',
        text: 'Erstgespräch mit Inhaber Löwenstein. Umsatzeinbruch bestätigt, hauptsächlich durch Wegfall Großveranstaltungen und gestiegene Energiekosten. Maßnahmenplan vereinbart. Tilgungsstundung für Q1/2026 bewilligt.',
      },
      {
        datum: '2025-12-01',
        text: 'Hochstufung von Watchlist auf Intensivbetreuung gemäß MaRisk BTO 1.2.4. Begründung: Rating-Verschlechterung > 2 Notches, anhaltende Planabweichung > 20%.',
      },
    ],
  },
  {
    id: 'CRED-2024-008',
    firma: 'Digital Commerce UG',
    level: 'problem',
    begruendung:
      'Massive Liquiditätsprobleme mit 48 Tagen Zahlungsverzug. Umsatz um 41,2% unter Plan. 8 Rücklastschriften in 12 Monaten, 23 Kontoüberziehungen. Rating verschlechtert von 7b auf 9b. Geschäftsmodell durch verändertes Marktumfeld (Plattform-Abhängigkeit) strukturell gefährdet. Negative Presseberichte über Lieferverzögerungen.',
    massnahmen: [
      'Wöchentliche Liquiditätsmeldung an Kreditabteilung',
      'Beauftragung externer Unternehmensberatung (Sanierungsgutachten nach IDW S6)',
      'Kontolimitreduzierung von 80.000 EUR auf 40.000 EUR',
      'Prüfung der Verwertbarkeit bestehender Sicherheiten',
      'Einforderung persönlicher Bürgschaft der Gesellschafter',
      'Abstimmung mit Rechtsabteilung zu Handlungsoptionen',
      'Fristsetzung für Vorlage Sanierungskonzept bis 31.03.2026',
    ],
    verantwortlicher: 'T. Klein (Problemkreditbearbeitung)',
    naechsterReview: '2026-03-31',
    protokoll: [
      {
        datum: '2026-02-28',
        text: 'Sanierungsgutachter hat Erstgespräch mit Geschäftsführung geführt. Vorläufige Einschätzung: Sanierungsfähigkeit nur bei erheblicher Restrukturierung (Personalabbau, Sortimentsbereinigung). Gutachten wird bis Ende März erwartet.',
      },
      {
        datum: '2026-02-01',
        text: 'Hochstufung von Intensivbetreuung auf Problemkreditbearbeitung gemäß MaRisk BTO 1.2.5. Zahlungsverzug > 30 Tage, Rating 9b. Übernahme durch Abteilung Problemkredite (T. Klein).',
      },
      {
        datum: '2026-01-10',
        text: 'Krisengespräch mit GF Yilmaz. Geschäftsführer räumt Probleme ein, verweist auf Marktbereinigung im E-Commerce. Bereitschaft zur externen Beratung signalisiert. Gesellschafter prüfen Nachschuss.',
      },
      {
        datum: '2025-11-15',
        text: 'Erstmalige Aufnahme in Watchlist. Begründung: 3 aufeinanderfolgende Monate mit Planunterschreitung > 15%, steigende Kontoüberziehungen.',
      },
    ],
  },
];

// =============================================================================
// Helper: Rating Badge (inline, simplified)
// =============================================================================

function getRatingColor(klasse) {
  const num = parseInt(klasse, 10) || parseInt(String(klasse).replace(/[a-c]/gi, ''), 10) || 0;
  if (num >= 10) return { bg: 'bg-red-100', text: 'text-red-800' };
  if (num >= 8) return { bg: 'bg-orange-100', text: 'text-orange-800' };
  if (num >= 6) return { bg: 'bg-amber-100', text: 'text-amber-800' };
  if (num >= 4) return { bg: 'bg-lime-100', text: 'text-lime-800' };
  return { bg: 'bg-green-100', text: 'text-green-800' };
}

function InlineRatingBadge({ klasse }) {
  if (!klasse) return <span className="text-text-muted font-mono text-xs">--</span>;
  const c = getRatingColor(klasse);
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded font-mono font-semibold text-xs whitespace-nowrap ${c.bg} ${c.text}`}>
      {klasse}
    </span>
  );
}

// =============================================================================
// Helper: Status indicator components
// =============================================================================

function StatusIcon({ status, size = 16 }) {
  if (status === 'ok') return <CheckCircle size={size} strokeWidth={1.5} className="text-green-600" />;
  if (status === 'warn') return <AlertTriangle size={size} strokeWidth={1.5} className="text-amber-500" />;
  return <XCircle size={size} strokeWidth={1.5} className="text-red-600" />;
}

function TrendIcon({ trend }) {
  if (trend === 'up')
    return (
      <span className="inline-flex items-center gap-0.5 text-red-600 text-xs font-medium">
        <ArrowUpRight size={14} strokeWidth={1.5} />
        <span>steigend</span>
      </span>
    );
  if (trend === 'down')
    return (
      <span className="inline-flex items-center gap-0.5 text-green-600 text-xs font-medium">
        <ArrowDownRight size={14} strokeWidth={1.5} />
        <span>fallend</span>
      </span>
    );
  return (
    <span className="inline-flex items-center gap-0.5 text-text-muted text-xs font-medium">
      <Minus size={14} strokeWidth={1.5} />
      <span>stabil</span>
    </span>
  );
}

// =============================================================================
// Helper: Section heading
// =============================================================================

function SectionHeading({ children }) {
  return (
    <h3 className="text-base font-semibold font-headline text-text-primary mt-8 mb-3 first:mt-0">
      {children}
    </h3>
  );
}

// =============================================================================
// Custom Tooltip for charts
// =============================================================================

function CustomPieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="surface-elevated rounded-[10px] px-3 py-2 text-xs font-body">
      <div className="font-medium text-text-primary">{d.name}</div>
      <div className="text-text-secondary mt-0.5">{d.value}% des Portfolios</div>
    </div>
  );
}

function CustomBarTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="surface-elevated rounded-[10px] px-3 py-2 text-xs font-body">
      <div className="font-medium text-text-primary">{label}</div>
      <div className="text-text-secondary mt-0.5">{formatCurrencyCompact(payload[0].value)}</div>
    </div>
  );
}

// =============================================================================
// Tab 1: Portfolio-Uebersicht
// =============================================================================

function PortfolioTab({ companies }) {
  // Portfolio = alle NICHT abgelehnten Anträge/Engagements. Damit ist der
  // Portfoliovolumen-Wert konsistent zur Summe Volumen in Bearbeitung +
  // Genehmigtes Volumen aus dem Dashboard.
  const portfolioCompanies = useMemo(
    () => companies.filter(c => c.status !== 'rejected'),
    [companies],
  );
  const portfolioVolume = useMemo(
    () => portfolioCompanies.reduce((sum, c) => sum + (c.kredit?.betrag || 0), 0),
    [portfolioCompanies]
  );

  /** Group companies by branche and sum kredit.betrag (ohne abgelehnte) */
  const branchenData = useMemo(() => {
    const map = {};
    portfolioCompanies.forEach((c) => {
      const branche = c.branche || 'Sonstige';
      if (!map[branche]) map[branche] = 0;
      map[branche] += c.kredit?.betrag || 0;
    });
    return Object.entries(map)
      .map(([name, betrag]) => ({ name, betrag }))
      .sort((a, b) => b.betrag - a.betrag);
  }, [portfolioCompanies]);

  const kpis = [
    {
      label: 'Portfoliovolumen',
      value: formatCurrencyCompact(portfolioVolume),
      icon: Euro,
    },
    {
      label: 'Durchschnittsrating',
      value: '3,8',
      icon: Target,
    },
    {
      label: 'Blankoquote',
      value: '28,4%',
      icon: Shield,
    },
    {
      label: 'NPL-Quote',
      value: '1,2%',
      icon: AlertTriangle,
    },
  ];

  /** Custom label renderer for the pie chart */
  const renderPieLabel = ({ name, value, cx, cy, midAngle, outerRadius }) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 28;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text
        x={x}
        y={y}
        fill="var(--text-secondary)"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={11}
        fontFamily="var(--font-mono)"
      >
        {name.replace('Rating ', '')} ({value} %)
      </text>
    );
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="bg-surface-card border border-border rounded-xl p-5 transition-[box-shadow,border-color] duration-150 hover:border-primary-light hover:shadow-[var(--card-shadow-hover)]"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-surface-inset flex items-center justify-center shrink-0">
                  <Icon size={15} strokeWidth={1.75} className="text-gold" />
                </div>
                <p className="text-xs font-medium text-text-muted font-body truncate" title={kpi.label}>
                  {kpi.label}
                </p>
              </div>
              <span className="block text-[26px] font-medium font-mono tracking-[-0.02em] text-text-primary leading-none whitespace-nowrap">
                {kpi.value}
              </span>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart: Rating Distribution */}
        <div className="bg-surface-card border border-border rounded-xl p-6">
          <h4 className="text-sm font-semibold font-headline text-text-secondary mb-4">
            Verteilung nach Ratingklassen
          </h4>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={RATING_DISTRIBUTION}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  label={renderPieLabel}
                  labelLine={{ stroke: 'var(--border-strong)', strokeWidth: 1 }}
                >
                  {RATING_DISTRIBUTION.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 mt-2 justify-center">
            {RATING_DISTRIBUTION.map((entry) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-xs font-body text-text-secondary">
                <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: entry.color }} />
                <span>{entry.name}: {entry.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart: Volumen nach Branchen */}
        <div className="bg-surface-card border border-border rounded-xl p-6">
          <h4 className="text-sm font-semibold font-headline text-text-secondary mb-4">
            Volumen nach Branchen
          </h4>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={branchenData}
                layout="vertical"
                margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
              >
                <CartesianGrid horizontal={false} stroke="var(--chart-grid)" />
                <XAxis
                  type="number"
                  tickFormatter={(v) => formatCurrencyCompact(v)}
                  tick={{ fontSize: 11, fill: 'var(--chart-axis)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={150}
                  tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomBarTooltip />} />
                <Bar dataKey="betrag" fill="var(--mode-chart)" radius={[0, 4, 4, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Portfolio Table */}
      <div className="bg-surface-card border border-border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h4 className="text-sm font-semibold font-headline text-text-secondary">
            Portfolio-Übersicht — Alle Kreditengagements
          </h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-body">
            <thead>
              <tr className="bg-surface border-b border-border">
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Firma</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Branche</th>
                <th className="text-right px-4 py-3 font-medium text-text-secondary">Kreditvolumen</th>
                <th className="text-center px-4 py-3 font-medium text-text-secondary">Rating</th>
                <th className="text-center px-4 py-3 font-medium text-text-secondary">Status</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Bearbeiter</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((c) => {
                const rating = COMPANY_RATINGS[c.id] || '--';
                return (
                  <tr key={c.id} className="border-b border-border last:border-b-0 hover:bg-surface/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-text-primary">{c.firma}</div>
                      <div className="text-xs text-text-muted mt-0.5">{c.id}</div>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{c.branche}</td>
                    <td className="px-4 py-3 text-right font-mono text-text-primary">
                      {formatCurrency(c.kredit?.betrag || 0)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <InlineRatingBadge klasse={rating} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusPill status={c.status} />
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{c.bearbeiter}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-surface border-t-2 border-primary/30">
                <td className="px-4 py-3 font-bold text-text-primary">
                  Gesamt ({companies.length} Engagements)
                </td>
                <td className="px-4 py-3" />
                <td className="px-4 py-3 text-right font-mono font-bold text-primary">
                  {formatCurrency(portfolioVolume)}
                </td>
                <td className="px-4 py-3" />
                <td className="px-4 py-3" />
                <td className="px-4 py-3" />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

/** Compact status pill for the portfolio table */
function StatusPill({ status }) {
  const config = {
    kyc: { label: 'KYC', bg: 'bg-blue-100', text: 'text-blue-800' },
    analysis: { label: 'Analyse', bg: 'bg-purple-100', text: 'text-purple-800' },
    rating: { label: 'Rating', bg: 'bg-amber-100', text: 'text-amber-800' },
    collateral: { label: 'Sicherheiten', bg: 'bg-cyan-100', text: 'text-cyan-800' },
    voting: { label: 'Votum', bg: 'bg-indigo-100', text: 'text-indigo-800' },
    decision: { label: 'Entscheidung', bg: 'bg-orange-100', text: 'text-orange-800' },
    approved: { label: 'Genehmigt', bg: 'bg-green-100', text: 'text-green-800' },
    rejected: { label: 'Abgelehnt', bg: 'bg-red-100', text: 'text-red-800' },
  };
  const c = config[status] || { label: status, bg: 'bg-gray-100', text: 'text-gray-800' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  );
}

// =============================================================================
// Tab 2: Fruehwarnindikatoren
// =============================================================================

function FruehwarnTab({ companies }) {
  // Available companies for the dropdown: those that have fruehwarn data
  const fruehwarnCompanyIds = Object.keys(FRUEHWARN_DATA);

  // Build list with company names for dropdown
  const availableCompanies = useMemo(() => {
    return fruehwarnCompanyIds.map((id) => ({
      id,
      firma: FRUEHWARN_DATA[id].firma,
    }));
  }, []);

  const [selectedId, setSelectedId] = useState(fruehwarnCompanyIds[0]);
  const data = FRUEHWARN_DATA[selectedId];

  // Summary statistics
  const summary = useMemo(() => {
    if (!data) return { total: 0, ok: 0, warn: 0, critical: 0 };
    const total = data.indikatoren.length;
    const ok = data.indikatoren.filter((i) => i.status === 'ok').length;
    const warn = data.indikatoren.filter((i) => i.status === 'warn').length;
    const critical = data.indikatoren.filter((i) => i.status === 'critical').length;
    return { total, ok, warn, critical };
  }, [data]);

  const warnCount = summary.warn + summary.critical;

  // Traffic light color
  const trafficColor =
    summary.critical > 0 ? 'bg-red-500' : summary.warn > 0 ? 'bg-amber-400' : 'bg-green-500';
  const trafficBg =
    summary.critical > 0 ? 'bg-red-50 border-red-200' : summary.warn > 0 ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200';
  const trafficText =
    summary.critical > 0 ? 'text-red-800' : summary.warn > 0 ? 'text-amber-800' : 'text-green-800';

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Company Selector */}
      <div className="flex flex-wrap items-center gap-4">
        <label className="text-sm font-medium font-body text-text-secondary">
          Unternehmen auswählen:
        </label>
        <div className="relative">
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="appearance-none rounded-lg border border-border bg-surface-card pl-3 pr-10 py-2 text-sm font-body text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors min-w-[280px]"
          >
            {availableCompanies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.firma}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            strokeWidth={1.5}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
          />
        </div>
      </div>

      {/* Summary Banner */}
      <div className={`flex items-center gap-4 rounded-xl border p-4 ${trafficBg}`}>
        <div className={`w-5 h-5 rounded-full ${trafficColor} shadow-sm flex-shrink-0`} />
        <div>
          <p className={`text-sm font-semibold font-body ${trafficText}`}>
            {warnCount} von {summary.total} Indikatoren im Warnbereich
          </p>
          <p className="text-xs text-text-secondary mt-0.5 font-body">
            {summary.ok > 0 && <span className="text-green-700">{summary.ok} unauffällig</span>}
            {summary.warn > 0 && (
              <span className="text-amber-700">{summary.ok > 0 ? ' · ' : ''}{summary.warn} Warnung</span>
            )}
            {summary.critical > 0 && (
              <span className="text-red-700"> · {summary.critical} kritisch</span>
            )}
          </p>
        </div>
      </div>

      {/* Indicator Table */}
      <div className="overflow-x-auto border border-border rounded-xl">
        <table className="w-full text-sm font-body">
          <thead>
            <tr className="bg-surface border-b border-border">
              <th className="text-left px-4 py-3 font-medium text-text-secondary">Indikator</th>
              <th className="text-center px-4 py-3 font-medium text-text-secondary w-20">Status</th>
              <th className="text-left px-4 py-3 font-medium text-text-secondary">Aktueller Wert</th>
              <th className="text-left px-4 py-3 font-medium text-text-secondary">Schwelle</th>
              <th className="text-center px-4 py-3 font-medium text-text-secondary">Trend</th>
            </tr>
          </thead>
          <tbody>
            {data.indikatoren.map((ind, idx) => {
              const rowBg =
                ind.status === 'critical'
                  ? 'bg-red-50/50'
                  : ind.status === 'warn'
                    ? 'bg-amber-50/50'
                    : '';
              return (
                <tr
                  key={idx}
                  className={`border-b border-border last:border-b-0 transition-colors ${rowBg}`}
                >
                  <td className="px-4 py-3 font-medium text-text-primary">{ind.name}</td>
                  <td className="px-4 py-3 text-center">
                    <StatusIcon status={ind.status} />
                  </td>
                  <td className="px-4 py-3 font-mono text-text-primary text-xs">{ind.wert}</td>
                  <td className="px-4 py-3 text-text-muted text-xs">{ind.schwelle}</td>
                  <td className="px-4 py-3 text-center">
                    <TrendIcon trend={ind.trend} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-xs font-body text-text-muted px-1">
        <div className="flex items-center gap-1.5">
          <CheckCircle size={14} strokeWidth={1.5} className="text-green-600" />
          <span>Unauffällig</span>
        </div>
        <div className="flex items-center gap-1.5">
          <AlertTriangle size={14} strokeWidth={1.5} className="text-amber-500" />
          <span>Warnung (Schwelle nahe)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <XCircle size={14} strokeWidth={1.5} className="text-red-600" />
          <span>Kritisch (Schwelle überschritten)</span>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Tab 3: Rating-Migration
// =============================================================================

function MigrationTab() {
  // Compute summary stats
  const { improvements, stable, deteriorations } = useMemo(() => {
    let imp = 0;
    let stab = 0;
    let det = 0;
    let total = 0;

    MIGRATION_DATA.forEach((row, i) => {
      row.forEach((val, j) => {
        total += val;
        if (i === j) stab += val;
        else if (j < i) imp += val; // moved to better rating class
        else det += val; // moved to worse rating class
      });
    });

    return {
      improvements: ((imp / total) * 100).toFixed(1).replace('.', ','),
      stable: ((stab / total) * 100).toFixed(1).replace('.', ','),
      deteriorations: ((det / total) * 100).toFixed(1).replace('.', ','),
    };
  }, []);

  /** Get cell background color based on position relative to diagonal */
  const getCellColor = (rowIdx, colIdx, value) => {
    if (value === 0) return 'bg-gray-50 text-text-muted';
    if (rowIdx === colIdx) {
      // Diagonal: stayed same rating class
      return 'bg-primary/10 text-primary font-bold';
    }
    if (colIdx < rowIdx) {
      // Above diagonal from row perspective (improvement: moved to better class)
      const intensity = value >= 8 ? 'bg-green-100 text-green-800' : 'bg-green-50 text-green-700';
      return intensity;
    }
    // Below diagonal (deterioration: moved to worse class)
    const intensity = value >= 8 ? 'bg-red-100 text-red-800' : 'bg-red-50 text-red-700';
    return intensity;
  };

  return (
    <div className="space-y-6">
      <SectionHeading>Rating-Migrationsmatrix</SectionHeading>
      <p className="text-sm text-text-secondary font-body -mt-1 mb-4">
        Darstellung der Rating-Bewegungen im Kreditportfolio über die letzten 12 Monate.
        Zeilen = Rating Vorjahr, Spalten = Rating aktuell. Werte in Prozent.
      </p>

      {/* Matrix */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <table className="text-sm font-body border-collapse">
            <thead>
              <tr>
                <th className="w-32 px-3 py-2" />
                <th
                  colSpan={MIGRATION_LABELS.length}
                  className="text-center px-3 py-2 text-xs font-semibold text-text-secondary uppercase tracking-wider border-b border-border"
                >
                  Rating aktuell (2025)
                </th>
              </tr>
              <tr>
                <th className="px-3 py-2 text-right text-xs font-semibold text-text-secondary">
                  Vorjahr ↓
                </th>
                {MIGRATION_LABELS.map((label) => (
                  <th
                    key={label}
                    className="px-3 py-2 text-center font-mono font-semibold text-text-primary text-xs min-w-[64px] border-b border-border"
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MIGRATION_DATA.map((row, rowIdx) => (
                <tr key={rowIdx}>
                  <td className="px-3 py-2 text-right font-mono font-semibold text-text-primary text-xs border-r border-border">
                    {MIGRATION_LABELS[rowIdx]}
                  </td>
                  {row.map((val, colIdx) => (
                    <td
                      key={colIdx}
                      className={`px-3 py-3 text-center font-mono text-xs border border-border/50 transition-colors ${getCellColor(rowIdx, colIdx, val)}`}
                    >
                      {val > 0 ? `${val}%` : '–'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-5 text-xs font-body text-text-secondary mt-2 px-1">
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-sm bg-primary/10 border border-primary/20 inline-block" />
          <span>Diagonale (stabil)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-sm bg-green-100 border border-green-200 inline-block" />
          <span>Verbesserung</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-sm bg-red-100 border border-red-200 inline-block" />
          <span>Verschlechterung</span>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <TrendingUp size={16} strokeWidth={1.5} className="text-green-600" />
            <span className="text-xs font-medium font-body text-green-700 uppercase tracking-wide">
              Verbesserungen
            </span>
          </div>
          <span className="text-2xl font-bold font-mono text-green-800">{improvements}%</span>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Minus size={16} strokeWidth={1.5} className="text-blue-600" />
            <span className="text-xs font-medium font-body text-blue-700 uppercase tracking-wide">
              Stabil
            </span>
          </div>
          <span className="text-2xl font-bold font-mono text-blue-800">{stable}%</span>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <TrendingDown size={16} strokeWidth={1.5} className="text-red-600" />
            <span className="text-xs font-medium font-body text-red-700 uppercase tracking-wide">
              Verschlechterungen
            </span>
          </div>
          <span className="text-2xl font-bold font-mono text-red-800">{deteriorations}%</span>
        </div>
      </div>

      {/* Additional context */}
      <div className="flex items-start gap-2 text-xs text-text-muted font-body bg-surface border border-border rounded-lg p-3 mt-2">
        <Info size={14} strokeWidth={1.5} className="flex-shrink-0 mt-0.5" />
        <span>
          Die Migrationsmatrix basiert auf {companies_count()} Kreditengagements mit jährlicher
          Rating-Überprüfung. Die vereinfachte Darstellung fasst Ratingklassen in fünf Gruppen zusammen.
          Detailanalysen auf Einzelrating-Ebene sind im Rating-Modul verfügbar.
        </span>
      </div>
    </div>
  );
}

/** Placeholder for the info text -- returns count description */
function companies_count() {
  return '142';
}

// =============================================================================
// Tab 4: Watchlist / Intensivbetreuung
// =============================================================================

function WatchlistTab() {
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6">
      <SectionHeading>Watchlist & Intensivbetreuung</SectionHeading>
      <p className="text-sm text-text-secondary font-body -mt-1 mb-4">
        Übersicht der Kreditengagements mit erhöhtem Betreuungsbedarf gemäß MaRisk BTO 1.2.
        Eskalationsstufen werden automatisch anhand definierter Schwellenwerte vorgeschlagen.
      </p>

      {/* Escalation Stepper (reference) */}
      <div className="bg-surface border border-border rounded-xl p-5">
        <h4 className="text-xs font-semibold font-headline text-text-secondary uppercase tracking-wider mb-4">
          Eskalationsstufen
        </h4>
        <div className="flex items-center gap-0 overflow-x-auto pb-2">
          {ESCALATION_LEVELS.map((level, idx) => (
            <div key={level.key} className="flex items-center flex-shrink-0">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-mono border-2 ${
                    idx === 0
                      ? 'bg-green-100 border-green-400 text-green-700'
                      : idx === 1
                        ? 'bg-amber-100 border-amber-400 text-amber-700'
                        : idx === 2
                          ? 'bg-orange-100 border-orange-400 text-orange-700'
                          : idx === 3
                            ? 'bg-red-100 border-red-400 text-red-700'
                            : 'bg-red-200 border-red-600 text-red-900'
                  }`}
                >
                  {idx + 1}
                </div>
                <span className="text-[10px] font-body text-text-secondary mt-1.5 text-center max-w-[90px] leading-tight">
                  {level.label}
                </span>
                {level.ref && (
                  <span className="text-[9px] font-mono text-text-muted mt-0.5">
                    {level.ref}
                  </span>
                )}
              </div>
              {idx < ESCALATION_LEVELS.length - 1 && (
                <div className="w-8 h-0.5 bg-border mx-1 mt-[-18px]" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Watchlist Entries */}
      <div className="space-y-4">
        {WATCHLIST_ENTRIES.map((entry) => {
          const isExpanded = expandedId === entry.id;
          const levelIdx = ESCALATION_LEVELS.findIndex((l) => l.key === entry.level);

          return (
            <div
              key={entry.id}
              className="bg-surface-card border border-border rounded-xl overflow-hidden shadow-sm"
            >
              {/* Header (always visible, clickable) */}
              <button
                type="button"
                onClick={() => toggleExpand(entry.id)}
                className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-surface/50 transition-colors"
              >
                {/* Level indicator */}
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    entry.level === 'intensiv'
                      ? 'bg-orange-100 text-orange-700'
                      : entry.level === 'problem'
                        ? 'bg-red-100 text-red-700'
                        : entry.level === 'sanierung'
                          ? 'bg-red-200 text-red-900'
                          : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  <AlertTriangle size={20} strokeWidth={1.5} />
                </div>

                {/* Company info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold font-headline text-text-primary truncate">
                      {entry.firma}
                    </h4>
                    <span className="text-xs font-mono text-text-muted">{entry.id}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        entry.level === 'intensiv'
                          ? 'bg-orange-100 text-orange-800'
                          : entry.level === 'problem'
                            ? 'bg-red-100 text-red-800'
                            : entry.level === 'sanierung'
                              ? 'bg-red-200 text-red-900'
                              : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      Stufe {levelIdx + 1}: {ESCALATION_LEVELS[levelIdx]?.label}
                    </span>
                    <span className="text-xs text-text-muted font-body">
                      Review: {new Date(entry.naechsterReview).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                {/* Expand chevron */}
                <div className="flex-shrink-0 text-text-muted">
                  {isExpanded ? (
                    <ChevronUp size={20} strokeWidth={1.5} />
                  ) : (
                    <ChevronDown size={20} strokeWidth={1.5} />
                  )}
                </div>
              </button>

              {/* Expanded Detail */}
              {isExpanded && (
                <div className="px-5 pb-5 border-t border-border">
                  {/* Stepper for this entry */}
                  <div className="py-4">
                    <div className="flex items-center gap-0 overflow-x-auto">
                      {ESCALATION_LEVELS.map((level, idx) => {
                        const isActive = idx === levelIdx;
                        const isPast = idx < levelIdx;
                        return (
                          <div key={level.key} className="flex items-center flex-shrink-0">
                            <div className="flex flex-col items-center">
                              <div
                                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-mono border-2 transition-colors ${
                                  isActive
                                    ? 'bg-primary border-primary text-white shadow-md'
                                    : isPast
                                      ? 'bg-primary/20 border-primary/40 text-primary'
                                      : 'bg-gray-100 border-gray-300 text-gray-400'
                                }`}
                              >
                                {idx + 1}
                              </div>
                              <span
                                className={`text-[10px] font-body mt-1 text-center max-w-[80px] leading-tight ${
                                  isActive ? 'text-primary font-semibold' : isPast ? 'text-text-secondary' : 'text-text-muted'
                                }`}
                              >
                                {level.short}
                              </span>
                            </div>
                            {idx < ESCALATION_LEVELS.length - 1 && (
                              <div
                                className={`w-6 h-0.5 mx-0.5 mt-[-16px] ${
                                  isPast ? 'bg-primary/40' : 'bg-border'
                                }`}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Content Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left column */}
                    <div className="space-y-4">
                      {/* Begründung */}
                      <div>
                        <h5 className="text-xs font-semibold font-headline text-text-secondary uppercase tracking-wider mb-2">
                          Begründung
                        </h5>
                        <p className="text-sm font-body text-text-primary leading-relaxed">
                          {entry.begruendung}
                        </p>
                      </div>

                      {/* Maßnahmenplan */}
                      <div>
                        <h5 className="text-xs font-semibold font-headline text-text-secondary uppercase tracking-wider mb-2">
                          Maßnahmenplan
                        </h5>
                        <ul className="space-y-1.5">
                          {entry.massnahmen.map((m, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-2 text-sm font-body text-text-primary"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                              <span>{m}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Meta */}
                      <div className="flex flex-wrap gap-4 pt-2">
                        <div>
                          <span className="text-xs text-text-muted font-body block">Verantwortlicher</span>
                          <span className="text-sm font-medium font-body text-text-primary">
                            {entry.verantwortlicher}
                          </span>
                        </div>
                        <div>
                          <span className="text-xs text-text-muted font-body block">Nächster Review</span>
                          <span className="text-sm font-medium font-body text-text-primary">
                            {new Date(entry.naechsterReview).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right column: Protokoll */}
                    <div>
                      <h5 className="text-xs font-semibold font-headline text-text-secondary uppercase tracking-wider mb-2">
                        Protokoll / Verlauf
                      </h5>
                      <div className="relative">
                        {/* Timeline line */}
                        <div className="absolute left-[7px] top-3 bottom-3 w-0.5 bg-border" />

                        <div className="space-y-4">
                          {entry.protokoll.map((p, idx) => (
                            <div key={idx} className="relative flex gap-3">
                              {/* Timeline dot */}
                              <div
                                className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 z-10 ${
                                  idx === 0
                                    ? 'bg-primary border-primary'
                                    : 'bg-surface-card border-border'
                                }`}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-mono text-text-muted mb-0.5">
                                  {new Date(p.datum).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                </div>
                                <p className="text-sm font-body text-text-primary leading-relaxed">
                                  {p.text}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary footer */}
      <div className="flex items-start gap-2 text-xs text-text-muted font-body bg-surface border border-border rounded-lg p-3">
        <Info size={14} strokeWidth={1.5} className="flex-shrink-0 mt-0.5" />
        <span>
          Die Zuordnung zu Betreuungsstufen erfolgt gemäß den MaRisk-Anforderungen (BTO 1.2.4 und BTO 1.2.5).
          Engagements werden regelmäßig überprüft und ggf. in die nächsthöhere oder -niedrigere Stufe überführt.
          Die Dokumentation der Maßnahmen und Entscheidungen ist revisionssicher im Protokoll hinterlegt.
        </span>
      </div>
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export default function MonitoringView() {
  const { state } = useApp();
  const companies = state.companies;
  const [activeTab, setActiveTab] = useState('portfolio');

  return (
    <div className="space-y-6">
      <StepIntroCard stepKey="monitoring" />
      {/* Page heading */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-surface-inset flex items-center justify-center shrink-0">
          <Activity size={20} strokeWidth={1.5} className="text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold font-headline text-text-primary">
            Monitoring & Frühwarnung
          </h1>
          <p className="text-sm font-body text-text-secondary">
            Portfolio-Überwachung · Frühwarnsystem · Eskalationsmanagement
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 bg-surface-card border border-border rounded-xl p-1.5">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium font-body transition-all ${
                isActive
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-secondary hover:bg-surface hover:text-text-primary'
              }`}
            >
              <Icon size={16} strokeWidth={1.5} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-surface-card border border-border rounded-xl p-6">
        {activeTab === 'portfolio' && <PortfolioTab companies={companies} />}
        {activeTab === 'fruehwarn' && <FruehwarnTab companies={companies} />}
        {activeTab === 'migration' && <MigrationTab />}
        {activeTab === 'watchlist' && <WatchlistTab />}
      </div>
    </div>
  );
}
