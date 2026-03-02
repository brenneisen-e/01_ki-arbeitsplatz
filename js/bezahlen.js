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

// Hilfsfunktion: Datum formatieren
function bezFmtDatum(d) {
    return String(d.getDate()).padStart(2, '0') + '.' + String(d.getMonth() + 1).padStart(2, '0') + '.' + d.getFullYear();
}

// Dynamische Daten generieren - alle Daten relativ zum aktuellen Monat
function generateBezahlenData() {
    var now = new Date();
    // Vormonat als Hauptmonat (aktueller Abrechnungsmonat)
    var vm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    var vvm = new Date(now.getFullYear(), now.getMonth() - 2, 1); // Vor-Vormonat
    var vvvm = new Date(now.getFullYear(), now.getMonth() - 3, 1); // Vor-Vor-Vormonat

    // Hilfsfunktion: Tag im Vormonat
    function vmTag(tag) { return bezFmtDatum(new Date(vm.getFullYear(), vm.getMonth(), tag)); }
    // Hilfsfunktion: Tag im Vor-Vormonat
    function vvmTag(tag) { return bezFmtDatum(new Date(vvm.getFullYear(), vvm.getMonth(), tag)); }
    // Hilfsfunktion: Tag im Vor-Vor-Vormonat
    function vvvmTag(tag) { return bezFmtDatum(new Date(vvvm.getFullYear(), vvvm.getMonth(), tag)); }

    return [
        { name: 'Wohnen', amount: 1390, color: '#93b8e8', icon: bezahlenIcons.wohnen, items: [
            { name: 'Miete Wohnung', amount: 1200, datum: vmTag(1), badge: 'versichert', recurring: true, recurringLabel: 'monatlich', history: [
                { datum: vmTag(1), amount: 1200 },
                { datum: vvmTag(1), amount: 1200 },
                { datum: vvvmTag(1), amount: 1200 }
            ]},
            { name: 'Nebenkosten', amount: 120, datum: vmTag(1), recurring: true, recurringLabel: 'monatlich', history: [
                { datum: vmTag(1), amount: 120 },
                { datum: vvmTag(1), amount: 120 },
                { datum: vvvmTag(1), amount: 120 }
            ]},
            { name: 'Strom/Gas EnBW', amount: 70, datum: vmTag(3), recurring: true, recurringLabel: 'monatlich', history: [
                { datum: vmTag(3), amount: 70 },
                { datum: vvmTag(3), amount: 68 },
                { datum: vvvmTag(3), amount: 72 }
            ]}
        ]},
        { name: 'Versicherungen', amount: 530, color: '#7ecba1', icon: bezahlenIcons.versicherungen, items: [
            { name: 'Berufsunf\u00E4higkeit (ERGO)', amount: 89, datum: vmTag(1), badge: 'bekannt', vertragName: 'BU-Versicherung', recurring: true, recurringLabel: 'monatlich', history: [
                { datum: vmTag(1), amount: 89 },
                { datum: vvmTag(1), amount: 89 },
                { datum: vvvmTag(1), amount: 89 }
            ]},
            { name: 'Wohngeb\u00E4ude (VHV)', amount: 450, datum: vmTag(1), badge: 'bekannt', vertragName: 'Wohngeb\u00E4udeversicherung', recurring: true, recurringLabel: 'j\u00E4hrlich', history: [
                { datum: vmTag(1), amount: 450 }
            ]},
            { name: 'Kfz-Versicherung (Allianz)', amount: 720, datum: vvmTag(15), badge: 'bekannt', vertragName: 'Kfz-Versicherung', recurring: true, recurringLabel: 'j\u00E4hrlich', history: [
                { datum: vvmTag(15), amount: 720 }
            ]},
            { name: 'Private Haftpflicht (HDI)', amount: 72, datum: vvvmTag(1), badge: 'unbekannt', recurring: true, recurringLabel: 'j\u00E4hrlich', history: [
                { datum: vvvmTag(1), amount: 72 }
            ]},
            { name: 'Rechtsschutz (ARAG)', amount: 310, datum: vvmTag(1), badge: 'unbekannt', recurring: true, recurringLabel: 'j\u00E4hrlich', history: [
                { datum: vvmTag(1), amount: 310 }
            ]},
            { name: 'Krankenversicherung (DAK)', amount: 296, datum: vmTag(1), badge: 'unbekannt', recurring: true, recurringLabel: 'monatlich', history: [
                { datum: vmTag(1), amount: 296 },
                { datum: vvmTag(1), amount: 296 },
                { datum: vvvmTag(1), amount: 296 }
            ]},
            { name: 'Hausrat (AXA)', amount: 185, datum: vvvmTag(10), badge: 'bekannt', vertragName: 'Hausratversicherung', recurring: true, recurringLabel: 'j\u00E4hrlich', history: [
                { datum: vvvmTag(10), amount: 185 }
            ]}
        ]},
        { name: 'Kredit & Finanzierung', amount: 330, color: '#b8a9e2', icon: bezahlenIcons.kredit, items: [
            { name: 'Hypothek Sparkasse', amount: 330, datum: vmTag(5), badge: 'luecke', recurring: true, recurringLabel: 'monatlich', history: [
                { datum: vmTag(5), amount: 330 },
                { datum: vvmTag(5), amount: 330 },
                { datum: vvvmTag(5), amount: 330 }
            ]}
        ]},
        { name: 'Lebensmittel & Alltag', amount: 418, color: '#f0c78a', icon: bezahlenIcons.lebensmittel, items: [
            { name: 'REWE Supermarkt', amount: 145, datum: vmTag(8) },
            { name: 'EDEKA', amount: 95, datum: vmTag(15) },
            { name: 'dm Drogerie', amount: 35, datum: vmTag(10) },
            { name: 'Fressnapf Tiernahrung', amount: 45, datum: vmTag(12), badge: 'tier-hint', insight: 'Haustier erkannt \u2013 Versicherung pr\u00FCfen', tierRelevant: true, recurring: true, recurringLabel: 'monatlich', history: [
                { datum: vmTag(12), amount: 45 },
                { datum: vvmTag(25), amount: 32 },
                { datum: vvvmTag(3), amount: 28 }
            ]},
            { name: 'Fressnapf Online', amount: 38, datum: vmTag(19), badge: 'tier-marker', tierRelevant: true },
            { name: 'Fressnapf Tiernahrung', amount: 32, datum: vvmTag(25), badge: 'tier-marker', tierRelevant: true },
            { name: 'Fressnapf Filiale', amount: 28, datum: vvvmTag(3), badge: 'tier-marker', tierRelevant: true }
        ]},
        { name: 'Mobilit\u00E4t', amount: 130, color: '#f0a0a0', icon: bezahlenIcons.mobilitaet, items: [
            { name: 'ARAL Tankstelle', amount: 85, datum: vmTag(6) },
            { name: 'ADAC Mitgliedschaft', amount: 30, datum: vmTag(1), recurring: true, recurringLabel: 'monatlich', history: [
                { datum: vmTag(1), amount: 30 },
                { datum: vvmTag(1), amount: 30 },
                { datum: vvvmTag(1), amount: 30 }
            ]},
            { name: 'Parkhaus Innenstadt', amount: 15, datum: vmTag(9) }
        ]},
        { name: 'Freizeit & Hobbies', amount: 200, color: '#8fd4e6', icon: bezahlenIcons.freizeit, items: [
            { name: 'Restaurant / Lieferdienst', amount: 80, datum: vmTag(11) },
            { name: 'Netflix / Spotify', amount: 30, datum: vmTag(1), recurring: true, recurringLabel: 'monatlich', history: [
                { datum: vmTag(1), amount: 30 },
                { datum: vvmTag(1), amount: 30 },
                { datum: vvvmTag(1), amount: 30 }
            ]},
            { name: 'FitX Fitness', amount: 40, datum: vmTag(1), recurring: true, recurringLabel: 'monatlich', history: [
                { datum: vmTag(1), amount: 40 },
                { datum: vvmTag(1), amount: 40 },
                { datum: vvvmTag(1), amount: 40 }
            ]},
            { name: 'Skydive Academy Stuttgart', amount: 25, datum: vmTag(14), badge: 'insight', insight: 'Risikosport \u2013 Unfallvers. pr\u00FCfen!' },
            { name: 'Bungee Events GmbH', amount: 25, datum: vvmTag(22), badge: 'insight', insight: 'Extremsport \u2013 Risikopr\u00FCfung BU?' }
        ]}
    ];
}

// Pastel-Farben für den Donut - dynamisch generiert
var bezahlenData = generateBezahlenData();

function renderBezahlenContent() {
    bezahlenData = generateBezahlenData();
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

// Einzelne Transaktion HTML - mit Recurring-Cluster-Support
function buildTxItems(cat) {
    return cat.items.map(function(tx, txIdx) {
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
        if (tx.badge === 'tier-hint') badge = '<span class="bezahlen-tx-badge tier-hint"><svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12"><path d="M12 22c-4-3-8-6.58-8-10.5a4 4 0 018 0 4 4 0 018 0c0 3.92-4 7.5-8 10.5z"/><path d="M10 5.17C10 3.78 8.88 2.5 7.5 2.5S5 3.78 5 5.17c0 1.39 2.5 4.33 2.5 4.33S10 6.56 10 5.17z"/><path d="M19 5.17C19 3.78 17.88 2.5 16.5 2.5S14 3.78 14 5.17c0 1.39 2.5 4.33 2.5 4.33S19 6.56 19 5.17z"/></svg> ' + (tx.insight || '') + '</span>';
        if (tx.badge === 'tier-marker') badge = '<span class="bezahlen-tx-badge tier-marker"><svg viewBox="0 0 24 24" fill="currentColor" width="11" height="11"><path d="M12 22c-4-3-8-6.58-8-10.5a4 4 0 018 0 4 4 0 018 0c0 3.92-4 7.5-8 10.5z"/><path d="M10 5.17C10 3.78 8.88 2.5 7.5 2.5S5 3.78 5 5.17c0 1.39 2.5 4.33 2.5 4.33S10 6.56 10 5.17z"/><path d="M19 5.17C19 3.78 17.88 2.5 16.5 2.5S14 3.78 14 5.17c0 1.39 2.5 4.33 2.5 4.33S19 6.56 19 5.17z"/></svg> Tierbedarf</span>';

        var datum = tx.datum ? '<span class="bezahlen-tx-datum">' + tx.datum + '</span>' : '';

        // Recurring-Cluster: zeige Badge + aufklappbare Historie
        var recurringBadge = '';
        var recurringDetail = '';
        if (tx.recurring && tx.recurringLabel) {
            var clusterId = cat.name.replace(/\s/g, '_') + '_' + txIdx;
            recurringBadge = '<span class="bezahlen-recurring-badge' + (tx.history && tx.history.length > 1 ? '' : ' no-expand') + '"' +
                (tx.history && tx.history.length > 1 ? ' onclick="event.stopPropagation(); toggleRecurringCluster(\'' + clusterId + '\')"' : '') +
                ' title="Wiederkehrende Zahlung erkannt">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg> ' +
                tx.recurringLabel + '</span>';
            if (tx.history && tx.history.length > 1) {
                recurringDetail = '<div class="bezahlen-recurring-detail" id="recurringDetail_' + clusterId + '">' +
                    '<div class="recurring-detail-header">' +
                        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg> ' +
                        'Erkannt als <strong>' + tx.recurringLabel + '</strong> \u2013 letzte ' + tx.history.length + ' Abbuchungen:' +
                    '</div>' +
                    tx.history.map(function(h) {
                        return '<div class="recurring-history-item">' +
                            '<span class="recurring-history-datum">' + h.datum + '</span>' +
                            '<span class="recurring-history-amount">\u20AC' + h.amount + '</span>' +
                        '</div>';
                    }).join('') +
                '</div>';
            }
        }

        return '<div class="bezahlen-tx-item' + (tx.recurring ? ' has-recurring' : '') + '">' +
            '<span class="bezahlen-tx-name">' + tx.name + datum + recurringBadge + '</span>' +
            '<span class="bezahlen-tx-amount">\u20AC' + tx.amount + badge + '</span>' +
            '</div>' + recurringDetail;
    }).join('');
}

// Toggle Recurring-Cluster
function toggleRecurringCluster(clusterId) {
    var detail = document.getElementById('recurringDetail_' + clusterId);
    if (detail) {
        if (detail.classList.contains('open')) {
            detail.classList.remove('open');
        } else {
            detail.classList.add('open');
        }
    }
}
window.toggleRecurringCluster = toggleRecurringCluster;

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

// Navigation von "Hinweise aus Kontoumsätzen" zu allen Fressnapf-Umsätzen
function navigateToTierUmsaetze() {
    // 1. Zum Open Finance Tab wechseln
    switchKundenTab('fida');

    // 2. Warten bis Content gerendert, dann Bezahlen rendern + Akkordeon öffnen + scrollen
    setTimeout(function() {
        // Sicherstellen dass Bezahlen-Content gerendert ist
        if (typeof renderBezahlenContent === 'function') renderBezahlenContent();

        setTimeout(function() {
            // "Lebensmittel & Alltag" Akkordeon öffnen
            var katId = 'Lebensmittel_&_Alltag';
            var detail = document.getElementById('bezDetail_' + katId);
            var arrow = document.getElementById('bezArrow_' + katId);
            if (detail && !detail.classList.contains('open')) {
                detail.classList.add('open');
                if (arrow) arrow.classList.add('open');
            }

            // ALLE Fressnapf-Einträge finden und highlighten
            setTimeout(function() {
                var txItems = document.querySelectorAll('.bezahlen-tx-item');
                var firstMatch = null;
                txItems.forEach(function(item) {
                    item.classList.remove('highlight-vertrag');
                    if (item.textContent.indexOf('Fressnapf') !== -1) {
                        item.classList.add('highlight-vertrag');
                        if (!firstMatch) firstMatch = item;
                        setTimeout(function() { item.classList.remove('highlight-vertrag'); }, 5000);
                    }
                });
                if (firstMatch) {
                    firstMatch.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
        }, 100);
    }, 150);
}
window.navigateToTierUmsaetze = navigateToTierUmsaetze;

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
