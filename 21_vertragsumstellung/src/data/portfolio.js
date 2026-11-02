// ============================================================
// Demodaten: Kanal- und Gesamtaggregate der SV Sachsen.
//
// gesamtportfolio = kanalSparkassen + kanalAo + direktkanal,
// Feld für Feld. kanalSparkassen ist die Summe der 12 Institute
// aus sparkassen.js, kanalAo die Summe der acht Referenzagenturen
// plus Sammelposition aus agenturen.js. Die Funktion
// pruefeKonsistenz() rechnet das zur Laufzeit nach.
// ============================================================

import { institute } from './sparkassen'
import { agenturen, aoSammelposition, direktkanal } from './agenturen'

export const kanalSparkassen = {
  kanal: 'sparkassen',
  institute: 12,
  neugeschaeft: { lebenBeitragssumme: 402940000, lebenStueck: 19571, kompositJahresbeitrag: 14068000, kompositStueck: 66053 },
  bestand: { lebenJahresbeitrag: 160658812, kompositJahresbeitrag: 170534682, vertraegeGesamt: 986896, versicherungskunden: 494319 },
  istVerguetung: { apLeben: 13192799, apKomposit: 9698098, bestandsprovision: 8351776, bonusstaffel: 1564286, zuschuesseSonstiges: 1246424, summe: 34053383 },
}

export const kanalAo = {
  kanal: 'ao',
  agenturenGesamt: 146,
  neugeschaeft: { lebenBeitragssumme: 274600000, lebenStueck: 13414, kompositJahresbeitrag: 13025000, kompositStueck: 59668 },
  bestand: { lebenJahresbeitrag: 143150000, kompositJahresbeitrag: 166050000, vertraegeGesamt: 723890, versicherungskunden: 336712 },
  istVerguetung: { apLeben: 9762418, apKomposit: 9800398, bestandsprovision: 8186312, bonusstaffel: 1070517, zuschuesseSonstiges: 839800, summe: 29659445 },
}

export const gesamtportfolio = {
  neugeschaeft: { lebenBeitragssumme: 691740000, lebenStueck: 34165, kompositJahresbeitrag: 28733000, kompositStueck: 135371 },
  bestand: { lebenJahresbeitrag: 312708812, kompositJahresbeitrag: 357984682, vertraegeGesamt: 1806786, versicherungskunden: 893031 },
  istVerguetung: { apLeben: 23352817, apKomposit: 20252896, bestandsprovision: 17394088, bonusstaffel: 2634803, zuschuesseSonstiges: 2086224, summe: 65720828 },
}

const PFADE = [
  ['neugeschaeft', 'lebenBeitragssumme'], ['neugeschaeft', 'lebenStueck'],
  ['neugeschaeft', 'kompositJahresbeitrag'], ['neugeschaeft', 'kompositStueck'],
  ['bestand', 'lebenJahresbeitrag'], ['bestand', 'kompositJahresbeitrag'],
  ['bestand', 'vertraegeGesamt'], ['bestand', 'versicherungskunden'],
  ['istVerguetung', 'apLeben'], ['istVerguetung', 'apKomposit'],
  ['istVerguetung', 'bestandsprovision'], ['istVerguetung', 'bonusstaffel'],
  ['istVerguetung', 'zuschuesseSonstiges'], ['istVerguetung', 'summe'],
]

/** Prüft, dass alle Aggregate exakt der Summe ihrer Bestandteile entsprechen. */
export function pruefeKonsistenz() {
  const abweichungen = []
  const hole = (o, p) => p.reduce((a, k) => (a == null ? a : a[k]), o) ?? 0
  for (const pfad of PFADE) {
    const summeInstitute = institute.reduce((a, i) => a + hole(i, pfad), 0)
    if (summeInstitute !== hole(kanalSparkassen, pfad)) {
      abweichungen.push({ ebene: 'kanalSparkassen', feld: pfad.join('.'), soll: summeInstitute, ist: hole(kanalSparkassen, pfad) })
    }
    const summeAo = agenturen.reduce((a, x) => a + hole(x, pfad), 0) + hole(aoSammelposition, pfad)
    if (summeAo !== hole(kanalAo, pfad)) {
      abweichungen.push({ ebene: 'kanalAo', feld: pfad.join('.'), soll: summeAo, ist: hole(kanalAo, pfad) })
    }
    const summeGesamt = hole(kanalSparkassen, pfad) + hole(kanalAo, pfad) + hole(direktkanal, pfad)
    if (summeGesamt !== hole(gesamtportfolio, pfad)) {
      abweichungen.push({ ebene: 'gesamtportfolio', feld: pfad.join('.'), soll: summeGesamt, ist: hole(gesamtportfolio, pfad) })
    }
  }
  return { konsistent: abweichungen.length === 0, abweichungen }
}
