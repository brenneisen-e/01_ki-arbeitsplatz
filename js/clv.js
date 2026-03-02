// js/clv.js - Customer Lifetime Value (CLV) Berechnung
// Extracted from landing.js for modularity

// CUSTOMER LIFETIME VALUE (CLV)
// ========================================

// CLV-Parameter pro Demokunde (konsistent mit Vertragsdaten und Kundensituation)
const clvKundenParameter = {
    'Peter Schmidt': {
        haltedauerJahre: 12,
        stornoRisiko: 0.08,
        crossSellingJahresPraemie: 840,
        crossSellingDetails: 'Risikoleben (~€300/J.) + Kfz-Umdeckung (~€540/J.)',
        empfehlungsPotenzial: 3,
        trendVorjahr: 0.12
    },
    'Amira König': {
        haltedauerJahre: 10,
        stornoRisiko: 0.10,
        crossSellingJahresPraemie: 540,
        crossSellingDetails: 'Kfz-Umdeckung (~€540/J.)',
        empfehlungsPotenzial: 1,
        trendVorjahr: -0.03
    },
    'Thomas Weber': {
        haltedauerJahre: 6,
        stornoRisiko: 0.18,
        crossSellingJahresPraemie: 1800,
        crossSellingDetails: 'BU-Versicherung (~€1.500/J.) + Kfz (~€300/J.)',
        empfehlungsPotenzial: 1,
        trendVorjahr: 0.05
    },
    'Anna Hoffmann': {
        haltedauerJahre: 15,
        stornoRisiko: 0.06,
        crossSellingJahresPraemie: 2400,
        crossSellingDetails: 'Fondsgebundene Rentenversicherung (~€2.400/J.)',
        empfehlungsPotenzial: 3,
        trendVorjahr: 0.15
    },
    'Michael Braun': {
        haltedauerJahre: 10,
        stornoRisiko: 0.05,
        crossSellingJahresPraemie: 480,
        crossSellingDetails: 'Cyber-Versicherung (~€280/J.) + Reise (~€200/J.)',
        empfehlungsPotenzial: 3,
        trendVorjahr: 0.04
    },
    'Lisa Müller': {
        haltedauerJahre: 15,
        stornoRisiko: 0.09,
        crossSellingJahresPraemie: 960,
        crossSellingDetails: 'Kranken-Zusatzversicherung (~€960/J.)',
        empfehlungsPotenzial: 2,
        trendVorjahr: 0.18
    },
    'Klaus Meier': {
        haltedauerJahre: 10,
        stornoRisiko: 0.11,
        crossSellingJahresPraemie: 660,
        crossSellingDetails: 'Risikoleben (~€360/J.) + Geschäftsinhalts-Vers. (~€300/J.)',
        empfehlungsPotenzial: 4,
        trendVorjahr: 0.06
    },
    'Matthias Engel': {
        haltedauerJahre: 12,
        stornoRisiko: 0.10,
        crossSellingJahresPraemie: 1500,
        crossSellingDetails: 'BU-Aufstockung (~€1.200/J.) + Risikoleben (~€300/J.)',
        empfehlungsPotenzial: 3,
        trendVorjahr: 0.09
    },
    'Christian Bauer': {
        haltedauerJahre: 8,
        stornoRisiko: 0.16,
        crossSellingJahresPraemie: 2040,
        crossSellingDetails: 'BU-Versicherung (~€1.440/J.) + Kfz (~€600/J.)',
        empfehlungsPotenzial: 1,
        trendVorjahr: 0.22
    },
    'Martin Wolf': {
        haltedauerJahre: 12,
        stornoRisiko: 0.10,
        crossSellingJahresPraemie: 3480,
        crossSellingDetails: 'BU-Vers. Hochrisiko (~€3.000/J.) + Risikoleben (~€480/J.)',
        empfehlungsPotenzial: 4,
        trendVorjahr: 0.14
    },
    'Eva Hartmann': {
        haltedauerJahre: 14,
        stornoRisiko: 0.13,
        crossSellingJahresPraemie: 840,
        crossSellingDetails: 'BU-Aufstockung (~€600/J.) + Risikoleben (~€240/J.)',
        empfehlungsPotenzial: 3,
        trendVorjahr: 0.10
    }
};

// Deckungsbeitrags-Raten nach Versicherungstyp
const clvDeckungsbeitragsRaten = {
    'Berufsunfähigkeitsversicherung': 0.25,
    'Risikolebensversicherung': 0.20,
    'Wohngebäudeversicherung': 0.15,
    'Privathaftpflichtversicherung': 0.18,
    'Unfallversicherung': 0.20,
    'Rechtsschutzversicherung': 0.15,
    'Betriebshaftpflicht': 0.18
};

function calculateCLV(vertraege, kundenName) {
    const params = clvKundenParameter[kundenName];
    if (!params) return null;

    // Jahresprämien aus Vertragsdaten parsen
    let jahresPraemie = 0;
    let jahresDB = 0;
    const vertraegeDetails = [];

    vertraege.forEach(v => {
        const match = v.praemie.match(/€([\d.,]+)\/(Mon\.|Jahr)/);
        if (match) {
            const betrag = parseFloat(match[1].replace('.', '').replace(',', '.'));
            const jahrBetrag = match[2] === 'Mon.' ? betrag * 12 : betrag;
            const dbRate = clvDeckungsbeitragsRaten[v.typ] || 0.15;
            const db = jahrBetrag * dbRate;

            jahresPraemie += jahrBetrag;
            jahresDB += db;

            vertraegeDetails.push({
                typ: v.typ,
                jahresPraemie: jahrBetrag,
                dbRate: dbRate,
                jahresDB: db
            });
        }
    });

    // Bestandswert = Jahres-Deckungsbeitrag × Haltedauer
    const bestandswert = jahresDB * params.haltedauerJahre;

    // Cross-Selling: Ø 20% DB auf Zusatzprämie, max. 5 Jahre Horizont
    const crossSellingDB = params.crossSellingJahresPraemie * 0.20 * Math.min(params.haltedauerJahre, 5);

    // Empfehlungswert: Anzahl × durchschn. Wert einer Empfehlung
    const empfehlungswert = params.empfehlungsPotenzial * 400;

    // Storno-Abzug auf Bestands- und Cross-Selling-Wert
    const stornoAbzug = (bestandswert + crossSellingDB) * params.stornoRisiko;

    // Gesamt-CLV
    const gesamtCLV = bestandswert + crossSellingDB + empfehlungswert - stornoAbzug;

    // Segment-Einstufung
    let segment;
    if (gesamtCLV >= 8000) segment = 'Premium';
    else if (gesamtCLV >= 5000) segment = 'Wachstum';
    else segment = 'Entwicklung';

    return {
        jahresPraemie,
        jahresDB,
        vertraegeDetails,
        bestandswert,
        crossSellingDB,
        crossSellingDetails: params.crossSellingDetails,
        crossSellingJahresPraemie: params.crossSellingJahresPraemie,
        empfehlungswert,
        empfehlungsPotenzial: params.empfehlungsPotenzial,
        stornoAbzug,
        stornoRisiko: params.stornoRisiko,
        haltedauerJahre: params.haltedauerJahre,
        trendVorjahr: params.trendVorjahr,
        gesamtCLV,
        segment
    };
}

function formatEuroCLV(value) {
    return '€' + Math.round(value).toLocaleString('de-DE');
}

function renderCLV(clv) {
    // Header-Badge
    const headerValue = document.getElementById('clvHeaderValue');
    if (headerValue) headerValue.textContent = formatEuroCLV(clv.gesamtCLV);

    const headerSegment = document.getElementById('clvHeaderSegment');
    if (headerSegment) {
        headerSegment.textContent = clv.segment;
        headerSegment.className = 'clv-badge-segment ' + clv.segment.toLowerCase();
    }

    const headerTrend = document.getElementById('clvHeaderTrend');
    if (headerTrend) {
        const sign = clv.trendVorjahr >= 0 ? '+' : '';
        const arrow = clv.trendVorjahr >= 0 ? '\u2197' : '\u2198';
        headerTrend.textContent = arrow + ' ' + sign + Math.round(clv.trendVorjahr * 100) + '%';
        headerTrend.className = 'clv-badge-trend ' + (clv.trendVorjahr >= 0 ? 'positive' : 'negative');
    }

    // Detail-Card: Gesamt-CLV
    const totalValue = document.getElementById('clvTotalValue');
    if (totalValue) totalValue.textContent = formatEuroCLV(clv.gesamtCLV);

    const totalTrend = document.getElementById('clvTotalTrend');
    if (totalTrend) {
        const sign = clv.trendVorjahr >= 0 ? '+' : '';
        const arrow = clv.trendVorjahr >= 0 ? '\u2197' : '\u2198';
        totalTrend.textContent = arrow + ' ' + sign + Math.round(clv.trendVorjahr * 100) + '% ggü. Vorjahr';
        totalTrend.className = 'clv-total-trend ' + (clv.trendVorjahr >= 0 ? 'positive' : 'negative');
    }

    // Segment
    const segmentValue = document.getElementById('clvSegmentValue');
    if (segmentValue) {
        segmentValue.textContent = clv.segment;
        segmentValue.className = 'clv-segment-value ' + clv.segment.toLowerCase();
    }

    // Haltedauer
    const haltedauerValue = document.getElementById('clvHaltedauerValue');
    if (haltedauerValue) {
        haltedauerValue.textContent = clv.haltedauerJahre + ' Jahre';
    }

    // Storno-Risiko
    const stornoValue = document.getElementById('clvStornoValue');
    if (stornoValue) {
        stornoValue.textContent = Math.round(clv.stornoRisiko * 100) + '%';
        const level = clv.stornoRisiko <= 0.08 ? 'low' : clv.stornoRisiko <= 0.12 ? 'medium' : 'high';
        stornoValue.className = 'clv-storno-value ' + level;
    }

    // Herleitung (Breakdown)
    const breakdownRows = document.getElementById('clvBreakdownRows');
    if (breakdownRows) {
        let html = '';

        // Einzelverträge
        clv.vertraegeDetails.forEach(v => {
            html += '<div class="clv-row">' +
                '<span class="clv-row-label">' + v.typ + '</span>' +
                '<span class="clv-row-calc">' + formatEuroCLV(v.jahresPraemie) + '/J. \u00d7 ' + Math.round(v.dbRate * 100) + '% DB \u00d7 ' + clv.haltedauerJahre + ' J.</span>' +
                '<span class="clv-row-value">' + formatEuroCLV(v.jahresDB * clv.haltedauerJahre) + '</span>' +
                '</div>';
        });

        // Bestandswert Zwischensumme
        html += '<div class="clv-row subtotal">' +
            '<span class="clv-row-label">= Bestandswert</span>' +
            '<span class="clv-row-calc">' + formatEuroCLV(clv.jahresDB) + ' DB/J. \u00d7 ' + clv.haltedauerJahre + ' Jahre</span>' +
            '<span class="clv-row-value">' + formatEuroCLV(clv.bestandswert) + '</span>' +
            '</div>';

        // Cross-Selling
        html += '<div class="clv-row">' +
            '<span class="clv-row-label">+ Cross-Selling-Potenzial</span>' +
            '<span class="clv-row-calc">' + clv.crossSellingDetails + '</span>' +
            '<span class="clv-row-value">' + formatEuroCLV(clv.crossSellingDB) + '</span>' +
            '</div>';

        // Empfehlungswert
        html += '<div class="clv-row">' +
            '<span class="clv-row-label">+ Empfehlungswert</span>' +
            '<span class="clv-row-calc">' + clv.empfehlungsPotenzial + ' Empfehlungen \u00d7 €400</span>' +
            '<span class="clv-row-value">' + formatEuroCLV(clv.empfehlungswert) + '</span>' +
            '</div>';

        // Storno-Abzug
        html += '<div class="clv-row negative">' +
            '<span class="clv-row-label">\u2212 Storno-Risiko-Abzug</span>' +
            '<span class="clv-row-calc">' + Math.round(clv.stornoRisiko * 100) + '% auf Bestands- + Cross-Selling-Wert</span>' +
            '<span class="clv-row-value">\u2212' + formatEuroCLV(clv.stornoAbzug) + '</span>' +
            '</div>';

        // Gesamt
        html += '<div class="clv-row total">' +
            '<span class="clv-row-label">= Customer Lifetime Value</span>' +
            '<span class="clv-row-calc"></span>' +
            '<span class="clv-row-value">' + formatEuroCLV(clv.gesamtCLV) + '</span>' +
            '</div>';

        breakdownRows.innerHTML = html;
    }
}

// ========================================
