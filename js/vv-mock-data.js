// js/vv-mock-data.js – OPT-21: Mock-Daten für Vermögensverwaltung (HRK LUNIS)
// Mandanten, Berater-Daten, Pipeline, Potentiale

(function() {
    'use strict';

    // ── VV BERATER-DATEN ──
    window.vvBeraterData = {
        name: 'Dr. Thomas Richter',
        id: 'HRK-SR-042',
        titel: 'Senior Advisor',
        standort: 'Frankfurt',
        seit: '2019',
        institut: 'HRK LUNIS AG',
        teamAuM: '342M €',
        telefon: '+49 69 7106-4200',
        email: 'thomas.richter@hrk-lunis.de'
    };

    // ── VV MOCK MANDANTEN ──
    window.vvMockMandanten = {
        'Dr. Heinrich von Trott': {
            id: 'VV001',
            geburtsdatum: '1963-08-12',
            adresse: 'Parkstr. 15, 61231 Bad Nauheim',
            beruf: 'Unternehmer (Maschinenbau)',
            familienstand: 'verheiratet',
            telefon: '+49 6032 123456',
            email: 'h.vontrott@vontrott-mb.de',
            kinder: [
                { name: 'Maximilian', alter: 34, eigenesMandat: true, mandatTyp: 'SmartValue', aum: 450000 },
                { name: 'Charlotte', alter: 31, eigenesMandat: false }
            ],
            lebensphase: 'Konsolidierung / Nachfolge',

            // Mandatsdetails
            segment: 'FairValue',
            mandatstyp: 'Individuelle Vermögensverwaltung',
            mandatSeit: '2020-03-15',
            aum: 12500000,
            aumHistory: [
                { monat: '2025-01', aum: 11800000 }, { monat: '2025-03', aum: 11950000 },
                { monat: '2025-06', aum: 12100000 }, { monat: '2025-09', aum: 12300000 },
                { monat: '2025-12', aum: 12400000 }, { monat: '2026-03', aum: 12500000 }
            ],
            netNewMoney: 2800000,

            // Portfolio
            risikoprofil: 'Ausgewogen (3/5)',
            anlagerichtlinie: { maxAktien: 60, minRenten: 20, krypto: false, alternatives: true },
            esgPraeferenz: { sfdr: 'Art. 8', taxonomie: 0, pai: false },
            benchmark: '50% MSCI World / 50% EB.REXX Govt',
            assetAllocation: { aktien: 52, renten: 28, alternatives: 10, cash: 5, pe: 5 },
            sollAllocation: { aktien: 50, renten: 30, alternatives: 10, cash: 5, pe: 5 },
            performance: { ytd: 8.2, benchmark_ytd: 7.1, volatilitaet: 8.3, maxDrawdown: -4.2, sharpe: 0.98 },

            // Vermögensbilanz
            fremdVermoegen: [
                { institut: 'UBS Zürich', typ: 'Depot', volumen: 2800000 },
                { institut: 'Deutsche Bank', typ: 'Tagesgeld', volumen: 400000 }
            ],
            immobilien: [
                { bezeichnung: 'EFH Bad Nauheim', wert: 1200000, typ: 'eigengenutzt' },
                { bezeichnung: 'ETW Frankfurt', wert: 850000, typ: 'vermietet' },
                { bezeichnung: 'Gewerbeimmobilie', wert: 2750000, typ: 'betrieblich' }
            ],
            unternehmen: [{ name: 'von Trott Maschinenbau GmbH', anteil: 100, schaetzwert: 15000000 }],
            peBeteiligungen: [
                { fonds: 'PE Growth Fund A', jahrgang: 2021, investiert: 700000 },
                { fonds: 'PE Buyout Fund B', jahrgang: 2023, investiert: 500000 }
            ],

            // Compliance
            wphgBogen: { status: 'vollstaendig', letzteAktualisierung: '2025-09-15', naechsteFaelligkeit: '2026-09-15' },
            geeignetheitsbericht: { letzter: 'Q4 2025', naechsterFaellig: '2026-04-15', status: 'offen' },
            verlustschwelle: { schwelle: 0.10, hoechststand: 13200000, hoechststandDatum: '2026-01-15' },
            exAnteKosten: { bereitgestellt: '2026-01-02', gesamtkosten: 98750, quote: 0.0079 },
            exPostKosten: { bereitgestellt: '2026-02-28', gesamtkosten: 94200, quote: 0.0076 },

            // Ertrag
            managementFee: 0.0095,
            ertragProJahr: 118750,

            // Kommunikation
            kommunikation: [
                { typ: 'meeting', datum: '2026-02-20', betreff: 'Quartals-Review Q4 2025', notiz: 'Performance-Besprechung, sehr zufrieden mit Outperformance' },
                { typ: 'email', datum: '2026-03-01', betreff: 'Marktkommentar Q1', notiz: 'Monatlicher Marktbericht versendet' },
                { typ: 'anruf', datum: '2026-03-08', betreff: 'Rebalancing-Abstimmung', notiz: 'Zustimmung zu Teilumschichtung US → Euro Govt' }
            ],
            nps: { score: 9 },
            avatarBg: '#1a365d',
            statusIcon: 'ok'
        },

        'Familie Lindenberg': {
            id: 'VV002',
            geburtsdatum: '1978-04-22',
            adresse: 'Am Kurpark 8, 61348 Bad Homburg',
            beruf: 'Ärztin (Radiologie)',
            familienstand: 'verheiratet',
            telefon: '+49 6172 987654',
            email: 'k.lindenberg@praxis-lindenberg.de',
            kinder: [
                { name: 'Sophie', alter: 12, eigenesMandat: false },
                { name: 'Felix', alter: 9, eigenesMandat: false }
            ],
            lebensphase: 'Aufbau / Wachstum',

            segment: 'SmartValue',
            mandatstyp: 'VV + PE',
            mandatSeit: '2022-06-01',
            aum: 2100000,
            aumHistory: [
                { monat: '2025-01', aum: 1850000 }, { monat: '2026-03', aum: 2100000 }
            ],
            netNewMoney: 350000,

            risikoprofil: 'Wachstum (4/5)',
            anlagerichtlinie: { maxAktien: 75, minRenten: 10, krypto: false, alternatives: true },
            esgPraeferenz: { sfdr: 'Art. 8', taxonomie: 0, pai: true },
            benchmark: '70% MSCI ACWI / 30% EB.REXX',
            assetAllocation: { aktien: 68, renten: 15, alternatives: 8, cash: 4, pe: 5 },
            sollAllocation: { aktien: 70, renten: 15, alternatives: 8, cash: 2, pe: 5 },
            performance: { ytd: 5.1, benchmark_ytd: 5.8, volatilitaet: 10.2, maxDrawdown: -5.8, sharpe: 0.72 },

            fremdVermoegen: [],
            immobilien: [{ bezeichnung: 'EFH Bad Homburg', wert: 950000, typ: 'eigengenutzt' }],
            unternehmen: [{ name: 'Radiologie Praxis Lindenberg', anteil: 100, schaetzwert: 1800000 }],
            peBeteiligungen: [{ fonds: 'PE Growth Fund A', jahrgang: 2022, investiert: 200000 }],

            wphgBogen: { status: 'vollstaendig', letzteAktualisierung: '2025-11-10', naechsteFaelligkeit: '2026-11-10' },
            geeignetheitsbericht: { letzter: 'Q4 2025', naechsterFaellig: '2026-04-15', status: 'erstellt' },
            verlustschwelle: { schwelle: 0.10, hoechststand: 2200000, hoechststandDatum: '2026-02-01' },
            exAnteKosten: { bereitgestellt: '2026-01-02', gesamtkosten: 16380, quote: 0.0078 },
            exPostKosten: { bereitgestellt: '2026-02-28', gesamtkosten: 15200, quote: 0.0076 },

            managementFee: 0.0078,
            ertragProJahr: 16380,

            kommunikation: [
                { typ: 'meeting', datum: '2026-01-15', betreff: 'Jahresstart-Gespräch', notiz: 'Wünscht höhere PE-Quote ab Q2' },
                { typ: 'email', datum: '2026-03-05', betreff: 'PE-Fund C Zeichnung', notiz: 'Informationen zu neuem PE-Fund versendet' }
            ],
            nps: { score: 8 },
            avatarBg: '#2d4a7a',
            statusIcon: 'ok'
        },

        'Stiftung Weber': {
            id: 'VV003',
            geburtsdatum: '1955-11-30',
            adresse: 'Stiftungshaus, Mainzer Landstr. 50, 60325 Frankfurt',
            beruf: 'Stiftungsvorstand',
            familienstand: 'verwitwet',
            telefon: '+49 69 456789',
            email: 'vorstand@weber-stiftung.de',
            kinder: [],
            lebensphase: 'Stiftungsverwaltung',

            segment: 'Stiftung',
            mandatstyp: 'Spezialmandat',
            mandatSeit: '2018-01-15',
            aum: 8300000,
            aumHistory: [
                { monat: '2025-01', aum: 8100000 }, { monat: '2026-03', aum: 8300000 }
            ],
            netNewMoney: 0,

            risikoprofil: 'Konservativ (2/5)',
            anlagerichtlinie: { maxAktien: 30, minRenten: 50, krypto: false, alternatives: false },
            esgPraeferenz: { sfdr: 'Art. 9', taxonomie: 20, pai: true },
            benchmark: '30% MSCI World / 70% EB.REXX Govt',
            assetAllocation: { aktien: 28, renten: 58, alternatives: 5, cash: 9, pe: 0 },
            sollAllocation: { aktien: 30, renten: 55, alternatives: 5, cash: 10, pe: 0 },
            performance: { ytd: 3.8, benchmark_ytd: 3.5, volatilitaet: 4.2, maxDrawdown: -2.1, sharpe: 1.12 },

            fremdVermoegen: [],
            immobilien: [{ bezeichnung: 'Stiftungshaus Frankfurt', wert: 3200000, typ: 'eigengenutzt' }],
            unternehmen: [],
            peBeteiligungen: [],

            wphgBogen: { status: 'vollstaendig', letzteAktualisierung: '2025-06-20', naechsteFaelligkeit: '2026-06-20' },
            geeignetheitsbericht: { letzter: 'Q4 2025', naechsterFaellig: '2026-04-15', status: 'erstellt' },
            verlustschwelle: { schwelle: 0.05, hoechststand: 8500000, hoechststandDatum: '2025-12-01' },
            exAnteKosten: { bereitgestellt: '2026-01-02', gesamtkosten: 51460, quote: 0.0062 },
            exPostKosten: { bereitgestellt: '2026-02-28', gesamtkosten: 49800, quote: 0.0061 },

            managementFee: 0.0062,
            ertragProJahr: 51460,

            kommunikation: [
                { typ: 'meeting', datum: '2026-02-10', betreff: 'Stiftungsrats-Sitzung', notiz: 'Aktienquote soll innerhalb ±3pp Soll bleiben' },
                { typ: 'email', datum: '2026-03-02', betreff: 'ESG-Reporting 2025', notiz: 'Nachhaltigkeitsbericht für Stiftungsrat' }
            ],
            nps: { score: 8 },
            avatarBg: '#4a5568',
            statusIcon: 'drift'
        },

        'Winterberg GmbH': {
            id: 'VV004',
            geburtsdatum: '1970-03-05',
            adresse: 'Industriestr. 22, 65760 Eschborn',
            beruf: 'Geschäftsführer (Winterberg Holding)',
            familienstand: 'geschieden',
            telefon: '+49 6196 778899',
            email: 'm.winterberg@winterberg-holding.de',
            kinder: [{ name: 'Lukas', alter: 22, eigenesMandat: false }],
            lebensphase: 'Institutionelle Anlage',

            segment: 'Institutionell',
            mandatstyp: 'Spezialmandat',
            mandatSeit: '2019-09-01',
            aum: 25000000,
            aumHistory: [
                { monat: '2025-01', aum: 23500000 }, { monat: '2026-03', aum: 25000000 }
            ],
            netNewMoney: 5000000,

            risikoprofil: 'Wachstum (4/5)',
            anlagerichtlinie: { maxAktien: 70, minRenten: 15, krypto: false, alternatives: true },
            esgPraeferenz: { sfdr: 'Art. 8', taxonomie: 0, pai: false },
            benchmark: '60% MSCI World / 40% EB.REXX',
            assetAllocation: { aktien: 62, renten: 20, alternatives: 10, cash: 3, pe: 5 },
            sollAllocation: { aktien: 60, renten: 20, alternatives: 10, cash: 5, pe: 5 },
            performance: { ytd: 6.7, benchmark_ytd: 6.2, volatilitaet: 9.1, maxDrawdown: -3.8, sharpe: 0.89 },

            fremdVermoegen: [{ institut: 'Goldman Sachs', typ: 'Depot', volumen: 5000000 }],
            immobilien: [
                { bezeichnung: 'Bürogebäude Eschborn', wert: 8500000, typ: 'betrieblich' },
                { bezeichnung: 'Wohnung Zürich', wert: 1800000, typ: 'eigengenutzt' }
            ],
            unternehmen: [{ name: 'Winterberg Holding GmbH', anteil: 100, schaetzwert: 45000000 }],
            peBeteiligungen: [
                { fonds: 'Infrastructure Fund I', jahrgang: 2020, investiert: 1500000 },
                { fonds: 'Tech Growth Fund III', jahrgang: 2022, investiert: 800000 }
            ],

            wphgBogen: { status: 'vollstaendig', letzteAktualisierung: '2025-08-01', naechsteFaelligkeit: '2026-08-01' },
            geeignetheitsbericht: { letzter: 'Q4 2025', naechsterFaellig: '2026-04-15', status: 'erstellt' },
            verlustschwelle: { schwelle: 0.10, hoechststand: 26000000, hoechststandDatum: '2026-02-15' },
            exAnteKosten: { bereitgestellt: '2026-01-02', gesamtkosten: 112500, quote: 0.0045 },
            exPostKosten: { bereitgestellt: '2026-02-28', gesamtkosten: 108000, quote: 0.0044 },

            managementFee: 0.0045,
            ertragProJahr: 112500,

            kommunikation: [
                { typ: 'meeting', datum: '2026-02-25', betreff: 'Strategy Review', notiz: 'Aufstockung PE-Quote gewünscht' },
                { typ: 'anruf', datum: '2026-03-06', betreff: 'Goldman Sachs Transfer', notiz: 'Prüfung Konsolidierung GS Depot → HRK LUNIS' }
            ],
            nps: { score: 7 },
            avatarBg: '#2b6cb0',
            statusIcon: 'ok'
        },

        'Keller NextGen': {
            id: 'VV005',
            geburtsdatum: '1992-07-18',
            adresse: 'Bockenheimer Landstr. 78, 60323 Frankfurt',
            beruf: 'Tech-Unternehmer',
            familienstand: 'ledig',
            telefon: '+49 171 5556789',
            email: 'max.keller@kellertech.io',
            kinder: [],
            lebensphase: 'Vermögensaufbau',

            segment: 'SmartValue',
            mandatstyp: 'VV',
            mandatSeit: '2024-01-15',
            aum: 450000,
            aumHistory: [
                { monat: '2024-01', aum: 300000 }, { monat: '2025-06', aum: 380000 },
                { monat: '2026-03', aum: 450000 }
            ],
            netNewMoney: 120000,

            risikoprofil: 'Offensiv (5/5)',
            anlagerichtlinie: { maxAktien: 90, minRenten: 0, krypto: false, alternatives: true },
            esgPraeferenz: { sfdr: 'keine', taxonomie: 0, pai: false },
            benchmark: '90% MSCI ACWI / 10% Cash',
            assetAllocation: { aktien: 85, renten: 0, alternatives: 8, cash: 7, pe: 0 },
            sollAllocation: { aktien: 85, renten: 0, alternatives: 10, cash: 5, pe: 0 },
            performance: { ytd: 4.2, benchmark_ytd: 5.5, volatilitaet: 14.5, maxDrawdown: -8.1, sharpe: 0.58 },

            fremdVermoegen: [{ institut: 'Trade Republic', typ: 'Depot', volumen: 180000 }],
            immobilien: [],
            unternehmen: [{ name: 'KellerTech GmbH', anteil: 60, schaetzwert: 2500000 }],
            peBeteiligungen: [],

            wphgBogen: { status: 'aktualisierung_noetig', letzteAktualisierung: '2024-12-01', naechsteFaelligkeit: '2025-12-01' },
            geeignetheitsbericht: { letzter: 'Q3 2025', naechsterFaellig: '2026-03-31', status: 'offen' },
            verlustschwelle: { schwelle: 0.10, hoechststand: 480000, hoechststandDatum: '2026-01-20' },
            exAnteKosten: { bereitgestellt: '2026-01-02', gesamtkosten: 5400, quote: 0.012 },
            exPostKosten: { bereitgestellt: '2026-02-28', gesamtkosten: 4800, quote: 0.0114 },

            managementFee: 0.012,
            ertragProJahr: 5400,

            kommunikation: [
                { typ: 'chat', datum: '2026-03-09', betreff: 'WpHG-Bogen Update', notiz: 'Erneuerung WpHG-Bogen angemahnt' },
                { typ: 'email', datum: '2026-02-15', betreff: 'SmartValue Performance', notiz: 'Monatlicher Report, zufrieden' }
            ],
            nps: { score: 7 },
            avatarBg: '#38a169',
            statusIcon: 'wphg'
        },

        'Prof. Dr. Elisabeth Hartmann': {
            id: 'VV006',
            geburtsdatum: '1958-02-14',
            adresse: 'Philosophenweg 12, 69120 Heidelberg',
            beruf: 'Emeritierte Professorin (Medizin)',
            familienstand: 'verheiratet',
            telefon: '+49 6221 334455',
            email: 'e.hartmann@uni-heidelberg.de',
            kinder: [
                { name: 'Alexander', alter: 38, eigenesMandat: false },
                { name: 'Katharina', alter: 35, eigenesMandat: false }
            ],
            lebensphase: 'Ruhestand / Entnahme',

            segment: 'FairValue',
            mandatstyp: 'Individuelle Vermögensverwaltung',
            mandatSeit: '2017-04-01',
            aum: 6800000,
            aumHistory: [
                { monat: '2025-01', aum: 7100000 }, { monat: '2026-03', aum: 6800000 }
            ],
            netNewMoney: -200000,

            risikoprofil: 'Konservativ (2/5)',
            anlagerichtlinie: { maxAktien: 40, minRenten: 40, krypto: false, alternatives: false },
            esgPraeferenz: { sfdr: 'Art. 8', taxonomie: 10, pai: true },
            benchmark: '35% MSCI World / 65% EB.REXX Govt',
            assetAllocation: { aktien: 35, renten: 48, alternatives: 5, cash: 12, pe: 0 },
            sollAllocation: { aktien: 35, renten: 45, alternatives: 5, cash: 15, pe: 0 },
            performance: { ytd: 2.8, benchmark_ytd: 2.5, volatilitaet: 5.1, maxDrawdown: -2.5, sharpe: 0.85 },

            fremdVermoegen: [{ institut: 'Sparkasse Heidelberg', typ: 'Tagesgeld', volumen: 350000 }],
            immobilien: [
                { bezeichnung: 'Villa Heidelberg', wert: 2800000, typ: 'eigengenutzt' },
                { bezeichnung: 'ETW München', wert: 650000, typ: 'vermietet' }
            ],
            unternehmen: [],
            peBeteiligungen: [],

            wphgBogen: { status: 'vollstaendig', letzteAktualisierung: '2025-10-20', naechsteFaelligkeit: '2026-10-20' },
            geeignetheitsbericht: { letzter: 'Q4 2025', naechsterFaellig: '2026-04-15', status: 'erstellt' },
            verlustschwelle: { schwelle: 0.10, hoechststand: 7200000, hoechststandDatum: '2025-04-15' },
            exAnteKosten: { bereitgestellt: '2026-01-02', gesamtkosten: 54400, quote: 0.008 },
            exPostKosten: { bereitgestellt: '2026-02-28', gesamtkosten: 52800, quote: 0.0078 },

            managementFee: 0.008,
            ertragProJahr: 54400,

            kommunikation: [
                { typ: 'meeting', datum: '2026-01-20', betreff: 'Jahres-Review', notiz: 'Entnahmestrategie besprochen, 200k p.a.' },
                { typ: 'email', datum: '2026-03-01', betreff: 'Marktkommentar', notiz: 'Regulärer Monatsbericht' }
            ],
            nps: { score: 10 },
            avatarBg: '#805ad5',
            statusIcon: 'ok'
        },

        'Dr. Marcus Schreiber': {
            id: 'VV007',
            geburtsdatum: '1975-09-03',
            adresse: 'Taunusanlage 15, 60325 Frankfurt',
            beruf: 'Rechtsanwalt (Partner, M&A)',
            familienstand: 'verheiratet',
            telefon: '+49 69 112233',
            email: 'm.schreiber@schreiber-partner.de',
            kinder: [
                { name: 'Moritz', alter: 14, eigenesMandat: false },
                { name: 'Hannah', alter: 11, eigenesMandat: false }
            ],
            lebensphase: 'Akkumulation',

            segment: 'FairValue',
            mandatstyp: 'Individuelle Vermögensverwaltung',
            mandatSeit: '2021-09-01',
            aum: 4200000,
            aumHistory: [
                { monat: '2025-01', aum: 3800000 }, { monat: '2026-03', aum: 4200000 }
            ],
            netNewMoney: 600000,

            risikoprofil: 'Ausgewogen (3/5)',
            anlagerichtlinie: { maxAktien: 60, minRenten: 25, krypto: false, alternatives: true },
            esgPraeferenz: { sfdr: 'keine', taxonomie: 0, pai: false },
            benchmark: '55% MSCI World / 45% EB.REXX Govt',
            assetAllocation: { aktien: 55, renten: 28, alternatives: 10, cash: 4, pe: 3 },
            sollAllocation: { aktien: 55, renten: 28, alternatives: 10, cash: 4, pe: 3 },
            performance: { ytd: 6.5, benchmark_ytd: 5.9, volatilitaet: 7.8, maxDrawdown: -3.5, sharpe: 0.92 },

            fremdVermoegen: [{ institut: 'J.P. Morgan', typ: 'Depot', volumen: 1200000 }],
            immobilien: [{ bezeichnung: 'Penthouse Frankfurt', wert: 2200000, typ: 'eigengenutzt' }],
            unternehmen: [{ name: 'Schreiber & Partner PartGmbB', anteil: 25, schaetzwert: 3000000 }],
            peBeteiligungen: [{ fonds: 'Legal Tech Fund I', jahrgang: 2023, investiert: 300000 }],

            wphgBogen: { status: 'vollstaendig', letzteAktualisierung: '2025-07-15', naechsteFaelligkeit: '2026-07-15' },
            geeignetheitsbericht: { letzter: 'Q4 2025', naechsterFaellig: '2026-04-15', status: 'erstellt' },
            verlustschwelle: { schwelle: 0.10, hoechststand: 4300000, hoechststandDatum: '2026-02-20' },
            exAnteKosten: { bereitgestellt: '2026-01-02', gesamtkosten: 37800, quote: 0.009 },
            exPostKosten: { bereitgestellt: '2026-02-28', gesamtkosten: 36000, quote: 0.0088 },

            managementFee: 0.009,
            ertragProJahr: 37800,

            kommunikation: [
                { typ: 'anruf', datum: '2026-03-07', betreff: 'J.P. Morgan Konsolidierung', notiz: 'Interesse an Übertrag, will Konditionen vergleichen' }
            ],
            nps: { score: 8 },
            avatarBg: '#c4a35a',
            statusIcon: 'ok'
        },

        'Familie Bergmann-Roth': {
            id: 'VV008',
            geburtsdatum: '1968-12-01',
            adresse: 'Kronberger Str. 5, 61462 Königstein',
            beruf: 'Unternehmerin (Pharma-Zulieferer)',
            familienstand: 'verheiratet',
            telefon: '+49 6174 223344',
            email: 'a.bergmann-roth@bergmann-pharma.de',
            kinder: [
                { name: 'Julian', alter: 28, eigenesMandat: false },
                { name: 'Lena', alter: 25, eigenesMandat: false }
            ],
            lebensphase: 'Konsolidierung',

            segment: 'FairValue',
            mandatstyp: 'VV + Family Office',
            mandatSeit: '2016-03-01',
            aum: 18500000,
            aumHistory: [
                { monat: '2025-01', aum: 17200000 }, { monat: '2026-03', aum: 18500000 }
            ],
            netNewMoney: 3000000,

            risikoprofil: 'Ausgewogen (3/5)',
            anlagerichtlinie: { maxAktien: 55, minRenten: 25, krypto: false, alternatives: true },
            esgPraeferenz: { sfdr: 'Art. 9', taxonomie: 15, pai: true },
            benchmark: '50% MSCI World / 50% EB.REXX Govt',
            assetAllocation: { aktien: 48, renten: 30, alternatives: 12, cash: 3, pe: 7 },
            sollAllocation: { aktien: 50, renten: 28, alternatives: 12, cash: 3, pe: 7 },
            performance: { ytd: 7.4, benchmark_ytd: 6.8, volatilitaet: 7.5, maxDrawdown: -3.2, sharpe: 1.05 },

            fremdVermoegen: [{ institut: 'Credit Suisse', typ: 'Depot', volumen: 4500000 }],
            immobilien: [
                { bezeichnung: 'Villa Königstein', wert: 3500000, typ: 'eigengenutzt' },
                { bezeichnung: 'MFH Frankfurt', wert: 4200000, typ: 'vermietet' },
                { bezeichnung: 'Ferienhaus Mallorca', wert: 1800000, typ: 'eigengenutzt' }
            ],
            unternehmen: [{ name: 'Bergmann Pharma-Zulieferer GmbH', anteil: 80, schaetzwert: 22000000 }],
            peBeteiligungen: [
                { fonds: 'Healthcare Fund II', jahrgang: 2021, investiert: 1000000 },
                { fonds: 'Impact Fund I', jahrgang: 2023, investiert: 500000 }
            ],

            wphgBogen: { status: 'vollstaendig', letzteAktualisierung: '2025-12-01', naechsteFaelligkeit: '2026-12-01' },
            geeignetheitsbericht: { letzter: 'Q4 2025', naechsterFaellig: '2026-04-15', status: 'erstellt' },
            verlustschwelle: { schwelle: 0.10, hoechststand: 19000000, hoechststandDatum: '2026-02-10' },
            exAnteKosten: { bereitgestellt: '2026-01-02', gesamtkosten: 129500, quote: 0.007 },
            exPostKosten: { bereitgestellt: '2026-02-28', gesamtkosten: 125000, quote: 0.0068 },

            managementFee: 0.007,
            ertragProJahr: 129500,

            kommunikation: [
                { typ: 'meeting', datum: '2026-02-15', betreff: 'Family Office Review', notiz: 'Nachfolgeplanung für Julian und Lena besprochen' },
                { typ: 'email', datum: '2026-03-04', betreff: 'Credit Suisse Transfer', notiz: 'CS-Depot soll nach HRK LUNIS übertragen werden' }
            ],
            nps: { score: 9 },
            avatarBg: '#d69e2e',
            statusIcon: 'ok'
        }
    };

    // ── VV PIPELINE (Prospects) ──
    window.vvPipeline = [
        { name: 'Dr. Stefan Meier', stadium: 'analyse_vorschlag', volEst: 5000000, naechsterSchritt: 'Anlagevorschlag senden', datum: '2026-03-15' },
        { name: 'Familie Schneider', stadium: 'beratungsgespraech', volEst: 3000000, naechsterSchritt: 'WpHG-Bogen einholen', datum: '2026-03-12' },
        { name: 'Prof. König', stadium: 'kennenlerngespraech', volEst: 8000000, naechsterSchritt: 'Termin 18.03.', datum: '2026-03-18' },
        { name: 'Dr. Julia Wagner', stadium: 'lead', volEst: 2000000, naechsterSchritt: 'Erstansprache via Event', datum: '2026-03-20' },
        { name: 'Fam. Berger', stadium: 'lead', volEst: 4000000, naechsterSchritt: 'Empfehlung von Dr. von Trott', datum: '2026-03-22' },
        { name: 'Ehepaar Kern', stadium: 'kennenlerngespraech', volEst: 1500000, naechsterSchritt: 'Zweittermin vereinbaren', datum: '2026-03-14' },
        { name: 'Industriestiftung Blum', stadium: 'beratungsgespraech', volEst: 12000000, naechsterSchritt: 'Stiftungskonzept vorstellen', datum: '2026-03-16' },
        { name: 'Thomas Engel', stadium: 'lead', volEst: 800000, naechsterSchritt: 'SmartValue-Info versenden', datum: '2026-03-25' },
        { name: 'Dr. Anna Fischer', stadium: 'onboarding', volEst: 3500000, naechsterSchritt: 'Depoteröffnung abschließen', datum: '2026-03-11' },
        { name: 'Werner Krause', stadium: 'kennenlerngespraech', volEst: 6000000, naechsterSchritt: 'Vermögensaufstellung einholen', datum: '2026-03-19' },
        { name: 'Fam. Hohenlohe', stadium: 'analyse_vorschlag', volEst: 15000000, naechsterSchritt: 'Family Office Pitch', datum: '2026-03-17' },
        { name: 'Dr. Peter Stein', stadium: 'lead', volEst: 1200000, naechsterSchritt: 'Kontakt via LinkedIn', datum: '2026-03-28' }
    ];

    // ── OPT-26: Persona-Erweiterungen mergen (transaktionen, potentiale, linkedin) ──
    if (window._vvPersonaExtensions) {
        Object.keys(window._vvPersonaExtensions).forEach(function(name) {
            if (window.vvMockMandanten[name]) {
                Object.assign(window.vvMockMandanten[name], window._vvPersonaExtensions[name]);
            }
        });
    }

    // ── VV POTENTIALE ──
    window.vvPotentiale = [
        {
            kundenName: 'Dr. Heinrich von Trott', kundenId: 'VV001', prioritaet: 'hoch',
            produkt: 'Fremdbank-Konsolidierung', beschreibung: '3,2M € bei UBS Zürich → Konsolidierung vorschlagen, Gesamtbetreuung verbessern.',
            quelle: 'Bestandsdaten', volumen: 3200000, ertrag: 30400, status: 'identifiziert',
            letzteAktion: 'Thema im Quartals-Review angesprochen (20.02.)',
            herleitung: [
                { datenquelle: 'Client 360° Vermögensbilanz', erkenntnis: 'UBS Zürich Depot 2,8M €, DB Tagesgeld 400k €' },
                { datenquelle: 'Mandatsstrategie', erkenntnis: 'Konsolidierung ermöglicht bessere Gesamtallokation und niedrigere Kosten' }
            ]
        },
        {
            kundenName: 'Dr. Heinrich von Trott', kundenId: 'VV001', prioritaet: 'mittel',
            produkt: 'NextGen-Mandat (Tochter)', beschreibung: 'Charlotte von Trott (31), kein eigenes Mandat. SmartValue-Einstieg über Familienbindung.',
            quelle: 'Bestandsdaten', volumen: 500000, ertrag: 6000, status: 'identifiziert',
            letzteAktion: 'Gespräch mit Vater geplant (Q2)',
            herleitung: [
                { datenquelle: 'Familienstruktur', erkenntnis: 'Tochter Charlotte, 31, kein eigenes Mandat' },
                { datenquelle: 'Vermögensschätzung', erkenntnis: 'Erwartete Erbschaft + eigenes Vermögen → SmartValue geeignet' }
            ]
        },
        {
            kundenName: 'Dr. Heinrich von Trott', kundenId: 'VV001', prioritaet: 'mittel',
            produkt: 'Stiftungsgründung', beschreibung: 'Alter 62, hoher Vermögensbestand → Stiftung als Nachfolgeinstrument prüfen.',
            quelle: 'Bestandsdaten', volumen: 5000000, ertrag: 31000, status: 'identifiziert',
            letzteAktion: 'Thema noch nicht adressiert',
            herleitung: [
                { datenquelle: 'Lebensphasenanalyse', erkenntnis: 'Konsolidierung / Nachfolge, Unternehmer 3. Generation' },
                { datenquelle: 'Steueroptimierung', erkenntnis: 'Stiftung als Instrument für Vermögensnachfolge und Steueroptimierung' }
            ]
        },
        {
            kundenName: 'Winterberg GmbH', kundenId: 'VV004', prioritaet: 'hoch',
            produkt: 'Goldman Sachs Konsolidierung', beschreibung: '5M € bei Goldman Sachs → Transfer zu HRK LUNIS besprochen.',
            quelle: 'Bestandsdaten', volumen: 5000000, ertrag: 22500, status: 'angeschrieben',
            letzteAktion: 'Konditionsvergleich erstellt (06.03.)',
            herleitung: [
                { datenquelle: 'Client 360° Vermögensbilanz', erkenntnis: 'Goldman Sachs Depot 5M €' },
                { datenquelle: 'Kundengespräch', erkenntnis: 'Mandant prüft aktiv Konsolidierung' }
            ]
        },
        {
            kundenName: 'Familie Bergmann-Roth', kundenId: 'VV008', prioritaet: 'hoch',
            produkt: 'Credit Suisse Transfer', beschreibung: '4,5M € CS-Depot soll übertragen werden. Kundin hat Transfer initiiert.',
            quelle: 'Bestandsdaten', volumen: 4500000, ertrag: 31500, status: 'termin',
            letzteAktion: 'Transfer-Unterlagen versendet (04.03.)',
            herleitung: [
                { datenquelle: 'Kundenkommunikation', erkenntnis: 'Mandantin wünscht CS → HRK LUNIS Transfer' },
                { datenquelle: 'Vermögensbilanz', erkenntnis: 'Nach Transfer: AuM 23M €, Betreuungsquote 52%' }
            ]
        },
        {
            kundenName: 'Familie Bergmann-Roth', kundenId: 'VV008', prioritaet: 'mittel',
            produkt: 'NextGen-Mandat (Kinder)', beschreibung: 'Julian (28) und Lena (25), keine eigenen Mandate. Nachfolgeplanung läuft.',
            quelle: 'Bestandsdaten', volumen: 1000000, ertrag: 12000, status: 'identifiziert',
            letzteAktion: 'Thema im Family Office Review besprochen (15.02.)',
            herleitung: [
                { datenquelle: 'Familienstruktur', erkenntnis: 'Zwei Kinder im Mandats-fähigen Alter ohne eigene Mandate' },
                { datenquelle: 'Nachfolgeplanung', erkenntnis: 'Unternehmens-Nachfolge als Trigger für eigene Mandatseröffnung' }
            ]
        },
        {
            kundenName: 'Keller NextGen', kundenId: 'VV005', prioritaet: 'mittel',
            produkt: 'Trade Republic Konsolidierung', beschreibung: '180k € bei Trade Republic → SmartValue-Vollmandat attraktiver.',
            quelle: 'Bestandsdaten', volumen: 180000, ertrag: 2160, status: 'identifiziert',
            letzteAktion: 'Noch nicht angesprochen',
            herleitung: [
                { datenquelle: 'Vermögensbilanz', erkenntnis: 'Trade Republic Depot 180k € neben SmartValue-Mandat' },
                { datenquelle: 'Konsolidierungsvorteil', erkenntnis: 'Gesamtmandat ermöglicht bessere Diversifikation' }
            ]
        },
        {
            kundenName: 'Dr. Marcus Schreiber', kundenId: 'VV007', prioritaet: 'hoch',
            produkt: 'J.P. Morgan Konsolidierung', beschreibung: '1,2M € bei J.P. Morgan, Mandant prüft Konditionen.',
            quelle: 'Bestandsdaten', volumen: 1200000, ertrag: 10800, status: 'angeschrieben',
            letzteAktion: 'Konditionsvergleich versendet (07.03.)',
            herleitung: [
                { datenquelle: 'Kundengespräch', erkenntnis: 'Aktives Interesse an Konsolidierung' },
                { datenquelle: 'Kalkulation', erkenntnis: 'Kostenersparnis ca. 0,3pp p.a. bei Konsolidierung' }
            ]
        }
    ];

})();
