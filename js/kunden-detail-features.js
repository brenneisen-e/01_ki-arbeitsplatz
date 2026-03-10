// ========================================
// HAUSTIER-EINGABEFORMULAR (localStorage)
// ========================================

function getTierStorageKey() {
    var kundenName = document.getElementById('kundenHeaderTitle');
    var name = kundenName ? kundenName.textContent.replace('Kunde: ', '').trim() : 'default';
    return 'tierInfo_' + name;
}

// SVG-Icons fuer Hund und Katze (einfarbig, modern)
var tierSvgIcons = {
    Hund: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><ellipse cx="7" cy="4" rx="2" ry="2.5"/><ellipse cx="17" cy="4" rx="2" ry="2.5"/><ellipse cx="4" cy="10" rx="2" ry="2.5"/><ellipse cx="20" cy="10" rx="2" ry="2.5"/><path d="M12 22c-3 0-7-3-7-7a7 7 0 0114 0c0 4-4 7-7 7z"/></svg>',
    Katze: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><path d="M4 7V2l4 4"/><path d="M20 7V2l-4 4"/><circle cx="12" cy="14" r="7"/><circle cx="10" cy="12.5" r="1" fill="currentColor"/><circle cx="14" cy="12.5" r="1" fill="currentColor"/><path d="M10 15.5s1 1 2 1 2-1 2-1"/></svg>'
};

function initTierForm() {
    var saved = safeLocalGet(getTierStorageKey(), null);
    if (saved) {
        try {
            var data = JSON.parse(saved);
            showSavedTierDisplay(data);
        } catch(e) { /* ignore */ }
    }
}

function onTierArtChange() {
    var select = document.getElementById('tierArtSelect');
    var detailsRow = document.getElementById('tierDetailsRow');
    if (!select || !detailsRow) return;
    detailsRow.style.display = select.value ? 'block' : 'none';
}
window.onTierArtChange = onTierArtChange;

function saveTierInfo() {
    var art = document.getElementById('tierArtSelect');
    var name = document.getElementById('tierNameInput');
    var alter = document.getElementById('tierAlterInput');
    if (!art || !art.value) return;

    var data = {
        art: art.value,
        name: name ? name.value.trim() : '',
        alter: alter ? alter.value : ''
    };

    safeLocalSet(getTierStorageKey(), JSON.stringify(data));
    showSavedTierDisplay(data);
}
window.saveTierInfo = saveTierInfo;

function showSavedTierDisplay(data) {
    var display = document.getElementById('tierDisplay');
    var badge = document.getElementById('tierDisplayBadge');
    var tierHintRow = document.getElementById('tierHintRow');

    if (!display || !badge) return;

    var icon = tierSvgIcons[data.art] || tierSvgIcons.Hund;
    var text = data.art;
    if (data.name) text += ' \u201E' + data.name + '\u201C';
    if (data.alter) text += ', ' + data.alter + ' J.';

    badge.innerHTML = '<span class="tier-display-icon">' + icon + '</span><span>' + text + '</span>';
    display.style.display = 'flex';

    // Hinweis-Zeile verstecken
    if (tierHintRow) tierHintRow.style.display = 'none';

    // Popup schliessen
    closeTierPopup();
}

function openTierPopup(isEdit) {
    var overlay = document.getElementById('tierPopupOverlay');
    var popup = document.getElementById('tierPopup');
    if (!overlay || !popup) return;

    overlay.style.display = 'block';
    popup.style.display = 'block';

    // Felder vorbelegen wenn edit
    if (isEdit) {
        var saved = safeLocalGet(getTierStorageKey(), null);
        if (saved) {
            try {
                var data = JSON.parse(saved);
                var artSelect = document.getElementById('tierArtSelect');
                var nameInput = document.getElementById('tierNameInput');
                var alterInput = document.getElementById('tierAlterInput');
                var detailsRow = document.getElementById('tierDetailsRow');
                if (artSelect) artSelect.value = data.art || '';
                if (nameInput) nameInput.value = data.name || '';
                if (alterInput) alterInput.value = data.alter || '';
                if (detailsRow) detailsRow.style.display = data.art ? 'block' : 'none';
            } catch(e) { /* ignore */ }
        }
    } else {
        // Reset form
        var artSelect = document.getElementById('tierArtSelect');
        var nameInput = document.getElementById('tierNameInput');
        var alterInput = document.getElementById('tierAlterInput');
        var detailsRow = document.getElementById('tierDetailsRow');
        if (artSelect) artSelect.value = '';
        if (nameInput) nameInput.value = '';
        if (alterInput) alterInput.value = '';
        if (detailsRow) detailsRow.style.display = 'none';
    }
}
window.openTierPopup = openTierPopup;

function closeTierPopup() {
    var overlay = document.getElementById('tierPopupOverlay');
    var popup = document.getElementById('tierPopup');
    if (overlay) overlay.style.display = 'none';
    if (popup) popup.style.display = 'none';
}
window.closeTierPopup = closeTierPopup;

function removeTierInfo() {
    localStorage.removeItem(getTierStorageKey());
    var display = document.getElementById('tierDisplay');
    if (display) display.style.display = 'none';
    // Hint-Zeile wieder anzeigen
    var tierHintRow = document.getElementById('tierHintRow');
    if (tierHintRow) tierHintRow.style.display = 'flex';
    // Popup schliessen
    closeTierPopup();
    // Formular zuruecksetzen
    var artSelect = document.getElementById('tierArtSelect');
    var detailsRow = document.getElementById('tierDetailsRow');
    var nameInput = document.getElementById('tierNameInput');
    var alterInput = document.getElementById('tierAlterInput');
    if (artSelect) artSelect.value = '';
    if (detailsRow) detailsRow.style.display = 'none';
    if (nameInput) nameInput.value = '';
    if (alterInput) alterInput.value = '';
}
window.removeTierInfo = removeTierInfo;

// ========================================
// ANGEBOT ERSTELLEN - KONTEXTMENUE
// ========================================

function toggleAngebotMenu(event, btn) {
    event.stopPropagation();
    var wrapper = btn.closest('.angebot-dropdown-wrapper');
    if (!wrapper) return;
    var menu = wrapper.querySelector('.angebot-context-menu');
    if (!menu) return;

    // Alle anderen offenen Menues schliessen
    document.querySelectorAll('.angebot-context-menu').forEach(function(m) {
        if (m !== menu) m.style.display = 'none';
    });

    // Toggle
    if (menu.style.display === 'none' || !menu.style.display) {
        menu.style.display = 'block';
        // Klick ausserhalb schliesst das Menue
        setTimeout(function() {
            document.addEventListener('click', closeAllAngebotMenus);
        }, 0);
    } else {
        menu.style.display = 'none';
    }
}
window.toggleAngebotMenu = toggleAngebotMenu;

function closeAllAngebotMenus() {
    document.querySelectorAll('.angebot-context-menu').forEach(function(m) {
        m.style.display = 'none';
    });
    document.removeEventListener('click', closeAllAngebotMenus);
}

function angebotAction(typ, el) {
    closeAllAngebotMenus();
    var wrapper = el ? el.closest('.angebot-dropdown-wrapper') : null;
    var produkt = wrapper ? wrapper.getAttribute('data-produkt') : 'Versicherung';
    var empfehlung = wrapper ? wrapper.getAttribute('data-empfehlung') : '';

    if (typ === 'pdf') {
        showAngebotToast('loading', 'PDF wird generiert: ' + produkt + '...');
        setTimeout(function() {
            showAngebotToast('success', 'PDF erstellt: Angebot ' + produkt + ' f\u00fcr Peter Schmidt');
        }, 1800);
    } else if (typ === 'entwurf') {
        showAngebotToast('success', 'Entwurf gespeichert: ' + produkt);
    } else if (typ === 'vergleich') {
        openTarifvergleich(produkt, empfehlung);
    }
}
window.angebotAction = angebotAction;

function showAngebotToast(type, message) {
    var toast = document.getElementById('angebotToast');
    if (!toast) return;
    var icon = type === 'success'
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18" class="angebot-toast-spinner"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
    toast.className = 'angebot-toast ' + type + ' show';
    toast.innerHTML = '<div class="angebot-toast-icon">' + icon + '</div><span>' + message + '</span>';
    if (type === 'success') {
        setTimeout(function() { toast.classList.remove('show'); }, 3500);
    }
}

function openTarifvergleich(produkt, empfehlung) {
    var modal = document.getElementById('tarifvergleichModal');
    if (!modal) return;
    var title = document.getElementById('tvModalTitle');
    var body = document.getElementById('tvModalBody');
    if (title) title.textContent = 'Tarifvergleich: ' + produkt;

    var tarife = getTarifData(produkt);
    var html = '<div class="tv-empfehlung"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg> <strong>Empfehlung:</strong> ' + (empfehlung || produkt) + '</div>';
    html += '<table class="tv-table"><thead><tr><th>Versicherer</th><th>Tarif</th><th>Beitrag</th><th>Leistung</th><th>Bewertung</th><th></th></tr></thead><tbody>';
    tarife.forEach(function(t) {
        var stars = '';
        for (var s = 0; s < 5; s++) { stars += s < t.rating ? '<span class="tv-star filled">\u2605</span>' : '<span class="tv-star">\u2606</span>'; }
        html += '<tr' + (t.empfohlen ? ' class="tv-empfohlen"' : '') + '>' +
            '<td>' + versichererLogoImg(t.versicherer, 18) + ' <strong>' + t.versicherer + '</strong></td>' +
            '<td>' + t.tarif + '</td>' +
            '<td><strong>' + t.beitrag + '</strong></td>' +
            '<td>' + t.leistung + '</td>' +
            '<td class="tv-stars">' + stars + '</td>' +
            '<td>' + (t.empfohlen ? '<span class="tv-badge-empfohlen">Empfohlen</span>' : '') + '</td>' +
            '</tr>';
    });
    html += '</tbody></table>';

    // OPT-13: KI-Begruendung fuer Empfehlung
    var kiReasons = {
        'Risikolebensversicherung': 'Basierend auf der Hypothekenh\u00f6he (\u20ac285.000) und Familiensituation (2 Kinder) empfehlen wir die Hannoversche T1 Plus: Bestes Preis-Leistungs-Verh\u00e4ltnis bei \u20ac300.000 Versicherungssumme. Die 20-Jahres-Laufzeit deckt die Restlaufzeit der Baufinanzierung ab. Risikosport-Zuschlag wurde ber\u00fccksichtigt.',
        'Fondsgebundene Rentenversicherung': 'Bei einer Sparrate von \u20ac250/Mon. bietet die Alte Leipziger FR10 den g\u00fcnstigsten Kostenfaktor (Effektivkosten 0,8% p.a.) mit voller ETF-Flexibilit\u00e4t. Steuerliche Vorteile der Versicherungsl\u00f6sung (Halbeink\u00fcnfteverfahren nach 12 Jahren) gegen\u00fcber reinem Depot relevant ab ca. \u20ac50.000 Guthaben.',
        'Kfz-Versicherung': 'SF8-Analyse zeigt: HDI Kfz-Vollkasko Comfort bietet \u20ac160/Jahr Ersparnis gegen\u00fcber aktuellem Allianz-Vertrag bei gleichwertigem Leistungsumfang. Weltweiter Schutz und Neupreis-Entsch\u00e4digung 24 Monate inklusive. Wechsel zum 01.01. empfohlen.',
        'BU-Nachversicherung': 'Aktuelle BU-Rente \u20ac1.500/Mon. deckt nur 39% des Nettoeinkommens (empfohlen: 60-80%). ERGO BU Premium Protect bietet Nachversicherungsgarantie ohne erneute Gesundheitspr\u00fcfung bei Gehaltserh\u00f6hung. Infektionsklausel des HDI-Tarifs w\u00e4re bei B\u00fcrot\u00e4tigkeit weniger relevant.'
    };
    var reason = kiReasons[produkt];
    if (reason) {
        html += '<div class="tv-ki-reasoning">' +
            '<div class="tv-ki-header"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> KI-Begr\u00fcndung</div>' +
            '<div class="tv-ki-text">' + reason + '</div>' +
        '</div>';
    }

    if (body) body.innerHTML = html;

    modal.style.display = 'flex';
}

function closeTarifvergleich() {
    var modal = document.getElementById('tarifvergleichModal');
    if (modal) modal.style.display = 'none';
}
window.openTarifvergleich = openTarifvergleich;
window.closeTarifvergleich = closeTarifvergleich;

function getTarifData(produkt) {
    var tarifSets = {
        'Risikolebensversicherung': [
            { versicherer: 'Hannoversche', tarif: 'T1 Plus', beitrag: '\u20ac18/Mon.', leistung: '\u20ac300.000, 20 J.', rating: 5, empfohlen: true },
            { versicherer: 'CosmosDirekt', tarif: 'Risiko Comfort', beitrag: '\u20ac21/Mon.', leistung: '\u20ac300.000, 20 J.', rating: 4, empfohlen: false },
            { versicherer: 'HUK-Coburg', tarif: 'Risiko PLUS', beitrag: '\u20ac24/Mon.', leistung: '\u20ac300.000, 20 J.', rating: 4, empfohlen: false },
            { versicherer: 'ERGO', tarif: 'RisikoLeben Premium', beitrag: '\u20ac28/Mon.', leistung: '\u20ac300.000, 20 J., Unfall +', rating: 3, empfohlen: false }
        ],
        'Fondsgebundene Rentenversicherung': [
            { versicherer: 'Alte Leipziger', tarif: 'FR10 Fonds', beitrag: '\u20ac250/Mon.', leistung: 'ETF-basiert, Steuervorteil', rating: 5, empfohlen: true },
            { versicherer: 'Condor', tarif: 'C78 Comfort', beitrag: '\u20ac250/Mon.', leistung: 'Fondsgeb., flex. Entnahme', rating: 4, empfohlen: false },
            { versicherer: 'Allianz', tarif: 'InvestFlex', beitrag: '\u20ac260/Mon.', leistung: 'Garantie + Fondsanlage', rating: 4, empfohlen: false },
            { versicherer: 'Zurich', tarif: 'VorsorgePlus', beitrag: '\u20ac245/Mon.', leistung: 'Fondsgeb., Todesfallschutz', rating: 3, empfohlen: false }
        ],
        'Kfz-Versicherung': [
            { versicherer: 'HDI', tarif: 'Kfz-Vollkasko Comfort', beitrag: '\u20ac52/Mon.', leistung: 'VK, SF8, Weltweit', rating: 5, empfohlen: true },
            { versicherer: 'HUK-Coburg', tarif: 'VK Plus', beitrag: '\u20ac48/Mon.', leistung: 'VK, SF8, EU-Schutz', rating: 4, empfohlen: false },
            { versicherer: 'Allianz', tarif: 'AutoBest', beitrag: '\u20ac58/Mon.', leistung: 'VK, Neupreis 24 Mon.', rating: 4, empfohlen: false },
            { versicherer: 'VHV', tarif: 'Klassik-Garant', beitrag: '\u20ac45/Mon.', leistung: 'VK, SF8, Basis', rating: 3, empfohlen: false }
        ],
        'BU-Nachversicherung': [
            { versicherer: 'ERGO', tarif: 'BU Premium Protect', beitrag: '\u20ac145/Mon.', leistung: '\u20ac3.700/Mon., NVG', rating: 5, empfohlen: true },
            { versicherer: 'Alte Leipziger', tarif: 'BU10 Plus', beitrag: '\u20ac138/Mon.', leistung: '\u20ac3.700/Mon., AU-Klausel', rating: 5, empfohlen: false },
            { versicherer: 'HDI', tarif: 'EGO Top', beitrag: '\u20ac155/Mon.', leistung: '\u20ac3.700/Mon., Infektionsklausel', rating: 4, empfohlen: false },
            { versicherer: 'N\u00fcrnberger', tarif: 'BU Premium', beitrag: '\u20ac142/Mon.', leistung: '\u20ac3.700/Mon., Dienstunf\u00e4higkeit', rating: 4, empfohlen: false }
        ]
    };
    return tarifSets[produkt] || tarifSets['Risikolebensversicherung'];
}

// ========================================
// KUNDEN TAB NAVIGATION
// ========================================

function switchKundenTab(tabName) {
    // Exit dual-view when user clicks any tab manually
    if (typeof closeDualView === 'function') {
        const kundenContent = document.querySelector('.kunden-content.dual-view');
        if (kundenContent) closeDualView();
    }

    // Alle Tabs deaktivieren
    document.querySelectorAll('.kunden-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    // Alle Tab-Inhalte verstecken
    document.querySelectorAll('.kunden-tab-content').forEach(content => {
        content.classList.remove('active');
    });

    // Aktiven Tab markieren
    const activeTab = document.querySelector(`.kunden-tab[data-tab="${tabName}"]`);
    if (activeTab) {
        activeTab.classList.add('active');
    }

    // Tab-Inhalt anzeigen
    const tabContent = document.getElementById('tab' + tabName.charAt(0).toUpperCase() + tabName.slice(1));
    if (tabContent) {
        tabContent.classList.add('active');
    }

    console.log('Tab gewechselt zu:', tabName);

    // Render dynamic content for tabs
    if (tabName === 'fida') setTimeout(function() {
        if (typeof renderBezahlenContent === 'function') renderBezahlenContent();
        if (typeof renderFidaStufe2 === 'function') renderFidaStufe2();
        if (typeof renderSankeyFlow === 'function') renderSankeyFlow();
        setTimeout(function() { if (typeof addFidaActionButtons === 'function') addFidaActionButtons(); }, 100);
    }, 50);
    if (tabName === 'impulse') setTimeout(function() {
        if (typeof renderImpulseContent === 'function') renderImpulseContent();
        if (typeof generateKIImpuls === 'function') generateKIImpuls();
    }, 50);
    if (tabName === 'kommunikation') setTimeout(function() {
        var kundenName = getCurrentKundenName();
        if (kundenName && typeof renderKommSummary === 'function') renderKommSummary(kundenName);
        if (kundenName && typeof renderKommSalesImpulse === 'function') renderKommSalesImpulse(kundenName);
        if (typeof renderKommFilter === 'function') renderKommFilter();
        if (kundenName && typeof renderDynamicKommTimeline === 'function') {
            var komm = getKommunikationForKunde(kundenName);
            if (komm && komm.length > 0) {
                renderDynamicKommTimeline(kundenName);
            }
        }
        if (typeof renderKommContent === 'function') renderKommContent();
    }, 50);
    if (tabName === 'finanzplanung') setTimeout(function() {
        if (typeof renderCLVSzenarien === 'function') renderCLVSzenarien();
        if (typeof renderProvisionsplanung === 'function') renderProvisionsplanung();
    }, 50);
    if (tabName === 'stammdaten') setTimeout(function() {
        if (typeof renderLifeEventTimeline === 'function') renderLifeEventTimeline();
        if (typeof renderRisikoscoring === 'function') renderRisikoscoring();
    }, 50);
}

// Toggle Impuls Detail
function toggleImpulsDetail(impulsId) {
    const detailElement = document.getElementById(impulsId);
    if (detailElement) {
        const isVisible = detailElement.style.display !== 'none';
        detailElement.style.display = isVisible ? 'none' : 'block';

        // Rotate the expand icon
        const parentItem = detailElement.previousElementSibling;
        if (parentItem) {
            const expandIcon = parentItem.querySelector('.impuls-expand');
            if (expandIcon) {
                expandIcon.style.transform = isVisible ? 'rotate(0deg)' : 'rotate(180deg)';
            }
        }
    }
}

// Window-Exports fuer globale Verfuegbarkeit
window.switchKundenTab = switchKundenTab;
window.toggleImpulsDetail = toggleImpulsDetail;
window.showAngebotToast = showAngebotToast;
window.viewKommunikation = typeof viewKommunikation === 'function' ? viewKommunikation : function() {};

// ========================================
// OPT-03: TAB-BADGES & PRIORISIERUNG
// ========================================

function updateTabBadges() {
    var isBanking = typeof isBankMode === 'function' && isBankMode();

    // Remove existing badges first
    document.querySelectorAll('.kunden-tab .tab-badge').forEach(function(b) { b.remove(); });

    var badges = {};

    if (isBanking && typeof bankMockKunden !== 'undefined') {
        var kundenHeader = document.getElementById('kundenHeaderTitle');
        var name = kundenHeader ? kundenHeader.textContent.replace('Kunde: ', '').trim() : '';
        var nameEl = document.getElementById('kundenName');
        if (!name && nameEl) name = nameEl.textContent.trim();
        var kd = bankMockKunden[name];
        if (kd) {
            badges['vertraege'] = kd.konten ? kd.konten.length : 0;
            badges['fida'] = kd.fidaVertraege ? kd.fidaVertraege.length : 0;
            // Count impulses from evaluateImpulse
            if (typeof evaluateImpulse === 'function') {
                var imp = evaluateImpulse(kd);
                if (imp.length > 0) badges['impulse'] = imp.length;
            }
            badges['kommunikation'] = (kd.kommunikation && kd.kommunikation.length) || 0;
        }
    } else {
        // Insurance mode - count from static content
        var vertraegeBody = document.getElementById('kundenVertraege');
        if (vertraegeBody) {
            var rows = vertraegeBody.querySelectorAll('tr');
            if (rows.length > 0) badges['vertraege'] = rows.length;
        }

        var fidaTable = document.querySelector('#tabFida .fida-table tbody');
        if (fidaTable) {
            var fidaRows = fidaTable.querySelectorAll('tr');
            if (fidaRows.length > 0) badges['fida'] = fidaRows.length;
        }

        // Count impulse items
        var impulseItems = document.querySelectorAll('#tabImpulse .impuls-item');
        if (impulseItems.length > 0) badges['impulse'] = impulseItems.length;

        // Kommunikation - check mockKunden data first, fallback to DOM
        var kundenNameBadge = getCurrentKundenName();
        if (kundenNameBadge && typeof window.mockKunden !== 'undefined' && window.mockKunden[kundenNameBadge] && window.mockKunden[kundenNameBadge].kommunikation) {
            badges['kommunikation'] = window.mockKunden[kundenNameBadge].kommunikation.length;
        } else {
            var kommItems = document.querySelectorAll('#tabKommunikation .kommunikation-eintrag, #tabKommunikation .komm-item');
            if (kommItems.length > 0) badges['kommunikation'] = kommItems.length;
        }
    }

    // Apply badges
    for (var tabKey in badges) {
        if (badges[tabKey] <= 0) continue;
        var tab = document.querySelector('.kunden-tab[data-tab="' + tabKey + '"]');
        if (tab) {
            var badge = document.createElement('span');
            badge.className = 'tab-badge';
            if (tabKey === 'impulse') badge.className += ' tab-badge-alert';
            badge.textContent = badges[tabKey];
            tab.appendChild(badge);
        }
    }
}
window.updateTabBadges = updateTabBadges;

// Auto-update badges when kunden detail opens
(function() {
    // Watch for kundenDetailPage becoming visible
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(m) {
            if (m.attributeName === 'style') {
                var page = document.getElementById('kundenDetailPage');
                if (page && page.style.display !== 'none') {
                    setTimeout(updateTabBadges, 200);
                }
            }
        });
    });
    document.addEventListener('DOMContentLoaded', function() {
        var page = document.getElementById('kundenDetailPage');
        if (page) observer.observe(page, { attributes: true });
    });
})();

// ========================================

// -- BANKING KUNDEN-DETAIL (merged from kunden-detail-bank.js) --

/* ============================================================
   B-10 KUNDEN-DETAIL BANK  –  Banking Customer Detail
   Mirrors kunden-detail.js (A-10) structure exactly
   ============================================================ */

window.__registerModule('kunden-detail-features.js');
