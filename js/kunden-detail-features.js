// ========================================
// HAUSTIER-EINGABEFORMULAR (localStorage)
// ========================================

function getTierStorageKey() {
    var kundenName = document.getElementById('kundenHeaderTitle');
    var name = kundenName ? kundenName.textContent.replace('Kunde: ', '').trim() : 'default';
    return 'tierInfo_' + name;
}

// SVG-Icons für Hund und Katze (einfarbig, modern)
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

    // Popup schließen
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
    // Popup schließen
    closeTierPopup();
    // Formular zurücksetzen
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
// ANGEBOT ERSTELLEN - KONTEXTMENÜ
// ========================================

function toggleAngebotMenu(event, btn) {
    event.stopPropagation();
    var wrapper = btn.closest('.angebot-dropdown-wrapper');
    if (!wrapper) return;
    var menu = wrapper.querySelector('.angebot-context-menu');
    if (!menu) return;

    // Alle anderen offenen Menüs schließen
    document.querySelectorAll('.angebot-context-menu').forEach(function(m) {
        if (m !== menu) m.style.display = 'none';
    });

    // Toggle
    if (menu.style.display === 'none' || !menu.style.display) {
        menu.style.display = 'block';
        // Klick außerhalb schließt das Menü
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
            showAngebotToast('success', 'PDF erstellt: Angebot ' + produkt + ' für Peter Schmidt');
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
        for (var s = 0; s < 5; s++) { stars += s < t.rating ? '<span class="tv-star filled">★</span>' : '<span class="tv-star">☆</span>'; }
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

    // OPT-13: KI-Begründung für Empfehlung
    var kiReasons = {
        'Risikolebensversicherung': 'Basierend auf der Hypothekenhöhe (€285.000) und Familiensituation (2 Kinder) empfehlen wir die Hannoversche T1 Plus: Bestes Preis-Leistungs-Verhältnis bei €300.000 Versicherungssumme. Die 20-Jahres-Laufzeit deckt die Restlaufzeit der Baufinanzierung ab. Risikosport-Zuschlag wurde berücksichtigt.',
        'Fondsgebundene Rentenversicherung': 'Bei einer Sparrate von €250/Mon. bietet die Alte Leipziger FR10 den günstigsten Kostenfaktor (Effektivkosten 0,8% p.a.) mit voller ETF-Flexibilität. Steuerliche Vorteile der Versicherungslösung (Halbeinkünfteverfahren nach 12 Jahren) gegenüber reinem Depot relevant ab ca. €50.000 Guthaben.',
        'Kfz-Versicherung': 'SF8-Analyse zeigt: HDI Kfz-Vollkasko Comfort bietet €160/Jahr Ersparnis gegenüber aktuellem Allianz-Vertrag bei gleichwertigem Leistungsumfang. Weltweiter Schutz und Neupreis-Entschädigung 24 Monate inklusive. Wechsel zum 01.01. empfohlen.',
        'BU-Nachversicherung': 'Aktuelle BU-Rente €1.500/Mon. deckt nur 39% des Nettoeinkommens (empfohlen: 60-80%). ERGO BU Premium Protect bietet Nachversicherungsgarantie ohne erneute Gesundheitsprüfung bei Gehaltserhöhung. Infektionsklausel des HDI-Tarifs wäre bei Bürotätigkeit weniger relevant.'
    };
    var reason = kiReasons[produkt];
    if (reason) {
        html += '<div class="tv-ki-reasoning">' +
            '<div class="tv-ki-header"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> KI-Begründung</div>' +
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
            { versicherer: 'Hannoversche', tarif: 'T1 Plus', beitrag: '€18/Mon.', leistung: '€300.000, 20 J.', rating: 5, empfohlen: true },
            { versicherer: 'CosmosDirekt', tarif: 'Risiko Comfort', beitrag: '€21/Mon.', leistung: '€300.000, 20 J.', rating: 4, empfohlen: false },
            { versicherer: 'HUK-Coburg', tarif: 'Risiko PLUS', beitrag: '€24/Mon.', leistung: '€300.000, 20 J.', rating: 4, empfohlen: false },
            { versicherer: 'ERGO', tarif: 'RisikoLeben Premium', beitrag: '€28/Mon.', leistung: '€300.000, 20 J., Unfall +', rating: 3, empfohlen: false }
        ],
        'Fondsgebundene Rentenversicherung': [
            { versicherer: 'Alte Leipziger', tarif: 'FR10 Fonds', beitrag: '€250/Mon.', leistung: 'ETF-basiert, Steuervorteil', rating: 5, empfohlen: true },
            { versicherer: 'Condor', tarif: 'C78 Comfort', beitrag: '€250/Mon.', leistung: 'Fondsgeb., flex. Entnahme', rating: 4, empfohlen: false },
            { versicherer: 'Allianz', tarif: 'InvestFlex', beitrag: '€260/Mon.', leistung: 'Garantie + Fondsanlage', rating: 4, empfohlen: false },
            { versicherer: 'Zurich', tarif: 'VorsorgePlus', beitrag: '€245/Mon.', leistung: 'Fondsgeb., Todesfallschutz', rating: 3, empfohlen: false }
        ],
        'Kfz-Versicherung': [
            { versicherer: 'HDI', tarif: 'Kfz-Vollkasko Comfort', beitrag: '€52/Mon.', leistung: 'VK, SF8, Weltweit', rating: 5, empfohlen: true },
            { versicherer: 'HUK-Coburg', tarif: 'VK Plus', beitrag: '€48/Mon.', leistung: 'VK, SF8, EU-Schutz', rating: 4, empfohlen: false },
            { versicherer: 'Allianz', tarif: 'AutoBest', beitrag: '€58/Mon.', leistung: 'VK, Neupreis 24 Mon.', rating: 4, empfohlen: false },
            { versicherer: 'VHV', tarif: 'Klassik-Garant', beitrag: '€45/Mon.', leistung: 'VK, SF8, Basis', rating: 3, empfohlen: false }
        ],
        'BU-Nachversicherung': [
            { versicherer: 'ERGO', tarif: 'BU Premium Protect', beitrag: '€145/Mon.', leistung: '€3.700/Mon., NVG', rating: 5, empfohlen: true },
            { versicherer: 'Alte Leipziger', tarif: 'BU10 Plus', beitrag: '€138/Mon.', leistung: '€3.700/Mon., AU-Klausel', rating: 5, empfohlen: false },
            { versicherer: 'HDI', tarif: 'EGO Top', beitrag: '€155/Mon.', leistung: '€3.700/Mon., Infektionsklausel', rating: 4, empfohlen: false },
            { versicherer: 'Nürnberger', tarif: 'BU Premium', beitrag: '€142/Mon.', leistung: '€3.700/Mon., Dienstunfähigkeit', rating: 4, empfohlen: false }
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
        // FIDA-Empfehlungen gehoeren in den Potentiale-Tab, nicht in Open Finance
        // if (typeof renderFidaStufe2 === 'function') renderFidaStufe2();
        if (typeof renderSankeyFlow === 'function') renderSankeyFlow();
        setTimeout(function() { if (typeof addFidaActionButtons === 'function') addFidaActionButtons(); }, 100);
    }, 50);
    if (tabName === 'impulse') setTimeout(function() {
        var isBankMode = document.querySelector('#kundenDetailPage.bank-mode');
        if (isBankMode) {
            // In bank mode, re-render banking potentials into tabImpulse
            if (typeof renderBankingPotentiale === 'function') {
                var kName = getCurrentKundenName();
                renderBankingPotentiale(kName);
            }
        } else {
            if (typeof renderImpulseContent === 'function') renderImpulseContent();
        }
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

// Kommunikation ansehen
function viewKommunikation(kommId) {
    console.log('Kommunikation ansehen:', kommId);

    // Mock-Daten für Kommunikation
    const kommunikationen = {
        'email-1': {
            typ: 'E-Mail',
            datum: '28.11.2025, 09:15',
            betreff: 'Kfz-Versicherung: Ihr Vertrag läuft aus',
            inhalt: `Sehr geehrter Herr Mustermann,

Ihr Kfz-Vertrag bei der Allianz (Kennzeichen: M-AB 1234) läuft am 31.12.2025 aus.

Basierend auf Ihrer Schadenfreiheitsklasse SF12 und Ihren Fahrzeugdaten haben wir ein attraktives Angebot für Sie:

- Haftpflicht + Vollkasko: €520/Jahr (statt €680 aktuell)
- Ersparnis: €160/Jahr

Interesse? Antworten Sie einfach auf diese E-Mail oder rufen Sie uns an.

Mit freundlichen Grüßen
Ihre Versicherungsagentur`,
            status: 'Geöffnet am 28.11.2025, 14:32'
        },
        'brief-1': {
            typ: 'Brief',
            datum: '15.11.2025',
            betreff: 'Open Finance Datenfreigabe: Neue Potentiale erkannt',
            inhalt: `Sehr geehrter Herr Mustermann,

vielen Dank für Ihre Open Finance Datenfreigabe vom 15.03.2024.

Basierend auf der Analyse Ihrer Finanzdaten haben wir folgende Optimierungsmöglichkeiten identifiziert:

1. Risikolebensversicherung
   Ihre Hypothek (€320.000) ist derzeit nicht abgesichert.

2. Private Altersvorsorge
   Bei Ihrer Sparrate von €800/Monat können wir Ihre Rentenlücke schließen.

Wir würden uns freuen, diese Möglichkeiten in einem persönlichen Gespräch mit Ihnen zu besprechen.

Mit freundlichen Grüßen
Ihre Versicherungsagentur`,
            status: 'Versendet'
        },
        'call-1': {
            typ: 'Telefonat',
            datum: '10.11.2025, 11:20',
            betreff: 'Rückruf wegen Altersvorsorge-Angebot',
            inhalt: `Gesprächsnotiz:

Kunde rief zurück wegen Brief vom 15.11.

- Interesse an fondsgebundener Rentenversicherung
- Möchte Angebot mit verschiedenen Fonds-Optionen
- Bevorzugt nachhaltige ETFs
- Budget: ca. €400/Monat zusätzlich zur bestehenden Sparrate

Termin vereinbart: 12.12.2025, 14:00 Uhr
Ort: Agentur

Vorbereitung:
- 3 Angebote mit unterschiedlichen Risikoprofilen
- ESG-Fonds-Optionen`,
            status: 'Termin: 12.12.2025'
        },
        'email-2': {
            typ: 'E-Mail',
            datum: '01.10.2025, 08:00',
            betreff: 'Willkommen bei Open Finance - Ihre Daten sind jetzt verknüpft',
            inhalt: `Sehr geehrter Herr Mustermann,

vielen Dank für Ihre Open Finance Datenfreigabe!

Ab sofort können wir Ihnen personalisierte Versicherungsempfehlungen basierend auf Ihrer Finanzsituation anbieten.

Was bedeutet das für Sie?
- Wir erkennen automatisch, wenn sich Ihre Lebensumstände ändern
- Sie erhalten nur relevante Angebote
- Ihre Daten sind sicher und DSGVO-konform geschützt

Ihre freigegebenen Datenquellen:
- Sparkasse (Girokonto)
- DWS (Depot)
- Sparkasse (Hypothekendarlehen)
- Allianz (Kfz-Versicherung)

Sie können Ihre Einwilligung jederzeit über das Open Finance Dashboard widerrufen.

Mit freundlichen Grüßen
Ihre Versicherungsagentur`,
            status: 'Geöffnet am 01.10.2025, 19:45'
        }
    };

    const komm = kommunikationen[kommId];
    if (komm) {
        // Inline-Modal statt alert() – konsistent mit B-10 Kommunikations-Timeline
        var existing = document.getElementById('kommDetailOverlay');
        if (existing) existing.remove();

        var overlay = document.createElement('div');
        overlay.id = 'kommDetailOverlay';
        overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:10000;display:flex;align-items:center;justify-content:center;';
        overlay.onclick = function(e) { if (e.target === overlay) overlay.remove(); };

        var typIcon = komm.typ === 'E-Mail' ? '✉' : (komm.typ === 'Brief' ? '📄' : '📞');
        var statusColor = komm.status.includes('Geöffnet') ? '#16a34a' : (komm.status.includes('Termin') ? '#2563eb' : '#64748b');

        var modal = document.createElement('div');
        modal.style.cssText = 'background:white;border-radius:12px;max-width:560px;width:90%;max-height:80vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.3);';
        modal.innerHTML =
            '<div style="padding:20px 24px;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;">' +
                '<div style="display:flex;align-items:center;gap:10px;">' +
                    '<span style="font-size:20px;">' + typIcon + '</span>' +
                    '<div><div style="font-weight:700;font-size:15px;color:#1e293b;">' + komm.typ + '</div>' +
                    '<div style="font-size:14px;color:#64748b;">' + komm.datum + '</div></div>' +
                '</div>' +
                '<button onclick="document.getElementById(\'kommDetailOverlay\').remove()" style="background:none;border:none;cursor:pointer;font-size:20px;color:#94a3b8;padding:4px;">&times;</button>' +
            '</div>' +
            '<div style="padding:24px;">' +
                '<div style="font-weight:600;font-size:14px;color:#1e293b;margin-bottom:16px;">' + komm.betreff + '</div>' +
                '<div style="font-size:15px;color:#475569;line-height:1.7;white-space:pre-wrap;background:#f8fafc;padding:16px;border-radius:8px;border:1px solid #e2e8f0;">' + komm.inhalt + '</div>' +
                '<div style="margin-top:16px;display:flex;align-items:center;gap:8px;">' +
                    '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:' + statusColor + ';"></span>' +
                    '<span style="font-size:14px;color:' + statusColor + ';font-weight:500;">' + komm.status + '</span>' +
                '</div>' +
            '</div>';

        overlay.appendChild(modal);
        document.body.appendChild(overlay);
    }
}

// ========================================
// OPT-15: KOMMUNIKATIONSHISTORIE-UPGRADE
// ========================================

function getKommunikationForKunde(kundenName) {
    var isBanking = document.querySelector('#kundenDetailPage.bank-mode');
    var komm = [];
    if (isBanking && typeof bankMockKunden !== 'undefined') {
        var kd = bankMockKunden[kundenName];
        if (kd && kd.kommunikation) komm = kd.kommunikation;
    } else if (typeof window.mockKunden !== 'undefined') {
        var kd = window.mockKunden[kundenName];
        if (kd && kd.kommunikation) komm = kd.kommunikation;
    }
    return komm;
}

function getCurrentKundenName() {
    var nameEl = document.getElementById('kundenName');
    return nameEl ? nameEl.textContent.trim() : '';
}

function formatKommDatum(datum) {
    if (!datum) return '';
    var d;
    if (datum.includes('T')) {
        d = new Date(datum);
    } else {
        var parts = datum.split('.');
        if (parts.length === 3) return datum;
        d = new Date(datum);
    }
    if (isNaN(d.getTime())) return datum;
    var tag = String(d.getDate()).padStart(2, '0');
    var mon = String(d.getMonth() + 1).padStart(2, '0');
    var jahr = d.getFullYear();
    var std = String(d.getHours()).padStart(2, '0');
    var min = String(d.getMinutes()).padStart(2, '0');
    return tag + '.' + mon + '.' + jahr + ', ' + std + ':' + min;
}

function daysAgo(datum) {
    if (!datum) return 999;
    var d = datum.includes('T') ? new Date(datum) : new Date(datum);
    if (isNaN(d.getTime())) return 999;
    var now = new Date();
    return Math.floor((now - d) / (1000 * 60 * 60 * 24));
}

function getKommTypLabel(typ) {
    if (typeof kommTypConfig !== 'undefined' && kommTypConfig[typ]) return kommTypConfig[typ].label;
    var labels = { email: 'E-Mail', brief: 'Brief', telefon: 'Telefonat', chatbot: 'Chatbot-Gespr\u00e4ch', ki_kontakt: 'KI-generierter Kontakt', termin: 'Termin', video: 'Videocall', portal: 'Portal-Aktivit\u00e4t' };
    return labels[typ] || typ;
}

function getKommStatusLabel(status) {
    var labels = { versendet: 'Versendet', geoeffnet: 'Ge\u00f6ffnet', beantwortet: 'Beantwortet', erledigt: 'Erledigt', termin_geplant: 'Termin geplant' };
    return labels[status] || status;
}

// KI-Zusammenfassung
function renderKommSummary(kundenName) {
    var el = document.getElementById('kommSummaryCard');
    if (!el) return;

    var komm = getKommunikationForKunde(kundenName);
    if (!komm || komm.length === 0) { el.innerHTML = ''; return; }

    var isBanking = !!document.querySelector('#kundenDetailPage.bank-mode');

    // Sort by date descending
    var sorted = komm.slice().sort(function(a, b) {
        return new Date(b.datum) - new Date(a.datum);
    });

    var letzte = sorted[0];
    var offene = sorted.filter(function(k) { return k.status !== 'erledigt'; });
    var termine = sorted.filter(function(k) {
        return (k.typ === 'termin' || k.status === 'termin_geplant') && new Date(k.datum) > new Date();
    });
    var chatbots = sorted.filter(function(k) { return k.typ === 'chatbot'; });

    var summary = kundenName + ' wurde zuletzt am ' + formatKommDatum(letzte.datum) +
        ' per ' + getKommTypLabel(letzte.typ) + ' kontaktiert (\u201e' + letzte.betreff + '\u201c). ';

    if (offene.length > 0) {
        summary += 'Es gibt ' + offene.length + ' offene' + (offene.length === 1 ? 's' : '') + ' Themen. ';
    }

    if (termine.length > 0) {
        summary += 'N\u00e4chster Termin: ' + formatKommDatum(termine[0].datum) + '. ';
    }

    if (chatbots.length > 0) {
        var cb = chatbots[0];
        if (cb.ergebnis) {
            summary += (isBanking ? 'Im genoGPT Self-Service' : 'Im Self-Service Portal') + ' hat der Kunde \u201e' + cb.ergebnis + '\u201c signalisiert. ';
        }
    }

    var aiIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M12 2a10 10 0 110 20 10 10 0 010-20z"/><path d="M12 8v4l3 3"/></svg>';

    el.innerHTML = '<div class="komm-summary-card">' +
        '<div class="komm-summary-header">' + aiIcon + ' KI-Zusammenfassung der letzten 90 Tage</div>' +
        '<div class="komm-summary-text">' + summary + '</div>' +
        '</div>';
}
window.renderKommSummary = renderKommSummary;

// Sales-Impulse aus Kommunikation
function deriveKommSalesImpulse(komm) {
    var impulse = [];

    komm.forEach(function(k) {
        // Mail geoeffnet aber kein Follow-up
        if (k.typ === 'email' && k.status === 'geoeffnet' && !k.followUp) {
            var prio = daysAgo(k.datum) > 7 ? 'hoch' : 'mittel';
            impulse.push({
                quelle: k.betreff,
                impuls: 'Mail \u201e' + k.betreff + '\u201c ge\u00f6ffnet, kein R\u00fccklauf \u2013 Nachfass-Anruf',
                aktion: 'anrufen',
                prioritaet: prio
            });
        }

        // Chatbot mit Terminwunsch
        if (k.typ === 'chatbot' && k.ergebnis && k.ergebnis.toLowerCase().indexOf('termin') !== -1) {
            impulse.push({
                quelle: 'Chatbot-Gespr\u00e4ch',
                impuls: 'Kunde hat im Chatbot Termin gew\u00fcnscht: ' + k.ergebnis,
                aktion: 'termin_bestaetigen',
                prioritaet: 'hoch'
            });
        }

        // Chatbot mit Kuendigungsabsicht
        if (k.typ === 'chatbot' && k.themen && k.themen.some(function(t) {
            return t.indexOf('k\u00fcndigen') !== -1 || t.indexOf('wechsel') !== -1 || t.indexOf('kuendigen') !== -1;
        })) {
            impulse.push({
                quelle: 'Chatbot-Gespr\u00e4ch',
                impuls: 'Abwanderungsrisiko: Kunde hat nach K\u00fcndigung/Wechsel gefragt',
                aktion: 'bindungsgespraech',
                prioritaet: 'kritisch'
            });
        }

        // KI-Kontakt ohne Reaktion
        if (k.typ === 'ki_kontakt' && !k.followUp) {
            impulse.push({
                quelle: k.betreff,
                impuls: 'KI-Warnung \u201e' + k.betreff + '\u201c ohne Kundenreaktion \u2013 pers\u00f6nlich nachfassen',
                aktion: 'nachfassen',
                prioritaet: 'mittel'
            });
        }

        // Portal-Download
        if (k.typ === 'portal' && k.dokument) {
            impulse.push({
                quelle: k.betreff,
                impuls: 'Kunde besch\u00e4ftigt sich mit Thema: ' + k.betreff + ' \u2013 proaktiv kontaktieren',
                aktion: 'nachfassen',
                prioritaet: 'mittel'
            });
        }

        // Brief versendet nicht geoeffnet
        if (k.typ === 'brief' && k.status === 'versendet' && !k.followUp) {
            impulse.push({
                quelle: k.betreff,
                impuls: 'Brief \u201e' + k.betreff + '\u201c versendet \u2013 telefonisch nachhaken',
                aktion: 'anrufen',
                prioritaet: 'niedrig'
            });
        }
    });

    return impulse;
}

function renderKommSalesImpulse(kundenName) {
    var el = document.getElementById('kommSalesImpulse');
    if (!el) return;

    var komm = getKommunikationForKunde(kundenName);
    if (!komm || komm.length === 0) { el.innerHTML = ''; return; }

    var impulse = deriveKommSalesImpulse(komm);
    if (impulse.length === 0) { el.innerHTML = ''; return; }

    var prioOrder = { kritisch: 0, hoch: 1, mittel: 2, niedrig: 3 };
    impulse.sort(function(a, b) { return (prioOrder[a.prioritaet] || 3) - (prioOrder[b.prioritaet] || 3); });

    var html = '<div class="komm-sales-impulse"><div class="komm-impulse-header">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>' +
        ' Sales-Impulse aus Kommunikation</div>';

    impulse.forEach(function(imp) {
        var prioClass = 'prioritaet-' + imp.prioritaet;
        var prioLabel = imp.prioritaet.charAt(0).toUpperCase() + imp.prioritaet.slice(1);
        var aktionBtns = '';

        if (imp.aktion === 'anrufen') {
            aktionBtns = '<button class="komm-impulse-btn" onclick="kommImpulsAktion(\'anrufen\')">Anrufen</button>' +
                '<button class="komm-impulse-btn secondary" onclick="kommImpulsAktion(\'angebot\')">Angebot vorbereiten</button>';
        } else if (imp.aktion === 'termin_bestaetigen') {
            aktionBtns = '<button class="komm-impulse-btn" onclick="kommImpulsAktion(\'termin\')">Termin best\u00e4tigen</button>' +
                '<button class="komm-impulse-btn secondary" onclick="kommImpulsAktion(\'tarifvergleich\')">Tarifvergleich</button>';
        } else if (imp.aktion === 'bindungsgespraech') {
            aktionBtns = '<button class="komm-impulse-btn kritisch" onclick="kommImpulsAktion(\'bindung\')">Bindungsgespr\u00e4ch</button>' +
                '<button class="komm-impulse-btn secondary" onclick="kommImpulsAktion(\'anrufen\')">Sofort anrufen</button>';
        } else {
            aktionBtns = '<button class="komm-impulse-btn" onclick="kommImpulsAktion(\'nachfassen\')">Nachfassen</button>' +
                '<button class="komm-impulse-btn secondary" onclick="kommImpulsAktion(\'angebot\')">Angebot vorbereiten</button>';
        }

        html += '<div class="komm-impulse-card">' +
            '<div class="komm-impulse-card-header">' +
                '<span class="komm-impulse-prio ' + prioClass + '">' + prioLabel + '</span>' +
                '<span class="komm-impulse-quelle">' + imp.quelle + '</span>' +
            '</div>' +
            '<div class="komm-impulse-text">' + imp.impuls + '</div>' +
            '<div class="komm-impulse-actions">' + aktionBtns + '</div>' +
        '</div>';
    });

    html += '</div>';
    el.innerHTML = html;
}
window.renderKommSalesImpulse = renderKommSalesImpulse;

function kommImpulsAktion(aktion) {
    var labels = {
        anrufen: 'Anruf wird vorbereitet...',
        angebot: 'Angebotserstellung gestartet...',
        termin: 'Terminbest\u00e4tigung wird gesendet...',
        tarifvergleich: 'Tarifvergleich wird erstellt...',
        bindung: 'Bindungsgespr\u00e4ch geplant...',
        nachfassen: 'Nachfass-Aktion erstellt...'
    };
    var msg = labels[aktion] || 'Aktion ausgef\u00fchrt...';

    // Use triggerAction if available (OPT-04), otherwise show toast
    if (typeof triggerAction === 'function') {
        triggerAction(aktion);
    } else {
        showKommToast(msg);
    }
}
window.kommImpulsAktion = kommImpulsAktion;

function showKommToast(msg) {
    var existing = document.getElementById('kommToast');
    if (existing) existing.remove();
    var toast = document.createElement('div');
    toast.id = 'kommToast';
    toast.style.cssText = 'position:fixed;bottom:24px;right:24px;background:#1e293b;color:white;padding:12px 20px;border-radius:8px;font-size:15px;z-index:10000;box-shadow:0 4px 12px rgba(0,0,0,0.15);transition:opacity 0.3s;';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(function() {
        toast.style.opacity = '0';
        setTimeout(function() { toast.remove(); }, 300);
    }, 2500);
}

// Chatbot-Eintrag Rendering
function renderChatbotEntry(eintrag) {
    var isBanking = !!document.querySelector('#kundenDetailPage.bank-mode');
    var portalName = isBanking ? 'genoGPT Self-Service' : 'Kunden-Self-Service Portal';
    var config = (typeof kommTypConfig !== 'undefined' && kommTypConfig.chatbot) ? kommTypConfig.chatbot : { farbe: '#8b5cf6', icon: '', label: 'Chatbot' };

    var html = '<div class="komm-item chatbot" data-typ="chatbot" style="border-left-color:' + config.farbe + ';">' +
        '<div class="komm-icon" style="background:' + config.farbe + '15;color:' + config.farbe + ';">' + config.icon + '</div>' +
        '<div class="komm-content">' +
        '<div class="komm-header">' +
            '<span class="komm-type" style="color:' + config.farbe + ';">' + config.label + '</span>' +
            '<span class="komm-date">' + formatKommDatum(eintrag.datum) + '</span>' +
        '</div>' +
        '<div class="komm-subject">' + portalName + ': ' + eintrag.betreff + '</div>';

    // Chat-Verlauf als Blasen
    if (eintrag.verlauf && eintrag.verlauf.length > 0) {
        html += '<div class="chatbot-verlauf">';
        eintrag.verlauf.forEach(function(msg) {
            var isKunde = msg.rolle === 'kunde';
            html += '<div class="chat-blase ' + (isKunde ? 'chat-blase-kunde' : 'chat-blase-bot') + '">' +
                '<span class="chat-rolle">' + (isKunde ? 'Kunde' : 'Bot') + '</span>' +
                '<span class="chat-text">' + msg.text + '</span>' +
            '</div>';
        });
        html += '</div>';
    }

    // Ergebnis-Badge
    if (eintrag.ergebnis) {
        html += '<div class="chat-ergebnis-badge">' + eintrag.ergebnis + '</div>';
    }

    // Aktions-Buttons
    html += '<div class="komm-entry-actions">';
    if (eintrag.ergebnis && eintrag.ergebnis.toLowerCase().indexOf('termin') !== -1) {
        html += '<button class="komm-impulse-btn" onclick="kommImpulsAktion(\'termin\')">Termin best\u00e4tigen</button>';
    }
    html += '<button class="komm-impulse-btn secondary" onclick="kommImpulsAktion(\'angebot\')">Angebot vorbereiten</button>';
    html += '</div></div></div>';

    return html;
}

// KI-Kontakt Rendering
function renderKiKontaktEntry(eintrag) {
    var config = (typeof kommTypConfig !== 'undefined' && kommTypConfig.ki_kontakt) ? kommTypConfig.ki_kontakt : { farbe: '#06b6d4', icon: '', label: 'KI-Kontakt' };

    var html = '<div class="komm-item ki_kontakt" data-typ="ki_kontakt" style="border-left-color:' + config.farbe + ';">' +
        '<div class="komm-icon" style="background:' + config.farbe + '15;color:' + config.farbe + ';">' + config.icon + '</div>' +
        '<div class="komm-content">' +
        '<div class="komm-header">' +
            '<span class="komm-type" style="color:' + config.farbe + ';">' + config.label + '</span>' +
            '<span class="komm-date">' + formatKommDatum(eintrag.datum) + '</span>' +
        '</div>' +
        '<div class="komm-subject">' + eintrag.betreff + '</div>' +
        '<div class="komm-preview">' + (eintrag.inhalt || '') + '</div>' +
        '<div class="komm-status"><span class="komm-status-badge ' + eintrag.status + '">' + getKommStatusLabel(eintrag.status) + '</span></div>';

    html += '<div class="komm-entry-actions">' +
        '<button class="komm-impulse-btn" onclick="kommImpulsAktion(\'nachfassen\')">Nachfassen</button>' +
        '<button class="komm-impulse-btn secondary" onclick="kommImpulsAktion(\'angebot\')">Als Impuls markieren</button>' +
        '</div></div></div>';

    return html;
}

// Portal-Eintrag Rendering
function renderPortalEntry(eintrag) {
    var config = (typeof kommTypConfig !== 'undefined' && kommTypConfig.portal) ? kommTypConfig.portal : { farbe: '#6b7280', icon: '', label: 'Portal' };

    var html = '<div class="komm-item portal" data-typ="portal" style="border-left-color:' + config.farbe + ';">' +
        '<div class="komm-icon" style="background:' + config.farbe + '15;color:' + config.farbe + ';">' + config.icon + '</div>' +
        '<div class="komm-content">' +
        '<div class="komm-header">' +
            '<span class="komm-type" style="color:' + config.farbe + ';">' + config.label + '</span>' +
            '<span class="komm-date">' + formatKommDatum(eintrag.datum) + '</span>' +
        '</div>' +
        '<div class="komm-subject">' + eintrag.betreff + '</div>' +
        '<div class="komm-preview">' + (eintrag.inhalt || '') + '</div>' +
        '<div class="komm-status"><span class="komm-status-badge ' + eintrag.status + '">' + getKommStatusLabel(eintrag.status) + '</span></div>' +
        '</div></div>';

    return html;
}

// Standard-Eintrag Rendering (email, brief, telefon, termin, video)
function renderStandardKommEntry(eintrag) {
    var config = (typeof kommTypConfig !== 'undefined' && kommTypConfig[eintrag.typ]) ? kommTypConfig[eintrag.typ] : { farbe: '#64748b', icon: '', label: eintrag.typ };

    var statusBadge = '';
    if (eintrag.status === 'geoeffnet' && eintrag.geoeffnetAm) {
        statusBadge = '<span class="komm-status-badge geoeffnet"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> Ge\u00f6ffnet am ' + formatKommDatum(eintrag.geoeffnetAm) + '</span>';
    } else {
        statusBadge = '<span class="komm-status-badge ' + eintrag.status + '">' + getKommStatusLabel(eintrag.status) + '</span>';
    }

    var autoClass = eintrag.automatisch ? 'auto' : 'manuell';

    var html = '<div class="komm-item ' + autoClass + '" data-typ="' + eintrag.typ + '" style="border-left-color:' + config.farbe + ';">' +
        '<div class="komm-icon" style="background:' + config.farbe + '15;color:' + config.farbe + ';">' + config.icon + '</div>' +
        '<div class="komm-content">' +
        '<div class="komm-header">' +
            '<span class="komm-type" style="color:' + config.farbe + ';">' + (eintrag.automatisch ? 'Automatische ' : '') + config.label + '</span>' +
            '<span class="komm-date">' + formatKommDatum(eintrag.datum) + '</span>' +
        '</div>' +
        '<div class="komm-subject">' + eintrag.betreff + '</div>' +
        '<div class="komm-preview">' + (eintrag.inhalt || '') + '</div>' +
        '<div class="komm-status">' + statusBadge + '</div>' +
        '</div>' +
        '<button class="komm-action" onclick="viewKommunikation(\'' + eintrag.typ + '-detail\')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> Ansehen</button>' +
        '</div>';

    return html;
}

// Filter-Leiste
function renderKommFilter() {
    var el = document.getElementById('kommFilterBar');
    if (!el) return;

    var filters = [
        { key: 'alle', label: 'Alle' },
        { key: 'email', label: 'E-Mail' },
        { key: 'telefon', label: 'Telefon' },
        { key: 'brief', label: 'Brief' },
        { key: 'chatbot', label: 'Chatbot' },
        { key: 'ki_kontakt', label: 'KI' },
        { key: 'portal', label: 'Portal' }
    ];

    var html = '<div class="komm-filter-bar">';
    filters.forEach(function(f) {
        var activeClass = f.key === 'alle' ? ' active' : '';
        html += '<button class="komm-filter-btn' + activeClass + '" data-filter="' + f.key + '" onclick="filterKomm(\'' + f.key + '\')">' + f.label + '</button>';
    });
    html += '</div>';

    el.innerHTML = html;
}
window.renderKommFilter = renderKommFilter;

function filterKomm(typ) {
    // Update active button
    document.querySelectorAll('.komm-filter-btn').forEach(function(btn) {
        btn.classList.toggle('active', btn.getAttribute('data-filter') === typ);
    });

    // Filter timeline entries
    var items = document.querySelectorAll('#kundenKommunikation .komm-item[data-typ]');
    items.forEach(function(item) {
        if (typ === 'alle') {
            item.style.display = '';
        } else {
            item.style.display = item.getAttribute('data-typ') === typ ? '' : 'none';
        }
    });
}
window.filterKomm = filterKomm;

// Render full dynamic kommunikation timeline
function renderDynamicKommTimeline(kundenName) {
    var container = document.getElementById('kundenKommunikation');
    if (!container) return;

    var komm = getKommunikationForKunde(kundenName);
    if (!komm || komm.length === 0) return;

    // Sort by date descending
    var sorted = komm.slice().sort(function(a, b) {
        return new Date(b.datum) - new Date(a.datum);
    });

    var html = '';
    sorted.forEach(function(k) {
        if (k.typ === 'chatbot') {
            html += renderChatbotEntry(k);
        } else if (k.typ === 'ki_kontakt') {
            html += renderKiKontaktEntry(k);
        } else if (k.typ === 'portal') {
            html += renderPortalEntry(k);
        } else {
            html += renderStandardKommEntry(k);
        }
    });

    container.innerHTML = html;
}
window.renderDynamicKommTimeline = renderDynamicKommTimeline;

// Legacy-Funktion für Kompatibilität
function toggleKundenFida() {
    switchKundenTab('fida');
}

// Window-Exports für globale Verfügbarkeit
window.toggleImpulsDetail = toggleImpulsDetail;

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

// ── BANKING KUNDEN-DETAIL (merged from kunden-detail-bank.js) ──

/* ============================================================
   B-10 KUNDEN-DETAIL BANK  –  Banking Customer Detail
   Mirrors kunden-detail.js (A-10) structure exactly
   ============================================================ */

// ============================================================
// Versicherer-Auswahl in A-10 übertragen
// ============================================================
function updateKundenDetailInsurer() {
    // Aktuell gewählten Versicherer ermitteln
    var key = window.selectedInsurer || 'ergo';
    var config = window.insurerConfig ? window.insurerConfig[key] : null;
    if (!config) return;
    var name = config.name || 'ERGO';
    var domain = config.domain || 'ergo.de';

    // 1. "Eigene Versicherungen (X)" Label aktualisieren
    var label = document.getElementById('eigeneVersicherungenLabel');
    if (label) {
        label.textContent = 'Eigene Versicherungen (' + name + ')';
    }

    // 2. Eigene-Verträge-Zeilen im Absichern-Tab: Logo + Badge aktualisieren
    var rows = document.querySelectorAll('.ergo-contract-row');
    rows.forEach(function(row) {
        var anbieterTd = row.querySelectorAll('td')[1]; // Zweite Spalte = Anbieter
        if (anbieterTd) {
            var logoUrl = 'https://img.logo.dev/' + domain + '?token=pk_H7vb5Y2lTsW47U4Xq-w3HA&size=40&format=png';
            anbieterTd.innerHTML = '<img src="' + logoUrl + '" alt="' + name + '" class="versicherer-logo" width="18" height="18" style="vertical-align:middle;border-radius:4px;object-fit:contain;" onerror="this.style.display=\'none\'"> <span class="ergo-badge">' + name + '</span>';
        }
    });

    // 3. Betreute Verträge Tab: Eigene Verträge mit ausgewähltem Versicherer anzeigen
    var vertraegeBody = document.getElementById('kundenVertraege');
    if (vertraegeBody) {
        var trs = vertraegeBody.querySelectorAll('tr');
        // Produkte des Versicherers ermitteln
        var products = (window.insurerProducts && window.insurerProducts[key]) || [name];
        trs.forEach(function(tr) {
            var tds = tr.querySelectorAll('td');
            if (tds.length >= 2) {
                var anbieterTd = tds[1]; // Anbieter-Spalte (makler-only-col)
                var currentText = anbieterTd.textContent.trim();
                // Prüfe ob es ein "eigener" Vertrag ist (ERGO, DKV, etc. - Standard-Eigene)
                var defaultEigene = ['ERGO', 'ERGO Direkt', 'DKV'];
                var isEigen = defaultEigene.some(function(e) { return currentText.indexOf(e) !== -1; });
                if (isEigen) {
                    var newName = products[0] || name;
                    if (typeof versichererLogoImg === 'function') {
                        anbieterTd.innerHTML = versichererLogoImg(newName, 18) + ' ' + newName;
                    } else {
                        anbieterTd.textContent = newName;
                    }
                }
            }
        });
    }
}
window.updateKundenDetailInsurer = updateKundenDetailInsurer;

// ========================================
// OPT-07: KI-GESTÜTZTE IMPULSGENERIERUNG
// ========================================

window._kiImpulsCache = {};

function getKundenContext() {
    var isBanking = typeof isBankMode === 'function' && isBankMode();
    var kundenHeader = document.getElementById('kundenHeaderTitle');
    var kundenName = kundenHeader ? kundenHeader.textContent.replace('Kunde: ', '').trim() : '';
    if (!kundenName) {
        var nameEl = document.getElementById('kundenName');
        kundenName = nameEl ? nameEl.textContent.trim() : 'Unbekannt';
    }

    var kunde = null;
    if (isBanking && typeof bankMockKunden !== 'undefined') {
        kunde = bankMockKunden[kundenName];
    } else if (!isBanking) {
        // Insurance mode – mockKunden is local to fillKundenDetail, but we can read from DOM
        // Try to get from the fillKundenDetail scope or the global
        if (typeof window.mockKunden !== 'undefined') {
            kunde = window.mockKunden[kundenName];
        }
    }

    return { name: kundenName, data: kunde, isBanking: isBanking };
}

function buildKISystemPrompt(ctx) {
    if (ctx.isBanking) {
        return 'Du bist ein KI-Vertriebsassistent für Bankberater (Volksbank/genoGPT). ' +
            'Analysiere die Kundendaten und generiere 2-3 konkrete, priorisierte Vertriebsimpulse. ' +
            'Fokus auf: Cross-Selling (Verbundpartner R+V, Union Investment, Schwäbisch Hall, DZ PRIVATBANK), ' +
            'Anschlussfinanzierung, VR-FinanzPlan, Vermögensverwaltung, Open Finance/FIDA-Potentiale. ' +
            'Format: Für jeden Impuls: Titel, Priorität (Hoch/Mittel), Kurzbeschreibung (1-2 Sätze), geschätztes Ertragspotential. ' +
            'Antworte auf Deutsch. Sei konkret und beziehe dich auf die Kundendaten. Keine Markdown-Formatierung.';
    }
    return 'Du bist ein KI-Vertriebsassistent für Versicherungsvermittler. ' +
        'Analysiere die Kundendaten und generiere 2-3 konkrete, priorisierte Vertriebsimpulse. ' +
        'Fokus auf: Deckungslücken, Cross-Selling, Nachversicherung, Kfz-Wechsel, BU-Optimierung, ' +
        'Open Finance/FIDA-basierte Erkenntnisse, Lebenslagenwechsel. ' +
        'Format: Für jeden Impuls: Titel, Priorität (Hoch/Mittel), Kurzbeschreibung (1-2 Sätze), geschätztes Prämienvolumen. ' +
        'Antworte auf Deutsch. Sei konkret und beziehe dich auf die Kundendaten. Keine Markdown-Formatierung.';
}

function buildKIUserPrompt(ctx) {
    var parts = ['Kunde: ' + ctx.name];

    if (ctx.data) {
        var d = ctx.data;
        if (d.beruf) parts.push('Beruf: ' + d.beruf);
        if (d.familienstand) parts.push('Familienstand: ' + d.familienstand);
        if (d.geburtsdatum) parts.push('Geburtsdatum: ' + d.geburtsdatum);
        if (d.kinder && d.kinder.length > 0) {
            parts.push('Kinder: ' + d.kinder.map(function(k) { return k.name + ' (' + k.alter + ' J.)'; }).join(', '));
        }
        if (d.nettoeinkommen) parts.push('Nettoeinkommen: €' + d.nettoeinkommen.toLocaleString('de-DE') + '/Mon.');

        if (ctx.isBanking) {
            if (d.konten) {
                parts.push('Produkte: ' + d.konten.map(function(k) { return k.produkt; }).join(', '));
            }
            if (d.finanzierungen) {
                parts.push('Finanzierungen: ' + d.finanzierungen.map(function(f) { return f.produkt + ' (Restschuld: €' + Math.abs(f.restschuld || 0).toLocaleString('de-DE') + ')'; }).join(', '));
            }
            if (d.fidaVertraege && d.fidaVertraege.length > 0) {
                parts.push('FIDA-Daten: ' + d.fidaVertraege.map(function(f) { return f.institut + ' ' + f.typ; }).join(', '));
            }
            if (d.versicherungenFremd && d.versicherungenFremd.length > 0) {
                parts.push('Fremdversicherungen: ' + d.versicherungenFremd.map(function(v) { return v.produkt + ' (' + v.anbieter + ')'; }).join(', '));
            }
        } else {
            if (d.vertraege) {
                parts.push('Verträge: ' + d.vertraege.map(function(v) { return v.typ + ' (' + v.versicherer + ', ' + v.praemie + ')'; }).join(', '));
            }
            if (d.fidaVertraege && d.fidaVertraege.length > 0) {
                parts.push('FIDA-Daten: ' + d.fidaVertraege.map(function(f) { return f.institut + ' ' + f.typ + ' (' + f.info + ')'; }).join(', '));
            }
        }

        if (d.risikoscore) parts.push('Risikoscore: ' + d.risikoscore + '/100');
        if (d.nps) parts.push('NPS: ' + d.nps.score + ' (' + d.nps.kategorie + ')');
    }

    return 'Generiere personalisierte Vertriebsimpulse für diesen Kunden:\n\n' + parts.join('\n');
}

function renderKIImpulsSkeleton() {
    return '<div class="ki-impuls-card ki-impuls-loading">' +
        '<div class="ki-impuls-header">' +
            '<div class="ki-impuls-icon">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>' +
            '</div>' +
            '<div class="ki-impuls-title">KI-Impulse werden generiert...</div>' +
        '</div>' +
        '<div class="ki-impuls-skeleton">' +
            '<div class="ki-skeleton-line long"></div>' +
            '<div class="ki-skeleton-line medium"></div>' +
            '<div class="ki-skeleton-line short"></div>' +
        '</div>' +
    '</div>';
}

function parseKIResponse(text) {
    // Parse the AI response into structured impulses
    var impulse = [];
    var lines = text.split('\n').filter(function(l) { return l.trim().length > 0; });
    var current = null;

    for (var i = 0; i < lines.length; i++) {
        var line = lines[i].trim();

        // Detect impuls title patterns: "1.", "Impuls 1:", "**Title**", "- Title"
        var titleMatch = line.match(/^(?:\d+[\.\)]\s*|Impuls\s*\d+[:\s]*|[-•]\s*)(.+)/);
        if (titleMatch && !line.match(/^(?:Priorit|Beschreib|Ertrag|Prämie|Potent)/i)) {
            if (current) impulse.push(current);
            current = { titel: titleMatch[1].replace(/\*\*/g, '').replace(/:\s*$/, ''), prioritaet: 'Mittel', beschreibung: '', volumen: '' };
            continue;
        }

        if (current) {
            var prioMatch = line.match(/Priorit[äa]t[:\s]*(Hoch|Mittel|Niedrig)/i);
            if (prioMatch) {
                current.prioritaet = prioMatch[1].charAt(0).toUpperCase() + prioMatch[1].slice(1).toLowerCase();
                continue;
            }

            var volMatch = line.match(/(?:Ertrag|Prämie|Volumen|Potential)[:\s]*[€]?\s*([\d.,]+(?:\s*(?:€|EUR))?(?:\s*(?:\/|p\.?\s*a\.?|pro\s*Jahr|\/Jahr))?)/i);
            if (volMatch) {
                current.volumen = volMatch[1].replace(/\s+/g, ' ').trim();
                if (current.volumen.indexOf('€') === -1) current.volumen = '€' + current.volumen;
                continue;
            }

            var descMatch = line.match(/Beschreibung[:\s]*(.*)/i);
            if (descMatch) {
                current.beschreibung = descMatch[1].trim();
                continue;
            }

            // Append as description if nothing else matched
            if (!current.beschreibung) {
                current.beschreibung = line.replace(/\*\*/g, '');
            } else if (current.beschreibung.length < 200) {
                current.beschreibung += ' ' + line.replace(/\*\*/g, '');
            }
        }
    }
    if (current) impulse.push(current);

    return impulse.slice(0, 3); // Max 3 impulses
}

function getFallbackImpulse(ctx) {
    // Rule-based fallback when API is unavailable
    var impulse = [];
    if (typeof evaluateImpulse === 'function' && ctx.data) {
        var matched = evaluateImpulse(ctx.data);
        for (var i = 0; i < Math.min(matched.length, 3); i++) {
            impulse.push({
                titel: matched[i].impuls,
                prioritaet: matched[i].prioritaet === 'hoch' ? 'Hoch' : 'Mittel',
                beschreibung: 'Regelbasierter Impuls: ' + (matched[i].produkt || matched[i].impuls),
                volumen: '',
                fallback: true
            });
        }
    }
    if (impulse.length === 0) {
        impulse.push({
            titel: ctx.isBanking ? 'VR-FinanzPlan Beratung' : 'Bestandsüberprüfung empfohlen',
            prioritaet: 'Mittel',
            beschreibung: ctx.isBanking
                ? 'Umfassende Finanzplanung durchführen, um Cross-Selling-Potentiale zu identifizieren.'
                : 'Jährliche Bestandsprüfung durchführen, um Deckungslücken und Anpassungsbedarf zu erkennen.',
            volumen: '',
            fallback: true
        });
    }
    return impulse;
}

function renderKIImpulseResult(impulse, isFallback) {
    var config = typeof getModeConfig === 'function' ? getModeConfig() : null;
    var branding = config ? (config.impulse ? config.impulse.herkunftLabel : 'KI-Assistent') : 'KI-Assistent';
    var brandColor = config && config.branding ? config.branding.color : '#6366f1';

    var badgeText = isFallback ? 'Regelbasiert' : 'KI-generiert';
    var badgeClass = isFallback ? 'ki-badge-fallback' : 'ki-badge-ai';

    var html = '<div class="ki-impuls-card">' +
        '<div class="ki-impuls-header">' +
            '<div class="ki-impuls-icon" style="color:' + brandColor + '">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>' +
            '</div>' +
            '<div class="ki-impuls-title">' + branding + '</div>' +
            '<span class="ki-impuls-badge ' + badgeClass + '">' + badgeText + '</span>' +
        '</div>' +
        '<div class="ki-impuls-list">';

    for (var i = 0; i < impulse.length; i++) {
        var imp = impulse[i];
        var prioClass = imp.prioritaet === 'Hoch' ? 'high' : 'medium';
        html += '<div class="ki-impuls-item">' +
            '<div class="ki-impuls-item-header">' +
                '<span class="ki-impuls-item-title">' + imp.titel + '</span>' +
                '<span class="impuls-priority ' + prioClass + '">' + imp.prioritaet + '</span>' +
            '</div>' +
            '<div class="ki-impuls-item-desc">' + imp.beschreibung + '</div>' +
            (imp.volumen ? '<div class="ki-impuls-item-volumen">' + imp.volumen + '</div>' : '') +
        '</div>';
    }

    html += '</div></div>';
    return html;
}

// Render KI impulses as inline impuls-items within Whitespots/Änderungsgeschäft categories
function renderKIImpulseInline(impulse, isFallback) {
    var badgeText = isFallback ? 'Regelbasiert' : 'KI-generiert';
    var wsHtml = '';
    var aeHtml = '';

    for (var i = 0; i < impulse.length; i++) {
        var imp = impulse[i];
        var prioClass = imp.prioritaet === 'Hoch' ? 'high' : 'medium';
        var prioLabel = imp.prioritaet === 'Hoch' ? 'Hohe Priorität' : 'Mittlere Priorität';
        var detailId = 'ki-inline-' + i;

        var itemHtml = '<div class="impuls-item highlight clickable" onclick="toggleImpulsDetail(\'' + detailId + '\')">' +
            '<div class="impuls-icon">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>' +
            '</div>' +
            '<div class="impuls-text">' +
                '<strong>' + imp.titel + '</strong>' +
                '<p><span class="fida-source-badge small">' + badgeText + '</span> ' + imp.beschreibung + '</p>' +
            '</div>' +
            '<div style="text-align:right;flex-shrink:0;">' +
                (imp.volumen ? '<div class="impuls-volumen-badge">' + imp.volumen + '</div>' : '') +
            '</div>' +
            '<span class="impuls-priority ' + prioClass + '">' + prioLabel + '</span>' +
            '<span class="impuls-expand"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="6 9 12 15 18 9"></polyline></svg></span>' +
        '</div>' +
        '<div class="impuls-detail" id="' + detailId + '" style="display:none;">' +
            '<div class="impuls-detail-section"><h4>Herleitung</h4>' +
            '<div class="herleitung-grid">' +
                '<div class="herleitung-item"><span class="herleitung-label">Quelle</span><span class="herleitung-value">' + badgeText + ' – Data Intelligence Platform</span></div>' +
                '<div class="herleitung-item"><span class="herleitung-label">Erkenntnis</span><span class="herleitung-value">' + imp.beschreibung + '</span></div>' +
            '</div></div>' +
        '</div>';

        // Classify: items with "Wechsel", "Anpass", "Optimier", "Erhöh", "Nachver" → Änderungsgeschäft, rest → Whitespots
        var titel = imp.titel.toLowerCase();
        if (titel.indexOf('wechsel') >= 0 || titel.indexOf('anpass') >= 0 || titel.indexOf('optimier') >= 0 ||
            titel.indexOf('erhöh') >= 0 || titel.indexOf('nachver') >= 0 || titel.indexOf('aufstock') >= 0 ||
            titel.indexOf('umschuld') >= 0 || titel.indexOf('konsoli') >= 0) {
            aeHtml += itemHtml;
        } else {
            wsHtml += itemHtml;
        }
    }

    return { whitespots: wsHtml, aenderung: aeHtml };
}

function generateKIImpuls() {
    var wsContainer = document.getElementById('kiImpulseInlineWS');
    var aeContainer = document.getElementById('kiImpulseInlineAE');
    var hasInline = wsContainer || aeContainer;

    // Fallback: render into kiImpulsCard if inline containers not available
    var container = document.getElementById('kiImpulsCard');
    if (!hasInline && !container) return;

    var ctx = getKundenContext();
    var cacheKey = ctx.name + '_' + (ctx.isBanking ? 'bank' : 'vers') + '_inline';

    // Check cache for inline
    if (hasInline && window._kiImpulsCache[cacheKey]) {
        if (wsContainer) wsContainer.innerHTML = window._kiImpulsCache[cacheKey].whitespots || '';
        if (aeContainer) aeContainer.innerHTML = window._kiImpulsCache[cacheKey].aenderung || '';
        return;
    }

    // Show inline skeleton
    if (hasInline) {
        var skelItem = '<div class="impuls-item" style="opacity:0.5;"><div class="impuls-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg></div><div class="impuls-text"><strong>KI-Impulse werden generiert...</strong><p style="background:#e5e7eb;height:12px;border-radius:4px;width:70%;margin:6px 0;"></p></div></div>';
        if (wsContainer) wsContainer.innerHTML = skelItem;
    } else if (container) {
        container.innerHTML = renderKIImpulsSkeleton();
    }

    var apiUrl = window.CLAUDE_WORKER_URL || 'https://vst-claude-api.eike-3e2.workers.dev';
    var systemPrompt = buildKISystemPrompt(ctx);
    var userPrompt = buildKIUserPrompt(ctx);

    fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: window.CLAUDE_MODEL || 'claude-haiku-4-5-20251001',
            max_tokens: 800,
            system: systemPrompt,
            messages: [{ role: 'user', content: userPrompt }]
        })
    })
    .then(function(response) {
        if (!response.ok) throw new Error('API Error: ' + response.status);
        return response.json();
    })
    .then(function(data) {
        var text = '';
        if (data.content && data.content.length > 0) {
            text = data.content[0].text || '';
        }
        if (!text) throw new Error('Empty response');

        var impulse = parseKIResponse(text);
        if (impulse.length === 0) throw new Error('No impulses parsed');

        renderKIImpulseToContainers(impulse, false, hasInline, wsContainer, aeContainer, container, cacheKey);
    })
    .catch(function(err) {
        console.warn('KI-Impuls API Fehler, nutze Fallback:', err.message);
        var fallback = getFallbackImpulse(ctx);
        renderKIImpulseToContainers(fallback, true, hasInline, wsContainer, aeContainer, container, cacheKey);
    });
}

function renderKIImpulseToContainers(impulse, isFallback, hasInline, wsContainer, aeContainer, container, cacheKey) {
    if (hasInline) {
        var inline = renderKIImpulseInline(impulse, isFallback);
        if (wsContainer) wsContainer.innerHTML = inline.whitespots;
        if (aeContainer) aeContainer.innerHTML = inline.aenderung;
        window._kiImpulsCache[cacheKey] = inline;
    } else if (container) {
        var html = renderKIImpulseResult(impulse, isFallback);
        container.innerHTML = html;
        window._kiImpulsCache[cacheKey] = html;
    }
}
window.generateKIImpuls = generateKIImpuls;

// ========================================
// OPT-08: CLV-SZENARIEN
// ========================================

function renderCLVSzenarien() {
    var container = document.getElementById('clvSzenarienContainer');
    if (!container) return;
    if (container.querySelector('.clv-szenarien-card')) return;

    var isBanking = typeof isBankMode === 'function' && isBankMode();

    var szenarien;
    if (isBanking) {
        szenarien = [
            { name: 'Basis (Status Quo)', clv: 18500, delta: 0, aktionen: 'Bestehende Produkte weiterführen', color: '#94a3b8' },
            { name: 'Anschlussfinanzierung', clv: 24200, delta: 5700, aktionen: 'Forward-Darlehen €185.000 + Zinsoptimierung', color: '#3b82f6' },
            { name: 'Cross-Selling Verbund', clv: 31800, delta: 13300, aktionen: '+ R+V Risikoleben + Union Depot-Erhöhung + VR-FinanzPlan', color: '#16a34a' },
            { name: 'Full Potential', clv: 38500, delta: 20000, aktionen: '+ DZ PRIVATBANK Vermögensverwaltung + Schwäbisch Hall BSV', color: '#6366f1' }
        ];
    } else {
        szenarien = [
            { name: 'Basis (Status Quo)', clv: 12800, delta: 0, aktionen: 'BU + Wohngebäude weiterführen', color: '#94a3b8' },
            { name: 'Deckungslücken schließen', clv: 19200, delta: 6400, aktionen: '+ Risikoleben €300.000 + BU-Erhöhung auf €2.500', color: '#3b82f6' },
            { name: 'Cross-Selling', clv: 24600, delta: 11800, aktionen: '+ Fondspolice €250/Mon. + Kfz-Wechsel + Rechtsschutz', color: '#16a34a' },
            { name: 'Full Potential', clv: 29400, delta: 16600, aktionen: '+ Unfallversicherung + Hausrat-Upgrade + PKV-Zusatz', color: '#6366f1' }
        ];
    }

    var maxClv = szenarien[szenarien.length - 1].clv;

    var html = '<div class="kunden-card clv-szenarien-card">' +
        '<div class="kunden-card-header"><h2><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg> CLV-Szenarien</h2></div>' +
        '<div class="clv-szenarien-list">';

    for (var i = 0; i < szenarien.length; i++) {
        var s = szenarien[i];
        var pct = Math.round(s.clv / maxClv * 100);
        html += '<div class="clv-szenario-item">' +
            '<div class="clv-szenario-header">' +
                '<span class="clv-szenario-name">' + s.name + '</span>' +
                '<span class="clv-szenario-value" style="color:' + s.color + '">€' + s.clv.toLocaleString('de-DE') + '</span>' +
                (s.delta > 0 ? '<span class="clv-szenario-delta">+€' + s.delta.toLocaleString('de-DE') + '</span>' : '') +
            '</div>' +
            '<div class="clv-szenario-bar-bg"><div class="clv-szenario-bar" style="width:' + pct + '%;background:' + s.color + '"></div></div>' +
            '<div class="clv-szenario-aktionen">' + s.aktionen + '</div>' +
        '</div>';
    }

    html += '</div></div>';
    container.innerHTML = html;
}
window.renderCLVSzenarien = renderCLVSzenarien;

// ========================================
// OPT-02: NARRATIVE KUNDENANSICHT + TIMELINE
// ========================================

function renderLifeEventTimeline() {
    var container = document.getElementById('lifeEventTimelineContainer');
    if (!container) return;
    if (container.querySelector('.life-timeline-card')) return;

    var isBanking = typeof isBankMode === 'function' && isBankMode();

    var events;
    if (isBanking) {
        events = [
            { datum: '2008', label: 'Berufseinstieg Continental AG', typ: 'beruf', detail: 'Maschinenbau-Ingenieur' },
            { datum: '2010', label: 'Kontoeröffnung Volksbank', typ: 'produkt', detail: 'VR-Girokonto Plus' },
            { datum: '2012', label: 'Heirat', typ: 'leben', detail: 'Familienstand: Verheiratet' },
            { datum: '2014', label: 'Kind geboren: Lukas', typ: 'leben', detail: '1. Kind' },
            { datum: '2016', label: 'Baufinanzierung DZ HYP', typ: 'produkt', detail: '€240.000, Zinsbindung 10 J.' },
            { datum: '2017', label: 'Kind geboren: Emma', typ: 'leben', detail: '2. Kind' },
            { datum: '2018', label: 'Riester-Rente gestartet', typ: 'produkt', detail: 'Union Investment €175/Mon.' },
            { datum: '2022', label: 'ETF-Sparplan gestartet', typ: 'produkt', detail: 'VR-MeinDepot €300/Mon.' },
            { datum: '2026', label: 'Zinsbindung endet', typ: 'aktion', detail: 'Anschlussfinanzierung €185.000 erforderlich' }
        ];
    } else {
        events = [
            { datum: '2016', label: 'Berufseinstieg TechCorp GmbH', typ: 'beruf', detail: 'Angestellter' },
            { datum: '2017', label: 'Kind geboren: Lena', typ: 'leben', detail: '1. Kind' },
            { datum: '2018', label: 'BU-Versicherung abgeschlossen', typ: 'produkt', detail: 'ERGO BU-Rente €1.500/Mon.' },
            { datum: '2019', label: 'Wohngebäudeversicherung', typ: 'produkt', detail: 'VHV €450.000 Vers.-Summe' },
            { datum: '2020', label: 'Hauskauf + Hypothek', typ: 'leben', detail: 'Sparkasse €285.000' },
            { datum: '2021', label: 'Kind geboren: Paul', typ: 'leben', detail: '2. Kind' },
            { datum: '2024', label: 'Open Finance Consent', typ: 'aktion', detail: '6 Datenquellen verknüpft' },
            { datum: '2025', label: 'Kfz-Vertrag läuft aus', typ: 'aktion', detail: 'Allianz Kfz, Wechsel-Potential' }
        ];
    }

    var typColors = { beruf: '#6366f1', leben: '#ec4899', produkt: '#3b82f6', aktion: '#f59e0b' };
    var typIcons = {
        beruf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>',
        leben: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>',
        produkt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
        aktion: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>'
    };

    var html = '<div class="kunden-card life-timeline-card">' +
        '<div class="kunden-card-header"><h2><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Lebens-Timeline</h2></div>' +
        '<div class="life-timeline">';

    for (var i = 0; i < events.length; i++) {
        var e = events[i];
        var color = typColors[e.typ] || '#94a3b8';
        var icon = typIcons[e.typ] || '';
        html += '<div class="life-timeline-item">' +
            '<div class="life-timeline-dot" style="background:' + color + '">' + icon + '</div>' +
            '<div class="life-timeline-content">' +
                '<div class="life-timeline-datum">' + e.datum + '</div>' +
                '<div class="life-timeline-label">' + e.label + '</div>' +
                '<div class="life-timeline-detail">' + e.detail + '</div>' +
            '</div>' +
        '</div>';
    }

    html += '</div></div>';
    container.innerHTML = html;
}
window.renderLifeEventTimeline = renderLifeEventTimeline;

// ========================================
// OPT-12: RISIKOSCORING → PRODUKTSTEUERUNG
// ========================================

function renderRisikoscoring() {
    var container = document.getElementById('risikoscoringContainer');
    if (!container) return;
    if (container.querySelector('.risikoscoring-card')) return;

    var isBanking = typeof isBankMode === 'function' && isBankMode();

    var score, details, empfehlungen;
    if (isBanking) {
        score = 28;
        details = [
            { label: 'Bonität', wert: 82, max: 100, farbe: '#16a34a' },
            { label: 'Zahlungsverhalten', wert: 95, max: 100, farbe: '#16a34a' },
            { label: 'Verschuldungsgrad', wert: 45, max: 100, farbe: '#f59e0b' },
            { label: 'Einkommensstabilität', wert: 90, max: 100, farbe: '#16a34a' }
        ];
        empfehlungen = [
            { text: 'Kreditlimit erhöhbar auf €15.000 (aktuell €10.000)', typ: 'positiv' },
            { text: 'Baufinanzierung: Sondertilgung empfohlen zur Risikoreduktion', typ: 'neutral' },
            { text: 'R+V Risikoleben zur Restschuldabsicherung empfohlen', typ: 'aktion' }
        ];
    } else {
        score = 35;
        details = [
            { label: 'Risikosportarten', wert: 65, max: 100, farbe: '#ef4444' },
            { label: 'Schadenhistorie', wert: 40, max: 100, farbe: '#f59e0b' },
            { label: 'Deckungsgrad', wert: 55, max: 100, farbe: '#f59e0b' },
            { label: 'NPS / Bindung', wert: 90, max: 100, farbe: '#16a34a' }
        ];
        empfehlungen = [
            { text: 'Risikosport-Zuschlag BU prüfen (Skydiving, Bungee erkannt)', typ: 'warnung' },
            { text: 'Risikoleben OHNE Extremsport-Ausschluss wählen', typ: 'aktion' },
            { text: 'Deckungslücke: Hypothek €285.000 ungesichert', typ: 'warnung' }
        ];
    }

    var scoreColor = score <= 30 ? '#16a34a' : (score <= 60 ? '#f59e0b' : '#ef4444');
    var scoreLabel = score <= 30 ? 'Niedriges Risiko' : (score <= 60 ? 'Mittleres Risiko' : 'Hohes Risiko');

    var html = '<div class="kunden-card risikoscoring-card">' +
        '<div class="kunden-card-header"><h2><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> Risikoscoring</h2></div>' +
        '<div class="risiko-score-overview">' +
            '<div class="risiko-score-circle" style="border-color:' + scoreColor + '">' +
                '<span class="risiko-score-value" style="color:' + scoreColor + '">' + score + '</span>' +
                '<span class="risiko-score-label">' + scoreLabel + '</span>' +
            '</div>' +
            '<div class="risiko-score-details">';

    for (var i = 0; i < details.length; i++) {
        var d = details[i];
        html += '<div class="risiko-detail-row">' +
            '<span class="risiko-detail-label">' + d.label + '</span>' +
            '<div class="risiko-detail-bar-bg"><div class="risiko-detail-bar" style="width:' + d.wert + '%;background:' + d.farbe + '"></div></div>' +
            '<span class="risiko-detail-wert">' + d.wert + '</span>' +
        '</div>';
    }

    html += '</div></div>' +
        '<div class="risiko-empfehlungen">';

    for (var j = 0; j < empfehlungen.length; j++) {
        var e = empfehlungen[j];
        var eClass = e.typ === 'warnung' ? 'risiko-emp-warn' : (e.typ === 'aktion' ? 'risiko-emp-action' : (e.typ === 'positiv' ? 'risiko-emp-positive' : 'risiko-emp-neutral'));
        html += '<div class="risiko-empfehlung ' + eClass + '">' + e.text + '</div>';
    }

    html += '</div></div>';
    container.innerHTML = html;
}
window.renderRisikoscoring = renderRisikoscoring;

// ========================================
// OPT-11: PROVISIONSPLANUNG
// ========================================

function renderProvisionsplanung() {
    var container = document.getElementById('provisionsplanungContainer');
    if (!container) return;
    if (container.querySelector('.provisions-card')) return;

    var isBanking = typeof isBankMode === 'function' && isBankMode();

    var positionen;
    if (isBanking) {
        positionen = [
            { produkt: 'Baufinanzierung Prolongation', volumen: 185000, ertrag: 2775, typ: 'Provision', haftung: '5 Jahre', storno: 0.02 },
            { produkt: 'VR-MeinDepot Erhöhung', volumen: 12800, ertrag: 192, typ: 'Bestandsprovision', haftung: '-', storno: 0.05 },
            { produkt: 'R+V Risikoleben', volumen: 6000, ertrag: 540, typ: 'Abschluss', haftung: '5 Jahre', storno: 0.08 },
            { produkt: 'Union VermögenPlus', volumen: 3700, ertrag: 185, typ: 'Bestandsprovision', haftung: '-', storno: 0.03 }
        ];
    } else {
        positionen = [
            { produkt: 'Risikolebensversicherung', volumen: 6000, ertrag: 540, typ: 'Abschluss', haftung: '5 Jahre', storno: 0.08 },
            { produkt: 'Fondspolice', volumen: 3000, ertrag: 1200, typ: 'Abschluss', haftung: '5 Jahre', storno: 0.12 },
            { produkt: 'Kfz-Wechsel', volumen: 520, ertrag: 78, typ: 'Abschluss', haftung: '1 Jahr', storno: 0.15 },
            { produkt: 'BU-Erhöhung', volumen: 1800, ertrag: 450, typ: 'Dynamik', haftung: '5 Jahre', storno: 0.06 }
        ];
    }

    var totalErtrag = positionen.reduce(function(s, p) { return s + p.ertrag; }, 0);
    var totalStorno = positionen.reduce(function(s, p) { return s + (p.ertrag * p.storno); }, 0);
    var nettoErtrag = totalErtrag - totalStorno;

    var html = '<div class="kunden-card provisions-card">' +
        '<div class="kunden-card-header"><h2><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><circle cx="12" cy="12" r="10"/><text x="12" y="16" text-anchor="middle" fill="currentColor" stroke="none" font-size="12" font-weight="bold">\u20AC</text></svg> Provisionsplanung</h2></div>' +
        '<div class="provisions-summary">' +
            '<div class="provisions-kpi"><span class="provisions-kpi-label">Brutto-Ertrag</span><span class="provisions-kpi-value">€' + totalErtrag.toLocaleString('de-DE') + '</span></div>' +
            '<div class="provisions-kpi"><span class="provisions-kpi-label">Stornoreserve</span><span class="provisions-kpi-value negative">-€' + Math.round(totalStorno).toLocaleString('de-DE') + '</span></div>' +
            '<div class="provisions-kpi"><span class="provisions-kpi-label">Netto-Ertrag</span><span class="provisions-kpi-value positive">€' + Math.round(nettoErtrag).toLocaleString('de-DE') + '</span></div>' +
        '</div>' +
        '<table class="provisions-table"><thead><tr><th>Produkt</th><th>Volumen</th><th>Ertrag</th><th>Typ</th><th>Haftung</th><th>Stornorisiko</th></tr></thead><tbody>';

    for (var i = 0; i < positionen.length; i++) {
        var p = positionen[i];
        var stornoClass = p.storno >= 0.1 ? 'storno-high' : (p.storno >= 0.06 ? 'storno-medium' : 'storno-low');
        html += '<tr>' +
            '<td><strong>' + p.produkt + '</strong></td>' +
            '<td>€' + p.volumen.toLocaleString('de-DE') + '</td>' +
            '<td class="text-right"><strong>€' + p.ertrag.toLocaleString('de-DE') + '</strong></td>' +
            '<td>' + p.typ + '</td>' +
            '<td>' + p.haftung + '</td>' +
            '<td><span class="storno-badge ' + stornoClass + '">' + (p.storno * 100).toFixed(0) + '%</span></td>' +
        '</tr>';
    }

    html += '</tbody></table></div>';
    container.innerHTML = html;
}
window.renderProvisionsplanung = renderProvisionsplanung;

// ========================================
// OPT-05: TABLET / BERATUNGSMODUS TOGGLE
// ========================================

function initBeratungsmodusToggle() {
    if (document.getElementById('beratungsmodusToggle')) return;

    var btn = document.createElement('button');
    btn.id = 'beratungsmodusToggle';
    btn.className = 'beratungsmodus-toggle';
    btn.title = 'Beratungsmodus umschalten';
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>';
    btn.onclick = function() {
        var page = document.getElementById('kundenDetailPage');
        if (!page) return;
        var isActive = page.classList.toggle('beratungsmodus-active');
        btn.classList.toggle('active', isActive);
        if (isActive) {
            openBeratungsOverlay();
        } else {
            closeBeratungsOverlay();
        }
    };
    document.body.appendChild(btn);
}

// Only show toggle when on kunden-detail page
(function() {
    var observer2 = new MutationObserver(function() {
        var page = document.getElementById('kundenDetailPage');
        var toggle = document.getElementById('beratungsmodusToggle');
        if (page && page.style.display !== 'none') {
            if (!toggle) initBeratungsmodusToggle();
            else toggle.style.display = '';
        } else if (toggle) {
            toggle.style.display = 'none';
        }
    });
    document.addEventListener('DOMContentLoaded', function() {
        var page = document.getElementById('kundenDetailPage');
        if (page) observer2.observe(page, { attributes: true });
    });
})();

// ========================================
// OPT-10: BERATUNGSMODUS MIT GESPRÄCHSFÜHRUNG
// ========================================

var beratungsSchritte = [
    { nr: 1, titel: 'Begrüssung & Rapport', detail: 'Kunde namentlich begrüssen, aktuellen Anlass ansprechen, Gesprächsziel klären.' },
    { nr: 2, titel: 'Bedarfsanalyse', detail: 'Aktuelle Lebenssituation erfragen, Veränderungen seit letztem Kontakt, Wünsche und Ziele.' },
    { nr: 3, titel: 'Ist-Analyse vorstellen', detail: 'Bestehende Verträge/Produkte zeigen, Open Finance Daten besprechen, Deckungslücken aufzeigen.' },
    { nr: 4, titel: 'Empfehlung präsentieren', detail: 'Konkrete Vorschläge mit KI-Begründung vorstellen, Tarifvergleich zeigen, CLV-Szenarien erläutern.' },
    { nr: 5, titel: 'Einwandbehandlung', detail: 'Rückfragen klären, Alternativen anbieten, Preis-Leistung verdeutlichen.' },
    { nr: 6, titel: 'Abschluss', detail: 'Zusammenfassung, nächste Schritte vereinbaren, Angebot erstellen oder Termin für Nachgespräch.' },
    { nr: 7, titel: 'Dokumentation', detail: 'Beratungsprotokoll erstellen, Kundenakte aktualisieren, Follow-up planen.' }
];

function openBeratungsOverlay() {
    if (document.getElementById('beratungsOverlay')) return;

    var overlay = document.createElement('div');
    overlay.id = 'beratungsOverlay';
    overlay.className = 'beratung-overlay';

    var html = '<div class="beratung-header">' +
        '<h3>Gesprächsleitfaden</h3>' +
        '<button class="beratung-close" onclick="closeBeratungsOverlay()">&times;</button>' +
    '</div>' +
    '<div class="beratung-body">';

    for (var i = 0; i < beratungsSchritte.length; i++) {
        var s = beratungsSchritte[i];
        var activeClass = i === 0 ? ' active' : '';
        html += '<div class="beratung-schritt' + activeClass + '" onclick="toggleBeratungsSchritt(this, ' + i + ')">' +
            '<div class="beratung-schritt-title"><span class="beratung-schritt-nummer">' + s.nr + '</span> ' + s.titel + '</div>' +
            '<div class="beratung-schritt-detail">' + s.detail + '</div>' +
        '</div>';
    }

    html += '</div>' +
    '<div class="beratung-protokoll">' +
        '<button class="beratung-protokoll-btn" onclick="generateBeratungsprotokoll()">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>' +
            'Beratungsprotokoll erstellen' +
        '</button>' +
    '</div>';

    overlay.innerHTML = html;
    document.body.appendChild(overlay);
}
window.openBeratungsOverlay = openBeratungsOverlay;

function closeBeratungsOverlay() {
    var overlay = document.getElementById('beratungsOverlay');
    if (overlay) overlay.remove();
    var page = document.getElementById('kundenDetailPage');
    if (page) page.classList.remove('beratungsmodus-active');
    var toggle = document.getElementById('beratungsmodusToggle');
    if (toggle) toggle.classList.remove('active');
}
window.closeBeratungsOverlay = closeBeratungsOverlay;

function toggleBeratungsSchritt(el, idx) {
    var schritte = el.parentNode.querySelectorAll('.beratung-schritt');
    // Toggle done state
    if (el.classList.contains('active')) {
        el.classList.remove('active');
        el.classList.add('done');
        // Activate next
        if (schritte[idx + 1]) schritte[idx + 1].classList.add('active');
    } else if (el.classList.contains('done')) {
        el.classList.remove('done');
        el.classList.add('active');
    } else {
        schritte.forEach(function(s) { s.classList.remove('active'); });
        el.classList.add('active');
    }
}
window.toggleBeratungsSchritt = toggleBeratungsSchritt;

function generateBeratungsprotokoll() {
    var kundenName = '';
    var nameEl = document.getElementById('kundenName');
    if (nameEl) kundenName = nameEl.textContent.trim();

    var schritte = document.querySelectorAll('#beratungsOverlay .beratung-schritt');
    var completed = 0;
    schritte.forEach(function(s) { if (s.classList.contains('done')) completed++; });

    if (typeof showAngebotToast === 'function') {
        showAngebotToast('success', 'Protokoll erstellt: Beratung ' + kundenName + ' (' + completed + '/' + schritte.length + ' Schritte abgeschlossen)');
    }
}
window.generateBeratungsprotokoll = generateBeratungsprotokoll;

window.__registerModule('kunden-detail-features.js');

