// ============================================================
// LEITPLANKEN DER FACHKONZEPTION
//
// Die Regler des Simulationskastens sind keine freien Parameter,
// sondern die Übersetzung fachlicher Leitplanken: Jede Leitplanke
// führt zu einer Maßnahme, jede Maßnahme zu benannten Reglern.
// So lässt sich jeder Simulationslauf auf eine Entscheidung der
// Fachkonzeption zurückführen — und umgekehrt zeigt die Liste,
// welche Entscheidung im Werkzeug noch keinen Regler hat.
//
// Die Liste ist Domänenwissen, keine Marke: sie gilt für jedes
// Provisionsmodell im Verbundvertrieb und wird im Reiter
// „Grundlagen“ gezeigt.
// ============================================================

export const LEITPLANKEN = [
  {
    id: 'duration',
    leitplanke: 'Vertrags- und Beitragsduration erhöhen, langfristige Kundenbetreuung vergüten',
    massnahme: 'Sukzessive Umschichtung der Vorab-Abschlussprovision in laufende und Bestandsvergütung',
    hebel: ['apLeben', 'lpLeben', 'lpDauer', 'bpLeben', 'bpKomposit'],
    sichtbar: 'Steuerblock: Vergleich Referenzzeitraum gegen kumuliert bis 2030 — die Lücke ist der Aufbau der laufenden Provision',
  },
  {
    id: 'transparenz',
    leitplanke: 'Transparenz und Nachvollziehbarkeit für Vermittler erhöhen',
    massnahme: 'Kleinteilige Zuschüsse in die Kernlogik überführen oder streichen; Bonus und Malus in einer Requalifizierung',
    hebel: ['zuschussAbbau', 'zuschussAllgemein', 'zuschussStandort', 'qualitaetsSpreizung'],
    sichtbar: 'Beschlussvorlage listet jede Abweichung vom heutigen Modell; Steuerungsziel „Einfachheit“',
  },
  {
    id: 'flexibilitaet',
    leitplanke: 'Flexibilität und Modularität für heterogene Vertriebspartner',
    massnahme: 'Wahlmodelle auf denselben Basissätzen: AP/FP, Umdecker (befristet), Hybrid, Laufend',
    hebel: ['anteilUmdecker', 'anteilHybrid', 'anteilLaufend'],
    sichtbar: 'Reiter „Vertriebspartner“ der Akte zeigt die Modellpräferenz je Partner',
  },
  {
    id: 'journey',
    leitplanke: 'Hybride Kundenreisen mit echter Vertriebsleistung vergüten',
    massnahme: 'Provisionsteilung entlang Kontakt, Lead, Beratung, Abschluss und Betreuung je Journey und Kanal',
    hebel: ['journeyOmnikanal', 'betreuungsGewicht'],
    sichtbar: 'Einwand „Journey-Teilung“ in der Akte nennt den verbleibenden Partneranteil',
  },
  {
    id: 'qualitaet',
    leitplanke: 'Qualität und Profitabilität des Geschäfts erhöhen',
    massnahme: 'Requalifizierung über Storno, Duration, Ausschöpfung und Weiterbildung; Muss-Kriterien als Auszahlungsfilter der Bonifikation',
    hebel: ['qualitaetsSpreizung', 'stornoSchwelle', 'qualitaetskriterien', 'ausschoepfungsZuschlag'],
    sichtbar: 'Tafeln „Bonifikation“ und „Qualitätsprofil“ in der Akte; Signal „Requalifizierung“ im Steuerblock',
  },
  {
    id: 'fokusfelder',
    leitplanke: 'Vergütungsimpulse in Wachstums- und Fokusmärkte',
    massnahme: 'Zuschläge auf die Abschlussvergütung für betriebliche Altersversorgung und Biometrie',
    hebel: ['zuschlagBav', 'zuschlagBiometrie'],
    sichtbar: 'Produktionszeilen bAV und Biometrie in Kasten und Akte',
  },
  {
    id: 'bestand',
    leitplanke: 'Bestandsausschöpfung und Mehrvertragskunden',
    massnahme: 'Bestandsprovision auf den betreuten Bestand; Zuschlag je erreichter Ausschöpfungsstufe',
    hebel: ['bpLeben', 'bpKomposit', 'ausschoepfungsZuschlag', 'bpAltbestand'],
    sichtbar: 'Gesprächspunkt „Ihr größter Hebel liegt in der Bestandsausschöpfung“ mit Potenzialrechnung',
  },
  {
    id: 'budget',
    leitplanke: 'Gesamtvergütung nicht über heute — das Budget ist eine Obergrenze',
    massnahme: 'Bonusstaffel auf das Budget normiert; zwei Budgetsichten (Referenzvergleich, kumuliert bis 2030), gefärbt aus Sicht des Zahlenden',
    hebel: ['bonusBudget', 'bonusNormierung', 'diskontsatz'],
    sichtbar: 'Leitband des Lagebilds, Plaketten im Steuerblock, „Referenzvergleich auf null stellen“',
  },
  {
    id: 'verhandlung',
    leitplanke: 'Gestufte Verhandlung: erst Mechanik, dann Sätze, dann Übergang',
    massnahme: 'Besitzstand, Einschleifphase, Verlust- und Gewinndeckel als bezifferte Verhandlungsmasse',
    hebel: ['besitzstandQuote', 'besitzstandJahre', 'verlustdeckel', 'gewinndeckel'],
    sichtbar: 'Fassungen mit Status, Beschlussvorlage, Verhandlungsmodus mit Zugeständnisrechner',
  },
]
