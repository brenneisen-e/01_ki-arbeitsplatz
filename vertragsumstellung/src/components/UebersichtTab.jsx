import { useState } from 'react'
import {
  BarChart, Bar, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import {
  mockVermittler, vzOptions, produktionsstandard, distributionCharts,
  agenturFunktionen, zuschuesseData,
} from '../data/constants'
import { formatEuro, formatDelta } from '../utils/format'

function VzSidebar({ insurer }) {
  const [selectedVz, setSelectedVz] = useState(vzOptions[0])

  const vzChartData = [
    { name: '(Null)', value: 4, fill: '#94a3b8' },
    { name: '< 0%', value: 15, fill: '#ef4444' },
    { name: '0-5%', value: 12, fill: '#f59e0b' },
    { name: '5-10%', value: 18, fill: '#3b82f6' },
    { name: '> 10%', value: 19, fill: '#22c55e' },
  ]

  return (
    <div className="vu-ub-sidebar" style={{ background: insurer.colors.ubSidebarGradient, borderColor: insurer.colors.ubBorder }}>
      <select
        className="vu-ub-vz-select"
        value={selectedVz}
        onChange={e => setSelectedVz(e.target.value)}
      >
        {vzOptions.map(vz => <option key={vz} value={vz}>{vz}</option>)}
      </select>

      <div className="vu-ub-vz-name">{selectedVz}</div>

      <div className="vu-ub-vz-fields">
        <div className="vu-ub-vz-row">
          <span className="vz-label">VZ-Leiter:</span>{' '}
          <span className="vz-value">Marc Hintze</span>
        </div>
        <div className="vu-ub-vz-row">
          <span className="vz-label">Bezirksleiter:</span>{' '}
          <span className="vz-value">-</span>
        </div>
      </div>

      <div className="vu-ub-vz-note">
        <strong>Keine Berücksichtigung in der Simulation:</strong>
        <ul><li>Angestellte Vermittler</li></ul>
      </div>

      <div className="vu-ub-vz-divider" />

      <div className="vu-ub-vz-chart-title">Vergleich Ergebnisse Alt vs. Neu je AGT</div>
      <div className="vu-ub-vz-chart">
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={vzChartData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
            <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 9 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={20}>
              {vzChartData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="vu-ub-vz-legend">
        <span className="vz-legend-item"><span className="vz-dot null" /> (Null)</span>
        <span className="vz-legend-item"><span className="vz-dot neg" /> &lt; 0%</span>
        <span className="vz-legend-item"><span className="vz-dot low" /> 0-5%</span>
        <span className="vz-legend-item"><span className="vz-dot mid" /> 5-10%</span>
        <span className="vz-legend-item"><span className="vz-dot high" /> &gt; 10%</span>
      </div>
    </div>
  )
}

function VermittlerTable() {
  return (
    <div className="vu-ub-table-section">
      <div className="vu-ub-table-title">Simulationsergebnisse</div>
      <div className="vu-table-wrapper">
        <table className="vu-table vu-ub-table">
          <thead>
            <tr>
              <th rowSpan={2} style={{ minWidth: 60 }}></th>
              <th rowSpan={2}>Vermittler</th>
              <th rowSpan={2}>Status</th>
              <th colSpan={2} className="th-group">Vergütung AP</th>
              <th colSpan={2} className="th-group">Vergütung FP</th>
              <th rowSpan={2}>Sonst. Erfolgsabh. Vergütung</th>
              <th rowSpan={2}>Zuschüsse</th>
              <th rowSpan={2}>Zusatzverg.</th>
              <th rowSpan={2}>Vergütung Alt</th>
              <th rowSpan={2}>Simulierte Vergütung</th>
              <th rowSpan={2}>Gesamtdifferenz</th>
            </tr>
            <tr>
              <th>Alt</th>
              <th>Neu</th>
              <th>Alt</th>
              <th>Neu</th>
            </tr>
          </thead>
          <tbody>
            {mockVermittler.map(vm => (
              <tr key={vm.nr}>
                <td style={{ fontSize: 10, color: '#94a3b8' }}>{vm.nr}</td>
                <td><strong>{vm.name}</strong></td>
                <td style={{ fontSize: 10 }}>{vm.status}</td>
                <td>{vm.apAlt != null ? formatEuro(vm.apAlt) : '–'}</td>
                <td>{vm.apNeu != null ? formatEuro(vm.apNeu) : '–'}</td>
                <td>{vm.fpAlt != null ? formatEuro(vm.fpAlt) : '–'}</td>
                <td>{vm.fpNeu != null ? formatEuro(vm.fpNeu) : '–'}</td>
                <td>{vm.sonst != null ? formatEuro(vm.sonst) : '–'}</td>
                <td>{vm.zusch != null ? formatEuro(vm.zusch) : '–'}</td>
                <td>{vm.zusatz != null ? formatEuro(vm.zusatz) : '–'}</td>
                <td>{vm.vergAlt != null ? formatEuro(vm.vergAlt) : '–'}</td>
                <td>{vm.vergSim != null ? formatEuro(vm.vergSim) : '–'}</td>
                <td style={{
                  fontWeight: 700,
                  color: vm.diff > 0 ? '#16a34a' : vm.diff < 0 ? '#dc2626' : undefined,
                }}>
                  {formatDelta(vm.diff)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function DistributionCharts() {
  const agenturData = agenturFunktionen.labels.map((label, i) => ({
    name: label, value: agenturFunktionen.data[i],
  }))

  return (
    <div className="vu-ub-charts-row">
      <div className="vu-ub-chart-box">
        <div className="vu-ub-chart-title">Anzahl Vermittler mit jeweiliger Provisionseinstufung (AP)</div>
        <div className="vu-ub-charts-inner">
          {distributionCharts.map(chart => (
            <div key={chart.title} className="vu-ub-chart-item">
              <div className="vu-ub-chart-label">{chart.title}</div>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={chart.labels.map((l, i) => ({ name: l, value: chart.data[i] }))} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 8 }} axisLine={false} tickLine={false} interval={0} angle={-30} textAnchor="end" height={40} />
                  <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                  <Bar dataKey="value" fill="var(--mode-primary)" radius={[3, 3, 0, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ))}
        </div>
      </div>
      <div className="vu-ub-chart-box">
        <div className="vu-ub-chart-title">Übersicht Agenturfunktionen</div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={agenturData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
            <Bar dataKey="value" fill="var(--mode-primary)" radius={[3, 3, 0, 0]} barSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function BottomRow() {
  const zuschData = [
    { name: 'Alt', allgemein: zuschuesseData.alt.allgemein, buero: zuschuesseData.alt.buero },
    { name: 'Neu', allgemein: zuschuesseData.neu.allgemein, buero: zuschuesseData.neu.buero },
  ]

  return (
    <div className="vu-ub-bottom-row">
      <div className="vu-ub-chart-box">
        <div className="vu-ub-chart-title">Anzahl Vermittler mit erreichtem Produktionsstandard</div>
        <table className="vu-table vu-ub-small-table">
          <thead>
            <tr>{produktionsstandard.headers.map((h, i) => <th key={i}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {produktionsstandard.rows.map((row, i) => (
              <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="vu-ub-chart-box">
        <div className="vu-ub-chart-title">Vergleich – allgemeine Zuschüsse</div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={zuschData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
            <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 700 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={v => formatEuro(v)} />
            <Tooltip formatter={v => formatEuro(v)} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 10 }} />
            <Bar dataKey="allgemein" name="Allgemeiner Zuschuss" stackId="a" fill="#334155" radius={[0, 0, 0, 0]} />
            <Bar dataKey="buero" name="Bürozuschuss" stackId="a" fill="var(--mode-accent, #00A3E0)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="vu-ub-chart-box vu-ub-disclaimer">
        <div className="vu-ub-chart-title">Disclaimer</div>
        <div className="vu-ub-disclaimer-text">
          <p><strong>Hinweis:</strong> Diese Darstellung dient der Veranschaulichung eines Vergleichs zwischen der bisherigen Vergütung (gemäß Ist-Daten der Referenzzeiträume <strong>01.07.2023–30.06.2024</strong> und <strong>01.07.2024–30.06.2025</strong>) und einer simulierten Anwendung des neuen Provisionsmodells.</p>
          <p>Die Agentur- und Provisions-Einstufung in der Simulation erfolgt auf Basis des <strong>Durchschnitts der beiden Referenzzeiträume</strong>.</p>
          <p>Für die Bestandsprovisionen aus Altverträgen gilt ein <strong>Bestandsschutz</strong>. Das bedeutet, dass die neuen Provisionsarten ausschließlich für Neugeschäft ab dem Umstellungszeitpunkt <strong>01.01.2026</strong> gelten.</p>
        </div>
      </div>
    </div>
  )
}

export default function UebersichtTab({ insurer }) {
  return (
    <div className="vu-tab-content active">
      <div className="vu-ub-grid">
        <VzSidebar insurer={insurer} />
        <div className="vu-ub-main" style={{ borderColor: insurer.colors.ubBorder }}>
          <div className="vu-ub-main-header">
            <h3>Vergleich Umstellung</h3>
            <p>Rechnerische Simulationsergebnisse</p>
          </div>
          <VermittlerTable />
          <DistributionCharts />
          <BottomRow />
          <div className="vu-ub-info-link">
            Infomaterial:{' '}
            <a href="https://www.barmenia24.de/deu/b24_ein_exklusivvertrieb_1/uebersicht.xhtml" target="_blank" rel="noopener noreferrer">
              Provisionsmodell {insurer.modellName}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
