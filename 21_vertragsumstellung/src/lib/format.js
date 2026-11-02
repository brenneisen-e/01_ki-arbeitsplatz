// ============================================================
// Deutsche Formatierung (de-DE) - zentrale Quelle fuer alle
// im UI sichtbaren Zahlen, Betraege und Datumsangaben.
// ============================================================

const nf = (opts) => new Intl.NumberFormat('de-DE', opts)

const fmtZahl0 = nf({ maximumFractionDigits: 0 })
const fmtZahl1 = nf({ minimumFractionDigits: 1, maximumFractionDigits: 1 })
const fmtZahl2 = nf({ minimumFractionDigits: 2, maximumFractionDigits: 2 })

export const MONATE = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
]

// Beträge tragen im ganzen Werkzeug die Buchstabenfolge „EUR“, nie das
// Eurozeichen: Uniform führt kein €, und „Mio. EUR“ steht ohnehin überall.
// Negative Beträge bekommen das typografische Minus (U+2212), nicht den
// Bindestrich, den Intl liefern würde.
const MINUS = '\u2212'
const NBSP = '\u00a0'

function betragMitEinheit(v, formatierer) {
  const vz = v < 0 ? MINUS : ''
  return `${vz}${formatierer.format(Math.abs(v))} EUR`
}

/** 1.234.568 EUR */
export function euro(v) {
  if (v == null || Number.isNaN(v)) return '–'
  return betragMitEinheit(v, fmtZahl0)
}

/** 1.234,56 EUR */
export function euro2(v) {
  if (v == null || Number.isNaN(v)) return '–'
  return betragMitEinheit(v, fmtZahl2)
}

/** Kompakt: 12,4 Mio. EUR / 843 Tsd. EUR / 2,7 Tsd. EUR / 512 EUR */
export function euroKompakt(v, { einheit = true } = {}) {
  if (v == null || Number.isNaN(v)) return '–'
  const abs = Math.abs(v)
  const vz = v < 0 ? MINUS : ''
  const e = einheit ? ' EUR' : ''
  // Die Schwellen liegen knapp unter der Stufe, damit die Rundung nicht
  // „1.000 Tsd.“ oder „1.000,0 Mio.“ erzeugt: 999.900 EUR heißt „1,0 Mio.“.
  if (abs >= 999_500_000) return `${vz}${fmtZahl2.format(abs / 1_000_000_000)} Mrd.${e}`
  if (abs >= 999_500) return `${vz}${fmtZahl1.format(abs / 1_000_000)} Mio.${e}`
  if (abs >= 9_950) return `${vz}${fmtZahl0.format(abs / 1000)} Tsd.${e}`
  // Unter 10 Tsd. eine Nachkommastelle, damit „2,7 Tsd.“ neben „843 Tsd.“
  // dieselbe Einheit trägt und nicht als „2.654 EUR“ aus der Reihe fällt.
  if (abs >= 1_000) return `${vz}${fmtZahl1.format(abs / 1000)} Tsd.${e}`
  return `${vz}${fmtZahl0.format(abs)}${e}`
}

/** Achsenbeschriftung in Charts: 12,4 Mio. */
export function achseEuro(v) {
  return euroKompakt(v, { einheit: false })
}

/** Achsenbeschriftung mit geschütztem Leerzeichen: „12,4 Mio.“ bricht nie um. */
export function achseEuroFest(v) {
  return achseEuro(v).replace(/ /g, NBSP)
}

/** +1.234.568 EUR / −12.000 EUR */
export function euroDelta(v) {
  if (v == null || Number.isNaN(v)) return '–'
  return (v > 0 ? '+' : v < 0 ? MINUS : '±') + `${fmtZahl0.format(Math.abs(v))} EUR`
}

/** +1,2 Mio. EUR / −2,7 Tsd. EUR */
export function euroKompaktDelta(v) {
  if (v == null || Number.isNaN(v)) return '–'
  return (v > 0 ? '+' : v < 0 ? MINUS : '±') + euroKompakt(Math.abs(v))
}

/** 12,4 % */
export function prozent(v, stellen = 1) {
  if (v == null || Number.isNaN(v)) return '–'
  return nf({ minimumFractionDigits: stellen, maximumFractionDigits: stellen }).format(v) + ' %'
}

/** +12,4 % / -3,1 % */
export function prozentDelta(v, stellen = 1) {
  if (v == null || Number.isNaN(v)) return '–'
  const s = nf({ minimumFractionDigits: stellen, maximumFractionDigits: stellen }).format(Math.abs(v))
  return (v > 0 ? '+' : v < 0 ? MINUS : '±') + s + ' %'
}

/** 35,0 ‰ */
export function promille(v, stellen = 1) {
  if (v == null || Number.isNaN(v)) return '–'
  return nf({ minimumFractionDigits: stellen, maximumFractionDigits: stellen }).format(v) + ' ‰'
}

/** 1.234 / 1.234,5 */
export function zahl(v, stellen = 0) {
  if (v == null || Number.isNaN(v)) return '–'
  return nf({ minimumFractionDigits: stellen, maximumFractionDigits: stellen }).format(v)
}

/** 08.09.2026 */
export function datum(value) {
  if (!value) return '–'
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return '–'
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

/** 8. September 2026 */
export function datumLang(value) {
  if (!value) return '–'
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return '–'
  return d.toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })
}

/** '2026-09' -> 'September 2026' (ohne native Browser-Locale) */
export function monatJahr(iso) {
  if (!iso) return '–'
  const [j, m] = String(iso).split('-')
  const idx = parseInt(m, 10) - 1
  if (Number.isNaN(idx) || !MONATE[idx]) return '–'
  return `${MONATE[idx]} ${j}`
}

/** Wertungsjahr-Label: 2026 -> 'WJ 2026' */
export function wertungsjahr(j) {
  return `WJ ${j}`
}

/**
 * Vorzeichen-Klasse fuer Delta-Darstellung.
 *   invertiert   weniger ist positiv (Kosten)
 *   zahlersicht  Sicht des Zahlenden: mehr Vergütung ist eine Warnung,
 *                weniger ist positiv — dieselbe Logik wie das Regler-
 *                Abzeichen (teurer = Warnung, günstiger = positiv). Die
 *                Institutsakte färbt ohne diese Option aus Sicht des Hauses.
 */
export function deltaTon(v, { invertiert = false, zahlersicht = false } = {}) {
  if (v == null || Number.isNaN(v) || Math.abs(v) < 1e-9) return 'neutral'
  if (zahlersicht) return v > 0 ? 'warnung' : 'positiv'
  const positiv = invertiert ? v < 0 : v > 0
  return positiv ? 'positiv' : 'negativ'
}
