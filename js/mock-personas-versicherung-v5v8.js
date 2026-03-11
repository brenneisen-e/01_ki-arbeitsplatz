// ═══════════════════════════════════════════════════════
// OPT-26: Versicherungs-Personas V5-V8
// 5 Datenschichten: Stamm, Eigen, Fremd, Transaktionen, Potentiale
// ═══════════════════════════════════════════════════════

(function() {
    'use strict';

    if (!window._versicherungsPersonas) window._versicherungsPersonas = {};

    // ── V5: Klaus Meier – Beamter, PKV, Beihilfe-berechtigt ──
    window._versicherungsPersonas['Klaus Meier'] = {
        geburtsdatum: '14.07.1978',
        adresse: 'Lindenweg 22, 50226 Frechen',
        telefon: '+49 2234 123456',
        email: 'klaus.meier@brk-koeln.de',
        beruf: 'Oberregierungsrat (A14), Bezirksregierung Koeln',
        familienstand: 'Verheiratet',
        nettoeinkommen: 4800,
        arbeitgeber: 'Bezirksregierung Koeln (Beamter auf Lebenszeit)',
        linkedinHint: false,
        linkedin: { kontakte: 0, aktivitaet: 'nicht_vorhanden', branchen: [], zusammenfassung: 'Nicht auf LinkedIn aktiv' },
        beschaeftigtSeit: '01.04.2005',
        tiere: 'keine',
        risikoscore: 18,
        risikoDetails: ['Hoher Puffer aber keine Altersvorsorge trotz Beamtenstatus'],
        bonitaetsscore: 92,
        schadenhistorie: [
            { datum: '05.12.2024', sparte: 'Wohngebaeude', beschreibung: 'Sturmschaden Dachziegel', status: 'Reguliert', betrag: '\u20AC2.100', versicherer: 'ERGO' }
        ],
        kinder: [{ name: 'Lena', alter: 16 }, { name: 'Niklas', alter: 13 }, { name: 'Finn', alter: 10 }],
        nps: { score: 6, kategorie: 'detractor', datum: '08.10.2025', kampagne: 'Herbst-Zufriedenheitsbefragung 2025 (E-Mail)', details: [
            { name: 'Beratungsqualitaet', wert: 6 },
            { name: 'Zufriedenheit mit dem Unternehmen', wert: 6 },
            { name: 'Weiterempfehlung an Freunde', wert: 7 },
            { name: 'Preis-Leistungs-Verhaeltnis', wert: 5 },
            { name: 'Erreichbarkeit & Service', wert: 6 }
        ]},

        vertraege: [
            { typ: 'PKV (Beamten-Tarif)', versicherer: 'ERGO', details: '30% Eigenanteil (70% Beihilfe), jaehrl. Beitragsanpassung', praemie: '\u20AC3.840/Jahr', beginn: '01.04.2005', status: 'Aktiv' },
            { typ: 'PKV Kinder', versicherer: 'ERGO', details: '3 Kinder, 20% Eigenanteil (80% Beihilfe)', praemie: '\u20AC1.080/Jahr', beginn: '01.01.2010', status: 'Aktiv' },
            { typ: 'Wohngebaeudeversicherung', versicherer: 'ERGO', details: 'DHH 135 qm, inkl. Elementar', praemie: '\u20AC420/Jahr', beginn: '01.01.2012', status: 'Aktiv' },
            { typ: 'Hausratversicherung', versicherer: 'ERGO', details: '135 qm', praemie: '\u20AC210/Jahr', beginn: '01.01.2012', status: 'Aktiv' },
            { typ: 'Kfz-Versicherung', versicherer: 'ERGO', details: 'VW Passat Variant, VK', praemie: '\u20AC720/Jahr', beginn: '01.01.2018', status: 'Aktiv' },
            { typ: 'Kfz-Versicherung', versicherer: 'ERGO', details: 'VW T-Cross (Petra), TK', praemie: '\u20AC380/Jahr', beginn: '01.01.2020', status: 'Aktiv' }
        ],

        fidaVertraege: [
            { institut: 'Sparkasse Koeln', typ: 'Girokonto', info: 'Besoldung 4.800\u20AC', consent: '01.09.2025', gueltig: '01.09.2027' },
            { institut: 'Sparkasse Koeln', typ: 'Sparkonto', info: '42.000\u20AC', consent: '01.09.2025', gueltig: '01.09.2027' },
            { institut: 'LBS', typ: 'Bausparvertrag', info: 'Zuteilungsreif, 25.000\u20AC', consent: '01.09.2025', gueltig: '01.09.2027' },
            { institut: 'DWS (Sparkasse)', typ: 'Depot', info: 'Mischfonds, kaum Performance, 35.000\u20AC', consent: null, gueltig: null },
            { institut: 'DBV/AXA', typ: 'Dienstunfaehigkeitsversicherung', info: '2.400\u20AC/mtl. Rente, 1.200\u20AC/J.', consent: null, gueltig: null }
        ],
        fremdProdukte: [
            { typ: 'girokonto', produkt: 'Girokonto', institut: 'Sparkasse Koeln', details: 'Besoldung Klaus 4.800\u20AC', volumenOderPraemie: 5500, consent: true },
            { typ: 'sparkonto', produkt: 'Sparkonto', institut: 'Sparkasse Koeln', details: 'Ansparen', volumenOderPraemie: 42000, consent: true },
            { typ: 'bauspar', produkt: 'Bausparvertrag', institut: 'LBS', details: 'Zuteilungsreif', volumenOderPraemie: 25000, consent: true },
            { typ: 'depot', produkt: 'Mischfonds-Depot', institut: 'DWS (Sparkasse)', details: 'Kaum Performance', volumenOderPraemie: 35000, consent: false },
            { typ: 'du', produkt: 'Dienstunfaehigkeitsversicherung', institut: 'DBV/AXA', details: '2.400\u20AC/mtl. Rente', volumenOderPraemie: 1200, consent: false }
        ],

        transaktionen: [
            { kategorie: 'gehalt', betrag: 4800, empfaenger: 'Bezirksregierung Koeln', auffaelligkeit: null },
            { kategorie: 'gehalt_partner', betrag: 3600, empfaenger: 'Finanzamt (Petra, Beamtin A12)', auffaelligkeit: null },
            { kategorie: 'versicherung_eigen', betrag: -554, empfaenger: 'ERGO (PKV+WGV+Hausrat+2xKFZ)', auffaelligkeit: null },
            { kategorie: 'versicherung_fremd', betrag: -100, empfaenger: 'DBV/AXA Dienstunfaehigkeit', auffaelligkeit: 'fremdversicherer' },
            { kategorie: 'sparen', betrag: -300, empfaenger: 'Sparkasse Sparkonto', auffaelligkeit: null },
            { kategorie: 'kinder', betrag: -280, empfaenger: 'Sport, Musik (3 Kinder)', auffaelligkeit: null },
            { kategorie: 'konsum', betrag: -2800, empfaenger: 'Lebenshaltung Familie', auffaelligkeit: null }
        ],
        haushaltsnetto: 8400,
        absicherungsquote: 7.8,
        sparquote: 3.6,
        freiVerfuegbar: 3500,

        potentiale: [
            { titel: 'PKV-Tarifoptimierung (interner Wechsel)', typ: 'anpassung', quellen: ['bestand'], prioritaet: 'hoch', volumen: -600, volumenTyp: 'jaehrlich', beschreibung: 'Tarif seit 12 Jahren, neuere Tarife mit besserem PLV. Beamtenbeihilfe bleibt gleich. Ersparnis moeglich.', empfohleneAktion: 'tarifvergleich', produktEmpfehlung: 'ERGO PKV Beamten-Tarif (aktuell)' },
            { titel: 'DU-Versicherung auf ERGO wechseln', typ: 'cross_sell', quellen: ['wettbewerb'], prioritaet: 'hoch', volumen: 1200, volumenTyp: 'jaehrlich', beschreibung: 'DBV/AXA-Tarif pruefen. ERGO-Beamten-DU oft guenstiger bei gleicher Leistung.', empfohleneAktion: 'tarifvergleich', produktEmpfehlung: 'ERGO Dienstunfaehigkeitsversicherung Beamte' },
            { titel: 'Pflegezusatzversicherung (Ehepaar)', typ: 'whitespot', quellen: ['bestand'], prioritaet: 'hoch', volumen: 960, volumenTyp: 'jaehrlich', beschreibung: '48+46 Jahre. Beihilfe deckt nur 70/80% der Pflegekosten. Eigenanteil steigt dramatisch bei Heim.', empfohleneAktion: 'angebot_erstellen', produktEmpfehlung: 'ERGO Pflege-Monatsgeld' },
            { titel: 'Fondsgebundene Altersvorsorge', typ: 'whitespot', quellen: ['bestand', 'finanztransaktion'], prioritaet: 'mittel', volumen: 3600, volumenTyp: 'jaehrlich', beschreibung: '3.500\u20AC frei/mtl. aber keine Altersvorsorge. DWS-Depot kaum Performance. ERGO-Fondspolice mit Steuervorteil.', empfohleneAktion: 'termin_vereinbaren', produktEmpfehlung: 'ERGO Fondsgebundene Rentenversicherung' },
            { titel: 'Kinderunfallversicherung', typ: 'whitespot', quellen: ['bestand'], prioritaet: 'mittel', volumen: 210, volumenTyp: 'jaehrlich', beschreibung: '3 aktive Kinder. Schulunfaelle nur begrenzt durch gesetzl. UV gedeckt.', empfohleneAktion: 'angebot_erstellen', produktEmpfehlung: 'ERGO Unfall Smart Kinder' }
        ],

        kommunikation: [
            { typ: 'chatbot', datum: '2026-03-04T12:30:00', betreff: 'Self-Service Anfrage: PKV Beitragsanpassung', verlauf: [
                { rolle: 'kunde', text: 'Mein PKV-Beitrag wurde schon wieder erhoeht. Kann ich da was machen?' },
                { rolle: 'bot', text: 'Beitragsanpassungen in der PKV kommen regelmaessig vor. Sie haben das Recht auf einen internen Tarifwechsel (\u00a7204 VVG). Neuere ERGO-Tarife koennen guenstiger sein bei gleicher Leistung.' },
                { rolle: 'kunde', text: 'Kann ich einfach wechseln?' },
                { rolle: 'bot', text: 'Ja, ein interner Tarifwechsel ist moeglich ohne neue Gesundheitspruefung. Soll ich einen Beratungstermin vereinbaren?' },
                { rolle: 'kunde', text: 'Ja bitte' }
            ], ergebnis: 'Terminwunsch PKV-Tarifwechsel', themen: ['pkv', 'tarifwechsel', 'beamter'], status: 'termin_geplant' },
            { typ: 'ki_kontakt', datum: '2026-02-20T10:00:00', betreff: 'Pflegezusatz-Empfehlung Beamte', inhalt: 'System hat erkannt: Beamter 48 J. + Ehefrau 46 J. ohne Pflegezusatz. Beihilfe deckt max. 70/80% der Pflegekosten.', status: 'geoeffnet', followUp: false, automatisch: true, ausloeser: 'regelbasiert' },
            { typ: 'email', datum: '2026-01-28T09:00:00', betreff: 'PKV-Beitragsanpassung 2026', inhalt: 'Information zur Beitragsanpassung Ihrer PKV zum 01.04.2026.', status: 'geoeffnet', geoeffnetAm: '2026-01-28T19:00:00', followUp: true, automatisch: true }
        ],

        _modus: 'versicherung'
    };

    // ── V6: Lisa Bauer – Freelancerin, fast unversichert ──
    window._versicherungsPersonas['Lisa Bauer'] = {
        geburtsdatum: '03.04.1995',
        adresse: 'Neusser Str. 120, 50733 Koeln-Nippes',
        telefon: '+49 221 3456789',
        email: 'lisa@lisabauer-design.de',
        beruf: 'Freelance Grafikdesignerin',
        familienstand: 'Ledig',
        nettoeinkommen: 2400,
        arbeitgeber: 'Selbstaendig (ueber KSK)',
        linkedinHint: true,
        linkedin: { kontakte: 1200, aktivitaet: 'hoch', branchen: ['Grafikdesign', 'Kreativwirtschaft', 'Branding'], zusammenfassung: 'Freelance Grafikdesignerin, sehr aktiv in Kreativ-Szene, 1.200+ Kontakte' },
        beschaeftigtSeit: '01.01.2020',
        tiere: 'keine',
        risikoscore: 48,
        risikoDetails: ['Selbstaendig ohne BU \u2013 existenzbedrohend', 'Keine Berufshaftpflicht als Designerin', 'Schwankende Einnahmen, kein Puffer'],
        bonitaetsscore: 62,
        schadenhistorie: [],
        kinder: [],
        nps: { score: 8, kategorie: 'passive', datum: '15.10.2025', kampagne: 'Herbst-Zufriedenheitsbefragung 2025 (E-Mail)', details: [
            { name: 'Beratungsqualitaet', wert: 8 },
            { name: 'Zufriedenheit mit dem Unternehmen', wert: 8 },
            { name: 'Weiterempfehlung an Freunde', wert: 9 },
            { name: 'Preis-Leistungs-Verhaeltnis', wert: 7 },
            { name: 'Erreichbarkeit & Service', wert: 8 }
        ]},

        vertraege: [
            { typ: 'Privathaftpflichtversicherung', versicherer: 'ERGO', details: 'Single, 10 Mio. \u20AC Deckung', praemie: '\u20AC55/Jahr', beginn: '01.06.2021', status: 'Aktiv' }
        ],

        fidaVertraege: [
            { institut: 'Holvi', typ: 'Geschaeftskonto', info: 'Freelancer-Konto, ~3.500\u20AC', consent: '01.12.2025', gueltig: '01.12.2027' },
            { institut: 'DKB', typ: 'Girokonto', info: 'Privat, ~1.800\u20AC', consent: '01.12.2025', gueltig: '01.12.2027' }
        ],
        fremdProdukte: [
            { typ: 'geschaeftskonto', produkt: 'Freelancer-Konto', institut: 'Holvi', details: 'Geschaeftskonto', volumenOderPraemie: 3500, consent: true },
            { typ: 'girokonto', produkt: 'Girokonto', institut: 'DKB', details: 'Privatkonto', volumenOderPraemie: 1800, consent: true },
            { typ: 'gkv', produkt: 'GKV ueber KSK', institut: 'Kuenstlersozialkasse', details: '~210\u20AC/mtl.', volumenOderPraemie: 2520, consent: false }
        ],

        transaktionen: [
            { kategorie: 'gehalt', betrag: 2400, empfaenger: 'Kundenzahlungen (schwankend 1.800-3.200)', auffaelligkeit: 'schwankend' },
            { kategorie: 'miete', betrag: -480, empfaenger: 'WG-Miete', auffaelligkeit: null },
            { kategorie: 'versicherung_fremd', betrag: -210, empfaenger: 'KSK (GKV+RV+PV)', auffaelligkeit: null },
            { kategorie: 'abos', betrag: -65, empfaenger: 'Adobe CC + Design-Tools', auffaelligkeit: null },
            { kategorie: 'versicherung_eigen', betrag: -5, empfaenger: 'ERGO Haftpflicht', auffaelligkeit: null },
            { kategorie: 'konsum', betrag: -600, empfaenger: 'Lebenshaltung', auffaelligkeit: null },
            { kategorie: 'mobilitaet', betrag: -120, empfaenger: 'OEPNV, Fahrrad', auffaelligkeit: null }
        ],
        haushaltsnetto: 2400,
        absicherungsquote: 0.2,
        sparquote: 0,
        freiVerfuegbar: 800,

        potentiale: [
            { titel: 'BU-Versicherung', typ: 'whitespot', quellen: ['bestand'], prioritaet: 'kritisch', volumen: 720, volumenTyp: 'jaehrlich', beschreibung: '31, Freelancerin, kein Arbeitgeber-Schutz. KSK zahlt nur Mini-Erwerbsminderungsrente. BU 1.000\u20AC/mtl. = Existenzsicherung.', empfohleneAktion: 'angebot_erstellen', produktEmpfehlung: 'ERGO BU Comfort' },
            { titel: 'Berufshaftpflicht (Vermoegens-HP)', typ: 'whitespot', quellen: ['bestand'], prioritaet: 'hoch', volumen: 180, volumenTyp: 'jaehrlich', beschreibung: 'Grafikdesignerin ohne Berufshaftpflicht. Kundenprojekt mit Fehler = Schadensersatz.', empfohleneAktion: 'angebot_erstellen', produktEmpfehlung: 'ERGO Berufshaftpflicht Kreative' },
            { titel: 'Hausratversicherung', typ: 'whitespot', quellen: ['bestand'], prioritaet: 'mittel', volumen: 85, volumenTyp: 'jaehrlich', beschreibung: 'MacBook Pro + iPad + Kamera = hoher mobiler Hausrat. WG-Anteil versichern.', empfohleneAktion: 'angebot_erstellen', produktEmpfehlung: 'ERGO Hausrat Smart' },
            { titel: 'Ruerup-Rente (KSK-Ergaenzung)', typ: 'whitespot', quellen: ['bestand'], prioritaet: 'mittel', volumen: 1200, volumenTyp: 'jaehrlich', beschreibung: 'KSK-Rente reicht nicht. Als Selbstaendige Ruerup steuerlich absetzbar.', empfohleneAktion: 'termin_vereinbaren', produktEmpfehlung: 'ERGO Ruerup-Rente' },
            { titel: 'Rechtsschutzversicherung', typ: 'whitespot', quellen: ['bestand'], prioritaet: 'niedrig', volumen: 190, volumenTyp: 'jaehrlich', beschreibung: 'Freelancer-Vertraege, Honorarstreitigkeiten, Mietrecht.', empfohleneAktion: 'angebot_erstellen', produktEmpfehlung: 'ERGO Rechtsschutz Smart' }
        ],

        kommunikation: [
            { typ: 'chatbot', datum: '2026-03-09T14:00:00', betreff: 'Self-Service Anfrage: Berufshaftpflicht', verlauf: [
                { rolle: 'kunde', text: 'Brauche ich als Grafikdesignerin eine Berufshaftpflicht?' },
                { rolle: 'bot', text: 'Ja, unbedingt! Wenn ein Kunde wegen eines Designfehlers Schadensersatz fordert, haften Sie persoenlich. Eine Berufshaftpflicht fuer Kreative kostet ab ca. 15\u20AC/Mon.' },
                { rolle: 'kunde', text: 'Und eine BU? Ich bin doch noch jung.' },
                { rolle: 'bot', text: 'Gerade als Freelancerin ist eine BU besonders wichtig \u2013 Sie haben keinen Arbeitgeber, der Sie auffaengt. Mit 31 bekommen Sie noch sehr guenstige Konditionen. Soll ich einen Termin vereinbaren?' },
                { rolle: 'kunde', text: 'Ja bitte, beides zusammen' }
            ], ergebnis: 'Terminwunsch BU + Berufshaftpflicht', themen: ['berufshaftpflicht', 'bu', 'freelancer', 'termin'], status: 'termin_geplant' },
            { typ: 'ki_kontakt', datum: '2026-02-26T10:00:00', betreff: 'DRINGENDE Absicherungs-Empfehlung Freelancerin', inhalt: 'System hat erkannt: Freelancerin mit NUR Haftpflichtversicherung. Keine BU, keine Berufshaftpflicht. Absicherungsquote 0,2%. Existenzbedrohend.', status: 'geoeffnet', followUp: false, automatisch: true, ausloeser: 'regelbasiert' },
            { typ: 'email', datum: '2026-02-10T09:00:00', betreff: 'Freelancer-Schutzpaket: BU + Berufshaftpflicht', inhalt: 'Als Selbstaendige sind Sie besonders verwundbar. Unser Freelancer-Paket schuetzt Sie.', status: 'geoeffnet', geoeffnetAm: '2026-02-10T22:00:00', followUp: true, automatisch: true }
        ],

        _modus: 'versicherung'
    };

    // ── V7: Michael Braun – Ruhestaendler, vermoegend, bestandstreu ──
    window._versicherungsPersonas['Michael Braun'] = {
        geburtsdatum: '17.09.1964',
        adresse: 'Am Stadtpark 5, 51373 Leverkusen',
        telefon: '+49 214 987654',
        email: 'michael.braun@email.de',
        beruf: 'Ruhestand (ex-Ingenieur, BASF)',
        familienstand: 'Verheiratet',
        nettoeinkommen: 5250,
        arbeitgeber: 'Ruhestand seit 2024',
        linkedinHint: false,
        linkedin: { kontakte: 0, aktivitaet: 'nicht_vorhanden', branchen: [], zusammenfassung: 'Nicht auf LinkedIn aktiv' },
        beschaeftigtSeit: '01.01.2024',
        tiere: 'keine',
        risikoscore: 15,
        risikoDetails: [],
        bonitaetsscore: 90,
        schadenhistorie: [
            { datum: '20.01.2025', sparte: 'Wohngebaeude', beschreibung: 'Wasserrohrbruch Keller', status: 'Reguliert', betrag: '\u20AC5.800', versicherer: 'ERGO' }
        ],
        kinder: [{ name: 'Stefan', alter: 35 }, { name: 'Katrin', alter: 32 }],
        nps: { score: 9, kategorie: 'promoter', datum: '15.10.2025', kampagne: 'Herbst-Zufriedenheitsbefragung 2025 (E-Mail)', details: [
            { name: 'Beratungsqualitaet', wert: 9 },
            { name: 'Zufriedenheit mit dem Unternehmen', wert: 9 },
            { name: 'Weiterempfehlung an Freunde', wert: 10 },
            { name: 'Preis-Leistungs-Verhaeltnis', wert: 8 },
            { name: 'Erreichbarkeit & Service', wert: 9 }
        ]},

        vertraege: [
            { typ: 'Wohngebaeudeversicherung', versicherer: 'ERGO', details: 'EFH 165 qm, inkl. Elementar', praemie: '\u20AC520/Jahr', beginn: '01.01.2001', status: 'Aktiv' },
            { typ: 'Wohngebaeudeversicherung', versicherer: 'ERGO', details: 'Vermietete ETW 75 qm', praemie: '\u20AC280/Jahr', beginn: '01.01.2008', status: 'Aktiv' },
            { typ: 'Hausratversicherung', versicherer: 'ERGO', details: '165 qm, Glasbruch', praemie: '\u20AC240/Jahr', beginn: '01.01.2001', status: 'Aktiv' },
            { typ: 'Kfz-Versicherung', versicherer: 'ERGO', details: 'Mercedes E-Klasse, VK, SF 25', praemie: '\u20AC580/Jahr', beginn: '01.01.2015', status: 'Aktiv' },
            { typ: 'Privathaftpflichtversicherung', versicherer: 'ERGO', details: 'Ehepaar', praemie: '\u20AC85/Jahr', beginn: '01.01.2001', status: 'Aktiv' },
            { typ: 'Haus- und Grundbesitzerhaftpflicht', versicherer: 'ERGO', details: 'Vermietete ETW', praemie: '\u20AC95/Jahr', beginn: '01.01.2008', status: 'Aktiv' }
        ],

        fidaVertraege: [
            { institut: 'Sparkasse Leverkusen', typ: 'Girokonto', info: 'Renten-Eingaenge', consent: '01.06.2025', gueltig: '01.06.2027' },
            { institut: 'Sparkasse Leverkusen', typ: 'Festgeld', info: '80.000\u20AC, 3%, 12 Monate', consent: '01.06.2025', gueltig: '01.06.2027' },
            { institut: 'Deka (Sparkasse)', typ: 'Depot', info: 'Mischfonds, konservativ, 145.000\u20AC', consent: null, gueltig: null },
            { institut: 'DKV', typ: 'PKV', info: 'Rentner-Tarif, steigend, 680\u20AC/mtl.', consent: null, gueltig: null }
        ],
        fremdProdukte: [
            { typ: 'girokonto', produkt: 'Girokonto', institut: 'Sparkasse Leverkusen', details: 'Renten-Eingaenge', volumenOderPraemie: 8000, consent: true },
            { typ: 'festgeld', produkt: 'Festgeld', institut: 'Sparkasse Leverkusen', details: '3%, 12 Monate', volumenOderPraemie: 80000, consent: true },
            { typ: 'depot', produkt: 'Mischfonds-Depot', institut: 'Deka (Sparkasse)', details: 'Konservativ', volumenOderPraemie: 145000, consent: false },
            { typ: 'pkv', produkt: 'PKV Rentner-Tarif', institut: 'DKV', details: 'Steigend, 680\u20AC/mtl.', volumenOderPraemie: 8160, consent: false }
        ],

        transaktionen: [
            { kategorie: 'gehalt', betrag: 2800, empfaenger: 'Gesetzliche Rente', auffaelligkeit: null },
            { kategorie: 'gehalt', betrag: 1500, empfaenger: 'BASF Betriebsrente', auffaelligkeit: null },
            { kategorie: 'miete_einnahme', betrag: 950, empfaenger: 'Miete vermietete ETW', auffaelligkeit: null },
            { kategorie: 'versicherung_eigen', betrag: -150, empfaenger: 'ERGO (6 Vertraege)', auffaelligkeit: null },
            { kategorie: 'versicherung_fremd', betrag: -680, empfaenger: 'DKV PKV', auffaelligkeit: 'fremdversicherer' },
            { kategorie: 'konsum', betrag: -1800, empfaenger: 'Lebenshaltung', auffaelligkeit: null },
            { kategorie: 'freizeit', betrag: -400, empfaenger: 'Reisen, Freizeit, Enkel', auffaelligkeit: null }
        ],
        haushaltsnetto: 5250,
        absicherungsquote: 15.8,
        sparquote: 0,
        freiVerfuegbar: 1720,

        potentiale: [
            { titel: 'Pflegezusatzversicherung (Ehepaar)', typ: 'whitespot', quellen: ['bestand', 'lebensereignis'], prioritaet: 'hoch', volumen: 1440, volumenTyp: 'jaehrlich', beschreibung: '62 + 60 Jahre. Pflegewahrscheinlichkeit steigt stark. Eigenanteil Pflegeheim ~2.500\u20AC/mtl. ERGO Pflege-Monatsgeld.', empfohleneAktion: 'angebot_erstellen', produktEmpfehlung: 'ERGO Pflege-Monatsgeld' },
            { titel: 'Sterbegeldversicherung', typ: 'whitespot', quellen: ['bestand'], prioritaet: 'mittel', volumen: 360, volumenTyp: 'jaehrlich', beschreibung: 'Bestattungskosten 8.000-12.000\u20AC. Entlastung fuer Angehoerige.', empfohleneAktion: 'angebot_erstellen', produktEmpfehlung: 'ERGO Sterbegeldversicherung' },
            { titel: 'Fondspolice/Auszahlplan statt Deka-Depot', typ: 'cross_sell', quellen: ['finanztransaktion'], prioritaet: 'mittel', volumen: 145000, volumenTyp: 'einmalig', beschreibung: 'Deka-Mischfonds hat hohe Kosten bei maessiger Performance. ERGO-Rentenpolice mit Steuervorteil fuer Auszahlplan.', empfohleneAktion: 'termin_vereinbaren', produktEmpfehlung: 'ERGO Sofortrente' },
            { titel: 'Wohngebaeudeversicherung Tarifupdate', typ: 'anpassung', quellen: ['bestand'], prioritaet: 'niedrig', volumen: -60, volumenTyp: 'jaehrlich', beschreibung: 'Tarif seit 2001. Neuere ERGO-Tarife haben bessere Elementar-Deckung bei gleichem Preis.', empfohleneAktion: 'tarifvergleich', produktEmpfehlung: 'ERGO Wohngebaeude Premium' },
            { titel: 'Enkelkind-Vorsorge (Ausbildungsversicherung)', typ: 'cross_sell', quellen: ['lebensereignis'], prioritaet: 'mittel', volumen: 600, volumenTyp: 'jaehrlich', beschreibung: '1 Enkel. Grosseltern-Ausbildungsversicherung als Geschenk positionieren.', empfohleneAktion: 'termin_vereinbaren', produktEmpfehlung: 'ERGO Ausbildungsversicherung' }
        ],

        kommunikation: [
            { typ: 'chatbot', datum: '2026-03-02T18:00:00', betreff: 'Self-Service Anfrage: Pflegezusatz', verlauf: [
                { rolle: 'kunde', text: 'Was kostet eine Pflegezusatzversicherung fuer meine Frau und mich?' },
                { rolle: 'bot', text: 'Fuer Sie (62) und Ihre Frau (60) liegt die Praemie bei ca. 60-90\u20AC/Mon. pro Person. Das Pflege-Monatsgeld zahlt bei Pflegebeduerftigkeit eine monatliche Rente.' },
                { rolle: 'kunde', text: 'Gibt es da eine Wartezeit?' },
                { rolle: 'bot', text: 'Ja, in der Regel 6-36 Monate je nach Leistungsart. Daher ist ein fruehzeitiger Abschluss wichtig. Soll ich einen Beratungstermin vereinbaren?' },
                { rolle: 'kunde', text: 'Ja, gerne fuer meine Frau und mich zusammen' }
            ], ergebnis: 'Terminwunsch Pflegezusatz Ehepaar', themen: ['pflege', 'zusatzversicherung', 'termin'], status: 'termin_geplant' },
            { typ: 'ki_kontakt', datum: '2026-02-22T10:00:00', betreff: 'Pflegezusatz-Empfehlung Ruhestaendler', inhalt: 'System hat erkannt: Ehepaar 62+60 ohne Pflegezusatzversicherung. Eigenanteil bei Pflegebeduerftigkeit ca. 2.500\u20AC/mtl. ERGO Pflege-Monatsgeld empfohlen.', status: 'geoeffnet', followUp: false, automatisch: true, ausloeser: 'regelbasiert' },
            { typ: 'email', datum: '2026-02-10T09:00:00', betreff: 'Ihr Versicherungsschutz im Ruhestand', inhalt: 'Zusammenstellung Ihrer 6 ERGO-Vertraege und Empfehlung fuer Pflegezusatz.', status: 'geoeffnet', geoeffnetAm: '2026-02-10T15:00:00', followUp: true, automatisch: true },
            { typ: 'telefon', datum: '2026-01-20T10:00:00', betreff: 'Dankesanruf 25 Jahre Kunde', inhalt: 'Kunde seit 2001, sehr zufrieden, bedankt sich fuer schnelle Schadensregulierung Wasserrohrbruch.', status: 'erledigt' }
        ],

        _modus: 'versicherung'
    };

    // ── V8: Sandra Yilmaz – Dual Income, Eigentum geplant ──
    window._versicherungsPersonas['Sandra Yilmaz'] = {
        geburtsdatum: '28.06.1988',
        adresse: 'Bayenthalguertel 30, 50968 Koeln-Bayenthal',
        telefon: '+49 221 5432167',
        email: 'sandra.yilmaz@bayer.com',
        beruf: 'Leitende Angestellte, Pharma-Konzern',
        familienstand: 'Verheiratet',
        nettoeinkommen: 4800,
        arbeitgeber: 'Bayer AG, Leverkusen',
        linkedinHint: true,
        linkedin: { kontakte: 600, aktivitaet: 'mittel', branchen: ['Pharma', 'Leadership', 'Life Sciences'], zusammenfassung: 'Leitende Angestellte Pharma, Leadership-Posts, 600+ Kontakte' },
        beschaeftigtSeit: '01.09.2017',
        tiere: 'keine',
        risikoscore: 20,
        risikoDetails: ['BU-Versicherung deckt nur 46% statt 80% des Nettos', 'Keine RLV trotz geplantem Eigentum'],
        bonitaetsscore: 88,
        schadenhistorie: [],
        kinder: [],
        nps: { score: 8, kategorie: 'passive', datum: '15.10.2025', kampagne: 'Herbst-Zufriedenheitsbefragung 2025 (E-Mail)', details: [
            { name: 'Beratungsqualitaet', wert: 8 },
            { name: 'Zufriedenheit mit dem Unternehmen', wert: 8 },
            { name: 'Weiterempfehlung an Freunde', wert: 9 },
            { name: 'Preis-Leistungs-Verhaeltnis', wert: 7 },
            { name: 'Erreichbarkeit & Service', wert: 8 }
        ]},

        vertraege: [
            { typ: 'Berufsunfaehigkeitsversicherung', versicherer: 'ERGO', details: 'BU-Rente 2.200\u20AC/mtl. \u2013 abgeschlossen bei Berufseinstieg, ZU NIEDRIG', praemie: '\u20AC160/Mon.', beginn: '01.10.2015', status: 'Aktiv' },
            { typ: 'Kfz-Versicherung', versicherer: 'ERGO', details: 'Audi A3, VK, SF 14', praemie: '\u20AC620/Jahr', beginn: '01.01.2019', status: 'Aktiv' },
            { typ: 'Privathaftpflichtversicherung', versicherer: 'ERGO', details: 'Ehepaar, 10 Mio. \u20AC', praemie: '\u20AC95/Jahr', beginn: '01.06.2020', status: 'Aktiv' }
        ],

        fidaVertraege: [
            { institut: 'ING', typ: 'Girokonto', info: 'Gehaltseingang Sandra 4.800\u20AC', consent: '15.08.2025', gueltig: '15.08.2027' },
            { institut: 'ING', typ: 'Tagesgeld', info: 'Eigenkapital-Ansparen, 95.000\u20AC', consent: '15.08.2025', gueltig: '15.08.2027' },
            { institut: 'ING', typ: 'Depot', info: 'MSCI World + EM, Sparplan 1.200\u20AC/mtl., 85.000\u20AC', consent: '15.08.2025', gueltig: '15.08.2027' },
            { institut: 'Signal Iduna', typ: 'PKV', info: 'Emre, Zahnarzt-Tarif, 750\u20AC/mtl.', consent: null, gueltig: null }
        ],
        fremdProdukte: [
            { typ: 'girokonto', produkt: 'Girokonto', institut: 'ING', details: 'Gehaltseingang Sandra 4.800\u20AC', volumenOderPraemie: 4500, consent: true },
            { typ: 'tagesgeld', produkt: 'Tagesgeld', institut: 'ING', details: 'Eigenkapital fuer Hauskauf', volumenOderPraemie: 95000, consent: true },
            { typ: 'depot', produkt: 'ETF-Depot', institut: 'ING', details: 'MSCI World + EM, Sparplan 1.200\u20AC/mtl.', volumenOderPraemie: 85000, consent: true },
            { typ: 'pkv', produkt: 'PKV Zahnarzt-Tarif', institut: 'Signal Iduna', details: 'Emre (Ehemann, Zahnarzt, eigene Praxis)', volumenOderPraemie: 9000, consent: false },
            { typ: 'berufshaftpflicht', produkt: 'Berufshaftpflicht Zahnarzt', institut: 'HDI', details: 'Praxis-Haftpflicht Emre', volumenOderPraemie: 1800, consent: false }
        ],

        transaktionen: [
            { kategorie: 'gehalt', betrag: 4800, empfaenger: 'Bayer AG', auffaelligkeit: null },
            { kategorie: 'gehalt_partner', betrag: 6000, empfaenger: 'Emre (Zahnarzt, eigene Praxis)', auffaelligkeit: null },
            { kategorie: 'miete', betrag: -1350, empfaenger: 'Vermieter', auffaelligkeit: null },
            { kategorie: 'sparplan', betrag: -1200, empfaenger: 'ING Depot ETF-Sparplan', auffaelligkeit: 'geht_an_fremdbank' },
            { kategorie: 'sparen', betrag: -800, empfaenger: 'ING Tagesgeld (EK Hauskauf)', auffaelligkeit: 'geht_an_fremdbank' },
            { kategorie: 'versicherung_eigen', betrag: -220, empfaenger: 'ERGO (BU+KFZ+Haftpflicht)', auffaelligkeit: null },
            { kategorie: 'versicherung_fremd', betrag: -750, empfaenger: 'Signal Iduna PKV Emre', auffaelligkeit: 'fremdversicherer' },
            { kategorie: 'konsum', betrag: -2500, empfaenger: 'Lebenshaltung', auffaelligkeit: null }
        ],
        haushaltsnetto: 10800,
        absicherungsquote: 2.0,
        sparquote: 18.5,
        freiVerfuegbar: 2800,

        potentiale: [
            { titel: 'BU-Nachversicherung 2.200 auf 3.200\u20AC/mtl.', typ: 'anpassung', quellen: ['bestand', 'lebensereignis'], prioritaet: 'hoch', volumen: 1080, volumenTyp: 'jaehrlich', beschreibung: 'Einkommen von 55k auf 95k gestiegen. BU deckt nur 46% statt 80% des Nettos.', empfohleneAktion: 'angebot_erstellen', produktEmpfehlung: 'ERGO BU Comfort Plus' },
            { titel: 'Risikolebensversicherung (Baufi-Vorbereitung)', typ: 'whitespot', quellen: ['lebensereignis'], prioritaet: 'hoch', volumen: 480, volumenTyp: 'jaehrlich', beschreibung: 'Eigenheim 2027 geplant. RLV jetzt abschliessen (38 J. = noch guenstig). 400k Deckung.', empfohleneAktion: 'angebot_erstellen', produktEmpfehlung: 'ERGO Risikolebensversicherung' },
            { titel: 'Wohngebaeudeversicherung (vormerken)', typ: 'cross_sell', quellen: ['lebensereignis'], prioritaet: 'hoch', volumen: 0, volumenTyp: 'vermittlung', beschreibung: 'Vorbereitung: bei Kaufvertrag sofort WGV-Angebot bereithalten.', empfohleneAktion: 'termin_vereinbaren', produktEmpfehlung: 'ERGO Wohngebaeudeversicherung (Vormerkung)' },
            { titel: 'Fondspolice statt ING-Depot', typ: 'cross_sell', quellen: ['finanztransaktion'], prioritaet: 'mittel', volumen: 85000, volumenTyp: 'einmalig', beschreibung: '1.200\u20AC/mtl. gehen an ING. ERGO-Fondspolice mit gleichen ETFs, Steuervorteil Halbeinkuenfte.', empfohleneAktion: 'termin_vereinbaren', produktEmpfehlung: 'ERGO Fondsgebundene Rentenversicherung' },
            { titel: 'Kinderwunsch-Vorsorge (vormerken)', typ: 'cross_sell', quellen: ['lebensereignis'], prioritaet: 'mittel', volumen: 0, volumenTyp: 'vermittlung', beschreibung: 'Kinderwunsch bekannt. Bei Geburt: Kinderunfall, ggf. BU-Nachversicherungsoption nutzen.', empfohleneAktion: 'termin_vereinbaren', produktEmpfehlung: 'Vormerkung bei Geburt' },
            { titel: 'PKV-Beratung Emre (Zahnarzt)', typ: 'cross_sell', quellen: ['wettbewerb'], prioritaet: 'mittel', volumen: 9000, volumenTyp: 'jaehrlich', beschreibung: 'Signal-Iduna-Tarif pruefen. ERGO-PKV fuer Aerzte ggf. besser. Wechsel nur sinnvoll wenn Leistung mindestens gleich.', empfohleneAktion: 'tarifvergleich', produktEmpfehlung: 'ERGO PKV Aerzte-Tarif' }
        ],

        kommunikation: [
            { typ: 'chatbot', datum: '2026-03-06T21:00:00', betreff: 'Self-Service Anfrage: Eigenheim-Absicherung', verlauf: [
                { rolle: 'kunde', text: 'Wir planen ein Eigenheim zu kaufen. Welche Versicherungen brauchen wir?' },
                { rolle: 'bot', text: 'Fuer Ihren Eigentumskauf empfehle ich: Wohngebaeudeversicherung (Pflicht bei Baufi), Risikolebensversicherung, und eine Anpassung Ihrer BU-Versicherung.' },
                { rolle: 'kunde', text: 'Meine BU ist zu niedrig?' },
                { rolle: 'bot', text: 'Ja, Ihre BU deckt aktuell 2.200\u20AC/mtl. bei einem Nettoeinkommen von 4.800\u20AC. Empfohlen sind mindestens 3.200\u20AC/mtl. Soll ich einen umfassenden Beratungstermin vereinbaren?' },
                { rolle: 'kunde', text: 'Ja, fuer meinen Mann Emre auch bitte mit' }
            ], ergebnis: 'Terminwunsch Eigenheim-Absicherung + BU-Erhoehung', themen: ['eigenheim', 'bu', 'rlv', 'ehemann', 'termin'], status: 'termin_geplant' },
            { typ: 'ki_kontakt', datum: '2026-02-18T10:00:00', betreff: 'BU-Unterdeckung + Eigenheim-Planung', inhalt: 'System hat erkannt: BU 2.200\u20AC bei 4.800\u20AC Netto = nur 46%. Eigenheim geplant, aber keine RLV vorhanden.', status: 'geoeffnet', followUp: false, automatisch: true, ausloeser: 'regelbasiert' },
            { typ: 'email', datum: '2026-02-05T09:00:00', betreff: 'Eigentumsplanung: Ihre Versicherungs-Checkliste', inhalt: 'Wir haben ein Informationspaket fuer Ihren geplanten Eigentumskauf zusammengestellt.', status: 'geoeffnet', geoeffnetAm: '2026-02-05T20:00:00', followUp: true, automatisch: true }
        ],

        _modus: 'versicherung'
    };

})();
