// js/global-search.js - Modulübergreifende Suche

function globalSearch(query) {
    if (!query || query.length < 2) return [];
    var q = query.toLowerCase();
    var results = [];

    // 1. Versicherungs-Kunden (mockKunden aus kunden-detail-data.js)
    if (window.mockKunden) {
        for (var name in window.mockKunden) {
            if (window.mockKunden.hasOwnProperty(name)) {
                var kd = window.mockKunden[name];
                if (name.toLowerCase().indexOf(q) !== -1 ||
                    (kd.beruf && kd.beruf.toLowerCase().indexOf(q) !== -1) ||
                    (kd.adresse && kd.adresse.toLowerCase().indexOf(q) !== -1)) {
                    results.push({
                        typ: 'kunde_versicherung',
                        name: name,
                        detail: kd.beruf + ' – ' + kd.adresse,
                        action: function(n) { return function() { if (typeof openKundenDetail === 'function') openKundenDetail(n); }; }(name)
                    });
                }
            }
        }
    }

    // 2. Banking-Kunden (bankMockKunden aus kunden-detail-banking.js)
    if (window.bankMockKunden) {
        for (var bName in window.bankMockKunden) {
            if (window.bankMockKunden.hasOwnProperty(bName)) {
                var bkd = window.bankMockKunden[bName];
                if (bName.toLowerCase().indexOf(q) !== -1 ||
                    (bkd.beruf && bkd.beruf.toLowerCase().indexOf(q) !== -1) ||
                    (bkd.adresse && bkd.adresse.toLowerCase().indexOf(q) !== -1) ||
                    (bkd.id && bkd.id.toLowerCase().indexOf(q) !== -1)) {
                    results.push({
                        typ: 'kunde_banking',
                        name: bName,
                        detail: 'Banking – ' + bkd.beruf + (bkd.segment ? ' (' + bkd.segment + ')' : ''),
                        action: function(n) { return function() { if (typeof openBankKundenDetail === 'function') openBankKundenDetail(n); }; }(bName)
                    });
                }
            }
        }
    }

    // 3. Verträge (kundenBestandVertraege aus agentur-overview-tables.js)
    if (window.kundenBestandVertraege) {
        window.kundenBestandVertraege.forEach(function(v) {
            if ((v.typ && v.typ.toLowerCase().indexOf(q) !== -1) ||
                (v.kunde && v.kunde.toLowerCase().indexOf(q) !== -1) ||
                (v.versicherer && v.versicherer.toLowerCase().indexOf(q) !== -1) ||
                (v.kundenId && v.kundenId.toLowerCase().indexOf(q) !== -1)) {
                results.push({
                    typ: 'vertrag',
                    name: v.typ,
                    detail: v.versicherer + ' – ' + v.kunde + ' (' + v.kundenId + ') – ' + v.praemie,
                    action: function(kunde) { return function() { if (typeof openKundenDetail === 'function') openKundenDetail(kunde); }; }(v.kunde)
                });
            }
        });
    }

    // Cross-Referenz Hinweise
    if (window.getLinkedCustomer) {
        results.forEach(function(r) {
            var linked = window.getLinkedCustomer(r.name);
            if (linked) {
                r.crossRef = linked;
            }
        });
    }

    // Deduplizieren und limitieren
    return results.slice(0, 12);
}

function renderSearchResults(results, container) {
    if (!results.length) {
        container.innerHTML = '<div class="global-search-empty">Keine Ergebnisse gefunden</div>';
        container.style.display = 'block';
        return;
    }

    // Gruppieren nach Typ
    var groups = {};
    var groupLabels = {
        'kunde_versicherung': 'Kunden (Versicherung)',
        'kunde_banking': 'Kunden (Banking)',
        'vertrag': 'Verträge'
    };
    var typeIcons = {
        'kunde_versicherung': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
        'kunde_banking': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>',
        'vertrag': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>'
    };

    results.forEach(function(r) {
        if (!groups[r.typ]) groups[r.typ] = [];
        groups[r.typ].push(r);
    });

    var html = '';
    for (var typ in groups) {
        if (groups.hasOwnProperty(typ)) {
            html += '<div class="global-search-group">';
            html += '<div class="global-search-group-label">' + (groupLabels[typ] || typ) + '</div>';
            groups[typ].forEach(function(item, idx) {
                html += '<div class="global-search-item" data-index="' + idx + '" onclick="globalSearchSelect(this)">' +
                    '<span class="global-search-item-icon">' + (typeIcons[item.typ] || '') + '</span>' +
                    '<div class="global-search-item-content">' +
                    '<span class="global-search-item-name">' + escapeHtml(item.name) + '</span>' +
                    '<span class="global-search-item-detail">' + escapeHtml(item.detail) + '</span>' +
                    '</div>' +
                    (item.crossRef ? '<span class="global-search-crossref" title="Auch in ' + item.crossRef.linkedSystem + ' erkannt"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg></span>' : '') +
                    '</div>';
            });
            html += '</div>';
        }
    }

    container.innerHTML = html;
    container.style.display = 'block';

    // Aktionen speichern
    container._actions = results.map(function(r) { return r.action; });
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function globalSearchSelect(el) {
    var container = document.getElementById('globalSearchResults');
    if (!container || !container._actions) return;
    // Finde den Index über alle Items
    var allItems = container.querySelectorAll('.global-search-item');
    for (var i = 0; i < allItems.length; i++) {
        if (allItems[i] === el) {
            if (container._actions[i]) container._actions[i]();
            break;
        }
    }
    closeGlobalSearch();
}

function closeGlobalSearch() {
    var input = document.getElementById('globalSearchInput');
    var results = document.getElementById('globalSearchResults');
    if (input) input.value = '';
    if (results) { results.style.display = 'none'; results.innerHTML = ''; }
}

function initGlobalSearch() {
    var input = document.getElementById('globalSearchInput');
    var results = document.getElementById('globalSearchResults');
    if (!input || !results) return;

    var debounceTimer = null;

    input.addEventListener('input', function() {
        clearTimeout(debounceTimer);
        var val = input.value.trim();
        if (val.length < 2) {
            results.style.display = 'none';
            results.innerHTML = '';
            return;
        }
        debounceTimer = setTimeout(function() {
            var items = globalSearch(val);
            renderSearchResults(items, results);
        }, 300);
    });

    // Keyboard: ESC schließen
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeGlobalSearch();
            input.blur();
        }
        // Enter: ersten Treffer auswählen
        if (e.key === 'Enter') {
            var first = results.querySelector('.global-search-item');
            if (first) { first.click(); e.preventDefault(); }
        }
    });

    // Ctrl+K Shortcut
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            var container = document.getElementById('globalSearchContainer');
            if (container) container.style.display = 'block';
            input.focus();
            input.select();
        }
    });

    // Klick außerhalb schließt Dropdown
    document.addEventListener('click', function(e) {
        var container = document.getElementById('globalSearchContainer');
        if (container && !container.contains(e.target)) {
            results.style.display = 'none';
        }
    });
}

// Suchleiste zeigen wenn Dashboard sichtbar wird
function showGlobalSearch() {
    var container = document.getElementById('globalSearchContainer');
    if (container) container.style.display = 'block';
}
function hideGlobalSearch() {
    var container = document.getElementById('globalSearchContainer');
    if (container) container.style.display = 'none';
    closeGlobalSearch();
}
window.showGlobalSearch = showGlobalSearch;
window.hideGlobalSearch = hideGlobalSearch;
window.globalSearch = globalSearch;
window.globalSearchSelect = globalSearchSelect;
window.closeGlobalSearch = closeGlobalSearch;

document.addEventListener('DOMContentLoaded', initGlobalSearch);

window.__registerModule('global-search.js');
