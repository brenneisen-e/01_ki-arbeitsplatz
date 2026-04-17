import { useState, useEffect, useRef, lazy, Suspense, useMemo } from 'react';
import { LayoutGrid, MapPin, Users, AlertTriangle, Shield } from 'lucide-react';
import { useInstitut } from '../../hooks/useInstitut';

const GermanyMap = lazy(() => import('./GermanyMap'));

const COCKPIT_LABELS = {
  insurance: {
    headcountLabel: 'Vermittler gesamt',
    headcountShort: 'Vermittler',
    unitLabel: 'Regionaldirektion',
    unitLabelPlural: 'Regionaldirektionen',
    unitLabelPluralHeading: 'Regionaldirektionen — Gesundheitsscore',
    unitLabelShort: 'RDs',
    dimTurnover: 'Fluktuation',
    dimStaffing: 'Vakanzen',
    dimEngagement: 'Engagement',
    dimDemographics: 'Nachwuchs',
    dimProduction: 'Produktion',
    dimQuality: 'Stornoquote',
    navRegions: 'Regionen-Vergleich',
    navUnit: 'Einheiten-Detail',
    idPrefix: 'rd_',
    complianceBanner: 'HR-Cockpit — Frühwarnsystem für Vertriebsorganisationen. Alle Daten pseudonymisiert gemäß DSGVO Art. 25. Mindestgruppengröße: 10 Personen. Human-in-the-Loop gem. Art. 22 DSGVO.'
  },
  generic: {
    headcountLabel: 'Mitarbeitende gesamt',
    headcountShort: 'Mitarbeitende',
    unitLabel: 'Business Unit',
    unitLabelPlural: 'Business Units',
    unitLabelPluralHeading: 'Business Units — Workforce Health',
    unitLabelShort: 'BUs',
    dimTurnover: 'Fluktuation',
    dimStaffing: 'Vakanzen',
    dimEngagement: 'Engagement',
    dimDemographics: 'Nachwuchs',
    dimProduction: 'Produktivität',
    dimQuality: 'Qualität',
    navRegions: 'Abteilungs-Vergleich',
    navUnit: 'BU-Detail',
    idPrefix: 'bu_',
    complianceBanner: 'HR-Cockpit — Frühwarnsystem für die Workforce. Alle Daten pseudonymisiert gemäß DSGVO Art. 25. Mindestgruppengröße: 10 Personen. Human-in-the-Loop gem. Art. 22 DSGVO.'
  }
};

// ======== Demo Data ========
const BUSINESS_UNITS = [
  { id: 'bu_tech',        name: 'Technology',         region: 'Berlin',      headcount: 312, budgeted: 340 },
  { id: 'bu_data',        name: 'Data & Analytics',   region: 'Berlin',      headcount: 89,  budgeted: 110 },
  { id: 'bu_finance',     name: 'Finance',            region: 'Frankfurt',   headcount: 198, budgeted: 220 },
  { id: 'bu_legal',       name: 'Legal & Compliance', region: 'Frankfurt',   headcount: 67,  budgeted: 75  },
  { id: 'bu_hr',          name: 'Human Resources',    region: 'Hamburg',     headcount: 145, budgeted: 160 },
  { id: 'bu_marketing',   name: 'Marketing',          region: 'München',     headcount: 167, budgeted: 185 },
  { id: 'bu_product',     name: 'Product',            region: 'München',     headcount: 212, budgeted: 235 },
  { id: 'bu_operations',  name: 'Operations',         region: 'Dortmund',    headcount: 441, budgeted: 480 },
  { id: 'bu_logistics',   name: 'Logistics',          region: 'Dortmund',    headcount: 356, budgeted: 400 },
  { id: 'bu_sales',       name: 'Sales',              region: 'Düsseldorf',  headcount: 284, budgeted: 310 },
  { id: 'bu_cs',          name: 'Customer Success',   region: 'Köln',        headcount: 178, budgeted: 200 },
  { id: 'bu_procurement', name: 'Procurement',        region: 'Stuttgart',   headcount: 134, budgeted: 150 },
];

const REGIONALDIREKTIONEN = [
  { id: 'rd_nrw_west', name: 'RD Düsseldorf', region: 'NRW West', headcount: 584, budgeted: 620 },
  { id: 'rd_nrw_ost', name: 'RD Dortmund', region: 'NRW Ost', headcount: 461, budgeted: 500 },
  { id: 'rd_nrw_sued', name: 'RD Köln', region: 'NRW Süd', headcount: 523, budgeted: 560 },
  { id: 'rd_nord_west', name: 'RD Hamburg', region: 'Nord-West', headcount: 392, budgeted: 430 },
  { id: 'rd_nord_ost', name: 'RD Berlin', region: 'Nord-Ost', headcount: 341, budgeted: 390 },
  { id: 'rd_mitte_west', name: 'RD Frankfurt', region: 'Mitte-West', headcount: 482, budgeted: 520 },
  { id: 'rd_mitte_ost', name: 'RD Erfurt', region: 'Mitte-Ost', headcount: 251, budgeted: 310 },
  { id: 'rd_sued_west', name: 'RD Stuttgart', region: 'Süd-West', headcount: 472, budgeted: 510 },
  { id: 'rd_sued_ost', name: 'RD München', region: 'Süd-Ost', headcount: 563, budgeted: 600 },
  { id: 'rd_nord_mitte', name: 'RD Hannover', region: 'Nord-Mitte', headcount: 351, budgeted: 400 },
  { id: 'rd_sued_mitte', name: 'RD Nürnberg', region: 'Süd-Mitte', headcount: 372, budgeted: 420 },
  { id: 'rd_ost', name: 'RD Dresden', region: 'Ost', headcount: 222, budgeted: 280 },
];

function generateMetrics(units) {
  const profiles = [{ bias: 'good', count: 4 }, { bias: 'average', count: 5 }, { bias: 'bad', count: 3 }];
  let profileIdx = 0, profileCount = 0;
  return units.map(rd => {
    if (profileCount >= profiles[profileIdx].count) { profileIdx = Math.min(profileIdx + 1, profiles.length - 1); profileCount = 0; }
    profileCount++;
    const bias = profiles[profileIdx].bias;
    const base = bias === 'good' ? 75 : bias === 'average' ? 55 : 30;
    const v = () => Math.round((Math.random() - 0.5) * 20);
    const retention = Math.min(100, Math.max(0, base + v() + 5));
    const staffing = Math.min(100, Math.max(0, base + v()));
    const engagement = Math.min(100, Math.max(0, base + v() + 3));
    const demographics = Math.min(100, Math.max(0, base + v() - 5));
    const production = Math.min(100, Math.max(0, base + v() + 2));
    const quality = Math.min(100, Math.max(0, base + v()));
    const composite = Math.round(retention * 0.25 + staffing * 0.15 + engagement * 0.20 + demographics * 0.10 + production * 0.15 + quality * 0.15);
    const turnoverRate = bias === 'good' ? (5 + Math.random() * 4) : bias === 'average' ? (9 + Math.random() * 5) : (14 + Math.random() * 6);
    const vacancyRate = ((rd.budgeted - rd.headcount) / rd.budgeted * 100);
    const trend = [];
    let trendVal = composite;
    for (let m = 0; m < 12; m++) { trendVal = Math.min(100, Math.max(0, trendVal + (Math.random() - 0.5) * 8)); trend.push(Math.round(trendVal)); }
    return {
      ...rd,
      metrics: { retention, staffing, engagement, demographics, production, quality },
      composite, turnoverRate: Math.round(turnoverRate * 10) / 10, vacancyRate: Math.round(vacancyRate * 10) / 10,
      trend, tier: composite >= 75 ? 'green' : composite >= 40 ? 'amber' : 'red'
    };
  });
}

const heatmapColor = (val) => {
  if (val >= 75) return '#dcfce7';
  if (val >= 60) return '#fef9c3';
  if (val >= 40) return '#fed7aa';
  return '#fecaca';
};

const tierColor = (tier) => tier === 'green' ? '#16A34A' : tier === 'amber' ? '#D97706' : '#DC2626';

// ======== Sub-Views ========
function OverviewView({ data, labels }) {
  const totalHeadcount = data.reduce((s, d) => s + d.headcount, 0);
  const totalBudgeted = data.reduce((s, d) => s + d.budgeted, 0);
  const avgComposite = Math.round(data.reduce((s, d) => s + d.composite, 0) / data.length);
  const redCount = data.filter(d => d.tier === 'red').length;

  return (
    <div>
      {/* KPIs */}
      <div className="hp-kpi-bar" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 'var(--space-6)' }}>
        <div className="hp-kpi-card">
          <div className="hp-kpi-label">{labels.headcountLabel}</div>
          <div className="hp-kpi-value">{totalHeadcount.toLocaleString('de-DE')}</div>
          <div className="hp-kpi-desc">von {totalBudgeted.toLocaleString('de-DE')} budgetiert</div>
        </div>
        <div className="hp-kpi-card">
          <div className="hp-kpi-label">Ø Health Score</div>
          <div className={`hp-kpi-value ${avgComposite >= 60 ? 'green' : avgComposite >= 40 ? '' : 'red'}`}>{avgComposite}/100</div>
          <div className="hp-kpi-desc">Gewichteter Durchschnitt aller {labels.unitLabelShort}</div>
        </div>
        <div className="hp-kpi-card">
          <div className="hp-kpi-label">{labels.unitLabelPlural}</div>
          <div className="hp-kpi-value blue">{data.length}</div>
          <div className="hp-kpi-desc">bundesweit</div>
        </div>
        <div className="hp-kpi-card">
          <div className="hp-kpi-label">Kritische {labels.unitLabelShort}</div>
          <div className="hp-kpi-value" style={{ color: '#DC2626' }}>{redCount}</div>
          <div className="hp-kpi-desc">Health Score unter 40</div>
        </div>
      </div>

      {/* Two-column: Alerts + Map */}
      <div className="hc-overview-grid">
        <div className="hc-overview-main">
          {/* Alerts */}
          <div className="hc-panel" style={{ marginBottom: 'var(--space-6)' }}>
            <div className="hc-panel-header">
              <h3>Aktuelle Warnungen</h3>
              <span className="hc-alert-count">{data.filter(d => d.tier === 'red').length + data.filter(d => d.tier === 'amber').length}</span>
            </div>
            <div className="hc-alerts-list">
              {data.filter(d => d.tier !== 'green').sort((a, b) => a.composite - b.composite).slice(0, 5).map(d => (
                <div key={d.id} className={`hc-alert-item ${d.tier}`}>
                  <span className={`hc-alert-dot ${d.tier}`} />
                  <span className="hc-alert-text"><strong>{d.name}</strong> — Health Score {d.composite} ({d.tier === 'red' ? 'Kritisch' : 'Beobachten'})</span>
                  <span className="hc-alert-metric">Fluktuation: {d.turnoverRate}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Movers Table */}
          <div className="hc-panel hc-full-width">
            <div className="hc-panel-header"><h3>Risk Movers — Größte Score-Veränderungen</h3></div>
            <div className="hc-table-wrapper">
              <table className="hc-table">
                <thead>
                  <tr><th>Kennung</th><th>{labels.unitLabel}</th><th>Aktueller Score</th><th>{labels.headcountShort}</th><th>Fluktuation</th><th>Vakanzen</th></tr>
                </thead>
                <tbody>
                  {[...data].sort((a, b) => a.composite - b.composite).map(d => (
                    <tr key={d.id}>
                      <td><span style={{ color: tierColor(d.tier), fontWeight: 600 }}>●</span> {d.id.replace(labels.idPrefix, '').toUpperCase()}</td>
                      <td>{d.name}</td>
                      <td><strong>{d.composite}</strong></td>
                      <td>{d.headcount}</td>
                      <td>{d.turnoverRate}%</td>
                      <td>{d.vacancyRate.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Map Panel */}
        <div className="hc-overview-sidebar">
          <div className="hc-panel hc-map-panel">
            <div className="hc-panel-header">
              <h3>{labels.unitLabelPluralHeading}</h3>
              <span className="hc-panel-badge">Klicken für Details</span>
            </div>
            <Suspense fallback={<div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="hp-loading-spinner" /></div>}>
              <GermanyMap data={data} headcountShort={labels.headcountShort} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}

function RegionsView({ data, labels }) {
  const dims = [labels.dimTurnover, labels.dimStaffing, labels.dimEngagement, labels.dimDemographics, labels.dimProduction, labels.dimQuality];
  const dimKeys = ['retention', 'staffing', 'engagement', 'demographics', 'production', 'quality'];

  return (
    <div>
      {/* Heatmap */}
      <div className="hc-panel hc-full-width" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="hc-panel-header">
          <h3>Organisations-Gesundheit — Heat Map</h3>
          <span className="hc-panel-subtitle">{labels.unitLabelPlural} × Gesundheitsdimensionen</span>
        </div>
        <div className="hc-heatmap-wrapper">
          <table className="hc-heatmap">
            <thead>
              <tr><th>{labels.unitLabel}</th><th>Gesamt</th>{dims.map(d => <th key={d}>{d}</th>)}</tr>
            </thead>
            <tbody>
              {[...data].sort((a, b) => b.composite - a.composite).map(d => (
                <tr key={d.id}>
                  <td style={{ fontWeight: 600 }}>{d.name}</td>
                  <td style={{ background: heatmapColor(d.composite), fontWeight: 700, textAlign: 'center' }}>{d.composite}</td>
                  {dimKeys.map(k => (
                    <td key={k} style={{ background: heatmapColor(d.metrics[k]), textAlign: 'center' }}>{d.metrics[k]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* League Table */}
      <div className="hc-panel hc-full-width">
        <div className="hc-panel-header"><h3>Rangliste — 12-Monats-Trends</h3></div>
        <div className="hc-table-wrapper">
          <table className="hc-table">
            <thead>
              <tr><th>#</th><th>{labels.unitLabel}</th><th>Health Score</th><th>{labels.headcountShort}</th><th>Fluktuation</th><th>Vakanzen</th></tr>
            </thead>
            <tbody>
              {[...data].sort((a, b) => b.composite - a.composite).map((d, i) => (
                <tr key={d.id}>
                  <td>{i + 1}</td>
                  <td style={{ fontWeight: 600 }}>{d.name}</td>
                  <td><span style={{ color: tierColor(d.tier), fontWeight: 700 }}>{d.composite}</span></td>
                  <td>{d.headcount}</td>
                  <td>{d.turnoverRate}%</td>
                  <td>{d.vacancyRate.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function UnitDetailView({ data, labels }) {
  const [selectedRD, setSelectedRD] = useState(data[0]?.id || '');
  const rd = data.find(d => d.id === selectedRD) || data[0];

  return (
    <div>
      <div className="hc-unit-selector">
        <label>{labels.unitLabel}:</label>
        <select value={selectedRD} onChange={e => setSelectedRD(e.target.value)}>
          {data.map(d => <option key={d.id} value={d.id}>{d.name} ({d.region})</option>)}
        </select>
      </div>

      {rd && (
        <>
          <div className="hc-panel hc-full-width" style={{ marginBottom: 'var(--space-6)' }}>
            <div className="hc-panel-header"><h3>{rd.name} — Scorecard</h3></div>
            <div className="hc-unit-scorecard">
              {[
                { label: 'Health Score', value: rd.composite, unit: '/100' },
                { label: labels.headcountShort, value: rd.headcount, unit: `/ ${rd.budgeted}` },
                { label: 'Fluktuation', value: `${rd.turnoverRate}%`, unit: '' },
                { label: 'Vakanzenquote', value: `${rd.vacancyRate.toFixed(1)}%`, unit: '' },
              ].map((item, i) => (
                <div key={i} className="hc-scorecard-item">
                  <div className="hc-scorecard-label">{item.label}</div>
                  <div className="hc-scorecard-value" style={{ color: tierColor(rd.tier) }}>{item.value}<span className="hc-scorecard-unit">{item.unit}</span></div>
                </div>
              ))}
            </div>
          </div>

          {/* Dimension Bars */}
          <div className="hc-panel hc-full-width">
            <div className="hc-panel-header"><h3>Gesundheitsdimensionen</h3></div>
            <div className="hp-score-breakdown">
              {Object.entries(rd.metrics).map(([key, val]) => {
                const barClass = val >= 70 ? 'high' : val >= 40 ? 'mid' : 'low';
                const dimLabels = { retention: labels.dimTurnover, staffing: labels.dimStaffing, engagement: labels.dimEngagement, demographics: labels.dimDemographics, production: labels.dimProduction, quality: labels.dimQuality };
                return (
                  <div key={key} className="hp-score-bar-row">
                    <div className="hp-score-bar-label">{dimLabels[key] || key}</div>
                    <div className="hp-score-bar-track"><div className={`hp-score-bar-value ${barClass}`} style={{ width: `${val}%` }} /></div>
                    <div className="hp-score-bar-num">{val}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function EarlyWarningView({ data, labels }) {
  const criticalRDs = data.filter(d => d.tier !== 'green').sort((a, b) => a.composite - b.composite);

  return (
    <div>
      {/* Active Warnings */}
      <div className="hc-panel hc-full-width" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="hc-panel-header">
          <h3>Aktive Frühwarnungen</h3>
        </div>
        <div className="hc-ew-grid">
          {criticalRDs.map(d => (
            <div key={d.id} className={`hc-ew-card ${d.tier}`}>
              <div className="hc-ew-card-header">
                <span className={`hc-alert-dot ${d.tier}`} />
                <strong>{d.name}</strong>
                <span className="hc-ew-score">{d.composite}</span>
              </div>
              <div className="hc-ew-card-body">
                <div>Fluktuation: {d.turnoverRate}%</div>
                <div>Vakanzen: {d.vacancyRate.toFixed(1)}%</div>
                <div>{labels.headcountShort}: {d.headcount} / {d.budgeted}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Retention Kanban */}
      <div className="hc-panel hc-full-width" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="hc-panel-header"><h3>Retention-Maßnahmen Tracker</h3></div>
        <div className="hc-kanban">
          {[
            { label: 'Identifiziert', color: 'red', count: criticalRDs.filter(d => d.tier === 'red').length },
            { label: 'Bleibegespräch geplant', color: 'amber', count: 2 },
            { label: 'Maßnahme eingeleitet', color: 'blue', count: 1 },
            { label: 'Ergebnis dokumentiert', color: 'green', count: 0 },
          ].map((col, i) => (
            <div key={i} className="hc-kanban-col">
              <div className="hc-kanban-col-header">
                <span className={`hc-kanban-dot ${col.color}`} />
                {col.label}
                <span className="hc-kanban-count">{col.count}</span>
              </div>
              <div className="hc-kanban-cards">
                {i === 0 && criticalRDs.filter(d => d.tier === 'red').map(d => (
                  <div key={d.id} className="hc-kanban-card">
                    <strong>{d.name}</strong>
                    <div>Score: {d.composite} | {d.headcount} {labels.headcountShort}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Individuelle Auffälligkeiten (Demo / Mitbestimmungs-Disclaimer) */}
      <EmployeeWarningsPanel labels={labels} />

      {/* Model Performance */}
      <div className="hc-panel hc-full-width">
        <div className="hc-panel-header"><h3>Modell-Performance</h3></div>
        <div className="hc-model-perf">
          {[
            { label: 'AUC-ROC', value: '0.87', cls: 'green', desc: 'Trennschärfe des Vorhersagemodells' },
            { label: 'Precision (Rot)', value: '78%', cls: '', desc: 'Anteil korrekter Rot-Einstufungen' },
            { label: 'Recall (Rot)', value: '82%', cls: '', desc: 'Anteil erkannter Abgänge' },
            { label: 'Vorhersagezeitraum', value: 'Ø 4.2 Monate', cls: 'blue', desc: 'Durchschnittliche Vorwarnzeit' },
          ].map((m, i) => (
            <div key={i} className="hc-perf-metric">
              <div className="hc-perf-label">{m.label}</div>
              <div className={`hc-perf-value ${m.cls}`}>{m.value}</div>
              <div className="hc-perf-desc">{m.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ======== Employee Warnings Panel (Demo / Mitbestimmung) ========
const EMPLOYEE_WARNINGS = [
  { id: 'emp-a', label: 'M.S., Team Sales DACH', team: 'Sales DACH', signal: 'Mitarbeiterbefragung 21 Punkte negativer als Vorjahr', level: 'red', updated: '10.04.2026', measure: 'Bleibegespräch mit direkter Führungskraft in KW 17' },
  { id: 'emp-b', label: 'Kandidat/in #042', team: 'Finance Controlling', signal: 'Niedriger Engagement-Score im FK-Feedback (Q1)', level: 'amber', updated: '08.04.2026', measure: 'Coaching-Angebot über People & Culture prüfen' },
  { id: 'emp-c', label: 'Kandidat/in #118', team: 'Operations Süd', signal: 'Krankheitstage +32 % gegenüber 12-Monats-Durchschnitt', level: 'red', updated: '12.04.2026', measure: 'Gespräch BGM / arbeitsmedizinischer Dienst empfohlen' },
  { id: 'emp-d', label: 'Kandidat/in #007', team: 'Tech Platform', signal: 'Zwei Absagen auf interne Ausschreibungen in 90 Tagen', level: 'amber', updated: '05.04.2026', measure: 'Karrieregespräch, Entwicklungsperspektive abstimmen' }
];

function EmployeeWarningsPanel({ labels }) {
  return (
    <div className="hc-panel hc-full-width hc-employee-warn-panel" style={{ marginBottom: 'var(--space-6)' }}>
      <div className="hc-panel-header">
        <h3>
          <Shield size={16} style={{ verticalAlign: 'middle', marginRight: 8, color: '#DC2626' }} />
          Individuelle Auffälligkeiten
          <span className="hc-employee-warn-demo-badge">Demo / Mockup</span>
        </h3>
      </div>
      <div className="hc-mitbestimmung-note">
        <strong>Hinweis Mitbestimmung:</strong> Individuelle HR-Analytics unterliegen dem BetrVG (§ 87 Abs. 1 Nr. 6 / § 80 Abs. 1 Nr. 1). Vor produktiver Nutzung ist eine Betriebsvereinbarung mit dem Betriebsrat erforderlich. Darstellung hier ausschließlich als Mockup.
      </div>
      <div className="hc-employee-warn-list">
        {EMPLOYEE_WARNINGS.map(w => (
          <div key={w.id} className={`hc-employee-warn-card ${w.level}`}>
            <div className="hc-employee-warn-head">
              <span className={`hc-alert-dot ${w.level}`} />
              <strong>{w.label}</strong>
              <span className="hc-employee-warn-team">{w.team}</span>
            </div>
            <div className="hc-employee-warn-signal">{w.signal}</div>
            <div className="hc-employee-warn-meta">
              <span>Letzte Aktualisierung: {w.updated}</span>
            </div>
            <div className="hc-employee-warn-measure">
              <strong>Empfohlene Maßnahme:</strong> {w.measure}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ======== Main Cockpit Mode ========
export default function CockpitMode() {
  const { institut } = useInstitut();
  const labels = useMemo(() => COCKPIT_LABELS[institut.mode === 'generic' ? 'generic' : 'insurance'], [institut.mode]);
  const [view, setView] = useState('overview');
  const data = useMemo(
    () => generateMetrics(institut.mode === 'generic' ? BUSINESS_UNITS : REGIONALDIREKTIONEN),
    [institut.mode]
  );

  const views = [
    { id: 'overview', label: 'Gesamtübersicht', icon: <LayoutGrid size={16} /> },
    { id: 'regions', label: labels.navRegions, icon: <MapPin size={16} /> },
    { id: 'unit', label: labels.navUnit, icon: <Users size={16} /> },
    { id: 'earlywarning', label: 'Frühwarnsystem', icon: <AlertTriangle size={16} /> },
  ];

  return (
    <div className="hp-cockpit-section active">
      {/* Sub-Navigation */}
      <div className="hc-subnav">
        {views.map(v => (
          <button
            key={v.id}
            className={`hc-subnav-btn ${view === v.id ? 'active' : ''}`}
            onClick={() => setView(v.id)}
          >
            {v.icon} {v.label}
          </button>
        ))}
      </div>

      {/* Compliance Banner */}
      <div className="hc-compliance-banner">
        <Shield size={16} />
        <span>{labels.complianceBanner}</span>
      </div>

      {view === 'overview' && <OverviewView data={data} labels={labels} />}
      {view === 'regions' && <RegionsView data={data} labels={labels} />}
      {view === 'unit' && <UnitDetailView data={data} labels={labels} />}
      {view === 'earlywarning' && <EarlyWarningView data={data} labels={labels} />}
    </div>
  );
}
