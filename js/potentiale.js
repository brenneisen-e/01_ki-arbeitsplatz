// js/potentiale.js - Potentiale/Impulse Display Options
// Extracted from landing.js for modularity

// IMPULSE DISPLAY OPTIONS (3 Options)
// ========================================
var currentImpulseOption = 0;
var impulseOptions = ['Option 1: Kartenansicht', 'Option 2: Kanban-Board', 'Option 3: Kompakte Tabelle'];

var impulseData = [
    { id: 'kb-risiko', title: 'Risikolebensversicherung anbieten', desc: 'Hypothek \u20AC285.000 bei Sparkasse ohne Restschuldversicherung', kategorie: 'whitespots', prioritaet: 'high', source: 'Open Finance',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
      herleitung: [
        { label: 'Datenquelle', value: 'Open Finance - Kreditdaten (Sparkasse)' },
        { label: 'Erkannte Situation', value: 'Baufinanzierung \u20AC285.000 ohne Absicherung' },
        { label: 'Familiensituation', value: 'Verheiratet, 2 Kinder (8 + 5 Jahre)' },
        { label: 'Empfehlung', value: 'Risikoleben \u20AC300.000, Laufzeit 20 Jahre, ca. \u20AC25/Monat' }
      ]
    },
    { id: 'kb-fonds', title: 'Fondspolice anbieten', desc: 'Depot \u20AC85.000 bei DWS, Sparrate \u20AC800/Mon. ohne Steueroptimierung', kategorie: 'whitespots', prioritaet: 'high', source: 'Open Finance',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
      herleitung: [
        { label: 'Datenquelle', value: 'Open Finance - Investmentdaten (DWS)' },
        { label: 'Erkannte Situation', value: 'Hohe Sparrate \u20AC800/Mon., Depot \u20AC85.000 ohne Steueroptimierung' },
        { label: 'Empfehlung', value: 'Fondsgebundene Rentenversicherung mit Steuervorteil + Todesfallschutz' }
      ]
    },
    { id: 'kb-kfz', title: 'Kfz-Wechsel anbieten', desc: 'Kfz bei Allianz l\u00E4uft aus, Ersparnis ca. \u20AC180/Jahr m\u00F6glich', kategorie: 'anpassung', prioritaet: 'high', source: 'Open Finance',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10l-3-5H7L4 10l-2.5 1.1C.7 11.3 0 12.1 0 13v3c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>',
      herleitung: [
        { label: 'Datenquelle', value: 'Open Finance - Versicherungsdaten (Allianz)' },
        { label: 'Erkannte Situation', value: 'Kfz-Vertrag endet 30.11.2025, Wechselm\u00F6glichkeit' },
        { label: 'Aktueller Tarif', value: 'Allianz Premium, SF12, \u20AC720/Jahr' },
        { label: 'Empfehlung', value: 'Vergleichsangebot mit ca. \u20AC180/Jahr Ersparnis' }
      ]
    },
    { id: 'kb-bu', title: 'BU-Absicherung pr\u00FCfen', desc: 'Einkommensst\u00E4rke vs. BU-Rente pr\u00FCfen, ggf. erh\u00F6hen', kategorie: 'anpassung', prioritaet: 'medium', source: 'Bestandsdaten',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>',
      herleitung: [
        { label: 'Datenquelle', value: 'Bestandsdaten + Open Finance Gehalt' },
        { label: 'Erkannte Situation', value: 'Nettoeinkommen \u20AC3.834 vs. BU-Rente \u20AC1.500 (39%)' },
        { label: 'Empfehlung', value: 'BU-Rente auf mind. 60% erh\u00F6hen (\u20AC2.300)' }
      ]
    },
    { id: 'kb-rs', title: 'Rechtsschutz Cross-Sell', desc: 'Kein Rechtsschutz vorhanden, Familie mit Immobilienbesitz', kategorie: 'whitespots', prioritaet: 'medium', source: 'Bestandsdaten',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>',
      herleitung: [
        { label: 'Datenquelle', value: 'Bestandsdaten' },
        { label: 'Erkannte Situation', value: 'Kein Rechtsschutz, aber Immobilie + Familie' },
        { label: 'Empfehlung', value: 'Privat- und Immobilienrechtsschutz, ca. \u20AC25/Monat' }
      ]
    },
    { id: 'kb-tier', title: 'Tierhalter-Haftpflicht pr\u00FCfen', desc: 'Hinweise auf Tierhaltung aus Kontoumsätzen (Fressnapf, Tierarzt)', kategorie: 'whitespots', prioritaet: 'low', source: 'Open Finance',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><path d="M10 5.172C10 3.782 8.884 2.5 7.5 2.5S5 3.782 5 5.172c0 1.39 2.5 4.328 2.5 4.328S10 6.562 10 5.172z"/><path d="M19 5.172C19 3.782 17.884 2.5 16.5 2.5S14 3.782 14 5.172c0 1.39 2.5 4.328 2.5 4.328S19 6.562 19 5.172z"/><path d="M12 22c-4-3-8-6.58-8-10.5a4 4 0 018 0 4 4 0 018 0c0 3.92-4 7.5-8 10.5z"/></svg>',
      herleitung: [
        { label: 'Datenquelle', value: 'Open Finance - Kontoumsätze (Sparkasse)' },
        { label: 'Erkannte Transaktionen', value: 'Fressnapf (\u20AC45/Mon.), Tierarztpraxis Dr. M\u00FCller (\u20AC120, Sep. 2025)' },
        { label: 'Erkannte Situation', value: 'Regelm\u00E4\u00DFige Tierhaltungsausgaben, kein Tierhalterhaftpflicht-Vertrag bekannt' },
        { label: 'Empfehlung', value: 'Tierhalterhaftpflicht (Hund) ab ca. \u20AC5/Monat' }
      ]
    },
    { id: 'kb-hausrat', title: 'Hausratversicherung pr\u00FCfen', desc: 'Wohnfl\u00E4che und Wertgegenst\u00E4nde ggf. unterversichert', kategorie: 'anpassung', prioritaet: 'low', source: 'Bestandsdaten',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
      herleitung: [
        { label: 'Datenquelle', value: 'Bestandsdaten' },
        { label: 'Erkannte Situation', value: 'Letzte Anpassung vor 5 Jahren, Wohnfl\u00E4che 120m\u00B2' },
        { label: 'Empfehlung', value: 'Deckungssumme pr\u00FCfen, ggf. Fahrraddiebstahl erg\u00E4nzen' }
      ]
    },
    { id: 'kb-umschuldung', title: 'Umschuldung Konsumentenkredit', desc: 'Targobank Kredit 9,0% p.a. \u2013 Umschuldung zu 4,9% m\u00F6glich', kategorie: 'anpassung', prioritaet: 'low', source: 'Open Finance',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>',
      herleitung: [
        { label: 'Datenquelle', value: 'Open Finance - Kreditdaten (Targobank)' },
        { label: 'Erkannte Situation', value: 'Restschuld \u20AC12.500, Zinssatz 9,0% p.a., noch 36 Mon. Laufzeit' },
        { label: 'Empfehlung', value: 'Umschuldung zu Santander (ERGO-Partner) mit 4,9% p.a., Ersparnis ca. \u20AC750' }
      ]
    }
];

function switchImpulseOption(direction) {
    currentImpulseOption = (currentImpulseOption + direction + impulseOptions.length) % impulseOptions.length;
    var label = document.getElementById('impulseOptionLabel');
    if (label) label.textContent = impulseOptions[currentImpulseOption];
    renderImpulseContent();
}
window.switchImpulseOption = switchImpulseOption;

function renderImpulseContent() {
    var container = document.getElementById('impulseContent');
    if (!container) return;

    switch (currentImpulseOption) {
        case 0: // Kartenansicht (existing HTML - show it)
            var existingCards = container.querySelectorAll('.impuls-kategorie, .impuls-actions');
            existingCards.forEach(function(el) { el.style.display = ''; });
            var kanban = container.querySelector('.impulse-kanban');
            if (kanban) kanban.remove();
            var table = container.querySelector('.impulse-table-wrap');
            if (table) table.remove();
            break;
        case 1: // Kanban Board
            hideExistingImpulse(container);
            removeAltImpulse(container);
            var kanbanHtml = renderImpulseKanban();
            var div = document.createElement('div');
            div.className = 'impulse-kanban';
            div.innerHTML = kanbanHtml;
            container.appendChild(div);
            break;
        case 2: // Kompakte Tabelle mit aufklappbaren Details
            hideExistingImpulse(container);
            removeAltImpulse(container);
            var tableHtml = renderImpulseTable();
            var div2 = document.createElement('div');
            div2.className = 'impulse-table-wrap';
            div2.innerHTML = tableHtml;
            container.appendChild(div2);
            break;
    }
}

function hideExistingImpulse(container) {
    var existing = container.querySelectorAll('.impuls-kategorie, .impuls-actions');
    existing.forEach(function(el) { el.style.display = 'none'; });
}

function removeAltImpulse(container) {
    var k = container.querySelector('.impulse-kanban');
    if (k) k.remove();
    var t = container.querySelector('.impulse-table-wrap');
    if (t) t.remove();
}

// SVG Icons for action buttons
var actionIcons = {
    angebot: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>',
    termin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>'
};

function renderImpulseKanban() {
    var high = impulseData.filter(function(i) { return i.prioritaet === 'high'; });
    var medium = impulseData.filter(function(i) { return i.prioritaet === 'medium'; });
    var low = impulseData.filter(function(i) { return i.prioritaet === 'low'; });

    function renderCol(items) {
        return items.map(function(i) {
            var herleitungHtml = '';
            if (i.herleitung && i.herleitung.length > 0) {
                herleitungHtml = '<div class="kanban-detail" id="kanban-detail-' + i.id + '" style="display:none;">' +
                    '<div class="kanban-detail-title">Herleitung</div>' +
                    i.herleitung.map(function(h) {
                        return '<div class="kanban-detail-row"><span class="kanban-detail-label">' + h.label + '</span><span class="kanban-detail-value">' + h.value + '</span></div>';
                    }).join('') +
                    '<div class="kanban-detail-actions">' +
                    '<button class="action-btn primary small icon-only" onclick="event.stopPropagation()" title="Angebot erstellen">' + actionIcons.angebot + '</button>' +
                    '<button class="action-btn secondary small icon-only" onclick="event.stopPropagation()" title="Termin vereinbaren">' + actionIcons.termin + '</button></div></div>';
            }
            return '<div class="impulse-kanban-card" onclick="toggleKanbanDetail(\'' + i.id + '\')">' +
                '<div class="impulse-kanban-card-header">' +
                '<span class="impulse-kanban-card-icon">' + i.icon + '</span>' +
                '<div class="impulse-kanban-card-title">' + i.title + '</div>' +
                '<span class="impulse-kanban-card-expand" id="kanban-arrow-' + i.id + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="6 9 12 15 18 9"/></svg></span></div>' +
                '<div class="impulse-kanban-card-desc">' + i.desc + '</div>' +
                '<div class="impulse-kanban-card-footer"><span class="impulse-kanban-card-badge ' + i.kategorie + '">' + (i.kategorie === 'whitespots' ? 'Neugesch\u00E4ft' : 'Anpassung') + '</span>' +
                '<span class="impulse-kanban-card-source">' + i.source + '</span></div>' +
                herleitungHtml + '</div>';
        }).join('');
    }

    return '<div class="impulse-kanban-col"><div class="impulse-kanban-col-title high">Hohe Priorit\u00E4t (' + high.length + ')</div>' + renderCol(high) + '</div>' +
        '<div class="impulse-kanban-col"><div class="impulse-kanban-col-title medium">Mittlere Priorit\u00E4t (' + medium.length + ')</div>' + renderCol(medium) + '</div>' +
        '<div class="impulse-kanban-col"><div class="impulse-kanban-col-title low">Niedrige Priorit\u00E4t (' + low.length + ')</div>' + renderCol(low) + '</div>';
}

function toggleKanbanDetail(id) {
    var detail = document.getElementById('kanban-detail-' + id);
    var arrow = document.getElementById('kanban-arrow-' + id);
    if (!detail) return;
    if (detail.style.display === 'none') {
        detail.style.display = 'block';
        if (arrow) arrow.classList.add('open');
    } else {
        detail.style.display = 'none';
        if (arrow) arrow.classList.remove('open');
    }
}
window.toggleKanbanDetail = toggleKanbanDetail;

// Option 3: Kompakte Tabelle mit aufklappbaren Detail-Zeilen
function renderImpulseTable() {
    var rows = impulseData.map(function(i) {
        var prioLabel = i.prioritaet === 'high' ? 'Hoch' : (i.prioritaet === 'medium' ? 'Mittel' : 'Niedrig');
        var katLabel = i.kategorie === 'whitespots' ? 'Neugesch\u00E4ft' : 'Anpassung';

        // Detail-Zeile mit Herleitung + Actions
        var detailHtml = '';
        if (i.herleitung && i.herleitung.length > 0) {
            detailHtml = '<tr class="impulse-table-detail" id="table-detail-' + i.id + '">' +
                '<td colspan="6"><div class="impulse-table-detail-inner">' +
                '<div class="impulse-table-herleitung">' +
                '<div class="kanban-detail-title">Herleitung</div>' +
                i.herleitung.map(function(h) {
                    return '<div class="kanban-detail-row"><span class="kanban-detail-label">' + h.label + '</span><span class="kanban-detail-value">' + h.value + '</span></div>';
                }).join('') +
                '</div>' +
                '<div class="impulse-table-actions">' +
                '<button class="action-btn primary small icon-only" onclick="event.stopPropagation()" title="Angebot erstellen">' + actionIcons.angebot + '</button>' +
                '<button class="action-btn secondary small icon-only" onclick="event.stopPropagation()" title="Termin vereinbaren">' + actionIcons.termin + '</button>' +
                '</div></div></td></tr>';
        }

        return '<tr class="impulse-table-row" onclick="toggleTableDetail(\'' + i.id + '\')">' +
            '<td><span class="impulse-table-icon">' + i.icon + '</span></td>' +
            '<td><strong>' + i.title + '</strong><div class="impulse-table-desc">' + i.desc + '</div></td>' +
            '<td><span class="impulse-kat-badge ' + i.kategorie + '">' + katLabel + '</span></td>' +
            '<td><span class="impulse-prio-badge ' + i.prioritaet + '">' + prioLabel + '</span></td>' +
            '<td>' + i.source + '</td>' +
            '<td class="impulse-table-expand-cell"><span class="impulse-table-expand" id="table-arrow-' + i.id + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="6 9 12 15 18 9"/></svg></span></td>' +
            '</tr>' + detailHtml;
    }).join('');

    return '<table class="impulse-table"><thead><tr><th style="width:36px"></th><th>Impuls</th><th>Kategorie</th><th>Priorit\u00E4t</th><th>Quelle</th><th style="width:30px"></th></tr></thead><tbody>' + rows + '</tbody></table>';
}

function toggleTableDetail(id) {
    var detail = document.getElementById('table-detail-' + id);
    var arrow = document.getElementById('table-arrow-' + id);
    if (!detail) return;
    detail.classList.toggle('open');
    if (arrow) arrow.classList.toggle('open');
}
window.toggleTableDetail = toggleTableDetail;

// ========================================
