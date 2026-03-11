// ═══════════════════════════════════════════════════════
// OPT-26: Versicherungs-Personas V1-V4
// 5 Datenschichten: Stamm, Eigen, Fremd, Transaktionen, Potentiale
// ═══════════════════════════════════════════════════════

(function() {
    'use strict';

    if (!window._versicherungsPersonas) window._versicherungsPersonas = {};

    // ── V1: Peter Schmidt – Familie mit Absicherungsluecken ──
    window._versicherungsPersonas['Peter Schmidt'] = {
        geburtsdatum: '15.03.1984',
        adresse: 'Am Rodenkirchener Ufer 12, 50996 Koeln',
        telefon: '+49 221 456789',
        email: 'peter.schmidt@email.de',
        beruf: 'IT-Projektleiter',
        familienstand: 'Verheiratet',
        nettoeinkommen: 4200,
        arbeitgeber: 'Capgemini Deutschland GmbH',
        linkedinHint: true,
        linkedin: { kontakte: 500, aktivitaet: 'mittel', branchen: ['IT', 'Digitalisierung', 'Projektmanagement'], zusammenfassung: 'IT-Projektleiter, postet ueber Projektmanagement und Digitalisierung' },
        beschaeftigtSeit: '01.04.2016',
        tiere: 'unbekannt',
        risikoscore: 28,
        risikoDetails: ['Baufinanzierung Zinsbindung endet 09/2027 (Open Finance)', 'Hausratversicherung falsche Wohnflaeche hinterlegt'],
        bonitaetsscore: 82,
        schadenhistorie: [
            { datum: '15.11.2024', sparte: 'KFZ-Haftpflicht', beschreibung: 'Parkrempler Supermarkt-Parkplatz', status: 'Reguliert', betrag: '\u20AC890', versicherer: 'ERGO' }
        ],
        kinder: [{ name: 'Lina', alter: 7 }, { name: 'Max', alter: 1 }],
        nps: { score: 8, kategorie: 'passive', datum: '15.10.2025', kampagne: 'Herbst-Zufriedenheitsbefragung 2025 (E-Mail)', details: [
            { name: 'Beratungsqualitaet', wert: 8 },
            { name: 'Zufriedenheit mit dem Unternehmen', wert: 8 },
            { name: 'Weiterempfehlung an Freunde', wert: 9 },
            { name: 'Preis-Leistungs-Verhaeltnis', wert: 7 },
            { name: 'Erreichbarkeit & Service', wert: 8 }
        ]},

        // ── Schicht 2: Eigene Produkte (bei ERGO) ──
        vertraege: [
            { typ: 'Berufsunfaehigkeitsversicherung', versicherer: 'ERGO', details: 'BU-Rente: \u20AC1.800/Mon., Endalter 67 \u2013 ZU NIEDRIG fuer aktuelles Einkommen', praemie: '\u20AC180/Mon.', beginn: '01.03.2018', status: 'Aktiv' },
            { typ: 'Kfz-Versicherung', versicherer: 'ERGO', details: 'VW Tiguan, VK mit 500\u20AC SB, SF-Klasse 12', praemie: '\u20AC680/Jahr', beginn: '01.01.2021', status: 'Aktiv' },
            { typ: 'Hausratversicherung', versicherer: 'ERGO', details: 'Basis-Tarif, 65 qm \u2013 FALSCH! Lebt in 145 qm EFH. Keine Elementar.', praemie: '\u20AC180/Jahr', beginn: '01.06.2016', status: 'Aktiv' },
            { typ: 'Privathaftpflichtversicherung', versicherer: 'ERGO', details: 'Familie, 10 Mio. \u20AC Deckung', praemie: '\u20AC95/Jahr', beginn: '01.01.2017', status: 'Aktiv' }
        ],

        // ── Schicht 3: Fremdprodukte (Open Finance / FIDA) ──
        fidaVertraege: [
            { institut: 'Sparkasse Koeln', typ: 'Girokonto', info: 'Hauptkonto, Gehaltseingang 4.200\u20AC', consent: '15.03.2025', gueltig: '15.03.2027' },
            { institut: 'Sparkasse Koeln', typ: 'Baufinanzierung', info: '285k Restschuld, 1,8% Zins, Zinsbindung bis 09/2027', consent: '15.03.2025', gueltig: '15.03.2027' },
            { institut: 'KfW', typ: 'Studienkredit', info: 'Restschuld 12.000\u20AC, Rate 120\u20AC/mtl.', consent: '15.03.2025', gueltig: '15.03.2027' },
            { institut: 'ING DiBa', typ: 'Depot', info: 'ETF-Depot MSCI World 70% + EM 30%, Sparplan 300\u20AC/mtl., 42.000\u20AC', consent: '15.03.2025', gueltig: '15.03.2027' },
            { institut: 'DKB', typ: 'Tagesgeld', info: '8.500\u20AC, 1,5% Zins', consent: null, gueltig: null },
            { institut: 'Allianz', typ: 'Risikolebensversicherung', info: '150.000\u20AC Deckung, Laufzeit bis 2035, 540\u20AC/J.', consent: '15.03.2025', gueltig: '15.03.2027' }
        ],
        fremdProdukte: [
            { typ: 'girokonto', produkt: 'Sparkasse Girokonto', institut: 'Sparkasse Koeln', details: 'Hauptkonto, Gehaltseingang Peter 4.200\u20AC', volumenOderPraemie: 3500, consent: true },
            { typ: 'baufinanzierung', produkt: 'Baufinanzierung', institut: 'Sparkasse Koeln', details: '285k Restschuld, 1,8% Zins fest, Zinsbindung bis 09/2027', volumenOderPraemie: 285000, consent: true },
            { typ: 'studienkredit', produkt: 'KfW-Studienkredit', institut: 'KfW', details: 'Restschuld 12.000\u20AC, Rate 120\u20AC/mtl.', volumenOderPraemie: 12000, consent: true },
            { typ: 'depot', produkt: 'ETF-Depot', institut: 'ING DiBa', details: 'MSCI World (70%) + EM (30%), Sparplan 300\u20AC/mtl.', volumenOderPraemie: 42000, consent: true },
            { typ: 'tagesgeld', produkt: 'Tagesgeld', institut: 'DKB', details: '1,5% Zins', volumenOderPraemie: 8500, consent: false },
            { typ: 'rlv', produkt: 'Risikolebensversicherung', institut: 'Allianz', details: '150.000\u20AC Deckung, Laufzeit bis 2035', volumenOderPraemie: 540, consent: true }
        ],

        // ── Schicht 4: Transaktionsmuster (monatlich) ──
        transaktionen: [
            { kategorie: 'gehalt', betrag: 4200, empfaenger: 'Arbeitgeber', auffaelligkeit: null },
            { kategorie: 'gehalt_partner', betrag: 1800, empfaenger: 'Land NRW (Sarah, Lehrerin Teilzeit)', auffaelligkeit: null },
            { kategorie: 'kindergeld', betrag: 500, empfaenger: 'Familienkasse', auffaelligkeit: null },
            { kategorie: 'baufi', betrag: -1050, empfaenger: 'Sparkasse Koeln', auffaelligkeit: 'zinsbindung_endet_09_2027' },
            { kategorie: 'studienkredit', betrag: -120, empfaenger: 'KfW', auffaelligkeit: null },
            { kategorie: 'versicherung_eigen', betrag: -260, empfaenger: 'ERGO (BU+KFZ+Hausrat+Haftpflicht)', auffaelligkeit: null },
            { kategorie: 'versicherung_fremd', betrag: -45, empfaenger: 'Allianz RLV', auffaelligkeit: 'fremdversicherer' },
            { kategorie: 'sparplan', betrag: -300, empfaenger: 'ING DiBa ETF-Sparplan', auffaelligkeit: 'geht_an_fremdbank' },
            { kategorie: 'kinder', betrag: -380, empfaenger: 'Stadt Koeln (Kita)', auffaelligkeit: null },
            { kategorie: 'konsum', betrag: -850, empfaenger: 'REWE, dm, Aldi', auffaelligkeit: null },
            { kategorie: 'konsum', betrag: -350, empfaenger: 'Bekleidung', auffaelligkeit: null },
            { kategorie: 'abos', betrag: -65, empfaenger: 'Netflix, Spotify, DAZN', auffaelligkeit: null },
            { kategorie: 'mobilitaet', betrag: -180, empfaenger: 'Shell, ADAC', auffaelligkeit: null },
            { kategorie: 'sparen', betrag: -200, empfaenger: 'Sparkonto Reisen-Ruecklage', auffaelligkeit: null }
        ],
        haushaltsnetto: 6500,
        absicherungsquote: 4.7,
        sparquote: 7.7,
        freiVerfuegbar: 700,

        // ── Schicht 5: Vertriebspotentiale ──
        potentiale: [
            { titel: 'BU-Nachversicherung 1.800 auf 2.600\u20AC/mtl.', typ: 'anpassung', quellen: ['bestand', 'lebensereignis'], prioritaet: 'hoch', volumen: 960, volumenTyp: 'jaehrlich', beschreibung: 'Zweites Kind geboren, Einkommen gestiegen seit Abschluss 2018. BU deckt nur 69% statt empfohlene 80% des Nettos.', empfohleneAktion: 'angebot_erstellen', produktEmpfehlung: 'ERGO BU Comfort Plus' },
            { titel: 'Hausrat-Upgrade 65 auf 145 qm + Elementar', typ: 'anpassung', quellen: ['bestand'], prioritaet: 'hoch', volumen: 120, volumenTyp: 'jaehrlich', beschreibung: 'Wohnflaeche falsch seit Umzug 2021 ins EFH. Keine Elementarschadendeckung trotz Eigenheim. Leistungsfall waere unterversichert.', empfohleneAktion: 'angebot_erstellen', produktEmpfehlung: 'ERGO Hausrat Premium inkl. Elementar' },
            { titel: 'Fondsgebundene Rentenversicherung statt ETF-Depot', typ: 'whitespot', quellen: ['finanztransaktion', 'bestand'], prioritaet: 'mittel', volumen: 42000, volumenTyp: 'einmalig', beschreibung: 'ING-Depot hat keinen Steuervorteil. ERGO-Fondspolice mit gleichen ETFs aber Halbeinkuenfteverfahren im Alter. 300\u20AC/mtl. gehen aktuell an Fremdbank.', empfohleneAktion: 'termin_vereinbaren', produktEmpfehlung: 'ERGO Fondsgebundene Rentenversicherung' },
            { titel: 'RLV-Erhoehung 150k auf 300k\u20AC', typ: 'anpassung', quellen: ['wettbewerb', 'lebensereignis'], prioritaet: 'hoch', volumen: 240, volumenTyp: 'jaehrlich', beschreibung: 'Allianz-RLV deckt nicht einmal die Baufi-Restschuld (285k). Familie mit 2 kleinen Kindern braucht hoehere Absicherung. ERGO-RLV guenstiger als Allianz-Bestand.', empfohleneAktion: 'tarifvergleich', produktEmpfehlung: 'ERGO Risikolebensversicherung' },
            { titel: 'Unfallversicherung Familie', typ: 'whitespot', quellen: ['bestand'], prioritaet: 'mittel', volumen: 250, volumenTyp: 'jaehrlich', beschreibung: 'Keine Unfallversicherung vorhanden. 2 Kinder im unfalltraechtigen Alter (1 und 7).', empfohleneAktion: 'angebot_erstellen', produktEmpfehlung: 'ERGO Unfall Smart Familie' },
            { titel: 'Rechtsschutzversicherung', typ: 'whitespot', quellen: ['bestand'], prioritaet: 'niedrig', volumen: 280, volumenTyp: 'jaehrlich', beschreibung: 'Kein Rechtsschutz vorhanden. Als Angestellter + Eigentuemer sinnvoll (Arbeitsrecht + Grundstueck).', empfohleneAktion: 'angebot_erstellen', produktEmpfehlung: 'ERGO Rechtsschutz Premium' },
            { titel: 'Pflegezusatz fuer Eltern empfehlen', typ: 'cross_sell', quellen: ['kommunikation'], prioritaet: 'mittel', volumen: 480, volumenTyp: 'jaehrlich', beschreibung: 'Chatbot-Anfrage zum Thema Pflege letzten Monat. Peters Eltern sind 68 und 71.', empfohleneAktion: 'termin_vereinbaren', produktEmpfehlung: 'ERGO Pflege-Monatsgeld' },
            { titel: 'Baufi-Anschlussfinanzierung 2027 vorbereiten', typ: 'cross_sell', quellen: ['finanztransaktion'], prioritaet: 'hoch', volumen: 0, volumenTyp: 'vermittlung', beschreibung: 'Zinsbindung Sparkasse endet 09/2027. Jetzt Forward-Darlehen pruefen. Gleichzeitig Restschuldversicherung (RLV-Erhoehung).', empfohleneAktion: 'termin_vereinbaren', produktEmpfehlung: 'Verweis an Kooperationspartner' }
        ],

        // ── Kommunikation ──
        kommunikation: [
            { typ: 'chatbot', datum: '2026-03-03T22:15:00', betreff: 'Self-Service Anfrage: Pflege fuer Eltern', verlauf: [
                { rolle: 'kunde', text: 'Mein Vater ist 71 und meine Mutter 68. Sollten die eine Pflegeversicherung haben?' },
                { rolle: 'bot', text: 'Eine private Pflegezusatzversicherung ist in dem Alter sehr sinnvoll. Die gesetzliche Pflegeversicherung deckt nur einen Teil der Kosten. Eigenanteil im Pflegeheim: ca. 2.500\u20AC/Mon.' },
                { rolle: 'kunde', text: 'Was kostet das fuer beide?' },
                { rolle: 'bot', text: 'Fuer Ihre Eltern ca. 120-180\u20AC/Mon. je nach Leistungsumfang. Soll ich einen Beratungstermin vereinbaren?' },
                { rolle: 'kunde', text: 'Ja bitte' }
            ], ergebnis: 'Terminwunsch Pflegezusatz Eltern', themen: ['pflege', 'eltern', 'termin'], status: 'termin_geplant' },
            { typ: 'email', datum: '2026-02-28T09:15:00', betreff: 'Ihre Hausratversicherung: Wohnflaeche pruefen', inhalt: 'Sehr geehrter Herr Schmidt, wir haben festgestellt, dass Ihre Hausratversicherung noch auf 65 qm eingestellt ist. Seit Ihrem Umzug ins EFH 2021 benoetigen Sie eine Anpassung auf 145 qm.', status: 'geoeffnet', geoeffnetAm: '2026-02-28T14:32:00', followUp: true, automatisch: true },
            { typ: 'ki_kontakt', datum: '2026-02-25T10:00:00', betreff: 'BU-Unterdeckungs-Warnung', inhalt: 'System hat erkannt: BU-Absicherung 1.800\u20AC/mtl. liegt unter empfohlenem Wert (2.600\u20AC) bei Haushaltsnetto 6.500\u20AC. Nachversicherungsoption pruefen.', status: 'geoeffnet', followUp: false, automatisch: true, ausloeser: 'regelbasiert' },
            { typ: 'portal', datum: '2026-02-20T16:45:00', betreff: 'Vertragsdokument heruntergeladen', inhalt: 'Kunde hat BU-Vertragsbedingungen im Self-Service-Portal heruntergeladen.', status: 'erledigt', dokument: 'BU-Vertrag V-2018-001 Bedingungen.pdf' },
            { typ: 'brief', datum: '2026-02-15T08:00:00', betreff: 'Open Finance Datenfreigabe: Neue Potentiale erkannt', inhalt: 'Basierend auf Ihren freigegebenen Finanzdaten haben wir Optimierungsmoeglichkeiten fuer Ihre Versicherungssituation identifiziert.', status: 'versendet', followUp: false, automatisch: true },
            { typ: 'telefon', datum: '2026-02-08T11:20:00', betreff: 'Rueckruf wegen Baufinanzierung 2027', inhalt: 'Kunde fragt nach Anschlussfinanzierung. Zinsbindung Sparkasse endet 09/2027. Verweis an Kooperationspartner empfohlen.', status: 'erledigt' }
        ],

        _modus: 'versicherung'
    };

    // ── V2: Amira Koenig – Junge Berufstaetige, kaum versichert ──
    window._versicherungsPersonas['Amira K\u00f6nig'] = {
        geburtsdatum: '22.05.1998',
        adresse: 'Venloer Str. 88, 50823 Koeln-Ehrenfeld',
        telefon: '+49 221 7654321',
        email: 'amira.koenig@email.de',
        beruf: 'UX-Designerin',
        familienstand: 'Ledig',
        nettoeinkommen: 2800,
        arbeitgeber: 'Digital-Agentur Koeln',
        linkedinHint: true,
        linkedin: { kontakte: 800, aktivitaet: 'hoch', branchen: ['Design', 'UX', 'Kreativwirtschaft'], zusammenfassung: 'UX-Designerin, postet Portfolio-Projekte, Speaker bei Meetups' },
        beschaeftigtSeit: '01.09.2022',
        tiere: 'keine',
        risikoscore: 42,
        risikoDetails: ['Keine BU-Versicherung vorhanden', 'Keine Haftpflichtversicherung', 'Sehr niedrige Absicherungsquote 1,3%'],
        bonitaetsscore: 75,
        schadenhistorie: [],
        kinder: [],
        nps: { score: 7, kategorie: 'passive', datum: '08.10.2025', kampagne: 'Herbst-Zufriedenheitsbefragung 2025 (E-Mail)', details: [
            { name: 'Beratungsqualitaet', wert: 7 },
            { name: 'Zufriedenheit mit dem Unternehmen', wert: 6 },
            { name: 'Weiterempfehlung an Freunde', wert: 7 },
            { name: 'Preis-Leistungs-Verhaeltnis', wert: 7 },
            { name: 'Erreichbarkeit & Service', wert: 8 }
        ]},

        vertraege: [
            { typ: 'Kfz-Versicherung', versicherer: 'ERGO', details: 'VW Polo, Teilkasko, SF-Klasse 4', praemie: '\u20AC420/Jahr', beginn: '01.03.2023', status: 'Aktiv' }
        ],

        fidaVertraege: [
            { institut: 'N26', typ: 'Girokonto', info: 'Hauptkonto, Gehaltseingang 2.800\u20AC, Apple Pay', consent: '10.06.2025', gueltig: '10.06.2027' },
            { institut: 'Trade Republic', typ: 'Depot', info: '70% MSCI World, 30% Nasdaq-100, 8.500\u20AC', consent: '10.06.2025', gueltig: '10.06.2027' },
            { institut: 'Commerzbank', typ: 'Tagesgeld', info: 'Altes Konto von den Eltern, 3.200\u20AC', consent: null, gueltig: null }
        ],
        fremdProdukte: [
            { typ: 'girokonto', produkt: 'N26 Girokonto', institut: 'N26', details: 'Hauptkonto, Gehaltseingang 2.800\u20AC, Apple Pay', volumenOderPraemie: 1200, consent: true },
            { typ: 'depot', produkt: 'ETF-Depot', institut: 'Trade Republic', details: '70% MSCI World, 30% Nasdaq-100, Sparplan 150\u20AC/mtl.', volumenOderPraemie: 8500, consent: true },
            { typ: 'tagesgeld', produkt: 'Tagesgeld', institut: 'Commerzbank', details: 'Altes Konto von den Eltern', volumenOderPraemie: 3200, consent: false }
        ],

        transaktionen: [
            { kategorie: 'gehalt', betrag: 2800, empfaenger: 'Agentur XY', auffaelligkeit: null },
            { kategorie: 'miete', betrag: -850, empfaenger: 'Vermieter', auffaelligkeit: null },
            { kategorie: 'nebenkosten', betrag: -180, empfaenger: 'Stadtwerke, GEZ', auffaelligkeit: null },
            { kategorie: 'versicherung_eigen', betrag: -35, empfaenger: 'ERGO KFZ', auffaelligkeit: null },
            { kategorie: 'sparplan', betrag: -150, empfaenger: 'Trade Republic', auffaelligkeit: 'geht_an_fremdbank' },
            { kategorie: 'konsum', betrag: -350, empfaenger: 'REWE, Bio Company', auffaelligkeit: null },
            { kategorie: 'reisen', betrag: -320, empfaenger: 'Booking, FlixBus, Ryanair', auffaelligkeit: null },
            { kategorie: 'freizeit', betrag: -280, empfaenger: 'Restaurants, Bars', auffaelligkeit: 'hoch_fuer_alter' },
            { kategorie: 'konsum', betrag: -200, empfaenger: 'Zalando, COS', auffaelligkeit: null },
            { kategorie: 'abos', betrag: -45, empfaenger: 'Spotify, Netflix, Adobe CC', auffaelligkeit: null },
            { kategorie: 'sport', betrag: -50, empfaenger: 'Urban Sports Club', auffaelligkeit: null }
        ],
        haushaltsnetto: 2800,
        absicherungsquote: 1.3,
        sparquote: 5.4,
        freiVerfuegbar: 340,

        potentiale: [
            { titel: 'Berufsunfaehigkeitsversicherung', typ: 'whitespot', quellen: ['bestand'], prioritaet: 'kritisch', volumen: 1440, volumenTyp: 'jaehrlich', beschreibung: '28 Jahre, Bueroberuf = guenstige Konditionen. Jetzt abschliessen bevor Vorerkrankungen. BU 1.500\u20AC/mtl. Rente.', empfohleneAktion: 'angebot_erstellen', produktEmpfehlung: 'ERGO BU Comfort' },
            { titel: 'Privathaftpflichtversicherung', typ: 'whitespot', quellen: ['bestand'], prioritaet: 'hoch', volumen: 65, volumenTyp: 'jaehrlich', beschreibung: 'Existenzbedrohende Luecke. Kein Schutz bei verursachten Schaeden.', empfohleneAktion: 'angebot_erstellen', produktEmpfehlung: 'ERGO Privat Premium' },
            { titel: 'Hausratversicherung', typ: 'whitespot', quellen: ['bestand'], prioritaet: 'mittel', volumen: 120, volumenTyp: 'jaehrlich', beschreibung: '72 qm, MacBook + Kameraausruestung (Designerin) = hoher Hausrat-Wert.', empfohleneAktion: 'angebot_erstellen', produktEmpfehlung: 'ERGO Hausrat Smart' },
            { titel: 'Rechtsschutzversicherung', typ: 'whitespot', quellen: ['bestand'], prioritaet: 'niedrig', volumen: 220, volumenTyp: 'jaehrlich', beschreibung: 'Angestellte in Agentur \u2013 Arbeitsrecht-RS sinnvoll. Mieterin \u2013 Mietrecht-RS.', empfohleneAktion: 'angebot_erstellen', produktEmpfehlung: 'ERGO Rechtsschutz Smart' },
            { titel: 'Fondsgebundene Altersvorsorge statt Trade Republic', typ: 'cross_sell', quellen: ['finanztransaktion'], prioritaet: 'mittel', volumen: 8500, volumenTyp: 'einmalig', beschreibung: 'Trade Republic hat keinen Steuervorteil. ERGO-Fondspolice mit gleichen ETFs aber Halbeinkuenfteverfahren. 150\u20AC/mtl. gehen aktuell an Fremdbank.', empfohleneAktion: 'termin_vereinbaren', produktEmpfehlung: 'ERGO Fondsgebundene Rentenversicherung' },
            { titel: 'Zahnzusatzversicherung', typ: 'whitespot', quellen: ['lebensereignis'], prioritaet: 'niedrig', volumen: 180, volumenTyp: 'jaehrlich', beschreibung: 'Noch jung = guenstige Praemie. Wartezeit 8 Monate beachten.', empfohleneAktion: 'angebot_erstellen', produktEmpfehlung: 'ERGO Zahnzusatz' }
        ],

        kommunikation: [
            { typ: 'chatbot', datum: '2026-03-05T19:30:00', betreff: 'Self-Service Anfrage: Brauche ich eine BU?', verlauf: [
                { rolle: 'kunde', text: 'Brauche ich als Designerin wirklich eine BU-Versicherung?' },
                { rolle: 'bot', text: 'Ja, unbedingt! Auch als Bueroberuf sind psychische Erkrankungen der haeufigste BU-Grund. Mit 28 bekommen Sie noch sehr guenstige Konditionen.' },
                { rolle: 'kunde', text: 'Was wuerde das kosten?' },
                { rolle: 'bot', text: 'Fuer eine BU-Rente von 1.500\u20AC/Mon. ab ca. 65\u20AC/Mon. Soll ich einen Beratungstermin vereinbaren?' },
                { rolle: 'kunde', text: 'Ich ueberleg mir das noch' }
            ], ergebnis: 'Information BU-Kosten', themen: ['bu', 'kosten', 'designerin'], status: 'erledigt' },
            { typ: 'ki_kontakt', datum: '2026-02-20T10:00:00', betreff: 'Fehlende Grundabsicherung', inhalt: 'System hat erkannt: Kundin hat NUR KFZ-Versicherung. Keine BU, keine Haftpflicht, kein Hausrat. Dringende Kontaktempfehlung.', status: 'geoeffnet', followUp: false, automatisch: true, ausloeser: 'regelbasiert' },
            { typ: 'email', datum: '2026-02-10T09:00:00', betreff: 'Haftpflichtversicherung: Existenzschutz ab 5\u20AC/Mon.', inhalt: 'Kennen Sie Ihr Risiko? Ohne Haftpflicht haften Sie mit Ihrem gesamten Vermoegen.', status: 'geoeffnet', geoeffnetAm: '2026-02-10T20:00:00', followUp: true, automatisch: true },
            { typ: 'email', datum: '2026-01-15T08:00:00', betreff: 'Willkommen bei Open Finance', inhalt: 'Vielen Dank fuer Ihre Open Finance Datenfreigabe. Wir haben interessante Optimierungsmoeglichkeiten fuer Sie.', status: 'geoeffnet', geoeffnetAm: '2026-01-15T19:45:00', followUp: true, automatisch: true }
        ],

        _modus: 'versicherung'
    };

    // ── V3: Thomas Weber – Bestandskunde mit Abwanderungsrisiko ──
    window._versicherungsPersonas['Thomas Weber'] = {
        geburtsdatum: '12.08.1971',
        adresse: 'Gartenstr. 15, 51429 Bergisch Gladbach',
        telefon: '+49 2204 987654',
        email: 'thomas.weber@weber-elektro.de',
        beruf: 'Selbstaendiger Handwerksmeister (Elektro)',
        familienstand: 'Geschieden',
        nettoeinkommen: 5500,
        arbeitgeber: 'Weber Elektrotechnik (eigener Betrieb)',
        linkedinHint: false,
        linkedin: { kontakte: 0, aktivitaet: 'nicht_vorhanden', branchen: [], zusammenfassung: 'Nicht auf LinkedIn aktiv, Handwerkskammer-Mitglied, lokales Netzwerk' },
        beschaeftigtSeit: '01.01.2002',
        tiere: 'keine',
        risikoscore: 35,
        risikoDetails: ['NPS 5 \u2013 Detractor, Abwanderungsrisiko HOCH', 'Kein Kontakt seit 14 Monaten', 'Inhaltsversicherung Summe ggf. zu niedrig'],
        bonitaetsscore: 78,
        schadenhistorie: [
            { datum: '10.03.2023', sparte: 'Betriebshaftpflicht', beschreibung: 'Wasserschaden bei Kundenauftrag, Kurzschluss', status: 'Reguliert', betrag: '\u20AC3.800', versicherer: 'ERGO' }
        ],
        kinder: [{ name: 'Tobias', alter: 24 }],
        nps: { score: 5, kategorie: 'detractor', datum: '22.09.2025', kampagne: 'Jahres-Kundenbefragung Q3/2025 (Brief)', details: [
            { name: 'Beratungsqualitaet', wert: 5 },
            { name: 'Zufriedenheit mit dem Unternehmen', wert: 4 },
            { name: 'Weiterempfehlung an Freunde', wert: 5 },
            { name: 'Preis-Leistungs-Verhaeltnis', wert: 6 },
            { name: 'Erreichbarkeit & Service', wert: 5 }
        ]},

        vertraege: [
            { typ: 'Berufsunfaehigkeitsversicherung', versicherer: 'ERGO', details: 'BU Protect, 2.500\u20AC/mtl. Rente \u2013 Tarif veraltet', praemie: '\u20AC220/Mon.', beginn: '01.01.2012', status: 'Aktiv' },
            { typ: 'Kfz-Versicherung', versicherer: 'ERGO', details: 'Mercedes Vito (Firmenfahrzeug), VK 300\u20AC SB', praemie: '\u20AC920/Jahr', beginn: '01.01.2019', status: 'Aktiv' },
            { typ: 'Gewerbe-Haftpflichtversicherung', versicherer: 'ERGO', details: '5 Mio. \u20AC Deckung, Elektro-Handwerk', praemie: '\u20AC480/Jahr', beginn: '01.01.2008', status: 'Aktiv' },
            { typ: 'Inhaltsversicherung', versicherer: 'ERGO', details: 'Werkstatt + Lager, 150k\u20AC Summe \u2013 ggf. zu niedrig (neue Maschinen)', praemie: '\u20AC360/Jahr', beginn: '01.01.2010', status: 'Aktiv' },
            { typ: 'Betriebsunterbrechungsversicherung', versicherer: 'ERGO', details: '6 Monate, 45k\u20AC', praemie: '\u20AC240/Jahr', beginn: '01.01.2010', status: 'Aktiv' },
            { typ: 'Wohngebaeudeversicherung', versicherer: 'ERGO', details: 'ETW 95 qm, inkl. Elementar \u2013 Tarif alt', praemie: '\u20AC320/Jahr', beginn: '01.01.2005', status: 'Aktiv' },
            { typ: 'Hausratversicherung', versicherer: 'ERGO', details: '95 qm, ohne Fahrraddiebstahl', praemie: '\u20AC180/Jahr', beginn: '01.01.2005', status: 'Aktiv' }
        ],

        fidaVertraege: [
            { institut: 'Volksbank Bergisches Land', typ: 'Girokonto', info: 'Privatkonto, Privatentnahmen', consent: '15.05.2025', gueltig: '15.05.2027' },
            { institut: 'Schwaebisch Hall', typ: 'Bausparvertrag', info: 'Auslaufend, Guthaben 18.000\u20AC, keine Einzahlung seit 2J', consent: '15.05.2025', gueltig: '15.05.2027' },
            { institut: 'R+V', typ: 'Kapital-Lebensversicherung', info: 'Ablauf 12/2028, Rueckkaufswert ~95.000\u20AC, 380\u20AC/mtl.', consent: '15.05.2025', gueltig: '15.05.2027' }
        ],
        fremdProdukte: [
            { typ: 'girokonto', produkt: 'Girokonto privat', institut: 'Volksbank Bergisches Land', details: 'Privatentnahmen', volumenOderPraemie: 8000, consent: true },
            { typ: 'bauspar', produkt: 'Bausparvertrag', institut: 'Schwaebisch Hall', details: 'Auslaufend, Guthaben 18.000\u20AC', volumenOderPraemie: 18000, consent: true },
            { typ: 'lebensversicherung', produkt: 'Kapital-Lebensversicherung', institut: 'R+V', details: 'Ablauf 12/2028, RKW ~95.000\u20AC', volumenOderPraemie: 95000, consent: true },
            { typ: 'depot', produkt: 'ETF-Depot', institut: 'DKB', details: 'MSCI World + Dividenden-ETF, Sparplan 400\u20AC/mtl.', volumenOderPraemie: 120000, consent: false },
            { typ: 'kfz', produkt: 'Privat-KFZ', institut: 'HUK24', details: 'Privat-PKW BMW 3er', volumenOderPraemie: 540, consent: false }
        ],

        transaktionen: [
            { kategorie: 'gehalt', betrag: 5500, empfaenger: 'Privatentnahme aus Betrieb (schwankend 4.800-6.200)', auffaelligkeit: null },
            { kategorie: 'versicherung_fremd', betrag: -380, empfaenger: 'R+V Lebensversicherung', auffaelligkeit: 'fremdversicherer' },
            { kategorie: 'versicherung_eigen', betrag: -428, empfaenger: 'ERGO (7 Vertraege)', auffaelligkeit: null },
            { kategorie: 'versicherung_fremd', betrag: -45, empfaenger: 'HUK24 KFZ privat', auffaelligkeit: 'fremdversicherer' },
            { kategorie: 'sparplan', betrag: -400, empfaenger: 'DKB Depot-Sparplan', auffaelligkeit: 'geht_an_fremdbank' },
            { kategorie: 'kinder', betrag: -800, empfaenger: 'Unterhalt Sohn Tobias (Student Muenchen)', auffaelligkeit: null },
            { kategorie: 'konsum', betrag: -1200, empfaenger: 'Lebenshaltung', auffaelligkeit: null },
            { kategorie: 'freizeit', betrag: -400, empfaenger: 'Restaurant, Freizeit', auffaelligkeit: null },
            { kategorie: 'sonstiges', betrag: -80, empfaenger: 'Handwerkskammer, Berufsverband', auffaelligkeit: null }
        ],
        haushaltsnetto: 5500,
        absicherungsquote: 15.5,
        sparquote: 7.3,
        freiVerfuegbar: 1767,

        potentiale: [
            { titel: 'Bindungsgespraech wegen NPS 5', typ: 'aktion', quellen: ['kommunikation'], prioritaet: 'kritisch', volumen: 5140, volumenTyp: 'jaehrlich', beschreibung: '14 Monate kein Kontakt, NPS 5 (Detractor). Abwanderungsrisiko hoch. Proaktiv Termin vereinbaren. Bestandssicherung 5.140\u20AC/J.', empfohleneAktion: 'termin_vereinbaren', produktEmpfehlung: 'Bindungsgespraech' },
            { titel: 'R+V LV Ablauf 2028 \u2013 Wiederanlage beraten', typ: 'cross_sell', quellen: ['finanztransaktion', 'markt'], prioritaet: 'hoch', volumen: 95000, volumenTyp: 'einmalig', beschreibung: 'Kapitallebensversicherung laeuft in 2 Jahren aus. 95k Auszahlung. Fruehzeitig ERGO Fondspolice oder ETF-Rentenversicherung positionieren.', empfohleneAktion: 'termin_vereinbaren', produktEmpfehlung: 'ERGO Fondsgebundene Rentenversicherung' },
            { titel: 'Nachfolgeplanung Betrieb', typ: 'cross_sell', quellen: ['lebensereignis'], prioritaet: 'hoch', volumen: 0, volumenTyp: 'vermittlung', beschreibung: '55 Jahre, kein Nachfolger in Sicht. Sohn studiert BWL (keine Handwerks-Nachfolge). Betriebsverkauf und Vermoegensanlage planen.', empfohleneAktion: 'termin_vereinbaren', produktEmpfehlung: 'Verweis an Kooperationspartner' },
            { titel: 'Ruerup-Rente (Basisrente)', typ: 'whitespot', quellen: ['bestand'], prioritaet: 'hoch', volumen: 6000, volumenTyp: 'jaehrlich', beschreibung: 'Als Selbstaendiger kein Zugang zu gesetzl. RV. Steuerlich absetzbar bis 27.566\u20AC/J. (2026). Grosse Luecke.', empfohleneAktion: 'angebot_erstellen', produktEmpfehlung: 'ERGO Ruerup-Rente' },
            { titel: 'KFZ-Optimierung Firmenfahrzeug', typ: 'anpassung', quellen: ['bestand'], prioritaet: 'mittel', volumen: -120, volumenTyp: 'jaehrlich', beschreibung: 'Tarif seit 5 Jahren nicht geprueft. SF-Klasse moeglicherweise besser.', empfohleneAktion: 'tarifvergleich', produktEmpfehlung: 'ERGO KFZ Optimierung' },
            { titel: 'Inhaltsversicherung Summenanpassung', typ: 'anpassung', quellen: ['bestand'], prioritaet: 'mittel', volumen: 80, volumenTyp: 'jaehrlich', beschreibung: 'Neue Maschinen seit 2020 angeschafft. Versicherungssumme pruefen.', empfohleneAktion: 'angebot_erstellen', produktEmpfehlung: 'ERGO Inhaltsversicherung' },
            { titel: 'DKB-Depot Konsolidierung', typ: 'cross_sell', quellen: ['finanztransaktion'], prioritaet: 'niedrig', volumen: 120000, volumenTyp: 'einmalig', beschreibung: '400\u20AC/mtl. + 120k gehen an Fremdbank. Im Kontext LV-Ablauf 2028 gesamte Vermoegensanlage beraten.', empfohleneAktion: 'termin_vereinbaren', produktEmpfehlung: 'ERGO Fondsgebundene Rentenversicherung' }
        ],

        kommunikation: [
            { typ: 'ki_kontakt', datum: '2026-03-02T10:00:00', betreff: 'Abwanderungsrisiko-Warnung', inhalt: 'System hat erkannt: NPS 5 (Detractor), kein Kontakt seit 14 Monaten. 7 Vertraege mit 5.140\u20AC/J. Praemie gefaehrdet. Dringende Kontaktempfehlung an Berater.', status: 'geoeffnet', followUp: false, automatisch: true, ausloeser: 'regelbasiert' },
            { typ: 'email', datum: '2025-12-20T09:00:00', betreff: 'Jahresrueckblick Ihrer Vertraege', inhalt: 'Zusammenfassung aller 7 ERGO-Vertraege fuer das Jahr 2025.', status: 'nicht_geoeffnet', followUp: false, automatisch: true },
            { typ: 'brief', datum: '2025-01-10T08:00:00', betreff: 'Inhaltsversicherung Jahresrechnung', inhalt: 'Jahresrechnung 2025 fuer Werkstatt + Lager.', status: 'versendet', followUp: false, automatisch: true }
        ],

        _modus: 'versicherung'
    };

    // ── V4: Dr. Anna Hoffmann – Aerztin, hohes Einkommen, wenig versichert ──
    window._versicherungsPersonas['Anna Hoffmann'] = {
        geburtsdatum: '18.09.1991',
        adresse: 'Duerener Str. 45, 50931 Koeln-Lindenthal',
        telefon: '+49 221 9876543',
        email: 'anna.hoffmann@uniklinik-koeln.de',
        beruf: 'Fachaeerztin Dermatologie',
        familienstand: 'Verheiratet',
        nettoeinkommen: 5200,
        arbeitgeber: 'Universitaetsklinikum Koeln',
        linkedinHint: true,
        linkedin: { kontakte: 300, aktivitaet: 'mittel', branchen: ['Dermatologie', 'Medizin', 'Forschung'], zusammenfassung: 'Fachaeerztin, publiziert Fachartikel, Dermatologie-Netzwerk' },
        beschaeftigtSeit: '01.04.2020',
        tiere: 'keine',
        risikoscore: 15,
        risikoDetails: ['Keine BU-Versicherung bei 105k Einkommen \u2013 massive Luecke', 'Keine RLV trotz Familie mit Kleinkind'],
        bonitaetsscore: 91,
        schadenhistorie: [],
        kinder: [{ name: 'Emma', alter: 3 }],
        nps: { score: 9, kategorie: 'promoter', datum: '15.10.2025', kampagne: 'Herbst-Zufriedenheitsbefragung 2025 (E-Mail)', details: [
            { name: 'Beratungsqualitaet', wert: 10 },
            { name: 'Zufriedenheit mit dem Unternehmen', wert: 9 },
            { name: 'Weiterempfehlung an Freunde', wert: 10 },
            { name: 'Preis-Leistungs-Verhaeltnis', wert: 9 },
            { name: 'Erreichbarkeit & Service', wert: 9 }
        ]},

        vertraege: [
            { typ: 'Privathaftpflichtversicherung', versicherer: 'ERGO', details: 'Familie, 15 Mio. \u20AC Deckung', praemie: '\u20AC110/Jahr', beginn: '01.01.2021', status: 'Aktiv' },
            { typ: 'Hausratversicherung', versicherer: 'ERGO', details: '110 qm, inkl. Fahrraddiebstahl', praemie: '\u20AC195/Jahr', beginn: '01.06.2021', status: 'Aktiv' }
        ],

        fidaVertraege: [
            { institut: 'Commerzbank', typ: 'Girokonto', info: 'Familienkonto, Gehalt Anna 5.200\u20AC + Jan 3.400\u20AC', consent: '01.07.2025', gueltig: '01.07.2027' },
            { institut: 'ING', typ: 'Tagesgeld', info: 'Eigenkapital-Ansparen, 65.000\u20AC', consent: '01.07.2025', gueltig: '01.07.2027' },
            { institut: 'Scalable Capital', typ: 'Depot', info: 'MSCI ACWI, Sparplan 800\u20AC/mtl., 38.000\u20AC', consent: '01.07.2025', gueltig: '01.07.2027' },
            { institut: 'Allianz (Check24)', typ: 'Kfz-Versicherung', info: 'BMW X1, VK, 780\u20AC/J.', consent: null, gueltig: null }
        ],
        fremdProdukte: [
            { typ: 'girokonto', produkt: 'Girokonto', institut: 'Commerzbank', details: 'Familienkonto, Gehalt Anna 5.200\u20AC + Jan 3.400\u20AC', volumenOderPraemie: 6000, consent: true },
            { typ: 'tagesgeld', produkt: 'Tagesgeld', institut: 'ING', details: 'Eigenkapital-Ansparen fuer Eigentum', volumenOderPraemie: 65000, consent: true },
            { typ: 'depot', produkt: 'ETF-Depot', institut: 'Scalable Capital', details: 'MSCI ACWI, Sparplan 800\u20AC/mtl.', volumenOderPraemie: 38000, consent: true },
            { typ: 'kfz', produkt: 'KFZ-Versicherung', institut: 'Allianz (Check24)', details: 'BMW X1, VK', volumenOderPraemie: 780, consent: false }
        ],

        transaktionen: [
            { kategorie: 'gehalt', betrag: 5200, empfaenger: 'Uniklinik Koeln', auffaelligkeit: null },
            { kategorie: 'gehalt_partner', betrag: 3400, empfaenger: 'Jan (Architekt)', auffaelligkeit: null },
            { kategorie: 'miete', betrag: -1450, empfaenger: 'Vermieter', auffaelligkeit: null },
            { kategorie: 'sparplan', betrag: -800, empfaenger: 'Scalable Capital', auffaelligkeit: 'geht_an_fremdbank' },
            { kategorie: 'sparen', betrag: -500, empfaenger: 'ING Sparrate EK', auffaelligkeit: 'geht_an_fremdbank' },
            { kategorie: 'versicherung_fremd', betrag: -65, empfaenger: 'Allianz KFZ', auffaelligkeit: 'fremdversicherer' },
            { kategorie: 'versicherung_eigen', betrag: -25, empfaenger: 'ERGO (Haftpflicht + Hausrat)', auffaelligkeit: null },
            { kategorie: 'kinder', betrag: -420, empfaenger: 'Kita', auffaelligkeit: null },
            { kategorie: 'konsum', betrag: -1800, empfaenger: 'Lebenshaltung, Konsum', auffaelligkeit: null }
        ],
        haushaltsnetto: 8600,
        absicherungsquote: 0.5,
        sparquote: 15.1,
        freiVerfuegbar: 2200,

        potentiale: [
            { titel: 'BU-Versicherung (Aerzte-Tarif!)', typ: 'whitespot', quellen: ['bestand'], prioritaet: 'kritisch', volumen: 3600, volumenTyp: 'jaehrlich', beschreibung: 'Aerztin mit 105k Einkommen und KEINER BU. Aerzte-Tarif mit abstrakter Verweisung = Premium-Segment. Jetzt abschliessen solange gesund.', empfohleneAktion: 'angebot_erstellen', produktEmpfehlung: 'ERGO BU Aerzte-Tarif' },
            { titel: 'Risikolebensversicherung', typ: 'whitespot', quellen: ['bestand', 'lebensereignis'], prioritaet: 'hoch', volumen: 360, volumenTyp: 'jaehrlich', beschreibung: 'Familie mit Kleinkind, Eigentum geplant. 400k Deckung fuer Baufi-Absicherung + Familienschutz.', empfohleneAktion: 'angebot_erstellen', produktEmpfehlung: 'ERGO Risikolebensversicherung' },
            { titel: 'Fondspolice statt Scalable Capital', typ: 'cross_sell', quellen: ['finanztransaktion'], prioritaet: 'mittel', volumen: 38000, volumenTyp: 'einmalig', beschreibung: '800\u20AC/mtl. gehen an Fremdbank. ERGO-Fondspolice mit gleichen ETFs, Steuervorteil Halbeinkuenfte.', empfohleneAktion: 'termin_vereinbaren', produktEmpfehlung: 'ERGO Fondsgebundene Rentenversicherung' },
            { titel: 'Wohngebaeude + Baufi-Absicherung (vormerken)', typ: 'cross_sell', quellen: ['lebensereignis'], prioritaet: 'hoch', volumen: 0, volumenTyp: 'vermittlung', beschreibung: 'Eigentum geplant in 2-3 Jahren. 65k EK bereits angespart. Heute schon Beratung positionieren.', empfohleneAktion: 'termin_vereinbaren', produktEmpfehlung: 'ERGO Wohngebaeudeversicherung (Vormerkung)' },
            { titel: 'KFZ-Wechsel Allianz auf ERGO', typ: 'anpassung', quellen: ['wettbewerb'], prioritaet: 'mittel', volumen: 780, volumenTyp: 'jaehrlich', beschreibung: 'KFZ bei Allianz ueber Check24 = preissensitiv. ERGO Buendel-Rabatt mit Haftpflicht+Hausrat anbieten.', empfohleneAktion: 'tarifvergleich', produktEmpfehlung: 'ERGO KFZ-Versicherung (Buendel)' },
            { titel: 'Kinderunfallversicherung', typ: 'whitespot', quellen: ['bestand'], prioritaet: 'mittel', volumen: 120, volumenTyp: 'jaehrlich', beschreibung: 'Kind Emma (3) ohne Unfallversicherung. Gesetzliche UV deckt nur Kita-Unfaelle.', empfohleneAktion: 'angebot_erstellen', produktEmpfehlung: 'ERGO Unfall Smart Kinder' }
        ],

        kommunikation: [
            { typ: 'chatbot', datum: '2026-03-07T20:45:00', betreff: 'Self-Service Anfrage: Kinderabsicherung', verlauf: [
                { rolle: 'kunde', text: 'Welche Versicherungen brauche ich fuer mein Kind Emma (3)?' },
                { rolle: 'bot', text: 'Fuer Emma empfehle ich: Unfallversicherung (gesetzl. UV deckt nur Kita), ggf. Invaliditaetsversicherung. Ausserdem sollten Sie als Aerztin unbedingt eine BU-Versicherung haben!' },
                { rolle: 'kunde', text: 'Ich habe wirklich keine BU? Das muss ich aendern.' },
                { rolle: 'bot', text: 'Richtig, aktuell ist keine BU vorhanden. Mit Ihrem Einkommen ist das eine erhebliche Luecke. Als Aerztin bekommen Sie einen speziellen Aerzte-Tarif. Soll ich einen Termin vereinbaren?' },
                { rolle: 'kunde', text: 'Ja, bitte dringend' }
            ], ergebnis: 'Terminwunsch BU + Kinderabsicherung', themen: ['kinderunfall', 'bu', 'aerztin', 'termin'], status: 'termin_geplant' },
            { typ: 'ki_kontakt', datum: '2026-02-22T10:00:00', betreff: 'DRINGENDE BU-Empfehlung Aerztin', inhalt: 'System hat erkannt: Fachaeerztin mit 105k Einkommen und KEINE BU-Versicherung. Aerzte-Tarif mit abstrakter Verweisung empfohlen. Absicherungsquote nur 0,5%.', status: 'geoeffnet', followUp: false, automatisch: true, ausloeser: 'regelbasiert' },
            { typ: 'email', datum: '2026-02-15T09:00:00', betreff: 'Eigentumskauf geplant? Ihre Absicherungs-Checkliste', inhalt: 'Als Familie mit Kaufabsicht empfehlen wir: RLV, Wohngebaeude, Baufi-Absicherung.', status: 'geoeffnet', geoeffnetAm: '2026-02-15T20:00:00', followUp: true, automatisch: true },
            { typ: 'telefon', datum: '2026-01-30T10:30:00', betreff: 'Rueckfrage Eigenheim-Planung', inhalt: 'Kundin plant Eigentumskauf in 2-3 Jahren. Jan (Ehemann, Architekt) sucht geeignete Immobilie. Beratung zu WGV vormerken.', status: 'erledigt' }
        ],

        _modus: 'versicherung'
    };

})();
