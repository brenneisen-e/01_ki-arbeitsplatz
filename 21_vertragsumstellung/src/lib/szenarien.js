// ============================================================
// SZENARIEN
//
// Ein Szenario setzt mit einem Klick den vollständigen Hebelsatz.
// Die Szenarien spannen bewusst das gesamte Entscheidungsfeld auf:
// von "nichts ändern" bis "maximal vereinfachen". Sie sind
// Diskussionsangebote für die Gremienarbeit, keine Empfehlungen.
// ============================================================

import { standardHebel, istHebel } from './hebel'

function bau(aenderungen) {
  return { ...standardHebel(), ...aenderungen }
}

export const SZENARIEN = [
  {
    id: 'ist',
    name: 'Heutiges Modell',
    kurz: 'Heute',
    art: 'referenz',
    beschreibung:
      'Fortschreibung des bestehenden Vergütungsmodells. Dient als Nulllinie: alle Kennzahlen stehen exakt auf null.',
    erwartung: 'Keine Veränderung, keine Steuerungswirkung, kein Verhandlungsbedarf.',
    hebel: istHebel(),
  },
  {
    id: 'budgetneutral',
    name: 'Ausgewogenes Zielmodell',
    kurz: 'Ausgewogen',
    art: 'empfehlung',
    beschreibung:
      'Ausgewogener Vorschlag: spürbare Verlagerung von der Abschluss- in die laufende und Bestandsvergütung. Im Referenzzeitraum neutral, in der Einführungsphase bis 2030 deutlich unter heute. Requalifizierung und Qualitätsgate sind aktiv.',
    erwartung:
      'Im Referenzzeitraum bleibt das Gesamtvolumen stehen. Kumuliert bis 2030 zahlt das Unternehmen barwertig rund neun Prozent weniger — die Institute verlieren im Startjahr sieben Prozent. Etwa die Hälfte der Einheiten gewinnt.',
    hebel: bau({}),
  },
  {
    id: 'neutral2030',
    name: 'Budgetneutral bis 2030',
    kurz: 'Neutral 2030',
    art: 'empfehlung',
    beschreibung:
      'Das ausgewogene Zielmodell mit vollem Schutz: kein Haus erhält weniger als heute (Verlustdeckel 0 %, Besitzstand 100 % über drei Jahre), Gewinner erhalten von Anfang an ein Viertel ihres strukturellen Gewinns (Gewinnvorgriff 25 %), dazu ein Standortzuschuss von 500 EUR je Geschäftsstelle.',
    erwartung:
      'Im Referenzzeitraum knapp ein Prozent mehr als heute, kumuliert bis 2030 barwertig gut ein Prozent mehr — der Preis dafür, dass kein Institut verliert und die Gewinner nicht jahrelang auf heute stehen, bis die laufende Provision aufgebaut ist.',
    hebel: bau({ verlustdeckel: 0, besitzstandQuote: 100, besitzstandJahre: 3, gewinnvorgriff: 25, zuschussStandort: 500 }),
  },
  {
    id: 'bestand',
    name: 'Bestandsoffensive',
    kurz: 'Bestand',
    art: 'variante',
    beschreibung:
      'Maximale Bestandsorientierung: Abschlussvergütung deutlich abgesenkt, laufende und Bestandsprovision stark erhöht, Hybrid- und laufendes Modell dominieren.',
    erwartung:
      'Höchster Bestandswert und niedrigstes Verhandlungsrisiko, aber deutlich über der Budgetleitplanke: rund neun Prozent mehr Gesamtvergütung.',
    hebel: bau({
      apLeben: 24, lpLeben: 1.1, bpLeben: 0.75, lpDauer: 18,
      apKomposit: 62, bpKomposit: 3.5,
      anteilUmdecker: 5, anteilHybrid: 45, anteilLaufend: 30,
      qualitaetsSpreizung: 8, ausschoepfungsZuschlag: 2,
      journeyOmnikanal: 16, zuschussAbbau: 60,
      besitzstandQuote: 95, besitzstandJahre: 4, verlustdeckel: 5,
    }),
  },
  {
    id: 'qualitaet',
    name: 'Qualitätsfokus',
    kurz: 'Qualität',
    art: 'variante',
    beschreibung:
      'Vergütung folgt konsequent der Qualität: maximale Spreizung der Requalifizierung, alle fünf Muss-Kriterien aktiv, scharfe Stornoschwelle.',
    erwartung:
      'Höchster Qualitätsscore bei nahezu unverändertem Gesamtvolumen. Gute und schwache Häuser trennen sich deutlich — das Verhandlungsrisiko steigt entsprechend.',
    hebel: bau({
      apLeben: 35, lpLeben: 0.95, bpLeben: 0.5, lpDauer: 14,
      apKomposit: 74, bpKomposit: 3,
      qualitaetsSpreizung: 15, stornoSchwelle: 4, qualitaetskriterien: 5,
      ausschoepfungsZuschlag: 3, bonusProgression: 1.3,
      journeyOmnikanal: 12, zuschussAbbau: 50,
    }),
  },
  {
    id: 'aktivierung',
    name: 'Aktivierung Neugeschäft',
    kurz: 'Aktivierung',
    art: 'variante',
    beschreibung:
      'Vertriebsseitig attraktivste Variante: hohe Abschlussvergütung, starker Umdecker-Anteil, steile Bonusstaffel. Bewusst über der Budgetleitplanke.',
    erwartung:
      'Beste Aufnahme im Vertrieb: fast alle Einheiten gewinnen, das Startjahr liegt im Plus. Dafür rund sechs Prozent über Budget und barwertig zweistellig teurer.',
    hebel: bau({
      apLeben: 42, lpLeben: 0.4, bpLeben: 0.3, lpDauer: 8,
      apKomposit: 92, bpKomposit: 3.25,
      anteilUmdecker: 30, anteilHybrid: 18, anteilLaufend: 5,
      qualitaetsSpreizung: 4, qualitaetskriterien: 2,
      bonusBudget: 150, bonusProgression: 1.6,
      journeyOmnikanal: 4, zuschussAbbau: 20,
      umdeckerBefristung: 5,
    }),
  },
  {
    id: 'verbundfreundlich',
    name: 'Verbundfreundlich',
    kurz: 'Verbund',
    art: 'variante',
    beschreibung:
      'Verlagert Vergütung gezielt in Richtung des Bankenvertriebs: höhere Bestandsprovision, milde Journey-Teilung, großzügiger Besitzstand und Kleininstitutssockel.',
    erwartung:
      'Milde Delle im Startjahr von rund drei Prozent statt sieben. Der Schutz kostet Budget und wird von der Ausschließlichkeitsorganisation mitgetragen.',
    hebel: bau({
      apLeben: 33, lpLeben: 0.85, bpLeben: 0.6, lpDauer: 12,
      apKomposit: 76, bpKomposit: 3.25,
      anteilUmdecker: 8, anteilHybrid: 34, anteilLaufend: 18,
      qualitaetsSpreizung: 6, qualitaetskriterien: 2,
      bonusBudget: 115, bonusProgression: 1.2,
      journeyOmnikanal: 6, betreuungsGewicht: 20,
      zuschussAbbau: 40,
      besitzstandQuote: 97, besitzstandJahre: 4, verlustdeckel: 4,
      kleininstitutSockel: 6,
    }),
  },
  {
    id: 'einfach',
    name: 'Maximale Vereinfachung',
    kurz: 'Einfach',
    art: 'variante',
    beschreibung:
      'Ein einziges Wahlmodell, keine Requalifizierung, keine Journey-Teilung, alle kleinteiligen Zuschüsse gestrichen. Radikal einfach zu erklären.',
    erwartung:
      'Höchster Einfachheitswert und niedriges Verhandlungsrisiko, dafür praktisch keine Steuerungswirkung über Qualität, Kanalbeitrag und Bestandsorientierung.',
    hebel: bau({
      apLeben: 35, lpLeben: 0.8, bpLeben: 0.5, lpDauer: 10,
      apKomposit: 80, bpKomposit: 3.75,
      anteilUmdecker: 0, anteilHybrid: 0, anteilLaufend: 0,
      qualitaetsSpreizung: 0, ausschoepfungsZuschlag: 0, qualitaetskriterien: 1,
      bonusBudget: 100, bonusProgression: 0.6,
      journeyOmnikanal: 0, zuschussAbbau: 100,
      besitzstandQuote: 90, besitzstandJahre: 2,
    }),
  },
]

export const SZENARIO_INDEX = Object.fromEntries(SZENARIEN.map(s => [s.id, s]))

/**
 * Zielgewichte für den geführten Modus: der Nutzer wählt bis zu
 * drei strategische Ziele, daraus wird ein Startpunkt gesetzt.
 * `satz` ist der Klartext auf der Zielkarte — was das Ziel bewirkt,
 * ohne Reglernamen; die Reglerliste erscheint nur als Kurzinfo.
 */
export const ZIEL_VORLAGEN = {
  neugeschaeft: {
    label: 'Neugeschäft aktivieren',
    satz: 'Mehr Anreiz für Abschluss und Umdeckung im Neugeschäft.',
    hebel: { apLeben: 34, anteilUmdecker: 22, bonusProgression: 1.4, lpLeben: 0.6 },
  },
  bestandswert: {
    label: 'Bestandswert heben',
    satz: 'Vergütung folgt dem betreuten Bestand, nicht allein dem Abschluss.',
    hebel: { apLeben: 24, lpLeben: 1.4, bpLeben: 1.2, bpKomposit: 5, anteilHybrid: 40, anteilLaufend: 22 },
  },
  qualitaet: {
    label: 'Qualität verankern',
    satz: 'Storno, Vertragsdauer und Ausschöpfung entscheiden über die Vergütung mit.',
    hebel: { qualitaetsSpreizung: 12, qualitaetskriterien: 4, stornoSchwelle: 4.2, ausschoepfungsZuschlag: 2.5 },
  },
  profitabilitaet: {
    label: 'Profitabilität sichern',
    satz: 'Weniger Vorabvergütung und weniger Zuschüsse — das Modell wird günstiger.',
    hebel: { apLeben: 25, apKomposit: 68, zuschussAbbau: 60, lpDauer: 14 },
  },
  omnikanal: {
    label: 'Omnikanal verzahnen',
    satz: 'Wer den Kontakt herstellt und berät, wird am Abschluss beteiligt.',
    hebel: { journeyOmnikanal: 48, betreuungsGewicht: 22 },
  },
  einfachheit: {
    label: 'Einfachheit erhalten',
    satz: 'Wenige Wahlmodelle, wenige Zuschüsse — in einem Satz zu erklären.',
    hebel: { anteilUmdecker: 0, anteilLaufend: 0, anteilHybrid: 25, ausschoepfungsZuschlag: 0, zuschussAbbau: 80, journeyOmnikanal: 10 },
  },
}

/** Setzt aus bis zu drei Zielen einen Starthebelsatz zusammen */
export function hebelAusZielen(zielIds) {
  let h = standardHebel()
  for (const id of zielIds) {
    const v = ZIEL_VORLAGEN[id]
    if (v) h = { ...h, ...v.hebel }
  }
  return h
}
