// js/bezahlen.js - Bezahlen Transactions (Donut Kompakt zentriert)
// Extracted from landing.js for modularity

// SVG icon helper - moderne einfarbige Icons
var bezahlenIcons = {
    wohnen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    versicherungen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    kredit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>',
    lebensmittel: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>',
    mobilitaet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><path d="M14 16H9m10 0h3v-3.15a1 1 0 00-.84-.99L16 11l-2.7-3.6a1 1 0 00-.8-.4H5.24a2 2 0 00-1.8 1.1l-.8 1.63A6 6 0 002 12.28V16h2.05"/><circle cx="6.5" cy="16.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/></svg>',
    freizeit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>'
};

// Pastel-Farben für den Donut
var bezahlenData = [
    { name: 'Wohnen', amount: 1390, color: '#93b8e8', icon: bezahlenIcons.wohnen, items: [
        { name: 'Miete Wohnung', amount: 1200, datum: '01.11.2025', badge: 'versichert' },
        { name: 'Nebenkosten', amount: 120, datum: '01.11.2025' },
        { name: 'Strom/Gas EnBW', amount: 70, datum: '03.11.2025' }
    ]},
    { name: 'Versicherungen', amount: 520, color: '#7ecba1', icon: bezahlenIcons.versicherungen, items: [
        { name: 'Berufsunf\u00E4higkeit (ERGO)', amount: 89, datum: '01.11.2025', badge: 'bekannt', vertragName: 'BU-Versicherung' },
        { name: 'Wohngeb\u00E4ude (VHV)', amount: 38, datum: '01.11.2025', badge: 'bekannt', vertragName: 'Wohngeb\u00E4udeversicherung' },
        { name: 'Kfz-Versicherung (Allianz)', amount: 60, datum: '01.11.2025', badge: 'unbekannt' },
        { name: 'Private Haftpflicht', amount: 12, datum: '01.11.2025', badge: 'bekannt', vertragName: 'Privathaftpflicht' },
        { name: 'Rechtsschutz', amount: 25, datum: '01.11.2025', badge: 'unbekannt' },
        { name: 'Krankenversicherung', amount: 296, datum: '01.11.2025', badge: 'bekannt', vertragName: 'Krankenversicherung' }
    ]},
    { name: 'Kredit & Finanzierung', amount: 330, color: '#b8a9e2', icon: bezahlenIcons.kredit, items: [
        { name: 'Hypothek Sparkasse', amount: 330, datum: '05.11.2025', badge: 'luecke' }
    ]},
    { name: 'Lebensmittel & Alltag', amount: 320, color: '#f0c78a', icon: bezahlenIcons.lebensmittel, items: [
        { name: 'REWE Supermarkt', amount: 145, datum: '08.11.2025' },
        { name: 'EDEKA', amount: 95, datum: '15.11.2025' },
        { name: 'dm Drogerie', amount: 35, datum: '10.11.2025' },
        { name: 'Fressnapf Tiernahrung', amount: 45, datum: '12.11.2025', badge: 'insight', insight: 'Tierhalter \u2013 Haftpflicht/KV?' }
    ]},
    { name: 'Mobilit\u00E4t', amount: 130, color: '#f0a0a0', icon: bezahlenIcons.mobilitaet, items: [
        { name: 'ARAL Tankstelle', amount: 85, datum: '06.11.2025' },
        { name: 'ADAC Mitgliedschaft', amount: 30, datum: '01.11.2025' },
        { name: 'Parkhaus Innenstadt', amount: 15, datum: '09.11.2025' }
    ]},
    { name: 'Freizeit & Hobbies', amount: 200, color: '#8fd4e6', icon: bezahlenIcons.freizeit, items: [
        { name: 'Restaurant / Lieferdienst', amount: 80, datum: '11.11.2025' },
        { name: 'Netflix / Spotify', amount: 30, datum: '01.11.2025' },
        { name: 'FitX Fitness', amount: 40, datum: '01.11.2025' },
        { name: 'Skydive Academy Stuttgart', amount: 25, datum: '14.11.2025', badge: 'insight', insight: 'Risikosport \u2013 Unfallvers. pr\u00FCfen!' },
        { name: 'Bungee Events GmbH', amount: 25, datum: '22.10.2025', badge: 'insight', insight: 'Extremsport \u2013 Risikopr\u00FCfung BU?' }
    ]}
];

function renderBezahlenContent() {
    var container = document.getElementById('bezahlenContent');
    if (!container) return;
    var total = bezahlenData.reduce(function(s, c) { return s + c.amount; }, 0);

    // Donut Kompakt zentriert (1B)
    var donutSvg = buildDonutSvg(total, 120, 16);
    var chips = bezahlenData.map(function(cat) {
        var pct = (cat.amount / total * 100).toFixed(0);
        return '<span class="bezahlen-chip" onclick="toggleBezahlenKat(\'' + cat.name + '\')" style="border-color:' + cat.color + ';color:' + cat.color + '">' +
            cat.icon + ' ' + cat.name + ' <strong>' + pct + '%</strong></span>';
    }).join('');
    var content = '<div class="bezahlen-donut-centered"><div class="bezahlen-donut-chart">' + donutSvg + '</div>' +
        '<div class="bezahlen-chips">' + chips + '</div></div>' +
        '<div class="bezahlen-akkordeon">' + buildAkkordeon() + '</div>';
    container.innerHTML = content;
}

// Donut SVG generieren
function buildDonutSvg(total, svgSize, strokeW) {
    var cx = svgSize/2, cy = svgSize/2, r = svgSize/2 - strokeW/2 - 5;
    var circ = 2 * Math.PI * r;
    var offset = 0;
    var paths = '';
    bezahlenData.forEach(function(cat) {
        var pct = cat.amount / total;
        var dash = pct * circ;
        paths += '<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="'+cat.color+'" stroke-width="'+strokeW+'" stroke-dasharray="'+dash+' '+(circ-dash)+'" stroke-dashoffset="'+(-offset)+'" transform="rotate(-90 '+cx+' '+cy+')"/>';
        offset += dash;
    });
    return '<svg width="'+svgSize+'" height="'+svgSize+'" viewBox="0 0 '+svgSize+' '+svgSize+'">'+paths+
        '<text x="'+cx+'" y="'+(cy-5)+'" text-anchor="middle" font-size="'+(svgSize>120?16:13)+'" font-weight="700" fill="#1e293b">\u20AC'+total+'</text>'+
        '<text x="'+cx+'" y="'+(cy+12)+'" text-anchor="middle" font-size="'+(svgSize>120?10:9)+'" fill="#94a3b8">/Monat</text></svg>';
}

// Einzelne Transaktion HTML
function buildTxItems(cat) {
    return cat.items.map(function(tx) {
        var badge = '';
        if (tx.badge === 'bekannt') {
            badge = '<span class="bezahlen-tx-badge bekannt" onclick="event.stopPropagation(); navigateToVertrag(\'' + (tx.vertragName || tx.name).replace(/'/g, "\\'") + '\')" title="In Betreuten Vertr\u00E4gen bekannt \u2013 Klicken zum Anzeigen">bekannt</span>';
        }
        if (tx.badge === 'unbekannt') {
            badge = '<span class="bezahlen-tx-badge unbekannt" title="Nicht in Betreuten Vertr\u00E4gen \u2013 nur aus Kontoumsatz erkannt">unbekannt</span>';
        }
        if (tx.badge === 'versichert') badge = '<span class="bezahlen-tx-badge versichert">Versichert</span>';
        if (tx.badge === 'luecke') badge = '<span class="bezahlen-tx-badge luecke">L\u00FCcke</span>';
        if (tx.badge === 'insight') badge = '<span class="bezahlen-tx-badge insight">\u26A0 ' + (tx.insight || '') + '</span>';
        var datum = tx.datum ? '<span class="bezahlen-tx-datum">' + tx.datum + '</span>' : '';
        return '<div class="bezahlen-tx-item"><span class="bezahlen-tx-name">' + tx.name + datum + '</span><span class="bezahlen-tx-amount">\u20AC' + tx.amount + badge + '</span></div>';
    }).join('');
}

// Navigation zu Betreute Verträge mit Highlight
function navigateToVertrag(vertragName) {
    switchKundenTab('vertraege');
    setTimeout(function() {
        var rows = document.querySelectorAll('#betreuteVertraegeTable tr');
        rows.forEach(function(row) {
            row.classList.remove('highlight-vertrag');
            if (row.textContent.indexOf(vertragName) !== -1 || row.textContent.toLowerCase().indexOf(vertragName.toLowerCase()) !== -1) {
                row.classList.add('highlight-vertrag');
                row.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setTimeout(function() { row.classList.remove('highlight-vertrag'); }, 3000);
            }
        });
    }, 200);
}
window.navigateToVertrag = navigateToVertrag;

// Akkordeon-Liste
function buildAkkordeon() {
    return bezahlenData.map(function(cat) {
        return '<div class="bezahlen-kat-header" onclick="toggleBezahlenKat(\'' + cat.name + '\')">' +
            '<span class="bezahlen-kat-dot" style="background:' + cat.color + '"></span>' +
            '<span class="bezahlen-kat-icon">' + cat.icon + '</span>' +
            '<span class="bezahlen-kat-name">' + cat.name + '</span>' +
            '<span class="bezahlen-kat-amount">\u20AC' + cat.amount + '/Mon.</span>' +
            '<span class="bezahlen-kat-arrow" id="bezArrow_' + cat.name.replace(/\s/g,'_') + '">\u25BC</span></div>' +
            '<div class="bezahlen-kat-detail" id="bezDetail_' + cat.name.replace(/\s/g,'_') + '">' + buildTxItems(cat) + '</div>';
    }).join('');
}

function toggleBezahlenKat(katName) {
    var id = katName.replace(/\s/g, '_');
    var detail = document.getElementById('bezDetail_' + id);
    var arrow = document.getElementById('bezArrow_' + id);
    if (detail) {
        if (detail.classList.contains('open')) {
            detail.classList.remove('open');
            if (arrow) arrow.classList.remove('open');
        } else {
            detail.classList.add('open');
            if (arrow) arrow.classList.add('open');
        }
    }
}
window.toggleBezahlenKat = toggleBezahlenKat;

// ========================================
