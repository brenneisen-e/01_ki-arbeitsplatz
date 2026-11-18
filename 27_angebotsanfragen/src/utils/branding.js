/**
 * Markenauftritt und Begriffe der Anwendung.
 *
 * Der Showcase wird bei verschiedenen Häusern gezeigt. Marke und Hausbegriffe
 * stecken nur hier: Logo, Name, Modusfarben und die Namen der Systeme
 * (Angebotssystem, Bestandssysteme, Postfach) werden zur Laufzeit gesetzt.
 * Fachlogik, Layouts und Demodaten kennen keinen Versicherernamen; wo ein
 * Text das Haus oder ein System nennt, steht ein Platzhalter in geschweiften
 * Klammern ({angebotssystem}, {haus} …), den `markenText` auflöst.
 */

const SPEICHER = 'ang_marke'

// Im Whitelabel trägt jede App der Plattform ihre eigene Kopffarbe bei
// gleichen Maßen: Bestandsübertragung Bordeaux, Provisionsreklamation Navy,
// VST-Cockpit Oliv, Angebotsanfragen Petrol.
export const MARKEN = {
  neutral: {
    id: 'neutral',
    name: 'Whitelabel',
    kuerzel: 'AN',
    logo: null,
    primary: '#0f4c5c',
    primaryLight: '#177284',
    gradient: 'linear-gradient(135deg, #062730 0%, #0d4250 45%, #17697b 100%)',
    accent: '#b8963e',
    pastel: '#ecf5f6',
    begriffe: {
      haus: 'Zukunftsversicherung',
      hausLang: 'Zukunftsversicherung AG',
      angebotssystem: 'Angebotssystem',
      imSystem: 'im Angebotssystem',
      anSystem: 'an das Angebotssystem',
      desSystems: 'des Angebotssystems',
      logoGross: 'ZUKUNFT',
      logoKlein: 'VERSICHERUNG',
      linie: 'Gewerbelinie',
      linieKurz: 'GL',
      einheit: 'Angebotsservice',
      einheitKurz: 'Angebotsservice',
      hotlineName: 'Servicecenter',
      postfach: 'Angebote Gewerbe',
      bestandAlt: 'Bestandssystem (Altverträge)',
      bestandNeu: 'Bestandssystem',
      schaden: 'Schadensystem',
      imBestand: 'im Bestandssystem',
      imSchaden: 'im Schadensystem',
      layoutQuelle: 'Layout-Vorgabe des Fachbereichs'
    }
  },
  nuernberger: {
    id: 'nuernberger',
    name: 'NÜRNBERGER',
    kuerzel: 'NB',
    logo: 'Nürnberger',
    primary: '#0a2d55',
    primaryLight: '#1a5c9e',
    gradient: 'linear-gradient(135deg, #061a31 0%, #0a2d55 45%, #174f89 100%)',
    accent: '#9fc9ee',
    pastel: '#eef4fa',
    begriffe: {
      haus: 'NÜRNBERGER',
      hausLang: 'NÜRNBERGER Versicherung',
      angebotssystem: 'MyComposit',
      imSystem: 'in MyComposit',
      anSystem: 'an MyComposit',
      desSystems: 'von MyComposit',
      logoGross: 'NÜRNBERGER',
      logoKlein: 'VERSICHERUNG',
      linie: 'BusinessLine',
      linieKurz: 'BL',
      einheit: 'Dienstleistungscenter',
      einheitKurz: 'DLC',
      hotlineName: 'Dienstleistungscenter',
      postfach: 'MB SHUK-Angebote',
      bestandAlt: 'Host',
      bestandNeu: 'SAPRO',
      schaden: 'BOSS',
      imBestand: 'in Host bzw. SAPRO',
      imSchaden: 'in BOSS',
      layoutQuelle: 'Prompts BusinessLine des DLC'
    }
  }
}

export const MARKENLISTE = Object.values(MARKEN)

/** Adressparameter ?marke=… setzt die Marke für diesen und alle folgenden Aufrufe. */
function ausAdresse() {
  try {
    const wunsch = new URLSearchParams(window.location.search).get('marke')
    if (wunsch && MARKEN[wunsch]) {
      localStorage.setItem(SPEICHER, wunsch)
      return MARKEN[wunsch]
    }
  } catch { /* ohne Adresszugriff bleibt es bei der gespeicherten Marke */ }
  return null
}

let aktiv = null

export function getMarke() {
  if (aktiv) return aktiv
  let gespeichert = null
  try { gespeichert = localStorage.getItem(SPEICHER) } catch { /* Speicher gesperrt */ }
  aktiv = ausAdresse() || MARKEN[gespeichert] || MARKEN.neutral
  return aktiv
}

/** Markenwechsel: speichern und neu laden, damit alle Texte frisch in der neuen Marke entstehen. */
export function setMarke(id) {
  if (getMarke().id === id) return
  try { localStorage.setItem(SPEICHER, id) } catch { /* Speicher gesperrt */ }
  const adresse = new URL(window.location.href)
  adresse.searchParams.delete('marke')
  window.location.replace(adresse.toString())
}

export function wendeAn(marke = getMarke()) {
  const s = document.documentElement.style
  s.setProperty('--mode-primary', marke.primary)
  s.setProperty('--mode-primary-light', marke.primaryLight)
  s.setProperty('--mode-gradient', marke.gradient)
  s.setProperty('--mode-accent', marke.accent)
  s.setProperty('--mode-pastel', marke.pastel)
}

/** Die Hausbegriffe der aktiven Marke (Angebotssystem, Postfach, Bestandssysteme …). */
export function begriffe(marke = getMarke()) {
  return marke.begriffe
}

/** Löst die Platzhalter {haus}, {angebotssystem} … in einem Text auf. */
export function markenText(text, marke = getMarke()) {
  if (!text || typeof text !== 'string' || !text.includes('{')) return text
  return text.replace(/\{(\w+)\}/g, (ganz, name) => marke.begriffe[name] ?? ganz)
}

/** Wie markenText, aber durch Objekte und Listen hindurch (für feste Demo-Inhalte). */
export function markenObjekt(wert, marke = getMarke()) {
  if (typeof wert === 'string') return markenText(wert, marke)
  if (Array.isArray(wert)) return wert.map(w => markenObjekt(w, marke))
  if (wert && Object.getPrototypeOf(wert) === Object.prototype) {
    return Object.fromEntries(Object.entries(wert).map(([k, w]) => [k, markenObjekt(w, marke)]))
  }
  return wert
}
