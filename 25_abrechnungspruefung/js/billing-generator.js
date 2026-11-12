/**
 * BillingCheck - Realistischer Provisionsabrechnungs-Generator
 *
 * Generiert extrem detaillierte und realitätsnahe Provisionsabrechnungen
 * basierend auf echten Branchenstandards und -praktiken.
 *
 * Features:
 * - Vollständige Abrechnungsstruktur wie bei echten Versicherern
 * - Alle Provisionsarten (AP, BP, DP, SP, Storno, etc.)
 * - Realistische Vertragsdaten und Berechnungen
 * - Dynamik, Staffelung, Haftungszeiten
 * - Multi-Sparten-Unterstützung
 * - Hierarchie/Superprovisions-Szenarien
 *
 * Version: 1.0.0
 */

class RealisticBillingGenerator {
    constructor() {
        // Realistische Vermittlerdaten
        this.vermittlerPool = this.generiereVermittlerPool();

        // Versicherungsprodukte nach Sparte
        this.produktKatalog = this.erstelleProduktKatalog();

        // Provisions-Sätze nach Produkttyp
        this.provisionsSaetze = this.erstelleProvisionsSaetze();

        // Namen-Pool für VN
        this.vornamen = ['Michael', 'Thomas', 'Andreas', 'Stefan', 'Christian', 'Martin', 'Peter', 'Wolfgang', 'Klaus', 'Jürgen',
            'Maria', 'Anna', 'Sandra', 'Julia', 'Sabine', 'Monika', 'Petra', 'Claudia', 'Nicole', 'Susanne',
            'Hans', 'Werner', 'Helmut', 'Gerhard', 'Manfred', 'Dieter', 'Karl', 'Franz', 'Josef', 'Heinrich'];

        this.nachnamen = ['Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker', 'Schulz', 'Hoffmann',
            'Koch', 'Richter', 'Klein', 'Wolf', 'Schröder', 'Neumann', 'Schwarz', 'Zimmermann', 'Braun', 'Krüger',
            'Hartmann', 'Lange', 'Werner', 'Krause', 'Lehmann', 'Köhler', 'Maier', 'Hermann', 'König', 'Huber'];

        // Städte
        this.staedte = ['München', 'Hamburg', 'Berlin', 'Köln', 'Frankfurt', 'Stuttgart', 'Düsseldorf', 'Leipzig', 'Dresden', 'Hannover',
            'Nürnberg', 'Bremen', 'Essen', 'Dortmund', 'Duisburg', 'Bochum', 'Wuppertal', 'Bielefeld', 'Bonn', 'Mannheim'];
    }

    // ========================================================================
    // VERMITTLER POOL
    // ========================================================================

    generiereVermittlerPool() {
        return {
            hauptvermittler: {
                nummer: '0300/0187',
                name: 'Maximilian Berger',
                typ: 'Hauptvermittler',
                vorgesetzter: '0300/0005',
                stufe: 2
            },
            untergebene: [
                { nummer: '0300/0188', name: 'Sarah Lehmann', typ: 'Vermittler', vorgesetzter: '0300/0187', stufe: 3 },
                { nummer: '0300/0189', name: 'Daniel Krause', typ: 'Vermittler', vorgesetzter: '0300/0187', stufe: 3 },
                { nummer: '0300/0190', name: 'Lisa Wagner', typ: 'Vermittler', vorgesetzter: '0300/0187', stufe: 3 }
            ],
            vorgesetzte: [
                { nummer: '0300/0005', name: 'Dr. Heinrich Müller', typ: 'Regionaldirektor', vorgesetzter: null, stufe: 1 }
            ]
        };
    }

    // ========================================================================
    // PRODUKT KATALOG
    // ========================================================================

    erstelleProduktKatalog() {
        return {
            Leben: {
                versicherer: ['Allianz Leben', 'AXA Leben', 'Debeka Leben', 'Württembergische', 'Alte Leipziger', 'HDI Leben', 'Generali Leben', 'Zurich Life'],
                produkte: [
                    {
                        name: 'Klassische Kapitallebensversicherung',
                        tarife: ['KLV Classic 2024', 'KLV Garantie Plus', 'KLV Traditionell'],
                        laufzeiten: [12, 15, 20, 25, 30],
                        beitragsbereich: { min: 50, max: 500 },
                        provisions_art: 'Beitragssumme'
                    },
                    {
                        name: 'Fondsgebundene Rentenversicherung',
                        tarife: ['FRV Invest', 'FRV Chance', 'FRV Balance'],
                        laufzeiten: [15, 20, 25, 30, 35],
                        beitragsbereich: { min: 75, max: 1000 },
                        provisions_art: 'Beitragssumme'
                    },
                    {
                        name: 'Private Rentenversicherung',
                        tarife: ['PRV Komfort', 'PRV Flexibel', 'PRV Basis'],
                        laufzeiten: [20, 25, 30, 35, 40],
                        beitragsbereich: { min: 100, max: 750 },
                        provisions_art: 'Beitragssumme'
                    },
                    {
                        name: 'Berufsunfähigkeitsversicherung',
                        tarife: ['BU Premium', 'BU Komfort', 'BU Basis', 'BU Start'],
                        laufzeiten: [10, 15, 20, 25, 30],
                        beitragsbereich: { min: 40, max: 250 },
                        provisions_art: 'BWS'
                    },
                    {
                        name: 'Risikolebensversicherung',
                        tarife: ['RLV Protect', 'RLV Family', 'RLV Business'],
                        laufzeiten: [10, 15, 20, 25],
                        beitragsbereich: { min: 15, max: 150 },
                        provisions_art: 'BWS'
                    }
                ]
            },
            Kranken: {
                versicherer: ['DKV', 'Debeka Kranken', 'Signal Iduna', 'Barmenia', 'Hallesche', 'Allianz PKV', 'AXA Kranken', 'Continentale'],
                produkte: [
                    {
                        name: 'Private Krankenvollversicherung',
                        tarife: ['PKV Premium', 'PKV Komfort', 'PKV Basis', 'PKV Start'],
                        beitragsbereich: { min: 300, max: 1200 },
                        provisions_art: 'Jahresbeitrag',
                        laufend: true
                    },
                    {
                        name: 'Krankentagegeldversicherung',
                        tarife: ['KT Plus', 'KT Standard', 'KT Basis'],
                        beitragsbereich: { min: 30, max: 200 },
                        provisions_art: 'Jahresbeitrag'
                    },
                    {
                        name: 'Krankenzusatzversicherung Zahn',
                        tarife: ['Zahn Premium', 'Zahn Komfort', 'Zahn Basis', 'Zahn 100'],
                        beitragsbereich: { min: 15, max: 80 },
                        provisions_art: 'Jahresbeitrag'
                    },
                    {
                        name: 'Krankenzusatzversicherung Stationär',
                        tarife: ['Stationär Plus', 'Stationär Komfort', 'Stationär Basis'],
                        beitragsbereich: { min: 20, max: 100 },
                        provisions_art: 'Jahresbeitrag'
                    },
                    {
                        name: 'Pflegezusatzversicherung',
                        tarife: ['Pflege Premium', 'Pflege Komfort', 'Pflege Basis'],
                        beitragsbereich: { min: 25, max: 150 },
                        provisions_art: 'Jahresbeitrag'
                    }
                ]
            },
            Sach: {
                versicherer: ['Allianz Sach', 'HUK-COBURG', 'DEVK', 'VGH', 'R+V', 'LVM', 'Provinzial', 'Württembergische Sach'],
                produkte: [
                    {
                        name: 'Wohngebäudeversicherung',
                        tarife: ['WG Premium', 'WG Komfort', 'WG Basis'],
                        versicherungssumme: { min: 150000, max: 800000 },
                        beitragsbereich: { min: 200, max: 1500 },
                        provisions_art: 'Jahresbeitrag'
                    },
                    {
                        name: 'Hausratversicherung',
                        tarife: ['HR Premium', 'HR Komfort', 'HR Basis', 'HR Single'],
                        versicherungssumme: { min: 30000, max: 200000 },
                        beitragsbereich: { min: 80, max: 500 },
                        provisions_art: 'Jahresbeitrag'
                    },
                    {
                        name: 'Private Haftpflichtversicherung',
                        tarife: ['PHV Premium', 'PHV Komfort', 'PHV Basis', 'PHV Familie'],
                        beitragsbereich: { min: 50, max: 200 },
                        provisions_art: 'Jahresbeitrag'
                    },
                    {
                        name: 'Unfallversicherung',
                        tarife: ['Unfall Premium', 'Unfall Komfort', 'Unfall Basis', 'Unfall Familie'],
                        versicherungssumme: { min: 50000, max: 500000 },
                        beitragsbereich: { min: 100, max: 600 },
                        provisions_art: 'Jahresbeitrag'
                    },
                    {
                        name: 'Rechtsschutzversicherung',
                        tarife: ['RS Premium', 'RS Komfort', 'RS Basis', 'RS Verkehr'],
                        beitragsbereich: { min: 150, max: 500 },
                        provisions_art: 'Jahresbeitrag'
                    }
                ]
            },
            Kfz: {
                versicherer: ['HUK24', 'Allianz Kfz', 'AXA Kfz', 'DEVK Kfz', 'VHV', 'HDI Kfz', 'CosmosDirekt', 'WGV'],
                produkte: [
                    {
                        name: 'Kfz-Haftpflichtversicherung',
                        tarife: ['Kfz HP Standard', 'Kfz HP Plus'],
                        beitragsbereich: { min: 200, max: 800 },
                        provisions_art: 'Jahresbeitrag'
                    },
                    {
                        name: 'Kfz-Teilkaskoversicherung',
                        tarife: ['TK Standard', 'TK Plus'],
                        beitragsbereich: { min: 100, max: 400 },
                        provisions_art: 'Jahresbeitrag'
                    },
                    {
                        name: 'Kfz-Vollkaskoversicherung',
                        tarife: ['VK Standard', 'VK Plus', 'VK Premium'],
                        beitragsbereich: { min: 300, max: 1500 },
                        provisions_art: 'Jahresbeitrag'
                    }
                ]
            },
            Gewerbe: {
                versicherer: ['Allianz Gewerbe', 'AXA Gewerbe', 'R+V Gewerbe', 'HDI Gewerbe', 'Zurich Gewerbe'],
                produkte: [
                    {
                        name: 'Betriebshaftpflichtversicherung',
                        tarife: ['BH Standard', 'BH Plus', 'BH Premium'],
                        beitragsbereich: { min: 300, max: 5000 },
                        provisions_art: 'Jahresbeitrag'
                    },
                    {
                        name: 'Inhaltsversicherung',
                        tarife: ['Inhalt Standard', 'Inhalt Plus'],
                        versicherungssumme: { min: 50000, max: 1000000 },
                        beitragsbereich: { min: 200, max: 3000 },
                        provisions_art: 'Jahresbeitrag'
                    },
                    {
                        name: 'Betriebsunterbrechungsversicherung',
                        tarife: ['BU Standard', 'BU Plus'],
                        beitragsbereich: { min: 500, max: 5000 },
                        provisions_art: 'Jahresbeitrag'
                    }
                ]
            }
        };
    }

    // ========================================================================
    // PROVISIONS-SÄTZE
    // ========================================================================

    erstelleProvisionsSaetze() {
        return {
            Leben: {
                AP: { min: 3.0, max: 5.0, standard: 4.0, bezug: 'Beitragssumme' },
                BP: { min: 0.5, max: 1.5, standard: 1.0, bezug: 'Jahresbeitrag' },
                DP: { min: 1.5, max: 3.0, standard: 2.0, bezug: 'Erhöhungssumme' },
                haftungszeit: 60 // Monate
            },
            Kranken: {
                AP: { min: 6.0, max: 9.0, standard: 8.0, bezug: 'Jahresbeitrag' },
                BP: { min: 3.0, max: 5.0, standard: 4.0, bezug: 'Jahresbeitrag' },
                DP: { min: 0, max: 0, standard: 0, bezug: null }, // Keine Dynamik bei KV
                haftungszeit: 60 // Monate - max laut Provisionsdeckel
            },
            Sach: {
                AP: { min: 12.0, max: 20.0, standard: 15.0, bezug: 'Jahresbeitrag' },
                BP: { min: 5.0, max: 10.0, standard: 7.0, bezug: 'Jahresbeitrag' },
                DP: { min: 0, max: 0, standard: 0, bezug: null },
                haftungszeit: 12 // Monate
            },
            Kfz: {
                AP: { min: 8.0, max: 15.0, standard: 12.0, bezug: 'Jahresbeitrag' },
                BP: { min: 3.0, max: 8.0, standard: 5.0, bezug: 'Jahresbeitrag' },
                DP: { min: 0, max: 0, standard: 0, bezug: null },
                haftungszeit: 0 // Keine Haftung bei Kfz
            },
            Gewerbe: {
                AP: { min: 15.0, max: 25.0, standard: 20.0, bezug: 'Jahresbeitrag' },
                BP: { min: 5.0, max: 12.0, standard: 8.0, bezug: 'Jahresbeitrag' },
                DP: { min: 0, max: 0, standard: 0, bezug: null },
                haftungszeit: 12 // Monate
            },
            // Superprovisionen
            SP: {
                stufe1: { satz: 10.0, bezeichnung: 'Gruppenleiter' },
                stufe2: { satz: 5.0, bezeichnung: 'Bezirksleiter' },
                stufe3: { satz: 2.5, bezeichnung: 'Regionaldirektor' }
            }
        };
    }

    // ========================================================================
    // HAUPTFUNKTION: ABRECHNUNG GENERIEREN
    // ========================================================================

    /**
     * Generiert eine vollständige, realistische Provisionsabrechnung
     *
     * @param {Object} options Konfiguration der Abrechnung
     * @returns {Object} Vollständige Abrechnung mit Positionen
     */
    generiereAbrechnung(options = {}) {
        const config = {
            vermittler_nummer: options.vermittler_nummer || this.vermittlerPool.hauptvermittler.nummer,
            vermittler_name: options.vermittler_name || this.vermittlerPool.hauptvermittler.name,
            agentur_name: options.agentur_name || 'Alpha Finanzservice GmbH',
            monat: options.monat || new Date().getMonth() + 1,
            jahr: options.jahr || new Date().getFullYear(),
            anzahl_positionen: options.anzahl_positionen || this.zufallsZahl(15, 40),
            mit_stornos: options.mit_stornos !== false,
            mit_dynamik: options.mit_dynamik !== false,
            mit_superprovision: options.mit_superprovision !== false,
            mit_bestandsprovision: options.mit_bestandsprovision !== false,
            storno_quote: options.storno_quote || 0.08, // 8% der Positionen
            spartenverteilung: options.spartenverteilung || {
                Leben: 0.35,
                Kranken: 0.25,
                Sach: 0.25,
                Kfz: 0.10,
                Gewerbe: 0.05
            }
        };

        // Generiere Abrechnungs-ID
        const abrechnungId = this.generiereAbrechnungId(config);

        // Generiere Positionen
        const positionen = this.generierePositionen(config);

        // Berechne Summen
        const summen = this.berechneSummen(positionen);

        // Erstelle vollständige Abrechnung
        const abrechnung = {
            // Header
            abrechnung_id: abrechnungId,
            abrechnungs_monat: config.monat,
            abrechnungs_jahr: config.jahr,
            periode: `${config.jahr}-${String(config.monat).padStart(2, '0')}`,
            erstellungsdatum: new Date().toISOString().split('T')[0],

            // Vermittler
            vermittler_nummer: config.vermittler_nummer,
            vermittler_name: config.vermittler_name,
            agentur_name: config.agentur_name,
            vermittler_typ: this.vermittlerPool.hauptvermittler.typ,
            vorgesetzter: this.vermittlerPool.hauptvermittler.vorgesetzter,

            // Summen
            brutto_provision: summen.brutto,
            abschlussprovision_gesamt: summen.ap,
            bestandsprovision_gesamt: summen.bp,
            dynamikprovision_gesamt: summen.dp,
            superprovision_gesamt: summen.sp,
            storno_einbehalte: summen.storno,
            sonstige_abzuege: summen.sonstige,
            vorschuesse: summen.vorschuesse,
            netto_auszahlung: summen.netto,

            // Sparten-Aufschlüsselung
            sparten_summen: summen.nachSparte,

            // Positionen
            positionen: positionen,
            anzahl_positionen: positionen.length,

            // Metadaten
            status: 'erstellt',
            generiert_am: new Date().toISOString(),
            generator_version: '1.0.0'
        };

        return abrechnung;
    }

    // ========================================================================
    // POSITIONEN GENERIEREN
    // ========================================================================

    generierePositionen(config) {
        const positionen = [];
        let posNummer = 1;

        // Berechne Anzahl pro Typ
        const anzahlAP = Math.floor(config.anzahl_positionen * 0.4); // 40% Neuabschlüsse
        const anzahlBP = config.mit_bestandsprovision ? Math.floor(config.anzahl_positionen * 0.35) : 0;
        const anzahlDP = config.mit_dynamik ? Math.floor(config.anzahl_positionen * 0.1) : 0;
        const anzahlSP = config.mit_superprovision ? Math.floor(config.anzahl_positionen * 0.1) : 0;
        const anzahlStorno = config.mit_stornos ? Math.floor(config.anzahl_positionen * config.storno_quote) : 0;

        // Generiere Abschlussprovisionen
        for (let i = 0; i < anzahlAP; i++) {
            const sparte = this.waehleSparte(config.spartenverteilung);
            const pos = this.generiereAPPosition(posNummer++, sparte, config);
            positionen.push(pos);
        }

        // Generiere Bestandsprovisionen
        for (let i = 0; i < anzahlBP; i++) {
            const sparte = this.waehleSparte(config.spartenverteilung);
            const pos = this.generiereBPPosition(posNummer++, sparte, config);
            positionen.push(pos);
        }

        // Generiere Dynamik-Provisionen
        for (let i = 0; i < anzahlDP; i++) {
            // Dynamik hauptsächlich bei Leben
            const pos = this.generiereDPPosition(posNummer++, 'Leben', config);
            positionen.push(pos);
        }

        // Generiere Superprovisionen
        for (let i = 0; i < anzahlSP; i++) {
            const sparte = this.waehleSparte(config.spartenverteilung);
            const pos = this.generiereSPPosition(posNummer++, sparte, config);
            positionen.push(pos);
        }

        // Generiere Stornos
        for (let i = 0; i < anzahlStorno; i++) {
            const sparte = this.waehleSparte(config.spartenverteilung);
            const pos = this.generiereStornoPosition(posNummer++, sparte, config);
            positionen.push(pos);
        }

        // Sortiere nach Positionsnummer
        return positionen.sort((a, b) => a.position_nummer - b.position_nummer);
    }

    // ========================================================================
    // EINZELNE POSITIONSTYPEN
    // ========================================================================

    /**
     * Generiert eine Abschlussprovisionsposition
     */
    generiereAPPosition(posNummer, sparte, config) {
        const produkt = this.waehleProdukt(sparte);
        const versicherer = this.waehleVersicherer(sparte);
        const tarif = this.waehleTarif(produkt);
        const saetze = this.provisionsSaetze[sparte];

        // Vertragsdaten
        const vertragId = this.generiereVertragId();
        const vnName = this.generiereVNName();
        const beitrag = this.zufallsZahl(produkt.beitragsbereich.min, produkt.beitragsbereich.max);
        const zahlweise = this.waehleZahlweise();
        const jahresbeitrag = this.berechneJahresbeitrag(beitrag, zahlweise);

        // Bei Leben: Beitragssumme berechnen
        let bezugsgroesse, bezugsgroesseName, bezugsgroesseWert;
        let laufzeit = 0;

        if (sparte === 'Leben' && produkt.laufzeiten) {
            laufzeit = this.waehleAusArray(produkt.laufzeiten);
            bezugsgroesseWert = jahresbeitrag * laufzeit;
            bezugsgroesseName = 'Beitragssumme';
        } else {
            bezugsgroesseWert = jahresbeitrag;
            bezugsgroesseName = 'Jahresbeitrag';
        }

        // Provisionssatz (mit leichter Variation)
        const provisionsSatz = this.zufallsZahl(saetze.AP.min * 100, saetze.AP.max * 100) / 100;

        // Berechne Provision
        const bruttoBetrag = (bezugsgroesseWert * provisionsSatz) / 100;

        // Vertragsbeginn (im Abrechnungsmonat oder kurz davor)
        const vertragsbeginn = this.generiereVertragsbeginn(config.jahr, config.monat);

        return {
            position_nummer: posNummer,
            positions_art: 'AP',
            positions_art_lang: 'Abschlussprovision',

            // Vertrag
            vertrag_id: vertragId,
            versicherungsnehmer: vnName,
            vertragsbeginn: vertragsbeginn,
            policierungsdatum: this.addiereTage(vertragsbeginn, this.zufallsZahl(5, 20)),

            // Produkt
            sparte: sparte,
            produkt: produkt.name,
            tarif: tarif,
            versicherer: versicherer,

            // Beitrag
            zahlweise: zahlweise,
            beitrag: beitrag,
            jahresbeitrag: jahresbeitrag,
            laufzeit_jahre: laufzeit > 0 ? laufzeit : null,

            // Berechnung
            bezugsgroesse_name: bezugsgroesseName,
            bezugsgroesse_wert: bezugsgroesseWert,
            provisions_satz: provisionsSatz,
            brutto_betrag: Math.round(bruttoBetrag * 100) / 100,

            // Haftung
            haftungszeit_monate: saetze.haftungszeit,
            in_haftung: saetze.haftungszeit > 0,

            // Flags
            ist_storno: false,
            ist_dynamik: false,
            ist_superprovision: false,

            // Kommentar
            buchungstext: `AP ${produkt.name} - ${vnName}`
        };
    }

    /**
     * Generiert eine Bestandsprovisionsposition
     */
    generiereBPPosition(posNummer, sparte, config) {
        const produkt = this.waehleProdukt(sparte);
        const versicherer = this.waehleVersicherer(sparte);
        const tarif = this.waehleTarif(produkt);
        const saetze = this.provisionsSaetze[sparte];

        const vertragId = this.generiereVertragId();
        const vnName = this.generiereVNName();
        const beitrag = this.zufallsZahl(produkt.beitragsbereich.min, produkt.beitragsbereich.max);
        const zahlweise = this.waehleZahlweise();
        const jahresbeitrag = this.berechneJahresbeitrag(beitrag, zahlweise);

        // BP immer auf Jahresbeitrag
        const provisionsSatz = this.zufallsZahl(saetze.BP.min * 100, saetze.BP.max * 100) / 100;
        const bruttoBetrag = (jahresbeitrag * provisionsSatz) / 100;

        // Bestandsvertrag - älter
        const vertragsbeginn = this.generiereAltesVertragsdatum(config.jahr);

        return {
            position_nummer: posNummer,
            positions_art: 'BP',
            positions_art_lang: 'Bestandsprovision',

            vertrag_id: vertragId,
            versicherungsnehmer: vnName,
            vertragsbeginn: vertragsbeginn,

            sparte: sparte,
            produkt: produkt.name,
            tarif: tarif,
            versicherer: versicherer,

            zahlweise: zahlweise,
            beitrag: beitrag,
            jahresbeitrag: jahresbeitrag,

            bezugsgroesse_name: 'Jahresbeitrag',
            bezugsgroesse_wert: jahresbeitrag,
            provisions_satz: provisionsSatz,
            brutto_betrag: Math.round(bruttoBetrag * 100) / 100,

            leistungs_zeitraum_von: `${config.jahr}-${String(config.monat).padStart(2, '0')}-01`,
            leistungs_zeitraum_bis: this.letzterTagImMonat(config.jahr, config.monat),

            ist_storno: false,
            ist_dynamik: false,
            ist_superprovision: false,

            buchungstext: `BP ${sparte} - ${vnName}`
        };
    }

    /**
     * Generiert eine Dynamik-Provisionsposition
     */
    generiereDPPosition(posNummer, sparte, config) {
        const produkt = this.waehleProdukt(sparte);
        const versicherer = this.waehleVersicherer(sparte);
        const tarif = this.waehleTarif(produkt);
        const saetze = this.provisionsSaetze[sparte];

        const vertragId = this.generiereVertragId();
        const vnName = this.generiereVNName();

        // Bestehender Beitrag vor Dynamik
        const beitragAlt = this.zufallsZahl(produkt.beitragsbereich.min, produkt.beitragsbereich.max);
        const dynamikProzent = this.waehleAusArray([3, 5, 6, 10]); // Typische Dynamik-Sätze
        const erhoehungBeitrag = Math.round(beitragAlt * (dynamikProzent / 100) * 100) / 100;
        const beitragNeu = beitragAlt + erhoehungBeitrag;

        const zahlweise = 'monatlich';
        const erhoehungJahresbeitrag = erhoehungBeitrag * 12;

        // Dynamikstufe (1-10)
        const dynamikStufe = this.zufallsZahl(1, 8);

        // Bei Leben: Erhöhungssumme über Restlaufzeit
        const restlaufzeit = this.zufallsZahl(5, 20);
        const erhoehungssumme = erhoehungJahresbeitrag * restlaufzeit;

        const provisionsSatz = saetze.DP.standard;
        const bruttoBetrag = (erhoehungssumme * provisionsSatz) / 100;

        const vertragsbeginn = this.generiereAltesVertragsdatum(config.jahr);
        const dynamikDatum = `${config.jahr}-${String(config.monat).padStart(2, '0')}-01`;

        return {
            position_nummer: posNummer,
            positions_art: 'DP',
            positions_art_lang: 'Dynamikprovision',

            vertrag_id: vertragId,
            versicherungsnehmer: vnName,
            vertragsbeginn: vertragsbeginn,

            sparte: sparte,
            produkt: produkt.name,
            tarif: tarif,
            versicherer: versicherer,

            dynamik_datum: dynamikDatum,
            dynamik_prozent: dynamikProzent,
            dynamik_stufe: dynamikStufe,
            beitrag_vor_dynamik: beitragAlt,
            beitrag_nach_dynamik: beitragNeu,
            dynamik_erhoehung_betrag: erhoehungBeitrag,
            dynamik_erhoehung_jahresbeitrag: erhoehungJahresbeitrag,

            bezugsgroesse_name: 'Erhöhungssumme',
            bezugsgroesse_wert: erhoehungssumme,
            provisions_satz: provisionsSatz,
            brutto_betrag: Math.round(bruttoBetrag * 100) / 100,

            ist_storno: false,
            ist_dynamik: true,
            ist_superprovision: false,

            buchungstext: `DP ${dynamikStufe}. Dynamik - ${vnName}`
        };
    }

    /**
     * Generiert eine Superprovisionsposition
     */
    generiereSPPosition(posNummer, sparte, config) {
        const untergebener = this.waehleAusArray(this.vermittlerPool.untergebene);
        const produkt = this.waehleProdukt(sparte);
        const versicherer = this.waehleVersicherer(sparte);

        // Die zugrunde liegende Provision des Untergebenen
        const basisProvision = this.zufallsZahl(500, 5000);
        const spSatz = this.provisionsSaetze.SP.stufe1.satz; // 10%
        const bruttoBetrag = (basisProvision * spSatz) / 100;

        return {
            position_nummer: posNummer,
            positions_art: 'SP',
            positions_art_lang: 'Superprovision',

            ursprungs_vermittler: untergebener.nummer,
            ursprungs_vermittler_name: untergebener.name,
            hierarchie_stufe: 1,

            sparte: sparte,
            produkt: produkt.name,
            versicherer: versicherer,

            basis_provisions_betrag: basisProvision,
            bezugsgroesse_name: 'Basisprovision',
            bezugsgroesse_wert: basisProvision,
            provisions_satz: spSatz,
            brutto_betrag: Math.round(bruttoBetrag * 100) / 100,

            ist_storno: false,
            ist_dynamik: false,
            ist_superprovision: true,

            buchungstext: `SP ${sparte} von ${untergebener.name}`
        };
    }

    /**
     * Generiert eine Storno-Position (Rückforderung)
     */
    generiereStornoPosition(posNummer, sparte, config) {
        const produkt = this.waehleProdukt(sparte);
        const versicherer = this.waehleVersicherer(sparte);
        const tarif = this.waehleTarif(produkt);
        const saetze = this.provisionsSaetze[sparte];

        const vertragId = this.generiereVertragId();
        const vnName = this.generiereVNName();

        // Ursprüngliche Provision
        const originalProvision = this.zufallsZahl(300, 3000);

        // Storno nach x Monaten
        const monateNachAbschluss = this.zufallsZahl(2, Math.min(24, saetze.haftungszeit || 12));

        // Stornoquote berechnen (degressive Staffel)
        const stornoQuote = this.berechneStornoQuote(monateNachAbschluss, saetze.haftungszeit);

        const rueckforderung = Math.round((originalProvision * stornoQuote / 100) * -100) / 100;

        // Ursprüngliches Vertragsdatum
        const abschlussDatum = new Date(config.jahr, config.monat - 1 - monateNachAbschluss, 15);
        const stornoDatum = new Date(config.jahr, config.monat - 1, this.zufallsZahl(1, 28));

        return {
            position_nummer: posNummer,
            positions_art: 'STORNO',
            positions_art_lang: 'Stornorückforderung',

            vertrag_id: vertragId,
            versicherungsnehmer: vnName,
            vertragsbeginn: abschlussDatum.toISOString().split('T')[0],
            storno_datum: stornoDatum.toISOString().split('T')[0],

            sparte: sparte,
            produkt: produkt.name,
            tarif: tarif,
            versicherer: versicherer,

            original_provisions_betrag: originalProvision,
            original_provisions_art: 'AP',
            monate_nach_abschluss: monateNachAbschluss,
            storno_quote: stornoQuote,

            bezugsgroesse_name: 'Ursprungsprovision',
            bezugsgroesse_wert: originalProvision,
            provisions_satz: stornoQuote * -1,
            brutto_betrag: rueckforderung,

            storno_grund: this.waehleAusArray([
                'Kündigung durch VN',
                'Widerruf',
                'Nichtzahlung',
                'Beitragsfreistellung',
                'Vertragswechsel'
            ]),

            ist_storno: true,
            ist_dynamik: false,
            ist_superprovision: false,

            buchungstext: `STORNO ${monateNachAbschluss} Mon. - ${vnName}`
        };
    }

    // ========================================================================
    // SUMMEN BERECHNEN
    // ========================================================================

    berechneSummen(positionen) {
        let ap = 0, bp = 0, dp = 0, sp = 0, storno = 0;
        const nachSparte = {};

        positionen.forEach(p => {
            // Nach Sparte
            if (!nachSparte[p.sparte]) {
                nachSparte[p.sparte] = { ap: 0, bp: 0, dp: 0, sp: 0, storno: 0, gesamt: 0 };
            }

            switch (p.positions_art) {
                case 'AP':
                    ap += p.brutto_betrag;
                    nachSparte[p.sparte].ap += p.brutto_betrag;
                    break;
                case 'BP':
                    bp += p.brutto_betrag;
                    nachSparte[p.sparte].bp += p.brutto_betrag;
                    break;
                case 'DP':
                    dp += p.brutto_betrag;
                    nachSparte[p.sparte].dp += p.brutto_betrag;
                    break;
                case 'SP':
                    sp += p.brutto_betrag;
                    nachSparte[p.sparte].sp += p.brutto_betrag;
                    break;
                case 'STORNO':
                    storno += Math.abs(p.brutto_betrag);
                    nachSparte[p.sparte].storno += Math.abs(p.brutto_betrag);
                    break;
            }
            nachSparte[p.sparte].gesamt += p.brutto_betrag;
        });

        const brutto = ap + bp + dp + sp;
        const sonstige = Math.round(this.zufallsZahl(50, 200) * 100) / 100; // Kontoführung etc.
        const vorschuesse = 0; // Können bei Bedarf aktiviert werden

        // Sparten-Summen Gesamtwerte berechnen
        Object.keys(nachSparte).forEach(s => {
            nachSparte[s].ap = Math.round(nachSparte[s].ap * 100) / 100;
            nachSparte[s].bp = Math.round(nachSparte[s].bp * 100) / 100;
            nachSparte[s].dp = Math.round(nachSparte[s].dp * 100) / 100;
            nachSparte[s].sp = Math.round(nachSparte[s].sp * 100) / 100;
            nachSparte[s].storno = Math.round(nachSparte[s].storno * 100) / 100;
            nachSparte[s].gesamt = Math.round(nachSparte[s].gesamt * 100) / 100;
        });

        return {
            ap: Math.round(ap * 100) / 100,
            bp: Math.round(bp * 100) / 100,
            dp: Math.round(dp * 100) / 100,
            sp: Math.round(sp * 100) / 100,
            storno: Math.round(storno * 100) / 100,
            sonstige: sonstige,
            vorschuesse: vorschuesse,
            brutto: Math.round(brutto * 100) / 100,
            netto: Math.round((brutto - storno - sonstige - vorschuesse) * 100) / 100,
            nachSparte: nachSparte
        };
    }

    // ========================================================================
    // HILFSMETHODEN
    // ========================================================================

    generiereAbrechnungId(config) {
        const vermittlerKurz = config.vermittler_nummer.replace('/', '');
        const monat = String(config.monat).padStart(2, '0');
        return `ABR-${vermittlerKurz}-${config.jahr}${monat}-${this.zufallsZahl(1000, 9999)}`;
    }

    generiereVertragId() {
        const prefix = this.waehleAusArray(['VN', 'VS', 'PL', 'KV']);
        const nummer = this.zufallsZahl(10000000, 99999999);
        const check = this.zufallsZahl(10, 99);
        return `${prefix}-${nummer}-${check}`;
    }

    generiereVNName() {
        const vorname = this.waehleAusArray(this.vornamen);
        const nachname = this.waehleAusArray(this.nachnamen);
        return `${vorname} ${nachname}`;
    }

    waehleSparte(verteilung) {
        const zufallswert = Math.random();
        let kumuliert = 0;

        for (const [sparte, anteil] of Object.entries(verteilung)) {
            kumuliert += anteil;
            if (zufallswert <= kumuliert) {
                return sparte;
            }
        }
        return 'Sach';
    }

    waehleProdukt(sparte) {
        const katalog = this.produktKatalog[sparte];
        if (!katalog || !katalog.produkte) return { name: 'Unbekanntes Produkt', beitragsbereich: { min: 50, max: 200 } };
        return this.waehleAusArray(katalog.produkte);
    }

    waehleVersicherer(sparte) {
        const katalog = this.produktKatalog[sparte];
        if (!katalog || !katalog.versicherer) return 'Unbekannter Versicherer';
        return this.waehleAusArray(katalog.versicherer);
    }

    waehleTarif(produkt) {
        if (!produkt.tarife || produkt.tarife.length === 0) return 'Standard';
        return this.waehleAusArray(produkt.tarife);
    }

    waehleZahlweise() {
        const zahlweisen = [
            { name: 'monatlich', faktor: 12 },
            { name: 'vierteljährlich', faktor: 4 },
            { name: 'halbjährlich', faktor: 2 },
            { name: 'jährlich', faktor: 1 }
        ];
        const gewichte = [0.6, 0.2, 0.1, 0.1]; // Monatlich am häufigsten
        const zufallswert = Math.random();
        let kumuliert = 0;

        for (let i = 0; i < zahlweisen.length; i++) {
            kumuliert += gewichte[i];
            if (zufallswert <= kumuliert) {
                return zahlweisen[i].name;
            }
        }
        return 'monatlich';
    }

    berechneJahresbeitrag(beitrag, zahlweise) {
        const faktoren = {
            'monatlich': 12,
            'vierteljährlich': 4,
            'halbjährlich': 2,
            'jährlich': 1
        };
        return Math.round(beitrag * (faktoren[zahlweise] || 12) * 100) / 100;
    }

    generiereVertragsbeginn(jahr, monat) {
        // Zufälliger Tag im aktuellen oder vorherigen Monat
        const versatz = this.zufallsZahl(0, 45);
        const datum = new Date(jahr, monat - 1, 15);
        datum.setDate(datum.getDate() - versatz);
        return datum.toISOString().split('T')[0];
    }

    generiereAltesVertragsdatum(jahr) {
        // 1-10 Jahre zurück
        const jahreZurueck = this.zufallsZahl(1, 10);
        const monat = this.zufallsZahl(1, 12);
        const tag = this.zufallsZahl(1, 28);
        return `${jahr - jahreZurueck}-${String(monat).padStart(2, '0')}-${String(tag).padStart(2, '0')}`;
    }

    berechneStornoQuote(monate, haftungszeit) {
        if (haftungszeit === 0) return 0;

        // Degressive Staffel: 100% im ersten Monat, dann linear fallend
        if (monate <= 1) return 100;
        if (monate >= haftungszeit) return 0;

        // Lineare Reduktion
        const quote = Math.round((1 - (monate - 1) / (haftungszeit - 1)) * 100);
        return Math.max(0, quote);
    }

    addiereTage(datumString, tage) {
        const datum = new Date(datumString);
        datum.setDate(datum.getDate() + tage);
        return datum.toISOString().split('T')[0];
    }

    letzterTagImMonat(jahr, monat) {
        return new Date(jahr, monat, 0).toISOString().split('T')[0];
    }

    zufallsZahl(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    waehleAusArray(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    // ========================================================================
    // EXPORT FÜR D1 DATENBANK
    // ========================================================================

    /**
     * Konvertiert die generierte Abrechnung für den D1 Import
     */
    exportFuerD1(abrechnung) {
        const abrechnungsDaten = {
            abrechnung_id: abrechnung.abrechnung_id,
            abrechnungs_monat: abrechnung.abrechnungs_monat,
            abrechnungs_jahr: abrechnung.abrechnungs_jahr,
            vermittler_nummer: abrechnung.vermittler_nummer,
            vermittler_name: abrechnung.vermittler_name,
            agentur_name: abrechnung.agentur_name,
            brutto_provision: abrechnung.brutto_provision,
            storno_einbehalte: abrechnung.storno_einbehalte,
            sonstige_abzuege: abrechnung.sonstige_abzuege,
            vorschuesse: abrechnung.vorschuesse,
            netto_auszahlung: abrechnung.netto_auszahlung,
            status: 'erstellt',
            pdf_name: `Provisionsabrechnung_${abrechnung.periode}.pdf`
        };

        const positionen = abrechnung.positionen.map(p => ({
            position_nummer: p.position_nummer,
            vertrag_id: p.vertrag_id,
            versicherungsnehmer: p.versicherungsnehmer,
            positions_art: p.positions_art,
            sparte: p.sparte,
            produkt: p.produkt,
            tarif: p.tarif,
            versicherer: p.versicherer,
            bezugsgroesse_name: p.bezugsgroesse_name,
            bezugsgroesse_wert: p.bezugsgroesse_wert,
            provisions_satz: p.provisions_satz,
            brutto_betrag: p.brutto_betrag,
            ist_storno: p.ist_storno,
            storno_quote: p.storno_quote,
            original_provisions_betrag: p.original_provisions_betrag,
            ist_dynamik: p.ist_dynamik,
            dynamik_erhoehung_betrag: p.dynamik_erhoehung_betrag,
            dynamik_stufe: p.dynamik_stufe,
            ist_superprovision: p.ist_superprovision,
            ursprungs_vermittler: p.ursprungs_vermittler,
            hierarchie_stufe: p.hierarchie_stufe
        }));

        // Extrahiere auch die Verträge für die Vertrags-Tabelle
        const vertraege = abrechnung.positionen
            .filter(p => p.vertrag_id && !p.ist_superprovision)
            .map(p => ({
                vertrag_id: p.vertrag_id,
                versicherungsnehmer_name: p.versicherungsnehmer,
                sparte: p.sparte,
                produkt_name: p.produkt,
                tarif: p.tarif,
                versicherer: p.versicherer,
                vertragsbeginn: p.vertragsbeginn,
                zahlweise: p.zahlweise,
                beitrag: p.beitrag,
                jahresbeitrag: p.jahresbeitrag,
                beitragssumme: p.bezugsgroesse_name === 'Beitragssumme' ? p.bezugsgroesse_wert : null,
                laufzeit_jahre: p.laufzeit_jahre,
                hat_dynamik: p.ist_dynamik,
                vermittler_nummer: abrechnung.vermittler_nummer,
                vermittler_name: abrechnung.vermittler_name,
                status: p.ist_storno ? 'storniert' : 'aktiv'
            }));

        return {
            abrechnung: abrechnungsDaten,
            positionen: positionen,
            vertraege: vertraege
        };
    }
}

// Globale Instanz
const billingGenerator = new RealisticBillingGenerator();
