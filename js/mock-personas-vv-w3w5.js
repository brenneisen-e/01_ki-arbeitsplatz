// js/mock-personas-vv-w3w5.js – OPT-26: VV-Persona-Erweiterungen W3 + W4 + W5
// Ergaenzt bestehende Mandanten um transaktionen, potentiale (OPT-19), linkedin
// Wird VOR vv-mock-data.js geladen und dort per Object.assign gemerged

window._vvPersonaExtensions = window._vvPersonaExtensions || {};

// ── W3: Stiftung Weber – Stiftungsvorstand, 70, Stiftungsverwaltung ──
window._vvPersonaExtensions['Stiftung Weber'] = {

    linkedin: {
        profil: 'linkedin.com/company/weber-stiftung',
        headline: 'Weber-Stiftung | Foerderung von Bildung und Wissenschaft',
        connections: 450,
        recentPosts: [
            { datum: '2026-02-20', thema: 'Vergabe Forschungsstipendien 2026 – 12 neue Stipendiaten' },
            { datum: '2026-01-08', thema: 'Nachhaltigkeitsbericht 2025 veroeffentlicht' }
        ],
        lebensereignisse: [
            { typ: 'stiftungsratswahl', datum: '2026-06', details: 'Stiftungsratswahl anstehend – Vorstandserneuerung' },
            { typ: 'regulatorisch', datum: '2026-01', details: 'Neues Stiftungsrecht 2026 – Satzungsanpassung erforderlich' }
        ]
    },

    transaktionen: {
        monat: '2026-02',
        einnahmen: [
            { quelle: 'Ertraege HRK LUNIS Depot (Zinsen/Dividenden)', betrag: 18500, kategorie: 'kapitalertrag' },
            { quelle: 'Spendeneingaenge', betrag: 8000, kategorie: 'spende' },
            { quelle: 'Zuwendungen Foerdermittel Land Hessen', betrag: 5000, kategorie: 'foerdermittel', rhythmus: 'quartalsweise' }
        ],
        ausgaben: [
            { zweck: 'Stipendien und Foerderungen', betrag: 15000, kategorie: 'stiftungszweck' },
            { zweck: 'Verwaltung / Personal', betrag: 4500, kategorie: 'verwaltung' },
            { zweck: 'Stiftungshaus Betrieb', betrag: 2800, kategorie: 'immobilie' },
            { zweck: 'HRK LUNIS Management Fee', betrag: 4288, kategorie: 'vermoegensverw', rhythmus: 'quartalsweise' },
            { zweck: 'Steuerberatung / Wirtschaftspruefer', betrag: 1500, kategorie: 'beratung', rhythmus: 'quartalsweise' }
        ],
        sparquote: 0.11,
        cashflowNetto: 3412
    },

    potentiale: [
        {
            id: 'W3-P1',
            titel: 'Cash-Optimierung',
            produkt: 'Geldmarktfonds / Kurzlaeufer',
            beschreibung: 'Cash-Quote 9% vs. Soll 10%, aber absolute Summe 747k €. Optimierung durch kurzlaufende Anleihen statt Konto.',
            qpiQuelle: 'bestand',
            quellDetails: 'Asset Allocation: Cash 9% = 747k € auf Konto, Rendite nahe 0',
            prioritaet: 'mittel',
            volumen: 500000,
            ertragPotential: 15000,
            status: 'identifiziert',
            naechsteAktion: 'Geldmarktfonds-Vorschlag im Stiftungsrat praesentieren',
            faelligkeit: '2026-06-30'
        },
        {
            id: 'W3-P2',
            titel: 'ESG Art. 9 Vertiefung',
            produkt: 'Impact-Reporting + Taxonomie-Upgrade',
            beschreibung: 'Stiftung hat Art. 9 SFDR, aber Taxonomie nur 20%. Erhoehung auf 40% durch Green Bonds.',
            qpiQuelle: 'markt',
            quellDetails: 'Neues Stiftungsrecht 2026 erhoent ESG-Anforderungen',
            prioritaet: 'mittel',
            volumen: 0,
            ertragPotential: 0,
            status: 'identifiziert',
            naechsteAktion: 'Taxonomie-konformes Bond-Universum pruefen',
            faelligkeit: '2026-09-30'
        },
        {
            id: 'W3-P3',
            titel: 'Drift-Korrektur Aktienquote',
            produkt: 'Rebalancing',
            beschreibung: 'Aktienquote 28% vs. Soll 30%. Leichter Drift nach unten – Rebalancing empfohlen.',
            qpiQuelle: 'bestand',
            quellDetails: 'Portfolio-Monitoring: -2pp Aktien-Drift, statusIcon = drift',
            prioritaet: 'hoch',
            volumen: 0,
            ertragPotential: 0,
            status: 'identifiziert',
            naechsteAktion: 'Rebalancing-Vorschlag an Stiftungsrat',
            faelligkeit: '2026-04-15'
        },
        {
            id: 'W3-P4',
            titel: 'Neues Stiftungsrecht – Satzungsberatung',
            produkt: 'Stiftungs-Advisory',
            beschreibung: 'Stiftungsrecht 2026 erfordert Satzungsanpassung. Beratung als Mehrwertservice.',
            qpiQuelle: 'markt',
            quellDetails: 'Regulatorische Aenderung: Stiftungsrecht Reform 2026',
            prioritaet: 'hoch',
            volumen: 0,
            ertragPotential: 0,
            status: 'identifiziert',
            naechsteAktion: 'Kooperationsangebot mit Stiftungs-Rechtsanwalt',
            faelligkeit: '2026-06-30'
        }
    ]
};

// ── W4: Prof. Dr. Elisabeth Hartmann – Emeritierte Professorin, 68, Ruhestand/Entnahme ──
window._vvPersonaExtensions['Prof. Dr. Elisabeth Hartmann'] = {

    linkedin: {
        profil: 'linkedin.com/in/elisabeth-hartmann-prof',
        headline: 'Prof. Dr. med. | Emeritierte Professorin für Innere Medizin | Universität Heidelberg',
        connections: 2100,
        recentPosts: [
            { datum: '2026-01-28', thema: 'Ehrendoktorwuerde der Universitaet Wien – Dankesrede' },
            { datum: '2025-10-15', thema: 'Medizin im Wandel: 40 Jahre Kardiologie-Forschung' }
        ],
        lebensereignisse: [
            { typ: 'ehrung', datum: '2026-01', details: 'Ehrendoktorwuerde Universitaet Wien' },
            { typ: 'familienaenderung', datum: '2025-08', details: 'Enkelin geboren (Tochter Katharina)' }
        ]
    },

    transaktionen: {
        monat: '2026-02',
        einnahmen: [
            { quelle: 'Emeritierungs-Bezuege (Pension)', betrag: 8500, kategorie: 'pension' },
            { quelle: 'Dividenden/Zinsen HRK LUNIS Depot', betrag: 12000, kategorie: 'kapitalertrag' },
            { quelle: 'Mieteinnahmen ETW Muenchen', betrag: 2200, kategorie: 'miete' },
            { quelle: 'Sparkasse Tagesgeld Zinsen', betrag: 580, kategorie: 'kapitalertrag' },
            { quelle: 'Honorare Vortraege / Gutachten', betrag: 3000, kategorie: 'selbstaendig', rhythmus: 'unregelmaessig' }
        ],
        ausgaben: [
            { zweck: 'Lebenshaltung / Haushalt', betrag: 5500, kategorie: 'lebenshaltung' },
            { zweck: 'PKV (Ehepaar)', betrag: 1800, kategorie: 'versicherung' },
            { zweck: 'Reisen / Kultur', betrag: 3000, kategorie: 'freizeit' },
            { zweck: 'Entnahme aus Depot (Planentnahme)', betrag: 16667, kategorie: 'entnahme', rhythmus: 'monatlich', hinweis: '200k p.a. Entnahmestrategie' },
            { zweck: 'HRK LUNIS Management Fee', betrag: 4533, kategorie: 'vermoegensverw', rhythmus: 'quartalsweise' },
            { zweck: 'Spende Forschungsfoerderung', betrag: 1000, kategorie: 'spende' }
        ],
        sparquote: -0.06,
        cashflowNetto: -6220,
        hinweis: 'Netto negativ durch geplante Entnahme – Vermoegen wird planmaessig verzehrt'
    },

    potentiale: [
        {
            id: 'W4-P1',
            titel: 'Entnahme-Optimierung',
            produkt: 'Entnahmeplan-Restrukturierung',
            beschreibung: 'Aktuell 200k p.a. Entnahme bei AuM 6,8M €. AuM sinkt (7,1M → 6,8M). Entnahmequote 2,9% – nachhaltig, aber Optimierung moeglich.',
            qpiQuelle: 'bestand',
            quellDetails: 'AuM-History zeigt Rueckgang. Entnahmequote muss langfristig tragfaehig bleiben.',
            prioritaet: 'hoch',
            volumen: 0,
            ertragPotential: 0,
            status: 'identifiziert',
            naechsteAktion: 'Langfrist-Simulation mit verschiedenen Entnahmeszenarien',
            faelligkeit: '2026-04-30'
        },
        {
            id: 'W4-P2',
            titel: 'Sparkasse Tagesgeld Konsolidierung',
            produkt: 'AuM-Transfer Sparkasse → HRK LUNIS',
            beschreibung: '350k € bei Sparkasse Heidelberg, niedrig verzinst. Einbindung in Gesamtstrategie.',
            qpiQuelle: 'wettbewerb',
            quellDetails: 'Vermoegensbilanz: Sparkasse Tagesgeld 350k €, unter Marktrendite',
            prioritaet: 'mittel',
            volumen: 350000,
            ertragPotential: 2800,
            status: 'identifiziert',
            naechsteAktion: 'Im Jahres-Review Konsolidierung vorschlagen',
            faelligkeit: '2026-06-30'
        },
        {
            id: 'W4-P3',
            titel: 'Schenkungs-/Erbschaftsplanung',
            produkt: 'Vermoegensstrukturierung',
            beschreibung: 'Alter 68, hohes Vermoegen (6,8M + Immo 3,45M). Schenkungen an Alexander (38) und Katharina (35) optimieren.',
            qpiQuelle: 'lebensereignis',
            quellDetails: 'Enkelin geboren – generationenuebergreifende Planung relevant',
            prioritaet: 'mittel',
            volumen: 1000000,
            ertragPotential: 8000,
            status: 'identifiziert',
            naechsteAktion: 'Schenkungs-Steuerfreibetraege pruefen, Generationen-Gespraech',
            faelligkeit: '2026-09-30'
        },
        {
            id: 'W4-P4',
            titel: 'ETW Muenchen Verkaufserloes',
            produkt: 'AuM-Aufstockung',
            beschreibung: 'Vermietete ETW Muenchen 650k €. Bei Verkauf fliesst Erloes ins Depot – Kompensation fuer Entnahmen.',
            qpiQuelle: 'bestand',
            quellDetails: 'Immobilien-Portfolio: ETW Muenchen vermietet, Alter 68 → Vereinfachung',
            prioritaet: 'niedrig',
            volumen: 650000,
            ertragPotential: 5200,
            status: 'identifiziert',
            naechsteAktion: 'Immobilien-Review: Halten vs. Verkaufen',
            faelligkeit: '2027-06-30'
        },
        {
            id: 'W4-P5',
            titel: 'Pflege-/Vorsorgevollmacht',
            produkt: 'Estate Planning Service',
            beschreibung: 'Alter 68, verwitwet-Status unklar (familienstand "verheiratet" aber NPS 10 = stabil). Vorsorgevollmacht pruefen.',
            qpiQuelle: 'lebensereignis',
            quellDetails: 'Altersbedingte Vorsorge: Vollmachten, Patientenverfuegung, Testament',
            prioritaet: 'mittel',
            volumen: 0,
            ertragPotential: 0,
            status: 'identifiziert',
            naechsteAktion: 'Estate-Planning-Check im naechsten Gespraech anbieten',
            faelligkeit: '2026-06-30'
        }
    ]
};

// ── W5: Keller NextGen – Tech-Unternehmer, 33, Vermoegensaufbau ──
window._vvPersonaExtensions['Keller NextGen'] = {

    linkedin: {
        profil: 'linkedin.com/in/max-keller-tech',
        headline: 'Founder & CEO | KellerTech GmbH | AI-driven Supply Chain',
        connections: 3200,
        recentPosts: [
            { datum: '2026-03-02', thema: 'Series B closed! 8M € fuer KellerTech – Danke an alle Investoren' },
            { datum: '2026-01-20', thema: 'Hiring: 15 neue Stellen in Frankfurt und remote' }
        ],
        lebensereignisse: [
            { typ: 'funding', datum: '2026-03', details: 'Series B 8M € abgeschlossen – persoenlicher Anteil steigt' },
            { typ: 'wphg_ueberfaellig', datum: '2025-12', details: 'WpHG-Bogen seit 12/2025 ueberfaellig' }
        ]
    },

    transaktionen: {
        monat: '2026-02',
        einnahmen: [
            { quelle: 'Geschaeftsfuehrer-Gehalt KellerTech', betrag: 8000, kategorie: 'gehalt' },
            { quelle: 'Dividenden Trade Republic Depot', betrag: 120, kategorie: 'kapitalertrag' },
            { quelle: 'HRK LUNIS Depot Ertraege', betrag: 280, kategorie: 'kapitalertrag' }
        ],
        ausgaben: [
            { zweck: 'Miete Wohnung Frankfurt', betrag: 1800, kategorie: 'miete' },
            { zweck: 'Lebenshaltung', betrag: 2500, kategorie: 'lebenshaltung' },
            { zweck: 'Sparplan Trade Republic', betrag: 1500, kategorie: 'investition' },
            { zweck: 'Sparplan HRK LUNIS SmartValue', betrag: 2000, kategorie: 'investition' },
            { zweck: 'HRK LUNIS Management Fee', betrag: 450, kategorie: 'vermoegensverw', rhythmus: 'quartalsweise' }
        ],
        sparquote: 0.01,
        cashflowNetto: 150
    },

    potentiale: [
        {
            id: 'W5-P1',
            titel: 'Trade Republic Konsolidierung',
            produkt: 'AuM-Transfer TR → SmartValue',
            beschreibung: '180k € bei Trade Republic neben SmartValue-Mandat. Konsolidierung = bessere Diversifikation + Gesamtueberblick.',
            qpiQuelle: 'wettbewerb',
            quellDetails: 'Vermoegensbilanz: TR Depot 180k € parallel zu SmartValue',
            prioritaet: 'mittel',
            volumen: 180000,
            ertragPotential: 2160,
            status: 'identifiziert',
            naechsteAktion: 'Kostenvergleich TR vs. SmartValue erstellen',
            faelligkeit: '2026-06-30'
        },
        {
            id: 'W5-P2',
            titel: 'Series B Erloese einbinden',
            produkt: 'AuM-Aufstockung nach Liquiditaetsevent',
            beschreibung: 'Series B 8M € abgeschlossen. Persoenlicher Anteil steigt – kuenftige Liquiditaet (Teilverkauf, Dividende) fuer AuM.',
            qpiQuelle: 'lebensereignis',
            quellDetails: 'LinkedIn: Series B 8M € – KellerTech Bewertung steigt auf ca. 25M €',
            prioritaet: 'hoch',
            volumen: 500000,
            ertragPotential: 6000,
            status: 'identifiziert',
            naechsteAktion: 'Gespraech zu Vermoegensplanung nach Series B',
            faelligkeit: '2026-06-30'
        },
        {
            id: 'W5-P3',
            titel: 'WpHG-Bogen Erneuerung (DRINGEND)',
            produkt: 'Compliance-Update',
            beschreibung: 'WpHG-Bogen seit 12/2025 ueberfaellig. Regulatorisch kritisch – sofortige Aktualisierung erforderlich.',
            qpiQuelle: 'bestand',
            quellDetails: 'Compliance-Monitoring: wphgBogen.status = aktualisierung_noetig',
            prioritaet: 'hoch',
            volumen: 0,
            ertragPotential: 0,
            status: 'angesprochen',
            naechsteAktion: 'Digitalen WpHG-Bogen per E-Mail senden, Follow-up Anruf',
            faelligkeit: '2026-03-31'
        },
        {
            id: 'W5-P4',
            titel: 'Underperformance adressieren',
            produkt: 'Strategieanpassung',
            beschreibung: 'YTD +4,2% vs. Benchmark +5,5% (= -130bps). Cash 7% vs. Soll 5%. Alternatives 8% vs. Soll 10%.',
            qpiQuelle: 'bestand',
            quellDetails: 'Performance-Monitoring: Sharpe 0,58 (niedrig), Cash-Drag',
            prioritaet: 'hoch',
            volumen: 0,
            ertragPotential: 0,
            status: 'identifiziert',
            naechsteAktion: 'Rebalancing-Vorschlag: Cash → Alternatives',
            faelligkeit: '2026-03-31'
        },
        {
            id: 'W5-P5',
            titel: 'Key-Man-Versicherung / BU',
            produkt: 'Versicherungsberatung (Cross-Sell)',
            beschreibung: 'Tech-Gruender, 33, Alleingesellschafter 60%. Keine Key-Man-Absicherung erkennbar. BU kritisch.',
            qpiQuelle: 'bestand',
            quellDetails: 'Unternehmensbeteiligung 60% an KellerTech + keine Versicherungen im Mandat',
            prioritaet: 'mittel',
            volumen: 0,
            ertragPotential: 0,
            status: 'identifiziert',
            naechsteAktion: 'Kooperation mit R+V / Versicherungsberater anbieten',
            faelligkeit: '2026-06-30'
        }
    ]
};
