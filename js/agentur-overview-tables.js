// ========================================
// VERTRAGSTABELLEN - Mock-Daten & Funktionen
// ========================================

var mockNeugeschaeft = [];
var mockBestand = [];
var mockStorno = [];

var spartenLabels = { leben: 'Leben', kranken: 'Kranken', schaden: 'Schaden', kfz: 'Kfz' };
var zahlweisen = ['Monatlich', 'Vierteljährlich', 'Halbjährlich', 'Jährlich'];
var stornoGruende = ['Preis / zu teuer', 'Wettbewerber', 'Leistung unzureichend', 'Finanzielle Gründe', 'Kein Bedarf mehr'];

function fmtDatum(d) {
    return String(d.getDate()).padStart(2, '0') + '.' + String(d.getMonth() + 1).padStart(2, '0') + '.' + d.getFullYear();
}

function fmtEuro(val) {
    return '€' + val.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function randomItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// Sparten-Mapping aus Versicherungstyp
function getSparte(typ) {
    typ = (typ || '').toLowerCase();
    if (typ.indexOf('leben') >= 0 || typ.indexOf('bu') >= 0 || typ.indexOf('berufsunf') >= 0 || typ.indexOf('risiko') >= 0) return 'leben';
    if (typ.indexOf('kranken') >= 0 || typ.indexOf('pflege') >= 0 || typ.indexOf('zahn') >= 0) return 'kranken';
    if (typ.indexOf('kfz') >= 0 || typ.indexOf('kasko') >= 0) return 'kfz';
    return 'schaden'; // Haftpflicht, Wohngebäude, Rechtsschutz, Unfall, Betriebshaftpflicht etc.
}

// Jahresbeitrag aus Prämie-String berechnen
function parsePraemie(praemieStr) {
    if (!praemieStr) return 0;
    var match = praemieStr.match(/[\d.,]+/);
    if (!match) return 0;
    var val = parseFloat(match[0].replace('.', '').replace(',', '.'));
    if (praemieStr.indexOf('/Mon') >= 0) return Math.round(val * 12);
    if (praemieStr.indexOf('/Jahr') >= 0) return Math.round(val);
    return Math.round(val);
}

// Zahlweise aus Prämie-String ableiten
function parseZahlweise(praemieStr) {
    if (!praemieStr) return 'Jährlich';
    if (praemieStr.indexOf('/Mon') >= 0) return 'Monatlich';
    return 'Jährlich';
}

// Bestandsverträge aus den Demo-Kundendaten (identisch mit Kunden-Detail Betreute Verträge)
var kundenBestandVertraege = [
    // Peter Schmidt KD00001
    { kunde: 'Peter Schmidt', kundenId: 'KD00001', typ: 'Berufsunfähigkeitsversicherung', versicherer: 'ERGO', details: 'BU-Rente: €1.500/Mon., Endalter 67, ohne Ausschlüsse', praemie: '€89/Mon.', beginn: '01.03.2018', status: 'Aktiv' },
    { kunde: 'Peter Schmidt', kundenId: 'KD00001', typ: 'Wohngebäudeversicherung', versicherer: 'VHV', details: 'Vers.-Summe: €450.000, inkl. Elementar, gleitender Neuwert', praemie: '€450/Jahr', beginn: '15.06.2019', status: 'Aktiv' },
    // Amira König KD00002
    { kunde: 'Amira König', kundenId: 'KD00002', typ: 'Risikolebensversicherung', versicherer: 'ERGO', details: 'Vers.-Summe: €150.000, Laufzeit bis 02/2026', praemie: '€18/Mon.', beginn: '01.02.2016', status: 'Aktiv' },
    { kunde: 'Amira König', kundenId: 'KD00002', typ: 'Berufsunfähigkeitsversicherung', versicherer: 'ERGO', details: 'BU-Rente: €1.800/Mon., Endalter 67', praemie: '€95/Mon.', beginn: '01.09.2015', status: 'Aktiv' },
    { kunde: 'Amira König', kundenId: 'KD00002', typ: 'Unfallversicherung', versicherer: 'Helvetia', details: 'Invalidität €100.000, Progression 350%', praemie: '€180/Jahr', beginn: '01.01.2020', status: 'Aktiv' },
    // Thomas Weber KD00003
    { kunde: 'Thomas Weber', kundenId: 'KD00003', typ: 'Privathaftpflichtversicherung', versicherer: 'ERGO', details: 'Single, €50 Mio. Deckung', praemie: '€65/Jahr', beginn: '01.03.2021', status: 'Aktiv' },
    // Anna Hoffmann KD00004
    { kunde: 'Anna Hoffmann', kundenId: 'KD00004', typ: 'Risikolebensversicherung', versicherer: 'ERGO', details: 'Vers.-Summe: €300.000, Laufzeit bis 2045', praemie: '€25/Mon.', beginn: '01.07.2020', status: 'Aktiv' },
    { kunde: 'Anna Hoffmann', kundenId: 'KD00004', typ: 'Berufsunfähigkeitsversicherung', versicherer: 'Alte Leipziger', details: 'BU-Rente: €2.000/Mon., Endalter 67', praemie: '€110/Mon.', beginn: '01.01.2019', status: 'Aktiv' },
    // Michael Braun KD00005
    { kunde: 'Michael Braun', kundenId: 'KD00005', typ: 'Berufsunfähigkeitsversicherung', versicherer: 'ERGO', details: 'BU-Rente: €3.500/Mon., Endalter 65', praemie: '€220/Mon.', beginn: '01.06.2010', status: 'Aktiv' },
    { kunde: 'Michael Braun', kundenId: 'KD00005', typ: 'Wohngebäudeversicherung', versicherer: 'Axa', details: 'Vers.-Summe: €750.000, inkl. Elementar', praemie: '€680/Jahr', beginn: '01.01.2012', status: 'Aktiv' },
    { kunde: 'Michael Braun', kundenId: 'KD00005', typ: 'Rechtsschutzversicherung', versicherer: 'ERGO', details: 'Premium inkl. Beruf, Verkehr, Privat', praemie: '€380/Jahr', beginn: '01.04.2018', status: 'Aktiv' },
    // Lisa Müller KD00006
    { kunde: 'Lisa Müller', kundenId: 'KD00006', typ: 'Berufsunfähigkeitsversicherung', versicherer: 'ERGO', details: 'BU-Rente: €2.500/Mon., Dienstunfähigkeitsklausel', praemie: '€145/Mon.', beginn: '01.08.2022', status: 'Aktiv' },
    // Matthias Engel KD00007
    { kunde: 'Matthias Engel', kundenId: 'KD00007', typ: 'Berufsunfähigkeitsversicherung', versicherer: 'Allianz', details: 'BU-Rente: €1.200/Mon., Endalter 65 - UNTERDECKT', praemie: '€75/Mon.', beginn: '01.04.2015', status: 'Aktiv' },
    { kunde: 'Matthias Engel', kundenId: 'KD00007', typ: 'Privathaftpflichtversicherung', versicherer: 'ERGO', details: 'Familie, €50 Mio. Deckung', praemie: '€85/Jahr', beginn: '01.01.2018', status: 'Aktiv' },
    // Christian Bauer KD00008
    { kunde: 'Christian Bauer', kundenId: 'KD00008', typ: 'Rechtsschutzversicherung', versicherer: 'ERGO', details: 'Beruf & Privat, €300 SB', praemie: '€280/Jahr', beginn: '01.06.2021', status: 'Aktiv' },
    // Martin Wolf KD00009
    { kunde: 'Martin Wolf', kundenId: 'KD00009', typ: 'Unfallversicherung', versicherer: 'ERGO', details: 'Invalidität €150.000, Progression 500%', praemie: '€320/Jahr', beginn: '01.03.2017', status: 'Aktiv' },
    { kunde: 'Martin Wolf', kundenId: 'KD00009', typ: 'Wohngebäudeversicherung', versicherer: 'VHV', details: 'Vers.-Summe: €380.000, inkl. Elementar', praemie: '€520/Jahr', beginn: '01.07.2016', status: 'Aktiv' },
    // Eva Hartmann KD00010
    { kunde: 'Eva Hartmann', kundenId: 'KD00010', typ: 'Berufsunfähigkeitsversicherung', versicherer: 'ERGO', details: 'BU-Rente: €1.000/Mon., Endalter 67 - Aufstockung empfohlen', praemie: '€68/Mon.', beginn: '01.09.2019', status: 'Aktiv' },
    { kunde: 'Eva Hartmann', kundenId: 'KD00010', typ: 'Betriebshaftpflicht', versicherer: 'Hiscox', details: '€2 Mio. Deckung, Freelancer-Tarif', praemie: '€290/Jahr', beginn: '01.01.2020', status: 'Aktiv' },
    // Neugeschäft-Kunden (Bestandsverträge)
    { kunde: 'Ralf Dietrich', kundenId: 'KD00026', typ: 'Wohngebäudeversicherung', versicherer: 'AXA', details: 'Vers.-Summe: €380.000, inkl. Elementar', praemie: '€420/Jahr', beginn: '01.05.2020', status: 'Aktiv' },
    { kunde: 'Ingrid Sommer', kundenId: 'KD00027', typ: 'Berufsunfähigkeitsversicherung', versicherer: 'ERGO', details: 'BU-Rente: €1.500/Mon., Endalter 67', praemie: '€92/Mon.', beginn: '01.11.2018', status: 'Aktiv' },
    { kunde: 'Dirk Hoffmann', kundenId: 'KD00028', typ: 'Berufsunfähigkeitsversicherung', versicherer: 'Alte Leipziger', details: 'BU-Rente: €2.200/Mon., Endalter 67', praemie: '€135/Mon.', beginn: '01.02.2017', status: 'Aktiv' },
    { kunde: 'Karin Albrecht', kundenId: 'KD00029', typ: 'Risikolebensversicherung', versicherer: 'ERGO', details: 'Vers.-Summe: €200.000, Laufzeit bis 2042', praemie: '€20/Mon.', beginn: '01.06.2019', status: 'Aktiv' },
    { kunde: 'Bernd Schuster', kundenId: 'KD00030', typ: 'Rechtsschutzversicherung', versicherer: 'ERGO', details: 'Familie, inkl. Beruf & Verkehr', praemie: '€350/Jahr', beginn: '01.01.2021', status: 'Aktiv' },
    { kunde: 'Andrea Haas', kundenId: 'KD00031', typ: 'Privathaftpflichtversicherung', versicherer: 'Allianz', details: 'Single, €50 Mio. Deckung', praemie: '€70/Jahr', beginn: '01.08.2022', status: 'Aktiv' },
    { kunde: 'Holger Friedrich', kundenId: 'KD00032', typ: 'Wohngebäudeversicherung', versicherer: 'Generali', details: 'Vers.-Summe: €300.000, gleitender Neuwert', praemie: '€380/Jahr', beginn: '01.03.2019', status: 'Aktiv' },
    { kunde: 'Sabine Stein', kundenId: 'KD00033', typ: 'Berufsunfähigkeitsversicherung', versicherer: 'HDI', details: 'BU-Rente: €1.800/Mon., Endalter 67', praemie: '€105/Mon.', beginn: '01.07.2020', status: 'Aktiv' },
    { kunde: 'Norbert Keller', kundenId: 'KD00034', typ: 'Unfallversicherung', versicherer: 'ERGO', details: 'Invalidität €120.000, Progression 300%', praemie: '€210/Jahr', beginn: '01.04.2018', status: 'Aktiv' },
    { kunde: 'Ulrike Maier', kundenId: 'KD00035', typ: 'Berufsunfähigkeitsversicherung', versicherer: 'Zurich', details: 'BU-Rente: €1.600/Mon., Endalter 67', praemie: '€88/Mon.', beginn: '01.10.2021', status: 'Aktiv' }
];

function generateMockVertraege() {
    var now = new Date();
    var bsNr = 1;

    // ======== BESTAND: Echte Verträge aus Kundendaten ========
    mockBestand = [];
    kundenBestandVertraege.forEach(function(v) {
        var sparte = getSparte(v.typ);
        var jahresbeitrag = parsePraemie(v.praemie);
        var provFaktor = sparte === 'leben' ? 5 : (sparte === 'kranken' ? 3 : (sparte === 'kfz' ? 0.2 : 0.25));
        // Beginn-Datum parsen
        var bParts = v.beginn.split('.');
        var beginnDate = new Date(parseInt(bParts[2]), parseInt(bParts[1]) - 1, parseInt(bParts[0]));
        var laufzeit = now.getFullYear() - beginnDate.getFullYear();
        mockBestand.push({
            vertragsnr: 'BS-' + bParts[2] + '-' + String(bsNr++).padStart(3, '0'),
            kunde: v.kunde, kundenId: v.kundenId,
            sparte: sparte, sparteLabel: spartenLabels[sparte],
            produkt: v.typ, versicherer: v.versicherer,
            jahresbeitrag: jahresbeitrag, status: v.status,
            vertragsbeginn: beginnDate, vertragsbeginnStr: v.beginn,
            zahlweise: parseZahlweise(v.praemie),
            provision: Math.floor(jahresbeitrag * provFaktor),
            hauptfaelligkeit: '01.01.' + (now.getFullYear() + 1),
            laufzeit: laufzeit + ' Jahre',
            details: v.details
        });
    });

    // ======== NEUGESCHÄFT: Neue Verträge für bestehende Kunden (letzte 90 Tage) ========
    mockNeugeschaeft = [];
    var ngVertraege = [
        { kunde: 'Ralf Dietrich', kundenId: 'KD00026', typ: 'Berufsunfähigkeitsversicherung', versicherer: 'HDI', details: 'BU-Rente: €2.000/Mon., Endalter 67', praemie: '€125/Mon.', daysAgo: 5, status: 'Policiert' },
        { kunde: 'Ralf Dietrich', kundenId: 'KD00026', typ: 'Privathaftpflichtversicherung', versicherer: 'HDI', details: 'Familie, €50 Mio. Deckung', praemie: '€85/Jahr', daysAgo: 5, status: 'Policiert' },
        { kunde: 'Ingrid Sommer', kundenId: 'KD00027', typ: 'Zahnzusatzversicherung', versicherer: 'DKV', details: 'Zahnersatz 90%, Prophylaxe 100%', praemie: '€32/Mon.', daysAgo: 8, status: 'Policiert' },
        { kunde: 'Ingrid Sommer', kundenId: 'KD00027', typ: 'Hausratversicherung', versicherer: 'Allianz', details: 'Vers.-Summe: €65.000, inkl. Fahrrad', praemie: '€130/Jahr', daysAgo: 12, status: 'Policiert' },
        { kunde: 'Dirk Hoffmann', kundenId: 'KD00028', typ: 'Kfz-Versicherung', versicherer: 'HUK-Coburg', details: 'Kfz-Vollkasko, SF-Klasse 8, BMW 3er', praemie: '€980/Jahr', daysAgo: 10, status: 'Antrag' },
        { kunde: 'Dirk Hoffmann', kundenId: 'KD00028', typ: 'Rechtsschutzversicherung', versicherer: 'ARAG', details: 'Familie, inkl. Beruf & Verkehr', praemie: '€420/Jahr', daysAgo: 18, status: 'Policiert' },
        { kunde: 'Karin Albrecht', kundenId: 'KD00029', typ: 'Unfallversicherung', versicherer: 'Zurich', details: 'Familie, Invalidität €200.000', praemie: '€280/Jahr', daysAgo: 15, status: 'Policiert' },
        { kunde: 'Karin Albrecht', kundenId: 'KD00029', typ: 'Pflegezusatzversicherung', versicherer: 'Signal Iduna', details: 'Pflege-Bahr, €600/Mon.', praemie: '€45/Mon.', daysAgo: 20, status: 'Policiert' },
        { kunde: 'Bernd Schuster', kundenId: 'KD00030', typ: 'Wohngebäudeversicherung', versicherer: 'VHV', details: 'Vers.-Summe: €520.000, inkl. Elementar', praemie: '€580/Jahr', daysAgo: 22, status: 'Policiert' },
        { kunde: 'Andrea Haas', kundenId: 'KD00031', typ: 'Krankentagegeld', versicherer: 'DKV', details: 'Ab 43. Tag, €100/Tag', praemie: '€55/Mon.', daysAgo: 25, status: 'Policiert' },
        { kunde: 'Andrea Haas', kundenId: 'KD00031', typ: 'Berufsunfähigkeitsversicherung', versicherer: 'Nürnberger', details: 'BU-Rente: €1.800/Mon., Endalter 67', praemie: '€98/Mon.', daysAgo: 30, status: 'Antrag' },
        { kunde: 'Holger Friedrich', kundenId: 'KD00032', typ: 'Kfz-Versicherung', versicherer: 'VHV', details: 'Kfz-Teilkasko, VW Passat', praemie: '€480/Jahr', daysAgo: 35, status: 'Policiert' },
        { kunde: 'Sabine Stein', kundenId: 'KD00033', typ: 'Risikolebensversicherung', versicherer: 'ERGO', details: 'Vers.-Summe: €250.000, Laufzeit bis 2050', praemie: '€22/Mon.', daysAgo: 38, status: 'Policiert' },
        { kunde: 'Norbert Keller', kundenId: 'KD00034', typ: 'Hausratversicherung', versicherer: 'Generali', details: 'Vers.-Summe: €60.000, Single', praemie: '€110/Jahr', daysAgo: 42, status: 'Policiert' },
        { kunde: 'Norbert Keller', kundenId: 'KD00034', typ: 'Krankenversicherung Zusatz', versicherer: 'Debeka', details: 'Heilpraktiker & Sehhilfen', praemie: '€28/Mon.', daysAgo: 45, status: 'Policiert' },
        { kunde: 'Ulrike Maier', kundenId: 'KD00035', typ: 'Unfallversicherung', versicherer: 'Helvetia', details: 'Invalidität €150.000, Progression 350%', praemie: '€220/Jahr', daysAgo: 50, status: 'Policiert' },
        { kunde: 'Ulrike Maier', kundenId: 'KD00035', typ: 'Privathaftpflichtversicherung', versicherer: 'Allianz', details: 'Single mit Partner, €50 Mio.', praemie: '€75/Jahr', daysAgo: 55, status: 'Policiert' }
    ];

    ngVertraege.forEach(function(v, i) {
        var sparte = getSparte(v.typ);
        var jahresbeitrag = parsePraemie(v.praemie);
        var antragDate = new Date(now); antragDate.setDate(antragDate.getDate() - v.daysAgo);
        var provFaktor = sparte === 'leben' ? 5 : (sparte === 'kranken' ? 3 : (sparte === 'kfz' ? 0.2 : 0.25));
        mockNeugeschaeft.push({
            vertragsnr: 'NG-' + now.getFullYear() + '-' + String(i + 1).padStart(3, '0'),
            kunde: v.kunde, kundenId: v.kundenId,
            sparte: sparte, sparteLabel: spartenLabels[sparte],
            produkt: v.typ, versicherer: v.versicherer,
            jahresbeitrag: jahresbeitrag, status: v.status,
            antragsdatum: antragDate, antragsdatumStr: fmtDatum(antragDate),
            zahlweise: parseZahlweise(v.praemie),
            provision: Math.floor(jahresbeitrag * provFaktor),
            vertragsbeginn: antragDate, vertragsbeginnStr: fmtDatum(antragDate),
            hauptfaelligkeit: '01.01.' + (now.getFullYear() + 1),
            laufzeit: '1 Jahr',
            details: v.details
        });
    });

    // ======== STORNO: Stornierte Verträge für reale Kunden ========
    mockStorno = [];
    // Storno-Verträge: bewusst ANDERE Kunden als auf der A-02 Übersicht
    var stVertraege = [
        { kunde: 'Herbert Lange', kundenId: 'KD00015', typ: 'Kfz-Versicherung', versicherer: 'HUK-Coburg', details: 'Kfz-Haftpflicht, alter Vertrag', praemie: '€580/Jahr', daysAgo: 30, grund: 'Wettbewerber', frueh: false },
        { kunde: 'Sandra Richter', kundenId: 'KD00016', typ: 'Hausratversicherung', versicherer: 'AXA', details: 'Vers.-Summe: €40.000', praemie: '€120/Jahr', daysAgo: 60, grund: 'Kein Bedarf mehr', frueh: false },
        { kunde: 'Frank Zimmermann', kundenId: 'KD00017', typ: 'Unfallversicherung', versicherer: 'Zurich', details: 'Basis-Tarif, Invalidität €50.000', praemie: '€150/Jahr', daysAgo: 15, grund: 'Preis / zu teuer', frueh: true },
        { kunde: 'Monika Schwarz', kundenId: 'KD00018', typ: 'Privathaftpflichtversicherung', versicherer: 'HDI', details: 'Alter Tarif, €10 Mio. Deckung', praemie: '€95/Jahr', daysAgo: 90, grund: 'Wettbewerber', frueh: false },
        { kunde: 'Werner Krüger', kundenId: 'KD00019', typ: 'Rechtsschutzversicherung', versicherer: 'ARAG', details: 'Privat, €500 SB', praemie: '€240/Jahr', daysAgo: 45, grund: 'Preis / zu teuer', frueh: true },
        { kunde: 'Birgit Neumann', kundenId: 'KD00020', typ: 'Zahnzusatzversicherung', versicherer: 'DKV', details: 'Zahnersatz 60%', praemie: '€22/Mon.', daysAgo: 25, grund: 'Leistung unzureichend', frueh: true },
        { kunde: 'Jürgen Fischer', kundenId: 'KD00021', typ: 'Kfz-Versicherung', versicherer: 'Allianz', details: 'Teilkasko, BMW 3er', praemie: '€380/Jahr', daysAgo: 75, grund: 'Wettbewerber', frueh: false },
        { kunde: 'Klaus Wagner', kundenId: 'KD00022', typ: 'Berufsunfähigkeitsversicherung', versicherer: 'Generali', details: 'BU-Rente: €800/Mon.', praemie: '€180/Mon.', daysAgo: 120, grund: 'Finanzielle Gründe', frueh: true },
        { kunde: 'Petra Schneider', kundenId: 'KD00023', typ: 'Rechtsschutzversicherung', versicherer: 'ERGO', details: 'Privat & Beruf', praemie: '€260/Jahr', daysAgo: 100, grund: 'Kein Bedarf mehr', frueh: false },
        { kunde: 'Stefan Becker', kundenId: 'KD00024', typ: 'Kfz-Versicherung', versicherer: 'VHV', details: 'Kfz-Haftpflicht, Zweitwagen', praemie: '€350/Jahr', daysAgo: 40, grund: 'Preis / zu teuer', frueh: true },
        { kunde: 'Susanne Vogel', kundenId: 'KD00025', typ: 'Zahnzusatzversicherung', versicherer: 'Allianz', details: 'Zahnersatz 70%, Prophylaxe', praemie: '€28/Mon.', daysAgo: 150, grund: 'Leistung unzureichend', frueh: false }
    ];

    stVertraege.forEach(function(v, i) {
        var sparte = getSparte(v.typ);
        var jahresbeitrag = parsePraemie(v.praemie);
        var stornoDate = new Date(now); stornoDate.setDate(stornoDate.getDate() - v.daysAgo);
        var provFaktor = sparte === 'leben' ? 5 : (sparte === 'kranken' ? 3 : (sparte === 'kfz' ? 0.2 : 0.25));
        mockStorno.push({
            vertragsnr: 'ST-' + now.getFullYear() + '-' + String(i + 1).padStart(3, '0'),
            kunde: v.kunde, kundenId: v.kundenId,
            sparte: sparte, sparteLabel: spartenLabels[sparte],
            produkt: v.typ, versicherer: v.versicherer,
            jahresbeitrag: jahresbeitrag, status: 'Storniert',
            stornodatum: stornoDate, stornodatumStr: fmtDatum(stornoDate),
            stornogrund: v.grund,
            stornoTyp: v.frueh ? 'Frühstorno' : 'Spätstorno',
            stornoTypClass: v.frueh ? 'frueh' : 'spaet',
            zahlweise: parseZahlweise(v.praemie),
            provision: Math.floor(jahresbeitrag * provFaktor),
            vertragsbeginn: stornoDate, vertragsbeginnStr: fmtDatum(stornoDate),
            hauptfaelligkeit: '-',
            laufzeit: '-',
            details: v.details
        });
    });
}

function fillNeugeschaeftTable() {
    var tb = document.getElementById('neugeschaeftTableBody');
    if (!tb) return;

    // Nach Kunden gruppieren
    var kundenMap = {};
    var kundenOrder = [];
    mockNeugeschaeft.forEach(function(v, i) {
        v._ngIdx = i;
        if (!kundenMap[v.kundenId]) {
            kundenMap[v.kundenId] = { kunde: v.kunde, kundenId: v.kundenId, vertraege: [] };
            kundenOrder.push(v.kundenId);
        }
        kundenMap[v.kundenId].vertraege.push(v);
    });

    var html = '';
    kundenOrder.forEach(function(kid) {
        var g = kundenMap[kid];
        var anzahl = g.vertraege.length;
        var gesamtBeitrag = g.vertraege.reduce(function(s, v) { return s + v.jahresbeitrag; }, 0);
        html += '<tr class="ng-kunde-header-row" data-kundenid="' + kid + '">' +
            '<td colspan="6"><strong>' + g.kunde + '</strong> <span class="ng-kunde-meta">' + kid + ' &middot; ' + anzahl + ' Vertrag' + (anzahl > 1 ? 'e' : '') + ' &middot; Gesamt: ' + fmtEuro(gesamtBeitrag) + '</span></td>' +
            '</tr>';
        g.vertraege.forEach(function(v) {
            var statusClass = v.status === 'Policiert' ? 'active' : (v.status === 'Abgelehnt' ? 'storniert' : 'antrag');
            html += '<tr class="clickable-row" data-sparte="' + v.sparte + '" data-kundenid="' + kid + '" onclick="openVertragDetail(' + v._ngIdx + ',\'ng\')">' +
                '<td>' + v.vertragsnr + '</td>' +
                '<td><span class="sparten-badge ' + v.sparte + '">' + v.sparteLabel + '</span> ' + v.produkt + '</td>' +
                '<td>' + v.versicherer + '</td>' +
                '<td><strong>' + fmtEuro(v.jahresbeitrag) + '</strong> <span class="ng-zahlweise-label">' + v.zahlweise + '</span></td>' +
                '<td><span class="status-badge ' + statusClass + '">' + v.status + '</span></td>' +
                '<td>' + v.antragsdatumStr + '</td>' +
                '</tr>';
        });
    });
    tb.innerHTML = html;
}

function fillBestandTable() {
    var tb = document.getElementById('bestandTableBody');
    if (!tb) return;

    // Nach Kunden gruppieren (wie Neugeschäft)
    var kundenMap = {};
    var kundenOrder = [];
    mockBestand.forEach(function(v, i) {
        v._bsIdx = i;
        if (!kundenMap[v.kundenId]) {
            kundenMap[v.kundenId] = { kunde: v.kunde, kundenId: v.kundenId, vertraege: [] };
            kundenOrder.push(v.kundenId);
        }
        kundenMap[v.kundenId].vertraege.push(v);
    });

    var html = '';
    kundenOrder.forEach(function(kid) {
        var g = kundenMap[kid];
        var anzahl = g.vertraege.length;
        var gesamtBeitrag = g.vertraege.reduce(function(s, v) { return s + v.jahresbeitrag; }, 0);
        html += '<tr class="ng-kunde-header-row" data-kundenid="' + kid + '">' +
            '<td colspan="6"><strong>' + g.kunde + '</strong> <span class="ng-kunde-meta">' + kid + ' &middot; ' + anzahl + ' Vertrag' + (anzahl > 1 ? 'e' : '') + ' &middot; Gesamt: ' + fmtEuro(gesamtBeitrag) + '</span></td>' +
            '</tr>';
        g.vertraege.forEach(function(v) {
            var statusClass = v.status === 'Aktiv' ? 'active' : 'ruhend';
            html += '<tr class="clickable-row" data-sparte="' + v.sparte + '" data-kundenid="' + kid + '" data-bs-idx="' + v._bsIdx + '" onclick="openVertragDetail(' + v._bsIdx + ',\'bs\')">' +
                '<td>' + v.vertragsnr + '</td>' +
                '<td><span class="sparten-badge ' + v.sparte + '">' + v.sparteLabel + '</span> ' + v.produkt + '</td>' +
                '<td>' + v.versicherer + '</td>' +
                '<td><strong>' + fmtEuro(v.jahresbeitrag) + '</strong> <span class="ng-zahlweise-label">' + v.zahlweise + '</span></td>' +
                '<td>' + v.vertragsbeginnStr + '</td>' +
                '<td><span class="status-badge ' + statusClass + '">' + v.status + '</span></td></tr>';
        });
    });
    tb.innerHTML = html;
}

function fillStornoTable() {
    var tb = document.getElementById('stornoTableBody');
    if (!tb) return;
    tb.innerHTML = mockStorno.map(function(v, i) {
        return '<tr class="clickable-row" data-stornotyp="' + v.stornoTypClass + '" data-sparte="' + v.sparte + '" onclick="openVertragDetail(' + i + ',\'st\')">' +
            '<td>' + v.vertragsnr + '</td>' +
            '<td><strong>' + v.kunde + '</strong></td>' +
            '<td>' + v.kundenId + '</td>' +
            '<td><span class="sparten-badge ' + v.sparte + '">' + v.sparteLabel + '</span></td>' +
            '<td>' + v.produkt + '</td>' +
            '<td><strong>' + fmtEuro(v.jahresbeitrag) + '</strong></td>' +
            '<td>' + v.stornodatumStr + '</td>' +
            '<td>' + v.stornogrund + '</td>' +
            '<td><span class="storno-typ-badge ' + v.stornoTypClass + '">' + v.stornoTyp + '</span></td></tr>';
    }).join('');
}

function filterVertraegeSparte(tabName, sparte) {
    var section = document.getElementById('tab-' + tabName);
    if (!section) return;
    section.querySelectorAll('.fida-filter-btn').forEach(function(b) { b.classList.remove('active'); });
    var clicked = section.querySelector('.fida-filter-btn[data-filter="' + sparte + '"]');
    if (clicked) clicked.classList.add('active');

    var rows = section.querySelectorAll('tbody tr');
    if (tabName === 'neugeschaeft' || tabName === 'bestand') {
        // Tabelle mit Kunden-Header-Rows
        var visibleKunden = {};
        rows.forEach(function(row) {
            if (row.classList.contains('ng-kunde-header-row')) return;
            if (sparte === 'alle') { row.style.display = ''; visibleKunden[row.getAttribute('data-kundenid')] = true; }
            else {
                var match = row.getAttribute('data-sparte') === sparte;
                row.style.display = match ? '' : 'none';
                if (match) visibleKunden[row.getAttribute('data-kundenid')] = true;
            }
        });
        rows.forEach(function(row) {
            if (row.classList.contains('ng-kunde-header-row')) {
                row.style.display = visibleKunden[row.getAttribute('data-kundenid')] ? '' : 'none';
            }
        });
    } else {
        rows.forEach(function(row) {
            if (sparte === 'alle') { row.style.display = ''; }
            else { row.style.display = row.getAttribute('data-sparte') === sparte ? '' : 'none'; }
        });
    }
}

function filterStornoTyp(typ) {
    var section = document.getElementById('tab-storno');
    if (!section) return;
    section.querySelectorAll('.fida-filter-btn').forEach(function(b) { b.classList.remove('active'); });
    var clicked = section.querySelector('.fida-filter-btn[data-filter="' + typ + '"]');
    if (clicked) clicked.classList.add('active');
    var rows = section.querySelectorAll('tbody tr');
    rows.forEach(function(row) {
        if (typ === 'alle') { row.style.display = ''; }
        else { row.style.display = row.getAttribute('data-stornotyp') === typ ? '' : 'none'; }
    });
}

function searchVertraege(tabName) {
    var section = document.getElementById('tab-' + tabName);
    if (!section) return;
    var input = section.querySelector('.vertrags-search input');
    if (!input) return;
    var q = input.value.toLowerCase();

    var rows = section.querySelectorAll('tbody tr');
    if (tabName === 'neugeschaeft' || tabName === 'bestand') {
        var visibleKunden = {};
        rows.forEach(function(row) {
            if (row.classList.contains('ng-kunde-header-row')) return;
            var match = row.textContent.toLowerCase().indexOf(q) >= 0;
            row.style.display = match ? '' : 'none';
            if (match) visibleKunden[row.getAttribute('data-kundenid')] = true;
        });
        // Auch Header-Row nach Kundenname durchsuchen
        rows.forEach(function(row) {
            if (row.classList.contains('ng-kunde-header-row')) {
                if (row.textContent.toLowerCase().indexOf(q) >= 0) {
                    visibleKunden[row.getAttribute('data-kundenid')] = true;
                }
                row.style.display = visibleKunden[row.getAttribute('data-kundenid')] ? '' : 'none';
            }
        });
        // Wenn Kunden-Header matched, alle Verträge dieses Kunden anzeigen
        rows.forEach(function(row) {
            if (!row.classList.contains('ng-kunde-header-row') && visibleKunden[row.getAttribute('data-kundenid')]) {
                row.style.display = '';
            }
        });
    } else {
        rows.forEach(function(row) {
            row.style.display = row.textContent.toLowerCase().indexOf(q) >= 0 ? '' : 'none';
        });
    }
}

// Bestand Zeitraum-Filter
function filterBestandZeitraum(zeitraum) {
    var section = document.getElementById('tab-bestand');
    if (!section) return;
    section.querySelectorAll('.zeitraum-btn').forEach(function(b) { b.classList.remove('active'); });
    if (event && event.target) event.target.classList.add('active');

    var now = new Date();
    var cutoff = null;
    if (zeitraum === '1j') cutoff = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    else if (zeitraum === '3j') cutoff = new Date(now.getFullYear() - 3, now.getMonth(), now.getDate());
    else if (zeitraum === '5j') cutoff = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate());

    var rows = section.querySelectorAll('#bestandTableBody tr');
    var visibleKunden = {};
    rows.forEach(function(row) {
        if (row.classList.contains('ng-kunde-header-row')) return;
        if (!cutoff || zeitraum === 'alle') {
            row.style.display = '';
            visibleKunden[row.getAttribute('data-kundenid')] = true;
            return;
        }
        var bsIdx = parseInt(row.getAttribute('data-bs-idx'));
        var v = mockBestand[bsIdx];
        if (v && v.vertragsbeginn) {
            var match = v.vertragsbeginn >= cutoff;
            row.style.display = match ? '' : 'none';
            if (match) visibleKunden[row.getAttribute('data-kundenid')] = true;
        }
    });
    rows.forEach(function(row) {
        if (row.classList.contains('ng-kunde-header-row')) {
            row.style.display = visibleKunden[row.getAttribute('data-kundenid')] ? '' : 'none';
        }
    });
}
window.filterBestandZeitraum = filterBestandZeitraum;

// Vertragsdetail Modal
function openVertragDetail(idx, typ) {
    var v;
    if (typ === 'ng') v = mockNeugeschaeft[idx];
    else if (typ === 'bs') v = mockBestand[idx];
    else if (typ === 'st') v = mockStorno[idx];
    if (!v) return;

    var modal = document.getElementById('vertragDetailModal');
    if (!modal) { console.error('vertragDetailModal nicht gefunden'); return; }
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    setElementText('vertragDetailTitle', 'Vertrag: ' + v.vertragsnr);
    var statusEl = document.getElementById('vertragDetailStatus');
    if (statusEl) { statusEl.textContent = v.status; statusEl.className = 'vertrag-status-badge status-badge ' + (v.status === 'Policiert' || v.status === 'Aktiv' ? 'active' : (v.status === 'Storniert' ? 'storniert' : 'antrag')); }

    setElementText('vdVertragsnr', v.vertragsnr);
    setElementText('vdSparte', v.sparteLabel);
    setElementText('vdProdukt', v.produkt);
    setElementText('vdVersicherer', v.versicherer);
    setElementText('vdStatus', v.status);
    setElementText('vdJahresbeitrag', fmtEuro(v.jahresbeitrag));
    setElementText('vdZahlweise', v.zahlweise);
    setElementText('vdProvision', fmtEuro(v.provision));
    setElementText('vdBeginn', v.vertragsbeginnStr);
    setElementText('vdFaelligkeit', v.hauptfaelligkeit);
    setElementText('vdLaufzeit', v.laufzeit);
    setElementText('vdKunde', v.kunde);
    setElementText('vdKundenId', v.kundenId);

    var kundeBtn = document.getElementById('vdKundeBtn');
    if (kundeBtn) {
        kundeBtn.onclick = function() { closeVertragDetail(); openKundenDetail(v.kunde, v.kundenId); };
    }

    var stornoSection = document.getElementById('vdStornoSection');
    if (stornoSection) {
        if (typ === 'st') {
            stornoSection.style.display = 'block';
            setElementText('vdStornodatum', v.stornodatumStr);
            setElementText('vdStornogrund', v.stornogrund);
            setElementText('vdStornoTyp', v.stornoTyp);
        } else {
            stornoSection.style.display = 'none';
        }
    }
}

function closeVertragDetail() {
    var modal = document.getElementById('vertragDetailModal');
    if (modal) {
        modal.style.display = 'none';
    }
    document.body.style.overflow = '';
}

// ESC schließt offene Modals
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeVertragDetail();
        if (typeof closeTarifvergleich === 'function') closeTarifvergleich();
    }
});

window.openVertragDetail = openVertragDetail;
window.closeVertragDetail = closeVertragDetail;
window.filterVertraegeSparte = filterVertraegeSparte;
window.filterStornoTyp = filterStornoTyp;
window.searchVertraege = searchVertraege;

/**
 * Hilfs-Funktionen
 */

function setElementText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

function formatCurrency(value) {
    if (value >= 1000000) {
        return `€${(value / 1000000).toFixed(2)} Mio`;
    } else if (value >= 1000) {
        return `€${(value / 1000).toFixed(0)}k`;
    }
    return `€${value.toFixed(0)}`;
}

function calculateAgenturstufe(neugeschaeft) {
    if (neugeschaeft >= 5000000) return 'Gold Plus';
    if (neugeschaeft >= 3000000) return 'Gold';
    if (neugeschaeft >= 2000000) return 'Silber Plus';
    if (neugeschaeft >= 1000000) return 'Silber';
    return 'Bronze';
}

function generateAddress(bundesland) {
    const addresses = {
        'Baden-Württemberg': 'Hauptstraße 42, 79098 Freiburg',
        'Bayern': 'Marienplatz 8, 80331 München',
        'Berlin': 'Unter den Linden 5, 10117 Berlin',
        'Hamburg': 'Reeperbahn 1, 20359 Hamburg',
        'Nordrhein-Westfalen': 'Königsallee 60, 40212 Düsseldorf',
        'Hessen': 'Zeil 106, 60313 Frankfurt am Main',
        'Sachsen': 'Prager Straße 12, 01069 Dresden',
        'Niedersachsen': 'Georgstraße 36, 30159 Hannover'
    };

    return addresses[bundesland] || 'Hauptstraße 1, 10115 Berlin';
}

function generatePhone() {
    const prefix = ['089', '030', '040', '069', '0211', '0221'];
    return `${prefix[Math.floor(Math.random() * prefix.length)]} ${Math.floor(Math.random() * 9000000 + 1000000)}`;
}

function generateEmail(name) {
    if (!name) return 'kontakt@agentur.de';
    const cleanName = name.toLowerCase().replace(/\s+/g, '.').replace(/[äöü]/g, c => ({ 'ä': 'ae', 'ö': 'oe', 'ü': 'ue' })[c] || c);
    return `${cleanName}@versicherung.de`;
}

function generateEintrittsdatum() {
    const yearsAgo = Math.floor(Math.random() * 15) + 1;
    const date = new Date();
    date.setFullYear(date.getFullYear() - yearsAgo);
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/**
 * Navigation Functions
 */

