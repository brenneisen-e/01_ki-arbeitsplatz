// js/kommunikation-display.js - Kommunikation Display Options
// Extracted from landing.js for modularity

// KOMMUNIKATION DISPLAY OPTIONS (3 Options)
// ========================================
var currentKommOption = 0;
var kommOptions = ['Option 1: Timeline', 'Option 2: Chat-Ansicht', 'Option 3: Kompakte Liste'];

var kommData = [
    { type: 'email', typLabel: 'Automatische E-Mail', date: '28.11.2025', subject: 'Kfz-Versicherung: Ihr Vertrag l\u00E4uft aus', preview: 'Ihr Kfz-Vertrag bei der Allianz l\u00E4uft am 30.11.2025 aus. Wir haben ein attraktives Angebot...', status: 'geoeffnet', statusText: 'Ge\u00F6ffnet', direction: 'outgoing' },
    { type: 'brief', typLabel: 'Automatischer Brief', date: '15.11.2025', subject: 'Open Finance Datenfreigabe: Neue Potentiale erkannt', preview: 'Basierend auf Ihren freigegebenen Finanzdaten haben wir Optimierungsm\u00F6glichkeiten...', status: 'versendet', statusText: 'Versendet', direction: 'outgoing' },
    { type: 'telefon', typLabel: 'Telefonat', date: '10.11.2025', subject: 'R\u00FCckruf wegen Altersvorsorge-Angebot', preview: 'Kunde interessiert an fondsgebundener Rentenversicherung. Termin f\u00FCr 12.12. vereinbart.', status: 'termin', statusText: 'Termin: 12.12.2025', direction: 'incoming' },
    { type: 'email', typLabel: 'Automatische E-Mail', date: '01.10.2025', subject: 'Willkommen bei Open Finance', preview: 'Vielen Dank f\u00FCr Ihre Open Finance Datenfreigabe. Personalisierte Empfehlungen verf\u00FCgbar.', status: 'geoeffnet', statusText: 'Ge\u00F6ffnet', direction: 'outgoing' }
];

function switchKommOption(direction) {
    currentKommOption = (currentKommOption + direction + kommOptions.length) % kommOptions.length;
    var label = document.getElementById('kommOptionLabel');
    if (label) label.textContent = kommOptions[currentKommOption];
    renderKommContent();
}
window.switchKommOption = switchKommOption;

function renderKommContent() {
    var container = document.getElementById('kommContent');
    if (!container) return;

    switch (currentKommOption) {
        case 0: // Timeline (existing HTML)
            var timeline = container.querySelector('.kommunikation-timeline');
            if (timeline) timeline.style.display = '';
            var chat = container.querySelector('.komm-chat');
            if (chat) chat.remove();
            var compact = container.querySelector('.komm-compact');
            if (compact) compact.remove();
            break;
        case 1: // Chat
            hideExistingKomm(container);
            removeAltKomm(container);
            var chatHtml = renderKommChat();
            var div = document.createElement('div');
            div.className = 'komm-chat';
            div.innerHTML = chatHtml;
            container.appendChild(div);
            break;
        case 2: // Kompakte Liste
            hideExistingKomm(container);
            removeAltKomm(container);
            var listHtml = renderKommCompact();
            var div2 = document.createElement('div');
            div2.className = 'komm-compact';
            div2.innerHTML = listHtml;
            container.appendChild(div2);
            break;
    }
}

function hideExistingKomm(container) {
    var timeline = container.querySelector('.kommunikation-timeline');
    if (timeline) timeline.style.display = 'none';
}

function removeAltKomm(container) {
    var c = container.querySelector('.komm-chat');
    if (c) c.remove();
    var l = container.querySelector('.komm-compact');
    if (l) l.remove();
}

function renderKommChat() {
    var typeIcons = {
        'email': '\u2709\uFE0F',
        'brief': '\uD83D\uDCC4',
        'telefon': '\uD83D\uDCDE'
    };
    return kommData.map(function(k) {
        var icon = typeIcons[k.type] || '\u2709\uFE0F';
        var avatar = k.direction === 'outgoing' ? '\uD83E\uDDD1\u200D\uD83D\uDCBC' : '\uD83D\uDC64';
        return '<div class="komm-chat-msg ' + k.direction + '">' +
            '<div class="komm-chat-avatar">' + avatar + '</div>' +
            '<div class="komm-chat-bubble">' +
            '<div class="komm-chat-bubble-subject">' + k.subject + '</div>' +
            '<div>' + k.preview + '</div>' +
            '<div class="komm-chat-bubble-date">' + k.typLabel + ' \u2022 ' + k.date + '</div></div></div>';
    }).join('');
}

function renderKommCompact() {
    var typeIcons = {
        'email': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
        'brief': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
        'telefon': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>'
    };
    return kommData.map(function(k, idx) {
        return '<div class="komm-compact-row">' +
            '<div class="komm-compact-item" onclick="toggleKommCompactDetail(' + idx + ')">' +
            '<span class="komm-compact-date">' + k.date + '</span>' +
            '<span class="komm-compact-icon">' + (typeIcons[k.type] || '') + '</span>' +
            '<span class="komm-compact-subject">' + k.subject + '</span>' +
            '<span class="komm-compact-type">' + k.typLabel + '</span>' +
            '<span class="komm-compact-status ' + k.status + '">' + k.statusText + '</span>' +
            '<span class="komm-compact-expand" id="kommCompactArrow' + idx + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><polyline points="6 9 12 15 18 9"/></svg></span></div>' +
            '<div class="komm-compact-detail" id="kommCompactDetail' + idx + '" style="display:none;">' +
            '<div class="komm-compact-detail-text">' + k.preview + '</div>' +
            '<div class="komm-compact-detail-meta">' +
            '<span class="komm-compact-detail-type">' + k.typLabel + '</span>' +
            '<span class="komm-compact-detail-status ' + k.status + '">' + k.statusText + '</span></div></div></div>';
    }).join('');
}

function toggleKommCompactDetail(idx) {
    var detail = document.getElementById('kommCompactDetail' + idx);
    var arrow = document.getElementById('kommCompactArrow' + idx);
    if (!detail) return;
    if (detail.style.display === 'none') {
        detail.style.display = 'block';
        if (arrow) arrow.classList.add('open');
    } else {
        detail.style.display = 'none';
        if (arrow) arrow.classList.remove('open');
    }
}
window.toggleKommCompactDetail = toggleKommCompactDetail;

console.log('landing.js geladen');
