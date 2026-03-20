import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, CartesianGrid, ReferenceLine,
} from 'recharts'
import { User } from 'lucide-react'
import { commissionRates, karriereStufen, sparteLevels, sliderConfig, defaultSimulation } from '../data/constants'
import { formatEuro, formatDelta, formatPercent } from '../utils/format'
import { getTotalProduction, getHighestReachedLevel, get5YearProjection } from '../utils/calculations'

function StammdatenSidebar({ results, insurer }) {
  const delta = results.neu.total - results.alt.total
  const pct = results.alt.total > 0 ? (delta / results.alt.total * 100) : 0

  const chartData = [
    { name: 'Leben', alt: results.alt.leben.total, neu: results.neu.leben.total },
    { name: 'Kranken', alt: results.alt.kranken.total, neu: results.neu.kranken.total },
    { name: 'S/U', alt: results.alt.schaden.total, neu: results.neu.schaden.total },
  ]

  return (
    <div className="vu-sim-stammdaten" style={{ background: insurer.colors.sidebarGradient }}>
      <div className="vu-sim-stamm-photo" style={{ borderColor: insurer.colors.accent + '66' }}>
        <User size={40} strokeWidth={1.5} />
      </div>
      <div className="vu-sim-stamm-select">Maria Musterfrau</div>
      <div className="vu-sim-stamm-role">Leiter des Service-Centers</div>

      <div className="vu-sim-stamm-fields">
        {[
          ['Status:', 'Offen'],
          ['Gesamtstand:', '04.12.2025'],
          ['BD-Nummer:', '0000001'],
          ['Eintrittsdatum:', '01.01.2090'],
          ['Agenturstatus:', 'Ab 01.01.2026'],
        ].map(([label, value]) => (
          <div key={label} className="vu-sim-stamm-row">
            <span className="stamm-label">{label}</span>
            <span className="stamm-value">{value}</span>
          </div>
        ))}
      </div>

      <div className="vu-sim-stamm-divider" />

      <div className="vu-sim-stamm-section-title">
        Veränderung Vergütung ggü.<br />Durchschnitt WJ 23/24 und 24/25<br />
        <span style={{ fontSize: 13, opacity: 0.7 }}>(simuliert)</span>
      </div>

      <div className="vu-sim-stamm-chart-wrap">
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={chartData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
            <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={v => (v / 1000) + 'k'} />
            <Tooltip
              contentStyle={{ background: insurer.colors.primary, border: `2px solid ${insurer.colors.accent}80`, borderRadius: 10, color: '#e2e8f0' }}
              formatter={v => formatEuro(v)}
            />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 10 }} />
            <Bar dataKey="alt" name="Alt" fill="rgba(148,163,184,0.5)" radius={[4, 4, 0, 0]} barSize={18} />
            <Bar dataKey="neu" name="Neu" fill={insurer.colors.accent + 'cc'} radius={[4, 4, 0, 0]} barSize={18} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="vu-sim-stamm-compare-vals">
        <div className="stamm-compare-item">
          <span className="stamm-compare-dot alt" />
          <span className="stamm-compare-label">Alt</span>
          <span className="stamm-compare-val">{formatEuro(results.alt.total)}</span>
        </div>
        <div className="stamm-compare-item">
          <span className="stamm-compare-dot neu" style={{ background: insurer.colors.accent }} />
          <span className="stamm-compare-label">Neu</span>
          <span className="stamm-compare-val highlight" style={{ color: insurer.colors.accent }}>{formatEuro(results.neu.total)}</span>
        </div>
      </div>

      <div className={`vu-sim-stamm-delta ${delta < 0 ? 'negative' : ''}`}>
        <span className="stamm-delta-arrow">{delta >= 0 ? '▲' : '▼'}</span>
        <span className="stamm-delta-val">{formatDelta(delta)}</span>
        <span className="stamm-delta-pct">({formatPercent(pct)})</span>
      </div>

      <div className="vu-sim-stamm-footnote">
        Vergleich Durchschnitt Wertungsjahre 23/24 und 24/25 mit simulierter Neuregelung
      </div>
    </div>
  )
}

function KPIRow({ results, karriereStufe }) {
  const delta = results.delta.total
  return (
    <div className="vu-kpi-row">
      <div className="vu-kpi-card status-info">
        <div className="kpi-label">Alt-Modell Gesamt</div>
        <div className="kpi-value">{formatEuro(results.alt.total)}</div>
      </div>
      <div className="vu-kpi-card status-success">
        <div className="kpi-label">Neues Modell Gesamt</div>
        <div className="kpi-value">{formatEuro(results.neu.total)}</div>
      </div>
      <div className={`vu-kpi-card ${delta >= 0 ? 'status-success' : 'status-danger'}`}>
        <div className="kpi-label">Delta</div>
        <div className="kpi-value">{formatDelta(delta)}</div>
      </div>
      <div className="vu-kpi-card status-warning">
        <div className="kpi-label">Karrierestufe</div>
        <div className="kpi-value">{karriereStufe.label}</div>
      </div>
    </div>
  )
}

function Sliders({ simulation, onSliderChange }) {
  return (
    <>
      <div className="vu-sim-sliders-info">
        Voreinstellung gemäß Produktion im Referenzzeitraum 01.01.2025 – 31.12.2025
      </div>
      <div className="vu-sim-sliders-row">
        {sliderConfig.map(group => (
          <div key={group.group} className="vu-sim-slider-block">
            <h4>{group.group}</h4>
            {group.sliders.map(s => {
              const val = simulation[s.field]
              const def = defaultSimulation[s.field]
              return (
                <div key={s.field} className="vu-slider-group">
                  <label>
                    {s.label}
                    <span>
                      {formatEuro(val)}
                      {val !== def && <span className="vu-slider-ref"> (Ref: {formatEuro(def)})</span>}
                    </span>
                  </label>
                  <input
                    type="range"
                    min={s.min}
                    max={s.max}
                    step={s.step}
                    value={val}
                    onChange={e => onSliderChange(s.field, parseInt(e.target.value))}
                  />
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </>
  )
}

function SparteCharts({ results }) {
  const sparten = [
    { key: 'leben', label: 'Leben' },
    { key: 'kranken', label: 'Kranken' },
    { key: 'schaden', label: 'Schaden/Unfall' },
  ]

  return (
    <div className="vu-charts-grid">
      {sparten.map(sp => {
        const altVal = results.alt[sp.key].total
        const neuVal = results.neu[sp.key].total
        const levels = sparteLevels[sp.key]
        const highestReached = getHighestReachedLevel(sp.key, neuVal)
        const highestLevel = levels[levels.length - 1]
        const yMax = Math.max(highestLevel.min * 1.15, altVal * 1.15, neuVal * 1.15)

        const chartData = [
          { name: 'Alt-Modell', value: altVal, fill: 'rgba(148,163,184,0.65)' },
          { name: 'Neu', value: neuVal, fill: highestReached ? highestReached.color + 'b3' : 'rgba(0,163,224,0.7)' },
        ]

        return (
          <div key={sp.key} className="vu-section vu-sparte-chart-box" style={{ marginBottom: 0 }}>
            <div className="vu-section-header" style={{ marginBottom: 12, paddingBottom: 10 }}>
              <div className="vu-section-title" style={{ fontSize: 14 }}>{sp.label}</div>
              <span className={`vu-sparte-badge ${highestReached ? 'reached' : 'open'}`}>
                {highestReached ? highestReached.label : 'unter LS 1'}
              </span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 14, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis
                  domain={[0, Math.ceil(yMax / 1000) * 1000]}
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={v => formatEuro(v)}
                />
                <Tooltip formatter={v => formatEuro(v)} />
                {levels.map(level => (
                  <ReferenceLine
                    key={level.key}
                    y={level.min}
                    stroke={neuVal >= level.min ? level.color : '#cbd5e1'}
                    strokeDasharray="6 3"
                    strokeWidth={1.5}
                    label={{
                      value: `${level.label} ${formatEuro(level.min)}`,
                      position: 'right',
                      fill: neuVal >= level.min ? level.color : '#94a3b8',
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  />
                ))}
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={50}>
                  {chartData.map((entry, i) => (
                    <rect key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )
      })}
    </div>
  )
}

function RatesTable({ karriereStufe }) {
  const sparten = [
    { key: 'leben', label: 'Leben' },
    { key: 'kranken', label: 'Kranken' },
    { key: 'schaden', label: 'Schaden/Unfall' },
  ]

  return (
    <div className="vu-section">
      <div className="vu-section-header">
        <div className="vu-section-title">Provisionssätze im Vergleich</div>
      </div>
      <div className="vu-table-wrapper">
        <table className="vu-table vu-rates-table">
          <thead>
            <tr>
              <th rowSpan={2}>Sparte</th>
              <th colSpan={2} className="th-group-alt">Alt-Modell</th>
              <th colSpan={2} className="th-group-neu">Neues Modell</th>
              <th colSpan={2} className="th-group-delta">Veränderung</th>
            </tr>
            <tr>
              <th className="th-group-alt">AP</th>
              <th className="th-group-alt">BP</th>
              <th className="th-group-neu">AP</th>
              <th className="th-group-neu">BP</th>
              <th className="th-group-delta">AP</th>
              <th className="th-group-delta">BP</th>
            </tr>
          </thead>
          <tbody>
            {sparten.map(sp => {
              const alt = commissionRates.altModell[sp.key]
              const neu = commissionRates.neu[sp.key]
              const dAP = neu.ap - alt.ap
              const dBP = neu.bp - alt.bp
              return (
                <tr key={sp.key}>
                  <td>{sp.label}</td>
                  <td>{alt.ap.toFixed(1)} %</td>
                  <td>{alt.bp.toFixed(2)} %</td>
                  <td style={{ fontWeight: 700 }}>{neu.ap.toFixed(1)} %</td>
                  <td style={{ fontWeight: 700 }}>{neu.bp.toFixed(2)} %</td>
                  <td style={{ color: dAP >= 0 ? '#16a34a' : '#dc2626' }}>{dAP >= 0 ? '+' : ''}{dAP.toFixed(1)} %</td>
                  <td style={{ color: dBP >= 0 ? '#16a34a' : '#dc2626' }}>{dBP >= 0 ? '+' : ''}{dBP.toFixed(2)} %</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="vu-rates-note">
        AP = Abschlussprovision auf Neugeschäft · BP = Bestandsprovision · Karrierestufe <strong>{karriereStufe.label}</strong> ({karriereStufe.factor.toFixed(2)}x) wird auf AP angerechnet
      </div>
    </div>
  )
}

function DetailTable({ results }) {
  const segments = [
    { key: 'leben', label: 'Leben' },
    { key: 'kranken', label: 'Kranken' },
    { key: 'schaden', label: 'Schaden/Unfall' },
  ]

  return (
    <div className="vu-section">
      <div className="vu-section-header">
        <div className="vu-section-title">Detailansicht nach Sparten</div>
      </div>
      <div className="vu-table-wrapper">
        <table className="vu-table">
          <thead>
            <tr>
              <th>Sparte</th>
              <th>Alt AP</th>
              <th>Alt BP</th>
              <th>Alt Gesamt</th>
              <th>Neu AP</th>
              <th>Neu BP</th>
              <th>Neu Gesamt</th>
              <th>Delta</th>
            </tr>
          </thead>
          <tbody>
            {segments.map(seg => {
              const alt = results.alt[seg.key]
              const neu = results.neu[seg.key]
              const d = neu.total - alt.total
              return (
                <tr key={seg.key}>
                  <td><strong>{seg.label}</strong></td>
                  <td>{formatEuro(alt.ap)}</td>
                  <td>{formatEuro(alt.bp)}</td>
                  <td><strong>{formatEuro(alt.total)}</strong></td>
                  <td>{formatEuro(neu.ap)}</td>
                  <td>{formatEuro(neu.bp)}</td>
                  <td><strong>{formatEuro(neu.total)}</strong></td>
                  <td style={{ fontWeight: 700, color: d >= 0 ? '#16a34a' : '#dc2626' }}>{formatDelta(d)}</td>
                </tr>
              )
            })}
            <tr style={{ fontWeight: 800, background: '#f8fafc' }}>
              <td>Gesamt</td>
              <td>{formatEuro(results.alt.totalAP)}</td>
              <td>{formatEuro(results.alt.totalBP)}</td>
              <td style={{ color: 'var(--mode-primary)' }}>{formatEuro(results.alt.total)}</td>
              <td>{formatEuro(results.neu.totalAP)}</td>
              <td>{formatEuro(results.neu.totalBP)}</td>
              <td style={{ color: 'var(--mode-primary)' }}>{formatEuro(results.neu.total)}</td>
              <td style={{ color: results.delta.total >= 0 ? '#16a34a' : '#dc2626' }}>{formatDelta(results.delta.total)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Leistungsstufen({ simulation, results }) {
  const totalProd = getTotalProduction(simulation)
  const currentStufe = karriereStufen.find(s => totalProd >= s.min && totalProd < s.max) || karriereStufen[karriereStufen.length - 1]
  const sparteLabels = { leben: 'Leben', kranken: 'Kranken', schaden: 'Schaden/Unfall' }

  return (
    <div className="vu-section vu-ls-section">
      <div className="vu-section-header">
        <div className="vu-section-title">Leistungsstufen – Provisionseinstufung</div>
      </div>
      <div className="vu-ls-grid">
        {karriereStufen.map(s => {
          const reached = totalProd >= s.min
          const isCurrent = s.key === currentStufe.key
          const maxLabel = s.max === Infinity ? '+' : formatEuro(s.max)
          return (
            <div key={s.key} className={`vu-ls-card ${reached ? 'reached' : ''} ${isCurrent ? 'current' : ''}`}>
              <div className="ls-check">✓</div>
              <div className="ls-name">{s.label}</div>
              <div className="ls-range">{formatEuro(s.min)} – {maxLabel}</div>
              <div className="ls-factor">{s.factor.toFixed(2)}x</div>
              <div className="ls-rates">Provisionsfaktor auf AP</div>
            </div>
          )
        })}

        <div className="vu-ls-sparte-goals">
          {Object.keys(sparteLevels).map(key => {
            const levels = sparteLevels[key]
            const current = results.neu[key].total
            const highestReached = getHighestReachedLevel(key, current)
            const topLevel = levels[levels.length - 1]
            const pct = Math.min((current / topLevel.min) * 100, 100)
            const nextLevel = highestReached
              ? (highestReached.key !== topLevel.key ? levels[levels.indexOf(highestReached) + 1] : null)
              : levels[0]

            return (
              <div key={key} className={`vu-ls-sparte-card ${highestReached ? 'reached' : ''}`}>
                <div className="sparte-goal-header">
                  <span className="sparte-goal-name">{sparteLabels[key]}</span>
                  <span className={`sparte-goal-badge ${highestReached ? 'reached' : ''}`}>
                    {highestReached ? highestReached.label : 'unter LS 1'}
                  </span>
                </div>
                <div className="sparte-goal-bar-track">
                  <div
                    className={`sparte-goal-bar-fill ${highestReached ? 'reached' : ''}`}
                    style={{ width: `${pct}%`, background: highestReached ? highestReached.color : '#e2e8f0' }}
                  />
                </div>
                <div className="sparte-goal-values">
                  <span>{formatEuro(current)}</span>
                  <span>Nächste: {nextLevel ? formatEuro(nextLevel.min) : 'Max erreicht'}</span>
                </div>
                <div className="sparte-ls-steps">
                  {levels.map(l => (
                    <span key={l.key} className={`sparte-ls-step ${current >= l.min ? 'active' : ''}`} style={current >= l.min ? { color: l.color } : undefined}>
                      {l.label}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function FiveYearChart({ results, insurer }) {
  const data = get5YearProjection(results)

  return (
    <div className="vu-section">
      <div className="vu-section-header">
        <div className="vu-section-title">Provisionseinnahmen – 5-Jahres-Perspektive</div>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
          <XAxis dataKey="year" tick={{ fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => formatEuro(v)} />
          <Tooltip formatter={v => formatEuro(v)} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12, fontWeight: 600 }} />
          <Line type="monotone" dataKey="alt" name="Alt-Modell" stroke="#94a3b8" strokeWidth={2} dot={{ r: 4, fill: '#94a3b8' }} />
          <Line type="monotone" dataKey="neu" name="Neues Modell" stroke={insurer.colors.accent} strokeWidth={3} dot={{ r: 5, fill: insurer.colors.accent }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default function SimulationTab({ simulation, results, karriereStufe, onSliderChange, insurer }) {
  return (
    <div className="vu-tab-content active">
      <div className="vu-sim-grid">
        <StammdatenSidebar results={results} insurer={insurer} />
        <div className="vu-sim-main" style={{ borderColor: insurer.colors.simBorder }}>
          <KPIRow results={results} karriereStufe={karriereStufe} />
          <Sliders simulation={simulation} onSliderChange={onSliderChange} />
          <SparteCharts results={results} />
          <RatesTable karriereStufe={karriereStufe} />
          <DetailTable results={results} />
          <Leistungsstufen simulation={simulation} results={results} />
          <FiveYearChart results={results} insurer={insurer} />
        </div>
      </div>
    </div>
  )
}
