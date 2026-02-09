// js/bezahlen.js - Bezahlen Transactions (Donut + Akkordeon Varianten)
// Extracted from landing.js for modularity

// BEZAHLEN TRANSACTIONS (3 Options)
// ========================================
var currentBezahlenOption = 0;
var bezahlenOptions = ['Option 1: Donut + Akkordeon', 'Option 2: Stacked Bar + Flat Cards', 'Option 3: Kategorie-Grid'];
var currentDonutVariant = 0;
var donutVariants = ['1A: Klassisch', '1B: Kompakt zentriert', '1C: Side-by-Side', '1D: Ring + Flat List', '1E: Mini-Karten Grid'];

var bezahlenData = [
    { name: 'Wohnen', amount: 1390, color: '#3b82f6', icon: '\uD83C\uDFE0', items: [
        { name: 'Miete Wohnung', amount: 1200, datum: '01.11.2025', badge: 'versichert' },
        { name: 'Nebenkosten', amount: 120, datum: '01.11.2025' },
        { name: 'Strom/Gas EnBW', amount: 70, datum: '03.11.2025' }
    ]},
    { name: 'Versicherungen', amount: 520, color: '#10b981', icon: '\uD83D\uDEE1\uFE0F', items: [
        { name: 'Berufsunf\u00E4higkeit (ERGO)', amount: 89, datum: '01.11.2025', badge: 'versichert' },
        { name: 'Wohngeb\u00E4ude (VHV)', amount: 38, datum: '01.11.2025', badge: 'versichert' },
        { name: 'Kfz-Versicherung (Allianz)', amount: 60, datum: '01.11.2025', badge: 'luecke' },
        { name: 'Private Haftpflicht', amount: 12, datum: '01.11.2025', badge: 'versichert' },
        { name: 'Rechtsschutz', amount: 25, datum: '01.11.2025' },
        { name: 'Krankenversicherung', amount: 296, datum: '01.11.2025' }
    ]},
    { name: 'Kredit & Finanzierung', amount: 330, color: '#8b5cf6', icon: '\uD83C\uDFE6', items: [
        { name: 'Hypothek Sparkasse', amount: 330, datum: '05.11.2025', badge: 'luecke' }
    ]},
    { name: 'Lebensmittel & Alltag', amount: 320, color: '#f59e0b', icon: '\uD83D\uDED2', items: [
        { name: 'REWE Supermarkt', amount: 145, datum: '08.11.2025' },
        { name: 'EDEKA', amount: 95, datum: '15.11.2025' },
        { name: 'dm Drogerie', amount: 35, datum: '10.11.2025' },
        { name: 'Fressnapf Tiernahrung', amount: 45, datum: '12.11.2025', badge: 'insight', insight: 'Tierhalter \u2013 Haftpflicht/KV?' }
    ]},
    { name: 'Mobilit\u00E4t', amount: 130, color: '#ef4444', icon: '\uD83D\uDE97', items: [
        { name: 'ARAL Tankstelle', amount: 85, datum: '06.11.2025' },
        { name: 'ADAC Mitgliedschaft', amount: 30, datum: '01.11.2025' },
        { name: 'Parkhaus Innenstadt', amount: 15, datum: '09.11.2025' }
    ]},
    { name: 'Freizeit & Hobbies', amount: 200, color: '#06b6d4', icon: '\uD83C\uDFAD', items: [
        { name: 'Restaurant / Lieferdienst', amount: 80, datum: '11.11.2025' },
        { name: 'Netflix / Spotify', amount: 30, datum: '01.11.2025' },
        { name: 'FitX Fitness', amount: 40, datum: '01.11.2025' },
        { name: 'Skydive Academy Stuttgart', amount: 25, datum: '14.11.2025', badge: 'insight', insight: 'Risikosport \u2013 Unfallvers. pr\u00FCfen!' },
        { name: 'Bungee Events GmbH', amount: 25, datum: '22.10.2025', badge: 'insight', insight: 'Extremsport \u2013 Risikopr\u00FCfung BU?' }
    ]}
];

function switchBezahlenOption(direction) {
    currentBezahlenOption = (currentBezahlenOption + direction + bezahlenOptions.length) % bezahlenOptions.length;
    var label = document.getElementById('bezahlenOptionLabel');
    if (label) label.textContent = bezahlenOptions[currentBezahlenOption];
    renderBezahlenContent();
}
window.switchBezahlenOption = switchBezahlenOption;

function switchDonutVariant(direction) {
    currentDonutVariant = (currentDonutVariant + direction + donutVariants.length) % donutVariants.length;
    var label = document.getElementById('donutVariantLabel');
    if (label) label.textContent = donutVariants[currentDonutVariant];
    renderBezahlenContent();
}
window.switchDonutVariant = switchDonutVariant;

function renderBezahlenContent() {
    var container = document.getElementById('bezahlenContent');
    if (!container) return;
    var total = bezahlenData.reduce(function(s, c) { return s + c.amount; }, 0);

    var content = '';
    switch (currentBezahlenOption) {
        case 0:
            // Sub-switcher for Donut+Akkordeon variants
            content += '<div class="donut-variant-switcher">' +
                '<span class="option-switcher-arrow" onclick="switchDonutVariant(-1)">&lsaquo;</span>' +
                '<span class="option-switcher-label" id="donutVariantLabel">' + donutVariants[currentDonutVariant] + '</span>' +
                '<span class="option-switcher-arrow" onclick="switchDonutVariant(1)">&rsaquo;</span></div>';
            switch (currentDonutVariant) {
                case 0: content += renderBezahlenDonutA(total); break;
                case 1: content += renderBezahlenDonutB(total); break;
                case 2: content += renderBezahlenDonutC(total); break;
                case 3: content += renderBezahlenDonutD(total); break;
                case 4: content += renderBezahlenDonutE(total); break;
            }
            container.innerHTML = content;
            break;
        case 1: container.innerHTML = renderBezahlenStacked(total); break;
        case 2: container.innerHTML = renderBezahlenGrid(total); break;
    }
}

// Shared helper: generate donut SVG
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

// Shared helper: build tx items HTML
function buildTxItems(cat) {
    return cat.items.map(function(tx) {
        var badge = '';
        if (tx.badge === 'versichert') badge = '<span class="bezahlen-tx-badge versichert">Versichert</span>';
        if (tx.badge === 'luecke') badge = '<span class="bezahlen-tx-badge luecke">L\u00FCcke</span>';
        if (tx.badge === 'insight') badge = '<span class="bezahlen-tx-badge insight">\u26A0 ' + (tx.insight || '') + '</span>';
        var datum = tx.datum ? '<span class="bezahlen-tx-datum">' + tx.datum + '</span>' : '';
        return '<div class="bezahlen-tx-item"><span class="bezahlen-tx-name">' + tx.name + datum + '</span><span class="bezahlen-tx-amount">\u20AC' + tx.amount + badge + '</span></div>';
    }).join('');
}

// Shared helper: build standard akkordeon
function buildAkkordeon() {
    return bezahlenData.map(function(cat) {
        return '<div class="bezahlen-kat-header" onclick="toggleBezahlenKat(\'' + cat.name + '\')">' +
            '<span class="bezahlen-kat-dot" style="background:' + cat.color + '"></span>' +
            '<span class="bezahlen-kat-name">' + cat.name + '</span>' +
            '<span class="bezahlen-kat-amount">\u20AC' + cat.amount + '/Mon.</span>' +
            '<span class="bezahlen-kat-arrow" id="bezArrow_' + cat.name.replace(/\s/g,'_') + '">\u25BC</span></div>' +
            '<div class="bezahlen-kat-detail" id="bezDetail_' + cat.name.replace(/\s/g,'_') + '">' + buildTxItems(cat) + '</div>';
    }).join('');
}

// Variant A: Klassisch - Donut links + Legende rechts, Akkordeon darunter
function renderBezahlenDonutA(total) {
    var donutSvg = buildDonutSvg(total, 140, 20);
    var legend = bezahlenData.map(function(cat) {
        return '<div class="bezahlen-legend-item" onclick="toggleBezahlenKat(\'' + cat.name + '\')">' +
            '<span class="bezahlen-legend-dot" style="background:' + cat.color + '"></span>' +
            '<span class="bezahlen-legend-label">' + cat.name + '</span>' +
            '<span class="bezahlen-legend-value">\u20AC' + cat.amount + '</span></div>';
    }).join('');
    return '<div class="bezahlen-donut-container"><div class="bezahlen-donut-chart">' + donutSvg + '</div><div class="bezahlen-donut-legend">' + legend + '</div></div>' +
        '<div class="bezahlen-akkordeon">' + buildAkkordeon() + '</div>';
}

// Variant B: Kompakt zentriert - Donut mittig oben, darunter Legende als Chips, dann Akkordeon
function renderBezahlenDonutB(total) {
    var donutSvg = buildDonutSvg(total, 120, 16);
    var chips = bezahlenData.map(function(cat) {
        var pct = (cat.amount / total * 100).toFixed(0);
        return '<span class="bezahlen-chip" onclick="toggleBezahlenKat(\'' + cat.name + '\')" style="border-color:' + cat.color + ';color:' + cat.color + '">' +
            cat.icon + ' ' + cat.name + ' <strong>' + pct + '%</strong></span>';
    }).join('');
    return '<div class="bezahlen-donut-centered"><div class="bezahlen-donut-chart">' + donutSvg + '</div>' +
        '<div class="bezahlen-chips">' + chips + '</div></div>' +
        '<div class="bezahlen-akkordeon">' + buildAkkordeon() + '</div>';
}

// Variant C: Side-by-Side - Donut links, Akkordeon rechts (kein Legende-Block)
function renderBezahlenDonutC(total) {
    var donutSvg = buildDonutSvg(total, 160, 22);
    return '<div class="bezahlen-side-by-side">' +
        '<div class="bezahlen-side-donut">' + donutSvg + '</div>' +
        '<div class="bezahlen-side-akkordeon"><div class="bezahlen-akkordeon">' + buildAkkordeon() + '</div></div>' +
        '</div>';
}

// Variant D: Ring + Flat List - Thin ring, all transactions visible, no accordion collapse
function renderBezahlenDonutD(total) {
    var cx = 80, cy = 80, r = 65;
    var circ = 2 * Math.PI * r;
    var offset = 0;
    var paths = '';
    bezahlenData.forEach(function(cat) {
        var pct = cat.amount / total;
        var dash = pct * circ;
        paths += '<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="'+cat.color+'" stroke-width="10" stroke-dasharray="'+dash+' '+(circ-dash)+'" stroke-dashoffset="'+(-offset)+'" transform="rotate(-90 '+cx+' '+cy+')"/>';
        offset += dash;
    });
    var ring = '<svg width="160" height="160" viewBox="0 0 160 160">' + paths +
        '<text x="80" y="75" text-anchor="middle" font-size="18" font-weight="700" fill="#1e293b">\u20AC' + total + '</text>' +
        '<text x="80" y="93" text-anchor="middle" font-size="10" fill="#94a3b8">/Monat</text></svg>';

    var flatList = bezahlenData.map(function(cat) {
        var txRows = cat.items.map(function(tx) {
            var badge = '';
            if (tx.badge === 'versichert') badge = '<span class="bezahlen-tx-badge versichert">Versichert</span>';
            if (tx.badge === 'luecke') badge = '<span class="bezahlen-tx-badge luecke">L\u00FCcke</span>';
            if (tx.badge === 'insight') badge = '<span class="bezahlen-tx-badge insight">\u26A0 ' + (tx.insight || '') + '</span>';
            var datum = tx.datum ? '<span class="bezahlen-tx-datum">' + tx.datum + '</span>' : '';
            return '<div class="bezahlen-flat-tx"><span class="bezahlen-tx-name">' + tx.name + datum + '</span><span class="bezahlen-tx-amount">\u20AC' + tx.amount + badge + '</span></div>';
        }).join('');
        return '<div class="bezahlen-flat-group">' +
            '<div class="bezahlen-flat-group-header"><span class="bezahlen-kat-dot" style="background:' + cat.color + '"></span>' +
            '<span>' + cat.icon + ' ' + cat.name + '</span><strong>\u20AC' + cat.amount + '</strong></div>' +
            txRows + '</div>';
    }).join('');

    return '<div class="bezahlen-ring-container"><div class="bezahlen-ring-chart">' + ring + '</div>' +
        '<div class="bezahlen-flat-list">' + flatList + '</div></div>';
}

// Variant E: Mini-Karten Grid - Kleine Donut pro Kategorie + expandable
function renderBezahlenDonutE(total) {
    var cards = bezahlenData.map(function(cat) {
        var pct = cat.amount / total;
        var r = 24, circ = 2 * Math.PI * r;
        var dash = pct * circ;
        var miniDonut = '<svg width="56" height="56" viewBox="0 0 56 56">' +
            '<circle cx="28" cy="28" r="'+r+'" fill="none" stroke="#e2e8f0" stroke-width="5"/>' +
            '<circle cx="28" cy="28" r="'+r+'" fill="none" stroke="'+cat.color+'" stroke-width="5" stroke-dasharray="'+dash+' '+(circ-dash)+'" stroke-dashoffset="0" transform="rotate(-90 28 28)"/>' +
            '<text x="28" y="32" text-anchor="middle" font-size="11" font-weight="700" fill="'+cat.color+'">'+(pct*100).toFixed(0)+'%</text></svg>';
        var txItems = buildTxItems(cat);
        var safeId = cat.name.replace(/\s/g,'_');
        return '<div class="bezahlen-mini-card">' +
            '<div class="bezahlen-mini-card-header" onclick="toggleBezahlenKat(\'' + cat.name + '\')">' +
            '<div class="bezahlen-mini-donut">' + miniDonut + '</div>' +
            '<div class="bezahlen-mini-info"><div class="bezahlen-mini-name">' + cat.icon + ' ' + cat.name + '</div>' +
            '<div class="bezahlen-mini-amount">\u20AC' + cat.amount + '/Mon.</div></div>' +
            '<span class="bezahlen-kat-arrow" id="bezArrow_' + safeId + '">\u25BC</span></div>' +
            '<div class="bezahlen-kat-detail" id="bezDetail_' + safeId + '">' + txItems + '</div></div>';
    }).join('');
    return '<div class="bezahlen-mini-grid">' + cards + '</div>';
}

function renderBezahlenStacked(total) {
    var bar = bezahlenData.map(function(cat) {
        var pct = (cat.amount / total * 100).toFixed(1);
        return '<div class="bezahlen-bar-segment" style="width:' + pct + '%;background:' + cat.color + '" title="' + cat.name + ': \u20AC' + cat.amount + '">' +
            (parseFloat(pct) > 8 ? pct + '%' : '') + '</div>';
    }).join('');

    var cards = bezahlenData.map(function(cat) {
        var pct = (cat.amount / total * 100).toFixed(0);
        return '<div class="bezahlen-flat-card" style="border-left-color:' + cat.color + '">' +
            '<span class="bezahlen-flat-card-name">' + cat.name + '</span>' +
            '<span class="bezahlen-flat-card-amount">\u20AC' + cat.amount + '/Mon.</span>' +
            '<span class="bezahlen-flat-card-pct">' + pct + '%</span></div>';
    }).join('');

    return '<div class="bezahlen-stacked-bar">' + bar + '</div><div class="bezahlen-flat-cards">' + cards + '</div>';
}

function renderBezahlenGrid(total) {
    var cards = bezahlenData.map(function(cat) {
        var pct = (cat.amount / total * 100).toFixed(0);
        return '<div class="bezahlen-grid-card" style="border-top:3px solid ' + cat.color + '">' +
            '<div class="bezahlen-grid-card-icon">' + cat.icon + '</div>' +
            '<div class="bezahlen-grid-card-name">' + cat.name + '</div>' +
            '<div class="bezahlen-grid-card-amount">\u20AC' + cat.amount + '</div>' +
            '<div class="bezahlen-grid-card-pct">' + pct + '% der Ausgaben</div></div>';
    }).join('');
    return '<div class="bezahlen-grid-cards">' + cards + '</div>';
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
