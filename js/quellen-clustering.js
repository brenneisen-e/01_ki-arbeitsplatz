// js/quellen-clustering.js – OPT-19: Potentiale-Clustering nach Datenquelle
// Zweite Dimension neben Whitespots/Anpassungsbedarfe (OPT-17)
// Jeder Impuls bekommt quellen[]-Tags, die zeigen WOHER die Erkenntnis kommt.

(function() {
    'use strict';

    // ========================================
    // QUELLEN-KONSTANTEN (6 Kategorien)
    // ========================================

    var POTENTIAL_QUELLEN = {
        finanztransaktion: {
            label: 'Finanztransaktionsdaten',
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M2 10h20"/></svg>',
            color: '#10b981'
        },
        bestand: {
            label: 'Bestandsdaten',
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>',
            color: '#3b82f6'
        },
        kommunikation: {
            label: 'Service & Kommunikation',
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>',
            color: '#8b5cf6'
        },
        wettbewerb: {
            label: 'Wettbewerbsdaten',
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
            color: '#f59e0b'
        },
        lebensereignis: {
            label: 'Lebensereignisse',
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>',
            color: '#ec4899'
        },
        markt: {
            label: 'Markt & Regulatorik',
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>',
            color: '#6b7280'
        }
    };

    // ========================================
    // QUELLEN-BADGE RENDERING
    // ========================================

    function renderQuellenBadge(quellenTyp) {
        var q = POTENTIAL_QUELLEN[quellenTyp];
        if (!q) return '';
        return '<span class="quellen-badge" style="--q-color:' + q.color + '">' +
            '<span class="quellen-badge-icon">' + q.icon + '</span>' +
            '<span class="quellen-badge-label">' + q.label + '</span>' +
        '</span>';
    }

    function renderQuellenBadges(quellen) {
        if (!quellen || !quellen.length) return '';
        var html = '<div class="quellen-badges">';
        for (var i = 0; i < quellen.length; i++) {
            var q = quellen[i];
            var typ = typeof q === 'string' ? q : q.typ;
            html += renderQuellenBadge(typ);
        }
        html += '</div>';
        return html;
    }

    // ========================================
    // QUELLEN-HERLEITUNG RENDERING
    // ========================================

    function renderQuellenHerleitung(quellen) {
        if (!quellen || !quellen.length) return '';
        var html = '<div class="quellen-herleitung">';
        for (var i = 0; i < quellen.length; i++) {
            var q = quellen[i];
            var typ = typeof q === 'string' ? q : q.typ;
            var detail = typeof q === 'object' ? q.detail : '';
            var def = POTENTIAL_QUELLEN[typ];
            if (!def) continue;
            html += '<div class="quellen-herleitung-item" style="--q-color:' + def.color + '">' +
                '<span class="quellen-herleitung-icon">' + def.icon + '</span>' +
                '<span class="quellen-herleitung-label">' + def.label + ':</span> ' +
                '<span class="quellen-herleitung-detail">' + (detail || '') + '</span>' +
            '</div>';
        }
        html += '</div>';
        return html;
    }

    // ========================================
    // QUELLEN-FILTER
    // ========================================

    var activeQuellenFilter = 'alle';

    function getActiveQuellenFromCards(container) {
        if (!container) return [];
        var cards = container.querySelectorAll('[data-quellen]');
        var quellenSet = {};
        for (var i = 0; i < cards.length; i++) {
            var qStr = cards[i].getAttribute('data-quellen');
            if (qStr) {
                var arr = qStr.split(',');
                for (var j = 0; j < arr.length; j++) {
                    var q = arr[j].trim();
                    if (q && POTENTIAL_QUELLEN[q]) quellenSet[q] = true;
                }
            }
        }
        return Object.keys(quellenSet);
    }

    function renderQuellenFilter(container) {
        var filterBar = container ? container.querySelector('.quellen-filter-bar') : document.getElementById('quellenFilterBar');
        if (!filterBar) return;

        var impulseContainer = filterBar.closest('.impulse-overview-card') || filterBar.closest('#tabImpulse');
        var activeQuellen = getActiveQuellenFromCards(impulseContainer);

        if (activeQuellen.length === 0) {
            filterBar.style.display = 'none';
            return;
        }

        filterBar.style.display = '';
        var html = '<button class="quellen-filter-btn' + (activeQuellenFilter === 'alle' ? ' active' : '') + '" onclick="filterByQuelle(\'alle\')" style="--q-color:#475569">Alle</button>';
        for (var i = 0; i < activeQuellen.length; i++) {
            var q = activeQuellen[i];
            var def = POTENTIAL_QUELLEN[q];
            if (!def) continue;
            var isActive = activeQuellenFilter === q;
            html += '<button class="quellen-filter-btn' + (isActive ? ' active' : '') + '" onclick="filterByQuelle(\'' + q + '\')" style="--q-color:' + def.color + '">' +
                '<span class="quellen-filter-icon">' + def.icon + '</span>' +
                def.label +
            '</button>';
        }
        filterBar.innerHTML = html;
    }

    function filterByQuelle(quelle) {
        activeQuellenFilter = quelle;

        // Filter cards in current visible impulse container
        var tabImpulse = document.getElementById('tabImpulse');
        if (!tabImpulse) return;

        var cards = tabImpulse.querySelectorAll('[data-quellen]');
        for (var i = 0; i < cards.length; i++) {
            var card = cards[i];
            var detail = card.nextElementSibling;
            if (quelle === 'alle') {
                card.style.display = '';
                if (detail && detail.classList && detail.classList.contains('impuls-detail')) {
                    // Keep detail display state as-is
                }
            } else {
                var qStr = card.getAttribute('data-quellen') || '';
                var match = qStr.split(',').indexOf(quelle) >= 0;
                card.style.display = match ? '' : 'none';
                // Also hide detail panel if card is hidden
                if (!match && detail && detail.classList && detail.classList.contains('impuls-detail')) {
                    detail.style.display = 'none';
                }
            }
        }

        // Also filter quellen-gruppe containers in datenquelle view
        var gruppenContainers = tabImpulse.querySelectorAll('.quellen-gruppe');
        for (var g = 0; g < gruppenContainers.length; g++) {
            var gruppe = gruppenContainers[g];
            var gruppeTyp = gruppe.getAttribute('data-quellen-typ');
            if (quelle === 'alle') {
                gruppe.style.display = '';
            } else {
                gruppe.style.display = (gruppeTyp === quelle) ? '' : 'none';
            }
        }

        // Re-render filter buttons to show active state
        renderQuellenFilter();
    }

    // ========================================
    // ANSICHT-TOGGLE: Nach Handlung / Nach Datenquelle
    // ========================================

    var currentAnsicht = 'handlung'; // 'handlung' or 'datenquelle'

    function renderAnsichtToggle(container) {
        if (!container) return '';
        var existing = container.querySelector('.ansicht-toggle');
        if (existing) return;

        var toggleDiv = document.createElement('div');
        toggleDiv.className = 'ansicht-toggle';
        toggleDiv.innerHTML = '<span class="ansicht-toggle-label">Ansicht:</span>' +
            '<button class="ansicht-toggle-btn' + (currentAnsicht === 'handlung' ? ' active' : '') + '" onclick="switchPotentialeAnsicht(\'handlung\')">Nach Handlung</button>' +
            '<button class="ansicht-toggle-btn' + (currentAnsicht === 'datenquelle' ? ' active' : '') + '" onclick="switchPotentialeAnsicht(\'datenquelle\')">Nach Datenquelle</button>';

        // Insert after header, before filter bar
        var header = container.querySelector('.kunden-card-header');
        var legende = container.querySelector('.impuls-legende');
        var insertBefore = legende || container.querySelector('#impulseContent') || container.querySelector('.impuls-kategorie');
        if (insertBefore) {
            insertBefore.parentNode.insertBefore(toggleDiv, insertBefore);
        } else {
            container.appendChild(toggleDiv);
        }
    }

    function switchPotentialeAnsicht(ansicht) {
        currentAnsicht = ansicht;
        try { sessionStorage.setItem('potentialeAnsicht', ansicht); } catch(e) {}

        // Update toggle buttons
        var btns = document.querySelectorAll('.ansicht-toggle-btn');
        for (var i = 0; i < btns.length; i++) {
            btns[i].classList.toggle('active', btns[i].textContent.indexOf(ansicht === 'handlung' ? 'Handlung' : 'Datenquelle') >= 0);
        }

        var tabImpulse = document.getElementById('tabImpulse');
        if (!tabImpulse) return;

        var handlungView = tabImpulse.querySelector('#impulseContentHandlung');
        var datenquelleView = tabImpulse.querySelector('#impulseContentDatenquelle');

        if (ansicht === 'handlung') {
            if (handlungView) handlungView.style.display = '';
            if (datenquelleView) datenquelleView.style.display = 'none';
        } else {
            if (handlungView) handlungView.style.display = 'none';
            if (datenquelleView) {
                datenquelleView.style.display = '';
            } else {
                // Build datenquelle view on first switch
                buildDatenquelleView(tabImpulse);
            }
        }

        // Update filter for the new view
        renderQuellenFilter();
    }

    function buildDatenquelleView(tabImpulse) {
        var impulseCard = tabImpulse.querySelector('.impulse-overview-card');
        if (!impulseCard) return;

        // Collect all impulse items with their quellen data
        var allItems = impulseCard.querySelectorAll('[data-quellen]');
        var grouped = {};

        for (var i = 0; i < allItems.length; i++) {
            var item = allItems[i];
            var qStr = item.getAttribute('data-quellen') || '';
            var kategorie = item.getAttribute('data-kategorie') || 'whitespot';
            var quellenArr = qStr.split(',');

            for (var j = 0; j < quellenArr.length; j++) {
                var q = quellenArr[j].trim();
                if (!q || !POTENTIAL_QUELLEN[q]) continue;
                if (!grouped[q]) grouped[q] = [];
                // Clone the item for the datenquelle view
                var clone = item.cloneNode(true);
                // Add category badge
                var katBadge = clone.querySelector('.quellen-kat-badge');
                if (!katBadge) {
                    var badgeHtml = kategorie === 'whitespot'
                        ? '<span class="quellen-kat-badge whitespot">Neugesch\u00e4ft</span>'
                        : '<span class="quellen-kat-badge anpassung">Anpassung</span>';
                    var prioEl = clone.querySelector('.impuls-priority');
                    if (prioEl) {
                        prioEl.insertAdjacentHTML('beforebegin', badgeHtml);
                    }
                }
                // Re-wire click handler to use original detail panel
                var detailPeer = item.nextElementSibling;
                if (detailPeer && detailPeer.classList && detailPeer.classList.contains('impuls-detail')) {
                    var detailId = detailPeer.id;
                    clone.setAttribute('onclick', "toggleImpulsDetail('" + detailId + "')");
                }
                grouped[q].push(clone);
            }
        }

        // Build grouped HTML
        var dqContainer = document.createElement('div');
        dqContainer.id = 'impulseContentDatenquelle';

        var quellenOrder = ['finanztransaktion', 'kommunikation', 'bestand', 'wettbewerb', 'lebensereignis', 'markt'];
        for (var k = 0; k < quellenOrder.length; k++) {
            var qKey = quellenOrder[k];
            var items = grouped[qKey];
            if (!items || items.length === 0) continue;
            var def = POTENTIAL_QUELLEN[qKey];

            var gruppe = document.createElement('div');
            gruppe.className = 'quellen-gruppe';
            gruppe.setAttribute('data-quellen-typ', qKey);

            var headerHtml = '<div class="quellen-gruppe-header" style="--q-color:' + def.color + '">' +
                '<span class="quellen-gruppe-icon">' + def.icon + '</span>' +
                ' Aus ' + def.label + ' (' + items.length + ')' +
            '</div>';
            gruppe.innerHTML = headerHtml;

            var gruppeInner = document.createElement('div');
            gruppeInner.className = 'quellen-gruppe-items';
            for (var m = 0; m < items.length; m++) {
                gruppeInner.appendChild(items[m]);
            }
            gruppe.appendChild(gruppeInner);
            dqContainer.appendChild(gruppe);
        }

        // Insert after the handlung view
        var impulseContent = impulseCard.querySelector('#impulseContent');
        if (impulseContent) {
            impulseContent.id = 'impulseContentHandlung';
            impulseContent.parentNode.insertBefore(dqContainer, impulseContent.nextSibling);
        } else {
            impulseCard.appendChild(dqContainer);
        }
    }

    // ========================================
    // INJECT QUELLEN INTO EXISTING STATIC HTML (Versicherung)
    // ========================================

    // Maps impulse IDs to quellen for the static HTML impulses in index.html
    var versicherungQuellenMap = {
        'impuls-risikoleben': {
            quellen: [
                { typ: 'finanztransaktion', detail: 'Hypothek \u20AC285.000 bei Sparkasse erkannt (Open Finance/FIDA)' },
                { typ: 'bestand', detail: 'Keine Risikolebensversicherung im Bestand' },
                { typ: 'lebensereignis', detail: 'Familie vorhanden: Verheiratet, 2 Kinder' }
            ],
            kategorie: 'whitespot'
        },
        'impuls-fondspolice': {
            quellen: [
                { typ: 'finanztransaktion', detail: 'DWS-Depot \u20AC85.000 in ETFs erkannt (FIDA)' },
                { typ: 'bestand', detail: 'Keine fondsgebundene Rentenversicherung vorhanden' }
            ],
            kategorie: 'whitespot'
        },
        'impuls-kfz': {
            quellen: [
                { typ: 'wettbewerb', detail: 'Kfz bei Allianz \u20AC720/Jahr (FIDA)' },
                { typ: 'bestand', detail: 'Wechselm\u00f6glichkeit zum 30.11., SF12' }
            ],
            kategorie: 'anpassung'
        },
        'impuls-bu': {
            quellen: [
                { typ: 'finanztransaktion', detail: 'Netto-Gehalt \u20AC3.680/Mon. aus Zahlungsverkehrsdaten' },
                { typ: 'bestand', detail: 'BU-Rente nur \u20AC1.500/Mon. \u2013 41% Deckung' }
            ],
            kategorie: 'anpassung'
        },
        'impuls-hausrat': {
            quellen: [
                { typ: 'finanztransaktion', detail: 'Mietzahlung ge\u00e4ndert: neuer Empf\u00e4nger seit 01.09.2025' },
                { typ: 'bestand', detail: 'Hausrat bei HUK24, \u20AC65.000 Vers.-Summe' }
            ],
            kategorie: 'anpassung'
        },
        'impuls-konsumentenkredit': {
            quellen: [
                { typ: 'finanztransaktion', detail: 'Targobank Kredit 9,0% p.a., Restschuld \u20AC12.500 (FIDA)' },
                { typ: 'wettbewerb', detail: 'Santander BestCredit 4,9% p.a. verf\u00fcgbar' }
            ],
            kategorie: 'anpassung'
        }
    };

    function injectQuellenIntoStaticHTML() {
        for (var detailId in versicherungQuellenMap) {
            if (!versicherungQuellenMap.hasOwnProperty(detailId)) continue;
            var mapping = versicherungQuellenMap[detailId];
            var detailEl = document.getElementById(detailId);
            if (!detailEl) continue;

            // Find the clickable impuls-item before this detail panel
            var impulsItem = detailEl.previousElementSibling;
            if (!impulsItem || !impulsItem.classList.contains('impuls-item')) continue;

            // Skip if already injected
            if (impulsItem.hasAttribute('data-quellen')) continue;

            // Add data-quellen attribute for filtering
            var quellenTyps = mapping.quellen.map(function(q) { return q.typ; });
            impulsItem.setAttribute('data-quellen', quellenTyps.join(','));
            impulsItem.setAttribute('data-kategorie', mapping.kategorie);

            // Inject quellen badges at the top of the impuls-item
            var badgesHtml = renderQuellenBadges(mapping.quellen);
            var impulsIcon = impulsItem.querySelector('.impuls-icon');
            if (impulsIcon) {
                impulsIcon.insertAdjacentHTML('beforebegin', badgesHtml);
            }

            // Inject quellen herleitung into the detail panel
            var herleitungGrid = detailEl.querySelector('.herleitung-grid');
            if (herleitungGrid) {
                var quellenHerleitungHtml = renderQuellenHerleitung(mapping.quellen);
                herleitungGrid.insertAdjacentHTML('beforebegin', '<h4 style="margin-top:0;margin-bottom:8px;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;color:#94a3b8;">Datenquellen</h4>' + quellenHerleitungHtml);
            }
        }
    }

    // ========================================
    // INJECT QUELLEN INTO BANKING POTENTIALE (dynamic)
    // ========================================

    // Maps banking rule patterns to quellen
    var bankingQuellenRules = {
        'VR-FinanzPlan': [
            { typ: 'bestand', detail: 'Kein VR-FinanzPlan im Kundenbestand' },
            { typ: 'finanztransaktion', detail: 'Einkommens- und Sparverhalten analysiert' }
        ],
        'Verm\u00f6genPlus': [
            { typ: 'finanztransaktion', detail: 'Kein Wertpapierdepot oder Fondsanlage vorhanden' },
            { typ: 'bestand', detail: 'Produktportfolio ohne Kapitalmarktanlage' }
        ],
        'R+V Risikoleben': [
            { typ: 'bestand', detail: 'Keine Risikolebensversicherung im Bestand' },
            { typ: 'lebensereignis', detail: 'Familie vorhanden, Absicherungsbedarf erkannt' }
        ],
        'Schw\u00e4bisch Hall': [
            { typ: 'lebensereignis', detail: 'Wohneigentum-Potential erkannt' },
            { typ: 'markt', detail: 'Staatliche F\u00f6rderung und Zinssicherung m\u00f6glich' }
        ],
        'easyCredit': [
            { typ: 'finanztransaktion', detail: 'Einkommen und Liquidit\u00e4t analysiert' }
        ],
        'Anschlussfinanzierung': [
            { typ: 'bestand', detail: 'Baufinanzierung mit auslaufender Zinsbindung' },
            { typ: 'markt', detail: 'Aktuelle Zinsentwicklung beobachtet' }
        ],
        'Depot-Umschichtung': [
            { typ: 'finanztransaktion', detail: 'Depot-Performance unter Benchmark' },
            { typ: 'wettbewerb', detail: 'Bessere Fonds-Alternativen verf\u00fcgbar' }
        ],
        'Kontomodell': [
            { typ: 'finanztransaktion', detail: 'Nutzungsmuster analysiert, Kontomodell-Optimierung m\u00f6glich' }
        ],
        'Deckungsanpassung': [
            { typ: 'bestand', detail: 'Bestehende Risikolebensversicherung vorhanden' },
            { typ: 'bestand', detail: 'Aktive Baufinanzierung mit Restschuld' }
        ],
        'Kundenzufriedenheit': [
            { typ: 'kommunikation', detail: 'NPS-Score unter Schwellwert' }
        ],
        'Wechsel zu R+V': [
            { typ: 'wettbewerb', detail: 'Fremdversicherung via Open Finance erkannt' },
            { typ: 'bestand', detail: 'Verbundpartner R+V bietet bessere Konditionen' }
        ],
        'Cross-Selling': [
            { typ: 'finanztransaktion', detail: 'Drittbank-Konten via Open Finance erkannt' },
            { typ: 'wettbewerb', detail: 'Konsolidierungspotential identifiziert' }
        ],
        'Altersvorsorge': [
            { typ: 'bestand', detail: 'Versorgungsl\u00fccke im Alter erkannt' },
            { typ: 'finanztransaktion', detail: 'Einkommensanalyse durchgef\u00fchrt' }
        ]
    };

    function getQuellenForBankProdukt(produktName) {
        if (!produktName) return [{ typ: 'bestand', detail: 'Aus Bestandsanalyse' }];
        for (var key in bankingQuellenRules) {
            if (bankingQuellenRules.hasOwnProperty(key) && produktName.indexOf(key) >= 0) {
                return bankingQuellenRules[key];
            }
        }
        return [{ typ: 'bestand', detail: 'Aus Bestandsanalyse' }];
    }

    // ========================================
    // POST-RENDER HOOK: Inject quellen into dynamically rendered banking cards
    // ========================================

    function injectQuellenIntoBankingCards() {
        var tabImpulse = document.getElementById('tabImpulse');
        if (!tabImpulse) return;
        var isBankMode = document.querySelector('#kundenDetailPage.bank-mode');
        if (!isBankMode) return;

        var items = tabImpulse.querySelectorAll('.impuls-item');
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if (item.hasAttribute('data-quellen')) continue;

            var titleEl = item.querySelector('strong');
            if (!titleEl) continue;
            var title = titleEl.textContent;
            var quellen = getQuellenForBankProdukt(title);
            var quellenTyps = quellen.map(function(q) { return q.typ; });
            item.setAttribute('data-quellen', quellenTyps.join(','));

            // Determine kategorie from parent section
            var parentKat = item.closest('.impuls-kategorie');
            var isWhitespot = parentKat && parentKat.querySelector('.impuls-kategorie-title.whitespots');
            item.setAttribute('data-kategorie', isWhitespot ? 'whitespot' : 'anpassung');

            // Insert badges
            var badgesHtml = renderQuellenBadges(quellen);
            var impulsIcon = item.querySelector('.impuls-icon');
            if (impulsIcon) {
                impulsIcon.insertAdjacentHTML('beforebegin', badgesHtml);
            }

            // Inject herleitung into detail panel
            var detailPanel = item.nextElementSibling;
            if (detailPanel && detailPanel.classList.contains('impuls-detail')) {
                var hGrid = detailPanel.querySelector('.herleitung-grid');
                if (hGrid && !detailPanel.querySelector('.quellen-herleitung')) {
                    var qHtml = renderQuellenHerleitung(quellen);
                    hGrid.insertAdjacentHTML('beforebegin', '<h4 style="margin-top:0;margin-bottom:8px;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;color:#94a3b8;">Datenquellen</h4>' + qHtml);
                }
            }
        }
    }

    // ========================================
    // INJECT QUELLEN INTO POTENTIALE.JS DATA
    // ========================================

    function addQuellenToImpulseData() {
        if (typeof impulseData === 'undefined') return;

        var impulseQuellenMap = {
            'kb-risiko': [
                { typ: 'finanztransaktion', detail: 'Hypothek \u20AC285.000 bei Sparkasse (Open Finance)' },
                { typ: 'bestand', detail: 'Keine Risikolebensversicherung' },
                { typ: 'lebensereignis', detail: 'Familie: Verheiratet, 2 Kinder' }
            ],
            'kb-fonds': [
                { typ: 'finanztransaktion', detail: 'DWS-Depot \u20AC85.000, Sparrate \u20AC800/Mon.' },
                { typ: 'bestand', detail: 'Keine fondsgebundene RV vorhanden' }
            ],
            'kb-kfz': [
                { typ: 'wettbewerb', detail: 'Kfz bei Allianz \u20AC720/J. (FIDA)' },
                { typ: 'bestand', detail: 'Wechselm\u00f6glichkeit zum 30.11., SF12' }
            ],
            'kb-bu': [
                { typ: 'finanztransaktion', detail: 'Netto-Gehalt \u20AC3.680/Mon. (PSD2)' },
                { typ: 'bestand', detail: 'BU-Rente \u20AC1.500/Mon. \u2013 nur 41% abgesichert' }
            ],
            'kb-rs': [
                { typ: 'bestand', detail: 'Kein Rechtsschutz vorhanden' },
                { typ: 'lebensereignis', detail: 'Immobilienbesitz + Familie' }
            ],
            'kb-tier': [
                { typ: 'finanztransaktion', detail: 'Fressnapf \u20AC45/Mon., Tierarztpraxis \u20AC120 (PSD2)' }
            ],
            'kb-hausrat': [
                { typ: 'finanztransaktion', detail: 'Mietzahlung ge\u00e4ndert, neuer Empf\u00e4nger' },
                { typ: 'bestand', detail: 'Hausrat HUK24, letzte Anpassung vor 5 Jahren' }
            ],
            'kb-umschuldung': [
                { typ: 'finanztransaktion', detail: 'Targobank Kredit 9,0% p.a. (Open Finance)' },
                { typ: 'wettbewerb', detail: 'Santander 4,9% p.a. verf\u00fcgbar' }
            ]
        };

        for (var i = 0; i < impulseData.length; i++) {
            var imp = impulseData[i];
            if (imp.quellen) continue; // Already tagged
            if (impulseQuellenMap[imp.id]) {
                imp.quellen = impulseQuellenMap[imp.id];
            }
        }
    }

    // ========================================
    // INITIALIZATION
    // ========================================

    function initQuellenClustering() {
        // Restore ansicht from session
        try {
            var saved = sessionStorage.getItem('potentialeAnsicht');
            if (saved === 'datenquelle') currentAnsicht = 'datenquelle';
        } catch(e) {}

        // Tag potentiale.js data
        addQuellenToImpulseData();

        // Inject quellen into static HTML (Versicherung)
        injectQuellenIntoStaticHTML();

        // Setup filter bar + toggle if present
        var tabImpulse = document.getElementById('tabImpulse');
        if (tabImpulse) {
            var impulseCard = tabImpulse.querySelector('.impulse-overview-card');
            if (impulseCard) {
                renderAnsichtToggle(impulseCard);

                // Insert filter bar if not present
                if (!impulseCard.querySelector('.quellen-filter-bar')) {
                    var filterBar = document.createElement('div');
                    filterBar.className = 'quellen-filter-bar';
                    filterBar.id = 'quellenFilterBar';
                    var toggle = impulseCard.querySelector('.ansicht-toggle');
                    if (toggle) {
                        toggle.parentNode.insertBefore(filterBar, toggle.nextSibling);
                    }
                }
                renderQuellenFilter();
            }
        }
    }

    // Hook into tab switches to re-inject
    var origSwitchKundenTab = window.switchKundenTab;
    if (origSwitchKundenTab) {
        window.switchKundenTab = function(tabName) {
            origSwitchKundenTab(tabName);
            if (tabName === 'impulse') {
                setTimeout(function() {
                    var isBanking = document.querySelector('#kundenDetailPage.bank-mode');
                    if (isBanking) {
                        injectQuellenIntoBankingCards();
                    } else {
                        injectQuellenIntoStaticHTML();
                    }
                    // Re-setup toggle + filter
                    var tabImpulse = document.getElementById('tabImpulse');
                    if (tabImpulse) {
                        var impulseCard = tabImpulse.querySelector('.impulse-overview-card');
                        if (impulseCard) {
                            renderAnsichtToggle(impulseCard);
                            if (!impulseCard.querySelector('.quellen-filter-bar')) {
                                var filterBar = document.createElement('div');
                                filterBar.className = 'quellen-filter-bar';
                                filterBar.id = 'quellenFilterBar';
                                var toggle = impulseCard.querySelector('.ansicht-toggle');
                                if (toggle) {
                                    toggle.parentNode.insertBefore(filterBar, toggle.nextSibling);
                                }
                            }
                            renderQuellenFilter();
                            // Apply current ansicht state
                            if (currentAnsicht === 'datenquelle') {
                                switchPotentialeAnsicht('datenquelle');
                            }
                        }
                    }
                }, 200);
            }
        };
    }

    // Also hook into renderBankingPotentiale
    var origRenderBanking = window.renderBankingPotentiale;
    if (origRenderBanking) {
        window.renderBankingPotentiale = function(kundenName) {
            origRenderBanking(kundenName);
            setTimeout(function() {
                injectQuellenIntoBankingCards();
                var tabImpulse = document.getElementById('tabImpulse');
                if (tabImpulse) {
                    var impulseCard = tabImpulse.querySelector('.impulse-overview-card');
                    if (impulseCard) {
                        renderAnsichtToggle(impulseCard);
                        if (!impulseCard.querySelector('.quellen-filter-bar')) {
                            var filterBar = document.createElement('div');
                            filterBar.className = 'quellen-filter-bar';
                            filterBar.id = 'quellenFilterBar';
                            var toggle = impulseCard.querySelector('.ansicht-toggle');
                            if (toggle) {
                                toggle.parentNode.insertBefore(filterBar, toggle.nextSibling);
                            }
                        }
                        renderQuellenFilter();
                    }
                }
            }, 150);
        };
    }

    // Auto-init on DOMContentLoaded
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(initQuellenClustering, 300);
    });

    // ========================================
    // WINDOW EXPORTS
    // ========================================

    window.POTENTIAL_QUELLEN = POTENTIAL_QUELLEN;
    window.renderQuellenBadge = renderQuellenBadge;
    window.renderQuellenBadges = renderQuellenBadges;
    window.renderQuellenHerleitung = renderQuellenHerleitung;
    window.renderQuellenFilter = renderQuellenFilter;
    window.filterByQuelle = filterByQuelle;
    window.switchPotentialeAnsicht = switchPotentialeAnsicht;
    window.getQuellenForBankProdukt = getQuellenForBankProdukt;
    window.injectQuellenIntoStaticHTML = injectQuellenIntoStaticHTML;
    window.injectQuellenIntoBankingCards = injectQuellenIntoBankingCards;
    window.initQuellenClustering = initQuellenClustering;

    window.__registerModule('quellen-clustering.js');
})();
