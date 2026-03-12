// V5: Klaus Meier
export const V5 = {
  name: 'Klaus Meier', id: 'KD00005', alter: 48,
  beruf: 'Beamter A14 PKV', arbeitgeber: { name: 'Bezirksregierung Gießen', quelle: 'linkedin', bestaetigt: true }, nettoeinkommen: 4600,
  familienstand: 'verheiratet',
  partner: { name: 'Petra', beruf: 'Grundschullehrerin', einkommen: 2200 },
  kinder: [{ name: 'Sophie', alter: 16 }, { name: 'Felix', alter: 13 }, { name: 'Tim', alter: 9 }],
  wohnsituation: 'eigentum', wohnflaeche: 160,
  linkedin: { kontakte: 80, aktivitaet: 'niedrig', branchen: ['Verwaltung'] },
  lebenssituation: 'konsolidierung',
  nps: 7, risikoscore: 22, potentialScore: 3.5, abwanderungsrisiko: 'niedrig',
  eigeneProdukte: [
    { typ: 'wohngebaeude', sparte: 'schaden', produkt: 'ERGO Wohngebäude Premium', details: '160qm, Baujahr 2005', praemie: 980, seit: '2005-08', status: 'aktiv' },
    { typ: 'hausrat', sparte: 'schaden', produkt: 'ERGO Hausrat Komfort', details: '160qm + Elementar', praemie: 280, seit: '2005-08', status: 'aktiv' },
    { typ: 'haftpflicht', sparte: 'schaden', produkt: 'ERGO Privat Premium', details: 'Familie 10M\u20ac', praemie: 110, seit: '2005-08', status: 'aktiv' },
    { typ: 'kfz', sparte: 'kfz', produkt: 'VW Passat VK', details: '500\u20ac SB, SF-18', praemie: 720, seit: '2019-01', status: 'aktiv' },
    { typ: 'kfz2', sparte: 'kfz', produkt: 'Opel Corsa Zweitwagen', details: 'TK', praemie: 260, seit: '2023-01', status: 'aktiv' },
    { typ: 'pkv', sparte: 'kranken', produkt: 'ERGO PKV Beamte Komfort', details: 'Familie, Beihilfe 50%', praemie: 4300, seit: '2008-01', status: 'aktiv' },
  ],
  fremdProdukte: [
    { typ: 'girokonto', institut: 'Sparkasse', details: 'Gehaltseingang', volumen: 42000, consent: true },
    { typ: 'bausparvertrag', institut: 'LBS', details: 'Ansparphase', volumen: 25000, consent: true },
    { typ: 'depot', institut: 'DWS', details: 'Gemischte Fonds', volumen: 35000, consent: true },
    { typ: 'du', institut: 'DBV', details: 'Dienstunfähigkeit', volumen: 1200, consent: true },
  ],
  transaktionen: [
    { kategorie: 'gehalt', betrag: 4600, empfaenger: 'Land Hessen' },
    { kategorie: 'gehalt_partner', betrag: 2200, empfaenger: 'Land Hessen' },
    { kategorie: 'kindergeld', betrag: 750, empfaenger: 'Familienkasse' },
    { kategorie: 'versicherung_eigen', betrag: -540, empfaenger: 'ERGO' },
    { kategorie: 'versicherung_fremd', betrag: -100, empfaenger: 'DBV' },
    { kategorie: 'konsum', betrag: -2000, empfaenger: 'Diverse' },
    { kategorie: 'kinder', betrag: -600, empfaenger: 'Vereine, Nachhilfe' },
  ],
  potentiale: [
    { titel: 'PKV-Optimierung Selbstbehalt', typ: 'anpassung', quellen: ['bestand'], prioritaet: 'mittel', volumen: -400, volumenTyp: 'jaehrlich', beschreibung: 'Erhöhung SB auf 600\u20ac spart ca. 400\u20ac/J.', empfohleneAktion: 'angebot_erstellen', produktEmpfehlung: 'ERGO PKV Beamte Optimal', status: 'identifiziert' },
    { titel: 'DU-Wechsel DBV\u2192ERGO', typ: 'anpassung', quellen: ['wettbewerb'], prioritaet: 'hoch', volumen: 1200, volumenTyp: 'jaehrlich', beschreibung: 'DBV DU-Tarif veraltet. ERGO DU mit besserem Leistungskatalog.', empfohleneAktion: 'tarifvergleich', produktEmpfehlung: 'ERGO DU Beamte Plus', status: 'angeschrieben' },
    { titel: 'Pflegezusatz Ehepaar', typ: 'whitespot', quellen: ['bestand', 'lebensereignis'], prioritaet: 'mittel', volumen: 960, volumenTyp: 'jaehrlich', beschreibung: 'Beide 48, Pflege-Vorsorge noch günstig.', empfohleneAktion: 'angebot_erstellen', produktEmpfehlung: 'ERGO Pflege-Schutz', status: 'identifiziert' },
    { titel: 'Fondspolice statt DWS-Depot', typ: 'whitespot', quellen: ['finanztransaktion'], prioritaet: 'mittel', volumen: 35000, volumenTyp: 'einmalig', beschreibung: '35k bei DWS. Fondspolice mit Steuervorteilen.', empfohleneAktion: 'termin_vereinbaren', produktEmpfehlung: 'ERGO Rente Balance', status: 'identifiziert' },
    { titel: 'Kinderunfall-Versicherung', typ: 'whitespot', quellen: ['bestand'], prioritaet: 'niedrig', volumen: 180, volumenTyp: 'jaehrlich', beschreibung: '3 Kinder, aktiv im Sportverein.', empfohleneAktion: 'angebot_erstellen', produktEmpfehlung: 'ERGO Kinderunfall', status: 'identifiziert' },
  ],
  kommunikation: [
    { datum: '2026-01-15', typ: 'termin', richtung: 'ausgehend', betreff: 'PKV-Check', zusammenfassung: 'Tarif-Check durchgeführt. Kunde zufrieden, aber offen für DU-Wechsel.' },
  ],
  absicherung: {
    vorhanden: ['wohngebaeude', 'hausrat', 'haftpflicht', 'kfz', 'pkv'],
    fehlend: ['pflege', 'unfall_kinder', 'rechtsschutz'],
  },
};

// V6: Lisa Bauer
export const V6 = {
  name: 'Lisa Bauer', id: 'KD00006', alter: 31,
  beruf: 'Marketing-Managerin', arbeitgeber: { name: 'SAP SE', quelle: 'linkedin', bestaetigt: false }, nettoeinkommen: 2800,
  familienstand: 'ledig', partner: null, kinder: [],
  wohnsituation: 'miete', wohnflaeche: 45,
  linkedin: { kontakte: 1200, aktivitaet: 'hoch', branchen: ['Design', 'Kreativwirtschaft'] },
  lebenssituation: 'aufbau',
  nps: 8, risikoscore: 45, potentialScore: 4.0, abwanderungsrisiko: 'niedrig',
  eigeneProdukte: [
    { typ: 'haftpflicht', sparte: 'schaden', produkt: 'ERGO Privat Basis', details: 'Single 5M\u20ac', praemie: 55, seit: '2023-06', status: 'aktiv' },
  ],
  fremdProdukte: [
    { typ: 'geschaeftskonto', institut: 'Holvi', details: 'Freelancer-Konto', volumen: 4500, consent: true },
    { typ: 'girokonto', institut: 'DKB', details: 'Privatkonto', volumen: 2800, consent: true },
    { typ: 'kuenstlersozialkasse', institut: 'KSK', details: 'Pflichtversichert', volumen: 0, consent: false },
  ],
  transaktionen: [
    { kategorie: 'einkommen', betrag: 2800, empfaenger: 'Diverse Kunden' },
    { kategorie: 'miete', betrag: -650, empfaenger: 'Vermieter' },
    { kategorie: 'versicherung_eigen', betrag: -5, empfaenger: 'ERGO' },
    { kategorie: 'software', betrag: -120, empfaenger: 'Adobe, Figma' },
    { kategorie: 'konsum', betrag: -800, empfaenger: 'Diverse' },
  ],
  potentiale: [
    { titel: 'BU-Versicherung Kreativberuf', typ: 'whitespot', quellen: ['bestand'], prioritaet: 'kritisch', volumen: 1080, volumenTyp: 'jaehrlich', beschreibung: 'Freelancerin ohne BU! Existenzbedrohend bei Ausfall.', empfohleneAktion: 'angebot_erstellen', produktEmpfehlung: 'ERGO BU Comfort', status: 'identifiziert' },
    { titel: 'Berufshaftpflicht Freelancer', typ: 'whitespot', quellen: ['bestand'], prioritaet: 'hoch', volumen: 350, volumenTyp: 'jaehrlich', beschreibung: 'Kein beruflicher Haftpflichtschutz. Wichtig für Auftraggeber.', empfohleneAktion: 'angebot_erstellen', produktEmpfehlung: 'ERGO Berufshaftpflicht', status: 'identifiziert' },
    { titel: 'Hausratversicherung', typ: 'whitespot', quellen: ['bestand'], prioritaet: 'mittel', volumen: 65, volumenTyp: 'jaehrlich', beschreibung: 'Teure Arbeitsgeräte (iMac, iPad Pro) nicht versichert.', empfohleneAktion: 'angebot_erstellen', produktEmpfehlung: 'ERGO Hausrat Basis + Elektronik', status: 'identifiziert' },
    { titel: 'Rürup-Rente Selbständige', typ: 'whitespot', quellen: ['finanztransaktion'], prioritaet: 'mittel', volumen: 2400, volumenTyp: 'jaehrlich', beschreibung: 'Keine Altersvorsorge ausser KSK. Steuerlich absetzbar.', empfohleneAktion: 'termin_vereinbaren', produktEmpfehlung: 'ERGO Rürup Rente', status: 'identifiziert' },
  ],
  kommunikation: [
    { datum: '2026-03-08', typ: 'chatbot', richtung: 'eingehend', betreff: 'BU-Anfrage', zusammenfassung: 'Kundin hat im Chatbot nach BU-Versicherung für Freelancer gefragt.' },
  ],
  absicherung: {
    vorhanden: ['haftpflicht'],
    fehlend: ['bu', 'berufshaftpflicht', 'hausrat', 'rechtsschutz', 'altersvorsorge'],
  },
};

// V7: Michael Braun
export const V7 = {
  name: 'Michael Braun', id: 'KD00007', alter: 62,
  beruf: 'Lehrer Gymnasium', arbeitgeber: { name: 'Friedrich-Schiller-Gymnasium', quelle: 'linkedin', bestaetigt: true }, nettoeinkommen: 3200,
  familienstand: 'verheiratet',
  partner: { name: 'Renate', beruf: 'Ruhestand', einkommen: 1800 },
  kinder: [{ name: 'Stefan', alter: 35 }, { name: 'Katrin', alter: 32 }],
  wohnsituation: 'eigentum', wohnflaeche: 200,
  linkedin: { kontakte: 200, aktivitaet: 'niedrig', branchen: ['Maschinenbau'] },
  lebenssituation: 'ruhestand',
  nps: 8, risikoscore: 15, potentialScore: 3.0, abwanderungsrisiko: 'niedrig',
  eigeneProdukte: [
    { typ: 'wohngebaeude', sparte: 'schaden', produkt: 'ERGO Wohngebäude Basis', details: '200qm, Baujahr 1985', praemie: 850, seit: '2000-01', status: 'optimierbar' },
    { typ: 'hausrat', sparte: 'schaden', produkt: 'ERGO Hausrat Komfort', details: '200qm', praemie: 350, seit: '2000-01', status: 'aktiv' },
    { typ: 'haftpflicht', sparte: 'schaden', produkt: 'ERGO Privat Familie', details: '10M\u20ac', praemie: 95, seit: '2000-01', status: 'aktiv' },
    { typ: 'kfz', sparte: 'kfz', produkt: 'Mercedes E-Klasse VK', details: '500\u20ac SB, SF-30', praemie: 680, seit: '2021-01', status: 'aktiv' },
    { typ: 'rechtsschutz', sparte: 'schaden', produkt: 'ERGO Rechtsschutz Familie', details: 'Privat + Verkehr', praemie: 320, seit: '2010-01', status: 'aktiv' },
    { typ: 'unfall', sparte: 'schaden', produkt: 'ERGO Unfall Senior', details: 'Ehepaar', praemie: 480, seit: '2015-01', status: 'aktiv' },
  ],
  fremdProdukte: [
    { typ: 'girokonto', institut: 'Sparkasse', details: 'Renteneingang', volumen: 15000, consent: true },
    { typ: 'festgeld', institut: 'Sparkasse', details: '2,5% bis 2027', volumen: 80000, consent: true },
    { typ: 'depot', institut: 'Deka', details: 'Gemischte Fonds', volumen: 145000, consent: true },
    { typ: 'pkv', institut: 'DKV', details: 'Privatversicherung', volumen: 680, consent: true },
  ],
  transaktionen: [
    { kategorie: 'rente', betrag: 3200, empfaenger: 'Deutsche Rentenversicherung' },
    { kategorie: 'rente_partner', betrag: 1800, empfaenger: 'Betriebsrente' },
    { kategorie: 'versicherung_eigen', betrag: -230, empfaenger: 'ERGO' },
    { kategorie: 'versicherung_fremd', betrag: -680, empfaenger: 'DKV' },
    { kategorie: 'haus', betrag: -500, empfaenger: 'Nebenkosten' },
    { kategorie: 'konsum', betrag: -1200, empfaenger: 'Diverse' },
  ],
  potentiale: [
    { titel: 'Pflegezusatz Ehepaar', typ: 'whitespot', quellen: ['bestand', 'lebensereignis'], prioritaet: 'hoch', volumen: 1440, volumenTyp: 'jaehrlich', beschreibung: 'Beide über 60, kein Pflegeschutz. Noch versicherbar.', empfohleneAktion: 'angebot_erstellen', produktEmpfehlung: 'ERGO Pflege-Schutz Premium', status: 'angeschrieben' },
    { titel: 'Sterbegeld-Versicherung', typ: 'whitespot', quellen: ['lebensereignis'], prioritaet: 'mittel', volumen: 600, volumenTyp: 'jaehrlich', beschreibung: 'Bestattungsvorsorge für Ehepaar.', empfohleneAktion: 'angebot_erstellen', produktEmpfehlung: 'ERGO Sterbegeld', status: 'identifiziert' },
    { titel: 'Fondspolice statt Deka-Depot', typ: 'whitespot', quellen: ['finanztransaktion'], prioritaet: 'mittel', volumen: 145000, volumenTyp: 'einmalig', beschreibung: '145k bei Deka. Umschichtung in steueroptimierte Fondspolice.', empfohleneAktion: 'termin_vereinbaren', produktEmpfehlung: 'ERGO Rente Balance', status: 'identifiziert' },
    { titel: 'Wohngebäude-Update', typ: 'anpassung', quellen: ['bestand'], prioritaet: 'mittel', volumen: 200, volumenTyp: 'jaehrlich', beschreibung: 'Basis-Tarif von 2000. Elementar fehlt, Unterversicherung möglich.', empfohleneAktion: 'angebot_erstellen', produktEmpfehlung: 'ERGO Wohngebäude Premium + Elementar', status: 'identifiziert' },
    { titel: 'Enkelkind-Vorsorge', typ: 'cross_sell', quellen: ['lebensereignis'], prioritaet: 'niedrig', volumen: 1200, volumenTyp: 'jaehrlich', beschreibung: 'Enkel (2 Jahre). Ausbildungsversicherung/Fondssparplan.', empfohleneAktion: 'angebot_erstellen', produktEmpfehlung: 'ERGO Junior Vorsorge', status: 'identifiziert' },
  ],
  kommunikation: [
    { datum: '2026-02-20', typ: 'termin', richtung: 'ausgehend', betreff: 'Pflege-Beratung', zusammenfassung: 'Ehepaar informiert über Pflege-Zuschuss. Interesse, aber erst Bedenken abwägen.' },
  ],
  absicherung: {
    vorhanden: ['wohngebaeude', 'hausrat', 'haftpflicht', 'kfz', 'rechtsschutz', 'unfall'],
    fehlend: ['pflege', 'sterbegeld'],
  },
};

// V8: Sandra Yilmaz
export const V8 = {
  name: 'Sandra Yilmaz', id: 'KD00008', alter: 38,
  beruf: 'Pharma-Referentin', arbeitgeber: { name: 'Boehringer Ingelheim', quelle: 'linkedin', bestaetigt: false }, nettoeinkommen: 5200,
  familienstand: 'verheiratet',
  partner: { name: 'Mehmet', beruf: 'Zahnarzt (selbständig)', einkommen: 6500 },
  kinder: [{ name: 'Leyla', alter: 5 }],
  wohnsituation: 'miete', wohnflaeche: 110,
  linkedin: { kontakte: 600, aktivitaet: 'hoch', branchen: ['Pharma', 'Medizin'] },
  lebenssituation: 'aufbau',
  nps: 7, risikoscore: 20, potentialScore: 4.5, abwanderungsrisiko: 'niedrig',
  eigeneProdukte: [
    { typ: 'bu', sparte: 'leben', produkt: 'ERGO BU Comfort', details: '2.200\u20ac/mtl.', praemie: 1680, seit: '2019-01', status: 'optimierbar' },
    { typ: 'haftpflicht', sparte: 'schaden', produkt: 'ERGO Privat Premium', details: 'Familie', praemie: 105, seit: '2019-01', status: 'aktiv' },
    { typ: 'kfz', sparte: 'kfz', produkt: 'BMW X1 VK', details: '500\u20ac SB', praemie: 850, seit: '2022-01', status: 'aktiv' },
  ],
  fremdProdukte: [
    { typ: 'girokonto', institut: 'ING', details: 'Gehaltseingang', volumen: 12000, consent: true },
    { typ: 'tagesgeld', institut: 'ING', details: '2,0%', volumen: 95000, consent: true },
    { typ: 'depot', institut: 'ING', details: 'ETF + Einzelaktien', volumen: 85000, consent: true },
    { typ: 'pkv_ehemann', institut: 'Signal Iduna', details: 'PKV Zahnarzt', volumen: 850, consent: true },
    { typ: 'praxis_hp', institut: 'HDI', details: 'Praxis-Haftpflicht', volumen: 1200, consent: false },
  ],
  transaktionen: [
    { kategorie: 'gehalt', betrag: 5200, empfaenger: 'Pharma AG' },
    { kategorie: 'gehalt_partner', betrag: 6500, empfaenger: 'Praxis' },
    { kategorie: 'kindergeld', betrag: 250, empfaenger: 'Familienkasse' },
    { kategorie: 'miete', betrag: -1600, empfaenger: 'Vermieter' },
    { kategorie: 'versicherung_eigen', betrag: -220, empfaenger: 'ERGO' },
    { kategorie: 'versicherung_fremd', betrag: -850, empfaenger: 'Signal Iduna' },
    { kategorie: 'sparplan', betrag: -800, empfaenger: 'ING Depot' },
    { kategorie: 'konsum', betrag: -2500, empfaenger: 'Diverse' },
    { kategorie: 'kinder', betrag: -400, empfaenger: 'Kita' },
  ],
  potentiale: [
    { titel: 'BU-Nachversicherung 2.200\u21923.200\u20ac', typ: 'anpassung', quellen: ['bestand', 'lebensereignis'], prioritaet: 'hoch', volumen: 1200, volumenTyp: 'jaehrlich', beschreibung: 'Einkommen deutlich gestiegen. BU deckt nur 42%.', empfohleneAktion: 'angebot_erstellen', produktEmpfehlung: 'ERGO BU Comfort Plus', status: 'termin' },
    { titel: 'RLV Baufi-Vorbereitung', typ: 'whitespot', quellen: ['lebensereignis'], prioritaet: 'hoch', volumen: 480, volumenTyp: 'jaehrlich', beschreibung: 'Immobilienkauf geplant 2027. RLV jetzt abschliessen.', empfohleneAktion: 'angebot_erstellen', produktEmpfehlung: 'ERGO Risikoleben', status: 'identifiziert' },
    { titel: 'Wohngebäude vormerken', typ: 'cross_sell', quellen: ['lebensereignis'], prioritaet: 'mittel', volumen: 1200, volumenTyp: 'jaehrlich', beschreibung: 'Hauskauf geplant. Wohngebäude-Police vorbereiten.', empfohleneAktion: 'termin_vereinbaren', produktEmpfehlung: 'ERGO Wohngebäude Premium', status: 'identifiziert' },
    { titel: 'Fondspolice statt ING-Depot', typ: 'whitespot', quellen: ['finanztransaktion'], prioritaet: 'mittel', volumen: 85000, volumenTyp: 'einmalig', beschreibung: '85k bei ING. Teilumschichtung in Fondspolice.', empfohleneAktion: 'termin_vereinbaren', produktEmpfehlung: 'ERGO Rente Balance', status: 'identifiziert' },
  ],
  kommunikation: [
    { datum: '2026-03-10', typ: 'termin', richtung: 'ausgehend', betreff: 'BU-Upgrade Beratung', zusammenfassung: 'Termin für BU-Nachversicherung steht. Kundin möchte auch RLV besprechen.' },
  ],
  absicherung: {
    vorhanden: ['bu', 'haftpflicht', 'kfz'],
    fehlend: ['rlv', 'hausrat', 'rechtsschutz', 'wohngebaeude_vormerken'],
  },
};
