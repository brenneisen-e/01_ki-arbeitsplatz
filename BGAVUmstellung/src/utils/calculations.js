import { commissionRates, karriereStufen, sparteLevels } from '../data/constants'

export function getTotalProduction(sim) {
  return sim.produktionLeben + sim.produktionKranken + sim.produktionSchaden +
    sim.bestandLeben + sim.bestandKranken + sim.bestandSchaden
}

export function getKarriereStufe(sim) {
  const total = getTotalProduction(sim)
  return karriereStufen.find(s => total >= s.min && total < s.max) || karriereStufen[karriereStufen.length - 1]
}

export function calculateProvisions(sim) {
  const factor = getKarriereStufe(sim).factor
  const results = { alt: {}, neu: {} }

  for (const model of ['alt', 'neu']) {
    const rates = model === 'alt' ? commissionRates.altModell : commissionRates.neu
    let totalAP = 0, totalBP = 0

    const segments = {
      leben: { ng: sim.produktionLeben, best: sim.bestandLeben },
      kranken: { ng: sim.produktionKranken, best: sim.bestandKranken },
      schaden: { ng: sim.produktionSchaden, best: sim.bestandSchaden },
    }

    for (const [seg, segData] of Object.entries(segments)) {
      const r = rates[seg]
      const ap = (segData.ng * r.ap / 100) * factor
      const bp = (segData.best * r.bp / 100)
      totalAP += ap
      totalBP += bp
      results[model][seg] = { ap, bp, total: ap + bp }
    }

    results[model].totalAP = totalAP
    results[model].totalBP = totalBP
    results[model].total = totalAP + totalBP
  }

  results.delta = {
    totalAP: results.neu.totalAP - results.alt.totalAP,
    totalBP: results.neu.totalBP - results.alt.totalBP,
    total: results.neu.total - results.alt.total,
    percent: results.alt.total > 0 ? ((results.neu.total - results.alt.total) / results.alt.total * 100) : 0,
  }

  return results
}

export function getHighestReachedLevel(sparteKey, value) {
  const levels = sparteLevels[sparteKey]
  return [...levels].reverse().find(l => value >= l.min) || null
}

export function get5YearProjection(results) {
  const years = ['2026', '2027', '2028', '2029', '2030']
  return years.map((year, i) => ({
    year,
    alt: Math.round(results.alt.total * (1 + i * 0.01)),
    neu: Math.round(results.neu.total * (1 + i * 0.035)),
  }))
}
