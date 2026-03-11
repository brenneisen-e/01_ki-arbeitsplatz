// ═══════════════════════════════════════════════════════
// OPT-26: Banking-Personas B4-B6
// 5 Datenschichten: Stamm, Eigen, Fremd, Transaktionen, Potentiale
// ═══════════════════════════════════════════════════════

(function() {
    'use strict';

    if (!window._bankingPersonas) window._bankingPersonas = {};

    // ── B4: Markus Wagner – Berufseinsteiger, nur Girokonto ──
    window._bankingPersonas['Markus Wagner'] = {
        id: 'KDB003', ort: 'Giessen', segment: 'Standard', ertrag: 350, finanzplan: false, letztKontakt: '20.02.2026',
        geburtsdatum: '14.09.1997', adresse: 'Schulstr. 8, 35390 Giessen', telefon: '+49 641 77890', email: 'm.wagner@email.de',
        beruf: 'Junior Controller', familienstand: 'Ledig', arbeitgeber: 'Schunk Group',
        linkedinHint: true,
        linkedin: { kontakte: 250, aktivitaet: 'mittel', branchen: ['Finance', 'Controlling'], zusammenfassung: 'Junior Controller, Finance Community' },
        beschaeftigtSeit: '01.03.2024',
        nettoeinkommen: 2600,
        kinder: [],
        risikoscore: 15, bonitaet: 78,
        nps: { score: 6, kategorie: 'detractor', datum: '15.01.2026', kampagne: 'Jahresumfrage 2026', details: [
            { name: 'Beratungsqualitaet', wert: 6 }, { name: 'Zufriedenheit', wert: 5 },
            { name: 'Weiterempfehlung', wert: 6 }, { name: 'Preis-Leistung', wert: 7 }, { name: 'Erreichbarkeit', wert: 6 }
        ]},

        konten: [
            { produkt: 'VR-Girokonto', details: 'Gehaltseingang 2.600\u20AC \u2013 Childhood-Konto, nie erweitert', saldo: 1500, eroeffnung: '01.01.2012', status: 'Aktiv' }
        ],

        fidaVertraege: [
            { institut: 'Trade Republic', typ: 'Depot', info: '5.200\u20AC, Sparplan 200\u20AC/mtl.', consent: '10.02.2026', gueltig: '10.02.2027' }
        ],
        fremdProdukte: [
            { typ: 'depot', produkt: 'ETF-Depot', institut: 'Trade Republic', details: 'Sparplan 200\u20AC/mtl.', volumenOderPraemie: 5200, consent: true },
            { typ: 'kfz', produkt: 'KFZ', institut: 'VHV (Check24)', details: 'Gebrauchtwagen', volumenOderPraemie: 380, consent: false },
            { typ: 'haftpflicht', produkt: 'Haftpflicht', institut: 'CosmosDirekt (Check24)', details: 'Single', volumenOderPraemie: 45, consent: false }
        ],

        sparenGeldmarkt: [],
        sparenKapitalmarkt: [
            { produkt: 'ETF-Depot', anbieter: 'Trade Republic', volumen: 5200, sparrate: '\u20AC200/Mon.', performance: '+12,3%', quelle: 'FIDA' }
        ],
        versicherungenEigen: [],
        versicherungenFremd: [
            { versicherung: 'Kfz-Versicherung', anbieter: 'VHV', deckung: 'TK', tarifart: 'Basis', leistungen: [], praemie: '\u20AC380/Jahr', kuendigung: '30.11.2026' },
            { versicherung: 'Privathaftpflicht', anbieter: 'CosmosDirekt', deckung: '\u20AC10 Mio.', tarifart: 'Basis', leistungen: [], praemie: '\u20AC45/Jahr', kuendigung: '01.01.2027' }
        ],
        finanzierungen: [],

        transaktionen: [
            { kategorie: 'gehalt', betrag: 2600, empfaenger: 'Schunk Group', auffaelligkeit: null },
            { kategorie: 'miete', betrag: -680, empfaenger: 'Vermieter', auffaelligkeit: null },
            { kategorie: 'sparplan', betrag: -200, empfaenger: 'Trade Republic', auffaelligkeit: 'geht_an_fremdbank' },
            { kategorie: 'versicherung_fremd', betrag: -35, empfaenger: 'VHV + CosmosDirekt', auffaelligkeit: 'fremdversicherer' },
            { kategorie: 'konsum', betrag: -800, empfaenger: 'Lebenshaltung', auffaelligkeit: null },
            { kategorie: 'freizeit', betrag: -300, empfaenger: 'Sport, Ausgehen', auffaelligkeit: null },
            { kategorie: 'abos', betrag: -55, empfaenger: 'Spotify, Netflix, Fitness', auffaelligkeit: null }
        ],
        haushaltsnetto: 2600,
        absicherungsquote: 1.3,
        sparquote: 7.7,
        freiVerfuegbar: 530,

        potentiale: [
            { titel: 'Union Investment ETF-Sparplan', typ: 'whitespot', quellen: ['finanztransaktion'], prioritaet: 'hoch', volumen: 720, volumenTyp: 'jaehrlich', beschreibung: '200\u20AC/mtl. gehen an Trade Republic. UniGlobal Vorsorge oder UniNachhaltig Aktien. Generationsberatung nutzen.', empfohleneAktion: 'termin_vereinbaren', produktEmpfehlung: 'Union Investment UniGlobal Vorsorge' },
            { titel: 'R+V BU-Versicherung', typ: 'cross_sell', quellen: ['bestand'], prioritaet: 'kritisch', volumen: 840, volumenTyp: 'jaehrlich', beschreibung: '29, Controller, KEINE BU! Jetzt abschliessen = guenstige Praemie.', empfohleneAktion: 'angebot_erstellen', produktEmpfehlung: 'R+V BU-Versicherung' },
            { titel: 'VR-FinanzPlan', typ: 'whitespot', quellen: ['bestand'], prioritaet: 'mittel', volumen: 300, volumenTyp: 'jaehrlich', beschreibung: 'Keine Altersvorsorge ausser Trade Republic. Strukturiertes Gesamtkonzept.', empfohleneAktion: 'termin_vereinbaren', produktEmpfehlung: 'VR-FinanzPlan' },
            { titel: 'Schwaebisch Hall Bauspar', typ: 'whitespot', quellen: ['lebensereignis'], prioritaet: 'mittel', volumen: 500, volumenTyp: 'jaehrlich', beschreibung: '29, erste Wohnung mit Freundin. Eigentum in 5-7 Jahren? BSV jetzt starten.', empfohleneAktion: 'angebot_erstellen', produktEmpfehlung: 'Schwaebisch Hall Bausparvertrag' },
            { titel: 'R+V KFZ + Haftpflicht', typ: 'cross_sell', quellen: ['wettbewerb'], prioritaet: 'niedrig', volumen: 425, volumenTyp: 'jaehrlich', beschreibung: 'Beides ueber Check24. Bei naechster Vertragsverlagerung R+V-Buendel anbieten.', empfohleneAktion: 'tarifvergleich', produktEmpfehlung: 'R+V KFZ + Haftpflicht' }
        ],

        kommunikation: [
            { typ: 'chatbot', datum: '2026-03-04T22:00:00', betreff: 'genoGPT: ETF-Sparplan', verlauf: [
                { rolle: 'kunde', text: 'Bieten Sie auch ETF-Sparplaene an? Ich habe einen bei Trade Republic.' },
                { rolle: 'bot', text: 'Ja! Ueber Union Investment bieten wir ETF-Sparplaene ab 25\u20AC/Mon. an. UniGlobal Vorsorge und UniNachhaltig Aktien sind besonders beliebt.' },
                { rolle: 'kunde', text: 'Warum sollte ich von Trade Republic wechseln?' },
                { rolle: 'bot', text: 'Bei uns bekommen Sie persoenliche Beratung, einen VR-FinanzPlan und koennen VL-Sparen nutzen. Soll ich einen Beratungstermin vereinbaren?' },
                { rolle: 'kunde', text: 'Vielleicht spaeter' }
            ], ergebnis: 'Information ETF-Sparplan', themen: ['etf', 'sparplan', 'vergleich'], status: 'erledigt' },
            { typ: 'ki_kontakt', datum: '2026-02-15T10:00:00', betreff: 'BU-Luecke Berufseinsteiger', inhalt: 'System hat erkannt: 29 Jahre, Controller, KEINE BU-Versicherung. R+V BU empfohlen.', status: 'geoeffnet', followUp: false, automatisch: true, ausloeser: 'regelbasiert' }
        ],
        avatarBg: '#f59e0b', foto: null,
        _modus: 'banking'
    };

    // ── B5: Andrea Lang – Firmenkunde Gastronomie ──
    window._bankingPersonas['Andrea Lang'] = {
        id: 'FKB002', ort: 'Giessen', segment: 'Firmenkunde', ertrag: 4200, finanzplan: true, letztKontakt: '12.02.2026',
        geburtsdatum: '15.03.1985', adresse: 'Marktplatz 3, 35390 Giessen', telefon: '+49 641 12345', email: 'a.lang@kaffeekultur.de',
        beruf: 'Inhaberin "Kaffeekultur" (3 Cafes, 18 MA)', familienstand: 'Geschieden', arbeitgeber: 'Kaffeekultur GmbH (Inhaberin)',
        linkedinHint: false,
        linkedin: { kontakte: 150, aktivitaet: 'niedrig', branchen: ['Gastronomie', 'Unternehmertum'], zusammenfassung: 'Inhaberin Cafe-Kette, lokal vernetzt' },
        beschaeftigtSeit: '01.01.2016',
        nettoeinkommen: 4500,
        kinder: [{ name: 'Luca', alter: 11 }],
        risikoscore: 28, bonitaet: 75,
        nps: { score: 9, kategorie: 'promoter', datum: '15.01.2026', kampagne: 'Jahresumfrage 2026', details: [
            { name: 'Beratungsqualitaet', wert: 9 }, { name: 'Zufriedenheit', wert: 9 },
            { name: 'Weiterempfehlung', wert: 10 }, { name: 'Preis-Leistung', wert: 8 }, { name: 'Erreichbarkeit', wert: 9 }
        ]},

        konten: [
            { produkt: 'VR-Geschaeftskonto 1', details: 'Cafe Giessen Zentrum', saldo: 15000, eroeffnung: '01.01.2016', status: 'Aktiv' },
            { produkt: 'VR-Geschaeftskonto 2', details: 'Cafe Giessen Uni', saldo: 12000, eroeffnung: '01.06.2019', status: 'Aktiv' },
            { produkt: 'VR-Geschaeftskonto 3', details: 'Cafe Wetzlar', saldo: 8000, eroeffnung: '01.03.2023', status: 'Aktiv' },
            { produkt: 'Kontokorrentkredit', details: '100k Rahmen, 40k genutzt', saldo: -40000, eroeffnung: '01.01.2018', status: 'Aktiv' },
            { produkt: 'KfW-Foerderkredit', details: 'Standort 3 Eroeffnung 2023, Restschuld 65k', saldo: -65000, eroeffnung: '01.03.2023', status: 'Aktiv' },
            { produkt: 'VR Smart Finanz', details: 'Kaffeemaschinen-Leasing, 12k', saldo: -12000, eroeffnung: '01.06.2024', status: 'Aktiv' },
            { produkt: 'VR-Girokonto (privat)', details: 'Privatentnahmen', saldo: 4000, eroeffnung: '01.01.2016', status: 'Aktiv' }
        ],

        fidaVertraege: [
            { institut: 'ING', typ: 'Depot', info: 'Privat, 22.000\u20AC ETFs', consent: null, gueltig: null },
            { institut: 'Mannheimer', typ: 'Gewerbeversicherung', info: '3 Standorte', consent: null, gueltig: null },
            { institut: 'HUK', typ: 'KFZ', info: 'VW T-Roc privat', consent: null, gueltig: null }
        ],
        fremdProdukte: [
            { typ: 'depot', produkt: 'ETF-Depot', institut: 'ING', details: '22k ETFs', volumenOderPraemie: 22000, consent: false },
            { typ: 'gewerbe', produkt: 'Geschaeftsinhaltsversicherung', institut: 'Allianz', details: '3 Standorte', volumenOderPraemie: 2400, consent: false },
            { typ: 'gewerbe', produkt: 'Betriebshaftpflicht', institut: 'VHV', details: 'Gastronomie', volumenOderPraemie: 1200, consent: false },
            { typ: 'kfz', produkt: 'KFZ privat', institut: 'HUK', details: 'VW T-Roc', volumenOderPraemie: 520, consent: false }
        ],

        sparenGeldmarkt: [],
        sparenKapitalmarkt: [
            { produkt: 'ETF-Depot', anbieter: 'ING', volumen: 22000, sparrate: '\u20AC300/Mon.', performance: '+8,5%', quelle: 'FIDA' }
        ],
        versicherungenEigen: [],
        versicherungenFremd: [
            { versicherung: 'Geschaeftsinhaltsversicherung', anbieter: 'Mannheimer', deckung: '3 Standorte', tarifart: 'Gewerbe', leistungen: [], praemie: '\u20AC2.400/Jahr', kuendigung: '01.01.2027' },
            { versicherung: 'Betriebshaftpflicht', anbieter: 'VHV', deckung: 'Gastronomie', tarifart: 'Gewerbe', leistungen: [], praemie: '\u20AC1.200/Jahr', kuendigung: '01.07.2026' },
            { versicherung: 'Kfz privat', anbieter: 'HUK', deckung: 'VW T-Roc', tarifart: 'Standard', leistungen: [], praemie: '\u20AC520/Jahr', kuendigung: '30.11.2026' }
        ],
        finanzierungen: [
            { kredit: 'KfW-Foerderkredit', kreditgeber: 'KfW ueber VR', ursprung: 120000, restschuld: 65000, zinssatz: '2,50% p.a.', rate: '\u20AC1.200/Mon.', laufzeit: '03/2028', absicherung: 'Keine' },
            { kredit: 'VR Smart Finanz', kreditgeber: 'VR Smart Finanz', ursprung: 18000, restschuld: 12000, zinssatz: '4,20% p.a.', rate: '\u20AC350/Mon.', laufzeit: '06/2027', absicherung: 'Keine' }
        ],

        transaktionen: [
            { kategorie: 'gehalt', betrag: 4500, empfaenger: 'Privatentnahme Kaffeekultur GmbH', auffaelligkeit: null },
            { kategorie: 'sparplan', betrag: -300, empfaenger: 'ING Depot', auffaelligkeit: 'geht_an_fremdbank' },
            { kategorie: 'versicherung_fremd', betrag: -340, empfaenger: 'Allianz, VHV, HUK', auffaelligkeit: 'fremdversicherer' },
            { kategorie: 'kinder', betrag: -250, empfaenger: 'Kita + Sport', auffaelligkeit: null },
            { kategorie: 'konsum', betrag: -1500, empfaenger: 'Lebenshaltung', auffaelligkeit: null }
        ],
        haushaltsnetto: 4500,
        freiVerfuegbar: 1810,

        potentiale: [
            { titel: 'R+V Gewerbeversicherung (Buendel)', typ: 'cross_sell', quellen: ['wettbewerb'], prioritaet: 'hoch', volumen: 3600, volumenTyp: 'jaehrlich', beschreibung: 'Inhalts+Betriebshaftpflicht bei Fremdversicherern. R+V Gewerbe-Buendel ueber VR-Verbund deutlich guenstiger.', empfohleneAktion: 'tarifvergleich', produktEmpfehlung: 'R+V Gewerbeversicherung Buendel' },
            { titel: 'Expansion Standort 4 (Finanzierung)', typ: 'whitespot', quellen: ['kommunikation'], prioritaet: 'hoch', volumen: 120000, volumenTyp: 'einmalig', beschreibung: 'Im Gespraech erwaehnt. VR Smart Finanz + KfW ERP Gruenderkredit.', empfohleneAktion: 'termin_vereinbaren', produktEmpfehlung: 'KfW ERP Gruenderkredit' },
            { titel: 'bAV fuer 18 Mitarbeiter', typ: 'cross_sell', quellen: ['bestand'], prioritaet: 'mittel', volumen: 43200, volumenTyp: 'jaehrlich', beschreibung: 'Gastronomie = hohe Fluktuation. bAV als Mitarbeiterbindung. R+V bAV-Loesungen.', empfohleneAktion: 'termin_vereinbaren', produktEmpfehlung: 'R+V Betriebliche Altersvorsorge' },
            { titel: 'Union Investment Sparplan (privat)', typ: 'whitespot', quellen: ['finanztransaktion'], prioritaet: 'mittel', volumen: 1080, volumenTyp: 'jaehrlich', beschreibung: '22k bei ING. Vermoegensaufbau fuer Unternehmerin = wichtig (kein Arbeitgeber-Schutz).', empfohleneAktion: 'termin_vereinbaren', produktEmpfehlung: 'Union Investment UniGlobal' },
            { titel: 'R+V BU-Versicherung', typ: 'cross_sell', quellen: ['bestand'], prioritaet: 'kritisch', volumen: 1800, volumenTyp: 'jaehrlich', beschreibung: 'Selbstaendig ohne BU! Existenzbedrohend.', empfohleneAktion: 'angebot_erstellen', produktEmpfehlung: 'R+V BU-Versicherung' }
        ],

        kommunikation: [
            { typ: 'chatbot', datum: '2026-03-03T20:00:00', betreff: 'genoGPT: Expansion 4. Cafe', verlauf: [
                { rolle: 'kunde', text: 'Ich ueberlege ein viertes Cafe zu eroeffnen. Welche Finanzierungsmoeglichkeiten gibt es?' },
                { rolle: 'bot', text: 'Fuer Ihr 4. Cafe kommen der KfW-Unternehmerkredit und VR Smart Finanz in Frage. Bei Ihrem Track Record mit 3 Standorten sind die Chancen gut.' },
                { rolle: 'kunde', text: 'Wie viel wuerde das kosten?' },
                { rolle: 'bot', text: 'Erfahrungsgemaess 80-120k fuer Gastronomie-Einrichtung. Soll ich einen Termin mit Ihrem Firmenkundenberater vereinbaren?' },
                { rolle: 'kunde', text: 'Ja bitte' }
            ], ergebnis: 'Terminwunsch Expansion-Finanzierung', themen: ['expansion', 'cafe', 'finanzierung', 'termin'], status: 'termin_geplant' },
            { typ: 'ki_kontakt', datum: '2026-02-08T10:00:00', betreff: 'bAV + BU-Luecke', inhalt: 'System hat erkannt: 18 Mitarbeiter ohne bAV. Inhaberin ohne BU. Doppelte Handlungsempfehlung.', status: 'geoeffnet', followUp: false, automatisch: true, ausloeser: 'regelbasiert' }
        ],
        avatarBg: '#6366f1', foto: null,
        _modus: 'banking'
    };

    // ── B6: Stefan Braun – IT-Freelancer, Digital Native ──
    window._bankingPersonas['Stefan Braun'] = {
        id: 'KDB006', ort: 'Giessen', segment: 'Standard', ertrag: 107, finanzplan: false, letztKontakt: '01.01.2025',
        geburtsdatum: '22.11.1990', adresse: 'Walltorstr. 22, 35390 Giessen', telefon: '+49 641 99876', email: 'stefan@devops-braun.de',
        beruf: 'Freelance Software-Entwickler (DevOps/Cloud)', familienstand: 'Ledig', arbeitgeber: 'Selbstaendig',
        linkedinHint: true,
        linkedin: { kontakte: 2000, aktivitaet: 'hoch', branchen: ['DevOps', 'Cloud', 'Tech'], zusammenfassung: 'Freelance DevOps, Speaker, Tech-Community sehr aktiv, 2.000+ Kontakte' },
        beschaeftigtSeit: '01.01.2019',
        nettoeinkommen: 5000,
        kinder: [],
        risikoscore: 38, bonitaet: 72,
        nps: { score: 4, kategorie: 'detractor', datum: '15.01.2026', kampagne: 'Jahresumfrage 2026', details: [
            { name: 'Beratungsqualitaet', wert: 4 }, { name: 'Zufriedenheit', wert: 3 },
            { name: 'Weiterempfehlung', wert: 4 }, { name: 'Preis-Leistung', wert: 5 }, { name: 'Erreichbarkeit', wert: 5 }
        ]},

        konten: [
            { produkt: 'VR-Girokonto', details: '"Eltern-Konto" seit Kindheit, KAUM GENUTZT, Karteileiche', saldo: 800, eroeffnung: '01.09.2005', status: 'Aktiv' }
        ],

        fidaVertraege: [
            { institut: 'N26 Business', typ: 'Geschaeftskonto', info: 'HAUPTKONTO! ~12k Saldo', consent: null, gueltig: null },
            { institut: 'N26', typ: 'Girokonto', info: 'Privat, ~3k', consent: null, gueltig: null },
            { institut: 'Trade Republic', typ: 'Depot', info: '68k (Tech-Aktien + Krypto-ETPs)', consent: null, gueltig: null },
            { institut: 'Scalable Capital', typ: 'Tagesgeld', info: '15k', consent: null, gueltig: null }
        ],
        fremdProdukte: [
            { typ: 'geschaeftskonto', produkt: 'N26 Business', institut: 'N26', details: 'Hauptkonto! 12k Saldo', volumenOderPraemie: 12000, consent: false },
            { typ: 'girokonto', produkt: 'Girokonto privat', institut: 'N26', details: '', volumenOderPraemie: 3000, consent: false },
            { typ: 'depot', produkt: 'Depot', institut: 'Trade Republic', details: 'Tech-Aktien + Krypto-ETPs', volumenOderPraemie: 68000, consent: false },
            { typ: 'tagesgeld', produkt: 'Tagesgeld', institut: 'Scalable Capital', details: '', volumenOderPraemie: 15000, consent: false },
            { typ: 'haftpflicht', produkt: 'Haftpflicht', institut: 'CosmosDirekt (Check24)', details: '', volumenOderPraemie: 50, consent: false },
            { typ: 'berufshaftpflicht', produkt: 'IT-Berufshaftpflicht', institut: 'Hiscox', details: '', volumenOderPraemie: 1200, consent: false }
        ],

        sparenGeldmarkt: [
            { produkt: 'Tagesgeld', anbieter: 'Scalable Capital', volumen: 15000, zinssatz: '3,00% p.a.', laufzeit: 'Flexibel', quelle: 'FIDA' }
        ],
        sparenKapitalmarkt: [
            { produkt: 'Depot', anbieter: 'Trade Republic', volumen: 68000, sparrate: '\u20AC800/Mon.', performance: '+14,5%', quelle: 'FIDA' }
        ],
        versicherungenEigen: [],
        versicherungenFremd: [
            { versicherung: 'Privathaftpflicht', anbieter: 'CosmosDirekt', deckung: '\u20AC10 Mio.', tarifart: 'Basis', leistungen: [], praemie: '\u20AC50/Jahr', kuendigung: '01.01.2027' },
            { versicherung: 'IT-Berufshaftpflicht', anbieter: 'Hiscox', deckung: '\u20AC1 Mio.', tarifart: 'IT Professional', leistungen: ['Vermoegensschaeden', 'Cyber'], praemie: '\u20AC1.200/Jahr', kuendigung: '01.07.2026' }
        ],
        finanzierungen: [],

        transaktionen: [
            { kategorie: 'gehalt', betrag: 5000, empfaenger: 'Kundenzahlungen (schwankend)', auffaelligkeit: 'schwankend' },
            { kategorie: 'miete', betrag: -950, empfaenger: 'Vermieter', auffaelligkeit: null },
            { kategorie: 'sparplan', betrag: -800, empfaenger: 'Trade Republic', auffaelligkeit: 'geht_an_fremdbank' },
            { kategorie: 'versicherung_fremd', betrag: -104, empfaenger: 'CosmosDirekt + Hiscox', auffaelligkeit: 'fremdversicherer' },
            { kategorie: 'abos', betrag: -120, empfaenger: 'Cloud-Services, GitHub, Tools', auffaelligkeit: null },
            { kategorie: 'konsum', betrag: -1200, empfaenger: 'Lebenshaltung', auffaelligkeit: null },
            { kategorie: 'freizeit', betrag: -500, empfaenger: 'Restaurants, Bars, Konferenzen', auffaelligkeit: null }
        ],
        haushaltsnetto: 5000,
        absicherungsquote: 2.1,
        sparquote: 16.0,
        freiVerfuegbar: 1326,

        potentiale: [
            { titel: 'R+V BU-Versicherung', typ: 'cross_sell', quellen: ['bestand'], prioritaet: 'kritisch', volumen: 1800, volumenTyp: 'jaehrlich', beschreibung: '36, Freelancer, 95k Umsatz, KEINE BU! Existenzbedrohend. R+V BU fuer IT-Berufe = guenstige Konditionen.', empfohleneAktion: 'angebot_erstellen', produktEmpfehlung: 'R+V BU-Versicherung IT' },
            { titel: 'VR-Geschaeftskonto als N26-Alternative', typ: 'whitespot', quellen: ['bestand'], prioritaet: 'mittel', volumen: 180, volumenTyp: 'jaehrlich', beschreibung: 'N26 Business hat eingeschraenkten DATEV-Export. VR-Geschaeftskonto mit DATEV-Integration.', empfohleneAktion: 'angebot_erstellen', produktEmpfehlung: 'VR Smart Business' },
            { titel: 'Union Investment Depot', typ: 'whitespot', quellen: ['finanztransaktion'], prioritaet: 'niedrig', volumen: 2040, volumenTyp: 'jaehrlich', beschreibung: 'Tech-lastig + Krypto = hohes Risiko. Diversifikation vorschlagen. Aber: schwieriger Kunde, preissensitiv, will Self-Service.', empfohleneAktion: 'termin_vereinbaren', produktEmpfehlung: 'VR-MeinDepot' },
            { titel: 'R+V Ruerup-Rente', typ: 'cross_sell', quellen: ['bestand'], prioritaet: 'hoch', volumen: 6000, volumenTyp: 'jaehrlich', beschreibung: 'Freelancer ohne Altersvorsorge. Steuerlich absetzbar. Muss aber digital abschliessbar sein.', empfohleneAktion: 'angebot_erstellen', produktEmpfehlung: 'R+V Ruerup-Rente' },
            { titel: 'R+V Berufshaftpflicht IT (statt Hiscox)', typ: 'cross_sell', quellen: ['wettbewerb'], prioritaet: 'mittel', volumen: 1200, volumenTyp: 'jaehrlich', beschreibung: 'Cloud-Consultant ohne VR-Verbund-Schutz. Hiscox pruefen vs. R+V.', empfohleneAktion: 'tarifvergleich', produktEmpfehlung: 'R+V Berufshaftpflicht IT' },
            { titel: 'Hauptbankverbindung zurueckgewinnen', typ: 'aktion', quellen: ['kommunikation'], prioritaet: 'hoch', volumen: 0, volumenTyp: 'vermittlung', beschreibung: 'N26 ist Hauptkonto, VR nur Karteileiche mit 800\u20AC. NPS 4 = Detractor. Digitale Angebote zeigen.', empfohleneAktion: 'termin_vereinbaren', produktEmpfehlung: 'VR-Banking App + VR Smart Business' }
        ],

        kommunikation: [
            { typ: 'ki_kontakt', datum: '2026-03-01T10:00:00', betreff: 'Abwanderungsrisiko + BU-Luecke', inhalt: 'System hat erkannt: NPS 4 (Detractor), kein Kontakt seit 14 Monaten, VR-Konto nur 800\u20AC. Gleichzeitig: 95k Umsatz Freelancer OHNE BU. Dringende doppelte Empfehlung.', status: 'geoeffnet', followUp: false, automatisch: true, ausloeser: 'regelbasiert' },
            { typ: 'email', datum: '2026-01-15T09:00:00', betreff: 'VR-Banking App: Jetzt mit Apple Pay', inhalt: 'Die VR-Banking App unterstuetzt jetzt Apple Pay und Wero.', status: 'nicht_geoeffnet', followUp: false, automatisch: true }
        ],
        avatarBg: '#059669', foto: null,
        _modus: 'banking'
    };

})();
