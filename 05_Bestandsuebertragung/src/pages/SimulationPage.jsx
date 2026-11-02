import { useState, useMemo, useCallback } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Cell } from 'recharts'
import { SlidersHorizontal, RotateCcw, Sparkles, ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus, Info } from 'lucide-react'
import { VERMITTLER, PROV_RANGES, PROD_STUFEN, berechneEinnahmen, optimiereProvSaetze } from '../utils/simulation-data'

const fmt = (v) => v.toLocaleString('de-DE', { maximumFractionDigits: 0 })
const fmtEur = (v) => `${fmt(v)} €`
const fmtPct = (v) => `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`

function getDefaultSaetze() {
  return Object.fromEntries(
    VERMITTLER.map(v => [v.id, { ...v.provisionssaetze }])
  )
}

function getGlobalDefaults() {
  return {
    ap_satz_su: 65,
    prov_satz_tier: 22,
    ap_fp_satz_kfz: 8,
    ap_satz_leben: 22,
    fp_satz_shu: 11,
    fp_satz_leben: 1.5,
    ap_satz_kv: 5,
    fp_satz_kranken: 1.5,
  }
}

export default function SimulationPage() {
  const [mode, setMode] = useState('global') // 'global' | 'individual'
  const [globalSaetze, setGlobalSaetze] = useState(getGlobalDefaults())
  const [individualSaetze, setIndividualSaetze] = useState(getDefaultSaetze)
  const [expandedVermittler, setExpandedVermittler] = useState(null)
  const [sortKey, setSortKey] = useState('delta_pct')
  const [sortDir, setSortDir] = useState('desc')
  const [showOptInfo, setShowOptInfo] = useState(false)

  // Berechne IST-Einnahmen (mit Original-Provisionssätzen)
  const istData = useMemo(() => {
    return VERMITTLER.map(v => ({
      ...v,
      einnahmen: berechneEinnahmen(v, v.provisionssaetze),
    }))
  }, [])

  // Berechne SOLL-Einnahmen (mit angepassten Provisionssätzen)
  const sollData = useMemo(() => {
    return VERMITTLER.map(v => {
      const saetze = mode === 'global' ? globalSaetze : individualSaetze[v.id]
      return {
        ...v,
        einnahmen: berechneEinnahmen(v, saetze),
        saetze,
      }
    })
  }, [mode, globalSaetze, individualSaetze])

  // Vergleichsdaten
  const vergleich = useMemo(() => {
    return istData.map((ist, i) => {
      const soll = sollData[i]
      const delta = soll.einnahmen.gesamt - ist.einnahmen.gesamt
      const deltaPct = ist.einnahmen.gesamt !== 0
        ? (delta / ist.einnahmen.gesamt) * 100
        : 0
      return {
        id: ist.id,
        name: ist.name,
        klassifizierung: ist.klassifizierung,
        ist: ist.einnahmen.gesamt,
        soll: soll.einnahmen.gesamt,
        delta,
        deltaPct,
        istDetail: ist.einnahmen,
        sollDetail: soll.einnahmen,
        produktionsstufen: ist.produktionsstufen,
        provIst: ist.provisionssaetze,
        provSoll: soll.saetze,
      }
    })
  }, [istData, sollData])

  // Sortierung
  const sorted = useMemo(() => {
    const key = sortKey === 'name' ? 'name'
      : sortKey === 'ist' ? 'ist'
      : sortKey === 'soll' ? 'soll'
      : sortKey === 'delta' ? 'delta'
      : 'deltaPct'

    return [...vergleich].sort((a, b) => {
      const va = key === 'name' ? a.name : a[key]
      const vb = key === 'name' ? b.name : b[key]
      if (typeof va === 'string') return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
      return sortDir === 'asc' ? va - vb : vb - va
    })
  }, [vergleich, sortKey, sortDir])

  // Aggregierte Werte
  const totals = useMemo(() => {
    const istSum = vergleich.reduce((s, v) => s + v.ist, 0)
    const sollSum = vergleich.reduce((s, v) => s + v.soll, 0)
    const winners = vergleich.filter(v => v.delta > 0).length
    const losers = vergleich.filter(v => v.delta < 0).length
    const neutral = vergleich.filter(v => v.delta === 0).length
    return { istSum, sollSum, delta: sollSum - istSum, deltaPct: istSum ? ((sollSum - istSum) / istSum) * 100 : 0, winners, losers, neutral }
  }, [vergleich])

  // Chart-Daten (Top 20)
  const chartData = useMemo(() => {
    return sorted.slice(0, 20).map(v => ({
      name: v.name.split(',')[0],
      ist: Math.round(v.ist),
      soll: Math.round(v.soll),
      delta: Math.round(v.delta),
    }))
  }, [sorted])

  const handleSort = useCallback((key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }, [sortKey])

  const handleGlobalChange = useCallback((key, value) => {
    setGlobalSaetze(prev => ({ ...prev, [key]: Number(value) }))
  }, [])

  const handleIndividualChange = useCallback((vermittlerId, key, value) => {
    setIndividualSaetze(prev => ({
      ...prev,
      [vermittlerId]: { ...prev[vermittlerId], [key]: Number(value) }
    }))
  }, [])

  const handleReset = useCallback(() => {
    setGlobalSaetze(getGlobalDefaults())
    setIndividualSaetze(getDefaultSaetze())
  }, [])

  const handleOptimize = useCallback(() => {
    const result = optimiereProvSaetze(VERMITTLER, totals.istSum)
    if (mode === 'global') {
      setGlobalSaetze(result)
    }
    setShowOptInfo(true)
    setTimeout(() => setShowOptInfo(false), 5000)
  }, [mode, totals.istSum])

  // Übernehme globale Sätze als individuelle Basis
  const handleApplyGlobalToAll = useCallback(() => {
    const newIndividual = {}
    VERMITTLER.forEach(v => { newIndividual[v.id] = { ...globalSaetze } })
    setIndividualSaetze(newIndividual)
    setMode('individual')
  }, [globalSaetze])

  return (
    <div className="p-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <SlidersHorizontal size={24} style={{ color: 'var(--mode-primary)' }} />
            BGAV Simulation
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Provisionssätze anpassen und Auswirkungen auf Vermittler-Einnahmen simulieren
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm transition-colors">
            <RotateCcw size={14} /> Zurücksetzen
          </button>
          <button onClick={handleOptimize}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-white text-sm transition-colors"
            style={{ background: 'var(--mode-gradient)' }}>
            <Sparkles size={14} /> Optimieren
          </button>
        </div>
      </div>

      {/* Optimierungs-Info */}
      {showOptInfo && (
        <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2 animate-fade-in-up">
          <Info size={16} />
          Provisionssätze wurden so optimiert, dass die Gesamtauszahlung möglichst nah am IST-Wert bleibt.
        </div>
      )}

      {/* Modus-Tabs */}
      <div className="flex gap-1 mb-6">
        <button onClick={() => setMode('global')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'global' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>
          Globale Sätze
        </button>
        <button onClick={() => setMode('individual')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'individual' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>
          Individuelle Sätze
        </button>
        {mode === 'global' && (
          <button onClick={handleApplyGlobalToAll}
            className="ml-auto px-3 py-1.5 rounded-lg text-xs border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors">
            Globale Werte → Individuell übernehmen
          </button>
        )}
      </div>

      {/* Globale Provisionssätze */}
      {mode === 'global' && (
        <div className="card-base p-5 mb-6">
          <h2 className="text-base font-semibold text-slate-700 mb-4">Provisionssätze (global für alle Vermittler)</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(PROV_RANGES).map(([key, range]) => (
              <div key={key} className="space-y-1">
                <label className="text-xs text-slate-500 font-medium">{range.label}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={range.min} max={range.max} step={range.step}
                    value={globalSaetze[key]}
                    onChange={e => handleGlobalChange(key, e.target.value)}
                    className="flex-1 h-1.5 accent-[var(--mode-primary)]"
                  />
                  <span className="text-sm font-mono font-semibold text-slate-700 w-16 text-right">
                    {globalSaetze[key]} {range.unit}
                  </span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>{range.min}</span>
                  <span>{range.max}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI-Karten */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <KpiCard label="IST Gesamt" value={fmtEur(totals.istSum)} />
        <KpiCard label="SOLL Gesamt" value={fmtEur(totals.sollSum)}
          accent={totals.delta === 0 ? 'neutral' : totals.delta > 0 ? 'up' : 'down'} />
        <KpiCard label="Delta" value={fmtEur(totals.delta)} sub={fmtPct(totals.deltaPct)}
          accent={totals.delta === 0 ? 'neutral' : totals.delta > 0 ? 'up' : 'down'} />
        <KpiCard label="Profitieren" value={`${totals.winners} Vermittler`} accent="up" icon={<TrendingUp size={16} />} />
        <KpiCard label="Weniger" value={`${totals.losers} Vermittler`} accent="down" icon={<TrendingDown size={16} />} />
      </div>

      {/* Chart */}
      <div className="card-base p-5 mb-6">
        <h2 className="text-base font-semibold text-slate-700 mb-4">Einnahmen-Vergleich IST vs. SOLL</h2>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" angle={-35} textAnchor="end" tick={{ fontSize: 11 }} interval={0} />
            <YAxis tickFormatter={v => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v) => fmtEur(v)} labelStyle={{ fontWeight: 600 }} />
            <Legend verticalAlign="top" />
            <Bar dataKey="ist" name="IST" fill="#94a3b8" radius={[3, 3, 0, 0]} />
            <Bar dataKey="soll" name="SOLL" radius={[3, 3, 0, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.delta >= 0 ? '#10b981' : '#ef4444'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Vermittler-Tabelle */}
      <div className="card-base overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-700">Vermittler-Übersicht ({VERMITTLER.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider">
                <SortTh label="Vermittler" sortKey="name" current={sortKey} dir={sortDir} onSort={handleSort} />
                <th className="px-3 py-2.5 text-left">Klassifizierung</th>
                <th className="px-3 py-2.5 text-left">Prod.Stufen</th>
                <SortTh label="IST" sortKey="ist" current={sortKey} dir={sortDir} onSort={handleSort} align="right" />
                <SortTh label="SOLL" sortKey="soll" current={sortKey} dir={sortDir} onSort={handleSort} align="right" />
                <SortTh label="Delta €" sortKey="delta" current={sortKey} dir={sortDir} onSort={handleSort} align="right" />
                <SortTh label="Delta %" sortKey="delta_pct" current={sortKey} dir={sortDir} onSort={handleSort} align="right" />
                <th className="px-3 py-2.5 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sorted.map(v => (
                <VermittlerRow
                  key={v.id}
                  data={v}
                  expanded={expandedVermittler === v.id}
                  onToggle={() => setExpandedVermittler(prev => prev === v.id ? null : v.id)}
                  mode={mode}
                  onProvChange={(key, val) => handleIndividualChange(v.id, key, val)}
                />
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 font-semibold text-sm">
                <td className="px-3 py-3" colSpan={3}>Gesamt</td>
                <td className="px-3 py-3 text-right font-mono">{fmtEur(totals.istSum)}</td>
                <td className="px-3 py-3 text-right font-mono">{fmtEur(totals.sollSum)}</td>
                <td className={`px-3 py-3 text-right font-mono ${totals.delta > 0 ? 'text-emerald-600' : totals.delta < 0 ? 'text-red-600' : 'text-slate-500'}`}>
                  {fmtEur(totals.delta)}
                </td>
                <td className={`px-3 py-3 text-right font-mono ${totals.deltaPct > 0 ? 'text-emerald-600' : totals.deltaPct < 0 ? 'text-red-600' : 'text-slate-500'}`}>
                  {fmtPct(totals.deltaPct)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}

function KpiCard({ label, value, sub, accent, icon }) {
  const colors = {
    up: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    down: 'text-red-600 bg-red-50 border-red-200',
    neutral: 'text-slate-600 bg-slate-50 border-slate-200',
  }
  const c = accent ? colors[accent] : 'text-slate-700 bg-white border-slate-200'
  return (
    <div className={`rounded-xl border p-4 ${c}`}>
      <div className="text-xs font-medium opacity-70 mb-1 flex items-center gap-1">{icon}{label}</div>
      <div className="text-lg font-bold font-mono">{value}</div>
      {sub && <div className="text-xs font-mono mt-0.5">{sub}</div>}
    </div>
  )
}

function SortTh({ label, sortKey: key, current, dir, onSort, align = 'left' }) {
  const active = current === key
  return (
    <th
      className={`px-3 py-2.5 cursor-pointer hover:bg-slate-100 transition-colors select-none ${align === 'right' ? 'text-right' : 'text-left'}`}
      onClick={() => onSort(key)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {active && (dir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
      </span>
    </th>
  )
}

function VermittlerRow({ data, expanded, onToggle, mode, onProvChange }) {
  const { name, klassifizierung, ist, soll, delta, deltaPct, produktionsstufen, provIst, provSoll, istDetail, sollDetail } = data
  const deltaColor = delta > 0 ? 'text-emerald-600' : delta < 0 ? 'text-red-600' : 'text-slate-400'
  const bgColor = delta > 50 ? 'bg-emerald-50/50' : delta < -50 ? 'bg-red-50/50' : ''

  return (
    <>
      <tr className={`hover:bg-slate-50 transition-colors ${bgColor}`}>
        <td className="px-3 py-2.5 font-medium text-slate-800">{name}</td>
        <td className="px-3 py-2.5 text-slate-500 text-xs">{klassifizierung}</td>
        <td className="px-3 py-2.5">
          <div className="flex gap-1 flex-wrap">
            {Object.entries(produktionsstufen).map(([k, v]) => (
              v && v !== 'keine' ? (
                <span key={k} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                  {k.toUpperCase()}: {v}
                </span>
              ) : null
            ))}
            {Object.values(produktionsstufen).every(v => !v || v === 'keine') && (
              <span className="text-[10px] text-slate-400">keine</span>
            )}
          </div>
        </td>
        <td className="px-3 py-2.5 text-right font-mono text-slate-600">{fmtEur(ist)}</td>
        <td className="px-3 py-2.5 text-right font-mono text-slate-800 font-semibold">{fmtEur(soll)}</td>
        <td className={`px-3 py-2.5 text-right font-mono font-semibold ${deltaColor}`}>{fmtEur(delta)}</td>
        <td className={`px-3 py-2.5 text-right font-mono ${deltaColor}`}>
          <span className="inline-flex items-center gap-0.5">
            {delta > 0 ? <TrendingUp size={12} /> : delta < 0 ? <TrendingDown size={12} /> : <Minus size={12} />}
            {fmtPct(deltaPct)}
          </span>
        </td>
        <td className="px-3 py-2.5">
          <button onClick={onToggle} className="p-1 rounded hover:bg-slate-200 transition-colors">
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={8} className="px-3 py-4 bg-slate-50/80">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Detail-Aufschlüsselung */}
              <div>
                <h4 className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Provisions-Aufschlüsselung</h4>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-slate-400">
                      <th className="text-left pb-1">Sparte</th>
                      <th className="text-right pb-1">AP IST</th>
                      <th className="text-right pb-1">AP SOLL</th>
                      <th className="text-right pb-1">FP IST</th>
                      <th className="text-right pb-1">FP SOLL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {['shu', 'tier', 'kfz', 'lv', 'kv'].map(sparte => (
                      <tr key={sparte}>
                        <td className="py-1 text-slate-600 font-medium">{sparteLabel(sparte)}</td>
                        <td className="py-1 text-right font-mono">{fmt(istDetail.ap[sparte])}</td>
                        <td className={`py-1 text-right font-mono ${sollDetail.ap[sparte] > istDetail.ap[sparte] ? 'text-emerald-600' : sollDetail.ap[sparte] < istDetail.ap[sparte] ? 'text-red-600' : ''}`}>
                          {fmt(sollDetail.ap[sparte])}
                        </td>
                        <td className="py-1 text-right font-mono">{fmt(istDetail.fp[sparte])}</td>
                        <td className={`py-1 text-right font-mono ${sollDetail.fp[sparte] > istDetail.fp[sparte] ? 'text-emerald-600' : sollDetail.fp[sparte] < istDetail.fp[sparte] ? 'text-red-600' : ''}`}>
                          {fmt(sollDetail.fp[sparte])}
                        </td>
                      </tr>
                    ))}
                    <tr className="font-semibold">
                      <td className="py-1">Gesamt</td>
                      <td className="py-1 text-right font-mono">{fmt(istDetail.ap.gesamt)}</td>
                      <td className="py-1 text-right font-mono">{fmt(sollDetail.ap.gesamt)}</td>
                      <td className="py-1 text-right font-mono">{fmt(istDetail.fp.gesamt)}</td>
                      <td className="py-1 text-right font-mono">{fmt(sollDetail.fp.gesamt)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Individuelle Provisionssätze (nur im Individual-Modus) */}
              {mode === 'individual' && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Individuelle Provisionssätze</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(PROV_RANGES).map(([key, range]) => (
                      <div key={key} className="space-y-0.5">
                        <label className="text-[10px] text-slate-400">{range.label}</label>
                        <div className="flex items-center gap-1">
                          <input
                            type="range"
                            min={range.min} max={range.max} step={range.step}
                            value={provSoll[key]}
                            onChange={e => onProvChange(key, e.target.value)}
                            className="flex-1 h-1 accent-[var(--mode-primary)]"
                          />
                          <span className="text-[11px] font-mono font-medium text-slate-600 w-12 text-right">
                            {provSoll[key]}
                          </span>
                        </div>
                        <div className="flex justify-between text-[9px] text-slate-400 items-center">
                          <span>IST: {provIst[key]}</span>
                          {provSoll[key] !== provIst[key] && (
                            <span className={provSoll[key] > provIst[key] ? 'text-emerald-500' : 'text-red-500'}>
                              {provSoll[key] > provIst[key] ? '↑' : '↓'} {Math.abs(provSoll[key] - provIst[key]).toFixed(1)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sätze-Vergleich im Global-Modus */}
              {mode === 'global' && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Sätze-Vergleich (Original → Global)</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(PROV_RANGES).map(([key, range]) => {
                      const orig = provIst[key]
                      const neu = provSoll[key]
                      const diff = neu - orig
                      return (
                        <div key={key} className="flex items-center justify-between p-1.5 rounded bg-white border border-slate-100">
                          <span className="text-[10px] text-slate-500">{range.label}</span>
                          <span className="text-[11px] font-mono">
                            <span className="text-slate-400">{orig}</span>
                            <span className="mx-1">→</span>
                            <span className={`font-semibold ${diff > 0 ? 'text-emerald-600' : diff < 0 ? 'text-red-600' : 'text-slate-600'}`}>
                              {neu}
                            </span>
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

function sparteLabel(key) {
  const labels = { shu: 'S/HU', tier: 'Tier-KV', kfz: 'Kfz', lv: 'Leben', kv: 'Kranken' }
  return labels[key] || key
}
