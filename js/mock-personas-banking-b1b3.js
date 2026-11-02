// ═══════════════════════════════════════════════════════
// OPT-26: Banking-Personas B1-B3
// 5 Datenschichten: Stamm, Eigen, Fremd, Transaktionen, Potentiale
// ═══════════════════════════════════════════════════════

(function() {
    'use strict';

    if (!window._bankingPersonas) window._bankingPersonas = {};

    // ── B1: Klaus Fischer – Retail mit Verbundpartner-Potenzial ──
    window._bankingPersonas['Klaus Fischer'] = {
        id: 'KDB001', ort: 'Giessen', segment: 'Premium', ertrag: 4200, finanzplan: false, letztKontakt: '28.02.2026',
        geburtsdatum: '19.06.1980', adresse: 'Schillerstr. 8, 35390 Giessen', telefon: '+49 641 98765', email: 'k.fischer@email.de',
        beruf: 'Vertriebsleiter', familienstand: 'Verheiratet', arbeitgeber: 'Viessmann Climate Solutions SE',
        linkedinHint: true,
        linkedin: { kontakte: 400, aktivitaet: 'mittel', branchen: ['B2B-Vertrieb', 'Maschinenbau', 'Sales'], zusammenfassung: 'Vertriebsleiter, postet ueber Sales-Strategien' },
        beschaeftigtSeit: '01.04.2012',
        nettoeinkommen: 4500,
        kinder: [{ name: 'Luisa', alter: 12 }, { name: 'Paul', alter: 9 }],
        risikoscore: 22, bonitaet: 82,
        nps: { score: 7, kategorie: 'passive', datum: '15.01.2026', kampagne: 'Jahresumfrage 2026', details: [
            { name: 'Beratungsqualitaet', wert: 7 }, { name: 'Zufriedenheit', wert: 7 },
            { name: 'Weiterempfehlung', wert: 7 }, { name: 'Preis-Leistung', wert: 6 }, { name: 'Erreichbarkeit', wert: 8 }
        ]},

        // ── Eigene Produkte (bei Volksbank) ──
        konten: [
            { produkt: 'VR-Girokonto Plus', details: 'Gehaltseingang Klaus 4.500\u20AC + Nicole 2.200\u20AC', saldo: 4200, eroeffnung: '15.03.2008', status: 'Aktiv' },
            { produkt: 'VR-Sparkonto', details: '0,5% Zins', saldo: 15000, eroeffnung: '01.01.2015', status: 'Aktiv' },
            { produkt: 'Baufinanzierung (DZ HYP)', details: 'Restschuld 185k, 1,2% Zins fest, ZINSBINDUNG ENDET 04/2026!', saldo: -185000, eroeffnung: '01.04.2016', status: 'Aktiv' },
            { produkt: 'Visa Gold Kreditkarte', details: 'Umsatz ~800\u20AC/mtl., Jahresgebuehr 60\u20AC', saldo: -800, eroeffnung: '01.01.2018', status: 'Aktiv' },
            { produkt: 'Schwaebisch Hall Bauspar', details: 'BSV 50k, Guthaben 30k, ZUTEILUNGSREIF, keine Einzahlung seit 2J', saldo: 30000, eroeffnung: '01.01.2010', status: 'Aktiv' }
        ],

        // ── Fremdprodukte (FIDA) ──
        fidaVertraege: [
            { institut: 'Trade Republic', typ: 'Depot', info: '28.000\u20AC: DAX-ETF, Nasdaq-100-ETF, 3 Einzelaktien. Sparplan 500\u20AC/mtl.', consent: '12.01.2026', gueltig: '12.01.2027' },
            { institut: 'ING', typ: 'Tagesgeld', info: '22.000\u20AC, 2,8% Zins \u2013 HOEHER als unser Sparkonto!', consent: '12.01.2026', gueltig: '12.01.2027' },
            { institut: 'HUK-Coburg', typ: 'KFZ-Versicherung', info: '2 PKW (VW Passat + Fiat 500), 1.200\u20AC/J.', consent: '12.01.2026', gueltig: '12.01.2027' },
            { institut: 'HDI', typ: 'BU-Versicherung', info: '2.000\u20AC/mtl. Rente, 1.680\u20AC/J.', consent: '12.01.2026', gueltig: '12.01.2027' },
            { institut: 'Allianz', typ: 'Haftpflicht', info: 'Familie 10M, 95\u20AC/J.', consent: '12.01.2026', gueltig: '12.01.2027' },
            { institut: 'Alte Leipziger', typ: 'Kapital-LV', info: 'Ablauf 2032, 180\u20AC/mtl., RKW ~65k', consent: null, gueltig: null }
        ],
        fremdProdukte: [
            { typ: 'depot', produkt: 'ETF-Depot', institut: 'Trade Republic', details: 'DAX-ETF, Nasdaq-100, Einzelaktien, Sparplan 500\u20AC/mtl.', volumenOderPraemie: 28000, consent: true },
            { typ: 'tagesgeld', produkt: 'Tagesgeld', institut: 'ING', details: '2,8% Zins \u2013 hoeher als VR!', volumenOderPraemie: 22000, consent: true },
            { typ: 'kfz', produkt: 'KFZ-Versicherung', institut: 'HUK-Coburg', details: '2 PKW', volumenOderPraemie: 1200, consent: true },
            { typ: 'bu', produkt: 'BU-Versicherung', institut: 'HDI', details: '2.000\u20AC/mtl. Rente', volumenOderPraemie: 1680, consent: true },
            { typ: 'haftpflicht', produkt: 'Haftpflicht', institut: 'Allianz', details: 'Familie 10M', volumenOderPraemie: 95, consent: true },
            { typ: 'lebensversicherung', produkt: 'Kapital-LV', institut: 'Alte Leipziger', details: 'Ablauf 2032, RKW ~65k', volumenOderPraemie: 2160, consent: false }
        ],

        // ── Bedarfsfelder ──
        sparenGeldmarkt: [
            { produkt: 'VR-Sparkonto', anbieter: 'Volksbank Mittelhessen', volumen: 15000, zinssatz: '0,50% p.a.', laufzeit: 'Flexibel' },
            { produkt: 'Tagesgeld', anbieter: 'ING', volumen: 22000, zinssatz: '2,80% p.a.', laufzeit: 'Flexibel', quelle: 'FIDA' }
        ],
        sparenKapitalmarkt: [
            { produkt: 'ETF-Depot', anbieter: 'Trade Republic', volumen: 28000, sparrate: '\u20AC500/Mon.', performance: '+11,2%', quelle: 'FIDA' }
        ],
        versicherungenEigen: [],
        versicherungenFremd: [
            { versicherung: 'Kfz-Versicherung', anbieter: 'HUK-Coburg', deckung: '2 PKW VK+TK', tarifart: 'Standard', leistungen: ['Marderschaeden', 'Auslandsschutz'], selbstbehalt: '\u20AC300 VK', praemie: '\u20AC1.200/Jahr', kuendigung: '30.11.2026' },
            { versicherung: 'BU-Versicherung', anbieter: 'HDI', deckung: '\u20AC2.000/Mon.', tarifart: 'Komfort', leistungen: ['Endalter 67', 'Nachversicherung'], praemie: '\u20AC1.680/Jahr', kuendigung: '01.01.2028' },
            { versicherung: 'Privathaftpflicht', anbieter: 'Allianz', deckung: '\u20AC10 Mio.', tarifart: 'Familie', leistungen: ['Schluesselverl.', 'Deliktunfaehige Kinder'], selbstbehalt: '\u20AC0', praemie: '\u20AC95/Jahr', kuendigung: '01.01.2027' }
        ],
        finanzierungen: [
            { kredit: 'Baufinanzierung', kreditgeber: 'Volksbank Mittelhessen', ursprung: 280000, restschuld: 185000, zinssatz: '1,20% p.a.', rate: '\u20AC850/Mon.', laufzeit: '04/2026', absicherung: 'Grundschuld', hinweis: 'Zinsbindung endet 04/2026 \u2013 Anschlussfinanzierung JETZT!' }
        ],

        // ── Transaktionsmuster ──
        transaktionen: [
            { kategorie: 'gehalt', betrag: 4500, empfaenger: 'Viessmann', auffaelligkeit: null },
            { kategorie: 'gehalt_partner', betrag: 2200, empfaenger: 'Nicole (Steuerberaterin Teilzeit)', auffaelligkeit: null },
            { kategorie: 'kindergeld', betrag: 500, empfaenger: 'Familienkasse', auffaelligkeit: null },
            { kategorie: 'baufi', betrag: -850, empfaenger: 'VR intern', auffaelligkeit: 'zinsbindung_endet_04_2026' },
            { kategorie: 'sparplan', betrag: -500, empfaenger: 'Trade Republic', auffaelligkeit: 'geht_an_fremdbank' },
            { kategorie: 'sparen', betrag: -1000, empfaenger: 'ING Tagesgeld', auffaelligkeit: 'geht_an_fremdbank' },
            { kategorie: 'versicherung_fremd', betrag: -420, empfaenger: 'HUK, HDI, Allianz', auffaelligkeit: 'fremdversicherer' },
            { kategorie: 'versicherung_fremd', betrag: -180, empfaenger: 'Alte Leipziger LV', auffaelligkeit: 'fremdversicherer' },
            { kategorie: 'konsum', betrag: -900, empfaenger: 'Lebensmittel', auffaelligkeit: null },
            { kategorie: 'nebenkosten', betrag: -250, empfaenger: 'Strom/Gas', auffaelligkeit: null },
            { kategorie: 'kinder', betrag: -280, empfaenger: 'Vereine, Musik', auffaelligkeit: null },
            { kategorie: 'mobilitaet', betrag: -350, empfaenger: 'Auto (2x)', auffaelligkeit: null },
            { kategorie: 'reisen', betrag: -300, empfaenger: 'Urlaub-Ruecklage', auffaelligkeit: null },
            { kategorie: 'freizeit', betrag: -250, empfaenger: 'Restaurant/Freizeit', auffaelligkeit: null }
        ],
        haushaltsnetto: 7200,
        absicherungsquote: 8.3,
        sparquote: 20.8,
        freiVerfuegbar: 620,

        // ── Vertriebspotentiale ──
        potentiale: [
            { titel: 'Anschlussfinanzierung', typ: 'anpassung', quellen: ['bestand', 'markt'], prioritaet: 'kritisch', volumen: 2775, volumenTyp: 'jaehrlich', beschreibung: 'Zinsbindung 04/2026 \u2013 in wenigen Wochen! Bei 185k Restschuld und 3,5% Zinsniveau muss JETZT ein Angebot raus.', empfohleneAktion: 'angebot_erstellen', produktEmpfehlung: 'DZ HYP Forward-Darlehen / Prolongation' },
            { titel: 'Union Investment Sparplan (statt Trade Republic)', typ: 'whitespot', quellen: ['finanztransaktion'], prioritaet: 'hoch', volumen: 1800, volumenTyp: 'jaehrlich', beschreibung: '500\u20AC/mtl. Sparplan geht an Fremdbank! VR-FinanzPlan mit UniGlobal / UniNachhaltig anbieten.', empfohleneAktion: 'termin_vereinbaren', produktEmpfehlung: 'Union Investment UniGlobal Vorsorge' },
            { titel: 'VermoegenPlus Depot (Trade Republic umschichten)', typ: 'whitespot', quellen: ['finanztransaktion'], prioritaet: 'hoch', volumen: 675, volumenTyp: 'jaehrlich', beschreibung: '28.000\u20AC bei Trade Republic ohne Beratung. Depot-Umzug zu VR-Bank vorschlagen.', empfohleneAktion: 'termin_vereinbaren', produktEmpfehlung: 'VR-MeinDepot' },
            { titel: 'Tagesgeld-Konsolidierung ING auf VR', typ: 'anpassung', quellen: ['finanztransaktion'], prioritaet: 'mittel', volumen: 150, volumenTyp: 'jaehrlich', beschreibung: '22k bei ING zu 2,8%. VR-Tagesgeld aufwerten oder VR-FinanzPlan mit Tagesgeld-Anteil.', empfohleneAktion: 'angebot_erstellen', produktEmpfehlung: 'VR-Tagesgeld Extra' },
            { titel: 'R+V KFZ statt HUK-Coburg', typ: 'cross_sell', quellen: ['wettbewerb'], prioritaet: 'mittel', volumen: 540, volumenTyp: 'jaehrlich', beschreibung: '2 PKW bei HUK = 1.200/J. R+V-Tarif vergleichen. Buendel-Effekt durch VR-Mitgliedschaft.', empfohleneAktion: 'tarifvergleich', produktEmpfehlung: 'R+V KFZ-Versicherung' },
            { titel: 'R+V Risikolebensversicherung', typ: 'cross_sell', quellen: ['bestand', 'lebensereignis'], prioritaet: 'hoch', volumen: 360, volumenTyp: 'jaehrlich', beschreibung: 'Baufi 185k, 2 Kinder, keine RLV vorhanden! Pflichtberatung bei Anschlussfinanzierung nutzen.', empfohleneAktion: 'angebot_erstellen', produktEmpfehlung: 'R+V Risikolebensversicherung' },
            { titel: 'Schwaebisch Hall Bauspar NEU (Modernisierung)', typ: 'whitespot', quellen: ['bestand'], prioritaet: 'niedrig', volumen: 500, volumenTyp: 'jaehrlich', beschreibung: 'Alter BSV zuteilungsreif. DHH Baujahr 2010 \u2013 energetische Modernisierung? Neuen BSV fuer KfW-foerderfaehige Massnahmen.', empfohleneAktion: 'termin_vereinbaren', produktEmpfehlung: 'Schwaebisch Hall Bausparvertrag' },
            { titel: 'FIDA-Consent erweitern', typ: 'aktion', quellen: ['bestand'], prioritaet: 'mittel', volumen: 0, volumenTyp: 'vermittlung', beschreibung: 'Alte Leipziger hat keinen Consent \u2013 Daten fehlen. Vollstaendiges Finanzbild erst mit allen Konten.', empfohleneAktion: 'termin_vereinbaren', produktEmpfehlung: 'FIDA-Consent erweitern' }
        ],

        kommunikation: [
            { typ: 'chatbot', datum: '2026-03-05T20:30:00', betreff: 'genoGPT: Anschlussfinanzierung', verlauf: [
                { rolle: 'kunde', text: 'Meine Zinsbindung laeuft bald aus. Was kann ich tun?' },
                { rolle: 'bot', text: 'Ihre Baufinanzierung hat eine Zinsbindung bis 04/2026. Fuer die Anschlussfinanzierung bieten wir aktuell attraktive Konditionen ab 3,2% p.a.' },
                { rolle: 'kunde', text: 'Was sind die aktuellen Konditionen?' },
                { rolle: 'bot', text: 'Aktuell ab 3,2% p.a. fuer 10 Jahre Zinsbindung. Soll ich einen Beratungstermin vereinbaren?' },
                { rolle: 'kunde', text: 'Ja bitte' }
            ], ergebnis: 'Terminwunsch Anschlussfinanzierung', themen: ['baufinanzierung', 'anschluss', 'termin'], status: 'termin_geplant' },
            { typ: 'ki_kontakt', datum: '2026-02-22T10:00:00', betreff: 'Zinsbindungsablauf-Warnung + Geldabfluss', inhalt: 'System hat erkannt: 1. Baufi Zinsbindung endet 04/2026. 2. 1.500\u20AC/mtl. fliessen an Trade Republic + ING. Doppelte Handlungsempfehlung.', status: 'geoeffnet', followUp: false, automatisch: true, ausloeser: 'regelbasiert' },
            { typ: 'email', datum: '2026-02-28T09:00:00', betreff: 'Anschlussfinanzierung Angebot', inhalt: 'Angebot fuer Baufi-Anschluss gesendet', status: 'geoeffnet', geoeffnetAm: '2026-02-28T14:00:00', followUp: false, automatisch: true },
            { typ: 'call', datum: '2026-02-20T10:00:00', betreff: 'Telefonat Baufinanzierung', inhalt: 'Beratungsgespraech zu Anschlussoptionen', status: 'erledigt' },
            { typ: 'termin', datum: '2026-02-15T10:00:00', betreff: 'Jahresgespraech', inhalt: 'VR-FinanzPlan Review durchgefuehrt', status: 'erledigt' }
        ],
        avatarBg: '#2563eb', foto: 'assets/images/AdobeStock_624564221.jpeg',
        _modus: 'banking'
    };

    // ── B2: Sandra Mueller – Junge Familie, Eigentumsplanung ──
    window._bankingPersonas['Sandra M\u00fcller'] = {
        id: 'KDB002', ort: 'Giessen', segment: 'Potenzial', ertrag: 1800, finanzplan: false, letztKontakt: '25.02.2026',
        geburtsdatum: '23.11.1993', adresse: 'Bahnhofstr. 12, 35390 Giessen', telefon: '+49 641 55432', email: 's.mueller@email.de',
        beruf: 'Lehrerin (verbeamtet, A12)', familienstand: 'Verheiratet', arbeitgeber: 'Land Hessen (Gymnasium)',
        linkedinHint: false,
        linkedin: { kontakte: 80, aktivitaet: 'niedrig', branchen: ['Bildung'], zusammenfassung: 'Wenig aktiv, Bildungs-Community' },
        beschaeftigtSeit: '01.08.2018',
        nettoeinkommen: 3600,
        kinder: [{ name: 'Mia', alter: 2 }],
        risikoscore: 12, bonitaet: 91,
        nps: { score: 8, kategorie: 'passive', datum: '15.01.2026', kampagne: 'Jahresumfrage 2026', details: [
            { name: 'Beratungsqualitaet', wert: 8 }, { name: 'Zufriedenheit', wert: 8 },
            { name: 'Weiterempfehlung', wert: 8 }, { name: 'Preis-Leistung', wert: 7 }, { name: 'Erreichbarkeit', wert: 8 }
        ]},

        konten: [
            { produkt: 'VR-Girokonto', details: 'Besoldung Sandra 3.600\u20AC', saldo: 3000, eroeffnung: '01.09.2015', status: 'Aktiv' },
            { produkt: 'VR-Sparkonto', details: 'Eigenkapital-Ansparen, waechst mtl. +800\u20AC', saldo: 35000, eroeffnung: '01.01.2020', status: 'Aktiv' },
            { produkt: 'Visa Classic Kreditkarte', details: 'Wenig genutzt, ~200\u20AC/mtl.', saldo: -200, eroeffnung: '01.01.2019', status: 'Aktiv' }
        ],

        fidaVertraege: [
            { institut: 'Commerzbank', typ: 'Girokonto', info: 'Tobias Gehalt 4.200\u20AC \u2013 NICHT bei uns!', consent: null, gueltig: null },
            { institut: 'Commerzbank', typ: 'Depot', info: 'Tobias ETFs 45.000\u20AC, Sparplan 600\u20AC/mtl.', consent: null, gueltig: null },
            { institut: 'DKB', typ: 'Tagesgeld', info: 'Tobias 18.000\u20AC', consent: null, gueltig: null },
            { institut: 'Allianz', typ: 'BU-Versicherung', info: 'Sandra, 1.800\u20AC/mtl. Rente', consent: '20.01.2026', gueltig: '20.01.2027' },
            { institut: 'Allianz', typ: 'KFZ', info: 'Sandra, VW Golf', consent: '20.01.2026', gueltig: '20.01.2027' },
            { institut: 'Allianz', typ: 'Haftpflicht', info: 'Familie', consent: '20.01.2026', gueltig: '20.01.2027' }
        ],
        fremdProdukte: [
            { typ: 'girokonto', produkt: 'Girokonto Tobias', institut: 'Commerzbank', details: 'Gehalt 4.200\u20AC \u2013 KEIN Kunde bei uns!', volumenOderPraemie: 5000, consent: false },
            { typ: 'depot', produkt: 'ETF-Depot Tobias', institut: 'Commerzbank', details: 'Sparplan 600\u20AC/mtl.', volumenOderPraemie: 45000, consent: false },
            { typ: 'tagesgeld', produkt: 'Tagesgeld Tobias', institut: 'DKB', details: '', volumenOderPraemie: 18000, consent: false },
            { typ: 'bu', produkt: 'BU Sandra', institut: 'Allianz', details: '1.800\u20AC/mtl.', volumenOderPraemie: 1440, consent: true },
            { typ: 'bu', produkt: 'BU Tobias', institut: 'HDI', details: '2.500\u20AC/mtl.', volumenOderPraemie: 2160, consent: false },
            { typ: 'kfz', produkt: 'KFZ Sandra', institut: 'Allianz', details: 'VW Golf, TK', volumenOderPraemie: 520, consent: true },
            { typ: 'kfz', produkt: 'KFZ Tobias', institut: 'HUK', details: 'Skoda Octavia, VK', volumenOderPraemie: 680, consent: false },
            { typ: 'haftpflicht', produkt: 'Haftpflicht', institut: 'Allianz', details: 'Familie', volumenOderPraemie: 90, consent: true }
        ],

        sparenGeldmarkt: [
            { produkt: 'VR-Sparkonto', anbieter: 'Volksbank Mittelhessen', volumen: 35000, zinssatz: '1,50% p.a.', laufzeit: 'Flexibel' }
        ],
        sparenKapitalmarkt: [],
        versicherungenEigen: [],
        versicherungenFremd: [
            { versicherung: 'BU-Versicherung', anbieter: 'Allianz', deckung: '\u20AC1.800/Mon.', tarifart: 'Komfort', leistungen: ['Endalter 67'], praemie: '\u20AC1.440/Jahr', kuendigung: '01.01.2028' },
            { versicherung: 'Kfz-Versicherung', anbieter: 'Allianz', deckung: 'VW Golf TK', tarifart: 'Standard', leistungen: [], praemie: '\u20AC520/Jahr', kuendigung: '30.11.2026' },
            { versicherung: 'Privathaftpflicht', anbieter: 'Allianz', deckung: '\u20AC10 Mio.', tarifart: 'Familie', leistungen: [], praemie: '\u20AC90/Jahr', kuendigung: '01.01.2027' }
        ],
        finanzierungen: [],

        transaktionen: [
            { kategorie: 'gehalt', betrag: 3600, empfaenger: 'Besoldung Sandra', auffaelligkeit: null },
            { kategorie: 'sonstiges', betrag: 2000, empfaenger: 'Tobias Haushaltsgeld (von Commerzbank!)', auffaelligkeit: 'geht_von_fremdbank' },
            { kategorie: 'miete', betrag: -1100, empfaenger: 'Vermieter', auffaelligkeit: null },
            { kategorie: 'sparen', betrag: -800, empfaenger: 'Sparkonto Eigenkapital', auffaelligkeit: null },
            { kategorie: 'versicherung_fremd', betrag: -380, empfaenger: 'Allianz, HDI, HUK', auffaelligkeit: 'fremdversicherer' },
            { kategorie: 'kinder', betrag: -250, empfaenger: 'Kita', auffaelligkeit: null },
            { kategorie: 'konsum', betrag: -850, empfaenger: 'Lebensmittel/Haushalt', auffaelligkeit: null }
        ],
        haushaltsnetto: 5600,
        absicherungsquote: 6.8,
        sparquote: 14.3,
        freiVerfuegbar: 520,

        potentiale: [
            { titel: 'Baufinanzierung vorbereiten', typ: 'whitespot', quellen: ['bestand', 'lebensereignis'], prioritaet: 'kritisch', volumen: 4000, volumenTyp: 'jaehrlich', beschreibung: 'EK waechst (35k), Eigentum geplant, Kinderwunsch = Zeitdruck. Fruehzeitig Baufi-Beratung anbieten.', empfohleneAktion: 'termin_vereinbaren', produktEmpfehlung: 'Volksbank Baufinanzierung' },
            { titel: 'Tobias als Kunden gewinnen (Girokonto + Depot)', typ: 'whitespot', quellen: ['finanztransaktion'], prioritaet: 'hoch', volumen: 2400, volumenTyp: 'jaehrlich', beschreibung: '4.200\u20AC netto + 45k Depot bei Commerzbank. Bei Baufi muessen ohnehin beide Konten zu uns.', empfohleneAktion: 'termin_vereinbaren', produktEmpfehlung: 'VR-Girokonto + Union Investment' },
            { titel: 'Schwaebisch Hall Bauspar (Zinssicherung)', typ: 'whitespot', quellen: ['bestand'], prioritaet: 'hoch', volumen: 500, volumenTyp: 'jaehrlich', beschreibung: 'Eigenheim geplant. BSV sichert guenstigen Darlehenszins. Riester-Bauspar fuer Sandra (Beamtin) besonders attraktiv.', empfohleneAktion: 'angebot_erstellen', produktEmpfehlung: 'Schwaebisch Hall Riester-Bauspar' },
            { titel: 'R+V Risikolebensversicherung', typ: 'cross_sell', quellen: ['bestand', 'lebensereignis'], prioritaet: 'hoch', volumen: 360, volumenTyp: 'jaehrlich', beschreibung: 'Wenn Baufi kommt, brauchen beide RLV. Jetzt abschliessen = guenstigere Praemie (33+35 Jahre).', empfohleneAktion: 'angebot_erstellen', produktEmpfehlung: 'R+V Risikolebensversicherung' },
            { titel: 'R+V KFZ statt Allianz/HUK', typ: 'cross_sell', quellen: ['wettbewerb'], prioritaet: 'mittel', volumen: 540, volumenTyp: 'jaehrlich', beschreibung: '2 PKW bei Fremdversicherern. R+V-Buendel-Rabatt bei VR-Mitgliedschaft.', empfohleneAktion: 'tarifvergleich', produktEmpfehlung: 'R+V KFZ-Versicherung' },
            { titel: 'Union Investment Sparplan Tobias', typ: 'whitespot', quellen: ['finanztransaktion'], prioritaet: 'hoch', volumen: 1800, volumenTyp: 'jaehrlich', beschreibung: '45k Depot bei Commerzbank ohne VR-Beratung. Bei Kontowechsel Union Investment anbieten.', empfohleneAktion: 'termin_vereinbaren', produktEmpfehlung: 'Union Investment UniGlobal' },
            { titel: 'FIDA-Consent Tobias (Commerzbank)', typ: 'aktion', quellen: ['bestand'], prioritaet: 'mittel', volumen: 0, volumenTyp: 'vermittlung', beschreibung: 'Ohne Tobias Daten sehen wir nur die halbe Haushaltsbilanz.', empfohleneAktion: 'termin_vereinbaren', produktEmpfehlung: 'FIDA-Consent' }
        ],

        kommunikation: [
            { typ: 'chatbot', datum: '2026-03-02T21:00:00', betreff: 'genoGPT: Eigenheim-Finanzierung', verlauf: [
                { rolle: 'kunde', text: 'Wir moechten ein Haus kaufen. Wie viel Eigenkapital brauchen wir?' },
                { rolle: 'bot', text: 'Ideal sind 20-30% des Kaufpreises als Eigenkapital plus Nebenkosten (~10-15%). Sie haben aktuell 35.000\u20AC auf dem Sparkonto. Bei einem Kaufpreis von 350.000\u20AC braechten Sie idealerweise 85.000-120.000\u20AC.' },
                { rolle: 'kunde', text: 'Mein Mann hat auch noch Geld. Koennen wir trotzdem anfangen zu suchen?' },
                { rolle: 'bot', text: 'Ja, mit dem Geld Ihres Mannes (Commerzbank-Konten) und einem Bausparvertrag zur Zinssicherung koennen Sie schon planen. Soll ich einen Baufi-Beratungstermin vereinbaren?' },
                { rolle: 'kunde', text: 'Ja, gerne fuer uns beide' }
            ], ergebnis: 'Terminwunsch Baufinanzierung', themen: ['baufinanzierung', 'eigenkapital', 'termin'], status: 'termin_geplant' },
            { typ: 'ki_kontakt', datum: '2026-02-18T10:00:00', betreff: 'Baufi-Potenzial + Partner-Akquise', inhalt: 'System hat erkannt: Sandra spart fuer Eigenheim (35k EK). Partner Tobias bei Commerzbank mit 63k Vermoegen. Baufi-Beratung + Konto-Akquise.', status: 'geoeffnet', followUp: false, automatisch: true, ausloeser: 'regelbasiert' },
            { typ: 'email', datum: '2026-02-10T09:00:00', betreff: 'Eigenheim-Ratgeber', inhalt: 'Unser Ratgeber fuer den Weg ins Eigenheim.', status: 'geoeffnet', geoeffnetAm: '2026-02-10T20:00:00', followUp: true, automatisch: true }
        ],
        avatarBg: '#9333ea', foto: 'assets/images/AdobeStock_252262042.jpeg',
        _modus: 'banking'
    };

    // ── B3: Peter Hoffmann – Firmenkunde GmbH-Geschaeftsfuehrer ──
    window._bankingPersonas['Peter Hoffmann'] = {
        id: 'FKB001', ort: 'Wetzlar', segment: 'Firmenkunde', ertrag: 8500, finanzplan: true, letztKontakt: '15.02.2026',
        geburtsdatum: '30.01.1968', adresse: 'Friedrichstr. 5, 35578 Wetzlar', telefon: '+49 6441 88456', email: 'p.hoffmann@hoffmann-metallbau.de',
        beruf: 'GF Hoffmann Metallbau GmbH (35 MA, 4,2M Umsatz)', familienstand: 'Verheiratet', arbeitgeber: 'Hoffmann Metallbau GmbH (Inhaber)',
        linkedinHint: false,
        linkedin: { kontakte: 0, aktivitaet: 'nicht_vorhanden', branchen: [], zusammenfassung: 'Nicht auf LinkedIn, lokales Handwerksnetzwerk' },
        beschaeftigtSeit: '01.01.1998',
        nettoeinkommen: 8000,
        kinder: [{ name: 'Fabian', alter: 30 }, { name: 'Laura', alter: 27 }],
        risikoscore: 30, bonitaet: 79,
        nps: { score: 8, kategorie: 'passive', datum: '15.01.2026', kampagne: 'Jahresumfrage 2026', details: [
            { name: 'Beratungsqualitaet', wert: 9 }, { name: 'Zufriedenheit', wert: 8 },
            { name: 'Weiterempfehlung', wert: 8 }, { name: 'Preis-Leistung', wert: 7 }, { name: 'Erreichbarkeit', wert: 8 }
        ]},

        konten: [
            { produkt: 'VR-Geschaeftskonto Hauptkonto', details: 'Alle Geschaeftsumsaetze, ~350k/mtl.', saldo: 120000, eroeffnung: '01.01.1998', status: 'Aktiv' },
            { produkt: 'VR-Geschaeftskonto Ruecklagen', details: 'Steuer + Investitions-Ruecklagen', saldo: 180000, eroeffnung: '01.01.2005', status: 'Aktiv' },
            { produkt: 'VR-Geschaeftskonto Lohn', details: '35 Mitarbeiter Gehaltskonten', saldo: 45000, eroeffnung: '01.01.2000', status: 'Aktiv' },
            { produkt: 'VR-Girokonto Premium (privat)', details: 'GF-Gehalt 8.000\u20AC netto', saldo: 15000, eroeffnung: '01.01.2005', status: 'Aktiv' },
            { produkt: 'KfW-Investitionskredit (Firma)', details: 'Maschinenhalle 2023, Restschuld 250k', saldo: -250000, eroeffnung: '01.06.2023', status: 'Aktiv' },
            { produkt: 'Visa Business Kreditkarte', details: 'Geschaeftsreisen, 3.000\u20AC/mtl.', saldo: -3000, eroeffnung: '01.01.2015', status: 'Aktiv' }
        ],

        fidaVertraege: [
            { institut: 'Deutsche Bank', typ: 'Privat-Depot', info: '320.000\u20AC Einzelaktien + Fonds', consent: null, gueltig: null },
            { institut: 'Zurich', typ: 'Gewerbeversicherung', info: 'Haftpflicht + Inhalts + BU-Gewerbe', consent: null, gueltig: null }
        ],
        fremdProdukte: [
            { typ: 'depot', produkt: 'Privat-Depot', institut: 'Deutsche Bank', details: 'Einzelaktien + Fonds', volumenOderPraemie: 320000, consent: false },
            { typ: 'gewerbe', produkt: 'Gewerbeversicherung', institut: 'Zurich', details: 'Haftpflicht, Inhalts, BU-Gewerbe', volumenOderPraemie: 4200, consent: false }
        ],

        sparenGeldmarkt: [
            { produkt: 'Firmenkonto Ruecklagen', anbieter: 'Volksbank Mittelhessen', volumen: 180000, zinssatz: '0,00% p.a.', laufzeit: 'Sichteinlage' }
        ],
        sparenKapitalmarkt: [
            { produkt: 'Privat-Depot', anbieter: 'Deutsche Bank', volumen: 320000, sparrate: '\u20AC800/Mon.', performance: '+6,2%', quelle: 'FIDA' }
        ],
        versicherungenEigen: [],
        versicherungenFremd: [
            { versicherung: 'Gewerbeversicherung Paket', anbieter: 'Zurich', deckung: 'Haftpflicht 5M + Inhalts 200k + BU-Gewerbe', tarifart: 'Gewerbe', leistungen: ['Betriebshaftpflicht', 'Inhaltsversicherung'], praemie: '\u20AC4.200/Jahr', kuendigung: '01.01.2027' }
        ],
        finanzierungen: [
            { kredit: 'KfW-Investitionskredit', kreditgeber: 'KfW ueber VR', ursprung: 400000, restschuld: 250000, zinssatz: '3,80% p.a.', rate: '\u20AC4.500/Mon.', laufzeit: '06/2028', absicherung: 'Grundschuld Maschinenhalle' }
        ],

        transaktionen: [
            { kategorie: 'gehalt', betrag: 8000, empfaenger: 'GF-Gehalt + Ausschuettungen', auffaelligkeit: null },
            { kategorie: 'sparplan', betrag: -800, empfaenger: 'Deutsche Bank Depot', auffaelligkeit: 'geht_an_fremdbank' },
            { kategorie: 'konsum', betrag: -3000, empfaenger: 'Lebenshaltung Premium', auffaelligkeit: null },
            { kategorie: 'freizeit', betrag: -800, empfaenger: 'Golf, Reisen', auffaelligkeit: null }
        ],
        haushaltsnetto: 8000,
        freiVerfuegbar: 3400,

        potentiale: [
            { titel: 'VR-Firmendepot (Firmengelder anlegen)', typ: 'whitespot', quellen: ['bestand'], prioritaet: 'hoch', volumen: 5400, volumenTyp: 'jaehrlich', beschreibung: '180k Ruecklagen auf Firmenkonto ohne Rendite. VR-Firmendepot oder Union Investment Institutionell.', empfohleneAktion: 'termin_vereinbaren', produktEmpfehlung: 'Union Investment Institutionell' },
            { titel: 'D&O-Versicherung ueber R+V', typ: 'cross_sell', quellen: ['bestand'], prioritaet: 'kritisch', volumen: 3600, volumenTyp: 'jaehrlich', beschreibung: 'GmbH-GF ohne D&O = persoenliches Haftungsrisiko! Keine D&O vorhanden.', empfohleneAktion: 'angebot_erstellen', produktEmpfehlung: 'R+V D&O-Versicherung' },
            { titel: 'Nachfolgeberatung', typ: 'cross_sell', quellen: ['lebensereignis'], prioritaet: 'hoch', volumen: 0, volumenTyp: 'vermittlung', beschreibung: '58 Jahre, kein Nachfolger benannt. Unternehmenswert ~3-4M\u20AC. Betriebsverkauf + Vermoegensanlage.', empfohleneAktion: 'termin_vereinbaren', produktEmpfehlung: 'Nachfolge-Beratung' },
            { titel: 'Privat-Depot zu VR umschichten', typ: 'whitespot', quellen: ['finanztransaktion'], prioritaet: 'mittel', volumen: 2400, volumenTyp: 'jaehrlich', beschreibung: '320k bei Deutsche Bank. Depot-Umzug zu VR mit Union Investment Fonds.', empfohleneAktion: 'termin_vereinbaren', produktEmpfehlung: 'VR-MeinDepot / Union Investment' },
            { titel: 'R+V Gewerbe-Paket (statt Zurich)', typ: 'cross_sell', quellen: ['wettbewerb'], prioritaet: 'mittel', volumen: 4200, volumenTyp: 'jaehrlich', beschreibung: 'Gewerbeversicherung komplett bei Zurich. R+V Verbund-Rabatt anbieten.', empfohleneAktion: 'tarifvergleich', produktEmpfehlung: 'R+V Gewerbeversicherung' }
        ],

        kommunikation: [
            { typ: 'chatbot', datum: '2026-03-06T18:30:00', betreff: 'genoGPT: Unternehmensnachfolge', verlauf: [
                { rolle: 'kunde', text: 'Welche Modelle gibt es fuer die Unternehmensnachfolge?' },
                { rolle: 'bot', text: 'Fuer Ihre Metallbau GmbH gibt es: Verkauf, schrittweise Uebergabe, oder Familiengesellschaft. Steuerlich ist fruehzeitige Planung wichtig.' },
                { rolle: 'kunde', text: 'Keiner meiner Kinder will uebernehmen. Was dann?' },
                { rolle: 'bot', text: 'Dann kommen externer Verkauf oder MBO (Management Buy-Out) in Frage. Wir koennen Unternehmenswert und Finanzierungskonzept erstellen. Termin?' },
                { rolle: 'kunde', text: 'Ja, unbedingt' }
            ], ergebnis: 'Terminwunsch Nachfolgeberatung', themen: ['nachfolge', 'metallbau', 'termin'], status: 'termin_geplant' },
            { typ: 'ki_kontakt', datum: '2026-02-20T10:00:00', betreff: 'D&O-Luecke + Nachfolge', inhalt: 'System hat erkannt: GmbH-GF 58J ohne D&O-Versicherung und ohne Nachfolgeregelung. Doppelte Handlungsempfehlung.', status: 'geoeffnet', followUp: false, automatisch: true, ausloeser: 'regelbasiert' },
            { typ: 'termin', datum: '2026-02-15T10:00:00', betreff: 'VR-FinanzPlan Review', inhalt: 'Jaehrliche Vermoegenssuebersicht besprochen', status: 'erledigt' }
        ],
        avatarBg: '#dc2626', foto: 'assets/images/AdobeStock_612932760.jpeg',
        _modus: 'banking'
    };

})();
