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
        case 2: // Kompakte Tabelle
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
                    '<button class="action-btn primary small" onclick="event.stopPropagation()">Angebot erstellen</button>' +
                    '<button class="action-btn secondary small" onclick="event.stopPropagation()">Termin vereinbaren</button></div></div>';
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

function renderImpulseTable() {
    var rows = impulseData.map(function(i) {
        return '<tr><td><strong>' + i.title + '</strong></td>' +
            '<td>' + i.desc + '</td>' +
            '<td><span class="impulse-kat-badge ' + i.kategorie + '">' + (i.kategorie === 'whitespots' ? 'Neugesch\u00E4ft' : 'Anpassung') + '</span></td>' +
            '<td><span class="impulse-prio-badge ' + i.prioritaet + '">' + (i.prioritaet === 'high' ? 'Hoch' : (i.prioritaet === 'medium' ? 'Mittel' : 'Niedrig')) + '</span></td>' +
            '<td>' + i.source + '</td></tr>';
    }).join('');

    return '<table class="impulse-table"><thead><tr><th>Impuls</th><th>Beschreibung</th><th>Kategorie</th><th>Priorit\u00E4t</th><th>Quelle</th></tr></thead><tbody>' + rows + '</tbody></table>';
}

// ========================================
