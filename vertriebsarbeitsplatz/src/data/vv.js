// W1: Dr. Heinrich von Trott
export const W1 = {
  name: 'Dr. Heinrich von Trott', id: 'VV00001', alter: 62,
  beruf: 'Unternehmer Maschinenbau 3.Gen', nettoeinkommen: 25000,
  familienstand: 'verheiratet',
  partner: { name: 'Elisabeth', beruf: 'Stiftungsvorstand', einkommen: 0 },
  kinder: [{ name: 'Charlotte', alter: 32 }, { name: 'Friedrich', alter: 28 }],
  wohnsituation: 'eigentum', wohnflaeche: 450,
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
    { titel: 'UBS-Konsolidierung 3,2M', typ: 'konsolidierung', quellen: ['finanztransaktion'], prioritaet: 'hoch', volumen: 3200000, volumenTyp: 'einmalig', beschreibung: '2,8M UBS + 400k DB Cash. Konsolidierung ins FairValue Mandat.', empfohleneAktion: 'termin_vereinbaren', produktEmpfehlung: 'FairValue Erweiterung', status: 'angeschrieben' },
    { titel: 'NextGen Tochter Charlotte', typ: 'nextgen', quellen: ['lebensereignis'], prioritaet: 'hoch', volumen: 0, volumenTyp: 'vermittlung', beschreibung: 'Charlotte (32), Anwaeltin, eigenes Vermoegen ca. 800k. SmartValue Mandat.', empfohleneAktion: 'termin_vereinbaren', produktEmpfehlung: 'SmartValue Mandat', status: 'identifiziert' },
    { titel: 'Nachfolge Maschinenbau GmbH', typ: 'beratung', quellen: ['lebensereignis'], prioritaet: 'hoch', volumen: 0, volumenTyp: 'vermittlung', beschreibung: 'Friedrich (28) als Nachfolger? Firmenbewertung, Steuerplanung.', empfohleneAktion: 'termin_vereinbaren', produktEmpfehlung: 'Nachfolgeberatung', status: 'termin' },
    { titel: 'Stiftung gruenden', typ: 'beratung', quellen: ['lebensereignis'], prioritaet: 'mittel', volumen: 2000000, volumenTyp: 'einmalig', beschreibung: 'Elisabeth engagiert sich sozial. Familienstiftung pruefen.', empfohleneAktion: 'termin_vereinbaren', produktEmpfehlung: 'Stiftungsmandat', status: 'identifiziert' },
    { titel: 'LV-Ablauf 2026 Wiederanlage', typ: 'konsolidierung', quellen: ['bestand', 'finanztransaktion'], prioritaet: 'hoch', volumen: 320000, volumenTyp: 'einmalig', beschreibung: 'Alte Leipziger LV laeuft 2026 ab. Ins Mandat einbringen.', empfohleneAktion: 'termin_vereinbaren', produktEmpfehlung: 'FairValue Erweiterung', status: 'termin' },
    { titel: 'ESG-Upgrade Portfolio', typ: 'anpassung', quellen: ['bestand'], prioritaet: 'mittel', volumen: 0, volumenTyp: 'vermittlung', beschreibung: 'ESG-Score 68, Ziel >80. Art.8 auf Art.9 upgraden.', empfohleneAktion: 'angebot_erstellen', produktEmpfehlung: 'ESG Art.9 Mandat', status: 'identifiziert' },
  ],
  kommunikation: [
    { datum: '2026-03-01', typ: 'termin', richtung: 'ausgehend', betreff: 'Quartalsbericht Q4', zusammenfassung: 'Portfolio +6,2% in Q4. UBS-Konsolidierung besprochen, Mandant offen.' },
    { datum: '2026-02-15', typ: 'email', richtung: 'eingehend', betreff: 'Nachfolge Friedrich', zusammenfassung: 'Mandant moechte Friedrich in naechstes Meeting einladen.' },
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
  beruf: 'SaaS-Exit 2024 (8M netto)', nettoeinkommen: 15000,
  familienstand: 'verheiratet',
  partner: { name: 'Julia', beruf: 'CTO (eigenes Startup)', einkommen: 8000 },
  kinder: [{ name: 'Noah', alter: 18 }, { name: 'Ella', alter: 15 }],
  wohnsituation: 'eigentum', wohnflaeche: 280,
  nps: 8, risikoscore: 25, potentialScore: 5.0, abwanderungsrisiko: 'mittel',
  mandatsTyp: 'SmartValue',
  aum: 2100000,
  eigeneProdukte: [
    { typ: 'mandat', sparte: 'vv', produkt: 'SmartValue Mandat', details: 'Wachstum, Tech-Fokus', praemie: 0, seit: '2024-06', status: 'aktiv', volumen: 2100000 },
    { typ: 'pe', sparte: 'vv', produkt: 'PE Healthcare Fund', details: 'Co-Investment', praemie: 0, seit: '2024-09', status: 'aktiv', volumen: 300000 },
  ],
  fremdProdukte: [
    { typ: 'cash', institut: 'Commerzbank', details: 'CASH GEPARKT! Exit-Erloese', volumen: 5500000, consent: true },
    { typ: 'tagesgeld', institut: 'Deutsche Bank', details: '1,5%', volumen: 200000, consent: true },
    { typ: 'immobilien', institut: 'Privat', details: 'EFH + Ferienwohnung', volumen: 1650000, consent: false },
    { typ: 'angel', institut: 'Privat', details: '4 Angel Investments', volumen: 400000, consent: false },
    { typ: 'lv', institut: 'Zurich', details: 'LV Ablauf 2029', volumen: 180000, consent: true },
  ],
  potentiale: [
    { titel: 'Cash-Konsolidierung 5,5M KRITISCH', typ: 'konsolidierung', quellen: ['finanztransaktion'], prioritaet: 'kritisch', volumen: 5500000, volumenTyp: 'einmalig', beschreibung: '5,5M Cash bei Commerzbank! Inflation frisst Wert. Sofort investieren.', empfohleneAktion: 'termin_vereinbaren', produktEmpfehlung: 'FairValue Mandat', status: 'termin' },
    { titel: 'Mandats-Upgrade SmartValue\u2192FairValue', typ: 'anpassung', quellen: ['bestand'], prioritaet: 'hoch', volumen: 0, volumenTyp: 'vermittlung', beschreibung: 'Bei Konsolidierung: Upgrade auf FairValue Mandat sinnvoll.', empfohleneAktion: 'angebot_erstellen', produktEmpfehlung: 'FairValue Mandat', status: 'identifiziert' },
    { titel: 'PE Allokation erhoehen', typ: 'cross_sell', quellen: ['bestand'], prioritaet: 'mittel', volumen: 500000, volumenTyp: 'einmalig', beschreibung: 'Nur 300k PE. Bei 7,6M AuM-Ziel: 1M PE sinnvoll.', empfohleneAktion: 'angebot_erstellen', produktEmpfehlung: 'PE Fund Basket', status: 'identifiziert' },
    { titel: 'NextGen Noah (18) Studiendepot', typ: 'nextgen', quellen: ['lebensereignis'], prioritaet: 'mittel', volumen: 100000, volumenTyp: 'einmalig', beschreibung: 'Noah beginnt Studium. Studiendepot mit SmartValue.', empfohleneAktion: 'termin_vereinbaren', produktEmpfehlung: 'SmartValue Junior', status: 'identifiziert' },
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
  beruf: 'Bildungsstiftung (seit 2008)', nettoeinkommen: 0,
  familienstand: 'institution', partner: null, kinder: [],
  wohnsituation: 'institution', wohnflaeche: 0,
  nps: 9, risikoscore: 10, potentialScore: 3.5, abwanderungsrisiko: 'niedrig',
  mandatsTyp: 'Spezialmandat',
  aum: 8300000,
  eigeneProdukte: [
    { typ: 'mandat', sparte: 'vv', produkt: 'Spezialmandat Stiftung', details: 'Defensiv, ESG Art.8, Ausschuettung 3%', praemie: 0, seit: '2008-01', status: 'aktiv', volumen: 8300000 },
  ],
  fremdProdukte: [
    { typ: 'festgeld', institut: 'Sparkasse', details: '2,0% bis 2027', volumen: 500000, consent: true },
  ],
  potentiale: [
    { titel: 'ESG Art.9 Upgrade', typ: 'anpassung', quellen: ['bestand'], prioritaet: 'hoch', volumen: 0, volumenTyp: 'vermittlung', beschreibung: 'ESG-Score 72, Ziel >80. Art.8 auf Art.9 upgraden fuer Bildungszweck.', empfohleneAktion: 'angebot_erstellen', produktEmpfehlung: 'Spezialmandat Art.9', status: 'angeschrieben' },
    { titel: 'Ausschuettungsoptimierung', typ: 'anpassung', quellen: ['bestand'], prioritaet: 'mittel', volumen: 250000, volumenTyp: 'jaehrlich', beschreibung: 'Aktuell 250k/J. Durch Rebalancing +30k moeglich.', empfohleneAktion: 'angebot_erstellen', produktEmpfehlung: 'Ausschuettungsoptimierung', status: 'identifiziert' },
    { titel: 'Sparkasse-Festgeld konsolidieren', typ: 'konsolidierung', quellen: ['finanztransaktion'], prioritaet: 'mittel', volumen: 500000, volumenTyp: 'einmalig', beschreibung: '500k bei Sparkasse. Besser im Mandat mit hoeherem Ertrag.', empfohleneAktion: 'termin_vereinbaren', produktEmpfehlung: 'Spezialmandat Erweiterung', status: 'identifiziert' },
  ],
  kommunikation: [
    { datum: '2026-02-28', typ: 'termin', richtung: 'ausgehend', betreff: 'ESG-Review', zusammenfassung: 'Stiftungsrat moechte ESG-Upgrade. Pruefung Art.9 laeuft.' },
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
  beruf: 'Chefarzt Kardiologie + Privatpraxis', nettoeinkommen: 18000,
  familienstand: 'verheiratet',
  partner: { name: 'Andrea', beruf: 'Psychologin', einkommen: 4500 },
  kinder: [{ name: 'Jan', alter: 26 }, { name: 'Sophie', alter: 23 }],
  wohnsituation: 'eigentum', wohnflaeche: 320,
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
    { titel: 'PE Healthcare erhoehen', typ: 'cross_sell', quellen: ['bestand'], prioritaet: 'hoch', volumen: 300000, volumenTyp: 'einmalig', beschreibung: 'Nur 200k PE. Fachkenntnis Kardiologie nutzen. 500k Ziel.', empfohleneAktion: 'angebot_erstellen', produktEmpfehlung: 'PE Healthcare Fund II', status: 'angeschrieben' },
    { titel: 'ING Tagesgeld konsolidieren', typ: 'konsolidierung', quellen: ['finanztransaktion'], prioritaet: 'hoch', volumen: 250000, volumenTyp: 'einmalig', beschreibung: '250k bei ING. Im Mandat besser aufgehoben.', empfohleneAktion: 'termin_vereinbaren', produktEmpfehlung: 'FairValue Erweiterung', status: 'identifiziert' },
    { titel: 'NextGen Sohn Jan', typ: 'nextgen', quellen: ['lebensereignis'], prioritaet: 'mittel', volumen: 0, volumenTyp: 'vermittlung', beschreibung: 'Jan (26), Assistenzarzt, eigene Ersparnisse ca. 50k.', empfohleneAktion: 'termin_vereinbaren', produktEmpfehlung: 'SmartValue Junior', status: 'identifiziert' },
    { titel: 'Nachfolge Privatpraxis', typ: 'beratung', quellen: ['lebensereignis'], prioritaet: 'mittel', volumen: 800000, volumenTyp: 'einmalig', beschreibung: 'Praxisverkauf in 5-8 Jahren. Bewertung + Erloes-Planung.', empfohleneAktion: 'termin_vereinbaren', produktEmpfehlung: 'Nachfolgeberatung', status: 'identifiziert' },
  ],
  kommunikation: [
    { datum: '2026-02-25', typ: 'termin', richtung: 'ausgehend', betreff: 'PE Healthcare', zusammenfassung: 'Mandant moechte PE Healthcare erhoehen. Fund II Unterlagen angefordert.' },
  ],
  absicherung: { vorhanden: ['mandat_fv', 'pe_hc'], fehlend: ['konsolidierung_ing', 'nextgen', 'nachfolge_praxis'] },
  portfolio: {
    allocation: { aktien: 50, anleihen: 25, alternative: 18, cash: 7 },
    performance: { ytd: 4.8, '1j': 9.1, '3j': 6.8, '5j': 7.5, inception: 7.1 },
    benchmark: { ytd: 3.8, '1j': 7.2, '3j': 5.4 },
    esgScore: 75,
  },
};

// W5: Tim Keller NextGen
export const W5 = {
  name: 'Tim Keller', id: 'VV00005', alter: 29,
  beruf: 'Tech-Gruender (Seed-Exit 500k)', nettoeinkommen: 4500,
  familienstand: 'ledig', partner: null, kinder: [],
  wohnsituation: 'miete', wohnflaeche: 70,
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
    { titel: 'Mandats-Upgrade bei naechstem Exit', typ: 'anpassung', quellen: ['lebensereignis'], prioritaet: 'hoch', volumen: 0, volumenTyp: 'vermittlung', beschreibung: 'Series A Startup. Bei Exit: FairValue Upgrade.', empfohleneAktion: 'termin_vereinbaren', produktEmpfehlung: 'FairValue Mandat', status: 'identifiziert' },
    { titel: 'Krypto strukturieren', typ: 'beratung', quellen: ['finanztransaktion'], prioritaet: 'hoch', volumen: 120000, volumenTyp: 'einmalig', beschreibung: '120k Krypto unstrukturiert. Professionelles Reporting + Steuer.', empfohleneAktion: 'termin_vereinbaren', produktEmpfehlung: 'Krypto-Reporting', status: 'angeschrieben' },
    { titel: 'Angel-Portfolio Reporting', typ: 'beratung', quellen: ['bestand'], prioritaet: 'mittel', volumen: 80000, volumenTyp: 'einmalig', beschreibung: '2 Angel Investments ohne Tracking. In Gesamtreporting integrieren.', empfohleneAktion: 'angebot_erstellen', produktEmpfehlung: 'Consolidated Reporting', status: 'identifiziert' },
    { titel: 'ESG Impact Schwerpunkt', typ: 'anpassung', quellen: ['bestand'], prioritaet: 'niedrig', volumen: 0, volumenTyp: 'vermittlung', beschreibung: 'Impact-Investor. ESG Impact Fund Allokation erhoehen.', empfohleneAktion: 'angebot_erstellen', produktEmpfehlung: 'Impact Fund Basket', status: 'identifiziert' },
  ],
  kommunikation: [
    { datum: '2026-03-02', typ: 'email', richtung: 'eingehend', betreff: 'Krypto Reporting', zusammenfassung: 'Tim fragt nach integriertem Krypto-Reporting fuer Steuerzwecke.' },
  ],
  absicherung: { vorhanden: ['mandat_sv'], fehlend: ['krypto_struktur', 'angel_reporting'] },
  portfolio: {
    allocation: { aktien: 65, anleihen: 10, alternative: 20, cash: 5 },
    performance: { ytd: 7.2, inception: 11.5 },
    benchmark: { ytd: 3.8 },
    esgScore: 80,
  },
};
