// B1: Klaus Fischer
export const B1 = {
  name: 'Klaus Fischer', id: 'BK00001', alter: 45,
  beruf: 'Vertriebsleiter', nettoeinkommen: 4500,
  familienstand: 'verheiratet',
  partner: { name: 'Sabine', beruf: 'Teilzeit Verwaltung', einkommen: 1200 },
  kinder: [{ name: 'Lukas', alter: 12 }, { name: 'Marie', alter: 9 }],
  wohnsituation: 'eigentum', wohnflaeche: 150,
  nps: 7, risikoscore: 30, potentialScore: 4.2, abwanderungsrisiko: 'mittel',
  eigeneProdukte: [
    { typ: 'girokonto', sparte: 'konto', produkt: 'VR-MeinKonto Plus', details: 'Gehaltseingang 4.500\u20ac netto', praemie: 0, seit: '2015-01', status: 'aktiv' },
    { typ: 'sparkonto', sparte: 'sparen', produkt: 'VR-Sparkonto', details: '0,5% Zins', praemie: 0, seit: '2015-01', status: 'aktiv', volumen: 15000 },
    { typ: 'baufi', sparte: 'kredit', produkt: 'VR-Baufinanzierung', details: '185k Rest, 2,1%, ZINSBINDUNG 04/2026!', praemie: 980, seit: '2016-06', status: 'aktiv', volumen: 185000 },
    { typ: 'visa', sparte: 'karte', produkt: 'VR-Visa Gold', details: 'Limit 5k', praemie: 60, seit: '2018-01', status: 'aktiv' },
    { typ: 'bsv', sparte: 'sparen', produkt: 'Schwäbisch Hall BSV', details: 'Zuteilungsreif 2026', praemie: 0, seit: '2012-01', status: 'aktiv', volumen: 30000 },
  ],
  fremdProdukte: [
    { typ: 'depot', institut: 'Trade Republic', details: 'ETF Sparplan 200/mtl', volumen: 28000, consent: true },
    { typ: 'tagesgeld', institut: 'ING', details: '2,0%', volumen: 22000, consent: true },
    { typ: 'versicherung', institut: 'HUK', details: 'KFZ + Hausrat + Haftpfl.', volumen: 1200, consent: true },
    { typ: 'bu', institut: 'HDI', details: 'BU 2.000\u20ac/mtl.', volumen: 1800, consent: true },
    { typ: 'haftpflicht', institut: 'Allianz', details: 'Privat', volumen: 85, consent: false },
    { typ: 'lebensversicherung', institut: 'Alte Leipziger', details: 'Ablauf 2030', volumen: 65000, consent: true },
  ],
  transaktionen: [
    { kategorie: 'gehalt', betrag: 4500, empfaenger: 'Arbeitgeber' },
    { kategorie: 'gehalt_partner', betrag: 1200, empfaenger: 'Stadt' },
    { kategorie: 'kindergeld', betrag: 500, empfaenger: 'Familienkasse' },
    { kategorie: 'baufi', betrag: -980, empfaenger: 'Volksbank' },
    { kategorie: 'sparplan', betrag: -200, empfaenger: 'Trade Republic' },
    { kategorie: 'versicherung', betrag: -310, empfaenger: 'HUK, HDI, Allianz' },
    { kategorie: 'konsum', betrag: -1800, empfaenger: 'Diverse' },
  ],
  potentiale: [
    { titel: 'Anschlussfinanzierung KRITISCH', typ: 'anpassung', quellen: ['bestand'], prioritaet: 'kritisch', volumen: 185000, volumenTyp: 'einmalig', beschreibung: 'Zinsbindung endet 04/2026! Sofort Forward-Darlehen anbieten.', empfohleneAktion: 'termin_vereinbaren', produktEmpfehlung: 'VR-Baufinanzierung Forward', status: 'termin' },
    { titel: 'Union Investment statt Trade Republic', typ: 'cross_sell', quellen: ['finanztransaktion'], prioritaet: 'hoch', volumen: 28000, volumenTyp: 'einmalig', beschreibung: '28k bei Trade Republic. Union Investment Sparplan anbieten.', empfohleneAktion: 'angebot_erstellen', produktEmpfehlung: 'UnionDepot', status: 'angeschrieben' },
    { titel: 'BSV Zuteilung verwenden', typ: 'anpassung', quellen: ['bestand'], prioritaet: 'hoch', volumen: 30000, volumenTyp: 'einmalig', beschreibung: 'BSV zuteilungsreif. Für Anschlussfinanzierung oder Modernisierung nutzen.', empfohleneAktion: 'termin_vereinbaren', produktEmpfehlung: 'Schwäbisch Hall', status: 'identifiziert' },
    { titel: 'R+V KFZ + Haftpflicht', typ: 'cross_sell', quellen: ['wettbewerb'], prioritaet: 'mittel', volumen: 1285, volumenTyp: 'jaehrlich', beschreibung: 'HUK+Allianz Versicherungen. R+V Verbund-Rabatt möglich.', empfohleneAktion: 'tarifvergleich', produktEmpfehlung: 'R+V Bündel', status: 'identifiziert' },
    { titel: 'ING Tagesgeld konsolidieren', typ: 'cross_sell', quellen: ['finanztransaktion'], prioritaet: 'mittel', volumen: 22000, volumenTyp: 'einmalig', beschreibung: '22k bei ING. VR-Festgeld oder VR-Sparkonto attraktiver.', empfohleneAktion: 'angebot_erstellen', produktEmpfehlung: 'VR-Festgeld', status: 'identifiziert' },
    { titel: 'R+V BU-Wechsel', typ: 'cross_sell', quellen: ['wettbewerb'], prioritaet: 'hoch', volumen: 1800, volumenTyp: 'jaehrlich', beschreibung: 'HDI BU alt. R+V BU mit Verbundvorteil.', empfohleneAktion: 'tarifvergleich', produktEmpfehlung: 'R+V BU Premium', status: 'identifiziert' },
    { titel: 'VR-FinanzPlan Familie', typ: 'cross_sell', quellen: ['bestand'], prioritaet: 'mittel', volumen: 0, volumenTyp: 'vermittlung', beschreibung: 'Ganzheitliche Beratung fehlt. VR-FinanzPlan anbieten.', empfohleneAktion: 'termin_vereinbaren', produktEmpfehlung: 'VR-FinanzPlan', status: 'identifiziert' },
  ],
  kommunikation: [
    { datum: '2026-03-01', typ: 'termin', richtung: 'ausgehend', betreff: 'Anschlussfinanzierung', zusammenfassung: 'Dringend! Zinsbindung läuft 04/2026 ab. Termin für Forward-Darlehen vereinbart.' },
    { datum: '2026-01-15', typ: 'email', richtung: 'ausgehend', betreff: 'Depot-Information', zusammenfassung: 'Union Investment Sparplan-Angebot gesendet.' },
  ],
  absicherung: { vorhanden: ['girokonto', 'baufi', 'sparkonto'], fehlend: ['depot_vr', 'versicherung_rv'] },
};

// B2: Sandra Müller
export const B2 = {
  name: 'Sandra Müller', id: 'BK00002', alter: 33,
  beruf: 'Lehrerin (verbeamtet)', nettoeinkommen: 3200,
  familienstand: 'verheiratet',
  partner: { name: 'Tobias', beruf: 'Ingenieur (Commerzbank-Kunde)', einkommen: 4200 },
  kinder: [],
  wohnsituation: 'miete', wohnflaeche: 80,
  nps: 8, risikoscore: 15, potentialScore: 4.0, abwanderungsrisiko: 'niedrig',
  eigeneProdukte: [
    { typ: 'girokonto', sparte: 'konto', produkt: 'VR-MeinKonto', details: 'Gehaltseingang 3.200\u20ac', praemie: 0, seit: '2020-01', status: 'aktiv' },
    { typ: 'sparkonto', sparte: 'sparen', produkt: 'VR-Sparkonto', details: 'Notgroschen', praemie: 0, seit: '2020-01', status: 'aktiv', volumen: 35000 },
  ],
  fremdProdukte: [],
  transaktionen: [
    { kategorie: 'gehalt', betrag: 3200, empfaenger: 'Land NRW' },
    { kategorie: 'gehalt_partner', betrag: 4200, empfaenger: 'Commerzbank (Tobias)' },
    { kategorie: 'miete', betrag: -1100, empfaenger: 'Vermieter' },
    { kategorie: 'konsum', betrag: -2000, empfaenger: 'Diverse' },
  ],
  potentiale: [
    { titel: 'Baufinanzierung vorbereiten', typ: 'cross_sell', quellen: ['lebensereignis'], prioritaet: 'hoch', volumen: 350000, volumenTyp: 'einmalig', beschreibung: 'Hausbau geplant 2027. Vorab-Beratung und Finanzierungsrahmen.', empfohleneAktion: 'termin_vereinbaren', produktEmpfehlung: 'VR-Baufinanzierung', status: 'termin' },
    { titel: 'Ehemann Tobias als Kunden gewinnen', typ: 'cross_sell', quellen: ['bestand'], prioritaet: 'hoch', volumen: 0, volumenTyp: 'vermittlung', beschreibung: 'Tobias bei Commerzbank. Gemeinsames Konto für Baufi nötig.', empfohleneAktion: 'termin_vereinbaren', produktEmpfehlung: 'VR-GemeinschaftsKonto', status: 'angeschrieben' },
    { titel: 'BSV für Zinssicherung', typ: 'cross_sell', quellen: ['lebensereignis'], prioritaet: 'hoch', volumen: 50000, volumenTyp: 'einmalig', beschreibung: 'Bausparvertrag für Zinssicherung vor Hausbau.', empfohleneAktion: 'angebot_erstellen', produktEmpfehlung: 'Schwäbisch Hall Fuchs', status: 'identifiziert' },
    { titel: 'R+V RLV für Baufi', typ: 'cross_sell', quellen: ['lebensereignis'], prioritaet: 'mittel', volumen: 360, volumenTyp: 'jaehrlich', beschreibung: 'RLV wird für Baufinanzierung benötigt.', empfohleneAktion: 'angebot_erstellen', produktEmpfehlung: 'R+V Risikoleben', status: 'identifiziert' },
  ],
  kommunikation: [
    { datum: '2026-03-05', typ: 'termin', richtung: 'ausgehend', betreff: 'Baufi-Erstberatung', zusammenfassung: 'Ehepaar möchte 2027 bauen. Finanzrahmen: 350-400k. Tobias soll mitmachen.' },
  ],
  absicherung: { vorhanden: ['girokonto', 'sparkonto'], fehlend: ['baufi', 'bsv', 'rlv', 'partner_konto'] },
};

// B3: Peter Hoffmann
export const B3 = {
  name: 'Peter Hoffmann', id: 'BK00003', alter: 58,
  beruf: 'GmbH-Geschäftsführer', nettoeinkommen: 8500,
  familienstand: 'verheiratet',
  partner: { name: 'Claudia', beruf: 'Buchhalterin (im Betrieb)', einkommen: 2500 },
  kinder: [{ name: 'Jan', alter: 28 }, { name: 'Lea', alter: 25 }],
  wohnsituation: 'eigentum', wohnflaeche: 220,
  nps: 6, risikoscore: 35, potentialScore: 4.5, abwanderungsrisiko: 'mittel',
  eigeneProdukte: [
    { typ: 'firmenkonto1', sparte: 'konto', produkt: 'VR-BusinessKonto', details: 'Hauptkonto GmbH', praemie: 25, seit: '2008-01', status: 'aktiv', volumen: 45000 },
    { typ: 'firmenkonto2', sparte: 'konto', produkt: 'VR-BusinessKonto Plus', details: 'Lohnkonto', praemie: 15, seit: '2008-01', status: 'aktiv', volumen: 12000 },
    { typ: 'firmenkonto3', sparte: 'konto', produkt: 'VR-Rücklagenkonto', details: 'Steuerrücklage', praemie: 0, seit: '2010-01', status: 'aktiv', volumen: 85000 },
    { typ: 'firmenkredit', sparte: 'kredit', produkt: 'VR-FirmenkrediLine', details: 'Rahmen 200k', praemie: 0, seit: '2015-01', status: 'aktiv' },
    { typ: 'sparkonto', sparte: 'sparen', produkt: 'VR-Sparkonto Privat', details: 'Notgroschen', praemie: 0, seit: '2008-01', status: 'aktiv', volumen: 60000 },
  ],
  fremdProdukte: [
    { typ: 'depot_privat', institut: 'Deutsche Bank', details: 'Privat-Depot Aktien', volumen: 280000, consent: true },
    { typ: 'depot_firma', institut: 'Deutsche Bank', details: 'Firmen-Depot', volumen: 150000, consent: true },
    { typ: 'dno', institut: 'Allianz', details: 'D&O + Firmen-Flotte', volumen: 8500, consent: false },
  ],
  transaktionen: [
    { kategorie: 'gf_gehalt', betrag: 8500, empfaenger: 'Eigene GmbH' },
    { kategorie: 'gehalt_partner', betrag: 2500, empfaenger: 'Eigene GmbH' },
    { kategorie: 'versicherung_firma', betrag: -710, empfaenger: 'Allianz' },
    { kategorie: 'konsum', betrag: -3500, empfaenger: 'Diverse' },
  ],
  potentiale: [
    { titel: 'Union Investment Firmendepot', typ: 'cross_sell', quellen: ['finanztransaktion'], prioritaet: 'hoch', volumen: 150000, volumenTyp: 'einmalig', beschreibung: '150k Firmendepot bei Deutsche Bank. Union Inv. institutionell.', empfohleneAktion: 'termin_vereinbaren', produktEmpfehlung: 'Union Investment Institutionell', status: 'identifiziert' },
    { titel: 'bAV für 25 Mitarbeiter', typ: 'cross_sell', quellen: ['bestand'], prioritaet: 'hoch', volumen: 0, volumenTyp: 'vermittlung', beschreibung: '25 MA ohne bAV. Arbeitgeberzuschuss-Pflicht.', empfohleneAktion: 'termin_vereinbaren', produktEmpfehlung: 'R+V bAV', status: 'angeschrieben' },
    { titel: 'D&O Wechsel zu R+V', typ: 'cross_sell', quellen: ['wettbewerb'], prioritaet: 'mittel', volumen: 4500, volumenTyp: 'jaehrlich', beschreibung: 'Allianz D&O. R+V Angebot prüfen.', empfohleneAktion: 'tarifvergleich', produktEmpfehlung: 'R+V D&O', status: 'identifiziert' },
    { titel: 'Nachfolgeplanung GmbH', typ: 'cross_sell', quellen: ['lebensereignis'], prioritaet: 'hoch', volumen: 0, volumenTyp: 'vermittlung', beschreibung: '58 Jahre, Nachfolge planen. Sohn Jan als Nachfolger?', empfohleneAktion: 'termin_vereinbaren', produktEmpfehlung: 'VR-Nachfolgeberatung', status: 'identifiziert' },
    { titel: 'KfW Energieeffizienz Förderung', typ: 'cross_sell', quellen: ['bestand'], prioritaet: 'mittel', volumen: 50000, volumenTyp: 'einmalig', beschreibung: 'Firmensitz Baujahr 1992. Energetische Sanierung förderbar.', empfohleneAktion: 'angebot_erstellen', produktEmpfehlung: 'KfW Energieeffizienz', status: 'identifiziert' },
  ],
  kommunikation: [
    { datum: '2026-02-20', typ: 'termin', richtung: 'ausgehend', betreff: 'Firmenkundengespräch', zusammenfassung: 'bAV-Thema angesprochen. GF offen, will Angebot für 25 MA sehen.' },
  ],
  absicherung: { vorhanden: ['firmenkonto', 'kredit', 'sparkonto'], fehlend: ['depot_vr', 'bav', 'nachfolge'] },
};

// B4: Markus Wagner
export const B4 = {
  name: 'Markus Wagner', id: 'BK00004', alter: 29,
  beruf: 'Junior Controller', nettoeinkommen: 2600,
  familienstand: 'ledig', partner: null, kinder: [],
  wohnsituation: 'miete', wohnflaeche: 50,
  nps: 6, risikoscore: 40, potentialScore: 3.5, abwanderungsrisiko: 'hoch',
  eigeneProdukte: [
    { typ: 'girokonto', sparte: 'konto', produkt: 'VR-MeinKonto', details: 'Gehaltseingang 2.600\u20ac', praemie: 0, seit: '2018-01', status: 'aktiv' },
  ],
  fremdProdukte: [
    { typ: 'depot', institut: 'Trade Republic', details: 'ETF + Einzelaktien', volumen: 5200, consent: true },
    { typ: 'kfz', institut: 'Check24', details: 'KFZ VW Polo', volumen: 380, consent: false },
    { typ: 'haftpflicht', institut: 'Check24', details: 'Single', volumen: 45, consent: false },
  ],
  transaktionen: [
    { kategorie: 'gehalt', betrag: 2600, empfaenger: 'Industrieunternehmen' },
    { kategorie: 'miete', betrag: -650, empfaenger: 'Vermieter' },
    { kategorie: 'sparplan', betrag: -100, empfaenger: 'Trade Republic' },
    { kategorie: 'konsum', betrag: -1000, empfaenger: 'Diverse' },
  ],
  potentiale: [
    { titel: 'Union Investment Sparplan', typ: 'cross_sell', quellen: ['finanztransaktion'], prioritaet: 'hoch', volumen: 200, volumenTyp: 'monatlich', beschreibung: 'Sparplan bei Trade Republic. Union Investment als Alternative.', empfohleneAktion: 'angebot_erstellen', produktEmpfehlung: 'UnionDepot Sparplan', status: 'identifiziert' },
    { titel: 'R+V BU KRITISCH', typ: 'cross_sell', quellen: ['bestand'], prioritaet: 'kritisch', volumen: 1200, volumenTyp: 'jaehrlich', beschreibung: 'Jung, keine BU! Jetzt günstig abschließen.', empfohleneAktion: 'angebot_erstellen', produktEmpfehlung: 'R+V BU Start', status: 'identifiziert' },
    { titel: 'VR-FinanzPlan Jung', typ: 'cross_sell', quellen: ['bestand'], prioritaet: 'mittel', volumen: 0, volumenTyp: 'vermittlung', beschreibung: 'Grundlegende Finanzplanung für Berufseinsteiger.', empfohleneAktion: 'termin_vereinbaren', produktEmpfehlung: 'VR-FinanzPlan', status: 'identifiziert' },
    { titel: 'BSV für spätere Immobilie', typ: 'cross_sell', quellen: ['lebensereignis'], prioritaet: 'niedrig', volumen: 25000, volumenTyp: 'einmalig', beschreibung: 'Wohnungskauf in 3-5 Jahren denkbar. BSV jetzt starten.', empfohleneAktion: 'angebot_erstellen', produktEmpfehlung: 'Schwäbisch Hall', status: 'identifiziert' },
  ],
  kommunikation: [],
  absicherung: { vorhanden: ['girokonto'], fehlend: ['bu', 'depot_vr', 'finanzplan'] },
};

// B5: Andrea Lang
export const B5 = {
  name: 'Andrea Lang', id: 'BK00005', alter: 41,
  beruf: 'Inhaberin 3 Cafés (18 MA)', nettoeinkommen: 5500,
  familienstand: 'geschieden', partner: null,
  kinder: [{ name: 'Mia', alter: 10 }],
  wohnsituation: 'miete', wohnflaeche: 85,
  nps: 8, risikoscore: 38, potentialScore: 4.3, abwanderungsrisiko: 'niedrig',
  eigeneProdukte: [
    { typ: 'geschaeftskonto1', sparte: 'konto', produkt: 'VR-BusinessKonto', details: 'Café 1 Innenstadt', praemie: 25, seit: '2016-01', status: 'aktiv', volumen: 18000 },
    { typ: 'geschaeftskonto2', sparte: 'konto', produkt: 'VR-BusinessKonto', details: 'Café 2 Bahnhof', praemie: 25, seit: '2019-01', status: 'aktiv', volumen: 12000 },
    { typ: 'geschaeftskonto3', sparte: 'konto', produkt: 'VR-BusinessKonto', details: 'Café 3 Uni', praemie: 25, seit: '2023-01', status: 'aktiv', volumen: 8000 },
    { typ: 'kk', sparte: 'karte', produkt: 'VR-BusinessCard', details: 'Limit 100k, 40k genutzt', praemie: 120, seit: '2017-01', status: 'aktiv' },
    { typ: 'kfw', sparte: 'kredit', produkt: 'KfW Gründerkredit', details: 'Rest 65k', praemie: 0, seit: '2019-01', status: 'aktiv', volumen: 65000 },
    { typ: 'smartfinanz', sparte: 'kredit', produkt: 'VR-SmartFinanz', details: 'Betriebsmittel 12k', praemie: 0, seit: '2024-01', status: 'aktiv', volumen: 12000 },
  ],
  fremdProdukte: [
    { typ: 'privatkonto', institut: 'ING', details: 'Privat-Girokonto', volumen: 22000, consent: true },
    { typ: 'inhaltsversicherung', institut: 'Allianz', details: 'Inventar 3 Cafés', volumen: 2400, consent: false },
    { typ: 'betriebshaftpflicht', institut: 'VHV', details: 'Gastro-HP', volumen: 1800, consent: false },
  ],
  transaktionen: [
    { kategorie: 'einkommen', betrag: 5500, empfaenger: 'Cafes' },
    { kategorie: 'miete', betrag: -950, empfaenger: 'Vermieter' },
    { kategorie: 'geschaeft', betrag: -3200, empfaenger: 'Waren, Personal' },
    { kategorie: 'versicherung', betrag: -350, empfaenger: 'Allianz, VHV' },
  ],
  potentiale: [
    { titel: 'R+V Gewerbe-Bündel', typ: 'cross_sell', quellen: ['wettbewerb'], prioritaet: 'hoch', volumen: 4200, volumenTyp: 'jaehrlich', beschreibung: 'Allianz+VHV separat. R+V Gewerbebündel für alle 3 Cafés.', empfohleneAktion: 'angebot_erstellen', produktEmpfehlung: 'R+V Gewerbe-Bündel Gastro', status: 'angeschrieben' },
    { titel: 'Expansion Standort 4', typ: 'cross_sell', quellen: ['bestand', 'finanztransaktion'], prioritaet: 'hoch', volumen: 80000, volumenTyp: 'einmalig', beschreibung: '4. Café geplant. KfW Förderkredit + VR-Kredit Kombi.', empfohleneAktion: 'termin_vereinbaren', produktEmpfehlung: 'KfW + VR-Gewerbekredit', status: 'termin' },
    { titel: 'bAV für 18 Mitarbeiter', typ: 'cross_sell', quellen: ['bestand'], prioritaet: 'hoch', volumen: 0, volumenTyp: 'vermittlung', beschreibung: '18 MA. bAV-Pflicht mit AG-Zuschuss.', empfohleneAktion: 'termin_vereinbaren', produktEmpfehlung: 'R+V bAV', status: 'identifiziert' },
    { titel: 'Union Investment Privat', typ: 'cross_sell', quellen: ['finanztransaktion'], prioritaet: 'mittel', volumen: 22000, volumenTyp: 'einmalig', beschreibung: 'ING Privatkonto. Vermögensaufbau bei VR starten.', empfohleneAktion: 'angebot_erstellen', produktEmpfehlung: 'UnionDepot', status: 'identifiziert' },
  ],
  kommunikation: [
    { datum: '2026-03-08', typ: 'termin', richtung: 'ausgehend', betreff: 'Expansion Standort 4', zusammenfassung: 'Businessplan für 4. Café besprochen. Finanzierung 80k nötig.' },
  ],
  absicherung: { vorhanden: ['geschaeftskonto', 'kredit', 'kreditlinie'], fehlend: ['gewerbebuendel_rv', 'bav', 'depot'] },
};

// B6: Stefan Braun
export const B6 = {
  name: 'Stefan Braun', id: 'BK00006', alter: 36,
  beruf: 'IT-Freelancer', nettoeinkommen: 6800,
  familienstand: 'ledig', partner: null, kinder: [],
  wohnsituation: 'miete', wohnflaeche: 65,
  nps: 4, risikoscore: 55, potentialScore: 3.8, abwanderungsrisiko: 'hoch',
  eigeneProdukte: [
    { typ: 'girokonto', sparte: 'konto', produkt: 'VR-MeinKonto', details: 'Kindheitskonto, kaum genutzt', praemie: 0, seit: '2000-01', status: 'aktiv', volumen: 800 },
  ],
  fremdProdukte: [
    { typ: 'business_konto', institut: 'N26', details: 'Business Konto', volumen: 12000, consent: true },
    { typ: 'privat_konto', institut: 'N26', details: 'Privat', volumen: 3000, consent: true },
    { typ: 'depot', institut: 'Trade Republic', details: 'Tech + Krypto-ETP', volumen: 68000, consent: true },
    { typ: 'depot2', institut: 'Scalable Capital', details: 'ETF World', volumen: 15000, consent: true },
    { typ: 'it_hp', institut: 'Hiscox', details: 'IT-Berufshaftpflicht', volumen: 1200, consent: false },
    { typ: 'haftpflicht', institut: 'CosmosDirekt', details: 'Privathaftpflicht', volumen: 40, consent: false },
  ],
  transaktionen: [
    { kategorie: 'einkommen', betrag: 6800, empfaenger: 'Div. Auftraggeber' },
    { kategorie: 'miete', betrag: -1200, empfaenger: 'Vermieter' },
    { kategorie: 'sparplan', betrag: -500, empfaenger: 'Trade Republic' },
    { kategorie: 'sparplan2', betrag: -200, empfaenger: 'Scalable Capital' },
    { kategorie: 'konsum', betrag: -2000, empfaenger: 'Diverse' },
    { kategorie: 'software', betrag: -200, empfaenger: 'Cloud, Tools' },
  ],
  potentiale: [
    { titel: 'R+V BU KRITISCH', typ: 'cross_sell', quellen: ['bestand'], prioritaet: 'kritisch', volumen: 2400, volumenTyp: 'jaehrlich', beschreibung: 'IT-Freelancer ohne BU! Hohes Einkommen, keine Absicherung.', empfohleneAktion: 'angebot_erstellen', produktEmpfehlung: 'R+V BU IT-Spezial', status: 'identifiziert' },
    { titel: 'VR-Geschäftskonto', typ: 'cross_sell', quellen: ['finanztransaktion'], prioritaet: 'hoch', volumen: 12000, volumenTyp: 'einmalig', beschreibung: 'N26 Business nicht professionell. VR-BusinessKonto anbieten.', empfohleneAktion: 'angebot_erstellen', produktEmpfehlung: 'VR-BusinessKonto Plus', status: 'identifiziert' },
    { titel: 'Union Investment Depot', typ: 'cross_sell', quellen: ['finanztransaktion'], prioritaet: 'mittel', volumen: 83000, volumenTyp: 'einmalig', beschreibung: '83k bei TradeRep+Scalable. Union Investment Beratungsdepot.', empfohleneAktion: 'termin_vereinbaren', produktEmpfehlung: 'UnionDepot', status: 'identifiziert' },
    { titel: 'Rürup-Rente Freelancer', typ: 'cross_sell', quellen: ['bestand'], prioritaet: 'mittel', volumen: 6000, volumenTyp: 'jaehrlich', beschreibung: 'Keine Altersvorsorge. Rürup steuerlich attraktiv.', empfohleneAktion: 'angebot_erstellen', produktEmpfehlung: 'R+V Rürup Rente', status: 'identifiziert' },
  ],
  kommunikation: [],
  absicherung: { vorhanden: ['girokonto'], fehlend: ['bu', 'geschaeftskonto_vr', 'depot_vr', 'altersvorsorge'] },
};
