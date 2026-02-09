/**
 * Kunden-Erweiterung - Extended Customer Data & Functions
 * Adds: Transaktionen, Scoring, NPS, Deckungsquoten
 * Extends: A-02 (Agenturansicht) and A-10 (Kundendetail)
 */

// ========================================
// EXTENDED CUSTOMER DATA MODEL
// ========================================

const mockKundenErweiterung = {
    'Peter Schmidt': {
        transaktionen: [
            { datum: '2025-12-15', typ: 'Eingang', beschreibung: 'Gehalt TechCorp GmbH', betrag: 3834, kategorie: 'Gehalt' },
            { datum: '2025-12-10', typ: 'Ausgang', beschreibung: 'Miete Musterstraße 123', betrag: -1200, kategorie: 'Wohnen' },
            { datum: '2025-12-05', typ: 'Ausgang', beschreibung: 'ERGO BU-Versicherung', betrag: -89, kategorie: 'Versicherung' },
            { datum: '2025-12-03', typ: 'Ausgang', beschreibung: 'DWS Sparplan', betrag: -800, kategorie: 'Sparen' },
            { datum: '2025-12-01', typ: 'Ausgang', beschreibung: 'VHV Wohngebäude', betrag: -37.50, kategorie: 'Versicherung' },
            { datum: '2025-11-28', typ: 'Ausgang', beschreibung: 'Sparkasse Hypothek', betrag: -1150, kategorie: 'Kredit' },
            { datum: '2025-11-25', typ: 'Eingang', beschreibung: 'Kindergeld', betrag: 500, kategorie: 'Staatlich' },
            { datum: '2025-11-20', typ: 'Ausgang', beschreibung: 'REWE Lebensmittel', betrag: -245, kategorie: 'Lebenshaltung' }
        ],
        scoring: {
            bonitaet: 82,
            zahlungsmoral: 95,
            vertragshistorie: 88,
            schadensquote: 15,
            risikoklasse: 'A',
            schufa: 'Sehr gut (Score: 97,3%)',
            letztePruefung: '15.11.2025'
        },
        nps: {
            score: 9,
            kategorie: 'Promoter',
            letzteUmfrage: '01.12.2025',
            kommentar: 'Sehr zufrieden mit der Beratung, insbesondere bei der BU-Absicherung.'
        },
        deckungsquoten: {
            leben: { ist: 150000, soll: 300000, quote: 50 },
            bu: { ist: 1500, soll: 2500, quote: 60 },
            haftpflicht: { ist: 0, soll: 50000000, quote: 0 },
            hausrat: { ist: 0, soll: 65000, quote: 0 },
            wohngebaeude: { ist: 450000, soll: 450000, quote: 100 },
            kfz: { ist: 0, soll: 1, quote: 0 },
            rechtsschutz: { ist: 0, soll: 1, quote: 0 },
            unfall: { ist: 0, soll: 150000, quote: 0 }
        }
    },
    'Sabine König': {
        transaktionen: [
            { datum: '2025-12-15', typ: 'Eingang', beschreibung: 'Gehalt Land Hessen', betrag: 3200, kategorie: 'Gehalt' },
            { datum: '2025-12-10', typ: 'Ausgang', beschreibung: 'Miete Lindenweg 7', betrag: -950, kategorie: 'Wohnen' },
            { datum: '2025-12-05', typ: 'Ausgang', beschreibung: 'ERGO Risikoleben', betrag: -18, kategorie: 'Versicherung' },
            { datum: '2025-12-04', typ: 'Ausgang', beschreibung: 'ERGO BU-Versicherung', betrag: -95, kategorie: 'Versicherung' },
            { datum: '2025-12-01', typ: 'Ausgang', beschreibung: 'Unterhalt Max', betrag: -450, kategorie: 'Familie' },
            { datum: '2025-11-28', typ: 'Eingang', beschreibung: 'Kindergeld', betrag: 250, kategorie: 'Staatlich' }
        ],
        scoring: {
            bonitaet: 75,
            zahlungsmoral: 90,
            vertragshistorie: 92,
            schadensquote: 8,
            risikoklasse: 'A',
            schufa: 'Gut (Score: 94,1%)',
            letztePruefung: '20.10.2025'
        },
        nps: {
            score: 8,
            kategorie: 'Promoter',
            letzteUmfrage: '15.11.2025',
            kommentar: 'Gute Betreuung, schnelle Reaktion bei Rückfragen.'
        },
        deckungsquoten: {
            leben: { ist: 150000, soll: 200000, quote: 75 },
            bu: { ist: 1800, soll: 2000, quote: 90 },
            haftpflicht: { ist: 0, soll: 50000000, quote: 0 },
            hausrat: { ist: 0, soll: 45000, quote: 0 },
            wohngebaeude: { ist: 0, soll: 0, quote: 100 },
            kfz: { ist: 0, soll: 1, quote: 0 },
            rechtsschutz: { ist: 0, soll: 1, quote: 0 },
            unfall: { ist: 100000, soll: 100000, quote: 100 }
        }
    },
    'Thomas Weber': {
        transaktionen: [
            { datum: '2025-12-15', typ: 'Eingang', beschreibung: 'Gehalt SAP SE', betrag: 4500, kategorie: 'Gehalt' },
            { datum: '2025-12-12', typ: 'Ausgang', beschreibung: 'Miete Bergstraße 22', betrag: -1400, kategorie: 'Wohnen' },
            { datum: '2025-12-10', typ: 'Ausgang', beschreibung: 'Trade Republic ETF', betrag: -500, kategorie: 'Sparen' },
            { datum: '2025-12-05', typ: 'Ausgang', beschreibung: 'Scalable Capital', betrag: -300, kategorie: 'Sparen' },
            { datum: '2025-12-01', typ: 'Ausgang', beschreibung: 'ERGO Haftpflicht', betrag: -5.42, kategorie: 'Versicherung' }
        ],
        scoring: {
            bonitaet: 88,
            zahlungsmoral: 98,
            vertragshistorie: 45,
            schadensquote: 0,
            risikoklasse: 'A+',
            schufa: 'Sehr gut (Score: 98,2%)',
            letztePruefung: '05.12.2025'
        },
        nps: {
            score: 6,
            kategorie: 'Passiv',
            letzteUmfrage: '01.10.2025',
            kommentar: 'Kaum Kontakt, nur eine Police. Könnte mehr Beratung gebrauchen.'
        },
        deckungsquoten: {
            leben: { ist: 0, soll: 0, quote: 100 },
            bu: { ist: 0, soll: 2800, quote: 0 },
            haftpflicht: { ist: 50000000, soll: 50000000, quote: 100 },
            hausrat: { ist: 0, soll: 40000, quote: 0 },
            wohngebaeude: { ist: 0, soll: 0, quote: 100 },
            kfz: { ist: 0, soll: 1, quote: 0 },
            rechtsschutz: { ist: 0, soll: 1, quote: 0 },
            unfall: { ist: 0, soll: 100000, quote: 0 }
        }
    },
    'Anna Hoffmann': {
        transaktionen: [
            { datum: '2025-12-15', typ: 'Eingang', beschreibung: 'Gehalt Marketing AG', betrag: 3600, kategorie: 'Gehalt' },
            { datum: '2025-12-14', typ: 'Eingang', beschreibung: 'Elterngeld', betrag: 800, kategorie: 'Staatlich' },
            { datum: '2025-12-10', typ: 'Ausgang', beschreibung: 'Miete Rosenstraße', betrag: -1100, kategorie: 'Wohnen' },
            { datum: '2025-12-05', typ: 'Ausgang', beschreibung: 'ERGO Risikoleben', betrag: -25, kategorie: 'Versicherung' },
            { datum: '2025-12-04', typ: 'Ausgang', beschreibung: 'Alte Leipziger BU', betrag: -110, kategorie: 'Versicherung' },
            { datum: '2025-12-01', typ: 'Ausgang', beschreibung: 'Consorsbank Kindersparen', betrag: -200, kategorie: 'Sparen' }
        ],
        scoring: {
            bonitaet: 79,
            zahlungsmoral: 92,
            vertragshistorie: 85,
            schadensquote: 5,
            risikoklasse: 'A',
            schufa: 'Gut (Score: 95,0%)',
            letztePruefung: '01.11.2025'
        },
        nps: {
            score: 10,
            kategorie: 'Promoter',
            letzteUmfrage: '20.11.2025',
            kommentar: 'Hervorragende Beratung! Besonders die Absicherung für die Familie war top.'
        },
        deckungsquoten: {
            leben: { ist: 300000, soll: 300000, quote: 100 },
            bu: { ist: 2000, soll: 2200, quote: 91 },
            haftpflicht: { ist: 0, soll: 50000000, quote: 0 },
            hausrat: { ist: 0, soll: 55000, quote: 0 },
            wohngebaeude: { ist: 0, soll: 0, quote: 100 },
            kfz: { ist: 0, soll: 1, quote: 0 },
            rechtsschutz: { ist: 0, soll: 1, quote: 0 },
            unfall: { ist: 0, soll: 120000, quote: 0 }
        }
    },
    'Michael Braun': {
        transaktionen: [
            { datum: '2025-12-15', typ: 'Eingang', beschreibung: 'Geschäftsführergehalt', betrag: 8500, kategorie: 'Gehalt' },
            { datum: '2025-12-12', typ: 'Ausgang', beschreibung: 'Hypothek Deutsche Bank', betrag: -2200, kategorie: 'Kredit' },
            { datum: '2025-12-10', typ: 'Ausgang', beschreibung: 'ERGO BU-Versicherung', betrag: -220, kategorie: 'Versicherung' },
            { datum: '2025-12-08', typ: 'Ausgang', beschreibung: 'Deka Sparplan', betrag: -1500, kategorie: 'Sparen' },
            { datum: '2025-12-05', typ: 'Ausgang', beschreibung: 'Axa Wohngebäude', betrag: -56.67, kategorie: 'Versicherung' },
            { datum: '2025-12-03', typ: 'Ausgang', beschreibung: 'ERGO Rechtsschutz', betrag: -31.67, kategorie: 'Versicherung' },
            { datum: '2025-12-01', typ: 'Eingang', beschreibung: 'Mieteinnahmen', betrag: 1200, kategorie: 'Vermietung' }
        ],
        scoring: {
            bonitaet: 92,
            zahlungsmoral: 99,
            vertragshistorie: 95,
            schadensquote: 12,
            risikoklasse: 'A+',
            schufa: 'Ausgezeichnet (Score: 99,1%)',
            letztePruefung: '10.12.2025'
        },
        nps: {
            score: 8,
            kategorie: 'Promoter',
            letzteUmfrage: '05.12.2025',
            kommentar: 'Langjährig zufrieden. Gute Betreuung im Schadensfall.'
        },
        deckungsquoten: {
            leben: { ist: 0, soll: 500000, quote: 0 },
            bu: { ist: 3500, soll: 5000, quote: 70 },
            haftpflicht: { ist: 0, soll: 50000000, quote: 0 },
            hausrat: { ist: 0, soll: 120000, quote: 0 },
            wohngebaeude: { ist: 750000, soll: 750000, quote: 100 },
            kfz: { ist: 0, soll: 1, quote: 0 },
            rechtsschutz: { ist: 1, soll: 1, quote: 100 },
            unfall: { ist: 0, soll: 200000, quote: 0 }
        }
    },
    'Lisa Müller': {
        transaktionen: [
            { datum: '2025-12-15', typ: 'Eingang', beschreibung: 'Gehalt Klinikum Hamburg', betrag: 3400, kategorie: 'Gehalt' },
            { datum: '2025-12-12', typ: 'Eingang', beschreibung: 'Bereitschaftsdienst', betrag: 650, kategorie: 'Gehalt' },
            { datum: '2025-12-10', typ: 'Ausgang', beschreibung: 'Miete Parkallee 5', betrag: -1100, kategorie: 'Wohnen' },
            { datum: '2025-12-05', typ: 'Ausgang', beschreibung: 'ERGO BU-Versicherung', betrag: -145, kategorie: 'Versicherung' },
            { datum: '2025-12-03', typ: 'Ausgang', beschreibung: 'KfW Studienkredit', betrag: -350, kategorie: 'Kredit' },
            { datum: '2025-12-01', typ: 'Ausgang', beschreibung: 'ING Tagesgeld', betrag: -500, kategorie: 'Sparen' }
        ],
        scoring: {
            bonitaet: 72,
            zahlungsmoral: 88,
            vertragshistorie: 60,
            schadensquote: 0,
            risikoklasse: 'B+',
            schufa: 'Gut (Score: 91,5%)',
            letztePruefung: '25.11.2025'
        },
        nps: {
            score: 7,
            kategorie: 'Passiv',
            letzteUmfrage: '10.11.2025',
            kommentar: 'Zufrieden, aber mehr Angebote für Ärzte wären gut.'
        },
        deckungsquoten: {
            leben: { ist: 0, soll: 0, quote: 100 },
            bu: { ist: 2500, soll: 2500, quote: 100 },
            haftpflicht: { ist: 0, soll: 50000000, quote: 0 },
            hausrat: { ist: 0, soll: 35000, quote: 0 },
            wohngebaeude: { ist: 0, soll: 0, quote: 100 },
            kfz: { ist: 0, soll: 1, quote: 0 },
            rechtsschutz: { ist: 0, soll: 1, quote: 0 },
            unfall: { ist: 0, soll: 100000, quote: 0 }
        }
    },
    'Klaus Meier': {
        transaktionen: [
            { datum: '2025-12-15', typ: 'Eingang', beschreibung: 'Einnahmen Handwerksbetrieb', betrag: 5200, kategorie: 'Gehalt' },
            { datum: '2025-12-10', typ: 'Ausgang', beschreibung: 'Hypothek Commerzbank', betrag: -1400, kategorie: 'Kredit' },
            { datum: '2025-12-08', typ: 'Ausgang', beschreibung: 'ERGO Betriebshaftpflicht', betrag: -74.17, kategorie: 'Versicherung' },
            { datum: '2025-12-05', typ: 'Ausgang', beschreibung: 'Nürnberger BU', betrag: -135, kategorie: 'Versicherung' },
            { datum: '2025-12-03', typ: 'Ausgang', beschreibung: 'Union Invest Riester', betrag: -175, kategorie: 'Sparen' },
            { datum: '2025-12-01', typ: 'Eingang', beschreibung: 'Kindergeld', betrag: 500, kategorie: 'Staatlich' }
        ],
        scoring: {
            bonitaet: 68,
            zahlungsmoral: 85,
            vertragshistorie: 78,
            schadensquote: 22,
            risikoklasse: 'B',
            schufa: 'Befriedigend (Score: 88,7%)',
            letztePruefung: '01.12.2025'
        },
        nps: {
            score: 8,
            kategorie: 'Promoter',
            letzteUmfrage: '20.12.2025',
            kommentar: 'Guter Service, besonders bei der Betriebshaftpflicht.'
        },
        deckungsquoten: {
            leben: { ist: 0, soll: 350000, quote: 0 },
            bu: { ist: 2000, soll: 3000, quote: 67 },
            haftpflicht: { ist: 5000000, soll: 5000000, quote: 100 },
            hausrat: { ist: 0, soll: 60000, quote: 0 },
            wohngebaeude: { ist: 0, soll: 380000, quote: 0 },
            kfz: { ist: 0, soll: 1, quote: 0 },
            rechtsschutz: { ist: 0, soll: 1, quote: 0 },
            unfall: { ist: 0, soll: 150000, quote: 0 }
        }
    },
    'Matthias Engel': {
        transaktionen: [
            { datum: '2025-12-15', typ: 'Eingang', beschreibung: 'Gehalt IT-Beratung', betrag: 4200, kategorie: 'Gehalt' },
            { datum: '2025-12-10', typ: 'Ausgang', beschreibung: 'Miete Schillerstraße', betrag: -1050, kategorie: 'Wohnen' },
            { datum: '2025-12-08', typ: 'Ausgang', beschreibung: 'Allianz BU-Versicherung', betrag: -75, kategorie: 'Versicherung' },
            { datum: '2025-12-05', typ: 'Ausgang', beschreibung: 'ERGO Haftpflicht', betrag: -7.08, kategorie: 'Versicherung' },
            { datum: '2025-12-03', typ: 'Ausgang', beschreibung: 'ING ETF-Sparplan', betrag: -400, kategorie: 'Sparen' },
            { datum: '2025-12-01', typ: 'Eingang', beschreibung: 'Kindergeld', betrag: 500, kategorie: 'Staatlich' }
        ],
        scoring: {
            bonitaet: 80,
            zahlungsmoral: 93,
            vertragshistorie: 70,
            schadensquote: 10,
            risikoklasse: 'A',
            schufa: 'Gut (Score: 93,8%)',
            letztePruefung: '15.11.2025'
        },
        nps: {
            score: 5,
            kategorie: 'Detraktor',
            letzteUmfrage: '01.11.2025',
            kommentar: 'BU-Deckung reicht nicht aus, wurde nie darauf hingewiesen.'
        },
        deckungsquoten: {
            leben: { ist: 0, soll: 300000, quote: 0 },
            bu: { ist: 1200, soll: 2600, quote: 46 },
            haftpflicht: { ist: 50000000, soll: 50000000, quote: 100 },
            hausrat: { ist: 0, soll: 50000, quote: 0 },
            wohngebaeude: { ist: 0, soll: 0, quote: 100 },
            kfz: { ist: 0, soll: 1, quote: 0 },
            rechtsschutz: { ist: 0, soll: 1, quote: 0 },
            unfall: { ist: 0, soll: 120000, quote: 0 }
        }
    },
    'Christian Bauer': {
        transaktionen: [
            { datum: '2025-12-15', typ: 'Eingang', beschreibung: 'Gehalt Beratung GmbH', betrag: 3800, kategorie: 'Gehalt' },
            { datum: '2025-12-10', typ: 'Ausgang', beschreibung: 'Miete Königsallee', betrag: -1350, kategorie: 'Wohnen' },
            { datum: '2025-12-08', typ: 'Ausgang', beschreibung: 'ERGO Rechtsschutz', betrag: -23.33, kategorie: 'Versicherung' },
            { datum: '2025-12-05', typ: 'Ausgang', beschreibung: 'Trade Republic', betrag: -600, kategorie: 'Sparen' },
            { datum: '2025-12-01', typ: 'Ausgang', beschreibung: 'Netflix/Spotify', betrag: -28, kategorie: 'Freizeit' }
        ],
        scoring: {
            bonitaet: 85,
            zahlungsmoral: 96,
            vertragshistorie: 40,
            schadensquote: 0,
            risikoklasse: 'A',
            schufa: 'Sehr gut (Score: 96,5%)',
            letztePruefung: '08.12.2025'
        },
        nps: {
            score: 4,
            kategorie: 'Detraktor',
            letzteUmfrage: '15.10.2025',
            kommentar: 'Fühle mich nicht ausreichend beraten. Keine BU, keine Altersvorsorge.'
        },
        deckungsquoten: {
            leben: { ist: 0, soll: 0, quote: 100 },
            bu: { ist: 0, soll: 2400, quote: 0 },
            haftpflicht: { ist: 0, soll: 50000000, quote: 0 },
            hausrat: { ist: 0, soll: 45000, quote: 0 },
            wohngebaeude: { ist: 0, soll: 0, quote: 100 },
            kfz: { ist: 0, soll: 1, quote: 0 },
            rechtsschutz: { ist: 1, soll: 1, quote: 100 },
            unfall: { ist: 0, soll: 100000, quote: 0 }
        }
    },
    'Martin Wolf': {
        transaktionen: [
            { datum: '2025-12-15', typ: 'Eingang', beschreibung: 'Gehalt Dachdeckerbetrieb', betrag: 3200, kategorie: 'Gehalt' },
            { datum: '2025-12-10', typ: 'Ausgang', beschreibung: 'Hypothek Volksbank', betrag: -980, kategorie: 'Kredit' },
            { datum: '2025-12-08', typ: 'Ausgang', beschreibung: 'ERGO Unfallversicherung', betrag: -26.67, kategorie: 'Versicherung' },
            { datum: '2025-12-05', typ: 'Ausgang', beschreibung: 'VHV Wohngebäude', betrag: -43.33, kategorie: 'Versicherung' },
            { datum: '2025-12-03', typ: 'Ausgang', beschreibung: 'LBS Bausparvertrag', betrag: -200, kategorie: 'Sparen' },
            { datum: '2025-12-01', typ: 'Eingang', beschreibung: 'Kindergeld', betrag: 750, kategorie: 'Staatlich' }
        ],
        scoring: {
            bonitaet: 65,
            zahlungsmoral: 82,
            vertragshistorie: 72,
            schadensquote: 28,
            risikoklasse: 'B',
            schufa: 'Befriedigend (Score: 86,4%)',
            letztePruefung: '20.11.2025'
        },
        nps: {
            score: 7,
            kategorie: 'Passiv',
            letzteUmfrage: '01.12.2025',
            kommentar: 'Grundsätzlich zufrieden, aber BU fehlt komplett trotz Hochrisiko-Beruf.'
        },
        deckungsquoten: {
            leben: { ist: 0, soll: 400000, quote: 0 },
            bu: { ist: 0, soll: 2000, quote: 0 },
            haftpflicht: { ist: 0, soll: 50000000, quote: 0 },
            hausrat: { ist: 0, soll: 55000, quote: 0 },
            wohngebaeude: { ist: 380000, soll: 380000, quote: 100 },
            kfz: { ist: 0, soll: 1, quote: 0 },
            rechtsschutz: { ist: 0, soll: 1, quote: 0 },
            unfall: { ist: 150000, soll: 150000, quote: 100 }
        }
    },
    'Eva Hartmann': {
        transaktionen: [
            { datum: '2025-12-20', typ: 'Eingang', beschreibung: 'Projekt MediaHaus GmbH', betrag: 2800, kategorie: 'Gehalt' },
            { datum: '2025-12-15', typ: 'Eingang', beschreibung: 'Projekt StartUp AG', betrag: 1500, kategorie: 'Gehalt' },
            { datum: '2025-12-10', typ: 'Ausgang', beschreibung: 'Miete Kunststraße 33', betrag: -900, kategorie: 'Wohnen' },
            { datum: '2025-12-05', typ: 'Ausgang', beschreibung: 'ERGO BU-Versicherung', betrag: -68, kategorie: 'Versicherung' },
            { datum: '2025-12-03', typ: 'Ausgang', beschreibung: 'Hiscox Betriebshaftpflicht', betrag: -24.17, kategorie: 'Versicherung' },
            { datum: '2025-12-01', typ: 'Ausgang', beschreibung: 'KfW Gründerkredit', betrag: -280, kategorie: 'Kredit' },
            { datum: '2025-11-28', typ: 'Eingang', beschreibung: 'Kindergeld', betrag: 250, kategorie: 'Staatlich' }
        ],
        scoring: {
            bonitaet: 62,
            zahlungsmoral: 80,
            vertragshistorie: 65,
            schadensquote: 5,
            risikoklasse: 'B',
            schufa: 'Befriedigend (Score: 87,2%)',
            letztePruefung: '10.12.2025'
        },
        nps: {
            score: 9,
            kategorie: 'Promoter',
            letzteUmfrage: '05.12.2025',
            kommentar: 'Tolle Beratung für Selbstständige! BU-Aufstockung wurde empfohlen.'
        },
        deckungsquoten: {
            leben: { ist: 0, soll: 200000, quote: 0 },
            bu: { ist: 1000, soll: 2000, quote: 50 },
            haftpflicht: { ist: 2000000, soll: 5000000, quote: 40 },
            hausrat: { ist: 0, soll: 35000, quote: 0 },
            wohngebaeude: { ist: 0, soll: 0, quote: 100 },
            kfz: { ist: 0, soll: 1, quote: 0 },
            rechtsschutz: { ist: 0, soll: 1, quote: 0 },
            unfall: { ist: 0, soll: 100000, quote: 0 }
        }
    }
};

// Make globally accessible
window.mockKundenErweiterung = mockKundenErweiterung;


// ========================================
// A-10: TRANSACTION INSIGHTS
// ========================================

function detectTransactionInsights(kundenName) {
    const erw = mockKundenErweiterung[kundenName];
    if (!erw) return [];

    const insights = [];
    const trans = erw.transaktionen;

    // Check for high savings rate
    const gehalt = trans.filter(t => t.kategorie === 'Gehalt').reduce((s, t) => s + t.betrag, 0);
    const ausgaben = trans.filter(t => t.betrag < 0).reduce((s, t) => s + Math.abs(t.betrag), 0);
    const sparquote = gehalt > 0 ? ((gehalt - ausgaben) / gehalt * 100) : 0;

    if (sparquote > 20) {
        insights.push({
            typ: 'positiv',
            titel: 'Hohe Sparquote erkannt',
            text: `Sparquote von ${sparquote.toFixed(0)}% - Potenzial für Altersvorsorge oder Vermögensaufbau.`,
            prioritaet: 'mittel'
        });
    }

    // Check for missing insurance payments (indicates no coverage)
    const versicherungsAusgaben = trans.filter(t => t.kategorie === 'Versicherung');
    if (versicherungsAusgaben.length <= 1) {
        insights.push({
            typ: 'warnung',
            titel: 'Geringe Versicherungsabdeckung',
            text: 'Nur wenige Versicherungszahlungen erkannt. Bedarfsanalyse empfohlen.',
            prioritaet: 'hoch'
        });
    }

    // Check for credit payments
    const kreditZahlungen = trans.filter(t => t.kategorie === 'Kredit');
    if (kreditZahlungen.length > 0) {
        const monatlicheKreditRate = kreditZahlungen.reduce((s, t) => s + Math.abs(t.betrag), 0);
        insights.push({
            typ: 'info',
            titel: 'Kreditverpflichtungen',
            text: `Monatliche Kreditrate: €${monatlicheKreditRate.toFixed(0)} - Restschuldversicherung prüfen.`,
            prioritaet: 'mittel'
        });
    }

    // Check for high investment activity
    const sparAusgaben = trans.filter(t => t.kategorie === 'Sparen');
    if (sparAusgaben.length >= 2) {
        const monatlicheSparrate = sparAusgaben.reduce((s, t) => s + Math.abs(t.betrag), 0);
        insights.push({
            typ: 'positiv',
            titel: 'Aktiver Sparer',
            text: `Sparrate: €${monatlicheSparrate.toFixed(0)}/Mon. - Fondspolice oder steueroptimierte Anlage empfehlen.`,
            prioritaet: 'mittel'
        });
    }

    return insights;
}

window.detectTransactionInsights = detectTransactionInsights;


// ========================================
// A-10: SCORING FUNCTIONS
// ========================================

function calculateBonitaetsScore(kundenName) {
    const erw = mockKundenErweiterung[kundenName];
    if (!erw || !erw.scoring) return null;

    const s = erw.scoring;
    // Weighted average
    const score = Math.round(
        s.bonitaet * 0.3 +
        s.zahlungsmoral * 0.25 +
        s.vertragshistorie * 0.2 +
        (100 - s.schadensquote) * 0.25
    );

    return {
        gesamtScore: score,
        details: s,
        bewertung: score >= 85 ? 'Ausgezeichnet' : score >= 70 ? 'Gut' : score >= 55 ? 'Befriedigend' : 'Verbesserungswürdig'
    };
}

window.calculateBonitaetsScore = calculateBonitaetsScore;


function calculateRisikoScore(kundenName) {
    const erw = mockKundenErweiterung[kundenName];
    if (!erw || !erw.deckungsquoten) return null;

    const dq = erw.deckungsquoten;
    const quoten = Object.values(dq).map(d => d.quote);
    const avgQuote = quoten.reduce((s, q) => s + q, 0) / quoten.length;
    const unterdeckt = quoten.filter(q => q < 50).length;

    return {
        durchschnittlicheDeckung: Math.round(avgQuote),
        unterdeckteSparten: unterdeckt,
        gesamtSparten: quoten.length,
        risiko: avgQuote < 40 ? 'Hoch' : avgQuote < 65 ? 'Mittel' : 'Niedrig'
    };
}

window.calculateRisikoScore = calculateRisikoScore;


function generateNPSRecommendation(kundenName) {
    const erw = mockKundenErweiterung[kundenName];
    if (!erw || !erw.nps) return null;

    const nps = erw.nps;
    let empfehlung = '';

    if (nps.score <= 6) {
        empfehlung = 'Dringend: Persönliches Gespräch vereinbaren. Unzufriedenheit adressieren und Bedarfsanalyse durchführen.';
    } else if (nps.score <= 8) {
        empfehlung = 'Cross-Selling-Potenzial: Zufriedener Kunde, der für weitere Produkte offen sein könnte.';
    } else {
        empfehlung = 'Weiterempfehlung nutzen: Kunde ist begeistert - aktiv nach Empfehlungen fragen.';
    }

    return {
        ...nps,
        empfehlung
    };
}

window.generateNPSRecommendation = generateNPSRecommendation;


// ========================================
// A-10: TAB FILL FUNCTIONS
// ========================================

function fillKundenUebersichtTab(kundenName) {
    const erw = mockKundenErweiterung[kundenName];
    if (!erw) return;

    const container = document.getElementById('tabUebersicht');
    if (!container) return;

    const bonitaet = calculateBonitaetsScore(kundenName);
    const risiko = calculateRisikoScore(kundenName);
    const npsData = generateNPSRecommendation(kundenName);
    const insights = detectTransactionInsights(kundenName);

    // Calculate totals from transactions
    const gehalt = erw.transaktionen.filter(t => t.betrag > 0).reduce((s, t) => s + t.betrag, 0);
    const ausgaben = erw.transaktionen.filter(t => t.betrag < 0).reduce((s, t) => s + Math.abs(t.betrag), 0);

    container.innerHTML = `
        <div class="kunden-uebersicht-grid">
            <div class="kunden-card uebersicht-metrics-card">
                <div class="kunden-card-header">
                    <h2>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                            <rect x="3" y="3" width="7" height="7"></rect>
                            <rect x="14" y="3" width="7" height="7"></rect>
                            <rect x="14" y="14" width="7" height="7"></rect>
                            <rect x="3" y="14" width="7" height="7"></rect>
                        </svg>
                        Kunden-Schnellübersicht
                    </h2>
                </div>
                <div class="uebersicht-kpi-grid">
                    <div class="uebersicht-kpi">
                        <span class="uebersicht-kpi-value">${bonitaet ? bonitaet.gesamtScore : '-'}</span>
                        <span class="uebersicht-kpi-label">Bonitätsscore</span>
                        <span class="uebersicht-kpi-sub ${bonitaet && bonitaet.gesamtScore >= 70 ? 'positive' : 'negative'}">${bonitaet ? bonitaet.bewertung : '-'}</span>
                    </div>
                    <div class="uebersicht-kpi">
                        <span class="uebersicht-kpi-value">${risiko ? risiko.durchschnittlicheDeckung + '%' : '-'}</span>
                        <span class="uebersicht-kpi-label">Deckungsquote</span>
                        <span class="uebersicht-kpi-sub ${risiko && risiko.durchschnittlicheDeckung >= 50 ? 'positive' : 'negative'}">${risiko ? risiko.risiko + ' Risiko' : '-'}</span>
                    </div>
                    <div class="uebersicht-kpi">
                        <span class="uebersicht-kpi-value nps-${npsData ? npsData.kategorie.toLowerCase() : ''}">${npsData ? npsData.score : '-'}</span>
                        <span class="uebersicht-kpi-label">NPS Score</span>
                        <span class="uebersicht-kpi-sub">${npsData ? npsData.kategorie : '-'}</span>
                    </div>
                    <div class="uebersicht-kpi">
                        <span class="uebersicht-kpi-value">€${gehalt.toLocaleString('de-DE')}</span>
                        <span class="uebersicht-kpi-label">Monatl. Einnahmen</span>
                        <span class="uebersicht-kpi-sub">Frei: €${(gehalt - ausgaben).toLocaleString('de-DE')}</span>
                    </div>
                </div>
            </div>

            <div class="kunden-card uebersicht-insights-card">
                <div class="kunden-card-header">
                    <h2>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                        </svg>
                        KI-Insights
                    </h2>
                </div>
                <div class="uebersicht-insights-list">
                    ${insights.map(i => `
                        <div class="uebersicht-insight ${i.typ}">
                            <span class="insight-badge ${i.prioritaet}">${i.prioritaet === 'hoch' ? 'Hoch' : 'Mittel'}</span>
                            <strong>${i.titel}</strong>
                            <p>${i.text}</p>
                        </div>
                    `).join('')}
                    ${insights.length === 0 ? '<p class="no-insights">Keine besonderen Auffälligkeiten erkannt.</p>' : ''}
                </div>
            </div>

            <div class="kunden-card uebersicht-deckung-card">
                <div class="kunden-card-header">
                    <h2>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                        </svg>
                        Deckungsübersicht
                    </h2>
                </div>
                <div class="deckung-mini-bars">
                    ${Object.entries(erw.deckungsquoten).map(([key, val]) => `
                        <div class="deckung-mini-bar">
                            <span class="deckung-mini-label">${formatDeckungName(key)}</span>
                            <div class="deckung-mini-track">
                                <div class="deckung-mini-fill ${val.quote >= 80 ? 'good' : val.quote >= 40 ? 'warn' : 'bad'}" style="width: ${Math.min(val.quote, 100)}%"></div>
                            </div>
                            <span class="deckung-mini-value">${val.quote}%</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

window.fillKundenUebersichtTab = fillKundenUebersichtTab;


function fillTransaktionenTab(kundenName) {
    const erw = mockKundenErweiterung[kundenName];
    if (!erw) return;

    const container = document.getElementById('tabBanktransaktionen');
    if (!container) return;

    const trans = erw.transaktionen;
    const einnahmen = trans.filter(t => t.betrag > 0).reduce((s, t) => s + t.betrag, 0);
    const ausgaben = trans.filter(t => t.betrag < 0).reduce((s, t) => s + Math.abs(t.betrag), 0);

    // Group by category
    const kategorien = {};
    trans.filter(t => t.betrag < 0).forEach(t => {
        if (!kategorien[t.kategorie]) kategorien[t.kategorie] = 0;
        kategorien[t.kategorie] += Math.abs(t.betrag);
    });

    container.innerHTML = `
        <div class="kunden-card">
            <div class="kunden-card-header">
                <h2>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                        <line x1="1" y1="10" x2="23" y2="10"></line>
                    </svg>
                    Banktransaktionen
                </h2>
                <span class="fida-source-badge small">Open Finance</span>
            </div>

            <div class="transaktionen-summary">
                <div class="trans-summary-item einnahmen">
                    <span class="trans-summary-label">Einnahmen</span>
                    <span class="trans-summary-value">€${einnahmen.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</span>
                </div>
                <div class="trans-summary-item ausgaben">
                    <span class="trans-summary-label">Ausgaben</span>
                    <span class="trans-summary-value">€${ausgaben.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</span>
                </div>
                <div class="trans-summary-item saldo">
                    <span class="trans-summary-label">Saldo</span>
                    <span class="trans-summary-value ${einnahmen - ausgaben >= 0 ? 'positive' : 'negative'}">€${(einnahmen - ausgaben).toLocaleString('de-DE', { minimumFractionDigits: 2 })}</span>
                </div>
            </div>

            <div class="transaktionen-kategorien">
                <h3>Ausgaben nach Kategorie</h3>
                <div class="kategorie-bars">
                    ${Object.entries(kategorien).sort((a, b) => b[1] - a[1]).map(([kat, betrag]) => `
                        <div class="kategorie-bar-item">
                            <span class="kategorie-bar-label">${kat}</span>
                            <div class="kategorie-bar-track">
                                <div class="kategorie-bar-fill" style="width: ${(betrag / ausgaben * 100).toFixed(0)}%"></div>
                            </div>
                            <span class="kategorie-bar-value">€${betrag.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</span>
                        </div>
                    `).join('')}
                </div>
            </div>

            <table class="kunden-table">
                <thead>
                    <tr>
                        <th>Datum</th>
                        <th>Typ</th>
                        <th>Beschreibung</th>
                        <th>Kategorie</th>
                        <th>Betrag</th>
                    </tr>
                </thead>
                <tbody>
                    ${trans.map(t => `
                        <tr>
                            <td>${new Date(t.datum).toLocaleDateString('de-DE')}</td>
                            <td><span class="trans-typ-badge ${t.typ.toLowerCase()}">${t.typ}</span></td>
                            <td>${t.beschreibung}</td>
                            <td><span class="trans-kat-badge">${t.kategorie}</span></td>
                            <td class="${t.betrag >= 0 ? 'positive' : 'negative'}">€${t.betrag.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

window.fillTransaktionenTab = fillTransaktionenTab;


function fillScoringTab(kundenName) {
    const erw = mockKundenErweiterung[kundenName];
    if (!erw) return;

    const container = document.getElementById('tabScoring');
    if (!container) return;

    const bonitaet = calculateBonitaetsScore(kundenName);
    const npsData = generateNPSRecommendation(kundenName);
    const s = erw.scoring;

    container.innerHTML = `
        <div class="scoring-grid">
            <div class="kunden-card scoring-main-card">
                <div class="kunden-card-header">
                    <h2>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                            <path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        Bonitätsbewertung
                    </h2>
                </div>
                <div class="scoring-gauges">
                    <div class="scoring-gauge-big">
                        <div class="gauge-circle ${bonitaet && bonitaet.gesamtScore >= 80 ? 'excellent' : bonitaet && bonitaet.gesamtScore >= 65 ? 'good' : 'warn'}">
                            <span class="gauge-value">${bonitaet ? bonitaet.gesamtScore : '-'}</span>
                            <span class="gauge-label">Gesamt</span>
                        </div>
                        <span class="gauge-bewertung">${bonitaet ? bonitaet.bewertung : '-'}</span>
                    </div>
                    <div class="scoring-details-grid">
                        ${renderScoringBar('Bonität', s.bonitaet)}
                        ${renderScoringBar('Zahlungsmoral', s.zahlungsmoral)}
                        ${renderScoringBar('Vertragshistorie', s.vertragshistorie)}
                        ${renderScoringBar('Schadenfreiheit', 100 - s.schadensquote)}
                    </div>
                </div>
                <div class="scoring-info-grid">
                    <div class="scoring-info-item">
                        <span class="scoring-info-label">SCHUFA</span>
                        <span class="scoring-info-value">${s.schufa}</span>
                    </div>
                    <div class="scoring-info-item">
                        <span class="scoring-info-label">Risikoklasse</span>
                        <span class="scoring-info-value scoring-rk-${s.risikoklasse.replace('+', 'plus')}">${s.risikoklasse}</span>
                    </div>
                    <div class="scoring-info-item">
                        <span class="scoring-info-label">Letzte Prüfung</span>
                        <span class="scoring-info-value">${s.letztePruefung}</span>
                    </div>
                </div>
            </div>

            <div class="kunden-card nps-detail-card">
                <div class="kunden-card-header">
                    <h2>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                            <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z"></path>
                            <path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"></path>
                        </svg>
                        NPS & Zufriedenheit
                    </h2>
                </div>
                ${npsData ? `
                <div class="nps-display">
                    <div class="nps-score-big ${npsData.kategorie.toLowerCase()}">
                        <span class="nps-value">${npsData.score}</span>
                        <span class="nps-max">/10</span>
                    </div>
                    <span class="nps-kategorie-badge ${npsData.kategorie.toLowerCase()}">${npsData.kategorie}</span>
                    <p class="nps-date">Letzte Umfrage: ${npsData.letzteUmfrage}</p>
                </div>
                <div class="nps-kommentar">
                    <h4>Kundenkommentar</h4>
                    <blockquote>"${npsData.kommentar}"</blockquote>
                </div>
                <div class="nps-empfehlung">
                    <h4>Empfohlene Aktion</h4>
                    <p>${npsData.empfehlung}</p>
                </div>
                ` : '<p>Keine NPS-Daten verfügbar.</p>'}
            </div>
        </div>
    `;
}

window.fillScoringTab = fillScoringTab;


function fillDeckungsquotenTab(kundenName) {
    const erw = mockKundenErweiterung[kundenName];
    if (!erw) return;

    const container = document.getElementById('tabDeckungsquoten');
    if (!container) return;

    const dq = erw.deckungsquoten;
    const risiko = calculateRisikoScore(kundenName);

    container.innerHTML = `
        <div class="kunden-card">
            <div class="kunden-card-header">
                <h2>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    </svg>
                    Deckungsquoten-Analyse
                </h2>
                ${risiko ? `<span class="deckung-risiko-badge ${risiko.risiko.toLowerCase()}">${risiko.risiko}es Risiko - ${risiko.unterdeckteSparten}/${risiko.gesamtSparten} Sparten unterdeckt</span>` : ''}
            </div>

            <div class="deckung-overview-bar">
                <div class="deckung-overview-label">Gesamtdeckung</div>
                <div class="deckung-overview-track">
                    <div class="deckung-overview-fill ${risiko && risiko.durchschnittlicheDeckung >= 70 ? 'good' : risiko && risiko.durchschnittlicheDeckung >= 40 ? 'warn' : 'bad'}" style="width: ${risiko ? risiko.durchschnittlicheDeckung : 0}%"></div>
                </div>
                <div class="deckung-overview-value">${risiko ? risiko.durchschnittlicheDeckung : 0}%</div>
            </div>

            <div class="deckungsquoten-grid">
                ${Object.entries(dq).map(([key, val]) => `
                    <div class="deckung-card ${val.quote >= 80 ? 'good' : val.quote >= 40 ? 'warn' : 'bad'}">
                        <div class="deckung-card-header">
                            <h3>${formatDeckungName(key)}</h3>
                            <span class="deckung-quote-badge">${val.quote}%</span>
                        </div>
                        <div class="deckung-bar">
                            <div class="deckung-bar-fill" style="width: ${Math.min(val.quote, 100)}%"></div>
                        </div>
                        <div class="deckung-details">
                            ${val.soll === 0 ? '<span class="deckung-na">Nicht relevant</span>' :
                              val.soll === 1 ? `<span class="deckung-status">${val.ist ? 'Vorhanden' : 'Fehlt'}</span>` :
                              `<span>Ist: €${val.ist.toLocaleString('de-DE')} / Soll: €${val.soll.toLocaleString('de-DE')}</span>`}
                        </div>
                        ${val.quote < 50 && val.soll > 0 ? '<div class="deckung-action"><button class="action-btn primary small" onclick="alert(\'Angebot wird erstellt...\')">Angebot erstellen</button></div>' : ''}
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

window.fillDeckungsquotenTab = fillDeckungsquotenTab;


function fillTransaktionsImpulse(kundenName) {
    const insights = detectTransactionInsights(kundenName);
    const container = document.getElementById('transaktionsImpulseContainer');
    if (!container) return;

    if (insights.length === 0) {
        container.innerHTML = '<p class="no-insights">Keine transaktionsbasierten Impulse vorhanden.</p>';
        return;
    }

    container.innerHTML = `
        <div class="impuls-kategorie">
            <h3 class="impuls-kategorie-title transaktionen">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                    <line x1="1" y1="10" x2="23" y2="10"></line>
                </svg>
                Transaktionsbasierte Impulse
                <span class="kategorie-badge">Open Finance</span>
            </h3>
            ${insights.map((insight, i) => `
                <div class="impuls-item ${insight.typ} clickable" onclick="toggleImpulsDetail('impuls-trans-${i}')">
                    <div class="impuls-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
                            ${insight.typ === 'warnung' ?
                                '<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>' :
                                insight.typ === 'positiv' ?
                                '<path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>' :
                                '<circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path>'}
                        </svg>
                    </div>
                    <div class="impuls-text">
                        <strong>${insight.titel}</strong>
                        <p><span class="fida-source-badge small">Open Finance</span> ${insight.text}</p>
                    </div>
                    <span class="impuls-priority ${insight.prioritaet === 'hoch' ? 'high' : 'medium'}">${insight.prioritaet === 'hoch' ? 'Hohe Priorität' : 'Mittlere Priorität'}</span>
                    <span class="impuls-expand">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </span>
                </div>
                <div class="impuls-detail" id="impuls-trans-${i}" style="display: none;">
                    <div class="impuls-detail-section">
                        <h4>Transaktionsanalyse</h4>
                        <p>${insight.text}</p>
                    </div>
                    <div class="impuls-detail-section">
                        <h4>Aktionen</h4>
                        <div class="impuls-actions">
                            <button class="action-btn primary">Angebot erstellen</button>
                            <button class="action-btn secondary">Termin vereinbaren</button>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

window.fillTransaktionsImpulse = fillTransaktionsImpulse;


// ========================================
// HELPER FUNCTIONS
// ========================================

function formatDeckungName(key) {
    const namen = {
        'leben': 'Risikoleben',
        'bu': 'Berufsunfähigkeit',
        'haftpflicht': 'Haftpflicht',
        'hausrat': 'Hausrat',
        'wohngebaeude': 'Wohngebäude',
        'kfz': 'Kfz',
        'rechtsschutz': 'Rechtsschutz',
        'unfall': 'Unfall'
    };
    return namen[key] || key;
}

function renderScoringBar(label, value) {
    const color = value >= 80 ? 'excellent' : value >= 65 ? 'good' : value >= 50 ? 'warn' : 'bad';
    return `
        <div class="scoring-bar-item">
            <div class="scoring-bar-header">
                <span class="scoring-bar-label">${label}</span>
                <span class="scoring-bar-value">${value}</span>
            </div>
            <div class="scoring-bar-track">
                <div class="scoring-bar-fill ${color}" style="width: ${value}%"></div>
            </div>
        </div>
    `;
}


// ========================================
// A-02: AGENTUR EXTENSIONS
// ========================================

function renderAgenturSelector() {
    const selector = document.getElementById('vermittlerSelector');
    if (!selector) return;

    // Get agenturen from data
    let agenturen = [];
    if (typeof getAgenturen === 'function') {
        agenturen = getAgenturen();
    }

    if (agenturen.length === 0) {
        agenturen = [
            { id: 'AG001', name: 'Max Mustermann' },
            { id: 'AG002', name: 'Erika Musterfrau' },
            { id: 'AG003', name: 'Hans Maier' },
            { id: 'AG004', name: 'Sabrina Schulz' }
        ];
    }

    selector.innerHTML = `
        <label class="vermittler-select-label">Vermittler:</label>
        <select id="vermittlerSelectDropdown" class="vermittler-select" onchange="switchVermittler(this.value)">
            ${agenturen.map(a => `<option value="${a.id}">${a.name} (${a.id})</option>`).join('')}
        </select>
    `;
}

window.renderAgenturSelector = renderAgenturSelector;


function switchVermittler(vermittlerId) {
    if (typeof showAgenturOverview === 'function') {
        showAgenturOverview(vermittlerId);
    }
}

window.switchVermittler = switchVermittler;


function renderAgenturKundenliste() {
    const container = document.getElementById('tab-kundenliste');
    if (!container) return;

    // Use mock customer names from the main data
    const kunden = [
        { name: 'Peter Schmidt', vertraege: 2, bestand: 1578, nps: 9, deckung: 44, status: 'Aktiv' },
        { name: 'Sabine König', vertraege: 3, bestand: 2436, nps: 8, deckung: 46, status: 'Aktiv' },
        { name: 'Thomas Weber', vertraege: 1, bestand: 65, nps: 6, deckung: 25, status: 'Aktiv' },
        { name: 'Anna Hoffmann', vertraege: 2, bestand: 1620, nps: 10, deckung: 49, status: 'Aktiv' },
        { name: 'Michael Braun', vertraege: 3, bestand: 4460, nps: 8, deckung: 46, status: 'Aktiv' },
        { name: 'Lisa Müller', vertraege: 1, bestand: 1740, nps: 7, deckung: 25, status: 'Aktiv' },
        { name: 'Klaus Meier', vertraege: 2, bestand: 2510, nps: 8, deckung: 21, status: 'Aktiv' },
        { name: 'Matthias Engel', vertraege: 2, bestand: 985, nps: 5, deckung: 31, status: 'Warnung' },
        { name: 'Christian Bauer', vertraege: 1, bestand: 280, nps: 4, deckung: 25, status: 'Warnung' },
        { name: 'Martin Wolf', vertraege: 2, bestand: 840, nps: 7, deckung: 25, status: 'Warnung' },
        { name: 'Eva Hartmann', vertraege: 2, bestand: 1106, nps: 9, deckung: 24, status: 'Aktiv' }
    ];

    container.innerHTML = `
        <div class="agentur-tab-content active" style="display: block;">
            <div class="uebersicht-card">
                <div class="uebersicht-card-header">
                    <h3>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 00-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 010 7.75"></path>
                        </svg>
                        Kundenliste
                    </h3>
                    <span class="kunden-count">${kunden.length} Kunden</span>
                </div>
                <table class="kunden-table kundenliste-table">
                    <thead>
                        <tr>
                            <th>Kunde</th>
                            <th>Verträge</th>
                            <th>Bestand (€/Jahr)</th>
                            <th>NPS</th>
                            <th>Deckung</th>
                            <th>Status</th>
                            <th>Aktion</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${kunden.map(k => `
                            <tr class="clickable-row" onclick="openKundenDetail('${k.name}', 'KD${String(kunden.indexOf(k) + 1).padStart(5, '0')}')">
                                <td><strong>${k.name}</strong></td>
                                <td>${k.vertraege}</td>
                                <td>€${k.bestand.toLocaleString('de-DE')}</td>
                                <td><span class="nps-mini ${k.nps >= 9 ? 'promoter' : k.nps >= 7 ? 'passiv' : 'detraktor'}">${k.nps}</span></td>
                                <td>
                                    <div class="deckung-mini-inline">
                                        <div class="deckung-mini-track-inline">
                                            <div class="deckung-mini-fill-inline ${k.deckung >= 60 ? 'good' : k.deckung >= 35 ? 'warn' : 'bad'}" style="width: ${k.deckung}%"></div>
                                        </div>
                                        <span>${k.deckung}%</span>
                                    </div>
                                </td>
                                <td><span class="status-badge ${k.status === 'Aktiv' ? 'aktiv' : 'warnung'}">${k.status}</span></td>
                                <td><button class="action-btn small primary" onclick="event.stopPropagation(); openKundenDetail('${k.name}', 'KD${String(kunden.indexOf(k) + 1).padStart(5, '0')}')">Detail</button></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

window.renderAgenturKundenliste = renderAgenturKundenliste;


function renderAgenturCharts() {
    // The 3-column overview restructuring is done via HTML
    // This function renders charts in the middle column
    const chartContainer = document.getElementById('agenturChartColumn');
    if (!chartContainer) return;

    chartContainer.innerHTML = `
        <div class="uebersicht-card">
            <div class="uebersicht-card-header">
                <h3>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                        <line x1="18" y1="20" x2="18" y2="10"></line>
                        <line x1="12" y1="20" x2="12" y2="4"></line>
                        <line x1="6" y1="20" x2="6" y2="14"></line>
                    </svg>
                    Neugeschäft vs. Bestand (Trend)
                </h3>
            </div>
            <canvas id="agenturTrendChart" height="200"></canvas>
        </div>
        <div class="uebersicht-card">
            <div class="uebersicht-card-header">
                <h3>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                        <circle cx="12" cy="12" r="10"></circle>
                    </svg>
                    Spartenverteilung
                </h3>
            </div>
            <canvas id="agenturSpartenChart" height="200"></canvas>
        </div>
    `;

    // Render charts with Chart.js
    setTimeout(() => {
        renderAgenturTrendChart();
        renderAgenturSpartenChart();
    }, 100);
}

window.renderAgenturCharts = renderAgenturCharts;


function renderAgenturTrendChart() {
    const ctx = document.getElementById('agenturTrendChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
            datasets: [
                {
                    label: 'Neugeschäft',
                    data: [12000, 15000, 18000, 14000, 22000, 19000, 25000, 21000, 28000, 24000, 30000, 18450],
                    borderColor: '#C8102E',
                    backgroundColor: 'rgba(200, 16, 46, 0.1)',
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Bestand',
                    data: [180000, 182000, 185000, 187000, 190000, 193000, 196000, 198000, 201000, 204000, 207000, 210000],
                    borderColor: '#86BC25',
                    backgroundColor: 'rgba(134, 188, 37, 0.1)',
                    fill: true,
                    tension: 0.4,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 12 } } },
            scales: {
                y: { beginAtZero: true, ticks: { callback: v => '€' + (v/1000).toFixed(0) + 'k' } },
                y1: { position: 'right', beginAtZero: false, grid: { drawOnChartArea: false }, ticks: { callback: v => '€' + (v/1000).toFixed(0) + 'k' } }
            }
        }
    });
}

function renderAgenturSpartenChart() {
    const ctx = document.getElementById('agenturSpartenChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Leben/BU', 'Sach/HUK', 'Kranken', 'Unfall', 'Rechtsschutz'],
            datasets: [{
                data: [42, 28, 15, 10, 5],
                backgroundColor: ['#C8102E', '#86BC25', '#2563eb', '#f59e0b', '#8b5cf6']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { usePointStyle: true, padding: 10, font: { size: 11 } } }
            }
        }
    });
}


function renderTopKunden() {
    const container = document.getElementById('agenturTopKunden');
    if (!container) return;

    const topKunden = [
        { name: 'Michael Braun', clv: '€28.500', trend: '+12%', segment: 'Premium' },
        { name: 'Klaus Meier', clv: '€18.200', trend: '+5%', segment: 'Standard' },
        { name: 'Peter Schmidt', clv: '€15.800', trend: '+8%', segment: 'Standard' },
        { name: 'Anna Hoffmann', clv: '€14.200', trend: '+15%', segment: 'Aufsteiger' },
        { name: 'Sabine König', clv: '€12.400', trend: '+3%', segment: 'Standard' }
    ];

    container.innerHTML = `
        <div class="uebersicht-card">
            <div class="uebersicht-card-header">
                <h3>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                    Top 5 Kunden (CLV)
                </h3>
            </div>
            <div class="top-kunden-list">
                ${topKunden.map((k, i) => `
                    <div class="top-kunde-item clickable" onclick="openKundenDetail('${k.name}', 'KD${String(i + 1).padStart(5, '0')}')">
                        <span class="top-kunde-rank">${i + 1}</span>
                        <div class="top-kunde-info">
                            <strong>${k.name}</strong>
                            <span class="top-kunde-segment">${k.segment}</span>
                        </div>
                        <div class="top-kunde-metrics">
                            <span class="top-kunde-clv">${k.clv}</span>
                            <span class="top-kunde-trend positive">${k.trend}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

window.renderTopKunden = renderTopKunden;


// ========================================
// A-10: HEADER SCORES
// ========================================

function updateKundenHeaderScores(kundenName) {
    const erw = mockKundenErweiterung[kundenName];
    if (!erw) return;

    const bonitaet = calculateBonitaetsScore(kundenName);
    const risiko = calculateRisikoScore(kundenName);

    const scoringBadge = document.getElementById('headerScoringBadge');
    if (scoringBadge && bonitaet) {
        scoringBadge.innerHTML = `
            <span class="header-score-item">
                <span class="header-score-label">Bonität</span>
                <span class="header-score-value ${bonitaet.gesamtScore >= 70 ? 'good' : 'warn'}">${bonitaet.gesamtScore}</span>
            </span>
            <span class="header-score-item">
                <span class="header-score-label">Deckung</span>
                <span class="header-score-value ${risiko && risiko.durchschnittlicheDeckung >= 50 ? 'good' : 'warn'}">${risiko ? risiko.durchschnittlicheDeckung + '%' : '-'}</span>
            </span>
            <span class="header-score-item">
                <span class="header-score-label">NPS</span>
                <span class="header-score-value nps-${erw.nps.kategorie.toLowerCase()}">${erw.nps.score}</span>
            </span>
        `;
        scoringBadge.style.display = 'flex';
    }
}

window.updateKundenHeaderScores = updateKundenHeaderScores;


// ========================================
// A-02: NPS KPI
// ========================================

function fillNPSKPI() {
    const npsValue = document.getElementById('cockpitNPS');
    const npsTrend = document.getElementById('cockpitNPSTrend');

    if (npsValue) {
        // Calculate average NPS across all customers
        const allNPS = Object.values(mockKundenErweiterung).map(k => k.nps.score);
        const avgNPS = (allNPS.reduce((s, n) => s + n, 0) / allNPS.length).toFixed(1);
        npsValue.textContent = avgNPS;
    }

    if (npsTrend) {
        const trend = '+0.3';
        npsTrend.textContent = trend;
        npsTrend.className = 'cockpit-kpi-trend positive';
    }
}

window.fillNPSKPI = fillNPSKPI;


// ========================================
// INTEGRATION: Extend existing functions
// ========================================

// Store the original switchKundenTab for extension
const originalSwitchKundenTab = window.switchKundenTab;

// Override switchKundenTab to handle new tabs
window.switchKundenTab = function(tabName) {
    // Call original tab switching logic
    // All tabs deactivate
    document.querySelectorAll('.kunden-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.kunden-tab-content').forEach(content => {
        content.classList.remove('active');
    });

    // Activate the selected tab button
    const activeTab = document.querySelector(`.kunden-tab[data-tab="${tabName}"]`);
    if (activeTab) {
        activeTab.classList.add('active');
    }

    // Activate tab content
    const tabContent = document.getElementById('tab' + tabName.charAt(0).toUpperCase() + tabName.slice(1));
    if (tabContent) {
        tabContent.classList.add('active');
    }

    // Fill new tab contents dynamically
    const currentKundenName = document.getElementById('kundenName')?.textContent;
    if (currentKundenName) {
        switch (tabName) {
            case 'uebersicht':
                fillKundenUebersichtTab(currentKundenName);
                break;
            case 'banktransaktionen':
                fillTransaktionenTab(currentKundenName);
                break;
            case 'scoring':
                fillScoringTab(currentKundenName);
                break;
            case 'deckungsquoten':
                fillDeckungsquotenTab(currentKundenName);
                break;
            case 'impulse':
                fillTransaktionsImpulse(currentKundenName);
                break;
        }
    }

    console.log('Tab gewechselt zu:', tabName);
};

// Extend fillKundenDetail to also fill header scores and transaction impulses
const originalFillKundenDetail = window.fillKundenDetail;
if (originalFillKundenDetail) {
    window.fillKundenDetail = function(kundenName, vermittlerId) {
        originalFillKundenDetail(kundenName, vermittlerId);
        // Add extended data
        updateKundenHeaderScores(kundenName);
        // Auto-switch to Übersicht tab
        setTimeout(() => {
            window.switchKundenTab('uebersicht');
        }, 50);
    };
}

// Extend loadAgenturData to also fill NPS and render extensions
const originalLoadAgenturData = window.loadAgenturData;
if (typeof originalLoadAgenturData === 'function') {
    window.loadAgenturData = function(vermittlerId) {
        originalLoadAgenturData(vermittlerId);
        setTimeout(() => {
            fillNPSKPI();
            renderAgenturSelector();
            renderTopKunden();
            renderAgenturCharts();
        }, 200);
    };
} else {
    // If loadAgenturData isn't available yet, set up on DOMContentLoaded
    document.addEventListener('DOMContentLoaded', () => {
        if (typeof window.loadAgenturData === 'function') {
            const origLoad = window.loadAgenturData;
            window.loadAgenturData = function(vermittlerId) {
                origLoad(vermittlerId);
                setTimeout(() => {
                    fillNPSKPI();
                    renderAgenturSelector();
                    renderTopKunden();
                    renderAgenturCharts();
                }, 200);
            };
        }
    });
}
