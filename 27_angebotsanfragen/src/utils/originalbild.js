/**
 * Die Beispielanfragen im Original: Seitenbilder der PDF aus dem Fachbereich
 * mit der Lage jeder Fundstelle.
 *
 * Die Bilder liegen in src/assets/originale/, die Rechtecke der Fundstellen in
 * src/daten/originale.js (beides erzeugt, siehe scripts/originale/). Für die
 * Marke des Hauses, aus dem die Anfragen stammen, erscheinen die Seiten wie
 * geliefert; in jeder anderen Marke die Fassung ohne Hausbegriffe und Logo,
 * soweit es für die Seite eine gibt.
 *
 * Nur in der Oberfläche verwenden: `import.meta.glob` kennt nur der Bundler.
 */

import { ORIGINALE, SEITENFORMAT } from '../daten/originale.js'
import { getMarke } from './branding.js'

const DATEIEN = import.meta.glob('../assets/originale/*.webp', { eager: true, query: '?url', import: 'default' })
const HAUS_DER_BEISPIELE = 'nuernberger'

const adresse = (name) => DATEIEN[`../assets/originale/${name}.webp`] || null

/** Hat der Vorgang Originalseiten (für sein erstes Dokument)? */
export const hatOriginal = (vorgang, dokNr = 0) => dokNr === 0 && Boolean(ORIGINALE[vorgang?.id])

/**
 * Die Originalseiten eines Vorgangs: [{ nr, url, breite, hoehe, marken: [{ f: Felder, r: Rechtecke in Prozent }] }].
 * Breite und Höhe in Pixeln geben das Seitenverhältnis vor; nicht jede Seite ist A4 (Bildschirmfotos).
 * Ohne Originalseiten (synthetische und live gelesene Eingänge, Anhänge): null.
 */
export function originalseiten(vorgang, dokNr = 0) {
  if (!hatOriginal(vorgang, dokNr)) return null
  const o = ORIGINALE[vorgang.id]
  const neutral = getMarke().id !== HAUS_DER_BEISPIELE
  const seiten = o.seiten.map((marken, i) => {
    const nr = i + 1
    const name = `${o.kennung}-${nr}`
    return {
      nr, marken,
      url: (neutral && o.neutral.includes(nr) && adresse(`${name}.neutral`)) || adresse(name),
      breite: SEITENFORMAT.breite, hoehe: o.hoehen?.[i] || SEITENFORMAT.hoehe
    }
  })
  // Fehlt ein Bild, gilt der Nachbau: lieber die ganze Abschrift als eine Lücke.
  return seiten.every(s => s.url) ? seiten : null
}
