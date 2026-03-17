// W1: Tim Keller
export const W1 = {
  name: 'Tim Keller', id: 'VV00001', alter: 62,
  beruf: 'Unternehmer Maschinenbau 3.Gen', arbeitgeber: { name: 'Keller Maschinenbau GmbH & Co. KG', quelle: 'linkedin', bestaetigt: true }, nettoeinkommen: 25000,
  familienstand: 'verheiratet',
  partner: { name: 'Elisabeth', beruf: 'Stiftungsvorstand', einkommen: 0 },
  kinder: [{ name: 'Charlotte', alter: 32 }, { name: 'Friedrich', alter: 28 }],
  wohnsituation: 'Eigentum', wohnflaeche: 450, adresse: 'Taunusanlage 12, 60325 Frankfurt am Main',
  nps: 9, risikoscore: 12, potentialScore: 5.0, abwanderungsrisiko: 'niedrig',
  mandatsTyp: 'FairValue',
  aum: 12500000,
  eigeneProdukte: [
    { typ: 'mandat', sparte: 'vv', produkt: 'FairValue Mandat', details: 'Konservativ-Ausgewogen, ESG-Filter', praemie: 0, seit: '2018-01', status: 'aktiv', volumen: 12500000 },
  ],
  fremdProdukte: [
    { typ: 'depot', institut: 'UBS', details: 'Gemischtes Mandat', volumen: 2800000, consent: true },
    { typ: 'cash', institut: 'Deutsche Bank', details: 'Festgeld/Tagesgeld', volumen: 400000, consent: true },
    { typ: 'immobilien', institut: 'Privat', details: 'EFH + 2 MFH + Gewerbe', volumen: 3650000, consent: false },
    { typ: 'gmbh', institut: 'Eigene', details: 'Maschinenbau GmbH 3.Gen', volumen: 4500000, consent: false },
    { typ: 'lv', institut: 'Alte Leipziger', details: 'Ablauf 2026, RKW 320k', volumen: 320000, consent: true },
  ],
  potentiale: [
    { titel: 'UBS-Konsolidierung 3,2M', typ: 'konsolidierung', quellen: ['finanztransaktion'], prioritaet: 'hoch', volumen: 3200000, volumenTyp: 'einmalig', beschreibung: '2,8M UBS + 400k DB Cash. Konsolidierung ins FairValue Mandat.', empfohleneAktion: 'termin_vereinbaren', produktEmpfehlung: 'FairValue Erweiterung', status: 'angeschrieben', herleitung: [{ label: 'Datenquelle', value: 'Consent-Abfrage UBS + Deutsche Bank' }, { label: 'UBS Depotvolumen', value: '2.800.000 \u20AC (Gemischtes Mandat)' }, { label: 'DB Cash-Bestand', value: '400.000 \u20AC (Festgeld/Tagesgeld)' }, { label: 'UBS Kostenquote (gesch\u00E4tzt)', value: '1,35% p.a. (inkl. Transaktionskosten)' }, { label: 'HRK LUNIS FairValue Kosten', value: '0,85% p.a. (All-in-Fee)' }, { label: 'J\u00E4hrliche Ersparnis', value: 'ca. 16.000 \u20AC bei 3,2M Volumen' }, { label: 'Empfehlung', value: 'Konsolidierung ins FairValue Mandat \u2013 Kostenvorteil + einheitliches Reporting' }], vergleich: { titel: 'Vergleich: UBS Mandat vs. HRK LUNIS FairValue', spalten: ['Merkmal', 'UBS Gemischtes Mandat', 'HRK LUNIS FairValue'], zeilen: [{ merkmal: 'Kostenquote p.a.', aktuell: '1,35%', angebot: '0,85%', highlight: true }, { merkmal: 'Mindestvolumen', aktuell: '500.000 \u20AC', angebot: '3.000.000 \u20AC', highlight: false }, { merkmal: 'Reporting', aktuell: 'Quartalsweise, separates Portal', angebot: 'Monatlich, konsolidiert mit Bestand', highlight: true }, { merkmal: 'ESG-Integration', aktuell: 'Basis-Screening', angebot: 'Art.8 mit Upgrade-Option Art.9', highlight: true }, { merkmal: 'Pers\u00F6nlicher Berater', aktuell: 'Relationship Manager (Rotation)', angebot: 'Fester Senior Berater', highlight: false }, { merkmal: 'PE-Zugang', aktuell: 'Ab 1M, limitiert', angebot: 'Direkt-Co-Investments m\u00F6glich', highlight: true }] } },
    { titel: 'NextGen Tochter Charlotte', typ: 'nextgen', quellen: ['lebensereignis'], prioritaet: 'hoch', volumen: 0, volumenTyp: 'vermittlung', beschreibung: 'Charlotte (32), Anwältin, eigenes Vermögen ca. 800k. SmartValue Mandat.', empfohleneAktion: 'termin_vereinbaren', produktEmpfehlung: 'SmartValue Mandat', status: 'identifiziert', herleitung: [{ label: 'Datenquelle', value: 'Mandantengespr\u00E4ch + LinkedIn-Profil' }, { label: 'Name / Alter', value: 'Charlotte Keller, 32 Jahre' }, { label: 'Beruf', value: 'Anw\u00E4ltin, Partnerin bei Wirtschaftskanzlei (Frankfurt)' }, { label: 'Gesch\u00E4tztes Eigenverm\u00F6gen', value: 'ca. 800.000 \u20AC (Ersparnisse + Bonuszahlungen)' }, { label: 'Familienkontext', value: '\u00C4lteste Tochter, potenzielle Erbin Familienunternehmen' }, { label: 'Empfehlung', value: 'SmartValue Mandat (ab 250k) \u2013 eigene Verm\u00F6gensverwaltung aufbauen' }] },
    { titel: 'Nachfolge Maschinenbau GmbH', typ: 'beratung', quellen: ['lebensereignis'], prioritaet: 'hoch', volumen: 0, volumenTyp: 'vermittlung', beschreibung: 'Friedrich (28) als Nachfolger? Firmenbewertung, Steuerplanung.', empfohleneAktion: 'termin_vereinbaren', produktEmpfehlung: 'Nachfolgeberatung', status: 'termin', herleitung: [{ label: 'Datenquelle', value: 'Mandantengespr\u00E4ch + Handelsregister' }, { label: 'Nachfolger', value: 'Friedrich Keller, 28 Jahre, derzeit im Unternehmen t\u00E4tig' }, { label: 'Unternehmen', value: 'Keller Maschinenbau GmbH & Co. KG, 3. Generation' }, { label: 'Gesch\u00E4tzte Firmenbewertung', value: 'ca. 4.500.000 \u20AC (EBITDA-Multiple)' }, { label: 'Zeitrahmen', value: '\u00DCbergabe in 3\u20135 Jahren geplant (Tim dann 65\u201367)' }, { label: 'Steuerliche Aspekte', value: 'Betriebsverm\u00F6gensfreibetrag, Verschonungsabschlag pr\u00FCfen' }, { label: 'Empfehlung', value: 'Nachfolgeberatung mit Steuer- und Rechtspartner koordinieren' }] },
    { titel: 'Stiftung gründen', typ: 'beratung', quellen: ['lebensereignis'], prioritaet: 'mittel', volumen: 2000000, volumenTyp: 'einmalig', beschreibung: 'Elisabeth engagiert sich sozial. Familienstiftung prüfen.', empfohleneAktion: 'termin_vereinbaren', produktEmpfehlung: 'Stiftungsmandat', status: 'identifiziert', herleitung: [{ label: 'Datenquelle', value: 'Mandantengespr\u00E4ch mit Elisabeth Keller' }, { label: 'Initiatorin', value: 'Elisabeth Keller, Stiftungsvorstand (ehrenamtlich aktiv)' }, { label: 'Soziales Engagement', value: 'Bildungsprojekte + regionale F\u00F6rderung seit \u00FCber 10 Jahren' }, { label: 'Geplantes Stiftungskapital', value: 'ca. 2.000.000 \u20AC aus Privatverm\u00F6gen' }, { label: 'Steuerliche Vorteile', value: 'Sonderausgabenabzug bis 1M im Gr\u00FCndungsjahr, laufende Zuwendungen' }, { label: 'Empfehlung', value: 'Familienstiftung pr\u00FCfen \u2013 Stiftungsmandat bei HRK LUNIS f\u00FCr Kapitalanlage' }] },
    { titel: 'LV-Ablauf 2026 Wiederanlage', typ: 'konsolidierung', quellen: ['bestand', 'finanztransaktion'], prioritaet: 'hoch', volumen: 320000, volumenTyp: 'einmalig', beschreibung: 'Alte Leipziger LV läuft 2026 ab. Ins Mandat einbringen.', empfohleneAktion: 'termin_vereinbaren', produktEmpfehlung: 'FairValue Erweiterung', status: 'termin', herleitung: [{ label: 'Datenquelle', value: 'Consent-Abfrage Alte Leipziger' }, { label: 'Versicherer', value: 'Alte Leipziger Lebensversicherung' }, { label: 'R\u00FCckkaufswert (RKW)', value: '320.000 \u20AC (Ablauf 2026)' }, { label: 'Ablauftermin', value: 'Q3/Q4 2026 \u2013 zeitnahes Handeln erforderlich' }, { label: 'Steuerliche Behandlung', value: 'Vertrag vor 2005: steuerfrei bei Auszahlung nach 12 Jahren' }, { label: 'Wiederanlage-Rendite FairValue', value: 'Zielrendite 5\u20137% p.a. vs. 0% bei Kontoguthaben' }, { label: 'Empfehlung', value: 'Ablaufsumme direkt ins FairValue Mandat einbringen' }] },
    { titel: 'ESG-Upgrade Portfolio', typ: 'anpassung', quellen: ['bestand'], prioritaet: 'mittel', volumen: 0, volumenTyp: 'vermittlung', beschreibung: 'ESG-Score 68, Ziel >80. Art.8 auf Art.9 upgraden.', empfohleneAktion: 'angebot_erstellen', produktEmpfehlung: 'ESG Art.9 Mandat', status: 'identifiziert', herleitung: [{ label: 'Datenquelle', value: 'Portfolio-Analyse ESG-Scoring' }, { label: 'Aktueller ESG-Score', value: '68 von 100 (Art.8 Mandat)' }, { label: 'Ziel-ESG-Score', value: '>80 (Art.9 Konformit\u00E4t)' }, { label: 'Problempositionen', value: '3 Titel mit ESG-Score <50 (Energie, Grundstoffe)' }, { label: 'Elisabeth-Faktor', value: 'Stiftungsengagement erh\u00F6ht Affinit\u00E4t f\u00FCr Nachhaltigkeit' }, { label: 'Empfehlung', value: 'Upgrade auf Art.9 Mandat \u2013 Nachhaltigkeitsziel + Rendite vereinbar' }], vergleich: { titel: 'Vergleich: Art.8 vs. Art.9 Mandat', spalten: ['Merkmal', 'Art.8 (aktuell)', 'Art.9 (empfohlen)'], zeilen: [{ merkmal: 'ESG-Strategie', aktuell: 'Ausschl\u00FCsse + Best-in-Class', angebot: 'Impact + strenge Nachhaltigkeitsziele', highlight: true }, { merkmal: 'ESG-Score Minimum', aktuell: '50', angebot: '70', highlight: false }, { merkmal: 'Ausschl\u00FCsse', aktuell: 'Waffen, Kohle', angebot: 'Erweitert: Fossil, Tierversuche, Gentechnik', highlight: true }, { merkmal: 'Renditeerwartung p.a.', aktuell: '5\u20137%', angebot: '5\u20136,5%', highlight: false }, { merkmal: 'Reporting', aktuell: 'ESG-Score pro Titel', angebot: 'Impact-Report mit CO\u2082-Bilanz', highlight: true }, { merkmal: 'Regulatorik', aktuell: 'SFDR Art.8', angebot: 'SFDR Art.9 (dunkelgr\u00FCn)', highlight: true }] } },
  ],
  kommunikation: [
    { datum: '2026-03-01', typ: 'termin', richtung: 'ausgehend', betreff: 'Quartalsbericht Q4', zusammenfassung: 'Portfolio +6,2% in Q4. UBS-Konsolidierung besprochen, Mandant offen.' },
    { datum: '2026-02-15', typ: 'email', richtung: 'eingehend', betreff: 'Nachfolge Friedrich', zusammenfassung: 'Mandant möchte Friedrich in nächstes Meeting einladen.' },
  ],
  absicherung: { vorhanden: ['mandat_fv'], fehlend: ['konsolidierung_ubs', 'nextgen', 'nachfolge'] },
  portfolio: {
    allocation: { aktien: 45, anleihen: 30, alternative: 15, cash: 10 },
    performance: { ytd: 4.2, '1j': 8.5, '3j': 6.1, '5j': 7.3, inception: 6.8 },
    benchmark: { ytd: 3.8, '1j': 7.2, '3j': 5.4 },
    esgScore: 68,
  },
};

// W2: Familie Lindenberg
export const W2 = {
  name: 'Familie Lindenberg', id: 'VV00002', alter: 51,
  beruf: 'SaaS-Exit 2024 (8M netto)', arbeitgeber: { name: 'Keller Ventures GmbH', quelle: 'linkedin', bestaetigt: false }, nettoeinkommen: 15000,
  familienstand: 'verheiratet',
  partner: { name: 'Julia', beruf: 'CTO (eigenes Startup)', einkommen: 8000 },
  kinder: [{ name: 'Noah', alter: 18 }, { name: 'Ella', alter: 15 }],
  wohnsituation: 'Eigentum', wohnflaeche: 280, adresse: 'Am Kirchberg 8, 61462 Königstein im Taunus',
  nps: 8, risikoscore: 25, potentialScore: 5.0, abwanderungsrisiko: 'mittel',
  mandatsTyp: 'SmartValue',
  aum: 2100000,
  eigeneProdukte: [
    { typ: 'mandat', sparte: 'vv', produkt: 'SmartValue Mandat', details: 'Wachstum, Tech-Fokus', praemie: 0, seit: '2024-06', status: 'aktiv', volumen: 2100000 },
    { typ: 'pe', sparte: 'vv', produkt: 'PE Healthcare Fund', details: 'Co-Investment', praemie: 0, seit: '2024-09', status: 'aktiv', volumen: 300000 },
  ],
  fremdProdukte: [
    { typ: 'cash', institut: 'Commerzbank', details: 'CASH GEPARKT! Exit-Erlöse', volumen: 5500000, consent: true },
    { typ: 'tagesgeld', institut: 'Deutsche Bank', details: '1,5%', volumen: 200000, consent: true },
    { typ: 'immobilien', institut: 'Privat', details: 'EFH + Ferienwohnung', volumen: 1650000, consent: false },
    { typ: 'angel', institut: 'Privat', details: '4 Angel Investments', volumen: 400000, consent: false },
    { typ: 'lv', institut: 'Zurich', details: 'LV Ablauf 2029', volumen: 180000, consent: true },
  ],
  potentiale: [
    { titel: 'Cash-Konsolidierung 5,5M KRITISCH', typ: 'konsolidierung', quellen: ['finanztransaktion'], prioritaet: 'kritisch', volumen: 5500000, volumenTyp: 'einmalig', beschreibung: '5,5M Cash bei Commerzbank! Inflation frisst Wert. Sofort investieren.', empfohleneAktion: 'termin_vereinbaren', produktEmpfehlung: 'FairValue Mandat', status: 'termin', herleitung: [{ label: 'Datenquelle', value: 'Consent-Abfrage Commerzbank' }, { label: 'Cash-Bestand', value: '5.500.000 \u20AC auf Girokonto (Exit-Erl\u00F6se 2024)' }, { label: 'Opportunit\u00E4tskosten', value: 'ca. 275.000 \u20AC p.a. bei 5% Zielrendite entgangen' }, { label: 'Inflationsverlust', value: 'ca. 137.500 \u20AC p.a. bei 2,5% Inflation' }, { label: 'Empfohlene Strategie', value: '3-Phasen-Investition: 2M sofort, 2M Q3, 1,5M Q4' }, { label: 'Ziel-Allokation', value: 'FairValue Mandat Wachstum (55% Aktien, 25% Anleihen, 20% Alternative)' }, { label: 'Empfehlung', value: 'Sofortige Teilinvestition \u2013 jeder Monat Cash kostet ca. 23.000 \u20AC' }], vergleich: { titel: 'Vergleich: Cash vs. FairValue Mandat', spalten: ['Merkmal', 'Cash (Commerzbank)', 'HRK LUNIS FairValue'], zeilen: [{ merkmal: 'Rendite p.a.', aktuell: '0,0% (Girokonto)', angebot: '5\u20137% (Zielrendite)', highlight: true }, { merkmal: 'Inflationsschutz', aktuell: 'Keiner \u2013 realer Wertverlust', angebot: 'Sachwerte + Aktien als Schutz', highlight: true }, { merkmal: 'Diversifikation', aktuell: 'Keine (100% Cash)', angebot: 'Multi-Asset global diversifiziert', highlight: true }, { merkmal: 'Kosten', aktuell: '0 \u20AC (aber Opportunit\u00E4tskosten)', angebot: '0,85% All-in-Fee', highlight: false }, { merkmal: 'Liquidit\u00E4t', aktuell: 'Sofort verf\u00FCgbar', angebot: 'T+2 bei Bedarf', highlight: false }, { merkmal: 'Reporting', aktuell: 'Kontoauszug', angebot: 'Konsolidiertes Verm\u00F6gensreporting', highlight: true }] } },
    { titel: 'Mandats-Upgrade SmartValue\u2192FairValue', typ: 'anpassung', quellen: ['bestand'], prioritaet: 'hoch', volumen: 0, volumenTyp: 'vermittlung', beschreibung: 'Bei Konsolidierung: Upgrade auf FairValue Mandat sinnvoll.', empfohleneAktion: 'angebot_erstellen', produktEmpfehlung: 'FairValue Mandat', status: 'identifiziert', herleitung: [{ label: 'Datenquelle', value: 'Bestandsanalyse + Cash-Konsolidierungsplan' }, { label: 'Aktuelles Mandat', value: 'SmartValue (AuM 2,1M, seit 06/2024)' }, { label: 'Ziel-AuM nach Konsolidierung', value: '7.600.000 \u20AC (2,1M + 5,5M Cash)' }, { label: 'FairValue Mindestvolumen', value: '3.000.000 \u20AC \u2013 nach Konsolidierung \u00FCberqualifiziert' }, { label: 'Kostenvorteil', value: 'SmartValue 1,05% vs. FairValue 0,85% = 15.200 \u20AC/Jahr Ersparnis' }, { label: 'Empfehlung', value: 'Upgrade auf FairValue bei Cash-Konsolidierung \u2013 bessere Konditionen + pers\u00F6nlicher Berater' }], vergleich: { titel: 'Vergleich: SmartValue vs. FairValue Mandat', spalten: ['Merkmal', 'SmartValue (aktuell)', 'FairValue (empfohlen)'], zeilen: [{ merkmal: 'Mindestvolumen', aktuell: '250.000 \u20AC', angebot: '3.000.000 \u20AC', highlight: false }, { merkmal: 'All-in-Fee', aktuell: '1,05% p.a.', angebot: '0,85% p.a.', highlight: true }, { merkmal: 'Beratung', aktuell: 'Digital + Hotline', angebot: 'Fester Senior Berater', highlight: true }, { merkmal: 'Reporting', aktuell: 'Quartalsweise, Online-Portal', angebot: 'Monatlich, pers\u00F6nlich + Portal', highlight: true }, { merkmal: 'PE-Zugang', aktuell: 'Basis-Fonds', angebot: 'Direkt-Co-Investments m\u00F6glich', highlight: true }, { merkmal: 'Individuelle Strategie', aktuell: 'Modellportfolios', angebot: 'Individuell anpassbar', highlight: true }] } },
    { titel: 'PE Allokation erhöhen', typ: 'cross_sell', quellen: ['bestand'], prioritaet: 'mittel', volumen: 500000, volumenTyp: 'einmalig', beschreibung: 'Nur 300k PE. Bei 7,6M AuM-Ziel: 1M PE sinnvoll.', empfohleneAktion: 'angebot_erstellen', produktEmpfehlung: 'PE Fund Basket', status: 'identifiziert', herleitung: [{ label: 'Datenquelle', value: 'Portfolio-Analyse + Allokationsmodell' }, { label: 'Aktuelle PE-Allokation', value: '300.000 \u20AC (PE Healthcare Fund, seit 09/2024)' }, { label: 'Anteil am Gesamtverm\u00F6gen', value: '3,9% bei 7,6M Ziel-AuM \u2013 deutlich unter Soll' }, { label: 'Ziel-PE-Allokation', value: '10\u201315% = 760.000\u20131.140.000 \u20AC' }, { label: 'Hintergrund Mandant', value: 'SaaS-Exit \u2013 Affinit\u00E4t zu illiquiden Wachstumsinvestments' }, { label: 'Empfehlung', value: 'PE Fund Basket (Healthcare + Tech) \u2013 500k zus\u00E4tzlich, diversifiziert \u00FCber 3 Fonds' }] },
    { titel: 'NextGen Noah (18) Studiendepot', typ: 'nextgen', quellen: ['lebensereignis'], prioritaet: 'mittel', volumen: 100000, volumenTyp: 'einmalig', beschreibung: 'Noah beginnt Studium. Studiendepot mit SmartValue.', empfohleneAktion: 'termin_vereinbaren', produktEmpfehlung: 'SmartValue Junior', status: 'identifiziert', herleitung: [{ label: 'Datenquelle', value: 'Mandantengespr\u00E4ch + Familieninformationen' }, { label: 'Name / Alter', value: 'Noah Lindenberg, 18 Jahre' }, { label: 'Lebensereignis', value: 'Studienbeginn 2026 \u2013 erster eigener Verm\u00F6gensaufbau' }, { label: 'Elterliche Ausstattung', value: 'Geplant: 100.000 \u20AC Startkapital aus Exit-Erl\u00F6sen' }, { label: 'Anlagehorizont', value: '10+ Jahre \u2013 ideal f\u00FCr wachstumsorientierte Strategie' }, { label: 'Empfehlung', value: 'SmartValue Junior Mandat \u2013 fr\u00FChzeitige Kundenbindung NextGen' }] },
  ],
  kommunikation: [
    { datum: '2026-03-05', typ: 'termin', richtung: 'ausgehend', betreff: 'Cash-Strategie', zusammenfassung: 'Dringend: 5,5M Cash. Mandant will schrittweise investieren. 3-Phasen-Plan erstellt.' },
  ],
  absicherung: { vorhanden: ['mandat_sv', 'pe'], fehlend: ['cash_konsolidierung', 'mandats_upgrade'] },
  portfolio: {
    allocation: { aktien: 55, anleihen: 20, alternative: 20, cash: 5 },
    performance: { ytd: 5.8, '1j': 12.1, inception: 9.2 },
    benchmark: { ytd: 3.8, '1j': 7.2 },
    esgScore: 72,
  },
};

// W3: Stiftung Weber
export const W3 = {
  name: 'Stiftung Weber', id: 'VV00003', alter: 0,
  beruf: 'Bildungsstiftung (seit 2008)', arbeitgeber: { name: 'Fischer Immobiliengruppe', quelle: 'linkedin', bestaetigt: true }, nettoeinkommen: 0,
  familienstand: 'institution', partner: null, kinder: [],
  wohnsituation: 'institution', wohnflaeche: 0, adresse: 'Bockenheimer Landstr. 24, 60323 Frankfurt am Main',
  nps: 9, risikoscore: 10, potentialScore: 3.5, abwanderungsrisiko: 'niedrig',
  mandatsTyp: 'Spezialmandat',
  aum: 8300000,
  eigeneProdukte: [
    { typ: 'mandat', sparte: 'vv', produkt: 'Spezialmandat Stiftung', details: 'Defensiv, ESG Art.8, Ausschüttung 3%', praemie: 0, seit: '2008-01', status: 'aktiv', volumen: 8300000 },
  ],
  fremdProdukte: [
    { typ: 'festgeld', institut: 'Sparkasse', details: '2,0% bis 2027', volumen: 500000, consent: true },
  ],
  potentiale: [
    { titel: 'ESG Art.9 Upgrade', typ: 'anpassung', quellen: ['bestand'], prioritaet: 'hoch', volumen: 0, volumenTyp: 'vermittlung', beschreibung: 'ESG-Score 72, Ziel >80. Art.8 auf Art.9 upgraden für Bildungszweck.', empfohleneAktion: 'angebot_erstellen', produktEmpfehlung: 'Spezialmandat Art.9', status: 'angeschrieben', herleitung: [{ label: 'Datenquelle', value: 'Portfolio-Analyse ESG-Scoring + Stiftungsrat-Protokoll' }, { label: 'Aktueller ESG-Score', value: '72 von 100 (Art.8 Spezialmandat)' }, { label: 'Ziel-ESG-Score', value: '>80 (Art.9 Konformit\u00E4t)' }, { label: 'Stiftungszweck', value: 'Bildungsf\u00F6rderung \u2013 Art.9 unterstreicht Mission' }, { label: 'Regulatorischer Vorteil', value: 'Art.9 erleichtert F\u00F6rdermittel-Akquise + Spenderansprache' }, { label: 'Empfehlung', value: 'Upgrade auf Art.9 Spezialmandat \u2013 Nachhaltigkeit als Stiftungs-DNA verankern' }], vergleich: { titel: 'Vergleich: Art.8 vs. Art.9 Spezialmandat', spalten: ['Merkmal', 'Art.8 (aktuell)', 'Art.9 (empfohlen)'], zeilen: [{ merkmal: 'ESG-Strategie', aktuell: 'Ausschl\u00FCsse + Best-in-Class', angebot: 'Impact + nachhaltige Bildungsziele', highlight: true }, { merkmal: 'ESG-Score Minimum', aktuell: '50', angebot: '70', highlight: false }, { merkmal: 'Ausschl\u00FCsse', aktuell: 'Waffen, Kohle', angebot: 'Erweitert: Fossil, Tierversuche, Gentechnik', highlight: true }, { merkmal: 'Renditeerwartung p.a.', aktuell: '4\u20135%', angebot: '3,5\u20134,5%', highlight: false }, { merkmal: 'Impact-Reporting', aktuell: 'ESG-Score pro Titel', angebot: 'Impact-Report mit SDG-Zuordnung + CO\u2082-Bilanz', highlight: true }, { merkmal: 'Stiftungs-Kompatibilit\u00E4t', aktuell: 'Gut', angebot: 'Exzellent \u2013 Mission-aligned Investing', highlight: true }] } },
    { titel: 'Ausschüttungsoptimierung', typ: 'anpassung', quellen: ['bestand'], prioritaet: 'mittel', volumen: 250000, volumenTyp: 'jaehrlich', beschreibung: 'Aktuell 250k/J. Durch Rebalancing +30k möglich.', empfohleneAktion: 'angebot_erstellen', produktEmpfehlung: 'Ausschüttungsoptimierung', status: 'identifiziert', herleitung: [{ label: 'Datenquelle', value: 'Portfolio-Analyse Aussch\u00FCttungshistorie' }, { label: 'Aktuelle Aussch\u00FCttung', value: '250.000 \u20AC p.a. (ca. 3,0% des AuM)' }, { label: 'Ziel-Aussch\u00FCttung', value: '280.000 \u20AC p.a. (ca. 3,4% des AuM)' }, { label: 'Optimierungshebel', value: 'Umschichtung in h\u00F6her aussch\u00FCttende Anleihen + Dividendentitel' }, { label: 'Kapitalerhalt', value: 'Realer Kapitalerhalt bleibt Prim\u00E4rziel der Stiftung' }, { label: 'Empfehlung', value: 'Rebalancing Anleihen-Segment \u2013 +30.000 \u20AC/Jahr bei gleichem Risikoprofil' }] },
    { titel: 'Sparkasse-Festgeld konsolidieren', typ: 'konsolidierung', quellen: ['finanztransaktion'], prioritaet: 'mittel', volumen: 500000, volumenTyp: 'einmalig', beschreibung: '500k bei Sparkasse. Besser im Mandat mit höherem Ertrag.', empfohleneAktion: 'termin_vereinbaren', produktEmpfehlung: 'Spezialmandat Erweiterung', status: 'identifiziert', herleitung: [{ label: 'Datenquelle', value: 'Consent-Abfrage Sparkasse' }, { label: 'Festgeld-Volumen', value: '500.000 \u20AC (2,0% bis 2027)' }, { label: 'Rendite Festgeld', value: '2,0% p.a. = 10.000 \u20AC/Jahr' }, { label: 'Rendite im Spezialmandat', value: '4\u20135% p.a. = 20.000\u201325.000 \u20AC/Jahr' }, { label: 'Mehrertrag p.a.', value: 'ca. 10.000\u201315.000 \u20AC bei gleicher Sicherheitsorientierung' }, { label: 'Empfehlung', value: 'Bei F\u00E4lligkeit 2027 ins Spezialmandat \u00FCberf\u00FChren \u2013 h\u00F6herer Ertrag + konsolidiertes Reporting' }], vergleich: { titel: 'Vergleich: Sparkasse Festgeld vs. Spezialmandat', spalten: ['Merkmal', 'Sparkasse Festgeld', 'HRK LUNIS Spezialmandat'], zeilen: [{ merkmal: 'Rendite p.a.', aktuell: '2,0% (fest bis 2027)', angebot: '4\u20135% (Zielrendite)', highlight: true }, { merkmal: 'Einlagensicherung', aktuell: 'Ja (bis 100k gesetzlich)', angebot: 'Sonderverm\u00F6gen (insolvenzgesch\u00FCtzt)', highlight: false }, { merkmal: 'Liquidit\u00E4t', aktuell: 'Gebunden bis F\u00E4lligkeit', angebot: 'T+2 bei Bedarf', highlight: true }, { merkmal: 'ESG-Integration', aktuell: 'Keine', angebot: 'Art.8/Art.9 konform', highlight: true }, { merkmal: 'Reporting', aktuell: 'Kontoauszug', angebot: 'Integriert im Stiftungs-Reporting', highlight: true }, { merkmal: 'Aussch\u00FCttungsbeitrag', aktuell: '10.000 \u20AC/Jahr', angebot: '20.000\u201325.000 \u20AC/Jahr', highlight: true }] } },
  ],
  kommunikation: [
    { datum: '2026-02-28', typ: 'termin', richtung: 'ausgehend', betreff: 'ESG-Review', zusammenfassung: 'Stiftungsrat möchte ESG-Upgrade. Prüfung Art.9 läuft.' },
  ],
  absicherung: { vorhanden: ['spezialmandat'], fehlend: ['esg_upgrade', 'konsolidierung'] },
  portfolio: {
    allocation: { aktien: 30, anleihen: 50, alternative: 10, cash: 10 },
    performance: { ytd: 2.8, '1j': 5.2, '3j': 4.1, '5j': 4.8, inception: 4.5 },
    benchmark: { ytd: 2.5, '1j': 4.8, '3j': 3.9 },
    esgScore: 72,
  },
};

// W4: Prof. Dr. Hartmann
export const W4 = {
  name: 'Prof. Dr. Hartmann', id: 'VV00004', alter: 56,
  beruf: 'Chefarzt Kardiologie + Privatpraxis', arbeitgeber: { name: 'TechBridge Solutions GmbH', quelle: 'linkedin', bestaetigt: false }, nettoeinkommen: 18000,
  familienstand: 'verheiratet',
  partner: { name: 'Andrea', beruf: 'Psychologin', einkommen: 4500 },
  kinder: [{ name: 'Jan', alter: 26 }, { name: 'Sophie', alter: 23 }],
  wohnsituation: 'Eigentum', wohnflaeche: 320, adresse: 'Villenweg 5, 65193 Wiesbaden',
  nps: 8, risikoscore: 18, potentialScore: 4.5, abwanderungsrisiko: 'niedrig',
  mandatsTyp: 'FairValue',
  aum: 6800000,
  eigeneProdukte: [
    { typ: 'mandat', sparte: 'vv', produkt: 'FairValue Mandat', details: 'Ausgewogen, Healthcare Schwerpunkt', praemie: 0, seit: '2019-01', status: 'aktiv', volumen: 6800000 },
    { typ: 'pe', sparte: 'vv', produkt: 'PE Healthcare Fund', details: 'Co-Investment', praemie: 0, seit: '2022-01', status: 'aktiv', volumen: 200000 },
  ],
  fremdProdukte: [
    { typ: 'praxiskonto', institut: 'Commerzbank', details: 'Praxis-Konto', volumen: 80000, consent: true },
    { typ: 'tagesgeld', institut: 'ING', details: '2,0%', volumen: 250000, consent: true },
    { typ: 'immobilie', institut: 'Privat', details: 'Praxis-Immobilie', volumen: 800000, consent: false },
  ],
  potentiale: [
    { titel: 'PE Healthcare erhöhen', typ: 'cross_sell', quellen: ['bestand'], prioritaet: 'hoch', volumen: 300000, volumenTyp: 'einmalig', beschreibung: 'Nur 200k PE. Fachkenntnis Kardiologie nutzen. 500k Ziel.', empfohleneAktion: 'angebot_erstellen', produktEmpfehlung: 'PE Healthcare Fund II', status: 'angeschrieben', herleitung: [{ label: 'Datenquelle', value: 'Portfolio-Analyse + Mandantengespr\u00E4ch' }, { label: 'Aktuelle PE-Allokation', value: '200.000 \u20AC (PE Healthcare Fund, seit 01/2022)' }, { label: 'Anteil am AuM', value: '2,9% \u2013 deutlich unter Ziel 7\u201310%' }, { label: 'Fachexpertise', value: 'Chefarzt Kardiologie \u2013 einzigartige Branchenkenntnis f\u00FCr Healthcare-PE' }, { label: 'Ziel-PE-Allokation', value: '500.000 \u20AC (+300k in PE Healthcare Fund II)' }, { label: 'Erwartete Rendite', value: 'IRR 12\u201315% p.a. (Healthcare-PE historisch)' }, { label: 'Empfehlung', value: 'PE Healthcare Fund II \u2013 Co-Investment mit Fachkenntnis-Vorteil' }] },
    { titel: 'ING Tagesgeld konsolidieren', typ: 'konsolidierung', quellen: ['finanztransaktion'], prioritaet: 'hoch', volumen: 250000, volumenTyp: 'einmalig', beschreibung: '250k bei ING. Im Mandat besser aufgehoben.', empfohleneAktion: 'termin_vereinbaren', produktEmpfehlung: 'FairValue Erweiterung', status: 'identifiziert', herleitung: [{ label: 'Datenquelle', value: 'Consent-Abfrage ING' }, { label: 'Tagesgeld-Volumen', value: '250.000 \u20AC bei ING (2,0% p.a.)' }, { label: 'Rendite Tagesgeld', value: '5.000 \u20AC/Jahr (variabel, sinkend)' }, { label: 'Rendite im FairValue Mandat', value: 'Zielrendite 5\u20137% = 12.500\u201317.500 \u20AC/Jahr' }, { label: 'Mehrertrag p.a.', value: 'ca. 7.500\u201312.500 \u20AC bei moderatem Risiko' }, { label: 'Empfehlung', value: 'Konsolidierung ins FairValue Mandat \u2013 Ertragssteigerung + einheitliches Reporting' }], vergleich: { titel: 'Vergleich: ING Tagesgeld vs. FairValue Mandat', spalten: ['Merkmal', 'ING Tagesgeld', 'HRK LUNIS FairValue'], zeilen: [{ merkmal: 'Rendite p.a.', aktuell: '2,0% (variabel, sinkend)', angebot: '5\u20137% (Zielrendite)', highlight: true }, { merkmal: 'Inflationsschutz', aktuell: 'Negativer Realzins', angebot: 'Sachwerte + Aktien als Schutz', highlight: true }, { merkmal: 'Einlagensicherung', aktuell: 'Bis 100k gesetzlich', angebot: 'Sonderverm\u00F6gen (insolvenzgesch\u00FCtzt)', highlight: false }, { merkmal: 'Liquidit\u00E4t', aktuell: 'Sofort verf\u00FCgbar', angebot: 'T+2 bei Bedarf', highlight: false }, { merkmal: 'Reporting', aktuell: 'Separates Online-Portal', angebot: 'Konsolidiert mit bestehendem FairValue', highlight: true }, { merkmal: 'Kosten', aktuell: '0 \u20AC', angebot: '0,85% All-in-Fee (durch Mehrertrag kompensiert)', highlight: false }] } },
    { titel: 'NextGen Sohn Jan', typ: 'nextgen', quellen: ['lebensereignis'], prioritaet: 'mittel', volumen: 0, volumenTyp: 'vermittlung', beschreibung: 'Jan (26), Assistenzarzt, eigene Ersparnisse ca. 50k.', empfohleneAktion: 'termin_vereinbaren', produktEmpfehlung: 'SmartValue Junior', status: 'identifiziert', herleitung: [{ label: 'Datenquelle', value: 'Mandantengespr\u00E4ch + Familieninformationen' }, { label: 'Name / Alter', value: 'Jan Hartmann, 26 Jahre' }, { label: 'Beruf', value: 'Assistenzarzt \u2013 hohes Einkommenspotenzial' }, { label: 'Gesch\u00E4tzte Ersparnisse', value: 'ca. 50.000 \u20AC (eigene Ansparung)' }, { label: 'Familienkontext', value: 'Sohn des Mandanten \u2013 potenzielle Praxisnachfolge' }, { label: 'Empfehlung', value: 'SmartValue Junior Mandat \u2013 fr\u00FChzeitige Kundenbindung, sp\u00E4ter Upgrade-Potenzial' }] },
    { titel: 'Nachfolge Privatpraxis', typ: 'beratung', quellen: ['lebensereignis'], prioritaet: 'mittel', volumen: 800000, volumenTyp: 'einmalig', beschreibung: 'Praxisverkauf in 5-8 Jahren. Bewertung + Erlös-Planung.', empfohleneAktion: 'termin_vereinbaren', produktEmpfehlung: 'Nachfolgeberatung', status: 'identifiziert', herleitung: [{ label: 'Datenquelle', value: 'Mandantengespr\u00E4ch + Praxis-Informationen' }, { label: 'Praxis', value: 'Kardiologische Privatpraxis, etabliert seit \u00FCber 15 Jahren' }, { label: 'Gesch\u00E4tzte Praxisbewertung', value: 'ca. 800.000 \u20AC (Substanzwert + Goodwill)' }, { label: 'Zeitrahmen', value: 'Verkauf in 5\u20138 Jahren geplant (Hartmann dann 61\u201364)' }, { label: 'Erl\u00F6splanung', value: '800k Verkaufserl\u00F6s ins FairValue Mandat einbringen' }, { label: 'M\u00F6glicher Nachfolger', value: 'Sohn Jan (Assistenzarzt) oder externer K\u00E4ufer' }, { label: 'Empfehlung', value: 'Nachfolgeberatung starten \u2013 Praxisbewertung + steueroptimierte \u00DCbergabe planen' }] },
  ],
  kommunikation: [
    { datum: '2026-02-25', typ: 'termin', richtung: 'ausgehend', betreff: 'PE Healthcare', zusammenfassung: 'Mandant möchte PE Healthcare erhöhen. Fund II Unterlagen angefordert.' },
  ],
  absicherung: { vorhanden: ['mandat_fv', 'pe_hc'], fehlend: ['konsolidierung_ing', 'nextgen', 'nachfolge_praxis'] },
  portfolio: {
    allocation: { aktien: 50, anleihen: 25, alternative: 18, cash: 7 },
    performance: { ytd: 4.8, '1j': 9.1, '3j': 6.8, '5j': 7.5, inception: 7.1 },
    benchmark: { ytd: 3.8, '1j': 7.2, '3j': 5.4 },
    esgScore: 75,
  },
};

// W5: Maxim Meydarn
export const W5 = {
  name: 'Maxim Meydarn', id: 'VV00005', alter: 29,
  beruf: 'Tech-Gründer (Seed-Exit 500k)', arbeitgeber: { name: 'Rhein-Main Steuerberatung', quelle: 'linkedin', bestaetigt: false }, nettoeinkommen: 4500,
  familienstand: 'ledig', partner: null, kinder: [],
  wohnsituation: 'Miete', wohnflaeche: 70, adresse: 'Berger Str. 142, 60385 Frankfurt am Main',
  nps: 7, risikoscore: 60, potentialScore: 4.0, abwanderungsrisiko: 'mittel',
  mandatsTyp: 'SmartValue',
  aum: 450000,
  eigeneProdukte: [
    { typ: 'mandat', sparte: 'vv', produkt: 'SmartValue Mandat', details: 'Wachstum, Tech/Impact', praemie: 0, seit: '2025-01', status: 'aktiv', volumen: 450000 },
  ],
  fremdProdukte: [
    { typ: 'konto', institut: 'N26', details: 'Privatkonto', volumen: 8000, consent: true },
    { typ: 'krypto', institut: 'Coinbase/Ledger', details: 'BTC+ETH+SOL', volumen: 120000, consent: false },
    { typ: 'angel', institut: 'Privat', details: '2 Angel Investments', volumen: 80000, consent: false },
  ],
  potentiale: [
    { titel: 'Mandats-Upgrade bei nächstem Exit', typ: 'anpassung', quellen: ['lebensereignis'], prioritaet: 'hoch', volumen: 0, volumenTyp: 'vermittlung', beschreibung: 'Series A Startup. Bei Exit: FairValue Upgrade.', empfohleneAktion: 'termin_vereinbaren', produktEmpfehlung: 'FairValue Mandat', status: 'identifiziert', herleitung: [{ label: 'Datenquelle', value: 'Mandantengespr\u00E4ch + Angel-Portfolio-Informationen' }, { label: 'Aktuelles Mandat', value: 'SmartValue (AuM 450.000 \u20AC, seit 01/2025)' }, { label: 'Laufendes Startup', value: 'Series A Investment \u2013 erwarteter Exit in 2\u20133 Jahren' }, { label: 'Gesch\u00E4tzter Exit-Erl\u00F6s', value: '500.000\u20131.500.000 \u20AC (abh\u00E4ngig von Bewertung)' }, { label: 'FairValue Schwelle', value: 'Ab 3M AuM \u2013 bei erfolgreichem Exit erreichbar' }, { label: 'Empfehlung', value: 'FairValue Upgrade bei Exit vorbereiten \u2013 Mandant fr\u00FChzeitig binden' }] },
    { titel: 'Krypto strukturieren', typ: 'beratung', quellen: ['finanztransaktion'], prioritaet: 'hoch', volumen: 120000, volumenTyp: 'einmalig', beschreibung: '120k Krypto unstrukturiert. Professionelles Reporting + Steuer.', empfohleneAktion: 'termin_vereinbaren', produktEmpfehlung: 'Krypto-Reporting', status: 'angeschrieben', herleitung: [{ label: 'Datenquelle', value: 'Mandantengespr\u00E4ch + E-Mail-Anfrage Krypto-Reporting' }, { label: 'Krypto-Bestand', value: '120.000 \u20AC (Coinbase + Ledger Hardware Wallet)' }, { label: 'Zusammensetzung', value: 'BTC (~60%), ETH (~25%), SOL (~15%)' }, { label: 'Steuerliche Situation', value: 'Haltefrist teilweise <1 Jahr \u2013 steuerpflichtige Gewinne m\u00F6glich' }, { label: 'Aktuelles Tracking', value: 'Kein professionelles Reporting \u2013 Steuerrisiko' }, { label: 'Empfehlung', value: 'Krypto-Reporting integrieren \u2013 Steueroptimierung + Gesamtverm\u00F6gens\u00FCberblick' }] },
    { titel: 'Angel-Portfolio Reporting', typ: 'beratung', quellen: ['bestand'], prioritaet: 'mittel', volumen: 80000, volumenTyp: 'einmalig', beschreibung: '2 Angel Investments ohne Tracking. In Gesamtreporting integrieren.', empfohleneAktion: 'angebot_erstellen', produktEmpfehlung: 'Consolidated Reporting', status: 'identifiziert', herleitung: [{ label: 'Datenquelle', value: 'Mandantengespr\u00E4ch + Bestandsinformationen' }, { label: 'Angel-Investments', value: '2 Beteiligungen, gesamt ca. 80.000 \u20AC' }, { label: 'Aktueller Status', value: 'Kein systematisches Tracking oder Bewertung' }, { label: 'Risiko', value: 'Bewertungs\u00E4nderungen und Verd\u00FCnnung nicht dokumentiert' }, { label: 'Gesamtverm\u00F6gen', value: 'Ohne Angel-Portfolio unvollst\u00E4ndiges Bild (650k+ total)' }, { label: 'Empfehlung', value: 'Consolidated Reporting \u2013 alle Verm\u00F6genswerte in einem Dashboard' }] },
    { titel: 'ESG Impact Schwerpunkt', typ: 'anpassung', quellen: ['bestand'], prioritaet: 'niedrig', volumen: 0, volumenTyp: 'vermittlung', beschreibung: 'Impact-Investor. ESG Impact Fund Allokation erhöhen.', empfohleneAktion: 'angebot_erstellen', produktEmpfehlung: 'Impact Fund Basket', status: 'identifiziert', herleitung: [{ label: 'Datenquelle', value: 'Portfolio-Analyse + Mandantenprofil' }, { label: 'Aktueller ESG-Score', value: '80 von 100 (bereits \u00FCberdurchschnittlich)' }, { label: 'Impact-Affinit\u00E4t', value: 'Tech-Gr\u00FCnder mit Nachhaltigkeitsfokus \u2013 Impact-Investing als \u00DCberzeugung' }, { label: 'Aktuelle Impact-Allokation', value: 'ca. 15% des Portfolios in Impact-nahen Titeln' }, { label: 'Ziel-Impact-Allokation', value: '30\u201340% \u2013 Schwerpunkt Climate Tech + Social Impact' }, { label: 'Empfehlung', value: 'Impact Fund Basket erg\u00E4nzen \u2013 Rendite + Wirkung f\u00FCr Gen-Z-Investor' }] },
  ],
  kommunikation: [
    { datum: '2026-03-02', typ: 'email', richtung: 'eingehend', betreff: 'Krypto Reporting', zusammenfassung: 'Tim fragt nach integriertem Krypto-Reporting für Steuerzwecke.' },
  ],
  absicherung: { vorhanden: ['mandat_sv'], fehlend: ['krypto_struktur', 'angel_reporting'] },
  portfolio: {
    allocation: { aktien: 65, anleihen: 10, alternative: 20, cash: 5 },
    performance: { ytd: 7.2, inception: 11.5 },
    benchmark: { ytd: 3.8 },
    esgScore: 80,
  },
};
