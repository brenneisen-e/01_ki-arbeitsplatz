// ============================================================
// WHITE-LABEL-MARKENSYSTEM
//
// Nichts in der Anwendung nennt eine Marke beim Namen. Alle
// sichtbaren Bezeichnungen, Farben und die Wortmarke kommen aus
// diesem Modul. Es gibt keinen externen Logo-Abruf - die Marke
// wird aus Initialen und einer Farbskala erzeugt und ist damit
// offline-fähig und datenschutzunbedenklich.
// ============================================================

// --------------------------------------------------- Farbwerkzeug

function hexZuRgb(hex) {
  const h = hex.replace('#', '').trim()
  const v = h.length === 3 ? h.split('').map(c => c + c).join('') : h
  const n = parseInt(v, 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

function rgbZuHex({ r, g, b }) {
  const c = (x) => Math.round(Math.min(255, Math.max(0, x))).toString(16).padStart(2, '0')
  return `#${c(r)}${c(g)}${c(b)}`
}

function rgbZuHsl({ r, g, b }) {
  const rr = r / 255, gg = g / 255, bb = b / 255
  const max = Math.max(rr, gg, bb), min = Math.min(rr, gg, bb)
  const l = (max + min) / 2
  let h = 0, s = 0
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    if (max === rr) h = ((gg - bb) / d + (gg < bb ? 6 : 0))
    else if (max === gg) h = (bb - rr) / d + 2
    else h = (rr - gg) / d + 4
    h /= 6
  }
  return { h: h * 360, s, l }
}

function hslZuRgb({ h, s, l }) {
  const hh = ((h % 360) + 360) % 360 / 360
  if (s === 0) { const v = l * 255; return { r: v, g: v, b: v } }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  const kanal = (t) => {
    let x = t
    if (x < 0) x += 1
    if (x > 1) x -= 1
    if (x < 1 / 6) return p + (q - p) * 6 * x
    if (x < 1 / 2) return q
    if (x < 2 / 3) return p + (q - p) * (2 / 3 - x) * 6
    return p
  }
  return { r: kanal(hh + 1 / 3) * 255, g: kanal(hh) * 255, b: kanal(hh - 1 / 3) * 255 }
}

/** Relative Leuchtdichte nach WCAG */
function leuchtdichte(hex) {
  const { r, g, b } = hexZuRgb(hex)
  const f = (v) => {
    const x = v / 255
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}

/** Kontrastverhältnis zweier Farben (1 bis 21) */
export function kontrast(a, b) {
  const la = leuchtdichte(a), lb = leuchtdichte(b)
  const hell = Math.max(la, lb), dunkel = Math.min(la, lb)
  return (hell + 0.05) / (dunkel + 0.05)
}

/**
 * Erzeugt aus einer Primärfarbe eine zehnstufige Skala.
 * Die Stufe 600 ist die Ausgangsfarbe - sie trägt Schaltflächen
 * und muss deshalb gegen Weiß mindestens 4,5:1 erreichen.
 */
export function farbskala(primary) {
  const hsl = rgbZuHsl(hexZuRgb(primary))
  const stufen = {
    50: { l: 0.965, s: 0.55 },
    100: { l: 0.925, s: 0.62 },
    200: { l: 0.845, s: 0.70 },
    300: { l: 0.735, s: 0.78 },
    400: { l: 0.60, s: 0.88 },
    500: { l: Math.min(0.52, Math.max(0.40, hsl.l * 1.25)), s: 1 },
    600: { l: hsl.l, s: 1 },
    700: { l: hsl.l * 0.80, s: 1.02 },
    800: { l: hsl.l * 0.61, s: 1.03 },
    900: { l: hsl.l * 0.45, s: 1.04 },
  }
  const skala = {}
  for (const [k, v] of Object.entries(stufen)) {
    skala[k] = rgbZuHex(hslZuRgb({
      h: hsl.h,
      s: Math.min(1, hsl.s * v.s),
      l: Math.min(0.985, Math.max(0.06, v.l)),
    }))
  }
  return skala
}

/** Weiche Variante einer Akzentfarbe für Flächen */
export function weich(hex, anteil = 0.92) {
  const hsl = rgbZuHsl(hexZuRgb(hex))
  return rgbZuHex(hslZuRgb({ h: hsl.h, s: Math.min(1, hsl.s * 0.55), l: anteil }))
}

// --------------------------------------------------- Marken-Presets

/**
 * Ein Preset beschreibt eine Marke vollständig.
 * Die Presets sind bewusst generisch benannt - die Anwendung ist
 * ein White-Label-Werkzeug und trägt keine fremde Unternehmensmarke.
 */
export const PRESETS = {
  verbund: {
    id: 'verbund',
    presetName: 'Verbund',
    produktName: 'Vergütungswerk',
    produktKurz: 'VW',
    mandantName: 'Sparkassen-Versicherung Sachsen',
    mandantKurz: 'SV Sachsen',
    initialen: 'SV',
    claim: 'Vergütungsmodell 2028 — simulieren, umstellen, verhandeln',
    primary: '#7d1d3a',   /* Burgund — Schaltflächen, aktive Navigation, Fokus; 9,96:1 auf Weiß */
    akzent: '#1f6b58',    /* Tiefgrün — Zielmodell in Diagrammen, Fläche des Steuerblocks   */
    wortmarke: 'raute',
    radius: 'normal',
  },
  neutral: {
    id: 'neutral',
    presetName: 'Neutral',
    produktName: 'Vergütungswerk',
    produktKurz: 'VW',
    mandantName: 'Mandant',
    mandantKurz: 'Mandant',
    initialen: 'VW',
    claim: 'Simulation und Umstellung von Vergütungsmodellen',
    primary: '#1f3a5f',
    akzent: '#0e7490',
    wortmarke: 'raute',
    radius: 'normal',
  },
  atlas: {
    id: 'atlas',
    presetName: 'Atlas',
    produktName: 'Atlas Vergütung',
    produktKurz: 'Atlas',
    mandantName: 'Versicherungsgruppe',
    mandantKurz: 'Gruppe',
    initialen: 'AT',
    claim: 'Steuerungswirkung sichtbar machen',
    primary: '#12574a',
    akzent: '#b07d18',
    wortmarke: 'ring',
    radius: 'weich',
  },
  nacht: {
    id: 'nacht',
    presetName: 'Nacht',
    produktName: 'Vergütungswerk',
    produktKurz: 'VW',
    mandantName: 'Mandant',
    mandantKurz: 'Mandant',
    initialen: 'VW',
    claim: 'Simulation und Umstellung von Vergütungsmodellen',
    primary: '#3b5bdb',
    akzent: '#38bdf8',
    wortmarke: 'raute',
    radius: 'weich',
    theme: 'dark',
  },
  kontrast: {
    id: 'kontrast',
    presetName: 'Hoher Kontrast',
    produktName: 'Vergütungswerk',
    produktKurz: 'VW',
    mandantName: 'Mandant',
    mandantKurz: 'Mandant',
    initialen: 'VW',
    claim: 'Simulation und Umstellung von Vergütungsmodellen',
    primary: '#123a75',
    akzent: '#8a1739',
    wortmarke: 'balken',
    radius: 'scharf',
  },
}

/** Austauschbare Sprachbausteine der Domäne */
export const STANDARD_SPRACHE = {
  partner: 'Institut',
  partnerPlural: 'Institute',
  kanalSparkasse: 'Sparkassen',
  kanalAo: 'Ausschließlichkeitsorganisation',
  kanalDirekt: 'Direktkanal und Zentrale',
  berater: 'S-Finanzberater',
  gremium: 'Sparkassen-Beirat',
  wertungsjahr: 'Wertungsjahr',
  modellIst: 'Vergütungsmodell heute',
  modellZiel: 'Zielmodell 2028',
  projekt: 'Neues Vergütungsmodell',
}

export const RADIUS_SKALEN = {
  scharf: { xs: 2, sm: 3, md: 4, lg: 5, xl: 7 },
  normal: { xs: 4, sm: 6, md: 9, lg: 13, xl: 18 },
  weich: { xs: 6, sm: 9, md: 14, lg: 20, xl: 28 },
}

export const STANDARD_MARKE = {
  ...PRESETS.verbund,
  sprache: { ...STANDARD_SPRACHE },
  theme: 'auto',
  dichte: 'normal',
  demoWasserzeichen: true,
}

/** Baut aus einer Markenkonfiguration die CSS-Variablen */
export function markenVariablen(marke) {
  const skala = farbskala(marke.primary)
  const radien = RADIUS_SKALEN[marke.radius] || RADIUS_SKALEN.normal
  const vars = {
    '--brand-akzent': marke.akzent,
    '--brand-akzent-weich': weich(marke.akzent),
    '--vg-r-xs': `${radien.xs}px`,
    '--vg-r-sm': `${radien.sm}px`,
    '--vg-r-md': `${radien.md}px`,
    '--vg-r-lg': `${radien.lg}px`,
    '--vg-r-xl': `${radien.xl}px`,
  }
  for (const [stufe, wert] of Object.entries(skala)) vars[`--brand-${stufe}`] = wert
  return vars
}

/** Prüft die Lesbarkeit der wichtigsten Kombinationen (WCAG AA = 4,5) */
export function pruefeKontraste(marke) {
  const skala = farbskala(marke.primary)
  return [
    { paar: 'Schaltfläche: Weiß auf Primär 600', wert: kontrast('#ffffff', skala[600]) },
    { paar: 'Text: Primär 600 auf Weiß', wert: kontrast(skala[600], '#ffffff') },
    { paar: 'Text: Primär 300 auf Dunkelgrund', wert: kontrast(skala[300], '#141a23') },
    { paar: 'Akzent auf Weiß', wert: kontrast(marke.akzent, '#ffffff') },
  ].map(x => ({ ...x, bestanden: x.wert >= 4.5, wert: Math.round(x.wert * 100) / 100 }))
}

// v2: Mit dem Wechsel auf Burgund und Tiefgrün ändert sich das Standard-
// Preset. Ein unter v1 gespeicherter Stand hätte die alten Blautöne über die
// neuen gelegt — deshalb ein neuer Schlüssel; der alte bleibt unbeachtet liegen.
const SPEICHER_SCHLUESSEL = 'vg.marke.v2'

export function ladeMarke() {
  try {
    const roh = localStorage.getItem(SPEICHER_SCHLUESSEL)
    if (!roh) return { ...STANDARD_MARKE }
    const gespeichert = JSON.parse(roh)
    return {
      ...STANDARD_MARKE,
      ...gespeichert,
      sprache: { ...STANDARD_SPRACHE, ...(gespeichert.sprache || {}) },
    }
  } catch {
    return { ...STANDARD_MARKE }
  }
}

export function speichereMarke(marke) {
  try { localStorage.setItem(SPEICHER_SCHLUESSEL, JSON.stringify(marke)) } catch { /* Speicher nicht verfügbar */ }
}

export function setzeMarkePreset(marke, presetId) {
  const p = PRESETS[presetId]
  if (!p) return marke
  return { ...marke, ...p, sprache: marke.sprache, theme: p.theme || marke.theme }
}
