
// ========================================
/**
 * Navigiert zum Vertriebsbericht aus der Kundendetail-Seite
 */
function goToSalesReportFromKundenDetail() {
    const agenturId = currentKundenVermittlerId || 'VM00001';
    console.log('Navigiere zu Vertriebsbericht für:', agenturId);

    // Verstecke Kundendetail-Seite
    document.getElementById('kundenDetailPage').style.display = 'none';

    // Nutze die globale Navigation-Funktion aus sales-report.js
    if (typeof navigateToSalesReport === 'function') {
        navigateToSalesReport(agenturId);
    } else {
        console.error('navigateToSalesReport Funktion nicht gefunden');
        // Fallback: Manuell navigieren
        if (typeof openDashboard === 'function') {
            openDashboard();
        }
    }
}

function fillKundenDetail(kundenName, vermittlerId) {
    // Stammdaten füllen
    const nameEl = document.getElementById('kundenName');
    if (nameEl) nameEl.textContent = kundenName;

    const idEl = document.getElementById('kundenVermittlerId');
    if (idEl) idEl.textContent = vermittlerId;

    // Mock-Daten für Demo
    const mockKunden = {
        'Peter Schmidt': {
            geburtsdatum: '15.03.1985',
            adresse: 'Musterstra\u00DFe 123, 12345 Musterstadt',
            telefon: '+49 123 456789',
            email: 'peter.schmidt@email.de',
            beruf: 'Angestellter',
            familienstand: 'Verheiratet',
            arbeitgeber: 'TechCorp GmbH',
            beschaeftigtSeit: '01.03.2016',
            tiere: 'unbekannt',
            risikoscore: 35,
            risikoDetails: [
                'Skydive Academy Stuttgart \u2013 Risikosport (Open Finance)',
                'Bungee Events GmbH \u2013 Extremsport (Open Finance)',
                'BU-Leistungsfall (WG-Schaden, Aug. 2024)',
                'Wohngeb\u00E4udeschaden Sturm (Nov. 2024)'
            ],
            bonitaetsscore: 82,
            schadenhistorie: [
                { datum: '15.11.2024', sparte: 'Wohngeb\u00E4ude', beschreibung: 'Sturmschaden Dach \u2013 Ziegel abgedeckt', status: 'Reguliert', betrag: '\u20AC4.250', versicherer: 'VHV' },
                { datum: '03.08.2024', sparte: 'BU-Versicherung', beschreibung: 'Leistungspr\u00FCfung wg. Bandscheibenvorfall \u2013 4 Wochen AU', status: 'Reguliert', betrag: '\u20AC1.500', versicherer: 'ERGO' },
                { datum: '22.03.2023', sparte: 'Kfz-Haftpflicht', beschreibung: 'Parkschaden am Nachbarfahrzeug', status: 'Reguliert', betrag: '\u20AC890', versicherer: 'Allianz' }
            ],
            kinder: [{ name: 'Lena', alter: 8 }, { name: 'Paul', alter: 5 }],
            nps: { score: 9, kategorie: 'promoter', datum: '15.10.2025', kampagne: 'Herbst-Zufriedenheitsbefragung 2025 (E-Mail)', details: [
                { name: 'Beratungsqualit\u00E4t', wert: 9 },
                { name: 'Zufriedenheit mit dem Unternehmen', wert: 8 },
                { name: 'Weiterempfehlung an Freunde', wert: 10 },
                { name: 'Preis-Leistungs-Verh\u00E4ltnis', wert: 8 },
                { name: 'Erreichbarkeit & Service', wert: 9 }
            ]},
            vertraege: [
                { typ: 'Berufsunfähigkeitsversicherung', versicherer: 'ERGO', details: 'BU-Rente: €1.500/Mon., Endalter 67, ohne Ausschlüsse', praemie: '€89/Mon.', beginn: '01.03.2018', status: 'Aktiv' },
                { typ: 'Wohngebäudeversicherung', versicherer: 'VHV', details: 'Vers.-Summe: €450.000, inkl. Elementar, gleitender Neuwert', praemie: '€450/Jahr', beginn: '15.06.2019', status: 'Aktiv' }
            ],
            fidaVertraege: [
                { institut: 'Sparkasse', typ: 'Girokonto', info: 'Hauptkonto', consent: '15.03.2024', gueltig: '15.03.2026' },
                { institut: 'ING DiBa', typ: 'Tagesgeld', info: 'Sparkonto', consent: '15.03.2024', gueltig: '15.03.2026' },
                { institut: 'DWS', typ: 'Depot', info: 'Fondssparen', consent: '15.03.2024', gueltig: '15.03.2026' }
            ]
        },
        'Amira König': {
            geburtsdatum: '08.11.1979',
            adresse: 'Lindenweg 7, 60329 Frankfurt',
            telefon: '+49 69 7654321',
            email: 'amira.koenig@email.de',
            beruf: 'Lehrerin',
            familienstand: 'Geschieden',
            arbeitgeber: 'Stadtverwaltung Köln',
            beschaeftigtSeit: '01.08.2008',
            tiere: 'keine',
            risikoscore: 22,
            bonitaetsscore: 75,
            kinder: [{ name: 'Max', alter: 12 }],
            nps: { score: 7, kategorie: 'passive', datum: '08.10.2025', kampagne: 'Herbst-Zufriedenheitsbefragung 2025 (E-Mail)', details: [
                { name: 'Beratungsqualität', wert: 7 },
                { name: 'Zufriedenheit mit dem Unternehmen', wert: 6 },
                { name: 'Weiterempfehlung an Freunde', wert: 7 },
                { name: 'Preis-Leistungs-Verhältnis', wert: 7 },
                { name: 'Erreichbarkeit & Service', wert: 8 }
            ]},
            vertraege: [
                { typ: 'Risikolebensversicherung', versicherer: 'ERGO', details: 'Vers.-Summe: €150.000, Laufzeit bis 02/2026', praemie: '€18/Mon.', beginn: '01.02.2016', status: 'Aktiv' },
                { typ: 'Berufsunfähigkeitsversicherung', versicherer: 'ERGO', details: 'BU-Rente: €1.800/Mon., Endalter 67', praemie: '€95/Mon.', beginn: '01.09.2015', status: 'Aktiv' },
                { typ: 'Unfallversicherung', versicherer: 'Helvetia', details: 'Invalidität €100.000, Progression 350%', praemie: '€180/Jahr', beginn: '01.01.2020', status: 'Aktiv' }
            ],
            fidaVertraege: [
                { institut: 'Volksbank', typ: 'Girokonto', info: 'Gehaltskonto', consent: '10.04.2024', gueltig: '10.04.2026' },
                { institut: 'DKB', typ: 'Tagesgeld', info: 'Notgroschen', consent: '10.04.2024', gueltig: '10.04.2026' }
            ]
        },
        'Thomas Weber': {
            geburtsdatum: '25.04.1990',
            adresse: 'Bergstraße 22, 80331 München',
            telefon: '+49 89 1234567',
            email: 'thomas.weber@email.de',
            beruf: 'Software-Entwickler',
            familienstand: 'Ledig',
            arbeitgeber: 'SAP SE',
            beschaeftigtSeit: '15.06.2020',
            tiere: 'Katze (Mietze)',
            risikoscore: 28,
            bonitaetsscore: 88,
            kinder: [],
            nps: { score: 8, kategorie: 'promoter', datum: '03.11.2025', kampagne: 'Nach-Beratungs-Feedback (E-Mail)', details: [
                { name: 'Beratungsqualität', wert: 8 },
                { name: 'Zufriedenheit mit dem Unternehmen', wert: 7 },
                { name: 'Weiterempfehlung an Freunde', wert: 9 },
                { name: 'Preis-Leistungs-Verhältnis', wert: 8 },
                { name: 'Erreichbarkeit & Service', wert: 7 }
            ]},
            vertraege: [
                { typ: 'Privathaftpflichtversicherung', versicherer: 'ERGO', details: 'Single, €50 Mio. Deckung', praemie: '€65/Jahr', beginn: '01.03.2021', status: 'Aktiv' }
            ],
            fidaVertraege: [
                { institut: 'N26', typ: 'Girokonto', info: 'Hauptkonto', consent: '20.06.2024', gueltig: '20.06.2026' },
                { institut: 'Trade Republic', typ: 'Depot', info: 'ETF-Sparplan €500/Mon.', consent: '20.06.2024', gueltig: '20.06.2026' },
                { institut: 'Scalable Capital', typ: 'Depot', info: 'Einzelaktien', consent: '20.06.2024', gueltig: '20.06.2026' }
            ]
        },
        'Anna Hoffmann': {
            geburtsdatum: '03.06.1988',
            adresse: 'Rosenstraße 15, 50667 Köln',
            telefon: '+49 221 9876543',
            email: 'anna.hoffmann@email.de',
            beruf: 'Marketing-Managerin',
            familienstand: 'Verheiratet',
            arbeitgeber: 'Universitätsklinikum Köln',
            beschaeftigtSeit: '01.04.2015',
            tiere: 'keine',
            risikoscore: 15,
            bonitaetsscore: 91,
            kinder: [{ name: 'Sophie', alter: 3 }, { name: 'Emma', alter: 1 }],
            nps: { score: 10, kategorie: 'promoter', datum: '15.10.2025', kampagne: 'Herbst-Zufriedenheitsbefragung 2025 (E-Mail)', details: [
                { name: 'Beratungsqualität', wert: 10 },
                { name: 'Zufriedenheit mit dem Unternehmen', wert: 9 },
                { name: 'Weiterempfehlung an Freunde', wert: 10 },
                { name: 'Preis-Leistungs-Verhältnis', wert: 9 },
                { name: 'Erreichbarkeit & Service', wert: 10 }
            ]},
            vertraege: [
                { typ: 'Risikolebensversicherung', versicherer: 'ERGO', details: 'Vers.-Summe: €300.000, Laufzeit bis 2045', praemie: '€25/Mon.', beginn: '01.07.2020', status: 'Aktiv' },
                { typ: 'Berufsunfähigkeitsversicherung', versicherer: 'Alte Leipziger', details: 'BU-Rente: €2.000/Mon., Endalter 67', praemie: '€110/Mon.', beginn: '01.01.2019', status: 'Aktiv' }
            ],
            fidaVertraege: [
                { institut: 'Commerzbank', typ: 'Girokonto', info: 'Familienkonto', consent: '01.07.2024', gueltig: '01.07.2026' },
                { institut: 'Consorsbank', typ: 'Depot', info: 'Kindersparen', consent: '01.07.2024', gueltig: '01.07.2026' }
            ]
        },
        'Michael Braun': {
            geburtsdatum: '17.09.1975',
            adresse: 'Industriestraße 88, 70173 Stuttgart',
            telefon: '+49 711 5432167',
            email: 'michael.braun@email.de',
            beruf: 'Geschäftsführer',
            familienstand: 'Verheiratet',
            arbeitgeber: 'Meisterbetrieb Braun GmbH',
            beschaeftigtSeit: '01.01.2005',
            tiere: 'Hund (Rex)',
            risikoscore: 55,
            bonitaetsscore: 58,
            kinder: [{ name: 'Lukas', alter: 18 }, { name: 'Jana', alter: 15 }],
            nps: { score: 4, kategorie: 'detractor', datum: '22.09.2025', kampagne: 'Jahres-Kundenbefragung Q3/2025 (Brief)', details: [
                { name: 'Beratungsqualität', wert: 5 },
                { name: 'Zufriedenheit mit dem Unternehmen', wert: 3 },
                { name: 'Weiterempfehlung an Freunde', wert: 4 },
                { name: 'Preis-Leistungs-Verhältnis', wert: 3 },
                { name: 'Erreichbarkeit & Service', wert: 5 }
            ]},
            vertraege: [
                { typ: 'Berufsunfähigkeitsversicherung', versicherer: 'ERGO', details: 'BU-Rente: €3.500/Mon., Endalter 65', praemie: '€220/Mon.', beginn: '01.06.2010', status: 'Aktiv' },
                { typ: 'Wohngebäudeversicherung', versicherer: 'Axa', details: 'Vers.-Summe: €750.000, inkl. Elementar', praemie: '€680/Jahr', beginn: '01.01.2012', status: 'Aktiv' },
                { typ: 'Rechtsschutzversicherung', versicherer: 'ERGO', details: 'Premium inkl. Beruf, Verkehr, Privat', praemie: '€380/Jahr', beginn: '01.04.2018', status: 'Aktiv' }
            ],
            fidaVertraege: [
                { institut: 'Deutsche Bank', typ: 'Girokonto', info: 'Geschäftskonto', consent: '15.05.2024', gueltig: '15.05.2026' },
                { institut: 'Deka', typ: 'Depot', info: 'Vermögensaufbau €180.000', consent: '15.05.2024', gueltig: '15.05.2026' },
                { institut: 'Bausparkasse Schwäbisch Hall', typ: 'Bausparvertrag', info: 'Zuteilungsreif', consent: '15.05.2024', gueltig: '15.05.2026' }
            ]
        },
        'Lisa Müller': {
            geburtsdatum: '29.12.1992',
            adresse: 'Parkallee 5, 20095 Hamburg',
            telefon: '+49 40 8765432',
            email: 'lisa.mueller@email.de',
            beruf: 'Ärztin (Assistenz)',
            familienstand: 'In Partnerschaft',
            arbeitgeber: 'Medienhaus München GmbH',
            beschaeftigtSeit: '01.09.2017',
            tiere: 'keine',
            risikoscore: 20,
            bonitaetsscore: 80,
            kinder: [],
            nps: { score: 7, kategorie: 'passive', datum: '08.10.2025', kampagne: 'Herbst-Zufriedenheitsbefragung 2025 (E-Mail)', details: [
                { name: 'Beratungsqualität', wert: 8 },
                { name: 'Zufriedenheit mit dem Unternehmen', wert: 7 },
                { name: 'Weiterempfehlung an Freunde', wert: 7 },
                { name: 'Preis-Leistungs-Verhältnis', wert: 6 },
                { name: 'Erreichbarkeit & Service', wert: 7 }
            ]},
            vertraege: [
                { typ: 'Berufsunfähigkeitsversicherung', versicherer: 'ERGO', details: 'BU-Rente: €2.500/Mon., Dienstunfähigkeitsklausel', praemie: '€145/Mon.', beginn: '01.08.2022', status: 'Aktiv' }
            ],
            fidaVertraege: [
                { institut: 'Comdirect', typ: 'Girokonto', info: 'Gehaltskonto', consent: '12.08.2024', gueltig: '12.08.2026' },
                { institut: 'ING', typ: 'Extra-Konto', info: 'Tagesgeld €15.000', consent: '12.08.2024', gueltig: '12.08.2026' },
                { institut: 'KfW', typ: 'Studienkredit', info: 'Restschuld €18.000', consent: '12.08.2024', gueltig: '12.08.2026' }
            ]
        },
        'Klaus Meier': {
            geburtsdatum: '22.07.1978',
            adresse: 'Hauptstraße 45, 54321 Beispielstadt',
            telefon: '+49 987 654321',
            email: 'klaus.meier@email.de',
            beruf: 'Selbstständig (Handwerk)',
            familienstand: 'Verheiratet',
            arbeitgeber: 'Freelance IT-Consulting',
            beschaeftigtSeit: '01.03.2019',
            tiere: 'keine',
            risikoscore: 30,
            bonitaetsscore: 85,
            kinder: [{ name: 'Tim', alter: 10 }, { name: 'Mia', alter: 7 }],
            nps: { score: 9, kategorie: 'promoter', datum: '15.10.2025', kampagne: 'Herbst-Zufriedenheitsbefragung 2025 (E-Mail)', details: [
                { name: 'Beratungsqualität', wert: 9 },
                { name: 'Zufriedenheit mit dem Unternehmen', wert: 9 },
                { name: 'Weiterempfehlung an Freunde', wert: 10 },
                { name: 'Preis-Leistungs-Verhältnis', wert: 8 },
                { name: 'Erreichbarkeit & Service', wert: 9 }
            ]},
            vertraege: [
                { typ: 'Betriebshaftpflicht', versicherer: 'ERGO', details: '€5 Mio. Deckung, Handwerksbetrieb', praemie: '€890/Jahr', beginn: '01.01.2015', status: 'Aktiv' },
                { typ: 'Berufsunfähigkeitsversicherung', versicherer: 'Nürnberger', details: 'BU-Rente: €2.000/Mon., Handwerker-Tarif', praemie: '€135/Mon.', beginn: '01.03.2016', status: 'Aktiv' }
            ],
            fidaVertraege: [
                { institut: 'Commerzbank', typ: 'Geschäftskonto', info: 'Betriebskonto', consent: '01.09.2024', gueltig: '01.09.2026' },
                { institut: 'Union Investment', typ: 'Riester', info: 'Altersvorsorge €45.000', consent: '01.09.2024', gueltig: '01.09.2026' }
            ]
        },
        'Matthias Engel': {
            geburtsdatum: '14.08.1982',
            adresse: 'Schillerstraße 78, 45127 Essen',
            telefon: '+49 201 3456789',
            email: 'matthias.engel@email.de',
            beruf: 'IT-Consultant',
            familienstand: 'Verheiratet',
            arbeitgeber: 'Bauer Architekturbüro',
            beschaeftigtSeit: '01.07.2012',
            tiere: 'keine',
            risikoscore: 18,
            bonitaetsscore: 78,
            kinder: [{ name: 'Jonas', alter: 6 }, { name: 'Lea', alter: 4 }],
            nps: { score: 6, kategorie: 'passive', datum: '08.10.2025', kampagne: 'Herbst-Zufriedenheitsbefragung 2025 (E-Mail)', details: [
                { name: 'Beratungsqualität', wert: 6 },
                { name: 'Zufriedenheit mit dem Unternehmen', wert: 6 },
                { name: 'Weiterempfehlung an Freunde', wert: 5 },
                { name: 'Preis-Leistungs-Verhältnis', wert: 7 },
                { name: 'Erreichbarkeit & Service', wert: 6 }
            ]},
            vertraege: [
                { typ: 'Berufsunfähigkeitsversicherung', versicherer: 'Allianz', details: 'BU-Rente: €1.200/Mon., Endalter 65 - UNTERDECKT', praemie: '€75/Mon.', beginn: '01.04.2015', status: 'Aktiv' },
                { typ: 'Privathaftpflichtversicherung', versicherer: 'ERGO', details: 'Familie, €50 Mio. Deckung', praemie: '€85/Jahr', beginn: '01.01.2018', status: 'Aktiv' }
            ],
            fidaVertraege: [
                { institut: 'Sparkasse Essen', typ: 'Girokonto', info: 'Gehalt €4.200 netto/Mon.', consent: '05.10.2024', gueltig: '05.10.2026' },
                { institut: 'ING', typ: 'Depot', info: 'ETF-Sparplan €400/Mon.', consent: '05.10.2024', gueltig: '05.10.2026' },
                { institut: 'Allianz', typ: 'BU-Versicherung', info: 'Nur €1.200/Mon. - Deckungslücke!', consent: '05.10.2024', gueltig: '05.10.2026' }
            ]
        },
        'Christian Bauer': {
            geburtsdatum: '23.01.1989',
            adresse: 'Königsallee 15, 40212 Düsseldorf',
            telefon: '+49 211 9876543',
            email: 'christian.bauer@email.de',
            beruf: 'Projektmanager',
            familienstand: 'Ledig',
            arbeitgeber: 'DesignStudio Hamburg',
            beschaeftigtSeit: '01.10.2021',
            tiere: 'Hamster',
            risikoscore: 25,
            bonitaetsscore: 72,
            kinder: [],
            nps: { score: 8, kategorie: 'promoter', datum: '03.11.2025', kampagne: 'Nach-Beratungs-Feedback (E-Mail)', details: [
                { name: 'Beratungsqualität', wert: 8 },
                { name: 'Zufriedenheit mit dem Unternehmen', wert: 8 },
                { name: 'Weiterempfehlung an Freunde', wert: 9 },
                { name: 'Preis-Leistungs-Verhältnis', wert: 7 },
                { name: 'Erreichbarkeit & Service', wert: 8 }
            ]},
            vertraege: [
                { typ: 'Rechtsschutzversicherung', versicherer: 'ERGO', details: 'Beruf & Privat, €300 SB', praemie: '€280/Jahr', beginn: '01.06.2021', status: 'Aktiv' }
            ],
            fidaVertraege: [
                { institut: 'Commerzbank', typ: 'Girokonto', info: 'Gehalt €3.800 netto/Mon.', consent: '15.11.2024', gueltig: '15.11.2026' },
                { institut: 'Trade Republic', typ: 'Depot', info: 'Aktien €45.000', consent: '15.11.2024', gueltig: '15.11.2026' },
                { institut: 'keine', typ: 'BU-Versicherung', info: 'NICHT VORHANDEN!', consent: '15.11.2024', gueltig: '15.11.2026' }
            ]
        },
        'Martin Wolf': {
            geburtsdatum: '05.05.1987',
            adresse: 'Handwerkerweg 9, 44135 Dortmund',
            telefon: '+49 231 7654321',
            email: 'martin.wolf@email.de',
            beruf: 'Dachdecker (Meister)',
            familienstand: 'Verheiratet',
            arbeitgeber: 'Kanzlei Wolf & Partner',
            beschaeftigtSeit: '01.02.2003',
            tiere: 'Hund (Bruno)',
            risikoscore: 12,
            bonitaetsscore: 93,
            kinder: [{ name: 'Felix', alter: 9 }, { name: 'Marie', alter: 7 }, { name: 'Ben', alter: 3 }],
            nps: { score: 3, kategorie: 'detractor', datum: '22.09.2025', kampagne: 'Jahres-Kundenbefragung Q3/2025 (Brief)', details: [
                { name: 'Beratungsqualität', wert: 4 },
                { name: 'Zufriedenheit mit dem Unternehmen', wert: 2 },
                { name: 'Weiterempfehlung an Freunde', wert: 3 },
                { name: 'Preis-Leistungs-Verhältnis', wert: 2 },
                { name: 'Erreichbarkeit & Service', wert: 4 }
            ]},
            vertraege: [
                { typ: 'Unfallversicherung', versicherer: 'ERGO', details: 'Invalidität €150.000, Progression 500%', praemie: '€320/Jahr', beginn: '01.03.2017', status: 'Aktiv' },
                { typ: 'Wohngebäudeversicherung', versicherer: 'VHV', details: 'Vers.-Summe: €380.000, inkl. Elementar', praemie: '€520/Jahr', beginn: '01.07.2016', status: 'Aktiv' }
            ],
            fidaVertraege: [
                { institut: 'Volksbank Dortmund', typ: 'Girokonto', info: 'Gehalt €3.200 netto/Mon.', consent: '22.09.2024', gueltig: '22.09.2026' },
                { institut: 'Bausparkasse LBS', typ: 'Bausparvertrag', info: 'Ansparphase €28.000', consent: '22.09.2024', gueltig: '22.09.2026' },
                { institut: 'keine', typ: 'BU-Versicherung', info: 'NICHT VORHANDEN - Hochrisiko-Beruf!', consent: '22.09.2024', gueltig: '22.09.2026' }
            ]
        },
        'Eva Hartmann': {
            geburtsdatum: '19.11.1991',
            adresse: 'Kunststraße 33, 50674 Köln',
            telefon: '+49 221 1234567',
            email: 'eva.hartmann@email.de',
            beruf: 'Grafikdesignerin (selbstständig)',
            familienstand: 'In Partnerschaft',
            arbeitgeber: 'Schmidt Holding AG',
            beschaeftigtSeit: '01.01.1995',
            tiere: 'keine',
            risikoscore: 10,
            bonitaetsscore: 95,
            kinder: [{ name: 'Mila', alter: 2 }],
            nps: { score: 9, kategorie: 'promoter', datum: '15.10.2025', kampagne: 'Herbst-Zufriedenheitsbefragung 2025 (E-Mail)', details: [
                { name: 'Beratungsqualität', wert: 9 },
                { name: 'Zufriedenheit mit dem Unternehmen', wert: 9 },
                { name: 'Weiterempfehlung an Freunde', wert: 10 },
                { name: 'Preis-Leistungs-Verhältnis', wert: 8 },
                { name: 'Erreichbarkeit & Service', wert: 9 }
            ]},
            vertraege: [
                { typ: 'Berufsunfähigkeitsversicherung', versicherer: 'ERGO', details: 'BU-Rente: €1.000/Mon., Endalter 67 - Aufstockung empfohlen', praemie: '€68/Mon.', beginn: '01.09.2019', status: 'Aktiv' },
                { typ: 'Betriebshaftpflicht', versicherer: 'Hiscox', details: '€2 Mio. Deckung, Freelancer-Tarif', praemie: '€290/Jahr', beginn: '01.01.2020', status: 'Aktiv' }
            ],
            fidaVertraege: [
                { institut: 'N26', typ: 'Geschäftskonto', info: 'Selbstständigen-Einkommen variabel', consent: '01.12.2024', gueltig: '01.12.2026' },
                { institut: 'ING', typ: 'Tagesgeld', info: 'Rücklage €12.000', consent: '01.12.2024', gueltig: '01.12.2026' },
                { institut: 'KfW', typ: 'Gründerkredit', info: 'Restschuld €15.000', consent: '01.12.2024', gueltig: '01.12.2026' }
            ]
        }
    };

    window.mockKunden = mockKunden;
    const kunde = mockKunden[kundenName] || mockKunden['Peter Schmidt'];

    // Kundenfoto setzen
    const kundenFoto = document.querySelector('.kunden-foto');
    if (kundenFoto) {
        var kundenFotos = {
            'Peter Schmidt': 'assets/images/AdobeStock_624564221.jpeg',
            'Amira König': 'assets/images/AdobeStock_252262042.jpeg',
            'Thomas Weber': 'assets/images/AdobeStock_361342769.jpeg',
            'Sabine Danzig': 'assets/images/AdobeStock_612932760.jpeg'
        };
        if (kundenFotos[kundenName]) {
            kundenFoto.innerHTML = `<img src="${kundenFotos[kundenName]}" alt="${kundenName}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
        } else {
            kundenFoto.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
            </svg>`;
        }
    }

    // Stammdaten
    document.getElementById('kundenGeburtsdatum').textContent = kunde.geburtsdatum;
    document.getElementById('kundenAdresse').textContent = kunde.adresse;
    document.getElementById('kundenTelefon').textContent = kunde.telefon;
    document.getElementById('kundenEmail').textContent = kunde.email;
    document.getElementById('kundenBeruf').textContent = kunde.beruf;
    document.getElementById('kundenFamilienstand').textContent = kunde.familienstand;

    // Kinder
    const kinderList = document.getElementById('kundenKinder');
    if (kinderList) {
        if (kunde.kinder.length > 0) {
            kinderList.innerHTML = kunde.kinder.map(k =>
                `<span class="kinder-badge">${k.name} (${k.alter} Jahre)</span>`
            ).join('');
        } else {
            kinderList.innerHTML = '<span class="no-children">Keine Kinder</span>';
        }
    }

    // NPS (Stars + Survey Meta)
    const npsBadge = document.getElementById('kundenNpsBadge');
    const npsRows = document.getElementById('npsDetailRows');
    const npsSurveyMeta = document.getElementById('npsSurveyMeta');
    const npsDetailSurvey = document.getElementById('npsDetailSurvey');
    if (npsBadge && kunde.nps) {
        npsBadge.innerHTML = renderNpsStars(kunde.nps.score, 'nps-stars-display');
        npsBadge.className = 'nps-stars-display';
        // Survey date + campaign info inline
        if (npsSurveyMeta) {
            npsSurveyMeta.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> ' +
                (kunde.nps.datum || '') + ' &mdash; ' + (kunde.nps.kampagne || '');
        }
        // Popup header with survey info
        if (npsDetailSurvey) {
            npsDetailSurvey.innerHTML = '<span class="nps-survey-date">' + (kunde.nps.datum || '') + '</span>' +
                '<span class="nps-survey-kampagne">' + (kunde.nps.kampagne || '') + '</span>';
        }
        if (npsRows) {
            npsRows.innerHTML = kunde.nps.details.map(d => {
                return `<div class="nps-detail-row">
                    <span class="nps-detail-label">${d.name}</span>
                    ${renderNpsStars(d.wert)}
                </div>`;
            }).join('');
        }
    }
    const npsPopup = document.getElementById('npsDetailPopup');
    if (npsPopup) npsPopup.style.display = 'none';

    // Arbeitgeber + Beschäftigt seit
    const arbeitgeberEl = document.getElementById('kundenArbeitgeber');
    if (arbeitgeberEl) arbeitgeberEl.textContent = kunde.arbeitgeber || '—';
    const beschaeftigtEl = document.getElementById('kundenBeschaeftigtSeit');
    if (beschaeftigtEl) beschaeftigtEl.textContent = kunde.beschaeftigtSeit || '—';

    // Tiere - Badge + Bestätigungs-Button
    const tierHintRow = document.getElementById('tierHintRow');
    const tiereEl = document.getElementById('kundenTiere');
    if (tiereEl) {
        if (kunde.tiere === 'unbekannt') {
            // Hinweise-Badge + Confirm-Button anzeigen (HTML ist bereits im Template)
            if (tierHintRow) tierHintRow.style.display = 'flex';
        } else if (kunde.tiere === 'keine') {
            if (tierHintRow) tierHintRow.style.display = 'none';
            tiereEl.innerHTML = '<span class="tier-none-badge">Keine bekannt</span>';
        } else {
            if (tierHintRow) tierHintRow.style.display = 'none';
            tiereEl.innerHTML = '<span class="tier-known-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><ellipse cx="7" cy="4" rx="2" ry="2.5"/><ellipse cx="17" cy="4" rx="2" ry="2.5"/><ellipse cx="4" cy="10" rx="2" ry="2.5"/><ellipse cx="20" cy="10" rx="2" ry="2.5"/><path d="M12 22c-3 0-7-3-7-7a7 7 0 0114 0c0 4-4 7-7 7z"/></svg> ' +
                kunde.tiere + '</span>';
        }
    }
    // Haustier-Formular initialisieren
    initTierForm();

    // Risikoscore (0-100) mit Tooltip-Erklärung
    const risikoEl = document.getElementById('risikoScoreDisplay');
    if (risikoEl && kunde.risikoscore !== undefined) {
        var rColor = kunde.risikoscore <= 30 ? '#16a34a' : (kunde.risikoscore <= 60 ? '#d97706' : '#dc2626');
        var rLabel = kunde.risikoscore <= 30 ? 'Niedrig' : (kunde.risikoscore <= 60 ? 'Mittel' : 'Hoch');
        var rTooltip = '';
        if (kunde.risikoDetails && kunde.risikoDetails.length > 0) {
            rTooltip = '<div class="risiko-tooltip-trigger" tabindex="0">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>' +
                '<div class="risiko-tooltip-content"><div class="risiko-tooltip-title">Risikofaktoren</div>' +
                kunde.risikoDetails.map(function(d) { return '<div class="risiko-tooltip-item">\u2022 ' + d + '</div>'; }).join('') +
                '</div></div>';
        }
        risikoEl.innerHTML = '<div class="score-bar-track"><div class="score-bar-fill" style="width:' + kunde.risikoscore + '%;background:' + rColor + '"></div></div>' +
            '<span class="score-bar-value" style="color:' + rColor + '">' + kunde.risikoscore + ' <small>(' + rLabel + ')</small></span>' + rTooltip;
    }

    // Bonitätsscore (0-100)
    const bonitaetEl = document.getElementById('bonitaetScoreDisplay');
    if (bonitaetEl && kunde.bonitaetsscore !== undefined) {
        var bColor = kunde.bonitaetsscore >= 70 ? '#16a34a' : (kunde.bonitaetsscore >= 40 ? '#d97706' : '#dc2626');
        var bLabel = kunde.bonitaetsscore >= 70 ? 'Gut' : (kunde.bonitaetsscore >= 40 ? 'Mittel' : 'Schwach');
        bonitaetEl.innerHTML = '<div class="score-bar-track"><div class="score-bar-fill" style="width:' + kunde.bonitaetsscore + '%;background:' + bColor + '"></div></div>' +
            '<span class="score-bar-value" style="color:' + bColor + '">' + kunde.bonitaetsscore + ' <small>(' + bLabel + ')</small></span>';
    }

    // Verträge
    const vertraegeBody = document.getElementById('kundenVertraege');
    if (vertraegeBody) {
        vertraegeBody.innerHTML = kunde.vertraege.map(v => `
            <tr>
                <td><strong>${v.typ}</strong></td>
                <td class="makler-only-col">${versichererLogoImg(v.versicherer, 18)} ${v.versicherer || ''}</td>
                <td>${v.details || ''}</td>
                <td>${v.praemie}</td>
                <td>${v.beginn || ''}</td>
                <td><span class="status-badge aktiv">${v.status}</span></td>
            </tr>
        `).join('');
    }

    // FIDA Verträge (vereinheitlichtes Datenmodell: institut/typ/info/consent/gueltig)
    const fidaBody = document.getElementById('kundenFidaVertraege');
    if (fidaBody) {
        fidaBody.innerHTML = kunde.fidaVertraege.map(v => {
            var institutName = v.institut || v.anbieter || '';
            return `<tr>
                <td>${versichererLogoImg(institutName, 18)} ${institutName}</td>
                <td>${v.typ}</td>
                <td>${v.info}</td>
                <td>${v.consent || '&mdash;'}</td>
                <td>${v.gueltig || '&mdash;'}</td>
            </tr>`;
        }).join('');
    }

    // Schadenhistorie / Leistungen
    const schadenEl = document.getElementById('kundenSchadenhistorie');
    if (schadenEl && kunde.schadenhistorie && kunde.schadenhistorie.length > 0) {
        schadenEl.innerHTML = kunde.schadenhistorie.map(function(s) {
            var statusClass = s.status === 'Reguliert' ? 'reguliert' : (s.status === 'Offen' ? 'offen' : 'abgelehnt');
            return '<tr>' +
                '<td>' + s.datum + '</td>' +
                '<td><strong>' + s.sparte + '</strong></td>' +
                '<td>' + s.beschreibung + '</td>' +
                '<td><span class="schaden-status-badge ' + statusClass + '">' + s.status + '</span></td>' +
                '<td class="text-right">' + s.betrag + '</td>' +
                '<td>' + versichererLogoImg(s.versicherer, 16) + ' ' + s.versicherer + '</td>' +
                '</tr>';
        }).join('');
        var schadenCard = document.getElementById('schadenhistorieCard');
        if (schadenCard) schadenCard.style.display = '';
    } else {
        var schadenCard = document.getElementById('schadenhistorieCard');
        if (schadenCard) schadenCard.style.display = 'none';
    }

    // CLV berechnen und rendern
    const clvResult = calculateCLV(kunde.vertraege, kundenName);
    if (clvResult) {
        renderCLV(clvResult);
    }

    // Kunde Sticky Bar aktualisieren
    var clvStr = clvResult ? formatEuroCLV(clvResult.gesamtCLV) : '\u2014';
    var segStr = clvResult ? clvResult.segment : '\u2014';
    updateKundeStickyBar(kundenName, vermittlerId, kunde.nps, clvStr, segStr);

    // Versicherer-Auswahl auf Kunden-Detail übertragen
    if (typeof updateKundenDetailInsurer === 'function') {
        setTimeout(updateKundenDetailInsurer, 50);
    }
}

window.__registerModule('kunden-detail-data.js');

