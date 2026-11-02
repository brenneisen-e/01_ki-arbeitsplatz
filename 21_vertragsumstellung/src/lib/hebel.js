// ============================================================
// STELLHEBEL DES VERGÜTUNGSMODELLS
//
// Kanonische Definition aller Regler. Beide Werkzeuge - die
// Modell-Simulation (Makro) und das Umstellungstool (Mikro) -
// arbeiten mit exakt diesem Hebelsatz. Dadurch können die
// Ergebnisse der beiden Sichten nicht auseinanderlaufen.
//
// Wichtigste Konstruktionsentscheidung: das IST-Modell ist kein
// Sonderfall, sondern derselbe Formelapparat mit den Basiswerten
// der Hebel (istHebel()). Jeder Vergleich ist damit strukturell
// konsistent und jeder Wasserfall geht exakt auf.
// ============================================================

export const HEBEL_GRUPPEN = [
  {
    id: 'lebenKern',
    titel: 'Kernvergütung Leben',
    kurz: 'Leben',
    frage: 'Wie viel Vergütung fließt beim Abschluss, wie viel über die Laufzeit?',
    beschreibung:
      'Der größte Vergütungsblock. Die Verschiebung von der Abschluss- in die laufende Vergütung ist der zentrale Systemwechsel und zugleich der schwierigste Verhandlungspunkt.',
  },
  {
    id: 'kompositKern',
    titel: 'Kernvergütung Komposit',
    kurz: 'Komposit',
    frage: 'Wie stark wird Neugeschäft gegenüber dem betreuten Bestand gewichtet?',
    beschreibung:
      'Sach, Unfall, Haftpflicht und Kfz. Der Bestandsblock ist hier bereits heute groß und damit der wirksamste Hebel für Bestandsdurchdringung.',
  },
  {
    id: 'wahlmodelle',
    titel: 'Wahlmodelle',
    kurz: 'Wahl',
    frage: 'Welche Modelle stehen zur Wahl und wer wählt was?',
    beschreibung:
      'Vier Profile auf denselben Basissätzen. AP/FP, Hybrid und Laufend sind bewusst annähernd barwertgleich; das Umdecker-Modell ist als befristeter Aktivierungshebel überzahlt.',
  },
  {
    id: 'qualitaet',
    titel: 'Qualität & Requalifizierung',
    kurz: 'Qualität',
    frage: 'Wie stark hängt die Vergütung an Storno, Duration und Ausschöpfung?',
    beschreibung:
      'Die Requalifizierung ist am Qualitätsniveau des heutigen Portfolios verankert und damit per Konstruktion budgetneutral: sie verteilt um, sie kürzt nicht.',
  },
  {
    id: 'bonus',
    titel: 'Bonifikation',
    kurz: 'Bonus',
    frage: 'Wie stark belohnt die Staffel Übererfüllung, wie hart filtert Qualität?',
    beschreibung:
      'Progressive Staffel auf Institutsebene. Qualitäts- und Servicekriterien regeln den Auszahlungsgrad des erreichten Bonus auf 100 %, 75 % oder 0 %.',
  },
  {
    id: 'journey',
    titel: 'Omnikanal & Journey-Teilung',
    kurz: 'Journey',
    frage: 'Wird der Wertbeitrag entlang der Kundenreise vergütet oder nur der Abschluss?',
    beschreibung:
      'Kontakt, Lead, Beratung, Abschluss und Betreuung werden gewichtet und dem jeweils leistenden Kanal zugeordnet.',
  },
  {
    id: 'zuschuesse',
    titel: 'Zuschüsse',
    kurz: 'Zuschüsse',
    frage: 'Welche Nebenvergütungen bleiben, welche kommen neu hinzu?',
    beschreibung:
      'Kleinteilige Zuschüsse ohne erkennbaren Steuerungsbeitrag werden abgebaut; ein allgemeiner Zuschuss auf die Abschlussvergütung und ein Standortzuschuss je Geschäftsstelle können sie ersetzen.',
  },
  {
    id: 'rahmen',
    titel: 'Rahmen & Bewertung',
    kurz: 'Rahmen',
    frage: 'Wie wird bewertet?',
    beschreibung:
      'Die Bewertungsannahmen der Barwertrechnung.',
  },
  {
    id: 'uebergang',
    titel: 'Übergang & Besitzstand',
    kurz: 'Übergang',
    frage: 'Wie weich landet ein Institut, das im neuen Modell verliert?',
    beschreibung:
      'Die Verhandlungsmasse: Besitzstandswahrung, Verlustdeckel, Einschleifphase. Jedes Zugeständnis wird sofort mit Kosten beziffert.',
  },
]

/**
 * Hebeldefinition
 *   id          Feldname im Hebel-Objekt
 *   gruppe      Gruppen-ID
 *   label       Anzeigename
 *   kurz        Kurzform für enge Darstellungen
 *   hinweis     Erklärung für Tooltip und geführten Modus
 *   einheit     'promille' | 'prozent' | 'anteil' | 'faktor' | 'jahre' | 'anzahl' | 'euro' | 'schalter'
 *   min/max/step Wertebereich
 *   basis       Wert, der das heutige Modell nachbildet
 *   standard    Startwert des Zielmodells
 *   wirkung     Kurzformel für das Transparenz-Popover
 *   richtung    'hoch-teurer' | 'hoch-guenstiger' | 'neutral'
 */
export const HEBEL = [
  // ------------------------------------------------- Kernvergütung Leben
  {
    id: 'apLeben',
    gruppe: 'lebenKern',
    label: 'Abschlussprovision Leben',
    kurz: 'AP Leben',
    hinweis:
      'Basissatz in Promille der Beitragssumme. Heute liegt der Marktstandard im Sparkassenvertrieb bei rund 35 ‰ als reine Vorabvergütung — das ist der Grund für das AP-lastige Cashflow-Profil.',
    einheit: 'promille',
    min: 8, max: 42, step: 0.5,
    basis: 33,
    standard: 34,
    wirkung: 'AP = Beitragssumme × Satz ‰ × Wahlmodellfaktor × Kanalfaktor',
    richtung: 'hoch-teurer',
  },
  {
    id: 'lpLeben',
    gruppe: 'lebenKern',
    label: 'Laufende Provision Leben',
    kurz: 'LP Leben',
    hinweis:
      'Jährliche Provision in Promille der Beitragssumme über die Laufzeit. Der eigentliche Systemwechsel: barwertig ersetzbar, im Cashflow aber erst über Jahre aufgebaut.',
    einheit: 'promille',
    min: 0, max: 2, step: 0.05,
    basis: 0.1,
    standard: 0.85,
    wirkung: 'LP p. a. = Beitragssumme × Satz ‰, Aufbau über die Jahrgänge',
    richtung: 'hoch-teurer',
  },
  {
    id: 'bpLeben',
    gruppe: 'lebenKern',
    label: 'Bestandsprovision Leben',
    kurz: 'BP Leben',
    hinweis:
      'Prozent des laufenden Bestandsbeitrags. Vergütet Betreuung statt Abschluss und ist zugleich das stärkste Argument gegenüber bestandsstarken Instituten.',
    einheit: 'prozent',
    min: 0, max: 3, step: 0.05,
    basis: 0,
    standard: 0.5,
    wirkung: 'BP = Bestandsbeitrag Leben × Satz %',
    richtung: 'hoch-teurer',
  },
  {
    id: 'zuschlagBav',
    gruppe: 'lebenKern',
    label: 'Zuschlag bAV',
    kurz: 'bAV',
    hinweis:
      'Aufschlag auf die Abschlussvergütung im Wachstumsfeld betriebliche Altersversorgung. Heute gibt es keinen gezielten Vergütungsimpuls in dieses Feld.',
    einheit: 'prozent',
    min: 0, max: 60, step: 1,
    basis: 0,
    standard: 25,
    wirkung: 'AP auf bAV-Beitragssumme × (1 + Zuschlag)',
    richtung: 'hoch-teurer',
  },
  {
    id: 'zuschlagBiometrie',
    gruppe: 'lebenKern',
    label: 'Zuschlag Biometrie',
    kurz: 'Biometrie',
    hinweis:
      'Aufschlag für Berufsunfähigkeit, Risiko und Pflege. Fokusmarkt mit hoher Marge und geringer Marktdurchdringung.',
    einheit: 'prozent',
    min: 0, max: 60, step: 1,
    basis: 0,
    standard: 20,
    wirkung: 'AP auf Biometrie-Beitragssumme × (1 + Zuschlag)',
    richtung: 'hoch-teurer',
  },
  {
    id: 'lpDauer',
    gruppe: 'lebenKern',
    label: 'Laufzeit der laufenden Provision',
    kurz: 'LP-Dauer',
    hinweis:
      'Über wie viele Jahre die laufende Provision gezahlt wird. Kürzere Laufzeiten bringen den Cashflow früher, verteuern aber den Satz.',
    einheit: 'jahre',
    min: 0, max: 25, step: 1,
    basis: 20,
    standard: 12,
    wirkung: 'Obergrenze der Jahrgangssummation',
    richtung: 'hoch-teurer',
  },

  // ------------------------------------------------- Kernvergütung Komposit
  {
    id: 'apKomposit',
    gruppe: 'kompositKern',
    label: 'Abschlussprovision Komposit',
    kurz: 'AP Komposit',
    hinweis:
      'Prozent des Jahresnettobeitrags im Neugeschäft. Kfz erhält über den Kfz-Abschlag nur einen Bruchteil davon.',
    einheit: 'prozent',
    min: 20, max: 120, step: 1,
    basis: 95,
    standard: 78,
    wirkung: 'AP = Jahresnettobeitrag Neugeschäft × Satz %',
    richtung: 'hoch-teurer',
  },
  {
    id: 'bpKomposit',
    gruppe: 'kompositKern',
    label: 'Bestandsprovision Komposit',
    kurz: 'BP Komposit',
    hinweis:
      'Prozent des laufenden Bestandsbeitrags. Der größte Einzelblock der heutigen Vergütung und damit der wirksamste Hebel auf das Gesamtbudget.',
    einheit: 'prozent',
    min: 1, max: 14, step: 0.25,
    basis: 4.6,
    standard: 3,
    wirkung: 'BP = Bestandsbeitrag Komposit × Satz %',
    richtung: 'hoch-teurer',
  },
  {
    id: 'kfzAbschlag',
    gruppe: 'kompositKern',
    label: 'Abschlag Kfz-Geschäft',
    kurz: 'Kfz-Abschlag',
    hinweis:
      'Kfz erhält nur den verbleibenden Anteil des Komposit-Abschlusssatzes. Heute 79 % Abschlag, also gut ein Fünftel des Satzes.',
    einheit: 'prozent',
    min: 0, max: 95, step: 1,
    basis: 79,
    standard: 79,
    wirkung: 'AP Kfz = Jahresnettobeitrag Kfz × Satz % × (1 − Abschlag)',
    richtung: 'hoch-guenstiger',
  },

  // ------------------------------------------------- Wahlmodelle
  {
    id: 'anteilUmdecker',
    gruppe: 'wahlmodelle',
    label: 'Anteil Umdecker-Modell',
    kurz: 'Umdecker',
    hinweis:
      'Befristet erhöhte Abschlussvergütung, um Bestände aus dem Wettbewerb zu heben. Bewusst überzahlt und deshalb zeitlich begrenzt.',
    einheit: 'anteil',
    min: 0, max: 40, step: 1,
    basis: 0,
    standard: 10,
    wirkung: 'AP × 1,25 · LP × 0,00 · BP × 0,60',
    richtung: 'hoch-teurer',
  },
  {
    id: 'anteilHybrid',
    gruppe: 'wahlmodelle',
    label: 'Anteil Hybrid-Modell',
    kurz: 'Hybrid',
    hinweis:
      'Verlagert Vergütung von der Abschluss- in die laufende und Bestandsvergütung. Näherungsweise barwertgleich zum klassischen Modell.',
    einheit: 'anteil',
    min: 0, max: 70, step: 1,
    basis: 0,
    standard: 38,
    wirkung: 'AP × 0,68 · LP × 3,20 · BP × 2,40',
    richtung: 'neutral',
  },
  {
    id: 'anteilLaufend',
    gruppe: 'wahlmodelle',
    label: 'Anteil laufendes Modell',
    kurz: 'Laufend',
    hinweis:
      'Für bestandsorientierte Partner. Minimale Abschluss-, hohe laufende und Bestandsvergütung.',
    einheit: 'anteil',
    min: 0, max: 50, step: 1,
    basis: 0,
    standard: 22,
    wirkung: 'AP × 0,34 · LP × 6,40 · BP × 4,00',
    richtung: 'neutral',
  },

  // ------------------------------------------------- Qualität
  {
    id: 'qualitaetsSpreizung',
    gruppe: 'qualitaet',
    label: 'Spreizung der Requalifizierung',
    kurz: 'Spreizung',
    hinweis:
      'Maximale jährliche Auf- oder Abstufung der Kernvergütung über den Qualitätsscore. Bei heutigem Qualitätsniveau liegt der Faktor bei 1,00 — das System verteilt um, es kürzt nicht.',
    einheit: 'prozent',
    min: 0, max: 15, step: 0.5,
    basis: 0,
    standard: 8,
    wirkung: 'Faktor zwischen 1 − s und 1 + s, verankert am Portfoliodurchschnitt',
    richtung: 'neutral',
  },
  {
    id: 'stornoSchwelle',
    gruppe: 'qualitaet',
    label: 'Schwellenwert Stornoquote Leben',
    kurz: 'Storno-Schwelle',
    hinweis:
      'Ankerpunkt des Storno-Teilscores und zugleich Muss-Kriterium des Bonus-Auszahlungsgrads.',
    einheit: 'prozent',
    min: 2, max: 8, step: 0.1,
    basis: 8,
    standard: 5,
    wirkung: 'Score und Qualitätsgate',
    richtung: 'hoch-guenstiger',
  },
  {
    id: 'ausschoepfungsZuschlag',
    gruppe: 'qualitaet',
    label: 'Zuschlag je Ausschöpfungsstufe',
    kurz: 'Ausschöpfung',
    hinweis:
      'Prozentpunkte auf die Abschlussvergütung je erreichter Stufe der Bestandsausschöpfung. Drei Stufen, entsprechend der Zielbildlogik +1 % / +2 % / +3 %.',
    einheit: 'prozent',
    min: 0, max: 5, step: 0.5,
    basis: 0,
    standard: 1,
    wirkung: 'AP × (1 + Stufen × Zuschlag)',
    richtung: 'hoch-teurer',
  },
  {
    id: 'qualitaetskriterien',
    gruppe: 'qualitaet',
    label: 'Anzahl Muss-Qualitätskriterien',
    kurz: 'Kriterien',
    hinweis:
      'Wie viele Kriterien für den vollen Bonus erfüllt sein müssen. Ein verfehltes Kriterium senkt den Auszahlungsgrad auf 75 %, zwei auf 0 %.',
    einheit: 'anzahl',
    min: 0, max: 5, step: 1,
    basis: 0,
    standard: 3,
    wirkung: 'Auszahlungsgrad 100 %, 75 % oder 0 %',
    richtung: 'hoch-guenstiger',
  },

  // ------------------------------------------------- Bonus
  {
    id: 'bonusBudget',
    gruppe: 'bonus',
    label: 'Bonusbudget gegenüber heute',
    kurz: 'Bonusbudget',
    hinweis:
      'Der Rohbonus wird auf dieses Budget normiert. 100 % bedeutet: identischer Euro-Betrag wie heute, nur anders verteilt.',
    einheit: 'prozent',
    min: 0, max: 200, step: 5,
    basis: 100,
    standard: 100,
    wirkung: 'Normierung des Rohbonus vor dem Qualitätsgate',
    richtung: 'hoch-teurer',
  },
  {
    id: 'bonusProgression',
    gruppe: 'bonus',
    label: 'Progression der Staffel',
    kurz: 'Progression',
    hinweis:
      'Spreizt die Staffelsätze um ihren Mittelwert. Für kleinere Institute ist die Progression der entscheidende Aktivierungshebel.',
    einheit: 'faktor',
    min: 0, max: 2, step: 0.1,
    basis: 1,
    standard: 1,
    wirkung: 'Satz = Mittel + (Stufensatz − Mittel) × Progression',
    richtung: 'neutral',
  },
  {
    id: 'bonusSatz1',
    gruppe: 'bonus',
    label: 'Bonussatz Stufe 1',
    kurz: 'Stufe 1',
    hinweis:
      'Bonussatz auf die Abschlussvergütung unterhalb der Schwelle zu Stufe 2 (heute 85 %). Heute 0 %.',
    einheit: 'prozent',
    min: 0, max: 60, step: 0.5,
    basis: 0,
    standard: 0,
    wirkung: 'Bonus = Abschlussvergütung × Stufensatz (nach Progression)',
    richtung: 'hoch-teurer',
  },
  {
    id: 'bonusSatz2',
    gruppe: 'bonus',
    label: 'Bonussatz Stufe 2',
    kurz: 'Stufe 2',
    hinweis:
      'Bonussatz auf die Abschlussvergütung ab der Schwelle zu Stufe 2 (heute 85 – 95 %). Heute 6 %.',
    einheit: 'prozent',
    min: 0, max: 60, step: 0.5,
    basis: 6,
    standard: 6,
    wirkung: 'Bonus = Abschlussvergütung × Stufensatz (nach Progression)',
    richtung: 'hoch-teurer',
  },
  {
    id: 'bonusSatz3',
    gruppe: 'bonus',
    label: 'Bonussatz Stufe 3',
    kurz: 'Stufe 3',
    hinweis:
      'Bonussatz auf die Abschlussvergütung ab der Schwelle zu Stufe 3 (heute 95 – 105 %). Heute 12 %.',
    einheit: 'prozent',
    min: 0, max: 60, step: 0.5,
    basis: 12,
    standard: 12,
    wirkung: 'Bonus = Abschlussvergütung × Stufensatz (nach Progression)',
    richtung: 'hoch-teurer',
  },
  {
    id: 'bonusSatz4',
    gruppe: 'bonus',
    label: 'Bonussatz Stufe 4',
    kurz: 'Stufe 4',
    hinweis:
      'Bonussatz auf die Abschlussvergütung ab der Schwelle zu Stufe 4 (heute 105 – 115 %). Heute 19 %.',
    einheit: 'prozent',
    min: 0, max: 60, step: 0.5,
    basis: 19,
    standard: 19,
    wirkung: 'Bonus = Abschlussvergütung × Stufensatz (nach Progression)',
    richtung: 'hoch-teurer',
  },
  {
    id: 'bonusSatz5',
    gruppe: 'bonus',
    label: 'Bonussatz Stufe 5',
    kurz: 'Stufe 5',
    hinweis:
      'Bonussatz auf die Abschlussvergütung ab der Schwelle zu Stufe 5 (heute 115 – 130 %). Heute 26 %.',
    einheit: 'prozent',
    min: 0, max: 60, step: 0.5,
    basis: 26,
    standard: 26,
    wirkung: 'Bonus = Abschlussvergütung × Stufensatz (nach Progression)',
    richtung: 'hoch-teurer',
  },
  {
    id: 'bonusSatz6',
    gruppe: 'bonus',
    label: 'Bonussatz Stufe 6',
    kurz: 'Stufe 6',
    hinweis:
      'Bonussatz auf die Abschlussvergütung ab der Schwelle zu Stufe 6 (heute über 130 %). Heute 32 %.',
    einheit: 'prozent',
    min: 0, max: 60, step: 0.5,
    basis: 32,
    standard: 32,
    wirkung: 'Bonus = Abschlussvergütung × Stufensatz (nach Progression)',
    richtung: 'hoch-teurer',
  },

  // Schwellen der Staffel: ab welcher Zielerreichung die nächste Stufe beginnt.
  // Mit den Sätzen zusammen bilden sie die Staffel (bonusStaffel in modell.js);
  // die Engine klemmt sie aufsteigend, Schwelle n liegt mindestens 1 Punkt über n−1.
  {
    id: 'bonusSchwelle1',
    gruppe: 'bonus',
    label: 'Schwelle Stufe 2',
    kurz: 'Schwelle 2',
    hinweis:
      'Zielerreichung in Prozent, ab der Stufe 2 der Bonusstaffel beginnt. Heute 85 %. Eine niedrigere Schwelle hebt Einheiten in die nächste Stufe.',
    einheit: 'prozent',
    min: 50, max: 200, step: 1,
    basis: 85,
    standard: 85,
    wirkung: 'Stufe 2 ab Zielerreichung ≥ Schwelle',
    richtung: 'hoch-guenstiger',
  },
  {
    id: 'bonusSchwelle2',
    gruppe: 'bonus',
    label: 'Schwelle Stufe 3',
    kurz: 'Schwelle 3',
    hinweis:
      'Zielerreichung in Prozent, ab der Stufe 3 der Bonusstaffel beginnt. Heute 95 %. Eine niedrigere Schwelle hebt Einheiten in die nächste Stufe.',
    einheit: 'prozent',
    min: 50, max: 200, step: 1,
    basis: 95,
    standard: 95,
    wirkung: 'Stufe 3 ab Zielerreichung ≥ Schwelle',
    richtung: 'hoch-guenstiger',
  },
  {
    id: 'bonusSchwelle3',
    gruppe: 'bonus',
    label: 'Schwelle Stufe 4',
    kurz: 'Schwelle 4',
    hinweis:
      'Zielerreichung in Prozent, ab der Stufe 4 der Bonusstaffel beginnt. Heute 105 %. Eine niedrigere Schwelle hebt Einheiten in die nächste Stufe.',
    einheit: 'prozent',
    min: 50, max: 200, step: 1,
    basis: 105,
    standard: 105,
    wirkung: 'Stufe 4 ab Zielerreichung ≥ Schwelle',
    richtung: 'hoch-guenstiger',
  },
  {
    id: 'bonusSchwelle4',
    gruppe: 'bonus',
    label: 'Schwelle Stufe 5',
    kurz: 'Schwelle 5',
    hinweis:
      'Zielerreichung in Prozent, ab der Stufe 5 der Bonusstaffel beginnt. Heute 115 %. Eine niedrigere Schwelle hebt Einheiten in die nächste Stufe.',
    einheit: 'prozent',
    min: 50, max: 200, step: 1,
    basis: 115,
    standard: 115,
    wirkung: 'Stufe 5 ab Zielerreichung ≥ Schwelle',
    richtung: 'hoch-guenstiger',
  },
  {
    id: 'bonusSchwelle5',
    gruppe: 'bonus',
    label: 'Schwelle Stufe 6',
    kurz: 'Schwelle 6',
    hinweis:
      'Zielerreichung in Prozent, ab der Stufe 6 der Bonusstaffel beginnt. Heute 130 %. Eine niedrigere Schwelle hebt Einheiten in die nächste Stufe.',
    einheit: 'prozent',
    min: 50, max: 200, step: 1,
    basis: 130,
    standard: 130,
    wirkung: 'Stufe 6 ab Zielerreichung ≥ Schwelle',
    richtung: 'hoch-guenstiger',
  },
  {
    id: 'bonusNormierung',
    gruppe: 'bonus',
    label: 'Staffel auf Budget normieren',
    kurz: 'Normierung',
    hinweis:
      'An: der Rohbonus aller Einheiten wird auf das Bonusbudget normiert, die Staffel verteilt nur um. Aus: die Staffelsätze wirken direkt, das Bonusvolumen folgt der Staffel.',
    einheit: 'schalter',
    min: 0, max: 1, step: 1,
    basis: 1,
    standard: 1,
    wirkung: 'An: Rohbonus × (Budget ÷ Summe Rohbonus) · Aus: Rohbonus × 1',
    richtung: 'neutral',
  },
  {
    // Der Sockel steckt heute schon in istHebel() (4 %) und damit in der
    // Kalibrierung jeder kleinen Einheit. Basis 4 hält Kalibrierung, Szenarien
    // und Fassungen rechnerisch unverändert; die Kerbe „heute" zeigt das ehrlich.
    id: 'kleininstitutSockel',
    gruppe: 'bonus',
    label: 'Bonussockel für kleine Institute',
    kurz: 'Sockel',
    hinweis:
      'Additiver Bonussatz für Institute unterhalb der Volumenschwelle von 800.000 EUR Abschlussvergütung.',
    einheit: 'prozent',
    min: 0, max: 10, step: 0.5,
    basis: 4,
    standard: 4,
    wirkung: 'Stufensatz + Sockel, wenn AP < 800.000 EUR',
    richtung: 'hoch-teurer',
  },

  // ------------------------------------------------- Journey
  {
    id: 'journeyOmnikanal',
    gruppe: 'journey',
    label: 'Anteil hybrider Kundenreisen',
    kurz: 'Omnikanal',
    hinweis:
      'Anteil des Geschäfts, bei dem mehrere Kanäle beteiligt sind. Verschiebt Vergütung von der reinen Vertriebspartner-Journey in Lead-, schrankfertiges und Direktgeschäft.',
    einheit: 'prozent',
    min: 0, max: 70, step: 1,
    basis: 0,
    standard: 8,
    wirkung: 'Umverteilung der Neugeschäftsvergütung über die Journey-Matrix',
    richtung: 'neutral',
  },
  {
    id: 'betreuungsGewicht',
    gruppe: 'journey',
    label: 'Gewicht der Betreuung',
    kurz: 'Betreuung',
    hinweis:
      'Punkte von 100 entlang der Kundenreise, die auf die laufende Betreuung entfallen — zulasten des Abschlusses.',
    einheit: 'anzahl',
    min: 5, max: 30, step: 1,
    basis: 10,
    standard: 16,
    wirkung: 'Kontakt 10 · Lead 20 · Beratung 30 · Abschluss Rest · Betreuung n',
    richtung: 'neutral',
  },

  // ------------------------------------------------- Zuschüsse
  {
    id: 'zuschussAbbau',
    gruppe: 'zuschuesse',
    label: 'Abbau kleinteiliger Zuschüsse',
    kurz: 'Zuschussabbau',
    hinweis:
      'Anteil der Einzelzuschüsse ohne erkennbaren Steuerungsbeitrag, der in die Kernlogik überführt oder gestrichen wird.',
    einheit: 'prozent',
    min: 0, max: 100, step: 5,
    basis: 0,
    standard: 25,
    wirkung: 'Zuschüsse × (1 − Abbau)',
    richtung: 'hoch-guenstiger',
  },
  {
    id: 'zuschussAllgemein',
    gruppe: 'zuschuesse',
    label: 'Allgemeiner Zuschuss',
    kurz: 'Allg. Zuschuss',
    hinweis:
      'Pauschaler Zuschuss in Prozent der Abschlussvergütung — ersetzt kleinteilige Einzelzuschüsse durch eine einzige, erklärbare Größe.',
    einheit: 'prozent',
    min: 0, max: 10, step: 0.25,
    basis: 0,
    standard: 0,
    wirkung: 'Zuschuss = Abschlussvergütung × Satz %',
    richtung: 'hoch-teurer',
  },
  {
    id: 'zuschussStandort',
    gruppe: 'zuschuesse',
    label: 'Standortzuschuss je Geschäftsstelle',
    kurz: 'Standort',
    hinweis:
      'Fester Betrag je Geschäftsstelle und Jahr. Stützt die Fläche; Agenturen zählen als eine Geschäftsstelle, der Direktkanal als keine.',
    einheit: 'euro',
    min: 0, max: 5000, step: 100,
    basis: 0,
    standard: 0,
    wirkung: 'Zuschuss = Geschäftsstellen × Betrag',
    richtung: 'hoch-teurer',
  },

  // ------------------------------------------------- Rahmen
  {
    id: 'diskontsatz',
    gruppe: 'rahmen',
    label: 'Diskontsatz der Barwertrechnung',
    kurz: 'Diskont',
    hinweis:
      'Wirkt ausschließlich auf Barwerte, nicht auf die nominalen Jahresreihen. Höhere Sätze machen Vorabvergütung relativ attraktiver.',
    einheit: 'prozent',
    min: 0, max: 8, step: 0.25,
    basis: 5,
    standard: 5,
    wirkung: 'Barwert der laufenden Zahlungen',
    richtung: 'neutral',
  },

  // ------------------------------------------------- Übergang
  {
    id: 'besitzstandQuote',
    gruppe: 'uebergang',
    label: 'Besitzstandsquote',
    kurz: 'Besitzstand',
    hinweis:
      'Mindestanteil der heutigen Vergütung, der im ersten Jahr nach der Umstellung garantiert wird.',
    einheit: 'prozent',
    min: 0, max: 100, step: 1,
    basis: 0,
    standard: 92,
    wirkung: 'Untergrenze = heutige Vergütung × Quote',
    richtung: 'hoch-teurer',
  },
  {
    id: 'besitzstandJahre',
    gruppe: 'uebergang',
    label: 'Dauer der Einschleifphase',
    kurz: 'Dauer',
    hinweis: 'Über wie viele Jahre der Besitzstandsschutz linear ausläuft.',
    einheit: 'jahre',
    min: 0, max: 6, step: 1,
    basis: 0,
    standard: 3,
    wirkung: 'Schutz läuft linear über n Jahre aus',
    richtung: 'hoch-teurer',
  },
  {
    id: 'verlustdeckel',
    gruppe: 'uebergang',
    label: 'Verlustdeckel im ersten Jahr',
    kurz: 'Verlustdeckel',
    hinweis:
      'Maximaler Rückgang gegenüber heute im ersten Jahr; der Deckel weitet sich jährlich. 30 % entspricht praktisch keinem Deckel.',
    einheit: 'prozent',
    min: 0, max: 30, step: 0.5,
    basis: 30,
    standard: 7,
    wirkung: 'Rückgang höchstens Deckel × Jahr',
    richtung: 'hoch-teurer',
  },
  {
    id: 'gewinndeckel',
    gruppe: 'uebergang',
    label: 'Gewinndeckel im ersten Jahr',
    kurz: 'Gewinndeckel',
    hinweis:
      'Begrenzt Zuwächse einzelner Einheiten, damit Ausreißer das Gesamtbudget nicht sprengen. 60 % entspricht praktisch keinem Deckel.',
    einheit: 'prozent',
    min: 0, max: 60, step: 1,
    basis: 60,
    standard: 25,
    wirkung: 'Zuwachs höchstens Deckel × Jahr',
    richtung: 'hoch-guenstiger',
  },
  {
    id: 'gewinnvorgriff',
    gruppe: 'uebergang',
    label: 'Gewinnvorgriff für Gewinner',
    kurz: 'Gewinnvorgriff',
    hinweis:
      'Anteil des strukturellen Gewinns (Zielmodell im Referenzzeitraum gegenüber heute), den ein Gewinner von Anfang an mindestens erhält. Ohne Vorgriff steht ein Gewinner wegen des Aufbaus der laufenden Provision jahrelang genau auf heute.',
    einheit: 'prozent',
    min: 0, max: 100, step: 5,
    basis: 0,
    standard: 0,
    wirkung: 'Untergrenze heute + Vorgriff × Gewinn',
    richtung: 'hoch-teurer',
  },
  {
    id: 'bpAltbestand',
    gruppe: 'uebergang',
    label: 'Bestandsprovision auf Altbestand',
    kurz: 'BP Altbestand',
    hinweis:
      'Anteil des Altbestands Leben, der sofort den neuen Bestandsprovisionssatz erhält. Der teuerste Posten und zugleich das stärkste Verhandlungsargument.',
    einheit: 'prozent',
    min: 0, max: 100, step: 5,
    basis: 100,
    standard: 100,
    wirkung: 'BP Leben × Anteil Altbestand',
    richtung: 'hoch-teurer',
  },
]

export const HEBEL_INDEX = Object.fromEntries(HEBEL.map(h => [h.id, h]))

/**
 * Erweiterte Annahmen - keine Regler im Hauptbereich, sondern
 * ein aufklappbares Panel. Verhandlungsrelevant, aber nicht Teil
 * der täglichen Simulation.
 */
export const ERWEITERT = {
  umdeckerBefristung: {
    label: 'Befristung Umdecker-Modell', einheit: 'jahre', standard: 3, min: 1, max: 8, step: 1,
    hinweis: 'Danach fallen die Partner in das klassische Modell zurück.',
  },
  ausschoepfungsSchwelle: {
    label: 'Schwelle Bestandsausschöpfung', einheit: 'prozent', standard: 15, min: 5, max: 30, step: 1,
    hinweis: 'Startpunkt der drei Zuschlagsstufen.',
  },
  marktwachstum: {
    label: 'Marktwachstum Neugeschäft', einheit: 'prozent', standard: 1.5, min: -3, max: 6, step: 0.5,
    hinweis: 'Wirkt in beiden Welten gleich und verändert das Delta daher nicht.',
  },
  elastizitaet: {
    label: 'Verhaltenswirkung berücksichtigen', einheit: 'schalter', standard: 0,
    hinweis: 'Schätzt, wie stark der Vertrieb auf veränderte Anreize reagiert. Für die Verhandlung bewusst standardmäßig aus, damit nur Mechanik verglichen wird.',
  },
}

/**
 * Ehemals erweiterte Annahmen, die inzwischen Regler in HEBEL sind. Sie
 * bleiben hier aufgeführt, damit standardErweitert() dieselben Schlüssel
 * und Werte liefert wie zuvor (Fassungen, Importe, Szenarien).
 */
const EHEMALS_ERWEITERT = ['kfzAbschlag', 'kleininstitutSockel', 'bpAltbestand']

export function standardErweitert() {
  return {
    ...Object.fromEntries(EHEMALS_ERWEITERT.map(id => [id, HEBEL_INDEX[id].standard])),
    ...Object.fromEntries(Object.entries(ERWEITERT).map(([k, v]) => [k, v.standard])),
  }
}

/** Startwerte des Zielmodells */
export function standardHebel() {
  return { ...standardErweitert(), ...Object.fromEntries(HEBEL.map(h => [h.id, h.standard])) }
}

/** Hebelwerte, die das heutige Modell nachbilden */
export function istHebel() {
  return {
    ...standardErweitert(),
    ...Object.fromEntries(HEBEL.map(h => [h.id, h.basis])),
    elastizitaet: 0,
  }
}

/** Nummern der Bonusstufen, deren Sätze als Hebel geführt werden */
export const BONUS_STUFEN = [1, 2, 3, 4, 5, 6]

/** Hebel-IDs der Stufensätze in Stufenreihenfolge */
export const BONUS_SATZ_IDS = BONUS_STUFEN.map(n => `bonusSatz${n}`)

/** Hebel-IDs der Stufenschwellen: bonusSchwelle{n} ist die Schwelle, ab der Stufe n+1 beginnt */
export const BONUS_SCHWELLE_IDS = BONUS_STUFEN.slice(0, -1).map(n => `bonusSchwelle${n}`)

export function hebelDerGruppe(gruppenId) {
  return HEBEL.filter(h => h.gruppe === gruppenId)
}

/** Anteil des klassischen AP/FP-Modells als Residuum */
export function anteilKlassisch(h) {
  const rest = 100 - (h.anteilUmdecker ?? 0) - (h.anteilHybrid ?? 0) - (h.anteilLaufend ?? 0)
  return Math.max(0, Math.round(rest * 10) / 10
  )
}

/** Vom Standard abweichende Hebel (für die Statusanzeige) */
export function abweichungen(hebel) {
  return HEBEL.filter(h => Math.abs((hebel[h.id] ?? h.standard) - h.standard) > 1e-9)
}
