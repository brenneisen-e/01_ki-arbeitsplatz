// js/unified-potentiale.js – UNIFY-01: Unified Potentiale Layout
// Replaces separate implementations in potentiale.js (A-02) and
// agentur-overview-banking.js fillBeraterPotentiale() (B-02)
// with one mode-agnostic renderer driven by mode-config.js.

(function() {
    'use strict';

    // ========================================
    // SVG ICONS (stroke-only, monochrome)
    // ========================================
    var ICONS = {
        users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>',
        star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
        euro: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M17 9.5C16.17 7.46 14.21 6 12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.21 0 4.17-1.46 5-3.5"/><line x1="3" y1="10" x2="13" y2="10"/><line x1="3" y1="14" x2="13" y2="14"/></svg>',
        'trending-up': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>',
        zap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
        chevronDown: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="6 9 12 15 18 9"/></svg>',
        user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
        calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
        fileText: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
        edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
        arrowRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
        briefcase: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>',
        layers: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>',
        'alert-triangle': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
    };

    function getIcon(name) {
        return ICONS[name] || '';
    }

    // ========================================
    // UNIFIED POTENTIALE DATA
    // ========================================

    // Versicherung potentiale (derived from impulseData in potentiale.js)
    window.vertriebsPotentiale = [
        {
            kundenName: 'Peter Schmidt', kundenId: 'KD00001', prioritaet: 'hoch',
            produkt: 'Risikolebensversicherung', beschreibung: 'Hypothek \u20AC285.000 bei Sparkasse ohne Restschuldversicherung. Risikoleben \u20AC300.000, Laufzeit 20 Jahre empfohlen.',
            quelle: 'Open Finance', volumen: 6000, ertrag: 540, status: 'angeschrieben',
            letzteAktion: 'Angebot per E-Mail versendet (08.03.)',
            herleitung: [
                { datenquelle: 'Open Finance - Kreditdaten (Sparkasse)', erkenntnis: 'Baufinanzierung \u20AC285.000 ohne Absicherung' },
                { datenquelle: 'Bestandsdaten', erkenntnis: 'Verheiratet, 2 Kinder (8 + 5 Jahre) \u2013 hoher Absicherungsbedarf' },
                { datenquelle: 'Kalkulation', erkenntnis: 'Risikoleben \u20AC300.000, ca. \u20AC25/Monat, Provision \u20AC540' }
            ]
        },
        {
            kundenName: 'Peter Schmidt', kundenId: 'KD00001', prioritaet: 'hoch',
            produkt: 'Fondspolice statt ETF-Depot', beschreibung: 'Depot \u20AC85.000 bei DWS, Sparrate \u20AC800/Mon. Fondsgebundene RV mit Steuervorteil + Todesfallschutz.',
            quelle: 'Open Finance', volumen: 85000, ertrag: 3400, status: 'identifiziert',
            letzteAktion: 'Open Finance Abgleich (heute)',
            herleitung: [
                { datenquelle: 'Open Finance - Investmentdaten (DWS)', erkenntnis: 'Hohe Sparrate \u20AC800/Mon., Depot \u20AC85.000 ohne Steueroptimierung' },
                { datenquelle: 'Steuerberechnung', erkenntnis: 'Halbeink\u00FCnfteverfahren spart ca. \u20AC19.137 \u00FCber 25 Jahre' }
            ]
        },
        {
            kundenName: 'Peter Schmidt', kundenId: 'KD00001', prioritaet: 'hoch',
            produkt: 'Kfz-Wechsel', beschreibung: 'Kfz bei Allianz l\u00E4uft aus, Ersparnis ca. \u20AC180/Jahr m\u00F6glich. Vergleichsangebot erstellen.',
            quelle: 'Open Finance', volumen: 540, ertrag: 95, status: 'termin',
            letzteAktion: 'Termin vereinbart f\u00FCr 14.03.',
            herleitung: [
                { datenquelle: 'Open Finance - Versicherungsdaten', erkenntnis: 'Kfz-Vertrag bei Allianz endet 30.11.2025' },
                { datenquelle: 'Tarifvergleich', erkenntnis: 'Ersparnis ca. \u20AC180/Jahr bei vergleichbarem Schutz' }
            ]
        },
        {
            kundenName: 'Amira K\u00F6nig', kundenId: 'KD00002', prioritaet: 'hoch',
            produkt: 'BU-Nachversicherung', beschreibung: 'BU-Absicherung 1.500\u20AC/Mon. bei Netto 3.680\u20AC \u2013 nur 41% abgesichert. Aufstockung um 1.100\u20AC empfohlen.',
            quelle: 'PSD2', volumen: 1800, ertrag: 2160, status: 'identifiziert',
            letzteAktion: 'Deckungsl\u00FCcke erkannt (07.03.)',
            herleitung: [
                { datenquelle: 'PSD2 - Gehaltsdaten', erkenntnis: 'Netto-Gehalt \u20AC3.680/Monat' },
                { datenquelle: 'Eigener Vertrag (BU)', erkenntnis: 'Aktuelle BU: \u20AC1.500/Mon. \u2013 Deckungsl\u00FCcke \u20AC2.180/Mon.' },
                { datenquelle: 'Empfehlung', erkenntnis: 'Aufstockung um \u20AC1.100/Mon., Mehrpr\u00E4mie ca. \u20AC120\u2013150/Mon.' }
            ]
        },
        {
            kundenName: 'Amira K\u00F6nig', kundenId: 'KD00002', prioritaet: 'mittel',
            produkt: 'Rechtsschutz Cross-Sell', beschreibung: 'Kein Rechtsschutz vorhanden, Familie mit Immobilienbesitz. Privat- und Immobilienrechtsschutz empfohlen.',
            quelle: 'Bestandsdaten', volumen: 300, ertrag: 45, status: 'identifiziert',
            letzteAktion: 'Bestandsanalyse (05.03.)',
            herleitung: [
                { datenquelle: 'Bestandsdaten', erkenntnis: 'Kein Rechtsschutzvertrag, aber Immobilie + Familie' },
                { datenquelle: 'Kalkulation', erkenntnis: 'Privat- und Immobilienrechtsschutz ca. \u20AC25/Monat' }
            ]
        },
        {
            kundenName: 'Amira K\u00F6nig', kundenId: 'KD00002', prioritaet: 'niedrig',
            produkt: 'Tierhalter-Haftpflicht', beschreibung: 'Hinweise auf Tierhaltung aus Kontoumsätzen (Fressnapf, Tierarzt). Tierhalterhaftpflicht ab ca. \u20AC5/Monat.',
            quelle: 'PSD2', volumen: 60, ertrag: 9, status: 'identifiziert',
            letzteAktion: 'Transaktionsanalyse (05.03.)',
            herleitung: [
                { datenquelle: 'Open Finance - Kontoumsätze', erkenntnis: 'Fressnapf \u20AC45/Mon., Tierarztpraxis \u20AC120 (Sep. 2025)' },
                { datenquelle: 'Bestandspr\u00FCfung', erkenntnis: 'Kein Tierhalterhaftpflicht-Vertrag vorhanden' }
            ]
        },
        {
            kundenName: 'Thomas Weber', kundenId: 'KD00003', prioritaet: 'mittel',
            produkt: 'Hausratversicherung pr\u00FCfen', beschreibung: 'Letzte Anpassung vor 5 Jahren, Wohnfl\u00E4che 120m\u00B2. Deckungssumme und Fahrraddiebstahl pr\u00FCfen.',
            quelle: 'Bestandsdaten', volumen: 120, ertrag: 18, status: 'angeschrieben',
            letzteAktion: 'Erinnerung per Brief (03.03.)',
            herleitung: [
                { datenquelle: 'Bestandsdaten', erkenntnis: 'Letzte Anpassung vor 5 Jahren, 120m\u00B2 Wohnfl\u00E4che' },
                { datenquelle: 'Empfehlung', erkenntnis: 'Deckungssumme pr\u00FCfen, ggf. Fahrraddiebstahl erg\u00E4nzen' }
            ]
        },
        {
            kundenName: 'Thomas Weber', kundenId: 'KD00003', prioritaet: 'niedrig',
            produkt: 'Umschuldung Konsumentenkredit', beschreibung: 'Targobank Kredit 9,0% p.a. \u2013 Umschuldung zu 4,9% m\u00F6glich. Ersparnis \u20AC756.',
            quelle: 'Open Finance', volumen: 12500, ertrag: 375, status: 'abgeschlossen',
            letzteAktion: 'Umschuldung abgeschlossen (01.03.)',
            herleitung: [
                { datenquelle: 'Open Finance - Kreditdaten (Targobank)', erkenntnis: 'Konsumentenkredit \u20AC12.500, Zinssatz 9,0% p.a.' },
                { datenquelle: 'Vergleichsangebot', erkenntnis: 'Santander BestCredit 4,9% p.a., Ersparnis \u20AC756' }
            ]
        }
    ];

    // Banking potentiale (derived from fillBeraterPotentiale in agentur-overview-banking.js)
    window.bankPotentiale = [
        {
            kundenName: 'Klaus Fischer', kundenId: 'KDB001', prioritaet: 'hoch',
            produkt: 'Anschlussfinanzierung (DZ HYP / M\u00FCnchener Hyp)', beschreibung: 'Zinsbindung l\u00E4uft 09/2026 aus. Restschuld 185k. Forward-Darlehen mit g\u00FCnstigeren Konditionen \u00FCber DZ HYP oder M\u00FCnchener Hypothekenbank m\u00F6glich.',
            quelle: 'Truuco', volumen: 185000, ertrag: 2775, status: 'angeschrieben',
            letzteAktion: 'Konditionen-Vergleich zugesandt (09.03.)',
            herleitung: [
                { datenquelle: 'Bestandsanalyse', erkenntnis: 'Baufinanzierung Restschuld \u20AC185.000, Zinssatz 3,2%' },
                { datenquelle: 'Marktdaten', erkenntnis: 'Aktuelle Forward-Konditionen ab 2,4% \u2013 Ersparnis ca. 0,8% p.a.' },
                { datenquelle: 'Verbundpartner', erkenntnis: 'DZ HYP / M\u00FCnchener Hyp \u2013 Erwarteter Ertrag \u20AC2.775/a' }
            ]
        },
        {
            kundenName: 'Sandra M\u00FCller', kundenId: 'KDB002', prioritaet: 'hoch',
            produkt: 'VR-FinanzPlan + Union Investment Sparplan', beschreibung: 'Sparquote 1.800/Mon. ohne Altersvorsorge. Open Finance zeigt nur Tagesgeld bei ING. UnionDepot mit Verm\u00F6genPlus-Beratung empfohlen.',
            quelle: 'Truuco/FIDA', volumen: 6000, ertrag: 1800, status: 'termin',
            letzteAktion: 'Beratungstermin am 15.03.',
            herleitung: [
                { datenquelle: 'FIDA - ING Kontodaten', erkenntnis: 'Sparquote \u20AC1.800/Mon., nur Tagesgeld, keine Altersvorsorge' },
                { datenquelle: 'Bedarfsanalyse', erkenntnis: 'VR-FinanzPlan zeigt Vorsorge-L\u00FCcke von ca. \u20AC800/Mon.' },
                { datenquelle: 'Verbundpartner', erkenntnis: 'Union Investment UnionDepot + Verm\u00F6genPlus empfohlen' }
            ]
        },
        {
            kundenName: 'Markus Wagner', kundenId: 'KDB003', prioritaet: 'mittel',
            produkt: 'VR-MeinDepot + ETF-Sparplan', beschreibung: 'Depot bei Trade Republic (FIDA). Umzug in VR-MeinDepot mit pers\u00F6nlicher Beratung und niedrigeren Kosten ab 4,95\u20AC/Trade.',
            quelle: 'FIDA', volumen: 45000, ertrag: 675, status: 'identifiziert',
            letzteAktion: 'FIDA-Daten abgeglichen (heute)',
            herleitung: [
                { datenquelle: 'FIDA - Trade Republic', erkenntnis: 'Depotvolumen \u20AC45.000, \u00FCberwiegend ETFs' },
                { datenquelle: 'Konditionsvergleich', erkenntnis: 'VR-MeinDepot: 4,95\u20AC/Trade vs. Trade Republic 1\u20AC, aber pers\u00F6nliche Beratung' }
            ]
        },
        {
            kundenName: 'Julia Becker', kundenId: 'KDB004', prioritaet: 'hoch',
            produkt: 'FIDA-Consent + Wero-Aktivierung', beschreibung: 'Nur 2 Produkte. Open Finance Consent einholen. Wero als Einstieg in digitale VR-Welt, dann VR-FinanzPlan.',
            quelle: 'Impulsmanager', volumen: 0, ertrag: 500, status: 'identifiziert',
            letzteAktion: 'Potential erkannt (08.03.)',
            herleitung: [
                { datenquelle: 'Bestandsanalyse', erkenntnis: 'Nur 2 Produkte (Girokonto + Sparkonto), niedrige Produktbreite' },
                { datenquelle: 'Impulsmanager', erkenntnis: 'FIDA-Consent + Wero-Onboarding als Einstieg in digitales \u00D6kosystem' }
            ]
        },
        {
            kundenName: 'Peter Hoffmann', kundenId: 'KDB005', prioritaet: 'mittel',
            produkt: 'Verm\u00F6genPlus (Union Investment)', beschreibung: '120k auf Tagesgeld. Digitale Fondsverm\u00F6gensverwaltung Verm\u00F6genPlus empfohlen (0,80-1,25% Geb\u00FChren je Volumen).',
            quelle: 'Truuco', volumen: 120000, ertrag: 1800, status: 'angeschrieben',
            letzteAktion: 'Infomaterial zugesandt (07.03.)',
            herleitung: [
                { datenquelle: 'Bestandsanalyse', erkenntnis: '\u20AC120.000 auf Tagesgeld bei nur 1,2% Verzinsung' },
                { datenquelle: 'Verbundpartner', erkenntnis: 'Verm\u00F6genPlus (Union Investment): erwartete Rendite 4-6% p.a.' }
            ]
        },
        {
            kundenName: 'Andrea Lang', kundenId: 'KDB006', prioritaet: 'mittel',
            produkt: 'VR Smart Finanz Praxiskredit', beschreibung: 'Kanzleierweiterung geplant. KMU-Kredit \u00FCber VR Smart Finanz inkl. KfW-F\u00F6rderung.',
            quelle: 'Impulsmanager', volumen: 80000, ertrag: 1200, status: 'identifiziert',
            letzteAktion: 'Im Gespr\u00E4ch beim letzten Beratungstermin (04.03.)',
            herleitung: [
                { datenquelle: 'Beratungshistorie', erkenntnis: 'Kanzleierweiterung erw\u00E4hnt beim letzten Termin' },
                { datenquelle: 'Impulsmanager', erkenntnis: 'VR Smart Finanz Praxiskredit + KfW-F\u00F6rderung m\u00F6glich' }
            ]
        },
        {
            kundenName: 'Thomas Klein', kundenId: 'KDB007', prioritaet: 'niedrig',
            produkt: 'VR-KlimaKredit + KfW-F\u00F6rderung', beschreibung: 'Immobilie Bj. 1975. VR-KlimaKredit bis 75.000\u20AC f\u00FCr energieeffiziente Sanierung. KfW-F\u00F6rdermittel beantragen.',
            quelle: 'Truuco', volumen: 75000, ertrag: 1125, status: 'identifiziert',
            letzteAktion: 'Potential erkannt (06.03.)',
            herleitung: [
                { datenquelle: 'Bestandsdaten', erkenntnis: 'Immobilie Baujahr 1975, energetische Sanierung sinnvoll' },
                { datenquelle: 'Verbundpartner', erkenntnis: 'VR-KlimaKredit bis \u20AC75.000 + KfW-F\u00F6rdermittel' }
            ]
        },
        {
            kundenName: 'Stefan Braun', kundenId: 'KDB009', prioritaet: 'hoch',
            produkt: 'VR-FinanzPlan + Digitale girocard', beschreibung: 'IT-affin, hohes Einkommen, kaum VR-Produkte. VR Banking App + digitale girocard als Einstieg, dann FinanzPlan.',
            quelle: 'Impulsmanager', volumen: 0, ertrag: 400, status: 'angeschrieben',
            letzteAktion: 'VR Banking App Demo-Link gesendet (08.03.)',
            herleitung: [
                { datenquelle: 'Bestandsanalyse', erkenntnis: 'Hohes Einkommen, kaum VR-Produkte, IT-affin' },
                { datenquelle: 'Impulsmanager', erkenntnis: 'Digitale Produkte als Einstieg, dann VR-FinanzPlan' }
            ]
        },
        {
            kundenName: 'Katharina Wolf', kundenId: 'KDB010', prioritaet: 'mittel',
            produkt: 'R+V Risikolebensversicherung', beschreibung: 'Junge Familie, Baufinanzierung 180k ohne Todesfallabsicherung. R+V Premium mit Nachversicherungsgarantie.',
            quelle: 'Truuco', volumen: 480, ertrag: 360, status: 'termin',
            letzteAktion: 'Beratungstermin am 12.03.',
            herleitung: [
                { datenquelle: 'Bestandsanalyse', erkenntnis: 'Baufinanzierung \u20AC180.000 ohne Todesfallabsicherung' },
                { datenquelle: 'Verbundpartner R+V', erkenntnis: 'R+V Premium RLV mit Nachversicherungsgarantie empfohlen' }
            ]
        },
        {
            kundenName: 'J\u00FCrgen Peters', kundenId: 'KDB011', prioritaet: 'hoch',
            produkt: 'DZ PRIVATBANK Nachfolgeplanung', beschreibung: 'Gesch\u00E4ftsf\u00FChrer, 60 Jahre. DZ PRIVATBANK f\u00FCr Nachfolge + Stiftungsberatung. Kapital-LV bei Swiss Life l\u00E4uft 2028 ab (FIDA).',
            quelle: 'Truuco/FIDA', volumen: 0, ertrag: 5000, status: 'termin',
            letzteAktion: 'Termin mit DZ PRIVATBANK am 18.03.',
            herleitung: [
                { datenquelle: 'Bestandsanalyse', erkenntnis: 'Gesch\u00E4ftsf\u00FChrer, 60 Jahre \u2013 Nachfolgeplanung relevant' },
                { datenquelle: 'FIDA', erkenntnis: 'Kapital-LV bei Swiss Life l\u00E4uft 2028 ab \u2013 Wiederanlage' },
                { datenquelle: 'Verbundpartner', erkenntnis: 'DZ PRIVATBANK Nachfolge- + Stiftungsberatung' }
            ]
        },
        {
            kundenName: 'Sabine Kraus', kundenId: 'KDB012', prioritaet: 'niedrig',
            produkt: 'UnionDepot + GENO Broker Depot-Wechsel', beschreibung: '52k Depot bei Comdirect (FIDA). Wechsel zu UnionDepot oder GENO Broker mit pers\u00F6nlicher Beratung.',
            quelle: 'FIDA', volumen: 30000, ertrag: 450, status: 'identifiziert',
            letzteAktion: 'FIDA-Daten abgeglichen (06.03.)',
            herleitung: [
                { datenquelle: 'FIDA - Comdirect', erkenntnis: 'Depotvolumen \u20AC52.000, \u00FCberwiegend Einzelaktien' },
                { datenquelle: 'Konditionsvergleich', erkenntnis: 'UnionDepot / GENO Broker mit pers\u00F6nlicher Beratung' }
            ]
        }
    ];

    // ========================================
    // CUSTOMER PHOTOS MAP
    // ========================================
    var kundenFotos = {
        // Versicherung
        'Peter Schmidt': 'assets/images/AdobeStock_624564221.jpeg',
        'Amira König': 'assets/images/AdobeStock_252262042.jpeg',
        'Thomas Weber': 'assets/images/AdobeStock_361342769.jpeg',
        'Sabine Danzig': 'assets/images/AdobeStock_612932760.jpeg',
        // Banking
        'Klaus Fischer': 'assets/images/AdobeStock_624564221.jpeg',
        'Sandra Müller': 'assets/images/AdobeStock_252262042.jpeg',
        'Markus Wagner': 'assets/images/AdobeStock_361342769.jpeg',
        'Julia Becker': 'assets/images/AdobeStock_612932760.jpeg',
        'Peter Hoffmann': 'assets/images/AdobeStock_1091012713.jpeg'
    };

    function getKundenAvatar(name) {
        var foto = kundenFotos[name];
        if (foto) {
            return '<div class="unified-pot-avatar"><img src="' + foto + '" alt="' + name + '"></div>';
        }
        // Fallback: initials
        var parts = name.split(' ');
        var initials = (parts[0] ? parts[0][0] : '') + (parts[1] ? parts[1][0] : '');
        return '<div class="unified-pot-avatar unified-pot-avatar-initials">' + initials + '</div>';
    }

    // ========================================
    // HELPER FUNCTIONS
    // ========================================

    function formatCurrency(val) {
        if (val === 0 || val === null || val === undefined) return 'n/a';
        return '\u20AC' + Number(val).toLocaleString('de-DE');
    }

    function formatPercent(val) {
        if (val === null || val === undefined) return '0%';
        return val.toFixed(1).replace('.', ',') + '%';
    }

    function prioLabel(p) {
        if (p === 'hoch' || p === 'high') return 'Hoch';
        if (p === 'mittel' || p === 'medium') return 'Mittel';
        return 'Niedrig';
    }

    function prioClass(p) {
        if (p === 'hoch' || p === 'high') return 'high';
        if (p === 'mittel' || p === 'medium') return 'medium';
        return 'low';
    }

    function statusLabel(s, config) {
        var labels = config.potentiale.statusLabels;
        return (labels && labels[s]) || s;
    }


    // ========================================
    // KPI BOXES
    // ========================================

    function computeKPIs(potentiale, config) {
        var total = potentiale.length;
        var prioritized = potentiale.filter(function(p) { return p.prioritaet === 'hoch' || p.prioritaet === 'high'; }).length;
        var totalVolume = 0;
        var completed = 0;
        for (var i = 0; i < potentiale.length; i++) {
            totalVolume += (potentiale[i].volumen || 0);
            if (potentiale[i].status === 'abgeschlossen') completed++;
        }
        var conversionRate = total > 0 ? (completed / total) * 100 : 0;

        var kpiBoxes = config.potentiale.kpiBoxes;
        var values = {};
        for (var j = 0; j < kpiBoxes.length; j++) {
            var box = kpiBoxes[j];
            switch (box.key) {
                case 'consent': values[box.key] = total; break;
                case 'total': values[box.key] = total; break;
                case 'identified': values[box.key] = potentiale.filter(function(p) { return p.status === 'identifiziert'; }).length; break;
                case 'prioritized': values[box.key] = prioritized; break;
                case 'volume': values[box.key] = totalVolume; break;
                case 'conversion': values[box.key] = conversionRate; break;
                default: values[box.key] = 0;
            }
        }
        return values;
    }

    function renderKPIBoxes(kpiValues, config) {
        var boxes = config.potentiale.kpiBoxes;
        var html = '<div class="unified-pot-kpis">';
        for (var i = 0; i < boxes.length; i++) {
            var box = boxes[i];
            var val = kpiValues[box.key];
            var formatted;
            if (box.format === 'currency') formatted = formatCurrency(val);
            else if (box.format === 'percent') formatted = formatPercent(val);
            else formatted = String(val);

            html += '<div class="unified-pot-kpi-box">' +
                '<div class="unified-pot-kpi-icon">' + getIcon(box.icon) + '</div>' +
                '<div class="unified-pot-kpi-value">' + formatted + '</div>' +
                '<div class="unified-pot-kpi-label">' + box.label + '</div>' +
                '</div>';
        }
        html += '</div>';
        return html;
    }


    // ========================================
    // PIPELINE FUNNEL
    // ========================================

    function computePipeline(potentiale, config) {
        var steps = config.potentiale.pipelineSteps;
        var counts = {};
        for (var i = 0; i < steps.length; i++) counts[steps[i]] = 0;
        for (var j = 0; j < potentiale.length; j++) {
            var s = potentiale[j].status;
            if (typeof counts[s] !== 'undefined') counts[s]++;
        }
        return counts;
    }

    function renderPipeline(pipelineCounts, config) {
        var steps = config.potentiale.pipelineSteps;
        var labels = config.potentiale.statusLabels;
        var total = 0;
        for (var i = 0; i < steps.length; i++) total += pipelineCounts[steps[i]];

        // Color stops for the funnel gradient (blue to green)
        var colors = ['#3b82f6', '#6366f1', '#8b5cf6', '#059669'];
        var bgColors = ['#eff6ff', '#eef2ff', '#f5f3ff', '#ecfdf5'];

        var html = '<div class="unified-pot-pipeline">' +
            '<div class="unified-pot-pipeline-label">Pipeline</div>' +
            '<div class="unified-pot-pipeline-funnel">';
        for (var j = 0; j < steps.length; j++) {
            var count = pipelineCounts[steps[j]];
            var colorIdx = Math.min(j, colors.length - 1);
            var accentColor = colors[colorIdx];
            var bgColor = bgColors[colorIdx];
            var isLast = j === steps.length - 1;

            html += '<div class="unified-pot-pipeline-stage' + (isLast ? ' stage-final' : '') + '">' +
                '<div class="unified-pot-pipeline-stage-bar" style="background:' + bgColor + ';border-bottom:3px solid ' + accentColor + ';">' +
                    '<span class="unified-pot-pipeline-count" style="color:' + accentColor + ';">' + count + '</span>' +
                '</div>' +
                '<div class="unified-pot-pipeline-step-label">' + (labels[steps[j]] || steps[j]) + '</div>' +
                '</div>';
            if (j < steps.length - 1) {
                html += '<div class="unified-pot-pipeline-connector">' +
                    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M8 12h8m0 0l-3-3m3 3l-3 3" stroke="' + accentColor + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
                    '</div>';
            }
        }
        html += '</div></div>';
        return html;
    }


    // ========================================
    // FILTER TABS
    // ========================================

    function renderFilterTabs(potentiale, config, containerId) {
        var steps = config.potentiale.pipelineSteps;
        var labels = config.potentiale.statusLabels;
        var counts = computePipeline(potentiale, config);

        var html = '<div class="unified-pot-filters" id="' + containerId + '-filters">';
        html += '<button class="unified-pot-filter-btn active" data-filter="alle" onclick="window._unifiedPotFilterClick(\'' + containerId + '\', \'alle\', this)">Alle <span class="unified-pot-filter-count">' + potentiale.length + '</span></button>';
        for (var i = 0; i < steps.length; i++) {
            html += '<button class="unified-pot-filter-btn" data-filter="' + steps[i] + '" onclick="window._unifiedPotFilterClick(\'' + containerId + '\', \'' + steps[i] + '\', this)">' +
                (labels[steps[i]] || steps[i]) + ' <span class="unified-pot-filter-count">' + (counts[steps[i]] || 0) + '</span></button>';
        }
        html += '</div>';
        return html;
    }


    // ========================================
    // POTENTIALE CARDS
    // ========================================

    function renderPotentialeCards(potentiale, config, containerId) {
        var html = '<div class="unified-pot-cards" id="' + containerId + '-cards">';
        for (var i = 0; i < potentiale.length; i++) {
            var p = potentiale[i];
            var detailId = containerId + '-detail-' + i;
            var pc = prioClass(p.prioritaet);

            html += '<div class="unified-pot-card" data-status="' + p.status + '" data-index="' + i + '">' +
                '<div class="unified-pot-card-main" onclick="window._unifiedPotToggleDetail(\'' + detailId + '\', this)">' +
                    // Avatar
                    getKundenAvatar(p.kundenName) +
                    // Left section
                    '<div class="unified-pot-card-left">' +
                        '<div class="unified-pot-card-header-row">' +
                            '<strong class="unified-pot-card-name">' + p.kundenName + '</strong>' +
                            '<span class="unified-pot-card-id">' + p.kundenId + '</span>' +
                            '<span class="impuls-priority ' + pc + '">' + prioLabel(p.prioritaet) + '</span>' +
                            '<span class="unified-pot-status-badge status-' + p.status + '">' + statusLabel(p.status, config) + '</span>' +
                        '</div>' +
                        '<div class="unified-pot-card-produkt">' + p.produkt + '</div>' +
                        '<div class="unified-pot-card-beschreibung">' + p.beschreibung + '</div>' +
                        (p.letzteAktion ? '<div class="unified-pot-card-aktion">Letzte Aktion: ' + p.letzteAktion + '</div>' : '') +
                    '</div>' +
                    // Right section
                    '<div class="unified-pot-card-right">' +
                        '<div class="unified-pot-card-kennzahl"><span class="unified-pot-card-kz-label">Volumen</span><span class="unified-pot-card-kz-value">' + formatCurrency(p.volumen) + '</span></div>' +
                        '<div class="unified-pot-card-kennzahl"><span class="unified-pot-card-kz-label">Ertrag</span><span class="unified-pot-card-kz-value prov">' + formatCurrency(p.ertrag) + '</span></div>' +
                    '</div>' +
                    // Expand icon
                    '<span class="unified-pot-expand">' + getIcon('chevronDown') + '</span>' +
                '</div>';

            // Expandable detail panel
            html += '<div class="unified-pot-detail" id="' + detailId + '">' +
                '<div class="unified-pot-detail-section">' +
                    '<h4>Herleitung</h4>' +
                    '<div class="unified-pot-herleitung">';
            if (p.herleitung) {
                for (var h = 0; h < p.herleitung.length; h++) {
                    html += '<div class="unified-pot-herleitung-row">' +
                        '<span class="unified-pot-herleitung-label">' + p.herleitung[h].datenquelle + '</span>' +
                        '<span class="unified-pot-herleitung-value">' + p.herleitung[h].erkenntnis + '</span>' +
                        '</div>';
                }
            }
            html += '</div></div>';

            // Action buttons (icon-only with tooltips)
            html += '<div class="unified-pot-detail-actions">' +
                '<button class="action-btn primary kunde-oeffnen-btn" title="Kunde \u00f6ffnen" onclick="event.stopPropagation(); window._unifiedPotOpenKunde(\'' + p.kundenName.replace(/'/g, "\\'") + '\', \'' + p.kundenId + '\')">' +
                    getIcon('user') + ' <span class="btn-label">Kunde \u00f6ffnen</span></button>' +
                '<button class="action-btn secondary" title="Angebot erstellen" onclick="event.stopPropagation(); window._unifiedPotCreateAngebot(\'' + p.produkt.replace(/'/g, "\\'") + '\')">' +
                    getIcon('fileText') + '</button>' +
                '<button class="action-btn secondary" title="Status \u00e4ndern" onclick="event.stopPropagation(); window._unifiedPotChangeStatus(' + i + ', \'' + containerId + '\')">' +
                    getIcon('edit') + '</button>' +
                '</div>';

            html += '</div></div>';
        }
        html += '</div>';
        return html;
    }


    // ========================================
    // MAIN RENDER FUNCTION
    // ========================================

    function renderUnifiedPotentiale(targetElementId) {
        var container = document.getElementById(targetElementId);
        if (!container) return;

        var config = window.getModeConfig();
        var potentiale = config.potentiale.getPotentiale();
        if (!potentiale || potentiale.length === 0) {
            container.innerHTML = '<div class="unified-pot-empty">Keine Potentiale vorhanden.</div>';
            return;
        }

        var containerId = 'unified-pot-' + config.id;
        var kpiValues = computeKPIs(potentiale, config);
        var pipelineCounts = computePipeline(potentiale, config);

        var brandingColor = config.branding.color || '#2563eb';
        var html = '<div class="unified-pot-wrapper" id="' + containerId + '" style="--pot-brand-color:' + brandingColor + '">';

        // Header (branding removed per OPT-19)

        // KPI Boxes
        html += renderKPIBoxes(kpiValues, config);

        // Pipeline
        html += renderPipeline(pipelineCounts, config);

        // Filter tabs
        html += renderFilterTabs(potentiale, config, containerId);

        // Cards
        html += renderPotentialeCards(potentiale, config, containerId);

        html += '</div>';

        container.innerHTML = html;
    }


    // ========================================
    // INTERACTION HANDLERS
    // ========================================

    window._unifiedPotToggleDetail = function(detailId, mainEl) {
        var detail = document.getElementById(detailId);
        if (!detail) return;
        var isOpen = detail.classList.contains('open');
        detail.classList.toggle('open');
        var expand = mainEl.querySelector('.unified-pot-expand');
        if (expand) {
            expand.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
        }
    };

    window._unifiedPotFilterClick = function(containerId, filter, btn) {
        // Update active button
        var filterContainer = document.getElementById(containerId + '-filters');
        if (filterContainer) {
            var buttons = filterContainer.querySelectorAll('.unified-pot-filter-btn');
            for (var i = 0; i < buttons.length; i++) buttons[i].classList.remove('active');
        }
        btn.classList.add('active');

        // Filter cards
        var cardsContainer = document.getElementById(containerId + '-cards');
        if (!cardsContainer) return;
        var cards = cardsContainer.querySelectorAll('.unified-pot-card');
        for (var j = 0; j < cards.length; j++) {
            if (filter === 'alle') {
                cards[j].style.display = '';
            } else {
                cards[j].style.display = (cards[j].getAttribute('data-status') === filter) ? '' : 'none';
            }
        }
    };

    window._unifiedPotOpenKunde = function(name, id) {
        var config = window.getModeConfig();
        if (config.potentiale.openKundenDetail) {
            config.potentiale.openKundenDetail(name, id);
        }
    };

    window._unifiedPotCreateAngebot = function(produkt) {
        // Toast notification (reuse existing pattern)
        var toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.innerHTML = getIcon('fileText') + ' Angebotsentwurf f\u00fcr "' + produkt + '" wird erstellt...';
        toast.style.cssText = 'position:fixed;bottom:24px;right:24px;background:#1a1a2e;color:white;padding:14px 20px;border-radius:10px;z-index:10000;display:flex;align-items:center;gap:10px;font-size:14px;box-shadow:0 4px 16px rgba(0,0,0,0.2);animation:slideInUp 0.3s ease;';
        document.body.appendChild(toast);
        setTimeout(function() {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s';
            setTimeout(function() { toast.remove(); }, 300);
        }, 3000);
    };

    window._unifiedPotChangeStatus = function(index, containerId) {
        var config = window.getModeConfig();
        var potentiale = config.potentiale.getPotentiale();
        if (!potentiale || !potentiale[index]) return;

        var steps = config.potentiale.pipelineSteps;
        var labels = config.potentiale.statusLabels;
        var current = potentiale[index].status;
        var currentIdx = steps.indexOf(current);
        var nextIdx = (currentIdx + 1) % steps.length;
        var nextStatus = steps[nextIdx];

        potentiale[index].status = nextStatus;

        // Toast
        var toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.innerHTML = getIcon('edit') + ' Status ge\u00e4ndert: ' + potentiale[index].kundenName + ' \u2192 ' + (labels[nextStatus] || nextStatus);
        toast.style.cssText = 'position:fixed;bottom:24px;right:24px;background:#1a1a2e;color:white;padding:14px 20px;border-radius:10px;z-index:10000;display:flex;align-items:center;gap:10px;font-size:14px;box-shadow:0 4px 16px rgba(0,0,0,0.2);animation:slideInUp 0.3s ease;';
        document.body.appendChild(toast);
        setTimeout(function() {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s';
            setTimeout(function() { toast.remove(); }, 300);
        }, 3000);

        // Re-render the whole potentiale view
        var wrapper = document.getElementById(containerId);
        if (wrapper) {
            var targetEl = wrapper.parentElement;
            if (targetEl) renderUnifiedPotentiale(targetEl.id);
        }
    };


    // ========================================
    // WINDOW EXPORTS
    // ========================================

    window.renderUnifiedPotentiale = renderUnifiedPotentiale;
    window.vertriebsPotentiale = window.vertriebsPotentiale;
    window.bankPotentiale = window.bankPotentiale;

    window.__registerModule && window.__registerModule('unified-potentiale.js');

})();
