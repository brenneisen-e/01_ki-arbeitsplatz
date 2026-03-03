// ========================================
// B-02 Berater-Uebersicht (Banking)
// Drei Modi: VR Retail, VR Firmenkunde, VR Vermoegen
// Expanded Version mit Tabs, Charts, Potentiale, Chat
// ========================================

(function() {
    'use strict';

    // ── State ──────────────────────────────
    var bankViewMode = localStorage.getItem('bankViewMode') || 'retail';
    var currentBeraterTab = 'uebersicht';
    var beraterChartInstances = [];

    // ── Mock-Daten: Retail-Kunden (erweitert) ──
    var retailKunden = [
        { id: 'PK-10021', name: 'Markus Hoffmann', segment: 'A-Top', ort: 'Giessen', produkte: 5, ertrag: 1850, finanzplan: true, kontostand: 12400, baufi: true, avatarBg: '#2563eb', beruf: 'Ingenieur', alter: 42, letztKontakt: 3 },
        { id: 'PK-10034', name: 'Sabine Kramer', segment: 'A-Top', ort: 'Wetzlar', produkte: 4, ertrag: 2100, finanzplan: true, kontostand: 28900, baufi: false, avatarBg: '#7c3aed', beruf: 'Aerztin', alter: 38, letztKontakt: 7 },
        { id: 'PK-10056', name: 'Thomas Mueller', segment: 'B-Wachstum', ort: 'Marburg', produkte: 3, ertrag: 980, finanzplan: false, kontostand: 5600, baufi: false, avatarBg: '#0891b2', beruf: 'Software-Entwickler', alter: 29, letztKontakt: 14 },
        { id: 'PK-10078', name: 'Andrea Fischer', segment: 'B-Wachstum', ort: 'Giessen', produkte: 3, ertrag: 1200, finanzplan: true, kontostand: 18200, baufi: true, avatarBg: '#059669', beruf: 'Lehrerin', alter: 51, letztKontakt: 5 },
        { id: 'PK-10089', name: 'Klaus Weber', segment: 'B-Wachstum', ort: 'Wetzlar', produkte: 2, ertrag: 760, finanzplan: false, kontostand: 3400, baufi: false, avatarBg: '#d97706', beruf: 'Elektriker', alter: 34, letztKontakt: 21 },
        { id: 'PK-10102', name: 'Julia Braun', segment: 'C-Basis', ort: 'Marburg', produkte: 2, ertrag: 420, finanzplan: false, kontostand: 1850, baufi: false, avatarBg: '#e11d48', beruf: 'Studentin', alter: 26, letztKontakt: 45 },
        { id: 'PK-10115', name: 'Michael Schneider', segment: 'Abwanderung', ort: 'Giessen', produkte: 1, ertrag: 180, finanzplan: false, kontostand: 450, baufi: false, avatarBg: '#64748b', beruf: 'Vertriebsleiter', alter: 44, letztKontakt: 90 },
        { id: 'PK-10128', name: 'Petra Lang', segment: 'C-Basis', ort: 'Wetzlar', produkte: 2, ertrag: 540, finanzplan: false, kontostand: 2100, baufi: false, avatarBg: '#be185d', beruf: 'Verwaltungsangestellte', alter: 55, letztKontakt: 30 },
        { id: 'PK-10141', name: 'Stefan Richter', segment: 'A-Top', ort: 'Giessen', produkte: 6, ertrag: 3200, finanzplan: true, kontostand: 42000, baufi: true, avatarBg: '#1d4ed8', beruf: 'Unternehmer', alter: 48, letztKontakt: 2 },
        { id: 'PK-10154', name: 'Monika Baumann', segment: 'B-Wachstum', ort: 'Marburg', produkte: 3, ertrag: 890, finanzplan: false, kontostand: 8200, baufi: false, avatarBg: '#9333ea', beruf: 'Apothekerin', alter: 39, letztKontakt: 12 },
        { id: 'PK-10167', name: 'Frank Zimmermann', segment: 'Abwanderung', ort: 'Wetzlar', produkte: 1, ertrag: 120, finanzplan: false, kontostand: 280, baufi: false, avatarBg: '#94a3b8', beruf: 'Freiberufler', alter: 31, letztKontakt: 120 },
        { id: 'PK-10180', name: 'Christina Vogel', segment: 'B-Wachstum', ort: 'Giessen', produkte: 4, ertrag: 1450, finanzplan: true, kontostand: 15600, baufi: false, avatarBg: '#0d9488', beruf: 'Marketing-Managerin', alter: 36, letztKontakt: 8 }
    ];

    // ── Mock-Daten: Firmenkunden (erweitert) ──
    var firmenKunden = [
        { id: 'FK-20010', name: 'Metallbau Schaefer GmbH', branche: 'handwerk', brancheLabel: 'Handwerk/Bau', ort: 'Giessen', kreditvol: 4200000, rating: 'A', mitarbeiter: 85, umsatz: 12500000, kreditlinie: 5000000, auslastung: 84, gruendung: 1982 },
        { id: 'FK-20023', name: 'TechSolutions Mittelhessen AG', branche: 'dienstleistung', brancheLabel: 'Dienstleistung/IT', ort: 'Wetzlar', kreditvol: 2800000, rating: 'AA', mitarbeiter: 120, umsatz: 18000000, kreditlinie: 4000000, auslastung: 70, gruendung: 2005 },
        { id: 'FK-20035', name: 'Gasthaus zur Linde KG', branche: 'handel', brancheLabel: 'Handel/Gastro', ort: 'Marburg', kreditvol: 850000, rating: 'BBB', mitarbeiter: 22, umsatz: 2800000, kreditlinie: 1200000, auslastung: 71, gruendung: 1968 },
        { id: 'FK-20048', name: 'Agrar Becker OHG', branche: 'landwirtschaft', brancheLabel: 'Landwirtschaft', ort: 'Giessen', kreditvol: 3100000, rating: 'A', mitarbeiter: 15, umsatz: 4200000, kreditlinie: 4000000, auslastung: 78, gruendung: 1955 },
        { id: 'FK-20061', name: 'Dr. med. Karin Engel — Praxisgemeinschaft', branche: 'heilberufe', brancheLabel: 'Heilberufe', ort: 'Wetzlar', kreditvol: 1200000, rating: 'AA', mitarbeiter: 8, umsatz: 1800000, kreditlinie: 1500000, auslastung: 80, gruendung: 2012 },
        { id: 'FK-20074', name: 'Wetzlarer Maschinenbau GmbH', branche: 'produktion', brancheLabel: 'Produktion/Industrie', ort: 'Wetzlar', kreditvol: 6800000, rating: 'A', mitarbeiter: 210, umsatz: 32000000, kreditlinie: 8000000, auslastung: 85, gruendung: 1974 },
        { id: 'FK-20087', name: 'Hessen Logistik Transport e.K.', branche: 'transport', brancheLabel: 'Transport/Logistik', ort: 'Giessen', kreditvol: 1900000, rating: 'BBB', mitarbeiter: 45, umsatz: 8500000, kreditlinie: 2500000, auslastung: 76, gruendung: 1998 },
        { id: 'FK-20093', name: 'Immobilien Roth GmbH Co. KG', branche: 'immobilien', brancheLabel: 'Immobilien', ort: 'Marburg', kreditvol: 9200000, rating: 'A', mitarbeiter: 18, umsatz: 6800000, kreditlinie: 12000000, auslastung: 77, gruendung: 1990 }
    ];

    // ── Mock-Daten: Vermoegenskunden (erweitert) ──
    var vermoegenKunden = [
        { id: 'VK-30010', name: 'Dr. Heinrich von Stein', ort: 'Giessen', aum: 8200000, depot: 5400000, vorsorge: 1800000, nachfolge: true, stiftung: false, avatarBg: '#1e40af', risikoklasse: 'Ausgewogen', letztReview: 15 },
        { id: 'VK-30023', name: 'Elisabeth Koenig-Hartmann', ort: 'Marburg', aum: 12500000, depot: 8200000, vorsorge: 2800000, nachfolge: true, stiftung: true, avatarBg: '#7c3aed', risikoklasse: 'Konservativ', letztReview: 8 },
        { id: 'VK-30035', name: 'Familie Riedel', ort: 'Wetzlar', aum: 4800000, depot: 3100000, vorsorge: 1200000, nachfolge: false, stiftung: false, avatarBg: '#0891b2', risikoklasse: 'Wachstum', letztReview: 22 },
        { id: 'VK-30048', name: 'Prof. Dr. Ulrich Baumann', ort: 'Giessen', aum: 6200000, depot: 4100000, vorsorge: 1500000, nachfolge: true, stiftung: true, avatarBg: '#b45309', risikoklasse: 'Ausgewogen', letztReview: 5 },
        { id: 'VK-30061', name: 'Ingrid Schaefer-Wolf', ort: 'Marburg', aum: 3800000, depot: 2400000, vorsorge: 900000, nachfolge: false, stiftung: false, avatarBg: '#be185d', risikoklasse: 'Konservativ', letztReview: 30 },
        { id: 'VK-30074', name: 'Dr. Felix Hartmann', ort: 'Wetzlar', aum: 7100000, depot: 4800000, vorsorge: 1600000, nachfolge: true, stiftung: false, avatarBg: '#059669', risikoklasse: 'Dynamisch', letztReview: 3 }
    ];

    // ── Berater-Profile je Modus ──────────
    var beraterProfile = {
        retail:     { name: 'Thomas Berger',       nr: 'VB-40210',         bank: 'Volksbank Mittelhessen eG', region: 'Beratungscenter Giessen-Sued', avatarBg: '#003399' },
        firmenkunde:{ name: 'Carola Weiss',        nr: 'VB-40210-FK',      bank: 'Volksbank Mittelhessen eG', region: 'Firmenkundencenter Mittelhessen', avatarBg: '#16a34a' },
        vermoegen:  { name: 'Dr. Julia Rademacher', nr: 'PB-Center Giessen', bank: 'Volksbank Mittelhessen eG', region: 'Ganzheitliche Vermoegensbetreuung', avatarBg: '#b45309' }
    };

    // ── Monatsdaten fuer Trend-Charts ─────
    var monthlyErtrag = {
        retail:     { labels: ['Sep','Okt','Nov','Dez','Jan','Feb'], values: [38200,42100,35800,48500,45200,41800] },
        firmenkunde:{ labels: ['Sep','Okt','Nov','Dez','Jan','Feb'], values: [52000,58000,49000,62000,55000,61000] },
        vermoegen:  { labels: ['Sep','Okt','Nov','Dez','Jan','Feb'], values: [95000,102000,88000,115000,108000,112000] }
    };

    // ── Neugeschaeft-Daten ────────────────
    var neugeschaeftData = {
        retail: [
            { datum: -2,  kunde: 'Stefan Richter',    produkt: 'Baufinanzierung',    volumen: 320000, provision: 3200 },
            { datum: -5,  kunde: 'Sabine Kramer',     produkt: 'Riester-Rente R+V',  volumen: 48000,  provision: 960 },
            { datum: -8,  kunde: 'Markus Hoffmann',   produkt: 'VR-ETF-Sparplan',    volumen: 25000,  provision: 250 },
            { datum: -12, kunde: 'Andrea Fischer',    produkt: 'Tagesgeld Plus',     volumen: 50000,  provision: 50 },
            { datum: -15, kunde: 'Christina Vogel',   produkt: 'R+V Haftpflicht',    volumen: 12000,  provision: 180 },
            { datum: -18, kunde: 'Monika Baumann',    produkt: 'VR-Depot',           volumen: 35000,  provision: 350 },
            { datum: -25, kunde: 'Klaus Weber',       produkt: 'Konsumentenkredit',  volumen: 15000,  provision: 225 },
            { datum: -30, kunde: 'Petra Lang',         produkt: 'SparBrief 3J',      volumen: 20000,  provision: 40 }
        ],
        firmenkunde: [
            { datum: -3,  kunde: 'Metallbau Schaefer',   produkt: 'Investitionskredit', volumen: 1200000, provision: 6000 },
            { datum: -7,  kunde: 'TechSolutions AG',     produkt: 'Betriebsmittelkredit', volumen: 500000, provision: 2500 },
            { datum: -14, kunde: 'Wetzlarer Maschinenbau', produkt: 'KfW-Foerderkredit', volumen: 2000000, provision: 4000 },
            { datum: -20, kunde: 'Hessen Logistik',       produkt: 'Leasing Fuhrpark',  volumen: 350000, provision: 3500 },
            { datum: -28, kunde: 'Agrar Becker OHG',      produkt: 'Aval',              volumen: 800000, provision: 1600 },
            { datum: -35, kunde: 'Dr. med. Engel',        produkt: 'Praxisfinanzierung', volumen: 450000, provision: 2250 }
        ],
        vermoegen: [
            { datum: -2,  kunde: 'Dr. Felix Hartmann',    produkt: 'Vermoegensverwaltung', volumen: 2500000, provision: 12500 },
            { datum: -6,  kunde: 'Elisabeth Koenig-H.',   produkt: 'Stiftungs-Mandat',   volumen: 1800000, provision: 9000 },
            { datum: -10, kunde: 'Dr. von Stein',         produkt: 'VR-Depot Rebalancing', volumen: 800000, provision: 4000 },
            { datum: -18, kunde: 'Familie Riedel',         produkt: 'Vorsorge-Paket',     volumen: 600000, provision: 3000 },
            { datum: -25, kunde: 'Prof. Baumann',          produkt: 'Nachfolge-Beratung', volumen: 0,      provision: 2500 }
        ]
    };

    // ── Termine-Daten ─────────────────────
    var termineData = [
        { tag: 0, zeit: '14:30', kunde: 'Markus Hoffmann', typ: 'VR-FinanzPlan', modus: 'retail' },
        { tag: 0, zeit: '16:00', kunde: 'Andrea Fischer', typ: 'Baufi-Beratung', modus: 'retail' },
        { tag: 1, zeit: '09:00', kunde: 'Metallbau Schaefer', typ: 'Jahresgespraech', modus: 'firmenkunde' },
        { tag: 1, zeit: '11:00', kunde: 'Stefan Richter', typ: 'Baufi-Auszahlung', modus: 'retail' },
        { tag: 1, zeit: '14:00', kunde: 'Dr. von Stein', typ: 'Portfolio-Review', modus: 'vermoegen' },
        { tag: 2, zeit: '10:00', kunde: 'TechSolutions AG', typ: 'Kreditprolongation', modus: 'firmenkunde' },
        { tag: 2, zeit: '15:00', kunde: 'Elisabeth Koenig-H.', typ: 'Nachfolge-Planung', modus: 'vermoegen' },
        { tag: 3, zeit: '09:30', kunde: 'Christina Vogel', typ: 'Cross-Selling', modus: 'retail' }
    ];

    // ── KI-Potentiale (Open Finance) ──────
    var potentialeData = {
        retail: [
            { prio: 'hoch', kunde: 'Markus Hoffmann', kundeId: 'PK-10021', titel: 'Wertpapierdepot-Erweiterung', beschreibung: 'Open Finance zeigt: 850 EUR/Monat Sparrate bei ING in ETF-Sparplaene. Umschichtung in VR-Depot mit ganzheitlicher Beratung empfohlen.', quelle: 'FIDA', potential: 1200 },
            { prio: 'hoch', kunde: 'Thomas Mueller', kundeId: 'PK-10056', titel: 'Baufinanzierung', beschreibung: 'Verhaltensmuster: Immobilienportale besucht, Gehalt +25% in 12 Mon. Baufi-Beratung initiieren.', quelle: 'Verhaltensmuster', potential: 2400 },
            { prio: 'mittel', kunde: 'Andrea Fischer', kundeId: 'PK-10078', titel: 'Altersvorsorge-Luecke', beschreibung: 'VR-FinanzPlan zeigt Vorsorgeluecke von 420 EUR/Mon. R+V Riester oder bAV empfehlen.', quelle: 'FinanzPlan', potential: 960 },
            { prio: 'mittel', kunde: 'Christina Vogel', kundeId: 'PK-10180', titel: 'Depot bei Trade Republic', beschreibung: 'FIDA: 35.000 EUR in Einzel-Aktien bei Trade Republic ohne Beratung. VR-Fonds mit ganzheitlichem Ansatz vorschlagen.', quelle: 'FIDA', potential: 680 },
            { prio: 'mittel', kunde: 'Monika Baumann', kundeId: 'PK-10154', titel: 'Kreditkartenupgrade', beschreibung: 'Reiseausgaben 4.800 EUR/Jahr. goldcard mit Reiseversicherung + Cashback empfehlen.', quelle: 'Kontodaten', potential: 240 },
            { prio: 'niedrig', kunde: 'Michael Schneider', kundeId: 'PK-10115', titel: 'Abwanderungsrisiko', beschreibung: 'Seit 90 Tagen kein Kontakt, Kontostand auf 450 EUR gesunken. Sofort-Kontakt empfohlen, Retention-Angebot vorbereiten.', quelle: 'KI-Analyse', potential: 180 }
        ],
        firmenkunde: [
            { prio: 'hoch', kunde: 'TechSolutions AG', kundeId: 'FK-20023', titel: 'Zahlungsverkehr-Konsolidierung', beschreibung: 'FIDA: ZV-Volumen 2,4 Mio. EUR bei Commerzbank. Umstellung auf VR-Business-Konto mit attraktiven Konditionen.', quelle: 'FIDA', potential: 8500 },
            { prio: 'hoch', kunde: 'Wetzlarer Maschinenbau', kundeId: 'FK-20074', titel: 'Exportfinanzierung', beschreibung: 'Umsatzanalyse zeigt 40% Exportanteil. Akkreditiv + Auslandsgarantien anbieten.', quelle: 'Kontodaten', potential: 12000 },
            { prio: 'mittel', kunde: 'Metallbau Schaefer', kundeId: 'FK-20010', titel: 'Leasing statt Kauf', beschreibung: 'Investitionsplan 2026: neue CNC-Maschine 380 Tsd. EUR. VR-Leasing mit Steuervorteilen vorschlagen.', quelle: 'Jahresgespraech', potential: 5200 },
            { prio: 'mittel', kunde: 'Hessen Logistik', kundeId: 'FK-20087', titel: 'KfW-Foerderkredit', beschreibung: 'Fuhrpark-Umstellung auf E-LKW geplant. KfW-Foerderkredit 295 mit Tilgungszuschuss empfehlen.', quelle: 'KI-Analyse', potential: 4800 },
            { prio: 'niedrig', kunde: 'Gasthaus zur Linde', kundeId: 'FK-20035', titel: 'Liquiditaetsengpass', beschreibung: 'Saisonale Umsatzrueckgaenge erkannt. Kontokorrent-Erhoehung oder Betriebsmittelkredit empfehlen.', quelle: 'Kontodaten', potential: 1200 }
        ],
        vermoegen: [
            { prio: 'hoch', kunde: 'Dr. Heinrich von Stein', kundeId: 'VK-30010', titel: 'Portfolio-Rebalancing', beschreibung: 'Aktienquote bei 78% (Ziel: 60%). Rebalancing mit Umschichtung in Renten und Alternative empfohlen.', quelle: 'Portfolio-Analyse', potential: 8500 },
            { prio: 'hoch', kunde: 'Elisabeth Koenig-H.', kundeId: 'VK-30023', titel: 'Stiftungsmandat erweitern', beschreibung: 'Stiftungsvermoegen wachst. Zweite Tranche fuer Familienstiftung vorbereiten. Steueroptimierung moeglich.', quelle: 'Stiftungs-Review', potential: 15000 },
            { prio: 'mittel', kunde: 'Familie Riedel', kundeId: 'VK-30035', titel: 'Nachfolgeplanung starten', beschreibung: 'Keine Nachfolgeregelung. Familienvermoegen 4,8 Mio. EUR. Generationenberatung + Testament initiieren.', quelle: 'KI-Analyse', potential: 6000 },
            { prio: 'mittel', kunde: 'Dr. Felix Hartmann', kundeId: 'VK-30074', titel: 'ESG-Umstellung', beschreibung: 'Hohe Affinitaet zu Nachhaltigkeit erkannt. ESG-konforme Vermoegensverwaltung anbieten.', quelle: 'Verhaltensmuster', potential: 4200 },
            { prio: 'niedrig', kunde: 'Ingrid Schaefer-Wolf', kundeId: 'VK-30061', titel: 'Review ueberfaellig', beschreibung: 'Letztes Portfolio-Review vor 30 Tagen. Risikoklasse Konservativ, Performance unterdurchschnittlich. Rebalancing empfohlen.', quelle: 'Portfolio-Analyse', potential: 2800 }
        ]
    };

    // ── Formatierung ──────────────────────
    function fmtEuro(val) {
        if (val >= 1000000) return (val / 1000000).toFixed(1).replace('.', ',') + ' Mio. EUR';
        if (val >= 1000) return (val / 1000).toFixed(0) + ' Tsd. EUR';
        return val.toLocaleString('de-DE') + ' EUR';
    }

    function fmtNum(val) {
        return val.toLocaleString('de-DE');
    }

    function fmtDatum(daysOffset) {
        var d = new Date();
        d.setDate(d.getDate() + daysOffset);
        var tage = ['So','Mo','Di','Mi','Do','Fr','Sa'];
        if (daysOffset === 0) return 'Heute';
        if (daysOffset === 1) return 'Morgen';
        if (daysOffset === -1) return 'Gestern';
        return tage[d.getDay()] + ', ' + String(d.getDate()).padStart(2,'0') + '.' + String(d.getMonth()+1).padStart(2,'0') + '.';
    }

    function getInitials(name) {
        var parts = name.replace(/Dr\.\s*/g, '').replace(/Prof\.\s*/g, '').replace(/med\.\s*/g, '').split(/[\s\-]+/);
        if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        return name.substring(0, 2).toUpperCase();
    }

    function avatarHTML(name, bg, size) {
        size = size || 36;
        var fs = Math.round(size * 0.38);
        return '<div style="width:' + size + 'px;height:' + size + 'px;border-radius:50%;background:' + bg + ';display:flex;align-items:center;justify-content:center;color:white;font-size:' + fs + 'px;font-weight:700;flex-shrink:0;">' + getInitials(name) + '</div>';
    }

    // ── SVG-Donut-Chart ───────────────────
    function renderDonut(segments, size, centerText, centerSub) {
        var sw = Math.round(size * 0.16);
        var cx = size / 2, cy = size / 2;
        var r = size / 2 - sw / 2 - 4;
        var circ = 2 * Math.PI * r;
        var total = 0;
        segments.forEach(function(s) { total += s.value; });
        var offset = 0;
        var paths = '';
        segments.forEach(function(s) {
            var pct = s.value / total;
            var dash = pct * circ;
            paths += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + s.color + '" stroke-width="' + sw + '" stroke-dasharray="' + dash.toFixed(1) + ' ' + (circ - dash).toFixed(1) + '" stroke-dashoffset="' + (-offset).toFixed(1) + '" transform="rotate(-90 ' + cx + ' ' + cy + ')" stroke-linecap="round"/>';
            offset += dash;
        });
        var svg = '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '">' + paths;
        if (centerText) svg += '<text x="' + cx + '" y="' + (cy + 4) + '" text-anchor="middle" font-size="' + Math.round(size * 0.12) + '" font-weight="700" fill="#1e293b">' + centerText + '</text>';
        if (centerSub) svg += '<text x="' + cx + '" y="' + (cy + 18) + '" text-anchor="middle" font-size="' + Math.round(size * 0.07) + '" fill="#94a3b8">' + centerSub + '</text>';
        svg += '</svg>';
        var legend = '';
        segments.forEach(function(s) {
            var pctVal = total > 0 ? (s.value / total * 100).toFixed(0) : '0';
            legend += '<div style="display:flex;align-items:center;gap:8px;font-size:12px;"><span style="width:10px;height:10px;border-radius:50%;background:' + s.color + ';flex-shrink:0;"></span><span style="color:#475569;flex:1;">' + s.name + '</span><span style="font-weight:600;color:#1e293b;">' + pctVal + '%</span></div>';
        });
        return '<div style="display:flex;align-items:center;gap:24px;flex-wrap:wrap;"><div>' + svg + '</div><div style="display:flex;flex-direction:column;gap:6px;min-width:140px;">' + legend + '</div></div>';
    }

    // ── SVG-Sparkline ─────────────────────
    function sparklineSVG(data, w, h, color) {
        if (!data || data.length < 2) return '';
        var max = Math.max.apply(null, data);
        var min = Math.min.apply(null, data);
        var range = max - min || 1;
        var step = w / (data.length - 1);
        var points = data.map(function(v, i) {
            return (i * step).toFixed(1) + ',' + (h - ((v - min) / range) * (h - 6) - 3).toFixed(1);
        }).join(' ');
        return '<svg width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '"><polyline points="' + points + '" fill="none" stroke="' + color + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    }

    // ── Bar-Chart HTML ────────────────────
    function renderBarChart(labels, values, color) {
        var max = Math.max.apply(null, values);
        var html = '<div style="display:flex;align-items:flex-end;gap:8px;height:120px;padding-top:8px;">';
        for (var i = 0; i < labels.length; i++) {
            var pct = max > 0 ? (values[i] / max * 100) : 0;
            var val = values[i] >= 1000 ? (values[i] / 1000).toFixed(0) + 'T' : values[i];
            html += '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;">' +
                '<span style="font-size:10px;font-weight:600;color:#475569;">' + val + '</span>' +
                '<div style="width:100%;background:' + color + ';border-radius:4px 4px 0 0;height:' + pct + '%;min-height:4px;transition:height 0.4s ease;opacity:0.85;"></div>' +
                '<span style="font-size:10px;color:#94a3b8;">' + labels[i] + '</span>' +
                '</div>';
        }
        html += '</div>';
        return html;
    }

    // ── Progress-Bar HTML ─────────────────
    function renderProgress(pct, color, label) {
        return '<div style="display:flex;align-items:center;gap:12px;">' +
            '<div style="flex:1;height:8px;background:#e2e8f0;border-radius:4px;overflow:hidden;">' +
            '<div style="height:100%;width:' + Math.min(pct, 100) + '%;background:' + color + ';border-radius:4px;transition:width 0.5s;"></div></div>' +
            '<span style="font-size:12px;font-weight:600;color:#475569;min-width:40px;">' + (label || pct + '%') + '</span></div>';
    }


    // ═══════════════════════════════════════
    // MODE SWITCHING
    // ═══════════════════════════════════════

    function setBankViewMode(mode) {
        bankViewMode = mode;
        localStorage.setItem('bankViewMode', mode);
        document.querySelectorAll('.bank-mode-btn').forEach(function(btn) {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });
        applyBankViewMode();
        var viewMap = { retail: 'berater-retail', firmenkunde: 'berater-firmenkunde', vermoegen: 'berater-vermoegen' };
        document.dispatchEvent(new CustomEvent('viewChanged', { detail: { module: 'bankenBerater', view: viewMap[mode] || 'berater-retail' } }));
        var routeMap = { retail: '/berater', firmenkunde: '/berater-firmenkunde', vermoegen: '/berater-vermoegen' };
        if (window.AppRouter) AppRouter.navigate(routeMap[mode] || '/berater');
    }

    function applyBankViewMode() {
        var mode = bankViewMode;
        var profile = beraterProfile[mode];

        // Header aktualisieren
        var headerName = document.getElementById('beraterHeaderName');
        var headerMeta = document.getElementById('beraterHeaderMeta');
        if (headerName) headerName.textContent = profile.name;
        if (headerMeta) headerMeta.innerHTML = '<span>Berater-Nr. ' + profile.nr + '</span><span style="margin-left:16px;">' + profile.bank + '</span><span style="margin-left:16px;">' + profile.region + '</span>';

        // Berater-Foto aktualisieren (Initialen-Avatar)
        var photoImg = document.getElementById('beraterPhotoImg');
        var photoContainer = document.getElementById('beraterPhotoSmall');
        if (photoImg) photoImg.style.display = 'none';
        if (photoContainer) {
            photoContainer.innerHTML = '<div style="width:100%;height:100%;border-radius:50%;background:' + profile.avatarBg + ';display:flex;align-items:center;justify-content:center;color:white;font-size:18px;font-weight:700;">' + getInitials(profile.name) + '</div>';
        }

        // Tab-Sets umschalten
        document.querySelectorAll('[data-bank-tab-set]').forEach(function(el) {
            el.style.display = el.dataset.bankTabSet === mode ? 'flex' : 'none';
        });

        // Reset Tab-Buttons: alle deaktivieren, Uebersicht aktivieren
        document.querySelectorAll('.berater-tab-btn').forEach(function(btn) {
            btn.classList.remove('active');
        });
        var activeTabSet = document.querySelector('[data-bank-tab-set="' + mode + '"]');
        if (activeTabSet) {
            var firstTab = activeTabSet.querySelector('.berater-tab-btn[data-tab="uebersicht"]');
            if (firstTab) firstTab.classList.add('active');
        }

        // Uebersicht-Tab laden
        currentBeraterTab = 'uebersicht';
        showTabElements('uebersicht', mode);
        fillUebersichtTab(mode);
    }

    // ═══════════════════════════════════════
    // TAB SWITCHING (Enhanced)
    // ═══════════════════════════════════════

    function switchBeraterTab(tabId, mode) {
        if (!mode) mode = bankViewMode;
        currentBeraterTab = tabId;

        // Tab-Buttons aktualisieren
        var tabSet = document.querySelector('[data-bank-tab-set="' + mode + '"]');
        if (tabSet) {
            tabSet.querySelectorAll('.berater-tab-btn').forEach(function(btn) {
                btn.classList.remove('active');
            });
            var clickedBtn = tabSet.querySelector('[data-tab="' + tabId + '"]');
            if (clickedBtn) clickedBtn.classList.add('active');
        }

        // UI-Elemente ein-/ausblenden
        showTabElements(tabId, mode);

        // Charts aufraeumen
        destroyBeraterCharts();

        // Tab-spezifischen Content generieren
        var tabFunctions = {
            'uebersicht':         function() { fillUebersichtTab(mode); },
            'kundenportfolio':    function() { fillKundenportfolioTab(); },
            'kreditportfolio':    function() { fillKreditportfolioTab(); },
            'portfolioallokation':function() { fillPortfolioAllokationTab(); },
            'neugeschaeft':       function() { fillNeugeschaeftTab(mode); },
            'ertraege':           function() { fillErtraegeTab(); },
            'branchenmix':        function() { fillBranchenmixTab(); },
            'performance':        function() { fillPerformanceTab(); },
            'nachfolge':          function() { fillNachfolgeTab(); },
            'qualitaet':          function() { fillQualitaetTab(mode); },
            'kunden':             function() { fillKundenTab(mode); },
            'potentiale':         function() { fillPotentialeTab(mode); }
        };

        if (tabFunctions[tabId]) {
            tabFunctions[tabId]();
        }
    }

    // Zeigt/versteckt KPIs, Saeulen, Kundenlisten je nach Tab
    function showTabElements(tabId, mode) {
        var contentArea = document.getElementById('beraterTabContent');

        // KPIs: nur auf Uebersicht-Tab
        document.querySelectorAll('[data-bank-kpi-set]').forEach(function(el) {
            if (tabId === 'uebersicht') {
                el.style.display = el.dataset.bankKpiSet === mode ? 'grid' : 'none';
            } else {
                el.style.display = 'none';
            }
        });

        // Saeulen-Karten: nur auf Uebersicht + Vermoegen
        var saeulenGrid = document.getElementById('beraterSaeulenGrid');
        if (saeulenGrid) {
            saeulenGrid.style.display = (tabId === 'uebersicht' && mode === 'vermoegen') ? 'grid' : 'none';
        }

        // Kundenlisten: nur auf Kunden-Tab
        document.querySelectorAll('[data-bank-kunden-set]').forEach(function(el) {
            if (tabId === 'kunden') {
                el.style.display = el.dataset.bankKundenSet === mode ? 'block' : 'none';
            } else {
                el.style.display = 'none';
            }
        });

        // Tab-Content-Area: auf Kunden-Tab verstecken
        if (contentArea) {
            contentArea.style.display = tabId === 'kunden' ? 'none' : 'block';
        }
    }

    // Charts aufraeumen
    function destroyBeraterCharts() {
        beraterChartInstances.forEach(function(c) {
            if (c && typeof c.destroy === 'function') c.destroy();
        });
        beraterChartInstances = [];
    }


    // ═══════════════════════════════════════
    // TAB: UEBERSICHT (Dashboard)
    // ═══════════════════════════════════════

    function fillUebersichtTab(mode) {
        var contentArea = document.getElementById('beraterTabContent');
        if (!contentArea) return;

        var modeLabel = { retail: 'Privatkundenberatung', firmenkunde: 'Firmenkundenbetreuung', vermoegen: 'Private Banking' };
        var now = new Date();
        var modeTermine = termineData.filter(function(t) { return t.modus === mode; });
        var modeNG = neugeschaeftData[mode] || [];
        var modePot = potentialeData[mode] || [];
        var mData = monthlyErtrag[mode] || { labels: [], values: [] };

        // ── Quick-Stats Zeile ──
        var kundenCount = mode === 'retail' ? retailKunden.length : (mode === 'firmenkunde' ? firmenKunden.length : vermoegenKunden.length);
        var totalErtrag = 0;
        var kundenList = mode === 'retail' ? retailKunden : (mode === 'firmenkunde' ? firmenKunden : vermoegenKunden);
        kundenList.forEach(function(k) { totalErtrag += (k.ertrag || 0); });

        var html = '<div class="berater-dashboard">';

        // Quick-Stats Cards
        html += '<div class="berater-quick-stats">';
        html += '<div class="berater-qs-card">' +
            '<div class="berater-qs-icon" style="background:#dbeafe;color:#2563eb;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>' +
            '<div class="berater-qs-data"><span class="berater-qs-value">' + modeTermine.length + '</span><span class="berater-qs-label">Termine diese Woche</span></div></div>';
        html += '<div class="berater-qs-card">' +
            '<div class="berater-qs-icon" style="background:#dcfce7;color:#16a34a;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>' +
            '<div class="berater-qs-data"><span class="berater-qs-value">' + modeNG.length + '</span><span class="berater-qs-label">Neuabschluesse YTD</span></div></div>';
        html += '<div class="berater-qs-card">' +
            '<div class="berater-qs-icon" style="background:#fef3c7;color:#d97706;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></div>' +
            '<div class="berater-qs-data"><span class="berater-qs-value">' + modePot.length + '</span><span class="berater-qs-label">KI-Empfehlungen</span></div></div>';
        html += '<div class="berater-qs-card">' +
            '<div class="berater-qs-icon" style="background:#ede9fe;color:#7c3aed;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg></div>' +
            '<div class="berater-qs-data"><span class="berater-qs-value">' + kundenCount + '</span><span class="berater-qs-label">Kunden im Portfolio</span></div></div>';
        html += '</div>';

        // ── Zwei-Spalten Dashboard ──
        html += '<div class="berater-dashboard-grid">';

        // LINKE SPALTE
        html += '<div class="berater-dashboard-col">';

        // Ertragstrend
        html += '<div class="berater-card">';
        html += '<div class="berater-card-header"><h4>Ertragsentwicklung (6 Monate)</h4><span class="berater-card-badge positive">+8,2%</span></div>';
        html += renderBarChart(mData.labels, mData.values, mode === 'retail' ? '#2563eb' : (mode === 'firmenkunde' ? '#16a34a' : '#d97706'));
        html += '</div>';

        // Letzte Abschluesse
        html += '<div class="berater-card">';
        html += '<div class="berater-card-header"><h4>Letzte Abschluesse</h4></div>';
        html += '<div class="berater-activity-feed">';
        var recentNG = modeNG.slice(0, 5);
        recentNG.forEach(function(ng) {
            var statusColor = ng.datum >= -7 ? '#16a34a' : '#d97706';
            html += '<div class="berater-activity-item">' +
                '<div class="berater-activity-dot" style="background:' + statusColor + ';"></div>' +
                '<div class="berater-activity-content">' +
                '<div class="berater-activity-title">' + ng.produkt + '</div>' +
                '<div class="berater-activity-meta">' + ng.kunde + ' &middot; ' + fmtEuro(ng.volumen) + '</div>' +
                '</div>' +
                '<div class="berater-activity-date">' + fmtDatum(ng.datum) + '</div>' +
                '</div>';
        });
        html += '</div></div>';

        html += '</div>'; // Ende linke Spalte

        // RECHTE SPALTE
        html += '<div class="berater-dashboard-col">';

        // Naechste Termine
        html += '<div class="berater-card">';
        html += '<div class="berater-card-header"><h4>Naechste Termine</h4></div>';
        html += '<div class="berater-termine-list">';
        modeTermine.forEach(function(t) {
            var tagLabel = t.tag === 0 ? 'Heute' : (t.tag === 1 ? 'Morgen' : fmtDatum(t.tag));
            html += '<div class="berater-termin-item">' +
                '<div class="berater-termin-zeit"><span class="berater-termin-tag">' + tagLabel + '</span><span class="berater-termin-uhr">' + t.zeit + '</span></div>' +
                '<div class="berater-termin-info"><span class="berater-termin-kunde">' + t.kunde + '</span><span class="berater-termin-typ">' + t.typ + '</span></div>' +
                '</div>';
        });
        if (modeTermine.length === 0) {
            html += '<div style="padding:16px;text-align:center;color:#94a3b8;font-size:13px;">Keine Termine fuer diesen Modus diese Woche</div>';
        }
        html += '</div></div>';

        // Top KI-Empfehlungen (Preview)
        html += '<div class="berater-card berater-card-ki">';
        html += '<div class="berater-card-header"><h4>Top KI-Empfehlungen</h4><span class="berater-card-badge ki">Open Finance</span></div>';
        var topPot = modePot.slice(0, 3);
        topPot.forEach(function(p) {
            var prioColor = p.prio === 'hoch' ? '#dc2626' : (p.prio === 'mittel' ? '#d97706' : '#16a34a');
            var prioBg = p.prio === 'hoch' ? '#fee2e2' : (p.prio === 'mittel' ? '#fef3c7' : '#dcfce7');
            html += '<div class="berater-ki-preview-item">' +
                '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">' +
                '<span style="font-size:13px;font-weight:600;color:#1e293b;">' + p.kunde + '</span>' +
                '<span style="font-size:10px;font-weight:700;text-transform:uppercase;padding:2px 8px;border-radius:4px;background:' + prioBg + ';color:' + prioColor + ';">' + p.prio + '</span>' +
                '</div>' +
                '<div style="font-size:12px;color:#64748b;">' + p.titel + '</div>' +
                '<div style="font-size:11px;color:#FF6600;font-weight:600;margin-top:4px;">+' + fmtNum(p.potential) + ' EUR/Jahr</div>' +
                '</div>';
        });
        html += '</div>';

        html += '</div>'; // Ende rechte Spalte
        html += '</div>'; // Ende Dashboard-Grid

        // ── Produkt-Verteilung (Donut) ──
        html += '<div class="berater-card" style="margin-top:16px;">';
        html += '<div class="berater-card-header"><h4>Produktverteilung im Kundenportfolio</h4></div>';

        var donutData;
        if (mode === 'retail') {
            donutData = [
                { name: 'Girokonto', value: 95, color: '#2563eb' },
                { name: 'Sparprodukte', value: 68, color: '#16a34a' },
                { name: 'Kredit/Baufi', value: 42, color: '#d97706' },
                { name: 'Wertpapiere', value: 35, color: '#7c3aed' },
                { name: 'Versicherung', value: 28, color: '#dc2626' }
            ];
        } else if (mode === 'firmenkunde') {
            donutData = [
                { name: 'Investitionskredit', value: 45, color: '#2563eb' },
                { name: 'Betriebsmittel', value: 25, color: '#16a34a' },
                { name: 'Aval/Buergschaft', value: 15, color: '#d97706' },
                { name: 'Leasing', value: 10, color: '#7c3aed' },
                { name: 'Auslandsgeschaeft', value: 5, color: '#0891b2' }
            ];
        } else {
            donutData = [
                { name: 'Wertpapierdepot', value: 55, color: '#2563eb' },
                { name: 'Vermoegensverwaltung', value: 25, color: '#7c3aed' },
                { name: 'Vorsorge', value: 12, color: '#16a34a' },
                { name: 'Immobilien', value: 5, color: '#d97706' },
                { name: 'Alternative Anlagen', value: 3, color: '#0891b2' }
            ];
        }
        html += renderDonut(donutData, 150, kundenCount + '', 'Kunden');
        html += '</div>';

        html += '</div>'; // Ende berater-dashboard
        contentArea.innerHTML = html;
    }


    // ═══════════════════════════════════════
    // TAB: KUNDENPORTFOLIO (Retail)
    // ═══════════════════════════════════════

    function fillKundenportfolioTab() {
        var contentArea = document.getElementById('beraterTabContent');
        if (!contentArea) return;

        // Segmentierung zaehlen
        var segments = { 'A-Top': 0, 'B-Wachstum': 0, 'C-Basis': 0, 'Abwanderung': 0 };
        var segColors = { 'A-Top': '#7c3aed', 'B-Wachstum': '#2563eb', 'C-Basis': '#94a3b8', 'Abwanderung': '#dc2626' };
        var avgErtrag = { 'A-Top': 0, 'B-Wachstum': 0, 'C-Basis': 0, 'Abwanderung': 0 };
        retailKunden.forEach(function(k) {
            if (segments[k.segment] !== undefined) {
                segments[k.segment]++;
                avgErtrag[k.segment] += k.ertrag;
            }
        });

        var html = '<div style="padding:24px 32px;">';

        // KPI-Leiste
        html += '<div class="berater-kpi-row">';
        Object.keys(segments).forEach(function(seg) {
            var avg = segments[seg] > 0 ? Math.round(avgErtrag[seg] / segments[seg]) : 0;
            html += '<div class="berater-kpi-box"><div class="berater-kpi-label">' + seg + '</div>' +
                '<div class="berater-kpi-value" style="color:' + segColors[seg] + ';">' + segments[seg] + '</div>' +
                '<div style="font-size:11px;color:#94a3b8;">&#216; Ertrag: ' + fmtNum(avg) + ' EUR</div></div>';
        });
        html += '</div>';

        // Donut + Cross-Selling Matrix
        html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:20px;">';

        // Segment-Donut
        html += '<div class="berater-card"><div class="berater-card-header"><h4>Segment-Verteilung</h4></div>';
        var segDonut = [];
        Object.keys(segments).forEach(function(seg) {
            segDonut.push({ name: seg, value: segments[seg], color: segColors[seg] });
        });
        html += renderDonut(segDonut, 140, retailKunden.length + '', 'Kunden');
        html += '</div>';

        // Cross-Selling Matrix
        html += '<div class="berater-card"><div class="berater-card-header"><h4>Cross-Selling-Matrix</h4></div>';
        html += '<table class="banking-detail-table"><thead><tr><th>Segment</th><th class="text-center">Giro</th><th class="text-center">Spar</th><th class="text-center">Kredit</th><th class="text-center">WP</th><th class="text-center">Versich.</th></tr></thead><tbody>';
        var crossData = {
            'A-Top':       [100, 85, 70, 65, 50],
            'B-Wachstum':  [100, 60, 35, 20, 15],
            'C-Basis':     [100, 40, 10, 5, 5],
            'Abwanderung': [80, 15, 5, 0, 0]
        };
        Object.keys(crossData).forEach(function(seg) {
            html += '<tr><td><span class="kundensegment-badge ' + (seg === 'A-Top' ? 'segment-exklusiv' : seg === 'B-Wachstum' ? 'segment-komfort' : 'segment-basis') + '">' + seg + '</span></td>';
            crossData[seg].forEach(function(pct) {
                var col = pct >= 60 ? '#16a34a' : (pct >= 30 ? '#d97706' : '#dc2626');
                html += '<td class="text-center"><span style="color:' + col + ';font-weight:600;">' + pct + '%</span></td>';
            });
            html += '</tr>';
        });
        html += '</tbody></table></div>';

        html += '</div>';

        // FinanzPlan-Deckung
        var fpCount = retailKunden.filter(function(k) { return k.finanzplan; }).length;
        var fpPct = Math.round(fpCount / retailKunden.length * 100);
        html += '<div class="berater-card" style="margin-top:20px;"><div class="berater-card-header"><h4>VR-FinanzPlan-Durchdringung</h4><span class="berater-card-badge ' + (fpPct >= 50 ? 'positive' : 'warning') + '">' + fpPct + '%</span></div>';
        html += renderProgress(fpPct, fpPct >= 50 ? '#16a34a' : '#d97706', fpCount + '/' + retailKunden.length);
        html += '<div style="margin-top:12px;font-size:12px;color:#64748b;">Kunden ohne FinanzPlan:</div>';
        html += '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;">';
        retailKunden.filter(function(k) { return !k.finanzplan; }).forEach(function(k) {
            html += '<span class="berater-chip">' + k.name + '</span>';
        });
        html += '</div></div>';

        html += '</div>';
        contentArea.innerHTML = html;
    }

    // ═══════════════════════════════════════
    // TAB: KREDITPORTFOLIO (Firmenkunde)
    // ═══════════════════════════════════════

    function fillKreditportfolioTab() {
        var contentArea = document.getElementById('beraterTabContent');
        if (!contentArea) return;

        var totalKredit = 0;
        var totalLinie = 0;
        firmenKunden.forEach(function(k) {
            totalKredit += k.kreditvol;
            totalLinie += (k.kreditlinie || k.kreditvol);
        });
        var avgAuslastung = Math.round(totalKredit / totalLinie * 100);

        var html = '<div style="padding:24px 32px;">';

        // KPI-Leiste
        html += '<div class="berater-kpi-row">';
        html += '<div class="berater-kpi-box"><div class="berater-kpi-label">Gesamtvolumen</div><div class="berater-kpi-value">' + fmtEuro(totalKredit) + '</div></div>';
        html += '<div class="berater-kpi-box"><div class="berater-kpi-label">Kreditlinien</div><div class="berater-kpi-value">' + fmtEuro(totalLinie) + '</div></div>';
        html += '<div class="berater-kpi-box"><div class="berater-kpi-label">&#216; Auslastung</div><div class="berater-kpi-value">' + avgAuslastung + '%</div></div>';
        html += '<div class="berater-kpi-box"><div class="berater-kpi-label">Anzahl Kunden</div><div class="berater-kpi-value">' + firmenKunden.length + '</div></div>';
        html += '</div>';

        // Rating-Verteilung + Branchen-Mix
        html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:20px;">';

        // Rating-Donut
        html += '<div class="berater-card"><div class="berater-card-header"><h4>Rating-Verteilung</h4></div>';
        var ratingCount = {};
        firmenKunden.forEach(function(k) { ratingCount[k.rating] = (ratingCount[k.rating] || 0) + 1; });
        var ratingColors = { 'AAA': '#16a34a', 'AA': '#22c55e', 'A': '#d97706', 'BBB': '#f97316', 'BB': '#dc2626' };
        var ratingDonut = [];
        Object.keys(ratingCount).forEach(function(r) {
            ratingDonut.push({ name: r, value: ratingCount[r], color: ratingColors[r] || '#94a3b8' });
        });
        html += renderDonut(ratingDonut, 140, firmenKunden.length + '', 'Kunden');
        html += '</div>';

        // Branchen-Mix-Donut
        html += '<div class="berater-card"><div class="berater-card-header"><h4>Branchenverteilung nach Volumen</h4></div>';
        var branchenVol = {};
        var branchenColors = { 'handwerk': '#f97316', 'dienstleistung': '#64748b', 'handel': '#22c55e', 'landwirtschaft': '#84cc16', 'heilberufe': '#ec4899', 'produktion': '#2563eb', 'transport': '#06b6d4', 'immobilien': '#a855f7' };
        firmenKunden.forEach(function(k) {
            branchenVol[k.brancheLabel] = (branchenVol[k.brancheLabel] || 0) + k.kreditvol;
            if (!branchenVol['_color_' + k.brancheLabel]) branchenVol['_color_' + k.brancheLabel] = branchenColors[k.branche] || '#94a3b8';
        });
        var branchenDonut = [];
        Object.keys(branchenVol).forEach(function(b) {
            if (b.indexOf('_color_') === 0) return;
            branchenDonut.push({ name: b, value: branchenVol[b], color: branchenVol['_color_' + b] || '#94a3b8' });
        });
        html += renderDonut(branchenDonut, 140, fmtEuro(totalKredit).replace(' EUR',''), '');
        html += '</div>';

        html += '</div>';

        // Kreditlinie-Auslastung Tabelle
        html += '<div class="berater-card" style="margin-top:20px;"><div class="berater-card-header"><h4>Kreditlinien-Auslastung</h4></div>';
        html += '<table class="banking-detail-table"><thead><tr><th>Firma</th><th>Rating</th><th class="text-right">Volumen</th><th class="text-right">Linie</th><th>Auslastung</th></tr></thead><tbody>';
        firmenKunden.forEach(function(k) {
            var ausl = k.auslastung || Math.round(k.kreditvol / (k.kreditlinie || k.kreditvol) * 100);
            var barColor = ausl >= 85 ? '#dc2626' : (ausl >= 70 ? '#d97706' : '#16a34a');
            html += '<tr><td><strong>' + k.name + '</strong></td>' +
                '<td><span class="rating-badge rating-' + k.rating.toLowerCase() + '">' + k.rating + '</span></td>' +
                '<td class="text-right">' + fmtEuro(k.kreditvol) + '</td>' +
                '<td class="text-right">' + fmtEuro(k.kreditlinie || k.kreditvol) + '</td>' +
                '<td><div class="auslastung-bar"><div class="auslastung-bar-track"><div class="auslastung-bar-fill" style="width:' + ausl + '%;background:' + barColor + ';"></div></div><span class="auslastung-bar-text">' + ausl + '%</span></div></td></tr>';
        });
        html += '</tbody></table></div>';

        html += '</div>';
        contentArea.innerHTML = html;
    }

    // ═══════════════════════════════════════
    // TAB: PORTFOLIO-ALLOKATION (Vermoegen)
    // ═══════════════════════════════════════

    function fillPortfolioAllokationTab() {
        var contentArea = document.getElementById('beraterTabContent');
        if (!contentArea) return;

        var totalAum = 0;
        vermoegenKunden.forEach(function(k) { totalAum += k.aum; });

        var html = '<div style="padding:24px 32px;">';

        // KPI-Leiste
        html += '<div class="berater-kpi-row">';
        html += '<div class="berater-kpi-box"><div class="berater-kpi-label">AuM Gesamt</div><div class="berater-kpi-value">' + fmtEuro(totalAum) + '</div></div>';
        html += '<div class="berater-kpi-box"><div class="berater-kpi-label">&#216; AuM / Kunde</div><div class="berater-kpi-value">' + fmtEuro(Math.round(totalAum / vermoegenKunden.length)) + '</div></div>';
        html += '<div class="berater-kpi-box"><div class="berater-kpi-label">Depotvolumen</div><div class="berater-kpi-value">' + fmtEuro(vermoegenKunden.reduce(function(s,k){return s+k.depot;},0)) + '</div></div>';
        html += '<div class="berater-kpi-box"><div class="berater-kpi-label">Vorsorge</div><div class="berater-kpi-value">' + fmtEuro(vermoegenKunden.reduce(function(s,k){return s+k.vorsorge;},0)) + '</div></div>';
        html += '</div>';

        // Asset Allocation + Strategie-Verteilung
        html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:20px;">';

        // Asset Allocation Donut
        html += '<div class="berater-card"><div class="berater-card-header"><h4>Asset-Allokation (aggregiert)</h4></div>';
        var assetDonut = [
            { name: 'Aktien', value: 42, color: '#2563eb' },
            { name: 'Renten', value: 28, color: '#16a34a' },
            { name: 'Immobilien', value: 12, color: '#d97706' },
            { name: 'Alternative', value: 8, color: '#7c3aed' },
            { name: 'Liquiditaet', value: 10, color: '#94a3b8' }
        ];
        html += renderDonut(assetDonut, 140, fmtEuro(totalAum).replace(' EUR',''), 'AuM');
        html += '</div>';

        // Risikoklassen-Verteilung Donut
        html += '<div class="berater-card"><div class="berater-card-header"><h4>Risikoklassen-Verteilung</h4></div>';
        var risikoCount = {};
        var risikoColors = { 'Konservativ': '#16a34a', 'Ausgewogen': '#2563eb', 'Wachstum': '#d97706', 'Dynamisch': '#dc2626' };
        vermoegenKunden.forEach(function(k) { risikoCount[k.risikoklasse] = (risikoCount[k.risikoklasse] || 0) + 1; });
        var risikoDonut = [];
        Object.keys(risikoCount).forEach(function(r) {
            risikoDonut.push({ name: r, value: risikoCount[r], color: risikoColors[r] || '#94a3b8' });
        });
        html += renderDonut(risikoDonut, 140, vermoegenKunden.length + '', 'Kunden');
        html += '</div>';

        html += '</div>';

        // Kundenvermoegen Tabelle
        html += '<div class="berater-card" style="margin-top:20px;"><div class="berater-card-header"><h4>Kundenvermoegens-Uebersicht</h4></div>';
        html += '<table class="banking-detail-table"><thead><tr><th>Kunde</th><th>Risikoklasse</th><th class="text-right">AuM</th><th class="text-right">Depot</th><th class="text-right">Vorsorge</th><th class="text-center">Letztes Review</th></tr></thead><tbody>';
        vermoegenKunden.forEach(function(k) {
            var reviewColor = k.letztReview <= 7 ? '#16a34a' : (k.letztReview <= 21 ? '#d97706' : '#dc2626');
            html += '<tr><td>' + avatarHTML(k.name, k.avatarBg, 28) + ' <strong style="margin-left:8px;">' + k.name + '</strong></td>' +
                '<td><span style="font-size:11px;font-weight:600;padding:3px 8px;border-radius:4px;background:' + (risikoColors[k.risikoklasse] || '#94a3b8') + '22;color:' + (risikoColors[k.risikoklasse] || '#94a3b8') + ';">' + k.risikoklasse + '</span></td>' +
                '<td class="text-right">' + fmtEuro(k.aum) + '</td>' +
                '<td class="text-right">' + fmtEuro(k.depot) + '</td>' +
                '<td class="text-right">' + fmtEuro(k.vorsorge) + '</td>' +
                '<td class="text-center"><span style="color:' + reviewColor + ';font-weight:600;">vor ' + k.letztReview + ' Tagen</span></td></tr>';
        });
        html += '</tbody></table></div>';

        html += '</div>';
        contentArea.innerHTML = html;
    }


    // ═══════════════════════════════════════
    // TAB: NEUGESCHAEFT (alle Modi)
    // ═══════════════════════════════════════

    function fillNeugeschaeftTab(mode) {
        var contentArea = document.getElementById('beraterTabContent');
        if (!contentArea) return;
        var ngList = neugeschaeftData[mode] || [];
        var totalVol = 0, totalProv = 0;
        ngList.forEach(function(ng) { totalVol += ng.volumen; totalProv += ng.provision; });
        var avgDeal = ngList.length > 0 ? Math.round(totalVol / ngList.length) : 0;

        var html = '<div style="padding:24px 32px;">';
        // KPI-Leiste
        html += '<div class="berater-kpi-row">';
        html += '<div class="berater-kpi-box"><div class="berater-kpi-label">Abschluesse YTD</div><div class="berater-kpi-value">' + ngList.length + '</div></div>';
        html += '<div class="berater-kpi-box"><div class="berater-kpi-label">Volumen Gesamt</div><div class="berater-kpi-value">' + fmtEuro(totalVol) + '</div></div>';
        html += '<div class="berater-kpi-box"><div class="berater-kpi-label">Provision</div><div class="berater-kpi-value" style="color:#16a34a;">' + fmtEuro(totalProv) + '</div></div>';
        html += '<div class="berater-kpi-box"><div class="berater-kpi-label">&#216; Dealgroesse</div><div class="berater-kpi-value">' + fmtEuro(avgDeal) + '</div></div>';
        html += '</div>';

        // Trend + Produktmix
        html += '<div style="display:grid;grid-template-columns:1.5fr 1fr;gap:24px;margin-top:20px;">';

        // Monatstrend
        var mData = monthlyErtrag[mode] || { labels: [], values: [] };
        html += '<div class="berater-card"><div class="berater-card-header"><h4>Neugeschaeft-Trend (6 Monate)</h4></div>';
        html += renderBarChart(mData.labels, mData.values, mode === 'retail' ? '#2563eb' : (mode === 'firmenkunde' ? '#16a34a' : '#d97706'));
        html += '</div>';

        // Produktmix-Donut
        html += '<div class="berater-card"><div class="berater-card-header"><h4>Produktmix</h4></div>';
        var produktCount = {};
        var produktColors = ['#2563eb','#16a34a','#d97706','#7c3aed','#dc2626','#0891b2','#f59e0b','#64748b'];
        ngList.forEach(function(ng) { produktCount[ng.produkt] = (produktCount[ng.produkt] || 0) + 1; });
        var prodDonut = [];
        var ci = 0;
        Object.keys(produktCount).forEach(function(p) {
            prodDonut.push({ name: p, value: produktCount[p], color: produktColors[ci % produktColors.length] });
            ci++;
        });
        html += renderDonut(prodDonut, 120, ngList.length + '', 'Deals');
        html += '</div>';

        html += '</div>';

        // Vertragstabelle
        html += '<div class="berater-card" style="margin-top:20px;"><div class="berater-card-header"><h4>Neugeschaeft-Details</h4></div>';
        html += '<table class="banking-detail-table"><thead><tr><th>Datum</th><th>Kunde</th><th>Produkt</th><th class="text-right">Volumen</th><th class="text-right">Provision</th></tr></thead><tbody>';
        ngList.forEach(function(ng) {
            html += '<tr><td>' + fmtDatum(ng.datum) + '</td><td><strong>' + ng.kunde + '</strong></td><td>' + ng.produkt + '</td><td class="text-right">' + fmtEuro(ng.volumen) + '</td><td class="text-right" style="color:#16a34a;">' + fmtEuro(ng.provision) + '</td></tr>';
        });
        html += '</tbody></table></div>';

        html += '</div>';
        contentArea.innerHTML = html;
    }

    // ═══════════════════════════════════════
    // TAB: ERTRAEGE (Retail)
    // ═══════════════════════════════════════

    function fillErtraegeTab() {
        var contentArea = document.getElementById('beraterTabContent');
        if (!contentArea) return;
        var totalErtrag = 0;
        retailKunden.forEach(function(k) { totalErtrag += k.ertrag; });
        var zinsErtrag = Math.round(totalErtrag * 0.45);
        var provErtrag = Math.round(totalErtrag * 0.35);
        var sonstErtrag = totalErtrag - zinsErtrag - provErtrag;

        var html = '<div style="padding:24px 32px;">';
        // KPIs
        html += '<div class="berater-kpi-row">';
        html += '<div class="berater-kpi-box"><div class="berater-kpi-label">Gesamtertrag YTD</div><div class="berater-kpi-value">' + fmtEuro(totalErtrag) + '</div></div>';
        html += '<div class="berater-kpi-box"><div class="berater-kpi-label">Zinsertrag</div><div class="berater-kpi-value">' + fmtEuro(zinsErtrag) + '</div></div>';
        html += '<div class="berater-kpi-box"><div class="berater-kpi-label">Provisionsertrag</div><div class="berater-kpi-value">' + fmtEuro(provErtrag) + '</div></div>';
        html += '<div class="berater-kpi-box"><div class="berater-kpi-label">Sonstige</div><div class="berater-kpi-value">' + fmtEuro(sonstErtrag) + '</div></div>';
        html += '</div>';

        // Ertrags-Donut + Trend
        html += '<div style="display:grid;grid-template-columns:1fr 1.5fr;gap:24px;margin-top:20px;">';
        html += '<div class="berater-card"><div class="berater-card-header"><h4>Ertragsstruktur</h4></div>';
        html += renderDonut([
            { name: 'Zinsertrag', value: zinsErtrag, color: '#2563eb' },
            { name: 'Provisionsertrag', value: provErtrag, color: '#16a34a' },
            { name: 'Sonstige', value: sonstErtrag, color: '#d97706' }
        ], 130, fmtNum(totalErtrag), 'EUR');
        html += '</div>';

        html += '<div class="berater-card"><div class="berater-card-header"><h4>Ertragsentwicklung</h4></div>';
        var mData = monthlyErtrag.retail;
        html += renderBarChart(mData.labels, mData.values, '#2563eb');
        html += '</div>';
        html += '</div>';

        // Top-Kunden nach Ertrag
        html += '<div class="berater-card" style="margin-top:20px;"><div class="berater-card-header"><h4>Top-Kunden nach Ertrag</h4></div>';
        html += '<table class="banking-detail-table"><thead><tr><th>Kunde</th><th>Segment</th><th class="text-right">Ertrag YTD</th><th>Anteil am Gesamtertrag</th></tr></thead><tbody>';
        var sorted = retailKunden.slice().sort(function(a,b) { return b.ertrag - a.ertrag; });
        sorted.slice(0, 8).forEach(function(k) {
            var anteil = Math.round(k.ertrag / totalErtrag * 100);
            html += '<tr><td>' + avatarHTML(k.name, k.avatarBg, 28) + ' <strong style="margin-left:8px;">' + k.name + '</strong></td>' +
                '<td><span class="kundensegment-badge ' + (k.segment === 'A-Top' ? 'segment-exklusiv' : k.segment === 'B-Wachstum' ? 'segment-komfort' : 'segment-basis') + '">' + k.segment + '</span></td>' +
                '<td class="text-right" style="font-weight:600;">' + fmtNum(k.ertrag) + ' EUR</td>' +
                '<td>' + renderProgress(anteil, '#2563eb', anteil + '%') + '</td></tr>';
        });
        html += '</tbody></table></div>';

        html += '</div>';
        contentArea.innerHTML = html;
    }

    // ═══════════════════════════════════════
    // TAB: BRANCHENMIX (Firmenkunde)
    // ═══════════════════════════════════════

    function fillBranchenmixTab() {
        var contentArea = document.getElementById('beraterTabContent');
        if (!contentArea) return;
        var totalUmsatz = 0;
        firmenKunden.forEach(function(k) { totalUmsatz += k.umsatz; });

        var html = '<div style="padding:24px 32px;">';
        html += '<div class="berater-kpi-row">';
        html += '<div class="berater-kpi-box"><div class="berater-kpi-label">Branchen</div><div class="berater-kpi-value">' + (new Set(firmenKunden.map(function(k){return k.branche;}))).size + '</div></div>';
        html += '<div class="berater-kpi-box"><div class="berater-kpi-label">Kundenumsatz ges.</div><div class="berater-kpi-value">' + fmtEuro(totalUmsatz) + '</div></div>';
        html += '<div class="berater-kpi-box"><div class="berater-kpi-label">Mitarbeiter ges.</div><div class="berater-kpi-value">' + firmenKunden.reduce(function(s,k){return s+k.mitarbeiter;},0) + '</div></div>';
        html += '</div>';

        // Branchen-Verteilung
        var branchenData = {};
        var brancheColors = { 'Handwerk/Bau':'#f97316', 'Dienstleistung/IT':'#64748b', 'Handel/Gastro':'#22c55e', 'Landwirtschaft':'#84cc16', 'Heilberufe':'#ec4899', 'Produktion/Industrie':'#2563eb', 'Transport/Logistik':'#06b6d4', 'Immobilien':'#a855f7' };
        firmenKunden.forEach(function(k) {
            if (!branchenData[k.brancheLabel]) branchenData[k.brancheLabel] = { kunden: 0, vol: 0, umsatz: 0, mitarb: 0 };
            branchenData[k.brancheLabel].kunden++;
            branchenData[k.brancheLabel].vol += k.kreditvol;
            branchenData[k.brancheLabel].umsatz += k.umsatz;
            branchenData[k.brancheLabel].mitarb += k.mitarbeiter;
        });

        html += '<div class="berater-card" style="margin-top:20px;"><div class="berater-card-header"><h4>Branchenanalyse</h4></div>';
        html += '<table class="banking-detail-table"><thead><tr><th>Branche</th><th class="text-center">Kunden</th><th class="text-right">Kreditvol.</th><th class="text-right">Umsatz</th><th class="text-right">Mitarb.</th><th>Konzentrationsrisiko</th></tr></thead><tbody>';
        Object.keys(branchenData).forEach(function(b) {
            var d = branchenData[b];
            var konzPct = Math.round(d.vol / firmenKunden.reduce(function(s,k){return s+k.kreditvol;},0) * 100);
            var konzColor = konzPct >= 30 ? '#dc2626' : (konzPct >= 20 ? '#d97706' : '#16a34a');
            html += '<tr><td><span class="branche-badge" style="background:' + (brancheColors[b] || '#e2e8f0') + '22;color:' + (brancheColors[b] || '#64748b') + ';">' + b + '</span></td>' +
                '<td class="text-center">' + d.kunden + '</td>' +
                '<td class="text-right">' + fmtEuro(d.vol) + '</td>' +
                '<td class="text-right">' + fmtEuro(d.umsatz) + '</td>' +
                '<td class="text-right">' + d.mitarb + '</td>' +
                '<td>' + renderProgress(konzPct, konzColor, konzPct + '%') + '</td></tr>';
        });
        html += '</tbody></table></div>';

        html += '</div>';
        contentArea.innerHTML = html;
    }

    // ═══════════════════════════════════════
    // TAB: PERFORMANCE (Vermoegen)
    // ═══════════════════════════════════════

    function fillPerformanceTab() {
        var contentArea = document.getElementById('beraterTabContent');
        if (!contentArea) return;

        var perfData = [
            { name: 'VR Konservativ', ytd: 3.2, benchmark: 2.8, vol: 6200000 },
            { name: 'VR Ausgewogen', ytd: 7.8, benchmark: 6.5, vol: 14400000 },
            { name: 'VR Wachstum', ytd: 12.4, benchmark: 10.1, vol: 4800000 },
            { name: 'VR Dynamisch', ytd: 15.2, benchmark: 13.8, vol: 7100000 },
            { name: 'Individuelle VV', ytd: 9.6, benchmark: 8.0, vol: 10000000 }
        ];
        var totalVol = perfData.reduce(function(s,p){return s+p.vol;},0);
        var weightedPerf = perfData.reduce(function(s,p){return s + p.ytd * p.vol;},0) / totalVol;

        var html = '<div style="padding:24px 32px;">';
        html += '<div class="berater-kpi-row">';
        html += '<div class="berater-kpi-box"><div class="berater-kpi-label">&#216; Performance YTD</div><div class="berater-kpi-value" style="color:#16a34a;">+' + weightedPerf.toFixed(1) + '%</div></div>';
        html += '<div class="berater-kpi-box"><div class="berater-kpi-label">AuM Gesamt</div><div class="berater-kpi-value">' + fmtEuro(totalVol) + '</div></div>';
        html += '<div class="berater-kpi-box"><div class="berater-kpi-label">Strategien</div><div class="berater-kpi-value">' + perfData.length + '</div></div>';
        html += '</div>';

        // Performance-Tabelle
        html += '<div class="berater-card" style="margin-top:20px;"><div class="berater-card-header"><h4>Strategie-Performance vs. Benchmark</h4></div>';
        html += '<table class="banking-detail-table"><thead><tr><th>Strategie</th><th class="text-right">Volumen</th><th class="text-right">YTD</th><th class="text-right">Benchmark</th><th class="text-right">Alpha</th><th>Performance</th></tr></thead><tbody>';
        perfData.forEach(function(p) {
            var alpha = (p.ytd - p.benchmark).toFixed(1);
            var alphaColor = alpha >= 0 ? '#16a34a' : '#dc2626';
            var perfWidth = Math.min(Math.round(p.ytd / 20 * 100), 100);
            var benchWidth = Math.min(Math.round(p.benchmark / 20 * 100), 100);
            html += '<tr><td><strong>' + p.name + '</strong></td>' +
                '<td class="text-right">' + fmtEuro(p.vol) + '</td>' +
                '<td class="text-right" style="color:#16a34a;font-weight:600;">+' + p.ytd + '%</td>' +
                '<td class="text-right" style="color:#64748b;">+' + p.benchmark + '%</td>' +
                '<td class="text-right" style="color:' + alphaColor + ';font-weight:700;">' + (alpha >= 0 ? '+' : '') + alpha + '%</td>' +
                '<td><div style="position:relative;height:8px;background:#e2e8f0;border-radius:4px;min-width:120px;">' +
                '<div style="position:absolute;height:100%;width:' + benchWidth + '%;background:#94a3b8;border-radius:4px;opacity:0.5;"></div>' +
                '<div style="position:absolute;height:100%;width:' + perfWidth + '%;background:#16a34a;border-radius:4px;"></div></div></td></tr>';
        });
        html += '</tbody></table></div>';

        // Monatsrenditen
        html += '<div class="berater-card" style="margin-top:20px;"><div class="berater-card-header"><h4>Ertragsentwicklung (6 Monate)</h4></div>';
        var mData = monthlyErtrag.vermoegen;
        html += renderBarChart(mData.labels, mData.values, '#d97706');
        html += '</div>';

        html += '</div>';
        contentArea.innerHTML = html;
    }


    // ═══════════════════════════════════════
    // TAB: QUALITAET (alle Modi)
    // ═══════════════════════════════════════

    function fillQualitaetTab(mode) {
        var contentArea = document.getElementById('beraterTabContent');
        if (!contentArea) return;

        var nps = mode === 'retail' ? 62 : (mode === 'firmenkunde' ? 71 : 78);
        var beschwerden = mode === 'retail' ? 2.1 : (mode === 'firmenkunde' ? 0.8 : 0.3);
        var dokuQuote = mode === 'retail' ? 88 : (mode === 'firmenkunde' ? 94 : 97);

        var html = '<div style="padding:24px 32px;">';

        // KPI-Leiste
        html += '<div class="berater-kpi-row">';
        html += '<div class="berater-kpi-box"><div class="berater-kpi-label">NPS Score</div><div class="berater-kpi-value" style="color:' + (nps >= 50 ? '#16a34a' : '#d97706') + ';">+' + nps + '</div></div>';
        html += '<div class="berater-kpi-box"><div class="berater-kpi-label">Beschwerdenquote</div><div class="berater-kpi-value">' + beschwerden.toFixed(1) + '%</div></div>';
        html += '<div class="berater-kpi-box"><div class="berater-kpi-label">Doku-Quote</div><div class="berater-kpi-value">' + dokuQuote + '%</div></div>';
        html += '<div class="berater-kpi-box"><div class="berater-kpi-label">IDD-Status</div><div class="berater-kpi-value" style="color:#16a34a;">Konform</div></div>';
        html += '</div>';

        // NPS-Gauge + Beschwerde-Trend
        html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:20px;">';

        // NPS Gauge
        html += '<div class="berater-card"><div class="berater-card-header"><h4>NPS Score Details</h4></div>';
        var promoters = Math.round(40 + nps * 0.3);
        var passives = Math.round(30 - nps * 0.1);
        var detractors = 100 - promoters - passives;
        html += renderDonut([
            { name: 'Promotoren', value: promoters, color: '#16a34a' },
            { name: 'Passive', value: passives, color: '#d97706' },
            { name: 'Detraktoren', value: detractors, color: '#dc2626' }
        ], 130, '+' + nps, 'NPS');
        html += '</div>';

        // Beschwerde-Trend
        html += '<div class="berater-card"><div class="berater-card-header"><h4>Beschwerden-Trend (6 Mon.)</h4></div>';
        var bTrend = [3.2, 2.8, 2.1, 1.9, 2.4, beschwerden];
        html += '<div style="display:flex;align-items:flex-end;gap:12px;height:100px;margin-top:12px;">';
        var bMax = Math.max.apply(null, bTrend);
        var bLabels = ['Sep','Okt','Nov','Dez','Jan','Feb'];
        bTrend.forEach(function(v, i) {
            var h = Math.round(v / bMax * 80);
            var col = v < 1.5 ? '#16a34a' : (v < 2.5 ? '#d97706' : '#dc2626');
            html += '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;">' +
                '<span style="font-size:10px;font-weight:600;color:' + col + ';">' + v.toFixed(1) + '</span>' +
                '<div style="width:100%;background:' + col + ';border-radius:4px 4px 0 0;height:' + h + 'px;opacity:0.8;"></div>' +
                '<span style="font-size:10px;color:#94a3b8;">' + bLabels[i] + '</span></div>';
        });
        html += '</div></div>';
        html += '</div>';

        // Schulungsfortschritt
        html += '<div class="berater-card" style="margin-top:20px;"><div class="berater-card-header"><h4>Schulungsfortschritt</h4></div>';
        var schulungen = mode === 'retail' ? [
            { name: 'IDD-Weiterbildung', stunden: 13, max: 15, color: '#86BC25' },
            { name: 'VR-FinanzPlan Zertifizierung', stunden: 8, max: 8, color: '#2563eb' },
            { name: 'Datenschutz (DSGVO)', stunden: 2, max: 2, color: '#7c3aed' },
            { name: 'Geldwaeschepraevention', stunden: 2, max: 2, color: '#f59e0b' },
            { name: 'Digitale Beratungskompetenz', stunden: 3, max: 4, color: '#0891b2' }
        ] : mode === 'firmenkunde' ? [
            { name: 'IDD-Weiterbildung', stunden: 15, max: 15, color: '#86BC25' },
            { name: 'Kreditrisiko-Management', stunden: 6, max: 8, color: '#2563eb' },
            { name: 'MaRisk-Schulung', stunden: 4, max: 4, color: '#7c3aed' },
            { name: 'Geldwaeschepraevention', stunden: 2, max: 2, color: '#f59e0b' },
            { name: 'KfW-Foerderprodukte', stunden: 3, max: 4, color: '#0891b2' }
        ] : [
            { name: 'IDD-Weiterbildung', stunden: 15, max: 15, color: '#86BC25' },
            { name: 'MiFID II Compliance', stunden: 8, max: 8, color: '#2563eb' },
            { name: 'Nachhaltigkeitspraeferenzen (ESG)', stunden: 3, max: 4, color: '#16a34a' },
            { name: 'Nachfolgeplanung', stunden: 4, max: 6, color: '#d97706' },
            { name: 'Stiftungsmanagement', stunden: 2, max: 4, color: '#7c3aed' }
        ];
        schulungen.forEach(function(s) {
            var pct = Math.round(s.stunden / s.max * 100);
            html += '<div style="margin-bottom:12px;">' +
                '<div style="display:flex;justify-content:space-between;margin-bottom:4px;">' +
                '<span style="font-size:13px;color:#334155;">' + s.name + '</span>' +
                '<span style="font-size:12px;font-weight:600;color:' + (pct >= 100 ? '#16a34a' : '#d97706') + ';">' + s.stunden + '/' + s.max + 'h</span></div>' +
                renderProgress(pct, s.color) + '</div>';
        });
        html += '</div>';

        // Compliance-Checkliste
        html += '<div class="berater-card" style="margin-top:20px;"><div class="berater-card-header"><h4>Compliance-Checkliste</h4></div>';
        var checks = [
            { text: 'Beratungsdokumentation vollstaendig', ok: true },
            { text: 'Interessenkonflikt-Erklaerung aktuell', ok: true },
            { text: 'Beschwerdemanagement-Prozess', ok: true },
            { text: 'Produktfreigabeverfahren (POG)', ok: true },
            { text: 'Nachhaltigkeitspraeferenzen (ESG)', ok: mode !== 'retail' },
            { text: 'Zielmarktbestimmung dokumentiert', ok: true },
            { text: 'Verguetungstransparenz', ok: true }
        ];
        checks.forEach(function(c) {
            var icon = c.ok ?
                '<svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5" width="14" height="14"><polyline points="20 6 9 17 4 12"/></svg>' :
                '<svg viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2.5" width="14" height="14"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';
            html += '<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid #f1f5f9;">' +
                '<div style="width:24px;height:24px;border-radius:50%;background:' + (c.ok ? '#dcfce7' : '#fef3c7') + ';display:flex;align-items:center;justify-content:center;">' + icon + '</div>' +
                '<span style="font-size:13px;color:#334155;flex:1;">' + c.text + '</span>' +
                '<span style="font-size:11px;font-weight:600;color:' + (c.ok ? '#16a34a' : '#d97706') + ';">' + (c.ok ? 'Erfuellt' : 'Teilweise') + '</span></div>';
        });
        html += '</div>';

        html += '</div>';
        contentArea.innerHTML = html;
    }

    // ═══════════════════════════════════════
    // TAB: NACHFOLGE (Vermoegen)
    // ═══════════════════════════════════════

    function fillNachfolgeTab() {
        var contentArea = document.getElementById('beraterTabContent');
        if (!contentArea) return;

        var nachfolgeKunden = vermoegenKunden.filter(function(k) { return k.nachfolge; });
        var stiftungKunden = vermoegenKunden.filter(function(k) { return k.stiftung; });

        var html = '<div style="padding:24px 32px;">';

        // KPIs
        html += '<div class="berater-kpi-row">';
        html += '<div class="berater-kpi-box"><div class="berater-kpi-label">Nachfolge-Mandate</div><div class="berater-kpi-value">' + nachfolgeKunden.length + '</div></div>';
        html += '<div class="berater-kpi-box"><div class="berater-kpi-label">Stiftungsmandate</div><div class="berater-kpi-value">' + stiftungKunden.length + '</div></div>';
        html += '<div class="berater-kpi-box"><div class="berater-kpi-label">Betroffenes AuM</div><div class="berater-kpi-value">' + fmtEuro(nachfolgeKunden.reduce(function(s,k){return s+k.aum;},0)) + '</div></div>';
        html += '<div class="berater-kpi-box"><div class="berater-kpi-label">Ohne Regelung</div><div class="berater-kpi-value" style="color:#dc2626;">' + (vermoegenKunden.length - nachfolgeKunden.length) + '</div></div>';
        html += '</div>';

        // Nachfolge-Status Tabelle
        html += '<div class="berater-card" style="margin-top:20px;"><div class="berater-card-header"><h4>Nachfolgeplanung je Kunde</h4></div>';
        html += '<table class="banking-detail-table"><thead><tr><th>Kunde</th><th class="text-right">AuM</th><th class="text-center">Nachfolge</th><th class="text-center">Stiftung</th><th class="text-center">Testament</th><th>Status</th></tr></thead><tbody>';

        var nachfolgeStatus = [
            { id: 'VK-30010', testament: true, status: 'In Pruefung', statusColor: '#d97706' },
            { id: 'VK-30023', testament: true, status: 'Abgeschlossen', statusColor: '#16a34a' },
            { id: 'VK-30035', testament: false, status: 'Nicht begonnen', statusColor: '#dc2626' },
            { id: 'VK-30048', testament: true, status: 'Abgeschlossen', statusColor: '#16a34a' },
            { id: 'VK-30061', testament: false, status: 'Nicht begonnen', statusColor: '#dc2626' },
            { id: 'VK-30074', testament: true, status: 'In Bearbeitung', statusColor: '#d97706' }
        ];

        vermoegenKunden.forEach(function(k) {
            var ns = nachfolgeStatus.find(function(n) { return n.id === k.id; }) || { testament: false, status: 'Unbekannt', statusColor: '#94a3b8' };
            var ja = '<span style="color:#16a34a;font-weight:700;">&#10003;</span>';
            var nein = '<span style="color:#94a3b8;">—</span>';
            html += '<tr><td>' + avatarHTML(k.name, k.avatarBg, 28) + ' <strong style="margin-left:8px;">' + k.name + '</strong></td>' +
                '<td class="text-right">' + fmtEuro(k.aum) + '</td>' +
                '<td class="text-center">' + (k.nachfolge ? ja : nein) + '</td>' +
                '<td class="text-center">' + (k.stiftung ? ja : nein) + '</td>' +
                '<td class="text-center">' + (ns.testament ? ja : nein) + '</td>' +
                '<td><span style="font-size:11px;font-weight:700;padding:3px 10px;border-radius:4px;background:' + ns.statusColor + '22;color:' + ns.statusColor + ';">' + ns.status + '</span></td></tr>';
        });
        html += '</tbody></table></div>';

        // Generationenmodell
        html += '<div class="berater-card" style="margin-top:20px;"><div class="berater-card-header"><h4>Generationenberatung Aktiv</h4></div>';
        html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;">';
        nachfolgeKunden.forEach(function(k) {
            html += '<div style="background:#f8fafc;border-radius:10px;padding:16px;border:1px solid #e2e8f0;">' +
                '<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">' +
                avatarHTML(k.name, k.avatarBg, 36) +
                '<div><div style="font-size:14px;font-weight:600;color:#1e293b;">' + k.name + '</div>' +
                '<div style="font-size:11px;color:#64748b;">' + k.id + ' | ' + k.ort + '</div></div></div>' +
                '<div style="display:flex;justify-content:space-between;font-size:12px;margin-top:8px;">' +
                '<span style="color:#64748b;">AuM</span><span style="font-weight:600;">' + fmtEuro(k.aum) + '</span></div>' +
                '<div style="display:flex;justify-content:space-between;font-size:12px;margin-top:4px;">' +
                '<span style="color:#64748b;">Depot</span><span style="font-weight:600;">' + fmtEuro(k.depot) + '</span></div>' +
                '<div style="display:flex;justify-content:space-between;font-size:12px;margin-top:4px;">' +
                '<span style="color:#64748b;">Vorsorge</span><span style="font-weight:600;">' + fmtEuro(k.vorsorge) + '</span></div>' +
                '</div>';
        });
        html += '</div></div>';

        html += '</div>';
        contentArea.innerHTML = html;
    }

    // ═══════════════════════════════════════
    // TAB: POTENTIALE (alle Modi, KI + FIDA)
    // ═══════════════════════════════════════

    function fillPotentialeTab(mode) {
        var contentArea = document.getElementById('beraterTabContent');
        if (!contentArea) return;
        var pot = potentialeData[mode] || [];
        var totalPotential = pot.reduce(function(s,p) { return s + p.potential; }, 0);
        var hochCount = pot.filter(function(p) { return p.prio === 'hoch'; }).length;
        var fidaCount = pot.filter(function(p) { return p.quelle === 'FIDA'; }).length;

        var html = '<div style="padding:24px 32px;">';

        // KI-Banner
        html += '<div style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);border-radius:12px;padding:20px 24px;margin-bottom:20px;display:flex;align-items:center;justify-content:space-between;">';
        html += '<div><div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">' +
            '<div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#FF6600,#cc5200);display:flex;align-items:center;justify-content:center;">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" width="16" height="16"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.6 15H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.6V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9c.26.604.852.997 1.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg></div>' +
            '<span style="font-size:16px;font-weight:700;color:white;">KI-Vertriebssteuerung</span>' +
            '<span style="font-size:10px;font-weight:700;text-transform:uppercase;padding:3px 10px;border-radius:20px;background:rgba(255,102,0,0.2);color:#FF6600;letter-spacing:0.5px;">FIDA | Open Finance</span></div>' +
            '<div style="font-size:13px;color:rgba(255,255,255,0.6);">' + pot.length + ' Potentiale identifiziert | ' + fidaCount + ' aus Open-Finance-Daten</div></div>';
        html += '<div style="text-align:right;"><div style="font-size:28px;font-weight:700;color:#FF6600;">+' + fmtNum(totalPotential) + '</div><div style="font-size:11px;color:rgba(255,255,255,0.5);">EUR/Jahr geschaetztes Ertragspotenzial</div></div>';
        html += '</div>';

        // Potentiale-Karten
        pot.forEach(function(p) {
            var prioColor = p.prio === 'hoch' ? '#dc2626' : (p.prio === 'mittel' ? '#d97706' : '#16a34a');
            var prioBg = p.prio === 'hoch' ? '#fee2e2' : (p.prio === 'mittel' ? '#fef3c7' : '#dcfce7');
            var prioLabel = p.prio.charAt(0).toUpperCase() + p.prio.slice(1);
            var quelleIcon = p.quelle === 'FIDA' ? '<span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px;background:rgba(255,102,0,0.1);color:#FF6600;">FIDA</span>' :
                '<span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px;background:#f1f5f9;color:#64748b;">' + p.quelle + '</span>';

            html += '<div class="berater-potential-card" style="border-left:3px solid ' + prioColor + ';">';
            html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">';
            html += '<div style="display:flex;align-items:center;gap:10px;">' +
                '<span style="font-size:10px;font-weight:700;text-transform:uppercase;padding:3px 10px;border-radius:4px;background:' + prioBg + ';color:' + prioColor + ';">' + prioLabel + '</span>' +
                '<span style="font-size:14px;font-weight:700;color:#1e293b;">' + p.titel + '</span></div>';
            html += quelleIcon;
            html += '</div>';
            html += '<div style="font-size:13px;font-weight:600;color:#475569;margin-bottom:4px;">' + p.kunde + ' <span style="color:#94a3b8;font-weight:400;">(' + p.kundeId + ')</span></div>';
            html += '<div style="font-size:12px;color:#64748b;line-height:1.6;margin-bottom:8px;">' + p.beschreibung + '</div>';
            html += '<div style="display:flex;justify-content:space-between;align-items:center;">';
            html += '<span style="font-size:12px;font-weight:700;color:#FF6600;">Ertragspotenzial: +' + fmtNum(p.potential) + ' EUR/Jahr</span>';
            html += '<button style="font-size:11px;font-weight:600;padding:6px 14px;border-radius:6px;border:1px solid #003399;background:white;color:#003399;cursor:pointer;" onclick="openBankKundenDetail(\'' + p.kundeId + '\',\'' + mode + '\')">Kunde oeffnen</button>';
            html += '</div></div>';
        });

        html += '</div>';
        contentArea.innerHTML = html;
    }


    // ═══════════════════════════════════════
    // TAB: KUNDEN (enhanced mit Fotos)
    // ═══════════════════════════════════════

    function fillKundenTab(mode) {
        // Kunden-Tab zeigt die bestehenden HTML-Listen (werden via showTabElements eingeblendet)
        // Hier fuellen wir die Listen mit erweiterten Daten (Fotos etc.)
        if (mode === 'retail') fillRetailKundenliste();
        else if (mode === 'firmenkunde') fillFirmenKundenliste();
        else if (mode === 'vermoegen') fillVermoegenKundenliste();
    }

    // ── Kundenliste: Retail (enhanced) ────
    function fillRetailKundenliste() {
        var tbody = document.getElementById('retailKundenBody');
        if (!tbody) return;
        var html = '';
        retailKunden.forEach(function(k) {
            var segmentClass = k.segment === 'A-Top' ? 'segment-exklusiv' :
                               k.segment === 'B-Wachstum' ? 'segment-komfort' :
                               k.segment === 'Abwanderung' ? 'segment-basis' : 'segment-basis';
            var fpIcon = k.finanzplan ? '<span style="color:#16a34a;font-weight:700;">&#10003;</span>' : '<span style="color:#94a3b8;">—</span>';
            html += '<tr class="clickable-row" onclick="openBankKundenDetail(\'' + k.id + '\',\'retail\')">' +
                '<td style="display:flex;align-items:center;gap:10px;">' + avatarHTML(k.name, k.avatarBg, 32) + '<div><strong>' + k.name + '</strong><div style="font-size:11px;color:#94a3b8;">' + (k.beruf || '') + '</div></div></td>' +
                '<td>' + k.id + '</td>' +
                '<td><span class="kundensegment-badge ' + segmentClass + '">' + k.segment + '</span></td>' +
                '<td>' + k.ort + '</td>' +
                '<td class="text-center">' + k.produkte + '</td>' +
                '<td class="text-right">' + fmtNum(k.ertrag) + ' EUR</td>' +
                '<td class="text-center">' + fpIcon + '</td></tr>';
        });
        tbody.innerHTML = html;
    }

    // ── Kundenliste: Firmenkunde (enhanced) ──
    function fillFirmenKundenliste() {
        var tbody = document.getElementById('firmenKundenBody');
        if (!tbody) return;
        var html = '';
        firmenKunden.forEach(function(k) {
            html += '<tr class="clickable-row" onclick="openBankKundenDetail(\'' + k.id + '\',\'firmenkunde\')">' +
                '<td><strong>' + k.name + '</strong><div style="font-size:11px;color:#94a3b8;">Gegr. ' + (k.gruendung || '-') + ' | ' + k.mitarbeiter + ' MA</div></td>' +
                '<td>' + k.id + '</td>' +
                '<td><span class="branche-badge branche-' + k.branche + '">' + k.brancheLabel + '</span></td>' +
                '<td>' + k.ort + '</td>' +
                '<td class="text-right">' + fmtEuro(k.kreditvol) + '</td>' +
                '<td><span class="rating-badge rating-' + k.rating.toLowerCase() + '">' + k.rating + '</span></td>' +
                '<td class="text-right">' + fmtNum(k.umsatz) + ' EUR</td></tr>';
        });
        tbody.innerHTML = html;
    }

    // ── Kundenliste: Vermoegen (enhanced) ──
    function fillVermoegenKundenliste() {
        var tbody = document.getElementById('vermoegenKundenBody');
        if (!tbody) return;
        var html = '';
        vermoegenKunden.forEach(function(k) {
            var nachfolgeIcon = k.nachfolge ? '<span style="color:#B8860B;font-weight:700;">&#10003;</span>' : '<span style="color:#94a3b8;">—</span>';
            var stiftungIcon = k.stiftung ? '<span style="color:#7c3aed;font-weight:700;">&#10003;</span>' : '<span style="color:#94a3b8;">—</span>';
            html += '<tr class="clickable-row" onclick="openBankKundenDetail(\'' + k.id + '\',\'vermoegen\')">' +
                '<td style="display:flex;align-items:center;gap:10px;">' + avatarHTML(k.name, k.avatarBg, 32) + '<div><strong>' + k.name + '</strong><div style="font-size:11px;color:#94a3b8;">' + (k.risikoklasse || '') + '</div></div></td>' +
                '<td>' + k.id + '</td>' +
                '<td>' + k.ort + '</td>' +
                '<td class="text-right">' + fmtEuro(k.aum) + '</td>' +
                '<td class="text-right">' + fmtEuro(k.depot) + '</td>' +
                '<td class="text-center">' + nachfolgeIcon + '</td>' +
                '<td class="text-center">' + stiftungIcon + '</td></tr>';
        });
        tbody.innerHTML = html;
    }

    // ═══════════════════════════════════════
    // NAVIGATION
    // ═══════════════════════════════════════

    function openBeraterOverview() {
        console.log('B-02: Berater-Uebersicht oeffnen (Modus: ' + bankViewMode + ')');
        var idsToHide = ['landingPage', 'mainApp', 'agenturOverview', 'potentialAnalysePage',
            'kundenDetailPage', 'bgavUmstellungPage', 'billingCheckPage',
            'bankenModule', 'assetModule', 'risikoscoringModule',
            'bestandsuebertragungModule', 'pmoToolboxModule', 'hrPipelineModule',
            'versicherungs1x1Module', 'kundenDetailBankPage'];
        idsToHide.forEach(function(id) {
            var el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });
        var welcomeChat = document.getElementById('welcomeChat');
        if (welcomeChat) welcomeChat.style.display = 'none';
        // Agentur-Chat verstecken
        var agenturChat = document.getElementById('agenturChatWidget');
        if (agenturChat) agenturChat.style.display = 'none';
        var agenturToggle = document.getElementById('agenturChatToggle');
        if (agenturToggle) agenturToggle.style.display = 'none';

        // B-02 anzeigen
        var page = document.getElementById('beraterOverviewPage');
        if (page) page.style.display = 'block';

        // Berater-Chat einblenden
        var chatToggle = document.getElementById('beraterChatToggle');
        if (chatToggle) chatToggle.style.display = 'flex';

        // Mode-Buttons synchronisieren
        document.querySelectorAll('.bank-mode-btn').forEach(function(btn) {
            btn.classList.toggle('active', btn.dataset.mode === bankViewMode);
        });

        applyBankViewMode();

        // Chat-Beispiel-Buttons Event-Listener
        setTimeout(function() {
            document.querySelectorAll('.berater-example-btn').forEach(function(btn) {
                btn.onclick = function() {
                    var q = btn.getAttribute('data-question');
                    if (q) {
                        var input = document.getElementById('beraterChatInput');
                        if (input) input.value = q;
                        sendBeraterChatMessage();
                    }
                };
            });
            // Enter-Taste fuer Chat-Input
            var chatInput = document.getElementById('beraterChatInput');
            if (chatInput) {
                chatInput.onkeydown = function(e) {
                    if (e.key === 'Enter') sendBeraterChatMessage();
                };
            }
        }, 100);
    }

    function backFromBeraterOverview() {
        console.log('B-02: Zurueck zur Landing Page');
        var page = document.getElementById('beraterOverviewPage');
        if (page) page.style.display = 'none';
        // Chat verstecken
        var chatWidget = document.getElementById('beraterChatWidget');
        var chatToggle = document.getElementById('beraterChatToggle');
        if (chatWidget) chatWidget.style.display = 'none';
        if (chatToggle) chatToggle.style.display = 'none';
        // Charts aufraeumen
        destroyBeraterCharts();
        var landing = document.getElementById('landingPage');
        if (landing) landing.style.display = 'flex';
        document.dispatchEvent(new CustomEvent('viewChanged', { detail: { module: 'main', view: 'landing' } }));
        if (window.AppRouter) AppRouter.navigate('/landing');
    }

    // ═══════════════════════════════════════
    // CHAT-WIDGET FUNKTIONEN
    // ═══════════════════════════════════════

    function toggleBeraterChat() {
        var widget = document.getElementById('beraterChatWidget');
        var toggle = document.getElementById('beraterChatToggle');
        var badge = document.getElementById('beraterChatBadge');
        if (!widget) return;
        var isOpen = widget.style.display === 'flex';
        widget.style.display = isOpen ? 'none' : 'flex';
        if (toggle) toggle.style.display = isOpen ? 'flex' : 'none';
        if (badge) badge.style.display = 'none';
    }

    function sendBeraterChatMessage() {
        var input = document.getElementById('beraterChatInput');
        if (!input || !input.value.trim()) return;
        var query = input.value.trim();
        input.value = '';

        // User-Nachricht anzeigen
        addBeraterChatMsg('user', query);

        // Antwort generieren
        setTimeout(function() {
            var response = processBeraterQuery(query);
            addBeraterChatMsg('assistant', response);
        }, 500);
    }

    function addBeraterChatMsg(role, content) {
        var body = document.getElementById('beraterChatBody');
        if (!body) return;
        // Welcome-Nachricht entfernen beim ersten Chat
        var welcome = body.querySelector('.berater-chat-welcome');
        if (welcome) welcome.style.display = 'none';

        var msgDiv = document.createElement('div');
        msgDiv.className = 'berater-chat-msg berater-chat-' + role;
        msgDiv.innerHTML = content;
        body.appendChild(msgDiv);
        body.scrollTop = body.scrollHeight;
    }

    function processBeraterQuery(query) {
        var q = query.toLowerCase();
        var mode = bankViewMode;
        var kunden = mode === 'retail' ? retailKunden : (mode === 'firmenkunde' ? firmenKunden : vermoegenKunden);
        var pot = potentialeData[mode] || [];

        // Top Kunden / Ertrag
        if (q.indexOf('top') >= 0 && (q.indexOf('ertrag') >= 0 || q.indexOf('kund') >= 0)) {
            var sorted = kunden.slice().sort(function(a,b) { return (b.ertrag || b.aum || b.kreditvol || 0) - (a.ertrag || a.aum || a.kreditvol || 0); });
            var top5 = sorted.slice(0, 5);
            var html = '<div style="font-weight:600;margin-bottom:8px;">Top 5 Kunden nach Ertragspotenzial:</div><table style="width:100%;font-size:12px;border-collapse:collapse;">';
            top5.forEach(function(k, i) {
                var val = k.ertrag || k.aum || k.kreditvol || 0;
                html += '<tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:4px 0;">' + (i+1) + '. <strong>' + k.name + '</strong></td><td style="text-align:right;padding:4px 0;color:#16a34a;font-weight:600;">' + fmtEuro(val) + '</td></tr>';
            });
            html += '</table>';
            html += '<div class="berater-chat-followup">Moechten Sie eine detaillierte Analyse oder einen Kunden oeffnen?</div>';
            return html;
        }

        // FinanzPlan
        if (q.indexOf('finanzplan') >= 0 || q.indexOf('finanz') >= 0) {
            var ohneFinanzplan = retailKunden.filter(function(k) { return !k.finanzplan; });
            var html = '<div style="font-weight:600;margin-bottom:8px;">VR-FinanzPlan-Analyse:</div>';
            html += '<div style="font-size:12px;margin-bottom:8px;">' + ohneFinanzplan.length + ' von ' + retailKunden.length + ' Kunden haben noch keinen VR-FinanzPlan:</div>';
            ohneFinanzplan.forEach(function(k) {
                html += '<div style="font-size:12px;padding:2px 0;">- ' + k.name + ' (' + k.segment + ', ' + k.produkte + ' Produkte)</div>';
            });
            html += '<div class="berater-chat-followup">Empfehlung: Priorisieren Sie B-Wachstum-Kunden fuer FinanzPlan-Gespraeche.</div>';
            return html;
        }

        // Open Finance / FIDA
        if (q.indexOf('open finance') >= 0 || q.indexOf('fida') >= 0 || q.indexOf('cross') >= 0) {
            var fidaPot = pot.filter(function(p) { return p.quelle === 'FIDA'; });
            var html = '<div style="font-weight:600;margin-bottom:8px;">Open Finance / FIDA Analyse:</div>';
            html += '<div style="font-size:12px;margin-bottom:8px;">' + fidaPot.length + ' Cross-Selling-Chancen aus FIDA-Daten:</div>';
            fidaPot.forEach(function(p) {
                html += '<div style="font-size:12px;padding:4px 0;border-bottom:1px solid #f1f5f9;">' +
                    '<strong>' + p.kunde + '</strong>: ' + p.titel + '<br><span style="color:#FF6600;">+' + fmtNum(p.potential) + ' EUR/J.</span></div>';
            });
            html += '<div class="berater-chat-followup">Soll ich die Details zum Potentiale-Tab laden?</div>';
            return html;
        }

        // Abwanderung
        if (q.indexOf('abwander') >= 0 || q.indexOf('risiko') >= 0 || q.indexOf('churn') >= 0) {
            if (mode === 'retail') {
                var risiko = retailKunden.filter(function(k) { return k.segment === 'Abwanderung' || k.letztKontakt > 60; });
                var html = '<div style="font-weight:600;margin-bottom:8px;">Abwanderungsrisiko-Analyse:</div>';
                html += '<div style="font-size:12px;color:#dc2626;margin-bottom:8px;">' + risiko.length + ' Kunden mit erhoehtem Risiko:</div>';
                risiko.forEach(function(k) {
                    html += '<div style="font-size:12px;padding:2px 0;">- ' + k.name + ' (Kontakt vor ' + k.letztKontakt + ' Tagen, ' + k.produkte + ' Produkte)</div>';
                });
                html += '<div class="berater-chat-followup">Empfehlung: Sofortige Kontaktaufnahme + Retention-Angebot.</div>';
                return html;
            }
        }

        // Default-Antwort
        return '<div style="font-size:13px;">Ich habe Ihre Anfrage "<em>' + query + '</em>" analysiert. Im aktuellen <strong>' +
            (mode === 'retail' ? 'Retail' : (mode === 'firmenkunde' ? 'Firmenkunden' : 'Private Banking')) +
            '</strong>-Modus betreuen Sie <strong>' + kunden.length + ' Kunden</strong>.</div>' +
            '<div class="berater-chat-followup" style="margin-top:8px;">Versuchen Sie: "Top 5 Kunden", "FinanzPlan-Potenziale", "Open Finance Analyse" oder "Abwanderungsrisiko"</div>';
    }

    // ═══════════════════════════════════════
    // GLOBAL EXPORTS
    // ═══════════════════════════════════════

    window.setBankViewMode = setBankViewMode;
    window.openBeraterOverview = openBeraterOverview;
    window.backFromBeraterOverview = backFromBeraterOverview;
    window.switchBeraterTab = switchBeraterTab;
    window.toggleBeraterChat = toggleBeraterChat;
    window.sendBeraterChatMessage = sendBeraterChatMessage;
    window.bankViewMode = bankViewMode;

    // Data exports for B-10
    window.bankRetailKunden = retailKunden;
    window.bankFirmenKunden = firmenKunden;
    window.bankVermoegenKunden = vermoegenKunden;

})();
