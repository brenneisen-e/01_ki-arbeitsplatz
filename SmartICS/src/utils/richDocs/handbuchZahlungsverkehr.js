// =============================================================================
// Operations-Handbuch SEPA- und SWIFT-Zahlungsverkehr
// Demo-Dokument für Smart ICS - realistisches Format wie in deutschen
// Operations-Häusern üblich. Vollständig synthetisch.
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

export function generateHandbuchZahlungsverkehr() {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const docId = `OH-ZV-${new Date().getFullYear()}-007`;
  const today = new Date().toLocaleDateString('de-DE');

  const state = makeLayout(doc, {
    docId,
    onHeader: (st) => {
      if (st.page === 1) return;
      addRunningHeader(st, {
        left: `Operations-Handbuch Zahlungsverkehr · v6.0 · ${today}`,
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
    title: 'Operations-Handbuch SEPA- und SWIFT-Zahlungsverkehr',
    subtitle: 'Schlüsselprozess ZV-01 — eingehende und ausgehende Massen- und Individualzahlungen',
    metaRows: [
      ['Dokument-ID',     docId],
      ['Version',         '6.0 (Aktualisierung wegen SEPA-Instant-Pflicht 2025)'],
      ['Gültig ab',       today],
      ['Geltungsdauer',   '12 Monate, vorzeitige Aktualisierung bei Schemes-Änderungen verpflichtend'],
      ['Eigentümer',      'Bereichsleitung Payment Operations'],
      ['Methodische Aufsicht', 'Operational Risk & Compliance (2nd Line of Defense)'],
      ['Regulatorischer Rahmen', 'PSD2; Zahlungsdiensteaufsichtsgesetz (ZAG); SEPA-Regelwerk (EPC); SWIFT CSCF v2026; MaRisk AT 7.2; EBA-Leitlinien zu Operationellen und Sicherheitsrisiken; EU-Sanktionsverordnungen; § 25h KWG; GwG'],
      ['Klassifizierung', 'VERTRAULICH — Stufe 2 (Internal Use Only). Verteilung beschränkt.'],
    ],
    versions: [
      { version: 'v1.0', datum: '02.04.2014', autor: 'Payment Ops Lead', change: 'Erstfassung im Rahmen SEPA-Migration' },
      { version: 'v2.0', datum: '15.08.2018', autor: 'M. Schenk',         change: 'PSD2-Umsetzung (Strong Customer Authentication)' },
      { version: 'v3.0', datum: '20.05.2020', autor: 'M. Schenk / Compliance', change: 'EU 2015/847 Transferverordnung; FATF Travel Rule' },
      { version: 'v4.0', datum: '18.09.2022', autor: 'T. Hoffmann',       change: 'SWIFT-CSP-Anforderungen (CSCF) eingebaut' },
      { version: 'v5.0', datum: '22.01.2024', autor: 'T. Hoffmann / DSGV', change: 'DORA-Vorbereitung: IKT-Risikomanagement' },
      { version: 'v5.1', datum: '06.06.2024', autor: 'T. Hoffmann',       change: 'Neue Sanktionspakete EU XV; AML-Filter-Konfig' },
      { version: 'v6.0', datum: today,        autor: 'T. Hoffmann',       change: 'SEPA-Instant-Pflicht für ausgehende Zahlungen ab 09.10.2025' },
    ],
    approval: 'Vorstand Operations (Herr Dr. T. Eichhorn)\nGesamtvorstand · Sitzung Q1/2026',
    scope: 'Konzern (Hauptniederlassung + Filialen DE/AT/LU)\nAusgenommen: Konzern-Treasury (eigene Anweisung)',
  });

  // =========================== Inhaltsverzeichnis ============================
  addTableOfContents(state, [
    { no: '1',   title: 'Geltungsbereich, Zweck und Adressaten', page: 3, level: 1 },
    { no: '2',   title: 'Begriffsbestimmungen', page: 4, level: 1 },
    { no: '3',   title: 'Rechtsgrundlagen und Bezugsdokumente', page: 5, level: 1 },
    { no: '4',   title: 'Organisatorische Rahmenbedingungen', page: 6, level: 1 },
    { no: '5',   title: 'Auftragsannahme', page: 7, level: 1 },
    { no: '5.1', title: 'Kanäle und unterstützte Schemata', page: 7, level: 2 },
    { no: '5.2', title: 'Erforderliche Auftragsdaten', page: 8, level: 2 },
    { no: '5.3', title: 'Cut-off-Times', page: 8, level: 2 },
    { no: '6',   title: 'Plausibilitätsprüfung', page: 9, level: 1 },
    { no: '7',   title: 'Embargo- und Sanktionsfilter', page: 10, level: 1 },
    { no: '7.1', title: 'Filterkonfiguration und Listen', page: 10, level: 2 },
    { no: '7.2', title: 'Treffer-Disposition', page: 11, level: 2 },
    { no: '7.3', title: 'FIU-Meldung', page: 11, level: 2 },
    { no: '8',   title: 'Limit- und Liquiditätsprüfung', page: 12, level: 1 },
    { no: '9',   title: 'Freigabe und Mehraugen-Prinzip', page: 13, level: 1 },
    { no: '10',  title: 'Clearing und Settlement', page: 14, level: 1 },
    { no: '10.1',title: 'SEPA Credit Transfer / Instant', page: 14, level: 2 },
    { no: '10.2',title: 'SEPA Direct Debit', page: 14, level: 2 },
    { no: '10.3',title: 'SWIFT MT103/MT202 und MX', page: 15, level: 2 },
    { no: '10.4',title: 'TARGET2 und CLS', page: 15, level: 2 },
    { no: '11',  title: 'Reconciliation und Buchung', page: 16, level: 1 },
    { no: '12',  title: 'Reporting an Bundesbank und BaFin', page: 17, level: 1 },
    { no: '13',  title: 'Eskalation, Notfall und DORA-Bezug', page: 18, level: 1 },
    { no: '14',  title: 'Fraud-Prävention', page: 19, level: 1 },
    { no: '15',  title: 'Anhänge', page: 20, level: 1 },
  ]);

  // =========================== Kapitel 1 ====================================
  addH1(state, '1. Geltungsbereich, Zweck und Adressaten');
  addParagraph(state, 'Dieses Operations-Handbuch regelt die Bearbeitung eingehender und ausgehender Zahlungen über die Schemata SEPA Credit Transfer (SCT), SEPA Instant Credit Transfer (SCT Inst), SEPA Direct Debit (SDD CORE/B2B) sowie über SWIFT (MT103, MT202, MT202 COV, MX pacs.008, pacs.009). Es gilt für alle Mitarbeitenden der Payment Operations sowie aller angeschlossenen Bereiche, die im Auftragsworkflow tätig sind.');
  addCallout(state, 'warn', 'SEPA-Instant-Pflicht',
    'Mit Inkrafttreten der Instant-Payment-Verordnung gemäß Verordnung (EU) 2024/886 ist die Annahme eingehender SCT-Inst-Zahlungen seit dem 09.01.2025 und das Versenden seit dem 09.10.2025 für alle Zahlungsdienstleister im Euroraum verpflichtend. Eine Umsatzschwelle oder Pricing-Differenz gegenüber dem Standard-SCT ist unzulässig.'
  );
  addParagraph(state, 'Privatkundengeschäft, Geldautomatentransaktionen sowie kartengebundene Zahlungen sind nicht im Geltungsbereich; sie unterliegen den jeweils dezidierten Anweisungen KA-RET-22 (Retail-Karten) und ATM-OPS-04.');

  // =========================== Kapitel 2 ====================================
  addH1(state, '2. Begriffsbestimmungen');
  addTable(state, [
    { label: 'Begriff', width: 2 },
    { label: 'Definition', width: 5 },
  ], [
    ['IBAN',                'International Bank Account Number gemäß ISO 13616.'],
    ['BIC',                 'Business Identifier Code gemäß ISO 9362; ab 2026 in SEPA optional.'],
    ['SCT / SCT Inst',      'SEPA Credit Transfer Scheme bzw. Instant Variante; Settlement < 10 Sekunden.'],
    ['SDD CORE / B2B',      'SEPA Direct Debit Schemes für Verbraucher (CORE) bzw. Geschäftskunden (B2B).'],
    ['pacs.008 / pacs.009', 'ISO-20022-Nachrichtentypen für Zahlungen (Customer Credit Transfer / Financial Institution Credit Transfer).'],
    ['STP',                 'Straight-Through-Processing — vollautomatische Verarbeitung ohne manuelle Eingriffe.'],
    ['Cut-off-Time',        'Annahmeschluss im jeweiligen Clearing-Zyklus; Aufträge danach werden auf den nächsten Zyklus geplant.'],
    ['Embargo-Filter',      'Echtzeit-Screening gegen EU-, OFAC-, UN- und nationale Sanktionslisten.'],
    ['Travel Rule',         'Pflicht zur Übermittlung vollständiger Auftraggeber- und Empfängerinformationen gemäß VO (EU) 2015/847.'],
    ['CSDR-Penalty',        'Strafzahlung für Settlement Fails gemäß CSDR Art. 7.'],
  ]);

  // =========================== Kapitel 3 ====================================
  addH1(state, '3. Rechtsgrundlagen und Bezugsdokumente');
  addBullets(state, [
    'Richtlinie (EU) 2015/2366 (PSD2) und nationale Umsetzung im Zahlungsdiensteaufsichtsgesetz (ZAG).',
    'Verordnung (EU) 2024/886 — Instant Payments Regulation.',
    'EPC Rulebooks SCT 2025, SCT Inst 2025, SDD CORE 2024, SDD B2B 2024.',
    'Verordnung (EU) 2015/847 — Begleitinformationen bei Geldtransfers (Travel Rule).',
    'EU-Sanktionsverordnungen (insbesondere VO (EU) 833/2014, 269/2014, 765/2006 mit jeweiligen Anpassungen); OFAC SDN-Liste; UN-Konsolidierte Liste.',
    'GwG §§ 4-13a sowie § 43; KWG § 25h.',
    'MaRisk AT 7.2 (technisch-organisatorische Ausstattung), AT 7.3 (Notfallmanagement), AT 9 (Auslagerung).',
    'Verordnung (EU) 2022/2554 (DORA): IKT-Risikomanagement, Vorfallsmeldung, Auslagerung.',
    'SWIFT Customer Security Programme (CSP) — CSCF v2026; pflichtige Independent Attestation.',
    'ECB-Leitlinie zu TARGET2 und T2S-Migration.',
    'Bundesbank Außenwirtschaftsverordnung (AWV) — Meldepflichten.',
  ]);

  // =========================== Kapitel 4 ====================================
  addH1(state, '4. Organisatorische Rahmenbedingungen');
  addParagraph(state, 'Die Funktionstrennung erfolgt entlang der Three-Lines-of-Defense. Wesentliche Rollen sind: Payment Operations Sachbearbeiter (Erfassung, Vorprüfung), Teamleiter Payment Operations (Freigabe ab Schwellen), Sanktionsanalyst (2nd Line, Compliance), AML-Officer, Operational Risk Manager sowie der unabhängige SWIFT-CSP-Verantwortliche (Information Security).');
  addTable(state, [
    { label: 'Rolle', width: 2 },
    { label: 'LoD', width: 1 },
    { label: 'Wesentliche Verantwortung', width: 5 },
  ], [
    ['Sachbearbeiter Ops',          '1st', 'Annahme, Plausibilität, Erfassung im Payment-Hub PH-2025.'],
    ['Teamleiter Ops',              '1st', 'Vier-Augen-Freigabe ab 100 TEUR; Eskalation an Compliance.'],
    ['Sanktionsanalyst',            '2nd', 'Bearbeitung und Auflösung von Filtertreffern, Doku im Case-Management.'],
    ['AML-Officer',                 '2nd', 'Verdachtsmomente, FIU-Meldung, KYC-Klärungen.'],
    ['Operational Risk Manager',    '2nd', 'IKS-Steuerung, Vorfallsmanagement, Schadensdatenbank.'],
    ['CISO / SWIFT-CSP-Officer',    '2nd', 'SWIFT-CSCF-Compliance, Schlüsselverwaltung, Penetrationstests.'],
    ['Interne Revision',            '3rd', 'Unabhängige Prüfung, mindestens dreijährlich Vollumfangsprüfung.'],
  ]);

  // =========================== Kapitel 5 ====================================
  addH1(state, '5. Auftragsannahme');

  addH2(state, '5.1 Kanäle und unterstützte Schemata');
  addBullets(state, [
    'Online-Banking Privat- und Firmenkunden (Web/App) — SCT, SCT Inst, SDD-Mandatsverwaltung.',
    'Firmenkundenportal (EBICS T/EBICS BTU) — Massen-SCT, Auslandsüberweisungen (SWIFT MT103/MX).',
    'API-Zugang (PSD2-AISP/PISP-konform) — autorisierte Drittanbieter, mit SCA-Authentifizierung.',
    'Filiale (Schalter) — Einzelaufträge mit Identifikation gemäß § 13 GwG; Vier-Augen.',
    'SWIFTNet — Korrespondenzbankgeschäft, FI-to-FI (MT202, MT202 COV, MX pacs.009).',
  ]);

  addH2(state, '5.2 Erforderliche Auftragsdaten');
  addParagraph(state, 'Für die ordnungsgemäße Bearbeitung sind unabhängig vom Annahmekanal mindestens die folgenden Angaben erforderlich. Bei unvollständigen Daten gemäß VO (EU) 2015/847 ist der Auftrag abzulehnen bzw. an die anweisende Stelle zur Vervollständigung zurückzugeben.');
  addBullets(state, [
    'Auftraggeber: Name, IBAN, BIC (sofern erforderlich), Anschrift gemäß Travel Rule.',
    'Empfänger: Name, IBAN; bei Auslandsüberweisungen vollständige Anschrift; bei Drittländern Identifikator (z. B. LEI bei juristischen Personen).',
    'Betrag und Währung; bei SDD zusätzlich Mandatsreferenz, Mandatsdatum, Creditor Identifier.',
    'Verwendungszweck (max. 140 Zeichen für SEPA, 4×35 Zeichen für SWIFT MT103); ISO 20022 erlaubt erweiterte Felder.',
    'Bei SWIFT zusätzlich: Charge Bearer (OUR/SHA/BEN), Spesenklausel, ggf. Korrespondenzbank-Information.',
  ]);

  addH2(state, '5.3 Cut-off-Times');
  addTable(state, [
    { label: 'Scheme', width: 2 },
    { label: 'Cut-off (CET)', width: 1.5 },
    { label: 'Settlement', width: 1.5 },
    { label: 'Anmerkung', width: 3 },
  ], [
    ['SCT Standard',     '14:30',       'D+0 / D+1', 'Wertstellung am gleichen TARGET-Tag bei Eingang vor 14:30.'],
    ['SCT Instant',      '24/7 365',    '< 10 Sek.',  'Kein Cut-off; Maximalbetrag 100 TEUR (ab 2025 keine Schwelle).'],
    ['SDD CORE Erst-LE', 'D-5',         'D+0',        'Pre-Notification 14 Tage; Erst-Lastschriften 5 TARGET-Tage Vorlauf.'],
    ['SDD CORE Folge',   'D-2',         'D+0',        'Folgelastschriften 2 TARGET-Tage Vorlauf.'],
    ['SDD B2B',          'D-1',         'D+0',        'B2B-Mandate; keine Rückgaberechte für Schuldner.'],
    ['SWIFT MT103',      '17:00',       'Same-day FX','Zeitzonenbezug; höhere Zeitfenster für Asien-/Amerika-Korridor.'],
    ['TARGET2',          '17:45 (DvP)', 'Real-Time',  '18:00 für Kunden; 19:00 EOD; Closing day 19:00.'],
  ]);

  // =========================== Kapitel 6 ====================================
  addH1(state, '6. Plausibilitätsprüfung');
  addParagraph(state, 'Die Plausibilitätsprüfung erfolgt vollautomatisch im Payment-Hub PH-2025 bei Auftragsannahme. Verstöße führen zu einem Hard-Stop und werden im Order-Cockpit dem Sachbearbeiter zur Klärung vorgelegt. Soft-Warnings werden dokumentiert und im weiteren Workflow als Hinweis weitergeleitet.');
  addNumberedList(state, [
    'IBAN-Prüfung: ISO 13616 inklusive länderspezifischer Validierung (Prüfziffer, Länge).',
    'BIC-Validierung gegen die SWIFT BIC-Datenbank (täglicher Refresh).',
    'Beneficiary-Name-Matching: Abgleich des Empfängernamens mit den IBAN-Stammdaten (Confirmation of Payee, ab 09.10.2025 Pflicht für ausgehende SEPA).',
    'Plausibilität des Verwendungszwecks: regelbasierte Prüfung auf verbotene Zeichen, Phishing-Muster, regulatorisch unzulässige Inhalte.',
    'Schwellenwerte je Auftraggeber: Tageslimit, Monatslimit, Einzelauftragslimit; Überschreitungen werden zur Genehmigung eskaliert.',
    'Duplikatserkennung: gleicher Betrag + gleicher Empfänger innerhalb 60 Minuten erzeugt Soft-Warning.',
    'Quittungserstellung: bei Erfolg automatische Quittung an Kunden; bei Soft-Warning Hinweis ohne Vollzugsverhinderung.',
  ]);

  // =========================== Kapitel 7 ====================================
  addH1(state, '7. Embargo- und Sanktionsfilter');

  addH2(state, '7.1 Filterkonfiguration und Listen');
  addParagraph(state, 'Der Sanktionsfilter ist als Echtzeit-Stop-Filter zwischen Auftragsannahme und Clearing geschaltet. Vor jeder Auftragsweiterleitung erfolgt ein vollständiger Abgleich gegen folgende Listen:');
  addBullets(state, [
    'EU-Sanktionsverordnungen — konsolidierte Liste der EU-Kommission, tägliches Update um 06:00 CET.',
    'OFAC SDN (Specially Designated Nationals) — Update mehrfach täglich.',
    'UN-Konsolidierte Sanktionsliste — wöchentliches Update.',
    'Nationale Listen (BMF / FIU-Verzeichnis, Bundesbank-Beschränkungen).',
    'Institutsinterne Watchlist (PEPs, hochrisikobehaftete Kunden, eigene Verdachtsfälle).',
  ]);
  addParagraph(state, 'Der Filter arbeitet mit Fuzzy-Matching (Edit-Distance, Soundex, Transliteration für kyrillische und arabische Namen). Match-Schwellen sind konfigurierbar; Standardwert: ≥ 85 % Namensähnlichkeit oder vollständige Identifier-Übereinstimmung (LEI, Geburtsdatum, Adresse).');

  addH2(state, '7.2 Treffer-Disposition');
  addParagraph(state, 'Jeder Treffer führt zu einer sofortigen Stoppung des Auftrags und Routing in die Sanctions-Disposition-Queue. Der Treffer wird im Case-Management binnen 4 Stunden durch einen geschulten Sanktionsanalysten geprüft und mit einer der folgenden Endklassifizierungen versehen: false positive, treffer/Klärung erforderlich oder echter Treffer mit Sperrwirkung.');
  addCallout(state, 'risk', 'Achtung Echter Sanktionstreffer',
    'Echte Sanktionstreffer dürfen unter keinen Umständen ausgeführt werden. Die Auftragssumme ist zu sperren, das Konto darf nicht belastet werden. Innerhalb von 48 Stunden ist eine Anzeige bei der Deutschen Bundesbank (zuständige Stelle gemäß § 18 Außenwirtschaftsgesetz) zu erstatten. Eine taggleiche Information an Compliance und Vorstand ist verpflichtend.'
  );

  addH2(state, '7.3 FIU-Meldung');
  addParagraph(state, 'Bei Verdacht auf Geldwäsche, Terrorismusfinanzierung oder sonstige strafbare Handlungen erstellt der AML-Officer eine Verdachtsmeldung an die FIU gemäß § 43 GwG. Die Meldung ist über das Meldeportal goAML einzureichen; eine Kopie verbleibt im Case-Management mit Aufbewahrungsfrist von zehn Jahren.');

  // =========================== Kapitel 8 ====================================
  addH1(state, '8. Limit- und Liquiditätsprüfung');
  addParagraph(state, 'Die Limit- und Liquiditätsprüfung erfolgt in Echtzeit unmittelbar vor der finalen Freigabe. Geprüft werden: Verfügungsrahmen Kunde, Kontoguthaben unter Berücksichtigung disponibler Linien, Konzernlimits, Intraday-Liquidität in den verschiedenen Währungs- und Settlement-Korridoren.');
  addTable(state, [
    { label: 'Limit-Typ', width: 2 },
    { label: 'Schwelle', width: 2 },
    { label: 'Maßnahme bei Verletzung', width: 4 },
  ], [
    ['Kunden-Tageslimit',           'individuell (CRM)',  'Hard-Stop; Klärung mit FKB.'],
    ['Kontoguthaben + Linie',       '0',                  'Soft-Warn ab -90 %, Hard-Stop ab 0; Eskalation an Kreditbetreuung.'],
    ['Konzern-Tageslimit Kund/KNE', 'gem. Kreditakte',    'Hard-Stop; Sondergenehmigung Kreditkomitee.'],
    ['Intraday-Liquidität TARGET2', 'Reserve > 50 Mio.',  'Throttling bei < 50 Mio.; Eskalation Treasury.'],
    ['Korrespondenzbank-Nostro',    'gem. Kontrakt',      'Routing-Wechsel zur Backup-Korrespondenzbank.'],
  ]);

  // =========================== Kapitel 9 ====================================
  addH1(state, '9. Freigabe und Mehraugen-Prinzip');
  addParagraph(state, 'Die Freigabe folgt einem gestuften Mehraugen-Verfahren in Abhängigkeit von Betrag, Empfängerland und Risikoklasse des Auftrags. Stellvertretungsregelungen sind im Berechtigungsmanagement-System BMS hinterlegt; ein Sachbearbeiter kann sich nicht selbst freigeben.');
  addTable(state, [
    { label: 'Auftragstyp / Betrag', width: 3 },
    { label: 'Freigabestufe', width: 3 },
    { label: 'Anmerkung', width: 3 },
  ], [
    ['SCT bis 25 TEUR',                   '2-Augen (autom. Workflow)',           'STP; keine zusätzliche Person.'],
    ['SCT 25 TEUR bis 100 TEUR',          '4-Augen (Sachbearbeiter + TL)',       'Genehmigung in PH-2025.'],
    ['SCT 100 TEUR bis 1 Mio.',           '4-Augen (TL + Bereichsleitung)',      'Mit Begründung.'],
    ['SCT > 1 Mio. oder Sanktionsland',   '6-Augen (TL + BL + Compliance-Officer)','Telefon-Rückverifikation Pflicht.'],
    ['SWIFT MT103 bis 500 TEUR',          '4-Augen (Specialist + TL)',           'Charge-Bearer dokumentiert.'],
    ['SWIFT MT103 > 500 TEUR',            '6-Augen (Specialist + TL + Vorstand-Stellv.)','Pre-Approval erforderlich.'],
    ['SWIFT MT202 (Korrespondenz)',       '4-Augen (Specialist + Treasury-Rep)', 'Settlement nur über CSCF-konforme Channels.'],
  ]);

  // =========================== Kapitel 10 ===================================
  addH1(state, '10. Clearing und Settlement');

  addH2(state, '10.1 SEPA Credit Transfer / Instant');
  addParagraph(state, 'SCT-Aufträge werden in Batches an das Clearing-Verfahren (RT1 / STEP2) übertragen. SCT-Inst-Aufträge werden in Einzeltransaktionen über RT1 oder TIPS abgewickelt. Die maximale Verarbeitungszeit beträgt 10 Sekunden vom Auftraggeber bis zur Verfügbarkeit beim Empfänger. Die Verfügbarkeitsanforderung beträgt 99,9 % (TIPS) bzw. 99,7 % (RT1), nichtverfügbare Zeiten sind im DORA-Vorfallsmanagement zu erfassen.');

  addH2(state, '10.2 SEPA Direct Debit');
  addParagraph(state, 'Lastschriften erfordern ein gültiges SEPA-Mandat. Erstlastschriften (CORE) sind mit Pre-Notification 14 Tage vor Fälligkeit anzukündigen. Folgelastschriften benötigen 2 TARGET-Tage Vorlauf, B2B-Lastschriften 1 TARGET-Tag. Rückgaberechte: Schuldner CORE 8 Wochen unbegründet, 13 Monate bei fehlendem Mandat. B2B: kein Rückgaberecht.');
  addCallout(state, 'info', 'Mandatsverwaltung',
    'Mandate werden im Mandatsmodul MM-22 verwaltet. Bei Mandatsänderungen (z. B. Kontowechsel) ist ein Mandatswechsel-Lauf zwingend; bei Annahmeverweigerungen 36 Monate keine erneute Einreichung ohne neue Mandatserteilung.'
  );

  addH2(state, '10.3 SWIFT MT103/MT202 und MX');
  addParagraph(state, 'SWIFT-Nachrichten werden über zertifizierte Gateways gesendet. Authentizität und Integrität werden über SWIFT-Authentication-Codes (FIN) bzw. Signaturen (ISO 20022 MX) gesichert. Korrespondenzbanken sind im Korrespondenzbankregister KR-2026 mit aktuellen Bonitätsbewertungen, KYC-Status und Settlement-Capacity hinterlegt.');

  addH2(state, '10.4 TARGET2 und CLS');
  addParagraph(state, 'TARGET2 wickelt Großbetrags-Zahlungen in Echtzeit ab (Real-Time Gross Settlement). Die CLS-Bank wickelt Fremdwährungs-Zahlungen Payment-versus-Payment ab; eingebundene Währungen sind durch die Trefferliste TR-FX gepflegt. Die Liquiditätsmanagement-Schnittstelle wird stündlich aktualisiert.');

  // =========================== Kapitel 11 ===================================
  addH1(state, '11. Reconciliation und Buchung');
  addParagraph(state, 'Die Buchung erfolgt unverzüglich nach Settlement-Bestätigung im zentralen Buchhaltungssystem. Reconciliation umfasst: Abstimmung Auftragsbestand (vorgemerkt vs. gebucht), Nostro/Vostro-Abstimmung gegen Korrespondenzbank-Auszüge, Abgleich Settlement-Reports gegen interne Bestände.');
  addBullets(state, [
    'Tägliche EOD-Abstimmung der Nostro-Konten gegen die SWIFT MT940/MT942.',
    'Wöchentliche Abstimmung der Sammelkonten gegen ein gleitendes 30-Tage-Reporting.',
    'Monatliche Saldenabgleichung gegen externe Korrespondenzbankberichte.',
    'Abweichungs-Klärung innerhalb 5 Werktagen; ungeklärte Differenzen ab 1 TEUR Eskalation an Operational Risk.',
  ]);

  // =========================== Kapitel 12 ===================================
  addH1(state, '12. Reporting an Bundesbank und BaFin');
  addBullets(state, [
    'AnaCredit-Reporting — monatlich, Frist 30 Werktage nach Monatsende.',
    'AWV-Meldung — bei grenzüberschreitenden Zahlungen über 12.500 EUR, monatlich.',
    'Zahlungsstatistik (Bundesbank ZahlStat) — quartalsweise.',
    'Vorfallsmeldung an BaFin gemäß DORA Art. 19 — bei wesentlichen IKT-Vorfällen innerhalb 4 Stunden Initial-Notification, 72 Stunden Intermediate-Report.',
    'Erstmeldung Datenpannen DSGVO an LDSB innerhalb 72 Stunden.',
  ]);

  // =========================== Kapitel 13 ===================================
  addH1(state, '13. Eskalation, Notfall und DORA-Bezug');
  addParagraph(state, 'Eskalations- und Notfallprozesse folgen dem DORA-Rahmenwerk und dem internen BCM-Handbuch. Wesentliche Ereignisse sind innerhalb 4 Stunden zu erfassen; klassifiziert wird nach Kritikalitätsstufe S1 (existenzbedrohend), S2 (wesentlich), S3 (signifikant), S4 (gering).');
  addTable(state, [
    { label: 'Vorfall', width: 3 },
    { label: 'Kritikalität', width: 1 },
    { label: 'Reaktion', width: 4 },
  ], [
    ['Ausfall Payment-Hub > 30 Min.',  'S1', 'BCM-Alarm; Failover zu Backup-RZ; Vorstand-Info.'],
    ['Ausfall SWIFT-Connectivity',     'S1', 'Backup-Channel aktivieren; Treasury alarmieren.'],
    ['Hoher Anteil Settlement Fails',  'S2', 'Root-Cause-Analyse; Eskalation EBA-Reporting.'],
    ['Massenhaft False-Positive-Treffer','S2','Filter-Re-Tuning; Compliance involvieren.'],
    ['Phishing-/Fraud-Welle',          'S2', 'Fraud-Team-Aktivierung; Kundeninformation prüfen.'],
    ['Vereinzelter Settlement Fail',   'S3', 'Standard-Klärung; Penalty-Erfassung CSDR.'],
  ]);

  // =========================== Kapitel 14 ===================================
  addH1(state, '14. Fraud-Prävention');
  addParagraph(state, 'Die Fraud-Prävention umfasst regelbasierte und ML-basierte Anomalie-Erkennung, Verhaltensanalytik der Kundenkonten, Telefon-Rückverifikation bei Großbeträgen sowie Strong Customer Authentication (SCA) gemäß PSD2.');
  addBullets(state, [
    'Echtzeit-Scoring jedes Auftrags über Anti-Fraud-Engine; Score > 80 löst Step-up-Auth aus.',
    'Telefon-Rückruf-Pflicht ab 250 TEUR Einzelauftrag bei kurzfristig geänderten Empfängerkonten.',
    'Quartalsweise Phishing-Simulationen für interne und externe Mitarbeitende.',
    'Schulung „Account Takeover" jährlich verpflichtend für alle Ops-Mitarbeitenden.',
    'CEO-Fraud-Awareness-Briefings für Firmenkundenbetreuer mit Eskalations-Hotline.',
  ]);

  // =========================== Kapitel 15 ===================================
  addH1(state, '15. Anhänge');
  addBullets(state, [
    'Anhang 1: Cut-off-Times pro Scheme und Korridor (vollständige Matrix)',
    'Anhang 2: Sanktionslisten-Update-Protokoll (Standard-Form)',
    'Anhang 3: Eskalationskontakte rund um die Uhr (24×7-Rufbereitschaft)',
    'Anhang 4: SWIFT-CSCF-Kontrollkatalog Mapping (CSCF v2026)',
    'Anhang 5: Standard-Vorlage Vorfallsmeldung an BaFin (DORA Art. 19)',
    'Anhang 6: Glossar ISO-20022-Nachrichtentypen',
  ]);

  finalize(state);
  doc.save(`Operations-Handbuch_Zahlungsverkehr_${docId}.pdf`);
}
