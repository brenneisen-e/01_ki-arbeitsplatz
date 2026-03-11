// js/mock-personas-vv-w1w2.js – OPT-26: VV-Persona-Erweiterungen W1 + W2
// Ergaenzt bestehende Mandanten um transaktionen, potentiale (OPT-19), linkedin
// Wird VOR vv-mock-data.js geladen und dort per Object.assign gemerged

window._vvPersonaExtensions = window._vvPersonaExtensions || {};

// ── W1: Dr. Heinrich von Trott – Unternehmer, 62, Konsolidierung/Nachfolge ──
window._vvPersonaExtensions['Dr. Heinrich von Trott'] = {

    linkedin: {
        profil: 'linkedin.com/in/heinrich-vontrott',
        headline: 'Geschäftsführender Gesellschafter | von Trott Maschinenbau GmbH',
        connections: 1850,
        recentPosts: [
            { datum: '2026-02-18', thema: 'Firmenjubiläum 75 Jahre von Trott Maschinenbau' },
            { datum: '2026-01-22', thema: 'Nachhaltige Produktion – unsere ESG-Roadmap 2030' }
        ],
        lebensereignisse: [
            { typ: 'firmenjubilaeum', datum: '2026-02', details: '75 Jahre von Trott Maschinenbau' },
            { typ: 'nachfolge_signal', datum: '2025-12', details: 'Sohn Maximilian als COO vorgestellt' }
        ]
    },

    transaktionen: {
        monat: '2026-02',
        einnahmen: [
            { quelle: 'Geschaeftsfuehrergehalt', betrag: 18000, kategorie: 'gehalt' },
            { quelle: 'Gewinnausschuettung GmbH (Q4)', betrag: 125000, kategorie: 'kapitalertrag', rhythmus: 'quartalsweise' },
            { quelle: 'Mieteinnahmen ETW Frankfurt', betrag: 2800, kategorie: 'miete' },
            { quelle: 'Mieteinnahmen Gewerbe', betrag: 8500, kategorie: 'miete' },
            { quelle: 'Dividenden HRK LUNIS Depot', betrag: 4200, kategorie: 'kapitalertrag' },
            { quelle: 'UBS Depot Dividenden', betrag: 1800, kategorie: 'kapitalertrag' }
        ],
        ausgaben: [
            { zweck: 'Lebenshaltung / Haushalt', betrag: 6500, kategorie: 'lebenshaltung' },
            { zweck: 'Immobilien-Instandhaltung', betrag: 2200, kategorie: 'immobilie' },
            { zweck: 'Versicherungspraemien', betrag: 1800, kategorie: 'versicherung' },
            { zweck: 'PKV (Ehepaar)', betrag: 1650, kategorie: 'versicherung' },
            { zweck: 'Steuervorauszahlung', betrag: 12000, kategorie: 'steuer', rhythmus: 'quartalsweise' },
            { zweck: 'Spende / Stiftungsidee', betrag: 2500, kategorie: 'spende' },
            { zweck: 'HRK LUNIS Management Fee', betrag: 9896, kategorie: 'vermoegensverw', rhythmus: 'quartalsweise' }
        ],
        sparquote: 0.42,
        cashflowNetto: 123752
    },

    potentiale: [
        {
            id: 'W1-P1',
            titel: 'UBS-Depot Konsolidierung',
            produkt: 'AuM-Transfer UBS → HRK LUNIS',
            beschreibung: '2,8M € bei UBS Zuerich. Konsolidierung ermoeglicht Gesamtallokation, Kostenreduktion, einheitliches Reporting.',
            qpiQuelle: 'wettbewerb',
            quellDetails: 'Client 360° Vermoegensbilanz – UBS Depot erkannt',
            prioritaet: 'hoch',
            volumen: 2800000,
            ertragPotential: 26600,
            status: 'angesprochen',
            naechsteAktion: 'Konditionsvergleich UBS vs. HRK LUNIS erstellen',
            faelligkeit: '2026-04-30'
        },
        {
            id: 'W1-P2',
            titel: 'Deutsche Bank Tagesgeld Konsolidierung',
            produkt: 'AuM-Transfer DB → HRK LUNIS',
            beschreibung: '400k € DB Tagesgeld. Einbindung in Gesamtstrategie, bessere Rendite als Tagesgeld.',
            qpiQuelle: 'wettbewerb',
            quellDetails: 'Vermoegensbilanz – DB Tagesgeld niedrig verzinst',
            prioritaet: 'mittel',
            volumen: 400000,
            ertragPotential: 3800,
            status: 'identifiziert',
            naechsteAktion: 'Im Quartals-Review ansprechen',
            faelligkeit: '2026-06-30'
        },
        {
            id: 'W1-P3',
            titel: 'NextGen-Mandat Charlotte',
            produkt: 'SmartValue-Mandat',
            beschreibung: 'Tochter Charlotte (31), kein eigenes Mandat. SmartValue-Einstieg ueber Familienbindung.',
            qpiQuelle: 'lebensereignis',
            quellDetails: 'Familienstruktur – Tochter im mandatsfaehigen Alter',
            prioritaet: 'mittel',
            volumen: 500000,
            ertragPotential: 6000,
            status: 'identifiziert',
            naechsteAktion: 'Gespraech mit Vater planen (Q2)',
            faelligkeit: '2026-06-30'
        },
        {
            id: 'W1-P4',
            titel: 'Stiftungsgruendung',
            produkt: 'Stiftungsmandat',
            beschreibung: 'Alter 62, hoher Vermoegensbestand, Nachfolge-Phase. Stiftung als Nachfolgeinstrument und Steueroptimierung.',
            qpiQuelle: 'lebensereignis',
            quellDetails: 'Lebensphasenanalyse: Konsolidierung / Nachfolge, 3. Generation',
            prioritaet: 'mittel',
            volumen: 5000000,
            ertragPotential: 31000,
            status: 'identifiziert',
            naechsteAktion: 'Stiftungskonzept mit Steuerberater vorbereiten',
            faelligkeit: '2026-09-30'
        },
        {
            id: 'W1-P5',
            titel: 'Nachfolgeberatung Unternehmen',
            produkt: 'Family-Office-Service',
            beschreibung: 'Sohn Maximilian als COO – Nachfolge im Gang. Begleitung der Unternehmens-Transition, ggf. Teilverkauf-Erloese.',
            qpiQuelle: 'lebensereignis',
            quellDetails: 'LinkedIn: Sohn als COO vorgestellt, Firmenjubilaeum 75 Jahre',
            prioritaet: 'hoch',
            volumen: 3000000,
            ertragPotential: 21000,
            status: 'identifiziert',
            naechsteAktion: 'Nachfolge-Workshop mit Steuerberater + RA vorschlagen',
            faelligkeit: '2026-06-30'
        },
        {
            id: 'W1-P6',
            titel: 'ESG-Upgrade Mandat',
            produkt: 'Art. 9 Umstellung',
            beschreibung: 'Aktuell Art. 8 SFDR. LinkedIn zeigt ESG-Engagement. Upgrade auf Art. 9 (Impact) pruefen.',
            qpiQuelle: 'kommunikation',
            quellDetails: 'LinkedIn-Post ESG-Roadmap 2030 + bestehende pai:false',
            prioritaet: 'niedrig',
            volumen: 0,
            ertragPotential: 0,
            status: 'identifiziert',
            naechsteAktion: 'ESG-Beratungsgespraech im Q2-Review',
            faelligkeit: '2026-06-30'
        }
    ]
};

// ── W2: Familie Lindenberg – Aerztin/Radiologe, 47, Aufbau/Wachstum ──
window._vvPersonaExtensions['Familie Lindenberg'] = {

    linkedin: {
        profil: 'linkedin.com/in/katrin-lindenberg',
        headline: 'Fachärztin für Radiologie | Praxisinhaberin',
        connections: 820,
        recentPosts: [
            { datum: '2026-02-10', thema: 'KI in der Radiologie – Chancen fuer die Diagnostik' },
            { datum: '2025-11-15', thema: 'Praxiserweiterung: Neuer MRT-Standort in Oberursel' }
        ],
        lebensereignisse: [
            { typ: 'praxiserweiterung', datum: '2026-01', details: 'Zweiter Standort Oberursel eroeffnet' },
            { typ: 'immobilienkauf', datum: '2025-09', details: 'Suche Anlageimmobilie im Rhein-Main-Gebiet' }
        ]
    },

    transaktionen: {
        monat: '2026-02',
        einnahmen: [
            { quelle: 'Praxisgewinn Katrin (Netto)', betrag: 14000, kategorie: 'selbstaendig' },
            { quelle: 'Praxisgewinn Martin (Partner, Orthopaedie)', betrag: 11000, kategorie: 'gehalt' },
            { quelle: 'Dividenden HRK LUNIS Depot', betrag: 850, kategorie: 'kapitalertrag' }
        ],
        ausgaben: [
            { zweck: 'Lebenshaltung / Familie', betrag: 5500, kategorie: 'lebenshaltung' },
            { zweck: 'Kinder (Schule, Hobbys)', betrag: 1200, kategorie: 'kinder' },
            { zweck: 'PKV Familie', betrag: 2400, kategorie: 'versicherung' },
            { zweck: 'Immobilienkredit EFH', betrag: 2800, kategorie: 'finanzierung' },
            { zweck: 'Praxisdarlehen Standort 2', betrag: 3500, kategorie: 'finanzierung' },
            { zweck: 'Versicherungen (BU, Haftpflicht, Praxis)', betrag: 950, kategorie: 'versicherung' },
            { zweck: 'HRK LUNIS Management Fee', betrag: 1365, kategorie: 'vermoegensverw', rhythmus: 'quartalsweise' },
            { zweck: 'Sparplan PE Growth Fund', betrag: 2500, kategorie: 'investition', rhythmus: 'quartalsweise' }
        ],
        sparquote: 0.28,
        cashflowNetto: 5635
    },

    potentiale: [
        {
            id: 'W2-P1',
            titel: 'PE-Quote erhoehen',
            produkt: 'PE Growth Fund C Zeichnung',
            beschreibung: 'Mandantin wuenscht hoehere PE-Quote ab Q2. Neuer PE Growth Fund C als Einstieg.',
            qpiQuelle: 'kommunikation',
            quellDetails: 'Jahresstart-Gespraech 15.01.2026: Wunsch nach mehr PE',
            prioritaet: 'hoch',
            volumen: 200000,
            ertragPotential: 2400,
            status: 'angesprochen',
            naechsteAktion: 'PE Fund C Zeichnungsunterlagen vorbereiten',
            faelligkeit: '2026-04-15'
        },
        {
            id: 'W2-P2',
            titel: 'Anlageimmobilie Rhein-Main',
            produkt: 'Immobilien-Advisory',
            beschreibung: 'LinkedIn-Signal: Suche Anlageimmobilie. Beratung zu Immobilien-Investments im Portfoliokontext.',
            qpiQuelle: 'lebensereignis',
            quellDetails: 'LinkedIn: Immobiliensuche Rhein-Main + Praxiserweiterung = Liquiditaet',
            prioritaet: 'mittel',
            volumen: 500000,
            ertragPotential: 0,
            status: 'identifiziert',
            naechsteAktion: 'Immobilien-Allokation im Portfolio besprechen',
            faelligkeit: '2026-06-30'
        },
        {
            id: 'W2-P3',
            titel: 'Praxisverkaufs-Erloese (langfristig)',
            produkt: 'AuM-Aufstockung',
            beschreibung: 'Praxis Schaetzwert 1,8M €. Bei Ruhestand / Teilverkauf fliessen Erloese ins Mandat.',
            qpiQuelle: 'bestand',
            quellDetails: 'Unternehmensbewertung: Praxis 1,8M €, Praxiserweiterung steigert Wert',
            prioritaet: 'niedrig',
            volumen: 1800000,
            ertragPotential: 14040,
            status: 'identifiziert',
            naechsteAktion: 'Langfrist-Szenario in Finanzplanung einbauen',
            faelligkeit: '2028-12-31'
        },
        {
            id: 'W2-P4',
            titel: 'Kinder-Depot (Sophie + Felix)',
            produkt: 'Junior-Depot SmartValue',
            beschreibung: 'Sophie (12) und Felix (9) – fruehzeitiger Vermoegensaufbau ueber Junior-Depots.',
            qpiQuelle: 'bestand',
            quellDetails: 'Familienstruktur: 2 Kinder ohne eigene Depots',
            prioritaet: 'mittel',
            volumen: 50000,
            ertragPotential: 600,
            status: 'identifiziert',
            naechsteAktion: 'Junior-Depot-Konzept im naechsten Gespraech vorstellen',
            faelligkeit: '2026-06-30'
        },
        {
            id: 'W2-P5',
            titel: 'Underperformance adressieren',
            produkt: 'Rebalancing / Strategieanpassung',
            beschreibung: 'YTD +5,1% vs. Benchmark +5,8%. Aktienquote 68% vs. Soll 70%. Cash 4% vs. Soll 2%. Leichte Unterperformance korrigieren.',
            qpiQuelle: 'bestand',
            quellDetails: 'Performance-Monitoring: -70bps vs. Benchmark, Cash-Drag',
            prioritaet: 'hoch',
            volumen: 0,
            ertragPotential: 0,
            status: 'identifiziert',
            naechsteAktion: 'Rebalancing-Vorschlag erstellen: Cash → Aktien',
            faelligkeit: '2026-03-31'
        }
    ]
};
