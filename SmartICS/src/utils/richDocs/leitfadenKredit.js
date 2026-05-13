// =============================================================================
// Prozessleitfaden Kreditvergabe Firmenkunden (gewerbliche Kredite > 250 TEUR)
// Demo-Dokument für Smart ICS - realistisches Format wie in deutschen
// Sparkassen / Volksbanken / Privatbanken üblich. Vollständig synthetisch.
// =============================================================================

import { jsPDF } from 'jspdf';
import {
  PAGE, makeLayout, ensureSpace, finalize,
  addCover, addTableOfContents,
  addH1, addH2, addH3,
  addParagraph, addBullets, addNumberedList,
  addCallout, addTable, spacer,
  addRunningHeader, addRunningFooter,
} from '../pdfHelpers';

export function generateLeitfadenKreditvergabe() {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const docId = `PL-FK-${new Date().getFullYear()}-014`;
  const today = new Date().toLocaleDateString('de-DE');

  const state = makeLayout(doc, {
    docId,
    onHeader: (st) => {
      if (st.page === 1) return; // Cover hat eigenen Header
      addRunningHeader(st, {
        left: `Prozessleitfaden Kreditvergabe Firmenkunden · v4.2 · ${today}`,
        right: `Smart ICS Demo · ${docId}`,
      });
    },
    onFooter: (st) => {
      if (st.page === 1) return;
      addRunningFooter(st, {
        left: 'VERTRAULICH · Stufe 2 — Internal Use Only · synthetische Daten',
        right: `Seite ${st.page}${st.total ? ' / ' + st.total : ''}`,
      });
    },
  });

  // =========================== Cover ==========================================
  addCover(state, {
    title: 'Prozessleitfaden Kreditvergabe an Firmenkunden',
    subtitle: 'Schlüsselprozess KFK-01 — gewerbliche Kreditengagements ab 250 TEUR Bruttoengagement',
    metaRows: [
      ['Dokument-ID',     docId],
      ['Version',         '4.2 (Major Revision wegen 7. MaRisk-Novelle)'],
      ['Gültig ab',       today],
      ['Geltungsdauer',   'bis zur nächsten ordentlichen Überprüfung (12 Monate)'],
      ['Eigentümer',      'Bereichsleitung Marktfolge Aktiv'],
      ['Methodische Aufsicht', 'Operational Risk & Compliance (2nd Line of Defense)'],
      ['Aufsichtsrechtlicher Rahmen', 'KWG § 13, § 13a, § 15, § 18, § 25a; MaRisk AT 4.3, BTO 1.2; CRR Teil 3; EBA/GL/2020/06; GwG; DSGVO Art. 6, 22'],
      ['Klassifizierung', 'VERTRAULICH — Stufe 2 (Internal Use Only). Weitergabe an Dritte nur nach Freigabe durch Compliance.'],
    ],
    versions: [
      { version: 'v1.0', datum: '14.03.2018', autor: 'A. Krämer (MFA)', change: 'Erstfassung im Rahmen Projekt „Kredit 2020"' },
      { version: 'v2.0', datum: '11.01.2020', autor: 'A. Krämer / Compliance', change: 'EBA-GL/2020/06 (Loan Origination and Monitoring) eingearbeitet' },
      { version: 'v3.0', datum: '28.06.2022', autor: 'L. Weiß (MFA)', change: 'Anpassung Kompetenzmatrix; ESG-Faktoren ergänzt; KPI-Set überarbeitet' },
      { version: 'v3.1', datum: '04.12.2023', autor: 'L. Weiß / OpRisk', change: 'Frühwarnindikatoren ergänzt; Eskalationsschwellen reduziert' },
      { version: 'v4.0', datum: '10.05.2024', autor: 'L. Weiß / Compliance', change: '7. MaRisk-Novelle: BTO 1.2 fortgeschrieben, Modellrisiken' },
      { version: 'v4.1', datum: '03.10.2025', autor: 'L. Weiß / OpRisk', change: 'DORA-Anforderungen an Auslagerung (Rating-Service) verankert' },
      { version: 'v4.2', datum: today, autor: 'L. Weiß', change: 'Klarstellung KKF-Berechnung; neue Anlage 4 (ESG-Fragenkatalog)' },
    ],
    approval: 'Vorstand Marktfolge (Frau Dr. M. Berthold)\nGesamtvorstand · Sitzung Q1/2026',
    scope: 'Konzern (inkl. Tochtergesellschaften)\nausgenommen: Bauspargeschäft, Förderkredit',
  });

  // =========================== Inhaltsverzeichnis =============================
  addTableOfContents(state, [
    { no: '1',   title: 'Geltungsbereich, Zweck und Adressaten', page: 3, level: 1 },
    { no: '1.1', title: 'Geltungsbereich', page: 3, level: 2 },
    { no: '1.2', title: 'Adressaten und Verbindlichkeit', page: 3, level: 2 },
    { no: '1.3', title: 'Abgrenzung', page: 3, level: 2 },
    { no: '2',   title: 'Begriffsbestimmungen', page: 4, level: 1 },
    { no: '3',   title: 'Rechtsgrundlagen und Bezugsdokumente', page: 5, level: 1 },
    { no: '4',   title: 'Organisatorische Rahmenbedingungen', page: 6, level: 1 },
    { no: '4.1', title: 'Three-Lines-of-Defense und Funktionstrennung', page: 6, level: 2 },
    { no: '4.2', title: 'Beteiligte Rollen', page: 6, level: 2 },
    { no: '5',   title: 'Antragsverfahren', page: 7, level: 1 },
    { no: '5.1', title: 'Annahmevoraussetzungen', page: 7, level: 2 },
    { no: '5.2', title: 'Antragsunterlagen', page: 7, level: 2 },
    { no: '5.3', title: 'Erfassung im Kreditsystem', page: 8, level: 2 },
    { no: '6',   title: 'Identifikation, KYC und Geldwäscheprävention', page: 9, level: 1 },
    { no: '7',   title: 'Bonitätsanalyse gemäß § 18 KWG', page: 10, level: 1 },
    { no: '7.1', title: 'Auswertung Jahresabschluss', page: 10, level: 2 },
    { no: '7.2', title: 'BWA und unterjährige Zahlen', page: 11, level: 2 },
    { no: '7.3', title: 'Kapitaldienstfähigkeit (KDF)', page: 11, level: 2 },
    { no: '7.4', title: 'Qualitative Faktoren', page: 12, level: 2 },
    { no: '8',   title: 'Sicherheitenbewertung', page: 13, level: 1 },
    { no: '9',   title: 'Rating-Ermittlung', page: 14, level: 1 },
    { no: '10',  title: 'Kreditentscheidung und Kompetenzmatrix', page: 15, level: 1 },
    { no: '11',  title: 'Vertragsgestaltung und Auflagen', page: 16, level: 1 },
    { no: '12',  title: 'Auszahlung', page: 17, level: 1 },
    { no: '13',  title: 'Laufende Überwachung und Frühwarnung', page: 18, level: 1 },
    { no: '14',  title: 'Eskalationsmatrix und Sondersituationen', page: 19, level: 1 },
    { no: '15',  title: 'Anhänge', page: 20, level: 1 },
  ]);

  // =========================== Kapitel 1 =====================================
  addH1(state, '1. Geltungsbereich, Zweck und Adressaten');

  addH2(state, '1.1 Geltungsbereich');
  addParagraph(state, 'Dieser Prozessleitfaden regelt die Bewilligung gewerblicher Kreditengagements ab einem Bruttoengagement von 250 TEUR an Firmenkunden mit Sitz innerhalb des Europäischen Wirtschaftsraumes (EWR). Bei Beteiligungs- oder Konzernverbünden ist auf die Gruppe abzustellen; maßgeblich ist das auf das Institut bezogene konsolidierte Engagement gemäß § 19 Absatz 2 KWG.');
  addParagraph(state, 'Engagements unterhalb der Bagatellschwelle von 250 TEUR werden im Schnellprozess „Kredit-Light" (PL-FK-LIGHT) behandelt. Privatkundenkredite, Wohnungsbaufinanzierungen, Bauspar- und Förderkredite sind ausdrücklich aus dem Geltungsbereich ausgenommen und unterliegen jeweils eigenen Leitfäden.');

  addH2(state, '1.2 Adressaten und Verbindlichkeit');
  addParagraph(state, 'Adressaten sind alle Mitarbeitenden der Geschäftsbereiche Markt (Firmenkundenbetreuung, KMU-Beratung, Verbund) sowie der Marktfolge Aktiv (Kreditanalyse, Sicherheitenbearbeitung, Auszahlung, Kreditüberwachung). Die Anwendung ist verbindlich; Abweichungen sind ausschließlich mit dokumentierter Genehmigung der Bereichsleitung Marktfolge Aktiv und Information der 2nd Line of Defense zulässig.');

  addCallout(state, 'warn', 'Wichtig',
    'Eine Umgehung dieses Leitfadens — auch im Vertretungsfall oder bei Zeitdruck — ist ausgeschlossen. Bei Verstößen erfolgt eine pflichtige Meldung an Operational Risk innerhalb von 24 Stunden gemäß Rahmen-Anweisung „Verlust- und Vorfallserfassung" (RA-OPR-002).'
  );

  addH2(state, '1.3 Abgrenzung');
  addParagraph(state, 'Nicht in den Geltungsbereich fallen: (a) Geld- und Devisenmarktgeschäfte, (b) Geschäfte des Eigenhandels, (c) Treasury-interne Refinanzierungslinien, (d) Konsortialführungen (eigene Verfahrensanweisung PL-KONSO-08), (e) Reverse-Factoring-Programme (PL-FACT-03).');

  // =========================== Kapitel 2 =====================================
  addH1(state, '2. Begriffsbestimmungen');
  addParagraph(state, 'Für die einheitliche Anwendung des Leitfadens werden die nachfolgend definierten Begriffe gemäß den institutsweiten Glossaren zugrunde gelegt. Bei Widersprüchen zu allgemeinen Glossaren der Bank geht die nachstehende Definition vor, sofern es um den Anwendungsbereich dieses Leitfadens geht.');

  addTable(state, [
    { label: 'Begriff', width: 2 },
    { label: 'Definition', width: 5 },
  ], [
    ['Bruttoengagement', 'Summe aller bilanziellen und außerbilanziellen Forderungen, offenen Zusagen und Eventualverbindlichkeiten gegenüber dem Kreditnehmer bzw. seiner Kreditnehmereinheit (§ 19 Absatz 2 KWG), ungeachtet bestehender Sicherheiten.'],
    ['Nettoengagement', 'Bruttoengagement abzüglich anrechenbarer Sicherheiten nach Haircut. Maßgeblich für die Beurteilung des Adressenausfallrisikos.'],
    ['Blankoanteil', 'Anteil des Engagements, der nicht durch werthaltige Sicherheiten gedeckt ist; bildet die wesentliche Risiko-Größe für die Kompetenzeinstufung.'],
    ['Kreditnehmereinheit (KNE)', 'Personen oder Gesellschaften, die nach § 19 Absatz 2 KWG als ein einziger Kreditnehmer anzusehen sind (Konzernverbünde, Risikoverbünde).'],
    ['Kapitaldienstfähigkeit (KDF)', 'Quotient aus nachhaltigem freien Cashflow und planmäßigem Kapitaldienst (Zins + Tilgung) für rollierende 12 Monate.'],
    ['Risikokategorie', 'Klassifizierung des Engagements gemäß interner Risikolandkarte (Performing / Underperforming / Non-Performing).'],
    ['Schlüsselkontrolle', 'Kontrolle, deren Ausfall die Wahrscheinlichkeit oder die Auswirkung eines wesentlichen Risikos materiell erhöht (siehe MaRisk AT 4.3.1).'],
    ['Marktfolge-Votum (MF-Votum)', 'Eigenständige fachliche Beurteilung des Kreditengagements durch die Marktfolge mit klar dokumentierter Empfehlung.'],
    ['ESG-Score', 'Aggregierte Bewertung der ESG-Faktoren des Kreditnehmers (Skala A++ bis D−).'],
    ['Frühwarnindikator (FWI)', 'Quantitatives oder qualitatives Signal, das auf eine Verschlechterung der Risikolage hinweist und Eskalationspflichten auslöst.'],
  ]);

  // =========================== Kapitel 3 =====================================
  addH1(state, '3. Rechtsgrundlagen und Bezugsdokumente');
  addParagraph(state, 'Der Leitfaden setzt insbesondere folgende externe und interne Rechtsgrundlagen sowie Bezugsdokumente um. Bei Änderungen einzelner Rechtsquellen ist Compliance verpflichtet, die Auswirkungen auf den Leitfaden innerhalb von 30 Kalendertagen zu bewerten und gegebenenfalls einen Änderungsbedarf zu eskalieren.');

  addH3(state, 'Aufsichtsrechtliche Grundlagen');
  addBullets(state, [
    'KWG § 13 (Großkredite), § 13a (Anzeigepflichten), § 15 (Organkredite), § 18 (Offenlegung der wirtschaftlichen Verhältnisse), § 25a (interne Organisation) sowie § 25h (interne Sicherungsmaßnahmen).',
    'Mindestanforderungen an das Risikomanagement (MaRisk) — insbesondere AT 4.3 (Internes Kontrollsystem), AT 4.4 (Compliance), AT 9 (Auslagerung), BTO 1 (Organisation des Kreditgeschäfts), BTO 1.2 (Kreditgewährung), BTO 1.2.1 (Tz. 1–8) und BTR (Risikoarten).',
    'Verordnung (EU) Nr. 575/2013 (CRR) — Teil 3 Titel II Kapitel 4 (Eigenmittelanforderungen für das Adressenausfallrisiko), Artikel 178 (Definition des Ausfalls), Artikel 192 ff. (Kreditrisikominderung).',
    'EBA-Leitlinien EBA/GL/2020/06 — Loan Origination and Monitoring, vollständig adressiert; Bezug insbesondere zu Abschnitten 5–8.',
    'Geldwäschegesetz (GwG) §§ 4–13a und § 43; Verordnung (EU) 2015/847 (Transferverordnung); EU-Sanktionsverordnungen (insbesondere VO (EU) 833/2014 und Folgeakte).',
    'Verordnung (EU) 2022/2554 (DORA) — Artikel 28 ff. (IKT-Drittparteienrisikomanagement) für ausgelagerte Rating- und Scoring-Dienstleistungen.',
    'Verordnung (EU) 2024/1689 (EU AI Act) — Anforderungen an Hochrisiko-KI-Systeme; Bezug zu KI-gestützten Bonitäts- und Rating-Komponenten.',
    'DSGVO Artikel 6, 22 und 30 — Rechtmäßigkeit, automatisierte Entscheidungen, Verzeichnis der Verarbeitungstätigkeiten.',
  ]);

  addH3(state, 'Interne Bezugsdokumente');
  addBullets(state, [
    'Risikohandbuch Konzern (RH-K-01), insbesondere Kapitel 4 „Adressenausfallrisiko" und Kapitel 9 „Operationelles Risiko".',
    'Rahmenanweisung Sicherheitenbewertung (RA-SI-04) inkl. Anlage 1 (Haircut-Matrix Q4/2025).',
    'Kompetenzordnung Kreditgeschäft (KO-KFK-2026) — bindend für die Festlegung der Bewilligungsebene.',
    'Methodenhandbuch internes Rating (MH-RAT-2025) — Modellbeschreibung, Backtesting-Ergebnisse, Override-Regeln.',
    'Auslagerungsregister (AR-KONZ-LIVE) — relevant für ausgelagerte Rating- und Auskunfteidienste.',
    'Operational-Risk-Anweisung (RA-OPR-002) — Vorfall- und Verlustanzeigepflichten.',
  ]);

  // =========================== Kapitel 4 =====================================
  addH1(state, '4. Organisatorische Rahmenbedingungen');

  addH2(state, '4.1 Three-Lines-of-Defense und Funktionstrennung');
  addParagraph(state, 'Die organisatorische Trennung von Markt und Marktfolge ist im Sinne von MaRisk BTO 1.1 durchgängig zu gewährleisten. Sie umfasst sowohl die personelle Trennung als auch die system- und prozessseitige Trennung (z. B. getrennte Berechtigungsrollen im Kreditsystem KredOS, getrennte Postfächer im DMS, getrennte Eskalationspfade). Eine Personalunion von Markt- und Marktfolgefunktionen ist auch im Vertretungsfall ausgeschlossen.');
  addParagraph(state, 'Funktionstrennung umfasst die Trennung von Annahme/Beratung (Markt), Analyse/Sicherheit/Bewilligung (Marktfolge), Mittelauszahlung/Buchung (Operations) sowie unabhängiger Prüfung (Interne Revision). Bei Engagements mit besonderem Interessenkonflikt-Risiko (z. B. Organkredite gemäß § 15 KWG) gelten zusätzliche Genehmigungsanforderungen.');

  addH2(state, '4.2 Beteiligte Rollen');
  addTable(state, [
    { label: 'Rolle', width: 2 },
    { label: 'LoD', width: 1 },
    { label: 'Wesentliche Verantwortung', width: 5 },
  ], [
    ['Firmenkundenbetreuer (FKB)',   '1st', 'Erstkontakt, Bedarfsaufnahme, Antragsentgegennahme, Vor-Klassifizierung, fortlaufende Kundenbeziehung.'],
    ['Marktfolge-Kreditanalyst',     '1st', 'Bonitätsanalyse, Cashflow- und Kennzahlenprüfung, Erstellung des MF-Votums.'],
    ['Sicherheitenbearbeiter',       '1st', 'Aufnahme, rechtliche Würdigung, Bewertung und Bestellung der Sicherheiten.'],
    ['Auszahlungs-Sachbearbeiter',   '1st', 'Prüfung Auszahlungsvoraussetzungen, Mittelverwendung, Buchung.'],
    ['Kreditüberwachung',            '1st', 'Bestandsüberwachung, FWI-Auswertung, Watchlist-Pflege.'],
    ['Bereichsleitung MFA',          '1st', 'Genehmigung gemäß Kompetenzmatrix; Vorlage an Vorstand bei Vorbehaltsfällen.'],
    ['Operational Risk Manager',     '2nd', 'Methodische Steuerung, IKS-Überwachung, Stichproben, Schadensfall-Datenbank.'],
    ['Compliance / Geldwäschebeauftragter', '2nd', 'Regulatorik-Monitoring, GwG-Cases, Eskalation an FIU bei Verdachtsmomenten.'],
    ['Modellvalidierung',            '2nd', 'Jährliche Modellvalidierung Rating- und Sicherheitenbewertungsmodelle (siehe MaRisk AT 4.3.2).'],
    ['Interne Revision',             '3rd', 'Unabhängige Prüfung der Wirksamkeit; mindestens dreijährige Zyklusprüfung jedes Schlüsselprozesses.'],
  ]);

  // =========================== Kapitel 5 =====================================
  addH1(state, '5. Antragsverfahren');

  addH2(state, '5.1 Annahmevoraussetzungen');
  addParagraph(state, 'Bevor ein Antrag inhaltlich bearbeitet wird, sind die folgenden Annahmevoraussetzungen kumulativ zu prüfen. Sind nicht alle Voraussetzungen erfüllt, ist der Antrag mit dokumentierter Begründung an den Kunden zurückzuweisen oder mit Hinweis auf fehlende Unterlagen zurückzustellen; eine Bearbeitung gegen Vorlagezusagen ist nicht zulässig.');
  addNumberedList(state, [
    'Der Kunde ist im Kernsystem mit aktuellem KYC-Status erfasst und es liegen keine offenen GwG-Hinweise vor.',
    'Es bestehen keine offenen oder vorbehaltlich geöffneten Sanktions-, Embargo- oder PEP-Treffer; bei einschlägigen Treffern ist die Klärung durch Compliance vorab abgeschlossen.',
    'Der Antrag passt zur strategischen Geschäftsausrichtung des Instituts (Zielmarkt-Kriterien gemäß strategischem Rahmen 2025).',
    'Die Antragshöhe und der Zweck überschreiten keine ausgeschlossenen Verwendungszwecke (z. B. spekulative Derivate, kontroverse Branchen gemäß ESG-Ausschlussliste).',
    'Für die geforderte Kompetenzebene ist die Verfügbarkeit eines bevollmächtigten Entscheiders innerhalb des Service-Level-Zeitfensters gegeben.',
  ]);

  addH2(state, '5.2 Antragsunterlagen');
  addParagraph(state, 'Die folgenden Unterlagen sind grundsätzlich vor Bearbeitung beizubringen. Abweichungen vom Standardumfang sind nur in begründeten Einzelfällen und nach Freigabe durch die Marktfolgeleitung zulässig.');
  addBullets(state, [
    'Schriftlicher Kreditantrag (Standardformular K-1.4) mit allen Pflichtfeldern, einschließlich Unterschrift der vertretungsberechtigten Person und Datum.',
    'Aktueller Handelsregisterauszug (nicht älter als 4 Wochen) und Gesellschaftsvertrag in der jeweils geltenden Fassung.',
    'Die letzten drei testierten oder qualifiziert erstellten Jahresabschlüsse zzgl. Lageberichte. Bei freiwilliger Prüfung ist der Prüfvermerk erforderlich.',
    'Betriebswirtschaftliche Auswertung (BWA) für mindestens die letzten 6 Monate und Summen-/Saldenliste auf gleichem Stand.',
    'Forecast für das laufende Geschäftsjahr und mindestens das Folgejahr inkl. Annahmen-Dokumentation.',
    'Aktuelle Selbstauskunft der natürlichen Bürgen sowie privaten Vermögensaufstellung bei Privatbürgschaften (Stichtag nicht älter 3 Monate).',
    'Unterlagen zu den angebotenen Sicherheiten: Grundbuchauszüge, Verkehrswertgutachten, Sicherungsabreden, Sicherungsverträge, ABS-Verzeichnisse.',
    'ESG-Selbsterklärung des Kunden gemäß Standardfragebogen ESG-Q-02 (siehe Anhang 4 dieses Leitfadens).',
    'Sofern relevant: Auskunft eines externen Auskunfteidienstes nicht älter als 14 Tage (Creditreform, Schufa B2B oder vergleichbar).',
  ]);

  addCallout(state, 'info', 'Hinweis zur Unterlagenvollständigkeit',
    'Die Vollständigkeit ist im Antragssystem KredOS über die Checkliste „Anlage U1" zu dokumentieren. Eine Bearbeitung bei unvollständiger Checkliste ist nur mit zeitlich befristeter Genehmigung durch den Marktfolge-Teamleiter zulässig (Eintrag im Workflow-Notizbuch, max. 5 Werktage).'
  );

  addH2(state, '5.3 Erfassung im Kreditsystem');
  addParagraph(state, 'Die Antragsdaten werden im Kreditsystem KredOS Release 2025.4 erfasst. Der Workflow erzeugt automatisch eine Vorgangsnummer (Schema: KFK-JJJJMM-####), die in der gesamten weiteren Kommunikation zum Antrag zwingend zu verwenden ist. Die wesentlichen Stammdaten sind: Antragsteller, KNE-Verbund, Antragsart, Antragsbetrag, geplante Laufzeit, Zinsbasis, Verwendungszweck, gewünschter Auszahlungszeitpunkt sowie Liste der angebotenen Sicherheiten.');
  addParagraph(state, 'Plausibilitäten werden im System automatisch geprüft (Pflichtfelder, IBAN-Prüfung, Plausibilität Antragsbetrag versus Eigenkapitalbasis). Hard-Stops verhindern die Weitergabe an die Marktfolge, bis sämtliche Plausibilitäten erfolgreich durchlaufen sind. Soft-Warnings werden dokumentiert und im weiteren Workflow als Hinweis an die Marktfolge weitergegeben.');

  // =========================== Kapitel 6 =====================================
  addH1(state, '6. Identifikation, KYC und Geldwäscheprävention');
  addParagraph(state, 'Die Identifikation und KYC-Prüfung folgt § 10 GwG und der internen Anweisung AML-101. Bei Bestandskunden ist mindestens zu prüfen, ob die KYC-Daten innerhalb des risikobasierten Refresh-Zyklus aktuell sind. Bei Neukunden ist eine vollständige Identifikation durchzuführen; bei Kapitalgesellschaften zusätzlich die UBO-Ermittlung gemäß § 3 GwG einschließlich der Eintragung im Transparenzregister.');
  addBullets(state, [
    'Identifikation der vertretungsberechtigten natürlichen Personen sowie sämtlicher UBOs ab einer Beteiligungs- oder Stimmrechtsquote von mehr als 25 Prozent.',
    'Sanktionslisten-Screening in Echtzeit gegen EU-Sanktionsverordnungen, OFAC-SDN, UN-Listen und länderspezifische Listen.',
    'PEP-Screening und Klassifizierung in PEP, Family-Member, Close-Associate; bei PEP-Treffern verpflichtende Eskalation an den Geldwäschebeauftragten gemäß § 15 GwG.',
    'Risikobasierte Einstufung in die Risikoklassen LOW, MEDIUM, HIGH; bei HIGH-Risk-Kunden vertiefte Sorgfaltspflichten (Enhanced Due Diligence) gemäß § 15 GwG.',
    'Dokumentation aller Identifikations- und Screening-Schritte im AML-Case-Management-System mit Versionierung; Aufbewahrungsfrist 10 Jahre.',
  ]);
  addCallout(state, 'risk', 'Verdachtsmomente',
    'Bei Anhaltspunkten für Geldwäsche oder Terrorismusfinanzierung ist umgehend (spätestens innerhalb von 4 Stunden nach Kenntnis) eine Verdachtsmeldung über den Geldwäschebeauftragten an die FIU zu erstatten. Bis zur Klärung ist eine Auszahlung des Kredits untersagt; ein bereits abgeschlossener Vertrag ist vorsorglich nicht zu vollziehen.'
  );

  // =========================== Kapitel 7 =====================================
  addH1(state, '7. Bonitätsanalyse gemäß § 18 KWG');

  addH2(state, '7.1 Auswertung Jahresabschluss');
  addParagraph(state, 'Die Auswertung der letzten drei Jahresabschlüsse erfolgt strukturiert nach dem internen Auswertungsschema JA-AUS-22. Schwerpunkte sind die Entwicklung der Vermögens-, Finanz- und Ertragslage, die Eigenkapitalausstattung im Branchenvergleich, die Liquiditätslage sowie auffällige Buchungstatbestände (insbesondere außergewöhnliche Ertrags- oder Aufwandsposten, Bewertungseinheiten, Drohverlustrückstellungen).');
  addParagraph(state, 'Zwingend zu berechnen sind: Eigenkapitalquote, Gesamtkapitalrentabilität, Umsatzrentabilität, Cashflow-Marge, dynamischer Verschuldungsgrad sowie Zinsdeckungsgrad. Die ermittelten Kennzahlen werden gegen die Branchen-Benchmarks (Datenquelle: Deutsche Bundesbank Verbundbilanzstatistik, Jahresdurchschnitt) verglichen. Wesentliche Abweichungen (mehr als 1,5 Standardabweichungen über dem Branchendurchschnitt) sind im Votum zu kommentieren.');

  addCallout(state, 'example', 'Beispiel — Eigenkapitalquote im Branchenvergleich',
    'Kunde XY GmbH (Maschinenbau): EK-Quote 18,4 %. Branchen-Median DACH-Maschinenbau (KMU, Umsatz 10-50 Mio. EUR): 31,7 %. Abweichung -13,3 PP. Im MF-Votum ist die Abweichung quantitativ und qualitativ einzuordnen (z. B. durch Verweis auf jüngste Investitionen, Akquisitionen, Sondereffekte).'
  );

  addH2(state, '7.2 BWA und unterjährige Zahlen');
  addParagraph(state, 'Die unterjährige Beurteilung erfolgt auf Basis der BWA mit den dazugehörigen Summen- und Saldenlisten. Die Abstimmung der BWA gegen die zuletzt verfügbaren testierten Zahlen ist Pflicht; nicht abgestimmte Differenzen größer 1 Prozent der Bilanzsumme sind zu erläutern. Sind keine plausiblen Erläuterungen vorhanden, ist der Antrag bis zur Klärung zurückzustellen.');

  addH2(state, '7.3 Kapitaldienstfähigkeit (KDF)');
  addParagraph(state, 'Die Kapitaldienstfähigkeit ist der wesentliche Belastbarkeitsindikator des Kredits. Sie ist definiert als Quotient aus dem nachhaltig erzielbaren freien Cashflow (FCF) und dem planmäßigen Kapitaldienst (Zins und Tilgung) für rollierende 12 Monate. Die Berechnung erfolgt nach dem Schema:');
  addCallout(state, 'example', 'Kapitaldienstfähigkeit — Standardformel',
    'KDF = FCF / (Zins + Tilgung) ; mit FCF = Jahresüberschuss + Abschreibungen + Zinsen – außerordentliche Erträge – nicht zahlungswirksame Veränderungen – Eigeninvestitionen, jeweils gemäß Schema JA-AUS-22 Anlage 3.'
  );
  addParagraph(state, 'Die KDF gilt grundsätzlich als gegeben, wenn der Quotient mindestens 1,2 beträgt. Für Investitionskredite mit substanzieller Eigenmittel-Beteiligung kann ein Wert von 1,1 ausreichen; für Akquisitionsfinanzierungen ist mindestens 1,5 zu fordern. Werte unter 1,0 sind grundsätzlich ablehnungspflichtig, sofern nicht eine substanzielle Übersicherung oder unwiderrufliche Patronatserklärung vorliegt.');
  addTable(state, [
    { label: 'Finanzierungsanlass', width: 3 },
    { label: 'Mindest-KDF', width: 1 },
    { label: 'Anmerkung', width: 4 },
  ], [
    ['Betriebsmittelkredit (revolvierend)',  '> 1,2', 'Mindestens 12 Monate rollierend nachzuweisen.'],
    ['Investitionskredit Sachanlagen',       '> 1,2', 'Bei substanzieller Eigenmittelbeteiligung > 30 %: 1,1 ausreichend.'],
    ['Akquisitionsfinanzierung',             '> 1,5', 'KDF für Closing-Jahr und Folgejahr getrennt zu prüfen.'],
    ['Projektfinanzierung (Single-Asset)',   '> 1,3', 'Sensitivitätsrechnungen mit -20 % EBITDA verpflichtend.'],
    ['Konsortialfinanzierung',               '> 1,4', 'Berücksichtigung der Konsortialführer-Konditionen.'],
  ]);

  addH2(state, '7.4 Qualitative Faktoren');
  addBullets(state, [
    'Geschäftsmodell, Wettbewerbsposition, regulatorische Abhängigkeiten.',
    'Management-Qualität (Erfahrung, Nachfolge, Compliance-Historie).',
    'Branchen- und Marktdynamik, Substitutionsdruck, Innovationsfähigkeit.',
    'Operative Resilienz: Lieferkettenabhängigkeit, IKT-Reife, Cyber-Reife (insb. bei wesentlichen Auftragnehmern).',
    'ESG-Faktoren gemäß Fragebogen ESG-Q-02 (siehe Anhang 4): Klimaexposition, soziale Aspekte, Governance.',
  ]);

  // =========================== Kapitel 8 =====================================
  addH1(state, '8. Sicherheitenbewertung');
  addParagraph(state, 'Die Sicherheitenbewertung folgt der Rahmenanweisung Sicherheitenbewertung RA-SI-04 in Verbindung mit den jeweils aktuellen Haircut-Tabellen (Quartalsausgabe, freigegeben durch Risiko-Controlling). Wesentlich sind die rechtliche Wirksamkeit, die Werthaltigkeit und die Verwertbarkeit der Sicherheit unter realistischen Bedingungen.');
  addTable(state, [
    { label: 'Sicherheitenart', width: 3 },
    { label: 'Beleihungsgrenze', width: 1.5 },
    { label: 'Haircut', width: 1 },
    { label: 'Anmerkung', width: 4 },
  ], [
    ['Grundschuld Wohnimmobilie (selbstgenutzt)',   '60 % VW',   '20 %', 'Verkehrswertgutachten nicht älter 24 Monate, Markt-Trigger.'],
    ['Grundschuld Gewerbeimmobilie',                '50 % VW',   '25 %', 'Bei Spezialimmobilien zusätzlich Sensitivitätsrechnung.'],
    ['Bürgschaft natürlicher Personen',             'individuell','30 %', 'Vermögensaufstellung erforderlich, Pfändungsfreigrenze beachten.'],
    ['Sicherungsübereignung Maschinen',             '40 %',      '40 %', 'Marktgängigkeit nachweisen; Vermarktungszeit < 6 Monate.'],
    ['Globalzession Forderungen',                   '60 %',      '30 %', 'Aktualisierte Debitorenliste mindestens monatlich.'],
    ['Verpfändung Wertpapiere (Investment Grade)',  '70 %',      '15 %', 'Tägliche Marktbewertung, Margin-Call ab -10 %.'],
    ['Lebensversicherung (Rückkaufswert)',          '90 %',      '5 %',  'Abtretung im Sicherheitenvertrag verpflichtend.'],
    ['Kaufpreisbürgschaft Konzernobergesellschaft', '100 % nominal','10 %', 'Voraussetzung: Investment-Grade-Rating der Konzernmutter.'],
  ]);
  addCallout(state, 'warn', 'Erinnerung',
    'Vor Eingehung der Sicherheit ist die rechtliche Wirksamkeit durch die Rechtsabteilung zu prüfen, sofern es sich nicht um ein freigegebenes Standard-Template handelt. Eine Auszahlung darf nur erfolgen, nachdem die Sicherheitenbestellung wirksam und im Sicherheitenregister erfasst ist.'
  );

  // =========================== Kapitel 9 =====================================
  addH1(state, '9. Rating-Ermittlung');
  addParagraph(state, 'Das interne Rating wird gemäß Methodenhandbuch MH-RAT-2025 ermittelt. Es kombiniert quantitative Faktoren aus dem Jahresabschluss (Gewichtung 60 %) mit qualitativen Faktoren (Gewichtung 30 %) und Verhaltens-/Kontoführungsdaten (Gewichtung 10 %). Das Ergebnis wird auf der internen Rating-Skala 1A bis 16 abgebildet.');
  addBullets(state, [
    'Quantitative Faktoren: Eigenkapitalquote, dynamischer Verschuldungsgrad, EBIT-Marge, Zinsdeckung, Cashflow-Marge, Working-Capital-Quote, Kapitaldienstdeckung.',
    'Qualitative Faktoren: Management-Score, Branchen-Score, Marktposition, Diversifikation, Compliance-Historie.',
    'Verhaltensdaten: Saldenentwicklung, Kontoüberzugshäufigkeit, Zahlungsverhalten ggü. Lieferanten/Steuerbehörden.',
  ]);
  addParagraph(state, 'Überschreibungen (Overrides) des modellhaft ermittelten Ratings sind grundsätzlich auf max. zwei Notches möglich. Sie sind im Antragssystem als „Override-Memo" zu dokumentieren, müssen einen wirtschaftlich nachvollziehbaren Grund anführen (z. B. wesentlicher Sondereffekt, Konzernrückhalt) und sind durch eine zweite Person der Marktfolge zu gegenzeichnen.');
  addCallout(state, 'info', 'Modell-Validierung',
    'Die Validität des Rating-Modells wird mindestens jährlich durch das Team Modellvalidierung (2nd LoD) überprüft (Backtesting, Diskriminationskraft, Stabilität, Out-of-Time-Test). Wesentliche Modellanpassungen werden dem Operational Risk Committee zur Kenntnis gegeben.'
  );

  // =========================== Kapitel 10 ====================================
  addH1(state, '10. Kreditentscheidung und Kompetenzmatrix');
  addParagraph(state, 'Die Kreditentscheidung erfolgt risikoorientiert auf Basis des konsolidierten Bruttoengagements der Kreditnehmereinheit. Maßgebliche Größen sind die Höhe des Engagements, die Risikokategorie (Rating-Klasse) und der Blankoanteil. Die nachfolgende Matrix definiert die Bewilligungsebene; Eskalationen erfolgen automatisch durch das Workflow-Tool.');
  addTable(state, [
    { label: 'Bruttoengagement', width: 2 },
    { label: 'Rating', width: 1.4 },
    { label: 'Bewilligungsebene', width: 3 },
    { label: 'Anmerkung', width: 2 },
  ], [
    ['bis 1,0 Mio. EUR',                'bis 8',  'Teamleiter Marktfolge Aktiv',                       'inkl. MF-Votum'],
    ['bis 1,0 Mio. EUR',                '9-12',   'Bereichsleitung Marktfolge Aktiv',                  'Sondersitzung möglich'],
    ['bis 5,0 Mio. EUR',                'bis 8',  'Bereichsleitung Marktfolge Aktiv + Markt-Vorstand', 'Vier-Augen-Genehmigung'],
    ['bis 5,0 Mio. EUR',                '9-12',   'Kreditkomitee 1',                                   'Wöchentlich, Mittwoch'],
    ['bis 25 Mio. EUR',                 'bis 12', 'Kreditkomitee 2 (mit Risikovorstand)',              'Quorum 4 von 5'],
    ['> 25 Mio. EUR oder Rating ≥ 13',  'alle',   'Gesamtvorstand',                                    'inkl. AR-Information'],
    ['Organkredite gemäß § 15 KWG',     'alle',   'Aufsichtsrat',                                      'Beschluss erforderlich'],
  ]);

  // =========================== Kapitel 11 ====================================
  addH1(state, '11. Vertragsgestaltung und Auflagen');
  addParagraph(state, 'Die Vertragsgestaltung erfolgt grundsätzlich auf Basis der durch die Rechtsabteilung freigegebenen Vertragsmuster (CLM-Repository, Sektion „Kredit Firmenkunden"). Abweichungen sind ausschließlich nach Freigabe durch die Rechtsabteilung zulässig und im Redline-Verfahren zu dokumentieren.');
  addBullets(state, [
    'Standardauflagen: Vorlage Jahresabschluss spätestens 6 Monate nach Geschäftsjahresende, Vorlage BWA quartalsweise, jährliche Selbstauskunft, Informationspflicht über wesentliche Veränderungen.',
    'Financial Covenants (sofern wirtschaftlich begründbar): Eigenkapitalquote min. 25 %, Zinsdeckungsgrad min. 3,0, dynamischer Verschuldungsgrad max. 3,5. Bei Bruch ist Heilung innerhalb 90 Tagen oder Sondertilgung.',
    'Reporting-Auflagen bei Projekt- und Akquisitionsfinanzierungen: monatliches Reporting, jährliches Investment Memo, Verwendungsnachweise vor Ziehung.',
    'Cross-Default-Klauseln gegenüber Konzernverbund ab definierter Schwelle (Konzern-Bruttoengagement > 10 Mio. EUR).',
    'Negativerklärung: keine Bestellung weiterer Sicherheiten zugunsten Dritter ohne Zustimmung des Kreditgebers.',
  ]);

  // =========================== Kapitel 12 ====================================
  addH1(state, '12. Auszahlung');
  addParagraph(state, 'Die Auszahlung erfolgt erst nach Vorliegen aller im Vertrag festgelegten Auszahlungsvoraussetzungen (Conditions Precedent). Dazu zählen insbesondere: wirksame Sicherheitenbestellung, Vorlage der Verwendungsnachweise, ggf. Zahlungsanweisungen an Lieferanten, Vorlage steuerlicher Unbedenklichkeitsbescheinigungen.');
  addBullets(state, [
    'Auszahlungsanforderung im Vier-Augen-Prinzip erfassen (Sachbearbeiter + Teamleiter).',
    'Plausibilitätsprüfung Konto, Empfänger und Verwendungszweck im Auszahlungssystem AUS-2.',
    'Buchung über das zentrale Buchhaltungssystem mit Vermerk der KFK-Vorgangsnummer.',
    'Versand der Auszahlungsanzeige an den Kunden binnen 24 Stunden nach Buchung.',
  ]);
  addCallout(state, 'risk', 'Achtung Fraud-Risk',
    'Bei Auszahlung auf neue oder geänderte Kontoverbindungen ist eine telefonische Rückverifikation mit einer im KYC hinterlegten Telefonnummer verpflichtend. Anweisungen aus E-Mail-Verkehr allein sind nicht ausreichend.'
  );

  // =========================== Kapitel 13 ====================================
  addH1(state, '13. Laufende Überwachung und Frühwarnung');
  addParagraph(state, 'Die laufende Überwachung folgt MaRisk BTO 1.2.2 und der internen Anweisung KÜ-FK-2025. Sie umfasst Bestandsdatenüberwachung, FWI-Auswertung, Rating-Migration sowie anlassbezogene Tiefenprüfungen.');
  addTable(state, [
    { label: 'Frühwarnindikator', width: 3 },
    { label: 'Schwellenwert', width: 2 },
    { label: 'Maßnahme', width: 3 },
  ], [
    ['Kontoüberziehung > 14 Tage',                '> 5 % Limit',         'Eskalation an FKB; bei Wiederholung: Intensivbetreuung.'],
    ['Saldenrückgang auf Hauptkonto',             '> 30 % YoY',          'Klärungsgespräch innerhalb 14 Tage.'],
    ['Rating-Migration Down',                     '≥ 2 Notches',         'Sondervotum erforderlich; Watchlist-Eintrag.'],
    ['Versäumte Reportingpflichten',              '> 30 Tage Verzug',    'Schriftliche Mahnung; bei wiederholter Verfehlung Kreditkündigungsprüfung.'],
    ['Negativberichterstattung Auskunftei',       'jegliche',            'Anlassbezogene Tiefenprüfung; ggf. Konditionsanpassung.'],
    ['Forderungsausfall Großdebitor',             '> 10 % Umsatz',       'Cashflow-Re-Forecast verlangen.'],
  ]);

  // =========================== Kapitel 14 ====================================
  addH1(state, '14. Eskalationsmatrix und Sondersituationen');
  addParagraph(state, 'Wesentliche Sondersituationen sind unverzüglich (taggleich, spätestens innerhalb von 24 Stunden) gemäß folgender Matrix zu eskalieren. Die Dokumentation erfolgt im Eskalations-Workflow E1 mit Versionierung.');
  addBullets(state, [
    'Eintritt eines Default-Ereignisses gemäß Artikel 178 CRR — Eskalation an Special Loans Officer und Bereichsleitung MFA.',
    'Materielle Verschlechterung des Ratings (≥ 3 Notches in 6 Monaten) — Eskalation an Kreditkomitee 2.',
    'Aufdeckung eines Verstoßes gegen Auflagen — Eskalation an Bereichsleitung MFA und Compliance.',
    'Verdacht auf Geldwäsche, Betrug oder Sanktionsverstoß — sofortige Meldung an Compliance/Geldwäschebeauftragten.',
    'Wesentliche Schadensfälle (z. B. bei Großbeständen) — Eskalation an OpRisk und Vorstand.',
  ]);

  // =========================== Kapitel 15 ====================================
  addH1(state, '15. Anhänge');
  addBullets(state, [
    'Anhang 1: Checkliste Antragsunterlagen (Anlage U1)',
    'Anhang 2: Standardformular Kreditantrag (K-1.4)',
    'Anhang 3: Standardvertragsklauseln Financial Covenants',
    'Anhang 4: ESG-Selbsterklärung des Kunden (ESG-Q-02)',
    'Anhang 5: Risikobasierte Stichprobenrichtlinie 2nd LoD',
    'Anhang 6: Schema Operational Loss Reporting (Formular OPR-001)',
  ]);

  // Schluss
  finalize(state);

  doc.save(`Prozessleitfaden_Kreditvergabe_Firmenkunden_${docId}.pdf`);
}
