// Risikolandkarte (NFR-Klassifizierung) — orientiert an MaRisk / DORA / BaFin
// Diese Risikokategorien dienen als Vorschlagsraster für Agent 2 ("Risikoidentifikation").

export const RISIKO_KATEGORIEN = [
  {
    id: 'operationelles-risiko',
    name: 'Operationelles Risiko',
    color: '#DC2626',
    unterarten: [
      { id: 'prozess', name: 'Prozessrisiken', beschreibung: 'Fehler in Geschäftsprozessen, Workflows oder Verfahren' },
      { id: 'human', name: 'Personalrisiken', beschreibung: 'Menschliche Fehler, Schulungslücken, Wissensverlust' },
      { id: 'system', name: 'IT- & Systemrisiken', beschreibung: 'Systemausfälle, Fehlfunktionen, Datenintegrität' },
      { id: 'extern', name: 'Externe Ereignisse', beschreibung: 'Lieferanten, Katastrophen, Pandemien' },
    ],
  },
  {
    id: 'compliance-risiko',
    name: 'Compliance- & Rechtsrisiko',
    color: '#7C3AED',
    unterarten: [
      { id: 'regulatorik', name: 'Regulatorische Verstöße', beschreibung: 'Verstoß gegen MaRisk, KWG, MaComp, BAIT, DORA' },
      { id: 'gwg', name: 'Geldwäsche & Sanktionen', beschreibung: 'GwG, KWG §25h, EU-Sanktionsverordnungen' },
      { id: 'dsgvo', name: 'Datenschutz', beschreibung: 'DSGVO, BDSG, Auftragsverarbeitung' },
      { id: 'vertrag', name: 'Vertragsrechtliche Risiken', beschreibung: 'Unwirksame Klauseln, fehlende Mandate' },
    ],
  },
  {
    id: 'reputations-risiko',
    name: 'Reputationsrisiko',
    color: '#D97706',
    unterarten: [
      { id: 'kunde', name: 'Kundenwahrnehmung', beschreibung: 'Falsche Beratung, Servicefehler, Beschwerden' },
      { id: 'medien', name: 'Medien & Öffentlichkeit', beschreibung: 'Negative Berichterstattung, Social Media' },
      { id: 'esg', name: 'ESG-Reputationsrisiken', beschreibung: 'Greenwashing, soziale Standards' },
    ],
  },
  {
    id: 'finanzkriminalitaet',
    name: 'Finanzkriminalität & Betrug',
    color: '#B91C1C',
    unterarten: [
      { id: 'intern', name: 'Interner Betrug', beschreibung: 'Unterschlagung, Manipulation durch Mitarbeitende' },
      { id: 'extern', name: 'Externer Betrug', beschreibung: 'CEO-Fraud, Identitätsbetrug, Kreditbetrug' },
      { id: 'cyber', name: 'Cyber-Fraud', beschreibung: 'Phishing, Account Takeover, Ransomware' },
    ],
  },
  {
    id: 'modell-risiko',
    name: 'Modell- & Daten-Risiko',
    color: '#0EA5E9',
    unterarten: [
      { id: 'modell', name: 'Modellrisiken', beschreibung: 'Falsche Annahmen, Overfitting, fehlende Validierung' },
      { id: 'daten', name: 'Datenqualität', beschreibung: 'Inkonsistenzen, Lücken, falsche Stammdaten' },
      { id: 'ki', name: 'KI-/Algorithmus-Risiko', beschreibung: 'Bias, Black-Box, EU AI Act Compliance' },
    ],
  },
  {
    id: 'auslagerungs-risiko',
    name: 'Auslagerungs- & Drittparteienrisiko',
    color: '#0F766E',
    unterarten: [
      { id: 'dienstleister', name: 'Dienstleistersteuerung', beschreibung: 'Schlechte SLA-Erfüllung, mangelnde Kontrolle' },
      { id: 'konzentration', name: 'Konzentrationsrisiko', beschreibung: 'Klumpenrisiken durch wenige Anbieter' },
      { id: 'exit', name: 'Exit-Risiko', beschreibung: 'Schwierige Rückführung von Leistungen' },
    ],
  },
];

// ===== Standard-Kontrollarten (für Schritt 4) =====
export const KONTROLL_ARTEN = [
  { id: 'praeventiv', name: 'Präventiv', beschreibung: 'Verhindert Risikoeintritt im Vorfeld' },
  { id: 'detektiv',   name: 'Detektiv',   beschreibung: 'Erkennt Risikoeintritt nachträglich' },
  { id: 'manuell',    name: 'Manuell',    beschreibung: 'Manuelle Tätigkeit durch Person' },
  { id: 'automatisch',name: 'Automatisch',beschreibung: 'IT-gestützt, regelbasiert' },
  { id: 'hybrid',     name: 'Hybrid',     beschreibung: 'Kombination manuell + automatisch' },
];

export const KONTROLL_FREQUENZ = [
  { id: 'jede-transaktion', name: 'Je Transaktion' },
  { id: 'taeglich',         name: 'Täglich' },
  { id: 'woechentlich',     name: 'Wöchentlich' },
  { id: 'monatlich',        name: 'Monatlich' },
  { id: 'quartalsweise',    name: 'Quartalsweise' },
  { id: 'halbjaehrlich',    name: 'Halbjährlich' },
  { id: 'jaehrlich',        name: 'Jährlich' },
  { id: 'anlassbezogen',    name: 'Anlassbezogen' },
];

// ===== Vordefinierte Prozesse für Demo-Bibliothek =====
export const DEMO_PROZESSE = [
  {
    id: 'kreditvergabe',
    name: 'Kreditvergabe an Firmenkunden',
    kategorie: 'Kreditgeschäft',
    beschreibung: 'End-to-End-Prozess zur Bewilligung von gewerblichen Krediten ab 250 TEUR',
    aktivitaeten: [
      { id: 'a1', name: 'Antragserfassung', beschreibung: 'Kundenberater nimmt den Kreditantrag inklusive aller Unterlagen entgegen und legt den Vorgang im Kreditsystem an.' },
      { id: 'a2', name: 'KYC- & Sanktionsprüfung', beschreibung: 'Identitätsprüfung des Antragstellers, Abgleich gegen Sanktions- und PEP-Listen sowie Erfassung der UBOs nach GwG.' },
      { id: 'a3', name: '§18 KWG Bonitätsanalyse', beschreibung: 'Auswertung des Jahresabschlusses, BWA, Bilanz-Kennzahlen und Berechnung der Kapitaldienstfähigkeit.' },
      { id: 'a4', name: 'Sicherheitenbewertung', beschreibung: 'Erhebung und Bewertung der gestellten Sicherheiten inkl. Haircut-Berechnung und Blankoanteil-Ermittlung.' },
      { id: 'a5', name: 'Rating-Ermittlung', beschreibung: 'Berechnung des internen Ratings auf Basis quantitativer und qualitativer Faktoren.' },
      { id: 'a6', name: 'Kreditentscheidung & Votum', beschreibung: 'Erstellung der Kreditvorlage, Markt- und Marktfolge-Votum, Genehmigung gemäß Kompetenzmatrix.' },
      { id: 'a7', name: 'Auszahlung & Buchung', beschreibung: 'Vertragsabschluss, Sicherheitenbestellung und Auszahlung an den Kunden über das Buchungssystem.' },
      { id: 'a8', name: 'Laufende Überwachung', beschreibung: 'Monitoring der Engagements gemäß MaRisk BTO 1.2.2, regelmäßige Bonitätsprüfungen und Frühwarnsystem.' },
    ],
  },
  {
    id: 'wertpapierabwicklung',
    name: 'Wertpapierabwicklung (Settlement)',
    kategorie: 'Kapitalmarkt',
    beschreibung: 'Settlement-Prozess für Kunden- und Eigenhandelsgeschäfte im Wertpapiergeschäft',
    aktivitaeten: [
      { id: 'b1', name: 'Trade-Erfassung', beschreibung: 'Erfassung des Handelsgeschäfts im Front-Office-System inklusive aller Trade-Attribute.' },
      { id: 'b2', name: 'Trade-Matching', beschreibung: 'Abgleich der eigenen Tradedaten mit der Gegenseite (T+0) zur Identifikation von Diskrepanzen.' },
      { id: 'b3', name: 'Confirmation & Affirmation', beschreibung: 'Versand und Bestätigung der Geschäftsbestätigungen gemäß EMIR/MiFIR.' },
      { id: 'b4', name: 'Settlement-Instruktion', beschreibung: 'Erstellung und Versand der Settlement-Anweisungen an Clearstream/Custodian.' },
      { id: 'b5', name: 'Cash- und Stückeabwicklung', beschreibung: 'Settlement DvP (Delivery vs Payment) am Settlement-Tag, ggf. CSDR-Penalty-Handling.' },
      { id: 'b6', name: 'Reconciliation', beschreibung: 'Tägliche Abstimmung der Nostro-Konten und Depotbestände gegen interne Buchhaltung.' },
    ],
  },
  {
    id: 'zahlungsverkehr',
    name: 'Zahlungsverkehr (SEPA/SWIFT)',
    kategorie: 'Operations',
    beschreibung: 'Bearbeitung eingehender und ausgehender Zahlungen über SEPA und SWIFT',
    aktivitaeten: [
      { id: 'c1', name: 'Auftragsannahme', beschreibung: 'Annahme des Zahlungsauftrags über Online-Banking, Filiale oder Firmenkundenportal.' },
      { id: 'c2', name: 'Plausibilitätsprüfung', beschreibung: 'Prüfung auf vollständige IBAN, Empfängerangaben, Verwendungszweck und Vier-Augen-Schwellen.' },
      { id: 'c3', name: 'Embargo-/Sanktionsfilter', beschreibung: 'Echtzeit-Screening gegen EU-, OFAC- und UN-Sanktionslisten via Filter-System.' },
      { id: 'c4', name: 'Limitprüfung', beschreibung: 'Prüfung gegen Kunden- und Konzernlimite, Tageslimite, Liquiditätsverfügbarkeit.' },
      { id: 'c5', name: 'Freigabe & Routing', beschreibung: 'Freigabe nach Vier-Augen-Prinzip ab Schwellenwert, Routing über SEPA-Clearing oder SWIFT.' },
      { id: 'c6', name: 'Buchung & Reporting', beschreibung: 'Verbuchung im Hauptbuch, Erstellung der Kontoauszüge, Reporting an Bundesbank/BaFin.' },
    ],
  },
  {
    id: 'antragsmanagement',
    name: 'Schadenmanagement (Versicherung)',
    kategorie: 'Versicherung',
    beschreibung: 'Bearbeitung von Schadenfällen in der Sach-/Lebensversicherung',
    aktivitaeten: [
      { id: 'd1', name: 'Schadenmeldung', beschreibung: 'Kunde meldet Schaden über App, Telefon oder Vermittler, Anlage des Schadenfalls im System.' },
      { id: 'd2', name: 'Deckungsprüfung', beschreibung: 'Prüfung der Police, Deckungssumme, Selbstbeteiligung und Ausschlüsse.' },
      { id: 'd3', name: 'Schadenermittlung', beschreibung: 'Bestellung Gutachter, Foto-Inspection oder Werkstattbeurteilung.' },
      { id: 'd4', name: 'Reservebildung', beschreibung: 'Bildung von Einzelschadenreserven gemäß Solvency II.' },
      { id: 'd5', name: 'Regulierungsentscheidung', beschreibung: 'Entscheidung über Ablehnung, Teilregulierung oder volle Regulierung im 4-Augen-Prinzip.' },
      { id: 'd6', name: 'Auszahlung', beschreibung: 'Anweisung der Schadenzahlung an Kunde, Werkstatt oder Dritte.' },
      { id: 'd7', name: 'Regress & Subrogation', beschreibung: 'Prüfung der Regress-Möglichkeiten gegen Schädiger oder Vorversicherer.' },
    ],
  },
];

// ===== Vorgefertigte KI-Vorschläge je Aktivität =====
// Diese Map simuliert die Agent-Antworten. In Produktion käme das aus dem LLM.
export const RISIKO_VORSCHLAEGE = {
  // Kreditvergabe
  'a1': [
    { kategorie: 'operationelles-risiko', unterart: 'prozess', confidence: 'first', beschreibung: 'Unvollständige oder fehlerhafte Erfassung der Kundenstammdaten und Antragsangaben im Kreditsystem.' },
    { kategorie: 'compliance-risiko', unterart: 'dsgvo', confidence: 'second', beschreibung: 'Unzureichende Information des Antragstellers über die Datenverarbeitung gemäß Art. 13 DSGVO.' },
    { kategorie: 'modell-risiko', unterart: 'daten', confidence: 'third', beschreibung: 'Falsche Klassifizierung des Kreditzwecks führt zu inkorrekter Risiko-Gewichtung.' },
  ],
  'a2': [
    { kategorie: 'finanzkriminalitaet', unterart: 'extern', confidence: 'first', beschreibung: 'Unzureichende KYC-Prüfung lässt Kreditbetrug durch gefälschte Identitäten zu.' },
    { kategorie: 'compliance-risiko', unterart: 'gwg', confidence: 'first', beschreibung: 'Verstoß gegen §10 GwG durch unvollständige Erfassung der wirtschaftlich Berechtigten (UBO).' },
    { kategorie: 'compliance-risiko', unterart: 'regulatorik', confidence: 'second', beschreibung: 'Unterlassene Meldung an FIU bei Verdachtsmomenten gemäß §43 GwG.' },
  ],
  'a3': [
    { kategorie: 'compliance-risiko', unterart: 'regulatorik', confidence: 'first', beschreibung: 'Verstoß gegen §18 KWG durch unzureichende Offenlegung der wirtschaftlichen Verhältnisse.' },
    { kategorie: 'modell-risiko', unterart: 'modell', confidence: 'first', beschreibung: 'Fehlerhafte Berechnung der Kapitaldienstfähigkeit durch falsche Cashflow-Annahmen.' },
    { kategorie: 'operationelles-risiko', unterart: 'human', confidence: 'second', beschreibung: 'Manuelle Übertragungsfehler bei Bilanzpositionen in die Analysetools.' },
  ],
  'a4': [
    { kategorie: 'operationelles-risiko', unterart: 'prozess', confidence: 'first', beschreibung: 'Überbewertung von Sicherheiten durch veraltete Bewertungsgutachten oder fehlende Marktpreisaktualisierung.' },
    { kategorie: 'compliance-risiko', unterart: 'vertrag', confidence: 'second', beschreibung: 'Unwirksame Sicherheitenverträge durch formale Mängel (z. B. Notarpflicht bei Grundschulden).' },
    { kategorie: 'modell-risiko', unterart: 'modell', confidence: 'second', beschreibung: 'Falsche Haircut-Ansätze gemäß CRR Art. 207 ff.' },
  ],
  'a5': [
    { kategorie: 'modell-risiko', unterart: 'modell', confidence: 'first', beschreibung: 'Rating-Modell nicht ausreichend validiert oder Backtesting-Ergebnisse nicht dokumentiert.' },
    { kategorie: 'modell-risiko', unterart: 'ki', confidence: 'second', beschreibung: 'KI-gestütztes Rating verletzt Anforderungen des EU AI Act (Hochrisiko-KI).' },
    { kategorie: 'operationelles-risiko', unterart: 'system', confidence: 'third', beschreibung: 'Ausfall des Rating-Systems verhindert rechtzeitige Bonitätseinstufung.' },
  ],
  'a6': [
    { kategorie: 'compliance-risiko', unterart: 'regulatorik', confidence: 'first', beschreibung: 'Verstoß gegen MaRisk BTO 1.2 durch fehlendes Marktfolge-Votum oder Überschreitung der Kompetenz.' },
    { kategorie: 'operationelles-risiko', unterart: 'human', confidence: 'second', beschreibung: 'Befangenheit oder Interessenkonflikte bei Entscheidern werden nicht offengelegt.' },
    { kategorie: 'reputations-risiko', unterart: 'kunde', confidence: 'third', beschreibung: 'Ablehnung ohne nachvollziehbare Begründung führt zu Kundenbeschwerden.' },
  ],
  'a7': [
    { kategorie: 'operationelles-risiko', unterart: 'prozess', confidence: 'first', beschreibung: 'Auszahlung trotz unvollständiger Sicherheitenbestellung oder fehlender Auflagenerfüllung.' },
    { kategorie: 'finanzkriminalitaet', unterart: 'intern', confidence: 'second', beschreibung: 'Mitarbeitender weist Auszahlung auf eigenes oder fremdes Konto an (Veruntreuung).' },
    { kategorie: 'operationelles-risiko', unterart: 'system', confidence: 'third', beschreibung: 'Doppelauszahlung durch Systemfehler oder fehlerhafte Buchungsschnittstelle.' },
  ],
  'a8': [
    { kategorie: 'compliance-risiko', unterart: 'regulatorik', confidence: 'first', beschreibung: 'Verstoß gegen MaRisk BTO 1.2.2 durch unzureichende laufende Überwachung der Engagements.' },
    { kategorie: 'operationelles-risiko', unterart: 'prozess', confidence: 'second', beschreibung: 'Frühwarnindikatoren werden zu spät oder gar nicht eskaliert.' },
    { kategorie: 'modell-risiko', unterart: 'daten', confidence: 'third', beschreibung: 'Unvollständige oder veraltete Daten in der Überwachungsplattform.' },
  ],
  // Wertpapier
  'b1': [
    { kategorie: 'operationelles-risiko', unterart: 'human', confidence: 'first', beschreibung: 'Tippfehler bei Stückzahl, Kurs oder Wertpapierkennnummer (Fat-Finger-Risiko).' },
    { kategorie: 'compliance-risiko', unterart: 'regulatorik', confidence: 'second', beschreibung: 'Verstoß gegen MiFID-II-Anforderungen an Trade-Aufzeichnungen und Zeitstempel.' },
    { kategorie: 'operationelles-risiko', unterart: 'system', confidence: 'third', beschreibung: 'Front-Office-System fällt während aktiver Handelsphasen aus.' },
  ],
  'b2': [
    { kategorie: 'operationelles-risiko', unterart: 'prozess', confidence: 'first', beschreibung: 'Unmatched Trades werden zu spät erkannt und führen zu Settlement Fails (CSDR-Penalty).' },
    { kategorie: 'operationelles-risiko', unterart: 'system', confidence: 'second', beschreibung: 'Schnittstellenausfall zwischen Front-Office- und Matching-System.' },
    { kategorie: 'modell-risiko', unterart: 'daten', confidence: 'third', beschreibung: 'Inkonsistente Stammdaten zwischen Kontrahenten führen zu Fehlmatches.' },
  ],
  'b3': [
    { kategorie: 'compliance-risiko', unterart: 'regulatorik', confidence: 'first', beschreibung: 'EMIR/MiFIR Reporting-Pflichten werden nicht innerhalb T+1 erfüllt.' },
    { kategorie: 'operationelles-risiko', unterart: 'system', confidence: 'second', beschreibung: 'Fehlerhafte XML-Generierung bei Confirmation-Versand.' },
  ],
  'b4': [
    { kategorie: 'operationelles-risiko', unterart: 'prozess', confidence: 'first', beschreibung: 'Falsche oder verspätete Settlement-Instruktion führt zu Settlement Fail.' },
    { kategorie: 'auslagerungs-risiko', unterart: 'dienstleister', confidence: 'second', beschreibung: 'Custodian-Dienstleister verarbeitet Instruktionen verspätet oder fehlerhaft.' },
  ],
  'b5': [
    { kategorie: 'finanzkriminalitaet', unterart: 'cyber', confidence: 'first', beschreibung: 'Manipulation der Settlement-Instruktion durch Phishing/Account Takeover.' },
    { kategorie: 'operationelles-risiko', unterart: 'prozess', confidence: 'second', beschreibung: 'Verstoß gegen CSDR durch Settlement-Discipline-Regime und Penalty-Mechanismus.' },
  ],
  'b6': [
    { kategorie: 'operationelles-risiko', unterart: 'prozess', confidence: 'first', beschreibung: 'Nicht abgestimmte Positionen verzerren die GuV und Bilanz.' },
    { kategorie: 'modell-risiko', unterart: 'daten', confidence: 'second', beschreibung: 'Inkonsistenzen zwischen Nostro- und Custodian-Beständen bleiben unentdeckt.' },
  ],
  // Zahlungsverkehr
  'c1': [
    { kategorie: 'finanzkriminalitaet', unterart: 'extern', confidence: 'first', beschreibung: 'CEO-Fraud / Social Engineering durch manipulierte Zahlungsaufträge.' },
    { kategorie: 'operationelles-risiko', unterart: 'human', confidence: 'second', beschreibung: 'Falsche Auftragsannahme durch unzureichende Identifikation des Kunden.' },
  ],
  'c2': [
    { kategorie: 'operationelles-risiko', unterart: 'prozess', confidence: 'first', beschreibung: 'Fehlende Plausibilitätsprüfung lässt fehlerhafte IBAN oder Beträge passieren.' },
    { kategorie: 'finanzkriminalitaet', unterart: 'extern', confidence: 'second', beschreibung: 'Fake-Receiver-IBAN wird nicht erkannt (Konto-/Empfängernamen-Abgleich).' },
  ],
  'c3': [
    { kategorie: 'compliance-risiko', unterart: 'gwg', confidence: 'first', beschreibung: 'Verstoß gegen EU-Sanktionsverordnungen bei Trefferunterdrückung oder False-Negatives.' },
    { kategorie: 'compliance-risiko', unterart: 'regulatorik', confidence: 'second', beschreibung: 'Unvollständige Konfiguration der Sanktionslisten in Echtzeit-Filter.' },
  ],
  'c4': [
    { kategorie: 'operationelles-risiko', unterart: 'system', confidence: 'first', beschreibung: 'Limitsystem prüft nicht in Echtzeit, dadurch Überziehung möglich.' },
    { kategorie: 'modell-risiko', unterart: 'daten', confidence: 'second', beschreibung: 'Veraltete Limit-Stammdaten in Konzernlimiten.' },
  ],
  'c5': [
    { kategorie: 'finanzkriminalitaet', unterart: 'intern', confidence: 'first', beschreibung: 'Umgehung des Vier-Augen-Prinzips durch Sammelbuchung oder Stellvertreterregelung.' },
    { kategorie: 'operationelles-risiko', unterart: 'system', confidence: 'second', beschreibung: 'Routing-Fehler in SEPA/SWIFT führt zu doppeltem Versand.' },
  ],
  'c6': [
    { kategorie: 'compliance-risiko', unterart: 'regulatorik', confidence: 'first', beschreibung: 'Verspätete oder unvollständige Meldungen an die Bundesbank (AWV/AnaCredit).' },
    { kategorie: 'operationelles-risiko', unterart: 'prozess', confidence: 'second', beschreibung: 'Bestände im Hauptbuch und Subledger weichen voneinander ab.' },
  ],
  // Schaden
  'd1': [
    { kategorie: 'operationelles-risiko', unterart: 'prozess', confidence: 'first', beschreibung: 'Schadenmeldung wird nicht im richtigen System angelegt, geht im Postlauf verloren.' },
    { kategorie: 'compliance-risiko', unterart: 'regulatorik', confidence: 'second', beschreibung: 'Verstoß gegen IDD-Vorgaben zur Erstinformation des Kunden.' },
  ],
  'd2': [
    { kategorie: 'operationelles-risiko', unterart: 'human', confidence: 'first', beschreibung: 'Falsche Deckungsprüfung führt zu unberechtigten Regulierungen oder Ablehnungen.' },
    { kategorie: 'reputations-risiko', unterart: 'kunde', confidence: 'second', beschreibung: 'Unklare Kommunikation zur Ablehnung erhöht Beschwerdeaufkommen.' },
  ],
  'd3': [
    { kategorie: 'finanzkriminalitaet', unterart: 'extern', confidence: 'first', beschreibung: 'Versicherungsbetrug durch gefälschte Schadenbelege oder kollusive Gutachter.' },
    { kategorie: 'auslagerungs-risiko', unterart: 'dienstleister', confidence: 'second', beschreibung: 'Gutachter erfüllt SLA bei Bearbeitungszeit nicht.' },
  ],
  'd4': [
    { kategorie: 'modell-risiko', unterart: 'modell', confidence: 'first', beschreibung: 'Unter- oder Überdotierung der Reserven verstößt gegen Solvency II.' },
    { kategorie: 'compliance-risiko', unterart: 'regulatorik', confidence: 'second', beschreibung: 'Verstoß gegen versicherungstechnische Rückstellungspflichten nach HGB §341e.' },
  ],
  'd5': [
    { kategorie: 'finanzkriminalitaet', unterart: 'intern', confidence: 'first', beschreibung: 'Manipulation der Regulierungsentscheidung zugunsten verbundener Personen.' },
    { kategorie: 'reputations-risiko', unterart: 'kunde', confidence: 'second', beschreibung: 'Inkonsistente Regulierungspraxis führt zu öffentlicher Kritik.' },
  ],
  'd6': [
    { kategorie: 'finanzkriminalitaet', unterart: 'intern', confidence: 'first', beschreibung: 'Auszahlung auf falsches Konto durch Manipulation oder Identitätsdiebstahl.' },
    { kategorie: 'operationelles-risiko', unterart: 'system', confidence: 'second', beschreibung: 'Doppelauszahlung durch Systemfehler.' },
  ],
  'd7': [
    { kategorie: 'compliance-risiko', unterart: 'vertrag', confidence: 'first', beschreibung: 'Verjährung der Regressansprüche durch verspätete Geltendmachung.' },
    { kategorie: 'operationelles-risiko', unterart: 'prozess', confidence: 'second', beschreibung: 'Regressquote unterhalb Branchen-Benchmark, Erlös-Lücke nicht erklärbar.' },
  ],
};

// Kontroll-Bibliothek je Risiko (Vorschläge für Schritt 4)
export const KONTROLL_VORSCHLAEGE = {
  // generische Beispiele — je Risiko-Unterart bis zu 4 Vorschläge
  'prozess': [
    { name: 'Vier-Augen-Prinzip', art: 'praeventiv', typ: 'manuell', frequenz: 'jede-transaktion', wer: 'Sachbearbeiter & Teamleiter', was: 'Zweite Person prüft erfasste Daten gegen Originalbeleg', wann: 'Vor Freigabe', wo: 'Im Kernsystem', wie: 'Sichtkontrolle und Freigabe-Workflow', beschreibung: 'Eine zweite, fachlich kompetente Person prüft die erfassten Daten gegen den Originalbeleg, bestätigt die Vollständigkeit und gibt im System frei.' },
    { name: 'Automatisierte Plausibilisierung', art: 'detektiv', typ: 'automatisch', frequenz: 'jede-transaktion', wer: 'Kernbankensystem', was: 'Validierungsregeln gegen Stammdaten, Wertebereiche, Pflichtfelder', wann: 'Bei Speicherung', wo: 'Eingabemaske', wie: 'Hard-Stop bei Verstoß, Soft-Warning bei Auffälligkeit', beschreibung: 'Das System validiert eingegebene Werte regelbasiert gegen Stammdaten, Pflichtfelder und Wertebereiche. Verstöße führen zu Hard-Stop, Auffälligkeiten zu Warnungen.' },
    { name: 'Tagesabschluss-Abstimmung', art: 'detektiv', typ: 'manuell', frequenz: 'taeglich', wer: 'Operations-Team', was: 'Abgleich der erfassten gegen freigegebene Transaktionen', wann: 'EOD', wo: 'Reporting-Tool', wie: 'Reportvergleich + Kommentierung', beschreibung: 'Tägliche Abstimmung der erfassten gegen freigegebene Transaktionen durch Operations, Abweichungen werden zur Klärung dokumentiert.' },
    { name: 'Quartals-Stichprobenprüfung', art: 'detektiv', typ: 'manuell', frequenz: 'quartalsweise', wer: 'Interne Revision / 2nd Line', was: 'Risikoorientierte Stichprobe der Vorgänge', wann: 'Q-Ende', wo: 'Aktendurchsicht / DMS', wie: 'Bewertung anhand Checkliste, Reporting an Vorstand', beschreibung: 'Risikoorientierte Stichprobenziehung von Vorgängen durch die 2nd Line of Defense; Auswertung gegen Checkliste; Reporting an Vorstand.' },
  ],
  'human': [
    { name: 'Schulungs-Tracking', art: 'praeventiv', typ: 'hybrid', frequenz: 'jaehrlich', wer: 'HR & Fachbereich', was: 'Verpflichtende Pflichtschulungen mit Wissenstest', wann: 'Jährlich', wo: 'LMS', wie: 'Online-Modul + Abschlussprüfung; Entzug der Berechtigungen bei Nichtbestehen', beschreibung: 'Verpflichtende jährliche Pflichtschulung im LMS mit Wissenstest; bei Nichtbestehen werden Systemberechtigungen entzogen.' },
    { name: 'Funktionstrennung', art: 'praeventiv', typ: 'automatisch', frequenz: 'jede-transaktion', wer: 'IAM-System', was: 'Segregation of Duties über Berechtigungsrollen', wann: 'Permanent', wo: 'Active Directory / SAP', wie: 'SoD-Regeln blockieren toxische Berechtigungskombinationen', beschreibung: 'Funktionstrennung wird über das IAM regelbasiert durchgesetzt; toxische Rollenkombinationen werden technisch blockiert.' },
    { name: 'Stellvertreter-Regelung', art: 'praeventiv', typ: 'manuell', frequenz: 'anlassbezogen', wer: 'Fachbereichsleitung', was: 'Definierte Vertretung im Urlaubs-/Krankheitsfall', wann: 'Anlassbezogen', wo: 'Personalakte', wie: 'Dokumentierte Vertretungsregel + Wissenstransfer', beschreibung: 'Für jede kritische Funktion existiert eine dokumentierte Stellvertretungsregel mit Wissenstransfer-Sessions.' },
  ],
  'system': [
    { name: 'Hochverfügbarkeits-Cluster', art: 'praeventiv', typ: 'automatisch', frequenz: 'jede-transaktion', wer: 'IT-Operations', was: 'Active-Active-Cluster mit automatischem Failover', wann: 'Permanent', wo: 'Rechenzentrum primär/sekundär', wie: 'Heartbeat-Monitoring + Failover-Skripte', beschreibung: 'Geschäftskritische Anwendungen laufen in einem Active-Active-Cluster mit automatischem Failover über zwei georedundante Rechenzentren.' },
    { name: 'Disaster-Recovery-Test', art: 'detektiv', typ: 'manuell', frequenz: 'halbjaehrlich', wer: 'IT-Governance & BCM', was: 'Vollständiger DR-Test des Recovery-Plans', wann: 'Halbjährlich', wo: 'DR-RZ', wie: 'Geplanter Failover, Protokollierung, Lessons Learned', beschreibung: 'Halbjährlicher vollständiger DR-Test inklusive Failover in das DR-Rechenzentrum mit Lessons-Learned-Dokumentation.' },
    { name: 'Patch-Management', art: 'praeventiv', typ: 'hybrid', frequenz: 'monatlich', wer: 'IT-Operations', was: 'Monatliches Patch-Window mit Risikoeinstufung', wann: 'Patch-Tuesday', wo: 'Patch-Management-Tool', wie: 'Klassifizierung + automatisiertes Rollout + Rollback-Plan', beschreibung: 'Monatliches Patch-Window mit Risikoklassifizierung, automatisiertem Rollout und definiertem Rollback.' },
    { name: 'SIEM-Monitoring', art: 'detektiv', typ: 'automatisch', frequenz: 'jede-transaktion', wer: 'SOC', was: 'Echtzeit-Korrelation sicherheitsrelevanter Events', wann: '24/7', wo: 'SIEM-Plattform', wie: 'Korrelation, Alerting, Eskalation auf SOC-Tier-2/3', beschreibung: 'Sicherheits-Events aus allen kritischen Systemen werden im SIEM korreliert; Alerts werden an das 24/7-SOC eskaliert.' },
  ],
  'extern': [
    { name: 'Empfänger-Sanktionscheck', art: 'praeventiv', typ: 'automatisch', frequenz: 'jede-transaktion', wer: 'Sanktionsfilter', was: 'Echtzeit-Abgleich gegen EU/OFAC/UN-Listen', wann: 'Vor Buchung', wo: 'Payment-Gateway', wie: 'Hard-Stop bei Treffer, Eskalation in den Compliance-Workflow', beschreibung: 'Vor jeder Buchung wird der Empfänger in Echtzeit gegen EU/OFAC/UN-Sanktionslisten geprüft; bei Treffer Hard-Stop und Eskalation an Compliance.' },
    { name: 'Verhaltensanalytik', art: 'detektiv', typ: 'automatisch', frequenz: 'jede-transaktion', wer: 'Fraud-Engine', was: 'Anomalie-Erkennung anhand Kundenmuster', wann: 'Echtzeit', wo: 'Anti-Fraud-Plattform', wie: 'ML-Scoring, Step-up-Authentifizierung bei hohem Score', beschreibung: 'Eine ML-basierte Anti-Fraud-Engine bewertet jede Transaktion gegen das individuelle Kundenverhalten; bei hohem Score wird eine Zweitauthentifizierung verlangt.' },
    { name: 'Telefon-Rückruf bei Großbeträgen', art: 'praeventiv', typ: 'manuell', frequenz: 'jede-transaktion', wer: 'Firmenkundenbetreuer', was: 'Telefonische Verifikation des Auftraggebers', wann: 'Ab Schwelle 250 TEUR', wo: 'CRM', wie: 'Anruf an hinterlegte Nummer, Doku im CRM', beschreibung: 'Bei Zahlungsaufträgen ab Schwelle 250 TEUR ruft der Firmenkundenbetreuer den Auftraggeber an der hinterlegten Nummer zurück und dokumentiert im CRM.' },
  ],
  'regulatorik': [
    { name: 'Regulatorik-Watchlist', art: 'praeventiv', typ: 'manuell', frequenz: 'monatlich', wer: 'Compliance', was: 'Monitoring relevanter Gesetzesänderungen', wann: 'Monatlich', wo: 'Regulatorik-Tool', wie: 'Gap-Analyse + Maßnahmenliste', beschreibung: 'Compliance betreibt eine Watchlist relevanter Regulatorik, führt monatliche Gap-Analysen durch und steuert Umsetzungsmaßnahmen.' },
    { name: 'MaRisk-Konformitäts-Review', art: 'detektiv', typ: 'manuell', frequenz: 'jaehrlich', wer: '2nd Line', was: 'Jährliches Self-Assessment gegen MaRisk', wann: 'Q4', wo: 'GRC-Tool', wie: 'Self-Assessment + Review durch 2nd Line', beschreibung: 'Jährliches MaRisk-Self-Assessment durch die 1st Line mit anschließendem Review durch die 2nd Line of Defense.' },
    { name: 'Vier-Augen-Genehmigung Großkredite', art: 'praeventiv', typ: 'manuell', frequenz: 'jede-transaktion', wer: 'Markt + Marktfolge', was: 'Doppel-Votum gemäß Kompetenzmatrix', wann: 'Pre-Approval', wo: 'Kreditvorlage', wie: 'Schriftliches Votum + Eskalation bei Differenzen', beschreibung: 'Für jeden Großkredit erfolgt ein schriftliches Doppel-Votum von Markt und Marktfolge; Differenzen werden in die nächsthöhere Kompetenz eskaliert.' },
    { name: 'Reporting an BaFin/Bundesbank', art: 'detektiv', typ: 'hybrid', frequenz: 'monatlich', wer: 'Meldewesen', was: 'Termingerechte Lieferung der Meldungen', wann: 'Monatlich', wo: 'Meldeplattform', wie: 'Validierungen, 4-Augen-Freigabe, Versand', beschreibung: 'Termingerechte und plausibilisierte Meldungen an BaFin/Bundesbank mit Vier-Augen-Freigabe vor Versand.' },
  ],
  'gwg': [
    { name: 'GwG-Officer-Review', art: 'detektiv', typ: 'manuell', frequenz: 'monatlich', wer: 'Geldwäschebeauftragter', was: 'Review von Verdachtsfällen und Treffern', wann: 'Monatlich', wo: 'AML-Case-Management', wie: 'Case-Review + ggf. FIU-Meldung', beschreibung: 'Monatlicher Review aller AML-Cases durch den Geldwäschebeauftragten; bei Verdacht Meldung an FIU innerhalb der Frist.' },
    { name: 'KYC-Refresh', art: 'praeventiv', typ: 'hybrid', frequenz: 'jaehrlich', wer: 'KYC-Operations', was: 'Periodische Aktualisierung der Kundenstammdaten', wann: 'Risikobasiert jährlich oder dreijährig', wo: 'KYC-System', wie: 'Trigger-Liste + Erinnerung an Kunden', beschreibung: 'Risikobasierte KYC-Refresh-Zyklen mit automatischer Trigger-Liste und Kundenanschreiben.' },
    { name: 'PEP-/Sanktionsscreening', art: 'praeventiv', typ: 'automatisch', frequenz: 'taeglich', wer: 'AML-Engine', was: 'Tägliche Re-Screening-Läufe gegen aktuelle Listen', wann: 'Täglich', wo: 'AML-Plattform', wie: 'Match-Logik + manuelle Disposition', beschreibung: 'Tägliches Re-Screening des Gesamtkundenbestands gegen aktualisierte PEP- und Sanktionslisten mit manueller Disposition der Treffer.' },
  ],
  'dsgvo': [
    { name: 'Datenschutz-Folgenabschätzung (DSFA)', art: 'praeventiv', typ: 'manuell', frequenz: 'anlassbezogen', wer: 'Datenschutzbeauftragter', was: 'DSFA für neue Verarbeitungstätigkeiten', wann: 'Bei Initiierung', wo: 'GRC-Tool', wie: 'Templatebasierte Bewertung, Freigabe durch DSB', beschreibung: 'Vor Aufnahme neuer Verarbeitungstätigkeiten mit hohem Risiko wird eine DSFA durchgeführt und vom Datenschutzbeauftragten freigegeben.' },
    { name: 'Auftragsverarbeitungs-Verzeichnis', art: 'detektiv', typ: 'manuell', frequenz: 'halbjaehrlich', wer: 'DSB & Einkauf', was: 'Pflege Art-30-Verzeichnis', wann: 'Halbjährlich', wo: 'Datenschutz-Tool', wie: 'Review + Aktualisierung der Verträge', beschreibung: 'Halbjährliche Pflege des Verzeichnisses von Verarbeitungstätigkeiten (Art. 30 DSGVO) inklusive Review der AV-Verträge.' },
  ],
  'vertrag': [
    { name: 'Vertragsmuster-Freigabe durch Rechtsabteilung', art: 'praeventiv', typ: 'manuell', frequenz: 'anlassbezogen', wer: 'Legal', was: 'Genehmigung neuer Vertragsmuster', wann: 'Vor Einsatz', wo: 'CLM-System', wie: 'Review + freigegebenes Template', beschreibung: 'Neue Vertragsmuster werden vor Einsatz durch die Rechtsabteilung geprüft und im CLM als freigegebenes Template hinterlegt.' },
    { name: 'Klausel-Prüfung bei Abweichung', art: 'detektiv', typ: 'manuell', frequenz: 'jede-transaktion', wer: 'Vertragsmanagement', was: 'Abweichungs-Check gegen Standardklauseln', wann: 'Vor Abschluss', wo: 'CLM-System', wie: 'Redline-Vergleich + Legal-Freigabe', beschreibung: 'Abweichungen vom Standardvertrag werden im CLM via Redline erkannt und durch Legal freigegeben, bevor der Vertrag abgeschlossen werden darf.' },
  ],
  'modell': [
    { name: 'Modellvalidierung', art: 'detektiv', typ: 'manuell', frequenz: 'jaehrlich', wer: 'Modellvalidierung (2nd Line)', was: 'Backtesting + Benchmark gegen Challenger', wann: 'Jährlich', wo: 'Validation-Plattform', wie: 'Quantitatives Review + Validierungsbericht', beschreibung: 'Jährliches Backtesting, Benchmark gegen Challenger-Modelle und Modellvalidierungsbericht durch die 2nd Line.' },
    { name: 'Out-of-Time-Test', art: 'detektiv', typ: 'automatisch', frequenz: 'quartalsweise', wer: 'Modellbetreiber', was: 'Test auf jüngere Daten', wann: 'Quartalsweise', wo: 'Modellplattform', wie: 'Automatisierter Test mit Performance-Reporting', beschreibung: 'Quartalsweiser Out-of-Time-Test auf jüngere Daten zur Erkennung von Modell-Drift, automatisiertes Reporting an Modellverantwortliche.' },
    { name: 'Modell-Governance-Board', art: 'praeventiv', typ: 'manuell', frequenz: 'quartalsweise', wer: 'Modell-Komitee', was: 'Genehmigung von Modelländerungen', wann: 'Quartalsweise', wo: 'Komitee-Sitzung', wie: 'Beschlussvorlagen + dokumentierte Entscheidungen', beschreibung: 'Modelländerungen werden im Modell-Governance-Komitee diskutiert, beschlossen und dokumentiert.' },
  ],
  'daten': [
    { name: 'Stammdaten-QM', art: 'detektiv', typ: 'hybrid', frequenz: 'monatlich', wer: 'Data-Governance', was: 'Datenqualitäts-Reports', wann: 'Monatlich', wo: 'Data-Quality-Tool', wie: 'KPIs auf Vollständigkeit/Korrektheit/Aktualität', beschreibung: 'Monatliche Datenqualitäts-Reports mit KPIs auf Vollständigkeit, Korrektheit und Aktualität; Issue-Tracking bis zur Behebung.' },
    { name: 'Critical-Data-Element-Inventar', art: 'praeventiv', typ: 'manuell', frequenz: 'jaehrlich', wer: 'Data-Owner', was: 'Pflege CDE-Liste mit Verantwortlichkeiten', wann: 'Jährlich', wo: 'Data-Catalog', wie: 'Review-Workflow + Genehmigung', beschreibung: 'Jährliche Pflege des CDE-Inventars mit klarer Verantwortungszuweisung und Genehmigungs-Workflow.' },
  ],
  'ki': [
    { name: 'EU-AI-Act-Konformitätscheck', art: 'praeventiv', typ: 'manuell', frequenz: 'anlassbezogen', wer: 'KI-Governance', was: 'Risikoklassifikation des KI-Systems', wann: 'Vor Inbetriebnahme', wo: 'GRC-Tool', wie: 'Klassifikation + Maßnahmenliste', beschreibung: 'Vor Inbetriebnahme erfolgt eine Klassifikation des KI-Systems nach EU AI Act und eine Maßnahmenliste zur Konformitätssicherung.' },
    { name: 'Bias- & Fairness-Test', art: 'detektiv', typ: 'automatisch', frequenz: 'quartalsweise', wer: 'KI-Validierung', was: 'Quantitative Fairness-Metriken', wann: 'Quartalsweise', wo: 'ML-Ops-Plattform', wie: 'Statistische Tests + Reporting', beschreibung: 'Quartalsweise Fairness-Tests anhand quantitativer Metriken (z. B. Disparate Impact, Equalized Odds) auf den Modell-Outputs.' },
  ],
  'cyber': [
    { name: 'Multifaktor-Authentifizierung', art: 'praeventiv', typ: 'automatisch', frequenz: 'jede-transaktion', wer: 'IAM', was: 'MFA für alle privilegierten Zugriffe', wann: 'Bei Anmeldung', wo: 'IdP', wie: 'TOTP / FIDO2 / Push-Auth', beschreibung: 'Multifaktor-Authentifizierung ist für alle privilegierten und externen Zugriffe verpflichtend (TOTP / FIDO2 / Push).' },
    { name: 'Phishing-Simulation', art: 'detektiv', typ: 'hybrid', frequenz: 'quartalsweise', wer: 'Security-Awareness-Team', was: 'Quartalsweise Phishing-Tests', wann: 'Q-Beginn', wo: 'Awareness-Plattform', wie: 'Simulation + Nachschulung bei Klicks', beschreibung: 'Quartalsweise Phishing-Simulationen mit individueller Nachschulung der Mitarbeitenden, die auf Phishing-Links geklickt haben.' },
  ],
  'intern': [
    { name: 'Sensible Transaktionen — 6-Augen-Prinzip', art: 'praeventiv', typ: 'manuell', frequenz: 'jede-transaktion', wer: 'Operations + Aufsicht', was: 'Drei Personen prüfen kritische Transaktionen', wann: 'Vor Buchung', wo: 'Workflow-Tool', wie: 'Drei dokumentierte Freigaben', beschreibung: 'Für sensible Transaktionen (z. B. Stornos, Auszahlungen aus Sammelkonten) gilt das 6-Augen-Prinzip mit drei dokumentierten Freigaben.' },
    { name: 'Mitarbeitenden-Transaktionsmonitoring', art: 'detektiv', typ: 'automatisch', frequenz: 'monatlich', wer: 'Compliance', was: 'Monitoring eigener Buchungen', wann: 'Monatlich', wo: 'Monitoring-Tool', wie: 'Anomalie-Reports + Befragung', beschreibung: 'Monatliches Monitoring eigener Buchungen von Mitarbeitenden mit Anomalie-Reports und Befragung bei Auffälligkeiten.' },
  ],
  'kunde': [
    { name: 'Beschwerdemanagement', art: 'detektiv', typ: 'hybrid', frequenz: 'jede-transaktion', wer: 'Kundenservice', was: 'Erfassung, Kategorisierung und Auswertung von Beschwerden', wann: 'Anlassbezogen', wo: 'CRM', wie: 'Workflow, Eskalation, Quartalsreport an Vorstand', beschreibung: 'Strukturiertes Beschwerdemanagement im CRM mit Workflow, Eskalation und vierteljährlichem Beschwerdereport an den Vorstand.' },
    { name: 'NPS-Tracking & Root-Cause', art: 'detektiv', typ: 'manuell', frequenz: 'quartalsweise', wer: 'Customer Insights', was: 'Quartalsweise NPS-Befragung + Ursachenanalyse', wann: 'Quartalsweise', wo: 'Survey-Tool', wie: 'NPS + Verbal-Analysen + Maßnahmen', beschreibung: 'Quartalsweise NPS-Befragung mit Ursachenanalyse der Detractor-Kommentare und Maßnahmenableitung.' },
  ],
  'medien': [
    { name: 'Media-Monitoring', art: 'detektiv', typ: 'automatisch', frequenz: 'taeglich', wer: 'Kommunikation', was: 'Tägliches Monitoring relevanter Medien', wann: 'Täglich', wo: 'Monitoring-Tool', wie: 'Stichwortlisten + Alerts', beschreibung: 'Tägliches Media-Monitoring inklusive Social Media mit Alerts auf vordefinierte Stichwortlisten.' },
  ],
  'esg': [
    { name: 'ESG-Reporting-Review', art: 'detektiv', typ: 'manuell', frequenz: 'jaehrlich', wer: 'Nachhaltigkeitsbeauftragter', was: 'Plausibilitätsprüfung Nachhaltigkeitsbericht', wann: 'Jährlich', wo: 'Reporting-Tool', wie: 'Cross-Check gegen Datenbasis', beschreibung: 'Plausibilitätsprüfung des Nachhaltigkeitsberichts gegen die zugrundeliegende Datenbasis (CSRD/ESRS).' },
  ],
  'dienstleister': [
    { name: 'Dienstleister-Risiko-Assessment', art: 'praeventiv', typ: 'manuell', frequenz: 'jaehrlich', wer: 'Auslagerungsbeauftragter', was: 'Jährliches Risiko-Assessment je Dienstleister', wann: 'Jährlich', wo: 'Vendor-Risk-Tool', wie: 'Fragebogen + Vor-Ort-Audit bei Kritisch', beschreibung: 'Jährliches Risiko-Assessment aller wesentlichen Dienstleister; bei kritischen Auslagerungen Vor-Ort-Audit.' },
    { name: 'SLA-Monitoring', art: 'detektiv', typ: 'automatisch', frequenz: 'monatlich', wer: 'Vendor-Management', was: 'Monatliches SLA-Reporting', wann: 'Monatlich', wo: 'SLA-Dashboard', wie: 'Automatische KPIs + Eskalation bei Verletzung', beschreibung: 'Monatliches automatisiertes SLA-Reporting mit definierten KPIs und Eskalationspfaden bei Verletzungen.' },
  ],
  'konzentration': [
    { name: 'Konzentrationsanalyse', art: 'detektiv', typ: 'manuell', frequenz: 'halbjaehrlich', wer: 'Auslagerungsbeauftragter', was: 'Analyse der Anbieter-Konzentration', wann: 'Halbjährlich', wo: 'GRC-Tool', wie: 'Heatmap + Diversifikations-Plan', beschreibung: 'Halbjährliche Konzentrationsanalyse mit Heatmap der Anbieter und Ableitung von Diversifikations-Maßnahmen.' },
  ],
  'exit': [
    { name: 'Exit-Strategie & -Testat', art: 'praeventiv', typ: 'manuell', frequenz: 'jaehrlich', wer: 'Auslagerungsbeauftragter', was: 'Dokumentierte Exit-Strategie je kritischer Auslagerung', wann: 'Jährliches Update', wo: 'Auslagerungs-Akte', wie: 'Exit-Plan + Testat zur Umsetzbarkeit', beschreibung: 'Für jede kritische Auslagerung existiert eine dokumentierte und jährlich aktualisierte Exit-Strategie mit Testat zur tatsächlichen Umsetzbarkeit.' },
  ],
};

// Wahrscheinlichkeit & Schaden-Demo-Daten je Risiko (für Schritt 3)
export const RISIKO_BEWERTUNG_DEFAULT = {
  high: { eintrittsW: 'Hoch (>20%)', schaden: 'Hoch (>250 TEUR)', tier: 'high' },
  mid:  { eintrittsW: 'Mittel (5–20%)', schaden: 'Mittel (50–250 TEUR)', tier: 'mid' },
  low:  { eintrittsW: 'Gering (<5%)', schaden: 'Gering (<50 TEUR)', tier: 'low' },
};
