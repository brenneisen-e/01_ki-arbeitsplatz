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
        // OPT-25-C: Bezahlen moved to Finanzprofil tab
        if (typeof renderSankeyFlow === 'function') renderSankeyFlow();
        setTimeout(function() { if (typeof addFidaActionButtons === 'function') addFidaActionButtons(); }, 100);
    }, 50);
    if (tabName === 'impulse') setTimeout(function() {
        // OPT-25-B: Render Absicherungsstatus as first element in Potentiale tab
        var kName = getCurrentKundenName();
        if (typeof renderLueckenLeiste === 'function') renderLueckenLeiste(kName);
        var isBankMode = document.querySelector('#kundenDetailPage.bank-mode');
        if (isBankMode) {
            // In bank mode, re-render banking potentials into tabImpulse
            if (typeof renderBankingPotentiale === 'function') {
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
    // OPT-25-B: Absicherungsstatus moved to Potentiale tab
    if (tabName === 'vertraege') setTimeout(function() {}, 50);
    if (tabName === 'finanzprofil') setTimeout(function() {
        var kName = getCurrentKundenName();
        if (typeof renderFinanzprofil === 'function') renderFinanzprofil(kName);
        // OPT-25-C: Bezahlen-Daten im Finanzprofil rendern
        if (typeof renderBezahlenContent === 'function') renderBezahlenContent();
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

// Fallback export for viewKommunikation (loaded from kunden-detail-komm.js)
window.viewKommunikation = typeof viewKommunikation === 'function' ? viewKommunikation : function() {};

// ========================================
// 20-D: LÜCKEN-LEISTE (ABSICHERUNGSSTATUS)
// ========================================

var absicherungsBereiche = [
    { key: 'kfz', label: 'KFZ', keywords: ['kfz', 'kasko'] },
    { key: 'haftpflicht', label: 'Haftpfl.', keywords: ['haftpflicht'] },
    { key: 'hausrat', label: 'Hausrat', keywords: ['hausrat'] },
    { key: 'bu', label: 'BU', keywords: ['bu', 'berufsunfähigkeit', 'berufsunf'] },
    { key: 'rlv', label: 'RLV', keywords: ['risiko', 'rlv', 'risikoleben'] },
    { key: 'pflege', label: 'Pflege', keywords: ['pflege'] },
    { key: 'unfall', label: 'Unfall', keywords: ['unfall'] },
    { key: 'rechtsschutz', label: 'Rechtssch.', keywords: ['rechtsschutz'] },
    { key: 'wohngebaeude', label: 'Wohngeb.', keywords: ['wohngebäude', 'wohngebaeude', 'wohngeb'] }
];

function renderLueckenLeiste(kundenName) {
    var container = document.getElementById('lueckenLeiste');
    if (!container) return;

    var kundenPage = document.getElementById('kundenDetailPage');
    var isBankMode = kundenPage && kundenPage.classList.contains('bank-mode');

    var vertraege = [];
    if (isBankMode && typeof bankMockKunden !== 'undefined') {
        var bk = bankMockKunden[kundenName];
        if (bk) {
            (bk.versicherungenEigen || []).forEach(function(v) { vertraege.push(v.versicherung || ''); });
            (bk.versicherungenFremd || []).forEach(function(v) { vertraege.push(v.versicherung || ''); });
        }
    } else if (typeof window.mockKunden !== 'undefined') {
        var mk = window.mockKunden[kundenName];
        if (mk && mk.vertraege) {
            mk.vertraege.forEach(function(v) { vertraege.push(v.typ || ''); });
        }
    }

    var vertraegeStr = vertraege.join('|').toLowerCase();
    var vorhanden = [];
    var luecken = [];

    absicherungsBereiche.forEach(function(bereich) {
        var found = bereich.keywords.some(function(kw) { return vertraegeStr.indexOf(kw) >= 0; });
        if (found) vorhanden.push(bereich);
        else luecken.push(bereich);
    });

    var html = '<div class="kunden-card luecken-card"><div class="kunden-card-header"><h2>' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>' +
        ' Absicherungsstatus</h2></div><div class="luecken-badges">';

    absicherungsBereiche.forEach(function(bereich) {
        var found = bereich.keywords.some(function(kw) { return vertraegeStr.indexOf(kw) >= 0; });
        if (found) {
            html += '<span class="luecke-badge luecke-ok" title="' + bereich.label + ' vorhanden"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="20 6 9 17 4 12"></polyline></svg> ' + bereich.label + '</span>';
        } else {
            html += '<span class="luecke-badge luecke-fehlt" title="' + bereich.label + ' fehlt"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> ' + bereich.label + '</span>';
        }
    });

    html += '</div>';

    if (luecken.length > 0) {
        html += '<div class="luecken-detail"><strong>' + luecken.length + ' Lücke' + (luecken.length > 1 ? 'n' : '') + ' erkannt:</strong><ul>';
        luecken.forEach(function(l, i) {
            html += '<li>' + (i + 1) + '. ' + l.label + ' <a href="javascript:void(0)" onclick="switchKundenTab(\'impulse\')" class="luecke-link">Impuls öffnen</a></li>';
        });
        html += '</ul></div>';
    } else {
        html += '<div class="luecken-detail luecken-ok-msg"><strong>Alle Kernbereiche abgesichert</strong></div>';
    }

    html += '</div>';
    container.innerHTML = html;
}
window.renderLueckenLeiste = renderLueckenLeiste;

// ========================================
// 20-B: LEBENSSITUATIONS-BADGE IM HEADER
// ========================================

function detectLebenssituation(kunde) {
    var tags = [];
    if (kunde.kinder && kunde.kinder.length > 0) tags.push(kunde.kinder.length + ' Kinder');
    var fs = (kunde.familienstand || '').toLowerCase();
    if (fs.indexOf('verheiratet') >= 0) tags.push('verheiratet');
    else if (fs.indexOf('geschieden') >= 0) tags.push('geschieden');
    else if (fs.indexOf('ledig') >= 0) tags.push('Single');
    else tags.push(kunde.familienstand || 'k.A.');

    // Eigenheim check
    var vertraege = kunde.vertraege || [];
    var hatEigenheim = vertraege.some(function(v) {
        var t = (v.typ || '').toLowerCase();
        return t.indexOf('wohngebäude') >= 0 || t.indexOf('wohngeb') >= 0 || t.indexOf('baufi') >= 0;
    });
    // Banking check
    if (!hatEigenheim && kunde.finanzierungen) {
        hatEigenheim = kunde.finanzierungen.some(function(f) {
            return (f.kredit || '').toLowerCase().indexOf('baufi') >= 0;
        });
    }
    if (!hatEigenheim && kunde.konten) {
        hatEigenheim = kunde.konten.some(function(k) {
            return (k.produkt || '').toLowerCase().indexOf('baufi') >= 0;
        });
    }
    if (hatEigenheim) tags.push('Eigenheim');
    else tags.push('Miete');

    // Lebensphase
    var alter = 40;
    var geb = kunde.geburtsdatum;
    if (geb) {
        var parts = geb.split('.');
        if (parts.length === 3) {
            var birthYear = parseInt(parts[2]);
            alter = new Date().getFullYear() - birthYear;
        }
    }

    var phase, icon;
    if (alter < 30) { phase = 'Berufseinsteiger'; icon = '\u{1F4BC}'; }
    else if (alter < 45 && kunde.kinder && kunde.kinder.length > 0) { phase = 'Familie'; icon = '\u{1F468}\u200D\u{1F469}\u200D\u{1F467}\u200D\u{1F466}'; }
    else if (alter < 45) { phase = 'Aufbauphase'; icon = '\u{1F4C8}'; }
    else if (alter < 60) { phase = 'Konsolidierung'; icon = '\u{1F6E1}\uFE0F'; }
    else { phase = 'Best Ager'; icon = '\u2600\uFE0F'; }

    return { phase: phase, tags: tags, icon: icon, alter: alter };
}

// renderLebenssituationBadge GELÖSCHT (OPT-24)
// Stub kept for backwards compat
function renderLebenssituationBadge() {}
window.renderLebenssituationBadge = renderLebenssituationBadge;

// ========================================
// 20-C: FINANZPROFIL-TAB
// ========================================

function renderFinanzprofil(kundenName) {
    var container = document.getElementById('finanzprofilContent');
    if (!container) return;

    var kundenPage = document.getElementById('kundenDetailPage');
    var isBankMode = kundenPage && kundenPage.classList.contains('bank-mode');

    var nettoeinkommen = 3800;
    var praemienListe = [];
    var verpflichtungen = [];
    var sparenPosten = [];

    if (isBankMode && typeof bankMockKunden !== 'undefined') {
        var bk = bankMockKunden[kundenName];
        if (bk) {
            nettoeinkommen = bk.nettoeinkommen || 3800;
            (bk.versicherungenEigen || []).forEach(function(v) {
                var p = parsePraemieMonatlich(v.praemie);
                praemienListe.push({ label: v.versicherung, anbieter: v.anbieter, betrag: p });
            });
            (bk.versicherungenFremd || []).forEach(function(v) {
                var p = parsePraemieMonatlich(v.praemie);
                praemienListe.push({ label: v.versicherung, anbieter: v.anbieter, betrag: p });
            });
            (bk.finanzierungen || []).forEach(function(f) {
                var rate = 0;
                var m = (f.rate || '').match(/[\d.,]+/);
                if (m) rate = parseFloat(m[0].replace('.', '').replace(',', '.'));
                verpflichtungen.push({ label: f.kredit + ' ' + f.kreditgeber, betrag: rate, quelle: '' });
            });
            (bk.sparenKapitalmarkt || []).forEach(function(s) {
                var sr = 0;
                var m = (s.sparrate || '').match(/[\d.,]+/);
                if (m) sr = parseFloat(m[0].replace('.', '').replace(',', '.'));
                if (sr > 0) sparenPosten.push({ label: s.produkt + ' ' + s.anbieter, betrag: sr, quelle: s.quelle || '' });
            });
        }
    } else if (typeof window.mockKunden !== 'undefined') {
        var mk = window.mockKunden[kundenName];
        if (mk) {
            // Use nettoeinkommen from mockKunden data or estimate
            nettoeinkommen = mk.nettoeinkommen || 3800;
            (mk.vertraege || []).forEach(function(v) {
                var p = parsePraemieMonatlich(v.praemie);
                praemienListe.push({ label: v.typ, anbieter: v.versicherer, betrag: p });
            });
            // FIDA-based obligations
            (mk.fidaVertraege || []).forEach(function(f) {
                if (f.typ && (f.typ.toLowerCase().indexOf('kredit') >= 0 || f.typ.toLowerCase().indexOf('baufi') >= 0)) {
                    verpflichtungen.push({ label: f.typ + ' ' + f.institut, betrag: 0, quelle: 'FIDA' });
                }
            });
        }
    }

    var gesamtPraemien = praemienListe.reduce(function(s, p) { return s + p.betrag; }, 0);
    var gesamtVerpflichtungen = verpflichtungen.reduce(function(s, v) { return s + v.betrag; }, 0);
    var gesamtSparen = sparenPosten.reduce(function(s, sp) { return s + sp.betrag; }, 0);
    var absicherungsquote = nettoeinkommen > 0 ? (gesamtPraemien / nettoeinkommen * 100) : 0;
    var freiVerfuegbar = nettoeinkommen - gesamtPraemien - gesamtVerpflichtungen;

    var quoteColor = absicherungsquote >= 20 ? '#28a745' : (absicherungsquote >= 10 ? '#ffc107' : '#dc3545');
    var quoteWidth = Math.min(absicherungsquote / 25 * 100, 100);

    var html = '<div class="kunden-card"><div class="kunden-card-header"><h2>' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><rect x="2" y="3" width="20" height="18" rx="2"></rect><line x1="2" y1="9" x2="22" y2="9"></line><line x1="12" y1="9" x2="12" y2="21"></line></svg>' +
        ' Finanzprofil</h2></div>';

    // Absicherungsquote
    html += '<div class="fp-quote-bar"><span>Absicherungsquote: <strong>' + absicherungsquote.toFixed(1) + '%</strong> vom Nettoeinkommen</span>' +
        '<div class="fp-progress"><div class="fp-progress-fill" style="width:' + quoteWidth + '%;background:' + quoteColor + '"></div></div>' +
        '<span class="fp-quote-hint">(empfohlen: 20\u201325%)</span></div>';

    // Two-column layout
    html += '<div class="fp-columns"><div class="fp-col"><h3>Einnahmen</h3><table class="fp-table"><tbody>' +
        '<tr><td>Nettoeinkommen</td><td class="fp-amount">\u20AC' + nettoeinkommen.toLocaleString('de-DE') + '</td></tr>' +
        '</tbody></table></div>';

    html += '<div class="fp-col"><h3>Ausgaben (Versicherungen)</h3><table class="fp-table"><tbody>';
    praemienListe.forEach(function(p) {
        html += '<tr><td>' + p.label + ' <span class="fp-anbieter">' + p.anbieter + '</span></td><td class="fp-amount">\u20AC' + Math.round(p.betrag).toLocaleString('de-DE') + '</td></tr>';
    });
    html += '<tr class="fp-total"><td>Gesamt</td><td class="fp-amount">\u20AC' + Math.round(gesamtPraemien).toLocaleString('de-DE') + '</td></tr>';
    html += '</tbody></table></div></div>';

    // Verpflichtungen
    if (verpflichtungen.length > 0 || sparenPosten.length > 0) {
        html += '<div class="fp-section"><h3>Weitere Verpflichtungen</h3><table class="fp-table"><tbody>';
        verpflichtungen.forEach(function(v) {
            html += '<tr><td>' + v.label + (v.quelle ? ' <span class="fp-fida">' + v.quelle + '</span>' : '') + '</td><td class="fp-amount">\u20AC' + Math.round(v.betrag).toLocaleString('de-DE') + '/mtl.</td></tr>';
        });
        sparenPosten.forEach(function(s) {
            html += '<tr><td>' + s.label + (s.quelle ? ' <span class="fp-fida">' + s.quelle + '</span>' : '') + '</td><td class="fp-amount">\u20AC' + Math.round(s.betrag).toLocaleString('de-DE') + '/mtl.</td></tr>';
        });
        html += '</tbody></table></div>';
    }

    // Summary
    html += '<div class="fp-summary">' +
        '<div class="fp-summary-item"><span>Frei verfügbar:</span> <strong>\u20AC' + Math.round(freiVerfuegbar).toLocaleString('de-DE') + '/mtl.</strong></div>';
    if (gesamtSparen > 0) {
        html += '<div class="fp-summary-item"><span>Davon Sparen:</span> \u20AC' + Math.round(gesamtSparen).toLocaleString('de-DE') + '/mtl.</div>';
    }
    html += '</div>';

    // Action buttons
    html += '<div class="fp-actions">' +
        '<button class="btn-primary" onclick="if(typeof showToast===\'function\')showToast(\'Finanzplan wird erstellt...\',\'info\')">Finanzplan erstellen</button>' +
        '<button class="btn-secondary" onclick="switchKundenTab(\'impulse\')">Absicherungslücke schließen</button></div>';

    html += '</div>';
    container.innerHTML = html;
}
window.renderFinanzprofil = renderFinanzprofil;

function parsePraemieMonatlich(praemieStr) {
    if (!praemieStr) return 0;
    var match = praemieStr.match(/[\d.,]+/);
    if (!match) return 0;
    var val = parseFloat(match[0].replace('.', '').replace(',', '.'));
    if (praemieStr.indexOf('/Jahr') >= 0) return val / 12;
    return val; // Assume monthly
}

window.__registerModule('kunden-detail-features.js');
