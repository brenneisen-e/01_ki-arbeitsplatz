/**
 * Markenauftritt der Anwendung.
 *
 * Der Showcase wird bei verschiedenen Häusern gezeigt. Die Marke steckt
 * deshalb nur an einer Stelle: Logo, Name und die Modusfarben werden zur
 * Laufzeit gesetzt, die Fachlogik kennt keinen Versicherernamen.
 */

const SPEICHER = 'bue_marke'

// Im Whitelabel trägt jede App der Plattform ihre eigene Kopffarbe bei
// gleichen Maßen: Bestandsübertragung Bordeaux, Provisionsreklamation Navy,
// VST-Cockpit Oliv, der Vertriebsarbeitsplatz sein Kopfbild. Bordeaux ist
// derselbe Ton wie der Versicherungsmodus des Vertriebsarbeitsplatzes.
export const MARKEN = {
  neutral: {
    id: 'neutral',
    name: 'Whitelabel',
    kuerzel: 'BÜ',
    logo: null,
    untertitel: 'Sales Operations | Portfolio Transfer Management',
    primary: '#6b1d2a',
    primaryLight: '#8d2839',
    gradient: 'linear-gradient(135deg, #2a0c11 0%, #5a1a26 45%, #7f2434 100%)',
    accent: '#b8963e',
    pastel: '#f6eeef'
  },
  ergo: {
    id: 'ergo',
    name: 'ERGO',
    kuerzel: 'ER',
    logo: 'ERGO',
    untertitel: 'Sales Operations | Portfolio Transfer Management',
    primary: '#8b1a2b',
    primaryLight: '#c41230',
    gradient: 'linear-gradient(135deg, #5a1018 0%, #8b1a2b 40%, #c41230 100%)',
    accent: '#e8c547',
    pastel: '#fef2f2'
  }
}

export const MARKENLISTE = Object.values(MARKEN)

export function getMarke() {
  return MARKEN[localStorage.getItem(SPEICHER)] || MARKEN.neutral
}

/**
 * Markenwechsel: speichern und neu laden. Beim Start schreibt
 * `gleicheGespeicherteDatenAn` die Vorgänge auf die neue Marke um, und alle
 * Texte (Demodaten, Demo-Dateien, Vorlagen) entstehen frisch in ihr.
 */
export function setMarke(id) {
  if (getMarke().id === id) return
  localStorage.setItem(SPEICHER, id)
  window.location.reload()
}

export function wendeAn(marke = getMarke()) {
  const s = document.documentElement.style
  s.setProperty('--mode-primary', marke.primary)
  s.setProperty('--mode-primary-light', marke.primaryLight)
  s.setProperty('--mode-gradient', marke.gradient)
  s.setProperty('--mode-accent', marke.accent)
  s.setProperty('--mode-pastel', marke.pastel)
}

// ── Whitelabel-Namen ──────────────────────────────────────────
// Die Demodaten sind für ERGO geschrieben. Im Whitelabel steht dort die
// Zukunftsversicherung, ohne echten Versicherer. Die Paare sind in beide
// Richtungen eindeutig, damit gespeicherte Vorgänge beim Markenwechsel
// umgeschrieben werden können. Längere Formen stehen vor kürzeren.
const WHITELABEL_NAMEN = [
  ['ERGO Versicherung AG', 'Zukunftsversicherung AG'],
  ['@ergo.de', '@zukunftsversicherung.de'],
  ['ERG-', 'ZV-'],
  ['ERGO', 'Zukunftsversicherung'],
]

const escape = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
// Wortgrenzen (auch bei Umlauten): beginnt oder endet die Form mit einem
// Buchstaben oder einer Ziffer, darf davor bzw. danach keiner stehen.
const wortZeichen = /[\p{L}\p{N}]/u
const muster = (t) => new RegExp(
  `${wortZeichen.test(t[0]) ? '(?<![\\p{L}\\p{N}])' : ''}${escape(t)}${wortZeichen.test(t.at(-1)) ? '(?![\\p{L}\\p{N}])' : ''}`,
  'gu'
)
const ZUM_WHITELABEL = WHITELABEL_NAMEN.map(([echt, fiktiv]) => [muster(echt), fiktiv])
const ZUR_MARKE = WHITELABEL_NAMEN.map(([echt, fiktiv]) => [muster(fiktiv), echt])

function ersetze(text, regeln) {
  let out = text
  for (const [re, neu] of regeln) out = out.replace(re, neu)
  return out
}

// Nur in den Texten selbst ersetzen, nie im rohen JSON: dort stünde vor einem
// Wort nach einem Zeilenumbruch das „n“ aus „\n“, und die Wortgrenze griffe nicht.
function ersetzeTief(wert, regeln) {
  if (typeof wert === 'string') return ersetze(wert, regeln)
  if (Array.isArray(wert)) return wert.map(w => ersetzeTief(w, regeln))
  if (wert && Object.getPrototypeOf(wert) === Object.prototype) {
    return Object.fromEntries(Object.entries(wert).map(([k, w]) => [k, ersetzeTief(w, regeln)]))
  }
  return wert
}

/** Text in der aktiven Marke: im Whitelabel ohne ERGO. */
export function markenText(text, marke = getMarke()) {
  if (!text || typeof text !== 'string' || marke.id !== 'neutral') return text
  return ersetze(text, ZUM_WHITELABEL)
}

/** Feste Demo-Inhalte (Objekte, Listen) in der aktiven Marke; alle Texte darin laufen durch markenText. */
export function markenObjekt(wert, marke = getMarke()) {
  return marke.id === 'neutral' ? ersetzeTief(wert, ZUM_WHITELABEL) : wert
}

/** Gespeicherte Vorgänge, Mails und Protokolle auf die aktive Marke bringen (beim Start). */
export function gleicheGespeicherteDatenAn(marke = getMarke()) {
  const regeln = marke.id === 'neutral' ? ZUM_WHITELABEL : ZUR_MARKE
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const schluessel = localStorage.key(i)
      if (!schluessel?.startsWith('bestandsuebertragung_')) continue
      const alt = localStorage.getItem(schluessel)
      const neu = JSON.stringify(ersetzeTief(JSON.parse(alt), regeln))
      if (neu !== alt) localStorage.setItem(schluessel, neu)
    }
  } catch { /* Speicher gesperrt oder kein JSON: dann bleibt es beim Stand */ }
}
